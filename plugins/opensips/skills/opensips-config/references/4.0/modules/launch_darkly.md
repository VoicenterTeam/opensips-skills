# launch_darkly Module Reference
<!-- generated-from: data/4.0/modules/launch_darkly.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 launch_darkly module. Read this file when configuring or debugging the launch_darkly module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements support for the Launch Darkly feature management cloud. The module provide the conectivity to the cloud and the ability to query for feature flags.

OpenSIPS uses the server side C/C++ SDK provided by Launch Darkly.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `ldserverapi` — must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `connect_wait` (integer)

The time to wait (in miliseconds) when connecting to the LD service. An initial failure in connecting to the LD service may be addressed by increasing this wait value.

*Default value is 500.*

**Example.** 100.

```opensips
modparam("launch_darkly", "connect_wait", 100)
```
### `ld_log_level` (string)

The LaunchDarkly specific log level to be used by the LD SDK/libray to log its internal messages. Note that these log produced by the LD library (according to this ld_log_level) will be further subject to filtering according to the overall OpenSIPS log_level.

*Default value is LD_LOG_WARNING.*

**Possible values:**

- LD_LOG_FATAL
- LD_LOG_CRITICAL
- LD_LOG_ERROR
- LD_LOG_WARNING
- LD_LOG_INFO
- LD_LOG_DEBUG
- LD_LOG_TRACE

**Example.** LD_LOG_CRITICAL.

```opensips
modparam("launch_darkly", "ld_log_level", "LD_LOG_CRITICAL")
```
### `re_init_interval` (integer)

The minimum time interval (in seconds) to try again to init the LD client in the situation when the module was not able to init the LC connection at startup. In case of such failure, the module will automatically re-try to init its LD client on-demand, whnever the feature flag is checked from script, but not sooner than \`re_init_interval\`. Note: if there are no flag checkings to be performed, the re-init may be attempted longer than \`re_init_interval\`.

*Default value is 10.*

**Example.** 30.

```opensips
modparam("launch_darkly", "re_init_interval", 30)
```
### `sdk_key` (string)

The LaunchDarkly SDK key used to connect to the service. This is a mandatory parameter.

**Example.** sdk-12345678-abcd-12ab-1234-0123456789abc.

```opensips
modparam("launch_darkly", "sdk_key", "sdk-12345678-abcd-12ab-1234-0123456789abc")
```

## Exported Functions

### `ld_feature_enabled( flag, user, [user_extra], [fallback])`

Function to evaluate a LaunchDarkly boolean feature flag

Returns 1 if the flag was found TRUE or -1 otherwise.

In case of error, the fallback (TRUE or FALSE) value will be returned In such cases, a "fallback" TRUE is returned as 2 and a fallback FALSE as -2, so you can may a difference between a real TRUE (returned by the LD service) and a fallback TRUE due to an error.

**Parameters:**

- `fallback` *(int, optional)* — the value to be returned on error. By default FALSE will be returned.
- `flag` *(string, required)* — the key of the flag to evaluate. May not be NULL or empty.
- `user` *(string, required)* — the user to evaluate the flag against. May not be NULL or empty.
- `user_extra` *(AVP, optional)* — an AVP holding one or multiple key-value attributes to be attached to the user. The format of the AVP value is "key=value".

**Return codes:**

- `1` — the flag was found TRUE
- `-1` — the flag was found FALSE
- `2` — fallback TRUE on error
- `-2` — fallback FALSE on error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** `ld_feature_enabled()` function usage.

```opensips
...
$avp(extra) = "domainId=123456";
if (ld_feature_enabled("my-flag","opensips", $avp(extra), false))
	xlog("-------TRUE\\n");
else
	xlog("-------FALSE\\n");
...
```

## Configuration Examples

### Set `sdk_key` parameter

Sets the `sdk_key` parameter.

```opensips
...
modparam("launch_darkly", "sdk_key", "sdk-12345678-abcd-12ab-1234-0123456789abc")
...
```
### Set `log_level` parameter

Sets the `ld_log_level` parameter.

```opensips
...
modparam("launch_darkly", "ld_log_level", "LD_LOG_CRITICAL")
...
```
### Set `connect_wait` parameter

Sets the `connect_wait` parameter.

```opensips
...
modparam("launch_darkly", "connect_wait", 100)
...
```
### Set `re_init_interval` parameter

Sets the `re_init_interval` parameter.

```opensips
...
modparam("launch_darkly", "re_init_interval", 30)
...
```
### `ld_feature_enabled()` function usage

Demonstrates usage of the `ld_feature_enabled()` function.

```opensips
	...
	$avp(extra) = "domainId=123456";
	if (ld_feature_enabled("my-flag","opensips", $avp(extra), false))
		xlog("-------TRUE\\n");
	else
		xlog("-------FALSE\\n");
	...
```
