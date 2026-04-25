/**
 * CLI entry for the module-index rebuild step (M7 task 7.5).
 *
 * Discovers the highest-numbered version under `./data/` and rebuilds the
 * module catalog table inside
 * `plugins/opensips/skills/opensips-modules/SKILL.md`.
 *
 * Exits with code 1 on any failure (no versions discovered, validation
 * failure, marker block missing, write failure). Output on success is a
 * single confirmation line naming the version used.
 *
 * Run via `npm run build:skills`.
 */

import { rebuildModuleIndex } from "./index.js";
import { discoverVersions } from "../lib/discover.js";

/**
 * Discover the latest version, rebuild the module index, and report.
 * @returns Promise resolving once the SKILL.md has been written.
 */
async function main(): Promise<void> {
  const versions = discoverVersions("./data");
  if (versions.length === 0) {
    console.error("No versions in data/");
    process.exit(1);
  }
  const latest = versions[versions.length - 1]!;
  await rebuildModuleIndex(
    "plugins/opensips/skills/opensips-modules/SKILL.md",
    "./data",
    latest,
  );
  console.log(`Module index rebuilt from ${latest}`);
}

main().catch((err: unknown) => {
  console.error("FATAL:", err);
  process.exit(1);
});
