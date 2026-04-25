## 1.3.�Exported Parameters

All these parameters can be used from the opensips.cfg file, to configure the behavior of OpenSIPS-WSS.

### 1.3.1.�`listen`\=interface

This is a global parameter that specifies what interface/IP and port should handle WSS traffic.

**Example�1.1.�Set `listen` variable**

...
socket= wss:1.2.3.4:44344
...
				

  

### 1.3.2.�`wss_port` (integer)

The default port to be used for all WSS related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the WSS listeners) and the SIP sending part (if the destination WSS URI has no explicit port).

If you want to change only the listening port for WSS, use the port option in the SIP listener defintion.

_Default value is 443._

**Example�1.2.�Set `wss_port` variable**

...
modparam("proto\_wss", "wss\_port", 44344)
...
				

  

### 1.3.3.�`wss_max_msg_chunks` (integer)

The maximum number of chunks in which a SIP message is expected to arrive via WSS. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 4._

**Example�1.3.�Set `wss_max_msg_chunks` parameter**

...
modparam("proto\_wss", "wss\_max\_msg\_chunks", 8)
...

  

### 1.3.4.�`wss_resource` (string)

The resource queried for when a WebSocket handshake is initiated.

_Default value is “/”._

**Example�1.4.�Set `wss_resource` parameter**

...
modparam("proto\_wss", "wss\_resource", "/wss")
...

  

### 1.3.5.�`wss_handshake_timeout` (integer)

This parameter specifies the time in milliseconds the proto\_wss module waits for a WebSocket handshake reply from a WebSocket server.

_Default value is 100._

**Example�1.5.�Set `wss_handshake_timeout` parameter**

...
modparam("proto\_wss", "wss\_handshake\_timeout", 300)
...

  

### 1.3.6.�`cert_check_on_conn_reusage` (integer)

This parameter turns on or off the extra checking/matching of the TLS domain (SSL certificate) when comes to reusing an existing TLS connection. Without this extra check, only IP and port of the connections will be check (in order to re-use an existing connection). With this extra check, the connection to be reused must have the same SSL certificate as the one set for the current signaling operation.

This checking is done only when comes to send SIP traffic via TLS and it is applied only against connections that were created / initiated by OpenSIPS (as TLS client). Any accepte connection (as TLS server) will automatically match (the extra test will be skipped).

_Default value is 0 (disabled)._

**Example�1.6.�Set `cert_check_on_conn_reusage` parameter**

...
modparam("proto\_wss", "cert\_check\_on\_conn\_reusage", 1)
...

  

### 1.3.7.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process. For each connection that is created an event containing information about the client and server certificate, master key, http request and reply belonging to web socket protocol handshake and network layer information shall be sent.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.7.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "hep\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto\_wss", "trace\_destination", "hep\_dest")
...

  

### 1.3.8.�`trace_on` (int)

This controls whether tracing for wss is on or not. You still need to define [trace\_destination](#param_trace_destination "1.3.7.�trace_destination (string)")in order to work, but this value will be controlled using mi function [wss\_trace](#mi_wss_trace "1.4.1.� wss_trace").

_Default value is 0(tracing inactive)._

**Example�1.8.�Set `trace_on` parameter**

...
modparam("proto\_wss", "trace\_on", 1)
...

  

### 1.3.9.�`trace_filter_route` (string)

Define the name of a route in which you can filter which connections will be trace and which connections won't be. In this route you will have information regarding source and destination ips and ports for the current connection. To disable tracing for a specific connection the last call in this route must be **drop**, any other exit mode resulting in tracing the current connection ( of course you still have to define a [trace\_destination](#param_trace_destination "1.3.7.�trace_destination (string)") and trace must be on at the time this connection is opened.

**IMPORTANT** Filtering on ip addresses and ports can be made using **$si** and **$sp** for matching either the entity that is connecting to OpenSIPS or the entity to which OpenSIPS is connecting. The name might be misleading ( **$si** meaning the source ip if you read the docs) but in reality it is simply the socket other than the OpenSIPS socket. In order to match OpenSIPS interface (either the one that accepted the connection or the one that initiated a connection) **$socket\_in(ip)** (ip) and **$socket\_in(port)** (port) can be used.

**WARNING:** IF [trace\_on](#param_trace_on "1.3.8.�trace_on (int)") is set to 0 or tracing is deactived via the mi command [wss\_trace](#mi_wss_trace "1.4.1.� wss_trace") this route won't be called.

_Default value is none(no route is set)._

**Example�1.9.�Set `trace_filter_route` parameter**

...
modparam("proto\_wss", "trace\_filter\_route", "wss\_filter")
...
/\* all wss connections will go through this route if tracing is activated
 \* and a trace destination is defined \*/
route\[wss\_filter\] {
	...
	/\* all connections opened from/by ip 1.1.1.1:8000 will be traced
	   on interface 1.1.1.10:5060(opensips listener)
	   all the other connections won't be \*/
	 if ( $si == "1.1.1.1" && $sp == 8000 &&
		$socket\_in(ip) == "1.1.1.10"  && $socket\_in(port) == 5060)
		exit;
	else
		drop;
}
...

  

### 1.3.10.�`wss_tls_handshake_timeout` (integer)

Sets the timeout (in milliseconds) for the SSL handshake sequence to complete. It may be necessary to increase this value when using a CPU intensive cipher for the connection to allow time for keys to be generated and processed.

The timeout is invoked during acceptance of a new connection (inbound) and during the wait period when a new session is being initiated (outbound).

_Default value is 100._

**Example�1.10.�Set `wss_tls_handshake_timeout` variable**

param("proto\_wss", "wss\_tls\_handshake\_timeout", 200) # number of milliseconds

			

  

### 1.3.11.�`wss_send_timeout` (integer)

Sets the timeout (in milliseconds) for the send operations to complete

The send timeout is invoked for all TLS write operations, excluding the handshake process (see: wss\_tls\_handshake\_timeout)

_Default value is 100._

**Example�1.11.�Set `wss_send_timeout` variable**

modparam("proto\_wss", "wss\_send\_timeout", 200) # number of milliseconds

			

  

### 1.3.12.�`require_origin` (int)

Controls whether the module should require the Origin header or not.

_Default value is 1(require Origin header)._

**Example�1.12.�Set `require_origin` parameter**

modparam("proto\_wss", "require\_origin", no)