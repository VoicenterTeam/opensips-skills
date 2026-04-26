# proto_bin Module Reference
<!-- generated-from: data/4.0/modules/proto_bin.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 proto_bin module. Read this file when configuring or debugging the proto_bin module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The **proto_bin** module is a transport module which implements Binary Interface TCP-based communication. It does not handle TCP connections management, but only offers higher-level primitives to read and write BIN messages over TCP. It calls registered callback functions for every complete message received.

Once loaded, you will be able to define BIN listeners in your configuration file by adding their IP and, optionally, a listening port, similar to this example:

...
socket= bin:127.0.0.1 		# change the listening IP
socket= bin:127.0.0.1:5080	# change the listening IP and port
...

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `bin_async` (integer)

Specifies whether the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

*Default value is 1 (enabled)..*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("proto_bin", "bin_async", 0)
```
### `bin_async_local_write_timeout` (integer)

If _bin_async_ is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to bin MAIN for polling.

*Default value is 10 ms.*

**Example.** 100.

```opensips
modparam("proto_bin", "tcp_async_local_write_timeout", 100)
```
### `bin_async_max_postponed_chunks` (integer)

If _bin_async_ is enabled, this specifies the maximum number of BIN messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

*Default value is 1024.*

**Example.** 1024.

```opensips
modparam("proto_bin", "bin_async_max_postponed_chunks", 1024)
```
### `bin_max_msg_chunks` (integer)

The maximum number of chunks in which a BIN message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

*Default value is 32.*

**Example.** 8.

```opensips
modparam("proto_bin", "bin_max_msg_chunks", 8)
```
### `bin_port` (integer)

The default port to be used by all TCP listeners.

*Default value is 5555.*

**Example.** 6666.

```opensips
modparam("proto_bin", "bin_port", 6666)
```
### `bin_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

*Default value is 100 ms.*

**Example.** 200.

```opensips
modparam("proto_bin", "bin_send_timeout", 200)
```

## Configuration Examples

### Set `bin_port` parameter

The default port to be used by all TCP listeners.

```opensips
...
modparam("proto_bin", "bin_port", 6666)
...
```
### Set `bin_send_timeout` parameter

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

```opensips
...
modparam("proto_bin", "bin_send_timeout", 200)
...
```
### Set `bin_max_msg_chunks` parameter

The maximum number of chunks in which a BIN message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

```opensips
...
modparam("proto_bin", "bin_max_msg_chunks", 8)
...
```
### Set `bin_async` parameter

Specifies whether the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

```opensips
...
modparam("proto_bin", "bin_async", 0)
...
```
### Set `bin_async_max_postponed_chunks` parameter

If _bin_async_ is enabled, this specifies the maximum number of BIN messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

```opensips
...
modparam("proto_bin", "bin_async_max_postponed_chunks", 1024)
...
```
### Set `bin_async_local_write_timeout` parameter

If _bin_async_ is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to bin MAIN for polling.

```opensips
...
modparam("proto_bin", "tcp_async_local_write_timeout", 100)
...
```
