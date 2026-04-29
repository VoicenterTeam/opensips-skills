# OpenSIPs Security Advisor v1 — Design Spec

**Date:** 2026-04-29
**Status:** Approved (brainstorm complete)
**Owner:** opensips-skills repository
**Demo target:** Same day — a few hours from spec sign-off.

---

## 1. Goal

Ship the second skill in the `opensips-skills` plugin: `opensips-security-advisor`. It reviews OpenSIPs configuration files for security issues and renders a Markdown report with severity-ranked findings, cited remediations, and explicit abstention when confidence is insufficient.

The skill is currently disabled (`SKILL.md.scaffold`). Three independent agents (Chats A, B, C) authored overlapping research material that was partially consolidated by a Thread 0 pass but never finalized into a working skill. This spec defines the v1 we ship today.

## 2. Scope of v1 (what's in)

- One skill, cross-version. No per-version directory partitioning of the skill itself.
- 58 detection rules across 12 security domains (sourced from Chat B's catalog).
- Coverage: OpenSIPs 3.4, 3.5, 3.6, 4.0. Version-specific concerns (CVEs, module deltas) live in `version-notes/` and inline rule frontmatter (`applies_if_opensips_version`).
- Markdown-only report output. NIST SP 800-115-style structure.
- Two deployment profiles: L1 (enterprise PBX, internal-facing) and L2 (carrier edge, public-facing).
- Severity ladder: info / low / medium / high / critical.
- Abstention semantics — Claude reports `review_required` when it cannot confidently classify a construct, with reasoning.
- Suppression — honors user-declared exceptions with audit trail.
- Identifier sanity-checking — Claude cross-references identifiers against the `opensips-config` skill's reference data to detect typos, version drift, and SER-lineage imports.
- SER-lineage neutral framing per ADR-008.
- Skill tools: `Read, Glob, Grep` only (read-only).

## 3. Scope of v1 (what's out — and not coming back as TODOs)

The reference docs do not mention these. They simply aren't part of the design:

- Hardening-index numerical score.
- SARIF output format.
- Schema-versioning fields.
- Third profile tier (L3).
- "Detection engine" framing — Claude is the engine, not an external program.
- 7-layer skill stack decomposition.

## 4. Final tree

### 4.1 Inside the skill (ships via plugin)

```
plugins/opensips/skills/opensips-security-advisor/
├── SKILL.md                          ← hand-authored router/index
└── references/
    ├── workflow.md                   ← intake + analyze + suppress + interact
    ├── output-format.md              ← finding shape + Markdown report template + rule-file frontmatter spec
    ├── taxonomy.md                   ← severity ladder, L1/L2 profiles, glossary
    ├── taint-model.md                ← sources/sanitizers/sinks for injection rules
    ├── rules/                        ← 58 rules in 12 domain folders
    │   ├── auth/                     (8 rules)
    │   ├── injection/                (6)
    │   ├── mi-exposure/              (5)
    │   ├── tls/                      (7)
    │   ├── dos-defense/              (5)
    │   ├── relay-and-routing/        (5)
    │   ├── identity-spoofing/        (3)
    │   ├── stir-shaken/              (4)
    │   ├── media/                    (4)
    │   ├── dispatcher-and-lb/        (3)
    │   ├── tracing-and-logging/      (4)
    │   └── config-hygiene/           (4)
    ├── version-notes/
    │   ├── 3.4.md
    │   ├── 3.5.md
    │   ├── 3.6.md
    │   └── 4.0.md
    └── knowledge/
        ├── vulnerability-reference.md
        ├── sanitizer-registry.md
        ├── ser-lineage-notes.md
        └── external-sources.md
```

### 4.2 Inside the repo, outside the skill

```
docs/testing/security-advisor/
├── fixtures/
│   ├── clean/                        (1 cfg + expected.json)
│   ├── vulnerable/                   (1 cfg + expected.json)
│   ├── tricky/                       (10 cfgs + expected.json each)
│   └── golden-reports/               (3 markdown narratives — hardening index stripped)
└── test-strategy.md

docs/research/security-advisor-consolidation/
├── README.md                         ← what this is, when it ran, why preserved
├── chat-a-bundle/
├── chat-b-bundle/
├── chat-c-canonical-tree/
├── thread-0-state.md
├── reconciliation-log.md
└── chat-c-activity-log.md
```

### 4.3 What gets deleted from the skill folder

- `10_architecture/`, `20_runtime/`, `30_rules/`, `40_versions/`, `50_fixtures/`, `90_reference/` (top-level) — content harvested into `references/`, then removed.
- `CHAT_A_BUNDLE/`, `chat-b-opensips-advisor-bundle/`, `THREAD_0_CONSOLIDATION_BUNDLE/`, `opensips-security-advisor/` (nested) — moved to `docs/research/security-advisor-consolidation/`.
- `THREAD_0_CONSOLIDATION_BUNDLE.zip` — deleted (filesystem state in `docs/research/` supersedes it).
- `THREAD_0_CONSOLIDATION_STATE.md`, `RECONCILIATION_LOG.md`, `security-advisor-c-activity-log.md` — moved to `docs/research/`.
- `.gitkeep` — removed (folder is no longer empty).

## 5. Spec consolidation map

13 bundle docs → 4 production reference docs:

| Bundle source | → | Production doc |
|---|---|---|
| `10_SKILL_STACK.md`, `13_PROFILE_MODEL.md`, `02_GLOSSARY.md` | → | `taxonomy.md` |
| `11_FINDING_SCHEMA.md`, `22_REPORT_TEMPLATES.md`, `12_RULE_CATALOG_SCHEMA.md` | → | `output-format.md` |
| `20_INTAKE_PROTOCOL.md`, `21_ANALYSIS_PIPELINE.md`, `23_SUPPRESSION_PROTOCOL.md`, `24_INTERACTION_PATTERNS.md`, `15_CONFIDENCE_AND_VERIFICATION.md`, `14_VERSION_STRATEGY.md` | → | `workflow.md` |
| `16_TAINT_MODEL.md` | → | `taint-model.md` |

`25_FIXTURE_SCHEMA.md` content moves to `docs/testing/security-advisor/test-strategy.md`.

Phase 5 placeholder TBDs in Chat A specs are resolved during the consolidation pass — citing harvested content from `90_reference/03_advisor_methodology_research.md` where applicable, deleting the placeholder otherwise.

## 6. Rules: integrating Chat B's 58

Chat B authored 58 rules across 12 domains. Thread 0's "canonical" tree only kept 4 (because Chat B's rules were not visible to Thread 0's input set per its state log, even though they're on disk in Chat B's bundle).

**ID scheme:** `OSIPS-SEC-<DOMAIN>-NNN`. Domain codes from Chat B (3-letter where possible, otherwise the family folder name uppercased): AUTH, INJ, MI, TLS, DOS, RELAY, ID, STIR, MEDIA, LB, LOG, HYG. Thread 0's expanded form (`INJECTION-001`) is dropped in favor of Chat B's short form.

**Per-rule frontmatter** (locked by `output-format.md`'s rule schema):
- `id`, `family`, `severity`, `cvss`, `cwe`, `applies_if_opensips_version`, `profiles`, `confidence`, `suppressible`
- Body: detection logic (what to grep for), threat model (1-2 sentences), remediation (step-by-step), references (anchors into `vulnerability-reference.md` and external CVEs).

**CVE accuracy:** All rule frontmatter and version notes are spot-checked for CVE/CVSS/CWE accuracy against `vulnerability-reference.md` (which Chat C verified via web research). The 4 Thread 0 canonical rules already had values corrected; Chat B's 58 rules need an audit pass.

## 7. SKILL.md (router)

Hand-authored. Sections:
- YAML frontmatter (`name`, `description`, `allowed-tools: Read, Glob, Grep`).
- **When to use** — trigger phrases (security review, audit, hardening, INVITE flood, registration hijack, toll fraud, RTP relay, MI exposure, SIP scanning, CVE references in OpenSIPs context).
- **When not to use** — defer to `opensips-config` for authoring/editing/lookup.
- **How to navigate references** — what each top-level reference file is for, when to load it.
- **Integration contract** — read access (no write) to `../opensips-config/references/{version}/...` for identifier sanity-checking.
- **SER-lineage guardrail** — neutral framing, point at `references/knowledge/ser-lineage-notes.md`.
- **Workflow entry point** — "always start by reading `references/workflow.md`."

## 8. Plugin manifest

Update `plugins/opensips/.claude-plugin/plugin.json` to register the second skill. Update `plugins/opensips/README.md` to mention both skills.

## 9. Repo conventions

Honored:
- **Rule 1 (no hand-editing generated files)** — n/a; nothing in `opensips-security-advisor/` is generated.
- **Rule 2 (ADR for architectural changes)** — write ADR-014 ("opensips-security-advisor v1 — single skill, cross-version, semantic folders") superseding ADR-013's "scaffold-disabled" stance.
- **Rule 3 (source of truth is upstream)** — n/a; security-advisor's reference docs are hand-authored, not extracted.
- **Rule 4 (version isolation)** — partially honored. Security advisor itself is cross-version by design (per spec §2). When it READS `opensips-config`'s data, it stays within the active version.
- **Rule 5 (commit source + generated together)** — n/a.
- **Rule 6 (SKILL.md is precious)** — yes; demo prompts validate.
- **Rule 7 (neutral SER framing)** — enforced in SKILL.md and `ser-lineage-notes.md`.
- **Rule 8 (skill directories don't write to each other)** — security-advisor reads `opensips-config` references, never writes.

## 10. Demo readiness

The demo passes if a fresh Claude Code session in this repo:
1. Sees `opensips-security-advisor` listed in `/skills`.
2. Triggers the skill on a prompt like "review this opensips.cfg for security issues."
3. Reads the workflow doc and runs intake.
4. Loads relevant rules and produces a Markdown report against one of the fixtures (e.g., `vulnerable-mixed.cfg`).
5. The report names findings by ID (`OSIPS-SEC-INJ-001`, etc.) with severity, location, threat model, and remediation.
6. Identifier sanity-check fires when the fixture uses a non-OpenSIPs identifier.

## 11. Out-of-scope explicit list

These are NOT in v1 and we don't write TODOs about them:
- Hardening-index numerical score.
- SARIF export.
- Schema-versioning fields on output.
- L3 profile tier.
- Automated fixture-replay test runner.
- CI integration.
- Cross-version rule diffing.

If a future release wants any of these, it gets its own spec.
