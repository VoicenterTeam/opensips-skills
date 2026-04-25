# Core MI Commands Reference
<!-- generated-from: data/3.6/core/mi-commands.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: mi_command -->

Reference for OpenSIPs 3.6 core Management Interface (MI) commands. Read this file when looking up command names, parameters, or expected JSON response shapes for runtime control of OpenSIPs.

## Contents

- [`add_blacklist_rule`](#add_blacklist_rule)
- [`arg`](#arg)
- [`cache_fetch`](#cache_fetch)
- [`cache_remove`](#cache_remove)
- [`cache_store`](#cache_store)
- [`check_blacklist`](#check_blacklist)
- [`check_blacklists`](#check_blacklists)
- [`del_blacklist_rule`](#del_blacklist_rule)
- [`event_subscribe`](#event_subscribe)
- [`events_list`](#events_list)
- [`get_statistics`](#get_statistics)
- [`kill`](#kill)
- [`list_blacklists`](#list_blacklists)
- [`list_statistics`](#list_statistics)
- [`list_tcp_conns`](#list_tcp_conns)
- [`log_level`](#log_level)
- [`log_level_filter`](#log_level_filter)
- [`log_mute_state`](#log_mute_state)
- [`mem_pkg_dump`](#mem_pkg_dump)
- [`mem_shm_dump`](#mem_shm_dump)
- [`ps`](#ps)
- [`pwd`](#pwd)
- [`raise_event`](#raise_event)
- [`reload_routes`](#reload_routes)
- [`reset_all_statistics`](#reset_all_statistics)
- [`reset_statistics`](#reset_statistics)
- [`shm_check`](#shm_check)
- [`sr_get_status`](#sr_get_status)
- [`sr_list_identifiers`](#sr_list_identifiers)
- [`sr_list_reports`](#sr_list_reports)
- [`sr_list_status`](#sr_list_status)
- [`subscribers_list`](#subscribers_list)
- [`uptime`](#uptime)
- [`version`](#version)
- [`which`](#which)
- [`xlog_level`](#xlog_level)

## `add_blacklist_rule`

Adds a rule to a non-readonly blacklist.

**Parameters:**

- `expire` *(integer, optional)* — indicates the number of seconds the rule should expire
- `name` *(string, required)* — the name of the blacklist to add to
- `rule` *(string, required)* — a string containing a blacklist rule, according to dst_blacklist parameter

**Returns:** success or failed object.

**Example.** Example of usage for add_blacklist_rule command

```bash
# opensips-cli -x mi add\_blacklist\_rule net\_dynamic '!tcp,127.0.0.1,5060'
# opensips-cli -x mi add\_blacklist\_rule net\_dynamic '!tcp,127.0.0.1,5060' 3600
```

## `arg`

Returns the full list of arguments used when OpenSIPS was started. As in UNIX, the first argument is the name of executable binary.

**Returns:** an array with multiple strings representing the arguments.

**Example.** Example of usage for arg command

```bash
# opensips-cli -x mi arg
\[
    "./opensips",
    "-f",
    "/etc/openser/test.cfg"
\]
```

## `cache_fetch`

This command queries for a stored value.

**Parameters:**

- `attr` *(string, required)* — the label associated with the value
- `system` *(string, required)* — cache system to use

**Returns:** object containing the value if a record is found or 'Value not found' string otherwise.

**Example.** Example of usage for cache_fetch command

```bash
# opensips-cli -x mi cache\_fetch local password\_user1
```

## `cache_remove`

This command removes a record from the cache system.

**Parameters:**

- `attr` *(string, required)* — the label associated with the stored value
- `system` *(string, required)* — cache system to use

**Returns:** None.

**Example.** Example of usage for cache_remove command

```bash
# opensips-cli -x mi cache\_remove local password\_user1
```

## `cache_store`

This command stores in a cache system a string value.

**Parameters:**

- `attr` *(string, required)* — the label to be associated with this value
- `expire` *(integer, optional)* — expire time for the stored value
- `system` *(string, required)* — cache system to use (e.g., 'local')
- `value` *(string, required)* — the string to be stored

**Returns:** none

**Example.** Example of usage for cache_store command

```bash
# opensips-cli -x mi cache\_store local password\_user1 password
```

## `check_blacklist`

The command check whether a proto:IP:port+pattern matches any rule of a blacklist.

**Parameters:**

- `ip` *(string, required)* — the mandatory IP that is used to match the rules
- `name` *(string, required)* — the name of the blacklist to check against
- `pattern` *(string, optional)* — optional pattern to check against the rules
- `port` *(integer, optional)* — the port of the check rule - if missing, 0/any port is used.
- `proto` *(string, optional)* — protocol of the check rule - if missing, "any" protocol is used.

**Returns:** an object containing the first rule that matched, or an error if nothing matched.

**Example.** Example of usage for check_blacklist command

```bash
# opensips-cli -x mi check\_blacklist net\_dynamic 127.0.0.1
# opensips-cli -x mi check\_blacklists net\_dynamic udp 127.0.0.1 5060
```

## `check_blacklists`

The command returns all the blacklists that match an proto:IP:port+pattern.

**Parameters:**

- `ip` *(string, required)* — the mandatory IP that is used to match the rules
- `pattern` *(string, optional)* — optional pattern to check against the rules
- `port` *(integer, optional)* — the port of the check rule - if missing, 0/any port is used. Note that a 0 port will only match a 0 port rule.
- `proto` *(string, optional)* — protocol of the check rule - if missing, "any" protocol is used. Note that an "any" protocol check can only match an "any" protocol rule.

**Returns:** an array with the names of each blacklist that matched.

**Example.** Example of usage for check_blacklists command

```bash
# opensips-cli -x mi check\_blacklists 127.0.0.1
# opensips-cli -x mi check\_blacklists udp 127.0.0.1 5060
```

## `del_blacklist_rule`

Removes a rule from a non-readonly blacklist.

**Parameters:**

- `name` *(string, required)* — the name of the blacklist to remove from
- `rule` *(string, required)* — a string containing a blacklist rule, according to dst_blacklist parameter

**Returns:** success or failed object.

**Example.** Example of usage for del_blacklist_rule command

```bash
# opensips-cli -x mi del\_blacklist\_rule net\_dynamic '!tcp,127.0.0.1,5060'
```

## `event_subscribe`

Subscribes an external application to a certain event.

**Parameters:**

- `event` *(string, required)* — event name
- `expire` *(integer, optional)* — expire time, in seconds - if absent, defaults to 3600 s
- `socket` *(string, required)* — external application socket

**Returns:** None.

**Example.** Example of usage for event_subscribe command

```bash
# opensips-cli -x mi event\_subscribe E\_PIKE\_BLOCKED udp:127.0.0.1:8888 1200
```

## `events_list`

Lists all the events published through the Event Interface.

**Returns:** None.

**Example.** Example of usage for events_list command

```bash
# opensips-cli -x mi events\_list
```

## `get_statistics`

Prints the statistics (all, group or one) realtime values.

**Parameters:**

- `statistics` *(array, required)* — an array of values: "all", "group_name:", or "name"

**Returns:** an object containing the names and values of statistic variables.

**Example.** Examples of usage for get_statistics command

```bash
# opensips-cli -x mi get\_statistics rcv\_requests
# opensipsc-cli -x mi get\_statistics shmem:
```

## `kill`

The command will terminate OpenSIPS (and internal shutdown).

**Returns:** none

**Example.** Example of usage for kill command

```bash
# opensips-cli -x mi kill
```

## `list_blacklists`

The command lists all the defined (static or learned) blacklists from OpenSIPS.

**Parameters:**

- `name` *(string, optional)* — filter and print only rules in a specific blacklist

**Returns:** an array with each object describing the list (name, owner, flags); the "Rules" item is an array with each object member describing the rules (blacklists) for each list (IP/mask, protocol, port, matching regexp, flags).

**Example.** Example of usage for list_blacklists command

```bash
# opensips-cli -x mi list\_blacklists
```

## `list_statistics`

Prints a list of available statistics in the current configuration of OpenSIPS.

**Parameters:**

- `statistics` *(array, optional)* — an array of the same possible values as for get_statistics, excluding "all".

**Returns:** A list of available statistics and their types.

**Example.** Example of usage for list_statistics command

```bash
# opensips-cli -x mi list\_statistics
```

## `list_tcp_conns`

The command lists all ongoing TCP/TLS connection from OpenSIPS.

**Returns:** an array with one object per connection with the following attributes : ID, type, state, source, destination, lifetime, alias port.

**Example.** Example of usage for list_tcp_conns command

```bash
# opensips-cli -x mi list\_tcp\_conns
```

## `log_level`

Get or set the logging level of one or all OpenSIPS processes. If no argument is passed, it prints a table with current levels. If level is given, it sets it for each process. If pid is also given, it changes only for that process.

**Parameters:**

- `level` *(integer, optional)* — logging level (-3...4)
- `pid` *(integer, optional)* — Unix pid (validated by OpenSIPS)

**Returns:** A table of processes and levels, or the new global log level.

**Example.** Examples of usage for log_level command

```bash
# opensips-cli -x mi log\_level
# opensipsctl fifo log\_level 1
# opensipsctl fifo log\_level 4 10670
```

## `log_level_filter`

Get or set the level of the extra filtering applied to log messages for a specific logging consumer (stderror, syslog or event).

**Parameters:**

- `consumer` *(string, optional)* — logging consumer: stderror, syslog or event
- `log_level_filter` *(integer, optional)* — the log level filter

**Returns:** The current level filter or "OK" string.

**Example.** Examples of usage for log_level_filter command

```bash
# opensips-cli -x mi log\_level\_filter stderror
# opensips-cli -x mi log\_level\_filter stderror 1
```

## `log_mute_state`

Get or set the mute state (printing enabled/disabled) of a specific logging consumer (stderror, syslog or event).

**Parameters:**

- `consumer` *(string, optional)* — logging consumer: stderror, syslog or event
- `mute_state` *(integer, optional)* — the new mute state: 1 - muted or 0 - unmuted (enabled)

**Returns:** The current mute state or "OK" string.

**Example.** Examples of usage for log_mute_state command

```bash
# opensips-cli -x mi log\_mute\_state syslog
# opensips-cli -x mi log\_mute\_state syslog 1
```

## `mem_pkg_dump`

Triggers a pkg memory dump for a given process. The memory dump will written to OpenSIPS's log using the 'memdump' logging level.

**Parameters:**

- `log_level` *(integer, optional)* — a log level to be used for this dump
- `pid` *(integer, required)* — the PID of the process to perform the pkg dump

**Returns:** None.

**Example.** Example of usage for mem_pkg_dump command

```bash
# opensips-cli -x mi mem\_pkg\_dump 11854 -1
```

## `mem_shm_dump`

Triggers a shm memory dump. The memory dump will written to OpenSIPS's log using the 'memdump' logging level.

**Parameters:**

- `log_level` *(integer, optional)* — a log level to be used for this dump

**Returns:** None.

**Example.** Example of usage for mem_shm_dump command

```bash
# opensips-cli -x mi mem\_shm\_dump -1
```

## `ps`

The command will list all all OpenSIPS processes, along with type and description.

**Returns:** multiple objects, each one containing a process ID (internal), PID (OS) and Type.

**Example.** Example of usage for ps command

```bash
# opensips-cli -x mi ps
```

## `pwd`

Prints the working directory of OpenSIPS instance.

**Returns:** a single item containing the working directory full path.

**Example.** Example of usage for pwd command

```bash
# opensips-cli -x mi pwd
```

## `raise_event`

Raises an event through the Event Interface using an MI command.

**Parameters:**

- `event` *(string, required)* — event name
- `params` *(mixed, optional)* — array of elements, or a string consisting of a JSON object containing key-value pairs

**Returns:** None.

**Example.** Examples of usage for raise_event command

```bash
# opensips-cli -x mi raise\_event E\_PIKE\_BLOCKED 127.0.0.1 # array mode
# opensips-cli -x -- mi -j raise\_event event=E\_PIKE\_BLOCKED params='{"ip":"127.0.0.1"}' # json mode
```

## `reload_routes`

Triggers the reload of the routing block (the routes) from the script during the runtime.

**Returns:** none

## `reset_all_statistics`

Reset (to zero) the value of all statistic variables that can be reset.

**Returns:** none

**Example.** Example of usage for reset_all_statistics command

```bash
# opensips-cli -x mi reset\_all\_statistics
```

## `reset_statistics`

Reset (to zero) the value of a statistic variable. Note that not all variables allow reset.

**Parameters:**

- `statistics` *(array, required)* — an array of the names of the variables to be reset.

**Returns:** none

**Example.** Example of usage for reset_statistics command

```bash
# opensips-cli -x mi reset\_statistics received\_replies
```

## `shm_check`

Only available with QM_MALLOC + DBG_MALLOC. Fully scans the shared memory pool in order to locate any inconsistencies.

**Returns:** current number of fragments.

**Example.** Example of usage for shm_check command

```bash
# opensips-cli -x mi shm\_check
```

## `sr_get_status`

The MI equivalent of the sr_check_status() script function - to get the status of an 'status/report' identifier/group.

**Parameters:**

- `group` *(string, required)* — mandatory group name
- `identifier` *(string, optional)* — optional identifier

**Returns:** the readiness, the status and details of the identifier/group

**Example.** Examples of usage for sr_get_status command

```bash
# opensips-cli -x mi sr\_get\_status core
# opensips-cli -x mi sr\_get\_status drouting all
```

## `sr_list_identifiers`

Command to list all the existing identifiers in OpenSIPS or only from a certain group.

**Parameters:**

- `group` *(string, optional)* — optional 'status/report' group. If missing, identifiers from all groups listed.

**Returns:** an array of groups, each group being an array of identifiers.

**Example.** Examples of usage for sr_list_identifiers command

```bash
#opensips-cli -x mi sr\_list\_identifiers
#opensips-cli -x mi sr\_list\_identifiers drouting
```

## `sr_list_reports`

Command to list the full set of reports (logs) collected by 'status/report' identifiers.

**Parameters:**

- `group` *(string, optional)* — optional 'status/report' group. If missing, all groups listed.
- `identifier` *(string, optional)* — optional identifier. If missing, all identifiers within group listed.

**Returns:** the reports/logs for the requested identifiers, or for all identifiers within the groups.

**Example.** Example of usage for sr_list_reports command

```bash
#bin/opensips-cli -x mi sr\_list\_reports
```

## `sr_list_status`

Command to list the status of the identifiers within one or all 'status/report' groups.

**Parameters:**

- `group` *(string, optional)* — optional 'status/report' group

**Returns:** the readiness, the status and details for all the identifiers within the requested group, or within all defined/registered groups.

**Example.** Example of usage for sr_list_status command

```bash
#opensips-cli -x mi sr\_list\_status
```

## `subscribers_list`

Lists information about the subscribers

**Parameters:**

- `event` *(string, required)* — event name
- `socket` *(string, optional)* — external application socket

**Returns:** Information about events and their subscribers based on parameters provided.

**Example.** Examples of usage for subscribers_list command

```bash
# opensips-cli -x mi subscribers\_list
# opensips-cli -x mi subscribers\_list E\_RTPPROXY\_STATUS
# opensips-cli -x mi subscribers\_list E\_RTPPROXY\_STATUS unix:/tmp/event.sock
```

## `uptime`

Prints various time information about OpenSIPS - when it started to run, for how long it runs.

**Returns:** three items: "Now" - current time; "Up since" - start time ; "Up time" - number of seconds since started.

**Example.** Example of usage for uptime command

```bash
# opensips-cli -x mi uptime
```

## `version`

Prints the version string of a running OpenSIPS.

**Returns:** one item (named "Server") containing the version string.

**Example.** Example of usage for version command

```bash
# opensips-cli -x mi version
```

## `which`

Prints all available MI commands from the queried OpenSIPS instance.

**Returns:** an array of the names of available MI commands.

**Example.** Example of usage for which command

```bash
# opensips-cli -x mi which
```

## `xlog_level`

Get or set the global xlogging level in OpenSIPS processes.

**Parameters:**

- `level` *(integer, optional)* — logging level

**Returns:** the current xlog_level if no argument is passed.

**Example.** Example of usage for xlog_level command

```bash
# opensips-cli -x mi xlog\_level -2
```
