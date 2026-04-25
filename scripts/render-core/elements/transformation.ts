/**
 * Renderer for a single core OpenSIPs transformation. The output format is
 * specified by `docs/architecture/rendering-templates.md` §3.2.3
 * (Transformations — authoritative).
 *
 * A transformation is a chainable string/integer manipulation applied to a
 * pseudo-variable (e.g. `$ru.s.len`, `$avp(name).s.int`). Each transformation
 * carries a class (`string`, `integer`, `nameaddr`, …), a syntax template, a
 * fixed input/output type, an optional parameter list, and a chainability flag.
 *
 * Heading level is parameterised so the same renderer can serve both the
 * aggregated core `transformations.md` file (H2, the default per §3.2) and
 * any future module-level reuse where transformations might appear under H3.
 */

import type { z } from "zod";
import type { TransformationDocumentSchema } from "../../schemas/core/transformations.schema.js";
import {
  renderH2,
  renderH3,
  renderInlineCode,
  renderPropertyList,
  type Property,
} from "../../lib/markdown-builders.js";

type Transformation = z.infer<typeof TransformationDocumentSchema>["transformations"][number];

type TransformationParameter = Transformation["parameters"][number];
type TransformationExample = Transformation["examples"][number];

/**
 * Render a single transformation parameter as one bullet of the form
 * `- \`name\` *(type, required|optional)* — description`. Mirrors the
 * function-parameter rendering rule from §3.1.5 so the two element types feel
 * homogeneous to readers.
 * @param param - The parameter to render.
 * @returns One line ending in `"\n"`.
 */
function renderParameter(param: TransformationParameter): string {
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
function renderExample(example: TransformationExample): string {
  const lang = example.language.trim() === "" ? "opensips" : example.language;
  const caption = `**Example.** ${example.description}.`;
  return `${caption}\n\n\`\`\`${lang}\n${example.code}\n\`\`\`\n`;
}

/**
 * Render a single core transformation as a self-contained Markdown block.
 *
 * Section emission follows §3.2.3:
 *   1. Heading (H2 by default; H3 when `headingLevel === 3`) carrying the
 *      backticked transformation name.
 *   2. Description prose paragraph.
 *   3. Property list of `Class`, `Input` (= `input_type`), `Output`
 *      (= `output_type`), `Chainable` (`yes` / `no`).
 *   4. `**Syntax:**` lead followed by an UNTAGGED fenced code block carrying
 *      the source `syntax` field verbatim (per §4.1, syntax templates use
 *      untagged fences because they are illustrative, not executable).
 *   5. `**Parameters:**` block — only when the parameters array is non-empty,
 *      sorted alphabetically by name, one bullet per parameter.
 *   6. Each example as a captioned, fenced block, in source order.
 *
 * The output ends in a single trailing newline so adjacent blocks concatenate
 * cleanly with the H2-section gap added by the surrounding renderer.
 * @param trans - The transformation to render.
 * @param headingLevel - `2` by default (aggregated core rendering per §3.2.2);
 *   pass `3` when reused in a context that nests transformations under an H2
 *   parent.
 * @returns A Markdown string ending in a trailing newline.
 * @example
 * renderTransformation({
 *   name: "s.len",
 *   class: "string",
 *   description: "Returns the length of a string in characters.",
 *   syntax: "$variable.s.len",
 *   parameters: [],
 *   input_type: "string",
 *   output_type: "integer",
 *   examples: [],
 *   chainable: true,
 * });
 */
export function renderTransformation(trans: Transformation, headingLevel: 2 | 3 = 2): string {
  const heading =
    headingLevel === 2
      ? renderH2(renderInlineCode(trans.name))
      : renderH3(renderInlineCode(trans.name));

  const properties: Property[] = [
    { key: "Class", value: trans.class },
    { key: "Input", value: trans.input_type },
    { key: "Output", value: trans.output_type },
    { key: "Chainable", value: trans.chainable ? "yes" : "no" },
  ];

  const parts: string[] = [heading, "\n"];
  parts.push(`${trans.description}\n\n`);
  parts.push(renderPropertyList(properties));
  parts.push("\n");
  parts.push("**Syntax:**\n\n");
  parts.push(`\`\`\`\n${trans.syntax}\n\`\`\`\n`);
  parts.push("\n");

  const sortedParams = [...trans.parameters].sort((a, b) => a.name.localeCompare(b.name));
  if (sortedParams.length > 0) {
    parts.push("**Parameters:**\n\n");
    parts.push(sortedParams.map(renderParameter).join(""));
    parts.push("\n");
  }

  for (const example of trans.examples) {
    parts.push(`${renderExample(example)}\n`);
  }

  return parts.join("");
}
