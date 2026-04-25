## 1.8.�Exported Parameters

### 1.8.1.�`cgrates_engine` (string)

This parameter is used to specify a CGRateS engine connection. The format is _IP\[:port\]_. The port is optional, and if missing, _2014_ is used.

This parameter can have multiple values, for each server used for failover. At least one server should be provisioned.

_Default value is “None”._

**Example�1.1.�Set `cgrates_engine` parameter**

...
modparam("cgrates", "cgrates\_engine", "127.0.0.1")
modparam("cgrates", "cgrates\_engine", "127.0.0.1:2013")
...

  

### 1.8.2.�`bind_ip` (string)

IP used to bind the socket that communicates with the CGRateS engines. This is useful to set when the engine is runing in a local, secure LAN, and you want to use that network to communicate with your servers. The parameter is optional.

_Default value is “not set - any IP is used”._

**Example�1.2.�Set `bind_ip` parameter**

...
modparam("cgrates", "bind\_ip", "10.0.0.100")
...

  

### 1.8.3.�`max_async_connections` (integer)

The maximum number of simultaneous asynchronous connections to a CGRateS engine.

_Default value is “10”._

**Example�1.3.�Set `max_async_connections` parameter**

...
modparam("cgrates", "max\_async\_connections", 20)
...

  

### 1.8.4.�`retry_timeout` (integer)

The number of seconds after which a disabled connection/engine is retried.

_Default value is “60”._

**Example�1.4.�Set `retry_timeout` parameter**

...
modparam("cgrates", "retry\_timeout", 120)
...

  

### 1.8.5.�`compat_mode` (integer)

Indicates whether OpenSIPS should use the old (compat\_mode) CGRateS version API (pre-rc8).

_Default value is “false (0)”._

**Example�1.5.�Set `compat_mode` parameter**

...
modparam("cgrates", "compat\_mode", 1)
...