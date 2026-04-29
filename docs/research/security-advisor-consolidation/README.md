# Security Advisor Consolidation — Research Archive

This directory preserves the raw research output from three independent
authoring agents (Chats A, B, C) and the Thread 0 consolidation pass
that fed into `opensips-security-advisor` v1.

**Status:** Archive only. Not consumed at runtime by any skill. Preserved
because the canonical reference docs in
`plugins/opensips/skills/opensips-security-advisor/references/` are
distillations of this material — when in doubt about provenance,
read here.

## Contents

| Folder | What it is |
|---|---|
| `chat-a-bundle/` | Chat A — 14 foundation specs (Tier 0/1/2 architecture + runtime). Locked. |
| `chat-b-bundle/` | Chat B — 58 rules across 12 domains, sanitizer registry, alternate specs. Source of v1's rule catalog. |
| `chat-c-canonical-tree/` | Chat C / Thread 0 — partial consolidated tree (4 rules + fixtures + version notes + master vulnerability reference). |
| `thread-0-bundle/` | Thread 0 self-describing archive (state file). |
| `thread-0-state.md` | Thread 0 state log — records merge decisions. |
| `reconciliation-log.md` | Per-file conflict resolution record. |
| `chat-c-activity-log.md` | Chat C session journal — context for what Chat C did and why. |

## Open issues quarantined as "research-only"

The following Thread 0 open issues are **out of scope for v1** by spec
decision. They are documented here for traceability:

- Hardening-index formula conflict — v1 ships without a hardening
  index. Both formulas (Chat A and Chat C) live in their respective
  bundles for future research.
- `suppressible` field information loss — the four-criterion test from
  Chat B's overridden addendum is preserved in
  `chat-c-canonical-tree/_orphans/chat_b_overridden/`.
- Phase 5 placeholder TBDs in Chat A specs — not propagated into
  canonical reference docs; resolved by citation or omission during
  consolidation.

See `docs/superpowers/specs/2026-04-29-opensips-security-advisor-v1-design.md`
for the v1 scope boundary, and ADR-014 for the design rationale.
