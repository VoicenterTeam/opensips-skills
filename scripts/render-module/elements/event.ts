/**
 * Render a single {@link Event} to the Markdown form mandated by
 * `docs/architecture/rendering-templates.md` §3.1.9 ("Exported Events").
 *
 * The function is the per-item building block used by both the per-module
 * renderer (where events appear under the `## Exported Events` H2 with H3
 * items) and the aggregated core-events renderer (`events.md`, where events
 * are H2 items, hence the `headingLevel` parameter).
 *
 * Output shape (with all optionals present):
 *
 * ```markdown
 * ### `E_TM_BRANCH_FAILED`
 *
 * Triggered when a branch within a transaction receives a final negative reply.
 *
 * **Parameters:**
 *
 * - `tindex` *(integer)* — transaction hash table index
 * - `tlabel` *(integer)* — transaction label
 *
 * **Subscribe via:** `event_route[E_TM_BRANCH_FAILED]` or `subscribe_event` MI command
 *
 * **Example.** Subscribe to the event in a route block.
 *
 * ```opensips
 * event_route[E_TM_BRANCH_FAILED] { ... }
 * ```
 * ```
 *
 * Optional-block rules:
 *   - `**Parameters:**` is omitted when `parameters` is empty.
 *   - `**Subscribe via:**` is omitted when `subscribe_method` is unset.
 *   - The `**Example.**` block is omitted when `examples` is unset or empty.
 *     When present, every example is emitted in source order, each with its
 *     own bold caption and fenced code block. The fence tag comes from each
 *     example's `language` field, defaulting to `opensips` when empty.
 *
 * Unlike function parameters, event parameters carry no `required`/`optional`
 * marker — events have a fixed payload, so the per-parameter line is
 * intentionally `` - `${name}` *(${type})* — ${description}``.
 */

import {
  renderH2,
  renderH3,
  renderInlineCode,
  renderBold,
  renderCodeBlock,
  renderBulletList,
} from "../../lib/markdown-builders.js";
import type { Event } from "../../schemas/module-sections.schema.js";

/**
 * Render an {@link Event} as a self-contained Markdown block.
 *
 * The result always ends in exactly one trailing newline, matching the
 * trailing-newline contract of the heading helpers in `markdown-builders`.
 * Callers that compose multiple element blocks in sequence are responsible
 * for inserting the blank-line gap between them.
 * @param event - The event to render. Schema-validated upstream.
 * @param headingLevel - `3` (default) for module-level rendering where
 *   events appear as H3 items beneath an `## Exported Events` H2; `2` for
 *   M4 core-aggregated rendering where each event is an H2 item.
 * @returns A Markdown string representing the event, ending in `"\n"`.
 * @example
 * renderEvent({
 *   name: "E_TM_BRANCH_FAILED",
 *   description: "Triggered when a branch fails.",
 *   parameters: [],
 * });
 * // "### `E_TM_BRANCH_FAILED`\n\nTriggered when a branch fails.\n"
 */
export function renderEvent(event: Event, headingLevel: 2 | 3 = 3): string {
  const headingText = renderInlineCode(event.name);
  const heading = headingLevel === 2 ? renderH2(headingText) : renderH3(headingText);

  let out = `${heading}\n${event.description}\n`;

  if (event.parameters.length > 0) {
    const items = event.parameters.map(
      (p) => `${renderInlineCode(p.name)} *(${p.type})* — ${p.description}`,
    );
    out += `\n${renderBold("Parameters:")}\n\n${renderBulletList(items)}`;
  }

  if (event.subscribe_method !== undefined && event.subscribe_method.length > 0) {
    out += `\n${renderBold("Subscribe via:")} ${event.subscribe_method}\n`;
  }

  if (event.examples !== undefined && event.examples.length > 0) {
    for (const example of event.examples) {
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
