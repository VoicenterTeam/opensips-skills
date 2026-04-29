---
id: OSIPS-SEC-AUTH-008
name: jwt-kid-injection
title: JWT kid (or other claim) flows into a SQL/file/REST sink without sanitization
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth_jwt]
applies_if_opensips_version: ">=3.1"
phase: [dataflow_taint, semantic_contextual]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: medium
security_severity: 9.0
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:L/SC:N/SI:N/SA:N"
cwe: [CWE-20, CWE-89, CWE-22, CWE-915]
owasp: ["A03:2021-Injection"]
attack: [T1190]
tags: [authentication, jwt, kid-injection, taint, sqli, path-traversal]

references:
  - https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass
  - https://datatracker.ietf.org/doc/html/rfc8725
  - https://cwe.mitre.org/data/definitions/915.html

short_description: |
  An attacker-controlled JWT claim — typically the kid header but applicable to any
  unverified claim — flows from $jwt(...) into a sensitive sink (avp_db_query, file
  read, rest_get URL) without escaping. Same vulnerability class as CVE-2026-25554
  but generalizes beyond auth_jwt's DB mode.
---

## Rationale

CVE-2026-25554 demonstrated that decoded JWT claim text was being interpolated into a SQL query before signature verification, in `auth_jwt`'s DB-mode lookup path. The class of bug — "decoded but unverified claim flows into a privileged sink" — generalizes:

- **kid → SQL.** Operators routinely use the `kid` header to look up a signing key by identifier. If `$jwt(header.kid)` is concatenated into an `avp_db_query` template without escaping, the attacker controls a SQL fragment in a pre-auth code path.
- **kid → file path.** Some deployments use `kid` to select a per-tenant key file. If `$jwt(header.kid)` flows into a `file_read()` or `cache_load_file()` call without character whitelisting, the attacker traverses to arbitrary readable files (`../etc/opensips/secrets.cfg`, etc.).
- **jku/x5u → REST URL.** `jku` and `x5u` are URLs the verifier is expected to fetch the public key from. If passed to `rest_get($jwt(header.jku))` without an allow-list, the attacker controls the fetch target — SSRF, key substitution, or both.
- **Custom claims → any sink.** Any claim consumed before signature verification carries this risk. The `tag` claim in the original CVE is one instance.

The shared structural property is "decoded JSON value, attacker-supplied, used in a query/path/URL before the verification step rejects forgeries." The remediation is consistent across sink types: validate the claim against a strict allow-list (or a regex constraining shape) *before* using it, and only consume verified claims in privileged sinks.

This rule is dataflow-aware: it traces `$jwt(...)` pseudo-variables to known sink primitives (`avp_db_query`, `file_read`, `rest_get`, `exec`, `cache_*` family) across script flow. Because the analysis spans inline route calls and helper functions, false-negatives are possible on sufficiently obfuscated control flow; the engine emits `review_required` rather than firing on routes where the trace's certainty is below threshold.

Sources: Phase 3 gap analysis §D.13 (JWT attack surface beyond CVE-2026-25554); AISLE CVE-2026-25554 deep-dive (origin pattern); RFC 8725.

## Default Value

Not applicable — this rule checks data flow patterns rather than parameter defaults. The auth_jwt module has no defaulted "use kid as a SQL value" behavior; the operator must script the flow explicitly.

## Audit

The rule fires when **all** of the following are true on any code path:

1. A `$jwt(...)` pseudo-variable (typically `$jwt(header.kid)`, `$jwt(payload.<claim>)`, or `$jwt(header.jku)`) is read into a script variable.
2. That variable subsequently flows into one of the following sinks:
   - `avp_db_query()`, `db_query()`, `sqlops`-family functions, or any DB-query primitive without `s.escape.common` or equivalent.
   - File-read primitives (`file_read`, `cache_load_file`, `inc_file`-style includes computed at runtime).
   - REST or HTTP fetch primitives (`rest_get`, `rest_post`, `rest_put`) without a host/path allow-list applied beforehand.
   - `exec`-family primitives.
3. The flow occurs *before* signature verification — i.e., before `jwt_script_authorize()` or `jwt_db_authorize()` returns success.

The third condition is critical: the same claim used *after* successful signature verification is normally safe (the attacker cannot forge claims under a verified token). The rule's confidence drops to `medium` when the engine cannot determine ordering relative to the verify call; in those cases it emits `review_required`.

## Remediation

1. Treat every claim read before verification as taint-marked. Apply a strict input-validation step:
   - For identifiers that should match a known set (kid → key name): regex `^[a-zA-Z0-9_-]{1,64}$`, then look up against an in-memory map of known keys.
   - For URLs (jku, x5u): scheme allow-list (`https://` only), host allow-list (your IdP's domain, hard-coded or modparam-injected), reject everything else.
   - For SQL values: never interpolate; use parameterized queries (`avp_db_query` with placeholder syntax) and pass the claim as a bound parameter, never as a query-text fragment.
2. Defer all use of any claim to *after* signature verification where possible. The signing key must be selectable without consulting an attacker-controlled value — typically via a small in-cfg key map or a DB lookup whose key is the verified `iss` claim, not the unverified `kid`.
3. If `kid`-based key selection is unavoidable, validate `kid` shape strictly before lookup. Use a parameterized DB lookup whose result is the key bytes; do not echo `kid` into any other context.
4. For `rest_get` / `rest_post` against `jku` or `x5u`: never pass these directly. Compare against a static URL allow-list and reject mismatches.
5. Run with the verification-pass critique enabled (`review_required` emission for ambiguous flows) — the rule deliberately abstains rather than firing on uncertain traces, and the operator should review every abstention.

## Example — BAD

### kid as SQL fragment

```opensips
loadmodule "auth_jwt.so"
loadmodule "avpops.so"
loadmodule "db_mysql.so"

modparam("avpops", "db_url", "mysql://opensips:secret@db/opensips")

route {
    if (is_method("INVITE")) {
        # Read kid before verification — attacker-controlled
        $var(kid) = $jwt(header.kid);

        # Interpolate directly into SQL template — pre-auth SQLi
        avp_db_query("SELECT key FROM jwt_keys WHERE kid='$var(kid)'", "$avp(jwtkey)");
        $var(jwt_key) = $avp(jwtkey);

        if (!jwt_script_authorize($hdr(Authorization), $var(jwt_key), $var(payload))) {
            send_reply(401, "Unauthorized");
            exit;
        }
        t_relay();
    }
}
```

### kid as file path

```opensips
route {
    if (is_method("INVITE")) {
        $var(kid) = $jwt(header.kid);
        # Path traversal: $var(kid) = "../etc/opensips/secrets.cfg" reads arbitrary files
        $var(jwt_key) = $cache(local=>$var(kid));   # if cache prefilled from filesystem with kid as filename
        if (!jwt_script_authorize($hdr(Authorization), $var(jwt_key), $var(payload))) {
            send_reply(401, "Unauthorized");
            exit;
        }
        t_relay();
    }
}
```

## Example — GOOD

```opensips
loadmodule "auth_jwt.so"
loadmodule "avpops.so"

route {
    if (is_method("INVITE")) {
        $var(kid) = $jwt(header.kid);

        # Validate kid shape strictly — alnum + dash/underscore, length-bounded
        if ($var(kid) == null || !($var(kid) =~ "^[a-zA-Z0-9_-]{1,64}$")) {
            send_reply(401, "Bad token");
            exit;
        }

        # Parameterized DB lookup — kid bound as parameter, never interpolated
        avp_db_query("SELECT pubkey FROM jwt_keys WHERE kid=?",
                     "$var(kid)", "$avp(jwtkey)");
        if ($(avp(jwtkey)) == null) {
            send_reply(401, "Unknown key");
            exit;
        }
        $var(jwt_key) = $avp(jwtkey);

        if (!jwt_script_authorize($hdr(Authorization), $var(jwt_key), $var(payload))) {
            send_reply(401, "Unauthorized");
            exit;
        }
        t_relay();
    }
}
```

## Version Notes

The exact pseudo-variable form for accessing JWT claims (`$jwt(...)`) is consistent across `auth_jwt` releases on OpenSIPS 3.1+, but the available claim namespaces (header vs. payload vs. signature) have evolved. The rule's detection scope assumes the canonical `$jwt(header.kid)` form; in-tree forks that expose claims via different syntax may evade detection.

The parameterized form of `avp_db_query` (with `?` placeholders) requires that the underlying DB module supports prepared-statement-style binding. `db_mysql` and `db_postgres` do; some legacy drivers may not. If your driver does not support binding, escape via `{s.escape.common}` and treat that as a bare-minimum mitigation pending driver upgrade.

## False-Positive Considerations

- Configs that read `$jwt(...)` into a variable but never use it in a sink fire only at confidence:low. The dead-read pattern is a code-hygiene concern, not a vulnerability.
- The rule cannot trace flows that pass through MI-injected variables (`$shv(...)`) reliably and emits `review_required` on those paths — see `OSIPS-SEC-CONFIG_HYGIENE-002` (shv-tainted-assignment) for the related concern.
- After a successful signature verification, the claim is no longer taint-marked. The engine respects this: a sink reached only after a passing `jwt_script_authorize()` does not fire this rule.

## Related Rules

- `OSIPS-SEC-AUTH-004` (jwt-db-mode-cve) — the specific CVE-2026-25554 instance; this rule covers the broader class.
- `OSIPS-SEC-AUTH-007` (jwt-alg-none) — orthogonal: algorithm rather than claim-value attacks.
- `OSIPS-SEC-INJECTION-001` (sql-inj-avp-db-query) — generic SQLi class; this rule is the JWT-specific dataflow specialization.
- `OSIPS-SEC-INJECTION-005` (cachedb-raw-injection) — file/cache sinks beyond SQL.

## Additional References

- Phase 3 gap analysis §D.13 (JWT attack surface beyond CVE-2026-25554)
- AISLE CVE-2026-25554 deep-dive — https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass
- RFC 8725 — JSON Web Token Best Current Practices
- CWE-20 — Improper Input Validation
- CWE-22 — Path Traversal
- CWE-89 — SQL Injection
- CWE-915 — Improperly Controlled Modification of Dynamically-Determined Object Attributes
