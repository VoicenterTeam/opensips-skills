---
id: OSIPS-SEC-AUTH-005
name: digest-leak-oracle
title: Authentication challenge issued to untrusted sources without rate-limit or source check (SIP Digest Leak oracle)
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth]
applies_if_opensips_version: ">=3.2"
phase: [semantic_contextual]
profile: [L2]
automated: true
suppressible: true

severity: high
confidence: medium
security_severity: 6.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-294, CWE-204]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1110.001, T1557]
tags: [authentication, digest-leak, oracle, credential-exposure, carrier-grade]

references:
  - https://www.enablesecurity.com/blog/sip-digest-leak/
  - https://cwe.mitre.org/data/definitions/294.html
  - ../../knowledge/vulnerability-reference.md#section-5

short_description: |
  proxy_challenge() / www_challenge() is reachable from untrusted sources without an
  upstream source-IP check (permissions module) or rate-limiter (pike, ratelimit).
  An attacker can elicit challenges at scale, turning the proxy into part of a SIP
  Digest Leak oracle that forces victim user agents to disclose digest credentials.
---

## Rationale

The SIP Digest Leak class of attack (Sandro Gauci / Enable Security, originally documented for INVITE-flood scenarios and extended to BYE/CANCEL) exploits the asymmetry between issuing and consuming challenges. A user agent that responds to an unsolicited request with a `401 Unauthorized + WWW-Authenticate` challenge can, under specific flow conditions, be coaxed into emitting a digest-Authorization for a request the attacker controls. The credential material — `Digest username="...", realm="...", nonce="...", uri="...", response="..."` — is realm-scoped HA1 proof and is replayable within the realm by anyone who captures it.

The proxy's role in the oracle is twofold. First, an OpenSIPS instance that issues challenges to *any* inbound request without source verification multiplies the attacker's leverage: a single attacker IP can probe credentials across every registered AoR. Second, when the proxy relays challenges between a malicious caller and a victim UA without rate-limiting, the latency and response timing it preserves is sufficient to coordinate the leak.

This rule covers the proxy-issuance side of the oracle. The defense is to ensure challenges are only issued *after* a source-legitimacy gate has been passed — either an explicit allow-list via the `permissions` module's `allow_source_address()`, or a rate-limit via `pike_check_req()` or the `ratelimit` module — so that an attacker cannot probe the proxy at scale, and a victim UA is not coaxed via challenges originating from arbitrary off-net sources.

This is an L2-profile finding because most enterprise PBX deployments do not face the reconnaissance volume that makes the oracle practical. Carrier SBCs, edge proxies on the public Internet, and high-value SIP service providers are the primary risk-takers and should treat this rule as mandatory.

Sources: Phase 3 gap analysis (top-3 critical gaps — SIP Digest Leak oracle); Enable Security original research; Phase 2 §5 (auth flow context).

## Default Value

Not applicable — this rule checks for the presence of a source-legitimacy gate upstream of challenge issuance, which is a structural cfg property rather than a parameter default.

## Audit

The rule fires when **all** of the following are true on any code path that reaches `proxy_challenge()`, `www_challenge()`, or their AAA equivalents:

1. The triggering request did not originate from a peer matched by `allow_source_address(<group>)` with a non-trivial trust group, AND
2. No `pike_check_req()` rate-limit guard sits upstream of the challenge call on the same path, AND
3. No equivalent custom rate-limit (`ratelimit:rl_check`, dialog-counted gate, source-IP threshold) is present upstream.

A path is exempt if:
- The triggering request is a REGISTER from a registered AoR's last-seen address (the AoR-self-refresh case).
- The request matches an explicit allow-list of administratively-trusted source CIDRs documented in the cfg.

The detection is semantic_contextual: the engine reasons about what the operator's intent was for source admission, not just about literal pattern matches. Configs that look correct but use trivially-bypassable gates (e.g., `allow_source_address` against a group containing `0.0.0.0/0`) still fire — the rule emits as `review_required` with `confidence: low` when the gate's effective scope cannot be determined statically.

## Remediation

1. Decide what your trust boundary is for issuing challenges. Enterprise: registered AoRs and their last-seen IPs. Carrier: peer SBCs by IP, plus throttled probing for unknown sources.
2. Insert a `permissions:allow_source_address(<group>)` check at the top of `request_route` — populate the group via the `address` table and reload after changes.
3. For unknown sources that fail the allow-list, route them through `pike_check_req()` (default thresholds: ~5 requests/window per source). If `pike_check_req()` fails, drop silently with no reply rather than challenging — silent drop denies the oracle its timing signal.
4. For known-good sources, proceed to the auth block as normal. Challenges are issued only after this admission stage.
5. On all 401 responses, omit `Server:` and other version-leaking headers (set via `xlog`-disabled or `topology_hiding` module) — the leak oracle is more useful to an attacker who knows the exact OpenSIPS version.
6. Consider lowering `nonce_expire` to 30s or less (see `OSIPS-SEC-AUTH-006`) — shorter nonces shrink the window an oracle can exploit per probe.

## Example — BAD

```opensips
route {
    # Direct entry into auth block — challenges are issued to any inbound source
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");   # any attacker on the public Internet
            exit;                        # can elicit a challenge with one packet
        }
        save("location");
        exit;
    }
}
```

## Example — GOOD

```opensips
loadmodule "permissions.so"
loadmodule "pike.so"

modparam("permissions", "address_table", "address")
modparam("pike", "sampling_time_unit", 2)
modparam("pike", "reqs_density_per_unit", 30)

route {
    # Stage 1: trust gate
    if (!allow_source_address("trusted_endpoints")) {
        # Unknown source — apply rate limit and drop on excess; never challenge
        if (!pike_check_req()) {
            xlog("L_NOTICE", "pike: dropping flood from $si\n");
            drop();   # silent drop — no reply, no oracle signal
        }
    }

    # Stage 2: auth — only reachable for trusted or rate-survived sources
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        if (!db_check_to()) {
            send_reply(403, "Forbidden auth ID");
            exit;
        }
        consume_credentials();
        save("location");
        exit;
    }
}
```

## Version Notes

The `permissions` module's `allow_source_address()` and the `pike` module exist in OpenSIPS 3.2 through 3.6 with stable signatures. The `ratelimit` module has been refactored across versions — the `rl_check()` function is the current API on 3.4+ and is functionally equivalent for this rule's purposes.

## False-Positive Considerations

- Lab and dev deployments with no public exposure legitimately skip the source gate. Suppress with `justification="lab — no Internet exposure"` and an `expires` date matching the lab's lifecycle.
- Federated peer scenarios (multiple OpenSIPS instances trusting each other via mutual TLS) may rely on TLS client-cert auth rather than IP-based gates. The rule still fires because cert verification is not visible in the request_route flow; suppress with `justification="mTLS-authenticated peers admitted via TLS layer"`.
- The rule emits `review_required` rather than firing definitively when the trust group's contents cannot be statically determined (e.g., `address` table populated at runtime from an external source). Operators should document the runtime-populated trust scope.

## Related Rules

- `OSIPS-SEC-AUTH-003` (missing-challenge) — orthogonal: this rule presumes challenges *are* issued, but indiscriminately.
- `OSIPS-SEC-AUTH-006` (weak-nonce-expire) — long nonce windows enlarge the oracle's exploit time per probe.
- `OSIPS-SEC-DOS_DEFENSE-001` (no-pike) — the absence of `pike` entirely is a separate finding; this rule fires when `pike` is loaded but not used to gate challenges.
- `OSIPS-SEC-MI_EXPOSURE-001` (mi-http-public-bind) — public MI exposure compounds the leak by giving the attacker introspection.

## Additional References

- Phase 3 gap analysis (top-3 critical gaps: SIP Digest Leak oracle)
- Enable Security — SIP Digest Leak research (Sandro Gauci) — https://www.enablesecurity.com/blog/sip-digest-leak/
- OpenSIPS permissions module — https://opensips.org/docs/modules/3.4.x/permissions.html
- OpenSIPS pike module — https://opensips.org/docs/modules/3.4.x/pike.html
- CWE-294 — Authentication Bypass by Capture-Replay
- CWE-204 — Observable Response Discrepancy
