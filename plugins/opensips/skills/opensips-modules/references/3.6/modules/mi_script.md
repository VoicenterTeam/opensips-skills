# mi_script Module Reference
<!-- generated-from: data/3.6/modules/mi_script.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 mi_script module. Read this file when configuring or debugging the mi_script module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides multiple hooks to run Management Interface commands directly from OpenSIPS script. It supports running both synchronous and asynchronous commands. Depending on the nature of the command (asynchronous or not), and on the way the _mi_ command is run from script, the returned result is different.

## Dependencies

### OpenSIPs Modules

- `proto_hep` — in case MI tracing is used (optional)

### External Libraries

None.

## Exported Parameters

### `pretty_printing` (integer)

Indicates whether the JSON responses stored in the return variable should be pretty-printed or not.

*Default value is 0 - no pretty-printing.*

**Example.** 1.

```opensips
...
modparam("mi\_script", "pretty\_printing", 1)
...
```
### `trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. trace_destination must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

Defining a blacklists means all the commands that are not blacklisted will be traced. Defining a whitelist means all the commands that are not whitelisted will not be traced. WARNING: One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

*Default value is none(not defined).*

**Possible values:**

- w
- W
- b
- B

**Notes:** WARNING: A tracing module must be loaded in order for this parameter to work. (for example proto_hep).

**Example.** b: ps, which.

```opensips
...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi\_script", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_script", "trace\_bwlist", "w: sip\_trace")
...
```
### `trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is proto_hep. This is where traced mi messages will go.

*Default value is none(not defined).*

**Notes:** WARNING: A tracing module must be loaded in order for this parameter to work. (for example proto_hep).

**Example.** hep_dest.

```opensips
...
modparam("proto\_hep", "trace\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_script", "trace\_destination", "hep\_dest")
...
```

## Exported Functions

### `mi(command, [ret_var [,params_avp[, vals_avp]]])`

Runs an MI command in synchronous mode, blocking until a response is available.

_IMPORTANT:_ it is highly recommended to prevent using this function for tasks that take long time, such as reloads, as the function would block until the command ends. Moreover, if the running MI _command_ is configured to run in asynchronous mode (such as _t_uac_dlg_ the command blocks in a busy waiting manner until the response is received.

**Parameters:**

- `command` *(string, required)* — the MI command to be run. This can be a single token, representing the MI command to run (without parameters), or can be followed by several space separated parameters (no escaping is handled). Each space separated parameter will be passed to the MI command as an indexed parameter.

_NOTE:_ named parameters can not be specified using this parameter, and you will have to use the _params_avp_ and/or the _vals_avp_ parameters to specify named commands, in which case this parameter will only consist of the MI command.
- `params_avp` *(avp, optional)* — an AVP consisting of all the parameters names that will be sent to the MI command. If this parameter is used without the _vals_avp_, all the values inside the AVP will be passed to the MI command as indexed parameters, otherwise as named parameters.

_NOTE:_ if this parameter is used, the parameters specified in the _command_ parameter are ignored.

_NOTE:_ the order the parameters are passed to the command is the same as the one you populate the AVPs (thus somehow reversed compared to the way AVPs are stored in memory - the first AVP added is the first parameter)
- `ret_var` *(var, optional)* — a variable used to store the return of the MI command execution. In case of success, a JSON is stored, otherwise an erorr message.
- `vals_avp` *(avp, optional)* — an AVP consisting of all the parameters values that will be sent to the MI command. This parameter only makes sense if the _params_avp_ is set, and has to contain the same number of values as there are parameters.

To specify _array values_, enclose your space-separated array elements in the __array() pseudo-function call. For example: "__array(HEARTBEAT BACKGROUND_JOB)"

**Usable from:** ANY_ROUTE

**Example.** mi without params.

```opensips
mi("shm_check");
```

**Example.** mi with params in command.

```opensips
mi("cache_remove local password_user1");
```

**Example.** mi with return.

```opensips
mi("ds_list", $var(ret));
```

**Example.** mi without return but with indexed params.

```opensips
$avp(params) = "local";
$avp(params) = "password_user1";
mi("cache_remove",,$avp(params));

# the following command is similar to the above
mi("cache_remove local password_user1");
```

**Example.** mi with return and named parameters.

```opensips
$avp(params) = "callid";
$avp(vals) = "SEARCH_FOR_THIS_CALLID";
$avp(params) = "from_tag";
$avp(vals) = "SEARCH_FOR_THIS_FROM_TAG";
mi("dlg_list", $var(dlg), $avp(params), $avp(vals));
```

**Example.** mi without return, with an array parameter value.

```opensips
$avp(params) = "freeswitch_url";
$avp(vals) = "fs://:ClueCon@192.168.20.8:8021";
$avp(params) = "events";
$avp(vals) = "__array(HEARTBEAT BACKGROUND_JOB)";
mi("fs_subscribe", , $avp(params), $avp(vals));
```

## Configuration Examples

### Set `pretty_printing` parameter

```opensips
...
modparam("mi_script", "pretty_printing", 1)
...
```
### Set `trace_destination` parameter

```opensips
...
modparam("proto_hep", "trace_id", "[hep_dest]10.0.0.2;transport=tcp;version=3")

modparam("mi_script", "trace_destination", "hep_dest")
...
```
### Set `trace_destination` parameter

```opensips
...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi_script", "trace_bwlist", "b: ps, which")
...
## allow only sip_trace mi command
## all the other commands will not be traced
modparam("mi_script", "trace_bwlist", "w: sip_trace")
...
```
### `mi` without params

```opensips
...
mi("shm_check");
...
```
### `mi` with params in command

```opensips
...
# this command is similar to the above
mi("cache_remove local password_user1");
...
```
### `mi` with return

```opensips
...
mi("ds_list", $var(ret));
...
```
### `mi` without return but with indexed params

```opensips
...
$avp(params) = "local";
$avp(params) = "password_user1";
mi("cache_remove",,$avp(params));

# the following command is similar to the above
mi("cache_remove local password_user1");
...
```
### `mi` with return and named parameters

```opensips
...
$avp(params) = "callid";
$avp(vals) = "SEARCH_FOR_THIS_CALLID";
$avp(params) = "from_tag";
$avp(vals) = "SEARCH_FOR_THIS_FROM_TAG";
mi("dlg_list", $var(dlg), $avp(params), $avp(vals));
...
```
### `mi` without return, with an array parameter value

```opensips
...
$avp(params) = "freeswitch_url";
$avp(vals) = "fs://:ClueCon@192.168.20.8:8021";
$avp(params) = "events";
$avp(vals) = "__array(HEARTBEAT BACKGROUND_JOB)";
mi("fs_subscribe", , $avp(params), $avp(vals));
...
```
### `async mi call` usage

```opensips
...
xlog("reload starting\n");
async(mi("dr_reload"), after_reload);
...

route[after_reload] {
	xlog("reload completed\n");
}

```
