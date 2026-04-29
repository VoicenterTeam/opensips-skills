---
id: OSIPS-SEC-TLS-007
name: ws-origin-disabled
title: proto_wss accepts WebSocket connections without Origin allow-list
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tls
applies_if_modules_loaded: [proto_wss, proto_ws]
applies_if_opensips_version: ">=3.2"
phase: [structural, semantic_contextual]
profile: [L1, L2]
automated: false
suppressible: true

severity: medium
confidence: medium
security_severity: 5.4
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:R/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N"
cwe: [CWE-346, CWE-942]
owasp: ["A05:2021-Security Misconfiguration"]
attack: [T1185]
tags: [tls, websocket, origin, cross-origin, webrtc, review_required]

references:
  - https://opensips.org/docs/modules/3.4.x/proto_wss.html
  - https://datatracker.ietf.org/doc/html/rfc6455
  - ../../knowledge/vulnerability-reference.md#section-6

short_description: |
  proto_wss / proto_ws is loaded for browser-side WebRTC SIP signaling but no
  Origin-header allow-list is enforced. Any web origin can establish a SIP
  WebSocket session; cross-origin requests from attacker-controlled web pages
  succeed against the proxy. Emits review_required because the validation
  pattern depends on the deployment's intended client topology.
---

## Rationale

WebSocket SIP transport (`proto_ws` for cleartext, `proto_wss` for TLS) carries SIP signaling for browser-based softphones using sip.js, JsSIP, or similar libraries. The browser's WebSocket handshake includes an `Origin` header indicating which web origin initiated the connection. Without a server-side Origin allow-list, any web origin can open a SIP WebSocket to the proxy:

1. **Cross-origin attack in a browser.** A malicious page (`evil.example`) opens a WebSocket to the proxy and uses it to register, place calls, or exfiltrate registration state on behalf of the visiting user. Browser-level same-origin policy doesn't apply to WebSockets without explicit server-side enforcement.

2. **Subdomain takeover compounding.** If the operator's WebRTC client is hosted at `webrtc.example.com` and an attacker takes over a sibling subdomain, the attacker's content runs in a context that may share authentication cookies or saved credentials with the legitimate client.

3. **CSRF-equivalent for WebSocket SIP.** Origin enforcement is the WebSocket equivalent of CSRF protection. Without it, the SIP control plane is browser-cross-origin-reachable.

OpenSIPS' `proto_wss` does not enforce Origin by default — the parameter exists but is operator-configured. The rule emits `review_required` because the legitimate Origin set is deployment-specific (the operator's WebRTC client domain, possibly multiple if there are mobile-web variants), and the cfg cannot fully express the intended scope without operator confirmation.

This rule is `automated: false` because the validation pattern (modparam allow-list, script-level Origin check, or external reverse-proxy enforcement) varies by deployment and the engine cannot prove correctness from cfg alone.

Source: Phase 2 master vulnerability reference §6 (TLS / WebSocket); OpenSIPS proto_wss documentation; RFC 6455 (WebSocket Protocol).

## Default Value

No defaulted Origin enforcement — `proto_wss` accepts any Origin if no allow-list is configured. The operator must opt into the check.

## Audit

The rule fires (as `review_required`) when:

1. `proto_wss` or `proto_ws` is loaded.
2. No Origin enforcement is detected:
   - No `proto_wss` modparam configuring an Origin allow-list (parameter naming varies by version; the advisor accepts documented forms).
   - No script-level check (e.g., `if ($hdr(Origin) != "https://webrtc.example.com") { send_reply(403, ...); exit; }`).
   - No documented reverse-proxy enforcement.

The rule does not fire when any of these enforcement patterns is detected, even when the engine cannot determine the allow-list's restrictiveness. The operator's choice of allow-list scope is their decision; the rule's purpose is to surface the absence of any enforcement.

## Remediation

1. **Identify the legitimate Origin(s) for your WebRTC client.** Typically a single HTTPS origin like `https://webrtc.example.com`.

2. **Enforce Origin at the script level for maximum visibility:**

   ```opensips
   route {
       if (proto == WSS || proto == WS) {
           if ($hdr(Origin) != "https://webrtc.example.com") {
               send_reply(403, "Origin not allowed");
               exit;
           }
       }
       # ... rest of routing
   }
   ```

3. **For multiple legitimate origins, use an explicit allow-list:**

   ```opensips
   route {
       if (proto == WSS || proto == WS) {
           if ($hdr(Origin) != "https://webrtc.example.com" &&
               $hdr(Origin) != "https://mobile.example.com") {
               send_reply(403, "Origin not allowed");
               exit;
           }
       }
   }
   ```

4. **Or terminate WebSocket TLS at a reverse proxy that enforces Origin** (nginx with `if ($http_origin ...)` blocks). Document the proxy's enforcement and suppress this rule with the documentation as justification.

5. **Audit the allow-list during operational changes.** Adding a new client subdomain requires updating the allow-list; an unmaintained list either over-restricts (legitimate clients fail) or under-restricts (new attack surface).

6. **Combine with `OSIPS-SEC-TLS-001` and `-006`.** Origin enforcement on top of broken TLS is meaningless — the network-adjacent attacker can rewrite the Origin header in transit.

## Example — BAD

```opensips
loadmodule "proto_wss.so"
loadmodule "tls_mgm.so"

modparam("tls_mgm", "verify_cert", 1)
# ... tls config ...

listen=wss:0.0.0.0:5061

route {
    # No Origin check — any web page in the wild can open a WSS to here
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        save("location");
    }
}
```

## Example — GOOD

```opensips
loadmodule "proto_wss.so"
loadmodule "tls_mgm.so"

modparam("tls_mgm", "verify_cert", 1)
# ... tls config ...

listen=wss:0.0.0.0:5061

route {
    if (proto == WSS) {
        # Allow only the deployment's legitimate WebRTC client origin
        if ($hdr(Origin) != "https://webrtc.example.com") {
            send_reply(403, "Origin not allowed");
            exit;
        }
    }

    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        save("location");
    }
}
```

## Version Notes

`proto_wss` and `proto_ws` modules are stable across OpenSIPS 3.2-3.6. The Origin-related modparams (where exposed) have evolved across releases; the rule accepts script-level enforcement as a universal pattern across all versions.

## False-Positive Considerations

- **Single-origin deployments with reverse-proxy enforcement.** When nginx or HAProxy enforces Origin before forwarding to OpenSIPS, the OpenSIPS-level check is redundant. Suppress with documentation.
- **Lab and dev** — suppress with `expires`.
- **Cleartext `proto_ws` deployments.** These have a separate, larger problem: cleartext WebSocket SIP. The rule fires, but the fundamental fix is enabling TLS, not just adding Origin enforcement.
- **WebSocket clients that don't send Origin** (non-browser clients implementing WebSocket without browser semantics). The rule's Origin-check remediation rejects these. Suppress only with documentation that the operator's WebRTC client population is browser-only.

## Related Rules

- `OSIPS-SEC-TLS-001` (verify-cert-disabled) — TLS posture compounds with WebSocket security.
- `OSIPS-SEC-TLS-006` (no-peer-verify-check) — TLS hardening baseline.
- `OSIPS-SEC-AUTH-005` (digest-leak-oracle) — WebSocket Origin gaps make digest-leak more accessible to web-origin attackers.

## Additional References

- Phase 2 master vulnerability reference §6 (TLS / WebSocket)
- OpenSIPS proto_wss module: https://opensips.org/docs/modules/3.4.x/proto_wss.html
- RFC 6455 — The WebSocket Protocol
- CWE-346 — Origin Validation Error
- CWE-942 — Permissive Cross-domain Policy with Untrusted Domains
- OWASP A05:2021 — Security Misconfiguration
- MITRE ATT&CK T1185 — Browser Session Hijacking
