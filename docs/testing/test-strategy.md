# Test Strategy

> **Purpose:** Defines what is tested, at what level, by what mechanism, and what failing each test indicates. Reference material for contributors and maintainers — answers "how do I add a test for X?" and "why did this CI job fail?"
>
> **Audience:** Contributors writing tests, maintainers debugging CI failures, anyone trying to understand what the test suite actually proves.
>
> **Status:** Authoritative for testing decisions. Changes follow the same review process as code — substantial changes warrant an ADR.

---

## 1. The testing philosophy

The project tests at five levels, each catching a distinct class of failure:

1. **Unit tests** — verify foundation libraries and small functions in isolation. Fast (milliseconds), isolated, catch logic bugs.
2. **Renderer tests** — verify each per-element renderer produces correct Markdown for known inputs. Snapshot-based, catch formatting drift.
3. **Golden-file tests** — verify the full renderer pipeline against committed reference fixtures. Slower than unit tests but still fast (under a minute), catch regressions in end-to-end output.
4. **End-to-end pipeline tests** — verify the orchestrator runs the full pipeline against fixture data. Catch integration bugs and configuration errors.
5. **Determinism tests** — verify byte-stable output across builds. Catch the most subtle class of bug — non-deterministic output that breaks reproducibility.

Plus one form of testing that is **not automated**: the canonical prompt suite, run manually before each release. This catches runtime triggering and behavior issues that can only be observed in a real Claude Code session.

The project does not chase 100% coverage as a goal. The goal is **regression protection for the documented behavior** — every behavior specified in the architecture documents has a corresponding test. Behavior that emerges in code without being specified does not get tested; if it matters, it should be specified first.

---

## 2. What is tested at each level

### 2.1 Unit tests (`tests/unit/`)

Cover the foundation libraries under `scripts/lib/`:

| Module | What's tested | Why it matters |
|---|---|---|
| `markdown-builders.ts` | Each helper produces correct heading/list/code-fence syntax with proper trailing whitespace | The whole renderer composes through these — bugs cascade |
| `frontmatter.ts` | Provenance comment format byte-for-byte; rejection of malformed inputs | Provenance is invisible but parsed by tooling; format drift breaks consumers silently |
| `slug.ts` | Slug normalization rules; collision detection | Slug bugs produce wrong filenames; collisions silently overwrite files |
| `fs-helpers.ts` | Atomic writes; directory cleanup; POSIX path joining; JSON read with error distinction | Filesystem operations are the project's main I/O surface |
| `errors.ts` | Each error type's human and JSON serialization; correct error codes | Errors are how problems are reported; format drift breaks CI integrations |
| `discover.ts` | Version-name regex; sorted output; error handling for unreadable paths | Discovery determines which versions are processed |
| `validate.ts` | Schema validation; error formatting; fail-slow aggregation | Validation is the gate that protects everything downstream |

Coverage target: **>80% line coverage** on this layer.

Test framework: Vitest with `memfs` for filesystem operations.

Test file naming: `tests/unit/lib/<module-name>.test.ts`.

### 2.2 Renderer tests (`tests/unit/render-*/`)

Cover each per-element renderer in isolation. Each test:

1. Constructs a typed input matching the schema.
2. Calls the renderer with controlled inputs (heading level, version, etc.).
3. Asserts the output matches a small inline snapshot.

The pattern from `tests/unit/render-module/elements.test.ts`:

```typescript
it('renders a parameter with all optional fields', () => {
  const param = { /* fixture */ };
  expect(renderParameter(param, 3)).toMatchInlineSnapshot(/* ... */);
});

it('omits the default-value line when no default is specified', () => {
  const param = { /* without default */ };
  const output = renderParameter(param, 3);
  expect(output).not.toContain('*Default value');
});
```

Each renderer has at least three tests:
- Minimal input (only required fields).
- Maximal input (all optional fields populated).
- Empty-handling (verifies optional sections are omitted, not emitted as empty).

Coverage target: **>85% line coverage** on rendering code.

### 2.3 Golden-file tests (`tests/golden/`)

Cover the full renderer pipeline against committed reference fixtures. Three or four module fixtures, three or four core fixtures, one consolidated index fixture.

Each test:
1. Reads source JSON from `tests/__fixtures__/source/`.
2. Validates against the schema.
3. Renders via the production renderer.
4. Compares against the committed expected output in `tests/__fixtures__/expected/`.

When the renderer's output legitimately changes (e.g., a deliberate template improvement):
1. Run `npm run test:golden -- -u` to regenerate.
2. Review the diff in the PR carefully — every changed line must be intentional.
3. Commit the updated fixtures alongside the renderer change.

Golden-file rot is a real risk: tests pass as long as output matches fixtures, but if fixtures get regenerated without scrutiny, the tests no longer verify anything. Discipline: PRs that update fixtures must explain why output changed; large unreviewable diffs are a red flag.

### 2.4 End-to-end pipeline tests (`tests/e2e/`)

Cover the orchestrator running the full pipeline against fixture data. Tests:

- Full build against `tests/__fixtures__/source/` produces expected output structure.
- Build with `--dry-run` reports counts without writing.
- Build with `--only` flag processes only the specified version.
- Build aborts with exit code 3 on validation failure.
- Build aborts with exit code 5 on schema hash drift (test by temporarily modifying a schema in a tmpdir).
- Version isolation: building both versions does not produce cross-version paths in either output tree.

Each test runs in a temp directory created with `mkdtemp` and torn down with `afterEach`. No test touches `plugins/opensips/skills/` directly — the production tree is sacred.

### 2.5 Determinism tests (`tests/e2e/determinism.test.ts`)

The most important test in the suite. Builds the fixture corpus twice, hashes both output trees, asserts equality.

```typescript
it('produces byte-identical output across two builds', async () => {
  await runBuild({ outputRoot: tmpA, sourceRoot: 'tests/__fixtures__/source' });
  await runBuild({ outputRoot: tmpB, sourceRoot: 'tests/__fixtures__/source' });
  expect(hashTree(tmpA)).toBe(hashTree(tmpB));
});
```

If this fails, something in the pipeline is non-deterministic. Common causes: unsorted iteration, embedded timestamps, locale-dependent string comparison, hash-based naming. The test failure is loud; the fix is in the renderer or pipeline code, not the test itself.

CI runs this test on every commit. Local development can skip it (it's slower) but should run it before pushing significant changes.

---

## 3. What is NOT in CI (and why)

### 3.1 Claude's runtime triggering behavior

The plugin's most consequential behavior — does the right skill activate for the right prompt? does Claude actually read the reference files? does the cross-project guardrail engage? — is not automated.

Reasons:
- Triggering is probabilistic; assertions need to tolerate variance.
- Each test invocation costs API tokens.
- Claude's behavior changes across model versions, which would create flaky tests.

The mitigation: the canonical prompt suite (`docs/testing/golden-path-demos.md`) is run manually by the maintainer before each release. The release process document explicitly requires this step. It's not automated, but it's not optional either.

If the project later grows to justify the cost (more contributors, more frequent releases), automating runtime testing against the Claude API is a valid future enhancement. For v1, manual verification is sufficient and proportional.

### 3.2 Cross-platform testing

CI runs on Ubuntu Linux only. The build script is designed to be cross-platform (POSIX paths in output content, atomic writes that work everywhere), but Windows and macOS behavior is not actively verified.

If a contributor reports cross-platform issues, the project will add CI matrix builds at that point. Until then, the cost-benefit doesn't justify the matrix.

### 3.3 Performance tests

The pipeline is fast enough (sub-minute full build) that performance regressions don't matter at v1 scale. If the build ever exceeds 30 seconds, performance becomes worth measuring.

---

## 4. The CI gates

GitHub Actions runs five jobs on every push and pull request:

| Job | What it runs | Failing means |
|---|---|---|
| `validate` | `npm run validate` | Source JSON has structural problems; the upstream extraction project may have schema drift |
| `build` | `npm run build` then `git diff --exit-code` | Either the build is broken, or generated output wasn't committed (the "forgot to rebuild" PR) |
| `test` | `npm run test:coverage` | A unit, renderer, golden-file, or E2E test failed |
| `determinism` | Build twice, compare hashes | The pipeline introduced non-deterministic output somewhere |
| `lint` | `npm run lint` | Code style, JSDoc rules, or TypeScript strict-mode violations |

Plus one additional check:

| Job | What it runs | Failing means |
|---|---|---|
| `skill-md-check` | Greps for placeholder markers in committed SKILL.md files | The build script's placeholder-replacement step failed silently |

Validate is the fastest job; the others run in parallel after it succeeds. Total CI time should stay under 5 minutes for v1; if it exceeds 10 minutes, the iteration loop suffers and the test suite needs review.

---

## 5. Local development workflow

### Day-to-day iteration

```bash
npm run test:watch
```

Vitest in watch mode reruns affected tests on every save. Fast feedback for unit and renderer changes. Don't run the full test suite on every save — the watch mode handles incremental.

### Before pushing

```bash
npm run validate    # Schema check
npm run lint        # Style check
npm test            # Full test suite
```

These three together take under a minute. Run them before pushing to catch issues that CI would catch anyway, but faster.

### Before significant changes (renderer changes, schema updates, ADR-driven changes)

```bash
npm run test:coverage  # Verify coverage hasn't dropped
npm run test:e2e       # Run the slower E2E tests
npm run build          # Full build, verify against committed output
```

These take a few minutes total. Worth running for changes that touch the rendering pipeline or the build orchestrator.

### When updating golden files intentionally

```bash
npm run test:golden -- -u
git diff tests/__fixtures__/expected/  # Review the diff
git add tests/__fixtures__/expected/
git commit -m "test: update golden fixtures for {reason}"
```

The `-u` flag regenerates fixtures. Always review the diff before committing — that's the discipline that prevents golden-file rot.

### Before a release

Manual run-through of `docs/testing/golden-path-demos.md` against a freshly installed plugin. Document outcomes. Investigate any regressions before tagging.

---

## 6. Adding a new test

### Adding a unit test

```bash
# Create the test file mirroring the source file's location
touch tests/unit/lib/<module-name>.test.ts
```

Structure:

```typescript
import { describe, it, expect } from 'vitest';
import { thingUnderTest } from '../../../scripts/lib/<module-name>';

describe('thingUnderTest', () => {
  it('does X correctly when given Y', () => {
    expect(thingUnderTest(input)).toBe(expected);
  });

  // ... more cases
});
```

Run `npm run test:watch tests/unit/lib/<module-name>` to iterate.

### Adding a renderer test

Same shape as unit tests but in `tests/unit/render-module/` or `tests/unit/render-core/`. Use `toMatchInlineSnapshot()` rather than `toBe(...)` for output comparison — the snapshots are more readable when they fail.

### Adding a golden-file fixture

Three steps:

1. Add a representative source file to `tests/__fixtures__/source/3.6/{core,modules}/<name>.json`.
2. Run the renderer manually to produce the expected output: `npm run build:fixture -- <name>` (a development helper script, if implemented).
3. Commit both the source and expected files; the existing golden-file test infrastructure picks them up automatically.

When choosing fixtures, prefer:
- Modules with diverse content (parameters AND functions AND PVs, not just one of each).
- Edge cases the unit tests don't naturally cover (e.g., a module with empty `exported_events` to verify section omission).
- Real upstream content, not synthetic.

### Adding an E2E test

In `tests/e2e/`, create a test that orchestrates the full pipeline against fixture data:

```typescript
describe('new behavior', () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = mkdtempSync(/* ... */); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('does Z when fixtures are X', async () => {
    const result = await runBuild({ sourceRoot: 'tests/__fixtures__/source', outputRoot: tmpDir });
    // assertions
  });
});
```

E2E tests are slower, so use them only for behavior that genuinely requires the full pipeline. Prefer unit tests where possible.

---

## 7. When tests fail

### "A unit test fails after my change"

Either the change broke documented behavior (fix the change) or the test was wrong (fix the test). Don't update the test to match the new behavior without thinking about which is correct.

### "A golden-file test fails"

Compare the diff. If the change is intentional, regenerate fixtures with `-u`, review carefully, commit. If the change is unintentional, the renderer has a bug.

### "The determinism test fails"

Something in the pipeline introduced non-determinism. Common causes:
- Iteration over an unsorted source (Set, Map without explicit ordering).
- An embedded timestamp.
- A locale-dependent operation.
- A platform-dependent path operation.

Bisect: revert recent changes one at a time until the test passes again, then narrow down which specific change introduced the non-determinism.

### "The build job's `git diff --exit-code` fails"

Generated output isn't in sync with source. Either:
- A renderer change wasn't accompanied by a regenerated output commit (run `npm run build` and commit the diff).
- A source change wasn't accompanied by a build (same fix).
- The build is producing different output now than when output was last committed (which is itself a determinism failure — see above).

### "The lint job fails"

Run `npm run lint` locally to see specifics. Most lint failures are formatting (run Prettier) or missing JSDoc (add the documentation per ADR-004).

### "CI is flaky"

A flaky test — passes 99 times, fails once — must be fixed or removed. Tolerating flakiness conditions everyone to ignore CI failures, which lets real failures slip through. If a test is genuinely intermittent (e.g., relies on filesystem timing), refactor or remove it.

---

## 8. Coverage expectations

The project uses coverage as a **floor**, not a target.

| Layer | Target floor | Current |
|---|---|---|
| Foundation libraries (`scripts/lib/`) | >80% | (filled in by CI) |
| Renderers | >85% | (filled in by CI) |
| Orchestrator and CLI | >70% | (filled in by CI) |
| Schemas (`scripts/schemas/`) | excluded | n/a |
| Types (`scripts/types/`) | excluded | n/a |

Coverage is tracked via Codecov on each CI run. A drop in coverage produces a comment on the PR, but doesn't block merge by default — drops are a signal for review, not an automatic failure.

Reasons to ignore a coverage drop:
- The new code is a defensive guard that's hard to exercise in tests without elaborate setup, and the guard's correctness is otherwise verifiable.
- The drop is in code being deliberately removed (e.g., deprecated paths).

Reasons NOT to ignore a coverage drop:
- "I didn't have time to write tests."
- "The behavior is obvious."
- "I'll add tests later."

If coverage genuinely doesn't make sense for a particular code path, document the rationale in a comment and lower the target floor in this document accordingly.

---

## 9. Testing philosophy: the long-run view

The test suite at v1 is calibrated for the project's current scale — a single maintainer, infrequent contributors, infrequent releases. As the project grows, the testing strategy will need to evolve:

- **More contributors** → tighter test coverage standards, mandatory test additions for behavior changes.
- **More frequent releases** → automated runtime testing against the Claude API replaces the manual prompt suite.
- **Multi-platform contributors** → CI matrix builds on Linux, macOS, Windows.
- **Larger fixture corpus** → faster CI parallelization, perhaps splitting tests by category.

These are explicitly v2+ concerns, not v1 pre-release work. The test strategy is right-sized for now.

The risk to monitor: tests that pass perfectly but verify nothing useful. A test suite at 95% coverage with weak assertions is worse than 80% coverage with strong assertions. Code review on test PRs should look at what each test actually proves, not just whether coverage went up.

---

*End of test strategy. Concrete prompt regression scripts live in `golden-path-demos.md`. Per-skill behavior expectations live in `acceptance-criteria.md`. The CI configuration that implements the gates in §4 lives in `.github/workflows/ci.yml`.*
