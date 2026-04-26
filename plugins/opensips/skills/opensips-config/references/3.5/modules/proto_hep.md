# proto_hep Module Reference
<!-- generated-from: data/3.5/modules/proto_hep.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 proto_hep module. Read this file when configuring or debugging the proto_hep module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The **proto_hep** module is a transport module which implements hepV1 and hepV2 UDP-based communication and hepV3 TCP-based communication. It also offers an API with which you can register callbacks which are called after the HEP header is parsed and also can pack sip messages to HEP messages.The unpacking part is done internally.

Once loaded, you will be able to define HEP listeners in your configuration file by adding their IP and, optionally, a listening port. You can define both TCP, UDP, and TLS listeners. On UDP you will be able to receive HEP v1, v2 and v3 packets, on TCP and TLS only HEPv3.

...
#HEPv3 listener
socket= hep_tcp:127.0.0.1:6061 		# change the listening IP
#HEPv1, v2, v3 listener
socket= hep_udp:127.0.0.1:6061 		# change the listening IP
...

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

### Optional Modules

- `tls_mgm`

## Exported Parameters

### `hep_async` (integer)

Specifies whether the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

*Default value is 1 (enabled).*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("proto_hep", "hep_async", 0)
```
### `hep_async_local_connect_timeout` (integer)

If hep_async is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

*Default value is 100 ms.*

**Example.** 200.

```opensips
modparam("proto_hep", "hep_async_local_connect_timeout", 200)
```
### `hep_async_local_write_timeout` (integer)

If _hep_async_ is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to bin MAIN for polling.

*Default value is 10.*

**Example.** 100.

```opensips
modparam("proto_hep", "hep_async_local_write_timeout", 100)
```
### `hep_async_max_postponed_chunks` (integer)

If hep_async is enabled, this specifies the maximum number of HEP messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

*Default value is 32.*

**Example.** 16.

```opensips
modparam("proto_hep", "hep_async_max_postponed_chunks", 16)
```
### `hep_capture_id` (integer)

The parameter indicate the capture agent ID for HEPv2/v3 protocol. Limitation: 16-bit integer.

*Default value is 1.*

**Notes:** Limitation: 16-bit integer.

**Example.** 234.

```opensips
modparam("proto_hep", "hep_capture_id", 234)
```
### `hep_id` (string)

Specify a destination for HEP packets and the version of HEP protocol used. All parameters inside hep_id must be separated by ;. The parameters are given in key-value format, the possible keys being uri, transport and version, except destiantion's URI which doesn't have a key and is in host:port . transport key can be TCP, UDP or TLS. TCP and TLS works only for HEP version 3. Version is the hep protocol version and can be 1, 2 or 3. HEPv1 and HEPv2 can use only UDP. HEPv3 can use TCP, UDP and TLS having the default set to TCP. If no hep version defined, the default is version 3 with TCP and TLS.

*Default value is NO default value.*

**Notes:** If hep_id the module can't be used for HEP tracing.

**Example.** [hep_dst] 127.0.0.1:8001; transport=tcp; version=3.

```opensips
/* define a destination to localhost on port 8001 using hepV3 on tcp */
modparam("proto_hep", "hep_id",
"[hep_dst] 127.0.0.1:8001; transport=tcp; version=3")
/* define a destination to 1.2.3.4 on port 5000 using hepV2; no transport(default UDP) */
modparam("proto_hep", "hep_id", "[hep_dst] 1.2.3.4:5000; version=2")
/* define only the destination uri; version will be 3(default) and transport TCP(default) */
modparam("proto_hep", "hep_id", "[hep_dst] 1.2.3.4:5000")
```
### `hep_max_msg_chunks` (integer)

The maximum number of chunks in which a HEP message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

*Default value is 32.*

**Example.** 8.

```opensips
modparam("proto_hep", "hep_max_msg_chunks", 8)
```
### `hep_port` (integer)

The default port to be used by all TCP/UDP/TLS listeners.

*Default value is 5656.*

**Example.** 6666.

```opensips
modparam("proto_hep", "hep_port", 6666)
```
### `hep_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

*Default value is 100.*

**Example.** 200.

```opensips
modparam("proto_hep", "hep_send_timeout", 200)
```
### `homer5_delim` (string)

In case homer5_on is set (different than 0), with this parameter you will be able to set the delmiter between different payload parts.

*Default value is :.*

**Example.** ##.

```opensips
modparam("proto_hep", "homer5_delim", "##")
```
### `homer5_on` (integer)

Specify how the data should be encapsulated in the HEP packet. If set to 0, then the JSON based HOMER 6 format will be used. Otherwise, if set to anything different than 0, the plain text HOMER 5 format will be used for encapsulation. On the capturing node, this parameter affects the behavior of the report_capture function from the sipcapture module.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("proto_hep", "homer5_on", 0)
```

## Exported Functions

### `correlate(hep_id, type1, correlation1, type2, correlation2)`

Send a hep message with an extra correlation id containing the two correlation given as arguments. The two types must differ. This will help on the capturing side to correlate two calls for example, being given their callid as correlation ids.

**Parameters:**

- `correlation1` *(string, required)* — the first extra correlation id that will be put in the extra correlation chunk.
- `correlation2` *(string, required)* — the second extra correlation id that will be put in the extra correlation chunk.
- `hep_id` *(string, required)* — the name of the _hep_id_ defined in modparam section, specifying where to do the tracing.
- `type1` *(string, required)* — the key name identify the first correlation id.
- `type2` *(string, required)* — the key name identify the second correlation id.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** Example 1.12. `correlate` usage.

```opensips
...
/* see declaration of hep_dst in trace_id section */
/* we suppose we have two correlations in two varibles: cor1 and cor2 */
	correlate("hep_dst", "correlation-no-1",$var(cor1),"correlation-no-2", $var(cor2));
...
```

## Configuration Examples

### Set `hep_id` parameter

Demonstrates setting the `hep_id` parameter to define HEP destinations with various versions and transports.

```opensips
...
/* define a destination to localhost on port 8001 using hepV3 on tcp */
modparam("proto_hep", "hep_id",
"[hep_dst] 127.0.0.1:8001; transport=tcp; version=3")
/* define a destination to 1.2.3.4 on port 5000 using hepV2; no transport(default UDP) */
modparam("proto_hep", "hep_id", "[hep_dst] 1.2.3.4:5000; version=2")
/* define only the destination uri; version will be 3(default) and transport TCP(default) */
modparam("proto_hep", "hep_id", "[hep_dst] 1.2.3.4:5000")
...
```
### Set `homer5_on` parameter

Demonstrates setting the `homer5_on` parameter to 0 to use JSON based HOMER 6 format.

```opensips
modparam("proto_hep", "homer5_on", 0)
```
### Set `homer5_on` parameter

Demonstrates setting the `homer5_delim` parameter to change the delimiter between payload parts.

```opensips
modparam("proto_hep", "homer5_delim", "##")
```
### Set `hep_port` parameter

Demonstrates setting the `hep_port` parameter to 6666.

```opensips
...
modparam("proto_hep", "hep_port", 6666)
...
```
### Set `hep_send_timeout` parameter

Demonstrates setting the `hep_send_timeout` parameter to 200 milliseconds.

```opensips
...
modparam("proto_hep", "hep_send_timeout", 200)
...
```
### Set `hep_max_msg_chunks` parameter

Demonstrates setting the `hep_max_msg_chunks` parameter to 8.

```opensips
...
modparam("proto_hep", "hep_max_msg_chunks", 8)
...
```
### Set `hep_async` parameter

Demonstrates setting the `hep_async` parameter to 0 (disabled).

```opensips
...
modparam("proto_hep", "hep_async", 0)
...
```
### Set `hep_async_max_postponed_chunks` parameter

Demonstrates setting the `hep_async_max_postponed_chunks` parameter to 16.

```opensips
...
modparam("proto_hep", "hep_async_max_postponed_chunks", 16)
...
```
### Set `hep_capture_id` parameter

Demonstrates setting the `hep_capture_id` parameter to 234.

```opensips
...
modparam("proto_hep", "hep_capture_id", 234)
...
```
### Set `hep_async_local_connect_timeout` parameter

Demonstrates setting the `hep_async_local_connect_timeout` parameter to 200 milliseconds.

```opensips
...
modparam("proto_hep", "hep_async_local_connect_timeout", 200)
...
```
### Set `hep_async_local_write_timeout` parameter

Demonstrates setting the `hep_async_local_write_timeout` parameter to 100 milliseconds.

```opensips
...
modparam("proto_hep", "hep_async_local_write_timeout", 100)
...
```
### `correlate` usage

Demonstrates the usage of the `correlate` function to send a HEP message with correlation IDs.

```opensips
...
/* see declaration of hep_dst in trace_id section */
/* we suppose we have two correlations in two varibles: cor1 and cor2 */
	correlate("hep_dst", "correlation-no-1",$var(cor1),"correlation-no-2", $var(cor2));
...
```
