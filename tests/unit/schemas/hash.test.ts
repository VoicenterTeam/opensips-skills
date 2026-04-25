import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  computeSchemaHash,
  readCommittedHash,
  verifySchemaHash,
} from "../../../scripts/schemas/hash.js";

const SCHEMAS_DIR = resolve(import.meta.dirname, "../../../scripts/schemas");

describe("computeSchemaHash", () => {
  it("returns a 64-character hex string (SHA-256)", () => {
    const hash = computeSchemaHash();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — calling it twice produces the same value", () => {
    const a = computeSchemaHash();
    const b = computeSchemaHash();
    expect(a).toBe(b);
  });

  it("ignores files outside scripts/schemas/", () => {
    // Compute baseline against the real schemas dir.
    const baseline = computeSchemaHash();

    // Use a tmp dir that contains its own .ts files; baseline should be unchanged
    // because computeSchemaHash() with no args only reads the canonical schemas dir.
    const tmp = mkdtempSync(join(tmpdir(), "hash-isolation-"));
    try {
      writeFileSync(join(tmp, "extra.ts"), "// noise that must not affect baseline\n");
      const after = computeSchemaHash();
      expect(after).toBe(baseline);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("excludes hash.ts itself and the .schema-hash file from its hashing", () => {
    let tmp: string | undefined;
    try {
      tmp = mkdtempSync(join(tmpdir(), "hash-exclusions-"));
      // Two files: a real schema-shaped file, plus hash.ts and .schema-hash that must be ignored.
      writeFileSync(join(tmp, "alpha.schema.ts"), "export const A = 1;\n");
      const beforeAddingExcluded = computeSchemaHash(tmp);

      writeFileSync(join(tmp, "hash.ts"), "export function compute() { return 'x'; }\n");
      writeFileSync(join(tmp, ".schema-hash"), "deadbeef\n");
      const afterAddingExcluded = computeSchemaHash(tmp);

      expect(afterAddingExcluded).toBe(beforeAddingExcluded);
    } finally {
      if (tmp) rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("includes files in scripts/schemas/core/ (recursive)", () => {
    let tmp: string | undefined;
    try {
      tmp = mkdtempSync(join(tmpdir(), "hash-recursive-"));
      writeFileSync(join(tmp, "alpha.schema.ts"), "export const A = 1;\n");
      const before = computeSchemaHash(tmp);

      mkdirSync(join(tmp, "core"));
      writeFileSync(join(tmp, "core", "nested.schema.ts"), "export const N = 2;\n");
      const after = computeSchemaHash(tmp);

      expect(after).not.toBe(before);
    } finally {
      if (tmp) rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("readCommittedHash", () => {
  let tmp: string;
  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "hash-read-"));
  });
  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("returns the trimmed contents of .schema-hash if it exists", () => {
    const target = join(tmp, ".schema-hash");
    writeFileSync(target, "  abc123\n");
    expect(readCommittedHash(target)).toBe("abc123");
  });

  it("returns null if .schema-hash does not exist", () => {
    const target = join(tmp, ".schema-hash");
    expect(readCommittedHash(target)).toBeNull();
  });
});

describe("verifySchemaHash", () => {
  let tmp: string;
  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "hash-verify-"));
    writeFileSync(join(tmp, "alpha.schema.ts"), "export const A = 1;\n");
  });
  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("returns { ok: true, computed, committed } when they match", () => {
    const computed = computeSchemaHash(tmp);
    const hashFilePath = join(tmp, ".schema-hash");
    writeFileSync(hashFilePath, computed + "\n");

    const result = verifySchemaHash({ rootDir: tmp, hashFilePath });
    expect(result.ok).toBe(true);
    expect(result.computed).toBe(computed);
    expect(result.committed).toBe(computed);
  });

  it("returns { ok: false, computed, committed } when they differ", () => {
    const hashFilePath = join(tmp, ".schema-hash");
    writeFileSync(hashFilePath, "0".repeat(64) + "\n");

    const result = verifySchemaHash({ rootDir: tmp, hashFilePath });
    expect(result.ok).toBe(false);
    expect(result.computed).toMatch(/^[0-9a-f]{64}$/);
    expect(result.committed).toBe("0".repeat(64));
    expect(result.computed).not.toBe(result.committed);
  });

  it("returns { ok: false, computed, committed: null } when .schema-hash does not exist", () => {
    const hashFilePath = join(tmp, ".schema-hash");
    // Note: file deliberately not written.
    const result = verifySchemaHash({ rootDir: tmp, hashFilePath });
    expect(result.ok).toBe(false);
    expect(result.committed).toBeNull();
    expect(result.computed).toMatch(/^[0-9a-f]{64}$/);
  });
});

// Make SCHEMAS_DIR usage non-dead so lints don't warn; the constant
// documents where the canonical schema tree lives for future readers.
void SCHEMAS_DIR;
