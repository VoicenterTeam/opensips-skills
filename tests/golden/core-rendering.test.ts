/**
 * Golden-file regression tests for the aggregated core-document renderer.
 *
 * Each test reads a real core JSON fixture under
 * `tests/__fixtures__/golden/3.6/core/`, runs `renderCoreDocument`, and
 * asserts byte-equal against the committed expected Markdown under
 * `tests/__fixtures__/golden/expected/3.6/core/`.
 *
 * The three fixtures cover three distinct doc shapes:
 *   - `variables.json` (`core_variable`)  — many items, pseudo-variable shape.
 *   - `operators.json` (`operator`)       — items with non-identifier symbols
 *                                            in headings (e.g. `+`, `=`).
 *   - `flags.json`     (`flag`)           — flag-types each with sub-elements.
 *
 * ## Update workflow
 *
 * If a renderer change legitimately changes output, regenerate the expected
 * files by running:
 *
 *     npx tsx tests/__fixtures__/golden/regenerate.ts
 *
 * Then carefully review the diff before committing. See
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

import {
  renderCoreDocument,
  type CoreDocType,
} from "../../scripts/render-core/index.js";
import {
  CoreVariableDocumentSchema,
  OperatorDocumentSchema,
  FlagDocumentSchema,
} from "../../scripts/schemas/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "..", "__fixtures__", "golden");
const VERSION = "3.6";
const GENERATOR_VERSION = "0.1.0";

interface CoreCase {
  /** Source filename stem (matches both `.json` and `.md`). */
  readonly stem: string;
  /** {@link CoreDocType} discriminator passed to the renderer. */
  readonly docType: CoreDocType;
  /** Schema parser callable for the doc shape. */
  readonly parse: (raw: unknown) => unknown;
}

const CORE_CASES: readonly CoreCase[] = [
  {
    stem: "variables",
    docType: "core_variable",
    parse: (raw) => CoreVariableDocumentSchema.parse(raw),
  },
  {
    stem: "operators",
    docType: "operator",
    parse: (raw) => OperatorDocumentSchema.parse(raw),
  },
  {
    stem: "flags",
    docType: "flag",
    parse: (raw) => FlagDocumentSchema.parse(raw),
  },
];

describe("golden / core rendering", () => {
  for (const c of CORE_CASES) {
    it(`renders ${c.stem}.json byte-equal to expected/${c.stem}.md`, () => {
      const sourcePath = resolve(
        FIXTURE_ROOT,
        VERSION,
        "core",
        `${c.stem}.json`,
      );
      const expectedPath = resolve(
        FIXTURE_ROOT,
        "expected",
        VERSION,
        "core",
        `${c.stem}.md`,
      );
      const source: unknown = JSON.parse(readFileSync(sourcePath, "utf-8"));
      const expected = readFileSync(expectedPath, "utf-8");
      const validated = c.parse(source);
      const actual = renderCoreDocument(
        validated,
        c.docType,
        VERSION,
        GENERATOR_VERSION,
      );
      expect(actual).toBe(expected);
    });
  }
});
