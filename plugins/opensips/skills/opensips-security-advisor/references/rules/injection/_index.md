# Injection

Rules in this family target SQL, shell, header, and template injection: unsanitized pseudo-variable interpolation into queries, exec calls, header manipulation, and AVPOps misuse.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-INJ-001 | SIP-sourced pseudo-variable flows into avp_db_query without s.escape.common — pre-auth SQL injection | high |
| OSIPS-SEC-INJ-002 | SIP-sourced pseudo-variable flows into sqlops raw sql_query() — SQL injection on 3.5+ | high |
| OSIPS-SEC-INJ-003 | SIP-sourced pseudo-variable flows into exec_msg/exec_dset/exec_avp shell command — pre-auth RCE | critical |
| OSIPS-SEC-INJ-004 | exec_avp/exec_dset captures shell output into script variables — output-channel injection | high |
| OSIPS-SEC-INJ-005 | SIP-sourced pseudo-variable flows into cache_* key/value without validation — cache-key injection | medium |
| OSIPS-SEC-INJ-006 | SIP-sourced pseudo-variable flows into append_hf without CRLF stripping — header injection | high |
