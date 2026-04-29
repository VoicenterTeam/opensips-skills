---
id: OSIPS-SEC-RELAY_AND_ROUTING-003
name: permissions-wildcard
title: permissions trust group contains 0.0.0.0/0 — universal source-IP trust
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: relay_and_routing
applies_if_modules_loaded: [permissions]
applies_if_opensips_version: ">=3.2"
phase: [value_pattern, semantic_contextual]
profile: [L1, L2]
automated: false
suppressible: true

severity: critical
confidence: medium
security_severity: 9.1
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:H/SC:L/SI:H/SA:N"
cwe: [CWE-269, CWE-284, CWE-501]
owasp: ["A01:2021-Broken Access Control"]
attack: [T1190, T1078]
tags: [permissions, source-trust, wildcard-acl, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/permissions.html
  - 90_reference/01_master_vulnerability_reference.md#section-4

short_description: |
  permissions module's address table or trust group contains 0.0.0.0/0, ::/0,
  or another universally-matching pattern. allow_source_address() / check_source_address()
  against the wildcard succeeds for every source — the source-IP trust mechanism
  is structurally defeated.
---

## Rationale

`permissions` exposes source-IP trust groups via the `address` table. `allow_source_address(N)` succeeds when the source IP falls in group N. Cfgs use this to bypass auth for trusted peers, route trusted traffic to less-restricted handling, or admit traffic that would otherwise be rejected.

The control's value depends entirely on the group's contents being narrow. When a group contains `0.0.0.0/0`, the check succeeds for every source on the public Internet — auth bypass becomes unauthenticated relay, trusted-peer routing opens to everyone.

Most often introduced during initial deployment ("just trust everything for now") and forgotten. The advisor's confidence is medium because address table contents typically live in a database the cfg references; the advisor cannot inspect DB rows directly.

This rule is `automated: false` because exposure depends on data the advisor cannot inspect from the cfg. Same posture as TLS-005 and AUTH-007.

Source: Phase 2 §4.5.

## Default Value

Not applicable — operator-populated trust group contents.

## Audit

The rule fires when:

1. `permissions` is loaded AND `check_source_address()` is called against a group cfg-statically declared as containing `0.0.0.0/0`.
2. Or `default_allow_file` points at a file documented as containing wildcards.
3. Or `check_source_address("0")` is used (group ID 0 conventionally is the catch-all).
4. Or address-table not statically inspectable AND the check bypasses auth/routes-to-less-restricted handling — emits as `review_required`.

## Remediation

1. **Inspect address table:** `SELECT id, grp, ip, mask, port FROM address ORDER BY grp, ip;`. Identify wildcard entries.

2. **Replace wildcards with explicit CIDR ranges for known peers:**

   ```sql
   DELETE FROM address WHERE grp=1 AND ip='0.0.0.0';
   INSERT INTO address (grp, ip, mask, port, proto) VALUES
     (1, '203.0.113.10', 32, 5060, 'udp'),
     (1, '198.51.100.0', 24, 5060, 'tcp');
   ```

3. **Reload:** `opensips-cli -x mi address_reload`.

4. **For genuinely broad ranges** (public WebRTC service), document and pair with rate-limiting + per-call auth. Suppress with justification.

5. **Audit address-table contents quarterly.** Stale entries become admission credentials granted to whatever now occupies the address.

6. **Combine with mTLS at the TLS layer** for server-to-server peering.

## Example — BAD

```opensips
loadmodule "permissions.so"
modparam("permissions", "default_allow_file", "/etc/opensips/trusted.cfg")
# /etc/opensips/trusted.cfg contains: ALL : 0.0.0.0/0 :

route {
    if (check_source_address("0")) {
        route(relay); exit;
    }
}
```

## Example — GOOD

```opensips
loadmodule "permissions.so"
modparam("permissions", "db_url", "mysql://opensips:secret@db/opensips")
modparam("permissions", "address_table", "address")

# DB-managed groups with specific CIDRs:
#   Group 1: carriers (203.0.113.10/32, 203.0.113.11/32)
#   Group 2: federation (198.51.100.0/24)
# No wildcards.

route {
    if (check_source_address("1")) { route(carrier_routing); exit; }
    if (check_source_address("2")) { route(federation_routing); exit; }

    if (!proxy_authorize("", "subscriber")) {
        proxy_challenge("", "auth"); exit;
    }
}
```

## Version Notes

`permissions` address-table schema and primitives stable across OpenSIPS 3.2-3.6. Kamailio's `permissions` differs — intake must detect dialect.

## False-Positive Considerations

- **Public-WebRTC services with documented broad admission** + compensating controls. Suppress with documentation.
- **DB-driven membership the advisor cannot inspect.** Primary firing mode (`review_required`). Operators confirm and suppress.
- **Migration windows** during peer onboarding. Suppress with `expires`.
- **Lab and dev** — suppress with `expires`.
- **`permissions` used only for non-source-trust purposes.** Suppress with documentation.

## Related Rules

- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay-no-isself)
- `OSIPS-SEC-AUTH-002` (auth-after-routing)
- `OSIPS-SEC-TLS-002` (require-cert-missing) — mTLS compensates partially.

## Additional References

- Phase 2 §4.5
- OpenSIPS permissions: https://opensips.org/docs/modules/3.4.x/permissions.html
- CWE-269, CWE-284, CWE-501
- OWASP A01:2021
