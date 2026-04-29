---
id: OSIPS-SEC-IDENTITY_SPOOFING-002
name: uac-replace-before-acc
title: uac_replace_from / uac_replace_to applied before accounting captures original identity
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: identity_spoofing
applies_if_modules_loaded: [uac]
applies_if_opensips_version: ">=3.2"
phase: [structural, semantic_contextual]
profile: [L2]
automated: false
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:L/UI:N/VC:N/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-345, CWE-778]
owasp: ["A09:2021-Security Logging and Monitoring Failures"]
attack: [T1565]
tags: [identity, uac-replace, accounting, audit-trail, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/uac.html
  - 90_reference/01_master_vulnerability_reference.md#section-12

short_description: |
  uac_replace_from() or uac_replace_to() rewrites From/To URI before
  acc/sip_trace/xlog captures the call. Accounting record shows rewritten
  identity, not original authenticated identity. Audit trail loses
  original-identity binding; fraud detection and dispute resolution lose
  attribution.
---

## Rationale

`uac` module's `uac_replace_from()`/`uac_replace_to()` rewrite request URIs in transit — for anonymity-as-a-service, trunk-side identity translation, multi-tenant routing.

If accounting captures occur *after* the rewrite, recorded From/To values reflect post-rewrite state. Attacker (or operator with subtle misconfiguration) can: originate as A, replace as B, acc records B as originator. Audit trail loses binding to actual authenticated user.

Remediation: capture before replace, or capture both pre- and post-replace.

`automated: false` because flow-ordering analysis is deployment-specific.

Source: Phase 2 §12.

## Default Value

Not applicable.

## Audit

Fires (as `review_required`) when:

1. `uac_replace_from()` or `uac_replace_to()` is called.
2. `do_accounting()`, `sip_trace()`, etc., reached after the replace on same path.
3. No pre-replace capture detected.

## Remediation

```opensips
route {
    if (is_method("INVITE") && is_myself("$fd")) {
        do_accounting("db", "log");   # capture original first
        uac_replace_from("Anonymous", "sip:anonymous@anonymous.invalid");
        t_relay();
    }
}
```

Or capture both:

```opensips
$avp(orig_from) = $fU;
uac_replace_from(...);
modparam("acc", "extra_fields", "orig_from=$avp(orig_from);replaced_from=$fU")
```

## Example — BAD

```opensips
uac_replace_from("Anonymous", "sip:anon@anon.invalid");
do_accounting("db", "log");   # records Anonymous, loses original
```

## Example — GOOD

```opensips
do_accounting("db", "log");
uac_replace_from("Anonymous", "sip:anon@anon.invalid");
```

## Version Notes

uac module stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Cfgs capturing both pre/post via acc_extra.** Rule does not fire.
- **Anonymity-as-a-service** by design without original-identity audit trail. Suppress with privacy-posture documentation.

## Related Rules

- `OSIPS-SEC-IDENTITY_SPOOFING-001` (from-not-bound-to-auth)
- `OSIPS-SEC-TRACING_AND_LOGGING-002`
- `OSIPS-SEC-STIR_SHAKEN-001`

## Additional References

- Phase 2 §12
- OpenSIPS uac: https://opensips.org/docs/modules/3.4.x/uac.html
- CWE-345, CWE-778
- OWASP A09:2021
