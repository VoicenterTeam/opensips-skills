/**
 * Unit tests for the consolidated-index builder.
 *
 * These tests exercise `buildConsolidatedIndex` as a pure function. They feed
 * it minimal in-memory document objects (the smallest shape that satisfies
 * each schema field accessed by the builder) and assert against the returned
 * structure. No filesystem or environment is touched.
 *
 * Cross-references:
 *   - Builder spec: `docs/plan/05-consolidated-index.md` §5.2.
 *   - Index shape: `docs/architecture/data-pipeline.md` §7.3.
 *   - Determinism contract: `docs/architecture/data-pipeline.md` §3.
 */

import { describe, it, expect } from "vitest";

import {
  buildConsolidatedIndex,
  type ValidatedDocumentsForIndex,
} from "../../../scripts/build-consolidated/index.js";
import {
  CONSOLIDATED_SCHEMA_VERSION,
  ConsolidatedIndexSchema,
} from "../../../scripts/types/consolidated.js";
import type { ModuleDocument } from "../../../scripts/schemas/modules.schema.js";

/* -------------------------------------------------------------------- */
/* Test fixtures                                                         */
/* -------------------------------------------------------------------- */

/**
 * Construct a minimal ModuleDocument fixture. Only fields touched by the
 * builder are populated; everything else gets typed defaults so the cast
 * to ModuleDocument is structurally valid.
 * @param overrides - Per-test field overrides (typically `module_name`,
 *   `exported_*`, or `dependencies_required`).
 * @returns A typed ModuleDocument shaped for the builder under test.
 */
function makeModule(overrides: Partial<ModuleDocument> = {}): ModuleDocument {
  return {
    id: `module-${overrides.module_name ?? "x"}-3.6`,
    document_type: "module",
    version: "3.6",
    title: overrides.module_name ?? "x",
    url: "https://example.com/x",
    content_markdown: "",
    category: "Modules",
    extracted_at: "2026-01-01T00:00:00.000Z",
    module_name: "x",
    overview: "",
    exported_parameters: [],
    exported_functions: [],
    ...overrides,
  } as ModuleDocument;
}

const EMPTY_DOCS: ValidatedDocumentsForIndex = {
  modules: [],
  core: [],
  guides: [],
};

const GENERATOR = "opensips-skills@0.1.0-test";

/* -------------------------------------------------------------------- */
/* Tests                                                                 */
/* -------------------------------------------------------------------- */

describe("buildConsolidatedIndex — empty corpus", () => {
  it("returns zero counts and empty indexes", () => {
    const { index, warnings } = buildConsolidatedIndex("3.6", EMPTY_DOCS, GENERATOR);

    expect(index.schema_version).toBe(CONSOLIDATED_SCHEMA_VERSION);
    expect(index.version).toBe("3.6");
    expect(index.generator).toBe(GENERATOR);
    expect(index.statistics).toEqual({
      totalModules: 0,
      totalFunctions: 0,
      totalParameters: 0,
      totalPseudoVariables: 0,
      totalMICommands: 0,
      totalEvents: 0,
      totalStatistics: 0,
      totalGuides: 0,
    });
    expect(index.indexes.functionsByName).toEqual({});
    expect(index.indexes.parametersByModule).toEqual({});
    expect(index.indexes.variablesByName).toEqual({});
    expect(index.indexes.miCommandsByName).toEqual({});
    expect(index.relationships.moduleDependencies).toEqual({});
    expect(warnings).toEqual([]);
  });
});

describe("buildConsolidatedIndex — minimal happy path", () => {
  it("counts and indexes a single module with one of each item", () => {
    const tm = makeModule({
      module_name: "tm",
      exported_parameters: [
        {
          name: "fr_timer",
          type: "integer",
          description: "Timer for failure responses.",
        },
      ],
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "int",
          description: "Forwards the request statefully.",
          usage_context: ["request_route"],
          examples: [],
        },
      ],
      exported_pseudo_variables: [
        {
          name: "$T_branch_idx",
          type: "int",
          readable: true,
          writable: false,
          scope: "transaction",
          description: "The branch index of the current transaction.",
        },
      ],
      exported_mi_functions: [
        {
          name: "t_uac_dlg",
          parameters: [],
          description: "Send an in-dialog request via the TM module.",
          examples: [],
        },
      ],
      exported_events: [
        {
          name: "E_TM_BRANCH_DOWN",
          description: "Raised when a TM branch fails.",
          parameters: [],
        },
      ],
      exported_statistics: [
        {
          name: "received_replies",
          type: "counter",
          description: "Total replies received by TM.",
        },
      ],
    });

    const { index, warnings } = buildConsolidatedIndex(
      "3.6",
      { modules: [tm], core: [], guides: [] },
      GENERATOR,
    );

    expect(warnings).toEqual([]);
    expect(index.statistics).toEqual({
      totalModules: 1,
      totalFunctions: 1,
      totalParameters: 1,
      totalPseudoVariables: 1,
      totalMICommands: 1,
      totalEvents: 1,
      totalStatistics: 1,
      totalGuides: 0,
    });
    expect(index.indexes.functionsByName.t_relay).toEqual({
      source: "module:tm",
      path: "references/3.6/modules/tm.md",
      description: "Forwards the request statefully.",
    });
    expect(index.indexes.parametersByModule).toEqual({ tm: ["fr_timer"] });
    expect(index.indexes.variablesByName.$T_branch_idx).toEqual({
      source: "module:tm",
      path: "references/3.6/modules/tm.md",
      description: "The branch index of the current transaction.",
    });
    expect(index.indexes.miCommandsByName.t_uac_dlg).toEqual({
      source: "module:tm",
      path: "references/3.6/modules/tm.md",
      description: "Send an in-dialog request via the TM module.",
    });
  });
});

describe("buildConsolidatedIndex — function-name collision across modules", () => {
  it("keeps the alphabetically-first module's entry and warns", () => {
    const alpha = makeModule({
      module_name: "alpha",
      exported_functions: [
        {
          name: "foo",
          signature: "foo()",
          parameters: [],
          return_type: "int",
          description: "alpha's foo.",
          usage_context: [],
          examples: [],
        },
      ],
    });
    const zulu = makeModule({
      module_name: "zulu",
      exported_functions: [
        {
          name: "foo",
          signature: "foo()",
          parameters: [],
          return_type: "int",
          description: "zulu's foo.",
          usage_context: [],
          examples: [],
        },
      ],
    });

    // Pass them in the "wrong" order to prove the builder sorts internally.
    const { index, warnings } = buildConsolidatedIndex(
      "3.6",
      { modules: [zulu, alpha], core: [], guides: [] },
      GENERATOR,
    );

    expect(index.indexes.functionsByName.foo).toEqual({
      source: "module:alpha",
      path: "references/3.6/modules/alpha.md",
      description: "alpha's foo.",
    });
    // Total counts the unique slot, not the rejected duplicate.
    expect(index.statistics.totalFunctions).toBe(1);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      kind: "function-collision",
      name: "foo",
      resolution: "kept-first",
    });
    expect(warnings[0]?.conflictingSources.sort()).toEqual(["module:alpha", "module:zulu"]);
  });
});

describe("buildConsolidatedIndex — module vs core collision", () => {
  it("keeps the module entry (module wins, processed first)", () => {
    const mod = makeModule({
      module_name: "tm",
      exported_functions: [
        {
          name: "shared_fn",
          signature: "shared_fn()",
          parameters: [],
          return_type: "int",
          description: "From the tm module.",
          usage_context: [],
          examples: [],
        },
      ],
    });
    const coreFunctions = {
      id: "core-functions-3.6",
      document_type: "core_function",
      version: "3.6",
      title: "Core Functions",
      url: "https://example.com",
      content_markdown: "",
      category: "Core",
      extracted_at: "2026-01-01T00:00:00.000Z",
      functions: [
        {
          name: "shared_fn",
          signature: "shared_fn()",
          parameters: [],
          return_type: "int",
          description: "From core.",
          usage_context: [],
          examples: [],
        },
      ],
    };

    const { index, warnings } = buildConsolidatedIndex(
      "3.6",
      { modules: [mod], core: [coreFunctions], guides: [] },
      GENERATOR,
    );

    expect(index.indexes.functionsByName.shared_fn?.source).toBe("module:tm");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.conflictingSources.sort()).toEqual(["core", "module:tm"]);
  });
});

describe("buildConsolidatedIndex — module dependencies", () => {
  it("flattens dependencies_required to a sorted name array", () => {
    const auth_db = makeModule({
      module_name: "auth_db",
      dependencies_required: [
        { name: "tm", type: "module", optional: false },
        { name: "rr", type: "module", optional: false },
        { name: "sl", type: "module", optional: false },
      ],
    });

    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [auth_db], core: [], guides: [] },
      GENERATOR,
    );

    expect(index.relationships.moduleDependencies).toEqual({
      auth_db: ["rr", "sl", "tm"],
    });
  });

  it("emits an empty array for a module with no required deps", () => {
    const mod = makeModule({ module_name: "loner" });
    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [mod], core: [], guides: [] },
      GENERATOR,
    );
    expect(index.relationships.moduleDependencies.loner).toEqual([]);
  });
});

describe("buildConsolidatedIndex — parameter ordering", () => {
  it("sorts parametersByModule entries alphabetically", () => {
    const mod = makeModule({
      module_name: "dialog",
      exported_parameters: [
        {
          name: "default_timeout",
          type: "integer",
          description: "Default dialog timeout.",
        },
        {
          name: "dlg_match_mode",
          type: "integer",
          description: "Dialog matching mode.",
        },
        {
          name: "ctx_id_avp",
          type: "string",
          description: "AVP for context id.",
        },
      ],
    });

    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [mod], core: [], guides: [] },
      GENERATOR,
    );

    expect(index.indexes.parametersByModule.dialog).toEqual([
      "ctx_id_avp",
      "default_timeout",
      "dlg_match_mode",
    ]);
  });
});

describe("buildConsolidatedIndex — description handling", () => {
  it("truncates over-long descriptions to 200 chars + ellipsis", () => {
    const longText = "x".repeat(500);
    const mod = makeModule({
      module_name: "tm",
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "int",
          description: longText,
          usage_context: [],
          examples: [],
        },
      ],
    });

    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [mod], core: [], guides: [] },
      GENERATOR,
    );

    const desc = index.indexes.functionsByName.t_relay?.description ?? "";
    // 200 chars plus a trailing ellipsis character.
    expect(desc.length).toBe(201);
    expect(desc.endsWith("…")).toBe(true);
    expect(desc.startsWith("x")).toBe(true);
  });

  it("extracts only the first sentence of a multi-sentence description", () => {
    const mod = makeModule({
      module_name: "tm",
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "int",
          description: "First sentence. Second sentence.",
          usage_context: [],
          examples: [],
        },
      ],
    });

    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [mod], core: [], guides: [] },
      GENERATOR,
    );

    // Choice: the trailing period is preserved (the period+space delimiter
    // marks the boundary, the period itself stays with the first sentence).
    expect(index.indexes.functionsByName.t_relay?.description).toBe("First sentence.");
  });
});

describe("buildConsolidatedIndex — determinism", () => {
  it("returns deeply equal results on repeated calls with the same input", () => {
    const tm = makeModule({
      module_name: "tm",
      exported_parameters: [
        {
          name: "fr_timer",
          type: "integer",
          description: "Timer.",
        },
      ],
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "int",
          description: "Forwards.",
          usage_context: [],
          examples: [],
        },
      ],
      dependencies_required: [
        { name: "rr", type: "module", optional: false },
        { name: "sl", type: "module", optional: false },
      ],
    });
    const dialog = makeModule({
      module_name: "dialog",
      exported_parameters: [
        {
          name: "default_timeout",
          type: "integer",
          description: "Timeout.",
        },
      ],
    });

    const a = buildConsolidatedIndex(
      "3.6",
      { modules: [tm, dialog], core: [], guides: [] },
      GENERATOR,
    );
    const b = buildConsolidatedIndex(
      "3.6",
      { modules: [tm, dialog], core: [], guides: [] },
      GENERATOR,
    );

    expect(a).toEqual(b);
  });
});

describe("buildConsolidatedIndex — POSIX path strings", () => {
  it("emits forward-slash paths regardless of host platform", () => {
    const mod = makeModule({
      module_name: "tm",
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "int",
          description: "Forwards.",
          usage_context: [],
          examples: [],
        },
      ],
    });

    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [mod], core: [], guides: [] },
      GENERATOR,
    );

    const path = index.indexes.functionsByName.t_relay?.path ?? "";
    expect(path).toContain("/");
    expect(path).not.toContain("\\");
    expect(path).toBe("references/3.6/modules/tm.md");
  });
});

describe("buildConsolidatedIndex — schema validation", () => {
  it("produces an index that parses cleanly via ConsolidatedIndexSchema", () => {
    const tm = makeModule({
      module_name: "tm",
      exported_parameters: [{ name: "fr_timer", type: "integer", description: "Timer." }],
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "int",
          description: "Forwards.",
          usage_context: [],
          examples: [],
        },
      ],
      dependencies_required: [{ name: "sl", type: "module", optional: false }],
    });

    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [tm], core: [], guides: [] },
      GENERATOR,
    );

    expect(() => ConsolidatedIndexSchema.parse(index)).not.toThrow();
  });
});

describe("buildConsolidatedIndex — guides counter", () => {
  it("counts guides via array length without indexing their content", () => {
    const { index } = buildConsolidatedIndex(
      "3.6",
      { modules: [], core: [], guides: [{}, {}] },
      GENERATOR,
    );

    expect(index.statistics.totalGuides).toBe(2);
  });
});

describe("buildConsolidatedIndex — input immutability", () => {
  it("does not mutate caller-supplied arrays", () => {
    const params = [
      { name: "b_param", type: "integer", description: "B." },
      { name: "a_param", type: "integer", description: "A." },
    ];
    const deps = [
      { name: "tm", type: "module" as const, optional: false },
      { name: "rr", type: "module" as const, optional: false },
    ];
    const mod = makeModule({
      module_name: "x",
      exported_parameters: params,
      dependencies_required: deps,
    });
    const modules = [mod];

    buildConsolidatedIndex("3.6", { modules, core: [], guides: [] }, GENERATOR);

    expect(params.map((p) => p.name)).toEqual(["b_param", "a_param"]);
    expect(deps.map((d) => d.name)).toEqual(["tm", "rr"]);
    expect(modules).toHaveLength(1);
  });
});
