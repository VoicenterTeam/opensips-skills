import { describe, it, expect } from "vitest";
import {
  CONSOLIDATED_SCHEMA_VERSION,
  ConsolidatedIndexSchema,
  IndexStatisticsSchema,
  StatisticsBaselineFileSchema,
} from "../../../scripts/types/consolidated.js";

/**
 * Smoke tests for the lightweight consolidated-index types (M5.1).
 *
 * The types and schemas have no runtime logic of their own — `tsc --noEmit`
 * is the primary acceptance check. These cases simply guard against a
 * future edit accidentally weakening field requirements (e.g., dropping
 * `nonnegative()` from a counter or making `schema_version` optional).
 */

/**
 * Canonical minimal-but-valid index, parameterised so tests can mutate one
 * field at a time and re-parse to exercise the negative paths.
 * @returns A fresh object literal, safe to mutate per call.
 */
function makeMinimalIndex(): unknown {
  return {
    schema_version: CONSOLIDATED_SCHEMA_VERSION,
    version: "3.6",
    generator: "opensips-skills build-references 0.0.0-test",
    statistics: {
      totalModules: 0,
      totalFunctions: 0,
      totalParameters: 0,
      totalPseudoVariables: 0,
      totalMICommands: 0,
      totalEvents: 0,
      totalStatistics: 0,
      totalGuides: 0,
    },
    indexes: {
      functionsByName: {},
      parametersByModule: {},
      variablesByName: {},
      miCommandsByName: {},
    },
    relationships: {
      moduleDependencies: {},
    },
  };
}

describe("ConsolidatedIndexSchema", () => {
  it("parses a minimal valid index", () => {
    const result = ConsolidatedIndexSchema.safeParse(makeMinimalIndex());
    expect(result.success).toBe(true);
  });

  it("parses an index populated with realistic entries", () => {
    const populated = makeMinimalIndex() as Record<string, unknown> & {
      statistics: Record<string, number>;
      indexes: {
        functionsByName: Record<string, unknown>;
        parametersByModule: Record<string, string[]>;
      };
      relationships: { moduleDependencies: Record<string, string[]> };
    };
    populated.statistics.totalModules = 92;
    populated.statistics.totalFunctions = 1147;
    populated.indexes.functionsByName["t_relay"] = {
      source: "module:tm",
      path: "references/3.6/modules/tm.md",
      description: "Forwards a SIP request statefully through TM.",
    };
    populated.indexes.parametersByModule["tm"] = ["fr_inv_timer", "fr_timer"];
    populated.relationships.moduleDependencies["auth_db"] = ["auth", "sl"];

    const result = ConsolidatedIndexSchema.safeParse(populated);
    expect(result.success).toBe(true);
  });

  it("rejects an index missing required fields", () => {
    const incomplete = makeMinimalIndex() as Record<string, unknown>;
    delete incomplete.relationships;
    const result = ConsolidatedIndexSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects an index whose schema_version differs from the literal", () => {
    const wrongVersion = makeMinimalIndex() as Record<string, unknown>;
    wrongVersion.schema_version = CONSOLIDATED_SCHEMA_VERSION + 1;
    const result = ConsolidatedIndexSchema.safeParse(wrongVersion);
    expect(result.success).toBe(false);
  });
});

describe("IndexStatisticsSchema", () => {
  it("rejects negative numbers", () => {
    const result = IndexStatisticsSchema.safeParse({
      totalModules: -1,
      totalFunctions: 0,
      totalParameters: 0,
      totalPseudoVariables: 0,
      totalMICommands: 0,
      totalEvents: 0,
      totalStatistics: 0,
      totalGuides: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer numbers", () => {
    const result = IndexStatisticsSchema.safeParse({
      totalModules: 1.5,
      totalFunctions: 0,
      totalParameters: 0,
      totalPseudoVariables: 0,
      totalMICommands: 0,
      totalEvents: 0,
      totalStatistics: 0,
      totalGuides: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("StatisticsBaselineFileSchema", () => {
  it("parses a per-version baseline file with multiple versions", () => {
    const baseline = {
      schema_version: 1,
      baselines: {
        "3.4": {
          totalModules: 80,
          totalFunctions: 900,
          totalParameters: 1700,
          totalPseudoVariables: 220,
          totalMICommands: 75,
          totalEvents: 10,
          totalStatistics: 40,
          totalGuides: 3,
        },
        "3.6": {
          totalModules: 92,
          totalFunctions: 1147,
          totalParameters: 2034,
          totalPseudoVariables: 245,
          totalMICommands: 89,
          totalEvents: 12,
          totalStatistics: 47,
          totalGuides: 3,
        },
      },
    };
    const result = StatisticsBaselineFileSchema.safeParse(baseline);
    expect(result.success).toBe(true);
  });

  it("parses an empty baselines map (first-run state before any version is registered)", () => {
    const result = StatisticsBaselineFileSchema.safeParse({
      schema_version: 1,
      baselines: {},
    });
    expect(result.success).toBe(true);
  });
});
