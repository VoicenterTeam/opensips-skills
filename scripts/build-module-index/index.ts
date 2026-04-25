/**
 * Module-index build step (M7 task 7.5).
 *
 * Generates the per-version-agnostic module catalog table for
 * `plugins/opensips/skills/opensips-modules/SKILL.md` and replaces the
 * paired marker block (`<!-- MODULE_INDEX:BEGIN -->` ...
 * `<!-- MODULE_INDEX:END -->`) with the rendered table.
 *
 * The displayed catalog comes from a single OpenSIPs version's validated
 * `ModuleDocument` set (typically the highest-numbered version, e.g.
 * `3.6`). The reference-path column uses a literal `{version}` placeholder
 * so the SKILL.md remains version-agnostic — Claude resolves the
 * placeholder at runtime per the version-resolution protocol.
 *
 * The paired-marker approach is chosen over a single one-shot placeholder
 * because the markers persist across rebuilds. Without them, the first
 * rebuild would consume the placeholder and subsequent rebuilds would have
 * nothing to anchor on, defeating idempotency. With the BEGIN/END pair,
 * the body between them is the regenerable region; everything outside is
 * hand-authored prose that the build never touches.
 * @see docs/plan/07-skill-authoring.md Task 7.5
 */

import { atomicWriteFile } from "../lib/fs-helpers.js";
import { sanitizeRenderedText } from "../lib/sanitize.js";
import { validateVersion } from "../lib/validate.js";
import type { ModuleDocument } from "../schemas/modules.schema.js";
import { readFile } from "node:fs/promises";

/**
 * Module catalog row — one entry in the SKILL.md `## Module index` table.
 */
export interface ModuleCatalogRow {
  /** Module name (e.g., `"tm"`). */
  name: string;
  /**
   * Single-line purpose distilled from the module's `overview` field.
   * At most 80 visible characters; ends with `…` (U+2026) when truncated.
   * Pipe characters are escaped as `\|` and newlines are collapsed to
   * single spaces so the value is safe to embed in a Markdown table cell.
   */
  purpose: string;
  /** Reference path with `{version}` placeholder (e.g., `references/{version}/modules/tm.md`). */
  referencePath: string;
}

/** Hard cap for the rendered purpose column (visible characters, including `…`). */
const PURPOSE_MAX_LENGTH = 80;

/** Fallback purpose when a module's overview is empty or whitespace-only. */
const FALLBACK_PURPOSE = "OpenSIPs module";

/** Paired marker — opening tag delimiting the regenerable region. */
const MARKER_BEGIN = "<!-- MODULE_INDEX:BEGIN -->";
/** Paired marker — closing tag delimiting the regenerable region. */
const MARKER_END = "<!-- MODULE_INDEX:END -->";
/** Legacy single placeholder permitted inside the BEGIN/END block. */
const PLACEHOLDER = "<!-- MODULE_INDEX_PLACEHOLDER -->";

/**
 * Markdown table header (column titles).
 */
const TABLE_HEADER = "| Module | Purpose | Reference file |";
/** Markdown table header separator row. */
const TABLE_SEPARATOR = "|---|---|---|";

/**
 * Build catalog rows from one version's validated `ModuleDocument` set.
 *
 * Sorted alphabetically by `module_name`. The Purpose column is the first
 * sentence of the module's `overview` field, sanitized for Markdown
 * table-cell embedding and truncated to {@link PURPOSE_MAX_LENGTH} visible
 * characters (with a trailing `…` if shortened). When the overview is
 * empty or whitespace-only, the row falls back to {@link FALLBACK_PURPOSE}
 * so no module ever ships a blank cell.
 *
 * The reference path uses the literal `{version}` placeholder rather than
 * substituting the source version — the SKILL.md catalog is version-agnostic
 * and Claude resolves the placeholder at runtime per the version-resolution
 * protocol.
 * @param documents - Validated module documents (one per module).
 * @returns Sorted catalog rows, one per input document.
 * @example
 * ```ts
 * const rows = buildModuleCatalogRows([tmDocument, accDocument]);
 * // → [
 * //     { name: "acc", purpose: "...", referencePath: "references/{version}/modules/acc.md" },
 * //     { name: "tm",  purpose: "...", referencePath: "references/{version}/modules/tm.md" },
 * //   ]
 * ```
 */
export function buildModuleCatalogRows(documents: ModuleDocument[]): ModuleCatalogRow[] {
  const rows: ModuleCatalogRow[] = documents.map((doc) => ({
    name: doc.module_name,
    purpose: extractPurpose(doc.overview),
    referencePath: `references/{version}/modules/${doc.module_name}.md`,
  }));
  rows.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return rows;
}

/**
 * Render catalog rows as a Markdown table.
 *
 * The table always includes the header row and the separator row; data
 * rows follow in input order (callers are expected to pass already-sorted
 * rows from {@link buildModuleCatalogRows}).
 *
 * The output ends with exactly one trailing newline so it composes
 * cleanly into the BEGIN/END marker block in the SKILL.md.
 * @param rows - Catalog rows to render.
 * @returns Markdown table as a single string with a single trailing newline.
 * @example
 * ```ts
 * const md = renderModuleCatalogTable([
 *   { name: "tm", purpose: "Stateful processing", referencePath: "references/{version}/modules/tm.md" },
 * ]);
 * // → "| Module | Purpose | Reference file |\n|---|---|---|\n| `tm` | Stateful processing | `references/{version}/modules/tm.md` |\n"
 * ```
 */
export function renderModuleCatalogTable(rows: ModuleCatalogRow[]): string {
  const lines: string[] = [TABLE_HEADER, TABLE_SEPARATOR];
  for (const row of rows) {
    lines.push(`| \`${row.name}\` | ${row.purpose} | \`${row.referencePath}\` |`);
  }
  return `${lines.join("\n")}\n`;
}

/**
 * Replace the BEGIN/END marker block in a SKILL.md content string with the
 * given catalog table.
 *
 * The function looks for the substring delimited by
 * `<!-- MODULE_INDEX:BEGIN -->` and `<!-- MODULE_INDEX:END -->` and
 * replaces everything between them with `\n<table>\n`. Markers are
 * preserved across rebuilds, so calling this function repeatedly with the
 * same input + table is idempotent.
 *
 * Throws when neither the BEGIN/END pair nor the legacy
 * `<!-- MODULE_INDEX_PLACEHOLDER -->` comment is present, so a broken
 * pipeline surfaces visibly rather than silently shipping an unmodified
 * file.
 * @param skillMdContent - Current SKILL.md content as a string.
 * @param table - Rendered catalog table (typically from {@link renderModuleCatalogTable}).
 * @returns Updated SKILL.md content with the marker block contents replaced.
 * @throws Error When the placeholder/marker block cannot be located.
 * @example
 * ```ts
 * const updated = injectModuleIndex(currentMd, renderedTable);
 * await atomicWriteFile(skillMdPath, updated);
 * ```
 */
export function injectModuleIndex(skillMdContent: string, table: string): string {
  const beginIdx = skillMdContent.indexOf(MARKER_BEGIN);
  const endIdx = skillMdContent.indexOf(MARKER_END);

  if (beginIdx !== -1 && endIdx !== -1 && endIdx > beginIdx) {
    const before = skillMdContent.slice(0, beginIdx + MARKER_BEGIN.length);
    const after = skillMdContent.slice(endIdx);
    // Normalize the inner block to: BEGIN\n<table>\nEND
    // (table itself ends with a single \n, so the join produces clean output).
    return `${before}\n${table}${after}`;
  }

  // No paired markers: refuse to silently ship an unmodified file.
  throw new Error(
    `Module-index marker block not found in SKILL.md content: expected paired \`${MARKER_BEGIN}\` ... \`${MARKER_END}\` (legacy single \`${PLACEHOLDER}\` is also unsupported without paired markers).`,
  );
}

/**
 * End-to-end build step.
 *
 * Reads the SKILL.md, validates the source modules for the given version,
 * builds the catalog rows, renders the table, injects it into the SKILL.md
 * content (replacing the BEGIN/END marker block), and writes the result
 * atomically.
 *
 * Aborts with a thrown error if validation produces any issues — a stale
 * or partially-valid source set must not silently ship into a SKILL.md.
 * @param skillMdPath - Absolute path to the modules SKILL.md.
 * @param sourceRoot - Source-data root (typically `"./data"` per ADR-009).
 * @param latestVersion - Version whose module set drives the catalog
 *   (typically the highest-numbered, e.g., `"3.6"`).
 * @returns Promise that resolves once the SKILL.md has been rewritten.
 * @throws Error When validation reports any issue or when the SKILL.md
 *   does not contain the BEGIN/END marker block.
 * @example
 * ```ts
 * await rebuildModuleIndex(
 *   "plugins/opensips/skills/opensips-modules/SKILL.md",
 *   "./data",
 *   "3.6",
 * );
 * ```
 */
export async function rebuildModuleIndex(
  skillMdPath: string,
  sourceRoot: string,
  latestVersion: string,
): Promise<void> {
  const result = validateVersion(sourceRoot, latestVersion);
  if (!result.ok) {
    const summary = result.issues
      .slice(0, 5)
      .map((i) => `  - ${i.kind}: ${i.message}`)
      .join("\n");
    const moreSuffix =
      result.issues.length > 5 ? `\n  ... and ${result.issues.length - 5} more` : "";
    throw new Error(
      `Cannot build module index: validation of ${latestVersion} produced ${result.issues.length} issue(s):\n${summary}${moreSuffix}`,
    );
  }

  const documents = result.documents.modules as ModuleDocument[];
  const rows = buildModuleCatalogRows(documents);
  const table = renderModuleCatalogTable(rows);

  const skillMdContent = await readFile(skillMdPath, "utf8");
  const updated = injectModuleIndex(skillMdContent, table);
  await atomicWriteFile(skillMdPath, updated);
}

/**
 * Render a complete `modules-index.md` reference file for the given version.
 *
 * Combines:
 * 1. A top-level `# OpenSIPs module index` heading and intro paragraph.
 * 2. A `## Module index` section with the rendered catalog table (sorted
 *    alphabetically, `{version}` placeholder in reference paths).
 * 3. Verbatim lookup-discipline prose lifted from the deleted
 *    `plugins/opensips/skills/opensips-modules/SKILL.md` (recoverable from
 *    `git show HEAD~1:plugins/opensips/skills/opensips-modules/SKILL.md`).
 *
 * The output ends with exactly one trailing newline.
 * @param documents - Validated module documents for the version.
 * @param version - Active OpenSIPs version string (e.g., `"3.6"`). Used in
 *   the intro paragraph. Does NOT substitute `{version}` in reference paths —
 *   those remain literal placeholders as produced by {@link renderModuleCatalogTable}.
 * @returns Complete Markdown string for `references/{version}/modules-index.md`.
 */
export function renderModulesIndexMarkdown(
  documents: ModuleDocument[],
  version: string,
): string {
  const rows = buildModuleCatalogRows(documents);
  const table = renderModuleCatalogTable(rows);

  const sections: string[] = [];

  sections.push(`# OpenSIPs module index`);
  sections.push(`\nGenerated reference for OpenSIPs ${version}. This file is the module catalog for the \`opensips-modules\` skill. It maps every module in the active reference set to its per-module reference file and provides the lookup-discipline guidance that governs how Claude uses the reference set.`);

  sections.push(`\n## Module index\n`);
  sections.push(table);

  sections.push(`## How to use this file

The per-module reference file under \`references/{version}/modules/<slug>.md\` is the authoritative source of truth for everything that module exports. Read it before answering. Do not infer module behavior from training-data priors; the priors are unreliable across the SER lineage and across OpenSIPs versions.

The path pattern is fixed:

- Per-module reference file: \`references/{version}/modules/<slug>.md\`. Substitute \`{version}\` at read time with the active OpenSIPs version (e.g., \`3.6\`). Substitute \`<slug>\` with the module name as it appears in the index below.
- Consolidated index: \`references/{version}/consolidated.json\`. A structured JSON index of every module, function, pseudo-variable, parameter, MI command, and statistic in the version, plus a \`relationships.moduleDependencies\` graph.

The consolidated index is the fastest path when the user references an identifier without naming a module:

- To find which module exports a function whose home module is unclear, Read \`consolidated.json\` and look up \`indexes.functionsByName[<function>]\` to find the source module, then Read that module's per-module reference file for the full signature.
- To find which module defines a pseudo-variable, look up \`indexes.variablesByName[<variable>]\`.
- To find which module exposes an MI command, look up \`indexes.miCommandsByName[<command>]\`.
- To list all parameters of a known module, look up \`indexes.parametersByModule[<module>]\`.
- To check what other modules a given module depends on, look up \`relationships.moduleDependencies[<module>]\`.

Two-step lookup is the canonical pattern: Read \`consolidated.json\` to locate the source, then Read the per-module file for full content. Do not skip the second Read — the consolidated index does not contain function descriptions, parameter narratives, or usage examples.

When a user prompt names multiple modules, Read each per-module reference file in turn rather than answering from a single read. Cross-module behavior (e.g., how \`tm\` interacts with \`dialog\`) is described in each module's reference file separately; the consolidated index links them through the dependencies graph but does not narrate the interaction.`);

  sections.push(`\n## Lookup discipline

The router-index pattern depends on Claude making the second hop. The most consequential failure mode for this skill is triggering on a module mention, reading the index entry to confirm the module exists, and then answering the user's substantive question from training-data priors instead of the per-module reference. The index entry is a routing signal, not an answer.

- **Wrong shape.** User asks for \`dialog\` module's exported functions. Claude reads the index, sees \`dialog\` listed, then writes a function list from priors without opening \`dialog.md\`. The answer may look plausible and may even be partially correct, but version-specific signatures and parameter orderings are not reliably reproducible from priors.
- **Right shape.** User asks for \`dialog\` module's exported functions. Claude reads the index to confirm the module slug, Reads \`references/{version}/modules/dialog.md\`, and answers from the file's exported-functions section, quoting signatures verbatim from the reference.

The same discipline applies when the user asks a follow-up. A second question about the same module is a second Read of the same file (or a re-quote from the previous Read in the same session); it is not an opportunity to fall back on priors because "we just looked at this module."`);

  sections.push(`\n## What the per-module reference file contains

Each \`references/{version}/modules/<slug>.md\` is a generated reference covering one module's full surface area. The sections present in every per-module file are:

- **Overview** — what the module does and its role in a configuration.
- **Dependencies** — other modules that must be loaded for this module to function, plus optional modules that enable additional features when also loaded.
- **External dependencies** — system-level requirements (libraries, daemons, database schemas).
- **Parameters** — every \`modparam(...)\` exposed by the module, with type, default, valid values, and description.
- **Exported functions** — every script-callable function with full signatures, parameter types, return values, and the route types in which the function is valid.
- **Exported pseudo-variables** — variables added by the module, read/write semantics, and the contexts in which they are populated.
- **Exported MI commands** — management interface commands the module registers, with arguments and return shapes.
- **Exported statistics** — counters and gauges the module publishes.
- **Exported events** — event names the module raises through \`event_route\` blocks.

Not every module exposes every category. A module with no MI commands has no MI section. The presence or absence of a section is itself information — if the user asks about an MI command for a module whose reference file has no MI section, the command does not exist in this version and the user is likely confusing modules or versions.`);

  sections.push(`\n## Version-specific behavior

Module exports change between OpenSIPs versions. A function that exists in the active version may have had a different signature in a prior version, or may not have existed at all. Always Read the per-module reference file under the version directory the user is working in. Do not assume cross-version equivalence. If the user has not specified a version, ask before answering — the answer is genuinely different across versions, and a version-correct answer to the wrong version is still wrong.`);

  sections.push(`\n## When a module is not in the index

If a user names a module that does not appear in the index above:

1. **Check for typos.** Compare the user's spelling against the index. Common slips: hyphen vs. underscore (\`mid-registrar\` vs \`mid_registrar\`), missing or extra \`_db\` / \`_mysql\` / \`_postgres\` suffixes, plural vs. singular (\`registrars\` vs \`registrar\`), pluralized verb forms.
2. **Check the consolidated index.** Read \`references/{version}/consolidated.json\` and search for the name across \`indexes.functionsByName\`, \`indexes.variablesByName\`, \`indexes.miCommandsByName\`, and \`indexes.parametersByModule\`. A module that has been renamed in a recent version, or that the user is referring to by a function it exports rather than by its module name, may surface here even when the module-name table does not list it.
3. **Check the other version's index.** If the user is working with a version different from the one in \`{version}\`, the module may exist there. Confirm the version explicitly and switch the lookup.
4. **Ask the user.** If none of the above resolves the name, ask. Do not invent module names, function signatures, parameters, pseudo-variables, MI commands, or statistics. Do not guess at a "probably correct" answer based on training-data priors — those priors mix identifiers across the SER lineage and across OpenSIPs versions and are unreliable.

If a module is not in the index and not in the \`consolidated.json\`, treat it as unknown and ask for clarification before answering. The cost of one clarifying turn is small; the cost of a fabricated identifier landing in a user's production configuration is large because the failure mode is silent — the config loads, the proxy starts, and a call path silently misbehaves.

The same procedure applies to functions, pseudo-variables, MI commands, statistics, and events that the user names without naming a module. If the consolidated index has no record of the identifier across \`indexes.functionsByName\`, \`indexes.variablesByName\`, \`indexes.miCommandsByName\`, and the per-module statistics or events sections, the identifier is unknown to this version's reference set. Ask the user to confirm the identifier and the version; do not improvise.

A particular failure mode worth naming: an identifier that "feels right" because it follows a familiar naming convention (\`pv_<thing>\`, \`<module>_send\`, \`<module>_check\`) is not evidence that the identifier exists. Naming conventions are widely shared across the SER lineage, and the priors are confidently wrong about which conventions belong to which project's current releases. When the consolidated index disagrees with priors, the index wins.`);

  return sections.join("") + "\n";
}

/**
 * Extract a clean, table-cell-safe purpose string from a module's
 * `overview` field.
 *
 * Pipeline:
 * 1. Strip Markdown code-fence boundary backticks.
 * 2. Take the first sentence (split on `". "` followed by an uppercase
 * letter, so abbreviations like `e.g.` don't truncate prematurely).
 * 3. Collapse newlines and tabs to single spaces.
 * 4. Escape `|` to `\|` so the table cell parses correctly.
 * 5. Strip a trailing period (the table cell does not need one).
 * 6. Truncate to {@link PURPOSE_MAX_LENGTH} visible chars with a
 * trailing `…` if shortened.
 * 7. Fall back to {@link FALLBACK_PURPOSE} when the result is empty.
 * @param overview - The raw overview field from a module document.
 * @returns Sanitized purpose string suitable for a Markdown table cell.
 */
function extractPurpose(overview: string): string {
  if (!overview || overview.trim() === "") return FALLBACK_PURPOSE;

  // Drop upstream extraction artifacts (U+FFFD, U+200B, over-escaped
  // underscores) before any other transformation so the table cell matches
  // the rendered reference files.
  let text = sanitizeRenderedText(overview);

  // Strip code-fence boundaries; an overview that begins with ``` would
  // otherwise leak the backticks into the cell.
  text = text.replace(/```/g, " ");

  // First sentence: split on ". " followed by an uppercase letter, which
  // approximates a sentence boundary while tolerating common abbreviations
  // (e.g., "e.g.", "i.e.") since those are followed by lowercase.
  const sentenceMatch = /^(.*?[.!?])\s+[A-Z]/s.exec(text);
  if (sentenceMatch && sentenceMatch[1] !== undefined) {
    text = sentenceMatch[1];
  }

  // Collapse whitespace (incl. newlines/tabs) to single spaces.
  text = text.replace(/\s+/g, " ").trim();

  // Escape pipe characters so the Markdown table cell does not split.
  text = text.replace(/\|/g, "\\|");

  // Drop a trailing period — purpose entries read more cleanly without one.
  text = text.replace(/\.$/, "");

  if (text === "") return FALLBACK_PURPOSE;

  // Truncate to PURPOSE_MAX_LENGTH visible characters; the trailing `…`
  // counts as one of the eighty so the rendered cell never exceeds it.
  if (text.length > PURPOSE_MAX_LENGTH) {
    text = `${text.slice(0, PURPOSE_MAX_LENGTH - 1).trimEnd()}…`;
  }
  return text;
}
