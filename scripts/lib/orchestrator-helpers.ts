/**
 * Helpers for `scripts/build-references.ts`.
 *
 * Factored out so the orchestrator stays under the 200-line ceiling required
 * by `docs/plan/02-core-pipeline-foundation.md` Task 2.5. None of these
 * helpers contain stage-level logic; they are pure utilities the orchestrator
 * leans on for version resolution, summary construction, and per-version
 * processing.
 */

import path from "node:path";

import { discoverVersions, DiscoverError } from "./discover.js";
import { IOError } from "./errors.js";
import { atomicWriteFile, ensureDirectory, posixPath } from "./fs-helpers.js";
import {
  emitProgress,
  emitWarning,
  type OutputContext,
} from "./output.js";
import { assertUniqueSlugs, slugify, SlugCollisionError } from "./slug.js";
import { validateRenderedMarkdown } from "./validate-markdown.js";
import { validateVersion, type ValidationIssue } from "./validate.js";
import { renderModule } from "../render-module/index.js";
import {
  coreFileNames,
  renderCoreDocument,
  type CoreDocType,
} from "../render-core/index.js";
import { guideFileNames, renderGuide } from "../render-guide/index.js";
import type { ModuleDocument } from "../schemas/modules.schema.js";
import type { z } from "zod";
import type { GuideDocumentSchema } from "../schemas/guides.schema.js";
import type {
  BuildSummary,
  CliOptions,
  VersionResult,
} from "../types/cli.js";

/** Validated guide document shape inferred from the mirrored Zod schema. */
type GuideDocument = z.infer<typeof GuideDocumentSchema>;

/**
 * Set of recognised core document types — used to gate dispatch when the
 * orchestrator inspects an `unknown`-typed validated core document.
 *
 * Sourced from {@link coreFileNames} keys so the gate stays in lock-step
 * with the renderer's dispatch table; adding a new core doc type upstream
 * only requires extending `coreFileNames` (and the renderer + schema), not
 * a separate guard list here.
 */
const CORE_DOC_TYPES: ReadonlySet<CoreDocType> = new Set(
  Object.keys(coreFileNames) as CoreDocType[],
);

/**
 * Type guard returning whether `value` is one of the twelve registered core
 * document-type discriminators. Defensive — schema validation should already
 * have rejected unknown discriminators upstream of this point, but the guard
 * keeps the orchestrator non-crashing on schema drift.
 * @param value - Candidate string read from `doc.document_type`.
 * @returns Whether `value` is a recognised {@link CoreDocType}.
 */
function isCoreDocType(value: unknown): value is CoreDocType {
  return typeof value === "string" && CORE_DOC_TYPES.has(value as CoreDocType);
}

/**
 * Generator-version stamp embedded in every rendered file's provenance
 * comment. Kept in sync with the `GENERATOR_VERSION` constant in
 * `scripts/build-references.ts`. Duplicated here (rather than imported)
 * because importing from the entry-point module would create a circular
 * import: the entry point imports `processVersion` from this file. The
 * cost of duplication is one constant in two places; the tests hold both
 * call sites honest by asserting the version string in rendered output.
 */
const GENERATOR_VERSION = "0.1.0";

/**
 * Resolve which versions to process from the parsed CLI options.
 *
 * If `--only` is set, returns just that one version. Otherwise scans the
 * source root via {@link discoverVersions}. Discovery errors translate
 * into a structured {@link IOError} so the orchestrator's error path is
 * uniform.
 * @param opts - Parsed CLI options.
 * @returns Sorted list of version strings.
 * @throws {IOError} When `discoverVersions` cannot read the source root.
 */
export function resolveVersions(opts: CliOptions): string[] {
  if (opts.only) return [opts.only];
  try {
    return discoverVersions(opts.sourceRoot);
  } catch (err) {
    if (err instanceof DiscoverError) {
      throw new IOError({
        message: err.message,
        operation: "discover",
        path: err.path,
        cause: err,
      });
    }
    throw err;
  }
}

/**
 * Pick the {@link BuildSummary.mode} discriminator.
 *
 * Precedence (per Task 2.7): `--validate-only` wins over `--dry-run`,
 * which wins over the default `"build"`.
 * @param opts - Parsed CLI options.
 * @returns The mode label that appears in the JSON summary.
 */
export function selectMode(opts: CliOptions): BuildSummary["mode"] {
  if (opts.validateOnly) return "validate-only";
  if (opts.dryRun) return "dry-run";
  return "build";
}

/**
 * Build a `BuildSummary` from a list of per-version results.
 *
 * Counts succeeded/failed versions and stamps the orchestrator's exit
 * code into the summary so JSON consumers see the same number the process
 * will return.
 * @param opts - Parsed CLI options (used only to derive `mode`).
 * @param buildScriptVersion - Hardcoded generator version string.
 * @param results - Per-version outcomes from `processVersion`.
 * @param exitCode - Exit code the orchestrator will return.
 * @returns The aggregated summary record.
 */
export function buildSummary(
  opts: CliOptions,
  buildScriptVersion: string,
  results: VersionResult[],
  exitCode: number,
): BuildSummary {
  const versionsSucceeded = results.filter((r) => r.ok).length;
  return {
    buildScriptVersion,
    mode: selectMode(opts),
    versions: results,
    versionsSucceeded,
    versionsFailed: results.length - versionsSucceeded,
    exitCode,
  };
}

/**
 * Convert internal {@link ValidationIssue} records into the JSON-summary
 * error shape carried on {@link VersionResult}.
 * @param issues - Issues collected by `validateVersion`.
 * @returns Plain serialisable error entries with optional `file`.
 */
function toErrorEntries(
  issues: ValidationIssue[],
): Array<{ kind: string; message: string; file?: string }> {
  return issues.map((issue) => {
    const entry: { kind: string; message: string; file?: string } = {
      kind: issue.kind,
      message: issue.message,
    };
    if (issue.file !== undefined) entry.file = issue.file;
    return entry;
  });
}

/**
 * Process one version through the pipeline.
 *
 * Runs validation, surfaces every issue on stderr in the
 * problem-matcher-friendly `ERROR: <file>: <kind>: <msg>` form, then —
 * when validation succeeded and `--validate-only` is not set — drives the
 * per-module renderer:
 *
 *   1. Asserts slug uniqueness across every module in the version.
 *      A collision halts rendering for the version (no partial output).
 *   2. Sorts modules alphabetically by slug for deterministic iteration.
 *   3. Renders each module, validates the rendered Markdown, and (in
 *      normal mode) atomically writes the result under
 *      `<outputRoot>/opensips-modules/references/<version>/modules/<slug>.md`.
 *      In `--dry-run` mode the file is rendered and validated but not
 *      written; the count of "would-write" files is reported.
 *
 * The function is fail-slow within a version (one bad module does not
 * abort the rest) unless `--fail-fast` is set, in which case the loop
 * stops at the first per-module validation failure. Slug collisions are
 * always fatal for the version because filesystem-name uniqueness is a
 * pre-condition for ANY write.
 * @param version - OpenSIPs version (e.g. `"3.6"`).
 * @param opts - Parsed CLI options.
 * @param ctx - Output context for progress/warning emission.
 * @returns A {@link VersionResult} aggregating validation outcome and
 *   counts. Never throws on per-module validation failures; slug-collision
 *   and IO errors are caught and surfaced as entries on `result.errors`.
 */
export async function processVersion(
  version: string,
  opts: CliOptions,
  ctx: OutputContext,
): Promise<VersionResult> {
  if (ctx.verbose) emitProgress(`Processing version ${version}...`, ctx);

  const validation = validateVersion(opts.sourceRoot, version);

  if (ctx.verbose) {
    emitProgress(
      `  Validated ${validation.fileCount} files (${validation.documents.core.length} core, ${validation.documents.modules.length} modules, ${validation.documents.guides.length} guides)`,
      ctx,
    );
  }

  for (const issue of validation.issues) {
    process.stderr.write(
      `ERROR: ${issue.file}: ${issue.kind}: ${issue.message}\n`,
    );
  }

  const errors: VersionResult["errors"] = toErrorEntries(validation.issues);
  let filesRendered = 0;
  let renderOk = true;

  if (validation.ok && !opts.validateOnly) {
    // Schema validation already coerced these into ModuleDocument shape;
    // the `unknown[]` typing on `validation.documents.modules` is the
    // erasure boundary between the validate stage and us.
    const modules = validation.documents.modules as ModuleDocument[];
    const moduleResult = await renderModulesForVersion(
      version,
      modules,
      opts,
      ctx,
    );
    if (moduleResult.errors.length > 0) {
      errors.push(...moduleResult.errors);
      renderOk = false;
    }

    // Core rendering. Each validated core document carries its own
    // `document_type` discriminator, used to dispatch to the right
    // template in renderCoreDocument. Per ADR-005, core files belong
    // to the routing skill — note the `opensips-routing` path component
    // (not `opensips-modules`).
    const coreResult = await renderCoreForVersion(
      version,
      validation.documents.core,
      opts,
      ctx,
    );
    if (coreResult.errors.length > 0) {
      errors.push(...coreResult.errors);
      renderOk = false;
    }

    // Guides rendering. The guides array is empty when the source tree
    // does not include a `guides/` directory for this version (e.g. 3.5);
    // in that case renderGuidesForVersion is a no-op and contributes no
    // counters or errors. Per ADR-005 guides also belong to the routing
    // skill and live alongside core/.
    const guideResult = await renderGuidesForVersion(
      version,
      validation.documents.guides as GuideDocument[],
      opts,
      ctx,
    );
    if (guideResult.errors.length > 0) {
      errors.push(...guideResult.errors);
      renderOk = false;
    }

    filesRendered =
      moduleResult.filesRendered +
      coreResult.filesRendered +
      guideResult.filesRendered;

    if (ctx.verbose) {
      const verb = opts.dryRun ? "Would render" : "Rendered";
      const dryRunSuffix = opts.dryRun ? " (dry-run)" : "";
      emitProgress(
        `  ${verb} ${moduleResult.filesRendered} module files${dryRunSuffix}`,
        ctx,
      );
      emitProgress(
        `  ${verb} ${coreResult.filesRendered} core files${dryRunSuffix}`,
        ctx,
      );
      // Guides line is suppressed entirely when there are no guides — keeps
      // the verbose output uncluttered for versions without a guides/ dir.
      if (guideResult.filesRendered > 0) {
        emitProgress(
          `  ${verb} ${guideResult.filesRendered} guide files${dryRunSuffix}`,
          ctx,
        );
      }
      if (opts.dryRun) {
        emitProgress(`  Would build consolidated index (dry-run)`, ctx);
      }
    }
  } else if (validation.ok && opts.validateOnly && ctx.verbose) {
    // validate-only mode: no rendering, but the user asked for that.
    // No "renderers not yet implemented" warning — they are now.
  }

  return {
    version,
    ok: validation.ok && renderOk,
    filesValidated: validation.fileCount,
    filesRendered,
    errors,
  };
}

/** Internal aggregate returned by {@link renderModulesForVersion}. */
interface RenderForVersionResult {
  /** Count of files written (or would-be written in dry-run). */
  filesRendered: number;
  /** Per-module errors collected during rendering / output validation. */
  errors: VersionResult["errors"];
}

/**
 * Render every module in one version.
 *
 * Side effects (in non-dry-run mode): atomic writes to
 * `<outputRoot>/opensips-modules/references/<version>/modules/<slug>.md`.
 * The function is itself side-effect-free in dry-run mode.
 *
 * Determinism is enforced via two devices: alphabetical sort by slug
 * (deterministic iteration order) and {@link atomicWriteFile} (each file's
 * content is fully determined by `renderModule`, which is documented to be
 * byte-deterministic on equal input). The "build twice, diff is empty"
 * acceptance test in M3 Task 3.8 hinges on this.
 * @param version - OpenSIPs version label.
 * @param modules - Modules already validated against the Zod schema.
 * @param opts - Parsed CLI options (controls dry-run, output root, fail-fast).
 * @param ctx - Output context for progress/warning emission.
 * @returns Render outcome counts and per-module errors.
 */
async function renderModulesForVersion(
  version: string,
  modules: ModuleDocument[],
  opts: CliOptions,
  ctx: OutputContext,
): Promise<RenderForVersionResult> {
  // Slug-uniqueness gate: filesystem name collisions cannot be recovered
  // from at write time, so we fail BEFORE any write happens.
  try {
    assertUniqueSlugs(modules.map((m) => ({ name: m.module_name })));
  } catch (err) {
    if (err instanceof SlugCollisionError) {
      process.stderr.write(`ERROR: ${err.message}\n`);
      return {
        filesRendered: 0,
        errors: [{ kind: "slug-collision", message: err.message }],
      };
    }
    throw err;
  }

  // Stable iteration order for byte-deterministic builds.
  const sorted = [...modules].sort((a, b) =>
    slugify(a.module_name).localeCompare(slugify(b.module_name)),
  );

  const errors: VersionResult["errors"] = [];
  let filesRendered = 0;

  for (const module of sorted) {
    const slug = slugify(module.module_name);
    const sourcePath = `data/${version}/modules/${slug}.json`;
    const content = renderModule(module, version, GENERATOR_VERSION);

    const validation = validateRenderedMarkdown(content, sourcePath);
    if (!validation.ok) {
      for (const issue of validation.errors) {
        const message = `${issue.rule}: ${issue.message} (line ${issue.line})`;
        process.stderr.write(`ERROR: ${sourcePath}: ${message}\n`);
        errors.push({
          kind: "validation",
          message,
          file: sourcePath,
        });
      }
      if (opts.failFast) break;
      continue;
    }
    for (const w of validation.warnings) {
      emitWarning(
        `${sourcePath}:${w.line}: ${w.rule}: ${w.message}`,
        ctx,
      );
    }

    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-modules",
      "references",
      version,
      "modules",
      `${slug}.md`,
    );

    if (opts.dryRun) {
      filesRendered++;
      if (ctx.verbose) emitProgress(`  would write ${outputPath}`, ctx);
      continue;
    }

    try {
      await ensureDirectory(path.dirname(outputPath));
      await atomicWriteFile(outputPath, content);
    } catch (err) {
      if (err instanceof IOError) {
        process.stderr.write(
          `ERROR: ${err.path}: ${err.operation}: ${err.message}\n`,
        );
        errors.push({
          kind: "io",
          message: err.message,
          file: err.path,
        });
        if (opts.failFast) break;
        continue;
      }
      throw err;
    }
    filesRendered++;
  }

  return { filesRendered, errors };
}

/**
 * Render every core document in one version.
 *
 * Side effects (in non-dry-run mode): atomic writes to
 * `<outputRoot>/opensips-routing/references/<version>/core/<filename>.md`.
 * The function is itself side-effect-free in dry-run mode.
 *
 * Per ADR-005, core syntax is the routing skill's domain — output goes
 * under `opensips-routing/`, not `opensips-modules/`. A wrong path here
 * would ship generated files where Claude won't look for them at runtime.
 *
 * Iteration order over `coreDocuments` is whatever the validator returned;
 * each document produces a separate output file with a deterministic name
 * (the {@link coreFileNames} mapping), so render order does not affect the
 * on-disk byte-identicality contract. Validation issues are aggregated per
 * file; in `--fail-fast` mode the loop halts at the first failure.
 *
 * Output validation runs with `topLevelItemHeading: 2` because core files
 * use H2 (not H3) for items — this is the structural difference between
 * core and module rendering that the shared validator handles via the
 * `topLevelItemHeading` knob.
 * @param version - OpenSIPs version label.
 * @param coreDocuments - Validated core documents (heterogeneous; their
 *   discriminator `document_type` field drives dispatch).
 * @param opts - Parsed CLI options.
 * @param ctx - Output context for progress/warning emission.
 * @returns Render outcome counts and per-document errors.
 */
async function renderCoreForVersion(
  version: string,
  coreDocuments: readonly unknown[],
  opts: CliOptions,
  ctx: OutputContext,
): Promise<RenderForVersionResult> {
  const errors: VersionResult["errors"] = [];
  let filesRendered = 0;

  for (const doc of coreDocuments) {
    const docType = (doc as { document_type?: unknown }).document_type;
    if (!isCoreDocType(docType)) {
      // Defensive: schema validation should have rejected unknown
      // discriminators upstream of this point. Surface as a warning and
      // skip rather than crash, so an extraction-side regression does
      // not abort the entire build.
      emitWarning(
        `core document with unknown document_type ${JSON.stringify(docType)} skipped`,
        ctx,
      );
      continue;
    }

    const filename = coreFileNames[docType];
    const sourcePath = `data/${version}/core/${filename.replace(/\.md$/, ".json")}`;
    const content = renderCoreDocument(doc, docType, version, GENERATOR_VERSION);

    const validation = validateRenderedMarkdown(content, sourcePath, {
      topLevelItemHeading: 2,
    });
    if (!validation.ok) {
      for (const issue of validation.errors) {
        const message = `${issue.rule}: ${issue.message} (line ${issue.line})`;
        process.stderr.write(`ERROR: ${sourcePath}: ${message}\n`);
        errors.push({ kind: "validation", message, file: sourcePath });
      }
      if (opts.failFast) break;
      continue;
    }
    for (const w of validation.warnings) {
      emitWarning(`${sourcePath}:${w.line}: ${w.rule}: ${w.message}`, ctx);
    }

    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-routing",
      "references",
      version,
      "core",
      filename,
    );

    if (opts.dryRun) {
      filesRendered++;
      if (ctx.verbose) emitProgress(`  would write ${outputPath}`, ctx);
      continue;
    }

    try {
      await ensureDirectory(path.dirname(outputPath));
      await atomicWriteFile(outputPath, content);
    } catch (err) {
      if (err instanceof IOError) {
        process.stderr.write(
          `ERROR: ${err.path}: ${err.operation}: ${err.message}\n`,
        );
        errors.push({ kind: "io", message: err.message, file: err.path });
        if (opts.failFast) break;
        continue;
      }
      throw err;
    }
    filesRendered++;
  }

  return { filesRendered, errors };
}

/**
 * Render every guide document in one version.
 *
 * Side effects (in non-dry-run mode): atomic writes to
 * `<outputRoot>/opensips-routing/references/<version>/guides/<filename>.md`.
 * Side-effect-free in dry-run mode.
 *
 * Per ADR-009, guides are conditional per version: when the source tree
 * has no `guides/` directory the validator's `documents.guides` array is
 * empty and this function is a no-op (no output dir is created, no errors
 * are surfaced). For versions with guides (3.4 / 3.6 currently), each
 * `GuideDocument` produces one Markdown file named per
 * {@link guideFileNames}.
 *
 * Per ADR-005, guides — like core syntax — belong to the routing skill
 * (path component `opensips-routing/`).
 *
 * Output validation runs with `topLevelItemHeading: 2` because guide files
 * compose top-level sections (Overview, Prerequisites, Installation Steps,
 * etc.) at H2 directly under the file's H1. The relative skip-level rule
 * still applies inside multi-step / configuration-section bodies which use
 * H3 sub-sections.
 * @param version - OpenSIPs version label.
 * @param guideDocuments - Validated guide documents (one per
 *   `installation`/`configuration`/`syntax`).
 * @param opts - Parsed CLI options.
 * @param ctx - Output context for progress/warning emission.
 * @returns Render outcome counts and per-guide errors. Empty when the
 *   version carries no guides — no error is reported for absence.
 */
async function renderGuidesForVersion(
  version: string,
  guideDocuments: readonly GuideDocument[],
  opts: CliOptions,
  ctx: OutputContext,
): Promise<RenderForVersionResult> {
  const errors: VersionResult["errors"] = [];
  let filesRendered = 0;

  for (const doc of guideDocuments) {
    const docType = doc.document_type;
    const filename = guideFileNames[docType];
    const stem = filename.replace(/\.md$/, "");
    const sourcePath = `data/${version}/guides/${stem}.json`;
    const content = renderGuide(doc, version, GENERATOR_VERSION);

    const validation = validateRenderedMarkdown(content, sourcePath, {
      topLevelItemHeading: 2,
    });
    if (!validation.ok) {
      for (const issue of validation.errors) {
        const message = `${issue.rule}: ${issue.message} (line ${issue.line})`;
        process.stderr.write(`ERROR: ${sourcePath}: ${message}\n`);
        errors.push({ kind: "validation", message, file: sourcePath });
      }
      if (opts.failFast) break;
      continue;
    }
    for (const w of validation.warnings) {
      emitWarning(`${sourcePath}:${w.line}: ${w.rule}: ${w.message}`, ctx);
    }

    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-routing",
      "references",
      version,
      "guides",
      filename,
    );

    if (opts.dryRun) {
      filesRendered++;
      if (ctx.verbose) emitProgress(`  would write ${outputPath}`, ctx);
      continue;
    }

    try {
      await ensureDirectory(path.dirname(outputPath));
      await atomicWriteFile(outputPath, content);
    } catch (err) {
      if (err instanceof IOError) {
        process.stderr.write(
          `ERROR: ${err.path}: ${err.operation}: ${err.message}\n`,
        );
        errors.push({ kind: "io", message: err.message, file: err.path });
        if (opts.failFast) break;
        continue;
      }
      throw err;
    }
    filesRendered++;
  }

  return { filesRendered, errors };
}
