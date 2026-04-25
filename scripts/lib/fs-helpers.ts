/**
 * Filesystem helpers for the build pipeline.
 *
 * Provides the small, opinionated layer of I/O primitives the orchestrator and
 * renderers depend on. Each helper translates raw `node:fs` failures into the
 * project's structured `IOError` (see `./errors.ts`) so the orchestrator can
 * format errors uniformly and exit with the documented exit codes.
 *
 * The helpers also enforce two cross-platform invariants required by
 * `docs/architecture/data-pipeline.md` §3:
 *
 *   - Writes are atomic (temp file + fsync + rename), so an interrupted build
 *     leaves either the previous version of a file or no file at all — never a
 *     partial one.
 *   - Path strings that flow into generated content (Markdown links, JSON
 *     `path` fields) use POSIX separators regardless of host OS, via
 *     {@link posixPath}.
 */

import { mkdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import writeFileAtomic from "write-file-atomic";

import { IOError } from "./errors.js";

/**
 * Atomically write `content` to `filePath`.
 *
 * Wraps `write-file-atomic`, which writes to a sibling temp file in the same
 * directory, fsyncs it, and renames over the destination. The same-filesystem
 * requirement applies: the parent directory of `filePath` must reside on the
 * same filesystem as the temp file, otherwise atomicity degrades to copy +
 * unlink. CI runners with mounted volumes can silently lose atomicity here —
 * see `data-pipeline.md` §3 for the determinism contract.
 *
 * The parent directory must already exist. This helper does not call
 * {@link ensureDirectory} on the caller's behalf; callers should invoke
 * {@link ensureDirectory} on the parent before writing in batch.
 * @param filePath - Destination path (parent directory must already exist).
 * @param content - File contents (UTF-8 string or raw `Buffer`).
 * @returns Promise that resolves once the rename has completed.
 * @throws {IOError} With `operation: "atomicWrite"` and `path: filePath` when
 *   the underlying fs operation fails (e.g., parent directory missing,
 *   permission denied, disk full).
 */
export async function atomicWriteFile(
  filePath: string,
  content: string | Buffer,
): Promise<void> {
  try {
    await writeFileAtomic(filePath, content);
  } catch (err) {
    throw new IOError({
      message: `Atomic write failed: ${describeError(err)}`,
      operation: "atomicWrite",
      path: filePath,
      cause: err instanceof Error ? err : undefined,
    });
  }
}

/**
 * Remove all files and subdirectories under `dirPath` while preserving the
 * directory itself.
 *
 * Implemented as `rm(dirPath, { recursive: true, force: true })` followed by
 * `mkdir(dirPath, { recursive: true })`. Equivalent in effect to enumerating
 * children and removing each, but simpler and equally safe because both calls
 * are idempotent. A missing `dirPath` is a no-op — callers can invoke this
 * on a fresh tree without guarding for absence.
 * @param dirPath - Directory whose contents should be cleared.
 * @returns Promise that resolves once contents are removed and the
 *   (possibly recreated) directory is in place.
 * @throws {IOError} With `operation: "cleanDirectory"` and `path: dirPath` on
 *   permission errors or any unexpected fs failure. ENOENT during the initial
 *   removal step is suppressed (no-op on missing dirs).
 */
export async function cleanDirectory(dirPath: string): Promise<void> {
  // Detect prior existence so we can honour both contractual properties:
  //   1. After cleaning a populated dir, the dir itself still exists.
  //   2. Calling on a non-existent dir is a no-op (no throw, no creation).
  // We can't distinguish these two cases after `rm({force:true})` because
  // it silently succeeds on missing paths, so probe up-front.
  let existedBefore = true;
  try {
    await stat(dirPath);
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") {
      existedBefore = false;
    } else {
      throw new IOError({
        message: `cleanDirectory stat failed: ${describeError(err)}`,
        operation: "cleanDirectory",
        path: dirPath,
        cause: err instanceof Error ? err : undefined,
      });
    }
  }

  if (!existedBefore) return; // no-op contract

  try {
    await rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    throw new IOError({
      message: `cleanDirectory remove failed: ${describeError(err)}`,
      operation: "cleanDirectory",
      path: dirPath,
      cause: err instanceof Error ? err : undefined,
    });
  }

  try {
    await mkdir(dirPath, { recursive: true });
  } catch (err) {
    throw new IOError({
      message: `cleanDirectory recreate failed: ${describeError(err)}`,
      operation: "cleanDirectory",
      path: dirPath,
      cause: err instanceof Error ? err : undefined,
    });
  }
}

/**
 * Ensure `dirPath` exists, creating it (and any missing parents) if necessary.
 *
 * Equivalent to `mkdir -p`. Idempotent — calling on an existing directory is
 * a no-op (the underlying `mkdir({ recursive: true })` swallows EEXIST).
 * @param dirPath - Directory path to ensure.
 * @returns Promise that resolves once the directory is in place.
 * @throws {IOError} With `operation: "ensureDirectory"` and `path: dirPath`
 *   on permission errors or other unexpected fs failures (EEXIST is not
 *   considered an error and is suppressed).
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (isErrnoException(err) && err.code === "EEXIST") return;
    throw new IOError({
      message: `ensureDirectory failed: ${describeError(err)}`,
      operation: "ensureDirectory",
      path: dirPath,
      cause: err instanceof Error ? err : undefined,
    });
  }
}

/**
 * Read a UTF-8 file and parse it as JSON.
 *
 * Read failures and parse failures are reported with distinct
 * `IOError.operation` values (`"read"` vs `"parse"`) so callers and the
 * orchestrator's error formatter can present an accurate diagnostic.
 * @template T - Caller-asserted shape of the parsed value. No runtime
 *   validation occurs in this helper; pair it with a Zod schema check at the
 *   validation stage if you need a guarantee.
 * @param filePath - File to read.
 * @returns Parsed JSON value, typed as `T`.
 * @throws {IOError} With `operation: "read"` and `path: filePath` if the file
 *   cannot be opened or read (ENOENT, EACCES, etc.).
 * @throws {IOError} With `operation: "parse"` and `path: filePath` if the
 *   file's contents cannot be parsed as JSON.
 */
export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (err) {
    throw new IOError({
      message: `Read failed: ${describeError(err)}`,
      operation: "read",
      path: filePath,
      cause: err instanceof Error ? err : undefined,
    });
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new IOError({
      message: `JSON parse failed: ${describeError(err)}`,
      operation: "parse",
      path: filePath,
      cause: err instanceof Error ? err : undefined,
    });
  }
}

/**
 * Join path segments with POSIX-style forward slashes, regardless of host OS.
 *
 * Use for any path that flows into generated content (Markdown links, JSON
 * `path` fields, frontmatter references). Backslashes inside any segment are
 * normalized to forward slashes before joining, so a Windows-side caller
 * passing `"a\\b"` produces the same output as a POSIX-side caller passing
 * `"a/b"`.
 *
 * The result is also stripped of any leading `./` so callers don't have to
 * worry about whether `path.posix.join` decided to keep one.
 * @param segments - Path segments to join. Each segment may itself contain
 *   `/` or `\\` separators; both are converted to `/`.
 * @returns Joined POSIX-style path. Never has a leading `./` and never
 *   contains a backslash.
 */
export function posixPath(...segments: string[]): string {
  const normalized = segments.map((s) => s.split("\\").join("/"));
  const joined = path.posix.join(...normalized);
  return joined.startsWith("./") ? joined.slice(2) : joined;
}

/**
 * Extract a short human-readable description from a thrown value.
 * @param err - The thrown value (any type).
 * @returns A string suitable for embedding in an `IOError` message.
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
