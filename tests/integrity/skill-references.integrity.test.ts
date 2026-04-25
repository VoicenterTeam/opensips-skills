/**
 * Integrity test — SKILL.md cross-reference resolution.
 *
 * Parses every `references/{version}/...` (and `../opensips-config/references/
 * {version}/...`) path cited inside a backtick code span in either skill's
 * SKILL.md, then asserts each path resolves on disk for at least one
 * shipped version. "Shipped versions" are the versions under `data/` that
 * are NOT marked with a `.broken` marker file (per ADR-009).
 *
 * "At least one shipped version" is the right semantic because the SKILL.md
 * is version-agnostic: Claude resolves `{version}` at read time. A cited
 * module reference (e.g., `modules/dialog.md`) need not exist in every
 * version's reference set — it only needs to exist somewhere so the citation
 * is valid for users on a version that has the module. A citation that does
 * not resolve in ANY shipped version is the regression we catch (e.g., a
 * stale module name that no version exports).
 *
 * Structural references (`cfg-format.md`, `modules-index.md`, `consolidated.
 * json`, `ser-lineage-notes.md`) must additionally resolve for every shipped
 * version — these are guaranteed by the build pipeline and the hand-authored
 * file conventions.
 *
 * Catches regressions like:
 *   - A renamed module file that the SKILL.md still cites by old name.
 *   - A typo in a cited path (the `textopsx.md` case from the merge review).
 *   - A missing hand-authored reference (someone removed `cfg-format.md`).
 *   - A glob like `modules/*.md` whose parent directory never gets built.
 *
 * Test category: integrity. Sits between unit tests (no filesystem) and e2e
 * tests (run the build). This test inspects shipped state on disk.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

import { discoverVersions, readBrokenMarker } from "../../scripts/lib/discover.js";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DATA_ROOT = path.join(REPO_ROOT, "data");
const PLUGIN_ROOT = path.join(REPO_ROOT, "plugins", "opensips", "skills");
const CONFIG_SKILL_DIR = path.join(PLUGIN_ROOT, "opensips-config");
const ADVISOR_SKILL_DIR = path.join(PLUGIN_ROOT, "opensips-security-advisor");

/**
 * Match a path that begins with either `references/{version}/` or
 * `../opensips-config/references/{version}/`, captured inside backticks.
 *
 * The capture group returns the path without the surrounding backticks.
 * Examples matched:
 *   `references/{version}/cfg-format.md`
 *   `references/{version}/modules/tm.md`
 *   `references/{version}/core/*.md`
 *   `../opensips-config/references/{version}/consolidated.json`
 */
const REFERENCE_PATTERN =
  /`((?:\.\.\/opensips-config\/)?references\/\{version\}\/[^`\s]+)`/g;

/**
 * Substrings that, when present in a captured path, indicate a syntactic
 * placeholder rather than a real file. We skip these — the SKILL.md uses
 * them to teach Claude path patterns, not to point at a specific file.
 */
const PLACEHOLDER_MARKERS = ["<", "{slug}", "{module}", "{topic}"];

/**
 * Recognise file-name-as-teaching-placeholder. The SKILL.md uses single-letter
 * capital identifiers (`X.md`, `Y.md`, `N`, etc.) when teaching `loadmodule
 * "X.so"` → read `modules/X.md` patterns. These are not real files.
 */
const SINGLE_LETTER_PLACEHOLDER = /\/[A-Z](?:\.[a-z]+)?$/;

/**
 * Structural reference paths — the hand-authored or pipeline-guaranteed
 * artifacts that MUST exist for every shipped version. Compared as the
 * tail of the captured path (after stripping any `../opensips-config/`
 * prefix and substituting `{version}` does not happen here — we compare
 * the placeholder form so the matcher stays version-independent).
 */
const STRUCTURAL_PATHS = new Set([
  "references/{version}/cfg-format.md",
  "references/{version}/consolidated.json",
  "references/{version}/modules-index.md",
  "references/{version}/ser-lineage-notes.md",
]);

function isPlaceholder(captured: string): boolean {
  if (PLACEHOLDER_MARKERS.some((m) => captured.includes(m))) return true;
  if (SINGLE_LETTER_PLACEHOLDER.test(captured)) return true;
  return false;
}

/** Strip the optional `../opensips-config/` prefix to get the canonical key. */
function canonicalKey(captured: string): string {
  return captured.replace(/^\.\.\/opensips-config\//, "");
}

/** Extract distinct reference paths from a SKILL.md body. */
function extractReferences(body: string): string[] {
  const seen = new Set<string>();
  for (const match of body.matchAll(REFERENCE_PATTERN)) {
    const captured = match[1];
    if (captured !== undefined) {
      seen.add(captured);
    }
  }
  return [...seen];
}

/**
 * Resolve a captured path to an on-disk path, given the active version and
 * the directory the SKILL.md lives in.
 *
 * The captured path is one of two shapes:
 *   - `references/{version}/...` — relative to the SKILL.md's own skill dir.
 *   - `../opensips-config/references/{version}/...` — relative to the
 *     SKILL.md's own skill dir, then up one and into opensips-config.
 *
 * `{version}` is substituted with the active version string.
 */
function resolveCapturedPath(captured: string, skillDir: string, version: string): string {
  const withVersion = captured.replace("{version}", version);
  return path.resolve(skillDir, withVersion);
}

/**
 * Whether a resolved path is satisfied. Three shapes are handled:
 *   1. Glob ending in `*.md` — parent directory exists and has at least one
 *      `.md` file.
 *   2. Trailing-slash path — the directory exists.
 *   3. Concrete path — the file exists.
 */
function pathSatisfied(resolved: string): boolean {
  if (resolved.endsWith("*.md")) {
    const dir = path.dirname(resolved);
    if (!existsSync(dir)) return false;
    return readdirSync(dir).some((f) => f.endsWith(".md"));
  }
  if (resolved.endsWith(path.sep) || resolved.endsWith("/")) {
    return existsSync(resolved.replace(/[/\\]+$/, ""));
  }
  return existsSync(resolved);
}

/** Discover shipped versions = all `data/<version>/` directories without a `.broken` marker. */
function discoverShippedVersions(): string[] {
  return discoverVersions(DATA_ROOT).filter(
    (v) => readBrokenMarker(DATA_ROOT, v) === null,
  );
}

const shippedVersions = discoverShippedVersions();

describe("SKILL.md cross-reference integrity", () => {
  it("discovers at least one shipped (non-broken) version", () => {
    expect(shippedVersions.length).toBeGreaterThan(0);
  });

  describe.each([
    { skillName: "opensips-config", skillDir: CONFIG_SKILL_DIR },
    { skillName: "opensips-security-advisor", skillDir: ADVISOR_SKILL_DIR },
  ])("$skillName/SKILL.md", ({ skillDir }) => {
    const body = readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
    const references = extractReferences(body).filter((c) => !isPlaceholder(c));

    it("cites at least one reference path", () => {
      expect(references.length).toBeGreaterThan(0);
    });

    it("every cited path resolves for at least one shipped version", () => {
      const unresolved: Array<{ captured: string; tried: string[] }> = [];
      for (const captured of references) {
        const tried: string[] = [];
        let satisfied = false;
        for (const version of shippedVersions) {
          const resolved = resolveCapturedPath(captured, skillDir, version);
          tried.push(resolved);
          if (pathSatisfied(resolved)) {
            satisfied = true;
            break;
          }
        }
        if (!satisfied) {
          unresolved.push({ captured, tried });
        }
      }
      expect(
        unresolved,
        `references unresolved across all shipped versions:\n${unresolved
          .map((u) => `  - ${u.captured} (tried: ${u.tried.join(", ")})`)
          .join("\n")}`,
      ).toEqual([]);
    });

    it("every structural reference resolves for every shipped version", () => {
      const structural = references.filter((c) => STRUCTURAL_PATHS.has(canonicalKey(c)));
      const failures: string[] = [];
      for (const captured of structural) {
        for (const version of shippedVersions) {
          const resolved = resolveCapturedPath(captured, skillDir, version);
          if (!pathSatisfied(resolved)) {
            failures.push(`${captured} not found for ${version} at ${resolved}`);
          }
        }
      }
      expect(failures, failures.join("\n")).toEqual([]);
    });
  });
});
