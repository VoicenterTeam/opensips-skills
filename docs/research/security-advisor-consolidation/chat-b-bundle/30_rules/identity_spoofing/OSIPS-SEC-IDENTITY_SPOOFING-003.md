---
id: OSIPS-SEC-IDENTITY_SPOOFING-003
name: pai-rebuild-from-untrusted
title: P-Asserted-Identity constructed from $fU or other attacker-controlled value
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: identity_spoofing
applies_if_modules_loaded: [textops]
applies_if_opensips_version: ">=3.2"
phase: [dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.4
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:L/SC:L/SI:H/SA:N"
cwe: [CWE-345, CWE-290]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1565]
tags: [identity, pai, p-asserted-identity, taint, header-construction]

references:
  - https://datatracker.ietf.org/doc/html/rfc3325
  - https://opensips.org/docs/modules/3.4.x/textops.html
  - 90_reference/01_master_vulnerability_reference.md#section-5

short_description: |
  P-Asserted-Identity (PAI) constructed via append_hf or assignment from $fU
  or other attacker-controlled values, before any binding to authenticated
  identity. PAI is operator-trusted by downstream STIR/SHAKEN, billing,
  routing — populating from untrusted inputs subverts every downstream
  trust decision.
---

## Rationale

PAI (RFC 3325) is operator-controlled and operator-trusted; downstream consumes as truth. Construction must be from operator-trusted sources only:

- `$au` — digest-authenticated username (after `proxy_authorize` + `db_check_from`).
- AVP from a trusted DB lookup.
- Static operator-configured value.

Failure: cfgs constructing PAI from `$fU` (From URI user, attacker-controlled) or other taint sources. Downstream: STIR/SHAKEN signs bogus PAI as verified; billing records bogus PAI as caller; recording attributes call to spoofed identity.

Source: Phase 2 §5.

## Default Value

Not applicable.

## Audit

Fires when:

1. `append_hf("P-Asserted-Identity: ...")` or equivalent header-construction is called.
2. The constructed value interpolates a taint source (typically `$fU`, `$tU`, or `$hdr(From)`).
3. The interpolation is not from an authenticated/verified source.

## Remediation

```opensips
# BAD
append_hf("P-Asserted-Identity: <sip:$fU@$fd>\r\n");

# GOOD - PAI from authenticated user
append_hf("P-Asserted-Identity: <sip:$au@$fd>\r\n");

# BETTER - PAI from per-AoR trusted DB lookup
sql_select("aor=$au", "pai_uri", "subscriber_pai", "$avp(pai)");
append_hf("P-Asserted-Identity: <$avp(pai)>\r\n");
```

## Example — BAD

```opensips
if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
append_hf("P-Asserted-Identity: <sip:$fU@$fd>\r\n");
```

## Example — GOOD

```opensips
if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
if (!db_check_from()) { send_reply(403, "Forbidden auth ID"); exit; }
consume_credentials();
append_hf("P-Asserted-Identity: <sip:$au@$fd>\r\n");
```

## Version Notes

textops stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- Cfgs where `$fU` is provably equivalent to `$au` post-`db_check_from`. Rule still fires; remediation is one-line change to use `$au` directly.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-IDENTITY_SPOOFING-001` (from-not-bound-to-auth)
- `OSIPS-SEC-INJECTION-006` (crlf-append-hf) — same sink, different concern.
- `OSIPS-SEC-STIR_SHAKEN-001` — PAI is what STIR/SHAKEN attests.

## Additional References

- Phase 2 §5
- RFC 3325 — P-Asserted-Identity
- OpenSIPS textops: https://opensips.org/docs/modules/3.4.x/textops.html
- CWE-345, CWE-290
- OWASP A07:2021
