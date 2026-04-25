# proto_bins Module Reference
<!-- generated-from: data/3.6/modules/proto_bins.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 proto_bins module. Read this file when configuring or debugging the proto_bins module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements a secure Binary communication protocol over TLS, to be used by the OpenSIPS clustering engine provided by the clusterer module.

Once loaded, you will be able to define BINS listeners in your configuration file by adding their IP and, optionally, a listening port, similar to this example:
...
socket= bins:127.0.0.1 		# change the listening IP
socket= bins:127.0.0.1:5557	# change the listening IP and port
...

## Dependencies

### OpenSIPs Modules

- `tls_mgm`
- `tls_openssl`
- `tls_wolfssl`

### External Libraries

None.

## Exported Parameters

### `bins_async` (integer)

Specifies whether the TCP/TLS connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP/TLS operations like connect and write.

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
modparam("proto\_bins", "bins\_async", 0)
```
### `bins_async_handshake_timeout` (integer)

If _tls_async_ is enabled, this specifies the number of milliseconds that a TLS handshake should be tried in blocking mode (optimization). If the handshake operation lasts more than this, the write will go to async mode and will be passed to tls MAIN for polling.

*Default value is 10 ms.*

**Example.** Set the `bins_async_handshake_timeout` parameter.

```opensips
modparam("proto_tls", "bins_async_handshake_timeout", 100)
```
### `bins_async_local_connect_timeout` (integer)

If bin_async is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

*Default value is 100 ms.*

**Example.** Set the `bins_async_local_connect_timeout` parameter.

```opensips
modparam("proto_bins", "bins_async_local_connect_timeout", 200)
```
### `bins_async_max_postponed_chunks` (integer)

If bins_async is enabled, this specifies the maximum number of BINS messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

*Default value is 32.*

**Example.** Set the `bins_async_max_postponed_chunks` parameter.

```opensips
modparam("proto_bins", "bins_async_max_postponed_chunks", 16)
```
### `bins_handshake_timeout` (integer)

Sets the timeout (in milliseconds) for the SSL/TLS handshake sequence to complete. It may be necessary to increase this value when using a CPU intensive cipher for the connection to allow time for keys to be generated and processed.

The timeout is invoked during acceptance of a new connection (inbound) and during the wait period when a new session is being initiated (outbound).

*Default value is 100.*

**Example.** 200.

```opensips
param("proto\_tls", "bins\_handshake\_timeout", 200) # number of milliseconds
```
### `bins_max_msg_chunks` (integer)

The maximum number of chunks in which a BINS message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

*Default value is 32.*

**Example.** 8.

```opensips
modparam("proto\_bins", "bins\_max\_msg\_chunks", 8)
```
### `bins_port` (integer)

The default port to be used by all BINS listeners.

*Default value is 5556.*

**Example.** 5557.

```opensips
modparam("proto\_bins", "bins\_port", 5557)
```
### `bins_send_timeout` (integer)

Sets the timeout (in milliseconds) for blocking send operations to complete.

The send timeout is invoked for all TLS write operations, excluding the handshake process (see: bins\_handshake\_timeout)

*Default value is 100 ms.*

**Example.** 200.

```opensips
modparam("proto\_bins", "bins\_send\_timeout", 200)
```
### `trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process. For each connection that is created an event containing information about the client and server certificates, master key and network layer information shall be sent.

*Default value is none(not defined).*

**Notes:** WARNING: A tracing module must be loaded in order for this parameter to work. (for example **proto_hep**).

**Example.** Set the `trace_destination` parameter.

```opensips
modparam("proto_hep", "hep_id", "[hep_dest]10.0.0.2;transport=tcp;version=3")
modparam("proto_bins", "trace_destination", "hep_dest")
```
### `trace_on` (int)

This controls whether tracing for tls is on or not. You still need to define [trace_destination](#param_trace_destination "1.3.9.�trace_destination (string)")in order to work, but this value will be controlled using mi function [bins_trace](#mi_bins_trace "1.4.1.� bins_trace").

*Default value is 0(tracing inactive).*

**Example.** Set the `trace_on` parameter.

```opensips
modparam("proto_bins", "trace_on", 1)
```

## Exported MI Functions

### `bins_trace`

Sets bins tracing on and off or shows the current tracing status.

**Parameters:**

- `trace_mode` *(string, optional)* — set bins tracing on and off. This parameter can be missing and the command will show the current tracing status for this module( on or off ); Possible values: on, off

**Returns:** The current tracing status (on or off).

**Example.** Turns bins tracing on.

```opensips-cli
opensips-cli -x mi bins_trace on
```

## Configuration Examples

### Set `bins_port` parameter

The default port to be used by all BINS listeners.

```opensips
...
modparam("proto_bins", "bins_port", 5557)
...
```
### Set `bins_handshake_timeout` variable

Sets the timeout (in milliseconds) for the SSL/TLS handshake sequence to complete. It may be necessary to increase this value when using a CPU intensive cipher for the connection to allow time for keys to be generated and processed.

```opensips
param("proto_tls", "bins_handshake_timeout", 200) # number of milliseconds
```
### Set `bins_send_timeout` parameter

Sets the timeout (in milliseconds) for blocking send operations to complete.

```opensips
...
modparam("proto_bins", "bins_send_timeout", 200)
...
```
### Set `bins_max_msg_chunks` parameter

The maximum number of chunks in which a BINS message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

```opensips
...
modparam("proto_bins", "bins_max_msg_chunks", 8)
...
```
### Set `bins_async` parameter

Specifies whether the TCP/TLS connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP/TLS operations like connect and write.

```opensips
...
modparam("proto_bins", "bins_async", 0)
...
```
### Set `bins_async_max_postponed_chunks` parameter

If bins_async is enabled, this specifies the maximum number of BINS messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

```opensips
...
modparam("proto_bins", "bins_async_max_postponed_chunks", 16)
...
```
### Set `bins_async_local_connect_timeout` parameter

If bin_async is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

```opensips
...
modparam("proto_bins", "bins_async_local_connect_timeout", 200)
...
```
### Set `bins_async_handshake_timeout` parameter

If tls_async is enabled, this specifies the number of milliseconds that a TLS handshake should be tried in blocking mode (optimization). If the handshake operation lasts more than this, the write will go to async mode and will be passed to tls MAIN for polling.

```opensips
	...
	modparam("proto_tls", "bins_async_handshake_timeout", 100)
	...
```
### Set `trace_destination` parameter

Trace destination as defined in the tracing module. Currently the only tracing module is proto_hep. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process. For each connection that is created an event containing information about the client and server certificates, master key and network layer information shall be sent.

```opensips
...
modparam("proto_hep", "hep_id", "[hep_dest]10.0.0.2;transport=tcp;version=3")

modparam("proto_bins", "trace_destination", "hep_dest")
...
```
### Set `trace_on` parameter

This controls whether tracing for tls is on or not. You still need to define trace_destination in order to work, but this value will be controlled using mi function bins_trace.

```opensips
...
modparam("proto_bins", "trace_on", 1)
...
```
