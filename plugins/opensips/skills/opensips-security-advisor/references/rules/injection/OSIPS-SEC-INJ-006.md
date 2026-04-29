---
id: OSIPS-SEC-INJ-006
name: crlf-append-hf
title: SIP-sourced pseudo-variable flows into append_hf without CRLF stripping — header injection
version: 1.0
engine_version_min: "0.1"
engine_version_max: ""
module_family: injection
applies_if_modules_loaded: [textops, sipmsgops]
applies_if_opensips_version: ">=3.2"
phase: [dataflow_taint]
profile: [L1, L2]
automated: true
suppressible: true

severity: high
confidence: high
security_severity: 7.5
cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:L/SC:L/SI:H/SA:N"
cwe: [CWE-93, CWE-113, CWE-20]
owasp: ["A03:2021-Injection"]
attack: [T1565]
tags: [injection, crlf, header-injection, append-hf, smuggling]

references:
  - https://opensips.org/docs/modules/3.4.x/textops.html
  - https://opensips.org/docs/modules/3.4.x/sipmsgops.html
  - https://cwe.mitre.org/data/definitions/93.html
  - ../../knowledge/vulnerability-reference.md#section-6

short_description: |
  An attacker-controlled SIP pseudo-variable is interpolated into the value
  passed to append_hf(), append_to_reply(), or replace_hdrs() without stripping
  CR/LF characters. A crafted input containing \r\n breaks out of the header
  value and injects arbitrary additional headers into the message — header
  smuggling, identity spoofing, or routing manipulation downstream.
---

## Rationale

SIP messages, like HTTP, terminate headers with CRLF (`\r\n`) and terminate the header block with double CRLF. When the cfg author appends a header whose value contains a literal CRLF, the parser on the next hop interprets the injected sequence as a legitimate header boundary — the attacker has injected a header into the outgoing message.

The OpenSIPS primitives in scope:

- `append_hf("Header-Name: $value\r\n")` from `textops` — appends to the request being processed.
- `append_to_reply("Header-Name: $value\r\n")` — appends to the outgoing response.
- `replace_hdrs(...)` patterns from `sipmsgops` that take a value string.
- `$hdr(Header-Name) = "value"` assignment when the value contains taint.

Three exploitation patterns:

1. **Identity spoofing.** The classic case: `$fU = "alice\r\nP-Asserted-Identity: <sip:admin@trusted-domain>"` injects a `P-Asserted-Identity` header that downstream STIR/SHAKEN, billing, or routing logic trusts. The attacker bypasses identity assertion that was supposed to be operator-controlled.

2. **Routing manipulation.** Injecting a `Route` header alters the request's onward path — the request ends up at an attacker-chosen next-hop instead of the cfg's intended destination. On open-relay-prone topologies this enables free-call routing.

3. **Header smuggling between hops.** When two SIP elements interpret the same message differently (one parsing CR alone as a delimiter, the other requiring CRLF), a carefully crafted value can produce different views of the message at different hops — analogous to HTTP request smuggling. This is the mechanism behind several historical SIP-firewall bypasses.

The defense is simple in principle: strip or reject CR (`\r`, `\x0d`) and LF (`\n`, `\x0a`) characters from any value flowing into a header-construction sink. OpenSIPS provides the `s.escape.common` transformation which escapes both characters, and the `s.replace` transformation can be used for explicit stripping. Length-bounding alone is not sufficient — short strings can still contain CRLF.

This rule's confidence is high because the dataflow pattern is structurally clear: a SIP-sourced PV reaching an `append_hf`-class sink without CR/LF handling is unambiguously vulnerable.

Source: Phase 2 master vulnerability reference §6 (Injection); OpenSIPS textops and sipmsgops module documentation.

## Default Value

Not applicable — header-construction primitives have no defaulted CR/LF stripping.

## Audit

The rule fires when **all** of the following are true:

1. A SIP-sourced pseudo-variable from the taint-source set is read.
2. The variable flows into the value-string argument of:
   - `append_hf()`, `append_to_reply()`, `insert_hf()` (textops)
   - `replace_hdrs()`, `replace_body()` when used to build header content (sipmsgops)
   - Direct assignment `$hdr(<name>) = "..."` where `...` contains the PV
3. No CR/LF-stripping sanitizer is applied:
   - `{s.escape.common}` (escapes CR, LF among others) — accepted
   - `{s.replace,/[\\r\\n]/, ""}` or equivalent stripping transformation — accepted
   - Explicit upstream regex that excludes CR/LF: `^[^\\r\\n]+$` with bounded length — accepted

Configs that build the header value without any user-derived content (constants, operator-controlled AVPs sourced from trusted lookups) do not fire.

## Remediation

1. **Apply `s.escape.common` at every header-construction sink.** This is the universal-compatibility defense:

   ```opensips
   append_hf("X-Caller-User: $(fU{s.escape.common})\r\n");
   ```

2. **For values that should be SIP-URI-shaped specifically, use `s.escape.user`.** The URI-fragment escape is more aggressive than `s.escape.common` for URI contexts:

   ```opensips
   append_hf("X-Caller-URI: <sip:$(fU{s.escape.user})@$(fd{s.escape.user})>\r\n");
   ```

3. **For operator-controlled identity headers (`P-Asserted-Identity`, `Remote-Party-ID`, `History-Info`), build from validated sources only.** Never let user input into these — they are by-design operator-trusted. If the value must be SIP-derived, validate it through STIR/SHAKEN attestation (see `stir_shaken` family) before constructing the header.

4. **Defense in depth — early CR/LF rejection.** At the request_route entry, drop messages whose pseudo-variables already contain CR/LF (a strong signal of attempted injection):

   ```opensips
   if ($fU =~ "[\r\n]" || $tU =~ "[\r\n]" || $ru =~ "[\r\n]") {
       xlog("L_WARN", "CRLF in URI fields from $si: fu=$fu tu=$tu ru=$ru\n");
       send_reply(400, "Malformed Request");
       exit;
   }
   ```

   This is rare in legitimate traffic and a high-signal indicator of probing.

5. **Audit downstream behavior on injected headers.** Even with input sanitization, downstream elements (your STIR/SHAKEN verifier, billing system, recording proxy) should treat any header that *could* have been user-influenced as untrusted. The defense is layered.

## Example — BAD

### Bare $fU in append_hf

```opensips
loadmodule "textops.so"

route {
    if (is_method("INVITE")) {
        # $fU = "alice\r\nP-Asserted-Identity: <sip:admin@trusted>"
        # injects PAI header that the next hop trusts
        append_hf("X-Caller: $fU\r\n");
        t_relay();
    }
}
```

### Direct $hdr() assignment

```opensips
route {
    if (is_method("INVITE")) {
        # Same vulnerability via assignment
        $hdr(X-Original-Caller) = $fU;
        t_relay();
    }
}
```

### Building Route header from user input

```opensips
route {
    if (is_method("INVITE")) {
        # $rU = "1234\r\nRoute: <sip:attacker.example;lr>"
        # alters where the request is routed
        append_hf("X-Trace: $rU\r\n");
        t_relay();
    }
}
```

## Example — GOOD

### `s.escape.common` at sink

```opensips
loadmodule "textops.so"

route {
    if (is_method("INVITE")) {
        append_hf("X-Caller: $(fU{s.escape.common})\r\n");
        t_relay();
    }
}
```

### Early CR/LF rejection + sanitizer at sink (defense in depth)

```opensips
loadmodule "textops.so"

route {
    # Drop probing attempts at the door
    if ($fU =~ "[\r\n]" || $tU =~ "[\r\n]" || $ru =~ "[\r\n]") {
        xlog("L_WARN", "CRLF probe from $si\n");
        send_reply(400, "Malformed Request");
        exit;
    }

    if (is_method("INVITE")) {
        # Sanitizer at sink as redundant defense
        append_hf("X-Caller: $(fU{s.escape.common})\r\n");
        $hdr(X-Original-Caller) = $(fU{s.escape.common});
        t_relay();
    }
}
```

## Version Notes

`textops` and `sipmsgops` primitive signatures are stable across OpenSIPS 3.2 through 3.6. The `s.escape.common` and `s.escape.user` script transformations are available across all supported versions.

Some 3.5+ releases added explicit `s.replace` parameter forms; the rule's detection of CR/LF-stripping sanitizers accepts both the built-in escape transformations and explicit `s.replace` patterns.

## False-Positive Considerations

- **Constant header values.** `append_hf("X-Service: opensips-edge\r\n")` with no PV interpolation is safe and the rule does not fire.
- **Header values built from operator-controlled AVPs.** When the AVP is populated only from trusted sources (`sql_select` against an operator-managed table, constant assignment, validated upstream), the rule does not fire on the AVP-to-header-value path. The advisor traces taint propagation; values that have been re-validated become non-taint-marked.
- **Per-call diagnostic headers added in a controlled internal hop.** Some operators add `X-Trace-*` headers on an internal proxy where downstream elements ignore them. Suppress with `justification="internal-only diagnostic header; downstream strips X-* before egress"` and confirm the strip is in place.
- **`P-Asserted-Identity` set from authenticated identity.** When PAI is constructed *after* `proxy_authorize()` succeeded and is set from `$au` (the digest-authenticated user, operator-trusted) rather than from `$fU`, the rule does not fire. Configs that conflate `$fU` with `$au` are a separate finding under `OSIPS-SEC-IDENTITY_SPOOFING-002`.

## Related Rules

- `OSIPS-SEC-INJECTION-001`, `-002` — same taint sources, DB sink class.
- `OSIPS-SEC-INJECTION-005` — same dataflow pattern, cache key sink.
- `OSIPS-SEC-IDENTITY_SPOOFING-002` (uac-replace-before-acc) — closely related: identity-header construction patterns that fail differently.
- `OSIPS-SEC-RELAY_AND_ROUTING-001` (open-relay-no-isself) — Route-header injection compounds with open-relay conditions.
- `OSIPS-SEC-TRACING_AND_LOGGING-004` (acc-crlf-injection) — the accounting-layer analog: CRLF-injected values flowing into ACC records.

## Additional References

- Phase 2 master vulnerability reference §6 (Injection)
- OpenSIPS textops module: https://opensips.org/docs/modules/3.4.x/textops.html
- OpenSIPS sipmsgops module: https://opensips.org/docs/modules/3.4.x/sipmsgops.html
- CWE-93 — Improper Neutralization of CRLF Sequences (CRLF Injection)
- CWE-113 — HTTP Response Splitting (close analog for SIP)
- CWE-20 — Improper Input Validation
- OWASP A03:2021 — Injection
