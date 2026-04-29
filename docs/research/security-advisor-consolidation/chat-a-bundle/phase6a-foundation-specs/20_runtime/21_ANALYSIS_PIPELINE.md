# OpenSIPS Security Advisor — Analysis Pipeline

**Status.** Locked as of Phase 6a.

This document is the runtime spec for the advisor's analysis
pipeline — what actually happens between "intake completes" and
"report renders." It binds the architectural layers from
`10_SKILL_STACK.md` to concrete runtime behavior: what the
parser produces, what each detection sub-phase consumes and
emits, how triage transforms raw findings into a final scored
set, and where the verification protocol from
`15_CONFIDENCE_AND_VERIFICATION.md` plugs in.

The engine implementer reads this document to know the runtime
contract. The rule author reads it to understand how rules
interact with phase semantics. The reviewer reads it to know
what the advisor did with their cfg before it produced findings.

---

## Pipeline overview

```
┌────────────────────────────────────────────────────────────────────┐
│  Stage 0 — Session context (from intake, 20_INTAKE_PROTOCOL.md)    │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  Stage 1 — Parse                                                   │
│  cfg text → parsed model (deterministic, no LLM)                   │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  Stage 2 — Rule selection (Layer 4)                                │
│  catalog + session → parameterized rule set                        │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  Stage 3 — Detection (Layer 5)                                     │
│   3a structural → 3b value/pattern → 3c dataflow → 3d semantic     │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  Stage 4 — Triage (Layer 6)                                        │
│   dedup → correlate → verify → suppress → score                    │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  Stage 5 — Hand-off to reporting (Layer 7)                         │
└────────────────────────────────────────────────────────────────────┘
```

Stages execute in order. Stage 4 is where the only permitted
backward edge in the pipeline lives: the verification pass within
triage may invoke Stage 3d (semantic) for re-check, per
`10_SKILL_STACK.md`.

---

## Stage 1 — Parse

The parser turns cfg text into a structured model. It is
deterministic, runs without LLM involvement, and produces output
that every later stage reads.

### Inputs

- Cfg text (possibly multi-file via `include_file`).
- Declared OpenSIPS version (for syntax-variant handling).

### Output — the parsed model

A JSON object with the following top-level keys. Every key is
mandatory; absence of relevant cfg content produces an empty
collection, not a missing key.

```json
{
  "loaded_modules": [
    {
      "name": "tls_mgm",
      "loadmodule_location": { "file": "opensips.cfg", "line": 18, "column": 1 }
    }
  ],
  "modparams": [
    {
      "module": "tls_mgm",
      "param": "verify_cert",
      "value": "0",
      "value_type": "integer",
      "location": { "file": "opensips.cfg", "line": 247, "column": 12 }
    }
  ],
  "route_definitions": {
    "request_route": {
      "type": "request_route",
      "name": null,
      "calls": [
        {
          "function": "mf_process_maxfwd_header",
          "args": [],
          "location": { "file": "opensips.cfg", "line": 312, "column": 5 },
          "control_flow": { "in_branch": false, "in_loop": false }
        }
      ],
      "assignments": [
        {
          "lhs": "$avp(forward_to)",
          "rhs": "$hdr(X-Custom)",
          "location": { "file": "opensips.cfg", "line": 318, "column": 5 }
        }
      ],
      "control_structures": [
        { "kind": "if", "condition_expr": "is_method(\"INVITE\")", "location": { ... } }
      ],
      "location": { "file": "opensips.cfg", "line": 305, "column": 1 }
    },
    "failure_route": { ... },
    "event_route[E_DLG_CREATED]": { ... }
  },
  "listen_directives": [
    {
      "transport": "tls",
      "interface": "eth0",
      "address": "0.0.0.0",
      "port": 5061,
      "location": { ... }
    }
  ],
  "include_chain": [
    { "from": "opensips.cfg", "line": 12, "to": "routes/auth.cfg", "resolved": true }
  ],
  "global_settings": {
    "children": "8",
    "log_level": "3",
    "alias": ["sip:example.com"]
  },
  "comments_index": [
    {
      "kind": "line",
      "text": "# opensips-advisor:suppress OSIPS-SEC-TLS-002",
      "associated_with_line": 247,
      "location": { ... }
    }
  ],
  "unreachable_routes": ["route[old_invite]"],
  "parser_warnings": [
    { "kind": "include_unresolved", "detail": "routes/auth.cfg not found", "location": { ... } }
  ]
}
```

### Parser responsibilities

1. **Resolve `include_file` chains.** Substitute included content
   into the logical model while preserving original file/line
   provenance in `location`. Unresolved includes generate a
   parser warning, not a fatal error — partial analysis is
   permitted per `15_CONFIDENCE_AND_VERIFICATION.md`'s partial-cfg
   confidence downgrade.

2. **Preserve source locations.** Every node in the parsed model
   carries `{ file, line, column }`. This is required for finding
   emission per `11_FINDING_SCHEMA.md`'s `location` field.

3. **Index comments separately.** Comments that follow the
   advisor's suppression-comment grammar
   (`23_SUPPRESSION_PROTOCOL.md`) are indexed for later resolution.
   Other comments are indexed too — they may carry intent
   information ("TODO: enable verify_cert in prod") that the LLM
   can use during semantic analysis.

4. **Distinguish commented-out from active.** A directive inside
   a `/* ... */` block or after a `#` is *not* in the active
   modparams or route_definitions. It is in `comments_index`
   only. The fixture `commented-bad.cfg` exists to verify this
   boundary holds.

5. **Mark unreachable code.** A route block defined but never
   called from any other route is listed in `unreachable_routes`.
   It is *not* excluded from the parsed model — rules may still
   fire on unreachable code (the unreachable code may be the more
   restrictive auth check, which is itself a finding).

6. **Track value types where unambiguous.** A modparam value of
   `0` is `integer`; `"hello"` is `string`; `[1, 2, 3]` is
   `array`. Values whose type is genuinely ambiguous get
   `value_type: ambiguous`.

### Parser anti-responsibilities

- The parser does not interpret rules.
- The parser does not call out to the LLM.
- The parser does not modify the model based on intake answers.
- The parser does not validate semantics ("this modparam value is
  out of range") — that's a Stage 3 detection concern.

### Failure modes

- **Syntactically malformed cfg.** The parser produces a partial
  model, sets `parser_warnings[].kind: syntax_error` for each
  malformed region, and the advisor surfaces a methodology
  disclosure: "the cfg has syntax errors at lines X, Y; analysis
  may be incomplete." Detection runs against what was parsed.

- **Catastrophic parse failure.** If less than ~50% of the cfg
  parses, the advisor stops with an error to the user and refuses
  to proceed. Reporting on a mostly-unparsed cfg is misleading.

---

## Stage 2 — Rule selection

This stage is Layer 4 from `10_SKILL_STACK.md`. Briefly recapped
here for runtime traceability; the canonical spec is in
`13_PROFILE_MODEL.md` and `14_VERSION_STRATEGY.md`.

### Inputs

- The parsed model.
- The session context.
- The full rule catalog (from `30_rules/`).

### Output

A *parameterized rule set* — the subset of rules that apply to
this run, annotated with run-specific parameters (overrides,
suppressions resolved against the rule's anticipated firing
locations).

### Filter steps, in order

1. **Profile gate.** Drop rules whose `profile` excludes the
   session's profile. Per `13_PROFILE_MODEL.md`.
2. **Version gate.** Drop rules whose
   `applies_if_opensips_version` excludes the session's version.
   Per `14_VERSION_STRATEGY.md`.
3. **Modules-loaded gate.** Drop rules whose
   `applies_if_modules_loaded` lists modules not present in
   `parsed_model.loaded_modules`.
4. **Engine-version gate.** Drop rules whose
   `engine_version_min`/`engine_version_max` bracket excludes
   the current advisor version.
5. **User overrides.** Apply suppression-file `lifts` (force
   include) and profile/severity overrides. Per
   `23_SUPPRESSION_PROTOCOL.md`.

Excluded rules are tracked in a *gating ledger* — a list of which
rules were dropped at which step. This is surfaced in the
report's Methodology section so reviewers know what was *not*
considered.

---

## Stage 3 — Detection

The four sub-phases run in order. Each produces raw findings that
flow forward; later phases may consult earlier phases' findings
via `grounding.prior_findings_considered`.

### Phase ordering — why deterministic first

The phase ordering (3a → 3b → 3c → 3d) is normative for two
reasons:

1. **Cost.** Earlier phases are cheap (parsed-model traversal,
   regex). Later phases are expensive (LLM tokens). Running cheap
   phases first lets the engine accumulate evidence the LLM can
   consult.
2. **Evidence ladder.** A 3d finding that fires *because* a 3a
   finding fired carries stronger grounding than a 3d finding
   firing in isolation. The pipeline order is what makes that
   layered evidence available.

### Phase 3a — Structural

**What it does.** For each rule with `phase: structural`, evaluate
the rule's Audit logic against the parsed model.

**Inputs.** Parsed model. Rule's Audit section.

**Output.** Raw findings with `verification_status:
deterministic_confirmed`.

**Determinism.** Fully deterministic. No LLM involvement.

**Common shapes.**
- "Module X loaded but function Y never called in
  `request_route`."
- "Listen directive Z exists but no corresponding TLS listener."
- "Modparam X set in module Y but only one of mandatory pair."

**Implementation note.** Structural rules are queries against
the parsed model. The advisor's MCP server (existing, per
project memory) can answer many of these queries directly; the
engine routes them there when available.

### Phase 3b — Value / pattern

**What it does.** For each rule with `phase: value_pattern`,
evaluate the rule's pattern against directive values, modparam
values, or string literals in the parsed model.

**Inputs.** Parsed model + 3a findings (for grounding).

**Output.** Raw findings, mostly with `verification_status:
deterministic_confirmed`. Where the rule's pattern requires
value-intent interpretation (e.g., "is this cipher list weak?"
where weakness is judgment), `verification_status:
judge_confirmed` after a single LLM call.

**Determinism.** Mostly deterministic. LLM involvement is
narrow: interpreting non-trivial values when literal patterns
are insufficient.

**Common shapes.**
- "Modparam X value matches regex Y."
- "Directive Z value in {bad-set}."
- "String literal in route appears to contain SIP-derived data
  unsafely."

### Phase 3c — Dataflow / taint

**What it does.** For each rule with `phase: dataflow_taint`,
trace SIP-derived data through script variables and function
calls to identify source-to-sink paths without appropriate
sanitization.

**Inputs.** Parsed model + 3a + 3b findings + the rule's Audit
section + the catalog's known-sanitizer registry.

**Output.** Raw findings. Verification status varies:
- If the source-to-sink path matches a literal pattern overlay
  (e.g., `$fU` directly into `avp_db_query` with no
  intermediate transform) → `deterministic_confirmed`.
- If the path passes through a recognized sanitizer the LLM
  judges adequate → `judge_confirmed`.
- If the path passes through an unrecognized sanitizer →
  `unchecked` at this stage; flagged for triage abstention
  per `15_CONFIDENCE_AND_VERIFICATION.md`.

**Determinism.** Hybrid. The pathfinding is deterministic; the
sanitizer-adequacy judgment is LLM.

**The known-sanitizer registry.** A list maintained alongside
the rule catalog (`30_rules/_SANITIZER_REGISTRY.md`, written in
Phase 6b) enumerating sanitizers the catalog recognizes:
`s.escape.common`, regex validation against allow-list patterns,
specific module-provided sanitization functions. A sanitizer not
in the registry triggers low-confidence emission or abstention
per the discipline above.

**Common shapes.**
- "Source `$fU` flows to sink `avp_db_query()` argument 1
  without `s.escape.common`."
- "Source `$hdr(X-Forwarded-For)` flows to `t_relay()` target
  via `$avp(forward_to)` assignment."
- "Source `$ua` flows to `xlog()` format-string position."

### Phase 3d — Semantic / contextual

**What it does.** For each rule with `phase:
semantic_contextual`, the engine assembles preconditions
deterministically (which modules loaded, which directives set,
which 3a/3b/3c findings already present) and then asks the LLM
to assess whether the rule's contextual concern applies.

**Inputs.** Parsed model + all earlier-phase findings + session
context (deployment_context, frontend, profile) + the rule's
Audit section + cited reference material from `90_reference/`.

**Output.** Raw findings with `verification_status: unchecked`.
Mandatory verification pass in Stage 4 before emission.

**Determinism.** LLM-heavy. The deterministic part is gathering
preconditions; the LLM does the synthesis.

**Common shapes.**
- "MI HTTP listener on `0.0.0.0` + registrar loaded + no
  `mi_trusted_clients` set + deployment_context: public-facing
  → admin-interface exposure."
- "TLS configured but cipher list permits weak ciphers AND
  deployment is carrier-grade → fails L2 cipher policy."
- "Two `auth_db_check` calls with second unreachable; the
  unreachable one is more restrictive."

### Inter-phase data flow

A finding from an earlier phase can be `grounding.
prior_findings_considered` for a later phase. Example: a 3b
finding that "`mi_http` listener bound to 0.0.0.0" is consumed by
a 3d rule reasoning about admin-interface exposure. The 3d rule
references the 3b finding's `finding_id` in its grounding,
linking them in the eventual report.

This is the core mechanism for the evidence ladder. A 3d
finding without 3a/3b/3c grounding is likely overreaching; the
verification pass in Stage 4 will scrutinize it harder.

---

## Stage 4 — Triage

Triage takes the raw finding stream from Stage 3 and produces a
final scored set ready for reporting. The substages run in fixed
order.

### 4.1 — Validation pass (first)

Every raw finding is validated against the JSON Schema in
`11_FINDING_SCHEMA.md` before triage proceeds. Validation
failure aborts the run with an error pointing to the offending
finding. This catches engine bugs before they propagate.

### 4.2 — Deduplication

Findings sharing the same `fingerprint` (per
`11_FINDING_SCHEMA.md`'s fingerprint algorithm) are collapsed
into one. The collapsed finding inherits:

- The earliest `finding_id`.
- The maximum `severity` across the duplicates.
- The maximum `confidence` across the duplicates.
- The union of `tags`, `cwe`, `owasp`, `attack`.
- All distinct `location` values as `related_locations[]`.

If duplicates disagree on `kind` (one vulnerability, one
review_required), the result is `vulnerability` (the more
specific assertion wins).

### 4.3 — Correlation

Findings that share a *root cause* but not a fingerprint are
linked. Example: three separate findings stemming from one
missing `mf_process_maxfwd_header` call (e.g., a structural
finding for absence + two value findings for downstream
consequences) become one primary finding with two
`related_locations`.

Correlation hints come from rules. A rule may declare in its
catalog frontmatter:

```yaml
correlates_with:
  - root_cause_pattern: "missing-mfprocessmaxfwdheader"
    role: consequence
```

Multiple findings declaring the same `root_cause_pattern` with
roles `root_cause` and `consequence` are correlated; the
`root_cause` finding becomes primary. Without correlation hints,
findings remain independent.

### 4.4 — Verification pass

For findings flagged as needing verification per
`15_CONFIDENCE_AND_VERIFICATION.md`, the triage layer runs the
judge LLM. Each finding gets one of:

- `verification_status: judge_confirmed` (emitted as-is).
- `verification_status: judge_dissented` + downgrade or
  abstention (per the conversion rule).

The verification pass is the most expensive stage in the
pipeline. The engine batches calls where the rule and shape
permit, but verification still bounds the run's LLM cost.

### 4.5 — Suppression resolution

Suppressions from the session context are applied per
`23_SUPPRESSION_PROTOCOL.md`. Suppressed findings:

- Remain in the finding set.
- Get `tags: [suppressed]` and a `suppression_reason` tag
  (carried in `tags[]`; not a top-level field).
- Are routed to the report's audit appendix rather than the
  primary findings section.
- Still appear in the SARIF output with
  `result.suppressions[]` populated.

The exception: never-suppressible rules (`suppressible: false`
in frontmatter) ignore suppression entries. The advisor records
the attempted suppression in the audit appendix as an
"attempted-suppression-of-non-suppressible-rule" event.

### 4.6 — Scoring enrichment

Each finding is enriched with:

- `cvss_v4_vector` (lifted from rule frontmatter, possibly
  context-adjusted).
- `security_severity` (numeric, derived from CVSS).
- `cwe` / `owasp` / `attack` (lifted from rule frontmatter).
- `references` (lifted from rule frontmatter, with any
  per-instance additions).

Context-adjustment of the CVSS vector is bounded: only the
deployment-related metrics (Attack Vector, Privileges Required,
User Interaction) may shift based on session context. Impact
metrics (VC, VI, VA) and exploitability metrics (AC, AT) are
fixed by the rule.

### 4.7 — Hardening index input

Per-severity counts are computed for use by the report layer:

```yaml
counts:
  critical: 1
  high: 4
  medium: 7
  low: 12
  info: 3
  review_required: 2
suppressed: 1
total_emitted: 29
```

These counts feed the hardening-index formula in
`22_REPORT_TEMPLATES.md`.

### 4.8 — Validation pass (second)

The final scored finding set is validated against the JSON
Schema again before hand-off to reporting. This catches triage
bugs that drop required fields during enrichment.

---

## Stage 5 — Hand-off to reporting

Triage hands the report layer:

- The final scored finding set.
- The session context.
- The gating ledger from Stage 2.
- The hardening-index inputs from 4.7.
- The suppression audit list from 4.5.
- The parser warnings from Stage 1.

The report layer (`22_REPORT_TEMPLATES.md`) renders Markdown and
SARIF from these inputs. No further analysis happens.

---

## Pipeline observability

For audit defensibility, the advisor records a *pipeline trace*
for each run — a JSON document with timing, counts, and
decisions at each stage. The trace is included in the report's
appendix as a folded code block (default-collapsed in the
Markdown rendering, present in full in the SARIF
`run.invocations[]`).

Trace shape:

```yaml
trace:
  stage_1_parse:
    duration_ms: 142
    bytes_parsed: 18432
    parser_warnings: 0
  stage_2_rule_selection:
    duration_ms: 23
    rules_in_catalog: 47
    rules_after_gating: 31
    gating_ledger:
      profile: 0          # excluded by profile
      version: 5          # excluded by version
      modules_loaded: 11  # excluded by modules-loaded
      engine_version: 0
  stage_3_detection:
    duration_ms: 4321
    raw_findings: 18
    by_phase:
      structural: 6
      value_pattern: 7
      dataflow_taint: 3
      semantic_contextual: 2
  stage_4_triage:
    duration_ms: 2104
    after_dedup: 16
    after_correlation: 14
    verifications_run: 5
    judge_confirmed: 4
    judge_dissented: 1
    converted_to_review_required: 1
    suppressed: 1
    final_count: 13
```

The trace is for *traceability*, not user-facing UX. Casual
users do not read it; auditors and engine developers do.

---

## Failure handling

Each stage has well-defined failure semantics:

- **Stage 1 catastrophic failure** → abort, error to user.
- **Stage 1 partial failure** → continue, warning recorded.
- **Stage 2 (no rules apply)** → continue, methodology
  disclosure: "no applicable rules for this profile + version +
  module set."
- **Stage 3a/3b internal failure** → log, mark phase as
  partially-failed in trace, continue. Findings produced before
  failure are emitted; missed findings are unrecoverable for
  this run.
- **Stage 3c/3d LLM failure** (timeout, malformed response) →
  the affected finding becomes `review_required` with
  `review_reason: "engine could not complete analysis on this
  rule (LLM error)"`. The pipeline does not stop.
- **Stage 4 verification failure** → the finding under
  verification is downgraded to `verification_status:
  unchecked`. If its pre-verification confidence required
  verification, it is converted to `review_required`.
- **Stage 4 validation failure** → abort, error to user. A
  finding that fails the schema is an engine bug, not a
  recoverable runtime issue.

---

## Cross-references

- Layer model and architectural spine: `10_SKILL_STACK.md`.
- Finding shape produced by every stage:
  `11_FINDING_SCHEMA.md`.
- Rule fields consumed at each phase:
  `12_RULE_CATALOG_SCHEMA.md`.
- Profile and version gating logic:
  `13_PROFILE_MODEL.md`, `14_VERSION_STRATEGY.md`.
- Verification protocol:
  `15_CONFIDENCE_AND_VERIFICATION.md`.
- Intake handoff: `20_INTAKE_PROTOCOL.md`.
- Report rendering: `22_REPORT_TEMPLATES.md`.
- Suppression mechanics: `23_SUPPRESSION_PROTOCOL.md`.
