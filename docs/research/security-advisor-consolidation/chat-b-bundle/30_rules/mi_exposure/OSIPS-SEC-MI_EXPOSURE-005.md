---
id: OSIPS-SEC-MI_EXPOSURE-005
name: httpd-cleartext
title: httpd MI transport configured without TLS — admin traffic in cleartext
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: mi_exposure
applies_if_modules_loaded: [httpd, mi_http]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.9
cvss_v4_vector: "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-319, CWE-311]
owasp: ["A02:2021-Cryptographic Failures"]
attack: [T1040]
tags: [mi, httpd, cleartext, tls, encryption-in-transit, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/httpd.html
  - https://cwe.mitre.org/data/definitions/319.html
  - 90_reference/02_enable_security_gap_analysis.md#d-1

short_description: |
  httpd is configured for the MI transport without tls_cert_file / tls_key_file
  modparams. Administrative requests, command output (which may contain
  registration data, dialog state, cached secrets, modparam dumps), and any
  authentication tokens sent by upstream tooling traverse the network in
  cleartext.
---

## Rationale

When the MI HTTP transport is exposed beyond a single host (loopback-only configurations are exempt; reverse-proxy patterns where TLS terminates externally are partially exempt), the channel itself should be encrypted. `httpd` supports TLS via `tls_cert_file`, `tls_key_file`, and `tls_ciphers` parameters. Without these, the transport is cleartext HTTP.

Three exposure classes:

1. **Admin commands and output in cleartext.** A passive observer on the path sees every MI command issued and every response. Outputs include `ul_dump` (registration table contents — usernames, contacts, last-seen IPs), `dlg_list` (active call state — caller/callee, timestamps), `cache_fetch` results (whatever the cfg cached), and `modparam` introspection (DB URLs with embedded credentials, signing keys if cached as modparams).

2. **Authentication tokens in cleartext.** When a reverse proxy in front of `httpd` enforces basic auth or bearer tokens, the proxy's TLS protects the external segment but the internal proxy-to-OpenSIPS hop remains cleartext. If the proxy and OpenSIPS are on different hosts, the auth credential is visible on the internal segment. If they are on the same host (the recommended pattern), the segment is loopback and the cleartext concern is moot.

3. **Active interception.** A network-layer attacker can not only observe but rewrite cleartext requests. MI commands are the highest-stakes possible HTTP payload — rewriting `cache_fetch` to `cache_store` flips a read into a write, etc. TLS' integrity protection (not just confidentiality) is the relevant defense.

This rule is L2-profile because the attack vector requires network adjacency that L1 enterprise PBX deployments typically don't expose. L2 carrier-grade and regulated deployments are expected to have TLS on every administrative channel by default.

The rule's confidence is high (the cfg either has the TLS modparams or doesn't), and severity is medium (the attack requires network adjacency or compromise; not exploitable from arbitrary internet positions).

Source: Phase 3 gap analysis §D.1 (good example shows `tls_cert_file` / `tls_key_file` on httpd); OpenSIPS httpd module documentation.

## Default Value

`tls_cert_file`, `tls_key_file`, and `tls_ciphers` are unset by default — `httpd` runs as cleartext HTTP unless the operator explicitly configures TLS. There is no documented secure default at the module level.

## Audit

The rule fires when **all** of the following are true:

1. `httpd` is loaded (with or without `mi_http` on top).
2. The bind address is non-loopback (i.e., the rule does not fire on correctly loopback-bound deployments — those are protected by the OS-level loopback boundary). For loopback-bound deployments, the rule emits at confidence:low as an informational hardening note rather than a firing finding.
3. `tls_cert_file` is unset OR `tls_key_file` is unset.

The rule does **not** check `tls_ciphers` strength here — that's covered by the `tls` family's cipher-strength rules, which apply uniformly across all TLS-using modules.

When the bind is loopback AND the cfg notes that an external reverse proxy terminates TLS (typically via cfg comments or via known-pattern detection like nginx upstream entries), the rule does not fire. The proxy-terminates-TLS pattern is acceptable and common.

## Remediation

1. **Bind to loopback as the primary control** (per `OSIPS-SEC-MI_EXPOSURE-001`). When MI is loopback-only, this rule does not fire — TLS is not required for a loopback channel. This is the recommended path for most deployments.

2. **When MI must be reachable beyond loopback, configure TLS:**

   ```opensips
   modparam("httpd", "tls_cert_file", "/etc/opensips/mi_cert.pem")
   modparam("httpd", "tls_key_file", "/etc/opensips/mi_key.pem")
   modparam("httpd", "tls_ciphers", "ECDHE-RSA-AES256-GCM-SHA384")
   ```

3. **Use a reverse proxy as the TLS terminator and authentication enforcer.** This is the canonical pattern: nginx (or HAProxy) listens on the public interface with mTLS or basic auth, and forwards authenticated requests to `httpd` on loopback. With this pattern, `httpd` does not need TLS configured because the channel from proxy to `httpd` is loopback.

4. **For reverse-proxy patterns where the proxy is on a different host**, configure TLS on `httpd` so the proxy-to-OpenSIPS hop is encrypted. The bind should still be tightly access-controlled (firewall + `mi_http_trusted_clients`).

5. **Rotate certificates per your standard PKI lifecycle.** MI certificates are administrative-control credentials and should be tracked alongside other admin credentials, not left to expire.

## Example — BAD

### Non-loopback bind, no TLS

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "10.0.10.5")
modparam("httpd", "port", 8888)
# tls_cert_file / tls_key_file unset — cleartext HTTP on 10.0.10.5:8888

loadmodule "mi_http.so"
modparam("mi_http", "mi_http_trusted_clients", "10.0.10.0/28")
# Allow-list correct, channel still cleartext
```

## Example — GOOD

### Loopback bind (rule does not fire; reverse proxy terminates TLS)

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)
# Cleartext is acceptable on loopback; nginx in front of OpenSIPS
# terminates TLS for external traffic.

loadmodule "mi_http.so"
modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1")
```

### Non-loopback bind with TLS

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "10.0.10.5")
modparam("httpd", "port", 8888)
modparam("httpd", "tls_cert_file", "/etc/opensips/mi_cert.pem")
modparam("httpd", "tls_key_file", "/etc/opensips/mi_key.pem")
modparam("httpd", "tls_ciphers", "ECDHE-RSA-AES256-GCM-SHA384")

loadmodule "mi_http.so"
modparam("mi_http", "mi_http_trusted_clients", "10.0.10.0/28")
```

## Version Notes

`httpd`'s TLS parameters (`tls_cert_file`, `tls_key_file`, `tls_ciphers`) are stable across OpenSIPS 3.2 through 3.6. Some 3.x releases added support for additional TLS parameters (cert-chain, OCSP stapling); these are defense-in-depth additions covered by the `tls` family's rules but do not affect this rule's firing.

The relationship between `httpd`'s TLS and the `tls_mgm` / `proto_tls` modules' TLS configuration is independent — `httpd` has its own per-listener TLS configuration. Operators sometimes assume `tls_mgm` settings apply to `httpd`; they do not.

## False-Positive Considerations

- **Loopback-bound deployments.** Loopback channels are inherently local; TLS adds operational cost without meaningful protection. The rule does not fire on loopback-bound `httpd` and emits at confidence:low only as an informational note when the operator's profile is L2 and they may want host-level encryption-of-loopback for compliance-driven hardening.
- **Reverse-proxy on the same host terminating TLS.** When nginx or HAProxy on `127.0.0.1` terminates TLS and forwards to `httpd` on `127.0.0.1:8888`, the proxy-to-`httpd` segment is loopback and the rule does not fire.
- **Lab and dev deployments.** Lab cfgs without a TLS PKI in place legitimately run cleartext; suppress with `expires` matching the lab's lifecycle.
- **Container deployments with TLS at the ingress.** Kubernetes Ingress / service-mesh patterns may terminate TLS at the cluster edge and forward cleartext within the mesh. The rule fires on the cfg-level cleartext binding; suppress with documentation of the mesh-level encryption guarantee if applicable.

## Related Rules

- `OSIPS-SEC-MI_EXPOSURE-001` (mi-http-public-bind) — primary control: bind address. This rule covers the channel-confidentiality layer.
- `OSIPS-SEC-MI_EXPOSURE-003` (mi-no-trusted-clients) — defense-in-depth allow-list, complementary to TLS.
- `OSIPS-SEC-TLS-001` (verify-cert-disabled) — TLS verification posture across the cfg's TLS-using modules.
- `OSIPS-SEC-TLS-003` (weak-tls-method) — TLS protocol version selection; applies to `httpd` TLS as well as `proto_tls`.
- `OSIPS-SEC-TLS-004` (weak-ciphers) — cipher-suite strength on any TLS-using module.

## Additional References

- Phase 3 gap analysis §D.1 (good example shows TLS on httpd)
- OpenSIPS httpd module: https://opensips.org/docs/modules/3.4.x/httpd.html
- CWE-319 — Cleartext Transmission of Sensitive Information
- CWE-311 — Missing Encryption of Sensitive Data
- OWASP A02:2021 — Cryptographic Failures
- MITRE ATT&CK T1040 — Network Sniffing
