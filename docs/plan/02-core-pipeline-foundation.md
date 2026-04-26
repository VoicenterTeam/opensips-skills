<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Milestone 2: Core pipeline foundation

## Goal

Build the orchestrator, the file I/O helpers, the error infrastructure, and the CLI surface. At the end of this milestone, `npm run build --dry-run` runs end-to-end: it discovers versions, validates source files, and reports what it *would* render — without producing any actual rendered output. The pipeline is structurally complete; the renderers from milestones 3–5 plug into it without touching orchestration code.

## Why this is sequenced here

The orchestrator and its supporting infrastructure are dependencies of both renderers (milestones 3 and 4) and the index builder (milestone 5). Building them once means each subsequent milestone focuses on its own logic instead of redoing pipeline plumbing. The dry-run mode is the verification mechanism — it proves the orchestrator works without requiring renderers to exist yet.

This milestone also establishes the CLI conventions that contributors will live with for the project's lifetime. Getting them wrong here means breaking changes later; getting them right means new flags slot in cleanly.

## Tasks

### Task 2.1: Add CLI and file I/O dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "commander": "^12.x",
    "write-file-atomic": "^5.x",
    "json-stringify-deterministic": "^1.x"
  },
  "devDependencies": {
    "memfs": "^4.x",
    "@types/write-file-atomic": "^4.x"
  }
}
```

Run `npm install` to update the lockfile.

Acceptance: `npm install` succeeds. `npx tsc --noEmit` passes.

### Task 2.2: Implement the error infrastructure

Create `scripts/lib/errors.ts` exporting a small set of structured error types:

- `BuildError` — base class with `code: number` (matching the exit code taxonomy in `data-pipeline.md` §4) and `details: object`.
- `ValidationError extends BuildError` — code 3, includes `file`, `path`, `expected`, `received` fields.
- `IOError extends BuildError` — code 4, includes `operation` and `path`.
- `SchemaDriftError extends BuildError` — code 5, includes `expected` and `computed` hashes.
- `UsageError extends BuildError` — code 2, includes `flag` and `message`.
- `formatError(error: BuildError): string` — produces the canonical `path:line:col: error: msg` form so GitHub Actions' built-in problem matchers annotate PRs automatically.

The errors are throwable but also serializable to JSON (for the `--json` output mode in Task 2.6). Each error type has a `toJSON()` method.

Acceptance: Unit tests verify each error type produces both a human-readable string (via `formatError`) and a structured JSON object (via `toJSON`).

### Task 2.3: Implement file I/O helpers

Create `scripts/lib/fs-helpers.ts` exporting:

- `atomicWriteFile(path: string, content: string): Promise<void>` — wraps `write-file-atomic` with consistent error handling. Throws `IOError` on failure.
- `cleanDirectory(path: string): Promise<void>` — removes all files and subdirectories under `path`, but not the directory itself. Used by the `clean` script and before full builds.
- `ensureDirectory(path: string): Promise<void>` — `mkdir -p` semantics, no-op if directory exists.
- `readJsonFile<T>(path: string): Promise<T>` — reads, parses, returns. Throws `IOError` on read failure or JSON parse failure (with a clear distinction in the error message).
- `posixPath(...segments: string[]): string` — wraps `path.posix.join`, used for any path that goes into Markdown output (per `data-pipeline.md` §3).

Each function has JSDoc per ADR-004 explaining what it does, what it throws, and any platform-specific behavior.

Acceptance: Unit tests using `memfs` verify (a) atomic writes don't leave partial files on simulated I/O failure, (b) `cleanDirectory` removes contents but preserves the directory, (c) `posixPath` produces forward-slash output even on simulated Windows-style inputs.

### Task 2.4: Implement the environment normalization

Create `scripts/lib/environment.ts` exporting:

- `normalizeEnvironment(): void` — sets `process.env.LANG = "C"`, `process.env.LC_ALL = "C"`, `process.env.TZ = "UTC"`. Called at the start of `main()` in the orchestrator.

This is small but load-bearing. Per `data-pipeline.md` §3, deterministic builds require normalized locale and timezone. If a developer's shell has `LANG=ja_JP.UTF-8`, string ordering can differ; if `TZ=America/New_York`, any accidentally-included timestamp differs from a UTC-built file.

Add a test that asserts the function modifies `process.env` correctly. (The function has no return value; the assertion is on side effects.)

Acceptance: Calling `normalizeEnvironment()` sets the three environment variables. Subsequent operations in the same process see the normalized values.

### Task 2.5: Implement the orchestrator skeleton

Replace the stub `scripts/build-references.ts` from milestone 1 with the full orchestrator:

```typescript
async function main(opts: CliOptions): Promise<number> {
  normalizeEnvironment();

  // Stage 0: schema hash check
  const hashResult = verifySchemaHash();
  if (!hashResult.ok) {
    throw new SchemaDriftError(hashResult.expected, hashResult.computed);
  }

  // Stage 1: discover
  const versions = opts.only
    ? [opts.only]
    : discoverVersions(opts.sourceRoot);

  let exitCode = 0;
  const results: VersionResult[] = [];

  for (const version of versions) {
    try {
      const result = await processVersion(version, opts);
      results.push(result);
    } catch (err) {
      if (err instanceof BuildError) {
        printError(err, opts);
        exitCode = err.code;
        if (opts.failFast) break;
      } else {
        throw err;
      }
    }
  }

  printSummary(results, opts);
  return exitCode;
}
```

`processVersion` delegates to validation, then (if validation passed) renderers, then the index builder. For this milestone, it stops at validation — the renderer and index calls are stubs that just log "would render N modules / would build index" without doing anything.

The orchestrator is a pure orchestrator: it knows about versions, stages, and error handling, but contains no rendering or index-building logic. That logic lives in the modules called from `processVersion`.

Acceptance: The orchestrator file is under 200 lines. Stage logic is delegated, not inlined. JSDoc on `main` and `processVersion` explains the orchestration contract.

### Task 2.6: Implement the CLI surface

Use Commander to parse CLI arguments:

```
Usage: build-references [options]

Options:
  -V, --version                  Print build script version
  -h, --help                     Show this help
  --only <version>               Build only the specified version (e.g., 3.6)
  --only-module <slug>           With --only, build only one module plus its index
  --dry-run                      Validate and report what would be written; do not write
  --fail-fast                    Stop at the first validation error (default: collect all)
  --verbose                      Emit per-file progress to stderr
  --quiet                        Suppress non-error output
  --json                         Emit machine-readable JSON summary to stdout
  --source-root <path>           Override default source root (default: ./source)
  --output-root <path>           Override default output root (default: ./plugins/opensips/skills)
```

Commander parses; the resulting `opts` object is the typed `CliOptions` interface. Conflicting flags (e.g., `--quiet` and `--verbose` together) produce a `UsageError` with exit code 2.

Wire three npm scripts:

- `npm run build` — full build, `node dist/build-references.js`.
- `npm run validate` — same as before but now goes through the unified entry point with an internal `validateOnly: true` flag.
- `npm run clean` — runs `cleanDirectory` on the output root.

Acceptance: All flags work as documented. `npm run build --dry-run` runs end-to-end without writing files. `npm run build --only 3.6 --dry-run --json` produces parseable JSON on stdout. `npm run build --quiet --verbose` exits 2 with a usage error.

### Task 2.7: Implement summary output and error reporting

Two output modes need clean implementations:

**Human-readable summary** (default, or `--verbose`):

```
opensips-skills build-references 0.1.0

Discovering versions in ./source...
Found 1 version: 3.6

Processing version 3.6...
  Validating 12 core files... OK
  Validating 3 module files... OK
  Would render 3 module files (dry-run)
  Would render 12 core files (dry-run)
  Would build consolidated index (dry-run)

Summary:
  Versions: 1 succeeded, 0 failed
  Total files validated: 15
  Total files would-render: 15
  Mode: dry-run (no files written)

Exit code: 0
```

**JSON output** (`--json`):

```json
{
  "buildScriptVersion": "0.1.0",
  "mode": "dry-run",
  "versions": [
    {
      "version": "3.6",
      "ok": true,
      "filesValidated": 15,
      "filesRendered": 0,
      "errors": []
    }
  ],
  "summary": {
    "versionsSucceeded": 1,
    "versionsFailed": 0,
    "exitCode": 0
  }
}
```

JSON output goes to stdout; progress and errors go to stderr. This is mandatory — a CI system running `npm run build --json > result.json` must get clean JSON.

Acceptance: The two output modes are mutually exclusive (`--json` suppresses human output). Both modes are tested with at least one passing and one failing scenario.

### Task 2.8: Verify the dry-run end-to-end

With the small slice of real source data committed in milestone 1 (`source/3.6/` with three to five module files and one or two core files), run the full dry-run:

```bash
npm run build -- --dry-run --verbose
```

The expected output names every source file by path, reports validation passing, reports the would-render counts, and exits 0. If anything in the pipeline regresses since milestone 1 — discovery, validation, error formatting — this is where it surfaces.

Run the failing-scenario verification too: temporarily corrupt one source file, re-run, confirm exit code 3 and a structured error pointing at the corrupt file. Restore the file before committing.

Acceptance: `npm run build -- --dry-run --verbose` produces the expected human output and exit 0 on the existing source slice. `npm run build -- --dry-run --json` produces parseable JSON. A simulated validation failure produces exit code 3 with a clear error path.

## Acceptance criteria

The milestone is done when all of the following are true:

- The orchestrator (`scripts/build-references.ts`) exists, is under 200 lines, and contains no rendering or index logic.
- The error infrastructure (`scripts/lib/errors.ts`) defines five structured error types with both human and JSON serialization.
- The file I/O helpers (`scripts/lib/fs-helpers.ts`) provide atomic writes, directory cleaning, JSON reading, and POSIX path joining.
- The environment normalization (`scripts/lib/environment.ts`) sets locale and timezone before any other work.
- The CLI surface implements all flags from the data-pipeline spec, including dry-run and JSON modes.
- `npm run build --dry-run` runs end-to-end on the existing source slice with exit code 0.
- A simulated validation failure produces exit code 3 with a structured error.
- A schema hash mismatch produces exit code 5 (verified by temporarily editing a schema file and reverting).
- Unit tests for errors, fs-helpers, and CLI parsing pass.
- All exported functions have JSDoc per ADR-004; ESLint passes with no warnings.

When all of these are true, milestone 2 is complete and milestones 3 and 4 can begin (potentially in parallel).

## Risks and watch-outs

**The orchestrator becoming a dumping ground.** It's tempting to put "just one more thing" into `main()` — an extra summary, a one-off validation, a quick file copy. Resist. The orchestrator stays under 200 lines for a reason: it's the part of the pipeline contributors revisit most, and bloat here makes it unmaintainable. Anything that's not orchestration goes into a dedicated module under `scripts/lib/`.

**JSON output drift.** The JSON summary structure becomes a contract the moment any tool consumes it (CI dashboards, status pages, future plugin marketplaces). Once shipped, breaking changes require a `schemaVersion` bump on the JSON output itself. Lock the structure here, document it, and don't change it casually.

**stderr vs. stdout discipline.** Mixing progress output with structured output breaks `--json` mode for any consumer piping stdout. Every `console.log` call is a place to ask: "is this human progress (stderr) or machine result (stdout)?" Use `console.error` for the former and a dedicated print function for the latter. ESLint can be configured to ban bare `console.log` to enforce this.

**Atomic write failures on Windows-style filesystems.** `write-file-atomic` requires the rename target to be on the same filesystem as the temp file. On CI runners with mounted volumes, this can silently degrade to copy+unlink and lose atomicity. Document this in the `fs-helpers.ts` JSDoc, and add a CI sanity check that the output and source roots are on the same filesystem.

**`memfs` behavioral drift from real `fs`.** Tests using `memfs` should also have at least one integration test that runs against the real filesystem, in case `memfs` diverges from real Node `fs` behavior. The integration test can be slow and run only in CI; the `memfs` tests stay fast for local iteration.

**CLI flag collisions later.** Once flags like `--only` and `--fail-fast` ship, removing or renaming them is a breaking change. Pick the names carefully now and resist the urge to add flags every time a new use case appears. Most flags can be replaced with environment variables or sane defaults.

**Time pressure to skip the JSON output mode.** Implementing `--json` doubles the work of summary output. The temptation is to ship without it and "add it later." Don't. The JSON mode is what makes the build script CI-friendly and tooling-friendly; retrofitting it later means refactoring every output point.

## Parallelization notes

Tasks 2.1 (dependencies), 2.2 (errors), 2.3 (fs-helpers), and 2.4 (environment) are nearly independent and can be done in any order or in parallel. Task 2.5 (orchestrator) depends on 2.2, 2.3, and 2.4. Task 2.6 (CLI) depends on 2.5. Tasks 2.7 (output) and 2.8 (verification) close out the milestone.

For two-person work, one person handles 2.1–2.4 (the infrastructure modules) while the other plans 2.5–2.6 (the orchestrator and CLI). They meet at 2.5.

For solo work, the natural pairing is 2.2+2.3 together (error types and fs-helpers are closely linked), then 2.4 (environment), then 2.5 (orchestrator), then 2.6 (CLI), then 2.7 (output), then 2.8 (verification).

## Cross-references

- Pipeline stages: `docs/architecture/data-pipeline.md` §2.
- Determinism mechanisms: `docs/architecture/data-pipeline.md` §3.
- Failure policy and exit codes: `docs/architecture/data-pipeline.md` §4.
- CLI specification: `docs/architecture/data-pipeline.md` §6.3.
- Build stack rationale: `docs/architecture/adr/004-node-typescript-build-stack.md`.

---

*Next milestone: `03-per-module-rendering.md`.*
