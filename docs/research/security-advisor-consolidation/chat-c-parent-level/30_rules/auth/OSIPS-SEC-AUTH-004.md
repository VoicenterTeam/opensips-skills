---
id: OSIPS-SEC-AUTH-004
version: "1.0"
name: jwt-db-mode-cve
title: "auth_jwt with db_mode=1 on a version vulnerable to CVE-2026-25554"
module_family: auth
status: stable
introduced_in_engine_version: "0.1.0"

severity: critical
default_effort: M

cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: ["CWE-89"]
owasp: "A03:2021"
mitre_attack: ["T1190"]

description_short: |
  auth_jwt with db_mode enabled on OpenSIPS 3.1 through 3.6.4 (prior to
  commit 3822d33) allows JWT authentication bypass via SQL injection
  in jwt_db_authorize().

detection_phase:
  - structural
  - value_pattern
applies_if_opensips_version: ">=3.1, <3.6.4"
applies_if_modules_loaded: ["auth_jwt"]

cve:
  - id: CVE-2026-25554
    affected_versions: ">=3.1, <3.6.4"
    fixed_in: "3.6.4"
    cvss_v4_score: 8.3
    cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N"
    cwe: "CWE-89"

suppressible: false
---

# Detection

This rule fires when **all** of the following hold:

1. The `auth_jwt` module is loaded (`loadmodule "auth_jwt.so"`).
2. The `db_mode` modparam is set to a non-zero value, indicating database-backed JWT key lookup is active. (`db_mode=0` uses `jwt_script_authorize()` with script-provided keys and is NOT affected by this CVE.)
3. The OpenSIPS version is in the vulnerable range — `>=3.1, <3.6.4` for the 3.6 line, with corresponding pre-patch ranges on the 3.4 and 3.5 lines.

The rule does not fire when:
- `auth_jwt` is loaded but `db_mode` is 0 (or omitted, since 0 is the default).
- The OpenSIPS version is at or past the patched version (3.6.4 on the 3.6 line; verify the backport patchlevel against the OpenSIPS release notes for 3.4.x and 3.5.x).
- `auth_jwt` is not loaded at all.

This is a CVE-gated rule: severity reflects the CVE's published CVSS, and the rule's `suppressible: false` flag prevents accidental silencing during operator triage. Fixing the underlying issue (upgrade or `db_mode=0`) is the only way to remove the finding.

# Evidence patterns

```yaml
- pattern_kind: loadmodule_match
  module: "auth_jwt"
  bind:
    - location: $loadmodule_loc

- pattern_kind: modparam_match
  module: "auth_jwt"
  param: "db_mode"
  value:
    not_eq: "0"
  bind:
    - location: $db_mode_loc
    - value_text: $db_mode_value

- pattern_kind: version_match
  range: ">=3.1, <3.6.4"
  bind:
    - version: $detected_version
```

The three patterns are AND'd. The version-match predicate gates the rule against the published vulnerable range; rules running on patched versions skip via `applies_if_opensips_version`.

# Rationale

Per AISLE Research's published writeup (January 2026, fix landed February 2, 2026), the function `jwt_db_authorize()` in `modules/auth_jwt/authorize.c` extracts the JWT's `tag` claim *before* signature verification, then incorporates the unescaped value directly into a SQL query against the JWT profiles/secrets tables. An attacker supplies a crafted JWT with a malicious `tag` claim that breaks out of the query string literal and manipulates the join semantics, allowing them to select any signing key from the table — including a key under the attacker's control — which they then use to mint a JWT that passes signature verification.

The end result is **JWT authentication bypass**: an attacker mints a token that the server validates as authentic, then uses it to impersonate any identity in the JWT profiles table.

**Threat model.** Pre-authentication, network-level attacker who can send SIP messages to the listener. No prior credentials required. The vulnerable code path is reachable on every deployment that exposes a SIP listener (UDP, TCP, or TLS) and accepts JWT-authenticated requests via `jwt_authorize()` with `db_mode` enabled.

**Severity.** Critical-severity CVE per the rule's severity setting, but published CVSS is 8.3 (high), reflecting `VC:H/VI:L/VA:N` — high confidentiality impact (impersonation enables account compromise), low integrity impact (the bypass enables identity manipulation but not direct DB writes via this path), no availability impact. The Attack Complexity is rated as `AT:P` (present — the attacker needs some knowledge of the deployment's tag-naming convention for reliable exploitation).

# Recommendation template

Two paths, in priority order.

**Path 1 — Upgrade to a patched version.**

```opensips-cfg
# No cfg change needed. Upgrade OpenSIPS to:
#   3.6.4+ on the 3.6 line
#   The corresponding backport patchlevel on 3.4.x or 3.5.x
#   (consult OpenSIPS release notes for the exact patched version)
```

**Path 2 — Switch to script-loaded JWT keys (interim mitigation).**

```opensips-cfg
# GOOD — script-loaded mode, NOT affected by CVE-2026-25554
loadmodule "auth_jwt.so"
modparam("auth_jwt", "db_mode", 0)

request_route {
    if (is_method("INVITE|MESSAGE")) {
        # Provide the JWT signing key from script context.
        # Key material loaded from a file or environment variable
        # that the cfg trusts.
        $var(jwt_key) = ...;
        if (!jwt_script_authorize("$var(jwt_key)", "HS256")) {
            send_reply(403, "Forbidden");
            exit;
        }
    }
}
```

Path 2 sidesteps the vulnerable `jwt_db_authorize()` code path entirely. It does require operational changes (key distribution, rotation, etc., previously handled via the database), so Path 1 is preferred when feasible.

# References

- `90_reference/01_master_vulnerability_reference.md#cve-inventory` — internal CVE record with full details.
- `90_reference/02_enable_security_gap_analysis.md#post-audit-findings` — placement in the broader OpenSIPS vulnerability landscape.
- AISLE Research writeup: `https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass`
- VulnCheck advisory (verified 2026-04-29): `https://www.vulncheck.com/advisories/opensips-auth-jwt-sql-injection-enables-jwt-authentication-bypass`
- NVD record: `https://nvd.nist.gov/vuln/detail/CVE-2026-25554`
- Fix commit: `3822d33` in OpenSIPS GitHub.

# Test fixtures

```yaml
- type: vulnerable
  path: 50_fixtures/vulnerable/vulnerable-mixed.cfg
  expected_finding_anchor: F1
  notes: |
    The cfg loads auth_jwt.so and sets db_mode=1, with declared version
    3.6.2 (in the vulnerable range). Rule fires deterministically as
    a confirmed vulnerability, severity critical, confidence high.
    Per the .expected.json, must_cite_cve: CVE-2026-25554.

- type: clean
  path: 50_fixtures/tricky/false-positive-cvss-gate.cfg
  notes: |
    The cfg loads auth_jwt.so AND sets db_mode=1 — same structural
    pattern as the vulnerable fixture — BUT declares version 3.6.5,
    which is past the 3.6.4 fix. Rule must NOT fire because the
    version-gate excludes it. This is the inverse-test contract.

- type: clean
  path: 50_fixtures/clean/clean-l1-enterprise-pbx.cfg
  notes: |
    The cfg does NOT load auth_jwt at all. Rule is skipped via
    applies_if_modules_loaded; reason recorded in Appendix D as
    "module auth_jwt not loaded".
```
