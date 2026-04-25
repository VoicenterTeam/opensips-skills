/**
 * `npm run clean` entry point.
 *
 * Removes generated content from opensips-config's `references/{version}/`
 * subdirectories while preserving hand-authored files (`cfg-format.md`,
 * `ser-lineage-notes.md`). Cleans only the generated subdirectories
 * (`core/`, `modules/`, `guides/`) and generated files (`consolidated.json`,
 * `modules-index.md`) for each version. Per Rule 8 of `CLAUDE.md`, each skill
 * owns its own output tree; the security advisor has no generated content and
 * is therefore not cleaned here.
 *
 * Versions are discovered dynamically from `./data/` via {@link discoverVersions}
 * (per ADR-009), matching the orchestrator's behaviour. A new version dropped
 * under `data/` is cleaned automatically without code changes.
 */

import { cleanDirectory } from "./lib/fs-helpers.js";
import { discoverVersions, DiscoverError } from "./lib/discover.js";
import { rm } from "node:fs/promises";

const referencesRoot = "./plugins/opensips/skills/opensips-config/references";
const generatedDirs = ["core", "modules", "guides"];
const generatedFiles = ["consolidated.json", "modules-index.md"];

let versions: string[];
try {
  versions = discoverVersions("./data");
} catch (err) {
  if (err instanceof DiscoverError) {
    // No data/ directory means nothing to clean. Silent exit matches the
    // historical behaviour; the build script would also fail on the same
    // missing directory and surface its own error, so duplicating that
    // here would be noise.
    process.stderr.write("Cleaned generated references.\n");
    process.exit(0);
  }
  process.stderr.write(`FATAL: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
}

for (const version of versions) {
  for (const dir of generatedDirs) {
    const targetDir = `${referencesRoot}/${version}/${dir}`;
    await cleanDirectory(targetDir);
  }
  for (const file of generatedFiles) {
    const targetFile = `${referencesRoot}/${version}/${file}`;
    try {
      await rm(targetFile, { force: true });
    } catch {
      // Ignore errors (file may not exist).
    }
  }
}

process.stderr.write("Cleaned generated references.\n");
