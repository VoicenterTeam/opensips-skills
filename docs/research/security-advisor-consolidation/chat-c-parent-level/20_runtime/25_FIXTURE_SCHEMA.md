# 25_FIXTURE_SCHEMA

## Purpose

Defines the `.expected.json` schema used to declare the expected advisor output for a test fixture cfg. Each fixture cfg in `50_fixtures/` has a sibling `.expected.json` carrying the contract: which findings should fire, where, with what verification status, and (for tricky fixtures) which findings must explicitly *not* fire as confirmed vulnerabilities.

The schema is anchor-based, not line-based: locations are matched by searching for an anchor substring in the cfg and accepting the matched finding within ±N lines of the anchor. This decouples fixture validation from cosmetic line-number drift caused by formatting changes, comment edits, or reordering of unrelated cfg sections.

This schema is the contract between fixture authors (this document plus the fixtures themselves) and the test runner (which consumes both the cfg and the `.expected.json` to assert engine behavior).

## File location

Each fixture's `.expected.json` lives next to its cfg, named identically except for the extension:

```
50_fixtures/
├── clean/
│   ├── clean-l1-enterprise-pbx.cfg
│   └── clean-l1-enterprise-pbx.expected.json
├── vulnerable/
│   ├── vulnerable-mixed.cfg
│   └── vulnerable-mixed.expected.json
└── tricky/
    ├── custom-sanitizer.cfg
    └── custom-sanitizer.expected.json
```

Golden reports (`50_fixtures/golden_reports/`) are *not* `.expected.json` files — they are full advisor-output samples for human review. Goldens have their own structure, defined in `22_REPORT_TEMPLATES.md`.

## Top-level schema

```typescript
type ExpectedJson = {
  fixture: string;                              // bare filename, e.g., "vulnerable-mixed.cfg"
  expected_opensips_version: string;            // semver, e.g., "3.6.2"
  expected_profile: "L1" | "L2" | "custom";
  expected_hardening_index_range: [number, number];  // inclusive, e.g., [18, 28]

  expected_findings: ExpectedFinding[];         // confirmed vulnerabilities + review_required
  expected_informationals?: ExpectedFinding[];  // severity:info, separate from findings
  expected_finding_counts_by_severity?: Record<Severity, number>;
  expected_review_required_count?: number;

  must_not_fire?: string[];                     // rule_ids that MUST NOT produce any finding
  must_not_fire_as_vulnerability?: string[];    // rule_ids that MUST emit only as review_required

  validation_notes?: string[];                  // free-text notes for human reviewers
};
```

The hardening-index range is inclusive on both ends. Use a tight range (±2–3) for fixtures with deterministic findings; widen the range for fixtures with `review_required` items where the half-weight multiplier introduces minor variation depending on engine implementation choices.

## ExpectedFinding

```typescript
type ExpectedFinding = {
  id_anchor: string;                            // e.g., "F1", "F2" — matches golden report
  rule_id: string;                              // OSIPS-SEC-<FAMILY>-<NNN>

  severity?: Severity;                          // for kind: vulnerability
  severity_would_be?: Severity;                 // for kind: review_required (mutually exclusive)
  confidence: Confidence;
  verification_status: VerificationStatus;
  kind: "vulnerability" | "review_required";

  approximate_location: ApproximateLocation;

  suppressible?: boolean;                       // present when rule has suppressible: false

  // Optional content assertions, present when the contract requires them:
  must_cite_cve?: string;                       // e.g., "CVE-2026-25554"
  must_identify_taint_source?: string;          // for dataflow rules
  must_identify_sink?: string;                  // for dataflow rules
  must_identify_opaque_function?: string;       // for review_required findings
  must_trace_dataflow_through?: string[];       // ordered list of dataflow_trace nodes
  review_reason_keyword?: string;               // for review_required findings
  expected_match_count_min?: number;            // when one rule fires N≥M times in same cfg

  validation_notes?: string;
};
```

Exactly one of `severity` or `severity_would_be` must be set, matching `kind`. This mirrors the runtime invariant from `11_DATA_MODEL.md` § "Validation rules" item 1.

The `must_*` fields are content assertions: they require the test runner to check that specific information appears in the emitted finding's body (rationale, grounding, dataflow trace). Use sparingly — only when the assertion is part of the security contract, not just a nice-to-have. Over-asserting on content makes fixtures brittle to legitimate prose edits in rules.

## ApproximateLocation

```typescript
type ApproximateLocation = {
  anchor: string;                               // substring to search for in the cfg
  tolerance_lines: number;                      // ±N; -1 means "section-level, line-agnostic"
};
```

The validator searches the cfg for the anchor string. If exactly one match is found, the matched finding's reported line range must overlap with `[match_line - tolerance, match_line + tolerance]`. If multiple matches exist, the validator accepts a finding that overlaps with any of them. If zero matches, the fixture is malformed — fixture authors must update the anchor.

A `tolerance_lines: -1` indicates the finding does not have a meaningful line location (typical for module-load-section findings like "no pike loaded anywhere"). Use the special anchor `module_load_section` to flag this case explicitly.

**Anchor authoring guidance.** Anchors should be:
- Short (typically 20–60 characters).
- Distinctive — pick a substring unlikely to appear elsewhere in the cfg.
- Stable — avoid substrings that change with cosmetic formatting (whitespace, optional quotes).
- Self-explanatory — a reviewer reading the `.expected.json` should be able to guess the anchor's location from the string alone.

Good anchors: `modparam("auth_jwt", "db_mode"`, `verify_cert", "[default]0"`, `perl_exec_simple("My::Sanitize::clean_username"`.

Bad anchors: `loadmodule` (too generic), `# comment` (cosmetic), `0.0.0.0` (could appear in multiple modparams).

## Severity, Confidence, VerificationStatus enums

These are imported from `11_DATA_MODEL.md`:

```typescript
type Severity = "critical" | "high" | "medium" | "low" | "info";
type Confidence = "high" | "medium" | "low";
type VerificationStatus =
  | "deterministic_confirmed"
  | "judge_confirmed"
  | "judge_dissented"
  | "unchecked";
```

`.expected.json` files use the same vocabulary — no fixture-specific values.

## must_not_fire vs must_not_fire_as_vulnerability

These are two distinct security contracts.

**`must_not_fire`** — the listed rules must produce no findings (vulnerability or review_required) on this cfg. Use this for clean fixtures: a rule that fires on a clean cfg is a false positive.

**`must_not_fire_as_vulnerability`** — the listed rules must produce findings only as `kind: review_required`, never as `kind: vulnerability`. Use this for tricky fixtures with opaque transformations: silent-pass and confirmed-vuln are both regressions.

A fixture can use either, both, or neither. The two are not mutually exclusive — a tricky fixture might list rule X under `must_not_fire` (the rule shouldn't fire at all on this cfg) and rule Y under `must_not_fire_as_vulnerability` (the rule must abstain).

## Worked examples

### Clean fixture

```json
{
  "fixture": "clean-l1-enterprise-pbx.cfg",
  "expected_opensips_version": "3.5.4",
  "expected_profile": "L1",
  "expected_hardening_index_range": [98, 100],
  "expected_findings": [],
  "expected_informationals": [
    {
      "id_anchor": "INFO-001",
      "rule_id": "OSIPS-SEC-MI-002",
      "severity": "info",
      "confidence": "high",
      "verification_status": "deterministic_confirmed",
      "kind": "vulnerability",
      "approximate_location": { "anchor": "modparam(\"mi_http\", \"ip\"", "tolerance_lines": 3 }
    }
  ],
  "must_not_fire": [
    "OSIPS-SEC-AUTH-001", "OSIPS-SEC-MI-001", "OSIPS-SEC-INJ-001",
    "OSIPS-SEC-TLS-001", "OSIPS-SEC-RELAY-001"
  ]
}
```

### Tricky fixture (review_required contract)

```json
{
  "fixture": "custom-sanitizer.cfg",
  "expected_opensips_version": "3.5.4",
  "expected_profile": "L1",
  "expected_hardening_index_range": [68, 75],
  "expected_findings": [
    {
      "id_anchor": "F2",
      "rule_id": "OSIPS-SEC-INJ-001",
      "severity_would_be": "high",
      "confidence": "low",
      "verification_status": "unchecked",
      "kind": "review_required",
      "approximate_location": {
        "anchor": "perl_exec_simple(\"My::Sanitize::clean_username\"",
        "tolerance_lines": 4
      },
      "must_identify_opaque_function": "My::Sanitize::clean_username",
      "must_trace_dataflow_through": [
        "$fU", "perl_exec_simple", "$avp(safe_user)", "avp_db_query"
      ]
    }
  ],
  "must_not_fire_as_vulnerability": ["OSIPS-SEC-INJ-001"]
}
```

## Validation algorithm (test runner contract)

A test runner consuming this schema must:

1. Parse the cfg and run the advisor engine against it with `expected_profile`.
2. Assert `engine.context.opensips_version_detected == expected_opensips_version` (or close enough — the runner may be lenient on patchlevel for fixtures that don't pin exactly).
3. Assert `engine.hardening_index ∈ expected_hardening_index_range`.
4. For each `ExpectedFinding`:
   - Locate the anchor substring in the cfg. Fail loudly if zero matches.
   - Find the engine's emitted finding whose `rule_id` matches and whose location overlaps the anchor's tolerance range.
   - Assert each declared field (`severity`, `severity_would_be`, `confidence`, `verification_status`, `kind`) matches the emitted finding.
   - For each `must_*` content assertion, check the emitted finding's body for the specified content.
5. For each `rule_id` in `must_not_fire`: assert no finding with that `rule_id` was emitted.
6. For each `rule_id` in `must_not_fire_as_vulnerability`: assert any finding with that `rule_id` has `kind: review_required`, not `kind: vulnerability`.
7. If `expected_finding_counts_by_severity` is set, assert the engine's counts match.
8. Report any failed assertion with the fixture filename, the assertion that failed, and the engine's actual emission for diff inspection.

The runner does *not* assert the absence of findings beyond `must_not_fire`. A fixture may produce additional informationals or low-severity findings the contract didn't anticipate; those are surfaced for human review but don't fail the fixture.

## Cross-references

- Severity, confidence, verification_status semantics: `15_CONFIDENCE_AND_VERIFICATION.md`.
- Runtime types this schema mirrors: `11_DATA_MODEL.md`.
- Hardening index formula used to validate `expected_hardening_index_range`: `22_REPORT_TEMPLATES.md` § "Hardening Index — formula" (note: the formula is currently in dispute pending consolidation; see the open-issues memo at consolidation time).
- Golden report structure (different artifact, also in `50_fixtures/`): `22_REPORT_TEMPLATES.md`.
