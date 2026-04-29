---
id: OSIPS-SEC-INJECTION-001
version: "1.0"
name: sql-inj-avp-db-query
title: "SIP-sourced taint reaches avp_db_query without sanitization"
module_family: injection
status: stable
introduced_in_engine_version: "0.1.0"

severity: high
default_effort: S

cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: ["CWE-89"]
owasp: "A03:2021"
mitre_attack: ["T1190"]

description_short: |
  A SIP-sourced pseudovariable flows into the SQL string of avp_db_query
  without traversing a known string-escape transformation.

detection_phase:
  - dataflow
applies_if_opensips_version: ">=3.0, <4.0"
applies_if_modules_loaded: ["avpops"]

abstain_on:
  - perl_exec_simple
  - perl_exec
  - python_exec
  - lua_exec
  - http_query
  - rest_get
  - rest_post
severity_would_be: high

suppressible: true
---

# Detection

This rule fires when a SIP-sourced pseudovariable — typically `$fU`, `$fu`, `$rU`, `$ru`, `$tU`, `$tu`, `$si`, or any `$hdr(*)` value — flows into the first argument of `avp_db_query()` (the SQL query string) without passing through a transformation in the `string_escape` sanitizer class.

The SIP source variables enumerated above are taint sources by definition: they carry values populated from the inbound SIP message, which is attacker-controllable on any deployment that accepts unauthenticated SIP traffic (and even on authenticated ones — the credential check happens after these variables are populated).

The rule emits as `kind: vulnerability` (confirmed) when the dataflow path from source to sink contains zero sanitizers. The rule emits as `kind: review_required` when the path traverses a function listed in `abstain_on:` — typically a Perl, Python, Lua, or external-HTTP call — because the engine cannot statically reason about whether the opaque call is sanitizing the input. See `15_CONFIDENCE_AND_VERIFICATION.md` § "Why review_required exists".

The rule does not fire when:
- The pseudovariable is assigned from the source into a local AVP through a `string_escape`-class transformation first, e.g. `$avp(safe) = $(fU{s.escape.common})`, before being interpolated into the query.
- The query uses a parameterized form via `cachedb_query` or other parameterized APIs (those have their own rules).
- The SIP source variable in question is not in the recognized taint-source list. Custom-named AVPs assigned from non-SIP sources are not taint sources for this rule.

# Evidence patterns

```yaml
- pattern_kind: dataflow_query
  sources:
    - $fU
    - $fu
    - $rU
    - $ru
    - $tU
    - $tu
    - $si
    - $hdr(*)
  sinks:
    - function: "avp_db_query"
      arg: 0
  must_not_pass_through_any_of:
    - sanitizer_class: "string_escape"
  bind:
    - location: $sink_location
    - source_node: $source_var
    - sink_function: $sink_fn
```

The `must_not_pass_through_any_of` predicate references the `string_escape` class from `90_reference/sanitizer_registry.yaml`. As of v1.0 the registry seeds this class with the four OpenSIPS-native transforms: `s.escape.common`, `s.escape.user`, `s.escape.param`, `s.escape.param_strict`. If a path traverses any of those, the rule does not fire. If a path traverses an opaque transformation (Perl, etc.), the engine emits `review_required` per `14_DETECTION_ENGINE.md` § "Opaque transformations and review_required".

The `applies_if_modules_loaded: ["avpops"]` gate ensures the rule is skipped on cfgs that don't load `avpops` (where `avp_db_query` is unavailable as a function). This avoids "rule executed against irrelevant cfgs" noise in `Appendix D` diagnostics.

# Rationale

`avp_db_query()` interpolates its first argument as a literal SQL string, executed against the configured database. There is no parameterized-query path through `avp_db_query`. When a pseudovariable is interpolated into the SQL string, the database engine sees the variable's runtime value as part of the query text — quote characters, semicolons, and SQL keywords are all interpreted normally.

Threat model: an attacker controls the value of a SIP source variable by crafting the inbound SIP request. For `$fU` (the From URI user part), the attacker sets the From header. For `$hdr(X-Custom)`, the attacker sets the corresponding header. The attacker's crafted value reaches the SQL string verbatim. A canonical exploit is:

```
From: <sip:1234'; DROP TABLE dialplan; --@example.com>
```

The resulting query is:
```sql
SELECT route FROM dialplan WHERE prefix='1234'; DROP TABLE dialplan; --'
```

Severity is **high** rather than critical because exploitation requires the attacker to reach the SIP listener (network precondition, common but not universal) and the impact is database compromise rather than full system compromise. The CVSS 4.0 vector reflects: network attack, low complexity, no auth, no user interaction, high confidentiality and integrity impact (database read and write), no direct availability impact (the database is still up after the attack — though follow-on availability impact is plausible).

OWASP A03:2021 (Injection) and CWE-89 (SQL Injection) are the canonical mappings.

# Recommendation template

The fix is to escape the SIP source value before interpolating it into the SQL string. OpenSIPS provides four native string-escape transformations; for `avp_db_query` use `s.escape.common`:

```opensips-cfg
# GOOD
$avp(safe_fU) = $(fU{s.escape.common});
avp_db_query("SELECT route FROM dialplan WHERE prefix='$avp(safe_fU)'",
             "$avp(route)");
```

The transformation escapes the SQL-special characters (`'`, `"`, `\`, NUL, CR, LF) so the attacker-controlled value cannot break out of the surrounding string literal.

**Do not adopt Kamailio idioms.** A common LLM-generated mistake is writing `$(fU{s.replace,...})` or invoking helpers that exist on Kamailio but not on OpenSIPS, or that exist on both with different semantics. The four OpenSIPS-native transforms are: `s.escape.common`, `s.escape.user`, `s.escape.param`, `s.escape.param_strict`. Use these. See `90_reference/01_master_vulnerability_reference.md#sql-injection` for the full transformation reference.

**Stronger alternative.** Where supported, parameterized queries via `cachedb_query` or `db_query` with bound parameters remove the question entirely. They are not always available depending on which DB module is loaded, but where they are, they are preferred.

**For `review_required` cases (Perl/Python/etc. sanitizer in the path).** The engine cannot determine whether the opaque function is a sound sanitizer. The reviewer's job is to read the external source, confirm it applies an allowlist (`[a-zA-Z0-9._-]{1,64}` or similar) or a complete escape, and either:
- Replace the opaque sanitizer with the native `s.escape.*` transformation (preferred — auditable in-cfg).
- Suppress the finding with a justification block citing the reviewed external file's git SHA, per `23_SUPPRESSION_PROTOCOL.md`.

# References

- `90_reference/01_master_vulnerability_reference.md#sql-injection` — internal SQL injection threat model and OpenSIPS-native escape transformations.
- `90_reference/sanitizer_registry.yaml` — the `string_escape` class definition this rule references.
- OpenSIPS `avpops` module documentation — see https://opensips.org/docs/modules/3.5.x/avpops.html (mirror at `90_reference/external_sources.md#opensips-avpops`).
- OpenSIPS pseudovariable transformations — see https://opensips.org/docs/script-cookbooks/transformations.html (mirror at `90_reference/external_sources.md#opensips-transformations`).
- CWE-89 (SQL Injection): https://cwe.mitre.org/data/definitions/89.html
- OWASP A03:2021 (Injection): https://owasp.org/Top10/A03_2021-Injection/

# Test fixtures

```yaml
- type: vulnerable
  path: 50_fixtures/vulnerable/vulnerable-mixed.cfg
  expected_finding_anchor: F4
  notes: |
    The cfg interpolates $fU directly into avp_db_query's SQL string
    with no transformation. Rule fires deterministically as a confirmed
    vulnerability with confidence high.

- type: clean
  path: 50_fixtures/clean/clean-l1-enterprise-pbx.cfg
  notes: |
    The cfg assigns $avp(safe_fU) = $(fU{s.escape.common}) and uses
    the safe variable in avp_db_query. Path traverses a string_escape
    sanitizer; rule does not fire.

- type: tricky
  path: 50_fixtures/tricky/custom-sanitizer.cfg
  exercises_abstain_on: perl_exec_simple
  notes: |
    The cfg routes $fU through perl_exec_simple("My::Sanitize::clean_username", ...)
    before reaching avp_db_query. The Perl handler is opaque to the engine.
    Rule emits as kind: review_required (severity_would_be: high), confidence
    low, verification_status: unchecked. This is the abstention contract —
    silent pass and confirmed-vuln are both regressions.
```
