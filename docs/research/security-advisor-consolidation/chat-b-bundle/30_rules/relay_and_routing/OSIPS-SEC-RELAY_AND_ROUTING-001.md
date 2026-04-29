---
id: OSIPS-SEC-RELAY_AND_ROUTING-001
name: open-relay-no-isself
title: t_relay() reachable without is_myself() / source-trust check — open relay enabling toll fraud
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: relay_and_routing
applies_if_modules_loaded: [tm]
applies_if_opensips_version: ">=3.2"
phase: [structural, dataflow_taint, semantic_contextual]
profile: [L1, L2]
automated: true
suppressible: true

severity: critical
confidence: high
security_severity: 9.1
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:H/SC:L/SI:H/SA:N"
cwe: [CWE-285, CWE-862, CWE-501]
owasp: ["A01:2021-Broken Access Control"]
attack: [T1190, T1078]
tags: [open-relay, toll-fraud, is_myself, relay-scoping, sipvicious]

references:
  - https://github.com/OpenSIPS/opensips/blob/master/etc/opensips.cfg
  - https://www.enablesecurity.com/sipvicious/
  - 90_reference/01_master_vulnerability_reference.md#section-4

short_description: |
  t_relay() is reachable for foreign traffic — INVITEs whose From-domain and
  Request-URI-domain are both not is_myself() and whose source IP is not in a
  trusted-peer group. The proxy forwards arbitrary SIP traffic on behalf of
  strangers, a classic open-relay condition exploited via SIPVicious-class
  scanners for toll fraud.
---

## Rationale

A SIP proxy must scope its forwarding to traffic that "belongs" to it. Three classes are legitimate: inbound for local endpoints (`is_myself($rd)`), outbound from authenticated local users, and trusted-peer traffic admitted via `permissions:check_source_address`. Everything else is foreign traffic the proxy should refuse.

When `t_relay()` is reachable for foreign traffic, the proxy is an open relay — toll fraud infrastructure. SIPVicious (svwar/svcrack/svmap) and similar scanners identify open relays automatically and monetize them via routing fraudulent international and premium-rate calls. The operator pays the carrier bill.

Three structural failure modes:

1. **No `is_myself()` check at all.** Cfg calls `t_relay()` after parsing.
2. **Disjunctive check that misses the attacker's case.** `if (is_myself($fd) || is_myself($rd))` accepts any request where either side is local — including forged-From requests.
3. **Conditional based on attacker-controlled variables.** `if (is_myself($fd))` relies on the From URI which is attacker-controlled.

Source: Phase 2 §4; OpenSIPS canonical residential template.

## Default Value

Not applicable — script flow logic, no defaulted "scope correctly" behavior.

## Audit

The rule fires when `t_relay()` (or other forwarding primitive) is reachable on an INVITE-handling path with no `is_myself($rd)` check and no `permissions:check_source_address` admission gate. Exempt paths: post-auth + post-`db_check_from`, post-`check_source_address` for trusted peers, ACK on a known transaction (`t_check_trans()`).

## Remediation

Use the canonical OpenSIPS pattern: filter REGISTER and dialog-internal traffic first, then for non-REGISTER initial requests branch on sender locality:

```opensips
if (!is_method("REGISTER")) {
    if (is_myself("$fd")) {
        # local caller - auth required below
    } else {
        if (!is_myself("$rd")) {
            send_reply(403, "Relay Forbidden");
            exit;
        }
    }
}
```

Add preloaded-Route blocking (see `OSIPS-SEC-RELAY_AND_ROUTING-002`). For trusted peers use `check_source_address()` with a narrow group (see `OSIPS-SEC-RELAY_AND_ROUTING-003`). Authenticate local users with `proxy_authorize` + `db_check_from` + `consume_credentials` before relay.

## Example — BAD

```opensips
route {
    if (is_method("INVITE")) {
        t_relay();   # full open relay
        exit;
    }
}
```

```opensips
route {
    if (is_method("INVITE")) {
        # disjunctive — attacker forges From to claim local domain
        if (is_myself("$fd") || is_myself("$rd")) {
            t_relay();
            exit;
        }
        send_reply(403, "Relay Forbidden");
        exit;
    }
}
```

## Example — GOOD

```opensips
route {
    if (!mf_process_maxfwd_header(10)) {
        send_reply(483, "Too Many Hops"); exit;
    }
    if (has_totag()) {
        if (is_method("ACK") && t_check_trans()) { t_relay(); exit; }
        if (!loose_route()) { send_reply(404, "Not here"); exit; }
        route(relay); exit;
    }
    if (is_method("CANCEL")) {
        if (t_check_trans()) t_relay(); exit;
    }
    t_check_trans();

    if (!is_method("REGISTER")) {
        if (is_myself("$fd")) {
            # local caller
        } else {
            if (!is_myself("$rd")) {
                send_reply(403, "Relay Forbidden"); exit;
            }
        }
    }

    if (loose_route()) {
        xlog("L_ERR", "Preloaded Route from $fu/$tu/$ru/$ci");
        if (!is_method("ACK")) send_reply(403, "Preload Route denied");
        exit;
    }

    if (check_source_address("1")) {
        route(trusted_routing); exit;
    }

    if (is_myself("$fd")) {
        if (!proxy_authorize("", "subscriber")) { proxy_challenge("", "auth"); exit; }
        if (!db_check_from()) { send_reply(403, "Forbidden auth ID"); exit; }
        consume_credentials();
    }

    if (!is_method("REGISTER|MESSAGE")) record_route();
    route(relay);
}
```

## Version Notes

`is_myself()`, `t_relay()`, `loose_route()`, `check_source_address()` stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Single-trunk inbound deployments** with source-IP admission as primary control. Suppress with documentation linking to permissions group.
- **Multi-tenant proxies with `domain` module helpers.** Suppress with documentation.
- **Internal-only proxies behind network ACL.** Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-RELAY_AND_ROUTING-002` (preloaded-route-unblocked)
- `OSIPS-SEC-RELAY_AND_ROUTING-003` (permissions-wildcard)
- `OSIPS-SEC-AUTH-002` (auth-after-routing) — auth-specific subset.
- `OSIPS-SEC-AUTH-003` (missing-challenge)
- `OSIPS-SEC-RELAY_AND_ROUTING-005` (max-forwards-missing)

## Additional References

- Phase 2 master vulnerability reference §4
- OpenSIPS upstream residential template: https://github.com/OpenSIPS/opensips/blob/master/etc/opensips.cfg
- SIPVicious: https://www.enablesecurity.com/sipvicious/
- CWE-285, CWE-862, CWE-501
- OWASP A01:2021
