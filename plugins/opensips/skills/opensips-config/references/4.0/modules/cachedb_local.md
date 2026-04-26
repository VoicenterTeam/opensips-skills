# cachedb_local Module Reference
<!-- generated-from: data/4.0/modules/cachedb_local.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 cachedb_local module. Read this file when configuring or debugging the cachedb_local module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a local cache system designed as a hash table. It uses the Key-Value interface exported by OpenSIPS core. Starting with version 2.3, the module can have multiple hash tables, called collections. Each url for cachedb_local module points to one collection. One collection can be shared between multiple urls.

## How It Works

Cachedb_local clustering is a mechanism used to mirror local cache changes taking place in one OpenSIPS instance to one or multiple other instances without the need of third party dependencies. The process is simplified by using the clusterer module which facilitates the management of a cluster of OpenSIPS noeds and the sending of replication-related BIN packets (binary-encoded, using proto_bin). This might be usefull for implementing a hot stand-by system, where the stand-by instance can take over without the need of filling the cache by its own.

The following cache operations will be distributet within the cluster:

cache_store
cache_remove
cache_add
cache_sub

In addition to the event-driven replication, an OpenSIPS instance will first try to learn all the local cache information from antoher node in the cluster at startup. The data synchronization mechanism requires defining one of the nodes in the cluster as a "**seed**" node. See the clusterer module for details on how to do this and why is it needed.

_Note:_ You have to explicitly specify which collections you want to replicate when you set cache_collections.

**Limitations:** The clustering operations are not atomic and constistency over the cluster nodes is not guaranteed.

## Dependencies

### OpenSIPs Modules

- `clusterer` — if cluster_id is set (optional)

### External Libraries

None.

## Exported Parameters

### `cache_clean_period` (integer)

The time interval in seconds at which to go through all the records and delete the expired ones.

*Default value is 600 (10 minutes).*

**Example.** 1200.

```opensips
modparam("cachedb_local", "cache_clean_period", 1200)
```
### `cache_collections` (string)

Using this parameter, collections(hash tables) and their sizes can be defined. Each collection definition must be separated one from another using ';'. Default size for a hash is 512. The size must be separated from the name of the collection using '='.

If clustering is enabled you have to specify which collections you want to replicate with the _/r_ suffix to the collection name.

The _"default"_ collection always gets created, even when not included in this list of collections.

**Example.** collection1/r; collection2/r = 5; default = 4.

```opensips
## creating collection1 with default size (512) and collection2 with custom size
## 2^5 (32); we also changed the size of the default collection, which would have been
## created anyway from 2^9 - 512 (default value) to 2^4 - 16
## also, collection1 and collection2 will be replicated in the cluster, while the
## default collection will be local to this node
modparam("cachedb_local", "cache_collections", "collection1/r; collection2/r = 5; default = 4")
```
### `cachedb_url` (string)

URLs of local cache groups to be used used for the script and MI cacheDB operations. The parameter can be set multiple times.

One collection can belong to multiple URLs, but one URL can have only one collection. Redefining an URL with the same schema and group name will result in overwriting that URL. Each collection used in URL definition must be defined using _cachedb_collection_ parameter. The collection shall be defined as a normal database, at the end of the URL as in the examples. In the script the collection shall be identified using the schema and, if exists, the group name.

_“If no URL defined, the url with no group name and collection "default" will be used.”._

**Example.** local://.

```opensips
### for this example, if no collection is defined, the default collection named
### "default" shall be used
modparam("cachedb_local", "cachedb_url", "local://")
### this URL will use the collection named collection1; it will overwrite the
### previous url definition which was using the "default" collection
modparam("cachedb_local", "cachedb_url", "local:///collection1")
### this URL will use collection2; it will be referenced from the script
### with "local:group2"
modparam("cachedb_local", "cachedb_url", "local:group2:///collection2")

## how to use the URLs from the script
## as defined above, this call will use collection1
cache_store("local", ...)
## as defined above, this call will use collection2
cache_store("local:group2", ...)
```
### `cluster_id` (integer)

Specifies the cluster ID which this instance will send to and receive cache data.

This OpenSIPS cluster exposes the **"cachedb-local-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

*Default value is 0 (replication disabled).*

**Example.** 1.

```opensips
modparam("cachedb_local", "cluster_id", 1)
```
### `cluster_persistency` (string)

Controls the behavior of the OpenSIPS local cachedb clustering following a restart.

*Default value is sync-from-cluster.*

**Possible values:**

- none
- sync-from-cluster

**Example.** sync-from-cluster.

```opensips
modparam("cachedb_local", "cluster_persistency", "sync-from-cluster")
```
### `enable_restart_persistency` (integer)

Enable restart persistency using the persistent memory mechanism. Data is stored in a cache file that is mapped against OpenSIPS memory.

Note that you have to keep the same collection definitions from a previous run in order to use the cached data for the respective collections.

If cluster persistency is enabled as well, keys loaded from the persistent cache will be discarded if they are not received in the cluster sync data.

*Default value is 0 (disabled).*

**Example.** yes.

```opensips
modparam("cachedb_local", "enable_restart_persistency", yes)
```

## Exported Functions

### `cache_remove_chunk([collection,] glob)`

Remove all keys from local cache that match the _glob_ pattern corresponding to a certain _collection_ or the 'default' collection if none defined. Keep in mind that collection name is different than group name, which identifies the engine in cachedb operations.

**Parameters:**

- `collection` *(string, optional)* — 
- `glob` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** `cache_remove_chunk` usage.

```opensips
...
cache_remove_chunk("myinfo__*");
cache_remove_chunk("collection1", "myinfo__*");
...
```

## Exported MI Functions

### `cachedb_local:fetch_chunk`

Replaces obsolete MI command: _cache_fetch_chunk_.

Fetches all local cache entries that match the provided glob param.

**Parameters:**

- `collection` *(string, optional)* — collection from which the keys shall be retrieved; if no collection set, the default collection will be used;
- `glob` *(string, required)* — keys that match glob will be returned

**Returns:** Returns a JSON object containing a list of keys and their values. (structured response — see schema)

**Example.** MI FIFO Command Format:

```opensips-cli
opensips-cli -x mi cachedb_local:fetch_chunk "keyprefix\*" collection
```

### `cachedb_local:remove_chunk`

Replaces obsolete MI command: _cache_remove_chunk_.

Removes all local cache entries that match the provided glob param.

**Parameters:**

- `collection` *(string, optional)* — collection from which the keys shall be removed; if no collection set, the default collection will be used;
- `glob` *(string, required)* — keys that match glob will be removed

**Example.** MI FIFO Command Format:

```opensips-cli
opensips-cli -x mi cachedb_local:remove_chunk "keyprefix\*" collection
```

## Configuration Examples

### Set `cachedb_url` parameter

URLs of local cache groups to be used used for the script and MI cacheDB operations.

```opensips
...
### for this example, if no collection is defined, the default collection named
### "default" shall be used
modparam("cachedb_local", "cachedb_url", "local://")
### this URL will use the collection named collection1; it will overwrite the
### previous url definition which was using the "default" collection
modparam("cachedb_local", "cachedb_url", "local:///collection1")
### this URL will use collection2; it will be referenced from the script
### with "local:group2"
modparam("cachedb_local", "cachedb_url", "local:group2:///collection2")

## how to use the URLs from the script
## as defined above, this call will use collection1
cache_store("local", ...)
## as defined above, this call will use collection2
cache_store("local:group2", ...)
...
```
### Set `cache_collections` parameter

Using this parameter, collections(hash tables) and their sizes can be defined.

```opensips
...
## creating collection1 with default size (512) and collection2 with custom size
## 2^5 (32); we also changed the size of the default collection, which would have been
## created anyway from 2^9 - 512 (default value) to 2^4 - 16
## also, collection1 and collection2 will be replicated in the cluster, while the
## default collection will be local to this node
modparam("cachedb_local", "cache_collections", "collection1/r; collection2/r = 5; default = 4")
...
```
### Set `cache_clean_period` parameter

The time interval in seconds at which to go through all the records and delete the expired ones.

```opensips
...
modparam("cachedb_local", "cache_clean_period", 1200)
...
```
### Setting the `cluster_id` parameter

Specifies the cluster ID which this instance will send to and receive cache data.

```opensips
...
modparam("cachedb_local", "cluster_id", 1)
...
```
### Set `cluster_persistency` parameter

Controls the behavior of the OpenSIPS local cachedb clustering following a restart.

```opensips
...
modparam("cachedb_local", "cluster_persistency", "sync-from-cluster")
...
```
### Set `enable_restart_persistency` parameter

Enable restart persistency using the persistent memory mechanism.

```opensips
...
modparam("cachedb_local", "enable_restart_persistency", yes)
...
```
### `cache_remove_chunk` usage

Remove all keys from local cache that match the glob pattern corresponding to a certain collection or the 'default' collection if none defined.

```opensips
	...
	cache_remove_chunk("myinfo_\*");
	cache_remove_chunk("collection1", "myinfo_\*");
	...
```
