---
id: OSIPS-SEC-MI_EXPOSURE-004
name: mi-xmlrpc-no-auth
title: Deprecated mi_xmlrpc module loaded on OpenSIPS 3.x
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: mi_exposure
applies_if_modules_loaded: [mi_xmlrpc]
applies_if_opensips_version: ">=3.0"
phase: [structural]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:L/SC:N/SI:N/SA:N"
cwe: [CWE-1104, CWE-477, CWE-306]
owasp: ["A06:2021-Vulnerable and Outdated Components", "A01:2021-Broken Access Control"]
attack: [T1190]
tags: [mi, mi_xmlrpc, deprecated, legacy-module, broken-access-control]

references:
  - https://opensips.org/docs/modules/3.4.x/mi_http.html
  - https://cwe.mitre.org/data/definitions/477.html
  - 90_reference/02_enable_security_gap_analysis.md#d-1

short_description: |
  The mi_xmlrpc module is loaded on OpenSIPS 3.x. mi_xmlrpc was deprecated and
  superseded by mi_http's JSON-RPC support during the 2.x → 3.x transition.
  Deployments still loading mi_xmlrpc are running unmaintained code paths
  with no built-in authentication, exposing the same admin surface as
  OSIPS-SEC-MI_EXPOSURE-001 with the additional risk of unpatched module bugs.
---

## Rationale

OpenSIPS' Management Interface evolved across the 2.x → 3.x transition. The XML-RPC transport (`mi_xmlrpc`) was a 2.x-era module that exposed MI commands via XML-RPC over HTTP. With the 3.x release series, MI was unified under `mi_http`'s JSON-RPC mode, and `mi_xmlrpc` was deprecated. Older OpenSIPS documentation pages still reference `mi_xmlrpc`, which leads operators upgrading from 2.x to leave the module loaded — the cfg loads cleanly, the listener starts, and the operational tooling that talks XML-RPC continues to work.

Three problems compound:

1. **Deprecation means unmaintained.** Bugs found in `mi_xmlrpc` after deprecation are not patched. The module's code path receives no security review and any latent flaw (parser bugs, request smuggling, authentication assumptions) is permanent.

2. **Same authentication posture as `mi_http`.** `mi_xmlrpc` has no built-in authentication; the trust boundary is whatever the operator establishes externally. The blast radius is identical to `OSIPS-SEC-MI_EXPOSURE-001`.

3. **Older XML-RPC libraries have a separate vulnerability lineage.** XML-RPC parsers across many implementations have historically been XXE-prone, billion-laughs-prone, and entity-expansion-prone. While OpenSIPS' specific parser may or may not have these issues, the general class is a risk surface that JSON-RPC sidesteps entirely.

The rule fires structurally on any cfg loading `mi_xmlrpc` on OpenSIPS 3.x. The remediation is migration to `mi_http`, not configuration tweaking. There is no acceptable hardened form of `mi_xmlrpc` on 3.x — the path forward is replacement.

This rule is severity:high rather than critical because it depends on the same exposure preconditions as MI_EXPOSURE-001 (bind to non-loopback, no external auth). When `mi_xmlrpc` is loaded with correct loopback binding, the immediate exposure is bounded; the high severity reflects the deprecated-module risk class and the operational-debt accumulation.

Source: Phase 3 gap analysis §D.1 (notes that `mi_xmlrpc` was replaced by JSON-RPC-over-HTTP in 3.x); OpenSIPS migration documentation.

## Default Value

Not applicable — the module's presence is the finding. There is no defaulted-secure form of loading `mi_xmlrpc` on 3.x.

## Audit

The rule fires when:

1. The detected OpenSIPS version is `>=3.0`.
2. `loadmodule "mi_xmlrpc.so"` (or `loadmodule "mi_xmlrpc"`) is present in the cfg or any included file.

That is the entire detection logic. The rule does not check parameters — even a correctly-bound, allow-listed `mi_xmlrpc` is a finding because the migration to `mi_http` is the prescribed path.

If the cfg also contains MI tooling that depends on XML-RPC (custom scripts, monitoring integrations), the advisor reports those as related-locations to surface the migration cost in the finding's evidence section.

## Remediation

1. **Identify operational consumers of `mi_xmlrpc`.** Common consumers: legacy monitoring scripts, custom dashboards, Python-2-era automation. Inventory what currently sends XML-RPC requests.

2. **Migrate consumers to JSON-RPC over `mi_http`.** The MI command surface is identical between transports — `ul_dump`, `dlg_list`, `reload_routes`, etc. all work over JSON-RPC. The change is the wire format. Most language standard libraries have JSON parsers; the migration is a request-format change, not a logic change.

3. **Replace the cfg load:**

   ```opensips
   # Remove
   loadmodule "mi_xmlrpc.so"

   # Add (if not already present)
   loadmodule "httpd.so"
   modparam("httpd", "ip", "127.0.0.1")
   modparam("httpd", "port", 8888)

   loadmodule "mi_http.so"
   modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1")
   ```

4. **Verify each consumer post-migration.** Run a smoke test that issues each MI command the operational tooling depends on. The migration is not complete until every consumer is JSON-RPC.

5. **If migration is genuinely blocked** (vendor tooling, regulatory artifact-preservation), document the blocker and suppress with `expires` set to a realistic migration deadline. Do not suppress indefinitely — the deprecated-module risk grows over time.

## Example — BAD

```opensips
# OpenSIPS 3.6.4

loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)

# Deprecated module — bind discipline doesn't change the finding
loadmodule "mi_xmlrpc.so"
```

## Example — GOOD

```opensips
# OpenSIPS 3.6.4

loadmodule "httpd.so"
modparam("httpd", "ip", "127.0.0.1")
modparam("httpd", "port", 8888)

loadmodule "mi_http.so"
modparam("mi_http", "mi_http_trusted_clients", "127.0.0.1")
```

## Version Notes

`mi_xmlrpc` was a 2.x-era module. The 3.x series ships the module's source for backward compatibility but does not actively maintain it. Some 3.x maintenance branches removed it entirely; the rule's `applies_if_opensips_version: ">=3.0"` casts a wide net deliberately because the deprecation message is consistent across the range.

If a future 3.x release removes `mi_xmlrpc` from the source tree entirely, cfgs loading it will fail at startup — which is preferable to silently running deprecated code. Until then, the rule serves as the lint-time signal.

## False-Positive Considerations

- **Migration in progress.** Cfgs that load both `mi_xmlrpc` and `mi_http` during a transition window fire this rule on the `mi_xmlrpc` line. Suppress with `expires` matching the migration deadline.
- **Vendor-tooling blocker.** Some regulatory or vendor tooling explicitly requires XML-RPC. Suppress with documented justification and an explicit migration plan; treat the suppression as a tracked technical-debt item, not a permanent state.
- **OpenSIPS 2.x cfgs accidentally fed to a 3.x advisor.** The intake layer should detect the version mismatch before this rule runs. If intake misses it, the rule fires correctly because the cfg-as-deployed is on 3.x.

## Related Rules

- `OSIPS-SEC-MI_EXPOSURE-001` (mi-http-public-bind) — the migration target's exposure rule.
- `OSIPS-SEC-MI_EXPOSURE-003` (mi-no-trusted-clients) — applies to the migrated `mi_http` configuration.
- `OSIPS-SEC-CONFIG_HYGIENE-002` — module-loaded-but-unused class. `mi_xmlrpc` is in scope as a deprecated module.

## Additional References

- Phase 3 gap analysis §D.1 (migration note: "`mi_xmlrpc` (pre-3.x) was replaced by JSON-RPC-over-HTTP in 3.x")
- OpenSIPS mi_http module: https://opensips.org/docs/modules/3.4.x/mi_http.html
- CWE-1104 — Use of Unmaintained Third Party Components
- CWE-477 — Use of Obsolete Function
- CWE-306 — Missing Authentication for Critical Function
- OWASP A06:2021 — Vulnerable and Outdated Components
- OWASP A01:2021 — Broken Access Control
