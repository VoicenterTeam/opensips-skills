/**
 * Determinism E2E test (M9 Task 9.6).
 *
 * Codifies the build-twice-and-diff invariant from
 * `docs/architecture/data-pipeline.md` §3 — the project's most important
 * guarantee. Identical input must produce byte-identical output, every
 * run, every platform, every timezone.
 *
 * Strategy: build the full corpus for one version into two distinct tmp
 * roots in succession, then compute a SHA-256 of every generated file
 * (filename + contents) in each tree and compare. Any byte-level
 * difference fails the test. This is the test that guards golden-file
 * meaningfulness — if the build is non-deterministic, golden-file tests
 * are not meaningful.
 *
 * No retries on flake. A flaky determinism test is a real bug, not a
 * retriable nuisance — re-running it would mask the very symptom this
 * test exists to surface.
 *
 * Slowness note: each `main()` call runs the full pipeline; two calls per
 * test push the wall-clock cost over a normal unit-test budget. The
 * 60-second per-test timeout accommodates this.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { main } from "../../scripts/build-references.js";

/**
 * Convert a host-OS path string to POSIX form so the hashed filename
 * component is identical on Windows and POSIX runners. Without this, the
 * test would falsely report drift on Windows even when the bytes match.
 * @param p - Relative path produced by `path.relative`.
 * @returns POSIX-form path string.
 */
function toPosix(p: string): string {
  return p.split(sep).join("/");
}

/**
 * Compute a per-file map of `relative-path → SHA-256(content)` rooted at
 * `root`. We hash files individually (rather than computing a single tree
 * hash) so a failure can pinpoint the offending file.
 * @param root - Tree root.
 * @returns Map keyed by POSIX-form relative path.
 */
function hashTree(root: string): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir).sort()) {
      const abs = join(dir, entry);
      if (statSync(abs).isDirectory()) {
        walk(abs);
      } else {
        const rel = toPosix(relative(root, abs));
        const hash = createHash("sha256");
        hash.update(readFileSync(abs));
        out.set(rel, hash.digest("hex"));
      }
    }
  };
  walk(root);
  return out;
}

describe("determinism E2E", () => {
  let tmpA: string;
  let tmpB: string;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmpA = mkdtempSync(join(tmpdir(), "opensips-skills-e2e-A-"));
    tmpB = mkdtempSync(join(tmpdir(), "opensips-skills-e2e-B-"));
    stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    rmSync(tmpA, { recursive: true, force: true });
    rmSync(tmpB, { recursive: true, force: true });
  });

  it(
    "produces byte-identical 3.6 output across two builds",
    { timeout: 60_000 },
    async () => {
      const codeA = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpA,
      ]);
      expect(codeA).toBe(0);
      const codeB = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpB,
      ]);
      expect(codeB).toBe(0);

      const hashA = hashTree(tmpA);
      const hashB = hashTree(tmpB);

      // First confirm the file sets match — a missing file in either tree
      // is its own kind of drift and should fail before per-file hashing.
      expect([...hashA.keys()].sort()).toEqual([...hashB.keys()].sort());

      for (const [rel, digestA] of hashA) {
        const digestB = hashB.get(rel);
        expect(
          digestB,
          `file ${rel} present in tmpA but missing in tmpB`,
        ).toBeDefined();
        expect(
          digestB,
          `file ${rel} differs between two 3.6 builds — non-determinism detected`,
        ).toBe(digestA);
      }
    },
  );

  it(
    "produces byte-identical 3.5 output across two builds",
    { timeout: 60_000 },
    async () => {
      const codeA = await main([
        "--only",
        "3.5",
        "--source-root",
        "data",
        "--output-root",
        tmpA,
      ]);
      expect(codeA).toBe(0);
      const codeB = await main([
        "--only",
        "3.5",
        "--source-root",
        "data",
        "--output-root",
        tmpB,
      ]);
      expect(codeB).toBe(0);

      const hashA = hashTree(tmpA);
      const hashB = hashTree(tmpB);

      expect([...hashA.keys()].sort()).toEqual([...hashB.keys()].sort());

      for (const [rel, digestA] of hashA) {
        const digestB = hashB.get(rel);
        expect(
          digestB,
          `file ${rel} present in tmpA but missing in tmpB`,
        ).toBeDefined();
        expect(
          digestB,
          `file ${rel} differs between two 3.5 builds — non-determinism detected`,
        ).toBe(digestA);
      }
    },
  );
});
