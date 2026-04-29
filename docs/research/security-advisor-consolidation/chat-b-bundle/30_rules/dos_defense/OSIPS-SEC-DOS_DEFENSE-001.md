---
id: OSIPS-SEC-DOS_DEFENSE-001
name: no-pike
title: pike module not loaded — no per-source request-rate limiting
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dos_defense
applies_if_modules_loaded: []
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-770, CWE-400]
owasp: ["A04:2021-Insecure Design"]
attack: [T1499.001, T1499.002]
tags: [dos, rate-limiting, pike, per-source, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/pike.html
  - 90_reference/01_master_vulnerability_reference.md#section-4

short_description: |
  The cfg has no pike module loaded and no equivalent per-source rate limiter.
  A single attacker source can flood the proxy with arbitrary request volume;
  legitimate traffic from other sources is starved of CPU/memory/transaction-table
  slots.
---

## Rationale

`pike` is the canonical per-source rate limiter. Tracks request volume per source IP over a sliding window; `pike_check_req()` returns false when threshold exceeded. Typical pattern: place early in `request_route` and `drop()` floods silently.

Without `pike`: single-source flooding succeeds; targeted resource starvation possible; auth-attempt brute force at line rate.

The OpenSIPS canonical residential template loads `pike` and calls `pike_check_req()` as the second step of request_route (after maxfwd). Severity is medium because impact is bounded by upstream rate-limiting when present; closer to high on direct public exposure.

Source: Phase 2 §4.

## Default Value

Not applicable — module loaded explicitly.

## Audit

The rule fires when:

1. `pike` not loaded AND no equivalent (`ratelimit` with per-source config) loaded.
2. Cfg has at least one public-facing listener.

## Remediation

```opensips
loadmodule "pike.so"
modparam("pike", "sampling_time_unit", 2)
modparam("pike", "reqs_density_per_unit", 30)
modparam("pike", "remove_latency", 4)

route {
    if (!mf_process_maxfwd_header(10)) {
        send_reply(483, "Too Many Hops"); exit;
    }
    if (!pike_check_req()) {
        xlog("L_NOTICE", "pike: dropping flood from $si\n");
        drop();   # silent drop — no oracle signal
    }
    # ...
}
```

Use `drop()` not `send_reply()` — silent drop denies attacker timing/threshold feedback. Combine with `ratelimit` (`OSIPS-SEC-DOS_DEFENSE-002`).

## Example — BAD

```opensips
loadmodule "tm.so"
loadmodule "registrar.so"
# pike not loaded

route {
    if (!mf_process_maxfwd_header(10)) {
        send_reply(483, "Too Many Hops"); exit;
    }
    if (is_method("REGISTER")) {
        # No rate limit - flood passes through
    }
}
```

## Example — GOOD

```opensips
loadmodule "tm.so"
loadmodule "registrar.so"
loadmodule "pike.so"

modparam("pike", "sampling_time_unit", 2)
modparam("pike", "reqs_density_per_unit", 30)

route {
    if (!mf_process_maxfwd_header(10)) {
        send_reply(483, "Too Many Hops"); exit;
    }
    if (!pike_check_req()) {
        xlog("L_NOTICE", "pike: dropping flood from $si\n");
        drop();
    }
    # ...
}
```

## Version Notes

`pike` stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Loopback-only deployments.** Rule does not fire when no public-facing listener.
- **Behind upstream DDoS protection.** Suppress with documentation.
- **Internal-network deployments.** Suppress with documentation.
- **Lab and dev** — suppress with `expires`.
- **Cfgs using `ratelimit` with custom per-source config** the advisor doesn't recognize. Suppress.

## Related Rules

- `OSIPS-SEC-DOS_DEFENSE-002` (no-ratelimit)
- `OSIPS-SEC-DOS_DEFENSE-003` (global-ratelimit-only)
- `OSIPS-SEC-AUTH-005` (digest-leak-oracle)
- `OSIPS-SEC-RELAY_AND_ROUTING-005` (max-forwards-missing)

## Additional References

- Phase 2 §4
- OpenSIPS pike: https://opensips.org/docs/modules/3.4.x/pike.html
- CWE-770, CWE-400
- OWASP A04:2021
- MITRE ATT&CK T1499
