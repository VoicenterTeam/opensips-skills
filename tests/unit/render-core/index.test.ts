/**
 * Unit tests for the core-document composer (`scripts/render-core/index.ts`).
 *
 * Each of the twelve core document types gets at least one happy-path test
 * that drives the composer end-to-end against a real source-data fixture from
 * `data/3.6/core/*.json`, validated by its corresponding schema. Plus a set of
 * integration tests covering determinism, empty-document handling,
 * non-alphabetical input, the filename map, and unknown-docType handling.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  renderCoreDocument,
  coreFileNames,
  coreFileH1,
  type CoreDocType,
} from "../../../scripts/render-core/index.js";

import {
  CoreVariableDocumentSchema,
  CoreFunctionDocumentSchema,
  CoreParameterDocumentSchema,
  OperatorDocumentSchema,
  StatementDocumentSchema,
  RouteDocumentSchema,
  TransformationDocumentSchema,
  AsyncDocumentSchema,
  MICommandDocumentSchema,
  EventDocumentSchema,
  StatisticDocumentSchema,
  FlagDocumentSchema,
} from "../../../scripts/schemas/index.js";

const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const DATA_36 = resolve(REPO_ROOT, "data", "3.6", "core");

/**
 * Read and JSON-parse a core-data fixture for OpenSIPs 3.6.
 *
 * Tests use the real upstream extraction output rather than fabricating
 * shapes; this matches the prompt's guidance and exercises the composer
 * against the same data the build pipeline will see.
 *
 * @param filename - File stem under `data/3.6/core/` (e.g., `"operators"`).
 * @returns Parsed JSON object.
 */
function readCore(filename: string): unknown {
  return JSON.parse(readFileSync(resolve(DATA_36, `${filename}.json`), "utf-8"));
}

describe("renderCoreDocument — exports", () => {
  it("coreFileNames maps every doc type to its expected filename", () => {
    expect(coreFileNames.core_variable).toBe("variables.md");
    expect(coreFileNames.core_function).toBe("functions.md");
    expect(coreFileNames.core_parameter).toBe("parameters.md");
    expect(coreFileNames.operator).toBe("operators.md");
    expect(coreFileNames.statement).toBe("statements.md");
    expect(coreFileNames.route_type).toBe("routes.md");
    expect(coreFileNames.transformation).toBe("transformations.md");
    expect(coreFileNames.async_statement).toBe("async.md");
    // Hyphenated, NOT mi_commands.md per Task 4.6 / rendering-templates §3.2.
    expect(coreFileNames.mi_command).toBe("mi-commands.md");
    expect(coreFileNames.event).toBe("events.md");
    expect(coreFileNames.statistic).toBe("statistics.md");
    expect(coreFileNames.flag).toBe("flags.md");
  });

  it("coreFileH1 maps every doc type to its rendering-templates §3.2 title", () => {
    expect(coreFileH1.core_variable).toBe("Core Pseudo-Variables Reference");
    expect(coreFileH1.core_function).toBe("Core Functions Reference");
    expect(coreFileH1.core_parameter).toBe("Core Parameters Reference");
    expect(coreFileH1.operator).toBe("Operators Reference");
    expect(coreFileH1.statement).toBe("Statements Reference");
    expect(coreFileH1.route_type).toBe("Route Types Reference");
    expect(coreFileH1.transformation).toBe("Transformations Reference");
    expect(coreFileH1.async_statement).toBe("Async Statements Reference");
    expect(coreFileH1.mi_command).toBe("Core MI Commands Reference");
    expect(coreFileH1.event).toBe("Core Events Reference");
    expect(coreFileH1.statistic).toBe("Core Statistics Reference");
    expect(coreFileH1.flag).toBe("Flags Reference");
  });
});

/**
 * Per-doc-type happy-path tests. Each block validates a real fixture, runs
 * the composer, and asserts the canonical skeleton (H1, provenance, lead,
 * TOC, at least one H2 item).
 */
describe("renderCoreDocument — per-doc-type happy paths", () => {
  function assertSkeleton(out: string, h1: string, sourceStem: string, docType: string) {
    // H1 line at the very start.
    expect(out.startsWith(`# ${h1}\n`)).toBe(true);
    // Provenance HTML comment with correct generated-from path and doc-type.
    expect(out).toContain(`<!-- generated-from: data/3.6/core/${sourceStem}.json`);
    expect(out).toContain("generator-version: 0.1.0");
    expect(out).toContain("opensips-version: 3.6");
    expect(out).toContain(`doc-type: ${docType} -->`);
    // TOC heading present.
    expect(out).toContain("## Contents");
    // Final byte is a newline.
    expect(out.endsWith("\n")).toBe(true);
    // At least one H2 item rendered (in addition to "## Contents").
    const h2Lines = out.split("\n").filter((l) => l.startsWith("## "));
    expect(h2Lines.length).toBeGreaterThanOrEqual(2);
  }

  it("core_variable: validates variables.json and renders aggregated file", () => {
    const doc = CoreVariableDocumentSchema.parse(readCore("variables"));
    const out = renderCoreDocument(doc, "core_variable", "3.6", "0.1.0");
    assertSkeleton(out, "Core Pseudo-Variables Reference", "variables", "core_variable");
  });

  it("core_function: validates functions.json and renders aggregated file", () => {
    const doc = CoreFunctionDocumentSchema.parse(readCore("functions"));
    const out = renderCoreDocument(doc, "core_function", "3.6", "0.1.0");
    assertSkeleton(out, "Core Functions Reference", "functions", "core_function");
  });

  it("core_parameter: validates parameters.json and renders aggregated file", () => {
    const doc = CoreParameterDocumentSchema.parse(readCore("parameters"));
    const out = renderCoreDocument(doc, "core_parameter", "3.6", "0.1.0");
    assertSkeleton(out, "Core Parameters Reference", "parameters", "core_parameter");
  });

  it("operator: validates operators.json and renders aggregated file", () => {
    const doc = OperatorDocumentSchema.parse(readCore("operators"));
    const out = renderCoreDocument(doc, "operator", "3.6", "0.1.0");
    assertSkeleton(out, "Operators Reference", "operators", "operator");
  });

  it("statement: validates statements.json and renders aggregated file", () => {
    const doc = StatementDocumentSchema.parse(readCore("statements"));
    const out = renderCoreDocument(doc, "statement", "3.6", "0.1.0");
    assertSkeleton(out, "Statements Reference", "statements", "statement");
  });

  it("route_type: validates routes.json and renders aggregated file", () => {
    const doc = RouteDocumentSchema.parse(readCore("routes"));
    const out = renderCoreDocument(doc, "route_type", "3.6", "0.1.0");
    assertSkeleton(out, "Route Types Reference", "routes", "route_type");
  });

  it("transformation: validates transformations.json and renders aggregated file", () => {
    const doc = TransformationDocumentSchema.parse(readCore("transformations"));
    const out = renderCoreDocument(doc, "transformation", "3.6", "0.1.0");
    assertSkeleton(out, "Transformations Reference", "transformations", "transformation");
  });

  it("async_statement: validates async.json and renders aggregated file", () => {
    const doc = AsyncDocumentSchema.parse(readCore("async"));
    const out = renderCoreDocument(doc, "async_statement", "3.6", "0.1.0");
    assertSkeleton(out, "Async Statements Reference", "async", "async_statement");
  });

  it("mi_command: validates mi-commands.json and renders aggregated file", () => {
    // Source filename uses hyphen; the generated filename also uses hyphen.
    const doc = MICommandDocumentSchema.parse(readCore("mi-commands"));
    const out = renderCoreDocument(doc, "mi_command", "3.6", "0.1.0");
    assertSkeleton(out, "Core MI Commands Reference", "mi-commands", "mi_command");
  });

  it("event: validates events.json and renders aggregated file", () => {
    const doc = EventDocumentSchema.parse(readCore("events"));
    const out = renderCoreDocument(doc, "event", "3.6", "0.1.0");
    assertSkeleton(out, "Core Events Reference", "events", "event");
  });

  it("statistic: validates statistics.json and renders aggregated file", () => {
    const doc = StatisticDocumentSchema.parse(readCore("statistics"));
    const out = renderCoreDocument(doc, "statistic", "3.6", "0.1.0");
    assertSkeleton(out, "Core Statistics Reference", "statistics", "statistic");
  });

  it("flag: validates flags.json and renders aggregated file", () => {
    const doc = FlagDocumentSchema.parse(readCore("flags"));
    const out = renderCoreDocument(doc, "flag", "3.6", "0.1.0");
    assertSkeleton(out, "Flags Reference", "flags", "flag");
  });
});

describe("renderCoreDocument — determinism", () => {
  it("produces byte-identical output across two runs (operators)", () => {
    const doc = OperatorDocumentSchema.parse(readCore("operators"));
    const a = renderCoreDocument(doc, "operator", "3.6", "0.1.0");
    const b = renderCoreDocument(doc, "operator", "3.6", "0.1.0");
    expect(a).toBe(b);
  });

  it("produces byte-identical output across two runs (mi_command)", () => {
    const doc = MICommandDocumentSchema.parse(readCore("mi-commands"));
    const a = renderCoreDocument(doc, "mi_command", "3.6", "0.1.0");
    const b = renderCoreDocument(doc, "mi_command", "3.6", "0.1.0");
    expect(a).toBe(b);
  });
});

describe("renderCoreDocument — empty document", () => {
  it("renders skeleton with no item bodies when the array is empty (operator)", () => {
    // Build a minimal valid OperatorDocument with zero operators.
    const empty = OperatorDocumentSchema.parse({
      id: "operator-3.6",
      document_type: "operator",
      version: "3.6",
      title: "Operators",
      url: "https://opensips.org/html/docs/script-syntax/3.6/operators.html",
      content_markdown: "irrelevant",
      category: "Core",
      extracted_at: "2026-03-01T00:00:00.000Z",
      operators: [],
      operator_categories: [],
    });
    const out = renderCoreDocument(empty, "operator", "3.6", "0.1.0");
    // H1 is present.
    expect(out.startsWith("# Operators Reference\n")).toBe(true);
    // Provenance present.
    expect(out).toContain("doc-type: operator -->");
    // TOC heading is omitted entirely when there are no entries (per
    // markdown-builders renderTOC contract: empty entries → empty string).
    expect(out).not.toContain("## Contents");
    // Final byte is a newline.
    expect(out.endsWith("\n")).toBe(true);
    // No H2 item bodies — only H1 (no `## ` lines other than "Contents",
    // which we already asserted is absent).
    const h2Lines = out.split("\n").filter((l) => l.startsWith("## "));
    expect(h2Lines.length).toBe(0);
  });

  it("renders skeleton with no item bodies when statement array is empty", () => {
    const empty = StatementDocumentSchema.parse({
      id: "statement-3.6",
      document_type: "statement",
      version: "3.6",
      title: "Statements",
      url: "https://opensips.org/html/docs/script-syntax/3.6/statements.html",
      content_markdown: "irrelevant",
      category: "Core",
      extracted_at: "2026-03-01T00:00:00.000Z",
      statements: [],
    });
    const out = renderCoreDocument(empty, "statement", "3.6", "0.1.0");
    expect(out.startsWith("# Statements Reference\n")).toBe(true);
    expect(out.endsWith("\n")).toBe(true);
    expect(out).not.toContain("## Contents");
  });
});

describe("renderCoreDocument — alphabetical ordering", () => {
  it("orders statement items alphabetically by name regardless of source order", () => {
    const doc = StatementDocumentSchema.parse({
      id: "statement-3.6",
      document_type: "statement",
      version: "3.6",
      title: "Statements",
      url: "https://opensips.org/html/docs/script-syntax/3.6/statements.html",
      content_markdown: "irrelevant",
      category: "Core",
      extracted_at: "2026-03-01T00:00:00.000Z",
      statements: [
        {
          name: "while",
          syntax: "while (expr) { ... }",
          description: "Loop while condition is true.",
          parameters: [],
          usage_context: [],
          examples: [],
        },
        {
          name: "if",
          syntax: "if (expr) { ... }",
          description: "Conditional execution.",
          parameters: [],
          usage_context: [],
          examples: [],
        },
        {
          name: "switch",
          syntax: "switch (expr) { ... }",
          description: "Multi-branch dispatch.",
          parameters: [],
          usage_context: [],
          examples: [],
        },
      ],
    });
    const out = renderCoreDocument(doc, "statement", "3.6", "0.1.0");
    const ifIdx = out.indexOf("## `if`");
    const switchIdx = out.indexOf("## `switch`");
    const whileIdx = out.indexOf("## `while`");
    expect(ifIdx).toBeGreaterThan(0);
    expect(switchIdx).toBeGreaterThan(0);
    expect(whileIdx).toBeGreaterThan(0);
    expect(ifIdx).toBeLessThan(switchIdx);
    expect(switchIdx).toBeLessThan(whileIdx);
    // TOC entries appear in the same alphabetical order.
    const tocIfIdx = out.indexOf("[`if`]");
    const tocSwitchIdx = out.indexOf("[`switch`]");
    const tocWhileIdx = out.indexOf("[`while`]");
    expect(tocIfIdx).toBeLessThan(tocSwitchIdx);
    expect(tocSwitchIdx).toBeLessThan(tocWhileIdx);
    // TOC precedes body sections.
    expect(tocIfIdx).toBeLessThan(ifIdx);
  });

  it("orders operators alphabetically by trimmed symbol", () => {
    const doc = OperatorDocumentSchema.parse({
      id: "operator-3.6",
      document_type: "operator",
      version: "3.6",
      title: "Operators",
      url: "https://opensips.org/html/docs/script-syntax/3.6/operators.html",
      content_markdown: "irrelevant",
      category: "Core",
      extracted_at: "2026-03-01T00:00:00.000Z",
      operators: [
        {
          symbol: "+",
          name: "Addition",
          category: "arithmetic",
          operand_type: "binary",
          description: "Add.",
          applicable_to: ["integer"],
          precedence: 12,
          associativity: "left",
          examples: [],
        },
        {
          // Leading-whitespace symbol: must trim before sort & heading.
          symbol: " =",
          name: "Assignment",
          category: "assignment",
          operand_type: "binary",
          description: "Assign.",
          applicable_to: ["variable"],
          precedence: 14,
          associativity: "right",
          examples: [],
        },
        {
          symbol: "-",
          name: "Subtraction",
          category: "arithmetic",
          operand_type: "binary",
          description: "Subtract.",
          applicable_to: ["integer"],
          precedence: 12,
          associativity: "left",
          examples: [],
        },
      ],
      operator_categories: [],
    });
    const out = renderCoreDocument(doc, "operator", "3.6", "0.1.0");
    // Heading lines for the three operators (trimmed symbols).
    const plusIdx = out.indexOf("## `+` (Addition)");
    const minusIdx = out.indexOf("## `-` (Subtraction)");
    const eqIdx = out.indexOf("## `=` (Assignment)");
    expect(plusIdx).toBeGreaterThan(0);
    expect(minusIdx).toBeGreaterThan(0);
    expect(eqIdx).toBeGreaterThan(0);
    // ASCII order: '+' (43) < '-' (45) < '=' (61).
    expect(plusIdx).toBeLessThan(minusIdx);
    expect(minusIdx).toBeLessThan(eqIdx);
  });

  it("orders flag types alphabetically by type_name", () => {
    const doc = FlagDocumentSchema.parse({
      id: "flag-3.6",
      document_type: "flag",
      version: "3.6",
      title: "Flags",
      url: "https://opensips.org/html/docs/script-syntax/3.6/flags.html",
      content_markdown: "irrelevant",
      category: "Core",
      extracted_at: "2026-03-01T00:00:00.000Z",
      flag_types: [
        {
          type_name: "script flags",
          description: "Script-level flags.",
          max_flags: 32,
          persistence: "script-run",
          functions: [],
          examples: [],
        },
        {
          type_name: "branch flags",
          description: "Branch-scoped flags.",
          max_flags: 32,
          persistence: "branch",
          functions: [],
          examples: [],
        },
        {
          type_name: "message flags",
          description: "Per-message flags.",
          max_flags: 32,
          persistence: "per-message",
          functions: [],
          examples: [],
        },
      ],
    });
    const out = renderCoreDocument(doc, "flag", "3.6", "0.1.0");
    const branchIdx = out.indexOf("## branch flags");
    const messageIdx = out.indexOf("## message flags");
    const scriptIdx = out.indexOf("## script flags");
    expect(branchIdx).toBeGreaterThan(0);
    expect(messageIdx).toBeGreaterThan(0);
    expect(scriptIdx).toBeGreaterThan(0);
    expect(branchIdx).toBeLessThan(messageIdx);
    expect(messageIdx).toBeLessThan(scriptIdx);
  });
});

describe("renderCoreDocument — TOC anchors line up with item headings", () => {
  it("emits a TOC entry pointing at each statement's anchor", () => {
    const doc = StatementDocumentSchema.parse({
      id: "statement-3.6",
      document_type: "statement",
      version: "3.6",
      title: "Statements",
      url: "https://opensips.org/html/docs/script-syntax/3.6/statements.html",
      content_markdown: "irrelevant",
      category: "Core",
      extracted_at: "2026-03-01T00:00:00.000Z",
      statements: [
        {
          name: "if",
          syntax: "if (expr) { ... }",
          description: "Conditional execution.",
          parameters: [],
          usage_context: [],
          examples: [],
        },
      ],
    });
    const out = renderCoreDocument(doc, "statement", "3.6", "0.1.0");
    // Anchor for `` `if` `` per toAnchor: backticks dropped → "if".
    expect(out).toContain("- [`if`](#if)");
  });
});

describe("renderCoreDocument — unknown docType", () => {
  it("throws when given an unrecognized doc type", () => {
    const empty = OperatorDocumentSchema.parse({
      id: "operator-3.6",
      document_type: "operator",
      version: "3.6",
      title: "Operators",
      url: "https://opensips.org/html/docs/script-syntax/3.6/operators.html",
      content_markdown: "irrelevant",
      category: "Core",
      extracted_at: "2026-03-01T00:00:00.000Z",
      operators: [],
      operator_categories: [],
    });
    // Cast to bypass the compile-time guard for the runtime test.
    const bogus = "not_a_real_type" as unknown as CoreDocType;
    expect(() => renderCoreDocument(empty, bogus, "3.6", "0.1.0")).toThrow();
  });
});

describe("renderCoreDocument — version interpolation", () => {
  it("interpolates the version into the lead paragraph", () => {
    const doc = OperatorDocumentSchema.parse(readCore("operators"));
    const out = renderCoreDocument(doc, "operator", "3.6", "0.1.0");
    expect(out).toContain("OpenSIPs 3.6 script operators");
  });

  it("interpolates a different version into the provenance and lead", () => {
    const doc = OperatorDocumentSchema.parse(readCore("operators"));
    const out = renderCoreDocument(doc, "operator", "3.5", "9.9.9");
    expect(out).toContain("data/3.5/core/operators.json");
    expect(out).toContain("opensips-version: 3.5");
    expect(out).toContain("generator-version: 9.9.9");
    expect(out).toContain("OpenSIPs 3.5 script operators");
  });
});

describe("renderCoreDocument — no triple-blank-line runs", () => {
  it("never emits three or more consecutive newlines", () => {
    const doc = OperatorDocumentSchema.parse(readCore("operators"));
    const out = renderCoreDocument(doc, "operator", "3.6", "0.1.0");
    expect(/\n{3,}/.test(out)).toBe(false);
  });
});
