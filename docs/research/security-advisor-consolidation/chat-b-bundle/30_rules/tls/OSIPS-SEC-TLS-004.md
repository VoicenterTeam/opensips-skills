---
id: OSIPS-SEC-TLS-004
name: weak-ciphers
title: tls_mgm ciphers_list set to ALL, DEFAULT, or other permissive specs — weak suites enabled
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
cvss_v4_vector: "CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-326, CWE-327]
owasp: ["A02:2021-Cryptographic Failures"]
attack: [T1557, T1573]
tags: [tls, ciphers, weak-encryption, null-cipher, anonymous-cipher, tls_mgm]

references:
  - https://opensips.org/docs/modules/3.4.x/tls_mgm.html
  - https://datatracker.ietf.org/doc/html/rfc7525
  - https://wiki.mozilla.org/Security/Server_Side_TLS
  - 90_reference/01_master_vulnerability_reference.md#section-6

short_description: |
  tls_mgm's ciphers_list parameter is set to ALL, DEFAULT, HIGH, or another
  permissive specification that includes weak cipher suites — NULL, anonymous
  DH, RC4, 3DES, export-grade. The handshake can negotiate down to a suite
  providing no confidentiality (NULL), no authentication (anon DH), or
  known-broken encryption.
---

## Rationale

The cipher suite negotiated during TLS handshake determines actual encryption, authentication, and key exchange. Permissive cipher specs leave the door open for weak suites — typically when an attacker manipulates the handshake to force the weakest mutually-acceptable suite.

Weakness classes:

- **NULL ciphers** (`eNULL`, `NULL`) — no encryption.
- **Anonymous DH** (`aNULL`) — no authentication.
- **Export-grade** (`EXPORT`, `EXP`) — 40-bit keys, trivially breakable.
- **RC4** — RFC 7465 prohibits.
- **3DES** — Sweet32 (CVE-2016-2183).
- **MD5-based MAC** — collision-broken.
- **CBC mode without AEAD** — Lucky13, padding oracles.

Permissive specs commonly seen:

- `ALL` — every cipher OpenSSL supports. Includes NULL, anon, export, RC4, 3DES.
- `DEFAULT` — historically includes RC4 and 3DES.
- `HIGH` — high-strength per OpenSSL classification, but lags behind cryptographic consensus.
- `HIGH:!aNULL` — better, but still includes 3DES and CBC modes.

Recommended: explicit allow-list of AEAD + forward-secret suites. Mozilla "Intermediate" or the OpenSIPS-conventional `EECDH+AESGCM:EDH+AESGCM`.

Source: Phase 2 master vulnerability reference §6; Mozilla Server Side TLS; RFC 7525.

## Default Value

`ciphers_list`'s default depends on the underlying TLS library. Modern OpenSSL has hardened defaults but the operator should set `ciphers_list` explicitly.

## Audit

The rule fires when:

1. `ciphers_list` is set to a bare permissive alias: `ALL`, `DEFAULT`, `COMPLEMENTOFDEFAULT`, `MEDIUM`, `LOW`.
2. Or includes weak components without exclusion: `NULL`, `eNULL`, `aNULL` (without `!`), `EXPORT`, `EXP` (without `!`), `RC4`, `DES`/`3DES` (without `!`), `MD5` (without `!`), `IDEA`, `SEED`.
3. Or is `HIGH` / `HIGH:!aNULL` without further restriction (still includes 3DES and CBC).

Does not fire when `ciphers_list` is unset (covered by `OSIPS-SEC-TLS-006`) or when set to an explicit AEAD + forward-secret allow-list.

## Remediation

```opensips
modparam("tls_mgm", "ciphers_list", "EECDH+AESGCM:EDH+AESGCM")
```

Or full Mozilla Intermediate:

```opensips
modparam("tls_mgm", "ciphers_list",
    "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:"
    "ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:"
    "ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:"
    "DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384")
```

## Example — BAD

```opensips
modparam("tls_mgm", "ciphers_list", "ALL")
```

```opensips
modparam("tls_mgm", "ciphers_list", "HIGH")
```

```opensips
modparam("tls_mgm", "ciphers_list", "HIGH:!aNULL")
```

## Example — GOOD

```opensips
modparam("tls_mgm", "ciphers_list", "EECDH+AESGCM:EDH+AESGCM")
```

## Version Notes

`ciphers_list` syntax is OpenSSL-style. Stable across OpenSIPS 3.2 through 3.6. wolfSSL accepts most OpenSSL-style strings; defaults vary on unknown aliases.

For TLS 1.3, the cipher suite is selected from a fixed AEAD-only set; `ciphers_list` only affects TLS 1.2 and earlier.

## False-Positive Considerations

- **Legacy peers requiring 3DES.** Isolate per-domain.
- **Per-domain cipher configuration.** Per-domain settings override the global modparam.
- **Hardware crypto accelerators.** Recommended suites (AES-GCM, ChaCha20) are accelerated by every modern CPU.

## Related Rules

- `OSIPS-SEC-TLS-001` — cipher strength meaningless without peer validation.
- `OSIPS-SEC-TLS-003` — protocol version + cipher list interact.
- `OSIPS-SEC-TLS-006` — relying on defaults rather than setting `ciphers_list` explicitly.

## Additional References

- Phase 2 master vulnerability reference §6
- OpenSIPS tls_mgm: https://opensips.org/docs/modules/3.4.x/tls_mgm.html
- Mozilla Server Side TLS: https://wiki.mozilla.org/Security/Server_Side_TLS
- RFC 7525 — Recommendations for Secure Use of TLS
- RFC 7465 — Prohibiting RC4 Cipher Suites
- CWE-326, CWE-327
- OWASP A02:2021
