# Authentication & Credential Storage

Rules in this family target authentication-related risks: weak credential storage, missing or bypassable challenge-response, insecure JWT or PAI handling, OpenSIPs CVE-2026-25554 (auth_jwt SQL injection).

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-AUTH-001 | Plaintext HA1 storage enabled in auth_db | high |
| OSIPS-SEC-AUTH-002 | t_relay() reachable on INVITE before proxy_authorize() — auth bypass via routing order | high |
| OSIPS-SEC-AUTH-003 | www_authorize/proxy_authorize return value ignored, or no challenge issued on failure | high |
| OSIPS-SEC-AUTH-004 | auth_jwt configured in DB mode on a vulnerable OpenSIPS version (CVE-2026-25554) | critical |
| OSIPS-SEC-AUTH-005 | Authentication challenge issued to untrusted sources without rate-limit or source check (SIP Digest Leak oracle) | high |
| OSIPS-SEC-AUTH-006 | nonce_expire too long or qop disabled — enlarged digest replay window | medium |
| OSIPS-SEC-AUTH-007 | auth_jwt configured without explicit algorithm pinning — alg=none / algorithm-confusion exposure | critical |
| OSIPS-SEC-AUTH-008 | JWT kid (or other claim) flows into a SQL/file/REST sink without sanitization | high |
