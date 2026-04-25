import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "../../scripts/build-references.js";
import {
  ConsolidatedIndexSchema,
  CONSOLIDATED_SCHEMA_VERSION,
} from "../../scripts/types/consolidated.js";

/**
 * Integration tests covering the M5 Task 5.5 wiring of the consolidated-index
 * builder into the orchestrator.
 *
 * These tests exercise `main()` end-to-end against tmp source trees built by
 * copying real `data/3.6/` JSON into a scratch directory. Each test uses an
 * isolated tmp `--source-root` AND an isolated tmp `--output-root` so the
 * committed `plugins/opensips/skills/...` tree is never touched.
 *
 * Six scenarios:
 *   1. Index file written: consolidated.json appears at the expected path,
 *      parses, and conforms to ConsolidatedIndexSchema.
 *   2. Statistics non-zero: built index records non-zero modules / functions
 *      / parameters for a real 3.6 slice.
 *   3. Build-twice determinism: byte-identical consolidated.json across two
 *      consecutive runs.
 *   4. First-run canary: builds against a tmp-isolated cwd that has no
 *      committed baseline file, expects the first-run hint on stderr.
 *   5. Dry-run: no consolidated.json written; verbose stats line still
 *      emitted; VersionResult.indexBuilt is true.
 *   6. JSON summary: VersionResult.indexBuilt is true on a successful build.
 */
describe("orchestrator consolidated-index integration", () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;
  const tmpDirs: string[] = [];

  beforeEach(() => {
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
    for (const dir of tmpDirs.splice(0)) {
      if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  /**
   * Allocate a fresh temp dir, register it for cleanup, and return its path.
   * @param prefix - Filename prefix for `mkdtempSync`.
   * @returns The created absolute path.
   */
  function mkTmp(prefix: string): string {
    const p = mkdtempSync(join(tmpdir(), prefix));
    tmpDirs.push(p);
    return p;
  }

  /** Canonical core JSON filenames mirrored from `data/3.6/core/`. */
  const CORE_FILES = [
    "async.json",
    "events.json",
    "flags.json",
    "functions.json",
    "mi-commands.json",
    "operators.json",
    "parameters.json",
    "routes.json",
    "statements.json",
    "statistics.json",
    "transformations.json",
    "variables.json",
  ];

  /**
   * Materialise a tmp source tree containing real 3.6 core + a small slice
   * of modules + the three guides. Big enough to produce a meaningful index
   * but small enough to keep the test fast.
   * @returns The absolute path to the tmp source root (parent of `3.6/`).
   */
  function tmpSourceForIndex(): string {
    const root = mkTmp("opensips-orch-idx-src-");
    const versionDir = join(root, "3.6");

    const coreDir = join(versionDir, "core");
    mkdirSync(coreDir, { recursive: true });
    for (const file of CORE_FILES) {
      cpSync(join("data", "3.6", "core", file), join(coreDir, file));
    }

    const modulesDir = join(versionDir, "modules");
    mkdirSync(modulesDir, { recursive: true });
    // A small handful of real modules, chosen for diverse exports:
    //   - tm exports many functions + MI commands
    //   - sl exports a handful of functions
    //   - dispatcher has parameters and dependencies
    for (const m of ["tm.json", "sl.json", "dispatcher.json"]) {
      cpSync(join("data", "3.6", "modules", m), join(modulesDir, m));
    }

    const guidesDir = join(versionDir, "guides");
    mkdirSync(guidesDir, { recursive: true });
    for (const g of ["installation.json", "configuration.json", "syntax.json"]) {
      cpSync(join("data", "3.6", "guides", g), join(guidesDir, g));
    }

    return root;
  }

  it("writes consolidated.json at the canonical path and it parses against the schema", async () => {
    const srcRoot = tmpSourceForIndex();
    const outRoot = mkTmp("opensips-orch-idx-out-");

    const code = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    const indexPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "consolidated.json",
    );
    expect(existsSync(indexPath)).toBe(true);

    const raw = JSON.parse(readFileSync(indexPath, "utf-8")) as unknown;
    const parsed = ConsolidatedIndexSchema.parse(raw);
    expect(parsed.schema_version).toBe(CONSOLIDATED_SCHEMA_VERSION);
    expect(parsed.version).toBe("3.6");
  });

  it("records non-zero statistics for the real 3.6 slice", async () => {
    const srcRoot = tmpSourceForIndex();
    const outRoot = mkTmp("opensips-orch-idx-out-");

    const code = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    const indexPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "consolidated.json",
    );
    const idx = ConsolidatedIndexSchema.parse(
      JSON.parse(readFileSync(indexPath, "utf-8")),
    );
    expect(idx.statistics.totalModules).toBeGreaterThan(0);
    expect(idx.statistics.totalFunctions).toBeGreaterThan(0);
    expect(idx.statistics.totalParameters).toBeGreaterThan(0);
    expect(idx.statistics.totalGuides).toBe(3);
  });

  it("build-twice produces byte-identical consolidated.json (determinism)", async () => {
    const srcRoot = tmpSourceForIndex();
    const outRoot = mkTmp("opensips-orch-idx-out-");
    const indexPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "consolidated.json",
    );

    const c1 = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(c1).toBe(0);
    const buf1 = readFileSync(indexPath);

    const c2 = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(c2).toBe(0);
    const buf2 = readFileSync(indexPath);

    expect(buf2.equals(buf1)).toBe(true);
  });

  it("emits the first-run baseline hint when no baseline file exists", async () => {
    // The committed baseline file is at the project root; we can't easily
    // pretend it does not exist for the in-process orchestrator. Instead we
    // verify the canary helper's first-run path is reachable: with a fresh
    // version label that is NOT yet keyed in the committed baseline file,
    // checkStatisticsCanary returns firstRun=true and the orchestrator
    // emits the hint.
    //
    // We construct a tmp source tree under a synthetic version directory
    // ("9.99") to ensure the version is absent from any committed baseline.
    const srcRoot = mkTmp("opensips-orch-idx-firstrun-");
    const versionDir = join(srcRoot, "9.99");
    const coreDir = join(versionDir, "core");
    mkdirSync(coreDir, { recursive: true });
    for (const file of CORE_FILES) {
      cpSync(join("data", "3.6", "core", file), join(coreDir, file));
    }
    const modulesDir = join(versionDir, "modules");
    mkdirSync(modulesDir, { recursive: true });
    cpSync(
      join("data", "3.6", "modules", "sl.json"),
      join(modulesDir, "sl.json"),
    );

    const outRoot = mkTmp("opensips-orch-idx-out-");
    const code = await main([
      "--only",
      "9.99",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
      "--verbose",
    ]);
    expect(code).toBe(0);

    const stderrText = stderrSpy.mock.calls.map((c) => String(c[0])).join("");
    expect(stderrText).toMatch(
      /First build for 9\.99 — baseline not yet established\. Run `npm run baseline:update`/,
    );
  });

  it("dry-run does not write the consolidated index but still computes stats", async () => {
    const srcRoot = tmpSourceForIndex();
    const outRoot = mkTmp("opensips-orch-idx-out-");

    const code = await main([
      "--only",
      "3.6",
      "--dry-run",
      "--verbose",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    const indexPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "consolidated.json",
    );
    expect(existsSync(indexPath)).toBe(false);

    // Verbose stats line still emitted in dry-run.
    const stderrText = stderrSpy.mock.calls.map((c) => String(c[0])).join("");
    expect(stderrText).toMatch(/Built consolidated index \(\d+ modules,/);
    expect(stderrText).toContain("(dry-run)");
  });

  it("VersionResult.indexBuilt is reflected in the JSON summary on success", async () => {
    const srcRoot = tmpSourceForIndex();
    const outRoot = mkTmp("opensips-orch-idx-out-");

    const code = await main([
      "--only",
      "3.6",
      "--json",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    const stdoutText = stdoutSpy.mock.calls.map((c) => String(c[0])).join("");
    const parsed = JSON.parse(stdoutText) as {
      versions: Array<{ version: string; ok: boolean; indexBuilt: boolean }>;
    };
    expect(parsed.versions[0]?.indexBuilt).toBe(true);
  });

  it("VersionResult.indexBuilt is false in validate-only mode", async () => {
    const srcRoot = tmpSourceForIndex();
    const outRoot = mkTmp("opensips-orch-idx-out-");

    const code = await main([
      "--only",
      "3.6",
      "--validate-only",
      "--json",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    const stdoutText = stdoutSpy.mock.calls.map((c) => String(c[0])).join("");
    const parsed = JSON.parse(stdoutText) as {
      versions: Array<{ version: string; ok: boolean; indexBuilt: boolean }>;
    };
    expect(parsed.versions[0]?.indexBuilt).toBe(false);

    // The index file must not exist.
    const indexPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "consolidated.json",
    );
    expect(existsSync(indexPath)).toBe(false);
  });

});
