# Core MI Commands Reference
<!-- generated-from: data/4.0/core/mi-commands.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: mi_command -->

Reference for OpenSIPs 4.0 core Management Interface (MI) commands. Read this file when looking up command names, parameters, or expected JSON response shapes for runtime control of OpenSIPs.

## Contents

- [`arg`](#arg)
- [`blacklists:add_rule`](#blacklistsadd_rule)
- [`blacklists:check`](#blacklistscheck)
- [`blacklists:check_all`](#blacklistscheck_all)
- [`blacklists:del_rule`](#blacklistsdel_rule)
- [`blacklists:list`](#blacklistslist)
- [`cache:fetch`](#cachefetch)
- [`cache:remove`](#cacheremove)
- [`cache:store`](#cachestore)
- [`evi:list`](#evilist)
- [`evi:raise`](#eviraise)
- [`evi:subscribe`](#evisubscribe)
- [`evi:subscribers`](#evisubscribers)
- [`kill`](#kill)
- [`log_level`](#log_level)
- [`log_level_filter`](#log_level_filter)
- [`log_mute_state`](#log_mute_state)
- [`mem:pkg_dump`](#mempkg_dump)
- [`mem:shm_check`](#memshm_check)
- [`mem:shm_dump`](#memshm_dump)
- [`profiling_proc`](#profiling_proc)
- [`ps`](#ps)
- [`pwd`](#pwd)
- [`reload_routes`](#reload_routes)
- [`statistics:get`](#statisticsget)
- [`statistics:list`](#statisticslist)
- [`statistics:reset`](#statisticsreset)
- [`statistics:reset_all`](#statisticsreset_all)
- [`status_report:get`](#status_reportget)
- [`status_report:identifiers`](#status_reportidentifiers)
- [`status_report:reports`](#status_reportreports)
- [`status_report:status`](#status_reportstatus)
- [`tcp:close`](#tcpclose)
- [`tcp:list`](#tcplist)
- [`uptime`](#uptime)
- [`version`](#version)
- [`which`](#which)
- [`xlog_level`](#xlog_level)

## `arg`

Returns the full list of arguments used when OpenSIPS was started. As in UNIX, the first argument is the name of executable binary.

**Returns:** an array with multiple strings representing the arguments.

**Example.** Example of usage

```shell
# opensips-mi arg
[
    "./opensips",
    "-f",
    "/etc/openser/test.cfg"
]
```

## `blacklists:add_rule`

Adds a rule to a non-readonly blacklist.

**Parameters:**

- `expire` *(integer, optional)* — indicates the number of seconds the rule should expire
- `name` *(string, required)* — the name of the blacklist to add to
- `rule` *(string, required)* — a string containing a blacklist rule, according to dst_blacklist parameter

**Returns:** success or failed object.

**Example.** Examples of usage

```shell
# opensips-mi blacklists:add_rule net_dynamic '!tcp,127.0.0.1,5060'
# opensips-mi blacklists:add_rule net_dynamic '!tcp,127.0.0.1,5060' 3600
```

## `blacklists:check`

The command check whether a proto:IP:port+pattern matches any rule of a blacklist.

**Parameters:**

- `ip` *(string, required)* — the mandatory IP that is used to match the rules
- `name` *(string, required)* — the name of the blacklist to check against
- `pattern` *(string, optional)* — optional pattern to check against the rules
- `port` *(integer, optional)* — the port of the check rule - if missing, 0/any port is used. Note that a 0 port will only match a 0 port rule.
- `proto` *(string, optional)* — protocol of the check rule - if missing, "any" protocol is used. Note that an "any" protocol check can only match an "any" protocol rule.

**Returns:** an object containing the first rule that matched, or an error if nothing matched.

**Example.** Examples of usage

```shell
# opensips-mi blacklists:check net_dynamic 127.0.0.1
# opensips-mi blacklists:check_all net_dynamic udp 127.0.0.1 5060
```

## `blacklists:check_all`

The command returns all the blacklists that match an proto:IP:port+pattern.

**Parameters:**

- `ip` *(string, required)* — the mandatory IP that is used to match the rules
- `pattern` *(string, optional)* — optional pattern to check against the rules
- `port` *(integer, optional)* — the port of the check rule - if missing, 0/any port is used. Note that a 0 port will only match a 0 port rule.
- `proto` *(string, optional)* — protocol of the check rule - if missing, "any" protocol is used. Note that an "any" protocol check can only match an "any" protocol rule.

**Returns:** an array with the names of each blacklist that matched.

**Example.** Examples of usage

```shell
# opensips-mi blacklists:check_all 127.0.0.1
# opensips-mi blacklists:check_all udp 127.0.0.1 5060
```

## `blacklists:del_rule`

Removes a rule from a non-readonly blacklist.

**Parameters:**

- `name` *(string, required)* — the name of the blacklist to remove from
- `rule` *(string, required)* — a string containing a blacklist rule, according to dst_blacklist parameter

**Returns:** success or failed object.

**Example.** Examples of usage

```shell
# opensips-mi blacklists:del_rule net_dynamic '!tcp,127.0.0.1,5060'
```

## `blacklists:list`

The command lists all the defined (static or learned) blacklists from OpenSIPS.

**Parameters:**

- `name` *(string, optional)* — filter and print only rules in a specific blacklist

**Returns:** an array with each object describing the list (name, owner, flags); the "Rules" item is an array with each object member describing the rules (blacklists) for each list (IP/mask, protocol, port, matching regexp, flags).

**Example.** Examples of usage

```shell
# opensips-mi blacklists:list
```

## `cache:fetch`

This command queries for a stored value.

**Parameters:**

- `attr` *(string, required)* — the label associated with the value
- `system` *(string, required)* — cache system to use - for the cache system implemented by OpenSIPS module 'localcache' the value of this parameter should be 'local'

**Returns:** object containing the value if a record is found or 'Value not found' string otherwise.

**Example.** Examples of usage

```shell
# opensips-mi cache:fetch local password_user1
```

## `cache:remove`

This command removes a record from the cache system.

**Parameters:**

- `attr` *(string, required)* — the label associated with the stored value;
- `system` *(string, required)* — cache system to use;

**Returns:** None.

**Example.** Examples of usage

```shell
# opensips-mi cache:remove local password_user1
```

## `cache:store`

This command stores in a cache system a string value.

**Parameters:**

- `attr` *(string, required)* — the label to be associated with this value;
- `expire` *(integer, optional)* — expire time for the stored value;
- `system` *(string, required)* — cache system to use - for the cache system implemented by OpenSIPS module 'localcache' the value of this parameter should be 'local';
- `value` *(string, required)* — the string to be stored;

**Returns:** none.

**Example.** Examples of usage

```shell
# opensips-mi cache:store local password_user1 password
```

## `evi:list`

Lists all the events published through the Event Interface.

**Returns:** None.

**Example.** Examples of usage

```shell
# opensips-mi evi:list
{
    "Events": [
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

## `evi:raise`

Raises an event through the Event Interface using an MI command.

**Parameters:**

- `event` *(string, required)* — event name
- `params` *(string, optional)* — array of elements, or a string consisting of a JSON object containing key-value pairs

**Returns:** None.

**Example.** Examples of usage

```shell
# opensips-mi evi:raise E_PIKE_BLOCKED 127.0.0.1 # array mode
# opensips-mi evi:raise -j '{"event":"E_PIKE_BLOCKED", "params": {"ip":"127.0.0.1"}}' # json Mode
# opensips-cli -x mi -j evi:raise event=E_PIKE_BLOCKED params='{"ip":"127.0.0.1"}' # cli json mode
```

## `evi:subscribe`

Subscribes an external application to a certain event.

**Parameters:**

- `event` *(string, required)* — event name
- `expire` *(integer, optional)* — expire time, in seconds - if absent, the subscription is valid only one hour (3600 s)
- `socket` *(string, required)* — external application socket

**Returns:** None.

**Example.** Examples of usage

```shell
# opensips-mi evi:subscribe E_PIKE_BLOCKED udp:127.0.0.1:8888 1200
```

## `evi:subscribers`

Lists information about the subscribers

**Parameters:**

- `event` *(string, required)* — event name
- `socket` *(string, optional)* — external application socket

**Returns:** If no parameter is specified, then the command returns information about all events and their subscribers. If the event is specified, only the external applications subscribed for that event are returned. If the socket is also specified, only one subscriber information is returned.

**Example.** Examples of usage

```shell
# opensips-mi evi:subscribers
{
  "Events": [{
	  "name": "E_RTPPROXY_STATUS",
	  "id": 1,
	  "subscribers": [
		...
	  ]
	},
	{
	  "name": "E_PIKE_BLOCKED",
	  "id": 2,
	  "subscribers": [
		...
	  ]
	}
  ]
}

    # opensips-mi evi:subscribers E_RTPPROXY_STATUS
{
  "Event": {
	"name": "E_RTPPROXY_STATUS",
	"id": 1,
	"subscribers": [{
		  "socket": "unix:/tmp/event.sock",
		  "expire": "never",
		},
		{
		  "socket": "udp:127.0.0.1:8888",
		  "expire": 1100,
		  "ttl": 1046
		}
	]
  } 
}

    # opensips-mi evi:subscribers E_RTPPROXY_STATUS unix:/tmp/event.sock
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

## `kill`

The command will terminate OpenSIPS (and internal shutdown).

**Returns:** none

**Example.** Examples of usage

```shell
# opensips-mi kill
```

## `log_level`

Get or set the logging level of one or all OpenSIPS processes. If no argument is passed to the log_level command, it will print a table with the current logging levels of all processes. If a logging level is given, it will be set for each process. If pid is also given, the logging level will change only for that process.

**Parameters:**

- `level` *(integer, optional)* — logging level (-3...4)
- `pid` *(integer, optional)* — Unix pid (validated by OpenSIPS)

**Returns:** JSON object with processes or OK/new level.

**Example.** Examples of usage

```shell
# opensips-mi log_level
{
    "Processes": [
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
            "Type": "SIP receiver udp:194.068.4.033:5060"
        },
    ]
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

- `consumer` *(string, optional)* — logging consumer: stderror, syslog or event;
- `log_level_filter` *(integer, optional)* — the log level filter.

**Returns:** JSON object with log level filter or OK.

**Example.** Examples of usage

```shell
# opensips-mi log_level_filter stderror
{
    "Log level filter": 3
}
# opensips-mi log_level_filter stderror 1
"OK"
```

## `log_mute_state`

Get or set the mute state (printing enabled/disabled) of a specific logging "consumer"(stderror, syslog or event). If mute_state is not given, the command will print the current mute state for the specified consumer.

**Parameters:**

- `consumer` *(string, optional)* — logging consumer: stderror, syslog or event;
- `mute_state` *(integer, optional)* — the new mute state: 1 - muted or 0 - unmuted (enabled)

**Returns:** JSON object with mute state or OK.

**Example.** Examples of usage

```shell
# opensips-mi log_mute_state syslog
{
    "mmute state": 0
}
# opensips-mi log_mute_state syslog 1
"OK"
```

## `mem:pkg_dump`

Triggers a pkg memory dump for a given process. The memory dump will written to OpenSIPS's log (syslog or stderr) using the 'memdump' logging level. The global 'memdump' log level may be overwritten by a custom value provided as argument to this command.

**Parameters:**

- `log_level` *(integer, optional)* — a log level to be used for this dump
- `pid` *(integer, required)* — the PID of the process to perform the pkg dump

**Returns:** None.

**Example.** Examples of usage

```shell
# opensips-mi mem:pkg_dump 11854 -1
```

## `mem:shm_check`

Only available with QM_MALLOC + DBG_MALLOC. Fully scans the shared memory pool in order to locate any inconsistencies. If any sign of memory corruption is detected, OpenSIPS will immediately abort.

**Returns:** current number of fragments.

**Example.** Example of usage

```shell
# opensips-mi mem:shm_check
```

## `mem:shm_dump`

Triggers a shm memory dump. The memory dump will written to OpenSIPS's log (syslog or stderr) using the 'memdump' logging level. The global 'memdump' log level may be overwritten by a custom value provided as argument to this command.

**Parameters:**

- `log_level` *(integer, optional)* — a log level to be used for this dump

**Returns:** None.

**Example.** Examples of usage

```shell
# opensips-mi mem:shm_dump -1
```

## `profiling_proc`

Get or set the profiling level globally or per process. If no level is given, the function will list the current profiling level of the specified processes. If level is given, it gives the incremental verbosity level - from the lowest to higher level, we have: 0 OFF, 1 SIP level (I/O reactor, SIP stack -TM, dialog, b2b-, scripting), 2 Extra Processes too (like MI, RTPproxy, HTTPD) and 3 TIMER/FULL (timer job execution). What are the impacted processes may be controlled via the ID (internal ID) or PID ids. If none given, all processes will be impacted by the set/get operation. Also see the E_PROFILING_PROC event used for reporting the profiling data.

**Parameters:**

- `ID or PID` *(integer, optional)* — processes to work with;
- `level` *(integer, optional)* — the new verbosity level (if to be set)

**Returns:** JSON object with processes or OK.

**Example.** Examples of usage

```shell
# opensips-mi mi core:profiling_proc id=8
{
    "Processes": [
        {
            "ID": 8,
            "PID": 3568378,
            "Profiling level": 0,
            "Type": "SIP receiver udp:127.10.0.1:5060"
        }
     ]
}
# opensips-mi core:profiling_proc id=8 level=2
"OK"
```

## `ps`

The command will list all all OpenSIPS processes, along with type and description.

**Returns:** multiple objects, each one containing a process ID (internal), PID (OS) and Type.

**Example.** Examples of usage

```shell
# opensips-mi ps
{
    "Processes": [
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
    ]
}
```

## `pwd`

Prints the working directory of OpenSIPS instance.

**Returns:** a single item containing the working directory full path.

**Example.** Examples of usage

```shell
# opensips-mi pwd
{
    "WD": "/"
}
```

## `reload_routes`

Triggers the reload of the routing block (the routes) from the script during the runtime.

**Returns:** none

## `statistics:get`

Prints the statistics (all, group or one) realtime values.

**Parameters:**

- `statistics` *(array, required)* — an array of the following possible values: "all", "group_name:", "name"

**Returns:** an object containing the names and values of statistic variables.

**Example.** Examples of usage

```shell
# opensips-mi statistics:get rcv_requests
   {
       "core:rcv_requests": 35243
   }
    # opensipsc-cli -x mi statistics:get shmem:      
    {
        "shmem:total_size": 1073741824,
        "shmem:max_used_size": 3389232,
        "shmem:free_size": 1070352592,
        "shmem:used_size": 2808952,
        "shmem:real_used_size": 3389232,
        "shmem:fragments": 3769
    }
    # opensips-mi statistics:get shmem: core:
    ....
```

## `statistics:list`

Prints a list of available statistics in the current configuration of OpenSIPS.

**Parameters:**

- `statistics` *(array, optional)* — an array of the same possible values as for statistics:get MI command, with the exception of "all". Omitting the parameter will list all available statistics.

**Returns:** JSON object with statistics list.

**Example.** Examples of usage

```shell
# opensips-mi statistics:list
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

## `statistics:reset`

Reset (to zero) the value of a statistic variable. Note that not all variables allow reset (depending of the nature of the information they carry - example "shmem:used_size").

**Parameters:**

- `statistics` *(array, required)* — an array of the names of the variables to be reset.

**Returns:** none.

**Example.** Examples of usage

```shell
# opensips-mi statistics:get received_replies
   {
       "tm:received_replies": 14543
   }
    # opensips-mi statistics:reset received_replies
    # opensips-mi statistics:get received_replies
   {
       "tm:received_replies": 0
   }
```

## `statistics:reset_all`

Reset (to zero) the value of all statistic variables that can be reset. Note that not all variables allow reset (depending of the nature of the information they carry - example "shmem:used_size").

**Returns:** none.

**Example.** Examples of usage

```shell
# opensips-mi statistics:reset_all
```

## `status_report:get`

The MI equivalent of the sr_check_status() script function - to get the status of an 'status/report' identifier/group.

**Parameters:**

- `group` *(string, required)* — see the parameters of the sr_check_status() script function.
- `identifier` *(string, optional)* — see the parameters of the sr_check_status() script function.

**Returns:** the readiness, the status and details of the identifier/group

**Example.** Examples of usage

```shell
# opensips-mi status_report:get core
{
    "Readiness": true,
    "Status": 1,
    "Details": "running"
}

# opensips-mi status_report:get drouting all
{
    "Readiness": true,
    "Status": 1,
    "Details": "aggregated"
}
```

## `status_report:identifiers`

Command to list all the existing identifiers in OpenSIPS or only from a certain group.

**Parameters:**

- `group` *(string, optional)* — an optional 'status/report' group, see the sr_check_status() script function for more details. If missing, the identifiers from all the groups will be listed.

**Returns:** an array of groups, each group being an array of identifiers .

**Example.** Examples of usage

```shell
#opensips-mi status_report:identifiers
[
    {
        "Group": "clusterer",
        "Identifiers": [
            "sharing_tags"
        ]
    },
    {
        "Group": "dispatcher",
        "Identifiers": [
            "default;events",
            "default"
        ]
    },
    {
        "Group": "drouting",
        "Identifiers": [
            "Default;events",
            "Default"
        ]
    },
    {
        "Group": "dialplan",
        "Identifiers": [
            "default"
        ]
    },
    {
        "Group": "core",
        "Identifiers": [
            "main"
        ]
    }
]
#opensips-mi status_report:identifiers drouting
{
    "Group": "drouting",
    "Identifiers": [
        "Default;events",
        "Default"
    ]
}
```

## `status_report:reports`

Command to list the full set of reports (logs) collected by 'status/report' identifiers.

**Parameters:**

- `group` *(string, optional)* — an optional 'status/report' group, see the sr_check_status() script function for more details. If missing, all the groups will be listed.
- `identifier` *(string, optional)* — an optional 'identifier'. If missing, all the identifiers within the group will be listed.

**Returns:** the reports/logs for the requested identifiers, or for all identifiers within the groups.

**Example.** Examples of usage

```shell
#opensips-mi status_report:reports 
[
    {
        "Name": "drouting",
        "Identifiers": [
            {
                "Name": "Default",
                "Reports": [
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
                ]
            }
        ]
    },
    {
        "Name": "test",
        "Identifiers": [
            {
                "Name": "main",
                "Reports": []
            }
        ]
    },
    {
        "Name": "core",
        "Identifiers": [
            {
                "Name": "main",
                "Reports": [
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
                ]
            }
        ]
    }
]
```

## `status_report:status`

Command to list the status of the identifiers within one or all 'status/report' groups.

**Parameters:**

- `group` *(string, optional)* — an optional 'status/report' group, see the sr_check_status() script function for more details.

**Returns:** the readiness, the status and details for all the identifiers within the requested group, or within all defined/registered groups.

**Example.** Examples of usage

```shell
#opensips-mi status_report:status 
[
    {
        "Name": "drouting",
        "Identifiers": [
            {
                "Name": "Default",
                "Readiness": true,
                "Status": 1,
                "Details": "data available"
            }
        ]
    },
    {
        "Name": "test",
        "Identifiers": [
            {
                "Name": "main",
                "Readiness": true,
                "Status": 1
            }
        ]
    },
    {
        "Name": "core",
        "Identifiers": [
            {
                "Name": "main",
                "Readiness": true,
                "Status": 1,
                "Details": "running"
            }
        ]
    }
]
```

## `tcp:close`

Command that terminates an ongoing TCP/TLS connection from OpenSIPS.

**Parameters:**

- `ipport` *(string, required)* — ip:port coordinates of the connection

**Returns:** none

**Example.** Examples of usage

```shell
# opensips-mi tcp:close 127.0.0.1:9

you can also terminate by id:

# opensips-mi tcp:close 31646848
```

## `tcp:list`

The command lists all ongoing TCP/TLS connection from OpenSIPS.

**Parameters:**

- `proto` *(string, optional)* — list TCP connections for that specific protocol

**Returns:** an array with one object per connection with the following attributes : ID, type, state, source, destination, lifetime, alias port. For TLS connections, cipher information is also dumped.

**Example.** Examples of usage

```shell
# opensips-mi tcp:list
```

## `uptime`

Prints various time information about OpenSIPS - when it started to run, for how long it runs.

**Returns:** three items: "Now" - current time; "Up since" - start time ; "Up time" - number of seconds since started.

**Example.** Examples of usage

```shell
# opensips-mi uptime
{
    "Now": "Mon Jul 21 17:41:03 2008",
    "Up since": "Mon Jul 21 17:36:33 2008",
    "Up time": "270 [sec]"
}
```

## `version`

Prints the version string of a runningOpenSIPS.

**Returns:** one item (named "Server") containing the version string.

**Example.** Examples of usage

```shell
# opensips-mi version
{
    "Server": "OpenSIPS (4.0.0-dev (x86_64/linux))"
}
```

## `which`

Prints all available MI commands from the queried OpenSIPSinstance.

**Returns:** an array of the names of available MI commands. NOTE that the list of available MI commands may differ depending of what modules your OpenSIPS is using.

**Example.** Examples of usage

```shell
# opensips-mi which
[
    "statistics:get",
    "statistics:list",
    "statistics:reset",
    "uptime",
    "version",
    "pwd",
    "arg",
    "which",
    "ps",
    "kill",
    "log_level",
    "xlog_level",
    "mem:shm_check",
    "cache:store",
    "cache:fetch",
    "cache:remove",
    "evi:subscribe",
    "evi:list",
...
```

## `xlog_level`

Get or set the global xlogging level in OpenSIPS processes. If no argument is passed to the xlog_level command, it will print the current xlog_level. If a logging level is given, it will be globally set for all OpenSIPS processes.

**Parameters:**

- `level` *(integer, optional)* — 

**Returns:** none

**Example.** Example of usage

```shell
# opensips-mi xlog_level -2
```
