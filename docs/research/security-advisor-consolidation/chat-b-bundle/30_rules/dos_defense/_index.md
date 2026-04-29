# DoS Defense

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-DOS_DEFENSE-001 | pike not loaded — no per-source rate limiting | medium | L1, L2 |
| OSIPS-SEC-DOS_DEFENSE-002 | ratelimit not loaded — no global rate limiting | medium | L2 |
| OSIPS-SEC-DOS_DEFENSE-003 | ratelimit loaded but pike not — asymmetric posture | medium | L1, L2 |
| OSIPS-SEC-DOS_DEFENSE-004 | rate-limit rejection uses send_reply instead of drop | low | L1, L2 |
| OSIPS-SEC-DOS_DEFENSE-005 | dialog loaded but no concurrent-call cap | medium | L2 |

The `dos_defense` family covers script-layer rate-limiting and resource-cap defenses
against flooding, reflection attacks, and concurrent-call abuse. Defenses are layered:
pike denies single-source amplification; ratelimit denies aggregate amplification;
concurrent-dialog caps deny held-state abuse; silent drop denies reconnaissance feedback.
Network-layer DDoS protection compensates partially; this family covers what the cfg
itself enforces.

## See also

- `30_rules/auth/_index.md` — digest-leak oracle compounds with rate-limit absence
- `30_rules/relay_and_routing/_index.md` — max-forwards is loop-class DoS, complementary
- `30_rules/mi_exposure/_index.md` — MI exposure undermines DoS defenses
