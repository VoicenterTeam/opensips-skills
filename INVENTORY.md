<p align="center"><img src="docs/OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Documentation Inventory

This file lists every document in the archive with a one-line description. Useful for at-a-glance verification that nothing is missing, and for explaining the document set to someone new.

## Root

| File | Lines | Purpose |
|---|---|---|
| `CLAUDE.md` | ~340 | Project operating manual — navigation map, rules, discipline |
| `README.md` | ~193 | Public landing page (M10) — what this is, install, quick example, supported versions |
| `CONTRIBUTING.md` | ~245 | New-contributor onboarding (M10) — setup, dev loop, PR expectations, ADR/SKILL.md/version workflows |
| `LICENSE` | ~675 | GPL-3.0 license text (matches upstream OpenSIPs) |
| `CHANGELOG.md` | growing | Keep-a-Changelog format. v1.0.0 ships M0-M9 |
| `.gitignore` | ~35 | Excludes node_modules/dist/IDE/.env; preserves data/ and generated references per ADR-002/009 |

## docs/

| File | Lines | Purpose |
|---|---|---|
| `vision.md` | ~110 | One-page narrative of what we're building |
| `requirements.md` | ~720 | Full requirements specification (functional + non-functional) |

## docs/architecture/

| File | Lines | Purpose |
|---|---|---|
| `data-pipeline.md` | ~620 | Build pipeline spec (stages, determinism, error handling, CLI) |
| `rendering-templates.md` | ~720 | JSON → Markdown rendering rules (per-element, per-doc-type, validation) |
| `skill-authoring-guide.md` | ~600 | How to write the three SKILL.md files |

## docs/architecture/adr/

| File | Lines | Purpose |
|---|---|---|
| `000-template.md` | ~80 | ADR template (Nygard/MADR-style) |
| `001-router-index-over-per-module-skills.md` | ~170 | Why one modules-skill with router-index, not per-module skills |
| `002-json-source-of-truth.md` | ~200 | JSON source committed alongside generated Markdown |
| `003-version-isolated-folders.md` | ~190 | Per-version source and output folders for isolation |
| `004-node-typescript-build-stack.md` | ~290 | Node LTS + TypeScript strict + Zod + Vitest stack |
| `005-three-skill-architecture.md` | ~230 | Three coordinated skills, security advisor authored separately |
| `006-consolidated-json-as-search-index.md` | ~210 | One consolidated.json per version as fast-lookup index |
| `007-claude-code-only-target.md` | ~180 | Claude Code only at v1; not claude.ai web or API |
| `008-ser-lineage-neutral-framing.md` | ~200 | Single "SIP Express Router" mention; never name siblings |
| `009-data-folder-and-dynamic-version-discovery.md` | ~180 | `data/` is canonical source; build auto-discovers versions; 3.4/3.5/3.6 in scope; guides included |
| `010-rendering-time-output-sanitization.md` | ~90 | Narrow exception to Rule 3: strip three classes of upstream extraction artifacts (`U+FFFD`, `U+200B`, `\_`) at the renderer boundary; gated by an explicit threshold |
| `011-cross-platform-schema-hash.md` | ~80 | Schema hash normalises CRLF→LF before hashing so the digest is stable on Windows (autocrlf=true) and Linux/macOS; baseline regenerated to canonical LF value |
| `012-merge-routing-and-modules-into-opensips-config.md` | ~80 | Collapses the routing + modules skills into the single `opensips-config` skill; supersedes ADR-005 in part |
| `013-v1-ships-one-skill.md` | ~110 | v1.0.x ships only `opensips-config`; security advisor disabled. Superseded in part by ADR-014. |
| `014-security-advisor-v1-single-skill.md` | ~120 | v1.1.0 activates `opensips-security-advisor` as a cross-version skill with 58 rules across 12 families; supersedes ADR-013's scaffold posture. |

## docs/plan/

| File | Lines | Purpose |
|---|---|---|
| `README.md` | ~210 | Plan overview, milestone index, dependency graph |
| `00-repository-scaffolding.md` | ~210 | Repo init, folder structure, doc commit, tooling |
| `01-schema-mirroring-and-validation.md` | ~290 | Mirror Zod schemas, schema hash check, validation stage |
| `02-core-pipeline-foundation.md` | ~310 | Orchestrator, errors, fs-helpers, CLI, dry-run |
| `03-per-module-rendering.md` | ~370 | Per-element renderers, module renderer, output validation |
| `04-core-type-rendering.md` | ~340 | Core-only renderers, dispatch table, lead paragraphs |
| `05-consolidated-index.md` | ~310 | Index builder, deterministic JSON, statistical canary |
| `06-multi-version-support.md` | ~310 | Add 3.5, verify isolation, restructure baseline |
| `07-skill-authoring.md` | ~470 | Author three SKILL.md files, ser-lineage-notes, scaffold |
| `08-local-plugin-testing.md` | ~390 | Install via --plugin-dir, verify triggering and behavior |
| `09-test-suite-and-ci.md` | ~510 | Unit/golden/E2E tests, determinism, CI pipeline |
| `10-public-release-prep.md` | ~470 | README, CONTRIBUTING, manifest polish, release process |

## docs/research/

| File | Lines | Purpose |
|---|---|---|
| `README.md` | ~70 | Why these reports are committed, how they relate to architecture |
| `data-pipeline-build-pipelines.md` | ~530 | Research on deterministic build pipelines (10 areas) |
| `rendering-templates-skill-references.md` | ~710 | Research on Markdown reference files for Claude Code skills |
| `skill-authoring-trigger-reliability.md` | ~280 | Research on description writing, multi-skill coordination, guardrails |

## docs/schemas/

Human-readable JSON schema specifications (mirrored from `opensips-docs-collector/docs/schemas/`). Used as reference by subagents when mirroring Zod schemas (M1) and writing renderers (M3, M4).

| File | Purpose |
|---|---|
| `README.md` | Schema documentation index |
| `base-document.schema.md` | Base document fields all doc types extend |
| `module-document.schema.md` + `module-sections.schema.md` | Module document and its eight sub-section schemas |
| `core-functions.schema.md`, `core-parameters.schema.md`, `core-variables.schema.md` | Three core doc types specs |
| `async.schema.md`, `events.schema.md`, `flags.schema.md`, `mi-commands.schema.md`, `operators.schema.md`, `routes.schema.md`, `statements.schema.md`, `statistics.schema.md`, `transformations.schema.md` | Remaining nine core doc types |
| `guides.schema.md` | Guides doc type (per ADR-009, included in v1) |
| `consolidated.schema.md` | Consolidated index schema |
| `collection-state.schema.md` | Upstream extraction progress tracking |

## docs/superpowers/plans/

| File | Purpose |
|---|---|
| `2026-04-25-execution-strategy.md` | Superpower-driven execution playbook layered on top of `docs/plan/` |

## docs/process/ (M10)

| File | Purpose |
|---|---|
| `release-process.md` | Pre-release checklist, cutting/post-verifying releases, communicating, rollback |
| `maintenance.md` | Issue triage, refresh cadence, deprecation policy, post-release expectations |

## docs/

| File | Purpose |
|---|---|
| `usage-guide.md` | End-user guide: phrasing prompts, version resolution, what plugin won't do |

## docs/testing/

| File | Lines | Purpose |
|---|---|---|
| `test-strategy.md` | ~340 | What is tested at each level, CI gates, local workflow |
| `acceptance-criteria.md` | ~380 | Per-skill behavior checklists, severity-tagged |
| `golden-path-demos.md` | ~390 | Canonical prompt regression suite (run before each release) |

## data/

Per ADR-009, `data/{version}/` is the canonical source-data location (auto-discovered by the build). Currently populated for 3.4, 3.5, 3.6, and 4.0. Each version contains `core/*.json`, `modules/*.json`, optional `guides/*.json`, plus a `md/` raw-extraction tree (committed but ignored by build) and an optional combined `complete.json` (also ignored by build).

## Counts

- **Authored Markdown files (docs + root):** 57
- **ADRs:** 14 (template + 13 substantive)
- **Milestones:** 11 (README + 10 numbered)
- **Research reports:** 3 (plus README)
- **Schema specs:** 18 (plus README)
- **Versions in `data/`:** 4 (3.4, 3.5, 3.6, 4.0) — auto-discovered, more added by dropping folders per ADR-009

---

*Updated when documents are added or removed. See `CLAUDE.md` for the rules around changing the document set.*
