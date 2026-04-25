## 1.3.�Exported Parameters

### 1.3.1.�`janus_send_timeout` (integer)

Time in milliseconds after a Janus WebSocket connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is “1000” (milliseconds)._

**Example�1.1.�Setting the `janus_send_timeout` parameter**

...
modparam("janus", "janus\_send\_timeout", 2000)
...

  

### 1.3.2.�`janus_max_msg_chunks` (integer)

The maximum number of chunks in which a Janus message is expected to arrive via WebSocket. If a received packet is more fragmented than this, the connection is dropped

_Default value is “4”_

**Example�1.2.�Setting the `janus_max_msg_chunks` parameter**

...
modparam("janus", "janus\_max\_msg\_chunks", 8)
...

  

### 1.3.3.�`janus_cmd_timeout` (integer)

The maximally allowed duration for the execution of an Janus command. This interval does not include the connect duration.

_Default value is “5000” (milliseconds)._

**Example�1.3.�Setting the `janus_cmd_timeout` parameter**

...
modparam("janus", "janus\_cmd\_timeout", 3000)
...

  

### 1.3.4.�`janus_cmd_polling_itv` (integer)

The sleep interval used when polling for an Janus command response. Since the value of this parameter imposes a minimal duration for any Janus command, you should run OpenSIPS in debug mode in order to first determine an expected response time for an arbitrary Janus command, then tune this parameter accordingly.

_Default value is “1000” (microseconds)._

**Example�1.4.�Setting the `janus_cmd_polling_itv` parameter**

...
modparam("janus", "janus\_cmd\_polling\_itv", 3000)
...

  

### 1.3.5.�`janus_ping_interval` (integer)

The time interval at which OpenSIPS will do keepalive pinging on the Janus connect

_Default value is “5” (seconds)._

**Example�1.5.�Setting the `janus_ping_interval` parameter**

...
modparam("janus", "janus\_ping\_interval", 10)
...

  

### 1.3.6.�`janus_db_url` (string)

The DB URL from where OpenSIPS will load the list of Janus connection

_Default value is “"none"” (needs to be set for the module to start)._

**Example�1.6.�Setting the `janus_db_url` parameter**

...
modparam("janus", "janus\_db\_url", "mysql://root@localhost/opensips")
...

  

### 1.3.7.�`janus_db_table` (string)

The DB Table from where OpenSIPS will load the list of Janus connection

_Default value is “janus”_

**Example�1.7.�Setting the `janus_db_table` parameter**

...
modparam("janus", "janus\_db\_table", "my\_janus\_table")
...