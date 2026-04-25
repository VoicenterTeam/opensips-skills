/**
 * Source-tree discovery for the build pipeline.
 *
 * Implements the dynamic, version-agnostic discovery contract described in
 * ADR-009 (`docs/architecture/adr/009-data-folder-and-dynamic-version-discovery.md`):
 *
 *   - The source-data root is `./data/` (not `./source/`).
 *   - Versions are discovered by scanning for subdirectory names matching
 *     `^\d+\.\d+$` — no version is hard-coded.
 *   - The `guides/` subdirectory is conditional per version. Discovery detects
 *     presence/absence rather than erroring on absence.
 *   - The `md/` subdirectory and any `*-complete.json` at the version root are
 *     ignored (they exist for upstream-resync convenience only).
 *
 * All returned absolute paths are normalised to POSIX-style (`/`) so build
 * output is byte-identical across Windows and POSIX hosts.
 */

import { existsSync, readdirSync, readFileSync, statSync, type Dirent } from "node:fs";
import path, { sep } from "node:path";

/** Default source-data root, per ADR-009. */
const DEFAULT_SOURCE_ROOT = "./data";

/** Directory name regex: two non-negative integers joined by a dot. */
const VERSION_REGEX = /^\d+\.\d+$/;

/** Subdirectory at the version root that the build must ignore (per ADR-009). */
const IGNORED_VERSION_SUBDIR = "md";

/** Filename pattern at the version root that the build must ignore (per ADR-009). */
const COMPLETE_JSON_REGEX = /-complete\.json$/;

/** Marker filename at the version root that flags the version as broken. */
const BROKEN_MARKER_FILENAME = ".broken";

/**
 * Information surfaced by {@link readBrokenMarker} when a version directory
 * contains a `.broken` marker file. The marker is a per-version DATA signal
 * (not a code-level enumeration) telling the build pipeline to skip the
 * version with a clear warning rather than fail.
 *
 * Per ADR-009, adding or removing the marker is purely a data operation —
 * no code change is required when a version is fixed upstream and the
 * marker is deleted, nor when a different version becomes broken and a
 * marker is added under that version's directory.
 *
 * Per CLAUDE.md Rule 3, this mechanism does not edit broken upstream
 * content; it adds a sibling marker file at the version root that the
 * build pipeline interprets as "skip with grace".
 */
export interface BrokenVersionInfo {
  /** Free-text explanation read verbatim from the `.broken` file (trimmed). */
  reason: string;
}

/**
 * Absolute file paths discovered for one version, grouped by source category.
 * All paths are POSIX-style; all arrays are sorted alphabetically.
 */
export interface DiscoveredSourceFiles {
  /** Absolute paths to core/*.json files, sorted alphabetically. Empty array if dir absent. */
  core: string[];
  /** Absolute paths to modules/*.json files, sorted alphabetically. Empty array if dir absent. */
  modules: string[];
  /** Absolute paths to guides/*.json files, sorted alphabetically. Empty array if dir absent. */
  guides: string[];
}

/** Structured error thrown by discover functions when a path is missing or unreadable. */
export class DiscoverError extends Error {
  readonly code = "DISCOVER_ERROR" as const;
  readonly path: string;

  /**
   * @param message - Human-readable description of the failure.
   * @param path - Filesystem path that triggered the failure.
   */
  constructor(message: string, path: string) {
    super(message);
    this.name = "DiscoverError";
    this.path = path;
  }
}

/**
 * Scan `sourceRoot` for subdirectory names matching `^\d+\.\d+$`.
 *
 * Files at the root are ignored — only directories whose names look like
 * version strings are returned. Names like `3.6x`, `latest`, `3.6.1`, or `3`
 * are rejected because the build pipeline keys per-version state by the
 * exact two-segment label.
 * @param sourceRoot - Filesystem path to scan. Defaults to `./data` per ADR-009.
 * @returns Sorted array of version strings (e.g., `["3.4", "3.5", "3.6"]`).
 *   Empty when no version-shaped subdirectory exists.
 * @throws DiscoverError When `sourceRoot` does not exist or cannot be read.
 *   The error's `.path` field names the offending path.
 * @example
 * const versions = discoverVersions();           // ["3.4", "3.5", "3.6"]
 * const custom = discoverVersions("./vendor");   // scans ./vendor instead
 */
export function discoverVersions(sourceRoot: string = DEFAULT_SOURCE_ROOT): string[] {
  let entries: Dirent[];
  try {
    entries = readdirSync(sourceRoot, { withFileTypes: true });
  } catch (err) {
    throw new DiscoverError(
      `Cannot read source root: ${describeError(err)}`,
      sourceRoot,
    );
  }

  const versions: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!VERSION_REGEX.test(entry.name)) continue;
    versions.push(entry.name);
  }
  versions.sort();
  return versions;
}

/**
 * For one version, return absolute file paths grouped by category.
 *
 * Detects presence/absence of the optional `guides/` directory (conditional
 * per ADR-009). Skips the `md/` subdirectory and any `*-complete.json` at
 * the version root because those are upstream-resync artefacts that the
 * build pipeline must not consume.
 *
 * Only `.json` files within `core/`, `modules/`, and `guides/` are returned;
 * stray non-JSON files are filtered out. Subdirectories below those three
 * are not traversed.
 * @param sourceRoot - Filesystem path containing version directories. Defaults to `./data`.
 * @param version - Version string (e.g., `"3.6"`). Must already exist as a subdirectory.
 * @returns Object with `core`, `modules`, `guides` arrays of absolute, POSIX-style,
 *   alphabetically-sorted file paths. Each array is empty when its category dir is absent.
 * @throws DiscoverError When the version directory itself does not exist or cannot be read.
 * @example
 * const f = discoverSourceFiles(undefined, "3.6");
 * // f.core    → ["/abs/data/3.6/core/async.json", ...]
 * // f.modules → ["/abs/data/3.6/modules/acc.json", ...]
 * // f.guides  → []  (when guides/ does not exist for this version)
 */
export function discoverSourceFiles(
  sourceRoot: string | undefined,
  version: string,
): DiscoveredSourceFiles {
  const root = sourceRoot ?? DEFAULT_SOURCE_ROOT;
  const versionDir = path.join(root, version);

  // Probe the version directory; the build cannot proceed if it's missing.
  try {
    const st = statSync(versionDir);
    if (!st.isDirectory()) {
      throw new DiscoverError(
        `Expected directory at version path, got non-directory entry`,
        versionDir,
      );
    }
  } catch (err) {
    if (err instanceof DiscoverError) throw err;
    throw new DiscoverError(
      `Cannot read version directory: ${describeError(err)}`,
      versionDir,
    );
  }

  return {
    core: readJsonChildren(versionDir, "core"),
    modules: readJsonChildren(versionDir, "modules"),
    guides: readJsonChildren(versionDir, "guides"),
  };
}

/**
 * Detect whether a version is marked as broken via `data/{version}/.broken`.
 *
 * The `.broken` marker file is a per-version DATA signal that the build
 * pipeline must treat the version as "known broken upstream — skip with
 * a warning rather than fail". This honours ADR-009 (no code-level version
 * enumeration: the marker IS data) and CLAUDE.md Rule 3 (no upstream content
 * edits: the marker is a sibling file added at the version root, not a
 * modification of any extracted JSON).
 *
 * The file's textual content is the explanation, returned verbatim (trimmed)
 * to the caller via {@link BrokenVersionInfo.reason} so the orchestrator can
 * surface it on stderr alongside the "skipping ${version}" message.
 *
 * Absence of the marker is the common case and is reported as `null` (not an
 * error). Read failures other than ENOENT bubble up — a marker that exists
 * but cannot be read is genuinely unexpected and worth surfacing.
 * @param sourceRoot - Filesystem path containing version directories. Defaults
 *   to `./data` per ADR-009 when undefined.
 * @param version - Version string (e.g., `"3.4"`).
 * @returns `BrokenVersionInfo` carrying the marker's text when present;
 *   `null` when no marker file exists at `<sourceRoot>/<version>/.broken`.
 * @example
 * const broken = readBrokenMarker(undefined, "3.4");
 * if (broken) {
 *   console.warn(`Skipping 3.4: ${broken.reason}`);
 * }
 */
export function readBrokenMarker(
  sourceRoot: string | undefined,
  version: string,
): BrokenVersionInfo | null {
  const root = sourceRoot ?? DEFAULT_SOURCE_ROOT;
  const markerPath = path.join(root, version, BROKEN_MARKER_FILENAME);
  if (!existsSync(markerPath)) return null;
  return { reason: readFileSync(markerPath, "utf-8").trim() };
}

/**
 * List `.json` files directly inside `<versionDir>/<subdir>/`, returning
 * absolute POSIX-style paths sorted alphabetically.
 *
 * Returns an empty array when `<subdir>` does not exist — this is the
 * presence/absence detection required for the optional `guides/` directory
 * and also keeps the function tolerant of partially-populated versions.
 *
 * Subdirectories below `<subdir>` are not traversed. The `md/` subdirectory
 * and any `*-complete.json` at the version root are filtered upstream of
 * this function — but as a defence-in-depth measure this routine also
 * declines to recurse and only accepts regular files with a `.json` suffix.
 * @param versionDir - Absolute path to the version directory.
 * @param subdir - Category folder name to enumerate (`"core"`, `"modules"`, or `"guides"`).
 * @returns Sorted array of absolute, POSIX-style paths. Empty when `<subdir>` is absent
 *   or contains no `.json` files.
 */
function readJsonChildren(versionDir: string, subdir: string): string[] {
  // Defence-in-depth: never enumerate the build-ignored md/ directory even
  // if a future caller passes its name in.
  if (subdir === IGNORED_VERSION_SUBDIR) return [];

  const dir = path.join(versionDir, subdir);

  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") {
      // Optional category — absence is allowed (per ADR-009 guides/ rule).
      return [];
    }
    throw new DiscoverError(
      `Cannot read category directory: ${describeError(err)}`,
      dir,
    );
  }

  const out: string[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".json")) continue;
    // Defence-in-depth: ignore stray *-complete.json should one ever appear here.
    if (COMPLETE_JSON_REGEX.test(entry.name)) continue;
    out.push(toPosix(path.resolve(dir, entry.name)));
  }
  out.sort();
  return out;
}

/**
 * Convert a (possibly Windows-style) path to POSIX form so output is
 * platform-stable. `path.resolve` returns native separators, which on Windows
 * are backslashes; replacing them keeps generated artefacts byte-identical
 * regardless of build host.
 * @param p - A path produced by `path.resolve` or `path.join`.
 * @returns The same path with `\\` replaced by `/`.
 */
function toPosix(p: string): string {
  return p.split(sep).join("/");
}

/**
 * Extract a short human-readable description from a thrown value, preferring
 * the standard `Error.message` shape but tolerating non-`Error` throws.
 * @param err - The thrown value.
 * @returns A string suitable for embedding in a `DiscoverError` message.
 */
function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Narrow type guard for Node `ErrnoException` so we can read `.code` safely.
 * @param err - The thrown value.
 * @returns True if `err` looks like a `NodeJS.ErrnoException`.
 */
function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}
