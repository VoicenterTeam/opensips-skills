# Media

Rules in this family:

| ID | Title | Severity | Profile |
|---|---|---|---|
| OSIPS-SEC-MEDIA-001 | rtpproxy/rtpengine loaded but engagement not called | medium | L1, L2 |
| OSIPS-SEC-MEDIA-002 | Engagement gated on attacker-influenced predicates | medium | L1, L2 |
| OSIPS-SEC-MEDIA-003 | rtpengine called without SRTP-required flags | medium | L2 |
| OSIPS-SEC-MEDIA-004 | re-INVITE / late-offer not re-validated | medium | L2 |

The `media` family covers script-layer correctness for media-plane handling via
rtpproxy and rtpengine: relay engagement, conditional bypass concerns, SRTP
enforcement, and re-INVITE/late-offer policy continuity.

## See also

- `30_rules/tls/_index.md` — signaling-layer encryption is independent of media-layer
- `30_rules/stir_shaken/_index.md` — recording/verification depends on signaling correctness
