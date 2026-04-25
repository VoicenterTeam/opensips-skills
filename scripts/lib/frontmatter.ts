/**
 * Provenance HTML-comment renderer for generated reference files.
 *
 * Every Markdown file produced by the build pipeline begins with an HTML
 * comment block carrying provenance metadata (source path, generator
 * version, OpenSIPs version, document type). The canonical format is
 * specified in `docs/architecture/rendering-templates.md` §2.2 and must
 * match byte-for-byte across runs so that build output is deterministic.
 *
 * This module is the single source of truth for that block. Other
 * renderers compose it via {@link renderProvenance} rather than emitting
 * the comment string by hand, which keeps the format change-controlled to
 * one place.
 */

/** Fields that compose the provenance HTML comment block. */
export interface ProvenanceOptions {
  /** Source file path relative to repo root, e.g., `"data/3.6/modules/tm.json"`. */
  generatedFrom: string;
  /** Generator (build script) version, e.g., `"0.1.0"`. */
  generatorVersion: string;
  /** OpenSIPs version this content describes, e.g., `"3.6"`. */
  opensipsVersion: string;
  /** Document type, e.g., `"module"`, `"core_variable"`, `"module_split"`, `"guide"`. */
  docType: string;
}

/**
 * Field names in declaration order. Used by {@link renderProvenance} to
 * iterate the input fields when validating, so that error messages name
 * fields in a stable order regardless of property iteration order.
 */
const FIELD_KEYS = [
  "generatedFrom",
  "generatorVersion",
  "opensipsVersion",
  "docType",
] as const satisfies readonly (keyof ProvenanceOptions)[];

/**
 * Render the canonical provenance HTML comment block per
 * `docs/architecture/rendering-templates.md` §2.2.
 *
 * Output format (byte-exact, with one trailing newline):
 *
 * ```text
 * <!-- generated-from: ${generatedFrom}
 *      generator-version: ${generatorVersion}
 *      opensips-version: ${opensipsVersion}
 *      doc-type: ${docType} -->
 * ```
 *
 * Continuation lines use a 5-space indent so the field labels align
 * directly under `generated-from:` (the opening `<!-- ` is 5 characters).
 * @param opts - Provenance fields. All four are required and must not
 *   contain newline characters or the HTML-comment terminator `-->`.
 * @returns The comment block as a string with exactly one trailing
 *   newline.
 * @throws Error when any field contains a newline (`\n`) or the
 *   comment-terminator sequence (`-->`). Either would break the HTML
 *   comment: a newline corrupts the indented continuation layout and
 *   `-->` would close the comment prematurely. The thrown error names
 *   the offending field and which forbidden sequence was found.
 */
export function renderProvenance(opts: ProvenanceOptions): string {
  for (const key of FIELD_KEYS) {
    const value = opts[key];
    if (value.includes("\n")) {
      throw new Error(
        `renderProvenance: field "${key}" must not contain a newline (forbidden because it would break the HTML comment layout)`,
      );
    }
    if (value.includes("-->")) {
      throw new Error(
        `renderProvenance: field "${key}" must not contain the comment-terminator sequence "-->" (it would prematurely close the HTML comment)`,
      );
    }
  }

  return (
    `<!-- generated-from: ${opts.generatedFrom}\n` +
    `     generator-version: ${opts.generatorVersion}\n` +
    `     opensips-version: ${opts.opensipsVersion}\n` +
    `     doc-type: ${opts.docType} -->\n`
  );
}
