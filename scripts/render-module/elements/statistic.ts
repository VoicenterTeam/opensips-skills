/**
 * Renderer for a single exported statistic.
 *
 * Implements the per-item Markdown shape specified in
 * `docs/architecture/rendering-templates.md` §3.1.8 (Exported Statistics).
 * The statistic block is intentionally lean: a backticked-name heading,
 * a prose description, and an optional bulleted property list with up to
 * three keys (Type / Reset / Access). No example block is ever emitted —
 * statistics are observed values, not invocable APIs.
 *
 * Heading level is parameterised: H3 for module-scoped rendering (the
 * default, per §3.1.8) and H2 for the M4 core-types aggregator that
 * promotes every item one level (per §3.2.2).
 */
import type { Statistic } from "../../schemas/module-sections.schema.js";
import {
  renderH2,
  renderH3,
  renderInlineCode,
  renderPropertyList,
  type Property,
} from "../../lib/markdown-builders.js";

/**
 * Render a single {@link Statistic} as a Markdown block.
 *
 * Output structure (per `rendering-templates.md` §3.1.8):
 *
 *   1. Heading line: `### \`{name}\`` (H3 default, H2 when `headingLevel=2`).
 *   2. Blank line.
 *   3. Description prose.
 *   4. Optional property list — bullets are emitted only for fields that
 *      are populated:
 *        - `**Type:**` from `type` (string, including the schema's enum
 *          literals `counter` / `gauge` / `histogram`, but accepting any
 *          string per the schema's `z.enum().or(z.string())`).
 *        - `**Reset:**` from `reset_method`.
 *        - `**Access:**` from `access_methods` joined with `, `.
 *      If all three are absent the property list is suppressed entirely
 *      (no empty bullet block, no stray blank line).
 *   5. Trailing newline.
 *
 * No example block is rendered — statistics are observed via MI / Prometheus,
 * not invoked from script, so a contrived example would be misleading.
 * @param stat - The statistic to render.
 * @param headingLevel - `3` (default) for per-module rendering, `2` for the
 *   M4 core-types aggregator that promotes items one heading level.
 * @returns A Markdown string ending in exactly one trailing newline.
 * @example
 * renderStatistic({
 *   name: "tm:received_replies",
 *   type: "counter",
 *   description: "Counter of all SIP replies received by the tm module.",
 *   access_methods: ["mi", "prometheus"],
 *   reset_method: "via `mi statistics_reset tm:received_replies`",
 * });
 * // ### `tm:received_replies`
 * //
 * // Counter of all SIP replies received by the tm module.
 * //
 * // - **Type:** counter
 * // - **Reset:** via `mi statistics_reset tm:received_replies`
 * // - **Access:** mi, prometheus
 */
export function renderStatistic(stat: Statistic, headingLevel: 2 | 3 = 3): string {
  const renderHeading = headingLevel === 2 ? renderH2 : renderH3;
  const heading = renderHeading(renderInlineCode(stat.name));

  const properties: Property[] = [];
  if (stat.type !== undefined && stat.type !== null && stat.type !== "") {
    properties.push({ key: "Type", value: stat.type });
  }
  if (stat.reset_method !== undefined && stat.reset_method !== "") {
    properties.push({ key: "Reset", value: stat.reset_method });
  }
  if (stat.access_methods !== undefined && stat.access_methods.length > 0) {
    properties.push({
      key: "Access",
      value: stat.access_methods.join(", "),
    });
  }

  const propertyList = renderPropertyList(properties);
  const propertyBlock = propertyList === "" ? "" : `\n${propertyList}`;

  return `${heading}\n${stat.description}\n${propertyBlock}`;
}
