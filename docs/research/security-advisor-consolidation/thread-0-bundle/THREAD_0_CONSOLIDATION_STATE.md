# THREAD_0_CONSOLIDATION_STATE.md

**Chat identity.** Thread 0 — Consolidation thread for OpenSIPS Security Advisor.
**Run date.** 2026-04-28 (single session).
**Bundle filename.** `THREAD_0_CONSOLIDATION_BUNDLE.zip`
**Companion state file.** This document (`THREAD_0_CONSOLIDATION_STATE.md`).

---

## Purpose of this thread

Reconcile authoring outputs from Chats A, B, and C into one unified
project tree. Mechanical merge — no new specs, rules, fixtures, or
SKILL.md authored. Conflict resolution per the rules in
`THREAD_0_CONSOLIDATION_PROMPT.md`.

## Inputs received

| File | Source | Bytes |
|---|---|---|
| `CHAT_A_OUTPUT_phase6a-foundation-specs.zip` | Chat A — Tier 0/1/2 specs | ~92 KB |
| `opensips-advisor.zip` | Chat B — 3 specs + 2 saved rules + manifest | ~22 KB |
| `opensips-advisor-session-bundle.zip` | Chat C — 5 specs + 2 saved rules + 6 fixtures + 3 goldens + manifest | ~71 KB |
| `opensips-advisor-file-manifest.md` | Locked manifest | ~42 KB |

All four extracted and merged. No input was lost — overridden content
is preserved verbatim under `_orphans/`.

## Outputs produced

| Path | Status |
|---|---|
| `opensips-security-advisor/` (38 files) | Unified canonical tree |
| `opensips-security-advisor/RECONCILIATION_LOG.md` | Full conflict-resolution record (~12 KB) |
| `opensips-security-advisor/_orphans/` | Quarantined alternates with README |
| `opensips-security-advisor-consolidated.zip` | Zip of the canonical tree (~205 KB) |
| `THREAD_0_CONSOLIDATION_BUNDLE.zip` | Self-describing bundle (this file + tree) |
| `THREAD_0_CONSOLIDATION_STATE.md` | This document |

## Brief items 1–10 — terminal status

| # | Item | State |
|---|---|---|
| 1 | Directory naming `10_overview/` → `10_architecture/` | Closed |
| 2 | Delete redundant Chat B addendum (verify field present) | Closed; field verified, prose preserved in `_orphans/` |
| 3 | Fold OR-list semver into `14_VERSION_STRATEGY.md` | Closed; +30 lines |
| 4 | Doc 15 + Doc 22 + `exercises_abstain_on` fold | Closed; minimum-surgical fix-pointer block added (60 lines) |
| 5 | Accept `16_TAINT_MODEL.md` as Tier 1 extension | Closed; placed + status row + manifest entry |
| 6 | Rule ID rewrite to long form | Closed; 9 references rewritten across 7 files |
| 7 | Duplicate-authored rules merge | Closed (degenerate); Chat B drafts not on disk, Chat C versions stand uncontested |
| 8 | Phase 5 placeholder sweep | TODO recorded for Thread 2; 14 placeholders catalogued |
| 9 | Golden-report re-render | **Partially closed — see "Open project decisions" below** |
| 10a | `cancel_if_present` schema primitive | Deferred to v2; v1 workaround documented |
| 10b | CVSS aggregation policy | Closed; worst-case-across-modules added to §4.6 |
| 10c | Taint-source coverage | Backlog item for Phase 6b |
| 10d | SQL injection fan-out (INJ-002/003/004) | Deferred to Thread 1 |

## Open project decisions (require your input before Threads 1/2 launch)

### 1. Hardening-index formula conflict (item 9 — UNRESOLVED)

The brief locked Chat A's Doc 22 in item 4 but predicted re-rendered
scores that only compute under Chat C's formula. The two formulas
disagree on weights and mechanics:

| | Chat A (now canonical) | Chat C (overridden) |
|---|---|---|
| Critical | 25 | 20 |
| Medium | 4 | 6 |
| Low | 1 | 3 |
| Review_required | flat 2 | severity_would_be × 0.5 |
| Floor | L1+nocrit=35 added back | none |
| Flat penalty | none | −3 if rr>1 + public-facing |

Current state of the goldens:
- `golden_clean_l1`: 98 → **100** (Chat A formula; matches brief).
- `golden_vulnerable_mixed`: 22 → **35** (Chat A formula; brief
  predicted 12, which is Chat C's formula).
- `golden_tricky_abstention`: left at **71** per brief, but 71 only
  derives from Chat C's formula; Chat A's formula yields 100.

Knock-on: `expected_hardening_index_range` in all three fixtures was
authored against Chat C's formula and is now inconsistent with the
canonical formula. Vulnerable's range `[18, 28]` rejects 35.

**Decision needed:** α keep Chat A's formula + fix ranges + re-render
tricky to 100; β swap in Chat C's formula (beyond brief's
authorization); γ defer to v2 hybrid.

### 2. `golden_tricky_abstention` prose contradicts canonical formula

The report's narrative explains 71 by referencing "a small flat
penalty when review_required count > 1 on a public-facing
deployment" — that mechanic exists in Chat C's formula but not in
Chat A's now-canonical one. The report self-references a formula it
no longer derives from. Whichever option you pick above, this prose
will need editing.

### 3. Information loss on the `suppressible` field

Chat B's deleted addendum carried prose Chat A's one-line table entry
doesn't: a four-criterion test for `suppressible: false`, an
interaction matrix with `automated`, the rule that
`automated:false + suppressible:false` is invalid, an expected ratio.
Preserved in `_orphans/chat_b_overridden/`. Recommend a future spec
pass folds the criteria/matrix into `23_SUPPRESSION_PROTOCOL.md`.

## Bundle contents

```
THREAD_0_CONSOLIDATION_BUNDLE.zip
├── THREAD_0_CONSOLIDATION_STATE.md     ← this file
├── RECONCILIATION_LOG.md                ← detailed conflict log
└── opensips-security-advisor/           ← canonical tree (38 files)
    ├── 00_project/                       (4 files: + 03_FILE_MANIFEST.md)
    ├── 10_architecture/                  (7 files: + 16_TAINT_MODEL.md)
    ├── 20_runtime/                       (5 files; 21 + 22 modified)
    ├── 30_rules/                         (4 files in 3 families: auth, injection, mi_exposure)
    ├── 50_fixtures/                      (9 files: 3 cfg + 3 expected.json + 3 golden reports)
    ├── _orphans/                         (8 files: 7 alternates + README)
    └── RECONCILIATION_LOG.md
```

## Files modified vs unchanged

**Chat A docs modified (3 of 14, surgical edits only):**
- `10_architecture/12_RULE_CATALOG_SCHEMA.md` — `## Test fixture pointers` H2 added (item 4)
- `10_architecture/14_VERSION_STRATEGY.md` — OR-list semver added (item 3)
- `20_runtime/21_ANALYSIS_PIPELINE.md` — CVSS aggregation paragraph at §4.6 (item 10b)

**Chat A docs unchanged (11 of 14):** all of `00_project/01_CHARTER`,
`00_project/02_GLOSSARY`, `10_SKILL_STACK`, `11_FINDING_SCHEMA`,
`13_PROFILE_MODEL`, `15_CONFIDENCE_AND_VERIFICATION`,
`20_INTAKE_PROTOCOL`, `22_REPORT_TEMPLATES`, `23_SUPPRESSION_PROTOCOL`,
`24_INTERACTION_PATTERNS`, `00_README` (one row added in status table).

**Chat B accepted:**
- `16_TAINT_MODEL.md` (full, placed canonically)
- `OSIPS-SEC-AUTH-001.md`, `OSIPS-SEC-AUTH-002.md` (already long-form)

**Chat B overridden / preserved in `_orphans/chat_b_overridden/`:**
- `12_RULE_CATALOG_SCHEMA_addendum.md`
- `14_VERSION_STRATEGY.md` (Chat B's draft; OR-list extracted)

**Chat C accepted:**
- 2 rules with ID rewrite (`INJ-001` → `INJECTION-001`, `MI-001` → `MI_EXPOSURE-001`)
- 6 fixture files (3 .cfg + 3 .expected.json with ID rewrites)
- 3 golden reports with ID rewrites; 2 of 3 re-rendered for hardening score

**Chat C overridden / preserved in `_orphans/chat_c_alternate_specs/`:**
- `11_DATA_MODEL.md`, `13_RULE_AUTHORING.md`, `14_DETECTION_ENGINE.md` (out-of-manifest)
- `15_CONFIDENCE_AND_VERIFICATION_chat_c.md`, `22_REPORT_TEMPLATES_chat_c.md` (overridden by Chat A)

## Sequencing handoff

```
0 (this thread, complete) → (1 ∥ 2) → 3
```

**Thread 1 (rules + fixtures author).** Read `RECONCILIATION_LOG.md`
items 7, 9, 10c, 10d before starting. The hardening-formula decision
(item 9) blocks any new fixture authoring with hardening assertions.
Chat B drafted ~58 rules in chat that never landed on disk; if you
have access to that transcript, harvest before re-authoring.

**Thread 2 (Phase 5 imports + version overlays).** Read items 8 and
9. Item 8 has a 14-row TODO table to resolve once
`90_reference/03_advisor_methodology_research.md` lands.

**Thread 3 (`SKILL.md`).** Wait for Threads 1 and 2 to complete.
Both items 8 and 9 may shift what the skill points at.

## Verification performed

- All four input zips extracted; file counts match expectations from project memory.
- Final tree: 38 files, 0 short-form rule IDs in canonical scope (all rewritten).
- Sanity checks all pass:
  - Doc 4 has fixture-pointer section (`exercises_abstain_on` present).
  - Doc 14 has OR-list semver.
  - §4.6 has CVSS aggregation note.
  - 16_TAINT_MODEL row present in 00_README.
  - Chat B's addendum absent from canonical, preserved in orphans.
- Hardening scores: clean = 100, vulnerable = 35, tricky = 71 (left per brief; off-formula and flagged).

## End of state log
