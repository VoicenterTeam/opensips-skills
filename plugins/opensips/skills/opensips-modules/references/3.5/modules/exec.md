# exec Module Reference
<!-- generated-from: data/3.5/modules/exec.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 exec module. Read this file when configuring or debugging the exec module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The Exec module enables the execution of external commands from the OpenSIPS script. Any valid shell commands are accepted. The final input string is evaluated and executed using the "/bin/sh" symlink/binary. OpenSIPS may additionally pass a lot more information about the request using environment variables:

*   SIP_HF_<hf_name> contains value of each header field in request. If a header field occurred multiple times, values are concatenated and comma-separated. <hf_name> is in capital letters. Ff a header-field name occurred in compact form, <hf_name> is canonical.
    
*   SIP_TID is transaction identifier. All request retransmissions or CANCELs/ACKs associated with a previous INVITE result in the same value.
    
*   SIP_DID is dialog identifier, which is the same as to-tag. Initially, it is empty.
    
*   SIP_SRCIP is source IP address from which request came.
    
*   SIP_ORURI is original request URI.
    
*   SIP_RURI is _current_ request URI (if unchanged, equal to original).
    
*   SIP_USER is userpart of _current_ request URI.
    
*   SIP_OUSER is userpart of original request URI.

NOTE: Any environment variables which are given to the exec module functions must be specified using the '$$' delimiter (e.g., $$SIP_OUSER), otherwise they will be evaluated as OpenSIPS pseudo-variables, throwing scripting errors.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `setvars` (integer)

Set to 1 to enable setting all above-mentioned environment variables for all executed commands.

*Default value is 0.*

**Notes:** WARNING: Before enabling this parameter, make sure your "/bin/sh" is safe from the Shellshock bash vulnerability!!!

**Example.** 1.

```opensips
...
modparam("exec", "setvars", 1)
...
```
### `time_to_kill` (integer)

If set, this parameter specifies the longest time (in seconds) that a program is allowed to execute. Once this duration is exceeded, the program is terminated (SIGTERM).

*Default value is 0.*

**Notes:** NOTE: due to internal limitations, a SIGTERM will actually be sent to **all** job pids once the "time_to_kill" expiration timeout hits. On a standard system, this should have no side-effects, as pids are monotonically increasing in a slow manner, and OpenSIPS should run under the "opensips" user, thus rendering it unable to terminate non-child processes. If this is not the case on your system, do not use the OpenSIPS "time_to_kill" feature -- rather implement it within your external app!

**Example.** 20.

```opensips
...
modparam("exec", "time_to_kill", 20)
...
```

## Exported Functions

### `exec(command, [stdin], [stdout], [stderr], [envavp])`

Executes an external command. The input is passed to the standard input of the new process, if specified, and the output is saved in the output variable.

The function waits for the external script until it provided all its output (not necessary to actually finish). If no output (standard output or standard error) is required by the function, it will not block at all - it will simply launch the external script and continue the script.

**Parameters:**

- `command` *(string, required)* — command to be executed
- `envavp` *(var, optional)* — optional AVP which holds the values for the environment variables to be passed for the command. The names of the environment variables will be "OSIPS_EXEC_#", where "#" starts from 0. For example, if we push two values (e.g. "b" and "a") into an AVP variable, which acts like a stack, OSIPS_EXEC_0 will hold "a", while OSIPS_EXEC_1 will hold "b".
- `stderr` *(var, optional)* — optional output variable which will hold the standard error of the process
- `stdin` *(string, optional)* — string to be passed to the standard input of the command
- `stdout` *(var, optional)* — optional output variable which will hold the standard output of the process

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE, ONREPLY_ROUTE

**Example.** exec usage.

```opensips
...
$avp(env) = "a";
$avp(env) = "b";
exec("ls -l", , $var(out), $var(err), $avp(env));
xlog("The output is $var(out)\n");
xlog("Received the following error\n$var(err)");
...
$var(input) = "input";
exec("/home/../myscript.sh", "this is my $var(input) for exec\n", , , $avp(env));
...
```

## Configuration Examples

### Set “setvars” parameter

Set to 1 to enable setting all above-mentioned environment variables for all executed commands.

```opensips
...
modparam("exec", "setvars", 1)
...
```
### Set “time_to_kill” parameter

If set, this parameter specifies the longest time (in seconds) that a program is allowed to execute. Once this duration is exceeded, the program is terminated (SIGTERM).

```opensips
...
modparam("exec", "time_to_kill", 20)
...
```
### `exec` usage

Executes an external command. The input is passed to the standard input of the new process, if specified, and the output is saved in the output variable.

```opensips
...
$avp(env) = "a";
$avp(env) = "b";
exec("ls -l", , $var(out), $var(err), $avp(env));
xlog("The output is $var(out)\\n");
xlog("Received the following error\\n$var(err)");
...
$var(input) = "input";
exec("/home/../myscript.sh", "this is my $var(input) for exec\\n", , , $avp(env));
...
```
### `async exec` usage

Executes an external command. This function does exactly the same as exec() (in terms of input, output and processing), but in an asynchronous way.

```opensips
{
...
async(exec("ruri-changer.sh", $ru, $ru), resume);
}

route [resume] {
...
}
```
