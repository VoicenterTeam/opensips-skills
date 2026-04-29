---
id: OSIPS-SEC-TRACING_AND_LOGGING-002
name: acc-no-redaction
title: acc / acc_db captures full SIP messages without redaction — credentials in CDR records
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tracing_and_logging
applies_if_modules_loaded: [acc, acc_db]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.9
cvss_v4_vector: "CVSS:4.0/AV:L/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-532, CWE-200]
owasp: ["A09:2021-Security Logging and Monitoring Failures"]
attack: [T1552.001]
tags: [accounting, acc, cdr, credentials, redaction]

references:
  - https://opensips.org/docs/modules/3.4.x/acc.html
  - 90_reference/01_master_vulnerability_reference.md#section-12

short_description: |
  acc/acc_db configured to capture full message content (extra columns with
  $hdr(Authorization), full message body, full headers) without redaction.
  CDR records persist in accounting DB or syslog with credential material
  visible to anyone with DB/log access.
---

## Rationale

`acc` generates Call Detail Records for billing/audit. Default fields are non-sensitive; operator-added `extra_fields` is the failure surface. When operators copy extension patterns from documentation, they sometimes include credential-bearing fields like `$hdr(Authorization)` per call.

CDRs are typically the most-retained data class in a SIP deployment. Multi-year retention makes credential-bearing CDRs durable exposure.

Source: Phase 2 §12.

## Default Value

`acc` defaults are non-sensitive. Operator-added `extra_fields` is the issue.

## Audit

Fires when `acc` extra-field configuration includes credential-bearing PVs:

1. `modparam("acc", "extra_fields", "...")` containing `$hdr(Authorization)`, etc.
2. Per-call `acc_extra` directives with same content.
3. `modparam("acc", "log_extra", "...")` with credential PVs.

## Remediation

```opensips
modparam("acc", "extra_fields", "src=$si;ua=$ua;authuser=$au")
```

For existing CDRs:

```sql
SELECT COUNT(*) FROM acc WHERE extra LIKE '%Authorization%';
UPDATE acc SET extra = REGEXP_REPLACE(extra, 'auth=Digest [^;]*', 'auth=REDACTED');
```

## Example — BAD

```opensips
modparam("acc", "extra_fields", "auth=$hdr(Authorization);src=$si")
```

## Example — GOOD

```opensips
modparam("acc", "extra_fields", "src=$si;ua=$ua;authuser=$au")
```

## Version Notes

acc module signatures stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Documented retention scope** (short-lived CDR table for diagnostics, separate from billing). Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-TRACING_AND_LOGGING-001` (xlog-cleartext-credentials)
- `OSIPS-SEC-TRACING_AND_LOGGING-004` (acc-crlf-injection)
- `OSIPS-SEC-CONFIG_HYGIENE-001`

## Additional References

- Phase 2 §12
- OpenSIPS acc: https://opensips.org/docs/modules/3.4.x/acc.html
- CWE-532, CWE-200
- OWASP A09:2021
