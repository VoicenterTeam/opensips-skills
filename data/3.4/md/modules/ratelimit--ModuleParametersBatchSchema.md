## 1.6.�Exported Parameters

### 1.6.1.�`timer_interval` (integer)

The timer interval in seconds when the Network and Feedback algorithms run their queries, and the other algorithms reset their counters.

IMPORTANT: A too small value may lead to performance penalties due to timer process overloading.

_Default value is 10._

**Example�1.1.�Set `timer_interval` parameter**

...
modparam("ratelimit", "timer\_interval", 5)
...

  

### 1.6.2.�`limit_per_interval` (integer)

This parameter configures the way that a pipe's limit is specified in the _rl\_check_ function and only affects the Taildrop and RED algorithms. A value of 1 means that the limit is set per-_timer\_interval_ while a value of 0 means per-second.

_Default value is 0(limit per-second)._

**Example�1.2.�Set `limit_per_interval` parameter**

...
modparam("ratelimit", "limit\_per\_interval", 1)
...

  

### 1.6.3.�`expire_time` (integer)

This parameter specifies how long a pipe should be kept in memory after it becomes idle (no more operations are performed on the pipe) until deleted.

_Default value is 3600._

**Example�1.3.�Set `expire_time` parameter**

...
modparam("ratelimit", "expire\_time", 1800)
...

  

### 1.6.4.�`hash_size` (integer)

The size of the hash table internally used to keep the pipes. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

_Default value is 1024._

**Example�1.4.�Set `hash_size` parameter**

...
modparam("ratelimit", "hash\_size", 512)
...

  

### 1.6.5.�`default_algorithm` (string)

Specifies which algorithm should be assumed in case it isn't explicitly specified in the _rl\_check_ function.

_Default value is "TAILDROP"._

**Example�1.5.�Set `default_algorithm` parameter**

...
modparam("ratelimit", "default\_algorithm", "RED")
...

  

### 1.6.6.�`cachedb_url` (string)

Enables distributed rate limiting and specifies the backend that should be used by the CacheDB interface.

_Default value is "disabled"._

**Example�1.6.�Set `cachedb_url` parameter**

...
modparam("ratelimit", "cachedb\_url", "redis://root:root@127.0.0.1/")
...

  

### 1.6.7.�`db_prefix` (string)

Specifies what prefix should be added to the pipe name. This is only used when distributed rate limiting is enabled.

_Default value is "rl\_pipe\_"._

**Example�1.7.�Set `db_prefix` parameter**

...
modparam("ratelimit", "db\_prefix", "ratelimit\_")
...

  

### 1.6.8.�`repl_buffer_threshold` (string)

Used to specify the length of the buffer used by the binary replication, in bytes, when a flush should be performed - the pipes gathered until then should be sent on the network. This is used to avoid using large amount of memory for pipes replication.

_Default value is 32767 bytes._

**Example�1.8.�Set `repl_buffer_threshold` parameter**

...
modparam("ratelimit", "repl\_buffer\_threshold", 500)
...

  

### 1.6.9.�`repl_timer_interval` (string)

Timer in milliseconds, used to specify how often the module should replicate its counters to the other instances.

_Default value is 200 ms._

**Example�1.9.�Set `repl_timer_interval` parameter**

...
modparam("ratelimit", "repl\_timer\_interval", 100)
...

  

### 1.6.10.�`repl_timer_expire` (string)

Timer in seconds, used to specify when the counter received from a different instance should no longer be taken into account. This is used to prevent obsolete values, in case an instance stops replicating its counters.

_Default value is 10 s._

**Example�1.10.�Set `repl_timer_expire` parameter**

...
modparam("ratelimit", "repl\_timer\_expire", 10)
...

  

### 1.6.11.�`pipe_replication_cluster` (integer)

Specifies the cluster ID where pipes will be replicated to and received from.

_Default value is 0. (no replication)_

**Example�1.11.�Set `pipe_replication_cluster` parameter**

...
modparam("ratelimit", "pipe\_replication\_cluster", 1)
...

  

### 1.6.12.�`window_size` (int)

How long the history in SBT should be in seconds.

_Default value is “10”._

**Example�1.12.�Set `window_size` parameter**

...
modparam("ratelimit", "window\_size", 5)
...

  

### 1.6.13.�`slot_period` (int)

Value of one slot in milliseconds. This parameter determines how granular the algorithm should be. The number of slots will be determined by window\_size/slot\_period.

_Default value is “200”._

**Example�1.13.�Set `slot_period` parameter**

...
modparam("ratelimit", "window\_size", 5)
#we will have 50 slots of 100 milliseconds
modparam("ratelimit", "slot\_period", 100)
...