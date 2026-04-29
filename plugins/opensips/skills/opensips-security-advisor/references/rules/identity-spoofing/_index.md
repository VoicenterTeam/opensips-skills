# Identity Spoofing

Rules in this family target caller-identity spoofing and From/To header abuse: unverified PAI, missing identity assertions, and inbound trust-boundary defects.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-ID-001 | proxy_authorize succeeded but db_check_from() not called — From URI not bound to authenticated user | high |
| OSIPS-SEC-ID-002 | uac_replace_from / uac_replace_to applied before accounting captures original identity | medium |
| OSIPS-SEC-ID-003 | P-Asserted-Identity constructed from $fU or other attacker-controlled value | high |
