# proto\_tcp Module

### OpenSIPS Project

#### Edited by

### Razvan Crainea

Copyright � 2015 OpenSIPS Project

---

**List of Examples**

1.1. [Set `tcp_port` parameter](#idp260656)

1.2. [Set `tcp_send_timeout` parameter](#idp249664)

1.3. [Set `tcp_max_msg_chunks` parameter](#idp153568)

1.4. [Set `tcp_crlf_pingpong` parameter](#idp157888)

1.5. [Set `tcp_crlf_drop` parameter](#idp162752)

1.6. [Set `tcp_async` parameter](#idp167168)

1.7. [Set `tcp_async_max_postponed_chunks` parameter](#idp172064)

1.8. [Set `tcp_async_local_connect_timeout` parameter](#idp5572416)

1.9. [Set `tcp_async_local_write_timeout` parameter](#idp5577104)

1.10. [Set `tcp_parallel_handling` parameter](#idp5581360)

1.11. [Set `trace_destination` parameter](#idp5600576)

1.12. [Set `trace_on` parameter](#idp5617840)

1.13. [Set `trace_filter_route` parameter](#idp5629776)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The **proto\_tcp** module is a built-in transport module which implements SIP TCP-based communication. It does not handle TCP connections management, but only offers higher-level primitives to read and write SIP messages over TCP.

Once loaded, you will be able to define TCP listeners in your script, by adding its IP, and optionally the listening port, in your configuration file, similar to this example:

...
socket=tcp:127.0.0.1 		# change the listening IP
socket=tcp:127.0.0.1:5080	# change with the listening IP and port
...

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`tcp_port` (integer)

The default port to be used for all TCP related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the TCP listeners) and the SIP sending part (if the destination URI has no explicit port).

If you want to change only the listening port for TCP, use the port option in the SIP listener defintion.

_Default value is 5060._

**Example�1.1.�Set `tcp_port` parameter**

...
modparam("proto\_tcp", "tcp\_port", 5065)
...

  

### 1.3.2.�`tcp_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is 100 ms._

**Example�1.2.�Set `tcp_send_timeout` parameter**

...
modparam("proto\_tcp", "tcp\_send\_timeout", 200)
...

  

### 1.3.3.�`tcp_max_msg_chunks` (integer)

The maximum number of chunks that a SIP message is expected to arrive via TCP. If a packet is received more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending the traffic very fragmented in order to decrease our performance).

_Default value is 4._

**Example�1.3.�Set `tcp_max_msg_chunks` parameter**

...
modparam("proto\_tcp", "tcp\_max\_msg\_chunks", 8)
...

  

### 1.3.4.�`tcp_crlf_pingpong` (integer)

Send CRLF pong (\\r\\n) to incoming CRLFCRLF ping messages over TCP. By default it is enabled (1).

_Default value is 1 (enabled)._

**Example�1.4.�Set `tcp_crlf_pingpong` parameter**

...
modparam("proto\_tcp", "tcp\_crlf\_pingpong", 0)
...

  

### 1.3.5.�`tcp_crlf_drop` (integer)

Drop CRLF (\\r\\n) ping messages. When this parameter is enabled, the TCP layer drops packets that contains a single CRLF message. If a CRLFCRLF message is received, it is handled according to the _tcp\_crlf\_pingpong_ parameter.

_Default value is 0 (disabled)._

**Example�1.5.�Set `tcp_crlf_drop` parameter**

...
modparam("proto\_tcp", "tcp\_crlf\_drop", 1)
...

  

### 1.3.6.�`tcp_async` (integer)

If the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write). If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

_Default value is 1 (enabled)._

**Example�1.6.�Set `tcp_async` parameter**

...
modparam("proto\_tcp", "tcp\_async", 0)
...

  

### 1.3.7.�`tcp_async_max_postponed_chunks` (integer)

If _tcp\_async_ is enabled, this specifies the maximum number of SIP messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

_Default value is 32._

**Example�1.7.�Set `tcp_async_max_postponed_chunks` parameter**

...
modparam("proto\_tcp", "tcp\_async\_max\_postponed\_chunks", 16)
...

  

### 1.3.8.�`tcp_async_local_connect_timeout` (integer)

If _tcp\_async_ is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

_Default value is 100 ms._

**Example�1.8.�Set `tcp_async_local_connect_timeout` parameter**

...
modparam("proto\_tcp", "tcp\_async\_local\_connect\_timeout", 200)
...

  

### 1.3.9.�`tcp_async_local_write_timeout` (integer)

If _tcp\_async_ is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to TCP MAIN for polling.

_Default value is 10 ms._

**Example�1.9.�Set `tcp_async_local_write_timeout` parameter**

...
modparam("proto\_tcp", "tcp\_async\_local\_write\_timeout", 100)
...

  

### 1.3.10.�`tcp_parallel_handling` (integer)

This parameter says if the handling/processing (NOT READING) of the SIP messages should be done in parallel (after one SIP msg is read, while processing it, another READ op may be performed).

_Default value is 0 (disabled)._

**Example�1.10.�Set `tcp_parallel_handling` parameter**

...
modparam("proto\_tcp", "tcp\_parallel\_handling", 1)
...

  

### 1.3.11.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.11.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "hep\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto\_tcp", "trace\_destination", "hep\_dest")
...

  

### 1.3.12.�`trace_on` (int)

This controls whether tracing for tcp is on or not. You still need to define [Section�1.3.11, “`trace_destination` (string)”](#trace-destination "1.3.11.�trace_destination (string)")in order to work, but this value will be controlled using mi function [Section�1.4.1, “ `tcp_trace` ”](#tcp-trace "1.4.1.� tcp_trace").

_Default value is 0(tracing inactive)._

**Example�1.12.�Set `trace_on` parameter**

...
modparam("proto\_tcp", "trace\_on", 1)
...

  

### 1.3.13.�`trace_filter_route` (string)

Define the name of a route in which you can filter which connections will be trace and which connections won't be. In this route you will have information regarding source and destination ips and ports for the current connection. To disable tracing for a specific connection the last call in this route must be **drop**, any other exit mode resulting in tracing the current connection ( of course you still have to define a [Section�1.3.11, “`trace_destination` (string)”](#trace-destination "1.3.11.�trace_destination (string)") and trace must be on at the time this connection is opened.

**IMPORTANT** Filtering on ip addresses and ports can be made using **$si** and **$sp** for matching either the entity that is connecting to OpenSIPS or the entity to which OpenSIPS is connecting. The name might be misleading ( **$si** meaning the source ip if you read the docs) but in reality it is simply the socket other than the OpenSIPS socket. In order to match OpenSIPS interface (either the one that accepted the connection or the one that initiated a connection) **$socket\_in(ip)** (ip) and **$socket\_in(port)** (port) can be used.

**WARNING:** IF [Section�1.3.12, “`trace_on` (int)”](#trace-on "1.3.12.�trace_on (int)") is set to 0 or tracing is deactived via the mi command [Section�1.4.1, “ `tcp_trace` ”](#tcp-trace "1.4.1.� tcp_trace") this route won't be called.

_Default value is none(no route is set)._

**Example�1.13.�Set `trace_filter_route` parameter**

...
modparam("proto\_tcp", "trace\_filter\_route", "tcp\_filter")
...
/\* all tcp connections will go through this route if tracing is activated
 \* and a trace destination is defined \*/
route\[tcp\_filter\] {
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

  

## 1.4.�Exported MI Functions

### 1.4.1.� `tcp_trace`

Name: _tcp\_trace_

Parameters:

*   trace\_mode(optional): set tcp tracing on and off. This parameter can be missing and the command will show the current tracing status for this module( on or off ); Possible values:
    
    *   on
        
    *   off
        
    

MI FIFO Command Format:

			:tcp\_trace:\_reply\_fifo\_file\_
			trace\_mode
			\_empty\_line\_
			

## Chapter�2.�Frequently Asked Questions

**2.1.**

After switching to OpenSIPS 2.1, I'm getting this error: "listeners found for protocol tcp, but no module can handle it"

You need to load the "proto\_tcp" module. In your script, make sure you do a **loadmodule "proto\_tcp.so"** after setting the **[mpath](https://opensips.org/Documentation/Script-CoreParameters-2-1#toc74)**.

**2.2.**

I cannot locate "proto\_tcp.so". Where is it?

The "proto\_udp" and "proto\_tcp" modules are simply built into the opensips binary by default. They are not available as shared libraries, but look like modules for code consistency reasons.