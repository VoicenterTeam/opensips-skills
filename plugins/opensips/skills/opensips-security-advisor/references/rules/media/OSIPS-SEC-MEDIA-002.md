---
id: OSIPS-SEC-MEDIA-002
name: media-relay-bypass
title: rtpengine/rtpproxy engagement conditional on attacker-influenced predicates
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: media
applies_if_modules_loaded: [rtpproxy, rtpengine]
applies_if_opensips_version: ">=3.2"
phase: [structural, dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-807, CWE-345]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1090]
tags: [media, rtpproxy, rtpengine, conditional-bypass, taint]

references:
  - https://opensips.org/docs/modules/3.4.x/rtpengine.html
  - ../../knowledge/vulnerability-reference.md#section-9

short_description: |
  Media-relay engagement is gated on predicates an attacker can influence —
  User-Agent matching, SDP attribute presence, custom headers. Crafted requests
  evade the engagement, causing media to bypass the relay even on a structurally
  correct cfg.
---

## Rationale

Some deployments wrap engagement in conditional logic to skip "internal-network calls" or "known-good UAs". Conditions like `if ($ua =~ "internal-softphone")`, `if ($hdr(X-Internal) == "yes")`, `if (a=sdp_attr("internal"))` are attacker-controllable on inbound traffic. An attacker who knows or guesses the bypass condition crafts requests matching it, evading the relay.

Defense: gate engagement on operator-controlled predicates only — `is_myself("$fd")` after authentication, `check_source_address()` against trusted peers, or unconditional engagement.

Source: Phase 2 §9.

## Default Value

Not applicable.

## Audit

Fires when:

1. Engagement call is wrapped in a conditional.
2. The conditional reads from a taint source (`16_TAINT_MODEL.md`).
3. Taint source is not subsequently verified against a trusted set.

## Remediation

```opensips
route {
    if (is_method("INVITE")) {
        if (!check_source_address("internal_peers")) {
            rtpengine_offer();
        }
    }
}
```

Or unconditional:

```opensips
if (is_method("INVITE") && has_body("application/sdp")) {
    rtpengine_offer();
}
```

## Example — BAD

```opensips
route {
    if (is_method("INVITE")) {
        # Attacker spoofs User-Agent
        if ($ua !~ "internal-softphone") {
            rtpengine_offer();
        }
    }
}
```

## Example — GOOD

```opensips
route {
    if (is_method("INVITE")) {
        if (!check_source_address("internal_peers")) {
            rtpengine_offer();
        }
    }
}
```

## Version Notes

Same as MEDIA-001.

## False-Positive Considerations

- **Documented internal-network bypass via trusted-source admission.** Suppress.
- **Authenticated-identity-based bypass** (`if ($au == "internal_service")`). Suppress with documentation.

## Related Rules

- `OSIPS-SEC-MEDIA-001` (rtpproxy-no-engage)
- `OSIPS-SEC-RELAY_AND_ROUTING-003` (permissions-wildcard)

## Additional References

- Phase 2 §9
- OpenSIPS rtpengine: https://opensips.org/docs/modules/3.4.x/rtpengine.html
- CWE-807, CWE-345
