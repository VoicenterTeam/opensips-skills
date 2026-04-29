# 14_DETECTION_ENGINE

## Purpose

Defines how rules are matched against an OpenSIPS configuration. Specifies the parser interface, the four detection phases, the AST query DSL, the dataflow query format, the sanitizer registry, the semantic-pass machinery, and the triage layer. The contract here is between the rule catalog (input: rules following `13_RULE_AUTHORING.md`) and the runtime (output: `Finding[]` conforming to `11_DATA_MODEL.md`).

This document does not define the parser implementation itself — that lives in the OpenSIPS-MCP-server project. Detection engine consumes the parser's output as a structured AST.

---

## Pipeline overview

```
cfg file
  ↓
[ Parse ]                        → AST + module-load index
  ↓
[ Structural ]                   → fires deterministic structural matches
  ↓
[ Value/Pattern ]                → fires deterministic value matches
  ↓
[ Dataflow ]                     → fires taint-based matches; raises review_required for opaque paths
  ↓
[ Semantic ]                     → judge pass for fp_classes; can dissent
  ↓
[ Triage + Verification ]        → assemble Finding[], dedup, fingerprint, validate invariants
  ↓
RunResult
```

Each phase is total — every applicable rule for that phase runs against the AST, regardless of what earlier phases produced. The semantic phase additionally consumes structural and dataflow matches as input (it weighs known FP classes against existing matches; it doesn't generate matches independently).

---

## Parse phase

Input: cfg file as bytes.
Output: `ParseResult { ast: AST, module_index: ModuleIndex, comments: Comment[] }`.

The AST is the structured representation; `module_index` is a quick-lookup of `loadmodule` declarations and their `modparam` bindings; `comments` are preserved for use in suppression-pragma matching.

The advisor does not own the parser. The OpenSIPS-MCP server produces structured objects from cfg input; the advisor wraps that output in the `ParseResult` shape. The parser version is recorded in `RunResult.context.parser_version` for reproducibility.

**Failure modes.**
- Parse error → engine emits a single synthetic finding `OSIPS-SEC-CFG-PARSE-ERROR` with severity:high and the parser's error message. No further phases run.
- Unrecognized syntax → parser produces a partial AST with `unrecognized_node` placeholders. Phases continue but rules that match against affected nodes are skipped, with a `rules_skipped` entry citing the unrecognized region.

---

## AST query DSL — v1.0 (lightweight matchers)

Rules express their evidence patterns through a small fixed set of named matchers. Each matcher takes structured parameters and returns zero or more `Match` objects.

The decision to start with named matchers rather than a tree-sitter-style query language is deliberate. The parse tree shape is not yet a public contract, and we don't have rules that need expressivity beyond what named matchers cover. v2.0 may introduce a raw query syntax as an escape hatch.

### `modparam_match`

Matches `modparam(...)` calls.

```yaml
- pattern_kind: modparam_match
  module: "mi_http"                      # required, exact string
  param: "ip"                            # required, exact string
  value:                                 # value predicate, see "Value predicates"
    starts_with: "0.0.0.0"
  bind:
    - location: $location                # binds the source location
    - value_text: $ip
```

### `function_call_match`

Matches calls in route bodies. Function-name matching is exact; argument matching uses positional value predicates.

```yaml
- pattern_kind: function_call_match
  function: "t_relay"                    # required
  in_route: ["request_route", "route[*]"]  # which route bodies to search; "*" wildcard
  args: []                               # positional value predicates; [] = any args
  bind:
    - location: $location
    - enclosing_route: $route_name
```

### `route_block_match`

Matches whole route bodies, useful for shape rules like "this route lacks `is_myself` before `t_relay`".

```yaml
- pattern_kind: route_block_match
  route: "request_route"
  contains_function: "t_relay"           # required: the route must contain at least one match
  must_not_be_preceded_by:               # within the same route, before contains_function
    - function: "is_myself"
    - function: "has_totag"
  must_not_be_enclosed_in:               # within any enclosing if/else
    - condition_calls: ["allow_routing", "is_myself"]
  bind:
    - location: $relay_location          # the t_relay() site
    - route_span: $route_lines
```

### `loadmodule_match`

Matches a `loadmodule` declaration.

```yaml
- pattern_kind: loadmodule_match
  module: "auth_jwt"
  bind:
    - location: $location
```

### `version_match`

Matches the cfg's detected OpenSIPS version against a semver range. Returns one or zero matches per cfg.

```yaml
- pattern_kind: version_match
  range: ">=3.1, <3.6.4"
  bind:
    - version: $detected_version
```

### Value predicates

Used in `value:` and `args:` parameters of the matchers above.

| Predicate | Meaning |
|---|---|
| `eq: "X"` | exact string equality |
| `starts_with: "X"` | prefix match |
| `ends_with: "X"` | suffix match |
| `contains: "X"` | substring match |
| `matches_regex: "X"` | regex match (PCRE syntax) |
| `not_matches_regex: "X"` | negated regex match |
| `eq_int: N` | exact integer equality |
| `in: ["A", "B"]` | one of |
| `not_in: ["A", "B"]` | none of |
| `any: true` | matches anything (placeholder for "I care about position, not value") |

Predicates can be combined with `all_of:` and `any_of:` for boolean logic:

```yaml
value:
  all_of:
    - matches_regex: "^[0-9.]+$"
    - not_in: ["127.0.0.1", "10.0.0.0", "192.168.0.0", "172.16.0.0"]
```

### Match composition

A rule can declare multiple `evidence_patterns`. By default they are AND'd — all patterns must match for the rule to fire. To express OR, use a separate rule for each branch, or use the `any_of:` envelope at the top of the patterns list:

```yaml
evidence_patterns:
  any_of:
    - pattern_kind: modparam_match
      module: "mi_http"
      param: "ip"
      value: { eq: "0.0.0.0" }
    - pattern_kind: modparam_match
      module: "mi_http"
      param: "ip"
      value: { starts_with: "::" }
```

---

## Structural phase

Runs all matchers in this phase: `modparam_match`, `function_call_match`, `route_block_match`, `loadmodule_match`, `version_match`. These are pure structural shape matches — they don't read variable values from the surrounding cfg or follow data flow.

Rules that declare only `detection_phase: [structural]` produce findings directly. The triage layer marks them `verification_status: deterministic_confirmed` unless a later phase contradicts them.

---

## Value/Pattern phase

Same matcher vocabulary as structural, but specifically intended for matchers whose payload is value-oriented rather than shape-oriented (`tls_mgm verify_cert == "0"`, `db_url contains a literal password`, `calculate_ha1 == 1`). The phase distinction is mostly for engine diagnostics — rules can target either phase via their `detection_phase` field, and the engine groups timing accordingly.

Many rules declare both `structural` and `value_pattern` if their match has both shape and value components; the engine runs them once per declared phase but deduplicates by fingerprint.

---

## Dataflow phase

Input: AST + structural-phase results. Output: dataflow-derived matches plus `review_required` candidates.

### Source-sink declaration

A dataflow rule declares its sources and sinks:

```yaml
- pattern_kind: dataflow_query
  sources:
    - $fU
    - $fu
    - $rU
    - $hdr(*)                            # any header
  sinks:
    - function: "avp_db_query"
      arg: 0
    - function: "cachedb_query"
      arg: 1
  must_not_pass_through_any_of:
    - sanitizer_class: "string_escape"
    - sanitizer_class: "allowlist"
  bind:
    - location: $sink_location
    - source_node: $source_var
    - sink_node: $sink_function
```

(A `must_pass_through_one_of` predicate is reserved for a future revision when a rule actually requires it.)

### Sanitizer registry

A global registry classifies known transformations into categories. Rules reference the categories, not individual functions. The registry lives in `90_reference/sanitizer_registry.yaml` and is the single source of truth for "what counts as escaping".

```yaml
sanitizers:
  - id: s_escape_common
    classes: [string_escape]
    invocation: pseudovar_transformation  # $(var{s.escape.common})
    notes: |
      OpenSIPS-native transformation. Escapes ', ", \, NUL, CR, LF.
  - id: s_escape_user
    classes: [string_escape]
    invocation: pseudovar_transformation
  - id: s_escape_param
    classes: [string_escape]
    invocation: pseudovar_transformation
  - id: s_escape_param_strict
    classes: [string_escape, allowlist]
    invocation: pseudovar_transformation
```

### Opaque transformations and `review_required`

When the dataflow path from a source reaches a sink, the engine traces every node in between. If any intermediate node is an opaque transformation — a function the engine cannot reason about statically, listed in the rule's `abstain_on:` field — the engine produces a `review_required` finding instead of a confirmed finding.

Opaque-function categories recognized by the engine v1.0:

- `perl_exec_simple`, `perl_exec` — Perl module calls
- `python_exec` — Python module calls (when python module is loaded)
- `lua_exec` — Lua module calls
- `http_query`, `http_async_query`, `rest_get`, `rest_post` — external HTTP
- `xcap_get` — XCAP server queries
- `cachedb_*` when used as a transformation rather than a sink

A rule declares `abstain_on:` to opt into producing `review_required` for these paths. A rule that does not declare `abstain_on:` will silently pass on opaque paths — this is the wrong default, but it's the conservative-on-emission default. Rules touching tainted data should always declare `abstain_on:`.

### Dataflow trace recording

For every dataflow-derived finding (confirmed or review_required), the engine records the full path as a `DataflowNode[]` in `Finding.grounding.dataflow_trace`. Each node carries its role (`source | transformation | transformation_opaque | intermediate | sink`) and its source location. This is the audit record — it's how a reviewer can verify the engine's reasoning.

---

## Semantic phase

Input: AST + matches from earlier phases (structural, value, dataflow). Output: `judge_confirmed`, `judge_dissented`, or unchanged matches.

### When the semantic phase runs

For every match produced by an earlier phase, the engine checks whether the match's rule declares `detection_phase` containing `semantic`. If yes, the semantic phase runs the judge against that match.

This is the **always-run** policy. Rules that declare semantic always get judged; we don't skip semantic just because structural fired clean. Rationale: semantic exists to weigh known FP classes; if structural fires but a known FP class applies, we want dissent.

### Judge invocation

For each match-with-fp-classes, the engine instantiates the rule's `judge_prompt_template` (defined in `13_RULE_AUTHORING.md` § "Judge prompt template") with these variables:

| Variable | Source |
|---|---|
| `{{rule.title}}` | rule frontmatter |
| `{{evidence_snippet}}` | the matched cfg lines plus 5 lines of context above and below |
| `{{fp_class.description}}` | for each FP class declared by the rule |
| `{{cfg_context}}` | up to 200 lines of surrounding cfg, deduplicated against evidence |
| `{{modules_loaded}}` | comma-separated list of loaded modules |
| `{{intake_answers}}` | optional, present if intake was conducted |

The prompt is invoked via the configured LLM endpoint. The expected output is JSON of the shape `{"applies": "yes|no|cannot_determine", "rationale": "..."}`. The engine validates the JSON shape; non-conformant outputs are retried once.

### Judgment outcomes

| `applies` value | meaning | resulting verification_status |
|---|---|---|
| `no` | FP class doesn't apply; deterministic match holds | `judge_confirmed` |
| `yes` | FP class applies; deterministic match should be silenced | `judge_dissented` (rationale: "judge confirmed FP class applies") |
| `cannot_determine` | Judge can't tell | `judge_dissented` (rationale: "judge uncertain — surfaced for calibration") |

The `cannot_determine → judge_dissented` mapping is conservative on emission: when the judge cannot characterize the match, we silence rather than emit a low-confidence finding the reader may treat as actionable. The dissent is recorded in `Appendix D` of the report so reviewers see the abstention. Calibration signal: if a rule produces `cannot_determine` dissents at high frequency, the rule's FP classes are under-specified — surface to rule-quality work.

### Judge invocation failure

If the LLM returns invalid JSON, an HTTP error, or a timeout, the engine treats the failure identically to `cannot_determine`: the match is moved to `judge_dissented` with rationale `"invocation failed: <reason>"`. This keeps the verification_status enum at four values and avoids introducing a fifth status for a rare operational condition.

The dissent record carries enough information for an operator to distinguish "judge said uncertain" from "judge errored" by reading the rationale string. In aggregate, high invocation-failure rates surface in `Appendix D` as a signal that the LLM endpoint or prompt is unhealthy.

### Per-rule confidence ceiling

If the rule declares `judge_confirmed_can_be_high: true` AND the judge returns `applies: no`, the engine emits the finding at the rule's declared severity with confidence High (overriding the default Medium cap). See `15_CONFIDENCE_AND_VERIFICATION.md` for the policy rationale.

---

## Triage and verification phase

The final phase. Input: union of all matches from all phases. Output: validated `Finding[]`.

Steps in order:

### 1. Deduplicate by fingerprint

Two matches with the same fingerprint (recipe in `11_DATA_MODEL.md`) collapse to one finding. This handles the common case of a rule firing in multiple phases (e.g., once in structural, once in value_pattern) for the same cfg location. The earliest-phase match is retained; subsequent matches contribute to `Grounding.parser_nodes` if they reference distinct AST nodes.

### 2. Apply suppressions

Each `Match` is checked against `RunResult.suppressions_applied` (loaded from in-cfg pragmas and `.opensips-advisor/suppressions.yaml`). Suppressed matches are removed from `findings[]` and recorded in `suppressions_applied` with `hash_match_at_run_time` populated. See `23_SUPPRESSION_PROTOCOL.md` (not yet authored) for the matching algorithm.

Rules with `suppressible: false` in frontmatter ignore suppressions targeted at them and emit a diagnostic warning.

### 3. Move dissented matches to diagnostics

Matches with `verification_status: judge_dissented` are moved out of `findings[]` and into `RunResult.diagnostics.dissented_findings`. They are not silenced silently — the audit list is the record.

### 4. Move informationals

Matches whose rule declares `severity: info` are moved from `findings[]` to `informationals[]`.

### 5. Compute fingerprints

For every remaining match, compute the stable fingerprint per `11_DATA_MODEL.md` recipe v1.

### 6. Validate invariants

Run all seven validation rules from `11_DATA_MODEL.md` § "Validation rules" against the assembled `RunResult`. Failure halts emission and surfaces the invariant violation as an engine error — this is a bug in the rule catalog or engine, not in the cfg.

### 7. Compute hardening index

Apply the formula from `22_REPORT_TEMPLATES.md` § "Hardening Index — formula". Populate `HardeningIndexBreakdown`.

### 8. Emit `RunResult`

JSON serialization to disk; Markdown rendering per `22_REPORT_TEMPLATES.md`; SARIF rendering per `11_DATA_MODEL.md` § "SARIF mapping".

---

## Cross-phase invariants

Things that must hold across the pipeline, enforced by the triage layer:

1. **No phase produces a `Finding` with `kind: review_required` that doesn't have an `opaque_function` set.** Abstention without a named opaque function is invalid.
2. **The judge is never asked to evaluate a match whose rule doesn't declare `detection_phase: semantic`.** Engine bug if it happens.
3. **A match cannot transition from `kind: review_required` to `kind: vulnerability` via the semantic phase.** Abstention is sticky; only triage's suppression-update mechanism can reclassify (and that requires a re-run).
4. **`judge_dissented` matches never appear in the SARIF `results[]` array without `suppressions:` populated.** This is the SARIF contract for marking suppressed-but-recorded findings.

---

## Engine versioning and rule-catalog versioning

The engine is versioned independently of the rule catalog. A given engine version declares the catalog schema versions it can read (frontmatter, evidence-pattern syntax, sanitizer-registry format). An engine running a catalog declared at a higher schema version refuses to start with a clear error — silent partial-compatibility is the wrong default.

| Engine version | Reads catalog schema | Notes |
|---|---|---|
| 0.1.0 | 1.0 | initial release |
| 0.2.0 | 1.0, 1.1 | tentative; if 1.1 added |

Catalog schema bumps are documented in `13_RULE_AUTHORING.md` § "Frontmatter".

---

## Open issues and v2.0 candidates

Not blocking v1.0 but worth recording as known limits:

- **No tree-sitter-style query language.** Rules requiring novel AST shapes that don't fit the named matchers will need to either compose patterns awkwardly or wait for v2.0.
- **No cross-cfg analysis.** Each cfg is analyzed independently. Rules cannot express "this cfg's `tls_ciphers_list` differs from the cfg deployed yesterday" or "two cfgs in the same cluster declare conflicting routing."
- **No `include_file` resolution.** If a cfg uses `include_file "secrets.cfg"`, the engine analyzes the parent cfg as-is; the included file is not pulled in. Rules targeting secrets-in-cfg work on the parent only. v2.0 candidate: optional include resolution with explicit allowlist of include paths.
- **No path-sensitive analysis.** A `t_relay()` reachable only inside `if (false) { ... }` is treated as reachable. The semantic phase can sometimes catch this with the right FP class enumeration, but it's not first-class.
- **Sanitizer registry is global.** A rule can't declare "for my purposes, `s.escape.common` is not a sufficient sanitizer." If we need that, it'd be a per-rule override on the registry.
- **`must_pass_through_one_of` dataflow predicate.** Reserved syntax; not implemented in v1.0.

---

## Cross-references

- Verification status semantics: `15_CONFIDENCE_AND_VERIFICATION.md`.
- Type definitions for `Match`, `Finding`, `Grounding`, `DataflowNode`: `11_DATA_MODEL.md`.
- Rule frontmatter and the `evidence_patterns` schema this engine consumes: `13_RULE_AUTHORING.md`.
- Hardening index formula computed by triage step 7: `22_REPORT_TEMPLATES.md` § "Hardening Index — formula".
- Suppression matching algorithm used in triage step 2: `23_SUPPRESSION_PROTOCOL.md` (not yet authored).
- Sanitizer registry: `90_reference/sanitizer_registry.yaml` (not yet populated; the four `s.escape.*` transforms will seed it).
- Parser project that produces the AST consumed by this engine: external, OpenSIPS-MCP-server.
