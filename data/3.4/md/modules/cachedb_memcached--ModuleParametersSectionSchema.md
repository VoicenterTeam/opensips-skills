## 1.5.�Exported Parameters

### 1.5.1.�`cachedb_url` (string)

The urls of the server groups that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations. It can be set more than one time. The prefix part of the URL will be the identifier that will be used from the script.

**Example�1.1.�Set `cachedb_url` parameter**

...
modparam("cachedb\_memcached", "cachedb\_url","memcached:group1://localhost:9999,127.0.0.1/");
modparam("cachedb\_memcached", "cachedb\_url","memcached:y://random\_url:8888/");
...
	

  

**Example�1.2.�Use memcached servers**

...
cache\_store("memcached:group1","key","$ru value");
cache\_fetch("memcached:y","key",$avp(10));
cache\_remove("memcached:group1","key");
...
	

  

### 1.5.2.�`exec_threshold` (int)

The maximum number of microseconds that a local cache query can last. Anything above the threshold will trigger a warning message to the log

_Default value is “0 ( unlimited - no warnings )”._

**Example�1.3.�Set `exec_threshold` parameter**

...
modparam("cachedb\_memcached", "exec\_threshold", 100000)
...
	

  

### 1.5.3.�Exported Functions

The module does not export functions to be used in configuration script.