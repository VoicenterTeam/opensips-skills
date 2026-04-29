# OpenSIPS Security Advisor — Package README

**Component.** `opensips-security-advisor`
**Version.** `opensips-advisor@0.1.0` (Phase 6a — foundation specs in draft)
**Status.** Pre-release. Specs being authored; rule catalog not yet started.

---

## What this is

The OpenSIPS Security Advisor is a Claude skill component that analyzes
OpenSIPS configuration files (`opensips.cfg`) for script-layer security
vulnerabilities and misconfigurations. It targets OpenSIPS 3.4 LTS, 3.5,
and 3.6 LTS, and produces two outputs from every analysis run: a
machine-readable SARIF 2.1.0 log for downstream tooling (CI gates, code
scanning dashboards) and a human-readable Markdown report formatted along
NIST SP 800-115 conventions for engineers and operators.

The advisor reasons over the cfg file as a *script*, not as a process. It
does not connect to a running OpenSIPS instance, does not require network
access to the deployment under analysis, and does not modify the cfg in
place. It surfaces findings; the human acts on them.

---

## Relationship to the rest of the OpenSIPS skill

The OpenSIPS Claude skill project has three components:

1. **`opensips-general`** — concepts, architecture, terminology, request
   lifecycle. The "what OpenSIPS is" component.
2. **`opensips-modules`** — module-by-module reference and route-script
   syntax, organized as 12 module-family skill clusters. The "how to
   write OpenSIPS" component.
3. **`opensips-security-advisor`** — this package. The "is this OpenSIPS
   safe" component.

The advisor *consults* components 1 and 2 for OpenSIPS syntax and module
semantics; it does not duplicate them. A rule body explains the *security*
concern (why `verify_cert=0` is dangerous, what the attacker gains, how to
remediate). It does not re-explain *what* `verify_cert` is — that lives in
the modules reference. This separation keeps the advisor's rule catalog
focused on security reasoning, lets the broader skill carry the
encyclopedic load, and prevents the catalog from drifting out of sync
with OpenSIPS releases.

---

## Reading order for a new agent

An agent picking up this package for the first time should read in this
order. Skip the optional steps only if the task is narrow.

1. **Tier 0 — project orientation** (this directory, 3 docs). Mandatory.
2. **Tier 1 — architectural specs** (`10_architecture/`, 6 docs).
   Mandatory before authoring or modifying rules, fixtures, or runtime
   behavior.
3. **Tier 2 — runtime behavior** (`20_runtime/`, 5 docs). Mandatory before
   authoring intake flows, report templates, or interaction patterns.
4. **Sample rules from Tier 3** — pick 3–5 rules across different families
   from `30_rules/`. Grounds the abstractions from Tier 1 in concrete
   artifacts. Recommended.
5. **Tier 4 — version overlays** (`40_versions/`, 3 docs). Read on demand
   when a question is version-specific.
6. **Tier 5 — fixtures** (`50_fixtures/`). Read on demand when validating
   advisor behavior or writing new rules.
7. **Tier 6 — reference material** (`90_reference/`). Consulted, not
   read end-to-end. The master vulnerability reference, gap analysis, and
   methodology research live here as primary sources.

---

## Where each tier lives

```
opensips-security-advisor/
├── SKILL.md                    skill entry point (authored last)
├── 00_project/                 Tier 0 — orientation
├── 10_architecture/            Tier 1 — architectural specs
├── 20_runtime/                 Tier 2 — runtime behavior
├── 30_rules/                   Tier 3 — rule catalog (12 families)
├── 40_versions/                Tier 4 — version overlays (3.4/3.5/3.6)
├── 50_fixtures/                Tier 5 — test fixtures + golden reports
└── 90_reference/               Tier 6 — inherited research artifacts
```

Detailed contents per directory are described in the file manifest.

---

## Status tracking

This table is the canonical view of authoring progress. Update it as
documents move between states.

States: `not started` · `in draft` · `under review` · `locked`.
"Locked" means the document's contents are not to be re-opened in
follow-up authoring chats; changes require an explicit revisit.

| Tier | Path | State | Locked-as-of |
|------|------|-------|--------------|
| 0 | `00_project/00_README.md` | locked | Phase 6a |
| 0 | `00_project/01_CHARTER.md` | not started | — |
| 0 | `00_project/02_GLOSSARY.md` | not started | — |
| 1 | `10_architecture/10_SKILL_STACK.md` | not started | — |
| 1 | `10_architecture/11_FINDING_SCHEMA.md` | not started | — |
| 1 | `10_architecture/12_RULE_CATALOG_SCHEMA.md` | not started | — |
| 1 | `10_architecture/13_PROFILE_MODEL.md` | not started | — |
| 1 | `10_architecture/14_VERSION_STRATEGY.md` | not started | — |
| 1 | `10_architecture/15_CONFIDENCE_AND_VERIFICATION.md` | not started | — |
| 1 | `10_architecture/16_TAINT_MODEL.md` | locked | Thread 0 (consolidation) — Tier 1 extension, accepted per Chat A's recommendation |
| 2 | `20_runtime/20_INTAKE_PROTOCOL.md` | not started | — |
| 2 | `20_runtime/21_ANALYSIS_PIPELINE.md` | not started | — |
| 2 | `20_runtime/22_REPORT_TEMPLATES.md` | not started | — |
| 2 | `20_runtime/23_SUPPRESSION_PROTOCOL.md` | not started | — |
| 2 | `20_runtime/24_INTERACTION_PATTERNS.md` | not started | — |
| 3 | `30_rules/_CATALOG_INDEX.md` | not started | — |
| 3 | `30_rules/<family>/_index.md` ×12 | not started | — |
| 3 | `30_rules/<family>/OSIPS-SEC-*.md` | not started | — |
| 4 | `40_versions/3.4.md` · `3.5.md` · `3.6.md` | not started | — |
| 5 | `50_fixtures/**` | not started | — |
| 6 | `90_reference/01_master_vulnerability_reference.md` | pending import | — |
| 6 | `90_reference/02_enable_security_gap_analysis.md` | pending import | — |
| 6 | `90_reference/03_advisor_methodology_research.md` | pending import | — |
| 6 | `90_reference/external_sources.md` | not started | — |
| — | `SKILL.md` | not started (authored last) | — |

---

## Versioning convention

The advisor is versioned `opensips-advisor@MAJOR.MINOR.PATCH` following
semantic versioning:

- **MAJOR** — a breaking change to the finding schema, rule schema, or
  report layout that downstream consumers (CI gates, dashboards, other
  advisors) must accommodate. Examples: renaming a mandatory finding
  field, changing the rule ID convention, removing a SARIF property
  namespace.
- **MINOR** — additive changes that do not break existing consumers.
  Examples: new rules, new module families, new optional finding fields,
  new report sections, new profiles.
- **PATCH** — wording fixes, false-positive corrections, reference link
  updates, internal-only cleanups. No behavior change visible to a
  consumer that has already calibrated against the prior version.

The rule catalog versions *independently* of the advisor as a whole.
Each rule carries its own `version` field in frontmatter (also semver),
and a rule's `engine_version_min` / `engine_version_max` fields control
compatibility with advisor releases. A rule may rev to `2.0.0` because
its detection logic was rewritten while the advisor stays at `0.4.x`.

This separation lets us iterate rules without forcing advisor major bumps,
and lets us ship advisor major bumps (e.g., a SARIF-format change) without
forcing every rule to re-rev.

---

## Where to ask architectural questions

Architectural decisions for the advisor are documented in Tier 1. If a
question is not answered there:

1. Check Tier 6 (`90_reference/03_advisor_methodology_research.md`) for
   methodology background.
2. Check the file manifest for whether the decision was made and recorded.
3. If genuinely unanswered, surface it in the authoring chat's report-back
   rather than guessing. Architectural drift is the single largest risk
   to a multi-chat authoring effort like this one.
