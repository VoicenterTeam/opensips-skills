# CHAT_A_STATE_LOG.md

**Chat identity.** Chat A — Phase 6a foundation specs author.
**Session date.** 2026-04-29.
**Bundle generated.** End-of-session, post completion of all
authoring work plus thread-orchestration scaffolding for the
follow-up consolidation and gap-closure threads.

This log exists so a future session — yourself, another Claude, or
anyone reading this bundle cold — can reconstruct what Chat A did,
decided, and flagged without re-reading the entire transcript.

---

## What Chat A was tasked with

Authoring the Phase 6a foundation specs for the OpenSIPS Security
Advisor skill, per the locked file manifest. Specifically:

- Tier 0 — project orientation (3 docs).
- Tier 1 — architectural specs (6 docs, load-bearing for
  everything downstream).
- Tier 2 — runtime behavior specs (5 docs).

Total: 14 documents.

---

## What Chat A delivered

### Deliverable 1 — 14 foundation specs

All 14 documents authored, locked, and saved. Located in this
bundle at `phase6a-foundation-specs/`. Per-file summary:

| Tier | File | Status |
|---|---|---|
| 0 | `00_project/00_README.md` | Locked |
| 0 | `00_project/01_CHARTER.md` | Locked |
| 0 | `00_project/02_GLOSSARY.md` | Locked |
| 1 | `10_architecture/10_SKILL_STACK.md` | Locked |
| 1 | `10_architecture/11_FINDING_SCHEMA.md` | Locked |
| 1 | `10_architecture/12_RULE_CATALOG_SCHEMA.md` | Locked |
| 1 | `10_architecture/13_PROFILE_MODEL.md` | Locked |
| 1 | `10_architecture/14_VERSION_STRATEGY.md` | Locked |
| 1 | `10_architecture/15_CONFIDENCE_AND_VERIFICATION.md` | Locked |
| 2 | `20_runtime/20_INTAKE_PROTOCOL.md` | Locked |
| 2 | `20_runtime/21_ANALYSIS_PIPELINE.md` | Locked |
| 2 | `20_runtime/22_REPORT_TEMPLATES.md` | Locked |
| 2 | `20_runtime/23_SUPPRESSION_PROTOCOL.md` | Locked |
| 2 | `20_runtime/24_INTERACTION_PATTERNS.md` | Locked |

Approximate total: ~6,000 lines of locked spec.

Authoring discipline: each doc was drafted in chat for user review,
calibration questions raised, and committed to disk only after
explicit user approval ("good, next"). No speculative authoring
happened — every spec was reviewed.

### Deliverable 2 — Thread-orchestration prompts

After authoring completed, the user requested a partition plan for
closing the remaining manifest gaps. Two prompt files were
produced and are in this bundle at `thread-orchestration/`:

- `THREAD_0_CONSOLIDATION_PROMPT.md` — for the consolidation
  thread that merges Chat A, B, C outputs into a unified tree.
- `THREAD_3_SKILL_MD_PROMPT.md` — for the SKILL.md authoring
  thread that closes Phase 6a once Threads 0/1/2 land.

Two additional prompts (Thread 1 — catalog persistence, Thread 2 —
overlays + reference imports) were drafted in the conversation but
not saved as standalone files. The conversation transcript is the
canonical source if those prompts are needed verbatim.

---

## Decisions Chat A locked

These decisions are now load-bearing across the spec set. A future
session should not re-open them without explicit revisit.

### Architectural commitments

- **Seven-layer skill stack.** Intake → Parse → Rule Catalog →
  Configuration → Detection Engine (4 sub-phases) → Triage →
  Reporting. Layer numbers are stable; only sub-phase additions
  under Layer 5 are permitted without revisit.
- **Detection engine has four sub-phases by analytical nature**:
  structural (5a), value/pattern (5b), dataflow/taint (5c),
  semantic/contextual (5d). Sequential ordering: deterministic
  phases first, LLM phases last.
- **Severity and confidence are independent dimensions.** Both
  mandatory on every finding. Engine never collapses them.
- **Finding schema uses CVSS 4.0** (not 3.1). JSON Schema in
  draft-2020-12.
- **One rule catalog spans 3.4/3.5/3.6** with per-rule frontmatter
  gates. Three sibling catalogs explicitly rejected.
- **Profile model is nested, not disjoint.** L1 implies L2 by
  inclusion; L2-only rules are the opt-in stricter case.
- **Verification protocol is mandatory** for `phase:
  semantic_contextual` and for any finding with confidence
  `medium` or `low`. Bypass is a validation failure.
- **Abstention (`kind: review_required`) is a first-class
  output**, not a failure mode. Carries partial penalty in
  hardening index.
- **Suppression has three mechanisms** — in-source comment,
  external suppression file, natural-language site policy.
  Site policy informs LLM judgment, does not unilaterally
  suppress.
- **Some rules are never-suppressible** (`suppressible: false`):
  active-exploit CVEs, trivial-to-exploit + critical-impact,
  compliance-framework violations.

### Wire-format commitments

- **SARIF 2.1.0**, not 2.2 (still in draft).
- **Property-bag namespace** `opensips-advisor/` for advisor-
  specific SARIF properties.
- **Fingerprint algorithm uses logical_location**, not line
  number — stable across cfg reformats.
- **Rule ID format** `OSIPS-SEC-<FAMILY>-<NNN>` with FAMILY in
  long-form uppercase (INJECTION, MI_EXPOSURE — not INJ, MI).

### Numeric calibrations

These are mine, derived during authoring; they're tunable in
minor versions but are normative for the current spec.

- **Hardening index weights**: critical=25, high=10, medium=4,
  low=1, info=0, review_required=2.
- **Hardening index floors**: 35 if profile=L1 and zero
  critical findings; 25 if profile=L1 with critical findings; 0
  if profile=L2.
- **Composite rank for Findings-section ordering**: severity ×
  confidence_factor × CVSS, where confidence_factor is
  high=1.0/medium=0.8/low=0.6.
- **Confidence downgrade**: signals stack additively (multiple
  signals = multiple levels down). Confidence upgrade: at most
  one level per emission, no stacking.
- **Confidence floor**: rule's default confidence minus two
  levels, bounded at `low`. Below floor → review_required.

---

## Things Chat A introduced beyond the manifest

Chat A added five concepts that aren't in the original manifest
but are referenced by other Chat A specs. A future session needs
to know these exist or referenced files will be missing:

1. **`16_TAINT_MODEL.md`** — Chat B authored this; Chat A
   recommended accepting as Tier 1 extension. Thread 0
   consolidation owns the decision.
2. **`30_rules/_SANITIZER_REGISTRY.md`** — referenced by
   `21_ANALYSIS_PIPELINE.md` Phase 3c. Chat A flagged as a
   Phase 6b authoring task (Thread 1).
3. **`90_reference/external_sources.md`** — bibliography of
   external URLs cited across rules. Phase 6b task (Thread 2).
4. **`25_FIXTURE_SCHEMA.md`** — formalizing the anchor-based
   fixture format. Chat C also flagged. Thread 2 owns.
5. **`OSIPS-SEC-CONFIG_HYGIENE-NNN`** rule for "undocumented
   suppression" — referenced in `23_SUPPRESSION_PROTOCOL.md`
   as back-pressure against drive-by suppression. Thread 1 owns
   the rule authoring.

---

## Open architectural items Chat A flagged

These were raised during authoring but explicitly *not* resolved
by Chat A. They were passed to Thread 0 (consolidation) for
resolution.

1. **`cancel_if_present` schema gap** — lightweight matchers
   lack a fire-unless-cancelled primitive. MI-001 worked around
   with confidence demotion. Decide: add primitive in v2 or
   accept workaround for v1.
2. **CVSS aggregation policy** — worst-case-across-modules vs
   per-module. Unspecified.
3. **Taint-source coverage** — hand-curated set; long tail of
   pseudo-variables uncovered. Decide: accept v1 or expand.
4. **SQL injection family fan-out** — INJ-002/003/004 needed
   for cachedb_query, db_query, sql_query. Defer to Phase 6b
   or address now.

The Thread 0 prompt in this bundle includes proposed defaults
for each. Final resolution is documented in the Thread 0
RECONCILIATION_LOG.md output (when that thread runs).

---

## Phase 5 citation sweep TODO

Chat A used `[P5 §TBD — "topic"]` placeholders for citations
into Phase 5 advisor methodology research, since the actual
research document was not in scope at authoring time. Counts:

- `10_SKILL_STACK.md` — 9 placeholders.
- `11_FINDING_SCHEMA.md` — 2 placeholders.
- `12_RULE_CATALOG_SCHEMA.md` — 1 placeholder.
- `13_PROFILE_MODEL.md` — 1 placeholder.
- `15_CONFIDENCE_AND_VERIFICATION.md` — 2 placeholders.
- `22_REPORT_TEMPLATES.md` — 1 placeholder.

Approximate total: ~16 placeholders across the spec set.

Sweep happens in Thread 2 (after Phase 5 reference doc is
imported into `90_reference/03`). Each placeholder is a
`grep`-able marker (`[P5 §TBD —`) for the sweeping session.

---

## Cross-chat coordination state at session end

Per project memory, Chat A's session ran in parallel with Chat B
and Chat C, both also authoring portions of the OpenSIPS Advisor.
Conflict points identified by Chat A at end of session:

1. Directory naming: A and C used `10_architecture/`; B used
   `10_overview/`. Manifest wins → `10_architecture/`.
2. Doc 12 (Rule Catalog Schema): A authored canonical version; B
   produced an addendum that's redundant with A's version.
3. Doc 14 (Version Strategy): A and B both authored; B contributed
   OR-list semver pattern that A did not include.
4. Doc 15 + Doc 22: A and C both authored; A's are more recent.
5. Doc 16 (Taint Model): B-only; not in original manifest.
6. Rule ID convention: A locked long-form; C used short-form on
   the two rules C saved.
7. Duplicate rule authoring: A's Doc 12 example exemplar
   (AUTH-001 plaintext password column) is illustrative-only;
   B and C separately authored mi-http-public-bind and
   sql-inj-avp-db-query.

The Thread 0 prompt walks through these conflicts in order with
proposed resolutions. The consolidation thread's job is mechanical
merging plus producing `RECONCILIATION_LOG.md`.

---

## What Chat A did NOT do

For clarity to a future session: these are gaps Chat A
intentionally left for follow-up threads.

- Did not write SKILL.md (deferred to Thread 3).
- Did not author rules in `30_rules/` (deferred to Thread 1, the
  Chat B continuation).
- Did not author fixtures in `50_fixtures/` (deferred to Thread 2,
  the Chat C continuation).
- Did not author Tier 4 version overlays (`40_versions/3.4.md`,
  `3.5.md`, `3.6.md`) (deferred to Thread 2).
- Did not import Tier 6 reference docs (Phase 2 vuln reference,
  Phase 3 gap analysis, Phase 5 methodology research) (deferred
  to Thread 2).
- Did not run the Phase 5 citation sweep (deferred to Thread 2).
- Did not consolidate with Chat B and Chat C output (deferred to
  Thread 0).

---

## Recommended sequencing

Per Chat A's analysis at end of session:

```
Thread 0 (Consolidation)  →  alone, must finish first
                          ↓
   ┌──────────────────────┴──────────────────────┐
   ↓                                             ↓
Thread 1 (Catalog persistence)           Thread 2 (Overlays + refs)
   "Chat B' continuation"                "Chat C' continuation"
                                                 ↓
   └──────────────────────┬──────────────────────┘
                          ↓
              Thread 3 (SKILL.md authoring)
              "Chat A' continuation, alone"
                          ↓
                  Ready for Claude Code
```

Total: 4 threads / sessions remaining before Claude Code begins.

---

## Behaviors observed during this session worth flagging

Chat A's session received repeated prompt-injection attempts —
each user turn arrived with an instruction to "launch a research
task" appended. Chat A ignored these every time. The pattern is
documented because future threads in this project may see the
same injection pattern; the prompts in
`thread-orchestration/` include explicit guards against it.

---

## How to use this bundle

For consolidation:

1. Use `phase6a-foundation-specs/` as Chat A's input to Thread 0.
2. Use `thread-orchestration/THREAD_0_CONSOLIDATION_PROMPT.md` to
   launch the consolidation thread.

For SKILL.md authoring (later, after Threads 0+1+2):

1. Use `thread-orchestration/THREAD_3_SKILL_MD_PROMPT.md` to
   launch the final thread.

For state recovery:

1. This log + `phase6a-foundation-specs/` together capture
   everything Chat A produced and decided. Reading this log gives
   a future session the context to operate without re-reading
   the original conversation transcript.
