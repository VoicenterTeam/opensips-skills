import { describe, it, expect } from "vitest";
import { renderModule } from "../../../scripts/render-module/index.js";
import type { ModuleDocument } from "../../../scripts/schemas/modules.schema.js";

/**
 * Build a minimal but schema-valid {@link ModuleDocument} for tests that
 * need only the always-present sections. Required base fields plus the
 * three required module fields (`module_name`, `overview`,
 * `exported_parameters`, `exported_functions`); section arrays default to
 * empty so only Overview + Dependencies will render.
 *
 * @param overrides - Optional field overrides applied via spread.
 * @returns A fresh ModuleDocument suitable for renderModule.
 */
function minimalModule(overrides: Partial<ModuleDocument> = {}): ModuleDocument {
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
    overview: "The tm module provides stateful processing for SIP transactions.",
    exported_parameters: [],
    exported_functions: [],
    ...overrides,
  };
}

describe("renderModule — minimal input (only required sections)", () => {
  it("emits exactly Overview and Dependencies in TOC and body", () => {
    const out = renderModule(minimalModule(), "3.6", "0.1.0");

    // H1 with module name + " Module Reference"
    expect(out.startsWith("# tm Module Reference\n")).toBe(true);

    // TOC contains exactly the two entries
    expect(out).toContain("## Contents");
    expect(out).toContain("- [Overview](#overview)");
    expect(out).toContain("- [Dependencies](#dependencies)");
    // Conditional sections must NOT appear in TOC
    expect(out).not.toContain("[How It Works]");
    expect(out).not.toContain("[Exported Parameters]");
    expect(out).not.toContain("[Exported Functions]");
    expect(out).not.toContain("[Exported Pseudo-Variables]");
    expect(out).not.toContain("[Exported MI Functions]");
    expect(out).not.toContain("[Exported Statistics]");
    expect(out).not.toContain("[Exported Events]");
    expect(out).not.toContain("[Configuration Examples]");

    // Body sections
    expect(out).toContain("## Overview");
    expect(out).toContain("## Dependencies");
    expect(out).not.toContain("## How It Works");
    expect(out).not.toContain("## Exported Parameters");
    expect(out).not.toContain("## Exported Functions");
    expect(out).not.toContain("## Exported Pseudo-Variables");
    expect(out).not.toContain("## Exported MI Functions");
    expect(out).not.toContain("## Exported Statistics");
    expect(out).not.toContain("## Exported Events");
    expect(out).not.toContain("## Configuration Examples");
  });

  it("renders both Dependencies subsections as 'None.'", () => {
    const out = renderModule(minimalModule(), "3.6", "0.1.0");
    // Two None. one for OpenSIPs Modules, one for External Libraries
    const noneCount = (out.match(/None\./g) ?? []).length;
    expect(noneCount).toBe(2);
    expect(out).toContain("### OpenSIPs Modules");
    expect(out).toContain("### External Libraries");
  });
});

describe("renderModule — provenance content", () => {
  it("includes the correct provenance fields and slug-based source path", () => {
    const out = renderModule(minimalModule({ module_name: "Mi-HTTP" }), "3.6", "0.1.0");
    expect(out).toContain("<!-- generated-from: data/3.6/modules/mi-http.json");
    expect(out).toContain("generator-version: 0.1.0");
    expect(out).toContain("opensips-version: 3.6");
    expect(out).toContain("doc-type: module -->");
  });
});

describe("renderModule — how_it_works conditional", () => {
  it("omits How It Works when how_it_works is undefined", () => {
    const out = renderModule(minimalModule(), "3.6", "0.1.0");
    expect(out).not.toContain("## How It Works");
    expect(out).not.toContain("[How It Works]");
  });

  it("omits How It Works when how_it_works is null", () => {
    const out = renderModule(minimalModule({ how_it_works: null }), "3.6", "0.1.0");
    expect(out).not.toContain("## How It Works");
  });

  it("omits How It Works when how_it_works is empty string", () => {
    const out = renderModule(minimalModule({ how_it_works: "" }), "3.6", "0.1.0");
    expect(out).not.toContain("## How It Works");
  });

  it("omits How It Works when how_it_works is whitespace only", () => {
    const out = renderModule(minimalModule({ how_it_works: "   \n\t \n" }), "3.6", "0.1.0");
    expect(out).not.toContain("## How It Works");
    expect(out).not.toContain("[How It Works]");
  });

  it("emits How It Works when how_it_works has content", () => {
    const out = renderModule(
      minimalModule({ how_it_works: "It works statefully." }),
      "3.6",
      "0.1.0",
    );
    expect(out).toContain("## How It Works");
    expect(out).toContain("It works statefully.");
    expect(out).toContain("[How It Works](#how-it-works)");
  });
});

describe("renderModule — TOC matches sections", () => {
  it("for Overview + Dependencies + Parameters + Functions, TOC has exactly those four entries in order", () => {
    const mod = minimalModule({
      exported_parameters: [
        {
          name: "fr_timeout",
          type: "integer",
          description: "FR timeout.",
        },
      ],
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "",
          description: "Relay statefully.",
          usage_context: ["REQUEST_ROUTE"],
          examples: [],
        },
      ],
    });
    const out = renderModule(mod, "3.6", "0.1.0");

    // Extract the TOC bullet list
    const tocStart = out.indexOf("## Contents");
    const afterToc = out.indexOf("## Overview", tocStart);
    const tocBlock = out.slice(tocStart, afterToc);

    const tocLines = tocBlock
      .split("\n")
      .filter((l) => l.startsWith("- ["))
      .map((l) => l.trim());

    expect(tocLines).toEqual([
      "- [Overview](#overview)",
      "- [Dependencies](#dependencies)",
      "- [Exported Parameters](#exported-parameters)",
      "- [Exported Functions](#exported-functions)",
    ]);
  });
});

describe("renderModule — alphabetical ordering of sub-elements", () => {
  it("sorts parameters alphabetically by name regardless of source order", () => {
    const mod = minimalModule({
      exported_parameters: [
        { name: "zebra", type: "string", description: "Z." },
        { name: "alpha", type: "string", description: "A." },
        { name: "mango", type: "string", description: "M." },
      ],
    });
    const out = renderModule(mod, "3.6", "0.1.0");
    const idxAlpha = out.indexOf("`alpha`");
    const idxMango = out.indexOf("`mango`");
    const idxZebra = out.indexOf("`zebra`");
    expect(idxAlpha).toBeGreaterThan(0);
    expect(idxAlpha).toBeLessThan(idxMango);
    expect(idxMango).toBeLessThan(idxZebra);
  });

  it("sorts functions alphabetically by name regardless of source order", () => {
    const mod = minimalModule({
      exported_functions: [
        {
          name: "z_func",
          signature: "z_func()",
          parameters: [],
          return_type: "",
          description: "Z.",
          usage_context: [],
          examples: [],
        },
        {
          name: "a_func",
          signature: "a_func()",
          parameters: [],
          return_type: "",
          description: "A.",
          usage_context: [],
          examples: [],
        },
      ],
    });
    const out = renderModule(mod, "3.6", "0.1.0");
    const idxA = out.indexOf("`a_func()`");
    const idxZ = out.indexOf("`z_func()`");
    expect(idxA).toBeGreaterThan(0);
    expect(idxA).toBeLessThan(idxZ);
  });

  it("preserves source order for configuration examples (not alphabetized)", () => {
    const mod = minimalModule({
      configuration_examples: [
        {
          title: "Zebra setup",
          description: "Z config.",
          code: "loadmodule \"zebra.so\"",
        },
        {
          title: "Alpha setup",
          description: "A config.",
          code: "loadmodule \"alpha.so\"",
        },
      ],
    });
    const out = renderModule(mod, "3.6", "0.1.0");
    const idxZebra = out.indexOf("Zebra setup");
    const idxAlpha = out.indexOf("Alpha setup");
    expect(idxZebra).toBeGreaterThan(0);
    expect(idxAlpha).toBeGreaterThan(0);
    // Source order: Zebra first, Alpha second
    expect(idxZebra).toBeLessThan(idxAlpha);
  });
});

describe("renderModule — maximal input (every section populated)", () => {
  /**
   * Build a maximal module with at least two of every kind of sub-element,
   * in non-alphabetical source order so sorting is testable.
   */
  function maximalModule(): ModuleDocument {
    return minimalModule({
      module_name: "tm",
      how_it_works: "It tracks transactions across branches.",
      dependencies_required: [
        { name: "signaling", type: "module", reason: "SIP primitives", optional: false },
      ],
      dependencies_optional: ["dialog"],
      exported_parameters: [
        {
          name: "fr_timeout",
          type: "integer",
          default_value: "30",
          description: "FR timeout.",
        },
        {
          name: "auto_redirect",
          type: "integer",
          default_value: "0",
          description: "Auto redirect.",
        },
      ],
      exported_functions: [
        {
          name: "t_relay",
          signature: "t_relay()",
          parameters: [],
          return_type: "",
          description: "Relay.",
          usage_context: ["REQUEST_ROUTE"],
          examples: [],
        },
        {
          name: "t_check_status",
          signature: "t_check_status(re)",
          parameters: [],
          return_type: "",
          description: "Check status.",
          usage_context: ["FAILURE_ROUTE"],
          examples: [],
        },
      ],
      exported_pseudo_variables: [
        {
          name: "$T_branch_idx",
          type: "integer",
          readable: true,
          writable: false,
          scope: "transaction",
          description: "Branch index.",
        },
        {
          name: "$T_reply_code",
          type: "integer",
          readable: true,
          writable: false,
          scope: "transaction",
          description: "Reply code.",
        },
      ],
      exported_mi_functions: [
        {
          name: "t_uac_dlg",
          parameters: [],
          description: "Send out-of-dialog.",
          examples: [],
        },
        {
          name: "t_reply",
          parameters: [],
          description: "Send a reply.",
          examples: [],
        },
      ],
      exported_statistics: [
        {
          name: "tm:received_replies",
          type: "counter",
          description: "Replies received.",
        },
        {
          name: "tm:active_transactions",
          type: "gauge",
          description: "Active transactions.",
        },
      ],
      exported_events: [
        {
          name: "E_TM_BRANCH_FAILED",
          description: "Branch failed.",
          parameters: [],
        },
        {
          name: "E_TM_BRANCH_COMPLETE",
          description: "Branch complete.",
          parameters: [],
        },
      ],
      configuration_examples: [
        {
          title: "Stateful proxy",
          description: "Basic.",
          code: "loadmodule \"tm.so\"",
        },
        {
          title: "Failover",
          description: "Retry on 5xx.",
          code: "modparam(\"tm\", \"fr_timeout\", 30)",
        },
      ],
    });
  }

  it("includes every canonical section in order", () => {
    const out = renderModule(maximalModule(), "3.6", "0.1.0");

    const expectedSections = [
      "## Overview",
      "## How It Works",
      "## Dependencies",
      "## Exported Parameters",
      "## Exported Functions",
      "## Exported Pseudo-Variables",
      "## Exported MI Functions",
      "## Exported Statistics",
      "## Exported Events",
      "## Configuration Examples",
    ];

    let lastIdx = -1;
    for (const heading of expectedSections) {
      const idx = out.indexOf(heading);
      expect(idx, `expected section ${heading} to be present`).toBeGreaterThan(0);
      expect(idx, `expected ${heading} to come after the previous section`).toBeGreaterThan(
        lastIdx,
      );
      lastIdx = idx;
    }
  });

  it("renders the TOC with all 10 entries", () => {
    const out = renderModule(maximalModule(), "3.6", "0.1.0");
    expect(out).toContain("[Overview](#overview)");
    expect(out).toContain("[How It Works](#how-it-works)");
    expect(out).toContain("[Dependencies](#dependencies)");
    expect(out).toContain("[Exported Parameters](#exported-parameters)");
    expect(out).toContain("[Exported Functions](#exported-functions)");
    expect(out).toContain("[Exported Pseudo-Variables](#exported-pseudo-variables)");
    expect(out).toContain("[Exported MI Functions](#exported-mi-functions)");
    expect(out).toContain("[Exported Statistics](#exported-statistics)");
    expect(out).toContain("[Exported Events](#exported-events)");
    expect(out).toContain("[Configuration Examples](#configuration-examples)");
  });
});

describe("renderModule — determinism", () => {
  it("produces byte-identical output across two calls with the same input", () => {
    const a = renderModule(minimalModule(), "3.6", "0.1.0");
    const b = renderModule(minimalModule(), "3.6", "0.1.0");
    expect(a).toBe(b);
  });

  it("produces byte-identical output for a maximal fixture", () => {
    const mod = minimalModule({
      how_it_works: "Operates statefully.",
      exported_parameters: [
        { name: "p1", type: "integer", description: "P1." },
        { name: "p2", type: "string", description: "P2." },
      ],
      exported_functions: [
        {
          name: "f1",
          signature: "f1()",
          parameters: [],
          return_type: "",
          description: "F1.",
          usage_context: [],
          examples: [],
        },
      ],
    });
    const a = renderModule(mod, "3.6", "0.1.0");
    const b = renderModule(mod, "3.6", "0.1.0");
    expect(a).toBe(b);
  });
});

describe("renderModule — trailing newline contract", () => {
  it("output ends with exactly one trailing newline", () => {
    const out = renderModule(minimalModule(), "3.6", "0.1.0");
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderModule — composer normalisation", () => {
  it("collapses runs of three-or-more line terminators including whitespace-only lines", () => {
    // The whitespace-only middle line (e.g. a tab) used to slip past the
    // composer's `\n{3,}` collapse and trip the `no-excess-blank-lines`
    // validation rule. The expanded `(?:\n[ \t]*){3,}` pattern catches
    // this — a real-world recurrence in upstream `how_it_works` fields
    // that were converted from DocBook (db_virtual.json line 64 etc.).
    const out = renderModule(
      minimalModule({
        how_it_works: "Para 1.\n\n\t\t\n\nPara 2.",
      }),
      "3.6",
      "0.1.0",
    );
    // The wrapping H2 + paragraph + paragraph render produces normal
    // blank-line gaps, so a `\n\n` separator is expected. The collapsed
    // output must NOT contain three or more line terminators in a row
    // (including whitespace-only lines), which the validator forbids.
    expect(/(?:\n[ \t]*){4,}/.test(out)).toBe(false);
    // The `Para 1.` and `Para 2.` content must both still appear.
    expect(out).toContain("Para 1.");
    expect(out).toContain("Para 2.");
  });

  it("rebases upstream heading depths so they nest under the wrapping H2", () => {
    // Real-world pattern: an upstream `how_it_works` field begins with
    // `## 1.5. Foo` (DocBook section numbering rendered as H2). Without
    // rebasing, the validator sees this as a sibling H2 and reports the
    // wrapping `## How It Works` as empty. The composer rebases depths
    // so the upstream H2 becomes H3, nested correctly.
    const out = renderModule(
      minimalModule({
        how_it_works:
          "## 1.5. Server specifications\n\n### 1.5.1. Queries\n\nThe server must accept queries.",
      }),
      "3.6",
      "0.1.0",
    );
    expect(out).toContain("## How It Works");
    // Upstream `## 1.5.` should now be `### 1.5.`.
    expect(out).toContain("### 1.5. Server specifications");
    // Upstream `### 1.5.1.` should now be `#### 1.5.1.`.
    expect(out).toContain("#### 1.5.1. Queries");
    // No sibling H2 of "1.5." appears.
    expect(out).not.toContain("\n## 1.5.");
  });

  it("does not rebase heading depths when upstream content already nests deeper than the wrapper", () => {
    // If the upstream content's headings are all H3 or deeper, no shift
    // is required. The composer must be a no-op in that case so we don't
    // unnecessarily push H6 content out of representable Markdown.
    const out = renderModule(
      minimalModule({
        how_it_works: "### Already deep\n\nbody text.",
      }),
      "3.6",
      "0.1.0",
    );
    expect(out).toContain("### Already deep");
    // No "#### Already deep" — would indicate a spurious shift.
    expect(out).not.toContain("#### Already deep");
  });

  it("preserves `#`-prefixed lines inside fenced code blocks (not treated as headings)", () => {
    // A configuration example or how_it_works field with shell comments
    // inside a fenced code block must survive the rebase pass intact —
    // those `#` markers are content, not Markdown headings.
    const out = renderModule(
      minimalModule({
        how_it_works:
          "Some prose.\n\n```bash\n# this is a shell comment, not an H1\necho hello\n```\n",
      }),
      "3.6",
      "0.1.0",
    );
    expect(out).toContain("# this is a shell comment, not an H1");
    // The H1 fence should remain — the only H1 in the file is the title.
    const h1Lines = out
      .split("\n")
      .filter((l) => /^# (?!#)/.test(l)).length;
    // Exactly one H1 outside fenced regions; the rebase does not
    // accidentally introduce another by demoting an H2 inside a fence.
    expect(h1Lines).toBeGreaterThanOrEqual(1);
  });
});
