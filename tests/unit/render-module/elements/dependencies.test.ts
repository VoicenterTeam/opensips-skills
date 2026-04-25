import { describe, it, expect } from "vitest";
import { renderDependencies } from "../../../../scripts/render-module/elements/dependencies.js";
import type { Dependency } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Build a minimal {@link Dependency}: the four required schema fields.
 * Tests can spread this and override fields to keep cases short.
 *
 * @param overrides - Partial Dependency fields to merge.
 * @returns A fresh Dependency populated with the requested fields.
 */
const dep = (overrides: Partial<Dependency> & Pick<Dependency, "name" | "type">): Dependency => ({
  optional: false,
  ...overrides,
});

describe("renderDependencies — empty inputs", () => {
  it("emits H2 + both H3 sub-sections with 'None.' when both lists are empty", () => {
    expect(renderDependencies({ required: [], optional: [] })).toMatchInlineSnapshot(`
      "## Dependencies

      ### OpenSIPs Modules

      None.

      ### External Libraries

      None.

      "
    `);
  });

  it("treats required: null identically to required: []", () => {
    const a = renderDependencies({ required: null, optional: [] });
    const b = renderDependencies({ required: [], optional: [] });
    expect(a).toBe(b);
  });

  it("treats required: undefined identically to required: []", () => {
    const a = renderDependencies({ required: undefined, optional: [] });
    const b = renderDependencies({ required: [], optional: [] });
    expect(a).toBe(b);
  });

  it("treats optional: null identically to optional: []", () => {
    const a = renderDependencies({ required: [], optional: null });
    const b = renderDependencies({ required: [], optional: [] });
    expect(a).toBe(b);
  });

  it("treats optional: undefined identically to optional: []", () => {
    const a = renderDependencies({ required: [], optional: undefined });
    const b = renderDependencies({ required: [], optional: [] });
    expect(a).toBe(b);
  });

  it("does NOT emit the Optional Modules sub-section when optional is empty", () => {
    const out = renderDependencies({ required: [], optional: [] });
    expect(out).not.toMatch(/Optional Modules/);
  });
});

describe("renderDependencies — populated required, partitioned by type", () => {
  it("renders modules and libraries in their respective sub-sections, alphabetized", () => {
    const required: Dependency[] = [
      dep({ name: "tm", type: "module", reason: "stateful transactions" }),
      dep({ name: "signaling", type: "module", reason: "SIP message creation" }),
      dep({ name: "libssl", type: "library", reason: "TLS support" }),
      dep({ name: "libcurl", type: "library", reason: "HTTP client" }),
    ];

    expect(renderDependencies({ required, optional: [] })).toMatchInlineSnapshot(`
      "## Dependencies

      ### OpenSIPs Modules

      - \`signaling\` — SIP message creation
      - \`tm\` — stateful transactions

      ### External Libraries

      - \`libcurl\` — HTTP client
      - \`libssl\` — TLS support

      "
    `);
  });

  it("renders a module without a reason as just the backticked name", () => {
    const required: Dependency[] = [dep({ name: "tm", type: "module" })];
    const out = renderDependencies({ required, optional: [] });
    expect(out).toMatch(/- `tm`\n/);
    expect(out).not.toMatch(/- `tm` —/);
  });

  it("appends ' (optional)' to a dependency's line when the optional flag is true", () => {
    const required: Dependency[] = [
      dep({ name: "dialog", type: "module", reason: "enables dialog tracking", optional: true }),
    ];
    const out = renderDependencies({ required, optional: [] });
    expect(out).toMatch(/- `dialog` — enables dialog tracking \(optional\)/);
  });

  it("appends ' (optional)' even when reason is absent", () => {
    const required: Dependency[] = [
      dep({ name: "dialog", type: "module", optional: true }),
    ];
    const out = renderDependencies({ required, optional: [] });
    expect(out).toMatch(/- `dialog` \(optional\)/);
  });

  it("emits 'None.' for the modules sub-section when only libraries are present", () => {
    const required: Dependency[] = [dep({ name: "libssl", type: "library" })];
    const out = renderDependencies({ required, optional: [] });
    expect(out).toMatch(/### OpenSIPs Modules\n\nNone\./);
    expect(out).toMatch(/### External Libraries\n\n- `libssl`/);
  });

  it("emits 'None.' for the libraries sub-section when only modules are present", () => {
    const required: Dependency[] = [dep({ name: "tm", type: "module" })];
    const out = renderDependencies({ required, optional: [] });
    expect(out).toMatch(/### OpenSIPs Modules\n\n- `tm`/);
    expect(out).toMatch(/### External Libraries\n\nNone\./);
  });
});

describe("renderDependencies — application type partitioning", () => {
  /**
   * Documented partition choice: dependencies with `type: "application"` are
   * grouped under the "External Libraries" sub-section, alongside libraries.
   * Rationale: applications are external runtime tools (binaries, services)
   * — they are not OpenSIPs modules, so the "OpenSIPs Modules" bucket is
   * incorrect; and the upstream OpenSIPs documentation pattern only
   * distinguishes "modules" (in-tree) from "everything else external", which
   * "External Libraries" represents in our rendering.
   */
  it("groups applications with libraries (judgment call documented in JSDoc)", () => {
    const required: Dependency[] = [
      dep({ name: "tm", type: "module", reason: "transactions" }),
      dep({ name: "rtpproxy", type: "application", reason: "media relay daemon" }),
      dep({ name: "libssl", type: "library", reason: "TLS" }),
    ];
    const out = renderDependencies({ required, optional: [] });
    // rtpproxy must appear under External Libraries, alphabetically after libssl.
    expect(out).toMatch(/### External Libraries\n\n- `libssl`[^\n]*\n- `rtpproxy`/);
    expect(out).toMatch(/### OpenSIPs Modules\n\n- `tm`/);
  });
});

describe("renderDependencies — optional list (string array)", () => {
  it("emits the third H3 'Optional Modules' sub-section when the list is non-empty", () => {
    const out = renderDependencies({
      required: [],
      optional: ["dialog", "presence"],
    });
    expect(out).toMatch(/### Optional Modules\n\n- `dialog`\n- `presence`\n/);
  });

  it("renders optional items as backticked names only — no reason or em dash", () => {
    const out = renderDependencies({ required: [], optional: ["dialog"] });
    expect(out).toMatch(/- `dialog`\n/);
    expect(out).not.toMatch(/- `dialog` —/);
  });

  it("alphabetizes the optional list", () => {
    const out = renderDependencies({
      required: [],
      optional: ["zeta", "alpha", "mu"],
    });
    const idxAlpha = out.indexOf("- `alpha`");
    const idxMu = out.indexOf("- `mu`");
    const idxZeta = out.indexOf("- `zeta`");
    expect(idxAlpha).toBeGreaterThan(-1);
    expect(idxAlpha).toBeLessThan(idxMu);
    expect(idxMu).toBeLessThan(idxZeta);
  });
});

describe("renderDependencies — sectionHeadingLevel=3 (core/aggregated rendering)", () => {
  it("emits H3 'Dependencies' with H4 sub-sections instead of H2/H3", () => {
    const required: Dependency[] = [
      dep({ name: "tm", type: "module", reason: "transactions" }),
    ];
    const out = renderDependencies({ required, optional: ["dialog"] }, 3);
    expect(out).toMatch(/^### Dependencies\n/);
    expect(out).toMatch(/#### OpenSIPs Modules\n/);
    expect(out).toMatch(/#### External Libraries\n/);
    expect(out).toMatch(/#### Optional Modules\n/);
    // Nothing should regress to H2/H3 — guard against substring matches by
    // anchoring to start-of-line and limiting the leading `#` count.
    expect(out).not.toMatch(/^## Dependencies/m);
    expect(out).not.toMatch(/^### OpenSIPs Modules/m);
  });

  it("defaults to sectionHeadingLevel=2 when not passed", () => {
    const out = renderDependencies({ required: [], optional: [] });
    expect(out.startsWith("## Dependencies\n")).toBe(true);
  });
});

describe("renderDependencies — output contract", () => {
  it("ends with exactly one trailing newline (after the trailing blank-line)", () => {
    const out = renderDependencies({ required: [], optional: [] });
    // Section helper convention: blocks end with two newlines (paragraph +
    // separator). The renderer composes one final "\n\n" trailing block, so
    // the output ends in "\n\n" — verify by checking the last two chars.
    expect(out.endsWith("\n\n")).toBe(true);
  });

  it("does not emit any H2 other than '## Dependencies'", () => {
    const required: Dependency[] = [
      dep({ name: "tm", type: "module" }),
      dep({ name: "libssl", type: "library" }),
    ];
    const out = renderDependencies({ required, optional: ["dialog"] });
    const h2Lines = out.split("\n").filter((line) => line.startsWith("## ") && !line.startsWith("### "));
    expect(h2Lines).toEqual(["## Dependencies"]);
  });
});
