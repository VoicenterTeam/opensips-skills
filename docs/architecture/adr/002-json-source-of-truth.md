# ADR-002: JSON as source of truth, Markdown as build artifact

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** Architecture for reference file generation

---

## Context

The plugin needs to give Claude access to detailed documentation for ~100 OpenSIPs modules plus 12 categories of core documentation (variables, functions, operators, statements, route types, etc.), across multiple OpenSIPs versions.

Two facts shape the decision:

1. **Claude reads Markdown at runtime.** Skills load reference files into context via the Read tool. Markdown is the native format — it survives context windows well, it renders in human-readable form for review, and the Read tool was designed for it.

2. **An upstream extraction project already produces structured JSON.** A separate repository, `opensips-docs-collector`, runs an LLM-based extraction pipeline over upstream OpenSIPs documentation and emits per-version JSON files validated against Zod schemas. The extraction project handles the hard parts: parsing upstream HTML, splitting large modules into extraction-friendly sections, merging them back into complete `ModuleDocument` objects, and validating the result.

The question is whether Markdown is the *primary* artifact that contributors edit directly, or a *derived* artifact produced from JSON by a build script. Claude reads Markdown either way; the question is what lives above it in the pipeline.

## Decision

**JSON is the source of truth. Markdown is a build artifact generated from JSON by a deterministic build script.**

The plugin repository consumes JSON from the upstream extraction project (copied into `source/{version}/`), validates it against Zod schemas, and generates Markdown reference files at build time. Both the source JSON and the generated Markdown are committed to the repository so users installing the plugin need no build step.

Contributors do not hand-edit Markdown reference files. Fixes to reference content flow through the extraction project upstream; the plugin's job is faithful transformation.

```
opensips-docs-collector            opensips-skills
────────────────────────          ──────────────────────────
data/processed/{version}/  ──►    source/{version}/
  core/*.json                       ├─ validated by Zod
  modules/*.json                    ├─ rendered by build script
                                    ▼
                                  plugins/opensips/skills/*/references/{version}/
                                    ├─ modules/*.md       (per-item render)
                                    ├─ core/*.md          (aggregated render)
                                    └─ consolidated.json  (search index)
```

Exceptions — the small set of hand-authored Markdown files — are explicitly enumerated: the three `SKILL.md` files, `ser-lineage-notes.md`, and all documentation under `docs/`. Everything under `references/{version}/` is generated.

## Alternatives considered

- **Markdown as source of truth, hand-edited directly.** Contributors edit `.md` files in the repository. No build step.
  - Tempting because it removes the build pipeline and lets casual contributors fix typos through a simple PR.
  - Rejected because it discards the upstream extraction work entirely. Every upstream OpenSIPs change would require a human to re-edit the corresponding Markdown, and there would be no mechanical way to detect drift between what the plugin says and what upstream documents. Schema enforcement across ~100 module files is also impractical without structured source — consistency degrades the moment the third contributor arrives.

- **JSON as source of truth, Markdown generated but not committed.** Ship JSON only; generate Markdown on install.
  - Tempting because it eliminates redundancy in the repository.
  - Rejected because it forces every plugin user to run a build step, which means installing Node.js, installing dependencies, and hoping the build works. For a plugin meant to be installed with one command via Claude Code's marketplace, this is a non-starter. It also breaks diff-based review — reviewers would have to mentally render JSON to understand what changed.

- **Markdown as source of truth with a reverse-parser that keeps JSON in sync.** Accept Markdown PRs; parse them back into JSON at merge time.
  - Tempting because it inverts the friction: contributors edit the readable format, and the structured representation catches up.
  - Rejected because reverse-parsing Markdown is fragile. Any deviation from the expected structure — a missing heading, a reordered section, a bullet list where a table was expected — either silently produces broken JSON or fails the merge. The lower friction for contributors is offset by a higher friction for maintainers debugging parser failures on every PR.

- **RAG over the raw OpenSIPs HTML documentation.** Skip the extraction-to-JSON step entirely; embed the upstream HTML and retrieve by semantic similarity.
  - Tempting because it eliminates the transformation pipeline.
  - Rejected because the documentation is already structured — parameters, functions, pseudo-variables are discrete objects with known shapes. Treating them as unstructured text for vector retrieval throws away that structure. Exact-match lookup on "dispatcher module" is deterministic; semantic similarity would introduce drift and require infrastructure (vector database, embedding model) the plugin can do without.

## Consequences

**Positive:**

- One edit point per module. Fixing a wrong parameter default value in `tm.json` regenerates `tm.md` deterministically. No parallel edits to keep in sync.
- Schema enforcement is free. Zod validation at build time catches any source JSON that drifts from the expected structure before a single Markdown file is rendered.
- Multiple consumers can use the same source. The security-advisor skill wants structured iteration over modules; the module search script wants fast name-based lookup; Claude wants rendered Markdown. All three derive from the same JSON without duplication.
- New rendering modes are cheap. If a future skill wants a different view of module data (e.g., a compact one-page summary per module, or a category-filtered index), it adds a renderer without touching the source.
- CI can enforce consistency. A `git diff --exit-code` after `npm run build` proves the committed output matches the committed source. No "forgot to rebuild" PRs slip through.

**Negative:**

- Contributors who want to fix a typo in a module reference cannot do so directly in the plugin repo. The fix must go to the upstream extraction project, which is a barrier — especially for casual contributors. Mitigation: the CONTRIBUTING guide will document this path explicitly once authored.
- The repository ships two copies of the same information: the JSON under `source/` and the Markdown under `references/`. This is acceptable overhead (both are relatively small, and git handles redundancy well), but it means the repo is larger than it would be otherwise.
- The plugin is tightly coupled to the extraction project's JSON schema. A breaking schema change upstream breaks this project's build until the mirrored schemas in `scripts/schemas/` are updated. This is a real ongoing maintenance tax.

**Neutral:**

- The build script becomes a meaningful artifact of the project, not a throwaway utility. It needs its own tests, its own documentation (`docs/architecture/rendering-templates.md`), and its own stability guarantees.
- The project has a clear contributor split: people who improve extraction contribute upstream; people who improve skill structure, rendering, or guardrails contribute here. Both are legitimate; the division is explicit rather than ambiguous.

## Implementation notes

- Zod schemas in `scripts/schemas/` are copies of the extraction project's schemas, not imports. This keeps the two projects decoupled at the package level while guaranteeing they agree on structure. A CI check should compare them and fail if they diverge.
- The build script must be idempotent. Running `npm run build` twice must produce byte-identical output. This is enforceable as a test: build, save checksums, build again, compare.
- Ordering within generated files (parameters, functions, etc.) is alphabetical by name, not source-JSON order. Source JSON ordering is not guaranteed by the extraction pipeline, so generated output must impose its own stable ordering.
- The decision to commit both source and output trees means PRs that update documentation will have large diffs. Reviewers should develop habits around reading the source diff first and treating the output diff as confirmation.

## Related decisions

- **Depends on:** ADR-001 (router-index pattern) — the router-index requires a deterministic mapping from module names to reference files, which only works reliably with a generated catalog. Hand-edited Markdown would make catalog-to-file consistency a manual discipline.
- **Informs:** ADR-003 (version-isolated folders) — versions are isolated at the JSON source level, which the build script preserves in the generated output. If Markdown were the source, version isolation would become a convention rather than a structural property.
- **Informs:** ADR-004 (Node/TypeScript build stack) — the build stack choice is downstream of committing to JSON source and Zod validation.
- **Informs:** ADR-006 (consolidated.json as search index) — the consolidated index is another derived artifact from the same JSON source.
