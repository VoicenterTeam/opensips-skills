/**
 * Regenerates `scripts/schemas/.schema-hash` from the current schema tree.
 *
 * Run via `npm run schemas:hash`. Maintainers run this only after intentionally
 * updating the mirrored schemas; CI verifies the baseline hasn't drifted.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { computeSchemaHash } from "./hash.js";

/** Entry point — computes the hash and writes it next to this file. */
function main(): void {
  const hash = computeSchemaHash();
  const target = resolve(import.meta.dirname, ".schema-hash");
  writeFileSync(target, hash + "\n");
  console.log(`Schema hash written to ${target}: ${hash}`);
}

main();
