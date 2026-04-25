/**
 * Renderer for a single statement (an element of `StatementDocument.statements`,
 * also reused by async statements since `AsyncStatementSchema` has the same
 * shape minus `related_statements`). The output format is specified by
 * `docs/architecture/rendering-templates.md` §3.2.3 (Statements / Async
 * statements).
 *
 * Heading level is parameterised so the same renderer can serve the canonical
 * core aggregated rendering (H2, the default per §3.2.1 — items in a core file
 * become H2) and any deeper-nested reuse (H3).
 */

import type { z } from "zod";
import { renderH2, renderH3, renderInlineCode } from "../../lib/markdown-builders.js";
import type { StatementDocumentSchema } from "../../schemas/core/statements.schema.js";

type Statement = z.infer<typeof StatementDocumentSchema>["statements"][number];
type StatementParameter = Statement["parameters"][number];
type StatementExample = Statement["examples"][number];

/**
 * Render a single statement parameter as one bullet line. Per §3.2.3 the
 * format is `- \`name\` *(type, required|optional)* — description`.
 * @param param - The parameter to render.
 * @returns A line ending in `"\n"`.
 */
function renderParameter(param: StatementParameter): string {
  const required = param.required ? "required" : "optional";
  return `- ${renderInlineCode(param.name)} *(${param.type}, ${required})* — ${param.description}\n`;
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
function renderExample(example: StatementExample): string {
  const lang = example.language.trim() === "" ? "opensips" : example.language;
  const caption = `**Example.** ${example.description}.`;
  return `${caption}\n\n\`\`\`${lang}\n${example.code}\n\`\`\`\n`;
}

/**
 * Render a single statement (or async statement) to its canonical Markdown
 * form per §3.2.3. The output starts with the heading and ends with a single
 * trailing blank line so adjacent items concatenate cleanly.
 *
 * Section emission:
 *
 *   1. Heading: `` `${name}` `` at H2 (default) or H3 (when reused).
 *   2. Description prose.
 *   3. **Syntax:** label followed by an UNTAGGED fenced block containing
 *      `stmt.syntax`. Always emitted — `syntax` is required by the schema and
 *      §4.1 specifies untagged fences for syntax templates.
 *   4. **Parameters:** — only when `parameters` is non-empty. One bullet per
 *      parameter, sorted alphabetically by name regardless of source order.
 *   5. **Usable from:** — only when `usage_context` is non-empty. Single line,
 *      comma-separated.
 *   6. **Related:** — only when `related_statements` is non-empty. Bulleted
 *      list of backticked names, sorted alphabetically.
 *   7. Examples — each rendered via {@link renderExample}; the section is
 *      omitted entirely when `examples` is empty.
 *
 * Async statements reuse this renderer; their schema lacks `related_statements`
 * but is otherwise structurally identical. The function reads
 * `related_statements` defensively via a property check so passing an
 * AsyncStatement-shaped value (without that property) also works correctly.
 * @param stmt - The statement to render.
 * @param headingLevel - `2` by default (canonical core aggregated rendering);
 *   pass `3` when reused at a deeper nesting level.
 * @returns A Markdown string ending in exactly one trailing newline beyond
 *   the final block.
 * @example
 * renderStatement({
 *   name: "if",
 *   syntax: "if (expr) { ... }",
 *   description: "Conditional statement.",
 *   parameters: [],
 *   usage_context: [],
 *   examples: [],
 * });
 * // "## `if`\n\nConditional statement.\n\n**Syntax:**\n\n```\nif (expr) { ... }\n```\n\n"
 */
export function renderStatement(stmt: Statement, headingLevel: 2 | 3 = 2): string {
  const heading =
    headingLevel === 2
      ? renderH2(renderInlineCode(stmt.name))
      : renderH3(renderInlineCode(stmt.name));

  const parts: string[] = [heading, "\n", `${stmt.description}\n\n`];

  // Syntax — always present (untagged fence per §4.1).
  parts.push("**Syntax:**\n\n");
  parts.push(`\`\`\`\n${stmt.syntax}\n\`\`\`\n\n`);

  const sortedParams = [...stmt.parameters].sort((a, b) => a.name.localeCompare(b.name));
  if (sortedParams.length > 0) {
    parts.push("**Parameters:**\n\n");
    parts.push(sortedParams.map(renderParameter).join(""));
    parts.push("\n");
  }

  if (stmt.usage_context.length > 0) {
    parts.push(`**Usable from:** ${stmt.usage_context.join(", ")}\n\n`);
  }

  const related = [...(stmt.related_statements ?? [])].sort((a, b) => a.localeCompare(b));
  if (related.length > 0) {
    parts.push("**Related:**\n\n");
    parts.push(related.map((name) => `- ${renderInlineCode(name)}\n`).join(""));
    parts.push("\n");
  }

  for (const example of stmt.examples) {
    parts.push(`${renderExample(example)}\n`);
  }

  return parts.join("");
}
