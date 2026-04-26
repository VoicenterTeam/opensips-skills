# jsonrpc Module Reference
<!-- generated-from: data/3.5/modules/jsonrpc.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 jsonrpc module. Read this file when configuring or debugging the jsonrpc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of an JSON-RPC v2.0 client http://www.jsonrpc.org/specification. that can send a call to a JSON-RPC server over a TCP connection.

NOTE that the current version of this module does not support TCP connection reusage, nor asynchronous commands.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `connect_timeout` (integer)

The amount of milliseconds OpenSIPS waits to connect to the the JSON-RPC server, until it times out.

*Default value is 500 milliseconds.*

**Example.** 200.

```opensips
...
modparam("jsonrpc", "connect_timeout", 200)
...
```
### `read_timeout` (integer)

The amount of milliseconds OpenSIPS waits for the JSON-RPC server to respond to a JSON-RPC request, until it times out.

*Default value is 500 milliseconds.*

**Notes:** Note that these parameter only affects the _jsonrpc_request_ command.

**Example.** 300.

```opensips
...
modparam("jsonrpc", "read_timeout", 300)
...
```
### `write_timeout` (integer)

The amount of milliseconds OpenSIPS waits to send a RPC command to the JSON-RPC server, until it times out.

*Default value is 500 milliseconds.*

**Example.** 300.

```opensips
...
modparam("jsonrpc", "write_timeout", 300)
...
```

## Exported Functions

### `jsonrpc_notification(destination, method, params)`

Does a JSON-RPC notification to the JSON-RPC server indicated in the destination parameter, but unlike jsonrpc_request(), it does not wait for a reply from the JSON-RPC server.

**Parameters:**

- `destination` *(string, required)* — address of the JSON-RPC server. The format needs to be IP:port.
- `method` *(string, required)* — the method used in the RPC request.
- `params` *(string, required)* — these are the parameters sent to the RPC method. This parameter needs to be a properly formated JSON array, or JSON object, according the the JSON-RPC specifications.

**Return codes:**

- `1` — JSON-RPC command executed successfully, and the server returned success.
- `-1` — There was an internal error during processing.
- `-2` — There was a connection (timeout or connect) error with the destination.
- `-3` — The JSON-RPC was successfully run, but the server returned an error.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `jsonrpc_request`

**Example.** jsonrpc_notification() function usage.

```opensips
...
if (!jsonrpc_notification("127.0.0.1", "block_ip", "{ \"ip\": \"$si\" }")) {
	xlog("JSON-RPC notification failed with $rc!\n");
	exit;
}
...

```

### `jsonrpc_request(destination, method, params, ret_var)`

Does a JSON-RPC request to the JSON-RPC server indicated in the destination parameter, and waits for a reply from it.

**Parameters:**

- `destination` *(string, required)* — address of the JSON-RPC server. The format needs to be IP:port.
- `method` *(string, required)* — the method used in the RPC request.
- `params` *(string, required)* — these are the parameters sent to the RPC method. This parameter needs to be a properly formated JSON array, or JSON object, according the the JSON-RPC specifications.
- `ret_var` *(string, required)* — a writeable variable used to store the result of the JSON-RPC command. If the command returns an error, the variable will be populated with the error JSON, otherwise, with the body of the JSON-RPC result.

**Return codes:**

- `1` — JSON-RPC command executed successfully, and the server returned success.
- `-1` — There was an internal error during processing.
- `-2` — There was a connection (timeout or connect) error with the destination.
- `-3` — The JSON-RPC was successfully run, but the server returned an error.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** jsonrpc_request() function usage.

```opensips
...
if (!jsonrpc_request("127.0.0.1", "add", "[1,2]", $var(ret))) {
	xlog("JSON-RPC command failed with $var(ret)\n");
	exit;
}
xlog(JSON-RPC command returned $var(ret)\n");
# parse $var(ret) as JSON, or whatever the function returns
...

```

## Configuration Examples

### Set `connect_timeout` parameter

Sets the `connect_timeout` parameter to 200 milliseconds.

```opensips
...
modparam("jsonrpc", "connect_timeout", 200)
...
```
### Set `write_timeout` parameter

Sets the `write_timeout` parameter to 300 milliseconds.

```opensips
...
modparam("jsonrpc", "write_timeout", 300)
...
```
### Set `read_timeout` parameter

Sets the `read_timeout` parameter to 300 milliseconds.

```opensips
...
modparam("jsonrpc", "read_timeout", 300)
...
```
### `jsonrpc_request()` function usage

Demonstrates how to use the `jsonrpc_request()` function to send a command and handle the response.

```opensips
	...
	if (!jsonrpc_request("127.0.0.1", "add", "\[1,2\]", $var(ret))) {
		xlog("JSON-RPC command failed with $var(ret)\\n");
		exit;
	}
	xlog(JSON-RPC command returned $var(ret)\\n");
	# parse $var(ret) as JSON, or whatever the function returns
	...
```
### `jsonrpc_notification()` function usage

Demonstrates how to use the `jsonrpc_notification()` function to send a notification without waiting for a reply.

```opensips
	...
	if (!jsonrpc_notification("127.0.0.1", "block_ip", "{ \\"ip\\": \\"$si\\" }")) {
		xlog("JSON-RPC notification failed with $rc!\\n");
		exit;
	}
	...
```
