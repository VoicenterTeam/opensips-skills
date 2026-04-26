<p align="center"><img src="OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Requirements Document

## OpenSIPs Claude Agent Skill Plugin

**Document status:** Scope-locked, v2.0
**Supersedes:** v1.0
**Scope lock:** Routing skill + Modules skill + Security-advisor integration point. No C-module development skill, no Docker dev arena, no autonomous testing loop.

---

## 1. Executive Summary

### 1.1 The problem

Large Language Models hallucinate when asked to write OpenSIPs configuration. The root cause is that training data blends OpenSIPs syntax with syntax from other projects descending from the SIP Express Router lineage, producing output that looks correct but silently mixes idioms across projects and across versions. An engineer asking an off-the-shelf LLM to "write me an opensips.cfg that does X" reliably receives output that is 70–90% correct and 10–30% silently wrong.

### 1.2 The solution

A **Claude Code plugin** containing two coordinated **Agent Skills** that teach Claude how to author OpenSIPs scripts correctly, using only OpenSIPs-authoritative knowledge, version-pinned to the release the user is targeting. The plugin enables **"vibe routing"**: a developer describes what they want the proxy to do, and Claude produces a valid `opensips.cfg` that references only real OpenSIPs modules, parameters, functions, and pseudo-variables for the requested version.

### 1.3 In scope

1. **`opensips-config`** — unified authoring and reference skill covering route blocks, core syntax, pseudo-variables, transformations, operators, statements, flags, async statements, cfg file structure, loadmodule-scan workflow, and the full per-module reference library. Includes guardrails against non-OpenSIPs idioms.
2. **`opensips-security-advisor`** — minimal scaffold/integration point for a security-review skill being authored separately. It must plug into the same plugin manifest and share the reference-file conventions.
4. Version awareness for **OpenSIPs 3.5 and 3.6 LTS** (the versions currently covered by the extraction pipeline).
5. Claude Code plugin distribution via `.claude-plugin/marketplace.json`.

### 1.4 Out of scope

- C module development skill (future phase).
- Docker dev arena (future phase).
- Autonomous SIPp/SIPssert testing loop (future phase).
- RAG / vector embeddings (not needed — documentation is pre-structured JSON).
- Claude.ai web and API targets (Claude Code only, because we require skill hot-reload, local filesystem access, and `--plugin-dir` for development).
- Version-delta reasoning (each version is treated as its own isolated world).

---

## 2. Goals and Non-Goals

### 2.1 Primary goal

**Zero-hallucination route-script authoring for OpenSIPs 3.5 and 3.6.** Every function name, parameter name, pseudo-variable, transformation, operator, and route-block keyword that Claude emits must exist in the target OpenSIPs version and must not be an idiom imported from another SER-lineage project.

### 2.2 Secondary goal

**Comprehensive module reference library, progressively disclosed.** The loadmodule-scan workflow lets Claude read `cfg-format.md` and `consolidated.json` upfront, then load exactly one per-module reference file per `loadmodule` directive that the question touches. This avoids the tool-selection accuracy cliff documented in retrieval-augmented tool-use research (accuracy collapses to ~13% at large catalogs without retrieval), and the ~56% skill non-invocation rate observed in multi-skill evaluations.

### 2.3 Tertiary goal

**Clean integration point for the security-advisor skill.** A separate agent authors `opensips-security-advisor`. The plugin must reserve its directory, give it a stable way to read the reference files produced by this project, and ensure its frontmatter triggers do not collide with `opensips-config`.

### 2.4 Non-goals

| # | Non-goal | Rationale |
|---|----------|-----------|
| NG-1 | C module development workflows | Large separate surface; deferred to a future release. |
| NG-2 | Docker/dockerized OpenSIPs arena | Deferred to a future release. |
| NG-3 | Automated SIPp/SIPssert test loop | Deferred to a future release. |
| NG-4 | RAG / embeddings / vector DB | Unnecessary for structured JSON corpus. |
| NG-5 | Supporting OpenSIPs 2.x, 1.x | Not in the extraction corpus. |
| NG-6 | Cross-version reasoning | Version-isolated; one version at a time. |
| NG-7 | Embedded Lua/Python via script languages | Not the common case. |
| NG-8 | `opensips-cli` live MI diagnostics | Deferred to a future release. |

---

## 3. Target Users and User Journeys

### 3.1 Primary persona

A SIP/VoIP engineer (carrier, ITSP, contact center, CPaaS) who is fluent in OpenSIPs concepts but uses Claude Code as a pair-programmer for day-to-day `opensips.cfg` authoring, review, and refactoring. They maintain configs with mixed-version production fleets and would rather ship a working `route[AUTH]` block in 60 seconds than fight a hallucinating LLM for 20 minutes.

### 3.2 Three canonical user journeys

**Journey A — "Help me write a route script that does X"**

User prompt: *"I need a request_route that does basic UA registration with digest auth against a MySQL subscriber table, and relays calls through the dispatcher to a pool of gateways."*

Expected flow:
1. `opensips-config` frontmatter matches on "request_route", "registration", "route script" → SKILL.md body loads.
2. Body instructs Claude that this is an OpenSIPs task and directs Claude to read `references/{version}/cfg-format.md` for the cfg structure, then `consolidated.json` for the module index, then `references/{version}/core/routes.md`, `functions.md`, and `ser-lineage-notes.md`.
3. Because the user mentions `dispatcher`, `auth_db`, `registrar`, `usrloc`, and `tm` implicitly, the skill loads the corresponding per-module reference files.
4. Claude composes a cfg using only items listed in those files, for the user's pinned version (resolution protocol in §4.3).

**Journey B — "How do I configure the Y module?"**

User prompt: *"Configure the dispatcher module for weighted round-robin with health probes."*

Expected flow:
1. `opensips-config` frontmatter matches on "dispatcher module" → SKILL.md body loads.
2. The skill reads `consolidated.json` to locate `dispatcher`, then reads `references/{version}/modules/dispatcher.md`.
3. Claude produces a `modparam("dispatcher", …)` block and `ds_select_dst(…)` call using only the exact parameter names, algorithm values, and function signatures documented for the active version.

**Journey C — "Is this config block correct for version Z?"**

User prompt: *"Here's my opensips.cfg — I'm targeting 3.6. Does it look right?"*

Expected flow:
1. `opensips-config` matches on "opensips.cfg".
2. Skill body instructs Claude to read `cfg-format.md` first, then `consolidated.json`, then only `references/3.6/…` per-module files for each `loadmodule` referenced. Claude flags any identifier in the user's config that is not present in the 3.6 reference set.
3. Claude returns an annotated review with per-line rationale and citations to the relevant reference files.

---

## 4. High-Level Architecture

### 4.1 The two skills and how they interact

```
                    ┌────────────────────────────────┐
                    │   Claude Code (user session)   │
                    └────────────────┬───────────────┘
                                     │ user prompt
                    ┌────────────────┼────────────────┐
                    ▼                                  ▼
      ┌──────────────────────────┐      ┌──────────────────────────┐
      │     opensips-config      │      │  opensips-security-      │
      │  (authoring + reference) │      │  advisor (scaffold)      │
      │                          │      │                          │
      │  SKILL.md +              │      │  SKILL.md (frontmatter   │
      │  cfg-format.md +         │      │  placeholder only)       │
      │  core references +       │      │                          │
      │  per-module files +      │      │  reads opensips-config   │
      │  consolidated.json +     │      │  references read-only    │
      │  search script           │      │                          │
      └────────────┬─────────────┘      └──────────────────────────┘
                   │
                   ▼
    opensips-config/references/{version}/
      cfg-format.md          ← hand-authored
      ser-lineage-notes.md   ← hand-authored
      modules-index.md       ← generated
      consolidated.json      ← generated from data/processed/{version}/
      core/*.md              ← generated
      modules/*.md           ← generated
      guides/*.md            ← generated (3.6+)
```

**Progressive-disclosure contract:**
- **Turn 0 (metadata load):** Claude Code loads only frontmatter (`name` + `description`) of both skills. Total ~60 lines, <400 tokens.
- **Turn 1 (skill trigger):** If user prompt matches a skill's description, Claude invokes it and the SKILL.md body is injected.
- **Turn 2+ (reference pull):** SKILL.md instructs Claude to Read specific reference files by relative path. Only those enter the context window. For cfg work: `cfg-format.md` → `consolidated.json` → per-module files.

### 4.2 Plugin distribution

A single Git repository (`opensips-claude-plugin`) functions as a Claude Code plugin marketplace. The `.claude-plugin/marketplace.json` at the repo root declares one plugin (`opensips`) bundling both skills.

Install:
```
/plugin marketplace add OpenSIPS/opensips-claude-plugin
/plugin install opensips@opensips-claude-plugin
```

### 4.3 Version awareness

Version resolution order (first match wins):
1. User explicit statement in prompt (`"for OpenSIPs 3.6"`).
2. `$OPENSIPS_VERSION` environment variable.
3. `.opensips-version` file in Claude Code's working directory.
4. Output of `opensips -V` if on PATH.
5. Default: **3.6**.

The active version string is injected into Claude's reasoning near the top of SKILL.md. All reference paths in the skill body use `{version}` as a placeholder Claude substitutes at Read time.

---

## 5. Data Pipeline Architecture

### 5.1 The two-project split

Two repositories, clean boundary:

**Upstream (existing): `opensips-docs-collector`**
- Extracts OpenSIPs documentation per version using an LLM agent.
- Validates against Zod schemas (18 schema files covering `BaseDocument`, `ModuleDocument` with 8 partial section schemas, and 13 core document types).
- Outputs to `data/processed/{version}/core/*.json` and `data/processed/{version}/modules/*.json`.
- Version-isolated; no cross-version reasoning.

**Downstream (this project): `opensips-claude-plugin`**
- Consumes `data/processed/` output from the upstream project.
- Build script renders Markdown reference files Claude reads at runtime.
- Build script also produces a `consolidated.json` per version as a fast lookup index.
- Ships both the source JSON (for traceability) and the generated artifacts (so users need no build step to install).

### 5.2 Input layout (from extraction project)

```
data/processed/
├── 3.5/
│   ├── core/
│   │   ├── async.json
│   │   ├── events.json
│   │   ├── flags.json
│   │   ├── functions.json        # core_function documents
│   │   ├── mi_commands.json
│   │   ├── operators.json
│   │   ├── parameters.json       # core_parameter documents
│   │   ├── routes.json           # route_type documents
│   │   ├── statements.json
│   │   ├── statistics.json
│   │   ├── transformations.json
│   │   └── variables.json        # core_variable documents
│   └── modules/
│       ├── aaa_diameter.json
│       ├── aaa_radius.json
│       ├── acc.json
│       ├── ...
│       ├── tm.json
│       └── ...
└── 3.6/
    └── (same structure)
```

Each JSON file conforms to a schema derived from `BaseDocument` plus a type-specific extension (`ModuleDocument`, `CoreVariableDocument`, etc.).

### 5.3 Build pipeline

Build script: `scripts/build-references.ts` (Node.js/TypeScript, reuses extraction project's Zod schemas).

Flow per version:

```
┌──────────────────────────┐
│ data/processed/{version} │
│   ├─ core/*.json         │
│   └─ modules/*.json      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Zod validation           │
│ (fail fast on drift)     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Two rendering modes      │
├──────────────────────────┤
│ A. Per-item (modules)    │──► skills/opensips-config/
│                          │      references/{version}/modules/*.md
│ B. Aggregated (core)     │──► skills/opensips-config/
│                          │      references/{version}/core/*.md
│ C. Aggregated (guides)   │──► skills/opensips-config/
│                          │      references/{version}/guides/*.md
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Index generation         │
├──────────────────────────┤
│ consolidated.json        │──► skills/opensips-config/
│ (functionsByName,        │      references/{version}/
│  parametersByModule,     │        consolidated.json
│  variablesByName,        │
│  miCommandsByName)       │
├──────────────────────────┤
│ modules-index.md         │──► skills/opensips-config/
│ (module catalog table +  │      references/{version}/
│  lookup-discipline prose)│        modules-index.md
└──────────────────────────┘
```

**Rendering mode A — per-item** applies to `ModuleDocument` only. Each module JSON becomes one Markdown file. The consolidated index and modules-index catalog map module names to these files.

**Rendering mode B — aggregated** applies to all 13 core document types. Each core JSON file contains many items (e.g., `variables.json` contains 60+ variables); the whole file renders to one Markdown file (`variables.md`). Users and Claude consult these as category references, not per-item.

**Rendering mode C — aggregated guides** applies to installation/configuration/syntax guides where present (3.6+). Renders alongside core under `guides/`.

**Consolidated index** is one build output. Not a replacement for the Markdown files — an accompaniment. It gives Claude O(1) lookups by name across all modules and core items, without having to parse Markdown — a function name resolves to its source module via `indexes.functionsByName`, a pseudo-variable via `indexes.variablesByName`, and so on. A future helper script (`module_search.py`, planned but not yet shipped) will expose the same lookups from the command line for non-Claude consumers. Schema matches the `ConsolidatedDocument` type from the extraction project's schemas, built downstream rather than upstream since extraction never produced it.

**`modules-index.md`** is a generated standalone reference file replacing the former inline module catalog that lived in `opensips-modules/SKILL.md`. It holds the module catalog table plus lookup-discipline prose for the `opensips-config` skill.

### 5.4 What's committed to git

Both `source/` (copy of `data/processed/` at the time of the last build) and the generated `skills/*/references/` trees are committed. Rationale:
- Users cloning the plugin don't need a build step.
- Git diffs show both structural changes (source) and rendered changes (output) in every PR — helpful for review.
- The `source/` copy is what was built against, creating a traceable audit trail if extraction output changes.

---

## 6. Folder Structure

```
opensips-claude-plugin/
├── .claude-plugin/
│   └── marketplace.json
├── .gitignore
├── LICENSE                               # GPL-3.0
├── README.md
├── CHANGELOG.md
├── package.json                          # Node build tooling
├── tsconfig.json
├── source/                               # Copy of extraction output at last build
│   ├── 3.5/
│   │   ├── core/*.json
│   │   └── modules/*.json
│   └── 3.6/
│       └── (same)
├── scripts/
│   ├── build-references.ts               # Main build entry point
│   ├── render-module.ts                  # Per-item renderer
│   ├── render-core.ts                    # Aggregated renderer
│   ├── build-consolidated.ts             # Index builder
│   └── schemas/                          # Zod schemas (mirrored from extraction)
│       ├── base.ts
│       ├── module.ts
│       ├── core-variables.ts
│       ├── (...one per doc type...)
│       └── consolidated.ts
└── plugins/
    └── opensips/
        ├── .claude-plugin/
        │   └── plugin.json
        ├── README.md
        └── skills/
            ├── opensips-config/
            │   ├── SKILL.md              # Hand-authored (workflow + reference)
            │   ├── references/
            │   │   ├── 3.5/
            │   │   │   ├── cfg-format.md             # Hand-authored
            │   │   │   ├── ser-lineage-notes.md      # Hand-authored
            │   │   │   ├── modules-index.md          # Generated
            │   │   │   ├── consolidated.json         # Generated index
            │   │   │   ├── core/
            │   │   │   │   ├── async.md              # Generated
            │   │   │   │   ├── events.md
            │   │   │   │   ├── flags.md
            │   │   │   │   ├── functions.md
            │   │   │   │   ├── mi-commands.md
            │   │   │   │   ├── operators.md
            │   │   │   │   ├── parameters.md
            │   │   │   │   ├── routes.md
            │   │   │   │   ├── statements.md
            │   │   │   │   ├── statistics.md
            │   │   │   │   ├── transformations.md
            │   │   │   │   └── variables.md
            │   │   │   └── modules/
            │   │   │       ├── aaa_diameter.md       # Generated
            │   │   │       ├── acc.md
            │   │   │       ├── ...
            │   │   │       └── tm.md
            │   │   └── 3.6/
            │   │       └── (same structure + guides/)
            │   └── scripts/                          # Planned (not yet shipped)
            │       └── module_search.py              # Planned: CLI over consolidated.json
            └── opensips-security-advisor/
                └── SKILL.md              # Scaffold — populated by separate agent
```

---

## 7. File-by-File Specification

For each file: **purpose · contents · format · size · update cadence**.

### 7.1 Root-level files

#### `/.claude-plugin/marketplace.json`
- **Purpose:** Marketplace manifest read by Claude Code on `/plugin marketplace add`.
- **Contents:** `$schema`, `name`, `version`, `description`, `owner`, `plugins[]` (single entry: `name: "opensips"`, `source: "./plugins/opensips"`, `version`, `description`, `category: "development"`).
- **Format:** JSON.
- **Size:** ~25–40 lines.
- **Cadence:** Bump `version` on each release.

#### `/README.md`
- **Purpose:** Repo landing page.
- **Contents:** Problem statement, install snippet, architecture diagram, GPL-3.0 notice, pointer to the extraction project as upstream source-of-truth.
- **Format:** GitHub-rendered Markdown.
- **Size:** ~150–250 lines.

#### `/LICENSE`
- **Purpose:** GPL-3.0 to match OpenSIPs upstream.

#### `/CHANGELOG.md`
- **Purpose:** Keep-a-Changelog format.

#### `/package.json` and `/tsconfig.json`
- **Purpose:** Node.js build tooling. Declares `build`, `validate`, `clean` scripts.
- **Build command:** `npm run build` → runs `scripts/build-references.ts` for all versions in `source/`.
- **Validation command:** `npm run validate` → runs Zod validation without rendering, for CI.

### 7.2 Plugin manifest

#### `/plugins/opensips/.claude-plugin/plugin.json`
- **Purpose:** Plugin-level manifest.
- **Contents:** `name: "opensips"`, `version`, `description`, `author`, `homepage`, `repository`, `license`. Skills are auto-discovered from `skills/`.
- **Size:** ~20–30 lines.

### 7.3 Build scripts

#### `/scripts/build-references.ts`
- **Purpose:** Main build entry. Walks `source/{version}/`, validates JSON against Zod schemas, dispatches to per-item or aggregated renderer, writes output to `plugins/opensips/skills/*/references/{version}/`.
- **Contents:**
  - Version discovery (directory listing under `source/`).
  - Per-version orchestration: validate → render core (12 aggregated files) → render modules (N per-item files) → build consolidated index.
  - Fail-fast on schema validation errors.
  - Idempotent: running twice produces byte-identical output.
- **Size:** ~200 lines.
- **Cadence:** Updated whenever the schema or rendering logic changes.

#### `/scripts/render-module.ts`
- **Purpose:** Per-item renderer. Takes a `ModuleDocument`, emits Markdown matching the template in `_TEMPLATE.md`.
- **Contents:**
  - Frontmatter generation (module_name, versions_supported, category, dependencies).
  - Section rendering: Overview, Dependencies, Parameters, Functions, Pseudo-Variables, Statistics, MI Functions, Events, Examples.
  - Handles optional sections by emitting "None." placeholders when arrays are empty.
- **Size:** ~300 lines.

#### `/scripts/render-core.ts`
- **Purpose:** Aggregated renderer. Takes a `CoreVariableDocument`, `OperatorDocument`, etc., emits one Markdown file per input.
- **Contents:**
  - Table-of-contents header with all item names.
  - One H2 section per item.
  - Per doc type, a specialized rendering function (variables render differently from operators, operators differently from route types).
- **Size:** ~400 lines (12 render functions × ~30 lines each).

#### `/scripts/build-consolidated.ts`
- **Purpose:** Generates `consolidated.json` per version.
- **Contents:**
  - Flatten all modules and core items into unified indexes.
  - `functionsByName` — every core function + every module's exported functions.
  - `parametersByModule` — module name → list of parameter names.
  - `variablesByName` — every core variable + every module's exported pseudo-variables.
  - `miCommandsByName` — every MI command from every source.
  - Statistics block at top (totals).
  - Relationships block (moduleDependencies from each module's JSON).
- **Size:** ~200 lines.
- **Output:** `plugins/opensips/skills/opensips-config/references/{version}/consolidated.json`.

#### `/scripts/schemas/*.ts`
- **Purpose:** Zod schema definitions mirrored from the extraction project. Copied, not imported, to keep the two projects decoupled.
- **Contents:** One file per doc type, using `z.strict()` as specified in the extraction project's README.
- **Size:** ~50–100 lines each.
- **Cadence:** Updated when the extraction project's schemas change. A CI check ensures the copied schemas match the extraction project's current versions.

### 7.4 The `opensips-config` skill

#### `skills/opensips-config/SKILL.md`
- **Purpose:** Single entry point for all OpenSIPs configuration work — authoring, editing, and per-module reference. Contains the loadmodule-scan workflow, procedural knowledge, and anti-hallucination guardrails inline.
- **Body outline:**
  1. Active version resolution (the protocol from §4.3).
  2. Cross-project guardrail (SER lineage awareness).
  3. The opensips.cfg workflow (read cfg-format.md → consolidated.json → per-module files).
  4. When to use this skill / when to defer to `opensips-security-advisor`.
  5. Route block decision catalog and routing decisions.
  6. Common tasks (registrar, stateful proxy, NAT, authentication, dispatcher).
  7. Module lookup procedure.
  8. References inventory.
  9. Working with sibling skill.
- **Hand-authored:** Yes. Procedural knowledge and workflow structure cannot come from extraction.
- **Size:** 300–450 lines.
- **Cadence:** Reviewed each OpenSIPs release.

#### `skills/opensips-config/references/{version}/cfg-format.md`
- **Purpose:** Teaches the opensips.cfg file as an artifact: section order, ordering rules, route block taxonomy, common gotchas, reading-mode and authoring-mode workflows.
- **Hand-authored:** Yes.
- **Size:** ~150–200 lines.
- **Cadence:** Rarely updated (cfg file structure is stable across minor versions).

#### `skills/opensips-config/references/{version}/ser-lineage-notes.md`
- **Purpose:** The sole file that addresses cross-project hallucination. Kept neutral.
- **Contents:**
  - Brief note that OpenSIPs is one of several projects descending from the SIP Express Router lineage.
  - Explicit rule: when authoring OpenSIPs configs, use only identifiers present in `references/{version}/core/` and `references/{version}/modules/`.
  - If the user pastes content that references identifiers not in the active version's reference set, flag them and ask for clarification rather than assume.
  - No itemized comparison, no naming of other projects beyond the single lineage mention.
- **Hand-authored:** Yes.
- **Size:** ~80–120 lines.
- **Cadence:** Rarely updated.

#### `skills/opensips-config/references/{version}/modules-index.md`
- **Purpose:** Standalone module catalog replacing the former inline table. Contains the full module catalog table plus lookup-discipline prose ("When a module is not in the index", "Lookup discipline", etc.).
- **Generated:** Yes. Built from `consolidated.json` at build time. Never hand-edited.
- **Size:** ~250–350 lines.
- **Cadence:** Regenerated on every build.

#### `skills/opensips-config/references/{version}/core/*.md`
Twelve files, all **generated** from the corresponding JSON in `source/{version}/core/`:

| File | Source | What it contains |
|------|--------|------------------|
| `async.md` | `async.json` | Asynchronous statements (`async`, etc.) |
| `events.md` | `events.json` | Event interface events |
| `flags.md` | `flags.json` | Message flags, branch flags, script flags |
| `functions.md` | `functions.json` | Core script functions |
| `mi-commands.md` | `mi_commands.json` | Core MI commands |
| `operators.md` | `operators.json` | Script operators with precedence/associativity |
| `parameters.md` | `parameters.json` | Core global parameters |
| `routes.md` | `routes.json` | Route block types with entry conditions |
| `statements.md` | `statements.json` | Control statements (`if`, `switch`, etc.) |
| `statistics.md` | `statistics.json` | Core statistics |
| `transformations.md` | `transformations.json` | Transformations (`{s.*}`, `{uri.*}`, etc.) |
| `variables.md` | `variables.json` | Pseudo-variables with r/w, scope, context |

- **Format:** Markdown with frontmatter (`generated_at`, `source_version`, `doc_type`).
- **Size:** Varies. Functions and variables are the largest (800–1500 lines). Async is small (100–200 lines).
- **Cadence:** Regenerated on every build; never hand-edited.

#### `skills/opensips-config/references/{version}/modules/*.md`
- **Purpose:** One file per module in the extraction corpus. **All generated** from `source/{version}/modules/*.json` via `render-module.ts`.
- **Format:** Conforms to the module rendering template (see `docs/architecture/rendering-templates.md §3.1`).
- **Size:** Varies by module. Simple modules (200–400 lines); large modules like `tm`, `dialog`, `dispatcher` (800–1500 lines).
- **Cadence:** Regenerated on every build.

#### `skills/opensips-config/references/{version}/consolidated.json`
- **Purpose:** Fast-lookup index matching the `ConsolidatedDocument` schema.
- **Format:** JSON.
- **Contents:** statistics block, modules array (flattened), core block (one entry per core doc type), indexes block (functionsByName, parametersByModule, variablesByName, miCommandsByName), relationships block (moduleDependencies).
- **Cadence:** Regenerated on every build.

#### `skills/opensips-config/scripts/module_search.py`

> **Status: planned, not yet implemented.** The script is specified below for a future task; the file does not exist on disk in the current release. Claude consults `consolidated.json` directly for the same lookups today; the CLI is planned for non-Claude consumers (developers, CI tooling).

- **Purpose:** Keyword search over `consolidated.json` (not over Markdown files).
- **Interface:**
  ```
  Usage: module_search.py <query> [--version 3.5|3.6]
                                  [--field name|function|parameter|pv|mi|stat|event]
                                  [--max N]
  Output: JSON array of matches.
  Exit: 0 on matches, 1 on none, 2 on bad args.
  ```
- **Behavior:**
  1. Load `../references/{version}/consolidated.json`.
  2. If `--field` specified, search only that index section.
  3. Otherwise search all indexes.
  4. Rank: exact-name match → prefix match → substring match.
  5. Return JSON with module/source, section, description, and a path suggestion for follow-up reads.
- **Size:** ~150 Python lines. Python 3.8+ stdlib only.

### 7.5 The `opensips-security-advisor` skill (scaffold)

#### `skills/opensips-security-advisor/SKILL.md`
- **Purpose:** Reserved integration point. Ships at initial release as a frontmatter placeholder.
- **Contents at initial release:**
  - Frontmatter (name, description declaring its intent, allowed-tools: Read only).
  - ~20 lines of body noting this is a scaffold, identifying the expected author (separate agent), and listing the sibling skill's reference paths this skill may consume (read-only): `../opensips-config/references/{version}/modules/*.md`, `../opensips-config/references/{version}/consolidated.json`, `../opensips-config/references/{version}/core/*.md`.
- **Size at initial release:** ~30–50 lines.
- **Ownership:** Separate agent. This project's maintainer reviews only that the name, description, and file paths stay consistent with the plugin manifest.

---

## 8. SKILL.md Frontmatter Specification

### 8.1 `opensips-config/SKILL.md` frontmatter

```yaml
---
name: opensips-config
description: |-
  Authors, edits, reviews, and answers questions about OpenSIPs SIP server
  configuration files (opensips.cfg, route blocks, modules, parameters,
  pseudo-variables). Use whenever the user mentions OpenSIPs, opensips.cfg,
  route{}/branch_route/failure_route, $var/$avp/$pv pseudo-variables, asks
  to write/edit SIP routing logic for OpenSIPs, names a specific OpenSIPs
  module (tm, dialog, dispatcher, registrar, drouting, presence, sl, uac,
  db_mysql, mid_registrar, etc.), or asks what functions/parameters a module
  exports. Do NOT use for sibling SIP Express Router (SER)-lineage projects —
  those use different identifiers despite shared lineage. For security review
  of an OpenSIPs config defer to opensips-security-advisor.
allowed-tools: "Read, Write, Edit, Glob, Grep"
---
```

### 8.2 `opensips-security-advisor/SKILL.md` frontmatter (scaffold)

```yaml
---
name: opensips-security-advisor
description: >-
  Reviews OpenSIPs configuration scripts for security issues. Use this
  skill when the user asks to audit, review for security, harden, or
  check for vulnerabilities in an opensips.cfg.
  [PLACEHOLDER — content authored by a separate agent.]
allowed-tools: "Read"
license: GPL-3.0
metadata:
  status: "scaffold"
  authored_by: "separate-agent"
---
```

### 8.4 Trigger-reliability design rules

Applied in every frontmatter above to mitigate the ~56% skill non-invocation rate observed in multi-skill evaluations:

1. Multiple trigger keywords spanning both natural language ("route script", "opensips.cfg") and technical terminology ("request_route", "pseudo-variables").
2. The phrase "Use this skill when…" — a documented pattern Anthropic models are tuned to recognize.
3. Third-person, action-verb wording.
4. Scope statements that explicitly note OpenSIPs versions, reducing ambiguity with content from other SIP projects.

---

## 9. Integration Points

### 9.1 Integration with `opensips-security-advisor`

The security advisor skill, when populated, consumes:
- `../opensips-config/references/{version}/consolidated.json` — iterate all modules programmatically.
- `../opensips-config/references/{version}/modules/*.md` — read per-module "Configuration Examples" and "Exported Parameters" sections.
- `../opensips-config/references/{version}/core/*.md` — cross-reference core identifiers.
- `../opensips-config/references/{version}/cfg-format.md` — understand the cfg file structure.

No cross-skill runtime coupling. Each skill reads files; none writes to another's directory.

### 9.2 Integration with the upstream extraction project

The plugin treats the extraction project's `data/processed/` output as read-only input. The workflow for updating the plugin with new extraction data:

1. Extraction project produces/updates `data/processed/{version}/`.
2. A maintainer copies the relevant portions into the plugin's `source/{version}/` (or a git submodule is configured — decision left to implementation).
3. `npm run build` validates and regenerates all reference files.
4. PR is opened with source + generated changes side-by-side for review.

### 9.3 User installation

Public release:
```
/plugin marketplace add OpenSIPS/opensips-claude-plugin
/plugin install opensips@opensips-claude-plugin
```

Local development install (working from a clone):
```
git clone https://github.com/<org>/opensips-claude-plugin
claude --plugin-dir ./opensips-claude-plugin/plugins/opensips
```

Use `/reload-plugins` to pick up mid-session edits.

---

## 10. Build Workflow

### 10.1 Developer workflow

```bash
# 1. Pull latest extraction output into source/
cp -r ../opensips-docs-collector/data/processed/* source/

# 2. Validate schemas (fail fast, no rendering)
npm run validate

# 3. Build references and consolidated indexes
npm run build

# 4. Commit both source/ and plugins/*/skills/*/references/ trees
git add source plugins
git commit -m "Refresh references from extraction 2026-04-24"
```

### 10.2 CI workflow

```yaml
# .github/workflows/build.yml
- npm run validate     # Zod validation, exit non-zero on drift
- npm run build        # Regenerate everything
- git diff --exit-code # Fail if generated output differs from committed
```

This guarantees the committed generated output always matches the committed source — no "forgot to rebuild" PRs.

### 10.3 Build script contract

- **Idempotent:** Running `npm run build` twice produces byte-identical output.
- **Deterministic:** Ordering of items within generated files is alphabetical by name, not source-JSON order.
- **Fail-fast:** Any Zod validation failure aborts the build with a clear error identifying the offending file and field.
- **Version-isolated:** Each version is built independently. Failure in 3.5 does not prevent 3.6 from building.

---

## 11. Golden-Path Demo Scripts

The following scripted scenarios serve a dual purpose: they demonstrate what the plugin does end-to-end, and they act as canonical regression tests. Any change to SKILL.md content, reference generation, or plugin structure must preserve these behaviors.

### Scenario 1 — Install and verify
```
/plugin marketplace add ./opensips-claude-plugin
/plugin install opensips
/plugin list
```
Expected: both skills (`opensips-config`, `opensips-security-advisor`) appear as installed.

### Scenario 2 — Author a route script with registration and dispatcher
Prompt: *"I'm on OpenSIPs 3.6. Write me a minimal but production-quality opensips.cfg that listens on UDP/5060, does registrar duties with digest auth against MySQL, and relays calls via dispatcher to an upstream gateway."*

Expected output properties:
- Correct module-load order.
- Correct parameter names for the active version.
- `send_reply` used in stateful contexts.
- A comment at the top declaring `# OpenSIPs 3.6`.

### Scenario 3 — Configure a specific module
Prompt: *"Add a dispatcher pool with two gateways, health-checked, weighted round-robin."*

Expected output properties:
- Algorithm value is correct for the active version, with Claude citing the reference.
- `tm.so` loaded before `dispatcher.so` based on the dependency graph.

### Scenario 4 — Review workflow
Prompt: *"Here's a config someone sent me. Is it correct for OpenSIPs 3.6?"* [paste config with a subtly-wrong parameter name]

Expected output properties:
- Claude identifies the wrong parameter name.
- Claude cites the specific reference file that shows the correct name for 3.6.
- Claude does not try to guess or fix silently.

### Headline takeaways these demos prove
1. Vibe routing is real with the right references grounded in authoritative per-version documentation.
2. Progressive disclosure + router-index beats stuffing everything in the prompt.
3. Reference generation is reproducible from the extraction project; contributors add modules upstream and rebuild here.

---

*End of Requirements Document — v2.0.*
*This document, plus the extraction project's `data/processed/` output, is sufficient to build the plugin without further clarification.*
