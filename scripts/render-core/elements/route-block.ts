/**
 * Renderer for a single route block / route type
 * (`RouteDocument.route_types[*]`).
 *
 * The output format is specified by
 * `docs/architecture/rendering-templates.md` §3.2.3 (Route blocks). Route
 * blocks are a core, aggregated document type with no module-level analogue,
 * so the default heading level is H2; H3 is supported for the rare case where
 * the renderer is reused inside a deeper composition.
 *
 * Section emission, in order:
 *   1. Heading — backticked route name (e.g. `` `request_route` ``).
 *   2. Description — single prose paragraph from `description`.
 *   3. Property list — fixed two-row block:
 *        `- **Trigger:** {trigger_condition}`
 *        `- **Can call routes:** {yes|no}` (derived from the boolean).
 *   4. **Available variables:** — single line, comma-separated, each name
 *      backticked. Emitted only when `available_variables` is non-empty.
 *   5. **Available functions:** — same shape as variables. Emitted only when
 *      `available_functions` is non-empty.
 *   6. **Syntax:** — bold label followed by an UNTAGGED fenced code block
 *      (per §4.1, syntax-template snippets use untagged fences because the
 *      content is illustrative pseudo-code rather than executable script).
 *   7. Examples — one bold-captioned, fenced block per entry in `examples`,
 *      in source order. The fence tag comes from each example's `language`
 *      field, falling back to `opensips` when the field is the empty string.
 *
 * The function returns a self-contained Markdown block ending in exactly one
 * trailing newline so siblings concatenate cleanly.
 */

import type { z } from "zod";
import {
  renderBold,
  renderCodeBlock,
  renderH2,
  renderH3,
  renderInlineCode,
  renderPropertyList,
  type Property,
} from "../../lib/markdown-builders.js";
import type { RouteDocumentSchema } from "../../schemas/core/routes.schema.js";

type RouteType = z.infer<typeof RouteDocumentSchema>["route_types"][number];
type RouteExample = RouteType["examples"][number];

/**
 * Render a single example as a bold-captioned, fenced code block.
 *
 * Caption format (per §4.4): `**Example.** {description}.` — bold prefix,
 * period, space, description, period. The example's `language` field
 * supplies the fence tag; an empty string falls back to `opensips`.
 * @param example - Example object from the route schema.
 * @returns Caption line, blank line, fenced block, trailing blank line.
 */
function renderExample(example: RouteExample): string {
  const lang = example.language.trim() === "" ? "opensips" : example.language;
  const caption = `${renderBold("Example.")} ${example.description}.`;
  return `${caption}\n\n${renderCodeBlock(example.code, lang)}\n`;
}

/**
 * Render an inline `**Label:** \`a\`, \`b\`, \`c\`` line for the
 * Available-variables and Available-functions blocks. Each name is wrapped
 * in inline-code backticks; names are joined by `", "`.
 * @param label - Label text (without the trailing colon — added here).
 * @param names - Names to render. Caller is responsible for non-emptiness.
 * @returns A single line plus blank-line separator: `**{label}:** ...\n\n`.
 */
function renderInlineNameList(label: string, names: string[]): string {
  const joined = names.map((n) => renderInlineCode(n)).join(", ");
  return `${renderBold(`${label}:`)} ${joined}\n\n`;
}

/**
 * Render a single route block to its canonical Markdown form per
 * `rendering-templates.md` §3.2.3.
 *
 * Conditional sub-blocks (`available_variables`, `available_functions`,
 * examples) are omitted entirely when their source field is missing or
 * empty. The Trigger / Can-call-routes property list is always present
 * because both fields are schema-required.
 * @param route - Route block to render.
 * @param headingLevel - `2` by default (route blocks render as H2 in the
 *   aggregated `routes.md` core file); pass `3` only if the renderer is
 *   reused inside a deeper composition.
 * @returns Markdown string ending in exactly one trailing newline.
 * @example
 * renderRouteBlock({
 *   name: "request_route",
 *   syntax: "request_route { ... }",
 *   description: "Top-level route.",
 *   trigger_condition: "any incoming request",
 *   can_call_routes: true,
 *   examples: [],
 * });
 * // "## `request_route`\n\nTop-level route.\n\n
 * //  - **Trigger:** any incoming request\n
 * //  - **Can call routes:** yes\n\n
 * //  **Syntax:**\n\n```\nrequest_route { ... }\n```\n\n"
 */
export function renderRouteBlock(route: RouteType, headingLevel: 2 | 3 = 2): string {
  const heading =
    headingLevel === 2
      ? renderH2(renderInlineCode(route.name))
      : renderH3(renderInlineCode(route.name));

  const properties: Property[] = [
    { key: "Trigger", value: route.trigger_condition },
    { key: "Can call routes", value: route.can_call_routes ? "yes" : "no" },
  ];

  const parts: string[] = [];
  parts.push(heading);
  parts.push("\n");
  parts.push(`${route.description}\n`);
  parts.push("\n");
  parts.push(renderPropertyList(properties));
  parts.push("\n");

  const variables = route.available_variables ?? [];
  if (variables.length > 0) {
    parts.push(renderInlineNameList("Available variables", variables));
  }

  const functions = route.available_functions ?? [];
  if (functions.length > 0) {
    parts.push(renderInlineNameList("Available functions", functions));
  }

  parts.push(`${renderBold("Syntax:")}\n`);
  parts.push("\n");
  parts.push(renderCodeBlock(route.syntax));
  parts.push("\n");

  for (const example of route.examples) {
    parts.push(renderExample(example));
  }

  return parts.join("");
}
