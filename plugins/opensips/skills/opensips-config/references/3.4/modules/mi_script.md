# mi_script Module Reference
<!-- generated-from: data/3.4/modules/mi_script.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 mi_script module. Read this file when configuring or debugging the mi_script module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

None.

### External Libraries

None.

### Optional Modules

- `proto_hep`

## Exported Parameters

### `pretty_printing` (integer)

Indicates whether the JSON responses stored in the return variable should be pretty-printed or not.

*Default value is 0 - no pretty-printing.*

**Example.** Set the `pretty_printing` parameter.

```opensips
...
modparam("mi_script", "pretty_printing", 1)
...
```
### `trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. **trace_destination** must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

*Default value is none(not defined)..*

**Notes:** WARNING: A tracing module must be loaded in order for this parameter to work. (for example **proto_hep)**. WARNING: One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**Example.** Set the `trace_bwlist` parameter.

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
### `trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto_hep**. This is where traced mi messages will go.

*Default value is none(not defined)..*

**Notes:** WARNING: A tracing module must be loaded in order for this parameter to work. (for example **proto_hep**).

**Example.** Set the `trace_destination` parameter.

```opensips
...
modparam("proto_hep", "trace_id", "\[hep_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi_script", "trace_destination", "hep_dest")
...
```

## Exported Functions

### `mi(command, [ret_var [,params_avp[, vals_avp]]])`

Runs an MI command in synchronous mode, blocking until a response is available.

_IMPORTANT:_ it is highly recommended to prevent using this function for tasks that take long time, such as reloads, as the function would block until the command ends. Moreover, if the running MI _command_ is configured to run in asynchronous mode (such as _t_uac_dlg_ the command blocks in a busy waiting manner until the response is received.

**Parameters:**

- `command` *(string, required)* — the MI command to be run. This can be a single token, representing the MI command to run (without parameters), or can be followed by several space separated parameters (no escaping is handled). Each space separated parameter will be passed to the MI command as an indexed parameter. NOTE: named parameters can not be specified using this parameter, and you will have to use the params_avp and/or the vals_avp parameters to specify named commands, in which case this parameter will only consist of the MI command.
- `params_avp` *(avp, optional)* — an AVP consisting of all the parameters names that will be sent to the MI command. If this parameter is used without the vals_avp, all the values inside the AVP will be passed to the MI command as indexed parameters, otherwise as named parameters. NOTE: if this parameter is used, the parameters specified in the command parameter are ignored. NOTE: the order the parameters are passed to the command is the same as the one you populate the AVPs (thus somehow reversed compared to the way AVPs are stored in memory - the first AVP added is the first parameter)
- `ret_var` *(var, optional)* — a variable used to store the return of the MI command execution. In case of success, a JSON is stored, otherwise an erorr message.
- `vals_avp` *(avp, optional)* — an AVP consisting of all the parameters values that will be sent to the MI command. This parameter only makes sense if the params_avp is set, and has to contain the same number of values as there are parameters. To specify array values, enclose your space-separated array elements in the __array() pseudo-function call. For example: "__array(HEARTBEAT BACKGROUND_JOB)"

**Return codes:**

- `JSON` — success
- `error message` — failure

**Usable from:** any route

**Example.** `mi` without params.

```opensips
mi("shm_check");
```

**Example.** `mi` with params in command.

```opensips
mi("cache_remove local password_user1");
```

**Example.** `mi` with return.

```opensips
mi("ds_list", $var(ret));
```

**Example.** `mi` without return but with indexed params.

```opensips
$avp(params) = "local";
$avp(params) = "password_user1";
mi("cache_remove",,$avp(params));

# the following command is similar to the above
mi("cache_remove local password_user1");
```

**Example.** `mi` with return and named parameters.

```opensips
$avp(params) = "callid";
$avp(vals) = "SEARCH_FOR_THIS_CALLID";
$avp(params) = "from_tag";
$avp(vals) = "SEARCH_FOR_THIS_FROM_TAG";
mi("dlg_list", $var(dlg), $avp(params), $avp(vals));
```

**Example.** `mi` without return, with an array parameter value.

```opensips
$avp(params) = "freeswitch_url";
$avp(vals) = "fs://:ClueCon@192.168.20.8:8021";
$avp(params) = "events";
$avp(vals) = "__array(HEARTBEAT BACKGROUND_JOB)";
mi("fs_subscribe", , $avp(params), $avp(vals));
```

## Configuration Examples

### Set `pretty_printing` parameter

Indicates whether the JSON responses stored in the return variable should be pretty-printed or not.

```opensips
...
modparam("mi_script", "pretty_printing", 1)
...
```
### Set `trace_destination` parameter

Trace destination as defined in the tracing module. Currently the only tracing module is proto_hep. This is where traced mi messages will go.

```opensips
...
modparam("proto_hep", "trace_id", "[hep_dest]10.0.0.2;transport=tcp;version=3")

modparam("mi_script", "trace_destination", "hep_dest")
...
```
### Set `trace_destination` parameter

Filter traced mi commands based on a blacklist or a whitelist. trace_destination must be defined for this parameter to have any purpose.

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

This can be a single token, representing the MI command to run (without parameters), or can be followed by several space separated parameters (no escaping is handled).

```opensips
...
mi("shm_check");
...
```
### `mi` with params in command

This can be a single token, representing the MI command to run (without parameters), or can be followed by several space separated parameters (no escaping is handled).

```opensips
...
# this command is similar to the above
mi("cache_remove local password_user1");
...
```
### `mi` with return

a variable used to store the return of the MI command execution. In case of success, a JSON is stored, otherwise an erorr message.

```opensips
...
mi("ds_list", $var(ret));
...
```
### `mi` without return but with indexed params

an AVP consisting of all the parameters names that will be sent to the MI command. If this parameter is used without the vals_avp, all the values inside the AVP will be passed to the MI command as indexed parameters, otherwise as named parameters.

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

an AVP consisting of all the parameters values that will be sent to the MI command. This parameter only makes sense if the params_avp is set, and has to contain the same number of values as there are parameters.

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

To specify array values, enclose your space-separated array elements in the __array() pseudo-function call.

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

The function works is more or less the same as its synchronous corespondent, except that the MI command is run in an asynchronous manner - the process does not block to wait for the response, but it continues its execution and the MI command is run in an asynchronous context.

```opensips
...
xlog("reload starting\n");
async(mi("dr_reload"), after_reload);
...

route[after_reload] {
	xlog("reload completed\n");
}
```
