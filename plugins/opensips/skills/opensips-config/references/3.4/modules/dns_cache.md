# dns_cache Module Reference
<!-- generated-from: data/3.4/modules/dns_cache.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 dns_cache module. Read this file when configuring or debugging the dns_cache module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed for DNS records. For successful DNS queries of all types, the module will store in a cache/db backend the mappings, for TTL number of seconds received in the DNS answer. Failed DNS queries will also be stored in the back-end, with a TTL that can be specified by the user. The module uses the Key-Value interface exported from the core.

## Dependencies

### OpenSIPs Modules

- `cachedb_*` — Must be loaded before loading the dns_cache module

### External Libraries

None.

## Exported Parameters

### `blacklist_timeout` (integer)

The number of seconds that a failed DNS query will be kept in cache.

*Default value is 3600.*

**Example.** 7200.

```opensips
...
modparam("dns_cache", "blacklist_timeout",7200) # 2 hours
...
```
### `cachedb_url` (string)

The url of the key-value back-end that will be used for storing the DNS records.

**Example.** local://.

```opensips
...
#use internal cachedb_local module
modparam("dns_cache", "cachedb_url","local://")
#use cachedb_memcached module with memcached server at 192.168.2.130
modparam("dns_cache", "cachedb_url","memcached://192.168.2.130:8888/")
...
```

## Configuration Examples

### Set `cachedb_url` parameter

The url of the key-value back-end that will be used for storing the DNS records.

```opensips
...
#use internal cachedb_local module
modparam("dns_cache", "cachedb_url","local://")
#use cachedb_memcached module with memcached server at 192.168.2.130
modparam("dns_cache", "cachedb_url","memcached://192.168.2.130:8888/")
...
```
### Set `blacklist_timeout` parameter

The number of seconds that a failed DNS query will be kept in cache. Default is 3600.

```opensips
...
modparam("dns_cache", "blacklist_timeout",7200) # 2 hours
...
```
