---
id: OSIPS-SEC-INJ-001
name: sql-inj-avp-db-query
title: SIP-sourced pseudo-variable flows into avp_db_query without s.escape.common — pre-auth SQL injection
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: injection
applies_if_modules_loaded: [avpops]
applies_if_opensips_version: ">=3.2"
phase: [dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 8.7
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-89, CWE-20]
owasp: ["A03:2021-Injection"]
attack: [T1190]
tags: [injection, sqli, avp-db-query, taint, dataflow, pre-auth]

references:
  - https://www.opensips.org/Documentation/Script-Tran-3-4
  - https://blog.opensips.org/2024/03/13/the-sql-support-reloaded/
  - https://www.mail-archive.com/users@lists.opensips.org/msg45512.html
  - https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass
  - https://cwe.mitre.org/data/definitions/89.html
  - ../../knowledge/vulnerability-reference.md#section-6

short_description: |
  An attacker-controlled SIP pseudo-variable ($fU, $tU, $rU, $ct, $ua, $hdr(*), or
  similar) is interpolated into the SQL query string passed to avp_db_query() (or
  the equivalent legacy sql_query()) without the s.escape.common transformation or
  an equivalent allow-list. A crafted SIP header containing single-quote, semicolon,
  or comment-syntax breaks out of the literal and alters the query.
---

## Rationale

OpenSIPS' `avpops` module exposes `avp_db_query()` (and the legacy `sql_query()` from earlier `sqlops` versions) as a thin wrapper that accepts a SQL string built by the cfg author. Pseudo-variables interpolated into that string — `$fU` (From-URI user), `$tU` (To-URI user), `$rU` (Request-URI user), `$ct` (Contact), `$ua` (User-Agent), `$hdr(*)` (arbitrary header), `$si` (source IP, less commonly attacker-controlled but still untrusted) — are SIP-sourced and attacker-controllable. Without escaping, a single-quote in the From username terminates the SQL literal, and a `; DROP TABLE` or `OR 1=1` payload becomes part of the executed query.

Two structural facts make this severe:

1. **Pre-authentication exposure.** SQLi via `$fU` (or any header read before `proxy_authorize()`) fires on the very first INVITE the attacker sends. No credentials are required and the attacker need not be a registered user.
2. **OpenSIPS' internal queries are not vulnerable.** Auth, registrar, and usrloc internal lookups use the structured DB API with prepared statements — see bogdan-iancu's canonical reply on the OpenSIPS users list. The exposure surface is exclusively cfg-author-written queries: `avp_db_query()`, the legacy `sql_query()`, and any custom module that takes a SQL string from the script.

CVE-2026-25554 (the AISLE-discovered `auth_jwt` SQLi) is a specific instance of this class within the module's own code, not a script-author bug. This rule covers the script-author case, which is the broader and more common exposure surface across deployments.

The OpenSIPS-native defense is the `s.escape.common` script transformation: applying `$(fU{s.escape.common})` instead of bare `$fU` escapes single-quote, double-quote, backslash, and NUL — the same characters `escape_common()` escapes internally. This is the documented and recommended approach. Adopting Kamailio idioms here (e.g., `$(fU{s.replace,...})`) is incorrect — the transformation has different semantics on OpenSIPS.

On OpenSIPS 3.5+, the new `sqlops` module exposes `sql_select()` (and `sql_insert`, `sql_update`, `sql_delete`) which map onto the internal prepared-statement API. These are the strongly-preferred form on 3.5+ and are not vulnerable to interpolation injection by construction.

Source: Phase 2 master vulnerability reference §6 (Injection); bogdan-iancu mailing list reply (Nov 2023); OpenSIPS Script Transformations documentation; OpenSIPS blog "The SQL support, reloaded" (Mar 2024); AISLE CVE-2026-25554 deep-dive.

## Default Value

Not applicable — this rule checks data flow patterns rather than a parameter default. The `avpops` module has no defaulted "escape inputs automatically" behavior; the operator is responsible for sanitizing every interpolated pseudo-variable.

## Audit

The rule fires when **all** of the following are true on any code path:

1. A SIP-sourced pseudo-variable from the taint-source set is read. The default taint source set is:
   - URI fields: `$fU`, `$fu`, `$fd`, `$tU`, `$tu`, `$td`, `$rU`, `$ru`, `$rd`
   - Headers: `$hdr(*)`, `$ua`, `$ct`
   - Body: `$rb`, `$mb`
   - Request-line: `$rm`, `$ru`
2. The variable (directly, or via assignment to a script variable / AVP that the engine traces) is interpolated into the first-argument string of `avp_db_query()`, `sql_query()`, or any other configured DB-query primitive accepting a raw SQL string.
3. No sanitizer is applied between source and sink. The default sanitizer set is:
   - `{s.escape.common}` (canonical defense)
   - `{s.escape.user}` (URI-fragment escape; weaker but acceptable for URI-shaped values)
   - Custom transformations declared in `15_CONFIDENCE_AND_VERIFICATION.md` as project-approved sanitizers (suppression mechanism, not rule-default).

The detection is dataflow-aware: the engine traces source-to-sink across script-variable assignments, AVP stores/loads, and `route()` call boundaries. The presence of an `if (...)` guard that filters the value (e.g., `if ($fU =~ "^[0-9]{1,16}$")`) is recognized as a sanitizer when the regex is restrictive enough to exclude SQL metacharacters; the engine emits `confidence: medium` rather than `high` when the regex's restrictiveness cannot be statically determined.

Detection signal cross-references from Phase 2 §6: bare `$fU` / `$rU` / `$tU` inside a quoted SQL literal in `avp_db_query`'s first argument; `INSERT INTO ... VALUES ('$ct')` patterns; `sql_query("ca", "SELECT ... WHERE col='$rU'", ...)` legacy form.

## Remediation

**Preferred (OpenSIPS 3.5+) — migrate to `sqlops` structured form.** Replace `avp_db_query()` with `sql_select()` (or the appropriate `sql_insert`/`sql_update`/`sql_delete`). Structured calls bind values as parameters, never interpolate, and are not vulnerable to this rule's class:

```opensips
sql_select("sip_user=$fU", "account_id", "customers", "$var(acct)");
```

**Compatible (3.4 and earlier; 3.5+ when migration is blocked) — apply `s.escape.common`.** Wrap every interpolated SIP-sourced pseudo-variable with the transformation:

```opensips
avp_db_query(
  "SELECT account_id FROM customers WHERE sip_user='$(fU{s.escape.common})'",
  "$avp(acct)"
);
```

**Defense in depth (recommended on top of the above).** Reject obviously-injected input early in the request_route, before any DB interaction:

```opensips
if ($fU != $(fU{s.escape.common}) || $tU != $(tU{s.escape.common})) {
    xlog("L_WARN", "SQLi attempt from $si: fu=$fu tu=$tu\n");
    send_reply(403, "Forbidden");
    exit;
}
```

This produces an audit trail and short-circuits the request before reaching auth or DB code. Use it as a complement to `s.escape.common` at sink sites, not a replacement.

**Do not** rely on length-bounding or character-class regexes alone unless the regex is provably restrictive (e.g., `^[0-9]{1,16}$` for a numeric extension). Permissive regexes (`^.{1,255}$`, anything matching a wide character class) are not sanitizers and the engine will not credit them.

## Example — BAD

### Bare interpolation

```opensips
loadmodule "avpops.so"
loadmodule "db_mysql.so"

modparam("avpops", "db_url", "mysql://opensips:secret@db/opensips")

route {
    if (is_method("INVITE")) {
        # $fU is attacker-controlled; "1234' OR '1'='1" breaks out
        avp_db_query(
            "SELECT account_id FROM customers WHERE sip_user='$fU'",
            "$avp(acct)"
        );
        # ... auth happens later, but the SQLi has already executed.
    }
}
```

### Contact header interpolated raw

```opensips
route {
    if (is_method("REGISTER")) {
        avp_db_query("INSERT INTO contact_log(ct) VALUES ('$ct')");
        # $ct can contain arbitrary characters including ' ; --
    }
}
```

## Example — GOOD

### `s.escape.common` applied at sink

```opensips
route {
    if (is_method("INVITE")) {
        avp_db_query(
            "SELECT account_id FROM customers WHERE sip_user='$(fU{s.escape.common})'",
            "$avp(acct)"
        );
    }
}
```

### `sqlops` structured form (OpenSIPS 3.5+)

```opensips
loadmodule "sqlops.so"
loadmodule "db_mysql.so"

modparam("sqlops", "db_url", "ca", "mysql://opensips:secret@db/opensips")

route {
    if (is_method("INVITE")) {
        # Parameterized — $fU is bound as a value, never interpolated into SQL text
        sql_select("sip_user=$fU", "account_id", "customers", "$var(acct)");
    }
}
```

## Version Notes

| Version | Available primitives | Recommended form |
|---|---|---|
| 3.2, 3.3, 3.4 LTS | `avp_db_query()`, legacy `sql_query()` | `s.escape.common` at every interpolation site |
| 3.5 | `avp_db_query()` + new `sqlops` (`sql_select`, etc.) | Migrate to `sqlops` structured form |
| 3.6 LTS | Same as 3.5 with stable signatures | `sqlops` structured form |

The `s.escape.common` transformation is available across all supported versions and is the universal compatibility-mode defense.

CVE-2026-25554 in `auth_jwt`'s DB mode is a separate finding (`OSIPS-SEC-AUTH-004`) — that rule covers an in-module SQLi where the cfg author has no `s.escape.common` placement option because the vulnerable interpolation happens inside the C code.

## False-Positive Considerations

- **Length-bounded numeric inputs.** `$fU` matched against `^[0-9]{1,16}$` before the DB query is genuinely safe — the regex excludes every SQL metacharacter. The engine recognizes this pattern and emits `confidence: medium` rather than `high`. Operators can suppress with `justification="numeric-only input validated upstream"` to silence the medium-confidence emission.
- **Internal-only DB queries.** Queries against tables populated solely by trusted internal sources (e.g., a routing table loaded from a static file at startup) where the WHERE clause uses only constants or trusted variables fire only on the SIP-sourced taint condition — no taint, no finding.
- **Custom sanitizer functions.** Some deployments wrap `$fU` through a custom Perl/Python sanitizer via the `perl` / `python` modules before DB use. The advisor cannot inspect external sanitizer logic and emits `review_required` when a custom sanitizer is detected on the path. Operators document the sanitizer's behavior in the suppression justification.
- **Kamailio-syntax confusion.** Kamailio's `sqlops`/`avpops` use similar function names but its escape transformation has different semantics. A Kamailio cfg fed accidentally to this advisor will mis-fire; the intake layer must detect Kamailio-isms (`sanity_check()`, `secfilter`, etc.) before this rule runs.
- **Re-INVITE within established dialog.** Re-INVITEs read the same `$fU` as the original INVITE and the value is unchanged — but the rule still fires because the dataflow is structurally identical. If the operator's design assumes re-INVITE inputs are validated by upstream dialog state, suppress per-route with documentation.

## Related Rules

- `OSIPS-SEC-INJECTION-002` (sql-inj-sqlops-raw) — covers the same class on the `sqlops` module's raw `sql_query()` API. This rule covers the older `avpops`/legacy `sql_query()` path; the modern `sqlops` raw form has its own rule because the remediation is different (move to `sql_select`, not just add `s.escape.common`).
- `OSIPS-SEC-INJECTION-005` (cachedb-raw-injection) — same class against `cache_*` primitives that take a key string.
- `OSIPS-SEC-INJECTION-006` (crlf-append-hf) — header-injection class; orthogonal but commonly co-occurs in cfgs that build SIP and SQL strings the same way.
- `OSIPS-SEC-AUTH-004` (jwt-db-mode-cve) — CVE-2026-25554 is a specific in-module instance of the SQLi class; this rule covers the broader script-author surface.
- `OSIPS-SEC-AUTH-008` (jwt-kid-injection) — JWT-claim-specific dataflow specialization that also reaches DB sinks.

## Additional References

- Phase 2 master vulnerability reference §6 (Injection)
- bogdan-iancu canonical reply (OpenSIPS users list, Nov 2023): https://www.mail-archive.com/users@lists.opensips.org/msg45512.html
- OpenSIPS Script Transformations documentation: https://www.opensips.org/Documentation/Script-Tran-3-4
- OpenSIPS blog "The SQL support, reloaded" (Mar 2024): https://blog.opensips.org/2024/03/13/the-sql-support-reloaded/
- AISLE CVE-2026-25554 deep-dive: https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass
- CWE-89 — Improper Neutralization of Special Elements used in an SQL Command
- CWE-20 — Improper Input Validation
- OWASP A03:2021 — Injection
