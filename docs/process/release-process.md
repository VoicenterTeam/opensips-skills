# Release Process

This document is for the maintainer publishing a release of `opensips-skills`.
It is a checklist, not a tutorial — every step must be executed and verified.

## Versioning policy

The project follows [Semantic Versioning](https://semver.org):

- **Major** (X.0.0) — breaking changes that consumers must adapt to. Examples:
  SKILL.md description changes that move trigger boundaries; build-output
  schema changes that break tools consuming `consolidated.json`; removal of a
  previously-supported OpenSIPs version.
- **Minor** (X.Y.0) — new modules, expanded coverage, new SKILL.md content,
  new core renderers, new CI checks, new supported OpenSIPs version.
- **Patch** (X.Y.Z) — bug fixes, validator relaxations, documentation
  improvements, regenerated output from upstream extraction refresh with no
  schema impact.

Pre-1.0 the project is in active shaping; minor bumps may include breaking
changes (per the SemVer pre-1.0 convention). After 1.0.0, breaking changes
require a major bump.

## Pre-release checklist

Run every item. If any fails, fix before continuing.

### Local gates

```bash
npm ci                                # clean install from lockfile
npm run validate                      # exit 0
npm run build && git diff --exit-code # exit 0; no uncommitted regen
npm test                              # all pass including golden + e2e + determinism
npm run lint                          # exit 0
npm run format:check                  # exit 0
```

If `git diff --exit-code` reports differences after `npm run build`, the
committed generated output is out of sync with the source. Stage the diff,
inspect it, and either commit it as a separate "regen output" commit or
investigate why source changed without an accompanying regeneration.

### CI gates

The `main` branch's latest commit must have all six CI jobs green:

- `validate` — schema validation passes for every supported version.
- `build` — build runs cleanly and committed output matches.
- `test` — full test suite passes with coverage.
- `determinism` — build-twice produces byte-identical output.
- `lint` — ESLint and Prettier both clean.
- `skill-md-check` — no `MODULE_INDEX_PLACEHOLDER` and no sibling
  SER-lineage project name leaks.

If any job is red, fix before tagging.

### Golden-path demos

- Open `docs/testing/golden-path-demos.md`.
- Install the plugin in a fresh Claude Code session:

  ```bash
  claude --plugin-dir /absolute/path/to/opensips-skills/plugins/opensips
  ```

- Run all 16 demos. `/clear` between demos to avoid context contamination.
- Document the per-demo outcome (Pass / Partial / Fail) with the run date
  and Claude model used. Update the "Last verified" line on each demo
  (replace the "Pending" entries).
- Apply the release decision tree at the bottom of `golden-path-demos.md`.
  In summary: any Fail in Section C (cross-project guardrail) blocks the
  release; any Fail elsewhere blocks unless documented as a known issue
  with mitigation; Partials must be investigated, not released past.
- Aggregate target: at least 80% Pass with zero blocking-Fail outcomes.
- Commit the updated `golden-path-demos.md` with the verified-on dates and
  model.

### CHANGELOG

- The `[Unreleased]` section's bullets accurately describe what shipped
  since the previous release.
- Move the `[Unreleased]` content into a new `[X.Y.Z] - YYYY-MM-DD` section.
- Reset `[Unreleased]` to empty (or leave a placeholder note).
- Verify the comparison link at the bottom of the file points at the new
  tag boundary.

### Version bump

Update version strings in three places (must match):

- `package.json` `"version"`
- `.claude-plugin/marketplace.json` top-level `"version"` AND the inner
  plugin entry's `"version"`
- `plugins/opensips/.claude-plugin/plugin.json` `"version"`

Verify with:

```bash
grep -rE '"version":\s*"[^"]+"' \
  package.json \
  .claude-plugin/marketplace.json \
  plugins/opensips/.claude-plugin/plugin.json
```

All occurrences should report the same target version.

## Cutting the release

```bash
# 1. Commit the version bump, CHANGELOG move, and verified golden-path demos.
git add \
  package.json \
  .claude-plugin/marketplace.json \
  plugins/opensips/.claude-plugin/plugin.json \
  CHANGELOG.md \
  docs/testing/golden-path-demos.md
git commit -m "Release vX.Y.Z"

# 2. Tag the commit.
git tag vX.Y.Z

# 3. Push commit + tag.
git push
git push --tags
```

Then create a GitHub release from the tag. Paste the new `[X.Y.Z]` section
from `CHANGELOG.md` into the release notes body, or point at the changelog
anchor.

## Post-release verification

Within 24 hours of tagging:

- Install the new release in a fresh Claude Code session (not the local
  plugin-dir install used during pre-release; install the published
  release the way users will).
- Run a sample of 5 to 10 golden-path demos to confirm runtime behavior
  matches the pre-release verification.
- Verify the GitHub Release page renders the CHANGELOG section correctly
  and the link from the changelog comparison footer resolves.
- Verify the marketplace entry updates (if marketplace publication is
  wired for this release).

If post-release verification surfaces a regression, follow the rollback
procedure below.

## Communicating the release

Optional but valuable:

- A short post in the OpenSIPS community forum or mailing list.
- A mention in Claude Code community channels.
- A blog post or social media announcement for significant releases.

Reach matters: the project's value depends on people knowing it exists.
Routine patch releases do not need announcements; minor and major releases
generally do.

## Rollback procedure

If a release introduces a critical regression:

- Do NOT delete the released tag. Users may have already pinned to it;
  deleting tags breaks their installs.
- Publish a patch release `vX.Y.Z+1` with the offending change reverted.
- Update `CHANGELOG.md` noting the regression and the patch.
- Communicate the patch to anyone who may have installed the broken
  version (forum post, GitHub release notes calling out the issue).

If the regression is severe enough that the broken version must be
unfindable, consider yanking from the marketplace — reach out to the
marketplace maintainers for the procedure.

## Submitting to the Claude Code marketplace

External workflow not controlled by this project. Follow Anthropic's
documented submission process at release time. Note any project-specific
requirements (org name, contact info, category) in the marketplace entry
before submission.

## Schedule

Releases are cut on demand, not on a fixed cadence. Triggers:

- Significant new content (multiple modules added, a new OpenSIPs version
  supported).
- Bug fix that affects a documented behavior in a released version.
- Coordinated update with `opensips-docs-collector` (e.g., schema bump
  that requires re-mirroring).

For routine documentation improvements alone, batch into the next
bug-fix release rather than cutting a release per doc change.

## See also

- [CHANGELOG.md](../../CHANGELOG.md) — release history.
- [docs/testing/golden-path-demos.md](../testing/golden-path-demos.md) —
  the manual checklist.
- [docs/testing/test-strategy.md](../testing/test-strategy.md) — what CI
  gates verify.
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml) — CI workflow
  definition.
- [maintenance.md](maintenance.md) — post-release maintenance expectations.
