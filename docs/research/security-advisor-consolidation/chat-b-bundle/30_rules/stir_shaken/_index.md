# STIR/SHAKEN

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-STIR_SHAKEN-001 | PAI used in routing without verification | high | L2 |
| OSIPS-SEC-STIR_SHAKEN-002 | stir_shaken loaded but verify never called | medium | L2 |
| OSIPS-SEC-STIR_SHAKEN-003 | verify return value ignored, attestation AVP used | high | L2 |
| OSIPS-SEC-STIR_SHAKEN-004 | Outbound INVITEs without attestation | medium | L2 |

The `stir_shaken` family covers script-layer correctness for STIR/SHAKEN (RFC 8224 +
RFC 8225) — cryptographic caller-identity authentication. Inbound verification
(terminating-side) and outbound attestation (originating-side) are both in scope.
L2-profile because STIR/SHAKEN is primarily a regulatory requirement (TRACED Act in
the US, ITU-T elsewhere); L1 enterprise PBX deployments typically have no obligations.

## See also

- `30_rules/auth/_index.md` — STIR_SHAKEN-003 mirrors AUTH-003 return-value-ignored class
- `30_rules/identity_spoofing/_index.md` — failures compound with PAI/From manipulation
- `30_rules/tls/_index.md` — STIR/SHAKEN signature trust depends on TLS posture
