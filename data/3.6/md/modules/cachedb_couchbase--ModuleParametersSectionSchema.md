## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script. The format of the URL is couchbase\[:identifier\]://\[username:password@\]IP:Port/bucket\_name

**Example�1.1.�Set `cachedb_url` parameter**

...
modparam("cachedb\_couchbase", "cachedb\_url","couchbase:group1://localhost:6379/default")
modparam("cachedb\_couchbase", "cachedb\_url","couchbase:cluster1://random\_url:8888/my\_bucket")
# Multiple hosts
modparam("cachedb\_couchbase", "cachedb\_url","couchbase:cluster1://random\_url1:8888,random\_url2:8888,random\_url3:8888/my\_bucket")
...
	

  

### 1.5.2.�`timeout` (int)

The max duration in microseconds that a couchbase op is expected to last. Default is 3000000 ( 3 seconds )

**Example�1.2.�Set `timeout` parameter**

...
modparam("cachedb\_couchbase", "timeout",5000000);
...
	

  

### 1.5.3.�`exec_threshold` (int)

The maximum number of microseconds that a couchbase query can last. Anything above the threshold will trigger a warning message to the log

_Default value is “0 ( unlimited - no warnings )”._

**Example�1.3.�Set `exec_threshold` parameter**

...
modparam("cachedb\_couchbase", "exec\_threshold", 100000)
...
	

  

### 1.5.4.�`lazy_connect` (int)

Delay connecting to a bucket until the first time it is used. Connecting to many buckets at startup can be time consuming. This option allows for faster startup by delaying connections until they are needed. This option can be dangerous for untested bucket configurations/settings. Always test first without lazy\_connect. This option will show errors in the log during the first access made to a bucket. Default is 0 ( Connect to all buckets on startup )

**Example�1.4.�Set `lazy_connect` parameter**

...
modparam("cachedb\_couchbase", "lazy\_connect", 1);
...
	

  

**Example�1.5.�Use CouchBase servers**

...
cache\_store("couchbase:group1","key","$ru value");
cache\_fetch("couchbase:cluster1","key",$avp(10));
cache\_remove("couchbase:cluster1","key");
...
	

  

### 1.5.5.�Exported Functions

The module does not export functions to be used in configuration script.