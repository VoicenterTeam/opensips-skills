---
id: OSIPS-SEC-DOS_DEFENSE-005
name: no-concurrent-call-cap
title: dialog module loaded but no per-AoR or global concurrent-dialog cap
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: dos_defense
applies_if_modules_loaded: [dialog]
applies_if_opensips_version: ">=3.2"
phase: [structural, semantic_contextual]
profile: [L2]
automated: false
suppressible: true

severity: medium
confidence: medium
security_severity: 5.3
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:N"
cwe: [CWE-770, CWE-400]
owasp: ["A04:2021-Insecure Design"]
attack: [T1499.003]
tags: [dos, dialog-cap, concurrent-calls, resource-exhaustion, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/dialog.html
  - 90_reference/01_master_vulnerability_reference.md#section-4

short_description: |
  dialog module loaded but no concurrent-call cap — per-AoR, per-source, or
  global — enforced. An attacker with one authenticated AoR can originate
  unlimited concurrent calls; held dialog state exhausts the dialog table,
  backend gateway slots, and media resources.
---

## Rationale

Rate-limiting bounds *new* request volume; dialog state bounds *concurrent* call holding. A compromised AoR can originate INVITE → wait for ACTIVE → repeat unboundedly. Each dialog consumes memory in the dialog table, transaction-table slots, gateway capacity, and media resources.

OpenSIPS exposes mechanisms: `get_dialog_count()` for global; per-AoR via dialog profiles (`set_dlg_profile`/`get_profile_size`); per-source via similar profile patterns keyed on `$si`.

`automated: false` because cap-enforcement patterns vary widely; cap *values* are deployment-specific. Primary firing mode is `review_required` on cfgs that load `dialog` without any concurrent-dialog enforcement.

L2-profile because L1 commonly bounds via per-trunk billing rather than cfg-level caps.

Source: Phase 2 §4.

## Default Value

Not applicable — operator-encoded.

## Audit

The rule fires (as `review_required`) when:

1. `dialog` is loaded.
2. No `get_dialog_count()` comparison against threshold.
3. No `get_profile_size()` comparison against threshold.
4. No `set_dlg_profile()` paired with subsequent profile-size check.
5. Profile is L2.

## Remediation

Per-AoR cap:

```opensips
modparam("dialog", "profiles_with_value", "active_calls")

route {
    if (is_method("INVITE") && !has_totag()) {
        if (get_profile_size("active_calls", "$fU") > 5) {
            send_reply(486, "Too Many Concurrent Calls"); exit;
        }
        set_dlg_profile("active_calls", "$fU");
    }
}
```

Global cap:

```opensips
if (get_dialog_count() > 10000) {
    send_reply(503, "Server Busy"); exit;
}
```

Per-AoR 5-20 typical for enterprise; 1-3 for residential. Global ~80% of tested capacity.

## Example — BAD

```opensips
loadmodule "dialog.so"
loadmodule "tm.so"
# No concurrent-dialog enforcement

route {
    if (is_method("INVITE")) t_relay();
}
```

## Example — GOOD

```opensips
loadmodule "dialog.so"
loadmodule "tm.so"

modparam("dialog", "profiles_with_value", "active_calls")

route {
    if (is_method("INVITE") && !has_totag()) {
        if (get_dialog_count() > 10000) {
            send_reply(503, "Server Busy"); exit;
        }
        if (get_profile_size("active_calls", "$fU") > 5) {
            send_reply(486, "Too Many Concurrent Calls"); exit;
        }
        set_dlg_profile("active_calls", "$fU");
    }
    # ... routing
}
```

## Version Notes

`dialog` module profile and counting APIs stable across OpenSIPS 3.2-3.6.

## False-Positive Considerations

- **Carrier-side concurrent-call limits** make cfg-level cap redundant. Suppress with documentation.
- **Single-tenant cfgs** with bounded contracted capacity. Suppress.
- **Cfgs using non-canonical patterns** (DB-backed counters, external service). Suppress with documentation.
- **Lab and dev** — suppress with `expires`.

## Related Rules

- `OSIPS-SEC-DOS_DEFENSE-001` (no-pike) — request-rate cap.
- `OSIPS-SEC-DOS_DEFENSE-002` (no-ratelimit)
- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay)

## Additional References

- Phase 2 §4
- OpenSIPS dialog: https://opensips.org/docs/modules/3.4.x/dialog.html
- CWE-770, CWE-400
- OWASP A04:2021
