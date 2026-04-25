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
import type { ModuleDocument } from "../schemas/modules.schema.js";
import type {
  BuildSummary,
  CliOptions,
  VersionResult,
} from "../types/cli.js";

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
    const renderResult = await renderModulesForVersion(
      version,
      modules,
      opts,
      ctx,
    );
    filesRendered = renderResult.filesRendered;
    if (renderResult.errors.length > 0) {
      errors.push(...renderResult.errors);
      renderOk = false;
    }
    if (ctx.verbose) {
      const verb = opts.dryRun ? "Would render" : "Rendered";
      emitProgress(
        `  ${verb} ${renderResult.filesRendered} module files${
          opts.dryRun ? " (dry-run)" : ""
        }`,
        ctx,
      );
      if (opts.dryRun) {
        emitProgress(
          `  Would render ${validation.documents.core.length} core files (dry-run)`,
          ctx,
        );
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
