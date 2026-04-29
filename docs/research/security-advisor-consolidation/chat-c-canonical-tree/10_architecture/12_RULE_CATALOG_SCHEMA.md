# OpenSIPS Security Advisor — Rule Catalog Schema

**Status.** Locked as of Phase 6a. Defines the file format for
every rule in `30_rules/`. Changes are breaking for existing rules
and require a coordinated catalog migration.

This document specifies the format, frontmatter fields, body
structure, naming convention, and validation rules for advisor
rule files. Every rule in the catalog conforms to this spec. Rule
authors in Phase 6b chats reference this document and the worked
exemplar in Appendix A; they do not improvise format.

The format is *Markdown with YAML frontmatter*, chosen for three
reasons:

1. **Human authorability.** Rule bodies are read and edited by
   security engineers, not just the engine. Markdown is the
   right surface.
2. **Engine consumability.** YAML frontmatter is parseable as
   structured metadata; the engine reads gates, severity, and
   references without parsing the body.
3. **Claude skill alignment.** The format matches the broader
   skill's progressive-disclosure pattern: the family `_index.md`
   loads first, individual rule files load only when needed,
   frontmatter previews are cheap.

Phase 5 methodology research validates this shape against
Semgrep's rule format, SonarQube's quality profile entries, and
the CIS Benchmark recommendation file structure
[P5 §TBD — "rule catalog file format conventions"].

---

## File anatomy

A rule file has three parts in fixed order:

```
┌──────────────────────────────┐
│  YAML frontmatter            │  Structured metadata (engine reads)
│  (between --- delimiters)    │
├──────────────────────────────┤
│                              │
│  Markdown body               │  Prose + examples (humans read,
│  (required H2 sections)      │  reporting layer renders)
│                              │
└──────────────────────────────┘
```

Both parts are required. A rule file with only frontmatter (no
body) or only body (no frontmatter) fails validation.

---

## Frontmatter — field specification

Frontmatter is YAML between two `---` delimiters at the top of the
file. Field order is conventional (this document's order); a parser
must accept any order.

### Required fields

These fields MUST be present on every rule. Validation failure on
absence is a hard error.

| Field | Type | Description |
|---|---|---|
| `id` | string | Globally unique rule ID. Format: `OSIPS-SEC-<FAMILY>-<NNN>`. Matches the filename. |
| `name` | string | Short slug, lowercase-hyphenated. e.g., `tls-verify-cert-disabled`. |
| `title` | string | Human-readable title, 1–120 chars. e.g., `"TLS verify_cert disabled"`. |
| `version` | string | Rule semver. Independent of advisor `engine_version`. |
| `module_family` | string | One of the 12 enum values (see below). |
| `phase` | string | One of `structural`, `value_pattern`, `dataflow_taint`, `semantic_contextual`. |
| `severity` | string | One of `critical`, `high`, `medium`, `low`, `info`. |
| `confidence` | string | Default confidence when this rule fires. One of `high`, `medium`, `low`. |
| `automated` | boolean | `true` if the rule runs without human input; `false` if it requires user clarification. |
| `short_description` | string | One-sentence summary, 1–200 chars, used in the catalog index. |

### Optional but recommended

These fields are populated whenever the rule has the information.

| Field | Type | Description |
|---|---|---|
| `engine_version_min` | string (semver) | Earliest advisor version this rule is compatible with. Default: `0.1.0`. |
| `engine_version_max` | string (semver) | Latest advisor version this rule is compatible with. Default: unbounded. |
| `applies_if_modules_loaded` | array<string> | Rule fires only if all listed OpenSIPS modules are loaded in the cfg. |
| `applies_if_opensips_version` | string (semver range) | Rule fires only if the detected OpenSIPS version matches the range (e.g., `">=3.4 <3.7"`, `">=3.5"`, `"<3.5"`). |
| `profile` | array<string> | Subset of `["L1", "L2"]`. Absence means the rule applies regardless of profile. |
| `security_severity` | number (0.0–10.0) | Numeric severity for downstream gating. Should match the band implied by the `severity` enum. |
| `cvss_v4_vector` | string | Default CVSS 4.0 vector. May be context-adjusted at finding emission. |
| `cwe` | array<string> | CWE IDs (`CWE-NNN` format). |
| `owasp` | array<string> | OWASP Top 10 or OWASP SIP entries. |
| `attack` | array<string> | MITRE ATT&CK technique IDs. |
| `tags` | array<string> | Free-form tags for filtering. |
| `references` | array<object> | Authoritative sources for this rule. See shape below. |
| `suppressible` | boolean | Default `true`. Set `false` to mark the rule as never-suppressible (active-exploit CVE-gated rules). See `23_SUPPRESSION_PROTOCOL.md`. |
| `fix_diff` | object | Structured remediation diff. Optional; if present, emitted as SARIF `fixes[]`. See shape below. |

### Field shapes

**`references` element.**
```yaml
references:
  - kind: internal
    path: 90_reference/01_master_vulnerability_reference.md
    section: "§3.2"
  - kind: external
    url: https://opensips.org/Documentation/...
    title: "OpenSIPS tls_mgm module reference"
```

**`fix_diff` shape.**
```yaml
fix_diff:
  description: "Enable cert verification"
  pattern: 'modparam\("tls_mgm",\s*"verify_cert",\s*0\)'
  replacement: 'modparam("tls_mgm", "verify_cert", 1)'
```

`pattern` is a regex matched against the cfg snippet;
`replacement` is the substitution. The advisor emits this as a
SARIF `fixes[].artifactChanges[].replacements[]` entry; the user
applies the diff manually (the advisor does not mutate the cfg per
charter non-goal "Automated config editing").

---

## Frontmatter — enum values

These enums are locked. Adding a value is a minor advisor
revision; removing or renaming a value is a major.

### `module_family`

Twelve values, lowercase, snake_case where compound:

```
auth
tls
injection
relay_and_routing
dos_defense
mi_exposure
media
stir_shaken
tracing_and_logging
identity_spoofing
config_hygiene
dispatcher_and_lb
```

### `phase`

Four values, mapping directly to detection-engine sub-phases per
`10_SKILL_STACK.md` §Layer 5:

```
structural          → 5a, deterministic, fast
value_pattern       → 5b, mostly deterministic
dataflow_taint      → 5c, hybrid, LLM adjudicates sanitizer adequacy
semantic_contextual → 5d, LLM-heavy, mandatory verification pass
```

### `severity`

Five values, defined in `02_GLOSSARY.md` §3:

```
critical
high
medium
low
info
```

### `confidence`

Three values, defined in `02_GLOSSARY.md` §3:

```
high
medium
low
```

### `profile`

Two values:

```
L1
L2
```

Absence of the `profile` field means the rule applies regardless of
profile. Presence of an empty array (`profile: []`) is invalid.

---

## Body — required H2 sections

The Markdown body has six required H2 sections in fixed order. The
engine and reporting layer index by H2 heading text — the headings
are normative.

### 1. `## Rationale`

**Required.** Why this is a finding. Distinct from
*recommendation* (which says what to do). Should answer: what is
the security concern, what is the threat model, what is the
attacker's gain if this is exploited.

Length: 1–3 paragraphs. Aim for the *security* layer, not the
*OpenSIPS mechanics* layer — the broader skill's modules reference
covers mechanics.

### 2. `## Default Value`

**Required.** What the safe default is. For value-pattern rules
this is concrete (`verify_cert: 1`). For absence rules it is the
directive that should be present (`mf_process_maxfwd_header()
called once early in request_route`).

For purely contextual rules where there is no single default, this
section may state "Context-dependent; see Audit." The section
heading is still required.

### 3. `## Audit`

**Required.** How to detect the issue. *Detection logic*, not
remediation. For each phase, the conventional content is:

- **`structural`** — Which directive must be present/absent in
  which logical location.
- **`value_pattern`** — Which directive value, against which
  pattern.
- **`dataflow_taint`** — Which sources flow to which sinks
  through which sanitizers.
- **`semantic_contextual`** — Which combination of cfg elements
  + intake context produces the concern.

The Audit section is what an LLM reads to perform detection. It
should be precise enough that two independent reviewers would
identify the same matches in the same cfg.

### 4. `## Remediation`

**Required.** What to do about it. Concrete, actionable, OpenSIPS-
specific. Reference the modules reference for syntax detail; this
section is about *what change to make*, not *how OpenSIPS works*.

If remediation is non-trivial — requires module load, version
upgrade, coordinated rollout — say so explicitly. Mark
upgrade-required remediations with the heading suffix
`(requires upgrade)`.

### 5. `## Example — BAD`

**Required.** A minimal cfg fragment exhibiting the issue. Real
OpenSIPS syntax, not pseudocode. Annotate with comments where
helpful.

```cfg
# BAD: cert verification disabled
modparam("tls_mgm", "verify_cert", 0)
```

### 6. `## Example — GOOD`

**Required.** The remediated form. Same shape as BAD, with the
fix applied.

```cfg
# GOOD: cert verification enabled
modparam("tls_mgm", "verify_cert", 1)
modparam("tls_mgm", "ca_list", "/etc/opensips/tls/ca.pem")
```

The pair of BAD and GOOD is the visual core of the rule. Reporting
renders them side-by-side or stacked with code-fence syntax
highlighting.

---

## Body — optional H2 sections

These sections appear after the required six, in the listed order.

### `## Version Notes`

**When required.** When the rule's behavior or remediation differs
across OpenSIPS 3.4 / 3.5 / 3.6.

**Format.** Bullet list, one bullet per version with a divergence:

```markdown
## Version Notes

- **3.4** — `tls` module monolithic; `verify_cert` lives in
  `modparam("tls", ...)` instead of `tls_mgm`. Update remediation
  accordingly when the cfg is 3.4.
- **3.6** — `tls_wolfssl` engine introduced; `verify_cert` works
  identically.
```

### `## False-Positive Considerations`

**When required.** When the rule has known false-positive shapes.
List them so reviewers can recognize and either suppress or treat
as `review_required`.

```markdown
## False-Positive Considerations

- Self-signed peer certificate intentional in lab/test environment.
  Suppress with reason; advisor will note in audit appendix.
- Custom CA bundle loaded via `ca_list` makes `verify_cert: 0` an
  error of declaration, not capability — but the rule still fires
  because the runtime check is the absence of verification, not
  the presence of a CA.
```

### `## Related Rules`

**When required.** When this rule has logical siblings the reader
should be aware of.

```markdown
## Related Rules

- `OSIPS-SEC-TLS-001` — TLS not enabled at all.
- `OSIPS-SEC-TLS-003` — weak cipher list permitted.
- `OSIPS-SEC-AUTH-007` — auth bypass possible via TLS client cert
  when verification is disabled.
```

### `## Additional References`

**When required.** When the rule cites sources beyond what fits in
the frontmatter `references` array. Markdown links permitted.

---

## Test fixture pointers

Rule files MAY declare pointers to fixture files that demonstrate
the rule's expected firing and non-firing behavior. Pointers
appear in a fenced YAML block under an optional H2 section
`## Test fixtures` (after the required body sections, in the
"optional H2" group). When pointers are present, the validator
checks that every referenced path exists and that anchored
expectations match the corresponding `.expected.json` file
(see `25_FIXTURE_SCHEMA.md` once authored, or Tier 5 README in the
interim).

Block shape:

```yaml
- type: vulnerable
  path: 50_fixtures/vulnerable/<file>.cfg
  expected_finding_anchor: F<N>           # finding anchor id in the .expected.json
- type: clean
  path: 50_fixtures/clean/<file>.cfg
- type: tricky                            # required if the rule declares fp_classes OR abstain_on
  path: 50_fixtures/tricky/<file>.cfg
  exercises_fp_class: <fp_class_id>       # for semantic-phase rules
  exercises_abstain_on: <opaque_category> # for dataflow-phase rules
```

**`exercises_fp_class`** asserts that the semantic judge
correctly recognizes the named known-benign reading and does not
emit a finding (or emits at reduced severity per the rule's
`fp_classes` declaration).

**`exercises_abstain_on`** asserts that the dataflow phase
correctly produces `kind: review_required` (not silent-pass and
not confirmed-vuln) when the taint path traverses an opaque
function listed in the rule's `abstain_on:` array. This is the
abstention contract: the rule must neither under-report (silent
pass through unknown sanitization) nor over-report (treat opaque
transformations as identity). Both failures are regressions.

Exactly one of `exercises_fp_class` or `exercises_abstain_on` is
set per `tricky` pointer, matching the rule's detection phase.
The two fields target different concepts and live in different
phases — see the detection-engine documentation for the semantic
vs. dataflow distinction.

A rule without at least one `vulnerable` pointer and one `clean`
pointer is **draft status only** — it cannot graduate to
`stable`. This is the test-discipline contract enforced by the
catalog validator; see `15_CONFIDENCE_AND_VERIFICATION.md` for
how status interacts with confidence emission.

---

## Naming convention

### Rule IDs

Format: `OSIPS-SEC-<FAMILY>-<NNN>`.

- `OSIPS-SEC-` is fixed. The `OSIPS-` prefix leaves room for
  future non-security advisors (`OSIPS-PERF-...`,
  `OSIPS-COMPAT-...`) without colliding.
- `<FAMILY>` is the module family in uppercase, with
  underscores preserved (`MI_EXPOSURE`, `RELAY_AND_ROUTING`).
- `<NNN>` is a zero-padded 3-digit serial within the family,
  starting at `001`.

### Filenames

The filename is the rule ID plus `.md`:
`OSIPS-SEC-AUTH-001.md`. Filenames live in the family directory:
`30_rules/auth/OSIPS-SEC-AUTH-001.md`.

### Uniqueness and reuse

Rule IDs are globally unique across the catalog. A rule ID is
**never reused** even when a rule is deleted. If
`OSIPS-SEC-TLS-002` is retired, the next TLS rule is
`OSIPS-SEC-TLS-008` (or whatever the next free serial is) — not
`-002`. This guarantees that an older SARIF file referencing a
rule by ID can never be silently misinterpreted by a newer
catalog.

Retired rules are preserved as tombstone files (frontmatter only,
`status: retired`, `retired_in: <engine_version>`,
`retired_reason: ...`) for one major-version cycle, then removed
from the file tree but their IDs remain reserved.

---

## Validation rules

A rule file is *valid* if and only if all of the following hold.
The validator runs at catalog load time (before any rule runs)
and at any time the catalog is modified.

1. **Frontmatter parses as YAML.** Malformed YAML fails.
2. **All required frontmatter fields are present.** Missing `id`,
   `name`, `title`, `version`, `module_family`, `phase`,
   `severity`, `confidence`, `automated`, or `short_description`
   fails.
3. **All enum values are in bounds.** `module_family`, `phase`,
   `severity`, `confidence`, `profile` values must be in their
   respective enums. Out-of-bound values fail.
4. **All required body sections are present in order.** The six
   required H2 headings (`Rationale`, `Default Value`, `Audit`,
   `Remediation`, `Example — BAD`, `Example — GOOD`) must appear
   in that order. Missing or out-of-order sections fail.
5. **`cvss_v4_vector` is a valid CVSS 4.0 vector if present.**
   Parsed against the CVSS 4.0 specification grammar. Invalid
   vectors fail.
6. **`security_severity` is in band with `severity`** when both
   are present. A rule with `severity: low` must not declare
   `security_severity: 8.5`. The bands are documented in
   `11_FINDING_SCHEMA.md` §"Severity → SARIF level mapping".
7. **`id` matches the filename.** A rule file
   `OSIPS-SEC-AUTH-001.md` must declare `id: OSIPS-SEC-AUTH-001`.
   Mismatch fails.
8. **`module_family` matches the directory.** A rule file in
   `30_rules/auth/` must declare `module_family: auth`. Mismatch
   fails.
9. **`applies_if_opensips_version`, if present, is a valid
   semver range.** Invalid range fails.
10. **`engine_version_min`, `engine_version_max`,
    `version`** are valid semver if present.
11. **`references[].kind` is one of `internal` or `external`.**
12. **For `kind: internal` references, `path` is required.**
    For `kind: external` references, `url` is required.
13. **`profile`, if present, is non-empty** and a subset of
    `["L1", "L2"]`.
14. **The required `short_description` is ≤ 200 characters.**
15. **The required `title` is 1–120 characters.**

A validation failure aborts catalog load with an error pointing
to the offending rule and field. The advisor will not run with an
invalid catalog.

---

## Appendix A — Worked exemplar

This is `OSIPS-SEC-AUTH-001.md`. New rule authors copy from this
file as the canonical example.

````markdown
---
id: OSIPS-SEC-AUTH-001
name: auth-db-plaintext-password-column
title: Plaintext password column used for digest authentication
version: 1.0.0
engine_version_min: 0.1.0
module_family: auth
applies_if_modules_loaded:
  - auth_db
phase: value_pattern
profile: [L1, L2]
severity: high
confidence: high
automated: true
security_severity: 7.5
cvss_v4_vector: CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N
cwe:
  - CWE-256
  - CWE-916
owasp:
  - A02:2021-Cryptographic Failures
attack:
  - T1552.001
tags:
  - auth
  - digest
  - password-storage
references:
  - kind: internal
    path: 90_reference/01_master_vulnerability_reference.md
    section: "§5.2 — Auth and Credentials"
  - kind: external
    url: https://opensips.org/Documentation/Modules/auth_db
    title: "OpenSIPS auth_db module reference"
suppressible: true
short_description: >
  auth_db configured to read plaintext passwords from the password
  column instead of the HA1 hash, exposing credentials at rest.
---

## Rationale

OpenSIPS digest authentication via `auth_db` reads either the
plaintext password (`password_column`) or the precomputed HA1
hash (`password_column_2`) from the user-credentials table. When
configured to read the plaintext password, the database stores
recoverable credentials at rest. Any database compromise — SQL
injection, backup leak, replica access by an unauthorized
operator — yields the user passwords directly.

The HA1 hash is itself a low-strength digest (MD5 of
`username:realm:password`), but it is not the password. Storing
HA1 instead of plaintext does not protect against active attack
on the auth flow; it does protect the credentials at rest, which
is a separate and meaningful boundary.

## Default Value

`password_column = "ha1"` (or equivalent column containing the
precomputed HA1 hash). Plaintext password column is never the
recommended configuration.

## Audit

Detect when `auth_db` is loaded and `password_column` modparam
references a column containing plaintext passwords. Common signals:

- `modparam("auth_db", "password_column", "password")` — column
  name suggests plaintext.
- `modparam("auth_db", "password_column", "plaintext_password")`
  — explicit naming.
- Schema documentation alongside the cfg references a `password`
  column of type VARCHAR/TEXT without hashing, when discoverable.

When `password_column_2` is set to an HA1 column and OpenSIPS is
configured to prefer it, the rule does not fire. When both are
configured but the cfg routes use `pv_auth_check()` against the
plaintext column, the rule fires.

## Remediation

1. Add an `ha1` column to the user-credentials table containing
   `MD5(username:realm:password)` for each user.
2. Backfill the column for existing users (requires plaintext
   passwords still being available — coordinate with a forced
   password reset if not).
3. Change the modparam:
   `modparam("auth_db", "password_column", "ha1")`.
4. Drop or rename the plaintext password column.
5. (L2 only) Consider migrating to a stronger digest scheme
   (SHA-256 via `auth_db` extensions where supported) or to JWT
   auth via `auth_jwt`.

## Example — BAD

```cfg
loadmodule "auth_db.so"
modparam("auth_db", "db_url", "mysql://opensips:secret@localhost/opensips")
modparam("auth_db", "password_column", "password")  # BAD: plaintext
modparam("auth_db", "calculate_ha1", 1)             # papers over storage
```

## Example — GOOD

```cfg
loadmodule "auth_db.so"
modparam("auth_db", "db_url", "mysql://opensips:secret@localhost/opensips")
modparam("auth_db", "password_column", "ha1")       # GOOD: HA1 hash
# calculate_ha1 not needed when reading precomputed HA1
```

## Version Notes

- **3.4 / 3.5 / 3.6** — `auth_db` modparam shape is identical
  across versions for this rule. No version-specific divergence.

## False-Positive Considerations

- If the column literally named `"password"` actually contains
  HA1 hashes (a misnaming), the rule fires falsely. Confirm by
  inspecting the schema; suppress with reason if confirmed.
- If `calculate_ha1` is enabled *and* the password column does
  contain plaintext, the rule still correctly fires:
  `calculate_ha1` does not protect storage, only the on-the-wire
  digest computation.

## Related Rules

- `OSIPS-SEC-AUTH-002` — `calculate_ha1` mismatched with column
  contents.
- `OSIPS-SEC-AUTH-007` — auth bypass via missing
  `pv_auth_check()` call.
- `OSIPS-SEC-CONFIG-003` — db_url contains plaintext password
  (separate concern, same family).
````
