import { describe, it, expect } from "vitest";
import { renderMICommand } from "../../../../scripts/render-module/elements/mi-command.js";
import type { MIFunction } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Helper to build a minimal MIFunction with sensible defaults.
 */
function makeMI(overrides: Partial<MIFunction> = {}): MIFunction {
  return {
    name: "test_mi",
    parameters: [],
    description: "Test description.",
    examples: [],
    ...overrides,
  } as MIFunction;
}

describe("renderMICommand — minimal", () => {
  it("renders only the H3 heading and description prose when no params, no return, no examples", () => {
    const mi = makeMI({
      name: "ps",
      parameters: [],
      description: "Lists running processes.",
      examples: [],
    });
    const out = renderMICommand(mi);
    expect(out).toBe("### `ps`\n\nLists running processes.\n\n");
  });

  it("does not include a Parameters section when parameters is empty", () => {
    const mi = makeMI({ parameters: [] });
    const out = renderMICommand(mi);
    expect(out).not.toContain("**Parameters:**");
  });

  it("does not include a Returns block when return_value is omitted", () => {
    const mi = makeMI({ return_value: undefined });
    const out = renderMICommand(mi);
    expect(out).not.toContain("**Returns:**");
  });

  it("does not include an Example block when examples is empty", () => {
    const mi = makeMI({ examples: [] });
    const out = renderMICommand(mi);
    expect(out).not.toContain("**Example.**");
  });
});

describe("renderMICommand — maximal", () => {
  const mi: MIFunction = {
    name: "t_uac_dlg",
    description: "Generates a SIP request out-of-dialog.",
    parameters: [
      { name: "method", type: "string", required: true, description: "SIP method" },
      { name: "headers", type: "string", required: false, description: "additional headers" },
      { name: "ruri", type: "string", required: true, description: "Request-URI" },
    ],
    return_value: {
      type: "object",
      description: "JSON object containing the generated transaction's local tag.",
    },
    examples: [
      {
        language: "bash",
        code: "opensips-mi t_uac_dlg method=OPTIONS ruri=sip:test@example.com",
        description: "Send an out-of-dialog OPTIONS via mi_fifo.",
      },
      {
        language: "bash",
        code: "opensips-mi t_uac_dlg method=INFO ruri=sip:foo@bar",
        description: "Send an out-of-dialog INFO.",
      },
    ],
  };

  it("renders the H3 with backticked MI command name", () => {
    const out = renderMICommand(mi);
    expect(out.startsWith("### `t_uac_dlg`\n")).toBe(true);
  });

  it("includes the description as prose", () => {
    const out = renderMICommand(mi);
    expect(out).toContain("Generates a SIP request out-of-dialog.");
  });

  it("renders Parameters bullet list sorted alphabetically by name", () => {
    const out = renderMICommand(mi);
    expect(out).toContain("**Parameters:**");
    const headersIdx = out.indexOf("`headers`");
    const methodIdx = out.indexOf("`method`");
    const ruriIdx = out.indexOf("`ruri`");
    expect(headersIdx).toBeGreaterThan(-1);
    expect(headersIdx).toBeLessThan(methodIdx);
    expect(methodIdx).toBeLessThan(ruriIdx);
  });

  it("formats each parameter as `- `name` *(type, required|optional)* — description`", () => {
    const out = renderMICommand(mi);
    expect(out).toContain("- `method` *(string, required)* — SIP method\n");
    expect(out).toContain("- `headers` *(string, optional)* — additional headers\n");
    expect(out).toContain("- `ruri` *(string, required)* — Request-URI\n");
  });

  it("renders the Returns paragraph using return_value.description", () => {
    const out = renderMICommand(mi);
    expect(out).toContain(
      "**Returns:** JSON object containing the generated transaction's local tag.",
    );
  });

  it("renders each example as a bash-fenced code block with bold caption", () => {
    const out = renderMICommand(mi);
    expect(out).toContain("**Example.** Send an out-of-dialog OPTIONS via mi_fifo.\n");
    expect(out).toContain(
      "```bash\nopensips-mi t_uac_dlg method=OPTIONS ruri=sip:test@example.com\n```\n",
    );
    expect(out).toContain("**Example.** Send an out-of-dialog INFO.\n");
    expect(out).toContain("```bash\nopensips-mi t_uac_dlg method=INFO ruri=sip:foo@bar\n```\n");
  });

  it("places sections in the order: heading, description, parameters, returns, examples", () => {
    const out = renderMICommand(mi);
    const headingIdx = out.indexOf("### `t_uac_dlg`");
    const descIdx = out.indexOf("Generates a SIP request");
    const paramsIdx = out.indexOf("**Parameters:**");
    const returnsIdx = out.indexOf("**Returns:**");
    const exampleIdx = out.indexOf("**Example.**");
    expect(headingIdx).toBeLessThan(descIdx);
    expect(descIdx).toBeLessThan(paramsIdx);
    expect(paramsIdx).toBeLessThan(returnsIdx);
    expect(returnsIdx).toBeLessThan(exampleIdx);
  });

  it("ends with two trailing newlines (block-level separation)", () => {
    const out = renderMICommand(mi);
    expect(out.endsWith("\n\n")).toBe(true);
    expect(out.endsWith("\n\n\n")).toBe(false);
  });
});

describe("renderMICommand — return_value with structure", () => {
  it("appends a structured-response note when return_value.structure is present", () => {
    const mi = makeMI({
      return_value: {
        type: "object",
        description: "Stats payload.",
        structure: { stat1: "integer", stat2: "integer" },
      },
    });
    const out = renderMICommand(mi);
    expect(out).toContain("**Returns:** Stats payload. (structured response — see schema)");
  });

  it("omits the structured-response note when structure is undefined", () => {
    const mi = makeMI({
      return_value: { type: "object", description: "Just a string." },
    });
    const out = renderMICommand(mi);
    expect(out).toContain("**Returns:** Just a string.");
    expect(out).not.toContain("(structured response — see schema)");
  });
});

describe("renderMICommand — headingLevel=2 (core reuse)", () => {
  it("renders an H2 heading when headingLevel is 2", () => {
    const mi = makeMI({ name: "list_routes" });
    const out = renderMICommand(mi, 2);
    expect(out.startsWith("## `list_routes`\n")).toBe(true);
    expect(out).not.toContain("### `list_routes`");
  });

  it("defaults to H3 when headingLevel is omitted", () => {
    const mi = makeMI({ name: "list_routes" });
    const out = renderMICommand(mi);
    expect(out.startsWith("### `list_routes`\n")).toBe(true);
  });
});

describe("renderMICommand — Returns omitted", () => {
  it("renders without a Returns block when return_value is undefined but other fields exist", () => {
    const mi: MIFunction = {
      name: "reload",
      description: "Reload data.",
      parameters: [{ name: "src", type: "string", required: true, description: "source" }],
      examples: [
        { language: "bash", code: "opensips-mi reload src=db", description: "Reload from db." },
      ],
    };
    const out = renderMICommand(mi);
    expect(out).not.toContain("**Returns:**");
    expect(out).toContain("**Parameters:**");
    expect(out).toContain("**Example.**");
  });
});

describe("renderMICommand — empty parameters but non-empty examples", () => {
  it("skips Parameters block but still renders Example", () => {
    const mi: MIFunction = {
      name: "uptime",
      description: "Returns uptime.",
      parameters: [],
      examples: [{ language: "bash", code: "opensips-mi uptime", description: "Show uptime." }],
    };
    const out = renderMICommand(mi);
    expect(out).not.toContain("**Parameters:**");
    expect(out).toContain("**Example.** Show uptime.\n");
    expect(out).toContain("```bash\nopensips-mi uptime\n```\n");
  });
});

describe("renderMICommand — non-bash example language", () => {
  it("respects the example's own language field rather than forcing bash", () => {
    const mi: MIFunction = {
      name: "get_config",
      description: "Returns config.",
      parameters: [],
      examples: [
        {
          language: "json",
          code: '{\n  "jsonrpc": "2.0",\n  "method": "get_config"\n}',
          description: "JSON-RPC request.",
        },
      ],
    };
    const out = renderMICommand(mi);
    expect(out).toContain("```json\n");
    expect(out).not.toContain("```bash\n");
  });

  it("defaults to bash when an example has an empty language string", () => {
    const mi: MIFunction = {
      name: "get_config",
      description: "Returns config.",
      parameters: [],
      examples: [{ language: "", code: "opensips-mi get_config", description: "Default fence." }],
    };
    const out = renderMICommand(mi);
    expect(out).toContain("```bash\nopensips-mi get_config\n```\n");
  });
});

describe("renderMICommand — example without description", () => {
  it("renders a bare `**Example.**` caption when description is empty", () => {
    const mi: MIFunction = {
      name: "ping",
      description: "Ping.",
      parameters: [],
      examples: [{ language: "bash", code: "opensips-mi ping", description: "" }],
    };
    const out = renderMICommand(mi);
    expect(out).toContain("**Example.**\n");
    expect(out).not.toContain("**Example.** \n");
  });
});
