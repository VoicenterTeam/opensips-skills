# Dispatcher and Load Balancer

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-DISPATCHER_AND_LB-001 | dispatcher without failover validation | medium | L2 |
| OSIPS-SEC-DISPATCHER_AND_LB-002 | load_balancer without source-trust admission | high | L1, L2 |
| OSIPS-SEC-DISPATCHER_AND_LB-003 | drouting do_routing without attempt cap | low | L2 |

The `dispatcher_and_lb` family covers correctness for traffic-distribution modules:
dispatcher, load_balancer, and drouting. Rules cover failover-validation, source-trust
admission, and fallback-iteration caps.

## See also

- `30_rules/relay_and_routing/_index.md` — DISPATCHER_AND_LB-002 is the LB analog of open-relay
- `30_rules/dos_defense/_index.md` — failover-iteration class overlaps with rate/cap defenses
- `30_rules/auth/_index.md` — admission to LB-fronted backends depends on auth correctness
