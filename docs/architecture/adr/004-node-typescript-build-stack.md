# ADR-004: Node / TypeScript build stack with mandatory JSDoc

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** Build tooling choice and code style conventions

---

## Context

The plugin needs a build script that reads JSON from `source/{version}/`, validates it against Zod schemas, renders Markdown reference files, and produces a consolidated search index. The build is the operational heart of the project — every time the extraction project updates its output, this build runs, and any bug in it propagates into the reference files Claude reads.

Two practical facts shape the stack decision:

1. **The upstream extraction project is already TypeScript with Zod.** Its schemas are authored as Zod definitions with `.describe()` annotations and `z.strict()` enforcement. Any other stack choice in this project would mean rewriting those schemas in a different language and accepting permanent schema drift between the two repositories.

2. **The build runs locally on developer machines and in CI.** It does not run on the user's machine at install time (per ADR-002, the generated output is committed). This means the stack choice affects contributors, not end users — an end user installs the plugin through Claude Code's marketplace and never runs the build.

Beyond the stack itself, there's a second question: what coding conventions does this project adopt to stay maintainable as it grows from solo development to open-source contributions? A TypeScript codebase with no discipline rots the same way a JavaScript codebase does. A TypeScript codebase with `any` sprinkled through it, or with undocumented functions whose purpose is "obvious" only to the author, becomes unwelcoming to contributors six months from now.

## Decision

**Node.js (LTS) with TypeScript for the build stack. Zod for schema validation. JSDoc on every exported function, with strict TypeScript settings that treat shortcuts as errors rather than conveniences.**

Specifically:

1. **Runtime:** Node.js LTS (currently 20.x; moves with the LTS track).
2. **Language:** TypeScript, compiled via `tsc`. No Babel, no esbuild-only pipeline — `tsc` is slower but gives authoritative type checking.
3. **Schema validation:** Zod, with schemas copied from the extraction project into `scripts/schemas/` (per ADR-002). A CI check compares them and fails on drift.
4. **Compiler settings:** `strict: true`, `noImplicitAny: true`, `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`, `noUncheckedIndexedAccess: true`. The codebase treats these as protections, not obstacles.
5. **JSDoc:** Every exported function, class, and type alias has a JSDoc block. Every parameter is documented. Every return value is documented. Non-obvious behavior gets an `@example`. Internal helpers can skip JSDoc if they're genuinely obvious, but "obvious to me today" is rarely "obvious to a contributor in 2027."
6. **Module system:** ESM (`"type": "module"` in `package.json`). Node's ESM support is mature; CJS is legacy.
7. **Testing:** Vitest. Chosen over Jest because it's faster, has native ESM support, and requires less configuration.
8. **Formatting:** Prettier with project defaults. No bikeshedding.
9. **Linting:** ESLint with `@typescript-eslint/recommended-type-checked`. Enforced in CI.

### What a well-documented function looks like in this project

The code below is the reference style. New build-script code should look like this. Old build-script code that doesn't should be brought into line opportunistically, not in a sweeping rewrite.

```typescript
/**
 * Renders a single OpenSIPs module's JSON representation into a Markdown
 * reference file, matching the canonical template documented in
 * `docs/architecture/rendering-templates.md`.
 *
 * This is the per-item renderer for modules (the "heavy" doc type in our
 * pipeline). Core doc types like variables and operators use the
 * aggregated renderer instead — see `renderCoreDocument`.
 *
 * The function is deterministic: given the same input, it produces
 * byte-identical output. Ordering of parameters, functions, and pseudo-
 * variables within the output is alphabetical by name, not source-JSON
 * order. This matters because the upstream extraction pipeline does not
 * guarantee stable ordering, and we want `git diff` on regenerated files
 * to be meaningful.
 *
 * @param module - The validated ModuleDocument object from the source JSON.
 *   Must have already been parsed through `ModuleDocumentSchema.parse()`
 *   before reaching this function; we do not re-validate here.
 * @param version - The OpenSIPs version this module belongs to (e.g., "3.6").
 *   Used in the generated frontmatter and for version-specific rendering
 *   decisions, not for cross-version logic (see ADR-003).
 * @returns The rendered Markdown content as a string. The caller is
 *   responsible for writing it to disk; this function does not touch
 *   the filesystem.
 * @throws {RenderError} If required fields are malformed in a way that
 *   Zod validation missed (rare, but possible for semantic issues like
 *   a function listed as callable from route blocks that don't exist).
 *
 * @example
 * ```ts
 * const tm = ModuleDocumentSchema.parse(
 *   await readFile("source/3.6/modules/tm.json", "utf-8").then(JSON.parse)
 * );
 * const markdown = renderModule(tm, "3.6");
 * await writeFile("plugins/opensips/skills/opensips-modules/references/3.6/modules/tm.md", markdown);
 * ```
 */
export function renderModule(
  module: ModuleDocument,
  version: Version,
): string {
  // implementation
}
```

Note the shape of this JSDoc:

- The first sentence states what the function does, not how.
- The second paragraph explains the function's role in the larger system — why this function exists, not just what it's called.
- `@param` entries include both the type (for the reader) and the contract (what must be true for the input, what the function does with it).
- The `@returns` describes the return value and clarifies responsibilities — in this case, that the function does not write to disk.
- `@throws` documents the failure mode and when it happens.
- `@example` shows a realistic invocation with enough context to be copy-pasted.

We prefer JSDoc blocks that read like a letter to a future contributor who has just been pointed at this function and needs to understand it without reading the rest of the codebase. That's the mental model. If you find yourself writing "self-explanatory," stop and explain it anyway.

### Project structure conventions

```
scripts/
├── build-references.ts         # Main entry — orchestrator, no rendering logic
├── render-module.ts            # Per-item renderer
├── render-core.ts              # Aggregated renderer
├── build-consolidated.ts       # Index builder
├── schemas/                    # Zod schemas mirrored from extraction project
│   ├── base.ts
│   ├── module.ts
│   └── ...
├── lib/                        # Shared utilities (file I/O, frontmatter, etc.)
│   ├── frontmatter.ts
│   ├── fs-helpers.ts
│   └── markdown-builders.ts
└── types/                      # Type definitions that aren't Zod-derived
    └── render-context.ts
```

- One file per top-level responsibility. `render-module.ts` does not import from `render-core.ts`; both import from `lib/`.
- `build-references.ts` is the orchestrator and contains no rendering logic. If a rendering change requires editing the orchestrator, it's probably a sign that rendering logic has leaked into orchestration.
- `scripts/schemas/` is a mirror of the extraction project. Changes here must match upstream changes; a CI check enforces this.

## Alternatives considered

- **Python with Pydantic.** The language I'd pick if this project existed in isolation. Pydantic plays the role Zod plays in TypeScript; the ecosystem for Markdown rendering is mature.
  - Tempting because Python is widely known in the SIP/VoIP community, and the ecosystem has more than enough for this task.
  - Rejected because the extraction project is TypeScript with Zod. Adopting Python here would mean re-authoring all schemas, maintaining two schema definitions in two languages, and accepting permanent drift risk between them. The cost of schema duplication outweighs the benefit of language familiarity.

- **Deno.** TypeScript-native runtime with first-class Zod support and no `package.json` complexity.
  - Tempting because it eliminates Node-ecosystem friction (no `tsconfig.json` dance, no `npm install` for dev dependencies, built-in formatter and test runner).
  - Rejected because the contributor pool for an OpenSIPs-adjacent project is vanishingly unlikely to have Deno installed, while Node is almost universal. We're optimizing for "contributor already has the runtime" over "the runtime is objectively nicer."

- **Bun.** Same pitch as Deno but with better Node compatibility.
  - Rejected for the same reason, with an additional concern: Bun's ecosystem maturity and release cadence are still stabilizing. This project is long-lived and boring by design; choosing a fast-moving runtime trades long-term stability for short-term developer experience.

- **TypeScript without JSDoc.** Rely on types alone for documentation.
  - Tempting because types are "self-documenting" in the colloquial sense.
  - Rejected because types describe what, not why. A function signature `renderModule(module: ModuleDocument, version: Version): string` tells you the shape; it does not tell you that the function is deterministic, that it does not touch the filesystem, or that ordering is alphabetical by design. Contributors encountering this function for the first time need the why, and they need it in the place they're already looking — right above the function, not scattered across architecture docs they may not know exist.

- **JavaScript with JSDoc types instead of TypeScript.** The "TypeScript without the build step" approach.
  - Rejected because the compiler catches real bugs. `noUncheckedIndexedAccess` alone has caught enough "this array element might be undefined" mistakes in similar projects that giving up the compiler is too high a cost.

## Consequences

**Positive:**

- Schema definitions are written once (in the extraction project) and reused here with a copy + CI check rather than a manual rewrite. Drift is detectable, not silent.
- The combination of strict TypeScript and mandatory JSDoc means the build script is both type-safe at compile time and legible to contributors who are not familiar with the codebase. Both matter for a project that will outlive the first author.
- Vitest + TypeScript + ESM is a modern baseline that will not feel dated in three years. This is deliberate; the build is the project's longest-lived artifact and needs to age well.
- `@example` blocks in JSDoc double as documentation for the test suite. If the example in the JSDoc is not a working test, the JSDoc is wrong.

**Negative:**

- Contributors who prefer Python must learn enough TypeScript to be productive. For a typo fix this is negligible; for a meaningful contribution to the build logic it's a real onboarding cost. Mitigated by the project size — the build script is a few hundred lines, not a framework.
- The JSDoc requirement adds authoring overhead. A new function takes 5–10 minutes longer to write than it would without the block. This cost is accepted as an investment in maintainability; the alternative is code whose purpose is re-derived by every future reader.
- Schema drift between this project and the extraction project is a permanent maintenance concern. The CI check catches it, but someone has to resolve the failures when they happen, which means someone is always responsible for knowing both projects' schema conventions.

**Neutral:**

- Prettier eliminates formatting arguments but introduces the overhead of running the formatter. This is a net win and worth naming because projects often debate it.
- Strict TypeScript settings occasionally flag code that is correct but hard for the compiler to verify. The convention is to fix the code rather than add `@ts-ignore`; if the code genuinely cannot be expressed in a type-safe way, that's a sign the design needs rethinking, not that the compiler needs silencing.

## Implementation notes

- `tsconfig.json` should extend `@tsconfig/node20/tsconfig.json` (or the current LTS variant) rather than hand-rolling compiler settings. Keeps us aligned with community conventions.
- `package.json` should declare `"engines": { "node": ">=20.0.0" }` so a contributor on an old Node version gets a clear error rather than mysterious failures.
- The ESLint config should include `eslint-plugin-jsdoc` with rules requiring `@param`, `@returns`, and matching parameter names. This turns the JSDoc convention into an automated check rather than a review-time discipline.
- Running tests with `vitest --run --coverage` in CI is the default; coverage thresholds are soft initially and should be tightened as the test suite matures.
- The build script's entry point (`build-references.ts`) should accept `--version` and `--dry-run` flags from the start, even if they're not strictly needed for v1. Once the script has users, adding flags becomes harder.

## Related decisions

- **Depends on:** ADR-002 (JSON source of truth) — the choice of Node/TypeScript is specifically to align with the upstream extraction project's Zod schemas, which only matters because source JSON validation is central to the build.
- **Informs:** Future tooling decisions (testing frameworks, CI platforms, publishing workflows) should default to "whatever is most idiomatic in the Node/TypeScript ecosystem" unless there's a specific reason to deviate.
- **Related to:** ADR-006 (consolidated.json as search index) — the consolidated index is built by this same stack, and the same JSDoc discipline applies to whatever function constructs it.
