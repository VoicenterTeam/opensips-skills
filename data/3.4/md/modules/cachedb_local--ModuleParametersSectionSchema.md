## 1.4.�Exported Parameters

### 1.4.1.�`cachedb_url` (string)

URLs of local cache groups to be used used for the script and MI cacheDB operations. The parameter can be set multiple times.

One collection can belong to multiple URLs, but one URL can have only one collection. Redefining an URL with the same schema and group name will result in overwriting that URL. Each collection used in URL definition must be defined using _cachedb\_collection_ parameter. The collection shall be defined as a normal database, at the end of the URL as in the examples. In the script the collection shall be identified using the schema and, if exists, the group name.

_“If no URL defined, the url with no group name and collection "default" will be used.”._

**Example�1.1.�Set `cachedb_url` parameter**

...
### for this example, if no collection is defined, the default collection named
### "default" shall be used
modparam("cachedb\_local", "cachedb\_url", "local://")
### this URL will use the collection named collection1; it will overwrite the
### previous url definition which was using the "default" collection
modparam("cachedb\_local", "cachedb\_url", "local:///collection1")
### this URL will use collection2; it will be referenced from the script
### with "local:group2"
modparam("cachedb\_local", "cachedb\_url", "local:group2:///collection2")

## how to use the URLs from the script
## as defined above, this call will use collection1
cache\_store("local", ...)
## as defined above, this call will use collection2
cache\_store("local:group2", ...)
...
	

  

### 1.4.2.�`cache_collections` (string)

Using this parameter, collections(hash tables) and their sizes can be defined. Each collection definition must be separated one from another using ';'. Default size for a hash is 512. The size must be separated from the name of the collection using '='.

If clustering is enabled you have to specify which collections you want to replicate with the _/r_ suffix to the collection name.

The _"default"_ collection always gets created, even when not included in this list of collections.

**Example�1.2.�Set `cache_collections` parameter**

...
## creating collection1 with default size (512) and collection2 with custom size
## 2^5 (32); we also changed the size of the default collection, which would have been
## created anyway from 2^9 - 512 (default value) to 2^4 - 16
## also, collection1 and collection2 will be replicated in the cluster, while the
## default collection will be local to this node
modparam("cachedb\_local", "cache\_collections", "collection1/r; collection2/r = 5; default = 4")
...
	

  

### 1.4.3.�`cache_clean_period` (int)

The time interval in seconds at which to go through all the records and delete the expired ones.

_Default value is “600 (10 minutes)”._

**Example�1.3.�Set `cache_clean_period` parameter**

...
modparam("cachedb\_local", "cache\_clean\_period", 1200)
...
	

  

### 1.4.4.�`cluster_id` (int)

Specifies the cluster ID which this instance will send to and receive cache data.

This OpenSIPS cluster exposes the **"cachedb-local-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

Default value is 0 (replication disabled).

**Example�1.4.�Setting the `cluster_id` parameter**

...
modparam("cachedb\_local", "cluster\_id", 1)
...
		

  

### 1.4.5.�`cluster_persistency` (string)

Controls the behavior of the OpenSIPS local cachedb clustering following a restart.

This parameter may take the following values:

*   _"none"_ - no explicit data synchronization following a restart. The node starts empty.
    
*   _"sync-from-cluster"_ - enable cluster-based restart persistency. Following a restart, an OpenSIPS cluster node will search for a healthy "donor" node from which to mirror the entire user location dataset via direct cluster sync (TCP-based, binary-encoded data transfer). This will require the configuration of one or multiple "seed" nodes in the cluster.
    

_Default value is _"sync-from-cluster"_._

**Example�1.5.�Set `cluster_persistency` parameter**

...
modparam("cachedb\_local", "cluster\_persistency", "sync-from-cluster")
...
		

  

### 1.4.6.�`enable_restart_persistency` (int)

Enable restart persistency using the persistent memory mechanism. Data is stored in a cache file that is mapped against OpenSIPS memory.

Note that you have to keep the same collection definitions from a previous run in order to use the cached data for the respective collections.

If cluster persistency is enabled as well, keys loaded from the persistent cache will be discarded if they are not received in the cluster sync data.

_Default value is “0 (disabled)”._

**Example�1.6.�Set `enable_restart_persistency` parameter**

...
modparam("cachedb\_local", "enable\_restart\_persistency", yes)
...