---
id: OSIPS-SEC-TLS-002
name: require-cert-missing
title: tls_mgm require_cert=0 on server-to-server listener — anonymous TLS clients accepted
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: tls
applies_if_modules_loaded: [tls_mgm]
applies_if_opensips_version: ">=3.2"
phase: [structural, value_pattern, semantic_contextual]
profile: [L2]
automated: true
suppressible: true

severity: medium
confidence: medium
security_severity: 5.9
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:L/SC:N/SI:N/SA:N"
cwe: [CWE-287, CWE-322]
owasp: ["A07:2021-Identification and Authentication Failures"]
attack: [T1133, T1078]
tags: [tls, mtls, require_cert, peer-authentication, tls_mgm]

references:
  - https://opensips.org/docs/modules/3.4.x/tls_mgm.html
  - https://cwe.mitre.org/data/definitions/287.html
  - 90_reference/01_master_vulnerability_reference.md#section-6

short_description: |
  tls_mgm has require_cert=0 (or unset on a public-facing listener), allowing
  TLS clients to connect without presenting a certificate. The deployment
  accepts anonymous TLS — encryption without peer authentication. Acceptable
  on browser-WebSocket terminations and end-user softphone edges; not
  acceptable on carrier peering, federation, or other server-to-server
  trust relationships.
---

## Rationale

`require_cert` is the mTLS toggle in `tls_mgm`. With `require_cert=1`, the TLS handshake demands the peer present a client certificate, and the validation rules of `verify_cert` / `ca_list` / `crl_check_all` apply. With `require_cert=0`, the handshake completes without a peer certificate — the server presents its own cert, the client doesn't, and the channel is encrypted but the peer is unauthenticated at the TLS layer.

This is acceptable in some deployment patterns and not in others:

- **End-user softphone over TLS** — softphones authenticate via SIP digest after the TLS handshake; mTLS would require provisioning client certs to every endpoint, which most enterprise PBX deployments don't operationalize. `require_cert=0` is correct here.
- **Browser WebSocket termination** — browsers don't present client certs for WebSocket connections (the UI for client-cert prompts is hostile). `require_cert=0` is correct, and the substantive auth is in the SIP-over-WS layer.
- **Carrier peering** — interconnect with another carrier should be mutually authenticated at the TLS layer. `require_cert=0` here is a structural failure: anyone who reaches the listener becomes a "peer" without TLS-level identity validation.
- **Federation / inter-domain** — inter-domain SIP federation should use mTLS to bind each domain to its identity.

The rule's job is to identify configurations where `require_cert=0` is structurally inappropriate for the deployment posture. The advisor cannot fully determine the deployment posture from cfg alone; it reasons about loaded modules and listener bindings to estimate whether this is end-user-edge or server-to-server.

This is L2-profile because L1 enterprise PBX deployments commonly serve end-user endpoints over TLS-without-mTLS as documented practice. L2 carrier-grade and federation-heavy deployments are expected to use mTLS as the baseline.

Source: Phase 2 master vulnerability reference §6; OpenSIPS tls_mgm module README.

## Default Value

`require_cert` defaults to `0` in most OpenSIPS releases — anonymous TLS is the documented default. The operator must opt into mTLS by setting `require_cert=1`.

## Audit

The rule fires when **all** of the following are true:

1. `tls_mgm` is loaded.
2. `require_cert` is `0` (or unset, which is equivalent).
3. The cfg has at least one TLS-using transport (`proto_tls`, `proto_wss`) or TLS-bound listener.
4. The deployment is reasoned to be server-to-server. Heuristics:
   - The cfg loads `dispatcher`, `drouting`, `load_balancer`, or `permissions` with peer-trust groups → carrier/federation.
   - The cfg has explicit `permissions:allow_source_address()` checks against trust groups → server-to-server.
   - The cfg loads `proto_wss` only (no `proto_tls`) → likely browser/end-user, rule does not fire.
   - The cfg's intake declared the deployment as carrier SBC, federation gateway, or peering edge → rule fires.

When the deployment posture cannot be determined, the rule emits at `confidence: medium` with `kind: review_required`.

## Remediation

For server-to-server deployments where mTLS is appropriate:

1. **Enable mTLS:**

   ```opensips
   modparam("tls_mgm", "require_cert", "1")
   modparam("tls_mgm", "verify_cert", "1")
   modparam("tls_mgm", "ca_list", "/etc/opensips/tls/peer_ca_list.pem")
   ```

2. **Populate `ca_list` with the CA(s) that sign your peers' certificates.**

3. **Validate the peer identity in route logic:**

   ```opensips
   if (proto == TLS) {
       if (!is_peer_verified()) {
           send_reply(403, "TLS peer not verified");
           exit;
       }
       if (!allow_source_address("federated_peers")) {
           send_reply(403, "Peer not in federation");
           exit;
       }
   }
   ```

4. **For mixed deployments** (some listeners serve end-user TLS, others serve server peering), use per-domain TLS configuration via `tls_mgm`'s domain table.

For end-user / browser deployments where mTLS is structurally inappropriate:

5. **Document the posture explicitly** in cfg comments and suppress this rule with `justification="end-user TLS endpoint; auth via SIP digest after handshake"`.

6. **Compensate at higher layers.** SIP-layer auth must be airtight when TLS-layer auth is absent.

## Example — BAD

```opensips
loadmodule "proto_tls.so"
loadmodule "tls_mgm.so"
loadmodule "tls_openssl.so"
loadmodule "dispatcher.so"
loadmodule "permissions.so"

modparam("tls_mgm", "verify_cert", "1")
modparam("tls_mgm", "require_cert", "0")     # anonymous TLS on a peering listener
modparam("tls_mgm", "ca_list", "/etc/opensips/tls/calist.pem")

modparam("dispatcher", "list_file", "/etc/opensips/dispatcher.list")

listen=tls:0.0.0.0:5061

route {
    if (proto == TLS && allow_source_address("carrier_peers")) {
        ds_select_dst(0, 4);
        t_relay();
    }
}
```

## Example — GOOD

```opensips
loadmodule "proto_tls.so"
loadmodule "tls_mgm.so"
loadmodule "tls_openssl.so"
loadmodule "dispatcher.so"
loadmodule "permissions.so"

modparam("tls_mgm", "verify_cert", "1")
modparam("tls_mgm", "require_cert", "1")
modparam("tls_mgm", "ca_list", "/etc/opensips/tls/peer_ca.pem")
modparam("tls_mgm", "method", "TLSv1_2+")

modparam("dispatcher", "list_file", "/etc/opensips/dispatcher.list")

listen=tls:0.0.0.0:5061

route {
    if (proto == TLS) {
        if (!is_peer_verified()) {
            send_reply(403, "TLS peer not verified");
            exit;
        }
        if (!allow_source_address("carrier_peers")) {
            send_reply(403, "Peer not in carrier group");
            exit;
        }
        ds_select_dst(0, 4);
        t_relay();
    }
}
```

## Version Notes

`require_cert` semantics are stable across OpenSIPS 3.2 through 3.6. Per-domain TLS configuration has been available since 3.2 via the `tls_mgm` domain table.

## False-Positive Considerations

- **End-user edge listeners** legitimately use `require_cert=0`. The deployment-posture heuristics may misclassify; suppress with documentation when the rule fires on a known end-user listener.
- **Lab and dev deployments** without mTLS PKI should suppress with `expires`.
- **Hybrid deployments** (same OpenSIPS instance serving both end-user TLS and server peering) require per-domain TLS configuration. Operators configure per-domain explicitly.
- **Behind a TLS-terminating reverse proxy** that enforces mTLS externally. Suppress with documentation.

## Related Rules

- `OSIPS-SEC-TLS-001` (verify-cert-disabled) — peer cert validation when present.
- `OSIPS-SEC-TLS-003` (weak-tls-method) — protocol-version selection.
- `OSIPS-SEC-AUTH-002` (auth-after-routing) — SIP-layer auth must be airtight when mTLS is absent.

## Additional References

- Phase 2 master vulnerability reference §6
- OpenSIPS tls_mgm module: https://opensips.org/docs/modules/3.4.x/tls_mgm.html
- CWE-287 — Improper Authentication
- CWE-322 — Key Exchange without Entity Authentication
- OWASP A07:2021 — Identification and Authentication Failures
