import { describe, it, expect } from "vitest";
import { renderPseudoVariable } from "../../../../scripts/render-module/elements/pseudo-variable.js";
import type { PseudoVariable } from "../../../../scripts/schemas/module-sections.schema.js";

/**
 * Build a base, schema-valid PseudoVariable that test cases can spread and
 * override. Mirrors the "minimal" shape: name, type, R/W flags, scope, and a
 * description — and nothing else.
 */
function basePV(overrides: Partial<PseudoVariable> = {}): PseudoVariable {
  return {
    name: "$T_branch_idx",
    type: "integer",
    readable: true,
    writable: false,
    scope: "transaction",
    description: "Returns the index of the current branch within a transaction.",
    ...overrides,
  };
}

describe("renderPseudoVariable — minimal", () => {
  const out = renderPseudoVariable(basePV());

  it("starts with an H3 heading containing the backticked variable name", () => {
    expect(out.startsWith("### `$T_branch_idx`\n")).toBe(true);
  });

  it("includes the description prose on its own line", () => {
    expect(out).toContain("Returns the index of the current branch within a transaction.");
  });

  it("emits the property list in the canonical order: Type, Read/write, Scope", () => {
    const typeIdx = out.indexOf("- **Type:** integer");
    const rwIdx = out.indexOf("- **Read/write:** read-only");
    const scopeIdx = out.indexOf("- **Scope:** transaction");
    expect(typeIdx).toBeGreaterThan(-1);
    expect(rwIdx).toBeGreaterThan(-1);
    expect(scopeIdx).toBeGreaterThan(-1);
    expect(typeIdx).toBeLessThan(rwIdx);
    expect(rwIdx).toBeLessThan(scopeIdx);
  });

  it("does not emit a Possible values block when none are present", () => {
    expect(out).not.toContain("**Possible values:**");
  });

  it("does not emit any example block (PseudoVariableSchema has no examples)", () => {
    expect(out).not.toContain("**Example.**");
    expect(out).not.toContain("```opensips");
  });

  it("ends with exactly one trailing newline (block contract)", () => {
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderPseudoVariable — maximal (with possible_values)", () => {
  const out = renderPseudoVariable(
    basePV({
      possible_values: ["INVITE", "REGISTER", "OPTIONS"],
    }),
  );

  it("includes the property list ahead of the possible-values block", () => {
    const scopeIdx = out.indexOf("- **Scope:** transaction");
    const pvLeadIdx = out.indexOf("**Possible values:**");
    expect(scopeIdx).toBeGreaterThan(-1);
    expect(pvLeadIdx).toBeGreaterThan(-1);
    expect(scopeIdx).toBeLessThan(pvLeadIdx);
  });

  it("renders each possible value as a bullet after the lead", () => {
    expect(out).toContain("**Possible values:**");
    expect(out).toContain("- INVITE\n");
    expect(out).toContain("- REGISTER\n");
    expect(out).toContain("- OPTIONS\n");
  });

  it("ends with exactly one trailing newline", () => {
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderPseudoVariable — headingLevel=2", () => {
  it("uses an H2 heading instead of an H3", () => {
    const out = renderPseudoVariable(basePV(), 2);
    expect(out.startsWith("## `$T_branch_idx`\n")).toBe(true);
    expect(out.startsWith("### ")).toBe(false);
  });

  it("defaults to H3 when no heading level is supplied", () => {
    const out = renderPseudoVariable(basePV());
    expect(out.startsWith("### `$T_branch_idx`\n")).toBe(true);
  });
});

describe("renderPseudoVariable — read/write label combinations", () => {
  it("readable=true, writable=true → read-write", () => {
    const out = renderPseudoVariable(basePV({ readable: true, writable: true }));
    expect(out).toContain("- **Read/write:** read-write\n");
  });

  it("readable=true, writable=false → read-only", () => {
    const out = renderPseudoVariable(basePV({ readable: true, writable: false }));
    expect(out).toContain("- **Read/write:** read-only\n");
  });

  it("readable=false, writable=true → write-only", () => {
    const out = renderPseudoVariable(basePV({ readable: false, writable: true }));
    expect(out).toContain("- **Read/write:** write-only\n");
  });

  it("readable=false, writable=false → (neither) — handled gracefully", () => {
    const out = renderPseudoVariable(basePV({ readable: false, writable: false }));
    expect(out).toContain("- **Read/write:** (neither)\n");
  });
});

describe("renderPseudoVariable — name normalization", () => {
  it("prepends `$` when the source name lacks the leading sigil", () => {
    const out = renderPseudoVariable(basePV({ name: "T_branch_idx" }));
    expect(out.startsWith("### `$T_branch_idx`\n")).toBe(true);
  });

  it("preserves the leading `$` when already present (does not double it)", () => {
    const out = renderPseudoVariable(basePV({ name: "$T_branch_idx" }));
    expect(out.startsWith("### `$T_branch_idx`\n")).toBe(true);
    expect(out.startsWith("### `$$")).toBe(false);
  });
});
