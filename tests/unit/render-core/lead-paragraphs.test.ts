import { describe, it, expect } from "vitest";
import {
  leadParagraphs,
  getLeadParagraph,
} from "../../../scripts/render-core/lead-paragraphs.js";

/**
 * Every doc type that must be registered per Task 4.4 / ADR-009.
 *
 * Twelve core types from `rendering-templates.md` §3.2 plus the three
 * guide types from {@link GuideDocumentSchema} (per ADR-009 §M4).
 */
const ALL_DOC_TYPES = [
  // 12 core types
  "core_variable",
  "core_function",
  "core_parameter",
  "operator",
  "statement",
  "route_type",
  "transformation",
  "async_statement",
  "mi_command",
  "event",
  "statistic",
  "flag",
  // 3 guide types
  "installation_guide",
  "configuration_guide",
  "syntax_guide",
] as const;

/**
 * Trigger phrases the lead paragraph must end with so Claude can decide
 * whether to open the file. Spec: rendering-templates.md §2.3 — imperative
 * voice ending with "Read this file when..." or "Read this file to...".
 */
const TRIGGER_PHRASES = ["Read this file when", "Read this file to"];

describe("leadParagraphs registry", () => {
  it("registers a factory for every required doc type (12 core + 3 guides = 15)", () => {
    for (const docType of ALL_DOC_TYPES) {
      expect(
        leadParagraphs[docType],
        `expected leadParagraphs[${docType}] to be defined`,
      ).toBeTypeOf("function");
    }
  });

  it("exposes exactly 15 registered doc types and no extras", () => {
    expect(Object.keys(leadParagraphs).sort()).toEqual(
      [...ALL_DOC_TYPES].sort(),
    );
  });
});

describe("getLeadParagraph — per-doc-type behavior", () => {
  for (const docType of ALL_DOC_TYPES) {
    describe(docType, () => {
      it("returns a non-empty string", () => {
        const out = getLeadParagraph(docType, "3.6");
        expect(typeof out).toBe("string");
        expect(out.length).toBeGreaterThan(0);
      });

      it("mentions the active version (3.6) verbatim", () => {
        const out = getLeadParagraph(docType, "3.6");
        expect(out).toContain("3.6");
      });

      it("contains a 'Read this file when/to' trigger phrase", () => {
        const out = getLeadParagraph(docType, "3.6");
        const hasTrigger = TRIGGER_PHRASES.some((phrase) =>
          out.includes(phrase),
        );
        expect(
          hasTrigger,
          `expected lead for ${docType} to contain one of ${TRIGGER_PHRASES.join(
            " | ",
          )} but got: ${out}`,
        ).toBe(true);
      });

      it("substitutes the version argument (3.5 vs 3.6 produce different output)", () => {
        const out35 = getLeadParagraph(docType, "3.5");
        const out36 = getLeadParagraph(docType, "3.6");
        expect(out35).toContain("3.5");
        expect(out36).toContain("3.6");
        expect(out35).not.toBe(out36);
      });

      it("does not mention any sibling SER-lineage project name (ADR-008)", () => {
        const out = getLeadParagraph(docType, "3.6");
        expect(out.toLowerCase()).not.toContain("kamailio");
        expect(out.toLowerCase()).not.toContain("openser");
        expect(out.toLowerCase()).not.toContain("ser ");
      });
    });
  }
});

describe("getLeadParagraph — unknown doc type", () => {
  it("throws when no factory is registered for the doc type", () => {
    expect(() => getLeadParagraph("unknown-type", "3.6")).toThrow();
  });

  it("throw message names the missing doc type so the caller can diagnose", () => {
    try {
      getLeadParagraph("totally-bogus-type", "3.6");
      throw new Error("expected getLeadParagraph to throw");
    } catch (caught) {
      expect(caught).toBeInstanceOf(Error);
      const err = caught as Error;
      expect(err.message).toContain("totally-bogus-type");
    }
  });
});
