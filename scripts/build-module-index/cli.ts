/**
 * CLI entry for the module-index step.
 *
 * Transitional: per ADR-012, the build-module-index step is being
 * repurposed to render `references/{version}/modules-index.md` rather than
 * inject a 200-row catalog into the old `opensips-modules/SKILL.md`. The
 * inline marker block was removed when the unified `opensips-config`
 * SKILL.md was authored.
 *
 * Until the new renderer is wired in (plan Tasks 10 and 11), this CLI is a
 * no-op so `npm run build:skills` exits cleanly without touching files.
 */

console.log("build:skills: pending repurposing per ADR-012; no-op for now.");
