## 1.3.�Exported Parameters

### 1.3.1.�`hash_size` (int)

The size of the hash table that stores the gateway session information. It is the 2 logarithmic value of the real size.

_Default value is “10”_ (1024 records).

**Example�1.1.�Set `hash_size` parameter**

...
modparam("msrp\_gateway", "hash\_size", 16)
...
		

  

### 1.3.2.�`cleanup_interval` (int)

The interval between full iterations of the sessions table in order to clean up lingering sessions.

_Default value is “60”. (seconds)_

**Example�1.2.�Set `cleanup_interval` parameter**

...
modparam("msrp\_gateway", "cleanup\_interval", 60)
...
		

  

### 1.3.3.�`session_timeout` (int)

Amount of time (in seconds) since last message has been received from either side, after which a session should be terminated.

_The default value is 12 \* 3600 seconds (12 hours)._

**Example�1.3.�Set `session_timeout` parameter**

...
modparam("msrp\_gateway", "session\_timeout", 7200)
...
		

  

### 1.3.4.�`message_timeout` (int)

Amount of time (in seconds) since last MESSAGE has been received after which a session should be terminated.

_The default value is 2 \* 3600 seconds (2 hours)._

**Example�1.4.�Set `message_timeout` parameter**

...
modparam("msrp\_gateway", "message\_timeout", 3600)
...