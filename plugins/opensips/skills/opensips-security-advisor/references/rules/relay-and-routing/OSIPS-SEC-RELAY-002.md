---
id: OSIPS-SEC-RELAY-002
name: preloaded-route-unblocked
title: Preloaded Route headers from foreign UACs accepted — egress-path manipulation
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: relay_and_routing
applies_if_modules_loaded: [rr]
applies_if_opensips_version: ">=3.2"
phase: [structural, semantic_contextual]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.8
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:L/SC:N/SI:H/SA:N"
cwe: [CWE-285, CWE-441, CWE-501]
owasp: ["A01:2021-Broken Access Control"]
attack: [T1190]
tags: [routing, preloaded-route, loose-route, egress-manipulation]

references:
  - https://opensips.org/docs/modules/3.4.x/rr.html
  - https://datatracker.ietf.org/doc/html/rfc3261#section-12
  - ../../knowledge/vulnerability-reference.md#section-4

short_description: |
  request_route doesn't block initial requests carrying a UAC-supplied
  preloaded Route header. The UAC dictates the proxy's egress path,
  bypassing the cfg's intended routing logic, evading dispatcher selection,
  and potentially routing to attacker-chosen next hops.
---

## Rationale

Per RFC 3261 §12, in-dialog requests carry Route headers that `loose_route()` consumes to maintain the established path. Initial requests (no `to-tag`) should not carry Route headers; if they do, it's a UAC-supplied preloaded Route that the cfg author should reject.

Exploitation: a UAC sends an initial INVITE with `Route: <sip:pstn-gateway.example;lr>`. If the proxy calls `loose_route()` without first checking `has_totag()`, the proxy forwards to the attacker-named destination — bypassing `is_myself`, `check_source_address`, and dispatcher selection.

Three vectors: toll-fraud with auth bypass; dispatcher/load-balancer evasion; topology disclosure through differential responses.

The OpenSIPS canonical residential template defends with the `if (loose_route()) { ... reject ... }` pattern placed after `has_totag()` handling.

Source: Phase 2 §4; RFC 3261 §12.

## Default Value

Not applicable.

## Audit

The rule fires when `rr` is loaded, the cfg has INVITE-handling that reaches forwarding, and no preloaded-Route blocking pattern is present. Canonical pattern: `if (loose_route()) { ... reject 403 ... exit; }` outside the `has_totag()` branch, with ACK exception.

## Remediation

```opensips
if (loose_route()) {
    xlog("L_ERR", "Preloaded Route from $fu/$tu/$ru/$ci");
    if (!is_method("ACK")) send_reply(403, "Preload Route denied");
    exit;
}
```

Place after `has_totag()` handling and `is_myself()` relay-scoping, before routing logic. Always include the ACK exception (RFC-mandated for in-dialog ACKs).

## Example — BAD

```opensips
route {
    if (has_totag()) {
        if (!loose_route()) { send_reply(404, "Not here"); exit; }
        t_relay(); exit;
    }
    if (is_method("INVITE")) {
        record_route();
        t_relay();   # initial-INVITE preloaded Route honored
    }
}
```

## Example — GOOD

```opensips
route {
    if (has_totag()) {
        if (is_method("ACK") && t_check_trans()) { t_relay(); exit; }
        if (!loose_route()) { send_reply(404, "Not here"); exit; }
        route(relay); exit;
    }

    if (!is_method("REGISTER")) {
        if (is_myself("$fd")) { /* local */ }
        else {
            if (!is_myself("$rd")) { send_reply(403, "Relay Forbidden"); exit; }
        }
    }

    if (loose_route()) {
        xlog("L_ERR", "Preloaded Route from $fu/$tu/$ru/$ci");
        if (!is_method("ACK")) send_reply(403, "Preload Route denied");
        exit;
    }
    # ... routing
}
```

## Version Notes

`loose_route()` semantics stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **SBC deployments accepting preloaded Routes from documented peers.** Scope acceptance to trusted sources via `check_source_address` before this check. Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay-no-isself)
- `OSIPS-SEC-RELAY_AND_ROUTING-005` (max-forwards-missing)
- `OSIPS-SEC-INJECTION-006` (crlf-append-hf) — Route header construction.

## Additional References

- Phase 2 §4
- OpenSIPS rr module: https://opensips.org/docs/modules/3.4.x/rr.html
- RFC 3261 §12
- CWE-285, CWE-441, CWE-501
- OWASP A01:2021
