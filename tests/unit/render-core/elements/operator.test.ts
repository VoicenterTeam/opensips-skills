import { describe, it, expect } from "vitest";
import type { z } from "zod";
import { renderOperator } from "../../../../scripts/render-core/elements/operator.js";
import type { OperatorDocumentSchema } from "../../../../scripts/schemas/core/operators.schema.js";

type Operator = z.infer<typeof OperatorDocumentSchema>["operators"][number];

/**
 * Build a minimal {@link Operator} value: every schema-required field is set,
 * with single-element `applicable_to` and a single example. Tests can spread
 * this and override fields to keep individual cases short.
 *
 * Note: the {@link Operator} schema marks every field as required, so the
 * "minimal" case still has one example. The "no examples" case tests an
 * empty `examples` array, which the schema permits.
 *
 * @returns A fresh Operator with required fields populated.
 */
const minimal = (): Operator => ({
  symbol: "+",
  name: "Addition",
  category: "arithmetic",
  operand_type: "binary",
  description: "Standard addition operator. Coerces operands as needed.",
  applicable_to: ["integer", "string"],
  precedence: 12,
  associativity: "left",
  examples: [
    {
      language: "opensips",
      code: "$var(a) = 4 + 7;",
      description: "Add two numbers",
    },
  ],
});

describe("renderOperator — minimal input (one example)", () => {
  it("renders heading, prose, property list, and one example block", () => {
    expect(renderOperator(minimal())).toMatchInlineSnapshot(`
      "## \`+\` (Addition)

      Standard addition operator. Coerces operands as needed.

      - **Operand type:** binary
      - **Applicable to:** integer, string
      - **Precedence:** 12
      - **Associativity:** left

      **Example.** Add two numbers.

      \`\`\`opensips
      $var(a) = 4 + 7;
      \`\`\`
      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderOperator(minimal());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("uses H2 by default (per §3.2.3 core aggregated rendering)", () => {
    const out = renderOperator(minimal());
    expect(out.startsWith("## ")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });
});

describe("renderOperator — heading level", () => {
  it("uses H3 when headingLevel=3 is passed", () => {
    const out = renderOperator(minimal(), 3);
    expect(out.startsWith("### ")).toBe(true);
    expect(out.startsWith("## `")).toBe(false);
  });

  it("renders heading as `symbol` (name) regardless of level", () => {
    expect(renderOperator(minimal(), 3)).toMatchInlineSnapshot(`
      "### \`+\` (Addition)

      Standard addition operator. Coerces operands as needed.

      - **Operand type:** binary
      - **Applicable to:** integer, string
      - **Precedence:** 12
      - **Associativity:** left

      **Example.** Add two numbers.

      \`\`\`opensips
      $var(a) = 4 + 7;
      \`\`\`
      "
    `);
  });
});

describe("renderOperator — symbol normalization", () => {
  it("strips leading and trailing whitespace from the symbol in the heading", () => {
    const op: Operator = { ...minimal(), symbol: " =", name: "Assignment" };
    const out = renderOperator(op);
    expect(out.startsWith("## `=` (Assignment)\n")).toBe(true);
    expect(out).not.toMatch(/`\s=`/);
    expect(out).not.toMatch(/`= `/);
  });

  it("trims symbols with surrounding whitespace on both sides", () => {
    const op: Operator = { ...minimal(), symbol: "  +  " };
    const out = renderOperator(op);
    expect(out.startsWith("## `+` (Addition)\n")).toBe(true);
  });
});

describe("renderOperator — property list", () => {
  it("emits all four properties in the documented order", () => {
    const out = renderOperator(minimal());
    const operandIdx = out.indexOf("**Operand type:**");
    const applicableIdx = out.indexOf("**Applicable to:**");
    const precedenceIdx = out.indexOf("**Precedence:**");
    const associativityIdx = out.indexOf("**Associativity:**");
    expect(operandIdx).toBeGreaterThan(-1);
    expect(applicableIdx).toBeGreaterThan(operandIdx);
    expect(precedenceIdx).toBeGreaterThan(applicableIdx);
    expect(associativityIdx).toBeGreaterThan(precedenceIdx);
  });

  it("comma-joins applicable_to values", () => {
    const out = renderOperator({
      ...minimal(),
      applicable_to: ["integer", "string", "null"],
    });
    expect(out).toMatch(/\*\*Applicable to:\*\* integer, string, null\n/);
  });

  it("renders a single applicable_to value without a trailing comma", () => {
    const out = renderOperator({ ...minimal(), applicable_to: ["integer"] });
    expect(out).toMatch(/\*\*Applicable to:\*\* integer\n/);
  });

  it("renders precedence as a number value", () => {
    const out = renderOperator({ ...minimal(), precedence: 7 });
    expect(out).toMatch(/\*\*Precedence:\*\* 7\n/);
  });

  it("renders associativity right when so specified", () => {
    const out = renderOperator({ ...minimal(), associativity: "right" });
    expect(out).toMatch(/\*\*Associativity:\*\* right\n/);
  });

  it("renders unary operand_type when so specified", () => {
    const out = renderOperator({ ...minimal(), operand_type: "unary" });
    expect(out).toMatch(/\*\*Operand type:\*\* unary\n/);
  });
});

describe("renderOperator — examples handling", () => {
  it("renders multiple examples in source order, each with its own caption and fence", () => {
    const op: Operator = {
      ...minimal(),
      examples: [
        {
          language: "opensips",
          code: "$var(a) = 4 + 7;",
          description: "Add two numbers",
        },
        {
          language: "opensips",
          code: '$var(s) = "foo" + "bar";',
          description: "Concatenate two strings",
        },
      ],
    };

    expect(renderOperator(op)).toMatchInlineSnapshot(`
      "## \`+\` (Addition)

      Standard addition operator. Coerces operands as needed.

      - **Operand type:** binary
      - **Applicable to:** integer, string
      - **Precedence:** 12
      - **Associativity:** left

      **Example.** Add two numbers.

      \`\`\`opensips
      $var(a) = 4 + 7;
      \`\`\`

      **Example.** Concatenate two strings.

      \`\`\`opensips
      $var(s) = \"foo\" + \"bar\";
      \`\`\`
      "
    `);
  });

  it("uses the example's language field for the fence tag", () => {
    const out = renderOperator({
      ...minimal(),
      examples: [
        {
          language: "bash",
          code: "echo hi",
          description: "Run a shell command",
        },
      ],
    });
    expect(out).toMatch(/```bash\n/);
  });

  it("defaults the fence tag to opensips when language is empty", () => {
    const out = renderOperator({
      ...minimal(),
      examples: [
        {
          language: "",
          code: "$var(a) = 1 + 2;",
          description: "Add",
        },
      ],
    });
    expect(out).toMatch(/```opensips\n/);
  });

  it("emits a bare **Example.** caption when an example's description is empty", () => {
    const out = renderOperator({
      ...minimal(),
      examples: [
        {
          language: "opensips",
          code: "$var(a) = 1 + 2;",
          description: "",
        },
      ],
    });
    expect(out).toMatch(/\*\*Example\.\*\*\n\n```/);
    expect(out).not.toMatch(/\*\*Example\.\*\* \./);
  });

  it("omits the example block entirely when examples is empty", () => {
    const out = renderOperator({ ...minimal(), examples: [] });
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });
});
