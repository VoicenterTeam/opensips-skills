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
 */

import { cleanDirectory } from "./lib/fs-helpers.js";
import { rm } from "node:fs/promises";

const versions = ["3.5", "3.6"];
const referencesRoot = "./plugins/opensips/skills/opensips-config/references";

// Clean generated subdirectories (core/, modules/, guides/)
const generatedDirs = ["core", "modules", "guides"];
for (const version of versions) {
  for (const dir of generatedDirs) {
    const targetDir = `${referencesRoot}/${version}/${dir}`;
    await cleanDirectory(targetDir);
  }
}

// Remove generated files (consolidated.json, modules-index.md)
const generatedFiles = ["consolidated.json", "modules-index.md"];
for (const version of versions) {
  for (const file of generatedFiles) {
    const targetFile = `${referencesRoot}/${version}/${file}`;
    try {
      await rm(targetFile, { force: true });
    } catch {
      // Ignore errors (file may not exist)
    }
  }
}

process.stderr.write("Cleaned generated references.\n");
