---
id: OSIPS-SEC-STIR_SHAKEN-003
name: attestation-spoofable
title: Attestation result used in routing without testing verifier return value
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: stir_shaken
applies_if_modules_loaded: [stir_shaken]
applies_if_opensips_version: ">=3.2"
phase: [dataflow_taint, semantic_contextual]
profile: [L2]
automated: false
suppressible: true

severity: high
confidence: medium
security_severity: 7.1
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:L/SC:N/SI:H/SA:N"
cwe: [CWE-754, CWE-345]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1565]
tags: [stir-shaken, attestation, return-value, error-handling, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/stir_shaken.html
  - 90_reference/01_master_vulnerability_reference.md#section-11

short_description: |
  stir_shaken_verify() is called and the attestation output AVP is used in
  routing decisions, but the function's return value isn't tested. Stale or
  default AVP values flow into routing as if verified.
---

## Rationale

`stir_shaken_verify()` returns true/false; on success populates output AVPs with verified attestation. On failure the AVPs contain undefined or stale values. Cfgs that consume the AVPs without testing the return value are the STIR/SHAKEN equivalent of the digest-auth missing-challenge pattern.

Two patterns: stale AVP from previous request flows into current routing; default-empty AVP misclassified by inverse-comparison logic (`if attest != "C"`).

Source: Phase 2 §11.

## Default Value

Not applicable.

## Audit

Fires (as `review_required`) when:

1. `stir_shaken_verify()` called as bare statement.
2. Output AVPs subsequently used in routing/header construction/accounting.

## Remediation

```opensips
$avp(verified_attest) = "unverified";   # sentinel default
if (stir_shaken_verify("$var(attest)", "$var(orig)", "$var(dest)")) {
    $avp(verified_attest) = $var(attest);
}
if ($avp(verified_attest) == "A") {
    route(premium_routing); exit;
}
```

## Example — BAD

```opensips
route {
    if (is_method("INVITE") && !has_totag()) {
        stir_shaken_verify("$var(attest)", "$var(orig)", "$var(dest)");
        # No if-test; $var(attest) may be stale
        if ($var(attest) == "A") { route(premium_routing); exit; }
    }
}
```

## Example — GOOD

```opensips
route {
    if (is_method("INVITE") && !has_totag()) {
        $avp(verified_attest) = "unverified";
        if (stir_shaken_verify("$var(attest)", "$var(orig)", "$var(dest)")) {
            $avp(verified_attest) = $var(attest);
        }
        if ($avp(verified_attest) == "A") { route(premium_routing); exit; }
    }
}
```

## Version Notes

Same as STIR_SHAKEN-001.

## False-Positive Considerations

- Cfgs handling failure case in xlog only without altering routing. Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-STIR_SHAKEN-001`
- `OSIPS-SEC-AUTH-003` (missing-challenge) — same return-value-ignored class.

## Additional References

- Phase 2 §11
- OpenSIPS stir_shaken: https://opensips.org/docs/modules/3.4.x/stir_shaken.html
- RFC 8224
- CWE-754, CWE-345
