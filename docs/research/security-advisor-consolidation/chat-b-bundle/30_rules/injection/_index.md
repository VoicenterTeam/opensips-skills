# Injection

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-INJECTION-001 | SIP-sourced PV → avp_db_query without s.escape.common | high | L1, L2 |
| OSIPS-SEC-INJECTION-002 | SIP-sourced PV → sqlops raw sql_query() on 3.5+ | high | L1, L2 |
| OSIPS-SEC-INJECTION-003 | SIP-sourced PV → exec_msg/exec_dset/exec_avp command | critical | L1, L2 |
| OSIPS-SEC-INJECTION-004 | exec_avp/exec_dset captured output → privileged sink without re-validation | high | L1, L2 |
| OSIPS-SEC-INJECTION-005 | SIP-sourced PV → cachedb_* key/value without validation | medium | L1, L2 |
| OSIPS-SEC-INJECTION-006 | SIP-sourced PV → append_hf/replace_hdrs without CRLF stripping | high | L1, L2 |

The `injection` family covers script-layer vulnerabilities where attacker-controlled SIP
pseudo-variables flow into privileged sinks — SQL queries, shell commands, cache keys,
header constructions — without sanitization. The shared structural property is the
unsafe data flow from a SIP-sourced taint source to a sink that interprets the value as
code, command, query syntax, or protocol structure. Most injection findings are
pre-authentication because the taint sources (`$fU`, `$tU`, `$rU`, headers) are read on
the very first inbound message.

CVE-2026-25554 (the AISLE-discovered `auth_jwt` SQLi) is a specific in-module instance
of the SQLi class catalogued here as `OSIPS-SEC-INJECTION-001`. CVE coverage lives in
the `auth` family (`OSIPS-SEC-AUTH-004`) because the entry point is auth-specific; this
family covers the broader script-author surface.

## See also

- `30_rules/auth/_index.md` — auth-entry-point variants (CVE-2026-25554, jwt-kid-injection)
- `30_rules/identity_spoofing/_index.md` — IDENTITY_SPOOFING-003 overlaps with INJECTION-006
- `30_rules/tracing_and_logging/_index.md` — TRACING_AND_LOGGING-004 is the acc analog of INJECTION-006
- `10_overview/16_TAINT_MODEL.md` — taint-source set, sanitizer set, sink set
