## 1.3.�Exported Parameters

### 1.3.1.�`cachedb_url` (string)

The url of the key-value back-end that will be used for storing the DNS records.

**Example�1.1.�Set `cachedb_url` parameter**

...
#use internal cachedb\_local module
modparam("dns\_cache", "cachedb\_url","local://")
#use cachedb\_memcached module with memcached server at 192.168.2.130
modparam("dns\_cache", "cachedb\_url","memcached://192.168.2.130:8888/")
...
		

  

### 1.3.2.�`blacklist_timeout` (int)

The number of seconds that a failed DNS query will be kept in cache. Default is 3600.

**Example�1.2.�Set `blacklist_timeout` parameter**

...
modparam("dns\_cache", "blacklist\_timeout",7200) # 2 hours
...
		

  

### 1.3.3.�`min_ttl` (int)

The minimum number of seconds that a DNS record will be kept in cache. If the TTL received in the DNS answer is lower than this value, the record will be cached for min\_ttl seconds.

_Default value is **0** seconds (no minimum TTL is enforced)._

**Example�1.3.�Set `min_ttl` parameter**

...
modparam("dns\_cache", "min\_ttl",300) # 5 minutes
...