import { describe, it, expect } from "vitest";
import { sanitizeRenderedText } from "../../../scripts/lib/sanitize.js";

describe("sanitizeRenderedText", () => {
  it("returns an empty string unchanged", () => {
    expect(sanitizeRenderedText("")).toBe("");
  });

  it("returns plain ASCII text unchanged", () => {
    const text = "The dialog module exports default_timeout.";
    expect(sanitizeRenderedText(text)).toBe(text);
  });

  it("preserves legitimate Unicode punctuation (em dash, smart quotes, NBSP)", () => {
    const text = "Section 1.1.2, “Registration” — see notes.";
    expect(sanitizeRenderedText(text)).toBe(text);
  });

  it("strips U+FFFD replacement characters in DocBook-derived anchors", () => {
    expect(sanitizeRenderedText("1.6.5.�default_timeout")).toBe("1.6.5.default_timeout");
  });

  it("strips multiple consecutive U+FFFD characters", () => {
    expect(sanitizeRenderedText("a��b")).toBe("ab");
  });

  it("strips U+200B zero-width spaces", () => {
    expect(sanitizeRenderedText("area of ​​the caller")).toBe("area of the caller");
  });

  it("replaces escaped underscores with plain underscores", () => {
    expect(sanitizeRenderedText("default\\_timeout")).toBe("default_timeout");
  });

  it("replaces every escaped underscore in a string", () => {
    expect(sanitizeRenderedText("a\\_b\\_c")).toBe("a_b_c");
  });

  it("does not affect double backslashes (literal `\\n` in C strings)", () => {
    expect(sanitizeRenderedText('printf("hello\\\\n");')).toBe('printf("hello\\\\n");');
  });

  it("leaves other escape sequences (\\*, \\[, \\.) untouched", () => {
    const text = "regex: 10\\.0\\.5\\.[0-9]\\* matches \\[ip\\]";
    expect(sanitizeRenderedText(text)).toBe(text);
  });

  it("is idempotent: sanitize(sanitize(x)) === sanitize(x)", () => {
    const dirty = "Header 1.6.5.�name\\_x with​invisible.";
    const once = sanitizeRenderedText(dirty);
    const twice = sanitizeRenderedText(once);
    expect(twice).toBe(once);
  });

  it("composes all three substitutions in a single pass", () => {
    const dirty = "1.6.5.�default\\_timeout​ end";
    expect(sanitizeRenderedText(dirty)).toBe("1.6.5.default_timeout end");
  });
});
