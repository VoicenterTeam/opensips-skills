# ratelimit Module Reference
<!-- generated-from: data/3.6/modules/ratelimit.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 ratelimit module. Read this file when configuring or debugging the ratelimit module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements rate limiting for SIP requests. In contrast to the PIKE module this limits the flow based on a per SIP request type basis and not per source IP. The latest sources allow you to dynamically group several messages into some entities and limit the traffic based on them. The MI interface can be used to change tunables while running OpenSIPS.

## How It Works

This module is integrated with the OpenSIPS Key-Value Interface, providing support for distributed rate limiting using Redis or Memcached CacheDB backends. The internal limiting data will no longer be kept on each OpenSIPS instance. It will be stored in the distributed Key-Value database and queried by each instance before deciding if a SIP message should be blocked or not.

To achieve a distributed ratelimit feature, the module can also replicate its pipes counters to different OpenSIPS instances using the clusterer module. To do that, define the _pipe\_replication\_cluster_ parameter in your configuration script.

Starting with OpenSIPS 3.2, choosing whether to replicate a pipe over CacheDB backends or bin replication is triggered by the flags specified when the pipe is created: adding the _/r_ suffix to the pipe's name will replicate through CacheDB, and adding _/b_ will replicate through bin/clusterer.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `cachedb_url` (string)

Enables distributed rate limiting and specifies the backend that should be used by the CacheDB interface.

*Default value is disabled.*

**Example.** redis://root:root@127.0.0.1/.

```opensips
modparam("ratelimit", "cachedb\_url", "redis://root:root@127.0.0.1/")
```
### `db_prefix` (string)

Specifies what prefix should be added to the pipe name. This is only used when distributed rate limiting is enabled.

*Default value is rl\_pipe\_.*

**Example.** ratelimit\_.

```opensips
modparam("ratelimit", "db\_prefix", "ratelimit\_")
```
### `default_algorithm` (string)

Specifies which algorithm should be assumed in case it isn't explicitly specified in the _rl\_check_ function.

*Default value is "TAILDROP".*

**Example.** "RED".

```opensips
modparam("ratelimit", "default\_algorithm", "RED")
```
### `expire_time` (integer)

This parameter specifies how long a pipe should be kept in memory after it becomes idle (no more operations are performed on the pipe) until deleted.

*Default value is 3600.*

**Example.** 1800.

```opensips
modparam("ratelimit", "expire\_time", 1800)
```
### `hash_size` (integer)

The size of the hash table internally used to keep the pipes. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

*Default value is 1024.*

**Example.** 512.

```opensips
modparam("ratelimit", "hash\_size", 512)
```
### `limit_per_interval` (integer)

This parameter configures the way that a pipe's limit is specified in the _rl\_check_ function and only affects the Taildrop and RED algorithms. A value of 1 means that the limit is set per-_timer\_interval_ while a value of 0 means per-second.

*Default value is 0(limit per-second).*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("ratelimit", "limit\_per\_interval", 1)
```
### `pipe_replication_cluster` (integer)

Specifies the cluster ID where pipes will be replicated to and received from.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("ratelimit", "pipe\_replication\_cluster", 1)
```
### `repl_buffer_threshold` (string)

Used to specify the length of the buffer used by the binary replication, in bytes, when a flush should be performed - the pipes gathered until then should be sent on the network. This is used to avoid using large amount of memory for pipes replication.

*Default value is 32767 bytes.*

**Example.** 500.

```opensips
modparam("ratelimit", "repl\_buffer\_threshold", 500)
```
### `repl_timer_expire` (string)

Timer in seconds, used to specify when the counter received from a different instance should no longer be taken into account. This is used to prevent obsolete values, in case an instance stops replicating its counters.

*Default value is 10 s.*

**Example.** 10.

```opensips
modparam("ratelimit", "repl\_timer\_expire", 10)
```
### `repl_timer_interval` (string)

Timer in milliseconds, used to specify how often the module should replicate its counters to the other instances.

*Default value is 200 ms.*

**Example.** 100.

```opensips
modparam("ratelimit", "repl\_timer\_interval", 100)
```
### `slot_period` (int)

Value of one slot in milliseconds. This parameter determines how granular the algorithm should be. The number of slots will be determined by window\_size/slot\_period.

*Default value is “200”.*

**Example.** 100.

```opensips
modparam("ratelimit", "window\_size", 5)
#we will have 50 slots of 100 milliseconds
modparam("ratelimit", "slot\_period", 100)
```
### `timer_interval` (integer)

The timer interval in seconds when the Network and Feedback algorithms run their queries, and the other algorithms reset their counters.

*Default value is 10.*

**Notes:** A too small value may lead to performance penalties due to timer process overloading.

**Example.** 5.

```opensips
modparam("ratelimit", "timer\_interval", 5)
```
### `window_size` (int)

How long the history in SBT should be in seconds.

*Default value is “10”.*

**Example.** 5.

```opensips
modparam("ratelimit", "window\_size", 5)
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

**Example.** perform a pipe match for all INVITE methods using RED algorithm.

```opensips
...
	# perform a pipe match for all INVITE methods using RED algorithm
	if (is\_method("INVITE")) {
		if (!rl\_check("pipe\_INVITE", 100, "RED")) {
			sl\_send\_reply(503, "Server Unavailable");
			exit;
		};
	};
...
```

**Example.** use default algorithm for each different gateway.

```opensips
...
	# use default algorithm for each different gateway
	$var(limit) = 10;
	if (!rl\_check("gw\_$ru", $var(limit))) {
		sl\_send\_reply(503, "Server Unavailable");
		exit;
	};
...
```

**Example.** count only successful calls.

```opensips
...
	# count only successful calls
	if (!rl\_check("gw\_$ru", 100)) {
		rl\_dec\_count("gw\_$ru");
		sl\_send\_reply(503, "Server Unavailable");
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

**Example.** rl_dec_count usage.

```opensips
...
	if (!rl\_check("gw\_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl\_dec\_count("gw\_$ru");
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

**Example.** rl_reset_count usage.

```opensips
...
	if (!rl\_check("gw\_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl\_reset\_count("gw\_$ru");
	};
...
```

### `rl_values(ret_avp, regexp)`

Returns all the available pipes' names in the _ret_avp_ output variable.

**Parameters:**

- `regexp` *(regex, optional)* — a regular expression used to filter the names of the pipes. If missing, all the pipes are returned.
- `ret_avp` *(string, required)* — an AVP where the pipes' names will be stored.

**Usable from:** any route

**Example.** rl_values usage.

```opensips
...
	rl\_values($avp(values));
	for ($var(pipe) in $(avp(values)[*]))
		xlog("RATELIMIT: $var(pipe): $rl\_count($var(pipe))\\n");
...
```

## Exported Pseudo-Variables

### `$rl_count(name)`

Returns the counter of a pipe. The variable is read-only. NULL will be returned if the pipe does not exist.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** 

## Exported MI Functions

### `rl_bin_status`

Dumps each destination used for replication, as well as the timestamp of the last message received from them.

**Example.**

```opensips
opensips-cli -x mi rl_bin_status
```

### `rl_dump_pipe`

Exposes all the details about the current runtime data (specific to the pipe's algorithm) of a pipe. Currently make sense for SBT.

**Parameters:**

- `pipe` *(string, required)* — indicates the name of the pipe.

**Example.**

```opensips
opensips-cli -x mi rl_dump_pipe gw_10.0.0.1
```

### `rl_get_pid`

Gets the list of in use PID Controller parameters.

**Example.**

```opensips
opensips-cli -x mi rl_get_pid
```

### `rl_list`

Lists the parameters and variabiles in the ratelimit module.

Note that you cannot combine multiple paramters when calling this function. If using parameters, only one is accepted.

If no parameter are passed to the function, all the active pipes are listed.

**Parameters:**

- `filter` *(string, optional)* — a pattern used to filter the active pipes to be listed. The filter is a shell wildcard pattern (see glob(7)).
- `filter_out` *(string, optional)* — a pattern used to filter out the active pipes NOT to be listed. The filter is a shell wildcard pattern (see glob(7)).
- `pipe` *(string, optional)* — indicates the name of the single pipe to be listed.

**Example.**

```opensips
opensips-cli -x mi rl_list pipe=gw_10.0.0.1
```

**Example.**

```opensips
opensips-cli -x mi rl_list filter=gw_*
```

### `rl_reset_pipe`

Resets the counter of a specified pipe.

**Parameters:**

- `pipe` *(string, required)* — indicates the name of the pipe whose counter should be reset.

**Example.**

```opensips
opensips-cli -x mi rl_reset_pipe gw_10.0.0.1
```

### `rl_set_pid`

Sets the PID Controller parameters for the Feedback Algorithm.

**Parameters:**

- `kd` *(number, required)* — the derivative parameter.
- `ki` *(number, required)* — the integral parameter.
- `kp` *(number, required)* — the proportional parameter.

**Example.**

```opensips
opensips-cli -x mi rl_set_pid 0.5 0.5 0.5
```

## Configuration Examples

### Sample configuration snippet

A sample configuration snippet demonstrating basic rl_check usage.

```opensips
...
	if (!rl\_check($rU, 50, "TAILDROP")) {
		sl\_send\_reply(503, "Server Unavailable");
		exit;
	};
...
```

Upon every incoming request listed above rl_check is invoked and the entity identified by the R-URI user is checked. It returns an OK code if the current per request load is below the configured threshold. If the load is exceeded the function returns an error and an administrator can discard requests with a stateless response.
### Example 1.1. Set timer_interval parameter

Set timer_interval parameter

```opensips
...
modparam("ratelimit", "timer\_interval", 5)
...
```

The timer interval in seconds when the Network and Feedback algorithms run their queries, and the other algorithms reset their counters.
### Example 1.2. Set limit_per_interval parameter

Set limit_per_interval parameter

```opensips
...
modparam("ratelimit", "limit\_per\_interval", 1)
...
```

This parameter configures the way that a pipe's limit is specified in the rl_check function and only affects the Taildrop and RED algorithms. A value of 1 means that the limit is set per-timer_interval while a value of 0 means per-second.
### Example 1.3. Set expire_time parameter

Set expire_time parameter

```opensips
...
modparam("ratelimit", "expire\_time", 1800)
...
```

This parameter specifies how long a pipe should be kept in memory after it becomes idle (no more operations are performed on the pipe) until deleted.
### Example 1.4. Set hash_size parameter

Set hash_size parameter

```opensips
...
modparam("ratelimit", "hash\_size", 512)
...
```

The size of the hash table internally used to keep the pipes. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.
### Example 1.5. Set default_algorithm parameter

Set default_algorithm parameter

```opensips
...
modparam("ratelimit", "default\_algorithm", "RED")
...
```

Specifies which algorithm should be assumed in case it isn't explicitly specified in the rl_check function.
### Example 1.6. Set cachedb_url parameter

Set cachedb_url parameter

```opensips
...
modparam("ratelimit", "cachedb\_url", "redis://root:root@127.0.0.1/")
...
```

Enables distributed rate limiting and specifies the backend that should be used by the CacheDB interface.
### Example 1.7. Set db_prefix parameter

Set db_prefix parameter

```opensips
...
modparam("ratelimit", "db\_prefix", "ratelimit\_")
...
```

Specifies what prefix should be added to the pipe name. This is only used when distributed rate limiting is enabled.
### Example 1.8. Set repl_buffer_threshold parameter

Set repl_buffer_threshold parameter

```opensips
...
modparam("ratelimit", "repl\_buffer\_threshold", 500)
...
```

Used to specify the length of the buffer used by the binary replication, in bytes, when a flush should be performed - the pipes gathered until then should be sent on the network.
### Example 1.9. Set repl_timer_interval parameter

Set repl_timer_interval parameter

```opensips
...
modparam("ratelimit", "repl\_timer\_interval", 100)
...
```

Timer in milliseconds, used to specify how often the module should replicate its counters to the other instances.
### Example 1.10. Set repl_timer_expire parameter

Set repl_timer_expire parameter

```opensips
...
modparam("ratelimit", "repl\_timer\_expire", 10)
...
```

Timer in seconds, used to specify when the counter received from a different instance should no longer be taken into account.
### Example 1.11. Set pipe_replication_cluster parameter

Set pipe_replication_cluster parameter

```opensips
...
modparam("ratelimit", "pipe\_replication\_cluster", 1)
...
```

Specifies the cluster ID where pipes will be replicated to and received from.
### Example 1.12. Set window_size parameter

Set window_size parameter

```opensips
...
modparam("ratelimit", "window\_size", 5)
...
```

How long the history in SBT should be in seconds.
### Example 1.13. Set slot_period parameter

Set slot_period parameter

```opensips
...
modparam("ratelimit", "window\_size", 5)
#we will have 50 slots of 100 milliseconds
modparam("ratelimit", "slot\_period", 100)
...
```

Value of one slot in milliseconds. This parameter determines how granular the algorithm should be. The number of slots will be determined by window_size/slot_period.
### Example 1.14. rl_check usage

Demonstrates various ways to use the rl_check function.

```opensips
...
	# perform a pipe match for all INVITE methods using RED algorithm
	if (is\_method("INVITE")) {
		if (!rl\_check("pipe\_INVITE", 100, "RED")) {
			sl\_send\_reply(503, "Server Unavailable");
			exit;
		};
	};
...
	# use default algorithm for each different gateway
	$var(limit) = 10;
	if (!rl\_check("gw\_$ru", $var(limit))) {
		sl\_send\_reply(503, "Server Unavailable");
		exit;
	};
...
	# count only successful calls
	if (!rl\_check("gw\_$ru", 100)) {
		rl\_dec\_count("gw\_$ru");
		sl\_send\_reply(503, "Server Unavailable");
		exit;
	};
...
```

Check the current request against the pipe identified by name and changes/updates the limit. If no pipe is found, then a new one is created with the specified limit and algorithm, if specified.
### Example 1.15. rl_dec_count usage

Demonstrates how to decrease a pipe counter.

```opensips
...
	if (!rl\_check("gw\_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl\_dec\_count("gw\_$ru");
	};
...
```

This function decreases a counter that could have been previously increased by rl_check function.
### Example 1.16. rl_reset_count usage

Demonstrates how to reset a pipe counter.

```opensips
...
	if (!rl\_check("gw\_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl\_reset\_count("gw\_$ru");
	};
...
```

This function resets a counter that could have been previously increased by rl_check function.
### Example 1.17. rl_values usage

Demonstrates how to retrieve and iterate through pipe names.

```opensips
...
	rl\_values($avp(values));
	for ($var(pipe) in $(avp(values)\[\*\]))
		xlog("RATELIMIT: $var(pipe): $rl\_count($var(pipe))\\n");
...
```

Returns all the available pipes' names in the ret_avp output variable.
