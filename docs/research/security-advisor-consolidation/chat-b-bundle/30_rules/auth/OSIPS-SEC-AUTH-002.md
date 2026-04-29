---
id: OSIPS-SEC-AUTH-002
name: auth-after-routing
title: t_relay() reachable on INVITE before proxy_authorize() — auth bypass via routing order
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth, tm]
applies_if_opensips_version: ">=3.2"
phase: [dataflow_taint, semantic_contextual]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 8.4
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:H/VA:L/SC:N/SI:H/SA:L"
cwe: [CWE-285, CWE-862]
owasp: ["A01:2021-Broken Access Control", "A07:2021-Identification and Authentication Failures"]
attack: [T1190, T1078]
tags: [authentication, authorization-bypass, open-relay, toll-fraud, route-ordering]

references:
  - https://opensips.org/docs/modules/3.4.x/auth_db.html
  - https://cwe.mitre.org/data/definitions/285.html
  - 90_reference/01_master_vulnerability_reference.md#section-5

short_description: |
  An INVITE-handling route reaches t_relay() (or routes the request to a downstream gateway)
  before proxy_authorize() has been called and its return value tested. Unauthenticated
  inbound INVITEs are forwarded to upstream destinations, creating an open-relay
  condition exploitable for toll fraud and call enumeration.
---

## Rationale

Authentication enforcement in OpenSIPS is a property of script flow ordering, not of module loading. Loading `auth` and `auth_db` does nothing on its own — challenge, verification, and the gating `if (!proxy_authorize(...))` test must all be reached *before* `t_relay()` (or any other forwarding primitive). When the order is reversed — relay first, authorize after — the cfg silently relays unauthenticated INVITEs to whatever gateway the script targets. In a typical PBX-with-PSTN-egress topology this is direct toll fraud: the attacker\'s malformed INVITE reaches the SIP trunk and originates a paid call, billed to the operator. Even on an internal proxy, unauthenticated relay enables call enumeration and topology discovery.

The bug is rarely written deliberately. It surfaces when an operator copies a routing snippet (gateway-redirect logic, CRLF rewriting, dispatcher selection) into the top of `request_route` "to test it" and forgets to move it back below the auth block. The visible symptom — calls work — is misleading because they work *too well*: they work even when they shouldn\'t.

Source: Phase 2 master vulnerability reference §5.2.

## Default Value

Not applicable — this rule checks script flow ordering, not a module parameter default. There is no defaulted "auth-then-relay" behavior in OpenSIPS; the operator must encode the order explicitly.

## Audit

The rule fires when both of the following are true on any `INVITE`-handling code path:

1. `t_relay()`, `route(<gateway-route>)`, an explicit `forward()`, or any branch that ultimately calls one of these is reachable from the request_route entry point.
2. No tested `proxy_authorize()` (i.e., a call wrapped in `if (!proxy_authorize(...)) { proxy_challenge(...); exit; }` or equivalent) sits on every path from entry to the relay primitive.

A path may be exempt if guarded by an upstream legitimacy check that obviates auth — typically:
- The request originates from a trusted peer matched by `permissions:allow_source_address()` against a trust group.
- The request is `is_method("ACK")` for a previously-authenticated dialog (ACKs do not re-authorize).
- The request matches a same-domain re-invite pattern verified against an existing dialog (`load_dlg`).

The detection is dataflow-aware: the engine traces all paths from `request_route` entry through inline `route()` calls to any sink that performs forwarding. Multi-route configs with shared helper routes are common; the engine flattens these for traversal.

## Remediation

1. Identify every forwarding primitive in your INVITE path (`t_relay()`, `forward()`, `route(<gateway>)`).
2. For each, walk backward to the request_route entry and confirm a tested `proxy_authorize()` call sits between entry and the primitive on every reachable path.
3. Where auth is structurally bypassed for trusted peers, replace the implicit bypass with an explicit `permissions:allow_source_address()` check that documents which trust group is allowed to skip auth.
4. Add a `db_check_from()` (or equivalent identity-binding check) immediately after a successful `proxy_authorize()` — a passed digest only proves possession of HA1, not that the authenticated user matches the From URI.
5. As a defensive posture, place the auth block as early as possible in `request_route`, immediately after parsing/sanity primitives and before any routing logic.

## Example — BAD

```opensips
route {
    # Topology hiding and gateway selection at the top of request_route...
    if (is_method("INVITE")) {
        $ru = "sip:" + $rU + "@pstn-gateway.example.com";
        t_relay();    # <-- unauthenticated INVITE already forwarded to PSTN
        exit;
    }

    # ...auth happens later, but the INVITE path never reaches it.
    if (!proxy_authorize("", "subscriber")) {
        proxy_challenge("", "auth");
        exit;
    }
}
```

## Example — GOOD

```opensips
route {
    if (is_method("INVITE")) {
        if (is_myself("$fd")) {
            # Local user — must authenticate before any routing decision
            if (!proxy_authorize("", "subscriber")) {
                proxy_challenge("", "auth");
                exit;
            }
            if (!db_check_from()) {
                send_reply(403, "Forbidden auth ID");
                exit;
            }
            consume_credentials();
        } else if (!allow_source_address("trusted_peers")) {
            # Foreign source not on the trusted-peer list — drop, do not relay
            send_reply(403, "Forbidden");
            exit;
        }

        # Only after auth (or trusted-peer admission) do we route to the gateway
        $ru = "sip:" + $rU + "@pstn-gateway.example.com";
        t_relay();
        exit;
    }
}
```

## Version Notes

Behavior is identical across OpenSIPS 3.2 through 3.6. The `permissions:allow_source_address()` function exists in the `permissions` module across all supported versions. `db_check_from()` is provided by `auth_db` since the OpenSER fork.

## False-Positive Considerations

- Configs that intentionally relay un-authed INVITEs to a downstream advisor (e.g., a STIR/SHAKEN verifier that authenticates out-of-band) may fire this rule. Suppress with `justification="downstream verifier handles auth"` and confirm the downstream is accessible only via a trusted internal network.
- ACK handling does not trigger the rule — ACKs are not authorized per RFC 3261.
- Configs that route INVITEs only to internal extensions (no PSTN egress) still fire because internal toll resources (conference bridges, voicemail, recording) are also abusable.
- Multi-tenant PBX deployments with per-tenant routes need the auth check inside each tenant route, not just at the top — the engine traces this correctly but operators sometimes assume "the outer route\'s auth is enough" when it isn\'t reachable on every tenant path.

## Related Rules

- `OSIPS-SEC-AUTH-003` (missing-challenge) — covers the case where auth is reached but its return value is not tested.
- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay-no-isself) — broader open-relay class; this rule is the auth-specific subset.
- `OSIPS-SEC-AUTH-005` (digest-leak-oracle) — even a correctly-ordered auth block can become an oracle if challenges are issued indiscriminately.

## Additional References

- Phase 2 master vulnerability reference §5.2 (auth-before-routing, BAD/GOOD examples)
- OpenSIPS auth_db module — https://opensips.org/docs/modules/3.4.x/auth_db.html
- OpenSIPS permissions module — https://opensips.org/docs/modules/3.4.x/permissions.html
- CWE-285 — Improper Authorization
- CWE-862 — Missing Authorization
- OWASP A01:2021 — Broken Access Control
