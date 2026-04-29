---
id: OSIPS-SEC-LOG-001
name: xlog-cleartext-credentials
title: xlog statement emits Authorization, password, or other credential material
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tracing_and_logging
applies_if_modules_loaded: []
applies_if_opensips_version: ">=3.2"
phase: [value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.1
cvss_v4_vector: "CVSS:4.0/AV:L/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-532, CWE-200]
owasp: ["A09:2021-Security Logging and Monitoring Failures"]
attack: [T1552.001]
tags: [logging, xlog, credentials, sensitive-data]

references:
  - https://opensips.org/docs/modules/3.4.x/xlog.html
  - ../../knowledge/vulnerability-reference.md#section-12

short_description: |
  xlog or xdbg statement contains $hdr(Authorization), $hdr(Proxy-Authorization),
  or other credential material. Credentials flow into log files readable by
  ops staff, log-aggregation pipelines, SIEM, possibly attackers compromising
  log infrastructure.
---

## Rationale

`xlog`/`xdbg` write to syslog or local log files. Logged content is durable: persists in log files, propagates to log-aggregation (Elasticsearch, Splunk, Loki), gets backed up, accessible to a broader audience than the OpenSIPS host.

Patterns: `xlog("L_INFO", "got auth: $hdr(Authorization)")` — full digest credential including username, realm, nonce, response. Captured digest material is replayable within nonce window and brute-forceable offline.

Remediation: log username (`$au`) or AoR (`$tu`) only, never full Authorization headers.

Source: Phase 2 §12.

## Default Value

Not applicable.

## Audit

Fires when xlog/xdbg format string contains:

- `$hdr(Authorization)`, `$hdr(Proxy-Authorization)`, `$hdr(WWW-Authenticate)`, `$hdr(Proxy-Authenticate)`
- `$hdr(Cookie)`, `$hdr(Set-Cookie)`
- `$hdr(X-API-Key)`, `$hdr(X-Auth-Token)`
- Literal "password" with PV interpolation suggesting password-bearing content

Does NOT fire on `$au`, `$fU`, `$tU`, `$rU`, `$ci`.

## Remediation

```opensips
xlog("L_INFO", "auth attempt from user=$au src=$si\n");
```

Audit log files: `grep -E "Authorization:|Proxy-Authorization:" /var/log/opensips.log`. Rotate any credentials potentially logged. Configure log-pipeline redaction as defense in depth.

## Example — BAD

```opensips
xlog("L_INFO", "got REGISTER from $au with auth $hdr(Authorization)\n");
```

## Example — GOOD

```opensips
xlog("L_INFO", "got REGISTER from user=$au src=$si call-id=$ci\n");
```

## Version Notes

xlog signature stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Lab/dev cfgs** with diagnostic credential logging. Suppress with `expires` and confirmation logs aren't aggregated.
- **Tightly-ACLed local-only log destinations** with short retention. Suppress with documentation.

## Related Rules

- `OSIPS-SEC-TRACING_AND_LOGGING-002` (acc-no-redaction)
- `OSIPS-SEC-TRACING_AND_LOGGING-003` (proto-hep-public)
- `OSIPS-SEC-CONFIG_HYGIENE-001` (cleartext-credentials-modparam)
- `OSIPS-SEC-AUTH-005` (digest-leak-oracle)

## Additional References

- Phase 2 §12
- OpenSIPS xlog: https://opensips.org/docs/modules/3.4.x/xlog.html
- CWE-532, CWE-200
- OWASP A09:2021
- MITRE ATT&CK T1552.001
