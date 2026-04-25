/**
 * Aggregated core-document composer.
 *
 * Turns one of the twelve {@link CoreDocType} schema-shapes into a complete
 * Markdown reference file. Each core document's source JSON is a single array
 * of items (variables, functions, operators, statements, …); the composer
 * renders one H1 header, one provenance comment, one lead paragraph, one TOC,
 * and then every item as an H2 section in alphabetical order.
 *
 * Authoritative spec:
 *   - `docs/architecture/rendering-templates.md` §3.2 (per-doc-type templates).
 *   - `docs/plan/04-core-type-rendering.md` §4.3 (composer requirements).
 *   - `docs/plan/04-core-type-rendering.md` §4.6 (filename mapping).
 *
 * Two correctness contracts mirrored from the M3 module composer:
 *
 *   - **Deterministic.** Identical input ⇒ byte-identical output. Underpins
 *     "build twice, diff is empty" (per `data-pipeline.md` §8.1).
 *   - **Side-effect-free.** No I/O, no clocks, no globals; the orchestrator
 *     (M4.6) owns all filesystem writes.
 *
 * Dispatch is centralised in {@link DISPATCH}: one row per doc type, naming
 * the source-array field, the per-element renderer, the heading-text builder
 * (used to derive TOC anchors deterministically), and the sort key. New
 * core doc types added upstream surface here as a `satisfies` exhaustiveness
 * error rather than as silent runtime gaps.
 */

import {
  renderH1,
  renderLeadParagraph,
  renderTOC,
  toAnchor,
  renderInlineCode,
  type TocEntry,
} from "../lib/markdown-builders.js";
import { renderProvenance } from "../lib/frontmatter.js";
import { sanitizeRenderedText } from "../lib/sanitize.js";
import { getLeadParagraph } from "./lead-paragraphs.js";

import { renderParameter } from "../render-module/elements/parameter.js";
import { renderFunction } from "../render-module/elements/function.js";
import { renderPseudoVariable } from "../render-module/elements/pseudo-variable.js";
import { renderMICommand } from "../render-module/elements/mi-command.js";
import { renderStatistic } from "../render-module/elements/statistic.js";
import { renderEvent } from "../render-module/elements/event.js";
import { renderOperator } from "./elements/operator.js";
import { renderStatement } from "./elements/statement.js";
import { renderRouteBlock } from "./elements/route-block.js";
import { renderTransformation } from "./elements/transformation.js";
import { renderFlag } from "./elements/flag.js";

/**
 * Discriminator literal for one of the twelve core document types. Matches
 * the corresponding `document_type` field on every core schema (see
 * `scripts/schemas/core/*.schema.ts`).
 */
export type CoreDocType =
  | "core_variable"
  | "core_function"
  | "core_parameter"
  | "operator"
  | "statement"
  | "route_type"
  | "transformation"
  | "async_statement"
  | "mi_command"
  | "event"
  | "statistic"
  | "flag";

/**
 * Output filename for each core doc type's generated Markdown file (no
 * version prefix; orchestrator joins the version directory).
 *
 * Per `rendering-templates.md` §3.2 / Task 4.6, source filenames using
 * underscores normalise to hyphens in output (the only such case is
 * `mi_command` → `mi-commands.md`).
 */
export const coreFileNames: Readonly<Record<CoreDocType, string>> = {
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

/**
 * H1 title text for each core doc type. Per
 * `docs/architecture/rendering-templates.md` §3.2 table.
 */
export const coreFileH1: Readonly<Record<CoreDocType, string>> = {
  core_variable: "Core Pseudo-Variables Reference",
  core_function: "Core Functions Reference",
  core_parameter: "Core Parameters Reference",
  operator: "Operators Reference",
  statement: "Statements Reference",
  route_type: "Route Types Reference",
  transformation: "Transformations Reference",
  async_statement: "Async Statements Reference",
  mi_command: "Core MI Commands Reference",
  event: "Core Events Reference",
  statistic: "Core Statistics Reference",
  flag: "Flags Reference",
};

/**
 * Per-doc-type dispatch row.
 *
 * Each row carries:
 *   - `array`: the source-array field name on the validated document.
 *   - `render`: the element renderer to apply at H2.
 *   - `sortKey`: function returning the alphabetical key for an item.
 *   - `headingText`: function returning the heading text the element
 *     renderer will emit (used to derive the matching TOC anchor without
 *     having to call the renderer just for that). Mirrors the renderer's
 *     deterministic heading-construction rule.
 *
 * The shape uses concrete `unknown`-typed item callbacks so the table can
 * cover heterogeneous element types in one map; type safety is enforced at
 * the call-site by reading items only through the dispatch row's own
 * callbacks (each row's `array` value is itself opaque to the composer).
 */
interface DispatchRow {
  /** Field name on the document carrying the item array. */
  readonly array: string;
  /** Per-element renderer; H2 heading level. */
  readonly render: (item: unknown) => string;
  /** Alphabetical sort key extractor. */
  readonly sortKey: (item: unknown) => string;
  /** Heading text the renderer will emit (for TOC anchor derivation). */
  readonly headingText: (item: unknown) => string;
}

/**
 * Centralised dispatch table. One row per {@link CoreDocType}; the
 * `satisfies` clause enforces compile-time exhaustiveness so a new doc type
 * added upstream surfaces as a TypeScript error here.
 *
 * Item-shape access goes through small accessor lambdas typed against
 * `unknown` so a single dispatch table can serve all twelve heterogeneous
 * doc shapes. The validated input ensures the runtime shape matches.
 */
const DISPATCH = {
  core_variable: {
    array: "variables",
    render: (item) => renderPseudoVariable(item as Parameters<typeof renderPseudoVariable>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    // renderPseudoVariable prepends `$` to the name when missing; mirror that.
    headingText: (item) => {
      const name = (item as { name: string }).name;
      const sigiled = name.startsWith("$") ? name : `$${name}`;
      return renderInlineCode(sigiled);
    },
  },
  core_function: {
    array: "functions",
    render: (item) => renderFunction(item as Parameters<typeof renderFunction>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    // renderFunction puts the signature inside backticks.
    headingText: (item) => renderInlineCode((item as { signature: string }).signature),
  },
  core_parameter: {
    array: "parameters",
    render: (item) => renderParameter(item as Parameters<typeof renderParameter>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    // renderParameter heading: `` `name` (type) ``.
    headingText: (item) => {
      const p = item as { name: string; type: string };
      return `${renderInlineCode(p.name)} (${p.type})`;
    },
  },
  operator: {
    array: "operators",
    render: (item) => renderOperator(item as Parameters<typeof renderOperator>[0], 2),
    sortKey: (item) => (item as { symbol: string }).symbol.trim(),
    // renderOperator heading: `` `symbol.trim()` (name) ``.
    headingText: (item) => {
      const op = item as { symbol: string; name: string };
      return `${renderInlineCode(op.symbol.trim())} (${op.name})`;
    },
  },
  statement: {
    array: "statements",
    render: (item) => renderStatement(item as Parameters<typeof renderStatement>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    headingText: (item) => renderInlineCode((item as { name: string }).name),
  },
  route_type: {
    array: "route_types",
    render: (item) => renderRouteBlock(item as Parameters<typeof renderRouteBlock>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    headingText: (item) => renderInlineCode((item as { name: string }).name),
  },
  transformation: {
    array: "transformations",
    render: (item) => renderTransformation(item as Parameters<typeof renderTransformation>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    headingText: (item) => renderInlineCode((item as { name: string }).name),
  },
  async_statement: {
    // VERIFIED: AsyncDocumentSchema exposes `.statements`, not `.commands`.
    array: "statements",
    render: (item) => renderStatement(item as Parameters<typeof renderStatement>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    headingText: (item) => renderInlineCode((item as { name: string }).name),
  },
  mi_command: {
    // VERIFIED: MICommandDocumentSchema exposes `.mi_commands`, not `.commands`.
    array: "mi_commands",
    render: (item) => renderMICommand(item as Parameters<typeof renderMICommand>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    headingText: (item) => renderInlineCode((item as { name: string }).name),
  },
  event: {
    array: "events",
    render: (item) => renderEvent(item as Parameters<typeof renderEvent>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    headingText: (item) => renderInlineCode((item as { name: string }).name),
  },
  statistic: {
    array: "statistics",
    render: (item) => renderStatistic(item as Parameters<typeof renderStatistic>[0], 2),
    sortKey: (item) => (item as { name: string }).name,
    headingText: (item) => renderInlineCode((item as { name: string }).name),
  },
  flag: {
    array: "flag_types",
    render: (item) => renderFlag(item as Parameters<typeof renderFlag>[0], 2),
    sortKey: (item) => (item as { type_name: string }).type_name,
    // Flag headings are plain text (not backticked) — the type_name is a
    // descriptive label, not a code identifier.
    headingText: (item) => (item as { type_name: string }).type_name,
  },
} as const satisfies Record<CoreDocType, DispatchRow>;

/**
 * Source-filename stem for each doc type (the `data/{version}/core/X.json`
 * path component). For most types this matches `coreFileNames` minus `.md`,
 * but `async_statement` is the exception that needs explicit handling
 * because the source/output filenames diverge in spirit (we keep both
 * `async`).
 *
 * Note: `mi_command` resolves to `mi-commands` in BOTH source and output
 * filenames (the source JSON is already `mi-commands.json`).
 */
const sourceStem: Readonly<Record<CoreDocType, string>> = {
  core_variable: "variables",
  core_function: "functions",
  core_parameter: "parameters",
  operator: "operators",
  statement: "statements",
  route_type: "routes",
  transformation: "transformations",
  async_statement: "async",
  mi_command: "mi-commands",
  event: "events",
  statistic: "statistics",
  flag: "flags",
};

/**
 * Sort `items` alphabetically by the doc-type's sort key, returning a fresh
 * array so the caller's input is not mutated.
 *
 * Comparison uses a stable plain string `<`/`>` rather than `localeCompare`
 * for cross-platform deterministic ordering — the same choice made by the
 * M3 module composer.
 * @param items - Source items (unknown shape; accessed only via row callbacks).
 * @param row - Dispatch row carrying the sort-key extractor.
 * @returns A new array sorted by `row.sortKey`.
 */
function alphabetize(items: readonly unknown[], row: DispatchRow): unknown[] {
  return [...items].sort((a, b) => {
    const ka = row.sortKey(a);
    const kb = row.sortKey(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/**
 * Render an aggregated core document into its complete Markdown form.
 *
 * The composer is **deterministic** (same input ⇒ byte-identical output) and
 * **side-effect-free** (no I/O, no clocks, no globals). The orchestrator
 * (M4.6) is responsible for filesystem writes.
 *
 * Composition order (per `rendering-templates.md` §3.2.1):
 *
 *   1. H1 from {@link coreFileH1}.
 *   2. Provenance HTML comment with `generated-from` →
 *      `data/{version}/core/{stem}.json` and `doc-type` → `docType`.
 *   3. Lead paragraph from {@link getLeadParagraph}.
 *   4. Contents TOC — one entry per item, anchor derived from the heading
 *      text the element renderer will emit (mirrored deterministically by
 *      the dispatch row's `headingText`). Suppressed entirely when the
 *      document carries no items (the markdown-builders contract).
 *   5. Body — items sorted alphabetically by the dispatch row's `sortKey`,
 *      each rendered via the row's `render` callback at H2.
 *
 * The composed string runs through the same blank-line collapse as the M3
 * module composer (`/(?:\n[ \t]*){3,}/g → "\n\n"`) so any seam between
 * adjacent element blocks that ends with two newlines does not accumulate
 * three blank lines (validation rule §10: no >2 consecutive blank lines).
 * Final output ends in exactly one trailing newline.
 * @param doc - Validated core document (one of the twelve schema-typed
 *   shapes). Untyped here so a single function can serve all twelve
 *   document types; runtime access is mediated by the dispatch row.
 * @param docType - The document_type literal. Drives the H1, provenance
 *   doc-type, lead paragraph, and dispatch row.
 * @param version - Active OpenSIPs version (e.g. `"3.6"`). Interpolated into
 *   the provenance path and the lead paragraph.
 * @param generatorVersion - Build-script semver (e.g. `"0.1.0"`). Embedded
 *   in the provenance block.
 * @returns Complete Markdown content as a single string ending in exactly
 *   one trailing newline.
 * @throws {Error} If `docType` is not one of the twelve registered core
 *   types. Surfaces missing-renderer / missing-lead-paragraph drift loudly.
 * @example
 * import { OperatorDocumentSchema } from '../schemas/index.js';
 * const doc = OperatorDocumentSchema.parse(json);
 * const md = renderCoreDocument(doc, 'operator', '3.6', '0.1.0');
 * // # Operators Reference
 * // <!-- generated-from: data/3.6/core/operators.json
 * //      generator-version: 0.1.0
 * //      opensips-version: 3.6
 * //      doc-type: operator -->
 * //
 * // Reference for OpenSIPs 3.6 script operators. ...
 * //
 * // ## Contents
 * //
 * // - [`+` (Addition)](#-addition)
 * // ...
 */
export function renderCoreDocument(
  doc: unknown,
  docType: CoreDocType,
  version: string,
  generatorVersion: string,
): string {
  const row = DISPATCH[docType];
  if (!row) {
    throw new Error(
      `renderCoreDocument: unknown core doc type '${String(docType)}'. ` +
        `Expected one of: ${Object.keys(DISPATCH).join(", ")}.`,
    );
  }
  const stem = sourceStem[docType];

  // Read the items array via the dispatch row's `array` field. Defensive:
  // missing or non-array fields collapse to an empty list so the empty-doc
  // path stays graceful (per the test contract).
  const itemsRaw = (doc as Record<string, unknown>)[row.array];
  const items: readonly unknown[] = Array.isArray(itemsRaw) ? itemsRaw : [];

  const head =
    renderH1(coreFileH1[docType]) +
    renderProvenance({
      generatedFrom: `data/${version}/core/${stem}.json`,
      generatorVersion,
      opensipsVersion: version,
      docType,
    }) +
    "\n" +
    renderLeadParagraph(getLeadParagraph(docType, version));

  // Sort items alphabetically; build TOC entries and rendered bodies in
  // the same single pass to keep the two in lock-step. Anchor text is
  // derived from the heading text the element renderer will emit, mirrored
  // here by the dispatch row's `headingText` builder.
  const sorted = alphabetize(items, row);
  const tocEntries: TocEntry[] = sorted.map((item) => {
    const heading = row.headingText(item);
    return { label: heading, anchor: toAnchor(heading) };
  });
  const toc = renderTOC(tocEntries);

  const body = sorted.map((item) => row.render(item)).join("");

  // Same blank-line collapse the M3 composer uses. Element renderers vary
  // in trailing-newline counts (some end in `\n`, some in `\n\n`), and
  // adjacent blocks at section seams can otherwise accumulate ≥3 blanks.
  // Normalising at the composition boundary keeps the element renderers
  // free of bookkeeping.
  const composed = head + toc + body;
  const collapsed = composed.replace(/(?:\n[ \t]*){3,}/g, "\n\n");
  const cleaned = sanitizeRenderedText(collapsed);
  return `${cleaned.replace(/\n+$/, "")}\n`;
}
