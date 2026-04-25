/**
 * Render a single operator (an element of `OperatorDocument.operators`) as
 * Markdown, per `docs/architecture/rendering-templates.md` §3.2.3.
 *
 * Operators are a core-only document type — they have no per-module
 * counterpart — so this element renderer lives under `render-core/`. The
 * default heading level is H2, matching the aggregated rendering convention
 * in §3.2.1 where each item is an H2 within `operators.md`. The H3 form is
 * available for the unlikely case of nested reuse.
 *
 * Output shape:
 *
 * ```markdown
 * ## `+` (Addition)
 *
 * Standard addition operator. Coerces operands as needed.
 *
 * - **Operand type:** binary
 * - **Applicable to:** integer, string
 * - **Precedence:** 12
 * - **Associativity:** left
 *
 * **Example.** Add two numbers.
 *
 * ```opensips
 * $var(a) = 4 + 7;
 * ```
 * ```
 *
 * Two judgment calls baked in:
 *
 *   - The symbol is `String#trim`-ed before being backticked. Some upstream
 *     entries carry leading whitespace (e.g. `" ="`) for disambiguation in
 *     the source DocBook; that whitespace is structurally meaningless once
 *     the symbol sits inside a Markdown code span.
 *   - When an example's `description` is empty, the caption collapses to a
 *     bare `**Example.**` rather than emitting `**Example.** .`. This
 *     mirrors the same fallback used by `renderEvent` and avoids a stray
 *     period that would survive validation but read awkwardly.
 *
 * The property list is always emitted (every property is a required schema
 * field). The example block is emitted iff `examples` is non-empty.
 */

import type { z } from "zod";
import type { OperatorDocumentSchema } from "../../schemas/core/operators.schema.js";
import {
  renderBold,
  renderCodeBlock,
  renderH2,
  renderH3,
  renderInlineCode,
  renderPropertyList,
} from "../../lib/markdown-builders.js";

type Operator = z.infer<typeof OperatorDocumentSchema>["operators"][number];

/**
 * Render an {@link Operator} as a self-contained Markdown block ending in
 * exactly one trailing newline.
 *
 * The block is composed in this fixed order: heading → description prose →
 * blank line → property list (operand type, applicable to, precedence,
 * associativity) → optional example sub-blocks. Each example becomes its
 * own `**Example.** {description}.` caption plus a fenced code block whose
 * fence tag comes from the example's `language` field, defaulting to
 * `opensips` when empty.
 * @param op - The operator to render. Schema-validated upstream; the symbol
 *   is `String#trim`-ed defensively because some upstream sources include
 *   leading whitespace (e.g. `" ="`).
 * @param headingLevel - `2` (default) for the standard core-aggregated
 *   rendering where each operator is an H2 within `operators.md`; `3` if
 *   the renderer is reused inside a deeper nesting context.
 * @returns A Markdown string representing the operator, ending in `"\n"`.
 * @example
 * renderOperator({
 *   symbol: "+",
 *   name: "Addition",
 *   category: "arithmetic",
 *   operand_type: "binary",
 *   description: "Standard addition operator.",
 *   applicable_to: ["integer", "string"],
 *   precedence: 12,
 *   associativity: "left",
 *   examples: [{
 *     language: "opensips",
 *     code: "$var(a) = 4 + 7;",
 *     description: "Add two numbers",
 *   }],
 * });
 * // "## `+` (Addition)\n\nStandard addition operator.\n\n
 * //  - **Operand type:** binary\n- **Applicable to:** integer, string\n
 * //  - **Precedence:** 12\n- **Associativity:** left\n\n**Example.** Add
 * //  two numbers.\n\n```opensips\n$var(a) = 4 + 7;\n```\n"
 */
export function renderOperator(
  op: Operator,
  headingLevel: 2 | 3 = 2,
): string {
  const symbol = op.symbol.trim();
  const headingText = `${renderInlineCode(symbol)} (${op.name})`;
  const heading = headingLevel === 2 ? renderH2(headingText) : renderH3(headingText);

  const properties = renderPropertyList([
    { key: "Operand type", value: op.operand_type },
    { key: "Applicable to", value: op.applicable_to.join(", ") },
    { key: "Precedence", value: String(op.precedence) },
    { key: "Associativity", value: op.associativity },
  ]);

  let out = `${heading}\n${op.description}\n\n${properties}`;

  if (op.examples.length > 0) {
    for (const example of op.examples) {
      const caption =
        example.description.length > 0
          ? `${renderBold("Example.")} ${example.description}.`
          : `${renderBold("Example.")}`;
      const lang = example.language.length > 0 ? example.language : "opensips";
      out += `\n${caption}\n\n${renderCodeBlock(example.code, lang)}`;
    }
  }

  return out;
}
