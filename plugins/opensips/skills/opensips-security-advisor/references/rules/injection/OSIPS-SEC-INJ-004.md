---
id: OSIPS-SEC-INJ-004
name: exec-setvars
title: exec_avp/exec_dset captures shell output into script variables — output-channel injection
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: injection
applies_if_modules_loaded: [exec]
applies_if_opensips_version: ">=3.2"
phase: [structural, dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: medium
security_severity: 7.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:L/SC:L/SI:H/SA:N"
cwe: [CWE-78, CWE-20, CWE-94]
owasp: ["A03:2021-Injection"]
attack: [T1059]
tags: [injection, exec, output-injection, taint, indirect-rce]

references:
  - https://opensips.org/docs/modules/3.4.x/exec.html
  - https://cwe.mitre.org/data/definitions/78.html
  - ../../knowledge/vulnerability-reference.md#section-6

short_description: |
  exec_avp() or exec_dset() captures the stdout of a shell command into script
  variables (AVPs or destination set entries), and the captured output is
  subsequently used in a sensitive context — DB query, header value, route
  decision — without re-validation. The shell command's output is inherently
  untrusted; treating it as trusted creates a second-order injection path.
---

## Rationale

`exec_avp("cmd", "$avp(out)")` and `exec_dset("cmd")` differ from `exec_msg()` in their output channel: instead of (or in addition to) running a side-effecting command, they capture the command's stdout into OpenSIPS script variables — AVPs in the `exec_avp` case, the destination set in the `exec_dset` case. The captured output is then read by subsequent script code as if it were a normal script value.

Two distinct failure modes attach:

1. **Helper-script compromise propagates.** If the invoked helper script is compromised (supply chain, mistake, or the script itself takes user input), the corrupted output flows into the cfg as if it were a trusted value. The cfg has no way to distinguish "stdout from a benign helper" from "stdout from an attacker-controlled helper."

2. **Output is used in a privileged sink.** Even when the helper is benign, its output may contain unexpected characters (newlines, NULs, SIP-header-breaking characters, SQL metacharacters) that the cfg author didn't anticipate. The captured AVP then flows into `avp_db_query`, `append_hf`, `$ru = ...`, or similar — and the second-order injection is no different in effect from a first-order one.

This rule treats `exec_avp`/`exec_dset` as a taint source (in addition to its sink role under `OSIPS-SEC-INJECTION-003`). Any AVP populated by `exec_avp` is taint-marked from the moment of capture; subsequent uses in privileged sinks fire the appropriate injection rule (SQLi → INJECTION-001/002, header injection → INJECTION-006, etc.). This rule fires on the structural `exec_avp`/`exec_dset` use itself when the captured value is used in any privileged sink without re-validation.

Confidence is medium rather than high because the rule's exposure depends on the helper script's actual behavior, which the advisor cannot inspect. The structural pattern is necessary but not sufficient for exploitation; the engine emits with confidence:medium and explicit recommendation that the operator audit the helper.

Source: Phase 2 master vulnerability reference §6 (Injection — exec class); OpenSIPS exec module documentation.

## Default Value

Not applicable — the `exec` module's `exec_avp` and `exec_dset` primitives have no defaulted output-validation behavior.

## Audit

The rule fires when **both** of the following are true:

1. `exec_avp()`, `exec_dset()`, or any equivalent module-provided primitive that captures shell output is invoked.
2. The captured value (the AVP for `exec_avp`, the destination set for `exec_dset`) flows into any of the following sinks without an explicit allow-list or shape-validation step:
   - DB primitives: `avp_db_query`, `sql_query`, `sql_select` value positions, `cache_*` key/value positions
   - Header construction: `append_hf`, `append_to_reply`, `replace_hdrs`
   - Routing: assignment to `$ru`, `$rU`, `$du`, `$fs`, `$ds`
   - Further `exec_*`: chaining a captured value into a subsequent shell command (compounds with INJECTION-003)
   - Logging: `xlog` is exempt — log output is not a privileged sink for this rule's purposes

Note that `exec_msg()` does not capture output and falls under INJECTION-003 (command-string injection at the input side). This rule covers the output side specifically.

## Remediation

The hierarchy mirrors INJECTION-003:

1. **Eliminate the `exec_*` capture entirely.** Replace with a module-native data source: `sqlops` query, `rest_client` HTTP call, `cachedb_*` lookup. See INJECTION-003's remediation section for the migration table.
2. **Validate the captured value before any sink use.** If the helper script must be retained (vendor-supplied, externally maintained), apply a strict allow-list immediately after capture:

   ```opensips
   exec_avp("/usr/local/bin/lookup-route $(fU{s.escape.user})", "$avp(route)");
   if (!($avp(route) =~ "^[a-zA-Z0-9._-]{1,64}$")) {
       xlog("L_ERR", "exec_avp returned invalid value: $avp(route)\n");
       send_reply(503, "Backend error");
       exit;
   }
   ```

   The validation must precede every sink use. The advisor traces flows; partial validation (validate-then-use-here, but-also-use-elsewhere-without-validation) still fires on the unvalidated path.

3. **Audit the helper script's input handling.** Even with output validation in the cfg, a compromised helper that ignores its input is a privilege escalation channel. Helpers invoked from OpenSIPS should themselves treat their stdin/argv as untrusted and run with minimal privileges (dedicated user, no shell, no network).

4. **Prefer `read_only` cache backends for high-volume captures.** If `exec_avp` is feeding a frequently-queried AVP, the helper-script invocation cost (process fork per call) is also a DoS amplifier. Caching the captured value in a `cachedb_local` keyed entry with TTL reduces both the attack surface and the operational load.

## Example — BAD

### Captured value flows into DB query

```opensips
loadmodule "exec.so"
loadmodule "avpops.so"

route {
    if (is_method("INVITE")) {
        # Capture helper-script output into AVP
        exec_avp("/usr/local/bin/lookup-customer $fU", "$avp(cust_id)");

        # Use captured value in SQL query without re-validation
        # If helper output contains SQL metacharacters → SQLi
        avp_db_query(
            "SELECT route FROM customer_routes WHERE cust_id='$avp(cust_id)'",
            "$avp(route)"
        );
    }
}
```

### Captured value sets request URI

```opensips
route {
    if (is_method("INVITE")) {
        exec_avp("/usr/local/bin/select-gateway $fU", "$avp(gw)");
        # If helper output contains characters that break SIP URI parsing,
        # downstream processing on $ru is corrupted
        $ru = "sip:" + $rU + "@" + $avp(gw);
        t_relay();
    }
}
```

## Example — GOOD

### Eliminate exec_avp, use sqlops

```opensips
loadmodule "sqlops.so"

route {
    if (is_method("INVITE")) {
        # Was: exec_avp("/usr/local/bin/lookup-customer $fU", "$avp(cust_id)")
        sql_select("sip_user=$fU", "cust_id", "customers", "$avp(cust_id)");
        sql_select("cust_id=$avp(cust_id)", "route", "customer_routes", "$avp(route)");
    }
}
```

### Validate captured value before sink use

```opensips
route {
    if (is_method("INVITE")) {
        # Helper output captured
        exec_avp("/usr/local/bin/lookup-customer $(fU{s.escape.user})", "$avp(cust_id)");

        # Validate shape before any sink use
        if (!($avp(cust_id) =~ "^[0-9]{1,16}$")) {
            xlog("L_ERR", "lookup-customer returned non-numeric: $avp(cust_id)\n");
            send_reply(503, "Backend error");
            exit;
        }

        # Now safe to use in sqlops (which is parameterized anyway, defense in depth)
        sql_select("cust_id=$avp(cust_id)", "route", "customer_routes", "$avp(route)");
    }
}
```

## Version Notes

`exec_avp` and `exec_dset` signatures are stable across OpenSIPS 3.2 through 3.6. The rule's detection logic does not depend on version-specific syntax.

## False-Positive Considerations

- **Captured value used only in `xlog`.** Log emission is not a privileged sink; the rule does not fire on capture-then-log patterns. (A separate concern is log-injection via newlines — see `OSIPS-SEC-TRACING_AND_LOGGING-004`.)
- **Captured value validated with sufficient regex.** A regex that excludes SQL/header/shell metacharacters and bounds length is treated as a sanitizer. Permissive regexes (anything matching `.*`, character classes wider than alphanumeric+limited-punctuation) are not credited.
- **Captured value compared against a constant set.** `if ($avp(role) == "admin" || $avp(role) == "user") { ... }` constrains the captured value to a known set and is recognized as validation. The branches outside the matched set must terminate the request.
- **Helper script under operator control.** When the helper is operator-authored and audited, the residual risk is lower but non-zero. Suppress with `justification="helper script audited; output shape regex enforced at capture site"` and link to the audit record.

## Related Rules

- `OSIPS-SEC-INJECTION-003` (exec-msg-injection) — input-side exec injection. This rule covers the output side; commonly co-occurs.
- `OSIPS-SEC-INJECTION-001`, `-002`, `-005`, `-006` — second-order sink rules. Captured values flowing into these sinks fire both rules.
- `OSIPS-SEC-CONFIG_HYGIENE-002` — `exec` loaded but unused.
- `OSIPS-SEC-DOS_DEFENSE-005` — process-fork-per-call as a DoS amplifier when `exec_avp` is on a hot path.

## Additional References

- Phase 2 master vulnerability reference §6 (Injection — exec class)
- OpenSIPS exec module documentation: https://opensips.org/docs/modules/3.4.x/exec.html
- CWE-78 — OS Command Injection
- CWE-20 — Improper Input Validation
- CWE-94 — Improper Control of Generation of Code (Code Injection)
- OWASP A03:2021 — Injection
