---
id: OSIPS-SEC-RELAY_AND_ROUTING-005
name: max-forwards-missing
title: mf_process_maxfwd_header() not called or called with high limit — loop amplification / DoS
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: relay_and_routing
applies_if_modules_loaded: [maxfwd]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-834, CWE-674, CWE-770]
owasp: ["A04:2021-Insecure Design"]
attack: [T1499]
tags: [dos, max-forwards, loop-amplification, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/maxfwd.html
  - https://datatracker.ietf.org/doc/html/rfc3261#section-8.1.1.6
  - 90_reference/01_master_vulnerability_reference.md#section-4

short_description: |
  request_route doesn't call mf_process_maxfwd_header(), or calls it with a
  permissive limit. RFC 3261 requires the proxy to decrement Max-Forwards on
  every forwarded request and reject when zero. Without this, looped requests
  amplify indefinitely.
---

## Rationale

Max-Forwards (RFC 3261 §8.1.1.6) is the SIP loop-prevention mechanism. Default initial value 70. Without the proxy enforcing the zero-bound rejection, three exploitation classes attach: intentional loops as DoS; smuggling between cooperating proxies; fork-bomb dispatchers.

`mf_process_maxfwd_header(limit)` reads the inbound header (inserts with `limit` if absent), decrements by 1, returns true on success. Should be called early in `request_route` with limit 5-15 (lower than RFC default 70) and the return value tested.

Source: Phase 2 §4.

## Default Value

Function not called automatically — operator must invoke.

## Audit

The rule fires when:

1. Function not called in `request_route` reachable paths before forwarding.
2. Or called with `N >= 70` (RFC default — essentially no-op).
3. Or called as bare statement without testing return value.

## Remediation

```opensips
route {
    if (!mf_process_maxfwd_header(10)) {
        send_reply(483, "Too Many Hops");
        exit;
    }
    # ... rest of route
}
```

Limits: 10 generous; 5 tighter; 70 disabled. Combine with rate-limiting (`OSIPS-SEC-DOS_DEFENSE-001`, `-002`).

## Example — BAD

```opensips
route {
    # No maxfwd processing
    if (is_method("INVITE")) t_relay();
}
```

```opensips
route {
    mf_process_maxfwd_header(10);   # bare — return value not tested
    if (is_method("INVITE")) t_relay();
}
```

## Example — GOOD

```opensips
route {
    if (!mf_process_maxfwd_header(10)) {
        send_reply(483, "Too Many Hops"); exit;
    }
    if (is_method("INVITE")) t_relay();
}
```

## Version Notes

`mf_process_maxfwd_header()` signature stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Stateless reply-only proxies** without forwarding. Suppress.
- **Multi-tier topologies** where downstream enforces. Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay-no-isself)
- `OSIPS-SEC-DOS_DEFENSE-001` (no-pike)
- `OSIPS-SEC-DOS_DEFENSE-002` (no-ratelimit)
- `OSIPS-SEC-RELAY_AND_ROUTING-002` (preloaded-route-unblocked)

## Additional References

- Phase 2 §4
- OpenSIPS maxfwd: https://opensips.org/docs/modules/3.4.x/maxfwd.html
- RFC 3261 §8.1.1.6
- CWE-834, CWE-674, CWE-770
- OWASP A04:2021
