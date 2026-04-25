/**
 * Version-isolation E2E tests (M9 Task 9.5).
 *
 * Verifies the version-isolation contract from
 * `docs/architecture/data-pipeline.md` §5 / ADR-003: a build of version A's
 * source must produce zero references to version B in any generated
 * artifact (Markdown content, frontmatter, consolidated index `path`
 * fields). Each version's `consolidated.json` must report its own version
 * string.
 *
 * Strategy: run the orchestrator twice (once per version) into the same tmp
 * output root, then walk every generated file under each version's tree
 * and assert no cross-version path component appears in any byte of any
 * file. The check is intentionally string-level (rather than parsing
 * Markdown) because cross-version links could appear in any context: a
 * stray relative link, a copy-pasted path in a description, an indexer
 * accidentally citing the wrong version.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "../../scripts/build-references.js";

interface ConsolidatedIndexShape {
  version: string;
  indexes: {
    functionsByName: Record<string, { path: string }>;
    parametersByModule: Record<string, unknown>;
    variablesByName: Record<string, { path: string }>;
    miCommandsByName: Record<string, { path: string }>;
  };
}

/**
 * Walk a directory tree and yield every regular file's absolute path.
 * @param dir - Directory to walk.
 * @returns Array of absolute file paths.
 */
function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) {
      out.push(...walkFiles(abs));
    } else {
      out.push(abs);
    }
  }
  return out;
}

describe("version isolation E2E", () => {
  let tmpRoot: string;
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
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
    "no generated 3.6 file mentions references/3.5 and vice versa",
    async () => {
      // Build both versions into the same output root so the cross-version
      // check exercises sibling presence (the realistic shipping shape).
      const code35 = await main([
        "--only",
        "3.5",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code35).toBe(0);
      const code36 = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code36).toBe(0);

      const modules36 = walkFiles(
        join(tmpRoot, "opensips-config", "references", "3.6", "modules"),
      );
      for (const file of modules36) {
        const content = readFileSync(file, "utf8");
        expect(
          content,
          `3.6 module ${file} contains a 3.5 path reference`,
        ).not.toContain("references/3.5");
      }

      const modules35 = walkFiles(
        join(tmpRoot, "opensips-config", "references", "3.5", "modules"),
      );
      for (const file of modules35) {
        const content = readFileSync(file, "utf8");
        expect(
          content,
          `3.5 module ${file} contains a 3.6 path reference`,
        ).not.toContain("references/3.6");
      }
    },
    { timeout: 60_000 },
  );

  it(
    "no generated 3.6 core file mentions references/3.5 and vice versa",
    async () => {
      const code35 = await main([
        "--only",
        "3.5",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code35).toBe(0);
      const code36 = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code36).toBe(0);

      const core36 = walkFiles(
        join(tmpRoot, "opensips-config", "references", "3.6", "core"),
      );
      for (const file of core36) {
        const content = readFileSync(file, "utf8");
        expect(
          content,
          `3.6 core ${file} contains a 3.5 path reference`,
        ).not.toContain("references/3.5");
      }

      const core35 = walkFiles(
        join(tmpRoot, "opensips-config", "references", "3.5", "core"),
      );
      for (const file of core35) {
        const content = readFileSync(file, "utf8");
        expect(
          content,
          `3.5 core ${file} contains a 3.6 path reference`,
        ).not.toContain("references/3.6");
      }
    },
    { timeout: 60_000 },
  );

  it(
    "consolidated.json paths reference only the index's own version",
    async () => {
      const code35 = await main([
        "--only",
        "3.5",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code35).toBe(0);
      const code36 = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code36).toBe(0);

      const idx35 = JSON.parse(
        readFileSync(
          join(
            tmpRoot,
            "opensips-config",
            "references",
            "3.5",
            "consolidated.json",
          ),
          "utf8",
        ),
      ) as ConsolidatedIndexShape;
      const idx36 = JSON.parse(
        readFileSync(
          join(
            tmpRoot,
            "opensips-config",
            "references",
            "3.6",
            "consolidated.json",
          ),
          "utf8",
        ),
      ) as ConsolidatedIndexShape;

      const collectPaths = (idx: ConsolidatedIndexShape): string[] => {
        const paths: string[] = [];
        for (const lookup of [
          idx.indexes.functionsByName,
          idx.indexes.variablesByName,
          idx.indexes.miCommandsByName,
        ]) {
          for (const entry of Object.values(lookup)) {
            paths.push(entry.path);
          }
        }
        return paths;
      };

      for (const p of collectPaths(idx35)) {
        expect(p, `3.5 index entry path '${p}' mentions 3.6`).not.toContain(
          "/3.6/",
        );
      }
      for (const p of collectPaths(idx36)) {
        expect(p, `3.6 index entry path '${p}' mentions 3.5`).not.toContain(
          "/3.5/",
        );
      }
    },
    { timeout: 60_000 },
  );

  it(
    "consolidated.json `version` field matches its directory",
    async () => {
      const code35 = await main([
        "--only",
        "3.5",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code35).toBe(0);
      const code36 = await main([
        "--only",
        "3.6",
        "--source-root",
        "data",
        "--output-root",
        tmpRoot,
      ]);
      expect(code36).toBe(0);

      const idx35 = JSON.parse(
        readFileSync(
          join(
            tmpRoot,
            "opensips-config",
            "references",
            "3.5",
            "consolidated.json",
          ),
          "utf8",
        ),
      ) as ConsolidatedIndexShape;
      const idx36 = JSON.parse(
        readFileSync(
          join(
            tmpRoot,
            "opensips-config",
            "references",
            "3.6",
            "consolidated.json",
          ),
          "utf8",
        ),
      ) as ConsolidatedIndexShape;

      expect(idx35.version).toBe("3.5");
      expect(idx36.version).toBe("3.6");
    },
    { timeout: 60_000 },
  );
});
