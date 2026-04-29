# OpenSIPs Security Advisor v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `opensips-security-advisor` as the second active skill in the `opensips-skills` plugin, harvested and consolidated from three pre-existing chat bundles into a clean, cross-version, semantic-folder structure with 58 rules across 12 domains, ready for live demo.

**Architecture:** One Claude Code Skill, cross-version (no per-version directory partitioning), with a hand-authored `SKILL.md` router pointing into `references/` containing four spec docs (`workflow.md`, `output-format.md`, `taxonomy.md`, `taint-model.md`), 12 rule-family folders, version notes for 3.4/3.5/3.6/4.0, and four knowledge docs. Read-only tooling (`Read, Glob, Grep`). Reads sibling `opensips-config` references for identifier sanity-checking.

**Tech Stack:** Markdown + YAML frontmatter. No build step. No automated test runner — the validation is a manual smoke test in a fresh Claude Code session against committed fixtures.

**Source spec:** `docs/superpowers/specs/2026-04-29-opensips-security-advisor-v1-design.md`

---

## File structure

### Files created (new content)

| Path | Responsibility |
|---|---|
| `plugins/opensips/skills/opensips-security-advisor/SKILL.md` | Hand-authored router: when-to-use, navigation, integration contract |
| `plugins/opensips/skills/opensips-security-advisor/references/workflow.md` | Review process: intake → analyze → suppress → render |
| `plugins/opensips/skills/opensips-security-advisor/references/output-format.md` | Finding shape, Markdown report template, rule frontmatter spec |
| `plugins/opensips/skills/opensips-security-advisor/references/taxonomy.md` | Severity ladder, L1/L2 profiles, glossary |
| `plugins/opensips/skills/opensips-security-advisor/references/taint-model.md` | Sources/sanitizers/sinks for injection rules |
| `plugins/opensips/skills/opensips-security-advisor/references/knowledge/vulnerability-reference.md` | Master vulnerability reference (Phase 2 harvested) |
| `plugins/opensips/skills/opensips-security-advisor/references/knowledge/sanitizer-registry.md` | Recognized sanitizers (Chat B + Chat C reconciled) |
| `plugins/opensips/skills/opensips-security-advisor/references/knowledge/ser-lineage-notes.md` | Cross-skill anti-hallucination guardrail |
| `plugins/opensips/skills/opensips-security-advisor/references/knowledge/external-sources.md` | Authoritative URLs / citations |
| `plugins/opensips/skills/opensips-security-advisor/references/version-notes/3.4.md` | OpenSIPs 3.4 CVE inventory + module-set deltas |
| `plugins/opensips/skills/opensips-security-advisor/references/version-notes/3.5.md` | OpenSIPs 3.5 CVE inventory + module-set deltas |
| `plugins/opensips/skills/opensips-security-advisor/references/version-notes/3.6.md` | OpenSIPs 3.6 CVE inventory + module-set deltas |
| `plugins/opensips/skills/opensips-security-advisor/references/version-notes/4.0.md` | OpenSIPs 4.0 CVE inventory + module-set deltas |
| `plugins/opensips/skills/opensips-security-advisor/references/rules/{12 domains}/*.md` | 58 rules (migrated from Chat B with mechanical normalization) |
| `docs/testing/security-advisor/fixtures/**` | Test cfg files + expected.json (moved from `50_fixtures/`) |
| `docs/testing/security-advisor/test-strategy.md` | Fixture schema + manual smoke test procedure |
| `docs/research/security-advisor-consolidation/**` | All Chat A/B/C bundles + reconciliation logs preserved |
| `docs/architecture/adr/014-security-advisor-v1-single-skill.md` | ADR superseding ADR-013's scaffold-disabled stance |

### Files modified

| Path | Change |
|---|---|
| `plugins/opensips/.claude-plugin/plugin.json` | Register second skill |
| `plugins/opensips/README.md` | Mention both skills |
| `plugins/opensips/skills/opensips-security-advisor/README.md` | Replace "scaffold/disabled" content with v1 release notes |
| `CLAUDE.md` | Update "What this project is" section to reflect v1.1 (two active skills) |
| `CHANGELOG.md` | Add v1.1.0 entry |
| `docs/architecture/adr/013-merge-routing-and-modules-into-opensips-config.md` | Mark superseded by ADR-014 (status note only — don't rewrite the ADR body) |

### Files deleted from skill folder (after harvest)

- `SKILL.md.scaffold` (replaced by `SKILL.md`)
- `THREAD_0_CONSOLIDATION_BUNDLE.zip`
- `.gitkeep`
- All numbered top-level dirs: `10_architecture/`, `20_runtime/`, `30_rules/`, `40_versions/`, `50_fixtures/`, `90_reference/`
- All bundle dirs: `CHAT_A_BUNDLE/`, `chat-b-opensips-advisor-bundle/`, `THREAD_0_CONSOLIDATION_BUNDLE/`, `opensips-security-advisor/` (nested duplicate)
- Root-level state/log files: `THREAD_0_CONSOLIDATION_STATE.md`, `RECONCILIATION_LOG.md`, `security-advisor-c-activity-log.md`

---

## Execution order and parallelism

```
Phase 1 (sequential)   : Stage research archive
Phase 2 (parallel x4)  : Author 4 reference spec docs
Phase 3 (sequential)   : Migrate 58 rules (bulk operation)
Phase 4 (parallel x4)  : Author version-notes/{3.4, 3.5, 3.6, 4.0}.md
Phase 5 (parallel x4)  : Author knowledge/{vulnerability-reference, sanitizer-registry, ser-lineage-notes, external-sources}.md
Phase 6 (sequential)   : Move fixtures, write test-strategy
Phase 7 (sequential)   : Author SKILL.md, update plugin manifest + README
Phase 8 (sequential)   : Write ADR-014, update CLAUDE.md + CHANGELOG, smoke test, final cleanup commit
```

---

## Phase 1 — Stage research archive

### Task 1: Move all research bundles and logs to `docs/research/`

**Why first:** Frees the skill folder of clutter. Everything we need to read AS source material is still in git history; moving it preserves it on-disk too. This task only touches the skill-folder layout — does not yet author canonical content.

**Files:**
- Create dir: `docs/research/security-advisor-consolidation/`
- Move: `plugins/opensips/skills/opensips-security-advisor/CHAT_A_BUNDLE/` → `docs/research/security-advisor-consolidation/chat-a-bundle/`
- Move: `plugins/opensips/skills/opensips-security-advisor/chat-b-opensips-advisor-bundle/` → `docs/research/security-advisor-consolidation/chat-b-bundle/`
- Move: `plugins/opensips/skills/opensips-security-advisor/opensips-security-advisor/` → `docs/research/security-advisor-consolidation/chat-c-canonical-tree/`
- Move: `plugins/opensips/skills/opensips-security-advisor/THREAD_0_CONSOLIDATION_BUNDLE/` → `docs/research/security-advisor-consolidation/thread-0-bundle/`
- Move: `plugins/opensips/skills/opensips-security-advisor/THREAD_0_CONSOLIDATION_STATE.md` → `docs/research/security-advisor-consolidation/thread-0-state.md`
- Move: `plugins/opensips/skills/opensips-security-advisor/RECONCILIATION_LOG.md` → `docs/research/security-advisor-consolidation/reconciliation-log.md`
- Move: `plugins/opensips/skills/opensips-security-advisor/security-advisor-c-activity-log.md` → `docs/research/security-advisor-consolidation/chat-c-activity-log.md`
- Delete: `plugins/opensips/skills/opensips-security-advisor/THREAD_0_CONSOLIDATION_BUNDLE.zip`
- Create: `docs/research/security-advisor-consolidation/README.md`

- [ ] **Step 1: Create the destination directory**

```bash
mkdir -p docs/research/security-advisor-consolidation
```

- [ ] **Step 2: Move bundles and logs**

Use `git mv` so history is preserved.

```bash
SKDIR=plugins/opensips/skills/opensips-security-advisor
DSTDIR=docs/research/security-advisor-consolidation

git mv "$SKDIR/CHAT_A_BUNDLE" "$DSTDIR/chat-a-bundle"
git mv "$SKDIR/chat-b-opensips-advisor-bundle" "$DSTDIR/chat-b-bundle"
git mv "$SKDIR/opensips-security-advisor" "$DSTDIR/chat-c-canonical-tree"
git mv "$SKDIR/THREAD_0_CONSOLIDATION_BUNDLE" "$DSTDIR/thread-0-bundle"
git mv "$SKDIR/THREAD_0_CONSOLIDATION_STATE.md" "$DSTDIR/thread-0-state.md"
git mv "$SKDIR/RECONCILIATION_LOG.md" "$DSTDIR/reconciliation-log.md"
git mv "$SKDIR/security-advisor-c-activity-log.md" "$DSTDIR/chat-c-activity-log.md"
```

> **Note for executor:** these inputs are untracked (the directory is in `?? plugins/opensips/skills/opensips-security-advisor/...` per `git status`). `git mv` requires tracked sources, so use plain `mv` for the untracked ones. Verify with `git status` first; for any source whose path is untracked, replace `git mv` with `mv`.

- [ ] **Step 3: Delete the redundant zip and empty placeholder**

```bash
rm "plugins/opensips/skills/opensips-security-advisor/THREAD_0_CONSOLIDATION_BUNDLE.zip"
rm -f "plugins/opensips/skills/opensips-security-advisor/.gitkeep"
```

- [ ] **Step 4: Write the research README**

Create `docs/research/security-advisor-consolidation/README.md` with:

```markdown
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
for the v1 scope boundary.
```

- [ ] **Step 5: Verify the skill folder is now clean**

```bash
ls -la plugins/opensips/skills/opensips-security-advisor/
```

Expected output: `SKILL.md.scaffold` + `README.md` only (plus `.` and `..`). If anything else appears, investigate before moving on.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(security-advisor): archive research bundles to docs/research/

Move three chat bundles (A, B, C) plus Thread 0 consolidation
artifacts and per-chat logs from the live skill folder to
docs/research/security-advisor-consolidation/. Skill folder now
contains only SKILL.md.scaffold + README.md, ready for v1 build-out.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2 — Author the four reference spec docs

These four docs collectively replace 13 docs from the bundles. They can be authored in parallel — no shared dependencies.

### Task 2: Author `references/workflow.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/workflow.md`

**Source material (read these from the archive):**
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/20_runtime/20_INTAKE_PROTOCOL.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/20_runtime/21_ANALYSIS_PIPELINE.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/20_runtime/23_SUPPRESSION_PROTOCOL.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/20_runtime/24_INTERACTION_PATTERNS.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/10_architecture/15_CONFIDENCE_AND_VERIFICATION.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/10_architecture/14_VERSION_STRATEGY.md`

- [ ] **Step 1: Read all six source docs end-to-end**

Use the Read tool. Take notes mentally on:
- The 5-question intake list
- The phase ordering (parse → structural → value-pattern → dataflow → semantic → triage)
- Confidence tiers (high / medium / low / abstain → `review_required`)
- Suppression mechanics (user-declared, audit trail)
- Version-gating mechanism (per-rule `applies_if_opensips_version`)

- [ ] **Step 2: Write the consolidated `workflow.md`**

Required sections (top to bottom):

1. `# Review Workflow` — opening paragraph framing the doc as the procedural spine of the skill
2. `## Before You Start` — restates: this skill is read-only; all output is Markdown; no external tooling fired
3. `## Step 1: Intake` — the ≤5 question protocol. Required questions: OpenSIPs version (if not stated in cfg `#!OPENSIPS_VERSION` directive), deployment profile (L1 internal / L2 public-facing), scope of review (full audit / specific concern), known suppressions, intake of any compensating controls outside the cfg
4. `## Step 2: Identifier Sanity-Check` — read `../opensips-config/references/{version}/consolidated.json` and `modules-index.md` to confirm every identifier in the cfg under review is documented for the active version. Flag unknowns as `review_required` with reasoning. Cross-reference to `knowledge/ser-lineage-notes.md`.
5. `## Step 3: Apply Rules` — for each rule family in `rules/`, read the rule files, evaluate frontmatter version-gates and profile-gates against intake answers, run the `## Audit` logic against the cfg. Use `taint-model.md` for any injection-class rule.
6. `## Step 4: Triage` — produce a finding object per match. Severity from rule frontmatter. Confidence per the criteria below. If confidence is below threshold, downgrade to `review_required` and explain why.
7. `## Step 5: Apply Suppressions` — check intake for user-declared suppressions; honor with audit-trail entry in the report.
8. `## Step 6: Render the Report` — point at `output-format.md` for the byte-precise template.
9. `## Confidence Tiers` — high (multiple corroborating signals or canonical pattern), medium (one signal, no contradicting evidence), low (one signal in a context that often produces false positives → emit as `review_required`), abstain (cannot determine → `review_required` with reason `insufficient_information`).
10. `## Version-Gating Mechanism` — rule frontmatter field `applies_if_opensips_version` accepts semver expressions (`>=3.4`, `>=3.4 <4.0`, `=3.6`). Rules with no version field apply to all supported versions. The version is resolved at intake; rules that don't match are silently skipped.
11. `## Suppression Mechanics` — user can suppress by rule ID, by code location, or by entire family; suppressions are logged verbatim in the report's `Suppressions Applied` section. Suppressions never silently mute — they're always cited.
12. `## When to Abstain` — explicit list: missing version info, identifiers not in the active version's reference set, rule's preconditions partially met, contradiction between two rules' findings on the same construct.

Length target: 4-6 KB.

- [ ] **Step 3: Verify the file exists and reads cleanly**

```bash
wc -l plugins/opensips/skills/opensips-security-advisor/references/workflow.md
head -5 plugins/opensips/skills/opensips-security-advisor/references/workflow.md
```

- [ ] **Step 4: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/workflow.md
git commit -m "feat(security-advisor): add references/workflow.md (consolidates 6 bundle docs)

Single procedural spine for the security advisor: intake, identifier
sanity-check, rule application, triage, suppression, report rendering.
Replaces Chat A's 20_INTAKE_PROTOCOL, 21_ANALYSIS_PIPELINE,
23_SUPPRESSION_PROTOCOL, 24_INTERACTION_PATTERNS,
15_CONFIDENCE_AND_VERIFICATION, and 14_VERSION_STRATEGY without
the 'detection engine' framing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Author `references/output-format.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/output-format.md`

**Source material:**
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/10_architecture/11_FINDING_SCHEMA.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/20_runtime/22_REPORT_TEMPLATES.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/10_architecture/12_RULE_CATALOG_SCHEMA.md`

- [ ] **Step 1: Read the three sources**

- [ ] **Step 2: Write `output-format.md`**

Required sections:

1. `# Output Format` — opening paragraph: this doc defines the shape of a finding, the Markdown report structure, and the rule-file frontmatter. All three are versioned together — changing one without the others creates drift.
2. `## Finding Object` — annotated example showing every field a finding carries. Required fields: `rule_id`, `family`, `title`, `severity` (info|low|medium|high|critical|review_required), `confidence` (high|medium|low), `location` (file path + line number(s)), `cited_construct` (the snippet matched), `threat_model` (1-2 sentences), `remediation` (numbered steps), `references` (anchors into knowledge/ + external CVE URLs). Optional: `suppressed` (boolean + reason), `cvss_v4_vector`, `cwe`, `applies_if_opensips_version`, `profile`.
3. `## Markdown Report Template` — the byte-precise structure Claude renders. Sections: title block (cfg path, OpenSIPs version, profile, review timestamp), executive summary (counts by severity), findings (one section per finding, ordered critical → high → medium → low → review_required → info), suppressions applied, intake answers, abstentions and their reasons. Show the actual Markdown skeleton with placeholders.
4. `## Rule-File Frontmatter Spec` — required YAML fields with types and validation rules. Required: `id` (matches `OSIPS-SEC-<DOMAIN>-NNN`), `name` (kebab-case), `title`, `family`, `severity`, `confidence`, `module_family`, `applies_if_modules_loaded` (list), `applies_if_opensips_version` (semver), `phase` (list: structural|value_pattern|dataflow|semantic), `profile` (list: L1|L2), `automated` (bool), `suppressible` (bool), `cwe` (list). Optional: `cvss_v4_vector`, `owasp` (list), `attack` (list), `tags` (list), `references` (list).
5. `## Rule-File Body Sections` — required H2 sections in every rule file: `## Rationale`, `## Default Value`, `## Audit`, `## Remediation`, `## References`. Order is fixed.
6. `## Severity Determination` — pulled from rule frontmatter. The report orders findings by severity weight (critical=5, high=4, medium=3, low=2, review_required=1, info=0). Ties broken by family name then ID.

Length target: 5-7 KB.

- [ ] **Step 3: Verify and commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/output-format.md
git commit -m "feat(security-advisor): add references/output-format.md (collapses 3 bundle docs)

Defines finding object shape, Markdown report template, and rule-file
frontmatter+body schema in one place. Hardening-index field omitted
per v1 spec; SARIF mapping omitted per v1 spec.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Author `references/taxonomy.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/taxonomy.md`

**Source material:**
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/00_project/02_GLOSSARY.md`
- `docs/research/security-advisor-consolidation/chat-a-bundle/phase6a-foundation-specs/10_architecture/13_PROFILE_MODEL.md`

- [ ] **Step 1: Read both sources**

- [ ] **Step 2: Write `taxonomy.md`**

Required sections:

1. `# Taxonomy` — opening paragraph: this doc defines the vocabulary shared across all rules and reports.
2. `## Severity Ladder` — table with five levels:
   - `critical` — pre-auth RCE, pre-auth bypass of authentication, or active exploitation of a published OpenSIPs CVE with public exploit code.
   - `high` — post-auth RCE, credential disclosure, weak crypto on the auth path.
   - `medium` — DoS surfaces, MI exposure with auth, information disclosure not covering credentials.
   - `low` — config hygiene with security implications (e.g., debug logging that leaks SIP bodies).
   - `info` — observations of interest but no known security impact (recorded for context, not acted upon).
   - Plus `review_required` as a confidence-degraded alternative when severity is real but confidence is insufficient.
3. `## Deployment Profiles` — two L-tiers:
   - `L1` — enterprise PBX, internal-facing trust boundary. Rate limiting, NAT traversal lower priority. INVITE flooding and registration hijack from external sources are out of model unless edge-exposed.
   - `L2` — carrier edge, public-facing trust boundary. All categories in scope. Stricter defaults expected.
   - Rules opt into profiles via frontmatter `profile: [L1, L2]` (or just one). Rules with no `profile` field apply to both.
4. `## Glossary` — alphabetized terms used across rules and reports. At minimum: abstention, audit trail, confidence, dataflow, dialect (re: SER lineage), false positive, finding, hardening (informal — note that v1 has no numerical hardening index), intake, location, profile, review_required, sanitizer, severity, sink, source, suppression, taint, version-gate.
5. `## Family Codes` — the 12 family codes used in rule IDs:
   | Code | Family |
   |---|---|
   | AUTH | Authentication & credential storage |
   | INJ | Injection (SQL, shell, header) |
   | MI | Management interface exposure |
   | TLS | TLS posture (ciphers, verify_cert, listener scope) |
   | DOS | DoS defense (rate limiting, parser crashes) |
   | RELAY | Relay & routing (open relay, loop detection) |
   | ID | Identity spoofing (caller ID, From/To) |
   | STIR | STIR/SHAKEN |
   | MEDIA | Media/RTP exposure |
   | LB | Dispatcher & load-balancer |
   | LOG | Tracing & logging hygiene |
   | HYG | Configuration hygiene |

Length target: 3-4 KB.

- [ ] **Step 3: Verify and commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/taxonomy.md
git commit -m "feat(security-advisor): add references/taxonomy.md (severity, profiles, glossary)

Single source of vocabulary: severity ladder, L1/L2 deployment
profiles, alphabetized glossary, 12 family codes. L3 profile out of
v1 scope. Hardening-index numerical score not part of v1 vocabulary.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Author `references/taint-model.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/taint-model.md`

**Source material:**
- `docs/research/security-advisor-consolidation/chat-a-bundle/thread-orchestration/` (no taint model here — Chat A didn't author it)
- `docs/research/security-advisor-consolidation/chat-b-bundle/10_overview/16_TAINT_MODEL.md` (Chat B's authoritative version, accepted by Thread 0)
- `docs/research/security-advisor-consolidation/chat-c-canonical-tree/10_architecture/16_TAINT_MODEL.md` (verify identical to Chat B's)

- [ ] **Step 1: Read the Chat B source**

- [ ] **Step 2: Write `taint-model.md`**

This doc can be a near-verbatim adaptation of Chat B's `16_TAINT_MODEL.md` with:
- Header changed from `# 16_TAINT_MODEL` to `# Taint Model`
- Any `Tier 1 spec` framing language softened — this is now just a reference doc, not part of a tier
- Cross-references updated: `90_reference/01_master_vulnerability_reference.md` → `knowledge/vulnerability-reference.md`; `30_rules/injection/` → `rules/injection/`; `_SANITIZER_REGISTRY.md` → `knowledge/sanitizer-registry.md`

Required sections (carry forward from source):
1. `# Taint Model` + opening
2. `## Sources` — list of pseudo-variables and constructs that introduce attacker-controlled data: `$rU`, `$fU`, `$tU`, `$ru`, `$ai`, `$hdr(*)`, `$rb`, request URI parameters, etc. Each with a 1-line note on what kind of attacker controls it.
3. `## Sanitizers` — the recognized transformations. Reference `knowledge/sanitizer-registry.md` for the canonical list; this section explains the *concept*.
4. `## Sinks` — the constructs where tainted data is dangerous: `avp_db_query()`, `db_query()`, `exec_msg()`, `exec_avp()`, `xlog` with format strings, `append_hf` with attacker data, `subst_uri` with attacker data, etc.
5. `## Propagation` — assignment rules: AVPs and pseudo-variables propagate taint. `$var(x) = $rU` makes `$var(x)` tainted.
6. `## Path Sensitivity` — v1 is not path-sensitive. A sanitization branch followed by a sink in another branch does not clear taint of the sink-branch usage.

Length target: ~3 KB (matches source).

- [ ] **Step 3: Verify and commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/taint-model.md
git commit -m "feat(security-advisor): add references/taint-model.md (sources, sanitizers, sinks)

Adapted from Chat B's 16_TAINT_MODEL.md (accepted by Thread 0 as
canonical). Cross-references updated to v1 paths. Path-insensitivity
made explicit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 — Migrate 58 rules

### Task 6: Bulk-migrate Chat B's 58 rules into `references/rules/`

**Why a single task:** the migration is mechanical and identical for all 58 files. Splitting it into 12 per-domain tasks adds ceremony without isolation benefit.

**Files:**
- Create dirs: 12 family folders under `plugins/opensips/skills/opensips-security-advisor/references/rules/`
- Create files: 58 rule files (one per source rule)
- Create files: 12 `_index.md` files (one per family)

**Migration map:**

| Source folder (under `chat-b-bundle/30_rules/`) | Destination folder (under `references/rules/`) | ID prefix in source | ID prefix at destination | Rule count |
|---|---|---|---|---|
| `auth/` | `auth/` | `AUTH` | `AUTH` | 8 |
| `config_hygiene/` | `config-hygiene/` | `CONFIG_HYGIENE` | `HYG` | 4 |
| `dispatcher_and_lb/` | `dispatcher-and-lb/` | `DISPATCHER_AND_LB` | `LB` | 3 |
| `dos_defense/` | `dos-defense/` | `DOS_DEFENSE` | `DOS` | 5 |
| `identity_spoofing/` | `identity-spoofing/` | `IDENTITY_SPOOFING` | `ID` | 3 |
| `injection/` | `injection/` | `INJECTION` | `INJ` | 6 |
| `media/` | `media/` | `MEDIA` | `MEDIA` | 4 |
| `mi_exposure/` | `mi-exposure/` | `MI_EXPOSURE` | `MI` | 5 |
| `relay_and_routing/` | `relay-and-routing/` | `RELAY_AND_ROUTING` | `RELAY` | 5 |
| `stir_shaken/` | `stir-shaken/` | `STIR_SHAKEN` | `STIR` | 4 |
| `tls/` | `tls/` | `TLS` | `TLS` | 7 |
| `tracing_and_logging/` | `tracing-and-logging/` | `LOG` | `LOG` | 4 |

Wait — `tracing_and_logging` source IDs are `TRACING_AND_LOGGING-NNN`, NOT `LOG-NNN`. Verify by reading any source file. The mapping above for source ID prefix is the **source** prefix; the destination prefix is the canonicalized short code.

- [ ] **Step 1: Sanity-check source ID prefixes**

```bash
for d in plugins/opensips/skills/opensips-security-advisor/references/rules/; do echo "(no-op, dir doesn't exist yet)"; done
ls docs/research/security-advisor-consolidation/chat-b-bundle/30_rules/
for d in docs/research/security-advisor-consolidation/chat-b-bundle/30_rules/*/; do
  basename=$(basename "$d")
  echo "=== $basename ==="
  grep -h '^id:' "$d"OSIPS-SEC-*.md 2>/dev/null | head -2
done
```

Confirm the source ID prefix per family before proceeding. Update the migration map's "ID prefix in source" column if anything differs.

- [ ] **Step 2: Create the 12 destination directories**

```bash
RULES_DIR=plugins/opensips/skills/opensips-security-advisor/references/rules
for fam in auth config-hygiene dispatcher-and-lb dos-defense identity-spoofing injection media mi-exposure relay-and-routing stir-shaken tls tracing-and-logging; do
  mkdir -p "$RULES_DIR/$fam"
done
```

- [ ] **Step 3: Write a one-off migration script and run it**

Write `scripts/migrate-security-rules.sh` (a temporary script — delete after the task). It:
- Walks each source family folder
- For each rule file, reads the source `id:` field, applies the prefix rewrite, writes the file to the destination folder
- Rewrites internal references: `30_rules/<src_family>/` → `rules/<dst_family>/`; `90_reference/01_master_vulnerability_reference.md` → `../../knowledge/vulnerability-reference.md`; `90_reference/sanitizer_registry.yaml` → `../../knowledge/sanitizer-registry.md`; `_SANITIZER_REGISTRY.md` → `../../knowledge/sanitizer-registry.md`
- Rewrites the `id:` field in frontmatter from source prefix to destination prefix
- Renames the file from `OSIPS-SEC-<SRC_PREFIX>-NNN.md` to `OSIPS-SEC-<DST_PREFIX>-NNN.md`
- Skips `_index.md` (handled separately in step 5)

Script content:

```bash
#!/usr/bin/env bash
set -euo pipefail

SRC_BASE="docs/research/security-advisor-consolidation/chat-b-bundle/30_rules"
DST_BASE="plugins/opensips/skills/opensips-security-advisor/references/rules"

# Family map: src_dir|dst_dir|src_prefix|dst_prefix
MAP=(
  "auth|auth|AUTH|AUTH"
  "config_hygiene|config-hygiene|CONFIG_HYGIENE|HYG"
  "dispatcher_and_lb|dispatcher-and-lb|DISPATCHER_AND_LB|LB"
  "dos_defense|dos-defense|DOS_DEFENSE|DOS"
  "identity_spoofing|identity-spoofing|IDENTITY_SPOOFING|ID"
  "injection|injection|INJECTION|INJ"
  "media|media|MEDIA|MEDIA"
  "mi_exposure|mi-exposure|MI_EXPOSURE|MI"
  "relay_and_routing|relay-and-routing|RELAY_AND_ROUTING|RELAY"
  "stir_shaken|stir-shaken|STIR_SHAKEN|STIR"
  "tls|tls|TLS|TLS"
  "tracing_and_logging|tracing-and-logging|TRACING_AND_LOGGING|LOG"
)

for entry in "${MAP[@]}"; do
  IFS='|' read -r src_dir dst_dir src_prefix dst_prefix <<< "$entry"
  echo "=== $src_dir → $dst_dir ($src_prefix → $dst_prefix) ==="

  for src_file in "$SRC_BASE/$src_dir"/OSIPS-SEC-*.md; do
    [[ -e "$src_file" ]] || continue
    src_basename=$(basename "$src_file")
    dst_basename="${src_basename/OSIPS-SEC-${src_prefix}-/OSIPS-SEC-${dst_prefix}-}"
    dst_file="$DST_BASE/$dst_dir/$dst_basename"

    # Pipeline of sed transforms:
    #  1. Rewrite the id: frontmatter field
    #  2. Rewrite the master vuln reference path
    #  3. Rewrite the sanitizer registry path
    #  4. Rewrite the rules path prefix
    sed -e "s|^id: OSIPS-SEC-${src_prefix}-|id: OSIPS-SEC-${dst_prefix}-|" \
        -e "s|90_reference/01_master_vulnerability_reference.md|../../knowledge/vulnerability-reference.md|g" \
        -e "s|90_reference/sanitizer_registry.yaml|../../knowledge/sanitizer-registry.md|g" \
        -e "s|30_rules/${src_dir}/|rules/${dst_dir}/|g" \
        -e "s|_SANITIZER_REGISTRY.md|../../knowledge/sanitizer-registry.md|g" \
        "$src_file" > "$dst_file"

    echo "  $src_basename → $dst_basename"
  done
done

echo "=== Final counts ==="
for entry in "${MAP[@]}"; do
  IFS='|' read -r src_dir dst_dir src_prefix dst_prefix <<< "$entry"
  count=$(find "$DST_BASE/$dst_dir" -maxdepth 1 -name "OSIPS-SEC-*.md" -type f | wc -l)
  echo "  $dst_dir: $count rules"
done
```

Run it:

```bash
mkdir -p scripts
# write the script content above to scripts/migrate-security-rules.sh
chmod +x scripts/migrate-security-rules.sh
bash scripts/migrate-security-rules.sh
```

Expected total output across the 12 folders: **58 rule files**. Per-folder counts must match: auth=8, config-hygiene=4, dispatcher-and-lb=3, dos-defense=5, identity-spoofing=3, injection=6, media=4, mi-exposure=5, relay-and-routing=5, stir-shaken=4, tls=7, tracing-and-logging=4.

- [ ] **Step 4: Spot-check three migrated files**

```bash
head -15 plugins/opensips/skills/opensips-security-advisor/references/rules/auth/OSIPS-SEC-AUTH-001.md
head -15 plugins/opensips/skills/opensips-security-advisor/references/rules/config-hygiene/OSIPS-SEC-HYG-001.md
head -15 plugins/opensips/skills/opensips-security-advisor/references/rules/tracing-and-logging/OSIPS-SEC-LOG-001.md
```

Verify: the `id:` field reads `OSIPS-SEC-AUTH-001`, `OSIPS-SEC-HYG-001`, `OSIPS-SEC-LOG-001` respectively. References do not contain `90_reference/` or `30_rules/` paths anymore.

- [ ] **Step 5: Author the 12 family `_index.md` files**

These are short (≤1 KB each) navigation aids. Each one lists the rules in its family with a one-line description.

For each family folder, create `_index.md` with this structure:

```markdown
# <Family Title>

Rules in this family target <vulnerability class>.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-<DST>-001 | <title from frontmatter> | <severity> |
| ... | ... | ... |
```

Pull the title and severity values from each rule's frontmatter. Suggest a small bash one-liner per family — example for auth:

```bash
DST_DIR=plugins/opensips/skills/opensips-security-advisor/references/rules/auth
{
  echo "# Authentication & Credential Storage"
  echo
  echo "Rules in this family target authentication-related risks: weak credential storage, missing or bypassable challenge-response, insecure JWT or PAI handling, OpenSIPs CVE-2026-25554 (auth_jwt SQL injection)."
  echo
  echo "| Rule ID | Title | Severity |"
  echo "|---|---|---|"
  for f in "$DST_DIR"/OSIPS-SEC-AUTH-*.md; do
    id=$(grep -m1 '^id:' "$f" | sed 's/^id: //')
    title=$(grep -m1 '^title:' "$f" | sed 's/^title: //')
    sev=$(grep -m1 '^severity:' "$f" | sed 's/^severity: //')
    echo "| $id | $title | $sev |"
  done
} > "$DST_DIR/_index.md"
```

Repeat for the other 11 families with appropriate family titles and one-paragraph descriptions:
- `config-hygiene/_index.md` — "Configuration hygiene with security implications"
- `dispatcher-and-lb/_index.md` — "Dispatcher and load-balancer rules"
- `dos-defense/_index.md` — "Denial-of-service defenses (rate limiting, flood protection, parser hardening)"
- `identity-spoofing/_index.md` — "Caller-identity spoofing and From/To header abuse"
- `injection/_index.md` — "SQL, shell, header, and template injection"
- `media/_index.md` — "Media plane (RTP/RTCP) exposure and proxy hardening"
- `mi-exposure/_index.md` — "Management interface exposure (mi_http, mi_datagram)"
- `relay-and-routing/_index.md` — "Open-relay risks, loop detection, and routing-loop hygiene"
- `stir-shaken/_index.md` — "STIR/SHAKEN identity attestation rules"
- `tls/_index.md` — "TLS posture: ciphers, certificate verification, listener scope"
- `tracing-and-logging/_index.md` — "Tracing and logging hygiene (sensitive data exposure)"

- [ ] **Step 6: Delete the migration script (one-time use)**

```bash
rm scripts/migrate-security-rules.sh
```

- [ ] **Step 7: Verify final state**

```bash
find plugins/opensips/skills/opensips-security-advisor/references/rules -name "OSIPS-SEC-*.md" | wc -l
# Expected: 58
find plugins/opensips/skills/opensips-security-advisor/references/rules -name "_index.md" | wc -l
# Expected: 12
```

- [ ] **Step 8: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/rules/
git commit -m "feat(security-advisor): migrate 58 rules from Chat B catalog into v1 tree

12 family folders renamed to kebab-case. ID prefixes canonicalized to
short codes (AUTH, INJ, MI, TLS, DOS, RELAY, ID, STIR, MEDIA, LB,
LOG, HYG). Internal references rewritten to v1 paths. Per-family
_index.md added for navigation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4 — Author version notes

These four files can be authored in parallel.

### Task 7: Author `references/version-notes/3.4.md`, `3.5.md`, `3.6.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/version-notes/3.4.md`
- Create: `plugins/opensips/skills/opensips-security-advisor/references/version-notes/3.5.md`
- Create: `plugins/opensips/skills/opensips-security-advisor/references/version-notes/3.6.md`

**Source material:**
- `docs/research/security-advisor-consolidation/chat-c-canonical-tree/40_versions/3.4.md`
- `docs/research/security-advisor-consolidation/chat-c-canonical-tree/40_versions/3.5.md`
- `docs/research/security-advisor-consolidation/chat-c-canonical-tree/40_versions/3.6.md`

- [ ] **Step 1: Read the three Chat C version notes**

These are already well-structured. Each has: release line dates, known CVEs in the line, module set notes, deprecations, migration concerns.

- [ ] **Step 2: Copy each to the new location with path rewrites**

For each:
- Replace `90_reference/01_master_vulnerability_reference.md` → `../knowledge/vulnerability-reference.md`
- Replace `30_rules/` → `../rules/`
- Strip any framing language about "Tier 4" or "version overlay" — these are now just "version notes"
- Verify CVE entries match what's in `chat-c-canonical-tree/90_reference/01_master_vulnerability_reference.md` (Chat C corrected CVE-2026-25554; the corrected values must propagate)

```bash
SRC=docs/research/security-advisor-consolidation/chat-c-canonical-tree/40_versions
DST=plugins/opensips/skills/opensips-security-advisor/references/version-notes
mkdir -p "$DST"

for ver in 3.4 3.5 3.6; do
  sed -e "s|90_reference/01_master_vulnerability_reference.md|../knowledge/vulnerability-reference.md|g" \
      -e "s|30_rules/|../rules/|g" \
      "$SRC/$ver.md" > "$DST/$ver.md"
done
```

- [ ] **Step 3: Author `4.0.md`**

OpenSIPs 4.0 has no Chat C-authored version note. Author from scratch using the same structure as 3.6.md. Required sections:

```markdown
# OpenSIPs 4.0 — Version Notes

This document captures the version-specific deltas, known CVEs, module-set context, and migration concerns relevant to advisor rules that target the OpenSIPs 4.0 release line.

OpenSIPs 4.0 is the current development line. Rules targeting 4.0 must declare `applies_if_opensips_version: ">=4.0"` to avoid skipped-rule diagnostics on earlier releases.

---

## Release line

- **First release.** OpenSIPs 4.0.0.
- **EOL status.** Active development line.

---

## Known CVEs in this release line

CVE-2026-25554 (auth_jwt SQL injection) — affected versions are documented as "3.1 through 3.6.4 prior to commit 3822d33." OpenSIPs 4.0 inherits the fix and is not vulnerable. Cited rule: `OSIPS-SEC-AUTH-004`.

For the full vulnerability reference, see `../knowledge/vulnerability-reference.md` § 12 (CVE Inventory).

---

## Module set notes

Rules targeting modules introduced or significantly changed in 4.0 must use `applies_if_opensips_version: ">=4.0"`. Rules targeting modules common to 3.4–4.0 should leave the version field unset or use `>=3.4`.

When the `opensips-config` skill's reference data for 4.0 documents a module not present in earlier versions, security-advisor rules referencing that module should declare the version gate explicitly. Identifier sanity-checking against `opensips-config/references/4.0/` is the source of truth for what exists in 4.0.

---

## Migration concerns

Configurations migrating from 3.6 to 4.0 should be reviewed against:
- Any rule with `applies_if_opensips_version` containing a `<` upper bound that includes 3.6 — those rules may not fire on 4.0 even if the underlying construct is still present.
- Module renames or removals between 3.6 and 4.0 — surface as `review_required` if an identifier is not in the 4.0 reference set.
```

- [ ] **Step 4: Verify and commit**

```bash
ls plugins/opensips/skills/opensips-security-advisor/references/version-notes/
# Expected: 3.4.md  3.5.md  3.6.md  4.0.md

git add plugins/opensips/skills/opensips-security-advisor/references/version-notes/
git commit -m "feat(security-advisor): add version-notes for 3.4, 3.5, 3.6, 4.0

3.4-3.6 adapted from Chat C canonical tree with path rewrites.
4.0 authored from scratch following the same structure.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 5 — Author knowledge docs

These four can be authored in parallel.

### Task 8: Migrate `references/knowledge/vulnerability-reference.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/knowledge/vulnerability-reference.md`

**Source:** `docs/research/security-advisor-consolidation/chat-c-canonical-tree/90_reference/01_master_vulnerability_reference.md` (verified by Chat C against authoritative external sources per the chat-c-activity-log)

- [ ] **Step 1: Copy with path rewrites**

```bash
SRC=docs/research/security-advisor-consolidation/chat-c-canonical-tree/90_reference/01_master_vulnerability_reference.md
DST=plugins/opensips/skills/opensips-security-advisor/references/knowledge/vulnerability-reference.md
mkdir -p "$(dirname "$DST")"

sed -e "s|90_reference/external_sources.md|external-sources.md|g" \
    -e "s|30_rules/|../rules/|g" \
    "$SRC" > "$DST"
```

- [ ] **Step 2: Strip Phase 2 framing**

The file references "Phase 2 master vulnerability reference" in its provenance section. Edit those references to read "Vulnerability reference for the OpenSIPs Security Advisor skill" — this is now THE reference doc, not a phased deliverable. Use the Edit tool.

- [ ] **Step 3: Verify all 17 sections still present**

```bash
grep -c '^## [0-9]' plugins/opensips/skills/opensips-security-advisor/references/knowledge/vulnerability-reference.md
# Expected: 17
```

- [ ] **Step 4: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/knowledge/vulnerability-reference.md
git commit -m "feat(security-advisor): add knowledge/vulnerability-reference.md

Migrated from Chat C canonical tree (CVE values verified by Chat C
against VulnCheck, NVD, AISLE Research, and Enable Security advisory
pages). Phased-deliverable framing removed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Author `references/knowledge/sanitizer-registry.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/knowledge/sanitizer-registry.md`

**Source materials (must reconcile both):**
- `docs/research/security-advisor-consolidation/chat-c-canonical-tree/90_reference/sanitizer_registry.yaml` (YAML format, Chat C's verified version)
- `docs/research/security-advisor-consolidation/chat-b-bundle/30_rules/_SANITIZER_REGISTRY.md` (Markdown, Chat B's broader version with note about missing transforms)

- [ ] **Step 1: Read both sources**

- [ ] **Step 2: Author the merged Markdown registry**

Required sections:

1. `# Sanitizer Registry` — opening: "Recognized OpenSIPs script transformations that are accepted as effective sanitizers for the corresponding sink class. A taint-tracking rule that matches a tainted source flowing to a sink is suppressed if the value passes through one of these transformations on every reachable path."

2. `## SQL sinks` — table of sanitizers accepted for SQL injection (`avp_db_query`, `db_query`):
   - `$(var{s.escape.common})` — comprehensive SQL escaping (RECOMMENDED)
   - `$(var{s.escape.common.back})` — comprehensive + backslash
   - `$(var{s.escape.user})` — userinfo-only (sufficient if URI-bound)
   - `$(var{s.escape.param})` — parameter-only
   - Plus: parameterized query construction via `db_url`-bound prepared placeholders if introduced via API rather than text concat (note caveat).

3. `## Shell sinks` — for `exec_msg`, `exec_avp`:
   - No safe sanitizer for shell metacharacters via OpenSIPs script transformations alone. Always abstain. Recommend rewriting to use a wrapper script with explicit argument arrays.

4. `## Header injection sinks` — for `append_hf`, `subst_uri`, `replace_hdrs`:
   - `$(var{s.escape.crlf})` — strips CR/LF
   - `$(var{s.encode.uri})` — RFC 3986 percent-encoding (correct for URI components, wrong for header values)
   - Plus length bounds enforced via `if (strlen(...) < N)` guards.

5. `## URI sinks` — for `rewriteuri`, `setruri`, etc.:
   - `$(var{s.encode.uri})` — RFC 3986 percent-encoding for URI userinfo components

6. `## Recognition rules` — when Claude evaluates a rule with taint-tracking semantics, it accepts a sanitizer if and only if: (a) the sanitizer is listed in this registry for the matched sink class; (b) the sanitizer is applied unconditionally on every reachable path from source to sink (path-insensitivity caveat from `taint-model.md`); (c) no further mutation occurs after the sanitizer that could re-introduce attacker-controlled syntax.

7. `## Custom sanitizers` — operators may define custom sanitizers via `subst_avp` or scripted regex. These are NOT listed here. When a rule fires `review_required` because of an unrecognized custom sanitizer, the report should suggest adding the custom sanitizer to operator-internal documentation; the advisor cannot prove safety without inspecting the regex.

- [ ] **Step 3: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/knowledge/sanitizer-registry.md
git commit -m "feat(security-advisor): add knowledge/sanitizer-registry.md (merged registry)

Reconciles Chat C's verified YAML registry with Chat B's broader
Markdown version. Recognition rules made explicit. Custom sanitizers
acknowledged as out-of-scope for static recognition.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Author `references/knowledge/ser-lineage-notes.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/knowledge/ser-lineage-notes.md`

**Source material:**
- `plugins/opensips/skills/opensips-config/references/3.6/ser-lineage-notes.md` (sibling skill's existing version — read but adapt; do not duplicate verbatim because phrasing differs by audience)
- `docs/architecture/adr/008-ser-lineage-neutral-framing.md`

- [ ] **Step 1: Read the sibling and the ADR**

- [ ] **Step 2: Author the security-advisor-specific lineage notes**

Required content:

1. `# SER-Lineage Notes` — opening: "OpenSIPs is one of several projects descending from the SIP Express Router. The projects share architectural ancestry but configuration syntax, function signatures, and module exports have diverged. Identifiers from sibling SER-lineage projects look plausible inside an OpenSIPs config but produce silent failures or wrong behavior at runtime."

2. `## Why this matters for security review` — when a config under review uses an identifier not present in `opensips-config/references/{version}/consolidated.json`, the advisor cannot apply OpenSIPs rules to that construct. Three possibilities, in order of likelihood:
   - Typo or version drift — ask the user to confirm
   - SER-lineage import — the user pasted snippets from a sibling project
   - Genuinely-undocumented OpenSIPs identifier — possible but unusual; confirm by reading the user's loaded module list

3. `## Reporting unrecognized identifiers` — emit a `review_required` finding citing the unrecognized identifier, the location, and the question to ask the user. Do NOT name specific sibling projects per ADR-008. Phrase as "this identifier is not documented for the active OpenSIPs version" or "this construct may be from a sibling SER-lineage project."

4. `## Anti-hallucination rules` — when authoring a remediation:
   - Never suggest functions, modules, or pseudo-variables not documented in `opensips-config/references/{version}/`. If a remediation requires a construct not in the reference set, abstain and recommend the user consult OpenSIPs documentation directly.
   - Never invent OpenSIPs identifiers to match a pattern from a sibling project.
   - When in doubt, ask.

5. `## Cross-reference` — point at ADR-008 (`docs/architecture/adr/008-ser-lineage-neutral-framing.md`) for the project-wide rationale.

- [ ] **Step 3: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/knowledge/ser-lineage-notes.md
git commit -m "feat(security-advisor): add knowledge/ser-lineage-notes.md (anti-hallucination)

SER-lineage neutral framing per ADR-008 specialized for security
review context. Unrecognized identifiers are reported as
review_required, not invented around. Anti-hallucination rules
explicit for remediation authoring.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Migrate `references/knowledge/external-sources.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/references/knowledge/external-sources.md`

**Source:** `docs/research/security-advisor-consolidation/chat-c-canonical-tree/90_reference/external_sources.md`

- [ ] **Step 1: Copy verbatim with no path rewrites**

```bash
cp docs/research/security-advisor-consolidation/chat-c-canonical-tree/90_reference/external_sources.md \
   plugins/opensips/skills/opensips-security-advisor/references/knowledge/external-sources.md
```

- [ ] **Step 2: Open and skim — adjust framing if it references "Phase X" or "Tier Y"**

Use Edit if needed. Otherwise leave verbatim.

- [ ] **Step 3: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/references/knowledge/external-sources.md
git commit -m "feat(security-advisor): add knowledge/external-sources.md (citation list)

Verbatim copy of Chat C's verified external sources list.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 6 — Move fixtures and write test strategy

### Task 12: Move fixtures + write test-strategy

**Files:**
- Create dirs: `docs/testing/security-advisor/fixtures/{clean,vulnerable,tricky,golden-reports}/`
- Move: all files from parent-level `50_fixtures/` to the new location
- Create: `docs/testing/security-advisor/test-strategy.md`

- [ ] **Step 1: Create destination dirs**

```bash
mkdir -p docs/testing/security-advisor/fixtures/{clean,vulnerable,tricky,golden-reports}
```

- [ ] **Step 2: Move the parent-level fixtures**

```bash
SRC=plugins/opensips/skills/opensips-security-advisor/50_fixtures
DST=docs/testing/security-advisor/fixtures

mv "$SRC"/clean/* "$DST/clean/"
mv "$SRC"/vulnerable/* "$DST/vulnerable/"
mv "$SRC"/tricky/* "$DST/tricky/"
mv "$SRC"/golden_reports/* "$DST/golden-reports/"
rmdir "$SRC"/clean "$SRC"/vulnerable "$SRC"/tricky "$SRC"/golden_reports
```

(Note: `golden_reports` snake_case → `golden-reports` kebab-case at destination.)

- [ ] **Step 3: Strip hardening-index references from the 3 golden reports**

Per spec, hardening index is out of v1. Open each golden report and:
- Remove any "Hardening Index: NN" line in the report header
- Remove any narrative paragraph that explains the score
- Remove any `expected_hardening_index_range` entries from the corresponding `.expected.json` files in `clean/`, `vulnerable/`, `tricky/`

```bash
# Audit which files mention the hardening index:
grep -rln -i "hardening" docs/testing/security-advisor/fixtures/
```

For each match, use the Edit tool to remove the offending lines/sections. Be surgical — do not delete other content.

- [ ] **Step 4: Author `docs/testing/security-advisor/test-strategy.md`**

**Source material:**
- `docs/research/security-advisor-consolidation/chat-c-canonical-tree/20_runtime/25_FIXTURE_SCHEMA.md`

Required sections:

1. `# Test Strategy — opensips-security-advisor`
2. `## Validation Approach` — the skill is read-only Markdown; there is no automated harness in v1. Validation is manual: open Claude Code in this repo, point the skill at a fixture, compare output to the golden report.
3. `## Fixture Schema` — adapted from `25_FIXTURE_SCHEMA.md`. Each fixture has:
   - `<name>.cfg` — the OpenSIPs configuration under review
   - `<name>.expected.json` — anchored expectations: `expected_findings` list, `must_not_fire` list, `must_not_fire_as_vulnerability` list, `tolerance_lines` (acceptable line-number drift)
4. `## Categories`
   - `clean/` — should produce zero vulnerability findings; only `info`-class observations
   - `vulnerable/` — should produce multiple findings across families
   - `tricky/` — edge cases for false-positive containment, abstention semantics, dead code, comments, custom sanitizers, multi-listener, nested includes, partially-mitigated SQLi, version-mismatch, dialect drift
5. `## Golden Reports` — three Markdown narratives in `golden-reports/`. These show the human-readable output the skill should produce for each canonical fixture (`clean_l1`, `vulnerable_mixed`, `tricky_abstention`). Updates to the report template require re-rendering.
6. `## Smoke-Test Procedure (manual)` — exact steps:
   1. From the repo root: `claude --plugin-dir ./plugins/opensips`
   2. In the session: `/skills` and confirm both `opensips-config` and `opensips-security-advisor` are listed
   3. Run the prompt: "Review this opensips.cfg for security issues: [paste contents of `fixtures/vulnerable/vulnerable-mixed.cfg`]. Target version 3.6, profile L2."
   4. Confirm the response triggers the security advisor skill, runs intake (or accepts the inline answers), reads the appropriate rule files, produces a Markdown report.
   5. Compare the report's structure and severity-ranked findings to `golden-reports/golden_vulnerable_mixed.md`. Cited findings should match by ID; phrasing may differ.
7. `## What Counts as a Regression` — adding a finding the golden doesn't have, removing a finding the golden has, downgrading severity, removing a citation. Phrasing differences and re-ordering within a severity tier are NOT regressions.

- [ ] **Step 5: Commit**

```bash
git add docs/testing/security-advisor/
git commit -m "feat(security-advisor): move fixtures to docs/testing, add test strategy

Fixtures relocated outside the published skill tree per v1 spec.
Hardening-index references stripped from golden reports and
expected.json files. Manual smoke-test procedure documented; no
automated harness in v1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 7 — Author SKILL.md and wire up the plugin

### Task 13: Author the canonical SKILL.md

**Files:**
- Create: `plugins/opensips/skills/opensips-security-advisor/SKILL.md`

**Source material to consult:**
- `plugins/opensips/skills/opensips-security-advisor/SKILL.md.scaffold` (existing scaffold, harvest the integration contract section)
- `plugins/opensips/skills/opensips-config/SKILL.md` (sibling skill — match the authorial voice)
- `docs/research/security-advisor-consolidation/chat-a-bundle/thread-orchestration/THREAD_3_SKILL_MD_PROMPT.md` (Chat A's authoring guide for SKILL.md)

- [ ] **Step 1: Read the scaffold, the sibling SKILL.md, and the THREAD_3 prompt**

- [ ] **Step 2: Write the canonical SKILL.md**

The frontmatter MUST be:

```yaml
---
name: opensips-security-advisor
description: |-
  Reviews OpenSIPs configurations for security issues — authentication and credential storage, injection (SQL/shell/header), MI exposure, TLS posture, DoS surfaces, relay and routing risks, identity spoofing, STIR/SHAKEN, media plane, dispatcher/load-balancer, tracing/logging hygiene, and configuration hygiene. Use whenever the user asks for a security review, audit, or hardening check on an OpenSIPs config, mentions risks like SIP scanning, spoofed REGISTER, INVITE flood, toll fraud, MI exposure, RTP relay misuse, or cites a CVE in an OpenSIPs context. Do NOT use for general SIP security advice unrelated to OpenSIPs configuration.
allowed-tools: Read, Glob, Grep
---
```

Required body sections (in order):

1. `## Overview` — one paragraph: "This skill reviews OpenSIPs configurations for security issues. It is one of two skills in the `opensips-skills` plugin. It is read-only — it does not modify any file. It produces a Markdown report enumerating findings by severity, with cited remediations."

2. `## When to use this skill` — bulleted list of trigger contexts: explicit security audit, hardening for a specific category, CVE references in OpenSIPs context, suspicion of compromise on a deployed proxy, pre-deployment review.

3. `## When NOT to use this skill` — defer to `opensips-config` for: authoring/editing a config, looking up a module's exports, asking what a function or pseudo-variable does. Defer to general SIP security guidance for: non-OpenSIPs SIP servers, SIP protocol questions unrelated to a config.

4. `## How to use the references` — the navigation table:

   | When you're about to ... | Read |
   |---|---|
   | Start any review | `references/workflow.md` |
   | Render the final report | `references/output-format.md` |
   | Decide a finding's severity or which profile a rule applies to | `references/taxonomy.md` |
   | Reason about an injection-class rule | `references/taint-model.md` |
   | Find rules in a specific family | `references/rules/<family>/_index.md` then individual rule files |
   | Look up CVE details or threat-model context | `references/knowledge/vulnerability-reference.md` |
   | Decide whether a sanitizer in the cfg is sufficient | `references/knowledge/sanitizer-registry.md` |
   | Encounter an unrecognized identifier | `references/knowledge/ser-lineage-notes.md` |
   | Cite an authoritative external source | `references/knowledge/external-sources.md` |
   | Apply a version-specific consideration | `references/version-notes/<X.Y>.md` |

5. `## Integration contract — reading from `opensips-config`` — point at `../opensips-config/references/{version}/consolidated.json` for identifier sanity-check, `../opensips-config/references/{version}/modules-index.md` for the catalog, `../opensips-config/references/{version}/modules/<module>.md` for per-module docs, `../opensips-config/references/{version}/cfg-format.md` for cfg structure. This skill READS but does not WRITE to the sibling skill's tree.

6. `## SER-lineage guardrail` — one paragraph + pointer to `references/knowledge/ser-lineage-notes.md`. Per ADR-008, do not name specific sibling SER-lineage projects in any output.

7. `## Workflow entry point` — one short instruction: "Always start by reading `references/workflow.md` end-to-end. The workflow doc enumerates the steps; this SKILL.md is a router only."

Length target: ~3-4 KB. Should be SHORT and POINT AT the references — not duplicate them.

- [ ] **Step 3: Delete the scaffold**

```bash
rm plugins/opensips/skills/opensips-security-advisor/SKILL.md.scaffold
```

- [ ] **Step 4: Verify both files**

```bash
ls plugins/opensips/skills/opensips-security-advisor/SKILL.md
test ! -f plugins/opensips/skills/opensips-security-advisor/SKILL.md.scaffold && echo "scaffold removed"
head -10 plugins/opensips/skills/opensips-security-advisor/SKILL.md
```

- [ ] **Step 5: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/SKILL.md plugins/opensips/skills/opensips-security-advisor/SKILL.md.scaffold
git commit -m "feat(security-advisor): add canonical SKILL.md, retire scaffold

Skill is now active. Frontmatter trigger covers all 12 rule families.
Body is a router pointing at references/; workflow.md is the
procedural spine.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Update `plugin.json` and the plugin README

**Files:**
- Modify: `plugins/opensips/.claude-plugin/plugin.json`
- Modify: `plugins/opensips/README.md`
- Modify: `plugins/opensips/skills/opensips-security-advisor/README.md`

- [ ] **Step 1: Read the current `plugin.json`**

```bash
cat plugins/opensips/.claude-plugin/plugin.json
```

- [ ] **Step 2: Update `plugin.json`**

If `plugin.json` declares skills explicitly, add `opensips-security-advisor` to the list. If it auto-discovers from `skills/` (most common), no edit needed — but bump the version field. Use the Edit tool. Bump version to `1.1.0`.

- [ ] **Step 3: Update `plugins/opensips/README.md`**

Find the section describing skills. Replace any mention of "one skill ships in v1" or "security advisor coming in a follow-up release" with a list of the two active skills:
- `opensips-config` — authors and edits opensips.cfg, version-aware module reference
- `opensips-security-advisor` — reviews opensips.cfg for security issues across 12 categories

- [ ] **Step 4: Replace the skill's own README**

The current `plugins/opensips/skills/opensips-security-advisor/README.md` says "scaffold, disabled in v1." Replace with v1.1 release notes:

```markdown
# opensips-security-advisor

Active skill in v1.1 of the `opensips-skills` plugin. Reviews OpenSIPs
configurations for security issues across 12 vulnerability families:
authentication, injection, MI exposure, TLS posture, DoS defense,
relay and routing, identity spoofing, STIR/SHAKEN, media, dispatcher
and load-balancer, tracing and logging, and configuration hygiene.

Read-only. Produces a Markdown report. Reads sibling skill
`opensips-config`'s reference data for identifier sanity-checking.

Entry point: `SKILL.md`. Procedural spine: `references/workflow.md`.

For the design rationale and v1 scope, see
`docs/superpowers/specs/2026-04-29-opensips-security-advisor-v1-design.md`
and `docs/architecture/adr/014-security-advisor-v1-single-skill.md`.
```

- [ ] **Step 5: Commit**

```bash
git add plugins/opensips/.claude-plugin/plugin.json plugins/opensips/README.md plugins/opensips/skills/opensips-security-advisor/README.md
git commit -m "feat(plugin): activate opensips-security-advisor in v1.1.0

Bump plugin version. Update plugin README to list both active skills.
Replace skill-folder README's 'scaffold/disabled' content with v1.1
release notes pointing at SKILL.md and design docs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 8 — Final cleanup, ADR, smoke test

### Task 15: Write ADR-014

**Files:**
- Create: `docs/architecture/adr/014-security-advisor-v1-single-skill.md`
- Modify: `docs/architecture/adr/013-merge-routing-and-modules-into-opensips-config.md` (add a "Superseded-in-part by" status note pointing at 014)

- [ ] **Step 1: Read ADR-013 to understand the prior decision**

- [ ] **Step 2: Write ADR-014**

Required sections (use the template in `docs/architecture/adr/000-template.md`):

```markdown
# ADR-014: opensips-security-advisor v1 — single skill, cross-version, semantic folders

**Status:** Accepted
**Date:** 2026-04-29
**Supersedes (in part):** ADR-013 (which deferred the security advisor to a follow-up release)

## Context

The `opensips-security-advisor` skill was scaffolded under ADR-013
with `SKILL.md.scaffold` (disabled). Three independent authoring
agents (Chats A, B, C) produced overlapping research material; a
Thread 0 consolidation pass produced a partial canonical tree but
left the skill non-functional and the source bundles in place.

Putting the advisor in front of users requires committing to: (a) one
canonical structure for the skill, (b) a v1 scope that is shippable
without further research, (c) cleanup of the parallel research trees.

## Decision

Ship the security advisor as **one skill, cross-version**, with a
semantic folder layout under `references/`:

- `references/{workflow,output-format,taxonomy,taint-model}.md` — four
  reference docs collapsed from 13 bundle docs.
- `references/rules/<family>/` — 12 family folders, 58 rules total.
- `references/version-notes/<X.Y>.md` — per-version CVE inventory and
  module deltas for 3.4, 3.5, 3.6, 4.0.
- `references/knowledge/{vulnerability-reference,sanitizer-registry,
  ser-lineage-notes,external-sources}.md` — supporting reference
  material.

Version-specific concerns are expressed inline in rule frontmatter
(`applies_if_opensips_version`) and in `version-notes/`. The skill
itself is NOT partitioned per OpenSIPs version (unlike
`opensips-config`).

Fixtures and golden reports move outside the skill tree to
`docs/testing/security-advisor/`.

The three chat bundles, Thread 0 state, and reconciliation logs move
to `docs/research/security-advisor-consolidation/`. Preserved on
disk, do not ship via the plugin.

## Out of v1 (deliberately, not as TODOs)

- Hardening-index numerical score — both Chat A and Chat C proposed
  formulas; neither was empirically validated. v1 ships severity-ranked
  findings without an aggregate score.
- SARIF output — Markdown only.
- L3 deployment profile — only L1 (enterprise PBX) and L2 (carrier
  edge) in v1.
- Schema-versioning fields on output — v1 IS the schema.

These items are not promised for v2 or any other release. If a future
release wants any of them, it gets its own spec.

## Consequences

- The skill activates on broad security-review triggers across 12
  families.
- Per-version isolation in `opensips-config` and cross-version scope in
  `opensips-security-advisor` is an intentional asymmetry — most
  security knowledge is cross-version.
- Adding a new OpenSIPs version requires authoring one
  `version-notes/X.Y.md`, not duplicating the entire reference tree.
- The CVE-2026-25554 verification work from Chat C propagates into
  v1 via direct migration of `vulnerability-reference.md` and the
  AUTH-004 rule.

## Rule against feature creep

This ADR forbids adding speculative v2 features as TODOs in v1
content. If a feature is in v1 it is fully designed; if it is not, it
is deleted, not deferred.

## Alternatives considered

- **Per-version isolation** (matching `opensips-config`) — rejected
  because the bulk of security knowledge does not vary by version. A
  per-version partition would force 4× duplication for content that
  changes for ~10% of rules at most.
- **Keep numbered-prefix folder structure** from the bundles
  (`10_architecture/`, `20_runtime/`, etc.) — rejected as
  research-paper-flavored ceremony unhelpful in a Claude Code skill.
- **Defer to v2** — rejected because the catalog is authored and only
  needs consolidation; no new research is required.
```

- [ ] **Step 3: Add a "Superseded-in-part by" note to ADR-013**

Use the Edit tool. Find the `## Status` section and add a line:

```
Status: Accepted (superseded in part by ADR-014 — security advisor activation)
```

Do not rewrite the body of ADR-013.

- [ ] **Step 4: Commit**

```bash
git add docs/architecture/adr/014-security-advisor-v1-single-skill.md docs/architecture/adr/013-merge-routing-and-modules-into-opensips-config.md
git commit -m "docs(adr): add ADR-014 for security-advisor v1 activation

Records the v1 scope, structural decisions, and v1-only stance (no
TODOs about future capabilities). ADR-013 marked superseded in part.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: Update `CLAUDE.md` and `CHANGELOG.md`

**Files:**
- Modify: `CLAUDE.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update `CLAUDE.md`**

Find the "What this project is" section (currently says "ships one Agent Skill"). Update to reflect two active skills:

```markdown
`opensips-skills` is a Claude Code plugin that makes Claude fluent in
OpenSIPs configuration. It ships two Agent Skills:

1. **`opensips-config`** — authors and edits `opensips.cfg` files;
   provides version-aware module reference data; teaches the cfg file
   structure and the loadmodule-scan workflow.

2. **`opensips-security-advisor`** — reviews `opensips.cfg` files for
   security issues across 12 vulnerability families; produces a
   Markdown report with severity-ranked findings, cited remediations,
   and explicit abstention when confidence is insufficient. Reads
   `opensips-config`'s reference data for identifier sanity-checking
   but does not write to its tree.
```

Find the line that reads "A second skill (`opensips-security-advisor`) is scaffolded in the tree for a follow-up release..." and DELETE it (now obsolete).

Find the project status section. Update from "v1.0.1" to "v1.1.0 — two-skill plugin live, security advisor activated per ADR-014."

Find the file-tree diagram inside CLAUDE.md and update it to show the new structure of `opensips-security-advisor/` (SKILL.md + references/...).

- [ ] **Step 2: Update `CHANGELOG.md`**

Add a new entry at the top:

```markdown
## v1.1.0 — 2026-04-29

### Added

- Activated `opensips-security-advisor` skill (was scaffold-only in
  v1.0.x). Reviews opensips.cfg files for security issues across 12
  vulnerability families: authentication, injection, MI exposure,
  TLS posture, DoS defense, relay and routing, identity spoofing,
  STIR/SHAKEN, media, dispatcher and load-balancer, tracing and
  logging, configuration hygiene. 58 rules total.
- Cross-version reference structure: one skill covers OpenSIPs 3.4,
  3.5, 3.6, and 4.0 with per-rule version gates.
- ADR-014 records the v1 design decisions for the security advisor.
- `docs/research/security-advisor-consolidation/` preserves the raw
  research bundles (Chats A, B, C, Thread 0) that fed v1.
- `docs/testing/security-advisor/` contains fixtures and a manual
  smoke-test procedure.

### Changed

- `plugin.json` version → `1.1.0`.
- ADR-013 marked superseded in part by ADR-014.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md CHANGELOG.md
git commit -m "docs: update CLAUDE.md and CHANGELOG for v1.1.0 (two-skill plugin)

Project now ships two active skills. CLAUDE.md sections reflecting
the prior 'one skill, security advisor scaffolded' state are updated.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 17: Final cleanup of harvested-but-now-empty bundle directories under the skill folder

**Files:**
- Delete: `plugins/opensips/skills/opensips-security-advisor/10_architecture/`
- Delete: `plugins/opensips/skills/opensips-security-advisor/20_runtime/`
- Delete: `plugins/opensips/skills/opensips-security-advisor/30_rules/`
- Delete: `plugins/opensips/skills/opensips-security-advisor/40_versions/`
- Delete: `plugins/opensips/skills/opensips-security-advisor/50_fixtures/`
- Delete: `plugins/opensips/skills/opensips-security-advisor/90_reference/`

These are the parent-level numbered dirs that held Chat C's drafts before the consolidation. The content has been harvested into the canonical `references/` tree (specifically: `90_reference/01_master_vulnerability_reference.md` was harvested in Task 8, the version notes in `40_versions/` in Task 7, the fixtures in `50_fixtures/` in Task 12). The `10_architecture/`, `20_runtime/`, and `30_rules/` content was Chat C alternates that were superseded by Chat A and Chat B versions in the canonical tree.

- [ ] **Step 1: Inventory what would be deleted**

```bash
find plugins/opensips/skills/opensips-security-advisor/{10_architecture,20_runtime,30_rules,40_versions,50_fixtures,90_reference} -type f 2>/dev/null
```

Confirm no canonical content has accidentally landed here. Every file should be a Chat C alternate that has either been (a) superseded by Chat A/B canonical content already in `references/`, (b) harvested and rewritten in `references/`, or (c) preserved in `docs/research/security-advisor-consolidation/chat-c-canonical-tree/` already.

- [ ] **Step 2: Delete the six numbered top-level dirs**

```bash
rm -rf plugins/opensips/skills/opensips-security-advisor/{10_architecture,20_runtime,30_rules,40_versions,50_fixtures,90_reference}
```

- [ ] **Step 3: Verify final skill folder shape**

```bash
ls -la plugins/opensips/skills/opensips-security-advisor/
```

Expected output (only):
```
SKILL.md
README.md
references/
```

If anything else remains, investigate before committing.

- [ ] **Step 4: Final tree spot-check**

```bash
find plugins/opensips/skills/opensips-security-advisor -type f -name "*.md" | wc -l
# Approximate expected: 1 (SKILL) + 1 (README) + 4 (refs/*.md) + 4 (knowledge/) + 4 (version-notes/) + 58 (rules) + 12 (rule _index.md) = ~84 files
```

- [ ] **Step 5: Commit**

```bash
git add -A plugins/opensips/skills/opensips-security-advisor/
git commit -m "chore(security-advisor): remove harvested bundle directories

Six numbered top-level dirs (10_architecture through 90_reference)
were Chat C drafts harvested into the canonical references/ tree.
Their preserved-as-research counterparts live in
docs/research/security-advisor-consolidation/chat-c-canonical-tree/.
Skill folder now: SKILL.md + README.md + references/.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: Smoke test in a fresh Claude Code session

**Files:** none modified.

This is a manual test the operator runs themselves. The plan author cannot complete it.

- [ ] **Step 1: Open a fresh Claude Code session**

```bash
claude --plugin-dir ./plugins/opensips
```

- [ ] **Step 2: Verify both skills are listed**

In the session: `/skills`

Expected to see both `opensips-config` and `opensips-security-advisor`.

- [ ] **Step 3: Run a triggering prompt against a vulnerable fixture**

Paste:

> Review this opensips.cfg for security issues. Target version 3.6, profile L2.
>
> [paste contents of `docs/testing/security-advisor/fixtures/vulnerable/vulnerable-mixed.cfg`]

- [ ] **Step 4: Verify expected behavior**

The response should:
- Activate `opensips-security-advisor` (skill name visible in any tool-use indicator)
- Read `references/workflow.md` first
- Read relevant rule files from `references/rules/`
- Render a Markdown report with severity-ranked findings
- Cite findings by rule ID (e.g., `OSIPS-SEC-AUTH-004`, `OSIPS-SEC-INJ-001`, `OSIPS-SEC-MI-001`)
- Match the structure of `docs/testing/security-advisor/fixtures/golden-reports/golden_vulnerable_mixed.md` (phrasing may differ, finding IDs and severities should not)

- [ ] **Step 5: Run the same against a clean fixture**

> Review this opensips.cfg for security issues. Target version 3.6, profile L1.
>
> [paste contents of `docs/testing/security-advisor/fixtures/clean/clean-l1-enterprise-pbx.cfg`]

Expected: zero vulnerability findings; only `info` observations.

- [ ] **Step 6: Run the abstention case**

> Review this opensips.cfg for security issues. Target version 3.6, profile L2.
>
> [paste contents of any of `docs/testing/security-advisor/fixtures/tricky/*.cfg`]

Expected: at least one `review_required` finding with explicit reasoning.

- [ ] **Step 7: If everything passes, the demo is ready**

If anything fails, capture the failure mode and either:
- Fix forward (small edit to `references/workflow.md` or the relevant rule)
- Roll back (`git revert`) the last task whose change broke the demo

No commit needed unless a fix is made.

---

## Validation summary

After Phase 8 completes, the repo should satisfy:

| Property | How to verify |
|---|---|
| 58 rule files in `references/rules/` | `find ... -name 'OSIPS-SEC-*.md' \| wc -l` → 58 |
| 12 family folders | `ls references/rules/ \| grep -v _index \| wc -l` → 12 |
| Skill folder is clean | `ls .../opensips-security-advisor/` → `SKILL.md README.md references/` |
| Plugin manifest registers skill | `cat plugins/opensips/.claude-plugin/plugin.json` shows v1.1.0 |
| Research preserved | `ls docs/research/security-advisor-consolidation/` shows 4 bundle dirs + 4 logs |
| Fixtures relocated | `ls docs/testing/security-advisor/fixtures/` → 4 categories |
| ADR written | `ls docs/architecture/adr/014-*.md` exists |
| No hardening-index references | `grep -r -i hardening plugins/opensips/skills/opensips-security-advisor/ docs/testing/security-advisor/` → empty |
| No "v2" / "TODO" / "TBD" placeholders in shipped content | `grep -r -i -E "(TODO\|TBD\|v2|deferred)" plugins/opensips/skills/opensips-security-advisor/references/` → empty (or only false positives in glossary entries) |
| Demo passes | Manual smoke test (Task 18) green |
