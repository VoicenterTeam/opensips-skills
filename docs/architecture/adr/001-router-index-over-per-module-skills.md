# ADR-001: Router-index pattern over per-module skills

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** Initial architecture design for `opensips-skills`

---

## Context

OpenSIPs has roughly 100 modules, each with its own parameters, exported functions, pseudo-variables, statistics, MI commands, and events. The skill plugin must give Claude access to all of them, version-aware, without blowing past context limits or degrading the model's ability to pick the right one.

Three constraints shaped this decision:

1. **Tool-selection accuracy degrades at scale.** Research on retrieval-augmented tool use shows that when an LLM has more than a few dozen tools or skills available, its ability to pick the correct one collapses — to roughly 13% at 100+ items in naive "everything in context" setups. Per-module skills would put us directly in that failure regime.

2. **Skill non-invocation is a real failure mode.** Even with well-described skills, multi-skill evaluations have observed models failing to invoke a relevant skill in roughly half of cases where they should have. Having many skills compounds this — each skill competes with the others for the model's attention, and weaker descriptions lose.

3. **Claude Code loads all skill frontmatter into the system prompt at session start.** Hundred-module skills would mean 100 frontmatter blocks always present, consuming ~10,000 tokens before the conversation even begins.

We needed a structure that exposed all modules without paying the cost of 100 top-level skills.

## Decision

**One skill (`opensips-modules`) acts as a router-index pointing to per-module reference files.**

The skill's `SKILL.md` contains a catalog — a table mapping every module name (and common aliases) to its reference file path. It does not contain module documentation itself. When the user mentions a specific module, the skill triggers, Claude reads the catalog, and Claude reads only the relevant per-module reference file(s) on demand.

```
opensips-modules/
├── SKILL.md                              # Router-index catalog (~250 lines)
└── references/{version}/
    ├── modules/
    │   ├── tm.md                         # Per-module, loaded on demand
    │   ├── dialog.md
    │   ├── dispatcher.md
    │   └── ...                           # ~100 files
    └── consolidated.json                 # Index for fast lookup
```

The result is one top-level skill, not 100; the model's routing decision is "does the user want to know about a module?" rather than "which of 100 modules does the user want?"; and module content costs zero tokens until a specific module is referenced.

## Alternatives considered

- **One skill per module (`opensips-tm`, `opensips-dialog`, `opensips-dispatcher`, …)** — The most direct expression of "give Claude knowledge of each module."
  - Tempting because it makes every module independently discoverable and version-able.
  - Rejected because it puts us into the tool-selection accuracy cliff (13% at 100+ items), loads 100 frontmatter blocks into every session, and creates a maintenance surface where any SKILL.md convention change has to propagate across 100 files.

- **One monolithic skill with all module documentation inline in SKILL.md** — Dump everything into one file.
  - Tempting because it's simple and always loaded.
  - Rejected because it blows the context budget. A full module reference library is several hundred thousand tokens. Even if it fit, we'd pay the full cost on every session regardless of relevance.

- **Module-family grouping (10–15 skills like `opensips-routing-modules`, `opensips-auth-modules`, `opensips-media-modules`)** — A middle path.
  - Tempting because it reduces the skill count below the accuracy cliff while still partitioning the reference material.
  - Rejected for two reasons: (1) it forces a taxonomy decision (which family does `rtpengine` belong to? Media? Dispatching? Both?) that adds friction without clear benefit, and (2) Claude still pays for all ~15 frontmatter blocks and must still disambiguate between them. The router-index gives us one skill with the same progressive-disclosure benefit.

- **RAG / vector embeddings over module documentation** — Embed every module doc, retrieve by similarity.
  - Tempting because it's the "modern" answer.
  - Rejected because the documentation is already pre-structured JSON. Retrieval by module name is deterministic — we don't need semantic similarity when the user literally types "dispatcher module." Adding a vector database creates infrastructure, latency, and drift risk for a problem exact-match retrieval solves. See ADR-002 for the related "JSON over vector embeddings" decision.

## Consequences

**Positive:**

- Claude's routing decision collapses from "pick among 100 modules" to "is this a module question?" — dramatically higher accuracy.
- Frontmatter overhead stays at ~60 lines for the whole plugin, not 10,000+.
- Per-module reference files cost zero tokens until explicitly read. A conversation about one module never pays for the other 99.
- Adding a new module is a matter of dropping one reference file and one catalog row, not creating a new skill with its own frontmatter and boilerplate.
- The `opensips-security-advisor` skill can read module references the same way, without needing its own per-module structure.

**Negative:**

- The catalog in `SKILL.md` is a single point of failure for discoverability. A module missing from the catalog is effectively invisible even if its reference file exists. Build scripts must enforce catalog/reference-file consistency.
- Progressive disclosure requires Claude to make a second hop: trigger the skill, then read the reference. If Claude triggers the skill but fails to read the reference file, the user gets a response based only on the catalog — which has module names but no content. The `opensips-modules` SKILL.md body must make the "read the reference file" instruction unmissable.
- A user asking about multiple modules in one prompt requires Claude to read multiple reference files sequentially, which takes more turns than if everything were already in context. For the common case this is fine; for complex multi-module questions it adds a small amount of latency.

**Neutral:**

- The catalog becomes an authored artifact alongside the auto-generated reference files. The build script generates the catalog from the set of available reference files to keep it in sync, but the surrounding structure of `SKILL.md` (role statement, version resolution, delegation rules) is hand-authored.
- Future skills with large reference surfaces (e.g., a future `opensips-module-dev` skill covering ~20 C-level API chapters) should follow the same pattern.

## Implementation notes

- The catalog must be generated from `consolidated.json` at build time, not hand-maintained, to eliminate drift between what the catalog claims exists and what reference files actually exist.
- `SKILL.md` must include an explicit fallback rule: if a user mentions a module not in the catalog, Claude should run `module_search.py` before assuming the module doesn't exist. This protects against typos and alias-matching failures.
- Reference file paths in the catalog use `{version}` as a placeholder Claude substitutes at read time, not at build time. This keeps the catalog version-agnostic.

## Related decisions

- **Informs:** ADR-002 (JSON source of truth) — the router-index pattern requires a catalog that must be generated deterministically from a structured source.
- **Informs:** ADR-006 (consolidated.json as search index) — the fallback lookup path depends on having an indexed view of all modules.
- **Informs:** ADR-005 (three-skill architecture) — this decision justifies why `opensips-modules` is one skill rather than many, and sets the pattern for how future large-reference skills should be structured.
