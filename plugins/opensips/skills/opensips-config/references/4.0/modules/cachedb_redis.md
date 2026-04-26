# cachedb_redis Module Reference
<!-- generated-from: data/4.0/modules/cachedb_redis.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 cachedb_redis module. Read this file when configuring or debugging the cachedb_redis module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed to work with a Redis server. It uses hiredis client library to connect to either a single Redis server instance, or to a Redis Server inside a Redis Cluster. It uses the Key-Value interface exported from the core.

## How It Works

Starting with OpenSIPS 3.6, the cachedb_redis module implements the column-oriented cacheDB API functions. This makes it a suitable cacheDB storage in scenarios such as user location federation and full-sharing, which require this API to be available.

The implementation makes use of RedisJSON and RediSearch -- these relatively new features are available in Redis Stack Server, instead of the usual Redis Server (Redis OSS project). More documentation is available on the Redis website.

OpenSIPS will auto-detect availability of the RedisJSON support when necessary and log the appropriate messages.

When connecting to a Redis Cluster, the module automatically detects cluster mode and manages the full slot-to-node topology at runtime. No extra configuration is needed beyond the standard cachedb_url parameter.

### 1.4.1. Topology Discovery

At startup, the module probes the Redis server using the CLUSTER SHARDS command (available in Redis 7.0+). If the server does not support this command, it falls back to CLUSTER SLOTS (available in Redis 3.0+). If neither command succeeds, the connection is treated as a single-instance (non-cluster) connection.

The discovered topology is stored internally in an O(1) slot lookup table (16384 slots), mapping each slot directly to its owning master node.

### 1.4.2. Automatic Topology Refresh

The module automatically refreshes the cluster topology at runtime when any of the following events occur:

* A MOVED redirection is received from a cluster node (indicating a permanent slot migration).
* A connection failure (NULL reply) occurs and the node cannot be reconnected.
* A query targets a slot with no known owner, suggesting the topology is stale.
* An operator triggers a manual refresh via the redis_cluster_refresh MI command.

Automatic refreshes are rate-limited to at most once per second to avoid excessive load on the cluster. The MI-triggered refresh bypasses this rate limit.

### 1.4.3. MOVED Redirection

The module transparently handles Redis Cluster MOVED redirections:

* MOVED — indicates a permanent slot migration. The module updates its slot map, redirects the query to the new node, and triggers a topology refresh so all future queries go directly to the correct node.

If a redirection points to a node that is not yet known, the module dynamically creates a new node entry, establishes a connection, and retries the query.

### 1.4.4. Hash Tags

The module supports Redis Cluster hash tags, which allow related keys to be co-located on the same cluster node. If a key contains a {...} substring, only the content between the first { and the next } is used for hash slot calculation. For example, the keys {user1000}.profile and {user1000}.settings will always land on the same node, enabling multi-key operations.

If the braces are empty ({}) or there is no closing brace, the entire key is hashed as usual.

## Dependencies

### OpenSIPs Modules

- `tls_mgm` — If a use_tls is defined, the tls_mgm and tls_openssl modules will need to be loaded as well (optional)
- `tls_openssl` — If a use_tls is defined, the tls_mgm and tls_openssl modules will need to be loaded as well (optional)

### External Libraries

- `hiredis` — The following libraries or applications must be installed before running OpenSIPS with this module loaded: On the latest Debian based distributions, hiredis can be installed by running 'apt-get install libhiredis-dev' Alternatively, if hiredis is not available on your OS repos, hiredis can be downloaded from: https://github.com/antirez/hiredis . Download the archive, extract sources, run make,sudo make install. If TLS connections are enabled via the use_tls modparam, hiredis needs to be compiled with TLS support.

## Exported Parameters

### `cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to use, from script, the cache_store(), cache_fetch(), etc. operations. It may be set more than once. The prefix part of the URL will be the identifier that will be used from the script.

**Notes:** The module supports three authentication modes based on the URL format: Classic Redis (< 6.0) with requirepass, Redis 6+ ACL with per-user credentials, and Non-authenticated Redis. Starting with this version, the module supports connecting to a local Redis instance via a Unix domain socket instead of TCP. Unix socket connections are always treated as single-instance mode (no Redis Cluster support over Unix sockets). Unix socket cannot be combined with multiple hosts (failover). TLS is not applicable to Unix socket connections.

**Example.** redis:group1://localhost:6379/.

```opensips
# single-instance URLs (Redis Server or Redis Cluster)
modparam("cachedb_redis", "cachedb_url", "redis:group1://localhost:6379/")
modparam("cachedb_redis", "cachedb_url", "redis:cluster1://random_url:8888/")

# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb_redis", "cachedb_url",
	"redis:ha://localhost,host_a:6380,host_b:6381,host_c/")
```
### `connect_timeout` (integer)

This parameter specifies how many milliseconds OpenSIPS should wait for connecting to a Redis node.

*Default value is 5000 ms.*

**Example.** 1000.

```opensips
# wait 1 second for Redis to connect
modparam("cachedb_redis", "connect_timeout",1000)
```
### `ftsearch_index_name` (string)

Only relevant with RedisJSON and RediSearch server-side support.

A global index name to be used for all internal JSON full-text search operations. Future extensions may add, e.g., a connection-level index name setting.

*Default value is idx:usrloc.*

**Example.** ix::usrloc.

```opensips
modparam("cachedb_redis", "ftsearch_index_name", "ix::usrloc")
```
### `ftsearch_json_mset_expire` (integer)

Only relevant with RedisJSON and RediSearch server-side support. A Redis EXPIRE timer to set/refresh on the JSON key after each JSON.MSET operation (create the JSON or add/remove subkeys), in seconds. A value of 0 disables the EXPIRE queries completely.

*Default value is 3600.*

**Example.** 7200.

```opensips
modparam("cachedb_redis", "ftsearch_json_mset_expire", 7200)
```
### `ftsearch_json_prefix` (string)

Only relevant with RedisJSON and RediSearch server-side support.

A key naming prefix for all internally-created Redis JSON objects (e.g. created with JSON.SET or JSON.MSET).

*Default value is usrloc:.*

**Example.** userlocation:.

```opensips
modparam("cachedb_redis", "ftsearch_json_prefix", "userlocation:")
```
### `ftsearch_max_results` (integer)

Only relevant with RedisJSON and RediSearch server-side support.

The maximum number of results returned by each internally-triggered FT.SEARCH JSON lookup query.

*Default value is 10000.*

**Example.** 100.

```opensips
modparam("cachedb_redis", "ftsearch_max_results", 100)
```
### `lazy_connect` (integer)

By setting this parameter to 1, OpenSIPS will defer establishing Redis connections until the first cache operation is actually performed by each worker process. This prevents idle worker processes (those that never use Redis) from holding open sockets, which avoids sockets getting stuck in CLOSE_WAIT state when Redis is restarted.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Notes:** When this parameter is enabled, the shutdown_on_error parameter has no effect, since no connection is attempted at startup time.

**Example.** 1.

```opensips
# defer Redis connections until first use
modparam("cachedb_redis", "lazy_connect", 1)
```
### `query_timeout` (integer)

This parameter specifies how many milliseconds OpenSIPS should wait for a query response from a Redis node.

*Default value is 5000 ms.*

**Example.** 1000.

```opensips
# wait 1 second for Redis queries
modparam("cachedb_redis", "query_timeout",1000)
```
### `redis_keepalive` (integer)

TCP keepalive interval in seconds for Redis connections. When set to a positive value, the kernel sends TCP probes on idle connections to detect dead peers (e.g. due to NAT/firewall idle timeout or network partition). This allows the next query to fail immediately instead of waiting for the full query timeout, enabling faster recovery via the existing retry loop.

Set to 0 to disable TCP keepalive. Recommended to keep enabled for production deployments to prevent silent connection death.

*Default value is 10.*

**Example.** 15.

```opensips
...
# set TCP keepalive interval to 15 seconds
modparam("cachedb_redis", "redis_keepalive", 15)

# disable TCP keepalive
modparam("cachedb_redis", "redis_keepalive", 0)
...
```
### `shutdown_on_error` (integer)

By setting this parameter to 1, OpenSIPS will abort startup if the initial connection to Redis is not possible. Runtime reconnect behavior is unaffected by this parameter, and is always enabled.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Notes:** Runtime reconnect behavior is unaffected by this parameter, and is always enabled.

**Example.** 1.

```opensips
# abort OpenSIPS startup if Redis is down
modparam("cachedb_redis", "shutdown_on_error", 1)
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for Redis connections. In order to enable TLS for a specific connection, you can use the "tls_domain=_dom_name_" URL parameter in the cachedb_url of this module (or other modules that use the CacheDB interface). This should be placed at the end of the URL after the '?' character.

When using this parameter, you must also ensure that tls_mgm is loaded and properly configured. Refer to the tls_mgm module for additional info regarding TLS client domains.

Note that TLS is supported by Redis starting with version 6.0. Also, it is an optional feature enabled at compile time and might not be included in the standard Redis packages available for your OS.

*Default value is 0.*

**Example.** 1.

```opensips
...
modparam("tls_mgm", "client_domain", "redis")
modparam("tls_mgm", "certificate", "[redis]/etc/pki/tls/certs/redis.pem")
modparam("tls_mgm", "private_key", "[redis]/etc/pki/tls/private/redis.key")
modparam("tls_mgm", "ca_list",     "[redis]/etc/pki/tls/certs/ca.pem")
...
modparam("cachedb_redis", "use_tls", 1)
modparam("cachedb_redis", "cachedb_url","redis:tls_group://localhost:6379/?tls_domain=redis")
...
```

## Exported MI Functions

### `redis_cluster_info`

Displays detailed information about all Redis connections managed by the module, including cluster topology, per-node connection status, slot assignments, and per-node query counters.

**Parameters:**

- `group` *(string, optional)* — if specified, only connections belonging to this group will be listed (e.g. "local" from a "redis:local://..." URL). If omitted, all Redis connections are listed.

**Returns:** A JSON array of connection objects. (structured response — see schema)

**Example.** list all Redis connections

```bash
opensips-cli -x mi redis_cluster_info
```

**Example.** list only the "local" group

```bash
opensips-cli -x mi redis_cluster_info group=local
```

### `redis_cluster_refresh`

Forces an immediate topology refresh on Redis Cluster connections. This bypasses the normal once-per-second rate limit and queries the cluster for its current slot-to-node mapping. Useful after manual cluster rebalancing or node additions/removals. For non-cluster (single instance) connections, the command returns a "skipped (not cluster mode)" status.

**Parameters:**

- `group` *(string, optional)* — if specified, only the connection belonging to this group will be refreshed. If omitted, all cluster connections are refreshed.

**Returns:** A JSON array of objects, one per connection. (structured response — see schema)

**Example.** refresh all cluster connections

```bash
opensips-cli -x mi redis_cluster_refresh
```

**Example.** refresh only the "local" group

```bash
opensips-cli -x mi redis_cluster_refresh group=local
```

### `redis_ping_nodes`

Sends a PING command to each Redis node and reports per-node reachability status with round-trip latency. Useful for on-demand health checks without waiting for the next query.

**Parameters:**

- `group` *(string, optional)* — if specified, only nodes belonging to this group will be pinged. If omitted, all Redis connections are pinged.

**Returns:** A JSON array of connection objects. (structured response — see schema)

**Example.** ping all Redis nodes

```bash
opensips-cli -x mi redis_ping_nodes
```

**Example.** ping only the "local" group

```bash
opensips-cli -x mi redis_ping_nodes group=local
```

## Exported Statistics

### `redis_moved`

Total number of MOVED redirections received from Redis Cluster nodes. A MOVED response indicates a permanent slot migration - the module updates its slot map and retries the query on the correct node.

- **Type:** counter
### `redis_queries`

Total number of successful Redis queries executed across all connections and processes.

- **Type:** counter
### `redis_queries_failed`

Total number of failed Redis queries (NULL replies from hiredis or Redis error responses other than MOVED).

- **Type:** counter
### `redis_topology_refreshes`

Total number of cluster topology refreshes performed (via CLUSTER SHARDS or CLUSTER SLOTS). This counter increments both for automatic refreshes (triggered by MOVED responses or unreachable nodes) and manual refreshes (triggered via the redis_cluster_refresh MI command).

- **Type:** counter

## Configuration Examples

### Set `cachedb_url` parameter

Set `cachedb_url` parameter

```opensips
...
# single-instance URLs (Redis Server or Redis Cluster)
modparam("cachedb_redis", "cachedb_url", "redis:group1://localhost:6379/")
modparam("cachedb_redis", "cachedb_url", "redis:cluster1://random_url:8888/")

# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb_redis", "cachedb_url",
	"redis:ha://localhost,host_a:6380,host_b:6381,host_c/")
...
```
### Use Redis servers

Use Redis servers

```opensips
...
cache_store("redis:group1", "key", "$ru value");
cache_fetch("redis:cluster1", "key", $avp(10));
cache_remove("redis:cluster1", "key");
...
```
### Set `connect_timeout` parameter

Set `connect_timeout` parameter

```opensips
...
# wait 1 second for Redis to connect
modparam("cachedb_redis", "connect_timeout",1000)
...
```
### Set `query_timeout` parameter

Set `query_timeout` parameter

```opensips
...
# wait 1 second for Redis queries
modparam("cachedb_redis", "query_timeout",1000)
...
```
### Set the `shutdown_on_error` parameter

Set the `shutdown_on_error` parameter

```opensips
...
# abort OpenSIPS startup if Redis is down
modparam("cachedb_redis", "shutdown_on_error", 1)
...
```
### Set the `lazy_connect` parameter

Set the `lazy_connect` parameter

```opensips
...
# defer Redis connections until first use
modparam("cachedb_redis", "lazy_connect", 1)
...
```
### Set the `use_tls` parameter

Set the `use_tls` parameter

```opensips
...
modparam("tls_mgm", "client_domain", "redis")
modparam("tls_mgm", "certificate", "\[redis\]/etc/pki/tls/certs/redis.pem")
modparam("tls_mgm", "private_key", "\[redis\]/etc/pki/tls/private/redis.key")
modparam("tls_mgm", "ca_list",     "\[redis\]/etc/pki/tls/certs/ca.pem")
...
modparam("cachedb_redis", "use_tls", 1)
modparam("cachedb_redis", "cachedb_url","redis:tls_group://localhost:6379/?tls_domain=redis")
...
```
### Set the `ftsearch_index_name` parameter

Set the `ftsearch_index_name` parameter

```opensips
modparam("cachedb_redis", "ftsearch_index_name", "ix::usrloc")
```
### Set the `ftsearch_json_prefix` parameter

Set the `ftsearch_json_prefix` parameter

```opensips
modparam("cachedb_redis", "ftsearch_json_prefix", "userlocation:")
```
### Set the `ftsearch_max_results` parameter

Set the `ftsearch_max_results` parameter

```opensips
modparam("cachedb_redis", "ftsearch_max_results", 100)
```
### Set `redis_keepalive` parameter

Set `redis_keepalive` parameter

```opensips
...
# set TCP keepalive interval to 15 seconds
modparam("cachedb_redis", "redis_keepalive", 15)

# disable TCP keepalive
modparam("cachedb_redis", "redis_keepalive", 0)
...
```
### Set the `ftsearch_json_mset_expire` parameter

Set the `ftsearch_json_mset_expire` parameter

```opensips
modparam("cachedb_redis", "ftsearch_json_mset_expire", 7200)
```
### Redis Raw Query Examples

Redis Raw Query Examples

```opensips
...
	$var(my_hash) = "my_hash_name";
	$var(my_key) = "my_key_name";
	$var(my_value) = "my_key_value";
	cache_raw_query("redis","HSET $var(my_hash) $var(my_key) $var(my_value)");
	cache_raw_query("redis","HGET $var(my_hash) $var(my_key)","$avp(result)");
	xlog("We have fetched $avp(result) \\n");
...
	$var(my_hash) = "my_hash_name";
	$var(my_key1) = "my_key1_name";
	$var(my_key2) = "my_key2_name";
	$var(my_value1) = "my_key1_value";
	$var(my_value2) = "my_key2_value";
	cache_raw_query("redis","HSET $var(my_hash) $var(my_key1) $var(my_value1)");
	cache_raw_query("redis","HSET $var(my_hash) $var(my_key2) $var(my_value2)");
	cache_raw_query("redis","HGETALL $var(my_hash)","$avp(result)");

	$var(it) = 0;
	while ($(avp(result)\[$var(it)\]) != NULL) {
		xlog("Multiple key reply: - we have fetched $(avp(result)\[$var(it)\]) \\n");
		$var(it) = $var(it) + 1;
	}
...
```
