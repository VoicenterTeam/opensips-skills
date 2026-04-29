---
id: OSIPS-SEC-TLS-006
name: no-peer-verify-check
title: TLS-using cfg has no script-level is_peer_verified() check or relies on tls_mgm defaults
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tls
applies_if_modules_loaded: [tls_mgm]
applies_if_opensips_version: ">=3.2"
phase: [structural, semantic_contextual]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-1188, CWE-295]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1078]
tags: [tls, hardening, defense-in-depth, is_peer_verified, tls_mgm]

references:
  - https://opensips.org/docs/modules/3.4.x/tls_mgm.html
  - 90_reference/01_master_vulnerability_reference.md#section-6

short_description: |
  The cfg uses TLS but either relies on tls_mgm defaults for verify_cert/
  require_cert/method/ciphers_list (rather than setting them explicitly), or
  has no script-level is_peer_verified() check in routes that handle
  TLS-arrived traffic. Hardening gap rather than active vulnerability —
  the cfg may be safe today and become unsafe after an OpenSIPS upgrade
  that changes defaults.
---

## Rationale

`OSIPS-SEC-TLS-001` through `-005` cover specific TLS misconfigurations the operator has explicitly chosen. This rule covers the related case where the operator has *not* made explicit choices — they're relying on `tls_mgm`'s defaults and the absence of script-level verification.

Two related concerns:

1. **Reliance on defaults.** Defaults vary across OpenSIPS releases. A cfg safe today because `tls_mgm` defaults to `verify_cert=1` may become unsafe after an upgrade. Setting parameters explicitly removes the version-dependence and documents intent.

2. **Missing script-level peer verification.** Even when `tls_mgm` is correctly configured, the route logic should explicitly check `is_peer_verified()` before processing TLS-arrived requests. Defense in depth: if the modparam configuration is later regressed, the script-level check prevents unverified peers from reaching auth or routing logic.

Hardening recommendation, not active vulnerability claim. L2 because L1 deployments commonly rely on defaults; L2 carrier-grade is expected to make every TLS choice explicit.

This rule complements `OSIPS-SEC-TLS-001`: TLS-001 fires when `verify_cert=0` is explicit; TLS-006 fires when unset entirely.

Source: Phase 2 master vulnerability reference §6.

## Default Value

Not applicable — checks for presence of explicit configuration.

## Audit

The rule fires when:

1. The cfg uses TLS (`proto_tls`, `proto_wss`) AND any of the following are unset:
   - `verify_cert`
   - `require_cert` (server-to-server scenarios per TLS-002 heuristics)
   - `method` (or `tls_method`)
   - `ciphers_list`
   - `ca_list` (when `verify_cert=1`)
2. Or the cfg uses TLS AND no `is_peer_verified()` call appears in any route processing TLS-arrived requests.

Emits at `confidence: medium`.

## Remediation

1. **Set every TLS parameter explicitly:**

   ```opensips
   modparam("tls_mgm", "tls_library", "openssl")
   modparam("tls_mgm", "certificate", "/etc/opensips/tls/cert.pem")
   modparam("tls_mgm", "private_key", "/etc/opensips/tls/privkey.pem")
   modparam("tls_mgm", "ca_list",     "/etc/opensips/tls/calist.pem")
   modparam("tls_mgm", "method",      "TLSv1_2+")
   modparam("tls_mgm", "verify_cert", "1")
   modparam("tls_mgm", "require_cert","1")
   modparam("tls_mgm", "ciphers_list","EECDH+AESGCM:EDH+AESGCM")
   modparam("tls_mgm", "crl_check_all","1")
   ```

2. **Add `is_peer_verified()` in routes:**

   ```opensips
   route {
       if (proto == TLS) {
           if (!is_peer_verified()) {
               send_reply(403, "TLS peer not verified");
               exit;
           }
       }
   }
   ```

## Example — BAD

```opensips
loadmodule "proto_tls.so"
loadmodule "tls_mgm.so"

modparam("tls_mgm", "certificate", "/etc/opensips/tls/cert.pem")
modparam("tls_mgm", "private_key", "/etc/opensips/tls/privkey.pem")
# verify_cert, require_cert, method, ciphers_list all unset

listen=tls:0.0.0.0:5061

route {
    # No is_peer_verified() check
    if (is_method("INVITE")) {
        # ... routing
    }
}
```

## Example — GOOD

```opensips
loadmodule "proto_tls.so"
loadmodule "tls_mgm.so"
loadmodule "tls_openssl.so"

modparam("tls_mgm", "tls_library",  "openssl")
modparam("tls_mgm", "certificate",  "/etc/opensips/tls/cert.pem")
modparam("tls_mgm", "private_key",  "/etc/opensips/tls/privkey.pem")
modparam("tls_mgm", "ca_list",      "/etc/opensips/tls/calist.pem")
modparam("tls_mgm", "method",       "TLSv1_2+")
modparam("tls_mgm", "verify_cert",  "1")
modparam("tls_mgm", "require_cert", "1")
modparam("tls_mgm", "ciphers_list", "EECDH+AESGCM:EDH+AESGCM")
modparam("tls_mgm", "crl_check_all","1")

listen=tls:0.0.0.0:5061

route {
    if (proto == TLS) {
        if (!is_peer_verified()) {
            send_reply(403, "TLS peer not verified");
            exit;
        }
    }
    # ... rest of routing
}
```

## Version Notes

`is_peer_verified()` exposed by `tls_mgm` across OpenSIPS 3.2-3.6 with stable semantics.

## False-Positive Considerations

- **Per-domain TLS configuration** with explicit per-domain parameters legitimately has unset top-level parameters. Suppress.
- **Cfgs that defer TLS posture to a reverse proxy.** Rule does not fire when no `proto_tls`/`proto_wss` is loaded.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-TLS-001` — `verify_cert=0` explicit; this rule covers unset.
- `OSIPS-SEC-TLS-002` — `require_cert=0` on server-to-server; this rule covers unset.
- `OSIPS-SEC-TLS-003` — explicit weak method; this rule covers unset.
- `OSIPS-SEC-TLS-004` — explicit weak ciphers; this rule covers unset.

## Additional References

- Phase 2 master vulnerability reference §6
- OpenSIPS tls_mgm: https://opensips.org/docs/modules/3.4.x/tls_mgm.html
- CWE-1188 — Insecure Default Initialization of Resource
- CWE-295 — Improper Certificate Validation
- OWASP A05:2021
