/**
 * Environment normalization for deterministic builds.
 *
 * Per `docs/architecture/data-pipeline.md` §3, the build pipeline guarantees
 * byte-identical output across hosts only when locale and timezone are
 * normalized. A developer running the build with `LANG=ja_JP.UTF-8` may get
 * different string-sort orders than CI; with `TZ=America/New_York`, any
 * accidentally-included timestamp differs from a UTC-built file. This module
 * provides three small helpers:
 *
 *   - `normalizeEnvironment()` — set the deterministic defaults. Idempotent.
 *   - `captureEnvironmentSnapshot()` / `restoreEnvironmentSnapshot()` —
 *     paired helpers that exist primarily so tests (and any future tooling
 *     that wants to enter and leave the normalized state) can revert side
 *     effects on `process.env`.
 *
 * The functions deliberately only touch the three vars the pipeline cares
 * about (`LANG`, `LC_ALL`, `TZ`) — no broader env mutation.
 */

/**
 * Snapshot of the three env vars that {@link normalizeEnvironment} mutates.
 * `undefined` means the var was not set at the time the snapshot was taken
 * (as opposed to the literal string `"undefined"`, which is a real, non-empty
 * value the OS could legitimately store).
 */
export interface EnvironmentSnapshot {
  /** Value of `process.env.LANG` at snapshot time, or `undefined` if unset. */
  LANG: string | undefined;
  /** Value of `process.env.LC_ALL` at snapshot time, or `undefined` if unset. */
  LC_ALL: string | undefined;
  /** Value of `process.env.TZ` at snapshot time, or `undefined` if unset. */
  TZ: string | undefined;
}

/**
 * Normalize the process environment to deterministic-build defaults.
 *
 * Sets `process.env.LANG = "C"`, `process.env.LC_ALL = "C"`, and
 * `process.env.TZ = "UTC"`. Idempotent — calling it twice has the same
 * effect as calling it once. Should be invoked at the very start of
 * `main()` in the orchestrator, before any file reads, JSON parses, or
 * string sorts that could be locale- or timezone-sensitive.
 *
 * Why these three vars: `LANG`/`LC_ALL` govern collation order in some
 * locales (e.g. `tr_TR` lowercases `I` to `ı`, breaking ASCII assumptions),
 * and `TZ` governs how `Date` and any `toLocaleString`-style call format
 * timestamps. See `docs/architecture/data-pipeline.md` §3 for the full
 * rationale.
 */
export function normalizeEnvironment(): void {
  process.env.LANG = "C";
  process.env.LC_ALL = "C";
  process.env.TZ = "UTC";
}

/**
 * Capture the current values of the env vars that
 * {@link normalizeEnvironment} would mutate.
 *
 * Useful for test setup/teardown: capture before mutating, restore after.
 * The returned object is a plain detached record — later mutations to
 * `process.env` do not retroactively change the snapshot.
 * @returns A snapshot record of the three managed env vars. Each field is
 *   either the string value at snapshot time or `undefined` if the var
 *   was not set.
 */
export function captureEnvironmentSnapshot(): EnvironmentSnapshot {
  return {
    LANG: process.env.LANG,
    LC_ALL: process.env.LC_ALL,
    TZ: process.env.TZ,
  };
}

/**
 * Restore env vars from a snapshot, reverting any side effects of
 * {@link normalizeEnvironment} (or any other mutation in between).
 *
 * For each managed var: if the snapshot's value is `undefined`, the var
 * is removed from `process.env` via `delete` (NOT set to the literal
 * string `"undefined"`, which would be observably different from "unset"
 * to any consumer that uses `in` or checks for `undefined`). Otherwise
 * the var is reassigned to the snapshot's string value.
 * @param snapshot - Object returned by {@link captureEnvironmentSnapshot}.
 */
export function restoreEnvironmentSnapshot(snapshot: EnvironmentSnapshot): void {
  if (snapshot.LANG === undefined) {
    delete process.env.LANG;
  } else {
    process.env.LANG = snapshot.LANG;
  }

  if (snapshot.LC_ALL === undefined) {
    delete process.env.LC_ALL;
  } else {
    process.env.LC_ALL = snapshot.LC_ALL;
  }

  if (snapshot.TZ === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = snapshot.TZ;
  }
}
