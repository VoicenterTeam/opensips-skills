import { describe, it, expect } from "vitest";
import {
  renderProvenance,
  type ProvenanceOptions,
} from "../../../scripts/lib/frontmatter.js";

/**
 * Build a baseline {@link ProvenanceOptions} object that callers can spread
 * and override per-test. Keeping this in one place means a future format
 * change only ripples through one literal.
 *
 * @returns A fresh, valid options object with the canonical example values.
 */
const baseline = (): ProvenanceOptions => ({
  generatedFrom: "data/3.6/modules/tm.json",
  generatorVersion: "0.1.0",
  opensipsVersion: "3.6",
  docType: "module",
});

describe("renderProvenance — canonical format", () => {
  it("emits the byte-exact comment block from rendering-templates.md §2.2", () => {
    const expected =
      "<!-- generated-from: data/3.6/modules/tm.json\n" +
      "     generator-version: 0.1.0\n" +
      "     opensips-version: 3.6\n" +
      "     doc-type: module -->\n";

    expect(renderProvenance(baseline())).toBe(expected);
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderProvenance(baseline());
    expect(out.endsWith(" -->\n")).toBe(true);
    expect(out.endsWith(" -->\n\n")).toBe(false);
  });

  it("uses a 5-space indent on continuation lines", () => {
    const out = renderProvenance(baseline());
    const lines = out.split("\n");
    // line 0: <!-- generated-from: ...
    // line 1: 5 spaces + generator-version: ...
    // line 2: 5 spaces + opensips-version: ...
    // line 3: 5 spaces + doc-type: ... -->
    // line 4: "" (after the trailing \n)
    expect(lines[1]?.startsWith("     generator-version: ")).toBe(true);
    expect(lines[2]?.startsWith("     opensips-version: ")).toBe(true);
    expect(lines[3]?.startsWith("     doc-type: ")).toBe(true);
  });

  it("flows different input values through to the correct positions", () => {
    const out = renderProvenance({
      generatedFrom: "data/3.5/core/variables.json",
      generatorVersion: "1.2.3",
      opensipsVersion: "3.5",
      docType: "core_variable",
    });

    const expected =
      "<!-- generated-from: data/3.5/core/variables.json\n" +
      "     generator-version: 1.2.3\n" +
      "     opensips-version: 3.5\n" +
      "     doc-type: core_variable -->\n";

    expect(out).toBe(expected);
  });
});

describe("renderProvenance — newline rejection", () => {
  it("throws when generatedFrom contains a newline", () => {
    expect(() =>
      renderProvenance({ ...baseline(), generatedFrom: "data/3.6/modules/tm\n.json" }),
    ).toThrow(/generatedFrom/);
  });

  it("throws when generatorVersion contains a newline", () => {
    expect(() =>
      renderProvenance({ ...baseline(), generatorVersion: "0.1.\n0" }),
    ).toThrow(/generatorVersion/);
  });

  it("throws when opensipsVersion contains a newline", () => {
    expect(() =>
      renderProvenance({ ...baseline(), opensipsVersion: "3.\n6" }),
    ).toThrow(/opensipsVersion/);
  });

  it("throws when docType contains a newline", () => {
    expect(() =>
      renderProvenance({ ...baseline(), docType: "mod\nule" }),
    ).toThrow(/docType/);
  });

  it("error message names the offending field and mentions newline", () => {
    try {
      renderProvenance({ ...baseline(), opensipsVersion: "bad\nvalue" });
      throw new Error("expected renderProvenance to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      const msg = (err as Error).message;
      expect(msg).toMatch(/opensipsVersion/);
      expect(msg).toMatch(/newline/i);
    }
  });
});

describe("renderProvenance — comment-terminator rejection", () => {
  it("throws when generatedFrom contains -->", () => {
    expect(() =>
      renderProvenance({ ...baseline(), generatedFrom: "data/-->/tm.json" }),
    ).toThrow(/generatedFrom/);
  });

  it("throws when generatorVersion contains -->", () => {
    expect(() =>
      renderProvenance({ ...baseline(), generatorVersion: "0.1.0-->" }),
    ).toThrow(/generatorVersion/);
  });

  it("throws when opensipsVersion contains -->", () => {
    expect(() =>
      renderProvenance({ ...baseline(), opensipsVersion: "3.6-->" }),
    ).toThrow(/opensipsVersion/);
  });

  it("throws when docType contains -->", () => {
    expect(() =>
      renderProvenance({ ...baseline(), docType: "module-->" }),
    ).toThrow(/docType/);
  });

  it("error message names the offending field and mentions the terminator", () => {
    try {
      renderProvenance({ ...baseline(), docType: "module-->" });
      throw new Error("expected renderProvenance to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      const msg = (err as Error).message;
      expect(msg).toMatch(/docType/);
      expect(msg).toMatch(/-->/);
    }
  });
});
