# Core Events Reference
<!-- generated-from: data/4.0/core/events.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: event -->

Reference for OpenSIPs 4.0 core events. Read this file when subscribing to or raising runtime events through event_route blocks or the event-handling MI commands.

## Contents

- [`E_CORE_LOG`](#e_core_log)
- [`E_CORE_PKG_THRESHOLD`](#e_core_pkg_threshold)
- [`E_CORE_PROC_AUTO_SCALE`](#e_core_proc_auto_scale)
- [`E_CORE_SHM_THRESHOLD`](#e_core_shm_threshold)
- [`E_CORE_SR_STATUS_CHANGED`](#e_core_sr_status_changed)
- [`E_CORE_TCP_DISCONNECT`](#e_core_tcp_disconnect)
- [`E_CORE_THRESHOLD`](#e_core_threshold)
- [`E_PROFILING_PROC`](#e_profiling_proc)
- [`E_PROFILING_SCRIPT`](#e_profiling_script)

## `E_CORE_LOG`

This event is triggered whenever a log message is produced by OpenSIPS. In order to have this event trigger, the log_event_enabled must be enabled in your configuration.

**Parameters:**

- `time` *(integer)* — time when the log message was produced
- `pid` *(integer)* — the PID of the processes that produced this log message
- `level` *(string)* — the log level of this message ("DBG", "INFO" etc.)
- `module` *(string)* — module that produced this log message; NULL for logs triggered from the script by the xlog() function
- `function` *(string)* — internal function that produced this log message; NULL for logs triggered from the script by the xlog() function
- `prefix` *(string)* — logging prefix, configured via the log_prefix parameter. It is an empty string if the parameter is not configured.
- `message` *(string)* — the actual log message content
## `E_CORE_PKG_THRESHOLD`

This event is triggered when the private memory usage goes above a threshold limit, specified by the event_pkg_threshold the core parameter. It warns external applications about low values of free private memory.

**Parameters:**

- `usage` *(integer)* — the percentage of private memory usage. Can have values between event_pkg_threshold and 100.
- `threshold` *(integer)* — the event_pkg_threshold specified in the script.
- `used` *(integer)* — the amount of private memory used.
- `size` *(integer)* — the total amount of private memory.
- `pid` *(integer)* — the pid of the process that raises the event.
## `E_CORE_PROC_AUTO_SCALE`

This event is triggered whenever a new process is created (forked) or a process is terminated due the auto-scaling logic. In order to have this event trigger, the auto-scaling must be enabled in your configuration.

**Parameters:**

- `group_type` *(string)* — the type/name of the scaling group (UDP/TCP/TIMER).
- `group_filter` *(string)* — the filter (usually the socket/interface for UDP) of the scaling group.
- `group_load` *(integer)* — the load over the scaling group.
- `scale` *(string)* — "up" or "down"
- `process_id` *(integer)* — the process ID (at OpenSIPS level) of the scaled (up or down) process.
- `pid` *(integer)* — the PID (OS level) of the scaled (up or down) process.
## `E_CORE_SHM_THRESHOLD`

This event is triggered when the shared memory usage goes above a threshold limit, specified by the event_shm_threshold the core parameter. It warns external applications about low values of free shared memory.

**Parameters:**

- `usage` *(integer)* — the percentage of private memory usage. Can have values between event_shm_threshold and 100.
- `threshold` *(integer)* — the event_shm_threshold specified in the script.
- `used` *(integer)* — the amount of private memory used.
- `size` *(integer)* — the total amount of private memory.
## `E_CORE_SR_STATUS_CHANGED`

This event is triggered the status of an SR identifier changes.

**Parameters:**

- `group` *(string)* — the name of the SR group
- `identifier` *(string)* — the name of the SR identifier
- `status` *(integer)* — the new status (as numerical value) of the SR identifier
- `details` *(string)* — the details/text attached to the new status
- `old_status` *(integer)* — the old status (as numerical value) of the SR identifier
## `E_CORE_TCP_DISCONNECT`

This event is triggered when a TCP connection is terminated/disconnected.

**Parameters:**

- `src_ip` *(string)* — the source IP of the TCP connection
- `src_port` *(integer)* — the source PORT of the TCP connection
- `dst_ip` *(string)* — the destination IP of the TCP connection
- `dst_port` *(integer)* — the destination PORT of the TCP connection
- `proto` *(string)* — the protocol of the underlying TCP connection ( ie. tcp, tls, ws, wss, etc )
## `E_CORE_THRESHOLD`

This event is triggered when a particular action takes longer than a specific threshold. It can be raised when a MySQL or DNS query takes too long, or a SIP message processing goes beyond a specific limit.

**Parameters:**

- `source` *(string)* — the source of the event: mysql module, core (for DNS or message processing warnings).
- `time` *(integer)* — the amount of time (in microseconds) spent by the operation
- `extra` *(string)* — extra information, depending on the source of the event
## `E_PROFILING_PROC`

This event is generated when the process profiling is activated. It reports different actions that takes place inside the process.

**Parameters:**

- `sec` *(integer)* — UNIX TIMESTAMP, seconds
- `usec` *(integer)* — micro seconds within the second
- `session` *(integer)* — session ID, to group all events part of a profiling session
- `verb` *(string)* — profiling action as 'start','enter','exit' and 'end'
- `name` *(string)* — description of the profiling action
- `type` *(integer)* — the type of the process generating the profiling data
- `depth` *(integer)* — execution depth - 'start' is level 1, each 'enter' increases, each 'exit' decreases.
- `file` *(string)* — cfg file name or C function where the profiling is done
- `line` *(integer)* — line in the 'file'
- `status` *(integer)* — only for 'exit' and 'end', the status/retcode of the 'name' action (highly depends on its nature)

**Example.** Example of usage.

```json
{'sec': 1776767469, 'usec': 200446, 'session': 3463978, 'verb': 'start', 'name': 'SIP receiver udp:127.0.0.1:5060', 'type': 1, 'depth': 0}
{'sec': 1776767469, 'usec': 201035, 'session': 3463978, 'verb': 'enter', 'name': 'udp proto reading', 'type': 1, 'depth': 1, 'file': 'handle_io', 'line': 317}
{'sec': 1776767469, 'usec': 201485, 'session': 3463978, 'verb': 'enter', 'name': 'receive_msg', 'type': 1, 'depth': 2, 'file': 'receive_msg', 'line': 120}
{'sec': 1776767469, 'usec': 202558, 'session': 3463978, 'verb': 'enter', 'name': 'request_script', 'type': 1, 'depth': 3, 'file': 'receive_msg', 'line': 235}
{'sec': 1776767469, 'usec': 203201, 'session': 3463978, 'verb': 'exit', 'name': 'request_script', 'type': 1, 'depth': 2, 'file': 'receive_msg', 'line': 237, 'status': 1}
{'sec': 1776767469, 'usec': 203533, 'session': 3463978, 'verb': 'exit', 'name': 'receive_msg', 'type': 1, 'depth': 1, 'file': 'receive_msg', 'line': 316, 'status': 0}
{'sec': 1776767469, 'usec': 203663, 'session': 3463978, 'verb': 'exit', 'name': 'reading done', 'type': 1, 'depth': 0, 'file': 'handle_io', 'line': 324, 'status': 0}
{'sec': 1776767469, 'usec': 203786, 'session': 3463978, 'verb': 'end', 'name': 'SIP receiver udp:127.0.0.1:5060', 'type': 1, 'depth': 0, 'status': 0}
```
## `E_PROFILING_SCRIPT`

Similar to E_PROFILING_PROC but related to script (routes) execution.
