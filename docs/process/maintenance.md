<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Maintenance

Operational expectations for maintainers after v1.0.0 ships. This document
describes how the project is kept healthy: triage, refresh cadences,
deprecation policy, and update flows from upstream.

## Issue triage

Labels:

- `bug` — something does not work as documented.
- `enhancement` — new feature or capability request.
- `docs` — documentation gap or correction.
- `upstream` — issue traces to `opensips-docs-collector` or OpenSIPS
  itself; not actionable in this repository.
- `question` — clarification request; usually closed with a pointer to
  existing docs.
- `release-blocker` — affects the next release; must be resolved before
  tagging.
- `good-first-issue` — small, well-scoped, suitable for new contributors.

Response targets (best-effort, not contractual):

- New issues acknowledged within 7 days (label + brief comment).
- Reproducible bugs fixed or scheduled within 30 days.
- Unactionable issues (`upstream`, vague reports) closed within 14 days
  with a redirect.

Severity escalation:

- A bug that affects a documented behavior in a released version: file as
  `release-blocker`, schedule a patch release.
- A bug that affects only the development branch: schedule normally
  alongside other in-flight work.

## "My OpenSIPs config does not work" reports

These are common but rarely actionable here. Check in this order:

1. Is the issue a missing or wrong reference (function signature,
   parameter name, dependency)? Likely an `upstream` issue in
   `opensips-docs-collector`. Verify by inspecting the upstream JSON in
   `data/{version}/`. If the upstream JSON is correct, the issue is
   here (renderer or SKILL.md).
2. Is the issue a SKILL.md gap (Claude did not trigger, did not read the
   right file, gave a wrong answer)? That is a `bug` here. Reproduce,
   identify the SKILL.md weakness, fix.
3. Is the issue an OpenSIPs runtime problem (the config parses but the
   daemon misbehaves)? That is an OpenSIPS issue, not actionable here.
   Redirect to OpenSIPS support channels.

## Refresh cadence

### Upstream extraction sync

When `opensips-docs-collector` ships changes:

- Schema additions: re-mirror the schemas into `scripts/schemas/`,
  regenerate the schema hash, rebuild, commit.
- New modules / parameter changes: re-mirror `data/{version}/`, rebuild,
  commit. Consider a release.
- Schema breaking changes: coordinate with upstream, possibly bump the
  major version here.

Cadence: at least quarterly even without explicit upstream signals.
Drift is silent.

### OpenSIPs version arrivals

When OpenSIPs ships a new version:

- Wait for `opensips-docs-collector` to extract it.
- Drop the data folder per the new-version workflow in `CONTRIBUTING.md`.
- Add the new version to the supported-versions table in `README.md`.
- Cut a minor release.

### Golden-path demos

- Run before every release (per `release-process.md`).
- Run quarterly even without releases. Claude model behavior drifts;
  demos that worked at one model version may behave differently after a
  model upgrade.
- Update the "Last verified" lines in `docs/testing/golden-path-demos.md`
  with the run date and model used.

## Security advisor content updates

Per ADR-005, the security review skill's content is owned by a separate
authoring agent. Updates flow as follows:

- The agent ships content updates as PRs to
  `plugins/opensips/skills/opensips-security-advisor/SKILL.md` and any
  new reference files under
  `plugins/opensips/skills/opensips-security-advisor/references/`.
- This project's maintainer reviews for:
  - Cross-skill guardrail consistency (matches the framing of the other
    two SKILL.md files).
  - No sibling SER-lineage project name leaks (ADR-008 / the
    `skill-md-check` CI job).
  - Markdown lint cleanliness.
  - Integration contract preservation (Rule 8: skills do not write into
    each other's directories).
- Substantive review patterns (the actual security findings vocabulary)
  are the agent's domain. Review structure and integration here; defer
  to the agent on content.

## Deprecation policy

### OpenSIPs versions

- Versions exit support when their upstream maintainer announcements
  indicate end-of-life.
- A deprecated version's data folder remains in `data/` for one release
  cycle past EOL, marked with a `.broken` marker file pointing at the
  upstream EOL announcement.
- Subsequent release: remove the data folder, rebuild, commit.
- The supported-versions table in `README.md` reflects current state.

### Schema versions

- The mirrored Zod schemas evolve with `opensips-docs-collector`.
  Backward compatibility is the upstream's responsibility.
- If a schema change breaks the `consolidated.json` shape consumers
  depend on (rare), bump the major version here and document the break
  in `CHANGELOG.md` with a migration note.

### Plugin manifest schema

- If Claude Code's plugin manifest schema changes, update both
  `marketplace.json` and `plugin.json` per Anthropic's migration
  guidance. Bump the project version as needed.

## Repository hygiene

- Stale branches (more than 90 days no activity, no open PR): close any
  associated PRs, then delete the branch.
- Issues without acknowledgment after 14 days: triage owner ping.
- CI runtime: monitor; if it crosses 10 minutes, profile and parallelize.
- Generated content: re-validate via the build-twice CI determinism gate.
  If non-determinism appears, root-cause immediately. Do not paper over
  with retries.

## Outage / external dependency failures

- `opensips-docs-collector` repository unavailable: mirroring blocks; no
  immediate impact on existing builds. Defer re-mirror until upstream is
  back.
- GitHub Actions outage: builds queue; no maintainer action needed.
- npm registry outage: `npm ci` may fail; defer non-critical work.
- Coverage tooling outage: CI lint job may fail. Either accept and
  document, or remove the coverage dependency from the failing job.

## Communication channels

- **GitHub Issues / Discussions** — primary, for everything.
- **OpenSIPS community forum / mailing list** — for releases and
  significant updates.
- **Claude Code community channels** — for skill-specific guidance and
  AI integration questions.

## See also

- [release-process.md](release-process.md) — how releases are cut.
- [../testing/test-strategy.md](../testing/test-strategy.md) — what CI
  guarantees.
- [../testing/golden-path-demos.md](../testing/golden-path-demos.md) —
  the runtime regression checklist.
- [../architecture/adr/](../architecture/adr/) — recorded architectural
  decisions.
