# SER Lineage Notes

<!-- generator-version: hand-authored
     opensips-version: 4.0
     doc-type: ser_lineage_notes -->

This file documents the constraints for using OpenSIPs identifiers correctly when working with version 4.0. Read this file when authoring or reviewing any OpenSIPs configuration, and especially when handling content that uses identifiers from other projects in the SIP Express Router (SER) lineage.

## Why this file exists

OpenSIPs is one of several projects that descend from the SIP Express Router. The projects share an architectural ancestry, and many concepts (transactions, dialogs, registrar logic, the AVP system, the `request_route` construct) are recognizable across them. The configuration syntax, however, has diverged substantially. Function names, parameter names, pseudo-variable conventions, and module exports differ between projects, despite surface similarities. Code that "looks right" because it follows a familiar pattern from a sibling project may parse cleanly in OpenSIPs and fail at runtime — or worse, succeed silently while doing the wrong thing.

This is the only place in the OpenSIPs Skills plugin where the SIP Express Router lineage is named explicitly. Per [ADR-008](../../../../../../docs/architecture/adr/008-ser-lineage-neutral-framing.md), every other authoring surface in this plugin uses the generic phrasing "sibling SER-lineage project" without identifying which sibling.

## The operational rule

When authoring or reviewing an OpenSIPs 4.0 configuration, use only identifiers present in the version 4.0 reference set:

- **Functions and parameters:** see `references/4.0/modules/MODULE.md` for module exports and `references/4.0/core/functions.md` for core script functions.
- **Pseudo-variables:** see `references/4.0/core/variables.md` for core PVs and per-module pseudo-variable sections inside each `references/4.0/modules/MODULE.md` file.
- **Statements, operators, transformations, route blocks, flags:** see the corresponding `references/4.0/core/*.md` files.
- **MI commands:** see `references/4.0/core/mi-commands.md` for core MI and per-module MI sections.
- **Statistics, events:** see `references/4.0/core/statistics.md` and `references/4.0/core/events.md`, plus per-module sections.

Identifiers absent from this reference set are one of three things: a typo, a version mismatch (an identifier introduced or removed in a different OpenSIPs release), or an import from a sibling project. None of those is correct OpenSIPs 4.0 code. Do not use them. If a user pastes content containing such identifiers, ask the user for clarification before proceeding — never attempt to "translate" it silently.

## Common confusions

The following patterns appear when content originating from sibling SER-lineage projects is mistaken for OpenSIPs syntax. Each shows the sibling-project pattern (Bad) and the OpenSIPs equivalent (Good). The Good pattern is what to write in OpenSIPs 4.0.

### Pseudo-variable access functions

Bad — sibling-project pattern:

```text
$var(auth) = pv_get_authattr();
if (pv_get_authattr() == "...") { ... }
```

Good — OpenSIPs:

```opensips
$var(auth) = $authattr;
if ($authattr == "...") { ... }
```

OpenSIPs accesses pseudo-variables via direct read of the variable name itself. There is no `pv_get_*` function family — the `$name` token is the access mechanism, evaluated in place wherever a value is expected. This applies uniformly across `$var(...)`, `$avp(...)`, `$pv(...)`, `$ru`, `$rd`, `$au`, `$ar`, `$authattr`, and every other pseudo-variable. For the full pseudo-variable list, read `references/4.0/core/variables.md` and the Exported Pseudo-Variables section in each per-module reference.

### Module loading directive form

Bad — sibling-project pattern:

```text
loadmodule("tm.so")
modparam("tm", "fr_timer", 30)
```

Good — OpenSIPs:

```opensips
loadmodule "tm.so"
modparam("tm", "fr_timeout", 30)
```

OpenSIPs uses the bare directive form `loadmodule "name.so"` (no parentheses, no semicolon at the end of the directive in older script style). Parameter names also differ from sibling projects: the transaction module's first-response timer is `fr_timeout` in OpenSIPs, not `fr_timer`. Always check the per-module reference (`references/4.0/modules/tm.md` for this example) for the exact parameter name, type, and default value before writing a `modparam` line.

### Route invocation conventions

Bad — sibling-project pattern:

```text
route(SOMEROUTE);
```

Good — OpenSIPs:

```opensips
route("SOMEROUTE");
```

OpenSIPs route names are quoted strings passed to `route()`. Sibling projects sometimes accept bareword route names; OpenSIPs does not. The same rule holds for `branch_route`, `failure_route`, `onreply_route`, and `local_route` invocations — when the route is referenced by name, the name is a quoted string. For the canonical list of route block types and how each is invoked, read `references/4.0/core/routes.md`.

### Registrar save signature

Bad — sibling-project pattern:

```text
save("location", "0x04");
```

Good — OpenSIPs:

```opensips
save("location", "mc");
```

The OpenSIPs `save()` function in the `registrar` module takes a flag string built from named single-letter flags (e.g. `m` for memory-only, `c` for callid match), not a hexadecimal bitmask. Sibling projects historically used numeric or hex flag arguments for the same conceptual operation, and that syntax leaks into prompts. Read `references/4.0/modules/registrar.md` for the exact flag set, accepted argument forms, and ordering conventions before writing any `save()`, `lookup()`, `is_registered()`, or `add_sock_hdr()` call.

### Dispatcher algorithm and flag values

Bad — sibling-project pattern:

```text
ds_select_dst("1", "4");        # numeric algorithm
ds_select_domain("1", "4", "X"); # extra positional flag
```

Good — OpenSIPs:

```opensips
ds_select_dst("1", "4");
$var(rc) = ds_select_dst("1", "4");
```

The numeric algorithm value (here `4` for round-robin) is shared across sibling SER-lineage projects, but the *signature* of `ds_select_dst` and `ds_select_domain` differs. OpenSIPs' dispatcher exposes its options through a fourth parameter built from named flag characters, not a separate positional argument, and the function's return value is the integer Boolean used in OpenSIPs scripting. Algorithm enumerations, flag-character definitions, and partition-handling syntax all live in `references/4.0/modules/dispatcher.md` — read it before authoring any dispatcher call.

### Accounting setup

Bad — sibling-project pattern:

```text
modparam("acc", "log_flag", "INT(1)")
modparam("acc", "log_missed_flag", "INT(2)")
setflag(1);
setflag(2);
```

Good — OpenSIPs:

```opensips
modparam("acc", "log_flag", "accounting")
modparam("acc", "log_missed_flag", "missed_accounting")
modparam("acc", "log_extra", "from=$fu;to=$tu;callid=$ci")
setflag(accounting);
setflag(missed_accounting);
```

OpenSIPs accounting binds to *named flags* declared via `modparam("acc", ...)` rather than numeric flag indices. The `setflag` and `resetflag` script functions take the named flag identifier directly. Numeric flag arguments in `modparam` strings are a sibling-project pattern. The full set of `acc` parameters, the flag-naming conventions, and the supported back-ends (log, database, RADIUS, Diameter via `aaa_*`) are documented in `references/4.0/modules/acc.md`.

## When in doubt

Ask the user. The cost of a one-turn clarification is small; the cost of shipping a configuration that mixes idioms across projects is large because the failure mode is silent — the file parses, the daemon starts, and the wrong behavior surfaces only under specific runtime conditions (a particular SIP method, a particular branch, a particular failure path).

If the user pasted code from a tutorial, blog post, or other source, ask which project the source was for. Translate explicitly when needed and show the OpenSIPs 4.0 equivalent against the per-module and core reference files; never silently rewrite identifiers and never claim a translation worked without checking the references. The clarification adds one turn; the silent rewrite hides the divergence and may misrepresent OpenSIPs 4.0's actual behavior in a way the user only discovers under load.
