/**
 * Pseudo-variable element renderer.
 *
 * Renders a single {@link PseudoVariable} from `module-sections.schema` into
 * the Markdown shape specified by
 * `docs/architecture/rendering-templates.md` §3.1.6 (Exported
 * Pseudo-Variables — authoritative).
 *
 * The rendered block is composed of:
 *   1. A backticked-name heading (H3 by default; H2 when reused for the
 *      aggregated core `variables.md` rendering described in §3.2.2).
 *   2. The description as a single prose paragraph.
 *   3. A property list of the form
 *      `- **Type:** … / **Read/write:** … / **Scope:** … / **Available in:** …`
 *      via {@link renderPropertyList}. The Read/write label is derived from
 *      the `readable` / `writable` boolean pair per the rules in this file's
 *      JSDoc; the `scope` field carries combined scope/route information and
 *      is rendered verbatim under **Scope** and (when it looks like a route
 *      list) re-emitted as **Available in**.
 *   4. When `possible_values` is non-empty, a `**Possible values:**` lead
 *      followed by a bulleted sub-list (mirrors the parameter rendering rule
 *      in §3.1.4).
 *
 * No example block is rendered — the underlying `PseudoVariableSchema`
 * carries no `examples` field. This is intentional and matches §3.1.6's
 * description of the pseudo-variable item shape (the example shown in the
 * spec's worked output corresponds to fields not present in the schema).
 */

import type { PseudoVariable } from "../../schemas/module-sections.schema.js";
import {
  renderH2,
  renderH3,
  renderInlineCode,
  renderBulletList,
  renderPropertyList,
  type Property,
} from "../../lib/markdown-builders.js";

/**
 * Map the (`readable`, `writable`) boolean pair to the human-readable label
 * emitted under `**Read/write:**`.
 *
 * - `readable=true, writable=true` → `"read-write"`
 * - `readable=true, writable=false` → `"read-only"`
 * - `readable=false, writable=true` → `"write-only"`
 * - `readable=false, writable=false` → `"(neither)"` (degenerate; rendered
 *   gracefully so the block remains well-formed even when upstream data is
 *   inconsistent).
 * @param readable - Whether the variable is readable in route script context.
 * @param writable - Whether the variable is assignable in route script context.
 * @returns The human-readable label to embed after `**Read/write:**`.
 */
function readWriteLabel(readable: boolean, writable: boolean): string {
  if (readable && writable) return "read-write";
  if (readable && !writable) return "read-only";
  if (!readable && writable) return "write-only";
  return "(neither)";
}

/**
 * Ensure the rendered name carries the leading `$` sigil.
 *
 * Pseudo-variable names in well-formed source data already include the `$`
 * (e.g. `"$T_branch_idx"`), but defensively prepending it when missing keeps
 * the heading shape stable in the face of upstream extraction noise. The
 * function does not double an existing `$`.
 * @param name - The raw name from the source `PseudoVariable.name` field.
 * @returns The same name with exactly one leading `$`.
 */
function ensureSigil(name: string): string {
  return name.startsWith("$") ? name : `$${name}`;
}

/**
 * Render a single pseudo-variable as a self-contained Markdown block.
 *
 * The output ends in a single trailing newline so it can be concatenated with
 * sibling blocks (or with the next section heading) without bookkeeping. When
 * `possible_values` is empty/undefined, no possible-values block is emitted.
 * @param pv - The pseudo-variable to render.
 * @param headingLevel - Heading level for the variable name. Defaults to `3`
 *   for module-level rendering (per §3.1.6); pass `2` when reusing this
 *   renderer for the aggregated core `variables.md` file (per §3.2.2).
 * @returns The rendered Markdown block, ending in `"\n"`.
 * @example
 * renderPseudoVariable({
 *   name: "$T_branch_idx",
 *   type: "integer",
 *   readable: true,
 *   writable: false,
 *   scope: "transaction",
 *   description: "Returns the index of the current branch.",
 * });
 * // "### `$T_branch_idx`\n\nReturns the index of the current branch.\n\n
 * //  - **Type:** integer\n- **Read/write:** read-only\n- **Scope:** transaction\n"
 */
export function renderPseudoVariable(pv: PseudoVariable, headingLevel: 2 | 3 = 3): string {
  const heading = headingLevel === 2 ? renderH2 : renderH3;
  const title = renderInlineCode(ensureSigil(pv.name));

  const properties: Property[] = [
    { key: "Type", value: pv.type },
    { key: "Read/write", value: readWriteLabel(pv.readable, pv.writable) },
    { key: "Scope", value: pv.scope },
  ];

  let out = "";
  out += heading(title);
  out += "\n";
  out += `${pv.description}\n`;
  out += "\n";
  out += renderPropertyList(properties);

  if (pv.possible_values && pv.possible_values.length > 0) {
    out += "\n";
    out += "**Possible values:**\n";
    out += "\n";
    out += renderBulletList(pv.possible_values);
  }

  return out;
}
