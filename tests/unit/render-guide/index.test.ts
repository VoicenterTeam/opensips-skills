import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderGuide, guideFileNames } from "../../../scripts/render-guide/index.js";
import { GuideDocumentSchema, type GuideDocument } from "../../../scripts/schemas/guides.schema.js";

/**
 * Load and validate a real guide JSON fixture from the data tree.
 *
 * @param version - OpenSIPs version folder under `data/`.
 * @param stem - Guide filename stem (one of `installation`, `configuration`,
 *   `syntax`).
 * @returns Schema-validated {@link GuideDocument}.
 */
function loadFixture(version: string, stem: string): GuideDocument {
  const path = resolve(process.cwd(), `data/${version}/guides/${stem}.json`);
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  return GuideDocumentSchema.parse(raw);
}

/**
 * Build a minimal but schema-valid {@link GuideDocument} for tests that
 * exercise tightly controlled inputs (empty optional arrays, missing
 * synopsis, etc.).
 *
 * @param overrides - Optional field overrides applied via spread.
 * @returns A fresh GuideDocument suitable for renderGuide.
 */
function minimalGuide(overrides: Partial<GuideDocument> = {}): GuideDocument {
  return GuideDocumentSchema.parse({
    id: "installation_guide-CompileAndInstall-3.6",
    document_type: "installation_guide",
    version: "3.6",
    title: "Compile and Install v3.6",
    url: "https://www.opensips.org/Documentation/Install-CompileAndInstall-3-6",
    content_markdown: "irrelevant body",
    category: "Installation",
    extracted_at: "2026-03-01T00:00:00.000Z",
    ...overrides,
  });
}

describe("guideFileNames map", () => {
  it("maps installation_guide to installation.md", () => {
    expect(guideFileNames["installation_guide"]).toBe("installation.md");
  });
  it("maps configuration_guide to configuration.md", () => {
    expect(guideFileNames["configuration_guide"]).toBe("configuration.md");
  });
  it("maps syntax_guide to syntax.md", () => {
    expect(guideFileNames["syntax_guide"]).toBe("syntax.md");
  });
});

describe("renderGuide — installation_guide (real 3.6 fixture)", () => {
  const doc = loadFixture("3.6", "installation");
  const out = renderGuide(doc, "3.6", "0.1.0");

  it("starts with an H1 of the document title", () => {
    expect(out.startsWith(`# ${doc.title}\n`)).toBe(true);
  });

  it("includes the canonical provenance comment with the right doc-type and source path", () => {
    expect(out).toContain("<!-- generated-from: data/3.6/guides/installation.json");
    expect(out).toContain("generator-version: 0.1.0");
    expect(out).toContain("opensips-version: 3.6");
    expect(out).toContain("doc-type: installation_guide -->");
  });

  it("includes the lead paragraph for installation_guide", () => {
    expect(out).toContain("Compile and install instructions for OpenSIPs 3.6");
  });

  it("renders an Overview section because synopsis is non-empty", () => {
    expect(out).toContain("## Overview");
    expect(out).toContain(doc.synopsis ?? "");
  });

  it("renders a Contents TOC", () => {
    expect(out).toContain("## Contents");
  });

  it("renders the type-specific Prerequisites section with bulleted list", () => {
    expect(out).toContain("## Prerequisites");
    // Real 3.6 fixture has 3 prerequisites; first is required, others optional.
    expect(out).toContain("ncurses development library");
    expect(out).toContain("(required)");
    expect(out).toContain("(optional)");
  });

  it("renders the type-specific Installation Steps section with H3 step entries", () => {
    expect(out).toContain("## Installation Steps");
    // step_number + title combined into the H3.
    expect(out).toContain("### Step 1: Compile");
    expect(out).toContain("### Step 2: Configuring Compilation Flags");
    // commands rendered as a bash code block somewhere in the body.
    expect(out).toContain("```bash\nmake all\n```");
  });

  it("ends with exactly one trailing newline", () => {
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("contains no run of three or more consecutive line terminators", () => {
    expect(/(?:\n[ \t]*){3,}/.test(out)).toBe(false);
  });
});

describe("renderGuide — configuration_guide (real 3.6 fixture)", () => {
  const doc = loadFixture("3.6", "configuration");
  const out = renderGuide(doc, "3.6", "0.1.0");

  it("starts with an H1 of the document title", () => {
    expect(out.startsWith(`# ${doc.title}\n`)).toBe(true);
  });

  it("includes provenance with configuration_guide doc-type", () => {
    expect(out).toContain("<!-- generated-from: data/3.6/guides/configuration.json");
    expect(out).toContain("doc-type: configuration_guide -->");
  });

  it("includes the lead paragraph for configuration_guide", () => {
    expect(out).toContain("Configuration walkthrough for OpenSIPs 3.6");
  });

  it("renders an Overview section because synopsis is non-empty", () => {
    expect(out).toContain("## Overview");
  });

  it("renders the type-specific Best Practices section (3.6 configuration has 2)", () => {
    expect(out).toContain("## Best Practices");
    expect(out).toContain("Restarting OpenSIPS");
    expect(out).toContain("Checking Configuration Validity");
  });

  it("does NOT render Installation Steps or Prerequisites for a configuration guide with neither", () => {
    expect(out).not.toContain("## Installation Steps");
    expect(out).not.toContain("## Prerequisites");
  });

  it("ends with exactly one trailing newline", () => {
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderGuide — syntax_guide (real 3.6 fixture)", () => {
  const doc = loadFixture("3.6", "syntax");
  const out = renderGuide(doc, "3.6", "0.1.0");

  it("starts with an H1 of the document title", () => {
    expect(out.startsWith(`# ${doc.title}\n`)).toBe(true);
  });

  it("includes provenance with syntax_guide doc-type", () => {
    expect(out).toContain("<!-- generated-from: data/3.6/guides/syntax.json");
    expect(out).toContain("doc-type: syntax_guide -->");
  });

  it("includes the lead paragraph for syntax_guide", () => {
    expect(out).toContain("Script syntax reference for OpenSIPs 3.6");
  });

  it("renders the type-specific Configuration Sections", () => {
    expect(out).toContain("## Configuration Sections");
    // A few real section names from the 3.6 fixture.
    expect(out).toContain("Global Parameters");
    expect(out).toContain("Modules Section");
    expect(out).toContain("Routing Logic");
  });

  it("renders example code blocks with language tags", () => {
    // The 3.6 syntax fixture has examples with language opensips_script.
    expect(out).toMatch(/```opensips_script\n[\s\S]+?\n```/);
  });

  it("renders the Best Practices section (3.6 syntax has 4)", () => {
    expect(out).toContain("## Best Practices");
  });

  it("ends with exactly one trailing newline", () => {
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderGuide — determinism", () => {
  it("produces byte-identical output across two calls (installation 3.6)", () => {
    const doc = loadFixture("3.6", "installation");
    const a = renderGuide(doc, "3.6", "0.1.0");
    const b = renderGuide(doc, "3.6", "0.1.0");
    expect(a).toBe(b);
  });

  it("produces byte-identical output across two calls (configuration 3.6)", () => {
    const doc = loadFixture("3.6", "configuration");
    const a = renderGuide(doc, "3.6", "0.1.0");
    const b = renderGuide(doc, "3.6", "0.1.0");
    expect(a).toBe(b);
  });

  it("produces byte-identical output across two calls (syntax 3.6)", () => {
    const doc = loadFixture("3.6", "syntax");
    const a = renderGuide(doc, "3.6", "0.1.0");
    const b = renderGuide(doc, "3.6", "0.1.0");
    expect(a).toBe(b);
  });
});

describe("renderGuide — empty/absent optional arrays", () => {
  it("does not crash and omits sections for installation_guide with empty arrays", () => {
    const doc = minimalGuide({
      installation_steps: [],
      prerequisites: [],
      troubleshooting: [],
    });
    const out = renderGuide(doc, "3.6", "0.1.0");
    expect(out).not.toContain("## Prerequisites");
    expect(out).not.toContain("## Installation Steps");
    expect(out).not.toContain("## Troubleshooting");
    // Lead paragraph still present and file ends with one newline.
    expect(out).toContain("Compile and install instructions for OpenSIPs 3.6");
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("does not crash and omits sections for installation_guide with all optionals absent", () => {
    const doc = minimalGuide({});
    const out = renderGuide(doc, "3.6", "0.1.0");
    expect(out).not.toContain("## Prerequisites");
    expect(out).not.toContain("## Installation Steps");
    expect(out).not.toContain("## Troubleshooting");
    expect(out).not.toContain("## Best Practices");
  });

  it("omits Overview when synopsis is missing", () => {
    const doc = minimalGuide({ synopsis: "" });
    const out = renderGuide(doc, "3.6", "0.1.0");
    expect(out).not.toContain("## Overview");
  });
});

describe("renderGuide — troubleshooting (3.4 configuration fixture)", () => {
  // The 3.4 configuration guide actually carries a troubleshooting array;
  // verify rendering even though our M4 scope is 3.6, since the schema
  // permits troubleshooting on any guide doc-type and the renderer must
  // handle it everywhere it appears.
  const doc = loadFixture("3.4", "configuration");
  const out = renderGuide(doc, "3.4", "0.1.0");

  it("renders a Troubleshooting section with each problem-solution pair", () => {
    expect(out).toContain("## Troubleshooting");
    expect(out).toContain("Checking configuration file validity");
  });
});

describe("renderGuide — heading text for guide types", () => {
  it("uses the guide's title as H1 (no decoration like 'Module Reference')", () => {
    const doc = minimalGuide({ title: "Compile and Install v3.6" });
    const out = renderGuide(doc, "3.6", "0.1.0");
    expect(out.split("\n")[0]).toBe("# Compile and Install v3.6");
  });
});
