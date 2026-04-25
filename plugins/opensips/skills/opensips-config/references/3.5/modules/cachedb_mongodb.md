# cachedb_mongodb Module Reference
<!-- generated-from: data/3.5/modules/cachedb_mongodb.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 cachedb_mongodb module. Read this file when configuring or debugging the cachedb_mongodb module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed to work with MongoDB servers. It implements the Key-Value interface exposed by the OpenSIPS core.

The underlying client library is compatible with any of the following MongoDB server versions: 2.4, 2.6, 3.0, 3.2 and 3.4, as stated in [the MongoDB documentation](https://docs.mongodb.com/ecosystem/drivers/driver-compatibility-reference/).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libbson`
- `libjson-c`
- `mongo-c-driver`

## Exported Parameters

### `cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to allow the cache_store(), cache_fetch(), etc. functions to be used from the OpenSIPS script. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

The URL syntax is identical to the one used by MongoDB, including connect string options. For more info, please refer to [the official MongoDB connect string documentation](https://docs.mongodb.com/manual/reference/connection-string/).

**Example.** mongodb://localhost:27017/opensipsDB.dialog.

```opensips
# Connect to a single _mongod_ instance
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://localhost:27017/opensipsDB.dialog")

# Connect to a _mongod_ replica set
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://10.0.0.10,10.0.0.11:27017/opensipsDB.dialog?replicaSet=my-set")

# Connect to a _mongos_ instance (routes to a sharded cluster)
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://localhost/opensipsDB.dialog")

# Example of multiple connections:
#   \* to a main _mongos_, with failover to a backup _mongos_
#   \* to a single _mongod_
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb:cluster://localhost,10.0.0.10:27017/opensipsDB.dialog")
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://localhost:27017/opensipsDB.userlocation")
```
### `compat_mode_2.4` (integer)

Switch the module into compatibility mode for MongoDB 2.4 servers. Specifically, this allows "insert/update/delete" raw queries to not fail, since they were introduced in MongoDB 2.6. The module will interpret the raw query JSON, convert it to its corresponding command and run it.

Caveat: only the minimally required raw query options are supported in this mode.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("cachedb_mongodb", "compat_mode_2.4", 1)
```
### `compat_mode_3.0` (integer)

Switch the module into compatibility mode for MongoDB 2.6/3.0 servers. Specifically, this allows "find" raw queries to not fail, since they were introduced in MongoDB 3.2. The module will interpret the "find" raw query JSON, convert it to its corresponding command and run it.

Caveat: only the minimally required options for "find" raw queries are supported in this mode.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("cachedb_mongodb", "compat_mode_3.0", 1)
```
### `exec_threshold` (integer)

The maximum number of microseconds that a mongodb query can last. Anything above the threshold will trigger a warning message to the log

*Default value is 0 ( unlimited - no warnings ).*

**Example.** 100000.

```opensips
modparam("cachedb_mongodb", "exec_threshold", 100000)
```

## Configuration Examples

### Set `cachedb_url` parameter

Demonstrates setting the `cachedb_url` parameter with various MongoDB connection strings.

```opensips
...
# Connect to a single _mongod_ instance
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://localhost:27017/opensipsDB.dialog")

# Connect to a _mongod_ replica set
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://10.0.0.10,10.0.0.11:27017/opensipsDB.dialog?replicaSet=my-set")

# Connect to a _mongos_ instance (routes to a sharded cluster)
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://localhost/opensipsDB.dialog")

# Example of multiple connections:
#   \* to a main _mongos_, with failover to a backup _mongos_
#   \* to a single _mongod_
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb:cluster://localhost,10.0.0.10:27017/opensipsDB.dialog")
modparam("cachedb_mongodb", "cachedb_url",
         "mongodb://localhost:27017/opensipsDB.userlocation")
...
```
### Reference MongoDB connections

Demonstrates referencing MongoDB connections in script functions.

```opensips
...
cache_store("mongodb", "key", "$ru value");
cache_remove("mongodb:cluster", "key");
cache_fetch("mongodb:instance1", "key", $avp(10));
...
```
### Set `exec_threshold` parameter

Demonstrates setting the `exec_threshold` parameter.

```opensips
...
modparam("cachedb_mongodb", "exec_threshold", 100000)
...
```
### Setting the `compat_mode_2.4` parameter

Demonstrates setting the `compat_mode_2.4` parameter.

```opensips
...
modparam("cachedb_mongodb", "compat_mode_2.4", 1)
...
```
### Setting the `compat_mode_3.0` parameter

Demonstrates setting the `compat_mode_3.0` parameter.

```opensips
...
modparam("cachedb_mongodb", "compat_mode_3.0", 1)
...
```
### MongoDB Raw Insert

Demonstrates a MongoDB raw insert query.

```opensips
...
cache_raw_query("mongodb:cluster", "{ \\
    \"insert\": \"ip_blacklist\", \\
    \"documents\": \[{ \\
        \"username\": \"$fU\", \\
        \"ip\": \"$si\", \\
        \"attempts\": 1 \\
     }\]}",
 "$avp(out)");
xlog("INSERT RAW QUERY returned $rc, output: '$avp(out)'\n");
...
```
### MongoDB Raw Update

Demonstrates a MongoDB raw update query.

```opensips
...
cache_raw_query("mongodb:cluster", "{ \\
    \"update\": \"ip_blacklist\", \\
    \"updates\": \[{ \\
        \"q\": { \\
            \"username\": \"$fU\", \\
            \"ip\": \"$si\" \\
         }, \\
        \"u\": { \\
            \"$$inc\": {\"attempts\": 1} \\
         } \\
      }\]}",
 "$avp(out)");
xlog("UPDATE RAW QUERY returned $rc, output: '$avp(out)'\n");
...
```
