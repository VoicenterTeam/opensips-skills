# 14 — Version Strategy

## Purpose

OpenSIPS Security Advisor maintains **one rule catalog covering OpenSIPS 3.4 LTS, 3.5, and 3.6 LTS**, with per-rule frontmatter metadata declaring version applicability. This spec defines how the `applies_if_opensips_version` field is written and how the engine interprets it.

The single-catalog approach was chosen over per-version catalogs because ~85% of rules are version-identical; duplicating them across three trees creates a maintenance burden disproportionate to the divergence.

## Frontmatter field: `applies_if_opensips_version`

### Syntax

`applies_if_opensips_version` is a string containing a version range expression. Three forms are accepted:

**1. Single range, semver-style.**

```yaml
applies_if_opensips_version: ">=3.2"
applies_if_opensips_version: ">=3.4 <3.7"
applies_if_opensips_version: ">=3.6.0 <3.6.4"
```

Operators: `>=`, `>`, `<=`, `<`, `=`. Whitespace between operators forms an AND (intersection): `">=3.4 <3.7"` matches versions ≥3.4 AND <3.7.

**2. OR-list, multiple ranges.**

```yaml
applies_if_opensips_version: ">=3.4.0 <3.4.7 || >=3.5.0 <3.5.4 || >=3.6.0 <3.6.4"
```

The `||` operator forms a disjunction: any matching sub-range satisfies the predicate. This form is required for CVE-gated rules where the fix has been backported to multiple LTS branches with different patched-in version numbers.

**3. Empty / unset.**

If `applies_if_opensips_version` is omitted, the rule applies to every version in the supported set (3.4 LTS, 3.5, 3.6 LTS). This is the default for the majority of rules — most cfg patterns are version-identical.

### Version comparison semantics

Versions are compared per semver 2.0 with one OpenSIPS-specific extension: pre-release identifiers (`-rc1`, `-alpha`) are treated as **lower** than the corresponding release. `3.6.4-rc1` < `3.6.4`. Build-metadata identifiers (`+sha.abc1234`) are ignored for ordering.

Two-component versions (`3.6`) are interpreted as `3.6.0` for comparison purposes. The expression `">=3.4"` matches `3.4.0` and every patch release.

### When to use which form

- **Single open range** (`">=3.2"`) for the majority of rules where the cfg pattern works identically across all maintained versions.
- **Single closed range** (`">=3.5 <3.7"`) for rules that depend on a feature introduced at a specific version (e.g., the modern `sqlops` structured primitives in 3.5+).
- **OR-list** for CVE-gated rules where the patched-in version differs per LTS branch. Update the OR-list as backport release numbers are confirmed; don't speculate.
- **Empty** for the foundational rules that apply universally.

### Rationale for OR-list

The alternative — splitting CVE rules into one rule per affected branch — was considered and rejected. It would produce three rules (e.g., `AUTH-004a`, `AUTH-004b`, `AUTH-004c`) for what is conceptually one CVE, multiplying the catalog's surface area. OR-list keeps the rule count proportional to vulnerability classes rather than to branch counts.

The cost is engine complexity: the version-range parser must handle disjunction. The cost was deemed acceptable given the clarity gain in the catalog.

## Per-rule version metadata interaction

Three frontmatter fields work together to gate rule applicability:

1. `applies_if_opensips_version` — the version range.
2. `applies_if_modules_loaded` — list of modules required for the rule to be relevant.
3. `engine_version_min` / `engine_version_max` — the advisor engine version range that supports this rule's detection logic.

A rule fires only when the cfg-under-audit's detected OpenSIPS version satisfies (1), the loaded modules include (2), and the running engine version satisfies (3).

## Detected version handling

The engine determines the cfg's OpenSIPS version from intake metadata. When intake cannot determine the version:

- Rules with `applies_if_opensips_version` empty (universal) still fire normally.
- Rules with a non-empty range emit at `confidence: medium` with `kind: review_required`, prompting the operator to confirm the version. The rule does NOT fire definitively because firing on "we couldn't determine if this applies" is a false-positive risk class.

Operators should always provide explicit version metadata at intake to avoid `review_required` cascades on version-conditional rules.

## Backport tracking

CVE-gated rules with OR-list ranges depend on accurate per-branch patched-in version numbers. These are tracked in `40_versions/3.4.md`, `40_versions/3.5.md`, and `40_versions/3.6.md`. When OpenSIPS announces a maintenance release that contains a security backport, the version overlay docs are updated and the affected rule's `applies_if_opensips_version` range is tightened.

The advisor should re-load rule definitions after each OpenSIPS maintenance-release announcement. Catalog updates are versioned per `12_RULE_CATALOG_SCHEMA.md`'s `version` frontmatter field.

## Worked examples

**Universal rule** — applies to every supported version:

```yaml
applies_if_opensips_version: ">=3.2"
```

(`>=3.2` is the conventional "everywhere" form. Pre-3.4 isn't actively maintained but the lower bound documents the historical applicability.)

**Feature-gated rule** — applies only on versions with the required primitive:

```yaml
applies_if_opensips_version: ">=3.5"
```

(For rules dependent on the modern `sqlops` module, IMS AKA support, etc.)

**CVE-gated rule, single branch** — applies only to vulnerable releases on one LTS line:

```yaml
applies_if_opensips_version: ">=3.6.0 <3.6.4"
```

(Used until backports are confirmed; gets widened to OR-list once they are.)

**CVE-gated rule, multi-branch with confirmed backports**:

```yaml
applies_if_opensips_version: ">=3.4.0 <3.4.7 || >=3.5.0 <3.5.4 || >=3.6.0 <3.6.4"
```

(The pattern for CVE-2026-25554 once 3.4 and 3.5 backport release numbers are announced.)
