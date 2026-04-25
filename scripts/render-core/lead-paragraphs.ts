/**
 * Hand-written "When to read this file" lead paragraphs for every core
 * document type plus the three guide types.
 *
 * Spec: `docs/architecture/rendering-templates.md` §2.3 (lead-paragraph
 * format), `docs/plan/04-core-type-rendering.md` Task 4.4, and ADR-009 §M4
 * (guide rendering).
 *
 * These are intentionally hand-written rather than synthesized from source:
 * core-doc semantics are uniform, the texts are tiny (one or two sentences),
 * and per-instance customization would not improve them. They are stable
 * across versions; only the active version string is interpolated.
 *
 * Maintenance review accompanies any upstream OpenSIPs core-semantic change
 * (a new core doc type, a new guide type, etc.). Per ADR-008, do NOT mention
 * sibling SER-lineage projects in any lead paragraph.
 */

/**
 * Map from {@link import('./elements').CoreDocType document_type} literal
 * (matches the schema's `document_type` field) to a lead-paragraph factory.
 *
 * Factories receive the active OpenSIPs version and return one or two
 * sentences ending with a clear "Read this file when..." or "Read this file
 * to..." trigger.
 */
export const leadParagraphs: Record<string, (version: string) => string> = {
  core_variable: (version) =>
    `Reference for OpenSIPs ${version} core pseudo-variables. Read this file when constructing route scripts that need to inspect or manipulate SIP message fields, transaction state, or runtime context.`,
  core_function: (version) =>
    `Reference for OpenSIPs ${version} core script functions. Read this file when looking up the signature, return values, or available-in context for any built-in function not exported by a specific module.`,
  core_parameter: (version) =>
    `Reference for OpenSIPs ${version} core global parameters. Read this file when tuning startup-time configuration values that govern the SIP processor itself rather than any single module.`,
  operator: (version) =>
    `Reference for OpenSIPs ${version} script operators. Read this file when writing expressions and need to confirm operand types, precedence, or associativity for arithmetic, comparison, logical, or string operators.`,
  statement: (version) =>
    `Reference for OpenSIPs ${version} script statements. Read this file when assembling control-flow constructs (if, switch, while, return, etc.) or confirming where a given statement is usable.`,
  route_type: (version) =>
    `Reference for OpenSIPs ${version} route block types. Read this file when deciding which route block (request_route, branch_route, failure_route, onreply_route, etc.) should host a given piece of script logic.`,
  transformation: (version) =>
    `Reference for OpenSIPs ${version} transformations. Read this file when manipulating pseudo-variable values inline and need the canonical class, input/output, and chaining behavior of a transformation.`,
  async_statement: (version) =>
    `Reference for OpenSIPs ${version} asynchronous statements. Read this file when designing non-blocking route logic that resumes via async, async_launch, or related continuation primitives.`,
  mi_command: (version) =>
    `Reference for OpenSIPs ${version} core Management Interface (MI) commands. Read this file when looking up command names, parameters, or expected JSON response shapes for runtime control of OpenSIPs.`,
  event: (version) =>
    `Reference for OpenSIPs ${version} core events. Read this file when subscribing to or raising runtime events through event_route blocks or the event-handling MI commands.`,
  statistic: (version) =>
    `Reference for OpenSIPs ${version} core statistics. Read this file when looking up the canonical name, type, or reset semantics of a runtime counter or gauge exposed by the SIP processor itself.`,
  flag: (version) =>
    `Reference for OpenSIPs ${version} message, branch, and script flags. Read this file when setting, clearing, or testing flags from script and need to confirm persistence scope and the available flag-manipulation functions.`,
  installation_guide: (version) =>
    `Compile and install instructions for OpenSIPs ${version}. Read this file when building OpenSIPs from source or preparing a deployment environment.`,
  configuration_guide: (version) =>
    `Configuration walkthrough for OpenSIPs ${version}. Read this file when assembling an opensips.cfg from scratch or restructuring an existing one around the recommended section layout.`,
  syntax_guide: (version) =>
    `Script syntax reference for OpenSIPs ${version}. Read this file when reviewing the language-level rules that govern variables, expressions, statements, and route blocks within an opensips.cfg.`,
};

/**
 * Look up a lead paragraph for a doc type. Throws when no factory is
 * registered, signalling a missing-renderer / new-doc-type situation that
 * should be surfaced loudly rather than papered over with a default.
 * @param docType - The schema's `document_type` literal value (e.g.,
 *   `core_variable`, `mi_command`, `installation_guide`).
 * @param version - Active OpenSIPs version string (e.g., `3.6`). Interpolated
 *   verbatim into the returned sentence.
 * @returns One or two sentences for the file's lead paragraph block, ready
 *   to drop into the rendering pipeline below the H1 + provenance comment.
 * @throws {Error} If `docType` has no registered factory in
 *   {@link leadParagraphs}.
 */
export function getLeadParagraph(docType: string, version: string): string {
  const factory = leadParagraphs[docType];
  if (!factory) {
    throw new Error(
      `No lead paragraph registered for doc type '${docType}'. ` +
        `Add a factory to scripts/render-core/lead-paragraphs.ts or fix the caller.`,
    );
  }
  return factory(version);
}
