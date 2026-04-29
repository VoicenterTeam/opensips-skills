# 13_RULE_AUTHORING

## Purpose

Defines the rule file format, frontmatter schema, body sections, file layout, and lifecycle conventions for the OpenSIPS advisor's rule catalog. A rule is the atomic unit the engine executes; everything else in the system — the data model, the report templates, the verification protocol — exists to serve rules well-authored under this spec.

This doc is the contract between rule authors (humans, security analysts, operators contributing rules) and the engine (which reads rules at startup and executes them per-run). Schema changes here are breaking changes — bump `schema_version` in the catalog manifest.

---

## File format

Each rule lives in its own file. Format: **YAML frontmatter + Markdown body**, separated by a `---` fence on its own line.

```markdown
---
id: OSIPS-SEC-MI-001
version: "1.0"
# ... structured metadata ...
---

# Detection

Prose description of what the rule looks for.

# Evidence patterns

\```yaml
- pattern_kind: ast_query
  query: ...
\```

# Rationale

Prose: why this is a vulnerability.

# Recommendation template

\```opensips-cfg
# GOOD
...
\```

# References

- ...

# Test fixtures

- vulnerable: 50_fixtures/vulnerable/...
- clean:      50_fixtures/clean/...
```

Rationale for this format: YAML frontmatter is parseable and lintable by tooling without needing a custom parser; the Markdown body is human-readable and renders sensibly in any editor or web view. Mixed-format files (e.g., YAML inside Markdown fenced blocks for evidence patterns) keep structured data structured while letting prose stay prose.

**Rejected alternatives.** Pure YAML (loses Markdown's prose-friendly authoring), pure JSON (no comments, hostile to authoring), separate `.yaml + .md` pairs (atomic-PR review fragmented across files).

---

## File layout

```
30_rules/
├── _CATALOG.md                    # auto-generated index of all rules
├── auth/
│   ├── _INDEX.md                  # family-level index, hand-authored
│   ├── OSIPS-SEC-AUTH-001.md
│   ├── OSIPS-SEC-AUTH-002.md
│   └── ...
├── tls/
│   ├── _INDEX.md
│   └── OSIPS-SEC-TLS-001.md
├── injection/
├── relay_and_routing/
├── dos_defense/
├── mi_exposure/
├── media/
├── stir_shaken/
├── tracing_and_logging/
├── identity_spoofing/
├── config_hygiene/
└── dispatcher_and_lb/
```

The 12 module families are fixed; new families require an architectural decision and updates to `15_CONFIDENCE_AND_VERIFICATION.md`, `11_DATA_MODEL.md`, and the manifest.

**Rule numbering.** Within each family, rules are numbered `001` through `999`. Numbers are assigned at rule-introduction time and **never reused**. A deprecated rule keeps its number; its file moves to `30_rules/_deprecated/<original_path>` for historical reference.

**The `_CATALOG.md` file** is auto-generated at build time from all rule frontmatter. Hand-edits are discarded. Rule authors update individual rule files; the catalog reflects the union.

**The `_INDEX.md` files per family** are hand-authored and provide narrative overview ("what this family is about, how its rules relate to each other, common deployment patterns"). The catalog has the structured index; `_INDEX.md` is for someone reading the family for the first time.

---

## Rule ID convention

`OSIPS-SEC-<FAMILY>-<NNN>` where:
- `OSIPS-SEC-` is the fixed prefix (distinguishes this catalog from any future non-security rules).
- `<FAMILY>` is one of: `AUTH`, `TLS`, `INJ`, `RELAY`, `DOS`, `MI`, `MEDIA`, `STIRSHAKEN`, `LOG`, `SPOOF`, `CFG`, `DISPATCHER`. Note these are short codes, not the full directory names — the directory `injection/` contains rules with code `INJ`, `tracing_and_logging/` contains `LOG`, etc.
- `<NNN>` is zero-padded 3-digit number.

Mapping table from directory to short code:

| Directory | Code |
|---|---|
| `auth/` | `AUTH` |
| `tls/` | `TLS` |
| `injection/` | `INJ` |
| `relay_and_routing/` | `RELAY` |
| `dos_defense/` | `DOS` |
| `mi_exposure/` | `MI` |
| `media/` | `MEDIA` |
| `stir_shaken/` | `STIRSHAKEN` |
| `tracing_and_logging/` | `LOG` |
| `identity_spoofing/` | `SPOOF` |
| `config_hygiene/` | `CFG` |
| `dispatcher_and_lb/` | `DISPATCHER` |

---

## Frontmatter — required fields

Every rule frontmatter must include:

```yaml
id: OSIPS-SEC-<FAMILY>-<NNN>            # full rule ID
version: "1.0"                           # semver
name: <short-kebab-case-name>            # e.g., "mi-http-public-bind"
title: <Human readable title>            # e.g., "MI HTTP exposed on public interface"
module_family: <directory_name>          # e.g., "mi_exposure"
status: stable | draft | deprecated
introduced_in_engine_version: "0.1.0"

severity: critical | high | medium | low | info
default_effort: XS | S | M | L

cvss_v4_vector: "CVSS:4.0/..."           # null if severity == info
cwe: ["CWE-XXX"]                         # at least one
owasp: "AYY:20ZZ"                        # null if no clean mapping
mitre_attack: ["TXXXX"]                  # may be empty list

description_short: |                     # single line, used in SARIF and catalog index
  One-line description.

detection_phase:                         # which engine phase fires this
  - structural | value_pattern | dataflow | semantic
applies_if_opensips_version: ">=3.1, <4.0"   # semver range, OpenSIPS-specific
applies_if_modules_loaded: ["module_name"]   # OR semantics across the list

suppressible: true | false               # false for active CVEs and a few hard rules
```

---

## Frontmatter — conditional fields

These fields are required only when their guard condition is met.

```yaml
# Required if detection_phase contains "semantic":
fp_classes:                              # named, narrowly enumerated FP scenarios
  - id: permissions_allow_routing
    description: >
      The permissions module is loaded and an allow_routing() call
      is reachable from the t_relay() site.
  - id: in_dialog_only
    description: >
      The t_relay() in question is reached only when has_totag() is true.

# Required if rule should opt out of the judge_confirmed Medium cap:
judge_confirmed_can_be_high: true        # default false; requires fp_classes enumerated

# Required if the rule can produce review_required:
abstain_on:                              # opaque-function categories
  - perl_exec_simple
  - python_exec
  - http_query_external
severity_would_be: high                  # severity if abstention later resolved as confirmed

# Required if the rule has CVE applicability:
cve:
  - id: CVE-2026-25554
    affected_versions: ">=3.1, <3.6.4"
    fixed_in: "3.6.4"

# Required if rule deprecated:
deprecated_in_engine_version: "0.4.0"
replaced_by: OSIPS-SEC-AUTH-007
deprecation_reason: |
  Prose explaining why.

# Optional, profile-specific tuning:
profile_overrides:
  L2:
    severity: critical                   # promote at L2 (rare; usually L2 demotes)
  custom:
    suppressible: true
```

---

## Body sections — required

Every rule body must have these sections, in order, with these `#` headings:

### `# Detection`
Prose description of what shape the rule matches in cfg. Should be readable by an OpenSIPS operator who is not a security specialist.

### `# Evidence patterns`
Structured matchers, fenced as `yaml` code blocks. Schema:

```yaml
- pattern_kind: ast_query | regex | dataflow_query
  match: |
    <pattern body, format depends on kind>
  bind:
    - <variable_name>: <bound_node>
  required_modules: ["module_name"]      # AND across this list
  optional_modules: ["module_name"]      # purely informational, doesn't gate match
```

The exact AST query DSL is defined in `14_DETECTION_ENGINE.md` (not yet authored). For now, rule authors writing AST patterns should reference the parser's structured-object types from the existing MCP server's parsed-documentation objects. Regex patterns are accepted but discouraged for anything beyond trivial syntactic matches — the parser already produces structured objects, use them.

### `# Rationale`
Prose: why this cfg shape is a vulnerability. Should reference the threat model, the attacker capability assumed, and the impact. Should NOT explain the fix (that's the next section).

### `# Recommendation template`
Prose followed by an `opensips-cfg`-fenced "GOOD" snippet showing the corrected configuration. The fix should be paste-ready — actual cfg the operator can apply, not pseudocode. When multiple valid fixes exist, list them in priority order with a "Choose one of:" header.

### `# References`
Bullet list of authoritative sources. Required entries:
- At least one reference into `90_reference/` (master vulnerability ref or gap analysis).
- For CVE rules: the CVE record URL and at least one independent writeup.
- For OpenSIPS-specific rules: the relevant module documentation page.

External link rot is a real concern; mirror critical references into `90_reference/external_sources.md` rather than relying on URLs alone.

### `# Test fixtures`
Required pointers to fixture files demonstrating the rule fires (vulnerable) and doesn't fire (clean).

```yaml
- type: vulnerable
  path: 50_fixtures/vulnerable/<file>.cfg
  expected_finding_anchor: F<N>          # which finding ID in the .expected.json
- type: clean
  path: 50_fixtures/clean/<file>.cfg
- type: tricky                           # required if rule has fp_classes OR abstain_on
  path: 50_fixtures/tricky/<file>.cfg
  exercises_fp_class: <fp_class_id>      # for semantic-phase rules with fp_classes
  exercises_abstain_on: <opaque_category> # for dataflow-phase rules with abstain_on
```

Exactly one of `exercises_fp_class:` or `exercises_abstain_on:` should be set per tricky-fixture pointer, matching the rule's detection phase. The two fields target different concepts: `exercises_fp_class:` proves the semantic judge correctly recognizes a known-benign reading, while `exercises_abstain_on:` proves the dataflow phase correctly produces `review_required` when a path traverses an opaque function. Both are abstention contracts in spirit, but they live in different phases and have different invariants — see `14_DETECTION_ENGINE.md` § "Semantic phase" and § "Opaque transformations and review_required".

A rule without at least one vulnerable fixture and one clean fixture is **draft status only** — it cannot graduate to `stable`. This is the test-discipline contract.

---

## Body sections — conditional

### `# Judge prompt template`
Required if `detection_phase` includes `semantic`. The prompt template the engine will instantiate when the semantic pass runs. Variables in `{{double_braces}}` are filled at runtime.

```markdown
You are auditing an OpenSIPS configuration for {{rule.title}}.

The deterministic structural match found this evidence:
{{evidence_snippet}}

There is one known false-positive class: {{fp_class.description}}.

Read the surrounding configuration context and answer:
1. Does the false-positive class apply here? (yes / no / cannot determine)
2. Brief rationale (1-2 sentences).

Output JSON: {"applies": "yes|no|cannot_determine", "rationale": "..."}
```

The judge prompt is rule-specific and matters for accuracy. It should be terse, ground-truth-oriented, and force the model into one of three outcomes. Open-ended judge prompts produce open-ended judge outputs and that's how confidence inflation happens.

### `# Migration notes`
Required if `status: deprecated`. Explain how operators using the previous rule should adopt the replacement, including any cfg-syntax changes.

---

## Rule lifecycle

Three statuses:

- **`draft`** — rule is being developed. Engine loads it but only emits findings under a `--include-draft-rules` flag. Drafts may have incomplete fixtures, draft FP classes, or unresolved authoring questions.
- **`stable`** — rule is in production. Engine emits findings normally. To graduate from `draft` to `stable`: at least one vulnerable fixture, at least one clean fixture, FP classes enumerated if `detection_phase` includes `semantic`, peer review by another rule author.
- **`deprecated`** — rule is no longer authoritative. Engine still loads it for backward-compatibility but emits findings under `--include-deprecated-rules` only. Deprecated rules must declare `replaced_by` (or `null` if there's no replacement, e.g., the underlying vulnerability class is no longer relevant).

Promotion `draft → stable` and demotion `stable → deprecated` are catalog-level changes that should be reviewed against the test fixtures and the catalog index.

---

## Rule versioning

A rule's `version` field is a semver tracking the rule's *behavior*, independent of the engine version.

- **MAJOR** — breaking change to detection logic (rule now fires on something it didn't before, or stops firing on something it did). Findings emitted under the new MAJOR have a different `rule_version` and may require new fingerprints.
- **MINOR** — additive change (new optional FP class, expanded version range, broader pattern). Existing matches are unchanged.
- **PATCH** — non-behavioral change (prose edits, documentation, reference link updates).

The `Finding.rule_version` field captures the version that emitted the finding, so audit logs and suppressions can pin to specific behavior.

---

## Authoring checklist

Before submitting a new rule:

1. **Frontmatter complete** — all required fields, conditional fields where their guards trigger.
2. **Detection prose readable** — an OpenSIPS operator can understand what the rule looks for.
3. **Evidence patterns work** — a rule author has run the patterns against the test fixtures by hand or via the engine and confirmed the expected matches.
4. **FP classes enumerated narrowly** — not "if the cfg looks fine," but "if the `permissions` module is loaded with `allow_routing()` reachable from the `t_relay()` site." Each FP class should be testable as a separate fixture.
5. **Recommendation is paste-ready** — the operator can copy the snippet into their cfg with at most one or two contextual edits.
6. **References include at least one `90_reference/` entry** — rules grounded only in external URLs are fragile.
7. **Test fixtures exist and pass** — vulnerable fixture fires the rule, clean fixture doesn't, tricky fixture (if applicable) exercises the FP class correctly.
8. **Judge prompt is terse and ground-truth oriented** — applicable only if `detection_phase` includes `semantic`.
9. **`suppressible` decision is documented** — if false, the body should briefly explain why.

---

## Cross-references

- Severity, confidence, verification_status semantics: `15_CONFIDENCE_AND_VERIFICATION.md`.
- Type definitions for fields populated by the rule: `11_DATA_MODEL.md`.
- AST query DSL and detection-engine internals: `14_DETECTION_ENGINE.md` (not yet authored).
- The 12 module families and their scope boundaries: `_INDEX.md` files in each `30_rules/<family>/` directory, and the manifest's family glossary.
- Example rules covering each detection phase: see `30_rules/auth/OSIPS-SEC-AUTH-002.md` (structural), `30_rules/injection/OSIPS-SEC-INJ-001.md` (dataflow), `30_rules/relay_and_routing/OSIPS-SEC-RELAY-001.md` (semantic with fp_classes).
