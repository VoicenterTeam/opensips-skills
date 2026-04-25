## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The URLs of the server groups that OpenSIPS will connect to in order to allow the cache\_store(), cache\_fetch(), etc. functions to be used from the OpenSIPS script. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

The URL syntax is identical to the one used by MongoDB, including connect string options. For more info, please refer to [the official MongoDB connect string documentation](https://docs.mongodb.com/manual/reference/connection-string/).

**Example�1.3.�Set `cachedb_url` parameter**

...
# Connect to a single _mongod_ instance
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://localhost:27017/opensipsDB.dialog")

# Connect to a _mongod_ replica set
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://10.0.0.10,10.0.0.11:27017/opensipsDB.dialog?replicaSet=my-set")

# Connect to a _mongos_ instance (routes to a sharded cluster)
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://localhost/opensipsDB.dialog")

# Example of multiple connections:
#   \* to a main _mongos_, with failover to a backup _mongos_
#   \* to a single _mongod_
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb:cluster://localhost,10.0.0.10:27017/opensipsDB.dialog")
modparam("cachedb\_mongodb", "cachedb\_url",
         "mongodb://localhost:27017/opensipsDB.userlocation")
...
	

  

**Example�1.4.�Reference MongoDB connections**

...
cache\_store("mongodb", "key", "$ru value");
cache\_remove("mongodb:cluster", "key");
cache\_fetch("mongodb:instance1", "key", $avp(10));
...
	

  

### 1.5.2.�`exec_threshold` (int)

The maximum number of microseconds that a mongodb query can last. Anything above the threshold will trigger a warning message to the log

_Default value is “0 ( unlimited - no warnings )”._

**Example�1.5.�Set `exec_threshold` parameter**

...
modparam("cachedb\_mongodb", "exec\_threshold", 100000)
...
	

  

### 1.5.3.�`compat_mode_2.4` (int)

Switch the module into compatibility mode for MongoDB 2.4 servers. Specifically, this allows "insert/update/delete" raw queries to not fail, since they were introduced in MongoDB 2.6. The module will interpret the raw query JSON, convert it to its corresponding command and run it.

Caveat: only the minimally required raw query options are supported in this mode.

_Default value is “0 (disabled)”._

**Example�1.6.�Setting the `compat_mode_2.4` parameter**

...
modparam("cachedb\_mongodb", "compat\_mode\_2.4", 1)
...
	

  

### 1.5.4.�`compat_mode_3.0` (int)

Switch the module into compatibility mode for MongoDB 2.6/3.0 servers. Specifically, this allows "find" raw queries to not fail, since they were introduced in MongoDB 3.2. The module will interpret the "find" raw query JSON, convert it to its corresponding command and run it.

Caveat: only the minimally required options for "find" raw queries are supported in this mode.

_Default value is “0 (disabled)”._

**Example�1.7.�Setting the `compat_mode_3.0` parameter**

...
modparam("cachedb\_mongodb", "compat\_mode\_3.0", 1)
...