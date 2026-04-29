# Authentication

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-AUTH-001 | Plaintext HA1 storage enabled in auth_db | high | L1, L2 |
| OSIPS-SEC-AUTH-002 | t_relay() reachable on INVITE before proxy_authorize() | high | L1, L2 |
| OSIPS-SEC-AUTH-003 | www_authorize/proxy_authorize return value ignored or no challenge issued | high | L1, L2 |
| OSIPS-SEC-AUTH-004 | auth_jwt in DB mode on vulnerable version (CVE-2026-25554) | critical | L1, L2 |
| OSIPS-SEC-AUTH-005 | Authentication challenge issued without source check or rate-limit | high | L2 |
| OSIPS-SEC-AUTH-006 | nonce_expire too long or qop disabled | medium | L1, L2 |
| OSIPS-SEC-AUTH-007 | auth_jwt loaded without explicit algorithm pinning | critical | L1, L2 |
| OSIPS-SEC-AUTH-008 | JWT claim flows into SQL/file/REST sink before signature verification | high | L1, L2 |

The `auth` family covers script-layer vulnerabilities in OpenSIPS' authentication flow:
digest authentication via the `auth` and `auth_db` modules, JWT-based authentication via
`auth_jwt`, and the structural patterns that determine whether an OpenSIPS configuration
enforces auth correctly, half-correctly, or not at all. Threat model assumes an attacker
who can send arbitrary SIP traffic to the listener, craft any header values, forge JWTs
with attacker-chosen claims, and capture network traffic when TLS is misconfigured. The
attacker cannot modify the OpenSIPS binary, read 0600-permissioned files on the host,
or bypass network-layer ACLs that block their source address.

CVE-2026-25554 (auth_jwt DB-mode SQLi) is catalogued here rather than in `injection/`
because the entry point is auth-specific, even though the sink is a SQL primitive.

## See also

- `30_rules/injection/_index.md` — SQLi class in the broader script-author surface
- `30_rules/identity_spoofing/_index.md` — From-binding to authenticated identity
- `30_rules/tls/_index.md` — TLS posture compounds when auth is the only line of defense
