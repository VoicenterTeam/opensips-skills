# event_flatstore Module Reference
<!-- generated-from: data/3.4/modules/event_flatstore.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 event_flatstore module. Read this file when configuring or debugging the event_flatstore module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The event_flatstore module provides a logging facility for different events, triggered through the OpenSIPS Event Interface, directly from the OpenSIPS script. The module logs the events along with their parameters in plain text files.

## How It Works

_flatstore:path_to_file_

Meanings:

*   _flatstore:_ - informs the Event Interface that the events sent to this subscriber should be handled by the _event_flatstore_ module.
    
*   _path_to_file_ - path to the file where the logged events will be appended to. The file will be created if it does not exist. It must be a valid path and not a directory.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `delimiter` (string)

Sets the separator between the parameters of the event in the logging file.

*Default value is ,.*

**Example.** ;.

```opensips
modparam("event_flatstore", "delimiter", ";")
```
### `file_permissions` (string)

Sets the permissions for the newly created logs. It expects a string representation of a octal value.

*Default value is 644.*

**Example.** 664.

```opensips
modparam("event_flatstore", "file_permissions", "664")
```
### `max_open_sockets` (integer)

Defines the maximum number of simultaneously opened files by the module. If the maximum limit is reached, an error message will be thrown, and further subscriptions will only be possible after at least one of the current subscriptions will expire.

*Default value is 100.*

**Example.** 200.

```opensips
modparam("event_flatstore", "max_open_sockets", 200)
```
### `suppress_event_name` (integer)

Suppresses the name of the event in the log file.

*Default value is 0/OFF.*

**Example.** 1.

```opensips
modparam("event_flatstore", "suppress_event_name", 1)
```

## Exported MI Functions

### `evi_flat_rotate`

It makes the processes reopen the file specified as a parameter to the command in order to be compatible with a logrotate command. If the function is not called after the mv command is executed, the module will continue to write in the renamed file.

**Parameters:**

- `path_to_file` *(string, required)* — The path to the file to be reopened.

**Example.** Rotates the flatstore log file.

```opensips-cli
opensips-cli -x mi evi_flat_rotate _path_to_log_file_
```

## Configuration Examples

### Set `max_open_sockets` parameter

Defines the maximum number of simultaneously opened files by the module.

```opensips
...
modparam("event_flatstore", "max_open_sockets", 200)
...
```
### Set `delimiter` parameter

Sets the separator between the parameters of the event in the logging file.

```opensips
...
modparam("event_flatstore", "delimiter", ";")
...
```
### Set `file_permissions` parameter

Sets the permissions for the newly created logs. It expects a string representation of a octal value.

```opensips
...
modparam("event_flatstore", "file_permissions", "664")
...
```
### Set `suppress_event_name` parameter

Suppresses the name of the event in the log file.

```opensips
...
modparam("event_flatstore", "suppress_event_name", 1)
...
```
