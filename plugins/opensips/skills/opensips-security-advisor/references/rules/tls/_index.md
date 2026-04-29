# TLS

Rules in this family target TLS posture: cipher suite selection, certificate verification, peer-name verification, and TLS listener scope.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-TLS-001 | tls_mgm verify_cert=0 — peer certificate validation disabled, MITM exposed | high |
| OSIPS-SEC-TLS-002 | tls_mgm require_cert=0 on server-to-server listener — anonymous TLS clients accepted | medium |
| OSIPS-SEC-TLS-003 | tls_mgm method allows SSLv3, TLS 1.0, or TLS 1.1 — protocol downgrade exposure | high |
| OSIPS-SEC-TLS-004 | tls_mgm ciphers_list set to ALL, DEFAULT, or other permissive specs — weak suites enabled | high |
| OSIPS-SEC-TLS-005 | tls_mgm private_key path indicates world-readable or shared-PEM filesystem permissions | high |
| OSIPS-SEC-TLS-006 | TLS-using cfg has no script-level is_peer_verified() check or relies on tls_mgm defaults | medium |
| OSIPS-SEC-TLS-007 | proto_wss accepts WebSocket connections without Origin allow-list | medium |
