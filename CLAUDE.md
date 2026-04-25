# CLAUDE.md

> **Project operating manual for Claude Code and human contributors.**
> This file is the entry point to the `opensips-skills` repository. Read it first.

---

## What this project is

`opensips-skills` is a [Claude Code plugin](https://docs.claude.com/en/docs/claude-code/plugins) that makes Claude fluent in OpenSIPs configuration. It ships two coordinated Agent Skills:

1. **`opensips-config`** — authors and edits `opensips.cfg` files; provides version-aware module reference data; teaches the cfg file structure and the loadmodule-scan workflow.
2. **`opensips-security-advisor`** — scaffold for a security-review skill authored by a separate agent.

The project exists because off-the-shelf LLMs hallucinate when writing OpenSIPs configs — mixing identifiers across versions and across projects in the SIP Express Router lineage. This plugin grounds Claude in version-specific, OpenSIPs-authoritative documentation.

Target versions: **OpenSIPs 3.5 and 3.6**. One skill, version-aware references, no cross-version reasoning.

---

## Repository layout

```
opensips-skills/
├── CLAUDE.md                        # ← you are here
├── README.md                        # Public landing page
├── LICENSE                          # GPL-3.0
├── CHANGELOG.md
│
├── docs/                            # All project documentation
│   ├── vision.md                    # Why this project exists (1 page)
│   ├── requirements.md              # What we're building (v2.0)
│   │
│   ├── architecture/
│   │   ├── data-pipeline.md         # Extraction → plugin contract
│   │   ├── rendering-templates.md   # How JSON becomes Markdown
│   │   ├── skill-authoring-guide.md # How to write SKILL.md files
│   │   └── adr/                     # Architecture Decision Records
│   │       ├── 000-template.md
│   │       ├── 001-router-index-over-per-module-skills.md
│   │       ├── 002-json-source-of-truth.md
│   │       ├── 003-version-isolated-folders.md
│   │       ├── 004-node-typescript-build-stack.md
│   │       ├── 005-three-skill-architecture.md
│   │       ├── 006-consolidated-json-as-search-index.md
│   │       ├── 007-claude-code-only-target.md
│   │       └── 008-ser-lineage-neutral-framing.md
│   │
│   ├── plan/
│   │   └── implementation-plan.md   # Milestones, tasks, acceptance criteria
│   │
│   └── testing/
│       ├── test-strategy.md         # What we test and why
│       ├── acceptance-criteria.md   # Behavior proofs per skill
│       └── golden-path-demos.md     # Demo prompts (regression tests)
│
├── package.json
├── tsconfig.json
│
├── source/                          # Input: copy of extraction output
│   ├── 3.5/
│   │   ├── core/*.json              # async, events, flags, functions, etc.
│   │   └── modules/*.json           # one file per module
│   └── 3.6/
│       └── (same structure)
│
├── scripts/                         # Build tooling
│   ├── build-references.ts          # Main build entry (orchestrator)
│   ├── clean.ts                     # `npm run clean` entry
│   ├── lib/                         # Orchestrator helpers, validation, IO
│   ├── render-module/               # Per-item renderer (modules)
│   ├── render-core/                 # Aggregated renderer (core types)
│   ├── render-guide/                # Aggregated renderer (guides)
│   ├── build-consolidated/          # Consolidated index builder
│   ├── build-module-index/          # modules-index.md renderer
│   └── schemas/                     # Zod schemas (mirrored from extraction)
│
└── plugins/
    └── opensips/
        ├── .claude-plugin/
        │   └── plugin.json
        ├── README.md
        └── skills/
            ├── opensips-config/
            │   ├── SKILL.md         # Hand-authored
            │   ├── references/
            │   │   └── {3.5,3.6}/
            │   │       ├── cfg-format.md        # Hand-authored
            │   │       ├── ser-lineage-notes.md # Hand-authored
            │   │       ├── modules-index.md     # Generated
            │   │       ├── core/*.md            # Generated
            │   │       ├── modules/*.md         # Generated
            │   │       ├── guides/*.md          # Generated (3.6 only)
            │   │       └── consolidated.json    # Generated
            │   └── scripts/
            │       └── module_search.py
            └── opensips-security-advisor/
                └── SKILL.md         # Scaffold (separate agent populates)
```

---

## How to find what you need

### "I need to understand what this project does"
Read in order: `docs/vision.md` → `docs/requirements.md` → this file's **Architecture at a glance** section below.

### "I need to understand a past architectural decision"
Browse `docs/architecture/adr/`. Each ADR is dated, numbered, and answers one question: what did we decide, what were the alternatives, why this one. If you disagree with a past decision, write a new ADR superseding it — don't edit the old one.

### "I need to change how JSON becomes Markdown"
Read `docs/architecture/rendering-templates.md` first, then edit `scripts/render-module/`, `scripts/render-core/`, `scripts/render-guide/`, `scripts/build-consolidated/`, or `scripts/build-module-index/`. Regenerate with `npm run build`. Golden-file tests will fail if output changes unexpectedly — update them only if the change is intentional.

### "I need to update a SKILL.md"
Read `docs/architecture/skill-authoring-guide.md`. There are two hand-authored SKILL.md files: `opensips-config/SKILL.md` and `opensips-security-advisor/SKILL.md`. The SKILL.md files are the only hand-authored Markdown in the skills themselves (along with `cfg-format.md` and `ser-lineage-notes.md`). Everything else in `references/` is generated.

### "I need to know what to build next"
`docs/plan/implementation-plan.md` is the milestone-by-milestone plan. Active work tracks as GitHub issues; the plan document tracks dependencies and sequencing.

### "I need to run the project locally"
See **Common tasks** below.

### "I need to know what good looks like"
`docs/testing/acceptance-criteria.md` enumerates the behaviors each skill must demonstrate. `docs/testing/golden-path-demos.md` contains the canonical prompts and expected outputs — these double as regression tests.

---

## Architecture at a glance

Two projects, clean boundary:

**Upstream — `opensips-docs-collector`** (separate repository)
Extracts OpenSIPs documentation per version using an LLM agent. Validates against Zod schemas. Outputs to `data/processed/{version}/core/*.json` and `data/processed/{version}/modules/*.json`. Version-isolated. Not part of this project.

**Downstream — `opensips-skills`** (this repository)
Consumes the extraction output as input to `source/`. A Node/TypeScript build script renders Markdown reference files and a consolidated JSON index. The plugin ships both the source JSON (for traceability) and the generated artifacts (so users need no build step to install).

```
opensips-docs-collector           opensips-skills
────────────────────────         ─────────────────────────
data/processed/{version}/  ──►   source/{version}/
  core/*.json                      ├─ validated by Zod
  modules/*.json                   ├─ rendered by build script
                                   ▼
                                 plugins/opensips/skills/
                                   opensips-config/references/
                                      ├─ modules/*.md (per-item)
                                      ├─ core/*.md (aggregated)
                                      ├─ guides/*.md (aggregated, 3.6+)
                                      ├─ modules-index.md (generated)
                                      └─ consolidated.json (index)
```

**Two rendering modes:**
- **Per-item** for modules. Each `ModuleDocument` JSON becomes one Markdown file.
- **Aggregated** for core types. All variables from `variables.json` become one `variables.md`; same for operators, statements, etc.

**Hand-authored vs. generated:**
- Hand-authored: two `SKILL.md` files, `cfg-format.md` (new), `ser-lineage-notes.md`, all documentation under `docs/`.
- Generated: everything under `references/{version}/core/`, `references/{version}/modules/`, `references/{version}/guides/`, plus `modules-index.md` (new) and `consolidated.json`.

For the full pipeline specification, see `docs/architecture/data-pipeline.md`.

---

## Common tasks

### Install dependencies
```bash
npm install
```

### Pull latest extraction output into source
```bash
# Manual copy (until submodule decision is finalized)
cp -r ../opensips-docs-collector/data/processed/* source/
```

### Validate source JSON against schemas
```bash
npm run validate
```
Fails fast on schema drift. Run this before every build and in CI.

### Build all generated artifacts
```bash
npm run build
```
Idempotent. Running twice produces byte-identical output. Version-isolated: a failure in 3.5 does not prevent 3.6 from building.

### Clean generated output
```bash
npm run clean
```
Removes `plugins/opensips/skills/*/references/` trees. Source JSON under `source/` is untouched.

### Test the plugin locally with Claude Code
```bash
claude --plugin-dir ./plugins/opensips
```
Then in the Claude Code session:
```
/plugin list          # Confirm both skills loaded
/reload-plugins       # Pick up mid-session edits without restart
```

### Run golden-path regression tests
```bash
npm run test:golden
```
Replays the prompts in `docs/testing/golden-path-demos.md` and diffs against expected outputs.

---

## Rules for changing things

These rules exist to keep the project maintainable as it grows from solo development to open-source contributions. Claude Code should enforce them; human reviewers should too.

### Rule 1: Never hand-edit generated files
Any file under `plugins/opensips/skills/opensips-config/references/{version}/core/`, `plugins/opensips/skills/opensips-config/references/{version}/modules/`, `plugins/opensips/skills/opensips-config/references/{version}/guides/`, `modules-index.md`, or `consolidated.json` is generated. Hand edits will be overwritten on the next build. If the output is wrong, the fix goes in:
- the source JSON (if the upstream extraction captured it wrong), or
- the rendering script (if the transformation logic is wrong).

The hand-authored files in the `opensips-config` skill tree are: `SKILL.md`, `cfg-format.md`, and `ser-lineage-notes.md`. These are never regenerated by the build and must be edited by hand.

### Rule 2: Every architectural change needs an ADR
Before changing how skills are structured, how the build works, how versions are resolved, or how the pipeline is laid out — write an ADR under `docs/architecture/adr/`. Use the next number. If you're superseding an existing ADR, link to it and update the old one's status to "Superseded by ADR-NNN."

### Rule 3: Source of truth is upstream
This project does not correct OpenSIPs documentation. If a module reference is wrong, the fix belongs in `opensips-docs-collector`. This project's job is faithful transformation, not editing. The only exceptions are (a) the hand-authored SKILL.md content, which is procedural knowledge not present in upstream docs, and (b) a narrow, gated rendering-time sanitization layer for upstream **extraction artifacts** (not OpenSIPs content) — see ADR-010. Adding a new sanitize rule requires meeting all three criteria in ADR-010's "Threshold for adding new sanitize rules" section.

### Rule 4: Version isolation is sacred
The project supports 3.5 and 3.6 as completely independent worlds. No code path should read from one version's references while operating on another. No "what changed between 3.5 and 3.6" logic. If the user asks, Claude answers from within the active version only.

### Rule 5: Commit source and generated output together
Every PR that touches `source/` must include the regenerated output. CI enforces this with `git diff --exit-code` after `npm run build`. Reviewing both side-by-side catches bugs no one would catch reviewing source alone.

### Rule 6: SKILL.md files are precious
They carry the anti-hallucination load. Changes to SKILL.md require reading `docs/architecture/skill-authoring-guide.md` first, and the change must be tested against the golden-path demos before merge. A SKILL.md change that regresses the golden-path demos is a release blocker.

### Rule 7: Neutral framing on SER-lineage topics
OpenSIPs is one of several projects descending from the SIP Express Router. When writing any documentation — including SKILL.md, `ser-lineage-notes.md`, ADRs, and error messages — stay strictly within OpenSIPs territory. Do not compare against other projects by name beyond the single lineage acknowledgment in `ser-lineage-notes.md`. Rationale in ADR-008.

### Rule 8: The two skills do not write to each other's directories
Each skill reads files (including from sibling skills' reference folders, which is allowed and expected). None writes to another skill's directory at build or runtime. This keeps the integration contract between `opensips-security-advisor` and `opensips-config` explicit and testable. The security advisor reads `opensips-config`'s reference files; it does not write to them.

---

## For Claude Code specifically

When a user opens this repository in Claude Code, the behavior should be:

1. **Read this file first.** It's the map.
2. **When the user asks about the project,** point them to `docs/vision.md` and `docs/requirements.md`.
3. **When the user wants to add a module,** they do not. Modules come from the upstream extraction project. The task is to refresh `source/`, rerun `npm run build`, and commit the result.
4. **When the user wants to change how things render,** edit `scripts/render-*.ts`, run `npm run build`, and verify golden-path tests still pass (or update them intentionally).
5. **When the user wants to change a SKILL.md,** read `docs/architecture/skill-authoring-guide.md` first, then edit the appropriate file (`opensips-config/SKILL.md` or `opensips-security-advisor/SKILL.md`), then verify golden-path demos.
6. **When asked to make a decision that feels architectural,** propose an ADR before implementing.
7. **When asked to add a feature not in the requirements doc,** check `docs/plan/implementation-plan.md` to see if it's planned for a later phase. If not, flag the scope expansion explicitly rather than silently implementing it.

Claude Code should treat the "Rules for changing things" section above as hard constraints, not guidelines.

---

## Terminology

| Term | Definition |
|------|------------|
| **Skill** | A Claude Agent Skill — a folder containing `SKILL.md` plus supporting files. See [Agent Skills overview](https://docs.claude.com/en/docs/claude-code/skills). |
| **SKILL.md** | The entry point of a skill. YAML frontmatter plus Markdown body. Loaded into Claude's context when the skill triggers. |
| **Reference file** | A file under `references/` that Claude reads on demand, pointed to by SKILL.md. Not loaded until requested. |
| **Router-index pattern** | An architectural choice where a skill's SKILL.md contains a catalog (name → file path) rather than the content itself. The content lives in reference files loaded on demand. See ADR-001. |
| **Progressive disclosure** | The three-level loading model: frontmatter always, SKILL.md on trigger, references on demand. |
| **Source of truth** | The JSON files under `source/` (copied from the extraction project). Everything else is derived. |
| **Consolidated index** | The `consolidated.json` file generated per version. A fast lookup index used by `module_search.py`. |
| **Extraction project** | The upstream `opensips-docs-collector` repository that produces the JSON this project consumes. |
| **Vibe routing** | The user-facing promise of this project: describe what you want, get a valid `opensips.cfg`. |
| **SER lineage** | The family of SIP servers descending from the SIP Express Router. We stay neutral on this; see ADR-008. |

---

## Project status

**Current phase:** Post-v1.0.0 public release. Two-skill architecture live (ADR-012).
**Active target:** Ongoing maintenance, expanded version coverage, security advisor content.
**Repository state:** Fully functional. See `docs/plan/implementation-plan.md` for milestone history.

---

## Getting help

- For questions about how the plugin is supposed to work → `docs/requirements.md`.
- For questions about why things are the way they are → `docs/architecture/adr/`.
- For questions about what to build next → `docs/plan/implementation-plan.md`.
- For questions about the upstream extraction project → see that repository's README.
- For anything else → open an issue.

---

*Last updated: 2026-04-25. This file is hand-authored and should be kept current as the project evolves.*
