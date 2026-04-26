# pike Module Reference
<!-- generated-from: data/4.0/modules/pike.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 pike module. Read this file when configuring or debugging the pike module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The module provides a simple mechanism for DOS protection - DOS based on floods at network level. The module keeps trace of all (or selected ones) IPs of incoming SIP traffic (as source IP) and blocks the ones that exceeded some limit. Works simultaneous for IPv4 and IPv6 addresses.

The module does not implement any actions on blocking - it just simply reports that there is a high traffic from an IP; what to do, is the administator decision (via scripting).

## How It Works

There are 2 ways of using this module (as detecting flood attacks and as taking the right action to limit the impact on the system):

* manual - from routing script you can force the check of the source IP of an incoming requests, using "pike_check_req" function. Note that this checking works only for SIP requests and you can decide (based on scripting logic) what source IPs to be monitored and what action to be taken when a flood is detected.
* automatic - the module will install internal hooks to catch all incoming requests and replies (even if not well formed from SIP point of view) - more or less the module will monitor all incoming packages (from the network) on the SIP sockets. Each time the source IP of a package needs to be analyse (to see if trusted or not), the module will run a script route - see "check_route" module parameter -, where, based on custom logic, you can decide if that IP needs to be monitored for flooding or not. As action, when flood is detected, the module will automatically drop the packages.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `check_route` (string)

The name of the script route to be triggers (in automatic way) when a package is received from the network. If you do a "drop" in this route, it will indicate to the module that the source IP of the package does not need to be monitored. Otherwise, the source IP will be automatically monitered. By defining this parameter, the automatic checking mode is enabled.

*Default value is NONE (no auto mode)..*

**Example.** pike.

```opensips
modparam("pike", "check_route", "pike")
route[pike]{
    if ($si==111.222.111.222)  /*trusted, do not check it*/
        drop;
    /* all other IPs are checked*/
}
```
### `pike_log_level` (integer)

Log level to be used by module to auto report the blocking (only first time) and unblocking of IPs detected as source of floods.

*Default value is 1 (L_WARN)..*

**Example.** -1.

```opensips
modparam("pike", "pike_log_level", -1)
```
### `remove_latency` (integer)

For how long the IP address will be kept in memory after the last request from that IP address. It's a sort of timeout value.

*Default value is 120.*

**Notes:** If the _remove_latency_ value is lower than _sampling_time_unit_ value, nodes might expire before being unblocked, therefore losing some UNBLOCK events. In order to prevent this, if the _remove_latency_ is lower, OpenSIPS internally forces its value to _sampling_time_unit + 1_.

**Example.** 130.

```opensips
modparam("pike", "remove_latency", 130)
```
### `reqs_density_per_unit` (integer)

How many requests should be allowed per sampling_time_unit before blocking all the incoming request from that IP. Practically, the blocking limit is between ( let's have x=reqs_density_per_unit) x and 3*x for IPv4 addresses and between x and 8*x for ipv6 addresses.

*Default value is 30.*

**Example.** 30.

```opensips
modparam("pike", "reqs_density_per_unit", 30)
```
### `sampling_time_unit` (integer)

Time period used for sampling (or the sampling accuracy ;-) ). The smaller the better, but slower. If you want to detect peaks, use a small one. To limit the access (like total number of requests on a long period of time) to a proxy resource (a gateway for ex), use a bigger value of this parameter. IMPORTANT: a too small value may lead to performance penalties due timer process overloading.

*Default value is 2.*

**Example.** 10.

```opensips
modparam("pike", "sampling_time_unit", 10)
```

## Exported Functions

### `pike_check_req()`

Process the source IP of the current request and returns false if the IP was exceeding the blocking limit.

IMPORTANT: in case of internal error, the function returns true to avoid reporting the current processed IP as blocked.

**Return codes:**

- `1` — IP is not to be blocked or internal error occurred
- `-1` — IP is source of flooding, being previously detected
- `-2` — IP is detected as a new source of flooding - first time detection

**Usable from:** REQUEST_ROUTE

**Example.** pike_check_req usage.

```opensips
...
if (!pike_check_req()) { exit; };
...
```

## Exported MI Functions

### `pike:list`

Replaces obsolete MI command: _pike_list_.

Lists the nodes in the pike tree.

**Example.** MI FIFO Command Format

```opensips-cli
		opensips-cli -x mi pike:list
```

### `pike:rm`

Replaces obsolete MI command: _pike_rm_.

Remove a node from the pike tree by IP address.

**Parameters:**

- `IP` *(string, required)* — IP address currently blocked.

**Example.** MI FIFO Command Format

```opensips-cli
		opensips-cli -x mi pike:rm 10.0.0.106
```

## Exported Events

### `E_PIKE_BLOCKED`

This event is raised when the pike module decides that an IP should be blocked.

**Parameters:**

- `ip` *(string)* — the IP address that has been blocked.

## Configuration Examples

### Set `sampling_time_unit` parameter

Set `sampling_time_unit` parameter

```opensips
...
modparam("pike", "sampling_time_unit", 10)
...
```
### Set `reqs_density_per_unit` parameter

Set `reqs_density_per_unit` parameter

```opensips
...
modparam("pike", "reqs_density_per_unit", 30)
...
```
### Set `remove_latency` parameter

Set `remove_latency` parameter

```opensips
...
modparam("pike", "remove_latency", 130)
...
```
### Set `check_route` parameter

Set `check_route` parameter

```opensips
...
modparam("pike", "check_route", "pike")
...
route[pike]{
    if ($si==111.222.111.222)  /*trusted, do not check it*/
        drop;
    /* all other IPs are checked*/
}
....
```
### Set `pike_log_level` parameter

Set `pike_log_level` parameter

```opensips
...
modparam("pike", "pike_log_level", -1)
...
```
### `pike_check_req` usage

`pike_check_req` usage

```opensips
...
if (!pike_check_req()) { exit; };
...
```
