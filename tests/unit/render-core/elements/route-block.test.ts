import { describe, it, expect } from "vitest";
import type { z } from "zod";
import { renderRouteBlock } from "../../../../scripts/render-core/elements/route-block.js";
import type { RouteDocumentSchema } from "../../../../scripts/schemas/core/routes.schema.js";

type RouteType = z.infer<typeof RouteDocumentSchema>["route_types"][number];

/**
 * Build a minimal valid {@link RouteType} carrying only schema-required
 * fields. Tests can spread this and override individual properties.
 *
 * @returns A fresh minimal RouteType object.
 */
const minimalRoute = (): RouteType => ({
  name: "request_route",
  syntax: "request_route { ... }",
  description: "Top-level route invoked for incoming requests.",
  trigger_condition: "any incoming request",
  can_call_routes: true,
  examples: [],
});

describe("renderRouteBlock — minimal", () => {
  it("renders heading, description, property list, and untagged syntax fence", () => {
    expect(renderRouteBlock(minimalRoute())).toMatchInlineSnapshot(`
      "## \`request_route\`

      Top-level route invoked for incoming requests.

      - **Trigger:** any incoming request
      - **Can call routes:** yes

      **Syntax:**

      \`\`\`
      request_route { ... }
      \`\`\`

      "
    `);
  });

  it("ends with exactly one trailing newline (no trailing run)", () => {
    const out = renderRouteBlock(minimalRoute());
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n\n")).toBe(false);
  });

  it("uses an UNTAGGED code fence for the syntax block (per §4.1)", () => {
    const out = renderRouteBlock(minimalRoute());
    // Must contain a bare ``` fence opener, never ```opensips before the syntax.
    expect(out).toContain("\n```\nrequest_route { ... }\n```\n");
    expect(out).not.toContain("```opensips\nrequest_route { ... }\n```");
  });

  it("omits the Available variables block when array is absent", () => {
    const out = renderRouteBlock(minimalRoute());
    expect(out).not.toContain("**Available variables:**");
  });

  it("omits the Available functions block when array is absent", () => {
    const out = renderRouteBlock(minimalRoute());
    expect(out).not.toContain("**Available functions:**");
  });

  it("omits the Example block when examples array is empty", () => {
    const out = renderRouteBlock(minimalRoute());
    expect(out).not.toContain("**Example.**");
  });
});

describe("renderRouteBlock — maximal", () => {
  it("renders every section in spec order with multiple items", () => {
    const route: RouteType = {
      name: "request_route",
      syntax: "request_route { ... }",
      description: "Top-level route invoked for incoming requests.",
      trigger_condition: "any incoming request",
      available_variables: ["$ru", "$rU", "$tu", "$ci"],
      available_functions: ["t_relay", "forward", "send_reply"],
      can_call_routes: true,
      examples: [
        {
          language: "opensips",
          code: "request_route { t_relay(); }",
          description: "Minimal request_route",
        },
        {
          language: "opensips",
          code: 'request_route { send_reply("200", "OK"); }',
          description: "Send a 200 OK",
        },
      ],
    };

    expect(renderRouteBlock(route)).toMatchInlineSnapshot(`
      "## \`request_route\`

      Top-level route invoked for incoming requests.

      - **Trigger:** any incoming request
      - **Can call routes:** yes

      **Available variables:** \`$ru\`, \`$rU\`, \`$tu\`, \`$ci\`

      **Available functions:** \`t_relay\`, \`forward\`, \`send_reply\`

      **Syntax:**

      \`\`\`
      request_route { ... }
      \`\`\`

      **Example.** Minimal request_route.

      \`\`\`opensips
      request_route { t_relay(); }
      \`\`\`

      **Example.** Send a 200 OK.

      \`\`\`opensips
      request_route { send_reply(\"200\", \"OK\"); }
      \`\`\`

      "
    `);
  });
});

describe("renderRouteBlock — headingLevel=3", () => {
  it("uses an H3 heading instead of H2 when reused", () => {
    const out = renderRouteBlock(minimalRoute(), 3);
    expect(out.startsWith("### `request_route`\n")).toBe(true);
    expect(out.startsWith("## ")).toBe(false);
  });

  it("defaults to H2 when headingLevel is omitted", () => {
    const out = renderRouteBlock(minimalRoute());
    expect(out.startsWith("## `request_route`\n")).toBe(true);
  });
});

describe("renderRouteBlock — can_call_routes flag", () => {
  it("renders 'yes' when can_call_routes is true", () => {
    const out = renderRouteBlock({ ...minimalRoute(), can_call_routes: true });
    expect(out).toContain("- **Can call routes:** yes\n");
    expect(out).not.toContain("- **Can call routes:** no\n");
  });

  it("renders 'no' when can_call_routes is false", () => {
    const out = renderRouteBlock({ ...minimalRoute(), can_call_routes: false });
    expect(out).toContain("- **Can call routes:** no\n");
    expect(out).not.toContain("- **Can call routes:** yes\n");
  });
});

describe("renderRouteBlock — conditional variables/functions blocks", () => {
  it("renders Available variables when array is non-empty (single item)", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      available_variables: ["$ru"],
    });
    expect(out).toContain("**Available variables:** `$ru`\n");
  });

  it("renders Available variables comma-separated and each backticked (multiple items)", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      available_variables: ["$ru", "$rU", "$ci"],
    });
    expect(out).toContain("**Available variables:** `$ru`, `$rU`, `$ci`\n");
  });

  it("omits Available variables when array is empty", () => {
    const out = renderRouteBlock({ ...minimalRoute(), available_variables: [] });
    expect(out).not.toContain("**Available variables:**");
  });

  it("renders Available functions when array is non-empty", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      available_functions: ["t_relay", "forward"],
    });
    expect(out).toContain("**Available functions:** `t_relay`, `forward`\n");
  });

  it("omits Available functions when array is empty", () => {
    const out = renderRouteBlock({ ...minimalRoute(), available_functions: [] });
    expect(out).not.toContain("**Available functions:**");
  });

  it("renders both blocks when both arrays are non-empty", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      available_variables: ["$ru"],
      available_functions: ["t_relay"],
    });
    expect(out).toContain("**Available variables:** `$ru`\n");
    expect(out).toContain("**Available functions:** `t_relay`\n");
    // Variables come before functions per the spec ordering.
    expect(out.indexOf("**Available variables:**")).toBeLessThan(
      out.indexOf("**Available functions:**"),
    );
  });
});

describe("renderRouteBlock — examples", () => {
  it("renders bold-captioned example with the example's language tag", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      examples: [
        {
          language: "opensips",
          code: "request_route { t_relay(); }",
          description: "Minimal",
        },
      ],
    });
    expect(out).toContain("**Example.** Minimal.\n\n");
    expect(out).toContain("```opensips\nrequest_route { t_relay(); }\n```\n");
  });

  it("falls back to the opensips fence tag when example.language is empty", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      examples: [
        {
          language: "",
          code: "request_route { }",
          description: "fallback",
        },
      ],
    });
    expect(out).toContain("```opensips\nrequest_route { }\n```\n");
  });

  it("respects a non-default example.language tag (e.g. bash)", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      examples: [
        {
          language: "bash",
          code: "opensips -C",
          description: "shell",
        },
      ],
    });
    expect(out).toContain("```bash\nopensips -C\n```\n");
  });

  it("preserves source order across multiple examples", () => {
    const out = renderRouteBlock({
      ...minimalRoute(),
      examples: [
        { language: "opensips", code: "// first", description: "alpha" },
        { language: "opensips", code: "// second", description: "bravo" },
      ],
    });
    expect(out.indexOf("alpha")).toBeLessThan(out.indexOf("bravo"));
  });
});
