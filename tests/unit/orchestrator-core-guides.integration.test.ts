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

/**
 * Integration tests covering the M4 Tasks 4.6/4.7 wiring of the core
 * composer and guide composer into the orchestrator.
 *
 * These tests run `main()` end-to-end against tiny tmp source trees built
 * by copying real `data/3.6/core/` and `data/3.6/guides/` JSON into a
 * scratch directory. Each test uses an isolated tmp `--source-root` AND
 * an isolated tmp `--output-root` so the committed
 * `plugins/opensips/skills/...` tree is never touched by the test run.
 *
 * The four scenarios:
 *   1. All 12 core types + 3 guides for 3.6: every expected `.md` file is
 *      produced at the correct path under `opensips-routing/`.
 *   2. No `guides/` directory: build succeeds, no guides directory is
 *      created in the output tree, no error is reported.
 *   3. Build-twice determinism on the integration tmp: byte-identical
 *      output across two consecutive builds (one core file + one guide
 *      file spot-checked).
 *   4. Path placement: core files end up under `opensips-routing/`, NOT
 *      under `opensips-modules/`.
 */
describe("orchestrator core + guides rendering integration", () => {
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

  /**
   * The complete list of canonical core JSON filenames the validator
   * recognises (one per CoreDocType). Mirrors `data/3.6/core/`.
   */
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
   * The expected output filenames for the core composer (mirrored from
   * `coreFileNames`). These are what should appear under
   * `<outputRoot>/opensips-routing/references/3.6/core/`.
   */
  const EXPECTED_CORE_OUTPUT = [
    "async.md",
    "events.md",
    "flags.md",
    "functions.md",
    "mi-commands.md",
    "operators.md",
    "parameters.md",
    "routes.md",
    "statements.md",
    "statistics.md",
    "transformations.md",
    "variables.md",
  ];

  const GUIDE_FILES = [
    "configuration.json",
    "installation.json",
    "syntax.json",
  ];
  const EXPECTED_GUIDE_OUTPUT = [
    "configuration.md",
    "installation.md",
    "syntax.md",
  ];

  /**
   * Materialise a tmp source tree containing the full 3.6 core + guides
   * data plus a single throw-away module so the upstream slug-uniqueness
   * gate has something to chew on. Modules are not the focus of these
   * tests, but the orchestrator's per-version pipeline still runs the
   * module loop unconditionally.
   * @param opts.includeGuides - Whether to copy `guides/` into the tmp
   *   source root. False when testing the no-guides path.
   * @returns The absolute path to the tmp source root (parent of `3.6/`).
   */
  function tmpSourceWithCoreAndOptionalGuides(opts: {
    includeGuides: boolean;
  }): string {
    const root = mkTmp("opensips-orch-cg-src-");
    const versionDir = join(root, "3.6");

    // core/ — full 12-file copy.
    const coreDir = join(versionDir, "core");
    mkdirSync(coreDir, { recursive: true });
    for (const file of CORE_FILES) {
      cpSync(join("data", "3.6", "core", file), join(coreDir, file));
    }

    // modules/ — single sentinel module so renderModulesForVersion has
    // something to iterate (its uniqueness gate would otherwise be a
    // no-op anyway, but we keep the pipeline shape realistic).
    const modulesDir = join(versionDir, "modules");
    mkdirSync(modulesDir, { recursive: true });
    cpSync(
      join("data", "3.6", "modules", "sl.json"),
      join(modulesDir, "sl.json"),
    );

    if (opts.includeGuides) {
      const guidesDir = join(versionDir, "guides");
      mkdirSync(guidesDir, { recursive: true });
      for (const file of GUIDE_FILES) {
        cpSync(join("data", "3.6", "guides", file), join(guidesDir, file));
      }
    }

    return root;
  }

  it("renders all 12 core files and all 3 guide files for 3.6", async () => {
    const srcRoot = tmpSourceWithCoreAndOptionalGuides({ includeGuides: true });
    const outRoot = mkTmp("opensips-orch-cg-out-");

    const code = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    const coreDir = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "core",
    );
    for (const out of EXPECTED_CORE_OUTPUT) {
      expect(existsSync(join(coreDir, out))).toBe(true);
    }

    const guidesDir = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "guides",
    );
    for (const out of EXPECTED_GUIDE_OUTPUT) {
      expect(existsSync(join(guidesDir, out))).toBe(true);
    }
  });

  it("renders 12 core files and creates no guides directory when source has no guides/", async () => {
    const srcRoot = tmpSourceWithCoreAndOptionalGuides({
      includeGuides: false,
    });
    const outRoot = mkTmp("opensips-orch-cg-out-");

    const code = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    // Core files still produced.
    const coreDir = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "core",
    );
    for (const out of EXPECTED_CORE_OUTPUT) {
      expect(existsSync(join(coreDir, out))).toBe(true);
    }

    // Guides directory must not exist — the renderer is a no-op.
    const guidesDir = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "guides",
    );
    expect(existsSync(guidesDir)).toBe(false);

    // No "no-guides" error should be surfaced.
    const stderrText = stderrSpy.mock.calls.map((c) => String(c[0])).join("");
    expect(stderrText).not.toMatch(/guides.*missing/i);
  });

  it("build-twice produces byte-identical output for one core and one guide file (determinism)", async () => {
    const srcRoot = tmpSourceWithCoreAndOptionalGuides({ includeGuides: true });
    const outRoot = mkTmp("opensips-orch-cg-out-");

    const corePath = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "core",
      "variables.md",
    );
    const guidePath = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "guides",
      "installation.md",
    );

    const code1 = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code1).toBe(0);
    const core1 = readFileSync(corePath);
    const guide1 = readFileSync(guidePath);

    const code2 = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code2).toBe(0);
    const core2 = readFileSync(corePath);
    const guide2 = readFileSync(guidePath);

    expect(core2.equals(core1)).toBe(true);
    expect(guide2.equals(guide1)).toBe(true);
  });

  it("places core files under opensips-routing/, not opensips-modules/", async () => {
    const srcRoot = tmpSourceWithCoreAndOptionalGuides({ includeGuides: true });
    const outRoot = mkTmp("opensips-orch-cg-out-");

    const code = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    // Positive: core dir under opensips-routing exists with content.
    const correctCorePath = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "core",
      "variables.md",
    );
    expect(existsSync(correctCorePath)).toBe(true);

    // Negative: core dir under opensips-modules must NOT exist.
    const wrongCorePath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "core",
    );
    expect(existsSync(wrongCorePath)).toBe(false);

    // Same check for guides.
    const correctGuidePath = join(
      outRoot,
      "opensips-routing",
      "references",
      "3.6",
      "guides",
      "installation.md",
    );
    expect(existsSync(correctGuidePath)).toBe(true);

    const wrongGuidePath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "guides",
    );
    expect(existsSync(wrongGuidePath)).toBe(false);
  });
});
