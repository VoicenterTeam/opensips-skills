<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-009: `data/` as source location, dynamic version discovery, and scope expansion

**Status:** Accepted
**Date:** 2026-04-25
**Deciders:** Project owner (Shlomi)
**Technical story:** Discovered during M0 execution that the upstream extraction output had already been placed at `data/` (not the plan's `source/`), and the project owner clarified that the build must support an open-ended set of OpenSIPs versions without code changes when new versions arrive.

---

## Context

The original implementation plan (`docs/plan/`) and CLAUDE.md specified a `source/{version}/{core,modules}/` folder layout, with a fixed scope of OpenSIPs 3.5 and 3.6. The plan's milestones M3, M4, M5, M6 describe rendering and indexing for those two versions.

When milestone 0 (repository scaffolding) began execution, the working tree was found to already contain:

```
data/
├── 3.4/{core,modules,md,guides}
├── 3.5/{core,modules,md}
└── 3.6/{core,modules,md,guides,opensips-3.6-complete.json}
```

This is the upstream `opensips-docs-collector/data/processed/` tree, copied verbatim into the project at `data/` rather than `source/`. It includes:

1. **Version 3.4**, which the original plan did not cover.
2. **A `guides/` subdirectory** in 3.4 and 3.6 (not in 3.5), corresponding to `guides.schema.md` upstream. The plan does not mention rendering guides.
3. **An `md/` subdirectory** per version containing the raw extraction Markdown (~1500 files for 3.6). Not used by the build pipeline.
4. **A combined `opensips-3.6-complete.json`** in 3.6 only. Not used by the build pipeline.

In conversation, the project owner specified additional intent:

> "We want to do 3.4, 3.5, 3.6, and later we will also do 4. For now, probably work only on what you have, but later it should be dynamic. You should dynamically build based on the version existing. No code should be changed after a new folder, the data folder, exists. It just means that there is a new release. This is a [breathing] project that will get more and more versions out there."

Three constraints emerge from this:

- The set of supported versions is **open-ended**, not enumerated at compile time.
- Adding a new version is a **data operation only**: drop the version's folder under `data/` and the build picks it up.
- The current data set determines the current build scope; the build does not enumerate which versions "should" exist.

The original plan's two-version assumption needs to be replaced with version-agnostic discovery. The original `source/` location needs to be reconciled with the existing `data/` location.

## Decision

Adopt the following four interlocking decisions as the project's data-input architecture:

**1. Use `data/` as the canonical source-data location.** The `data/` directory at the repository root is where validated extraction output lives. The plan's `source/` paths are read as `data/`. No `source/` directory will be created.

**2. Discover versions dynamically from the filesystem.** The build's discover stage scans `data/` for any subdirectory whose name matches `^\d+\.\d+$` (e.g., `3.4`, `3.5`, `3.6`, `4.0`, `4.1`). Every matching subdirectory is built. No version list is hard-coded anywhere — not in code, not in tests, not in CI, not in npm scripts.

**3. Current scope is "whatever is in `data/`".** As of this ADR's date, that is 3.4, 3.5, and 3.6. When a future contributor (or the project owner) drops a `data/4.0/` folder containing valid extraction output and runs `npm run baseline:update -- --only 4.0`, the next CI run will build, validate, render, and commit a complete 4.0 reference tree without any code change.

**4. Render guides when present, skip when absent.** The discover stage detects whether a version has a `guides/` subdirectory and, if so, includes guide files in the version's processing. A version without guides (e.g., 3.5) renders nothing for guides without erroring.

The `data/{version}/md/` raw-Markdown directory and the `data/{version}/opensips-{version}-complete.json` aggregated file are tracked in git for upstream-resync convenience, but are **ignored by the build pipeline** — they are not validated, not rendered, not referenced by any generated artifact.

### Resulting input layout

```
data/
├── 3.4/
│   ├── core/*.json        ← validated, rendered to references/3.4/core/
│   ├── modules/*.json     ← validated, rendered per-module to references/3.4/modules/
│   ├── guides/*.json      ← validated, rendered to references/3.4/guides/ (when guides scope ships)
│   ├── md/                ← ignored by build
│   └── opensips-3.4-complete.json (if present) ← ignored by build
├── 3.5/
│   ├── core/, modules/    ← processed
│   ├── md/                ← ignored
│   (no guides folder)
└── 3.6/
    ├── core/, modules/, guides/   ← all processed
    ├── md/                         ← ignored
    └── opensips-3.6-complete.json  ← ignored
```

### Resulting output layout (unchanged from plan, just per-version-dynamic)

```
plugins/opensips/skills/
├── opensips-modules/references/
│   ├── 3.4/{modules/*.md, consolidated.json}
│   ├── 3.5/{modules/*.md, consolidated.json}
│   └── 3.6/{modules/*.md, consolidated.json}
└── opensips-routing/references/
    ├── 3.4/{core/*.md, ser-lineage-notes.md, guides/*.md}
    ├── 3.5/{core/*.md, ser-lineage-notes.md}
    (no guides/ folder for 3.5 since data has none)
    └── 3.6/{core/*.md, ser-lineage-notes.md, guides/*.md}
```

### Onboarding a new version (operational workflow)

The complete procedure for adding a new OpenSIPs version (e.g., when 4.0 is released):

1. Run upstream extraction in `opensips-docs-collector` against OpenSIPs 4.0 source.
2. Copy the upstream `data/processed/4.0/` directory to this project's `data/4.0/`.
3. Run `npm run validate -- --only 4.0`. Resolve any schema mismatches **upstream** (do not relax schemas here).
4. Run `npm run build -- --only 4.0 --verbose`. Spot-check the generated reference tree.
5. Run `npm run baseline:update -- --only 4.0` to register the version's statistics baseline.
6. Run `npm run build` (full build, all versions) and verify the build-twice diff is empty.
7. Open a PR with a single commit: source data + generated output + updated baseline. CI runs the full pipeline against all versions including the new one, validates determinism, and merges.

Total code changes for adding a new version: **zero**.

## Alternatives considered

- **Keep `source/` as in the original plan, treat `data/` as a temporary staging area, copy files into `source/` during M1.** Tempting because it preserves the existing plan documents unchanged. Rejected because it creates two locations holding the same data, doubles disk usage, and adds a manual sync step that will inevitably drift. The plan's `source/` choice was made before the upstream `data/processed/` layout was settled; reconciling them now is cheaper than maintaining the divergence.

- **Drop 3.4 and any future versions; keep the plan's static scope of 3.5 + 3.6.** Tempting because it matches the existing milestone documents exactly. Rejected because the project owner's explicit intent is open-ended version support, and the cost of refactoring later (after baking in two-version assumptions) is much higher than the cost of building dynamically from day one. The plan's M1 `discoverVersions()` already pattern-matches `^\d+\.\d+$` — the dynamic capability is already half-built.

- **Hard-code an allowed-versions array in a config file (e.g., `.versions.json`) so the build has an explicit allowlist.** Tempting because it provides a "kill switch" if a malformed `data/X.Y/` folder gets dropped accidentally. Rejected because it adds a touch point that violates the "no code change for new version" rule — a contributor adding 4.0 would also need to remember to update the allowlist. The schema-hash check and per-file validation already prevent malformed source from corrupting output; an explicit allowlist would be a redundant safety net.

- **Render guides, modules, and core types into a flat per-version output tree, dropping the `opensips-routing` vs `opensips-modules` split.** Tempting because guides don't fit cleanly into the routing-vs-modules dichotomy. Rejected because ADR-005 commits us to the three-skill architecture for trigger-discovery reasons, and putting guides under `opensips-routing/references/{version}/guides/` is a natural fit (guides are part of the routing skill's domain — they cover configuration, installation, syntax).

## Consequences

**Positive:**
- Adding a new OpenSIPs version requires zero code changes. The build, CI, tests, and renderers all operate on whatever is in `data/`.
- The single `data/` location avoids two-source-of-truth confusion. Upstream re-syncs are a flat directory replacement.
- 3.4 coverage comes for free as soon as the dynamic discovery is in place — no separate milestone.
- Guides ship in v1 wherever the data has them; no v1.1 follow-up needed.
- `data/{version}/md/` raw extraction stays in git, making upstream-source verification trivial (any contributor can compare extracted JSON against original Markdown without leaving the repo).
- The build's behavior is fully data-derived. A failing build always points at either a schema bug (upstream) or a renderer bug (here) — never at a "we forgot to add the new version somewhere."

**Negative:**
- The plan documents in `docs/plan/` reference `source/` throughout. They will read as slightly out-of-date until updated. We accept this debt rather than rewriting 11 milestone files; subagents executing the plan receive `data/` translations through the execution-strategy doc and per-task prompts.
- A malformed `data/X.Y/` folder dropped by mistake would be picked up automatically by the build. Mitigation: schema validation + schema-hash check in M1 + the build's per-file validation surface this immediately. The risk reduces to a build failure with a clear error message, not silent corruption.
- The statistics baseline structure (per ADR-006 / M5 plan) needs to handle N versions instead of 2 from day one. This is a small change in scope but a meaningful one for M5/M6 implementation.
- Per-version output trees grow the repository's disk footprint roughly linearly in the number of versions. With 3 versions × ~150 modules each, plus core + index + guides, the repo will be tens of MB of generated content. Acceptable per ADR-002 but worth tracking.
- Dropping `data/4.0/` does not by itself trigger CI — a contributor still has to commit and open a PR. The "no code change" claim refers to the project source, not git workflow.

**Neutral:**
- `opensips-3.6-complete.json` is committed but not consumed. Future maintainers may wonder why. The gitignore comment explains.
- `data/{version}/md/` adds ~1500-2000 files per version to git's tree. This is large but text-only and compresses well.

## Implementation notes

**Affected milestones (translation guide for executors):**

- **M0** — Folder structure: do not create `source/`. Create only the directories that don't already exist (`scripts/`, `plugins/`, `tests/`, etc.). The `data/` folder is already populated.
- **M1** — `scripts/lib/discover.ts`: `discoverVersions()` already pattern-matches `^\d+\.\d+$`; just point its `sourceRoot` parameter at `./data` instead of `./source`. `discoverSourceFiles()` should additionally probe for `guides/` and return its file list when present (or omit when absent — no error).
- **M2** — Orchestrator: `--source-root` CLI flag default becomes `./data`.
- **M3** — Per-module rendering: paths-only change. `data/{version}/modules/*.json` → `plugins/.../opensips-modules/references/{version}/modules/*.md`.
- **M4** — Core type rendering: paths-only change. Plus, **add a guides renderer** as a 13th doc type. Guide rendering follows the aggregated pattern of core types; output goes to `plugins/.../opensips-routing/references/{version}/guides/{installation,configuration,syntax}.md` (one file per guide, since guides are large enough to warrant per-file output rather than aggregation). Use the existing markdown-builders and validation libraries.
- **M5** — Consolidated index: nothing changes structurally. Statistics may add a `totalGuides` counter when guides are processed.
- **M6** — Multi-version verification: tasks generalize from "verify 3.5 and 3.6" to "verify all versions discovered in `data/`." Currently that's three (3.4, 3.5, 3.6). The version-isolation grep checks (M6.D in execution-strategy) become a parameterized loop over discovered versions.
- **M7** — SKILL.md authoring: descriptions and `{version}` placeholders unchanged. The module-index build step (Task 7.5) operates per-version; `opensips-modules/SKILL.md`'s catalog table can either show one version's modules (the highest, e.g., 3.6) with a note that other versions may have different module sets, or use cross-version union with availability columns. Recommend the simpler "highest version's modules with note" approach for v1.
- **M8** — Local plugin testing: add 3.4-version prompts to the trigger test set alongside 3.5 and 3.6.
- **M9** — Test suite + CI: golden fixtures should cover at least one per version (e.g., a small module from each of 3.4, 3.5, 3.6). The determinism test runs against the full multi-version build. The statistics-baseline file structure (per-version map) supports any number of versions.
- **M10** — README and usage guide: list current supported versions as 3.4, 3.5, 3.6. Document the new-version onboarding workflow above.

**Statistics baseline file format (codifying the multi-version shape from M6):**

```json
{
  "schema_version": 1,
  "baselines": {
    "3.4": { "totalModules": ..., "totalFunctions": ..., ... },
    "3.5": { "totalModules": ..., ... },
    "3.6": { "totalModules": ..., ... }
  }
}
```

When a new version is added, `npm run baseline:update -- --only X.Y` adds a new key under `baselines`. No code change needed.

**.gitignore policy for the `data/` tree:**

The build does not consume `md/` or the combined `complete.json`, but they are tracked in git. Do not exclude them. The .gitignore should exclude only `node_modules/`, `dist/`, `coverage/`, IDE files, and OS junk.

## Related decisions

- **Depends on:** ADR-002 (JSON source committed alongside generated Markdown — extends it to "data folder is the canonical input location").
- **Depends on:** ADR-003 (version-isolated folders — extends it from two versions to N versions).
- **Modifies:** ADR-005 (three-skill architecture remains; guides land under `opensips-routing` per the rationale above).
- **Informs:** Future ADR for the guides-rendering specifics if guides turn out to need their own per-doc-type rules different from core/modules.
