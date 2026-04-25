# exec Module Reference
<!-- generated-from: data/3.6/modules/exec.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 exec module. Read this file when configuring or debugging the exec module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The Exec module enables the execution of external commands from the OpenSIPS script. Any valid shell commands are accepted. The final input string is evaluated and executed using the "/bin/sh" symlink/binary. OpenSIPS may additionally pass a lot more information about the request using environment variables:

## How It Works

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

**Notes:** NOTE: due to internal limitations, a SIGTERM will actually be sent to **all** job pids once the "time\_to\_kill" expiration timeout hits. On a standard system, this should have no side-effects, as pids are monotonically increasing in a slow manner, and OpenSIPS should run under the "opensips" user, thus rendering it unable to terminate non-child processes. If this is not the case on your system, do not use the OpenSIPS "time_to_kill" feature -- rather implement it within your external app!

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

Meaning of the parameters is as follows:

*   _command (string)_ - command to be executed
    
*   _stdin (string, optional)_ - string to be passed to the standard input of the command
    
*   _stdout (var, optional)_ - optional output variable which will hold the standard output of the process
    
*   _stderr (var, optional)_ - optional output variable which will hold the standard error of the process
    
*   _envavp (var, optional)_ - optional AVP which holds the values for the environment variables to be passed for the command. The names of the environment variables will be "OSIPS\_EXEC\_#", where "#" starts from 0. For example, if we push two values (e.g. "b" and "a") into an AVP variable, which acts like a stack, OSIPS\_EXEC\_0 will hold "a", while OSIPS\_EXEC\_1 will hold "b".
    
NOTE: If expecting a multi-line formatted output, you should use $avp variables for the "stdout" and "stderr" parameters, to avoid only receiving the last lines of each stream.

WARNING: any OpenSIPS pseudo-vars which may contain special bourne shell (sh/bash) characters should be placed inside quotes, e.g. exec("update-stats.sh '$(ct{re.subst,/'//g})'");

WARNING: "stdin"/"stdout"/"stderr" parameters are not designed for large amounts of data, so one should be careful when using them. Because of the basic implementation, filled up pipes could cause a read deadlock.

**Parameters:**

- `command` *(string, required)* — command to be executed
- `envavp` *(var, optional)* — optional AVP which holds the values for the environment variables to be passed for the command. The names of the environment variables will be "OSIPS\_EXEC\_#", where "#" starts from 0. For example, if we push two values (e.g. "b" and "a") into an AVP variable, which acts like a stack, OSIPS\_EXEC\_0 will hold "a", while OSIPS\_EXEC\_1 will hold "b".
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
xlog("The output is $var(out)\\n");
xlog("Received the following error\\n$var(err)");
...
$var(input) = "input";
exec("/home/../myscript.sh", "this is my $var(input) for exec\\n", , , $avp(env));
...
```

## Configuration Examples

### Set “setvars” parameter

Sets the 'setvars' parameter to 1 to enable environment variables.

```opensips
...
modparam("exec", "setvars", 1)
...
```
### Set “time_to_kill” parameter

Sets the 'time_to_kill' parameter to 20 seconds.

```opensips
...
modparam("exec", "time_to_kill", 20)
...
```
### `exec` usage

Demonstrates usage of the exec function with environment variables, output capturing, and input passing.

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

Demonstrates usage of the asynchronous exec function with a resume route.

```opensips
{
...
async(exec("ruri-changer.sh", $ru, $ru), resume);
}

route \[resume\] {
...
}
```
