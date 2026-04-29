# DoS Defense

Rules in this family target denial-of-service defenses: rate limiting, flood protection, parser hardening, and pike/ratelimit module configuration.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-DOS-001 | pike module not loaded — no per-source request-rate limiting | medium |
| OSIPS-SEC-DOS-002 | ratelimit module not loaded or not used to gate request_route — no global rate limiting | medium |
| OSIPS-SEC-DOS-003 | ratelimit loaded but pike not loaded — single-source flooding unbounded | medium |
| OSIPS-SEC-DOS-004 | pike rejection branch calls send_reply() instead of drop() — leaks timing signal | low |
| OSIPS-SEC-DOS-005 | dialog module loaded but no per-AoR or global concurrent-dialog cap | medium |
