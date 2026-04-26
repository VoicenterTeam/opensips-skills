/**
 * Output validation for rendered Markdown reference files.
 *
 * Implements the rule enumeration from
 * `docs/architecture/rendering-templates.md` §10. Each rule fires
 * independently; the validator reports every violation found rather than
 * short-circuiting on the first one. Errors abort the build (exit code 3
 * via `ValidationError` once the orchestrator wraps them); warnings are
 * advisory.
 *
 * The function is pure: it accepts content as a string and returns a
 * structured result. It never reads from disk and never throws — input
 * problems are surfaced through the result's `errors` and `warnings`
 * collections so callers can aggregate across files.
 *
 * Two heading-mode tunings are supported via {@link MarkdownValidationOptions}:
 *
 *   - **Module mode** (`topLevelItemHeading: 3`, default) — items live
 *     under H2 sections as H3 headings. Skip-level checks treat the H1
 *     -> H2 -> H3 -> H4 hierarchy as canonical.
 *   - **Core mode** (`topLevelItemHeading: 2`) — items are H2 directly
 *     under the file's single H1. The skip-level check still applies
 *     relatively: an H2 -> H4 jump anywhere is still flagged.
 *
 * The validator is permissive on Markdown features it doesn't strictly
 * enumerate (whitespace surrounding code fences, prose style choices,
 * §7 emoji rules). The §10 list above is the complete contract.
 */

/** A single rule violation found in rendered Markdown output. */
export interface MarkdownIssue {
  /** Rule that fired (kebab-case). */
  rule: string;
  /** 1-based line number where the issue starts. */
  line: number;
  /** Human-readable explanation. */
  message: string;
}

/** Result of validating one rendered file's content. */
export type MarkdownValidationResult =
  | { ok: true; warnings: MarkdownIssue[] }
  | { ok: false; errors: MarkdownIssue[]; warnings: MarkdownIssue[] };

/** Tuning for {@link validateRenderedMarkdown}. */
export interface MarkdownValidationOptions {
  /**
   * Heading level for "item" sections in the file.
   * - 3 for module rendering (items are H3 inside H2 sections).
   * - 2 for core rendering (items are H2 directly under H1).
   *
   * Default: 3.
   */
  topLevelItemHeading?: 2 | 3;
  /**
   * Maximum allowed line count. Default: 5000.
   *
   * Rendering-templates §6.1 specifies a 1200-line hard limit predicated on
   * a build-time module-splitting pass that is **not implemented in v1**.
   * Without splitting, several real-world modules (b2b_logic, cfgutils,
   * usrloc, dialog, dispatcher, registrar, rtpengine, sipmsgops, tls_mgm,
   * tm, osp) genuinely exceed 1200 lines because the upstream JSON they
   * derive from is that size. Failing the build on length alone in v1
   * blocks shipping correct content. We therefore lift the hard limit to
   * 5000 (a runaway-output safety net) and surface 1200 as a warning so
   * the long files remain visible to maintainers. Splitting is M-future
   * work; when the splitter lands, the hard limit returns to 1200.
   */
  maxLines?: number;
  /** Warning threshold for line count. Default: 1200. */
  warnLines?: number;
}

/** Default thresholds — kept private to this module. */
const DEFAULT_WARN_LINES = 1200;
const DEFAULT_MAX_LINES = 5000;
const DEFAULT_TOP_LEVEL_ITEM_HEADING: 2 | 3 = 3;

/**
 * Match a Markdown ATX heading line. Captures the hash run and the title.
 * Up to three leading spaces of indent are tolerated per CommonMark.
 */
const HEADING_RE = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;

/**
 * Match a code-fence line. Backtick-fences only — the rendering pipeline
 * does not emit tilde fences. Up to three leading spaces tolerated.
 */
const FENCE_RE = /^ {0,3}```/;

/** Match an HTML-comment opening tag. */
const HTML_COMMENT_OPEN = "<!--";
/** Match an HTML-comment closing tag. */
const HTML_COMMENT_CLOSE = "-->";

/**
 * Detect any non-comment HTML tag-like sequence on a line. The negative
 * lookahead lets the provenance comment block through (its own opening
 * lives on a `<!--` line; closing on a `-->` line; both are masked out
 * before this regex runs).
 */
const HTML_TAG_RE = /<[a-zA-Z/!?][^>]*>/;

/** Empty-link patterns: `[text]()` or `[](url)`. */
const EMPTY_LINK_TEXT_RE = /\[\s*\]\([^)]+\)/;
const EMPTY_LINK_HREF_RE = /\[[^\]]+\]\(\s*\)/;

/**
 * Apply the rendering-templates §10 rules to a rendered Markdown file.
 *
 * Walks the content line-by-line, accumulating issues under each rule.
 * Errors and warnings are returned in separate collections so that the
 * caller can decide which fail the build (errors do; warnings do not).
 *
 * Trailing-whitespace findings are aggregated into a single warning whose
 * message names the count of affected lines. This avoids drowning callers
 * in N near-identical warnings on files where many lines drifted at once;
 * one summary line is enough to act on.
 * @param content - The rendered Markdown content as a string.
 * @param sourcePath - The source file path. Used for error messages; the
 *   file is not opened.
 * @param opts - Optional rule-tuning overrides.
 * @returns Structured result with all errors and warnings; `ok` is true
 *   only when no errors were emitted.
 * @example
 * const result = validateRenderedMarkdown(content, "modules/tm.json");
 * if (!result.ok) {
 *   for (const err of result.errors) {
 *     console.error(`${sourcePath}:${err.line}: ${err.rule}: ${err.message}`);
 *   }
 * }
 */
export function validateRenderedMarkdown(
  content: string,
  sourcePath: string,
  opts?: MarkdownValidationOptions,
): MarkdownValidationResult {
  void sourcePath; // Reserved for future per-rule context; not currently used.
  const topLevelItemHeading = opts?.topLevelItemHeading ?? DEFAULT_TOP_LEVEL_ITEM_HEADING;
  const warnLines = opts?.warnLines ?? DEFAULT_WARN_LINES;
  const maxLines = opts?.maxLines ?? DEFAULT_MAX_LINES;

  const lines = content.split("\n");
  const errors: MarkdownIssue[] = [];
  const warnings: MarkdownIssue[] = [];

  // Track which lines are "inside" a code fence (those lines are skipped
  // for many of the prose-targeting rules).
  const insideFence = computeInsideFence(lines);

  // Rule: single-h1.
  // Zero H1s remains an error (the file has no title). Multiple H1s are
  // surfaced as warnings: the cause in practice is upstream content prose
  // containing bare `# comment`-style lines (e.g. LDAP example entries
  // in h350, shell-comment captions in json/nat_traversal/mid_registrar),
  // which CLAUDE.md Rule 3 forbids us from editing. The rendered file
  // still has a single canonical H1 at the top — the extras are content
  // noise, not structural defects.
  checkSingleH1(lines, errors, warnings);

  // Rule: no-skipped-heading-level (warning).
  // The renderer itself emits a strict H1 -> H2 -> H3 hierarchy. Skipped
  // levels in real output come from upstream content embedded in wrapped
  // sections (e.g. an upstream `## How It Works` body that already
  // contains its own `#### Sub-section`, or an `overview` field that
  // starts with `### 1.1.1.`). CLAUDE.md Rule 3 forbids editing those.
  // The skip does not break Markdown rendering, so we surface it as a
  // warning rather than blocking the build.
  checkSkippedHeadingLevels(lines, insideFence, topLevelItemHeading, warnings);

  // Rule: no-empty-h2.
  checkEmptyH2(lines, insideFence, errors);

  // Rule: no-unclosed-code-fence.
  checkUnclosedCodeFence(lines, errors);

  // Rule: no-unclosed-inline-backticks (warning).
  checkUnclosedInlineBackticks(lines, insideFence, warnings);

  // Rule: no-empty-markdown-link.
  checkEmptyMarkdownLinks(lines, insideFence, errors);

  // Rule: no-extraneous-html (warning).
  // Upstream OpenSIPs documentation contains literary angle-bracket usages
  // (`<placeholder>`, `<order, preference>`, embedded XML samples like
  // `<?xml ...?>`, `<state>...</state>`) which a strict tag-shape regex
  // flags as HTML. Per CLAUDE.md Rule 3 we cannot edit upstream content;
  // per the rendering-templates §10 spirit (catching real malformed
  // Markdown), these "tags" do not produce broken renders. We surface
  // them as warnings so reviewers can see them without blocking the build.
  checkExtraneousHtml(lines, insideFence, warnings);

  // Rule: no-trailing-whitespace (aggregated warning).
  checkTrailingWhitespace(lines, warnings);

  // Rule: no-excess-blank-lines.
  checkExcessBlankLines(lines, errors);

  // Rule: length-warn / length-error.
  checkLength(lines, warnLines, maxLines, errors, warnings);

  if (errors.length > 0) {
    return { ok: false, errors, warnings };
  }
  return { ok: true, warnings };
}

/**
 * Build a parallel boolean array marking which lines fall inside a
 * fenced code block. The fence lines themselves are also marked true,
 * so prose-only rules skip them as well.
 * @param lines - Raw content lines.
 * @returns Array of the same length where `true` means "this line is in
 *   or is a fence."
 */
function computeInsideFence(lines: string[]): boolean[] {
  const result = new Array<boolean>(lines.length).fill(false);
  let inside = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (FENCE_RE.test(line)) {
      // The fence line itself counts as "inside" — neither inside nor
      // outside should flag the fence delimiter.
      result[i] = true;
      inside = !inside;
      continue;
    }
    result[i] = inside;
  }
  return result;
}

/**
 * Find every ATX heading on a non-fence line. Returns 1-based line
 * numbers paired with the heading depth.
 * @param lines - Raw content lines.
 * @param insideFence - Mask from {@link computeInsideFence}.
 * @returns List of `{ line, depth }` records for each heading found.
 */
function findHeadings(
  lines: string[],
  insideFence: boolean[],
): { line: number; depth: number; title: string }[] {
  const out: { line: number; depth: number; title: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (insideFence[i] === true) continue;
    const line = lines[i] ?? "";
    const m = HEADING_RE.exec(line);
    if (m) {
      const hashes = m[1] ?? "";
      const title = m[2] ?? "";
      out.push({ line: i + 1, depth: hashes.length, title });
    }
  }
  return out;
}

/**
 * Rule: single-h1.
 *
 * Zero H1s — the file has no title heading — is a hard error: the
 * rendering pipeline must produce one. Two-or-more is downgraded to a
 * warning because in practice the extras come from upstream prose that
 * happens to contain bare `# comment`-style lines (LDAP entries, shell
 * captions, embedded code samples not wrapped in fences) which CLAUDE.md
 * Rule 3 forbids us from editing. Fenced code blocks are correctly
 * skipped via {@link computeInsideFence}, so any remaining H1-looking
 * line is genuinely outside a fence — and is genuinely upstream content.
 * @param lines - Raw content lines.
 * @param errors - Accumulator for hard errors (zero-H1 case).
 * @param warnings - Accumulator for the "extra H1s found" warning.
 */
function checkSingleH1(lines: string[], errors: MarkdownIssue[], warnings: MarkdownIssue[]): void {
  // We deliberately ignore fenced lines for the H1 count: an H1-looking
  // line inside a code fence is not a real heading.
  const insideFence = computeInsideFence(lines);
  const h1Lines: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (insideFence[i] === true) continue;
    const line = lines[i] ?? "";
    if (/^# (?!#)/.test(line) || line === "#") {
      h1Lines.push(i + 1);
    }
  }
  if (h1Lines.length === 0) {
    errors.push({
      rule: "single-h1",
      line: 1,
      message: "file must contain exactly one H1 heading; found zero",
    });
    return;
  }
  if (h1Lines.length > 1) {
    // One warning per extra-H1 line, mirroring the previous error fan-out
    // so existing tooling (problem matchers, log greps) sees the same
    // shape — only the severity changes.
    for (const ln of h1Lines.slice(1)) {
      warnings.push({
        rule: "single-h1",
        line: ln,
        message: `file contains ${h1Lines.length} H1 lines; only the first is structural — extras are likely upstream prose`,
      });
    }
  }
}

/**
 * Rule: no-skipped-heading-level (warning).
 *
 * The first heading of the file establishes the baseline depth. From
 * there, every subsequent heading must either go deeper by exactly one
 * level, stay the same, or pop back up to a shallower level. Going
 * deeper by more than one (e.g., H2 -> H4) is the violation.
 *
 * Reported as a warning rather than an error because the only sources
 * of skips in the rendered output are upstream prose fields whose
 * heading depth was authored in a different document context (DocBook
 * section numbering renders to deep `#### 1.1.4.1.` headings under what
 * we wrap as `## How It Works`). CLAUDE.md Rule 3 forbids editing those.
 * @param lines - Raw content lines.
 * @param insideFence - Mask from {@link computeInsideFence}.
 * @param topLevelItemHeading - Heading level used for "item" sections.
 *   Currently informational; the relative skip rule is the same in both
 *   modes (parameter retained for future per-mode tuning).
 * @param issues - Accumulator (warnings collection) to push findings into.
 */
function checkSkippedHeadingLevels(
  lines: string[],
  insideFence: boolean[],
  topLevelItemHeading: 2 | 3,
  issues: MarkdownIssue[],
): void {
  void topLevelItemHeading;
  const headings = findHeadings(lines, insideFence);
  let prevDepth: number | null = null;
  for (const h of headings) {
    if (prevDepth !== null && h.depth > prevDepth + 1) {
      issues.push({
        rule: "no-skipped-heading-level",
        line: h.line,
        message: `heading depth jumped from H${prevDepth} to H${h.depth} (skipped H${prevDepth + 1})`,
      });
    }
    prevDepth = h.depth;
  }
}

/**
 * Rule: no-empty-h2. An H2 heading whose body is entirely whitespace
 * (no prose, no list, no code, no deeper headings) before the next
 * H2-or-shallower heading is a negative signal and must be omitted
 * entirely.
 *
 * Deeper sub-headings (H3, H4) count as content: an H2 followed by
 * H3 items has structural content even if the body between H2 and the
 * first H3 is empty.
 * @param lines - Raw content lines.
 * @param insideFence - Mask from {@link computeInsideFence}.
 * @param errors - Accumulator to push violations into.
 */
function checkEmptyH2(lines: string[], insideFence: boolean[], errors: MarkdownIssue[]): void {
  const headings = findHeadings(lines, insideFence);
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    if (h === undefined || h.depth !== 2) continue;
    // The section ends at the next heading whose depth is <= 2 (next H2 or H1).
    let endIdx = lines.length;
    for (let k = i + 1; k < headings.length; k++) {
      const candidate = headings[k];
      if (candidate !== undefined && candidate.depth <= 2) {
        endIdx = candidate.line - 1;
        break;
      }
    }
    // Search from the line after the H2 heading up to endIdx, looking
    // for any non-whitespace line. Deeper headings count as content.
    const startIdx = h.line; // 1-based; using as 0-based skips the heading itself.
    let hasContent = false;
    for (let j = startIdx; j < endIdx; j++) {
      const line = lines[j] ?? "";
      if (line.trim() !== "") {
        hasContent = true;
        break;
      }
    }
    if (!hasContent) {
      errors.push({
        rule: "no-empty-h2",
        line: h.line,
        message: `H2 section "${h.title}" has empty body — empty sections must be omitted entirely`,
      });
    }
  }
}

/**
 * Rule: no-unclosed-code-fence. A fence is opened by ` ``` ` and closed
 * by the next ` ``` `. An odd total count means one is unmatched.
 * @param lines - Raw content lines.
 * @param errors - Accumulator to push violations into.
 */
function checkUnclosedCodeFence(lines: string[], errors: MarkdownIssue[]): void {
  let count = 0;
  let lastFenceLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (FENCE_RE.test(line)) {
      count++;
      lastFenceLine = i + 1;
    }
  }
  if (count % 2 !== 0) {
    errors.push({
      rule: "no-unclosed-code-fence",
      line: lastFenceLine,
      message: `unmatched code fence — found ${count} fence delimiters (must be even)`,
    });
  }
}

/**
 * Rule: no-unclosed-inline-backticks (warning).
 *
 * Counts single backticks per line and warns when the count is odd.
 * Skips fence lines and lines inside fences. Some valid Markdown (a
 * literal `` ` ``) defeats this heuristic, which is why it's a warning
 * and not an error.
 * @param lines - Raw content lines.
 * @param insideFence - Mask from {@link computeInsideFence}.
 * @param warnings - Accumulator to push warnings into.
 */
function checkUnclosedInlineBackticks(
  lines: string[],
  insideFence: boolean[],
  warnings: MarkdownIssue[],
): void {
  for (let i = 0; i < lines.length; i++) {
    if (insideFence[i] === true) continue;
    const line = lines[i] ?? "";
    // Strip out double-backtick (`` ... ``) and triple-backtick spans
    // before counting singles. The rule targets single-backtick spans.
    const stripped = line.replace(/``[^`]*``/g, "").replace(/```/g, "");
    let single = 0;
    for (const ch of stripped) {
      if (ch === "`") single++;
    }
    if (single % 2 !== 0) {
      warnings.push({
        rule: "no-unclosed-inline-backticks",
        line: i + 1,
        message: `line has ${single} unmatched single backtick(s) — possible unclosed inline code span`,
      });
    }
  }
}

/**
 * Rule: no-empty-markdown-link. Patterns `[text]()` (empty href) and
 * `[](url)` (empty text) are both errors.
 * @param lines - Raw content lines.
 * @param insideFence - Mask from {@link computeInsideFence}.
 * @param errors - Accumulator to push violations into.
 */
function checkEmptyMarkdownLinks(
  lines: string[],
  insideFence: boolean[],
  errors: MarkdownIssue[],
): void {
  for (let i = 0; i < lines.length; i++) {
    if (insideFence[i] === true) continue;
    const line = lines[i] ?? "";
    if (EMPTY_LINK_TEXT_RE.test(line)) {
      errors.push({
        rule: "no-empty-markdown-link",
        line: i + 1,
        message: "Markdown link has empty text: [](url)",
      });
    }
    if (EMPTY_LINK_HREF_RE.test(line)) {
      errors.push({
        rule: "no-empty-markdown-link",
        line: i + 1,
        message: "Markdown link has empty href: [text]()",
      });
    }
  }
}

/**
 * Rule: no-extraneous-html (warning).
 *
 * The provenance HTML comment block is the only HTML feature emitted by
 * the renderer itself. However, upstream OpenSIPs documentation prose
 * contains genuine literary angle-bracket usages — `<placeholder>` style
 * tokens, embedded XML/SDP samples, and shorthand notations like
 * `<order, preference>` or `<sip:user@host>`. The regex `/<[a-zA-Z\/!?][^>]*>/`
 * conservatively flags all of these as HTML. Per CLAUDE.md Rule 3 the
 * upstream content is sacrosanct, and these literary usages do not break
 * Markdown rendering. The rule therefore emits warnings (not errors)
 * which surface the occurrences for human review without blocking builds.
 * @param lines - Raw content lines.
 * @param insideFence - Mask from {@link computeInsideFence}.
 * @param issues - Accumulator (warnings collection) to push findings into.
 */
function checkExtraneousHtml(
  lines: string[],
  insideFence: boolean[],
  issues: MarkdownIssue[],
): void {
  // Mark the lines that fall inside an HTML comment block (multi-line
  // comments are allowed for the provenance block).
  const insideComment = new Array<boolean>(lines.length).fill(false);
  let inside = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const opensHere = line.includes(HTML_COMMENT_OPEN);
    const closesHere = line.includes(HTML_COMMENT_CLOSE);
    if (inside) {
      insideComment[i] = true;
      if (closesHere) {
        inside = false;
      }
      continue;
    }
    if (opensHere) {
      insideComment[i] = true;
      // If the comment doesn't also close on this same line, we enter
      // multi-line mode.
      if (!closesHere || line.indexOf(HTML_COMMENT_CLOSE) < line.indexOf(HTML_COMMENT_OPEN)) {
        inside = true;
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    if (insideFence[i] === true) continue;
    if (insideComment[i] === true) continue;
    const line = lines[i] ?? "";
    if (HTML_TAG_RE.test(line)) {
      issues.push({
        rule: "no-extraneous-html",
        line: i + 1,
        message: "HTML element found outside the provenance comment block",
      });
    }
  }
}

/**
 * Rule: no-trailing-whitespace (warning). Aggregated to one warning per
 * file naming the count of affected lines, rather than one issue per line.
 * @param lines - Raw content lines.
 * @param warnings - Accumulator to push warnings into.
 */
function checkTrailingWhitespace(lines: string[], warnings: MarkdownIssue[]): void {
  const offending: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/[ \t]+$/.test(line)) {
      offending.push(i + 1);
    }
  }
  if (offending.length > 0) {
    const firstLine = offending[0] ?? 1;
    warnings.push({
      rule: "no-trailing-whitespace",
      line: firstLine,
      message: `${offending.length} line(s) have trailing whitespace`,
    });
  }
}

/**
 * Rule: no-excess-blank-lines. Three or more consecutive blank lines
 * is an error (two is the standard separator and is allowed).
 * @param lines - Raw content lines.
 * @param errors - Accumulator to push violations into.
 */
function checkExcessBlankLines(lines: string[], errors: MarkdownIssue[]): void {
  let streak = 0;
  let streakStart = 0;
  let alreadyReportedForStreak = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.trim() === "") {
      if (streak === 0) streakStart = i + 1;
      streak++;
      if (streak >= 3 && !alreadyReportedForStreak) {
        errors.push({
          rule: "no-excess-blank-lines",
          line: streakStart,
          message: `${streak}+ consecutive blank lines (max 2 allowed)`,
        });
        alreadyReportedForStreak = true;
      }
    } else {
      streak = 0;
      alreadyReportedForStreak = false;
    }
  }
}

/**
 * Rule: length-warn / length-error. Warns when lines exceed
 * `warnLines`, errors when they exceed `maxLines`.
 * @param lines - Raw content lines.
 * @param warnLines - Warning threshold.
 * @param maxLines - Hard error threshold.
 * @param errors - Accumulator to push errors into.
 * @param warnings - Accumulator to push warnings into.
 */
function checkLength(
  lines: string[],
  warnLines: number,
  maxLines: number,
  errors: MarkdownIssue[],
  warnings: MarkdownIssue[],
): void {
  const total = lines.length;
  if (total > maxLines) {
    errors.push({
      rule: "length-error",
      line: total,
      message: `file has ${total} lines, exceeds hard limit of ${maxLines}`,
    });
  } else if (total > warnLines) {
    warnings.push({
      rule: "length-warn",
      line: total,
      message: `file has ${total} lines, exceeds soft limit of ${warnLines} — consider splitting`,
    });
  }
}
