---
id: OSIPS-SEC-DISPATCHER_AND_LB-003
name: dr-no-route-fallback-cap
title: drouting do_routing without max_attempts cap — unbounded fallback iterations
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dispatcher_and_lb
applies_if_modules_loaded: [drouting]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L2]
automated: true
suppressible: true

severity: low
confidence: high
security_severity: 3.7
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-770, CWE-834]
owasp: ["A04:2021-Insecure Design"]
attack: [T1499]
tags: [drouting, dynamic-routing, fallback, cap, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/drouting.html
  - 90_reference/01_master_vulnerability_reference.md#section-10

short_description: |
  drouting do_routing() called and use_next_gw invoked on failure without
  attempt cap. Calls iterate through every gateway in route's list before
  failing, consuming resources per attempt. With no cap, deliberately-failing
  destination set produces amplification.
---

## Rationale

`drouting` provides dynamic routing with prefix-based gateway selection. Flow: `do_routing()` selects gateways; on failure `use_next_gw()` advances; iterate until success or exhaustion.

Without cap: each attempt consumes transaction-table slot, round-trip, retry timer. With dozens of gateways (common for international PSTN), deliberately-failing call holds proxy resources for tens of seconds.

Defense: cap fallback via `failure_route` counter.

Severity is low — hardening-class.

Source: Phase 2 §10.

## Default Value

Not applicable.

## Audit

Fires when:

1. `do_routing()` is called.
2. `use_next_gw()` called in `failure_route` without counter-based cap.

## Remediation

```opensips
failure_route[dr_failover] {
    if (t_check_status("5..|408")) {
        $var(attempts) = $var(attempts) + 1;
        if ($var(attempts) > 3) {
            t_reply(503, "Exhausted"); exit;
        }
        if (use_next_gw()) {
            t_relay();
        }
    }
}
```

## Example — BAD

```opensips
failure_route[dr_failover] {
    if (use_next_gw()) {
        t_relay();
    }
}
```

## Example — GOOD

```opensips
failure_route[dr_failover] {
    $var(attempts) = $var(attempts) + 1;
    if ($var(attempts) > 3) {
        t_reply(503, "Exhausted"); exit;
    }
    if (use_next_gw()) {
        t_relay();
    }
}
```

## Version Notes

drouting stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Cfgs with very small gateway lists** (2-3 entries) where natural exhaustion provides effective cap. Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-DOS_DEFENSE-005` (no-concurrent-call-cap)
- `OSIPS-SEC-RELAY_AND_ROUTING-005` (max-forwards-missing)

## Additional References

- Phase 2 §10
- OpenSIPS drouting: https://opensips.org/docs/modules/3.4.x/drouting.html
- CWE-770, CWE-834
- OWASP A04:2021
