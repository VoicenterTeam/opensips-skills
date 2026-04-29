# 22_REPORT_TEMPLATES

## Purpose

Defines the canonical output format the advisor produces for human consumption (Markdown report) and machine consumption (SARIF 2.1.0). This document locks the report's section structure, the hardening-index formula, the per-finding template, and the markdown conventions. The three golden reports in `50_fixtures/golden_reports/` are the empirical reference; this doc is the prescriptive spec they conform to.

The advisor emits two output formats per run, both required:
- **Markdown report** — for the human reading the result.
- **SARIF 2.1.0 JSON** — for tooling, CI integration, and audit retention.

Mapping between the two is defined in `11_DATA_MODEL.md`. This document specifies the Markdown layout. Where the two formats diverge in fidelity, the SARIF is authoritative for downstream tooling; the Markdown is authoritative for human review.

---

## Report structure — required sections, fixed order

Every report contains the following sections in the following order. Sections marked **conditional** are emitted only when their content is non-empty.

1. **Header block** (always)
2. **Executive Summary** (always)
3. **Methodology & Scope** (always)
4. **Findings** (always — empty body if no findings)
5. **Remediation Roadmap** (always — empty if no findings)
6. **Appendix A — SARIF 2.1.0 Output** (always; full or excerpt)
7. **Appendix B — Suppressions & Deferred** (always; reads "no active suppressions" if empty)
8. **Appendix C — Informational Observations** (conditional; only when `informationals.length > 0`)
9. **Appendix D — Engine Diagnostics** (always)

Section ordering is fixed because consumers (humans, downstream tooling, suppressions UI, future TUI) can rely on the position. Reordering is a breaking change.

---

## Section 1 — Header block

```markdown
# OpenSIPS Security Advisor Report

**Configuration analyzed:** `<artifact_uri>`
**Profile applied:** `<profile>`
**OpenSIPS version detected:** `<version>`
**Engine version:** `opensips-advisor <semver>`
**Run ID:** `<uuid>`
**Analysis duration:** `<duration_seconds>`s
**Run timestamp:** `<iso8601_utc>`
```

The Run ID is mandatory and must be reproducible into the SARIF. It anchors cross-referencing between human and machine outputs.

---

## Section 2 — Executive Summary

The executive summary contains exactly two elements:

1. **Hardening Index** as a bolded line: `**Hardening Index: <N> / 100**`
2. **Severity counts table** — one row per severity level (Critical, High, Medium, Low, Info). For tricky reports, an additional column counts `review_required` items by would-be severity.
3. **Top observations narrative** — written prose, *never* bullet points or numbered lists for fewer than 4 items.

The narrative MUST follow the **top three observations rule**:

- Identify the top three highest-priority items by `(severity, confidence)` ordering. `severity` first (critical > high > medium > low > info), `confidence` second (high > medium > low) breaks ties.
- Write each observation as one paragraph of 2–4 sentences. The first sentence states the finding; the remaining sentences explain *why this rises to the top* — not a re-statement of the finding details (those live in the Findings section).
- For clean reports with no findings, the narrative summarizes the rules-executed count, version posture, and any version-gated CVE rules whose absence is informative ("CVE-X does not apply because module Y is not loaded").
- For reports where review_required dominates, the narrative explicitly calls out the abstention pattern and points the reader at the per-finding "What the human reviewer should check" subsections.

The narrative is prose because executive summaries are read for prioritization, not skimming. A reader who only reads the executive summary should walk away knowing the three things they need to act on this week.

---

## Section 3 — Methodology & Scope

Subsections, in order:

1. **Profile applied** — one paragraph naming the profile and any per-rule overrides.
2. **OpenSIPS version** — version, source (declared / detected), and corroborating signals if relevant.
3. **Modules in scope (security-relevant)** — alphabetized list of modules from `AnalysisContext.modules_loaded` that are referenced by at least one rule in the catalog.
4. **Intake answers** — table of intake question / answer pairs. Required when the run included an intake; omitted when the engine ran in batch mode without intake.
5. **Rule applicability** — total rules executed and reason codes for skipped rules (grouped by family). Format: "X rules executed out of Y. Skipped families: [name] (Z rules) — reason."

This section is the reproducibility contract: someone re-running on the same cfg with the same engine version and same intake answers should get the same scope. Any deviation belongs in `Appendix D — Engine Diagnostics`.

---

## Section 4 — Findings

Findings are sorted by **severity desc, confidence desc, family asc**. Findings with `kind: review_required` interleave with `kind: vulnerability` based on `severity_would_be` for sort purposes (they are tagged distinctly in their own headings).

### Per-finding template — `kind: vulnerability`

```markdown
### F<N> — <Short title> [<module_family>]

| Field | Value |
|---|---|
| **Finding ID** | `<finding_id>` |
| **Rule** | `<rule_id>` v<rule_version> (`<rule_short_name>`) |
| **Severity** | **<severity_capitalized>** |
| **Confidence** | <Confidence_capitalized> |
| **Verification status** | `<verification_status>` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `<cvss_vector>` (<score>) |
| **CWE** | <cwe_id> (<cwe_name>) |
| **OWASP** | <owasp_category> |
| **MITRE ATT&CK** | <attack_id> (<attack_name>) |
| **Location** | `<artifact>:<line_start>–<line_end>` |
| **Related locations** | `<artifact>:<line>` (<role>), ... |
| **Fingerprint** | `<fingerprint>` |

**Evidence.**
\```opensips-cfg
<evidence_snippet>
\```

**Rationale.** <prose>

**Recommendation.** <prose, optionally followed by:>
\```opensips-cfg
<fix_snippet>
\```

**Suppressible:** <true|false>. <Brief reason if false.>

**Grounding.**
- parser_nodes: `<node>`, `<node>`
- references_consulted: `<doc_path>`, `<doc_path>`
- dataflow_trace: <when present>

**Rationale trace.**
1. <step>
2. <step>
```

The "Why confidence is medium/low, not high" subsection is **required** when confidence is medium or low and `verification_status` is `judge_confirmed`. It explains what the deterministic shape was and what the judge weighed. Skipping this is hiding the engine's reasoning from the reader.

### Per-finding template — `kind: review_required`

Same as above with these substitutions:

- `Severity` → `Severity (would-be)` with `severity_would_be` value
- Add `Review reason` field
- Replace `Suppressible` with the abstention block: a "Why this is `review_required`, not a finding" subsection (3–5 sentences explaining the opaque path and the judge's abstention) and a "What the human reviewer should check" subsection (2–5 numbered concrete actions the reviewer should take).

The reviewer-checklist is the load-bearing piece — it's what makes `review_required` actionable rather than just a parking lot.

---

## Section 5 — Remediation Roadmap

A single table, one row per finding (vulnerability and review_required), sorted by priority:

| ID | Title | Severity | Effort | Priority |
|---|---|---|---|---|

Where:
- **Effort** scale: XS (<15 min), S (<1 hr), M (<1 day), L (<1 week). Set per-finding by the rule's `default_effort` field, may be tuned by the report writer if the cfg context warrants.
- **Priority** buckets: this week / this sprint / this quarter / optional. Mapping rule:
  - critical → this week
  - high → this sprint (default), this week if combined with high confidence on a public-facing deployment
  - medium → this sprint
  - low → this quarter
  - info → optional
  - review_required → priority of its `severity_would_be` (with a footnote: "if Perl review confirms, pull forward")

Rationale for keeping this in a flat table rather than grouped by priority bucket: the table is sortable, the priority column is filterable, and the reader can re-sort by effort or severity in their head. Grouping into buckets adds visual hierarchy at the cost of operational flexibility.

---

## Hardening Index — formula

Base score: **100**.

### Severity weights

| Severity | Weight |
|---|---|
| Critical | 20 |
| High | 10 |
| Medium | 6 |
| Low | 3 |
| Info | 0 |

### Multipliers

| Kind | Multiplier |
|---|---|
| `vulnerability` | 1.0 |
| `review_required` | 0.5 (applied to `severity_would_be` weight) |

### Flat penalties

Applied **once** per condition that triggers, regardless of finding count:

| Condition | Penalty |
|---|---|
| `count(kind=review_required) > 1` AND deployment is public-facing per intake | −3 |
| Engine ran without intake answers (batch mode, no deployment context) | −0 (no penalty, but report header carries advisory) |

(A previous draft included a flat penalty for `judge_dissented` rates above 30%. It was removed because it contradicts the principle in `15_CONFIDENCE_AND_VERIFICATION.md` § "Failure modes" — actively acting on judge-disagreement rates is rule-quality telemetry, deferred to a future `30_RULE_CALIBRATION.md`. The dissent count is still recorded in `Appendix D — Engine Diagnostics` so reviewers can spot the issue manually.)

### Computation

```
final = clamp(100 - sum(deductions) - sum(flat_penalties), 0, 100)
```

### Worked examples

These are the indices in the three golden reports, with the formula applied:

**`golden_clean_l1`** (no findings, 3 informationals): 100 − 0 − 0 = **100** (informationals don't deduct). The golden shows 98 instead because the report writer included a 2-point informational adjustment for L2-baseline alignment opportunities. **This is non-spec and should be removed in the next regeneration** — see "Open issues" below.

**`golden_vulnerable_mixed`** (2 critical, 3 high, 2 medium, 2 low, 1 info): 100 − (2×20 + 3×10 + 2×6 + 2×3 + 0) − 0 = 100 − 88 = 12. The golden shows 22 — discrepancy is because the report writer used different severity weights. **The golden needs a re-render against this spec.**

**`golden_tricky_abstention`** (1 high, 1 medium, 1 info, 2 review_required at high): 100 − (10 + 6 + 0) − (2 × 10 × 0.5) − 3 = 100 − 16 − 10 − 3 = **71**. Matches the golden. ✓

**Open issues from worked examples:** the goldens were authored before this spec was locked. After authoring `13_RULE_AUTHORING.md`, run a regeneration pass on the three goldens to make them spec-compliant. The deltas (clean: 100 not 98; vulnerable: 12 not 22) are the spec's call.

---

## Appendix A — SARIF 2.1.0 Output

The full SARIF MUST be embedded in the report as a fenced JSON block, OR an excerpt MUST be embedded with a path to the full file recorded in the engine output directory. The excerpt approach is acceptable for very long reports (>20 findings) but the full SARIF must always be available as a sibling artifact.

The SARIF block must contain at minimum:
- `$schema` and `version`
- `runs[0].tool.driver` with name, version, and rule definitions for every rule that fired
- `runs[0].invocations` with start/end timestamps and `executionSuccessful`
- `runs[0].artifacts` with the analyzed cfg's URI and length
- `runs[0].results` (one per emitted finding)
- `runs[0].properties["opensips-advisor/*"]` namespace for our custom fields

See `11_DATA_MODEL.md` § "SARIF mapping" for the field-by-field translation.

---

## Appendix B — Suppressions & Deferred

For each `SuppressionRecord` in `RunResult.suppressions_applied`, render:

```markdown
### <rule_id> at `<location_glob>`

- **Justification:** <prose>
- **Approver:** <approver or "—">
- **Expires:** <date or "never">
- **Source:** <in_cfg_pragma | yaml_file>
- **Hash check:** <pass | FAIL — cfg has drifted under suppression>
```

If `hash_match_at_run_time == false`, render the entry with a `**WARNING**` prefix. Drift under a suppression is a security concern: the cfg may have changed in a way that invalidates the original justification.

If `suppressions_applied` is empty, render: `_No active suppressions._`

The suppression syntax (in-cfg pragma and YAML file format) is defined in `23_SUPPRESSION_PROTOCOL.md`. This appendix is the reader's view; that doc is the authoring spec.

---

## Appendix C — Informational Observations

Conditional. Rendered only when `RunResult.informationals.length > 0`.

Each informational follows the same per-finding template as a `kind: vulnerability` finding, with these mandatory differences:
- No "Recommendation" header — replace with **"Observation"** (informationals describe state, not failures).
- No "Suppressible" line.
- No CVSS / CWE / OWASP / MITRE fields (or render as `—` if the rule supplies them anyway).
- The header line includes `[<module_family>, info]` to flag visually.

Informationals do not contribute to the hardening index.

---

## Appendix D — Engine Diagnostics

Required content:

1. **Phase timing table** — wall time per phase from `RunResult.diagnostics.phase_timings_ms`, plus a total row.
2. **Rules executed / skipped** — total counts and reason breakdown.
3. **Verification status summary** — counts by status from `RunResult.diagnostics.verification_status_counts`.
4. **Dissented findings audit list** — each `judge_dissented` finding rendered as one line: `- <finding_id> (<rule_id>): <one-line judge rationale>`. This is the audit trail; the dissented findings do not appear in Section 4.
5. **Hardening index calculation breakdown** — required when the index < 90 OR when flat penalties were applied. Show the table-form of `HardeningIndexBreakdown` so the reader can audit the score.

The diagnostics section is what makes the report auditable. A reader who disagrees with the score should be able to reconstruct it from this section alone.

---

## Markdown conventions

- **Header levels.** `#` is the report title (one only). `##` is section. `###` is per-finding or subsection. `####` is reserved and unused.
- **Code fence languages.** Use `opensips-cfg` for cfg snippets. Use `json` for SARIF and JSON. Use no language tag for plain logs or fingerprints.
- **Field tables.** Per-finding fields use a 2-column markdown table with `**Bolded**` field names in the left column. Same shape across vulnerability, review_required, and informational findings — the reader develops muscle memory for where to find things.
- **Inline code vs. fences.** Pseudovariables (`$fU`, `$avp(x)`), function names (`avp_db_query`), and short identifiers go in inline code. Multi-line cfg snippets, even 2-line ones, go in a fence.
- **Em-dashes.** Use `—` (em-dash) in narrative prose. Avoid `--`.
- **List style.** Numbered lists for ordered procedures (rationale traces, reviewer checklists). Bullet lists for unordered enumerations (parser_nodes, references). Avoid bullets for prose.

---

## SARIF export rules

The full mapping is in `11_DATA_MODEL.md`. Rules specific to report rendering:

1. The Markdown report's Appendix A must be a *valid SARIF document*, not a paraphrase. Consumers should be able to extract the JSON between the fences and feed it to a SARIF-aware tool.
2. When the report is an excerpt (>20 findings), the excerpt must include at least: schema header, full tool.driver section, and the first 5 results in full. The omitted results section ends with a `// ... N more results, same shape` comment.
3. Custom properties always live under the `opensips-advisor/` namespace prefix to avoid collisions with other tools writing to the same SARIF.

---

## Cross-references

- Severity, confidence, verification_status semantics: `15_CONFIDENCE_AND_VERIFICATION.md`.
- Type definitions for every field referenced above: `11_DATA_MODEL.md`.
- Suppression syntax used in Appendix B: `23_SUPPRESSION_PROTOCOL.md` (not yet authored).
- Hardening index formula: this document is the current home; will move to `24_HARDENING_INDEX.md` when extracted.
- Reference goldens: `50_fixtures/golden_reports/golden_clean_l1.md`, `golden_vulnerable_mixed.md`, `golden_tricky_abstention.md`. Note the worked-examples discrepancies noted above — goldens need a regeneration pass after this spec is approved.
