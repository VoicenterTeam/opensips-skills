# Milestone 7: Skill authoring

## Goal

Author the three hand-authored `SKILL.md` files (`opensips-routing`, `opensips-modules`, `opensips-security-advisor`), the per-version `ser-lineage-notes.md` files, and the plugin manifests. At the end of this milestone, the plugin is structurally complete — every file the runtime needs exists, the anti-hallucination guardrails are in place, and the skills are ready to be tested in a real Claude Code session.

This is the first milestone where the project's anti-hallucination prose actually gets written. Until now, the renderers and reference files have been about getting authoritative content into Claude's context. The SKILL.md files are about *triggering* that content correctly and *guarding against* the failure modes it's meant to prevent. The work is prose, not code, but the prose is the project's most consequential output.

## Why this is sequenced here

The hand-authored SKILL.md files reference the generated reference files. Authoring "see `references/{version}/modules/tm.md`" before `tm.md` actually exists means guessing at conventions that may or may not match the renderer's output. Milestones 3–6 produced the reference files; this milestone consumes them.

This is also the latest reasonable point to write the SKILL.md files. The skills can't be locally tested (milestone 8) without being authored, and the test suite (milestone 9) needs golden-path demos that exercise real skill behavior. So this milestone unblocks the runtime-validation work that follows.

The security advisor scaffold is included here even though its content is owned by a separate agent (per ADR-005). This project owns the placeholder structure; the separate agent owns the populated content. Getting the scaffold right means the integration contract works the moment the security agent ships its content.

## Tasks

### Task 7.1: Re-read the skill authoring guide

Before writing any prose, re-read `docs/architecture/skill-authoring-guide.md` end to end. The guide specifies:

- The four-part description structure (capability summary, trigger enumeration, "use whenever" clause, exclusion clause).
- The 250-character truncation reality and the front-loading rule.
- The cross-project guardrail template (§4.1).
- The Bad/Good paired-example pattern.
- The "ask the user, do not construct" rule.
- The body section order (Overview → Cross-project guardrail → When to use → Decision table → Common tasks/index/workflow → References → Working with sibling skills).
- The 250–400 line target for body length.
- The reference-file linking conventions (one hop, imperative phrasing, `{version}` placeholder, no Markdown links across files).

The skill authoring guide is the spec for this milestone. Every choice in the SKILL.md files traces back to a rule in the guide. If a tradeoff arises, the guide is authoritative.

Acceptance: The author has re-read the guide and can recite the four-part description structure and the seven-section body order from memory.

### Task 7.2: Author `opensips-routing/SKILL.md`

Create `plugins/opensips/skills/opensips-routing/SKILL.md` following the body skeleton in the skill authoring guide §5.4.

**Frontmatter:**

```yaml
---
name: opensips-routing
description: |-
  Authors and edits OpenSIPs SIP server configuration scripts (`opensips.cfg`, route blocks, modules, parameters). Use whenever the user mentions OpenSIPs, opensips.cfg, route{}/branch_route/failure_route, $var/$avp/$pv pseudo-variables, or asks to write/edit SIP routing logic for OpenSIPs. Do NOT use for Kamailio, OpenSER, or SIP Express Router (SER) configurations — those use different identifiers despite shared lineage.
allowed-tools: Read, Write, Edit, Glob, Grep
---
```

**Body sections (target: ~300–400 lines):**

1. `## Overview` — one paragraph naming the skill's role and pointing at the sibling skills.
2. `## Cross-project guardrail` — full text per skill authoring guide §4.1, with module-confusion examples specific to routing (the `pv_*` family, `tmx`/`dmq`/`kazoo` modules, `proto_*` vs `tcpops`/`websocket`).
3. `## When to use this skill` — bulleted list of trigger conditions and handoff conditions to siblings.
4. `## Routing decisions` — the routing decision table from the authoring guide §5.4 (Task → Approach mapping with reference-file pointers).
5. `## Common tasks` — substantive content. At minimum:
   - **Authoring a registrar** — basic registrar with `auth_db` and `registrar` modules. Pointers to references. Bad/Good example for a Kamailio-syntax confusion.
   - **Authoring a stateful proxy** — `tm` module loading, `t_relay` usage, basic failure handling.
   - **Adding NAT traversal** — `nathelper` module configuration, when to use vs not.
   - **Authoring authentication** — digest auth flow, `www_authorize` vs `proxy_authorize`.
   - **Configuring dispatcher load balancing** — `dispatcher` module, algorithm selection, health checks.
6. `## References` — one-hop pointers to the reference files this skill consults.
7. `## Working with sibling skills` — the standard cross-skill paragraph.

For each Common Task, use the structure: brief statement of the goal, pointer to the relevant reference file(s) with `{version}` placeholder, one or two paragraphs of guidance, and (where applicable) a Bad/Good paired example showing a Kamailio-syntax confusion to avoid.

Acceptance: The file is between 250 and 450 lines. It contains the seven required sections in order. Every reference path uses `{version}` as a placeholder. The cross-project guardrail is present and matches the template. At least three Common Tasks have Bad/Good paired examples.

### Task 7.3: Author `opensips-modules/SKILL.md`

Create `plugins/opensips/skills/opensips-modules/SKILL.md` as a router-index per ADR-001 and skill authoring guide §5.5.

**Frontmatter:**

```yaml
---
name: opensips-modules
description: |-
  Provides authoritative per-module reference data for OpenSIPs modules (function signatures, exported parameters, dependencies). Use whenever the user references a specific OpenSIPs module by name (e.g. dialog, tm, rr, registrar, dispatcher, drouting, presence, sl, uac, db_mysql, mid_registrar) or asks what functions/parameters a module exports. Do NOT use for Kamailio modules even if they share a name.
allowed-tools: Read, Glob, Grep
---
```

**Body sections (target: ~150–250 lines, deliberately shorter than routing):**

1. `## Overview` — one paragraph stating this skill is a router-index, not an authoring tool.
2. `## Cross-project guardrail` — same template, with module-name confusion as the focal example.
3. `## When to use this skill` — bulleted list with explicit handoff to `opensips-routing` for authoring tasks.
4. `## How to use this skill` — instructions on reading the per-module reference files. Imperative phrasing per the authoring guide.
5. `## Module index` — the catalog table mapping module names to reference file paths. **This table is generated, not hand-authored** (see Task 7.5). Insert a placeholder for now: `<!-- MODULE_INDEX_PLACEHOLDER -->` that the build script will replace.
6. `## When a module is not in the index` — instructions for handling unknown module names: check for typos, ask the user, do not invent module data.
7. `## References` — one-hop pointer noting the per-module files are the authoritative source.
8. `## Working with sibling skills` — standard cross-skill paragraph.

The module-index section is the bulk of the file's value but is generated. The hand-authored portions of this SKILL.md focus on instructions for using the index correctly.

Acceptance: The file is between 150 and 300 lines. It contains the placeholder for the module index. The cross-project guardrail names module-name confusion as the primary risk. The "How to use this skill" section instructs Claude to read the per-module reference file before answering, not to infer from training data.

### Task 7.4: Author `opensips-security-advisor/SKILL.md` (scaffold)

Create `plugins/opensips/skills/opensips-security-advisor/SKILL.md` as a minimal scaffold. The full content is owned by a separate agent (per ADR-005); this project commits the structure.

**Frontmatter:**

```yaml
---
name: opensips-security-advisor
description: |-
  Reviews OpenSIPs configurations for security issues (SIP authentication, ACL/firewall rules, rate limiting, INVITE flooding, registration hijacking, RTP relay exposure). Use whenever the user asks for a security review, audit, or hardening check on an OpenSIPs config, or mentions specific risks like 'SIP scanning', 'spoofed REGISTER', or 'toll fraud' in an OpenSIPs context. Do NOT use for general SIP security advice unrelated to OpenSIPs configuration.
allowed-tools: Read, Glob, Grep
---
```

**Body (target: 30–80 lines):**

```markdown
## Overview

This skill reviews OpenSIPs configurations for security issues. It is one of three coordinated skills for working with OpenSIPs in Claude Code. The substantive content of this skill — the risk catalog, audit workflow, and remediation guidance — is authored separately by a security-focused agent. This file is the structural placeholder.

## Cross-project guardrail

{The full text from skill authoring guide §4.1, with security-specific module confusion as the focal example: e.g., the `permissions` module in OpenSIPs versus equivalent modules in Kamailio that should not be referenced.}

## Working with sibling skills

This skill is one of three coordinated skills:
- `opensips-routing` — authoring SIP routing logic for OpenSIPs.
- `opensips-modules` — authoritative per-module reference data.
- `opensips-security-advisor` — security review of OpenSIPs configurations (this skill).

The skills are designed to load together. When a user prompt mentions security concerns, this skill activates. For authoring or per-module reference questions, defer to the sibling skills.

## Integration contract

This skill reads (but does not write) the following:

- `../opensips-modules/references/{version}/modules/*.md` — per-module reference data.
- `../opensips-modules/references/{version}/consolidated.json` — fast lookup index.
- `../opensips-routing/references/{version}/core/*.md` — core syntax references.
- `../opensips-routing/references/{version}/ser-lineage-notes.md` — anti-hallucination guardrails.

The substantive review workflow, risk catalog, and remediation patterns will be added by the security-focused authoring agent. Until then, this skill provides only the structural integration point.
```

The scaffold establishes the integration contract and the cross-project guardrail. Everything else is the security agent's responsibility.

Acceptance: The file is between 30 and 100 lines. It contains the cross-project guardrail. The integration contract names the read-only paths the skill is allowed to consume.

### Task 7.5: Build and integrate the module index

The module-index table referenced in Task 7.3 is generated, not hand-authored. Add a build step that constructs it from the consolidated index and inserts it into the modules SKILL.md.

Create `scripts/build-module-index/index.ts` exporting:

- `buildModuleIndexTable(consolidatedJsonPath: string, version: string): string` — reads the consolidated JSON, extracts the modules list with their descriptions and reference paths, formats as a Markdown table.

Output format:

```markdown
| Module | Purpose | Reference file |
|---|---|---|
| `aaa_diameter` | Diameter protocol AAA support | `references/{version}/modules/aaa_diameter.md` |
| `aaa_radius` | RADIUS protocol AAA support | `references/{version}/modules/aaa_radius.md` |
| `acc` | Call accounting | `references/{version}/modules/acc.md` |
| ... | ... | ... |
```

Modules are sorted alphabetically by name. The "Purpose" column is the first sentence of the module's description, truncated to 80 characters with trailing ellipsis if longer.

Add a step to the orchestrator (or as a separate `npm run build:skills` script) that:

1. Reads `plugins/opensips/skills/opensips-modules/SKILL.md`.
2. Locates the `<!-- MODULE_INDEX_PLACEHOLDER -->` line.
3. Replaces it with a generated section using the *first* version's index (typically the highest-numbered version, e.g., 3.6) — the SKILL.md is version-agnostic, so a single index is the right shape. Note that the description and trigger keywords cover all supported versions even though the displayed index is from one.

Alternative approach (more robust): generate one row per module, not one row per version × module. The path uses `{version}` literal (not substituted) so Claude resolves it at runtime per the active-version protocol.

Acceptance: Running the build replaces the placeholder with a populated table. The table contains every module from the consolidated index. The replacement is idempotent — running the build multiple times produces the same output.

### Task 7.6: Author `ser-lineage-notes.md` for each version

Create `plugins/opensips/skills/opensips-routing/references/{version}/ser-lineage-notes.md` for both 3.5 and 3.6.

This is hand-authored content per ADR-008. The file is short (~80–120 lines), neutral in framing, and serves as the focused anti-hallucination reference.

**Structure:**

```markdown
# SER Lineage Notes

<!-- generator-version: hand-authored
     opensips-version: {version}
     doc-type: ser_lineage_notes -->

This file documents the constraints for using OpenSIPs identifiers correctly when working with version {version}. Read this file when authoring or reviewing any OpenSIPs configuration, and especially when handling content that uses identifiers from other projects in the SIP Express Router (SER) lineage.

## Why this file exists

OpenSIPs is one of several projects that descend from the SIP Express Router. The projects share an architectural ancestry, and many concepts (transactions, dialogs, registrar logic) are recognizable across them. The configuration syntax, however, has diverged substantially. Function names, parameter names, pseudo-variable conventions, and module exports differ between projects, despite surface similarities.

## The operational rule

When authoring an OpenSIPs configuration, use only identifiers present in the active version's reference set:

- Functions and parameters: see `references/{version}/modules/<module>.md` and `references/{version}/core/functions.md`.
- Pseudo-variables: see `references/{version}/core/variables.md` and per-module pseudo-variable sections.
- Statements, operators, transformations: see the corresponding `references/{version}/core/*.md` files.

Identifiers not present in this reference set are either typos, version mismatches, or imports from sibling projects. Do not use them. If a user pastes content containing such identifiers, ask the user for clarification before proceeding.

## Common confusions

{Same as the cross-project guardrail in the skill authoring guide §4.1, but with paired Bad/Good examples specific to this version. Examples include:}

- Pseudo-variable access using `pv_get_*` functions (sibling-project pattern) versus OpenSIPs' `$var(name)`, `$avp(name)`, `$pv(name)` syntax.
- Module names that exist in sibling projects but not in OpenSIPs.
- Function signatures that drifted between projects despite sharing a name.

## When in doubt

Ask the user. The cost of a one-turn clarification is small; the cost of shipping a config that mixes idioms across projects is large because the failure mode is silent.
```

The two version-specific files are nearly identical in structure, with version-specific examples where they differ. If 3.5 had a function or syntax that was renamed in 3.6, the 3.5 ser-lineage-notes might mention the older form; the 3.6 file uses the current form.

Acceptance: Both files exist and are between 80 and 150 lines each. Both contain the operational rule and at least three named confusions with paired examples. Neither file names sibling projects beyond the single "SIP Express Router" lineage acknowledgment in §1, per ADR-008.

### Task 7.7: Verify plugin structure

After all SKILL.md files and ser-lineage-notes are written, the plugin directory should look like:

```
plugins/opensips/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    ├── opensips-routing/
    │   ├── SKILL.md
    │   └── references/
    │       ├── 3.5/
    │       │   ├── core/
    │       │   │   ├── async.md
    │       │   │   ├── events.md
    │       │   │   └── ... (twelve files)
    │       │   └── ser-lineage-notes.md
    │       └── 3.6/
    │           └── (same structure)
    ├── opensips-modules/
    │   ├── SKILL.md
    │   └── references/
    │       ├── 3.5/
    │       │   ├── modules/*.md
    │       │   └── consolidated.json
    │       └── 3.6/
    │           └── (same structure)
    └── opensips-security-advisor/
        └── SKILL.md
```

Run a sanity check:

```bash
find plugins/opensips/skills -name SKILL.md | wc -l        # expect: 3
find plugins/opensips/skills -name 'ser-lineage-notes.md' | wc -l  # expect: 2
find plugins/opensips/skills/opensips-modules/references -name 'consolidated.json' | wc -l  # expect: 2
find plugins/opensips/skills/opensips-modules/references -name '*.md' | wc -l  # expect: 2 × ~100 modules
```

Acceptance: All four counts match expectations.

### Task 7.8: Commit and review

Stage and commit:

- All three SKILL.md files.
- Both ser-lineage-notes.md files.
- The build-module-index script and any updated orchestrator integration.

The PR description should summarize:

- Which skill descriptions were authored and the rationale for trigger keyword choices.
- The Bad/Good examples present in the routing skill's Common Tasks.
- Any tradeoffs made between description length and trigger coverage.

Self-review: open each SKILL.md in a Markdown previewer and read it as if you were a contributor encountering the project for the first time. Does the cross-project guardrail land? Are the trigger keywords specific enough? Is the body length comfortable? Are the reference-file pointers correctly formatted?

If any answer is "not really," iterate before merging. SKILL.md content is consequential — these files run on every Claude Code session that activates the skills.

Acceptance: All five files are committed. Self-review pass complete. The plugin structure is verified.

## Acceptance criteria

The milestone is done when all of the following are true:

- `opensips-routing/SKILL.md` is authored, between 250 and 450 lines, with all seven required sections and a cross-project guardrail.
- `opensips-modules/SKILL.md` is authored as a router-index, between 150 and 300 lines, with the module-index placeholder.
- `opensips-security-advisor/SKILL.md` is a minimal scaffold (30–80 lines) with the integration contract.
- The module-index build step generates and inserts the table into `opensips-modules/SKILL.md`.
- `ser-lineage-notes.md` exists for both 3.5 and 3.6, each between 80 and 150 lines.
- The plugin structure passes the sanity-check counts.
- All files are committed and the build still passes (`npm run build` produces clean output).
- ESLint passes; JSDoc complete on any new build script.

When all of these are true, milestone 7 is complete. Milestone 8 (local plugin testing) can begin — that's where the SKILL.md files actually run against Claude Code for the first time.

## Risks and watch-outs

**Description length pressure.** The 1024-character limit is generous; the 250-character truncation is tight. The temptation when iterating is to add one more trigger keyword and push the description longer. Resist. The truncation reality means anything beyond ~250 chars is a bonus that may or may not survive. Front-load the OpenSIPs identification and the sibling-project exclusion in the first sentence.

**Bad/Good examples that anchor on the wrong pattern.** The Bad/Good pattern works because the Good immediately follows the Bad, providing a target for Claude to pull toward. If the Bad is more memorable than the Good (longer, more detailed, more visually distinctive), Claude may anchor on the Bad. Keep both halves balanced; the Good should be at least as detailed as the Bad.

**The cross-project guardrail becoming boilerplate.** Three SKILL.md files all contain the same guardrail section. The temptation is to vary the wording for "freshness." Don't. Identical guardrail across files means contributors editing one will keep the others in sync; varied wording means drift over time. The repetition is a feature.

**The module-index placeholder pattern.** If the build script's placeholder-replacement logic ever fails silently, the SKILL.md file ships with a literal `<!-- MODULE_INDEX_PLACEHOLDER -->` comment in production. Claude reading this would have no module catalog and would either guess at module names or refuse to help. Add a CI check that fails if the placeholder is still present in any committed SKILL.md.

**The security advisor's scaffold becoming the actual content.** The scaffold is short and easy. It's tempting to "just add" a few risk patterns to make it more useful in the interim. Don't. Per ADR-005, the security advisor is owned by a separate agent. Adding content here creates ambiguity about ownership and may conflict with the agent's work. The scaffold stays a scaffold until the security agent ships its content.

**SER-lineage notes naming sibling projects.** Per ADR-008, the file uses the single phrase "SIP Express Router" and never names sibling projects. The Bad/Good examples mention "sibling-project pattern" without identifying which sibling. This is a deliberate diplomatic posture; reviewers should fail any PR that names sibling projects in any of the SKILL.md files or ser-lineage-notes.

**Reference path drift.** SKILL.md files use `references/{version}/...` paths. If a future change renames a reference file or moves it, the SKILL.md still points at the old location and Claude's Read tool returns "file not found." A CI check that the paths in SKILL.md actually resolve in at least one version's reference tree catches this. Add it to milestone 9's CI work.

**The 250–400 line target as a hard rule.** The skill authoring guide says target 250–400 lines for body length. If the routing skill's Common Tasks legitimately need 50 more lines to be complete, push past 400 — quality over arbitrary count. The target exists to prevent runaway bloat, not to enforce a specific number.

**Description copy-paste from older drafts.** The descriptions in this milestone come from Task 2.7 of the skill authoring guide. If the guide gets revised after this milestone, the descriptions should sync. Add a comment in the SKILL.md frontmatter noting the source of the description text so future maintainers can trace authority.

## Parallelization notes

Task 7.1 (re-read the guide) is the prerequisite for everything else. Tasks 7.2 (routing), 7.3 (modules), and 7.4 (security scaffold) are independent — three different files with overlapping content (the cross-project guardrail) but otherwise separate. Task 7.5 (module-index build) depends on 7.3 (the SKILL.md needs the placeholder before the build step can replace it). Task 7.6 (ser-lineage-notes) is independent and can be done at any point. Tasks 7.7 (structure verification) and 7.8 (commit) close out.

For two-person work, one person handles the routing SKILL.md (7.2 — the largest file) while the other handles modules + security scaffold + ser-lineage-notes (7.3 + 7.4 + 7.6 — three smaller files). They meet at 7.5.

For solo work, the natural flow is 7.1 → 7.6 (warmup with a short file) → 7.4 (smaller scaffold) → 7.3 → 7.2 → 7.5 → 7.7 → 7.8. Doing the smaller files first builds confidence in the patterns before the longer routing file.

## Cross-references

- Skill authoring conventions: `docs/architecture/skill-authoring-guide.md` — entire document.
- The four-part description structure: `docs/architecture/skill-authoring-guide.md` §2.1.
- Cross-project guardrail template: `docs/architecture/skill-authoring-guide.md` §4.1.
- Body section order: `docs/architecture/skill-authoring-guide.md` §5.2.
- Per-skill body templates: `docs/architecture/skill-authoring-guide.md` §5.4 (routing), §5.5 (modules), §5.6 (security advisor).
- SER-lineage neutral framing: `docs/architecture/adr/008-ser-lineage-neutral-framing.md`.
- Three-skill architecture: `docs/architecture/adr/005-three-skill-architecture.md`.
- Router-index pattern: `docs/architecture/adr/001-router-index-over-per-module-skills.md`.

---

*Next milestone: `08-local-plugin-testing.md`.*
