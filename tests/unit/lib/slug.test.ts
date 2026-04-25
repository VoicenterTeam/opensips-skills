import { describe, it, expect } from "vitest";
import {
  slugify,
  assertUniqueSlugs,
  SlugCollisionError,
} from "../../../scripts/lib/slug.js";

describe("slugify", () => {
  it("preserves underscores in 'uac_auth'", () => {
    expect(slugify("uac_auth")).toBe("uac_auth");
  });

  it("lowercases mixed case 'Mi-HTTP' to 'mi-http'", () => {
    expect(slugify("Mi-HTTP")).toBe("mi-http");
  });

  it("preserves consecutive underscores in 'b2b__entities'", () => {
    // Underscores are part of the canonical slug character set, so they are
    // NOT collapsed (only consecutive hyphens are collapsed).
    expect(slugify("b2b__entities")).toBe("b2b__entities");
  });

  it("replaces special characters with hyphens and collapses runs", () => {
    expect(slugify("foo!@bar")).toBe("foo-bar");
  });

  it("trims leading and trailing hyphens after collapse", () => {
    expect(slugify("---x---")).toBe("x");
  });

  it("replaces whitespace and parentheses, lowercases, and collapses", () => {
    expect(slugify("dialog (BETA)")).toBe("dialog-beta");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("returns empty string for an all-hyphens input after trimming", () => {
    expect(slugify("---")).toBe("");
  });

  it("returns empty string for a string of only special characters", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("preserves pure numeric input", () => {
    expect(slugify("123")).toBe("123");
  });

  it("is the identity for an already-clean slug", () => {
    expect(slugify("alread-clean_42")).toBe("alread-clean_42");
  });

  it("replaces non-ASCII letters and trims trailing hyphens", () => {
    // 'é' is not in [a-z0-9_-]; it is replaced with '-', then the trailing
    // hyphen is trimmed by step 4. Result: "caf".
    expect(slugify("café")).toBe("caf");
  });

  it("collapses a run of mixed special characters to a single hyphen", () => {
    expect(slugify("a!!!b")).toBe("a-b");
  });

  it("does not convert underscores to hyphens", () => {
    expect(slugify("a_b_c")).toBe("a_b_c");
  });

  it("preserves a single hyphen between words", () => {
    expect(slugify("a-b")).toBe("a-b");
  });
});

describe("assertUniqueSlugs", () => {
  it("does not throw on an empty array", () => {
    expect(() => {
      assertUniqueSlugs([]);
    }).not.toThrow();
  });

  it("does not throw when all slugs are unique", () => {
    expect(() => {
      assertUniqueSlugs([{ name: "tm" }, { name: "registrar" }]);
    }).not.toThrow();
  });

  it("does not throw on a single item", () => {
    expect(() => {
      assertUniqueSlugs([{ name: "tm" }]);
    }).not.toThrow();
  });

  it("throws SlugCollisionError when two names produce the same slug via case", () => {
    expect(() => {
      assertUniqueSlugs([{ name: "tm" }, { name: "TM" }]);
    }).toThrow(SlugCollisionError);
  });

  it("throws SlugCollisionError when two names produce the same slug via space-vs-hyphen", () => {
    expect(() => {
      assertUniqueSlugs([{ name: "foo bar" }, { name: "foo-bar" }]);
    }).toThrow(SlugCollisionError);
  });

  it("error carries the canonical slug and both colliding source names", () => {
    try {
      assertUniqueSlugs([{ name: "tm" }, { name: "TM" }]);
      throw new Error("expected SlugCollisionError to be thrown");
    } catch (caught) {
      expect(caught).toBeInstanceOf(SlugCollisionError);
      const err = caught as SlugCollisionError;
      expect(err.slug).toBe("tm");
      // Both source names must be present, in encounter order.
      expect(err.collidingNames).toEqual(["tm", "TM"]);
    }
  });

  it("error message mentions both colliding names so users can diagnose", () => {
    try {
      assertUniqueSlugs([{ name: "foo bar" }, { name: "foo-bar" }]);
      throw new Error("expected SlugCollisionError to be thrown");
    } catch (caught) {
      const err = caught as SlugCollisionError;
      expect(err.message).toContain("foo bar");
      expect(err.message).toContain("foo-bar");
      expect(err.message).toContain("foo-bar"); // canonical slug also referenced
    }
  });

  it("preserves the encounter order of names in the colliding pair", () => {
    try {
      assertUniqueSlugs([{ name: "Mi-HTTP" }, { name: "mi-http" }]);
      throw new Error("expected SlugCollisionError to be thrown");
    } catch (caught) {
      const err = caught as SlugCollisionError;
      expect(err.collidingNames[0]).toBe("Mi-HTTP");
      expect(err.collidingNames[1]).toBe("mi-http");
      expect(err.slug).toBe("mi-http");
    }
  });

  it("ignores trailing items after a collision is found (fail-fast)", () => {
    // The function is a hard-failure assertion: it throws on the first
    // collision and does not need to enumerate further pairs.
    expect(() => {
      assertUniqueSlugs([
        { name: "alpha" },
        { name: "Alpha" },
        { name: "beta" },
      ]);
    }).toThrow(SlugCollisionError);
  });
});

describe("SlugCollisionError", () => {
  it("is an instance of SlugCollisionError and Error", () => {
    const err = new SlugCollisionError("tm", ["tm", "TM"]);
    expect(err).toBeInstanceOf(SlugCollisionError);
    expect(err).toBeInstanceOf(Error);
  });

  it("has name 'SlugCollisionError'", () => {
    const err = new SlugCollisionError("tm", ["tm", "TM"]);
    expect(err.name).toBe("SlugCollisionError");
  });

  it("exposes the slug and collidingNames fields supplied to the constructor", () => {
    const err = new SlugCollisionError("foo-bar", ["foo bar", "foo-bar"]);
    expect(err.slug).toBe("foo-bar");
    expect(err.collidingNames).toEqual(["foo bar", "foo-bar"]);
  });

  it("can be caught and identified by name", () => {
    try {
      throw new SlugCollisionError("tm", ["tm", "TM"]);
    } catch (caught) {
      expect((caught as Error).name).toBe("SlugCollisionError");
    }
  });

  it("has a non-empty message string", () => {
    const err = new SlugCollisionError("tm", ["tm", "TM"]);
    expect(typeof err.message).toBe("string");
    expect(err.message.length).toBeGreaterThan(0);
  });
});
