/**
 * Helpers for `scripts/build-references.ts`.
 *
 * Factored out so the orchestrator stays under the 200-line ceiling required
 * by `docs/plan/02-core-pipeline-foundation.md` Task 2.5. None of these
 * helpers contain stage-level logic; they are pure utilities the orchestrator
 * leans on for version resolution, summary construction, and per-version
 * processing.
 */

import { discoverVersions, DiscoverError } from "./discover.js";
import { IOError } from "./errors.js";
import { emitProgress, emitWarning, type OutputContext } from "./output.js";
import { validateVersion, type ValidationIssue } from "./validate.js";
import type {
  BuildSummary,
  CliOptions,
  VersionResult,
} from "../types/cli.js";

/**
 * Resolve which versions to process from the parsed CLI options.
 *
 * If `--only` is set, returns just that one version. Otherwise scans the
 * source root via {@link discoverVersions}. Discovery errors translate
 * into a structured {@link IOError} so the orchestrator's error path is
 * uniform.
 * @param opts - Parsed CLI options.
 * @returns Sorted list of version strings.
 * @throws {IOError} When `discoverVersions` cannot read the source root.
 */
export function resolveVersions(opts: CliOptions): string[] {
  if (opts.only) return [opts.only];
  try {
    return discoverVersions(opts.sourceRoot);
  } catch (err) {
    if (err instanceof DiscoverError) {
      throw new IOError({
        message: err.message,
        operation: "discover",
        path: err.path,
        cause: err,
      });
    }
    throw err;
  }
}

/**
 * Pick the {@link BuildSummary.mode} discriminator.
 *
 * Precedence (per Task 2.7): `--validate-only` wins over `--dry-run`,
 * which wins over the default `"build"`.
 * @param opts - Parsed CLI options.
 * @returns The mode label that appears in the JSON summary.
 */
export function selectMode(opts: CliOptions): BuildSummary["mode"] {
  if (opts.validateOnly) return "validate-only";
  if (opts.dryRun) return "dry-run";
  return "build";
}

/**
 * Build a `BuildSummary` from a list of per-version results.
 *
 * Counts succeeded/failed versions and stamps the orchestrator's exit
 * code into the summary so JSON consumers see the same number the process
 * will return.
 * @param opts - Parsed CLI options (used only to derive `mode`).
 * @param buildScriptVersion - Hardcoded generator version string.
 * @param results - Per-version outcomes from `processVersion`.
 * @param exitCode - Exit code the orchestrator will return.
 * @returns The aggregated summary record.
 */
export function buildSummary(
  opts: CliOptions,
  buildScriptVersion: string,
  results: VersionResult[],
  exitCode: number,
): BuildSummary {
  const versionsSucceeded = results.filter((r) => r.ok).length;
  return {
    buildScriptVersion,
    mode: selectMode(opts),
    versions: results,
    versionsSucceeded,
    versionsFailed: results.length - versionsSucceeded,
    exitCode,
  };
}

/**
 * Convert internal {@link ValidationIssue} records into the JSON-summary
 * error shape carried on {@link VersionResult}.
 * @param issues - Issues collected by `validateVersion`.
 * @returns Plain serialisable error entries with optional `file`.
 */
function toErrorEntries(
  issues: ValidationIssue[],
): Array<{ kind: string; message: string; file?: string }> {
  return issues.map((issue) => {
    const entry: { kind: string; message: string; file?: string } = {
      kind: issue.kind,
      message: issue.message,
    };
    if (issue.file !== undefined) entry.file = issue.file;
    return entry;
  });
}

/**
 * Process one version through the M2 pipeline.
 *
 * Runs validation, surfaces every issue on stderr in the
 * problem-matcher-friendly `ERROR: <file>: <kind>: <msg>` form, and emits
 * "would render" progress lines in dry-run mode (verbose-gated). M3-M5
 * will plug renderers and the index builder into this function without
 * touching the orchestrator.
 *
 * Returns a Promise so future renderer plumbing (atomic file writes are
 * async) can slot in without changing the call site.
 * @param version - OpenSIPs version (e.g. `"3.6"`).
 * @param opts - Parsed CLI options.
 * @param ctx - Output context for progress/warning emission.
 * @returns A {@link VersionResult} aggregating validation outcome and
 *   counts. Never throws on validation failures.
 */
export function processVersion(
  version: string,
  opts: CliOptions,
  ctx: OutputContext,
): Promise<VersionResult> {
  if (ctx.verbose) emitProgress(`Processing version ${version}...`, ctx);

  const validation = validateVersion(opts.sourceRoot, version);

  if (ctx.verbose) {
    emitProgress(
      `  Validated ${validation.fileCount} files (${validation.documents.core.length} core, ${validation.documents.modules.length} modules, ${validation.documents.guides.length} guides)`,
      ctx,
    );
  }

  for (const issue of validation.issues) {
    process.stderr.write(
      `ERROR: ${issue.file}: ${issue.kind}: ${issue.message}\n`,
    );
  }

  if (validation.ok) {
    const moduleCount = validation.documents.modules.length;
    const coreCount = validation.documents.core.length;
    if (opts.dryRun) {
      if (ctx.verbose) {
        emitProgress(
          `  Would render ${moduleCount} module files (dry-run)`,
          ctx,
        );
        emitProgress(`  Would render ${coreCount} core files (dry-run)`, ctx);
        emitProgress(`  Would build consolidated index (dry-run)`, ctx);
      }
    } else if (!opts.validateOnly && ctx.verbose) {
      emitWarning(
        `${version}: renderers not yet implemented; only validation ran`,
        ctx,
      );
    }
  }

  return Promise.resolve({
    version,
    ok: validation.ok,
    filesValidated: validation.fileCount,
    filesRendered: 0,
    errors: toErrorEntries(validation.issues),
  });
}
