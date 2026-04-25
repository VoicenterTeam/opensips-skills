---
name: opensips-security-advisor
description: |-
  Reviews OpenSIPs configurations for security issues (SIP authentication, ACL/firewall rules, rate limiting, INVITE flooding, registration hijacking, RTP relay exposure, toll fraud surfaces). Use whenever the user asks for a security review, audit, or hardening check on an OpenSIPs config, or mentions risks like SIP scanning, spoofed REGISTER, INVITE flood, or toll fraud in an OpenSIPs context. Do NOT use for general SIP security advice unrelated to OpenSIPs configuration.
allowed-tools: Read, Glob, Grep
---

## Overview

This skill reviews OpenSIPs configurations for security issues. It is one of two coordinated skills for working with OpenSIPs in Claude Code. The substantive content of this skill — the risk catalog, audit workflow, and remediation guidance — is authored separately by a security-focused agent (per [ADR-012](../../../docs/architecture/adr/012-merge-routing-and-modules-into-opensips-config.md)). This file is the structural placeholder.

## Cross-project guardrail

OpenSIPs is one of several projects that descend from the SIP Express Router. The projects share architectural ancestry, and many concepts — transactions, dialogs, registrar logic, the `permissions` and `auth` modules — are recognizable across them. Configuration syntax, function signatures, and module exports have diverged substantially. Identifiers from sibling SER-lineage projects look plausible inside an OpenSIPs config but produce silent failures or wrong behavior at runtime.

When reviewing an OpenSIPs configuration:

- Trust only identifiers documented in the per-module reference data under `../opensips-config/references/{version}/modules/<module>.md`.
- Trust only core syntax documented in `../opensips-config/references/{version}/core/*.md`.
- If a configuration uses identifiers absent from the active version's reference set, flag them as unverified — they may be typos, version drift, or imports from sibling projects.
- When in doubt, ask the user. Do not invent OpenSIPs identifiers to match a sibling project's pattern.

## When to use this skill

Trigger when the user explicitly requests:

- A security review or audit of an OpenSIPs configuration.
- Hardening guidance for a specific risk category (INVITE flooding, registration hijack, toll fraud, RTP relay exposure, SIP scanning).
- Mention of CVEs, security advisories, or compliance posture in an OpenSIPs context.

Defer to the sibling skill for non-security work:

- `opensips-config` for authoring, editing, or looking up exports — module reference, route logic, pseudo-variables, transformations, and global parameters all live there.

## Working with sibling skills

This skill is one of two coordinated skills:

- `opensips-config` — authoring, editing, and per-module reference for OpenSIPs configurations.
- `opensips-security-advisor` — security review of OpenSIPs configurations (this skill).

When a user prompt mentions security concerns and configuration authoring together, both skills can activate. This skill produces the review; `opensips-config` provides authoritative content the review references.

## Integration contract

This skill reads (but does not write) the following:

- `../opensips-config/references/{version}/modules/*.md` — per-module reference data.
- `../opensips-config/references/{version}/consolidated.json` — fast lookup index for finding the home module of any function or pseudo-variable referenced in the config under review.
- `../opensips-config/references/{version}/modules-index.md` — module catalog and lookup-discipline procedures (used when an identifier doesn't surface in `consolidated.json`).
- `../opensips-config/references/{version}/core/*.md` — core syntax references.
- `../opensips-config/references/{version}/guides/*.md` — when present (per ADR-009, some versions have guides; absence is not an error).
- `../opensips-config/references/{version}/cfg-format.md` — opensips.cfg file structure and authoring/reading workflow.
- `../opensips-config/references/{version}/ser-lineage-notes.md` — anti-hallucination guardrails.

Per [ADR-008](../../../docs/architecture/adr/008-ser-lineage-neutral-framing.md), this skill MUST NOT name specific sibling SER-lineage projects in any review output, finding, or remediation suggestion. Use "sibling SER-lineage project" or "non-OpenSIPs SIP server" phrasing when contrasting is necessary.

The substantive review workflow, risk catalog, severity-tagging system, and remediation patterns will be added by the security-focused authoring agent in a follow-on contribution. Until then, this skill activates correctly on the trigger keywords above and provides the guardrail + integration contract; richer review behavior is post-v1.
