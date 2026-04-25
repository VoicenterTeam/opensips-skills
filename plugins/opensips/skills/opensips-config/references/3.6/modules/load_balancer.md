# load_balancer Module Reference
<!-- generated-from: data/3.6/modules/load_balancer.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 load_balancer module. Read this file when configuring or debugging the load_balancer module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The Load-Balancer module comes to provide traffic routing based on load. Shortly, when OpenSIPS routes calls to a set of destinations, it is able to keep the load status (as number of ongoing calls) of each destination and to choose to route to the less loaded destination (at that moment). OpenSIPS is aware of the capacity of each destination - it is preconfigured with the maximum load accepted by the destinations. To be more precise, when routing, OpenSIPS will consider the less loaded destination not the destination with the smallest number of ongoing calls, but the destination with the largest available slot.

Also the module has the capability to do failover (to try a new destination if the selected one does not respond), to keep state of the destinations (to remember the failed destination and avoid using them agai) and to check the health of the destination (by doing probing of the destination and auto re-enabling).

## How It Works

Please refer to the Load-Balancer tutorial from the OpenSIPS website: https://opensips.org/Documentation/Tutorials-LoadBalancing-1-9

## Dependencies

### OpenSIPs Modules

- `Dialog` — Required for module operation
- `database` — One of the DB modules

### External Libraries

None.

### Optional Modules

- `TM - only if probing is enabled`
- `clusterer - only if cluster_id option is enabled`
- `freeswitch - only if fetch_freeswitch_stats is enabled`

## Exported Parameters

### `cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used in load-balancer module for two purposes: for sharing the status of the destinations and for controlling the pinging to destinations. If clustering enbled, the module will automatically share changes over the status of the destinations with the other OpenSIPS instances that are part of a cluster. Whenever such a status changes (following an MI command, a probing result, a script command), the module will replicate this status change to all the nodes in this given cluster. The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to destinations. See the cluster_sharing_tag option. This OpenSIPS cluster exposes the "load_balancer-status-repl" capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have at least one node marked with the "seed" value as the clusterer.flags column/property in order to be fully functional. Consult the clusterer - Capabilities chapter for more details. For more info on how to define and populate a cluster (with OpenSIPS nodes) see the "clusterer" module.

*Default value is 0 (none).*

**Example.** 9.

```opensips
# replicate destination status with all OpenSIPS in cluster ID 9
modparam("load_balancer", "cluster_id", 9)
```
### `cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform the self-triggered actions in the module. Such actions may be the destination probing or sharing the changes in the destination status. If defined, only the node with active status of this tag will perform the actions (pinging and sharing status). The cluster_id must be defined for this option to work. This is an optional parameter. If not set, all the nodes in the cluster will individually do the probing and share the status changes.

*Default value is empty (none).*

**Example.** vip.

```opensips
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("load_balancer", "cluster_id", 9)
modparam("load_balancer", "cluster_sharing_tag", "vip")
```
### `db_table` (string)

The name of the DB table containing the load-balancing rules.

*Default value is “load_balancer”.*

**Example.** lb.

```opensips
modparam("load_balancer", "db_table", "lb")
```
### `db_url` (string)

The URL pointing to the database where the load-balancing rules are stored.

*Default value is “mysql://opensips:opensipsrw@localhost/opensips”.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("load_balancer", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `fetch_freeswitch_stats` (integer)

If enabled, the maximum value of a resource may also consist of FreeSWITCH Event Socket Layer URLs, e.g. "channels=fs://:password@freeswitch.example.com" or "channels=fs://user:password@127.0.0.1:8021". The default ESL port is 8021.

OpenSIPS will establish a connection with the given socket and periodically update the internal maximum value of the given resource using statistics pushed by the FreeSWITCH box.

The max value of a resource is updated every _event_heartbeat_interval_ seconds (see the "freeswitch" OpenSIPS module for more details regarding this setting), as the stats arrive from FreeSWITCH.

Given the following format for FreeSWITCH heartbeat messages:

{
  ...
  "FreeSWITCH-Hostname": "pbx2",
  "FreeSWITCH-IPv4": "172.17.0.3",
  "Idle-CPU": "78.400000",
  "Max-Sessions": "1000",
  "Session-Count": "0",
  ...
}

, the load balancer uses the following formula in order to periodically update its "max_load" values for each FreeSWITCH box (FreeSWITCH data is highlighted in bold):

_max_load = (**Idle-CPU** / 100) \* (**Max-Sessions** - (**Session-Count** - current_load))_

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("load_balancer", "fetch_freeswitch_stats", 1)
```
### `initial_freeswitch_load` (integer)

This parameter is only relevant for some seconds after module startup/reload, when no statistics from newly loaded FreeSWITCH ESL sockets have arrived, yet the routing of calls must remain unaffected. Any FreeSWITCH-enabled resource will inherit this value for the entire interval mentioned above (up to 20 seconds!).

*Default value is 1000.*

**Notes:** Relevant for up to 20 seconds after module startup/reload.

**Example.** 200.

```opensips
modparam("load_balancer", "initial_freeswitch_load", 200)
```
### `lb_define_blacklist` (string)

Defines a blacklist based on a lb group. This list will contain the IPs (no port, all protocols) of the destinations matching the given group.

Multiple instances of this param are allowed.

*Default value is NULL.*

**Notes:** Multiple instances of this param are allowed.

**Example.** list= 1,4,3.

```opensips
modparam("load_balancer", "lb_define_blacklist", "list= 1,4,3")
```
### `probing_from` (string)

The FROM SIP URI to be advertised in the SIP probing requests.

*Default value is “"sip:prober@localhost"”.*

**Example.** sip:pinger@192.168.2.10.

```opensips
modparam("load_balancer", "probing_from", "sip:pinger@192.168.2.10")
```
### `probing_interval` (integer)

How often (in seconds) the probing of a destination should be done. If set to 0, the probing will be disabled as functionality (for all destinations)

*Default value is “30”.*

**Example.** 60.

```opensips
modparam("load_balancer", "probing_interval", 60)
```
### `probing_method` (string)

The SIP method to be used for the probing requests.

*Default value is “"OPTIONS"”.*

**Example.** INFO.

```opensips
modparam("load_balancer", "probing_method", "INFO")
```
### `probing_reply_codes` (string)

A comma separted list of SIP reply codes. The codes defined here will be considered as valid reply codes for probing messages, apart for 200.

*Default value is NULL.*

**Example.** 501, 403.

```opensips
modparam("load_balancer", "probing_reply_codes", "501, 403")
```
### `probing_verbose` (number)

A boolean option to enable extra logging related to the enabling or disabling of the destinations based on probing replies and MI commands.

A 0 value means disabled, anything else means enabled.

The extra logging will be done on INFO level.

*Default value is 0 (disabled).*

**Possible values:**

- 0 (disabled)
- anything else (enabled)

**Example.** 1.

```opensips
modparam("load_balancer", "probing_verbose", 1)
```

## Exported Functions

### `lb_count_call(ip,port,grp,resources[,undo])`

The function counts the current call as load for a given destination with some given resources. Note that this call is not going through the load-balancing logic (there are not routing decision taken for the call); it is simply counted by LB as ongoing call for a destination;

**Parameters:**

- `grp` *(int, required)* — group id for the destinations; if no knows, "-1" will mean all groups.
- `ip` *(string, required)* — IP to identify the destination the call has to be counted for.
- `port` *(int, required)* — PORT to identify the destination the call has to be counted for.
- `resources` *(string, required)* — a semi-colon separated list of resources required by the current call.
- `undo` *(int, optional)* — if set to a non zero value, it will force the function to un-count - actually it will undo the counting of this call as load in the current LB session; this might be needed if we count call for particular resources and then need to un-count it.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** `lb_count_call` usage.

```opensips
# count as load also the calls orgininated by lb destinations
if (lb_is_destination($si,$sp) ) {
	# inbound call from destination
	lb_count_call($si,$sp,-1,"conference");
} else {
	# outbound call to destinations
	if ( !load_balance(1,"conference") ) {
		send_reply(503,"unavailable");
		exit();
	}
	# dst URI points to the new destination
	xlog("sending call to $du\n");
	t_relay();
	exit;
}
```

### `lb_disable_dst()`

Marks as disabled the last destination that was used for the current call. The disabling done via this function will prevent the destination to be used for usage from now on. The probing mechanism can re-enable this peer (see the probing section in the beginning)

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** `lb_disable_dst()` usage.

```opensips
if (t_check_status("(408)|(5\[0-9\]\[0-9\])")) {
	lb_disable_dst();
	if ( lb_next() ) {
		t_on_failure("1");
		xlog("-----------new dst is $du\n");
		t_relay();
	} else {
		t_reply(500,"Error");
	}
}
```

### `lb_is_destination(ip,port,[group],[active],[attrs]])`

Checks if the given IP and PORT belongs to a destination configured in the load-balancer's list. Returns true if found and active (see the "active" parameter).

**Parameters:**

- `active` *(int, optional)* — if "1", the search will be performed only over "active" (not disabled) destinations. If missing, the search will consider any kind of destinations.
- `attrs` *(var, optional)* — a writable variable to be populated with the attributes of the identified destination.
- `group` *(int, optional)* — in what LB group the destination should be looked for; If not specified, the search will be in all groups.
- `ip` *(string, required)* — IP to be checked
- `port` *(int, required)* — PORT to be checked. A value 0 means "any" - will match any port.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** `lb_is_destination` usage.

```opensips
if (lb_is_destination($si,$sp) ) {
	# request from a LB destination
}
```

### `lb_is_started()`

Function to check if there is any ongoing LB session. Returns true if so.

**Usable from:** any type of route

### `lb_next([attrs])`

Function to be used to pull the next available (and less loaded) destination. You need to have an ongoing LB session (started with lb_start()).
This function is mainly used for implementing failover for the LB destinations.

**Parameters:**

- `attrs` *(var, optional)* — a writable variable to be populated with the attributes of the selected destination.

**Return codes:**

- `1 (true)` — if a new destination URI is set, pointing to the selected destination. NOTE that the RURI will not be changed by this function.
- `-1 (false)` — generic internal error (memory allocation, parsing)
- `-2 (false)` — no capacity available (detinations are up and available, but they do not have any availabe channels)
- `-3 (false)` — no more destinations available (the requested resources did not match any active destination)

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** `lb_next()` usage.

```opensips
if (t_check_status("(408)|(5\[0-9\]\[0-9\])")) {
	/* check next available LB destination */
	if ( lb_next() ) {
		t_on_failure("1");
		xlog("-----------new dst is $du\n");
		t_relay();
		exit;
	}
}
```

### `lb_reset()`

Function to stop and flush a current LB session. To be used in failure route, if you want to stop the current LB session (not to try any other destinations from this session) and to start a completly new one.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** `lb_next()` usage.

```opensips
if (t_check_status("(5\[0-9\]\[0-9\])")) {
	/* check next available LB destination */
	if ( lb_next() ) {
		t_on_failure("1");
		xlog("-----------new dst is $du\n");
		t_relay();
		exit;
	}
} else if (t_check_status("(408)")) {
	lb_reset();
	if (lb_start(1,"conference")) {
		t_relay();
		exit;
	}
}
```

### `lb_start(grp,resources[,flags],[attrs])`

The function starts a new load-balancing session over the available destinations. This translates into finding the less loaded destination that can provide the requested resources and belong to a requested group.

**Parameters:**

- `attrs` *(var, optional)* — a writable variable to be populated with the attributes of the selected destination.
- `flags` *(string, optional)* — various flags to controll the LB algorithm ( or computing the available load on the system):
  - `n`
  - `r`
  - `s`
- `grp` *(int, required)* — group id for the destinations; the destination may be grouped in several groups you can you for differnet scenarios.
- `resources` *(string, required)* — a semi-colon separated list of resources required by the current call.

**Return codes:**

- `1 (true)` — if a new destination URI is set, pointing to the selected destination. NOTE that the RURI will not be changed by this function.
- `-1 (false)` — generic internal error (memory allocation, parsing)
- `-2 (false)` — no capacity available (detinations are up and available, but they do not have any availabe channels)
- `-3 (false)` — no destinations available (the requested resources did not match any active destination)
- `-4 (false)` — bad resources (requested resources do not exist)

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** `lb_start` usage.

```opensips
if (lb_start(1,"trascoding;conference")) {
	# dst URI points to the new destination
	xlog("sending call to $du\n");
	t_relay();
	exit;
}
```

### `lb_start_or_next(grp,resources[,flags],[attrs])`

This is just a wrapper function to simplify scripting. If there is no ongoing LB session, it acts as lb_start(); If there is an ongoing LB session, it acts as lb_next().

### `load_balance(grp,resources[,flags],[attrs])`

> **Deprecated.**

Old name of the lb_start_or_next() function.
Take care, this will become obsolete.

## Exported MI Functions

### `lb_list`

Lists all the destinations and the maximum and current load for each resource of the destination.

**Returns:** A list of destinations and their associated resource loads. (structured response — see schema)

**Example.** lb_list usage

```bash
opensips-cli -x mi lb_list
```

### `lb_reload`

Trigers the reload of the load balancing data from the DB.

**Returns:** Returns nothing on success

**Example.** MI FIFO Command Format

```bash
opensips-cli -x mi lb_reload
```

### `lb_resize`

Changes the capacity for a resource of a destination.

**Parameters:**

- `destination_id` *(string, required)* — the ID (as per DB) of the destination.
- `new_capacity` *(integer, required)* — new resource capacity.
- `res_name` *(string, required)* — name of the resource you want to resize.

**Returns:** Returns nothing on success

**Example.** MI FIFO Command Format

```bash
opensips-cli -x mi lb_resize 11 voicemail 56
```

### `lb_status`

Gets or sets the status (enabled or disabled) of a destination.

**Parameters:**

- `destination_id` *(string, required)* — the ID (as per DB) of the destination.
- `new_status` *(integer, optional)* — If no new status is given, the function will return the current status. If a new status is given (0 - disable, 1 - enable), this status will be forced for the destination.

**Returns:** The current or updated status of the destination. (structured response — see schema)

**Example.** Get current status of destination 2

```bash
opensips-cli -x mi lb_status 2
```

**Example.** Enable destination 2

```bash
opensips-cli -x mi lb_status 2 1
```

## Exported Events

### `E_LOAD_BALANCER_STATUS`

This event is raised when the module changes the state of a destination, either through MI or probing.

**Parameters:**

- `group` *(integer)* — the group of the destination.
- `uri` *(string)* — the URI of the destination.
- `status` *(string)* — disabled if the destination was disabled or enabled if the destination is being used.

## Configuration Examples

### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("load_balancer", "db_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `db_table` parameter

Set `db_table` parameter

```opensips
...
modparam("load_balancer", "db_table", "lb")
...
```
### Set `probing_interval` parameter

Set `probing_interval` parameter

```opensips
...
modparam("load_balancer", "probing_interval", 60)
...
```
### Set `probing_method` parameter

Set `probing_method` parameter

```opensips
...
modparam("load_balancer", "probing_method", "INFO")
...
```
### Set `probing_from` parameter

Set `probing_from` parameter

```opensips
...
modparam("load_balancer", "probing_from", "sip:pinger@192.168.2.10")
...
```
### Set `probing_reply_codes` parameter

Set `probing_reply_codes` parameter

```opensips
...
modparam("load_balancer", "probing_reply_codes", "501, 403")
...
```
### Set `probing_verbose` parameter

Set `probing_verbose` parameter

```opensips
...
modparam("load_balancer", "probing_verbose", 1)
...
```
### Set the `lb_define_blacklist` parameter

Set the `lb_define_blacklist` parameter

```opensips
...
modparam("load_balancer", "lb_define_blacklist", "list= 1,4,3")
modparam("load_balancer", "lb_define_blacklist", "blist2= 2,10,6")
...
```
### Set the `fetch_freeswitch_load` parameter

Set the `fetch_freeswitch_load` parameter

```opensips
...
modparam("load_balancer", "fetch_freeswitch_stats", 1)
...
```
### Set the `initial_freeswitch_load` parameter

Set the `initial_freeswitch_load` parameter

```opensips
...
modparam("load_balancer", "initial_freeswitch_load", 200)
...
```
### Set `cluster_id` parameter

Set `cluster_id` parameter

```opensips
...
# replicate destination status with all OpenSIPS in cluster ID 9
modparam("load_balancer", "cluster_id", 9)
...
```
### Set `cluster_sharing_tag` parameter

Set `cluster_sharing_tag` parameter

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("load_balancer", "cluster_id", 9)
modparam("load_balancer", "cluster_sharing_tag", "vip")
...
```
### `lb_start` usage

`lb_start` usage

```opensips
...
if (lb_start(1,"trascoding;conference")) {
	# dst URI points to the new destination
	xlog("sending call to $du\n");
	t_relay();
	exit;
}
...
```
### `lb_next()` usage

`lb_next()` usage

```opensips
...
if (t_check_status("(408)|(5[0-9][0-9])")) {
	/* check next available LB destination */
	if ( lb_next() ) {
		t_on_failure("1");
		xlog("-----------new dst is $du\n");
		t_relay();
		exit;
	}
}
...
```
### `lb_next()` usage

`lb_next()` usage

```opensips
...
if (t_check_status("(5[0-9][0-9])")) {
	/* check next available LB destination */
	if ( lb_next() ) {
		t_on_failure("1");
		xlog("-----------new dst is $du\n");
		t_relay();
		exit;
	}
} else if (t_check_status("(408)")) {
	lb_reset();
	if (lb_start(1,"conference")) {
		t_relay();
		exit;
	}
}
...
```
### `lb_disable_dst()` usage

`lb_disable_dst()` usage

```opensips
...
if (t_check_status("(408)|(5[0-9][0-9])")) {
	lb_disable_dst();
	if ( lb_next() ) {
		t_on_failure("1");
		xlog("-----------new dst is $du\n");
		t_relay();
	} else {
		t_reply(500,"Error");
	}
}
...
```
### `lb_is_destination` usage

`lb_is_destination` usage

```opensips
...
if (lb_is_destination($si,$sp) ) {
	# request from a LB destination
}
...
```
### `lb_count_call` usage

`lb_count_call` usage

```opensips
...
# count as load also the calls orgininated by lb destinations
if (lb_is_destination($si,$sp) ) {
	# inbound call from destination
	lb_count_call($si,$sp,-1,"conference");
} else {
	# outbound call to destinations
	if ( !load_balance(1,"conference") ) {
		send_reply(503,"unavailable");
		exit();
	}
	# dst URI points to the new destination
	xlog("sending call to $du\n");
	t_relay();
	exit;
}
...
```
### `lb_list` usage

`lb_list` usage

```opensips
$ opensips-cli -x mi lb_list
Destination:: sip:127.0.0.1:5100 id=1 enabled=yes auto-re=on
	Resource:: pstn max=3 load=0
	Resource:: transc max=5 load=1
	Resource:: vm max=5 load=2
Destination:: sip:127.0.0.1:5200 id=2 enabled=no auto-re=on
	Resource:: pstn max=6 load=0
	Resource:: trans max=57 load=0
	Resource:: vm max=5 load=0
```
### `lb_status` usage

`lb_status` usage

```opensips
$ opensips-cli -x mi lb_status 2
enable:: no
$ opensips-cli -x mi lb_status 2 1
$ opensips-cli -x mi lb_status 2
enable:: yes
```
