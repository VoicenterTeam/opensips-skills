# Relay and Routing

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-RELAY_AND_ROUTING-001 | t_relay() reachable without is_myself / source-trust | critical | L1, L2 |
| OSIPS-SEC-RELAY_AND_ROUTING-002 | Preloaded Route headers from foreign UACs accepted | high | L1, L2 |
| OSIPS-SEC-RELAY_AND_ROUTING-003 | permissions trust group contains wildcard | critical | L1, L2 |
| OSIPS-SEC-RELAY_AND_ROUTING-004 | record_route() on REGISTER or MESSAGE | low | L2 |
| OSIPS-SEC-RELAY_AND_ROUTING-005 | mf_process_maxfwd_header() missing or permissive | medium | L1, L2 |

The `relay_and_routing` family covers script-layer vulnerabilities in OpenSIPS' request
forwarding and routing decisions: open-relay class (toll fraud), preloaded-Route
manipulation, trust-group wildcard misconfiguration, no-op routing primitives, and
Max-Forwards loop protection. The OpenSIPS canonical residential template implements
the correct pattern for each concern; rules here detect deviations from that pattern.

## See also

- `30_rules/auth/_index.md` — auth-after-routing is the auth-specific subset of open-relay
- `30_rules/dos_defense/_index.md` — max-forwards complements rate-limit defenses
- `30_rules/tls/_index.md` — mTLS compensates partially for source-IP trust gaps
