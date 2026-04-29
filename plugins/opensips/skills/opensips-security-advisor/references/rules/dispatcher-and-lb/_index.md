# Dispatcher and Load Balancer

Rules in this family target dispatcher and load-balancer hardening: gateway authentication, group-id scoping, and unauthenticated administrative reload paths.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-LB-001 | dispatcher destination set used without ds_mark_dst / failover failure_route | medium |
| OSIPS-SEC-LB-002 | load_balancer used to route inbound traffic without source-trust admission check | high |
| OSIPS-SEC-LB-003 | drouting do_routing without max_attempts cap — unbounded fallback iterations | low |
