---
id: OSIPS-SEC-TLS-005
name: tls-key-world-readable
title: tls_mgm private_key path indicates world-readable or shared-PEM filesystem permissions
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tls
applies_if_modules_loaded: [tls_mgm]
applies_if_opensips_version: ">=3.2"
phase: [value_pattern, semantic_contextual]
profile: [L1, L2]
automated: false
suppressible: true

severity: high
confidence: medium
security_severity: 7.8
cvss_v4_vector: "CVSS:4.0/AV:L/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-732, CWE-200, CWE-922]
owasp: ["A02:2021-Cryptographic Failures", "A05:2021-Security Misconfiguration"]
attack: [T1552.004]
tags: [tls, private-key, file-permissions, key-disclosure, tls_mgm, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/tls_mgm.html
  - https://cwe.mitre.org/data/definitions/732.html
  - 90_reference/01_master_vulnerability_reference.md#section-6

short_description: |
  tls_mgm's private_key parameter points at a path pattern suggesting
  world-readable or shared-PEM filesystem permissions — paths under /tmp,
  /var/tmp, /var/www, user home directories, or paths equal to the certificate
  path (combined PEM file). The advisor cannot inspect filesystem permissions;
  emits review_required so the operator confirms posture.
---

## Rationale

A TLS private key is a credential. Possession allows decryption of captured TLS traffic (when forward-secret cipher suites are not in use) and impersonation. The key's filesystem confidentiality is directly equivalent to the deployment's TLS-layer security.

Three failure patterns:

1. **World-readable path** — `private_key` points under `/tmp`, `/var/tmp`, `/var/www`, or any directory readable by every user.
2. **User-home path** — `private_key` in `/home/operator/...` or `/root/...`. Permissions vary; production keys belong under `/etc/opensips/tls/`.
3. **Combined PEM with cert** — `private_key` and `certificate` point at the same file. If permissions reflect the cert's "world-readable is fine" convention, the key is exposed.

Strong patterns the advisor recognizes as safe:

- Path under `/etc/opensips/tls/` or `/etc/ssl/private/`.
- `private_key` differs from `certificate`.
- Cfg comments document permissions explicitly.

This rule is `automated: false` because the actual exposure depends on filesystem permissions the advisor cannot inspect. It emits `review_required` and the operator confirms via `ls -la` and confirmation that the file is `0600` and owned by the OpenSIPS user.

Source: Phase 2 master vulnerability reference §6.5.

## Default Value

Not applicable — the rule checks operator-chosen paths.

## Audit

The rule fires when:

1. `private_key` matches:
   - `/tmp/...` or `/var/tmp/...`
   - `/var/www/...` or `/srv/www/...`
   - `/home/<user>/...`
   - Relative segments (`./...`, `../...`)
2. Or `private_key` equals `certificate` (combined PEM).
3. Or the path doesn't match a known-safe pattern (`/etc/opensips/tls/...`, `/etc/ssl/private/...`, `/etc/pki/...`) AND no cfg comment documents posture.

Emits at `confidence: medium` because path-based heuristics are imperfect.

## Remediation

1. **Move the key to an operationalized location:**

   ```opensips
   modparam("tls_mgm", "certificate", "/etc/opensips/tls/opensips_cert.pem")
   modparam("tls_mgm", "private_key", "/etc/opensips/tls/privkey.pem")
   ```

2. **Set permissions:**

   ```bash
   chown opensips:opensips /etc/opensips/tls/privkey.pem
   chmod 0600 /etc/opensips/tls/privkey.pem
   chmod 0750 /etc/opensips/tls
   ```

3. **For HSM-backed keys (production-grade):** OpenSSL's PKCS#11 engine; eliminates filesystem-permission concern.

## Example — BAD

```opensips
modparam("tls_mgm", "private_key", "/tmp/opensips_key.pem")
```

```opensips
modparam("tls_mgm", "private_key", "/home/operator/opensips_key.pem")
```

```opensips
modparam("tls_mgm", "certificate", "/etc/opensips/tls/combined.pem")
modparam("tls_mgm", "private_key", "/etc/opensips/tls/combined.pem")
```

## Example — GOOD

```opensips
modparam("tls_mgm", "certificate", "/etc/opensips/tls/opensips_cert.pem")
modparam("tls_mgm", "private_key", "/etc/opensips/tls/privkey.pem")
```

## Version Notes

`certificate` and `private_key` semantics stable across OpenSIPS 3.2-3.6. Per-domain TLS via `tls_mgm` domain table applies same path-pattern heuristics.

## False-Positive Considerations

- **Container deployments where /tmp is tmpfs per-container.** Suppress with documentation.
- **Lab and dev** — suppress with `expires`.
- **Custom installation paths** (`/opt/opensips/...`). Suppress with documentation.
- **Combined PEM with documented permission posture.** Suppress with `justification="combined PEM, 0600 perms verified"`.

## Related Rules

- `OSIPS-SEC-TLS-001` — peer cert validation.
- `OSIPS-SEC-CONFIG_HYGIENE-001` — same filesystem-confidentiality class for DB credentials.
- `OSIPS-SEC-CONFIG_HYGIENE-003` — filesystem permissions on cfg includes.

## Additional References

- Phase 2 master vulnerability reference §6.5
- OpenSIPS tls_mgm: https://opensips.org/docs/modules/3.4.x/tls_mgm.html
- CWE-732 — Incorrect Permission Assignment for Critical Resource
- CWE-200 — Exposure of Sensitive Information
- CWE-922 — Insecure Storage of Sensitive Information
- OWASP A02:2021, A05:2021
- MITRE ATT&CK T1552.004
