# mi_fifo Module Reference
<!-- generated-from: data/3.6/modules/mi_fifo.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 mi_fifo module. Read this file when configuring or debugging the mi_fifo module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module which provides a FIFO transport layer implementation for Management Interface. It receives the command over a FIFO file and returns the output through the reply_fifo specified.

## How It Works

The module checks every 30 seconds if the FIFO file exists, and if it was deleted, it recreates it. If one wants to force the fifo file recreation, it should send a SIGHUP signal to the MI process PID.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `fifo_group` (integer, string)

Group to be used for creating the listening FIFO file.

*Default value is the inherited one.*

**Example.** 0.

```opensips
modparam("mi_fifo", "fifo_group", 0)
modparam("mi_fifo", "fifo_group", "root")
```
### `fifo_mode` (integer)

Permission to be used for creating the listening FIFO file. It follows the UNIX conventions.

*Default value is 0660 (rw-rw----).*

**Example.** 0600.

```opensips
modparam("mi_fifo", "fifo_mode", 0600)
```
### `fifo_name` (string)

The name of the FIFO file to be created for listening and reading external commands.

*Default value is /tmp/opensips_fifo.*

**Notes:** Starting with Linux kernel 4.19, processes can no longer read from FIFO files that are saved in directories with sticky bits (such as /tmp) and are not owned by the same user the process runs with. This prevents external tools (such as opensips-cli) from running MI commands using a different user (a Permissions denied error is triggered). If you are getting this error while trying to use opensips-cli, you can fix it by either store the fifo file in a non-sticky bit directory (such as /run/opensips), or disable the fifo protection using sysctl fs.protected_fifos = 0 (NOT RECOMMENDED).

**Example.** /tmp/opensips_b2b_fifo.

```opensips
modparam("mi_fifo", "fifo_name", "/tmp/opensips_b2b_fifo")
```
### `fifo_user` (integer, string)

User to be used for creating the listening FIFO file.

*Default value is the inherited one.*

**Example.** 0.

```opensips
modparam("mi_fifo", "fifo_user", 0)
modparam("mi_fifo", "fifo_user", "root")
```
### `pretty_printing` (int)

Indicates whether the JSONRPC responses sent through MI should be pretty-printed or not.

*Default value is 0 - no pretty-printing.*

**Example.** 1.

```opensips
modparam("mi_fifo", "pretty_printing", 1)
```
### `reply_dir` (string)

Directory to be used for creating the reply FIFO files.

*Default value is /tmp/.*

**Example.** /home/opensips/tmp/.

```opensips
modparam("mi_fifo", "reply_dir", "/home/opensips/tmp/")
```
### `trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. trace_destination must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

*Default value is none(not defined).*

**Notes:** WARNING: A tracing module must be loaded in order for this parameter to work. (for example proto_hep). WARNING: One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**Example.** b: ps, which.

```opensips
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi_fifo", "trace_bwlist", "b: ps, which")
## allow only sip_trace mi command
## all the other commands will not be traced
modparam("mi_fifo", "trace_bwlist", "w: sip_trace")
```
### `trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is proto_hep. This is where traced mi messages will go.

*Default value is none(not defined).*

**Notes:** WARNING: A tracing module must be loaded in order for this parameter to work. (for example proto_hep).

**Example.** hep_dest.

```opensips
modparam("proto_hep", "trace_destination", "[hep_dest]10.0.0.2;transport=tcp;version=3")

modparam("mi_fifo", "trace_destination", "hep_dest")
```

## Configuration Examples

### FIFO request

This is an example showing the FIFO format for the “get\_statistics dialog: tm:” MI commad: response.

```opensips
:reply\_fifo:{"jsonrpc":"2.0","method":"get\_statistics","id":"5672","params":[["dialog:","tm:"]]}
```
