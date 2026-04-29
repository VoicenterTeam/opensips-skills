# OpenSIPS Security Advisor Report

**Configuration analyzed:** `custom-sanitizer.cfg`
**Profile applied:** L1
**OpenSIPS version detected:** 3.5.4
**Engine version:** opensips-advisor 0.1.0
**Run ID:** `c2f7a834-5b09-4a17-93f1-4d1c8a2bf5e0`
**Analysis duration:** 14.9s
**Run timestamp:** 2026-04-27T11:48:09Z

---

## Executive Summary

| Severity | Count | of which `review_required` |
|---|---|---|
| Critical | 0 | 0 |
| High | 1 | 0 |
| Medium | 1 | 0 |
| Low | 0 | 0 |
| Info | 1 | 0 |
| **Review required (would-be)** | **2** | **2** |

**Top observations.**

1. **Two findings are surfaced as `review_required` rather than confirmed vulnerabilities.** The configuration loads the `perl` module and routes potentially-tainted input through `perl_exec_simple()` calls before reaching SQL and authorization sinks. The advisor cannot reason about the Perl source files; it therefore declines to assert either pass or fail and surfaces the cases for human review per the abstention protocol.
2. **One confirmed High finding** — TLS certificate verification is disabled on the default domain, which is independent of the Perl-sanitization paths and matches deterministically.
3. **One confirmed Medium finding** — pike and ratelimit modules are absent.

---

## Methodology & Scope

### Profile applied
**L1**, declared at intake.

### OpenSIPS version
**3.5.4**, declared. No version mismatch.

### Modules loaded (security-relevant)
`signaling`, `sl`, `tm`, `rr`, `maxfwd`, `sipmsgops`, `auth`, `auth_db`, `usrloc`, `registrar`, `tls_mgm`, `proto_udp`, `proto_tls`, `acc`, `dialog`, `permissions`, `db_mysql`, `**perl**`. Notable: `perl` is loaded, with `modparam("perl", "filename", "/etc/opensips/sanitize.pl")`. The Perl source file was not provided and is out of scope for the script-layer advisor.

### Intake answers
| # | Question | Answer |
|---|---|---|
| 1 | OpenSIPS version | 3.5.4 (declared) |
| 2 | Deployment context | Public-facing edge proxy |
| 3 | Authentication mode | Mixed (digest + custom Perl-based check) |
| 4 | Front-end | Direct-to-Internet |
| 5 | Profile | L1 |

### How review_required is determined here
Per `15_CONFIDENCE_AND_VERIFICATION.md`, the advisor abstains and emits `kind: review_required` (rather than firing `kind: vulnerability` or silently passing) when:
- a deterministic shape would normally fire a rule, AND
- the dataflow path between source and sink passes through a function the advisor cannot statically reason about, AND
- the LLM judge declines to characterize the unknown function as either sound or unsound on the available evidence.

In this configuration, two such paths exist. Both involve `perl_exec_simple()` invocations whose Perl-side semantics determine whether the would-be vulnerability is realized.

---

## Findings

### F1 — TLS certificate verification disabled [tls]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-101` |
| **Rule** | `OSIPS-SEC-TLS-001` v1.0 (`verify-cert-disabled`) |
| **Severity** | **High** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` (7.7) |
| **CWE** | CWE-295 |
| **Location** | `custom-sanitizer.cfg:24–25` |
| **Fingerprint** | `sha256/v1:8d54…f2ba` |

**Evidence.**
```opensips-cfg
modparam("tls_mgm", "verify_cert", "[default]0")
modparam("tls_mgm", "require_cert", "[default]0")
```

**Recommendation.**
```opensips-cfg
modparam("tls_mgm", "verify_cert", "[default]1")
modparam("tls_mgm", "require_cert", "[default]1")
modparam("tls_mgm", "ca_list",      "[default]/etc/opensips/tls/ca.pem")
```

(See vulnerable-mixed report F5 for full rationale; this is the same shape, different cfg.)

---

### F2 — `review_required`: SQL sink reached through Perl sanitizer [injection]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-102` |
| **Rule** | `OSIPS-SEC-INJ-001` v1.0 (`sql-inj-avp-db-query`) |
| **Severity (would-be)** | **High** |
| **Confidence** | Low |
| **Verification status** | `unchecked` |
| **Kind** | **`review_required`** |
| **Review reason** | Custom Perl sanitizer cannot be statically verified |
| **CWE** | CWE-89 |
| **Location** | `custom-sanitizer.cfg:67–71` |
| **Fingerprint** | `sha256/v1:11ba…cf08` |

**Evidence.**
```opensips-cfg
loadmodule "perl.so"
modparam("perl", "filename", "/etc/opensips/sanitize.pl")

# ...

route[lookup_user] {
    perl_exec_simple("My::Sanitize::clean_username", "$fU", "$avp(safe_user)");
    avp_db_query("SELECT id, role FROM users WHERE username='$avp(safe_user)'", "$avp(uid)");
}
```

**Why this is `review_required`, not a finding.**
- The deterministic SQL-injection rule shape (a SIP-sourced taint variable reaching the query string of `avp_db_query`) is present in the dataflow trace: `$fU → perl_exec_simple → $avp(safe_user) → avp_db_query`.
- The intermediate transformation is `My::Sanitize::clean_username`, defined in `/etc/opensips/sanitize.pl`. That file was not provided as part of this analysis. The advisor's scope is the OpenSIPS script layer; reasoning about Perl source semantics is out of scope.
- The semantic-pass LLM judge was given the OpenSIPS context plus the function name and declined to characterize `clean_username` as either a known-good (e.g., `s.escape.common` equivalent) or known-bad sanitizer. There is no naming convention or in-cfg comment to ground a confident determination.
- Per the abstention protocol, the advisor emits `kind: review_required` with confidence low rather than guessing.

**What the human reviewer should check.**
1. Open `/etc/opensips/sanitize.pl` and locate `My::Sanitize::clean_username`.
2. Confirm one of:
   - It applies a strict allowlist (e.g., regex-restricting to `[a-zA-Z0-9._-]{1,64}`) and rejects on mismatch — **safe**.
   - It applies a deny-list of SQL metacharacters — **probably unsafe** (deny-lists are notoriously incomplete; recommend adopting native `s.escape.common` or parameterized queries).
   - It does not transform the input materially — **unsafe**, equivalent to no sanitizer.
3. Communicate the determination back to the advisor in the next session, e.g., as a suppression with justification:

```opensips-cfg
#! opensips-advisor: ignore OSIPS-SEC-INJ-001 \
   reason="My::Sanitize::clean_username is allowlist-only [a-zA-Z0-9._-]{1,64}; \
           reviewed by alice@example.com 2026-04-27" \
   expires=2027-04-27
```

**Recommendation regardless of Perl review outcome.** Native OpenSIPS escape transformations (`s.escape.common`, `s.escape.user`, `s.escape.param`) are auditable in-cfg and don't require trusting an external file. Where feasible, replace the Perl sanitizer with the native transformation.

```opensips-cfg
# Strongly preferred — script-layer, deterministically auditable
$avp(safe_user) = $(fU{s.escape.common});
avp_db_query("SELECT id, role FROM users WHERE username='$avp(safe_user)'", "$avp(uid)");
```

**Grounding.**
- dataflow_trace: `source($fU) → perl_exec_simple(My::Sanitize::clean_username) → $avp(safe_user) → sink(avp_db_query)`
- semantic_pass_judgment: `abstain` — Perl source out of scope, function name not in known-sanitizer registry.

**Rationale trace.**
1. Taint source `$fU` identified.
2. Sink `avp_db_query` identified at line 69 with `$avp(safe_user)` interpolated.
3. Dataflow trace from source to sink passes through `perl_exec_simple` at line 68. The output `$avp(safe_user)` is treated as an opaque transformation of `$fU`.
4. Without ground truth on `My::Sanitize::clean_username`, no determination is made. Verification status: `unchecked`.

---

### F3 — `review_required`: authorization decision through Perl handler [auth]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-103` |
| **Rule** | `OSIPS-SEC-AUTH-002` v1.0 (`auth-after-routing`) |
| **Severity (would-be)** | **High** |
| **Confidence** | Low |
| **Verification status** | `unchecked` |
| **Kind** | **`review_required`** |
| **Review reason** | Authorization is delegated to a Perl handler whose semantics are not statically verifiable |
| **CWE** | CWE-285 |
| **Location** | `custom-sanitizer.cfg:80–91` |
| **Fingerprint** | `sha256/v1:6a02…b15c` |

**Evidence.**
```opensips-cfg
request_route {
    if (is_method("INVITE")) {
        perl_exec_simple("My::Auth::check_caller", "$fU", "$avp(authz_ok)");
        if ($avp(authz_ok) != "1") {
            send_reply(403, "Forbidden");
            exit;
        }
        route(lookup_user);
        t_relay();
    }
    # ...
}
```

**Why this is `review_required`, not a finding.**
- The deterministic check for `OSIPS-SEC-AUTH-002` (auth-after-routing) does not fire here: a gating check (`$avp(authz_ok) != "1"`) precedes `t_relay()`. So the structural-pass result is "no auth-after-routing pattern."
- However, the gate's truth value is set by `My::Auth::check_caller`, a Perl function whose semantics are out of scope. If `check_caller` is permissive, returns `1` for all inputs, fails open on Perl errors, or is itself bypassable, the apparent gate is illusory.
- The advisor's alternative would be to either (a) pass silently (risk of false negative on the auth family) or (b) fire as a confirmed finding (risk of false positive on configurations whose Perl auth is genuinely correct). It does neither and instead emits `review_required`.

**What the human reviewer should check.**
1. Confirm that `My::Auth::check_caller`:
   - Returns `1` only after a successful credential validation (digest, JWT, mTLS, or equivalent).
   - Fails closed on any internal error (timeouts, DB errors, missing input).
   - Is not bypassable via specially-crafted From URIs (e.g., empty user, control characters, comparison-time issues).
2. Confirm operational controls: the Perl file is read-only by the OpenSIPS user, is under change control, and has unit tests covering the failure modes.
3. If the function delegates to an external service (HTTP, RADIUS, etc.), confirm that service's TLS posture and error handling.

**Recommendation regardless of Perl review outcome.** Authorization decisions on a public-facing edge proxy benefit from being visible at the script layer for audit. Two paths:
- Move the auth decision to native OpenSIPS facilities (`proxy_authorize`, `jwt_authorize`, `auth_jwt`) and use Perl only for non-security business logic.
- Keep Perl as the auth backend but add a defense-in-depth layer at the script level (e.g., `permissions` module IP allowlist) so a Perl failure doesn't fail open.

---

### F4 — No flood/DoS protection (pike, ratelimit absent) [dos_defense]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-104` |
| **Rule** | `OSIPS-SEC-DOS-001` v1.0 (`no-pike`) |
| **Severity** | **Medium** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CWE** | CWE-770 |
| **Location** | (module-load section) |
| **Fingerprint** | `sha256/v1:b507…91ff` |

**Evidence.** No `pike.so` or `ratelimit.so` loaded. No `pike_check_req()` or `rl_check*()` invocations.

(See vulnerable-mixed report F7 for full rationale and recommendation.)

---

### F5 — `perl` module as security-relevant trust boundary [config_hygiene, info]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-105` |
| **Rule** | `OSIPS-SEC-CFG-004` v1.0 (`perl-as-trust-boundary`) |
| **Severity** | **Info** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CWE** | CWE-1188 (Insecure Default Initialization of Resource) |
| **Location** | `custom-sanitizer.cfg:14` |

**Observation.** The `perl` module is loaded and security-relevant decisions (sanitization, authorization) are delegated to Perl handlers. This is a supported pattern but it moves the trust boundary outside the script layer, which:
- Reduces the advisor's ability to provide automated assurances (see F2 and F3).
- Requires that the Perl source files be under the same change control, code review, and testing rigor as the cfg itself.
- Couples OpenSIPS startup to Perl module availability and version compatibility.

This observation is informational. It exists so the operator can record an explicit decision about whether the trust-boundary placement is intentional and how it is governed.

---

## Remediation Roadmap

| ID | Title | Severity | Effort | Priority |
|---|---|---|---|---|
| F1 | TLS verify_cert disabled | High | S | **This week** |
| F2 | review_required: SQL sink via Perl | High (would-be) | M (review Perl + decide migration) | **This sprint** |
| F3 | review_required: authz via Perl | High (would-be) | M (same) | **This sprint** |
| F4 | No flood/DoS protection | Medium | S | **This sprint** |
| F5 | Perl as trust boundary (info) | Info | — | Optional (governance) |

Note on `review_required` items: priority is set by their **would-be** severity. If the human review determines the Perl handlers are sound, the items are closed via suppression with justification (see Appendix B template). If the review determines they are unsound, the items are reclassified as confirmed vulnerabilities and pulled forward to "this week."

---

## Appendix A — SARIF 2.1.0 Output (excerpt)

```json
{
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": { "driver": { "name": "opensips-advisor", "version": "0.1.0" } },
      "results": [
        {
          "ruleId": "OSIPS-SEC-INJ-001",
          "level": "warning",
          "message": {
            "text": "Tainted variable $fU reaches avp_db_query via perl_exec_simple(My::Sanitize::clean_username); sanitizer cannot be statically verified."
          },
          "locations": [{
            "physicalLocation": {
              "artifactLocation": { "uri": "custom-sanitizer.cfg" },
              "region": { "startLine": 67, "endLine": 71 }
            }
          }],
          "partialFingerprints": { "stable/v1": "11ba…cf08" },
          "properties": {
            "opensips-advisor/finding_id": "F-2026-04-27-102",
            "opensips-advisor/severity": "high",
            "opensips-advisor/confidence": "low",
            "opensips-advisor/verification_status": "unchecked",
            "opensips-advisor/kind": "review_required",
            "opensips-advisor/review_reason": "Custom Perl sanitizer (My::Sanitize::clean_username) cannot be statically verified",
            "opensips-advisor/dataflow_trace": [
              { "node": "$fU",                      "role": "source" },
              { "node": "perl_exec_simple",         "role": "transformation_opaque",
                "function": "My::Sanitize::clean_username" },
              { "node": "$avp(safe_user)",          "role": "intermediate" },
              { "node": "avp_db_query",             "role": "sink" }
            ]
          }
        }
        // F1, F3, F4, F5 follow with the same shape ...
      ],
      "properties": {
        "opensips-advisor/profile": "L1",
        "opensips-advisor/opensips_version_detected": "3.5.4",
        "opensips-advisor/findings_by_severity": {
          "critical": 0, "high": 1, "medium": 1, "low": 0, "info": 1
        },
        "opensips-advisor/review_required_count": 2
      }
    }
  ]
}
```

The `kind: review_required` distinction is preserved in SARIF via `properties["opensips-advisor/kind"]` rather than via SARIF's own `level` (where it remains `warning`) so downstream tools that only read `level` still see a non-error advisory while advisor-aware consumers can filter on the namespaced property.

---

## Appendix B — Suppressions & Deferred

_No active suppressions._

If post-review the operator determines `My::Sanitize::clean_username` is sound, the suppression record should be added in-source:

```opensips-cfg
#! opensips-advisor: ignore OSIPS-SEC-INJ-001 \
   reason="My::Sanitize::clean_username is allowlist-only [a-zA-Z0-9._-]{1,64}; \
           reviewed against /etc/opensips/sanitize.pl@<git-sha> \
           by <reviewer> on YYYY-MM-DD" \
   expires=YYYY-MM-DD
```

Or in `.opensips-advisor/suppressions.yaml`:

```yaml
suppressions:
  - rule_id: OSIPS-SEC-INJ-001
    location_glob: "custom-sanitizer.cfg:67-71"
    justification: "Reviewed Perl sanitizer; allowlist-only enforcement confirmed."
    expires: 2027-04-27
    approver: alice@example.com
```

The advisor will honor the suppression but continue to surface the suppression record in Appendix B of subsequent reports until expiry, with a warning if the underlying Perl file's hash changes (compensating-control verification).

---

## Appendix D — Engine Diagnostics

| Phase | Rules executed | Findings raised | review_required | Wall time |
|---|---|---|---|---|
| Parse | — | — | — | 0.4s |
| Structural | 19 | 1 (F4) | 0 | 1.0s |
| Value/Pattern | 14 | 1 (F1) | 0 | 1.6s |
| Dataflow/Taint | 7 | 0 | 1 (F2) | 4.8s |
| Semantic/Contextual | 7 | 1 (F5) | 1 (F3) | 6.4s |
| Triage + verification | — | — | — | 0.7s |
| **Total** | **47** | **3** | **2** | **14.9s** |

**Verification status summary.** 3 `deterministic_confirmed`, 0 `judge_confirmed`, 0 `judge_dissented`, 2 `unchecked` (corresponding to the two `review_required` items).

---

_Generated by opensips-advisor 0.1.0._
