# cachedb\_cassandra Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp3057328)

2.2. [Most recently active contributors(1) to this module](#idp1686256)

**List of Examples**

1.1. [Set `cachedb_url` parameter](#idp3353408)

1.2. [Use Cassandra servers](#idp4330608)

1.3. [Set `connect_timeout` parameter](#idp2876320)

1.4. [Set `query_timeout` parameter](#idp4443024)

1.5. [Set `wr_consistency_level` parameter](#idp4143456)

1.6. [Set `rd_consistency_level` parameter](#idp5063840)

1.7. [Set `exec_threshold` parameter](#idp4991552)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of a cache system designed to work with Cassandra servers. It uses the Key-Value interface exported from the core.

The underlying client library is compatible with Cassandra versions 2.1+.

## 1.2.�Advantages

*   _memory costs are no longer on the server_
    
*   _many servers can be used inside a cluster, so the memory is virtually unlimited_
    
*   _the cache is 100% persistent. A restart of OpenSIPS server will not affect the DB. The Cassandra DB is also persistent so it can also be restarted without loss of information._
    
*   _Cassandra is an open-source project so it can be used to exchange data with various other applications_
    
*   _By creating a Cassandra Cluster, multiple OpenSIPS instances can easily share key-value information_
    

## 1.3.�Limitations

*   _keys (in key:value pairs) may not contain spaces or control characters_
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

None.

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libuv_
    
*   _cassandra-cpp-driver_
    

The DataStax C/C++ driver for Cassandra and the libuv dependency can be downloaded from: [http://downloads.datastax.com/cpp-driver/](http://downloads.datastax.com/cpp-driver/).

## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

Cassandra does not support regular columns in a table that contains any counter columns so in order to use the add()/sub()/get\_counter() methods in the Key-Value Interface you can specify an extra table reserved only for counters.

The database part of the URL needs to be in the format _Keyspace.Table\[.CountersTable\]_.

**Example�1.1.�Set `cachedb_url` parameter**

...
modparam("cachedb\_cassandra", "cachedb\_url",
	"cassandra:group1://localhost:9042/keyspace1.users.counters");

# Defining multiple contact points for a Cassandra cluster
modparam("cachedb\_cassandra", "cachedb\_url",
	"cassandra:cluster1://10.0.0.10,10.0.0.15/keyspace2.keys.counters");
...
	

  

**Example�1.2.�Use Cassandra servers**

...
cache\_store("cassandra:group1","key","$ru value");
cache\_fetch("cassandra:cluster1","key",$avp(10));
cache\_remove("cassandra:cluster1","key");
...
	

  

### 1.5.2.�`connect_timeout` (int)

The timeout in ms that will be triggered in case a connection attempt fails.

_Default value is “5000”._

**Example�1.3.�Set `connect_timeout` parameter**

...
modparam("cachedb\_cassandra", "connect\_timeout",1000);
...
	

  

### 1.5.3.�`query_timeout` (int)

The timeout in ms that will be triggered in case a Cassandra query takes too long.

_Default value is “5000”._

**Example�1.4.�Set `query_timeout` parameter**

...
modparam("cachedb\_cassandra", "query\_timeout",1000);
...
	

  

### 1.5.4.�`wr_consistency_level` (int)

The consistency level desired for write operations. Options are :

*   _all_ - A write must be written to the commit log and memtable on all replica nodes in the cluster for that partition.
    
*   _each\_quorum_ - Strong consistency. A write must be written to the commit log and memtable on a quorum of replica nodes in each datacenter.
    
*   _quorum_ - A write must be written to the commit log and memtable on a quorum of replica nodes across all datacenters.
    
*   _local\_quorum_ - Strong consistency. A write must be written to the commit log and memtable on a quorum of replica nodes in the same datacenter as the coordinator. Avoids latency of inter-datacenter communication.
    
*   _one_ - A write must be written to the commit log and memtable of at least one replica node.
    
*   _two_ - A write must be written to the commit log and memtable of at least two replica node.
    
*   _three_ - A write must be written to the commit log and memtable of at least three replica node.
    
*   _local\_one_ - A write must be sent to, and successfully acknowledged by, at least one replica node in the local datacenter.
    
*   _any_ - A write must be written to at least one node. If all replica nodes for the given partition key are down, the write can still succeed after a hinted handoff has been written. If all replica nodes are down at write time, an ANY write is not readable until the replica nodes for that partition have recovered.
    

Default value is _one_.

**Example�1.5.�Set `wr_consistency_level` parameter**

...
modparam("cachedb\_cassandra", "wr\_consistency\_level", "each\_quorum");
...
	

  

### 1.5.5.�`rd_consistency_level` (int)

The consistency level desired for write operations. Options are :

*   _all_ - Returns the record after all replicas have responded. The read operation will fail if a replica does not respond.
    
*   _quorum_ - Returns the record after a quorum of replicas from all datacenters has responded.
    
*   _local\_quorum_ - Returns the record after a quorum of replicas in the current datacenter as the coordinator has reported. Avoids latency of inter-datacenter communication.
    
*   _one_ - Returns a response from the closest replica, as determined by the snitch. By default, a read repair runs in the background to make the other replicas consistent.
    
*   _two_ - Returns the most recent data from two of the closest replicas.
    
*   _three_ - Returns the most recent data from three of the closest replicas.
    
*   _local\_one_ - Returns a response from the closest replica in the local datacenter.
    
*   _serial_ - Allows reading the current (and possibly uncommitted) state of data without proposing a new addition or update. If a SERIAL read finds an uncommitted transaction in progress, it will commit the transaction as part of the read. Similar to QUORUM.
    
*   _local\_serial_ - Same as SERIAL, but confined to the datacenter. Similar to LOCAL\_QUORUM.
    

Default value is _one_.

**Example�1.6.�Set `rd_consistency_level` parameter**

...
modparam("cachedb\_cassandra", "rd\_consistency\_level", "quorum");
...
	

  

### 1.5.6.�`exec_threshold` (int)

A cassandra cache query that lasts more than this threshold will trigger a warning message to the log.

This value, if set, only makes sense to be lower than the [query\_timeout](#param_query_timeout "1.5.3.�query_timeout (int)") since any query taking longer than that value will be dropped anyway.

_Default value is “0 ( unlimited - no warnings )”._

**Example�1.7.�Set `exec_threshold` parameter**

...
modparam("cachedb\_cassandra", "exec\_threshold", 100000)
...
	

  

## 1.6.�Exported Functions

The module does not export functions to be used in configuration script.

## 1.7.�Table Schema

The table required for supporting the cache\_store()/cache\_fetch()/cache\_remove() functions of the Key-Value interface needs to have at least the following columns:

*   _opensipskey_ - as the primary key with type "text"
    
*   _opensipsval_ - with type "text"
    

The table required for supporting the cache\_add()/cache\_sub()/cache\_counter\_fetch() functions of the Key-Value interface needs to have at least the following columns:

*   _opensipskey_ - as the primary key with type "text"
    
*   _opensipsval_ - with type "counter"
    

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

373

13

1998

21057

2.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

188

7

21444

38

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

11

9

39

50

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

8

6

16

14

5.

fabriziopicconi

4

2

5

5

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

3

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

3

1

8.

Juli�n Moreno Pati�o

3

1

1

1

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

10.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

2

1

2

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2021

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Jan 2021

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jun 2020

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

May 2015 - May 2015

9.

fabriziopicconi

Apr 2014 - Apr 2014

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Dec 2011 - Nov 2013

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Juli�n Moreno Pati�o, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2011 [www.opensips-solutions.com](http://www.opensips-solutions.com/)