# OpenSIPS Security Advisor Report

**Configuration analyzed:** `clean-l1-enterprise-pbx.cfg`
**Profile applied:** L1 (enterprise PBX baseline)
**OpenSIPS version detected:** 3.5.4
**Engine version:** opensips-advisor 0.1.0
**Run ID:** `ada7b2c3-9117-4e8c-9c5a-1bd47e4d2a01`
**Analysis duration:** 11.8s
**Run timestamp:** 2026-04-27T10:14:32Z

---

## Executive Summary

**Hardening Index: 100 / 100**

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Info | 3 |

**Top observations.**

1. The configuration is a well-formed L1 enterprise PBX deployment. All applicable rules in the auth, tls, injection, mi_exposure, dos_defense, and config_hygiene families pass on a deterministic match — there were no semantic-pass dissents and no review-required outcomes.
2. Of 42 applicable rules, **0 produced findings**. Three rules emitted advisory observations rather than findings, surfaced in Appendix C as optional L2-alignment opportunities (none affect L1 conformance and none reduce the hardening index).
3. No version-gated CVE rules matched. The auth_jwt CVE family (CVE-2026-25554 et al.) is not applicable: the configuration does not load `auth_jwt`. The deployed OpenSIPS 3.5.4 is at the latest LTS patch level on the declared release line.

---

## Methodology & Scope

### Profile applied
**L1** — broadly applicable safe defaults. Selected by the user at intake. No per-rule profile overrides were declared.

### OpenSIPS version
**3.5.4**, declared explicitly. Corroborated by syntax signatures: modern `event_route[E_DLG_STATE_CHANGED]` form, post-3.5 `tls_mgm` listener-scoped parameter syntax. No version mismatch warning was raised.

### Modules in scope (security-relevant)
`signaling`, `sl`, `tm`, `rr`, `maxfwd`, `sipmsgops`, `textops`, `auth`, `auth_db`, `usrloc`, `registrar`, `uac`, `uac_auth`, `tls_mgm`, `proto_udp`, `proto_tcp`, `proto_tls`, `pike`, `ratelimit`, `acc`, `mi_fifo`, `mi_http`, `dialog`, `permissions`, `rtpengine`, `db_mysql`.

### Intake answers
| # | Question | Answer |
|---|---|---|
| 1 | OpenSIPS version | 3.5.4 (declared) |
| 2 | Deployment context | Enterprise PBX behind perimeter firewall |
| 3 | Authentication mode | Digest (auth_db, HA1B in MySQL) |
| 4 | Front-end | nginx reverse proxy for WSS only; SIP/UDP egress only |
| 5 | Profile | L1 (default) |

### Rule applicability
**42 rules executed** out of the catalog of 58. Skipped families and reasons:

- `stir_shaken/` (4 rules) — no `stir_shaken` module loaded.
- `dispatcher_and_lb/` (3 rules) — no `dispatcher` or `drouting` loaded.
- `identity_spoofing/` (3 rules) — no `uac_replace_*` invocations.
- `tracing_and_logging/` HEP rules (2 of 4) — no `proto_hep` listener configured.
- 1 auth_jwt CVE rule — `auth_jwt` not loaded.
- 3 rules excluded by version filter (e.g., `<3.5` only rules for avpops-style patterns).

---

## Findings

_No findings._ The configuration passed every applicable rule at L1.

---

## Remediation Roadmap

_No remediation required._ See Appendix C for optional hardening informationals.

---

## Appendix A — SARIF 2.1.0 Output

```json
{
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "opensips-advisor",
          "version": "0.1.0",
          "informationUri": "https://github.com/OpenSIPS/opensips-advisor",
          "rules": []
        }
      },
      "invocations": [
        {
          "executionSuccessful": true,
          "startTimeUtc": "2026-04-27T10:14:32Z",
          "endTimeUtc": "2026-04-27T10:14:44Z"
        }
      ],
      "artifacts": [
        {
          "location": { "uri": "clean-l1-enterprise-pbx.cfg" },
          "length": 4821,
          "sourceLanguage": "opensips-cfg"
        }
      ],
      "results": [],
      "properties": {
        "opensips-advisor/hardening_index": 100,
        "opensips-advisor/profile": "L1",
        "opensips-advisor/opensips_version_detected": "3.5.4",
        "opensips-advisor/findings_by_severity": {
          "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 3
        },
        "opensips-advisor/rules_executed": 42,
        "opensips-advisor/rules_skipped": 16
      }
    }
  ]
}
```

---

## Appendix B — Suppressions & Deferred

_No active suppressions._ No expired suppressions were carried forward from prior runs.

---

## Appendix C — Informational Observations

These are not findings under L1; they are surfaced as optional hardening items. Each carries `kind: vulnerability`, `severity: info`, `confidence: high`. None contribute to the hardening index deduction.

### INFO-001 — Tighten `mi_http` to an explicit allowlist

- **Rule:** OSIPS-SEC-MI-002 (informational mode)
- **Module family:** mi_exposure
- **Profile applicability:** L2 baseline
- **Location:** `clean-l1-enterprise-pbx.cfg:38`
- **Verification status:** deterministic_confirmed

**Observation.** `mi_http` is correctly bound to `127.0.0.1`, which satisfies L1. As belt-and-braces, set `mi_http_trusted_clients = "127.0.0.1"` so the protection survives a future operator changing the bind address.

**Effort:** XS.

---

### INFO-002 — Pike thresholds at default

- **Rule:** OSIPS-SEC-DOS-001 (informational mode)
- **Module family:** dos_defense
- **Profile applicability:** L2 baseline
- **Location:** `clean-l1-enterprise-pbx.cfg:79`
- **Verification status:** deterministic_confirmed

**Observation.** `pike_check_req()` is active with defaults (`pike_sampling_time_unit=2`, `pike_reqs_density_per_unit=20`). For a known-population enterprise PBX, lowering `pike_reqs_density_per_unit` to 10 shortens time-to-block on burst scanning without disrupting legitimate traffic.

**Effort:** XS.

---

### INFO-003 — TLS cipher list is permissive

- **Rule:** OSIPS-SEC-TLS-004 (informational mode)
- **Module family:** tls
- **Profile applicability:** L2 baseline
- **Location:** `clean-l1-enterprise-pbx.cfg:71`
- **Verification status:** deterministic_confirmed

**Observation.** The TLS profile uses `tls_ciphers_list = "HIGH:!aNULL:!MD5"`. L1-acceptable. For L2, constrain to a Mozilla "intermediate" suite list with explicit ECDHE/AES-GCM/CHACHA20 selection to remove any CBC-mode negotiation surface on legacy clients.

**Effort:** S.

---

## Appendix D — Engine Diagnostics

| Phase | Rules executed | Wall time |
|---|---|---|
| Parse | — | 0.4s |
| Structural | 18 | 0.9s |
| Value/Pattern | 14 | 1.6s |
| Dataflow/Taint | 6 | 4.2s |
| Semantic/Contextual | 4 | 4.1s |
| Triage + verification | — | 0.6s |
| **Total** | **42** | **11.8s** |

**Verification status summary.** 3 informationals, all `deterministic_confirmed`. No findings entered the LLM judge pass.

---

_Generated by opensips-advisor 0.1.0. Suppression syntax: see `23_SUPPRESSION_PROTOCOL.md`._
