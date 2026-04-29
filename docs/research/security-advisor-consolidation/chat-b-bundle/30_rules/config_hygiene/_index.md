# Config Hygiene

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-CONFIG_HYGIENE-001 | Cleartext credentials in modparam | medium | L1, L2 |
| OSIPS-SEC-CONFIG_HYGIENE-002 | Module loaded but unused | low | L1, L2 |
| OSIPS-SEC-CONFIG_HYGIENE-003 | mi_datagram unix socket in suspicious path | medium | L1, L2 |
| OSIPS-SEC-CONFIG_HYGIENE-004 | startup_route invokes exec | medium | L1, L2 |

The `config_hygiene` family covers cfg-quality concerns that aren't directly
exploitable as primary vulnerabilities but expand attack surface, complicate
audit, or introduce supply-chain / privilege-related risks.

## See also

- `30_rules/tls/_index.md` — TLS-005 (key permissions) is the TLS-specific instance
- `30_rules/mi_exposure/_index.md` — modparam credentials exfiltratable via MI
- `30_rules/injection/_index.md` — INJECTION-003/-004 are request-time exec
