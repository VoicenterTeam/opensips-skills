/**
 * Golden-file regression test for the consolidated-index builder.
 *
 * Reads the same six fixtures used by the per-module and core renderers
 * (three modules + three core docs), feeds them to
 * `buildConsolidatedIndex`, runs the result through the deterministic
 * serializer, and asserts byte-equal against the committed
 * `expected/3.6/consolidated.json`.
 *
 * ## Update workflow
 *
 * If a builder/serializer change legitimately changes output, regenerate
 * the expected files by running:
 *
 *     npx tsx tests/__fixtures__/golden/regenerate.ts
 *
 * Then carefully review the diff before committing. See
 * `docs/plan/09-test-suite-and-ci.md` Risks: "Golden-file rot".
 *
 * Cross-references:
 *   - Index shape: `docs/architecture/data-pipeline.md` §7.3.
 *   - Determinism contract: `docs/architecture/data-pipeline.md` §3.
 *   - Builder spec: `docs/plan/05-consolidated-index.md` §5.2.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildConsolidatedIndex,
  type ValidatedDocumentsForIndex,
} from "../../scripts/build-consolidated/index.js";
import { serializeIndex } from "../../scripts/build-consolidated/serialize.js";
import {
  ModuleDocumentSchema,
  CoreVariableDocumentSchema,
  OperatorDocumentSchema,
  FlagDocumentSchema,
} from "../../scripts/schemas/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "..", "__fixtures__", "golden");
const VERSION = "3.6";
const GENERATOR_VERSION = "0.1.0";

const MODULE_SLUGS = ["acc", "sl", "tm"] as const;

/**
 * Read and JSON-parse a fixture relative to the golden root.
 * @param parts - Path segments under `tests/__fixtures__/golden/`.
 * @returns The parsed JSON payload.
 */
function readFixture(...parts: string[]): unknown {
  return JSON.parse(readFileSync(resolve(FIXTURE_ROOT, ...parts), "utf-8"));
}

describe("golden / consolidated index", () => {
  it("serializes byte-equal to expected/consolidated.json", () => {
    const modules = MODULE_SLUGS.map((slug) =>
      ModuleDocumentSchema.parse(readFixture(VERSION, "modules", `${slug}.json`)),
    );
    const core: unknown[] = [
      CoreVariableDocumentSchema.parse(readFixture(VERSION, "core", "variables.json")),
      OperatorDocumentSchema.parse(readFixture(VERSION, "core", "operators.json")),
      FlagDocumentSchema.parse(readFixture(VERSION, "core", "flags.json")),
    ];

    const docs: ValidatedDocumentsForIndex = { modules, core, guides: [] };
    const { index } = buildConsolidatedIndex(VERSION, docs, GENERATOR_VERSION);
    const actual = serializeIndex(index);

    const expected = readFileSync(
      resolve(FIXTURE_ROOT, "expected", VERSION, "consolidated.json"),
      "utf-8",
    );
    expect(actual).toBe(expected);
  });
});
