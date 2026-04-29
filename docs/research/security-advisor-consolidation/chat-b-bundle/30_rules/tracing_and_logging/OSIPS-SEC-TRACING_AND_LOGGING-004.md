---
id: OSIPS-SEC-TRACING_AND_LOGGING-004
name: acc-crlf-injection
title: SIP-sourced PV flows into acc record without CRLF stripping — log injection
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tracing_and_logging
applies_if_modules_loaded: [acc, acc_db]
applies_if_opensips_version: ">=3.2"
phase: [dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-117, CWE-93]
owasp: ["A09:2021-Security Logging and Monitoring Failures"]
attack: [T1565]
tags: [logging, acc, crlf, log-injection, taint]

references:
  - https://opensips.org/docs/modules/3.4.x/acc.html
  - 90_reference/01_master_vulnerability_reference.md#section-12

short_description: |
  acc record fields populated from SIP-sourced pseudo-variables without
  CRLF stripping. Crafted From/To/header values containing \r\n break out
  of the record's field, injecting forged log lines — evading SIEM rules,
  fabricating audit evidence.
---

## Rationale

Accounting analog of `OSIPS-SEC-INJECTION-006`. acc records are typically line-oriented text in syslog or DB row inserts. Embedded CRLF in field values can: forge log lines appearing to come from the proxy; break field boundaries in syslog parsers; inject SQL fragments into DB-bound acc records.

Defense: apply `s.escape.common` to every SIP-sourced PV interpolated into acc field configuration.

Source: Phase 2 §12.

## Default Value

Not applicable.

## Audit

Fires when:

1. `acc` or `acc_db` loaded.
2. `extra_fields` or per-call `acc_extra` interpolates a SIP-sourced PV without `s.escape.common`.

## Remediation

```opensips
modparam("acc", "extra_fields", "src=$si;ua=$(ua{s.escape.common})")
```

Per-call:

```opensips
acc_extra("custom_note=$(hdr(X-Note){s.escape.common})");
```

## Example — BAD

```opensips
modparam("acc", "extra_fields", "src=$si;ua=$ua")
```

## Example — GOOD

```opensips
modparam("acc", "extra_fields", "src=$si;ua=$(ua{s.escape.common})")
```

## Version Notes

Same as TRACING_AND_LOGGING-002.

## False-Positive Considerations

- **Cfgs logging to structured backend** (JSON to log API) where field separators are not CRLF. Suppress with documentation.

## Related Rules

- `OSIPS-SEC-INJECTION-006` (crlf-append-hf) — sibling at signaling layer.
- `OSIPS-SEC-TRACING_AND_LOGGING-002`
- `OSIPS-SEC-INJECTION-001` (sql-inj-avp-db-query) — when acc is DB-backed.

## Additional References

- Phase 2 §12
- OpenSIPS acc: https://opensips.org/docs/modules/3.4.x/acc.html
- CWE-117 — Improper Output Neutralization for Logs
- CWE-93 — CRLF Injection
- OWASP A09:2021
