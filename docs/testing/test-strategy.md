<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Test Strategy

> **Purpose:** Defines what is tested, at what level, by what mechanism, and what failing each test indicates. Reference material for contributors and maintainers — answers "how do I add a test for X?" and "why did this CI job fail?"
>
> **Audience:** Contributors writing tests, maintainers debugging CI failures, anyone trying to understand what the test suite actually proves.
>
> **Status:** Authoritative for testing decisions. Changes follow the same review process as code — substantial changes warrant an ADR.

---

## 1. Overview: what is tested at each level

The project tests at five levels. Each level catches a distinct class of failure; together they form the regression net that protects the build pipeline and the shipped plugin.

### 1.1 Unit tests — foundation libraries

Location: `tests/unit/lib/`.

Scope: every module under `scripts/lib/` (markdown builders, frontmatter, slug, fs-helpers, errors, discover, validate). Tests are small, fast, and isolated; they use `memfs` for filesystem operations so they never touch the real disk.

Failure means: a foundation primitive produces wrong output for a known input. Because the renderers compose through these primitives, foundation bugs cascade — these tests are the first line of defense.

### 1.2 Integration tests — orchestrator + element renderers

Location: `tests/unit/render-module/`, `tests/unit/render-core/`, `tests/unit/build-consolidated/`.

Scope: each per-element renderer in isolation, plus the per-version orchestrator stages. Tests construct typed inputs that match the schema, call the renderer, and assert against inline snapshots.

Each renderer has at least three cases: minimal input (only required fields), maximal input (all optional fields populated), and empty-handling (verifies optional sections are omitted, not emitted as empty).

Failure means: a renderer changed its output shape, or a stage in the orchestrator stopped composing the right elements in the right order.

### 1.3 End-to-end tests — full pipeline against tmp output

Location: `tests/e2e/`.

Scope: the orchestrator running the full pipeline against fixture data. Each test creates a fresh tmp directory with `mkdtemp`, runs `runBuild` against `tests/__fixtures__/source/`, and asserts on the output tree. Teardown via `afterEach` removes the tmp directory.

Covered scenarios:

- Full build produces the expected output structure.
- `--dry-run` reports counts without writing.
- `--only` builds only the specified version.
- Build aborts with exit code 3 on validation failure.
- Build aborts with exit code 5 on schema hash drift.
- Version isolation: building both versions does not produce cross-version paths in either output tree.

No E2E test writes to `plugins/opensips/skills/` directly. The production tree is sacred.

Failure means: a stage integration regressed (validation no longer feeds rendering correctly, or the orchestrator's exit-code policy diverged from `data-pipeline.md` §4).

### 1.4 Determinism tests — build twice, diff

Location: `tests/e2e/determinism.test.ts`.

Scope: the load-bearing property of the entire pipeline (`data-pipeline.md` §3). Builds the fixture corpus into two separate tmp directories, hashes both output trees with SHA-256 over sorted file content, asserts the hashes are equal.

Failure means: the pipeline introduced non-determinism somewhere. Common causes are unsorted iteration, embedded timestamps, locale-dependent string comparison, hash-introducing changes. Fix is in the renderer or pipeline code, never in the test.

### 1.5 Runtime behavior — golden-path demos run manually

Location: `docs/testing/golden-path-demos.md`.

Scope: Claude's actual triggering behavior, reference-loading behavior, cross-project guardrail engagement, and version-aware reasoning. Run by a human against a real Claude Code session before each release. Outcomes are recorded as a date-stamped pass/partial/fail per demo.

Failure means: the plugin's runtime behavior regressed. Investigation is qualitative (responses are non-deterministic) and feeds back into description tuning, body edits, or reference content.

---

## 2. What is NOT tested in CI (and why)

### 2.1 Claude's actual triggering behavior

The plugin's most consequential behavior — does the right skill activate for the right prompt, does Claude actually read the reference files, does the cross-project guardrail engage on Kamailio prompts — is not run in CI.

Reasons:

- Each test invocation costs API tokens. CI runs on every push and pull request; the cost compounds.
- Claude's behavior varies across model versions and across runs of the same model. Assertions would need to tolerate variance, which dilutes their signal.
- Triggering is probabilistic. A test that asserts "this prompt triggers `opensips-config`" can pass 95% of the time and fail on the unlucky run, producing flaky CI.

The mitigation: the canonical prompt suite (`docs/testing/golden-path-demos.md`) is run manually by the maintainer before each release. This is required, not optional. The release process document specifies it explicitly.

If the project later grows to justify the cost (more contributors, more frequent releases), automating runtime testing is a valid v2 enhancement. For v1, manual verification is sufficient and proportional.

### 2.2 Plugin install in real Claude Code

The end-to-end install flow — `claude --plugin-dir ./plugins/opensips`, `/plugin list` showing both skills, `/reload-plugins` picking up edits — is verified manually as part of the per-release smoke check, not in CI.

Reason: real Claude Code is a closed product without a CI-friendly headless mode. A surrogate that runs the manifest validation can confirm the manifest is well-formed but cannot confirm the install actually works.

### 2.3 Production OpenSIPs runtime correctness

The pipeline does not verify that the configurations Claude produces are actually accepted by an OpenSIPs binary at runtime. That is upstream's responsibility. The project trusts the extraction project's documentation and commits to faithful transformation, not to runtime validation (Rule 3 in `CLAUDE.md`).

---

## 3. CI gates

GitHub Actions runs the following jobs on every push to `main` and every pull request. The workflow file is `.github/workflows/ci.yml`.

| Job | What it runs | Failing means |
|---|---|---|
| `validate` | `npm run validate` | Source JSON has structural problems. Likely causes: schema drift in upstream, malformed source after a manual edit, or a bug in the validation pipeline. |
| `build` | `npm run build` then `git diff --exit-code` | Either the build is broken, or the regenerated output was not committed (the "forgot to rebuild" PR). Per `data-pipeline.md` §8.1 the generated output is committed alongside source. |
| `test` | `npm test` (unit + golden + e2e + determinism) | A unit, renderer, golden-file, E2E, or determinism test failed. The job log identifies the specific test. |
| `lint` | ESLint + Prettier | Code style, JSDoc rules, or TypeScript strict-mode violations. |
| `skill-md-check` | Greps committed SKILL.md files for unreplaced `<!-- MODULE_INDEX_PLACEHOLDER -->` and `<!-- CFG_FORMAT_PLACEHOLDER -->` markers and for forbidden sibling-project names (Kamailio, OpenSER, SER) outside `ser-lineage-notes.md`. | Either the build script's placeholder-replacement step failed silently, or a recent SKILL.md edit leaked a sibling-project name into prose where Rule 7 in `CLAUDE.md` forbids it. |

`validate` is the fastest job and gates the others — if validation fails, downstream jobs do not run. The remaining jobs run in parallel.

Total CI time should stay under five minutes for v1. If it exceeds ten minutes, the iteration loop suffers and the test suite needs review.

---

## 4. Local development workflow

### Day-to-day iteration

```bash
npm run test:watch
```

Vitest in watch mode reruns affected tests on every save. Fast feedback for unit and renderer changes.

### Before pushing

```bash
npm test                # Full suite (unit + golden + e2e + determinism)
npm run test:coverage   # Coverage report; verify the layer floors below
```

These together take under a minute on the v1 fixture corpus.

### For thorough checks before significant changes

```bash
npm run test:e2e        # Slower E2E tests in isolation
npm run validate        # Schema check across all source
npm run build           # Full build, verify output matches committed
```

Worth running before changes that touch the rendering pipeline, schemas, or the orchestrator.

### After a deliberate statistics shift

```bash
npm run baseline:update
```

Run this only when new modules are added to source (or removed) and the consolidated.json statistics legitimately change. The baseline is the canary — refreshing it without a real reason defeats its purpose.

### Before a release

Manual run-through of `docs/testing/golden-path-demos.md` against a freshly installed plugin. See §6.

---

## 5. Golden-file update workflow

Golden-file fixtures live in `tests/__fixtures__/expected/`. They are committed and reviewed. They pass as long as the renderer's output matches them — which is exactly what makes them valuable, and exactly what makes regenerating them without scrutiny dangerous.

When a renderer change legitimately changes output:

1. Run the regeneration helper:
   ```bash
   tsx tests/__fixtures__/golden/regenerate.ts
   ```
2. Review the diff carefully:
   ```bash
   git diff tests/__fixtures__/expected/
   ```
   Every changed line must be intentional. If the diff includes unexpected changes (other modules' output shifted, unexplained whitespace differences), stop and investigate — the renderer change had broader effects than intended.
3. Commit the regenerated fixtures alongside the code change in the same PR.
4. The PR description must explain **why** the output changed. A PR that updates golden fixtures without explaining the rendering change is a red flag for reviewers.

Discipline rule (per `CLAUDE.md`): a PR that updates golden fixtures must explain why. Large unreviewable diffs (e.g., regenerating all 100 module fixtures) are blocked unless the rendering change genuinely affects every module.

Golden-file rot — fixtures that drift from meaningful checks into rubber-stamps — is the failure mode this discipline prevents.

---

## 6. Release-time workflow

Before tagging a release:

1. Install the plugin into a freshly initialized Claude Code session:
   ```bash
   claude --plugin-dir ./plugins/opensips
   ```
2. Confirm both skills load:
   ```
   /plugin list
   ```
3. Run the prompts in `docs/testing/golden-path-demos.md` end-to-end. For each demo, record the outcome with date, model identifier, and pass / partial / fail.
4. Compute the pass rate. The release proceeds only if both conditions hold:
   - At least 80% of demos pass.
   - No demo with a Fail outcome is blocking — that is, no demo that exercises the cross-project guardrail or the version-isolation contract has regressed.
5. If both conditions hold, tag the release. Otherwise, fix the regression first; runtime regressions in skill behavior are the strongest signal that something shipped wrong.

Document the run in the release notes (date + model + per-demo outcome). The historical record is what lets future releases compare against earlier behavior.

---

## 7. What to do when CI fails

### `validate` failed

Read the error to classify the failure:

- **Schema drift** — upstream's schema changed and the mirrored copy in `scripts/schemas/` was not updated. Fix: re-mirror the schema from `opensips-docs-collector`, run `npm run schemas:hash`, commit. See `data-pipeline.md` §5.3.
- **Upstream defect** — the source JSON is malformed in a way that suggests an upstream extraction bug. Fix: file an issue on `opensips-docs-collector` with the failing JSON path. Do not edit the source file in this repo (Rule 3 in `CLAUDE.md`).
- **Local bug** — the validation pipeline itself has a bug. Fix: identify the bad code path, write a failing test, fix the code, confirm CI green.

### `build` failed (specifically the `git diff --exit-code` step)

The regenerated output is out of sync with the committed output. Fix:

```bash
npm run build
git status
git add plugins/
git commit -m "chore: regenerate output"
```

If the diff is unexpectedly large, that is itself a determinism failure — investigate before committing.

### A `test` job failed

Read the test name and assertion. Never use `--no-verify` to bypass the hook. Never re-run CI hoping the failure was transient.

- Unit test: the change broke documented behavior or the test was wrong. Decide which is correct, then fix the right one.
- Renderer test: the output shape changed. If intentional, update inline snapshots. If not, the renderer regressed.
- Golden test: see §5 for the update workflow. Do not regenerate without scrutiny.
- E2E test: the orchestrator's integration broke. Read the assertion to identify which stage.

### Determinism test failed

**Stop.** Do not regenerate fixtures. Do not retry CI. A determinism failure means the production system has a non-determinism bug; the test caught what it was designed to catch.

Use systematic debugging. Likely causes:

- Iteration over an unsorted source (Set, Map without explicit ordering, unsorted `readdir`).
- A mutated input — a renderer modifying the validated document in place rather than producing a new value.
- A hash-introducing change — a new dependency that emits a build hash, or a code path that reads from `Date.now()` or `process.hrtime`.
- Locale-dependent string comparison — `String.prototype.localeCompare` instead of explicit ordering.

Bisect: revert recent changes one at a time until the test passes again, then narrow down which specific change introduced the non-determinism. Fix the bug; do not loosen the test.

### `lint` failed

Run locally:

```bash
npm run lint
```

Most failures are formatting (run Prettier) or missing JSDoc. Never disable a rule without a written justification in the PR description; lint rules exist because they catch real classes of bug.

### `skill-md-check` failed

Two cases:

- **Unreplaced placeholder** — `<!-- MODULE_INDEX_PLACEHOLDER -->` appears in a committed SKILL.md. Fix:
  ```bash
  npm run build:skills
  git diff plugins/opensips/skills/
  git add plugins/opensips/skills/
  ```
- **Leaked sibling-project name** — a sibling-project name (Kamailio, OpenSER, SER) appears in prose where Rule 7 in `CLAUDE.md` forbids it. Fix: remove the leaked name. The only file allowed to mention sibling projects in any depth is `ser-lineage-notes.md`.

---

## 8. Coverage targets

The project uses coverage as a **floor**, not a goal.

| Layer | Floor |
|---|---|
| Foundation libraries (`scripts/lib/`) | >80% line coverage |
| Renderers (`scripts/render-module/`, `scripts/render-core/`) and index builder (`scripts/build-consolidated/`) | >85% line coverage |
| Schemas (`scripts/schemas/`) | excluded |
| Types (`scripts/types/`) | excluded |

Coverage is reported by Vitest's V8 coverage provider. The HTML report is generated at `coverage/index.html`; the LCOV report feeds Codecov.

A drop in coverage produces a comment on the PR but does not automatically block merge. Drops are a signal for review.

These are floors, not goals. A test that exists only to satisfy coverage is worse than no test — it inflates the metric without exercising real behavior. Reviewers should look at what each test PROVES, not just whether coverage went up.

Reasons to accept a coverage drop:

- The new code is a defensive guard that's hard to exercise without elaborate setup, and the guard's correctness is otherwise verifiable.
- The drop is in code being deliberately removed.

Reasons NOT to accept a coverage drop:

- "I didn't have time to write tests."
- "The behavior is obvious."
- "I'll add tests later."

If coverage genuinely doesn't make sense for a code path, document the rationale in a comment and lower the floor in this document accordingly.

---

## 9. Test stability rules

**Zero tolerance for flakiness.** A test that passes 99 times out of 100 is broken. Fix it or delete it. There is no third option.

**No `--retries`.** No "rerun CI to make it pass." A test that requires retries is not a test, it's a coin flip with extra steps. Tolerating retries conditions everyone to ignore CI failures, which lets real failures slip through.

**Determinism tests in particular must never be flaky.** If the determinism test ever passes intermittently, the production system has a non-determinism bug that just happens to hide in the lucky run. Treat any determinism flake as a release blocker until the underlying bug is identified and fixed.

**Order-independence.** Tests must not depend on each other or on global state. Each test sets up its own fixtures, uses its own tmp directory, and tears down via `afterEach`. Vitest's parallel execution is on by default; tests that depend on order will fail unpredictably under parallelization.

**Time-independence.** No test reads `Date.now()`, `process.hrtime`, or any other clock. Time-based assertions are non-deterministic by construction. If a test needs a fixed timestamp, inject one.

---

## 10. Cross-references

- **Determinism contract:** `docs/architecture/data-pipeline.md` §3 (the six mechanisms guaranteeing byte-stable output) and §8.3 (the `build-twice-and-diff` CI workflow).
- **Failure policy and exit codes:** `docs/architecture/data-pipeline.md` §4 (fail-slow within stage, fail-fast between stages; exit-code taxonomy 0–5).
- **Skill testing principles:** `docs/architecture/skill-authoring-guide.md` §2.8 (the description-iteration validation procedure) and §7.1 (every SKILL.md change tested against the golden-path demos).
- **The manual checklist:** `docs/testing/golden-path-demos.md` (the prompt suite run before each release).
- **Per-skill behavior bars:** `docs/testing/acceptance-criteria.md` (what each skill must demonstrate to be considered correct).
- **The CI workflow:** `.github/workflows/ci.yml` (implements the gates described in §3).
- **Generated-output commit policy:** `docs/architecture/data-pipeline.md` §8.1 (why both source and generated output are committed, and what the `git diff --exit-code` gate enforces).

---

*End of test strategy. Concrete prompt regression scripts live in `golden-path-demos.md`. Per-skill behavior expectations live in `acceptance-criteria.md`. The CI configuration that implements the gates in §3 lives in `.github/workflows/ci.yml`.*
