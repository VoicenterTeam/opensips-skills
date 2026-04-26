<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Design — Merge `opensips-routing` and `opensips-modules` into `opensips-config`

**Date:** 2026-04-25
**Status:** Approved (brainstorming gate cleared 2026-04-25)
**Supersedes:** ADR-005 (three-skill architecture) — partially. The "three coordinated skills" decomposition is replaced with two: `opensips-config` (authoring + module reference) and `opensips-security-advisor` (security review).

---

## Motivation

The current architecture splits OpenSIPs work across two sibling skills — `opensips-routing` for authoring, `opensips-modules` for per-module reference data. In practice, every authoring task immediately needs module reference data (you cannot write `t_relay()` without knowing which module exports it, what its signature is, what its return value means), and almost every "what does this module do?" question is asked in the context of an opensips.cfg the user is reading or writing. Splitting the two means Claude juggles two skill activations for what is operationally one task, and the cross-skill `references/` paths add cognitive load to every lookup.

A second observation drove the redesign: the current architecture has no first-class teaching of the **opensips.cfg file format itself**. The core references cover variables, routes, operators, statements, transformations, flags, parameters, and async — every piece of the language — but nothing teaches the file as a whole: section order, the modparam-after-loadmodule rule, the workflow of reading or writing one. A user asking "write me an opensips.cfg" gets correct fragments but no canonical structural anchor.

Merging the two skills and adding a dedicated cfg-format reference solves both problems.

## Goals

1. Reduce the skill count from three to two for routine OpenSIPs work, with one skill (`opensips-config`) covering both authoring and module reference.
2. Add a hand-authored `cfg-format.md` reference that teaches opensips.cfg as a file: section order, ordering rules, route block taxonomy, reading-mode and authoring-mode workflows, common gotchas.
3. Define a clear "loadmodule scan" workflow: when Claude touches a cfg, it reads `consolidated.json` once for orientation and then reads the per-module `.md` for any module the user is asking about or that Claude is about to emit code for.
4. Keep `opensips-security-advisor` structurally unchanged; update only its cross-references.
5. Preserve all existing content quality. No regression in authoring correctness, lookup correctness, or anti-hallucination guardrails.

## Non-goals

- Changing the upstream extraction project (`opensips-docs-collector`).
- Merging `opensips-security-advisor` into the unified skill.
- Changing the version-isolation model (3.5 and 3.6 remain independent).
- Changing the JSON-as-source-of-truth contract (ADR-002).
- Adding cross-version reasoning (ADR-003 still applies).

## Architecture

### Skill inventory after merge

```
plugins/opensips/skills/
├── opensips-config/                     # NEW — replaces routing + modules
│   ├── SKILL.md                          # Hand-authored, workflow-first, ~350 lines
│   ├── references/
│   │   └── {3.5,3.6}/
│   │       ├── cfg-format.md             # NEW — hand-authored, file structure + workflow
│   │       ├── modules-index.md          # NEW — generated, was inline in old modules SKILL.md
│   │       ├── ser-lineage-notes.md      # Hand-authored (moved from routing)
│   │       ├── core/*.md                 # Generated (from routing)
│   │       ├── modules/*.md              # Generated (from modules)
│   │       └── consolidated.json         # Generated (from modules)
│   └── scripts/
│       └── module_search.py              # Moved from routing
│
└── opensips-security-advisor/            # Unchanged role; cross-refs updated
    └── SKILL.md
```

The old `opensips-routing/` and `opensips-modules/` directories are deleted.

### `opensips-config/SKILL.md` body

The body is workflow-first. The 200-row module index table that lived inline in the old `opensips-modules/SKILL.md` is **not** in this body — it relocates to `references/{version}/modules-index.md`. This trades one extra Read on pure-lookup prompts for a much shorter SKILL.md that loads cleanly into context every time the skill triggers.

Section order:

1. **Frontmatter.** `name: opensips-config`. Description covers both authoring (route blocks, opensips.cfg, pseudo-variables) and module reference (named module questions, function/parameter lookup), in one tight paragraph that names OpenSIPs explicitly and warns against sibling-project identifier confusion. `allowed-tools: Read, Write, Edit, Glob, Grep` (the union of the two old skills' tool sets).
2. **Overview.** What this skill does. Names the sibling `opensips-security-advisor` and the read-only contract between them.
3. **Cross-project guardrail.** The SER-lineage anti-hallucination rule, folded from both old skills into one section. The same rule applies whether authoring or looking up; there is no need to repeat it.
4. **The opensips.cfg workflow.** The new heart of the skill. A short procedure that fires whenever Claude touches a cfg:
   - **Step 1.** Read `references/{version}/cfg-format.md` to ground in the file's section model.
   - **Step 2.** Read `references/{version}/consolidated.json` once for upfront orientation — what's loaded, dependency graph, fast cross-identifier lookup.
   - **Step 3.** For each `loadmodule "X.so"` directive whose module Claude is about to reference — answering a question about it, editing code that calls into it, or generating new code that calls into it — Read `references/{version}/modules/X.md`.
   - **Step 4.** For pseudo-variables, route blocks, transformations, flags, and other core constructs, Read the matching `references/{version}/core/<topic>.md`.
5. **When to use / when to defer to security-advisor.** Compact deferral table.
6. **Routing decisions table.** The existing 12-row "task → approach → reference" table from the old routing SKILL.md, with paths updated.
7. **Common tasks.** The five worked examples (registrar, stateful proxy, NAT, authentication, dispatcher) from the old routing SKILL.md, with paths updated.
8. **Module lookup.** Short section, ~15 lines: "to look up a module, function, pseudo-variable, MI command, or statistic, follow the procedure in `references/{version}/modules-index.md`. Use `consolidated.json` for cross-identifier search."
9. **References summary.** One bulleted list of the references this skill consults (cfg-format, modules-index, core/*, modules/*, consolidated.json, ser-lineage-notes).
10. **Working with sibling skill (`opensips-security-advisor`).**

Estimated final length: ~350 lines (vs ~650 if naively concatenated).

### `references/{version}/cfg-format.md` (hand-authored, NEW)

Teaches the file as an artifact, not the syntax of individual constructs (those stay in `core/`). Sections:

- **Canonical section order.** globals → `#!define` macros → `loadmodule` (with `mpath` ahead of the loadmodules it resolves) → `modparam` → route blocks. Includes a one-screen annotated skeleton.
- **Hard ordering rules.** `modparam("X", ...)` must follow `loadmodule "X.so"` for the same X. Some globals (`listen`, etc.) must precede the module section. Forward references between modules can fail silently — they are valid syntax but produce subtle runtime misbehavior.
- **Route block taxonomy.** All declared route block types (`route`, `request_route`, `branch_route`, `failure_route`, `onreply_route`, `local_route`, `error_route`, `event_route`, `startup_route`, `timer_route`), when each fires, what is in scope. Cross-references `core/routes.md` for the per-block detail.
- **Reading-mode workflow.** Concrete procedure for understanding an existing cfg: open file → identify section boundaries → enumerate loadmodules → read consolidated.json for orientation → answer the user's question.
- **Authoring-mode workflow.** Concrete procedure for emitting a new cfg: pick capabilities from user intent → derive minimal module set → check dependencies via consolidated.json → emit sections in canonical order → validate route block fire ordering against the call flow.
- **Common gotchas.** Forward references; modparam-ordering bugs; double-loaded modules; empty route fallthrough; mpath positioning; flag declaration order.

The file is hand-authored because its content is procedural knowledge not present in upstream docs. It is version-agnostic in practice — the skeleton and ordering rules apply identically to 3.5 and 3.6. We write one canonical version and copy to both version directories. If a future OpenSIPs version changes the file structure, the version directory diverges at that point.

### `references/{version}/modules-index.md` (generated, NEW)

Relocates the 200-row module index from the old `opensips-modules/SKILL.md`, plus the surrounding instructional content:

- The lookup discipline (router-index pattern; second-hop is mandatory).
- The two-step lookup procedure (consolidated.json then per-module).
- The "when a module is not in the index" decision tree (typo check → consolidated cross-search → other-version check → ask the user).
- The version-specific-behavior note.

Generated at build time from `consolidated.json`. Hand-edits forbidden, same as the old inline table.

### `opensips-security-advisor` cross-reference updates

The advisor's SKILL.md currently reads:

- `../opensips-modules/references/{version}/modules/*.md`
- `../opensips-modules/references/{version}/consolidated.json`
- `../opensips-routing/references/{version}/core/*.md`
- `../opensips-routing/references/{version}/ser-lineage-notes.md`

After merge, all four collapse to:

- `../opensips-config/references/{version}/modules/*.md`
- `../opensips-config/references/{version}/consolidated.json`
- `../opensips-config/references/{version}/core/*.md`
- `../opensips-config/references/{version}/ser-lineage-notes.md`

The advisor's role and content are otherwise unchanged.

### Build script changes

`scripts/build-references.ts`, `scripts/render-module.ts`, `scripts/render-core.ts`, `scripts/build-consolidated.ts` change their output destinations from two skill subtrees to one. Source layout under `source/` and `data/` is unchanged. A new renderer step generates `modules-index.md` from `consolidated.json`. `npm run clean` removes the new merged tree instead of the two old ones.

The build remains version-isolated, idempotent, and produces byte-identical output on consecutive runs (Rule 5 in CLAUDE.md still applies).

## ADR sequencing

A new ADR is required because the change supersedes ADR-005's three-skill decomposition.

- **ADR-012: Merge routing and modules into a single `opensips-config` skill.** Documents the merge decision, the addition of `cfg-format.md`, the loadmodule-scan workflow, the directory layout, and the relationship to ADR-005.
- **ADR-005's status changes from Accepted to Superseded by ADR-012.** Per CLAUDE.md rule 2, ADR-005's body is not edited beyond the status header.

ADR-001 (router-index pattern), ADR-002 (JSON source of truth), ADR-003 (version-isolated folders), ADR-006 (consolidated.json as search index) are not affected — they apply identically to the unified skill.

## Migration sequence

1. Write **ADR-012** superseding ADR-005.
2. Author `opensips-config/SKILL.md`.
3. Author `references/3.5/cfg-format.md` and `references/3.6/cfg-format.md` (same content, copied).
4. Update build scripts to output to the new merged tree and to render `modules-index.md`.
5. Move `module_search.py` from the old routing skill to `opensips-config/scripts/`.
6. Update `opensips-security-advisor/SKILL.md` cross-references.
7. Delete the old `opensips-routing/` and `opensips-modules/` directories.
8. Update `plugins/opensips/.claude-plugin/plugin.json` to list two skills instead of three.
9. Update `CLAUDE.md` (rules section, terminology, project status, repository layout diagram) and `README.md` (skill list).
10. Update `docs/requirements.md`, `docs/architecture/data-pipeline.md`, and `docs/architecture/skill-authoring-guide.md` to reflect the two-skill architecture and the new reference files.
11. Update `docs/testing/golden-path-demos.md` and `docs/testing/acceptance-criteria.md` to cover the merged skill's authoring and lookup paths and the loadmodule-scan workflow.
12. Run `npm run build` end-to-end; verify byte-identical idempotency; verify version isolation.

## Acceptance criteria

- The plugin loads in Claude Code with exactly two skills: `opensips-config` and `opensips-security-advisor`.
- Authoring prompts ("write me a registrar that authenticates against MySQL") produce correct, version-grounded output, citing the same references as before the merge.
- Lookup prompts ("what does `t_relay` return?", "what parameters does `dispatcher` expose?") produce correct, version-grounded output via the consolidated.json + per-module Read pattern.
- A prompt with a loaded cfg fragment + a question demonstrates the loadmodule-scan workflow: Claude reads `cfg-format.md`, then `consolidated.json`, then the per-module `.md` files for the modules referenced by `loadmodule` lines, before answering.
- `npm run build` produces byte-identical output on consecutive runs.
- `opensips-security-advisor`'s cross-references resolve and the advisor still functions.
- All golden-path demos pass.

## Risks and mitigations

- **Risk:** Frontmatter description for `opensips-config` becomes too broad and triggers on unrelated SIP-server-lineage prompts. **Mitigation:** description leads with "OpenSIPs" explicitly, names the cfg artifacts and the OpenSIPs-specific identifiers (`opensips.cfg`, `request_route`, `loadmodule`, `modparam`, `$avp`, `$pv`), and includes a sentinel "Do NOT use for sibling SER-lineage projects" clause.
- **Risk:** SKILL.md grows over time as people add to it. **Mitigation:** the cfg-format reference and modules-index reference are the natural overflow targets; reviewers reject SKILL.md additions that belong in a reference.
- **Risk:** The lookup-only path now requires one more Read (modules-index.md instead of inline). **Mitigation:** acceptable cost; the table was always too large to deserve inline status, and the `consolidated.json` upfront read already covers most lookup cases without needing the index at all.
- **Risk:** The migration touches many files at once and could break the build mid-way. **Mitigation:** sequence the migration so the new skill exists alongside the old skills until the cutover is verified, then delete the old directories in a single commit.

## Out of scope

- Any change to the upstream `opensips-docs-collector` extraction project.
- Adding new module content, new core types, or new cross-version analysis.
- Changes to the testing strategy beyond updating the existing demos to match the new paths.
- Changes to `opensips-security-advisor` beyond cross-reference updates.
