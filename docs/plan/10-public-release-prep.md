# Milestone 10: Public release prep

## Goal

Polish the project's public surface for release: write the user-facing README, the CONTRIBUTING guide, finalize the plugin marketplace metadata, document the release process, and execute the first public release. At the end of this milestone, anyone can discover the plugin via Claude Code's marketplace, install it with one command, and start using it productively. Contributors arriving from the GitHub repository find a clear path from "I want to help" to "I've shipped a useful change."

This milestone is about stewardship, not engineering. Everything technical was settled in milestones 0–9; what remains is making the project legible, welcoming, and operationally sustainable.

## Why this is sequenced here

A release made before the project is stable is irresponsible — users encounter bugs, contributors waste effort on broken foundations, and the project's reputation gets shaped by its weakest moment. Nine milestones of foundation work mean this release reflects the project at its actual quality, not a rushed approximation.

Conversely, indefinitely deferring release is its own failure mode. A project that "isn't ready" perpetually never gets feedback from real users, never attracts contributors, and never validates whether the design choices were right in practice. Milestones 1–9 produced a working, tested, automated system; milestone 10 turns that system into a product.

## Tasks

### Task 10.1: Author the public README

The current README is a placeholder from milestone 0. Replace it with the real one — the public landing page someone sees when they hit the GitHub repository.

The README serves three audiences:

1. **Discovery readers** — people Googling "OpenSIPs Claude" or browsing Claude Code skills who need to know what this is in 30 seconds.
2. **Evaluation readers** — people deciding whether to install the plugin, who need enough technical context to make the choice.
3. **Contribution readers** — people who want to help, who need to know where to start.

Structure (target: 300–400 lines total):

```markdown
# opensips-skills

> Claude Code plugin providing three coordinated Agent Skills for working with OpenSIPs.

[![CI](https://github.com/<org>/opensips-skills/workflows/CI/badge.svg)](https://github.com/<org>/opensips-skills/actions)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

## What this is

(Three or four paragraphs covering: the hallucination problem, the plugin's
solution, the three skills' roles, the version-grounded approach.)

## Install

```bash
/plugin marketplace add OpenSIPS/opensips-skills
/plugin install opensips@opensips-skills
```

## Quick example

(One concrete prompt-and-response showing the plugin in action.)

## How it works

(One section explaining the three skills, with the architecture diagram from
docs/vision.md.)

## Supported OpenSIPs versions

(Table: 3.5 / 3.6, what's covered, what's not.)

## Documentation

(Links to vision, requirements, architecture, and the implementation plan.)

## Contributing

(Brief overview pointing to CONTRIBUTING.md.)

## License

GPL-3.0, matching upstream OpenSIPs.

## Acknowledgments

(The upstream extraction project, the OpenSIPs core team, etc.)
```

The README is **public-facing**, which is a different register from the internal documents. Use direct, confident prose. Avoid hedging, avoid jargon that requires context to parse, avoid references to internal artifacts (ADRs, milestones) — those exist in `docs/` for people who want depth.

The "Quick example" section is the most important. Most readers decide whether to engage based on this section alone. Make it concrete: a real prompt, a real response, with the relevant skill activations visible.

Acceptance: The README is committed at the repo root. It renders correctly on GitHub. The Quick example demonstrates the plugin's value in under 30 seconds of reading.

### Task 10.2: Author CONTRIBUTING.md

Create `CONTRIBUTING.md` at the repo root. This is the document that converts curious visitors into contributors.

Structure (target: 250–350 lines):

```markdown
# Contributing to opensips-skills

Thank you for considering a contribution. This document covers how to set up
the project locally, what kinds of contributions are welcome, and how the
review process works.

## Quick orientation

(Pointer to CLAUDE.md as the project's operating manual.)

## Setting up locally

(npm ci, npm run validate, npm run build, npm test — the local development loop.)

## What kinds of contributions are welcome

(Categorized list: bug fixes, documentation improvements, new module references
via the upstream extraction project, security advisor content via the
security agent, test additions, CI improvements.)

## Where contributions DON'T belong here

(Module reference content goes upstream to opensips-docs-collector, not here.
Security advisor content is owned by a separate agent. Decisions that change
architecture require an ADR before code.)

## The development loop

(Pull main, branch, make changes, run npm run validate, run npm test,
run npm run build, commit, push, open PR.)

## Pull request expectations

(What every PR description should contain, the CI checks that must pass,
the review process, expected response time.)

## How to add a new ADR

(For contributors proposing architectural changes — they write the ADR before
implementing, the ADR gets reviewed, then implementation follows.)

## How to update SKILL.md content

(The skill authoring guide is required reading. Description changes require
iteration evidence per the guide §2.8. Body changes are tested against the
golden-path demos.)

## How to update a generated reference file

(You don't, directly. The fix goes upstream to opensips-docs-collector,
gets re-extracted, gets re-mirrored here, gets rebuilt.)

## How the schema mirroring contract works

(Brief overview pointing at ADR-002 and the schema hash mechanism.)

## Coding conventions

(JSDoc per ADR-004, ESLint enforcement, Prettier formatting, no console.log
in non-debug paths, etc.)

## Communication

(Issues for bugs and feature requests, Discussions for open-ended questions,
PRs for concrete changes.)
```

CONTRIBUTING.md complements README.md — README is "what is this and why," CONTRIBUTING is "how do I help." Cross-reference between them but don't duplicate.

The "Where contributions DON'T belong here" section is unusual but useful. Many projects accept contributions that don't fit and end up rejecting them later, frustrating the contributor. Naming the boundaries upfront sets expectations.

Acceptance: CONTRIBUTING.md is committed. A new contributor can read it and have a clear answer to "what's my first PR?"

### Task 10.3: Polish the plugin manifests

The marketplace.json and plugin.json files were authored in milestone 0 with placeholder values. Update them to reflect the project's release-ready state.

Update `.claude-plugin/marketplace.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-marketplace",
  "name": "opensips-skills",
  "version": "1.0.0",
  "description": "OpenSIPs Agent Skills for Claude Code: vibe routing, module reference, and security review for SIP server configurations.",
  "owner": "OpenSIPs",
  "homepage": "https://github.com/<org>/opensips-skills",
  "license": "GPL-3.0-or-later",
  "plugins": [
    {
      "name": "opensips",
      "source": "./plugins/opensips",
      "version": "1.0.0",
      "description": "Three coordinated skills for working with OpenSIPs in Claude Code: route script authoring, module reference data, and security review.",
      "category": "development",
      "tags": ["sip", "voip", "opensips", "telecom", "infrastructure"]
    }
  ]
}
```

Update `plugins/opensips/.claude-plugin/plugin.json` with the v1.0.0 details, the OpenSIPs project's homepage, the GitHub repository URL, and contact information for the maintainer.

The marketplace metadata is what's displayed in `/plugin marketplace list` and similar discovery surfaces. Treat it as marketing copy: clear, specific, well-targeted to people scanning a list of plugins.

Acceptance: Both manifest files have v1.0.0 versions, complete metadata, and useful descriptions. They parse as valid JSON. They display correctly when installed via Claude Code.

### Task 10.4: Author the release process document

Create `docs/process/release-process.md` (or similar; a new `process/` directory under `docs/` is fine if it's the first such document).

This document is for whoever publishes a release. It's procedural, not narrative.

Structure:

```markdown
# Release Process

## Overview

(Releases follow semver. Major versions for breaking changes — new SKILL.md
descriptions that change triggering, schema changes that break consumers.
Minor versions for new modules, new SKILL.md content, expanded coverage.
Patch versions for bug fixes.)

## Pre-release checklist

(npm run validate passes. npm run build passes with no diff. npm test passes.
CI is green on main. The golden-path demos document has been manually verified
in the past 7 days. CHANGELOG.md has an entry for this release.)

## Cutting a release

(Bump version in package.json and both manifest files. Update CHANGELOG.md
moving [Unreleased] to [Version - Date]. Commit with message "Release vX.Y.Z".
Tag the commit: git tag vX.Y.Z. Push: git push --tags.)

## Post-release verification

(Install the new release in a clean Claude Code session. Run the canonical
prompt set. Verify the marketplace entry updates. Verify the CHANGELOG link
in the release notes resolves.)

## Communicating the release

(GitHub release notes auto-generated from CHANGELOG. Optional: announcement
in OpenSIPs community forum if the release is significant.)

## Rollback procedure

(If a release breaks installations, the rollback is to publish vX.Y.Z+1
with the offending change reverted, not to delete the broken tag. Tags are
permanent; users may have already pinned to them.)
```

The document is operational. A release should be doable in 30 minutes by someone who has never done one before, just by following the steps.

Acceptance: The release process document is committed. Someone unfamiliar with the project can follow it.

### Task 10.5: Author the user-facing skill usage guide

Create `docs/usage-guide.md` covering how to use the plugin productively as an end user (not how to develop or contribute).

This document is for the SIP engineer who installed the plugin and wants to know what they can do with it. It complements the SKILL.md descriptions — those drive triggering; this guide teaches the engineer how to phrase prompts well.

Structure (target: 200–300 lines):

```markdown
# Using opensips-skills

This guide shows you how to get the most out of the OpenSIPs Claude Code
plugin. The plugin includes three skills; this document covers when each
activates and how to phrase prompts for the best results.

## Quick verification

(One paragraph confirming the plugin is installed: /skills lists all three.)

## Specifying your OpenSIPs version

(How version resolution works: explicit in prompt, .opensips-version file,
$OPENSIPS_VERSION env var, default. Examples of each.)

## Phrasing prompts for the routing skill

(Examples that work well: "I'm on OpenSIPs 3.6, write me a route_block that
handles incoming INVITE...". Examples that don't work as well, with brief
explanation of why and how to improve them.)

## Phrasing prompts for the modules skill

(Examples: "show me the parameters for the dialog module" — works well.
"what does this module do?" without naming it — works less well.)

## Phrasing prompts for the security advisor

(Examples for security review prompts. Note that the security advisor's
content is under active development by a separate agent.)

## Working across multiple skills in one prompt

(Examples of multi-skill prompts. Shown as illustrations, not as a tutorial
on how to use Claude Code in general.)

## What the plugin won't do

(Won't write Kamailio configs. Won't review live servers — only static
configs. Won't fix bugs in OpenSIPs source code.)

## When you find a bug or want to suggest a feature

(Pointer to issue tracker.)
```

The guide is voice-typed friendly: direct prose, conversational where appropriate, concrete examples throughout. The audience is a working engineer, not a researcher — they want to be productive in 10 minutes, not understand the architecture in 2 hours.

Acceptance: `docs/usage-guide.md` is committed. A new user can read it and have a clear sense of what to try first.

### Task 10.6: Update CHANGELOG.md for the v1.0.0 release

Move all the `[Unreleased]` entries that have accumulated through milestones 0–9 into a new `[1.0.0] - YYYY-MM-DD` section. Reset `[Unreleased]` to empty.

The 1.0.0 entry summarizes what shipped:

```markdown
## [1.0.0] - 2026-XX-XX

### Added
- Initial public release.
- Three coordinated Claude Code skills: opensips-routing, opensips-modules, opensips-security-advisor (scaffold).
- Version-grounded reference data for OpenSIPs 3.5 and 3.6.
- Build pipeline transforming JSON source from opensips-docs-collector into Markdown reference files and a consolidated index.
- Cross-project guardrails preventing identifier confusion with sibling SER-lineage projects.
- Comprehensive automated test suite with golden-file tests, end-to-end build tests, and determinism verification.
- CI pipeline with five gates: validate, build, test, determinism, lint.
- Full documentation set: vision, requirements, architecture (data pipeline, rendering templates, skill authoring guide), nine ADRs, ten-milestone implementation plan, three deep research reports.

### Notes
- Security advisor skill ships as a scaffold; substantive review patterns are authored by a separate agent.
- Project requires Claude Code; not currently supported in Claude.ai web or the Claude API directly.
```

Acceptance: CHANGELOG.md follows Keep-a-Changelog format. The 1.0.0 section is comprehensive but readable.

### Task 10.7: Run the pre-release checklist

Execute the pre-release checklist from Task 10.4's release process document:

1. `npm run validate` passes.
2. `npm run build` passes; `git diff --exit-code` produces no output (committed output matches generated output).
3. `npm test` passes including the determinism test.
4. CI is green on main.
5. Manually run the golden-path demos document end-to-end. Document outcomes. Confirm at least 80% pass cleanly. Fix any regressions before release.
6. CHANGELOG.md has the 1.0.0 entry and version numbers in package.json and the manifests are 1.0.0.

This is the moment of truth. If anything fails, fix it before proceeding. Don't release a half-broken project.

Acceptance: All checklist items pass. The repository is ready to tag.

### Task 10.8: Tag and announce the release

```bash
git tag v1.0.0
git push --tags
```

Create a GitHub release from the tag. The release notes auto-populate from CHANGELOG.md (or are manually pasted from the 1.0.0 section).

Submit the plugin to the Claude Code plugin marketplace per Anthropic's documented submission process. This is an external workflow not controlled by this project; follow whatever process is current at release time.

If appropriate (the maintainer's call), announce the release in:
- The OpenSIPs community forum or mailing list.
- Personal social media or technical blog.
- Anthropic's developer community channels.

The announcement is optional but valuable — the project's reach depends on people knowing it exists.

Acceptance: v1.0.0 is tagged on the repository. A GitHub release is published. The plugin is submitted for marketplace inclusion.

### Task 10.9: Set up post-release maintenance expectations

Create `docs/process/maintenance.md` (lightweight; can be combined with the release process document if preferred).

The document covers:

- How issues are triaged (labels, response times, escalation).
- How "my config doesn't work" reports are handled (often a gap in the upstream extraction, not a plugin bug — the document explains how to identify which).
- The cadence for refreshing reference content from the upstream extraction project (when new OpenSIPs versions arrive, when the extraction project ships material schema changes).
- How the security advisor's content updates flow in (the separate agent's PRs, review expectations).
- The deprecation policy for OpenSIPs versions that exit upstream support.

This is forward-looking — none of it has happened yet — but documenting it now prevents post-release scrambling.

Acceptance: The maintenance document is committed. Future maintainers have a starting point.

### Task 10.10: Final review and close

Read every public-facing document in the repository as if you were a new visitor. Open them in a fresh browser tab, read in the order someone would naturally encounter them: README → docs/vision.md → docs/requirements.md → docs/architecture/ (a sample of files) → docs/usage-guide.md → CONTRIBUTING.md.

Note any:

- Broken cross-references (links that 404).
- Stale content (references to placeholder values, outdated milestone numbers, obsolete decisions).
- Confusing prose that needs an editorial pass.
- Inconsistencies in voice or terminology.

Fix what you find. The first impression a new contributor gets is shaped by these documents; it's worth a final polish pass.

After the review, write a closing note in CHANGELOG.md's `[Unreleased]` section (which is now empty as a fresh start for v1.0.1):

```markdown
## [Unreleased]

(Nothing yet. v1.0.0 is the foundation; future entries will record changes from here.)
```

Acceptance: A final review is documented. Any issues found are fixed. The project is published and ready for users and contributors.

## Acceptance criteria

The milestone is done when all of the following are true:

- The public README is authored and renders correctly on GitHub, with a clear "what this is" section, install instructions, and a quick example.
- CONTRIBUTING.md is authored with concrete onboarding for new contributors.
- The plugin manifests (marketplace.json and plugin.json) are at v1.0.0 with complete metadata.
- The release process document is authored and operationally complete.
- The user-facing usage guide is authored and accessible to non-technical readers.
- CHANGELOG.md has a comprehensive v1.0.0 entry.
- The pre-release checklist has been executed and all items pass.
- v1.0.0 is tagged and pushed; a GitHub release is published.
- The plugin is submitted to the Claude Code marketplace.
- The post-release maintenance document is in place.
- A final review has been conducted; broken cross-references and stale content are fixed.

When all of these are true, milestone 10 is complete. The project is publicly released and ready for ongoing use, contribution, and iteration.

## Risks and watch-outs

**Releasing too early.** "It's mostly working" is not a release-ready state. The pre-release checklist exists to catch the failure mode where excitement to ship outpaces actual readiness. Run every checklist item. If the golden-path demos have a 60% pass rate and not 80%+, the right move is to delay release and fix, not to ship and document the failures as known issues. v1.0.0 sets the baseline of expected quality; releasing low quality at v1.0.0 means every subsequent release is judged against that low bar.

**Releasing too late.** The opposite failure: perfectionism prevents release. There will always be one more thing to polish. The pre-release checklist is also a stop signal — if everything on it passes, ship. Indefinitely deferring release means never getting feedback from real users, which is worse than shipping a slightly imperfect v1 and iterating.

**Marketplace metadata drift.** The marketplace.json description is what users see when scanning the plugin marketplace. If it's vague, the plugin doesn't get installed. If it's misleading, users install it and bounce when reality doesn't match the pitch. Treat the description as marketing copy that has to be both accurate and compelling — read it as a stranger encountering it for the first time.

**License attribution mismatches.** GPL-3.0 propagates: any code or content derived from this project must also be GPL-3.0 or compatible. If the upstream extraction project is GPL-3.0, that's fine. If parts of the rendered content come from sources with different licenses, those need acknowledgment in the LICENSE or NOTICE file. Audit before release.

**The "publish and pray" anti-pattern.** Publishing a v1.0.0 and walking away is unsustainable. Even if the project is feature-complete, it needs ongoing maintenance: schema-mirroring updates as the extraction project changes, version refreshes as OpenSIPs ships new releases, bug fixes as users report issues. The maintenance document (Task 10.9) sets expectations, but the maintainer has to actually follow them.

**Insufficient changelog detail.** "Initial release" as the only changelog entry is unhelpful. The 1.0.0 entry should be detailed enough that a future maintainer reviewing project history can understand what shipped without reading the entire repository. The Task 10.6 template is a starting point; expand it as needed.

**Demo regressions discovered post-release.** The golden-path demos pass at release time but might regress after a future schema update or SKILL.md tweak. The maintenance document includes "verify golden-path demos before each release" as a hard requirement to catch this.

**The README's quick example aging poorly.** A concrete example in the README is great for clarity but couples to specifics of the OpenSIPs version it demonstrates. If 3.6 ships and the example uses 3.5 syntax, the README becomes confusing. Either pin the example to a stable subset of OpenSIPs syntax (so it stays correct across versions), or commit to updating the README on every minor version bump.

**Forgetting the LICENSE file's fine print.** GPL-3.0 has specific requirements for distribution (the full license text must be included, contributor copyright notices preserved, etc.). The LICENSE file from milestone 0 satisfies this for the source code; verify nothing in the released artifacts (e.g., the consolidated.json, the rendered Markdown) violates upstream attribution requirements from opensips-docs-collector.

**Not announcing the release.** Even a great release nobody knows about doesn't help anyone. The announcement step in Task 10.8 is optional but undervalued. A short post in the OpenSIPs forum, a tweet, a mention in a Claude Code community channel — all increase the project's reach with minimal effort.

## Parallelization notes

Tasks 10.1 (README), 10.2 (CONTRIBUTING), 10.4 (release process), 10.5 (usage guide), and 10.9 (maintenance) are independent documentation tasks and can be done in any order or in parallel. Tasks 10.3 (manifest polish) and 10.6 (changelog) are small mechanical updates. Task 10.7 (pre-release checklist) blocks Task 10.8 (release). Task 10.10 (final review) is the closing action.

For two-person work, one person handles README + CONTRIBUTING + usage guide (the user-facing docs) while the other handles release process + maintenance + changelog (the operational docs). They meet at 10.7.

For solo work, the documentation tasks (10.1, 10.2, 10.4, 10.5, 10.9) flow naturally one after another. Save the small tasks (10.3, 10.6) for breaks between writing sessions. Treat 10.7–10.10 as a sequential ceremonial flow that should be completed in one sitting once everything else is done.

## Cross-references

- Project vision: `docs/vision.md`.
- Architecture overview: `docs/architecture/data-pipeline.md`, `docs/architecture/rendering-templates.md`, `docs/architecture/skill-authoring-guide.md`.
- ADRs (referenced from contribution guidelines): `docs/architecture/adr/`.
- Skill authoring conventions: `docs/architecture/skill-authoring-guide.md`.
- Test strategy and CI: `docs/testing/test-strategy.md` (from milestone 9).
- Project operating rules: `/CLAUDE.md`.
- License: `/LICENSE` (GPL-3.0).
- Upstream extraction project: opensips-docs-collector (separate repository).

---

*This is the final milestone. After completion, the project is publicly released and the implementation plan ends. Future work — new versions, additional skills, expanded coverage — falls under the maintenance document and is no longer part of the v1 plan.*
