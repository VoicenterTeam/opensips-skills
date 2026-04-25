/**
 * Renderer for a single {@link ConfigExample} item.
 *
 * Per `docs/architecture/rendering-templates.md` §3.1.10, a configuration
 * example renders as:
 *
 *   - A heading whose text is the example's `title` field as plain text
 *     (descriptive title — *not* an identifier, so no backticks).
 *   - A prose paragraph from `description`.
 *   - A fenced code block tagged `opensips` containing `code` verbatim.
 *   - When `explanation` is set and non-empty, a final prose paragraph after
 *     the code block.
 *
 * The default heading level is H3 because configuration examples appear
 * inside a module's `## Configuration Examples` section. When a future core
 * renderer wants to reuse this helper at the top level (M4), it can pass
 * `headingLevel: 2` to shift the heading up by one.
 *
 * The output ends with exactly one trailing newline so the parent renderer
 * can compose the section by joining items with a blank line.
 */
import { renderH2, renderH3, renderCodeBlock } from "../../lib/markdown-builders.js";
import type { ConfigExample } from "../../schemas/module-sections.schema.js";

/**
 * Render a single {@link ConfigExample} to Markdown.
 * @param example - The configuration example to render.
 * @param headingLevel - `3` (default) for in-module rendering; pass `2`
 *   when reusing this helper at the top level of an aggregated core file.
 * @returns A Markdown string ending in exactly one trailing newline.
 * @example
 * renderConfigExample({
 *   title: "Stateful proxy with failover",
 *   description: "Configure the tm module for a stateful proxy.",
 *   code: 'loadmodule "tm.so"',
 * });
 * // "### Stateful proxy with failover\n\n
 * //  Configure the tm module for a stateful proxy.\n\n
 * //  ```opensips\nloadmodule \"tm.so\"\n```\n"
 */
export function renderConfigExample(example: ConfigExample, headingLevel: 2 | 3 = 3): string {
  const heading = headingLevel === 2 ? renderH2(example.title) : renderH3(example.title);

  const body =
    `${heading}\n` + `${example.description}\n\n` + renderCodeBlock(example.code, "opensips");

  if (example.explanation && example.explanation.length > 0) {
    return `${body}\n${example.explanation}\n`;
  }

  return body;
}
