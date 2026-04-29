---
id: OSIPS-SEC-TLS-001
name: verify-cert-disabled
title: tls_mgm verify_cert=0 — peer certificate validation disabled, MITM exposed
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
security_severity: 8.1
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-295, CWE-297, CWE-345]
owasp: ["A02:2021-Cryptographic Failures", "A07:2021-Identification and Authentication Failures"]
attack: [T1557, T1573]
tags: [tls, certificate-validation, mitm, tls_mgm, peer-verification]

references:
  - https://opensips.org/docs/modules/3.4.x/tls_mgm.html
  - https://datatracker.ietf.org/doc/html/rfc7525
  - https://cwe.mitre.org/data/definitions/295.html
  - 90_reference/01_master_vulnerability_reference.md#section-6

short_description: |
  tls_mgm is configured with verify_cert=0, disabling validation of peer certificates
  during the TLS handshake. The TLS layer continues to encrypt traffic but provides
  no authentication of the peer's identity — any party that completes a TLS
  handshake is accepted, enabling man-in-the-middle attacks on a network-adjacent
  attacker.
---

## Rationale

TLS without peer-certificate validation is encrypted-but-unauthenticated transport: the channel resists passive eavesdropping but does not resist an active man-in-the-middle. An attacker on the network path between the OpenSIPS proxy and its peer (carrier SBC, federated proxy, end-user softphone over TLS) can present any certificate — including a self-signed one — and the handshake completes successfully. The attacker decrypts, observes, possibly modifies, and re-encrypts to the actual peer.

The compromise is trivial to mount on networks where the attacker has any L2/L3 position: ARP-poisoning on a shared LAN, BGP-hijacking on the Internet path, a malicious Wi-Fi access point. TLS' authentication property is what makes encryption-in-transit meaningful for security; encryption without authentication is an availability mechanism, not a confidentiality one.

`tls_mgm`'s `verify_cert` parameter controls whether the cfg requires peer cert validation. The settings are binary: `verify_cert=1` validates against the configured `ca_list`, `verify_cert=0` accepts anything. Operators occasionally set `verify_cert=0` to "make TLS work" during initial setup (when the CA list isn't populated yet) and forget to flip it back. The cfg loads, TLS handshakes succeed, calls flow — and the deployment ships with no peer authentication.

This rule is severity:high because the exposure is structural and the exploitation is well-understood. It is L1+L2 because peer-cert validation is a baseline TLS posture for any production deployment, not an L2-only hardening layer.

Source: Phase 2 master vulnerability reference §6 (TLS); OpenSIPS tls_mgm documentation; RFC 7525 (BCP 195, recommendations for secure use of TLS).

## Default Value

`verify_cert` default is operator-configured; in older versions it could effectively default to off if `ca_list` was unset. Modern OpenSIPS releases recommend explicit `verify_cert=1` in every TLS-using configuration.

## Audit

The rule fires when:

1. `tls_mgm` is loaded.
2. `modparam("tls_mgm", "verify_cert", 0)` is set explicitly.

The rule also fires at `confidence: medium` when:

3. `tls_mgm` is loaded AND `verify_cert` is unset entirely AND the version is one where the default is unsafe. The advisor accepts that some operators' versions default to safe; the medium-confidence emission with `kind: review_required` prompts the operator to confirm the loaded version's default behavior.

The rule does NOT fire when `verify_cert=1` is set explicitly with a non-empty `ca_list`. Cipher-strength and protocol-version concerns are covered by `OSIPS-SEC-TLS-003` and `OSIPS-SEC-TLS-004` independently.

## Remediation

1. **Set `verify_cert=1`:**

   ```opensips
   modparam("tls_mgm", "verify_cert", 1)
   modparam("tls_mgm", "ca_list", "/etc/opensips/tls/calist.pem")
   ```

2. **Populate `ca_list`** with the CA certificates of every peer your OpenSIPS communicates with over TLS. For carrier peering, this is your interconnect partner's CA. For federation, the federation's root CA. For end-user TLS endpoints, typically the public CA bundle.

3. **For server-to-server peering, also enable `require_cert=1`** to require the peer to present a certificate (mTLS). See `OSIPS-SEC-TLS-002`.

4. **For deployments with multiple TLS-using listeners**, configure per-domain TLS via `tls_mgm`'s domain table. Each peer relationship can have its own CA list.

5. **Audit certificate expiry and renewal.** A CA list pointing at an expired certificate fails validation; operators sometimes "fix" the failure by flipping `verify_cert=0` rather than rotating the CA. The operational discipline matters as much as the cfg setting.

## Example — BAD

```opensips
loadmodule "proto_tls.so"
loadmodule "tls_mgm.so"
loadmodule "tls_openssl.so"

modparam("tls_mgm", "tls_library", "openssl")
modparam("tls_mgm", "certificate", "/etc/opensips/tls/cert.pem")
modparam("tls_mgm", "private_key", "/etc/opensips/tls/privkey.pem")
modparam("tls_mgm", "verify_cert", 0)         # peer not authenticated
modparam("tls_mgm", "method", "TLSv1_2+")

listen=tls:0.0.0.0:5061
```

## Example — GOOD

```opensips
loadmodule "proto_tls.so"
loadmodule "tls_mgm.so"
loadmodule "tls_openssl.so"

modparam("tls_mgm", "tls_library", "openssl")
modparam("tls_mgm", "certificate", "/etc/opensips/tls/cert.pem")
modparam("tls_mgm", "private_key", "/etc/opensips/tls/privkey.pem")
modparam("tls_mgm", "verify_cert", 1)
modparam("tls_mgm", "ca_list", "/etc/opensips/tls/calist.pem")
modparam("tls_mgm", "require_cert", 1)        # mTLS for server-to-server
modparam("tls_mgm", "method", "TLSv1_2+")
modparam("tls_mgm", "ciphers_list", "EECDH+AESGCM:EDH+AESGCM")
modparam("tls_mgm", "crl_check_all", 1)

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

`verify_cert` semantics are stable across OpenSIPS 3.2 through 3.6. The `tls_mgm` module replaced the older monolithic `tls` module in the early 3.x series; pre-3.x cfgs (which are not in scope for this advisor's supported version range) used different parameter names.

Per-domain TLS configuration via `tls_mgm`'s domain table has been available since 3.2; recent versions added additional parameters (per-domain CRL, OCSP) that are independent of this rule's scope.

## False-Positive Considerations

- **Lab and dev deployments** with self-signed certs and no PKI may legitimately run `verify_cert=0`. Suppress with `expires` matching the lab's lifecycle; the rule fires correctly because cfgs do get promoted to production unchanged.
- **Cfgs behind a TLS-terminating reverse proxy** where the proxy enforces TLS and forwards plaintext SIP to OpenSIPS internally. The OpenSIPS-level finding still emits because the cfg is the audit artifact; suppress with documentation linking to the proxy's TLS configuration.
- **End-user TLS endpoints relying on SIP-layer auth** rather than mTLS. `verify_cert=0` is still incorrect on these — the TLS-layer authentication is independent of SIP digest. Suppress only with explicit operator decision to accept MITM risk on the end-user edge in exchange for operational simplicity.
- **Cfgs migrated from Kamailio.** Kamailio's `tls.cfg` uses different parameter names; a Kamailio cfg fed to this advisor mis-fires. The intake layer must detect Kamailio dialect before this family's rules run.

## Related Rules

- `OSIPS-SEC-TLS-002` (require-cert-missing) — server-to-server mTLS; complementary.
- `OSIPS-SEC-TLS-003` (weak-tls-method) — protocol version posture.
- `OSIPS-SEC-TLS-004` (weak-ciphers) — cipher-suite posture.
- `OSIPS-SEC-TLS-006` (no-peer-verify-check) — script-level `is_peer_verified()` call after TLS handshake.

## Additional References

- Phase 2 master vulnerability reference §6 (TLS)
- OpenSIPS tls_mgm module: https://opensips.org/docs/modules/3.4.x/tls_mgm.html
- RFC 7525 (BCP 195) — Recommendations for Secure Use of TLS
- CWE-295 — Improper Certificate Validation
- CWE-297 — Improper Validation of Certificate with Host Mismatch
- CWE-345 — Insufficient Verification of Data Authenticity
- OWASP A02:2021 — Cryptographic Failures
- OWASP A07:2021 — Identification and Authentication Failures
