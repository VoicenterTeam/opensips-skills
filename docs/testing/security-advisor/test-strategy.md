# Test Strategy — opensips-security-advisor

This document describes how the `opensips-security-advisor` skill is validated for v1. It is the contract between the skill's authors and anyone who needs to confirm that a change has not regressed the skill's behavior.

## Validation Approach

The skill is read-only Markdown plus reference data. It runs inside Claude Code and its only "execution" is the model's loading and reasoning over those files. There is no automated test harness in v1 — there is no engine binary to invoke, no parser to assert against, no SARIF emitter to diff. Validation is therefore **manual, evidence-based, and golden-report-driven**:

1. The reviewer opens this repository in Claude Code.
2. The reviewer points the skill at one of the canonical fixtures in `fixtures/`.
3. The reviewer compares Claude's response to the corresponding golden report in `fixtures/golden-reports/`.
4. The fixtures' `.expected.json` sidecar files declare the security contract — which findings must fire, which must not, where, and with what severity and confidence.

This approach is intentional. The skill's value is in faithful, well-cited reasoning over OpenSIPs configurations, and that reasoning is best evaluated by a human reading the model's output. The fixtures and golden reports give the reviewer a fixed reference point so the evaluation is reproducible and reviewable across runs and across contributors.

If a future release adds an engine implementation that consumes the same fixture schema, the fixtures and `.expected.json` files become its automated test suite. The schema is designed for that path.

## Fixture Schema

Every fixture is a pair of files sharing a base name:

- `<name>.cfg` — the OpenSIPs configuration under review. This is the input the skill operates on.
- `<name>.expected.json` — the anchored expectations for that cfg. This is the security contract.

`.expected.json` carries:

- `fixture` — the bare cfg filename, for cross-checks.
- `expected_opensips_version` — the OpenSIPs version the cfg targets (e.g., `3.5.4`, `3.6.2`).
- `expected_profile` — `L1`, `L2`, or `custom`.
- `expected_findings` — the ordered list of findings the skill must produce. Each entry carries a `rule_id`, an `approximate_location` with an anchor substring and `tolerance_lines` (acceptable line-number drift), a `severity` or `severity_would_be`, a `confidence`, a `verification_status`, and a `kind` of either `vulnerability` or `review_required`.
- `must_not_fire` — rule IDs that must produce zero findings on this cfg. Firing any of them is a false positive and a regression.
- `must_not_fire_as_vulnerability` — rule IDs that may surface only as `review_required`, never as confirmed `vulnerability`. Used by tricky fixtures with opaque transformations where silent-pass and confirmed-vuln are both regressions.
- `validation_notes` — free-text notes for the human reviewer explaining the contract's nuances.

Locations are anchor-based, not line-based. The reviewer searches the cfg for the anchor substring; the matched finding's reported line range must overlap with the anchor's line ± `tolerance_lines`. This decouples fixture validation from cosmetic line-number drift caused by formatting changes, comment edits, or reordering of unrelated cfg sections. A `tolerance_lines: -1` means the finding has no meaningful line location (typical for "module not loaded anywhere" findings); use the special anchor `module_load_section` for that case.

The full schema, including content assertions like `must_cite_cve`, `must_identify_taint_source`, `must_identify_sink`, and `must_trace_dataflow_through`, is mirrored from the runtime documentation harvested into `references/`.

## Categories

Fixtures are grouped by what their `.expected.json` asserts about advisor behavior.

### `clean/`

Configurations that should produce **zero vulnerability findings**. Only `info`-class observations may appear, and only when they correspond to `expected_informationals` entries. Any rule listed in `must_not_fire` that fires on a clean fixture is a false-positive regression and a high-priority defect.

The canonical clean fixture is `clean-l1-enterprise-pbx.cfg`: a well-formed L1 enterprise PBX configuration with `mi_http` bound to loopback, `tls_mgm` with `verify_cert=1`, digest auth in front of routing, `pike_check_req()` active, and no SQL-injection sinks. Its golden report is `golden_clean_l1.md`.

### `vulnerable/`

Configurations that exercise **multiple findings across multiple rule families** in a single cfg. These prove that the skill's coverage is broad and that its ranking and reporting hold up under realistic load.

The canonical vulnerable fixture is `vulnerable-mixed.cfg`: a 3.6.2 deployment with auth_jwt in `db_url` mode (CVE-2026-25554 vulnerable), `mi_http` bound to `0.0.0.0`, auth applied after routing, SQL injection in dialplan lookup, TLS verification disabled, plaintext-HA1 storage, no DoS protection, an Authorization-header xlog leak, cleartext database credentials, and a deferred-startup configuration note. Its golden report is `golden_vulnerable_mixed.md`.

### `tricky/`

Edge cases that probe specific behaviors:

- **`commented-bad.cfg`** — the parser must respect comment boundaries; rule triggers in commented lines must not fire.
- **`compensating-control.cfg`** — the `mi_http` non-loopback bind is paired with `mi_http_trusted_clients`; severity stays at the rule-defined level but confidence demotes one notch.
- **`custom-sanitizer.cfg`** — sanitization is delegated to a Perl handler the advisor cannot reason about; INJ-001 and AUTH-002 must surface as `review_required`, never as confirmed vulnerabilities.
- **`dead-code.cfg`** — unreachable routes; v1 contract is to flag findings even in dead code (no path-sensitivity).
- **`false-positive-cvss-gate.cfg`** — same structural pattern as the auth_jwt CVE site, but the deployed version is outside the vulnerable range; the version-gated rule must skip, not fire.
- **`kamailio-dialect.cfg`** — a dialect-confused cfg that loads modules from a sibling SER-lineage project; the engine must report a parse-error or unrecognized-directive finding rather than silently treating the unknowns as valid OpenSIPs modules.
- **`multi-listener.cfg`** — multiple listeners on different transports and addresses; placeholder for future per-listener rules. Should not produce false positives in v1.
- **`nested-includes.cfg`** — `include_file` directives the engine cannot resolve; the user must be told.
- **`partially-mitigated-sqli.cfg`** — two SQL-sink sites in the same cfg, one sanitized via a recognized transformation and one not; the unsanitized site must fire, the sanitized site must not.
- **`permissions-allow-routing.cfg`** — `t_relay()` reachable through a guard that the structural matcher misses but that the semantic phase recognizes; must surface as `judge_dissented`, not as a confirmed finding.
- **`version-mismatch.cfg`** — the cfg loads modules introduced in 3.6 while declaring 3.4; signature evidence must override the declared version.

The canonical tricky fixture is `custom-sanitizer.cfg`. Its golden report is `golden_tricky_abstention.md`.

## Golden Reports

The `golden-reports/` directory contains three Markdown narratives showing the human-readable output the skill should produce on each canonical fixture:

- `golden_clean_l1.md` — corresponds to `clean/clean-l1-enterprise-pbx.cfg`.
- `golden_vulnerable_mixed.md` — corresponds to `vulnerable/vulnerable-mixed.cfg`.
- `golden_tricky_abstention.md` — corresponds to `tricky/custom-sanitizer.cfg`.

Each golden report is a full advisor-output sample: the executive summary, methodology and scope, per-finding sections with rationale and remediation, a SARIF excerpt in an appendix, suppression notes, and engine diagnostics. The phrasing is illustrative — Claude's exact wording will vary run-to-run — but the **structure**, the **set of cited rule IDs**, the **severity ranking**, and the **citations** are the contract.

Updates to the report template require re-rendering each golden against the new template. Treat goldens as canonical artifacts: they are reviewed in PRs, not regenerated on every change.

## Smoke-Test Procedure (manual)

Run this procedure before every release and after any change to the skill, the fixtures, or the rule files. The procedure is the regression test for v1.

1. From the repo root, launch Claude Code with the plugin attached:

   ```bash
   claude --plugin-dir ./plugins/opensips
   ```

2. In the session, list the active skills and confirm both expected entries appear:

   ```
   /skills
   ```

   Both `opensips-config` and `opensips-security-advisor` must be listed.

3. Run the canonical vulnerable-mixed prompt in the session, pasting the cfg contents inline:

   ```
   Review this opensips.cfg for security issues:

   [paste contents of fixtures/vulnerable/vulnerable-mixed.cfg]

   Target version 3.6, profile L2.
   ```

4. Confirm the response triggers the security-advisor skill (not the config skill or the model's untriggered priors), runs intake (or accepts the inline answers without re-asking), reads the appropriate rule files, and produces a Markdown report.

5. Compare the report to `golden-reports/golden_vulnerable_mixed.md`:

   - The set of cited finding IDs (matched by `rule_id`) should match the golden's set.
   - The severity ranking should match (a Critical in the golden must not be a High in the run, and vice versa).
   - Each finding should cite the same source documents the golden cites.
   - Phrasing may differ. Re-ordering within the same severity tier is acceptable.

Repeat steps 3–5 with the clean fixture and the tricky fixture, comparing against `golden_clean_l1.md` and `golden_tricky_abstention.md` respectively.

## What Counts as a Regression

A regression on this skill is any of:

- **Adding a finding the golden does not have.** A new false positive on a clean fixture; a new finding on a vulnerable fixture that the contract did not anticipate; a finding on a tricky fixture that contradicts a `must_not_fire` or `must_not_fire_as_vulnerability` declaration.
- **Removing a finding the golden has.** A vulnerability the skill previously caught and now silently passes.
- **Downgrading severity.** A Critical that becomes a High; a High that becomes a Medium; a confirmed vulnerability that becomes a `review_required` without justification.
- **Removing a citation.** A finding that previously pointed at a specific rule file, CVE, or sanitizer-registry entry and now stands without grounding.

A regression is **not**:

- Phrasing differences in the report body. Claude's wording will vary; the contract is on structure and citations, not prose.
- Re-ordering of findings within the same severity tier.
- Different example remediation text, as long as the cited remediation matches the rule's authored guidance.
- Variations in the SARIF excerpt's run ID, timestamp, or wall-time figures.

When a regression is detected, the fix is to (a) restore the missing or downgraded finding by editing the rule, the reference data, or the SKILL.md routing instructions; or (b) update the golden report and the corresponding `.expected.json` if the change is intentional and the new behavior is preferred. The latter requires reviewer sign-off on the golden update before merge.
