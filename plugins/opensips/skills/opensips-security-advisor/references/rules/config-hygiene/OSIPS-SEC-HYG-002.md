---
id: OSIPS-SEC-HYG-002
name: module-loaded-but-unused
title: Module loaded with loadmodule but no module-provided primitive is called
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: config_hygiene
applies_if_modules_loaded: []
applies_if_opensips_version: ">=3.2"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: low
confidence: high
security_severity: 3.1
cvss_v4_vector: "CVSS:4.0/AV:L/AC:L/AT:N/PR:L/UI:N/VC:N/VI:N/VA:L/SC:N/SI:N/SA:N"
cwe: [CWE-1188, CWE-1041]
owasp: ["A05:2021-Security Misconfiguration"]
attack: []
tags: [hygiene, module-loaded, unused, attack-surface]

references:
  - https://opensips.org/docs/3.4.x/
  - ../../knowledge/vulnerability-reference.md#section-13

short_description: |
  Module is loaded via loadmodule but none of its exposed functions are called
  in any route. Module occupies memory, may have its own external-facing
  surface (listeners, sockets), and may have latent CVEs that affect the
  binary even when functions aren't invoked.
---

## Rationale

`loadmodule` initializes the module — runs init function which may bind sockets, register listeners, populate state, start background threads. Module is "active" from process startup regardless of script-level use.

Concerns: increased attack surface (modules like `httpd`, `mi_*`, `proto_*` register listeners on startup, exploitable for latent CVEs); memory/resource overhead; configuration-drift indicator; gratuitous CVE exposure.

Severity is low — security impact indirect. Confidence is high — structural pattern unambiguous.

Source: Phase 2 §13.

## Default Value

Not applicable.

## Audit

Fires when:

1. `loadmodule "<name>.so"` present.
2. No function exposed by `<name>` is called anywhere in route logic.
3. No modparam for `<name>` implies operational use.

## Remediation

1. Identify whether the module is genuinely unused.
2. Remove the loadmodule line.
3. For modules loaded for side effects, document and suppress.

## Example — BAD

```opensips
loadmodule "exec.so"

route {
    if (is_method("INVITE")) t_relay();   # exec_* never called
}
```

## Example — GOOD

```opensips
# loadmodule "exec.so" removed

route {
    if (is_method("INVITE")) t_relay();
}
```

## Version Notes

Pattern is version-independent. Function-list check requires advisor's per-module function database to be current.

## False-Positive Considerations

- **Modules loaded for diagnostic side effects.** Suppress with documentation.
- **Modules loaded conditionally via includes** the parser may not follow. Suppress.
- **Future-feature placeholders.** Suppress with `expires`.

## Related Rules

- `OSIPS-SEC-STIR_SHAKEN-002` — STIR/SHAKEN-specific specialization.
- `OSIPS-SEC-MI_EXPOSURE-004` — mi_xmlrpc-specific.

## Additional References

- Phase 2 §13
- CWE-1188 — Insecure Default Initialization of Resource
- CWE-1041 — Use of Redundant Code
- OWASP A05:2021
