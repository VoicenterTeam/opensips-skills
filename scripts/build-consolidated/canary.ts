/**
 * Statistical canary check for the consolidated index build (Milestone 5,
 * Task 5.4).
 *
 * Compares freshly computed {@link IndexStatistics} against a per-version
 * committed baseline. A statistic that has dropped below the configured
 * threshold (default 80% of the baseline) raises a {@link CanaryWarning} —
 * a signal that an upstream extraction may have regressed. Per the failure
 * policy in `data-pipeline.md` §4 the canary is advisory: the build does
 * **not** fail when warnings are present, it surfaces them and continues.
 *
 * Per ADR-009 the baseline file maps OpenSIPs version → stats, so the build
 * supports an open-ended set of versions and adding a new version is purely
 * a data operation (`npm run baseline:update -- --only X.Y`).
 * @see docs/architecture/data-pipeline.md §2.5
 * @see docs/architecture/adr/009-data-folder-and-dynamic-version-discovery.md
 * @see docs/plan/05-consolidated-index.md Task 5.4
 */

import { existsSync } from "node:fs";
import { dirname } from "node:path";

import { atomicWriteFile, ensureDirectory, readJsonFile } from "../lib/fs-helpers.js";
import {
  StatisticsBaselineFileSchema,
  type IndexStatistics,
  type StatisticsBaselineFile,
} from "../types/consolidated.js";

/**
 * A single canary warning surfaced when one statistic drops too much.
 */
export interface CanaryWarning {
  /** OpenSIPs version (matches the active build, e.g., `"3.6"`). */
  version: string;
  /** Which {@link IndexStatistics} key tripped the threshold. */
  statistic: keyof IndexStatistics;
  /** The baseline value for this statistic. */
  previous: number;
  /** The just-computed value for this statistic. */
  current: number;
  /** Ratio `current / previous`; e.g., `0.65` means current is 65% of baseline. */
  ratio: number;
  /** Threshold that was applied for this comparison (default 0.8). */
  threshold: number;
}

/**
 * Result of a canary comparison.
 */
export interface CanaryResult {
  /** True iff `warnings` is empty. */
  ok: boolean;
  /**
   * True when no baseline existed for this version (file absent OR file
   * present but missing this version's entry). Callers may treat this as a
   * cue to seed the baseline via {@link updateBaseline}.
   */
  firstRun: boolean;
  /** One entry per statistic that dropped below the threshold. */
  warnings: CanaryWarning[];
}

/**
 * Default warning threshold. A statistic that drops below 80% of the
 * committed baseline (i.e., `current / previous < 0.8`) triggers a warning.
 *
 * Rationale (data-pipeline.md §2.5): a 20% drop is large enough that an
 * upstream extraction regression is more likely than a legitimate change,
 * but small enough that ordinary churn (a deprecated module removed, a few
 * functions renamed) does not constantly trip the check.
 */
export const DEFAULT_CANARY_THRESHOLD = 0.8;

/**
 * The complete set of {@link IndexStatistics} keys, used to iterate
 * deterministically when comparing a current statistics block to a baseline.
 *
 * Listed explicitly (rather than via `Object.keys`) so the comparison order
 * is stable and so a new field added to {@link IndexStatistics} surfaces as
 * a TypeScript error here, prompting an explicit decision about whether
 * the canary should track it.
 */
const STAT_KEYS = [
  "totalModules",
  "totalFunctions",
  "totalParameters",
  "totalPseudoVariables",
  "totalMICommands",
  "totalEvents",
  "totalStatistics",
  "totalGuides",
] as const satisfies readonly (keyof IndexStatistics)[];

/**
 * Compare current statistics against the committed per-version baseline.
 *
 * No-op (returns `{ ok: true, firstRun: true, warnings: [] }`) when the
 * baseline file does not exist yet OR when the baseline file exists but
 * does not contain an entry for this version. The caller decides whether
 * to seed the baseline via {@link updateBaseline} on first run.
 *
 * For each statistic in {@link IndexStatistics}, the function computes
 * `ratio = current[key] / previous[key]`. If the ratio falls below
 * `threshold`, a warning is recorded. A baseline value of `0` short-circuits
 * the comparison for that statistic — there is no division-by-zero, and
 * no warning is emitted (a stat that was zero before is not a useful
 * regression signal).
 * @param current - The just-computed statistics for the active version.
 * @param version - Active OpenSIPs version string (used as the baseline-file
 *   key and surfaced on each warning).
 * @param baselinePath - Path to `.statistics-baseline.json`.
 * @param threshold - Optional ratio below which to warn. Defaults to
 *   {@link DEFAULT_CANARY_THRESHOLD}.
 * @returns A {@link CanaryResult} describing whether the build should be
 *   considered clean, whether this was a first run for the version, and
 *   the list of warnings (one per affected statistic).
 * @example
 * ```ts
 * import { checkStatisticsCanary } from "./build-consolidated/canary.js";
 *
 * const result = await checkStatisticsCanary(
 *   index.statistics,
 *   "3.6",
 *   "scripts/build-consolidated/.statistics-baseline.json",
 * );
 *
 * if (result.firstRun) {
 *   console.warn("No baseline for 3.6 yet; run `npm run baseline:update`.");
 * } else if (!result.ok) {
 *   for (const w of result.warnings) {
 *     console.warn(
 *       `WARN: ${w.version} ${w.statistic} dropped to ` +
 *         `${(w.ratio * 100).toFixed(0)}% (${w.current}/${w.previous}).`,
 *     );
 *   }
 * }
 * ```
 */
export async function checkStatisticsCanary(
  current: IndexStatistics,
  version: string,
  baselinePath: string,
  threshold: number = DEFAULT_CANARY_THRESHOLD,
): Promise<CanaryResult> {
  if (!existsSync(baselinePath)) {
    return { ok: true, firstRun: true, warnings: [] };
  }

  const raw = await readJsonFile<unknown>(baselinePath);
  const file: StatisticsBaselineFile = StatisticsBaselineFileSchema.parse(raw);

  const previous = file.baselines[version];
  if (!previous) {
    return { ok: true, firstRun: true, warnings: [] };
  }

  const warnings: CanaryWarning[] = [];
  for (const key of STAT_KEYS) {
    const prev = previous[key];
    if (prev === 0) continue; // skip: no useful signal, avoid div-by-zero
    const cur = current[key];
    const ratio = cur / prev;
    if (ratio < threshold) {
      warnings.push({
        version,
        statistic: key,
        previous: prev,
        current: cur,
        ratio,
        threshold,
      });
    }
  }

  return { ok: warnings.length === 0, firstRun: false, warnings };
}

/**
 * Write or update the baseline file with `current` statistics for `version`.
 *
 * Preserves entries for other versions (per ADR-009 the file is keyed by
 * version). Creates the baseline file — and any missing parent directories —
 * if it does not exist yet. The write goes through {@link atomicWriteFile}
 * so an interrupted update leaves either the previous file or no change,
 * never a partial write.
 *
 * Output JSON is pretty-printed with a 2-space indent and a trailing newline,
 * matching the project's general convention for committed JSON.
 * @param current - The just-computed statistics for one version.
 * @param version - The version key under which to store these stats
 *   (e.g., `"3.6"`).
 * @param baselinePath - Path to `.statistics-baseline.json`.
 * @example
 * ```ts
 * import { updateBaseline } from "./build-consolidated/canary.js";
 *
 * // Run after a clean build that introduces a legitimately new shape:
 * await updateBaseline(
 *   index.statistics,
 *   "4.0",
 *   "scripts/build-consolidated/.statistics-baseline.json",
 * );
 * ```
 */
export async function updateBaseline(
  current: IndexStatistics,
  version: string,
  baselinePath: string,
): Promise<void> {
  let file: StatisticsBaselineFile;
  if (existsSync(baselinePath)) {
    const raw = await readJsonFile<unknown>(baselinePath);
    file = StatisticsBaselineFileSchema.parse(raw);
  } else {
    file = { schema_version: 1, baselines: {} };
  }

  file.baselines[version] = current;

  // Sort version keys alphabetically for stable on-disk ordering.
  const sortedBaselines: Record<string, IndexStatistics> = {};
  for (const key of Object.keys(file.baselines).sort()) {
    sortedBaselines[key] = file.baselines[key]!;
  }
  const out: StatisticsBaselineFile = {
    schema_version: file.schema_version,
    baselines: sortedBaselines,
  };

  const json = JSON.stringify(out, null, 2) + "\n";
  await ensureDirectory(dirname(baselinePath));
  await atomicWriteFile(baselinePath, json);
}
