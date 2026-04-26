# cachedb_couchbase Module Reference
<!-- generated-from: data/4.0/modules/cachedb_couchbase.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 cachedb_couchbase module. Read this file when configuring or debugging the cachedb_couchbase module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed to work with a Couchbase server. It uses the libcouchbase client library to connect to the server instance, It uses the Key-Value interface exported from the core.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libcouchbase >= 3.0` — must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache_store,cache_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script. The format of the URL is couchbase[:identifier]://[username:password@]IP:Port/bucket_name

**Example.** couchbase:group1://localhost:6379/default.

```opensips
modparam("cachedb_couchbase", "cachedb_url","couchbase:group1://localhost:6379/default")
modparam("cachedb_couchbase", "cachedb_url","couchbase:cluster1://random_url:8888/my_bucket")
# Multiple hosts
modparam("cachedb_couchbase", "cachedb_url","couchbase:cluster1://random_url1:8888,random_url2:8888,random_url3:8888/my_bucket")
```
### `exec_threshold` (integer)

The maximum number of microseconds that a couchbase query can last. Anything above the threshold will trigger a warning message to the log

*Default value is 0 ( unlimited - no warnings ).*

**Example.** 100000.

```opensips
modparam("cachedb_couchbase", "exec_threshold", 100000)
```
### `lazy_connect` (integer)

Delay connecting to a bucket until the first time it is used. Connecting to many buckets at startup can be time consuming. This option allows for faster startup by delaying connections until they are needed. This option can be dangerous for untested bucket configurations/settings. Always test first without lazy_connect. This option will show errors in the log during the first access made to a bucket.

*Default value is 0 ( Connect to all buckets on startup ).*

**Example.** 1.

```opensips
modparam("cachedb_couchbase", "lazy_connect", 1);
```
### `timeout` (integer)

The max duration in microseconds that a couchbase op is expected to last.

*Default value is 3000000 ( 3 seconds ).*

**Example.** 5000000.

```opensips
modparam("cachedb_couchbase", "timeout",5000000);
```

## Configuration Examples

### Set `cachedb_url` parameter

Demonstrates how to set the cachedb_url parameter to define Couchbase server connections, including single and multiple hosts.

```opensips
...
modparam("cachedb_couchbase", "cachedb_url","couchbase:group1://localhost:6379/default")
modparam("cachedb_couchbase", "cachedb_url","couchbase:cluster1://random_url:8888/my_bucket")
# Multiple hosts
modparam("cachedb_couchbase", "cachedb_url","couchbase:cluster1://random_url1:8888,random_url2:8888,random_url3:8888/my_bucket")
...
```
### Set `timeout` parameter

Demonstrates how to set the timeout parameter for Couchbase operations.

```opensips
...
modparam("cachedb_couchbase", "timeout",5000000);
...
```
### Set `exec_threshold` parameter

Demonstrates how to set the exec_threshold parameter to trigger warnings for long-running queries.

```opensips
...
modparam("cachedb_couchbase", "exec_threshold", 100000)
...
```
### Set `lazy_connect` parameter

Demonstrates how to enable lazy connection to buckets to speed up startup.

```opensips
...
modparam("cachedb_couchbase", "lazy_connect", 1);
...
```
### Use CouchBase servers

Demonstrates how to use the CouchBase servers in the OpenSIPS script using cache_store, cache_fetch, and cache_remove functions.

```opensips
...
cache_store("couchbase:group1","key","$ru value");
cache_fetch("couchbase:cluster1","key",$avp(10));
cache_remove("couchbase:cluster1","key");
...
```
