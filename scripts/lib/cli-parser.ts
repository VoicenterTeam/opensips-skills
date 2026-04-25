/**
 * Commander-based CLI parser for the build orchestrator.
 *
 * Single source of truth for flag names, short forms, defaults, and
 * mutual-exclusion rules. The flag set tracks
 * `docs/architecture/data-pipeline.md` §6.3; defaults track ADR-009
 * (sourceRoot is `./data`, not `./source`).
 *
 * The parser surfaces every usage problem — unknown flag, missing argument,
 * conflicting combination — as a structured {@link UsageError}, never as a
 * Commander process exit. Translating Commander's behaviour this way keeps
 * the orchestrator (and its tests) in full control of stderr and exit-code
 * emission.
 */

import { Command, CommanderError } from "commander";

import { UsageError } from "./errors.js";
import { DEFAULT_CLI_OPTIONS, type CliOptions } from "../types/cli.js";

/** Build script version surfaced via `-V` / `--version`. Hardcoded for now. */
const GENERATOR_VERSION = "0.1.0";

/**
 * Parse the build script's CLI arguments into a fully-typed
 * {@link CliOptions} record.
 *
 * Behaviour:
 *   - Unknown flags throw {@link UsageError}.
 *   - Missing required flag arguments throw {@link UsageError}.
 *   - `--quiet` and `--verbose` together throw {@link UsageError}.
 *   - `--only-module <slug>` without `--only <version>` throws {@link UsageError}.
 *
 * Commander is configured with `exitOverride()` so it raises a
 * {@link CommanderError} instead of calling `process.exit`. Every such error
 * is wrapped in {@link UsageError} so the orchestrator's error path is
 * uniform.
 * @param argv - Argument list as you would pass to Commander, i.e.
 *   `process.argv.slice(2)`. The leading `node` and script path must be
 *   stripped by the caller.
 * @returns Parsed and defaulted {@link CliOptions}.
 * @throws {UsageError} On any usage-level failure (unknown flag, missing
 *   argument, conflicting combination).
 */
export function parseCli(argv: string[]): CliOptions {
  const program = new Command();
  program
    .name("build-references")
    .description("opensips-skills build orchestrator")
    .version(GENERATOR_VERSION, "-V, --version", "Print build script version")
    .helpOption("-h, --help", "Show this help")
    .option("--only <version>", "Build only the specified version (e.g., 3.6)")
    .option(
      "--only-module <slug>",
      "With --only, build only one module plus its index",
    )
    .option(
      "--dry-run",
      "Validate and report what would be written; do not write",
      false,
    )
    .option(
      "--fail-fast",
      "Stop at the first validation error (default: collect all)",
      false,
    )
    .option("--verbose", "Emit per-file progress to stderr", false)
    .option("--quiet", "Suppress non-error output", false)
    .option("--json", "Emit machine-readable JSON summary to stdout", false)
    .option(
      "--source-root <path>",
      "Override default source root",
      DEFAULT_CLI_OPTIONS.sourceRoot,
    )
    .option(
      "--output-root <path>",
      "Override default output root",
      DEFAULT_CLI_OPTIONS.outputRoot,
    )
    .option("--validate-only", "Run validation only (skip rendering)", false)
    .exitOverride()
    .configureOutput({
      // Commander writes its own error/usage text to stderr by default; we
      // suppress it here so the orchestrator owns all stderr formatting.
      writeErr: () => {
        /* swallow — UsageError carries the message */
      },
      writeOut: () => {
        /* swallow — version/help paths handled via exitOverride */
      },
    });

  try {
    program.parse(argv, { from: "user" });
  } catch (err) {
    // Commander throws a CommanderError for unknown flags, missing
    // arguments, --help, and --version. We translate the "real" usage
    // failures into UsageError; --help and --version exits are not
    // reached in a programmatic call because configureOutput has
    // suppressed their output and they do not enter user-facing flows
    // for this orchestrator.
    if (err instanceof CommanderError) {
      throw new UsageError({ message: err.message });
    }
    throw err;
  }

  const raw = program.opts<RawCommanderOpts>();

  if (raw.quiet === true && raw.verbose === true) {
    throw new UsageError({
      message: "Cannot combine --quiet and --verbose",
      flag: "--quiet",
    });
  }

  if (raw.onlyModule !== undefined && raw.only === undefined) {
    throw new UsageError({
      message: "--only-module requires --only <version>",
      flag: "--only-module",
    });
  }

  const opts: CliOptions = {
    dryRun: raw.dryRun ?? DEFAULT_CLI_OPTIONS.dryRun,
    failFast: raw.failFast ?? DEFAULT_CLI_OPTIONS.failFast,
    verbose: raw.verbose ?? DEFAULT_CLI_OPTIONS.verbose,
    quiet: raw.quiet ?? DEFAULT_CLI_OPTIONS.quiet,
    json: raw.json ?? DEFAULT_CLI_OPTIONS.json,
    sourceRoot: raw.sourceRoot ?? DEFAULT_CLI_OPTIONS.sourceRoot,
    outputRoot: raw.outputRoot ?? DEFAULT_CLI_OPTIONS.outputRoot,
    validateOnly: raw.validateOnly ?? DEFAULT_CLI_OPTIONS.validateOnly,
  };
  if (raw.only !== undefined) opts.only = raw.only;
  if (raw.onlyModule !== undefined) opts.onlyModule = raw.onlyModule;
  return opts;
}

/** Raw shape Commander returns from `program.opts()`. */
interface RawCommanderOpts {
  only?: string;
  onlyModule?: string;
  dryRun?: boolean;
  failFast?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  json?: boolean;
  sourceRoot?: string;
  outputRoot?: string;
  validateOnly?: boolean;
}
