# Identity Spoofing

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-IDENTITY_SPOOFING-001 | proxy_authorize without db_check_from | high | L1, L2 |
| OSIPS-SEC-IDENTITY_SPOOFING-002 | uac_replace before acc | medium | L2 |
| OSIPS-SEC-IDENTITY_SPOOFING-003 | PAI from $fU or other taint source | high | L1, L2 |

The `identity_spoofing` family covers script-layer correctness for identity handling:
From/To URI binding to authenticated identity, accounting capture ordering relative
to identity rewrites, and PAI construction from trusted sources.

## See also

- `30_rules/auth/_index.md` — IDENTITY_SPOOFING-001 is the immediate post-auth concern
- `30_rules/stir_shaken/_index.md` — PAI errors propagate into attestation
- `30_rules/tracing_and_logging/_index.md` — IDENTITY_SPOOFING-002 affects acc trail
- `30_rules/injection/_index.md` — IDENTITY_SPOOFING-003 overlaps with INJECTION-006
