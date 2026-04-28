<p align="center"><img src="docs/OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Contributing to opensips-skills

Thank you for considering a contribution. This document covers how to set up
the project locally, what kinds of contributions are welcome, and how the
review process works.

## Quick orientation

Before anything else, read [`CLAUDE.md`](./CLAUDE.md). It is the project's
operating manual and serves as the navigation map for both human contributors
and AI pair programmers. It explains what the project is, how the repository
is laid out, where to find what you need, and the hard rules that govern
changes. Most of the answers you will look for are one short scroll away
inside that file.

The short version: this repository is a Claude Code plugin that ships one
Agent Skill (`opensips-config`) for working with OpenSIPs. The plugin grounds
Claude in version-specific reference data so it stops hallucinating
identifiers across versions. A second skill scaffold (`opensips-security-advisor`)
is preserved on disk for a follow-up release; see ADR-013.

## Setting up locally

```bash
git clone https://github.com/VoicenterTeam/opensips-skills.git
cd opensips-skills
npm ci
npm run validate          # exit 0 means source is clean
npm run build             # produces references and consolidated index
npm test                  # runs all tests
npm run lint              # ESLint + JSDoc rules
```

Node 20 or newer is required (see `engines.node` in `package.json`). On
Windows, `core.autocrlf=true` may cause local schema-hash drift; CI runs on
Linux and is unaffected, so you can develop on Windows freely as long as you
let CI be the source of truth for hashes.

## What kinds of contributions are welcome

- **Bug fixes** in the build pipeline (`scripts/`).
- **Documentation improvements** under `docs/` and the public README.
- **Test additions** (golden fixtures, e2e cases, edge cases).
- **CI improvements** (`.github/workflows/ci.yml`).
- **Renderer enhancements** that produce cleaner Markdown (e.g., better
  empty-section detection, friendlier formatting of edge-case data).
- **SKILL.md tweaks** that improve trigger reliability or cross-project
  guardrail strength. These are consequential — see "How to update SKILL.md
  content" below.

## Where contributions DON'T belong here

This section is unusual but useful. Many projects accept contributions that
do not fit and end up rejecting them later, frustrating the contributor.
Naming the boundaries upfront sets expectations.

- **Module reference content.** New modules, parameter additions, function
  signature corrections — these go to `opensips-docs-collector` (the
  upstream extraction project), not here. After they land upstream, this
  project re-mirrors and rebuilds. See CLAUDE.md Rule 3.
- **OpenSIPs source code bugs.** Fixes to OpenSIPs itself go to the OpenSIPS
  project. This plugin documents OpenSIPs; it does not ship its code.
- **Substantive security-advisor patterns.** Per ADR-005, the security
  review skill's content is owned by a separate authoring agent. The
  scaffold here is intentional. Contributions to the security review prose
  should coordinate with that agent's workflow.
- **Sibling SER-lineage project content.** Per ADR-008, this project stays
  strictly within OpenSIPs territory and does not name sibling projects.
  PRs that introduce sibling-project names will be asked to use the
  project's neutral phrasing.

## The development loop

```bash
git checkout -b feature/your-change
# ... make changes
npm run validate         # must pass
npm test                 # must pass
npm run build            # produces output; commit any regenerated artifacts
npm run lint             # must pass
git add -A
git commit -m "feat: describe what you changed"
git push
gh pr create
```

Every PR that changes `source/` or `scripts/` must include the regenerated
artifacts under `plugins/opensips/skills/*/references/`. CI enforces this
with `git diff --exit-code` after `npm run build`. Reviewing source and
generated output side by side catches bugs no one would catch reviewing
source alone (CLAUDE.md Rule 5).

## Pull request expectations

Every PR description should include:

- **What changed and why** (not just the file list — git diff already shows
  that).
- **How it was tested** (what local commands you ran, what passed).
- **Any user-visible behavior change** (CLI flags, output format, schema
  additions).
- **Linked issue or discussion** (if there is one).

CI must be green before merge:

- `validate` — schema validation passes against all source.
- `build` — full build succeeds; `git diff --exit-code` is clean (you
  committed all regenerated output).
- `test` — all unit, integration, golden-file, and e2e tests pass; coverage
  >80% for `scripts/lib/`, >85% for renderers and the index builder.
- `determinism` — build-twice produces byte-identical output.
- `lint` — ESLint and Prettier both clean.
- `skill-md-check` — no unreplaced module-index placeholder, no
  sibling-project name leaks.

PRs that add scope should be small and focused. Refactors that touch more
than 20 files need a discussion first.

## How to add a new ADR

For changes to architecture, conventions, the build pipeline structure, or
any decision that future contributors will reverse-engineer: write an ADR
first, get it reviewed, then implement. Per CLAUDE.md Rule 2, every
architectural change needs an ADR.

```bash
cp docs/architecture/adr/000-template.md \
   docs/architecture/adr/0NN-your-decision-title.md
```

The next available number can be found by listing the ADR directory. Fill
in every section. Status starts as "Proposed"; flip to "Accepted" after
review. If you are superseding an existing ADR, link to it and update the
old one's status to "Superseded by ADR-NNN" — do not edit the old decision
in place.

## How to update SKILL.md content

The active SKILL.md in v1 is `plugins/opensips/skills/opensips-config/SKILL.md`.
It is the project's most consequential output — it runs on every Claude Code
session that activates the skill. Per CLAUDE.md Rule 6, it is precious. The
second SKILL.md lives at `plugins/opensips/skills/opensips-security-advisor/SKILL.md.scaffold`
and is intentionally disabled per ADR-013; re-enabling it is a `git mv` plus
substantive review-pattern authoring.

Required reading before editing:

- `docs/architecture/skill-authoring-guide.md` — the conventions.
- `docs/architecture/adr/008-ser-lineage-neutral-framing.md` — the
  no-sibling-names rule.

After editing:

- Run the `golden-path-demos.md` checklist locally against Claude Code
  (interactive).
- Document the verification outcome in your PR description (date plus model
  plus per-demo pass/fail).
- A SKILL.md change that regresses any golden-path demo is a release
  blocker.

## How to update a generated reference file

You don't, directly. Files under
`plugins/opensips/skills/*/references/{version}/` are generated. Hand edits
will be overwritten on the next `npm run build`. Per CLAUDE.md Rule 1.

If the output is wrong:

- If the source JSON in `source/{version}/` is wrong: fix upstream in
  `opensips-docs-collector`, re-extract, re-mirror here, rebuild.
- If the renderer is wrong: fix the renderer in `scripts/render-module/` or
  `scripts/render-core/`, regenerate fixtures, commit.

## How the schema mirroring contract works

`scripts/schemas/` mirrors `opensips-docs-collector/src/schemas/` verbatim.
A SHA-256 hash of all schema files is committed at
`scripts/schemas/.schema-hash`. CI fails the build (exit 5) if the hash
drifts without an explicit regeneration. See ADR-002 for the source-of-truth
rationale.

To update mirrored schemas:

```bash
# Re-mirror schemas from upstream
# (manual copy or scripted; see docs/architecture/data-pipeline.md §5.3)
npm run schemas:hash    # regenerates the .schema-hash baseline
git add scripts/schemas/
git commit -m "chore(schemas): re-mirror from opensips-docs-collector @ <sha>"
```

The PR description must link to the upstream commit that motivated the
re-mirror.

## How to add a new OpenSIPs version

Per ADR-009, no code changes are needed.

```bash
# 1. Drop the new version's source folder from opensips-docs-collector
cp -r ../opensips-docs-collector/data/processed/4.0/ source/4.0/

# 2. Validate
npm run validate -- --only 4.0    # resolve any errors upstream first

# 3. Build
npm run build -- --only 4.0

# 4. Seed the canary baseline
npm run baseline:update -- --only 4.0

# 5. Build all versions, verify determinism
npm run build

# 6. Commit
git add -A source/4.0/ plugins/opensips/skills/ \
        scripts/build-consolidated/.statistics-baseline.json
git commit -m "feat: add OpenSIPs 4.0 support (data only, no code change)"
```

Version isolation is sacred (CLAUDE.md Rule 4): a new version is its own
independent world. No code path should read from one version while
operating on another.

## Coding conventions

- **TypeScript** with strict mode, `noUncheckedIndexedAccess`, NodeNext
  modules, ESM.
- **JSDoc** on every exported function with `@param`, `@returns`, and at
  least one `@example` per ADR-004.
- **No `console.log` in production paths** — use the structured
  `emitProgress`/`emitWarning`/`emitError` helpers from
  `scripts/lib/output.ts`.
- **Determinism is load-bearing** — sort outputs explicitly, use
  `path.posix` for output paths, normalize the environment via
  `normalizeEnvironment()`.
- **No hand edits to generated files** (Rule 1).
- **No upstream content edits** (Rule 3).
- **No naming sibling projects** (ADR-008).

## Communication

- **Bug reports and feature requests:** GitHub Issues.
- **Open-ended questions and design discussions:** GitHub Discussions.
- **PRs:** for concrete code or doc changes.

Response times are best-effort within a few days. The project is small and
maintained by a small team. We appreciate your patience and your
contribution.
