---
id: OSIPS-SEC-STIR_SHAKEN-001
name: pai-no-attestation-check
title: P-Asserted-Identity trusted from upstream without verifying STIR/SHAKEN attestation
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: stir_shaken
applies_if_modules_loaded: [stir_shaken]
applies_if_opensips_version: ">=3.2"
phase: [structural, semantic_contextual]
profile: [L2]
automated: false
suppressible: true

severity: high
confidence: medium
security_severity: 7.4
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:L/SC:L/SI:H/SA:N"
cwe: [CWE-345, CWE-290]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1565]
tags: [stir-shaken, pai, identity-verification, attestation, robocall, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/stir_shaken.html
  - https://datatracker.ietf.org/doc/html/rfc8224
  - https://datatracker.ietf.org/doc/html/rfc8225
  - 90_reference/01_master_vulnerability_reference.md#section-11

short_description: |
  P-Asserted-Identity is read from inbound INVITEs and used to populate routing
  decisions, billing records, or downstream PAI without first validating the
  accompanying Identity header per STIR/SHAKEN. Upstream spoofed PAI flows
  through unchecked.
---

## Rationale

STIR/SHAKEN (RFC 8224 + 8225) requires terminating proxies to verify the Identity header signature against the STI-PA trust chain before consuming the asserted identity. Cfgs that read `$hdr(P-Asserted-Identity)` directly and use the value as if verified — without calling the verification primitive — are functionally pre-STIR/SHAKEN despite loading the module.

L2-profile because STIR/SHAKEN is primarily a regulatory requirement (TRACED Act in the US). Confidence:medium and `automated: false` because verification primitive naming has shifted across OpenSIPS releases and operator confirmation is the documented resolution path.

Source: Phase 2 §11; RFC 8224.

## Default Value

Not applicable.

## Audit

Fires (as `review_required`) when:

1. `stir_shaken` is loaded.
2. PAI is read from inbound messages.
3. No `stir_shaken_verify()` (or version-equivalent) call is detected before PAI consumption.

## Remediation

```opensips
modparam("stir_shaken", "ca_list", "/etc/opensips/stir/ca_certs.pem")

route {
    if (is_method("INVITE") && !has_totag()) {
        if (stir_shaken_verify("$var(attest)", "$var(orig_id)", "$var(dest_id)")) {
            $avp(verified_attest) = $var(attest);
            $avp(verified_orig) = $var(orig_id);
        } else {
            $avp(verified_attest) = "unverified";
        }
    }
    # routing/billing uses $avp(verified_*), not raw $hdr(P-Asserted-Identity)
}
```

Configure STI-PA trust chain. Apply policy on verification failure (refuse/degrade/tag).

## Example — BAD

```opensips
route {
    if (is_method("INVITE")) {
        $avp(caller_id) = $hdr(P-Asserted-Identity);  # no verification
        do_accounting("db", "log");
        t_relay();
    }
}
```

## Example — GOOD

```opensips
route {
    if (is_method("INVITE") && !has_totag()) {
        if (stir_shaken_verify("$var(attest)", "$var(orig)", "$var(dest)")) {
            $avp(verified_attest) = $var(attest);
            $avp(verified_caller) = $var(orig);
        } else {
            $avp(verified_attest) = "unverified";
        }
        do_accounting("db", "log");
        t_relay();
    }
}
```

## Version Notes

`stir_shaken` module exists in OpenSIPS 3.2+ with API evolution. Function names shifted across releases.

## False-Positive Considerations

- **Non-STIR/SHAKEN jurisdictions.** Suppress with regulatory documentation.
- **Internal-only deployments.** Suppress with topology documentation.
- **Verifier-appliance topologies** delegating STIR/SHAKEN externally. Suppress.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-STIR_SHAKEN-002` (identity-no-verify)
- `OSIPS-SEC-STIR_SHAKEN-003` (attestation-spoofable)
- `OSIPS-SEC-IDENTITY_SPOOFING-002` (uac-replace-before-acc)
- `OSIPS-SEC-INJECTION-006` (crlf-append-hf) — when downstream PAI constructed from inbound.

## Additional References

- Phase 2 §11
- OpenSIPS stir_shaken: https://opensips.org/docs/modules/3.4.x/stir_shaken.html
- RFC 8224 — Authenticated Identity Management in SIP
- RFC 8225 — PASSporT
- CWE-345, CWE-290
- OWASP A07:2021
