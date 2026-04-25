# MI script Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5646800)

2.2. [Most recently active contributors(1) to this module](#idp5720032)

**List of Examples**

1.1. [Set `pretty_printing` parameter](#idp258688)

1.2. [Set `trace_destination` parameter](#idp162784)

1.3. [Set `trace_destination` parameter](#idp171968)

1.4. [`mi` without params](#idp5592752)

1.5. [`mi` with params in command](#idp5594640)

1.6. [`mi` with return](#idp5596640)

1.7. [`mi` without return but with indexed params](#idp5598528)

1.8. [`mi` with return and named parameters](#idp5600624)

1.9. [`mi` without return, with an array parameter value](#idp5602720)

1.10. [`async mi call` usage](#idp5608944)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides multiple hooks to run Management Interface commands directly from OpenSIPS script. It supports running both synchronous and asynchronous commands. Depending on the nature of the command (asynchronous or not), and on the way the _mi_ command is run from script, the returned result is different.

## 1.2.�Values Returned

In case of success, the MI command returns with success. If a return variable is provided as parameter, a JSON is also stored in the variable provided.

In case of failure of the MI command, JSON-RPC reply error code is stored in the _$rc_ variable, as a negative number. Lower values, such as _\-1,-2,-3_ can also be returned to indicate an internal error. If a return variable is provided, it is stored to the error description.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _proto\_hep module_, in case MI tracing is used.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.4.�Exported Parameters

### 1.4.1.�`pretty_printing` (int)

Indicates whether the JSON responses stored in the return variable should be pretty-printed or not.

_Default value is “0 - no pretty-printing”._

**Example�1.1.�Set `pretty_printing` parameter**

...
modparam("mi\_script", "pretty\_printing", 1)
...

  

### 1.4.2.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. This is where traced mi messages will go.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.2.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "trace\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_script", "trace\_destination", "hep\_dest")
...

  

### 1.4.3.�`trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. **trace\_destination** must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

Defining a blacklists means all the commands that are not blacklisted will be traced. Defining a whitelist means all the commands that are not whitelisted will not be traced. **WARNING:** One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep)**.

_Default value is none(not defined)._

**Example�1.3.�Set `trace_destination` parameter**

...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi\_script", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_script", "trace\_bwlist", "w: sip\_trace")
...

  

## 1.5.�Exported Functions

### 1.5.1.� `mi(command, [ret_var [,params_avp[, vals_avp]]])`

Runs an MI command in synchronous mode, blocking until a response is available.

_IMPORTANT:_ it is highly recommended to prevent using this function for tasks that take long time, such as reloads, as the function would block until the command ends. Moreover, if the running MI _command_ is configured to run in asynchronous mode (such as _t\_uac\_dlg_ the command blocks in a busy waiting manner until the response is received.

This function can be used in any route.

The function can receive the following parameters:

*   _command(string)_ - the MI command to be run. This can be a single token, representing the MI command to run (without parameters), or can be followed by several space separated parameters (no escaping is handled). Each space separated parameter will be passed to the MI command as an indexed parameter.
    
    _NOTE:_ named parameters can not be specified using this parameter, and you will have to use the _params\_avp_ and/or the _vals\_avp_ parameters to specify named commands, in which case this parameter will only consist of the MI command.
    
*   _ret\_var(var, optional)_ - a variable used to store the return of the MI command execution. In case of success, a JSON is stored, otherwise an erorr message.
    
*   _params\_avp(avp, optional)_ - an AVP consisting of all the parameters names that will be sent to the MI command. If this parameter is used without the _vals\_avp_, all the values inside the AVP will be passed to the MI command as indexed parameters, otherwise as named parameters.
    
    _NOTE:_ if this parameter is used, the parameters specified in the _command_ parameter are ignored.
    
    _NOTE:_ the order the parameters are passed to the command is the same as the one you populate the AVPs (thus somehow reversed compared to the way AVPs are stored in memory - the first AVP added is the first parameter)
    
*   _vals\_avp(avp, optional)_ - an AVP consisting of all the parameters values that will be sent to the MI command. This parameter only makes sense if the _params\_avp_ is set, and has to contain the same number of values as there are parameters.
    
    To specify _array values_, enclose your space-separated array elements in the _\_\_array()_ pseudo-function call. For example: _"\_\_array(HEARTBEAT BACKGROUND\_JOB)"_
    

**Example�1.4.�`mi` without params**

...
mi("shm\_check");
...

  

**Example�1.5.�`mi` with params in command**

...
# this command is similar to the above
mi("cache\_remove local password\_user1");
...

  

**Example�1.6.�`mi` with return**

...
mi("ds\_list", $var(ret));
...

  

**Example�1.7.�`mi` without return but with indexed params**

...
$avp(params) = "local";
$avp(params) = "password\_user1";
mi("cache\_remove",,$avp(params));

# the following command is similar to the above
mi("cache\_remove local password\_user1");
...

  

**Example�1.8.�`mi` with return and named parameters**

...
$avp(params) = "callid";
$avp(vals) = "SEARCH\_FOR\_THIS\_CALLID";
$avp(params) = "from\_tag";
$avp(vals) = "SEARCH\_FOR\_THIS\_FROM\_TAG";
mi("dlg\_list", $var(dlg), $avp(params), $avp(vals));
...

  

**Example�1.9.�`mi` without return, with an array parameter value**

...
$avp(params) = "freeswitch\_url";
$avp(vals) = "fs://:ClueCon@192.168.20.8:8021";
$avp(params) = "events";
$avp(vals) = "\_\_array(HEARTBEAT BACKGROUND\_JOB)";
mi("fs\_subscribe", , $avp(params), $avp(vals));
...

  

## 1.6.�Exported Asyncronous Functions

### 1.6.1.� `mi(command, [ret_var [,params_avp[, vals_avp]]])`

The function works is more or less the same as its synchronous corespondent, except that the MI command is run in an asynchronous manner - the process does not block to wait for the response, but it continues its execution and the MI command is run in an asynchronous context.

_NOTE:_ currently MI commands run asynchronously cannot be traced through hep.

**Example�1.10.�`async mi call` usage**

...
xlog("reload starting\\n");
async(mi("dr\_reload"), after\_reload);
...

route\[after\_reload\] {
	xlog("reload completed\\n");
}

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

18

7

1116

17

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

5

3

69

8

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

7

8

4.

Alexandra Titoc

3

1

4

2

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2021 - Jul 2025

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jun 2022 - Aug 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2021 OpenSIPS Solutions