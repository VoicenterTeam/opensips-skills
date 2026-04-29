# OpenSIPS Security Advisor — Profile Model

**Status.** Locked as of Phase 6a.

This document defines the profile model — the mechanism by which
the advisor adapts its rule set to a deployment's operational
context. Profile selection is one of the five intake answers
(`20_INTAKE_PROTOCOL.md`) and one of the inputs to Layer 4
configuration (`10_SKILL_STACK.md`). It is what makes the same
rule catalog usable for a 50-extension office PBX and a
10-million-subscriber carrier SBC without producing a noisy or
inadequate report in either case.

The profile model follows the CIS Benchmark convention of two
levels: Level 1 broadly applicable with low operational risk,
Level 2 strict and carrier-grade. The advisor's adaptation of this
convention is documented below
[P5 §TBD — "profile-based rule selection in compliance frameworks"].

---

## The two levels

The advisor recognizes two profiles. There is no L0, L3, or
custom level in the catalog; there are only L1 and L2, plus the
override and per-rule disable mechanisms documented later in this
document.

### L1 — Baseline

**Audience.** Enterprise PBXes, mid-size SIP service providers,
internal voice infrastructure, hosted PBX instances, university
deployments, lab environments destined for production.

**Commitment.** Every rule tagged `profile: [L1]` (or
`profile: [L1, L2]`, or no profile field at all) applies. Rules
tagged exclusively `profile: [L2]` do not apply.

**Operational risk.** Findings at L1 represent issues whose
remediation is broadly safe to apply: enabling cert verification,
turning on rate-limiting, fixing absent max-forwards processing,
fixing injection sinks. None of these remediations should
introduce material operational risk for a typical deployment.

**Default answer at intake.** L1. The advisor recommends L1
unless the user explicitly identifies as carrier-grade or
regulated telco.

### L2 — Strict

**Audience.** Carrier SBCs, regulated telcos (CALEA / lawful
intercept obligations), STIR/SHAKEN attestation participants,
high-volume interconnect borders, anti-fraud-sensitive
deployments.

**Commitment.** Every rule that applies under L1 also applies
under L2. In addition, rules tagged `profile: [L2]` apply.

**Operational risk.** Findings at L2 may require coordinated
rollout, version upgrades, peer agreements (e.g., enforcing strict
TLS requires the peer side support strict TLS), or behavior changes
that are beneficial but not always trivially safe. Examples:
strict cipher policy that breaks legacy TDM gateway peers, strict
inbound STIR/SHAKEN attestation that drops un-attested calls,
mandatory dialog tracking that increases memory pressure.

**Default answer at intake.** Never the default. Always selected
explicitly.

---

## How rules declare profile applicability

Rules declare profile applicability through the `profile`
frontmatter field, per `12_RULE_CATALOG_SCHEMA.md`:

```yaml
profile: [L1, L2]   # applies under both profiles
profile: [L1]       # applies under L1 (and therefore also L2 by inclusion)
profile: [L2]       # applies under L2 only — does not fire under L1
# profile: omitted  # applies under both profiles
```

The convention `profile: [L1]` is *equivalent* to no profile field
— L1-applicable rules apply under both profiles by inclusion. The
distinction matters only for `profile: [L2]`, which is the
opt-in-stricter case.

### Why "L1 implies L2" rather than two disjoint sets

A rule that is dangerous under L1 (cert verification, plaintext
passwords) is at least as dangerous under L2. Modeling the levels
as nested rather than disjoint is both simpler and more accurate.
Disjoint level sets lead to gaps: a finding that should "obviously"
apply at carrier scale gets silently dropped because someone
forgot to tag it L2 too. Nested levels make this impossible.

The implementation reads: "if profile=L1, apply rules whose
profile array includes L1 OR is absent. If profile=L2, apply rules
whose profile array is non-empty (or absent) — i.e., everything
except never-applicable rules."

---

## Profile selection at intake

The user selects a profile during intake. The protocol
(`20_INTAKE_PROTOCOL.md`) phrases this as one of the five
questions:

> Which posture does this deployment require?
>
> - **L1 — Baseline.** Suitable for most enterprise and provider
>   deployments. Recommended unless your context demands
>   carrier-grade strictness.
> - **L2 — Strict.** Carrier-grade, regulated telco, or where
>   stricter operational discipline is mandatory.

The intake protocol defaults to L1 if the user's deployment
context (one of the other intake answers) is "enterprise" or
"hosted-pbx" or unspecified. It defaults to L2 only when the user
explicitly identifies as "carrier" or "regulated telco" *and*
selects strict posture.

### Inferred upgrades

The advisor will *not* silently upgrade a user from L1 to L2 based
on cfg shape. If the cfg is a clear carrier SBC (TLS borders,
STIR/SHAKEN modules, dispatcher+load-balancer+rtpengine + custom
peering) and the user selected L1, the advisor surfaces an intake
warning:

> Note — your cfg shape suggests a carrier deployment. You
> selected L1 (baseline). L2 (strict) findings will not be
> reported. Reconsider profile? [Y/n]

The user may proceed with L1; the advisor records the warning in
the report's appendix B.

---

## How Layer 4 applies the profile

Per `10_SKILL_STACK.md` §Layer 4, profile filtering happens after
intake and before detection.

The filter logic, in pseudocode:

```
for each rule R in catalog:
    if R.profile is absent or R.profile is empty:
        # No declaration; rule applies everywhere
        keep R
    elif session.profile == "L1":
        if "L1" in R.profile:
            keep R
        else:
            exclude R   # R is L2-only
    elif session.profile == "L2":
        # Under L2, keep everything that applies under any profile
        keep R
```

Excluded rules are removed from the parameterized rule set passed
to Layer 5. They do not fire. They do not appear in the report.
They are noted in the report's "Methodology" section as part of
the profile gating disclosure.

---

## Per-rule overrides

Profile is a coarse lever. The advisor supports two finer levers
for cases where the coarse choice is wrong for a specific rule.

### Override 1 — Lift a rule to apply

A user may declare that a specific L2-only rule applies to their
L1 deployment. Mechanism: the suppression file
(`23_SUPPRESSION_PROTOCOL.md`) supports a `lifts` array:

```yaml
# .opensips-advisor/suppressions.yaml
lifts:
  - rule_id: OSIPS-SEC-TLS-005
    reason: "We're enterprise but our PCI auditor wants strict TLS"
```

The lifted rule applies even though the session profile is L1.

### Override 2 — Disable a rule that applies

Conversely, a user may declare that a specific rule does not apply
to their deployment. Use the same suppression file:

```yaml
suppresses:
  - rule_id: OSIPS-SEC-TLS-002
    reason: "Lab environment; self-signed certs intentional"
    expiry: "2026-09-01"
```

This is a *finding* suppression, not a *rule* exclusion — the rule
still runs, but its findings are routed to the audit appendix
rather than the primary report. The mechanism is described in
`23_SUPPRESSION_PROTOCOL.md`. The distinction matters because a
rule may fire on multiple locations and the user may want to
suppress only some of them.

### Override 3 — Change a rule's severity

A user may declare that a finding's *severity* is different in
their deployment than the catalog's default. Same suppression
file:

```yaml
severity_overrides:
  - rule_id: OSIPS-SEC-DOS_DEFENSE-004
    severity: low
    reason: "We have an upstream WAF that handles this layer"
```

The advisor still fires the rule and surfaces the finding, but
emits at the user-declared severity. The original severity is
noted in the finding's `tags` (`severity-overridden-from:medium`)
for audit transparency.

---

## What profile is *not*

Three things profile does not do, called out to prevent drift:

1. **Profile is not a confidence threshold.** A user does not
   pick a profile to filter low-confidence findings. Confidence
   is a separate dimension and is filtered (if at all) by a
   separate mechanism, documented in
   `15_CONFIDENCE_AND_VERIFICATION.md`.

2. **Profile is not a severity threshold.** A user does not pick
   L1 to mean "only show me high-severity findings." Severity
   filtering happens in the report layer (and in CI gates
   downstream); profile gating happens before detection runs.

3. **Profile is not a deployment-context taxonomy.** Deployment
   context is its own intake answer (enterprise / hosted-pbx /
   carrier / regulated-telco / lab). Profile is influenced by
   deployment context but not equivalent to it. A "carrier"
   deployment can run at L1 if the user has accepted the trade-off
   (e.g., legacy peer compatibility); an "enterprise" deployment
   can run at L2 if the user wants stricter posture
   (e.g., PCI compliance).

---

## Cross-references

- Profile selection at intake: `20_INTAKE_PROTOCOL.md`.
- Layer 4 filter logic and engine integration:
  `10_SKILL_STACK.md` §Layer 4.
- Override file format and suppression interaction:
  `23_SUPPRESSION_PROTOCOL.md`.
- How profile applicability is declared on each rule:
  `12_RULE_CATALOG_SCHEMA.md`.
- Severity and confidence definitions (which profile does *not*
  conflate with): `02_GLOSSARY.md` §3.
