# event_stream Module Reference
<!-- generated-from: data/4.0/modules/event_stream.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 event_stream module. Read this file when configuring or debugging the event_stream module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides a TCP transport layer implementation for the Event Interface. The module can either send a JSON-RPC notification or a standard request and wait for the response (when used in _reliable_mode_).

As the JSON-RPC is sent directly over TCP, avoiding any application transport layer (such as HTTP), this module offers a very lightweight and reliable way of delivering events to an application server.

In order to be notified, a JSON-RPC server has to subscribe for a certain event provided by OpenSIPS. This can be done using the generic MI Interface (_event_subscribe_ function) or from OpenSIPS script (_subscribe_event_ core function).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `event_param` (string)

By default, the name of the event subscribed to is not send in the JSON-RPC command. If one needs to send the name of the event as well, you can use this parameter to specify the name of JSON object within the params that will contain the name of the event.

*Default value is disabled - event is not added..*

**Example.** opensips_event.

```opensips
modparam("event_stream", "event_param", "opensips_event")
# json resulted will contain the "opensips_event": EVENT token
```
### `reliable_mode` (integer)

This parameter controls the way the _event_stream_ module communicates with the JSON-RPC server. If enabled, (set to _1_), each event is translated to a JSON-RPC request. If disabled, each event will be sent as a JSON-RPC notification - there will be no reply expected by our client.

Note that if you need a reliable communication with the JSON-RPC server, where each event sent needs to be confirmed (by a JSON-RPC response), you must set this parameter to _1/yes_. If you are using this module in a failover setup (using the _event_virtual_ module), it is recommended to set this parameter to _1/yes_.

*Default value is 0 (disabled).*

**Possible values:**

- 0
- 1
- yes
- no

**Example.** yes.

```opensips
modparam("event_stream", "reliable_mode", yes)
```
### `timeout` (integer)

Specified the amount of milliseconds the module waits for a command to complete. In _reliable_mode_, it specifies the time module waits the request to be sent and a reply received. In non-_reliable_mode_, it represents only the time opensips takes to send the JSON-RPC notification.

NOTE that if the event is not using names for its parameters, the event will be the first parameter in the JSON-RPC command.

*Default value is 1000 milliseconds = 1 second.*

**Example.** 200.

```opensips
# only wait for 200 milliseonds for a reply
modparam("event_stream", "timeout", 200)
```

## Configuration Examples

### Example 1.4. Stream socket

```opensips
# calls the 'block_ip' method
tcp:127.0.0.1:8080/block_ip

# calls the 'E_PIKE_BLOCKED' method, if subscribed to the E_PIKE_BLOCKED event
tcp:127.0.0.1:8080
```
### Example 1.5. E_PIKE_BLOCKED JSON-RPC notification

This is an example of an event raised when _reliable_mode_ is disabled by the pike module when it decides an ip should be blocked:

```opensips
{
	"jsonrpc": "2.0",
	"method": "E_PIKE_BLOCKED",
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
	"method": "E_PIKE_BLOCKED",
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
modparam("event_stream", "event_param", "opensips_event")

# Stream socket: tcp:HOST:PORT/handle_cmd

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "handle_cmd",
	"params": {
		"opensips_event": "E_PIKE_BLOCKED"
		"ip": "192.168.2.11"
	}
}
```
### Example 1.8. E_PIKE_BLOCKED event

This example contains a snippet to send a custom event from the script using the _event_stream_ module.

Note that we are only populating values for the event, we are not assinging names to those values. Therefore, the parameters will be sent as an array.

```opensips
startup_route {
	subscribe_event("E_MY_EVENT", "tcp:127.0.0.1:8080");
}

route {
	...
	$avp(attr-val) = 3;
	$avp(attr-val) = 5;
	raise_event("E_MY_EVENT", $avp(attr-val));
	...
}

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "E_MY_EVENT",
	"params": \[3, 5\]
}
```
