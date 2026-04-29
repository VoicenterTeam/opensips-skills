# Review Workflow

This document is the procedural spine of the security-advisor skill. It defines the ordered steps Claude takes between receiving a cfg and rendering a finished report: intake, identifier sanity-check, rule application, triage, suppression, and report rendering. Every other reference doc in this skill plugs into one of those steps.

## Before You Start

Three contracts hold for the entire run:

- **Read-only.** This skill never modifies the cfg and never writes to disk outside the report.
- **Markdown-only output.** One Markdown report. No JSON sidecar, no SARIF.
- **No external tooling.** Claude is the analysis engine. Every claim comes from Claude reading the cfg, the reference data, and this skill's rule files.

## Step 1: Intake

Ask up to five questions before analysis. Skip any the user already volunteered. Combine visually where it shortens the exchange, but elicit all five.

**Q1 — OpenSIPs version.** If the cfg starts with `#!OPENSIPS_VERSION 3.6` (or similar), use that and skip. Otherwise ask which of `3.4`, `3.5`, `3.6`, or `4.0` applies. If the user does not know, infer from syntactic signals and announce the inference. Version-specific findings are downgraded one confidence level when the version is inferred rather than declared.

**Q2 — Deployment profile.** Two profiles: `L1` (internal-facing — enterprise PBX, lab, behind-an-SBC) and `L2` (public-facing — carrier edge, Internet-terminating). Profile gates which rules apply.

**Q3 — Scope of review.** Full audit, or a specific concern (e.g., "only the auth path"). A scoped review still runs identifier sanity-check across the whole cfg but limits rule application.

**Q4 — Known suppressions.** Whether the user wants to declare exceptions up front: by rule ID, by location, or by family.

**Q5 — Compensating controls outside the cfg.** Anything the cfg does not show: upstream WAF, isolated management VLAN, regulator-mandated edge filter. These do not silently mute findings, but may convert a vulnerability to `review_required`.

If the cfg references Kamailio-only directives (e.g., `secfilter`), pause and confirm engine identity. The run proceeds as OpenSIPs analysis only — sibling SER-lineage projects are out of scope per ADR-008.

## Step 2: Identifier Sanity-Check

Before applying any rule, confirm every identifier in the cfg is documented for the active version.

1. Read `../opensips-config/references/{version}/consolidated.json` and `../opensips-config/references/{version}/modules-index.md`.
2. For every `loadmodule`, route function call, `modparam(...)`, pseudo-variable, and MI command, look it up in the consolidated index.
3. Anything not found, flag as `review_required` with reasoning (e.g., "identifier `secfilter` is not documented for OpenSIPs {version}. It is a Kamailio module — see `knowledge/ser-lineage-notes.md`.").
4. Cross-reference `knowledge/ser-lineage-notes.md` for any identifier that looks SER-lineage-adjacent but is absent from the OpenSIPs reference set.

A finding emitted against an unknown identifier is meaningless; surfacing the unknown is more useful than guessing.

## Step 3: Apply Rules

For each rule family in `rules/` (twelve folders — see `taxonomy.md` §Family Codes):

1. Read each rule file.
2. Evaluate the rule's frontmatter against the session intake:
   - `applies_if_opensips_version` — drop the rule if the active version is outside the range.
   - `applies_if_modules_loaded` — drop the rule if a required module is not loaded.
   - `profile` — drop the rule if the active profile is not in the list.
3. Run the rule's `## Audit` logic against the cfg.
4. For any rule with `phase: dataflow` or any injection-class rule, use `taint-model.md` to trace SIP-derived data from sources to sinks.
5. Each firing produces a draft finding. Severity, family, and confidence baseline come from the rule's frontmatter; per-instance fields (location, cited construct, version-specific remediation) come from the cfg.

## Step 4: Triage

1. **Deduplicate.** Two draft findings on the same construct from the same rule collapse into one. The collapsed finding inherits the union of locations and the maximum severity.
2. **Score severity.** Lifted from rule frontmatter. The five-level ladder is in `taxonomy.md`.
3. **Score confidence.** Per `## Confidence Tiers` below. Inferred version downgrades one level; multiple corroborating signals across rules upgrades one level (capped at high); a sanitizer not in `knowledge/sanitizer-registry.md` downgrades one level.
4. **Apply the floor rule.** If a finding's confidence is `low` after adjustment, downgrade `kind` to `review_required` and capture the reason.

## Step 5: Apply Suppressions

For every finding, check intake-declared suppressions: by rule ID, by code location, or by entire family. Honored verbatim, recorded in the report's `Suppressions Applied` section with the user's stated reason. Suppressions never silently mute — they are always cited.

A finding with no suppression entry is emitted normally. A `review_required` finding is not suppressible — abstentions are resolved by the user adding context, not by hiding them. A rule with `suppressible: false` ignores suppression entries; the attempt is logged but the finding still fires.

## Step 6: Render the Report

The report is a single Markdown document. The byte-precise structure — title block, executive summary, findings ordered by severity, suppressions applied, intake answers, abstentions and reasons — is specified in `output-format.md`. Render once at end of run.

Follow-up questions after delivery are answered from the report and session context. If a question requires a re-run (e.g., "what would change at L2?"), announce the scope and produce a new report; never edit the existing one in place.

## Confidence Tiers

- **High.** Multiple corroborating signals from independent rules, or a canonical pattern the rule documents as unambiguous (e.g., `verify_cert=0` literally set in `tls_mgm` modparam).
- **Medium.** One signal, no contradicting evidence. The rule fires and the cited construct matches the `## Audit` logic, but corroborating evidence is absent.
- **Low.** One signal in a context that often produces false positives. Downgraded to `review_required` rather than emitted as a vulnerability.
- **Abstain.** Claude cannot determine whether the finding applies. Emit as `review_required` with `review_reason: insufficient_information` (or a more specific reason).

The conversion from low to `review_required` is normative. A low-confidence vulnerability claim is a contested assertion; a question is more honest and more actionable.

## Version-Gating Mechanism

Rule frontmatter accepts an optional `applies_if_opensips_version` field. The value is a semver-like expression:

- `>=3.4` — applies to 3.4, 3.5, 3.6, 4.0.
- `>=3.4 <4.0` — applies to 3.4, 3.5, 3.6 only.
- `=3.6` — applies only to 3.6.
- field absent — applies to all supported versions.

The active version is resolved at intake. Rules whose range does not include the active version are silently skipped.

`applies_if_modules_loaded` is the preferred gate when the test is "this module is loaded" rather than "this version is in use." A rule about `tls_mgm` should gate on `applies_if_modules_loaded: [tls_mgm]`, not on a version range. When both fields are present, both must hold (logical AND).

## Suppression Mechanics

Three granularities, in increasing specificity:

1. **By family.** "Suppress all `MI` findings."
2. **By rule ID.** "Suppress `OSIPS-SEC-TLS-002`." Honored for all locations the rule fires.
3. **By rule + location.** "Suppress `OSIPS-SEC-TLS-002` at line 247 only."

Each suppression is recorded with rule ID, location (where applicable), source (intake-declared), reason text. Suppressions are immediate-effective — no time-windowed suppression in v1.

A rule with `suppressible: false` (active-exploit CVEs, well-documented critical-impact patterns) ignores suppression entries; the attempt is logged but the finding still fires. `review_required` findings are not suppressible — they are resolved by adding context, not hidden.

## When to Abstain

Abstention — emitting `review_required` instead of a vulnerability finding — is correct in these cases:

- **Missing version info.** The user declined to declare a version and syntactic signals do not narrow it.
- **Identifier not in the active version's reference set.** The cfg references a function or module the consolidated index does not document.
- **Rule preconditions partially met.** The `## Audit` requires three signals; only two are present. The third may be in an `include_file` Claude cannot read.
- **Contradiction between two rules.** Two rules fire with different verdicts on the same line. Both flagged `review_required` with cross-references.
- **Sanitizer not in the registry.** A dataflow path passes through a custom function (Perl, Lua, a wrapper) that `knowledge/sanitizer-registry.md` does not list.

Abstention is not a substitute for analysis. The advisor does not abstain to avoid alarming the user, to hedge on a clear high-severity finding, or to soften an unambiguous CVE match. Abstention is reserved for genuine uncertainty.
