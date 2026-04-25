/**
 * Parsed command-line options for the build orchestrator.
 *
 * Sourced from docs/plan/02-core-pipeline-foundation.md Task 2.6 and
 * docs/architecture/data-pipeline.md §6.3. Per ADR-009, sourceRoot defaults
 * to "./data" rather than the original spec's "./source".
 *
 * Mutually-exclusive combinations (validated at parse time, not at type level):
 *   --quiet AND --verbose  → UsageError
 */
export interface CliOptions {
  /** Single-version build. When undefined, build all versions discovered under sourceRoot. */
  only?: string;
  /** With --only, restrict to a single module slug (its index entry only). */
  onlyModule?: string;
  /** Validate + report what would render; no files written. */
  dryRun: boolean;
  /** Stop at the first validation error. Default: collect all. */
  failFast: boolean;
  /** Emit per-file progress to stderr. */
  verbose: boolean;
  /** Suppress non-error output. */
  quiet: boolean;
  /** Emit machine-readable JSON summary on stdout (suppresses human output). */
  json: boolean;
  /** Source root override (default "./data" per ADR-009). */
  sourceRoot: string;
  /** Output root override (default "./plugins/opensips/skills"). */
  outputRoot: string;
  /** When true, only the validation stage runs; renderers are skipped. */
  validateOnly: boolean;
}

/** Default values applied when a CLI flag is not provided. */
export const DEFAULT_CLI_OPTIONS: Readonly<
  Pick<
    CliOptions,
    | "dryRun"
    | "failFast"
    | "verbose"
    | "quiet"
    | "json"
    | "sourceRoot"
    | "outputRoot"
    | "validateOnly"
  >
> = Object.freeze({
  dryRun: false,
  failFast: false,
  verbose: false,
  quiet: false,
  json: false,
  sourceRoot: "./data",
  outputRoot: "./plugins/opensips/skills",
  validateOnly: false,
});

/**
 * One version's processing outcome — surfaced in both human-readable summaries
 * and the JSON output mode.
 */
export interface VersionResult {
  /** OpenSIPs version identifier (e.g. "3.5", "3.6"). */
  version: string;
  /** True if the version processed without errors. */
  ok: boolean;
  /** Count of source files that passed schema validation. */
  filesValidated: number;
  /** Count of output Markdown files rendered (0 in dry-run / validate-only modes). */
  filesRendered: number;
  /**
   * Whether the consolidated index was built for this version. True in normal
   * and dry-run modes when rendering succeeded; false in validate-only mode
   * or when the index build was aborted by an error.
   *
   * The index is a structurally distinct artifact (one JSON file per version)
   * from `filesRendered` (Markdown files), so it is reported on its own
   * counter rather than conflated with the Markdown count.
   */
  indexBuilt: boolean;
  /**
   * True when this version was intentionally skipped via a
   * `data/{version}/.broken` marker file (per ADR-009 — a DATA signal, not a
   * code-level enumeration). Skipped versions still report `ok: true` so the
   * build does not fail; counters (`filesValidated`, `filesRendered`,
   * `indexBuilt`) all stay at zero / false. Optional so existing callers and
   * fixtures remain compatible — absence is equivalent to `false`.
   */
  skipped?: boolean;
  /** Errors collected during validation or rendering for this version. */
  errors: Array<{ kind: string; message: string; file?: string }>;
}

/** Aggregated build result across all processed versions. */
export interface BuildSummary {
  /** Version of the build script that produced this summary. */
  buildScriptVersion: string;
  /** Mode the orchestrator ran in. */
  mode: "build" | "dry-run" | "validate-only";
  /** Per-version outcomes in the order they were processed. */
  versions: VersionResult[];
  /** Number of versions whose `ok` is true (includes skipped versions). */
  versionsSucceeded: number;
  /** Number of versions whose `ok` is false. */
  versionsFailed: number;
  /**
   * Number of versions intentionally skipped via a `.broken` marker. Optional
   * to keep the JSON-summary shape backwards-compatible when no version is
   * skipped. Skipped versions are also counted under `versionsSucceeded`
   * (because `ok` is true), so consumers reading the legacy fields keep
   * seeing the same numbers; this field is purely additive.
   */
  versionsSkipped?: number;
  /** Process exit code the orchestrator will return. */
  exitCode: number;
}
