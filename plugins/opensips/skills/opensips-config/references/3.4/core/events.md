# Core Events Reference
<!-- generated-from: data/3.4/core/events.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: event -->

Reference for OpenSIPs 3.4 core events. Read this file when subscribing to or raising runtime events through event_route blocks or the event-handling MI commands.

## Contents

- [`E_CORE_LOG`](#e_core_log)
- [`E_CORE_PKG_THRESHOLD`](#e_core_pkg_threshold)
- [`E_CORE_PROC_AUTO_SCALE`](#e_core_proc_auto_scale)
- [`E_CORE_SHM_THRESHOLD`](#e_core_shm_threshold)
- [`E_CORE_SR_STATUS_CHANGED`](#e_core_sr_status_changed)
- [`E_CORE_TCP_DISCONNECT`](#e_core_tcp_disconnect)
- [`E_CORE_THRESHOLD`](#e_core_threshold)

## `E_CORE_LOG`

This event is triggered whenever a log message is produced by OpenSIPS. In order to have this event trigger, the log_event_enabled must be enabled in your configuration.

**Parameters:**

- `time` *(string)* — time when the log message was produced
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
