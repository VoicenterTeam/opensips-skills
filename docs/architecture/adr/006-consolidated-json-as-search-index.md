<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-006: `consolidated.json` as the search index

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** How skills find content by name without reading every reference file

---

## Context

The router-index pattern (ADR-001) solves the primary lookup path: when a user mentions a module by name, Claude reads the catalog in `opensips-modules/SKILL.md`, finds the right reference file, and reads it. This works when the user uses the exact module name.

It doesn't work for three other cases:

1. **Typos and aliases.** A user asks about "the usrloc module" when the reference file is named `user_location.md`, or asks about "tm" when only the catalog entry is "transaction". The router-index is literal; it doesn't match fuzzily.

2. **Symptom-first queries.** A user asks "what module handles SIP digest authentication?" without naming a module. The catalog maps names to files, not capabilities to names.

3. **Cross-module questions from the security advisor.** The `opensips-security-advisor` skill (ADR-005) needs to iterate modules programmatically, check which ones are loaded in a user's config, and look up their parameters. Reading ~100 Markdown files to answer one question is expensive; parsing them for structured data is fragile.

All three cases want the same thing: a fast, structured lookup across the entire reference corpus, without requiring Claude to read every Markdown file.

The extraction project's schema already specifies a `ConsolidatedDocument` type (see `consolidated.schema.md`) intended as "the final, merged JSON file designed for MCP consumption." It includes flat indexes keyed by name: `functionsByName`, `parametersByModule`, `variablesByName`, `miCommandsByName`. The extraction project never produced this artifact — the schema was defined but not used.

The question is whether this project should produce it, and if so, how.

## Decision

**Generate `consolidated.json` per version as part of the build pipeline. It lives alongside the rendered Markdown under `opensips-modules/references/{version}/consolidated.json`.**

The consolidated index is a derived artifact, not a source of truth. It is produced by `scripts/build-consolidated.ts` from the same per-doc JSON files used to render Markdown. Running `npm run build` regenerates it deterministically.

Structure follows the extraction project's `ConsolidatedDocument` schema, with four indexes that matter for runtime lookup:

- `functionsByName` — every exported function from every module, plus core functions, keyed by function name. Each entry points to its source (module name or "core") and the reference path where it's documented.
- `parametersByModule` — module name → array of parameter names. Lets a caller answer "does this module support parameter X" in one lookup instead of reading the module file.
- `variablesByName` — every pseudo-variable from every module, plus core variables, keyed by variable name.
- `miCommandsByName` — every MI command from every module, plus core MI commands, keyed by command name.

Plus a statistics block (totals per doc type, for diagnostics) and a relationships block (module dependency graph, so callers can answer "what does this module depend on" without re-parsing).

The index is consumed in two ways:

1. **By the `module_search.py` script** (called from `opensips-routing/SKILL.md` as a fallback when a user's query doesn't match the catalog literally). The script loads the index once, performs name-based matching (exact → prefix → substring), and returns JSON with hits and their source paths.

2. **By the security advisor skill** (per the integration contract in ADR-005). The advisor reads the index directly for programmatic iteration over modules and their exports, without reading 100 Markdown files.

Claude does not read `consolidated.json` directly for content. The index gives Claude a pointer; the full content still lives in the Markdown reference files. This preserves the progressive disclosure model — the index is small enough to inline, the references stay lazy.

## Alternatives considered

- **No search index. Rely on literal catalog matching plus Claude reading Markdown files on demand.**
  - Tempting because it's the simplest thing. One less artifact to generate, one less path to debug.
  - Rejected because the failure modes named in the Context section (typos, symptom-first queries, security-advisor iteration) would have no good answer. Claude would either read many Markdown files to hunt for a match (expensive, slow) or fail to find content that exists (bad user experience).

- **Grep over the rendered Markdown files at runtime.** Have `module_search.py` literally grep the reference tree.
  - Tempting because it requires no separate artifact — the Markdown files are already there.
  - Rejected for two reasons. First, parsing Markdown for structured data is fragile; heading levels shift, formatting evolves, and regex-based extraction is a source of subtle bugs. Second, it's slow — grepping 100 files per query is wasteful when we could generate an index once at build time.

- **Multiple per-type index files.** `functions.json`, `parameters.json`, `variables.json`, `mi-commands.json` as separate indexes.
  - Tempting because each index stays small.
  - Rejected because the split adds complexity without meaningful benefit. The combined `consolidated.json` for a single version is well under a megabyte; splitting it just means more I/O for the search script and more files the build has to keep in sync.

- **SQLite database as the index.** Generate a `.sqlite` file per version; query it with SQL.
  - Tempting because it scales better than JSON for huge catalogs.
  - Rejected because the scale doesn't warrant it. ~100 modules with ~10–30 exports each is thousands of rows, not millions. JSON loaded into memory outperforms SQLite on this workload, and adding a dependency on `sqlite3` for the search script violates the "Python 3.8+ stdlib only" constraint we set for runtime scripts.

- **Vector embeddings for semantic search.**
  - Rejected for the same reasons as in ADR-002. Exact-match retrieval on names is deterministic and fast; semantic similarity would introduce drift and require infrastructure.

## Consequences

**Positive:**

- The router-index pattern gets a reliable fallback. A typo or alias mismatch triggers `module_search.py`, which finds the right reference file by name matching, not by Markdown parsing.
- The security advisor can iterate modules programmatically without reading 100 Markdown files. Cross-module queries ("which modules export this parameter," "what does this module depend on") become O(1) lookups.
- The index is a natural diagnostic surface. The statistics block (totals per doc type) catches extraction bugs — if `functionsByName` has 20% fewer entries than expected for a version, something is wrong upstream.
- Three consumers (the search script, the security advisor, and any future skill that needs structured iteration) share one artifact. No duplication.

**Negative:**

- The build pipeline produces one more file per version. This is a small cost, but it does mean a broken `build-consolidated.ts` breaks every skill that depends on the index, not just the modules skill. Good tests on the index builder are essential.
- The index duplicates data already in the Markdown files. A parameter defined in `tm.json` appears in `tm.md` (rendered) and in `consolidated.json` (indexed). This is acceptable overhead but means the build has to produce both consistently. The idempotence requirement from ADR-004 covers this: regenerating both from the same source always produces the same output.
- The index is version-scoped (per ADR-003), which means a search across all versions requires loading multiple index files. For the current scope this is fine — Claude operates within one version at a time — but any future feature that needs cross-version search would need its own aggregation step.

**Neutral:**

- The index structure follows the extraction project's `ConsolidatedDocument` schema, which was designed for "MCP consumption" that never happened. This project repurposes the schema for skill consumption. The semantics are close enough that the extraction schema is a good starting point; any divergence from the original intent should be documented inline in the build script.
- The relationships block (module dependencies) is derived from each module's JSON. If a module's dependency list changes upstream, the index automatically reflects it on the next build. This is a nice property but not load-bearing for v1.

## Implementation notes

- `build-consolidated.ts` runs after all per-module and per-core rendering is complete. This ensures the index can reference the exact paths of the rendered Markdown files, not paths that might have been produced differently.
- The index file is pretty-printed JSON (2-space indent), not minified. The file is small enough that readability wins over byte count, and pretty-printed diffs are reviewable.
- Ordering within index arrays is alphabetical by key. Same rule as everywhere else in the build: deterministic output means `git diff` is meaningful.
- `module_search.py` loads the entire index once at invocation. For a few hundred KB of JSON this is negligible; streaming or partial loading would add complexity for no benefit.
- The index should include a top-level `schema_version` field matching the current `ConsolidatedDocument` schema version. When the schema changes, the field changes, and consumers can detect mismatches.

## Related decisions

- **Depends on:** ADR-001 (router-index pattern) — the index exists as a fallback for the router-index's failure modes.
- **Depends on:** ADR-002 (JSON source of truth) — the index is derived from the same source JSON used to render Markdown, not maintained separately.
- **Depends on:** ADR-003 (version-isolated folders) — the index is scoped per version, consistent with the rest of the pipeline.
- **Informs:** ADR-005 (three-skill architecture) — the security advisor's integration contract depends on having this index available.
