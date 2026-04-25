import { describe, it, expect } from "vitest";
import { renderFunction } from "../../../../scripts/render-module/elements/function.js";
import type { ModuleFunction } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Build a minimal valid {@link ModuleFunction} carrying only the schema-required
 * fields. Tests can spread this and override individual properties.
 *
 * @returns A fresh minimal ModuleFunction object.
 */
const minimalFn = (): ModuleFunction => ({
  name: "t_relay",
  signature: "t_relay()",
  parameters: [],
  return_type: "integer",
  description: "Forwards the current request to the destination URI in a stateful manner.",
  usage_context: [],
  examples: [],
});

describe("renderFunction — minimal", () => {
  it("renders only H3 + description for a function with no optional content", () => {
    expect(renderFunction(minimalFn())).toMatchInlineSnapshot(`
      "### \`t_relay()\`

      Forwards the current request to the destination URI in a stateful manner.

      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderFunction(minimalFn());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n\n")).toBe(false);
  });
});

describe("renderFunction — maximal", () => {
  it("renders every section in spec order with multiple items", () => {
    const fn: ModuleFunction = {
      name: "t_relay",
      signature: "t_relay([flags], [outbound_proxy])",
      description: "Forwards the current request to the destination URI in a stateful manner.",
      return_type: "integer",
      parameters: [
        {
          name: "outbound_proxy",
          type: "string",
          required: false,
          description: "explicit next-hop URI",
        },
        {
          name: "flags",
          type: "string",
          required: false,
          description: "comma-separated list of behavior flags",
          valid_values: ["no-auto-477", "no-dns-failover"],
        },
      ],
      return_values: [
        { value: "1", condition: "request forwarded successfully" },
        { value: "-1", condition: "generic internal error" },
      ],
      usage_context: ["REQUEST_ROUTE", "FAILURE_ROUTE"],
      related_functions: ["t_replicate", "t_relay_to_proto"],
      examples: [
        {
          language: "opensips",
          code: "if (!t_relay()) { sl_reply_error(); exit; }",
          description: "Relay a request and handle failures",
        },
        {
          language: "opensips",
          code: 't_relay("no-auto-477");',
          description: "Disable automatic 477 generation",
        },
      ],
    };

    expect(renderFunction(fn)).toMatchInlineSnapshot(`
      "### \`t_relay([flags], [outbound_proxy])\`

      Forwards the current request to the destination URI in a stateful manner.

      **Parameters:**

      - \`flags\` *(string, optional)* — comma-separated list of behavior flags
        - \`no-auto-477\`
        - \`no-dns-failover\`
      - \`outbound_proxy\` *(string, optional)* — explicit next-hop URI

      **Return codes:**

      - \`1\` — request forwarded successfully
      - \`-1\` — generic internal error

      **Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

      **Related:**

      - \`t_relay_to_proto\`
      - \`t_replicate\`

      **Example.** Relay a request and handle failures.

      \`\`\`opensips
      if (!t_relay()) { sl_reply_error(); exit; }
      \`\`\`

      **Example.** Disable automatic 477 generation.

      \`\`\`opensips
      t_relay(\"no-auto-477\");
      \`\`\`

      "
    `);
  });
});

describe("renderFunction — headingLevel=2", () => {
  it("uses an H2 heading instead of H3 when reused by core renderers", () => {
    const out = renderFunction(minimalFn(), 2);
    expect(out.startsWith("## `t_relay()`\n")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });
});

describe("renderFunction — deprecated", () => {
  it("prepends a > **Deprecated.** blockquote line before the description", () => {
    const fn: ModuleFunction = { ...minimalFn(), deprecated: true };
    expect(renderFunction(fn)).toMatchInlineSnapshot(`
      "### \`t_relay()\`

      > **Deprecated.**

      Forwards the current request to the destination URI in a stateful manner.

      "
    `);
  });

  it("does not emit the blockquote when deprecated is false", () => {
    const fn: ModuleFunction = { ...minimalFn(), deprecated: false };
    expect(renderFunction(fn)).not.toContain("Deprecated");
  });
});

describe("renderFunction — valid_values sub-bullets", () => {
  it("renders sub-bullets under the parameter when valid_values is non-empty", () => {
    const fn: ModuleFunction = {
      ...minimalFn(),
      parameters: [
        {
          name: "mode",
          type: "string",
          required: true,
          description: "operating mode",
          valid_values: ["strict", "lax"],
        },
      ],
    };

    const out = renderFunction(fn);
    expect(out).toContain("- `mode` *(string, required)* — operating mode\n");
    expect(out).toContain("  - `strict`\n");
    expect(out).toContain("  - `lax`\n");
  });

  it("omits sub-bullets when valid_values is undefined or empty", () => {
    const fn: ModuleFunction = {
      ...minimalFn(),
      parameters: [
        {
          name: "mode",
          type: "string",
          required: true,
          description: "operating mode",
          valid_values: [],
        },
      ],
    };
    const out = renderFunction(fn);
    expect(out).toContain("- `mode` *(string, required)* — operating mode\n");
    expect(out).not.toMatch(/^ {2}- /m);
  });
});

describe("renderFunction — examples handling", () => {
  it("omits the example section entirely when examples array is empty", () => {
    const out = renderFunction(minimalFn());
    expect(out).not.toContain("**Example.**");
    expect(out).not.toContain("```");
  });

  it("falls back to the opensips fence tag when example.language is empty", () => {
    const fn: ModuleFunction = {
      ...minimalFn(),
      examples: [
        {
          language: "",
          code: "x = 1;",
          description: "simple assignment",
        },
      ],
    };
    const out = renderFunction(fn);
    expect(out).toContain("```opensips\nx = 1;\n```\n");
  });

  it("respects a non-default example.language tag (e.g. bash)", () => {
    const fn: ModuleFunction = {
      ...minimalFn(),
      examples: [
        {
          language: "bash",
          code: "echo hi",
          description: "shell example",
        },
      ],
    };
    const out = renderFunction(fn);
    expect(out).toContain("```bash\necho hi\n```\n");
  });
});

describe("renderFunction — sorting", () => {
  it("sorts parameters alphabetically by name", () => {
    const fn: ModuleFunction = {
      ...minimalFn(),
      parameters: [
        { name: "zulu", type: "string", required: true, description: "z" },
        { name: "alpha", type: "string", required: true, description: "a" },
        { name: "mike", type: "string", required: true, description: "m" },
      ],
    };
    const out = renderFunction(fn);
    const idxA = out.indexOf("`alpha`");
    const idxM = out.indexOf("`mike`");
    const idxZ = out.indexOf("`zulu`");
    expect(idxA).toBeGreaterThan(-1);
    expect(idxA).toBeLessThan(idxM);
    expect(idxM).toBeLessThan(idxZ);
  });

  it("sorts related_functions alphabetically by name", () => {
    const fn: ModuleFunction = {
      ...minimalFn(),
      related_functions: ["t_zulu", "t_alpha", "t_mike"],
    };
    const out = renderFunction(fn);
    const idxA = out.indexOf("`t_alpha`");
    const idxM = out.indexOf("`t_mike`");
    const idxZ = out.indexOf("`t_zulu`");
    expect(idxA).toBeLessThan(idxM);
    expect(idxM).toBeLessThan(idxZ);
  });
});
