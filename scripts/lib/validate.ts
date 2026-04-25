/**
 * JSON-source validation stage of the build pipeline.
 *
 * Implements stage 2 of the pipeline as specified in
 * `docs/architecture/data-pipeline.md` §2.2 and §4 (failure policy).
 *
 * Three layers of validation are surfaced as `ValidationIssue` records:
 *   - `io`            — read failure (missing file, permission denied, etc.).
 *   - `parse`         — `JSON.parse` rejected the file's bytes.
 *   - `schema`        — Zod rejected the parsed object.
 *   - `schema-lookup` — the file's `<category>/<filename>` does not map to any
 *                       known schema (e.g., `core/unknown-name.json`).
 *
 * Per the failure policy: validation is **fail-slow within a version** — every
 * source file is attempted and every failure is collected before the function
 * returns. Callers (the orchestrator in M1.E) are responsible for translating
 * the aggregated `VersionValidationResult` into a process exit code.
 */

import { readFileSync } from "node:fs";
import type { z } from "zod";
import { fromZodIssue } from "zod-validation-error";

import { discoverSourceFiles, DiscoverError } from "./discover.js";
import {
  AsyncDocumentSchema,
  CoreFunctionDocumentSchema,
  CoreParameterDocumentSchema,
  CoreVariableDocumentSchema,
  EventDocumentSchema,
  FlagDocumentSchema,
  GuideDocumentSchema,
  MICommandDocumentSchema,
  ModuleDocumentSchema,
  OperatorDocumentSchema,
  RouteDocumentSchema,
  StatementDocumentSchema,
  StatisticDocumentSchema,
  TransformationDocumentSchema,
} from "../schemas/index.js";

/** Category of source file — matches `DiscoveredSourceFiles` in discover.ts. */
export type SourceCategory = "core" | "modules" | "guides";

/** A single validation failure (parse, schema, IO, or schema-lookup miss). */
export interface ValidationIssue {
  /** Absolute file path that failed. */
  file: string;
  /** Issue kind. */
  kind: "parse" | "schema" | "io" | "schema-lookup";
  /** Human-readable single-line message. Includes JSON path for schema issues. */
  message: string;
  /** Structured Zod issue path (only for `kind: "schema"`). */
  path?: (string | number)[];
}

/** Result of validating a single file. */
export type ValidationResult<T> =
  | { ok: true; document: T; file: string }
  | { ok: false; file: string; issues: ValidationIssue[] };

/** Result of validating one version's complete file set. */
export interface VersionValidationResult {
  /** Version string echoed back for the caller's convenience. */
  version: string;
  /** True iff zero issues were recorded. */
  ok: boolean;
  /** Total number of files the validator attempted. */
  fileCount: number;
  /** Successfully validated documents grouped by category. */
  documents: { core: unknown[]; modules: unknown[]; guides: unknown[] };
  /** Aggregated issues across every file in the version. */
  issues: ValidationIssue[];
}

/**
 * Lookup table for `core/<filename>` → schema. Modules and guides are
 * single-schema categories and are handled directly in `selectSchemaForFile`.
 */
const CORE_FILENAME_TO_SCHEMA: Record<string, z.ZodType> = {
  "variables.json": CoreVariableDocumentSchema,
  "functions.json": CoreFunctionDocumentSchema,
  "parameters.json": CoreParameterDocumentSchema,
  "operators.json": OperatorDocumentSchema,
  "statements.json": StatementDocumentSchema,
  "routes.json": RouteDocumentSchema,
  "transformations.json": TransformationDocumentSchema,
  "async.json": AsyncDocumentSchema,
  "mi-commands.json": MICommandDocumentSchema,
  "events.json": EventDocumentSchema,
  "statistics.json": StatisticDocumentSchema,
  "flags.json": FlagDocumentSchema,
};

/**
 * Map a `(category, filename)` pair to the Zod schema that should validate it.
 * @param category - Source category as produced by the discover stage.
 * @param filename - Bare filename (no path component), e.g. `"variables.json"`.
 * @returns The matching schema, or `null` when no schema is registered.
 *   Modules and guides accept any `*.json` filename — only `core` is a strict
 *   table lookup.
 * @example
 * selectSchemaForFile("core", "variables.json"); // → CoreVariableDocumentSchema
 * selectSchemaForFile("modules", "tm.json");     // → ModuleDocumentSchema
 * selectSchemaForFile("core", "unknown.json");   // → null
 */
export function selectSchemaForFile(
  category: SourceCategory,
  filename: string,
): z.ZodType | null {
  if (category === "modules") return ModuleDocumentSchema;
  if (category === "guides") return GuideDocumentSchema;
  // category === "core"
  return CORE_FILENAME_TO_SCHEMA[filename] ?? null;
}

/**
 * Read a JSON file and validate it against the supplied schema.
 *
 * Errors at each layer are reported separately so callers can render them
 * with stage-appropriate context: `io` issues mean the file could not be
 * read at all; `parse` issues mean the bytes were not valid JSON; `schema`
 * issues mean the object was structurally rejected by Zod.
 * @param filePath - Absolute path to the source file.
 * @param schema - Zod schema to validate the parsed contents against.
 * @returns `{ ok: true, document, file }` on success, otherwise
 *   `{ ok: false, file, issues }` with one or more issues describing the
 *   failure(s). For schema rejections every Zod issue becomes a separate
 *   `ValidationIssue` so the caller can print one error line per field.
 */
export function validateSourceFile<T>(
  filePath: string,
  schema: z.ZodType<T>,
): ValidationResult<T> {
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (err) {
    return {
      ok: false,
      file: filePath,
      issues: [
        {
          file: filePath,
          kind: "io",
          message: `cannot read file: ${describeError(err)}`,
        },
      ],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return {
      ok: false,
      file: filePath,
      issues: [
        {
          file: filePath,
          kind: "parse",
          message: `JSON parse error: ${describeError(err)}`,
        },
      ],
    };
  }

  const result = schema.safeParse(parsed);
  if (result.success) {
    return { ok: true, document: result.data, file: filePath };
  }

  const issues: ValidationIssue[] = result.error.issues.map((issue) => {
    // Render a single-line message via zod-validation-error so the rest of
    // the pipeline has a uniform format. `fromZodIssue` is the single-issue
    // helper, giving us one well-formatted message per Zod issue so callers
    // can print one error line per offending field.
    const formatted = fromZodIssue(issue, { includePath: true });
    return {
      file: filePath,
      kind: "schema",
      message: formatted.toString(),
      path: [...issue.path],
    };
  });

  return { ok: false, file: filePath, issues };
}

/**
 * Validate every source file under one version, accumulating all failures.
 *
 * Discovery uses `discoverSourceFiles`, so the same rules about `md/`,
 * `*-complete.json`, and the optional `guides/` subdirectory apply. Each
 * file is dispatched to `selectSchemaForFile`; files whose names do not
 * match any registered schema produce a `schema-lookup` issue and are not
 * treated as fatal — the validator continues through the remaining files
 * (fail-slow, per data-pipeline §4).
 *
 * Discovery-level failures (e.g., the version directory does not exist)
 * are wrapped into a single `kind: "io"` issue rather than thrown, so that
 * the orchestrator can render them in the same error format as everything
 * else.
 * @param sourceRoot - Source-data root, defaulting to `./data` per ADR-009.
 * @param version - Version string (e.g., `"3.6"`).
 * @returns A `VersionValidationResult` with `ok=true` only when every
 *   discovered file validated cleanly.
 */
export function validateVersion(
  sourceRoot: string | undefined,
  version: string,
): VersionValidationResult {
  const documents: VersionValidationResult["documents"] = {
    core: [],
    modules: [],
    guides: [],
  };
  const issues: ValidationIssue[] = [];
  let fileCount = 0;

  let discovered;
  try {
    discovered = discoverSourceFiles(sourceRoot, version);
  } catch (err) {
    const path = err instanceof DiscoverError ? err.path : (sourceRoot ?? "");
    return {
      version,
      ok: false,
      fileCount: 0,
      documents,
      issues: [
        {
          file: path,
          kind: "io",
          message: `discover failed: ${describeError(err)}`,
        },
      ],
    };
  }

  const categories: SourceCategory[] = ["core", "modules", "guides"];
  for (const category of categories) {
    for (const filePath of discovered[category]) {
      fileCount++;
      const filename = basename(filePath);
      const schema = selectSchemaForFile(category, filename);

      if (schema === null) {
        issues.push({
          file: filePath,
          kind: "schema-lookup",
          message: `no schema registered for ${category}/${filename}`,
        });
        continue;
      }

      const fileResult = validateSourceFile(filePath, schema);
      if (fileResult.ok) {
        documents[category].push(fileResult.document);
      } else {
        for (const issue of fileResult.issues) {
          issues.push(issue);
        }
      }
    }
  }

  return {
    version,
    ok: issues.length === 0,
    fileCount,
    documents,
    issues,
  };
}

/**
 * Extract the basename (filename without directory components) from a path.
 * Pure-string implementation so it works equivalently for the POSIX-style
 * paths produced by `discoverSourceFiles`.
 * @param p - Path with `/` separators (POSIX-normalised by discover).
 * @returns Filename component, i.e. the substring after the last `/`.
 */
function basename(p: string): string {
  const slash = p.lastIndexOf("/");
  return slash === -1 ? p : p.slice(slash + 1);
}

/**
 * Extract a short human-readable description from a thrown value, preferring
 * the standard `Error.message` shape but tolerating non-`Error` throws.
 * @param err - The thrown value.
 * @returns A string suitable for embedding in a `ValidationIssue.message`.
 */
function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
