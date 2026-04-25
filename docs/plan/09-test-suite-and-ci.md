# Milestone 9: Test suite and CI

## Goal

Build the automated test suite and continuous integration that protect the project against regression. At the end of this milestone, every commit and pull request runs through an automated pipeline that validates schema integrity, builds the project, verifies determinism, runs unit tests, runs golden-file tests, and runs the canonical prompt set from milestone 8 — failing the build if anything regresses.

This is the milestone that turns the project from "works today" into "stays working tomorrow." Without it, every change risks silently breaking some part of the pipeline or the plugin's runtime behavior, and the bug surfaces only when a user reports a problem.

## Why this is sequenced here

Tests written before the system works test nothing useful. Milestone 8 verified the system works empirically; this milestone codifies that verification. The golden-path demos derived from milestone 8's prompts become the canonical regression suite — if a future change breaks any of them, CI fails before merge.

This milestone is also the latest reasonable point to add tests. Milestone 10 (public release) requires a stable, defensible testing story — contributors cloning the repo expect to see a passing CI badge, a documented test workflow, and confidence that the project is maintained. Releasing without tests means every external contribution is a leap of faith.

## Tasks

### Task 9.1: Add test infrastructure

Vitest is already installed (milestone 1). Configure it for the project's needs.

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['scripts/**/*.ts'],
      exclude: ['scripts/schemas/**', 'scripts/types/**'],
    },
    globals: false,
    environment: 'node',
  },
});
```

Add npm scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:golden": "vitest run tests/golden",
    "test:e2e": "vitest run tests/e2e"
  }
}
```

Create the test directory structure:

```
tests/
├── __fixtures__/
│   ├── source/
│   │   └── 3.6/
│   │       ├── core/
│   │       └── modules/
│   └── expected/
│       └── 3.6/
│           ├── core/
│           └── modules/
├── unit/
│   ├── lib/
│   ├── render-module/
│   ├── render-core/
│   └── build-consolidated/
├── golden/
│   ├── module-rendering.test.ts
│   ├── core-rendering.test.ts
│   └── consolidated-index.test.ts
└── e2e/
    ├── full-pipeline.test.ts
    └── version-isolation.test.ts
```

Acceptance: `npm test` runs against an empty test set and exits 0. The directory structure exists.

### Task 9.2: Write unit tests for foundation libraries

For each module under `scripts/lib/`, write unit tests covering the documented behavior:

**`scripts/lib/markdown-builders.ts`:**
- `renderH1`, `renderH2`, `renderH3`, `renderH4` produce the correct heading syntax with one trailing blank line.
- `renderSection` returns empty string for empty body, otherwise `## ${heading}\n\n${body}\n\n`.
- `renderBulletList` returns empty string for empty array, otherwise correct bullet syntax.
- `renderPropertyList` produces ` - **{key}:** {value}` lines.
- `renderCodeBlock` correctly handles tagged and untagged fences.
- `renderTOC` produces correct anchor links.

**`scripts/lib/frontmatter.ts`:**
- `renderProvenance` produces the canonical HTML comment format byte-for-byte.
- Inputs containing newlines or `-->` are rejected with a clear error.

**`scripts/lib/slug.ts`:**
- The documented slug examples (`uac_auth`, `Mi-HTTP`, `b2b__entities`) produce expected output.
- `assertUniqueSlugs` throws on collision with both colliding names in the message.

**`scripts/lib/fs-helpers.ts`:**
- `atomicWriteFile` uses `write-file-atomic` correctly and propagates errors as `IOError`.
- `cleanDirectory` removes contents but preserves the directory.
- `posixPath` produces forward-slash output regardless of platform input.
- `readJsonFile` distinguishes between read errors and parse errors in its error messages.

**`scripts/lib/errors.ts`:**
- Each error type produces correct human-readable strings via `formatError`.
- Each error type's `toJSON()` produces the documented structure.
- Error codes match the exit-code taxonomy.

**`scripts/lib/discover.ts`:**
- `discoverVersions` matches `^\d+\.\d+$` and sorts results alphabetically.
- `discoverSourceFiles` returns sorted file lists.
- Both throw structured errors for unreadable paths.

**`scripts/lib/validate.ts`:**
- A valid document produces `{ ok: true, document }`.
- A malformed JSON file produces one error.
- A schema-failing document produces correctly-formatted errors with field paths.
- Multiple bad files produce one error per file (fail-slow within the stage).

Use `memfs` for filesystem tests so they run fast and don't touch the real disk. Each test file should be small (one module under test, maybe 10–30 test cases).

Acceptance: `npm run test:coverage` reports >80% line coverage on the foundation libraries. All tests pass.

### Task 9.3: Write unit tests for the renderers

For each per-element renderer in `scripts/render-module/elements.ts`, write a test that:

1. Constructs a minimal valid input matching the schema.
2. Constructs a maximal input with all optional fields populated.
3. Asserts the output for each is correct using inline snapshots (`toMatchInlineSnapshot()`).
4. Tests the empty-handling: an input where the optional fields are absent produces output without those sections.

Example test for `renderParameter`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderParameter } from '../../scripts/render-module/elements';

describe('renderParameter', () => {
  it('renders a minimal parameter with only required fields', () => {
    const param = {
      name: 'fr_timeout',
      type: 'integer',
      description: 'Timeout for non-INVITE transactions.',
    };
    expect(renderParameter(param, 3)).toMatchInlineSnapshot(`
      "### \`fr_timeout\` (integer)

      Timeout for non-INVITE transactions.

      "
    `);
  });

  it('renders a maximal parameter with all optional fields', () => {
    // ... fixture with default, possible_values, valid_range, notes, examples
    expect(renderParameter(param, 3)).toMatchInlineSnapshot(/* ... */);
  });

  it('omits the default-value line when no default is specified', () => {
    // ...
  });
});
```

Apply the same pattern to all eight per-element renderers.

For the module renderer (`scripts/render-module/index.ts`), test that:

- Sections appear in the canonical order.
- Empty sections are omitted entirely.
- The TOC reflects only present sections.
- The provenance comment is correctly formatted.
- Output is deterministic (calling twice with the same input produces identical results).

For the core renderer (`scripts/render-core/index.ts`), test the same patterns for aggregated rendering, including the dispatch table covering all twelve doc types.

For the consolidated index builder (`scripts/build-consolidated/index.ts`), test that:

- Statistics counters are correct.
- Function-name collisions produce a warning and one entry.
- The relationships block correctly reflects `dependencies_required`.
- Empty source produces zero-valued statistics.

Acceptance: `npm run test:coverage` reports >85% line coverage on rendering and index-building code. All tests pass.

### Task 9.4: Build the golden-file test fixtures

Golden-file tests verify that a known input produces a known output, byte-for-byte. They're the regression net for the renderers — any future change that produces different output requires explicit acknowledgment by updating the golden file.

Create `tests/__fixtures__/source/3.6/` with a curated subset of real source data:

- Three module files representing different complexity levels:
  - `tm.json` — large, complex module (many parameters, functions, PVs).
  - `acc.json` — medium-complexity module.
  - `sl.json` — small, simple module.
- Three core files:
  - `variables.json` — many items.
  - `operators.json` — items with unusual heading content.
  - `flags.json` — different shape (multiple flag types, each with sub-elements).

Run the renderer against this fixture set and capture the output to `tests/__fixtures__/expected/3.6/`. This is the "golden" output; future test runs compare against it.

Create `tests/golden/module-rendering.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { renderModule } from '../../scripts/render-module';
import { ModuleDocumentSchema } from '../../scripts/schemas/module';

const FIXTURES = ['tm', 'acc', 'sl'];

describe('module rendering golden files', () => {
  for (const slug of FIXTURES) {
    it(`renders ${slug}.json identically to expected/${slug}.md`, async () => {
      const source = JSON.parse(await readFile(`tests/__fixtures__/source/3.6/modules/${slug}.json`, 'utf-8'));
      const validated = ModuleDocumentSchema.parse(source);
      const expected = await readFile(`tests/__fixtures__/expected/3.6/modules/${slug}.md`, 'utf-8');
      const actual = renderModule(validated, '3.6', '0.1.0');
      expect(actual).toBe(expected);
    });
  }
});
```

Same pattern for core rendering and consolidated index.

When a legitimate change requires updating the golden files, run `npm run test:golden -- -u` (Vitest's update flag) and review the diff to confirm the change is intentional and scoped. Commit the updated fixtures alongside the code change.

Acceptance: Golden-file tests pass. The fixtures are committed. The update workflow is documented in the test file's leading comment.

### Task 9.5: Build the end-to-end pipeline tests

End-to-end tests run the full pipeline against a fixture set and verify the output. Different from golden-file tests in that they exercise the orchestrator, not just individual renderers.

Create `tests/e2e/full-pipeline.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { runBuild } from '../../scripts/build-references';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('full pipeline E2E', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'opensips-skills-e2e-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('builds the fixture corpus end to end with exit code 0', async () => {
    const result = await runBuild({
      sourceRoot: 'tests/__fixtures__/source',
      outputRoot: tmpDir,
      dryRun: false,
    });
    expect(result.exitCode).toBe(0);
    expect(result.errors).toEqual([]);
  });

  it('produces module references at the expected paths', async () => {
    await runBuild({ sourceRoot: 'tests/__fixtures__/source', outputRoot: tmpDir });
    const modulePath = join(tmpDir, 'opensips-modules/references/3.6/modules/tm.md');
    await expect(readFile(modulePath, 'utf-8')).resolves.toContain('# tm Module Reference');
  });

  it('produces core references at the expected paths', async () => {
    // ...
  });

  it('produces a consolidated.json index with non-zero statistics', async () => {
    // ...
  });

  it('exits non-zero on a malformed source file', async () => {
    // Use a fixture with intentionally bad JSON
  });

  it('exits with code 5 on schema hash drift', async () => {
    // Modify a schema file in a temp copy, run build, verify exit code
  });
});
```

Create `tests/e2e/version-isolation.test.ts` covering the isolation checks from milestone 6:

- Generated content in version A does not reference version B paths.
- Each version's consolidated.json contains only its own version's paths.

Acceptance: E2E tests pass. They exercise the orchestrator with multiple scenarios.

### Task 9.6: Build the determinism test

Per `data-pipeline.md` §3, determinism is a load-bearing property and is verified by build-twice-and-diff. Codify this as an automated test:

Create `tests/e2e/determinism.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function hashTree(root: string): string {
  const hash = createHash('sha256');
  const walk = (dir: string) => {
    const entries = readdirSync(dir).sort();
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else {
        hash.update(entry);
        hash.update(readFileSync(fullPath));
      }
    }
  };
  walk(root);
  return hash.digest('hex');
}

describe('determinism', () => {
  it('produces byte-identical output across two builds', async () => {
    const tmpA = mkdtempSync(/* ... */);
    const tmpB = mkdtempSync(/* ... */);
    
    await runBuild({ sourceRoot: 'tests/__fixtures__/source', outputRoot: tmpA });
    await runBuild({ sourceRoot: 'tests/__fixtures__/source', outputRoot: tmpB });
    
    expect(hashTree(tmpA)).toBe(hashTree(tmpB));
  });
});
```

This test is slow (runs the full build twice) but it's the most important guarantee in the project. Run it on every CI build, even if local development skips it.

Acceptance: The determinism test passes consistently. Running it in a loop ten times produces ten passes.

### Task 9.7: Build the canonical-prompt regression suite

The golden-path demos derived from milestone 8 testing need to be codified as a runnable test suite. This is harder than other test types because it exercises Claude's runtime behavior, not just pure functions.

Two options:

**Option A: Document the prompts as a checklist, run manually before each release.** Simpler, lower-fidelity. The prompts live in `docs/testing/golden-path-demos.md` and a maintainer runs them before publishing. CI does not run these tests.

**Option B: Run the prompts against the Claude API in CI.** Higher-fidelity but more complex — requires API keys, costs money per run, and the responses are non-deterministic so assertions need to be flexible.

For v1, **Option A is sufficient**. The golden-path demos document is the regression script; the maintainer verifies it manually as part of the release workflow. Option B can be added later when the project's scale justifies the cost.

Create `docs/testing/golden-path-demos.md` (this is the milestone-9 deliverable for prompt regression). The file's structure is specified in milestone-10's release prep, but its content is authored here.

Each demo entry has:

- **Prompt** — the user input verbatim.
- **Expected skills triggered** — which of the three should activate.
- **Expected reads** — which reference files should be read.
- **Expected output properties** — what the response should contain (e.g., "names the correct return codes from tm.md", "engages the cross-project guardrail when Kamailio syntax is used").
- **Acceptance** — how to determine the demo passed (qualitative, since responses are non-deterministic).

Populate with the prompts validated in milestone 8 — at minimum:

- The five should-trigger prompts from Task 8.2.
- The four should-not-trigger prompts.
- The three reference-loading prompts from Task 8.3.
- The three version-aware prompts from Task 8.4.
- The multi-skill prompt from Task 8.5.

Total: ~15 demos. Each is a paragraph; the document is ~10–15 pages.

Acceptance: The demos document is committed. It contains at least 15 prompt entries with all the required fields. A maintainer can pick up the document, install the plugin, and run the demos in approximately 30 minutes.

### Task 9.8: Configure CI

Set up GitHub Actions to run on every push and pull request. Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  LANG: C
  LC_ALL: C
  TZ: UTC

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run validate

  build:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Verify generated output is committed
        run: git diff --exit-code

  test:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  determinism:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: |
          find plugins -type f | sort | xargs sha256sum > /tmp/build1.hashes
          npm run clean
          npm run build
          find plugins -type f | sort | xargs sha256sum > /tmp/build2.hashes
          diff /tmp/build1.hashes /tmp/build2.hashes

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
```

Five jobs, each running fast (most under a minute):

1. **validate** — schema validation on all source files. Fast.
2. **build** — full build, then `git diff --exit-code` to catch "forgot to commit regenerated output."
3. **test** — unit and golden-file tests with coverage reporting.
4. **determinism** — build-twice-and-diff.
5. **lint** — ESLint and Prettier checks.

The `validate` job gates the others — if validation fails, no point running the rest. The build, test, determinism, and lint jobs run in parallel where dependencies allow.

Add a status badge to the README (placeholder for now; finalized in milestone 10):

```markdown
![CI](https://github.com/<org>/opensips-skills/workflows/CI/badge.svg)
```

Acceptance: CI runs on every push and pull request. All five jobs pass on the current commit. A test PR (e.g., a typo in a SKILL.md) fails CI as expected.

### Task 9.9: Add a CI check for SKILL.md placeholders

Per the risk noted in milestone 7: if the module-index build step's placeholder replacement fails silently, the SKILL.md ships with a literal `<!-- MODULE_INDEX_PLACEHOLDER -->` comment.

Add a CI check that fails if any placeholder marker appears in committed SKILL.md files:

```yaml
  skill-md-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for unreplaced placeholders in SKILL.md files
        run: |
          if grep -r "<!-- MODULE_INDEX_PLACEHOLDER -->" plugins/opensips/skills/; then
            echo "ERROR: SKILL.md contains an unreplaced placeholder."
            echo "Run: npm run build:skills && commit the updated SKILL.md"
            exit 1
          fi
```

Add similar checks for other documented placeholders if any exist.

Acceptance: The CI check is in place. It catches placeholder leaks before they ship.

### Task 9.10: Document the testing workflow

Create `docs/testing/test-strategy.md` (the file is in the documentation set; this milestone fills it in).

The document covers:

- **What is tested at each level** — unit (foundation libraries), integration (renderers and orchestrator), end-to-end (full pipeline), determinism (build-twice-and-diff), runtime behavior (golden-path demos run manually).
- **What isn't tested and why** — Claude's actual triggering behavior is not in CI because of the cost and non-determinism (but it is verified manually before release per the golden-path demos).
- **The CI gates** — five jobs, what each proves, what failing each one means.
- **The local development workflow** — `npm test` for fast feedback, `npm run test:watch` for iteration, `npm run test:coverage` before pushing, `npm run test:e2e` for thorough checks.
- **The golden-file update workflow** — when output legitimately changes, run `npm run test:golden -- -u`, review diff, commit.
- **The release-time workflow** — run the golden-path demos manually, document the outcome, only then publish.

The document is reference material, not narrative. Contributors who want to know "how do I add a test for X?" find their answer here.

Acceptance: `docs/testing/test-strategy.md` is committed. It covers all the topics above.

## Acceptance criteria

The milestone is done when all of the following are true:

- Vitest is configured with appropriate scripts and coverage reporting.
- Unit tests exist for all foundation libraries (`scripts/lib/*`) with >80% line coverage.
- Unit tests exist for renderers and the index builder with >85% coverage.
- Golden-file fixtures exist for at least three modules and three core types, with passing golden-file tests.
- End-to-end tests exercise the orchestrator on the fixture corpus.
- The determinism test passes consistently (verified across multiple runs).
- The golden-path demos document is authored with at least 15 entries.
- GitHub Actions CI is configured with five jobs (validate, build, test, determinism, lint) plus the SKILL.md placeholder check.
- The test strategy document is authored.
- All tests pass; CI is green on the current commit.

When all of these are true, milestone 9 is complete. The project has automated regression protection, manual runtime verification documented, and CI that gates every change. Milestone 10 (public release prep) can begin.

## Risks and watch-outs

**Coverage as a metric versus coverage as a goal.** Setting coverage thresholds (>80%, >85%) can produce a perverse incentive — writing tests to satisfy the threshold rather than tests that exercise real behavior. The threshold is a floor, not a target. A 90%-covered codebase with weak assertions is worse than an 80%-covered codebase with strong assertions. Code review on test PRs should look at what each test actually proves, not just whether coverage went up.

**Golden-file rot.** Golden-file tests pass as long as the renderer's output matches the fixture. If a developer regenerates fixtures without scrutiny, tests "pass" but no longer verify anything. Discipline: every golden-file update PR must explain *why* the output changed, and the diff must be small enough for a reviewer to confirm the change is intentional. Large unreviewable diffs (e.g., regenerating all 100 module fixtures) are a red flag.

**The non-determinism that hides in CI.** Most determinism bugs are caught by the build-twice-and-diff check, but some can hide. For example: if a build relies on iteration order of a `Set` (which has insertion order in JavaScript but the insertion order may itself be non-deterministic), two builds in the same CI run might produce identical output but two builds across CI runs might differ. Include cross-run verification by hashing output and posting the hash to the workflow output, so anomalies are visible across multiple commits.

**E2E tests touching the real filesystem in CI.** GitHub Actions runners use containers; filesystem operations are isolated per job. But test isolation between *tests* within the same job depends on `mkdtemp` working correctly. If a test forgets to clean up its tmpDir, subsequent tests might see stale files. Use Vitest's `beforeEach`/`afterEach` for tmp directory lifecycle, and verify cleanup in the test setup file.

**The 80% / 85% coverage targets being unachievable on certain code paths.** Some code (defensive error handlers, fallback branches) is hard to exercise in tests without elaborate setups. If coverage is genuinely 75% and reaching 80% would require unhelpful tests, lower the threshold rather than write fake tests. Document the rationale in `test-strategy.md`.

**The golden-path demos document growing stale.** As the plugin evolves, prompts that worked at v1 may not work the same way at v2. Update the document as part of every release. Add a "last verified" date at the top of each demo entry.

**CI time creeping up.** As fixtures grow and tests multiply, CI time increases. If CI takes more than 10 minutes total, contributors stop running tests locally and rely on CI alone — which makes the iteration loop painful. Monitor CI duration; refactor or parallelize when it crosses 5 minutes.

**Codecov or coverage tooling drift.** The codecov action depends on a third-party service. If the service has an outage, CI fails for reasons unrelated to the project. Either accept the brittleness and document it, or remove the codecov dependency and self-host coverage reporting via the HTML output. For v1, accepting the brittleness is fine.

**Test flakiness.** Tests that pass 99 times and fail once introduce false signals. If a test is flaky, fix or remove it — never tolerate "just rerun CI." A flaky test in CI conditions everyone to ignore failures, which lets real failures slip through.

**The "we should test that" trap.** During testing work, it's tempting to add tests for everything imaginable. Resist scope creep. The point of this milestone is regression protection for the documented behavior. Tests for behavior that hasn't been designed yet (e.g., "what if a future version of OpenSIPs adds a new doc type?") are not part of v1. Add them when the behavior exists.

## Parallelization notes

Tasks 9.1 (test infrastructure), 9.4 (golden fixtures), and 9.7 (golden-path demos) are largely independent. Tasks 9.2 (foundation tests) and 9.3 (renderer tests) can be done in parallel after 9.1. Task 9.5 (E2E tests) depends on 9.4. Task 9.6 (determinism test) depends on 9.5. Task 9.8 (CI configuration) depends on 9.2, 9.3, 9.5, and 9.6 all having tests to run. Task 9.9 (SKILL.md placeholder check) is small and can be done at any point. Task 9.10 (documentation) is the closing action.

For two-person work, one person handles 9.2–9.3 (unit tests) while the other handles 9.4–9.5 (golden and E2E). They meet at 9.8.

For solo work, the natural flow is 9.1 → 9.4 → 9.2 → 9.3 → 9.5 → 9.6 → 9.7 → 9.9 → 9.8 → 9.10.

## Cross-references

- Test strategy overall: `docs/testing/test-strategy.md` (this milestone's deliverable).
- Determinism requirements: `docs/architecture/data-pipeline.md` §3.
- Build verification (build-twice-and-diff): `docs/architecture/data-pipeline.md` §3.
- Failure policy: `docs/architecture/data-pipeline.md` §4.
- Generated-output commit policy: `docs/architecture/data-pipeline.md` §8.1.
- CI workflow: `docs/architecture/data-pipeline.md` §8.3.
- Skill authoring testing: `docs/architecture/skill-authoring-guide.md` §2.8.

---

*Next milestone: `10-public-release-prep.md`.*
