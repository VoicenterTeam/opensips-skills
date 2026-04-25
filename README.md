# Implementation Plan

> **Purpose:** Sequenced, milestone-by-milestone build plan for the `opensips-skills` project. Each milestone is its own file in this directory, with concrete tasks, acceptance criteria, and risk notes.
>
> **Audience:** Anyone implementing the project, in whatever order they pick up the work — solo developer with Claude Code, future open-source contributor, or maintainer adding scope after v1.
>
> **Status:** Authoritative for sequencing. Individual task estimates and assignments are the implementer's call; this document constrains *what* and *in what order*, not *who* or *when*.

---

## How this plan is organized

The plan is split into eleven files: this overview plus ten numbered milestone files.

```
docs/plan/
├── README.md                              # this file
├── 00-repository-scaffolding.md
├── 01-schema-mirroring-and-validation.md
├── 02-core-pipeline-foundation.md
├── 03-per-module-rendering.md
├── 04-core-type-rendering.md
├── 05-consolidated-index.md
├── 06-multi-version-support.md
├── 07-skill-authoring.md
├── 08-local-plugin-testing.md
├── 09-test-suite-and-ci.md
└── 10-public-release-prep.md
```

Each milestone file has the same shape — Goal, Why this is sequenced here, Tasks, Acceptance criteria, Risks, Parallelization notes, Cross-references. Read milestones in order on first pass. Once you have a working mental model, jump to whichever one you're working on.

The numbering is sequencing, not naming. Milestone 0 (repository scaffolding) is genuinely the first thing to do; milestone 10 (public release prep) is genuinely the last.

---

## Milestone index

| # | Milestone | What's true at the end of it |
|---|---|---|
| 0 | [Repository scaffolding](00-repository-scaffolding.md) | Repo exists with full folder structure, all documentation committed, package.json and tsconfig set up, no code yet. |
| 1 | [Schema mirroring and validation](01-schema-mirroring-and-validation.md) | Zod schemas mirrored from extraction project, schema hash drift check works, `npm run validate` runs against `source/3.6/` and produces structured errors. |
| 2 | [Core pipeline foundation](02-core-pipeline-foundation.md) | Orchestrator, discover stage, file I/O helpers, error infrastructure, CLI surface. `npm run build --dry-run` runs end-to-end with no rendering. |
| 3 | [Per-module rendering](03-per-module-rendering.md) | `render-module.ts` produces complete per-module Markdown for OpenSIPs 3.6 in `plugins/opensips/skills/opensips-modules/references/3.6/modules/`. |
| 4 | [Core type rendering](04-core-type-rendering.md) | `render-core.ts` produces twelve aggregated Markdown files in `plugins/opensips/skills/opensips-routing/references/3.6/core/`. |
| 5 | [Consolidated index](05-consolidated-index.md) | `build-consolidated.ts` produces `consolidated.json` per version with all four indexes, statistics, and relationships blocks. |
| 6 | [Multi-version support](06-multi-version-support.md) | Both 3.5 and 3.6 trees built and committed, version isolation verified end-to-end. |
| 7 | [Skill authoring](07-skill-authoring.md) | Three SKILL.md files written, `ser-lineage-notes.md` authored, plugin manifests in place, security advisor scaffold present. |
| 8 | [Local plugin testing](08-local-plugin-testing.md) | Plugin loads in Claude Code, all three skills trigger on canonical prompts, reference files load on demand, end-to-end demo works. |
| 9 | [Test suite and CI](09-test-suite-and-ci.md) | Unit tests for each pipeline stage, golden-file tests, end-to-end build tests, CI with three jobs (validate, build, reproduce). |
| 10 | [Public release prep](10-public-release-prep.md) | README, CONTRIBUTING.md, marketplace.json polished, plugin description finalized, ready for distribution. |

---

## Dependency graph

The sequencing is constrained by what each milestone produces and consumes. The graph:

```
                         ┌───────────────────────┐
                         │  M0  Repository scaf.  │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  M1  Schemas + valid.  │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  M2  Pipeline found.   │
                         └───────────┬────────────┘
                                     │
                       ┌─────────────┴──────────────┐
                       ▼                            ▼
            ┌───────────────────┐        ┌───────────────────┐
            │  M3  Module rend.  │        │  M4  Core rend.    │
            └─────────┬─────────┘        └────────┬──────────┘
                      │                            │
                      └─────────────┬──────────────┘
                                    ▼
                         ┌───────────────────────┐
                         │  M5  Consolidated idx. │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  M6  Multi-version     │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  M7  Skill authoring   │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  M8  Local testing     │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  M9  Tests + CI        │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │  M10 Public release    │
                         └───────────────────────┘
```

The only place the graph branches is between M3 and M4 — module and core rendering can happen concurrently if there's a second contributor. Everything else is strictly sequential.

---

## Why this sequencing

Three principles drive the order:

**Build the pipeline before the content.** The hand-authored SKILL.md files in milestone 7 reference the generated reference files. Trying to author "see `references/{version}/modules/tm.md`" before tm.md exists means guessing at conventions you'd then have to fix. The pipeline is the foundation; SKILL.md content sits on top of it.

**Validate end-to-end before hardening.** Milestone 8 (local plugin testing) is the first time the system runs as a whole. Milestones 1–7 produce structurally correct artifacts; milestone 8 verifies they compose into runtime behavior. Tests come after this verification (milestone 9) because tests without a working system test nothing useful.

**Add complexity in single-version mode first, generalize after.** Milestones 3–5 work against OpenSIPs 3.6 only. Milestone 6 adds 3.5 and verifies version isolation. The reverse order (build for two versions from day one) means debugging two failure surfaces at once, which is slower than getting one version right and then proving the design generalizes.

---

## How to use this plan

**For solo development with Claude Code as pair.** Read this README, then read milestone 0. Execute it. Re-read milestone 1 when 0 is done; execute it. Repeat. Each milestone file's "Acceptance criteria" section tells you when you're done with that milestone — don't move on early.

**For onboarding a new contributor.** Point them at this README first, then `CLAUDE.md` for project orientation, then the relevant milestone file for what they're picking up. The milestone files are self-contained enough that a contributor can read just one and understand what to do, as long as they've also read the architecture docs the milestone cross-references.

**For tracking progress.** GitHub issues are the right place to track per-task progress within a milestone. The plan files are stable references for what's planned and why; the issues are mutable workflow. Don't update plan files to record progress — update issues.

**For changing the plan.** If reality diverges from the plan in a small way (a task takes longer, a sub-task gets split), don't edit the plan. Just keep building. If reality diverges in a large way (a milestone needs to be reordered, dropped, or split), open an ADR or a discussion before editing the plan files. The plan is supposed to be stable.

---

## What this plan is not

This plan does not assign work to people. The project is currently solo with Claude Code as pair; future contributors will pick up whatever fits their interest. There is no "owner" field per task.

This plan does not estimate calendar time. Time estimates for solo work with AI assistance are unreliable, and time estimates anchor people to wrong expectations. Each milestone has a "scope of work" but no "expected completion date."

This plan does not specify implementation details below the task level. A task says "implement the discover stage"; the milestone's cross-references point at `docs/architecture/data-pipeline.md` §2.1 for the spec. The plan tells you what to build and in what order; the architecture docs tell you what "built correctly" means.

This plan does not cover post-v1 work. Future skills (operations, module development, autonomous testing) will get their own plans when they enter scope. Adding them to this plan now would conflate "what's planned for v1" with "what might happen later."

---

## Cross-references

- For the *what* and *why*: `docs/requirements.md`, `docs/vision.md`.
- For the *how* of building: `docs/architecture/data-pipeline.md`, `docs/architecture/rendering-templates.md`, `docs/architecture/skill-authoring-guide.md`.
- For the rationale behind specific decisions: `docs/architecture/adr/`.
- For background research that informed the architecture: `docs/research/`.
- For project operating rules and the navigation map: `/CLAUDE.md`.

---

*End of overview. Open `00-repository-scaffolding.md` to begin.*
