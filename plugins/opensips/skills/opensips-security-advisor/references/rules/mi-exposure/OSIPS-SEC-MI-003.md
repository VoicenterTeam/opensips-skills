---
id: OSIPS-SEC-MI-003
name: mi-no-trusted-clients
title: MI module loaded without trusted-clients allow-list — missing defense-in-depth access control
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: mi_exposure
applies_if_modules_loaded: [mi_http, mi_datagram, httpd]
applies_if_opensips_version: ">=3.4"
phase: [structural, value_pattern]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: high
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:A/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:L/SC:N/SI:N/SA:N"
cwe: [CWE-732, CWE-1188]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1078]
tags: [mi, defense-in-depth, allow-list, trusted-clients, hardening]

references:
  - https://opensips.org/docs/modules/3.4.x/mi_http.html
  - https://opensips.org/docs/modules/3.4.x/mi_datagram.html
  - https://cwe.mitre.org/data/definitions/1188.html

short_description: |
  An MI module is loaded without an explicit trusted-clients allow-list. Even
  when the bind address is correctly loopback, the absence of the allow-list
  is a defense-in-depth gap that compounds quickly if the bind address is
  later regressed (e.g., during an unrelated cfg change).
---

## Rationale

OpenSIPS 3.4+ exposes `trusted_clients`-family parameters across the MI modules — `mi_http_trusted_clients`, `mi_datagram_trusted_clients`, and equivalents on other transports — that take a comma-separated list of source addresses (IP literals or CIDR ranges) permitted to issue MI commands. Requests from non-listed addresses are dropped before any command parsing occurs.

The parameter is a defense-in-depth layer, not a primary control. The primary control is the bind address (per `OSIPS-SEC-MI_EXPOSURE-001` and `-002`); when bind is correct, the trusted-clients list is redundant but cheap. The value of the redundancy is regression resistance: an unrelated cfg change that flips bind from loopback to wildcard immediately exposes MI without the allow-list as a backstop. Configs that have both correct bind AND a tight trusted-clients list survive the regression; configs that rely on bind alone do not.

This rule is L2-profile-only because the trusted-clients allow-list is a hardening layer rather than a baseline requirement. L1 deployments that have correctly bound MI to loopback satisfy the baseline; L2 (carrier-grade, regulated, high-value) deployments are expected to have the redundant control in place.

The rule's severity is medium and confidence is high because the failure mode (allow-list absent) is structurally clear, but the actual exposure depends on whether the bind regression scenario materializes. The advisor reports it as a hardening gap the operator should close, not as an active vulnerability.

Source: Phase 3 gap analysis §D.1; OpenSIPS MI module documentation.

## Default Value

`mi_http_trusted_clients`, `mi_datagram_trusted_clients`, and equivalents are unset by default — when unset, the module accepts requests from any source address that reaches the bind address. The operator must opt into the allow-list explicitly.

## Audit

The rule fires when **all** of the following are true:

1. Any of `mi_http`, `mi_datagram`, or `httpd` is loaded.
2. The detected OpenSIPS version is `>=3.4` (older versions don't expose the trusted-clients parameters consistently).
3. No `*_trusted_clients` modparam is set for the loaded MI module(s). Specifically:
   - `mi_http` loaded → `mi_http_trusted_clients` must be set
   - `mi_datagram` loaded → `mi_datagram_trusted_clients` must be set (where exposed; some versions use a different name — the rule accepts any documented allow-list parameter for the version)
   - `httpd` loaded as the underlying transport → equivalent allow-list at the `httpd` level if exposed; otherwise this rule defers to the transport-specific MI module's parameter

The rule does **not** fire when the trusted-clients parameter is set to a list, even if the list contains a wildcard (`0.0.0.0/0` or empty meaning "all"). A wildcard-allow-list is structurally distinct from the allow-list-absent case — the operator has explicitly chosen "no allow-list," which is a separate finding under `OSIPS-SEC-CONFIG_HYGIENE-005` (wildcard ACL, when authored) and warrants documentation but isn't this rule's concern.

## Remediation

1. **Identify the management hosts that legitimately need MI access.** This is typically a small set: localhost, a monitoring jump box, a CI/automation host, possibly an ops bastion.

2. **Set the trusted-clients allow-list to the minimum.**

   ```opensips
   modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1")
   ```

   Or, when MI is reached via a reverse proxy on the same host:

   ```opensips
   modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1, ::1")
   ```

3. **For multi-source automation, use CIDR ranges sparingly.** Each entry in the list is an admission credential; broad ranges weaken the defense:

   ```opensips
   # Acceptable — loopback + dedicated ops bastion CIDR
   modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1, 10.0.10.0/28")

   # Avoid — entire internal network is too broad
   # modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1, 10.0.0.0/8")
   ```

4. **Audit the list during operational changes.** When an automation host is decommissioned or its IP rotates, update the allow-list. Stale entries are admission credentials granted to whatever now occupies the address.

5. **Combine with the bind-address discipline from `OSIPS-SEC-MI_EXPOSURE-001` and `-002`.** The allow-list is defense in depth on top of correct binding, not a substitute.

## Example — BAD

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)

loadmodule "mi_http.so"
# mi_http_trusted_clients not set — module accepts any request that reaches
# 127.0.0.1:8888. If the bind is later regressed, no backstop exists.
```

## Example — GOOD

### Loopback + tight allow-list

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)

loadmodule "mi_http.so"
modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1")
```

### Loopback + multi-source automation allow-list

```opensips
loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)

loadmodule "mi_http.so"
# Loopback for direct ops, plus dedicated /28 for the automation cluster
modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1, 10.0.10.0/28")
```

## Version Notes

The exact parameter name varies across OpenSIPS releases:

- 3.4 LTS: `mi_http_trusted_clients`, `mi_datagram_trusted_clients` (where exposed).
- 3.5: same as 3.4.
- 3.6 LTS: same naming, with additional CIDR-syntax improvements in some maintenance releases.

This rule applies from 3.4+ because the parameter is documented and stable from that release onward. Pre-3.4 cfgs that load MI modules emit `OSIPS-SEC-MI_EXPOSURE-001` or `-002` but do not separately fire this rule — the redundant control isn't available to enable.

## False-Positive Considerations

- **MI accessed exclusively through a reverse proxy on the same host.** When a reverse proxy with mTLS terminates external traffic and forwards to loopback, setting `mi_http_trusted_clients` to `127.0.0.1` is correct and the rule clears. If the cfg author has set the allow-list to the proxy's source address (which on the same host may be 127.0.0.1 anyway), the rule does not fire.
- **Lab deployments without management automation.** Lab cfgs that have no MI consumers other than the operator's own shell session may legitimately omit the allow-list. Suppress with `expires` matching lab lifecycle; the rule fires correctly because cfgs do get promoted.
- **Containerized deployments.** In some container patterns, `127.0.0.1` is the container's loopback and the orchestrator does not attempt MI access from outside. Suppress with `justification="container loopback, no external MI consumer"`.

## Related Rules

- `OSIPS-SEC-MI_EXPOSURE-001` (mi-http-public-bind) — primary control: bind address. This rule covers the redundant control.
- `OSIPS-SEC-MI_EXPOSURE-002` (mi-datagram-udp) — same primary-vs-redundant relationship.

## Additional References

- Phase 3 gap analysis §D.1
- OpenSIPS mi_http module: https://opensips.org/docs/modules/3.4.x/mi_http.html
- OpenSIPS mi_datagram module: https://opensips.org/docs/modules/3.4.x/mi_datagram.html
- CWE-732 — Incorrect Permission Assignment for Critical Resource
- CWE-1188 — Insecure Default Initialization of Resource
- OWASP A05:2021 — Security Misconfiguration
