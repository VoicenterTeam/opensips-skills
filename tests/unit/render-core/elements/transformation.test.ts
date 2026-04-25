import { describe, it, expect } from "vitest";
import { renderTransformation } from "../../../../scripts/render-core/elements/transformation.js";
import type { z } from "zod";
import type { TransformationDocumentSchema } from "../../../../scripts/schemas/core/transformations.schema.js";

type Transformation = z.infer<typeof TransformationDocumentSchema>["transformations"][number];

/**
 * Build a minimal valid {@link Transformation} carrying only the schema-required
 * fields with empty arrays where allowed. Tests can spread this and override
 * individual properties.
 *
 * @returns A fresh minimal Transformation object.
 */
function minimalTrans(overrides: Partial<Transformation> = {}): Transformation {
  return {
    name: "s.len",
    class: "string",
    description: "Returns the length of a string in characters.",
    syntax: "$variable.s.len",
    parameters: [],
    input_type: "string",
    output_type: "integer",
    examples: [],
    chainable: true,
    ...overrides,
  };
}

describe("renderTransformation — minimal", () => {
  const out = renderTransformation(minimalTrans());

  it("starts with an H2 heading containing the backticked transformation name", () => {
    expect(out.startsWith("## `s.len`\n")).toBe(true);
  });

  it("includes the description prose on its own line", () => {
    expect(out).toContain("Returns the length of a string in characters.");
  });

  it("emits the property list in the canonical order: Class, Input, Output, Chainable", () => {
    const classIdx = out.indexOf("- **Class:** string");
    const inputIdx = out.indexOf("- **Input:** string");
    const outputIdx = out.indexOf("- **Output:** integer");
    const chainIdx = out.indexOf("- **Chainable:** yes");
    expect(classIdx).toBeGreaterThan(-1);
    expect(inputIdx).toBeGreaterThan(-1);
    expect(outputIdx).toBeGreaterThan(-1);
    expect(chainIdx).toBeGreaterThan(-1);
    expect(classIdx).toBeLessThan(inputIdx);
    expect(inputIdx).toBeLessThan(outputIdx);
    expect(outputIdx).toBeLessThan(chainIdx);
  });

  it("emits an untagged code fence for the Syntax block", () => {
    expect(out).toContain("**Syntax:**");
    // Untagged fence: triple backticks immediately followed by newline.
    expect(out).toContain("```\n$variable.s.len\n```\n");
  });

  it("does not emit a Parameters block when parameters array is empty", () => {
    expect(out).not.toContain("**Parameters:**");
  });

  it("does not emit any example block when examples are empty", () => {
    expect(out).not.toContain("**Example.**");
    expect(out).not.toContain("```opensips");
  });

  it("ends with a trailing newline (block contract)", () => {
    expect(out.endsWith("\n")).toBe(true);
  });
});

describe("renderTransformation — chainable rendering", () => {
  it("renders chainable=true as 'yes'", () => {
    const out = renderTransformation(minimalTrans({ chainable: true }));
    expect(out).toContain("- **Chainable:** yes\n");
    expect(out).not.toContain("- **Chainable:** no\n");
  });

  it("renders chainable=false as 'no'", () => {
    const out = renderTransformation(minimalTrans({ chainable: false }));
    expect(out).toContain("- **Chainable:** no\n");
    expect(out).not.toContain("- **Chainable:** yes\n");
  });
});

describe("renderTransformation — parameters", () => {
  it("emits a Parameters block when parameters array is non-empty", () => {
    const out = renderTransformation(
      minimalTrans({
        parameters: [
          {
            name: "count",
            type: "integer",
            required: true,
            description: "number of characters",
          },
        ],
      }),
    );
    expect(out).toContain("**Parameters:**");
    expect(out).toContain("- `count` *(integer, required)* — number of characters\n");
  });

  it("renders required=false as 'optional'", () => {
    const out = renderTransformation(
      minimalTrans({
        parameters: [
          {
            name: "sep",
            type: "string",
            required: false,
            description: "field separator",
          },
        ],
      }),
    );
    expect(out).toContain("- `sep` *(string, optional)* — field separator\n");
  });

  it("sorts parameters alphabetically by name", () => {
    const out = renderTransformation(
      minimalTrans({
        parameters: [
          { name: "zulu", type: "string", required: true, description: "z" },
          { name: "alpha", type: "string", required: true, description: "a" },
          { name: "mike", type: "string", required: true, description: "m" },
        ],
      }),
    );
    const idxA = out.indexOf("`alpha`");
    const idxM = out.indexOf("`mike`");
    const idxZ = out.indexOf("`zulu`");
    expect(idxA).toBeGreaterThan(-1);
    expect(idxA).toBeLessThan(idxM);
    expect(idxM).toBeLessThan(idxZ);
  });
});

describe("renderTransformation — examples", () => {
  it("renders a single example as a bold-captioned, opensips-fenced block", () => {
    const out = renderTransformation(
      minimalTrans({
        examples: [
          {
            language: "opensips",
            code: "$var(n) = $ru.s.len;",
            description: "Get the length of a Request-URI",
          },
        ],
      }),
    );
    expect(out).toContain("**Example.** Get the length of a Request-URI.");
    expect(out).toContain("```opensips\n$var(n) = $ru.s.len;\n```\n");
  });

  it("falls back to the opensips fence tag when example.language is empty", () => {
    const out = renderTransformation(
      minimalTrans({
        examples: [{ language: "", code: "x = 1;", description: "simple" }],
      }),
    );
    expect(out).toContain("```opensips\nx = 1;\n```\n");
  });

  it("respects a non-default example.language tag (e.g. bash)", () => {
    const out = renderTransformation(
      minimalTrans({
        examples: [{ language: "bash", code: "echo hi", description: "shell" }],
      }),
    );
    expect(out).toContain("```bash\necho hi\n```\n");
  });

  it("renders multiple examples in source order", () => {
    const out = renderTransformation(
      minimalTrans({
        examples: [
          { language: "opensips", code: "first;", description: "first one" },
          { language: "opensips", code: "second;", description: "second one" },
        ],
      }),
    );
    const firstIdx = out.indexOf("first one");
    const secondIdx = out.indexOf("second one");
    expect(firstIdx).toBeGreaterThan(-1);
    expect(secondIdx).toBeGreaterThan(-1);
    expect(firstIdx).toBeLessThan(secondIdx);
  });
});

describe("renderTransformation — headingLevel=3", () => {
  it("uses an H3 heading instead of an H2 when invoked with level 3", () => {
    const out = renderTransformation(minimalTrans(), 3);
    expect(out.startsWith("### `s.len`\n")).toBe(true);
    expect(out.startsWith("## ")).toBe(false);
  });

  it("defaults to H2 when no heading level is supplied", () => {
    const out = renderTransformation(minimalTrans());
    expect(out.startsWith("## `s.len`\n")).toBe(true);
  });
});

describe("renderTransformation — maximal", () => {
  it("renders every section in spec order with multiple items", () => {
    const trans: Transformation = {
      name: "s.substr",
      class: "string",
      description: "Extracts a substring from the input string.",
      syntax: "$variable.s.substr(offset, length)",
      parameters: [
        {
          name: "offset",
          type: "integer",
          required: true,
          description: "starting position",
        },
        {
          name: "length",
          type: "integer",
          required: false,
          description: "number of characters to extract",
        },
      ],
      input_type: "string",
      output_type: "string",
      examples: [
        {
          language: "opensips",
          code: "$var(s) = $ru.s.substr(0, 5);",
          description: "Extract the first five characters",
        },
      ],
      chainable: true,
    };

    expect(renderTransformation(trans)).toMatchInlineSnapshot(`
      "## \`s.substr\`

      Extracts a substring from the input string.

      - **Class:** string
      - **Input:** string
      - **Output:** string
      - **Chainable:** yes

      **Syntax:**

      \`\`\`
      $variable.s.substr(offset, length)
      \`\`\`

      **Parameters:**

      - \`length\` *(integer, optional)* — number of characters to extract
      - \`offset\` *(integer, required)* — starting position

      **Example.** Extract the first five characters.

      \`\`\`opensips
      $var(s) = $ru.s.substr(0, 5);
      \`\`\`

      "
    `);
  });
});
