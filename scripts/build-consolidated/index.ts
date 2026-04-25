/**
 * Pure-function builder for the per-version consolidated lookup index.
 *
 * The consolidated index is a lightweight JSON document committed under
 * `plugins/opensips/skills/opensips-modules/references/{version}/consolidated.json`.
 * It powers fast name → location lookups for `module_search.py` and is the
 * data interface between the modules skill and the security advisor skill
 * (per ADR-005 and ADR-006).
 *
 * Design contract (from `docs/architecture/data-pipeline.md` §7.3 and
 * `docs/plan/05-consolidated-index.md` §5.2):
 *
 *   - **Pure.** No filesystem access, no globals, no clocks, no mutation of
 *     input. Given identical input, returns deeply-equal output every call.
 *   - **Deterministic ordering.** Modules are iterated in slug-alphabetical
 *     order regardless of input order. Record-shaped outputs are sorted by
 *     key. Array-shaped outputs (parameter lists, dependency lists) are
 *     sorted by element.
 *   - **Collision-aware.** Two sources exporting the same function /
 *     pseudo-variable / MI command name produce a warning, with the
 *     first-encountered (alphabetical) source kept and the conflicting
 *     source surfaced for human review.
 *
 * Module-vs-core collisions: modules are walked first, so on a name
 * collision between a module export and a core export the module wins.
 * This matches the convention that an explicit module symbol shadows a
 * core symbol of the same name.
 *
 * Description normalisation: each {@link IndexEntry} carries a short
 * description suitable for "lookup without read" (the security advisor
 * needs a sentence, not a paragraph). The builder applies
 * {@link firstSentence} to the source's `description` field, truncating
 * at {@link DESCRIPTION_MAX_LEN} chars with a trailing `…` if the first
 * sentence is itself longer.
 */

import type { ModuleDocument } from "../schemas/modules.schema.js";
import type { ConsolidatedIndex, IndexEntry, IndexStatistics } from "../types/consolidated.js";
import { CONSOLIDATED_SCHEMA_VERSION } from "../types/consolidated.js";
import { posixPath } from "../lib/fs-helpers.js";
import { sanitizeRenderedText } from "../lib/sanitize.js";
import { slugify } from "../lib/slug.js";

/* ------------------------------------------------------------------ */
/* Public types                                                       */
/* ------------------------------------------------------------------ */

/**
 * Validated documents grouped by category, as produced by the upstream
 * `validateVersion` step.
 *
 * The `core` and `guides` arrays are typed as `unknown[]` because their
 * element shapes vary by `document_type`. The builder narrows each item
 * by inspecting the discriminant at runtime.
 */
export interface ValidatedDocumentsForIndex {
  /** All validated module documents for the version. */
  modules: ModuleDocument[];
  /** All validated core documents for the version. */
  core: unknown[];
  /** All validated guide documents for the version. */
  guides: unknown[];
}

/** Kinds of name-collision warnings the builder can surface. */
export type IndexWarningKind = "function-collision" | "variable-collision" | "mi-collision";

/** Warning surfaced during index building. */
export interface IndexWarning {
  /** What kind of collision (function, variable, or MI command). */
  kind: IndexWarningKind;
  /** The colliding name (already in canonical form for the namespace). */
  name: string;
  /**
   * Source labels of the entries that collided. Always at least two; the
   * first element is the kept entry. Subsequent elements were rejected.
   */
  conflictingSources: string[];
  /** What the builder did about it. Currently always `"kept-first"`. */
  resolution: "kept-first";
}

/** Result of {@link buildConsolidatedIndex}. */
export interface IndexBuildResult {
  /** The constructed index, ready for serialisation. */
  index: ConsolidatedIndex;
  /** All collision warnings surfaced during the walk. */
  warnings: IndexWarning[];
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Maximum length (in characters) of an {@link IndexEntry} description
 * before it is truncated. Truncation appends a single `…` (U+2026), so
 * the final stored length is `DESCRIPTION_MAX_LEN + 1` for truncated
 * entries. Rationale: see `docs/plan/05-consolidated-index.md` §"Risks
 * and watch-outs / Description field length".
 */
const DESCRIPTION_MAX_LEN = 200;

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Extract the leading sentence of `text` and truncate to `maxLen` chars,
 * appending `…` on truncation.
 *
 * The sentence boundary is the first occurrence of "period followed by
 * whitespace" — this is conservative enough to avoid splitting on
 * decimal points, abbreviations like "e.g.", or domain-specific names
 * (e.g. `$ru.user`). The returned sentence retains its terminating
 * period; only the trailing whitespace is trimmed by the boundary cut.
 *
 * If the text contains no sentence boundary, the entire string is taken
 * and then truncated.
 * @param text - Source text.
 * @param maxLen - Maximum allowed length before truncation; the
 *   returned string may be `maxLen + 1` chars when truncation occurs
 *   (the extra char is the `…` ellipsis marker).
 * @returns The leading-sentence excerpt, possibly truncated.
 * @example
 *   firstSentence("First sentence. Second sentence.", 200);
 *   // => "First sentence."
 *
 *   firstSentence("x".repeat(300), 200);
 *   // => "x".repeat(200) + "…"   (length 201)
 */
function firstSentence(text: string, maxLen: number): string {
  if (text.length === 0) return "";
  // Strip upstream extraction artifacts (U+FFFD, U+200B, over-escaped
  // underscores) before sentence-splitting so the index entries stay
  // consistent with the rendered .md descriptions.
  const cleaned = sanitizeRenderedText(text);
  if (cleaned.length === 0) return "";
  const boundary = cleaned.search(/\.\s/);
  // `+1` to keep the period itself; the whitespace is the cut point.
  const sentence = boundary >= 0 ? cleaned.slice(0, boundary + 1) : cleaned;
  if (sentence.length <= maxLen) return sentence;
  return sentence.slice(0, maxLen) + "…";
}

/**
 * Return a new object whose own enumerable string keys are sorted in
 * ASCII (codepoint) order.
 *
 * JS object property order is insertion-order; serialisers that walk
 * `Object.keys` (including the determinism-friendly stringifier used
 * downstream) honour that order. Sorting up-front means consumers
 * inspecting the in-memory result also see a stable layout.
 * @template V - Value type.
 * @param obj - Source record.
 * @returns A new record with the same entries in sorted-key order.
 */
function sortKeys<V>(obj: Record<string, V>): Record<string, V> {
  const out: Record<string, V> = {};
  for (const k of Object.keys(obj).sort()) {
    out[k] = obj[k] as V;
  }
  return out;
}

/**
 * Type guard: does `value` look like a core document with the expected
 * `document_type` discriminant?
 * @param value - Candidate value.
 * @param docType - Expected discriminant.
 * @returns True if `value` is a non-null object whose `document_type`
 *   field equals `docType`.
 */
function hasDocType(
  value: unknown,
  docType: string,
): value is Record<string, unknown> & { document_type: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "document_type" in value &&
    value.document_type === docType
  );
}

/**
 * Try to add an entry to the given index map. If the key is already
 * present, append a warning and leave the existing entry untouched.
 * @param map - The index map being populated. Mutated in place.
 * @param warnings - The shared warnings array. Appended to on collision.
 * @param kind - Warning kind to emit on collision.
 * @param name - Index key.
 * @param entry - Candidate entry.
 * @returns True if the entry was added (no collision); false if the
 *   key was already present.
 */
function tryAdd(
  map: Record<string, IndexEntry>,
  warnings: IndexWarning[],
  kind: IndexWarningKind,
  name: string,
  entry: IndexEntry,
): boolean {
  const existing = map[name];
  if (existing !== undefined) {
    // Find or create the warning for this name. We collapse multiple
    // collisions on the same name into one warning by appending the
    // new conflicting source.
    const prior = warnings.find((w) => w.kind === kind && w.name === name);
    if (prior !== undefined) {
      if (!prior.conflictingSources.includes(entry.source)) {
        prior.conflictingSources.push(entry.source);
      }
    } else {
      warnings.push({
        kind,
        name,
        conflictingSources: [existing.source, entry.source],
        resolution: "kept-first",
      });
    }
    return false;
  }
  map[name] = entry;
  return true;
}

/* ------------------------------------------------------------------ */
/* Builder                                                            */
/* ------------------------------------------------------------------ */

/**
 * Build the lightweight consolidated index for one OpenSIPs version.
 *
 * Pure function: no I/O, no side effects, no globals. Given the same
 * input, returns identical output. Iteration is deterministic via an
 * internal alphabetical sort by `slugify(module_name)`, so the caller
 * does not need to pre-sort the `modules` array.
 *
 * Collision policy: if two sources export the same function /
 * pseudo-variable / MI command name, the FIRST encountered source wins
 * and a warning is appended to the result. Modules are processed
 * before core documents, so a module export shadows a core export of
 * the same name.
 * @param version - Active OpenSIPs version (e.g. `"3.6"`).
 * @param docs - Validated documents grouped by category.
 * @param generatorVersion - Build script version, embedded in the
 *   `generator` field of the produced index.
 * @returns The index plus any collision warnings.
 * @example
 *   const { index, warnings } = buildConsolidatedIndex(
 *     "3.6",
 *     { modules: [tm, dialog], core: [], guides: [] },
 *     "opensips-skills@0.1.0",
 *   );
 *   // index.indexes.functionsByName["t_relay"] === { source: "module:tm", ... }
 */
export function buildConsolidatedIndex(
  version: string,
  docs: ValidatedDocumentsForIndex,
  generatorVersion: string,
): IndexBuildResult {
  const stats: IndexStatistics = {
    totalModules: 0,
    totalFunctions: 0,
    totalParameters: 0,
    totalPseudoVariables: 0,
    totalMICommands: 0,
    totalEvents: 0,
    totalStatistics: 0,
    totalGuides: 0,
  };

  const functionsByName: Record<string, IndexEntry> = {};
  const parametersByModule: Record<string, string[]> = {};
  const variablesByName: Record<string, IndexEntry> = {};
  const miCommandsByName: Record<string, IndexEntry> = {};
  const moduleDependencies: Record<string, string[]> = {};
  const warnings: IndexWarning[] = [];

  /* -------- Modules (alphabetical by slug) ----------------------- */

  // Use a non-mutating copy so callers' array order is preserved.
  const sortedModules = [...docs.modules].sort((a, b) =>
    slugify(a.module_name).localeCompare(slugify(b.module_name)),
  );

  for (const mod of sortedModules) {
    const slug = slugify(mod.module_name);
    const source = `module:${slug}`;
    const modulePath = posixPath("references", version, "modules", `${slug}.md`);

    stats.totalModules += 1;

    // Parameters — sort by name within the module. We also count every
    // parameter regardless of collisions, since parameters are scoped
    // by module and cannot collide across modules in this index.
    const paramNames = (mod.exported_parameters ?? []).map((p) => p.name).sort();
    parametersByModule[mod.module_name] = paramNames;
    stats.totalParameters += paramNames.length;

    // Functions
    for (const fn of mod.exported_functions ?? []) {
      const entry: IndexEntry = {
        source,
        path: modulePath,
        description: firstSentence(fn.description, DESCRIPTION_MAX_LEN),
      };
      if (tryAdd(functionsByName, warnings, "function-collision", fn.name, entry)) {
        stats.totalFunctions += 1;
      }
    }

    // Pseudo-variables
    for (const pv of mod.exported_pseudo_variables ?? []) {
      const entry: IndexEntry = {
        source,
        path: modulePath,
        description: firstSentence(pv.description, DESCRIPTION_MAX_LEN),
      };
      if (tryAdd(variablesByName, warnings, "variable-collision", pv.name, entry)) {
        stats.totalPseudoVariables += 1;
      }
    }

    // MI commands
    for (const mi of mod.exported_mi_functions ?? []) {
      const entry: IndexEntry = {
        source,
        path: modulePath,
        description: firstSentence(mi.description, DESCRIPTION_MAX_LEN),
      };
      if (tryAdd(miCommandsByName, warnings, "mi-collision", mi.name, entry)) {
        stats.totalMICommands += 1;
      }
    }

    // Events — counted but not indexed in v1.
    stats.totalEvents += (mod.exported_events ?? []).length;

    // Statistics — counted but not indexed in v1.
    stats.totalStatistics += (mod.exported_statistics ?? []).length;

    // Dependencies (required only; sorted by name).
    const deps = (mod.dependencies_required ?? []).map((d) => d.name).sort();
    moduleDependencies[mod.module_name] = deps;
  }

  /* -------- Core documents -------------------------------------- */

  for (const item of docs.core) {
    if (hasDocType(item, "core_function")) {
      const fns = (item as { functions?: unknown[] }).functions ?? [];
      const corePath = posixPath("references", version, "core", "functions.md");
      for (const fn of fns) {
        const f = fn as { name?: unknown; description?: unknown };
        if (typeof f.name !== "string" || typeof f.description !== "string") {
          continue;
        }
        const entry: IndexEntry = {
          source: "core",
          path: corePath,
          description: firstSentence(f.description, DESCRIPTION_MAX_LEN),
        };
        if (tryAdd(functionsByName, warnings, "function-collision", f.name, entry)) {
          stats.totalFunctions += 1;
        }
      }
    } else if (hasDocType(item, "core_variable")) {
      const vars = (item as { variables?: unknown[] }).variables ?? [];
      const corePath = posixPath("references", version, "core", "variables.md");
      for (const v of vars) {
        const vv = v as { name?: unknown; description?: unknown };
        if (typeof vv.name !== "string" || typeof vv.description !== "string") {
          continue;
        }
        const entry: IndexEntry = {
          source: "core",
          path: corePath,
          description: firstSentence(vv.description, DESCRIPTION_MAX_LEN),
        };
        if (tryAdd(variablesByName, warnings, "variable-collision", vv.name, entry)) {
          stats.totalPseudoVariables += 1;
        }
      }
    } else if (hasDocType(item, "mi_command")) {
      const cmds = (item as { mi_commands?: unknown[] }).mi_commands ?? [];
      const corePath = posixPath("references", version, "core", "mi-commands.md");
      for (const c of cmds) {
        const cc = c as { name?: unknown; description?: unknown };
        if (typeof cc.name !== "string" || typeof cc.description !== "string") {
          continue;
        }
        const entry: IndexEntry = {
          source: "core",
          path: corePath,
          description: firstSentence(cc.description, DESCRIPTION_MAX_LEN),
        };
        if (tryAdd(miCommandsByName, warnings, "mi-collision", cc.name, entry)) {
          stats.totalMICommands += 1;
        }
      }
    }
    // All other core types contribute nothing to indexes/statistics in v1.
  }

  /* -------- Guides ---------------------------------------------- */

  stats.totalGuides = docs.guides.length;

  /* -------- Assemble -------------------------------------------- */

  const index: ConsolidatedIndex = {
    schema_version: CONSOLIDATED_SCHEMA_VERSION,
    version,
    generator: generatorVersion,
    statistics: stats,
    indexes: {
      functionsByName: sortKeys(functionsByName),
      parametersByModule: sortKeys(parametersByModule),
      variablesByName: sortKeys(variablesByName),
      miCommandsByName: sortKeys(miCommandsByName),
    },
    relationships: {
      moduleDependencies: sortKeys(moduleDependencies),
    },
  };

  return { index, warnings };
}
