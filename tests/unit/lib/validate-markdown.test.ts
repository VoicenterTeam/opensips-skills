import { describe, it, expect } from "vitest";
import {
  validateRenderedMarkdown,
  type MarkdownValidationResult,
} from "../../../scripts/lib/validate-markdown.js";

/**
 * Pull the array of issues for a specific rule out of a result. Returns
 * the union of errors and warnings — callers assert on which bucket via
 * `expect(result.ok)` separately.
 *
 * @param result - The validation result to scan.
 * @param rule - The kebab-case rule name to filter by.
 * @returns All issues whose rule matches.
 */
function issuesFor(
  result: MarkdownValidationResult,
  rule: string,
): { rule: string; line: number; message: string }[] {
  const errors = result.ok ? [] : result.errors;
  const warnings = result.warnings;
  return [...errors, ...warnings].filter((i) => i.rule === rule);
}

/**
 * Build a minimal valid Markdown content string used as a baseline.
 * Tests that want to introduce a single rule violation start from this
 * string and append/replace one piece.
 *
 * @returns A baseline content string with one H1 plus one non-empty H2.
 */
const baselineContent = (): string =>
  "# Title\n\nLead paragraph.\n\n## Section One\n\nBody text.\n";

describe("validateRenderedMarkdown — single-h1 rule", () => {
  it("warns on two H1 lines (extra H1s are upstream prose, not structural)", () => {
    const content = "# First\n\nbody\n\n# Second\n\nmore\n";
    const result = validateRenderedMarkdown(content, "test.json");
    // Multiple H1s downgrade to warning; the file's first H1 is structural,
    // any extras are upstream-content prose noise (e.g. shell `# comment`
    // captions, LDAP example entries) that CLAUDE.md Rule 3 forbids
    // editing. Build does not fail on this.
    expect(result.ok).toBe(true);
    const warnings = issuesFor(result, "single-h1");
    expect(warnings.length).toBeGreaterThanOrEqual(1);
  });

  it("flags zero H1 lines as an error", () => {
    const content = "## No H1 here\n\nbody\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(false);
    expect(issuesFor(result, "single-h1").length).toBeGreaterThanOrEqual(1);
  });

  it("does not flag exactly one H1 line", () => {
    const result = validateRenderedMarkdown(baselineContent(), "test.json");
    expect(issuesFor(result, "single-h1")).toHaveLength(0);
  });

  it("does not count `#`-prefixed lines inside fenced code blocks as H1s", () => {
    // A real-world case: a Configuration Example contains shell-style
    // comments inside a fenced block. The fence-aware single-h1 rule
    // must skip those lines.
    const content =
      "# Title\n\nlead\n\n## Section\n\n```bash\n# this is a shell comment\n# another comment\n```\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "single-h1")).toHaveLength(0);
    expect(result.ok).toBe(true);
  });
});

describe("validateRenderedMarkdown — no-skipped-heading-level rule", () => {
  it("warns on H1 -> H3 directly (skipped levels come from upstream)", () => {
    const content = "# Title\n\nlead\n\n### Skipped H2\n\nbody\n";
    const result = validateRenderedMarkdown(content, "test.json");
    // Skip-level violations downgrade to warnings: in practice the only
    // sources are upstream prose fields whose own DocBook-derived heading
    // numbering produces deep `####` captions under our wrapping `## H2`,
    // and CLAUDE.md Rule 3 forbids editing that content.
    expect(result.ok).toBe(true);
    expect(issuesFor(result, "no-skipped-heading-level").length).toBeGreaterThanOrEqual(1);
  });

  it("warns on H2 -> H4 directly", () => {
    const content =
      "# Title\n\nlead\n\n## Section\n\nbody\n\n#### Skipped H3\n\ndeeper\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(true);
    expect(issuesFor(result, "no-skipped-heading-level").length).toBeGreaterThanOrEqual(1);
  });

  it("does not flag H1 -> H2 -> H3 -> H4", () => {
    const content =
      "# Title\n\n## H2\n\n### H3\n\n#### H4\n\nbody\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "no-skipped-heading-level")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — no-empty-h2 rule", () => {
  it("flags an H2 with no body before the next heading", () => {
    const content =
      "# Title\n\nlead\n\n## Empty\n\n## Next\n\nbody\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(false);
    const issues = issuesFor(result, "no-empty-h2");
    expect(issues.length).toBeGreaterThanOrEqual(1);
    // Heading "## Empty" is on line 5 (1-based).
    expect(issues[0]?.line).toBe(5);
  });

  it("does not flag an H2 with prose content before the next heading", () => {
    const content =
      "# Title\n\nlead\n\n## Has Content\n\nstuff\n\n## Next\n\nmore\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "no-empty-h2")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — no-unclosed-code-fence rule", () => {
  it("flags an odd number of fence lines as an error", () => {
    // 3 fence lines: opens, closes, opens (never closes).
    const content =
      "# Title\n\n## S\n\n```js\nfoo\n```\n\nbetween\n\n```js\nbar\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(false);
    expect(issuesFor(result, "no-unclosed-code-fence").length).toBeGreaterThanOrEqual(1);
  });

  it("does not flag an even (balanced) number of fences", () => {
    const content =
      "# Title\n\n## S\n\n```js\nfoo\n```\n\nbetween\n\n```js\nbar\n```\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "no-unclosed-code-fence")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — no-unclosed-inline-backticks rule", () => {
  it("warns on a line with an odd number of backticks", () => {
    const content = "# Title\n\n## S\n\nThis line has one ` orphan backtick.\n";
    const result = validateRenderedMarkdown(content, "test.json");
    // It's a warning, not an error: the content might still be ok.
    expect(issuesFor(result, "no-unclosed-inline-backticks").length).toBeGreaterThanOrEqual(1);
  });

  it("does not warn on lines with paired backticks", () => {
    const content =
      "# Title\n\n## S\n\nThis line has `paired` backticks.\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "no-unclosed-inline-backticks")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — no-empty-markdown-link rule", () => {
  it("flags [text]() (empty href) as an error", () => {
    const content = "# Title\n\n## S\n\nSee [the docs]() for more.\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(false);
    expect(issuesFor(result, "no-empty-markdown-link").length).toBeGreaterThanOrEqual(1);
  });

  it("flags [](url) (empty text) as an error", () => {
    const content = "# Title\n\n## S\n\nSee [](https://example.com) here.\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(false);
    expect(issuesFor(result, "no-empty-markdown-link").length).toBeGreaterThanOrEqual(1);
  });

  it("does not flag a complete [text](url) link", () => {
    const content =
      "# Title\n\n## S\n\nSee [the docs](https://example.com) for more.\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "no-empty-markdown-link")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — no-extraneous-html rule", () => {
  it("warns on a <div> tag in body content (upstream prose is not editable)", () => {
    const content = "# Title\n\n## S\n\n<div>not allowed</div>\n";
    const result = validateRenderedMarkdown(content, "test.json");
    // HTML-tag-shaped sequences in body content are warnings, not errors.
    // Upstream OpenSIPs prose contains literary `<placeholder>` tokens,
    // embedded XML samples, and shorthand notations like `<order, pref>`
    // that look like HTML to a regex but are not. CLAUDE.md Rule 3
    // forbids editing the content; the build does not fail on these.
    expect(result.ok).toBe(true);
    expect(issuesFor(result, "no-extraneous-html").length).toBeGreaterThanOrEqual(1);
  });

  it("does not flag the provenance HTML comment", () => {
    const content =
      "# Title\n<!-- generated-from: source/3.6/modules/tm.json\n" +
      "     generator-version: 1.0.0\n" +
      "     opensips-version: 3.6\n" +
      "     doc-type: module -->\n\nlead\n\n## S\n\nbody\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "no-extraneous-html")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — no-trailing-whitespace rule", () => {
  it("emits exactly one warning that names the count of affected lines", () => {
    // Three lines with trailing spaces.
    const content =
      "# Title   \n\n## S\n\nbody   \n\nmore  \n";
    const result = validateRenderedMarkdown(content, "test.json");
    const issues = issuesFor(result, "no-trailing-whitespace");
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toMatch(/3/);
  });

  it("does not warn when no lines have trailing whitespace", () => {
    const result = validateRenderedMarkdown(baselineContent(), "test.json");
    expect(issuesFor(result, "no-trailing-whitespace")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — no-excess-blank-lines rule", () => {
  it("flags 3 or more consecutive blank lines as an error", () => {
    const content = "# Title\n\n\n\n## S\n\nbody\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(false);
    expect(issuesFor(result, "no-excess-blank-lines").length).toBeGreaterThanOrEqual(1);
  });

  it("does not flag two consecutive blank lines (the standard separator)", () => {
    const content = "# Title\n\n\n## S\n\nbody\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "no-excess-blank-lines")).toHaveLength(0);
  });
});

describe("validateRenderedMarkdown — length thresholds", () => {
  it("warns when content has more than warnLines (default 1200)", () => {
    // Build a ~1300-line content with a single H1 and one non-empty H2.
    // Default warn threshold is now 1200 (the rendering-templates §6.1
    // soft limit); the hard error threshold is 5000 since the v1 build
    // does not yet split long modules.
    const filler = Array.from({ length: 1295 }, (_, i) => `Line ${i + 1}.`).join("\n");
    const content = `# Title\n\n## S\n\n${filler}\n`;
    const result = validateRenderedMarkdown(content, "test.json");
    const warnings = issuesFor(result, "length-warn");
    expect(warnings.length).toBeGreaterThanOrEqual(1);
    // No length-error at this threshold.
    expect(issuesFor(result, "length-error")).toHaveLength(0);
  });

  it("does not warn at 800 lines (below the 1200-line warn threshold)", () => {
    const filler = Array.from({ length: 795 }, (_, i) => `Line ${i + 1}.`).join("\n");
    const content = `# Title\n\n## S\n\n${filler}\n`;
    const result = validateRenderedMarkdown(content, "test.json");
    expect(issuesFor(result, "length-warn")).toHaveLength(0);
    expect(issuesFor(result, "length-error")).toHaveLength(0);
  });

  it("errors when content has more than maxLines (default 5000)", () => {
    const filler = Array.from({ length: 5095 }, (_, i) => `Line ${i + 1}.`).join("\n");
    const content = `# Title\n\n## S\n\n${filler}\n`;
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(false);
    expect(issuesFor(result, "length-error").length).toBeGreaterThanOrEqual(1);
  });

  it("respects an explicit maxLines override", () => {
    const filler = Array.from({ length: 195 }, (_, i) => `Line ${i + 1}.`).join("\n");
    const content = `# Title\n\n## S\n\n${filler}\n`;
    const result = validateRenderedMarkdown(content, "test.json", {
      maxLines: 100,
      warnLines: 50,
    });
    expect(result.ok).toBe(false);
    expect(issuesFor(result, "length-error").length).toBeGreaterThanOrEqual(1);
  });
});

describe("validateRenderedMarkdown — topLevelItemHeading option", () => {
  it("treats core-style files (H1 -> H2 items) as ok with option=2", () => {
    const content =
      "# Title\n\nlead\n\n## Item One\n\nfoo\n\n## Item Two\n\nbar\n";
    const result = validateRenderedMarkdown(content, "test.json", {
      topLevelItemHeading: 2,
    });
    // No skipped-level errors.
    expect(issuesFor(result, "no-skipped-heading-level")).toHaveLength(0);
    expect(result.ok).toBe(true);
  });

  it("still warns on H2 -> H4 as a skip in core mode", () => {
    const content =
      "# Title\n\n## Item One\n\nfoo\n\n#### Skipped H3\n\nbar\n";
    const result = validateRenderedMarkdown(content, "test.json", {
      topLevelItemHeading: 2,
    });
    // Skip-level violations are warnings (see no-skipped-heading-level
    // rule rationale); the file remains ok=true so the build does not
    // fail on upstream-content heading drift.
    expect(result.ok).toBe(true);
    expect(issuesFor(result, "no-skipped-heading-level").length).toBeGreaterThanOrEqual(1);
  });
});

describe("validateRenderedMarkdown — clean baseline", () => {
  it("returns ok=true with no issues for a small valid document", () => {
    const result = validateRenderedMarkdown(baselineContent(), "test.json");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
    }
  });

  it("returns ok=true for a realistic module-style document", () => {
    const content =
      "# tm Module Reference\n" +
      "<!-- generated-from: source/3.6/modules/tm.json\n" +
      "     generator-version: 0.1.0\n" +
      "     opensips-version: 3.6\n" +
      "     doc-type: module -->\n" +
      "\n" +
      "Lead paragraph describing the module.\n" +
      "\n" +
      "## Contents\n" +
      "\n" +
      "- [Overview](#overview)\n" +
      "- [Exported Parameters](#exported-parameters)\n" +
      "\n" +
      "## Overview\n" +
      "\n" +
      "This module does things.\n" +
      "\n" +
      "## Exported Parameters\n" +
      "\n" +
      "### `fr_timeout` (integer)\n" +
      "\n" +
      "Final reply timeout.\n" +
      "\n" +
      "*Default value is 30 seconds.*\n" +
      "\n" +
      "**Example.** Set the timeout.\n" +
      "\n" +
      "```opensips\n" +
      "modparam(\"tm\", \"fr_timeout\", 10)\n" +
      "```\n";
    const result = validateRenderedMarkdown(content, "test.json");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warnings).toHaveLength(0);
    }
  });
});
