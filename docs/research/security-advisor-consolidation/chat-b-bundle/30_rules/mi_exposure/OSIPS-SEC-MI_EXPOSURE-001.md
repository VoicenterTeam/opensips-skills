---
id: OSIPS-SEC-MI_EXPOSURE-001
name: mi-http-public-bind
title: mi_http / httpd bound to non-loopback address — administrative interface exposed on network
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: mi_exposure
applies_if_modules_loaded: [mi_http, httpd]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: critical
confidence: high
security_severity: 9.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-306, CWE-732]
owasp: ["A01:2021-Broken Access Control", "A05:2021-Security Misconfiguration"]
attack: [T1190, T1078]
tags: [mi, mi_http, httpd, admin-exposure, broken-access-control, network-listening]

references:
  - https://opensips.org/docs/modules/3.4.x/mi_http.html
  - https://opensips.org/docs/modules/3.4.x/httpd.html
  - https://cwe.mitre.org/data/definitions/306.html
  - 90_reference/02_enable_security_gap_analysis.md#d-1

short_description: |
  The Management Interface HTTP transport (`mi_http`) or its underlying `httpd`
  module is bound to a non-loopback address — typically `0.0.0.0` or a public
  interface IP — without any built-in authentication. Any host that can reach
  the bind address has effective administrative control: registration purge,
  active-call teardown, route reload, cache manipulation, and arbitrary state
  read.
---

## Rationale

OpenSIPS' Management Interface (MI) is the administrative control plane: it exposes commands like `ul_dump`, `ul_rm`, `dlg_end_dlg`, `dlg_list`, `reload_routes`, `dr_reload`, `dispatcher_reload`, `cache_store`, `cache_fetch`, `debug`, and the full statistics surface. An attacker who reaches an MI port can read state, mutate state, tear down active calls, purge registrations, and reload routing — there is no authentication layer in `mi_http` or the underlying `httpd` module by design. The transport is intended to run on a trust boundary that the operator establishes externally (loopback + reverse proxy, internal network with ACLs).

When `mi_http` (or `httpd` directly) is bound to `0.0.0.0` or to a public interface address, that trust boundary is absent. The administrative control plane is reachable from anywhere the IP is routable. Three structural facts make this critical:

1. **No authentication in the module.** The module's documentation states explicitly that `httpd` and `mi_http` provide no built-in authentication. Suggesting the operator supply auth via a reverse proxy is the official guidance, not a reactive workaround.
2. **Admin commands include destructive primitives.** `ul_rm` deletes registrations; `dlg_end_dlg` terminates active calls; `reload_routes` and `dr_reload` rewrite the proxy's routing behavior. The blast radius of unauthenticated MI is the entire deployment.
3. **The bind decision is one modparam line.** `modparam("httpd", "ip", "0.0.0.0")` (or its absence, which on some configs defaults to listening on all interfaces) is structurally identical to "no security." There is no second factor.

The Phase 3 gap analysis flags MI exposure as one of the top-3 critical gaps because the failure mode is binary: the cfg is either correctly bound to loopback or it is not, and the latter is full administrative compromise without exploitation tooling.

Source: Phase 3 gap analysis §D.1 (MI exposure); OpenSIPS mi_http and httpd module documentation.

## Default Value

`httpd`'s `ip` parameter has no documented secure default — older OpenSIPS releases default to `0.0.0.0` if unset, which is the unsafe form. Newer documentation pages strongly recommend explicit loopback binding but do not enforce it at the module level. The operator must set `modparam("httpd", "ip", "127.0.0.1")` explicitly.

## Audit

The rule fires when **all** of the following are true:

1. `mi_http` or `httpd` is loaded (`loadmodule "mi_http.so"`, `loadmodule "httpd.so"`).
2. The bound address is one of:
   - `"0.0.0.0"` (IPv4 wildcard)
   - `"::"` (IPv6 wildcard)
   - Any non-loopback IPv4 address (i.e., not `127.0.0.0/8`)
   - Any non-loopback IPv6 address (i.e., not `::1`)
   - The `ip` parameter is unset entirely (defaults to wildcard on most versions)
3. The bound port is reachable from outside the OpenSIPS host. The advisor cannot directly verify reachability from the cfg, so this is presumed true unless intake context indicates the host is behind a network ACL that blocks the MI port.

Co-occurring conditions strengthen the evidence trace and elevate the report's blast-radius framing:

- `registrar` or `usrloc` loaded → registration purge is in scope.
- `dialog` loaded → active-call teardown is in scope.
- `drouting` or `dispatcher` loaded → routing reload is in scope.
- `cachedb_*` loaded → cache manipulation is in scope.

These are noted in `evidence.trace` for the report but do not affect the rule's firing — the bind condition alone is sufficient.

## Remediation

1. **Bind to loopback.**

   ```opensips
   modparam("httpd", "ip", "127.0.0.1")
   ```

2. **If MI must be reachable from another host (jump box, monitoring system, automation), terminate the network path on a reverse proxy with mTLS or basic auth.** Nginx with `auth_basic` + TLS client certificates is the canonical pattern. The reverse proxy listens on the public interface; OpenSIPS' `mi_http` listens only on loopback; the proxy forwards authenticated requests to loopback.

3. **Configure `httpd` TLS as a defense-in-depth layer when loopback alone is insufficient** (e.g., multi-tenant hosts where loopback isn't a strong trust boundary):

   ```opensips
   modparam("httpd", "tls_cert_file", "/etc/opensips/mi_cert.pem")
   modparam("httpd", "tls_key_file", "/etc/opensips/mi_key.pem")
   modparam("httpd", "tls_ciphers", "ECDHE-RSA-AES256-GCM-SHA384")
   ```

   Note that `httpd` TLS does not authenticate the client — it only encrypts the channel. Auth must still come from elsewhere.

4. **Apply `mi_trusted_clients` as a redundant access control.** If the version exposes a trusted-clients allow-list (parameter naming varies; check `OSIPS-SEC-MI_EXPOSURE-003`), set it to the loopback or reverse-proxy address. This is belt-and-braces, not a substitute for binding.

5. **Audit firewall rules.** Even with loopback binding, host firewall rules should explicitly drop inbound traffic to the MI port from non-loopback sources. Defense in depth at the network layer protects against future cfg regressions.

## Example — BAD

### Bound to 0.0.0.0

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "0.0.0.0")
modparam("httpd", "port", 8888)

loadmodule "mi_http.so"

# Registration and dialog modules amplify blast radius
loadmodule "registrar.so"
loadmodule "dialog.so"
```

### `ip` unset (defaults to wildcard on most versions)

```opensips
loadmodule "httpd.so"
modparam("httpd", "port", 8888)
# ip not set — module default behavior is wildcard bind

loadmodule "mi_http.so"
```

## Example — GOOD

### Loopback only

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)

loadmodule "mi_http.so"

# If MI must be reachable from a jump host, reverse proxy with mTLS terminates
# the public path and forwards authenticated requests to 127.0.0.1:8888.
```

### Loopback + TLS (defense in depth on multi-tenant host)

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)
modparam("httpd", "tls_cert_file", "/etc/opensips/mi_cert.pem")
modparam("httpd", "tls_key_file", "/etc/opensips/mi_key.pem")
modparam("httpd", "tls_ciphers", "ECDHE-RSA-AES256-GCM-SHA384")

loadmodule "mi_http.so"
```

## Version Notes

The `httpd` and `mi_http` module APIs are stable across OpenSIPS 3.2 through 3.6 with consistent parameter names. Some 3.x releases introduced additional access-control parameters (`mi_http_method`, restricted-command sets) — these are covered as defense-in-depth layers in `OSIPS-SEC-MI_EXPOSURE-003` (no-trusted-clients) but do not substitute for correct binding.

The legacy `mi_xmlrpc` module (covered in `OSIPS-SEC-MI_EXPOSURE-004`) was deprecated and replaced by `mi_http`'s JSON-RPC support in the 3.x series. Cfgs that load `mi_xmlrpc` on 3.x are independently flagged.

## False-Positive Considerations

- **Container deployments where loopback is the host network.** In some Docker/Kubernetes patterns, "loopback" means the pod's network namespace and the host has its own loopback. If the MI port is exposed via a container port mapping, `127.0.0.1` inside the container can still be reachable from outside the container — the rule fires correctly because the *effective* binding is non-loopback. Operators must bind to the container's loopback AND ensure no port mapping exposes MI.
- **Multi-tenant hosts where loopback is shared.** Same caveat — loopback isn't a trust boundary if other tenants share the loopback namespace. The remediation table includes TLS as a defense in depth for these cases.
- **Documented internal-network deployments.** Some operators argue that an internal-network bind (e.g., `10.0.0.5`) is acceptable because the network itself is a trust boundary. The advisor disagrees: internal networks are not authentication and the MI module itself has no auth. Suppress with `justification="internal network with X enforced"` only when the network ACL is explicitly documented and verifiable.
- **Read-only MI configurations.** If the operator has restricted MI commands to read-only via `mi_http_method` or similar (where supported), the destructive-command surface is reduced but the data-disclosure surface remains. Severity drops from critical to high in that case; the rule still fires and the operator confirms the read-only posture in the suppression record.

## Related Rules

- `OSIPS-SEC-MI_EXPOSURE-002` (mi-datagram-udp) — same exposure class on the datagram transport.
- `OSIPS-SEC-MI_EXPOSURE-003` (mi-no-trusted-clients) — even on loopback, missing trusted-clients allow-list is a defense-in-depth gap.
- `OSIPS-SEC-MI_EXPOSURE-004` (mi-xmlrpc-no-auth) — deprecated module loaded on 3.x.
- `OSIPS-SEC-MI_EXPOSURE-005` (httpd-cleartext) — `httpd` TLS not configured at all.
- `OSIPS-SEC-CONFIG_HYGIENE-001` (cleartext-credentials-modparam) — MI commands can read modparams that contain DB URLs and other secrets; the credentials are exfiltratable through MI.

## Additional References

- Phase 3 gap analysis §D.1 (MI exposure as top-3 critical gap)
- OpenSIPS mi_http module: https://opensips.org/docs/modules/3.4.x/mi_http.html
- OpenSIPS httpd module: https://opensips.org/docs/modules/3.4.x/httpd.html
- CWE-306 — Missing Authentication for Critical Function
- CWE-732 — Incorrect Permission Assignment for Critical Resource
- OWASP A01:2021 — Broken Access Control
- OWASP A05:2021 — Security Misconfiguration
