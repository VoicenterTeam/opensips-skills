# Milestone 4: Core type rendering

## Goal

Implement the aggregated renderer for the twelve core OpenSIPs document types. At the end of this milestone, `npm run build` produces twelve Markdown reference files at `plugins/opensips/skills/opensips-routing/references/3.6/core/` — one per core document type (variables, functions, operators, statements, route types, transformations, flags, statistics, MI commands, events, async statements, parameters). Each file aggregates all items of its type from the corresponding source JSON, rendered as H2 sections in alphabetical order.

## Why this is sequenced here

Module rendering came first (milestone 3) because it's the harder case. Core rendering is structurally similar but simpler: the same per-element renderers (parameters, functions, pseudo-variables, MI commands, statistics, events) apply, only at H2 level instead of H3, and aggregated into one file per document type instead of one file per item. Most of the implementation in this milestone is **reuse, not new code** — the markdown-builders library, the slug helper, the validation infrastructure, and even the per-element renderers from milestone 3 all carry over.

What's new in this milestone is the aggregation pattern (one source file → one Markdown file with N items as sections), the heading-level shift (H2 for items instead of H3), and four core-only document types that don't appear in modules (operators, statements, route types, flags, transformations).

Core rendering also serves as a stress test for the per-element renderers from milestone 3. If `renderParameter` produces correct output at H3 inside a module, it should produce correct output at H2 inside `parameters.md` with only the heading level changing. Any divergence reveals an unstated assumption in milestone 3's design that needs fixing.

## Tasks

### Task 4.1: Adapt the per-element renderers for heading-level shift

The per-element renderers in `scripts/render-module/elements.ts` from milestone 3 emit H3 headings. For core rendering, the same elements need to emit H2 headings. Two approaches and a recommendation:

**Approach A: Add a heading-level parameter.** Each renderer takes an optional `headingLevel: 2 | 3 = 3` parameter and uses it for the item heading. Sub-elements (e.g., `**Parameters:**` within a function) stay constant.

**Approach B: Duplicate renderers for the core case.** Create `scripts/render-core/elements.ts` with H2-versions of each renderer.

Approach A is preferred. Duplication doubles maintenance burden — a fix to parameter rendering would need to land in two files. The parameter is small and explicit; the type system enforces correctness.

Refactor each per-element renderer in `scripts/render-module/elements.ts` to accept an optional heading-level parameter. Module rendering (milestone 3) keeps its current behavior (level 3 by default); core rendering passes level 2.

Acceptance: Existing milestone 3 tests still pass with no input changes. New tests verify the heading-level parameter produces correct output at level 2.

### Task 4.2: Implement core-specific element renderers

The four document types not present in modules need their own rendering functions in `scripts/render-core/elements.ts`:

**`renderOperator(op: OperatorDocument): string`** per rendering-templates §3.2.3:
- H2 heading: ``## `+` (addition)`` (operator symbol in backticks, descriptive name in parentheses).
- Prose description.
- Property list (operand type, applicable to, precedence, associativity).
- Example with `opensips`-fenced code.

**`renderStatement(stmt: StatementDocument): string`** per §3.2.3:
- H2 heading: ``## `if` ``.
- Prose description.
- `**Syntax:**` block with untagged code fence (per §4.1, syntax templates use untagged fences).
- `**Usable from:**` line.
- Example.

**`renderRouteBlock(route: RouteDocument): string`** per §3.2.3:
- H2 heading: ``## `request_route` ``.
- Prose description.
- Property list (trigger, can-call-routes).
- `**Available variables:**` line.
- `**Available functions:**` line.
- `**Syntax:**` block.
- Example.

**`renderTransformation(transform: TransformationDocument): string`** per §3.2.3:
- H2 heading: ``## `s.len` ``.
- Prose description.
- Property list (class, input, output, chainable).
- `**Syntax:**` block.
- Example.

**`renderFlag(flag: FlagDocument): string`** per §3.2.3 — slightly different shape because flags come in three types (Message, Branch, Script), each with its own functions:
- H2 heading: ``## Message Flags`` (the type name).
- Prose description.
- Property list (persistence, max flags).
- `**Functions:**` block as a bulleted list of `setflag(flag)`, `resetflag(flag)`, `isflagset(flag)` etc.
- Example.

Each function follows the same separation-of-concerns rule as milestone 3: composes through the markdown-builders library; doesn't emit raw Markdown directly; sorts items alphabetically by name where applicable; omits empty optional sections.

Acceptance: Unit tests for each function with minimal and maximal fixtures.

### Task 4.3: Implement the core renderer

Create `scripts/render-core/index.ts` exporting:

- `renderCoreDocument(documents: CoreDocument[], docType: CoreDocType, version: string, generatorVersion: string): string` — produces the complete Markdown for one core file.

The function:

1. Composes the file-level skeleton: H1 (named per the docType's `H1 title` from rendering-templates §3.2 table), provenance comment, lead paragraph (synthesized from a docType-specific template), TOC.
2. Sorts the documents alphabetically by `name`.
3. Renders each document as an H2 section by dispatching to the right element renderer (the H2-mode versions from Task 4.1, or the core-only renderers from Task 4.2).
4. Returns the complete file content as a string. Does not write to disk.

The dispatch table maps doc types to renderers:

```typescript
const dispatchTable: Record<CoreDocType, ElementRenderer> = {
  core_variable: renderPseudoVariableAtH2,
  core_function: renderFunctionAtH2,
  core_parameter: renderParameterAtH2,
  operator: renderOperator,
  statement: renderStatement,
  route_type: renderRouteBlock,
  transformation: renderTransformation,
  async_statement: renderStatement,  // shape is statement-like
  mi_command: renderMICommandAtH2,
  event: renderEventAtH2,
  statistic: renderStatisticAtH2,
  flag: renderFlag,
};
```

Each entry in the dispatch table is one line. Adding a new core doc type in the future means adding one row, not duplicating logic.

Acceptance: A unit test calls `renderCoreDocument` with a `CoreVariableDocument[]` containing 3 variables and asserts the output has correct H1, provenance, TOC with 3 entries, and 3 H2 sections in alphabetical order.

### Task 4.4: Implement the lead-paragraph generator

Each core file has a "When to read this file" lead paragraph (per rendering-templates §2.3). For modules, the source JSON has fields the generator can pull from. For core types, the lead paragraph is more uniform — there's no per-instance customization.

Create `scripts/render-core/lead-paragraphs.ts` with hard-coded lead text per doc type:

```typescript
const leadParagraphs: Record<CoreDocType, (version: string) => string> = {
  core_variable: (v) => `Reference for OpenSIPs core pseudo-variables in version ${v}. Read this file when constructing route scripts that need to inspect or manipulate SIP message fields, transaction state, or runtime context.`,
  core_function: (v) => `Reference for OpenSIPs core script functions in version ${v}. Read this file when looking up the signature, return values, or available-in context for any built-in function not exported by a specific module.`,
  // ... one per docType
};
```

This is hand-written content, not generated from source. It's small (one or two sentences each, twelve docTypes total) and stable across versions. Treat it as part of the renderer, not a per-version artifact.

Acceptance: All twelve docTypes have a lead paragraph defined. Each is one or two sentences and ends with a clear "read this file when..." trigger.

### Task 4.5: Update output validation for core files

The validation rules from `rendering-templates.md` §10 apply to core files with one adjustment: items are H2 (not H3), so the heading-skip rule needs to allow H1 → H2 → optional H4 patterns within the per-element bodies (e.g., functions sometimes have H4 sub-sections for parameters).

Update `scripts/render-module/validate-output.ts` to accept a `topLevelHeading: 2 | 3` parameter and adjust its expectations accordingly. Or alternatively, factor the validation logic into a shared library at `scripts/lib/validate-markdown.ts` that both the module and core renderers can use.

The shared-library approach is preferred because the validation rules are identical except for the level shift. Move validation to `scripts/lib/validate-markdown.ts` exporting `validateRenderedMarkdown(content, opts)` where `opts` includes `topLevelItemHeading: 2 | 3`.

Acceptance: All milestone 3 tests still pass. New tests verify validation works correctly for core files (item-level H2, parameter sub-lists at H3).

### Task 4.6: Wire the core renderer into the orchestrator

Update `scripts/build-references.ts` to call core rendering after module rendering for each version:

```typescript
async function processVersion(version: string, opts: BuildOptions): Promise<VersionResult> {
  // ... validation (existing)
  // ... module rendering (existing)

  // New: core rendering
  const coreFiles = await renderCoreForVersion(version, validatedDocuments, opts);

  // ... index building (stub, milestone 5)
  // ... summary
}
```

`renderCoreForVersion` iterates the twelve core doc types, finds the corresponding source file in `source/{version}/core/`, calls `renderCoreDocument`, validates the output, writes atomically.

The output filename mapping is as specified in `rendering-templates.md` §3.2 (note the underscore→hyphen normalization):

```typescript
const coreFileNames: Record<CoreDocType, string> = {
  core_variable: "variables.md",
  core_function: "functions.md",
  core_parameter: "parameters.md",
  operator: "operators.md",
  statement: "statements.md",
  route_type: "routes.md",
  transformation: "transformations.md",
  async_statement: "async.md",
  mi_command: "mi-commands.md",
  event: "events.md",
  statistic: "statistics.md",
  flag: "flags.md",
};
```

Files are written to `plugins/opensips/skills/opensips-routing/references/{version}/core/{filename}`. Note the path: core files live in `opensips-routing`, not `opensips-modules` (per the architecture decision that core syntax belongs to the routing skill).

Acceptance: `npm run build --dry-run` reports the correct count of core files. `npm run build` produces actual files at the correct paths.

### Task 4.7: Verify against real source data

Run the full build:

```bash
npm run build --only 3.6 --verbose
```

Twelve core files should appear under `plugins/opensips/skills/opensips-routing/references/3.6/core/`. Open each one and verify:

1. The H1 matches the canonical title from `rendering-templates.md` §3.2 table.
2. The Contents TOC lists every H2 section.
3. Items appear in alphabetical order.
4. Every code block has a language tag (or untagged for syntax templates).
5. No empty sections.
6. The provenance comment block is correct.

Pick one specific spot-check that exercises content fidelity: open `variables.md` and pick three pseudo-variables you can also find in upstream OpenSIPs documentation. Confirm the rendered description matches the upstream description (modulo formatting).

Run the build-twice-and-diff check:

```bash
npm run build --only 3.6
mv plugins/opensips/skills/opensips-routing/references/3.6/core /tmp/core1
npm run build --only 3.6
diff -r /tmp/core1 plugins/opensips/skills/opensips-routing/references/3.6/core
```

Diff must be empty.

Commit the generated files.

Acceptance: All twelve core files generate cleanly. Manual inspection confirms structure and content fidelity. Build-twice diff is empty. Generated files are committed.

## Acceptance criteria

The milestone is done when all of the following are true:

- The per-element renderers from milestone 3 are refactored to accept a heading-level parameter; existing module tests still pass.
- The five core-only renderers (operator, statement, route block, transformation, flag) are implemented and tested.
- The core renderer (`scripts/render-core/index.ts`) composes elements into complete aggregated files.
- Lead paragraphs for all twelve core doc types are defined and contain "read this file when..." triggers.
- Output validation works for both module (H3) and core (H2) files via a shared library.
- The orchestrator integrates core rendering with proper error handling and dry-run support.
- Running the full build produces twelve core `.md` files at the correct paths.
- Manual inspection confirms structure and content fidelity against upstream OpenSIPs documentation.
- Build-twice produces byte-identical output.
- Generated files are committed.
- Unit tests pass; ESLint passes; JSDoc complete.

When all of these are true, milestone 4 is complete. Milestone 5 (consolidated index) can begin.

## Risks and watch-outs

**The dispatch table growing fragile.** A `Record<CoreDocType, ElementRenderer>` map is concise but sensitive to type drift. If `CoreDocType` adds a new value (new doc type from upstream) without a corresponding renderer added to the table, TypeScript will catch it at compile time only if the dispatch lookup is exhaustive. Use `satisfies Record<...>` or a wrapper that asserts exhaustiveness via a `never` check. This catches missing renderers at compile time, not at runtime when a user prompt hits the gap.

**Heading-level parameter forgotten somewhere.** Refactoring eight per-element renderers to accept an optional heading level is mechanical but easy to skip on one of them. The result is a parameter rendered as H3 inside a core file (where it should be H3 within an H2 — wrong) or vice versa. Run unit tests for both heading levels on every renderer; don't trust manual review.

**Core types with no module analog have less prior art.** The five core-only renderers (operators, statements, route blocks, transformations, flags) don't get the same battle-testing module renderers received in milestone 3. Pay extra attention to their fixtures and edge cases. Operators in particular have unusual heading content (operator symbols in backticks) that may surface escaping issues.

**Flags shape is unusual.** Flags come in three types (Message, Branch, Script) with shared structure but distinct rendering. The source JSON likely has them as three top-level entries in `flags.json`, each with its own properties and function list. Verify the source shape before writing the renderer; the rendering-templates spec describes the output but the source structure is the upstream extraction project's call.

**Lead paragraph staleness.** The hand-written lead paragraphs (Task 4.4) are small and stable, but they're hard-coded in the renderer. If OpenSIPs core semantics change (e.g., a new route block type that shifts what the file covers), the lead paragraph needs updating. Add a comment in the file noting that these are hand-written and need maintenance review per release.

**Filename normalization inconsistency.** The mapping `mi_commands.json` → `mi-commands.md` (underscore → hyphen in output) is per the rendering templates spec. Easy to forget for the contributor's first pass and produce `mi_commands.md` instead. Add a unit test on the filename mapping table.

**The "core files belong to opensips-routing" surprise.** Contributors might expect core files to live alongside module files in `opensips-modules`. They don't — core syntax is part of the routing skill's domain (per `rendering-templates.md` §3.2). The orchestrator path construction needs to use `opensips-routing` for core files. A wrong path here ships generated files under the wrong skill, which Claude won't find at runtime.

**Per-element renderer regressions for module rendering.** Refactoring the per-element renderers to accept a heading-level parameter could subtly break their existing behavior at H3. Run the full milestone-3 test suite after Task 4.1 and verify all module fixtures still produce identical output. Diff against the committed module files from milestone 3.

## Parallelization notes

Task 4.1 (heading-level refactor) blocks Tasks 4.2 and 4.3. Tasks 4.2 (core-only renderers) and 4.4 (lead paragraphs) are independent and can be done in parallel. Task 4.3 (core renderer) depends on 4.1, 4.2, and 4.4. Task 4.5 (validation update) is independent of the renderer work and can be done at any point after milestone 3. Tasks 4.6 (orchestrator integration) and 4.7 (real-data verification) close out the milestone.

For two-person work, one person handles 4.1 and 4.5 (refactoring tasks) while the other handles 4.2 and 4.4 (new content). They meet at 4.3.

For solo work, the natural flow is 4.1 → 4.2 (one core-only renderer at a time, testing each) → 4.4 → 4.3 → 4.5 → 4.6 → 4.7.

## Cross-references

- Core rendering specification: `docs/architecture/rendering-templates.md` §3.2.
- Core-only document types: `docs/architecture/rendering-templates.md` §3.2.3.
- File naming map: `docs/architecture/rendering-templates.md` §3.2 table.
- Output validation rules: `docs/architecture/rendering-templates.md` §10.
- Pipeline integration: `docs/architecture/data-pipeline.md` §2.4.
- Why core lives under opensips-routing: `docs/architecture/adr/005-three-skill-architecture.md`.

---

*Next milestone: `05-consolidated-index.md`.*
