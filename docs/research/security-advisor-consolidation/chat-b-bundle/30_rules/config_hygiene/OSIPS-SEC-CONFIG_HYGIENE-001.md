---
id: OSIPS-SEC-CONFIG_HYGIENE-001
name: cleartext-credentials-modparam
title: db_url, cachedb_url, or similar modparam contains cleartext password
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: config_hygiene
applies_if_modules_loaded: []
applies_if_opensips_version: ">=3.2"
phase: [value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 6.5
cvss_v4_vector: "CVSS:4.0/AV:L/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-256, CWE-260, CWE-200]
owasp: ["A02:2021-Cryptographic Failures"]
attack: [T1552.001, T1552.004]
tags: [credentials, modparam, db_url, cachedb_url, cleartext, hygiene]

references:
  - https://opensips.org/docs/modules/3.4.x/db_mysql.html
  - 90_reference/01_master_vulnerability_reference.md#section-12

short_description: |
  modparam value contains cleartext credential — DB URL with user:password@host
  syntax, cache backend URL with embedded credentials, or API token. The cfg
  file's filesystem permissions become the credential's confidentiality boundary.
---

## Rationale

OpenSIPS modparam values read at startup from cfg file. Many modules accept connection strings with embedded credentials: `db_url = "mysql://opensips:secret@db/opensips"`, `cachedb_url = "redis://:secret@redis.example/0"`, API tokens via modparam.

Cfg confidentiality bounded by: filesystem permissions (typically 0644 default — world-readable); backup posture; log inclusion (cfg sometimes logged at startup); source-control storage (often in git).

Remediation: env-var substitution, file-based secrets, external secret management (Vault, AWS Secrets Manager).

Severity is medium because exploitation requires local-host or supply-chain access; impact when triggered is high (DB access, full subscriber data exposure).

Source: Phase 2 §12.

## Default Value

Not applicable.

## Audit

Fires when modparam values contain credential patterns:

1. `db_url`, `cachedb_url`, `db_uri`, similar containing `user:password@host` syntax with non-empty password.
2. `auth_token`, `api_key`, `secret`, similar named modparam with literal value (vs env-var form).

Does not fire when env-var substitution or file-based secret form is used.

## Remediation

Env-var:

```opensips
modparam("db_url_provider", "db_url", "${OPENSIPS_DB_URL}")
```

File-based:

```opensips
modparam("auth_db", "db_url", "file:///etc/opensips/secrets/db_url")
# /etc/opensips/secrets/db_url has 0600 perms
```

External secret manager (pre-startup):

```bash
sed "s|__DB_URL__|$(vault kv get -field=db_url secret/opensips)|" \
    /etc/opensips/opensips.cfg.template > /etc/opensips/opensips.cfg
chmod 0600 /etc/opensips/opensips.cfg
```

## Example — BAD

```opensips
modparam("auth_db", "db_url", "mysql://opensips:supersecret@db/opensips")
```

## Example — GOOD

```opensips
modparam("auth_db", "db_url", "${OPENSIPS_DB_URL}")
```

## Version Notes

Env-var substitution support has evolved across releases.

## False-Positive Considerations

- Lab and dev with throwaway credentials. Suppress with `expires`.
- Cfgs intentionally cleartext for development simplicity. Same.

## Related Rules

- `OSIPS-SEC-TLS-005` (tls-key-world-readable)
- `OSIPS-SEC-MI_EXPOSURE-001` — MI access exfiltrates modparam credentials.
- `OSIPS-SEC-AUTH-001` — plaintext HA1 same class on subscriber data.

## Additional References

- Phase 2 §12
- CWE-256, CWE-260
- OWASP A02:2021
- MITRE ATT&CK T1552.001 / T1552.004
