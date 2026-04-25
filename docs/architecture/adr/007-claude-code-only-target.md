# ADR-007: Claude Code as the sole target runtime

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Project founder
**Technical story:** Runtime target for the plugin

---

## Context

Anthropic ships Claude through several surfaces: the Claude.ai web interface, the desktop and mobile apps, the Claude API (both raw and via SDKs), and Claude Code (the developer-focused CLI). Each surface supports Agent Skills somewhat differently. The plugin has to pick one — or explicitly support more than one — before design decisions downstream can settle.

Four facts shape the choice:

1. **Claude Code supports skill hot-reload.** A developer can edit a SKILL.md file, run `/reload-plugins` in the same session, and see the change take effect. Other surfaces load skills once at session start and do not expose a reload mechanism. For a project whose hand-authored SKILL.md files are under active development, hot-reload is the difference between a 30-second iteration loop and a multi-minute one.

2. **Claude Code has local filesystem access.** The plugin's reference files live on disk; Claude reads them via the Read tool. The API and Claude.ai can be made to work with uploaded files, but they do not have the same "point at a directory, read files as needed" model. Progressive disclosure (per ADR-001) maps naturally to Claude Code's filesystem model and awkwardly to the others.

3. **Claude Code supports `--plugin-dir` for local development.** A contributor can clone the repository, point Claude Code at the local path, and test changes without going through a marketplace roundtrip. This is load-bearing for contributor velocity.

4. **Claude Code is where the target audience already works.** SIP/VoIP engineers using AI for development are using Claude Code (or Cursor, or similar CLI-first tools). They are not using Claude.ai's web interface to author `opensips.cfg`. A plugin that works only in a surface the audience doesn't use would be technically deployable but practically useless.

The question is whether to target Claude Code exclusively or to invest in multi-surface support.

## Decision

**Target Claude Code exclusively. Claude.ai and the API are explicit non-goals.**

Design decisions throughout the project assume Claude Code's runtime characteristics:

- **File-based progressive disclosure.** Reference files live on disk, read lazily via the Read tool. No need for an upload mechanism or embedding into a prompt.
- **Hot-reload during development.** Build workflow assumes `/reload-plugins` for mid-session iteration.
- **Local plugin directory.** Installation and development both go through `/plugin marketplace add` (public) or `--plugin-dir` (local), not through API-side skill registration or Claude.ai's skill upload.
- **Multi-skill invocation in one session.** The three-skill architecture (ADR-005) assumes the runtime can route a single prompt to multiple skills.
- **Bash tool availability for scripts.** `module_search.py` runs via Claude Code's Bash tool. The API's sandboxed execution environment has different constraints.

This decision is operational, not ideological. If a future Claude surface offers the same ergonomics (filesystem access, hot-reload, local development, multi-skill routing), the plugin will work there with minimal changes — but that's an opportunistic extension, not a planned feature.

## Alternatives considered

- **Target all surfaces (Claude Code + Claude.ai + API).** Make the plugin work anywhere Claude runs.
  - Tempting because it maximizes reach.
  - Rejected because the surfaces have incompatible assumptions. Claude.ai expects skills to be uploaded as ZIP archives, not read from local directories. The API expects skills to be pre-registered via SDK calls, with different permission models. Supporting all three would mean maintaining three installation paths, three documentation tracks, and three sets of bug reports — most of which would come from users on surfaces where the plugin cannot deliver its core value (version-grounded route script authoring works best when the user has a local `opensips.cfg` file to edit).

- **Target the API primarily, with Claude Code as a secondary consumer.** Treat the API as the programmatic backbone.
  - Tempting for teams wanting to build CI/CD integrations ("validate this config on every PR using Claude").
  - Rejected because the primary user journey is interactive authoring, not batch validation. CI/CD use of Claude is a legitimate pattern, but it's a different product than this one. A future skill or tool could address it; doing so here would split focus.

- **Target Claude.ai's web interface primarily.** Make the plugin a downloadable ZIP for drag-and-drop installation in the web UI.
  - Tempting because it lowers the install friction — no CLI required.
  - Rejected because the core workflow (edit `opensips.cfg`, validate it, iterate) is inherently file-centric. A user in a web browser has no local `opensips.cfg` to point the skill at. Even if the web interface could accept file uploads, the iteration loop would be fundamentally broken compared to the CLI's "edit, reload, retry" cycle.

- **Build a separate "skill runtime" that works across surfaces.** Abstract over the runtime differences with a shim layer.
  - Tempting for maximum portability.
  - Rejected because it's a product, not a plugin. Building a cross-surface skill runtime is a multi-quarter engineering project with its own maintenance burden, its own documentation, and its own user support. The plugin's goal is to solve the OpenSIPs hallucination problem, not to solve skill portability.

## Consequences

**Positive:**

- Design space narrows. Every design decision downstream can assume Claude Code's runtime. No conditional logic, no "if API then this, if Claude.ai then that."
- Installation is a single documented path. `/plugin marketplace add` for production use, `--plugin-dir` for development. No per-surface instructions.
- Hot-reload during skill development eliminates a multi-minute friction that would otherwise dominate the SKILL.md authoring workflow.
- The contributor experience aligns with the target audience. SIP engineers comfortable with CLI tools onboard quickly; the install path matches the tools they already use.
- Support and bug triage stays simple. A bug report always comes from the same runtime, with predictable behavior.

**Negative:**

- Users who only interact with Claude through the web interface or mobile apps cannot use the plugin. This is a real exclusion, especially for users who may want quick OpenSIPs help without installing a CLI.
- Mitigating the exclusion (e.g., by producing a read-only "cheat sheet" export of the reference files, publishable to the web) would be a separate project, not part of this one.
- Future Claude surface changes may affect the plugin in ways that multi-surface support would have absorbed. A Claude Code redesign that removes a feature the plugin depends on is a risk this decision accepts.

**Neutral:**

- The plugin's distribution is tied to Anthropic's Claude Code plugin marketplace. If that marketplace changes (policies, visibility rules, approval process), the plugin's public distribution changes with it. This is not a choice about the plugin — it's a consequence of picking any specific runtime — but it's worth naming.

## Implementation notes

- The plugin's manifest (`.claude-plugin/marketplace.json`, `plugin.json`) uses the Claude Code plugin schema. No attempt is made to produce API-compatible skill bundles.
- The README documents Claude Code as the target explicitly. Users who arrive via search hoping for API integration learn immediately that this isn't what the project does, rather than discovering it after a failed install.
- `module_search.py` uses stdlib Python and a stdin/stdout JSON protocol, making it portable if a future surface supports calling scripts similarly. This is a small concession to optionality, not a commitment to multi-surface support.

## Related decisions

- **Informs:** ADR-001 (router-index pattern) — the progressive disclosure model the router-index depends on is most naturally supported by Claude Code's filesystem and Read-tool semantics.
- **Informs:** ADR-005 (three-skill architecture) — multi-skill invocation in a single session is a Claude Code capability; the architecture assumes it.
- **Related to:** Any future decision about operations skills, dev-environment skills, or test-loop skills — all will inherit this target choice unless a specific ADR supersedes it.
