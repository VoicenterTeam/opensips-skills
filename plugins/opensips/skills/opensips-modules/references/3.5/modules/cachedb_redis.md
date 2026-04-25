# cachedb_redis Module Reference
<!-- generated-from: data/3.5/modules/cachedb_redis.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 cachedb_redis module. Read this file when configuring or debugging the cachedb_redis module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed to work with a Redis server. It uses hiredis client library to connect to either a single Redis server instance, or to a Redis Server inside a Redis Cluster. It uses the Key-Value interface exported from the core.

## Dependencies

### OpenSIPs Modules

- `tls_mgm` — Required if use_tls is defined (optional)

### External Libraries

- `hiredis` — Client library to connect to Redis. If TLS connections are enabled, hiredis needs to be compiled with TLS support.

## Exported Parameters

### `cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to use, from script, the cache_store(), cache_fetch(), etc. operations. It may be set more than once. The prefix part of the URL will be the identifier that will be used from the script.

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
# wait 1 seconds for Redis to connect
modparam("cachedb_redis", "connect_timeout",1000)
```
### `query_timeout` (integer)

This parameter specifies how many milliseconds OpenSIPS should wait for a query response from a Redis node.

*Default value is 5000 ms.*

**Example.** 1000.

```opensips
# wait 1 seconds for Redis queries
modparam("cachedb_redis", "query_timeout",1000)
```
### `shutdown_on_error` (integer)

By setting this parameter to 1, OpenSIPS will abort startup if the initial connection to Redis is not possible. Runtime reconnect behavior is unaffected by this parameter, and is always enabled.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
# abort OpenSIPS startup if Redis is down
modparam("cachedb_redis", "shutdown_on_error", 1)
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for Redis connections. In order to enable TLS for a specific connection, you can use the "tls_domain=_dom_name_" URL parameter in the cachedb_url of this module (or other modules that use the CacheDB interface). This should be placed at the end of the URL after the '?' character. When using this parameter, you must also ensure that _tls_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains. Note that TLS is supported by Redis starting with version 6.0. Also, it is an optional feature enabled at compile time and might not be included in the standard Redis packages available for your OS.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("tls_mgm", "client_domain", "redis")
modparam("tls_mgm", "certificate", "[redis]/etc/pki/tls/certs/redis.pem")
modparam("tls_mgm", "private_key", "[redis]/etc/pki/tls/private/redis.key")
modparam("tls_mgm", "ca_list",     "[redis]/etc/pki/tls/certs/ca.pem")
...
modparam("cachedb_redis", "use_tls", 1)
modparam("cachedb_redis", "cachedb_url","redis://localhost:6379/?tls_domain=redis")
```

## Configuration Examples

### Set `cachedb_url` parameter

The URLs of the server groups that OpenSIPS will connect to in order to use, from script, the cache_store(), cache_fetch(), etc. operations. It may be set more than once. The prefix part of the URL will be the identifier that will be used from the script.

```opensips
# single-instance URLs (Redis Server or Redis Cluster)
modparam("cachedb_redis", "cachedb_url", "redis:group1://localhost:6379/")
modparam("cachedb_redis", "cachedb_url", "redis:cluster1://random_url:8888/")

# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb_redis", "cachedb_url",
	"redis:ha://localhost,host_a:6380,host_b:6381,host_c/")
```
### Use Redis servers

Use Redis servers

```opensips
cache_store("redis:group1", "key", "$ru value");
cache_fetch("redis:cluster1", "key", $avp(10));
cache_remove("redis:cluster1", "key");
```
### Set `connect_timeout` parameter

This parameter specifies how many milliseconds OpenSIPS should wait for connecting to a Redis node.

```opensips
# wait 1 seconds for Redis to connect
modparam("cachedb_redis", "connect_timeout",1000)
```
### Set `connect_timeout` parameter

This parameter specifies how many milliseconds OpenSIPS should wait for a query response from a Redis node.

```opensips
# wait 1 seconds for Redis queries
modparam("cachedb_redis", "query_timeout",1000)
```
### Set the `shutdown_on_error` parameter

By setting this parameter to 1, OpenSIPS will abort startup if the initial connection to Redis is not possible. Runtime reconnect behavior is unaffected by this parameter, and is always enabled.

```opensips
# abort OpenSIPS startup if Redis is down
modparam("cachedb_redis", "shutdown_on_error", 1)
```
### Set the `use_tls` parameter

Setting this parameter will allow you to use TLS for Redis connections. In order to enable TLS for a specific connection, you can use the "tls_domain=_dom_name_" URL parameter in the cachedb_url of this module (or other modules that use the CacheDB interface). This should be placed at the end of the URL after the '?' character.

```opensips
modparam("tls_mgm", "client_domain", "redis")
modparam("tls_mgm", "certificate", "[redis]/etc/pki/tls/certs/redis.pem")
modparam("tls_mgm", "private_key", "[redis]/etc/pki/tls/private/redis.key")
modparam("tls_mgm", "ca_list",     "[redis]/etc/pki/tls/certs/ca.pem")
...
modparam("cachedb_redis", "use_tls", 1)
modparam("cachedb_redis", "cachedb_url","redis://localhost:6379/?tls_domain=redis")
```
### Redis Raw Query Examples

The cachedb_redis module allows to run RAW queries, thus taking full advantage of the capabilities of the back-end. The query syntax is the typical REDIS one.

```opensips
	$var(my_hash) = "my_hash_name";
	$var(my_key) = "my_key_name";
	$var(my_value) = "my_key_value";
	cache_raw_query("redis","HSET $var(my_hash) $var(my_key) $var(my_value)");
	cache_raw_query("redis","HGET $var(my_hash) $var(my_key)","$avp(result)");
	xlog("We have fetched $avp(result) \n");
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
	while ($(avp(result_final)[$var(it)]) != NULL) {
		xlog("Multiple key reply: - we have fetched $(avp(result_final)[$var(it)]) \n");
		$var(it) = $var(it) + 1;
	}
```
