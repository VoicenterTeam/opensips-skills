---
name: opensips-routing
description: |-
  Authors and edits OpenSIPs SIP server configuration scripts (opensips.cfg, route blocks, modules, parameters). Use whenever the user mentions OpenSIPs, opensips.cfg, route{}/branch_route/failure_route, $var/$avp/$pv pseudo-variables, or asks to write/edit SIP routing logic for OpenSIPs. Do NOT use for sibling SIP Express Router (SER)-lineage projects — those use different identifiers despite shared lineage.
allowed-tools: Read, Write, Edit, Glob, Grep
---

## Overview

This skill authors and edits OpenSIPs SIP server configuration scripts — `opensips.cfg`, route blocks, module loading, parameter setup, and the procedural decisions that turn a routing intent into a valid config. It is one of three coordinated skills for working with OpenSIPs in Claude Code. When the user asks about a specific module's functions, parameters, or pseudo-variables, the `opensips-modules` skill is the authoritative source for per-module reference data; consult it before answering. When the user asks for a security review, audit, or hardening check, the `opensips-security-advisor` skill provides the review workflow. The three skills are designed to be loaded together; do not duplicate their work.

## Cross-project guardrail

**CRITICAL: Use only OpenSIPs identifiers.** OpenSIPs descended from the SIP Express Router (SER) and shares a code lineage with sibling SER-lineage projects. Function names, module names, parameter names, and pseudo-variable syntax differ between projects despite surface similarity. Mixing identifiers across projects produces configs that look correct but fail at runtime in subtle ways — the parser may accept the surface form and the failure surfaces only under load.

Common confusions in routing context:

- The `pv_get_*` / `pv_set_*` function family is a sibling-project pattern. OpenSIPs uses pseudo-variable syntax directly — `$var(name)`, `$avp(name)`, `$pv(name)`, `$ru`, `$rU`, `$fu`, `$tu`, `$ci`, `$rb`, `$authattr`. Read `references/{version}/core/variables.md` for the authoritative pseudo-variable list before using one.
- Module names that look plausible but are not part of OpenSIPs. Modules in OpenSIPs are loaded with `loadmodule "name.so"` and configured with `modparam("name", "param", value)`. If a module name does not appear in `references/{version}/modules/`, it is either a typo, a sibling-project module, or a module that does not exist in this version.
- Function signatures that share a name across projects but differ in arity or argument order. Always consult `references/{version}/modules/<module>.md` for the exact signature; do not infer arguments from training-data priors.

If you recognize an identifier from your training data but cannot find it in this skill's reference set, assume it is from a sibling project and ask the user. Do not construct identifiers from your priors. The positive reference set under `references/{version}/` is the authoritative ground truth for this skill.

## When to use this skill

This skill should be the active one when:

- The user mentions OpenSIPs, `opensips.cfg`, or asks to author or edit a SIP routing script for OpenSIPs.
- The user names a route block type: `request_route`, `branch_route`, `failure_route`, `onreply_route`, `local_route`, `error_route`, `event_route`, `startup_route`, `timer_route`.
- The user asks about pseudo-variable usage (`$var`, `$avp`, `$pv`, `$ru`, `$fu`, `$tu`, `$ci`, etc.), transformations, statements, operators, flags, or core script syntax.
- The user describes a routing concern: registrar handling, stateful proxying, NAT traversal, dispatcher load balancing, digest authentication, dialog tracking, accounting, or header inspection.
- The user pastes an `opensips.cfg` fragment and asks for review, refactor, or extension.

This skill should defer to `opensips-modules` when:

- The user asks "what does function X do?" or "what parameters does module Y export?" or "show me the signature of Z".
- The user names a specific module and wants its full exported surface (functions, parameters, pseudo-variables, dependencies).
- The user asks which module provides a given capability, requiring a catalog scan.

This skill should defer to `opensips-security-advisor` when:

- The user explicitly requests a security review, audit, or hardening check.
- The user mentions specific risks: INVITE flooding, registration hijacking, toll fraud, SIP scanning, spoofed REGISTER, RTP relay exposure.
- The user asks "is this config safe?" or "what could go wrong with this?".

## Routing decisions

The following table maps common authoring tasks to the right approach and the reference files that ground the answer. Read the cited reference before producing code.

| Task | Approach | Reference |
|---|---|---|
| Author a basic registrar | Load `registrar` and an auth backend (`auth_db`, `auth`). In `request_route`, dispatch on `REGISTER` method; authenticate with `www_authorize`; on success, call `save("location")`. | `references/{version}/modules/registrar.md`, `references/{version}/modules/auth_db.md`, `references/{version}/core/routes.md` |
| Stateful proxy | Load `tm`. Pre-route, then call `t_relay()` to forward statefully. Configure `failure_route` for retry/fallback handling. | `references/{version}/modules/tm.md`, `references/{version}/core/routes.md` |
| NAT traversal | Load `nathelper` (and a media-relay module if needed). Apply `fix_nated_contact()` / `fix_nated_register()` on inbound requests; mark NAT'd dialogs with a flag. | `references/{version}/modules/nathelper.md`, `references/{version}/core/flags.md` |
| Digest authentication | Load `auth` plus a backend (`auth_db`, `auth_aaa`, etc.). Use `www_authorize` for `REGISTER`; `proxy_authorize` for `INVITE` and other non-REGISTER requests. | `references/{version}/modules/auth.md`, `references/{version}/modules/auth_db.md` |
| Dispatcher load balancing | Load `dispatcher`. Use `ds_select_dst()` (or `ds_select_domain()`) with the algorithm flag and set ID. Configure health probing parameters. | `references/{version}/modules/dispatcher.md` |
| Dynamic routing | Load `drouting`. Use `do_routing()` against a configured rule set; combine with `tm` for stateful relay. | `references/{version}/modules/drouting.md` |
| Dialog tracking | Load `dialog`. Call `create_dialog()` early in `request_route`; use dialog-scoped variables (`$dlg_val`) for cross-request state. | `references/{version}/modules/dialog.md`, `references/{version}/core/variables.md` |
| Accounting | Load `acc` plus a backend (`acc_db`, `acc_radius`, `acc_diameter`). Set the appropriate accounting flag; `acc` hooks into `tm` for transaction-bound recording. | `references/{version}/modules/acc.md`, `references/{version}/core/flags.md` |
| Pseudo-variable lookup | Read the variable's type, read/write availability, scope, and route-block availability before using. | `references/{version}/core/variables.md` |
| Header manipulation | Use `textops` / `textopsx` (`append_hf`, `remove_hf`, `subst`). Choose the function that matches whether you need a single match or all occurrences. | `references/{version}/modules/textops.md`, `references/{version}/modules/textopsx.md` |
| Loose record routing | Load `rr`. Call `record_route()` on initial requests; `loose_route()` early on in-dialog requests. | `references/{version}/modules/rr.md` |
| User location lookup | Load `usrloc` (loaded transitively by `registrar`). Use `lookup("location")` against the saved AOR before relaying to a user. | `references/{version}/modules/usrloc.md`, `references/{version}/modules/registrar.md` |

When a routing task is not in this table, identify the OpenSIPs module that owns the capability, read its reference file, then return here for the route-flow guidance.

## Common tasks

### Authoring a registrar

The goal is to accept `REGISTER` requests, authenticate them against a credential store, and persist the contact-to-AOR binding so subsequent calls can be located. The minimum module set is `registrar` plus an auth backend (`auth` and `auth_db` for database-backed credentials). Read `references/{version}/modules/registrar.md` for the `save`/`lookup`/`registered` signatures and `references/{version}/modules/auth_db.md` for `www_authorize` semantics.

The flow inside `request_route` is: detect `REGISTER`, call `www_authorize` with the realm and the credentials table, branch on the result, and on success call `save("location")`. The auth backend exposes credential attributes via pseudo-variables (`$authattr`, `$au`, `$ar`) — read them directly, do not call accessor functions.

**Bad — sibling-project pattern:**

```
if (is_method("REGISTER")) {
    if (!www_authenticate("$fd", "subscriber")) {
        www_challenge("$fd", "0");
        exit;
    }
    $var(user) = pv_get_authattr("username");
    save("location");
}
```

**Good — OpenSIPs:**

```
if (is_method("REGISTER")) {
    if (!www_authorize("", "subscriber")) {
        www_challenge("", "0");
        exit;
    }
    $var(user) = $authattr;
    if (!save("location")) {
        sl_reply_error();
    }
    exit;
}
```

The OpenSIPs form uses `www_authorize` (not `www_authenticate`), reads the authenticated user via the `$authattr` pseudo-variable directly (no `pv_get_*` accessor), and pairs `save` with an explicit error reply on failure. The realm argument is an empty string when the From URI's domain should be used as the realm; consult `references/{version}/modules/auth.md` for the full argument grammar.

### Authoring a stateful proxy

The goal is to forward a request statefully so that retransmissions, branches, and failure responses are handled by the transaction layer. Load `tm`; do all pre-routing work (auth, header rewrites, lookups) before calling `t_relay()`; reserve `failure_route[N]` for retry, fallback, or final-response handling. Read `references/{version}/modules/tm.md` and `references/{version}/core/routes.md`.

A `failure_route` runs when the upstream returns a negative final response that did not stop the transaction — typical uses are voicemail fallback on 408/486 or alternate-route selection after a timeout. Use `t_check_status()` to inspect the response code, then either `append_branch()` plus `t_relay()` to fork to a new destination or `t_reply()` to return a fixed final response. Within `failure_route`, the original request is still available; modify `$ru` (Request-URI) before re-relaying.

**Bad — sibling-project pattern:**

```
loadmodule "tm.so"
modparam("tm", "fr_timer", 30000)
modparam("tm", "fr_inv_timer", 90)

route {
    t_on_failure("voicemail");
    t_relay_to_udp("10.0.0.1", "5060");
}
failure_route[voicemail] {
    if (t_check_status("486|408")) {
        $ru = "sip:vm@voicemail.example.com";
        t_relay_to_udp("10.0.0.2", "5060");
    }
}
```

**Good — OpenSIPs:**

```
loadmodule "tm.so"
modparam("tm", "fr_timeout", 30)
modparam("tm", "fr_inv_timeout", 90)

route {
    t_on_failure("voicemail");
    if (!t_relay()) {
        sl_reply_error();
    }
    exit;
}

failure_route[voicemail] {
    if (t_check_status("486|408")) {
        $ru = "sip:vm@voicemail.example.com";
        t_relay();
    }
}
```

The OpenSIPs form uses `t_relay()` (the transport-agnostic stateful relay; the destination is taken from `$ru`/`$du`), uses the seconds-based `fr_timeout`/`fr_inv_timeout` parameter names, and pairs the relay with an `sl_reply_error()` on failure. Failure-route names are bare identifiers, not quoted strings. Consult `references/{version}/modules/tm.md` for the exact list of timeout parameters and `t_*` functions available in this version.

### Adding NAT traversal

The goal is to make calls work when one or both endpoints are behind NAT. The signaling-side fix is `nathelper`'s `fix_nated_contact()` (rewrite Contact to the source IP/port), `fix_nated_register()` (rewrite the location-binding source), and `force_rport()` / `fix_nated_sdp()` for the corresponding response and SDP rewrites. The media-side fix requires a relay module (`rtpproxy`, `rtpengine`) that this skill does not cover in depth — read its module reference for media setup. Read `references/{version}/modules/nathelper.md` and `references/{version}/core/flags.md`.

The decision of when to apply NAT traversal: detect NAT'd peers via `nat_uac_test()` early in `request_route`, set a flag (e.g., `setflag(NAT_FLAG)`), and use the flag in subsequent decisions (Contact rewrite on REGISTER, RTP relay engagement on INVITE, branch-route NAT handling on forks). Do not rewrite contacts unconditionally — internal endpoints will be broken by it.

**Bad — sibling-project pattern:**

```
if (nat_uac_test("19")) {
    setflag(5);
    fix_contact();
    if (is_method("REGISTER")) {
        fix_nated_register();
    }
}
```

**Good — OpenSIPs:**

```
if (nat_uac_test("19")) {
    setflag(NAT_FLAG);
    if (is_method("REGISTER")) {
        fix_nated_register();
    } else {
        fix_nated_contact();
    }
}
```

The OpenSIPs form uses `fix_nated_contact()` (not the bare `fix_contact()` of sibling projects), branches on REGISTER vs non-REGISTER because the appropriate Contact rewrite differs, and uses a named flag declared with `flags` rather than a magic numeric index. Read `references/{version}/core/flags.md` for the `flags` declaration syntax that turns numeric flags into named identifiers.

### Configuring authentication

The goal is to challenge requests with HTTP Digest, validate the response against a credential backend, and gate routing on success. Load `auth` for the protocol logic and a backend module (`auth_db` for SQL, `auth_aaa` for RADIUS, `auth_diameter` for Diameter). Use `www_authorize` for `REGISTER` (the registrar is the one challenging), and `proxy_authorize` for non-REGISTER requests (the proxy is the one challenging). Read `references/{version}/modules/auth.md` and `references/{version}/modules/auth_db.md`.

The challenge flow is: call `www_authorize` (or `proxy_authorize`) with the realm and credentials table; on a negative result, call `www_challenge` (or `proxy_challenge`) to send the 401 (or 407) with a fresh nonce; on a positive result, the request continues with `$authattr` and related pseudo-variables populated. The realm argument controls the `realm=` parameter in the WWW-Authenticate header — empty string defers to the From URI's domain.

**Bad — sibling-project pattern:**

```
loadmodule "auth_db.so"
modparam("auth_db", "db_url", "mysql://opensips:pw@localhost/opensips")
modparam("auth_db", "load_credentials", "rpid")
modparam("auth_db", "calculate_ha1", yes)

route {
    if (!www_authenticate("$fd", "subscriber", "1")) {
        www_challenge("$fd", "1");
        exit;
    }
}
```

**Good — OpenSIPs:**

```
loadmodule "auth.so"
loadmodule "auth_db.so"
modparam("auth_db", "db_url", "mysql://opensips:pw@localhost/opensips")
modparam("auth_db", "load_credentials", "rpid")
modparam("auth_db", "calculate_ha1", 1)

route {
    if (!www_authorize("", "subscriber")) {
        www_challenge("", "auth");
        exit;
    }
}
```

The OpenSIPs form loads `auth` explicitly (it is the protocol module that `auth_db` depends on; both must be loaded), uses `www_authorize` (the OpenSIPs name for the digest-validation function), uses an integer literal for boolean modparams (`1` not `yes`), and supplies the qop value as the second argument to `www_challenge` (`"auth"`, not a numeric flag). Confirm the exact argument grammar against `references/{version}/modules/auth_db.md` for this version — modparam types are version-specific.

### Configuring dispatcher load balancing

The goal is to distribute traffic across a pool of upstream destinations using a chosen algorithm with optional health probing. Load `dispatcher`; configure the destination set in the database or flat file; in `request_route`, call `ds_select_dst()` (or `ds_select_domain()`) with the set ID and an algorithm code; relay statefully via `tm`. Read `references/{version}/modules/dispatcher.md`.

Algorithm selection matters. The codes (round-robin, hash by Call-ID, hash by From URI, weight-based, etc.) are integer constants documented in the dispatcher reference; pick the one whose distribution property fits the workload. Health probing requires `ds_probing_mode` and `ds_ping_method` modparams plus an `event_route[E_DISPATCHER_STATUS]` (when defined for this version) to react to up/down transitions.

**Bad — sibling-project pattern:**

```
loadmodule "dispatcher.so"
modparam("dispatcher", "list_file", "/etc/opensips/dispatcher.list")
modparam("dispatcher", "dst_avp", "$avp(dst)")
modparam("dispatcher", "grp_avp", "$avp(grp)")

route {
    if (!ds_select_dst("1", "4")) {
        sl_send_reply("503", "No destinations");
        exit;
    }
    t_relay();
}
```

**Good — OpenSIPs:**

```
loadmodule "dispatcher.so"
modparam("dispatcher", "partition", "default: file=/etc/opensips/dispatcher.list")
modparam("dispatcher", "ds_ping_method", "OPTIONS")
modparam("dispatcher", "ds_probing_mode", 1)

route {
    if (!ds_select_dst(1, 4)) {
        sl_send_reply(503, "No destinations available");
        exit;
    }
    if (!t_relay()) {
        sl_reply_error();
    }
    exit;
}
```

The OpenSIPs form uses the `partition` modparam (the current configuration entry point in OpenSIPs `dispatcher`; the older flat-list parameters are deprecated and may not exist in this version), passes integer literals to `ds_select_dst` rather than string-quoted numbers, and gives the SL reply an integer status code. Read `references/{version}/modules/dispatcher.md` to confirm whether `partition` or another parameter is the correct entry point for this version, and to see the algorithm code list.

## References

This skill consults the following reference files. Use `{version}` literal — Claude resolves the active version at read time per the version-resolution protocol.

- Read `references/{version}/core/variables.md` when needing pseudo-variable details (type, R/W, scope, available-in route blocks).
- Read `references/{version}/core/functions.md` when needing core script function signatures (those not provided by a module).
- Read `references/{version}/core/routes.md` when needing route block semantics (which blocks exist, when they fire, what is in scope).
- Read `references/{version}/core/operators.md` and `references/{version}/core/statements.md` for syntax details (comparison, arithmetic, control flow).
- Read `references/{version}/core/transformations.md` when manipulating string, list, or URI values via the `{transformation}` syntax.
- Read `references/{version}/core/flags.md` when using `setflag` / `resetflag` / `isflagset` and named flag declarations.
- Read `references/{version}/core/parameters.md` when setting global core parameters (listen sockets, timer values, log level).
- Read `references/{version}/core/async.md` when authoring asynchronous logic with `async{...}` or `launch{...}`.
- Read `references/{version}/core/events.md` when registering for or raising events.
- Read `references/{version}/core/mi-commands.md` when interacting with the management interface from script.
- Read `references/{version}/core/statistics.md` when defining or reading statistics.
- Read `references/{version}/modules/<module>.md` for per-module functions, exported parameters, pseudo-variables, and dependencies. The `opensips-modules` skill is the authoritative source for module-level reference; consult it when the user names a specific module.
- Read `references/{version}/guides/installation.md`, `references/{version}/guides/configuration.md`, and `references/{version}/guides/syntax.md` when present, for foundational orientation on installation layout, configuration discovery, and config-file syntax basics.
- Read `references/{version}/ser-lineage-notes.md` whenever any input contains identifiers that look unfamiliar. It is the primary anti-hallucination guardrail for this skill — read it on first use of the skill in any session that involves unfamiliar identifiers.

## Working with sibling skills

This skill is one of three coordinated skills:

- `opensips-routing` — authoring SIP routing logic for OpenSIPs (this skill).
- `opensips-modules` — authoritative per-module reference data.
- `opensips-security-advisor` — security review of OpenSIPs configurations.

The skills are designed to load together. When a user prompt spans multiple concerns — for example, "write a registrar that's safe against spoofed REGISTERs" — multiple skills will activate. Each skill stays within its own domain and defers to siblings for theirs. Read `opensips-modules`'s reference files for any per-module question; defer to `opensips-security-advisor` for any explicit security review request. Do not duplicate sibling-skill content here.
