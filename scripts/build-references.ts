/**
 * opensips-skills build orchestrator.
 *
 * Pure orchestrator: parses the CLI, normalises the environment, runs the
 * schema-hash drift check, discovers versions, and dispatches to per-version
 * processing. Renderer and index logic does NOT live here — see
 * `docs/architecture/data-pipeline.md` §6.1.
 *
 * Exit codes (per `docs/architecture/data-pipeline.md` §4):
 *   0 — success
 *   1 — internal error (unhandled exception)
 *   2 — usage error (bad CLI flags)
 *   3 — validation failure
 *   4 — I/O failure
 *   5 — schema drift
 *
 * For M2 the renderers are not yet implemented; per-version processing
 * runs the validation stage only and reports "would render" counts in
 * dry-run mode (see `processVersion` in `./lib/orchestrator-helpers.ts`).
 * M3/M4/M5 plug renderers and the index builder into that helper without
 * touching this file's orchestration logic.
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { parseCli } from "./lib/cli-parser.js";
import { normalizeEnvironment } from "./lib/environment.js";
import { BuildError, SchemaDriftError, UsageError } from "./lib/errors.js";
import {
  emitError,
  emitProgress,
  emitSummary,
  type OutputContext,
} from "./lib/output.js";
import {
  buildSummary,
  processVersion,
  resolveVersions,
  selectMode,
} from "./lib/orchestrator-helpers.js";
import { verifySchemaHash } from "./schemas/hash.js";
import type { BuildSummary, CliOptions, VersionResult } from "./types/cli.js";

/** Build script version exposed via `-V` / `--version` and the JSON summary. */
const GENERATOR_VERSION = "0.1.0";

/**
 * Main entry point. Returns the process exit code; does not call
 * `process.exit` so the function is fully testable.
 * @param argv - Argument list (typically `process.argv.slice(2)`).
 * @returns Exit code per `docs/architecture/data-pipeline.md` §4.
 */
export async function main(argv: string[]): Promise<number> {
  normalizeEnvironment();

  let opts: CliOptions;
  try {
    opts = parseCli(argv);
  } catch (err) {
    const ctx: OutputContext = { json: false, quiet: false, verbose: false };
    if (err instanceof UsageError) {
      emitError(err, ctx);
      return err.code;
    }
    throw err;
  }

  const ctx: OutputContext = {
    json: opts.json,
    quiet: opts.quiet,
    verbose: opts.verbose,
  };

  // Stage 0: schema hash drift check.
  const hash = verifySchemaHash();
  if (!hash.ok) {
    const drift = new SchemaDriftError({
      expected: hash.committed,
      computed: hash.computed,
    });
    emitError(drift, ctx);
    emitSummary(emptySummary(opts, drift.code), ctx);
    return drift.code;
  }

  // Stage 1: discover versions.
  let versions: string[];
  try {
    versions = resolveVersions(opts);
  } catch (err) {
    if (err instanceof BuildError) {
      emitError(err, ctx);
      emitSummary(emptySummary(opts, err.code), ctx);
      return err.code;
    }
    throw err;
  }

  if (ctx.verbose) {
    emitProgress(
      `Found ${versions.length} version${versions.length === 1 ? "" : "s"}: ${versions.join(", ")}`,
      ctx,
    );
  }

  // Stages 2-5 per version. M2 stops at validation; M3-M5 extend `processVersion`.
  const results: VersionResult[] = [];
  let exitCode = 0;
  for (const version of versions) {
    const result = await processVersion(version, opts, ctx);
    results.push(result);
    if (!result.ok) {
      if (exitCode === 0) exitCode = 3;
      if (opts.failFast) break;
    }
  }

  emitSummary(buildSummary(opts, GENERATOR_VERSION, results, exitCode), ctx);
  return exitCode;
}

/**
 * Build an empty {@link BuildSummary} for the early-exit paths (schema
 * drift, discovery failure) where no version was processed.
 * @param opts - Parsed CLI options (drives the `mode` field).
 * @param exitCode - Exit code the orchestrator will return.
 * @returns A summary with no per-version entries and zero counts.
 */
function emptySummary(opts: CliOptions, exitCode: number): BuildSummary {
  return {
    buildScriptVersion: GENERATOR_VERSION,
    mode: selectMode(opts),
    versions: [],
    versionsSucceeded: 0,
    versionsFailed: 0,
    exitCode,
  };
}

/**
 * Detect whether this module was invoked directly (vs. imported by tests).
 * Tolerates symlinks and resolves both sides via realpath.
 * @returns True when this file is the process entry.
 */
function isDirectInvocation(): boolean {
  const argv1 = process.argv[1];
  if (!argv1) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(argv1);
  } catch {
    return false;
  }
}

if (isDirectInvocation()) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (err: unknown) => {
      const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
      process.stderr.write(`FATAL: ${msg}\n`);
      process.exit(1);
    },
  );
}
