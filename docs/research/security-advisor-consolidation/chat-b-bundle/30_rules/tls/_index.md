# TLS

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-TLS-001 | tls_mgm verify_cert=0 — peer cert validation disabled | high | L1, L2 |
| OSIPS-SEC-TLS-002 | tls_mgm require_cert=0 on server-to-server listener | medium | L2 |
| OSIPS-SEC-TLS-003 | tls_mgm method allows SSLv3 / TLS 1.0 / TLS 1.1 | high | L1, L2 |
| OSIPS-SEC-TLS-004 | tls_mgm ciphers_list set to ALL / DEFAULT / HIGH | high | L1, L2 |
| OSIPS-SEC-TLS-005 | tls_mgm private_key in suspicious filesystem path | high | L1, L2 |
| OSIPS-SEC-TLS-006 | TLS used without explicit parameters or is_peer_verified() | medium | L2 |
| OSIPS-SEC-TLS-007 | proto_wss without Origin allow-list | medium | L1, L2 |

The `tls` family covers TLS-layer correctness for OpenSIPS' SIP transport — peer
certificate validation, mTLS posture, protocol version selection, cipher-suite
strength, private-key filesystem permissions, defense-in-depth script checks, and
WebSocket Origin enforcement. The threat model assumes a network-adjacent attacker
capable of MITM positions, plus browser-mediated cross-origin attacks against the
WebSocket transport.

OpenSIPS' TLS configuration lives primarily on `tls_mgm` (the modern unified TLS
management module that replaced the older `tls` module in the 3.x series). The
`httpd` module has its own independent TLS parameters covered in the `mi_exposure`
family — the `tls_mgm` configuration does NOT apply to `httpd`.

## See also

- `30_rules/auth/_index.md` — auth-layer compensation when TLS authentication is partial
- `30_rules/mi_exposure/_index.md` — `httpd` TLS is independent of `tls_mgm`
- `30_rules/identity_spoofing/_index.md` — identity headers compound with TLS posture
