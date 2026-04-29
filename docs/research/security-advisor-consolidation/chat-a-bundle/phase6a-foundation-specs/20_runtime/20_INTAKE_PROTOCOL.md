# OpenSIPS Security Advisor — Intake Protocol

**Status.** Locked as of Phase 6a.

This document defines what happens at the start of every advisor
session, before any rule loading or detection runs. The intake
protocol is what produces the session context that
`10_SKILL_STACK.md` §Layer 1 hands off to the rest of the
pipeline. Without it the advisor cannot pick a profile, gate
version-specific rules, calibrate severity for the deployment, or
sanity-check engine identity.

The protocol is deliberately short — five questions or fewer per
charter success criterion 1 — and deliberately structured around
*what the analysis needs* rather than *what the user might know*.
Questions whose answers don't change advisor behavior are not
asked.

---

## When intake runs

Intake runs:

1. **At the start of every fresh session.** No exceptions.
2. **When intake answers are amended mid-session.** The user may
   change an answer (e.g., "actually, this is 3.5 not 3.6"); the
   advisor re-runs the relevant pipeline stages per
   `24_INTERACTION_PATTERNS.md` Pattern 5.

Intake does *not* run:

- When the user asks a clarification question about a finding
  (the session context is already established).
- When the user requests a re-render of an existing report (no
  re-analysis happens).
- During follow-on commands within the same analysis run
  (suppress this, explain that, show appendix).

---

## The five questions

The five intake questions are listed in canonical order. The
advisor MAY adjust order based on what the user has already
volunteered (e.g., if the user opened with "we're a carrier on
3.6", the advisor skips Q1 and Q2 and starts at Q3). The advisor
MAY combine questions visually but MUST elicit answers to all
five before declaring intake complete.

### Q1 — OpenSIPS version

> Which OpenSIPS version is this cfg for?
>
> - **3.4 LTS**
> - **3.5**
> - **3.6 LTS**
> - I'm not sure / let the advisor infer

**Why asked.** Determines version-gated rule applicability per
`14_VERSION_STRATEGY.md`. Determines which Tier 4 overlay loads.
Determines confidence calibration when version-specific signals
are present.

**Validation.** Accept any of the three explicit versions.
Accept "infer" — triggers the inference fallback documented in
`14_VERSION_STRATEGY.md`. Reject any other version with a
reference to the supported-versions list.

**Default.** None. The user must answer (or explicitly choose
infer).

### Q2 — Deployment context

> What is this OpenSIPS deployment?
>
> - **Enterprise PBX** — internal voice infrastructure for a
>   single organization
> - **Hosted PBX / multi-tenant** — providing PBX-as-a-service
> - **Carrier SBC / interconnect** — carrier-grade
>   border/dispatch
> - **Regulated telco** — subject to CALEA / lawful intercept
>   / sector-specific regulation
> - **Lab / pre-production** — testing or staging
> - Other / mixed (please describe briefly)

**Why asked.** Influences severity calibration in
`semantic_contextual` rules. Influences the L1/L2 default
recommendation in Q5. Recorded in the report's executive summary
so a reviewer knows what context the analysis assumed.

**Validation.** Single-select from the enum, or free text under
"other." Free-text answers are passed through to the LLM during
Layer 5d reasoning; the engine does not parse them.

**Default.** None. The user must answer.

### Q3 — Authentication mode

> How does this deployment authenticate SIP requests?
>
> - **Digest auth via auth_db** (database-backed credentials)
> - **JWT / token auth via auth_jwt**
> - **TLS client certificates**
> - **IP-based ACL only** (no per-user auth)
> - **None / passthrough** (this OpenSIPS does not authenticate)
> - Mixed (please describe)

**Why asked.** Different auth modes produce very different
finding sets. A passthrough deployment doesn't get auth-family
findings; an IP-ACL-only deployment gets a different set than a
digest-auth deployment.

**Validation.** Single-select or "mixed" with free text.
"Passthrough" is accepted but flagged in the methodology
disclosure — the advisor will note that auth-family rules were
not applicable rather than passed.

**Default.** None.

### Q4 — Front-end posture

> Where does this OpenSIPS sit in the network?
>
> - **Public-facing** — terminating Internet SIP
> - **Behind an SBC / WAF** — another device handles
>   first-line defense
> - **Internal only** — never sees public traffic
> - **Mixed** (e.g., public on one interface, internal on
>   another)

**Why asked.** Severity calibration: a finding that's high-
severity on a public-facing deployment may be medium or low on
a deployment behind an SBC. The MI-exposure family in
particular keys on this answer heavily.

**Validation.** Single-select. Mixed is accepted; the advisor
will surface findings against the most exposed assumption.

**Default.** None.

### Q5 — Profile selection

> Which posture does this deployment require?
>
> - **L1 — Baseline.** Suitable for most enterprise and
>   provider deployments. Recommended unless your context
>   demands carrier-grade strictness.
> - **L2 — Strict.** Carrier-grade, regulated telco, or
>   stricter operational discipline.

**Why asked.** Per `13_PROFILE_MODEL.md`, profile gates which
rules apply.

**Validation.** Single-select.

**Default.** L1, unless Q2 was "Carrier SBC" or "Regulated
telco," in which case the advisor recommends L2 explicitly
("Given your carrier context, I'd suggest L2") and accepts
either answer. The user may always override the recommendation.

---

## Sanity warnings during intake

Intake produces *warnings*, not findings. Warnings are recorded
in the session context and surfaced in the report's appendix B,
but they never appear in the Findings section.

### Warning 1 — Engine confusion

The advisor scans the cfg for Kamailio-only directives per the
disambiguation table in `02_GLOSSARY.md` §4. If any are present,
the advisor stops intake and confirms:

> Your cfg references `secfilter` (which is Kamailio, not
> OpenSIPS). Is this an OpenSIPS cfg or a Kamailio cfg?
>
> - This is an OpenSIPS cfg; the `secfilter` reference is a
>   mistake or vestigial.
> - This is a Kamailio cfg.

If the user confirms Kamailio, the advisor declines to proceed
(per charter non-goal "Universality"). If the user confirms
OpenSIPS-with-vestigial-Kamailio, the advisor proceeds and
records a warning.

This warning is mandatory and not skippable. Engine-confusion
findings undermine every other finding in the report.

### Warning 2 — Declared-vs-observed version mismatch

If the user declared a version in Q1 and the cfg's syntactic
signals are inconsistent with that version (e.g., user said
3.4, cfg loads `tls_wolfssl` which is 3.6+), the advisor warns:

> You declared 3.4 but the cfg loads `tls_wolfssl`, which is a
> 3.6+ module. Is the version correct?

The user may correct or proceed. Proceeding records a warning
and downgrades version-specific rules per
`14_VERSION_STRATEGY.md`.

### Warning 3 — Inferred-profile mismatch

Per `13_PROFILE_MODEL.md`, the advisor warns when a user
selects L1 but the cfg shape suggests carrier deployment:

> Your cfg shape suggests a carrier deployment (TLS borders,
> STIR/SHAKEN modules, dispatcher with multiple gateways). You
> selected L1 (baseline). L2 (strict) findings will not be
> reported. Reconsider profile?

The user may always proceed at L1.

### Warning 4 — Missing companion artifacts

If the cfg `include_file`s a path the advisor cannot read
(file not in upload, missing from session), the advisor warns:

> Your cfg includes `routes/auth.cfg` but I don't have that
> file. Findings against included content will be incomplete.
> You can paste the included file or proceed with partial
> analysis.

The user may upload, paste, or proceed with partial analysis.
Proceeding records the partial-cfg signal that downgrades
confidence per `15_CONFIDENCE_AND_VERIFICATION.md`.

### Warning 5 — Suppression file referenced but missing

If the user mentions a suppression file
(`.opensips-advisor/suppressions.yaml`) and the advisor does
not have it, the advisor asks:

> You referenced a suppression file but I don't have it. Please
> paste it, or proceed without suppressions.

---

## Sample intake dialogues

### Dialogue 1 — typical run, no warnings

> **User.** Here's our cfg. Can you check it?
>
> **Advisor.** Sure. Five quick questions before I run analysis.
> 1. Which OpenSIPS version? (3.4 LTS / 3.5 / 3.6 LTS / infer)
>
> **User.** 3.6 LTS
>
> **Advisor.**
> 2. What is this deployment? (enterprise PBX / hosted PBX /
> carrier SBC / regulated telco / lab / other)
>
> **User.** enterprise PBX
>
> **Advisor.**
> 3. Authentication mode? (digest auth_db / JWT / TLS client
> cert / IP ACL only / none / mixed)
>
> **User.** digest via auth_db
>
> **Advisor.**
> 4. Where does this sit in the network? (public-facing /
> behind SBC-or-WAF / internal only / mixed)
>
> **User.** public-facing
>
> **Advisor.**
> 5. Profile? (L1 baseline / L2 strict). For an
> enterprise PBX I'd suggest L1 unless you have a specific
> reason for strict.
>
> **User.** L1
>
> **Advisor.** Got it. Running analysis on a 3.6 enterprise PBX,
> public-facing, digest auth, L1 profile. Reading cfg now…

### Dialogue 2 — engine-confusion warning

> **User.** Here's our cfg.
>
> **Advisor.** Before I start — your cfg uses `secfilter`,
> which is a Kamailio module, not OpenSIPS. Is this an OpenSIPS
> cfg or a Kamailio cfg?
>
> **User.** It's OpenSIPS, that line is from a copy-paste, ignore it.
>
> **Advisor.** Noted. I'll record the `secfilter` reference as
> a hygiene finding ("vestigial Kamailio directive") but
> proceed with OpenSIPS analysis. Five quick questions…

### Dialogue 3 — version inference

> **User.** Audit this cfg please. I don't know the OpenSIPS
> version offhand.
>
> **Advisor.** No problem. I'll infer the version from cfg
> syntax. From `tls_mgm` and the absence of `tls_wolfssl`, I
> see 3.4 or 3.5. There's no narrowing signal between them, so
> I'll proceed assuming 3.5 (middle of the supported range).
> Version-specific findings will be flagged at reduced
> confidence. Continue?
>
> **User.** Continue.
>
> **Advisor.** OK. Question 2 — what is this deployment?

### Dialogue 4 — user volunteers context, advisor consolidates

> **User.** Carrier SBC, OpenSIPS 3.6, terminating Internet TLS,
> auth via auth_jwt. Run a strict scan.
>
> **Advisor.** Got most of it. Confirming:
> - Version: 3.6 LTS
> - Deployment: Carrier SBC
> - Auth: JWT via auth_jwt
> - Front-end: Public-facing (terminating Internet TLS)
> - Profile: L2 strict
>
> Ready to proceed? [yes / amend]
>
> **User.** yes
>
> **Advisor.** Running analysis…

---

## Intake completion contract

Intake is *complete* when the session context object
(`10_SKILL_STACK.md` §Layer 1) has all five required fields
populated and any warnings have been resolved (acknowledged,
addressed, or accepted-and-recorded).

The completed session context shape:

```yaml
session_context:
  opensips_version: "3.6"
  opensips_version_source: declared        # or "inferred"
  deployment_context: enterprise_pbx
  auth_mode: digest_auth_db
  frontend: public_facing
  profile: L1
  warnings:
    - kind: engine_confusion
      detail: "vestigial Kamailio secfilter reference at line 89"
      resolution: acknowledged
  suppressions: []
  cfg_complete: true                       # or "partial"
```

This object is the input to Layer 2 (parsing). The advisor will
not begin analysis until the object is complete and validation
passes.

---

## Where intake intersects with later flows

- **Verification calibration** — the `opensips_version_source`
  field gates whether version-specific rules apply confidence
  downgrade per `15_CONFIDENCE_AND_VERIFICATION.md`.
- **Profile gating** — the `profile` field is consumed by
  Layer 4 per `13_PROFILE_MODEL.md`.
- **Suppression resolution** — any suppression file referenced
  here is parsed by `23_SUPPRESSION_PROTOCOL.md`.
- **Report disclosure** — every intake answer appears in the
  report's "Methodology" and "Configuration" sections per
  `22_REPORT_TEMPLATES.md`.
- **Mid-session amendments** — see
  `24_INTERACTION_PATTERNS.md` Pattern 5 for the re-run
  protocol when a user amends an answer mid-session.

---

## Anti-patterns

These intake behaviors are explicitly out of bounds:

- **Asking more than five questions.** Per charter success
  criterion 1. If a sixth question feels needed, either it's
  encoded as a sanity warning (not a question), or the
  protocol needs amendment.
- **Asking questions whose answer doesn't change advisor
  behavior.** "How long have you been using OpenSIPS?" is
  irrelevant to analysis and not asked.
- **Requiring the user to know things they shouldn't have to.**
  CVSS familiarity, SARIF familiarity, OpenSIPS version
  precision to patchlevel — none of this is required to run
  intake.
- **Skipping intake.** Running analysis without intake
  produces unreliable findings; the advisor refuses.
- **Re-asking answered questions.** If the user volunteered an
  answer in their opening message, the advisor confirms and
  moves on rather than asking from scratch (see Dialogue 4).
