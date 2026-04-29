---
id: OSIPS-SEC-DOS-003
name: global-ratelimit-only
title: ratelimit loaded but pike not loaded — single-source flooding unbounded
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dos_defense
applies_if_modules_loaded: [ratelimit]
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
attack: [T1499.001]
tags: [dos, rate-limiting, ratelimit, pike, asymmetric-posture]

references:
  - https://opensips.org/docs/modules/3.4.x/pike.html
  - ../../knowledge/vulnerability-reference.md#section-4

short_description: |
  ratelimit is loaded but pike is not. Global ratelimit caps aggregate rate but
  doesn't isolate sources — one source can consume the entire global budget
  while legitimate traffic from other sources is starved.
---

## Rationale

Asymmetric posture: distributed flood caught by global ratelimit; single-source flood also caught but consumes the entire global budget while legitimate users from other sources hit a saturated bucket and get dropped. Operationally worse than no rate limit in some respects — the attacker gets the entire global budget while legitimate users are systematically denied.

Logically inverse of `OSIPS-SEC-DOS_DEFENSE-001`: that rule fires when neither is present; this fires when ratelimit is present but pike is not.

Source: Phase 2 §4.

## Default Value

Not applicable.

## Audit

The rule fires when:

1. `ratelimit` IS loaded.
2. `pike` is NOT loaded.
3. Cfg has at least one public-facing listener.

## Remediation

Add pike, place before ratelimit:

```opensips
loadmodule "pike.so"
modparam("pike", "sampling_time_unit", 2)
modparam("pike", "reqs_density_per_unit", 30)

route {
    if (!pike_check_req()) drop();   # peel off single-source first
    if (!rl_check("global", 1000)) drop();   # then global cap
    # ...
}
```

## Example — BAD

```opensips
loadmodule "ratelimit.so"
modparam("ratelimit", "default_algorithm", "TAILDROP")
# pike not loaded

route {
    if (!rl_check("global", 1000)) drop();
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
}
```

## Version Notes

Both modules stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- Same as DOS_DEFENSE-001: internal-only, behind upstream DDoS protection, etc.

## Related Rules

- `OSIPS-SEC-DOS_DEFENSE-001` (no-pike) — neither present.
- `OSIPS-SEC-DOS_DEFENSE-002` (no-ratelimit) — opposite gap.

## Additional References

- Phase 2 §4
- OpenSIPS pike: https://opensips.org/docs/modules/3.4.x/pike.html
- OpenSIPS ratelimit: https://opensips.org/docs/modules/3.4.x/ratelimit.html
- CWE-770, CWE-400
- OWASP A04:2021
