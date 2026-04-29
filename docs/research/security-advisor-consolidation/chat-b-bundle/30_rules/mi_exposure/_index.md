# MI Exposure

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-MI_EXPOSURE-001 | mi_http / httpd bound to non-loopback | critical | L1, L2 |
| OSIPS-SEC-MI_EXPOSURE-002 | mi_datagram bound to udp:/tcp: socket | critical | L1, L2 |
| OSIPS-SEC-MI_EXPOSURE-003 | MI module loaded without trusted-clients allow-list | medium | L2 |
| OSIPS-SEC-MI_EXPOSURE-004 | Deprecated mi_xmlrpc loaded on 3.x | high | L1, L2 |
| OSIPS-SEC-MI_EXPOSURE-005 | httpd configured without TLS on non-loopback bind | medium | L2 |

The `mi_exposure` family covers the OpenSIPs Management Interface — the administrative
control plane that exposes commands like `ul_dump`, `ul_rm`, `dlg_end_dlg`, `reload_routes`,
and the full statistics surface. The MI modules (`mi_http`, `mi_datagram`, the underlying
`httpd`, the legacy `mi_xmlrpc`) provide no built-in authentication by design — the
trust boundary is operator-established via bind discipline, filesystem permissions
(for unix sockets), reverse-proxy authentication, or network ACLs.

Rules in this family detect failure modes in that operator-established boundary: bind
to non-loopback addresses, socket types that bypass filesystem permissions, missing
defense-in-depth allow-lists, deprecated modules with unmaintained code paths, and
cleartext-channel exposure.

The Phase 3 gap analysis identifies MI exposure as one of the top-3 critical gaps in
the OpenSIPS security posture because the failure mode is binary and the blast radius
is full administrative compromise.

## See also

- `30_rules/auth/_index.md` — auth flow correctness; adjacent threat model
- `30_rules/tls/_index.md` — TLS posture across the cfg's TLS-using modules
- `30_rules/config_hygiene/_index.md` — cleartext credentials in modparams (which MI can introspect)
