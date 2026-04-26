# event_flatstore Module Reference
<!-- generated-from: data/4.0/modules/event_flatstore.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 event_flatstore module. Read this file when configuring or debugging the event_flatstore module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The _event_flatstore_ module provides a logging facility for different events, triggered through the OpenSIPS Event Interface, directly from the OpenSIPS script. The module logs the events along with their parameters in plain text files.

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
### `escape_delimiter` (string)

Optional replacement sequence that will be written instead of the delimiter whenever this character (or sequence) occurs inside a string parameter. This allows you to keep the log file parse-friendly even when user data itself may contain delimiter symbols.

*Default value is "".*

**Notes:** If set, its length must be exactly equal to the length of delimiter.

**Example.** |.

```opensips
modparam("event_flatstore", "delimiter", ",")
modparam("event_flatstore", "escape_delimiter", "|")
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
### `rotate_count` (int|string)

Defines after how many written lines the log file is rotated. The value may exceed the 32-bit integer limit; in that case pass it as a string, e.g. "5000000000".

*Default value is 0/OFF.*

**Notes:** The value may exceed the 32-bit integer limit; in that case pass it as a string.

**Example.** "5000000000".

```opensips
modparam("event_flatstore", "rotate_count", "5000000000")
```
### `rotate_period` (int)

When used, it triggers a file auto-rotate. The period is matched against the absolute time of the machine, can be useful to trigger auto-rotate every minute, or every hour.

*Default value is 0/OFF.*

**Example.** 60.

```opensips
modparam("event_flatstore", "rotate_period", 60) # rotate every minute
modparam("event_flatstore", "rotate_period", 3660) # rotate every hour
```
### `rotate_size` (int|string)

Sets the maximum size of a file before it is rotated. A size suffix of “k”, “m” or “g” (multiples of 1024) may be provided. Very large values can be supplied as strings, e.g. "8589934592" for 8 GiB.

*Default value is 0/OFF.*

**Notes:** A size suffix of “k”, “m” or “g” (multiples of 1024) may be provided.

**Example.** "2g".

```opensips
modparam("event_flatstore", "rotate_size", "2g")
```
### `suffix` (string)

Modifies the file that OpenSIPS writes events into by appending a suffix to the the file specified in the flatstore socket. The suffix can contain string formats (i.e. variables mixed with strings). The path of the resulted file is evaluated when the first event is raised/written in the file after a reload happend, or when the rotate_period, if specified, triggers a rotate. This parameter does not affect the matching of the event socket - the matching will be done exclusively using the flatstore socket registered.

*Default value is "".*

**Example.** "$time(%Y)".

```opensips
modparam("event_flatstore", "suffix", "$time(%Y)")
```
### `suppress_event_name` (int)

Suppresses the name of the event in the log file.

*Default value is 0/OFF.*

**Example.** 1.

```opensips
modparam("event_flatstore", "suppress_event_name", 1)
```

## Exported MI Functions

### `event_flatstore:rotate`

Replaces obsolete MI command: _evi_flat_rotate_. It makes the processes reopen the file specified as a parameter to the command in order to be compatible with a logrotate command. If the function is not called after the mv command is executed, the module will continue to write in the renamed file.

**Parameters:**

- `path_to_file` *(string, required)* — The file specified as a parameter to the command

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi event_flatstore:rotate _path_to_log_file_
```

## Exported Events

### `E_FLATSTORE_ROTATION`

The event is raised every time event_flatstore opens a new log file (manual event_flatstore:rotate, auto-rotate by `rotate_period`, or thresholds `rotate_count`/`rotate_size`). External apps can subscribe to monitor log-rotation activity.

**Parameters:**

- `timestamp` *(integer)* — Unix epoch (seconds) when the rotation was performed.
- `reason` *(string)* — one of the strings count, size, period or mi.
- `filename` *(string)* — full path of the new log file.
- `old_filename` *(string)* — full path of the previous log file, or empty string if none existed.

## Configuration Examples

### Set `max_open_sockets` parameter

Defines the maximum number of simultaneously opened files by the module. If the maximum limit is reached, an error message will be thrown, and further subscriptions will only be possible after at least one of the current subscriptions will expire.

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
### Enable escaping of ',' with '|'

Optional replacement sequence that will be written instead of the delimiter whenever this character (or sequence) occurs inside a string parameter. This allows you to keep the log file parse-friendly even when user data itself may contain delimiter symbols.

If set, its length must be exactly equal to the length of delimiter.

```opensips
...
modparam("event_flatstore", "delimiter", ",")
modparam("event_flatstore", "escape_delimiter", "|")
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
### Set `rotate_period` parameter

When used, it triggers a file auto-rotate. The period is matched against the absolute time of the machine, can be useful to trigger auto-rotate every minute, or every hour.

```opensips
...
modparam("event_flatstore", "rotate_period", 60) # rotate every minute
modparam("event_flatstore", "rotate_period", 3660) # rotate every hour
...
```
### Rotate after five billion lines

Defines after how many written lines the log file is rotated. The value may exceed the 32-bit integer limit; in that case pass it as a string, e.g. "5000000000".

```opensips
...
modparam("event_flatstore", "rotate_count", "5000000000")
...
```
### Rotate at 2 GiB

Sets the maximum size of a file before it is rotated. A size suffix of “k”, “m” or “g” (multiples of 1024) may be provided. Very large values can be supplied as strings, e.g. "8589934592" for 8 GiB.

```opensips
...
modparam("event_flatstore", "rotate_size", "2g")
...
```
### Set `suffix` parameter

Modifies the file that OpenSIPS writes events into by appending a suffix to the the file specified in the flatstore socket. The suffix can contain string formats (i.e. variables mixed with strings). The path of the resulted file is evaluated when the first event is raised/written in the file after a reload happend, or when the rotate_period, if specified, triggers a rotate. This parameter does not affect the matching of the event socket - the matching will be done exclusively using the flatstore socket registered.

```opensips
...
modparam("event_flatstore", "suffix", "$time(%Y)")
...
```
