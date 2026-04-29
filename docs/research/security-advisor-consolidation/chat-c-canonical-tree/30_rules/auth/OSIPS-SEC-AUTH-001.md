---
id: OSIPS-SEC-AUTH-001
name: plaintext-ha1-storage
title: Plaintext HA1 storage enabled in auth_db
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: auth
applies_if_modules_loaded: [auth_db]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.2
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-256, CWE-522]
owasp: ["A02:2021-Cryptographic Failures"]
attack: [T1552.001]
tags: [authentication, credential-storage, auth_db, digest]

references:
  - https://opensips.org/docs/modules/3.4.x/auth_db.html
  - https://cwe.mitre.org/data/definitions/256.html
  - 90_reference/01_master_vulnerability_reference.md#section-5

short_description: |
  auth_db is configured to compute HA1 from plaintext passwords at runtime, implying the
  subscriber table stores recoverable credentials. Any DB read primitive (SQLi, backup
  leak, replica exposure, insider access) yields directly usable passwords.
---

## Rationale

OpenSIPS' digest authentication can either read a pre-computed `HA1 = MD5(username:realm:password)` column, or compute the HA1 at runtime from a plaintext `password` column. The runtime path requires the database to store the password in recoverable form. This makes any database read primitive — SQL injection, accidental backup exposure, replica misconfiguration, insider access, log redaction failures — directly equivalent to credential disclosure.

Storing only the realm-scoped HA1 confines the damage: an attacker who exfiltrates the table can replay credentials within the realm but cannot reuse the password elsewhere (email accounts, VPNs, other SIP realms). Per CWE-256 (Plaintext Storage of a Password) and CWE-522 (Insufficiently Protected Credentials), plaintext storage of authentication material is a baseline failure mode every digest-authenticating SIP deployment must avoid.

Source: Phase 2 master vulnerability reference §5; OpenSIPS auth_db module documentation.

## Default Value

`calculate_ha1=0`. The OpenSIPS default expects a pre-computed `ha1` column. Plaintext-mode authentication must be deliberately enabled by the operator — this rule never fires on a default configuration.

## Audit

Two co-occurring signals trigger the rule:

1. `modparam("auth_db", "calculate_ha1", 1)` anywhere in `opensips.cfg` or any included file.
2. `modparam("auth_db", "password_column", "<col>")` where `<col>` is not `ha1` (commonly `password`, `pass`, `secret`).

Either signal alone is sufficient for a high-confidence finding; both together strengthen the evidence trace. The rule also fires if `password_column` is left at its default while `calculate_ha1=1` — auth_db falls back to reading a column literally named `password` even without the explicit override.

## Remediation

1. Add an `ha1` column to the subscriber table if not already present (most schemas ship with one — verify it isn't left empty).
2. Back-fill: `UPDATE subscriber SET ha1 = MD5(CONCAT(username, ':', realm, ':', password));` then verify a sample subscriber authenticates against the new column.
3. Set `modparam("auth_db", "calculate_ha1", 0)` and `modparam("auth_db", "password_column", "ha1")`.
4. Drop or encrypt-at-rest the original `password` column once verification is complete. Rotate any credentials that may have been exposed during the plaintext-storage period.
5. If HA1B (HA1 with no realm scoping, used for some interop scenarios) is also needed, populate the `ha1b` column via back-fill and set `password_column_2 = "ha1b"`. Do not re-enable runtime computation as a shortcut.

## Example

### BAD

```opensips
loadmodule "auth_db.so"

modparam("auth_db", "calculate_ha1", 1)
modparam("auth_db", "password_column", "password")
modparam("auth_db", "db_url", "mysql://opensips:secret@db/opensips")

# Subscriber table stores plaintext "password" column.
# Any SELECT on subscriber yields recoverable credentials.

route {
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        save("location");
        exit;
    }
}
```

### GOOD

```opensips
loadmodule "auth_db.so"

modparam("auth_db", "calculate_ha1", 0)
modparam("auth_db", "password_column", "ha1")
modparam("auth_db", "db_url", "mysql://opensips:secret@db/opensips")

# Subscriber table stores HA1 = MD5(username:realm:password) only.
# DB exfiltration yields realm-scoped digest material, not plaintext passwords.

route {
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        save("location");
        exit;
    }
}
```

## Version Notes

Behavior is identical across OpenSIPS 3.2, 3.3, 3.4 LTS, 3.5, and 3.6 LTS. The `calculate_ha1` parameter has existed in `auth_db` since the OpenSER fork and its semantics have not changed.

## False-Positive Considerations

- A test or lab cfg that deliberately stores plaintext for development is still a finding — the advisor does not silence it on a "lab" profile because the cfg may be promoted unchanged. Use a suppression with `expires` if the lab posture is intentional.
- Some legacy deployments populate a non-MD5 HA1 column externally (e.g., via a custom provisioning pipeline). The advisor cannot detect this from the cfg alone; the rule still fires and the user can suppress with `justification="custom HA1 column populated externally"`.
- Do not confuse with Kamailio's `auth_db.password_column` — Kamailio uses an identically-named modparam with the same risk profile, but a Kamailio cfg fed to this advisor would mis-fire as a finding for the wrong tool. The intake protocol must detect Kamailio-isms (`sanity_check()`, `allow_address()`, `secfilter`, etc.) before this rule runs — see the `kamailio-dialect.cfg` fixture.

## Related Rules

- `OSIPS-SEC-AUTH-005` (digest-leak-oracle) — even with HA1-only storage, a misconfigured challenge flow can leak the HA1 to an attacker.
- `OSIPS-SEC-CONFIG_HYGIENE-001` (cleartext-credentials-modparam) — covers the `db_url` `user:pass@host` cleartext credential pattern in this same modparam block.
- `OSIPS-SEC-INJECTION-001` (sql-inj-avp-db-query) — SQLi against the subscriber table is catastrophic in plaintext mode, severe-but-recoverable in HA1 mode.

## Additional References

- Phase 2 master vulnerability reference §5 (Authentication / credential storage)
- OpenSIPS auth_db module documentation — https://opensips.org/docs/modules/3.4.x/auth_db.html
- CWE-256 — Plaintext Storage of a Password
- CWE-522 — Insufficiently Protected Credentials
- OWASP A02:2021 — Cryptographic Failures
