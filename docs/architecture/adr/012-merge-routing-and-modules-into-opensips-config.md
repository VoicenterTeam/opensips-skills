<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-012: Merge routing and modules into a single `opensips-config` skill

**Status:** Accepted
**Date:** 2026-04-25
**Deciders:** Project founder
**Technical story:** Skill restructure — collapse `opensips-routing` + `opensips-modules` into one skill.
**Supersedes:** ADR-005

---

## Context

ADR-005 split OpenSIPs work into three skills: `opensips-routing` (authoring), `opensips-modules` (reference), `opensips-security-advisor` (review). The split predicted that procedural and reference content would compete for SKILL.md space if combined. Operational experience after M0–M10 shows the split costs more than it saves:

1. Almost every authoring prompt requires module reference data immediately. The two-skill activation adds latency and a second cross-skill `references/` path lookup that buys nothing.
2. The `opensips.cfg` file itself is undocumented as an artifact. There is no first-class teaching of section order, modparam-after-loadmodule rules, or the "scan loadmodules and load each module's reference" workflow that authoring naturally needs.
3. The 200-row inline module index in `opensips-modules/SKILL.md` is heavier than progressive disclosure recommends. The `consolidated.json` index already covers most lookup cases; the inline catalog is fallback that does not deserve always-loaded status.

## Decision

Two skills:

1. **`opensips-config`** — authoring + per-module reference. Workflow-first SKILL.md anchored on the cfg file as an artifact. References tree merges the old routing's `core/`, `guides/`, `ser-lineage-notes.md` with the old modules' `modules/`, `consolidated.json`, plus a new hand-authored `cfg-format.md` and a new generated `modules-index.md`.
2. **`opensips-security-advisor`** — unchanged in role; only cross-references update.

A `loadmodule`-scan workflow (read `cfg-format.md` → read `consolidated.json` → for each `loadmodule` whose module Claude touches, read its per-module `.md`) is the canonical procedure when working with a cfg file.

## Alternatives considered

- **Keep three skills** (status quo). Rejected per the operational reasons above.
- **Merge all three** including the security advisor. Rejected because the advisor has a separate authoring cadence and a clean read-only contract; merging would couple unrelated concerns.
- **Keep two skills but reorganize routing only.** Rejected because the cfg-file teaching and the loadmodule-scan workflow naturally need both routing and module content under one roof.

## Consequences

**Positive:**
- One skill activates for cfg work; no two-skill negotiation per prompt.
- The cfg-file format is taught explicitly via `cfg-format.md`.
- Module index moves out of SKILL.md, freeing the SKILL.md to be workflow-first.
- The security advisor's cross-reference paths simplify from two siblings to one.

**Negative:**
- Pure-lookup prompts now resolve via `references/{version}/modules-index.md` (one extra Read) when `consolidated.json` does not suffice.
- ADR-005 is superseded; subsequent contributions must read ADR-012 to understand the current decomposition.

**Neutral:**
- ADR-001 (router-index pattern), ADR-002 (JSON source of truth), ADR-003 (version-isolated folders), ADR-006 (consolidated.json as search index) all apply identically to the unified skill.

## Implementation notes

See `docs/superpowers/plans/2026-04-25-merge-routing-and-modules-into-opensips-config.md`.

## Related decisions

- **Supersedes:** ADR-005 (three-skill architecture).
- **Depends on:** ADR-001, ADR-002, ADR-003, ADR-006.
