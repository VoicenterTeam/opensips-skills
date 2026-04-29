# OpenSIPS Security Advisor — Finding Schema

**Status.** Locked as of Phase 6a. Wire format. Changes are breaking
for downstream consumers and require a major version bump
(`opensips-advisor@N.0.0`).

This document defines the canonical shape of an advisor *finding* —
the byte-precise contract between the detection engine (Layer 5),
triage (Layer 6), and reporting (Layer 7), and between the advisor
and any downstream tool that consumes its output (CI gates, GitHub
Code Scanning, dashboards). Every field is named, typed, justified,
and exemplified. Where two fields could be conflated, the difference
is called out explicitly. Where a field has an enum, the enum is
listed and locked.

The schema serves three audiences with different needs:

- The detection engine produces findings in this shape and is
  validated against the JSON Schema appendix.
- The reporting layer consumes findings in this shape and renders
  them into Markdown and SARIF without re-interpreting any field.
- Downstream consumers ingest the SARIF output (and, where
  applicable, the raw JSON) and gate on documented fields.

Phase 5 methodology research informs the schema's overall shape and
specifically the LLM-era extensions (`grounding`, `rationale_trace`,
`verification_status`) that distinguish this advisor from
pre-LLM SAST output formats [P5 §TBD — "finding schema for
LLM-augmented SAST"].

---

## Schema overview

A finding is a JSON object. It has three blocks of fields:

1. **Mandatory fields.** Present on every finding. Without these,
   the finding is invalid and is rejected at validation.
2. **Recommended fields.** Present when applicable. The engine
   should populate them whenever it has the information; absence
   is permitted but signals reduced finding quality.
3. **LLM-specific fields.** Present when the finding involved LLM
   reasoning (phases `5c` or `5d`, or any phase with confidence
   below `high`). Required when applicable; absence on a finding
   that should have them is a validation failure.

Every finding is also serializable as a SARIF 2.1.0 `result`. The
mapping is documented in section "SARIF embedding" below.

---

## Mandatory fields

Every finding MUST carry every field in this section. Validation
failure on any of them is a hard error.

### `finding_id`

- **Type.** `string`.
- **Format.** UUID v4 (RFC 4122). Generated at emission.
- **Purpose.** Globally unique identifier for this specific finding
  instance. Distinct from `rule_id`: a rule may fire many times in
  one run, each producing a different `finding_id`.
- **Example.** `"f47ac10b-58cc-4372-a567-0e02b2c3d479"`.

### `rule_id`

- **Type.** `string`.
- **Format.** `OSIPS-SEC-<FAMILY>-<NNN>`, where `<FAMILY>` is one
  of the 12 module families (uppercase) and `<NNN>` is a
  zero-padded 3-digit serial.
- **Purpose.** Identifies which rule produced this finding.
- **Example.** `"OSIPS-SEC-AUTH-001"`.

### `rule_version`

- **Type.** `string`.
- **Format.** Semantic version (`MAJOR.MINOR.PATCH`).
- **Purpose.** Which version of the rule fired. A finding's
  reproducibility depends on this — a rule revision can change
  detection logic without changing rule_id.
- **Example.** `"1.2.0"`.

### `engine_version`

- **Type.** `string`.
- **Format.** Semantic version.
- **Purpose.** Which version of the advisor produced this finding.
- **Example.** `"0.1.0"`.

### `opensips_version_detected`

- **Type.** `string`.
- **Format.** Semantic version, optionally with a confidence suffix.
- **Purpose.** Which OpenSIPS version was used as the analysis
  context. Either user-declared at intake or inferred (with
  warning).
- **Example values.** `"3.6.0"`, `"3.5.x (declared)"`, `"3.4.6
  (inferred)"`.

### `title`

- **Type.** `string`. 1–120 chars.
- **Purpose.** Short, descriptive headline. Does *not* repeat
  rule_id. Does *not* recommend ("…should be enabled"); states the
  finding ("verify_cert is disabled").
- **Example.** `"TLS verify_cert disabled on outbound TLS"`.

### `severity`

- **Type.** `string` enum.
- **Values.** `critical` | `high` | `medium` | `low` | `info`.
- **Purpose.** How bad this finding is, *if real*. Definitions in
  `02_GLOSSARY.md` §3.
- **Independence.** Severity is independent of confidence. A
  high-severity / low-confidence finding is not the same artifact
  as high-severity / high-confidence and the report layer must not
  collapse them.

### `confidence`

- **Type.** `string` enum.
- **Values.** `high` | `medium` | `low`.
- **Purpose.** How sure the engine is that this finding is real.
  Definitions in `02_GLOSSARY.md` §3.
- **Independence.** See `severity` above. Both are mandatory; both
  are emitted; the report layer surfaces both.

### `verification_status`

- **Type.** `string` enum.
- **Values.** `deterministic_confirmed` | `judge_confirmed` |
  `judge_dissented` | `unchecked`.
- **Purpose.** How the finding was confirmed before emission. See
  `15_CONFIDENCE_AND_VERIFICATION.md` for the full state machine.
- **Constraint.** A finding emitted with confidence ≥ `medium` and
  phase ∈ {`dataflow_taint`, `semantic_contextual`} MUST have
  verification_status ∈ {`deterministic_confirmed`,
  `judge_confirmed`}. `unchecked` at that confidence is a
  validation failure.

### `kind`

- **Type.** `string` enum.
- **Values.** `vulnerability` | `review_required`.
- **Purpose.** Distinguishes substantive findings from triage
  hand-offs. `review_required` is the abstention output: the
  advisor cannot decide and is asking a human to.
- **Constraint.** When `kind = review_required`, `review_reason`
  (a recommended field) MUST be non-empty.

### `location`

- **Type.** `object`.
- **Shape.**
  ```json
  {
    "file": "string (path relative to cfg root)",
    "line": "integer (1-indexed)",
    "column": "integer (1-indexed) | null",
    "logical_location": "string (e.g., 'request_route', 'modparam:tls_mgm')"
  }
  ```
- **Purpose.** Where in the cfg the finding occurred. `file` is
  needed because `include_file` chains produce multi-file cfg.
  `column` is null for findings on absent directives (where the
  rule fires because something is missing rather than malformed).
- **Example.**
  ```json
  {
    "file": "opensips.cfg",
    "line": 247,
    "column": 12,
    "logical_location": "modparam:tls_mgm"
  }
  ```

### `evidence`

- **Type.** `object`.
- **Shape.**
  ```json
  {
    "snippet": "string (the offending cfg fragment, ≤ 5 lines)",
    "snippet_start_line": "integer",
    "snippet_end_line": "integer",
    "matched_pattern": "string (the pattern from the rule)"
  }
  ```
- **Purpose.** What the engine actually saw. The reporting layer
  uses `snippet` to render the BAD-example block. The
  `matched_pattern` field lets a reviewer compare what the rule
  was looking for against what it found.
- **Constraint.** For absence-rules (rule fires because something
  is missing), `snippet` is the surrounding context (the route
  block where the directive should be) and `matched_pattern` is
  prefixed `"absence:"`.

### `recommendation`

- **Type.** `string`. Markdown permitted. 1–500 chars.
- **Purpose.** The actionable remediation. *Specific*, not
  generic. "Enable verify_cert by setting `modparam("tls_mgm",
  "verify_cert", 1)`" — not "Improve TLS configuration."
- **Constraint.** Must be present even when the rule's catalog
  entry has a richer remediation section; this field carries the
  one-line summary. The full remediation is in the rule body and
  rendered in the Markdown report's per-finding block.

### `fingerprint`

- **Type.** `string`.
- **Format.** Hex-encoded SHA-256, 64 chars.
- **Purpose.** Stable identifier for *this kind of finding at this
  location*. Two runs of the advisor on the same cfg produce the
  same fingerprint. Used for deduplication, baselining, and
  diffing across runs.
- **Algorithm.** See "Fingerprint algorithm" section below.

---

## Recommended fields

Present whenever the engine has the information. Absence is
permitted but signals reduced finding quality and is surfaced as
such in reporting.

### `rationale`

- **Type.** `string`. Markdown permitted.
- **Purpose.** Why this is a finding. Distinct from
  `recommendation` (which says what to *do*). Distinct from
  `rationale_trace` (which is the LLM's reasoning chain for *this
  specific instance*).
- **Source.** Generally lifted from the rule's catalog entry, with
  any instance-specific elaboration appended.

### `default_value`

- **Type.** `string`.
- **Purpose.** For value-pattern findings, what the safe default
  would be. Lets the reporting layer render BAD/GOOD examples
  precisely.
- **Example.** `"verify_cert: 1"`.

### `cvss_v4_vector`

- **Type.** `string`.
- **Format.** Valid CVSS 4.0 vector string (`CVSS:4.0/AV:.../...`).
- **Purpose.** The standard structured severity. CVSS 4.0 not 3.1
  — locked architectural decision per the manifest.
- **Source.** Typically lifted from the rule's catalog entry; may
  be context-adjusted for the specific deployment (e.g., a
  carrier-context cfg may shift Attack Vector or Privileges
  Required).

### `security_severity`

- **Type.** `number`. Range 0.0–10.0, one decimal.
- **Purpose.** Numeric severity for downstream gating
  (GitHub Code Scanning, CI thresholds). Derived from
  `cvss_v4_vector`.
- **Constraint.** If `cvss_v4_vector` is present,
  `security_severity` MUST be the value derived from it. If
  absent, `security_severity` is a manual estimate carrying the
  same numeric range.

### `cwe`

- **Type.** `array<string>`.
- **Format.** Each element is `"CWE-NNN"`.
- **Purpose.** CWE classification. Multiple entries permitted when
  the finding maps to several CWEs (e.g., a SQL injection finding
  may carry both CWE-89 and CWE-20).
- **Example.** `["CWE-89", "CWE-20"]`.

### `owasp`

- **Type.** `array<string>`.
- **Purpose.** OWASP classification. For SIP-specific findings,
  references to OWASP SIP security where applicable.
- **Example.** `["A03:2021-Injection"]`.

### `attack`

- **Type.** `array<string>`.
- **Format.** MITRE ATT&CK technique IDs (`Txxxx` or `Txxxx.NNN`).
- **Purpose.** Adversary technique mapping. Useful for SOC and
  incident-response integration.
- **Example.** `["T1190", "T1059.006"]`.

### `references`

- **Type.** `array<object>`.
- **Shape.**
  ```json
  [
    { "kind": "internal", "path": "90_reference/01_master_...md", "section": "§3.2" },
    { "kind": "external", "url": "https://...", "title": "..." }
  ]
  ```
- **Purpose.** Where to read more. Internal references point into
  the advisor package (`90_reference/`); external references are
  authoritative third-party sources.

### `related_locations`

- **Type.** `array<object>`. Each element matches the `location`
  shape.
- **Purpose.** When triage correlates multiple raw findings into
  one primary, the others appear here as related locations.

### `profile_applicability`

- **Type.** `array<string>`.
- **Values.** Subset of `["L1", "L2"]`.
- **Purpose.** Which profile(s) this finding applies under, lifted
  from the rule's frontmatter. Usable by report layer to label or
  filter.

### `baseline_state`

- **Type.** `string` enum.
- **Values.** `new` | `unchanged` | `updated` | `absent`.
- **Purpose.** When a baseline is supplied, indicates how this
  finding compares: `new` (not in baseline), `unchanged` (in
  baseline, identical), `updated` (in baseline, changed), `absent`
  (in baseline, not present this run — surfaced for completeness
  in the diff view).
- **Default.** Absent field means no baseline supplied.

### `tags`

- **Type.** `array<string>`.
- **Purpose.** Free-form tags. Usable for filtering, but no
  canonical taxonomy beyond what the rule's frontmatter declares.

### `review_reason`

- **Type.** `string`.
- **Purpose.** Required when `kind = review_required`. Explains
  why the advisor is abstaining (e.g., "custom Perl sanitizer
  used between source and sink; cannot validate adequacy"). Empty
  string is invalid for `review_required` findings.

---

## LLM-specific fields

When a finding involved LLM reasoning, these fields capture the
reasoning state. Required when phase ∈ {`dataflow_taint`,
`semantic_contextual`} or when confidence < `high`. Optional
otherwise. Their presence signals to reviewers and downstream
tooling that this is an LLM-emitted finding and what evidence the
LLM had.

### `grounding`

- **Type.** `object`.
- **Shape.**
  ```json
  {
    "parser_nodes": ["string (parsed-model JSONPath)"],
    "references_consulted": [
      { "path": "string", "section": "string" }
    ],
    "prior_findings_considered": ["string (finding_id)"]
  }
  ```
- **Purpose.** The evidence the LLM used to reach its decision.
  `parser_nodes` are JSONPath expressions into the parsed model
  (Layer 2 output) — they are the structural evidence.
  `references_consulted` are advisor-internal sources cited.
  `prior_findings_considered` is for findings that depend on
  earlier findings in the same run (e.g., a Layer 5d rule that
  fires only when a Layer 5b finding is present).

### `rationale_trace`

- **Type.** `string`. 1–1000 chars.
- **Purpose.** Short, human-readable narrative of the LLM's
  reasoning for *this finding*. Distinct from `rationale` (which
  is the rule-level explanation, lifted from the catalog).
  `rationale_trace` is *instance-specific*: why did the LLM
  conclude this particular cfg has this particular issue?
- **Required when.** Confidence is `medium` or `low`. Recommended
  when `high` for audit defensibility.
- **Example.** `"The cfg loads tls_mgm and sets verify_cert=0 in
  modparam at line 247. The deployment context is 'carrier' per
  intake. A carrier-grade deployment with disabled cert
  verification permits MITM by any peer presenting a valid TLS
  handshake regardless of identity, which contradicts the L2
  profile's TLS posture requirements."`.

---

## SARIF 2.1.0 embedding

Every finding is emitted as a SARIF 2.1.0 `result` in addition to
its JSON form. The mapping is normative.

### Field-by-field mapping

| Finding field | SARIF location |
|---|---|
| `finding_id` | `result.guid` |
| `rule_id` | `result.ruleId` |
| `rule_version` | `result.properties.opensips-advisor/rule_version` |
| `engine_version` | `run.tool.driver.version` |
| `opensips_version_detected` | `run.properties.opensips-advisor/opensips_version` |
| `title` | `result.message.text` (first line) |
| `severity` | `result.properties.security-severity` mapping (see below) AND `result.level` (see below) |
| `confidence` | `result.properties.opensips-advisor/confidence` |
| `verification_status` | `result.properties.opensips-advisor/verification_status` |
| `kind` | `result.kind` (`fail` for `vulnerability`, `informational` for `review_required`) |
| `location` | `result.locations[0]` per SARIF location object |
| `evidence.snippet` | `result.locations[0].physicalLocation.contextRegion.snippet.text` |
| `evidence.matched_pattern` | `result.properties.opensips-advisor/matched_pattern` |
| `recommendation` | `result.message.markdown` (with rationale) |
| `fingerprint` | `result.partialFingerprints["stable/v1"]` |
| `rationale` | embedded in `result.message.markdown` |
| `cvss_v4_vector` | `result.properties.opensips-advisor/cvss_v4_vector` |
| `security_severity` | `result.properties["security-severity"]` (GitHub-compatible numeric string) |
| `cwe` / `owasp` / `attack` | `result.taxa[]` entries referencing taxonomies declared at run level |
| `references` | `result.message.markdown` (rendered) AND `run.tool.driver.rules[].helpUri` |
| `related_locations` | `result.relatedLocations[]` |
| `profile_applicability` | `result.properties.opensips-advisor/profile_applicability` |
| `baseline_state` | `result.baselineState` (SARIF native: `new` / `unchanged` / `updated` / `absent`) |
| `tags` | `result.properties.tags[]` |
| `review_reason` | `result.properties.opensips-advisor/review_reason` |
| `grounding` | `result.properties.opensips-advisor/grounding` (nested object) |
| `rationale_trace` | `result.properties.opensips-advisor/rationale_trace` |

### Severity → SARIF level mapping

SARIF's native `level` enum is coarser than the advisor's. The
mapping is fixed:

| Advisor `severity` | SARIF `level` | SARIF `security-severity` (numeric) |
|---|---|---|
| `critical` | `error` | 9.0 (or actual CVSS-derived value, must be ≥ 9.0) |
| `high` | `error` | 7.0–8.9 |
| `medium` | `warning` | 4.0–6.9 |
| `low` | `note` | 0.1–3.9 |
| `info` | `none` | 0.0 |

Where `cvss_v4_vector` is present, `security-severity` is the
CVSS-derived value, and the `severity` ↔ `level` mapping above is
preserved by the rule's catalog declaration (a rule with
`severity: high` produces `level: error` regardless of the
specific CVSS number, provided that number is in the high band).

### Property-bag namespace

All advisor-specific SARIF property keys are prefixed
`opensips-advisor/` to avoid collision with consumers that use
their own property bags. The namespace is locked.

### Taxonomies

CWE, OWASP, and MITRE ATT&CK are declared as `taxonomies` at the
SARIF `run` level, and findings reference them by `taxa[].id`.
This is the SARIF-canonical pattern and avoids embedding taxonomy
data per-result.

### Fixes

Where a rule provides a structured remediation diff (`fix_diff`
in the rule's frontmatter), the advisor emits a SARIF
`result.fixes[]` entry with `artifactChanges[].replacements[]`
populated. Where the remediation is prose-only, no `fixes[]` entry
is emitted and the recommendation is text in
`result.message.markdown` only.

---

## Fingerprint algorithm

The `fingerprint` field must be stable across runs of the same cfg.
The algorithm is:

```
input = rule_id + "|" +
        normalize_path(location.file) + "|" +
        location.logical_location + "|" +
        canonicalize(evidence.matched_pattern)

fingerprint = sha256_hex(input)
```

Where:

- `normalize_path` strips any user-machine-specific prefix (e.g.,
  `/home/alice/proj/opensips.cfg` becomes `opensips.cfg`).
- `canonicalize(matched_pattern)` collapses whitespace, lowercases
  identifier strings, but preserves operators and value literals.
- `location.line` is deliberately *not* in the input — line
  numbers shift when cfg is reformatted. Logical location
  (`modparam:tls_mgm`, `request_route`) is stable across reformats.
- `column` is also not in the input, for the same reason.

This algorithm guarantees that if a cfg is reformatted but
semantically unchanged, fingerprints are preserved and baseline
diffs work correctly. It does *not* guarantee that two
semantically equivalent cfg structures produce the same fingerprint
— a directive moved between route blocks is a different finding
even if the directive itself is unchanged.

The version suffix `stable/v1` on the SARIF
`partialFingerprints` key is intentional: a future fingerprint
algorithm change is a major version bump and emits as
`stable/v2` alongside `stable/v1` for one release for back-compat.

---

## Validation

The advisor MUST validate every emitted finding against the JSON
Schema in the appendix before emission. Validation failure aborts
the run with a clear error pointing to the offending field. The
report layer never sees an invalid finding.

The validator is run twice in steady-state operation:

1. After Layer 5 emits raw findings, before Layer 6 begins triage.
2. After Layer 6 emits scored findings, before Layer 7 begins
   reporting.

The first pass catches engine bugs that produce malformed output;
the second pass catches triage bugs that drop required fields
during enrichment.

---

## Examples

### Example 1 — high-severity, high-confidence value match

```json
{
  "finding_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "rule_id": "OSIPS-SEC-TLS-002",
  "rule_version": "1.0.0",
  "engine_version": "0.1.0",
  "opensips_version_detected": "3.6.0",
  "title": "TLS verify_cert disabled on tls_mgm",
  "severity": "high",
  "confidence": "high",
  "verification_status": "deterministic_confirmed",
  "kind": "vulnerability",
  "location": {
    "file": "opensips.cfg",
    "line": 247,
    "column": 12,
    "logical_location": "modparam:tls_mgm"
  },
  "evidence": {
    "snippet": "modparam(\"tls_mgm\", \"verify_cert\", 0)",
    "snippet_start_line": 247,
    "snippet_end_line": 247,
    "matched_pattern": "modparam(\"tls_mgm\",\"verify_cert\",0)"
  },
  "recommendation": "Set verify_cert to 1: `modparam(\"tls_mgm\", \"verify_cert\", 1)`. If a self-signed peer cert is intentional, configure `ca_list` instead of disabling verification.",
  "fingerprint": "9f2c1a7e5b3d8f4e2a6c9b0e1d5a3f8c7e2b9d1c4a6f8e3b5d7a9c1e4b8f2a6d",
  "cvss_v4_vector": "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N",
  "security_severity": 8.7,
  "cwe": ["CWE-295"],
  "owasp": ["A02:2021-Cryptographic Failures"],
  "profile_applicability": ["L1", "L2"],
  "tags": ["tls", "verification"]
}
```

### Example 2 — review_required abstention

```json
{
  "finding_id": "a8b9c0d1-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
  "rule_id": "OSIPS-SEC-INJECTION-003",
  "rule_version": "1.0.0",
  "engine_version": "0.1.0",
  "opensips_version_detected": "3.5.x (declared)",
  "title": "Possible SQL injection via $fU into avp_db_query",
  "severity": "high",
  "confidence": "low",
  "verification_status": "judge_dissented",
  "kind": "review_required",
  "location": {
    "file": "opensips.cfg",
    "line": 412,
    "column": 8,
    "logical_location": "request_route"
  },
  "evidence": {
    "snippet": "$avp(safe) = perl_func(\"sanitize\", $fU);\navp_db_query(\"SELECT * FROM users WHERE name='$avp(safe)'\");",
    "snippet_start_line": 411,
    "snippet_end_line": 412,
    "matched_pattern": "tainted-source-to-db-sink"
  },
  "recommendation": "Confirm the custom `perl_func(\"sanitize\", ...)` adequately escapes SQL metacharacters. If unsure, replace with `s.escape.common` transformation before the query.",
  "review_reason": "Custom Perl sanitizer used between source and sink. Cannot validate sanitizer adequacy from cfg alone. Manual review of the perl_func implementation required.",
  "fingerprint": "3e7b2c8a1f5d9e4b7c0a2f6d8e1b5c9a3f7e0b2d4c8a1f5e9d2b6c0a3f7e1b5d",
  "grounding": {
    "parser_nodes": [
      "$.routes['request_route'].calls[34]",
      "$.routes['request_route'].calls[35]"
    ],
    "references_consulted": [
      { "path": "90_reference/01_master_vulnerability_reference.md", "section": "§4.1" }
    ],
    "prior_findings_considered": []
  },
  "rationale_trace": "The cfg routes a SIP From-URI ($fU) through a custom perl_func before it reaches avp_db_query. The advisor's rule catalog covers s.escape.common as a known-good sanitizer; perl_func is unknown. The judge LLM was asked to assess sanitizer adequacy and dissented on the basis that adequacy cannot be determined from the cfg alone. Emitting as review_required to surface the question to the user.",
  "tags": ["injection", "sql", "abstention"]
}
```

---

## Appendix A — JSON Schema (draft-2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://opensips.org/advisor/schema/finding-v1.json",
  "title": "OpenSIPS Security Advisor Finding",
  "type": "object",
  "required": [
    "finding_id", "rule_id", "rule_version", "engine_version",
    "opensips_version_detected", "title", "severity", "confidence",
    "verification_status", "kind", "location", "evidence",
    "recommendation", "fingerprint"
  ],
  "properties": {
    "finding_id": { "type": "string", "format": "uuid" },
    "rule_id": {
      "type": "string",
      "pattern": "^OSIPS-SEC-[A-Z_]+-[0-9]{3}$"
    },
    "rule_version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"
    },
    "engine_version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"
    },
    "opensips_version_detected": { "type": "string" },
    "title": { "type": "string", "minLength": 1, "maxLength": 120 },
    "severity": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low", "info"]
    },
    "confidence": {
      "type": "string",
      "enum": ["high", "medium", "low"]
    },
    "verification_status": {
      "type": "string",
      "enum": [
        "deterministic_confirmed", "judge_confirmed",
        "judge_dissented", "unchecked"
      ]
    },
    "kind": {
      "type": "string",
      "enum": ["vulnerability", "review_required"]
    },
    "location": {
      "type": "object",
      "required": ["file", "line", "logical_location"],
      "properties": {
        "file": { "type": "string" },
        "line": { "type": "integer", "minimum": 1 },
        "column": {
          "oneOf": [
            { "type": "integer", "minimum": 1 },
            { "type": "null" }
          ]
        },
        "logical_location": { "type": "string" }
      }
    },
    "evidence": {
      "type": "object",
      "required": [
        "snippet", "snippet_start_line",
        "snippet_end_line", "matched_pattern"
      ],
      "properties": {
        "snippet": { "type": "string" },
        "snippet_start_line": { "type": "integer", "minimum": 1 },
        "snippet_end_line": { "type": "integer", "minimum": 1 },
        "matched_pattern": { "type": "string" }
      }
    },
    "recommendation": {
      "type": "string", "minLength": 1, "maxLength": 500
    },
    "fingerprint": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$"
    },

    "rationale": { "type": "string" },
    "default_value": { "type": "string" },
    "cvss_v4_vector": {
      "type": "string",
      "pattern": "^CVSS:4\\.0/"
    },
    "security_severity": {
      "type": "number", "minimum": 0.0, "maximum": 10.0
    },
    "cwe": {
      "type": "array",
      "items": { "type": "string", "pattern": "^CWE-[0-9]+$" }
    },
    "owasp": {
      "type": "array",
      "items": { "type": "string" }
    },
    "attack": {
      "type": "array",
      "items": { "type": "string", "pattern": "^T[0-9]{4}(\\.[0-9]{3})?$" }
    },
    "references": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["kind"],
        "properties": {
          "kind": { "type": "string", "enum": ["internal", "external"] },
          "path": { "type": "string" },
          "url": { "type": "string", "format": "uri" },
          "section": { "type": "string" },
          "title": { "type": "string" }
        }
      }
    },
    "related_locations": {
      "type": "array",
      "items": { "$ref": "#/properties/location" }
    },
    "profile_applicability": {
      "type": "array",
      "items": { "type": "string", "enum": ["L1", "L2"] }
    },
    "baseline_state": {
      "type": "string",
      "enum": ["new", "unchanged", "updated", "absent"]
    },
    "tags": { "type": "array", "items": { "type": "string" } },
    "review_reason": { "type": "string" },

    "grounding": {
      "type": "object",
      "properties": {
        "parser_nodes": {
          "type": "array", "items": { "type": "string" }
        },
        "references_consulted": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": { "type": "string" },
              "section": { "type": "string" }
            }
          }
        },
        "prior_findings_considered": {
          "type": "array",
          "items": { "type": "string", "format": "uuid" }
        }
      }
    },
    "rationale_trace": {
      "type": "string", "minLength": 1, "maxLength": 1000
    }
  },

  "allOf": [
    {
      "if": { "properties": { "kind": { "const": "review_required" } } },
      "then": { "required": ["review_reason"] }
    },
    {
      "if": {
        "properties": { "confidence": { "enum": ["medium", "low"] } }
      },
      "then": { "required": ["rationale_trace", "grounding"] }
    }
  ]
}
```

---

## Cross-references

- Severity and confidence definitions: `02_GLOSSARY.md` §3.
- Verification status state machine:
  `15_CONFIDENCE_AND_VERIFICATION.md`.
- Phase enum (used in rule frontmatter, mapped to verification
  defaults here): `12_RULE_CATALOG_SCHEMA.md`.
- Fingerprint use in baselining and dedup:
  `21_ANALYSIS_PIPELINE.md`.
- SARIF report assembly: `22_REPORT_TEMPLATES.md`.
- Suppression interaction (suppressed findings still get
  fingerprints, still emit, marked in audit appendix):
  `23_SUPPRESSION_PROTOCOL.md`.
