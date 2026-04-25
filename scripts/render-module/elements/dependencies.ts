/**
 * Renders the Dependencies block of a module reference, per
 * `docs/architecture/rendering-templates.md` §3.1.3.
 *
 * Unlike the other element renderers (parameter, function, pseudo-variable,
 * mi-command, statistic, event), the Dependencies element is *not* a
 * one-item-per-call renderer. It produces the entire Dependencies section
 * — H2 heading plus all sub-sections — from the two source fields
 * (`dependencies_required` and `dependencies_optional`). The `## Exported …`
 * sections are populated by an outer renderer iterating element renderers;
 * Dependencies is structurally different, so it owns its own heading.
 *
 * Output structure (always present, even when empty):
 *
 * ```markdown
 * ## Dependencies
 *
 * ### OpenSIPs Modules
 * <bulleted list of required deps with type === "module", or "None.">
 *
 * ### External Libraries
 * <bulleted list of required deps with type === "library" or "application",
 *  or "None.">
 *
 * ### Optional Modules                ← only when `optional` is non-empty
 * <bulleted list of backticked names from the `optional` string array>
 * ```
 *
 * Partition rules for the `required` array:
 *
 *   - `type === "module"`     → "OpenSIPs Modules" sub-section.
 *   - `type === "library"`    → "External Libraries" sub-section.
 *   - `type === "application"` → also "External Libraries" sub-section.
 *
 * Judgment call on `application`: applications are external runtime tools
 * (binaries, daemons, services) — they are not OpenSIPs modules, so the
 * "OpenSIPs Modules" bucket is incorrect; and the upstream OpenSIPs
 * documentation pattern only distinguishes "modules" (in-tree) from
 * "everything else external", which "External Libraries" represents in our
 * rendering. Lumping applications with libraries also keeps the rendered
 * Dependencies section to two stable sub-section names regardless of which
 * external dependency types a module happens to need.
 *
 * Per-dependency line format:
 *
 *   - With reason and not optional:    `` `- ${name} — ${reason}` ``
 *   - Without reason and not optional: `` `- ${name}` ``
 *   - With reason and optional:        `` `- ${name} — ${reason} (optional)` ``
 *   - Without reason and optional:     `` `- ${name} (optional)` ``
 *
 * The optional-flag suffix is appended after the reason (or after the name
 * when there is no reason), preserving the spec example exactly.
 *
 * Both partition arrays are sorted alphabetically by `name` before
 * rendering. The `optional` string array is also sorted alphabetically. This
 * keeps generated output stable when the upstream extraction reorders
 * dependencies between runs.
 *
 * The optional `sectionHeadingLevel` parameter shifts the entire heading
 * hierarchy. The default `2` matches §3.1.3 module rendering (H2 +
 * H3 sub-sections). Passing `3` (used when Dependencies appears inside a
 * core-aggregated or split file) emits H3 + H4 sub-sections instead. No
 * other levels are supported.
 */

import type { Dependency } from "../../schemas/module-sections.schema.js";
import {
  renderBulletList,
  renderH2,
  renderH3,
  renderH4,
  renderInlineCode,
} from "../../lib/markdown-builders.js";

export interface DependenciesInput {
  /** Required dependencies (modules, libraries, applications). May be empty/undefined. */
  required: Dependency[] | null | undefined;
  /** Optional dependencies as raw module names. May be empty/undefined. */
  optional: string[] | null | undefined;
}

/**
 * Format a single {@link Dependency} as a bullet item body (no leading `- `,
 * no trailing newline — {@link renderBulletList} adds those).
 * @param d - The dependency to format.
 * @returns The rendered item body, e.g. `` "`tm` — stateful transactions" ``.
 */
function formatDependency(d: Dependency): string {
  const name = renderInlineCode(d.name);
  const hasReason = d.reason !== undefined && d.reason !== "";
  const optionalSuffix = d.optional ? " (optional)" : "";
  if (hasReason) {
    return `${name} — ${d.reason}${optionalSuffix}`;
  }
  return `${name}${optionalSuffix}`;
}

/**
 * Render a sub-section: heading line, blank line, then either the bulleted
 * list of items or the literal string `None.`. The block ends with a blank
 * line separator so consecutive sub-sections concatenate cleanly.
 * @param heading - Sub-section title (e.g. `"OpenSIPs Modules"`).
 * @param subHeadingLevel - Heading helper to use (`renderH3` or `renderH4`).
 * @param items - Pre-rendered bullet bodies, already alphabetized. Empty
 *   array triggers the `None.` fallback.
 * @returns A self-contained sub-section block ending in `"\n\n"`.
 */
function renderSubSection(
  heading: string,
  subHeadingLevel: typeof renderH3,
  items: string[],
): string {
  const headingLine = subHeadingLevel(heading);
  if (items.length === 0) {
    return `${headingLine}\nNone.\n\n`;
  }
  return `${headingLine}\n${renderBulletList(items)}\n`;
}

/**
 * Sort an array of dependencies alphabetically by `name`, returning a fresh
 * array (the input is not mutated).
 * @param deps - Dependencies to sort.
 * @returns A new array, alphabetized by `name`.
 */
function alphabetizeByName(deps: Dependency[]): Dependency[] {
  return [...deps].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/**
 * Render the Dependencies block. Always emits the H2 "Dependencies" section
 * (per spec: always present, even when both subsections are empty). Within
 * the H2, emits H3 sub-sections "OpenSIPs Modules" and "External Libraries"
 * partitioning the `required` array by `type`. If `optional` is non-empty,
 * adds a third H3 "Optional Modules".
 * @param deps - Dependency input. `required` may be null/undefined/[] —
 *   all three are treated identically. Same for `optional`.
 * @param sectionHeadingLevel - `2` by default (the H2 heading). Sub-sections
 *   become `sectionHeadingLevel + 1`. Pass `3` for core-aggregated rendering
 *   (H3 + H4). No other values are supported.
 * @returns Markdown string for the entire Dependencies block, ending in
 *   exactly two trailing newlines (the section-block convention shared with
 *   {@link import("../../lib/markdown-builders.js").renderSection}).
 * @example
 * renderDependencies({
 *   required: [
 *     { name: "tm", type: "module", reason: "stateful transactions", optional: false },
 *     { name: "libssl", type: "library", reason: "TLS support", optional: false },
 *   ],
 *   optional: ["dialog"],
 * });
 * // ## Dependencies
 * //
 * // ### OpenSIPs Modules
 * //
 * // - `tm` — stateful transactions
 * //
 * // ### External Libraries
 * //
 * // - `libssl` — TLS support
 * //
 * // ### Optional Modules
 * //
 * // - `dialog`
 * //
 */
export function renderDependencies(
  deps: DependenciesInput,
  sectionHeadingLevel: 2 | 3 = 2,
): string {
  const required = deps.required ?? [];
  const optional = deps.optional ?? [];

  // Partition required by type. Applications group with libraries
  // (documented in the module JSDoc).
  const modules = alphabetizeByName(required.filter((d) => d.type === "module"));
  const libraries = alphabetizeByName(
    required.filter((d) => d.type === "library" || d.type === "application"),
  );

  // Choose heading helpers based on the section level. The H2 + H3 default
  // matches §3.1.3; H3 + H4 is the once-shifted variant.
  const sectionHeading = sectionHeadingLevel === 2 ? renderH2 : renderH3;
  const subHeading = sectionHeadingLevel === 2 ? renderH3 : renderH4;

  const modulesBlock = renderSubSection(
    "OpenSIPs Modules",
    subHeading,
    modules.map(formatDependency),
  );
  const librariesBlock = renderSubSection(
    "External Libraries",
    subHeading,
    libraries.map(formatDependency),
  );

  // Optional Modules sub-section is only emitted when the list is non-empty.
  // Items are alphabetized; each is a backticked name with no reason.
  let optionalBlock = "";
  if (optional.length > 0) {
    const sortedOptional = [...optional].sort((a, b) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    const items = sortedOptional.map((name) => renderInlineCode(name));
    optionalBlock = renderSubSection("Optional Modules", subHeading, items);
  }

  return `${sectionHeading("Dependencies")}\n${modulesBlock}${librariesBlock}${optionalBlock}`;
}
