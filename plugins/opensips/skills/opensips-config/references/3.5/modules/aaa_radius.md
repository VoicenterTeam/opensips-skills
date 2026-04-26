# aaa_radius Module Reference
<!-- generated-from: data/3.5/modules/aaa_radius.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 aaa_radius module. Read this file when configuring or debugging the aaa_radius module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides a Radius implementation for the AAA API from the core.

It also provides two functions to be used from the script for generating custom Radius acct and auth requests. Detection and handling of SIP-AVPs from Radius replies is automatically and transparently done by the module.

Since version 2.2, aaa_radius module supports asynchronous operations. But in order to use them, one must apply the patch contained by the modules/aaa_radius folder, called _radius_async_support_patch_.In order to do this, you must have freeradius-client sources. In order to do this you can follow the tutorial in the end of the documentation.

Any module that wishes to use it has to do the following:

* _include aaa.h_
* _make a bind call with a proper radius specific url_

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `freeradius-client` — One of the following libraries must be installed before running OpenSIPS with this module loaded
- `radcli` — One of the three radius libraries that can be used (checked in order if RADIUSCLIENT env not set)
- `radiusclient-ng` — One of the following libraries must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `fetch_all_values` (integer)

For the output sets, this parameter controls if all the values (for the same RADIUS AVP) should be returned (otherwise only the first value will be returned). When enabling this options, be sure that the variable you use to get the RADIUS output can store multiple values (like the AVP variables).

By default this parameter is disabled (set to 0) for backward compatibility reasons.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("aaa_radius", "fetch_all_values", 1)
```
### `radius_config` (string)

Radiusclient configuration file.

This parameter is optional. It must be set only if the radius_send_acct and radius_send_auth functions are used.

**Example.** /etc/radiusclient-ng/radiusclient.conf.

```opensips
modparam("aaa_radius", "radius_config", "/etc/radiusclient-ng/radiusclient.conf")
```
### `sets` (string)

Sets of Radius AVPs to be used when building custom RADIUS requests (set of input RADIUS AVPs) or when fetching data from the RADIUS reply (set of output RADIUS AVPs).

The format for a set definition is the following:

*   " set_name = ( attribute_name1 = var1 \[, attribute_name2 = var2 \]\* ) "

The left-hand side of the assignment must be an attribute name known by the RADIUS dictionary.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

**Example.** set4  =  (  Sip-User-ID  =   $avp(10)
			,   Sip-From-Tag=$si,Sip-To-Tag=$tt      )      .

```opensips
modparam("aaa_radius","sets","set4  =  (  Sip-User-ID  =   $avp(10)
			,   Sip-From-Tag=$si,Sip-To-Tag=$tt      )      ")
```
### `syslog_name` (string)

Enable logging of the client library to syslog, using the given log name.

This parameter is optional. Radius client libraries will try to use syslog to report errors (such as problems with dictionaries) with the given ident string .If this parameter is set, then these errors are visible in syslog. Otherwise errors are hidden.

By default this parameter is not set (no logging).

**Example.** aaa-radius.

```opensips
modparam("aaa_radius", "syslog_name", "aaa-radius")
```

## Exported Functions

### `radius_send_acct(input_set_name)`

This function can be used from the script to make custom radius authentication request. The function takes only one string parameter that represents the name of the set that contains the list of attributes and pvars that will form the accounting request. Only one set is needed as a parameter because no AVPs can be extracted from the accounting replies. The set must be defined using the "sets" exported parameter.

**Parameters:**

- `input_set_name` *(string, required)* — the name of the set that contains the list of attributes and pvars that will form the accounting request.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE

**Example.** radius_send_acct usage.

```opensips
...
radius_send_acct("set1");
...
```

### `radius_send_auth(input_set_name, output_set_name)`

This function can be used from the script to make custom radius authentication request. The function takes two parameters. The sets must be defined using the “sets” exported parameter.

**Parameters:**

- `input_set_name` *(string, required)* — the name of the set that contains the list of attributes and pvars that will form the authentication request (see the “sets” module parameter).
- `output_set_name` *(string, required)* — the name of the set that contains the list of attributes and pvars that will be extracted form the authentication reply (see the “sets” module parameter).

**Return codes:**

- `1` — authentication was successful
- `-1` — an error (any kind of error) occurred during authentication processes
- `-2` — authentication was rejected or denied by RADIUS server

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE

**Example.** radius_send_auth usage.

```opensips
...
radius_send_auth("set1","set2");
switch ($rc) {
	case 1:
		xlog("authentication ok \\n");
		break;
	case -1:
		xlog("error during authentication\\n");
		break;
	case -2:
		xlog("authentication denied \\n");
		break;
}
...
```

## Configuration Examples

### Set `sets` parameter

Sets the `sets` parameter to define RADIUS AVP mappings.

```opensips
...
modparam("aaa_radius","sets","set4  =  (  Sip-User-ID  =   $avp(10)
			,   Sip-From-Tag=$si,Sip-To-Tag=$tt      )      ")
...

...
modparam("aaa_radius","sets","set1 = (User-Name=$var(usr), Sip-Group = $var(grp),
			Service-Type = $var(type)) ")
...

...
modparam("aaa_radius","sets","set2 = (Sip-Group = $var(sipgrup)) ")
...
```
### Set `radius_config` parameter

Sets the `radius_config` parameter to specify the configuration file.

```opensips
...
modparam("aaa_radius", "radius_config", "/etc/radiusclient-ng/radiusclient.conf")
...
```
### Set `syslog_name` parameter

Sets the `syslog_name` parameter to enable logging.

```opensips
...
modparam("aaa_radius", "syslog_name", "aaa-radius")
...
```
### Set `fetch_all_values` parameter

Sets the `fetch_all_values` parameter to control value fetching.

```opensips
...
modparam("aaa_radius", "fetch_all_values", 1)
...
```
### `radius_send_auth` usage

Demonstrates the usage of the `radius_send_auth` function.

```opensips
...
radius_send_auth("set1","set2");
switch ($rc) {
	case 1:
		xlog("authentication ok \\n");
		break;
	case -1:
		xlog("error during authentication\\n");
		break;
	case -2:
		xlog("authentication denied \\n");
		break;
}
...
```
### `radius_send_acct` usage

Demonstrates the usage of the `radius_send_acct` function.

```opensips
...
radius_send_acct("set1");
...
```
### `radius_send_auth` usage

Demonstrates the asynchronous usage of the `radius_send_auth` function.

```opensips
...
{
async( radius_send_auth("set1","set2"), resume);
}

route[resume] {
switch ($rc) {
	case 1:
		xlog("authentication ok \\n");
		break;
	case -1:
		xlog("error during authentication\\n");
		break;
	case -2:
		xlog("authentication denied \\n");
		break;
}
...
```
### `radius_send_acct` usage

Demonstrates the asynchronous usage of the `radius_send_acct` function.

```opensips
...
{
async( radius_send_acct("set1","set2"), resume);
}

route[resume] {
xlog(" accounting finished\\n");
}
...
```
