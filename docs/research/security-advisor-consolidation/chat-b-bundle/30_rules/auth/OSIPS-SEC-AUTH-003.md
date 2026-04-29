---
id: OSIPS-SEC-AUTH-003
name: missing-challenge
title: www_authorize/proxy_authorize return value ignored, or no challenge issued on failure
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 8.4
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:H/VA:L/SC:N/SI:H/SA:L"
cwe: [CWE-287, CWE-862]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1078]
tags: [authentication, silent-pass, missing-challenge, registrar, proxy]

references:
  - https://opensips.org/docs/modules/3.4.x/auth_db.html
  - https://cwe.mitre.org/data/definitions/287.html
  - 90_reference/01_master_vulnerability_reference.md#section-5

short_description: |
  www_authorize() or proxy_authorize() is called with its return value untested, or its
  failure path does not issue a challenge. The result is silent acceptance: requests
  without valid credentials are processed as if authenticated.
---

## Rationale

`www_authorize()` and `proxy_authorize()` are predicate functions: they return `1` on success, `-1` on a missing or malformed Authorization header, and other negative values on cryptographic mismatch. They do not raise exceptions, they do not exit the route, and they do not issue a challenge. All three of those side effects must be encoded by the operator in the `if (!...) { www_challenge(...); exit; }` idiom. A call written without the `if (!...)` test treats every request as authenticated — the digest verification result is computed and discarded.

The variant failure mode is the half-correct test: the return value is checked, the unauthorized branch is taken, but no `www_challenge()` / `proxy_challenge()` is issued before exit. The proxy responds with a non-401 code (often a default 500 from the absent reply), the client never sees a challenge to retry against, and the auth flow never completes — but more critically, an attacker observing this behavior knows the proxy has no auth enforcement on the affected route and can probe for the openly-accepted code paths.

Source: Phase 2 master vulnerability reference §5.2 and §5.5 (detection signals 1, 3, 4).

## Default Value

Not applicable — this rule checks script syntax patterns. The `auth` module has no defaulted "challenge on failure" behavior; the operator must invoke the challenge primitive explicitly.

## Audit

The rule fires on any of the following patterns:

1. **Untested call.** A call to `www_authorize()`, `proxy_authorize()`, `aaa_www_authorize()`, or `aaa_proxy_authorize()` whose return value is not consumed by an `if`/`switch` predicate. Bare-statement form (`www_authorize("", "subscriber");`) is the canonical instance.

2. **Tested but unchallenged.** The call is wrapped in `if (!...)` but the failure body either:
   - exits without calling `www_challenge()` / `proxy_challenge()`,
   - calls `send_reply(401, ...)` directly without the `WWW-Authenticate` header that `www_challenge()` would inject (the SIP UA cannot retry without that header),
   - falls through to a code path that ultimately accepts the request.

3. **No challenge anywhere.** The cfg loads `auth` / `auth_db` but contains zero references to `www_challenge` or `proxy_challenge`. This is dead-code authentication and the cfg cannot enforce anything.

The first pattern is structural (token-level grep). The second requires the engine to walk the failure-branch body. The third is a global cfg-level check.

## Remediation

1. Replace every bare `www_authorize(...)` / `proxy_authorize(...)` with the `if (!...) { ...challenge...; exit; }` form.
2. In the failure branch, call `www_challenge(realm, qop)` (or `proxy_challenge(realm, qop)` for non-REGISTER traffic) *before* `exit`. Do not `send_reply(401, ...)` manually — the challenge function emits the correct 401 with a properly-formed `WWW-Authenticate` header including a fresh nonce.
3. Set `qop` to `"auth"` (or `"auth-int"` if integrity protection is required and your UAC supports it). Bare `""` disables nonce-counter protection — see `OSIPS-SEC-AUTH-006`.
4. After a successful authorize, immediately bind the asserted identity: `db_check_to()` for REGISTER, `db_check_from()` for INVITE/SUBSCRIBE/MESSAGE.
5. Call `consume_credentials()` after the identity binding to strip the Authorization header before any forwarding — without this the credentials propagate downstream where they can be logged or replayed.

## Example — BAD

### Untested call

```opensips
route {
    if (is_method("REGISTER")) {
        www_authorize("", "subscriber");   # return value ignored — silent pass
        save("location");
        exit;
    }
}
```

### Tested but unchallenged

```opensips
route {
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            send_reply(401, "Unauthorized");   # no WWW-Authenticate header — UA can't retry
            exit;
        }
        save("location");
        exit;
    }
}
```

## Example — GOOD

```opensips
route {
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");      # 401 with WWW-Authenticate + fresh nonce
            exit;
        }
        if (!db_check_to()) {                # bind asserted identity to authenticated user
            send_reply(403, "Forbidden auth ID");
            exit;
        }
        consume_credentials();
        save("location");
        exit;
    }
}
```

## False-Positive Considerations

- Configs that delegate auth to a downstream component (e.g., a SIP firewall in front of OpenSIPS that enforces digest before the request reaches the script) legitimately have no `www_challenge` calls. Suppress with `justification="auth enforced upstream by <component>"` and document the boundary in your topology notes.
- Some emergency-call (SOS-URI) routes intentionally bypass auth per regulatory requirement. Wrap these in an explicit `if (is_emergency()) { ... ; exit; }` branch *before* the rule's detection scope, and document the carve-out in cfg comments.
- Re-INVITE handling within an established dialog is exempt — RFC 3261 does not require re-authorization on re-INVITE. The engine should distinguish initial INVITEs (no `to-tag`) from re-INVITEs; if it cannot, the rule emits `review_required` rather than firing.

## Related Rules

- `OSIPS-SEC-AUTH-002` (auth-after-routing) — the routing-order failure mode that compounds with this one.
- `OSIPS-SEC-AUTH-006` (weak-nonce-expire) — once challenge is correctly issued, nonce parameters determine its strength.
- `OSIPS-SEC-AUTH-005` (digest-leak-oracle) — issuing challenges to untrusted sources turns a correct auth flow into a credential leakage oracle.

## Additional References

- Phase 2 master vulnerability reference §5.2, §5.5
- OpenSIPS auth module documentation — https://opensips.org/docs/modules/3.4.x/auth.html
- RFC 3261 §22 (HTTP Authentication and Digest)
- CWE-287 — Improper Authentication
- CWE-862 — Missing Authorization
