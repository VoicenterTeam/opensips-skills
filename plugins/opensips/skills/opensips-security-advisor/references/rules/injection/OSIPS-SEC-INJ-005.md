---
id: OSIPS-SEC-INJ-005
name: cachedb-raw-injection
title: SIP-sourced pseudo-variable flows into cache_* key/value without validation — cache-key injection
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: injection
applies_if_modules_loaded: [cachedb_local, cachedb_redis, cachedb_memcached, cachedb_mongodb, cachedb_cassandra, cachedb_couchbase]
applies_if_opensips_version: ">=3.2"
phase: [dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: medium
security_severity: 6.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:L/SC:N/SI:N/SA:N"
cwe: [CWE-20, CWE-74, CWE-89]
owasp: ["A03:2021-Injection"]
attack: [T1190]
tags: [injection, cachedb, key-injection, taint, dataflow]

references:
  - https://opensips.org/docs/modules/3.4.x/cachedb_redis.html
  - https://opensips.org/docs/modules/3.4.x/cachedb_mongodb.html
  - https://cwe.mitre.org/data/definitions/74.html
  - ../../knowledge/vulnerability-reference.md#section-6

short_description: |
  An attacker-controlled SIP pseudo-variable is used as a cache key (or as a
  value position with backend-specific query syntax — Redis Lua scripts,
  MongoDB query documents, Cassandra CQL strings) without shape validation.
  Effects range from cache-namespace poisoning (low impact) to NoSQL injection
  yielding read/write of unintended documents (high impact, backend-dependent).
---

## Rationale

The `cachedb_*` family of modules exposes `cache_store()`, `cache_fetch()`, `cache_remove()`, and backend-specific extensions (`cache_raw_query` on Redis/MongoDB, `cache_counter_*` on numeric backends) for key/value access to in-memory or NoSQL stores. The primitives accept the key as a script string — typically built by interpolating SIP pseudo-variables.

Three distinct exposure classes attach:

1. **Cache-namespace poisoning (every backend).** A SIP-sourced key like `"user:" + $fU` is namespace-collision-prone. An attacker who controls `$fU` controls the key entirely; they can write to keys the cfg author intended to be operator-owned (`"user:admin"`, `"config:db_url"`, etc.) and read keys belonging to other namespaces. Severity is bounded by what the cache stores — usually session state and rate-limit counters, occasionally credentials.

2. **Backend-specific query injection (Redis, MongoDB, Cassandra, Couchbase).** When the cfg uses `cache_raw_query()` or equivalent to send a backend query, SIP-sourced taint flowing into that string is a backend-specific injection:
   - **Redis**: Lua-script injection if `EVAL` is constructed with PV interpolation; arbitrary key reads via crafted `KEYS *` pattern.
   - **MongoDB**: NoSQL injection via JSON query document; `{"$where": "..."}` or operator-injection via `{"$ne": ...}` flips authentication-bypass-style queries.
   - **Cassandra (CQL)**: SQLi-class injection identical to the relational case.
   - **Couchbase (N1QL)**: Same SQLi class.

3. **`cache_load_file` path traversal (cachedb_local).** Some `cachedb_local` configurations populate cache from filesystem files at startup. If the file path is interpolated from a SIP-sourced value (an unusual but observed pattern in dynamically-keyed caches), `../etc/opensips/secrets.cfg`-class traversal becomes a finding under this rule's umbrella; see also `OSIPS-SEC-AUTH-008` for the JWT-claim-specific case.

The rule is medium severity rather than high because most cfgs use the cache only for ephemeral session state where namespace poisoning is recoverable. When the cache stores credentials, signing keys, or persistent state, the operator should treat findings as high — the engine emits with `confidence: medium` to signal that severity calibration depends on what the cache holds, which the cfg cannot fully express.

Source: Phase 2 master vulnerability reference §6 (Injection); OpenSIPS cachedb module family documentation.

## Default Value

Not applicable — `cache_*` primitives have no defaulted key-validation behavior.

## Audit

The rule fires when **both** of the following are true:

1. A SIP-sourced pseudo-variable from the taint-source set is interpolated into:
   - The key argument of any `cache_*` primitive (`cache_store`, `cache_fetch`, `cache_remove`, `cache_counter_inc`, `cache_counter_get`, etc.), OR
   - The query string of `cache_raw_query` against any cachedb backend.
2. No sanitizer is applied. The default sanitizer set for cache keys is:
   - Length-bounded alphanumeric+limited-punctuation regex: `^[a-zA-Z0-9_:.-]{1,128}$`
   - Hash transformation: `$(fU{s.md5})` produces a fixed-shape key derived from but not equal to the user input
   - Explicit prefix-namespacing combined with shape validation

For backend-specific query injection (Redis Lua, MongoDB `$where`, CQL), no script-transformation sanitizer is sufficient — the remediation is to switch to the structured primitive (parameterized form per backend) or to never let SIP-sourced taint reach the query argument.

## Remediation

**For namespace poisoning (key-side):**

1. Hash SIP-sourced inputs before using them as keys. `$(fU{s.md5})` produces a 32-character hex digest that is collision-resistant for practical use:

   ```opensips
   $var(key) = "user:" + $(fU{s.md5});
   cache_fetch("local", "$var(key)", "$avp(state)");
   ```

2. Or apply a strict shape regex before key construction:

   ```opensips
   if (!($fU =~ "^[a-zA-Z0-9_-]{1,32}$")) {
       send_reply(403, "Forbidden");
       exit;
   }
   cache_fetch("local", "user:$fU", "$avp(state)");
   ```

**For backend-specific query injection:**

1. **Redis** — never use `EVAL` with PV interpolation. Use the structured `cache_*` primitives or pre-register Lua scripts with `SCRIPT LOAD` and invoke by SHA1.
2. **MongoDB** — use the structured `cache_fetch`/`cache_store` form against a flat key/value namespace; avoid `cache_raw_query` for user-derived inputs entirely. If a complex query is required, build the BSON document programmatically (cfg cannot do this; defer to a helper module or external service).
3. **Cassandra / Couchbase** — the same `s.escape.common` discipline as relational SQLi applies; treat the raw query as INJECTION-001-class and require sanitizer at every interpolation site.

**Defense in depth:**

- Set per-key TTLs aggressively. Cache pollution is bounded by TTL.
- Use distinct cache connections (`modparam("cachedb_*", "cachedb_url", "<id>", ...)`) for distinct trust domains. A SIP-derived cache and an operator-derived cache should not share a connection.

## Example — BAD

### Direct key interpolation (Redis namespace poisoning)

```opensips
loadmodule "cachedb_redis.so"

modparam("cachedb_redis", "cachedb_url", "redis://redis.example/0")

route {
    if (is_method("INVITE")) {
        # $fU = "admin" collides with operator-owned key namespace
        cache_fetch("redis", "session:$fU", "$avp(session)");
    }
}
```

### MongoDB raw query (NoSQL injection)

```opensips
loadmodule "cachedb_mongodb.so"

modparam("cachedb_mongodb", "cachedb_url",
    "mongodb://opensips:secret@db/opensips.sessions")

route {
    if (is_method("INVITE")) {
        # $fU = '{"$ne":null}' returns first session document regardless of user
        cache_raw_query("mongo",
            "{\"sip_user\":\"$fU\"}",
            "$avp(session)");
    }
}
```

## Example — GOOD

### Hashed key

```opensips
loadmodule "cachedb_redis.so"

modparam("cachedb_redis", "cachedb_url", "redis://redis.example/0")

route {
    if (is_method("INVITE")) {
        # MD5 of $fU produces a fixed-shape key in a controlled namespace
        $var(key) = "session:" + $(fU{s.md5});
        cache_fetch("redis", "$var(key)", "$avp(session)");
    }
}
```

### Structured query against MongoDB (avoid raw form)

```opensips
loadmodule "cachedb_mongodb.so"

modparam("cachedb_mongodb", "cachedb_url",
    "mongodb://opensips:secret@db/opensips.sessions")

route {
    if (is_method("INVITE")) {
        # Strict shape validation before key use
        if (!($fU =~ "^[a-zA-Z0-9._-]{1,64}$")) {
            send_reply(403, "Forbidden");
            exit;
        }
        # Structured primitive — $fU is a value, not interpolated into BSON
        cache_fetch("mongo", "$fU", "$avp(session)");
    }
}
```

## Version Notes

The `cachedb_*` module family API is stable across OpenSIPS 3.2 through 3.6 with backend-specific connection-string syntax that has evolved per release. The rule's detection logic uses the primitive names (`cache_*`) which are consistent across versions.

`cachedb_local` was renamed and refactored across the 3.x series; the rule applies regardless of which `cachedb_local` variant is loaded as long as the `cache_*` primitive names match.

## False-Positive Considerations

- **Cache stores ephemeral diagnostic data.** When the cache is used only for short-TTL counters or session-tracking with no security-sensitive content, namespace poisoning is bounded and the rule's medium severity may overstate impact for the deployment. Suppress per-modparam-context with documentation of what the cache holds.
- **Backend isolation by design.** When SIP-derived caches are isolated to a dedicated backend connection that has no operator-derived keys, namespace poisoning is contained. Suppress with `justification="dedicated cache backend, no cross-tenant keys"` and link to the connection-string evidence.
- **Numeric-only keys validated upstream.** `$fU` matched against `^[0-9]{1,16}$` before key construction is genuinely safe.
- **Backend-specific structured primitives unavailable.** Some legacy backends (older `cachedb_couchbase` versions) do not expose structured query primitives, only raw query. The rule still fires; the operator suppresses with documentation of the structural limitation and shape-validates inputs as the residual defense.

## Related Rules

- `OSIPS-SEC-INJECTION-001` (sql-inj-avp-db-query) — same dataflow pattern, relational DB sink. Cassandra/Couchbase backends overlap in remediation.
- `OSIPS-SEC-INJECTION-002` (sql-inj-sqlops-raw) — modern relational sink class.
- `OSIPS-SEC-AUTH-008` (jwt-kid-injection) — JWT claims flowing into cache key/file paths is a specific case of this rule's class.
- `OSIPS-SEC-CONFIG_HYGIENE-001` — cleartext credentials in `cachedb_url` modparams.

## Additional References

- Phase 2 master vulnerability reference §6 (Injection)
- OpenSIPS cachedb module family documentation (per backend)
- CWE-20 — Improper Input Validation
- CWE-74 — Improper Neutralization (general injection class)
- CWE-89 — SQL Injection (for CQL/N1QL backends)
- OWASP A03:2021 — Injection
