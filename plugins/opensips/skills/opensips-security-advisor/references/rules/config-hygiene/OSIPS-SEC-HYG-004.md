---
id: OSIPS-SEC-HYG-004
name: startup-route-exec
title: startup_route invokes exec_msg or other shell-execution primitives
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: config_hygiene
applies_if_modules_loaded: [exec]
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:L/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-78, CWE-250]
owasp: ["A03:2021-Injection"]
attack: [T1059]
tags: [exec, startup, hygiene, shell, supply-chain]

references:
  - https://opensips.org/docs/modules/3.4.x/exec.html
  - ../../knowledge/vulnerability-reference.md#section-6

short_description: |
  startup_route contains exec_msg() or similar shell-invoking primitive.
  Startup route runs at process start, typically as root before privilege
  drop, and invokes the shell. Supply-chain compromises in helper scripts
  or environment-variable injection at startup become full-host RCE.
---

## Rationale

`startup_route` runs once at process start, typically before privilege drop. Shell commands invoked there run with elevated privileges (root if before drop) and inherit environment from systemd unit/init script.

Concerns: privilege (pre-drop = root); environment inheritance (attacker-influenced env vars from CI/supply-chain become attacker-controlled command); helper-script supply chain (compromise of helper file = RCE at startup).

Defense: avoid `exec_msg` in startup_route. Replace with module-native alternatives or systemd `ExecStartPre` directives.

Source: Phase 2 §6.

## Default Value

Not applicable.

## Audit

Fires when:

1. `startup_route { ... }` is present.
2. Body contains `exec_msg()`, `exec_avp()`, `exec_dset()`, or other exec-family primitive.

## Remediation

```opensips
# BAD
startup_route {
    exec_msg("/usr/local/bin/init-state-from-helper");
}

# GOOD - module-native
startup_route {
    sql_select("config_key='init_state'", "value", "config", "$avp(state)");
}

# GOOD - systemd ExecStartPre (in unit, not cfg)
# ExecStartPre=/usr/local/bin/init-state-from-helper
```

## Example — BAD

```opensips
loadmodule "exec.so"

startup_route {
    exec_msg("/usr/local/bin/initialize");
}
```

## Example — GOOD

```opensips
# exec module not loaded
# Initialization handled by systemd ExecStartPre or sqlops module
```

## Version Notes

startup_route supported across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- Lab/dev cfgs with documented helper scripts. Suppress with `expires`.
- Cfgs requiring exec at startup (rare). Suppress with documentation of audit + supply-chain controls.

## Related Rules

- `OSIPS-SEC-INJECTION-003` (exec-msg-injection) — request-time exec injection.
- `OSIPS-SEC-INJECTION-004` (exec-setvars) — output-side exec.

## Additional References

- Phase 2 §6
- CWE-78, CWE-250
- OWASP A03:2021
