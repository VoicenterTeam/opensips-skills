---
id: OSIPS-SEC-AUTH-007
name: jwt-alg-none
title: auth_jwt configured without explicit algorithm pinning — alg=none / algorithm-confusion exposure
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth_jwt]
applies_if_opensips_version: ">=3.1"
phase: [semantic_contextual]
profile: [L1, L2]
automated: false
suppressible: true

severity: critical
confidence: low
security_severity: 9.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-345, CWE-347, CWE-327]
owasp: ["A02:2021-Cryptographic Failures", "A07:2021-Identification and Authentication Failures"]
attack: [T1556]
tags: [authentication, jwt, alg-none, algorithm-confusion, hardening, review_required]

references:
  - https://github.com/benmcollins/libjwt
  - https://datatracker.ietf.org/doc/html/rfc8725
  - https://cwe.mitre.org/data/definitions/347.html
  - 90_reference/02_enable_security_gap_analysis.md#d-13

short_description: |
  auth_jwt is loaded without a verifiable algorithm-pinning configuration, leaving the
  deployment exposed to alg=none acceptance and HS256/RS256 confusion attacks if any
  upstream change weakens the underlying libjwt verifier or a custom build is in place.
  Emits as review_required because the actual exposure depends on the underlying
  binary's verifier behavior, which the cfg cannot fully express.
---

## Rationale

The JWT specification's `alg` header is set by the token producer, which means the verifier must enforce its expected algorithm independently — never trust the token's own self-description. Two failure modes follow when this discipline is incomplete:

1. **alg=none acceptance.** A token signed with `alg: "none"` and an empty signature is accepted as valid because the verifier honors the token's self-reported algorithm. Modern libjwt rejects this by default since 2018, but in-tree forks, distro patches, and explicit re-enabling exist. The cfg cannot directly express the verifier's posture.

2. **HS256/RS256 confusion.** A server expecting RS256 (asymmetric) accepts an HS256 (symmetric) token signed with the public key as the HMAC secret. Public keys are routinely treated as non-secret, so an attacker who knows the public key can forge tokens. Defense requires the verifier to bind the algorithm to the key type, which most libjwt-based stacks do — but a misconfigured `jwt_script_authorize()` call that passes a multi-algorithm key bundle reopens the path.

OpenSIPS' `auth_jwt` module wraps libjwt. Upstream libjwt's defaults are safe, and the OpenSIPS module's API surface restricts most footguns. Despite that, this rule fires as `review_required` rather than as a confirmed finding because:

- The advisor cannot inspect the libjwt binary version actually loaded at runtime.
- Custom forks or in-tree patches are not visible from the cfg.
- The module's algorithm-pinning surface (whether via `jwt_algorithm` modparam, key-bundle structure, or per-call argument) is version-dependent, and the safe pattern requires the operator's affirmative confirmation.

The rule's purpose is to force that confirmation to be explicit — either as a documented suppression citing the library version, or as an algorithm-pinning configuration the engine can verify.

Source: Phase 3 gap analysis §D.13 (JWT attack surface beyond CVE-2026-25554); OWASP JWT cheatsheet; RFC 8725 (JWT Best Current Practices).

## Default Value

Not applicable — the rule checks for the *presence* of an algorithm-pinning posture, which has no defaulted form. Upstream libjwt's algorithm-defaults are safe, but the rule does not assume the upstream binary is in use.

## Audit

The rule fires when `auth_jwt` is loaded and **none** of the following pinning signals are present:

1. An explicit `jwt_algorithm` modparam (or version-equivalent) constraining accepted algorithms to a single named family.
2. Documentation in cfg comments naming the libjwt version and confirming `alg=none` rejection — interpreted by the LLM as operator affirmation.
3. A per-call argument structure that constrains the algorithm at the `jwt_script_authorize()` invocation site (version-dependent).

Because none of these are deterministically inspectable from cfg alone, the rule emits as `kind: review_required` with `confidence: low`. The operator is expected to either:
- Suppress the finding with a justification that names the libjwt version and confirms its `alg=none` rejection.
- Add an explicit algorithm-pinning modparam (if the loaded auth_jwt version supports one).

This rule is `automated: false` — it requires human review at every emission.

## Remediation

1. Identify the libjwt version compiled into your OpenSIPS binary: `ldd $(which opensips) | grep jwt`, then check the libjwt package version. Versions ≥ 1.12 reject `alg=none` by default.
2. If your auth_jwt version exposes `modparam("auth_jwt", "jwt_algorithm", "<alg>")` (or equivalent), set it to the single algorithm your token issuer uses (typically `RS256` for asymmetric or `HS256` for symmetric). Do not list multiple algorithms unless your issuer genuinely emits multiple.
3. For asymmetric verification, ensure the key passed to `jwt_script_authorize()` is the public key only and is loaded from a non-modifiable source (file with 0644 perms, env-injected at startup). Never source the key from a network endpoint without TLS + cert pinning.
4. Reject tokens whose `alg` header does not match expectations explicitly, before any signature check — even a single line of script-level rejection (`if ($jwt(header.alg) != "RS256") { send_reply(401, "Bad alg"); exit; }`) is meaningful defense in depth on top of the library check.
5. Document the libjwt version and the verification posture in cfg comments and in your security baseline; suppress this rule's emission with that documentation as the suppression justification.

## Example — BAD

```opensips
loadmodule "auth_jwt.so"

# No jwt_algorithm modparam, no comments documenting libjwt version,
# no per-call algorithm constraint. Posture is "trust libjwt defaults"
# without affirmative verification.

route {
    if (is_method("INVITE")) {
        if (!jwt_script_authorize($hdr(Authorization), $var(jwt_key), $var(payload))) {
            send_reply(401, "Unauthorized");
            exit;
        }
        t_relay();
    }
}
```

## Example — GOOD

```opensips
loadmodule "auth_jwt.so"

# Tokens issued by our IdP are RS256-only; reject everything else.
# libjwt 1.15 (rejects alg=none by default) — verified at build time.
modparam("auth_jwt", "jwt_algorithm", "RS256")

route {
    if (is_method("INVITE")) {
        # Defense in depth: reject any token whose self-declared alg
        # doesn't match our expectation, before the lib's own check.
        if ($hdr(Authorization) != null && $jwt(header.alg) != "RS256") {
            send_reply(401, "Unsupported algorithm");
            exit;
        }
        if (!jwt_script_authorize($hdr(Authorization), $var(jwt_key), $var(payload))) {
            send_reply(401, "Unauthorized");
            exit;
        }
        t_relay();
    }
}
```

## Version Notes

The exact `jwt_algorithm` modparam name and presence varies across `auth_jwt` releases. If your loaded version does not expose an algorithm-pinning modparam, the script-level check shown in the GOOD example is your only cfg-visible defense — and the suppression-with-justification path is the expected resolution.

`auth_jwt` was introduced in OpenSIPS 3.1. Versions before 3.6.4 are also exposed to CVE-2026-25554 in DB mode (`OSIPS-SEC-AUTH-004`), which is a separate concern.

## False-Positive Considerations

- This rule is intentionally `review_required` — every emission is a prompt to confirm posture, not a definitive vulnerability claim. Suppress liberally once posture is documented.
- Configs that load `auth_jwt` but never call `jwt_script_authorize()` or `jwt_db_authorize()` (e.g., loaded by mistake or for a future feature) emit at confidence:low; remove the unused `loadmodule` rather than suppressing.
- Custom in-tree libjwt patches that add capabilities (additional algorithms, custom verifiers) are not detectable from the cfg; suppress with a justification that names the patch and links to the change.

## Related Rules

- `OSIPS-SEC-AUTH-004` (jwt-db-mode-cve) — orthogonal concern: SQL injection in DB mode, unrelated to the `alg` header.
- `OSIPS-SEC-AUTH-008` (jwt-kid-injection) — same Phase 3 §D.13 family, different claim.
- `OSIPS-SEC-CONFIG_HYGIENE-002` — module loaded but unused (clean-up class).

## Additional References

- Phase 3 gap analysis §D.13 (JWT attack surface beyond CVE-2026-25554)
- libjwt — https://github.com/benmcollins/libjwt
- RFC 8725 — JSON Web Token Best Current Practices
- OWASP JWT Cheatsheet
- CWE-345 — Insufficient Verification of Data Authenticity
- CWE-347 — Improper Verification of Cryptographic Signature
- CWE-327 — Use of a Broken or Risky Cryptographic Algorithm
