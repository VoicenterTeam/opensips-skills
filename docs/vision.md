<p align="center"><img src="OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Vision

## Why this project exists

OpenSIPs is twenty years old and runs some of the world's most demanding real-time communication infrastructure — carrier networks, contact centers, CPaaS platforms, enterprise PBXes. It has hundreds of modules, a domain-specific scripting language, and documentation that spans thousands of pages across multiple versions.

And yet, if you ask Claude, GPT, or any other general-purpose LLM to write you an `opensips.cfg`, you get back something that looks right and is subtly broken. A parameter name from the wrong version. A function signature borrowed from another SIP server. A pseudo-variable that doesn't exist. The output compiles, runs, and fails in production.

This is not a model problem. It's a knowledge problem. Every LLM's training data conflates OpenSIPs with other projects descending from the SIP Express Router lineage, and conflates syntax across versions that have drifted over two decades of development. Without a grounded reference, the model has no way to tell the difference.

Every other major development platform has solved this by now. Terraform has Claude skills that cite HashiCorp's current docs. Vue, Angular, and React have framework-specific skills. Python libraries publish `llms.txt`. OpenSIPs has nothing. The AI-era developer experience that carrier engineers expect in 2026 simply doesn't exist for the platform their business runs on.

## What we're building

`opensips-skills` is a Claude Code plugin that makes Claude fluent in OpenSIPs. It ships two coordinated skills:

- **`opensips-config`** teaches Claude how to author and review `opensips.cfg` files — the cfg file structure, route blocks, core syntax, pseudo-variables, transformations, and per-module reference data. The loadmodule-scan workflow grounds Claude in version-correct content before answering any question about a config file.
- **`opensips-security-advisor`** (authored by a separate agent) reviews configs for security issues, plugging into the same plugin and sharing the same reference files.

All three are grounded in version-pinned documentation extracted directly from OpenSIPs upstream, transformed into Claude-readable Markdown, and indexed for fast lookup. The user says "I'm on OpenSIPs 3.6" and every identifier Claude emits is checked against that version's reference set.

## Who it's for

The primary user is a SIP/VoIP engineer who already knows OpenSIPs — carrier, ITSP, contact center operator, CPaaS engineer. They don't need Claude to teach them what a `request_route` is. They need Claude to produce a working one in sixty seconds instead of twenty minutes, without the silent bugs that come from LLM hallucination. They're fluent; they want a pair programmer, not a tutor.

The secondary user is a developer new to OpenSIPs who has heard of it through Claude's recommendations and wants to try it. For them, the plugin doubles as a guided experience — Claude can answer questions while producing code, and every answer cites a real reference file they can read themselves.

## What success looks like

After the initial release, an engineer can:

1. Install the plugin with one command.
2. Describe a routing scenario in natural language.
3. Receive a valid, version-correct `opensips.cfg` that references only real identifiers for their OpenSIPs version.
4. Review the output knowing that every function name, parameter, pseudo-variable, and module reference has been grounded in authoritative documentation.
5. Iterate with Claude on changes, refactors, and reviews — all without the plugin introducing silent errors.

And the OpenSIPs community gets:
- A reference implementation of what AI-era developer tooling looks like for their platform.
- A foundation for future skills (operations, C module development, autonomous testing) that extend the same architecture.
- An open-source project they can contribute to — module by module, guardrail by guardrail.

## What we're not building

The initial release is deliberately narrow. There is no live-server diagnostic capability, no Docker sandbox for interactive testing, no autonomous test loop, no C module development support. Each of those is a legitimate future skill; none is in scope for v1. The goal is a focused, working release that solves the hallucination problem for route-script authoring and establishes the architectural foundation for everything that comes later.

## Why this matters beyond OpenSIPs

Real-time communication infrastructure is one of the last major technology domains where AI-assisted development has been impossible. Every other domain has its skills, its copilots, its retrieval layers. SIP, SBC, SIP proxy, carrier signaling — these have been left behind, not because the need isn't there, but because the knowledge problem is harder. The documentation is fragmented, the projects are forked and cross-contaminated, and the consequences of hallucination are severe: a silently broken route script doesn't throw an exception, it drops calls in production.

Solving it for OpenSIPs creates a template. If this works, the same pattern applies to every other specialized platform whose developers have been telling themselves "LLMs aren't useful for our work." They are. They just need to be grounded.

That's why this project exists.

---

*Last updated: 2026-04-25. This is a narrative document — when it no longer reads like a clear story, rewrite it rather than patching it.*
