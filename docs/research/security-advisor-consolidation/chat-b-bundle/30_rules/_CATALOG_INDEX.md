# OpenSIPS Security Advisor — Rule Catalog Index

This index lists every rule across all twelve module families. For per-family
context and threat-model framing, follow the `_index.md` link in each section.
For the rule's full schema, audit logic, and remediation, follow the rule-ID
link.

**Total rules in catalog:** 58
**Module families:** 12
**Schema:** see `10_overview/12_RULE_CATALOG_SCHEMA_addendum.md` (and base canonical schema doc when authored)
**Severity levels used:** critical, high, medium, low
**Profiles:** L1 (enterprise PBX baseline), L2 (carrier-grade / regulated)

---

## Authentication — `auth/`

See [`auth/_index.md`](auth/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-AUTH-001](auth/OSIPS-SEC-AUTH-001.md) | Plaintext HA1 storage enabled in auth_db | high | L1, L2 |
| [OSIPS-SEC-AUTH-002](auth/OSIPS-SEC-AUTH-002.md) | t_relay() reachable on INVITE before proxy_authorize() | high | L1, L2 |
| [OSIPS-SEC-AUTH-003](auth/OSIPS-SEC-AUTH-003.md) | www_authorize/proxy_authorize return value ignored or no challenge | high | L1, L2 |
| [OSIPS-SEC-AUTH-004](auth/OSIPS-SEC-AUTH-004.md) | auth_jwt in DB mode on vulnerable version (CVE-2026-25554) | critical | L1, L2 |
| [OSIPS-SEC-AUTH-005](auth/OSIPS-SEC-AUTH-005.md) | Authentication challenge issued without source check or rate-limit | high | L2 |
| [OSIPS-SEC-AUTH-006](auth/OSIPS-SEC-AUTH-006.md) | nonce_expire too long or qop disabled | medium | L1, L2 |
| [OSIPS-SEC-AUTH-007](auth/OSIPS-SEC-AUTH-007.md) | auth_jwt loaded without explicit algorithm pinning | critical | L1, L2 |
| [OSIPS-SEC-AUTH-008](auth/OSIPS-SEC-AUTH-008.md) | JWT claim flows into SQL/file/REST sink before signature verification | high | L1, L2 |

---

## Injection — `injection/`

See [`injection/_index.md`](injection/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-INJECTION-001](injection/OSIPS-SEC-INJECTION-001.md) | SIP-sourced PV → avp_db_query without s.escape.common | high | L1, L2 |
| [OSIPS-SEC-INJECTION-002](injection/OSIPS-SEC-INJECTION-002.md) | SIP-sourced PV → sqlops raw sql_query() on 3.5+ | high | L1, L2 |
| [OSIPS-SEC-INJECTION-003](injection/OSIPS-SEC-INJECTION-003.md) | SIP-sourced PV → exec_msg/exec_dset/exec_avp command | critical | L1, L2 |
| [OSIPS-SEC-INJECTION-004](injection/OSIPS-SEC-INJECTION-004.md) | exec_avp/exec_dset captured output → privileged sink | high | L1, L2 |
| [OSIPS-SEC-INJECTION-005](injection/OSIPS-SEC-INJECTION-005.md) | SIP-sourced PV → cachedb_* key/value without validation | medium | L1, L2 |
| [OSIPS-SEC-INJECTION-006](injection/OSIPS-SEC-INJECTION-006.md) | SIP-sourced PV → append_hf/replace_hdrs without CRLF stripping | high | L1, L2 |

---

## MI Exposure — `mi_exposure/`

See [`mi_exposure/_index.md`](mi_exposure/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-MI_EXPOSURE-001](mi_exposure/OSIPS-SEC-MI_EXPOSURE-001.md) | mi_http / httpd bound to non-loopback | critical | L1, L2 |
| [OSIPS-SEC-MI_EXPOSURE-002](mi_exposure/OSIPS-SEC-MI_EXPOSURE-002.md) | mi_datagram bound to udp:/tcp: socket | critical | L1, L2 |
| [OSIPS-SEC-MI_EXPOSURE-003](mi_exposure/OSIPS-SEC-MI_EXPOSURE-003.md) | MI module loaded without trusted-clients allow-list | medium | L2 |
| [OSIPS-SEC-MI_EXPOSURE-004](mi_exposure/OSIPS-SEC-MI_EXPOSURE-004.md) | Deprecated mi_xmlrpc loaded on 3.x | high | L1, L2 |
| [OSIPS-SEC-MI_EXPOSURE-005](mi_exposure/OSIPS-SEC-MI_EXPOSURE-005.md) | httpd configured without TLS on non-loopback bind | medium | L2 |

---

## TLS — `tls/`

See [`tls/_index.md`](tls/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-TLS-001](tls/OSIPS-SEC-TLS-001.md) | tls_mgm verify_cert=0 — peer cert validation disabled | high | L1, L2 |
| [OSIPS-SEC-TLS-002](tls/OSIPS-SEC-TLS-002.md) | tls_mgm require_cert=0 on server-to-server listener | medium | L2 |
| [OSIPS-SEC-TLS-003](tls/OSIPS-SEC-TLS-003.md) | tls_mgm method allows SSLv3 / TLS 1.0 / TLS 1.1 | high | L1, L2 |
| [OSIPS-SEC-TLS-004](tls/OSIPS-SEC-TLS-004.md) | tls_mgm ciphers_list set to ALL / DEFAULT / HIGH | high | L1, L2 |
| [OSIPS-SEC-TLS-005](tls/OSIPS-SEC-TLS-005.md) | tls_mgm private_key in suspicious filesystem path | high | L1, L2 |
| [OSIPS-SEC-TLS-006](tls/OSIPS-SEC-TLS-006.md) | TLS used without explicit parameters or is_peer_verified() | medium | L2 |
| [OSIPS-SEC-TLS-007](tls/OSIPS-SEC-TLS-007.md) | proto_wss without Origin allow-list | medium | L1, L2 |

---

## Relay and Routing — `relay_and_routing/`

See [`relay_and_routing/_index.md`](relay_and_routing/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-RELAY_AND_ROUTING-001](relay_and_routing/OSIPS-SEC-RELAY_AND_ROUTING-001.md) | t_relay() reachable without is_myself / source-trust | critical | L1, L2 |
| [OSIPS-SEC-RELAY_AND_ROUTING-002](relay_and_routing/OSIPS-SEC-RELAY_AND_ROUTING-002.md) | Preloaded Route headers from foreign UACs accepted | high | L1, L2 |
| [OSIPS-SEC-RELAY_AND_ROUTING-003](relay_and_routing/OSIPS-SEC-RELAY_AND_ROUTING-003.md) | permissions trust group contains wildcard | critical | L1, L2 |
| [OSIPS-SEC-RELAY_AND_ROUTING-004](relay_and_routing/OSIPS-SEC-RELAY_AND_ROUTING-004.md) | record_route() on REGISTER or MESSAGE | low | L2 |
| [OSIPS-SEC-RELAY_AND_ROUTING-005](relay_and_routing/OSIPS-SEC-RELAY_AND_ROUTING-005.md) | mf_process_maxfwd_header() missing or permissive | medium | L1, L2 |

---

## DoS Defense — `dos_defense/`

See [`dos_defense/_index.md`](dos_defense/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-DOS_DEFENSE-001](dos_defense/OSIPS-SEC-DOS_DEFENSE-001.md) | pike not loaded — no per-source rate limiting | medium | L1, L2 |
| [OSIPS-SEC-DOS_DEFENSE-002](dos_defense/OSIPS-SEC-DOS_DEFENSE-002.md) | ratelimit not loaded — no global rate limiting | medium | L2 |
| [OSIPS-SEC-DOS_DEFENSE-003](dos_defense/OSIPS-SEC-DOS_DEFENSE-003.md) | ratelimit loaded but pike not — asymmetric posture | medium | L1, L2 |
| [OSIPS-SEC-DOS_DEFENSE-004](dos_defense/OSIPS-SEC-DOS_DEFENSE-004.md) | rate-limit rejection uses send_reply instead of drop | low | L1, L2 |
| [OSIPS-SEC-DOS_DEFENSE-005](dos_defense/OSIPS-SEC-DOS_DEFENSE-005.md) | dialog loaded but no concurrent-call cap | medium | L2 |

---

## STIR/SHAKEN — `stir_shaken/`

See [`stir_shaken/_index.md`](stir_shaken/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-STIR_SHAKEN-001](stir_shaken/OSIPS-SEC-STIR_SHAKEN-001.md) | PAI used in routing without verification | high | L2 |
| [OSIPS-SEC-STIR_SHAKEN-002](stir_shaken/OSIPS-SEC-STIR_SHAKEN-002.md) | stir_shaken loaded but verify never called | medium | L2 |
| [OSIPS-SEC-STIR_SHAKEN-003](stir_shaken/OSIPS-SEC-STIR_SHAKEN-003.md) | verify return value ignored, attestation AVP used | high | L2 |
| [OSIPS-SEC-STIR_SHAKEN-004](stir_shaken/OSIPS-SEC-STIR_SHAKEN-004.md) | Outbound INVITEs without attestation | medium | L2 |

---

## Media — `media/`

See [`media/_index.md`](media/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-MEDIA-001](media/OSIPS-SEC-MEDIA-001.md) | rtpproxy/rtpengine loaded but engagement not called | medium | L1, L2 |
| [OSIPS-SEC-MEDIA-002](media/OSIPS-SEC-MEDIA-002.md) | Engagement gated on attacker-influenced predicates | medium | L1, L2 |
| [OSIPS-SEC-MEDIA-003](media/OSIPS-SEC-MEDIA-003.md) | rtpengine called without SRTP-required flags | medium | L2 |
| [OSIPS-SEC-MEDIA-004](media/OSIPS-SEC-MEDIA-004.md) | re-INVITE / late-offer not re-validated | medium | L2 |

---

## Tracing and Logging — `tracing_and_logging/`

See [`tracing_and_logging/_index.md`](tracing_and_logging/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-TRACING_AND_LOGGING-001](tracing_and_logging/OSIPS-SEC-TRACING_AND_LOGGING-001.md) | xlog with Authorization / credential headers | high | L1, L2 |
| [OSIPS-SEC-TRACING_AND_LOGGING-002](tracing_and_logging/OSIPS-SEC-TRACING_AND_LOGGING-002.md) | acc extra_fields contains credential PVs | medium | L2 |
| [OSIPS-SEC-TRACING_AND_LOGGING-003](tracing_and_logging/OSIPS-SEC-TRACING_AND_LOGGING-003.md) | proto_hep / siptrace public bind or remote cleartext | high | L1, L2 |
| [OSIPS-SEC-TRACING_AND_LOGGING-004](tracing_and_logging/OSIPS-SEC-TRACING_AND_LOGGING-004.md) | SIP-sourced PV in acc record without CRLF stripping | medium | L1, L2 |

---

## Identity Spoofing — `identity_spoofing/`

See [`identity_spoofing/_index.md`](identity_spoofing/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-IDENTITY_SPOOFING-001](identity_spoofing/OSIPS-SEC-IDENTITY_SPOOFING-001.md) | proxy_authorize without db_check_from | high | L1, L2 |
| [OSIPS-SEC-IDENTITY_SPOOFING-002](identity_spoofing/OSIPS-SEC-IDENTITY_SPOOFING-002.md) | uac_replace before acc | medium | L2 |
| [OSIPS-SEC-IDENTITY_SPOOFING-003](identity_spoofing/OSIPS-SEC-IDENTITY_SPOOFING-003.md) | PAI from $fU or other taint source | high | L1, L2 |

---

## Config Hygiene — `config_hygiene/`

See [`config_hygiene/_index.md`](config_hygiene/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-CONFIG_HYGIENE-001](config_hygiene/OSIPS-SEC-CONFIG_HYGIENE-001.md) | Cleartext credentials in modparam | medium | L1, L2 |
| [OSIPS-SEC-CONFIG_HYGIENE-002](config_hygiene/OSIPS-SEC-CONFIG_HYGIENE-002.md) | Module loaded but unused | low | L1, L2 |
| [OSIPS-SEC-CONFIG_HYGIENE-003](config_hygiene/OSIPS-SEC-CONFIG_HYGIENE-003.md) | mi_datagram unix socket in suspicious path | medium | L1, L2 |
| [OSIPS-SEC-CONFIG_HYGIENE-004](config_hygiene/OSIPS-SEC-CONFIG_HYGIENE-004.md) | startup_route invokes exec | medium | L1, L2 |

---

## Dispatcher and Load Balancer — `dispatcher_and_lb/`

See [`dispatcher_and_lb/_index.md`](dispatcher_and_lb/_index.md).

| ID | Title | Severity | Profile |
|---|---|---|---|
| [OSIPS-SEC-DISPATCHER_AND_LB-001](dispatcher_and_lb/OSIPS-SEC-DISPATCHER_AND_LB-001.md) | dispatcher without failover validation | medium | L2 |
| [OSIPS-SEC-DISPATCHER_AND_LB-002](dispatcher_and_lb/OSIPS-SEC-DISPATCHER_AND_LB-002.md) | load_balancer without source-trust admission | high | L1, L2 |
| [OSIPS-SEC-DISPATCHER_AND_LB-003](dispatcher_and_lb/OSIPS-SEC-DISPATCHER_AND_LB-003.md) | drouting do_routing without attempt cap | low | L2 |

---

## Severity distribution

| Severity | Count |
|---|---|
| critical | 6 |
| high | 22 |
| medium | 23 |
| low | 7 |
| **total** | **58** |

## Profile distribution

| Profile | Count |
|---|---|
| L1+L2 (baseline + carrier) | 41 |
| L2-only (carrier / regulated) | 17 |
| **total** | **58** |

## Phase distribution

Each rule declares one or more detection phases per `14_DETECTION_ENGINE.md`:

- **structural**: pattern-based AST/grep matching
- **value_pattern**: literal value matching against known-bad/good sets
- **dataflow_taint**: source-to-sink tracing across script flow
- **semantic_contextual**: LLM reasoning about cfg author intent

Multi-phase rules are common; the rule's frontmatter `phase` field lists all
applicable phases for that rule.

## Automated vs review_required

48 rules emit definitively (`automated: true`). 10 rules emit as
`review_required` (`automated: false`) by design — exposure depends on data the
advisor cannot inspect from cfg alone (filesystem perms, library versions,
DB-table contents, runtime topology). Per `15_CONFIDENCE_AND_VERIFICATION.md`,
operators close `review_required` findings via documented suppression with
justification text.

## Suppressible vs structural

55 rules are `suppressible: true` — operators can document deployment-specific
exceptions and silence the finding. 3 rules are `suppressible: false`:

- `OSIPS-SEC-AUTH-004` (jwt-db-mode-cve) — CVE-2026-25554, no safe form on vulnerable versions
- `OSIPS-SEC-INJECTION-003` (exec-msg-injection) — no safe interpolation form exists for shell commands

These rules can only be cleared by removing the offending pattern, not by
suppression with justification.
