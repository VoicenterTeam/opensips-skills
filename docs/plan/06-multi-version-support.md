# Milestone 6: Multi-version support

## Goal

Add OpenSIPs 3.5 source data to the project, run the full build pipeline against both 3.5 and 3.6, and verify version isolation end-to-end. At the end of this milestone, the repository contains complete generated reference trees for both versions, and the build is proven to handle multiple versions correctly without cross-contamination.

This milestone is mostly verification rather than new implementation. The pipeline was designed to be version-isolated from the start (per ADR-003), and milestones 1–5 implemented that isolation through structural choices: per-version source folders, per-version output paths, per-version index files. This milestone proves the design works.

## Why this is sequenced here

Adding the second version after the first is fully working is the right time. The single-version pipeline is debugged, the renderers are stable, and any failure observed when adding 3.5 is genuinely a multi-version issue rather than a single-version bug surfaced in a new context. Doing it earlier (e.g., starting with two versions) would mean debugging two failure surfaces simultaneously — slower than getting one right and then proving the design generalizes.

This is also the milestone that turns version isolation from an architectural claim into an empirical fact. ADR-003 says versions are isolated; until two versions actually exist and build cleanly without interference, that's a hypothesis. After this milestone, it's verified behavior.

## Tasks

### Task 6.1: Acquire OpenSIPs 3.5 source data

Coordinate with the upstream `opensips-docs-collector` project to obtain the JSON output for OpenSIPs 3.5. Concretely, the contents of `data/processed/3.5/` from the extraction project's repository.

This may require:
- Running the extraction pipeline against 3.5 if it hasn't been run.
- Pulling the latest output if 3.5 was extracted previously.
- Resolving any extraction errors that surface in the 3.5 data set.

The 3.5 source set should have the same structure as 3.6: a `core/` directory with twelve doc-type files (async, events, flags, functions, mi_commands, operators, parameters, routes, statements, statistics, transformations, variables) and a `modules/` directory with one JSON file per module.

Acceptance: The 3.5 JSON output exists and is structurally complete. Module count and core-file count are reported.

### Task 6.2: Copy 3.5 source into the repository

Place the 3.5 source files at `source/3.5/core/` and `source/3.5/modules/`. Use the same file structure as `source/3.6/`. No transformation, no editing — verbatim copy from the extraction project's output.

Run validation against the new source:

```bash
npm run validate -- --only 3.5
```

Expected outcome: validation passes cleanly. If it fails, the failure is one of:

1. **Schema mismatch** — the 3.5 source uses a schema that has drifted from the version mirrored in `scripts/schemas/`. Resolution: re-mirror the schemas, regenerate the schema hash, re-run validation.
2. **Real source bug** — the 3.5 extraction has produced malformed data. Resolution: fix in the extraction project upstream, regenerate, re-copy.

Do not paper over validation failures by relaxing the schema in this project. The schema is the contract; if 3.5 data violates it, the contract is broken upstream.

Acceptance: `npm run validate -- --only 3.5` exits 0. The 3.5 source is committed.

### Task 6.3: Run the full build for 3.5

```bash
npm run build -- --only 3.5 --verbose
```

Expected outcome: the build produces:

- One `.md` file per module in `plugins/opensips/skills/opensips-modules/references/3.5/modules/`.
- Twelve aggregated `.md` files in `plugins/opensips/skills/opensips-routing/references/3.5/core/`.
- One `consolidated.json` at `plugins/opensips/skills/opensips-modules/references/3.5/consolidated.json`.

If anything in the rendering or index-building stages fails for 3.5, debug. Common causes:

1. **3.5 has document-type variations not seen in 3.6.** The extraction may produce slightly different shapes — a field that's optional in 3.6 might be present in 3.5, or vice versa. The renderer should already handle these because it's typed against the schema; if it doesn't, the typing was too loose and needs tightening.
2. **Module names that don't exist in 3.6.** A 3.5 module that was removed by 3.6 surfaces unique edge cases. Verify the renderer handles it; it should.
3. **Slug collisions with 3.6.** This shouldn't happen — slugs are scoped within a version, not globally — but verify by running `npm run build` for both versions and checking that each version's output directory contains the right files.

Acceptance: The full build for 3.5 produces all expected artifacts.

### Task 6.4: Run the full build for both versions

```bash
npm run build --verbose
```

With no `--only` flag, the orchestrator iterates both versions. Expected outcome: both 3.5 and 3.6 trees are produced, in either order, without interference.

Verify the output structure:

```
plugins/opensips/skills/
├── opensips-modules/references/
│   ├── 3.5/
│   │   ├── modules/*.md
│   │   └── consolidated.json
│   └── 3.6/
│       ├── modules/*.md
│       └── consolidated.json
└── opensips-routing/references/
    ├── 3.5/
    │   ├── core/*.md
    │   └── ser-lineage-notes.md  (will be added in milestone 7)
    └── 3.6/
        ├── core/*.md
        └── ser-lineage-notes.md  (will be added in milestone 7)
```

Note that `ser-lineage-notes.md` is hand-authored and is added in milestone 7, not generated. Its absence from this milestone's output is correct.

Acceptance: Both version trees exist with the expected file structure.

### Task 6.5: Verify version isolation

Run two checks that prove version isolation is real, not just structural.

**Check 6.5.A: No cross-version paths in generated content.**

```bash
grep -r "references/3.5" plugins/opensips/skills/opensips-modules/references/3.6/
grep -r "references/3.6" plugins/opensips/skills/opensips-modules/references/3.5/
```

Both greps must return no results. A file in the 3.6 tree referencing the 3.5 tree (or vice versa) means the renderer leaked a hardcoded version somewhere. Find and fix.

**Check 6.5.B: Consolidated indexes do not reference each other's modules.**

```bash
jq '.indexes.functionsByName | to_entries[] | select(.value.path | contains("3.5"))' plugins/opensips/skills/opensips-modules/references/3.6/consolidated.json
jq '.indexes.functionsByName | to_entries[] | select(.value.path | contains("3.6"))' plugins/opensips/skills/opensips-modules/references/3.5/consolidated.json
```

Both `jq` queries must return empty. Each version's index references only its own paths.

If either check fails, version isolation is broken. The fix is in the renderer or index builder, not in this verification step.

Acceptance: Both isolation checks pass.

### Task 6.6: Run the build-twice-and-diff for both versions

The full determinism check now spans both versions:

```bash
npm run build
find plugins/opensips/skills -type f -name '*.md' -o -name '*.json' | sort | xargs sha256sum > /tmp/build1.hashes
npm run clean
npm run build
find plugins/opensips/skills -type f -name '*.md' -o -name '*.json' | sort | xargs sha256sum > /tmp/build2.hashes
diff /tmp/build1.hashes /tmp/build2.hashes
```

The diff must be empty. If it isn't, the determinism is broken — but specifically broken in a multi-version context. Possible causes include:

1. **Iteration order between versions is non-deterministic.** The orchestrator iterates `discoverVersions()`, which sorts alphabetically. If something else introduces non-determinism (a parallel `Promise.all` over versions without ordering), this is where it shows up.
2. **A shared state between version processing.** If module rendering for 3.5 leaves state in a global that affects 3.6 rendering, the second build (where state may differ from the first) produces different output. The orchestrator should be designed so each version is processed independently with no shared mutable state.

Acceptance: The diff is empty. Both versions produce byte-identical output across runs.

### Task 6.7: Update the statistics baseline for both versions

The canary baseline file from milestone 5 needs to cover both versions. Update its structure:

```json
{
  "schema_version": 1,
  "baselines": {
    "3.5": {
      "totalModules": 87,
      "totalFunctions": 1102,
      "totalParameters": 1956,
      "totalPseudoVariables": 232,
      "totalMICommands": 84,
      "totalEvents": 18,
      "totalStatistics": 145
    },
    "3.6": {
      "totalModules": 92,
      "totalFunctions": 1147,
      "totalParameters": 2034,
      "totalPseudoVariables": 245,
      "totalMICommands": 89,
      "totalEvents": 21,
      "totalStatistics": 156
    }
  }
}
```

Update `scripts/build-consolidated/canary.ts` to look up the baseline by version, not as a flat structure. The baseline-update workflow (`npm run baseline:update`) writes the current build's statistics for all built versions.

Add `npm run baseline:update -- --only 3.5` for updating one version's baseline without touching the other.

Acceptance: The canary checks each version against its own baseline. A 30% drop in 3.5 statistics produces a warning naming version 3.5; a 30% drop in 3.6 produces a warning naming version 3.6.

### Task 6.8: Commit the full multi-version output

Stage and commit:

- `source/3.5/` — the full 3.5 source data.
- `plugins/opensips/skills/opensips-modules/references/3.5/` — the full 3.5 module references and index.
- `plugins/opensips/skills/opensips-routing/references/3.5/core/` — the full 3.5 core references.
- The updated statistics baseline.

This will be the largest single commit in the project's history. That's expected — adding a version legitimately adds a large amount of generated content. The PR description should note that the bulk of the diff is generated content, with a brief summary of any non-generated changes (canary structure update, baseline file).

Acceptance: The commit is pushed. CI passes (assuming CI is set up; the formal CI work happens in milestone 9, but the build-twice-and-diff check from this milestone is a manual approximation).

## Acceptance criteria

The milestone is done when all of the following are true:

- OpenSIPs 3.5 source data is acquired from the upstream extraction project and committed at `source/3.5/`.
- Validation passes for both 3.5 and 3.6.
- The full build produces complete reference trees and consolidated indexes for both versions.
- Both version isolation checks (Task 6.5) pass — no cross-version paths in generated content.
- Build-twice produces byte-identical output across both versions combined.
- The statistics baseline is structured per-version and the canary works correctly for each version independently.
- All generated files for both versions are committed.
- ESLint passes; JSDoc complete; existing tests still pass.

When all of these are true, milestone 6 is complete. The pipeline is verified to work for multiple versions and the multi-version architecture is proven sound. Milestone 7 (skill authoring) can begin.

## Risks and watch-outs

**Schema drift between 3.5 and 3.6.** The 3.5 extraction may have used an older schema version than 3.6. If the extraction project tagged 3.5's output before a later schema change, the 3.5 JSON might use slightly different field names or types. The mirrored schemas in this project must accommodate both. If this happens, the right resolution depends on the change:

- If the change is purely additive (3.6 adds an optional field 3.5 doesn't have), the schema covers both as long as the new field is `.optional()`.
- If the change is breaking (a renamed field, a changed type), the extraction project needs to either re-extract 3.5 against the new schema or this project needs separate per-version schemas. Avoid the latter — it adds permanent complexity.

The cleanest path is to ensure both versions are extracted with the same schema version. Coordinate with the extraction project to make this true if it isn't.

**Modules in 3.5 that don't exist in 3.6.** A module deprecated and removed by 3.6 still exists in 3.5. Its reference file appears in `references/3.5/modules/` but not in `references/3.6/modules/`. This is correct behavior — version isolation means each version has its own module set. The file should not appear in the 3.6 catalog (the SKILL.md catalog generated for the modules skill in milestone 7).

**Modules in 3.6 that don't exist in 3.5.** Symmetric case. New modules in 3.6 don't appear in the 3.5 reference set. Also correct.

**Build time.** Adding a second version doubles the build time. For ~100 modules per version, the build is still fast (single-digit seconds), but if a third version is added later the time accumulates. Don't optimize prematurely; revisit if the build ever takes more than 30 seconds.

**Disk space and git history weight.** Committing two full reference trees roughly doubles the repo's disk footprint. Generated content compresses well in git, but the working-directory size grows. This is acceptable per ADR-002 (committing generated output is a deliberate trade-off), but a contributor cloning the repo should expect a non-trivial download. Document expected repo size in the README in milestone 10.

**The "shouldn't this just work?" assumption.** Most of this milestone's work is verification, not implementation. The temptation is to skip the verification ("the design is right, of course it works") and assume isolation holds. Don't. Run the explicit checks in Task 6.5. Version isolation is structural, but structural correctness only holds if every layer of the pipeline preserves it. Bugs that compromise isolation could exist in any of the layers built in milestones 1–5; this milestone is the place to find them.

**Cross-contamination via the consolidated.json schema field.** The `version` field in each `consolidated.json` should match the version it's for — `3.5/consolidated.json` has `"version": "3.5"`, `3.6/consolidated.json` has `"version": "3.6"`. This is the kind of detail easy to get wrong (hardcode `"3.6"` somewhere, ship a 3.5 index that claims to be 3.6). Spot-check both index files.

**The build-twice check on a slow machine.** With two versions, the full build-twice cycle can take a minute or more. The temptation is to skip the second build during local iteration. Don't skip it — but also wire it to be opt-in via a flag or environment variable so day-to-day development doesn't pay the cost. CI should always run it; local development can run it on demand.

## Parallelization notes

This milestone is largely sequential because each task verifies the previous. Tasks 6.1 (acquire source) and 6.7 (update baseline) are the only ones with significant independent work; everything else is verification or running existing pipeline code against new data.

For solo work, do the tasks in order. Each task's outcome influences whether the next one can proceed without surprises.

## Cross-references

- Version isolation principle: `docs/architecture/adr/003-version-isolated-folders.md`.
- Multi-version pipeline behavior: `docs/architecture/data-pipeline.md` §2.1, §8.4.
- "Adding a new version" workflow: `docs/architecture/data-pipeline.md` §8.4.
- Schema mirroring contract: `docs/architecture/data-pipeline.md` §5.3.
- Generated-output commit policy: `docs/architecture/data-pipeline.md` §8.1, ADR-002.

---

*Next milestone: `07-skill-authoring.md`.*
