# Management Interface Exposure

Rules in this family target management-interface exposure: mi_http, mi_datagram, and mi_xmlrpc binding scope, authentication, and listener confinement.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-MI-001 | mi_http / httpd bound to non-loopback address — administrative interface exposed on network | critical |
| OSIPS-SEC-MI-002 | mi_datagram bound to udp:/tcp: socket — administrative interface exposed on network | critical |
| OSIPS-SEC-MI-003 | MI module loaded without trusted-clients allow-list — missing defense-in-depth access control | medium |
| OSIPS-SEC-MI-004 | Deprecated mi_xmlrpc module loaded on OpenSIPS 3.x | high |
| OSIPS-SEC-MI-005 | httpd MI transport configured without TLS — admin traffic in cleartext | medium |
