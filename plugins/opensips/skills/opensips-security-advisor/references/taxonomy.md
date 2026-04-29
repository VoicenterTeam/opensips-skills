# Taxonomy

This document defines the vocabulary shared across all rules and reports
produced by the OpenSIPs Security Advisor. Every term below has one
operational meaning here. Rules cite this file rather than redefining
terms locally; reports render terms as defined here.

The advisor's domain overlaps three vocabularies — SIP/OpenSIPs,
security/SAST, and advisor-specific runtime — and each overloads words
the others use. This taxonomy locks the advisor's usage so rules and
reports do not drift.

---

## Severity Ladder

Severity answers: *if this finding is real, how bad is it?* It is
orthogonal to confidence; a finding carries both fields independently.

| Level | Meaning |
|---|---|
| `critical` | Pre-auth RCE, pre-auth bypass of authentication, or active exploitation of a published OpenSIPs CVE with public exploit code. |
| `high` | Post-auth RCE, credential disclosure, or weak crypto on the auth path. |
| `medium` | DoS surfaces, MI exposure that still requires auth, or information disclosure not covering credentials. |
| `low` | Configuration hygiene with security implications (e.g., debug logging that leaks SIP bodies). |
| `info` | Observation of interest with no known security impact. Recorded for context, not acted upon. |

Plus one confidence-degraded alternative: `review_required` — used when
the severity is real but the advisor's confidence in the match is
insufficient to assert the finding. Carries a non-empty reason. Not a
sixth rung; a separate kind of output for downgrades.

---

## Deployment Profiles

Profile answers: *which set of rules apply to this deployment?* Profile
is selected at intake and filters the rule catalog before detection
runs. v1 ships two profiles.

### L1 — Baseline

Enterprise PBX, hosted PBX, internal voice infrastructure, mid-size SIP
service providers. Internal-facing trust boundary. Rate limiting and
NAT traversal are lower priority. INVITE flooding and registration
hijack from external sources are out of model unless the deployment is
edge-exposed. Findings under L1 represent issues whose remediation is
broadly safe to apply.

### L2 — Strict

Carrier SBCs, regulated telcos, STIR/SHAKEN attestation participants,
high-volume interconnect borders, anti-fraud-sensitive deployments.
Public-facing trust boundary. All categories in scope. Stricter
defaults expected. Findings under L2 may require coordinated rollout,
peer agreements, or behavior changes that are beneficial but not
trivially safe.

### Declaration

Rules opt into profiles via frontmatter:

```yaml
profile: [L1, L2]   # applies under both
profile: [L1]       # applies under L1 (and L2 by inclusion)
profile: [L2]       # applies under L2 only
# profile field omitted — applies under both
```

A rule with no `profile` field applies under both. L1 applicability
implies L2 applicability: a rule dangerous enough to fire at enterprise
scale is at least as dangerous at carrier scale. The opt-in case that
matters is `profile: [L2]`. L3 is not part of v1.

---

## Glossary

Alphabetized terms used across rules and reports. Definitions are
operational.

- **abstention** — the advisor declines to assert a finding because
  evidence is insufficient. Surfaces as `review_required`.
- **audit trail** — the per-run record of every rule that fired,
  suppression that applied, override that took effect, and abstention.
  Renders into the report's audit appendix.
- **confidence** — how sure the advisor is that a match is real.
  Three-valued (`high`, `medium`, `low`). Orthogonal to severity. Low
  confidence is a candidate for downgrade to `review_required`.
- **dataflow** — the path between a source and a sink through script
  variables, AVPs, and transformations.
- **dialect** — the variant of SIP-server cfg syntax in use. OpenSIPs
  is one dialect within the SER lineage. The advisor analyzes OpenSIPs
  cfg only; cfg that is unmistakably another dialect is rejected at
  intake.
- **false positive** — a finding the advisor asserted that a human
  judges is not real. Tracked across runs to inform rule tuning.
- **finding** — a single instance of a rule firing on a specific
  location in the cfg. Carries a finding ID, severity, confidence, and
  recommendation text.
- **hardening** — informal term for the overall improvement of a cfg's
  security posture. v1 has no numerical hardening index.
- **intake** — the step before detection in which the advisor collects
  deployment context (profile, version, edge-exposure) from the user.
- **location** — a precise pointer into the cfg: file path, line
  number, and (where relevant) route block name and column range.
- **profile** — see "Deployment Profiles" above. The coarse lever that
  selects which rules apply.
- **review_required** — the kind of output emitted when severity is
  real but confidence is insufficient. Hands the location to a human
  for adjudication.
- **sanitizer** — a transformation that, when applied to data on the
  path from a source to a sink, neutralizes the danger. The recognized
  set lives in `knowledge/sanitizer-registry.md`.
- **severity** — see "Severity Ladder" above.
- **sink** — a script construct where data is consumed in a way that is
  dangerous if the data is tainted. Examples: `avp_db_query()`
  arguments, `exec_msg()` arguments, `xlog()` format strings.
- **source** — a script location where SIP-derived (attacker-influenced)
  data enters the cfg. Examples: `$rU`, `$fU`, `$hdr(*)`, `$si`.
- **suppression** — a user-declared instruction to omit a finding from
  the primary report. Suppressed findings still appear in the audit
  appendix.
- **taint** — the property that a value is SIP-derived and not yet
  sanitized. Tracked transitively through assignments.
- **version-gate** — a rule's declaration that it applies only to a
  specific OpenSIPs version range.

---

## Family Codes

The advisor groups rules into twelve top-level families. Each family
has a short code that appears in rule IDs of the form
`OSIPS-SEC-<CODE>-<NNN>`.

| Code | Family |
|---|---|
| AUTH | Authentication & credential storage |
| INJ | Injection (SQL, shell, header) |
| MI | Management interface exposure |
| TLS | TLS posture (ciphers, verify_cert, listener scope) |
| DOS | DoS defense (rate limiting, parser crashes) |
| RELAY | Relay & routing (open relay, loop detection) |
| ID | Identity spoofing (caller ID, From/To) |
| STIR | STIR/SHAKEN |
| MEDIA | Media/RTP exposure |
| LB | Dispatcher & load-balancer |
| LOG | Tracing & logging hygiene |
| HYG | Configuration hygiene |
