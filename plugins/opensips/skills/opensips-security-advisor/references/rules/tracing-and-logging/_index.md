# Tracing and Logging

Rules in this family target tracing and logging hygiene: sensitive-data exposure in xlog, siptrace targets, and log-level posture.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-LOG-001 | xlog statement emits Authorization, password, or other credential material | high |
| OSIPS-SEC-LOG-002 | acc / acc_db captures full SIP messages without redaction — credentials in CDR records | medium |
| OSIPS-SEC-LOG-003 | proto_hep / siptrace bound to non-loopback or remote cleartext — capture stream public | high |
| OSIPS-SEC-LOG-004 | SIP-sourced PV flows into acc record without CRLF stripping — log injection | medium |
