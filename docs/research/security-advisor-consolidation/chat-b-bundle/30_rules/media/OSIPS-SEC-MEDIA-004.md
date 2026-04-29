---
id: OSIPS-SEC-MEDIA-004
name: late-offer-no-validation
title: SDP late-offer / re-INVITE handled without re-validating media policy
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: media
applies_if_modules_loaded: [rtpproxy, rtpengine]
applies_if_opensips_version: ">=3.2"
phase: [structural, semantic_contextual]
profile: [L2]
automated: false
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-345, CWE-840]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1565]
tags: [media, late-offer, re-invite, sdp, policy-bypass, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/rtpengine.html
  - https://datatracker.ietf.org/doc/html/rfc3261#section-13
  - 90_reference/01_master_vulnerability_reference.md#section-9

short_description: |
  Re-INVITEs and late-offer SDP exchanges processed without re-validating
  media policy. Attacker mid-call renegotiates to weaker parameters —
  downgrade SRTP to RTP, switch to attacker-preferred codec, bypass
  recording flags.
---

## Rationale

SIP supports mid-call renegotiation via re-INVITE (RFC 3261 §13) and late-offer patterns. Cfgs that apply media policy on initial INVITE but skip re-INVITE/late-offer leave a renegotiation gap: attacker accepts call with strong policy, then mid-call sends re-INVITE proposing weaker parameters; without re-enforcement, weaker parameters apply.

Exploits: SRTP downgrade to RTP/AVP; codec downgrade to G.711; recording-required flag bypass mid-call.

`automated: false` because re-INVITE handling patterns vary; `confidence: medium` because the engine cannot definitively determine "policy flags re-applied" without deep dataflow analysis.

Source: Phase 2 §9.

## Default Value

Not applicable.

## Audit

Fires (as `review_required`) when:

1. rtpengine/rtpproxy engaged with policy flags on initial INVITE paths.
2. Re-INVITE handling (`if (has_totag()) ...` with INVITE) does not re-engage with the same flags.

## Remediation

```opensips
route {
    if (has_totag()) {
        if (is_method("INVITE") && has_body("application/sdp")) {
            rtpengine_offer("RTP/SAVP replace-origin");   # re-apply policy
        }
        loose_route();
        # ...
        exit;
    }
    if (is_method("INVITE") && has_body("application/sdp")) {
        rtpengine_offer("RTP/SAVP replace-origin");
    }
}
```

## Example — BAD

```opensips
route {
    if (has_totag()) {
        # Re-INVITE flows through without re-engagement
        loose_route(); t_relay(); exit;
    }
    if (is_method("INVITE")) {
        rtpengine_offer("RTP/SAVP");   # only on initial
        t_relay();
    }
}
```

## Example — GOOD

```opensips
route {
    if (has_totag()) {
        if (is_method("INVITE") && has_body("application/sdp")) {
            rtpengine_offer("RTP/SAVP replace-origin");
        }
        loose_route(); t_relay(); exit;
    }
    if (is_method("INVITE") && has_body("application/sdp")) {
        rtpengine_offer("RTP/SAVP replace-origin");
    }
}
```

## Version Notes

Same as MEDIA-001.

## False-Positive Considerations

- **Cfgs intentionally permitting mid-call renegotiation.** Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-MEDIA-003` (srtp-not-enforced)
- `OSIPS-SEC-MEDIA-001` (rtpproxy-no-engage)

## Additional References

- Phase 2 §9
- RFC 3261 §13
- CWE-345, CWE-840
