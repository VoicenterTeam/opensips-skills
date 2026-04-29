# Configuration Hygiene

Rules in this family target configuration hygiene with security implications: cleartext credentials in modparams, world-readable config files, debug verbosity in production, and similar posture defects.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-HYG-001 | db_url, cachedb_url, or similar modparam contains cleartext password | medium |
| OSIPS-SEC-HYG-002 | Module loaded with loadmodule but no module-provided primitive is called | low |
| OSIPS-SEC-HYG-003 | mi_datagram unix socket directory permissions implied unsafe by parent path | medium |
| OSIPS-SEC-HYG-004 | startup_route invokes exec_msg or other shell-execution primitives | medium |
