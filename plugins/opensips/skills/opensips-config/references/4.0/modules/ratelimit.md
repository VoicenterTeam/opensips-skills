# ratelimit Module Reference
<!-- generated-from: data/4.0/modules/ratelimit.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 ratelimit module. Read this file when configuring or debugging the ratelimit module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements rate limiting for SIP requests. In contrast to the PIKE module this limits the flow based on a per SIP request type basis and not per source IP. The latest sources allow you to dynamically group several messages into some entities and limit the traffic based on them. The MI interface can be used to change tunables while running OpenSIPS.

This module is integrated with the OpenSIPS Key-Value Interface, providing support for distributed rate limiting using Redis or Memcached CacheDB backends. The internal limiting data will no longer be kept on each OpenSIPS instance. It will be stored in the distributed Key-Value database and queried by each instance before deciding if a SIP message should be blocked or not.

To achieve a distributed ratelimit feature, the module can also replicate its pipes counters to different OpenSIPS instances using the clusterer module. To do that, define the _pipe_replication_cluster_ parameter in your configuration script.

Starting with OpenSIPS 3.2, choosing whether to replicate a pipe over CacheDB backends or bin replication is triggered by the flags specified when the pipe is created: adding the _/r_ suffix to the pipe's name will replicate through CacheDB, and adding _/b_ will replicate through bin/clusterer.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `bridge_repl_timer_expire` (string)

Timer in seconds, used to specify when the counter received from a different cluster should no longer be taken into account. This is used to prevent obsolete values, in case an entire cluster (data center) is down and stops replicating its counters.

*Default value is 20 s.*

**Example.** 20.

```opensips
modparam("ratelimit", "bridge_repl_timer_expire", 20)
```
### `bridge_repl_timer_interval` (string)

Timer in milliseconds, used to specify how often the module should replicate its cluster-local counters to remote clusters, if bridged replication is in use, as long as it holds the required sharing tag(s).

*Default value is 500 ms.*

**Example.** 500.

```opensips
modparam("ratelimit", "bridge_repl_timer_interval", 500)
```
### `bridge_replication` (boolean)

Enable the cluster-bridge replication feature, if applicable (e.g. the current pipe_replication_cluster has at least one bridge definition to a foreign cluster).

*Default value is false.*

**Example.** true.

```opensips
modparam("ratelimit", "bridge_replication", true)
```
### `cachedb_url` (string)

Enables distributed rate limiting and specifies the backend that should be used by the CacheDB interface.

*Default value is disabled.*

**Example.** redis://root:root@127.0.0.1/.

```opensips
modparam("ratelimit", "cachedb_url", "redis://root:root@127.0.0.1/")
```
### `db_prefix` (string)

Specifies what prefix should be added to the pipe name. This is only used when distributed rate limiting is enabled.

*Default value is rl_pipe_.*

**Example.** ratelimit_.

```opensips
modparam("ratelimit", "db_prefix", "ratelimit_")
```
### `default_algorithm` (string)

Specifies which algorithm should be assumed in case it isn't explicitly specified in the _rl_check_ function.

*Default value is "TAILDROP".*

**Example.** "RED".

```opensips
modparam("ratelimit", "default_algorithm", "RED")
```
### `expire_time` (integer)

This parameter specifies how long a pipe should be kept in memory after it becomes idle (no more operations are performed on the pipe) until deleted.

*Default value is 3600.*

**Example.** 1800.

```opensips
modparam("ratelimit", "expire_time", 1800)
```
### `hash_size` (integer)

The size of the hash table internally used to keep the pipes. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

*Default value is 1024.*

**Notes:** The hash size must be a power of 2 number.

**Example.** 512.

```opensips
modparam("ratelimit", "hash_size", 512)
```
### `limit_per_interval` (integer)

This parameter configures the way that a pipe's limit is specified in the _rl_check_ function and only affects the Taildrop and RED algorithms. A value of 1 means that the limit is set per-_timer_interval_ while a value of 0 means per-second.

*Default value is 0(limit per-second).*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("ratelimit", "limit_per_interval", 1)
```
### `pipe_replication_cluster` (integer)

Specifies the cluster ID where pipes will be replicated to and received from.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("ratelimit", "pipe_replication_cluster", 1)
```
### `repl_buffer_threshold` (string)

Used to specify the length of the buffer used by the binary replication, in bytes, when a flush should be performed - the pipes gathered until then should be sent on the network. This is used to avoid using large amount of memory for pipes replication.

*Default value is 32767 bytes..*

**Example.** 500.

```opensips
modparam("ratelimit", "repl_buffer_threshold", 500)
```
### `repl_timer_expire` (string)

Timer in seconds, used to specify when the counter received from a different instance should no longer be taken into account. This is used to prevent obsolete values, in case an instance stops replicating its counters.

*Default value is 10 s..*

**Example.** 10.

```opensips
modparam("ratelimit", "repl_timer_expire", 10)
```
### `repl_timer_interval` (string)

Timer in milliseconds, used to specify how often the module should replicate its counters to the other instances.

*Default value is 200 ms..*

**Example.** 100.

```opensips
modparam("ratelimit", "repl_timer_interval", 100)
```
### `slot_period` (integer)

Value of one slot in milliseconds. This parameter determines how granular the algorithm should be. The number of slots will be determined by window_size/slot_period.

*Default value is 200.*

**Example.** 100.

```opensips
...
modparam("ratelimit", "window_size", 5)
#we will have 50 slots of 100 milliseconds
modparam("ratelimit", "slot_period", 100)
...
```
### `timer_interval` (integer)

The timer interval in seconds when the Network and Feedback algorithms run their queries, and the other algorithms reset their counters.

IMPORTANT: A too small value may lead to performance penalties due to timer process overloading.

*Default value is 10.*

**Example.** 5.

```opensips
modparam("ratelimit", "timer_interval", 5)
```
### `window_size` (int)

How long the history in SBT should be in seconds.

*Default value is “10”.*

**Example.** 5.

```opensips
modparam("ratelimit", "window_size", 5)
```

## Exported Functions

### `rl_check(name, limit[, algorithm])`

Check the current request against the pipe identified by name and changes/updates the limit. If no pipe is found, then a new one is created with the specified limit and algorithm, if specified. If the algorithm parameter doesn't exist, the default one is used.

NOTE: A pipe's algorithm cannot be dynamically changed. Only the one specified when the pipe was created will be considered.

NOTE: This function increments the pipe's counter every time it is called, even if the call should be declined. Therefore If you are using ratelimit to limit only successful traffic, you need to explicitely decrease the counter for the declined calls using the _rl_dec_count()_ function.

**Parameters:**

- `algorithm` *(string, optional)* — this parameter reffers to the algorithm used to check the pipe. If it is not set, the default value is used.
- `limit` *(int, required)* — this specifies the threshold limit of the pipe. It is strongly related to the algorithm used. Note that the limit should be specified as per-second, not per-timer_interval.
- `name` *(string, required)* — this is the name that identifies the pipe which should be checked. One can also specify the _/s_ suffix to indicate the pipe should be replicated over cached, or _/b_ to replicate over bin/clusterer interface.

**Return codes:**

- `error code` — if the limit for the matched pipe is reached

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `rl_dec_count`

**Example.** Example 1.17. `rl_check` usage.

```opensips
...
	# perform a pipe match for all INVITE methods using RED algorithm
	if (is_method("INVITE")) {
		if (!rl_check("pipe_INVITE", 100, "RED")) {
			sl_send_reply(503, "Server Unavailable");
			exit;
		};
	};
...
	# use default algorithm for each different gateway
	$var(limit) = 10;
	if (!rl_check("gw_$ru", $var(limit))) {
		sl_send_reply(503, "Server Unavailable");
		exit;
	};
...
	# count only successful calls
	if (!rl_check("gw_$ru", 100)) {
		rl_dec_count("gw_$ru");
		sl_send_reply(503, "Server Unavailable");
		exit;
	};
...
```

### `rl_dec_count(name)`

This function decreases a counter that could have been previously increased by _rl_check_ function.

**Parameters:**

- `name` *(string, required)* — identifies the name of the pipe.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `rl_check`

**Example.** Example 1.18. `rl_dec_count` usage.

```opensips
...
	if (!rl_check("gw_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl_dec_count("gw_$ru");
	};
...
```

### `rl_reset_count(name)`

This function resets a counter that could have been previously increased by _rl_check_ function.

**Parameters:**

- `name` *(string, required)* — identifies the name of the pipe.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `rl_check`

**Example.** Example 1.19. `rl_reset_count` usage.

```opensips
...
	if (!rl_check("gw_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl_reset_count("gw_$ru");
	};
...
```

### `rl_values(ret_avp, regexp)`

Returns all the available pipes' names in the _ret_avp_ output variable.

**Parameters:**

- `regexp` *(regex, optional)* — a regular expression used to filter the names of the pipes. If missing, all the pipes are returned.
- `ret_avp` *(string, required)* — an AVP where the pipes' names will be stored.

**Usable from:** any route

**Example.** Example 1.20. `rl_values` usage.

```opensips
...
	rl_values($avp(values));
	for ($var(pipe) in $(avp(values)[*]))
		xlog("RATELIMIT: $var(pipe): $rl_count($var(pipe))\n");
...
```

## Exported Pseudo-Variables

### `$rl_count(name)`

Returns the counter of a pipe. The variable is read-only.

NULL will be returned if the pipe does not exist.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** 

## Exported MI Functions

### `ratelimit:dump_pipe`

Replaces obsolete MI command: _rl_dump_pipe_.

Exposes all the details about the current runtime data (specific to the pipe's algorithm) of a pipe. Currently make sense for SBT.

**Parameters:**

- `pipe` *(string, required)* — indicates the name of the pipe.

**Example.**

```opensips-cli
		opensips-cli -x mi ratelimit:dump_pipe gw_10.0.0.1
```

### `ratelimit:get_pid`

Replaces obsolete MI command: _rl_get_pid_.

Gets the list of in use PID Controller parameters.

**Example.**

```opensips-cli
		opensips-cli -x mi ratelimit:get_pid
```

### `ratelimit:list`

Replaces obsolete MI command: _rl_list_.

Lists the parameters and variabiles in the ratelimit module.

Note that you cannot combine multiple paramters when calling this function. If using parameters, only one is accepted.

If no parameter are passed to the function, all the active pipes are listed.

**Parameters:**

- `filter` *(string, optional)* — a pattern used to filter the active pipes to be listed. The filter is a shell wildcard pattern (see glob(7)).
- `filter_out` *(string, optional)* — a pattern used to filter out the active pipes NOT to be listed. The filter is a shell wildcard pattern (see glob(7)).
- `pipe` *(string, optional)* — indicates the name of the single pipe to be listed.

**Example.**

```opensips-cli
		opensips-cli -x mi ratelimit:list pipe=gw_10.0.0.1
```

**Example.**

```opensips-cli
		opensips-cli -x mi ratelimit:list filter=gw_*
```

### `ratelimit:reset_pipe`

Replaces obsolete MI command: _rl_reset_pipe_.

Resets the counter of a specified pipe.

**Parameters:**

- `pipe` *(string, required)* — indicates the name of the pipe whose counter should be reset.

**Example.**

```opensips-cli
		opensips-cli -x mi ratelimit:reset_pipe gw_10.0.0.1
```

### `ratelimit:set_pid`

Replaces obsolete MI command: _rl_set_pid_.

Sets the PID Controller parameters for the Feedback Algorithm.

**Parameters:**

- `kd` *(number, required)* — the derivative parameter.
- `ki` *(number, required)* — the integral parameter.
- `kp` *(number, required)* — the proportional parameter.

**Example.**

```opensips-cli
		opensips-cli -x mi ratelimit:set_pid 0.5 0.5 0.5
```

### `rl_bin_status`

Dumps each destination used for replication, as well as the timestamp of the last message received from them.

**Example.**

```opensips-cli
		opensips-cli -x mi rl_bin_status
```

## Configuration Examples

### Set `timer_interval` parameter

The timer interval in seconds when the Network and Feedback algorithms run their queries, and the other algorithms reset their counters.

```opensips
...
modparam("ratelimit", "timer_interval", 5)
...
```
### Set `limit_per_interval` parameter

This parameter configures the way that a pipe's limit is specified in the _rl_check_ function and only affects the Taildrop and RED algorithms. A value of 1 means that the limit is set per-_timer_interval_ while a value of 0 means per-second.

```opensips
...
modparam("ratelimit", "limit_per_interval", 1)
...
```
### Set `expire_time` parameter

This parameter specifies how long a pipe should be kept in memory after it becomes idle (no more operations are performed on the pipe) until deleted.

```opensips
...
modparam("ratelimit", "expire_time", 1800)
...
```
### Set `hash_size` parameter

The size of the hash table internally used to keep the pipes. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

```opensips
...
modparam("ratelimit", "hash_size", 512)
...
```
### Set `default_algorithm` parameter

Specifies which algorithm should be assumed in case it isn't explicitly specified in the _rl_check_ function.

```opensips
...
modparam("ratelimit", "default_algorithm", "RED")
...
```
### Set `cachedb_url` parameter

Enables distributed rate limiting and specifies the backend that should be used by the CacheDB interface.

```opensips
...
modparam("ratelimit", "cachedb_url", "redis://root:root@127.0.0.1/")
...
```
### Set `db_prefix` parameter

Specifies what prefix should be added to the pipe name. This is only used when distributed rate limiting is enabled.

```opensips
...
modparam("ratelimit", "db_prefix", "ratelimit_")
...
```
### Set `repl_buffer_threshold` parameter

Used to specify the length of the buffer used by the binary replication, in bytes, when a flush should be performed - the pipes gathered until then should be sent on the network. This is used to avoid using large amount of memory for pipes replication.

```opensips
...
modparam("ratelimit", "repl_buffer_threshold", 500)
...
```
### Set `repl_timer_interval` parameter

Timer in milliseconds, used to specify how often the module should replicate its counters to the other instances.

```opensips
...
modparam("ratelimit", "repl_timer_interval", 100)
...
```
### Set `repl_timer_expire` parameter

Timer in seconds, used to specify when the counter received from a different instance should no longer be taken into account. This is used to prevent obsolete values, in case an instance stops replicating its counters.

```opensips
...
modparam("ratelimit", "repl_timer_expire", 10)
...
```
### Set `pipe_replication_cluster` parameter

Specifies the cluster ID where pipes will be replicated to and received from.

```opensips
...
modparam("ratelimit", "pipe_replication_cluster", 1)
...
```
### Set `bridge_replication` parameter

Enable the [cluster-bridge replication](clusterer#bridge_replication) feature, if applicable (e.g. the current [pipe_replication_cluster](#param_pipe_replication_cluster "1.7.11.pipe_replication_cluster (integer)") has at least one bridge definition to a foreign cluster).

```opensips
...
modparam("ratelimit", "bridge_replication", true)
...
```
### Set `bridge_repl_timer_interval` parameter

Timer in milliseconds, used to specify how often the module should replicate its cluster-local counters to remote clusters, if [bridged replication](clusterer#bridge_replication) is in use, as long as it holds the required sharing tag(s).

```opensips
...
modparam("ratelimit", "bridge_repl_timer_interval", 500)
...
```
### Set `bridge_repl_timer_expire` parameter

Timer in seconds, used to specify when the counter received from a different cluster should no longer be taken into account. This is used to prevent obsolete values, in case an entire cluster (data center) is down and stops replicating its counters.

```opensips
...
modparam("ratelimit", "bridge_repl_timer_expire", 20)
...
```
### Set `window_size` parameter

How long the history in SBT should be in seconds.

```opensips
...
modparam("ratelimit", "window_size", 5)
...
```
### Set `slot_period` parameter

Value of one slot in milliseconds. This parameter determines how granular the algorithm should be. The number of slots will be determined by window_size/slot_period.

```opensips
...
modparam("ratelimit", "window_size", 5)
#we will have 50 slots of 100 milliseconds
modparam("ratelimit", "slot_period", 100)
...
```
### `rl_check` usage

Check the current request against the pipe identified by name and changes/updates the limit. If no pipe is found, then a new one is created with the specified limit and algorithm, if specified. If the algorithm parameter doesn't exist, the default one is used.

```opensips
...
	# perform a pipe match for all INVITE methods using RED algorithm
	if (is_method("INVITE")) {
		if (!rl_check("pipe_INVITE", 100, "RED")) {
			sl_send\reply(503, "Server Unavailable");
			exit;
		};
	};
...
	# use default algorithm for each different gateway
	$var(limit) = 10;
	if (!rl_check("gw_$ru", $var(limit))) {
		sl_send\reply(503, "Server Unavailable");
		exit;
	};
...
	# count only successful calls
	if (!rl_check("gw_$ru", 100)) {
		rl_dec_count("gw_$ru");
		sl_send\reply(503, "Server Unavailable");
		exit;
	};
...
```
### `rl_dec_count` usage

This function decreases a counter that could have been previously increased by _rl_check_ function.

```opensips
...
	if (!rl_check("gw_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl_dec_count("gw_$ru");
	};
...
```
### `rl_reset_count` usage

This function resets a counter that could have been previously increased by _rl_check_ function.

```opensips
...
	if (!rl_check("gw_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl_reset_count("gw_$ru");
	};
...
```
### `rl_values` usage

Returns all the available pipes' names in the _ret_avp_ output variable.

```opensips
...
	rl_values($avp(values));
	for ($var(pipe) in $(avp(values)\[\*\]))
		xlog("RATELIMIT: $var(pipe): $rl_count($var(pipe))\\n");
...
```
