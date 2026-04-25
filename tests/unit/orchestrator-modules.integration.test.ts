import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "../../scripts/build-references.js";

/**
 * Integration tests covering the M3 Task 3.7 wiring of the per-module
 * renderer into the orchestrator.
 *
 * These tests exercise the full `main()` CLI entry point end-to-end against
 * tiny tmp source trees (one or two real `data/3.6/modules/*.json`
 * documents copied into a fresh tmp dir). Each test uses an isolated tmp
 * `--source-root` AND an isolated tmp `--output-root` so the committed
 * `plugins/opensips/skills/...` tree is never touched by the test run.
 *
 * The four scenarios:
 *   1. dry-run path emits "would write" lines without creating files.
 *   2. real-write path produces the expected `.md` file with the canonical
 *      H1 + provenance comment.
 *   3. build-twice determinism: byte-identical output across two runs.
 *   4. slug collision: two source files whose `module_name` collapse to
 *      the same slug must fail the build (exit 3) before any write.
 */
describe("orchestrator per-module rendering integration", () => {
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
   * Materialise a tmp source tree containing exactly the supplied module
   * fixture (copied from the committed `data/3.6/modules/`) under the
   * required `<tmp>/3.6/modules/<basename>.json` path.
   * @param srcModuleBasename - The committed module file under `data/3.6/modules/`
   *   to copy (e.g., `"sl.json"`).
   * @returns The absolute path to the tmp source root (parent of `3.6/`).
   */
  function tmpSourceWithModule(srcModuleBasename: string): string {
    const root = mkTmp("opensips-orch-src-");
    const modulesDir = join(root, "3.6", "modules");
    mkdirSync(modulesDir, { recursive: true });
    const src = join("data", "3.6", "modules", srcModuleBasename);
    cpSync(src, join(modulesDir, srcModuleBasename));
    return root;
  }

  it("dry-run on a single-module tmp source emits would-write progress and writes nothing", async () => {
    const srcRoot = tmpSourceWithModule("sl.json");
    const outRoot = mkTmp("opensips-orch-out-");

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

    const stderrText = stderrSpy.mock.calls.map((c) => String(c[0])).join("");
    // Dry-run still walks the renderer; the count comes from the actual
    // discovered module list, not a hardcoded number.
    expect(stderrText).toMatch(/Would render 1 module file/);

    // Critically: nothing written to disk.
    const expectedPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "modules",
      "sl.md",
    );
    expect(existsSync(expectedPath)).toBe(false);
  });

  it("normal mode renders the .md file with the canonical H1", async () => {
    const srcRoot = tmpSourceWithModule("sl.json");
    const outRoot = mkTmp("opensips-orch-out-");

    const code = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(0);

    const expectedPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "modules",
      "sl.md",
    );
    expect(existsSync(expectedPath)).toBe(true);
    const content = readFileSync(expectedPath, "utf8");
    expect(content.startsWith("# sl Module Reference\n")).toBe(true);
    // Provenance comment present.
    expect(content).toContain("<!-- generated-from: data/3.6/modules/sl.json");
    // No write-file-atomic temp filename leaked into output.
    expect(content).not.toContain(".tmp.");
  });

  it("build-twice produces byte-identical output (determinism)", async () => {
    const srcRoot = tmpSourceWithModule("sl.json");
    const outRoot = mkTmp("opensips-orch-out-");
    const expectedPath = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "modules",
      "sl.md",
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
    const first = readFileSync(expectedPath);

    const code2 = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code2).toBe(0);
    const second = readFileSync(expectedPath);

    expect(second.equals(first)).toBe(true);
  });

  it("slug collision is detected, exits 3, and writes nothing for the colliding version", async () => {
    const srcRoot = mkTmp("opensips-orch-src-");
    const outRoot = mkTmp("opensips-orch-out-");
    const modulesDir = join(srcRoot, "3.6", "modules");
    mkdirSync(modulesDir, { recursive: true });

    // Two schema-valid module documents whose `module_name` values
    // collapse to the same slug ("tm" and "TM" both → "tm").
    const lower = makeMinimalModuleJson("tm", "module-tm-3.6", "tm Module");
    const upper = makeMinimalModuleJson("TM", "module-TM-3.6", "TM Module");
    writeFileSync(join(modulesDir, "tm.json"), lower);
    writeFileSync(join(modulesDir, "tm-upper.json"), upper);

    const code = await main([
      "--only",
      "3.6",
      "--source-root",
      srcRoot,
      "--output-root",
      outRoot,
    ]);
    expect(code).toBe(3);

    // No file should have been written under the collision-failed version.
    const tmDir = join(
      outRoot,
      "opensips-modules",
      "references",
      "3.6",
      "modules",
    );
    if (existsSync(tmDir)) {
      // Directory may exist from a prior partial render attempt is fine,
      // but no module file should be present in either case.
      // Strict assertion: the collision path must short-circuit BEFORE any
      // write, so the canonical filename must not exist.
      expect(existsSync(join(tmDir, "tm.md"))).toBe(false);
    }

    const stderrText = stderrSpy.mock.calls.map((c) => String(c[0])).join("");
    expect(stderrText).toMatch(/slug collision/);
  });
});

/**
 * Produce a minimal but schema-valid `ModuleDocument` JSON payload as a
 * string. Used by the slug-collision test, where what matters is that
 * Zod accepts the file so the orchestrator reaches the slug-uniqueness
 * gate. Empty section arrays satisfy the required `exported_parameters`
 * and `exported_functions` fields.
 * @param moduleName - The `module_name` field driving the slug.
 * @param id - The `id` field (must be unique per file to keep validation happy).
 * @param title - The `title` field.
 * @returns A JSON string suitable for `writeFileSync`.
 */
function makeMinimalModuleJson(
  moduleName: string,
  id: string,
  title: string,
): string {
  const doc = {
    id,
    document_type: "module",
    version: "3.6",
    title,
    url: `https://opensips.org/html/docs/modules/3.6.x/${moduleName}.html`,
    content_markdown: "irrelevant",
    category: "Modules",
    extracted_at: "2026-03-01T00:00:00.000Z",
    module_name: moduleName,
    overview: `The ${moduleName} module.`,
    exported_parameters: [],
    exported_functions: [],
  };
  return JSON.stringify(doc, null, 2);
}
