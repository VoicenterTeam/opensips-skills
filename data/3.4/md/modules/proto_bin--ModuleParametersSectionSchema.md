## 1.3.�Exported Parameters

### 1.3.1.�`bin_port` (integer)

The default port to be used by all TCP listeners.

_Default value is 5555._

**Example�1.1.�Set `bin_port` parameter**

...
modparam("proto\_bin", "bin\_port", 6666)
...

  

### 1.3.2.�`bin_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is 100 ms._

**Example�1.2.�Set `bin_send_timeout` parameter**

...
modparam("proto\_bin", "bin\_send\_timeout", 200)
...

  

### 1.3.3.�`bin_max_msg_chunks` (integer)

The maximum number of chunks in which a BIN message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 32._

**Example�1.3.�Set `bin_max_msg_chunks` parameter**

...
modparam("proto\_bin", "bin\_max\_msg\_chunks", 8)
...

  

### 1.3.4.�`bin_async` (integer)

Specifies whether the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

_Default value is 1 (enabled)._

**Example�1.4.�Set `bin_async` parameter**

...
modparam("proto\_bin", "bin\_async", 0)
...

  

### 1.3.5.�`bin_async_max_postponed_chunks` (integer)

If _bin\_async_ is enabled, this specifies the maximum number of BIN messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

_Default value is 1024._

**Example�1.5.�Set `bin_async_max_postponed_chunks` parameter**

...
modparam("proto\_bin", "bin\_async\_max\_postponed\_chunks", 1024)
...

  

### 1.3.6.�`bin_async_local_connect_timeout` (integer)

If _bin\_async_ is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

_Default value is 100 ms._

**Example�1.6.�Set `bin_async_local_connect_timeout` parameter**

...
modparam("proto\_bin", "bin\_async\_local\_connect\_timeout", 200)
...

  

### 1.3.7.�`bin_async_local_write_timeout` (integer)

If _bin\_async_ is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to bin MAIN for polling.

_Default value is 10 ms._

**Example�1.7.�Set `bin_async_local_write_timeout` parameter**

...
modparam("proto\_bin", "tcp\_async\_local\_write\_timeout", 100)
...