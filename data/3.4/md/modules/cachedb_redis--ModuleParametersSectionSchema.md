## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to use, from script, the cache\_store(), cache\_fetch(), etc. operations. It may be set more than once. The prefix part of the URL will be the identifier that will be used from the script.

**Example�1.1.�Set `cachedb_url` parameter**

...
# single-instance URLs (Redis Server or Redis Cluster)
modparam("cachedb\_redis", "cachedb\_url", "redis:group1://localhost:6379/")
modparam("cachedb\_redis", "cachedb\_url", "redis:cluster1://random\_url:8888/")

# multi-instance URL (will perform circular **failover** on each query)
modparam("cachedb\_redis", "cachedb\_url",
	"redis:ha://localhost,host\_a:6380,host\_b:6381,host\_c/")
...
		

  

**Example�1.2.�Use Redis servers**

...
cache\_store("redis:group1", "key", "$ru value");
cache\_fetch("redis:cluster1", "key", $avp(10));
cache\_remove("redis:cluster1", "key");
...
		

  

### 1.5.2.�`connect_timeout` (integer)

This parameter specifies how many milliseconds OpenSIPS should wait for connecting to a Redis node.

_Default value is “5000 ms”._

**Example�1.3.�Set `connect_timeout` parameter**

...
# wait 1 seconds for Redis to connect
modparam("cachedb\_redis", "connect\_timeout",1000)
...
		

  

### 1.5.3.�`query_timeout` (integer)

This parameter specifies how many milliseconds OpenSIPS should wait for a query response from a Redis node.

_Default value is “5000 ms”._

**Example�1.4.�Set `connect_timeout` parameter**

...
# wait 1 seconds for Redis queries
modparam("cachedb\_redis", "query\_timeout",1000)
...
		

  

### 1.5.4.�`shutdown_on_error` (integer)

By setting this parameter to 1, OpenSIPS will abort startup if the initial connection to Redis is not possible. Runtime reconnect behavior is unaffected by this parameter, and is always enabled.

_Default value is “0” (disabled)._

**Example�1.5.�Set the `shutdown_on_error` parameter**

...
# abort OpenSIPS startup if Redis is down
modparam("cachedb\_redis", "shutdown\_on\_error", 1)
...
		

  

### 1.5.5.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for Redis connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" URL parameter in the cachedb\_url of this module (or other modules that use the CacheDB interface). This should be placed at the end of the URL after the '?' character.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

Note that TLS is supported by Redis starting with version 6.0. Also, it is an optional feature enabled at compile time and might not be included in the standard Redis packages available for your OS.

_Default value is **0** (not enabled)_

**Example�1.6.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "redis")
modparam("tls\_mgm", "certificate", "\[redis\]/etc/pki/tls/certs/redis.pem")
modparam("tls\_mgm", "private\_key", "\[redis\]/etc/pki/tls/private/redis.key")
modparam("tls\_mgm", "ca\_list",     "\[redis\]/etc/pki/tls/certs/ca.pem")
...
modparam("cachedb\_redis", "use\_tls", 1)
modparam("cachedb\_redis", "cachedb\_url","redis://localhost:6379/?tls\_domain=redis")
...