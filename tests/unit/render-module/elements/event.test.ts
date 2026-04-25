import { describe, it, expect } from "vitest";
import { renderEvent } from "../../../../scripts/render-module/elements/event.js";
import type { Event } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Build a minimal {@link Event} value: only the schema-required fields
 * (`name`, `description`, `parameters`) are populated, with `parameters`
 * empty. Tests can spread this and override fields to keep cases short.
 *
 * @returns A fresh Event with only required fields set.
 */
const minimal = (): Event => ({
  name: "E_TM_BRANCH_FAILED",
  description: "Triggered when a branch within a transaction receives a final negative reply.",
  parameters: [],
});

describe("renderEvent — minimal input (only required fields)", () => {
  it("renders an H3 heading and prose only", () => {
    expect(renderEvent(minimal())).toMatchInlineSnapshot(`
      "### \`E_TM_BRANCH_FAILED\`

      Triggered when a branch within a transaction receives a final negative reply.
      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderEvent(minimal());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("does not emit a Parameters block when parameters is empty", () => {
    const out = renderEvent(minimal());
    expect(out).not.toMatch(/\*\*Parameters:\*\*/);
  });

  it("does not emit a Subscribe via line when subscribe_method is absent", () => {
    const out = renderEvent(minimal());
    expect(out).not.toMatch(/Subscribe via/);
  });

  it("does not emit an Example block when examples is absent", () => {
    const out = renderEvent(minimal());
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });
});

describe("renderEvent — heading level", () => {
  it("uses H3 by default (per §3.1.9 module rendering)", () => {
    const out = renderEvent(minimal());
    expect(out.startsWith("### ")).toBe(true);
  });

  it("uses H2 when headingLevel=2 is passed (core type aggregation)", () => {
    const out = renderEvent(minimal(), 2);
    expect(out.startsWith("## ")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });

  it("backticks the event name regardless of level", () => {
    const out = renderEvent(minimal(), 2);
    expect(out.startsWith("## `E_TM_BRANCH_FAILED`\n")).toBe(true);
  });
});

describe("renderEvent — maximal input (every optional field set)", () => {
  it("renders all blocks in the documented order", () => {
    const event: Event = {
      name: "E_TM_BRANCH_FAILED",
      description: "Triggered when a branch within a transaction receives a final negative reply.",
      parameters: [
        { name: "tindex", type: "integer", description: "transaction hash table index" },
        { name: "tlabel", type: "integer", description: "transaction label" },
        { name: "branch_id", type: "integer", description: "index of the failed branch" },
      ],
      subscribe_method: "`event_route[E_TM_BRANCH_FAILED]` or `subscribe_event` MI command",
      examples: [
        {
          language: "opensips",
          code: 'event_route[E_TM_BRANCH_FAILED] {\n    xlog("branch $param(branch_id) failed\\n");\n}',
          description: "Subscribe to the event in a route block",
        },
        {
          language: "bash",
          code: "opensips-mi subscribe_event E_TM_BRANCH_FAILED",
          description: "Subscribe via MI",
        },
      ],
    };

    expect(renderEvent(event)).toMatchInlineSnapshot(`
      "### \`E_TM_BRANCH_FAILED\`

      Triggered when a branch within a transaction receives a final negative reply.

      **Parameters:**

      - \`tindex\` *(integer)* — transaction hash table index
      - \`tlabel\` *(integer)* — transaction label
      - \`branch_id\` *(integer)* — index of the failed branch

      **Subscribe via:** \`event_route[E_TM_BRANCH_FAILED]\` or \`subscribe_event\` MI command

      **Example.** Subscribe to the event in a route block.

      \`\`\`opensips
      event_route[E_TM_BRANCH_FAILED] {
          xlog(\"branch $param(branch_id) failed\\n\");
      }
      \`\`\`

      **Example.** Subscribe via MI.

      \`\`\`bash
      opensips-mi subscribe_event E_TM_BRANCH_FAILED
      \`\`\`
      "
    `);
  });
});

describe("renderEvent — parameters handling", () => {
  it("renders the Parameters block when parameters is non-empty", () => {
    const out = renderEvent({
      ...minimal(),
      parameters: [
        { name: "tindex", type: "integer", description: "transaction hash table index" },
      ],
    });
    expect(out).toMatch(/\*\*Parameters:\*\*/);
    expect(out).toMatch(/- `tindex` \*\(integer\)\* — transaction hash table index/);
  });

  it("does not include required/optional markers (events have a fixed payload)", () => {
    const out = renderEvent({
      ...minimal(),
      parameters: [{ name: "tindex", type: "integer", description: "index" }],
    });
    expect(out).not.toMatch(/required/);
    expect(out).not.toMatch(/optional/);
  });

  it("preserves the source-provided parameter order", () => {
    const out = renderEvent({
      ...minimal(),
      parameters: [
        { name: "zeta", type: "integer", description: "z" },
        { name: "alpha", type: "integer", description: "a" },
      ],
    });
    const zIdx = out.indexOf("`zeta`");
    const aIdx = out.indexOf("`alpha`");
    expect(zIdx).toBeGreaterThan(-1);
    expect(aIdx).toBeGreaterThan(-1);
    expect(zIdx).toBeLessThan(aIdx);
  });
});

describe("renderEvent — subscribe_method handling", () => {
  it("renders Subscribe via line, no examples block when subscribe_method is set and examples is absent", () => {
    const out = renderEvent({
      ...minimal(),
      subscribe_method: "`event_route[E_FOO]`",
    });
    expect(out).toMatch(/\*\*Subscribe via:\*\* `event_route\[E_FOO\]`/);
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });

  it("omits the Subscribe via line when subscribe_method is undefined", () => {
    const out = renderEvent({ ...minimal(), subscribe_method: undefined });
    expect(out).not.toMatch(/Subscribe via/);
  });
});

describe("renderEvent — examples handling", () => {
  it("renders examples and omits Subscribe via line when subscribe_method is absent", () => {
    const out = renderEvent({
      ...minimal(),
      examples: [
        {
          language: "opensips",
          code: 'event_route[E_TM_BRANCH_FAILED] { xlog("hi\\n"); }',
          description: "Subscribe to the event",
        },
      ],
    });
    expect(out).not.toMatch(/Subscribe via/);
    expect(out).toMatch(/\*\*Example\.\*\* Subscribe to the event\./);
    expect(out).toMatch(/```opensips\n/);
    expect(out).toMatch(/event_route\[E_TM_BRANCH_FAILED\]/);
    expect(out).toMatch(/\n```/);
  });

  it("uses the example's language field for the fence tag", () => {
    const out = renderEvent({
      ...minimal(),
      examples: [
        {
          language: "bash",
          code: "opensips-mi subscribe_event E_TM_BRANCH_FAILED",
          description: "Subscribe via MI",
        },
      ],
    });
    expect(out).toMatch(/```bash\n/);
  });

  it("defaults the fence tag to opensips when language is empty", () => {
    const out = renderEvent({
      ...minimal(),
      examples: [
        {
          language: "",
          code: "event_route[E_FOO] {}",
          description: "Subscribe",
        },
      ],
    });
    expect(out).toMatch(/```opensips\n/);
  });

  it("omits the example block when examples array is empty", () => {
    const out = renderEvent({ ...minimal(), examples: [] });
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });

  it("omits the example block when examples is undefined", () => {
    const out = renderEvent({ ...minimal(), examples: undefined });
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });
});
