---
id: OSIPS-SEC-ID-001
name: from-not-bound-to-auth
title: proxy_authorize succeeded but db_check_from() not called — From URI not bound to authenticated user
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: identity_spoofing
applies_if_modules_loaded: [auth, auth_db]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:H/VA:N/SC:N/SI:H/SA:N"
cwe: [CWE-290, CWE-345]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1078, T1565]
tags: [identity, from-spoofing, auth-binding, db_check_from, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/auth_db.html
  - ../../knowledge/vulnerability-reference.md#section-5

short_description: |
  proxy_authorize() succeeded but db_check_from() (or equivalent identity-binding
  check) is not called afterward. Authenticated user not verified to match the
  From URI claim. Attacker authenticates as user A, sends INVITE with From: user B
  — spoofs identity to billing, CDRs, downstream PAI, recording metadata.
---

## Rationale

Successful `proxy_authorize()` proves possession of HA1 for the Authorization-claimed username. It does NOT prove the same user owns the From URI. The two are independent claims.

Without binding: alice authenticates with her credential while sending a call appearing to come from bob. Proxy routes correctly (auth passed), bills as bob (per CDR), constructs PAI as bob, records under bob. Every downstream identity-trusting system is fooled.

`db_check_from()` is the binding primitive: queries subscriber table, confirms digest-authenticated username matches From URI's user component. `db_check_to()` is the analog for REGISTER.

Source: Phase 2 §5.

## Default Value

Not applicable.

## Audit

Fires when:

1. `proxy_authorize()` is called and tested.
2. Success branch reaches `t_relay()` without intervening `db_check_from()`.

## Remediation

```opensips
if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
if (!db_check_from()) {
    send_reply(403, "Forbidden auth ID"); exit;
}
consume_credentials();
```

For REGISTER:

```opensips
if (!www_authorize("", "subscriber")) { www_challenge("", "auth"); exit; }
if (!db_check_to()) { send_reply(403, "Forbidden auth ID"); exit; }
```

## Example — BAD

```opensips
if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
# No db_check_from
t_relay();
```

## Example — GOOD

```opensips
if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
if (!db_check_from()) { send_reply(403, "Forbidden auth ID"); exit; }
consume_credentials();
t_relay();
```

## Version Notes

`db_check_from()` / `db_check_to()` stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Service accounts originating under multiple identities** (call-center per-agent From). Suppress with documentation; legitimate pattern uses application-layer per-call validation.
- **Trusted-peer paths bypassing auth.** Rule does not fire when auth wasn't required.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-AUTH-002` (auth-after-routing)
- `OSIPS-SEC-AUTH-003` (missing-challenge)
- `OSIPS-SEC-IDENTITY_SPOOFING-002` (uac-replace-before-acc)
- `OSIPS-SEC-STIR_SHAKEN-001` — From-binding is precondition for valid attestation.

## Additional References

- Phase 2 §5
- OpenSIPS auth_db: https://opensips.org/docs/modules/3.4.x/auth_db.html
- CWE-290, CWE-345
- OWASP A07:2021
