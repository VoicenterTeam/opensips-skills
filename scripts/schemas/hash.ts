/**
 * Schema hash drift check.
 *
 * Computes a SHA-256 digest over every `.ts` file under `scripts/schemas/`
 * (recursive) so that any change to the mirrored schema tree is detectable.
 *
 * The hash deliberately excludes:
 *   - `hash.ts` itself (this file) — its contents are tooling, not schema.
 *   - `.schema-hash` — the committed baseline file.
 *
 * Schema rationale: see docs/architecture/adr/004-node-typescript-build-stack.md
 * and docs/plan/01-schema-mirroring-and-validation.md §1.3.
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

/** Files within the schema root that must never contribute to the hash. */
const EXCLUDED_BASENAMES = new Set<string>(["hash.ts", ".schema-hash"]);

/**
 * Resolves the canonical schema root directory (the directory this file lives in).
 * @returns Absolute path to `scripts/schemas/`.
 */
function defaultRootDir(): string {
  return resolve(import.meta.dirname, ".");
}

/**
 * Resolves the canonical `.schema-hash` baseline file path.
 * @returns Absolute path to `scripts/schemas/.schema-hash`.
 */
function defaultHashFilePath(): string {
  return resolve(import.meta.dirname, ".schema-hash");
}

/**
 * Walks `dir` recursively, returning every regular file's absolute path.
 * @param dir - Directory to walk.
 * @returns Sorted array of absolute file paths discovered under `dir`.
 */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(abs));
    } else if (entry.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

/**
 * Computes a deterministic SHA-256 hex digest over every `.ts` file under
 * `rootDir` (recursive), excluding `hash.ts` and `.schema-hash`.
 *
 * Files are sorted by their POSIX-style relative path before being concatenated,
 * which keeps the hash stable across operating systems.
 * @param rootDir - Directory to hash. Defaults to the directory this file lives in
 *   (i.e. `scripts/schemas/`).
 * @returns 64-character lowercase hex SHA-256 digest of the concatenated contents.
 * @example
 * const hash = computeSchemaHash();
 * // → "a3f5...".length === 64
 */
export function computeSchemaHash(rootDir?: string): string {
  const root = rootDir ?? defaultRootDir();
  const all = walk(root);

  const candidates = all
    .filter((p) => p.endsWith(".ts"))
    .filter((p) => !EXCLUDED_BASENAMES.has(relativeBasename(root, p)))
    .map((p) => ({ abs: p, rel: toPosix(relative(root, p)) }))
    .sort((a, b) => a.rel.localeCompare(b.rel));

  const hash = createHash("sha256");
  for (const { abs } of candidates) {
    // Normalise CRLF → LF before hashing so the digest is identical on
    // Windows checkouts (with autocrlf=true, which is the Git-for-Windows
    // default) and on Linux/macOS where the working tree is already LF.
    // Without this, the same canonical schema content produces two
    // different hashes depending on platform — directly contradicting
    // this function's "stable across operating systems" guarantee.
    const text = readFileSync(abs, "utf8").replace(/\r\n/g, "\n");
    hash.update(Buffer.from(text, "utf8"));
  }
  return hash.digest("hex");
}

/**
 * Reads the committed baseline hash from `hashFilePath`, returning the trimmed
 * contents if present or `null` if the file does not exist.
 * @param hashFilePath - Path to `.schema-hash`. Defaults to the canonical
 *   location at `scripts/schemas/.schema-hash`.
 * @returns The trimmed contents of the file, or `null` when missing.
 * @example
 * const committed = readCommittedHash();
 * if (committed === null) {
 *   console.error("Run `npm run schemas:hash` to create a baseline.");
 * }
 */
export function readCommittedHash(hashFilePath?: string): string | null {
  const target = hashFilePath ?? defaultHashFilePath();
  try {
    return readFileSync(target, "utf8").trim();
  } catch (err) {
    if (isErrnoException(err) && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

/**
 * Compares the freshly computed schema hash against the committed baseline.
 * @param opts - Optional overrides.
 * @param opts.rootDir - Schema root passed through to `computeSchemaHash`.
 * @param opts.hashFilePath - Baseline file path passed through to `readCommittedHash`.
 * @returns `{ ok, computed, committed }` where `ok` is true iff `computed === committed`
 *   and `committed` is non-null.
 * @example
 * const result = verifySchemaHash();
 * if (!result.ok) {
 *   console.error(`Schema drift: computed=${result.computed} committed=${result.committed}`);
 * }
 */
export function verifySchemaHash(opts?: {
  rootDir?: string;
  hashFilePath?: string;
}): { ok: boolean; computed: string; committed: string | null } {
  const computed = computeSchemaHash(opts?.rootDir);
  const committed = readCommittedHash(opts?.hashFilePath);
  const ok = committed !== null && committed === computed;
  return { ok, computed, committed };
}

/**
 * Returns just the basename of `abs` relative to `root`, used to test against
 * `EXCLUDED_BASENAMES` only when the file sits directly inside the root (the
 * exclusion rule should not match nested files of the same name).
 * @param root - Schema root directory.
 * @param abs - Absolute file path.
 * @returns The relative path; if `abs` lives directly in `root`, this equals
 *   the file's basename and can be tested against `EXCLUDED_BASENAMES`.
 */
function relativeBasename(root: string, abs: string): string {
  const rel = relative(root, abs);
  // Only treat as excluded when the file is directly in root (no path separator).
  return rel.includes(sep) ? "" : rel;
}

/**
 * Converts a path to POSIX form so sort order is identical on Windows and POSIX.
 * @param p - A relative path produced by `path.relative`.
 * @returns The same path with `\\` replaced by `/`.
 */
function toPosix(p: string): string {
  return p.split(sep).join("/");
}

/**
 * Narrow type guard for Node `ErrnoException` so we can read `.code` safely.
 * @param err - The thrown value.
 * @returns True if `err` looks like a `NodeJS.ErrnoException`.
 */
function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err !== null && "code" in err;
}
