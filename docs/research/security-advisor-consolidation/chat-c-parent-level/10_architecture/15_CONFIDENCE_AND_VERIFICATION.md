# 15_CONFIDENCE_AND_VERIFICATION

## Purpose

Defines two orthogonal axes the advisor uses to characterize every finding — severity (technical impact) and confidence (the engine's belief in the finding) — plus the verification-status flag and the abstention model that lets the advisor say "I don't know" honestly.

This document is load-bearing. The vocabulary defined here is used in `13_RULE_AUTHORING.md` (rule frontmatter), `22_REPORT_TEMPLATES.md` (output rendering), `24_HARDENING_INDEX.md` (scoring), and the per-finding fields on every emitted result.

---

## The two axes

### Severity — *how bad would it be*

The technical impact assuming the finding is correctly identified. Set by the rule definition (with optional profile overrides). Severity does not change as the engine gains or loses confidence in the finding.

| Severity | CVSS 4.0 base | Operational meaning |
|---|---|---|
| **Critical** | ≥ 9.0 | Unauthenticated remote compromise, complete service takeover, or active CVE in the wild |
| **High** | 7.0 – 8.9 | Significant compromise of confidentiality, integrity, or availability under realistic conditions |
| **Medium** | 4.0 – 6.9 | Material risk under specific conditions; not end-to-end exploitable without additional weaknesses |
| **Low** | 0.1 – 3.9 | Information disclosure, hardening miss, or audit failure with limited direct exploit path |
| **Info** | n/a | Hardening opportunity or governance note; does not deduct from hardening index |

Severity drives **fix priority**.

### Confidence — *how sure are we*

The engine's belief that the finding is correctly identified. Distinct from severity.

| Confidence | Meaning |
|---|---|
| **High** | The pattern matched deterministically and there is no plausible benign reading of the surrounding cfg. |
| **Medium** | Either (a) the pattern matched but a benign reading exists and the semantic-pass judge weighed and rejected it, or (b) the rule's deterministic match has a known false-positive class but this instance does not exhibit it. |
| **Low** | The advisor cannot distinguish vulnerable from sound. Used only with `verification_status: unchecked` and `kind: review_required`. |

Confidence drives **consumer certainty**.

A High-severity Low-confidence finding warrants investigation but not immediate remediation. A Low-severity High-confidence finding is a real bug that just isn't urgent.

---

## Verification status

Per-finding flag describing **how the engine arrived at the result**. Mandatory on every emitted finding.

| Status | Definition |
|---|---|
| `deterministic_confirmed` | The structural / value-pattern / dataflow rule fired and no LLM judge pass was needed. The strongest signal. |
| `judge_confirmed` | A deterministic match existed but had a known false-positive class. The semantic-pass judge re-read the surrounding cfg and confirmed the match. Confidence is capped at **Medium** by default — see opt-out below. |
| `judge_dissented` | A deterministic match existed but the semantic-pass judge did not produce an actionable confirmation — either it identified a sound benign reading (FP class applies), it could not characterize the match (`cannot_determine`), or the judge invocation itself failed. In all three cases **the finding is auto-suppressed** but recorded in engine diagnostics with a rationale string distinguishing the cause. See `14_DETECTION_ENGINE.md` § "Judgment outcomes" for the routing details. |
| `unchecked` | The advisor could not characterize the finding either way. Always paired with `kind: review_required`. |

The default cap on `judge_confirmed` confidence is a discipline mechanism: an LLM affirming a deterministic match is weaker evidence than a pure deterministic match because the LLM had the option to dissent and chose not to. However, this can systematically under-confidence findings in rule families whose semantic pass exists only to rule out a single, narrowly enumerated FP class — there, the judge isn't *weighing evidence*, it's *checking whether one specific exception applies*. Rules can opt out of the cap by declaring `judge_confirmed_can_be_high: true` in their frontmatter, which requires the rule to also declare a fully enumerated `fp_classes:` list. Default behavior remains the cap.

---

## Two kinds of finding

### `kind: vulnerability`

The default. The advisor asserts a vulnerability exists with the stated severity and confidence. Used for `deterministic_confirmed` and `judge_confirmed` outcomes.

### `kind: review_required`

The advisor surfaces a candidate but **does not assert**. Used when all three conditions hold:

1. A deterministic shape would normally fire a rule, AND
2. The path between source and sink (or input and decision) traverses a function the advisor cannot statically reason about — typically a Perl handler, a Python script, an external HTTP/RADIUS service, or a custom transformation, AND
3. The semantic-pass judge declines to characterize the unknown function as sound or unsound on the available evidence.

The emitted finding carries these fields instead of (or in addition to) the standard set:

- `severity_would_be` instead of `severity` — what the severity would resolve to if the abstention is later confirmed
- `confidence: low`
- `verification_status: unchecked`
- `review_reason` — short keyword identifying why the advisor abstained (`perl_sanitizer`, `external_authz_service`, `custom_transform`, etc.)
- `opaque_function` — the named function or service the advisor pointed at

---

## Why `review_required` exists

A static advisor that hits external code has three options:

1. **Pass silently** — false negative on the entire family of "real vulnerability hidden behind opaque transformation."
2. **Fire as confirmed vulnerability** — false positive on every cfg that uses external code for legitimate purposes.
3. **Abstain explicitly** — surface the candidate, name the unknown, force a human decision.

Options 1 and 2 are both confidence-discipline failures: the advisor asserts more than it knows. Option 3 is the only honest answer.

This is intentionally modeled on SonarQube's Hotspot review state and IRIS/SAST-Genius's pre-emission verification pass: not a finding, not a pass, a decision the human must make.

---

## The four outcomes a rule can produce

| Engine outcome | Confidence | Verification status | Kind | Hardening index |
|---|---|---|---|---|
| Deterministic match, no judge needed | High | `deterministic_confirmed` | `vulnerability` | Full weight |
| Deterministic match, judge confirmed | Medium (or High, rule opt-in) | `judge_confirmed` | `vulnerability` | Full weight |
| Deterministic match, judge dissented | n/a | `judge_dissented` | (suppressed) | Not counted; recorded in diagnostics |
| Deterministic shape, opaque path, judge abstained | Low | `unchecked` | `review_required` | Half weight (see `24_HARDENING_INDEX.md`) |

---

## Promotion and demotion

The triage layer is permitted to:
- **Demote confidence** (e.g., `judge_confirmed` Medium → Low) when the semantic pass identifies partial mitigation that doesn't fully refute the finding.
- **Re-classify a finding from `review_required` to `vulnerability`** *only* when a follow-up annotation in the cfg or `.opensips-advisor/` directory provides ground truth (e.g., the operator marks the Perl sanitizer as known-bad), and the engine re-runs.

The triage layer is **not** permitted to:
- Promote a `review_required` to a `vulnerability` autonomously, even if the LLM judge believes the opaque function is unsound. The whole point of `review_required` is to keep that decision in the human's hands.
- Promote `judge_confirmed` past the rule's declared confidence ceiling.

---

## Failure modes this protocol prevents

- **Confidence inflation** — the LLM judge promotes ambiguous patterns to High because they sound dangerous in prose. Mitigated by: confidence is bounded by verification_status (`judge_confirmed` caps at Medium by default; opt-out requires enumerated `fp_classes:`).
- **Silent abstention** — the engine drops findings it cannot reason about without telling the user. Mitigated by: `review_required` is a first-class output that surfaces in the report, the SARIF, and the hardening index.
- **Abstention laundering** — using `review_required` to avoid taking responsibility for findings the engine *could* characterize. Mitigated by: `review_required` requires a named opaque function or external resource. It cannot be used for plain ambiguity within OpenSIPS-script-layer code.
- **Judge tail-wagging** — the LLM judge effectively becomes the rule by routinely overriding deterministic matches. The protocol makes this *detectable* by recording `judge_confirmed` and `judge_dissented` distinctly. Actively monitoring drift rates per rule family and acting on the calibration signal is out of scope for this doc — it belongs to future rule-quality work (e.g., a `30_RULE_CALIBRATION.md` not yet authored).

---

## Authoring guidance for rule writers

When writing a rule, decide upfront:

1. **Will this rule ever need a semantic pass?** If yes, document the false-positive class in the rule frontmatter (`fp_classes:`) and write the judge prompt that addresses it. See `13_RULE_AUTHORING.md`.
2. **What opaque-function categories should trigger `review_required`?** List them in the rule's `abstain_on:` field (e.g., `abstain_on: [perl_exec_simple, python_exec, http_query]`). The dataflow pass uses this list to short-circuit deterministic firing when the path traverses a listed sink.
3. **What is the would-be severity if the abstention is later resolved as confirmed?** Set `severity_would_be` so the report can show "(would be: high)" alongside the abstention.
4. **Is the finding suppressible?** Some findings (active-exploit CVEs, plaintext credentials in production-shaped configs) carry `suppressible: false` so a misjustified suppression cannot silence them.
5. **Should `judge_confirmed` carry High confidence for this rule?** Default is Medium. To opt out, declare `judge_confirmed_can_be_high: true` AND ensure `fp_classes:` enumerates every benign reading the judge will weigh. The opt-in is auditable: rule reviewers should reject the opt-in if the FP classes are open-ended ("if the cfg looks fine") rather than narrow ("if `permissions` module is loaded with `allow_routing()` reachable from the t_relay site").

---

## Cross-references

- `verification_status` is emitted in SARIF as `properties["opensips-advisor/verification_status"]`; full SARIF mapping in `22_REPORT_TEMPLATES.md`.
- Hardening-index treatment of `review_required` is defined in `24_HARDENING_INDEX.md` (half-weight + flat penalty under specific conditions).
- Auto-suppression of `judge_dissented` findings — including the audit record — is defined in `23_SUPPRESSION_PROTOCOL.md`.
- Test fixtures exercising each verification status: `50_fixtures/vulnerable/vulnerable-mixed.cfg` (deterministic_confirmed + judge_confirmed) and `50_fixtures/tricky/custom-sanitizer.cfg` (unchecked + review_required).
