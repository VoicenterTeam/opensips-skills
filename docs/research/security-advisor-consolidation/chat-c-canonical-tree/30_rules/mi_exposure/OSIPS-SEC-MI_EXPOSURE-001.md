---
id: OSIPS-SEC-MI_EXPOSURE-001
version: "1.0"
name: mi-http-public-bind
title: "MI HTTP exposed on public or non-loopback interface"
module_family: mi_exposure
status: stable
introduced_in_engine_version: "0.1.0"

severity: critical
default_effort: XS

cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N"
cwe: ["CWE-306"]
owasp: "A01:2021"
mitre_attack: ["T1190"]

description_short: |
  mi_http bound to a non-loopback interface without trusted-clients restriction
  exposes administrative commands to any host that can reach the port.

detection_phase:
  - structural
  - value_pattern
applies_if_opensips_version: ">=3.0, <4.0"
applies_if_modules_loaded: ["mi_http"]

suppressible: true
---

# Detection

This rule fires when the `mi_http` module is loaded with its `ip` parameter set to a non-loopback address — most commonly `0.0.0.0`, but also any routable IPv4/IPv6 address — and the cfg does not also set `mi_http_trusted_clients` to a restrictive allowlist.

The MI (Management Interface) HTTP module exposes administrative commands directly: registration purge (`ul_rm`), location-table dump (`ul_dump`), dialog teardown (`dlg_end_dlg`), runtime-route reload, cache invalidation, and dozens of others depending on which modules are loaded. When `mi_http` is reachable on a non-loopback interface and is not constrained by a trusted-clients allowlist, any host that can reach the port can execute these commands without authentication.

The rule does not fire when:
- `mi_http` is not loaded.
- `ip` is set to `127.0.0.1`, `::1`, or any address in `127.0.0.0/8`.
- `mi_http_trusted_clients` is set to a value containing only loopback or RFC1918 private addresses (the rule treats the presence of a trusted-clients allowlist as compensating control, with caveats — see Recommendation).

# Evidence patterns

```yaml
- pattern_kind: loadmodule_match
  module: "mi_http"
  bind:
    - location: $loadmodule_loc

- pattern_kind: modparam_match
  module: "mi_http"
  param: "ip"
  value:
    not_matches_regex: "^(127\\.|::1$|localhost)"
  bind:
    - location: $bind_location
    - value_text: $bind_address
```

The two patterns are AND'd: the rule requires both that `mi_http` is loaded *and* that its `ip` parameter is set to a non-loopback value. A cfg that loads `mi_http` without setting `ip` falls back to OpenSIPS's default (loopback) and the rule does not fire.

The trusted-clients check is implemented as a suppression-on-presence at the engine level, not as a third evidence pattern: if a `modparam("mi_http", "mi_http_trusted_clients", ...)` declaration is present in the cfg, the engine demotes this finding's confidence by one notch. This is the pragmatic approach for v1.0 because doc 5's lightweight matchers don't have a "fire unless cancelled by another match" composition primitive yet. v1.1 candidate: add a `cancel_if_present:` field to the rule schema.

For now, rule authors targeting compensating-control patterns should write a sibling rule (`OSIPS-SEC-MI-002` for trusted-clients absent on a loopback bind) and let the report's correlated-findings logic group them.

# Rationale

The MI HTTP interface is administrative, not user-facing. OpenSIPS's design intent is that MI is reachable only from operator tooling running on the same host or in the same trusted segment. Binding to `0.0.0.0` or any routable interface contradicts this design intent.

The threat model: an attacker who can reach the bound port — directly via the public Internet, or laterally from a compromised host in the same network — can issue MI commands without authentication. The blast radius depends on which modules are loaded:

- `usrloc` + `registrar` loaded → attacker can purge all registered contacts (`ul_rm`), causing all subscribers to be unable to receive calls until they re-register. Combined with rate limits on REGISTER, this is a sustained denial of service.
- `dialog` loaded → attacker can enumerate active calls (`dlg_list`) and tear them down (`dlg_end_dlg`).
- `tls_mgm` loaded → attacker can trigger reloads of TLS configuration; if combined with file-write access via another vector, can replace certificates.
- Any module with reload-style MI commands → attacker can force reloads at attacker-chosen times, useful for triggering race conditions or amplifying a parallel exploit.

Severity is **critical** because the precondition (network reachability) is realistic on any public-facing deployment, the impact (administrative command execution) is high, and there is no required authentication step. CVSS 4.0 vector reflects: network attack, low complexity, no auth, no user interaction, high confidentiality + integrity + availability impact.

# Recommendation template

The fix is one cfg change. Choose one of these two paths:

**Path 1 — bind to loopback (preferred when MI is consumed locally).**

```opensips-cfg
# GOOD
loadmodule "mi_http.so"
modparam("mi_http", "ip", "127.0.0.1")
modparam("mi_http", "port", 8080)
```

If a remote operator host needs MI access, terminate it at a reverse proxy with mTLS on the operator host's network — do not extend `mi_http` itself onto the wire.

**Path 2 — keep non-loopback bind, add explicit allowlist.**

```opensips-cfg
# Acceptable but not preferred
loadmodule "mi_http.so"
modparam("mi_http", "ip", "10.0.10.5")
modparam("mi_http", "port", 8080)
modparam("mi_http", "mi_http_trusted_clients", "10.0.20.7,10.0.20.8")
```

The allowlist is enforced by `mi_http` itself and rejects requests from unlisted source addresses. Caveats: the allowlist is IP-based and trusts source-IP integrity, so it does not protect against same-segment spoofing or compromise of an allowlisted host. Path 1 is preferred because it removes the question entirely.

# References

- `90_reference/01_master_vulnerability_reference.md#mi-exposure` — internal threat model for MI interfaces.
- `90_reference/02_enable_security_gap_analysis.md#mi-exposure` — gap analysis citing this as a top-3 missing rule pre-this-catalog.
- OpenSIPS `mi_http` module documentation — see https://opensips.org/docs/modules/3.5.x/mi_http.html (mirror at `90_reference/external_sources.md#opensips-mi-http`).
- General CWE-306 (Missing Authentication for Critical Function): https://cwe.mitre.org/data/definitions/306.html

# Test fixtures

```yaml
- type: vulnerable
  path: 50_fixtures/vulnerable/vulnerable-mixed.cfg
  expected_finding_anchor: F2
  notes: |
    The cfg binds mi_http to 0.0.0.0:8080 with no trusted_clients
    declaration. Rule fires deterministically.

- type: clean
  path: 50_fixtures/clean/clean-l1-enterprise-pbx.cfg
  notes: |
    The cfg binds mi_http to 127.0.0.1. Rule does not fire as a finding;
    it emits as informational OSIPS-SEC-MI-002 (trusted-clients-not-set
    as defense-in-depth advisory) but that is a separate rule.
```
