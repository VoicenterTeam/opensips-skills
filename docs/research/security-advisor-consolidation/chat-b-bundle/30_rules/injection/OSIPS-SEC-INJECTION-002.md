---
id: OSIPS-SEC-INJECTION-002
name: sql-inj-sqlops-raw
title: SIP-sourced pseudo-variable flows into sqlops raw sql_query() — SQL injection on 3.5+
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: injection
applies_if_modules_loaded: [sqlops]
applies_if_opensips_version: ">=3.5"
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
tags: [injection, sqli, sqlops, taint, dataflow, pre-auth]

references:
  - https://blog.opensips.org/2024/03/13/the-sql-support-reloaded/
  - https://www.opensips.org/Documentation/Script-Tran-3-4
  - https://cwe.mitre.org/data/definitions/89.html
  - 90_reference/01_master_vulnerability_reference.md#section-6

short_description: |
  An attacker-controlled SIP pseudo-variable is interpolated into the SQL string
  passed to sqlops' raw sql_query() primitive on OpenSIPS 3.5+, where the
  structured sql_select/sql_insert/sql_update/sql_delete primitives are available
  and would be parameterized-by-construction. Cfg author chose the unsafe form
  when a safe form was available.
---

## Rationale

OpenSIPS 3.5 introduced the modern `sqlops` module with structured query primitives — `sql_select()`, `sql_insert()`, `sql_update()`, `sql_delete()` — that map onto the internal prepared-statement API. These are not vulnerable to interpolation injection: values are bound as parameters, never concatenated into the query text.

`sqlops` retains a raw `sql_query()` primitive for queries the structured primitives cannot express (complex joins, subqueries, vendor-specific syntax). The raw form takes a SQL string built by the cfg author and is interpolation-injection-prone in exactly the same way `avpops:avp_db_query()` is — see `OSIPS-SEC-INJECTION-001` for the canonical treatment.

The distinction this rule makes: on 3.5+, choosing `sql_query()` over `sql_select()` is a deliberate fall-back from the safe form to the unsafe form, and the burden of justification is higher. The rule fires on the same dataflow pattern as INJECTION-001 but with a different remediation prescription — migrate to the structured primitive when possible, apply `s.escape.common` only when the structured primitive cannot express the query.

This rule deliberately scopes to OpenSIPS 3.5+. On 3.4 and earlier the structured primitives don't exist, so the choice between safe and unsafe doesn't apply; SQLi findings on those versions fire under `OSIPS-SEC-INJECTION-001` against `avp_db_query()`/legacy `sql_query()` instead.

Source: Phase 2 master vulnerability reference §6 (Injection); OpenSIPS blog "The SQL support, reloaded" (Mar 2024).

## Default Value

Not applicable — the `sqlops` module has no defaulted "auto-escape raw queries" behavior; the operator selects the safe or unsafe primitive per call site.

## Audit

The rule fires when **all** of the following are true on any code path:

1. The detected OpenSIPS version is `>=3.5` (older versions route to `OSIPS-SEC-INJECTION-001` instead).
2. A SIP-sourced pseudo-variable from the taint-source set (per INJECTION-001's audit section) is read.
3. The variable flows into the SQL string of a `sql_query()` invocation against the `sqlops` module.
4. No sanitizer (`{s.escape.common}` or equivalent allow-list) is applied between source and sink.

Cfgs that use the structured primitives (`sql_select`, `sql_insert`, `sql_update`, `sql_delete`) for the same data flow do not fire — those are parameterized by construction. The rule's purpose is to surface deliberate use of the unsafe primitive when the safe form was available.

## Remediation

**Preferred — migrate to the structured primitive.** If the query is expressible as a structured form, replace the raw call:

```opensips
# Before
sql_query("ca", "SELECT route FROM dst WHERE num='$rU'", "$avp(r)");

# After
sql_select("num=$rU", "route", "dst", "$avp(r)");
```

The structured primitives bind values as parameters; no interpolation occurs.

**Compatible — apply `s.escape.common` to every interpolated taint source.** When the query genuinely requires raw form (complex joins, vendor syntax, computed columns), wrap each SIP-sourced pseudo-variable:

```opensips
sql_query("ca",
    "SELECT r.route, c.flags FROM dst r JOIN cust c ON r.cust_id = c.id "
    "WHERE r.num='$(rU{s.escape.common})' AND c.active=1",
    "$avp(result)");
```

**Defense in depth.** Add the early-rejection check from INJECTION-001 (`if ($fU != $(fU{s.escape.common}) ...) { send_reply(403); }`) at the request_route entry. This produces an audit trail and short-circuits obviously-injected requests before any DB code executes.

## Example — BAD

```opensips
loadmodule "sqlops.so"
loadmodule "db_mysql.so"

modparam("sqlops", "db_url", "ca", "mysql://opensips:secret@db/opensips")

route {
    if (is_method("INVITE")) {
        # Raw query with bare interpolation — SQLi via $rU
        sql_query("ca",
            "SELECT route FROM dst WHERE num='$rU'",
            "$avp(route)");
    }
}
```

## Example — GOOD

### Structured primitive (preferred)

```opensips
loadmodule "sqlops.so"
loadmodule "db_mysql.so"

modparam("sqlops", "db_url", "ca", "mysql://opensips:secret@db/opensips")

route {
    if (is_method("INVITE")) {
        sql_select("num=$rU", "route", "dst", "$avp(route)");
    }
}
```

### Raw query with `s.escape.common` (when structured form is insufficient)

```opensips
route {
    if (is_method("INVITE")) {
        sql_query("ca",
            "SELECT r.route, c.priority FROM dst r "
            "JOIN cust c ON r.cust_id = c.id "
            "WHERE r.num='$(rU{s.escape.common})' AND c.active=1 "
            "ORDER BY c.priority DESC LIMIT 1",
            "$avp(result)");
    }
}
```

## Version Notes

This rule applies to OpenSIPS 3.5 and 3.6 LTS. Earlier versions don't have the modern `sqlops` structured primitives, so the rule's "migrate to structured form" remediation is not available — those versions fire under `OSIPS-SEC-INJECTION-001` for the same dataflow pattern.

The `sql_query()` raw primitive on `sqlops` and the legacy `sql_query()` on the older module are syntactically similar but semantically distinct (different connection-handle semantics, different error-reporting). The advisor distinguishes them by checking `loadmodule "sqlops.so"` presence.

## False-Positive Considerations

- **Genuinely complex queries.** Queries that require subqueries, vendor-specific syntax, or computed columns may not be expressible as structured forms. The rule still fires — `s.escape.common` is the documented compatibility-mode defense — but the suppression path is "structured form not expressible; sanitizer applied" with a link to the specific query complexity.
- **DDL / migration scripts.** Some cfgs include `sql_query()` calls for one-time schema setup at startup. These are not user-input-driven and do not fire if no taint source flows in.
- **Numeric inputs validated upstream.** Same exemption as INJECTION-001: `$rU` matched against `^[0-9]{1,16}$` before the query is genuinely safe.

## Related Rules

- `OSIPS-SEC-INJECTION-001` (sql-inj-avp-db-query) — same class on `avpops:avp_db_query()`. Older module, identical SQLi pattern.
- `OSIPS-SEC-INJECTION-005` (cachedb-raw-injection) — same dataflow pattern against cache-key sinks.
- `OSIPS-SEC-AUTH-008` (jwt-kid-injection) — JWT-claim-specific dataflow specialization that also reaches DB sinks.

## Additional References

- Phase 2 master vulnerability reference §6 (Injection)
- OpenSIPS blog "The SQL support, reloaded" (Mar 2024): https://blog.opensips.org/2024/03/13/the-sql-support-reloaded/
- OpenSIPS Script Transformations documentation: https://www.opensips.org/Documentation/Script-Tran-3-4
- CWE-89 — SQL Injection
- CWE-20 — Improper Input Validation
- OWASP A03:2021 — Injection
