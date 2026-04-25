import { describe, it, expect } from "vitest";
import { renderParameter } from "../../../../scripts/render-module/elements/parameter.js";
import type { ModuleParameter } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Build a minimal {@link ModuleParameter} value: only the three required
 * schema fields (`name`, `type`, `description`) are populated. Tests can
 * spread this and override fields to keep individual cases short.
 *
 * @returns A fresh ModuleParameter with only required fields set.
 */
const minimal = (): ModuleParameter => ({
  name: "fr_timeout",
  type: "integer",
  description: "Timeout which is triggered if no final reply arrives.",
});

describe("renderParameter — minimal input (only required fields)", () => {
  it("renders an H3 heading, prose, and nothing else", () => {
    expect(renderParameter(minimal())).toMatchInlineSnapshot(`
      "### \`fr_timeout\` (integer)

      Timeout which is triggered if no final reply arrives.
      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderParameter(minimal());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("does not emit a default-value line when default_value is undefined", () => {
    const out = renderParameter(minimal());
    expect(out).not.toMatch(/Default value/);
  });

  it("does not emit a Possible values block when the field is absent", () => {
    const out = renderParameter(minimal());
    expect(out).not.toMatch(/Possible values/);
  });

  it("does not emit a Valid range line when range is absent", () => {
    const out = renderParameter(minimal());
    expect(out).not.toMatch(/Valid range/);
  });

  it("does not emit a Notes line when notes is absent", () => {
    const out = renderParameter(minimal());
    expect(out).not.toMatch(/\*\*Notes:\*\*/);
  });

  it("does not emit an Example block when example_code is absent", () => {
    const out = renderParameter(minimal());
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });
});

describe("renderParameter — heading level", () => {
  it("uses H3 by default (per §3.1.4 module rendering)", () => {
    const out = renderParameter(minimal());
    expect(out.startsWith("### ")).toBe(true);
  });

  it("uses H2 when headingLevel=2 is passed (core type aggregation)", () => {
    const out = renderParameter(minimal(), 2);
    expect(out.startsWith("## ")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });

  it("renders the heading line as `name` (type) regardless of level", () => {
    expect(renderParameter(minimal(), 2)).toMatchInlineSnapshot(`
      "## \`fr_timeout\` (integer)

      Timeout which is triggered if no final reply arrives.
      "
    `);
  });
});

describe("renderParameter — maximal input (every optional field set)", () => {
  it("renders all blocks in the documented order", () => {
    const param: ModuleParameter = {
      name: "fr_timeout",
      type: "integer",
      default_value: "30 seconds",
      description: "Timeout which is triggered if no final reply arrives.",
      possible_values: ["1 to 3600 seconds"],
      valid_range_min: 1,
      valid_range_max: 3600,
      example_value: "Set the parameter to 10",
      example_code: 'modparam("tm", "fr_timeout", 10)',
      notes: "Setting this too low causes spurious failures.",
    };

    expect(renderParameter(param)).toMatchInlineSnapshot(`
      "### \`fr_timeout\` (integer)

      Timeout which is triggered if no final reply arrives.

      *Default value is 30 seconds.*

      **Possible values:**

      - 1 to 3600 seconds

      *Valid range: 1 to 3600.*

      **Notes:** Setting this too low causes spurious failures.

      **Example.** Set the parameter to 10.

      \`\`\`opensips
      modparam(\"tm\", \"fr_timeout\", 10)
      \`\`\`
      "
    `);
  });
});

describe("renderParameter — default_value handling", () => {
  it("renders a *Default value is …* line when default_value is set", () => {
    const out = renderParameter({ ...minimal(), default_value: "30 seconds" });
    expect(out).toMatch(/\*Default value is 30 seconds\.\*/);
  });

  it("omits the default-value line when default_value is undefined", () => {
    const out = renderParameter({ ...minimal(), default_value: undefined });
    expect(out).not.toMatch(/Default value/);
  });

  it("omits the default-value line when default_value is the empty string", () => {
    const out = renderParameter({ ...minimal(), default_value: "" });
    expect(out).not.toMatch(/Default value/);
  });
});

describe("renderParameter — possible_values handling", () => {
  it("renders the Possible values block when the array is non-empty", () => {
    const out = renderParameter({
      ...minimal(),
      possible_values: ["alpha", "beta"],
    });
    expect(out).toMatch(/\*\*Possible values:\*\*/);
    expect(out).toMatch(/- alpha/);
    expect(out).toMatch(/- beta/);
  });

  it("omits the Possible values block for an empty array", () => {
    const out = renderParameter({ ...minimal(), possible_values: [] });
    expect(out).not.toMatch(/Possible values/);
  });
});

describe("renderParameter — valid range handling", () => {
  it("renders both bounds when min and max are set", () => {
    const out = renderParameter({
      ...minimal(),
      valid_range_min: 1,
      valid_range_max: 3600,
    });
    expect(out).toMatch(/\*Valid range: 1 to 3600\.\*/);
  });

  it("renders min-only as 'N or above' when only valid_range_min is set", () => {
    const out = renderParameter({ ...minimal(), valid_range_min: 1 });
    expect(out).toMatch(/\*Valid range: 1 or above\.\*/);
  });

  it("renders max-only as 'up to N' when only valid_range_max is set", () => {
    const out = renderParameter({ ...minimal(), valid_range_max: 3600 });
    expect(out).toMatch(/\*Valid range: up to 3600\.\*/);
  });

  it("omits the Valid range line when neither bound is set", () => {
    const out = renderParameter(minimal());
    expect(out).not.toMatch(/Valid range/);
  });
});

describe("renderParameter — notes handling", () => {
  it("renders **Notes:** prefix when notes is set", () => {
    const out = renderParameter({ ...minimal(), notes: "Be careful." });
    expect(out).toMatch(/\*\*Notes:\*\* Be careful\./);
  });

  it("omits the Notes line when notes is undefined", () => {
    const out = renderParameter({ ...minimal(), notes: undefined });
    expect(out).not.toMatch(/\*\*Notes:\*\*/);
  });

  it("omits the Notes line when notes is the empty string", () => {
    const out = renderParameter({ ...minimal(), notes: "" });
    expect(out).not.toMatch(/\*\*Notes:\*\*/);
  });
});

describe("renderParameter — example handling", () => {
  it("renders an opensips-fenced code block when example_code is set", () => {
    const out = renderParameter({
      ...minimal(),
      example_code: 'modparam("tm", "fr_timeout", 10)',
    });
    expect(out).toMatch(/\*\*Example\.\*\*/);
    expect(out).toMatch(/```opensips\n/);
    expect(out).toMatch(/modparam\("tm", "fr_timeout", 10\)/);
    expect(out).toMatch(/\n```/);
  });

  it("uses example_value as the caption when set", () => {
    const out = renderParameter({
      ...minimal(),
      example_code: 'modparam("tm", "fr_timeout", 10)',
      example_value: "Reduce the final-reply timeout",
    });
    expect(out).toMatch(/\*\*Example\.\*\* Reduce the final-reply timeout\./);
  });

  it("falls back to a generic caption when example_value is absent", () => {
    const out = renderParameter({
      ...minimal(),
      example_code: 'modparam("tm", "fr_timeout", 10)',
    });
    expect(out).toMatch(/\*\*Example\.\*\* Set the `fr_timeout` parameter\./);
  });

  it("omits the example block entirely when example_code is undefined", () => {
    const out = renderParameter({ ...minimal(), example_code: undefined });
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });

  it("omits the example block when example_code is the empty string", () => {
    const out = renderParameter({ ...minimal(), example_code: "" });
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });
});

describe("renderParameter — string type and complex name", () => {
  it("renders the type verbatim, even for non-integer types", () => {
    const out = renderParameter({
      name: "db_url",
      type: "string",
      description: "Database connection URL.",
    });
    expect(out.startsWith("### `db_url` (string)\n")).toBe(true);
  });
});
