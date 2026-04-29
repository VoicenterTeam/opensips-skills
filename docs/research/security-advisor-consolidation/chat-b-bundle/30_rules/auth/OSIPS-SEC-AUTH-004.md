---
id: OSIPS-SEC-AUTH-004
name: jwt-db-mode-cve-2026-25554
title: auth_jwt configured in DB mode on a vulnerable OpenSIPS version (CVE-2026-25554)
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth_jwt]
applies_if_opensips_version: ">=3.1.0 <3.6.4"
phase: [structural, value_pattern]
profile: [L1, L2]
automated: true
suppressible: false

severity: critical
confidence: high
security_severity: 9.8
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-89, CWE-287]
owasp: ["A03:2021-Injection", "A07:2021-Identification and Authentication Failures"]
attack: [T1190, T1078]
tags: [authentication, jwt, sql-injection, cve, auth-bypass]

references:
  - https://nvd.nist.gov/vuln/detail/CVE-2026-25554
  - https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass
  - https://github.com/OpenSIPS/opensips/pull/3807
  - https://opensips.org/docs/modules/3.6.x/auth_jwt.html
  - 90_reference/01_master_vulnerability_reference.md#section-5
  - 90_reference/02_enable_security_gap_analysis.md#d-13

short_description: |
  Pre-patch OpenSIPS (3.1.0 through 3.6.3, plus pre-backport 3.4.x and 3.5.x) loaded with
  auth_jwt and configured with a db_url modparam is exposed to CVE-2026-25554: an
  attacker-controlled JWT claim is interpolated into a SQL query before signature verification,
  yielding pre-authentication SQL injection and full authentication bypass.
---

## Rationale

CVE-2026-25554 (AISLE deep-dive, Feb 2026) is a pre-authentication SQL injection in the auth_jwt module's database lookup path. When auth_jwt is configured with `db_url` (DB mode), claims from an inbound JWT are read *before* the JWT signature is verified, then concatenated into a SQL query without escaping. An attacker submits a forged token whose `tag` (or related claim) contains SQL syntax, and the resulting query alters the auth decision — typically returning a row that satisfies the auth check, granting the attacker an authenticated session as any chosen identity.

Three properties compound the severity:

1. **No authentication required.** The bug fires on the very token the attacker submits; no prior credentials are needed.
2. **No special script placement required.** Any cfg that reaches `jwt_db_authorize()` exposes the code path.
3. **Trust boundary inverted at the C level.** The module treated decoded claim text as trusted context for query construction. Other claims — notably `kid` — carry the same class of risk; this rule covers DB-mode specifically, see `OSIPS-SEC-AUTH-008` (jwt-kid-injection) for the broader claim-injection pattern.

The fix lands in 3.6.4 and is being backported to the 3.4 LTS and 3.5 maintenance branches from Feb 2026 onward. Upgrading is the only complete remediation; migrating to `jwt_script_authorize()` (which does not consult the DB) avoids the vulnerable code path on any version.

Sources: Phase 2 master vulnerability reference §5.4; Phase 3 gap analysis §D.13; AISLE writeup; OpenSIPS PR #3807.

## Default Value

`db_url` is unset by default in auth_jwt. The vulnerable configuration requires deliberately loading auth_jwt *and* setting `db_url`, so this rule has zero default-config false-positive exposure — it only fires when DB mode is explicitly enabled.

## Audit

The rule fires when **all three** signals are present:

1. `loadmodule "auth_jwt.so"` (or `loadmodule "auth_jwt"`) is present.
2. `modparam("auth_jwt", "db_url", "...")` is set to any non-empty value.
3. The detected OpenSIPS version falls in the vulnerable range:
   - `>=3.6.0, <3.6.4` for the 3.6 LTS line, OR
   - `>=3.5.0, <3.5.<patched>` for the 3.5 line, OR
   - `>=3.4.0, <3.4.<patched>` for the 3.4 LTS line, OR
   - any release in the 3.1, 3.2, 3.3 lines (all EOL — no fix planned).

Exact patched-version numbers for the 3.4 and 3.5 backports are tracked in `40_versions/3.4.md` and `40_versions/3.5.md` and updated as the OpenSIPS team announces them. If intake cannot determine the OpenSIPS version, the rule emits as `kind: review_required` with `confidence: medium` rather than firing as a confirmed CVE — version misdetection is the chief false-positive risk for this rule.

The presence of a `jwt_db_authorize()` call in any route is corroborating evidence and is added to `evidence.trace`, but is not required for the rule to fire — loading the module with `db_url` set already exposes the vulnerable code path.

## Remediation

**Preferred — upgrade.** Move to OpenSIPS 3.6.4 (or the patched 3.4.x / 3.5.x release on the maintenance branch). The fix sanitizes claim values before interpolation. After upgrade, this rule's CVE gate no longer matches and the finding clears automatically on re-run.

**If upgrade is blocked — migrate off DB mode.** Replace `jwt_db_authorize()` with `jwt_script_authorize(token, key, out)`, which validates the JWT against a key supplied directly by the script. This avoids the vulnerable code path entirely on any version.

Migration steps:

1. Move signing keys (or the JWKS for asymmetric algorithms) into a 0600-permissioned file readable only by the OpenSIPS user.
2. Load the key into a script variable at startup (`startup_route`) — via cachedb_local prefill, env-substituted modparam, or a one-time `rest_get` against an internal JWKS endpoint with response caching.
3. Replace each `jwt_db_authorize()` call with `jwt_script_authorize($hdr(Authorization), $var(jwt_key), $var(jwt_payload))`.
4. Remove `modparam("auth_jwt", "db_url", ...)` once no DB calls remain.
5. Drop the JWT-keys table from the database if it was the sole consumer.

**Do not** rely on input filtering at the SIP script layer (e.g., regex-stripping JWTs in `request_route`) as a substitute. The vulnerable parser runs inside the module before any cfg-level filter executes.

## Example — BAD

```opensips
# OpenSIPS 3.6.2 — vulnerable to CVE-2026-25554
loadmodule "auth_jwt.so"

modparam("auth_jwt", "db_url", "mysql://opensips:secret@db/opensips")
modparam("auth_jwt", "jwt_table", "jwt_keys")

route {
    if (is_method("INVITE")) {
        if (!jwt_db_authorize($hdr(Authorization), $var(payload), $var(user))) {
            send_reply(401, "Unauthorized");
            exit;
        }
        # $var(user) is now an attacker-chosen identity if a malicious JWT was crafted.
        t_relay();
    }
}
```

## Example — GOOD

### Option A: upgrade to a patched version, DB mode retained

```opensips
# OpenSIPS 3.6.4 — patched. Same cfg, fixed underlying parser.
loadmodule "auth_jwt.so"

modparam("auth_jwt", "db_url", "mysql://opensips:secret@db/opensips")
modparam("auth_jwt", "jwt_table", "jwt_keys")

# Same routing as before — the fix is in the module's claim handling.
```

### Option B: DB mode eliminated (works on any version)

```opensips
# auth_jwt in script mode — DB-mode code path never reached.
loadmodule "auth_jwt.so"
# Note: db_url intentionally NOT configured.

route {
    if (is_method("INVITE")) {
        # In production, $var(jwt_key) is loaded at startup from a 0600 file
        # or env-injected — do not embed it inline in the cfg.
        if (!jwt_script_authorize($hdr(Authorization), $var(jwt_key), $var(payload))) {
            send_reply(401, "Unauthorized");
            exit;
        }
        t_relay();
    }
}
```

## Version Notes

| Version line | Vulnerable range | Patched in |
|---|---|---|
| 3.6 LTS | 3.6.0 – 3.6.3 | 3.6.4 |
| 3.5 | 3.5.0 – pre-backport | see `40_versions/3.5.md` |
| 3.4 LTS | 3.4.0 – pre-backport | see `40_versions/3.4.md` |
| 3.3 and earlier | All releases | EOL — upgrade required |

The `applies_if_opensips_version` frontmatter range MUST be updated as backport release numbers are confirmed for the 3.4 and 3.5 lines. The advisor should re-load this rule after each OpenSIPS maintenance release announcement.

## False-Positive Considerations

- The rule does NOT fire on 3.6.4 or later even if `db_url` is set — the vulnerability is fixed in the module, not in the cfg.
- The rule does NOT fire if auth_jwt is loaded but `db_url` is unset. Script mode is safe on every version.
- Custom forks of auth_jwt (in-house patches that pre-date the upstream fix) cannot be detected from the cfg alone. The advisor states explicitly that fork detection is out of scope and offers a suppression path with `justification="in-tree backport applied"`.
- If intake cannot determine the OpenSIPS version, the rule emits as `review_required` rather than firing — version misdetection is the chief false-positive risk for this rule and the verification pass must catch it before emission.

## Related Rules

- `OSIPS-SEC-AUTH-007` (jwt-alg-none) — JWT validation bypass via algorithm confusion; orthogonal to CVE-2026-25554 but applies on the same module.
- `OSIPS-SEC-AUTH-008` (jwt-kid-injection) — same class of unescaped-claim-in-SQL bug as CVE-2026-25554, but for `kid` headers and applicable beyond DB mode.
- `OSIPS-SEC-INJECTION-001` (sql-inj-avp-db-query) — generic SQLi class; CVE-2026-25554 is one instance but is severe enough to warrant its own dedicated rule.

## Additional References

- CVE-2026-25554 NVD entry
- AISLE deep-dive: https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass
- OpenSIPS PR #3807 (the upstream fix)
- Phase 2 master vulnerability reference §5.4 (auth_jwt before CVE-2026-25554 fix)
- Phase 3 gap analysis §D.13 (JWT attack surface beyond CVE-2026-25554)
- CWE-89 — Improper Neutralization of Special Elements used in an SQL Command
- CWE-287 — Improper Authentication
- OWASP A03:2021 — Injection; A07:2021 — Identification and Authentication Failures
