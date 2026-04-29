---
id: OSIPS-SEC-STIR_SHAKEN-002
name: identity-no-verify
title: stir_shaken module loaded but no verification call in any route
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: stir_shaken
applies_if_modules_loaded: [stir_shaken]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 6.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-345, CWE-347]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1565]
tags: [stir-shaken, identity-header, verification-bypass, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/stir_shaken.html
  - 90_reference/01_master_vulnerability_reference.md#section-11

short_description: |
  stir_shaken module loaded but no path in request_route calls stir_shaken_verify()
  or equivalent. The cfg is structurally pre-STIR/SHAKEN despite loading the
  module. Identity headers on inbound INVITEs are accepted without
  cryptographic verification.
---

## Rationale

Structural baseline for STIR_SHAKEN-001. Common during STIR/SHAKEN rollout — operators load the module to "prepare for compliance" but haven't wired verification calls into route logic. The module's presence creates a false impression of compliance.

Source: Phase 2 §11.

## Default Value

Not applicable.

## Audit

Fires when:

1. `stir_shaken` is loaded.
2. No `stir_shaken_verify()`, `verify_identity()`, or version-equivalent call anywhere in request_route or inline sub-routes.
3. Cfg has at least one INVITE-handling path.

## Remediation

```opensips
route {
    if (is_method("INVITE") && !has_totag()) {
        stir_shaken_verify("$var(attest)", "$var(orig_id)", "$var(dest_id)");
    }
}
```

See STIR_SHAKEN-001 for full pattern.

## Example — BAD

```opensips
loadmodule "stir_shaken.so"
modparam("stir_shaken", "ca_list", "/etc/opensips/stir/ca_certs.pem")
# stir_shaken_verify never called

route {
    if (is_method("INVITE")) t_relay();
}
```

## Example — GOOD

```opensips
loadmodule "stir_shaken.so"
modparam("stir_shaken", "ca_list", "/etc/opensips/stir/ca_certs.pem")

route {
    if (is_method("INVITE") && !has_totag()) {
        if (stir_shaken_verify("$var(attest)", "$var(orig)", "$var(dest)")) {
            $avp(attest) = $var(attest);
        } else {
            $avp(attest) = "unverified";
        }
        t_relay();
    }
}
```

## Version Notes

Same as STIR_SHAKEN-001.

## False-Positive Considerations

- **Module loaded for outbound attestation only** (stir_shaken_attest used, verify not). Suppress with role documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-STIR_SHAKEN-001` (pai-no-attestation-check)
- `OSIPS-SEC-STIR_SHAKEN-004` (outbound-no-attest)
- `OSIPS-SEC-CONFIG_HYGIENE-002` — module-loaded-but-unused class.

## Additional References

- Phase 2 §11
- OpenSIPS stir_shaken: https://opensips.org/docs/modules/3.4.x/stir_shaken.html
- RFC 8224
- CWE-345, CWE-347
