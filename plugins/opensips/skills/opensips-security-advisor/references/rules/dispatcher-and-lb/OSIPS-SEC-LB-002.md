---
id: OSIPS-SEC-LB-002
name: lb-no-source-trust
title: load_balancer used to route inbound traffic without source-trust admission check
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dispatcher_and_lb
applies_if_modules_loaded: [load_balancer]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:H/VA:L/SC:N/SI:H/SA:N"
cwe: [CWE-285, CWE-862]
owasp: ["A01:2021-Broken Access Control"]
attack: [T1190]
tags: [load-balancer, source-trust, admission, broken-access-control]

references:
  - https://opensips.org/docs/modules/3.4.x/load_balancer.html
  - ../../knowledge/vulnerability-reference.md#section-10

short_description: |
  load_balancer's lb_start() / lb_next() routes inbound traffic to backend
  destinations without first verifying source via permissions. Foreign traffic
  is load-balanced as if from trusted peers — open-relay-style abuse via the
  LB path even when relay scoping is correct elsewhere.
---

## Rationale

`load_balancer` distributes traffic across backends with capacity-aware logic. Sometimes used as primary inbound entry — cfg routes inbound directly to LB without preceding admission control.

When this happens, LB becomes the de-facto admission point. Without source-trust before `lb_start()`, foreign traffic is balanced across backends as if from trusted peers. Backends may trust the proxy's forwarding (because the proxy is in their trusted-peer group), creating transitive open-relay condition — `OSIPS-SEC-RELAY_AND_ROUTING-001` applied to LB topology.

Defense: gate `lb_start()` on `check_source_address()` against trusted peers, or on authenticated identity.

Source: Phase 2 §10.

## Default Value

Not applicable.

## Audit

Fires when:

1. `load_balancer` loaded and `lb_start()` called.
2. No preceding `check_source_address()` or `proxy_authorize` admission detected on path.

## Remediation

```opensips
route {
    if (is_method("INVITE")) {
        if (!check_source_address("trusted_peers") &&
            !proxy_authorize("", "subscriber")) {
            send_reply(403, "Forbidden"); exit;
        }
        lb_start("voicemail", 1);
        t_relay();
    }
}
```

## Example — BAD

```opensips
route {
    if (is_method("INVITE")) {
        lb_start("voicemail", 1);
        t_relay();
    }
}
```

## Example — GOOD

```opensips
route {
    if (is_method("INVITE")) {
        if (!check_source_address("trusted_peers")) {
            send_reply(403, "Forbidden"); exit;
        }
        lb_start("voicemail", 1);
        t_relay();
    }
}
```

## Version Notes

load_balancer stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **LB used post-auth for outbound legs.** Rule may fire if parser doesn't see preceding auth on path. Suppress with documentation.

## Related Rules

- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay-no-isself)
- `OSIPS-SEC-DISPATCHER_AND_LB-001` (dispatcher-no-failover-validation)

## Additional References

- Phase 2 §10
- OpenSIPS load_balancer: https://opensips.org/docs/modules/3.4.x/load_balancer.html
- CWE-285, CWE-862
- OWASP A01:2021
