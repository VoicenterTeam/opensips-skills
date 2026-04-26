# cachedb_memcached Module Reference
<!-- generated-from: data/4.0/modules/cachedb_memcached.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 cachedb_memcached module. Read this file when configuring or debugging the cachedb_memcached module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed to work with a memcached server. It uses libmemcached client library to connect to several memcached servers that store data. It uses the Key-Value interface exported from the core.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libmemcached` — libmemcached can be downloaded from: http://tangent.org/552/libmemcached.html. Download the archive, extract sources, run ./configure, make,sudo make install.

...
wget http://download.tangent.org/libmemcached-0.31.tar.gz
tar -xzvf libmemcached-0.31.tar.gz
cd libmemcached-0.31
./configure
make
sudo make install
...

## Exported Parameters

### `cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache_store,cache_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

**Example.** memcached:group1://localhost:9999,127.0.0.1/.

```opensips
...
modparam("cachedb_memcached", "cachedb_url","memcached:group1://localhost:9999,127.0.0.1/");
modparam("cachedb_memcached", "cachedb_url","memcached:y://random_url:8888/");
...
```
### `exec_threshold` (integer)

The maximum number of microseconds that a local cache query can last. Anything above the threshold will trigger a warning message to the log

*Default value is 0 ( unlimited - no warnings ).*

**Example.** 100000.

```opensips
...
modparam("cachedb_memcached", "exec_threshold", 100000)
...
```

## Configuration Examples

### Set `cachedb_url` parameter

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache_store,cache_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

```opensips
...
modparam("cachedb_memcached", "cachedb_url","memcached:group1://localhost:9999,127.0.0.1/");
modparam("cachedb_memcached", "cachedb_url","memcached:y://random_url:8888/");
...
```
### Use memcached servers

Use memcached servers

```opensips
...
cache_store("memcached:group1","key","$ru value");
cache_fetch("memcached:y","key",$avp(10));
cache_remove("memcached:group1","key");
...
```
### Set `exec_threshold` parameter

The maximum number of microseconds that a local cache query can last. Anything above the threshold will trigger a warning message to the log

```opensips
...
modparam("cachedb_memcached", "exec_threshold", 100000)
...
```
