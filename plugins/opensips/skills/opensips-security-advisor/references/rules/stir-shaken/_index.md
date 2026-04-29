# STIR/SHAKEN

Rules in this family target STIR/SHAKEN identity attestation: stir_shaken module configuration, attestation-level policy, and verification-failure handling.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-STIR-001 | P-Asserted-Identity trusted from upstream without verifying STIR/SHAKEN attestation | high |
| OSIPS-SEC-STIR-002 | stir_shaken module loaded but no verification call in any route | medium |
| OSIPS-SEC-STIR-003 | Attestation result used in routing without testing verifier return value | high |
| OSIPS-SEC-STIR-004 | Outbound INVITEs leave the deployment without STIR/SHAKEN attestation | medium |
