# Tracing and Logging

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-TRACING_AND_LOGGING-001 | xlog with Authorization / credential headers | high | L1, L2 |
| OSIPS-SEC-TRACING_AND_LOGGING-002 | acc extra_fields contains credential PVs | medium | L2 |
| OSIPS-SEC-TRACING_AND_LOGGING-003 | proto_hep / siptrace public bind or remote cleartext | high | L1, L2 |
| OSIPS-SEC-TRACING_AND_LOGGING-004 | SIP-sourced PV in acc record without CRLF stripping | medium | L1, L2 |

The `tracing_and_logging` family covers script-layer correctness for logging (xlog),
accounting (acc), and SIP capture (proto_hep / siptrace). Rules cover credential
exposure in logs, CRLF-injection in records, and network-listening on capture
transports.

## See also

- `30_rules/auth/_index.md` — credential exposure compounds digest-leak oracle
- `30_rules/injection/_index.md` — TRACING_AND_LOGGING-004 mirrors INJECTION-006
- `30_rules/mi_exposure/_index.md` — same network-listening class
