# Using opensips-skills

This guide shows you how to get the most out of the OpenSIPs Claude Code plugin. The plugin includes three skills; this document covers when each activates and how to phrase prompts well.

The audience is a working SIP engineer who has just installed the plugin and wants productive results in ten minutes. You do not need to read the architecture documents to follow this guide — those are for contributors. Here, the focus is the prompt-side craft: what triggers the skills, what makes them answer well, and what to do when they don't.

## Quick verification

Open a Claude Code session in any workspace and type `/skills`. You should see all three skills listed:

- `opensips-routing`
- `opensips-modules`
- `opensips-security-advisor`

If any are missing, the plugin did not install cleanly — re-run `/plugin install opensips@opensips-skills` from the marketplace and check `/plugin list`. If all three appear, the plugin is loaded and ready.

## Specifying your OpenSIPs version

The plugin supports multiple OpenSIPs versions side by side. Claude resolves the active version on each prompt using the following order, stopping at the first match:

1. **An explicit statement in your prompt** — e.g. "I'm on OpenSIPs 3.5..." or "for 3.6, ...". This is the strongest signal and overrides everything else.
2. **The `OPENSIPS_VERSION` environment variable** — set in the shell before launching Claude Code, e.g. `OPENSIPS_VERSION=3.5 claude` on macOS/Linux or `$env:OPENSIPS_VERSION = "3.5"; claude` in PowerShell.
3. **A `.opensips-version` file at your workspace root** — a single line containing `3.5` or `3.6` followed by a newline. Useful when a repository targets a specific version and you want the whole team to default to it.
4. **Default** — if none of the above is set, Claude defaults to the latest documented version (currently 3.6).

Examples:

> "I'm on OpenSIPs 3.5, write me a registrar setup."

This activates the 3.5 reference set regardless of any env var or file.

```bash
OPENSIPS_VERSION=3.5 claude
```

This sets 3.5 as the session default. Individual prompts that name a different version still win.

```
echo "3.5" > .opensips-version
```

This pins the workspace to 3.5 for anyone who runs Claude Code from this directory without setting the env var.

If a single prompt mentions multiple versions ("compare 3.5 and 3.6 dispatcher behavior"), Claude may ask which version to anchor the answer to before proceeding. The plugin does not perform cross-version reasoning — each version is its own self-contained world.

## Phrasing prompts for the routing skill

The `opensips-routing` skill authors and edits OpenSIPs route scripts: `opensips.cfg`, `request_route`, `branch_route`, `failure_route`, `onreply_route`, and the rest of the route-block family. It activates when you mention OpenSIPs and ask for authoring or review work.

**Works well:**

> "I'm on OpenSIPs 3.6, write me a `request_route` that handles incoming `INVITE` with NAT detection and stateful relay."

Why: explicit version anchor, concrete task, named route block, named feature categories (NAT detection, stateful relay). The skill's trigger keywords fire, the right reference files get pulled in (`tm.md`, `nathelper.md`, `core/routes.md`), and the response uses correct OpenSIPs syntax for that version.

**Works less well:**

> "Write me a SIP config."

Why: ambiguous. SIP servers come in several flavors, and the prompt does not name OpenSIPs explicitly. The skill may fail to trigger, or may trigger and ask for clarification. Phrase it as "OpenSIPs config" to make the trigger fire reliably.

**Works well:**

> "Add a `failure_route` to this config that retries on `408` and falls back to a secondary gateway." (with a config snippet pasted)

Why: the pasted snippet establishes context, the route-block name is explicit, the behavior is concrete, and the response code (`408`) gives the skill a hook to write against. The skill reads `tm.md` for the failure-route semantics and `core/routes.md` for the route-block structure.

**Works less well:**

> "Make this better." (with a config snippet pasted)

Why: "better" is undefined. The skill cannot infer whether you want correctness fixes, security hardening, performance tuning, or readability improvements. State the goal — "make this resilient to the upstream gateway being down" or "tighten the auth flow" — and the skill will produce a focused answer.

**Works well:**

> "Review this `request_route` for places where I'm using sibling-project syntax instead of OpenSIPs syntax."

Why: this is exactly the cross-project guardrail the skill is built to enforce. It will read `ser-lineage-notes.md` and the relevant module references, then flag identifiers that don't appear in OpenSIPs.

**Works less well:**

> "Convert my Asterisk dialplan to OpenSIPs."

Why: the prompt names a non-OpenSIPs SIP server. The skill's description includes exclusion clauses for non-OpenSIPs work, so it may decline or activate weakly. Reframe as "I have call-routing logic that does X; write me an OpenSIPs config that achieves the same outcome" — describing the behavior rather than asking for translation lets the skill engage on solid ground.

## Phrasing prompts for the modules skill

The `opensips-modules` skill is a router-index over per-module reference data. It does not author configurations — it points Claude at the right per-module reference file so questions about a module's exports get answered from authoritative content rather than from training-data priors.

**Works well:**

> "What parameters does the dispatcher module export in OpenSIPs 3.6?"

Why: explicit module name, explicit "parameters" keyword, version anchor. The skill activates, reads `references/3.6/modules/dispatcher.md`, and lists the parameters with types and defaults.

**Works less well:**

> "What does this module do?" (with no module name in the prompt)

Why: the skill needs the module name to know which reference file to read. That said, pasting code that names a module by name does work — for example, if you paste a `loadmodule "tm.so"` line, the skill picks `tm` out of the snippet and reads `tm.md`.

**Works well:**

> "Which OpenSIPs module exports `t_relay`?"

Why: the function name is concrete enough to look up in the consolidated index. The skill reads `references/{version}/consolidated.json`, finds the home module, then reads that module's reference file for the full signature.

**Works less well:**

> "What's the function for sending statefully?"

Why: vague. The skill could answer (it would identify `t_relay` from `tm`), but it has to do more guessing. Phrasing the question concretely — "what's the OpenSIPs function for stateful relay?" — gets a more confident answer.

**Works well:**

> "List all parameters of the registrar module along with their default values."

Why: this is exactly what the per-module reference files are structured to answer. The reply is a direct read-and-render of the parameters table.

**Works less well:**

> "Tell me everything about the `tm` module."

Why: "everything" produces a large dump that can crowd the response. Narrow the question to the surface you need — "list `tm`'s exported functions", "what MI commands does `tm` register", "what statistics does `tm` expose" — and the answer stays focused on the structured section that matches.

## Phrasing prompts for the security advisor

The `opensips-security-advisor` skill ships in v1.0.0 as a scaffold (per [ADR-005](architecture/adr/005-three-skill-architecture.md)). It activates correctly on security-review prompts and provides the integration contract with the other two skills, but the substantive review patterns — the risk catalog, severity tagging, remediation playbooks — are authored by a separate security-focused agent in a follow-on contribution.

**Works well today:**

> "Audit my OpenSIPs config for INVITE flooding risks." (with a config snippet)

Result today: the skill activates, acknowledges the trigger, and points at the relevant reference data. As the security-content authoring lands, this same prompt will return concrete findings.

**Works less well today:**

> "Is my config safe?" (with no config and no specific risk named)

Why: "safe" is unbounded. Even a fully-content version of the skill would ask which risk categories to focus on. Name the concern — toll fraud, RTP relay exposure, registration hijacking — and the answer narrows usefully.

If you need substantive security review against the v1.0.0 scaffold, the practical workaround is to use `opensips-routing` and `opensips-modules` together: paste the config, ask the routing skill to review it for correctness, and ask the modules skill to confirm any unfamiliar identifiers are real OpenSIPs identifiers. That gives you a structural pass while the security advisor's content matures.

## Working across multiple skills in one prompt

A prompt that spans authoring, reference, and security can activate all three skills in a single response. Example:

> "Write me a stateful proxy config using the `tm` and `registrar` modules in OpenSIPs 3.6, then audit it for missing rate limits and unauthenticated paths."

The response includes the config (routing skill), per-module reference data showing the function signatures used (modules skill), and a security review note (advisor skill, scaffold posture today). The skills coordinate; they do not duplicate work. The routing skill produces the config, the modules skill grounds the function calls in authoritative signatures, and the advisor reviews the whole thing.

You can also chain prompts. A common workflow:

1. "Write me a registrar config for OpenSIPs 3.6." — routing skill produces a draft.
2. "What does `save()` do in the registrar module?" — modules skill explains.
3. "Now review that config for security issues." — advisor activates on the running thread.

Each prompt in the chain gets the reference loading appropriate to the skills it triggers; you do not have to restate the version or the context.

## Tips for getting good results

A few patterns consistently improve answer quality across all three skills:

- **State the version once, early.** "I'm on 3.6" at the top of a prompt or thread saves the skill from inferring it and reduces ambiguous answers.
- **Name the route block, module, function, or pseudo-variable explicitly.** The skills' triggers are keyword-driven; a concrete identifier in the prompt lights up the right reference path. "How do I use `record_route()`?" works better than "how do I keep the proxy in the path?".
- **Paste the config when you have one.** A pasted snippet gives the skills concrete context to read against. It's much easier to review actual code than to answer about a hypothetical.
- **Ask for the structured surface you want.** The per-module reference files are structured (Overview, How It Works, Dependencies, Parameters, Functions, Pseudo-Variables, MI Commands, Statistics, Events, Configuration Examples). Asking for one of these surfaces by name lands a precise answer; asking for "everything" produces a long dump.
- **State the goal, not the change.** "Make my proxy resilient to upstream gateway failures" is more useful than "add error handling here". The skill writes better when it knows the outcome you're aiming for.
- **When an answer feels off, ask the skill to verify.** "Confirm `t_relay` exists in OpenSIPs 3.6 and show me its signature" forces a reference read. The skills are designed to defer to the reference set rather than to priors when explicitly asked.
- **Name your concern when asking the security advisor.** Even with the v1 scaffold posture, "audit for INVITE flooding" produces more structure than "is this safe?". Specific risk categories engage the skill's trigger surface more cleanly.

## What the plugin won't do

The plugin is intentionally scoped. It will:

- Author and review OpenSIPs configurations across versions 3.5 and 3.6 (3.4 data is present but currently `.broken`-marked upstream).
- Provide authoritative per-module reference data sourced from the OpenSIPs documentation.
- Activate the security advisor skill on review prompts (substantive findings expand as the security-content agent ships).

It will **not**:

- Author configurations for non-OpenSIPs SIP servers. The skill descriptions include exclusion clauses suppressing activation on sibling SER-lineage projects.
- Review live OpenSIPs servers, parse runtime logs, or interact with a running SIP stack. The skill works on static configurations pasted into the conversation.
- Fix bugs in the OpenSIPs source code itself — that is a concern for the OpenSIPs project, not for this plugin.
- Invent module exports, function signatures, or parameter values absent from the active version's reference set. If you ask about a function the active version does not document, the skill will say so or ask for clarification, rather than fabricate an answer.
- Perform cross-version reasoning ("what changed between 3.5 and 3.6?"). Each version is its own world; the plugin answers from within the active version only.

## When you find a bug or want to suggest a feature

- **Bug reports and feature requests**: open an issue at https://github.com/OpenSIPS/opensips-skills/issues. For trigger-reliability or guardrail issues, include the exact prompt that didn't behave as expected — that's what makes the SKILL.md changes testable.
- **New module reference content or corrections to existing module data**: this belongs upstream at the `opensips-docs-collector` project, which extracts the source documentation that this plugin re-renders. Filing the issue there ensures the fix flows into both projects.
- **Security review content**: the substantive security review patterns are owned by a separate security-focused authoring agent. Issues about review depth or coverage are useful here, but the implementation lives in that agent's PRs.

## See also

- [README.md](../README.md) — project landing page.
- [CONTRIBUTING.md](../CONTRIBUTING.md) — how to contribute.
- [docs/testing/golden-path-demos.md](testing/golden-path-demos.md) — the canonical-prompt regression set used at release time.
- [docs/architecture/](architecture/) — internal architecture documents (data pipeline, rendering templates, skill authoring guide, ADRs).
- [docs/vision.md](vision.md) and [docs/requirements.md](requirements.md) — what the project is and why.
