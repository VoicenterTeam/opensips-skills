import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
  statSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  atomicWriteFile,
  cleanDirectory,
  ensureDirectory,
  readJsonFile,
  posixPath,
} from "../../../scripts/lib/fs-helpers.js";
import { IOError } from "../../../scripts/lib/errors.js";

describe("atomicWriteFile", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "opensips-fs-helpers-"));
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("writes string content to a path; readback matches", async () => {
    const target = join(tmp, "out.txt");
    await atomicWriteFile(target, "hello world");
    expect(readFileSync(target, "utf8")).toBe("hello world");
  });

  it("writes Buffer content correctly", async () => {
    const target = join(tmp, "out.bin");
    const buf = Buffer.from([0x48, 0x69]); // "Hi"
    await atomicWriteFile(target, buf);
    expect(readFileSync(target).equals(buf)).toBe(true);
  });

  it("overwrites an existing file atomically", async () => {
    const target = join(tmp, "existing.txt");
    writeFileSync(target, "original content");
    await atomicWriteFile(target, "new content");
    expect(readFileSync(target, "utf8")).toBe("new content");
  });

  it("throws IOError when target dir does not exist", async () => {
    const target = join(tmp, "no-such-dir", "file.txt");
    let caught: unknown;
    try {
      await atomicWriteFile(target, "data");
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(IOError);
    expect((caught as IOError).operation).toBe("atomicWrite");
    expect((caught as IOError).path).toBe(target);
  });
});

describe("cleanDirectory", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "opensips-fs-helpers-"));
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("removes all contents but preserves the directory itself", async () => {
    const target = join(tmp, "to-clean");
    mkdirSync(target);
    writeFileSync(join(target, "a.txt"), "a");
    writeFileSync(join(target, "b.txt"), "b");

    await cleanDirectory(target);

    expect(existsSync(target)).toBe(true);
    expect(statSync(target).isDirectory()).toBe(true);
    expect(readdirSync(target)).toEqual([]);
  });

  it("removes nested subdirectories recursively", async () => {
    const target = join(tmp, "deep");
    mkdirSync(target);
    mkdirSync(join(target, "sub1"));
    mkdirSync(join(target, "sub1", "sub2"));
    writeFileSync(join(target, "sub1", "file.txt"), "x");
    writeFileSync(join(target, "sub1", "sub2", "leaf.txt"), "y");
    writeFileSync(join(target, "top.txt"), "z");

    await cleanDirectory(target);

    expect(existsSync(target)).toBe(true);
    expect(readdirSync(target)).toEqual([]);
  });

  it("is a no-op (no throw) when the directory does not exist", async () => {
    const missing = join(tmp, "never-existed");
    await expect(cleanDirectory(missing)).resolves.toBeUndefined();
    expect(existsSync(missing)).toBe(false);
  });
});

describe("ensureDirectory", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "opensips-fs-helpers-"));
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("creates a missing directory", async () => {
    const target = join(tmp, "newdir");
    await ensureDirectory(target);
    expect(existsSync(target)).toBe(true);
    expect(statSync(target).isDirectory()).toBe(true);
  });

  it("is idempotent — no error when directory already exists", async () => {
    const target = join(tmp, "already-here");
    mkdirSync(target);
    await expect(ensureDirectory(target)).resolves.toBeUndefined();
    expect(existsSync(target)).toBe(true);
  });

  it("creates intermediate parent directories (mkdir -p semantics)", async () => {
    const target = join(tmp, "a", "b", "c", "d");
    await ensureDirectory(target);
    expect(existsSync(target)).toBe(true);
    expect(statSync(target).isDirectory()).toBe(true);
    expect(statSync(join(tmp, "a", "b")).isDirectory()).toBe(true);
  });
});

describe("readJsonFile", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "opensips-fs-helpers-"));
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("reads and parses valid JSON", async () => {
    const target = join(tmp, "valid.json");
    writeFileSync(target, JSON.stringify({ a: 1, b: ["x", "y"] }));
    const result = await readJsonFile<{ a: number; b: string[] }>(target);
    expect(result).toEqual({ a: 1, b: ["x", "y"] });
  });

  it("throws IOError with operation='read' when file does not exist", async () => {
    const target = join(tmp, "missing.json");
    let caught: unknown;
    try {
      await readJsonFile(target);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(IOError);
    expect((caught as IOError).operation).toBe("read");
    expect((caught as IOError).path).toBe(target);
  });

  it("throws IOError with operation='parse' when content is malformed JSON", async () => {
    const target = join(tmp, "bad.json");
    writeFileSync(target, "{ not valid json");
    let caught: unknown;
    try {
      await readJsonFile(target);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(IOError);
    expect((caught as IOError).operation).toBe("parse");
    expect((caught as IOError).path).toBe(target);
  });
});

describe("posixPath", () => {
  it("joins simple segments with forward slashes", () => {
    expect(posixPath("a", "b", "c")).toBe("a/b/c");
  });

  it("flattens segments that already contain forward slashes", () => {
    expect(posixPath("a", "b/c", "d")).toBe("a/b/c/d");
  });

  it("normalizes ./ and ../", () => {
    expect(posixPath("./a", "../b")).toBe("b");
  });

  it("converts backslashes to forward slashes (Windows correctness)", () => {
    expect(posixPath("a\\b", "c")).toBe("a/b/c");
  });

  it("converts backslashes inside multi-segment inputs", () => {
    expect(posixPath("foo\\bar\\baz", "qux\\quux")).toBe("foo/bar/baz/qux/quux");
  });

  it("does not produce a leading ./", () => {
    expect(posixPath("a", "b").startsWith("./")).toBe(false);
    expect(posixPath("./a", "b").startsWith("./")).toBe(false);
  });
});
