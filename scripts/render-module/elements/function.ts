/**
 * Renderer for a single {@link ModuleFunction} (an exported module function).
 * The output format is specified by `docs/architecture/rendering-templates.md`
 * §3.1.5 (Exported Functions). Heading level is parameterised so the same
 * renderer can serve both per-module rendering (H3, M3) and core aggregated
 * rendering (H2, M4).
 */

import {
  renderH2,
  renderH3,
  renderInlineCode,
} from "../../lib/markdown-builders.js";
import type {
  CodeExample,
  FunctionParameter,
  ModuleFunction,
  ReturnValue,
} from "../../schemas/module-sections.schema.js";

/**
 * Render a single function parameter as one bullet plus optional valid-value
 * sub-bullets. Per §3.1.5 the format is `- \`name\` *(type, required|optional)*
 * — description`, followed by one indented `- \`value\`` sub-bullet per entry
 * in `valid_values`.
 * @param param - The parameter to render. The schema permits `valid_values`
 *   to be omitted; an empty array is treated identically to omission.
 * @returns A multi-line string ending in `"\n"`.
 */
function renderParameter(param: FunctionParameter): string {
  const required = param.required ? "required" : "optional";
  const head = `- ${renderInlineCode(param.name)} *(${param.type}, ${required})* — ${param.description}\n`;

  const validValues = param.valid_values ?? [];
  if (validValues.length === 0) return head;

  const subBullets = validValues
    .map((v) => `  - ${renderInlineCode(v)}\n`)
    .join("");
  return head + subBullets;
}

/**
 * Render a single return-value entry as `- \`{value}\` — {condition}`.
 * @param rv - The return value entry from the function schema.
 * @returns One line ending in `"\n"`.
 */
function renderReturnValue(rv: ReturnValue): string {
  return `- ${renderInlineCode(rv.value)} — ${rv.condition}\n`;
}

/**
 * Render a single example as a bold-captioned, fenced code block. Caption
 * format (per §4.4): `**Example.** {description}.` — bold prefix, period,
 * space, description, period. The example's `language` field supplies the
 * fence tag; an empty/whitespace string falls back to `opensips`.
 * @param example - The example object from the schema.
 * @returns A caption line, blank line, fenced block, and a trailing blank
 *   line, ending in `"\n"`.
 */
function renderExample(example: CodeExample): string {
  const lang = example.language.trim() === "" ? "opensips" : example.language;
  const caption = `**Example.** ${example.description}.`;
  return `${caption}\n\n\`\`\`${lang}\n${example.code}\n\`\`\`\n`;
}

/**
 * Render an exported module function (or a core function when reused by M4)
 * to its canonical Markdown form. The output starts with the heading and
 * ends with a single trailing blank line so adjacent items concatenate
 * cleanly. Section emission follows §3.1.5: heading (H3 by default, H2
 * when `headingLevel === 2`); a `> **Deprecated.**` blockquote when
 * `deprecated === true`; the prose description; then Parameters / Return
 * codes / Usable from / Related, each emitted only when the underlying
 * source array is non-empty; and finally each example as a captioned,
 * fenced block. Parameters and `related_functions` are sorted
 * alphabetically by name regardless of source ordering.
 * @param fn - The function to render.
 * @param headingLevel - `3` by default (per-module rendering); pass `2` when
 *   reused by the M4 core renderers, which use H2 for individual items.
 * @returns A Markdown string ending in exactly one trailing newline beyond
 *   the final block.
 * @example
 * renderFunction({
 *   name: "t_relay",
 *   signature: "t_relay()",
 *   parameters: [],
 *   return_type: "integer",
 *   description: "Forwards the request statefully.",
 *   usage_context: [],
 *   examples: [],
 * });
 * // "### `t_relay()`\n\nForwards the request statefully.\n\n"
 */
export function renderFunction(
  fn: ModuleFunction,
  headingLevel: 2 | 3 = 3,
): string {
  const heading =
    headingLevel === 2
      ? renderH2(renderInlineCode(fn.signature))
      : renderH3(renderInlineCode(fn.signature));

  const parts: string[] = [heading, "\n"];

  if (fn.deprecated === true) {
    parts.push("> **Deprecated.**\n\n");
  }

  parts.push(`${fn.description}\n\n`);

  const sortedParams = [...fn.parameters].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  if (sortedParams.length > 0) {
    parts.push("**Parameters:**\n\n");
    parts.push(sortedParams.map(renderParameter).join(""));
    parts.push("\n");
  }

  const returnValues = fn.return_values ?? [];
  if (returnValues.length > 0) {
    parts.push("**Return codes:**\n\n");
    parts.push(returnValues.map(renderReturnValue).join(""));
    parts.push("\n");
  }

  if (fn.usage_context.length > 0) {
    parts.push(`**Usable from:** ${fn.usage_context.join(", ")}\n\n`);
  }

  const related = [...(fn.related_functions ?? [])].sort((a, b) =>
    a.localeCompare(b),
  );
  if (related.length > 0) {
    parts.push("**Related:**\n\n");
    parts.push(related.map((name) => `- ${renderInlineCode(name)}\n`).join(""));
    parts.push("\n");
  }

  for (const example of fn.examples) {
    parts.push(`${renderExample(example)}\n`);
  }

  return parts.join("");
}
