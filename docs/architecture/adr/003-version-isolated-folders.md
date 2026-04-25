# ADR-003: Version-isolated folders, no cross-version reasoning

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** Architecture for multi-version support

---

## Context

OpenSIPs has multiple concurrently-supported versions. At the time of this decision, the plugin targets 3.5 and 3.6, with older versions out of scope. The extraction project produces separate JSON output for each version — `data/processed/3.5/` and `data/processed/3.6/` — with no relationships or deltas between them. Each version's extraction run treats the upstream documentation for that version as a self-contained world.

Two facts shape the decision:

1. **OpenSIPs users work one version at a time.** A production deployment is pinned to a specific version. An engineer writing or reviewing an `opensips.cfg` has one version in mind throughout the task. They do not typically ask "what changed between 3.5 and 3.6" in the middle of authoring a route block — they either know which version they're on, or they find out, and then they stay there.

2. **The upstream extraction project is version-isolated by design.** It does not correlate identifiers across versions, does not compute deltas, does not mark parameters as "added in 3.6" or "deprecated in 3.5." Each version's JSON is a flat snapshot of what exists in that version's documentation.

The question is whether the plugin should preserve this isolation or introduce cross-version reasoning on top of it.

## Decision

**Version isolation is preserved end-to-end. Each version is a completely independent world in the pipeline and in Claude's reasoning.**

Concretely:

1. Source JSON is organized under `source/{version}/` with no cross-references between version folders.
2. Generated Markdown is organized under `references/{version}/` mirroring the source layout.
3. The consolidated search index is built per version, not across versions. There is no unified "all-versions" index.
4. At runtime, Claude resolves the active version once (via the protocol in the requirements document) and operates strictly within that version's reference tree for the remainder of the task.
5. No code path in the build script or the skills reads from one version while operating on another.
6. No "changed between versions" reasoning exists. If a user asks "what changed in `tm` between 3.5 and 3.6," Claude responds within the active version only — it does not attempt to reconstruct a delta from two separate reference sets.

This applies to both the build-time pipeline and the runtime skill behavior. Rule 4 in `CLAUDE.md` ("version isolation is sacred") is the operational expression of this ADR.

## Alternatives considered

- **Unified cross-version schema with per-item version tags.** Each module JSON carries `available_since: "3.5"`, `deprecated_in: "3.6"` fields. Build script produces one reference file per module that shows version-aware availability. Users get delta-style reasoning for free.
  - Tempting because it's how many software documentation projects handle versioning — a single source of truth with conditional rendering.
  - Rejected because it doesn't match reality. The upstream extraction project does not produce version-tagged fields; synthesizing them would require a cross-version merge step that correlates items across versions, which is a substantial piece of logic that can get items wrong (same name, different semantics, different versions). The failure mode — Claude telling a user "this parameter is available since 3.5" when it actually isn't — is worse than the absence of the feature. Adding this would also violate the source-of-truth principle in ADR-002: we'd be generating version-lineage metadata that doesn't exist in the upstream.

- **Single version with migration-path documentation.** Support only the current LTS; document older versions as a separate "migrating from" guide.
  - Tempting because it radically simplifies the plugin.
  - Rejected because production OpenSIPs fleets run multiple versions concurrently. A carrier might have 3.5 in production and 3.6 in staging during a rollout. Supporting only one version would leave half the real-world users without plugin coverage for half of their work.

- **Version-parameterized single reference tree.** One set of reference files with Handlebars-style `{{#if version="3.6"}}` blocks conditionally rendering per-version content.
  - Tempting for the same reason as the unified schema option: one edit point, many outputs.
  - Rejected because it moves complexity into the reference files themselves, which Claude must then read with version awareness. Every reference file becomes harder to scan, harder to review in PRs, and introduces a new class of bug (conditional blocks rendering wrong content for the wrong version). Folder-level isolation keeps each rendered file simple and reviewable as a standalone artifact.

## Consequences

**Positive:**

- Folder structure is self-documenting. A contributor looking at `source/3.5/` knows exactly what they're looking at. No need to understand version-tagging conventions or conditional rendering logic.
- The build script's version dispatch is trivial: walk `source/`, process each version independently, write to the corresponding output folder. A build failure in one version does not prevent others from completing.
- Each version can be regenerated, audited, and shipped independently. If a bug is found in the 3.5 extraction, only 3.5 output needs to be regenerated.
- Claude's runtime reasoning is simpler. Once the active version is resolved, the reference tree is fixed. No conditional logic, no version-aware branching — just "read this path."
- The contract with the upstream extraction project is clean. Version-isolation is a property of the input that the plugin preserves rather than transforms.

**Negative:**

- Questions that require cross-version reasoning cannot be answered. "What's new in 3.6 compared to 3.5?" is outside the skill's capability. If users ask, Claude responds within the active version only and directs them to upstream release notes for cross-version information.
- Duplication is inherent. A parameter that exists identically in 3.5 and 3.6 appears in two separate reference files. Contributors fixing a typo in one version's extraction must separately fix it in the other (or accept that the next extraction run will). The plugin does not deduplicate; the extraction project's per-version independence is respected as-is.
- Adding a new version is a full pipeline run, not an incremental update. This is not a significant cost (the pipeline is deterministic and fast), but it's worth naming: there's no "lightweight add" path for supporting a new version.
- Future features that might seem natural (version-upgrade assistant, config migration tool) would need to be built as separate skills with their own logic, not as extensions of the existing skills. They cannot piggyback on the reference infrastructure.

**Neutral:**

- Version count grows linearly with supported OpenSIPs versions. At 3 active versions, the repository contains 3 complete reference trees. This is manageable; the extraction output for a single version is measured in megabytes, not gigabytes.
- The `ser-lineage-notes.md` file is also per-version, even though its content may be nearly identical across versions. This is deliberate — it's a hand-authored file, and keeping it per-version lets each version's guardrails evolve independently if needed.

## Implementation notes

- The build script must iterate versions from `source/`, not from a hardcoded list. Adding `source/3.7/` should require no code change.
- Version resolution at runtime is the skill's responsibility, not the build's. The build produces version-specific trees; the skill picks one at runtime via the protocol in the requirements document (user statement, environment variable, `.opensips-version` file, `opensips -V` output, default).
- The default version (currently 3.6) is a single constant that should live in one place — likely `opensips-routing/SKILL.md` — so updating the default is a one-line change.
- Reference paths in `SKILL.md` files use `{version}` as a placeholder. Claude substitutes at read time based on the resolved active version. The build script does not substitute — it produces literal paths.

## Related decisions

- **Depends on:** ADR-002 (JSON source of truth) — version isolation only works because the upstream source is itself isolated per version.
- **Informs:** ADR-005 (three-skill architecture) — all three skills share the same version-resolution protocol, which is possible because every skill's reference structure is version-scoped identically.
- **Informs:** ADR-006 (consolidated.json as search index) — the index is built per version, not globally, because the underlying data is isolated.
