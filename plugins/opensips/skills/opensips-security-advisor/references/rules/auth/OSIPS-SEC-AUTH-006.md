---
id: OSIPS-SEC-AUTH-006
name: weak-nonce-expire
title: nonce_expire too long or qop disabled — enlarged digest replay window
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth]
applies_if_opensips_version: ">=3.2"
phase: [value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 4.8
cvss_v4_vector: "CVSS:4.0/AV:N/AC:H/AT:P/PR:L/UI:N/VC:N/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-294, CWE-307]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1110, T1557]
tags: [authentication, nonce, replay, qop, digest-hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/auth.html
  - https://datatracker.ietf.org/doc/html/rfc7616
  - ../../knowledge/vulnerability-reference.md#section-5

short_description: |
  The auth module is configured with nonce_expire > 60 seconds, or qop unset/empty,
  enlarging the digest replay window or disabling nonce-counter replay protection
  entirely.
---

## Rationale

SIP digest authentication uses a server-issued `nonce` that the client incorporates into its response hash. Replay protection rests on two properties: the server rejects a nonce after `nonce_expire` seconds, and (when `qop=auth` or `auth-int`) the server tracks per-nonce client counters (`nc`) so that a replayed Authorization with the same `nc` is detected.

Two configuration mistakes weaken this:

1. **`nonce_expire` set high.** Operators set 300, 900, or 3600 seconds to reduce challenge round-trip cost on flaky links. The replay window grows linearly: a captured Authorization remains usable for the full window. On a public-Internet-exposed registrar, this is the difference between "captured credential expires before the attacker can act" and "captured credential is usable for the next hour."

2. **`qop` unset or empty.** The `qop` parameter controls whether the server demands the `nc`/`cnonce` machinery in the response. Setting `qop=""` or omitting the second argument to `www_challenge()` disables this, falling back to the basic RFC 2069 form where every captured Authorization is replayable until the nonce expires — no `nc` increment, no detection.

The OpenSIPS default `nonce_expire` is 30 seconds — appropriate for most deployments. Anything above 60 is suspicious; anything above 300 is a clear hardening regression. The `qop=auth` setting should be universal; `qop=auth-int` adds body-integrity protection but is rarely supported by SIP user agents in the wild and may be downgraded to `auth` in practice.

Source: Phase 2 master vulnerability reference §5; OpenSIPS auth module documentation; RFC 7616.

## Default Value

`nonce_expire = 30` (seconds). The `qop` argument to `www_challenge()` / `proxy_challenge()` has no default — it must be supplied explicitly per call site, which is why bare `www_challenge("", "")` is a common mistake.

## Audit

The rule fires on any of:

1. `modparam("auth", "nonce_expire", N)` where `N > 60`. Severity scales: `60 < N <= 300` is medium; `N > 300` is high. The rule frontmatter declares medium as the baseline; the engine elevates to high on the `>300` threshold.
2. `www_challenge(realm, qop)` or `proxy_challenge(realm, qop)` called with `qop = ""` or with the second argument literally absent — disabling RFC 2617 replay protection.
3. `modparam("auth", "nonce_reuse", 1)` (if present in the loaded version). This explicitly allows nonce reuse and defeats replay defense entirely; this sub-pattern fires as severity:high regardless of the nonce_expire value.

## Remediation

1. Set `modparam("auth", "nonce_expire", 30)` for L2 carrier-grade or `60` for L1 enterprise-PBX. Do not exceed 60 on any deployment with public-Internet exposure.
2. Audit every `www_challenge()` and `proxy_challenge()` call site. Replace bare `www_challenge("", "")` with `www_challenge("", "auth")`.
3. Verify your user agents support `qop=auth`. Modern softphones and IP-PBX endpoints all do; legacy hardware (some 2000s-era ATAs) may not. Test before rolling out to production fleets.
4. Do not enable `nonce_reuse` — there is no production scenario where this is correct.
5. If user-agent compatibility forces `qop=""`, compensate by setting `nonce_expire=15` and tighter rate-limits via `pike` to constrain the replay window mechanically.

## Example — BAD

```opensips
loadmodule "auth.so"

modparam("auth", "nonce_expire", 3600)   # 1-hour replay window

route {
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "");        # qop disabled — no nc/cnonce protection
            exit;
        }
        save("location");
        exit;
    }
}
```

## Example — GOOD

```opensips
loadmodule "auth.so"

modparam("auth", "nonce_expire", 30)     # tight replay window

route {
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");    # nc/cnonce replay protection enabled
            exit;
        }
        save("location");
        exit;
    }
}
```

## Version Notes

`nonce_expire` and the `qop` semantics are stable across OpenSIPS 3.2 through 3.6. Some intermediate releases added the `disable_nonce_check` parameter for migration scenarios; setting it to `1` is equivalent in effect to `nonce_reuse=1` and triggers the same high-severity branch of this rule.

## False-Positive Considerations

- Federated SIP peering scenarios where peers re-challenge at a per-call cadence may legitimately set `nonce_expire` longer to amortize the cost. Document the federation context and suppress with `justification="federated peering, mTLS-authenticated peer"`.
- Telephony APIs that authenticate per-message rather than per-dialog (e.g., MESSAGE flooding for SMS-over-SIP) may have low-value sessions where a long nonce is acceptable. Suppress per-route, not globally.
- The rule does not fire if `auth` is loaded but no `www_challenge` / `proxy_challenge` is reachable — that case is `OSIPS-SEC-AUTH-003` (missing-challenge) instead.

## Related Rules

- `OSIPS-SEC-AUTH-003` (missing-challenge) — covers the case where qop is irrelevant because no challenge is issued at all.
- `OSIPS-SEC-AUTH-005` (digest-leak-oracle) — long nonce windows magnify the oracle's per-probe yield.
- `OSIPS-SEC-DOS_DEFENSE-002` (no-ratelimit) — rate-limiting compensates partially when nonce hardening cannot be tightened.

## Additional References

- Phase 2 master vulnerability reference §5
- OpenSIPS auth module — https://opensips.org/docs/modules/3.4.x/auth.html
- RFC 7616 (HTTP Digest Access Authentication) — supersedes RFC 2617
- CWE-294 — Authentication Bypass by Capture-Replay
- CWE-307 — Improper Restriction of Excessive Authentication Attempts
