# RECONCILIATION_LOG.md

**Thread.** 0 — consolidation
**Run date.** 2026-04-28
**Inputs.**
- Chat A: `CHAT_A_OUTPUT_phase6a-foundation-specs.zip` (14 spec docs across Tier 0/1/2)
- Chat B: `opensips-advisor.zip` (3 specs in `10_overview/`, 2 saved rules, `CONSOLIDATION_MANIFEST.md`)
- Chat C: `opensips-advisor-session-bundle.zip` (5 specs in `10_architecture/`, 2 saved rules, 6 fixture files, 3 golden reports, `MANIFEST_STATUS.md`)
- Locked manifest: `opensips-advisor-file-manifest.md`

**Output.** `/mnt/user-data/outputs/opensips-security-advisor/` and `…-consolidated.zip`.

**Scope discipline.** No new specs, rules, fixtures, or `SKILL.md` written.
This thread reconciles existing artifacts. Edits to Chat A's docs are
restricted to the three explicitly-authorized surgical changes
(items 3, 4, 10b). Two unresolved items (9, formula conflict; 8,
Phase 5 placeholders) are flagged for downstream threads with TODO lists.

---

## Item 1 — Directory naming

**Conflict.** Chat B's bundle put architectural specs under
`10_overview/`. Chat A and Chat C used `10_architecture/`. The
locked manifest specifies `10_architecture/`.

**Resolution.** Chat B's `10_overview/12_RULE_CATALOG_SCHEMA_addendum.md`,
`10_overview/14_VERSION_STRATEGY.md`, and `10_overview/16_TAINT_MODEL.md`
were renamed/relocated. Of those:
- The addendum was deleted from the canonical tree per item 2 (preserved at
  `_orphans/chat_b_overridden/12_RULE_CATALOG_SCHEMA_addendum.md`).
- `14_VERSION_STRATEGY.md` was overridden by Chat A's canonical version per
  item 3, with the OR-list semver pattern folded in (preserved at
  `_orphans/chat_b_overridden/14_VERSION_STRATEGY.md`).
- `16_TAINT_MODEL.md` was placed at canonical
  `10_architecture/16_TAINT_MODEL.md` per item 5.

**Diff.** `10_overview/` directory does not exist in the canonical tree.

---

## Item 2 — `12_RULE_CATALOG_SCHEMA_addendum.md`

**Conflict.** Chat B authored a standalone addendum defining the
`suppressible` field. Chat A's canonical `12_RULE_CATALOG_SCHEMA.md`
already declares `suppressible` in its frontmatter table (line 97 of
the original) and uses it in the worked exemplar (line 471).

**Resolution.** Chat B's addendum deleted from canonical tree per
brief direction. Field presence in Chat A's schema was verified before
deletion.

**Information loss flagged.** Chat B's addendum contained substantive
prose absent from Chat A's one-line table entry:
- A four-criterion test for when to set `suppressible: false`.
- An interaction matrix with the `automated` field, including the rule
  that `automated:false, suppressible:false` is an invalid combination.
- A migration note.
- An expected catalog ratio (~90% suppressible / ~10% non-suppressible).
The addendum is preserved at
`_orphans/chat_b_overridden/12_RULE_CATALOG_SCHEMA_addendum.md`.

**Recommended follow-up.** A future spec-revision pass should consider
folding the criteria + matrix material into either
`12_RULE_CATALOG_SCHEMA.md` or `23_SUPPRESSION_PROTOCOL.md`. The
matrix in particular (the `automated:false, suppressible:false` rejection
rule) is a validator constraint that Chat A's doc does not currently
encode, and rule-authoring chats may unknowingly produce invalid
combinations without it.

**Diff.** No file at `10_architecture/12_RULE_CATALOG_SCHEMA_addendum.md`.

---

## Item 3 — `14_VERSION_STRATEGY.md` OR-list semver fold

**Conflict.** Both Chat A and Chat B authored the version strategy
doc. Chat A's is canonical and more comprehensive. Chat B's
contribution that survives is the OR-list semver pattern for
multi-branch CVE rules:
`">=3.4.0 <3.4.7 || >=3.5.0 <3.5.4 || >=3.6.0 <3.6.4"`.

**Resolution.** Folded into Chat A's `14_VERSION_STRATEGY.md`
"How per-rule version gating works" section. Two surgical changes:

1. Added a new example to the "Common patterns" code block:
   `applies_if_opensips_version: ">=3.4.0 <3.4.7 || >=3.5.0 <3.5.4 || >=3.6.0 <3.6.4"`
   with comment `# OR-list — multiple disjoint ranges (multi-branch CVE rules)`.

2. Added two new bullets to "Range evaluation rules" subsection:
   - **Whitespace inside a sub-range forms an AND** (intersection).
   - **`||` between sub-ranges forms an OR** (disjunction), with the rationale
     for OR-list as the canonical encoding for multi-branch CVE rules and a
     note that backport release numbers must be confirmed (not speculated)
     before they enter the OR-list.

3. Updated the validator note: "The validator accepts both single-range
   and OR-list forms."

**Diff.** `10_architecture/14_VERSION_STRATEGY.md` lines 102–162 (in the
consolidated tree) replace lines 102–137 of Chat A's input. Net change:
+30 lines of OR-list documentation. Validation rule 9 in
`12_RULE_CATALOG_SCHEMA.md` is unchanged (it already accepts any valid
semver range, which Chat B's grammar extends without breaking).

---

## Item 4 — Doc 15 + Doc 22 + `exercises_abstain_on`

**Conflict.** Chat A and Chat C both authored `15_CONFIDENCE_AND_VERIFICATION.md`
and `22_REPORT_TEMPLATES.md`. Brief specifies Chat A's versions are canonical.
Chat C added an `exercises_abstain_on:` field to fixture-pointer schema
mid-session.

**Resolution.**
- Chat A's `15_CONFIDENCE_AND_VERIFICATION.md` filed canonically at
  `10_architecture/15_CONFIDENCE_AND_VERIFICATION.md`.
- Chat A's `22_REPORT_TEMPLATES.md` filed canonically at
  `20_runtime/22_REPORT_TEMPLATES.md`.
- Chat C's same-named docs preserved at
  `_orphans/chat_c_alternate_specs/15_CONFIDENCE_AND_VERIFICATION_chat_c.md`
  and `_orphans/chat_c_alternate_specs/22_REPORT_TEMPLATES_chat_c.md` for
  traceability.
- The `exercises_abstain_on` field was folded into Chat A's
  `12_RULE_CATALOG_SCHEMA.md` as a new H2 section
  `## Test fixture pointers`, placed after `## Body — optional H2 sections`
  and before `## Naming convention`.

**Note on the structural mismatch.** Chat A's schema doc does not
discuss fixture-pointer YAML at all (Chat A folds rule-fixture
relationships into `50_fixtures/README.md` instead). Chat C's
`exercises_abstain_on` field lives inside a fixture-pointer YAML block.
A literal "fold only that detail" was not possible because Chat A's
doc has no fixture-pointer block to fold the field INTO. The minimum
surgical addition was a small new H2 introducing the fixture-pointer
block format with both `exercises_fp_class` and `exercises_abstain_on`
defined (the field cannot stand alone without its sibling for context).
Approximate addition: 60 lines.

**Diff.** `10_architecture/12_RULE_CATALOG_SCHEMA.md` gains a
`## Test fixture pointers` H2 between line 343 and line 344 of Chat A's
input. The new section explicitly defines the abstention contract
("the rule must neither under-report (silent pass through unknown
sanitization) nor over-report (treat opaque transformations as
identity)") and ties to the validator's rule-status discipline
("a rule without at least one vulnerable pointer and one clean
pointer is draft status only").

---

## Item 5 — `16_TAINT_MODEL.md` accepted as Tier 1 extension

**Conflict.** Chat B authored `16_TAINT_MODEL.md`; not in the locked
manifest. Per Chat A's recommendation (cited in brief), accept as
Tier 1 extension.

**Resolution.**
- Placed at `10_architecture/16_TAINT_MODEL.md` (169 lines, ~11KB).
- Added one-line status row to `00_project/00_README.md`:
  `| 1 | 10_architecture/16_TAINT_MODEL.md | locked | Thread 0 (consolidation) — Tier 1 extension, accepted per Chat A's recommendation |`.
- Added entry to `00_project/03_FILE_MANIFEST.md` (the consolidated
  tree's copy of the locked manifest, updated to reflect Thread 0
  changes). Both the directory-layout box and the per-doc Tier 1
  section gained `16_TAINT_MODEL.md`.

**Diff.**
- `00_project/00_README.md` line 110 (insertion).
- `00_project/03_FILE_MANIFEST.md` directory-layout box gains the file;
  Tier 1 doc list gains a new `### 10_architecture/16_TAINT_MODEL.md`
  subsection (~30 lines) describing purpose, required contents,
  length, and dependencies.

**Note.** The original `opensips-advisor-file-manifest.md` (uploaded
input) is not modified. The consolidated tree's copy
(`03_FILE_MANIFEST.md`) is. Future authoring chats should treat the
in-tree `03_FILE_MANIFEST.md` as canonical.

---

## Item 6 — Rule ID convention rewrite

**Conflict.** Chat A's `12_RULE_CATALOG_SCHEMA.md` § Naming convention
locks long-form family names: "the module family in uppercase, with
underscores preserved (`MI_EXPOSURE`, `RELAY_AND_ROUTING`)." Chat C's
two saved rules used short forms (`OSIPS-SEC-INJ-001`,
`OSIPS-SEC-MI-001`). Chat B's saved rules already use the long form
(`OSIPS-SEC-AUTH-001`, `OSIPS-SEC-AUTH-002`) — `AUTH` is the same in
both conventions.

**Resolution.** Chat C's two rules and every reference to them
rewritten:
- `30_rules/injection/OSIPS-SEC-INJ-001.md` → `30_rules/injection/OSIPS-SEC-INJECTION-001.md` (filename + `id:` frontmatter)
- `30_rules/mi_exposure/OSIPS-SEC-MI-001.md` → `30_rules/mi_exposure/OSIPS-SEC-MI_EXPOSURE-001.md` (filename + `id:` frontmatter)
- `50_fixtures/clean/clean-l1-enterprise-pbx.expected.json`: 2 references rewritten (in `must_not_fire` array)
- `50_fixtures/vulnerable/vulnerable-mixed.expected.json`: 2 references rewritten (in `expected_findings[].rule_id`)
- `50_fixtures/tricky/custom-sanitizer.expected.json`: 3 references rewritten
- `50_fixtures/golden_reports/golden_clean_l1.md`: 0 references (verified clean)
- `50_fixtures/golden_reports/golden_tricky_abstention.md`: 4 references rewritten (1 frontmatter cite, 1 SARIF, 2 in suppression-record YAML)
- `50_fixtures/golden_reports/golden_vulnerable_mixed.md`: 2 references rewritten

**Verification.** `grep -rn "OSIPS-SEC-INJ-001\|OSIPS-SEC-MI-001"` in
the canonical tree (excluding `_orphans/`) returns zero hits.

**Note on Chat C's other rule IDs.** Chat C also references
`OSIPS-SEC-RELAY-001` (a draft Chat C never saved) in its
`13_RULE_AUTHORING.md` and in fixture `must_not_fire` arrays. Per the
manifest, the long form would be `OSIPS-SEC-RELAY_AND_ROUTING-001`.
This rule is in Thread 1's scope, not Thread 0's. The fixture
references were left as `OSIPS-SEC-RELAY-001` (Chat C's notation)
because Thread 1 will author the rule and may rename. The orphaned
`13_RULE_AUTHORING.md` references were not touched (file is in
`_orphans/`).

**Diff summary.**
- 2 files renamed.
- 2 frontmatter `id:` lines rewritten.
- 9 fixture/report references rewritten.

---

## Item 7 — Duplicate-authored rules

**Conflict.** Both Chat B (drafted in chat) and Chat C (saved to disk)
authored `mi-http-public-bind` and `sql-inj-avp-db-query`. Brief: take
Chat C's saved-to-disk versions as canonical, append any unique
content from Chat B's drafts.

**Resolution — degenerate merge.** Chat B's drafted-in-chat rules were
not persisted to `opensips-advisor.zip`. The bundle contains only
`OSIPS-SEC-AUTH-001.md` and `OSIPS-SEC-AUTH-002.md` under
`30_rules/auth/`. Chat B's `CONSOLIDATION_MANIFEST.md` confirms this
("Drafted in chat only (68 files): all of auth/003-008+_index, all of
injection/, mi_exposure/, …").

Therefore there are no Chat B file artifacts on disk to merge against
Chat C's saved versions for `mi-http-public-bind` or
`sql-inj-avp-db-query`. Chat C's versions stand uncontested.

**Action taken.** Chat C's two rules placed canonically (with long-form
ID rewrite per item 6):
- `30_rules/injection/OSIPS-SEC-INJECTION-001.md`
- `30_rules/mi_exposure/OSIPS-SEC-MI_EXPOSURE-001.md`

**Recommended follow-up.** Thread 1, when reviving Chat B's drafted
catalog from session transcript, should compare those two rules
against the now-canonical Chat C versions and harvest any unique
content (rationale prose, additional FP classes, alternative remediation
phrasings) before discarding the Chat B drafts. This was item 7's
intent; Thread 0 cannot perform it because Chat B's drafts are not on
disk.

---

## Item 8 — Phase 5 placeholder sweep TODO

**Source.** 14 placeholders in 4 docs (search:
`grep -rn "P5 §TBD\|\[P5"` in canonical tree).

**Status.** Open. Sweep happens in Thread 2 after Phase 5 reference
imports land in `90_reference/03_advisor_methodology_research.md`.
Thread 0 produces only the TODO list below.

| Doc | Line | Placeholder context |
|---|---:|---|
| `10_architecture/10_SKILL_STACK.md` | 16 | "comparative SAST methodology" |
| `10_architecture/10_SKILL_STACK.md` | 132 | "tool initialization conventions" |
| `10_architecture/10_SKILL_STACK.md` | 193 | "deterministic parser foundations for LLM-augmented" |
| `10_architecture/10_SKILL_STACK.md` | 242 | "rule catalog organization" |
| `10_architecture/10_SKILL_STACK.md` | 299 | "profile-based rule selection" |
| `10_architecture/10_SKILL_STACK.md` | 438 | "phase decomposition for LLM-augmented" |
| `10_architecture/10_SKILL_STACK.md` | 496 | "post-processing for LLM-emitted findings" |
| `10_architecture/10_SKILL_STACK.md` | 540 | "report taxonomy for security review" |
| `10_architecture/11_FINDING_SCHEMA.md` | 28 | "finding schema for [pre-LLM SAST output formats]" |
| `10_architecture/12_RULE_CATALOG_SCHEMA.md` | 30 | "rule catalog file format conventions" |
| `10_architecture/13_PROFILE_MODEL.md` | 18 | "profile-based rule selection in compliance frameworks" |
| `10_architecture/15_CONFIDENCE_AND_VERIFICATION.md` | 22 | "verification protocols for LLM-emitted findings" |
| `10_architecture/15_CONFIDENCE_AND_VERIFICATION.md` | 25 | "abstention as a first-class output in commercial" |
| `20_runtime/22_REPORT_TEMPLATES.md` | 15 | "report taxonomy for security review" |

**Thread 2 action.** For each row, locate the corresponding section in
`90_reference/03_advisor_methodology_research.md` (once imported) and
replace `[P5 §TBD — "<topic>"]` with the actual section reference (e.g.,
`[P5 §3.2 — "comparative SAST methodology"]`). If a topic has no
corresponding section in P5, flag in a follow-up RECONCILIATION_LOG_T2.md.

**Note.** Lines 132 / 193 / 242 / 299 / 438 / 496 / 540 in `10_SKILL_STACK.md`
are clustered around the layer-by-layer description; some may resolve to
the same P5 section.

---

## Item 9 — Golden-report math, with formula-conflict flag

**Conflict.** Brief specifies the locked formula in
`22_REPORT_TEMPLATES.md` and predicts re-rendered scores
`golden_clean_l1 → 100` and `golden_vulnerable_mixed → 12`, with
`golden_tricky_abstention` left at 71 ("is correct").

**Discovery.** Chat A's `22_REPORT_TEMPLATES.md` and Chat C's
overridden `22_REPORT_TEMPLATES.md` define **two different**
hardening-index formulas.

| | Chat A's (now canonical) | Chat C's (overridden, in `_orphans/`) |
|---|---|---|
| Critical weight | 25 | 20 |
| High weight | 10 | 10 |
| Medium weight | 4 | 6 |
| Low weight | 1 | 3 |
| Info weight | 0 | 0 |
| Review_required | 2 (flat) | severity_would_be × 0.5 |
| L1/L2 floor | 35 / 25 / 0, **added** to raw_score | (none) |
| Flat penalties | (none) | −3 if `count(rr) > 1 AND public-facing` |

The brief's predicted scores `100` and `12` only compute under
**Chat C's formula**, not Chat A's. The "tricky=71 is correct" claim
also only holds under Chat C's formula. The brief is internally
inconsistent: it locks Chat A's Doc 22 (item 4) but predicts scores
that require Chat C's formula.

**Decision (Path A — apply Chat A's formula faithfully).**
Per the brief's literal instruction ("the locked hardening-index
formula in 22_REPORT_TEMPLATES.md") and item 4's lock on Chat A's
Doc 22, Chat A's formula is canonical. Goldens were re-rendered using
Chat A's formula:

**`golden_clean_l1`** (L1, 0c/0h/0m/0l/3i/0rr):
```
penalty = 0·25 + 0·10 + 0·4 + 0·1 + 3·0 + 0·2 = 0
raw_score = 100 - min(0, 100) = 100
floor = 35  (L1, no critical)
hardening_index = min(100, max(0, 100 + 35)) = 100
```
Old value: **98**. New value: **100**. (Matches brief's prediction.)

**`golden_vulnerable_mixed`** (L1, 2c/3h/2m/2l/1i/0rr):
```
penalty = 2·25 + 3·10 + 2·4 + 2·1 + 1·0 + 0·2 = 50 + 30 + 8 + 2 + 0 + 0 = 90
raw_score = 100 - min(90, 100) = 10
floor = 25  (L1, has critical)
hardening_index = min(100, max(0, 10 + 25)) = 35
```
Old value: **22**. New value: **35**. (Brief predicted 12; brief was
applying Chat C's formula.)

**`golden_tricky_abstention`** (L1, 0c/1h/1m/0l/1i/2rr) — NOT modified
per brief, but the math doesn't compute under Chat A's formula either:
```
penalty = 0 + 10 + 4 + 0 + 0 + 4 = 18
raw_score = 100 - min(18, 100) = 82
floor = 35  (L1, no critical)
hardening_index = min(100, max(0, 82 + 35)) = 100
```
Existing value (left in place per brief): **71**. Under Chat A's
formula it would be **100**. Chat C's formula gives 71.

**Files re-rendered.**
- `50_fixtures/golden_reports/golden_clean_l1.md`:
  Line 15 (`**Hardening Index: 98 / 100**` → `**Hardening Index: 100 / 100**`)
  Line 109 (`"opensips-advisor/hardening_index": 98` → `100`)
- `50_fixtures/golden_reports/golden_vulnerable_mixed.md`:
  Line 15 (`**Hardening Index: 22 / 100**` → `**Hardening Index: 35 / 100**`)
  Line 577 (`"opensips-advisor/hardening_index": 22` → `35`)

**`golden_tricky_abstention.md` not modified.** Score remains 71. Under
Chat A's locked formula this is incorrect (should be 100). Flag for
Thread 1 / Thread 2 — see "Open issues from item 9" below.

**Open issues from item 9 (FOR DOWNSTREAM RESOLUTION):**

1. **Fixture range assertions are now broken.** All three fixtures'
   `expected_hardening_index_range` values were authored against
   Chat C's formula. Under Chat A's now-canonical formula:
   - `clean-l1-enterprise-pbx.expected.json`: range `[95, 100]`,
     actual `100` — **passes**.
   - `vulnerable-mixed.expected.json`: range `[18, 28]`, actual `35` —
     **FAILS**.
   - `custom-sanitizer.expected.json`: range `[68, 75]`, actual `100`
     under Chat A formula — **FAILS** (or `71` if `golden_tricky` is
     left as-is, which **passes** but only by coincidence with the
     non-canonical score in the golden).
   These ranges need updating to match Chat A's formula, or the
   formula choice itself needs revisiting.

2. **`golden_tricky_abstention.md` carries a non-canonical score**
   (71) that does not derive from Chat A's locked formula. Under
   Chat A's formula the score would be 100 (i.e., a deployment with
   only `review_required` findings, plus light high/medium/info, gets
   a perfect score because the L1-no-critical floor lifts it to 100).
   That outcome is arguably wrong on its face — `review_required`
   findings should depress a hardening score, not be invisible — and
   suggests Chat A's formula has a design issue when the floor
   exceeds the raw_score deduction.

3. **Brief's predicted "12"** is unreachable under Chat A's formula
   for this finding mix (L1, 2 critical, 3 high, 2 medium, 2 low,
   1 info, 0 review_required). The brief writer was very likely
   working from Chat C's formula — their mental model of "12" =
   100 - (2·20 + 3·10 + 2·6 + 2·3 + 0) = 12. Either:
   - The brief's score predictions were computed under Chat C's
     formula by mistake (most likely), or
   - The brief writer intended Chat C's formula to survive item 4's
     "Chat A canonical" instruction (an exception they didn't spell
     out).

**Recommended path forward (out of Thread 0 scope, flagged for the
project owner to resolve):**

- **Option α** — Keep Chat A's formula. Re-render `golden_tricky_abstention`
  to 100 (or 82 if floor is reinterpreted as max-floor not added-bonus).
  Update all three fixtures' `expected_hardening_index_range` values.
  Note the formula's apparent mis-treatment of `review_required`-heavy
  cfgs and consider revising weights / floor semantics in a v2 spec.

- **Option β** — Swap Chat A's formula in
  `22_REPORT_TEMPLATES.md` § "Hardening index formula (normative)" for
  Chat C's formula. This would re-revert `golden_clean_l1` to 100
  (matches), `golden_vulnerable_mixed` to 12, leave `golden_tricky` at
  71. Fixture ranges would all pass. Cost: another exception to
  "Chat A's docs are locked" — beyond what the brief authorized.

- **Option γ** — Author a v2 hybrid formula that takes Chat A's
  weights but keeps the kind-multiplier and flat-penalty mechanics from
  Chat C. Defer until v0.2.

This decision is above Thread 0's scope. Threads 1 and 2 should not
author additional rules or fixtures whose `expected_hardening_index_range`
fields presume any particular formula until this is settled.

---

## Item 10 — Open architectural items

### 10a — `cancel_if_present` schema primitive

**Status.** Deferred to v2 schema work.

Both Chat C (per memory entry) and the canonical
`12_RULE_CATALOG_SCHEMA.md` lack a `cancel_if_present`-style fire-unless-
cancelled lightweight matcher primitive. `OSIPS-SEC-MI_EXPOSURE-001`
worked around the gap by demoting confidence rather than suppressing
the finding outright when `mi_trusted_clients` is set. This workaround
remains in place for v1.

**No action in Thread 0.** Recorded for future schema revision.

---

### 10b — CVSS aggregation policy

**Status.** Resolved. Adopted **worst-case-across-modules** per brief
direction.

Added a paragraph to `20_runtime/21_ANALYSIS_PIPELINE.md` § 4.6 —
Scoring enrichment, between the existing context-adjustment paragraph
and § 4.7. The new paragraph specifies that aggregate CVSS roll-ups
(per-module, per-section, headline) take the maximum
`security_severity` of any contributing finding within the roll-up's
scope. Per-finding vectors are preserved unchanged in SARIF/Markdown
output; the aggregate is a derived view. Rationale: a deployment is
exposed at the level of its worst un-mitigated weakness; averaging
would dilute critical findings against high-frequency low-severity
ones in a way that contradicts triage practice.

**Diff.** `20_runtime/21_ANALYSIS_PIPELINE.md` ~22 lines added at
§ 4.6. This is one of the two explicit modifications to Chat A's
docs authorized by the brief.

---

### 10c — Taint-source coverage

**Status.** Backlog item for Phase 6b.

The taint-source set in `16_TAINT_MODEL.md` (Chat B) and as referenced
in `OSIPS-SEC-INJECTION-001`'s implicit taint sources is a hand-curated
list of SIP-message-derived pseudovariables (`$rU`, `$fU`, `$tU`,
`$ru`, `$si`, `$proto`, `$ua`, `$hdr(*)`, `$ct`, plus message
accessors). The OpenSIPS pseudovariable namespace is large; the
long tail (less common `$pv`-style accessors, module-specific
pseudovariables exposed via `loadmodule` directives) is not
covered.

**Phase 6b backlog action.** Audit the OpenSIPS core + module
documentation for every pseudovariable that can carry SIP-message-
derived bytes and produce a complete taint-source manifest. Update
`16_TAINT_MODEL.md` and the rules that assert taint sources.

**No action in Thread 0.** Recorded for Phase 6b.

---

### 10d — SQL injection family fan-out

**Status.** Deferred to Thread 1.

The injection family currently has one rule (`OSIPS-SEC-INJECTION-001`,
`avp_db_query`). The `cachedb_query`, `db_query`, and `sql_query`
sinks each warrant their own rule per the rule-granularity principle
(one detection-pattern + remediation pair per rule), since the
remediation differs (different sanitizer registry entries apply per
sink primitive's escape semantics).

**Thread 1 action.** Author `OSIPS-SEC-INJECTION-002` (cachedb_query),
`OSIPS-SEC-INJECTION-003` (db_query), `OSIPS-SEC-INJECTION-004`
(sql_query). Each follows the structure of -001. The taint model in
`16_TAINT_MODEL.md` provides the shared sink-classification vocabulary.

**No action in Thread 0.**

---

## Summary of changes

### New files (canonical)
- `10_architecture/16_TAINT_MODEL.md` — Tier 1 extension (from Chat B).
- `00_project/03_FILE_MANIFEST.md` — copy of locked manifest, updated for
  TAINT_MODEL row.

### Modified files (Chat A originals + reconciliation edits)
- `10_architecture/12_RULE_CATALOG_SCHEMA.md` — added `## Test fixture pointers` section (item 4).
- `10_architecture/14_VERSION_STRATEGY.md` — added OR-list semver (item 3).
- `20_runtime/21_ANALYSIS_PIPELINE.md` — added CVSS aggregation paragraph at § 4.6 (item 10b).
- `00_project/00_README.md` — added TAINT_MODEL status row (item 5).

### Modified files (Chat C originals + reconciliation edits)
- `30_rules/injection/OSIPS-SEC-INJECTION-001.md` — renamed from `INJ-001`, ID rewritten (item 6).
- `30_rules/mi_exposure/OSIPS-SEC-MI_EXPOSURE-001.md` — renamed from `MI-001`, ID rewritten (item 6).
- `50_fixtures/{vulnerable,clean,tricky}/*.expected.json` — IDs rewritten (item 6).
- `50_fixtures/golden_reports/*.md` — IDs rewritten (item 6); `golden_clean_l1` and `golden_vulnerable_mixed` re-rendered per Chat A's formula (item 9).

### Files placed without modification
- `10_architecture/{10_SKILL_STACK,11_FINDING_SCHEMA,13_PROFILE_MODEL,15_CONFIDENCE_AND_VERIFICATION}.md` — Chat A.
- `20_runtime/{20_INTAKE_PROTOCOL,22_REPORT_TEMPLATES,23_SUPPRESSION_PROTOCOL,24_INTERACTION_PATTERNS}.md` — Chat A.
- `00_project/{01_CHARTER,02_GLOSSARY}.md` — Chat A.
- `30_rules/auth/OSIPS-SEC-AUTH-{001,002}.md` — Chat B (already long-form IDs).
- `50_fixtures/{vulnerable,clean,tricky}/*.cfg` — Chat C (cfg files have no rule IDs to rewrite).

### Quarantined (not part of canonical specification)
- `_orphans/chat_b_overridden/12_RULE_CATALOG_SCHEMA_addendum.md` — overridden by item 2.
- `_orphans/chat_b_overridden/14_VERSION_STRATEGY.md` — overridden by item 3.
- `_orphans/chat_c_alternate_specs/{11_DATA_MODEL,13_RULE_AUTHORING,14_DETECTION_ENGINE}.md` — alternate Tier 1 layout (item 4 plus structural mismatch).
- `_orphans/chat_c_alternate_specs/{15_CONFIDENCE_AND_VERIFICATION_chat_c,22_REPORT_TEMPLATES_chat_c}.md` — overridden by item 4.
- `_orphans/README.md` — explains directory contents and harvest guidance.

### Open issues for downstream threads
- Thread 1 (rules/fixtures): items 7 (Chat B drafts harvest), 9 (formula-conflict resolution required before authoring more fixtures), 10c (taint sources backlog start), 10d (SQL injection family fan-out).
- Thread 2 (Phase 5 imports + version overlays): item 8 (placeholder sweep), item 9 alpha/beta/gamma decision recording.
- Thread 3 (`SKILL.md`): items 9 and 8 may affect what the skill points at; thread 3 should run after 1 and 2 land.

### Files in canonical tree

```
00_project/
  00_README.md
  01_CHARTER.md
  02_GLOSSARY.md
  03_FILE_MANIFEST.md   (NEW: in-tree copy of updated manifest)
10_architecture/
  10_SKILL_STACK.md
  11_FINDING_SCHEMA.md
  12_RULE_CATALOG_SCHEMA.md   (modified: + Test fixture pointers section)
  13_PROFILE_MODEL.md
  14_VERSION_STRATEGY.md      (modified: + OR-list semver)
  15_CONFIDENCE_AND_VERIFICATION.md
  16_TAINT_MODEL.md           (NEW: from Chat B)
20_runtime/
  20_INTAKE_PROTOCOL.md
  21_ANALYSIS_PIPELINE.md     (modified: + CVSS aggregation policy)
  22_REPORT_TEMPLATES.md
  23_SUPPRESSION_PROTOCOL.md
  24_INTERACTION_PATTERNS.md
30_rules/
  auth/
    OSIPS-SEC-AUTH-001.md     (Chat B)
    OSIPS-SEC-AUTH-002.md     (Chat B)
  injection/
    OSIPS-SEC-INJECTION-001.md   (Chat C, renamed)
  mi_exposure/
    OSIPS-SEC-MI_EXPOSURE-001.md (Chat C, renamed)
50_fixtures/
  clean/
    clean-l1-enterprise-pbx.cfg
    clean-l1-enterprise-pbx.expected.json
  vulnerable/
    vulnerable-mixed.cfg
    vulnerable-mixed.expected.json
  tricky/
    custom-sanitizer.cfg
    custom-sanitizer.expected.json
  golden_reports/
    golden_clean_l1.md           (re-rendered: 98 → 100)
    golden_tricky_abstention.md  (NOT modified; off-formula at 71, flagged)
    golden_vulnerable_mixed.md   (re-rendered: 22 → 35)
_orphans/
  README.md
  chat_b_overridden/
    12_RULE_CATALOG_SCHEMA_addendum.md
    14_VERSION_STRATEGY.md
  chat_c_alternate_specs/
    11_DATA_MODEL.md
    13_RULE_AUTHORING.md
    14_DETECTION_ENGINE.md
    15_CONFIDENCE_AND_VERIFICATION_chat_c.md
    22_REPORT_TEMPLATES_chat_c.md
RECONCILIATION_LOG.md       (this file)
```

---

## End of log
