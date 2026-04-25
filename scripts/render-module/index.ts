/**
 * Module-level composer that turns a {@link ModuleDocument} into a complete
 * Markdown reference file.
 *
 * The composer is the topmost layer of the per-module render pipeline. It
 * orchestrates the per-element renderers (`parameter`, `function`,
 * `pseudo-variable`, `mi-command`, `statistic`, `event`, `config-example`,
 * `dependencies`) plus the file-level skeleton helpers (H1, provenance
 * comment, lead paragraph, TOC) into the canonical layout specified by
 * `docs/architecture/rendering-templates.md` §2 and §3.1.
 *
 * Two correctness contracts:
 *
 *   - **Deterministic.** The same input always produces byte-identical
 *     output. This underpins the build pipeline's "build twice, diff is
 *     empty" requirement (see `data-pipeline.md` §8.1).
 *   - **Side-effect-free.** No filesystem access, no globals, no clocks.
 *     The orchestrator (`scripts/build-references.ts`) owns all I/O.
 *
 * Section ordering and conditional emission rules are documented inline at
 * the call sites; the canonical list is repeated in
 * `rendering-templates.md` §3.1.
 */

import type { ModuleDocument } from "../schemas/modules.schema.js";
import type {
  ConfigExample,
  Event,
  MIFunction,
  ModuleFunction,
  ModuleParameter,
  PseudoVariable,
  Statistic,
} from "../schemas/module-sections.schema.js";
import {
  renderH1,
  renderLeadParagraph,
  renderSection,
  renderTOC,
  toAnchor,
  type TocEntry,
} from "../lib/markdown-builders.js";
import { renderProvenance } from "../lib/frontmatter.js";
import { slugify } from "../lib/slug.js";
import { renderParameter } from "./elements/parameter.js";
import { renderFunction } from "./elements/function.js";
import { renderPseudoVariable } from "./elements/pseudo-variable.js";
import { renderMICommand } from "./elements/mi-command.js";
import { renderStatistic } from "./elements/statistic.js";
import { renderEvent } from "./elements/event.js";
import { renderConfigExample } from "./elements/config-example.js";
import { renderDependencies } from "./elements/dependencies.js";

/**
 * Section heading constants. Centralised so the TOC builder and the body
 * builder reference exactly the same strings (one source of truth for
 * heading text → anchor derivation).
 */
const SECTION_OVERVIEW = "Overview";
const SECTION_HOW_IT_WORKS = "How It Works";
const SECTION_DEPENDENCIES = "Dependencies";
const SECTION_EXPORTED_PARAMETERS = "Exported Parameters";
const SECTION_EXPORTED_FUNCTIONS = "Exported Functions";
const SECTION_EXPORTED_PSEUDO_VARIABLES = "Exported Pseudo-Variables";
const SECTION_EXPORTED_MI_FUNCTIONS = "Exported MI Functions";
const SECTION_EXPORTED_STATISTICS = "Exported Statistics";
const SECTION_EXPORTED_EVENTS = "Exported Events";
const SECTION_CONFIGURATION_EXAMPLES = "Configuration Examples";

/**
 * Sort an array of named items alphabetically by `name`, returning a fresh
 * array so the caller's input is not mutated. Comparison uses the default
 * locale-agnostic `<` / `>` ordering for stable cross-platform results.
 * @param items - Array of objects each carrying a `name` field.
 * @returns A new array sorted by `name`.
 */
function alphabetizeByName<T extends { name: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/**
 * True when the supplied `how_it_works` source field carries content worth
 * rendering. Per the spec, the section is conditional on a non-empty
 * source: undefined, null, empty string, and whitespace-only strings all
 * suppress the section.
 * @param value - The raw `how_it_works` field from the source.
 * @returns Whether to emit the How It Works section.
 */
function hasContent(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Rebase the heading depths inside a body string so they nest under the
 * wrapping `## H2` section the composer is about to emit.
 *
 * Some upstream `overview` and `how_it_works` fields begin with their own
 * heading prefix (DocBook-derived `## 1.5. Server specifications` or
 * `#### 1.1.4.1. Destination`). Emitting them verbatim under our wrapping
 * `## How It Works` produces structural drift: a sibling H2 immediately
 * after our heading makes the wrapper visually empty (validation rule
 * `no-empty-h2`) and, lower down, breaks the H2 -> H3 -> H4 hierarchy.
 *
 * The rebase is purely structural: heading text is unchanged; only the
 * `#` count is shifted so the deepest emitted heading still respects
 * the H1 -> H2 -> ... -> H6 ceiling. We never deepen an H6, never alter
 * fenced-code-block lines (those `# comments` are not headings), and we
 * preserve the relative depth structure of the upstream content.
 * @param body - Raw body text from an upstream JSON field.
 * @param wrappingDepth - Depth of the wrapping section (typically `2` for
 *   the `## How It Works` and `## Overview` cases).
 * @returns The rebased body — same length, headings shifted to nest
 *   strictly under the wrapping depth.
 */
function rebaseHeadingDepths(body: string, wrappingDepth: number): string {
  const lines = body.split("\n");
  // First pass: locate fenced regions so we don't mis-classify `# comment`
  // lines inside code blocks as headings.
  const insideFence = new Array<boolean>(lines.length).fill(false);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^ {0,3}```/.test(lines[i] ?? "")) {
      insideFence[i] = true;
      inFence = !inFence;
      continue;
    }
    insideFence[i] = inFence;
  }
  // Find the smallest heading depth in the body. If it's already strictly
  // greater than `wrappingDepth`, no rebase is needed.
  let minDepth: number | null = null;
  for (let i = 0; i < lines.length; i++) {
    if (insideFence[i] === true) continue;
    const m = /^(#{1,6})\s+\S/.exec(lines[i] ?? "");
    if (m) {
      const depth = (m[1] ?? "").length;
      if (minDepth === null || depth < minDepth) minDepth = depth;
    }
  }
  if (minDepth === null || minDepth > wrappingDepth) return body;
  // Shift every heading by `(wrappingDepth + 1) - minDepth`, capping at H6.
  const shift = wrappingDepth + 1 - minDepth;
  if (shift <= 0) return body;
  return lines
    .map((line, i) => {
      if (insideFence[i] === true) return line;
      const m = /^(#{1,6})(\s+)(\S.*)$/.exec(line);
      if (!m) return line;
      const oldDepth = (m[1] ?? "").length;
      const newDepth = Math.min(6, oldDepth + shift);
      return "#".repeat(newDepth) + (m[2] ?? " ") + (m[3] ?? "");
    })
    .join("\n");
}

/**
 * Build the lead paragraph that sits between the provenance comment and
 * the TOC. Imperative voice; names the version and module so Claude can
 * decide whether the file is relevant before reading further.
 * @param moduleName - The module's display name (used verbatim).
 * @param version - The OpenSIPs version (e.g. `"3.6"`).
 * @returns A single-paragraph string suitable for `renderLeadParagraph`.
 */
function buildLeadParagraph(moduleName: string, version: string): string {
  return (
    `Reference for the OpenSIPs ${version} ${moduleName} module. Read this file when ` +
    `configuring or debugging the ${moduleName} module: signature, parameters, return ` +
    `codes, exported MI commands, statistics, events, and configuration examples.`
  );
}

/**
 * Compose the body for a section whose elements are alphabetized
 * sub-elements rendered at H3. The element renderer is responsible for
 * its own trailing newlines; we simply concatenate.
 * @param items - The (already-fetched) source array — may be empty/undefined.
 * @param render - The per-element renderer to apply at H3.
 * @returns The concatenated body string, or `""` when there are no items.
 */
function composeAlphabetizedBody<T extends { name: string }>(
  items: readonly T[] | null | undefined,
  render: (item: T, headingLevel?: 2 | 3) => string,
): string {
  if (!items || items.length === 0) return "";
  return alphabetizeByName(items)
    .map((item) => render(item, 3))
    .join("");
}

/**
 * Compose one {@link ModuleDocument} into a complete Markdown file.
 *
 * The function is **deterministic** — given the same input, returns
 * byte-identical output. It is **side-effect-free** — no I/O, no globals.
 * The orchestrator (M3.E) is responsible for filesystem writes.
 *
 * Section emission follows the canonical order in
 * `docs/architecture/rendering-templates.md` §3.1:
 *
 *   1. `# {module_name} Module Reference` (H1)
 *   2. Provenance HTML comment block.
 *   3. Lead paragraph.
 *   4. Contents TOC (built dynamically from sections actually emitted).
 *   5. `## Overview` (always present).
 *   6. `## How It Works` (only when `how_it_works` has non-whitespace content).
 *   7. `## Dependencies` (always present).
 *   8. `## Exported Parameters` (only when non-empty; alphabetized).
 *   9. `## Exported Functions` (only when non-empty; alphabetized).
 *  10. `## Exported Pseudo-Variables` (only when non-empty; alphabetized).
 *  11. `## Exported MI Functions` (only when non-empty; alphabetized).
 *  12. `## Exported Statistics` (only when non-empty; alphabetized).
 *  13. `## Exported Events` (only when non-empty; alphabetized).
 *  14. `## Configuration Examples` (only when non-empty; **source order**).
 *
 * Configuration Examples preserve source order intentionally — the
 * upstream extraction places them in narrative sequence, and alphabetizing
 * by title would scramble that pedagogical flow.
 * @param module - The validated ModuleDocument from
 *   `data/{version}/modules/{slug}.json`.
 * @param version - OpenSIPs version string (e.g., `"3.6"`).
 * @param generatorVersion - Build script version (e.g., `"0.1.0"`).
 * @returns The complete Markdown file content as a single string with a
 *   trailing newline.
 * @example
 * renderModule(tmDocument, "3.6", "0.1.0");
 * // # tm Module Reference
 * // <!-- generated-from: data/3.6/modules/tm.json
 * //      generator-version: 0.1.0
 * //      opensips-version: 3.6
 * //      doc-type: module -->
 * //
 * // Reference for the OpenSIPs 3.6 tm module. Read this file when ...
 * //
 * // ## Contents
 * //
 * // - [Overview](#overview)
 * // - [Dependencies](#dependencies)
 * // ...
 */
export function renderModule(
  module: ModuleDocument,
  version: string,
  generatorVersion: string,
): string {
  const slug = slugify(module.module_name);

  const head =
    renderH1(`${module.module_name} Module Reference`) +
    renderProvenance({
      generatedFrom: `data/${version}/modules/${slug}.json`,
      generatorVersion,
      opensipsVersion: version,
      docType: "module",
    }) +
    "\n" +
    renderLeadParagraph(buildLeadParagraph(module.module_name, version));

  // Compose every body section first; the TOC is then built from the
  // subset that actually produced content, mirroring the
  // "no empty sections" rule from §2.4.
  // Overview and How It Works wrap upstream prose verbatim. Some upstream
  // fields begin with their own headings (DocBook-derived `##` and `####`
  // captions); we rebase those depths so they nest inside the wrapping H2
  // rather than producing sibling H2s (which would make our wrapper
  // appear empty to the validator and visually merge sections).
  const overviewBody = renderSection(
    SECTION_OVERVIEW,
    rebaseHeadingDepths(module.overview, 2),
  );

  const howItWorksBody = hasContent(module.how_it_works)
    ? renderSection(
        SECTION_HOW_IT_WORKS,
        rebaseHeadingDepths(module.how_it_works, 2),
      )
    : "";

  // renderDependencies emits its own H2; do NOT wrap it in renderSection.
  const dependenciesBody = renderDependencies(
    {
      required: module.dependencies_required,
      optional: module.dependencies_optional,
    },
    2,
  );

  const parametersBody = renderSection(
    SECTION_EXPORTED_PARAMETERS,
    composeAlphabetizedBody<ModuleParameter>(module.exported_parameters, renderParameter),
  );
  const functionsBody = renderSection(
    SECTION_EXPORTED_FUNCTIONS,
    composeAlphabetizedBody<ModuleFunction>(module.exported_functions, renderFunction),
  );
  const pseudoVariablesBody = renderSection(
    SECTION_EXPORTED_PSEUDO_VARIABLES,
    composeAlphabetizedBody<PseudoVariable>(
      module.exported_pseudo_variables,
      renderPseudoVariable,
    ),
  );
  const miFunctionsBody = renderSection(
    SECTION_EXPORTED_MI_FUNCTIONS,
    composeAlphabetizedBody<MIFunction>(module.exported_mi_functions, renderMICommand),
  );
  const statisticsBody = renderSection(
    SECTION_EXPORTED_STATISTICS,
    composeAlphabetizedBody<Statistic>(module.exported_statistics, renderStatistic),
  );
  const eventsBody = renderSection(
    SECTION_EXPORTED_EVENTS,
    composeAlphabetizedBody<Event>(module.exported_events, renderEvent),
  );

  // Configuration Examples preserve source order — they have a narrative
  // flow that alphabetisation would scramble.
  const configExamples = module.configuration_examples ?? [];
  const configurationExamplesBody = renderSection(
    SECTION_CONFIGURATION_EXAMPLES,
    configExamples.length === 0
      ? ""
      : configExamples.map((ex: ConfigExample) => renderConfigExample(ex, 3)).join(""),
  );

  // Build the TOC entries in the same order as the bodies above, including
  // an entry only when its body is non-empty. Dependencies is always
  // emitted, so it always appears.
  const tocEntries: TocEntry[] = [];
  const addEntry = (label: string, body: string): void => {
    if (body.length > 0) {
      tocEntries.push({ label, anchor: toAnchor(label) });
    }
  };
  addEntry(SECTION_OVERVIEW, overviewBody);
  addEntry(SECTION_HOW_IT_WORKS, howItWorksBody);
  addEntry(SECTION_DEPENDENCIES, dependenciesBody);
  addEntry(SECTION_EXPORTED_PARAMETERS, parametersBody);
  addEntry(SECTION_EXPORTED_FUNCTIONS, functionsBody);
  addEntry(SECTION_EXPORTED_PSEUDO_VARIABLES, pseudoVariablesBody);
  addEntry(SECTION_EXPORTED_MI_FUNCTIONS, miFunctionsBody);
  addEntry(SECTION_EXPORTED_STATISTICS, statisticsBody);
  addEntry(SECTION_EXPORTED_EVENTS, eventsBody);
  addEntry(SECTION_CONFIGURATION_EXAMPLES, configurationExamplesBody);

  const toc = renderTOC(tocEntries);

  const body =
    overviewBody +
    howItWorksBody +
    dependenciesBody +
    parametersBody +
    functionsBody +
    pseudoVariablesBody +
    miFunctionsBody +
    statisticsBody +
    eventsBody +
    configurationExamplesBody;

  // Helper-level trailing-newline conventions diverge between element
  // renderers: `renderParameter` ends in one `\n`, `renderFunction` ends in
  // two, others vary. When `renderSection` then sandwiches the body in
  // `\n\n…\n\n`, the seams between element-based sections can accumulate
  // four consecutive `\n` (i.e., three consecutive blank lines), which the
  // M3.6 validator forbids ("more than two consecutive blank lines"). We
  // normalise here at the composition boundary rather than touching shared
  // helpers — collapsing any run of 3 or more line-terminators down to
  // exactly two (a single blank-line gap, the standard Markdown
  // convention).
  //
  // The collapse pattern is `(?:\n[ \t]*){3,}` rather than `\n{3,}` because
  // upstream prose occasionally embeds whitespace-only lines (a tab, four
  // spaces) between blank lines — DocBook/HTML-to-Markdown conversion
  // artifacts. A naive `\n{3,}` regex misses `\n\n   \n\n` (two real
  // blanks bracketing a whitespace-only line), but that pattern still
  // renders as three consecutive blanks and trips the validator. The
  // expanded regex normalises both forms identically.
  //
  // The trailing newline is then re-appended as exactly one to satisfy
  // the file-end contract.
  const composed = head + toc + body;
  const collapsed = composed.replace(/(?:\n[ \t]*){3,}/g, "\n\n");
  return `${collapsed.replace(/\n+$/, "")}\n`;
}
