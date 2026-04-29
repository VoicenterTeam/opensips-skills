---
id: OSIPS-SEC-HYG-003
name: socket-perms-implied
title: mi_datagram unix socket directory permissions implied unsafe by parent path
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: config_hygiene
applies_if_modules_loaded: [mi_datagram]
applies_if_opensips_version: ">=3.2"
phase: [value_pattern]
profile: [L1, L2]
automated: false
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:L/AC:L/AT:N/PR:L/UI:N/VC:L/VI:H/VA:L/SC:N/SI:N/SA:N"
cwe: [CWE-732, CWE-276]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1078]
tags: [filesystem, permissions, unix-socket, mi_datagram, hygiene, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/mi_datagram.html
  - ../../knowledge/vulnerability-reference.md#section-12

short_description: |
  mi_datagram unix socket points at a path under /tmp, /var/tmp, or other
  world-writable parent. Advisor cannot inspect filesystem permissions; emits
  review_required so operator confirms the socket is in a properly-permissioned
  location.
---

## Rationale

UNIX domain sockets for MI need filesystem permissions constraining access to authorized administrators. Conventional pattern: socket under `/var/run/opensips/`, parent owned by `opensips:opensips-admin` with 0750, socket itself 0660.

Cfgs placing socket under `/tmp/` or other world-writable directories defeat the filesystem-permission trust model — any local user can connect and issue MI commands.

Advisor cannot inspect filesystem perms; emits `review_required` based on path-pattern heuristics, similar to `OSIPS-SEC-TLS-005`.

Source: Phase 2 §12.

## Default Value

Not applicable.

## Audit

Fires (as `review_required`) when:

1. mi_datagram socket_name uses unix: prefix.
2. Path is under `/tmp/`, `/var/tmp/`, `/home/`, or other suspicious parent.

## Remediation

```opensips
modparam("mi_datagram", "socket_name", "unix:/var/run/opensips/mi.sock")
```

Filesystem setup:

```bash
install -d -o opensips -g opensips-admin -m 0750 /var/run/opensips
chmod 0660 /var/run/opensips/mi.sock
chown opensips:opensips-admin /var/run/opensips/mi.sock
```

## Example — BAD

```opensips
modparam("mi_datagram", "socket_name", "unix:/tmp/opensips_mi.sock")
```

## Example — GOOD

```opensips
modparam("mi_datagram", "socket_name", "unix:/var/run/opensips/mi.sock")
```

## Version Notes

mi_datagram stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Container deployments** where `/tmp` is isolated tmpfs. Suppress with documentation.
- **Lab/dev cfgs.** Suppress with `expires`.

## Related Rules

- `OSIPS-SEC-MI_EXPOSURE-002` (mi-datagram-udp) — UDP variant.
- `OSIPS-SEC-TLS-005` (tls-key-world-readable) — same path-pattern class.

## Additional References

- Phase 2 §12
- CWE-732, CWE-276
- OWASP A05:2021
