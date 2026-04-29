---
id: OSIPS-SEC-MEDIA-003
name: srtp-not-enforced
title: rtpengine engaged without SRTP-required flags — media flows in cleartext
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: media
applies_if_modules_loaded: [rtpengine]
applies_if_opensips_version: ">=3.2"
phase: [value_pattern]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.9
cvss_v4_vector: "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-319, CWE-311]
owasp: ["A02:2021-Cryptographic Failures"]
attack: [T1040]
tags: [media, srtp, rtpengine, cleartext-media, encryption-in-transit]

references:
  - https://opensips.org/docs/modules/3.4.x/rtpengine.html
  - https://datatracker.ietf.org/doc/html/rfc3711
  - ../../knowledge/vulnerability-reference.md#section-9

short_description: |
  rtpengine_offer / rtpengine_answer called without SRTP-required flags
  (RTP/SAVP, transport=SRTP). Media negotiates as plain RTP even when
  endpoints support SRTP. Network-adjacent attacker can capture and decode audio.
---

## Rationale

`rtpengine` flags control SRTP enforcement. Without `RTP/SAVP` (or `transport=SRTP`), the relay negotiates whatever the SDP requests — typically `RTP/AVP` (cleartext). Opportunistic SRTP without enforcement falls back when one side prefers cleartext.

L2-profile because SRTP enforcement is typically carrier/compliance-grade. L1 enterprise PBX commonly runs cleartext RTP on internal networks.

Source: Phase 2 §9.

## Default Value

Not applicable.

## Audit

Fires when `rtpengine_offer()`/`rtpengine_answer()` is called without SRTP-enforcing tokens (`RTP/SAVP`, `transport=SRTP`).

## Remediation

```opensips
rtpengine_offer("RTP/SAVP replace-origin replace-session-connection");
```

For per-leg policy:

```opensips
if (is_myself("$fd")) {
    rtpengine_offer();   # internal cleartext acceptable
} else {
    rtpengine_offer("RTP/SAVP");   # external SRTP required
}
```

## Example — BAD

```opensips
rtpengine_offer();
```

## Example — GOOD

```opensips
rtpengine_offer("RTP/SAVP replace-origin replace-session-connection");
```

## Version Notes

rtpengine flag syntax has evolved; `RTP/SAVP` form stable across OpenSIPS 3.2-3.6 with rtpengine 8.x+.

## False-Positive Considerations

- **Internal-network deployments** with cleartext RTP by design. Suppress with documentation.
- **Cfgs with SDES-only / DTLS-only patterns** the advisor doesn't recognize. Suppress.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-MEDIA-001` (rtpproxy-no-engage)
- `OSIPS-SEC-TLS-001` through `-006` — signaling-layer encryption.

## Additional References

- Phase 2 §9
- OpenSIPS rtpengine: https://opensips.org/docs/modules/3.4.x/rtpengine.html
- RFC 3711 — SRTP
- CWE-319, CWE-311
- OWASP A02:2021
