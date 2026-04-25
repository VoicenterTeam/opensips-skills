/**
 * Lightweight consolidated index types and Zod schemas.
 *
 * This file defines the shape of `consolidated.json` produced by Milestone 5
 * of the build pipeline (`scripts/build-consolidated/`). The consolidated
 * index is a per-version lookup aid — statistics, name-keyed lookup tables,
 * and a module-dependency graph — that powers `module_search.py` and the
 * security-advisor skill's programmatic iteration over modules.
 *
 * ## Deviation from upstream `ConsolidatedDocumentSchema`
 *
 * The mirrored upstream schema at `scripts/schemas/consolidated.schema.ts`
 * is heavyweight: it embeds full `ModuleDocument` / core-document / guide
 * payloads, mirroring the upstream extraction project's "MCP-consumption"
 * intent. Per ADR-006 ("`consolidated.json` as the search index") this
 * project ships only the lookup data — full content lives in the rendered
 * Markdown alongside the index. Keeping the heavy and light schemas in
 * separate files preserves the mirroring contract (the upstream schema is
 * off-limits per ADR-004) while letting the build emit a tight ~100-300 KB
 * index instead of multi-megabyte content dumps.
 *
 * Per ADR-009 the build supports an open-ended set of OpenSIPs versions
 * discovered dynamically from `data/`; `IndexStatistics` includes a
 * `totalGuides` counter so versions that ship guides (e.g., 3.4 and 3.6)
 * are accurately accounted, and the {@link StatisticsBaselineFile} format
 * keys baselines by version to support the canary check across N versions.
 *
 * @see docs/architecture/adr/006-consolidated-json-as-search-index.md
 * @see docs/architecture/adr/009-data-folder-and-dynamic-version-discovery.md
 * @see docs/architecture/data-pipeline.md §7.3
 * @see docs/plan/05-consolidated-index.md Task 5.1
 */

import { z } from "zod";

/**
 * Schema version of the lightweight consolidated index format.
 *
 * Bump on breaking changes to the index shape (new required fields,
 * removed fields, renamed fields, changed semantics). Consumers
 * (`module_search.py`, security-advisor skill) check this value and
 * fail fast on mismatch rather than reading a stale shape.
 *
 * @example
 * ```ts
 * import { CONSOLIDATED_SCHEMA_VERSION } from "./types/consolidated.js";
 * const index = { schema_version: CONSOLIDATED_SCHEMA_VERSION, ... };
 * ```
 */
export const CONSOLIDATED_SCHEMA_VERSION = 1;

/**
 * Statistics block. One non-negative integer per document type, plus a
 * `totalGuides` counter (per ADR-009) for versions that ship guides.
 *
 * The block doubles as the canary surface for upstream extraction quality:
 * a build that produces dramatically fewer items than the previous
 * baseline likely indicates an upstream bug and is flagged by the canary
 * check (M5.4) at build time.
 */
export const IndexStatisticsSchema = z.object({
  totalModules: z.number().int().nonnegative(),
  totalFunctions: z.number().int().nonnegative(),
  totalParameters: z.number().int().nonnegative(),
  totalPseudoVariables: z.number().int().nonnegative(),
  totalMICommands: z.number().int().nonnegative(),
  totalEvents: z.number().int().nonnegative(),
  totalStatistics: z.number().int().nonnegative(),
  totalGuides: z.number().int().nonnegative(),
});

/** Inferred type of {@link IndexStatisticsSchema}. */
export type IndexStatistics = z.infer<typeof IndexStatisticsSchema>;

/**
 * Single index entry — a pointer back to the rendered Markdown.
 *
 * `description` is the first sentence of the source description, truncated
 * to 200 characters with a trailing ellipsis (per M5.2 risk note); the
 * full description lives in the rendered Markdown reference.
 */
export const IndexEntrySchema = z.object({
  /**
   * Origin of the entry. Either the literal string `"core"` or
   * `"module:<slug>"` (e.g., `"module:tm"`).
   */
  source: z.string(),
  /**
   * Reference path relative to the plugin's references root, using POSIX
   * separators (e.g., `"references/3.6/modules/tm.md"`). Stable across
   * platforms per the determinism contract in `data-pipeline.md` §3.
   */
  path: z.string(),
  /**
   * First sentence of the source description, truncated to 200 chars.
   */
  description: z.string(),
});

/** Inferred type of {@link IndexEntrySchema}. */
export type IndexEntry = z.infer<typeof IndexEntrySchema>;

/**
 * The four lookup indexes. Object keys (function names, module names,
 * variable names, MI command names) are alphabetically sorted by the
 * deterministic serializer, regardless of the order entries were added
 * by the builder.
 */
export const ConsolidatedIndexesSchema = z.object({
  /** Function name → entry. Includes both module functions and core functions. */
  functionsByName: z.record(z.string(), IndexEntrySchema),
  /** Module name → alphabetically sorted list of exported parameter names. */
  parametersByModule: z.record(z.string(), z.array(z.string())),
  /** Pseudo-variable name (with leading `$`) → entry. */
  variablesByName: z.record(z.string(), IndexEntrySchema),
  /** MI command name → entry. */
  miCommandsByName: z.record(z.string(), IndexEntrySchema),
});

/** Inferred type of {@link ConsolidatedIndexesSchema}. */
export type ConsolidatedIndexes = z.infer<typeof ConsolidatedIndexesSchema>;

/**
 * Module dependency graph. Derived from each module's `dependencies_required`
 * field; values are alphabetically sorted in the builder.
 */
export const ConsolidatedRelationshipsSchema = z.object({
  /** Module name → alphabetically sorted list of required dependency module names. */
  moduleDependencies: z.record(z.string(), z.array(z.string())),
});

/** Inferred type of {@link ConsolidatedRelationshipsSchema}. */
export type ConsolidatedRelationships = z.infer<
  typeof ConsolidatedRelationshipsSchema
>;

/**
 * Lightweight consolidated index for a single OpenSIPs version.
 *
 * Distinct from the upstream {@link
 * import("../schemas/consolidated.schema.js").ConsolidatedDocumentSchema}
 * (which embeds full document content per upstream conventions). This
 * project ships only the lookup data per ADR-006 — full content lives in
 * the rendered Markdown alongside.
 *
 * @example
 * ```ts
 * import { ConsolidatedIndexSchema, CONSOLIDATED_SCHEMA_VERSION } from "./types/consolidated.js";
 *
 * const index = ConsolidatedIndexSchema.parse({
 *   schema_version: CONSOLIDATED_SCHEMA_VERSION,
 *   version: "3.6",
 *   generator: "opensips-skills build-references 0.1.0",
 *   statistics: {
 *     totalModules: 92, totalFunctions: 1147, totalParameters: 2034,
 *     totalPseudoVariables: 245, totalMICommands: 89, totalEvents: 12,
 *     totalStatistics: 47, totalGuides: 3,
 *   },
 *   indexes: {
 *     functionsByName: { t_relay: { source: "module:tm", path: "references/3.6/modules/tm.md", description: "..." } },
 *     parametersByModule: { tm: ["fr_inv_timer", "fr_timer"] },
 *     variablesByName: {},
 *     miCommandsByName: {},
 *   },
 *   relationships: { moduleDependencies: { auth_db: ["auth", "sl"] } },
 * });
 * ```
 */
export const ConsolidatedIndexSchema = z.object({
  /** Bumped on breaking shape changes; must equal {@link CONSOLIDATED_SCHEMA_VERSION}. */
  schema_version: z.literal(CONSOLIDATED_SCHEMA_VERSION),
  /** OpenSIPs version this index covers (e.g., `"3.6"`). Mirrors the source folder name. */
  version: z.string(),
  /** Identifier of the producer (e.g., `"opensips-skills build-references 0.1.0"`). */
  generator: z.string(),
  /** Per-doc-type counts that double as a canary surface (M5.4). */
  statistics: IndexStatisticsSchema,
  /** Four name-keyed lookup tables per ADR-006. */
  indexes: ConsolidatedIndexesSchema,
  /** Module-level relationships (currently just dependency edges). */
  relationships: ConsolidatedRelationshipsSchema,
});

/** Inferred type of {@link ConsolidatedIndexSchema}. */
export type ConsolidatedIndex = z.infer<typeof ConsolidatedIndexSchema>;

/**
 * Per-version baseline structure for the canary check (M5.4).
 *
 * The baseline file (committed as `scripts/build-consolidated/.statistics-baseline.json`)
 * stores one {@link IndexStatistics} block per version. Per ADR-009 the
 * map is keyed by version string so the build supports an open-ended set
 * of OpenSIPs versions; a new version added via `npm run baseline:update`
 * adds a new key without requiring code changes.
 */
export const StatisticsBaselineFileSchema = z.object({
  /** Schema version of the baseline file format itself (independent of the index schema version). */
  schema_version: z.literal(1),
  /** Map from OpenSIPs version (e.g., `"3.6"`) to that version's baseline statistics. */
  baselines: z.record(z.string(), IndexStatisticsSchema),
});

/** Inferred type of {@link StatisticsBaselineFileSchema}. */
export type StatisticsBaselineFile = z.infer<
  typeof StatisticsBaselineFileSchema
>;
