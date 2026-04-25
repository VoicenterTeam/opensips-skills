/**
 * Output discipline for the build orchestrator.
 *
 * Two output modes coexist:
 *   - **Human-readable** (default). Progress, warnings, errors, and the
 *     final summary all go to stderr.
 *   - **Machine-readable JSON** (`--json`). The final summary goes to
 *     stdout as a single deterministic JSON document; progress chatter is
 *     suppressed so a CI pipeline doing `npm run build --json > result.json`
 *     gets clean JSON.
 *
 * Errors are always emitted to stderr — including under `--quiet` — so a
 * silent build failure is impossible. Quiet mode only suppresses progress,
 * warnings, and the human summary.
 *
 * Per `docs/architecture/data-pipeline.md` §6.3 (and the rationale in
 * milestone 02-core-pipeline-foundation Task 2.7), progress goes to
 * stderr and machine-readable result goes to stdout. ESLint should be
 * configured to ban bare `console.log` so this discipline is enforceable.
 */

import { BuildError, formatError } from "./errors.js";
import type { BuildSummary } from "../types/cli.js";

/**
 * Per-emit context carried through the orchestrator. The flags here are
 * the resolved booleans from {@link CliOptions}; the helpers do not
 * re-read process state.
 */
export interface OutputContext {
  /** Emit machine-readable JSON to stdout instead of human text to stderr. */
  json: boolean;
  /** Suppress progress, warnings, and the human summary (errors still emit). */
  quiet: boolean;
  /** Caller-side gate for verbose-only progress lines. */
  verbose: boolean;
}

/**
 * Emit a single progress line.
 *
 * Suppressed entirely under `quiet` and under `json` (JSON mode owns
 * stdout exclusively for the summary; progress would pollute it via
 * stderr capture in some CI setups, so we suppress here too). Verbose
 * gating is the caller's responsibility — this helper does not check
 * `ctx.verbose` itself.
 * @param message - One-line progress message. Trailing newline is appended
 *   automatically.
 * @param ctx - Output context controlling whether the line is emitted.
 */
export function emitProgress(message: string, ctx: OutputContext): void {
  if (ctx.quiet || ctx.json) return;
  process.stderr.write(`${message}\n`);
}

/**
 * Emit a warning to stderr, prefixed with `WARNING:`.
 *
 * Suppressed under `quiet`; suppressed under `json` (warnings would
 * otherwise leak in front of structured output for tools that merge
 * stdout and stderr).
 * @param message - One-line warning message.
 * @param ctx - Output context controlling whether the line is emitted.
 */
export function emitWarning(message: string, ctx: OutputContext): void {
  if (ctx.quiet || ctx.json) return;
  process.stderr.write(`WARNING: ${message}\n`);
}

/**
 * Emit an error to stderr.
 *
 * Always emits — including under `quiet` and `json` — so a silent build
 * failure is impossible. {@link BuildError} instances are formatted via
 * {@link formatError} (single-line, GitHub problem-matcher friendly);
 * plain `Error` instances surface their `message`.
 *
 * The {@link OutputContext} parameter is accepted but not consulted, so
 * call sites have a uniform signature with the other emit helpers.
 * @param error - Either a structured {@link BuildError} or any plain `Error`.
 * @param ctx - Output context (currently unused; reserved for future
 *   JSON-aware error capture).
 */
export function emitError(error: BuildError | Error, ctx: OutputContext): void {
  void ctx;
  const line = error instanceof BuildError ? formatError(error) : error.message;
  process.stderr.write(`${line}\n`);
}

/**
 * Emit the final {@link BuildSummary}.
 *
 * In `json` mode: writes deterministic, pretty-printed JSON to stdout.
 * Otherwise: writes the human-readable block to stderr (suppressed under
 * `quiet`).
 * @param summary - The aggregate result the orchestrator produced.
 * @param ctx - Output context controlling stream selection and gating.
 */
export function emitSummary(summary: BuildSummary, ctx: OutputContext): void {
  if (ctx.json) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }
  if (ctx.quiet) return;

  const totalValidated = summary.versions.reduce(
    (sum, v) => sum + v.filesValidated,
    0,
  );
  const totalRendered = summary.versions.reduce(
    (sum, v) => sum + v.filesRendered,
    0,
  );
  const modeNote =
    summary.mode === "dry-run"
      ? "dry-run (no files written)"
      : summary.mode === "validate-only"
        ? "validate-only (no rendering)"
        : "build";

  // When at least one version was skipped via a `.broken` marker, surface
  // the count distinctly so the human reading the summary does not have to
  // diff against per-version output to understand why succeeded includes
  // a no-op version.
  const skipped = summary.versionsSkipped ?? 0;
  const versionsLine = skipped > 0
    ? `  Versions: ${summary.versionsSucceeded} succeeded (${skipped} skipped), ${summary.versionsFailed} failed`
    : `  Versions: ${summary.versionsSucceeded} succeeded, ${summary.versionsFailed} failed`;

  const lines = [
    "",
    "Summary:",
    versionsLine,
    `  Total files validated: ${totalValidated}`,
    `  Total files would-render: ${totalRendered}`,
    `  Mode: ${modeNote}`,
    "",
    `Exit code: ${summary.exitCode}`,
    "",
  ];
  process.stderr.write(`${lines.join("\n")}`);
}
