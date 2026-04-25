import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  checkStatisticsCanary,
  updateBaseline,
  DEFAULT_CANARY_THRESHOLD,
} from "../../../scripts/build-consolidated/canary.js";
import type { IndexStatistics } from "../../../scripts/types/consolidated.js";

/**
 * Make a baseline IndexStatistics object with safe non-zero defaults for every
 * counter. Tests override individual fields.
 * @param overrides - fields to override on top of the base values.
 * @returns an IndexStatistics with all counters present.
 */
function stats(overrides: Partial<IndexStatistics> = {}): IndexStatistics {
  return {
    totalModules: 100,
    totalFunctions: 1000,
    totalParameters: 2000,
    totalPseudoVariables: 250,
    totalMICommands: 80,
    totalEvents: 12,
    totalStatistics: 50,
    totalGuides: 3,
    ...overrides,
  };
}

describe("checkStatisticsCanary", () => {
  let tmp: string;
  let baselinePath: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "opensips-canary-"));
    baselinePath = join(tmp, ".statistics-baseline.json");
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("returns firstRun:true ok:true when baseline file does not exist", async () => {
    const result = await checkStatisticsCanary(stats(), "3.6", baselinePath);
    expect(result).toEqual({ ok: true, firstRun: true, warnings: [] });
  });

  it("returns firstRun:true ok:true when baseline file exists but lacks the version key", async () => {
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.5": stats() },
      }),
    );
    const result = await checkStatisticsCanary(stats(), "3.6", baselinePath);
    expect(result).toEqual({ ok: true, firstRun: true, warnings: [] });
  });

  it("no warnings when current matches previous exactly", async () => {
    const previous = stats();
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.6": previous },
      }),
    );
    const result = await checkStatisticsCanary(stats(), "3.6", baselinePath);
    expect(result.ok).toBe(true);
    expect(result.firstRun).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it("no warnings on a small drop (95% of baseline)", async () => {
    const previous = stats({ totalModules: 100 });
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.6": previous },
      }),
    );
    const current = stats({ totalModules: 95 });
    const result = await checkStatisticsCanary(current, "3.6", baselinePath);
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("warns on a 30% drop in one stat with all fields populated", async () => {
    const previous = stats({ totalModules: 100 });
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.6": previous },
      }),
    );
    const current = stats({ totalModules: 70 });
    const result = await checkStatisticsCanary(current, "3.6", baselinePath);
    expect(result.ok).toBe(false);
    expect(result.firstRun).toBe(false);
    expect(result.warnings).toHaveLength(1);
    const w = result.warnings[0]!;
    expect(w.version).toBe("3.6");
    expect(w.statistic).toBe("totalModules");
    expect(w.previous).toBe(100);
    expect(w.current).toBe(70);
    expect(w.ratio).toBeCloseTo(0.7, 10);
    expect(w.threshold).toBe(DEFAULT_CANARY_THRESHOLD);
  });

  it("emits one warning per affected stat when multiple drop", async () => {
    const previous = stats({
      totalModules: 100,
      totalFunctions: 1000,
      totalParameters: 2000,
    });
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.6": previous },
      }),
    );
    const current = stats({
      totalModules: 60, // 60% — warn
      totalFunctions: 500, // 50% — warn
      totalParameters: 1900, // 95% — no warn
    });
    const result = await checkStatisticsCanary(current, "3.6", baselinePath);
    expect(result.ok).toBe(false);
    const affected = result.warnings.map((w) => w.statistic).sort();
    expect(affected).toEqual(["totalFunctions", "totalModules"]);
  });

  it("respects a custom threshold (lenient threshold suppresses warnings)", async () => {
    const previous = stats({ totalModules: 100 });
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.6": previous },
      }),
    );
    const current = stats({ totalModules: 70 }); // ratio 0.7
    const result = await checkStatisticsCanary(current, "3.6", baselinePath, 0.5);
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("skips a stat where previous is 0 (no division-by-zero crash)", async () => {
    const previous = stats({ totalGuides: 0 });
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.6": previous },
      }),
    );
    const current = stats({ totalGuides: 0 });
    const result = await checkStatisticsCanary(current, "3.6", baselinePath);
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("skips a stat where previous is 0 even if current is positive (no warn)", async () => {
    const previous = stats({ totalGuides: 0 });
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: { "3.6": previous },
      }),
    );
    const current = stats({ totalGuides: 5 });
    const result = await checkStatisticsCanary(current, "3.6", baselinePath);
    expect(result.ok).toBe(true);
    expect(result.warnings.find((w) => w.statistic === "totalGuides")).toBe(undefined);
  });
});

describe("updateBaseline", () => {
  let tmp: string;
  let baselinePath: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "opensips-canary-"));
    baselinePath = join(tmp, ".statistics-baseline.json");
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("creates the baseline file when missing", async () => {
    expect(existsSync(baselinePath)).toBe(false);
    const s = stats({ totalModules: 137 });
    await updateBaseline(s, "3.5", baselinePath);
    expect(existsSync(baselinePath)).toBe(true);

    const parsed = JSON.parse(readFileSync(baselinePath, "utf8")) as {
      schema_version: number;
      baselines: Record<string, IndexStatistics>;
    };
    expect(parsed.schema_version).toBe(1);
    expect(parsed.baselines["3.5"]).toEqual(s);
  });

  it("creates parent directories when missing", async () => {
    const nested = join(tmp, "deep", "nested", "baseline.json");
    await updateBaseline(stats(), "3.6", nested);
    expect(existsSync(nested)).toBe(true);
  });

  it("preserves entries for other versions when updating", async () => {
    const stats35 = stats({ totalModules: 137 });
    const stats36Old = stats({ totalModules: 100 });
    writeFileSync(
      baselinePath,
      JSON.stringify({
        schema_version: 1,
        baselines: {
          "3.5": stats35,
          "3.6": stats36Old,
        },
      }),
    );

    const stats36New = stats({ totalModules: 194 });
    await updateBaseline(stats36New, "3.6", baselinePath);

    const parsed = JSON.parse(readFileSync(baselinePath, "utf8")) as {
      schema_version: number;
      baselines: Record<string, IndexStatistics>;
    };
    expect(parsed.baselines["3.5"]).toEqual(stats35);
    expect(parsed.baselines["3.6"]).toEqual(stats36New);
  });

  it("round-trips: write baseline, then canary against same stats produces no warnings", async () => {
    const s = stats({ totalModules: 194, totalFunctions: 1300 });
    await updateBaseline(s, "3.6", baselinePath);

    const result = await checkStatisticsCanary(s, "3.6", baselinePath);
    expect(result.ok).toBe(true);
    expect(result.firstRun).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it("writes valid JSON (parseable, with trailing newline)", async () => {
    await updateBaseline(stats(), "3.6", baselinePath);
    const raw = readFileSync(baselinePath, "utf8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(() => JSON.parse(raw)).not.toThrow();
  });
});
