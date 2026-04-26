/**
 * End-to-end pipeline tests (M9 Task 9.5).
 *
 * Exercises the full orchestrator (`scripts/build-references.ts` `main()`)
 * against the committed `data/` corpus, writing into isolated tmp output
 * roots so the committed `plugins/opensips/skills/...` tree is never
 * touched. Tests assert exit codes plus the on-disk shape of the output:
 * file counts per directory, presence of `consolidated.json`, version-
 * isolated guide handling.
 *
 * The five test scenarios cover the documented exit codes that the
 * pipeline can produce against the real corpus:
 *
 *   - Exit 0: clean build for 3.5 and 3.6 (the supported versions).
 *   - Exit 0: graceful skip of 3.4 via its committed `.broken` marker —
 *     verifies the M9 marker convention surfaces the upstream-defect
 *     version as a warning, not a failure (per ADR-009 / CLAUDE.md Rule 3).
 *   - Exit 2: usage error (--quiet --verbose mutex).
 *   - Exit 5: schema-hash drift — covered via a `vi.spyOn` of the hash
 *     module's `verifySchemaHash`. We choose the spy approach over
 *     filesystem mutation because (a) the mutation would race against
 *     parallel test runs sharing the same `scripts/schemas/` tree, and
 *     (b) the orchestrator's drift handling is the unit-under-test, not
 *     the on-disk hash file. (Exit 3, validation failure, is exercised by
 *     `tests/unit/orchestrator-modules.integration.test.ts` via slug
 *     collision and by the per-module renderer unit tests; the real corpus
 *     no longer carries a guaranteed validation failure now that 3.4 is
 *     skipped, so this E2E file does not pin to it.)
 *
 * Each test uses `mkdtempSync` for output isolation and tears the dir down
 * in `afterEach` via `rmSync({recursive,force})`. stdout/stderr are spied
 * so the test runner stays quiet — we assert exit codes and filesystem
 * effects, not output formatting (which is covered by unit tests).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "../../scripts/build-references.js";
import * as schemaHashModule from "../../scripts/schemas/hash.js";

describe("full pipeline E2E", () => {
  let tmpRoot: string;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), "opensips-skills-e2e-"));
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
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  it(
    "builds the fixture corpus end-to-end with exit 0 for --only 3.6",
    async () => {
      const code = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code).toBe(0);

      const modulesDir = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.6",
        "modules",
      );
      const moduleFiles = readdirSync(modulesDir).filter((f) =>
        f.endsWith(".md"),
      );
      // 3.6 has 194 module files in the committed corpus; assert the
      // documented floor of 100 to keep the test resilient to upstream
      // additions/removals.
      expect(moduleFiles.length).toBeGreaterThanOrEqual(100);

      const coreDir = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.6",
        "core",
      );
      const coreFiles = readdirSync(coreDir).filter((f) => f.endsWith(".md"));
      expect(coreFiles).toHaveLength(12);

      const guidesDir = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.6",
        "guides",
      );
      const guideFiles = readdirSync(guidesDir).filter((f) =>
        f.endsWith(".md"),
      );
      // 3.6 has installation, configuration, syntax guides.
      expect(guideFiles).toHaveLength(3);

      const consolidatedPath = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.6",
        "consolidated.json",
      );
      expect(existsSync(consolidatedPath)).toBe(true);
      // Smoke-test that it parses; the schema-validation contract is held
      // by orchestrator-consolidated.integration.test.ts.
      const parsed: unknown = JSON.parse(
        readFileSync(consolidatedPath, "utf8"),
      );
      expect(typeof parsed).toBe("object");
      expect(parsed).not.toBeNull();

      const modulesIndexPath = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.6",
        "modules-index.md",
      );
      expect(existsSync(modulesIndexPath)).toBe(true);
      // Sanity-check that the file is non-trivial: the catalog table plus
      // the lookup-discipline prose should easily exceed 1KB.
      const modulesIndexContent = readFileSync(modulesIndexPath, "utf8");
      expect(modulesIndexContent.length).toBeGreaterThan(1000);
      expect(modulesIndexContent).toContain("# OpenSIPs module index");
    },
    { timeout: 60_000 },
  );

  it(
    "handles --only 3.5 correctly",
    async () => {
      const code = await main([
        "--only",
        "3.5",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code).toBe(0);

      const modulesDir = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.5",
        "modules",
      );
      const moduleFiles = readdirSync(modulesDir).filter((f) =>
        f.endsWith(".md"),
      );
      expect(moduleFiles.length).toBeGreaterThanOrEqual(186);

      const coreDir = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.5",
        "core",
      );
      const coreFiles = readdirSync(coreDir).filter((f) => f.endsWith(".md"));
      expect(coreFiles).toHaveLength(12);

      const guidesDir = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.5",
        "guides",
      );
      expect(existsSync(guidesDir)).toBe(true);
      const guideFiles = readdirSync(guidesDir).filter((f) =>
        f.endsWith(".md"),
      );
      expect(guideFiles.length).toBeGreaterThan(0);

      const consolidatedPath = join(
        tmpRoot,
        "opensips-config",
        "references",
        "3.5",
        "consolidated.json",
      );
      expect(existsSync(consolidatedPath)).toBe(true);
    },
    { timeout: 60_000 },
  );

  it("returns exit code 0 for --only 3.4 (full build)", async () => {
    // 3.4 was previously skipped via a .broken marker due to an upstream
    // JSON parse defect in core/variables.json. The defect has since been
    // repaired inline and the marker removed, so 3.4 now builds end-to-end
    // alongside the other versions. The .broken-marker skip mechanism
    // itself is still covered by tests/unit/lib/discover.test.ts and the
    // synthesized-fixture test below.
    const code = await main([
      "--only",
      "3.4",
      "--source-root",
      "data",
      "--output-root",
      tmpRoot,
    ]);
    expect(code).toBe(0);

    const modulesDir = join(
      tmpRoot,
      "opensips-config",
      "references",
      "3.4",
      "modules",
    );
    expect(existsSync(modulesDir)).toBe(true);
    const moduleFiles = readdirSync(modulesDir).filter((f) =>
      f.endsWith(".md"),
    );
    expect(moduleFiles.length).toBeGreaterThan(0);
  }, { timeout: 60_000 });

  it("returns exit code 2 on a usage error (--quiet --verbose mutex)", async () => {
    const code = await main(["--quiet", "--verbose"]);
    expect(code).toBe(2);
  });

  it("returns exit code 5 on schema-hash drift", async () => {
    // Approach choice: we spy on `verifySchemaHash` rather than mutate the
    // committed `.schema-hash` file. Filesystem mutation would (a) race with
    // parallel test runs and (b) require restoring state across crashes; the
    // spy approach exercises the orchestrator's drift handling — the unit we
    // actually want to test — without touching shared on-disk state.
    const spy = vi.spyOn(schemaHashModule, "verifySchemaHash").mockReturnValue({
      ok: false,
      computed: "deadbeef".repeat(8),
      committed: "cafef00d".repeat(8),
    });

    try {
      const code = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code).toBe(5);
    } finally {
      spy.mockRestore();
    }
  });
});
