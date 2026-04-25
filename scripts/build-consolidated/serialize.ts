/**
 * Deterministic JSON serializer for the consolidated index.
 *
 * The build pipeline's downstream contract requires byte-stable output
 * given byte-stable input (see `docs/architecture/data-pipeline.md` §3 and
 * the build-twice-and-diff CI job). JavaScript's built-in `JSON.stringify`
 * does not guarantee key ordering for plain objects — `Object.keys`
 * preserves insertion order at most levels but `Record<>`-style maps
 * populated by user code may be inserted in arbitrary order. This module
 * delegates to {@link https://github.com/Kikobeats/json-stringify-deterministic
 * json-stringify-deterministic} which alphabetizes keys at every nesting
 * level.
 *
 * Format choices (held constant across runs to keep output stable):
 * - 2-space indentation, pretty-printed.
 * - Alphabetical key sort at every nesting level (library default).
 * - Trailing newline appended (POSIX text-file convention; keeps `git
 *   diff` quiet about "no newline at end of file").
 *
 * Library API caveats:
 * - The library is published as a CommonJS `module.exports = fn`. Under
 *   the project's `NodeNext`/`esModuleInterop` configuration this is
 *   imported as a default export.
 * - The TypeScript declaration types `space` as `string`. Passing a
 *   number works in vanilla `JSON.stringify` but the library uses
 *   `Array.prototype.join(space)` which coerces a number to its digit
 *   characters (e.g., `2` → indent of literal `"2"` repeats), not spaces.
 *   The constant {@link INDENT} is a two-space string for that reason.
 * @see docs/architecture/data-pipeline.md §3
 * @see docs/plan/05-consolidated-index.md Task 5.3
 */

import stringify from "json-stringify-deterministic";

import type { ConsolidatedIndex } from "../types/consolidated.js";

/**
 * Two-space indent string. Held in a named constant so the format choice
 * is documented once and the call site stays self-explanatory.
 */
const INDENT = "  ";

/**
 * Serialize a {@link ConsolidatedIndex} to a deterministic, pretty-printed
 * JSON string with alphabetical key sorting at every nesting level.
 *
 * Output is always pretty-printed with 2-space indentation and ends with
 * a single trailing `\n`. Given the same logical input, returns
 * byte-identical output across runs, platforms, and timezones — even when
 * input properties were inserted in different orders.
 * @param index - The consolidated index to serialize. Type-checked at
 *   compile time; this serializer does not re-validate the structure.
 *   Run `ConsolidatedIndexSchema.parse()` upstream if validation is
 *   required.
 * @returns Pretty-printed JSON string with one trailing newline.
 */
export function serializeIndex(index: ConsolidatedIndex): string {
  return stringify(index, { space: INDENT }) + "\n";
}
