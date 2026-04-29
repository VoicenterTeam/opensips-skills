---
name: opensips-security-advisor
description: |-
  Reviews OpenSIPs configurations for security issues — authentication and credential storage, injection (SQL/shell/header), MI exposure, TLS posture, DoS surfaces, relay and routing risks, identity spoofing, STIR/SHAKEN, media plane, dispatcher/load-balancer, tracing/logging hygiene, and configuration hygiene. Use whenever the user asks for a security review, audit, or hardening check on an OpenSIPs config, mentions risks like SIP scanning, spoofed REGISTER, INVITE flood, toll fraud, MI exposure, RTP relay misuse, or cites a CVE in an OpenSIPs context. Do NOT use for general SIP security advice unrelated to OpenSIPs configuration.
allowed-tools: Read, Glob, Grep
---

## Overview

This skill reviews OpenSIPs configurations for security issues. It is one of two skills in the `opensips-skills` plugin. It is read-only — it does not modify any file. It produces a Markdown report enumerating findings by severity, with cited remediations.

The skill is a router. The procedural spine of every review is in `references/workflow.md`; the rule catalog is in `references/rules/`. This file routes Claude to the right reference for any given task.

## When to use this skill

Activate when the user:

- Asks for a security review, audit, or hardening check on an OpenSIPs configuration.
- Asks for hardening guidance for a specific risk category (INVITE flooding, registration hijacking, toll fraud, MI exposure, RTP relay exposure, SIP scanning, weak TLS, DoS exposure).
- References a CVE, security advisory, or compliance posture in an OpenSIPs context.
- Suspects compromise on a deployed OpenSIPs proxy.
- Asks for a pre-deployment review of an `opensips.cfg`.

## When NOT to use this skill

Defer to `opensips-config` for:

- Authoring or editing an `opensips.cfg`.
- Looking up a module's exports, parameters, pseudo-variables, MI commands, statistics, events, or dependencies.
- Asking what a function or pseudo-variable does.
- General routing logic questions unrelated to security.

Defer to general SIP security guidance for:

- Non-OpenSIPs SIP servers.
- SIP protocol questions unrelated to a specific OpenSIPs configuration.

## How to use the references

Always start any review by reading `references/workflow.md`. Everything else is consulted on demand.

| When you're about to ... | Read |
|---|---|
| Start any review | `references/workflow.md` |
| Render the final report | `references/output-format.md` |
| Decide a finding's severity or which profile a rule applies to | `references/taxonomy.md` |
| Reason about an injection-class rule | `references/taint-model.md` |
| Find rules in a specific family | `references/rules/<family>/_index.md` then individual rule files |
| Look up CVE details or threat-model context | `references/knowledge/vulnerability-reference.md` |
| Decide whether a sanitizer in the cfg is sufficient | `references/knowledge/sanitizer-registry.md` |
| Encounter an unrecognized identifier | `references/knowledge/ser-lineage-notes.md` |
| Cite an authoritative external source | `references/knowledge/external-sources.md` |
| Apply a version-specific consideration (CVE inventory, module-set deltas) | `references/version-notes/<X.Y>.md` |

The 12 rule families and their short codes are catalogued in `references/taxonomy.md`. Family folders are kebab-case under `references/rules/`: `auth/`, `injection/`, `mi-exposure/`, `tls/`, `dos-defense/`, `relay-and-routing/`, `identity-spoofing/`, `stir-shaken/`, `media/`, `dispatcher-and-lb/`, `tracing-and-logging/`, `config-hygiene/`. Rule IDs use the form `OSIPS-SEC-<DOMAIN>-NNN`.

## Integration contract — reading from `opensips-config`

This skill READS but does not WRITE the sibling skill's reference tree. It uses the sibling skill's data to confirm that identifiers in the configuration under review are documented for the active OpenSIPs version. The reads are:

- `../opensips-config/references/{version}/consolidated.json` — fast lookup index for finding the home module of any function or pseudo-variable referenced in the config.
- `../opensips-config/references/{version}/modules-index.md` — module catalog and the lookup-discipline procedures, including "When a module is not in the index".
- `../opensips-config/references/{version}/modules/<module>.md` — per-module reference data when the module needs detailed inspection.
- `../opensips-config/references/{version}/cfg-format.md` — file structure, section order, ordering rules. Read once when first encountering a cfg this session.
- `../opensips-config/references/{version}/core/*.md` — when a rule's audit logic depends on core syntax (pseudo-variables, transformations, flags).

The `{version}` literal is resolved at read time against the version the user named at intake.

## SER-lineage guardrail

OpenSIPs descended from the SIP Express Router and shares architectural ancestry with sibling SER-lineage projects. Configuration syntax, function signatures, and module exports have diverged. Identifiers from sibling projects look plausible inside an OpenSIPs config but produce silent failures or wrong behavior at runtime. For a security review, this matters because:

- Unrecognized identifiers cannot be analyzed against OpenSIPs rules — they may be typos, version drift, or imports from sibling projects.
- Recommending a remediation that uses a sibling-project identifier creates a worse failure than the original finding.

When an identifier in the cfg under review is not documented in `../opensips-config/references/{version}/`, emit a `review_required` finding rather than guessing. Per ADR-008, never name specific sibling SER-lineage projects in any review output. Use phrases like "this identifier is not documented for the active OpenSIPs version" or "this construct may be from a sibling SER-lineage project."

Read `references/knowledge/ser-lineage-notes.md` for the full anti-hallucination protocol.

## Workflow entry point

Always start by reading `references/workflow.md` end-to-end. The workflow doc enumerates the steps; this SKILL.md is a router only.
