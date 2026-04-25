/**
 * One-shot golden-file regenerator.
 *
 * This script reads the curated fixture set under
 * `tests/__fixtures__/golden/3.6/` and writes the renderer outputs (and the
 * serialized consolidated index) into
 * `tests/__fixtures__/golden/expected/3.6/`.
 *
 * Run after a *legitimate* renderer change:
 *
 *   npx tsx tests/__fixtures__/golden/regenerate.ts
 *
 * Then review the resulting diff carefully before committing — the golden
 * tests in `tests/golden/` rely on these expected files for byte-equal
 * snapshot comparison. A large unreviewable diff is a red flag (see
 * `docs/plan/09-test-suite-and-ci.md` Risks: "Golden-file rot").
 *
 * The script is intentionally placed alongside the fixtures it produces so
 * it stays close to its inputs and outputs and is unambiguously
 * test-only (it lives under `tests/` and is excluded from the production
 * tsconfig include set).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { renderModule } from "../../../scripts/render-module/index.js";
import {
  renderCoreDocument,
  type CoreDocType,
} from "../../../scripts/render-core/index.js";
import {
  buildConsolidatedIndex,
  type ValidatedDocumentsForIndex,
} from "../../../scripts/build-consolidated/index.js";
import { serializeIndex } from "../../../scripts/build-consolidated/serialize.js";
import {
  ModuleDocumentSchema,
  CoreVariableDocumentSchema,
  OperatorDocumentSchema,
  FlagDocumentSchema,
} from "../../../scripts/schemas/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const VERSION = "3.6";
const GENERATOR_VERSION = "0.1.0";

const SOURCE_ROOT = resolve(HERE, VERSION);
const EXPECTED_ROOT = resolve(HERE, "expected", VERSION);

const MODULE_SLUGS = ["acc", "sl", "tm"] as const;

interface CoreFixture {
  /** Source filename stem (matches `.json` and `.md`). */
  readonly stem: string;
  /** {@link CoreDocType} discriminator. */
  readonly docType: CoreDocType;
  /** Schema parser callable for the doc shape. */
  readonly parse: (raw: unknown) => unknown;
}

const CORE_FIXTURES: readonly CoreFixture[] = [
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

/**
 * Read a JSON file and return its parsed value.
 * @param path - Absolute path of the JSON file to read.
 * @returns The parsed JSON value.
 */
function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

/**
 * Write `content` to `path`, ensuring a single trailing newline (renderers
 * already produce one, but JSON output via {@link serializeIndex} also does;
 * this is here only so the writer is uniformly explicit).
 * @param path - Absolute target path.
 * @param content - Content to write verbatim.
 */
function write(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
}

/**
 * Regenerate the per-module Markdown fixtures.
 * @returns The list of validated module documents (used for the index).
 */
function regenerateModules(): {
  validated: ReturnType<typeof ModuleDocumentSchema.parse>[];
} {
  const validated: ReturnType<typeof ModuleDocumentSchema.parse>[] = [];
  for (const slug of MODULE_SLUGS) {
    const sourcePath = join(SOURCE_ROOT, "modules", `${slug}.json`);
    const targetPath = join(EXPECTED_ROOT, "modules", `${slug}.md`);
    const raw = readJson(sourcePath);
    const doc = ModuleDocumentSchema.parse(raw);
    const md = renderModule(doc, VERSION, GENERATOR_VERSION);
    write(targetPath, md);
    validated.push(doc);
    process.stdout.write(`  modules/${slug}.md (${md.length} bytes)\n`);
  }
  return { validated };
}

/**
 * Regenerate the core Markdown fixtures.
 * @returns The list of validated core documents (used for the index).
 */
function regenerateCore(): { validated: unknown[] } {
  const validated: unknown[] = [];
  for (const fixture of CORE_FIXTURES) {
    const sourcePath = join(SOURCE_ROOT, "core", `${fixture.stem}.json`);
    const targetPath = join(EXPECTED_ROOT, "core", `${fixture.stem}.md`);
    const raw = readJson(sourcePath);
    const doc = fixture.parse(raw);
    const md = renderCoreDocument(doc, fixture.docType, VERSION, GENERATOR_VERSION);
    write(targetPath, md);
    validated.push(doc);
    process.stdout.write(`  core/${fixture.stem}.md (${md.length} bytes)\n`);
  }
  return { validated };
}

/**
 * Regenerate the consolidated-index expected JSON from the validated
 * documents.
 * @param docs - Validated documents already produced by the per-doc passes.
 */
function regenerateConsolidated(docs: ValidatedDocumentsForIndex): void {
  const { index } = buildConsolidatedIndex(VERSION, docs, GENERATOR_VERSION);
  const json = serializeIndex(index);
  const targetPath = join(EXPECTED_ROOT, "consolidated.json");
  write(targetPath, json);
  process.stdout.write(`  consolidated.json (${json.length} bytes)\n`);
}

process.stdout.write("Regenerating golden fixtures from real source...\n");
const { validated: modules } = regenerateModules();
const { validated: core } = regenerateCore();
regenerateConsolidated({ modules, core, guides: [] });
process.stdout.write("Done.\n");
