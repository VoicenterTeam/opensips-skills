# path Module Reference
<!-- generated-from: data/3.5/modules/path.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 path module. Read this file when configuring or debugging the path module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is designed to be used at intermediate sip proxies like loadbalancers in front of registrars and proxies. It provides functions for inserting a Path header including a parameter for passing forward the received-URI of a registration to the next hop. It also provides a mechanism for evaluating this parameter in subsequent requests and to set the destination URI according to it.

## How It Works

For registrations in a scenario like “[UAC] -> [P1] -> [REG]”, the "path" module can be used at the intermediate proxy P1 to insert a Path header into the message before forwarding it to the registrar REG. Two functions can be used to achieve this:

* _add_path(...)_ adds a Path header in the form of “Path: <sip:1.2.3.4;lr>” to the message using the address of the outgoing interface. A port is only added if it's not the default port 5060.
    
    If a username is passed to the function, it is also included in the Path URI, like “Path: <sip:username@1.2.3.4;lr>”.
    
* _add_path_received(...)_ also add a Path header in the same form as above, but also adds a parameter indicating the received-URI of the message, like “Path: <sip:1.2.3.4;received=sip:2.3.4.5:1234;lr>”. This is especially useful if the proxy does NAT detection and wants to pass the NAT'ed address to the registrar.
    
    If the function is called with a username, it's included in the Path URI too.
    
If the NAT'ed address of an UAC is passed to the registrar, the registrar routes back subsequent requests using the Path header of the registration as Route header of the current request. If the intermediate proxy had inserted a Path header including the “received” parameter during the registration, this parameter will show up in the Route header of the new request as well, allowing the intermediate proxy to route to this address instead of the one propagated in the Route URI for tunneling through NAT. This behaviour can be activated by setting the module parameter “use_received”.

## Dependencies

### OpenSIPs Modules

- `rr` — needed for outbound routing according to the “received” parameter

### External Libraries

None.

## Exported Parameters

### `enable_double_path` (integer)

There are some situations when the server needs to insert two Path header fields instead of one. For example when using two disconnected networks or doing cross-protocol forwarding from UDP->TCP. This parameter enables inserting of 2 Paths.

*Default value is 1 (yes).*

**Example.** 0.

```opensips
...
modparam("path", "enable_double_path", 0)
...
```
### `use_received` (int)

If set to 1, the “received” parameter of the first Route URI is evaluated and used as destination-URI if present.

*Default value is 0.*

**Example.** 1.

```opensips
...
modparam("path", "use_received", 1)
...
```

## Exported Functions

### `add_path([user])`

This function adds a Path header in the form “Path: <sip:user@1.2.3.4;lr>”.

**Parameters:**

- `user` *(string, optional)* — The username to be inserted as user part.

**Usable from:** REQUEST_ROUTE

**Example.** add_path(user) usage.

```opensips
...
if (!add_path("loadbalancer")) {
	sl_send_reply(503, "Internal Path Error");
	...
};
...
```

### `add_path_received([user])`

This function adds a Path header in the form “Path: <sip:user@1.2.3.4;received=sip:2.3.4.5:1234;lr>”, setting 'user' as username part of address, it's own outgoing address as domain-part, and the address the request has been received from as received-parameter.

**Parameters:**

- `user` *(string, optional)* — The username to be inserted as user part.

**Usable from:** REQUEST_ROUTE

**Example.** add_path_received(user) usage.

```opensips
...
if (!add_path_received("inbound")) {
	sl_send_reply(503, "Internal Path Error");
	...
};
...
```

## Configuration Examples

### Set `use_received` parameter

Demonstrates setting the `use_received` module parameter to 1.

```opensips
...
modparam("path", "use_received", 1)
...
```
### Set `enable_double_path` parameter

Demonstrates setting the `enable_double_path` module parameter to 0.

```opensips
...
modparam("path", "enable_double_path", 0)
...
```
### `add_path(user)` usage

Demonstrates using the `add_path` function with the username "loadbalancer".

```opensips
...
if (!add_path("loadbalancer")) {
	sl_send_reply(503, "Internal Path Error");
	...
};
...
```
### `add_path_received(user)` usage

Demonstrates using the `add_path_received` function with the username "inbound".

```opensips
...
if (!add_path_received("inbound")) {
	sl_send_reply(503, "Internal Path Error");
	...
};
...
```
