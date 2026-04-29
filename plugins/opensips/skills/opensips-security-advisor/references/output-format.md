# Output Format

This document defines the shape of a finding, the Markdown report
structure, and the rule-file frontmatter. All three are versioned
together — changing one without the others creates drift between the
engine, the rule files that drive it, and the report the user reads.

---

## Finding Object

A finding is the structured record of one rule firing on one cfg
location. Fields are required unless marked optional.

```yaml
rule_id: OSIPS-SEC-TLS-002          # OSIPS-SEC-<DOMAIN>-NNN
family: tls                          # lowercase; from references/taxonomy.md
title: TLS verify_cert disabled on tls_mgm   # 1-120 chars; states, not recommends

severity: high
# One of: info, low, medium, high, critical, review_required.
# review_required = abstention: rule fired but advisor cannot decide.

confidence: high                     # high | medium | low; independent of severity

location:
  file: opensips.cfg                 # relative to cfg root
  line: 247                          # 1-indexed
  logical_location: 'modparam:tls_mgm'
# logical_location names the structural slot (modparam:<module>,
# route:<name>, branch_route:<name>) so a reformatted cfg still
# resolves to the same position.

cited_construct: |
  modparam("tls_mgm", "verify_cert", 0)
# Exact cfg fragment that triggered the rule. For absence-rules this
# is the surrounding context; threat_model spells out what is absent.

threat_model: |
  With verify_cert off, OpenSIPs accepts any peer certificate
  regardless of issuer, expiration, or hostname. Any peer presenting
  a syntactically valid TLS handshake can MITM the connection.
# One to two sentences. What the attacker gains. Distinct from
# remediation (which says what to do).

remediation:
  - 'Set verify_cert to 1: modparam("tls_mgm", "verify_cert", 1).'
  - 'Configure ca_list with the trusted CA bundle.'
  - 'Restart OpenSIPs and confirm against a known-good peer.'
# Numbered steps. Concrete, OpenSIPs-specific.

references:
  - kind: internal
    path: 'references/knowledge/vulnerability-reference.md'
    section: 'TLS configuration — verify_cert'
  - kind: external
    url: 'https://opensips.org/Documentation/Modules/tls_mgm'
    title: 'OpenSIPs tls_mgm module reference'
# Non-empty. Internal entries point into references/; external into
# OpenSIPs docs, CVE records, or RFCs.

# --- Optional fields ---

suppressed: false                    # default false
suppression_reason: ''               # required when suppressed: true
cvss_v4_vector: 'CVSS:4.0/AV:N/AC:L/...'   # CVSS 4.0 only
cwe: ['CWE-295']                     # CWE-NNN
applies_if_opensips_version: '>=3.4 <4.1'  # the rule's semver range
profile: [L1, L2]                    # absence means rule applies regardless
```

The advisor produces findings only as part of the Markdown report in
v1. There is no separate machine-readable artifact.

---

## Markdown Report Template

Six sections in fixed order. Section existence is mandatory: an empty
section states "no items" rather than being omitted.

```markdown
# OpenSIPs Security Advisor — Review

| Field | Value |
|---|---|
| Cfg path | `etc/opensips/opensips.cfg` |
| OpenSIPs version | 3.6 |
| Profile | L1 |
| Reviewed | 2026-04-29T14:32:11Z |

---

## Executive Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 8 |
| Review required | 2 |
| Info | 3 |

[One paragraph naming the top three findings by severity-then-
confidence rank and stating overall posture.]

---

## Findings

### [OSIPS-SEC-TLS-002] TLS verify_cert disabled on tls_mgm

**Severity:** High &nbsp;·&nbsp; **Confidence:** High &nbsp;·&nbsp; **Family:** tls
**Profile:** L1, L2 &nbsp;·&nbsp; **Location:** `opensips.cfg:247` — `modparam:tls_mgm`
**CWE:** CWE-295 &nbsp;·&nbsp; **CVSS 4.0:** 8.7

**Cited construct**

​```cfg
modparam("tls_mgm", "verify_cert", 0)
​```

**Threat model**

With verify_cert off, OpenSIPs accepts any peer certificate
regardless of issuer, expiration, or hostname. Any peer presenting a
syntactically valid TLS handshake can MITM the connection.

**Remediation**

1. Set verify_cert to 1: `modparam("tls_mgm", "verify_cert", 1)`.
2. Configure ca_list with the trusted CA bundle.
3. Restart OpenSIPs and confirm against a known-good peer.

**References**

- [TLS configuration — verify_cert](references/knowledge/vulnerability-reference.md)
- [OpenSIPs tls_mgm module reference](https://opensips.org/Documentation/Modules/tls_mgm)

---

[next finding block, same shape; ordered per "Severity Determination"]

---

## Suppressions Applied

| Rule | Location | Reason |
|---|---|---|
| OSIPS-SEC-TLS-002 | `opensips.cfg:247` | Lab; self-signed cert intentional |

[Empty: "No findings were suppressed in this run."]

---

## Intake Answers

[Five intake questions and the user's answers, replayed verbatim.
Reproducibility: a reviewer running the advisor again with these
answers should produce an equivalent report.]

1. **OpenSIPs version.** 3.6
2. **Profile.** L1
3. **Deployment context.** Enterprise PBX, public-facing
4. **Cfg completeness.** Complete
5. **Known prior reviews.** None

---

## Abstentions

| Rule | Reason |
|---|---|
| OSIPS-SEC-INJECTION-003 | Custom perl_func sanitizer between $fU source and avp_db_query sink; adequacy not verifiable from cfg alone. |

[Empty: "The advisor evaluated every applicable rule against this cfg."]
```

Empty-finding rendering: when there are zero findings (and zero
review_required), the Findings section reads "The advisor produced no
findings against this cfg under the selected profile. This does not
mean the deployment is risk-free — only script-layer concerns within
the rule catalog are checked."

---

## Rule-File Frontmatter Spec

YAML frontmatter at the top of every rule file under
`references/rules/<family>/<id>.md`, between two `---` delimiters.

### Required fields

| Field | Type | Description |
|---|---|---|
| `id` | string | `OSIPS-SEC-<DOMAIN>-NNN`. Matches the filename. |
| `name` | string | Kebab-case slug (e.g., `tls-verify-cert-disabled`). |
| `title` | string | 1-120 chars. |
| `family` | string | Lowercase module family. See `references/taxonomy.md`. |
| `severity` | string | `info` \| `low` \| `medium` \| `high` \| `critical` \| `review_required`. |
| `confidence` | string | `high` \| `medium` \| `low`. |
| `module_family` | string | Same enum as `family`; mirrored. |
| `applies_if_modules_loaded` | array<string> | Modules that must all be loaded. Empty list only for unconditional rules. |
| `applies_if_opensips_version` | string | Semver range (e.g., `">=3.4 <4.1"`). |
| `phase` | array<string> | Subset of `structural`, `value_pattern`, `dataflow`, `semantic`. Non-empty. |
| `profile` | array<string> | Subset of `L1`, `L2`. Field absence means rule applies regardless; `profile: []` is invalid. |
| `automated` | boolean | `true` if rule fires without user input. |
| `suppressible` | boolean | `true` (default) unless never-suppressible. |
| `cwe` | array<string> | `CWE-NNN`. At least one. |

### Optional fields

| Field | Type | Description |
|---|---|---|
| `cvss_v4_vector` | string | CVSS 4.0 only; 3.1 vectors are rejected. |
| `owasp` | array<string> | OWASP Top 10 / SIP entries. |
| `attack` | array<string> | MITRE ATT&CK technique IDs (`Txxxx` / `Txxxx.NNN`). |
| `tags` | array<string> | Free-form filter tags. |
| `references` | array<object> | `{kind: internal, path, section}` or `{kind: external, url, title}`. |

### Phase enum

```
structural    Directive presence/absence in a logical location.
value_pattern Directive value matched against a pattern.
dataflow      Tainted source flows to sensitive sink through (or
              bypassing) a sanitizer.
semantic      Combination of cfg elements + intake context.
```

A rule may declare multiple phases when its detection combines them.

### Severity enum

```
info             Posture observation, no fix required.
low              Hygiene.
medium           Notable.
high             Serious.
critical         Severe; address before next deployment.
review_required  Advisor abstaining; manual review required.
```

`review_required` is a sibling severity, not a confidence value. It
means the rule fired but adequacy of a sanitizer or semantics of a
custom function cannot be determined from the cfg alone.

### Profile enum

```
L1  Baseline. Applies to all OpenSIPs deployments.
L2  Hardened. Carrier, regulated, public-facing SBC.
```

Only L1 and L2 in v1. Rules that need a stricter posture than L2 are
authored as L2 rules with explicit prerequisites in `## Audit`.

---

## Rule-File Body Sections

Five required H2 sections in fixed order:

1. **`## Rationale`** — Why this is a finding. Security concern,
   threat model, attacker's gain. One to three paragraphs. Aim at
   the security layer; the modules reference covers OpenSIPs
   mechanics.
2. **`## Default Value`** — What the safe default is. Concrete for
   value-pattern rules (`verify_cert: 1`); the directive that should
   be present for absence rules. For contextual rules without a
   single default, state "Context-dependent; see Audit."
3. **`## Audit`** — How to detect. Detection logic, not remediation.
   Precise enough that two independent reviewers identify the same
   matches.
4. **`## Remediation`** — What to do. Concrete, actionable,
   OpenSIPs-specific. Mark upgrade-required steps with the heading
   suffix `(requires upgrade)`.
5. **`## References`** — Authoritative sources. Internal links into
   `references/knowledge/`; at least one external link to OpenSIPs
   docs, a CVE record, or an RFC. Mirrors the frontmatter
   `references` array.

Order is fixed. Sections out of order, missing, or duplicated fail
validation.

### Optional sections (in this order, after the required five)

- `## Version Notes` — Divergences across OpenSIPs 3.4, 3.5, 3.6, 4.0.
- `## False-Positive Considerations` — Known false-positive shapes.
- `## Related Rules` — Logical siblings.

---

## Severity Determination

The report orders findings by severity weight, descending:

| Severity | Weight |
|---|---|
| critical | 5 |
| high | 4 |
| medium | 3 |
| low | 2 |
| review_required | 1 |
| info | 0 |

Within a severity band, findings are ordered by confidence (high
before medium before low), then by family name (alphabetical), then
by rule_id (lexicographic). The ordering is mechanical.

A rule's frontmatter declares its *default* severity. The severity
emitted on a finding may be the default or context-adjusted at
emission (e.g., a rule with default severity high may emit at medium
when the cfg restricts the attack surface in a way the rule
explicitly recognizes). The report shows the emitted severity, not
the default.
