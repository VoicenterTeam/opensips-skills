---
id: OSIPS-SEC-LOG-003
name: proto-hep-public
title: proto_hep / siptrace bound to non-loopback or remote cleartext — capture stream public
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tracing_and_logging
applies_if_modules_loaded: [proto_hep, siptrace]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-200, CWE-319]
owasp: ["A02:2021-Cryptographic Failures", "A05:2021-Security Misconfiguration"]
attack: [T1040, T1592]
tags: [tracing, siptrace, hep, packet-capture, network-listening]

references:
  - https://opensips.org/docs/modules/3.4.x/proto_hep.html
  - https://opensips.org/docs/modules/3.4.x/siptrace.html
  - https://github.com/sipcapture/HEP
  - ../../knowledge/vulnerability-reference.md#section-12

short_description: |
  proto_hep or siptrace forwards captured SIP traffic to a non-loopback
  destination over cleartext, or accepts HEP traffic on a non-loopback bind.
  Captured stream contains every SIP message including digest Authorization
  headers — exposed to network observers.
---

## Rationale

HEP (Homer Encapsulation Protocol) is the canonical SIP capture protocol. The captured stream contains everything flowing through the proxy — every REGISTER with Authorization, every INVITE with PAI and credentials, every MESSAGE body. Highest-value possible single capture target.

Failure modes: cleartext forwarding to remote HEP collector observable on every network hop; HEP listener bound publicly accepts forged HEP from attackers (poisoning the capture stream).

Remediation: HEP forwarding via TLS or out-of-band trusted network; HEP listeners on loopback or trusted capture VLAN.

Source: Phase 2 §12.

## Default Value

Not applicable.

## Audit

Fires when:

1. `proto_hep` loaded with `listen=hep_udp:...`/`hep_tcp:...` bound to non-loopback.
2. `siptrace` configured to forward to non-loopback IP without TLS encapsulation.
3. `modparam("siptrace", "trace_to_database", ...)` pointing at remote/cleartext DB.

## Remediation

```opensips
modparam("siptrace", "trace_to_database", "udp:127.0.0.1:9060")
# Co-located HEP collector forwards TLS to central platform
```

For HEP listener: bind to `127.0.0.1` or to a dedicated capture-network interface.

## Example — BAD

```opensips
loadmodule "siptrace.so"
modparam("siptrace", "trace_to_database", "udp:203.0.113.10:9060")
```

## Example — GOOD

```opensips
loadmodule "siptrace.so"
modparam("siptrace", "trace_to_database", "udp:127.0.0.1:9060")
# Local HEP collector handles TLS to central platform
```

## Version Notes

proto_hep / siptrace stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Dedicated capture network with documented L2/L3 isolation.** Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-TRACING_AND_LOGGING-001` (xlog-credentials)
- `OSIPS-SEC-MI_EXPOSURE-001` (mi-http-public-bind)

## Additional References

- Phase 2 §12
- OpenSIPS proto_hep: https://opensips.org/docs/modules/3.4.x/proto_hep.html
- OpenSIPS siptrace: https://opensips.org/docs/modules/3.4.x/siptrace.html
- HEP: https://github.com/sipcapture/HEP
- CWE-200, CWE-319
- OWASP A02/A05:2021
