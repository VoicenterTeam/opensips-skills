---
id: OSIPS-SEC-MEDIA-001
name: rtpproxy-no-engage
title: rtpproxy/rtpengine loaded but engage_rtp_proxy() not called on INVITE — media bypasses proxy
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: media
applies_if_modules_loaded: [rtpproxy, rtpengine]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-1188]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1090]
tags: [media, rtpproxy, rtpengine, sdp, media-bypass, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/rtpproxy.html
  - https://opensips.org/docs/modules/3.4.x/rtpengine.html
  - 90_reference/01_master_vulnerability_reference.md#section-9

short_description: |
  rtpproxy or rtpengine loaded but no engage_rtp_proxy() / rtpengine_offer / rtpengine_answer
  call present on INVITE paths. Media (RTP) flows directly between endpoints, bypassing
  the configured media relay. NAT traversal fails for symmetric NAT; topology hiding
  fails; SRTP enforcement (when configured) doesn't apply.
---

## Rationale

Loading the module does not route media through the relay. The cfg must explicitly call `engage_rtp_proxy()` (rtpproxy) or `rtpengine_offer()`/`rtpengine_answer()` (rtpengine) to rewrite SDP `c=`/`m=` lines, allocate relay ports, and apply SRTP/recording policies.

Without engagement: NAT traversal fails for symmetric NAT; SDP exposes endpoint IPs; SRTP-required intent silently doesn't apply; recording silently fails.

Severity is medium — failure mode is operational-quality more than direct security exploitation, but compounds when SRTP is intended.

Source: Phase 2 §9.

## Default Value

Not applicable.

## Audit

Fires when `rtpproxy` or `rtpengine` is loaded and no engagement call is detected in any INVITE-handling path.

## Remediation

For rtpengine (preferred):

```opensips
loadmodule "rtpengine.so"
modparam("rtpengine", "rtpengine_sock", "udp:127.0.0.1:22222")

route {
    if (is_method("INVITE") && has_body("application/sdp")) {
        rtpengine_offer();
    }
    if (is_method("ACK") && has_body("application/sdp")) {
        rtpengine_answer();
    }
}

onreply_route[2] {
    if (status =~ "^(180|183|2[0-9][0-9])" && has_body("application/sdp")) {
        rtpengine_answer();
    }
}
```

For rtpproxy (legacy): `engage_rtp_proxy()`.

## Example — BAD

```opensips
loadmodule "rtpengine.so"
modparam("rtpengine", "rtpengine_sock", "udp:127.0.0.1:22222")
# rtpengine_offer / rtpengine_answer never called

route {
    if (is_method("INVITE")) t_relay();
}
```

## Example — GOOD

```opensips
loadmodule "rtpengine.so"
modparam("rtpengine", "rtpengine_sock", "udp:127.0.0.1:22222")

route {
    if (is_method("INVITE")) {
        if (has_body("application/sdp")) rtpengine_offer();
        t_on_reply("rtp_handler");
    }
}

onreply_route[rtp_handler] {
    if (status =~ "^(180|183|2[0-9][0-9])" && has_body("application/sdp")) {
        rtpengine_answer();
    }
}
```

## Version Notes

Both modules stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **SDP-only-pass-through** deployments by design. Suppress with documentation.
- **Cfgs using non-OpenSIPS-native media relay.** Suppress.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-MEDIA-002` (media-relay-bypass)
- `OSIPS-SEC-MEDIA-003` (srtp-not-enforced)
- `OSIPS-SEC-CONFIG_HYGIENE-002` (module-loaded-but-unused)

## Additional References

- Phase 2 §9
- OpenSIPS rtpproxy: https://opensips.org/docs/modules/3.4.x/rtpproxy.html
- OpenSIPS rtpengine: https://opensips.org/docs/modules/3.4.x/rtpengine.html
- CWE-1188
- OWASP A05:2021
