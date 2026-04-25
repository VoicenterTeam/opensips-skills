# event_stream Module Reference
<!-- generated-from: data/3.5/modules/event_stream.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 event_stream module. Read this file when configuring or debugging the event_stream module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides a TCP transport layer implementation for the Event Interface. The module can either send a JSON-RPC notification or a standard request and wait for the response (when used in _reliable\_mode_).

As the JSON-RPC is sent directly over TCP, avoiding any application transport layer (such as HTTP), this module offers a very lightweight and reliable way of delivering events to an application server.

In order to be notified, a JSON-RPC server has to subscribe for a certain event provided by OpenSIPS. This can be done using the generic MI Interface (_event\_subscribe_ function) or from OpenSIPS script (_subscribe\_event_ core function).

## How It Works

Stream socket syntax:
_'tcp:' host ':' port \['/' method\]_

Meaning:

* _'tcp:'_ - specifies the transport protocol used by the Event Interface to send the command. the _tcp_ token indicates that the subscriber's events should be notified using the _event\_strea,_ module.
* _host_ - host name of the JSON-RPC server.
* _port_ - port of the JSON-RPC server.
* _method_ - method called remotely by the JSON-RPC client.

NOTE: this parameter is optional - if it is missing, the method used is the actual event subscribed to (i.e. if _localhost:8080_ subscribes to the _E\_PIKE\_BLOCKED_ event, the RPC call will use the _E\_PIKE\_BLOCKED_ method.

The JSON-RPC command is built as it follows:

* _id_ - uniquly generated if _reliable\_mode_ is used, otherwise (for notifications) _null_.
* _method_ - if no method is specified in the socket, the name of the event is set as method, otherwise the token specified is used.
* _params_ - if the event sent contains named parameters, then this parameter contains a JSON object with an object for each parameter. If the event sent only contains values, the parameters will be sent as an array.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `event_param` (string)

By default, the name of the event subscribed to is not send in the JSON-RPC command. If one needs to send the name of the event as well, you can use this parameter to specify the name of JSON object within the params that will contain the name of the event.

*Default value is disabled - event is not added..*

**Example.** opensips\_event.

```opensips
modparam("event\_stream", "event\_param", "opensips\_event")
```
### `reliable_mode` (integer)

This parameter controls the way the _event\_stream_ module communicates with the JSON-RPC server. If enabled, (set to _1_), each event is translated to a JSON-RPC request. If disabled, each event will be sent as a JSON-RPC notification - there will be no reply expected by our client.

Note that if you need a reliable communication with the JSON-RPC server, where each event sent needs to be confirmed (by a JSON-RPC response), you must set this parameter to _1/yes_. If you are using this module in a failover setup (using the _event\_virtual_ module), it is recommended to set this parameter to _1/yes_.

*Default value is 0 (disabled).*

**Possible values:**

- 0
- 1
- yes
- no

**Example.** yes.

```opensips
modparam("event\_stream", "reliable\_mode", yes)
```
### `timeout` (integer)

Specified the amount of milliseconds the module waits for a command to complete. In _reliable\_mode_, it specifies the time module waits the request to be sent and a reply received. In non-_reliable\_mode_, it represents only the time opensips takes to send the JSON-RPC notification.

NOTE that if the event is not using names for its parameters, the event will be the first parameter in the JSON-RPC command.

*Default value is 1000 milliseconds = 1 second.*

**Example.** 200.

```opensips
modparam("event\_stream", "timeout", 200)
```

## Configuration Examples

### Example 1.4. Stream socket

```opensips
# calls the 'block\_ip' method
tcp:127.0.0.1:8080/block\_ip

# calls the 'E\_PIKE\_BLOCKED' method, if subscribed to the E\_PIKE\_BLOCKED event
tcp:127.0.0.1:8080
```
### Example 1.5. E_PIKE_BLOCKED JSON-RPC notification

This is an example of an event raised when _reliable_mode_ is disabled by the pike module when it decides an ip should be blocked:

```opensips
{
	"jsonrpc": "2.0",
	"method": "E\_PIKE\_BLOCKED",
	"params": {
		"ip": "192.168.2.11"
	}
}
```
### Example 1.6. E_PIKE_BLOCKED JSON-RPC request (reliable_mode)

This is an example of an event raised in _reliable_mode_ by the pike module when it decides an ip should be blocked:

```opensips
# request
{
	"id": 915243442,
	"jsonrpc": "2.0",
	"method": "E\_PIKE\_BLOCKED",
	"params": {
		"ip": "192.168.2.11"
	}
}

# reply
{
	"jsonrpc": "2.0",
	"result": 8,
	"id": 915243442
}
```
### Example 1.7. E_PIKE_BLOCKED notification with event name

when having the _event_param_ set to _opensips_event_, the event raised by the pike module will look like the following:

```opensips
# module configuration
modparam("event\_stream", "event\_param", "opensips\_event")

# Stream socket: tcp:HOST:PORT/handle\_cmd

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "handle\_cmd",
	"params": {
		"opensips\_event": "E\_PIKE\_BLOCKED"
		"ip": "192.168.2.11"
	}
}
```
### Example 1.8. E_PIKE_BLOCKED event

This example contains a snippet to send a custom event from the script using the _event_stream_ module.

Note that we are only populating values for the event, we are not assinging names to those values. Therefore, the parameters will be sent as an array.

```opensips
startup\_route {
	subscribe\_event("E\_MY\_EVENT", "tcp:127.0.0.1:8080");
}

route {
	...
	$avp(attr-val) = 3;
	$avp(attr-val) = 5;
	raise\_event("E\_MY\_EVENT", $avp(attr-val));
	...
}

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "E\_MY\_EVENT",
	"params": \[3, 5\]
}
```
