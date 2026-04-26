# janus Module Reference
<!-- generated-from: data/4.0/modules/janus.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 janus module. Read this file when configuring or debugging the janus module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The _"janus"_ module is a C driver for the Janus websocket protocol. It can interact with one or more Janus servers either by issuing commands to them, or by receiving events from them.

## How It Works

This driver can be seen as a centralized Janus connection manager. It will connect to each Janus server, establish the connection hanler ID and the clients can be transparent from the connection handler ID point of view, simply passing the desired Janus commands that they want to run.

## Dependencies

### OpenSIPs Modules

- `an SQL DB module` — must be loaded together with this module

### External Libraries

None.

## Exported Parameters

### `janus_cmd_polling_itv` (integer)

The sleep interval used when polling for an Janus command response. Since the value of this parameter imposes a minimal duration for any Janus command, you should run OpenSIPS in debug mode in order to first determine an expected response time for an arbitrary Janus command, then tune this parameter accordingly.

*Default value is 1000.*

**Example.** 3000.

```opensips
modparam("janus", "janus_cmd_polling_itv", 3000)
```
### `janus_cmd_timeout` (integer)

The maximally allowed duration for the execution of an Janus command. This interval does not include the connect duration.

*Default value is 5000.*

**Example.** 3000.

```opensips
modparam("janus", "janus_cmd_timeout", 3000)
```
### `janus_db_table` (string)

The DB Table from where OpenSIPS will load the list of Janus connection

*Default value is janus.*

**Example.** my_janus_table.

```opensips
modparam("janus", "janus_db_table", "my_janus_table")
```
### `janus_db_url` (string)

The DB URL from where OpenSIPS will load the list of Janus connection

*Default value is none.*

**Example.** mysql://root@localhost/opensips.

```opensips
modparam("janus", "janus_db_url", "mysql://root@localhost/opensips")
```
### `janus_max_msg_chunks` (integer)

The maximum number of chunks in which a Janus message is expected to arrive via WebSocket. If a received packet is more fragmented than this, the connection is dropped

*Default value is 4.*

**Example.** 8.

```opensips
modparam("janus", "janus_max_msg_chunks", 8)
```
### `janus_ping_interval` (integer)

The time interval at which OpenSIPS will do keepalive pinging on the Janus connect

*Default value is 5.*

**Example.** 10.

```opensips
modparam("janus", "janus_ping_interval", 10)
```
### `janus_send_timeout` (integer)

Time in milliseconds after a Janus WebSocket connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

*Default value is 1000.*

**Example.** 2000.

```opensips
modparam("janus", "janus_send_timeout", 2000)
```

## Exported Functions

### `janus_send_request(janus_id, janus_command[, response_var])`

Run an arbitrary command on an arbitrary Janus socket. The janus_id must be defined in the database

The current OpenSIPS worker will block until an answer from Janus arrives. The timeout for this operation can be controlled via the janus_cmd_timeout param.

**Parameters:**

- `janus_command` *(string, required)* — the JANUS command to run.
- `janus_id` *(string, required)* — the ID of the janus connection as defined in the databsae.
- `response_var` *(var, optional)* — a variable which will hold the text result of the Janus command.

**Return codes:**

- `1` — the Janus command executed successfully and any output variables were successfully written to. Note that this does not say anything about the nature of the Janus answer (it may well be a "-ERR" type of response)
- `-1` — internal error or the Janus command failed to execute

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** janus_send_request() usage.

```opensips
...
# if the DB contains: 
#       id: 1
# janus_id: test_janus
# janus_url: janusws://my_janus_host:80/janus?room=abcd

	$var(rc) = janus_send_request("test_janus", "{
  "janus": "attach",
  "plugin": "janus.plugin.videoroom",
  "transaction": "abcdef123456",
  "session_id": 987654321
}", $var(response));
	if (!$var(rc)) {
		xlog("failed to execute Janus command ($var(rc))\\n");
		return -1;
	}
	xlog("Janus response is $var(response) \\n");
...
...
```

## Exported Events

### `E_JANUS_EVENT`

This event is raised when a notification is received from a Janus server.

**Parameters:**

- `janus_id` *(string)* — the janus id as defined in the database
- `janus_url` *(string)* — the janus url as defined in the database
- `janus_body` *(string)* — full body of the notification received from janus

**Subscribe via:** event_route

**Example.** E_JANUS_EVENT example.

```opensips
...
# if the DB contains: 
#       id: 1
# janus_id: test_janus
# janus_url: janusws://my_janus_host:80/janus?room=abcd

event_route[E_JANUS_EVENT] {
	xlog("Received janus event from $param(janus_id) - $param(janus_url) - $param(janus_body) \\n");
	$json(janus_body) := $param(janus_body);
	$avp(janus_sender) =  $json(janus_body/sender);
	if ($avp(janus_sender) != NULL) {
		xlog("Received event from sender $avp(janus_sender) \\n");
	}
}
...
```

## Configuration Examples

### Setting the `janus_send_timeout` parameter

Setting the `janus_send_timeout` parameter

```opensips
...
modparam("janus", "janus_send_timeout", 2000)
...
```
### Setting the `janus_max_msg_chunks` parameter

Setting the `janus_max_msg_chunks` parameter

```opensips
...
modparam("janus", "janus_max_msg_chunks", 8)
...
```
### Setting the `janus_cmd_timeout` parameter

Setting the `janus_cmd_timeout` parameter

```opensips
...
modparam("janus", "janus_cmd_timeout", 3000)
...
```
### Setting the `janus_cmd_polling_itv` parameter

Setting the `janus_cmd_polling_itv` parameter

```opensips
...
modparam("janus", "janus_cmd_polling_itv", 3000)
...
```
### Setting the `janus_ping_interval` parameter

Setting the `janus_ping_interval` parameter

```opensips
...
modparam("janus", "janus_ping_interval", 10)
...
```
### Setting the `janus_db_url` parameter

Setting the `janus_db_url` parameter

```opensips
...
modparam("janus", "janus_db_url", "mysql://root@localhost/opensips")
...
```
### Setting the `janus_db_table` parameter

Setting the `janus_db_table` parameter

```opensips
...
modparam("janus", "janus_db_table", "my_janus_table")
...
```
### `_janus_send_request()_` usage

`_janus_send_request()_` usage

```opensips
...
# if the DB contains: 
#       id: 1
# janus_id: test_janus
# janus_url: janusws://my_janus_host:80/janus?room=abcd

	$var(rc) = janus_send_request("test_janus", "{
  "janus": "attach",
  "plugin": "janus.plugin.videoroom",
  "transaction": "abcdef123456",
  "session_id": 987654321
}", $var(response));
	if (!$var(rc)) {
		xlog("failed to execute Janus command ($var(rc))\\n");
		return -1;
	}
	xlog("Janus response is $var(response) \\n");
...
```
### `_E_JANUS_EVENT_` example

`_E_JANUS_EVENT_` example

```opensips
...
# if the DB contains: 
#       id: 1
# janus_id: test_janus
# janus_url: janusws://my_janus_host:80/janus?room=abcd

event_route\[E_JANUS_EVENT\] {
	xlog("Received janus event from $param(janus_id) - $param(janus_url) - $param(janus_body) \\n");
	$json(janus_body) := $param(janus_body);
	$avp(janus_sender) =  $json(janus_body/sender);
	if ($avp(janus_sender) != NULL) {
		xlog("Received event from sender $avp(janus_sender) \\n");
	}
}
...
```
