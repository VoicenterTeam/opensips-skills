# proto_tcp Module Reference
<!-- generated-from: data/3.6/modules/proto_tcp.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 proto_tcp module. Read this file when configuring or debugging the proto_tcp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The **proto_tcp** module is a built-in transport module which implements SIP TCP-based communication. It does not handle TCP connections management, but only offers higher-level primitives to read and write SIP messages over TCP.

Once loaded, you will be able to define TCP listeners in your script, by adding its IP, and optionally the listening port, in your configuration file, similar to this example:

...
socket=tcp:127.0.0.1 		# change the listening IP
socket=tcp:127.0.0.1:5080	# change with the listening IP and port
...

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `tcp_async` (integer)

If the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write). If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
modparam("proto_tcp", "tcp_async", 0)
```
### `tcp_async_local_connect_timeout` (integer)

If tcp_async is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

*Default value is 100 ms.*

**Example.** 200.

```opensips
modparam("proto_tcp", "tcp_async_local_connect_timeout", 200)
```
### `tcp_async_local_write_timeout` (integer)

If tcp_async is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to TCP MAIN for polling.

*Default value is 10 ms.*

**Example.** 100.

```opensips
modparam("proto_tcp", "tcp_async_local_write_timeout", 100)
```
### `tcp_async_max_postponed_chunks` (integer)

If tcp_async is enabled, this specifies the maximum number of SIP messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

*Default value is 32.*

**Example.** 16.

```opensips
modparam("proto_tcp", "tcp_async_max_postponed_chunks", 16)
```
### `tcp_crlf_drop` (integer)

Drop CRLF (\r\n) ping messages. When this parameter is enabled, the TCP layer drops packets that contains a single CRLF message. If a CRLFCRLF message is received, it is handled according to the _tcp_crlf_pingpong_ parameter.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("proto_tcp", "tcp_crlf_drop", 1)
```
### `tcp_crlf_pingpong` (integer)

Send CRLF pong (\r\n) to incoming CRLFCRLF ping messages over TCP. By default it is enabled (1).

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
modparam("proto_tcp", "tcp_crlf_pingpong", 0)
```
### `tcp_max_msg_chunks` (integer)

The maximum number of chunks that a SIP message is expected to arrive via TCP. If a packet is received more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending the traffic very fragmented in order to decrease our performance).

*Default value is 4.*

**Example.** 8.

```opensips
modparam("proto_tcp", "tcp_max_msg_chunks", 8)
```
### `tcp_parallel_handling` (integer)

This parameter says if the handling/processing (NOT READING) of the SIP messages should be done in parallel (after one SIP msg is read, while processing it, another READ op may be performed).

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("proto_tcp", "tcp_parallel_handling", 1)
```
### `tcp_port` (integer)

The default port to be used for all TCP related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the TCP listeners) and the SIP sending part (if the destination URI has no explicit port).

If you want to change only the listening port for TCP, use the port option in the SIP listener defintion.

*Default value is 5060.*

**Example.** 5065.

```opensips
modparam("proto_tcp", "tcp_port", 5065)
```
### `tcp_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

*Default value is 100 ms.*

**Example.** 200.

```opensips
modparam("proto_tcp", "tcp_send_timeout", 200)
```
### `trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process.

*Default value is none (not defined).*

**Notes:** **WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto_hep**).

**Example.** hep_dest.

```opensips
modparam("proto_hep", "hep_id", "\[hep_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto_tcp", "trace_destination", "hep_dest")
```
### `trace_filter_route` (string)

Define the name of a route in which you can filter which connections will be trace and which connections won't be. In this route you will have information regarding source and destination ips and ports for the current connection. To disable tracing for a specific connection the last call in this route must be **drop**, any other exit mode resulting in tracing the current connection ( of course you still have to define a [Section 1.3.11, “`trace_destination` (string)”](#trace-destination "1.3.11.trace_destination (string)") and trace must be on at the time this connection is opened.

*Default value is none (no route is set).*

**Notes:** **IMPORTANT** Filtering on ip addresses and ports can be made using **$si** and **$sp** for matching either the entity that is connecting to OpenSIPS or the entity to which OpenSIPS is connecting. The name might be misleading ( **$si** meaning the source ip if you read the docs) but in reality it is simply the socket other than the OpenSIPS socket. In order to match OpenSIPS interface (either the one that accepted the connection or the one that initiated a connection) **$socket_in(ip)** (ip) and **$socket_in(port)** (port) can be used. **WARNING:** IF [Section 1.3.12, “`trace_on` (int)”](#trace-on "1.3.12.trace_on (int)") is set to 0 or tracing is deactived via the mi command [Section 1.4.1, “ `tcp_trace` ”](#tcp-trace "1.4.1. tcp_trace") this route won't be called.

**Example.** tcp_filter.

```opensips
modparam("proto_tcp", "trace_filter_route", "tcp_filter")
...
/* all tcp connections will go through this route if tracing is activated
 * and a trace destination is defined */
route\[tcp_filter\] {
	...
	/* all connections opened from/by ip 1.1.1.1:8000 will be traced
	   on interface 1.1.1.10:5060(opensips listener)
	   all the other connections won't be */
	 if ( $si == "1.1.1.1" && $sp == 8000 &&
		$socket_in(ip) == "1.1.1.10"  && $socket_in(port) == 5060)
		exit;
	else
		drop;
}
```
### `trace_on` (int)

This controls whether tracing for tcp is on or not. You still need to define [Section 1.3.11, “`trace_destination` (string)”](#trace-destination "1.3.11.trace_destination (string)")in order to work, but this value will be controlled using mi function [Section 1.4.1, “ `tcp_trace` ”](#tcp-trace "1.4.1. tcp_trace").

*Default value is 0 (tracing inactive).*

**Example.** 1.

```opensips
modparam("proto_tcp", "trace_on", 1)
```

## Exported MI Functions

### `tcp_trace`

Set tcp tracing on and off. If the parameter is missing, the command will show the current tracing status for this module.

**Parameters:**

- `trace_mode` *(string, optional)* — set tcp tracing on and off. This parameter can be missing and the command will show the current tracing status for this module( on or off ); Possible values: on, off

**Returns:** The current tracing status (on or off) if no parameter is provided.

**Example.** MI FIFO Command Format

```fifo
			:tcp_trace:_reply_fifo_file_
			trace_mode
			_empty_line_
```

## Configuration Examples

### Set `tcp_port` parameter

Sets the `tcp_port` parameter.

```opensips
...
modparam("proto_tcp", "tcp_port", 5065)
...
```
### Set `tcp_send_timeout` parameter

Sets the `tcp_send_timeout` parameter.

```opensips
...
modparam("proto_tcp", "tcp_send_timeout", 200)
...
```
### Set `tcp_max_msg_chunks` parameter

Sets the `tcp_max_msg_chunks` parameter.

```opensips
...
modparam("proto_tcp", "tcp_max_msg_chunks", 8)
...
```
### Set `tcp_crlf_pingpong` parameter

Sets the `tcp_crlf_pingpong` parameter.

```opensips
...
modparam("proto_tcp", "tcp_crlf_pingpong", 0)
...
```
### Set `tcp_crlf_drop` parameter

Sets the `tcp_crlf_drop` parameter.

```opensips
...
modparam("proto_tcp", "tcp_crlf_drop", 1)
...
```
### Set `tcp_async` parameter

Sets the `tcp_async` parameter.

```opensips
...
modparam("proto_tcp", "tcp_async", 0)
...
```
### Set `tcp_async_max_postponed_chunks` parameter

Sets the `tcp_async_max_postponed_chunks` parameter.

```opensips
...
modparam("proto_tcp", "tcp_async_max_postponed_chunks", 16)
...
```
### Set `tcp_async_local_connect_timeout` parameter

Sets the `tcp_async_local_connect_timeout` parameter.

```opensips
...
modparam("proto_tcp", "tcp_async_local_connect_timeout", 200)
...
```
### Set `tcp_async_local_write_timeout` parameter

Sets the `tcp_async_local_write_timeout` parameter.

```opensips
...
modparam("proto_tcp", "tcp_async_local_write_timeout", 100)
...
```
### Set `tcp_parallel_handling` parameter

Sets the `tcp_parallel_handling` parameter.

```opensips
...
modparam("proto_tcp", "tcp_parallel_handling", 1)
...
```
### Set `trace_destination` parameter

Sets the `trace_destination` parameter.

```opensips
...
modparam("proto_hep", "hep_id", "\[hep_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto_tcp", "trace_destination", "hep_dest")
...
```
### Set `trace_on` parameter

Sets the `trace_on` parameter.

```opensips
...
modparam("proto_tcp", "trace_on", 1)
...
```
### Set `trace_filter_route` parameter

Sets the `trace_filter_route` parameter.

```opensips
...
modparam("proto_tcp", "trace_filter_route", "tcp_filter")
...
/* all tcp connections will go through this route if tracing is activated
 * and a trace destination is defined */
route[tcp_filter] {
	...
	/* all connections opened from/by ip 1.1.1.1:8000 will be traced
	   on interface 1.1.1.10:5060(opensips listener)
	   all the other connections won't be */
	 if ( $si == "1.1.1.1" && $sp == 8000 &&
		$socket_in(ip) == "1.1.1.10"  && $socket_in(port) == 5060)
		exit;
	else
		drop;
}
...
```
