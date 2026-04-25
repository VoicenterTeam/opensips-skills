# opensips.cfg — file structure and authoring workflow

This reference teaches the opensips.cfg file as an artifact: section order, the rules that constrain it, the route block taxonomy, and the procedural workflows for reading and authoring. It does not duplicate the per-construct references — for pseudo-variable details see `core/variables.md`, for route block semantics see `core/routes.md`, for module-level data see `modules/<slug>.md`.

## Canonical section order

An opensips.cfg has the following top-level sections, in this order:

1. **Global parameters.** Listen sockets, log level, worker counts, timer defaults. See `core/parameters.md` for the full set.
2. **`#!define` macros.** Optional. Compile-time symbol definitions used elsewhere in the file.
3. **`mpath` and `loadmodule`.** `mpath` (one entry; sets the search path for module shared libraries) precedes the `loadmodule` directives that depend on it. `loadmodule "X.so"` lines load each module by filename.
4. **`modparam` calls.** Each `modparam("X", "param", value)` configures a parameter exported by module `X`. `modparam` for `X` MUST come after `loadmodule "X.so"` — the module must be loaded before its parameters can be set.
5. **Route blocks.** `route`, `request_route`, `branch_route`, `failure_route`, `onreply_route`, `local_route`, `error_route`, `event_route`, `startup_route`, `timer_route`. The route blocks are where the runtime SIP-message logic lives.

## Annotated skeleton

```
####### Global Parameters #########
log_level = 3
udp_workers = 4
listen = udp:0.0.0.0:5060

####### Modules Section #########
mpath = "/usr/lib/opensips/modules/"

loadmodule "signaling.so"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "rr.so"
loadmodule "maxfwd.so"
loadmodule "registrar.so"
loadmodule "usrloc.so"
loadmodule "auth.so"
loadmodule "auth_db.so"

modparam("usrloc", "nat_bflag", "NAT")
modparam("registrar", "tcp_persistent_flag", "TCP_PERSISTENT")
modparam("auth_db", "db_url", "mysql://opensips:pw@localhost/opensips")

####### Routing Logic #########
route {
    if (!mf_process_maxfwd_header("10")) {
        sl_send_reply(483, "Too Many Hops");
        exit;
    }

    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        save("location");
        exit;
    }

    if (!t_relay()) {
        sl_reply_error();
    }
    exit;
}

failure_route[gw_failover] {
    if (t_check_status("486|408")) {
        $ru = "sip:vm@voicemail.example.com";
        t_relay();
    }
}
```

## Hard ordering rules

- `modparam("X", ...)` MUST follow `loadmodule "X.so"` for the same X. The opposite order is a load-time error.
- `mpath` MUST precede the loadmodules that resolve through it. A `loadmodule` before its required `mpath` will fail to find the shared library.
- Some global parameters (notably `listen`, `tcp_workers`, `udp_workers`, transport-protocol settings) MUST appear before the module section. The runtime initialises listening sockets and worker pools as a discrete startup phase before module load.
- Route block bodies may reference functions, pseudo-variables, and statistics exported by ANY loaded module — but only after the module has been loaded. A function call in a route block that references an unloaded module is a parse error.
- `flags` declarations and `branch_flags` declarations (when present) belong with the global parameters section. Numeric flag indices used in `setflag`/`isflagset` resolve through these declarations.

## Route block taxonomy

The route block types and when each fires:

- **`route`** — the main routing block (no name). Fires on every request that enters via the network.
- **`request_route`** — synonym for `route` in modern OpenSIPs versions.
- **`branch_route[<name>]`** — fires per branch when a request is forked (typically by `tm`).
- **`failure_route[<name>]`** — fires when a transaction receives a negative final response (4xx/5xx/6xx) that did not stop the transaction. Used for fallback routing.
- **`onreply_route[<name>]`** — fires for incoming replies. Used to inspect or modify provisional and final responses.
- **`local_route`** — fires for requests that the proxy generates internally (not routed from the network).
- **`error_route`** — fires when a parsing or routing error occurs.
- **`event_route[<event>]`** — fires when the named event is raised. The event name follows the module-defined event taxonomy; see `core/events.md`.
- **`startup_route`** — fires once at proxy startup, before any traffic is processed.
- **`timer_route[<name>,<interval>]`** — fires periodically at the named interval.

For full per-block detail (which pseudo-variables are in scope, what return codes mean, what modifications are allowed) see `core/routes.md`.

## Reading-mode workflow

When reading an existing opensips.cfg to understand it or answer a question about it:

1. Identify section boundaries: globals → loadmodules → modparams → route blocks.
2. Enumerate every `loadmodule "X.so"`. This is the module set the file uses.
3. Read `consolidated.json` for the active version. Use it to confirm every loaded module exists in the version's reference set; flag any module not present (typo, version drift, or sibling-project import).
4. For any user question that depends on a specific module's behaviour, Read `modules/<slug>.md` for that module.
5. For any user question that depends on a core construct (pseudo-variable, route block, transformation, flag, operator, statement, async, event, MI command, statistic, global parameter), Read the matching `core/<topic>.md`.

## Authoring-mode workflow

When generating a new opensips.cfg from a user's described intent:

1. Enumerate the capabilities the user needs (registrar? stateful proxy? NAT traversal? authentication? dispatcher LB? dialog tracking? accounting? media relay?).
2. Derive the minimal module set from the capability list. Cross-check `consolidated.json`'s `relationships.moduleDependencies` to ensure transitive dependencies are loaded.
3. Read each module's `modules/<slug>.md` to confirm exact function signatures, parameter types, and route-block-availability rules before emitting calls.
4. Emit sections in canonical order (globals → `#!define` → mpath/loadmodule → modparam → route blocks).
5. Validate the route flow against the call flow: registrar handles REGISTER, proxying handles INVITE/BYE/CANCEL, branches and failure routes are wired correctly to `tm`.

## Common gotchas

- **Forward references.** Route blocks may reference functions or pseudo-variables exported by modules loaded later in the file. The parser may accept this and fail at startup, OR may silently load a stale binding. Order loadmodules before any route block uses their exports.
- **modparam ordering.** A `modparam` call before its `loadmodule` is a parse error, but a typo in the module name produces silent no-effect — the modparam call binds to nothing.
- **Double-loaded modules.** Loading the same `.so` twice is a startup error. Loading a module under two different paths (different `mpath` blocks) can produce two distinct module instances with separate state.
- **Empty route fallthrough.** A route block that ends without an explicit `exit` or `t_relay` falls through silently. The behaviour depends on the route type; see `core/routes.md`.
- **Numeric flag indices vs named flags.** `setflag(5)` (numeric) is fragile; `setflag(NAT_FLAG)` (named, declared via `flags`) is recommended. The two are interchangeable at the parser level but the named form is robust against re-numbering.
- **Realm argument to www_authorize/www_challenge.** Empty string defers to the From URI's domain. A non-empty string sets the realm explicitly. Sibling-project conventions that pass `$fd` or `"$fd"` are not OpenSIPs idioms.
