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
