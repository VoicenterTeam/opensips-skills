# OpenSIPS Security Advisor — Suppression Protocol

**Status.** Locked as of Phase 6a.

This document defines how a user tells the advisor "don't fire on
this," and what the advisor does in response. Suppression is the
mechanism that lets the advisor stay strict by default while
remaining usable in real deployments where context the advisor
cannot infer (lab environment, compensating control, accepted
risk) makes a finding inappropriate.

The protocol is shaped around three principles:

1. **Suppressions are user-declared, not advisor-inferred.** The
   advisor never suppresses its own findings on its own
   judgment. A user with deployment context the advisor lacks
   declares a suppression; the advisor honors it.
2. **Suppressions are visible, not silent.** Every suppression
   appears in the report's audit appendix with metadata. A
   reviewer reading the report sees what was hidden and why.
3. **Some findings cannot be suppressed.** Active-exploit CVE
   findings ignore suppression entries. The user can still
   acknowledge them, but cannot make them disappear from the
   primary report.

These principles sit downstream of the charter's "informs and
accelerates the human decisions that secure a SIP deployment,
not to replace them" mission. Suppression is how the human's
judgment enters the loop.

---

## Three mechanisms

The advisor accepts suppression declarations through three
mechanisms. Each has a different shape, a different audience,
and a different audit-trail granularity.

### Mechanism 1 — In-source suppression comments

A comment in the cfg file itself, immediately preceding or
trailing the line being suppressed. Format:

```cfg
# opensips-advisor:suppress OSIPS-SEC-TLS-002 reason="lab; self-signed"
modparam("tls_mgm", "verify_cert", 0)
```

**When to use.** The suppression is inherent to the cfg
itself — the cfg's author knows this directive is intentional
and wants future analyses to skip it. The cfg is the natural
place for that intent.

**Granularity.** Per-line, per-rule. The comment applies only to
findings on the immediately following (or preceding) line, only
for the named rule.

**Grammar.**

```
"# opensips-advisor:suppress" RULE_ID [TS] [REASON_CLAUSE]
RULE_ID         := "OSIPS-SEC-" FAMILY "-" NNN
REASON_CLAUSE   := 'reason="' UTF8_NO_DQUOTE '"'
TS              := "expires=" ISO8601_DATE        # optional
```

A comment without a `reason=` clause is permitted but generates
a hygiene finding (`OSIPS-SEC-CONFIG_HYGIENE-NNN`,
"undocumented suppression"). The advisor allows the suppression
to stand but flags the absence of rationale.

**Multiple rules.** A single line may carry multiple
suppression comments stacked on adjacent lines. The advisor
reads them in order:

```cfg
# opensips-advisor:suppress OSIPS-SEC-TLS-002 reason="lab"
# opensips-advisor:suppress OSIPS-SEC-TLS-005 reason="lab"
modparam("tls_mgm", "verify_cert", 0)
```

### Mechanism 2 — External suppression file

A YAML file at a known path (`.opensips-advisor/suppressions.yaml`
relative to the cfg root, or an explicit path the user provides
at intake). The file is loaded during intake and parsed into the
session context.

**When to use.** Suppressions that span the whole cfg, that the
cfg's author may not own (security team's policy decision), or
that need expiry tracking and review cycles.

**Granularity.** Configurable. Can be per-rule (all findings of
a given rule), per-rule + location (specific findings), or
per-rule + fingerprint (specific finding instances stable
across cfg reformat).

**File schema.**

```yaml
# .opensips-advisor/suppressions.yaml
version: 1

suppresses:
  - rule_id: OSIPS-SEC-TLS-002
    reason: "Lab environment; self-signed certs intentional"
    expires: "2026-09-01"
    # No location → suppress all findings for this rule

  - rule_id: OSIPS-SEC-MI_EXPOSURE-001
    location:
      file: opensips.cfg
      line: 412
    reason: "Internal management network only; no public exposure"
    # Location → suppress only findings at this location

  - fingerprint: 9f2c1a7e5b3d8f4e2a6c9b0e1d5a3f8c7e2b9d1c4a6f8e3b5d7a9c1e4b8f2a6d
    reason: "Accepted risk per change request CR-2026-0411"
    # Fingerprint → suppress this exact finding even if cfg shifts

lifts:
  # Force-include rules that the profile would otherwise exclude
  - rule_id: OSIPS-SEC-TLS-005
    reason: "PCI auditor requires strict TLS even at L1"

severity_overrides:
  # Change a rule's severity for this deployment
  - rule_id: OSIPS-SEC-DOS_DEFENSE-004
    severity: low
    reason: "Upstream WAF handles this layer"
```

**File semver.** The `version: 1` field is the suppression-file
schema version. Changes to the schema bump this number; the
advisor refuses to parse versions newer than it understands.

**Expiry.** A suppression with `expires` past today's date is
ignored — the finding fires normally. The expired suppression
appears in the audit appendix as "expired and not applied."
Suppressions without `expires` never time out.

### Mechanism 3 — Natural-language site policy

A free-form Markdown file (`references/policy/site.md`) that
captures the deployment's security posture in prose. The
advisor reads this file during the verification pass (Layer 6)
and may use its content as evidence when adjudicating soft
critiques.

**When to use.** Context that doesn't fit the rule-id-based
suppression model. "We have an upstream Suricata cluster doing
SIP-aware deep inspection." "All MI traffic is bound to an
isolated VLAN with no public route." Policy statements that
inform the advisor's judgment without being targeted at a
specific rule.

**Granularity.** None — the policy applies to the whole
session.

**Behavior.** The site policy does *not* suppress findings
unilaterally. It provides the judge LLM additional context
during verification. A finding that would fire normally may be
downgraded to `review_required` ("the deployment's site policy
asserts compensating controls; manual review needed to confirm
they're effective") rather than suppressed outright.

**Why a separate mechanism.** Mechanisms 1 and 2 are
deterministic — the advisor honors them mechanically. Mechanism
3 is an input to LLM judgment, not a directive to the engine.
The distinction matters because the audit trail is different:
a Mechanism-1 or 2 suppression is recorded as "applied per
declaration"; a Mechanism-3 outcome is recorded as "the LLM
considered the site policy and concluded X."

---

## Never-suppressible rules

Rules with `suppressible: false` in their frontmatter
(`12_RULE_CATALOG_SCHEMA.md`) ignore suppression declarations
through Mechanisms 1 and 2. Mechanism 3 may still influence the
verification verdict (downgrade to `review_required`), but
cannot remove the finding from the primary report.

The criteria for marking a rule `suppressible: false`:

- **Active-exploit CVE.** A CVE with known active exploitation
  in the wild against OpenSIPS, where the version is in scope
  and the affected module is loaded.
- **Trivial-to-exploit + critical-impact.** A finding whose
  exploit path is publicly documented at trivial complexity
  (e.g., default credentials, well-known auth bypass) and
  whose impact is critical.
- **Security-policy violation that audits would reject.**
  Patterns that compliance frameworks (PCI, SOC2 controls
  family, NIST CSF) explicitly require; suppressing them is
  not a deployment-context choice but a compliance violation.

The decision to mark a rule never-suppressible is made at rule
authoring time and is reviewed during catalog amendment. A user
who believes a never-suppressible rule is firing wrongly on
their deployment must escalate via the rule-amendment process,
not via suppression.

### When the user attempts to suppress a never-suppressible rule

The advisor logs the attempted suppression in Appendix A:

```markdown
| Rule | Location | Source | Reason | Status |
|---|---|---|---|---|
| OSIPS-SEC-AUTH-CVE-2024-XXXX | opensips.cfg:127 | suppressions.yaml | "internal only" | **Not applied — rule is never-suppressible** |
```

The finding still fires. The audit trail captures the user's
attempted suppression and the reason it was rejected.

---

## How suppression interacts with `review_required`

Suppression operates on `kind: vulnerability` findings.
`kind: review_required` findings have a different lifecycle:

- A user does not "suppress" a `review_required` finding —
  they *resolve* it. Resolution means adding context (a comment
  in the cfg, an entry in the suppression file, an update to
  the site policy) that lets the advisor reach a confident
  verdict on a future run.
- A `review_required` finding cited by Mechanism-2 with a
  reason becomes a *deferred review*: it appears in Appendix A
  alongside suppressions, but with `kind: review_deferred`.
  The user has acknowledged the abstention and is choosing to
  proceed without resolution.
- The `expires` field works for deferred reviews too: a
  deferred review with `expires: 2026-09-01` will reappear as
  `review_required` in runs after that date, surfacing the
  question for fresh consideration.

This separation matters because suppressing a vulnerability
finding ("we know about this; ignore it") is a different
posture from deferring a review_required ("we know the advisor
isn't sure; we're choosing to defer the decision").

---

## Audit trail in the report

Every suppression and deferred review appears in Appendix A of
the Markdown report and in `result.suppressions[]` of the SARIF
log. Required metadata per entry:

- Rule ID.
- Location (file + line, where applicable).
- Source mechanism (inline comment / suppressions.yaml /
  inferred via site policy).
- Reason text.
- Expiry, if declared.
- Status: `applied`, `expired`, `not-applied-never-suppressible`,
  or `inferred-deferred-via-policy`.

The audit trail is not optional. A suppression with no audit
record is a bug.

---

## What suppression does *not* do

Three behaviors the suppression protocol explicitly does not
implement:

1. **Site-wide suppression by directive value.** The advisor
   does not support suppressions of the form "suppress every
   `verify_cert: 0` everywhere" detached from a specific rule.
   That kind of decision is a *catalog* decision (revise the
   rule's severity or applicability) — not a suppression.
2. **Time-windowed suppressions ("from X to Y").** Only
   one-sided expiry is supported (`expires` = end date, no start
   date). Suppressions are immediate-effective.
3. **Conditional suppressions ("suppress only if Y also
   true").** Out of scope. A user wanting conditional behavior
   composes multiple individually-scoped suppressions.

These limitations are deliberate. Each unsupported pattern
trades complexity for marginal expressiveness.

---

## Cross-references

- Suppression file fields consumed by Layer 4:
  `13_PROFILE_MODEL.md` (lifts), `14_VERSION_STRATEGY.md`
  (severity overrides).
- The `suppressible` rule frontmatter field:
  `12_RULE_CATALOG_SCHEMA.md`.
- `result.suppressions[]` SARIF mapping:
  `11_FINDING_SCHEMA.md` and `22_REPORT_TEMPLATES.md`.
- Where the audit appendix renders:
  `22_REPORT_TEMPLATES.md` §9, Appendix A.
- The `review_required` lifecycle:
  `15_CONFIDENCE_AND_VERIFICATION.md`.
- Comment indexing during parsing:
  `21_ANALYSIS_PIPELINE.md` Stage 1.
