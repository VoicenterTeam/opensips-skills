<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-005: Three-skill architecture

**Status:** Superseded by ADR-012
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** Skill decomposition for the initial plugin release

---

## Context

The plugin needs to teach Claude how to work with OpenSIPs across multiple capability areas: authoring route scripts, looking up module details, and reviewing configs for security issues. These are related tasks — they share domain knowledge, they operate on the same `opensips.cfg` artifacts, and a single user session might touch all three. But they are not the same task.

Three facts shape the decomposition question:

1. **Procedural knowledge and reference data have different shapes.** "How to write an OpenSIPs route script" is procedural — decision rules, workflow patterns, guardrails. "What does the `tm` module export" is reference data — parameters, function signatures, types. Mixing them in one skill means the procedural guidance fights the reference data for space in `SKILL.md`, and both suffer.

2. **Security review is a distinct author with a distinct scope.** A separate agent is producing `opensips-security-advisor`. It needs to live in the same plugin for distribution reasons but cannot share an editing cadence, a file structure, or a content strategy with the other skills. The architecture has to accommodate this cleanly — not as a bolt-on.

3. **Claude Code's skill-triggering behavior is probabilistic.** Each skill's description competes for the model's attention when a user prompt arrives. Skills with overlapping descriptions confuse the matcher; skills with narrow, well-differentiated descriptions trigger reliably. The decomposition choice directly affects how often the right skill activates for a given prompt.

The question is how many skills exist, what each covers, and how they interact.

## Decision

**Three skills, with clearly differentiated roles and an explicit integration contract between them.**

1. **`opensips-routing`** — the authoring skill. Contains procedural knowledge for writing `opensips.cfg` route scripts. Its `SKILL.md` is hand-authored and carries the anti-hallucination guardrails. Its references are the core documentation types (variables, functions, operators, statements, route types, transformations, flags, statistics, MI commands, events, async statements, parameters) plus the hand-authored `ser-lineage-notes.md`.

2. **`opensips-modules`** — the reference library skill. Contains a router-index catalog mapping module names to per-module reference files (per ADR-001). Its `SKILL.md` is hand-authored but short; the weight lives in the generated per-module reference files.

3. **`opensips-security-advisor`** — the security review skill. Authored by a separate agent. At initial release, ships as a scaffold (frontmatter + placeholder body) with a defined integration contract for reading reference files produced by the other two skills.

### The integration contract between skills

Skills interact through a simple rule: **each skill reads files, none writes to another skill's directory.**

- `opensips-security-advisor` may read `../opensips-modules/references/{version}/modules/*.md`, `../opensips-modules/references/{version}/consolidated.json`, and `../opensips-routing/references/{version}/core/*.md`. This is explicit, read-only, and documented in its `SKILL.md` scaffold.
- `opensips-routing` does not read from `opensips-modules` at runtime. When a user mentions a module, the `opensips-modules` skill triggers independently and Claude reads the relevant reference file through that skill's path.
- `opensips-modules` does not read from `opensips-routing`. Module references stand alone.
- No skill generates files in another skill's directory. The build script writes to specific paths; each skill owns its own subtree.

### Trigger differentiation

Each skill's frontmatter description targets a distinct surface of user language:

- **`opensips-routing`** triggers on route-authoring language: "write a route script," "request_route," "opensips.cfg," "pseudo-variable," "transformation," "routing logic."
- **`opensips-modules`** triggers on module-specific language: module names by literal mention ("dispatcher module," "tm module"), questions about exported functions or parameters of a named module, "what module handles X."
- **`opensips-security-advisor`** triggers on security language: "audit," "review for security," "harden," "vulnerabilities," "is this config safe."

Overlap is inevitable — a user asking "how do I configure the dispatcher module for authentication" touches all three surfaces. Claude's own resolution is allowed to select multiple skills for a single prompt, and the architecture assumes this happens often.

## Alternatives considered

- **One monolithic skill covering everything.** Merge all content into a single `opensips` skill with every reference file under one tree.
  - Tempting because it eliminates coordination concerns and makes the plugin feel like one cohesive thing.
  - Rejected because it violates the "SKILL.md fights itself" problem. Procedural guidance for writing routes would share a 500-line budget with a catalog of 100 modules and security review instructions. Each would be cramped; the triggering logic would have one oversized description trying to match everything. Separation by role is the architectural benefit of having multiple skills in the first place.

- **Two skills, merging routing and modules.** `opensips` (routing + modules combined) and `opensips-security-advisor`.
  - Tempting because modules are technically in service of routing — you look up modules to write routes.
  - Rejected because the SKILL.md sizes don't combine well. The routing skill's body is dense procedural knowledge; the modules skill's body is a flat catalog. Combining them means either one grows the other unnecessarily, or the catalog moves out of the merged SKILL.md into a reference file, at which point the merged skill is structurally identical to "two skills" anyway.

- **Four or more skills, splitting routing further.** Separate skills for registration, dispatching, media, authentication, etc., each covering their slice of routing.
  - Tempting because it mirrors how OpenSIPs is often discussed — by functional area.
  - Rejected because it puts us back near the tool-selection accuracy cliff (see ADR-001). The right granularity for a capability-based split would be 5–8 skills, but at that count, Claude's ability to pick the right one on the first try degrades. More importantly, the shared procedural knowledge (how to write routes, how to avoid hallucinated identifiers) would duplicate across each sub-skill or require a "parent" skill, neither of which is cleaner than having one routing skill that delegates to `opensips-modules` for specific module details.

- **Embed security review inside `opensips-routing`.** Treat security as one dimension of good config authoring, covered inline during writing and reviewing.
  - Tempting because it produces secure configs by default instead of as a separate step.
  - Rejected for two reasons. First, the security review is being authored by a separate agent with different expertise and a different update cadence; embedding it would force coupling that doesn't exist in practice. Second, security review is useful as a standalone operation — a user who already has a config wants to audit it without going through the authoring workflow. A separate skill gives that operation a first-class trigger surface.

## Consequences

**Positive:**

- Each skill has a tight, defensible scope. `opensips-routing` is about authoring; `opensips-modules` is about reference lookup; `opensips-security-advisor` is about review. Prompts map to skills with high precision.
- SKILL.md files stay short and focused. The routing skill can spend its 400-line budget on guardrails and workflows; the modules skill can spend its 250-line budget on the catalog; neither has to compromise.
- The security advisor's separate authorship is structurally supported. The scaffold-and-populate pattern means the separate agent can work independently without touching the other skills or the plugin manifest.
- The read-only integration contract is enforceable. A simple check — "does this skill's code or build output write to another skill's directory?" — catches violations early.
- Adding a fourth skill later (operations, module development, a test-loop skill) is a clean extension. The pattern of "hand-authored SKILL.md, generated references where applicable, read-only access to sibling skills' references" scales without renegotiating the architecture.

**Negative:**

- Claude sometimes has to invoke multiple skills for a single prompt. A user asking "write me a secure config using the dispatcher module" touches all three skills. This is not a bug — Claude Code handles multi-skill activation — but it means the user's first response may take longer than a single-skill invocation would.
- The integration contract requires discipline. A contributor could be tempted to have the security advisor generate Markdown summaries into `opensips-modules/references/`, or have the routing skill cache frequently-used module data locally. Both would violate Rule 8 in `CLAUDE.md`. The rule is enforceable but requires active review.
- Skill-level overlap in descriptions is a real failure mode. If `opensips-routing`'s description says "configure OpenSIPs" and `opensips-modules`'s description says "configure OpenSIPs modules," the matcher has trouble. The descriptions need ongoing attention as the skills evolve.

**Neutral:**

- The three-skill count is not sacred. Future phases will likely add skills (operations, module-dev). What matters is that each skill has a distinct role and a clear contract with its siblings — not that the count stays at three forever.
- The security advisor's external authorship means this project's maintainer cannot fully control the quality of one of the three skills. This is accepted as part of the collaboration. The contract is: the advisor owns its content, this project owns the scaffold, reference files, and plugin manifest.

## Implementation notes

- Each skill's `SKILL.md` must declare `allowed-tools` narrowly. The routing skill permits `Read`, `Write`, `Edit`, and the module search script. The modules skill permits `Read` only. The security advisor permits `Read` only at scaffold time; the populating agent may expand this within reason but should justify any expansion in its body.
- The read-only integration contract should be documented in each skill's SKILL.md body, not buried in this ADR. Someone debugging cross-skill behavior should find the contract where they're already looking.
- End-to-end validation of the multi-skill architecture requires a test flow that exercises all three skills in the same session. A validation that only triggers one skill at a time does not prove the decomposition works.

## Related decisions

- **Depends on:** ADR-001 (router-index pattern) — the `opensips-modules` skill is one skill precisely because the router-index pattern avoids the per-module-skill anti-pattern.
- **Depends on:** ADR-003 (version-isolated folders) — all three skills share the version resolution protocol, which is possible because every skill's reference structure is version-scoped identically.
- **Informs:** ADR-006 (consolidated.json as search index) — the consolidated index is the shared data interface between `opensips-modules` and `opensips-security-advisor`.
- **Informs:** ADR-007 (Claude Code-only target) — the multi-skill architecture assumes a runtime that supports multi-skill activation, which narrows the deployment target.
