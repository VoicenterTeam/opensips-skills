<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Milestone 3: Per-module rendering

## Goal

Implement the per-item renderer for OpenSIPs modules. At the end of this milestone, `npm run build` produces a complete set of Markdown reference files at `plugins/opensips/skills/opensips-modules/references/3.6/modules/`, one per module in `source/3.6/modules/`. Each generated file conforms to the rendering templates specification — correct frontmatter HTML comment, proper section ordering, alphabetical item ordering, no empty sections, atomic writes, byte-stable output.

## Why this is sequenced here

Module rendering is the heaviest and most complex rendering case. Doing it first surfaces every rendering challenge — section ordering, code block conventions, cross-references, length thresholds, empty-section handling — before the (similar but simpler) core rendering case in milestone 4. The lessons from this milestone shape the shared markdown-builder helpers that core rendering will reuse.

This milestone also produces the first artifact that genuinely matters for the project's purpose: real OpenSIPs documentation in a format Claude can consume. After this milestone you can spot-check generated files against upstream OpenSIPs docs and confirm the conversion is correct.

## Tasks

### Task 3.1: Build the markdown-builder library

Create `scripts/lib/markdown-builders.ts` exporting composable helpers that all renderers (this milestone's and milestone 4's) will use:

- `renderH1(title: string): string` — single H1 with trailing blank line.
- `renderH2(title: string): string`, `renderH3(title: string): string`, `renderH4(title: string): string`.
- `renderProvenanceComment(metadata: ProvenanceMetadata): string` — emits the HTML comment block per `rendering-templates.md` §2.2.
- `renderLeadParagraph(text: string): string` — the "When to read this file" paragraph.
- `renderTOC(sections: TocEntry[]): string` — the Contents block with anchor links.
- `renderSection(heading: string, body: string): string` — the empty-omission helper. If `body` is empty or whitespace-only, returns empty string. Otherwise returns `## ${heading}\n\n${body}\n\n`. This is the workhorse that enforces the "no empty sections" rule.
- `renderItalic(text: string): string`, `renderBold(text: string): string` — small wrappers for consistency.
- `renderCodeBlock(content: string, lang?: string): string` — fenced block with optional language tag.
- `renderInlineCode(text: string): string` — backticks.
- `renderBulletList(items: string[]): string` — empty list returns empty string.
- `renderPropertyList(properties: Property[]): string` — bulleted property list (used for pseudo-variable type/scope/availability blocks).

Each function returns a string ending in exactly one trailing newline so concatenation produces clean spacing without manual adjustment. Each has JSDoc per ADR-004 with at least one `@example`.

Acceptance: Unit tests verify (a) `renderSection` correctly omits empty sections, (b) heading helpers produce one trailing blank line, (c) lists with empty arrays produce empty strings, (d) the trailing-newline convention is consistent across all helpers.

### Task 3.2: Build the frontmatter / provenance helper

Create `scripts/lib/frontmatter.ts` exporting:

- `renderProvenance(opts: ProvenanceOptions): string` — produces the HTML comment block from §2.2 of the rendering templates spec.

```typescript
interface ProvenanceOptions {
  generatedFrom: string;       // "source/3.6/modules/tm.json"
  generatorVersion: string;    // "1.0.0"
  opensipsVersion: string;     // "3.6"
  docType: string;             // "module"
}
```

Output:

```html
<!-- generated-from: source/3.6/modules/tm.json
     generator-version: 1.0.0
     opensips-version: 3.6
     doc-type: module -->
```

The function rejects any field containing newlines or `-->` (the comment-terminator sequence) — these would break the HTML comment. JSDoc explains why.

Acceptance: A unit test verifies the output format byte-for-byte. Tests verify input rejection for newlines and comment-terminator sequences.

### Task 3.3: Implement slug normalization

Create `scripts/lib/slug.ts` exporting:

- `slugify(name: string): string` — lowercase, replace non-alphanumeric chars (except `_` and `-`) with `-`, collapse consecutive dashes. Per `data-pipeline.md` §2.3.
- `assertUniqueSlugs(items: { name: string }[]): void` — throws a structured error naming the colliding source files if any two items produce the same slug.

Slugs are used for output filenames. The collision check is hard-failure because filesystem behavior under name collisions is platform-dependent and cannot silently overwrite.

Acceptance: Unit tests cover (a) `uac_auth` → `uac_auth`, (b) `Mi-HTTP` → `mi-http`, (c) `b2b__entities` → `b2b-entities`, (d) collision detection throws with both colliding names in the error message.

### Task 3.4: Implement the per-element renderers

Create `scripts/render-module/elements.ts` with one renderer function per module sub-element. Each takes a typed input from the schema and returns a Markdown string.

Required functions:

- `renderParameter(param: ExportedParameter): string` — H3 heading with `name (type)`, prose description, italicized default, possible-values list, range constraints, examples.
- `renderFunction(fn: ExportedFunction): string` — H3 heading with signature, prose description, parameters list, return codes list, "Usable from:" line, examples, deprecation marker if applicable.
- `renderPseudoVariable(pv: ExportedPseudoVariable): string` — H3 heading with `$name`, prose description, property list (type, R/W, scope, available-in), examples.
- `renderMICommand(mi: ExportedMICommand): string` — H3 heading, prose, parameters, returns, bash-fenced example.
- `renderStatistic(stat: ExportedStatistic): string` — H3 heading, prose, property list (type, reset method).
- `renderEvent(event: ExportedEvent): string` — H3 heading, prose, parameters, "Subscribe via" line.
- `renderConfigExample(example: ConfigurationExample): string` — H3 heading, description, code block, optional explanation.
- `renderDependencies(deps: Dependencies): string` — H2 with two H3 sub-sections (modules, libraries), bulleted lists, "None." for empty.

Each function pulls from the markdown-builder library; none directly emits raw Markdown. This separation is what makes the renderers testable in isolation.

Each function:
- Sorts items alphabetically by name where applicable (e.g., parameter sub-list within a function).
- Omits sub-sections that are empty (no `## Possible values` if the array is empty).
- Uses the ` ```opensips ` language tag for OpenSIPs config code, ` ```bash ` for shell, ` ```text ` for plain output.
- Renders captions as `**Example.** {description}.` — bold "Example", period, space, description, period.

Acceptance: Unit tests for each function. Each test feeds a typed input and asserts the output matches a small inline snapshot. Empty-input tests verify omission behavior.

### Task 3.5: Implement the module renderer

Create `scripts/render-module/index.ts` exporting:

- `renderModule(module: ModuleDocument, version: string, generatorVersion: string): string` — produces the complete Markdown for one module file.

The function:

1. Composes the file-level skeleton from `rendering-templates.md` §2: H1, provenance comment, lead paragraph, TOC.
2. Renders the canonical sections in the fixed order specified in `rendering-templates.md` §3.1: Overview → How It Works (conditional) → Dependencies → Exported Parameters → Exported Functions → Exported Pseudo-Variables → Exported MI Functions → Exported Statistics → Exported Events → Configuration Examples.
3. Within each section, sorts items alphabetically by name and renders them via the per-element functions from Task 3.4.
4. Skips any section whose source data is empty (per `rendering-templates.md` §2.4).
5. Builds the TOC dynamically from the actual sections present.
6. Returns the complete file content as a string. Does not write to disk.

The function is **deterministic** — given the same input, returns byte-identical output. Tested by calling it twice with identical input and asserting equal results.

The function is **side-effect-free** — does not write files, modify globals, or read external state. The orchestrator (Task 3.7) is responsible for filesystem I/O.

Acceptance: A unit test calls `renderModule` with a minimal `ModuleDocument` fixture and asserts the output structure (correct H1, frontmatter comment, section ordering). A second test calls with a maximal fixture (all sections populated) and asserts the file is comprehensive but well under 1200 lines (per the §10 validation rules).

### Task 3.6: Implement output validation

Create `scripts/render-module/validate-output.ts` exporting:

- `validateRenderedMarkdown(content: string, sourcePath: string): ValidationResult` — applies the rules from `rendering-templates.md` §10 to a rendered file.

Checks:
- Exactly one H1.
- No skipped heading levels.
- No H2 with empty body (heading followed only by whitespace before next heading).
- No unclosed code fences.
- No unclosed inline backticks.
- No empty Markdown links.
- No HTML beyond the provenance comment.
- No trailing whitespace.
- No more than two consecutive blank lines.
- Length under 1200 lines (warning at 600, error at 1200 unless the file is a split-target index — which doesn't apply at this milestone).

Each violation produces a `ValidationError` with the specific rule violated. The function returns all violations, not just the first.

Acceptance: Unit tests with deliberately broken inputs verify each rule catches its target violation.

### Task 3.7: Wire the renderer into the orchestrator

Replace the stub `would render N module files` in `scripts/build-references.ts` with the real implementation:

```typescript
async function renderModulesForVersion(
  version: string,
  documents: ModuleDocument[],
  opts: BuildOptions
): Promise<RenderResult> {
  // 1. Validate slug uniqueness across all modules
  assertUniqueSlugs(documents);

  // 2. Sort by slug for stable iteration order
  const sorted = [...documents].sort((a, b) =>
    slugify(a.name).localeCompare(slugify(b.name))
  );

  const written: string[] = [];
  const errors: BuildError[] = [];

  for (const module of sorted) {
    const slug = slugify(module.name);
    const content = renderModule(module, version, GENERATOR_VERSION);

    // Validate output before writing
    const validation = validateRenderedMarkdown(content, `modules/${slug}.json`);
    if (!validation.ok) {
      errors.push(...validation.errors);
      continue;
    }

    if (opts.dryRun) {
      written.push(`would write: modules/${slug}.md (${content.split("\n").length} lines)`);
    } else {
      const outputPath = posixPath(
        opts.outputRoot,
        "opensips-modules",
        "references",
        version,
        "modules",
        `${slug}.md`
      );
      await ensureDirectory(path.dirname(outputPath));
      await atomicWriteFile(outputPath, content);
      written.push(outputPath);
    }
  }

  return { written, errors };
}
```

The orchestrator now calls this function in the right place in `processVersion()`, with proper error handling and output reporting.

Acceptance: `npm run build --dry-run` reports the correct module count and would-write paths. `npm run build` produces actual files at the correct paths.

### Task 3.8: Verify against real source data

Run the full build against the real source slice committed in milestone 1:

```bash
npm run build --only 3.6 --verbose
```

Expected outcome: every module file in `source/3.6/modules/` produces a corresponding `.md` file under `plugins/opensips/skills/opensips-modules/references/3.6/modules/`. Open three or four of the generated files manually and compare against:

1. The rendering templates spec — does the file match the canonical structure?
2. The upstream OpenSIPs documentation for the same module — is the content present and correct?
3. The "what we explicitly do not emit" list in §7 of the rendering templates spec — are there any rule violations (emojis, horizontal rules, empty sections, etc.)?

Run the build twice and `diff -r` the output trees:

```bash
npm run build --only 3.6
mv plugins/opensips/skills/opensips-modules/references/3.6 /tmp/build1
npm run build --only 3.6
diff -r /tmp/build1 plugins/opensips/skills/opensips-modules/references/3.6
```

The diff must be empty. Determinism is non-negotiable.

Commit the generated files. They are part of the repository per `data-pipeline.md` §8.1.

Acceptance: All module files generate cleanly. Manual inspection finds no rule violations. Build-twice diff is empty. Generated files are committed.

## Acceptance criteria

The milestone is done when all of the following are true:

- The markdown-builder library (`scripts/lib/markdown-builders.ts`) provides composable helpers used throughout the renderer.
- The frontmatter helper (`scripts/lib/frontmatter.ts`) emits the canonical HTML comment block.
- Slug normalization (`scripts/lib/slug.ts`) handles all documented cases, including collision detection.
- Per-element renderers exist for all eight module sub-element types (parameters, functions, pseudo-variables, MI commands, statistics, events, config examples, dependencies).
- The module renderer (`scripts/render-module/index.ts`) composes elements into complete Markdown files following the canonical section order.
- Output validation (`scripts/render-module/validate-output.ts`) catches rule violations before files are written.
- The orchestrator integrates the renderer with proper error handling and dry-run support.
- Running the full build against `source/3.6/modules/` produces correctly-structured `.md` files for every module.
- Manual inspection of three to four generated files against upstream OpenSIPs docs confirms content fidelity.
- Build-twice produces byte-identical output (deterministic).
- Generated files are committed to the repo.
- Unit tests pass for all new modules; ESLint passes; JSDoc complete per ADR-004.

When all of these are true, milestone 3 is complete. Milestone 4 (core rendering) can begin and may proceed in parallel with milestone 5 (consolidated index) once 4 is underway.

## Risks and watch-outs

**The renderer becoming monolithic.** It's tempting to write `renderModule` as one 500-line function. Don't. The per-element renderers (Task 3.4) keep individual concerns testable; `renderModule` stays a composition of those calls. If you find yourself writing more than 20 lines without delegating to a helper, stop and extract.

**Source data inconsistencies.** Real extraction output will have edge cases the schema permits but didn't anticipate — a module whose `overview` is a single sentence instead of paragraphs, a function whose `signature` includes unusual characters, a parameter with a malformed default value. The renderer must produce reasonable output for all schema-valid inputs. When you hit an edge case, the right fix is usually in the renderer (handle the edge case gracefully), not in the source (which would require an upstream change).

**Newline accounting.** Markdown is sensitive to blank-line counts between sections. Two newlines separate sections; three or more is a Markdown convention violation that some renderers handle inconsistently. Stick to the convention: every helper returns a single trailing newline; the markdown-builder layer handles double-newline insertion at section boundaries.

**Code block language tags.** The `opensips` language tag is non-standard but harmless. Some Markdown renderers warn or fail on unknown tags. The rendering templates spec calls it forward-compatible; if a contributor's renderer breaks on it, document the workaround (use plain ` ``` `) but don't change the project default.

**Sorting subtleties.** Alphabetical sorting in JavaScript's `localeCompare` is locale-dependent. Even with `LANG=C`, edge cases involving Unicode punctuation or numerics within names can produce surprising orders. Use `.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base", numeric: true }))` for predictable cross-platform behavior.

**Inline code in headings.** OpenSIPs functions have backtick-wrapped names in H3 headings (`### \`t_relay([flags])\``). GitHub renders these correctly, but some Markdown processors strip backticks from heading content for anchor generation. Anchor links to these headings might break. The rendering templates spec uses prose+filename cross-references precisely to avoid this; adhere to that.

**Disk-write race conditions.** If the orchestrator parallelizes module writes (across modules, not within), atomic writes prevent corrupt files. But two parallel writes to the *same* file (which shouldn't happen but might from a bug) are still a race. The slug-uniqueness check in Task 3.7 prevents this; don't relax it.

**Length thresholds without splitting yet.** This milestone produces single-file modules. The rendering templates spec's §6 splitting rules apply when a module exceeds 800 lines. At this milestone, defer the split implementation — emit a warning if a module's output exceeds 800 lines but ship the single file. Splitting becomes a follow-up milestone if it's actually needed (it likely won't be for v1).

## Parallelization notes

Tasks 3.1, 3.2, 3.3 are foundation libraries and can be done in parallel. Task 3.4 (per-element renderers) depends on 3.1 and benefits from 3.2 being done. Task 3.5 (module renderer) depends on 3.4. Task 3.6 (validation) is independent of 3.5 and can be done in parallel with it. Task 3.7 (orchestrator integration) depends on 3.5 and 3.6. Task 3.8 (real-data verification) is the closing action.

For two-person work, one person handles the foundation libraries (3.1, 3.2, 3.3) while the other plans the per-element renderers (3.4). They meet at 3.5.

For solo work, the natural pairing is 3.1 + 3.2 (related), then 3.3 (small), then 3.4 (one element type at a time, testing each), then 3.5, then 3.6, then 3.7, then 3.8.

## Cross-references

- Rendering templates: `docs/architecture/rendering-templates.md` — the entire document is relevant; §3.1 specifies module rendering.
- Per-element formats: `docs/architecture/rendering-templates.md` §3.1.4 (parameters), §3.1.5 (functions), §3.1.6 (PVs), §3.1.7 (MI), §3.1.8 (stats), §3.1.9 (events), §3.1.10 (examples).
- Code block conventions: `docs/architecture/rendering-templates.md` §4.
- Cross-references: `docs/architecture/rendering-templates.md` §5.
- Length thresholds: `docs/architecture/rendering-templates.md` §6.
- Validation rules: `docs/architecture/rendering-templates.md` §10.
- What not to emit: `docs/architecture/rendering-templates.md` §7.
- Pipeline integration: `docs/architecture/data-pipeline.md` §2.3.

---

*Next milestone: `04-core-type-rendering.md`.*
