/**
 * Composable Markdown builder helpers shared by every renderer.
 *
 * Each helper returns a string that ends in a deterministic number of
 * trailing newlines so that callers can concatenate the results without
 * doing per-call whitespace bookkeeping. The trailing-newline contract is
 * non-negotiable and tested:
 *
 *   - **Heading helpers** (`renderH1`–`renderH4`) return exactly one trailing
 *     newline. They emit a single line, not a section block — the caller
 *     decides what (if anything) follows.
 *   - **Inline span helpers** (`renderItalic`, `renderBold`, `renderInlineCode`)
 *     return zero trailing newlines. They are designed to be embedded inside
 *     other strings.
 *   - **Block helpers** (`renderCodeBlock`, `renderBulletList`,
 *     `renderPropertyList`, `renderLeadParagraph`) return one trailing newline
 *     terminating the block, except for `renderLeadParagraph` which adds an
 *     extra blank line because it always precedes another section.
 *   - **Section / TOC helpers** (`renderSection`, `renderTOC`) return two
 *     trailing newlines on non-empty output, producing the gap that separates
 *     them from the next section. They return the empty string when their
 *     body is empty — this is what enforces the project's "no empty sections"
 *     rule from `docs/architecture/rendering-templates.md` §2.4 and §7.
 *
 * The module has zero runtime dependencies; everything is plain string
 * concatenation. This keeps the rendering layer auditable and trivially
 * deterministic across platforms.
 */

/**
 * Render a single H1 heading line with exactly one trailing newline.
 *
 * Per `rendering-templates.md` §2.1, a generated reference file has exactly
 * one H1 naming the artifact (e.g. `# tm Module Reference`). Higher-level
 * composition (lead paragraph, TOC, sections) is the caller's responsibility.
 * @param title - Plain text title to render after the `#` token.
 * @returns The string `"# {title}\n"`.
 * @example
 * renderH1("tm Module Reference"); // "# tm Module Reference\n"
 */
export function renderH1(title: string): string {
  return `# ${title}\n`;
}

/**
 * Render a single H2 heading line with exactly one trailing newline.
 *
 * H2 is the canonical level for top-level sections inside a reference file
 * (Overview, Dependencies, Exported Parameters, etc.). Section composition
 * — heading plus body plus trailing gap — is handled by {@link renderSection}.
 * @param title - Plain text title to render after the `##` token.
 * @returns The string `"## {title}\n"`.
 * @example
 * renderH2("Overview"); // "## Overview\n"
 */
export function renderH2(title: string): string {
  return `## ${title}\n`;
}

/**
 * Render a single H3 heading line with exactly one trailing newline.
 *
 * H3 is used for individual items inside a per-module section (a single
 * parameter, function, pseudo-variable, etc.).
 * @param title - Plain text title to render after the `###` token.
 * @returns The string `"### {title}\n"`.
 * @example
 * renderH3("`fr_timeout` (integer)"); // "### `fr_timeout` (integer)\n"
 */
export function renderH3(title: string): string {
  return `### ${title}\n`;
}

/**
 * Render a single H4 heading line with exactly one trailing newline.
 *
 * H4 is reserved for sub-elements inside an item (used sparingly per
 * `rendering-templates.md` §1).
 * @param title - Plain text title to render after the `####` token.
 * @returns The string `"#### {title}\n"`.
 * @example
 * renderH4("Notes"); // "#### Notes\n"
 */
export function renderH4(title: string): string {
  return `#### ${title}\n`;
}

/**
 * Wrap text in single asterisks to produce an italic span.
 *
 * Returns no trailing newline; the result is intended for embedding inline
 * (e.g. inside a bullet item or a default-value line such as
 * `*Default value is 30 seconds.*`).
 * @param text - Text to italicize.
 * @returns The string `"*{text}*"`.
 * @example
 * renderItalic("optional"); // "*optional*"
 */
export function renderItalic(text: string): string {
  return `*${text}*`;
}

/**
 * Wrap text in double asterisks to produce a bold span.
 *
 * Returns no trailing newline. Used for bold labels such as
 * `**Example.**` captions and `**Type:**` property keys.
 * @param text - Text to embolden.
 * @returns The string `"**{text}**"`.
 * @example
 * renderBold("Example"); // "**Example**"
 */
export function renderBold(text: string): string {
  return `**${text}**`;
}

/**
 * Wrap text in backticks to produce an inline code span.
 *
 * Returns no trailing newline. Used for identifiers (function names,
 * pseudo-variables, parameter names, file paths) per
 * `rendering-templates.md` §4.3.
 * @param text - Text to render as inline code.
 * @returns The string `` "`{text}`" ``.
 * @example
 * renderInlineCode("$ru"); // "`$ru`"
 */
export function renderInlineCode(text: string): string {
  return `\`${text}\``;
}

/**
 * Render a fenced code block with an optional language tag.
 *
 * Per `rendering-templates.md` §4.1:
 *   - Use `opensips` for OpenSIPs config fragments.
 *   - Use `bash` for shell commands.
 *   - Use `text` for plain output samples.
 *   - Omit the tag for syntax-template snippets (illustrative pseudo-code).
 *
 * The function makes no attempt to validate the language tag or to escape
 * triple backticks inside `content`; the source data is trusted upstream.
 * The result always ends in exactly one trailing newline.
 * @param content - Code body; internal newlines are preserved verbatim.
 * @param lang - Optional language tag (e.g. `"opensips"`, `"bash"`).
 * @returns A fenced block ending in `"\n"`.
 * @example
 * renderCodeBlock("modparam(\"tm\", \"fr_timeout\", 10)", "opensips");
 * // "```opensips\nmodparam(\"tm\", \"fr_timeout\", 10)\n```\n"
 */
export function renderCodeBlock(content: string, lang?: string): string {
  const tag = lang ?? "";
  return `\`\`\`${tag}\n${content}\n\`\`\`\n`;
}

/**
 * Render a bulleted list. Returns the empty string for an empty array.
 *
 * The empty-array contract is what supports the "no empty sections" rule
 * (`rendering-templates.md` §2.4) at the list level: callers can pass a
 * possibly-empty list straight through, and an empty input produces no
 * output at all (no stray heading, no `"- (none)"` filler).
 * @param items - Bullet contents, one per array element. May contain
 *   inline Markdown (e.g. backticked names, italics).
 * @returns A string of `"- {item}\n"` lines, or `""` when `items` is empty.
 * @example
 * renderBulletList(["a", "b"]); // "- a\n- b\n"
 * renderBulletList([]);          // ""
 */
export function renderBulletList(items: string[]): string {
  if (items.length === 0) return "";
  return items.map((item) => `- ${item}\n`).join("");
}

/** A `key`/`value` pair rendered as a single bulleted property line. */
export interface Property {
  /** Bold-rendered key (no trailing colon — the renderer adds it). */
  key: string;
  /** Plain-text value rendered after the bold key. */
  value: string;
}

/**
 * Render a bulleted property list of the form
 * `- **{key}:** {value}\n`.
 *
 * Used for the metadata blocks under pseudo-variables, statistics, operators,
 * and other items that carry a small fixed set of typed attributes
 * (see `rendering-templates.md` §3.1.6 and §3.1.8). Returns the empty string
 * for an empty array, mirroring {@link renderBulletList}.
 * @param properties - Ordered list of key/value pairs. Order is preserved.
 * @returns A string of `"- **{key}:** {value}\n"` lines, or `""` when
 *   `properties` is empty.
 * @example
 * renderPropertyList([
 *   { key: "Type", value: "integer" },
 *   { key: "R/W", value: "read-only" },
 * ]);
 * // "- **Type:** integer\n- **R/W:** read-only\n"
 */
export function renderPropertyList(properties: Property[]): string {
  if (properties.length === 0) return "";
  return properties
    .map((p) => `- **${p.key}:** ${p.value}\n`)
    .join("");
}

/**
 * Render an H2 section block, omitting it entirely when the body is empty
 * or whitespace-only.
 *
 * This is the workhorse for the "no empty sections" rule from
 * `rendering-templates.md` §2.4. Callers can pre-render an arbitrarily
 * complex section body and pass it here without having to track whether
 * any content survived; if the body is whitespace-only, the section is
 * dropped wholesale (heading included).
 *
 * Unlike the heading helpers, the non-empty form returns **two** trailing
 * newlines so that concatenation with the next `renderSection` call
 * produces the expected blank-line gap between sections.
 * @param heading - H2 heading text.
 * @param body - Pre-rendered section body. Empty or whitespace-only bodies
 *   suppress the entire section.
 * @returns `"## {heading}\n\n{body}\n\n"` when the body is non-empty,
 *   otherwise `""`.
 * @example
 * renderSection("Overview", "Some prose.");
 * // "## Overview\n\nSome prose.\n\n"
 * renderSection("Empty", "");
 * // ""
 */
export function renderSection(heading: string, body: string): string {
  if (body.trim().length === 0) return "";
  return `## ${heading}\n\n${body}\n\n`;
}

/**
 * Render the "When to read this file" lead paragraph that sits immediately
 * under the H1 / provenance block.
 *
 * The output ends in two newlines: the first terminates the paragraph, and
 * the second produces the blank line that separates it from the following
 * Contents TOC or first section heading.
 * @param text - The paragraph text. Single paragraph; no internal blank
 *   lines (callers are expected to flatten multi-paragraph leads).
 * @returns `"{text}\n\n"`.
 * @example
 * renderLeadParagraph("This file documents the tm module.");
 * // "This file documents the tm module.\n\n"
 */
export function renderLeadParagraph(text: string): string {
  return `${text}\n\n`;
}

/** A single entry in the Contents TOC. */
export interface TocEntry {
  /** Display text shown to the reader. */
  label: string;
  /** Target anchor without the leading `#` (e.g., `"exported-parameters"`). */
  anchor: string;
}

/**
 * Render the "Contents" navigation block: an H2 "Contents" heading followed
 * by a bulleted list of anchor links.
 *
 * Per `rendering-templates.md` §2.4, the TOC contains only top-level (H2)
 * anchors — this helper does not enforce that, but the caller is expected
 * to construct {@link TocEntry} values that point at H2 sections. An empty
 * `entries` array produces no output at all (suppressing the heading too),
 * which matches the empty-section convention.
 * @param entries - Ordered list of label/anchor pairs to render.
 * @returns The Contents block ending in two newlines, or `""` when
 *   `entries` is empty.
 * @example
 * renderTOC([
 *   { label: "Overview", anchor: "overview" },
 *   { label: "Exported Functions", anchor: "exported-functions" },
 * ]);
 * // "## Contents\n\n- [Overview](#overview)\n- [Exported Functions](#exported-functions)\n\n"
 */
export function renderTOC(entries: TocEntry[]): string {
  if (entries.length === 0) return "";
  const items = entries.map((e) => `[${e.label}](#${e.anchor})`);
  return `${renderH2("Contents")}\n${renderBulletList(items)}\n`;
}

/**
 * Convert a heading string into a GitHub-style anchor slug.
 *
 * The algorithm mirrors GitHub's heading-anchor generation closely enough
 * for the cases the rendering pipeline produces:
 *
 *   1. Lowercase the input.
 *   2. Replace whitespace runs with a single `-` (word boundaries become
 *      anchor separators).
 *   3. Drop every remaining character outside `[a-z0-9_-]` — punctuation
 *      like `$`, `(`, `)`, `!` is *removed*, not turned into a hyphen, so
 *      `"$var(name) Variable"` collapses to `"varname-variable"` rather
 *      than `"var-name-variable"`.
 *   4. Collapse adjacent hyphens to a single hyphen.
 *   5. Strip any leading or trailing hyphens.
 *
 * This intentionally drops non-ASCII characters: the rendering pipeline
 * operates on OpenSIPs identifiers (ASCII by upstream convention) and
 * English section names. If non-ASCII input is ever introduced, the
 * resulting empty slug will surface as a TOC link to `#` and be caught by
 * output validation rather than silently masquerading as a working anchor.
 * @param heading - Source heading text (display string).
 * @returns A lowercase, hyphen-separated slug suitable as the target of a
 *   `[label](#slug)` Markdown anchor link.
 * @example
 * toAnchor("Exported Functions");      // "exported-functions"
 * toAnchor("$var(name) Variable");     // "varname-variable"
 * toAnchor("---leading-and-trailing---"); // "leading-and-trailing"
 */
export function toAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
