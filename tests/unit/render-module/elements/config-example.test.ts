import { describe, it, expect } from "vitest";
import { renderConfigExample } from "../../../../scripts/render-module/elements/config-example.js";
import type { ConfigExample } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Build a minimal {@link ConfigExample} with only the schema-required
 * fields set (`title`, `description`, `code`). Tests can spread this
 * and override fields to keep individual cases short.
 *
 * @returns A fresh minimal ConfigExample.
 */
const minimal = (): ConfigExample => ({
  title: "Stateful proxy with failover",
  description: "Configure the tm module for a stateful proxy that retries on 5xx responses.",
  code: 'loadmodule "tm.so"',
});

describe("renderConfigExample — minimal input (no explanation)", () => {
  it("renders H3 plaintext title, prose description, and opensips-fenced code", () => {
    expect(renderConfigExample(minimal())).toMatchInlineSnapshot(`
      "### Stateful proxy with failover

      Configure the tm module for a stateful proxy that retries on 5xx responses.

      \`\`\`opensips
      loadmodule \"tm.so\"
      \`\`\`
      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderConfigExample(minimal());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("uses the title as plain text — not backticked", () => {
    const out = renderConfigExample(minimal());
    expect(out.startsWith("### Stateful proxy with failover\n")).toBe(true);
    expect(out).not.toMatch(/^### `/m);
  });

  it("does not emit an explanation paragraph when the field is undefined", () => {
    const out = renderConfigExample(minimal());
    // After the closing fence, only a trailing newline should follow.
    expect(out).toMatch(/```\n$/);
  });
});

describe("renderConfigExample — maximal input (with explanation)", () => {
  it("renders title, description, code, and explanation paragraph after the fence", () => {
    const example: ConfigExample = {
      title: "Stateful proxy with failover",
      description: "Configure the tm module for a stateful proxy that retries on 5xx responses.",
      code: 'loadmodule "tm.so"\nmodparam("tm", "fr_timeout", 30)\nroute { t_relay(); }',
      explanation: "These options apply only when fr_timeout exceeds the default.",
    };

    expect(renderConfigExample(example)).toMatchInlineSnapshot(`
      "### Stateful proxy with failover

      Configure the tm module for a stateful proxy that retries on 5xx responses.

      \`\`\`opensips
      loadmodule \"tm.so\"
      modparam(\"tm\", \"fr_timeout\", 30)
      route { t_relay(); }
      \`\`\`

      These options apply only when fr_timeout exceeds the default.
      "
    `);
  });

  it("omits the explanation when it is the empty string", () => {
    const example: ConfigExample = {
      ...minimal(),
      explanation: "",
    };
    const out = renderConfigExample(example);
    expect(out).toMatch(/```\n$/);
  });
});

describe("renderConfigExample — heading level", () => {
  it("uses H3 by default (per §3.1.10 module rendering)", () => {
    const out = renderConfigExample(minimal());
    expect(out.startsWith("### ")).toBe(true);
    expect(out.startsWith("#### ")).toBe(false);
  });

  it("uses H2 when headingLevel=2 is passed (M4 core reuse)", () => {
    const out = renderConfigExample(minimal(), 2);
    expect(out.startsWith("## ")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });

  it("renders the H2 form with the same body layout", () => {
    expect(renderConfigExample(minimal(), 2)).toMatchInlineSnapshot(`
      "## Stateful proxy with failover

      Configure the tm module for a stateful proxy that retries on 5xx responses.

      \`\`\`opensips
      loadmodule \"tm.so\"
      \`\`\`
      "
    `);
  });
});

describe("renderConfigExample — multi-line code preservation", () => {
  it("preserves internal newlines verbatim inside the fenced block", () => {
    const example: ConfigExample = {
      title: "Multi-line config",
      description: "Demonstrates that multi-line code is preserved.",
      code: "line one\nline two\nline three",
    };
    const out = renderConfigExample(example);
    expect(out).toContain("```opensips\nline one\nline two\nline three\n```\n");
  });

  it("preserves indentation inside the code block", () => {
    const example: ConfigExample = {
      title: "Indented config",
      description: "Demonstrates indentation preservation.",
      code: 'route {\n    t_on_failure("retry");\n    t_relay();\n}',
    };
    const out = renderConfigExample(example);
    expect(out).toContain(
      '```opensips\nroute {\n    t_on_failure("retry");\n    t_relay();\n}\n```\n',
    );
  });
});
