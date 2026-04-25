# Data Pipeline Specification

> **Purpose:** Detailed contract between the upstream extraction project (`opensips-docs-collector`) and this plugin. Specifies what goes in, what comes out, how failures are handled, what guarantees the pipeline makes, and how it is verified.
>
> **Audience:** Developers implementing or modifying the build pipeline. Assumes familiarity with ADR-002 (JSON source of truth), ADR-003 (version isolation), ADR-004 (Node/TypeScript stack), and ADR-006 (consolidated.json index).
>
> **Status:** Authoritative specification. Changes require an ADR.

---

## 1. Contract overview

The pipeline transforms per-version JSON documentation into three kinds of artifact: per-module Markdown reference files, aggregated core Markdown reference files, and a consolidated JSON search index. Every transformation is deterministic, version-isolated, and reversible to its inputs — given the same `source/` tree, the build produces byte-identical output every time, on every platform, in every timezone.

```
INPUT                                OUTPUT
─────────────────────────           ───────────────────────────────────
source/                             plugins/opensips/skills/
├── 3.5/                              └── opensips-config/references/
│   ├── core/                             ├── 3.5/
│   │   ├── async.json                    │   ├── cfg-format.md    (hand-authored)
│   │   ├── events.json                   │   ├── ser-lineage-notes.md (hand-authored)
│   │   ├── flags.json                    │   ├── modules-index.md (generated)
│   │   ├── functions.json                │   ├── consolidated.json (generated)
│   │   ├── mi_commands.json              │   ├── core/*.md        (generated)
│   │   ├── operators.json                │   └── modules/*.md     (generated)
│   │   ├── parameters.json               └── 3.6/
│   │   ├── routes.json                       ├── cfg-format.md    (hand-authored)
│   │   ├── statements.json                   ├── ser-lineage-notes.md (hand-authored)
│   │   ├── statistics.json                   ├── modules-index.md (generated)
│   │   ├── transformations.json              ├── consolidated.json (generated)
│   │   └── variables.json                    ├── core/*.md        (generated)
│   └── modules/                              ├── modules/*.md     (generated)
│       ├── tm.json                           └── guides/*.md      (generated)
│       ├── dispatcher.json
│       └── ... (one per module)
└── 3.6/
    └── (same structure)
```

The pipeline has five stages in strict order: **discover, validate, render per-module, render core, build index**. Stages run per version; a failure in version 3.5 does not prevent version 3.6 from building. Within a version, stages run sequentially — validation must complete before any rendering, and both rendering stages must complete before index building.

---

## 2. Stage specifications

### 2.1 Stage 1: Discover

**Input:** The `source/` directory root.

**Output:** A list of versions and, for each version, a list of source files categorized as `core` or `module`.

**Behavior:**
- Scan `source/*/` non-recursively for version directories. Each subdirectory name must match `^\d+\.\d+$` (e.g. `3.5`, `3.6`). Directories not matching this pattern are logged at INFO level and skipped.
- For each version, scan `source/{version}/core/*.json` and `source/{version}/modules/*.json`. Sort file lists lexicographically by filename. Sorting is mandatory — OS-native `readdir()` order is not guaranteed and is the most common source of non-determinism in documentation pipelines.
- If a version directory exists but `core/` or `modules/` is empty or missing, log at WARN level and proceed. An empty version is not fatal; it produces an empty output tree for that version.

**Error conditions:**
- `source/` missing → exit code 4 (I/O failure).
- A version directory name matches the pattern but is not a directory (e.g. someone created `source/3.6` as a file) → exit code 4.

### 2.2 Stage 2: Validate

**Input:** The file list from Stage 1 for a single version.

**Output:** A validated, typed in-memory representation of all source documents for that version, or a structured list of validation errors.

**Behavior:**
- For each source file, read UTF-8 content, parse as JSON, validate against the appropriate Zod schema from `scripts/schemas/`.
- The schema is chosen by document type: module files use `ModuleDocumentSchema`; core files use the schema matching the filename (`variables.json` → `CoreVariableDocumentSchema`, `operators.json` → `OperatorDocumentSchema`, etc.).
- Schema selection is deterministic — filename maps to schema via a lookup table, never inferred from content.
- The `schemaVersion` field (if present in the document) must fall within the range the build script supports. If outside range, emit a specific error naming the supported range.
- Validation errors from all files are collected across the entire version. The build does not stop at the first error — it reports all errors and exits non-zero after the stage completes. This is "fail-slow within a pass" (see §4).

**Error format:**

Every validation error has the shape:
```
{version}/{category}/{filename}:{json-path}: expected {type}, got {type}
```

Concrete example:
```
3.6/modules/tm.json:exported_parameters[7].type: expected "string", got undefined
```

This format is recognized by GitHub Actions' built-in TypeScript problem matcher, which annotates pull requests automatically.

**Schema drift detection:**

Before any source file is validated, the build compares a hash of the compiled Zod schemas in `scripts/schemas/` against a committed hash in `scripts/schemas/.schema-hash`. If the hashes differ, the build fails with exit code 5 (schema mismatch) and a message pointing the developer at the hash-regeneration workflow. This catches the case where a schema was edited locally but the hash was not updated — a strong signal that the source JSON may no longer match the consumer's expectations.

**Error conditions:**
- JSON parse error → validation error for that file; build continues validating remaining files.
- Zod validation failure → validation error(s) for that file; build continues.
- Schema hash mismatch → exit code 5, build halts immediately (this failure invalidates all downstream output).
- Unreadable file (permission, I/O error) → validation error for that file; build continues.

### 2.3 Stage 3: Render per-module

**Input:** Validated `ModuleDocument[]` for a single version.

**Output:** One Markdown file per module, written to `plugins/opensips/skills/opensips-config/references/{version}/modules/{slug}.md`.

**Behavior:**
- Slug generation: lowercase the `module_name` field, replace any non-alphanumeric character (other than `_` and `-`) with `-`, collapse consecutive dashes. Example: `uac_auth` → `uac_auth`, `Mi-HTTP` → `mi-http`. Slugs must be unique within a version; collisions are fatal (exit code 3). Rationale: case-insensitive filesystems (macOS default, Windows) cannot distinguish `WebSocket.md` from `websocket.md`, so lowercase normalization is mandatory for cross-platform correctness.
- Render each `ModuleDocument` via the module template (documented separately in `docs/architecture/rendering-templates.md`).
- Each rendered file begins with YAML frontmatter containing `name`, `description`, `version`, and `slug` fields. The description is a concise statement of what the module does, derived from the `overview` field in the source JSON — this drives agent skill discoverability.
- Empty sections are omitted, not emitted. A module with no `exported_events` produces no `## Exported Events` heading at all. Empty headings followed by whitespace are a negative signal to both humans and LLMs.
- Files are written atomically using `write-file-atomic` — the build writes to a temp file, fsyncs, and renames onto the target. A Ctrl-C mid-build leaves either the previous version of the file or no file, never a partial one.
- Output paths use POSIX separators internally even on Windows; write operations themselves use platform-native `fs` calls.
- Each composer's final pass strips a small fixed set of upstream extraction artifacts (`U+FFFD` replacement chars, `U+200B` zero-width spaces, over-escaped `\_` underscores) via `scripts/lib/sanitize.ts`. The pass runs after blank-line collapse and before the trailing-newline fix. The function is pure, deterministic, and idempotent. Source JSON under `data/` is untouched — only the rendered output is cleaned. The same helper feeds the description-extraction paths in stages 4 and 5 so descriptions stay consistent across the rendered files, the `consolidated.json` index, and the `SKILL.md` module-index table. Rationale, threshold for adding rules, and removal path: ADR-010.

**Ordering guarantees:**
- Within the output directory, files are written in slug-alphabetical order. While the user-visible filesystem listing depends on the OS, writing in a consistent order minimizes apparent non-determinism during dev-time "build twice and diff" checks.
- Within each rendered file, sub-sections (parameters, functions, pseudo-variables, etc.) are rendered in alphabetical order by name, regardless of source-JSON ordering. The extraction pipeline does not guarantee stable ordering; the build imposes its own.

**Error conditions:**
- Slug collision → exit code 3 (validation failure), message identifying the two colliding source files.
- I/O failure writing output → exit code 4.
- A required field is missing (caught by Zod in stage 2, but if stage 2 is bypassed) → exit code 3.

### 2.4 Stage 4: Render core

**Input:** Validated `CoreVariableDocument`, `OperatorDocument`, `RouteDocument`, etc. for a single version.

**Output:** Twelve Markdown files, one per core document type, written to `plugins/opensips/skills/opensips-config/references/{version}/core/{name}.md`.

**Behavior:**
- This is the "aggregated" rendering mode. A single `CoreVariableDocument` contains many variables; the entire document renders to one `variables.md` file with each variable as an H2 section.
- File naming maps directly from source filename: `variables.json` → `variables.md`, `mi_commands.json` → `mi-commands.md` (underscore normalized to hyphen in output filenames for consistency with the rest of the Markdown convention).
- Each aggregated file begins with YAML frontmatter (`name`, `description`, `version`, `doc_type`) and an H1 title. Within the body, items are rendered as H2 sections in alphabetical order by name.
- Atomic writes, empty-section omission, and alphabetical ordering all apply, identical to Stage 3.

**Hand-authored files in the references tree:**
- `cfg-format.md` — Not generated. Hand-authored. Lives at `plugins/opensips/skills/opensips-config/references/{version}/cfg-format.md`. Teaches the opensips.cfg file structure, section ordering, route block taxonomy, and authoring workflow.
- `ser-lineage-notes.md` — Not generated. Hand-authored. Lives at `plugins/opensips/skills/opensips-config/references/{version}/ser-lineage-notes.md`.
- The build pipeline does not touch either file. Both are included in the skill tree but fall outside the pipeline's generation contract.

**Error conditions:**
- Same as Stage 3.

### 2.5 Stage 5: Build consolidated index

**Input:** All validated documents for a single version, plus the paths of files written in Stages 3 and 4.

**Output:** `plugins/opensips/skills/opensips-config/references/{version}/consolidated.json`.

**Behavior:**
- Construct the four runtime-lookup indexes specified in ADR-006: `functionsByName`, `parametersByModule`, `variablesByName`, `miCommandsByName`.
- Each index entry carries `{source, path, description}` — source is `"core"` or `"module:{name}"`, path is the reference file relative to the plugin root, description is a short string enabling lookup-without-read for the security advisor.
- Include a `statistics` block with totals per document type (total modules, total functions across all modules, total core variables, etc.). These totals serve as a canary: if a future build produces dramatically fewer items than the last committed version, something is wrong upstream, and a CI check flags the regression.
- Include a `relationships` block derived from module `dependencies_required` / `dependencies_optional` fields — module name → array of dependency module names.
- Include a top-level `schema_version` field matching the `ConsolidatedDocument` schema version.
- Serialize with `json-stringify-deterministic` (sorted keys, stable formatting). Pretty-print with 2-space indentation. The file's SHA-256 must be stable across runs given identical input.
- Write atomically.

**Error conditions:**
- I/O failure → exit code 4.
- Index invariant violation (e.g., a function references a module path that wasn't generated) → exit code 3.

### 2.6 Stage 6: Render modules-index

**Input:** All validated `ModuleDocument[]` for a single version, plus the consolidated index from Stage 5.

**Output:** `plugins/opensips/skills/opensips-config/references/{version}/modules-index.md`.

**Behavior:**
- Generates a standalone Markdown file containing the full module catalog table (module name, one-line purpose, reference file path) and lookup-discipline prose ("When a module is not in the index", "Lookup discipline", etc.).
- Replaces the former inline module-index table that lived in `opensips-modules/SKILL.md` (prior to ADR-012). Moving this content out of SKILL.md keeps the SKILL.md body focused on workflow procedures rather than a large static catalog.
- Atomic write. Same determinism guarantees as Stages 3–5.

**Error conditions:**
- I/O failure → exit code 4.

---

## 3. Determinism requirements

The pipeline's single most important property is determinism: identical input produces byte-identical output. This enables golden-file testing, meaningful `git diff` on regenerated content, and confidence that the version a user installs matches what was reviewed.

The pipeline guarantees determinism through six mechanisms:

**No timestamps in output.** No `generated_at`, no `build_time`, no copyright year. Timestamps are the single most common source of non-determinism in documentation pipelines and offer nothing to the reader or the agent consuming the files. If a timestamp is ever genuinely needed in output (e.g., for a `last_updated` field the agent queries), it must be sourced from `SOURCE_DATE_EPOCH` (a Unix timestamp passed as an environment variable), never from `Date.now()`.

**Sorted iteration everywhere.** File lists are sorted lexicographically before processing. Within each rendered file, item arrays (parameters, functions, PVs) are sorted alphabetically by name. JSON object keys in `consolidated.json` are sorted via `json-stringify-deterministic`. The build treats unsorted iteration as a bug, not an optimization.

**Environment normalization.** The build runs under `LANG=C`, `LC_ALL=C`, `TZ=UTC`. These are set by the `npm run build` script itself, not left to the developer's shell. This eliminates locale-dependent string comparison and timezone-dependent date formatting.

**POSIX paths in output.** Any path written into the content of a file — frontmatter references, Markdown links, cross-references — uses forward slashes via `path.posix.join()`. Platform-native `path.join()` is used only for actual filesystem operations (reading source, writing output).

**Pinned Node and dependency versions.** The `package.json` pins Node via `"engines": { "node": "..." }` to the current LTS. `package-lock.json` is committed. CI uses `npm ci`, not `npm install`.

**Stable filename normalization.** Slugs are lowercase and kebab-cased so the output is identical on case-sensitive (Linux) and case-insensitive (macOS default, Windows) filesystems.

### Verification

Determinism is verified in CI by the `build-twice-and-diff` job, which runs the build, captures the output tree's hash, cleans, builds again, and asserts the hash is unchanged:

```bash
npm ci
npm run build
find plugins -type f | sort | xargs sha256sum > /tmp/build1.hashes
npm run clean
npm run build
find plugins -type f | sort | xargs sha256sum > /tmp/build2.hashes
diff /tmp/build1.hashes /tmp/build2.hashes || exit 1
```

A failure of this job is a release blocker. If the build is not reproducible, the tests (which rely on golden-file comparison) are not meaningful.

---

## 4. Failure policy

The pipeline uses **fail-slow within a single stage, fail-fast between stages**. Within validation, all files are checked before the build exits; a malformed `tm.json` and a malformed `dialog.json` produce two errors in one run, not two sequential build-fix-rebuild cycles. But if validation fails, no rendering occurs — rendering only runs on a fully validated document set.

The rationale: a partially-built reference is worse than no build at all. An agent that loads half a skill's documentation will confidently answer questions using incomplete knowledge, which is precisely the hallucination this project is meant to prevent. Better to fail cleanly and keep the last known-good output than to ship broken references alongside working ones.

### Failure taxonomy

| Failure class | Detection | Exit code | Build continues? |
|---|---|---|---|
| Malformed JSON in one file | Stage 2 | 3 | Yes, within Stage 2 |
| Schema validation error in one file | Stage 2 | 3 | Yes, within Stage 2 |
| Schema hash mismatch | Stage 2 preamble | 5 | No, halt immediately |
| Slug collision | Stage 3 | 3 | No |
| I/O error (read or write) | Any stage | 4 | No |
| Index invariant violation | Stage 5 | 3 | No |
| Usage error (bad CLI flags) | Before Stage 1 | 2 | No |
| Missing source directory | Stage 1 | 4 | No |

Exit code 0 is reserved for total success. Exit code 1 is reserved for unexpected internal errors (assertion failures, unhandled exceptions) — if you see 1, the build script itself has a bug.

### Partial-success modes

The build supports two partial-success modes, both opt-in:

- **`--only <version>`** — build only the specified version. Other versions are skipped. Useful during iteration on a single version's extraction output.
- **`--only-module <module>`** — within a version (which must be specified with `--only`), build only the specified module plus the consolidated index. Useful for rapid iteration on one module's rendering.

Neither mode is used in CI. CI always runs a full build.

### Error output

Errors emitted during Stage 2 validation follow this format:

```
ERROR: 3.6/modules/tm.json:exported_parameters[7].type: expected "string", got undefined
ERROR: 3.6/modules/dialog.json:exported_functions[3].signature: expected string, got null
ERROR: 3.6/core/variables.json:variables[42].readable: expected boolean, got "yes"
SUMMARY: 3 validation errors in 3 files (version 3.6)
```

The format is: `ERROR:` prefix (so a simple `grep ERROR:` on build output finds all problems), file path relative to `source/`, colon, JSON path to the offending field, colon, expected/received descriptor. This is parseable by GitHub Actions' built-in problem matchers.

Errors from other stages follow similar conventions but with stage-appropriate location information.

---

## 5. Interface contracts

### 5.1 Upstream contract: what the extraction project must produce

The extraction project is treated as a black box that produces JSON conforming to the published Zod schemas. The pipeline makes no assumptions about how that JSON was produced (LLM extraction, hand-authoring, migration from another format), only that the output conforms.

Concretely, the extraction project commits to:

1. **Schema conformance.** Every JSON file in `data/processed/{version}/` validates against the corresponding Zod schema in its own `src/schemas/` directory. If the extraction project changes a schema, it must bump the `schemaVersion` field in produced documents and coordinate with this project to update the mirrored schemas in `scripts/schemas/`.
2. **Stable structure within a version.** Once a version's extraction output is considered released, its document shapes do not change retroactively. Adding fields is allowed (backward-compatible); renaming or removing fields requires a new version tag or a `schemaVersion` bump.
3. **Complete coverage or explicit gaps.** If a module is extracted, all required sections are populated (per the section schemas documented in the extraction project). Partial extraction — e.g., a module with parameters but no functions — is treated as valid only if the source upstream documentation is itself sparse. Gaps must be representable in the schema (null, empty array), not inferred from the absence of fields.
4. **No cross-version references.** A document in `3.6/` does not reference paths in `3.5/`. Version isolation (ADR-003) is preserved end-to-end.

### 5.2 Downstream contract: what this pipeline guarantees to consumers

The pipeline commits to the consumers of its output (Claude skills reading the Markdown, the security advisor reading the index):

1. **Byte-stable output given byte-stable input.** Same source JSON → same Markdown and index, across runs, platforms, and timezones. Enforced by the build-twice-and-diff CI job.
2. **Consistent file layout.** Output paths are predictable: modules at `opensips-config/references/{version}/modules/{slug}.md`, core at `opensips-config/references/{version}/core/{name}.md`, index at `opensips-config/references/{version}/consolidated.json`. The skill's SKILL.md files can hardcode these paths with confidence.
3. **Schema-validated Markdown structure.** Every generated Markdown file conforms to the template specified in `docs/architecture/rendering-templates.md`. Consumers can rely on section order and heading hierarchy.
4. **Complete-or-absent.** If a build succeeds (exit 0), every input document became at least one output artifact. If a build fails, the previous successful output is not touched — consumers either see the last known-good tree or nothing, never a mixture.
5. **Atomic file writes.** A build interrupted partway through leaves each individual file either fully written or untouched. Readers never see half-written files.

### 5.3 Schema mirroring contract

The Zod schemas in `scripts/schemas/` are copies of the extraction project's schemas, not imports. This keeps the two projects decoupled at the package level (see ADR-004).

The mirroring workflow:

1. Extraction project updates a schema. Its own tests pass.
2. A maintainer of this project copies the updated schema file into `scripts/schemas/`.
3. The maintainer runs `npm run schemas:hash` (to be implemented) which recomputes the hash of the schema set and writes `scripts/schemas/.schema-hash`.
4. The maintainer commits the schema change, the hash change, and the regenerated output all in one PR.
5. CI compares the hash against the committed value; if they match, build proceeds; if they differ, build fails with a clear error directing the contributor to the mirroring workflow.

This flow is enforced by a CI check. A contributor who edits a schema file but forgets to update the hash sees a failing CI run with a message naming the exact file and the command to run.

---

## 6. Build script architecture

### 6.1 Entry point

`scripts/build-references.ts` is the single entry point. It is a pure orchestrator — it delegates all rendering to stage-specific modules and contains no rendering logic itself.

Responsibilities of the orchestrator:
- Parse CLI arguments (Commander-based).
- Set environment (`LANG=C`, `LC_ALL=C`, `TZ=UTC`) before any work.
- Discover versions and source files (Stage 1).
- Dispatch to validation, rendering, and index-building for each version.
- Aggregate errors and decide whether to proceed.
- Emit summary output.
- Exit with the appropriate code.

### 6.2 Module boundaries

```
scripts/
├── build-references.ts        # Orchestrator (no rendering logic)
├── render-module.ts           # Stage 3: per-module renderer
├── render-core.ts             # Stage 4: per-core-type renderer
├── build-consolidated.ts      # Stage 5: index builder
├── schemas/                   # Mirrored Zod schemas + hash
│   ├── base.ts
│   ├── module.ts
│   ├── core-variables.ts
│   ├── ... (one per doc type)
│   └── .schema-hash
├── lib/
│   ├── discover.ts            # Stage 1
│   ├── validate.ts            # Stage 2
│   ├── frontmatter.ts         # YAML frontmatter generator
│   ├── markdown-builders.ts   # renderSection(), renderTable(), etc.
│   ├── fs-helpers.ts          # Atomic write, path normalization
│   └── errors.ts              # Structured error types and formatters
└── types/
    └── render-context.ts
```

Rule: `render-module.ts` does not import from `render-core.ts` and vice versa. Both import from `lib/`. The orchestrator imports from every stage module but none imports from it. Cycles are structurally prevented.

### 6.3 CLI interface

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

Exit codes:
  0   Success
  1   Internal error (build script bug)
  2   Usage error (bad flags)
  3   Validation failure (bad source data)
  4   I/O failure (file system, permissions)
  5   Schema drift (mirrored schema doesn't match hash)
```

Progress output goes to stderr; machine-readable summaries go to stdout. A CI system running `npm run build --silent` can pipe stdout to a JSON parser without interference from progress chatter.

### 6.4 Testing strategy

Each stage is independently testable with `memfs` providing an in-memory filesystem:

- **Discover tests** construct a virtual `source/` tree and verify the returned version and file lists are correctly sorted.
- **Validate tests** feed known-good and known-bad JSON into the validator and assert the exact error messages emitted for malformed inputs.
- **Render tests** pass validated document objects directly to the renderers and compare output against golden files stored in `tests/__fixtures__/`.
- **Index tests** construct document objects programmatically and assert the index has the expected entries, counts, and ordering.
- **End-to-end tests** run the full pipeline against `tests/__fixtures__/source/` and compare the entire output tree against `tests/__fixtures__/expected/`.

Golden files are committed and reviewed. A PR that legitimately changes rendering also updates the golden files; reviewers inspect both the code change and the golden file change to confirm the rendering change is intentional and scoped.

---

## 7. Output structure specification

### 7.1 Per-module file structure

Each generated `{slug}.md` contains, in order:

1. YAML frontmatter with `name`, `description`, `version`, `slug`, optionally `category`.
2. Single H1 heading matching the module name.
3. Optional H2 sections in fixed order: `## Overview`, `## How It Works`, `## Dependencies`, `## Exported Parameters`, `## Exported Functions`, `## Exported Pseudo-Variables`, `## Exported Statistics`, `## Exported MI Functions`, `## Exported Events`, `## Configuration Examples`.
4. Sections whose source data is absent or empty are omitted entirely. No `## Exported Events\n\n(none)` — if there are no events, the heading is not emitted.

Full section-by-section rendering rules are specified in `docs/architecture/rendering-templates.md`.

### 7.2 Per-core-type file structure

Each generated core file contains, in order:

1. YAML frontmatter with `name`, `description`, `version`, `doc_type`.
2. Single H1 heading matching the document category ("Core Variables", "Operators", "Transformations", etc.).
3. Optional brief introductory paragraph from the source JSON's `synopsis` field.
4. H2 sections — one per item in the source JSON's array — in alphabetical order by name.

### 7.3 Consolidated index structure

```json
{
  "schema_version": 1,
  "version": "3.6",
  "generator": "opensips-skills build-references",
  "statistics": {
    "totalModules": 92,
    "totalFunctions": 1147,
    "totalParameters": 2034,
    "totalPseudoVariables": 245,
    "totalMICommands": 89
  },
  "indexes": {
    "functionsByName": {
      "t_relay": { "source": "module:tm", "path": "references/3.6/modules/tm.md", "description": "..." },
      "xlog": { "source": "core", "path": "references/3.6/core/functions.md", "description": "..." }
    },
    "parametersByModule": {
      "tm": ["fr_timer", "fr_inv_timer", ...],
      "dialog": ["default_timeout", "dlg_match_mode", ...]
    },
    "variablesByName": { ... },
    "miCommandsByName": { ... }
  },
  "relationships": {
    "moduleDependencies": {
      "auth_db": ["auth", "sl"],
      "mid_registrar": ["tm", "usrloc"]
    }
  }
}
```

All keys within any object are alphabetically sorted. All arrays (dependency lists, parameter lists) are alphabetically sorted.

---

## 8. Operational concerns

### 8.1 Commit policy for generated output

Both `source/` (mirrored input) and the generated output trees under `plugins/opensips/skills/*/references/` are committed to git. This is per ADR-002.

The standard argument against committing generated files (they pollute `git blame`, block contributor PRs, produce noisy diffs) is acknowledged but overridden by the operational reality of Claude Code plugin distribution: end users install the plugin via a marketplace clone, and there is no install-time build step. The generated files must exist in the cloned repo for the plugin to work.

Mitigations for the noisy-diff concern:
- Per-module golden-file tests mean each PR's generated-file diff is small and scoped.
- The `build-twice-and-diff` CI job guarantees regeneration is deterministic, so the diff in a PR reflects real content changes, not rebuild artifacts.
- A `git attributes` entry could mark generated paths as `linguist-generated=true` to collapse them in GitHub PR views.

### 8.2 Running the build locally

```bash
npm ci                        # Install pinned dependencies
npm run validate              # Stage 2 only (fast check before full build)
npm run build                 # Full pipeline for all versions
npm run build -- --only 3.6   # Single version
npm run clean                 # Remove all generated output
```

A fresh clone followed by `npm ci && npm run build` must produce output byte-identical to what is committed. If it doesn't, the build is broken or the committed output is stale.

### 8.3 CI workflow

Three sequential jobs:

1. **validate** — runs `npm run validate`, fails on any schema error. Fast (sub-minute).
2. **build** — runs `npm run build`, then `git diff --exit-code` against committed output. Fails if regeneration produces different content than what's checked in (catches "forgot to commit rebuild" PRs).
3. **reproduce** — runs `npm run build`, hashes output, cleans, rebuilds, compares hashes. Fails on any determinism violation.

All three jobs must pass before merge. The `validate` job's speed enables a rapid feedback loop during iteration; the `build` and `reproduce` jobs catch deeper regressions.

### 8.4 Adding a new version

When a new OpenSIPs version enters the support matrix:

1. Extraction project produces `data/processed/{new-version}/` with all required files.
2. Maintainer of this project copies that directory into `source/{new-version}/`.
3. Maintainer runs `npm run build -- --only {new-version}` to verify the version builds clean.
4. Maintainer runs a full `npm run build` to regenerate everything.
5. Maintainer opens a PR including the new source, the new generated output, and any hand-authored files (`ser-lineage-notes.md` for the new version).
6. CI validates all three jobs pass.

No code changes are required for a new version — the discover stage finds it automatically. This is the payoff for folder-per-version isolation.

### 8.5 Removing a version

When an OpenSIPs version leaves the support matrix:

1. Delete `source/{old-version}/`.
2. Delete `plugins/opensips/skills/*/references/{old-version}/`.
3. Commit both deletions in one PR.

The build ignores the absence. No code changes are needed.

---

## 9. Known limitations and accepted trade-offs

**The mirrored-schemas model has an inherent drift window.** When the extraction project updates a schema, there is a period between the upstream change and the downstream mirror update where the two projects are out of sync. The schema hash check catches this at build time, but it does not prevent the window from existing. For production-critical use, the extraction project should tag releases and this project should pin to specific tags, not track `main`.

**Slug collisions are fatal.** If the extraction project ever produces two modules whose names collide under the slug normalization rules (lowercase, non-alphanumeric to dash), the build fails. This is intentional — silently overwriting one file with another would be worse — but it means adding a module with an unfortunate name requires either renaming upstream or extending the slug rules. The current ruleset has not produced collisions in the existing corpus.

**Empty-section omission can hide legitimate gaps.** If the extraction project incorrectly produces an empty `exported_functions` array for a module that actually has functions, the rendered file will show no functions section, and Claude will not know to look elsewhere. This is a real risk mitigated only by extraction-project validation, not by this pipeline. The statistical canaries in the consolidated index provide a weak backstop: if a version's `totalFunctions` drops by 30%, something is clearly wrong.

**The build is not incremental.** A change to one module's source JSON triggers a full rebuild. This is fast enough (the full corpus builds in under a minute) that incremental building would add complexity without meaningful benefit. The `--only-module` flag serves the dev-time iteration case without needing true incremental logic.

---

*End of specification. Changes to this document require an ADR. Implementation-level details (exact function signatures, error message wordings, CLI flag short forms) are defined in code with JSDoc comments per ADR-004, not here — this document describes the contract, not the implementation.*
