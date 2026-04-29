# OpenSIPS Security Advisor — Confidence and Verification

**Status.** Locked as of Phase 6a.

This document defines the advisor's discipline around uncertainty:
when a finding is emitted with what confidence, when the advisor
must run a verification pass before emission, and when the advisor
must abstain entirely. Together these mechanisms keep the
advisor's false-positive rate bounded and its output defensible
under audit.

The mechanisms documented here are mandatory contracts for the
detection engine (`10_SKILL_STACK.md` §Layer 5) and the triage
layer (§Layer 6). They are not advisory. A finding emitted in
violation of them is a validation failure (`11_FINDING_SCHEMA.md`).

The shape of the verification protocol — second-pass LLM critique
followed by a confidence-aware emission decision — is informed by
methodology research on LLM-augmented SAST, specifically the
IRIS and SAST-Genius patterns where LLM judgment without a
critique step produces unbounded false-positive rates
[P5 §TBD — "verification protocols for LLM-emitted findings"]. The
discipline is also informed by SonarQube's review_required state
and Corgea's PolicyIQ verification flow
[P5 §TBD — "abstention as a first-class output in commercial
SAST"].

---

## The two dimensions

The advisor reasons about every finding along two independent
dimensions:

- **Severity** — *if this finding is real, how bad is it?*
- **Confidence** — *how sure are we this finding is real?*

Both are mandatory on every finding. Both are emitted as
separate fields per `11_FINDING_SCHEMA.md`. The report layer
surfaces both. The SARIF output carries both. CI gates may key
on either.

The independence is normative. A high-severity / low-confidence
finding is *not* the same artifact as a high-severity /
high-confidence finding, and the engine, triage, and reporting
layers must not collapse them. Specifically:

- The engine does not downgrade severity to compensate for low
  confidence.
- The engine does not raise confidence to make a high-severity
  finding feel more authoritative.
- The report does not hide low-confidence high-severity findings
  to avoid alarming the user.

The full definitions of the severity and confidence enums are in
`02_GLOSSARY.md` §3. This document concerns confidence and what
to do about it.

---

## Confidence assignment

Every rule declares a default confidence in its frontmatter
(`12_RULE_CATALOG_SCHEMA.md`). The default is what the rule emits
when it fires under nominal conditions — full evidence, no
ambiguity, all signals aligned.

Confidence is *adjusted* during execution by signals the engine
observes. The adjustment rules are:

### Signals that lower confidence

A finding's confidence is downgraded one level (high → medium,
medium → low, low → low) for each of the following signals
present at emission:

- **Inferred OpenSIPS version.** The session's version was not
  declared at intake; the advisor inferred it. Per
  `14_VERSION_STRATEGY.md`, version-specific rules downgrade
  one level when version is inferred.
- **Custom sanitizer detected.** The dataflow path passes
  through a function (Perl, Lua, custom AVP transformation,
  module-specific sanitizer) that the rule catalog does not
  recognize. The rule cannot validate adequacy.
- **Partial cfg.** Intake recorded that the user supplied a cfg
  fragment, not the complete cfg. The rule's structural
  assumptions may not hold.
- **Conflicting signals.** Two cfg elements that the rule reads
  as evidence point in opposite directions (e.g., a directive
  is set permissively in one place and overridden restrictively
  in another the engine cannot fully resolve).

### Signals that raise confidence

A finding's confidence is upgraded one level (low → medium,
medium → high) only under the following narrow circumstances:

- **Deterministic confirmation.** A non-LLM check
  (regex, parser query, structural assertion) confirms the
  match. This applies most often to dataflow findings where the
  source-to-sink path has a literal pattern match overlay.
- **Multi-rule corroboration.** A separate rule firing on a
  related cfg element corroborates this finding's preconditions
  (e.g., a TLS-disabled finding plus an MI-HTTP-on-non-loopback
  finding raise each other's confidence — they tell the same
  story from different angles).

Multiple downgrade signals stack additively (two signals = two
levels down). Multiple upgrade signals do not stack — confidence
moves at most one level up per emission, regardless.

### The confidence floor

A rule's emission confidence may not be lower than the rule's
declared confidence floor (the rule's default confidence
minus two levels, bounded at `low`). This prevents a rule with
default `medium` confidence from emitting at sub-`low`
confidence under heavy downgrade pressure — at that point the
finding becomes a `review_required` abstention rather than a
diminished assertion (see "Abstention" below).

---

## The verification state machine

Every finding carries a `verification_status` field
(`11_FINDING_SCHEMA.md`). The values, and the transitions among
them, define the engine's certainty about its own output.

```
                       ┌─────────────────┐
                       │   unchecked     │
                       │ (emitted by 5d) │
                       └────────┬────────┘
                                │
                                ▼
                  ┌─────────────────────────┐
                  │   verification pass     │
                  │   (judge LLM critique)  │
                  └─────────────┬───────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
   ┌───────────────┐  ┌──────────────────┐  ┌─────────────────┐
   │ judge_        │  │ judge_           │  │ deterministic_  │
   │ confirmed     │  │ dissented        │  │ confirmed       │
   │ (emitted)     │  │ (downgrade or    │  │ (emitted, no    │
   │               │  │ convert to       │  │ judge required) │
   │               │  │ review_required) │  │                 │
   └───────────────┘  └──────────────────┘  └─────────────────┘
```

### When verification is mandatory

Verification (the LLM-judge critique pass) is **mandatory** on a
finding that meets either condition:

1. **Phase is `semantic_contextual`** (Layer 5d).
2. **Confidence is `medium` or `low`** at the point of
   emission, regardless of phase.

Verification is **not required** when:

- Phase is `structural` and confidence is `high` (the parsed
  model self-evidences the match).
- Phase is `value_pattern` with a literal match (the regex or
  literal comparison is its own confirmation).

A finding that bypasses required verification is a validation
failure. The advisor will not emit it; the run aborts with an
engine error.

### How the verification pass works

The verification pass runs in Layer 6 (triage). For each finding
flagged as needing verification:

1. The triage layer constructs a *critique prompt* containing:
   - The rule's `Audit` and `Rationale` sections.
   - The finding's `evidence` block (snippet, matched pattern).
   - The finding's `grounding` (parser nodes, references).
   - The finding's draft `rationale_trace`.
   - An explicit instruction to *disagree if disagreement is
     warranted*. The judge is not a rubber stamp.
2. A second LLM call (the *judge*) reads the critique prompt and
   returns one of three verdicts:
   - **`confirmed`** — the finding is real. The judge agrees.
   - **`dissented`** — the finding is not warranted as
     described. The judge identifies why.
   - **`uncertain`** — the judge cannot tell. This is its own
     outcome, distinct from `dissented`.
3. The triage layer applies the verdict:
   - `confirmed` → set `verification_status:
     judge_confirmed`. Emit the finding at its current
     confidence.
   - `dissented` → either downgrade confidence one level and
     re-evaluate, or convert the finding to
     `kind: review_required` with the judge's reasoning
     captured in `review_reason`. The choice is governed by the
     conversion rule below.
   - `uncertain` → convert to `review_required` directly. The
     judge's uncertainty is itself the abstention rationale.

### The dissent-to-abstention conversion rule

When the judge dissents, the triage layer chooses between
*downgrade* and *abstain*:

- **Downgrade** if the finding's current confidence is `high`
  and the judge's dissent is a soft critique (e.g., "this is
  suspicious but I would not call it a vulnerability without
  more evidence"). Drop confidence to `medium`. The finding
  remains a `vulnerability` but with a weaker claim. The
  judge's note is appended to `rationale_trace`.
- **Abstain** if the finding's current confidence is `medium`
  or `low` after downgrade pressure, *or* if the judge's
  dissent is a hard critique (e.g., "I do not see this issue;
  the cfg appears correct"). Convert to `review_required`. The
  judge's reasoning becomes `review_reason`.

The principle: a finding that survives downgrade with a soft
critique is still useful information at lower confidence. A
finding that the judge actively rejects is not — it is a
candidate false positive, and the right action is to surface
the question to the user rather than emit a contested
assertion.

---

## Abstention — `review_required`

Abstention is a first-class output, not a failure mode. The
advisor produces a `review_required` finding when:

1. The judge dissented on a finding whose confidence is already
   `medium` or `low`.
2. The judge returned `uncertain`.
3. The engine itself recognized at emission time that it cannot
   reach a confident conclusion (e.g., the dataflow phase
   detected a custom sanitizer it does not recognize and
   declined to assert adequacy).
4. A precondition for confidence — declared OpenSIPS version,
   complete cfg, recognizable sanitizer set — is missing in a
   way that downgrades the finding below the rule's confidence
   floor.

Every `review_required` finding carries:

- `kind: review_required` (per `11_FINDING_SCHEMA.md`).
- A non-empty `review_reason` string explaining the abstention.
- A `recommendation` framed as a question or call-to-review,
  not as an assertion. ("Confirm whether `perl_func("sanitize",
  ...)` adequately escapes SQL metacharacters" — not "Replace
  with `s.escape.common`.")
- All of the LLM-specific fields (`grounding`,
  `rationale_trace`) so the user can see *what* the advisor saw
  and *why* it could not decide.

### The cost of abstention is not zero

Abstention has audit-visible cost. A `review_required` finding
counts toward the hardening index calculation as a *partial
penalty* per `22_REPORT_TEMPLATES.md`. It appears in the
report's "Items requiring review" section, distinct from
substantive findings. It is included in the SARIF output as
`result.kind: informational`.

The partial penalty exists to prevent overuse: an advisor that
abstains on every difficult call would produce no actionable
findings and would be mathematically perfect on false positives
while being practically useless. The penalty creates back-pressure
toward genuine conclusions where they are warranted.

### When abstention is *not* appropriate

The advisor does not abstain to avoid:

- Politeness. A clear high-severity, high-confidence finding is
  emitted as such, not softened to `review_required` because
  the user might be unhappy.
- Edge cases the rule explicitly addresses. A rule whose
  `False-Positive Considerations` section enumerates a known
  shape and provides guidance must emit the finding (possibly
  at lower confidence) rather than abstain — the rule has
  already done the work of recognizing the shape.
- Rule-author uncertainty. If the rule author was unsure the
  rule should exist at all, the rule should not have been
  authored. Once authored, it fires when its conditions are
  met.

---

## How confidence interacts with severity

The two dimensions are independent (above), but they jointly
inform the report layer's prioritization. The interaction matrix:

|  | High confidence | Medium confidence | Low confidence |
|---|---|---|---|
| **Critical severity** | Top of report; immediate action | Top of report; immediate review | Verification pass mandatory; if survives, top with explicit confidence label |
| **High severity** | Top of report; action this sprint | Mid-report; review and verify | Verification pass mandatory; if survives, mid-report with label |
| **Medium severity** | Mid-report; planned remediation | Mid-report; planned remediation | Verification pass mandatory; often converted to `review_required` |
| **Low severity** | Bottom or hardening section | Bottom or hardening section | Often converted to `review_required` |
| **Info severity** | Hardening section only | Hardening section only | Hardening section only |

The rendering layer consumes this matrix to decide section
placement; the matrix is documented again in
`22_REPORT_TEMPLATES.md` for that purpose.

---

## Audit defensibility

A central property of the advisor is that every finding is
*defensible* — a third-party reviewer can read the finding and
understand why the advisor reached its conclusion. The fields
that support this:

- `evidence` — what the engine actually saw.
- `grounding` — what evidence the LLM consulted.
- `rationale_trace` — the LLM's reasoning chain for this
  specific finding.
- `verification_status` — whether and how a critique pass
  confirmed or dissented.

These four fields together let a reviewer trace a finding from
"the cfg has this" through "the rule says this matters" to
"the LLM concluded this and the judge agreed."

For findings emitted at confidence `medium` or `low`,
`grounding` and `rationale_trace` are mandatory
(`11_FINDING_SCHEMA.md` JSON Schema's conditional `required`).
For findings at `high`, they are recommended. The skew is
deliberate: a high-confidence finding is one the engine is
confident enough to assert without showing its work in detail;
the work is still discoverable in the rule's catalog entry, but
the per-instance trace is not required as a quality gate.

---

## What this means for rule authors

Rule authors do not implement the verification protocol — that is
engine behavior. But authors must *author rules that the
verification protocol can serve*:

1. **Write Audit sections precisely.** The judge reads the
   rule's Audit section to evaluate the finding. Vague Audit
   text produces unreliable judge verdicts.
2. **Set confidence honestly.** A rule whose default confidence
   is `high` must produce findings the engine can defend at
   that level. Inflating defaults to make findings feel
   important is a load-bearing failure mode.
3. **Enumerate False-Positive Considerations.** The judge uses
   the rule's `False-Positive Considerations` section as the
   negative case. Authors who enumerate known false-positive
   shapes shorten the verification path and reduce abstention
   rate.
4. **Choose phase deliberately.** Phase determines whether
   verification is mandatory. Marking a rule
   `phase: structural` when it actually involves dataflow
   bypasses verification — and breaks the abstention
   discipline. The phase enum is normative, not advisory.

---

## Cross-references

- Severity and confidence enum definitions:
  `02_GLOSSARY.md` §3.
- The `verification_status` enum and finding-schema
  conditional requirements:
  `11_FINDING_SCHEMA.md`.
- Rule frontmatter for default confidence and phase:
  `12_RULE_CATALOG_SCHEMA.md`.
- Layer 6 placement of the verification pass:
  `10_SKILL_STACK.md` §Layer 6.
- Hardening index partial penalty for `review_required`:
  `22_REPORT_TEMPLATES.md`.
- Suppression interaction (review_required findings cannot be
  suppressed via the standard suppression mechanism — they
  must be resolved either as suppressed-with-reason or as
  promoted-to-finding by the user):
  `23_SUPPRESSION_PROTOCOL.md`.
