---
id: OSIPS-SEC-DOS-002
name: no-ratelimit
title: ratelimit module not loaded or not used to gate request_route — no global rate limiting
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dos_defense
applies_if_modules_loaded: []
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-770, CWE-400]
owasp: ["A04:2021-Insecure Design"]
attack: [T1499.003, T1499.004]
tags: [dos, rate-limiting, ratelimit, global, distributed-flood]

references:
  - https://opensips.org/docs/modules/3.4.x/ratelimit.html
  - ../../knowledge/vulnerability-reference.md#section-4

short_description: |
  No ratelimit module loaded or no rl_check() call gates request processing.
  Per-source pike (if present) bounds single-source flooding; ratelimit bounds
  the aggregate. Without it, distributed floods (botnet, reflection) overwhelm
  the proxy even when no individual source exceeds pike's threshold.
---

## Rationale

`pike` (per-source) and `ratelimit` (global) are complementary defenses. `pike` denies single-source amplification; `ratelimit` denies distributed amplification. A botnet distributes load across thousands of source IPs each sending below pike's threshold; the aggregate still overwhelms.

`rl_check(name, rate)` checks against a named bucket: per-method, per-route, or global aggregate. Typical pattern combines several `rl_check` calls.

L2-profile because L1 enterprise PBX commonly bounds threat to internal networks; L2 carrier-grade and public-facing deployments are expected to have global limits in addition to per-source.

Source: Phase 2 §4.

## Default Value

Not applicable.

## Audit

The rule fires when:

1. `ratelimit` not loaded OR loaded but `rl_check()` not called in request_route.
2. Cfg has at least one public-facing listener.
3. Profile is L2.

## Remediation

```opensips
loadmodule "ratelimit.so"
modparam("ratelimit", "default_algorithm", "TAILDROP")

route {
    if (!rl_check("global", 1000)) { drop(); }
    if (is_method("REGISTER") && !rl_check("REGISTER", 200)) { drop(); }
    if (is_method("INVITE")  && !rl_check("INVITE",  100)) { drop(); }
    # ...
}
```

`TAILDROP` is the simplest algorithm (drop when bucket full). `ratelimit` should come AFTER `pike` in route flow.

## Example — BAD

```opensips
loadmodule "pike.so"
modparam("pike", "sampling_time_unit", 2)
modparam("pike", "reqs_density_per_unit", 30)
# ratelimit not loaded — distributed flood unbounded

route {
    if (!pike_check_req()) drop();
}
```

## Example — GOOD

```opensips
loadmodule "pike.so"
loadmodule "ratelimit.so"

modparam("pike", "sampling_time_unit", 2)
modparam("pike", "reqs_density_per_unit", 30)
modparam("ratelimit", "default_algorithm", "TAILDROP")

route {
    if (!pike_check_req()) drop();
    if (!rl_check("global", 1000)) drop();
    if (is_method("REGISTER") && !rl_check("REGISTER", 200)) drop();
}
```

## Version Notes

`ratelimit` API has shifted slightly across releases (`rl_check` vs `rl_check_pipe`); the advisor accepts both.

## False-Positive Considerations

- **Cfgs using kernel-level (iptables/nftables) or network-layer DDoS protection.** Suppress with documentation.
- **Internal-only deployments.** Suppress with topology documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-DOS_DEFENSE-001` (no-pike)
- `OSIPS-SEC-DOS_DEFENSE-003` (global-ratelimit-only)
- `OSIPS-SEC-DOS_DEFENSE-005` (no-concurrent-call-cap)

## Additional References

- Phase 2 §4
- OpenSIPS ratelimit: https://opensips.org/docs/modules/3.4.x/ratelimit.html
- CWE-770, CWE-400
- OWASP A04:2021
