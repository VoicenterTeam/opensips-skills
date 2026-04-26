# Core MI Commands Reference
<!-- generated-from: data/3.4/core/mi-commands.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: mi_command -->

Reference for OpenSIPs 3.4 core Management Interface (MI) commands. Read this file when looking up command names, parameters, or expected JSON response shapes for runtime control of OpenSIPs.

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

- `expire` *(integer, optional)* — Indicates the number of seconds the rule should expire
- `name` *(string, required)* — The name of the blacklist to add to
- `rule` *(string, required)* — A string containing a blacklist rule, according to dst_blacklist parameter

**Returns:** Success or failed object.

**Example.** Add a rule to a blacklist

```bash
# opensips-cli -x mi add_blacklist_rule net_dynamic '!tcp,127.0.0.1,5060'
# opensips-cli -x mi add_blacklist_rule net_dynamic '!tcp,127.0.0.1,5060' 3600
```

## `arg`

Returns the full list of arguments used when OpenSIPS was started. As in UNIX, the first argument is the name of executable binary.

**Returns:** An array with multiple strings representing the arguments.

**Example.** Get startup arguments

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

- `attr` *(string, required)* — The label associated with the value
- `system` *(string, required)* — Cache system to use - for the cache system implemented by OpenSIPS module 'localcache' the value of this parameter should be 'local'

**Returns:** Object containing the value if a record is found or 'Value not found' string otherwise.

**Example.** Fetch value from cache

```bash
# opensips-cli -x mi cache_fetch local password_user1
```

## `cache_remove`

This command removes a record from the cache system.

**Parameters:**

- `attr` *(string, required)* — The label associated with the stored value
- `system` *(string, required)* — Cache system to use

**Returns:** None

**Example.** Remove value from cache

```bash
# opensips-cli -x mi cache_remove local password_user1
```

## `cache_store`

This command stores in a cache system a string value.

**Parameters:**

- `attr` *(string, required)* — The label to be associated with this value
- `expire` *(integer, optional)* — Expire time for the stored value
- `system` *(string, required)* — Cache system to use - for the cache system implemented by OpenSIPS module 'localcache' the value of this parameter should be 'local'
- `value` *(string, required)* — The string to be stored

**Returns:** None

**Example.** Store value in cache

```bash
# opensips-cli -x mi cache_store local password_user1 password
```

## `check_blacklist`

The command check whether a proto:IP:port+pattern matches any rule of a blacklist.

**Parameters:**

- `ip` *(string, required)* — The mandatory IP that is used to match the rules
- `name` *(string, required)* — The name of the blacklist to check against
- `pattern` *(string, optional)* — Optional pattern to check against the rules
- `port` *(integer, optional)* — The port of the check rule - if missing, 0/any port is used. Note that a 0 port will only match a 0 port rule.
- `proto` *(string, optional)* — Protocol of the check rule - if missing, "any" protocol is used. Note that an "any" protocol check can only match an "any" protocol rule.

**Returns:** An object containing the first rule that matched, or an error if nothing matched.

**Example.** Check a specific blacklist

```bash
# opensips-cli -x mi check_blacklist net_dynamic 127.0.0.1
# opensips-cli -x mi check_blacklists net_dynamic udp 127.0.0.1 5060
```

## `check_blacklists`

The command returns all the blacklists that match an proto:IP:port+pattern.

**Parameters:**

- `ip` *(string, required)* — The mandatory IP that is used to match the rules
- `pattern` *(string, optional)* — Optional pattern to check against the rules
- `port` *(integer, optional)* — The port of the check rule - if missing, 0/any port is used. Note that a 0 port will only match a 0 port rule.
- `proto` *(string, optional)* — Protocol of the check rule - if missing, "any" protocol is used. Note that an "any" protocol check can only match an "any" protocol rule.

**Returns:** An array with the names of each blacklist that matched.

**Example.** Check blacklists for an IP

```bash
# opensips-cli -x mi check_blacklists 127.0.0.1
# opensips-cli -x mi check_blacklists udp 127.0.0.1 5060
```

## `del_blacklist_rule`

Removes a rule from a non-readonly blacklist.

**Parameters:**

- `name` *(string, required)* — The name of the blacklist to remove from
- `rule` *(string, required)* — A string containing a blacklist rule, according to dst_blacklist parameter

**Returns:** Success or failed object.

**Example.** Remove a rule from a blacklist

```bash
# opensips-cli -x mi del_blacklist_rule net_dynamic '!tcp,127.0.0.1,5060'
```

## `event_subscribe`

Subscribes an external application to a certain event.

**Parameters:**

- `event` *(string, required)* — Event name
- `expire` *(integer, optional)* — Expire time, in seconds - if absent, the subscription is valid only one hour (3600 s)
- `socket` *(string, required)* — External application socket

**Returns:** None

**Example.** Subscribe to event

```bash
# opensips-cli -x mi event_subscribe E_PIKE_BLOCKED udp:127.0.0.1:8888 1200
```

## `events_list`

Lists all the events published through the Event Interface.

**Returns:** Object containing an array of events with name and id.

**Example.** List events

```bash
# opensips-cli -x mi events_list
{
    "Events": \[
        {
            "name": "E_CORE_THRESHOLD",
            "id": 0
        },
        {
            "name": "E_CORE_SHM_THRESHOLD",
            "id": 1
        },
        {
            "name": "E_CORE_PKG_THRESHOLD",
            "id": 2
        },
...
```

## `get_statistics`

Prints the statistics (all, group or one) realtime values.

**Parameters:**

- `statistics` *(array, required)* — An array of values: "all" (print all), "group_name:" (print group), "name" (print specific stat).

**Returns:** An object containing the names and values of statistic variables.

**Example.** Get statistics

```bash
# opensips-cli -x mi get_statistics rcv_requests
   {
       "core:rcv_requests": 35243
   }
    # opensipsc-cli -x mi get_statistics shmem:      
    {
        "shmem:total_size": 1073741824,
        "shmem:max_used_size": 3389232,
        "shmem:free_size": 1070352592,
        "shmem:used_size": 2808952,
        "shmem:real_used_size": 3389232,
        "shmem:fragments": 3769
    }
    # opensips-cli -x mi get_statistics shmem: core:
    ....
```

## `kill`

The command will terminate OpenSIPS (and internal shutdown).

**Returns:** None

**Example.** Terminate OpenSIPS

```bash
# opensips-cli -x mi kill
```

## `list_blacklists`

The command lists all the defined (static or learned) blacklists from OpenSIPS.

**Parameters:**

- `name` *(string, optional)* — Filter and print only rules in a specific blacklist

**Returns:** An array with each object describing the list (name, owner, flags); the "Rules" item is an array with each object member describing the rules (blacklists) for each list (IP/mask, protocol, port, matching regexp, flags).

**Example.** List all blacklists

```bash
# opensips-cli -x mi list_blacklists
```

## `list_statistics`

Prints a list of available statistics in the current configuration of OpenSIPS.

**Parameters:**

- `statistics` *(array, optional)* — An array of the same possible values as for get_statistics MI command, with the exception of "all". Omitting the parameter will list all available statistics.

**Returns:** Object with statistic names and types (e.g., non-incremental).

**Example.** List available statistics

```bash
# opensips-cli -x mi list_statistics
{
    "shmem:total_size": "non-incremental",
    "shmem:max_used_size": "non-incremental",
    "shmem:free_size": "non-incremental",
    "shmem:used_size": "non-incremental",
    "shmem:real_used_size": "non-incremental",
    "shmem:fragments": "non-incremental",
    "rpmem:rpm_total_size": "non-incremental",
    "rpmem:rpm_used_size": "non-incremental",
...
```

## `list_tcp_conns`

The command lists all ongoing TCP/TLS connection from OpenSIPS.

**Returns:** An array with one object per connection with the following attributes : ID, type, state, source, destination, lifetime, alias port.

**Example.** List TCP connections

```bash
# opensips-cli -x mi list_tcp_conns
```

## `log_level`

Get or set the logging level of one or all OpenSIPS processes. If no argument is passed to the log_level command, it will print a table with the current logging levels of all processes. If a logging level is given, it will be set for each process. If pid is also given, the logging level will change only for that process.

**Parameters:**

- `level` *(integer, optional)* — Logging level (-3...4)
- `pid` *(integer, optional)* — Unix pid (validated by OpenSIPS)

**Returns:** Table of processes with log levels, or New global log level, or Log level.

**Example.** Get or set log level

```bash
# opensips-cli -x mi log_level
{
    "Processes": \[
        {
            "PID": 10670,
            "Log level": 2,
            "Type": "attendant"
        },
        {
            "PID": 10672,
            "Log level": 3,
            "Type": "MI FIFO"
        },
        {
            "PID": 10673,
            "Log level": 1,
            "Type": "SIP receiver udp:193.468.3.433:5060"
        },
    \]
}
# opensipsctl fifo log_level 1
{
    "New global log level": 1
}
# opensipsctl fifo log_level 4 10670
{
    "Log level": 1
}
```

## `log_level_filter`

Get or set the level of the extra filtering applied to log messages for a specific logging "consumer"(stderror, syslog or event). If log_level_filter is not given, the command will print the current level filter for the specified consumer.

**Parameters:**

- `consumer` *(string, required)* — Logging consumer: stderror, syslog or event
- `log_level_filter` *(integer, optional)* — The log level filter

**Returns:** Log level filter or OK string

**Example.** Get or set log level filter

```bash
# opensips-cli -x mi log_level_filter stderror
{
    "Log level filter": 3
}
# opensips-cli -x mi log_level_filter stderror 1
"OK"
```

## `log_mute_state`

Get or set the mute state (printing enabled/disabled) of a specific logging "consumer"(stderror, syslog or event). If mute_state is not given, the command will print the current mute state for the specified consumer.

**Parameters:**

- `consumer` *(string, required)* — Logging consumer: stderror, syslog or event
- `mute_state` *(integer, optional)* — The new mute state: 1 - muted or 0 - unmuted (enabled)

**Returns:** Mute state or OK string

**Example.** Get or set mute state

```bash
# opensips-cli -x mi log_mute_state syslog
{
    "mmute state": 0
}
# opensips-cli -x mi log_mute_state syslog 1
"OK"
```

## `mem_pkg_dump`

Triggers a pkg memory dump for a given process. The memory dump will written to OpenSIPS's log (syslog or stderr) using the 'memdump' logging level. The global 'memdump' log level may be overwritten by a custom value provided as argument to this command.

**Parameters:**

- `log_level` *(integer, optional)* — A log level to be used for this dump
- `pid` *(integer, required)* — The PID of the process to perform the pkg dump

**Returns:** None

**Example.** Trigger pkg memory dump

```bash
# opensips-cli -x mi mem_pkg_dump 11854 -1
```

## `mem_shm_dump`

Triggers a shm memory dump. The memory dump will written to OpenSIPS's log (syslog or stderr) using the 'memdump' logging level. The global 'memdump' log level may be overwritten by a custom value provided as argument to this command.

**Parameters:**

- `log_level` *(integer, optional)* — A log level to be used for this dump

**Returns:** None

**Example.** Trigger shm memory dump

```bash
# opensips-cli -x mi mem_shm_dump -1
```

## `ps`

The command will list all all OpenSIPS processes, along with type and description.

**Returns:** Multiple objects, each one containing a process ID (internal), PID (OS) and Type.

**Example.** List processes

```bash
# opensips-cli -x mi ps
{
    "Processes": \[
        {
            "ID": 0,
            "PID": 27271,
            "Type": "attendant"
        },
        {
            "ID": 1,
            "PID": 27272,
            "Type": "MI FIFO"
        },
        {
            "ID": 2,
            "PID": 27273,
            "Type": "time_keeper"
        },
        {
            "ID": 3,
            "PID": 27274,
            "Type": "timer"
        },
        {
            "ID": 4,
            "PID": 27275,
            "Type": "SIP receiver udp:127.0.0.1:5060"
        },
        {
            "ID": 5,
            "PID": 27276,
            "Type": "Timer handler"
        }
    \]
}
```

## `pwd`

Prints the working directory of OpenSIPS instance.

**Returns:** A single item containing the working directory full path.

**Example.** Print working directory

```bash
# opensips-cli -x mi pwd
{
    "WD": "/"
}
```

## `raise_event`

Raises an event through the Event Interface using an MI command.

**Parameters:**

- `event` *(string, required)* — Event name
- `params` *(array, optional)* — Array of elements, or a string consisting of a JSON object containing key-value pairs

**Returns:** None

**Example.** Raise an event

```bash
# opensips-cli -x mi raise_event E_PIKE_BLOCKED 127.0.0.1 # array mode
# opensips-cli -x -- mi -j raise_event event=E_PIKE_BLOCKED params='{"ip":"127.0.0.1"}' # json mode
```

## `reload_routes`

Triggers the reload of the routing block (the routes) from the script during the runtime.

**Returns:** None

## `reset_all_statistics`

Reset (to zero) the value of all statistic variables that can be reset. Note that not all variables allow reset (depending of the nature of the information they carry - example "shmem:used_size").

**Returns:** None

**Example.** Reset all statistics

```bash
# opensips-cli -x mi reset_all_statistics
```

## `reset_statistics`

Reset (to zero) the value of a statistic variable. Note that not all variables allow reset (depending of the nature of the information they carry - example "shmem:used_size").

**Parameters:**

- `statistics` *(array, required)* — An array of the names of the variables to be reset.

**Returns:** None

**Example.** Reset statistics

```bash
# opensips-cli -x mi get_statistics received_replies
   {
       "tm:received_replies": 14543
   }
    # opensips-cli -x mi reset_statistics received_replies
    # opensips-cli -x mi get_statistics received_replies
   {
       "tm:received_replies": 0
   }
```

## `shm_check`

Only available with QM_MALLOC + DBG_MALLOC. Fully scans the shared memory pool in order to locate any inconsistencies. If any sign of memory corruption is detected, OpenSIPS will immediately abort.

**Returns:** Current number of fragments.

**Example.** Check shared memory

```bash
# opensips-cli -x mi shm_check
```

## `sr_get_status`

The MI equivalent of the sr_check_status() script function - to get the status of an 'status/report' identifier/group.

**Parameters:**

- `group` *(string, required)* — Mandatory group name
- `identifier` *(string, optional)* — Optional identifier

**Returns:** The readiness, the status and details of the identifier/group

**Example.** Get status of a group or identifier

```bash
# opensips-cli -x mi sr_get_status core
{
    "Readiness": true,
    "Status": 1,
    "Details": "running"
}

# opensips-cli -x mi sr_get_status drouting all
{
    "Readiness": true,
    "Status": 1,
    "Details": "aggregated"
}
```

## `sr_list_identifiers`

Command to list all the existing identifiers in OpenSIPS or only from a certain group.

**Parameters:**

- `group` *(string, optional)* — Optional 'status/report' group. If missing, the identifiers from all the groups will be listed.

**Returns:** An array of groups, each group being an array of identifiers.

**Example.** List identifiers

```bash
#opensips-cli -x mi sr_list_identifiers
\[
    {
        "Group": "clusterer",
        "Identifiers": \[
            "sharing_tags"
        \]
    },
    {
        "Group": "dispatcher",
        "Identifiers": \[
            "default;events",
            "default"
        \]
    },
    {
        "Group": "drouting",
        "Identifiers": \[
            "Default;events",
            "Default"
        \]
    },
    {
        "Group": "dialplan",
        "Identifiers": \[
            "default"
        \]
    },
    {
        "Group": "core",
        "Identifiers": \[
            "main"
        \]
    }
\]
#opensips-cli -x mi sr_list_identifiers drouting
{
    "Group": "drouting",
    "Identifiers": \[
        "Default;events",
        "Default"
    \]
}
```

## `sr_list_reports`

Command to list the full set of reports (logs) collected by 'status/report' identifiers.

**Parameters:**

- `group` *(string, optional)* — Optional 'status/report' group. If missing, all groups will be listed.
- `identifier` *(string, optional)* — Optional 'identifier'. If missing, all identifiers within the group will be listed.

**Returns:** The reports/logs for the requested identifiers, or for all identifiers within the groups.

**Example.** List reports

```bash
#bin/opensips-cli -x mi sr_list_reports 
\[
    {
        "Name": "drouting",
        "Identifiers": \[
            {
                "Name": "Default",
                "Reports": \[
                    {
                        "Timestamp": 1644396830,
                        "Date": "Wed Feb  9 10:53:50 2022",
                        "Log": "starting DB data loading"
                    },
                    {
                        "Timestamp": 1644396830,
                        "Date": "Wed Feb  9 10:53:50 2022",
                        "Log": "DB data loading successfully completed"
                    },
                    {
                        "Timestamp": 1644396830,
                        "Date": "Wed Feb  9 10:53:50 2022",
                        "Log": "2 gateways loaded (0 discarded), 2 carriers loaded (0 discarded), 1 rules loaded (0 discarded)"
                    }
                \]
            }
        \]
    },
    {
        "Name": "test",
        "Identifiers": \[
            {
                "Name": "main",
                "Reports": \[\]
            }
        \]
    },
    {
        "Name": "core",
        "Identifiers": \[
            {
                "Name": "main",
                "Reports": \[
                    {
                        "Timestamp": 1644396830,
                        "Date": "Wed Feb  9 10:53:50 2022",
                        "Log": "initializing"
                    },
                    {
                        "Timestamp": 1644396830,
                        "Date": "Wed Feb  9 10:53:50 2022",
                        "Log": "initialization completed, ready now"
                    }
                \]
            }
        \]
    }
\]
```

## `sr_list_status`

Command to list the status of the identifiers within one or all 'status/report' groups.

**Parameters:**

- `group` *(string, optional)* — Optional 'status/report' group

**Returns:** The readiness, the status and details for all the identifiers within the requested group, or within all defined/registered groups.

**Example.** List status of identifiers

```bash
#opensips-cli -x mi sr_list_status 
\[
    {
        "Name": "drouting",
        "Identifiers": \[
            {
                "Name": "Default",
                "Readiness": true,
                "Status": 1,
                "Details": "data available"
            }
        \]
    },
    {
        "Name": "test",
        "Identifiers": \[
            {
                "Name": "main",
                "Readiness": true,
                "Status": 1
            }
        \]
    },
    {
        "Name": "core",
        "Identifiers": \[
            {
                "Name": "main",
                "Readiness": true,
                "Status": 1,
                "Details": "running"
            }
        \]
    }
\]
```

## `subscribers_list`

Lists information about the subscribers

**Parameters:**

- `event` *(string, required)* — Event name
- `socket` *(string, optional)* — External application socket

**Returns:** If no parameter is specified, returns information about all events and their subscribers. If the event is specified, only the external applications subscribed for that event are returned. If the socket is also specified, only one subscriber information is returned.

**Example.** List subscribers

```bash
# opensips-cli -x mi subscribers_list
{
  "Events": \[{
	  "name": "E_RTPPROXY_STATUS",
	  "id": 1,
	  "subscribers": \[
		...
	  \]
	},
	{
	  "name": "E_PIKE_BLOCKED",
	  "id": 2,
	  "subscribers": \[
		...
	  \]
	}
  \]
}

    # opensips-cli -x mi subscribers_list E_RTPPROXY_STATUS
{
  "Event": {
	"name": "E_RTPPROXY_STATUS",
	"id": 1,
	"subscribers": \[{
		  "socket": "unix:/tmp/event.sock",
		  "expire": "never",
		},
		{
		  "socket": "udp:127.0.0.1:8888",
		  "expire": 1100,
		  "ttl": 1046
		}
	\]
  } 
}

    # opensips-cli -x mi subscribers_list E_RTPPROXY_STATUS unix:/tmp/event.sock
{
  "Event": {
	"name": "E_RTPPROXY_STATUS",
	"id": 1,
	"Subscriber": {
	  "socket": "unix:/tmp/event.sock",
	  "expire": "never"
	}
  } 
}
```

## `uptime`

Prints various time information about OpenSIPS - when it started to run, for how long it runs.

**Returns:** Three items: "Now" - current time; "Up since" - start time ; "Up time" - number of seconds since started.

**Example.** Get uptime information

```bash
# opensips-cli -x mi uptime
{
    "Now": "Mon Jul 21 17:41:03 2008",
    "Up since": "Mon Jul 21 17:36:33 2008",
    "Up time": "270 \[sec\]"
}
```

## `version`

Prints the version string of a runningOpenSIPS.

**Returns:** One item (named "Server") containing the version string.

**Example.** Get version

```bash
# opensips-cli -x mi version
{
    "Server": "OpenSIPS (3.4.0-dev (x86_64/linux))"
}
```

## `which`

Prints all available MI commands from the queried OpenSIPSinstance.

**Returns:** An array of the names of available MI commands.

**Example.** List available MI commands

```bash
# opensips-cli -x mi which
\[
    "get_statistics",
    "list_statistics",
    "reset_statistics",
    "uptime",
    "version",
    "pwd",
    "arg",
    "which",
    "ps",
    "kill",
    "log_level",
    "xlog_level",
    "shm_check",
    "cache_store",
    "cache_fetch",
    "cache_remove",
    "event_subscribe",
    "events_list",
...
```

## `xlog_level`

Get or set the global xlogging level in OpenSIPS processes. If no argument is passed to the xlog_level command, it will print the current xlog_level. If a logging level is given, it will be globally set for all OpenSIPS processes.

**Parameters:**

- `level` *(integer, optional)* — Logging level

**Returns:** None

**Example.** Set xlog level

```bash
# opensips-cli -x mi xlog_level -2
```
