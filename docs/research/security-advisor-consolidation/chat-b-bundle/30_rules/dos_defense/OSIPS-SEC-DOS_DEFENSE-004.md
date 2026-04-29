---
id: OSIPS-SEC-DOS_DEFENSE-004
name: send-reply-under-flood
title: pike rejection branch calls send_reply() instead of drop() — leaks timing signal
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dos_defense
applies_if_modules_loaded: [pike]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: low
confidence: high
security_severity: 3.7
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-204, CWE-200]
owasp: ["A04:2021-Insecure Design"]
attack: [T1592, T1595]
tags: [dos, rate-limiting, pike, oracle-leak, drop-vs-reply]

references:
  - https://opensips.org/docs/modules/3.4.x/pike.html
  - 90_reference/01_master_vulnerability_reference.md#section-4

short_description: |
  pike rejection branch (or ratelimit equivalent) calls send_reply() instead of
  drop(). The reply confirms the proxy is alive and gives timing feedback for
  tuning attack rate. Silent drop denies both — the attacker cannot distinguish
  rejection from filtered/unreachable.
---

## Rationale

Rate-limiter rejection has two response options: `drop()` (silent — attacker sees timeouts indistinguishable from filtered/unreachable) or `send_reply(503, ...)` (confirms alive, leaks rejection threshold).

Silent drop is preferred: denies confirmation, denies timing feedback, doesn't compound load by emitting reply packets.

The OpenSIPS canonical pattern uses `drop()` for pike and ratelimit rejection. Cfgs using `send_reply()` are common (operators wanting "polite" rejection) and are this rule's primary firing pattern.

Severity is low — operational impact is reconnaissance-friendliness, not direct exploitation.

Source: Phase 2 §4.

## Default Value

Not applicable.

## Audit

The rule fires when:

1. `pike` is loaded and `pike_check_req()` is called.
2. The rejection branch contains `send_reply(...)` followed by `exit`/`return`.

Same logic for `rl_check()` rejection branches when `ratelimit` is loaded.

## Remediation

```opensips
if (!pike_check_req()) {
    xlog("L_NOTICE", "pike: dropping flood from $si\n");
    drop();   # silent
}
```

`xlog` is fine — local log, no SIP packet emitted.

## Example — BAD

```opensips
if (!pike_check_req()) {
    send_reply(503, "Service Unavailable");   # confirms alive, leaks threshold
    exit;
}
```

## Example — GOOD

```opensips
if (!pike_check_req()) {
    xlog("L_NOTICE", "pike: dropping flood from $si\n");
    drop();
}
```

## Version Notes

`drop()` core primitive stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Compliance contexts requiring explicit rejection responses.** Suppress with documentation.
- **Internal monitoring tools that depend on 503 responses.** Migrate to log-based detection; suppress with `expires` and migration plan.

## Related Rules

- `OSIPS-SEC-DOS_DEFENSE-001` (no-pike)
- `OSIPS-SEC-DOS_DEFENSE-002` (no-ratelimit)
- `OSIPS-SEC-AUTH-005` (digest-leak-oracle)

## Additional References

- Phase 2 §4
- OpenSIPS pike: https://opensips.org/docs/modules/3.4.x/pike.html
- CWE-204, CWE-200
- OWASP A04:2021
