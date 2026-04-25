## 1.3.�Exported Parameters

### 1.3.1.�`ws_port` (integer)

The default port to be used for all WS related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the WS listeners) and the SIP sending part (if the destination WS URI has no explicit port).

If you want to change only the listening port for WS, use the port option in the SIP listener defintion.

_Default value is 80._

**Example�1.1.�Set `ws_port` parameter**

...
modparam("proto\_ws", "ws\_port", 8080)
...

  

### 1.3.2.�`ws_send_timeout` (integer)

Time in milliseconds after a WebSocket connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is 100 ms._

**Example�1.2.�Set `ws_send_timeout` parameter**

...
modparam("proto\_ws", "ws\_send\_timeout", 200)
...

  

### 1.3.3.�`ws_max_msg_chunks` (integer)

The maximum number of chunks in which a SIP message is expected to arrive via WebSocket. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 4._

**Example�1.3.�Set `ws_max_msg_chunks` parameter**

...
modparam("proto\_ws", "ws\_max\_msg\_chunks", 8)
...

  

### 1.3.4.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process. For each connection that is created an event containing information about http request and reply belonging to web socket protocol handshake and network layer information shall be sent.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.4.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "hep\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto\_ws", "trace\_destination", "hep\_dest")
...

  

### 1.3.5.�`trace_on` (int)

This controls whether tracing for ws is on or not. You still need to define [trace\_destination](#param_trace_destination "1.3.4.�trace_destination (string)")in order to work, but this value will be controlled using mi function [ws\_trace](#mi_ws_trace "1.4.1.� ws_trace").

_Default value is 0(tracing inactive)._

**Example�1.5.�Set `trace_on` parameter**

...
modparam("proto\_ws", "trace\_on", 1)
...

  

### 1.3.6.�`trace_filter_route` (string)

Define the name of a route in which you can filter which connections will be trace and which connections won't be. In this route you will have information regarding source and destination ips and ports for the current connection. To disable tracing for a specific connection the last call in this route must be **drop**, any other exit mode resulting in tracing the current connection ( of course you still have to define a [trace\_destination](#param_trace_destination "1.3.4.�trace_destination (string)") and trace must be on at the time this connection is opened.

**IMPORTANT** Filtering on ip addresses and ports can be made using **$si** and **$sp** for matching either the entity that is connecting to OpenSIPS or the entity to which OpenSIPS is connecting. The name might be misleading ( **$si** meaning the source ip if you read the docs) but in reality it is simply the socket other than the OpenSIPS socket. In order to match OpenSIPS interface (either the one that accepted the connection or the one that initiated a connection) **$socket\_in(ip)** (ip) and **$socket\_in(port)** (port) can be used.

**WARNING:** IF [trace\_on](#param_trace_on "1.3.5.�trace_on (int)") is set to 0 or tracing is deactived via the mi command [ws\_trace](#mi_ws_trace "1.4.1.� ws_trace") this route won't be called.

_Default value is none(no route is set)._

**Example�1.6.�Set `trace_filter_route` parameter**

...
modparam("proto\_ws", "trace\_filter\_route", "ws\_filter")
...
/\* all ws connections will go through this route if tracing is activated
 \* and a trace destination is defined \*/
route\[ws\_filter\] {
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

  

### 1.3.7.�`require_origin` (int)

Controls whether the module should require the Origin header or not.

_Default value is 1(require Origin header)._

**Example�1.7.�Set `require_origin` parameter**

...
modparam("proto\_ws", "require\_origin", no)
...