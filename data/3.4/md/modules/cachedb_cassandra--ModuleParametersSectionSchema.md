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