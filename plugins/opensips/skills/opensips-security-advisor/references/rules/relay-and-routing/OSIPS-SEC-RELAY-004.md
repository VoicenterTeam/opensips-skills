---
id: OSIPS-SEC-RELAY-004
name: record-route-on-register
title: record_route() called on REGISTER or MESSAGE — wasted state and topology disclosure
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: relay_and_routing
applies_if_modules_loaded: [rr]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L2]
automated: true
suppressible: true

severity: low
confidence: high
security_severity: 3.1
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-200, CWE-1188]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1592]
tags: [routing, record-route, register, message, topology-disclosure, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/rr.html
  - https://datatracker.ietf.org/doc/html/rfc3261#section-16.6
  - ../../knowledge/vulnerability-reference.md#section-13

short_description: |
  record_route() is called on non-dialog-creating methods (REGISTER, MESSAGE)
  where it has no operational purpose. The Record-Route header injects proxy
  hostname/IP into responses, leaking deployment topology and wasting bytes.
---

## Rationale

`record_route()` adds the proxy's identity to the Record-Route header so the proxy stays in the path of subsequent in-dialog requests. Only meaningful for dialog-creating methods (typically INVITE, SUBSCRIBE).

`REGISTER` and `MESSAGE` are not dialog-creating per RFC 3261. Calling `record_route()` on them does nothing useful but has two costs: (1) topology disclosure — the proxy's identity propagates into responses to UACs (often public-Internet softphones); (2) wasted message size — bytes added to every message.

Severity is low — the disclosure is secondary information typically available via DNS/cert SANs. L2-profile because L1 enterprise PBX commonly carries the pattern as documentation copy-paste; L2 carrier/compliance is expected to clean up.

Source: Phase 2 §13.3.

## Default Value

Not applicable.

## Audit

The rule fires when `record_route()` is called on a path handling `REGISTER` or `MESSAGE` without an exclusion guard like `if (!is_method("REGISTER|MESSAGE"))`.

## Remediation

```opensips
if (!is_method("REGISTER|MESSAGE")) record_route();
```

Place after auth and routing decisions but before forwarding. For deeper topology hiding, configure the `topology_hiding` module.

## Example — BAD

```opensips
route {
    if (is_method("REGISTER")) {
        record_route();    # no-op on REGISTER, leaks proxy identity
        save("location"); exit;
    }
    record_route();
    t_relay();
}
```

## Example — GOOD

```opensips
route {
    if (is_method("REGISTER")) {
        save("location"); exit;
    }
    if (!is_method("REGISTER|MESSAGE")) record_route();
    t_relay();
}
```

## Version Notes

`record_route()` stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Cfgs intentionally Record-Routing on MESSAGE for in-dialog message tracking.** Suppress with documentation.
- **Lab cfgs** without the exclusion. Suppress with `expires`.
- **Cfgs migrated from very old OpenSER configurations.** Remediate with one-line cfg change.

## Related Rules

- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay-no-isself)
- `OSIPS-SEC-CONFIG_HYGIENE-002` (module-loaded-but-unused)

## Additional References

- Phase 2 §13.3
- OpenSIPS rr module: https://opensips.org/docs/modules/3.4.x/rr.html
- RFC 3261 §16.6
- CWE-200, CWE-1188
- OWASP A05:2021
