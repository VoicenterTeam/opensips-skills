# rr Module Reference
<!-- generated-from: data/3.6/modules/rr.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 rr module. Read this file when configuring or debugging the rr module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

The module contains record routing logic

## How It Works

OpenSIPS is basically _only_ a transaction statefull proxy, without any dialog support build in. There are many features/services which actually require dialog awareness, like storing the information in the dialog creation stage, information which will be used during the whole dialog existence.

The most urging example is NAT traversal, in dealing with the within the dialog INVITEs (re-INVITEs). When processing the initial INVITE, the proxy detects if the caller or callee is behind some NAT and fixes the signalling and media parts - since not all the detection mechanism are available for within the dialog requests (like usrloc), to be able to fix correspondingly the sequential requests, the proxy must remember that the original request was NAT processed. There are many other cases where dialog awareness fixes or helps.

The solution is to store additional dialog-related information in the routing set (Record-Route/Route headers), headers which show up in all sequential requests. So any information added to the Record-Route header will be found (with no direction dependencies) in Route header (corresponding to the proxy address).

As storage container, the parameters of the Record-Route / Route header will be used - Record-Route parameters mirroring are reinforced by RFC 3261 (see 12.1.1 UAS behavior).

For this purpose, the modules offers the following functions:

*   add\_rr\_param() - see [add\_rr\_param()](#func_add_rr_param "1.5.4.� add_rr_param(param)")
    
*   check\_route\_param() - see [check\_route\_param()](#func_check_route_param "1.5.5.� check_route_param(re)")

**Example�1.1.�Dialog support in RR module**

UAC                       OpenSIPS PROXY                          UAS

---- INVITE ------>       record\_route()          ----- INVITE ---->
                     add\_rr\_param(";foo=true")

--- reINVITE ----->        loose\_route()          ---- reINVITE --->
                    check\_route\_param(";foo=true")

<-- reINVITE ------        loose\_route()          <--- reINVITE ----
                    check\_route\_param(";foo=true")

<------ BYE -------        loose\_route()          <----- BYE -------
                    check\_route\_param(";foo=true")

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `add_username` (integer)

If set to a non 0 value (which means yes), the username part will be also added in the Record-Route URI.

*Default value is 0 (no).*

**Example.** 1.

```opensips
modparam("rr", "add\_username", 1)
```
### `append_fromtag` (integer)

If turned on, request's from-tag is appended to record-route; that's useful for understanding whether subsequent requests (such as BYE) come from caller (route's from-tag==BYE's from-tag) or callee (route's from-tag==BYE's to-tag)

*Default value is 1 (yes).*

**Example.** 0.

```opensips
modparam("rr", "append\_fromtag", 0)
```
### `enable_double_rr` (integer)

There are some situations when the server needs to insert two Record-Route header fields instead of one. For example when using two disconnected networks or doing cross-protocol forwarding from UDP->TCP. This parameter enables inserting of 2 Record-Routes. The server will later remove both of them.

*Default value is 1 (yes).*

**Example.** 0.

```opensips
modparam("rr", "enable\_double\_rr", 0)
```
### `enable_socket_mismatch_warning` (integer)

When a preset record-route header is forced in OpenSIPS config and the host from the record-route header is not the same as the host server, a warning will be printed out in the logs. The 'enable\_socket\_mismatch\_warning' parameter enables or disables the warning. When OpenSIPS is behind a NATed firewall, we don't want this warning to be printed for every bridged call.

*Default value is 1 (yes).*

**Example.** 0.

```opensips
modparam("rr", "enable\_socket\_mismatch\_warning", 0)
```

## Exported Functions

### `add_rr_param(param)`

Adds a parameter to the Record-Route URI (param must be in “;name=value” format. The function may be called also before or after the record_route() call (see record_route()).

**Parameters:**

- `param` *(string, required)* — The URI parameter to be added. It must follow the “;name=value” scheme.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Related:**

- `record_route()`

**Example.** add_rr_param usage.

```opensips
add_rr_param(";nat=yes");
```

### `check_route_param(re)`

The function checks if the URI parameters of the local Route header (corresponding to the local server) matches the given regular expression. It must be call after loose_route() (see loose_route()).

**Parameters:**

- `re` *(string, required)* — Regular expression to check against the Route URI parameters.

**Return codes:**

- `true` — If the URI parameters of the local Route header matches the given regular expression.

**Usable from:** REQUEST_ROUTE

**Related:**

- `loose_route()`

**Example.** check_route_param usage.

```opensips
if (check_route_param("nat=yes")) {
    setflag(6);
}
```

### `is_direction(dir)`

The function checks the flow direction of the request. As for checking it's used the “ftag” Route header parameter, the append_fromtag (see append_fromtag module parameter) must be enabled. Also this must be called only after loose_route() (see loose_route()). The function returns true if the “dir” is the same with the request's flow direction. The “downstream” (UAC to UAS) direction is relative to the initial request that created the dialog.

**Parameters:**

- `dir` *(string, required)* — The direction to be checked. It may be “upstream” (from UAS to UAC) or “downstream” (UAC to UAS).
  - `upstream`
  - `downstream`

**Return codes:**

- `true` — If the “dir” is the same with the request's flow direction.

**Usable from:** REQUEST_ROUTE

**Related:**

- `loose_route()`

**Example.** is_direction usage.

```opensips
if (is_direction("upstream")) {
    xdbg("upstream request ($rm)\\n");
}
```

### `loose_route()`

The function performs routing of SIP requests which contain a route set. The name is a little bit confusing, as this function also routes requests which are in the “strict router” format. This function is usually used to route in-dialog requests (like ACK, BYE, reINVITE). Nevertheless also out-of-dialog requests can have a “pre-loaded route set” and my be routed with loose_route. It also takes care of translating between strict-routers and loose-router. The loose_route() function analyzes the Route headers in the requests. If there is no Route header, the function returns FALSE and routing should be done exclusivly via RURI. If a Route header is found, the function returns TRUE and behaves as described in section 16.12 of RFC 3261. The only exception is for requests with preload Route headers (intial requests, carrying a Route header): if there is only one Route header indicating the local proxy, then the Route header is removed and the function returns FALSE. The function is able to automatically detecting if it deals with a 'strict' or 'loose' routing scenario (the difference is how the SIP path is stored across the RURI and Route hdrs). To make the difference between the two scenarios OpenSIPS has to determine which SIP URI holds its address/domain - the RURI (then it is a strict routing scenario) or the top Route URI (then it is a loose route scenario). In order to check if the SIP URI holds its address/domain, OpenSIPS checks the host URI against the listening IPs/interfaces (as a static component) and the domains listed from the "domain" module/table (as the dynamic component). If there is a Route header but other parsing errors occur ( like parsing the TO header to get the TAG ), the function also returns FALSE. Make sure your loose_routing function can't be used by attackers to bypass proxy authorization. The loose_routing topic is very complex. See the RFC3261 for more details (grep for “route set” is a good starting point in this comprehensive RFC).

**Return codes:**

- `true` — If a Route header is found and behaves as described in RFC 3261.
- `false` — If there is no Route header, if parsing errors occur, or if there is only one Route header indicating the local proxy (preload scenario).

**Usable from:** REQUEST_ROUTE

**Example.** loose_route usage.

```opensips
loose_route();
```

### `record_route([string])`

The function adds a new Record-Route header field. The header field will be inserted in the message before any other Record-Route header fields. If any string is passed as parameter, it will be appended as URI parameter to the Record-Route header. The string must follow the “;name=value” scheme.

**Parameters:**

- `string` *(string, optional)* — If any string is passed as parameter, it will be appended as URI parameter to the Record-Route header. The string must follow the “;name=value” scheme.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** record_route usage.

```opensips
record_route();
```

### `record_route_preset(string [, string2])`

This function will put the string into Record-Route, don't use unless you know what you are doing. Meaning of the parameters is as follows: *string* - String to be inserted into the first header field; it may contain pseudo-variables. *string2* (optional) - String to be inserted into the second header field. Note: If 'string2' is present, then the 'string' param is pointing to the outbound interface and the 'string2' param is pointing to the inbound interface.

**Parameters:**

- `string` *(string, required)* — String to be inserted into the first header field; it may contain pseudo-variables.
- `string2` *(string, optional)* — String to be inserted into the second header field. Note: If 'string2' is present, then the 'string' param is pointing to the outbound interface and the 'string2' param is pointing to the inbound interface.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** record_route_preset usage.

```opensips
record_route_preset("1.2.3.4:5090");
```

## Exported Pseudo-Variables

### `$rr_params`

the whole string of the Route parameters - this is available only after calling loose_route()

- **Type:** string
- **Read/write:** read-only
- **Scope:** request

## Configuration Examples

### Example 2.1. Loading RR module's API from another module

Loading RR module's API from another module

```opensips
...
#include "../rr/api.h"
...
struct rr\_binds my\_rrb;
...
...
/* load the RR API */
if (load\_rr\_api( &my\_rrb )!=0) {
    LM\_ERR("can't load RR API\\n");
    goto error;
}
...
...
/* register a RR callback */
if (my\_rrb.register\_rrcb(my\_callback,0,0))!=0) {
    LM\_ERR("can't register RR callback\\n");
    goto error;
}
...
```
