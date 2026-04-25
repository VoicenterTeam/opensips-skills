import { describe, it, expect } from "vitest";
import type { z } from "zod";
import { renderFlag } from "../../../../scripts/render-core/elements/flag.js";
import type { FlagDocumentSchema } from "../../../../scripts/schemas/core/flags.schema.js";

type FlagType = z.infer<typeof FlagDocumentSchema>["flag_types"][number];

/**
 * Build a minimal {@link FlagType}: every required field populated, but
 * `functions` and `examples` are empty arrays — the smallest legal value
 * the schema accepts. Tests can spread this and override fields.
 *
 * @returns A fresh FlagType with only required fields set.
 */
const minimal = (): FlagType => ({
  type_name: "Message Flags",
  description: "Per-message flags reset on each new message.",
  max_flags: 32,
  persistence: "per-message",
  functions: [],
  examples: [],
});

describe("renderFlag — minimal input (no functions, no examples)", () => {
  it("renders an H2 heading, prose, and a 2-bullet property list", () => {
    expect(renderFlag(minimal())).toMatchInlineSnapshot(`
      "## Message Flags

      Per-message flags reset on each new message.

      - **Persistence:** per-message
      - **Max flags:** 32
      "
    `);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderFlag(minimal());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });

  it("does not backtick the type_name (descriptive label, not identifier)", () => {
    const out = renderFlag(minimal());
    expect(out.startsWith("## Message Flags\n")).toBe(true);
    expect(out).not.toMatch(/^## `Message Flags`/);
  });

  it("omits the Functions block entirely when functions is empty", () => {
    const out = renderFlag(minimal());
    expect(out).not.toMatch(/\*\*Functions:\*\*/);
  });

  it("omits the Example block when examples is empty", () => {
    const out = renderFlag(minimal());
    expect(out).not.toMatch(/\*\*Example\.\*\*/);
    expect(out).not.toMatch(/```/);
  });
});

describe("renderFlag — heading level", () => {
  it("uses H2 by default (per §3.2.3 core flag rendering)", () => {
    const out = renderFlag(minimal());
    expect(out.startsWith("## ")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });

  it("uses H3 when headingLevel=3 is passed (reuse case)", () => {
    const out = renderFlag(minimal(), 3);
    expect(out.startsWith("### ")).toBe(true);
    expect(out.startsWith("## ")).toBe(false);
  });

  it("preserves the plain-text type_name at H3 too", () => {
    const out = renderFlag(minimal(), 3);
    expect(out.startsWith("### Message Flags\n")).toBe(true);
  });
});

describe("renderFlag — maximal input (functions + examples)", () => {
  it("renders all blocks in the documented order", () => {
    const flag: FlagType = {
      type_name: "Message Flags",
      description: "Per-message flags reset on each new message.",
      max_flags: 32,
      persistence: "per-message",
      functions: [
        {
          name: "setflag(flag)",
          purpose: "set the flag at the given index",
          signature: "setflag(int)",
        },
        {
          name: "resetflag(flag)",
          purpose: "clear the flag at the given index",
          signature: "resetflag(int)",
        },
        {
          name: "isflagset(flag)",
          purpose: "test whether the flag is set",
          signature: "isflagset(int)",
        },
      ],
      examples: [
        {
          language: "opensips",
          code: "setflag(1);",
          description: "Set a routing flag",
        },
      ],
    };

    expect(renderFlag(flag)).toMatchInlineSnapshot(`
      "## Message Flags

      Per-message flags reset on each new message.

      - **Persistence:** per-message
      - **Max flags:** 32

      **Functions:**

      - \`isflagset(flag)\` — test whether the flag is set. Signature: \`isflagset(int)\`.
      - \`resetflag(flag)\` — clear the flag at the given index. Signature: \`resetflag(int)\`.
      - \`setflag(flag)\` — set the flag at the given index. Signature: \`setflag(int)\`.

      **Example.** Set a routing flag.

      \`\`\`opensips
      setflag(1);
      \`\`\`
      "
    `);
  });

  it("sorts functions alphabetically by name", () => {
    const flag: FlagType = {
      ...minimal(),
      functions: [
        { name: "zeta", purpose: "z purpose", signature: "zeta()" },
        { name: "alpha", purpose: "a purpose", signature: "alpha()" },
        { name: "mu", purpose: "m purpose", signature: "mu()" },
      ],
    };
    const out = renderFlag(flag);
    const alphaIdx = out.indexOf("`alpha`");
    const muIdx = out.indexOf("`mu`");
    const zetaIdx = out.indexOf("`zeta`");
    expect(alphaIdx).toBeGreaterThan(-1);
    expect(muIdx).toBeGreaterThan(alphaIdx);
    expect(zetaIdx).toBeGreaterThan(muIdx);
  });

  it("renders multiple examples each with its own caption and fence", () => {
    const flag: FlagType = {
      ...minimal(),
      examples: [
        {
          language: "opensips",
          code: "setflag(1);",
          description: "Set flag 1",
        },
        {
          language: "opensips",
          code: "resetflag(1);",
          description: "Clear flag 1",
        },
      ],
    };
    const out = renderFlag(flag);
    expect(out).toMatch(/\*\*Example\.\*\* Set flag 1\./);
    expect(out).toMatch(/\*\*Example\.\*\* Clear flag 1\./);
    expect(out).toMatch(/setflag\(1\);/);
    expect(out).toMatch(/resetflag\(1\);/);
  });

  it("uses the example's language tag on the code fence", () => {
    const flag: FlagType = {
      ...minimal(),
      examples: [
        {
          language: "bash",
          code: "opensips-mi list_flags",
          description: "List flags via MI",
        },
      ],
    };
    const out = renderFlag(flag);
    expect(out).toMatch(/```bash\nopensips-mi list_flags\n```/);
  });

  it("falls back to the opensips fence tag when the example language is empty", () => {
    const flag: FlagType = {
      ...minimal(),
      examples: [
        {
          language: "",
          code: "setflag(1);",
          description: "Set a flag",
        },
      ],
    };
    const out = renderFlag(flag);
    expect(out).toMatch(/```opensips\nsetflag\(1\);\n```/);
  });

  it("emits the Example caption without a trailing description period when description is empty", () => {
    const flag: FlagType = {
      ...minimal(),
      examples: [
        {
          language: "opensips",
          code: "setflag(1);",
          description: "",
        },
      ],
    };
    const out = renderFlag(flag);
    expect(out).toMatch(/\*\*Example\.\*\*\n/);
    expect(out).not.toMatch(/\*\*Example\.\*\* \./);
  });
});

describe("renderFlag — function rendering details", () => {
  it("formats each function as `- \\`name\\` — purpose. Signature: \\`signature\\`.`", () => {
    const flag: FlagType = {
      ...minimal(),
      functions: [
        {
          name: "setflag(flag)",
          purpose: "set the flag at the given index",
          signature: "setflag(int)",
        },
      ],
    };
    const out = renderFlag(flag);
    expect(out).toMatch(
      /- `setflag\(flag\)` — set the flag at the given index\. Signature: `setflag\(int\)`\.\n/,
    );
  });

  it("includes the **Functions:** label only when the array is non-empty", () => {
    const withFns = renderFlag({
      ...minimal(),
      functions: [{ name: "f", purpose: "p", signature: "s" }],
    });
    expect(withFns).toMatch(/\*\*Functions:\*\*/);

    const without = renderFlag(minimal());
    expect(without).not.toMatch(/\*\*Functions:\*\*/);
  });
});

describe("renderFlag — branch and script flag types", () => {
  it("renders a Branch Flags block with its own persistence value", () => {
    const flag: FlagType = {
      type_name: "Branch Flags",
      description: "Per-branch flags carried with each branch of a transaction.",
      max_flags: 32,
      persistence: "per-branch",
      functions: [],
      examples: [],
    };
    expect(renderFlag(flag)).toMatchInlineSnapshot(`
      "## Branch Flags

      Per-branch flags carried with each branch of a transaction.

      - **Persistence:** per-branch
      - **Max flags:** 32
      "
    `);
  });

  it("renders a Script Flags block with its own persistence value", () => {
    const flag: FlagType = {
      type_name: "Script Flags",
      description: "Global flags that persist across the whole script run.",
      max_flags: 32,
      persistence: "process-wide",
      functions: [],
      examples: [],
    };
    expect(renderFlag(flag)).toMatchInlineSnapshot(`
      "## Script Flags

      Global flags that persist across the whole script run.

      - **Persistence:** process-wide
      - **Max flags:** 32
      "
    `);
  });
});
