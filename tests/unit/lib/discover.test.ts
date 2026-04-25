import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discoverVersions,
  discoverSourceFiles,
  DiscoverError,
} from "../../../scripts/lib/discover.js";

describe("discoverVersions", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "discover-versions-"));
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("returns an empty array when no version-shaped subdirectories exist", () => {
    expect(discoverVersions(tmp)).toEqual([]);
  });

  it("returns sorted versions when several exist", () => {
    mkdirSync(join(tmp, "3.6"));
    mkdirSync(join(tmp, "3.4"));
    mkdirSync(join(tmp, "3.5"));
    expect(discoverVersions(tmp)).toEqual(["3.4", "3.5", "3.6"]);
  });

  it("ignores subdirectories whose names do not match ^\\d+\\.\\d+$", () => {
    mkdirSync(join(tmp, "3.6"));
    mkdirSync(join(tmp, "3.6x"));
    mkdirSync(join(tmp, "latest"));
    mkdirSync(join(tmp, "tmp"));
    mkdirSync(join(tmp, "_test"));
    mkdirSync(join(tmp, "3"));
    mkdirSync(join(tmp, "3.6.1"));
    expect(discoverVersions(tmp)).toEqual(["3.6"]);
  });

  it("ignores files at the root (only directories count)", () => {
    mkdirSync(join(tmp, "3.5"));
    writeFileSync(join(tmp, "3.6"), "I am a file, not a dir");
    writeFileSync(join(tmp, "README.md"), "");
    expect(discoverVersions(tmp)).toEqual(["3.5"]);
  });

  it("throws DiscoverError when sourceRoot does not exist; error.path names the missing path", () => {
    const missing = join(tmp, "does-not-exist");
    let caught: unknown;
    try {
      discoverVersions(missing);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(DiscoverError);
    expect((caught as DiscoverError).path).toBe(missing);
    expect((caught as DiscoverError).code).toBe("DISCOVER_ERROR");
  });

  it("when called with no arguments, scans ./data relative to cwd", () => {
    // The real repo's ./data directory contains 3.4, 3.5, 3.6.
    const versions = discoverVersions();
    expect(versions).toEqual(expect.arrayContaining(["3.4", "3.5", "3.6"]));
    // And they should be sorted.
    expect([...versions].sort()).toEqual(versions);
  });
});

describe("discoverSourceFiles", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "discover-files-"));
  });

  afterEach(() => {
    if (existsSync(tmp)) {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  /**
   * Helper to scaffold a version directory inside `tmp`.
   * @param version - version string (e.g. "3.6")
   * @returns absolute path to the created version directory
   */
  function makeVersionDir(version: string): string {
    const v = join(tmp, version);
    mkdirSync(v);
    return v;
  }

  it("returns absolute, alphabetically-sorted JSON file paths for core/ and modules/", () => {
    const v = makeVersionDir("3.6");
    mkdirSync(join(v, "core"));
    mkdirSync(join(v, "modules"));
    writeFileSync(join(v, "core", "variables.json"), "{}");
    writeFileSync(join(v, "core", "async.json"), "{}");
    writeFileSync(join(v, "core", "operators.json"), "{}");
    writeFileSync(join(v, "modules", "tm.json"), "{}");
    writeFileSync(join(v, "modules", "acc.json"), "{}");

    const result = discoverSourceFiles(tmp, "3.6");

    // Sorted, POSIX-style absolute paths.
    expect(result.core).toEqual([
      `${v.replace(/\\/g, "/")}/core/async.json`,
      `${v.replace(/\\/g, "/")}/core/operators.json`,
      `${v.replace(/\\/g, "/")}/core/variables.json`,
    ]);
    expect(result.modules).toEqual([
      `${v.replace(/\\/g, "/")}/modules/acc.json`,
      `${v.replace(/\\/g, "/")}/modules/tm.json`,
    ]);
  });

  it("populates guides[] when guides/ exists", () => {
    const v = makeVersionDir("3.6");
    mkdirSync(join(v, "guides"));
    writeFileSync(join(v, "guides", "configuration.json"), "{}");
    writeFileSync(join(v, "guides", "installation.json"), "{}");
    writeFileSync(join(v, "guides", "syntax.json"), "{}");

    const result = discoverSourceFiles(tmp, "3.6");
    expect(result.guides).toEqual([
      `${v.replace(/\\/g, "/")}/guides/configuration.json`,
      `${v.replace(/\\/g, "/")}/guides/installation.json`,
      `${v.replace(/\\/g, "/")}/guides/syntax.json`,
    ]);
  });

  it("returns guides=[] (not error) when guides/ is absent", () => {
    const v = makeVersionDir("3.5");
    mkdirSync(join(v, "core"));
    mkdirSync(join(v, "modules"));
    writeFileSync(join(v, "core", "variables.json"), "{}");

    const result = discoverSourceFiles(tmp, "3.5");
    expect(result.guides).toEqual([]);
  });

  it("returns empty arrays for core/modules when those subdirectories are absent", () => {
    makeVersionDir("3.5");
    const result = discoverSourceFiles(tmp, "3.5");
    expect(result.core).toEqual([]);
    expect(result.modules).toEqual([]);
    expect(result.guides).toEqual([]);
  });

  it("skips the md/ directory entirely (no entries in any returned array)", () => {
    const v = makeVersionDir("3.6");
    mkdirSync(join(v, "core"));
    mkdirSync(join(v, "md"));
    mkdirSync(join(v, "md", "modules"));
    writeFileSync(join(v, "core", "variables.json"), "{}");
    // A stray .json directly under md/ — it should NOT appear in any result.
    writeFileSync(join(v, "md", "stray.json"), "{}");
    writeFileSync(join(v, "md", "modules", "tm.json"), "{}");

    const result = discoverSourceFiles(tmp, "3.6");
    expect(result.core).toHaveLength(1);
    // No file path should reference md/.
    const allPaths = [...result.core, ...result.modules, ...result.guides];
    for (const p of allPaths) {
      expect(p).not.toMatch(/\/md\//);
    }
  });

  it("skips opensips-X.Y-complete.json at the version root", () => {
    const v = makeVersionDir("3.6");
    mkdirSync(join(v, "core"));
    writeFileSync(join(v, "core", "variables.json"), "{}");
    writeFileSync(join(v, "opensips-3.6-complete.json"), "{}");

    const result = discoverSourceFiles(tmp, "3.6");
    // The complete file should not appear in any of the arrays.
    const allPaths = [...result.core, ...result.modules, ...result.guides];
    for (const p of allPaths) {
      expect(p).not.toMatch(/-complete\.json$/);
    }
    // Sanity: the legitimate file is still present.
    expect(result.core).toHaveLength(1);
  });

  it("filters out non-.json files in core/, modules/, guides/", () => {
    const v = makeVersionDir("3.6");
    mkdirSync(join(v, "core"));
    mkdirSync(join(v, "modules"));
    mkdirSync(join(v, "guides"));
    writeFileSync(join(v, "core", "variables.json"), "{}");
    writeFileSync(join(v, "core", "README.md"), "noise");
    writeFileSync(join(v, "modules", "tm.json"), "{}");
    writeFileSync(join(v, "modules", "tm.txt"), "noise");
    writeFileSync(join(v, "guides", "syntax.json"), "{}");
    writeFileSync(join(v, "guides", "syntax.md"), "noise");

    const result = discoverSourceFiles(tmp, "3.6");
    expect(result.core).toHaveLength(1);
    expect(result.modules).toHaveLength(1);
    expect(result.guides).toHaveLength(1);
    expect(result.core[0]!.endsWith(".json")).toBe(true);
    expect(result.modules[0]!.endsWith(".json")).toBe(true);
    expect(result.guides[0]!.endsWith(".json")).toBe(true);
  });

  it("returns POSIX-style paths (no backslashes even on Windows)", () => {
    const v = makeVersionDir("3.6");
    mkdirSync(join(v, "core"));
    writeFileSync(join(v, "core", "variables.json"), "{}");

    const result = discoverSourceFiles(tmp, "3.6");
    for (const p of result.core) {
      expect(p).not.toContain("\\");
    }
  });

  it("throws DiscoverError when the version directory does not exist", () => {
    let caught: unknown;
    try {
      discoverSourceFiles(tmp, "9.9");
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(DiscoverError);
    expect((caught as DiscoverError).path).toBe(join(tmp, "9.9"));
    expect((caught as DiscoverError).code).toBe("DISCOVER_ERROR");
  });

  it("uses ./data as default when sourceRoot is undefined", () => {
    // Reality-check against the real repo; 3.6 should at minimum have core/ and modules/.
    const result = discoverSourceFiles(undefined, "3.6");
    expect(result.core.length).toBeGreaterThan(0);
    expect(result.modules.length).toBeGreaterThan(0);
    // All POSIX paths.
    for (const p of [...result.core, ...result.modules, ...result.guides]) {
      expect(p).not.toContain("\\");
    }
  });
});
