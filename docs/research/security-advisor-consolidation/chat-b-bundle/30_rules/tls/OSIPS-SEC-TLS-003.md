---
id: OSIPS-SEC-TLS-003
name: weak-tls-method
title: tls_mgm method allows SSLv3, TLS 1.0, or TLS 1.1 — protocol downgrade exposure
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tls
applies_if_modules_loaded: [tls_mgm]
applies_if_opensips_version: ">=3.2"
phase: [value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-326, CWE-327, CWE-757]
owasp: ["A02:2021-Cryptographic Failures"]
attack: [T1557, T1573]
tags: [tls, protocol-version, downgrade, sslv3, tls10, tls11, tls_mgm]

references:
  - https://opensips.org/docs/modules/3.4.x/tls_mgm.html
  - https://datatracker.ietf.org/doc/html/rfc8996
  - https://datatracker.ietf.org/doc/html/rfc7525
  - 90_reference/01_master_vulnerability_reference.md#section-6

short_description: |
  tls_mgm's method (or tls_method) parameter is set to a value that allows
  SSLv3, TLS 1.0, or TLS 1.1. These protocol versions have known cryptographic
  weaknesses (POODLE on SSLv3; BEAST/Lucky13 on TLS 1.0; deprecated per RFC 8996).
  A MITM can force a downgrade to the weakest enabled version before the
  cryptographic-strength controls of newer versions take effect.
---

## Rationale

The TLS protocol negotiates a version during handshake — the client offers a maximum, the server selects the highest mutually-supported version. When the server allows SSLv3, TLS 1.0, or TLS 1.1, an attacker on the path can manipulate the handshake to force selection of the weakest enabled version.

Specific attacks:

- **SSLv3** — POODLE (CVE-2014-3566) exploits CBC padding oracle. SSLv3 should never be enabled in any deployment.
- **TLS 1.0** — BEAST (CVE-2011-3389), Lucky13 (CVE-2013-0169), deprecation per RFC 8996 (March 2021).
- **TLS 1.1** — same deprecation as TLS 1.0; no widely-deployed clients require it.

RFC 7525 (BCP 195) and RFC 8996 make TLS 1.2 the minimum acceptable version for production deployments. TLS 1.3 is preferred.

OpenSIPS' `tls_mgm` accepts the `method` parameter with values like:

- `SSLv23` — accepts SSLv3, TLS 1.0, 1.1, 1.2 (legacy "any" alias).
- `SSLv3` — SSLv3 only. Always wrong.
- `TLSv1` / `TLSv1.0` — TLS 1.0 only. Wrong.
- `TLSv1.1` — TLS 1.1 only. Wrong.
- `TLSv1.2` — TLS 1.2 only. Acceptable; conservative.
- `TLSv1_2+` (or `TLSv1.2+`) — TLS 1.2 and above. Recommended.
- `TLSv1.3` — TLS 1.3 only. Strongest.

Source: Phase 2 master vulnerability reference §6; RFC 8996; RFC 7525.

## Default Value

The default `method` value varies by OpenSIPS version and underlying TLS library. Some versions default to `SSLv23` (unsafe by name); others default to `TLSv1_2`. The operator should set `method` explicitly in every deployment.

## Audit

The rule fires when:

1. `tls_mgm` is loaded.
2. `method` (or `tls_method` on versions that use that name) is set to one of: `SSLv23`, `SSLv3`, `TLSv1`, `TLSv1.0`, `TLSv1.1`, `TLSv1.0+`, `TLSv1.1+`.

Acceptable values: `TLSv1.2`, `TLSv1_2+`, `TLSv1.2+`, `TLSv1.3`.

When the parameter is unset, the rule emits at `confidence: medium` because the default depends on version and library.

## Remediation

1. **Set the minimum version to TLS 1.2:**

   ```opensips
   modparam("tls_mgm", "method", "TLSv1_2+")
   ```

2. **For TLS 1.3 only:**

   ```opensips
   modparam("tls_mgm", "method", "TLSv1.3")
   ```

3. **Combine with cipher-list hardening** (`OSIPS-SEC-TLS-004`).

## Example — BAD

```opensips
modparam("tls_mgm", "method", "SSLv23")
```

```opensips
modparam("tls_mgm", "method", "TLSv1.0+")
```

## Example — GOOD

```opensips
modparam("tls_mgm", "method", "TLSv1_2+")
```

```opensips
modparam("tls_mgm", "method", "TLSv1.3")
```

## Version Notes

The `method` parameter naming varies slightly across releases — `TLSv1_2+` (underscore) vs `TLSv1.2+` (dot); both are accepted by the advisor. Some versions accept `tls_method` as an alias for `method`.

TLS 1.3 support requires OpenSSL 1.1.1+ or wolfSSL 4.0+.

## False-Positive Considerations

- **Legacy hardware compatibility.** Some 2010s-era ATAs support only TLS 1.0. Isolate on a dedicated listener with per-domain TLS configuration.
- **Client-side TLS to legacy carriers.** Escalate with the carrier; do not weaken global posture. Suppress with `expires` matching upgrade commitment.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-TLS-001` (verify-cert-disabled) — even with TLS 1.2+, no validation = no auth.
- `OSIPS-SEC-TLS-004` (weak-ciphers) — protocol version + cipher list interact.
- `OSIPS-SEC-MI_EXPOSURE-005` (httpd-cleartext) — `httpd` has its own `tls_method`.

## Additional References

- Phase 2 master vulnerability reference §6
- OpenSIPS tls_mgm: https://opensips.org/docs/modules/3.4.x/tls_mgm.html
- RFC 8996 — Deprecating TLS 1.0 and TLS 1.1
- RFC 7525 — Recommendations for Secure Use of TLS (BCP 195)
- CWE-326 — Inadequate Encryption Strength
- CWE-327 — Use of a Broken or Risky Cryptographic Algorithm
- CWE-757 — Selection of Less-Secure Algorithm During Negotiation
- OWASP A02:2021 — Cryptographic Failures
