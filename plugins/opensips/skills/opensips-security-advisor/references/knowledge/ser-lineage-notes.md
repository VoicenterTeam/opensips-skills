# SER-Lineage Notes

<!-- doc-type: ser_lineage_notes
     audience: security-review
     authoring: hand-authored -->

OpenSIPs is one of several projects descending from the SIP Express Router. The projects share architectural ancestry but configuration syntax, function signatures, and module exports have diverged. Identifiers from sibling SER-lineage projects look plausible inside an OpenSIPs config but produce silent failures or wrong behavior at runtime.

This file is the security-advisor companion to the authoring-side notes in `opensips-config/references/{version}/ser-lineage-notes.md`. The authoring skill teaches a contributor how to write OpenSIPs correctly. This file teaches the security advisor how to handle a config under review that contains identifiers it cannot resolve to anything in the active OpenSIPs version's reference set.

Per [ADR-008](../../../../../docs/architecture/adr/008-ser-lineage-neutral-framing.md), this is the only file in the security-advisor skill where the SIP Express Router lineage is named explicitly. Every finding, every report, every remediation surface uses the generic phrasing "sibling SER-lineage project" without identifying which sibling.

## Why this matters for security review

A security review reads a config the user did not write inside this skill. The config may have been authored anywhere, by anyone, against any OpenSIPs version, and possibly with snippets pasted from sources that target a different SIP server entirely. The advisor's job is not to translate or repair such a config — it is to evaluate whether it is safe to run.

When a config under review uses an identifier (function name, module name, parameter name, pseudo-variable, MI command, statistic, event) that is not present in `opensips-config/references/{version}/consolidated.json` for the active version, the advisor cannot apply OpenSIPs rules to that construct. There is no reference entry to compare against, no documented signature to type-check, no parameter list to validate.

Three possibilities exist, in rough order of likelihood:

1. **Typo or version drift.** The identifier was correct for some OpenSIPs version but not the active one, or it was misspelled. This is the common case. Ask the user to confirm the intended identifier and the OpenSIPs version the config targets.
2. **SER-lineage import.** The user pasted snippets — a tutorial, a blog post, a config from a colleague — that target a sibling SER-lineage project, and the snippets parse cleanly enough in OpenSIPs that the divergence wasn't caught. The identifier is real in some other tool but not in OpenSIPs.
3. **Genuinely-undocumented OpenSIPs identifier.** Possible but unusual. Confirm by reading the user's `loadmodule` list against the active version's `modules-index.md` — if the module is loaded but the identifier is not in our reference, the upstream extraction may have missed it. This is a bug to file against `opensips-docs-collector`, not a license to invent rules around the identifier.

In all three cases, the advisor cannot safely produce a security finding *about* the unrecognized construct. It can only flag that the construct is unrecognized.

## Reporting unrecognized identifiers

Emit a `review_required` finding (severity per `references/taxonomy.md`) with the following structure:

- **Location:** file path, line number, the smallest containing block (route, function call, modparam line).
- **The unrecognized identifier:** the exact token, quoted.
- **The question to ask the user:** version confirmation, source attribution, or a request to share the loaded module list — whichever will resolve the ambiguity fastest.
- **No attribution.** Do NOT name specific sibling projects. Phrase the finding as one of:
  - "this identifier is not documented for the active OpenSIPs version"
  - "this construct may be from a sibling SER-lineage project"
  - "this parameter is not present in the active version's reference set"

Never write "this looks like Project-X syntax" or any phrasing that names a specific SER-lineage sibling. ADR-008 is firm on this and applies to every authoring surface in the skill, including findings text, summary paragraphs, and remediation prose.

## Anti-hallucination rules

When the advisor authors a remediation:

- **Never suggest functions, modules, or pseudo-variables not documented in `opensips-config/references/{version}/`.** If a remediation requires a construct not in the active version's reference set, abstain. Recommend the user consult OpenSIPs documentation directly. A wrong remediation that compiles is worse than no remediation.
- **Never invent OpenSIPs identifiers to match a pattern from a sibling project.** If the input config uses a sibling-shaped identifier, the remediation does not "translate" it — that's the authoring skill's job, not the advisor's. The advisor flags and asks; it does not silently rewrite.
- **Never extrapolate from a familiar identifier to an unfamiliar one.** Just because `ds_select_dst` exists does not mean `ds_select_route` exists. Check the reference set per identifier; do not generalize.
- **When in doubt, ask.** A `review_required` finding with a clear clarifying question is the correct output when the advisor cannot resolve an identifier. Stalling for confirmation is cheap; emitting a confidently wrong remediation is expensive.

These rules apply to both findings and remediations. A finding that cites an identifier the advisor cannot resolve must say so plainly. A remediation that depends on an identifier the advisor cannot resolve must not be written.

## Cross-reference

- [ADR-008: Neutral framing on SER-lineage topics](../../../../../docs/architecture/adr/008-ser-lineage-neutral-framing.md) — the project-wide rationale for this rule. Read it before changing any text in this file or any finding template that mentions the SER lineage.
- `opensips-config/references/{version}/ser-lineage-notes.md` — the authoring-side companion. Same rule, different audience: that file teaches a contributor how to write OpenSIPs correctly; this file teaches the advisor how to review a config that may not have been authored under that discipline.
- Rule 7 in the project `CLAUDE.md` ("Neutral framing on SER-lineage topics") — the operational version of ADR-008. Every contribution to the security-advisor skill is bound by it.
