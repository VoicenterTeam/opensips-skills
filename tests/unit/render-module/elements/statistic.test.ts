import { describe, it, expect } from "vitest";
import { renderStatistic } from "../../../../scripts/render-module/elements/statistic.js";
import type { Statistic } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Build a minimal {@link Statistic} value: only the two required schema
 * fields (`name`, `description`) are populated. Tests can spread this and
 * override fields to keep individual cases short.
 *
 * @returns A fresh Statistic with only required fields set.
 */
const minimal = (): Statistic => ({
  name: "tm:received_replies",
  description: "Counter of all SIP replies received by the tm module.",
});

describe("renderStatistic — minimal input (only required fields)", () => {
  it("renders an H3 heading, prose, and nothing else", () => {
    expect(renderStatistic(minimal())).toMatchInlineSnapshot(`
      "### \`tm:received_replies\`

      Counter of all SIP replies received by the tm module.
      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderStatistic(minimal());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("emits no property list when type/reset/access are all absent", () => {
    const out = renderStatistic(minimal());
    expect(out).not.toMatch(/\*\*Type:\*\*/);
    expect(out).not.toMatch(/\*\*Reset:\*\*/);
    expect(out).not.toMatch(/\*\*Access:\*\*/);
  });

  it("never emits an Example block (statistics are observed, not invoked)", () => {
    const out = renderStatistic(minimal());
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });
});

describe("renderStatistic — heading level", () => {
  it("uses H3 by default (per §3.1.8 module rendering)", () => {
    const out = renderStatistic(minimal());
    expect(out.startsWith("### ")).toBe(true);
  });

  it("uses H2 when headingLevel=2 is passed (M4 core reuse)", () => {
    const out = renderStatistic(minimal(), 2);
    expect(out.startsWith("## ")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });

  it("backticks the statistic name regardless of heading level", () => {
    expect(renderStatistic(minimal(), 2)).toMatchInlineSnapshot(`
      "## \`tm:received_replies\`

      Counter of all SIP replies received by the tm module.
      "
    `);
  });
});

describe("renderStatistic — maximal input (every optional field set)", () => {
  it("renders heading, prose, and a 3-bullet property list in fixed order", () => {
    const stat: Statistic = {
      name: "tm:received_replies",
      type: "counter",
      description: "Counter of all SIP replies received by the tm module.",
      access_methods: ["mi", "prometheus"],
      reset_method: "via `mi statistics_reset tm:received_replies`",
    };

    expect(renderStatistic(stat)).toMatchInlineSnapshot(`
      "### \`tm:received_replies\`

      Counter of all SIP replies received by the tm module.

      - **Type:** counter
      - **Reset:** via \`mi statistics_reset tm:received_replies\`
      - **Access:** mi, prometheus
      "
    `);
  });
});

describe("renderStatistic — type handling", () => {
  it("renders Type bullet when type is set to a counter literal", () => {
    const out = renderStatistic({ ...minimal(), type: "counter" });
    expect(out).toMatch(/- \*\*Type:\*\* counter/);
  });

  it("renders Type bullet when type is set to a gauge literal", () => {
    const out = renderStatistic({ ...minimal(), type: "gauge" });
    expect(out).toMatch(/- \*\*Type:\*\* gauge/);
  });

  it("accepts an arbitrary string type (schema's z.enum().or(z.string()))", () => {
    const out = renderStatistic({ ...minimal(), type: "monotonic-counter" });
    expect(out).toMatch(/- \*\*Type:\*\* monotonic-counter/);
  });

  it("omits the Type bullet when type is undefined", () => {
    const out = renderStatistic({ ...minimal(), type: undefined });
    expect(out).not.toMatch(/\*\*Type:\*\*/);
  });
});

describe("renderStatistic — reset_method handling", () => {
  it("renders Reset bullet when reset_method is set", () => {
    const out = renderStatistic({
      ...minimal(),
      reset_method: "via `mi statistics_reset tm:received_replies`",
    });
    expect(out).toMatch(/- \*\*Reset:\*\* via `mi statistics_reset tm:received_replies`/);
  });

  it("omits the Reset bullet when reset_method is undefined", () => {
    const out = renderStatistic({ ...minimal(), reset_method: undefined });
    expect(out).not.toMatch(/\*\*Reset:\*\*/);
  });
});

describe("renderStatistic — access_methods handling", () => {
  it("renders Access bullet with comma-joined methods when array is non-empty", () => {
    const out = renderStatistic({
      ...minimal(),
      access_methods: ["mi", "prometheus"],
    });
    expect(out).toMatch(/- \*\*Access:\*\* mi, prometheus/);
  });

  it("renders a single access method without a comma", () => {
    const out = renderStatistic({ ...minimal(), access_methods: ["mi"] });
    expect(out).toMatch(/- \*\*Access:\*\* mi\n/);
  });

  it("omits the Access bullet when access_methods is undefined", () => {
    const out = renderStatistic({ ...minimal(), access_methods: undefined });
    expect(out).not.toMatch(/\*\*Access:\*\*/);
  });

  it("omits the Access bullet when access_methods is an empty array", () => {
    const out = renderStatistic({ ...minimal(), access_methods: [] });
    expect(out).not.toMatch(/\*\*Access:\*\*/);
  });
});

describe("renderStatistic — partial property lists", () => {
  it("renders Access only when type and reset_method are absent", () => {
    const out = renderStatistic({
      ...minimal(),
      access_methods: ["mi", "prometheus"],
    });
    expect(out).toMatchInlineSnapshot(`
      "### \`tm:received_replies\`

      Counter of all SIP replies received by the tm module.

      - **Access:** mi, prometheus
      "
    `);
  });

  it("renders Type and Reset only when access_methods is absent", () => {
    const out = renderStatistic({
      ...minimal(),
      type: "counter",
      reset_method: "via mi statistics_reset",
    });
    expect(out).toMatch(/- \*\*Type:\*\* counter\n- \*\*Reset:\*\* via mi statistics_reset/);
    expect(out).not.toMatch(/\*\*Access:\*\*/);
  });
});
