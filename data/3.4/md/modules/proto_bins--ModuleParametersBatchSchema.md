## 1.3.�Exported Parameters

### 1.3.1.�`bins_port` (integer)

The default port to be used by all BINS listeners.

_Default value is 5556._

**Example�1.1.�Set `bins_port` parameter**

...
modparam("proto\_bins", "bins\_port", 5557)
...

  

### 1.3.2.�`bins_handshake_timeout` (integer)

Sets the timeout (in milliseconds) for the SSL/TLS handshake sequence to complete. It may be necessary to increase this value when using a CPU intensive cipher for the connection to allow time for keys to be generated and processed.

The timeout is invoked during acceptance of a new connection (inbound) and during the wait period when a new session is being initiated (outbound).

_Default value is 100._

**Example�1.2.�Set `bins_handshake_timeout` variable**

param("proto\_tls", "bins\_handshake\_timeout", 200) # number of milliseconds

			

  

### 1.3.3.�`bins_send_timeout` (integer)

Sets the timeout (in milliseconds) for blocking send operations to complete.

The send timeout is invoked for all TLS write operations, excluding the handshake process (see: bins\_handshake\_timeout)

_Default value is 100 ms._

**Example�1.3.�Set `bins_send_timeout` parameter**

...
modparam("proto\_bins", "bins\_send\_timeout", 200)
...

  

### 1.3.4.�`bins_max_msg_chunks` (integer)

The maximum number of chunks in which a BINS message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 32._

**Example�1.4.�Set `bins_max_msg_chunks` parameter**

...
modparam("proto\_bins", "bins\_max\_msg\_chunks", 8)
...

  

### 1.3.5.�`bins_async` (integer)

Specifies whether the TCP/TLS connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP/TLS operations like connect and write.

_Default value is 1 (enabled)._

**Example�1.5.�Set `bins_async` parameter**

...
modparam("proto\_bins", "bins\_async", 0)
...

  

### 1.3.6.�`bins_async_max_postponed_chunks` (integer)

If bins\_async is enabled, this specifies the maximum number of BINS messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

_Default value is 32._

**Example�1.6.�Set `bins_async_max_postponed_chunks` parameter**

...
modparam("proto\_bins", "bins\_async\_max\_postponed\_chunks", 16)
...

  

### 1.3.7.�`bins_async_local_connect_timeout` (integer)

If bin\_async is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

_Default value is 100 ms._

**Example�1.7.�Set `bins_async_local_connect_timeout` parameter**

...
modparam("proto\_bins", "bins\_async\_local\_connect\_timeout", 200)
...

  

### 1.3.8.�`bins_async_handshake_timeout` (integer)

If _tls\_async_ is enabled, this specifies the number of milliseconds that a TLS handshake should be tried in blocking mode (optimization). If the handshake operation lasts more than this, the write will go to async mode and will be passed to tls MAIN for polling.

_Default value is 10 ms._

**Example�1.8.�Set `bins_async_handshake_timeout` parameter**

	...
	modparam("proto\_tls", "bins\_async\_handshake\_timeout", 100)
	...
	

  

### 1.3.9.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process. For each connection that is created an event containing information about the client and server certificates, master key and network layer information shall be sent.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.9.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "hep\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto\_bins", "trace\_destination", "hep\_dest")
...

  

### 1.3.10.�`trace_on` (int)

This controls whether tracing for tls is on or not. You still need to define [trace\_destination](#param_trace_destination "1.3.9.�trace_destination (string)")in order to work, but this value will be controlled using mi function [bins\_trace](#mi_bins_trace "1.4.1.� bins_trace").

_Default value is 0(tracing inactive)._

**Example�1.10.�Set `trace_on` parameter**

...
modparam("proto\_bins", "trace\_on", 1)
...