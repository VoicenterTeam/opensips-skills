/**
 * Golden-file regression tests for the per-module renderer.
 *
 * Each test reads a real module JSON fixture under
 * `tests/__fixtures__/golden/3.6/modules/`, runs `renderModule`, and asserts
 * byte-equal against the committed expected Markdown under
 * `tests/__fixtures__/golden/expected/3.6/modules/`.
 *
 * ## Update workflow
 *
 * If a renderer change legitimately changes output, regenerate the expected
 * files by running:
 *
 *     npx tsx tests/__fixtures__/golden/regenerate.ts
 *
 * Then carefully review the diff before committing — a small, focused diff
 * is expected; a sprawling diff suggests an unintended regression. See
 * `docs/plan/09-test-suite-and-ci.md` Risks: "Golden-file rot".
 *
 * Cross-references:
 *   - Determinism contract: `docs/architecture/data-pipeline.md` §3.
 *   - Renderer-templates spec: `docs/architecture/rendering-templates.md`.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { renderModule } from "../../scripts/render-module/index.js";
import { ModuleDocumentSchema } from "../../scripts/schemas/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "..", "__fixtures__", "golden");
const VERSION = "3.6";
const GENERATOR_VERSION = "0.1.0";

const MODULE_SLUGS = ["acc", "sl", "tm"] as const;

describe("golden / module rendering", () => {
  for (const slug of MODULE_SLUGS) {
    it(`renders ${slug}.json byte-equal to expected/${slug}.md`, () => {
      const sourcePath = resolve(
        FIXTURE_ROOT,
        VERSION,
        "modules",
        `${slug}.json`,
      );
      const expectedPath = resolve(
        FIXTURE_ROOT,
        "expected",
        VERSION,
        "modules",
        `${slug}.md`,
      );
      const source: unknown = JSON.parse(readFileSync(sourcePath, "utf-8"));
      const expected = readFileSync(expectedPath, "utf-8");
      const validated = ModuleDocumentSchema.parse(source);
      const actual = renderModule(validated, VERSION, GENERATOR_VERSION);
      expect(actual).toBe(expected);
    });
  }
});
