/**
 * Renders a single {@link ModuleParameter} as Markdown, per
 * `docs/architecture/rendering-templates.md` §3.1.4.
 *
 * The element renderer is the lowest layer of the module-rendering pipeline.
 * It is invoked once per parameter, and its output is concatenated by the
 * section renderer to produce the full `## Exported Parameters` block.
 *
 * Output blocks (in order, each conditional on its source field):
 *
 *   1. H3 (or H2 when `headingLevel=2`) — `` `{name}` ({type}) ``.
 *   2. Description — prose paragraph(s).
 *   3. `*Default value is {default_value}.*` — italic single line.
 *   4. `**Possible values:**` followed by a bulleted list.
 *   5. `*Valid range: {min} to {max}.*` — italic single line. When only
 *      one bound is set, the wording adapts: "{min} or above" / "up to
 *      {max}". This judgment call mirrors how OpenSIPs upstream prose
 *      describes one-sided ranges.
 *   6. `**Notes:** {notes}` — bold-prefixed paragraph.
 *   7. `**Example.** {caption}.` followed by an `opensips`-fenced code
 *      block. Caption uses `example_value` when set, otherwise the
 *      fallback `Set the \`{name}\` parameter`.
 *
 * Every block emits its own trailing blank-line separator. The function
 * returns one string ending in exactly one trailing newline, matching the
 * convention shared by sibling element renderers (function, pseudo-variable,
 * mi-command, statistic, event, config-example).
 */

import type { ModuleParameter } from "../../schemas/module-sections.schema.js";
import {
  renderBold,
  renderBulletList,
  renderCodeBlock,
  renderH2,
  renderH3,
  renderInlineCode,
  renderItalic,
} from "../../lib/markdown-builders.js";

/**
 * Render the H3 (or H2) heading for a parameter: backticked name plus
 * parenthesized type.
 * @param param - Parameter providing `name` and `type`.
 * @param headingLevel - 2 or 3.
 * @returns A single heading line ending in `"\n"`.
 */
function renderHeading(param: ModuleParameter, headingLevel: 2 | 3): string {
  const title = `${renderInlineCode(param.name)} (${param.type})`;
  return headingLevel === 2 ? renderH2(title) : renderH3(title);
}

/**
 * Render the italic `*Default value is X.*` line, or the empty string when
 * `default_value` is unset / empty.
 * @param param - Parameter to inspect.
 * @returns The default-value line plus blank-line separator, or `""`.
 */
function renderDefaultValue(param: ModuleParameter): string {
  if (param.default_value === undefined || param.default_value === "") {
    return "";
  }
  return `${renderItalic(`Default value is ${param.default_value}.`)}\n\n`;
}

/**
 * Render the **Possible values:** label and bulleted list, or the empty
 * string when `possible_values` is unset / empty.
 * @param param - Parameter to inspect.
 * @returns The block plus blank-line separator, or `""`.
 */
function renderPossibleValues(param: ModuleParameter): string {
  const values = param.possible_values;
  if (values === undefined || values.length === 0) {
    return "";
  }
  return `${renderBold("Possible values:")}\n\n${renderBulletList(values)}\n`;
}

/**
 * Render the italic `*Valid range: …*` line, with the wording adapting to
 * which bounds are present. Returns the empty string when neither bound is
 * set.
 * @param param - Parameter to inspect.
 * @returns The valid-range line plus blank-line separator, or `""`.
 */
function renderValidRange(param: ModuleParameter): string {
  const min = param.valid_range_min;
  const max = param.valid_range_max;
  let body: string;
  if (min !== undefined && max !== undefined) {
    body = `Valid range: ${min} to ${max}.`;
  } else if (min !== undefined) {
    body = `Valid range: ${min} or above.`;
  } else if (max !== undefined) {
    body = `Valid range: up to ${max}.`;
  } else {
    return "";
  }
  return `${renderItalic(body)}\n\n`;
}

/**
 * Render the `**Notes:** …` paragraph, or the empty string when `notes` is
 * unset / empty.
 * @param param - Parameter to inspect.
 * @returns The notes paragraph plus blank-line separator, or `""`.
 */
function renderNotes(param: ModuleParameter): string {
  if (param.notes === undefined || param.notes === "") {
    return "";
  }
  return `${renderBold("Notes:")} ${param.notes}\n\n`;
}

/**
 * Render the `**Example.** …` caption plus opensips-fenced code block, or
 * the empty string when `example_code` is unset / empty.
 * @param param - Parameter to inspect.
 * @returns The example block plus blank-line separator, or `""`.
 */
function renderExample(param: ModuleParameter): string {
  if (param.example_code === undefined || param.example_code === "") {
    return "";
  }
  const captionText =
    param.example_value !== undefined && param.example_value !== ""
      ? param.example_value
      : `Set the \`${param.name}\` parameter`;
  const caption = `${renderBold("Example.")} ${captionText}.`;
  return `${caption}\n\n${renderCodeBlock(param.example_code, "opensips")}\n`;
}

/**
 * Render a single {@link ModuleParameter} as Markdown.
 *
 * The output is a self-contained block that begins with a heading, ends in
 * exactly one trailing newline, and inserts a blank line between every
 * sub-block that is actually emitted (default, possible values, valid
 * range, notes, example). Sub-blocks are omitted entirely when their
 * source field is missing or empty.
 * @param param - The parameter to render.
 * @param headingLevel - `3` by default (per §3.1.4 module rendering); `2`
 *   when used in core-type aggregation by M4. Other levels are not
 *   supported.
 * @returns Markdown string ending in exactly one trailing newline.
 * @example
 * renderParameter({
 *   name: "fr_timeout",
 *   type: "integer",
 *   description: "Final-reply timeout in seconds.",
 *   default_value: "30 seconds",
 *   example_code: 'modparam("tm", "fr_timeout", 10)',
 * });
 * // "### `fr_timeout` (integer)\n\nFinal-reply timeout in seconds.\n\n
 * //  *Default value is 30 seconds.*\n\n**Example.** Set the
 * //  `fr_timeout` parameter.\n\n```opensips\nmodparam(\"tm\",
 * //  \"fr_timeout\", 10)\n```\n"
 */
export function renderParameter(param: ModuleParameter, headingLevel: 2 | 3 = 3): string {
  const heading = renderHeading(param, headingLevel);
  const description = `${param.description}\n`;
  const defaultLine = renderDefaultValue(param);
  const possible = renderPossibleValues(param);
  const range = renderValidRange(param);
  const notes = renderNotes(param);
  const example = renderExample(param);

  const optionalBlocks = [defaultLine, possible, range, notes, example].filter(
    (block) => block !== "",
  );

  if (optionalBlocks.length === 0) {
    return `${heading}\n${description}`;
  }

  // The description is followed by a blank line before the first optional
  // block; each optional block already includes its own blank-line
  // separator. The last block ends in `\n\n`, but the function contract
  // is exactly one trailing newline — strip one.
  const tail = optionalBlocks.join("");
  const body = `${description}\n${tail}`;
  return `${heading}\n${body.replace(/\n+$/, "\n")}`;
}
