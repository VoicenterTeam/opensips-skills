import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildModuleCatalogRows,
  renderModuleCatalogTable,
  injectModuleIndex,
  rebuildModuleIndex,
  renderModulesIndexMarkdown,
  type ModuleCatalogRow,
} from "../../../scripts/build-module-index/index.js";
import type { ModuleDocument } from "../../../scripts/schemas/modules.schema.js";

/**
 * Build a minimal but schema-valid {@link ModuleDocument} for tests.
 * @param overrides - Fields to override on the base document.
 * @returns A fresh ModuleDocument suitable for buildModuleCatalogRows.
 */
function makeModule(overrides: Partial<ModuleDocument> = {}): ModuleDocument {
  return {
    id: "module-tm-3.6",
    document_type: "module",
    version: "3.6",
    title: "tm Module",
    url: "https://opensips.org/html/docs/modules/3.6.x/tm.html",
    content_markdown: "irrelevant",
    category: "Modules",
    extracted_at: "2026-03-01T00:00:00.000Z",
    module_name: "tm",
    overview: "TM module enables stateful processing of SIP transactions.",
    exported_parameters: [],
    exported_functions: [],
    ...overrides,
  };
}

describe("buildModuleCatalogRows", () => {
  it("returns an empty array for empty input", () => {
    expect(buildModuleCatalogRows([])).toEqual([]);
  });

  it("returns one row per module with name, purpose, and reference path", () => {
    const rows = buildModuleCatalogRows([
      makeModule({
        module_name: "tm",
        overview: "TM module enables stateful processing of SIP transactions.",
      }),
    ]);
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    expect(row.name).toBe("tm");
    expect(row.purpose).toBe(
      "TM module enables stateful processing of SIP transactions",
    );
    expect(row.referencePath).toBe("references/{version}/modules/tm.md");
  });

  it("sorts rows alphabetically by module name", () => {
    const rows = buildModuleCatalogRows([
      makeModule({ module_name: "tm", overview: "A." }),
      makeModule({ module_name: "acc", overview: "B." }),
      makeModule({ module_name: "dialog", overview: "C." }),
    ]);
    expect(rows.map((r) => r.name)).toEqual(["acc", "dialog", "tm"]);
  });

  it("takes the first sentence only from a multi-paragraph overview", () => {
    const rows = buildModuleCatalogRows([
      makeModule({
        module_name: "acc",
        overview:
          "ACC handles call accounting. The second sentence describes more details. And a third one.\n\nA second paragraph follows.",
      }),
    ]);
    expect(rows[0]!.purpose).toBe("ACC handles call accounting");
  });

  it("truncates a first sentence longer than 80 chars with ellipsis", () => {
    const overview =
      "This is an extremely long first sentence that definitely exceeds the eighty character limit by a wide margin. Other sentence.";
    const rows = buildModuleCatalogRows([
      makeModule({ module_name: "verbose", overview }),
    ]);
    const purpose = rows[0]!.purpose;
    // Ends with ellipsis (U+2026).
    expect(purpose.endsWith("…")).toBe(true);
    // Total visible length is at most 80 (the ellipsis is included).
    expect(purpose.length).toBeLessThanOrEqual(80);
    expect(purpose.length).toBeGreaterThan(60);
  });

  it("sanitizes newlines and pipe characters in the purpose", () => {
    const rows = buildModuleCatalogRows([
      makeModule({
        module_name: "weird",
        overview: "First | sentence\nwith newline and pipe. Second.",
      }),
    ]);
    const purpose = rows[0]!.purpose;
    expect(purpose).not.toContain("\n");
    // Pipe must be escaped so it does not break the Markdown table cell.
    expect(purpose).toContain("\\|");
    expect(purpose).not.toMatch(/[^\\]\|/); // no unescaped pipe.
  });

  it("falls back to 'OpenSIPs module' when overview is empty", () => {
    const rows = buildModuleCatalogRows([
      makeModule({ module_name: "blank", overview: "" }),
    ]);
    expect(rows[0]!.purpose).toBe("OpenSIPs module");
  });

  it("falls back to 'OpenSIPs module' when overview is whitespace only", () => {
    const rows = buildModuleCatalogRows([
      makeModule({ module_name: "blank", overview: "   \n  \t " }),
    ]);
    expect(rows[0]!.purpose).toBe("OpenSIPs module");
  });

  it("uses the entire overview when there is no sentence boundary", () => {
    const rows = buildModuleCatalogRows([
      makeModule({
        module_name: "single",
        overview: "Short one-liner without a period",
      }),
    ]);
    expect(rows[0]!.purpose).toBe("Short one-liner without a period");
  });

  it("strips Markdown code-fence boundary backticks", () => {
    const rows = buildModuleCatalogRows([
      makeModule({
        module_name: "fenced",
        overview: "```\nA fenced block. More text.",
      }),
    ]);
    const purpose = rows[0]!.purpose;
    expect(purpose).not.toContain("```");
    expect(purpose).toContain("A fenced block");
  });
});

describe("renderModuleCatalogTable", () => {
  it("returns just the table header for an empty rows list", () => {
    const out = renderModuleCatalogTable([]);
    expect(out).toContain("| Module | Purpose | Reference file |");
    expect(out).toContain("|---|---|---|");
    expect(out.endsWith("\n")).toBe(true);
  });

  it("renders a header, separator, and one data row per input row", () => {
    const rows: ModuleCatalogRow[] = [
      {
        name: "acc",
        purpose: "Call accounting",
        referencePath: "references/{version}/modules/acc.md",
      },
      {
        name: "tm",
        purpose: "Transaction stateful processing",
        referencePath: "references/{version}/modules/tm.md",
      },
    ];
    const out = renderModuleCatalogTable(rows);
    const lines = out.trimEnd().split("\n");
    expect(lines[0]).toBe("| Module | Purpose | Reference file |");
    expect(lines[1]).toBe("|---|---|---|");
    expect(lines[2]).toBe(
      "| `acc` | Call accounting | `references/{version}/modules/acc.md` |",
    );
    expect(lines[3]).toBe(
      "| `tm` | Transaction stateful processing | `references/{version}/modules/tm.md` |",
    );
    expect(lines).toHaveLength(4);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderModuleCatalogTable([
      {
        name: "x",
        purpose: "x",
        referencePath: "p",
      },
    ]);
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("injectModuleIndex", () => {
  const TABLE = "| Module | Purpose | Reference file |\n|---|---|---|\n| `tm` | Transaction stateful processing | `references/{version}/modules/tm.md` |\n";

  it("replaces the BEGIN/END marker block with the table", () => {
    const input =
      "## Module index\n\n<!-- MODULE_INDEX:BEGIN -->\n<!-- MODULE_INDEX_PLACEHOLDER -->\n<!-- MODULE_INDEX:END -->\n\n## Next section\n";
    const out = injectModuleIndex(input, TABLE);
    expect(out).toContain("<!-- MODULE_INDEX:BEGIN -->");
    expect(out).toContain("<!-- MODULE_INDEX:END -->");
    expect(out).toContain("| `tm` | Transaction stateful processing |");
    expect(out).not.toContain("<!-- MODULE_INDEX_PLACEHOLDER -->");
    expect(out).toContain("## Module index");
    expect(out).toContain("## Next section");
  });

  it("is idempotent: running twice on the same input produces identical output", () => {
    const input =
      "## Module index\n\n<!-- MODULE_INDEX:BEGIN -->\n<!-- MODULE_INDEX_PLACEHOLDER -->\n<!-- MODULE_INDEX:END -->\n\n## Next section\n";
    const once = injectModuleIndex(input, TABLE);
    const twice = injectModuleIndex(once, TABLE);
    expect(twice).toBe(once);
  });

  it("replaces an existing rendered table when the markers persist", () => {
    const input =
      "## Module index\n\n<!-- MODULE_INDEX:BEGIN -->\n| Module | Purpose | Reference file |\n|---|---|---|\n| `old` | stale | `p` |\n<!-- MODULE_INDEX:END -->\n";
    const out = injectModuleIndex(input, TABLE);
    expect(out).not.toContain("`old`");
    expect(out).toContain("`tm`");
  });

  it("throws when neither markers nor placeholder are present", () => {
    const input = "## Module index\n\nno marker here\n";
    expect(() => injectModuleIndex(input, TABLE)).toThrow(
      /MODULE_INDEX|placeholder/i,
    );
  });
});

describe("renderModulesIndexMarkdown", () => {
  it("emits a top-level heading, a stable index table, and the lookup-discipline section", () => {
    const docs = [
      { module_name: "tm", overview: "TM enables stateful processing." } as any,
      { module_name: "acc", overview: "Accounts transactions to backends." } as any,
    ];
    const md = renderModulesIndexMarkdown(docs, "3.6");
    expect(md).toContain("# OpenSIPs module index");
    expect(md).toMatch(/\| Module \| Purpose \| Reference file \|/);
    expect(md).toContain("`acc`");
    expect(md).toContain("`tm`");
    expect(md).toContain("references/{version}/modules/acc.md");
    expect(md).toContain("## When a module is not in the index");
  });

  it("includes the version string in the intro paragraph", () => {
    const docs = [
      { module_name: "tm", overview: "TM enables stateful processing." } as any,
    ];
    const md35 = renderModulesIndexMarkdown(docs, "3.5");
    const md36 = renderModulesIndexMarkdown(docs, "3.6");
    expect(md35).toContain("Generated reference for OpenSIPs 3.5.");
    expect(md36).toContain("Generated reference for OpenSIPs 3.6.");
  });

  it("renders rows alphabetically regardless of input order", () => {
    // Input is intentionally unsorted (tm before acc) to verify the renderer
    // sorts the rows. The buildModuleCatalogRows test already covers ordering
    // at the row level; this asserts the property at the integration level.
    const docs = [
      { module_name: "tm", overview: "TM enables stateful processing." } as any,
      { module_name: "acc", overview: "Accounts transactions to backends." } as any,
      { module_name: "dialog", overview: "Dialog awareness for the proxy." } as any,
    ];
    const md = renderModulesIndexMarkdown(docs, "3.6");
    const accIdx = md.indexOf("`acc`");
    const dialogIdx = md.indexOf("`dialog`");
    const tmIdx = md.indexOf("`tm`");
    expect(accIdx).toBeGreaterThan(-1);
    expect(dialogIdx).toBeGreaterThan(accIdx);
    expect(tmIdx).toBeGreaterThan(dialogIdx);
  });
});

describe("rebuildModuleIndex (end-to-end against real data/3.6)", () => {
  let tmp: string;
  let skillMd: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "opensips-build-module-index-"));
    skillMd = join(tmp, "SKILL.md");
    writeFileSync(
      skillMd,
      "# tmp skill\n\n## Module index\n\n<!-- MODULE_INDEX:BEGIN -->\n<!-- MODULE_INDEX_PLACEHOLDER -->\n<!-- MODULE_INDEX:END -->\n\n## End\n",
      "utf8",
    );
  });

  afterEach(() => {
    if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
  });

  it("populates the table from real data/3.6/ with at least 100 rows and no placeholder remaining", async () => {
    await rebuildModuleIndex(skillMd, "./data", "3.6");
    const out = readFileSync(skillMd, "utf8");
    expect(out).not.toContain("<!-- MODULE_INDEX_PLACEHOLDER -->");
    expect(out).toContain("<!-- MODULE_INDEX:BEGIN -->");
    expect(out).toContain("<!-- MODULE_INDEX:END -->");
    expect(out).toContain("| Module | Purpose | Reference file |");
    // Count data rows (lines starting with "| `").
    const dataRows = out
      .split("\n")
      .filter((line) => /^\| `[a-z0-9_]+` \|/.test(line));
    expect(dataRows.length).toBeGreaterThanOrEqual(100);
  });

  it("is idempotent end-to-end: a second run produces byte-identical output", async () => {
    await rebuildModuleIndex(skillMd, "./data", "3.6");
    const first = readFileSync(skillMd, "utf8");
    await rebuildModuleIndex(skillMd, "./data", "3.6");
    const second = readFileSync(skillMd, "utf8");
    expect(second).toBe(first);
  });
});
