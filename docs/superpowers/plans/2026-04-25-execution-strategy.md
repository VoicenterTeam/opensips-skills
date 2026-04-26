<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# opensips-skills Execution Strategy

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver `opensips-skills` v1.0.0 — three coordinated Claude Code Agent Skills (`opensips-routing`, `opensips-modules`, `opensips-security-advisor`) plus the build pipeline that produces their version-grounded reference content for OpenSIPs 3.5 and 3.6 — fast, reliably, and at production quality.

**Architecture:** This is an *orchestration* plan layered on top of the existing 11-milestone implementation plan in `docs/plan/`. Each milestone in `docs/plan/0N-*.md` already contains bite-sized tasks, exact file paths, and acceptance criteria. This document does **not** replicate them. Instead, it specifies (a) which superpower skill to invoke for each milestone, (b) where to dispatch parallel subagents vs. work serially, (c) where to insert code-review checkpoints, and (d) the verification commands that gate each milestone-to-milestone transition.

**Tech Stack (execution side):**
- `superpowers:subagent-driven-development` — per-task subagent dispatch with two-stage review.
- `superpowers:dispatching-parallel-agents` — concurrent independent tasks.
- `superpowers:test-driven-development` — for all milestones with code (M1–M5, M9).
- `superpowers:requesting-code-review` — at every milestone-end checkpoint.
- `superpowers:verification-before-completion` — before declaring any milestone complete.
- `superpowers:systematic-debugging` — when verification fails.
- `superpowers:writing-skills` / `superpowers:receiving-code-review` — for M7 SKILL.md authoring + iteration.

**Tech Stack (project side, recapped from milestones):**
- Node 20 LTS + TypeScript 5 strict + ESM
- Zod schemas, Vitest, Prettier, ESLint with `eslint-plugin-jsdoc`
- Commander, write-file-atomic, json-stringify-deterministic, memfs

---

## Source-data layout (ADR-009 supersedes plan's `source/` references)

**Authoritative:** `docs/architecture/adr/009-data-folder-and-dynamic-version-discovery.md`.

Per ADR-009, source data lives at **`data/`** (not `source/` as the original plan documents say). When executing any milestone task that references `source/`, read `data/` instead. Subagents should be briefed with this translation explicitly in their prompts.

**Current scope (auto-discovered from `data/`):** 3.4, 3.5, 3.6.

**Adding a new version is a data operation, not a code change.** A future contributor drops `data/X.Y/` containing valid extraction output and runs `npm run baseline:update -- --only X.Y` — the full pipeline picks it up without any source-tree edits.

**Per-version inputs:**
- `data/{version}/core/*.json` — 12 doc types (validated, rendered as aggregated `core/*.md`).
- `data/{version}/modules/*.json` — variable count per version (validated, rendered per-module).
- `data/{version}/guides/*.json` — present in 3.4 and 3.6, absent in 3.5; rendered to `references/{version}/guides/*.md` when present, skipped silently when absent.
- `data/{version}/md/` — raw extraction Markdown, **ignored by build**, committed for upstream-resync convenience.
- `data/{version}/opensips-{version}-complete.json` — combined dump, **ignored by build**, committed if present.

**Discover stage requirement (M1):** scan `data/` for subdirectories matching `^\d+\.\d+$`. No version list anywhere in code, tests, CI, or npm scripts.

---

## Execution Principles (apply to every milestone)

These are **non-negotiable**. They override convenience.

1. **TDD for every code path.** Code milestones (M1–M5, M9) follow strict red→green→refactor. Test before implementation, no exceptions. Each per-element renderer, each helper, each schema selector gets a failing test first.
2. **Verification before completion.** Never claim a milestone is done without running its acceptance criteria as actual commands and showing the output. Use `superpowers:verification-before-completion` at each milestone close.
3. **Determinism is load-bearing.** Run `npm run build` twice and `diff -r` after every renderer change from M3 onward. A non-empty diff is a release blocker, not a future-cleanup item.
4. **Commit boundaries match task boundaries.** One task = one commit. Never bundle "while I was in there" changes — they break bisecting.
5. **Generated output is committed alongside source.** Every PR that changes `data/` or `scripts/` re-runs `npm run build` and includes the regenerated artifacts. CI enforces this with `git diff --exit-code`.
6. **Code review at milestone boundaries.** Use `superpowers:requesting-code-review` between M2/M3, M5/M6, M6/M7, M7/M8, M9/M10. Don't enter the next milestone with unreviewed work piled up.
7. **Parallel subagents for independent work only.** Two tasks in parallel only when they touch *no shared files* and have *no shared mutable state*. When in doubt, serial is safer than rework.
8. **Schema mirroring is verbatim.** No "while we're here" schema improvements — that breaks the contract with `opensips-docs-collector`. Hash-check enforces this in CI.
9. **No hand edits to generated files.** If output is wrong, fix the source JSON or the renderer. Hand edits get overwritten on the next build.
10. **No naming sibling SER-lineage projects** in any SKILL.md, ser-lineage-notes, ADR, or commit message. Per ADR-008.
11. **Versions are dynamic, not enumerated.** Per ADR-009, no code path may hard-code which versions exist. The build operates on whatever `data/{X.Y}/` folders are present.
12. **Guides render when present.** A version with `data/{version}/guides/` produces `references/{version}/guides/*.md`. A version without guides produces no guide files and no errors.

---

## Critical Path and Parallelization Map

```
M0 → M1 → M2 → ┬─ M3 ─┐
               └─ M4 ─┴─ M5 → M6 → M7 → M8 → M9 → M10
```

**Sequential gates (cannot start before previous):** M1→M2→M5→M6→M7→M8→M9→M10
**Parallel pair:** M3 and M4 once M2 is done. Combined latency = max(M3, M4), not sum.
**Within-milestone parallelism** is documented per-milestone below.

**The release-readiness chain** is M9 → M10. Don't tag v1.0.0 until M9's CI is green on `main` and the golden-path demos document has been verified within the past 7 days.

---

## Per-Milestone Execution Playbook

Each section below tells you, for the named milestone:
- **Skill:** which superpower skill drives execution
- **Mode:** serial / parallel-batch / interactive
- **Dispatch plan:** subagent breakdown when applicable
- **Review checkpoint:** when to invoke `requesting-code-review`
- **Acceptance verification:** the exact commands proving the milestone is complete
- **Watch-outs specific to execution** (separate from the milestone-doc's risks)

The bite-sized task list itself lives in the corresponding `docs/plan/0N-*.md` file. Read that file when you sit down to execute the milestone.

---

### Milestone 0 — Repository scaffolding

**Skill:** `superpowers:executing-plans`
**Mode:** parallel-batch within a single session
**Plan source:** `docs/plan/00-repository-scaffolding.md`

- [ ] **M0.A** Read `docs/plan/00-repository-scaffolding.md` end-to-end. List its 8 tasks as todos via `TodoWrite`.

- [ ] **M0.B** Execute Task 0.1 (init repo, .gitignore, LICENSE). Single-shot. **Note:** `.gitignore` does **not** exclude `data/` — per ADR-009 the entire `data/` tree (including `md/` and any `complete.json`) is committed.

- [ ] **M0.C** Execute Task 0.2 (folder structure with `.gitkeep` files). Single-shot. **Per ADR-009: do not create `source/`** — `data/` already exists with versions populated. Create only the missing structural directories (`scripts/{lib,schemas,types}`, `plugins/opensips/{.claude-plugin,skills/{opensips-routing,opensips-modules,opensips-security-advisor}}`, `tests/__fixtures__`, `.claude-plugin/`).

- [ ] **M0.D** Dispatch four parallel agents in a single message for Tasks 0.4, 0.5, 0.6, 0.7. They touch disjoint files (`package.json`+`tsconfig.json`, `.eslintrc`+`.prettierrc`, `.claude-plugin/marketplace.json`+`plugins/opensips/.claude-plugin/plugin.json`, `CHANGELOG.md`).

- [ ] **M0.E** Execute Task 0.3 (commit all 34 documentation files). Sequential — verify cross-references resolve before commit.

- [ ] **M0.F** Execute Task 0.8 (first commit + push). Verify GitHub renders CLAUDE.md, detects GPL-3.0.

- [ ] **M0.G** Acceptance verification:
  ```bash
  npm install                      # expect: success, lockfile created
  npx tsc --noEmit                 # expect: pass
  npm run lint                     # expect: pass on empty scripts/
  find docs -name '*.md' | wc -l   # expect: matches INVENTORY.md count
  ```
  Show all four outputs in the milestone-close summary.

**Watch-outs:**
- Empty directories without `.gitkeep` will silently disappear on `git clone`. The acceptance check should confirm `find . -type d` includes every empty placeholder.
- `LICENSE` (no extension) — GitHub's license detector requires this exact filename.

**Review checkpoint:** Self-review only. M0 is mechanical; reserve external review budget for code milestones.

---

### Milestone 1 — Schema mirroring and validation

**Skill:** `superpowers:test-driven-development` (rigid mode) + `superpowers:subagent-driven-development`
**Mode:** mostly serial; one parallel split
**Plan source:** `docs/plan/01-schema-mirroring-and-validation.md`

- [ ] **M1.A** Tasks 1.1 (deps) and 1.2 (mirror schemas) — serial, in one session. Mirroring is verbatim copy with the "DO NOT EDIT" header; **do not improve schemas while mirroring**, even if you spot a typo.

- [ ] **M1.B** Task 1.3 (schema hash check) — one subagent, TDD. Test cases:
  - `computeSchemaHash()` returns the same value on repeated calls
  - Modifying any schema file changes the hash
  - `verifySchemaHash()` returns `{ok: true}` when committed equals computed
  - `verifySchemaHash()` returns `{ok: false}` with both hashes on mismatch
  Implement after tests fail. Commit `.schema-hash` baseline at the end.

- [ ] **M1.C** **Parallel split:** dispatch two subagents in one message:
  - Subagent A: Task 1.4 (`scripts/lib/discover.ts`) with TDD.
  - Subagent B: Task 1.7 (test fixtures under `tests/__fixtures__/source/3.6/`).
  These touch disjoint files. Wait for both before proceeding.

- [ ] **M1.D** Task 1.5 (`scripts/lib/validate.ts`) — single subagent, TDD. Use the fixtures from M1.C.B. Test cases enumerated in the milestone doc — run through all five before implementation.

- [ ] **M1.E** Task 1.6 (orchestrator stub + `npm run validate`). Confirm exit codes: 0 (clean), 3 (validation failure), 5 (schema hash drift).

- [ ] **M1.F** Task 1.8 (real-data validation). Copy 3-5 module files + 1-2 core files from `opensips-docs-collector/data/processed/3.6/` into `source/3.6/`. Run `npm run validate`. Resolve any failures by determining whether the bug is upstream (extraction) or local (mirroring drift) — never by relaxing the schema.

- [ ] **M1.G** Acceptance verification:
  ```bash
  npm run schemas:hash   # idempotent — running twice produces no diff
  npm run validate       # exit 0 against committed real-data slice
  npm test               # all unit tests pass
  ```
  Plus: temporarily corrupt one source file → confirm exit 3. Restore before commit.
  Plus: temporarily edit one schema → confirm exit 5. Revert.

**Review checkpoint:** Code review **required** at end of M1 via `superpowers:requesting-code-review`. M1 establishes the testing patterns and schema-mirroring discipline that all later code milestones inherit. Catching drift early matters.

**Watch-outs:**
- ESM + TypeScript path resolution is fragile. Get `.ts` import extensions right here; do not paper over with `allowImportingTsExtensions` if it can be avoided.
- `zod-validation-error` formatting is a contract — once tests assert on its output, switching modes is expensive. Pick `fromError(zodError).toString()` and stick.

---

### Milestone 2 — Core pipeline foundation

**Skill:** `superpowers:test-driven-development` + `superpowers:dispatching-parallel-agents`
**Mode:** heavily parallel for foundation modules; serial for orchestrator
**Plan source:** `docs/plan/02-core-pipeline-foundation.md`

- [ ] **M2.A** Task 2.1 (deps). Serial.

- [ ] **M2.B** **Dispatch four parallel agents** in a single message for Tasks 2.2, 2.3, 2.4, plus a placeholder agent that drafts the `CliOptions` TypeScript interface in `scripts/types/cli.ts`. They touch disjoint files. Each agent uses TDD discipline.
  - Agent 2.B.1 → Task 2.2: `scripts/lib/errors.ts` (5 error types + `formatError` + `toJSON`)
  - Agent 2.B.2 → Task 2.3: `scripts/lib/fs-helpers.ts` (5 functions, memfs tests)
  - Agent 2.B.3 → Task 2.4: `scripts/lib/environment.ts` (`normalizeEnvironment`)
  - Agent 2.B.4 → `scripts/types/cli.ts` (interface defining all flags from Task 2.6)
  Wait for all four. Run `npm test` to confirm no cross-coupling broke things.

- [ ] **M2.C** Task 2.5 (orchestrator skeleton). **Single subagent, no parallelism.** This file is the project's hub; reserve full attention. Hard rule: keep `scripts/build-references.ts` under 200 lines. If it grows past, factor into `scripts/lib/orchestrator/`.

- [ ] **M2.D** Task 2.6 (CLI surface) and Task 2.7 (output modes) — one subagent, sequential. The two are tightly coupled (CLI flags drive output mode selection). TDD with at least these cases: `--quiet --verbose` → exit 2, `--json` produces parseable JSON on stdout, `--dry-run` writes nothing.

- [ ] **M2.E** Task 2.8 (dry-run E2E verification).

- [ ] **M2.F** Acceptance verification:
  ```bash
  npm run build -- --dry-run --verbose         # exit 0, end-to-end on real data slice
  npm run build -- --dry-run --json | head -1  # confirm valid JSON
  npm run build -- --quiet --verbose           # exit 2 (UsageError)
  # Then: corrupt a source file → exit 3. Edit schema → exit 5. Revert both.
  npm test
  npm run lint                                  # no warnings
  ```

**Review checkpoint:** Code review **required**. M2's orchestrator is the spine; bugs here multiply across every later milestone. Use `superpowers:requesting-code-review` with explicit attention on: the JSON output contract (do not let it drift later), the stderr/stdout discipline (every `console.log` is a place to ask "human progress or machine result?"), and the orchestrator's size budget.

**Watch-outs:**
- `write-file-atomic` requires the rename target on the same filesystem. Document this in the JSDoc and add a sanity check that source and output roots share a filesystem at startup.
- The JSON summary structure becomes a contract the moment any tool consumes it. Lock it down here. Future schema changes require a `schemaVersion` bump on the output itself.

---

### Milestones 3 & 4 — Module rendering + Core type rendering (parallel pair)

These two milestones can run **concurrently** once M2 lands. They share a dependency on the foundation libraries from M3.1–M3.3 (markdown-builders, frontmatter, slug), so M3 must complete those three sub-milestones first; then M4 can start in parallel with M3.4 onward.

**Recommended interleaving:**

```
Time →
M3:  [3.1+3.2+3.3 parallel] [3.4 (8 element renderers, parallel)] [3.5] [3.6] [3.7] [3.8 verify+diff]
M4:  ───────waiting M3.1-3.3──────[4.1 refactor] [4.2 (5 renderers, parallel) + 4.4] [4.3] [4.5] [4.6] [4.7]
```

#### Milestone 3 — Per-module rendering

**Skill:** `superpowers:subagent-driven-development` + `superpowers:test-driven-development`
**Plan source:** `docs/plan/03-per-module-rendering.md`

- [ ] **M3.A** **Dispatch three parallel agents** for foundation libraries (Tasks 3.1, 3.2, 3.3). Disjoint files, all TDD. Wait for all three.
  - 3.A.1 → `scripts/lib/markdown-builders.ts` (12 helpers, each with `@example` JSDoc)
  - 3.A.2 → `scripts/lib/frontmatter.ts` (`renderProvenance` byte-for-byte match)
  - 3.A.3 → `scripts/lib/slug.ts` (`slugify` + `assertUniqueSlugs`)

- [ ] **M3.B** Task 3.4 (per-element renderers). **Dispatch eight parallel agents** in one message — each owns one element type. Files: `scripts/render-module/elements.ts` is shared, so coordinate by having each agent add its function in alphabetical order with a clear separator comment. **Alternative (recommended):** put each element renderer in its own file under `scripts/render-module/elements/` and export from a barrel — eliminates the merge-conflict risk.
  - 3.B.1 → `renderParameter`
  - 3.B.2 → `renderFunction`
  - 3.B.3 → `renderPseudoVariable`
  - 3.B.4 → `renderMICommand`
  - 3.B.5 → `renderStatistic`
  - 3.B.6 → `renderEvent`
  - 3.B.7 → `renderConfigExample`
  - 3.B.8 → `renderDependencies`
  Each agent: minimal-input test, maximal-input test, empty-omission test, then implementation. Inline `toMatchInlineSnapshot()`.

- [ ] **M3.C** Task 3.5 (`renderModule` composition). Single subagent. Test: minimal fixture produces correct H1/provenance/section ordering; maximal fixture produces a comprehensive but well-under-1200-line file.

- [ ] **M3.D** Task 3.6 (output validation). Single subagent. TDD with one test per validation rule.

- [ ] **M3.E** Task 3.7 (orchestrator integration). Single subagent. Verify slug-uniqueness check throws *before* any rendering happens (prevents partial output on collision).

- [ ] **M3.F** Task 3.8 (real-data verification + build-twice diff). The diff **must** be empty. If non-empty, run `superpowers:systematic-debugging` to root-cause before committing.

- [ ] **M3.G** Acceptance verification:
  ```bash
  npm run build -- --only 3.6 --verbose
  ls plugins/opensips/skills/opensips-modules/references/3.6/modules/ | wc -l   # matches source module count
  npm run build -- --only 3.6 && cp -r plugins/opensips/skills/opensips-modules/references/3.6 /tmp/build1
  npm run build -- --only 3.6
  diff -r /tmp/build1 plugins/opensips/skills/opensips-modules/references/3.6   # MUST be empty
  npm test
  ```
  Plus: open 3-4 generated `.md` files; spot-check against upstream OpenSIPs documentation for content fidelity.

**Review checkpoint:** Code review **required** before M5. M3's renderer architecture sets the pattern M4 inherits; locking it in here prevents M4 from copying-then-diverging.

#### Milestone 4 — Core type rendering

**Skill:** `superpowers:subagent-driven-development`
**Plan source:** `docs/plan/04-core-type-rendering.md`

- [ ] **M4.A** Task 4.1 (heading-level refactor). Single subagent. **Run all M3 unit tests after the refactor before proceeding** — refactoring 8 element renderers is mechanical but easy to break one. Confirm the existing M3 module-file output is byte-identical (diff against committed `.md` files).

- [ ] **M4.B** **Dispatch six parallel agents** for Tasks 4.2 (5 core-only renderers) + 4.4 (lead paragraphs). Disjoint, TDD.
  - 4.B.1 → `renderOperator`
  - 4.B.2 → `renderStatement`
  - 4.B.3 → `renderRouteBlock`
  - 4.B.4 → `renderTransformation`
  - 4.B.5 → `renderFlag` (note unusual three-type shape)
  - 4.B.6 → `scripts/render-core/lead-paragraphs.ts` (12 hard-coded paragraphs)

- [ ] **M4.C** Task 4.3 (`renderCoreDocument` + dispatch table). Use `satisfies Record<CoreDocType, ElementRenderer>` so missing renderers are compile errors, not runtime gaps.

- [ ] **M4.D** Task 4.5 (extract validation to `scripts/lib/validate-markdown.ts`). Run M3 tests after extraction to confirm no regression.

- [ ] **M4.E** Task 4.6 (orchestrator integration). Critical detail: core files live in `opensips-routing`, not `opensips-modules`. Wrong path = files invisible to Claude at runtime. Add a unit test asserting the path construction.

- [ ] **M4.E.guides** **(per ADR-009 implementation notes)** Add a guides renderer as a 13th doc type. Single subagent. Guides use the per-file output pattern (one `.md` per guide JSON, like modules), not the aggregated pattern. Output goes to `plugins/.../opensips-routing/references/{version}/guides/{configuration,installation,syntax}.md`. Discover stage must detect presence/absence of `data/{version}/guides/` and skip silently when absent (3.5 has no guides). Reuse markdown-builders + validation library. Add a test verifying that processing a version without guides produces no `guides/` output and no errors.

- [ ] **M4.F** Task 4.7 (real-data + build-twice diff). Spot-check both: a version with guides (3.4 or 3.6 produces `guides/*.md`) and a version without (3.5 produces no `guides/` dir).

- [ ] **M4.G** Acceptance verification:
  ```bash
  npm run build -- --only 3.6
  ls plugins/opensips/skills/opensips-routing/references/3.6/core/ | wc -l   # expect: 12
  # Build-twice diff
  npm run build -- --only 3.6 && cp -r plugins/opensips/skills/opensips-routing/references/3.6/core /tmp/core1
  npm run build -- --only 3.6
  diff -r /tmp/core1 plugins/opensips/skills/opensips-routing/references/3.6/core   # MUST be empty
  ```

**Review checkpoint:** Self-review for M4 individually; the joint M3+M4 review happens at the M5 boundary.

---

### Milestone 5 — Consolidated index

**Skill:** `superpowers:test-driven-development`
**Mode:** mostly parallel small modules
**Plan source:** `docs/plan/05-consolidated-index.md`

- [ ] **M5.A** **Dispatch four parallel agents** for Tasks 5.1, 5.2, 5.3, 5.4. They touch disjoint files, all TDD.
  - 5.A.1 → `scripts/types/consolidated.ts`
  - 5.A.2 → `scripts/build-consolidated/index.ts`
  - 5.A.3 → `scripts/build-consolidated/serialize.ts`
  - 5.A.4 → `scripts/build-consolidated/canary.ts`

- [ ] **M5.B** Task 5.5 (orchestrator integration). Validate the produced index against the **mirrored** `ConsolidatedDocumentSchema` from M1 *before* writing — this catches index-builder bugs at build time. If the schema and builder disagree, reconcile by updating the builder; do not silently change the schema (it's mirrored, requires upstream change + re-mirror + hash regen).

- [ ] **M5.C** Task 5.6 (real-data verification + build-twice hash check).

- [ ] **M5.D** Acceptance verification:
  ```bash
  npm run build -- --only 3.6
  jq '.statistics' plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json
  # Spot-check: pick 3 known function names, confirm they appear in functionsByName
  jq '.indexes.functionsByName | keys | length' plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json
  # Determinism
  sha256sum plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json > /tmp/h1
  npm run clean && npm run build -- --only 3.6
  sha256sum plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json > /tmp/h2
  diff /tmp/h1 /tmp/h2   # MUST be empty
  ```

**Review checkpoint:** Code review **required** spanning M3+M4+M5. The single-version pipeline is now complete; this is the right moment for a full architectural review before generalizing to multi-version. Use `superpowers:requesting-code-review` with focus on: determinism guarantees, schema-validation coverage of generated artifacts, and orchestrator complexity.

**Watch-outs:**
- `json-stringify-deterministic` quirks — read its docs once, document caveats in `serialize.ts` JSDoc.
- Path strings on Windows: use `posixPath` everywhere in the index. A naive `path.join` produces backslashes.

---

### Milestone 6 — Multi-version verification (now: 3.4, 3.5, 3.6 — dynamic forever)

**Skill:** `superpowers:executing-plans` + `superpowers:verification-before-completion`
**Mode:** sequential verification
**Plan source:** `docs/plan/06-multi-version-support.md`, plus ADR-009 for the dynamic-discovery requirement.

This milestone is mostly **verification**, not implementation. The pipeline was designed version-isolated from the start; this is where that claim becomes empirical. Per ADR-009, the milestone now generalizes from "verify 3.5 + 3.6" to "verify all versions discovered in `data/`" — currently 3.4, 3.5, 3.6.

- [ ] **M6.A** Tasks 6.1+6.2 (modified): source data is already at `data/{3.4,3.5,3.6}/`. Run `npm run validate` (no `--only` — let it discover all versions). If any version fails: classify (schema drift vs. real upstream bug) and resolve **upstream**, never by relaxing the schema here.

- [ ] **M6.B** Tasks 6.3+6.4: Run `npm run build --verbose` (all versions). Verify each version's directory structure. Address any version-specific edge cases the renderer didn't anticipate. Pay attention to **guides handling**: 3.4 and 3.6 should produce `references/{version}/guides/*.md`; 3.5 should produce no guides files and no errors.

- [ ] **M6.C** **Task 6.5 generalized — version isolation checks (do not skip).** For each pair of distinct versions discovered in `data/`, verify no cross-pollination:
  ```bash
  for v_other in $(ls data/ | grep -E '^[0-9]+\.[0-9]+$'); do
    for v_target in $(ls data/ | grep -E '^[0-9]+\.[0-9]+$'); do
      [ "$v_other" = "$v_target" ] && continue
      # Verify v_target's tree does not reference v_other's paths
      grep -rn "references/${v_other}" plugins/opensips/skills/opensips-modules/references/${v_target}/ && exit 1
      grep -rn "references/${v_other}" plugins/opensips/skills/opensips-routing/references/${v_target}/ && exit 1
      jq -e ".indexes.functionsByName | to_entries[] | select(.value.path | contains(\"${v_other}\"))" plugins/opensips/skills/opensips-modules/references/${v_target}/consolidated.json && exit 1
    done
  done
  echo "Version isolation: PASS"
  ```
  Any non-empty grep/jq result is a renderer bug to root-cause via `superpowers:systematic-debugging` before continuing.

- [ ] **M6.D** Task 6.6: Multi-version build-twice diff (across all discovered versions).
  ```bash
  npm run build
  find plugins/opensips/skills -type f \( -name '*.md' -o -name '*.json' \) | sort | xargs sha256sum > /tmp/b1.hashes
  npm run clean
  npm run build
  find plugins/opensips/skills -type f \( -name '*.md' -o -name '*.json' \) | sort | xargs sha256sum > /tmp/b2.hashes
  diff /tmp/b1.hashes /tmp/b2.hashes   # MUST be empty
  ```

- [ ] **M6.E** Task 6.7: `.statistics-baseline.json` is already structured per-version (per ADR-009 + plan M6 spec). Run `npm run baseline:update` (no `--only`) to populate baselines for all discovered versions. Commit.

- [ ] **M6.F** Task 6.8: Commit. Note in PR description that the bulk of the diff is generated content for three versions.

**Review checkpoint:** Self-review with the version-isolation loop above. External code review is optional unless an isolation check failed or guides rendering is producing surprises.

**Onboarding-future-version sanity check:** Before closing M6, confirm the workflow in ADR-009 (drop folder → validate → build → baseline → commit) actually requires zero code changes by simulating it: temporarily rename `data/3.4/` to `data/3.7/`, run `npm run baseline:update -- --only 3.7 && npm run build`, confirm all artifacts produced. Rename back. Document the simulation result.

---

### Milestone 7 — Skill authoring

**Skill:** `superpowers:writing-skills` + `superpowers:receiving-code-review`
**Mode:** parallel file authoring + sequential build-step
**Plan source:** `docs/plan/07-skill-authoring.md`

This milestone is **prose authoring**, not code. TDD does not apply. Quality discipline shifts to: re-read `docs/architecture/skill-authoring-guide.md` end-to-end before writing, then iterate against it.

- [ ] **M7.A** Task 7.1: re-read `docs/architecture/skill-authoring-guide.md`. Verify (mentally) you can recite the four-part description structure and the seven-section body order.

- [ ] **M7.B** **Dispatch four parallel agents** in one message for Tasks 7.2, 7.3, 7.4, 7.6. Disjoint files.
  - 7.B.1 → `plugins/opensips/skills/opensips-routing/SKILL.md` (largest; 250–450 lines)
  - 7.B.2 → `plugins/opensips/skills/opensips-modules/SKILL.md` (router-index; with `<!-- MODULE_INDEX_PLACEHOLDER -->`)
  - 7.B.3 → `plugins/opensips/skills/opensips-security-advisor/SKILL.md` (scaffold; 30–80 lines)
  - 7.B.4 → `plugins/opensips/skills/opensips-routing/references/3.5/ser-lineage-notes.md` AND `.../3.6/ser-lineage-notes.md`
  Each agent receives the skill authoring guide as context and the rule that the cross-project guardrail wording must be **identical** across all three SKILL.md files (drift = bug).

- [ ] **M7.C** Task 7.5 (build-module-index step). Single subagent. TDD: idempotent placeholder replacement; running build twice produces identical SKILL.md output.

- [ ] **M7.D** Task 7.7 (structure verification).
  ```bash
  find plugins/opensips/skills -name SKILL.md | wc -l                 # expect: 3
  find plugins/opensips/skills -name 'ser-lineage-notes.md' | wc -l   # expect: 2
  find plugins/opensips/skills/opensips-modules/references -name 'consolidated.json' | wc -l   # expect: 2
  grep -rn "<!-- MODULE_INDEX_PLACEHOLDER -->" plugins/opensips/skills/   # MUST be empty
  # Sibling-project name leak check (per ADR-008):
  grep -irn -E "(kamailio|opensips-?ser|sip-?router)" plugins/opensips/skills/ docs/architecture/adr/008-* docs/architecture/skill-authoring-guide.md
  # Only ADR-008's lineage-acknowledgment paragraph and ser-lineage-notes' lineage paragraph are allowed hits.
  ```

- [ ] **M7.E** Self-review pass: open each SKILL.md in a Markdown previewer; read as if encountering for the first time. Iterate if the guardrail doesn't land or trigger keywords feel weak.

- [ ] **M7.F** Task 7.8 (commit + review).

**Review checkpoint:** Code review **required**. SKILL.md files run on every Claude Code session that activates them — they are the project's most consequential output. Use `superpowers:requesting-code-review` with focus on: (1) description front-loading (does the OpenSIPs identifier and exclusion clause survive 250-char truncation?), (2) cross-project guardrail consistency across the three files, (3) reference-path placeholders use `{version}` literal, not a hard-coded version.

**Watch-outs:**
- The Bad/Good example pattern fails when Bad is more memorable than Good. Keep them balanced; Good should be at least as detailed as Bad.
- The cross-project guardrail boilerplate is a **feature**, not a redundancy. Identical wording across files lets contributors keep them in sync; varied wording drifts.
- ADR-008 forbids naming sibling SER-lineage projects anywhere except the single lineage-acknowledgment paragraph in `ser-lineage-notes.md`. Run the grep check above before commit.

---

### Milestone 8 — Local plugin testing

**Skill:** `superpowers:executing-plans` + `superpowers:systematic-debugging`
**Mode:** interactive, sequential
**Plan source:** `docs/plan/08-local-plugin-testing.md`

This milestone is **interactive runtime verification**. Cannot be parallelized; cannot be subagent-dispatched. The maintainer runs prompts against Claude Code and observes behavior.

- [ ] **M8.A** Task 8.1: install via `claude --plugin-dir`. Confirm `/skills` lists all three.

- [ ] **M8.B** Task 8.2 (trigger reliability). Use **fresh Claude Code session per prompt** — context contamination from earlier prompts is the #1 source of false positives. Log each outcome immediately to `docs/testing/local-test-results.md` (transient).

- [ ] **M8.C** Task 8.3 (reference-file loading). For each of the 3 prompts, **inspect the tool-use trail** to confirm the right files were read. A response that "looks right" without matching tool-use is a hallucination, not a pass.

- [ ] **M8.D** Task 8.4 (version-aware behavior). Especially: the no-version-specified prompt should resolve to default 3.6, not silently pick 3.5 (alphabetically first).

- [ ] **M8.E** Task 8.5 (multi-skill coordination).

- [ ] **M8.F** Task 8.6 (`/reload-plugins` smoke test).

- [ ] **M8.G** Task 8.7+8.8: aggregate results in `docs/testing/local-test-results.md`. **Iterate any discovered issues before milestone close** — a failure here that ships locks broken behavior into M9's golden-path tests.

- [ ] **M8.H** Acceptance verification:
  - ≥80% should-trigger pass rate on first try
  - ≥80% should-not-trigger correctly suppress
  - All 3 reference-loading prompts demonstrably read the right files
  - All 3 version-aware cases work
  - Multi-skill prompt activates all three
  - Hot-reload works
  Document the model used (Sonnet/Opus/Haiku); behavior differs across them.

**Review checkpoint:** Self-review against the test-results document. External review optional unless ≥3 SKILL.md fixes were needed during M8 — at that point, request a second opinion before declaring done.

---

### Milestone 9 — Test suite and CI

**Skill:** `superpowers:test-driven-development` + `superpowers:dispatching-parallel-agents`
**Mode:** heavily parallel
**Plan source:** `docs/plan/09-test-suite-and-ci.md`

- [ ] **M9.A** Task 9.1 (vitest config + test directory structure). Single subagent.

- [ ] **M9.B** **Dispatch four parallel agents** for Tasks 9.2, 9.3, 9.4, 9.7. Disjoint test files.
  - 9.B.1 → Task 9.2: foundation library tests (`tests/unit/lib/`)
  - 9.B.2 → Task 9.3: renderer + index tests (`tests/unit/render-module/`, `tests/unit/render-core/`, `tests/unit/build-consolidated/`)
  - 9.B.3 → Task 9.4: golden fixtures + `tests/golden/*.test.ts`
  - 9.B.4 → Task 9.7: `docs/testing/golden-path-demos.md` content (if not already authored — check first)

- [ ] **M9.C** Task 9.5 (E2E pipeline tests). Single subagent. Use `mkdtempSync` for isolation; afterEach cleanup.

- [ ] **M9.D** Task 9.6 (determinism test as automated test). Single subagent. Run it 10× in a row to confirm no flakiness.

- [ ] **M9.E** Task 9.9 (SKILL.md placeholder CI check).

- [ ] **M9.F** Task 9.8 (GitHub Actions CI). Single subagent. Five jobs: validate, build, test, determinism, lint. Plus the M7 placeholder/lineage-grep check from M9.E.

- [ ] **M9.G** Task 9.10 (`docs/testing/test-strategy.md` write-up).

- [ ] **M9.H** Acceptance verification:
  ```bash
  npm run test:coverage   # >80% lib, >85% renderers
  npm run test:golden     # all golden tests pass
  npm run test:e2e        # all E2E tests pass
  # Push a test PR with a deliberate typo in a SKILL.md → CI fails appropriately
  ```
  Confirm CI is green on `main` after M9 commit.

**Review checkpoint:** Code review **required** before M10. CI is the gate; M10 cannot release without green CI on `main`.

**Watch-outs:**
- Coverage as a metric vs. coverage as a goal — don't write empty tests to hit 80%. A test that doesn't exercise meaningful behavior is worse than no test.
- Golden-file rot: every `npm run test:golden -- -u` PR must explain *why* output changed. Reviewer must read the diff.
- Flaky tests: zero tolerance. A test that passes 99/100 times is broken; fix or delete, never "rerun CI."

---

### Milestone 10 — Public release prep

**Skill:** `superpowers:executing-plans` + `superpowers:requesting-code-review`
**Mode:** parallel docs + sequential ceremony
**Plan source:** `docs/plan/10-public-release-prep.md`

- [ ] **M10.A** **Dispatch five parallel agents** for Tasks 10.1, 10.2, 10.4, 10.5, 10.9 (the documentation tasks).
  - 10.A.1 → `README.md` (public landing; 300–400 lines)
  - 10.A.2 → `CONTRIBUTING.md` (250–350 lines)
  - 10.A.3 → `docs/process/release-process.md`
  - 10.A.4 → `docs/usage-guide.md` (200–300 lines)
  - 10.A.5 → `docs/process/maintenance.md`

- [ ] **M10.B** Tasks 10.3 (manifest polish) + 10.6 (CHANGELOG v1.0.0 entry). Single subagent.

- [ ] **M10.C** **Task 10.7 — pre-release checklist (sequential, cannot skip).**
  ```bash
  npm run validate         # exit 0
  npm run build && git diff --exit-code   # no uncommitted regen
  npm test                 # all pass including determinism
  ```
  Plus: CI green on main. Plus: golden-path demos manually verified within last 7 days.

- [ ] **M10.D** Task 10.10 (final review): read every public-facing doc as a new visitor. Fix broken cross-references and stale content.

- [ ] **M10.E** Task 10.8 (tag + release).
  ```bash
  git tag v1.0.0
  git push --tags
  ```
  Create GitHub release from tag; submit to Claude Code marketplace.

**Review checkpoint:** Code review **required** before tagging. Use `superpowers:requesting-code-review` for: (1) README's quick example (the most consequential text in the repo), (2) marketplace.json description (marketing copy that has to be both accurate and compelling), (3) CHANGELOG completeness.

**Watch-outs:**
- Releasing too early: if golden-path demos are at 60% pass rate, **delay**. v1.0.0 sets the quality bar; releasing low locks low expectations.
- Releasing too late: when the checklist is green, **ship**. Perpetual "not ready" never gets feedback.
- License audit: confirm nothing in generated artifacts (consolidated.json, rendered Markdown) violates upstream attribution requirements from `opensips-docs-collector`.

---

## Cross-Cutting Concerns

### When verification fails (any milestone)

Invoke `superpowers:systematic-debugging` immediately. Do **not**:
- Relax the schema to "make it pass"
- Skip the build-twice diff "for now"
- Accept "looks right" as evidence of correctness
- Use destructive git commands as a shortcut

Determinism failures, isolation failures, and validation failures are **always** real bugs. Ship none of them.

### Daily / per-PR discipline

Every PR — regardless of which milestone it belongs to — must:
1. Pass `npm run validate`
2. Pass `npm run build` with `git diff --exit-code` clean (no uncommitted regen)
3. Pass `npm test`
4. Pass `npm run lint`
5. Have a CHANGELOG.md `[Unreleased]` entry
6. Pass the lineage-name grep (`grep -irn -E "(kamailio|sip-?router)" plugins/ docs/`) with only ADR-008 and ser-lineage-notes acknowledgments allowed

### When CI is red

Treat red CI as a release blocker. Don't merge through it. Don't `--no-verify`. If the failure is in a flaky test (M9.D's determinism test failing 1/100 times, etc.), **fix or delete the test**; do not retry.

### When a subagent's work needs revision

Two-stage review per `superpowers:subagent-driven-development`:
- **Stage 1:** verify the agent did what was asked (correct file, correct test cases, no off-task changes).
- **Stage 2:** spot-check correctness — run the tests, read the implementation, confirm acceptance criteria.
If either stage finds issues, dispatch a follow-up subagent rather than fixing inline. Keeps the loop tight and reviewable.

### Schema mirroring discipline (M1, recurring)

Every time `opensips-docs-collector` ships a schema change:
1. Re-mirror the affected schema files into `scripts/schemas/`.
2. Run `npm run schemas:hash` and commit the new `.schema-hash`.
3. Run `npm run validate` against current source.
4. If validation fails on real data, that's a real upstream issue — not a reason to relax the schema here.
5. PR description must link to the upstream commit that motivated the re-mirror.

### Golden-path demos cadence

The demos in `docs/testing/golden-path-demos.md` are **manually run** before every release. Schedule:
- After every M7 SKILL.md change → re-run the demos.
- Before every release tag → re-run within 7 days of tagging.
- Quarterly even if no SKILL.md changes (catch upstream behavior drift).

---

## Risk Mitigation Cheat Sheet

| Risk | Trigger | Response |
|---|---|---|
| Determinism breaks | build-twice diff non-empty | Stop. Run `superpowers:systematic-debugging`. Do not commit. |
| Schema drift not caught | extraction project shipped change without notification | M1 hash check fails build. Re-mirror, regen hash, validate. |
| Sibling-project name leak | grep finds Kamailio/SER hit outside ADR-008 | Block the PR. Edit out the mention; per ADR-008, no exceptions. |
| Cross-version path leak | M6.D grep finds `3.5` in `3.6/` (or vice versa) | Renderer bug. Find the hardcoded version reference; fix. |
| SKILL.md placeholder leak | M9.E CI check finds `<!-- MODULE_INDEX_PLACEHOLDER -->` | Build script's replace-step failed silently. Fix and re-run. |
| Trigger unreliability | <80% pass rate in M8 | Iterate description front-loading and exclusion clause. Re-test with fresh sessions. |
| Reference file not loaded | Claude answers from training data without reading | Strengthen body imperatives ("Read..." not "See..."). Re-test. |
| CI flakiness | Test passes 99/100 times | Fix or delete the test. Never tolerate "rerun CI." |
| Build time > 30s | After M6, multi-version build slow | Profile. Probably fine; revisit only if it crosses 30s for two versions. |

---

## Estimated Latency (rough, not committed)

Optimistic, parallel-where-possible, single skilled engineer using superpower workflows:

| Milestone | Sequential cost | With parallelism |
|---|---|---|
| M0 | 0.5d | 0.3d |
| M1 | 1.5d | 1.0d |
| M2 | 1.5d | 0.8d |
| M3 + M4 | 4.0d | 2.5d (run concurrently) |
| M5 | 1.0d | 0.6d |
| M6 | 1.0d | 1.0d (mostly verification) |
| M7 | 1.5d | 0.8d |
| M8 | 1.0d | 1.0d (interactive, no parallel) |
| M9 | 2.0d | 1.0d |
| M10 | 1.0d | 0.5d |
| **Total** | **~15d** | **~9.5d** |

Don't anchor on these. Time estimates with AI assistance are unreliable. Treat as a sanity check that the project is days, not weeks — and if a milestone runs 3× over, stop and ask why.

---

## Execution Handoff

This plan is a **playbook**, not a sequential script. Two ways to execute:

**1. Subagent-Driven (recommended for M2, M3, M4, M5, M9)** — dispatch a fresh subagent per task as documented above. Required sub-skill: `superpowers:subagent-driven-development`. Two-stage review between every task. Best when the per-milestone tasks are well-defined and parallel.

**2. Inline Execution (recommended for M0, M6, M7, M8, M10)** — execute tasks in the current session using `superpowers:executing-plans`. Best when the work is interactive, prose-heavy, or where a single coherent context matters more than parallelism.

For the code milestones (M1–M5, M9), default to subagent-driven; downgrade to inline only if a milestone produces unexpected complexity that needs a single coherent context to resolve.

Each milestone's checkboxes above are the run-time todos. Mark them off with `TodoWrite` as you go. **Do not move to the next milestone until the current milestone's acceptance verification has been run and shown green.**

---

## Self-Review

**Spec coverage:** All 11 milestone files in `docs/plan/` are mapped. Each has a corresponding section above with skill, mode, dispatch plan, review checkpoint, and acceptance verification. ✓

**Placeholder scan:** No "TBD", "implement later", or untyped "fill in details." Every checkbox is concrete: name a task, name a verification, name an exit condition. ✓

**Type consistency:** All file paths match the milestone docs (e.g., `scripts/render-module/elements.ts` consistent across M3.B and M4.A). All npm scripts (`npm run build`, `npm run validate`, `npm run schemas:hash`, `npm run baseline:update`, `npm run test:golden`) match the milestone-doc names. ✓

**Cross-cutting completeness:** Determinism, schema mirroring, sibling-name discipline, and CI red-handling are addressed under Cross-Cutting Concerns. The risk-mitigation table covers the top 9 failure modes from the milestone docs. ✓

---

*Plan saved to `docs/superpowers/plans/2026-04-25-execution-strategy.md`. The 11 milestone files in `docs/plan/` remain the implementation source of truth; this document is the orchestration layer that makes them executable fast and reliably.*
