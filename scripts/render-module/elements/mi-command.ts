/**
 * Renderer for an exported Management Interface (MI) function / command.
 *
 * Produces the per-element Markdown specified in
 * `docs/architecture/rendering-templates.md` §3.1.7. The element form is:
 *
 *   - H3 (or H2 for core reuse) with the backticked MI command name,
 *   - description prose,
 *   - **Parameters:** bulleted list (alphabetical, omitted when empty),
 *   - **Returns:** single paragraph (omitted when `return_value` is absent),
 *   - one **Example.** block per entry in `examples`, language-tagged from
 *     the example's `language` field (defaulting to `bash`).
 *
 * The function is pure and deterministic: identical input yields byte-identical
 * output, which is a hard requirement of the build pipeline (idempotent
 * rebuilds, clean `git diff` after `npm run build`).
 *
 * The output always ends in two trailing newlines so callers can concatenate
 * adjacent element blocks without doing whitespace bookkeeping.
 */

import {
  renderH2,
  renderH3,
  renderInlineCode,
  renderBulletList,
  renderCodeBlock,
} from "../../lib/markdown-builders.js";
import type { CodeExample, MIFunction, MIParameter } from "../../schemas/module-sections.schema.js";

/**
 * Render a single MI function / command as a self-contained Markdown block.
 *
 * The block is suitable for direct concatenation under an
 * `## Exported MI Functions` (module context, default H3) or
 * `# Core MI Commands` (core context, H2) parent section. Per the spec
 * (§3.1.7 and §3.2.2), the only structural difference between the two
 * contexts is the heading level of the element itself.
 *
 * The renderer enforces the following spec rules:
 *
 *   - Parameter alphabetization by `name` regardless of source order.
 *   - Per-parameter format ``- `{name}` *({type}, {required ? "required"
 *     : "optional"})* — {description}``.
 *   - Single-paragraph return rendering with an optional "(structured
 *     response — see schema)" suffix when the source carries a `structure`
 *     payload.
 *   - Bash-by-default code fences for example blocks, overridden when the
 *     individual example carries a non-empty `language` value (per §4.1
 *     for non-MI languages such as `json` payloads).
 * @param mi - the MI function to render.
 * @param headingLevel - 3 by default (per-module rendering); pass 2 for
 *   core-document reuse so the element heading shifts up one level.
 * @returns A Markdown string ending in two trailing newlines.
 * @example
 * renderMICommand({
 *   name: "ps",
 *   parameters: [],
 *   description: "Lists running processes.",
 *   examples: [],
 * });
 * // "### `ps`\n\nLists running processes.\n\n"
 */
export function renderMICommand(mi: MIFunction, headingLevel: 2 | 3 = 3): string {
  const heading =
    headingLevel === 2 ? renderH2(renderInlineCode(mi.name)) : renderH3(renderInlineCode(mi.name));

  const segments: string[] = [];
  segments.push(heading);
  segments.push("\n");
  segments.push(`${mi.description}\n`);

  const paramsBlock = renderParametersBlock(mi.parameters);
  if (paramsBlock.length > 0) {
    segments.push("\n");
    segments.push(paramsBlock);
  }

  const returnsBlock = renderReturnsBlock(mi.return_value);
  if (returnsBlock.length > 0) {
    segments.push("\n");
    segments.push(returnsBlock);
  }

  for (const example of mi.examples) {
    segments.push("\n");
    segments.push(renderExampleBlock(example));
  }

  // Block-level separation: ensure exactly two trailing newlines.
  let out = segments.join("");
  out = out.replace(/\n+$/, "");
  return `${out}\n\n`;
}

/**
 * Render the `**Parameters:**` block. Returns the empty string when there
 * are no parameters (caller suppresses the section entirely per §2.4 /
 * "no empty sections").
 *
 * Parameters are sorted alphabetically by `name` regardless of source order
 * — sibling renderers (functions, events) follow the same convention so
 * that the rendered Markdown is stable across re-extractions.
 * @param parameters - The MI parameter list from the source JSON.
 * @returns A bulleted list of parameter lines, with a `**Parameters:**`
 *   lead label, ending in one trailing newline; or `""` for an empty list.
 */
function renderParametersBlock(parameters: readonly MIParameter[]): string {
  if (parameters.length === 0) return "";
  const sorted = [...parameters].sort((a, b) => a.name.localeCompare(b.name));
  const items = sorted.map((p) => {
    const requiredText = p.required ? "required" : "optional";
    return `${renderInlineCode(p.name)} *(${p.type}, ${requiredText})* — ${p.description}`;
  });
  return `**Parameters:**\n\n${renderBulletList(items)}`;
}

/**
 * Render the `**Returns:**` paragraph from an `MIReturnValue`. When the
 * source carries a `structure` payload (`z.any()` in the upstream schema),
 * a parenthetical hint directs the reader to the schema rather than
 * attempting to inline the structured shape.
 * @param returnValue - Optional return-value descriptor from the source.
 * @returns A single-paragraph Markdown string ending in one trailing
 *   newline, or `""` when `returnValue` is undefined.
 */
function renderReturnsBlock(returnValue: MIFunction["return_value"]): string {
  if (!returnValue) return "";
  const suffix = returnValue.structure !== undefined ? " (structured response — see schema)" : "";
  return `**Returns:** ${returnValue.description}${suffix}\n`;
}

/**
 * Render a single example block: bold caption (omitted-trailing-space
 * for empty descriptions) followed by a fenced code block.
 *
 * The fence language defaults to `bash` because MI commands are typically
 * issued from the command line (§3.1.7). When the source example specifies
 * a different non-empty `language` (e.g. `json` for JSON-RPC payloads),
 * that value is honoured.
 * @param example - The CodeExample from the source JSON.
 * @returns The example block ending in one trailing newline.
 */
function renderExampleBlock(example: CodeExample): string {
  const caption =
    example.description.length > 0 ? `**Example.** ${example.description}\n` : `**Example.**\n`;
  const lang = example.language.length > 0 ? example.language : "bash";
  return `${caption}\n${renderCodeBlock(example.code, lang)}`;
}
