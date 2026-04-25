import { describe, it, expect } from "vitest";
import { serializeIndex } from "../../../scripts/build-consolidated/serialize.js";
import {
  ConsolidatedIndexSchema,
  CONSOLIDATED_SCHEMA_VERSION,
  type ConsolidatedIndex,
} from "../../../scripts/types/consolidated.js";

/**
 * Build a minimal but schema-valid {@link ConsolidatedIndex} for tests.
 * Empty indexes/relationships are valid per the schema; this gives each
 * test a clean slate to overlay just the fields it cares about.
 *
 * @param overrides - Optional shallow overrides spread over the base shape.
 * @returns A fresh, schema-valid index object.
 */
function minimalIndex(
  overrides: Partial<ConsolidatedIndex> = {},
): ConsolidatedIndex {
  return {
    schema_version: CONSOLIDATED_SCHEMA_VERSION,
    version: "3.6",
    generator: "opensips-skills build-references 0.1.0",
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
    ...overrides,
  };
}

describe("serializeIndex — determinism", () => {
  it("produces byte-identical output across two calls with the same input", () => {
    const idx = minimalIndex({
      indexes: {
        functionsByName: {
          t_relay: {
            source: "module:tm",
            path: "references/3.6/modules/tm.md",
            description: "Relay a SIP transaction.",
          },
          xlog: {
            source: "core",
            path: "references/3.6/core/functions.md",
            description: "Log a formatted message.",
          },
        },
        parametersByModule: {
          tm: ["fr_inv_timer", "fr_timer"],
        },
        variablesByName: {},
        miCommandsByName: {},
      },
    });

    const a = serializeIndex(idx);
    const b = serializeIndex(idx);
    expect(a).toBe(b);
  });

  it("is deterministic regardless of insertion order at the top level", () => {
    // Two indexes with identical data but different property insertion
    // order should serialize to the exact same string.
    const ordered = minimalIndex();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reversed: ConsolidatedIndex = {
      relationships: ordered.relationships,
      indexes: ordered.indexes,
      statistics: ordered.statistics,
      generator: ordered.generator,
      version: ordered.version,
      schema_version: ordered.schema_version,
    } as ConsolidatedIndex;

    expect(serializeIndex(ordered)).toBe(serializeIndex(reversed));
  });
});

describe("serializeIndex — formatting", () => {
  it("pretty-prints with newlines and 2-space indentation", () => {
    const out = serializeIndex(minimalIndex());
    expect(out).toContain("\n");
    // The first nested key inside the top-level object should be indented
    // by exactly two spaces.
    expect(out).toMatch(/\n {2}"/);
  });

  it("ends with exactly one trailing newline", () => {
    const out = serializeIndex(minimalIndex());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("does not produce four-space indents at the top level", () => {
    // Sanity: 2-space indent (not 4) at the first nesting level.
    const out = serializeIndex(minimalIndex());
    // Find the line containing "version" — top-level field, indented 2.
    const versionLine = out
      .split("\n")
      .find((line) => line.includes('"version"'));
    expect(versionLine).toBeDefined();
    expect(versionLine?.startsWith("  \"")).toBe(true);
    expect(versionLine?.startsWith("    \"")).toBe(false);
  });
});

describe("serializeIndex — alphabetical key sort", () => {
  it("sorts top-level keys alphabetically regardless of insertion order", () => {
    // Build an object with deliberately non-alphabetical insertion order
    // and assert the serialized key order.
    const idx = minimalIndex();
    const out = serializeIndex(idx);

    const keyOrder = [
      "generator",
      "indexes",
      "relationships",
      "schema_version",
      "statistics",
      "version",
    ];

    // Find the index of each key in the serialized output.
    const positions = keyOrder.map((key) => ({
      key,
      pos: out.indexOf(`"${key}"`),
    }));

    // All keys present.
    for (const { key, pos } of positions) {
      expect(pos, `expected key "${key}" to appear`).toBeGreaterThanOrEqual(0);
    }

    // Positions must be strictly increasing in the alphabetical key order.
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1]!;
      const curr = positions[i]!;
      expect(
        curr.pos,
        `expected "${curr.key}" to appear after "${prev.key}"`,
      ).toBeGreaterThan(prev.pos);
    }
  });

  it("sorts nested record keys alphabetically (functionsByName: zfn, afn, mfn)", () => {
    // Construct an index with intentionally non-alphabetical insertion
    // order in a Record<>. The serializer must alphabetize.
    const idx = minimalIndex({
      indexes: {
        functionsByName: {
          zfn: {
            source: "module:zmod",
            path: "references/3.6/modules/zmod.md",
            description: "Z function.",
          },
          afn: {
            source: "module:amod",
            path: "references/3.6/modules/amod.md",
            description: "A function.",
          },
          mfn: {
            source: "module:mmod",
            path: "references/3.6/modules/mmod.md",
            description: "M function.",
          },
        },
        parametersByModule: {},
        variablesByName: {},
        miCommandsByName: {},
      },
    });

    const out = serializeIndex(idx);

    const aPos = out.indexOf('"afn"');
    const mPos = out.indexOf('"mfn"');
    const zPos = out.indexOf('"zfn"');

    expect(aPos).toBeGreaterThan(0);
    expect(mPos).toBeGreaterThan(aPos);
    expect(zPos).toBeGreaterThan(mPos);
  });

  it("sorts arbitrary non-alphabetical keys at any nesting level (contrived)", () => {
    // This contrived input is not a valid ConsolidatedIndex; it tests
    // the serializer's library-level guarantee that every level's
    // object keys come out alphabetized regardless of insertion order.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contrived: any = {
      c: 1,
      a: 2,
      b: 3,
      nested: {
        z: 1,
        y: 2,
        x: 3,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = serializeIndex(contrived as any);

    // Top-level: a, b, c, nested.
    expect(out.indexOf('"a"')).toBeLessThan(out.indexOf('"b"'));
    expect(out.indexOf('"b"')).toBeLessThan(out.indexOf('"c"'));
    expect(out.indexOf('"c"')).toBeLessThan(out.indexOf('"nested"'));

    // Nested: x, y, z.
    expect(out.indexOf('"x"')).toBeLessThan(out.indexOf('"y"'));
    expect(out.indexOf('"y"')).toBeLessThan(out.indexOf('"z"'));
  });
});

describe("serializeIndex — empty values", () => {
  it("serializes an empty Record<> without throwing and round-trips to `{}`", () => {
    // Note: json-stringify-deterministic renders empty objects across two
    // lines (`{\n  }`) when pretty-printing — that's its established
    // pretty-print behavior. The contract we care about is: no error,
    // valid JSON, and the parsed value is an empty object.
    const idx = minimalIndex(); // parametersByModule is {} by default.
    const out = serializeIndex(idx);
    expect(out).toMatch(/"parametersByModule":\s*\{\s*\}/);
    const parsed = JSON.parse(out) as { indexes: { parametersByModule: unknown } };
    expect(parsed.indexes.parametersByModule).toEqual({});
  });

  it("serializes empty arrays without throwing and round-trips to `[]`", () => {
    const idx = minimalIndex({
      relationships: {
        moduleDependencies: {
          some_mod: [],
        },
      },
    });
    const out = serializeIndex(idx);
    expect(out).toMatch(/"some_mod":\s*\[\s*\]/);
    const parsed = JSON.parse(out) as {
      relationships: { moduleDependencies: Record<string, unknown> };
    };
    expect(parsed.relationships.moduleDependencies.some_mod).toEqual([]);
  });
});

describe("serializeIndex — schema roundtrip", () => {
  it("serialize → parse → schema.parse round-trips cleanly", () => {
    const idx = minimalIndex({
      statistics: {
        totalModules: 92,
        totalFunctions: 1147,
        totalParameters: 2034,
        totalPseudoVariables: 245,
        totalMICommands: 89,
        totalEvents: 12,
        totalStatistics: 47,
        totalGuides: 3,
      },
      indexes: {
        functionsByName: {
          t_relay: {
            source: "module:tm",
            path: "references/3.6/modules/tm.md",
            description: "Relay a SIP transaction statefully.",
          },
        },
        parametersByModule: {
          tm: ["fr_inv_timer", "fr_timer"],
        },
        variablesByName: {},
        miCommandsByName: {},
      },
      relationships: {
        moduleDependencies: {
          auth_db: ["auth", "sl"],
        },
      },
    });

    const out = serializeIndex(idx);
    const parsed = JSON.parse(out) as unknown;
    const result = ConsolidatedIndexSchema.safeParse(parsed);
    expect(result.success).toBe(true);
    if (result.success) {
      // Roundtripped data preserves field values.
      expect(result.data.statistics.totalModules).toBe(92);
      expect(result.data.indexes.functionsByName.t_relay?.source).toBe(
        "module:tm",
      );
      expect(result.data.relationships.moduleDependencies.auth_db).toEqual([
        "auth",
        "sl",
      ]);
    }
  });
});
