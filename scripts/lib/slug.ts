/**
 * Filename slug normalisation for the per-module renderer.
 *
 * Slugs are used as output filenames under
 * `plugins/opensips/skills/opensips-config/references/{version}/modules/`.
 * Filesystem behaviour under name collisions is platform-dependent
 * (case-insensitive on macOS default and Windows; case-sensitive on Linux),
 * so this module both produces a canonical lowercase form and exposes a
 * hard-failure collision check the orchestrator runs before any write.
 *
 * Algorithm and rationale: see `docs/architecture/data-pipeline.md` §2.3.
 */

/**
 * Normalise a name into a filesystem-safe slug.
 *
 * Algorithm (per `docs/architecture/data-pipeline.md` §2.3):
 *   1. Lowercase.
 *   2. Replace any character not in `[a-z0-9_-]` with `-`.
 *   3. Collapse consecutive `-` into a single `-`.
 *   4. Trim leading and trailing `-`.
 *
 * Underscores are PRESERVED — they are part of the canonical slug
 * character set, and runs of underscores are not collapsed. Hyphens are
 * only inserted as a replacement for "weird" characters and are the only
 * character a run-collapse applies to.
 * @param name - Raw display name to normalise (e.g. an OpenSIPs module
 *   name from upstream extraction output).
 * @returns The canonical slug. May be the empty string if the input
 *   contained no preserved characters (e.g. `"---"` or `"!!!"`).
 * @example
 *   slugify("uac_auth")       // => "uac_auth"
 *   slugify("Mi-HTTP")        // => "mi-http"
 *   slugify("b2b__entities")  // => "b2b__entities"
 *   slugify("foo!@bar")       // => "foo-bar"
 *   slugify("---x---")        // => "x"
 *   slugify("dialog (BETA)")  // => "dialog-beta"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Verify that a list of named items produces unique slugs. Throws a
 * structured {@link SlugCollisionError} carrying both colliding source
 * names if any two items share the same canonical slug.
 *
 * The collision check is hard-failure because filesystem behaviour under
 * name collisions is platform-dependent and silently overwriting one file
 * with another would be worse than failing the build (per
 * `docs/architecture/data-pipeline.md` §2.3 and §9). Slugs are produced
 * by {@link slugify}; two distinct display names ("Mi-HTTP" vs "mi-http",
 * "foo bar" vs "foo-bar", "tm" vs "TM") that fold to the same slug are
 * the typical collision shape.
 *
 * Encounter order is preserved in the reported pair: `collidingNames[0]`
 * is the first-seen source name and `collidingNames[1]` is the duplicate
 * encountered later.
 * @param items - Array of objects with a `name` field. Other fields on
 *   the items are ignored.
 * @throws {SlugCollisionError} If any two items produce the same slug.
 *   Build-pipeline callers are expected to convert this to exit code 3
 *   (validation failure) per the failure taxonomy.
 * @example
 *   assertUniqueSlugs([{ name: "tm" }, { name: "registrar" }]); // ok
 *   assertUniqueSlugs([{ name: "tm" }, { name: "TM" }]);        // throws
 */
export function assertUniqueSlugs<T extends { name: string }>(items: T[]): void {
  const seen = new Map<string, string>();
  for (const item of items) {
    const slug = slugify(item.name);
    const existing = seen.get(slug);
    if (existing !== undefined) {
      throw new SlugCollisionError(slug, [existing, item.name]);
    }
    seen.set(slug, item.name);
  }
}

/**
 * Error thrown by {@link assertUniqueSlugs} when two named items produce
 * the same canonical slug. Carries the colliding source names and the
 * canonical slug so callers can produce a diagnostic that points the
 * contributor at the upstream rename or extension to the slug rules.
 *
 * The error extends the standard `Error` so it propagates through normal
 * `try/catch` flow. Unlike the structured `BuildError` hierarchy in
 * `errors.ts`, this is a leaf error type local to slug normalisation —
 * the orchestrator wraps it into the appropriate exit-code-bearing form
 * at the boundary.
 */
export class SlugCollisionError extends Error {
  override readonly name = "SlugCollisionError";
  /** The canonical slug both source names collapsed to. */
  readonly slug: string;
  /**
   * The two colliding source names in encounter order:
   * `[firstSeen, duplicate]`.
   */
  readonly collidingNames: [string, string];

  /**
   * @param slug - The canonical slug both names collapsed to.
   * @param collidingNames - The two colliding source names in encounter
   *   order: `[firstSeen, duplicate]`.
   */
  constructor(slug: string, collidingNames: [string, string]) {
    super(
      `slug collision on "${slug}": "${collidingNames[0]}" and "${collidingNames[1]}" produce the same canonical filename`,
    );
    this.slug = slug;
    this.collidingNames = collidingNames;
  }
}
