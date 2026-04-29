---
id: OSIPS-SEC-STIR_SHAKEN-004
name: outbound-no-attest
title: Outbound INVITEs leave the deployment without STIR/SHAKEN attestation
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: stir_shaken
applies_if_modules_loaded: [stir_shaken]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L2]
automated: false
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:L/VA:N/SC:N/SI:L/SA:N"
cwe: [CWE-345]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: []
tags: [stir-shaken, outbound, attestation, compliance, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/stir_shaken.html
  - 90_reference/01_master_vulnerability_reference.md#section-11

short_description: |
  stir_shaken module loaded but no stir_shaken_attest() call detected on
  outbound INVITE paths. Calls leave the deployment unattested; downstream
  verifiers treat as "unverified" and may downgrade or refuse.
---

## Rationale

STIR/SHAKEN imposes obligations on both sides: terminating verifies; originating attests. Outbound INVITEs from an OpenSIPS deployment to carrier networks must apply attestation when acting as the originating service. Without it: downstream verification fails, regulatory non-compliance, reputation degradation.

`automated: false` because outbound-path determination requires reasoning about routing topology.

Source: Phase 2 §11.

## Default Value

Not applicable.

## Audit

Fires (as `review_required`) when:

1. `stir_shaken` is loaded.
2. Cfg has outbound INVITE paths reaching `t_relay()`.
3. No `stir_shaken_attest()` call detected on those paths.

## Remediation

```opensips
modparam("stir_shaken", "auth_date_freshness", 60)
modparam("stir_shaken", "ca_list", "/etc/opensips/stir/ca_certs.pem")
modparam("stir_shaken", "e164_strict_mode", 1)

route[outbound] {
    stir_shaken_attest(
        "/etc/opensips/stir/signing_key.pem",
        "https://stir.example.com/cert.pem",
        "A",
        "$fU",
        "$rU"
    );
    t_relay();
}
```

Obtain certificate from STI-CA accredited entity. Apply attestation level matching actual auth posture.

## Example — BAD

```opensips
route {
    if (is_method("INVITE") && is_myself("$fd")) {
        if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
        # No attestation - terminator sees unverified
        t_relay();
    }
}
```

## Example — GOOD

```opensips
modparam("stir_shaken", "ca_list", "/etc/opensips/stir/ca_certs.pem")

route {
    if (is_method("INVITE") && is_myself("$fd")) {
        if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
        stir_shaken_attest(
            "/etc/opensips/stir/signing_key.pem",
            "https://stir.example.com/cert.pem",
            "A", "$fU", "$rU"
        );
        t_relay();
    }
}
```

## Version Notes

Same as STIR_SHAKEN-001.

## False-Positive Considerations

- **Non-STIR/SHAKEN jurisdictions.** Suppress with documentation.
- **Internal-only deployments** without carrier egress. Suppress.
- **Attestation by downstream SBC.** Suppress.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-STIR_SHAKEN-001` through `-003` — inbound side.
- `OSIPS-SEC-AUTH-002` (auth-after-routing) — auth must precede attestation.

## Additional References

- Phase 2 §11
- OpenSIPS stir_shaken: https://opensips.org/docs/modules/3.4.x/stir_shaken.html
- RFC 8224
- CWE-345
