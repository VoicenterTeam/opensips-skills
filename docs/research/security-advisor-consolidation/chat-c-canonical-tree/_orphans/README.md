# `_orphans/` — preserved alternate authoring artifacts

This directory holds work product from Chats B and C that did not land in
the canonical tree but is preserved verbatim so nothing is lost.
**These files are NOT part of the advisor specification.** The canonical
specification is the rest of the tree. The contents here are reference
material for tracing authoring history or for harvesting prose during
later spec passes.

## `chat_b_overridden/`

Chat B authored these in `10_overview/` (Chat B's directory naming).
The consolidation merged Chat B's substantive contribution
(`16_TAINT_MODEL.md`) into the canonical `10_architecture/` directory;
these two were overridden:

- **`12_RULE_CATALOG_SCHEMA_addendum.md`** — A standalone addendum
  defining the `suppressible` field in detail (criteria for when to
  set `suppressible: false`, an interaction matrix with the
  `automated` field, a migration note). The canonical
  `12_RULE_CATALOG_SCHEMA.md` declares the `suppressible` field in
  its frontmatter table but does not carry this longer-form prose.
  Per Thread 0 brief item 2 the addendum was deleted from the
  canonical tree; the prose is preserved here in case a future spec
  pass wants to fold the criteria/matrix material into the canonical
  schema doc or into `23_SUPPRESSION_PROTOCOL.md`.

- **`14_VERSION_STRATEGY.md`** — Chat B's version of the version
  strategy doc. Chat A's version is canonical and more
  comprehensive. The OR-list semver pattern (e.g.,
  `">=3.4.0 <3.4.7 || >=3.5.0 <3.5.4 || >=3.6.0 <3.6.4"`) was
  folded from this document into Chat A's "How per-rule version
  gating works" section per brief item 3. Other content is
  reference-only.

## `chat_c_alternate_specs/`

Chat C authored an alternate Tier 1 layout under different filenames
than the locked manifest specifies. The canonical layout (per the
locked manifest and Chat A's authoring) is:

- `11_FINDING_SCHEMA.md`
- `12_RULE_CATALOG_SCHEMA.md`
- `13_PROFILE_MODEL.md`
- `14_VERSION_STRATEGY.md`
- `15_CONFIDENCE_AND_VERIFICATION.md`
- `16_TAINT_MODEL.md` (Tier 1 extension, Chat B)

Chat C's layout was:

- `11_DATA_MODEL.md`
- `13_RULE_AUTHORING.md`
- `14_DETECTION_ENGINE.md`
- `15_CONFIDENCE_AND_VERIFICATION.md`
- `22_REPORT_TEMPLATES.md`

The slot numbers overlap but the topics differ. Chat C's
`13_RULE_AUTHORING.md`, for example, covers rule file format and
fixture pointer schema — material that Chat A distributes across
`12_RULE_CATALOG_SCHEMA.md` (frontmatter & body sections) and
`50_fixtures/README.md` (fixture file format). Chat C's
`14_DETECTION_ENGINE.md` covers content that Chat A places in
`20_runtime/21_ANALYSIS_PIPELINE.md`.

The Thread 0 brief identified Chat A's `15_CONFIDENCE_AND_VERIFICATION.md`
and `22_REPORT_TEMPLATES.md` as canonical; Chat C's same-named
versions are preserved here with `_chat_c` suffix for traceability.
The other three (`11_DATA_MODEL`, `13_RULE_AUTHORING`,
`14_DETECTION_ENGINE`) had no canonical-name conflict — they simply
aren't in the manifest. They are preserved here for the same reason.

### Specific content worth knowing about (in case of harvest)

- `13_RULE_AUTHORING.md` contains the original `exercises_abstain_on`
  field definition and surrounding fixture-pointer YAML schema.
  The minimum surgical fold (the field plus its sibling
  `exercises_fp_class` for context) was migrated into the canonical
  `12_RULE_CATALOG_SCHEMA.md` § "Test fixture pointers".
- `22_REPORT_TEMPLATES_chat_c.md` contains a **different**
  hardening-index formula than Chat A's canonical formula. See
  `RECONCILIATION_LOG.md` item 9 for the unresolved formula
  discrepancy.
- `14_DETECTION_ENGINE.md` is the original home of the
  abstention-on-opaque-transform protocol. The protocol concept
  is referenced in canonical `12_RULE_CATALOG_SCHEMA.md` and the
  `30_rules/injection/OSIPS-SEC-INJECTION-001.md` rule, but the
  detailed treatment lives only here. A future spec pass may
  want to migrate it into `20_runtime/21_ANALYSIS_PIPELINE.md`
  Phase 3c — Dataflow / taint section.

## What threads should do with this directory

- **Threads 1 and 2:** Generally ignore this directory. If you find
  a concept used in canonical files that lacks a definitional anchor
  (e.g., "abstention contract", "opaque transformation"), check here
  before drafting fresh prose.
- **Thread 3 (SKILL.md):** Do not surface anything from this
  directory in the skill's progressive-disclosure routing. The
  skill points at the canonical tree.
- **Future spec-revision passes:** This directory is the source for
  any prose-harvest work. Consider the addendum's `suppressible`
  criteria/matrix material a candidate for `23_SUPPRESSION_PROTOCOL.md`.
