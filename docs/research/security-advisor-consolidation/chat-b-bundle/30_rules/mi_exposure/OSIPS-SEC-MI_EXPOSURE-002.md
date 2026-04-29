---
id: OSIPS-SEC-MI_EXPOSURE-002
name: mi-datagram-udp
title: mi_datagram bound to udp:/tcp: socket — administrative interface exposed on network
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: mi_exposure
applies_if_modules_loaded: [mi_datagram]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: critical
confidence: high
security_severity: 9.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-306, CWE-732]
owasp: ["A01:2021-Broken Access Control", "A05:2021-Security Misconfiguration"]
attack: [T1190, T1078]
tags: [mi, mi_datagram, admin-exposure, udp-listening, broken-access-control]

references:
  - https://opensips.org/docs/modules/3.4.x/mi_datagram.html
  - https://github.com/VoIPGRID/opensips_exporter/issues/13
  - https://cwe.mitre.org/data/definitions/306.html
  - 90_reference/02_enable_security_gap_analysis.md#d-1

short_description: |
  mi_datagram is configured with a `udp:` or `tcp:` socket binding instead of the
  intended `unix:` filesystem socket. The administrative interface is reachable
  over the network without authentication. Same impact as `OSIPS-SEC-MI_EXPOSURE-001`
  via a different transport.
---

## Rationale

`mi_datagram` is the datagram-transport variant of the MI control plane. It accepts MI commands over a socket whose type is determined by the `socket_name` parameter prefix. Three forms exist:

- `unix:/var/run/opensips/mi.sock` — UNIX domain socket on the filesystem. Trust boundary is filesystem permissions on the socket file; operator-controlled and auditable via standard POSIX tooling.
- `udp:0.0.0.0:8080` — UDP datagram socket bound to a network address. Trust boundary is the network the address is reachable on; absent if the address is `0.0.0.0` or a public interface.
- `tcp:0.0.0.0:8080` — TCP socket. Same network trust boundary as UDP.

The `udp:` and `tcp:` forms are footguns by design — they exist for legitimate use cases (MI from a remote management station on a tightly controlled network) but trade away the filesystem-permission trust model for a network-permission model that the cfg cannot express on its own.

Like `mi_http`/`httpd`, `mi_datagram` provides no built-in authentication. The blast radius of an unauthenticated `udp:` or `tcp:` MI listener is identical to MI_EXPOSURE-001: full administrative access including registration purge, active-call teardown, and route reload.

A specific subtlety: UDP in particular allows trivial source-IP spoofing on networks where ingress filtering is not enforced. An attacker on the same broadcast domain (or able to source-spoof through a permissive upstream) can issue MI commands without a routable return path. This is why the rule treats `udp:` as severity:critical even when the bind address is "internal-only" — the network model UDP assumes is weaker than TCP's.

Source: Phase 3 gap analysis §D.1; OpenSIPS mi_datagram module documentation.

## Default Value

`socket_name` has no documented default; the parameter must be set for `mi_datagram` to function. Operators sometimes choose `udp:0.0.0.0:8080` from copied-pasted documentation snippets without recognizing the network exposure.

## Audit

The rule fires when **all** of the following are true:

1. `mi_datagram` is loaded.
2. `modparam("mi_datagram", "socket_name", ...)` is set with a value that begins with one of:
   - `udp:` (network UDP socket)
   - `tcp:` (network TCP socket)
3. The address portion of the socket spec is non-loopback (`0.0.0.0`, `::`, or any non-loopback address).

The `unix:` form does not fire this rule. Filesystem-permission concerns on the unix socket are covered by `OSIPS-SEC-MI_EXPOSURE-003` (which checks for an associated trusted-clients allow-list as defense in depth) and by `OSIPS-SEC-CONFIG_HYGIENE-003` (which checks unix socket file permissions if the cfg includes the relevant `chmod` indication).

A `udp:127.0.0.1:8080` or `tcp:127.0.0.1:8080` binding is equivalent to the `unix:` form for this rule's purposes — fires at confidence:medium with severity:medium because UDP-on-loopback is functionally local but is harder to audit (loopback ACLs are not standard on most distros). Operators should still prefer `unix:` for the loopback case.

## Remediation

1. **Use a UNIX domain socket.**

   ```opensips
   modparam("mi_datagram", "socket_name", "unix:/var/run/opensips/mi.sock")
   ```

2. **Set strict filesystem permissions on the socket file.** OpenSIPS creates the socket at startup; ensure the parent directory is owned by the OpenSIPS user and the socket itself is accessible only to operators / automation that need MI access. A typical pattern uses a dedicated `opensips-admin` group:

   ```bash
   # In the systemd unit or init script:
   install -d -o opensips -g opensips-admin -m 0750 /var/run/opensips
   # OpenSIPS creates the socket; ensure umask produces 0660:
   chmod 0660 /var/run/opensips/mi.sock
   chown opensips:opensips-admin /var/run/opensips/mi.sock
   ```

3. **If a network socket is genuinely required** (remote management station that cannot run on the OpenSIPS host), the only acceptable forms are:
   - Bound to a private interface on a network with strict ingress filtering AND an explicit operator-documented trust justification.
   - Tunneled over an authenticated channel (SSH port-forward, WireGuard, etc.) such that the cfg-level binding is loopback even though the operational path is remote.

4. **Configure `mi_trusted_clients` if available on the loaded version** to restrict which source addresses can issue commands. This is defense in depth and does not substitute for socket-type or bind-address discipline. See `OSIPS-SEC-MI_EXPOSURE-003`.

## Example — BAD

### UDP bound to wildcard

```opensips
loadmodule "mi_datagram.so"
modparam("mi_datagram", "socket_name", "udp:0.0.0.0:8080")
```

### TCP bound to public interface

```opensips
loadmodule "mi_datagram.so"
modparam("mi_datagram", "socket_name", "tcp:203.0.113.5:8080")
```

## Example — GOOD

### UNIX socket

```opensips
loadmodule "mi_datagram.so"
modparam("mi_datagram", "socket_name", "unix:/var/run/opensips/mi.sock")
# Ensure parent directory and socket file have strict permissions
# (configured outside the cfg, in systemd/init scripts).
```

### UDP loopback (acceptable for local-only automation but UNIX preferred)

```opensips
loadmodule "mi_datagram.so"
modparam("mi_datagram", "socket_name", "udp:127.0.0.1:8080")
# Note: UNIX socket is the strongly preferred form. Loopback UDP is
# acceptable only when the local automation tooling cannot consume
# UNIX sockets and the host firewall explicitly blocks 8080.
```

## Version Notes

`mi_datagram`'s `socket_name` parameter syntax is stable across OpenSIPS 3.2 through 3.6. The supported transport prefixes (`unix:`, `udp:`, `tcp:`) have not changed.

Some 3.x releases added support for an additional UNIX socket parameter for permission control directly in the modparam — when available, prefer that to external `chmod` to keep socket setup atomic with cfg changes.

## False-Positive Considerations

- **`udp:127.0.0.1:8080` on a single-tenant host.** Loopback UDP is functionally local. The rule fires at reduced confidence and severity on this case; suppress with `justification="loopback UDP, single-tenant host, automation requires UDP not UNIX"` after confirming the host firewall blocks the port.
- **Documented private-network deployments.** Some operators run `mi_datagram` on a management VLAN with strict L2 isolation. As with MI_EXPOSURE-001, internal-network is not authentication; suppress only with an explicit trust-boundary documentation.
- **Lab and CI fixtures.** Test cfgs that bind `udp:0.0.0.0` for ease of automation should suppress with `expires` matching the lab's lifecycle. The rule fires correctly because the cfg may be promoted to production unchanged.

## Related Rules

- `OSIPS-SEC-MI_EXPOSURE-001` (mi-http-public-bind) — HTTP-transport equivalent.
- `OSIPS-SEC-MI_EXPOSURE-003` (mi-no-trusted-clients) — defense-in-depth allow-list.
- `OSIPS-SEC-MI_EXPOSURE-004` (mi-xmlrpc-no-auth) — deprecated MI transport.
- `OSIPS-SEC-CONFIG_HYGIENE-003` — filesystem permissions on the unix socket directory.

## Additional References

- Phase 3 gap analysis §D.1
- OpenSIPS mi_datagram module: https://opensips.org/docs/modules/3.4.x/mi_datagram.html
- VoIPGRID opensips_exporter issue documenting UDP listener confusion: https://github.com/VoIPGRID/opensips_exporter/issues/13
- CWE-306 — Missing Authentication for Critical Function
- CWE-732 — Incorrect Permission Assignment for Critical Resource
