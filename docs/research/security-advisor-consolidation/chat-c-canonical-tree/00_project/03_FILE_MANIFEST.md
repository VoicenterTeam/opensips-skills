# OpenSIPS Security Advisor — Complete Document Manifest

**Purpose.** This document is the single source of truth for what needs to be authored to build the OpenSIPS Security Advisor skill component. It is designed to be handed to one or more follow-up chats, each of which can pick up any tier or any individual document and author it without needing to re-derive context from the main design sessions.

**Scope boundary.** The OpenSIPS skill project has three components: (1) general OpenSIPS information, (2) modules and skills reference, (3) security advisor. This manifest covers component 3 only. Components 1 and 2 are authored separately and are prerequisites the advisor will reference, not dependencies it bundles.

**Decisions already locked (do not re-open in authoring chats):**

- **One rule catalog across 3.4 / 3.5 / 3.6**, not three separate catalogs. Rules carry version-applicability metadata.
- **Confidence is separate from severity**; both are mandatory on every finding.
- **CVSS 4.0** for scoring; CIS L1/L2 for profiles; SonarQube-style `review_required` for LLM abstention.
- **SARIF 2.1.0** as machine output; **NIST SP 800-115** Markdown as human output. Both are produced.
- **Rule IDs** use `OSIPS-SEC-<FAMILY>-<NNN>` convention (namespaced to leave room for future non-security advisors).
- **Rule granularity principle:** one rule per detection-pattern + remediation pair. If the remediation is identical across variants, it is one rule with multiple match patterns. If the remediation differs, separate rules.
- **Seven-layer advisor architecture**: intake → parsing → rule catalog → configuration/profile → detection engine (4 sub-phases: structural, value/pattern, dataflow/taint, semantic/contextual) → triage + verification → reporting.
- **Twelve module families** for rule organization: auth, tls, injection, relay_and_routing, dos_defense, mi_exposure, media, stir_shaken, tracing_and_logging, identity_spoofing, config_hygiene, dispatcher_and_lb.

---

## Directory layout

All paths are relative to the advisor skill component root.

```
opensips-security-advisor/
├── SKILL.md                          ← top-level skill entry (authored last)
├── 00_project/
│   ├── 00_README.md
│   ├── 01_CHARTER.md
│   └── 02_GLOSSARY.md
├── 10_architecture/
│   ├── 10_SKILL_STACK.md
│   ├── 11_FINDING_SCHEMA.md
│   ├── 12_RULE_CATALOG_SCHEMA.md
│   ├── 13_PROFILE_MODEL.md
│   ├── 14_VERSION_STRATEGY.md
│   ├── 15_CONFIDENCE_AND_VERIFICATION.md
│   └── 16_TAINT_MODEL.md             ← Tier 1 extension, accepted at consolidation
├── 20_runtime/
│   ├── 20_INTAKE_PROTOCOL.md
│   ├── 21_ANALYSIS_PIPELINE.md
│   ├── 22_REPORT_TEMPLATES.md
│   ├── 23_SUPPRESSION_PROTOCOL.md
│   └── 24_INTERACTION_PATTERNS.md
├── 30_rules/
│   ├── _CATALOG_INDEX.md             ← global rule list / router
│   ├── auth/
│   │   ├── _index.md
│   │   └── OSIPS-SEC-AUTH-###.md     (multiple)
│   ├── tls/
│   ├── injection/
│   ├── relay_and_routing/
│   ├── dos_defense/
│   ├── mi_exposure/
│   ├── media/
│   ├── stir_shaken/
│   ├── tracing_and_logging/
│   ├── identity_spoofing/
│   ├── config_hygiene/
│   └── dispatcher_and_lb/
├── 40_versions/
│   ├── 3.4.md
│   ├── 3.5.md
│   └── 3.6.md
├── 50_fixtures/
│   ├── README.md
│   ├── vulnerable/
│   ├── clean/
│   ├── tricky/
│   └── golden_reports/
└── 90_reference/
    ├── 01_master_vulnerability_reference.md     (from Phase 2 research)
    ├── 02_enable_security_gap_analysis.md       (from Phase 3 research)
    ├── 03_advisor_methodology_research.md       (from Phase 5 research)
    └── external_sources.md
```

---

## Tier 0 — Project Orientation

These documents orient any agent encountering the advisor package for the first time. Kept short; the agent reads them once then works from the architectural specs.

### `00_project/00_README.md`

**Purpose.** Entry point for anyone opening the advisor package. Tells them what this is, how the pieces fit, and what order to read.

**Contents required:**
- One-paragraph description of the advisor skill component.
- How it relates to the other two OpenSIPS skill components (general info, modules reference) — specifically: the advisor *consults* those components for OpenSIPS syntax and module semantics but does not duplicate them.
- Reading order for new agents: Tier 0 → Tier 1 → Tier 2 → sample a few rules from Tier 3 → Tier 4 → Tier 5.
- Where to find each tier.
- Status tracking: which tiers are drafted, which are locked, which are work-in-progress.
- Versioning convention for the advisor skill itself (e.g., `opensips-advisor@0.1.0`).

**Length.** 2–3 pages.

**Dependencies.** None — can be authored first.

---

### `00_project/01_CHARTER.md`

**Purpose.** Scope contract. Defines what the advisor *is* and what it is *not*. Prevents scope creep during implementation and gives reviewers a stable reference to push back against proposals that drift.

**Contents required:**
- Mission statement (one paragraph).
- In-scope: script-layer vulnerability detection, hardening advice, profile-based posture assessment, dual Markdown/SARIF output, version-aware analysis across 3.4/3.5/3.6.
- Out-of-scope: C-source-level vulnerability detection, runtime/dynamic analysis, network-level attack simulation, patching OpenSIPS itself, managing deployed OpenSIPS instances, orchestrating rtpengine or other adjacent daemons.
- Target users: OpenSIPS administrators, SIP security engineers, carrier operations teams.
- Non-goals: automated config editing (advisor suggests, does not mutate); compliance certification (advisor informs, does not certify).
- Success criteria: what a "good" advisor session looks like from the user's perspective.

**Length.** 2 pages.

**Dependencies.** None.

---

### `00_project/02_GLOSSARY.md`

**Purpose.** Disambiguates terms that are overloaded across SIP, security, and SAST vocabularies. The word "severity" means three different things in CVSS, SARIF, and CIS; this glossary locks the advisor's usage.

**Contents required:**
- OpenSIPS/SIP terms: route types (request_route, failure_route, onreply_route, branch_route, local_route, error_route, startup_route, timer_route, event_route), pseudo-variables ($rU/$fU/$tU/$ct/$ua/$si/$hdr), dialog, transaction, AoR, registrar, pike, ratelimit, MI, AVP, module families.
- Security terms as used in this advisor: finding, rule, pattern, dataflow, sanitizer, sink, source, taint, suppression, profile, baseline, hardening index.
- Advisor-specific terms: severity (ours uses critical/high/medium/low/info), confidence (high/medium/low), verification_status, kind (vulnerability vs review_required), grounding, rationale_trace.
- Kamailio-vs-OpenSIPS disambiguation: a short table of Kamailio-idiom names the advisor must *not* use (sanity_check, secfilter, allow_address, etc.) with their OpenSIPS equivalents.

**Length.** 3–4 pages.

**Dependencies.** None, but should be updated as rules are authored and new terms surface.

---

## Tier 1 — Architectural Specifications

The load-bearing documents. Every rule, every fixture, every runtime behavior decision ultimately traces back to one of these six specs. An authoring chat working on a rule must have read these.

### `10_architecture/10_SKILL_STACK.md`

**Purpose.** The 7-layer architecture spec. Binds each layer to a physical location in the skill package and defines what each layer consumes, produces, and is responsible for.

**Contents required:**
- Diagram or ASCII layer map showing the seven layers in order: Intake → Parsing/Model Construction → Rule Catalog → Configuration Layer → Detection Engine → Triage/Post-processing → Reporting.
- For each layer, a section with: Purpose, Inputs, Outputs, Physical location (file/directory in the skill), Responsibilities, Anti-responsibilities (what belongs in a different layer and must not leak in here), Precedent (which industry tool inspired this layer's design).
- The Detection Engine section expands into four sub-phases: Structural, Value/Pattern, Dataflow/Taint, Semantic/Contextual. For each sub-phase: what kinds of rules belong here, what the LLM vs deterministic-script split looks like, example rule shapes.
- A sequence diagram showing a single analysis run from cfg file intake through to SARIF + Markdown emission.
- Claude-skill-specific notes: how progressive disclosure is used (SKILL.md frontmatter / body / references/), how the router decides which rule family indexes to load, how token economics are managed.

**Length.** 8–10 pages.

**Dependencies.** References the OpenSIPS skill progressive-disclosure architecture decisions already captured in project memory (module-family grouping, keyword-search fallback, router in SKILL.md).

---

### `10_architecture/11_FINDING_SCHEMA.md`

**Purpose.** The wire format for a finding. Byte-precise. This is the contract between the detection engine and the reporting layer, and between the advisor and any downstream tool (GitHub Code Scanning, CI pipelines, etc.).

**Contents required:**
- The canonical finding JSON schema with every field defined: name, type, required/optional, enum values where applicable, description, example value.
- Mandatory fields block: finding_id, rule_id, rule_version, engine_version, opensips_version_detected, title, severity, confidence, verification_status, kind, location (file + line + column + logical_location), evidence, recommendation, fingerprint.
- Recommended fields block: rationale, default_value, cvss_v4_vector, security_severity (0–10 numeric), cwe, owasp, attack (MITRE ATT&CK), references, related_locations, profile_applicability, baseline_state, tags.
- LLM-specific fields block: grounding (parser_nodes, references_consulted), rationale_trace, verification_status values (`deterministic_confirmed`, `judge_confirmed`, `judge_dissented`, `unchecked`).
- The SARIF 2.1.0 embedding strategy: exactly how each internal field maps to SARIF. Which fields go into `result.properties` under which key namespace (`opensips-advisor/*`). How CWE/OWASP/ATT&CK become `taxa` entries. How fix_diff becomes `fixes[].artifactChanges[].replacements[]`.
- Fingerprinting algorithm: exact SHA-256 input format for `partialFingerprints["stable/v1"]` so that the same config on two runs yields the same fingerprint.
- JSON Schema (draft-07 or draft-2020-12) definition as an appendix for validation.

**Length.** 10–12 pages.

**Dependencies.** None (this is a leaf spec). Part 2 of the Phase 5 research document is the source material; this is its normative, locked-down version.

---

### `10_architecture/12_RULE_CATALOG_SCHEMA.md`

**Purpose.** The format of a rule file. Every rule in `30_rules/` conforms to this spec. Without this document, rules drift in structure and the engine cannot reliably consume them.

**Contents required:**
- The Markdown-with-YAML-frontmatter format definition.
- Frontmatter field spec: `id`, `name`, `title`, `version`, `engine_version_min`, `engine_version_max`, `module_family`, `applies_if_modules_loaded`, `applies_if_opensips_version`, `phase`, `profile` (L1/L2/both), `automated` (true/false), `severity`, `confidence`, `security_severity`, `cvss_v4_vector`, `cwe`, `owasp`, `attack`, `tags`, `references`, `short_description`.
- Required vs optional field table.
- Enum values for each bounded field (severity, confidence, phase, profile, module_family).
- Body section spec: which H2 sections are required, in what order. At minimum: Rationale, Default Value, Audit, Remediation, Example (before/after).
- Optional body sections: Version Notes, False-Positive Considerations, Related Rules, Additional References.
- Naming convention: rule file names match their id (e.g., `OSIPS-SEC-AUTH-001.md`), rule IDs are globally unique, rule IDs are never reused even when a rule is deleted.
- Validation rules: the rule file is valid if (a) frontmatter parses, (b) all required fields present, (c) all enum values in bounds, (d) all required body sections present, (e) cvss_v4_vector parses as valid CVSS 4.0 vector.
- A full worked example rule (probably OSIPS-SEC-AUTH-001 plaintext HA1, since we've drafted it) embedded as a reference exemplar.

**Length.** 6–8 pages.

**Dependencies.** References `11_FINDING_SCHEMA.md` for severity/confidence enum alignment.

---

### `10_architecture/13_PROFILE_MODEL.md`

**Purpose.** Defines how CIS-style Level 1 / Level 2 profiles work in the advisor, how they're selected, and how rules declare profile membership.

**Contents required:**
- Definition of Level 1: safe defaults, broadly applicable, minimal functional disruption. A typical enterprise PBX or mid-size SIP deployment should pass all L1 rules.
- Definition of Level 2: strict/carrier-grade, may impact functionality or require coordinated rollout. Carrier SBCs, regulated telcos, high-risk edge proxies.
- How a rule declares profile applicability: `profile: [L1]`, `profile: [L2]`, `profile: [L1, L2]`, or absence = applies regardless.
- How profile is selected at intake: user declaration, inferred from deployment-context questions, defaulted to L1 if undeclared.
- Override model: user can raise or lower profile per rule (e.g., "treat OSIPS-SEC-TLS-005 as L1 even though catalog says L2"). These overrides live in the Configuration Layer.
- Examples of canonical L1 rules vs canonical L2 rules, with justification for why each is tiered where it is.
- Interaction between profile and severity: profile gates *whether a rule fires*, severity is *how bad a firing is*. These are orthogonal and the doc must make that unambiguous.

**Length.** 3–4 pages.

**Dependencies.** References `12_RULE_CATALOG_SCHEMA.md` for the `profile` frontmatter field.

---

### `10_architecture/14_VERSION_STRATEGY.md`

**Purpose.** Justifies and specifies the single-catalog-with-version-metadata approach. Prevents future authoring chats from proposing a fork into three catalogs.

**Contents required:**
- Decision statement: ONE rule catalog, version-applicability expressed per-rule in frontmatter.
- Rationale: ~85% of rules apply identically across 3.4/3.5/3.6; forking would create 3× maintenance burden for 1.15× information density.
- Frontmatter fields for version expression: `engine_version_min`, `engine_version_max`, `applies_if_opensips_version` (semver range expression like `">=3.2 <3.7"` or `">=3.5"`).
- Version-differentiation patterns with examples:
  - Pattern A — identical behavior: no version fields, rule applies everywhere.
  - Pattern B — version-gated CVE: rule fires only when detected version is in a vulnerable range (e.g., CVE-2026-25554 affects 3.1–3.6.3 pre-patch).
  - Pattern C — version-specific syntax: the rule applies everywhere but BAD/GOOD examples use version-specific syntax; handle with `## Version Notes` section in body.
  - Pattern D — deprecated-in-newer: the rule applies to older versions only (e.g., `applies_if_opensips_version: "<3.5"` for avpops-only patterns).
- How intake detects OpenSIPS version: explicit user declaration is preferred; fallback heuristics from cfg syntax signatures are documented as best-effort-with-warning.
- How `40_versions/3.4.md`, `3.5.md`, `3.6.md` relate to rules: they are narrative orientation for the agent (what's new in this version, what changed, what CVEs apply), not duplicated rule content.
- Sunset policy: when OpenSIPS drops a version (EOL), the advisor marks rules specific to that version as deprecated but does not delete them for one release cycle.

**Length.** 4–5 pages.

**Dependencies.** References `12_RULE_CATALOG_SCHEMA.md`.

---

### `10_architecture/15_CONFIDENCE_AND_VERIFICATION.md`

**Purpose.** The discipline spec for LLM-era advisor output. Defines how confidence is assigned, when the verification pass runs, and when the advisor abstains.

**Contents required:**
- Confidence definition: how certain the advisor is that the finding is a real issue, independent of how bad it would be if real.
- Confidence assignment rubric:
  - **High** — deterministic match (the config literally contains the offending directive); CVE-gated with confirmed vulnerable version; pattern-exact.
  - **Medium** — LLM semantic match with evidence from multiple directives; CVE-gated with probable vulnerable version; pattern-with-ambiguity.
  - **Low** — LLM judgment call with limited evidence; cross-cutting inference; ambiguous context.
- Severity vs confidence matrix (5×3) with prescribed output behavior for each cell:
  - High/High → emit as finding, surface prominently.
  - High/Low → emit as `review_required`, flag for human attention.
  - Low/Low → omit from report or emit as informational appendix.
  - …etc.
- Verification pass specification: when a rule's phase is `semantic_contextual`, its finding MUST undergo a verification pass (deterministic re-check OR second-LLM-judge critique) before being emitted with confidence >= medium.
- Verification status enum: `deterministic_confirmed`, `judge_confirmed`, `judge_dissented`, `unchecked`. What to do when a rule fires but the judge dissents.
- Abstention protocol: when the LLM cannot decide, emit `kind: review_required` with a non-empty `review_reason` field. Never guess-and-emit.
- Calibration targets: initial false-positive rate target < 15% (industry "good" per SAST research); measurement approach (manually triage a sample of runs against fixtures).

**Length.** 5–6 pages.

**Dependencies.** References `11_FINDING_SCHEMA.md`, `21_ANALYSIS_PIPELINE.md`.

---

### `10_architecture/16_TAINT_MODEL.md`

**Status.** Tier 1 extension, accepted at consolidation (Thread 0). Authored by Chat B; not in the original Phase 6a manifest. Added because the rule-authoring contract relies on a defined taint model and several rules in the injection family will not type-check without this specification.

**Purpose.** Defines the dataflow taint vocabulary used by the dataflow phase (Phase 3c per `21_ANALYSIS_PIPELINE.md`) and by individual injection-family rules: taint sources (which OpenSIPS pseudovariables and message accessors carry untrusted bytes), taint propagation (which expressions transmit, refine, or terminate taint), sanitizers (which transformations clear taint and under what conditions), and sinks (which primitives are dangerous to reach with tainted data).

**Contents required:**
- Source set: SIP-message-derived pseudovariables and message accessors that carry untrusted input (`$rU`, `$fU`, `$tU`, `$ru`, `$si`, `$proto`, `$ua`, `$hdr(*)`, `$ct`, `$avp(*)` when set from any of the above, etc.). The list is hand-curated per Thread 0 item 10c; expansion is a Phase 6b backlog item.
- Propagation rules: how taint flows through string concatenation, `pv_*` assignments, transformations (`{s.<transform>}`), and module function arguments.
- Sanitizer registry: a registered set of transformations that terminate taint when applied to a tainted value. Initial set: `s.escape.common`, `s.escape.user`, `s.escape.param`, `s.escape.shell`. Lives at `90_reference/sanitizer_registry.yaml` (to be authored by Thread 1).
- Sink categorization: SQL sinks (`avp_db_query`, `cachedb_query`, `db_query`, `sql_query`), shell sinks (`exec_*`), routing sinks (`t_relay`, `forward`), header-write sinks, and how to declare new sinks in rules.
- The `abstain_on:` rule frontmatter field: when a taint path traverses an opaque function (e.g., `perl_exec_*`, `python_exec`, custom-loaded handlers), the rule emits `kind: review_required` rather than asserting either pass or fail. This is the abstention contract; see `15_CONFIDENCE_AND_VERIFICATION.md` for the broader confidence discipline.
- Worked examples: a SIP-to-SQL flow through `s.escape.common` (taint terminated; rule does not fire); a SIP-to-SQL flow through `perl_exec_simple` (opaque; rule emits `review_required`).

**Length.** ~5–7 pages.

**Dependencies.** Referenced by `12_RULE_CATALOG_SCHEMA.md` (frontmatter fields `abstain_on`, fixture-pointer `exercises_abstain_on`), `21_ANALYSIS_PIPELINE.md` Phase 3c, and every rule in the `injection/` family.

---

## Tier 2 — Runtime Behavior Specifications

How the advisor behaves when a user invokes it. These docs govern the skill's conversational and analytical flow.

### `20_runtime/20_INTAKE_PROTOCOL.md`

**Purpose.** Defines the exact opening moves of an advisor session. What the skill asks, in what order, and how the answers shape the rest of the analysis.

**Contents required:**
- Session opener template: how the advisor greets the user and asks for the cfg file + context.
- The intake question set, with exact phrasing and rationale for each:
  1. OpenSIPS version (explicit ask, parseable auto-detect as fallback).
  2. Deployment context: public-facing edge / internal / carrier SBC / lab-test.
  3. Authentication mode: digest / JWT / IP-trust / mixed / none.
  4. Front-end: direct-to-Internet / behind HAProxy or nginx / behind CDN.
  5. Profile selection: L1 (default) / L2 (strict) / custom.
- Mapping of answers to analysis parameters (which profile gets chosen, which rule families get emphasized, which default thresholds apply).
- Minimum-viable-intake: what questions can be skipped if the user supplies a cfg that answers them implicitly (e.g., `listen=tls:...` implies public-facing is possible).
- Intake failure modes: what to do if the user refuses to answer, provides contradictory answers, or supplies a cfg that fails to parse.
- Re-intake: how a user mid-session can change context ("actually this is a lab, re-run at L1").

**Length.** 4–5 pages.

**Dependencies.** References `13_PROFILE_MODEL.md`, `14_VERSION_STRATEGY.md`.

---

### `20_runtime/21_ANALYSIS_PIPELINE.md`

**Purpose.** The ordered traversal of the detection engine. What happens after intake, in what order, with what intermediate artifacts.

**Contents required:**
- Pipeline diagram: intake → parse → structural pass → value/pattern pass → dataflow/taint pass → semantic/contextual pass → triage → verification → scoring → reporting.
- For each pass, a section covering: which rules run, what input state is consumed, what output state is produced, how findings accumulate into the intermediate result set.
- Parse phase: the deterministic script output format (parsed model JSON). What the model contains: loaded_modules, modparams, route definitions, listen directives, include chains, global settings.
- Structural pass: rules that check *presence or absence* of directives (e.g., "mf_process_maxfwd_header is missing from request_route"). Runs on parsed model only, no LLM.
- Value/Pattern pass: rules that check *values of directives* (e.g., "verify_cert=0"). Parsed model + regex/pattern match, minimal LLM.
- Dataflow/Taint pass: rules that trace SIP-sourced variables to sinks (e.g., "$fU flows into avp_db_query without s.escape.common"). Requires route-traversal, LLM reasoning over parsed model.
- Semantic/Contextual pass: rules that identify emergent misconfiguration (e.g., "MI http on 0.0.0.0 + registrar loaded + no mi_trusted_clients = admin exposure"). Heavy LLM reasoning.
- Triage: deduplication by fingerprint, correlation of related findings (e.g., three findings that stem from one root cause collapse into one primary + two related_locations).
- Verification: the second-pass critique per `15_CONFIDENCE_AND_VERIFICATION.md`.
- Scoring: enrichment with CVSS 4.0 vector, CWE, OWASP, ATT&CK tags.
- Reporting handoff: what the scored findings look like when they leave the engine and enter the reporting layer.

**Length.** 8–10 pages.

**Dependencies.** References every other architectural spec.

---

### `20_runtime/22_REPORT_TEMPLATES.md`

**Purpose.** The exact structure of the advisor's two output artifacts: the human-readable Markdown report and the machine-readable SARIF log.

**Contents required:**
- Markdown report template, section by section:
  - Executive Summary (hardening index 0–100, finding counts by severity, top 3 in prose).
  - Methodology & Scope (profile applied, OpenSIPS version, modules in scope, intake answers).
  - Findings (sorted by severity desc, confidence desc, module family; grouped by family with collapsible sub-sections).
  - Remediation Roadmap (table: finding_id, title, severity, effort T-shirt size, priority bucket: this week / this sprint / this quarter).
  - Appendix A — Full SARIF (inline or referenced).
  - Appendix B — Suppressions & Deferred (audit trail).
- Per-finding Markdown block template with exact heading levels, field display order, code-fence conventions for BAD/GOOD examples.
- Hardening index calculation: how the 0–100 score is derived from finding counts, weighted by severity. Formula documented and versioned.
- SARIF log template: complete skeleton showing top-level structure (sarifLog → runs → tool → results → rule → location → fix → suppressions → taxonomies), with placeholders for advisor-specific fields in `properties` bags.
- Examples: one tiny report (clean cfg, few findings) and one substantial report (vulnerable cfg, many findings) showing all template features.

**Length.** 8–10 pages.

**Dependencies.** References `11_FINDING_SCHEMA.md`.

---

### `20_runtime/23_SUPPRESSION_PROTOCOL.md`

**Purpose.** How users suppress findings they disagree with, and how the advisor honors (or challenges) those suppressions.

**Contents required:**
- Three suppression mechanisms:
  1. **In-source** — `#! opensips-advisor: ignore OSIPS-SEC-X reason="..." expires=YYYY-MM-DD` comments in the cfg itself.
  2. **External** — `.opensips-advisor/suppressions.yaml` file alongside the cfg.
  3. **Policy** — natural-language policies in `references/policy/site.md` (Corgea PolicyIQ style) that the LLM consults during triage.
- Suppression record shape: `{rule_id, location_glob, justification, expires, approver}`.
- Honor rules: the advisor suppresses the finding from the report but still includes it in Appendix B with suppression metadata.
- Challenge rules: if a suppression is expired, advisor warns in Appendix B. If a suppression cites a "compensating control" but the advisor cannot verify the control exists in the cfg, advisor warns.
- Never-suppressible set: some rules (e.g., active-exploit CVE-gated findings) are marked `suppressible: false` in their frontmatter. Advisor reports these even when suppressed, with a note.
- Audit trail: every suppression applied is logged with reason in the Markdown report and in the SARIF output.

**Length.** 3–4 pages.

**Dependencies.** References `12_RULE_CATALOG_SCHEMA.md` for `suppressible` field.

---

### `20_runtime/24_INTERACTION_PATTERNS.md`

**Purpose.** Concrete dialogue shapes for common advisor interactions. Gives the implementing agent examples to pattern-match against.

**Contents required:**
- Pattern 1: "Analyze this cfg." Full walkthrough from user uploads cfg through intake questions, analysis, and report delivery.
- Pattern 2: "Harden from scratch." No cfg provided yet; advisor asks about intended deployment, produces a baseline L1 or L2 recommended cfg skeleton.
- Pattern 3: "Why did you flag this?" User questions a specific finding; advisor explains by showing grounding, rationale_trace, and references.
- Pattern 4: "Suppress this with justification." User accepts the finding but wants it removed for this deployment; advisor records the suppression per `23_SUPPRESSION_PROTOCOL.md`.
- Pattern 5: "Re-analyze with changed context." User corrects intake answer mid-session; advisor re-runs affected rules.
- Pattern 6: "Show me everything about family X." User wants to deep-dive one module family; advisor lists all rules in that family with status for this cfg.
- Pattern 7: "Compare L1 vs L2 for this cfg." User wants to see what additional findings L2 would add.
- Non-patterns: things the advisor politely declines — writing exploits, modifying the cfg in place, running OpenSIPS, suggesting social engineering defenses.

**Length.** 5–6 pages.

**Dependencies.** References most of Tier 1 and 2.

---

## Tier 3 — Rule Catalog

The bulk of the authoring work. Each rule is its own file; each module family has an index.

### `30_rules/_CATALOG_INDEX.md`

**Purpose.** Global routing document. Lists every rule with id, title, severity, confidence, family, tags. The SKILL.md router uses this to pick which family indexes or individual rules to load.

**Contents required:**
- Table of all rules sorted by family, with columns: `id`, `title`, `severity`, `default_confidence`, `profile`, `version_applicability`, `one_line_summary`.
- Quick lookup by CWE.
- Quick lookup by severity.
- Family summary: for each of the 12 families, one paragraph describing what attacks it covers and pointing at the family _index.md.

**Length.** 4–6 pages (grows with rules).

**Dependencies.** Auto-generated or semi-auto-generated from rule frontmatter once rules exist.

---

### `30_rules/<family>/_index.md` (12 files, one per family)

**Purpose.** Per-family router and rationale. Reader lands here to understand what the family covers before diving into individual rules.

**Contents required (per family):**
- Family name and one-paragraph scope description.
- Attack model: what kinds of attacks this family defends against.
- List of rules in the family with `id`, `title`, `severity`, `profile`, `one_line_summary`.
- Inter-family relationships: which other families have related rules (e.g., auth family references injection family for auth_jwt SQLi).
- Common false-positive traps for this family.
- Version-specific notes if the whole family has version divergence (rare).

**Length.** 2–3 pages per family × 12 = ~30 pages total.

**Dependencies.** Written alongside or after the family's rule files.

---

### `30_rules/<family>/OSIPS-SEC-<FAMILY>-NNN.md` (~40–60 files)

**Purpose.** The actual rule. Each file is a self-contained detection spec per `12_RULE_CATALOG_SCHEMA.md`.

**Contents required per rule (enforced by schema):**
- YAML frontmatter with every mandatory field.
- Body sections in required order: Rationale, Default Value, Audit, Remediation, Example (BAD/GOOD), optional Version Notes, optional False-Positive Considerations, optional Related Rules, optional Additional References.

**Family-by-family estimated rule counts** (based on Phase 2 master reference + Phase 3 gap analysis):

| Family | Est. rules | Priority | Representative rules |
|---|---|---|---|
| `auth` | 8 | P0 | plaintext-ha1, auth-after-routing, missing-challenge, jwt-db-mode-cve, digest-leak-oracle, weak-nonce-expire, jwt-alg-none, jwt-kid-injection |
| `injection` | 6 | P0 | sql-inj-avp-db-query, sql-inj-sqlops-raw, exec-msg-injection, exec-setvars, cachedb-raw-injection, crlf-append-hf |
| `mi_exposure` | 5 | P0 | mi-http-public-bind, mi-datagram-udp, mi-no-trusted-clients, mi-xmlrpc-no-auth, httpd-cleartext |
| `tls` | 7 | P1 | verify-cert-disabled, require-cert-missing, weak-tls-method, weak-ciphers, tls-key-world-readable, no-peer-verify-check, ws-origin-disabled |
| `relay_and_routing` | 5 | P1 | open-relay-no-isself, preloaded-route-unblocked, permissions-wildcard, record-route-on-register, max-forwards-missing |
| `dos_defense` | 5 | P1 | no-pike, no-ratelimit, global-ratelimit-only, send-reply-under-flood, no-concurrent-call-cap |
| `stir_shaken` | 4 | P2 | x5u-scheme-unchecked, freshness-too-loose, ca-list-missing, tn-auth-list-unchecked |
| `media` | 4 | P2 | rtpengine-no-strict-source, rtpengine-learning-delayed, siprec-cleartext, siprec-exposed-srs |
| `tracing_and_logging` | 4 | P2 | xlog-leaks-auth-headers, hep-cleartext, hep-public-bind, acc-crlf-injection |
| `identity_spoofing` | 3 | P2 | topology-hiding-weak-pw, uac-replace-before-acc, uac-replace-before-stir |
| `config_hygiene` | 4 | P3 | cleartext-credentials-modparam, shv-tainted-assignment, route-recursion, startup-route-exec |
| `dispatcher_and_lb` | 3 | P3 | drouting-writable-db, dispatcher-concurrent-reload, dispatcher-socket-filter-all |

**Total estimated: ~58 rules.**

**Length per rule.** 1–2 pages, Markdown with frontmatter.

**Dependencies.** Each rule depends on `12_RULE_CATALOG_SCHEMA.md`. Rules cite `90_reference/01_master_vulnerability_reference.md` and `90_reference/02_enable_security_gap_analysis.md` as source material.

**Authoring strategy.** Author family by family, highest-priority first. Within a family, write 1–2 rules first and get them reviewed for format fidelity, then bulk-draft the rest.

---

## Tier 4 — Version Overlays

### `40_versions/3.4.md`, `3.5.md`, `3.6.md`

**Purpose.** Narrative orientation for the agent about what each OpenSIPS version brings, changes, or removes from a security-relevant perspective. These are NOT duplicated rules; they are cross-references to rules that have version-specific behavior.

**Contents required per version:**
- Release date, support status (LTS / non-LTS / EOL date if known).
- Modules added, removed, deprecated in this version (security-relevant subset).
- Security-relevant syntax changes from the prior version.
- CVEs that were introduced, fixed, or remain open in this version.
- Applicable-rule index: list of rules whose applicability is conditional on this version (either only-fires-on-this-version, or fires-with-different-remediation).
- Upgrade-path security considerations: what an admin moving from N to N+1 should re-check.

**Length.** 3–4 pages per version.

**Dependencies.** References the rule catalog; updated when rules are added that have version-specific behavior.

---

## Tier 5 — Test Fixtures

Without these, the advisor cannot be verified correct. Each fixture is a cfg file paired with an expected-output file.

### `50_fixtures/README.md`

**Purpose.** How fixtures work, how they map to rules, how to add new ones.

**Contents required:**
- Fixture directory layout and naming conventions.
- Format of `.expected.json`: the canonical set of findings the advisor should produce for the paired cfg, including confidence levels and suppression expectations.
- How a fixture is validated: the advisor is run against the cfg, its output is compared against the expected.json; diffs are reviewed.
- How to add a new fixture when adding a new rule.
- Coverage requirement: every rule must have at least one `vulnerable/` fixture that exercises it and at least one `clean/` fixture where it does NOT fire.

**Length.** 3 pages.

**Dependencies.** Referenced by every rule authoring chat.

---

### `50_fixtures/vulnerable/` (~15–20 cfg files)

**Purpose.** Intentionally bad configurations, each targeting one or more rules.

**Contents per fixture:** a named cfg file (e.g., `auth-plaintext-ha1.cfg`) + a paired `.expected.json` listing which findings should be produced. Each vulnerable fixture should target one primary rule but may trigger several related rules as a side effect.

**Coverage plan:** at least one vulnerable fixture per P0 and P1 rule family (top 6 families), plus cross-cutting fixtures that combine multiple flaws.

---

### `50_fixtures/clean/` (~5 cfg files)

**Purpose.** Well-configured cfgs representing best-practice L1 and L2 deployments. Advisor should produce zero findings (or only informational notes) against these.

**Contents:**
- `clean-l1-enterprise-pbx.cfg` — typical enterprise-PBX-behind-firewall L1-compliant config.
- `clean-l2-carrier-sbc.cfg` — carrier-grade L2-compliant SBC config.
- `clean-minimal-lab.cfg` — minimal lab/dev config that declares itself as such.
- `clean-webrtc-gateway.cfg` — WebRTC-to-SIP gateway L1+.
- `clean-registrar-only.cfg` — dedicated registrar node.

Each paired with `.expected.json` showing empty or informational-only findings.

---

### `50_fixtures/tricky/` (~10 cfg files)

**Purpose.** Edge cases that test advisor discipline: false-positive traps, Kamailio conflations, partially-mitigated configs, version-mismatched configs.

**Representative tricky fixtures:**
- `kamailio-dialect.cfg` — contains `sanity_check()`, `allow_address()`, `secfilter`. Advisor must detect this is not an OpenSIPS cfg and warn, not emit rule findings.
- `partially-mitigated-sqli.cfg` — `avp_db_query` with `$fU` but wrapped in `{s.escape.common}`. Advisor must NOT fire the SQLi rule.
- `custom-sanitizer.cfg` — uses a custom Perl sanitizer before DB query. Advisor should abstain with `review_required`, not fire or pass confidently.
- `version-mismatch.cfg` — uses 3.2 syntax but user declared 3.6. Advisor should warn about version discrepancy before analysis.
- `compensating-control.cfg` — MI exposed on 0.0.0.0 but with suppression citing "nginx reverse proxy with mTLS". Advisor should honor suppression but note unverifiable.
- `false-positive-cvss-gate.cfg` — uses `auth_jwt db_url` on OpenSIPS 3.6.5 (post-CVE-2026-25554 fix). Advisor must NOT fire CVE rule.
- `nested-includes.cfg` — cfg uses `include_file` with secrets extracted to a separate file. Advisor must follow includes.
- `commented-bad.cfg` — bad directive exists but is commented out. Advisor must NOT fire.
- `dead-code.cfg` — bad directive exists in an unreachable route. Advisor should fire with medium confidence and note reachability concern.
- `multi-listener.cfg` — OpenSIPS with TLS + WSS + UDP listeners; each has different hardening requirements.

Each paired with `.expected.json` documenting what the advisor *should* do (often: a specific non-firing, or an abstention).

---

### `50_fixtures/golden_reports/` (~3–5 full reports)

**Purpose.** Reference outputs showing "this is what a good advisor report looks like." Used to calibrate the agent's Markdown formatting and tone.

**Contents:**
- `golden_clean_l1.md` — full report against `clean-l1-enterprise-pbx.cfg`. Hardening index near 100, empty findings section, informational appendix.
- `golden_vulnerable_mixed.md` — full report against a cfg with ~10 findings spanning 5 severity levels. Exercises all sections of the template.
- `golden_tricky_abstention.md` — full report against `custom-sanitizer.cfg` showing how review_required findings are surfaced.

**Length per report.** 5–15 pages.

**Dependencies.** Must be consistent with `22_REPORT_TEMPLATES.md`.

---

## Tier 6 — Inherited Reference Material

Already authored in prior research phases. Not rewritten; placed in the package for the agent to consult.

### `90_reference/01_master_vulnerability_reference.md`

**Source.** Phase 2 research output (the 17-section comprehensive reference).
**Role.** Primary source material for rule authoring. When drafting a rule, consult the corresponding section here for the vulnerability description, BAD/GOOD patterns, detection signals, and version notes.
**Action needed.** Copy-import into the package; update cross-references to point at the advisor's rule IDs once rules exist.

---

### `90_reference/02_enable_security_gap_analysis.md`

**Source.** Phase 3 research output (22-section gap analysis).
**Role.** Identifies the 22 additional coverage areas and maps them to rule families. Particularly the top 3 critical gaps (MI exposure, SIP Digest Leak oracle, auth_jwt full taxonomy) which drive P0 rule authoring.
**Action needed.** Copy-import; cross-link each gap to the rule(s) that close it.

---

### `90_reference/03_advisor_methodology_research.md`

**Source.** Phase 5 research output (comparative SAST/CIS/SARIF/LLM analysis).
**Role.** Justifies every architectural decision. When a future chat questions "why CVSS 4.0 not 3.1" or "why dual output," this is the evidence document.
**Action needed.** Copy-import; ensure architectural specs in Tier 1 cite specific sections.

---

### `90_reference/external_sources.md`

**Purpose.** Curated, authoritative external link catalog that rules can cite without re-discovering.

**Contents required:**
- OpenSIPS official documentation links per module.
- OpenSIPS blog posts relevant to security.
- OpenSIPS GitHub security advisories (by GHSA ID).
- Enable Security audit report and blog posts.
- AISLE CVE-2026-25554 writeup.
- CVE databases (NVD entries for each OpenSIPS CVE).
- OWASP SIP security, CWE entries most commonly referenced.
- SARIF 2.1.0 specification.
- CVSS 4.0 specification.
- Relevant academic papers (IRIS, SAST-Genius) for methodology backing.

**Length.** 3–4 pages.

**Dependencies.** Grows as rules cite new sources.

---

## SKILL.md (authored last)

### `SKILL.md`

**Purpose.** The entry point Claude loads when the advisor skill activates. Per Claude skill progressive-disclosure architecture: short description in frontmatter, body that routes to references.

**Contents required:**
- YAML frontmatter: `name: opensips-security-advisor`, `description: "Analyzes OpenSIPS configuration files (opensips.cfg) for script-layer security vulnerabilities across OpenSIPS 3.4 LTS, 3.5, and 3.6 LTS. Produces SARIF and Markdown reports covering authentication, TLS, injection, DoS, MI exposure, media, STIR/SHAKEN, and related misconfigurations."`
- Body: intake router (ask the 5 intake questions from `20_INTAKE_PROTOCOL.md`); pointer to `10_SKILL_STACK.md` for architecture when needed; pointer to `30_rules/_CATALOG_INDEX.md` for rule lookup; pointer to family indexes for deep-dive.
- Explicit instruction to load family `_index.md` before pulling individual rule files (token economy).
- Explicit instruction to read `02_GLOSSARY.md` once at session start to avoid Kamailio conflation.
- Explicit instruction on when to consult `90_reference/` vs when to work from rule files (rules are normative; references are background).

**Length.** 2–3 pages plus frontmatter.

**Dependencies.** Authored last; references everything.

---

## Authoring sequence (for future chats)

### Phase 6a — Foundation (first follow-up chat)
Author Tier 0 + Tier 1 + Tier 2. Total ~14 docs, ~60 pages. Output: the advisor has a complete operating manual before a single rule exists.

### Phase 6b — Rule catalog (multiple follow-up chats)
Family by family, priority order:
- **Chat B1:** `auth/` family — 8 rules + index.
- **Chat B2:** `injection/` family — 6 rules + index.
- **Chat B3:** `mi_exposure/` family — 5 rules + index.
- **Chat B4:** `tls/` family — 7 rules + index.
- **Chat B5:** `relay_and_routing/` + `dos_defense/` families.
- **Chat B6:** `stir_shaken/` + `media/` families.
- **Chat B7:** `tracing_and_logging/` + `identity_spoofing/` families.
- **Chat B8:** `config_hygiene/` + `dispatcher_and_lb/` families.
- **Chat B9:** `_CATALOG_INDEX.md` finalization.

Each chat authors ~5–13 rules + 1–2 family index files. Chats share the locked Tier 1 specs; no re-litigation.

### Phase 6c — Versions + fixtures (parallelizable follow-up chats)
- **Chat C1:** `40_versions/3.4.md`, `3.5.md`, `3.6.md`.
- **Chat C2:** `50_fixtures/vulnerable/` — all vulnerable fixtures.
- **Chat C3:** `50_fixtures/clean/` + `50_fixtures/tricky/`.
- **Chat C4:** `50_fixtures/golden_reports/`.

### Phase 6d — Integration (final follow-up chat)
- `SKILL.md` authored last.
- Reference material imported into `90_reference/`.
- Cross-link sweep: every rule cites its sources in the reference material.
- Final `00_README.md` status update.

---

## Handoff checklist for follow-up chats

Each follow-up chat should receive:

1. This manifest (`opensips-advisor-file-manifest.md`).
2. The three prior research artifacts (`90_reference/01/02/03`).
3. The specific tier or family it is authoring.
4. Any Tier 0–2 specs that are already locked (if working on Tier 3–5).
5. The relevant memory entries from the project.

Each follow-up chat should produce:

1. The draft documents in their correct paths.
2. A short report-back listing any architectural questions that surfaced and were *not* in scope for that chat.
3. Updated status in `00_README.md`.

Nothing in this manifest is meant to be re-opened in an authoring chat unless explicitly called out. Architectural decisions are locked here.
