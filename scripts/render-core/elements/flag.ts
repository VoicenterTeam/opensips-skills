/**
 * Renderer for a single flag type entry from `flags.json`.
 *
 * Implements the per-item Markdown shape specified in
 * `docs/architecture/rendering-templates.md` §3.2.3 (Flags). The flags
 * document is unusual among the core types because each entry is a *kind* of
 * flag (Message Flags, Branch Flags, Script Flags) rather than a single
 * named identifier. Consequently:
 *
 *   - The heading text is the plain `type_name` (e.g. `"Message Flags"`),
 *     **not** wrapped in backticks. These are descriptive labels, not
 *     code identifiers.
 *   - A property list captures the two metadata fields the schema models:
 *     persistence and max_flags.
 *   - A `**Functions:**` block, when present, lists the small set of
 *     manipulator functions exposed for the flag type (typically setflag /
 *     resetflag / isflagset). Each function carries a name, a one-line
 *     purpose, and an explicit signature; all three are emitted on a single
 *     bullet so the Functions block stays compact.
 *   - Examples follow the same bold-caption + fenced-code-block convention
 *     used by every other element renderer.
 *
 * Default heading level is H2 because flag types are top-level items in the
 * aggregated `flags.md` file (per §3.2.1). The H3 path is provided for the
 * (currently theoretical) reuse case where a flag type is rendered inside
 * another element's section.
 */
import type { z } from "zod";
import type { FlagDocumentSchema } from "../../schemas/core/flags.schema.js";
import {
  renderBold,
  renderBulletList,
  renderCodeBlock,
  renderH2,
  renderH3,
  renderInlineCode,
  renderPropertyList,
  type Property,
} from "../../lib/markdown-builders.js";

type FlagType = z.infer<typeof FlagDocumentSchema>["flag_types"][number];
type FlagFunction = FlagType["functions"][number];
type FlagExample = FlagType["examples"][number];

/**
 * Format a single flag-manipulator function as a bullet item.
 *
 * The bullet body is `` `name` — purpose. Signature: `signature`. `` —
 * three sub-fields kept on one line so the Functions list reads like a
 * compact reference table rather than a paragraph.
 * @param fn - Function entry to format.
 * @returns The bullet body string (without the leading `- ` or trailing `\n`,
 *   both of which are added by {@link renderBulletList}).
 */
function formatFunctionBullet(fn: FlagFunction): string {
  return `${renderInlineCode(fn.name)} — ${fn.purpose}. Signature: ${renderInlineCode(fn.signature)}.`;
}

/**
 * Render a single example as a bold caption plus a fenced code block.
 *
 * When the example's `description` is non-empty, the caption reads
 * `**Example.** {description}.`; when empty, the caption is just
 * `**Example.**`. The fence tag uses the example's `language` field, falling
 * back to `opensips` when the source omitted it (per §4.1: OpenSIPs script
 * is the default content type for flag-related examples).
 * @param example - Example entry to render.
 * @returns A string of the form `"**Example.** …\n\n```{lang}\n…\n```\n"`.
 */
function renderFlagExample(example: FlagExample): string {
  const caption =
    example.description.length > 0
      ? `${renderBold("Example.")} ${example.description}.`
      : `${renderBold("Example.")}`;
  const lang = example.language.length > 0 ? example.language : "opensips";
  return `${caption}\n\n${renderCodeBlock(example.code, lang)}`;
}

/**
 * Render a single {@link FlagType} as a self-contained Markdown block.
 *
 * Output shape (with all optionals present):
 *
 * ```markdown
 * ## Message Flags
 *
 * Per-message flags reset on each new message.
 *
 * - **Persistence:** per-message
 * - **Max flags:** 32
 *
 * **Functions:**
 *
 * - `setflag(flag)` — set the flag at the given index. Signature: `setflag(int)`.
 *
 * **Example.** Set a routing flag.
 *
 * ```opensips
 * setflag(1);
 * ```
 * ```
 *
 * Optional-block rules:
 *   - The Functions block (label + bulleted list) is omitted when
 *     `functions` is empty. Functions are sorted alphabetically by `name`
 *     regardless of source order.
 *   - Examples are emitted in source order, each as its own caption + fence.
 *     When `examples` is empty, no example block is emitted at all.
 *
 * The result always ends in exactly one trailing newline, matching the
 * trailing-newline contract of the heading helpers in `markdown-builders`.
 * @param flag - The flag type to render. Schema-validated upstream.
 * @param headingLevel - `2` (default) for top-level rendering inside the
 *   aggregated `flags.md` file (per §3.2.3); `3` for the reuse case where
 *   a flag type appears beneath an outer H2.
 * @returns A Markdown string representing the flag type, ending in `"\n"`.
 * @example
 * renderFlag({
 *   type_name: "Message Flags",
 *   description: "Per-message flags reset on each new message.",
 *   max_flags: 32,
 *   persistence: "per-message",
 *   functions: [],
 *   examples: [],
 * });
 * // "## Message Flags\n\nPer-message flags reset on each new message.\n\n
 * //  - **Persistence:** per-message\n- **Max flags:** 32\n"
 */
export function renderFlag(flag: FlagType, headingLevel: 2 | 3 = 2): string {
  const heading = headingLevel === 2 ? renderH2(flag.type_name) : renderH3(flag.type_name);

  const properties: Property[] = [
    { key: "Persistence", value: flag.persistence },
    { key: "Max flags", value: String(flag.max_flags) },
  ];
  const propertyList = renderPropertyList(properties);

  let out = `${heading}\n${flag.description}\n\n${propertyList}`;

  if (flag.functions.length > 0) {
    const sorted = [...flag.functions].sort((a, b) => a.name.localeCompare(b.name));
    const items = sorted.map(formatFunctionBullet);
    out += `\n${renderBold("Functions:")}\n\n${renderBulletList(items)}`;
  }

  for (const example of flag.examples) {
    out += `\n${renderFlagExample(example)}`;
  }

  return out;
}
