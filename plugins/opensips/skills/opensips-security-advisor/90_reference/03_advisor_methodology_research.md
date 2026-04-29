# 03 — Advisor Methodology Research

## Status: structured stub

This document is intentionally a stub. The full version — comparative research on SAST methodologies, CIS benchmark frameworks, the SARIF spec, and LLM-as-judge frameworks — is referenced in the architectural docs (`14_DETECTION_ENGINE.md`, `15_CONFIDENCE_AND_VERIFICATION.md`) as the justification for several design choices. Producing it well requires more than a single research pass: it needs comparative evaluation of multiple frameworks against criteria the advisor's design implicitly already chose.

Authoring it as a thinly-grounded full document risks the same problem we just resolved with the master vulnerability reference: confident-sounding prose that can't be verified by anyone reading it. The honest move is to record the section structure here and the design choices that need methodology-grounded justification, then defer the full research to a focused session that can consult the actual source materials.

## Provenance

Authored 2026-04-29 by Chat C v2 as a structured stub. Per project memory, an earlier session's "Phase 5" research is not retrievable; this document supersedes any prior version.

---

## Section index (target structure)

1. **SAST tool landscape** — comparative coverage of commercial and open-source static-analysis tools relevant to the advisor's design.
   - SonarQube (Hotspot review state, SonarQube's review_required-equivalent semantics)
   - Semgrep (rule-as-pattern model, taint propagation features)
   - CodeQL (graph-database model, pros/cons for the OpenSIPS cfg domain)
   - Snyk Code (DeepCode lineage, ML-assisted match)
   - Joern (legacy academic system, code property graphs)
   - **Anchor justification.** The advisor's lightweight-named-matcher choice in `14_DETECTION_ENGINE.md` § "AST query DSL" was made by reference to these systems — Semgrep's pattern simplicity vs. CodeQL's expressivity vs. SonarQube's rule packs. The reasoning lives in head-state; this section needs to write it down.

2. **CIS Benchmark profiling model** — L1/L2 profile distinction in CIS benchmarks for IT system hardening.
   - CIS Controls v8 framework structure
   - L1 vs L2 distinction (broadly applicable safe defaults vs. high-assurance hardening)
   - Profile-override semantics (per-rule deviation tracking)
   - **Anchor justification.** The advisor's L1/L2 profile model in `15_CONFIDENCE_AND_VERIFICATION.md` is borrowed directly from CIS conventions. This section should document the borrowing explicitly so future contributors don't reinvent or accidentally diverge.

3. **SARIF 2.1.0** — the OASIS standard for static-analysis result interchange.
   - Result, run, tool, taxa shape
   - Suppression mechanism (`suppressions[]` with `kind: external`)
   - Custom-property namespacing convention
   - Fingerprint stability semantics
   - **Anchor justification.** The SARIF mapping table in `11_DATA_MODEL.md` § "SARIF mapping" is normative for this advisor. This section grounds the mapping in SARIF spec semantics.

4. **LLM-as-judge frameworks** — how other systems use LLMs to verify or dissent on deterministic findings.
   - IRIS (Iterative Review with Inference for Software, academic system)
   - SAST-Genius (commercial LLM-judge product)
   - SonarQube's "AI Code Assurance" (post-deterministic LLM review)
   - Anthropic's recent guidance on using Claude as judge in security contexts
   - **Anchor justification.** The advisor's `judge_confirmed`/`judge_dissented`/`unchecked` model in `15_CONFIDENCE_AND_VERIFICATION.md` is a synthesis of these frameworks. The Medium-confidence cap and the cannot_determine routing decisions are direct echoes of failure modes documented in IRIS literature. This section makes the lineage explicit.

5. **Confidence-discipline literature** — broader research on when not to assert.
   - SonarQube Hotspot vs Vulnerability distinction
   - The "secure-by-default vs flag-everything" tension in SAST design
   - Operator-trust calibration: Findings That Matter (Microsoft research) and similar
   - **Anchor justification.** The advisor's `kind: review_required` was the most contested design decision; documenting why it exists, against the alternatives, prevents future contributors from removing it for "simplicity."

6. **Comparative table** — the advisor's design choices mapped against each compared system, showing where this advisor diverges and why.

---

## Design choices that need methodology-grounded justification

These are the specific design choices in the architectural docs that this document is supposed to back up. Listed here so a future authoring pass knows exactly what claims need primary-source citations.

| Design choice | Doc citing methodology | What needs grounding |
|---|---|---|
| Lightweight named matchers vs. tree-sitter query language | `14_DETECTION_ENGINE.md` § "AST query DSL — v1.0" | Semgrep vs. CodeQL trade-off literature |
| L1/L2 profile model | `15_CONFIDENCE_AND_VERIFICATION.md` § "Severity" | CIS Benchmark documentation |
| `verification_status` four-value enum | `15_CONFIDENCE_AND_VERIFICATION.md` § "Verification status" | SonarQube Hotspot model + IRIS framework |
| `judge_confirmed` Medium confidence cap by default | `15_CONFIDENCE_AND_VERIFICATION.md` § "Verification status" | LLM-as-judge confidence-inflation research |
| `cannot_determine → judge_dissented` mapping | `14_DETECTION_ENGINE.md` § "Judgment outcomes" | IRIS abstention-protocol literature |
| `review_required` as a first-class kind | `15_CONFIDENCE_AND_VERIFICATION.md` § "Why review_required exists" | SonarQube Hotspot review state |
| Severity-weight values (20/10/6/3/0) | `22_REPORT_TEMPLATES.md` § "Hardening Index — formula" | CVSS 4.0 band-midpoint approximation rationale |
| Anchor-based `.expected.json` schema | `25_FIXTURE_SCHEMA.md` | Test-fixture-stability literature; not strictly methodology research, more a discipline pattern |
| `suppressible: false` for active CVEs | `13_RULE_AUTHORING.md` § "Frontmatter" | Operator-trust-calibration / over-suppression risk literature |

---

## Authoring guidance for the future researcher

When this document is filled in:

1. **Each section should anchor on one or two primary sources**, not a survey-style listing of every tool. The goal is grounding the advisor's design decisions, not producing a comprehensive SAST survey.

2. **Reference inline using the format** `[P5 §N.M — TopicName]` so other docs citing this one have stable section anchors. The earlier brief mentioned "9 placeholders" needing this style; preserve the convention even though the placeholders themselves are out-of-scope for this bundle.

3. **Verify against the original framework docs**, not against secondary writeups. The most consequential claims (e.g., "SonarQube's Hotspot review state caps confidence at Medium") need direct citation to SonarQube's documentation.

4. **Note dissents explicitly.** Where the advisor's design diverges from the compared system, name the divergence and explain it. Designs documented as "we did it this way because ${other system} did" without examination produce brittle conventions.

---

## Cross-references

- Sister reference doc — vulnerability classes the advisor targets: `01_master_vulnerability_reference.md`.
- Sister reference doc — gap analysis vs. published audits: `02_enable_security_gap_analysis.md`.
- Architectural docs that cite this document: `14_DETECTION_ENGINE.md`, `15_CONFIDENCE_AND_VERIFICATION.md`, `13_RULE_AUTHORING.md`, `22_REPORT_TEMPLATES.md`. None of those docs cite specific section anchors here yet — the citation sweep that the original brief described would normally land them, but that sweep is N/A in this bundle's scope (Chat A's docs don't exist in our context).
