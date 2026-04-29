# OpenSIPS Security Advisor Report

**Configuration analyzed:** `vulnerable-mixed.cfg`
**Profile applied:** L1 (declared); L2 not requested
**OpenSIPS version detected:** 3.6.2
**Engine version:** opensips-advisor 0.1.0
**Run ID:** `8c14f5a1-2a73-4d68-b09e-7e0512d3aa4f`
**Analysis duration:** 17.4s
**Run timestamp:** 2026-04-27T11:02:18Z

---

## Executive Summary

| Severity | Count |
|---|---|
| Critical | 2 |
| High | 3 |
| Medium | 2 |
| Low | 2 |
| Info | 1 |

**Top three findings.**

1. **Critical — auth_jwt is configured in `db_url` mode on an OpenSIPS version vulnerable to CVE-2026-25554.** The deployed engine is 3.6.2, which is within the vulnerable range (3.1 through 3.6.3 pre-patch). An unauthenticated attacker who can reach the SIP listener can trigger the documented JWT-validation bypass. This is `kind: vulnerability`, confidence high, `deterministic_confirmed`.
2. **Critical — the `mi_http` management interface is bound to `0.0.0.0` with no `mi_trusted_clients` restriction.** Combined with the registrar and dialog modules being loaded, this exposes enable/disable, registration purges, and dialog teardown to any host that can reach port 8080. The rule chain mi-public-bind → registrar-loaded → no-trusted-clients fired together; they are correlated under one root cause.
3. **High — auth applied after routing in `request_route`.** `route(relay)` is called unconditionally at the top of `request_route` and runs `forward()` before any digest challenge. Any UAC reaching the listener can place calls without authenticating.

The remaining seven findings cover SQL injection in the dialplan lookup path, TLS certificate verification disabled, plaintext-HA1 storage, missing DoS protection, an Authorization-header leak in xlog, cleartext database credentials in the cfg, and a deferred-startup configuration note.

---

## Methodology & Scope

### Profile applied
**L1**, declared at intake. No per-rule overrides.

### OpenSIPS version
**3.6.2**, declared. Confirmed by `db_mode` parameter form on `auth_jwt`. Note that 3.6.4 is available and contains the CVE-2026-25554 patch; the upgrade is implicated by Finding F1 below.

### Modules loaded (security-relevant)
`signaling`, `sl`, `tm`, `rr`, `maxfwd`, `sipmsgops`, `auth`, `auth_db`, `auth_jwt`, `usrloc`, `registrar`, `tls_mgm`, `proto_udp`, `proto_tls`, `mi_http`, `db_mysql`, `acc`, `dialog`, `permissions`. **Notably absent:** `pike`, `ratelimit`, `stir_shaken`, `rtpengine`.

### Intake answers
| # | Question | Answer |
|---|---|---|
| 1 | OpenSIPS version | 3.6.2 (declared) |
| 2 | Deployment context | Public-facing edge proxy |
| 3 | Authentication mode | Mixed (digest + JWT) |
| 4 | Front-end | Direct-to-Internet (no upstream proxy) |
| 5 | Profile | L1 |

### Rules executed
**47 rules** applicable. **9 fired as findings**, **1 emitted an informational observation**.

---

## Findings

Sorted severity desc, confidence desc, then by module family.

### F1 — auth_jwt configured in vulnerable db mode (CVE-2026-25554) [auth]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-001` |
| **Rule** | `OSIPS-SEC-AUTH-004` v1.0 (`jwt-db-mode-cve`) |
| **Severity** | **Critical** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N` (8.3) |
| **CWE** | CWE-89 (SQL Injection) |
| **OWASP** | A03:2021 — Injection |
| **MITRE ATT&CK** | T1190 (Exploit Public-Facing Application) |
| **Location** | `vulnerable-mixed.cfg:12–14` |
| **Fingerprint** | `sha256/v1:7f3c…a1d9` |

**Evidence.**
```opensips-cfg
loadmodule "auth_jwt.so"
modparam("auth_jwt", "db_url", "mysql://opensips:opensipspw@db.internal/opensips")
modparam("auth_jwt", "db_mode", 1)
```

**Rationale.** `auth_jwt` with `db_mode=1` on OpenSIPS in the range 3.1 through 3.6.4 (prior to commit `3822d33`) contains a SQL injection in `jwt_db_authorize()` — disclosed as CVE-2026-25554 by AISLE Research (Pavel Kohout, January 2026). The function extracts the JWT's `tag` claim *before* signature verification and incorporates the unescaped value into a SQL query, allowing an attacker with a crafted JWT to manipulate the query and bypass JWT authentication, impersonating any identity in the JWT profiles table. The deployed version 3.6.2 is in-range. The published CVSS is 8.3 (high confidentiality impact, low integrity, no availability — the bypass enables impersonation but not direct DB writes or service disruption).

**Recommendation.** Two paths, in priority order:
1. **Upgrade to OpenSIPS 3.6.4 or later.** The patch lands the validation fix; no cfg change is needed once upgraded.
2. **Interim mitigation.** Switch `db_mode` to 0 (file-loaded keys) until upgrade is feasible. File-loaded mode is not affected by CVE-2026-25554.

```opensips-cfg
# GOOD — file-loaded mode, not affected
loadmodule "auth_jwt.so"
modparam("auth_jwt", "db_mode", 0)
modparam("auth_jwt", "key_set", "main:/etc/opensips/jwt_keys.json")
```

**Suppressible:** false (active-exploit CVE-gated).

**Grounding.**
- parser_nodes: `loadmodule:12`, `modparam:13`, `modparam:14`
- references_consulted: `90_reference/01_master_vulnerability_reference.md#auth_jwt-cve-2026-25554`, `90_reference/external_sources.md#aisle-writeup`

**Rationale trace.**
1. Detected `auth_jwt` loaded with `db_mode=1`.
2. Detected version 3.6.2 from intake.
3. CVE-2026-25554 vulnerable range (3.1.0–3.6.3) contains 3.6.2.
4. Rule fires deterministically. No LLM judge consulted.

---

### F2 — `mi_http` exposed on 0.0.0.0 without trusted-clients restriction [mi_exposure]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-002` |
| **Rule** | `OSIPS-SEC-MI-001` v1.0 (`mi-http-public-bind`) |
| **Severity** | **Critical** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N` (9.3) |
| **CWE** | CWE-306 (Missing Authentication for Critical Function) |
| **OWASP** | A01:2021 — Broken Access Control |
| **Location** | `vulnerable-mixed.cfg:24–26` |
| **Related locations** | `:43` (registrar loaded), `:12` (auth_jwt loaded — admin commands include reload) |
| **Fingerprint** | `sha256/v1:9b21…c44e` |

**Evidence.**
```opensips-cfg
loadmodule "mi_http.so"
modparam("mi_http", "ip", "0.0.0.0")
modparam("mi_http", "port", 8080)
# no mi_http_trusted_clients set
```

**Rationale.** `mi_http` on `0.0.0.0:8080` with no `mi_http_trusted_clients` allowlist exposes administrative commands (`ul_dump`, `ul_rm`, `dlg_end_dlg`, `reload_routes`, `cache_*`) to any host that can reach the port. Combined with the registrar and dialog modules being loaded, the blast radius includes wholesale registration purge and active-call teardown.

**Recommendation.**
```opensips-cfg
# GOOD — bind to loopback, optionally enforce allowlist as defense in depth
modparam("mi_http", "ip", "127.0.0.1")
modparam("mi_http", "port", 8080)
modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1")
```
If MI must be reachable from an internal jump host, terminate that on a reverse proxy with mTLS rather than exposing `mi_http` directly.

**Related rules.** `OSIPS-SEC-MI-003` (no-trusted-clients) and `OSIPS-SEC-MI-005` (httpd-cleartext) were collapsed into this primary finding by the triage layer.

**Grounding.**
- parser_nodes: `modparam:24–26`
- references_consulted: `90_reference/02_enable_security_gap_analysis.md#mi-exposure`

---

### F3 — Authentication applied after routing decision [auth]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-003` |
| **Rule** | `OSIPS-SEC-AUTH-002` v1.0 (`auth-after-routing`) |
| **Severity** | **High** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:L/SC:N/SI:N/SA:N` (8.2) |
| **CWE** | CWE-285 (Improper Authorization) |
| **Location** | `vulnerable-mixed.cfg:72–89` |
| **Fingerprint** | `sha256/v1:1e22…b740` |

**Evidence.**
```opensips-cfg
request_route {
    route(relay);                  # forward() runs unconditionally
    if (is_method("REGISTER")) {
        if (!www_authenticate("$td", "subscriber")) { www_challenge("$td", 0); exit; }
        save("location");
    }
    # ...
}

route[relay] {
    forward();                     # called before any auth check on INVITE/MESSAGE
}
```

**Rationale.** The `relay` route is invoked unconditionally as the first action in `request_route` and calls `forward()`. Authentication branches for REGISTER appear later but are unreachable for INVITE, MESSAGE, SUBSCRIBE, OPTIONS, and any other non-REGISTER method, allowing those requests to be relayed without challenge.

**Recommendation.** Restructure so authentication is enforced before any routing action. For digest auth, branch on method, challenge first, and only relay after success:

```opensips-cfg
# GOOD
request_route {
    if (is_method("REGISTER")) { route(handle_register); exit; }
    if (is_method("INVITE|MESSAGE|SUBSCRIBE")) {
        if (!proxy_authorize("$td", "subscriber")) {
            proxy_challenge("$td", "0"); exit;
        }
    }
    consume_credentials();
    route(relay);
}
```

**Grounding.**
- parser_nodes: `route_block:request_route:72–89`, `route_block:relay:102–105`
- references_consulted: `90_reference/01_master_vulnerability_reference.md#auth-placement`

---

### F4 — SQL injection via `$fU` in `avp_db_query` [injection]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-004` |
| **Rule** | `OSIPS-SEC-INJ-001` v1.0 (`sql-inj-avp-db-query`) |
| **Severity** | **High** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` (8.7) |
| **CWE** | CWE-89 (SQL Injection) |
| **OWASP** | A03:2021 — Injection |
| **Location** | `vulnerable-mixed.cfg:83` |
| **Fingerprint** | `sha256/v1:4c0f…ee19` |

**Evidence.**
```opensips-cfg
avp_db_query("SELECT route FROM dialplan WHERE prefix='$fU'", "$avp(route)");
```

**Rationale.** `$fU` is a SIP-sourced taint source (the From URI user part, attacker-controllable). It flows directly into the SQL string of `avp_db_query` without escape. A crafted From URI of the form `1234'; DROP TABLE dialplan; --` is interpolated as-is.

**Recommendation.**
```opensips-cfg
# GOOD — use the documented escape transformation
$avp(safe_fU) = $(fU{s.escape.common});
avp_db_query("SELECT route FROM dialplan WHERE prefix='$avp(safe_fU)'", "$avp(route)");
```

Or use parameterized queries via `cachedb_query` patterns where supported. Note that `s.escape.common` is the OpenSIPS-native escape transformation; do not adopt Kamailio idioms (`$(fU{s.replace,...})`) — they have different semantics on OpenSIPS.

**Grounding.**
- dataflow_trace: `source($fU) → sink(avp_db_query.query)` at `vulnerable-mixed.cfg:83`
- parser_nodes: `function_call:avp_db_query:83`

**Rationale trace.**
1. Taint source `$fU` identified.
2. Sink `avp_db_query` (first argument is SQL) identified at line 83.
3. Path from source to sink contains zero sanitizers (no `s.escape.common`, no `s.escape.user`, no custom-named transformation).
4. Match confirmed deterministically.

---

### F5 — TLS certificate verification disabled [tls]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-005` |
| **Rule** | `OSIPS-SEC-TLS-001` v1.0 (`verify-cert-disabled`) |
| **Severity** | **High** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N` (7.7) |
| **CWE** | CWE-295 (Improper Certificate Validation) |
| **Location** | `vulnerable-mixed.cfg:32–33` |
| **Fingerprint** | `sha256/v1:8d54…f2ba` |

**Evidence.**
```opensips-cfg
modparam("tls_mgm", "verify_cert", "[default]0")
modparam("tls_mgm", "require_cert", "[default]0")
```

**Rationale.** With `verify_cert=0` and `require_cert=0` on the default TLS domain, OpenSIPS accepts any peer certificate (or none). Any on-path adversary who can intercept TLS connections to or from the proxy can present an arbitrary certificate. This nullifies the confidentiality and integrity guarantees of TLS for this listener.

**Recommendation.**
```opensips-cfg
# GOOD
modparam("tls_mgm", "verify_cert", "[default]1")
modparam("tls_mgm", "require_cert", "[default]1")
modparam("tls_mgm", "ca_list",      "[default]/etc/opensips/tls/ca.pem")
modparam("tls_mgm", "tls_method",   "[default]TLSv1.2+")
```

If a specific peer cannot present a valid cert (e.g., a partner ITSP using a private CA), define a per-domain TLS profile rather than weakening the default.

**Grounding.**
- parser_nodes: `modparam:32`, `modparam:33`
- references_consulted: `90_reference/01_master_vulnerability_reference.md#tls-mgm`

---

### F6 — Possible open relay (no `is_myself` check before `t_relay()`) [relay_and_routing]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-006` |
| **Rule** | `OSIPS-SEC-RELAY-001` v1.0 (`open-relay-no-isself`) |
| **Severity** | **Medium** |
| **Confidence** | Medium |
| **Verification status** | `judge_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:L/VA:L/SC:N/SI:L/SA:N` (5.3) |
| **CWE** | CWE-441 (Unintended Proxy or Intermediary) |
| **Location** | `vulnerable-mixed.cfg:85` |
| **Fingerprint** | `sha256/v1:2a17…c0d3` |

**Evidence.**
```opensips-cfg
if (is_method("INVITE")) {
    avp_db_query("SELECT route FROM dialplan WHERE prefix='$fU'", "$avp(route)");
    xlog("L_NOTICE", "INVITE from $fU header: $hdr(Authorization)\n");
    t_relay();      # no is_myself / has_totag / loose_route discrimination
}
```

**Rationale.** `t_relay()` is invoked on INVITE without first checking that the request URI is in a domain we serve, that the request is in-dialog, or that it has been pre-routed via `loose_route()`. In combination with Finding F3 (no auth before routing), this is an open-relay shape, although the actual exploitability depends on whether upstream firewalls restrict who can reach the SIP port.

**Recommendation.**
```opensips-cfg
# GOOD
if (is_method("INVITE")) {
    if (!has_totag()) {
        if (!is_myself("$rd")) {
            send_reply(403, "Forbidden");
            exit;
        }
        # then: auth, then accounting, then t_relay
    } else {
        loose_route();
    }
    t_relay();
}
```

**Why confidence is medium, not high.** The deterministic rule shape (a `t_relay()` call without an enclosing `is_myself` guard in the same route) is present, but the dataflow pass identified that the cfg includes a `permissions` module load at line 15, which could indicate an `allow_routing()`-based control elsewhere. The semantic-pass judge re-read the request_route and confirmed that no `allow_routing()` invocation reaches this path; finding promoted to `judge_confirmed`.

**Grounding.**
- parser_nodes: `function_call:t_relay:85`
- semantic_pass_notes: "no `allow_routing()` reachable from line 85; no `is_myself` guard"

---

### F7 — No flood/DoS protection (pike, ratelimit absent) [dos_defense]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-007` |
| **Rule** | `OSIPS-SEC-DOS-001` v1.0 (`no-pike`) |
| **Severity** | **Medium** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CVSS 4.0** | `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N` (6.9) |
| **CWE** | CWE-770 (Allocation of Resources Without Limits or Throttling) |
| **Location** | (module-load section, lines 1–18) |
| **Fingerprint** | `sha256/v1:b507…91ff` |

**Evidence.** Neither `pike.so` nor `ratelimit.so` is in the loaded modules. No `pike_check_req()` or `rl_check()` invocations in any route.

**Rationale.** A public-facing edge proxy without per-source flood protection or per-method rate limiting is exposed to trivial DoS by repeated unauthenticated requests. The combination of "public-facing" (intake answer 2), "no upstream proxy" (intake answer 4), and "no pike/ratelimit" puts this at medium severity.

**Recommendation.**
```opensips-cfg
loadmodule "pike.so"
modparam("pike", "sampling_time_unit", 2)
modparam("pike", "reqs_density_per_unit", 20)
modparam("pike", "remove_latency", 4)

loadmodule "ratelimit.so"

request_route {
    pike_check_req();
    if (is_method("REGISTER")) { rl_check_pipe("0", "TAILDROP", "10"); }
    if (is_method("INVITE"))   { rl_check_pipe("1", "TAILDROP", "30"); }
    # ...
}
```

---

### F8 — `xlog` includes Authorization header [tracing_and_logging]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-008` |
| **Rule** | `OSIPS-SEC-LOG-001` v1.0 (`xlog-leaks-auth-headers`) |
| **Severity** | **Low** |
| **Confidence** | Medium |
| **Verification status** | `judge_confirmed` |
| **Kind** | vulnerability |
| **CWE** | CWE-532 (Insertion of Sensitive Information into Log File) |
| **Location** | `vulnerable-mixed.cfg:84` |
| **Fingerprint** | `sha256/v1:f013…7c6a` |

**Evidence.**
```opensips-cfg
xlog("L_NOTICE", "INVITE from $fU header: $hdr(Authorization)\n");
```

**Rationale.** `$hdr(Authorization)` for digest auth contains a base64-encoded credential challenge response (qop=auth) including the response hash. Logging it at L_NOTICE writes credential material to syslog and any downstream log aggregation. The same applies to `Proxy-Authorization`. Severity is low because the digest response is not directly reusable (nonce-bound), but the disclosure violates least-privilege logging and may aid offline analysis.

**Recommendation.** Drop the header from the log line, or redact:

```opensips-cfg
# GOOD
xlog("L_NOTICE", "INVITE from $fU\n");
```

**Why confidence is medium, not high.** The pattern matches the rule's regex but the same pattern could legitimately appear in a debug build that the operator strips before deployment. The semantic-pass judge weighed the cfg's other indicators (auth_jwt loaded, dialog module loaded, public-facing intake answer) and concluded a production deployment is intended, promoting to `judge_confirmed` with confidence medium.

---

### F9 — Cleartext credentials in `modparam` [config_hygiene]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-009` |
| **Rule** | `OSIPS-SEC-CFG-001` v1.0 (`cleartext-credentials-modparam`) |
| **Severity** | **Low** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CWE** | CWE-256 (Plaintext Storage of a Password), CWE-798 (Use of Hard-coded Credentials) |
| **Location** | `vulnerable-mixed.cfg:13`, `:49` |
| **Fingerprint** | `sha256/v1:a0f3…dc44` |

**Evidence.**
```opensips-cfg
modparam("auth_jwt", "db_url", "mysql://opensips:opensipspw@db.internal/opensips")
# ...
modparam("usrloc",   "db_url", "mysql://opensips:opensipspw@db.internal/opensips")
```

**Rationale.** Database passwords appear in cleartext in the cfg. Anyone with read access to the cfg, the running OpenSIPS process memory, or backups picks them up. Severity is low only because the database is on `db.internal` and presumably segmented; promote to high if the DB is reachable beyond the server.

**Recommendation.** Use `include_file` to extract the secret to a separate file with restrictive POSIX permissions, or move the credential to an environment variable expanded at startup:

```opensips-cfg
# GOOD — extract secret block, file is 0400 root:opensips
include_file "/etc/opensips/secrets.cfg"

# /etc/opensips/secrets.cfg
modparam("auth_jwt", "db_url", "mysql://opensips:CHANGEME@db.internal/opensips")
modparam("usrloc",   "db_url", "mysql://opensips:CHANGEME@db.internal/opensips")
```

(Filesystem permissions on `/etc/opensips/secrets.cfg` should also enforce the boundary; the cfg-level extraction reduces accidental disclosure via cfg backups.)

---

### F10 — `auth_db` uses `calculate_ha1=1` (plaintext password column) [auth, info]

| Field | Value |
|---|---|
| **Finding ID** | `F-2026-04-27-010` |
| **Rule** | `OSIPS-SEC-AUTH-001` v1.0 (`plaintext-ha1`) |
| **Severity** | **Info** |
| **Confidence** | High |
| **Verification status** | `deterministic_confirmed` |
| **Kind** | vulnerability |
| **CWE** | CWE-257 (Storing Passwords in a Recoverable Format) |
| **Location** | `vulnerable-mixed.cfg:19` |
| **Fingerprint** | `sha256/v1:ce40…07b1` |

**Evidence.**
```opensips-cfg
modparam("auth_db", "calculate_ha1", 1)
```

**Rationale.** `calculate_ha1=1` instructs `auth_db` to read a cleartext `password` column and compute HA1 at request time, which means the database stores recoverable passwords. Severity is **info** here, not higher, because the deployment intake declared "enterprise PBX with internal database" and the rule's promotion-to-low criteria require either external DB exposure or shared accounts — neither was confirmed. The recommended mitigation is still to migrate to HA1B-only storage so the DB never holds recoverable secrets.

**Recommendation.**
```opensips-cfg
# GOOD
modparam("auth_db", "calculate_ha1", 0)   # use precomputed ha1 / ha1b column
modparam("auth_db", "password_column",  "ha1")
modparam("auth_db", "password_column_2", "ha1b")  # if domain-aware HA1
```

Migration: add `ha1` and `ha1b` columns, populate from existing cleartext, then drop the cleartext column.

---

## Remediation Roadmap

| ID | Title | Severity | Effort | Priority |
|---|---|---|---|---|
| F1 | auth_jwt CVE-2026-25554 | Critical | M (upgrade) / S (cfg interim) | **This week** |
| F2 | mi_http public bind | Critical | XS | **This week** |
| F3 | Auth applied after routing | High | M | **This week** |
| F4 | $fU into avp_db_query | High | S | **This sprint** |
| F5 | TLS verify_cert disabled | High | S | **This sprint** |
| F6 | Possible open relay | Medium | M | **This sprint** |
| F7 | No flood/DoS protection | Medium | S | **This sprint** |
| F8 | xlog leaks Authorization | Low | XS | **This quarter** |
| F9 | Cleartext DB credentials | Low | S | **This quarter** |
| F10 | calculate_ha1=1 (info) | Info | M (DB migration) | Optional |

Effort scale: XS (<15 min), S (<1 hr), M (<1 day), L (<1 week).
Priority buckets per `22_REPORT_TEMPLATES.md`: this week / this sprint / this quarter / optional.

---

## Appendix A — SARIF 2.1.0 Output (excerpt)

```json
{
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "opensips-advisor",
          "version": "0.1.0",
          "rules": [
            {
              "id": "OSIPS-SEC-AUTH-004",
              "name": "jwt-db-mode-cve",
              "shortDescription": { "text": "auth_jwt db_mode=1 on a version vulnerable to CVE-2026-25554" },
              "defaultConfiguration": { "level": "error" },
              "properties": {
                "opensips-advisor/severity": "critical",
                "opensips-advisor/module_family": "auth",
                "opensips-advisor/cvss_v4_vector": "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N",
                "security-severity": "8.3",
                "tags": ["security", "external/cwe/cwe-89", "external/cve/CVE-2026-25554"]
              }
            }
            // ... 9 more rule descriptors ...
          ],
          "taxa": [
            { "id": "CWE-89", "name": "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')" }
            // ...
          ]
        }
      },
      "results": [
        {
          "ruleId": "OSIPS-SEC-AUTH-004",
          "level": "error",
          "message": { "text": "auth_jwt configured with db_mode=1 on OpenSIPS 3.6.2 (vulnerable to CVE-2026-25554)" },
          "locations": [{
            "physicalLocation": {
              "artifactLocation": { "uri": "vulnerable-mixed.cfg" },
              "region": { "startLine": 12, "endLine": 14 }
            }
          }],
          "fixes": [{
            "description": { "text": "Upgrade OpenSIPS to 3.6.4+, or set db_mode=0 with file-loaded JWT keys." },
            "artifactChanges": [{
              "artifactLocation": { "uri": "vulnerable-mixed.cfg" },
              "replacements": [{
                "deletedRegion": { "startLine": 14 },
                "insertedContent": { "text": "modparam(\"auth_jwt\", \"db_mode\", 0)\nmodparam(\"auth_jwt\", \"key_set\", \"main:/etc/opensips/jwt_keys.json\")" }
              }]
            }]
          }],
          "partialFingerprints": { "stable/v1": "7f3c…a1d9" },
          "properties": {
            "opensips-advisor/finding_id": "F-2026-04-27-001",
            "opensips-advisor/confidence": "high",
            "opensips-advisor/verification_status": "deterministic_confirmed",
            "opensips-advisor/kind": "vulnerability",
            "opensips-advisor/suppressible": false
          }
        }
        // ... 9 more results, same shape ...
      ],
      "properties": {
        "opensips-advisor/profile": "L1",
        "opensips-advisor/opensips_version_detected": "3.6.2",
        "opensips-advisor/findings_by_severity": {
          "critical": 2, "high": 3, "medium": 2, "low": 2, "info": 1
        }
      }
    }
  ]
}
```

---

## Appendix B — Suppressions & Deferred

_No active suppressions._ F1 (CVE-gated) is `suppressible: false` and would not be silenced even if a suppression record were present.

---

## Appendix D — Engine Diagnostics

| Phase | Rules executed | Findings raised | Wall time |
|---|---|---|---|
| Parse | — | — | 0.5s |
| Structural | 19 | 4 (F2, F3, F7, F9) | 1.2s |
| Value/Pattern | 14 | 3 (F1, F5, F10) | 1.7s |
| Dataflow/Taint | 7 | 1 (F4) | 5.6s |
| Semantic/Contextual | 7 | 2 (F6, F8) | 7.0s |
| Triage + verification | — | — | 1.4s |
| **Total** | **47** | **10** | **17.4s** |

**Verification status summary.** 8 `deterministic_confirmed`, 2 `judge_confirmed` (F6 open-relay, F8 xlog-leak). 0 `judge_dissented`. 0 `unchecked`.
