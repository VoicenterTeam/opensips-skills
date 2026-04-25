import { describe, it, expect } from "vitest";
import type { z } from "zod";
import { renderStatement } from "../../../../scripts/render-core/elements/statement.js";
import type { StatementDocumentSchema } from "../../../../scripts/schemas/core/statements.schema.js";

type Statement = z.infer<typeof StatementDocumentSchema>["statements"][number];

/**
 * Build a minimal valid {@link Statement} carrying only the schema-required
 * fields. Tests can spread this and override individual properties.
 *
 * @returns A fresh minimal Statement object.
 */
const minimalStmt = (): Statement => ({
  name: "if",
  syntax: "if (expr) { ... }",
  description: "Conditional statement. Executes the body when the expression is truthy.",
  parameters: [],
  usage_context: [],
  examples: [],
});

describe("renderStatement — minimal", () => {
  it("renders heading + description + syntax block when only required fields are present", () => {
    expect(renderStatement(minimalStmt())).toMatchInlineSnapshot(`
      "## \`if\`

      Conditional statement. Executes the body when the expression is truthy.

      **Syntax:**

      \`\`\`
      if (expr) { ... }
      \`\`\`

      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderStatement(minimalStmt());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n\n")).toBe(false);
  });
});

describe("renderStatement — maximal", () => {
  it("renders every section in spec order", () => {
    const stmt: Statement = {
      name: "if",
      syntax: "if (expr) { ... } [ else { ... } ]",
      description: "Conditional statement. Executes the body when the expression is truthy.",
      parameters: [
        {
          name: "expr",
          type: "boolean",
          required: true,
          description: "the condition expression",
        },
      ],
      usage_context: ["REQUEST_ROUTE", "BRANCH_ROUTE"],
      examples: [
        {
          language: "opensips",
          code: 'if (is_method("INVITE")) { t_relay(); }',
          description: "Match on a method",
        },
      ],
      related_statements: ["switch", "while"],
    };

    expect(renderStatement(stmt)).toMatchInlineSnapshot(`
      "## \`if\`

      Conditional statement. Executes the body when the expression is truthy.

      **Syntax:**

      \`\`\`
      if (expr) { ... } [ else { ... } ]
      \`\`\`

      **Parameters:**

      - \`expr\` *(boolean, required)* — the condition expression

      **Usable from:** REQUEST_ROUTE, BRANCH_ROUTE

      **Related:**

      - \`switch\`
      - \`while\`

      **Example.** Match on a method.

      \`\`\`opensips
      if (is_method(\"INVITE\")) { t_relay(); }
      \`\`\`

      "
    `);
  });
});

describe("renderStatement — headingLevel=3", () => {
  it("uses an H3 heading instead of H2 when reused at a deeper level", () => {
    const out = renderStatement(minimalStmt(), 3);
    expect(out.startsWith("### `if`\n")).toBe(true);
    expect(out.startsWith("## ")).toBe(false);
  });
});

describe("renderStatement — syntax always present", () => {
  it("always emits the **Syntax:** label and an UNTAGGED fenced block", () => {
    const out = renderStatement(minimalStmt());
    expect(out).toContain("**Syntax:**\n\n```\nif (expr) { ... }\n```\n");
  });

  it("uses an untagged fence even when the syntax string is multi-line", () => {
    const stmt: Statement = {
      ...minimalStmt(),
      syntax: "if (expr) {\n    statements\n} else {\n    statements\n}",
    };
    const out = renderStatement(stmt);
    expect(out).toContain(
      "**Syntax:**\n\n```\nif (expr) {\n    statements\n} else {\n    statements\n}\n```\n",
    );
    expect(out).not.toContain("```opensips\nif (expr)");
  });
});

describe("renderStatement — parameters conditional", () => {
  it("omits the **Parameters:** section entirely when parameters is empty", () => {
    const out = renderStatement(minimalStmt());
    expect(out).not.toContain("**Parameters:**");
  });

  it("renders required and optional parameters with the canonical bullet format", () => {
    const stmt: Statement = {
      ...minimalStmt(),
      parameters: [
        {
          name: "expr",
          type: "boolean",
          required: true,
          description: "the condition expression",
        },
        {
          name: "label",
          type: "string",
          required: false,
          description: "an optional label",
        },
      ],
    };
    const out = renderStatement(stmt);
    expect(out).toContain("- `expr` *(boolean, required)* — the condition expression\n");
    expect(out).toContain("- `label` *(string, optional)* — an optional label\n");
  });

  it("sorts parameters alphabetically by name", () => {
    const stmt: Statement = {
      ...minimalStmt(),
      parameters: [
        { name: "zulu", type: "string", required: true, description: "z" },
        { name: "alpha", type: "string", required: true, description: "a" },
        { name: "mike", type: "string", required: true, description: "m" },
      ],
    };
    const out = renderStatement(stmt);
    const idxA = out.indexOf("`alpha`");
    const idxM = out.indexOf("`mike`");
    const idxZ = out.indexOf("`zulu`");
    expect(idxA).toBeGreaterThan(-1);
    expect(idxA).toBeLessThan(idxM);
    expect(idxM).toBeLessThan(idxZ);
  });
});

describe("renderStatement — usage_context conditional", () => {
  it("omits **Usable from:** when usage_context is empty", () => {
    const out = renderStatement(minimalStmt());
    expect(out).not.toContain("**Usable from:**");
  });

  it("emits a single comma-separated **Usable from:** line when non-empty", () => {
    const stmt: Statement = {
      ...minimalStmt(),
      usage_context: ["REQUEST_ROUTE", "BRANCH_ROUTE", "FAILURE_ROUTE"],
    };
    const out = renderStatement(stmt);
    expect(out).toContain("**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE\n");
  });
});

describe("renderStatement — related_statements conditional", () => {
  it("omits **Related:** when related_statements is undefined", () => {
    const out = renderStatement(minimalStmt());
    expect(out).not.toContain("**Related:**");
  });

  it("omits **Related:** when related_statements is an empty array", () => {
    const stmt: Statement = { ...minimalStmt(), related_statements: [] };
    const out = renderStatement(stmt);
    expect(out).not.toContain("**Related:**");
  });

  it("renders related_statements as a backticked bulleted list", () => {
    const stmt: Statement = {
      ...minimalStmt(),
      related_statements: ["switch", "while"],
    };
    const out = renderStatement(stmt);
    expect(out).toContain("**Related:**\n\n- `switch`\n- `while`\n");
  });
});

describe("renderStatement — examples handling", () => {
  it("omits any example output when examples is empty", () => {
    const out = renderStatement(minimalStmt());
    expect(out).not.toContain("**Example.**");
  });

  it("uses the example.language fence tag when set", () => {
    const stmt: Statement = {
      ...minimalStmt(),
      examples: [
        {
          language: "bash",
          code: "echo hi",
          description: "shell example",
        },
      ],
    };
    const out = renderStatement(stmt);
    expect(out).toContain("```bash\necho hi\n```\n");
  });

  it("falls back to the opensips fence tag when example.language is empty", () => {
    const stmt: Statement = {
      ...minimalStmt(),
      examples: [
        {
          language: "",
          code: "x = 1;",
          description: "simple assignment",
        },
      ],
    };
    const out = renderStatement(stmt);
    expect(out).toContain("```opensips\nx = 1;\n```\n");
  });
});
