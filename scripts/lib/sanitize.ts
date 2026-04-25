/**
 * Output sanitiser for upstream extraction artifacts.
 *
 * The upstream `opensips-docs-collector` extracts OpenSIPs documentation
 * from DocBook/HTML and occasionally introduces noise that survives into
 * the validated source JSON we consume:
 *
 *   - **U+FFFD (replacement character).** Bytes that failed UTF-8 decoding
 *     somewhere in the upstream pipeline. They cluster in DocBook-derived
 *     section anchors like `1.6.5.�default_timeout` (originally a U+00A0
 *     non-breaking space between the section number and the name).
 *   - **U+200B (zero-width space).** Invisible copy-paste artifact from
 *     web-rendered docs. Renders as nothing but trips diff tools and
 *     downstream tokenisers.
 *   - **`\_` (over-escaped underscore).** DocBook → Markdown converters
 *     defensively escape every underscore in identifiers like
 *     `default_timeout`. CommonMark's intra-word underscore rule means the
 *     escape is unnecessary, and inside fenced code blocks the backslash
 *     becomes literal — so the upstream `\_` actually renders *worse* than
 *     plain `_` in code contexts and identical to `_` in prose.
 *
 * Per `CLAUDE.md` Rule 3, source-of-truth fixes belong upstream in
 * `opensips-docs-collector`. Until those land, the renderers strip these
 * patterns at composition time so generated artifacts (and the
 * consolidated index that ships alongside them) stay clean. The function
 * is pure, deterministic, and idempotent: applying it twice produces the
 * same result as applying it once.
 */

/**
 * Strip upstream extraction artifacts from a rendered string.
 *
 * Substitutions, applied in order:
 *
 *   1. `U+FFFD` (replacement character) → removed.
 *   2. `U+200B` (zero-width space) → removed.
 *   3. `\_` → `_` (drop the redundant backslash escape).
 *
 * The function is **idempotent** — `sanitize(sanitize(x))` equals
 * `sanitize(x)` for any input — and **order-independent** for the
 * three rules above (no rule's output enables another rule).
 * @param text - Source string. May be empty.
 * @returns The sanitised string.
 * @example
 * sanitizeRenderedText("1.6.5.�default\\_timeout");
 * // => "1.6.5.default_timeout"
 */
export function sanitizeRenderedText(text: string): string {
  return text.replace(/�/g, "").replace(/​/g, "").replace(/\\_/g, "_");
}
