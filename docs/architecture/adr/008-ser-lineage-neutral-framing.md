<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-008: Neutral framing on SER-lineage topics

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** Diplomatic posture toward related SIP server projects

---

## Context

OpenSIPs is one of several projects descending from the original SIP Express Router (SER). The lineage includes other active open-source projects that share superficially similar configuration syntax and some module names. Over two decades, the projects have diverged enough that their configs are not interchangeable — but enough surface similarity remains that LLMs blend idioms from one into the other, which is the core problem this plugin addresses.

A naive approach to preventing cross-project contamination would be to build an exhaustive "do not do X, because that's from project Y" reference: tables of function-signature differences, parameter-name drift, algorithm-enumeration mismatches, management-tool incompatibilities. From a technical standpoint, this would work well. Claude would have precise anti-patterns to recognize and refuse.

Two concerns make the naive approach wrong for this project:

1. **Community relations.** The OpenSIPs and sibling-project communities maintain cordial relationships. They collaborate where they can, serve overlapping user bases, and each has engineers with long histories in both. A plugin that reads like it was built in opposition to a named sibling project damages those relationships, regardless of how technically accurate its comparisons are. This project is intended to be adopted by the OpenSIPs community; anything that creates friction between OpenSIPs and its siblings is counterproductive to that adoption.

2. **The guardrail doesn't need the comparison to work.** Claude's real anti-hallucination defense is not "here are identifiers from project X that you must not use" — it's "here are the identifiers that exist in this version of OpenSIPs, and no others are valid." A positive reference set is more restrictive and more maintainable than a negative exclusion list. The version-specific reference files do the real work; the lineage notes play a minor supporting role.

The question is how much to write about the SER lineage at all.

## Decision

**Acknowledge the SER lineage exactly once, in `ser-lineage-notes.md`, using neutral and minimal language. Do not name sibling projects beyond that single acknowledgment. Do not produce comparative tables, function-signature diffs, or enumeration-mismatch guides.**

The operational expression of this decision:

- `ser-lineage-notes.md` contains a brief paragraph noting that OpenSIPs is one of several projects descending from the SIP Express Router, and stating the operational rule: when authoring OpenSIPs configs, Claude uses only identifiers present in the active version's reference set. Identifiers that look familiar but are not in that set are either mistakes or imports from other projects, and must be flagged rather than accepted.
- No mention of specific sibling projects by name anywhere in the plugin's deliverables — SKILL.md files, reference files, documentation, error messages, commit messages. The single mention of "SIP Express Router" as the common ancestor is sufficient context.
- No tables of "this function exists in project X with signature Y and in OpenSIPs with signature Z." When a user pastes content that uses identifiers not in the active reference set, Claude flags them and asks the user for clarification — it does not attribute them to any named source.
- No suggestion, in any documentation, that sibling projects are inferior, outdated, or wrong. They are different tools serving related but distinct purposes. This project takes no position on their merits.

Rule 7 in `CLAUDE.md` ("Neutral framing on SER-lineage topics") is the operational version of this ADR. The ADR is the reasoning behind the rule.

## Alternatives considered

- **Exhaustive comparison documentation.** Enumerate every known divergence between OpenSIPs and each sibling project, version by version.
  - Tempting because it's the most technically thorough approach. A contributor who wanted to port a config from another project would find every conversion note they needed.
  - Rejected because it reads as adversarial regardless of the authors' intent. A file titled "differences between us and them" positions the project in opposition to the siblings, which damages the community relationships we want to preserve. It's also a maintenance tax — sibling projects evolve, and keeping comparison tables current requires ongoing research into projects this one doesn't own.

- **Single comparison section, one sibling project named.** Mention the primary sibling by name and catalog its key divergences.
  - Tempting as a compromise between exhaustive and neutral.
  - Rejected because "one sibling named" is not neutral — it just picks a specific project to focus on, which is either arbitrary or implies a competitive framing. Naming any sibling shifts the posture from "OpenSIPs-focused tool" to "OpenSIPs-vs-something tool."

- **No lineage acknowledgment at all.** Simply omit any reference to the shared history.
  - Tempting because it's maximally neutral.
  - Rejected because it leaves a gap Claude will fill with training-data assumptions. A user pasting a config that mixes idioms needs Claude to understand that this is a real phenomenon (not the user making things up) so it can respond with appropriate care. The brief acknowledgment gives Claude the context to handle contaminated inputs gracefully without naming names.

## Consequences

**Positive:**

- The project is adoptable by the OpenSIPs community without creating friction with sibling-project communities. Users from either community can contribute without feeling their project is being criticized.
- `ser-lineage-notes.md` is short, maintainable, and evergreen. It doesn't require tracking sibling-project releases, doesn't go stale as siblings evolve, and doesn't need updates every time a sibling renames a function.
- The anti-hallucination defense rests on the positive reference set (the version-specific extraction), not on an exclusion list. This is architecturally cleaner and scales naturally to new OpenSIPs versions.
- Contributors writing new SKILL.md content, new documentation, or new guardrails have a simple rule: stay within OpenSIPs. No judgment calls about "how much should I say about project X."

**Negative:**

- Users migrating from a sibling project to OpenSIPs get no direct help from this plugin. They have to rely on sibling-project documentation (which exists) and general migration guides (which also exist). This is a legitimate use case the plugin does not serve; someone could build a separate migration-assistance skill if the need is real, but it's not this project's job.
- When Claude encounters an identifier from a sibling project in a user's pasted config, it flags the identifier but cannot name its origin. The user gets "this identifier is not in OpenSIPs 3.6" rather than "this identifier is from project X." For most users this is fine; occasionally it leaves the user slightly more confused than a named attribution would.
- The neutral framing requires active discipline. Contributors familiar with sibling projects may instinctively add "similar to how project X does it" comparisons in documentation. Reviewers have to catch these.

**Neutral:**

- The single lineage acknowledgment uses the phrase "SIP Express Router" as the common ancestor. This is historically accurate and widely understood in the SIP community. No ambiguity, no editorialization.
- Sibling projects may build their own AI tooling with their own philosophies. This project takes no position on what those projects should do. If a sibling project's AI tooling cross-references OpenSIPs, that is their choice to make; it does not obligate this project to respond in kind.

## Implementation notes

- Code comments, commit messages, issue templates, and PR descriptions also follow this rule. A commit message that says "fix dispatcher algorithm enumeration (differs from project X)" violates the ADR even though it's in a code comment. The correct form is "fix dispatcher algorithm enumeration for OpenSIPs 3.6" — version-scoped and project-scoped.
- When a user explicitly asks about a sibling project — "how does this compare to project X" — Claude should acknowledge the question, note that this plugin covers OpenSIPs only, and suggest the user consult the sibling project's own resources. Claude should not produce the comparison itself.
- Error messages from the build script, validation output, and any other programmatic text output follow the same rule. "Parameter not found in OpenSIPs 3.6 reference set" is correct; "This looks like a project X parameter" is not.

## Related decisions

- **Informs:** Rule 7 in `CLAUDE.md` ("Neutral framing on SER-lineage topics") — the operational rule derived from this ADR.
- **Related to:** Requirements document §1.1 (problem statement) — the problem statement uses the same neutral framing that this ADR formalizes.
- **Related to:** Any future decision about migration-assistance skills, sibling-project integration, or community-collaboration features — all would be new products rather than extensions of this one, and each would need its own ADR.
