# OpenSIPS Security Advisor — Charter

**Status.** Locked as of Phase 6a. Changes require an explicit revisit.

This document is the scope contract for the OpenSIPS Security Advisor.
It defines what the advisor *is*, what it is *not*, who it serves, and
what a good session looks like. When a future proposal would expand or
shift the advisor's behavior, it is measured against this charter first.

---

## Mission

The OpenSIPS Security Advisor exists to make OpenSIPS deployments safer
by surfacing script-layer security concerns in `opensips.cfg` files
before they reach production. It does this through static analysis
augmented by LLM reasoning, organized as a curated rule catalog with
explicit confidence and severity, and delivered as both
machine-consumable SARIF and engineer-readable Markdown. Its purpose is
to inform and accelerate the human decisions that secure a SIP
deployment, not to replace them.

---

## In scope

The advisor analyzes the OpenSIPS configuration script and adjacent
artifacts to detect, explain, and recommend remediation for:

- **Script-layer vulnerabilities.** Misconfigurations and unsafe
  patterns in `opensips.cfg` route logic, including injection
  exposures, missing input validation, unsafe dataflow from SIP-derived
  variables to sinks, and unsafe use of MI/MI-HTTP, RPC, or evi
  interfaces.
- **Hardening posture.** Presence and correctness of defensive
  directives — TLS verification, registration rate-limiting, pike,
  ratelimit, max_forwards processing, sanity checks, dispatcher health
  probes, and similar hygiene controls.
- **Profile-based posture assessment.** Evaluation of a deployment
  against CIS-style Level 1 (broadly applicable, low disruption) and
  Level 2 (carrier-grade, strict) profiles, with the ability to
  override per-rule.
- **Version-aware analysis.** Detection of CVE-gated and version-gated
  issues across OpenSIPS 3.4 LTS, 3.5, and 3.6 LTS, using the version
  the user declares (or that intake heuristics infer with a warning).
- **Dual output.** Every analysis run produces both a SARIF 2.1.0 log
  for downstream tooling and a NIST SP 800-115-style Markdown report
  for human review. Neither is optional.
- **Suppression discipline.** Honoring user-declared suppressions
  through three mechanisms (in-source comments, external suppression
  file, natural-language site policy), with audit-trail visibility and
  a never-suppressible set for active-exploit findings.
- **Abstention.** When the LLM cannot reach a confident conclusion, the
  advisor emits `kind: review_required` rather than guessing. This is
  treated as a first-class output, not a failure mode.

---

## Out of scope

The advisor does not, and will not without an explicit charter
amendment, do any of the following:

- **C-source-level vulnerability detection.** OpenSIPS core and module
  source-code review belongs to other tooling (CodeQL, Semgrep, manual
  audit). The advisor reads cfg, not C.
- **Runtime or dynamic analysis.** No connection to a live OpenSIPS
  process, no log ingestion, no pcap analysis, no fuzzing. The advisor
  is a static analyzer over text.
- **Network-level attack simulation.** The advisor does not generate
  malicious SIP traffic, does not probe deployments, does not validate
  findings by exploit attempt.
- **Patching OpenSIPS itself.** The advisor recommends; it does not
  rewrite the cfg file in place. The user owns the edit.
- **Managing deployed OpenSIPS instances.** No restart, reload, or
  configuration push. The advisor is a read-only artifact analyzer.
- **Orchestrating adjacent daemons.** rtpengine, RTPProxy, MediaProxy,
  Kamailio, FreeSWITCH, and similar are out of scope. Where the cfg
  references them, the advisor may flag misconfigured integration but
  does not attempt to validate the daemon itself.
- **Compliance certification.** The advisor maps findings to relevant
  frameworks (CWE, OWASP, MITRE ATT&CK, NIST controls where applicable)
  to inform compliance work. It does not produce certifications,
  attestations, or audit sign-offs.

---

## Target users

The advisor is built for, and tuned to, the following audiences:

- **OpenSIPS administrators.** Engineers who own one or more
  `opensips.cfg` files and need to keep them safe across upgrades,
  team handoffs, and changing deployment contexts.
- **SIP security engineers.** Specialists performing scheduled or
  ad-hoc security review of SIP infrastructure, including third-party
  audit work where the cfg is the artifact under review.
- **Carrier operations teams.** Telecom operators running OpenSIPS as
  SBC, registrar, load balancer, or proxy in regulated environments
  where Level 2 profile assessment is the norm.

The advisor is *not* tuned for end users with no SIP background. It
explains findings clearly, but it assumes basic familiarity with SIP
concepts (registrations, dialogs, transactions) and OpenSIPS structure
(modules, route blocks, modparams).

---

## Non-goals

These are deliberate non-goals, distinguished from out-of-scope items
because they are choices about *how* the advisor operates, not what it
covers:

- **Automated config editing.** The advisor produces remediation
  guidance — sometimes including before/after examples and SARIF
  `fixes[]` blocks — but never mutates the user's cfg file. The user
  owns the diff.
- **Compliance certification.** The advisor informs compliance
  posture; it does not certify, sign, or attest.
- **Universality.** The advisor targets OpenSIPS specifically. It
  declines to analyze Kamailio, OpenSER, or hybrid deployments. Where
  the cfg under review uses Kamailio idioms (`sanity_check`,
  `secfilter`, `allow_address`, etc.), the advisor flags the confusion
  and refuses to proceed until the user confirms which engine the cfg
  is intended for.
- **Real-time chat companion.** The advisor is not a general-purpose
  OpenSIPS Q&A bot. Questions outside the scope of cfg-file analysis
  are routed back to the broader OpenSIPS skill (components 1 and 2).

---

## Success criteria

A "good" advisor session, from the user's perspective, looks like this:

1. **Intake is short and predictable.** Five questions or fewer; each
   question's purpose is obvious; defaults are sensible.
2. **The analysis terminates in bounded time.** Cfg files of typical
   size (200–2000 lines) complete within a single Claude session
   without context exhaustion.
3. **Findings are precise.** Every finding cites a specific
   line/column in the cfg (or an explicit "no such directive" location
   for absence-of rules). Severity and confidence are both present and
   independently justified.
4. **Findings are actionable.** Every finding includes a concrete
   remediation: a directive to add, a value to change, a pattern to
   replace. Where the remediation is non-trivial (requires module
   changes, version upgrades, or coordinated rollout), this is called
   out explicitly.
5. **The advisor abstains rather than guesses.** When evidence is
   weak, the user sees `review_required` with a clear reason rather
   than a low-confidence assertion masquerading as a finding.
6. **Output is consumable in two modes.** A reviewer reads the
   Markdown report top-to-bottom and understands the cfg's posture in
   under ten minutes. A pipeline ingests the SARIF and gates on
   severity without bespoke parsing.
7. **The advisor is honest about its limits.** When OpenSIPS version
   detection is uncertain, when a custom sanitizer falls outside the
   rule catalog, when a compensating control is asserted but cannot be
   verified — the report says so, plainly, in the appendix.

A *bad* session, by contrast, is one where the user receives a wall of
findings without prioritization, where false positives outnumber real
issues, where the LLM hedges everything to medium confidence, where
remediation guidance is generic, or where the advisor confidently fires
on a Kamailio-only directive that does not exist in OpenSIPS at all.
The charter exists in part to keep that second session from happening.

---

## Charter governance

This charter changes only through an explicit amendment chat that
documents the proposed change, the rationale, and the downstream impact
on Tier 1 specs. Drift — a rule that quietly extends scope, a fixture
that exercises an out-of-scope behavior, an interaction pattern that
crosses into runtime management — is detected by reading proposals
against this document and pushing back. That pushback is the charter
doing its job.
