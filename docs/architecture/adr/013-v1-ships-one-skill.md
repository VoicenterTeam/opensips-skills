<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-013: v1 ships one Agent Skill; security advisor deferred to a follow-up release

**Status:** Accepted (superseded in part by [ADR-014](014-security-advisor-v1-single-skill.md) — security advisor activated in v1.1.0)
**Date:** 2026-04-28
**Deciders:** Shlomi Gutman (Voicenter)
**Technical story:** Pre-community-release cleanup for v1.0.1.

---

## Context

ADR-005 split OpenSIPs work into three skills. ADR-012 collapsed two of them (`opensips-routing` + `opensips-modules`) into the single `opensips-config` skill, leaving two skills shipped: `opensips-config` (authoring + reference) and `opensips-security-advisor` (security review).

`opensips-security-advisor` shipped in v1.0.0 as a scaffold. Its frontmatter and integration contract are in place, but the substantive review patterns — risk catalog, audit workflow, severity-tagging, remediation guidance — are owned by a separate authoring agent and have not landed. Triggering the scaffold today produces a thin response that points at `opensips-config` references but contributes no review judgment of its own.

Going public to the OpenSIPs community surfaces a mismatch: README and marketplace prose advertise "two coordinated skills" while one of those skills is a placeholder that adds no value at trigger time. Community users reading `/skills` and getting a near-empty advisor body experience the project as half-built rather than as an intentional staged rollout.

## Decision

**v1 ships one Agent Skill: `opensips-config`. The `opensips-security-advisor` scaffold is preserved on disk but disabled by renaming `SKILL.md` to `SKILL.md.scaffold`, taking it out of Claude Code's auto-discovery path.**

Concretely:

- `plugins/opensips/skills/opensips-security-advisor/SKILL.md` → `plugins/opensips/skills/opensips-security-advisor/SKILL.md.scaffold`. The directory persists. A short `README.md` next to the renamed file explains the disable mechanism and the one-step re-enable (rename back).
- All user-facing prose (README.md, CLAUDE.md, CONTRIBUTING.md, marketplace.json description, package.json description, plugin.json description) describes one skill, not two.
- The `opensips-config/SKILL.md` cross-references to `opensips-security-advisor` are removed (frontmatter "defer to" clause and body "When to defer" section).
- Internal historical documents (ADR-005, ADR-012, plan files, research reports, superpowers internal plans, skill-authoring-guide.md, usage-guide.md) are **not** rewritten. They record the project's actual evolution. This ADR is what a future contributor finds first when looking up the current shape.

## Alternatives considered

- **Delete the scaffold directory entirely.** Tempting because it removes any visual or conceptual remnant of the two-skill story from the repository. Rejected because the scaffold's frontmatter, integration contract, and ADR-012 lineage are still useful starting points for the follow-up authoring agent. Preserving the directory costs nothing and saves rebuild work later.

- **Ship both skills, prominently flag the advisor as a scaffold.** Tempting because it's the smallest doc change. Rejected because community users do not read frontmatter caveats — they install, type a prompt, and judge the plugin by the response. A skill that triggers but contributes no review judgment damages the project's reputation more than a missing skill does.

- **Keep both skills active, write the advisor body in a rush before release.** Rejected because review-pattern authoring is a separate agent's work per ADR-012; scoping it into a release-prep window produces shallow content that becomes hard to revise later.

## Consequences

**Positive:**
- A community user installing v1.0.1 sees one skill in `/skills`, gets coherent activation behavior on every prompt that mentions OpenSIPs, and never encounters a thin scaffold response.
- The `opensips-security-advisor` work-in-progress retains its on-disk home and its design lineage (ADR-012). The follow-up release that authors review patterns reactivates the file with a single rename.
- Marketplace and README prose can be unambiguous: one skill, one purpose, four supported versions.

**Negative:**
- Users who specifically want SIP-security review have to phrase their prompt conversationally inside `opensips-config` (which can quote from per-module references) rather than triggering a dedicated review skill. The integration contract that the advisor was going to provide — separation between authoring and review judgment — is delayed.
- Two ADRs (ADR-005 → ADR-012 → ADR-013) trace the project's skill-architecture evolution. Future readers have to follow the chain to understand the current shape.

**Neutral:**
- The scaffold's `SKILL.md.scaffold` file is committed but inert. CI checks that grep skill files (`skill-md-check`) need to scope their globs to `SKILL.md` exactly, not `SKILL.md*`, to avoid false hits on the scaffold.

## Implementation notes

- The rename is a `git mv`, not a delete + create, so file history is preserved.
- The `opensips-config/SKILL.md` description-frontmatter edit is the only one that changes Claude's per-prompt activation surface; the rest is prose. Verify with the manual `/skills` check before tagging the release.
- Re-enabling the advisor in a future release is `git mv SKILL.md.scaffold SKILL.md` plus the prose flip in the user-facing docs and a new ADR superseding this one.

## Related decisions

- **Supersedes:** ADR-012 (in part) — ADR-012 left two skills shipped; this ADR ships one and defers the second.
- **Depends on:** ADR-005 (original three-skill architecture), ADR-012 (consolidation into two skills).
- **Informs:** the post-v1 release that authors substantive review patterns and re-enables the advisor.
