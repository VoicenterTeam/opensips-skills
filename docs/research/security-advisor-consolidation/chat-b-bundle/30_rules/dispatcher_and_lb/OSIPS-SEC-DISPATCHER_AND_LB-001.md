---
id: OSIPS-SEC-DISPATCHER_AND_LB-001
name: dispatcher-no-failover-validation
title: dispatcher destination set used without ds_mark_dst / failover failure_route
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dispatcher_and_lb
applies_if_modules_loaded: [dispatcher]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:L/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-754, CWE-755]
owasp: ["A04:2021-Insecure Design"]
attack: [T1499]
tags: [dispatcher, failover, health-check, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/dispatcher.html
  - 90_reference/01_master_vulnerability_reference.md#section-10

short_description: |
  dispatcher's ds_select_dst() is called but no failover validation is in
  place — no on_failure_route, no ds_mark_dst() pairing, no health-check.
  Failed destinations stay in rotation; calls fail repeatedly until manual
  intervention or external monitoring triggers a fix.
---

## Rationale

`dispatcher` provides destination-set routing. Flow: `ds_select_dst(set, alg)` picks; `t_relay()` attempts; on failure `on_failure_route` should call `ds_mark_dst()` and retry with `ds_next_dst()`.

Without failure-route plumbing: failed destinations stay in rotation; every selection that picks the dead destination produces a failed call; service degradation is partial and persistent. DoS by destination-poisoning becomes possible.

Source: Phase 2 §10.

## Default Value

Not applicable.

## Audit

Fires when:

1. `ds_select_dst()` is called.
2. No `t_on_failure` followed by `failure_route` with `ds_mark_dst` is detected.

## Remediation

```opensips
route {
    if (is_method("INVITE")) {
        ds_select_dst(1, 4);
        t_on_failure("dispatcher_failover");
        t_relay();
    }
}

failure_route[dispatcher_failover] {
    if (t_check_status("(50[0-9])|408|503")) {
        ds_mark_dst();
        if (ds_next_dst()) {
            t_relay();
        }
    }
}
```

Combine with monitoring of dispatcher state via MI (`ds_list`).

## Example — BAD

```opensips
ds_select_dst(1, 4);
t_relay();
```

## Example — GOOD

```opensips
ds_select_dst(1, 4);
t_on_failure("ds_failover");
t_relay();

failure_route[ds_failover] {
    if (t_check_status("5..|408")) {
        ds_mark_dst();
        if (ds_next_dst()) {
            t_relay();
        }
    }
}
```

## Version Notes

dispatcher API stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Dispatcher with internal health-check enabled.** Suppress with documentation.
- **External monitoring handling failover via MI.** Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-DISPATCHER_AND_LB-002` (lb-no-source-trust)
- `OSIPS-SEC-DOS_DEFENSE-002` (no-ratelimit) — defense in depth.

## Additional References

- Phase 2 §10
- OpenSIPS dispatcher: https://opensips.org/docs/modules/3.4.x/dispatcher.html
- CWE-754, CWE-755
- OWASP A04:2021
