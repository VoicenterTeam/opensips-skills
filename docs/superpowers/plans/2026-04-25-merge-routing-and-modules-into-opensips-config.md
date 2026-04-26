<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Merge Routing and Modules into `opensips-config` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `opensips-routing` and `opensips-modules` into a single `opensips-config` skill that owns both authoring and per-module reference. Add a hand-authored `cfg-format.md` reference and codify the loadmodule-scan workflow. Keep `opensips-security-advisor` structurally unchanged; update only its cross-references.

**Architecture:** Two skills total. `opensips-config` (new) absorbs the contents of the two old skills under one `references/{version}/` tree. The build pipeline writes to one merged subtree. The security advisor's read paths collapse from two siblings to one. ADR-005 is superseded by ADR-012.

**Tech Stack:** Node 20+, TypeScript, tsx, vitest, Zod (for schemas), markdown rendering via the existing per-renderer modules. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-25-merge-routing-and-modules-into-opensips-config-design.md`.

---

## File structure (target state after plan executes)

```
plugins/opensips/skills/
├── opensips-config/                              # NEW
│   ├── SKILL.md                                   # Hand-authored
│   ├── references/
│   │   └── {3.5,3.6}/
│   │       ├── cfg-format.md                      # NEW, hand-authored
│   │       ├── ser-lineage-notes.md               # Hand-authored, moved from routing
│   │       ├── core/*.md                          # Generated
│   │       ├── modules/*.md                       # Generated
│   │       ├── guides/*.md                        # Generated (3.6 only)
│   │       └── consolidated.json                  # Generated
│   └── scripts/
│       └── module_search.py                       # Moved from routing
└── opensips-security-advisor/
    └── SKILL.md                                    # Cross-refs updated
```

`plugins/opensips/skills/opensips-routing/` and `plugins/opensips/skills/opensips-modules/` are **deleted** at the end.

`docs/architecture/adr/012-merge-routing-and-modules-into-opensips-config.md` is **created**. ADR-005's status header changes to `Superseded by ADR-012`.

The build script's hardcoded `opensips-routing` and `opensips-modules` output path components in `scripts/lib/orchestrator-helpers.ts` and `scripts/clean.ts` collapse to `opensips-config`. The `scripts/build-module-index/cli.ts` SKILL.md path is updated to the new location. Note: the previous module-index marker block (`<!-- MODULE_INDEX:BEGIN -->` / `<!-- MODULE_INDEX:END -->`) is **not retained** in the new SKILL.md — the module index is no longer inline. Instead, the `build-module-index` step is repurposed to render `references/{version}/modules-index.md` (NEW reference file). See Tasks 11–12.

---

## Phase 1 — ADR

### Task 1: Write ADR-012 superseding ADR-005

**Files:**
- Create: `docs/architecture/adr/012-merge-routing-and-modules-into-opensips-config.md`
- Modify: `docs/architecture/adr/005-three-skill-architecture.md` (status header only)

- [ ] **Step 1: Author ADR-012**

Create the file with this content (sections per the existing ADR template `000-template.md`):

```markdown
# ADR-012: Merge routing and modules into a single `opensips-config` skill

**Status:** Accepted
**Date:** 2026-04-25
**Deciders:** Project founder
**Technical story:** Skill restructure — collapse `opensips-routing` + `opensips-modules` into one skill.
**Supersedes:** ADR-005

---

## Context

ADR-005 split OpenSIPs work into three skills: `opensips-routing` (authoring), `opensips-modules` (reference), `opensips-security-advisor` (review). The split predicted that procedural and reference content would compete for SKILL.md space if combined. Operational experience after M0–M10 shows the split costs more than it saves:

1. Almost every authoring prompt requires module reference data immediately. The two-skill activation adds latency and a second cross-skill `references/` path lookup that buys nothing.
2. The `opensips.cfg` file itself is undocumented as an artifact. There is no first-class teaching of section order, modparam-after-loadmodule rules, or the "scan loadmodules and load each module's reference" workflow that authoring naturally needs.
3. The 200-row inline module index in `opensips-modules/SKILL.md` is heavier than progressive disclosure recommends. The `consolidated.json` index already covers most lookup cases; the inline catalog is fallback that does not deserve always-loaded status.

## Decision

Two skills:

1. **`opensips-config`** — authoring + per-module reference. Workflow-first SKILL.md anchored on the cfg file as an artifact. References tree merges the old routing's `core/`, `guides/`, `ser-lineage-notes.md` with the old modules' `modules/`, `consolidated.json`, plus a new hand-authored `cfg-format.md` and a new generated `modules-index.md`.
2. **`opensips-security-advisor`** — unchanged in role; only cross-references update.

A `loadmodule`-scan workflow (read `cfg-format.md` → read `consolidated.json` → for each `loadmodule` whose module Claude touches, read its per-module `.md`) is the canonical procedure when working with a cfg file.

## Alternatives considered

- **Keep three skills** (status quo). Rejected per the operational reasons above.
- **Merge all three** including the security advisor. Rejected because the advisor has a separate authoring cadence and a clean read-only contract; merging would couple unrelated concerns.
- **Keep two skills but reorganize routing only.** Rejected because the cfg-file teaching and the loadmodule-scan workflow naturally need both routing and module content under one roof.

## Consequences

**Positive:**
- One skill activates for cfg work; no two-skill negotiation per prompt.
- The cfg-file format is taught explicitly via `cfg-format.md`.
- Module index moves out of SKILL.md, freeing the SKILL.md to be workflow-first.
- The security advisor's cross-reference paths simplify from two siblings to one.

**Negative:**
- Pure-lookup prompts now resolve via `references/{version}/modules-index.md` (one extra Read) when `consolidated.json` does not suffice.
- ADR-005 is superseded; subsequent contributions must read ADR-012 to understand the current decomposition.

**Neutral:**
- ADR-001 (router-index pattern), ADR-002 (JSON source of truth), ADR-003 (version-isolated folders), ADR-006 (consolidated.json as search index) all apply identically to the unified skill.

## Implementation notes

See `docs/superpowers/plans/2026-04-25-merge-routing-and-modules-into-opensips-config.md`.

## Related decisions

- **Supersedes:** ADR-005 (three-skill architecture).
- **Depends on:** ADR-001, ADR-002, ADR-003, ADR-006.
```

- [ ] **Step 2: Update ADR-005 status header**

Edit `docs/architecture/adr/005-three-skill-architecture.md` — change the `**Status:**` line near the top from `Accepted` to `Superseded by ADR-012`. Do not edit any other content of ADR-005 (per CLAUDE.md Rule 2).

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/adr/012-merge-routing-and-modules-into-opensips-config.md docs/architecture/adr/005-three-skill-architecture.md
git commit -m "docs(adr): ADR-012 supersedes ADR-005 (merge routing+modules into opensips-config)"
```

---

## Phase 2 — Author new SKILL.md and reference content

### Task 2: Author `opensips-config/SKILL.md`

**Files:**
- Create: `plugins/opensips/skills/opensips-config/SKILL.md`

- [ ] **Step 1: Create the directory and SKILL.md**

Author a hand-written SKILL.md with sections in this exact order. Source content for sections 5–7 and 10 is the existing `plugins/opensips/skills/opensips-routing/SKILL.md`; source for section 8 is `plugins/opensips/skills/opensips-modules/SKILL.md` (re-summarised, **not** including the 200-row inline table).

```markdown
---
name: opensips-config
description: |-
  Authors, edits, reviews, and answers questions about OpenSIPs SIP server configuration files (opensips.cfg, route blocks, modules, parameters, pseudo-variables). Use whenever the user mentions OpenSIPs, opensips.cfg, route{}/branch_route/failure_route, $var/$avp/$pv pseudo-variables, asks to write/edit SIP routing logic for OpenSIPs, names a specific OpenSIPs module (tm, dialog, dispatcher, registrar, drouting, presence, sl, uac, db_mysql, mid_registrar, etc.), or asks what functions/parameters a module exports. Do NOT use for sibling SIP Express Router (SER)-lineage projects — those use different identifiers despite shared lineage. For security review of an OpenSIPs config defer to opensips-security-advisor.
allowed-tools: Read, Write, Edit, Glob, Grep
---

## Overview

This skill is the single entry point for OpenSIPs configuration work — authoring opensips.cfg files, editing route blocks, looking up module exports, and answering questions about cfg syntax. The substantive content lives in version-scoped reference files; this SKILL.md routes Claude to the right reference for any given task. The companion skill `opensips-security-advisor` handles security review; this skill defers to it for explicit security-review requests.

## Cross-project guardrail

[Fold the cross-project guardrail content from the existing routing SKILL.md (lines 12–22) AND the modules SKILL.md (lines 14–22) into one section. Both convey the same SER-lineage anti-hallucination rule; deduplicate. Final length ~30 lines.]

## The opensips.cfg workflow

When working on an opensips.cfg — reading, editing, generating, or answering a question that depends on what is in one — follow this procedure:

**Step 1.** Read `references/{version}/cfg-format.md` to ground in the file's section model and ordering rules.

**Step 2.** Read `references/{version}/consolidated.json` once for upfront orientation. The index gives module dependencies, function-to-module reverse lookup, pseudo-variable-to-module reverse lookup, and per-module summaries — enough to answer many questions without reading any per-module file.

**Step 3.** For each `loadmodule "X.so"` directive whose module Claude is about to reference — answering a question about it, editing code that calls into it, or generating new code that calls into it — Read `references/{version}/modules/X.md`. Do not infer a module's exports from training-data priors.

**Step 4.** For pseudo-variables, route blocks, transformations, flags, operators, statements, async statements, events, MI commands, statistics, parameters, or other core constructs, Read the matching `references/{version}/core/<topic>.md`.

The `{version}` literal stays unresolved here; Claude resolves it at read time per the version-resolution protocol against the active version the user is working on.

## When to use this skill

[List trigger conditions. Combine the routing SKILL.md "When to use this skill" content with the modules SKILL.md "When to use this skill" content. Final length ~25 lines.]

## When to defer to `opensips-security-advisor`

[Compact deferral table. Source from the existing routing SKILL.md "should defer to opensips-security-advisor" block. Final length ~10 lines.]

## Routing decisions

[Copy the 12-row "task → approach → reference" table from the existing routing SKILL.md verbatim. Update reference paths: `references/{version}/modules/<module>.md` stays (path is now within this skill's references tree); `references/{version}/core/<topic>.md` stays. No path rewrites needed because all references are now under this skill's tree and the SKILL.md uses relative paths.]

## Common tasks

[Copy the five worked examples (registrar, stateful proxy, NAT, authentication, dispatcher) verbatim from the existing routing SKILL.md. References within the examples already use `references/{version}/...` and are unchanged.]

## Module lookup

For questions about a specific module's exports, the lookup procedure is:

1. Read `references/{version}/consolidated.json` first. For most questions this is sufficient: `indexes.functionsByName[<fn>]` resolves a function name to its source module; `indexes.variablesByName[<pv>]` resolves a pseudo-variable; `indexes.miCommandsByName[<cmd>]` resolves an MI command; `indexes.parametersByModule[<module>]` lists a module's parameters.
2. If the question requires the full per-module surface (parameter narratives, function descriptions, usage examples, dependencies), Read `references/{version}/modules/<slug>.md` for that module.
3. If the user names a module that does not appear in `consolidated.json`'s module list, follow the procedure in `references/{version}/modules-index.md` ("When a module is not in the index"). Do not invent identifiers.

The two-step lookup pattern (consolidated → per-module) is mandatory whenever a question asks for content that is not in the consolidated index — descriptions, narratives, and signatures live only in the per-module file.

## References

This skill consults the following files. `{version}` is a literal placeholder Claude resolves at read time:

- `references/{version}/cfg-format.md` — file structure, section order, ordering rules, route block taxonomy, common gotchas. Read first whenever working on a cfg file.
- `references/{version}/consolidated.json` — the cross-identifier index. Read upfront when scanning a cfg.
- `references/{version}/modules/<slug>.md` — per-module reference data (parameters, exported functions, pseudo-variables, MI commands, statistics, events, dependencies). Read on demand, one module per Read.
- `references/{version}/modules-index.md` — module catalog and the lookup-discipline procedures, including "When a module is not in the index". Read when no module name from a user's prompt matches anything in `consolidated.json`.
- `references/{version}/core/variables.md` — pseudo-variables (type, R/W, scope, available-in route blocks).
- `references/{version}/core/functions.md` — core script function signatures.
- `references/{version}/core/routes.md` — route block semantics.
- `references/{version}/core/operators.md` — comparison/arithmetic/control-flow operators.
- `references/{version}/core/statements.md` — language statements.
- `references/{version}/core/transformations.md` — `{transformation}` syntax.
- `references/{version}/core/flags.md` — flag declaration and `setflag`/`resetflag`/`isflagset`.
- `references/{version}/core/parameters.md` — global core parameters.
- `references/{version}/core/async.md` — async/launch statements.
- `references/{version}/core/events.md` — event registration/raising.
- `references/{version}/core/mi-commands.md` — management interface commands callable from script.
- `references/{version}/core/statistics.md` — statistics defined by the core.
- `references/{version}/guides/installation.md`, `references/{version}/guides/configuration.md`, `references/{version}/guides/syntax.md` — when present (per ADR-009, some versions ship guides; absence is not an error).
- `references/{version}/ser-lineage-notes.md` — anti-hallucination guardrails. Read on first use of this skill in any session that involves unfamiliar identifiers.

## Working with the sibling skill

`opensips-security-advisor` reviews OpenSIPs configurations for security issues. When the user asks for a security review, audit, or hardening check, the advisor activates and reads this skill's reference files (read-only, per Rule 8 in CLAUDE.md). This skill does not write to the advisor's directory and the advisor does not write to this skill's directory.
```

The expanded prose for the `[bracketed]` sections must be filled in from the existing two SKILL.md files (do not improvise content; the existing prose is golden-tested). Final estimated length: ~350 lines. The 200-row module table from the old `opensips-modules/SKILL.md` is **not** carried over — it relocates to `references/{version}/modules-index.md` (Task 11).

- [ ] **Step 2: Sanity check the YAML frontmatter**

Run:

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('plugins/opensips/skills/opensips-config/SKILL.md','utf8');const fm=m.split('---')[1];console.log('OK' + (fm.includes('name: opensips-config')?'':' MISSING name')+(fm.includes('allowed-tools:')?'':' MISSING tools'));"
```

Expected: `OK` (no missing markers).

- [ ] **Step 3: Commit**

```bash
git add plugins/opensips/skills/opensips-config/SKILL.md
git commit -m "feat(opensips-config): add unified SKILL.md (workflow-first, references-only)"
```

---

### Task 3: Author `cfg-format.md` reference

**Files:**
- Create: `plugins/opensips/skills/opensips-config/references/3.5/cfg-format.md`
- Create: `plugins/opensips/skills/opensips-config/references/3.6/cfg-format.md`

The two version files are byte-identical at creation time. They live in separate version directories per ADR-003 (version-isolated folders). If a future OpenSIPs version changes the file structure, the directories diverge at that point.

- [ ] **Step 1: Author the canonical cfg-format.md**

Create `plugins/opensips/skills/opensips-config/references/3.6/cfg-format.md` with this content:

````markdown
# opensips.cfg — file structure and authoring workflow

This reference teaches the opensips.cfg file as an artifact: section order, the rules that constrain it, the route block taxonomy, and the procedural workflows for reading and authoring. It does not duplicate the per-construct references — for pseudo-variable details see `core/variables.md`, for route block semantics see `core/routes.md`, for module-level data see `modules/<slug>.md`.

## Canonical section order

An opensips.cfg has the following top-level sections, in this order:

1. **Global parameters.** Listen sockets, log level, worker counts, timer defaults. See `core/parameters.md` for the full set.
2. **`#!define` macros.** Optional. Compile-time symbol definitions used elsewhere in the file.
3. **`mpath` and `loadmodule`.** `mpath` (one entry; sets the search path for module shared libraries) precedes the `loadmodule` directives that depend on it. `loadmodule "X.so"` lines load each module by filename.
4. **`modparam` calls.** Each `modparam("X", "param", value)` configures a parameter exported by module `X`. `modparam` for `X` MUST come after `loadmodule "X.so"` — the module must be loaded before its parameters can be set.
5. **Route blocks.** `route`, `request_route`, `branch_route`, `failure_route`, `onreply_route`, `local_route`, `error_route`, `event_route`, `startup_route`, `timer_route`. The route blocks are where the runtime SIP-message logic lives.

## Annotated skeleton

```
####### Global Parameters #########
log_level = 3
udp_workers = 4
listen = udp:0.0.0.0:5060

####### Modules Section #########
mpath = "/usr/lib/opensips/modules/"

loadmodule "signaling.so"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "rr.so"
loadmodule "maxfwd.so"
loadmodule "registrar.so"
loadmodule "usrloc.so"
loadmodule "auth.so"
loadmodule "auth_db.so"

modparam("usrloc", "nat_bflag", "NAT")
modparam("registrar", "tcp_persistent_flag", "TCP_PERSISTENT")
modparam("auth_db", "db_url", "mysql://opensips:pw@localhost/opensips")

####### Routing Logic #########
route {
    if (!mf_process_maxfwd_header("10")) {
        sl_send_reply(483, "Too Many Hops");
        exit;
    }

    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        save("location");
        exit;
    }

    if (!t_relay()) {
        sl_reply_error();
    }
    exit;
}

failure_route[gw_failover] {
    if (t_check_status("486|408")) {
        $ru = "sip:vm@voicemail.example.com";
        t_relay();
    }
}
```

## Hard ordering rules

- `modparam("X", ...)` MUST follow `loadmodule "X.so"` for the same X. The opposite order is a load-time error.
- `mpath` MUST precede the loadmodules that resolve through it. A `loadmodule` before its required `mpath` will fail to find the shared library.
- Some global parameters (notably `listen`, `tcp_workers`, `udp_workers`, transport-protocol settings) MUST appear before the module section. The runtime initialises listening sockets and worker pools as a discrete startup phase before module load.
- Route block bodies may reference functions, pseudo-variables, and statistics exported by ANY loaded module — but only after the module has been loaded. A function call in a route block that references an unloaded module is a parse error.
- `flags` declarations and `branch_flags` declarations (when present) belong with the global parameters section. Numeric flag indices used in `setflag`/`isflagset` resolve through these declarations.

## Route block taxonomy

The route block types and when each fires:

- **`route`** — the main routing block (no name). Fires on every request that enters via the network.
- **`request_route`** — synonym for `route` in modern OpenSIPs versions.
- **`branch_route[<name>]`** — fires per branch when a request is forked (typically by `tm`).
- **`failure_route[<name>]`** — fires when a transaction receives a negative final response (4xx/5xx/6xx) that did not stop the transaction. Used for fallback routing.
- **`onreply_route[<name>]`** — fires for incoming replies. Used to inspect or modify provisional and final responses.
- **`local_route`** — fires for requests that the proxy generates internally (not routed from the network).
- **`error_route`** — fires when a parsing or routing error occurs.
- **`event_route[<event>]`** — fires when the named event is raised. The event name follows the module-defined event taxonomy; see `core/events.md`.
- **`startup_route`** — fires once at proxy startup, before any traffic is processed.
- **`timer_route[<name>,<interval>]`** — fires periodically at the named interval.

For full per-block detail (which pseudo-variables are in scope, what return codes mean, what modifications are allowed) see `core/routes.md`.

## Reading-mode workflow

When reading an existing opensips.cfg to understand it or answer a question about it:

1. Identify section boundaries: globals → loadmodules → modparams → route blocks.
2. Enumerate every `loadmodule "X.so"`. This is the module set the file uses.
3. Read `consolidated.json` for the active version. Use it to confirm every loaded module exists in the version's reference set; flag any module not present (typo, version drift, or sibling-project import).
4. For any user question that depends on a specific module's behaviour, Read `modules/<slug>.md` for that module.
5. For any user question that depends on a core construct (pseudo-variable, route block, transformation, flag, operator, statement, async, event, MI command, statistic, global parameter), Read the matching `core/<topic>.md`.

## Authoring-mode workflow

When generating a new opensips.cfg from a user's described intent:

1. Enumerate the capabilities the user needs (registrar? stateful proxy? NAT traversal? authentication? dispatcher LB? dialog tracking? accounting? media relay?).
2. Derive the minimal module set from the capability list. Cross-check `consolidated.json`'s `relationships.moduleDependencies` to ensure transitive dependencies are loaded.
3. Read each module's `modules/<slug>.md` to confirm exact function signatures, parameter types, and route-block-availability rules before emitting calls.
4. Emit sections in canonical order (globals → `#!define` → mpath/loadmodule → modparam → route blocks).
5. Validate the route flow against the call flow: registrar handles REGISTER, proxying handles INVITE/BYE/CANCEL, branches and failure routes are wired correctly to `tm`.

## Common gotchas

- **Forward references.** Route blocks may reference functions or pseudo-variables exported by modules loaded later in the file. The parser may accept this and fail at startup, OR may silently load a stale binding. Order loadmodules before any route block uses their exports.
- **modparam ordering.** A `modparam` call before its `loadmodule` is a parse error, but a typo in the module name produces silent no-effect — the modparam call binds to nothing.
- **Double-loaded modules.** Loading the same `.so` twice is a startup error. Loading a module under two different paths (different `mpath` blocks) can produce two distinct module instances with separate state.
- **Empty route fallthrough.** A route block that ends without an explicit `exit` or `t_relay` falls through silently. The behaviour depends on the route type; see `core/routes.md`.
- **Numeric flag indices vs named flags.** `setflag(5)` (numeric) is fragile; `setflag(NAT_FLAG)` (named, declared via `flags`) is recommended. The two are interchangeable at the parser level but the named form is robust against re-numbering.
- **Realm argument to www_authorize/www_challenge.** Empty string defers to the From URI's domain. A non-empty string sets the realm explicitly. Sibling-project conventions that pass `$fd` or `"$fd"` are not OpenSIPs idioms.
````

- [ ] **Step 2: Copy to the 3.5 version directory**

```bash
mkdir -p plugins/opensips/skills/opensips-config/references/3.5
cp plugins/opensips/skills/opensips-config/references/3.6/cfg-format.md plugins/opensips/skills/opensips-config/references/3.5/cfg-format.md
```

- [ ] **Step 3: Commit**

```bash
git add plugins/opensips/skills/opensips-config/references/3.5/cfg-format.md plugins/opensips/skills/opensips-config/references/3.6/cfg-format.md
git commit -m "feat(opensips-config): add cfg-format.md reference for 3.5 and 3.6"
```

---

### Task 4: Move `module_search.py` and `ser-lineage-notes.md` into the new skill

**Files:**
- Move: `plugins/opensips/skills/opensips-routing/scripts/module_search.py` → `plugins/opensips/skills/opensips-config/scripts/module_search.py` (if the file exists)
- Move: `plugins/opensips/skills/opensips-routing/references/3.5/ser-lineage-notes.md` → `plugins/opensips/skills/opensips-config/references/3.5/ser-lineage-notes.md`
- Move: `plugins/opensips/skills/opensips-routing/references/3.6/ser-lineage-notes.md` → `plugins/opensips/skills/opensips-config/references/3.6/ser-lineage-notes.md`

- [ ] **Step 1: Check whether `module_search.py` exists**

```bash
test -f plugins/opensips/skills/opensips-routing/scripts/module_search.py && echo PRESENT || echo ABSENT
```

If `PRESENT`: proceed to step 2 to move it. If `ABSENT`: skip step 2 — the file does not yet exist in the codebase (it is referenced in CLAUDE.md as a planned artifact); no move is needed.

- [ ] **Step 2 (only if PRESENT): Move `module_search.py`**

```bash
mkdir -p plugins/opensips/skills/opensips-config/scripts
git mv plugins/opensips/skills/opensips-routing/scripts/module_search.py plugins/opensips/skills/opensips-config/scripts/module_search.py
```

- [ ] **Step 3: Move ser-lineage-notes for both versions**

```bash
git mv plugins/opensips/skills/opensips-routing/references/3.5/ser-lineage-notes.md plugins/opensips/skills/opensips-config/references/3.5/ser-lineage-notes.md
git mv plugins/opensips/skills/opensips-routing/references/3.6/ser-lineage-notes.md plugins/opensips/skills/opensips-config/references/3.6/ser-lineage-notes.md
```

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(opensips-config): move ser-lineage-notes (and module_search.py if present) into new skill"
```

---

## Phase 3 — Update build pipeline output paths

### Task 5: Update `scripts/lib/orchestrator-helpers.ts` output paths

**Files:**
- Modify: `scripts/lib/orchestrator-helpers.ts:465-472` (modules), `:575-582` (core), `:672-679` (guides), `:881-887` (consolidated)

The four `posixPath(opts.outputRoot, "...", "references", version, ...)` invocations need their second argument changed from the old skill names to `"opensips-config"`.

- [ ] **Step 1: Update modules output path**

In `renderModulesForVersion`, change:

```ts
    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-modules",
      "references",
      version,
      "modules",
      `${slug}.md`,
    );
```

to:

```ts
    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-config",
      "references",
      version,
      "modules",
      `${slug}.md`,
    );
```

- [ ] **Step 2: Update core output path**

In `renderCoreForVersion`, change:

```ts
    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-routing",
      "references",
      version,
      "core",
      filename,
    );
```

to:

```ts
    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-config",
      "references",
      version,
      "core",
      filename,
    );
```

- [ ] **Step 3: Update guides output path**

In `renderGuidesForVersion`, change:

```ts
    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-routing",
      "references",
      version,
      "guides",
      filename,
    );
```

to:

```ts
    const outputPath = posixPath(
      opts.outputRoot,
      "opensips-config",
      "references",
      version,
      "guides",
      filename,
    );
```

- [ ] **Step 4: Update consolidated index output path**

In `buildAndWriteConsolidatedIndex`, change:

```ts
  const outputPath = posixPath(
    opts.outputRoot,
    "opensips-modules",
    "references",
    version,
    "consolidated.json",
  );
```

to:

```ts
  const outputPath = posixPath(
    opts.outputRoot,
    "opensips-config",
    "references",
    version,
    "consolidated.json",
  );
```

- [ ] **Step 5: Update the doc comments in the same file**

Three doc-comment paragraphs in `orchestrator-helpers.ts` cite ADR-005 and the old skill paths. Update each to reference `opensips-config` and ADR-012. Specifically:

- Line ~203: "atomic writes to `<outputRoot>/opensips-modules/references/<version>/modules/<slug>.md`" → `<outputRoot>/opensips-config/references/<version>/modules/<slug>.md`
- Line ~287: "Per ADR-005, core files belong to the routing skill — note the `opensips-routing` path component (not `opensips-modules`)." → "Per ADR-012, core, modules, guides, and consolidated.json all live under `opensips-config`."
- Line ~302: "Per ADR-005 guides also belong to the routing skill and live alongside core/." → "Per ADR-012 guides live alongside core/ under opensips-config."
- Line ~507: "atomic writes to `<outputRoot>/opensips-routing/references/<version>/core/<filename>.md`" → `<outputRoot>/opensips-config/references/<version>/core/<filename>.md`
- Line ~511: "Per ADR-005, core syntax is the routing skill's domain — output goes under `opensips-routing/`, not `opensips-modules/`." → "Per ADR-012, all generated reference content for OpenSIPs lives under `opensips-config/`."
- Line ~613: "atomic writes to `<outputRoot>/opensips-routing/references/<version>/guides/<filename>.md`" → `<outputRoot>/opensips-config/references/<version>/guides/<filename>.md`
- Line ~625: "Per ADR-005, guides — like core syntax — belong to the routing skill (path component `opensips-routing/`)." → "Per ADR-012, guides live under `opensips-config/`."
- Line ~795: "Output path: `{outputRoot}/opensips-modules/references/{version}/consolidated.json` per ADR-005 (the index is the modules-skill's lookup aid)." → "Output path: `{outputRoot}/opensips-config/references/{version}/consolidated.json` per ADR-012."

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/orchestrator-helpers.ts
git commit -m "refactor(build): redirect renderer output paths to opensips-config"
```

---

### Task 6: Update `scripts/clean.ts` targets

**Files:**
- Modify: `scripts/clean.ts:13-16`

- [ ] **Step 1: Edit clean targets**

Change:

```ts
const targets = [
  "./plugins/opensips/skills/opensips-modules/references",
  "./plugins/opensips/skills/opensips-routing/references",
];
```

to:

```ts
const targets = [
  "./plugins/opensips/skills/opensips-config/references",
];
```

- [ ] **Step 2: Update the doc comment**

The file's top comment references "every skill's `references/` tree". Adjust to:

```ts
/**
 * `npm run clean` entry point.
 *
 * Removes the contents of opensips-config's `references/` tree without
 * touching the directory itself or the hand-authored SKILL.md,
 * `cfg-format.md`, and `ser-lineage-notes.md` files. Per Rule 8 of
 * `CLAUDE.md`, each skill owns its own output tree; the security advisor
 * has no generated content and is therefore not cleaned here.
 */
```

Note: `cleanDirectory` removes generated files but not hand-authored ones if it follows the existing rules. If the function blindly removes everything in the directory, the hand-authored `cfg-format.md` and `ser-lineage-notes.md` would also be removed and then re-restored from git on the next operation. Verify the existing `cleanDirectory` semantics in `scripts/lib/fs-helpers.ts` and adjust the clean script's exclusion list if needed.

- [ ] **Step 3: Verify clean preserves hand-authored files**

```bash
grep -n "cleanDirectory" scripts/lib/fs-helpers.ts
```

Inspect the function. If it removes all contents indiscriminately, update `clean.ts` to remove only the `core/`, `modules/`, `guides/` subtrees and `consolidated.json`, leaving `cfg-format.md` and `ser-lineage-notes.md` intact. Alternatively, if the existing routing skill's clean already handled this (pre-merge), follow the same pattern.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add scripts/clean.ts
git commit -m "refactor(clean): point at opensips-config/references instead of two skills"
```

---

### Task 7: Update `scripts/build-module-index/cli.ts` to point at the new SKILL.md

**Files:**
- Modify: `scripts/build-module-index/cli.ts:29-33`

Before this task, the `build-module-index` step injects the module catalog into `plugins/opensips/skills/opensips-modules/SKILL.md`. After the merge, the inline module-index marker block is **removed** from the new SKILL.md (per Task 2). Tasks 11–12 re-purpose this build step to render `references/{version}/modules-index.md` instead.

For now (this task), make the immediate change minimal: redirect the path. The deeper repurposing happens in Tasks 11–12.

- [ ] **Step 1: Update SKILL.md path (transitional — to be replaced in Task 11)**

In `cli.ts`:

```ts
  await rebuildModuleIndex(
    "plugins/opensips/skills/opensips-modules/SKILL.md",
    "./data",
    latest,
  );
```

becomes (transitional placeholder; see Task 11 for final form):

```ts
  // Transitional: the build-module-index is being repurposed to render
  // references/{version}/modules-index.md per ADR-012. Until Task 11 lands,
  // the CLI is wired to a no-op path. Run `npm run build:skills` is a
  // no-op until Task 11.
  console.log("build:skills: pending repurposing per Task 11; no-op for now.");
```

- [ ] **Step 2: Commit**

```bash
git add scripts/build-module-index/cli.ts
git commit -m "refactor(build:skills): pause build-module-index pending repurpose to modules-index.md"
```

---

### Task 8: Run the build and verify output goes to the new location

- [ ] **Step 1: Clean any stale output**

```bash
rm -rf plugins/opensips/skills/opensips-routing/references plugins/opensips/skills/opensips-modules/references
```

(These directories remain populated from before the merge. We delete the contents now to make sure the build is producing fresh output and not referring to the old location. The directories themselves are deleted in Task 14.)

- [ ] **Step 2: Run the build**

```bash
npm run build
```

Expected: build succeeds. Output appears under `plugins/opensips/skills/opensips-config/references/{3.5,3.6}/{core,modules,guides}/*.md` and `plugins/opensips/skills/opensips-config/references/{3.5,3.6}/consolidated.json`.

- [ ] **Step 3: Verify new tree exists**

```bash
ls plugins/opensips/skills/opensips-config/references/3.5/
ls plugins/opensips/skills/opensips-config/references/3.6/
```

Expected: both list `cfg-format.md`, `ser-lineage-notes.md`, `core/`, `modules/`, `consolidated.json`. 3.6 also lists `guides/`.

- [ ] **Step 4: Verify idempotency**

```bash
npm run build
git diff --exit-code plugins/opensips/skills/opensips-config/references/
```

Expected: exit 0. A second build produces no diff.

- [ ] **Step 5: Commit the regenerated output**

```bash
git add plugins/opensips/skills/opensips-config/references/
git commit -m "build(opensips-config): regenerate references under unified skill"
```

---

## Phase 4 — Remove old skill directories

### Task 9: Remove the old `opensips-routing/` and `opensips-modules/` skill directories

**Files:**
- Delete: `plugins/opensips/skills/opensips-routing/` (entire tree)
- Delete: `plugins/opensips/skills/opensips-modules/` (entire tree)

These have been emptied by the move and rebuild. The remaining content (old SKILL.md files and any stale `.gitkeep`) is no longer referenced.

- [ ] **Step 1: Delete the routing skill directory**

```bash
git rm -r plugins/opensips/skills/opensips-routing
```

- [ ] **Step 2: Delete the modules skill directory**

```bash
git rm -r plugins/opensips/skills/opensips-modules
```

- [ ] **Step 3: Verify the new tree is the only remaining skill plus the advisor**

```bash
ls plugins/opensips/skills/
```

Expected: `opensips-config  opensips-security-advisor`.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: remove old opensips-routing and opensips-modules skill directories"
```

---

## Phase 5 — Repurpose `build-module-index` to render `modules-index.md`

This is a small renderer that produces a hand-authored-style `references/{version}/modules-index.md` reference file from the consolidated index. The file holds the 200-row catalog plus the lookup-discipline procedures (`When a module is not in the index`, etc.) that previously lived inline in `opensips-modules/SKILL.md`.

### Task 10: Repurpose the renderer

**Files:**
- Modify: `scripts/build-module-index/index.ts` (new function: `renderModulesIndexMarkdown`)
- Modify: `scripts/build-module-index/cli.ts` (call the new renderer per version)

- [ ] **Step 1: Write a failing test for the new renderer**

Create or extend `tests/unit/build-module-index/index.test.ts` with a test that calls a new function `renderModulesIndexMarkdown(documents, version)` and asserts:

```ts
import { describe, it, expect } from "vitest";
import { renderModulesIndexMarkdown } from "../../../scripts/build-module-index/index.js";

describe("renderModulesIndexMarkdown", () => {
  it("emits a top-level heading, a stable index table, and the lookup-discipline section", () => {
    const docs = [
      { module_name: "tm", overview: "TM enables stateful processing." } as any,
      { module_name: "acc", overview: "Accounts transactions to backends." } as any,
    ];
    const md = renderModulesIndexMarkdown(docs, "3.6");
    expect(md).toContain("# OpenSIPs module index");
    expect(md).toMatch(/\| Module \| Purpose \| Reference file \|/);
    expect(md).toContain("`acc`");
    expect(md).toContain("`tm`");
    expect(md).toContain("references/{version}/modules/acc.md");
    expect(md).toContain("## When a module is not in the index");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run tests/unit/build-module-index/index.test.ts -t "renderModulesIndexMarkdown"
```

Expected: FAIL — `renderModulesIndexMarkdown` is not exported.

- [ ] **Step 3: Implement `renderModulesIndexMarkdown`**

In `scripts/build-module-index/index.ts`, add an exported function that composes the rendered file. The function reuses `buildModuleCatalogRows` and `renderModuleCatalogTable` for the table portion, then appends the hand-authored prose ("When a module is not in the index", "Lookup discipline", "What the per-module reference file contains", "Version-specific behavior") taken verbatim from the OLD `opensips-modules/SKILL.md` sections of the same names. Source the prose from the pre-merge file (in git history at HEAD~N) — do not paraphrase.

```ts
/**
 * Render the standalone modules-index reference file.
 *
 * Produces the per-version `references/{version}/modules-index.md` that
 * replaced the inline 200-row table in the old opensips-modules SKILL.md
 * per ADR-012.
 */
export function renderModulesIndexMarkdown(
  documents: ModuleDocument[],
  version: string,
): string {
  const rows = buildModuleCatalogRows(documents);
  const table = renderModuleCatalogTable(rows);

  const header = `# OpenSIPs module index\n\nGenerated reference for OpenSIPs ${version}. Lists every module with a one-line purpose and the path to its full per-module reference file.\n\nThe \`{version}\` placeholder in the reference paths is resolved at read time per the version-resolution protocol (ADR-003).\n`;

  // Source the prose body from the OLD opensips-modules/SKILL.md sections.
  // The exact text is preserved verbatim per the design: ADR-012 moves
  // these procedures from SKILL.md to a reference file, but does not edit
  // their content.
  const prose = [
    "## How to use this file",
    "...", // Source from old opensips-modules/SKILL.md "How to use this skill" section
    "## Lookup discipline",
    "...", // Source from old opensips-modules/SKILL.md "Lookup discipline" section
    "## What the per-module reference file contains",
    "...", // Source from old opensips-modules/SKILL.md same section
    "## Version-specific behavior",
    "...", // Source from old opensips-modules/SKILL.md same section
    "## When a module is not in the index",
    "...", // Source from old opensips-modules/SKILL.md "When a module is not in the index" section
  ].join("\n\n");

  return `${header}\n## Module index\n\n${table}\n${prose}\n`;
}
```

The implementer must replace each `"..."` with the verbatim content from the old SKILL.md (recover it from git: `git show HEAD~5:plugins/opensips/skills/opensips-modules/SKILL.md` adjusting the revision as needed; or refer to the current file before deletion in Task 9 by running this task BEFORE Task 9).

**Order note:** Tasks 10–12 should run BEFORE Task 9 if recovering prose from the live file is preferred, or AFTER Task 9 if recovering from git history. The plan writes them after for narrative clarity but the executor may reorder.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run tests/unit/build-module-index/index.test.ts -t "renderModulesIndexMarkdown"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-module-index/index.ts tests/unit/build-module-index/index.test.ts
git commit -m "feat(build-module-index): add renderModulesIndexMarkdown for ADR-012"
```

---

### Task 11: Wire the new renderer into the build pipeline (per-version)

**Files:**
- Modify: `scripts/build-module-index/cli.ts` (replace transitional no-op with per-version writes)
- Modify: `scripts/lib/orchestrator-helpers.ts` (alternative: integrate into the main orchestrator)

Choice: keep the standalone CLI (`npm run build:skills`) but have it write per-version files. Alternatively, fold the modules-index render into the main orchestrator so `npm run build` handles it. Recommendation: fold into the main orchestrator — one build entry point is simpler and matches the rest of the rendering pipeline.

- [ ] **Step 1: Add a `renderModulesIndexForVersion` helper in `orchestrator-helpers.ts`**

Mirror the shape of `renderCoreForVersion`. It calls `renderModulesIndexMarkdown(modules, version)` from `scripts/build-module-index/index.ts`, validates the rendered Markdown, and writes to `<outputRoot>/opensips-config/references/<version>/modules-index.md`.

- [ ] **Step 2: Call the new helper from `processVersion`**

After `renderCoreForVersion` and before the consolidated-index step, call `renderModulesIndexForVersion`. Add its `filesRendered` to the `filesRendered` accumulator.

- [ ] **Step 3: Remove the transitional no-op from `cli.ts`**

Either delete `scripts/build-module-index/cli.ts` and remove the `build:skills` script from `package.json`, OR keep the CLI as a thin wrapper that runs the same logic for a single version.

Recommended: delete `cli.ts` and `package.json`'s `build:skills` script. The orchestrator now owns the step. Update `package.json`:

```json
"build:skills": "tsx scripts/build-module-index/cli.ts",
```

becomes (delete the line entirely).

- [ ] **Step 4: Run the build**

```bash
npm run build
```

Expected: a new `modules-index.md` appears under `plugins/opensips/skills/opensips-config/references/{3.5,3.6}/`. Build is idempotent.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/orchestrator-helpers.ts scripts/build-module-index/ package.json plugins/opensips/skills/opensips-config/references/
git commit -m "feat(build): render modules-index.md per version under opensips-config"
```

---

## Phase 6 — Update the security advisor's cross-references

### Task 12: Collapse advisor cross-reference paths to the unified skill

**Files:**
- Modify: `plugins/opensips/skills/opensips-security-advisor/SKILL.md`

- [ ] **Step 1: Replace cross-reference paths**

In SKILL.md, replace each occurrence of `../opensips-modules/references/{version}/` and `../opensips-routing/references/{version}/` with `../opensips-config/references/{version}/`. Six paths total in the "Cross-project guardrail" and "Integration contract" sections.

Also update the prose under "Defer to sibling skills":

```markdown
- `opensips-routing` for authoring or editing route logic that is not driven by a security finding.
- `opensips-modules` for looking up module exports, function signatures, or parameter ranges.
```

becomes:

```markdown
- `opensips-config` for authoring, editing, or looking up exports — module reference, route logic, pseudo-variables, transformations, and global parameters all live there.
```

And in "Working with sibling skills" the bulleted list:

```markdown
- `opensips-routing` — authoring SIP routing logic for OpenSIPs.
- `opensips-modules` — authoritative per-module reference data.
- `opensips-security-advisor` — security review of OpenSIPs configurations (this skill).
```

becomes:

```markdown
- `opensips-config` — authoring, editing, and per-module reference for OpenSIPs configurations.
- `opensips-security-advisor` — security review of OpenSIPs configurations (this skill).
```

The opening line of the Overview ("It is one of three coordinated skills") becomes "It is one of two coordinated skills".

The ADR-005 link in the Overview ("authored separately by a security-focused agent (per [ADR-005]...)") becomes a link to ADR-012.

- [ ] **Step 2: Verify all reference paths resolve**

```bash
for p in $(grep -oE '\.\./opensips-config/references/[^ )]+' plugins/opensips/skills/opensips-security-advisor/SKILL.md); do
  # Resolve {version} → 3.6 for the existence check
  resolved="plugins/opensips/skills/${p:3}"
  resolved_36=$(echo "$resolved" | sed 's|{version}|3.6|g')
  if [[ "$resolved_36" == *'*'* ]]; then continue; fi
  test -e "$resolved_36" && echo "OK: $resolved_36" || echo "MISSING: $resolved_36"
done
```

Expected: all paths resolve (no `MISSING:` lines).

- [ ] **Step 3: Commit**

```bash
git add plugins/opensips/skills/opensips-security-advisor/SKILL.md
git commit -m "refactor(opensips-security-advisor): collapse cross-refs to opensips-config"
```

---

## Phase 7 — Update tests

### Task 13: Update integration tests that assert old skill paths

**Files:**
- Modify: `tests/unit/orchestrator-modules.integration.test.ts`
- Modify: `tests/unit/orchestrator-core-guides.integration.test.ts`
- Modify: `tests/unit/orchestrator-consolidated.integration.test.ts`
- Modify: `tests/e2e/full-pipeline.test.ts`
- Modify: `tests/e2e/version-isolation.test.ts`
- Modify: `tests/unit/build-module-index/index.test.ts`

Each test references the old skill paths in expectations. The expected outputs must change to `opensips-config/references/...`.

- [ ] **Step 1: Run the test suite to surface every failure**

```bash
npm test
```

Expected: failures in the six files above due to path mismatches.

- [ ] **Step 2: Update each test's path expectations**

In each file, replace `opensips-modules/references` and `opensips-routing/references` with `opensips-config/references`. Search and replace, then audit each replacement to ensure context is preserved (some tests intentionally cover old-skill behaviour and need their assertions rewritten, not just path-substituted).

For `tests/unit/build-module-index/index.test.ts`, the test that asserts the inline-marker injection behaviour against `opensips-modules/SKILL.md` is no longer valid (the SKILL.md no longer has the inline table). Replace with the new `renderModulesIndexMarkdown` test added in Task 10. The `injectModuleIndex` helper itself can stay (it's pure-function utility) but its callers may be removed.

- [ ] **Step 3: Run the test suite again**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/
git commit -m "test: align integration and golden tests with opensips-config layout"
```

---

### Task 14: Update golden-path demos

**Files:**
- Modify: `docs/testing/golden-path-demos.md`

The demos reference the old skill names in trigger expectations and reference paths.

- [ ] **Step 1: Update skill names in demo prompts and expected behaviour**

Replace `opensips-routing` and `opensips-modules` skill activation expectations with `opensips-config`. Update reference path citations.

- [ ] **Step 2: Run golden-path tests**

```bash
npm run test:golden
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add docs/testing/golden-path-demos.md
git commit -m "docs(testing): update golden-path demos for opensips-config"
```

---

## Phase 8 — Update project documentation

### Task 15: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the "What this project is" section**

Replace "ships three coordinated Agent Skills" with "ships two coordinated Agent Skills".

The bulleted list:

```markdown
1. **`opensips-routing`** — authors and reviews `opensips.cfg` route scripts.
2. **`opensips-modules`** — version-aware reference library for OpenSIPs modules.
3. **`opensips-security-advisor`** — scaffold for a security-review skill authored by a separate agent.
```

becomes:

```markdown
1. **`opensips-config`** — authors and edits `opensips.cfg` files; provides version-aware module reference data; teaches the cfg file structure and the loadmodule-scan workflow.
2. **`opensips-security-advisor`** — scaffold for a security-review skill authored by a separate agent.
```

- [ ] **Step 2: Update the "Repository layout" diagram**

Replace the `plugins/opensips/skills/` block to match Task 5's new layout (single `opensips-config/` skill plus `opensips-security-advisor/`).

- [ ] **Step 3: Update "How to find what you need"**

Any reference to the old skill names in this section becomes `opensips-config`. The "I need to update a SKILL.md" entry stays — there are now two SKILL.md files instead of three.

- [ ] **Step 4: Update "Architecture at a glance"**

The downstream-project subtree diagram shows "opensips-modules/references" and "opensips-routing/references". Collapse to a single `opensips-config/references/` block. The "Hand-authored vs. generated" lists update accordingly: hand-authored is now SKILL.md (one), `cfg-format.md` (new), `ser-lineage-notes.md` (one); generated is `core/*.md`, `modules/*.md`, `guides/*.md`, `modules-index.md` (new), `consolidated.json`.

- [ ] **Step 5: Update "Common tasks"**

Update `npm run build` description if behaviour changed. Update `claude --plugin-dir ./plugins/opensips` example if the plugin structure changed (it didn't — `plugin.json` location is the same).

- [ ] **Step 6: Update "Rules for changing things"**

Rule 1 ("Never hand-edit generated files") references skill paths — update to the new layout. Rule 8 ("The three skills do not write to each other's directories") becomes "The two skills do not write to each other's directories" with the bulleted list reduced.

- [ ] **Step 7: Update "For Claude Code specifically"**

Item 4 ("When the user wants to change how things render") references `scripts/render-*.ts` — unchanged. Item 5 ("When the user wants to change a SKILL.md") still applies. Update count of SKILL.md files mentioned anywhere.

- [ ] **Step 8: Update package.json description**

In `package.json`:

```json
"description": "Claude Code plugin: three coordinated Agent Skills for working with OpenSIPs",
```

becomes:

```json
"description": "Claude Code plugin: two coordinated Agent Skills for working with OpenSIPs (configuration + security review)",
```

- [ ] **Step 9: Update plugin.json description**

In `plugins/opensips/.claude-plugin/plugin.json`, the description currently says "authoring + per-module reference + security review". Tighten to:

```json
"description": "OpenSIPs Skills: authoring, per-module reference, and security review for OpenSIPs SIP server configurations.",
```

(No change required — the description is generic enough. Verify and skip if unchanged.)

- [ ] **Step 10: Commit**

```bash
git add CLAUDE.md package.json plugins/opensips/.claude-plugin/plugin.json
git commit -m "docs(claude): update repo-level docs for two-skill architecture (ADR-012)"
```

---

### Task 16: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the skill list**

Wherever README.md enumerates the three skills, collapse to two. Wherever it describes the routing or modules skill, describe `opensips-config` instead. Preserve the security-advisor description.

- [ ] **Step 2: Verify no stale references**

```bash
grep -n "opensips-routing\|opensips-modules" README.md
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): update skill list for opensips-config (ADR-012)"
```

---

### Task 17: Update `docs/requirements.md`, `docs/vision.md`, `docs/usage-guide.md`

**Files:**
- Modify: `docs/requirements.md`
- Modify: `docs/vision.md`
- Modify: `docs/usage-guide.md`

- [ ] **Step 1: Update each file**

For each, replace references to the three-skill architecture with the two-skill architecture. Where the file describes what `opensips-routing` or `opensips-modules` does, describe `opensips-config` instead. Keep `opensips-security-advisor` mentions intact.

- [ ] **Step 2: Verify**

```bash
grep -n "opensips-routing\|opensips-modules" docs/requirements.md docs/vision.md docs/usage-guide.md
```

Expected: no matches (except possibly in historical "previously known as" callouts if the document needs them; otherwise none).

- [ ] **Step 3: Commit**

```bash
git add docs/requirements.md docs/vision.md docs/usage-guide.md
git commit -m "docs: update requirements/vision/usage-guide for ADR-012"
```

---

### Task 18: Update architecture documents

**Files:**
- Modify: `docs/architecture/data-pipeline.md`
- Modify: `docs/architecture/rendering-templates.md`
- Modify: `docs/architecture/skill-authoring-guide.md`

- [ ] **Step 1: `data-pipeline.md`**

The pipeline diagram under "Architecture at a glance" shows two output subtrees. Collapse to one. The "Output paths" reference table updates: all `opensips-modules/...` and `opensips-routing/...` paths become `opensips-config/...`. Add `cfg-format.md` (hand-authored) and `modules-index.md` (generated) to the output inventory.

- [ ] **Step 2: `rendering-templates.md`**

Update output-path references and section headings that name the old skills.

- [ ] **Step 3: `skill-authoring-guide.md`**

The guide currently teaches how to write three SKILL.md files. Now it teaches how to write the unified `opensips-config/SKILL.md` plus the security-advisor SKILL.md. Reflect the merger and add a section on the cfg-format reference (hand-authored, version-isolated).

- [ ] **Step 4: Verify and commit**

```bash
grep -n "opensips-routing\|opensips-modules" docs/architecture/data-pipeline.md docs/architecture/rendering-templates.md docs/architecture/skill-authoring-guide.md
```

Expected: matches only inside historical/archived sections that explicitly reference ADR-005's prior decomposition (those are fine and should not be edited away).

```bash
git add docs/architecture/data-pipeline.md docs/architecture/rendering-templates.md docs/architecture/skill-authoring-guide.md
git commit -m "docs(architecture): update for two-skill layout (ADR-012)"
```

---

### Task 19: Update `docs/testing/test-strategy.md` and `docs/testing/acceptance-criteria.md`

**Files:**
- Modify: `docs/testing/test-strategy.md`
- Modify: `docs/testing/acceptance-criteria.md`

- [ ] **Step 1: Update both**

Replace skill-name references with `opensips-config`. Where acceptance criteria reference per-skill triggers ("`opensips-routing` activates on..."), collapse to `opensips-config` triggers covering authoring + lookup. Add a new acceptance criterion for the loadmodule-scan workflow:

> When a user provides an opensips.cfg fragment plus a question, the skill (a) reads `cfg-format.md`, (b) reads `consolidated.json`, and (c) reads the per-module `.md` for each loadmodule referenced by the question, before answering. Verified by golden-path demo `<demo-name>`.

- [ ] **Step 2: Commit**

```bash
git add docs/testing/test-strategy.md docs/testing/acceptance-criteria.md
git commit -m "docs(testing): update strategy and acceptance criteria for ADR-012"
```

---

## Phase 9 — Final verification

### Task 20: Whole-pipeline verification

- [ ] **Step 1: Clean and rebuild**

```bash
npm run clean
npm run build
```

Expected: build succeeds; output appears under `plugins/opensips/skills/opensips-config/references/{3.5,3.6}/`.

- [ ] **Step 2: Idempotency check**

```bash
npm run build
git diff --exit-code
```

Expected: exit 0.

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Run golden-path demos**

```bash
npm run test:golden
```

Expected: PASS.

- [ ] **Step 5: Run e2e tests**

```bash
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 6: Lint and format check**

```bash
npm run lint
npm run format:check
```

Expected: PASS.

- [ ] **Step 7: Verify the plugin loads in Claude Code**

This is a manual smoke test. The user runs:

```bash
claude --plugin-dir ./plugins/opensips
```

In the session:

```
/plugin list
```

Expected: lists `opensips-config` and `opensips-security-advisor` (two skills).

```
/reload-plugins
```

Expected: no errors.

The user then issues an authoring prompt ("write me a basic opensips.cfg with a registrar") and verifies that the skill activates, reads `cfg-format.md` and `consolidated.json` (Claude reports its Reads), and produces a correct config. Then a lookup prompt ("what does `t_relay` return in 3.6?") and verifies that the skill resolves via `consolidated.json` then reads `modules/tm.md`.

- [ ] **Step 8: Final commit (if any docs adjustments emerged)**

If steps 7's manual smoke test surfaces final adjustments, fix and commit. Otherwise, no commit needed.

```bash
git status
```

Expected: clean working tree.

---

## Self-review checklist (executed before merge)

- [ ] Every spec section has a corresponding task.
- [ ] No `TBD`, `TODO`, `implement later`, or vague placeholders in the plan.
- [ ] Every step that changes code shows the code.
- [ ] Every command shows expected output.
- [ ] Type signatures referenced in later tasks match what earlier tasks define.
- [ ] All cross-references to ADR-005, ADR-012, and design spec resolve.
- [ ] Idempotency check (`npm run build` twice → no diff) is in the plan.
- [ ] Manual smoke test is in the plan.
