# Milestone 5: Consolidated index

## Goal

Implement the consolidated JSON index builder. At the end of this milestone, `npm run build` produces `consolidated.json` per version at `plugins/opensips/skills/opensips-modules/references/{version}/consolidated.json`. The index contains four lookup tables (`functionsByName`, `parametersByModule`, `variablesByName`, `miCommandsByName`), a statistics block, and a relationships block — all derived deterministically from the validated source documents.

The index is what makes `module_search.py` (a separate concern, not in this milestone) possible. It's also the data interface between the modules skill and the security advisor skill (per the integration contract in ADR-005).

## Why this is sequenced here

The index can only be built after both renderers complete because it references the *paths* of the rendered files. Building it before milestone 4 would either require placeholder paths (and a second pass to fix them) or require the index to walk the filesystem (which couples the index to the renderer's output format and makes it fragile).

The index is the easiest piece of the pipeline. It's pure flat data transformation from already-validated, already-typed documents. No rendering decisions, no Markdown formatting, no length thresholds — just walk the documents, build the maps, write the JSON. Doing it last means it benefits from all the foundation work in milestones 0–4.

This is also a natural place to verify the full single-version pipeline before milestone 6 generalizes it to multiple versions.

## Tasks

### Task 5.1: Define the index types

Create `scripts/types/consolidated.ts` with TypeScript interfaces matching the structure specified in `data-pipeline.md` §7.3:

```typescript
interface ConsolidatedIndex {
  schema_version: number;
  version: string;
  generator: string;
  statistics: IndexStatistics;
  indexes: {
    functionsByName: Record<string, IndexEntry>;
    parametersByModule: Record<string, string[]>;
    variablesByName: Record<string, IndexEntry>;
    miCommandsByName: Record<string, IndexEntry>;
  };
  relationships: {
    moduleDependencies: Record<string, string[]>;
  };
}

interface IndexEntry {
  source: string;            // "core" or "module:tm"
  path: string;              // "references/3.6/modules/tm.md"
  description: string;       // First sentence from source
}

interface IndexStatistics {
  totalModules: number;
  totalFunctions: number;
  totalParameters: number;
  totalPseudoVariables: number;
  totalMICommands: number;
  totalEvents: number;
  totalStatistics: number;
}
```

These types mirror the `ConsolidatedDocument` schema mirrored in milestone 1, but expressed as TypeScript interfaces for the build-time code that produces the index. Keep them in sync with the Zod schema; if the Zod schema changes upstream and gets re-mirrored, this type also updates.

Acceptance: TypeScript compiles. Type usage in subsequent tasks resolves correctly.

### Task 5.2: Implement the index builder

Create `scripts/build-consolidated/index.ts` exporting:

- `buildConsolidatedIndex(version: string, documents: ValidatedDocuments, generatorVersion: string): ConsolidatedIndex` — pure function from validated documents to the index structure.

The function:

1. Initializes statistics counters at zero.
2. Walks every module document and:
   - Adds an entry to `parametersByModule[moduleName]` for each exported parameter (sorted alphabetically by parameter name).
   - Adds an entry to `functionsByName[fnName]` for each exported function with `source: "module:${moduleName}"`.
   - Adds an entry to `variablesByName[$pvName]` for each exported pseudo-variable.
   - Adds an entry to `miCommandsByName[cmdName]` for each exported MI function.
   - Records `moduleDependencies[moduleName]` from the module's `dependencies_required` field (sorted alphabetically).
   - Increments the appropriate statistic counter for each item added.
3. Walks the core documents and:
   - Adds entries to `functionsByName` for core functions with `source: "core"`.
   - Adds entries to `variablesByName` for core pseudo-variables.
   - Adds entries to `miCommandsByName` for core MI commands.
4. Builds the final structure with `schema_version: 1`, the version string, the generator version, the populated indexes, statistics, and relationships.

Pure function: no I/O, no side effects, no globals. Given the same input, returns identical output.

For collisions (the same function name exported by two modules), the function logs a warning to stderr and keeps the first encountered entry (deterministic by iteration order, which is alphabetical by source filename). Collisions are rare but possible — e.g., a deprecated function still present in one version's tm and a new function with the same name added to another module.

Acceptance: Unit tests cover (a) a minimal documents set producing a valid index, (b) function-name collisions producing a warning and one index entry, (c) empty source (no documents) producing zero-valued statistics and empty indexes, (d) the relationships block correctly populated from `dependencies_required`.

### Task 5.3: Implement deterministic JSON serialization

The index must be byte-stable across builds (per `data-pipeline.md` §3). JavaScript's `JSON.stringify` does not guarantee key ordering, so use the `json-stringify-deterministic` library installed in milestone 2.

Create `scripts/build-consolidated/serialize.ts` exporting:

- `serializeIndex(index: ConsolidatedIndex): string` — produces a pretty-printed (2-space indent), key-sorted JSON string.

Wrapper around the library to:
- Pass consistent options every time (2-space indent, alphabetical key sort).
- Include a trailing newline (standard for committed text files).
- Handle the `Record<string, IndexEntry>` cases where keys are dynamic and must be sorted.
- Handle nested arrays (parameter lists, dependency lists) which are pre-sorted in the builder but should be verified.

Acceptance: A unit test calls `serializeIndex` twice with the same input and asserts byte-identical output. A second test verifies key ordering — top-level keys appear in alphabetical order, nested object keys appear in alphabetical order.

### Task 5.4: Add statistical canary checks

Per `data-pipeline.md` §2.5, the statistics block in the index serves as a canary for upstream extraction quality. If a future build produces dramatically fewer items than the previous build, something likely went wrong upstream and the build should warn.

Create `scripts/build-consolidated/canary.ts` exporting:

- `checkStatisticsCanary(current: IndexStatistics, baselinePath: string): CanaryResult` — compares the current build's statistics against a committed baseline file (e.g., `scripts/build-consolidated/.statistics-baseline.json`).

Logic:
- If the baseline file doesn't exist (first run), write the current statistics as the baseline and return `{ ok: true, firstRun: true }`.
- For each statistic, compute the ratio `current / baseline`. If it falls below 0.8 (20% drop), record a canary warning.
- Return `{ ok: warnings.length === 0, warnings }`.

The canary is a warning, not a failure. A 20% drop might be legitimate (a major upstream cleanup), but it's worth surfacing. The build doesn't fail; it logs the warning prominently and keeps going. A separate explicit command (`npm run baseline:update`) updates the baseline when the change is intended.

Acceptance: Unit tests cover (a) first run creates baseline, (b) subsequent run with similar statistics produces no warnings, (c) subsequent run with 30% drop produces a warning naming the affected statistic.

### Task 5.5: Wire the index builder into the orchestrator

Update `scripts/build-references.ts` to call the index builder after both renderers complete:

```typescript
async function processVersion(version: string, opts: BuildOptions): Promise<VersionResult> {
  // ... validation (existing)
  // ... module rendering (existing)
  // ... core rendering (existing)

  // New: consolidated index
  const index = buildConsolidatedIndex(version, validatedDocuments, GENERATOR_VERSION);

  // Validate output structure
  const validation = ConsolidatedDocumentSchema.safeParse(index);
  if (!validation.success) {
    throw new BuildError(/* ... */);
  }

  // Canary check
  const canaryResult = checkStatisticsCanary(index.statistics, baselinePath);
  if (!canaryResult.ok) {
    for (const warning of canaryResult.warnings) {
      printWarning(warning, opts);
    }
  }

  // Serialize and write
  const json = serializeIndex(index);
  if (opts.dryRun) {
    written.push(`would write: consolidated.json (${json.split("\n").length} lines)`);
  } else {
    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-modules",
      "references",
      version,
      "consolidated.json"
    );
    await ensureDirectory(path.dirname(outputPath));
    await atomicWriteFile(outputPath, json);
    written.push(outputPath);
  }
}
```

The index is validated against the mirrored `ConsolidatedDocumentSchema` from milestone 1 before writing. This catches index-builder bugs at build time — if the builder accidentally produces an entry without a `path` field, the schema validation fails and the build aborts.

Acceptance: `npm run build --dry-run` reports the index would be written. `npm run build` produces an actual `consolidated.json` file at the correct path.

### Task 5.6: Verify against real source data

Run the full build:

```bash
npm run build --only 3.6 --verbose
```

Open the generated `plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json` and verify:

1. The structure matches the `ConsolidatedDocument` schema.
2. `statistics` shows non-zero counts for at least modules, functions, parameters.
3. `indexes.functionsByName` contains entries with correct `source`, `path`, and `description` fields.
4. `indexes.parametersByModule` lists modules and their parameter names.
5. `relationships.moduleDependencies` shows expected dependency graphs (e.g., `auth_db` depends on `auth` and `sl`).
6. Keys throughout are alphabetically sorted.

Spot-check by picking three function names you know to exist in different modules and confirming they appear in `functionsByName` with the correct source and path.

Run the build-twice-and-diff:

```bash
npm run build --only 3.6
sha256sum plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json > /tmp/hash1.txt
npm run clean
npm run build --only 3.6
sha256sum plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json > /tmp/hash2.txt
diff /tmp/hash1.txt /tmp/hash2.txt
```

Hashes must match. If they don't, the determinism is broken and needs fixing before milestone 6.

Commit the index file. Also commit `scripts/build-consolidated/.statistics-baseline.json` with the current statistics — this is the baseline the canary will compare against on future builds.

Acceptance: The index file is well-formed, content is correct against spot-checks, and build-twice produces byte-identical hashes. Both files are committed.

## Acceptance criteria

The milestone is done when all of the following are true:

- TypeScript types for the consolidated index are defined and aligned with the mirrored Zod schema.
- The index builder (`scripts/build-consolidated/index.ts`) produces correctly structured indexes from validated documents.
- Deterministic JSON serialization produces byte-stable output.
- The statistical canary check warns on significant drops and supports a baseline-update workflow.
- The orchestrator integrates the index builder, validates output against the schema, and writes atomically.
- Running the full build produces a `consolidated.json` file at the correct path.
- Manual inspection confirms structure, content, and key ordering.
- Build-twice produces byte-identical output.
- The index file and statistics baseline are committed.
- Unit tests pass; ESLint passes; JSDoc complete per ADR-004.

When all of these are true, milestone 5 is complete. The single-version pipeline is now fully functional. Milestone 6 generalizes it to multiple versions.

## Risks and watch-outs

**Function-name collisions across modules.** Two modules both exporting a function named `set_dlg_profile` is plausible — different modules can have different functions with the same name. The current behavior (warn, keep first) is deterministic but loses information about the second function. If this turns out to happen frequently in real source, consider extending `IndexEntry` to support arrays of sources for a single name. For v1, the warn-and-skip behavior is sufficient because collisions are rare.

**Description field length.** The `description` field in each `IndexEntry` is "first sentence from source." Some sources have first sentences that are 200+ characters. Truncate at 200 chars with a trailing ellipsis to keep the index lean. The full description is in the rendered Markdown; the index is for fast lookup, not full content.

**JSON stringify library quirks.** `json-stringify-deterministic` has its own conventions for handling edge cases (undefined values, Date objects, BigInt). The index doesn't use any of these, but if a future change introduces them, the serialization may behave unexpectedly. Read the library's docs once and document any caveats in the serialize.ts JSDoc.

**The baseline file becoming stale.** The statistical canary compares against `.statistics-baseline.json`, which is committed. If maintainers don't update the baseline when extraction output legitimately changes (new modules added, deprecated modules removed), every build will warn — and the warnings will be ignored, defeating the purpose. Document the `npm run baseline:update` command prominently and require it as part of the "adding a new version" workflow in milestone 6.

**Schema validation against the mirrored consolidated schema.** The `ConsolidatedDocumentSchema` was mirrored in milestone 1 but never actually used — it was speculative until this milestone. There's a risk the mirrored schema doesn't match what this builder produces (if the schema definition has fields the builder doesn't emit, or vice versa). Run the schema validation in this milestone and reconcile any mismatches by updating either the builder or the schema (and re-running `schemas:hash`).

**Path strings using backslashes on Windows.** The `path` field in each index entry is a string like `references/3.6/modules/tm.md`. On a Windows build, naive `path.join` produces backslashes. Use `posixPath` from milestone 2's fs-helpers throughout the builder. Test on a Windows CI runner if possible to catch this.

**Empty modules producing index entries.** A module that exports zero functions, zero parameters, etc. should still appear in `parametersByModule[moduleName]` as an empty array (it's a known module with known emptiness). It should not appear in `functionsByName` at all (no functions to index). The behavior of empty source needs explicit testing.

**Index growing too large.** For OpenSIPs 3.6 the index will probably be 100–300 KB. Larger versions (or future expansions) might push it past 1 MB. Above that, runtime parsing in `module_search.py` becomes noticeable. If the index ever exceeds 500 KB, consider whether the description fields can be further trimmed or whether the index should be split by domain.

## Parallelization notes

Tasks 5.1 (types), 5.2 (builder), 5.3 (serialization), and 5.4 (canary) are largely independent and can be done in any order. Task 5.5 (orchestrator integration) depends on all four. Task 5.6 (verification) is the closing action.

For two-person work, one person handles 5.1 + 5.2 (types and builder) while the other handles 5.3 + 5.4 (serialization and canary). They meet at 5.5.

For solo work, the natural flow is 5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6. Each task is small enough to complete in one sitting.

## Cross-references

- Index structure: `docs/architecture/data-pipeline.md` §7.3.
- Index purpose and rationale: `docs/architecture/adr/006-consolidated-json-as-search-index.md`.
- Pipeline integration: `docs/architecture/data-pipeline.md` §2.5.
- Statistical canary purpose: `docs/architecture/data-pipeline.md` §2.5.
- Determinism requirements: `docs/architecture/data-pipeline.md` §3.

---

*Next milestone: `06-multi-version-support.md`.*
