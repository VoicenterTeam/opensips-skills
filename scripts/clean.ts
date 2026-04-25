/**
 * `npm run clean` entry point.
 *
 * Removes the contents of every skill's `references/` tree without touching
 * the directories themselves or the hand-authored SKILL.md and
 * `ser-lineage-notes.md` files. Per Rule 8 of `CLAUDE.md`, each skill owns
 * its own output tree; the security advisor has no generated content and is
 * therefore not cleaned here.
 */

import { cleanDirectory } from "./lib/fs-helpers.js";

const targets = [
  "./plugins/opensips/skills/opensips-modules/references",
  "./plugins/opensips/skills/opensips-routing/references",
];

for (const target of targets) {
  await cleanDirectory(target);
}

process.stderr.write("Cleaned generated references.\n");
