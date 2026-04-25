/**
 * `npm run baseline:update` entry point.
 *
 * Seeds or refreshes the per-version statistics baseline used by the canary
 * check (M5.4). For each requested version (or every discovered version if
 * no `--only` flag), the script:
 *
 *   1. Validates the source tree under `--source-root` (default `./data`).
 *   2. Builds the consolidated index in-memory via `buildConsolidatedIndex`.
 *   3. Persists the index's statistics block to
 *      `scripts/build-consolidated/.statistics-baseline.json` under the
 *      version key (preserving entries for other versions).
 *
 * The script writes nothing else to disk — no Markdown, no `consolidated.json`.
 * It is intended for two workflows:
 *
 *   - **First-time setup:** seed the baseline for a freshly added version.
 *   - **Intentional change:** refresh the baseline after an upstream
 *     extraction legitimately added or removed a large amount of content,
 *     when the canary's "20% drop" warnings are noisy and expected.
 *
 * Exit codes (subset of the orchestrator's, per `data-pipeline.md` §4):
 *   - 0 — every requested version validated cleanly and its baseline was
 *     written.
 *   - 1 — internal error (unhandled exception, builder bug surfaced via
 *     ConsolidatedIndexSchema rejection).
 *   - 3 — at least one version failed validation; baseline not updated for
 *     that version. Other versions may still have been updated.
 *
 * @see docs/architecture/data-pipeline.md §2.5
 * @see docs/architecture/adr/009-data-folder-and-dynamic-version-discovery.md
 * @see docs/plan/05-consolidated-index.md Task 5.4
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildConsolidatedIndex } from "./build-consolidated/index.js";
import { updateBaseline } from "./build-consolidated/canary.js";
import { discoverVersions } from "./lib/discover.js";
import { posixPath } from "./lib/fs-helpers.js";
import { validateVersion } from "./lib/validate.js";
import {
  ConsolidatedIndexSchema,
  type IndexStatistics,
} from "./types/consolidated.js";
import type { ModuleDocument } from "./schemas/modules.schema.js";

/** Build script version stamped into the produced index's `generator` field. */
const GENERATOR_VERSION = "0.1.0";

/** Project-root-relative location of the committed canary baseline file. */
const BASELINE_PATH = posixPath(
  ".",
  "scripts",
  "build-consolidated",
  ".statistics-baseline.json",
);

/**
 * Compact stats summary for stderr logging — same shape as the orchestrator's
 * verbose `Built consolidated index (...)` line.
 * @param s - Statistics record.
 * @returns Comma-separated `count label` summary.
 */
function formatStats(s: IndexStatistics): string {
  return [
    `${s.totalModules} modules`,
    `${s.totalFunctions} fns`,
    `${s.totalParameters} params`,
    `${s.totalPseudoVariables} pvars`,
    `${s.totalMICommands} mi`,
    `${s.totalEvents} evts`,
    `${s.totalStatistics} stats`,
    `${s.totalGuides} guides`,
  ].join(", ");
}

/**
 * Parse the `--only <version>` flag from a raw argv array.
 *
 * Permissive on purpose: this is a small dev tool, not the orchestrator. We
 * recognise `--only X.Y` and `--only=X.Y` and treat anything else as
 * irrelevant. Unknown flags are silently ignored.
 * @param argv - Raw argument list (typically `process.argv.slice(2)`).
 * @returns The requested version string, or `undefined` for "all versions".
 */
function parseArgs(argv: string[]): { only?: string } {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    if (a === "--only") return { only: argv[i + 1] };
    if (a.startsWith("--only=")) return { only: a.slice("--only=".length) };
  }
  return {};
}

/**
 * Main entry point. Returns the process exit code; never calls `process.exit`
 * directly so the function is testable.
 * @param argv - Argument list (typically `process.argv.slice(2)`).
 * @returns Exit code per the script's contract.
 */
export async function main(argv: string[]): Promise<number> {
  const { only } = parseArgs(argv);

  let versions: string[];
  if (only !== undefined) {
    versions = [only];
  } else {
    try {
      versions = discoverVersions(undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`ERROR: discover failed: ${msg}\n`);
      return 1;
    }
  }

  let exitCode = 0;
  for (const version of versions) {
    const validation = validateVersion(undefined, version);
    if (!validation.ok) {
      for (const issue of validation.issues) {
        process.stderr.write(
          `ERROR: ${issue.file}: ${issue.kind}: ${issue.message}\n`,
        );
      }
      process.stderr.write(
        `ERROR: validation failed for ${version}; baseline not updated\n`,
      );
      exitCode = exitCode === 0 ? 3 : exitCode;
      continue;
    }

    const { index } = buildConsolidatedIndex(
      version,
      {
        modules: validation.documents.modules as ModuleDocument[],
        core: [...validation.documents.core],
        guides: [...validation.documents.guides],
      },
      GENERATOR_VERSION,
    );

    // Defence in depth: if the builder ever produced a malformed index,
    // refuse to seed a bogus baseline.
    const parsed = ConsolidatedIndexSchema.safeParse(index);
    if (!parsed.success) {
      process.stderr.write(
        `ERROR: built index for ${version} failed schema validation: ${parsed.error.issues[0]?.message ?? "unknown"}\n`,
      );
      exitCode = 1;
      continue;
    }

    try {
      await updateBaseline(index.statistics, version, BASELINE_PATH);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(
        `ERROR: writing baseline for ${version} failed: ${msg}\n`,
      );
      exitCode = 1;
      continue;
    }

    process.stderr.write(
      `Baseline updated for ${version}: ${formatStats(index.statistics)}\n`,
    );
  }

  return exitCode;
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
