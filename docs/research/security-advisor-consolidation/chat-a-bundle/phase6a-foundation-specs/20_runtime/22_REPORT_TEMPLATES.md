# OpenSIPS Security Advisor — Report Templates

**Status.** Locked as of Phase 6a.

This document is the rendering contract for Layer 7
(`10_SKILL_STACK.md`). It defines what the Markdown report and
the SARIF 2.1.0 log look like, byte-for-byte, when produced from
a final triaged finding set. Both outputs are mandatory: every
analysis run produces both, and neither is a transformation of
the other — both are rendered from the Layer 6 hand-off
independently.

The Markdown report follows NIST SP 800-115 conventions for
information security testing reports
[P5 §TBD — "report taxonomy for security review"]: executive
summary, methodology, findings, remediation roadmap, appendices.
The SARIF log follows the SARIF 2.1.0 specification with
advisor-specific properties under the `opensips-advisor/`
namespace.

This document is also where the *hardening index formula* lives —
the 0–100 score that summarizes a deployment's posture. The
formula is normative; reports rendered without it (or with a
different formula) are non-conforming.

---

## What every run produces

Every analysis run produces exactly two artifacts:

1. **`opensips-advisor-report-<timestamp>.md`** — the Markdown
   report. Human-readable, top-to-bottom narrative, intended for
   engineers, operators, and reviewers.
2. **`opensips-advisor-sarif-<timestamp>.sarif`** — the SARIF
   2.1.0 log. Machine-readable, intended for CI gates,
   dashboards, and code-scanning integrations.

Both files are produced from the same triage hand-off and carry
the same finding set. They differ in shape, not content.

The report layer does not produce additional artifacts: no PDF,
no HTML rendering, no JSON-only output. Downstream consumers
that need other formats transform from these two.

---

## Markdown report — section structure

The Markdown report has nine sections in fixed order. Section
order is normative; renderers do not reorder. Section content is
driven by the finding set and session context but section
*existence* is mandatory regardless — a section with no content
states "no findings in this section" rather than being omitted.

```
1. Header
2. Executive Summary
3. Methodology
4. Configuration
5. Findings
6. Items Requiring Review
7. Remediation Roadmap
8. Hardening Index
9. Appendices (A: Suppressions, B: Sanity Warnings, C: Pipeline Trace)
```

### 1. Header

Six fields, rendered as a metadata block at the top of the
report:

```markdown
# OpenSIPS Security Advisor Report

| Field | Value |
|---|---|
| Generated | 2026-04-27T14:32:11Z |
| Engine | opensips-advisor 0.1.0 |
| OpenSIPS version (declared) | 3.6 LTS |
| Deployment context | Enterprise PBX, public-facing |
| Profile | L1 — Baseline |
| Cfg fingerprint | sha256:9f2c1a7e... |
```

The `Cfg fingerprint` is a SHA-256 of the canonicalized cfg
input. Two runs of the same cfg produce the same fingerprint
even if comments or whitespace differ. This lets a reviewer tie
a report to a specific cfg version without requiring the cfg
itself.

### 2. Executive Summary

Three to five paragraphs, intended for a reviewer who reads
nothing else. Rendered semi-deterministically: counts and
hardening index are mechanical, the prose narrative ("top three
concerns are…") is a single LLM call against the final finding
set per `10_SKILL_STACK.md` §Layer 7's narrow LLM exception.

Required content:

- One sentence stating the overall posture and hardening index.
- A counts summary by severity (critical/high/medium/low/info)
  and `review_required` count.
- The top three findings by composite severity-and-confidence
  rank, named and one-line described.
- One paragraph on what changed if a baseline was supplied
  (`X new findings, Y resolved, Z unchanged`).
- One paragraph on what was *not* analyzed — gating ledger
  summary ("12 rules excluded by profile, 5 by version, 18 by
  modules-not-loaded").

The executive summary is the only place in the report where
prose synthesis happens. Every other section is mechanical
templating.

### 3. Methodology

A factual section disclosing what the advisor did. Required
content:

- The five intake answers, replayed.
- Engine version, rule catalog version (latest rule revision
  across the catalog).
- The gating ledger (which rules were excluded, at which step,
  with totals).
- Verification statistics (how many findings ran the judge
  pass, confirmed/dissented/uncertain counts).
- Suppressions in scope (count; details in Appendix A).
- Parser warnings (count; details in Appendix B).
- Inferred-vs-declared signals: was the OpenSIPS version
  declared or inferred? Was the cfg complete or partial?

This section is what makes the report *reproducible*. A
reviewer should be able to run the advisor again, against the
same cfg with the same intake answers, and get an equivalent
report.

### 4. Configuration

A read of the cfg's relevant configuration surface, *not* a
finding. This is the "what does this cfg look like" section so
reviewers without OpenSIPS expertise can orient.

Required content:

- Loaded modules (list of names).
- Listen directives (transport, address, port).
- Authentication chain (which auth modules, called from where).
- MI exposure summary (which MI transports, which addresses).
- Notable global settings (children count, log level).
- Relevant route blocks (names, function-call counts).

This is descriptive, not evaluative. A finding about
`mi_http on 0.0.0.0` lives in the Findings section; the
Configuration section just states "MI HTTP listening on
0.0.0.0:8888."

### 5. Findings

The core section. Findings are rendered grouped by severity in
the order: critical, high, medium, low, info. Within a severity
band, findings are ordered by composite rank (severity × CVSS
numeric × confidence), descending.

Each finding is rendered as a block:

````markdown
### [OSIPS-SEC-TLS-002] TLS verify_cert disabled on tls_mgm

**Severity:** High &nbsp; · &nbsp; **Confidence:** High &nbsp; · &nbsp;
**CVSS 4.0:** 8.7 (CVSS:4.0/AV:N/AC:L/...)
**Profile:** L1, L2 &nbsp; · &nbsp; **Verification:** Deterministic confirmed
**Location:** `opensips.cfg:247` &nbsp; · &nbsp; `modparam:tls_mgm`

**Tags:** tls, verification &nbsp; · &nbsp; **CWE:** CWE-295

#### What we found

modparam("tls_mgm", "verify_cert", 0) — certificate verification
is disabled on the tls_mgm module. With verify_cert off, OpenSIPS
accepts any peer certificate regardless of issuer, expiration, or
hostname, allowing MITM by any peer presenting a syntactically
valid TLS handshake.

```cfg
# BAD (line 247):
modparam("tls_mgm", "verify_cert", 0)
```

#### Why it matters

[Rule's Rationale section, lifted]

#### How to fix

Set verify_cert to 1:

```cfg
# GOOD:
modparam("tls_mgm", "verify_cert", 1)
modparam("tls_mgm", "ca_list", "/etc/opensips/tls/ca.pem")
```

If a self-signed peer cert is intentional (lab environment),
configure ca_list with the specific cert instead of disabling
verification globally.

#### References

- §5.1 — TLS Configuration (90_reference/01_master_vulnerability_reference.md)
- OpenSIPS tls_mgm documentation
  (https://opensips.org/Documentation/Modules/tls_mgm)

---
````

The block is identical for vulnerability and review_required
findings, with two differences for `review_required`:

- The "How to fix" section becomes "What to investigate."
- The block carries a visible `**Kind: Review required**`
  badge, and lists the `review_reason` text below severity.

### 6. Items Requiring Review

A dedicated section for `kind: review_required` findings,
distinct from the main Findings section. Rendered with the same
per-finding block format but in its own section so reviewers can
work through abstentions deliberately.

Empty section is rendered as:

```markdown
## Items Requiring Review

The advisor reached confident conclusions on every finding in
this run; no items require manual review.
```

### 7. Remediation Roadmap

A condensed table of all findings with effort estimates,
rendered in priority order:

| Priority | Rule | Title | Severity | Effort |
|---|---|---|---|---|
| 1 | OSIPS-SEC-TLS-002 | TLS verify_cert disabled | High | Low (one-line modparam change) |
| 2 | OSIPS-SEC-AUTH-001 | Plaintext password column | High | Medium (schema migration + cfg change) |
| 3 | OSIPS-SEC-INJECTION-003 | $fU into avp_db_query | High | High (sanitize then validate) |

Effort enum: `Low` (one-line cfg change), `Medium`
(coordinated cfg + schema or peer change), `High` (architectural
or version-upgrade required). Each rule's frontmatter declares
its default effort; the renderer uses that unless the per-finding
context warrants override.

The roadmap is the consultant's-deliverable view: a customer who
wants to know "what do I do this week, this month, this quarter"
reads this section.

### 8. Hardening Index

A single 0–100 number with formula transparency.

```markdown
## Hardening Index

**87 / 100** — Strong posture with a small number of
high-severity items to address.

Computed from finding counts (lower is worse):

| Severity bucket | Count | Weight | Penalty |
|---|---|---|---|
| Critical | 0 | 25 | 0 |
| High | 2 | 10 | 20 |
| Medium | 4 | 4 | 16 |
| Low | 8 | 1 | 8 |
| Info | 3 | 0 | 0 |
| Review required | 2 | 2 | 4 |
| **Total penalty** | | | **48** |

`Hardening index = max(0, 100 - min(48, 100)) - <other adjustments>`

Floor adjustments: profile L2 selected → no floor lift.
Carrier-context + critical finding → not applicable.
**Final: 100 - 48 + 35 = 87.**
```

### Hardening index formula (normative)

```
penalty = (counts.critical    * 25)
        + (counts.high        * 10)
        + (counts.medium      *  4)
        + (counts.low         *  1)
        + (counts.info        *  0)
        + (counts.review_required * 2)

raw_score = 100 - min(penalty, 100)

# Floor adjustments (added back to raw_score):
floor = 35 if (profile == "L1" and counts.critical == 0)
        else 25 if (profile == "L1")
        else 0

hardening_index = min(100, max(0, raw_score + floor))
```

The floor adjustment exists so an L1 deployment with no
critical findings does not drop into low scores from accumulated
medium/low findings — at L1, low-severity hygiene findings
weight less in the absolute posture assessment than at L2,
because L1 is a baseline profile not a maximalist one.

The numbers (25/10/4/1/0/2 weights, 35/25/0 floors) are tunable
in advisor minor versions but not patch versions: a hardening
index from advisor 0.1.x compares directly with another
0.1.x; comparison across minor versions requires noting the
formula version. The current formula is identified as
`hardening-index/v1`.

### Severity-and-confidence interaction in ranking

When ranking findings within a severity band for the
Findings-section ordering, the composite rank is:

```
rank = severity_numeric * confidence_factor * cvss_numeric
```

Where:
- `severity_numeric`: critical=5, high=4, medium=3, low=2, info=1.
- `confidence_factor`: high=1.0, medium=0.8, low=0.6.
- `cvss_numeric`: 0–10 from `security_severity` field.

Higher rank renders first. The interaction matrix from
`15_CONFIDENCE_AND_VERIFICATION.md` informs which findings
appear in which section; this rank formula determines order
within a section.

### 9. Appendices

#### Appendix A — Suppressions and deferred findings

Every suppression that fired this run, with audit metadata:

```markdown
### Appendix A — Suppressions

| Rule | Location | Suppression source | Reason | Expires |
|---|---|---|---|---|
| OSIPS-SEC-TLS-002 | opensips.cfg:247 | suppressions.yaml | "Lab environment; self-signed certs intentional" | 2026-09-01 |
| OSIPS-SEC-MI_EXPOSURE-001 | opensips.cfg:412 | inline comment | "Internal management network only" | — |
```

Empty case: "No findings were suppressed in this run."

#### Appendix B — Sanity warnings

Intake warnings (`20_INTAKE_PROTOCOL.md` Warnings 1–5),
parser warnings (Stage 1 of `21_ANALYSIS_PIPELINE.md`), and
profile-mismatch acknowledgments.

#### Appendix C — Pipeline trace

The pipeline trace from `21_ANALYSIS_PIPELINE.md` §Pipeline
observability, rendered as a folded code block:

````markdown
<details>
<summary>Pipeline trace (click to expand)</summary>

```yaml
trace:
  stage_1_parse:
    duration_ms: 142
    ...
```

</details>
````

Default-collapsed in Markdown viewers that support `<details>`;
present in plain text otherwise.

---

## SARIF 2.1.0 — skeleton

The SARIF log follows the 2.1.0 spec. The advisor-specific
shape is defined here normatively; field-by-field finding
mapping is in `11_FINDING_SCHEMA.md` §"SARIF 2.1.0 embedding."

### Top-level skeleton

```json
{
  "$schema": "https://docs.oasis-open.org/sarif/sarif/v2.1.0/cos02/schemas/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "opensips-security-advisor",
          "fullName": "OpenSIPS Security Advisor",
          "version": "0.1.0",
          "semanticVersion": "0.1.0",
          "informationUri": "https://opensips.org/advisor",
          "rules": [
            {
              "id": "OSIPS-SEC-TLS-002",
              "name": "tls-verify-cert-disabled",
              "shortDescription": { "text": "..." },
              "fullDescription": { "text": "...", "markdown": "..." },
              "helpUri": "https://opensips.org/advisor/rules/OSIPS-SEC-TLS-002",
              "defaultConfiguration": { "level": "error" },
              "properties": {
                "opensips-advisor/rule_version": "1.0.0",
                "opensips-advisor/profile": ["L1", "L2"],
                "opensips-advisor/phase": "value_pattern",
                "tags": ["tls", "verification"],
                "security-severity": "8.7"
              }
            }
          ]
        }
      },
      "invocations": [
        {
          "executionSuccessful": true,
          "startTimeUtc": "2026-04-27T14:32:11Z",
          "endTimeUtc": "2026-04-27T14:32:18Z",
          "properties": {
            "opensips-advisor/pipeline_trace": { "...": "..." }
          }
        }
      ],
      "originalUriBaseIds": {
        "CFG_ROOT": { "uri": "file:///etc/opensips/" }
      },
      "taxonomies": [
        { "name": "CWE", "...": "..." },
        { "name": "OWASP", "...": "..." },
        { "name": "MITRE-ATTACK", "...": "..." }
      ],
      "results": [
        { "...": "per finding, see 11_FINDING_SCHEMA.md" }
      ],
      "properties": {
        "opensips-advisor/opensips_version": "3.6",
        "opensips-advisor/opensips_version_source": "declared",
        "opensips-advisor/deployment_context": "enterprise_pbx",
        "opensips-advisor/profile": "L1",
        "opensips-advisor/hardening_index": 87,
        "opensips-advisor/hardening_index_formula": "hardening-index/v1"
      }
    }
  ]
}
```

### Per-finding render

Each finding becomes one entry in `runs[0].results[]`. The
field-by-field mapping is in `11_FINDING_SCHEMA.md`. Re-stating
the most consequential properties here:

- **`result.level`** is derived from advisor `severity`:
  critical/high → `error`, medium → `warning`, low → `note`,
  info → `none`.
- **`result.kind`** distinguishes vulnerability (`fail`) from
  review_required (`informational`).
- **`result.partialFingerprints["stable/v1"]`** carries the
  advisor's stable fingerprint for cross-run identity.
- **`result.suppressions[]`** is populated only for suppressed
  findings (and only the user-triggered suppressions; the
  advisor itself does not suppress).
- **`result.fixes[]`** is populated only when the rule
  declares a `fix_diff`.

### What's *not* in the SARIF

- The hardening-index breakdown table. Only the final score is
  in `runs[0].properties`. The breakdown table is Markdown-only
  because SARIF consumers compute their own scoring.
- The remediation roadmap as a structured object. The per-rule
  effort is in `result.properties.opensips-advisor/effort`;
  consumers reconstruct the roadmap by iterating
  `runs[0].results[]`.
- The Configuration section's cfg-shape narrative. SARIF doesn't
  carry cfg description; that's a Markdown-report concern only.

### SARIF version commitment

The advisor commits to SARIF 2.1.0 specifically. SARIF 2.2 (in
draft as of advisor 0.1.0) is not produced; future advisor
versions may add SARIF 2.2 emission alongside 2.1, never
replacing 2.1, until SARIF 2.1 is deprecated by OASIS.

---

## Empty-finding-set rendering

When the analysis produces zero findings (and zero
review_required), the report is still produced. The Findings
section reads:

```markdown
## Findings

The advisor produced no findings against the supplied cfg under
the selected profile (L1) and configured rule set.

This does not mean the deployment is free of all security risk.
The advisor analyzes script-layer concerns within its rule
catalog. C-source-level vulnerabilities (CodeQL, Semgrep
territory), runtime concerns, and concerns outside the catalog
are not surfaced. See the charter (`00_project/01_CHARTER.md`)
for explicit out-of-scope items.
```

The Hardening Index is rendered as 100 (or as 100 minus any
floor adjustments). The SARIF log is emitted with an empty
`results[]` array, not omitted.

---

## Internationalization and length

The report templates are English-only as of advisor 0.1.0.
Internationalization is a future concern; the SARIF spec
supports per-message localization but the advisor does not
populate it.

The Markdown report's typical length: 5–12 pages for a typical
enterprise PBX cfg, 15–25 pages for a carrier SBC cfg. The
SARIF log is 50–500 KB depending on finding count.

---

## Cross-references

- Finding shape: `11_FINDING_SCHEMA.md`.
- Severity-and-confidence interaction matrix:
  `15_CONFIDENCE_AND_VERIFICATION.md`.
- Pipeline trace shape: `21_ANALYSIS_PIPELINE.md`.
- What goes in Appendix A:
  `23_SUPPRESSION_PROTOCOL.md`.
- Intake answers replayed in §3:
  `20_INTAKE_PROTOCOL.md`.
- Charter scope cited in empty-finding rendering:
  `00_project/01_CHARTER.md`.
