# Relay and Routing

Rules in this family target open-relay risks, loop detection, and routing-loop hygiene: max_forwards handling, loose-route enforcement, and relay-policy gates.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-RELAY-001 | t_relay() reachable without is_myself() / source-trust check — open relay enabling toll fraud | critical |
| OSIPS-SEC-RELAY-002 | Preloaded Route headers from foreign UACs accepted — egress-path manipulation | high |
| OSIPS-SEC-RELAY-003 | permissions trust group contains 0.0.0.0/0 — universal source-IP trust | critical |
| OSIPS-SEC-RELAY-004 | record_route() called on REGISTER or MESSAGE — wasted state and topology disclosure | low |
| OSIPS-SEC-RELAY-005 | mf_process_maxfwd_header() not called or called with high limit — loop amplification / DoS | medium |
