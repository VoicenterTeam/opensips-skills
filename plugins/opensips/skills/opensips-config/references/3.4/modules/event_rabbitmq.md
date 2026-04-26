# event_rabbitmq Module Reference
<!-- generated-from: data/3.4/modules/event_rabbitmq.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 event_rabbitmq module. Read this file when configuring or debugging the event_rabbitmq module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

_RabbitMQ_ (http://www.rabbitmq.com/) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

This module provides the implementation of a RabbitMQ client for the Event Interface. It is used to send AMQP messages to a RabbitMQ server each time the Event Interface triggers an event subscribed for.

The AMQP protocol is only used as the transport layer for notifications. The content of a message is presented in the next section.

## How It Works

This module acts as a transport module for the OpenSIPS Event Interface. Therefore, this module should follow the Event Interface behavior:

The first step is to subscribe the RabbitMQ server to the OpenSIPS Event Interface. This can be done using the _subscribe_event_ core function:

subscribe_event("E_RABBITMQ_EVENT", "rabbitmq:127.0.0.1/queue");

The next step is to raise the event from the script, using the _raise_event_ core function:

raise_event("E_RABBITMQ_EVENT");

NOTE that the event used above is only to exemplify the usage from the script. Any event published through the OpenSIPS Event Interface can be raised using this module.

## Dependencies

### OpenSIPs Modules

- `tls_mgm` — Required if use_tls is enabled

### External Libraries

- `librabbitmq-dev` — Required for running OpenSIPS with this module loaded

## Exported Parameters

### `connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

*Default value is 500.*

**Example.** 1000.

```opensips
...
modparam("event_rabbitmq", "connect_timeout", 1000)
...
```
### `heartbeat` (integer)

Enables heartbeat support for the AMQP communication. If the client does not receive a heartbeat from server within the specified interval, the socket is automatically closed by the rabbitmq-client. This prevents OpenSIPS from blocking while waiting for a response from a dead rabbitmq-server. The value represents the heartbit interval in seconds.

*Default value is 0 (disabled).*

**Example.** 3.

```opensips
...
modparam("event_rabbitmq", "heartbeat", 3)
...
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls_domain=_dom_name_" parameter in the configuration specified through the [RabbitMQ socket syntax](#socket_syntax "1.3.RabbitMQ socket syntax"). When using this parameter, you must also ensure that _tls_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

*Default value is 0 (not enabled).*

**Example.** 1.

```opensips
...
modparam("tls_mgm", "client_domain", "rmq")
modparam("tls_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls_mgm", "private_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls_mgm", "ca_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("event_rabbitmq", "use_tls", 1)
...
```

## Configuration Examples

### E_PIKE_BLOCKED event

This is an example of an event raised by the pike module when it decides an ip should be blocked:

```opensips
{
  "jsonrpc": "2.0",
  "method": "E_PIKE_BLOCKED",
  "params": {
    "ip": "192.168.2.11"
  }
}
```
### RabbitMQ socket

```opensips
	rabbitmq:guest:guest@127.0.0.1:5672/pike

	# same socket can be written as
	rabbitmq:127.0.0.1/pike

	# TLS broker connection
	rabbitmq:127.0.0.1/tls_domain=rmq?pike
```
