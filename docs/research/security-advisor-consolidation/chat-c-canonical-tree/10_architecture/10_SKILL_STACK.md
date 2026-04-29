# OpenSIPS Security Advisor — Skill Stack

**Status.** Locked as of Phase 6a. Load-bearing for every downstream
spec, rule, and fixture.

This document is the architectural spine of the advisor. It defines
the seven layers, what each consumes and produces, where each lives
on disk, and — equally important — what each layer is *not* allowed
to do. Every later spec in Tier 1 and Tier 2 binds to a specific
layer here. Every rule, fixture, and report-template element traces
back to one of these seven layers.

The 7-layer decomposition is not arbitrary. It mirrors the canonical
SAST pipeline (intake → model → rules → analysis → triage →
reporting) widely documented in the SAST methodology literature
[P5 §TBD — "comparative SAST methodology"], with three OpenSIPS-specific
adaptations: a separate Configuration Layer between rules and engine
(profile selection, override handling, suppression resolution), a
Detection Engine that explicitly splits into four sub-phases by
analytical nature (structural / value-pattern / dataflow /
semantic-contextual), and a Triage layer that includes LLM-judge
verification per `15_CONFIDENCE_AND_VERIFICATION.md`.

---

## The layer map

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1 — INTAKE                                               │
│  user request, cfg upload, deployment context                   │
└────────────────────┬────────────────────────────────────────────┘
                     │ cfg text, intake answers, profile selection
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2 — PARSING / MODEL CONSTRUCTION                         │
│  cfg → structured parsed model (JSON)                           │
└────────────────────┬────────────────────────────────────────────┘
                     │ parsed model
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3 — RULE CATALOG                                         │
│  the 30_rules/ tree, loaded by family                           │
└────────────────────┬────────────────────────────────────────────┘
                     │ applicable rule set
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4 — CONFIGURATION                                        │
│  profile selection, version gate, suppressions, overrides       │
└────────────────────┬────────────────────────────────────────────┘
                     │ filtered + parameterized rule set
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5 — DETECTION ENGINE                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ 5a Structural│→│ 5b Value/    │→│ 5c Dataflow/ │            │
│  │              │  │   Pattern    │  │   Taint      │            │
│  └──────────────┘  └──────────────┘  └──────┬───────┘           │
│                                             ▼                    │
│                                      ┌──────────────┐           │
│                                      │ 5d Semantic/ │           │
│                                      │   Contextual │           │
│                                      └──────┬───────┘           │
└─────────────────────────────────────────────┼───────────────────┘
                                              │ raw findings
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 6 — TRIAGE / POST-PROCESSING                             │
│  dedup, correlation, verification pass, scoring                 │
└────────────────────┬────────────────────────────────────────────┘
                     │ scored, verified findings
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 7 — REPORTING                                            │
│  Markdown report + SARIF 2.1.0 log                              │
└─────────────────────────────────────────────────────────────────┘
```

Data flows top-to-bottom. The only permitted backward edges are: (a)
Layer 6's verification pass may invoke Layer 5d for a re-check, and
(b) Layer 1 may re-run the entire pipeline if the user mid-session
amends an intake answer (per
`24_INTERACTION_PATTERNS.md` Pattern 5).

---

## Layer 1 — Intake

**Purpose.** Collect everything the advisor needs to know about the
deployment under review before parsing begins. Without this layer the
advisor cannot pick a profile, gate version-specific rules, or
calibrate severity for the deployment's context.

**Inputs.**
- The cfg file (uploaded or pasted).
- User answers to the five intake questions
  (`20_INTAKE_PROTOCOL.md`): OpenSIPS version, deployment context,
  authentication mode, front-end posture, profile selection.
- Optional: a suppression file (`.opensips-advisor/suppressions.yaml`)
  or natural-language site policy
  (`references/policy/site.md`).

**Outputs.**
- Normalized session context: `{cfg_text, opensips_version,
  deployment_context, auth_mode, frontend, profile,
  suppressions[]}`.
- Sanity warnings: declared version vs. observed cfg syntax,
  contradictory answers, missing files, Kamailio-idiom red flags.

**Physical location.**
- Spec: `20_runtime/20_INTAKE_PROTOCOL.md`.
- Implementation: handled by the Claude skill itself at session
  start, before any rule loading.

**Responsibilities.**
- Solicit and validate intake answers.
- Detect engine-confusion early (Kamailio-only directives in the cfg).
- Surface suppression file presence.
- Hand off a complete session context to Layer 2.

**Anti-responsibilities.**
- Layer 1 does not parse the cfg into a model. It reads the cfg text
  to do *coarse* sanity checks (syntax-shape detection, engine
  identification) and nothing more.
- Layer 1 does not pick which rules apply. That is Layer 4's job.
- Layer 1 does not produce findings. It produces *warnings* about
  intake quality; warnings are not findings and never appear in the
  Findings section of the report.

**Precedent.** SAST tooling intake patterns (Semgrep CLI args,
SonarQube project setup, Corgea workspace context capture)
[P5 §TBD — "tool initialization conventions"]. The five-question
shape draws specifically from compliance-oriented SAST onboarding
flows where deployment context determines which rule sets are
relevant.

---

## Layer 2 — Parsing / Model Construction

**Purpose.** Turn the cfg text into a structured object the rest of
the pipeline can reason over. Without this layer, every rule would
re-parse cfg from scratch, producing inconsistent matches and
location data.

**Inputs.**
- Cfg text (possibly multi-file via `include_file` chains).
- Declared OpenSIPS version (for syntax-variant handling).

**Outputs.**
- A parsed model — JSON structure documented in
  `21_ANALYSIS_PIPELINE.md` — containing at minimum:
  - `loaded_modules[]`
  - `modparams[]` (per module)
  - `route_definitions{}` keyed by route name and type
  - `listen_directives[]`
  - `include_chain[]`
  - `global_settings{}`
  - `comments_index[]` (for suppression parsing)
  - `source_locations{}` (every parsed node carries a
    `{file, line, column}` triple)

**Physical location.**
- Spec: `21_ANALYSIS_PIPELINE.md` (parse-phase section).
- Implementation: a deterministic parsing script invoked by the
  skill, ideally outside the LLM context window. Project memory
  notes that an MCP server already produces parsed OpenSIPS
  documentation objects (core variables, statistics, module
  documentation); the cfg parser is a sibling effort that consumes
  the cfg itself.

**Responsibilities.**
- Resolve `include_file` chains to a single logical model.
- Preserve source locations for every node (line + column).
- Index comments separately so suppression-comment scanning
  (`23_SUPPRESSION_PROTOCOL.md`) can run without re-parsing.
- Distinguish commented-out directives from active ones — the
  fixture `commented-bad.cfg` exists specifically to verify this
  boundary.
- Mark unreachable code (routes never called) — flagged but not
  excluded from analysis (the fixture `dead-code.cfg` covers the
  expected behavior).

**Anti-responsibilities.**
- The parser does not interpret rules. It produces a faithful model
  of what the cfg *says*, not what it *means*.
- The parser does not call out to an LLM. It is deterministic. LLM
  reasoning enters at Layer 5c and 5d, never here.
- The parser does not modify the model based on intake answers.
  Profile and version gating happen in Layer 4.

**Precedent.** Tree-sitter and ANTLR-based parsers in modern SAST
[P5 §TBD — "deterministic parser foundations for LLM-augmented
analysis"]. The "parse first, reason later" decomposition is a
load-bearing pattern for hybrid deterministic-plus-LLM analysis: it
prevents the LLM from hallucinating cfg structure that does not
exist.

---

## Layer 3 — Rule Catalog

**Purpose.** Hold the durable, version-controlled body of detection
knowledge. The catalog is what the advisor *knows*; everything else
is what the advisor *does* with that knowledge.

**Inputs.**
- None at runtime — the catalog is static. It is loaded into the
  pipeline by reference, not consumed as a stream.

**Outputs.**
- The set of rule files matching a query: by family, by id, by
  CWE, by severity, etc.

**Physical location.**
- `30_rules/_CATALOG_INDEX.md` — global router.
- `30_rules/<family>/_index.md` — per-family routers (12 of these).
- `30_rules/<family>/OSIPS-SEC-<FAMILY>-<NNN>.md` — individual rule
  files.

**Responsibilities.**
- Carry the canonical text of every rule: rationale, audit pattern,
  remediation, examples.
- Carry frontmatter that the engine reads as structured metadata:
  applicability gates (version, modules-loaded), profile, severity,
  confidence baseline, references.
- Expose a global index and per-family indexes so the engine can
  load only what it needs.

**Anti-responsibilities.**
- The catalog does not run rules. A rule file is a description of
  what to detect and how to remediate; the engine (Layer 5)
  executes against the parsed model.
- The catalog does not maintain runtime state. No per-session
  data, no caches, no findings live here.
- The catalog does not embed engine-version-specific code. Rules
  are declarative; engine version compatibility is expressed through
  the `engine_version_min`/`engine_version_max` frontmatter fields.

**Precedent.** Semgrep's rule-as-file model, SonarQube's quality
profiles, the CIS Benchmark recommendation file structure
[P5 §TBD — "rule catalog organization"]. The Markdown-with-YAML
shape is taken from common SAST authoring patterns and adapted to
Claude skill progressive disclosure: rule files are individually
loadable, family indexes provide cheap previews, and the global
index is the entry point.

---

## Layer 4 — Configuration

**Purpose.** Decide *which rules apply to this run, with what
parameters*. This layer is what makes the advisor adaptive: the
same catalog produces different rule sets for an enterprise PBX vs.
a carrier SBC, for OpenSIPS 3.4 vs. 3.6, for an L1 review vs. an L2
review.

**Inputs.**
- Session context from Layer 1.
- The full rule catalog from Layer 3.

**Outputs.**
- A *parameterized rule set*: rules filtered by applicability and
  annotated with run-specific parameters.
- A suppression manifest, resolved against the rule set.
- Override decisions: per-rule profile lifts/lowers, per-rule
  severity overrides, per-rule disable.

**Physical location.**
- Spec: `13_PROFILE_MODEL.md`, `14_VERSION_STRATEGY.md`,
  `23_SUPPRESSION_PROTOCOL.md`.
- Implementation: a rule-filtering pass that runs after intake and
  before Layer 5.

**Responsibilities.**
- Apply profile gating: if `profile=L1` and the rule's frontmatter
  declares `profile: [L2]`, the rule is excluded for this run.
- Apply version gating: if the cfg's declared OpenSIPS version is
  outside the rule's `applies_if_opensips_version` range, the rule
  is excluded.
- Apply module-loaded gating: if the rule declares
  `applies_if_modules_loaded: [auth_jwt]` and the cfg does not load
  `auth_jwt`, the rule is excluded.
- Resolve suppressions against the rule set: a rule is not excluded
  by a suppression (suppressions act on findings, not rules), but
  the suppression metadata is attached for use by Layer 6.
- Honor user overrides: per-rule profile lifts, per-rule
  severity overrides.

**Anti-responsibilities.**
- Layer 4 does not detect anything. Filtering is not detection.
- Layer 4 does not change a rule's *content*. It can disable a
  rule for this run, lift its profile, override its severity — but
  it cannot rewrite its detection logic.
- Layer 4 does not produce findings.

**Precedent.** SonarQube quality profiles selecting which rules a
project's analysis uses; the CIS Benchmark profile model
[P5 §TBD — "profile-based rule selection"]. The separation of *which
rules* (Layer 4) from *how rules detect* (Layer 5) follows common
SAST tooling and prevents profile changes from invalidating
detection logic.

---

## Layer 5 — Detection Engine

**Purpose.** Run the parameterized rule set against the parsed model
and produce raw findings. This is where the advisor's analytical
work happens.

**Inputs.**
- Parsed model from Layer 2.
- Parameterized rule set from Layer 4.

**Outputs.**
- Raw finding stream: each finding annotated with the rule that
  fired, the location(s) it fired against, the evidence the engine
  used, a draft severity and confidence, and a verification status
  of `unchecked`.

**Physical location.**
- Spec: `21_ANALYSIS_PIPELINE.md` (sub-phase sections).
- Implementation: a four-sub-phase pipeline (5a → 5b → 5c → 5d).

The engine is split into four sub-phases by *analytical nature*, not
by module family. The split is normative: a rule declares its phase
in frontmatter, and the engine routes execution accordingly. This
separation is the single most important structural property of the
detection engine; it lets the deterministic phases run cheaply and
quickly without LLM cost, and it isolates the LLM-heavy phases for
verification budget management.

### 5a — Structural pass

**What it checks.** Presence or absence of directives. Cardinality
constraints. Required-but-missing patterns.

**Examples.**
- "Module `tm` is loaded but `mf_process_maxfwd_header` is never
  called in `request_route`." (absence in a required position)
- "`listen=` directive present for udp:5060 but no corresponding
  TLS listener." (cardinality)

**Determinism.** Fully deterministic. No LLM. Runs on the parsed
model only. Fast.

**Verification status default.** `deterministic_confirmed` —
structural matches are self-evident from the parsed model.

**Rule shape example.**
```yaml
phase: structural
audit: |
  In the parsed model: route_definitions["request_route"].calls
  must contain "mf_process_maxfwd_header()". If not, fire.
```

### 5b — Value/Pattern pass

**What it checks.** The values of directives or modparams, against
literal or regex patterns.

**Examples.**
- "`modparam("tls_mgm", "verify_cert", 0)` — verify_cert disabled."
- "`auth_db.password_column = 'plaintext_password'` — plaintext
  password column."
- "`listen=tls:0.0.0.0:5061` with no `tls_method` set in 3.4."

**Determinism.** Mostly deterministic (regex / value match). LLM
involvement is minimal — typically just to interpret the *intent*
of a non-obvious value, never to do the matching itself.

**Verification status default.** `deterministic_confirmed` for
literal matches; `judge_confirmed` for value-intent matches that
required LLM interpretation.

### 5c — Dataflow / Taint pass

**What it checks.** Whether SIP-derived (tainted) data reaches a
dangerous sink without passing through an appropriate sanitizer.
Requires traversing route blocks and tracking variable assignments.

**Examples.**
- "`$fU` flows into `avp_db_query()` argument 1 without
  `s.escape.common` applied." (classic SQL injection shape)
- "`$hdr(X-Custom)` is assigned to `$avp(forward_to)` and then
  used in `t_relay()` target — header-controlled relay
  destination."
- "`$ua` is logged via `xlog()` with format string position — log
  injection."

**Determinism.** Hybrid. Variable tracking and route traversal are
deterministic; the *judgment* about whether a sanitizer is
appropriate for a given sink is LLM. The engine constructs a
candidate dataflow path deterministically, then asks the LLM to
adjudicate sanitizer adequacy.

**Verification status default.** `judge_confirmed` (LLM
adjudicated), candidate for re-check during Layer 6 verification
when confidence is medium or low.

### 5d — Semantic / Contextual pass

**What it checks.** Emergent misconfiguration that requires
reasoning across multiple cfg elements and external context. Cannot
be reduced to a structural or pattern match.

**Examples.**
- "MI HTTP listener on `0.0.0.0` + `registrar` module loaded + no
  `mi_trusted_clients` set + cfg declares `deployment_context:
  public-facing` — this is admin-interface exposure to the
  internet."
- "TLS configured but cipher list permits `RSA-DES-CBC3-SHA` *and*
  the deployment context is carrier — fails L2 cipher policy."
- "Two `auth_db_check` calls in `request_route`, the second
  unreachable — likely a copy-paste error, security-relevant
  because the unreachable check is the more restrictive one."

**Determinism.** LLM-heavy. The deterministic preconditions (which
modules are loaded, which directives are present) are checked
first; the LLM reasons about the combination.

**Verification status default.** `unchecked` at emission from 5d;
mandatory verification pass in Layer 6 before final emission with
confidence ≥ medium.

**Anti-responsibilities of Layer 5 as a whole.**
- The engine does not deduplicate. Two rules firing on the same
  line produce two raw findings; correlation is Layer 6's job.
- The engine does not score with CVSS or enrich with CWE/OWASP/
  ATT&CK. Scoring is Layer 6.
- The engine does not write reports. It hands a finding stream
  to Layer 6 and is done.

**Precedent.** The four-sub-phase split is informed by the SAST
literature on hybrid deterministic-plus-LLM analysis (IRIS,
SAST-Genius) [P5 §TBD — "phase decomposition for LLM-augmented
SAST"]. The principle: spend LLM tokens only where structural and
pattern matching cannot answer. Earlier phases provide cheap
filtering; later phases handle what cheap filtering cannot.

---

## Layer 6 — Triage / Post-processing

**Purpose.** Take the raw finding stream from Layer 5 and produce
a clean, scored, verified set of findings ready for reporting.

**Inputs.**
- Raw findings from Layer 5.
- Suppression manifest from Layer 4.
- Rule catalog (for cross-rule correlation hints).

**Outputs.**
- Final finding set: deduplicated, correlated, verified, scored.
- Suppression audit list: which suppressions were applied to
  which findings, with metadata.

**Physical location.**
- Spec: `15_CONFIDENCE_AND_VERIFICATION.md` (verification pass),
  `21_ANALYSIS_PIPELINE.md` (triage flow), `22_REPORT_TEMPLATES.md`
  (handoff format).

**Responsibilities.**
- **Deduplication.** If two findings have the same fingerprint per
  the algorithm in `11_FINDING_SCHEMA.md`, collapse into one.
- **Correlation.** Findings that share a root cause (e.g., three
  separate findings stemming from one missing
  `mf_process_maxfwd_header` call) are linked: one primary
  finding, others as `related_locations`.
- **Verification pass.** For findings whose phase is
  `semantic_contextual` or whose initial confidence is medium/low,
  invoke a second-pass LLM critique. Outcome assigned to
  `verification_status`.
- **Suppression resolution.** Apply suppressions per
  `23_SUPPRESSION_PROTOCOL.md`. Suppressed findings are marked
  for the audit appendix, not omitted entirely.
- **Scoring enrichment.** Attach CVSS 4.0 vector, CWE, OWASP,
  MITRE ATT&CK tags per the rule's frontmatter and the finding
  context. Compute `security_severity` (0–10 numeric) from the
  CVSS vector.
- **Hardening index input.** Compute the per-severity counts that
  the report layer will use to derive the 0–100 index.

**Anti-responsibilities.**
- Layer 6 does not detect. It only operates on findings already
  produced by Layer 5.
- Layer 6 does not format reports. It hands scored findings to
  Layer 7.
- Layer 6 does not modify the parsed model. It is a read-only
  consumer of model + findings.

**Precedent.** SonarQube's issue lifecycle (raw → confirmed →
resolved), Corgea's PolicyIQ + verification pattern
[P5 §TBD — "post-processing for LLM-emitted findings"]. The
verification pass is specifically informed by IRIS / SAST-Genius
methodology where LLM judgment requires a critique step before
emission to keep false-positive rates bounded.

---

## Layer 7 — Reporting

**Purpose.** Emit the dual artifacts every analysis run produces.

**Inputs.**
- Final finding set from Layer 6.
- Session context from Layer 1.
- Hardening index from Layer 6.
- Suppression audit from Layer 6.

**Outputs.**
- Markdown report (NIST SP 800-115 style).
- SARIF 2.1.0 log.

**Physical location.**
- Spec: `22_REPORT_TEMPLATES.md`.
- Implementation: a templating step that consumes the Layer 6
  output and produces both artifacts.

**Responsibilities.**
- Render the Markdown report per the locked template.
- Render the SARIF log per the locked template, embedding all
  finding fields per `11_FINDING_SCHEMA.md`'s mapping.
- Compute the hardening index from finding counts.
- Render the remediation roadmap with effort + priority.
- Render Appendix A (full SARIF inline or referenced) and
  Appendix B (suppressions and deferred findings).

**Anti-responsibilities.**
- Layer 7 does not interpret findings. It renders them faithfully.
- Layer 7 does not run rules.
- Layer 7 does not call out to the LLM beyond minor prose
  rendering (e.g., synthesizing the executive-summary "top 3 in
  prose"). Substantive analysis ends at Layer 6.

**Precedent.** SARIF 2.1.0 specification; NIST SP 800-115's report
shape (executive summary → methodology → findings → roadmap →
appendices) [P5 §TBD — "report taxonomy for security review"]. The
dual-artifact decision is a deliberate accommodation: the SARIF log
satisfies pipeline consumers, the Markdown satisfies humans, and
neither is a transformation of the other — both are produced from
the Layer 6 output independently.

---

## Sequence diagram — single analysis run

```
User                Layer 1            Layer 2            Layer 4            Layer 5            Layer 6            Layer 7
 │                    │                  │                  │                  │                  │                  │
 │── upload cfg ────▶ │                  │                  │                  │                  │                  │
 │                    │                  │                  │                  │                  │                  │
 │◀── intake Q1–5 ── │                  │                  │                  │                  │                  │
 │── answers ───────▶│                  │                  │                  │                  │                  │
 │                    │                  │                  │                  │                  │                  │
 │                    │── cfg + ctx ───▶│                  │                  │                  │                  │
 │                    │                  │                  │                  │                  │                  │
 │                    │                  │── parsed model──▶                  │                  │                  │
 │                    │                  │                  │                  │                  │                  │
 │                    │                  │                  │ (load Layer 3,                       │                  │
 │                    │                  │                  │  filter by ctx)                      │                  │
 │                    │                  │                  │                                      │                  │
 │                    │                  │                  │── parameterized ─▶                  │                  │
 │                    │                  │                  │   ruleset                            │                  │
 │                    │                  │                  │                  │                  │                  │
 │                    │                  │                  │                  │ 5a structural    │                  │
 │                    │                  │                  │                  │ 5b value/pattern │                  │
 │                    │                  │                  │                  │ 5c dataflow      │                  │
 │                    │                  │                  │                  │ 5d semantic      │                  │
 │                    │                  │                  │                  │                  │                  │
 │                    │                  │                  │                  │── raw findings ─▶                  │
 │                    │                  │                  │                  │                  │                  │
 │                    │                  │                  │                  │                  │ dedup            │
 │                    │                  │                  │                  │                  │ correlate        │
 │                    │                  │                  │                  │                  │ verify (5d→re-check) ◀──┐
 │                    │                  │                  │                  │                  │ apply suppress.  │
 │                    │                  │                  │                  │                  │ score (CVSS, etc)│
 │                    │                  │                  │                  │                  │                  │
 │                    │                  │                  │                  │                  │── final set ───▶ │
 │                    │                  │                  │                  │                  │                  │
 │◀────── Markdown report + SARIF log ──────────────────────────────────────────────────────────────────────────────┤
```

The key non-linear edge: Layer 6's verification pass may invoke
Layer 5d (semantic-contextual rules) to re-check a finding under
critique. This is the only permitted backward edge in steady-state
operation.

---

## Claude-skill progressive disclosure

The advisor is delivered as a Claude skill, which constrains the
shape of how the layers are loaded into context. Project memory
notes the relevant principles already established for the broader
OpenSIPS skill: module-family grouping (10–15 clusters validated as
the sweet spot for tool-selection accuracy), keyword-search fallback
rather than full vector RAG given the structured nature of the
documentation, router-in-SKILL.md to avoid relying on secondary
skill triggering.

The advisor inherits and extends those principles:

- **Layers 1–7 are not all loaded into context simultaneously.**
  SKILL.md loads as the entry point; it carries the intake protocol,
  the layer-1-through-7 map (compact summary), and pointers into the
  Tier 1 specs and Tier 3 family indexes.
- **Tier 1 specs are loaded on demand.** When the advisor needs the
  finding-schema spec to render a finding, it loads
  `11_FINDING_SCHEMA.md`. It does not load all of Tier 1 at session
  start.
- **Tier 3 rules are loaded by family, not individually.** When
  Layer 4 narrows the rule set to "auth + tls + injection", the
  family `_index.md` files load first; individual rule files load
  only when a rule's body is needed (during reporting, or during
  Layer 5d's LLM-heavy reasoning).
- **Tier 6 reference material is loaded on cite.** A rule citing
  `90_reference/01_master_vulnerability_reference.md §3.2` loads
  only that section's worth of context, not the full reference.
- **The router for all of this lives in SKILL.md.** Per project
  memory's validated pattern: do not rely on secondary skill
  triggering, embed the router in the always-loaded entry point.

The token-economy implication: a typical analysis run loads
SKILL.md + 1 finding-schema spec + 2–4 family indexes + 5–15
individual rule files. A worst-case run (carrier SBC, 12 families
all in scope, ~50 rules firing) is bounded by the total rule
catalog size, which the manifest targets at ~40–60 rules. This
keeps a full advisor session within a single Claude context window
even in the worst case — which is the basis for charter success
criterion 2.

---

## How layers cite this document

Every Tier 1 and Tier 2 spec references this document by layer
number. When a downstream spec says "the parser produces a model of
shape X" it is binding to Layer 2's contract here. When a rule
declares `phase: dataflow`, it is binding to Layer 5c. The layer
numbers and the four-sub-phase split are stable and SHOULD NOT be
renumbered without an explicit revisit.

The single permitted change without revisit is *adding* a sub-phase
under Layer 5 — for example, a future 5e for cross-cfg analysis
(comparing two cfg files for delta review) — provided the existing
5a–5d numbering and contracts are preserved.
