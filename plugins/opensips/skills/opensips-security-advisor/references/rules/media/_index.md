# Media Plane

Rules in this family target media-plane (RTP/RTCP) exposure and proxy hardening: rtpproxy/rtpengine binding scope, SDP rewriting integrity, and media-relay listener exposure.

| Rule ID | Title | Severity |
|---|---|---|
| OSIPS-SEC-MEDIA-001 | rtpproxy/rtpengine loaded but engage_rtp_proxy() not called on INVITE — media bypasses proxy | medium |
| OSIPS-SEC-MEDIA-002 | rtpengine/rtpproxy engagement conditional on attacker-influenced predicates | medium |
| OSIPS-SEC-MEDIA-003 | rtpengine engaged without SRTP-required flags — media flows in cleartext | medium |
| OSIPS-SEC-MEDIA-004 | SDP late-offer / re-INVITE handled without re-validating media policy | medium |
