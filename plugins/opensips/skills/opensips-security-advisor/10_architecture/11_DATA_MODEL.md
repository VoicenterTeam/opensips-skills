# 11_DATA_MODEL

## Purpose

Defines the formal types the advisor reads, manipulates, and emits. This is the schema layer beneath every other concern in the system: the report templates render these types, the hardening index scores them, the SARIF mapping serializes them, the triage layer transforms them. Authoring rules, fixtures, and engine code without a stable data model produces drift between what the engine computes, what the report shows, and what the SARIF contains.

The types are presented in TypeScript-style notation because that maps cleanly to JSON serialization (the on-wire format) while remaining readable. Any field marked `?` is optional. Any field with a literal-union type (`"a" | "b"`) has an exhaustive list — adding values requires a schema version bump.

## Schema versioning

The data model carries a `schema_version` field on every top-level emission. Format: `MAJOR.MINOR`. Breaking changes (field renames, enum value removals, type narrowing) bump MAJOR. Additive changes (new optional fields, new enum values where the consumer is expected to ignore-on-unknown) bump MINOR. Current version: **`1.0`**.

## Top-level type — `RunResult`

The complete output of one advisor run. Serialized to JSON for tooling and rendered into Markdown for humans.

```typescript
type RunResult = {
  schema_version: "1.0";
  run_id: string;                          // UUID
  run_timestamp: string;                   // ISO 8601, UTC
  engine_version: string;                  // e.g., "opensips-advisor 0.1.0"
  duration_ms: number;

  artifact: ArtifactRef;                   // the cfg analyzed
  context: AnalysisContext;                // version, modules, profile, intake

  findings: Finding[];                     // includes both vulnerability and review_required
  informationals: Finding[];               // severity:info, never count toward index
  suppressions_applied: SuppressionRecord[];

  hardening_index: number;                 // 0-100
  hardening_index_breakdown: HardeningIndexBreakdown;

  diagnostics: EngineDiagnostics;
};
```

## Core type — `Finding`

The atomic unit. Every issue the advisor surfaces — confirmed, abstained, or informational — is a `Finding`.

```typescript
type Finding = {
  finding_id: string;                      // F-YYYY-MM-DD-NNN
  rule_id: string;                         // OSIPS-SEC-<FAMILY>-<NNN>
  rule_version: string;                    // "1.0"

  severity: Severity | null;               // null iff kind == "review_required"
  severity_would_be: Severity | null;      // set iff kind == "review_required"
  confidence: Confidence;
  verification_status: VerificationStatus;
  kind: "vulnerability" | "review_required";

  cvss_v4_vector: string | null;           // null for severity:info
  cvss_v4_score: number | null;
  cwe: string[];                           // e.g., ["CWE-287"]
  owasp: string | null;                    // e.g., "A07:2021"
  mitre_attack: string[];                  // e.g., ["T1190"]

  location: Location;
  related_locations: Location[];
  fingerprint: string;                     // sha256/v1:HEX

  message_short: string;                   // one-line summary, used in SARIF "text"
  evidence_snippet: string;                // exact cfg lines, fenced
  rationale: string;                       // prose, why this is a finding
  recommendation: string;                  // prose + cfg snippet showing the fix

  grounding: Grounding;                    // what the engine read to reach this
  rationale_trace: string[];               // numbered steps

  suppressible: boolean;                   // false for active-CVE rules

  review_reason: string | null;            // set iff kind == "review_required"
  opaque_function: string | null;          // set iff kind == "review_required"
};
```

A few field-level notes worth pinning down:

`severity` and `severity_would_be` are **mutually exclusive**: a confirmed vulnerability has `severity` set and `severity_would_be: null`; a review_required has the inverse. This avoids the bug where downstream tooling reads `severity` blindly and treats abstentions as confirmed criticals.

`fingerprint` is a stable identifier across runs — same finding on the same cfg should produce the same fingerprint even if line numbers drift. The format `sha256/v1:HEX` is a versioned namespace so we can change the input recipe later without breaking consumers. Recipe v1: `sha256(rule_id || "::" || canonical_evidence_text || "::" || normalized_artifact_path)`.

`grounding` and `rationale_trace` are mandatory and are the LLM-transparency mechanism — see `15_CONFIDENCE_AND_VERIFICATION.md` for why.

## Enums

```typescript
type Severity = "critical" | "high" | "medium" | "low" | "info";
type Confidence = "high" | "medium" | "low";
type VerificationStatus =
  | "deterministic_confirmed"
  | "judge_confirmed"
  | "judge_dissented"
  | "unchecked";
```

`judge_dissented` findings appear in `RunResult.diagnostics.dissented_findings` (audit log), not in `findings` (which is silenced per the suppression protocol). They are emitted in SARIF with `suppressions: [{ kind: "external", justification: "judge_dissented" }]` so SARIF consumers can opt to inspect them.

## Supporting types

```typescript
type Location = {
  artifact_uri: string;                    // relative to run root, e.g., "vulnerable-mixed.cfg"
  line_start: number;                      // 1-indexed, inclusive
  line_end: number;                        // 1-indexed, inclusive
  column_start?: number;
  column_end?: number;
  anchor_text?: string;                    // optional substring used for drift-tolerant matching
};

type Grounding = {
  parser_nodes: string[];                  // e.g., ["modparam:23", "function_call:t_relay:84"]
  references_consulted: string[];          // doc paths from 90_reference/
  semantic_pass_judgment?:                 // present iff verification_status touched the judge
    | "confirm" | "dissent" | "abstain";
  semantic_pass_notes?: string;
  dataflow_trace?: DataflowNode[];         // present for taint-based rules
};

type DataflowNode = {
  node: string;                            // pseudovariable, function call, etc.
  role: "source" | "transformation" | "transformation_opaque" | "intermediate" | "sink";
  function?: string;                       // populated for transformation_opaque (Perl/Python/etc.)
  location?: Location;
};

type AnalysisContext = {
  opensips_version_declared: string | null;
  opensips_version_detected: string;
  opensips_version_confidence: Confidence;
  modules_loaded: string[];                // alphabetized
  profile: "L1" | "L2" | "custom";
  intake_answers: Record<string, string>;
  rule_overrides: RuleOverride[];          // per-rule profile adjustments
};

type ArtifactRef = {
  uri: string;
  sha256: string;
  byte_length: number;
  source_language: "opensips-cfg";
};

type SuppressionRecord = {
  rule_id: string;
  location_glob: string;                   // e.g., "vulnerable-mixed.cfg:67-71"
  justification: string;
  approver: string | null;
  expires: string | null;                  // ISO 8601 date, null = never
  source: "in_cfg_pragma" | "yaml_file";
  hash_at_record_time: string;             // sha256 of the suppressed evidence
  hash_match_at_run_time: boolean;         // false if cfg drifted under the suppression
};

type HardeningIndexBreakdown = {
  base: 100;
  deductions: HardeningDeduction[];
  flat_penalties: FlatPenalty[];
  final: number;                           // base - sum(deductions) - sum(flat_penalties), clamped 0..100
};

type HardeningDeduction = {
  finding_id: string;
  weight: number;                          // raw severity weight
  multiplier: number;                      // 1.0 for kind:vulnerability, 0.5 for kind:review_required
  applied: number;                         // weight * multiplier
};

type FlatPenalty = {
  reason: string;                          // e.g., "review_required>1 on public-facing"
  amount: number;                          // typically 3-5
};

type EngineDiagnostics = {
  rules_executed: number;
  rules_skipped: { rule_id: string; reason: string }[];
  phase_timings_ms: Record<PhaseName, number>;
  verification_status_counts: Record<VerificationStatus, number>;
  dissented_findings: Finding[];           // suppressed but recorded
};

type PhaseName =
  | "parse"
  | "structural"
  | "value_pattern"
  | "dataflow"
  | "semantic"
  | "triage_and_verification";
```

## SARIF mapping

The advisor's native format is `RunResult` (above). SARIF 2.1.0 is the export format for tool interop. Mapping is lossy in one direction (SARIF doesn't have first-class confidence or review_required) and lossless in the other (every SARIF field has a `RunResult` field that fed it).

| RunResult field | SARIF location | Notes |
|---|---|---|
| `Finding.severity` | `result.level` (mapped: critical/high → `error`, medium/low → `warning`, info → `note`) + `properties["security-severity"]` (CVSS score) | SARIF's `level` is too coarse; CVSS goes in properties for fidelity |
| `Finding.confidence` | `properties["opensips-advisor/confidence"]` | No native SARIF equivalent |
| `Finding.verification_status` | `properties["opensips-advisor/verification_status"]` | No native SARIF equivalent |
| `Finding.kind` | `properties["opensips-advisor/kind"]` | `review_required` lives here, not in `level` |
| `Finding.fingerprint` | `partialFingerprints["stable/v1"]` | SARIF native |
| `Finding.cwe` | `taxa[].id` | SARIF native |
| `Finding.location` | `locations[0].physicalLocation.region` | SARIF native |
| `Finding.recommendation` | `fixes[].artifactChanges` | When the recommendation contains a literal cfg replacement, render as a SARIF fix; otherwise put in `message.markdown` |
| `judge_dissented` findings | `result` with `suppressions: [{ kind: "external" }]` | Visible to SARIF consumers that opt to read suppressed results |

The SARIF mapping is normative: anyone consuming the advisor via SARIF gets a consistent view, but loses the kind/confidence/verification distinctions unless they read the `opensips-advisor/*` properties.

## Validation rules

These are invariants every `RunResult` must satisfy. The engine asserts them before emission; rule authoring tests check the same invariants on synthetic findings.

1. `kind == "review_required"` ↔ `severity == null && severity_would_be != null && verification_status == "unchecked" && confidence == "low"`.
2. `kind == "vulnerability"` ↔ `severity != null && severity_would_be == null && verification_status ∈ {deterministic_confirmed, judge_confirmed}` (review_required never appears in `findings` with `kind: vulnerability`; `judge_dissented` never appears in `findings` at all).
3. If `verification_status == "judge_confirmed"`, then `confidence ∈ {medium, high}` AND `confidence == high` requires the rule to declare `judge_confirmed_can_be_high: true`.
4. If `severity == "info"`, then `cvss_v4_vector == null && cvss_v4_score == null` AND the finding appears in `informationals[]`, not `findings[]`.
5. `findings.length == hardening_index_breakdown.deductions.length` (every counted finding has exactly one deduction record).
6. `RunResult.findings[*].rule_id` are all defined in the rule catalog (no orphan rule IDs).
7. `Finding.fingerprint` values are unique within a single RunResult (same finding emitted twice is a bug).

## Cross-references

- Severity, confidence, and verification status semantics: `15_CONFIDENCE_AND_VERIFICATION.md`.
- The hardening index formula and flat-penalty conditions: `24_HARDENING_INDEX.md` (not yet authored; draft formula lives in `22_REPORT_TEMPLATES.md` until extracted).
- SARIF 2.1.0 spec: external. The mapping table above is the contract; the spec is the format.
- Rule catalog schema (which fields the catalog uses to populate `Finding`): `13_RULE_AUTHORING.md` (not yet authored).
- Suppression file format and pragma syntax: `23_SUPPRESSION_PROTOCOL.md` (not yet authored).
