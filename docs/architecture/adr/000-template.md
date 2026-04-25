# ADR-NNN: Short decision title

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Deciders:** Name(s)
**Technical story:** Optional link to issue, discussion, or external context

---

## Context

What is the situation that's forcing a decision? What constraints apply? What assumptions are we making about the future?

Keep this section factual. State the problem, not the solution. A reader six months from now should be able to understand *why a decision was necessary* from this section alone, without having been present for the discussion.

## Decision

What did we decide?

State it in one or two sentences at the top. Then expand with whatever detail the decision requires — a diagram, a list of rules, a code snippet, a folder structure. The goal is that someone implementing this decision tomorrow knows exactly what to build.

## Alternatives considered

What other options did we evaluate before picking this one? For each alternative:

- **Alternative name** — one-sentence summary.
  - Why it was tempting.
  - Why we rejected it.

List at least two alternatives. If there weren't any, the decision probably wasn't worth an ADR.

## Consequences

What becomes easier because of this decision? What becomes harder? What new constraints does this place on future work?

This section is the honest one. Every architectural decision has downsides. Write them down. A future contributor reading this ADR should understand not just what we chose, but what we gave up.

Include:
- **Positive consequences** — capabilities unlocked, problems solved.
- **Negative consequences** — trade-offs accepted, paths closed off.
- **Neutral consequences** — observable changes that aren't clearly good or bad.

## Implementation notes (optional)

If the decision has non-obvious implementation implications — a specific library to use, a migration path, a piece of code that needs to change — note them here. Keep it brief; deep implementation detail belongs in architecture docs or code comments, not ADRs.

## Related decisions

- **Supersedes:** ADR-XXX (if this decision replaces an earlier one)
- **Superseded by:** ADR-XXX (fill in when this decision is replaced)
- **Depends on:** ADR-XXX (if this decision only makes sense given an earlier one)
- **Informs:** ADR-XXX (if this decision shapes a later one)

---

## How to use this template

1. Copy this file to `adr/NNN-short-hyphenated-title.md`, using the next available number.
2. Fill in every section. If a section is genuinely not applicable, write "N/A" with one sentence explaining why — don't just delete it.
3. Set status to **Proposed** when the ADR is open for discussion, **Accepted** when the team commits to the decision, **Deprecated** when the decision still holds but should not be used in new work, or **Superseded** when a newer ADR replaces it.
4. Do not edit an accepted ADR to change the decision. Write a new ADR that supersedes it, and update the old ADR's status to point forward.
5. Keep ADRs terse. If yours is longer than two pages printed, it's probably mixing the decision with implementation detail.

## Why we use ADRs

Architectural decisions have rationale that's obvious at the time and invisible six months later. Without ADRs, the project accumulates decisions that no one remembers making, which creates two failure modes: (1) contributors reverse decisions without knowing the reasons, and (2) contributors preserve decisions they should reverse because they assume there must have been a good reason. ADRs make the reasoning legible so future contributors can challenge or defend decisions on their merits.

This format is based on Michael Nygard's original ADR template and the MADR (Markdown Any Decision Record) variant. We keep it lightweight on purpose.
