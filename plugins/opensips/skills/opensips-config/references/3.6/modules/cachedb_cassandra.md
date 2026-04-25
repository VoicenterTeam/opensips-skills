# cachedb_cassandra Module Reference
<!-- generated-from: data/3.6/modules/cachedb_cassandra.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 cachedb_cassandra module. Read this file when configuring or debugging the cachedb_cassandra module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed to work with Cassandra servers. It uses the Key-Value interface exported from the core.

The underlying client library is compatible with Cassandra versions 2.1+.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `cassandra-cpp-driver`
- `libuv`

## Exported Parameters

### `cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache_store,cache_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

Cassandra does not support regular columns in a table that contains any counter columns so in order to use the add()/sub()/get_counter() methods in the Key-Value Interface you can specify an extra table reserved only for counters.

The database part of the URL needs to be in the format _Keyspace.Table[.CountersTable]_.

**Example.** cassandra:group1://localhost:9042/keyspace1.users.counters.

```opensips
modparam("cachedb_cassandra", "cachedb_url",
	"cassandra:group1://localhost:9042/keyspace1.users.counters")

# Defining multiple contact points for a Cassandra cluster
modparam("cachedb_cassandra", "cachedb_url",
	"cassandra:cluster1://10.0.0.10,10.0.0.15/keyspace2.keys.counters")
```
### `connect_timeout` (integer)

The timeout in ms that will be triggered in case a connection attempt fails.

*Default value is 5000.*

**Example.** 1000.

```opensips
modparam("cachedb_cassandra", "connect_timeout",1000);
```
### `exec_threshold` (integer)

A cassandra cache query that lasts more than this threshold will trigger a warning message to the log.

This value, if set, only makes sense to be lower than the query_timeout since any query taking longer than that value will be dropped anyway.

*Default value is 0 ( unlimited - no warnings ).*

**Example.** 100000.

```opensips
modparam("cachedb_cassandra", "exec_threshold", 100000)
```
### `query_timeout` (integer)

The timeout in ms that will be triggered in case a Cassandra query takes too long.

*Default value is 5000.*

**Example.** 1000.

```opensips
modparam("cachedb_cassandra", "query_timeout",1000);
```
### `rd_consistency_level` (integer)

The consistency level desired for write operations. Options are :

*   _all_ - Returns the record after all replicas have responded. The read operation will fail if a replica does not respond.
    
*   _quorum_ - Returns the record after a quorum of replicas from all datacenters has responded.
    
*   _local_quorum_ - Returns the record after a quorum of replicas in the current datacenter as the coordinator has reported. Avoids latency of inter-datacenter communication.
    
*   _one_ - Returns a response from the closest replica, as determined by the snitch. By default, a read repair runs in the background to make the other replicas consistent.
    
*   _two_ - Returns the most recent data from two of the closest replicas.
    
*   _three_ - Returns the most recent data from three of the closest replicas.
    
*   _local_one_ - Returns a response from the closest replica in the local datacenter.
    
*   _serial_ - Allows reading the current (and possibly uncommitted) state of data without proposing a new addition or update. If a SERIAL read finds an uncommitted transaction in progress, it will commit the transaction as part of the read. Similar to QUORUM.
    
*   _local_serial_ - Same as SERIAL, but confined to the datacenter. Similar to LOCAL_QUORUM.

*Default value is one.*

**Possible values:**

- all
- quorum
- local_quorum
- one
- two
- three
- local_one
- serial
- local_serial

**Example.** quorum.

```opensips
modparam("cachedb_cassandra", "rd_consistency_level", "quorum");
```
### `wr_consistency_level` (integer)

The consistency level desired for write operations. Options are :

*   _all_ - A write must be written to the commit log and memtable on all replica nodes in the cluster for that partition.
    
*   _each_quorum_ - Strong consistency. A write must be written to the commit log and memtable on a quorum of replica nodes in each datacenter.
    
*   _quorum_ - A write must be written to the commit log and memtable on a quorum of replica nodes across all datacenters.
    
*   _local_quorum_ - Strong consistency. A write must be written to the commit log and memtable on a quorum of replica nodes in the same datacenter as the coordinator. Avoids latency of inter-datacenter communication.
    
*   _one_ - A write must be written to the commit log and memtable of at least one replica node.
    
*   _two_ - A write must be written to the commit log and memtable of at least two replica node.
    
*   _three_ - A write must be written to the commit log and memtable of at least three replica node.
    
*   _local_one_ - A write must be sent to, and successfully acknowledged by, at least one replica node in the local datacenter.
    
*   _any_ - A write must be written to at least one node. If all replica nodes for the given partition key are down, the write can still succeed after a hinted handoff has been written. If all replica nodes are down at write time, an ANY write is not readable until the replica nodes for that partition have recovered.

*Default value is one.*

**Possible values:**

- all
- each_quorum
- quorum
- local_quorum
- one
- two
- three
- local_one
- any

**Example.** each_quorum.

```opensips
modparam("cachedb_cassandra", "wr_consistency_level", "each_quorum");
```

## Configuration Examples

### Set `cachedb_url` parameter

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache_store,cache_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script. Cassandra does not support regular columns in a table that contains any counter columns so in order to use the add()/sub()/get_counter() methods in the Key-Value Interface you can specify an extra table reserved only for counters. The database part of the URL needs to be in the format Keyspace.Table[.CountersTable].

```opensips
...
modparam("cachedb_cassandra", "cachedb_url",
	"cassandra:group1://localhost:9042/keyspace1.users.counters")

# Defining multiple contact points for a Cassandra cluster
modparam("cachedb_cassandra", "cachedb_url",
	"cassandra:cluster1://10.0.0.10,10.0.0.15/keyspace2.keys.counters")
...
```
### Use Cassandra servers

```opensips
...
cache_store("cassandra:group1","key","$ru value");
cache_fetch("cassandra:cluster1","key",$avp(10));
cache_remove("cassandra:cluster1","key");
...
```
### Set `connect_timeout` parameter

The timeout in ms that will be triggered in case a connection attempt fails.

```opensips
...
modparam("cachedb_cassandra", "connect_timeout",1000);
...
```
### Set `query_timeout` parameter

The timeout in ms that will be triggered in case a Cassandra query takes too long.

```opensips
...
modparam("cachedb_cassandra", "query_timeout",1000);
...
```
### Set `wr_consistency_level` parameter

The consistency level desired for write operations. Options are : all - A write must be written to the commit log and memtable on all replica nodes in the cluster for that partition. each_quorum - Strong consistency. A write must be written to the commit log and memtable on a quorum of replica nodes in each datacenter. quorum - A write must be written to the commit log and memtable on a quorum of replica nodes across all datacenters. local_quorum - Strong consistency. A write must be written to the commit log and memtable on a quorum of replica nodes in the same datacenter as the coordinator. Avoids latency of inter-datacenter communication. one - A write must be written to the commit log and memtable of at least one replica node. two - A write must be written to the commit log and memtable of at least two replica node. three - A write must be written to the commit log and memtable of at least three replica node. local_one - A write must be sent to, and successfully acknowledged by, at least one replica node in the local datacenter. any - A write must be written to at least one node. If all replica nodes for the given partition key are down, the write can still succeed after a hinted handoff has been written. If all replica nodes are down at write time, an ANY write is not readable until the replica nodes for that partition have recovered.

```opensips
...
modparam("cachedb_cassandra", "wr_consistency_level", "each_quorum");
...
```
### Set `rd_consistency_level` parameter

The consistency level desired for write operations. Options are : all - Returns the record after all replicas have responded. The read operation will fail if a replica does not respond. quorum - Returns the record after a quorum of replicas from all datacenters has responded. local_quorum - Returns the record after a quorum of replicas in the current datacenter as the coordinator has reported. Avoids latency of inter-datacenter communication. one - Returns a response from the closest replica, as determined by the snitch. By default, a read repair runs in the background to make the other replicas consistent. two - Returns the most recent data from two of the closest replicas. three - Returns the most recent data from three of the closest replicas. local_one - Returns a response from the closest replica in the local datacenter. serial - Allows reading the current (and possibly uncommitted) state of data without proposing a new addition or update. If a SERIAL read finds an uncommitted transaction in progress, it will commit the transaction as part of the read. Similar to QUORUM. local_serial - Same as SERIAL, but confined to the datacenter. Similar to LOCAL_QUORUM.

```opensips
...
modparam("cachedb_cassandra", "rd_consistency_level", "quorum");
...
```
### Set `exec_threshold` parameter

A cassandra cache query that lasts more than this threshold will trigger a warning message to the log. This value, if set, only makes sense to be lower than the query_timeout since any query taking longer than that value will be dropped anyway.

```opensips
...
modparam("cachedb_cassandra", "exec_threshold", 100000)
...
```
