import { describe, it, expect } from "vitest";
import {
  renderH1,
  renderH2,
  renderH3,
  renderH4,
  renderItalic,
  renderBold,
  renderInlineCode,
  renderCodeBlock,
  renderBulletList,
  renderPropertyList,
  renderSection,
  renderLeadParagraph,
  renderTOC,
  toAnchor,
} from "../../../scripts/lib/markdown-builders.js";

describe("renderH1", () => {
  it("renders a single H1 with one trailing newline", () => {
    expect(renderH1("Title")).toBe("# Title\n");
  });

  it("ends with exactly one trailing newline (not two)", () => {
    const out = renderH1("Title");
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderH2", () => {
  it("renders an H2 with two hashes and one trailing newline", () => {
    expect(renderH2("Section")).toBe("## Section\n");
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderH2("Section");
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderH3", () => {
  it("renders an H3 with three hashes and one trailing newline", () => {
    expect(renderH3("Sub")).toBe("### Sub\n");
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderH3("Sub");
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderH4", () => {
  it("renders an H4 with four hashes and one trailing newline", () => {
    expect(renderH4("Item")).toBe("#### Item\n");
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderH4("Item");
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderItalic", () => {
  it("wraps text in single asterisks", () => {
    expect(renderItalic("foo")).toBe("*foo*");
  });

  it("does not append a trailing newline (inline span)", () => {
    expect(renderItalic("foo").endsWith("\n")).toBe(false);
  });
});

describe("renderBold", () => {
  it("wraps text in double asterisks", () => {
    expect(renderBold("foo")).toBe("**foo**");
  });

  it("does not append a trailing newline (inline span)", () => {
    expect(renderBold("foo").endsWith("\n")).toBe(false);
  });
});

describe("renderInlineCode", () => {
  it("wraps text in single backticks", () => {
    expect(renderInlineCode("$var")).toBe("`$var`");
  });

  it("does not append a trailing newline (inline span)", () => {
    expect(renderInlineCode("x").endsWith("\n")).toBe(false);
  });
});

describe("renderCodeBlock", () => {
  it("renders a fenced bash block with one trailing newline", () => {
    expect(renderCodeBlock("hello", "bash")).toBe("```bash\nhello\n```\n");
  });

  it("renders an untagged fence when no language is supplied", () => {
    expect(renderCodeBlock("x = 1")).toBe("```\nx = 1\n```\n");
  });

  it("uses the opensips language tag when specified", () => {
    const out = renderCodeBlock("$var(name) = 1", "opensips");
    expect(out).toBe("```opensips\n$var(name) = 1\n```\n");
    expect(out.startsWith("```opensips\n")).toBe(true);
  });

  it("preserves internal newlines in multi-line content", () => {
    const content = "line one\nline two\nline three";
    const out = renderCodeBlock(content, "text");
    expect(out).toBe("```text\nline one\nline two\nline three\n```\n");
  });

  it("ends with exactly one trailing newline", () => {
    const out = renderCodeBlock("body", "bash");
    expect(out.endsWith("\n")).toBe(true);
    expect(out.endsWith("\n\n")).toBe(false);
  });
});

describe("renderBulletList", () => {
  it("renders a multi-item list with one trailing newline overall", () => {
    expect(renderBulletList(["a", "b"])).toBe("- a\n- b\n");
  });

  it("returns an empty string for an empty array", () => {
    expect(renderBulletList([])).toBe("");
  });

  it("renders a single-item list with one trailing newline", () => {
    expect(renderBulletList(["only"])).toBe("- only\n");
  });
});

describe("renderPropertyList", () => {
  it("renders bold-key bulleted properties", () => {
    expect(
      renderPropertyList([
        { key: "Type", value: "integer" },
        { key: "R/W", value: "read-only" },
      ]),
    ).toBe("- **Type:** integer\n- **R/W:** read-only\n");
  });

  it("returns an empty string for an empty array", () => {
    expect(renderPropertyList([])).toBe("");
  });
});

describe("renderSection", () => {
  it("renders an H2 + body block with two trailing newlines", () => {
    expect(renderSection("Overview", "Some prose.")).toBe(
      "## Overview\n\nSome prose.\n\n",
    );
  });

  it("returns an empty string when the body is empty", () => {
    expect(renderSection("Empty", "")).toBe("");
  });

  it("returns an empty string when the body is only whitespace", () => {
    expect(renderSection("Whitespace", "   \n  \t\n")).toBe("");
  });

  it("a non-empty section ends with two trailing newlines", () => {
    const out = renderSection("Heading", "Body");
    expect(out.endsWith("\n\n")).toBe(true);
    expect(out.endsWith("\n\n\n")).toBe(false);
  });
});

describe("renderLeadParagraph", () => {
  it("appends a single trailing blank line (two newlines total)", () => {
    expect(renderLeadParagraph("This file is for...")).toBe(
      "This file is for...\n\n",
    );
  });
});

describe("renderTOC", () => {
  it("returns an empty string when there are no entries", () => {
    expect(renderTOC([])).toBe("");
  });

  it("renders a Contents heading followed by anchor links", () => {
    expect(
      renderTOC([
        { label: "Overview", anchor: "overview" },
        { label: "Functions", anchor: "exported-functions" },
      ]),
    ).toBe(
      "## Contents\n\n- [Overview](#overview)\n- [Functions](#exported-functions)\n\n",
    );
  });
});

describe("toAnchor", () => {
  it("lowercases and hyphenates a multi-word heading", () => {
    expect(toAnchor("Exported Functions")).toBe("exported-functions");
  });

  it("strips non-alphanumeric characters and collapses runs", () => {
    expect(toAnchor("$var(name) Variable")).toBe("varname-variable");
  });

  it("collapses multiple spaces and punctuation", () => {
    expect(toAnchor("Hello   World!!")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(toAnchor("---leading-and-trailing---")).toBe("leading-and-trailing");
  });
});
