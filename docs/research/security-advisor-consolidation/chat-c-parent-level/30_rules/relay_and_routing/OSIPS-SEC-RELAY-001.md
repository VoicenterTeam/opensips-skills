---
id: OSIPS-SEC-RELAY-001
version: "1.0"
name: open-relay-no-isself
title: "t_relay() invoked without is_myself / has_totag / allow_routing guard"
module_family: relay_and_routing
status: draft
introduced_in_engine_version: "0.1.0"

severity: medium
default_effort: M

cvss_v4_vector: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:L/VA:L/SC:N/SI:L/SA:N"
cwe: ["CWE-441"]
owasp: null
mitre_attack: ["T1090"]

description_short: |
  A t_relay() call appears in an initial-request route without an
  is_myself / has_totag / allow_routing discriminator, indicating a
  potential open-relay shape.

detection_phase:
  - structural
  - semantic
applies_if_opensips_version: ">=3.0, <4.0"
applies_if_modules_loaded: ["tm"]

fp_classes:
  - id: permissions_allow_routing_reachable
    description: >
      The permissions module is loaded and an allow_routing() (or
      allow_uri / allow_address) call gates the t_relay() site, either
      in the same route block or in a function called immediately
      before. The structural matcher cannot trace cross-route control
      flow; the judge re-reads the cfg to check.
  - id: in_dialog_only_path
    description: >
      The t_relay() site is reached only when has_totag() is true (i.e.,
      the request is mid-dialog) and the cfg has performed loose_route()
      to validate the dialog membership. Mid-dialog requests are not
      open-relay candidates.
  - id: ipsec_or_outer_authentication
    description: >
      The deployment terminates inbound SIP at an IPsec tunnel, mTLS
      proxy, or other outer authentication boundary, and the cfg
      explicitly trusts this. Indicators: comment block citing the
      perimeter, listen= directives bound only to private interfaces,
      explicit firewall coupling cited in cfg comments.

judge_confirmed_can_be_high: true

suppressible: true
---

# Detection

This rule fires when the structural pattern below holds:

1. The cfg contains a `t_relay()` call inside `request_route` or a `route[*]` reachable from `request_route`.
2. The same route block does not contain a preceding `is_myself()`, `has_totag()`, `loose_route()`, `allow_routing()`, `allow_uri()`, or `allow_address()` guard whose return value gates the `t_relay()`.

The structural match is a necessary condition but not sufficient — three known false-positive classes exist (enumerated in `fp_classes:` above), so the rule always invokes the semantic phase to weigh them. If the judge confirms none of the FP classes apply, the rule emits with confidence High (per the `judge_confirmed_can_be_high` opt-in). If the judge confirms an FP class applies, the rule dissents and the finding is suppressed-with-audit.

The rule does not fire when:
- `t_relay()` does not appear in `request_route` or its callees.
- The `tm` module is not loaded (defensive — `t_relay` is unavailable without it).
- A guard from the canonical list precedes the `t_relay()` site within the same route block.

# Evidence patterns

```yaml
- pattern_kind: route_block_match
  route: "request_route"
  contains_function: "t_relay"
  must_not_be_preceded_by:
    - function: "is_myself"
    - function: "has_totag"
    - function: "loose_route"
    - function: "allow_routing"
    - function: "allow_uri"
    - function: "allow_address"
  must_not_be_enclosed_in:
    - condition_calls: ["is_myself", "has_totag", "allow_routing", "allow_uri", "allow_address"]
  bind:
    - location: $relay_location
    - route_span: $route_lines
```

The matcher walks the structured AST of `request_route` (and route bodies it dispatches to) looking for `t_relay()` invocations not preceded by any guard from the canonical list, and not nested inside an `if` condition that calls one of the guards. Both checks are needed: a cfg can either invoke a guard then ignore its result, or place `t_relay()` outside the guarded branch — both are caught by the combined `must_not_be_preceded_by` + `must_not_be_enclosed_in` predicates.

# Rationale

A SIP proxy without an upstream-routing discriminator forwards any request to any destination its DNS resolver and routing rules permit. This is the classic "SIP open relay" shape: an attacker sends an INVITE to the proxy with a Request-URI pointing at a destination outside the proxy's served domains, and the proxy obligingly forwards it.

The threat model breaks down into three impact paths:
1. **Toll fraud.** Attacker uses the proxy as an upstream gateway to expensive PSTN destinations. The proxy operator's account is billed.
2. **Reflection / amplification.** Attacker uses the proxy as an intermediate hop to obscure the true source of malicious SIP traffic, or to amplify a denial-of-service.
3. **Trust laundering.** Some downstream SIP networks accept traffic from named upstream proxies on lower-trust premises ("source IP is trusted, less rigorous auth"). An open relay launders attacker traffic through a trusted-upstream identity.

Severity is **medium** rather than high because:
- The CVSS impact is bounded — confidentiality is unaffected (the proxy doesn't read the SIP body in the open-relay scenario), integrity is low (the message is forwarded, not modified), availability is low (the proxy itself remains up).
- The exploit requires the attacker to identify the open-relay shape, which is straightforward but not always reliable through firewalls and rate limits.

The CVSS 4.0 vector reflects: network attack, low complexity, no auth, no user interaction, no confidentiality impact, low integrity impact (message forwarding without authorization is integrity-relevant in the SIP context), low availability impact, low scope-integrity impact (the downstream network's trust premises are subtly violated).

CWE-441 (Unintended Proxy or Intermediary, "Confused Deputy") is the canonical mapping. There is no clean OWASP A category — the open-relay shape predates the modern OWASP top-10 framing.

# Recommendation template

The standard fix is to gate `t_relay()` on `is_myself()` for initial requests and `loose_route()` for in-dialog requests, with explicit method handling:

```opensips-cfg
# GOOD
request_route {
    if (!mf_process_maxfwd_header("10")) {
        send_reply(483, "Too Many Hops");
        exit;
    }

    if (has_totag()) {
        # Mid-dialog: validate via loose_route(), then relay.
        if (loose_route()) { t_relay(); }
        else { send_reply(404, "Not here"); }
        exit;
    }

    # Initial request: must target a domain we serve.
    if (!is_myself("$rd")) {
        send_reply(403, "Forbidden");
        exit;
    }

    # Authenticate, then relay.
    if (is_method("INVITE|MESSAGE|SUBSCRIBE")) {
        if (!proxy_authorize("$td", "subscriber")) {
            proxy_challenge("$td", "0");
            exit;
        }
        consume_credentials();
    }

    record_route();
    t_relay();
}
```

The structure separates three cases: mid-dialog (use `loose_route()` for dialog-membership check), initial request to a non-served domain (reject), and initial request to a served domain (authenticate, then relay). Every `t_relay()` call is reachable only after the appropriate guard.

**Alternative — `permissions` module-based authorization.** When the deployment uses the `permissions` module for IP-based or URI-based authorization decisions, the structure can use `allow_routing()` as the guard:

```opensips-cfg
loadmodule "permissions.so"
modparam("permissions", "trusted_table", "trusted")

request_route {
    # ... maxfwd, has_totag handling ...

    if (!allow_routing()) {
        send_reply(403, "Forbidden");
        exit;
    }

    # ... auth, record_route, t_relay ...
}
```

`allow_routing()` consults the `trusted` and `address` tables for source-IP or URI-based authorization and returns true on match. The judge will recognize this shape as the `permissions_allow_routing_reachable` FP class and dissent on a structural match against this rule.

# Judge prompt template

```markdown
You are auditing an OpenSIPS configuration for OSIPS-SEC-RELAY-001 (open relay).

The deterministic structural match found this t_relay() invocation without
a preceding is_myself / has_totag / allow_routing guard:

{{evidence_snippet}}

Surrounding cfg context:
{{cfg_context}}

Modules loaded: {{modules_loaded}}

The known false-positive classes for this rule are:

1. permissions_allow_routing_reachable — the permissions module is loaded
   and allow_routing() (or allow_uri / allow_address) gates the t_relay
   site, possibly via a function called immediately before.

2. in_dialog_only_path — the t_relay site is reached only when
   has_totag() is true and loose_route() has validated dialog membership.

3. ipsec_or_outer_authentication — the deployment terminates inbound SIP
   at an IPsec tunnel or other outer authentication boundary, evidenced
   by listen= directives on private interfaces only, comment blocks citing
   the perimeter, or other explicit indicators.

Read the surrounding configuration carefully and answer:

1. Does any of the three FP classes apply to this t_relay invocation?
   Answer "yes" only if you can point to specific evidence in the cfg
   that supports the FP class. If you see "permissions" loaded but
   cannot trace allow_routing() to the t_relay site, answer "cannot_determine"
   rather than "yes".

2. Brief rationale (2-3 sentences) citing the specific lines or constructs
   you weighed.

Output JSON: {"applies": "yes|no|cannot_determine", "rationale": "..."}
```

The prompt is deliberately strict: "yes" requires *traceable* evidence, not pattern-matching on module names. The `cannot_determine` path is the safety valve — better to surface as `judge_dissented` (per `14_DETECTION_ENGINE.md` § "Judgment outcomes") than to confidently confirm or dissent on incomplete reasoning. The 2-3 sentence rationale is bounded to keep the judge's output reviewable.

# References

- `90_reference/01_master_vulnerability_reference.md#open-relay` — internal threat model for SIP open relays, including toll fraud and trust-laundering scenarios.
- `90_reference/02_enable_security_gap_analysis.md#header-construction` — adjacent surface area in the audit cluster.
- OpenSIPS `tm` module documentation: `https://opensips.org/docs/modules/3.5.x/tm.html`.
- OpenSIPS `permissions` module documentation: `https://opensips.org/docs/modules/3.5.x/permissions.html`.
- CWE-441 (Unintended Proxy or Intermediary): `https://cwe.mitre.org/data/definitions/441.html`.

# Test fixtures

```yaml
- type: vulnerable
  path: 50_fixtures/vulnerable/vulnerable-mixed.cfg
  expected_finding_anchor: F6
  notes: |
    The cfg has t_relay() in request_route preceded only by avp_db_query
    and xlog. The permissions module IS loaded (line 15), so the
    structural match alone is insufficient — the semantic phase must
    confirm no allow_routing() reaches the t_relay site. Per the
    expected.json, F6 emits as judge_confirmed (medium confidence)
    rather than deterministic_confirmed.

- type: clean
  path: 50_fixtures/clean/clean-l1-enterprise-pbx.cfg
  notes: |
    The cfg gates t_relay on is_myself("$rd") for initial requests and
    loose_route() for mid-dialog. Structural match does not fire.

- type: tricky
  path: 50_fixtures/tricky/permissions-allow-routing.cfg
  exercises_fp_class: permissions_allow_routing_reachable
  notes: |
    The cfg loads permissions and uses allow_routing() as the guard
    for t_relay. Structural match fires; semantic judge should return
    applies: yes for the permissions_allow_routing_reachable FP class;
    finding becomes judge_dissented and is suppressed.
```

---

## Status note (Chat C v2)

This rule is `status: draft` rather than `stable` despite all lifecycle prerequisites being met. Rationale: the rule, the matching tricky fixture, and the FP class enumeration were all authored by Chat C without independent review. Doc 4 § "Rule lifecycle" requires "peer review by another rule author" for draft → stable promotion. Promote to stable when an external reviewer signs off on the FP class enumeration and the judge prompt's strictness.
