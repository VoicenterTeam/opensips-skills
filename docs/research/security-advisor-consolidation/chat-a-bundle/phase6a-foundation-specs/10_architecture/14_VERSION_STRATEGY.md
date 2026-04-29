# OpenSIPS Security Advisor — Version Strategy

**Status.** Locked as of Phase 6a. The decision documented here —
one rule catalog covering OpenSIPS 3.4 / 3.5 / 3.6 with per-rule
version gates — was reached during Phase 5 architectural review
and is recorded here as the load-bearing rationale.

This document answers a single question: **how does the advisor
handle multiple OpenSIPS versions?** Three OpenSIPS versions are
currently supported (3.4 LTS, 3.5, 3.6 LTS). Their cfg syntax,
module set, and CVE history overlap heavily but not perfectly.
The advisor's answer to multi-version support shapes everything
downstream — the rule catalog, the version overlays in Tier 4,
the intake protocol, and the report's methodology disclosure.

---

## The decision

**One rule catalog, not three.** Rules live in
`30_rules/<family>/` and apply across versions. Per-rule
frontmatter (`applies_if_opensips_version`,
`applies_if_modules_loaded`) gates execution. Version-specific
remediation differences are captured in the optional
`## Version Notes` body section. Version-specific *context* —
release-level notes about CVEs, module renames, deprecations —
lives in Tier 4 overlays (`40_versions/3.4.md`, `3.5.md`,
`3.6.md`).

The alternative was three sibling catalogs
(`30_rules/3.4/`, `30_rules/3.5/`, `30_rules/3.6/`). This was
rejected.

---

## Why one catalog

The decision rests on three findings.

### 1. The version-identical rate is high

A pre-Phase-6a survey of the ~40–60 rules planned for the catalog
estimated that **roughly 85% of rules are version-identical**
across 3.4 / 3.5 / 3.6. The script-layer security model of
OpenSIPS has been stable: pseudo-variables, route blocks,
modparam syntax, and the major modules' security-relevant
behavior all carry forward across these three releases.

The 15% of rules with version divergence fall into a small
number of identifiable shapes (see "Where versions diverge"
below). For three sibling catalogs to be justified, that
divergence rate would need to be much higher, and the divergent
rules would need to be the *common* case. They are not.

### 2. Three catalogs produces silent drift

When a rule must be reauthored independently in three places,
the rate of accidental drift is high: a wording fix that lands
in 3.6 and not 3.4, a CVSS vector update that touches 3.5 and
not the others, a remediation step refined in one catalog and
forgotten in another. Each instance is small; aggregated across
40–60 rules and the rule catalog's expected lifetime, the
silent-drift cost dominates the per-rule maintenance cost.

A single catalog with version gates has the opposite property:
the default behavior is "applies everywhere." The author must
*deliberately* declare a version restriction. Drift is loud
rather than silent.

### 3. The reporting disclosure is cleaner

A user runs the advisor on a 3.5 cfg. The report's "Methodology"
section discloses which rules were considered, which were gated
out by version, and why. With one catalog, this disclosure is a
clean filter operation: "5 rules excluded because they apply only
to ≥3.6." With three catalogs, the disclosure is murkier —
either three catalogs were partially loaded and the user gets a
muddled picture of which subset applied, or two catalogs were
ignored entirely and the user sees no signal that they exist.

The single-catalog model lets a 3.4 user *see* that a 3.6-only
rule exists, with a clear "you'd need to upgrade to benefit" note.
That is part of the value of running the advisor.

---

## How per-rule version gating works

The mechanism is documented in `12_RULE_CATALOG_SCHEMA.md`. The
short form:

```yaml
applies_if_opensips_version: ">=3.5"
```

This expression is a semver range. The advisor's Layer 4 (per
`10_SKILL_STACK.md`) evaluates the range against the
session-context `opensips_version` and includes or excludes the
rule from the parameterized rule set.

Common patterns:

```yaml
# Rule applies to a specific version and forward
applies_if_opensips_version: ">=3.6"

# Rule applies only up to (and including) a version
applies_if_opensips_version: "<=3.5"

# Rule applies to a range
applies_if_opensips_version: ">=3.4 <3.7"

# Rule applies to a single major.minor and below
applies_if_opensips_version: "<3.5"

# Field absent — rule applies regardless of version (default)
```

### Range evaluation rules

- The session's OpenSIPS version is normalized to `MAJOR.MINOR`
  (e.g., `3.6.0` → `3.6`) before range comparison.
- Ranges are inclusive at boundaries unless explicit `<` or `>`
  is used. `>=3.4 <3.7` includes 3.4, 3.5, 3.6 and excludes 3.7.
- An invalid range fails catalog validation
  (`12_RULE_CATALOG_SCHEMA.md` validation rule 9).
- A range that excludes *all* currently supported versions
  (3.4, 3.5, 3.6) is permitted but produces a catalog-load
  warning. This is how a rule can be retained for forward
  compatibility (e.g., a placeholder for a CVE not yet
  applicable to any released version).

### Module-loaded gating

Frequently a version difference manifests as a module rename or
introduction. The `applies_if_modules_loaded` field handles these
cases more directly than version ranges:

```yaml
# Rule applies only when tls_mgm is loaded (which is 3.4+)
applies_if_modules_loaded:
  - tls_mgm

# Rule applies only when both auth_jwt and the cachedb are loaded
applies_if_modules_loaded:
  - auth_jwt
  - cachedb_redis
```

When a rule has both `applies_if_opensips_version` and
`applies_if_modules_loaded`, both must be satisfied for the rule
to apply (logical AND).

The `applies_if_modules_loaded` form is preferred when the
real applicability test is "this module is loaded" rather than
"this OpenSIPS version is in use." A rule about `tls_mgm`
behavior is best gated on `applies_if_modules_loaded:
[tls_mgm]`, not on `applies_if_opensips_version: ">=3.4"`,
because the rule still doesn't fire on a 3.6 cfg that uses the
older monolithic `tls` module.

---

## Where versions diverge

The estimated 15% of rules with version divergence cluster in a
small number of shapes. Capturing them here so rule authors
recognize them.

### Shape 1 — Module rename or split

The largest single source of divergence. Examples:

- `tls` (monolithic, ≤3.3) → `tls_mgm` + `tls_openssl` (3.4+)
  + `tls_wolfssl` (3.6+).
- The MI transport family has had directive-shape adjustments
  across releases.

For module renames, the rule frontmatter typically uses
`applies_if_modules_loaded` to gate, and the
`## Version Notes` body section explains the rename.

### Shape 2 — modparam shape change

A modparam exists across versions but takes different argument
shapes or default values. Example: a modparam that took a
single string in 3.4 and was extended to take a string-or-array
in 3.6.

For these, `applies_if_opensips_version` is appropriate, the
`Audit` section describes per-version detection logic, and the
`## Version Notes` body section explains the shape change.

### Shape 3 — CVE-gated rule

A rule exists specifically to flag a known-vulnerable version
range. Example: a rule that fires when OpenSIPS version is 3.5.x
where `x` is in a CVE-affected range *and* the relevant module
is loaded.

For these, `applies_if_opensips_version` carries the affected
range, the `Rationale` cites the CVE, and the
`## Additional References` section links to the advisory.

CVE-gated rules are often `severity: critical` and
`suppressible: false` (per `12_RULE_CATALOG_SCHEMA.md`'s
`suppressible` field). The intent: a known-active-exploit CVE
finding should not be silently dismissed by suppression.

### Shape 4 — Default behavior change

OpenSIPS defaults shift between releases. Example: a hardening-
hygiene directive defaults to disabled in 3.4 and to enabled in
3.6 — the rule fires for absence in 3.4 (where you must opt in)
and does not fire in 3.6 (where the default protects you).

For these, `applies_if_opensips_version` is upper-bounded
(e.g., `<3.6`), the rationale explains the default shift, and
the `## Version Notes` documents the version where the issue
became moot.

### Shape 5 — Deprecated directive

A directive supported across all current versions but
deprecated in the most recent release. Example: an older
syntax form that still works in 3.6 but generates a deprecation
warning at startup.

For these, the rule typically fires across all versions
(`applies_if_opensips_version` absent or broadly ranged), but
the `Remediation` includes a "preferred form" note steering
toward the non-deprecated alternative. Severity is usually
`low` or `info` — it is a hygiene concern, not a security
concern.

---

## Tier 4 — version overlay documents

Per the file manifest, three documents in `40_versions/` carry
release-level context:

- `40_versions/3.4.md` — 3.4 LTS specifics: known CVEs in
  release range, module set as of latest patchlevel, common
  3.4 → 3.5 migration concerns flagged at intake.
- `40_versions/3.5.md` — 3.5 specifics: same shape.
- `40_versions/3.6.md` — 3.6 LTS specifics: same shape, plus
  introduced features (e.g., `tls_wolfssl`).

These documents are *not* rules. They are context that the
advisor loads when the session's declared version matches, used
to enrich the report's Methodology section and to inform the
LLM's reasoning during semantic-contextual phase analysis (Layer
5d, `10_SKILL_STACK.md`).

A rule references a version overlay through its frontmatter
`references` array:

```yaml
references:
  - kind: internal
    path: 40_versions/3.5.md
    section: "§CVE-2024-XXXX"
```

The overlay is not loaded for every run — only when at least
one rule firing this run cites it, or when the session's version
is the matched version. This keeps progressive disclosure
working as designed (`10_SKILL_STACK.md` §Claude-skill
progressive disclosure).

---

## What happens when version detection fails

The intake protocol asks the user to declare their OpenSIPS
version (`20_INTAKE_PROTOCOL.md`). When the user provides it
explicitly, version detection is settled.

When the user does not (e.g., they paste a cfg without context
and decline the intake question), the advisor falls back to
inference:

1. Look for syntactic signals: directives or modules introduced
   in specific versions.
2. Compute the *narrowest* version range consistent with the
   observed syntax.
3. If the range is `≥3.4` (i.e., no narrowing possible),
   default to 3.5 — the middle of the supported range — and
   flag at intake.

The flag is a session-level warning recorded in the report's
methodology disclosure: "OpenSIPS version was inferred (3.5)
because no version was declared at intake. Findings tied to
version-specific behavior carry reduced confidence."

Version-specific rules with `applies_if_opensips_version` set
narrowly are downgraded to confidence `medium` when version is
inferred rather than declared, regardless of their default
confidence. Reasoning: the rule may be firing on a cfg whose
actual version is outside the gate, and the inference is not
strong enough to underwrite a high-confidence claim.

---

## What happens when version is unsupported

If the user declares an OpenSIPS version outside 3.4 / 3.5 /
3.6 (e.g., 2.4, 3.2, a future 4.0):

- Versions older than 3.4: the advisor declines to run. Rule
  applicability cannot be guaranteed; reporting on a cfg that
  the catalog does not know how to interpret would produce
  misleading findings.
- Versions newer than 3.6: the advisor runs with a warning
  surfaced at intake — "OpenSIPS version X is newer than this
  advisor (engine version Y, last validated against 3.6).
  Findings are best-effort." The report's methodology section
  carries the same disclosure.

The cutover from "best effort" to "supported" happens when a
new version is added to the rule catalog's
`engine_version_min/max` matrix and validated end-to-end
against the fixture set.

---

## Cross-references

- Per-rule version gate fields:
  `12_RULE_CATALOG_SCHEMA.md`.
- Where intake elicits the OpenSIPS version:
  `20_INTAKE_PROTOCOL.md`.
- Version overlay file structure:
  `40_versions/{3.4,3.5,3.6}.md` (Tier 4).
- Layer 4 filter logic:
  `10_SKILL_STACK.md` §Layer 4.
- Confidence downgrading on inferred version:
  `15_CONFIDENCE_AND_VERIFICATION.md`.
