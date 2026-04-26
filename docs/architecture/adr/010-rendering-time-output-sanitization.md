<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-010: Rendering-time output sanitization for upstream extraction artifacts

**Status:** Accepted
**Date:** 2026-04-25
**Deciders:** Project owner (Shlomi)
**Technical story:** Inventory of generated reference files (post-M9) surfaced two recurring upstream extraction artifacts that survive into the shipped output: U+FFFD replacement characters in DocBook-derived section anchors and over-escaped `\_` sequences in identifiers. Both arrived from the upstream `opensips-docs-collector` pipeline; both are uniformly garbage at the consumer's end.

---

## Context

The shipped reference files contain three classes of upstream extraction artifacts:

1. **U+FFFD (replacement character).** 487 occurrences across the v1 corpus, clustered in DocBook-derived section anchors of the form `1.6.5. default_timeout`. The original DocBook output had a U+00A0 (non-breaking space) glueing the section number to the name; somewhere upstream a non-UTF-8 read corrupted the byte to U+FFFD.
2. **`\_` (over-escaped underscores).** Approximately 14,000 occurrences across the v1 corpus. DocBook → Markdown converters defensively escape every underscore in identifiers like `default_timeout`. CommonMark's intra-word underscore rule means the escape is unnecessary in prose; inside fenced code blocks the backslash becomes literal — so upstream `\_` actually renders *worse* than plain `_` in code contexts and identical to `_` in prose.
3. **U+200B (zero-width space).** 4 occurrences in two `emergency.md` sentences, copy-paste artifacts from the web-rendered upstream docs.

CLAUDE.md Rule 3 ("Source of truth is upstream") forbids correcting OpenSIPs *documentation* in this project. These artifacts are not documentation — they are extraction defects: bytes the upstream pipeline failed to clean before shipping. The rule's spirit is "we don't second-guess the OpenSIPs project's prose"; it does not extend to cleaning up tool-introduced noise.

The upstream fix belongs in `opensips-docs-collector`. Until that lands, every regenerated build re-introduces the artifacts into the shipped skills, which means readers (and the consuming agent) see them every time.

## Decision

Add a single sanitization pass at the renderer's composition boundary in [scripts/lib/sanitize.ts](../../../scripts/lib/sanitize.ts), wired into [renderModule](../../../scripts/render-module/index.ts), [renderCoreDocument](../../../scripts/render-core/index.ts), [renderGuide](../../../scripts/render-guide/index.ts), and the description fields fed into [build-consolidated/index.ts#firstSentence](../../../scripts/build-consolidated/index.ts) and [build-module-index/index.ts#extractPurpose](../../../scripts/build-module-index/index.ts).

The function strips three patterns:

| Pattern | Substitution | Rationale |
|---|---|---|
| `U+FFFD` | removed | Always upstream extraction damage; never legitimate in OpenSIPs content. |
| `U+200B` | removed | Invisible. Always copy-paste artifact at v1 corpus; never legitimate. |
| `\_` | `_` | Over-escape from DocBook conversion. CommonMark renders both identically in prose; in code blocks the backslash becomes literal — so removing it is strictly an improvement. |

The pass runs after the existing whitespace normalization in each composer (the `(?:\n[ \t]*){3,}` blank-line collapse) and before the final trailing-newline fix, mirroring the contract those existing passes already established. The function is pure, deterministic, and idempotent: `sanitize(sanitize(x)) === sanitize(x)`.

### Threshold for adding new sanitize rules

A new rule may be added to `sanitizeRenderedText` only when **all three** of the following hold:

1. The pattern is **uniformly** an upstream extraction artifact across the v1 corpus — no legitimate occurrence anywhere in the shipped data.
2. The substitution is **strictly an improvement** in every context the pattern can appear (prose, code blocks, link titles, JSON descriptions).
3. The fix has been **proposed upstream** in `opensips-docs-collector` so this layer remains a temporary bridge, not a permanent compensation.

Patterns that don't meet all three (e.g. `\*`, `\[`, `\.`, double backslashes in C-string examples) stay untouched — they have legitimate uses or are valid in some contexts.

## Alternatives considered

- **Fix it upstream only and ship the artifacts in the meantime.** Tempting because it preserves Rule 3 strictly. Rejected because the artifacts ship in v1.0.0 today, the upstream fix has no committed timeline, and every reader sees the noise in the meantime. The rendering-time strip is reversible (delete one file when upstream lands) and zero risk to correctness.

- **Sanitize at the extraction-output ingest boundary (in `lib/validate.ts`).** Tempting because it would clean the source JSON early and benefit any downstream consumer (not just the renderers). Rejected because mutating validated source data hides the underlying defect — `data/{version}/modules/dialog.json` would no longer match what `opensips-docs-collector` produced, breaking the upstream-resync workflow. Sanitizing only at the renderer boundary keeps `data/` faithful to upstream.

- **Hand-edit each generated file to fix the artifacts post-build.** Tempting because it would produce a clean v1.0.1 release immediately. Rejected because hand-edits are forbidden by Rule 1 ("Never hand-edit generated files") and the next regeneration would silently re-introduce them.

- **Maintain a per-module override file documenting which strings to substitute.** Tempting because it scales to module-specific corrections beyond the three universal patterns. Rejected as over-engineering for the actual problem: three universal patterns covering 100% of the observed damage. Nothing in the v1 corpus needed module-specific surgery.

## Consequences

**Positive:**
- The shipped reference files are clean of the three artifact classes — readers and the consuming agent never see them.
- The `consolidated.json` descriptions and the `SKILL.md` module-index `Purpose` column stay consistent with the rendered references (single sanitize point, same rules applied everywhere a description leaves the source JSON).
- The fix is reversible: when upstream `opensips-docs-collector` lands the corresponding fixes, the project deletes [scripts/lib/sanitize.ts](../../../scripts/lib/sanitize.ts) and the five call sites — the source JSON and golden snapshots take care of themselves.
- The threshold above keeps future scope creep visible: anyone adding a new rule has to argue against three explicit criteria.

**Negative:**
- Rule 3's "faithful transformation" promise gains a documented exception. A reader of CLAUDE.md needs to know the exception exists to understand why `data/{version}/dialog.json` contains `\_` but [plugins/opensips/skills/opensips-modules/references/{version}/modules/dialog.md](../../../plugins/opensips/skills/opensips-modules/references) doesn't. Mitigation: this ADR is the single point of explanation; CLAUDE.md Rule 3 carries a one-line pointer.
- A defect in `sanitizeRenderedText` would silently corrupt every output file. Mitigation: the function has 12 unit tests in [tests/unit/lib/sanitize.test.ts](../../../tests/unit/lib/sanitize.test.ts) covering each substitution, the idempotence contract, and the "leave other escapes alone" cases. Golden tests will surface any unintended substitution as a snapshot drift.
- Determinism is preserved (the function is pure and deterministic), but the "build-twice diff is empty" gate now also depends on the function staying deterministic — one more invariant to maintain.

**Neutral:**
- The committed source JSON under `data/` is unchanged; the artifacts remain visible there for upstream-resync verification. Only the *rendered* artifacts are clean.

## Implementation notes

- The sanitizer runs at the same composition boundary as the existing blank-line collapse — late enough that no callee can re-introduce the patterns, early enough that the trailing-newline fix runs on a clean string.
- The substitutions are applied as three independent string replacements rather than a single combined regex, both for readability and so the test cases can target each rule in isolation.
- The `firstSentence` and `extractPurpose` helpers sanitize *before* sentence-splitting so the cleaned text is what gets truncated; this keeps short descriptions consistent with the prose-rendered descriptions.

## Related decisions

- **Modifies (with documented exception):** Rule 3 in CLAUDE.md ("Source of truth is upstream"). The rule still holds for OpenSIPs content; this ADR carves a narrow exception for upstream extraction artifacts.
- **Depends on:** ADR-002 (JSON source committed alongside generated Markdown) — the source JSON stays untouched; only the rendered output is cleaned.
- **Informs:** Future ADR if the upstream fix lands and this layer is removed (tracked as a removal task).
