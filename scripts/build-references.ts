/**
 * opensips-skills build entry point.
 *
 * M1 implementation: schema-hash check + per-version validation. Exits with
 * the structured exit codes from `docs/architecture/data-pipeline.md` §4:
 *   0 — success
 *   2 — usage error (handled by CLI parser in M2; this stub does basic argv)
 *   3 — validation failure
 *   5 — schema-hash drift
 *
 * Full orchestrator with Commander CLI, --dry-run, --json, --only, --quiet,
 * --verbose, --fail-fast, and the renderers arrives in M2/M3/M4/M5.
 *
 * See `docs/plan/01-schema-mirroring-and-validation.md` and
 * `docs/plan/02-core-pipeline-foundation.md`.
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { discoverVersions } from "./lib/discover.js";
import {
  validateVersion,
  type ValidationIssue,
  type VersionValidationResult,
} from "./lib/validate.js";
import { verifySchemaHash } from "./schemas/hash.js";

/** CLI options recognised by the M1 stub. M2 replaces this with a full Commander parser. */
interface StubCliOptions {
  /** When set, validate only this single version. Otherwise scan every version under data/. */
  only?: string;
  /** When true, force-treat the run as validate-only (no rendering — there isn't any yet anyway). */
  validateOnly: boolean;
  /** Source root override. Default "./data" per ADR-009. */
  sourceRoot: string;
}

/**
 * Parse the M1 stub's argv. Recognised flags:
 *   --only <X.Y>          single version
 *   --validate-only       no-op for now (renderers don't exist yet)
 *   --source-root <path>  override default ./data
 * Any unrecognised flag triggers a usage error (exit 2).
 *
 * @param argv - process.argv.slice(2) typically.
 * @returns parsed options or throws on usage error.
 */
function parseArgs(argv: string[]): StubCliOptions {
  const opts: StubCliOptions = { validateOnly: false, sourceRoot: "./data" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--only") {
      const next = argv[++i];
      if (!next) throw new UsageError(`--only requires a version argument`);
      opts.only = next;
    } else if (arg === "--validate-only") {
      opts.validateOnly = true;
    } else if (arg === "--source-root") {
      const next = argv[++i];
      if (!next) throw new UsageError(`--source-root requires a path argument`);
      opts.sourceRoot = next;
    } else {
      throw new UsageError(`Unknown flag: ${arg}`);
    }
  }
  return opts;
}

class UsageError extends Error {
  override readonly name = "UsageError";
}

/**
 * Format a single ValidationIssue as a one-line stderr message.
 *
 * @param issue - structured validation issue.
 * @returns one-line "ERROR: <file>: <kind>: <message>" string.
 */
function formatIssue(issue: ValidationIssue): string {
  return `ERROR: ${issue.file}: ${issue.kind}: ${issue.message}`;
}

/**
 * Print the per-version validation summary to stderr.
 *
 * @param result - the version's validation outcome.
 */
function reportVersion(result: VersionValidationResult): void {
  if (result.ok) {
    process.stderr.write(`${result.version}: OK (${result.fileCount} files)\n`);
    return;
  }
  process.stderr.write(`${result.version}: FAILED (${result.issues.length} issue(s))\n`);
  for (const issue of result.issues) {
    process.stderr.write(`  ${formatIssue(issue)}\n`);
  }
}

/**
 * Main entry point. Returns the process exit code (does not call process.exit
 * itself so the function is testable).
 *
 * @param argv - process.argv.slice(2).
 * @returns exit code per data-pipeline.md §4.
 */
export async function main(argv: string[]): Promise<number> {
  let opts: StubCliOptions;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    if (err instanceof UsageError) {
      process.stderr.write(`USAGE ERROR: ${err.message}\n`);
      return 2;
    }
    throw err;
  }

  // Stage 0: schema hash drift check.
  const hash = verifySchemaHash();
  if (!hash.ok) {
    process.stderr.write(
      `ERROR: schema hash mismatch.\n` +
        `The schemas in scripts/schemas/ have been modified, but the committed hash\n` +
        `in scripts/schemas/.schema-hash has not been updated.\n\n` +
        `If this change is intentional, run:\n` +
        `  npm run schemas:hash\n` +
        `and commit the updated .schema-hash file alongside your schema changes.\n\n` +
        `Expected: ${hash.committed ?? "(missing)"}\n` +
        `Computed: ${hash.computed}\n`,
    );
    return 5;
  }

  // Stage 1: discover versions.
  const versions = opts.only ? [opts.only] : discoverVersions(opts.sourceRoot);

  if (versions.length === 0) {
    process.stderr.write(`No versions found under ${opts.sourceRoot}\n`);
    return 0;
  }

  // Stage 2: validate each version. Fail-slow across versions: collect all errors.
  let exitCode = 0;
  for (const version of versions) {
    const result = validateVersion(opts.sourceRoot, version);
    reportVersion(result);
    if (!result.ok) {
      exitCode = 3;
    }
  }

  return exitCode;
}

/**
 * Detect whether this module was invoked directly (vs imported by tests).
 * Tolerates symlinks and resolves both sides via realpath.
 *
 * @returns true when this file is the process entry.
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
