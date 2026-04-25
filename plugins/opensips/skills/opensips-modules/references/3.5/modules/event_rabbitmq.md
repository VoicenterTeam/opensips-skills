# event_rabbitmq Module Reference
<!-- generated-from: data/3.5/modules/event_rabbitmq.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 event_rabbitmq module. Read this file when configuring or debugging the event_rabbitmq module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

_RabbitMQ_ (http://www.rabbitmq.com/) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

This module provides the implementation of a RabbitMQ client for the Event Interface. It is used to send AMQP messages to a RabbitMQ server each time the Event Interface triggers an event subscribed for.

The AMQP protocol is only used as the transport layer for notifications. The content of a message is presented in the next section.

## Dependencies

### OpenSIPs Modules

- `tls_mgm` — if use_tls is enabled (optional)

### External Libraries

- `librabbitmq-dev` — The following libraries or applications must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

*Default value is 500.*

**Example.** Set the `connect_timeout` parameter.

```opensips
...
modparam("event\_rabbitmq", "connect\_timeout", 1000)
...
```
### `heartbeat` (integer)

Enables heartbeat support for the AMQP communication. If the client does not receive a heartbeat from server within the specified interval, the socket is automatically closed by the rabbitmq-client. This prevents OpenSIPS from blocking while waiting for a response from a dead rabbitmq-server. The value represents the heartbit interval in seconds.

*Default value is 0 (disabled).*

**Example.** Set the `heartbeat` parameter.

```opensips
...
modparam("event\_rabbitmq", "heartbeat", 3)
...
```
### `timeout` (integer)

Indicates the timeout (in milliseconds) of any command (i.e. publish) sent to the RabbitMQ server.

*Default value is 0 (no timeout - blocking mode).*

**Notes:** NOTE that this parameter is available only starting with RabbitMQ library version 0.9.0; setting it when using an earlier version will have no effect, and the publish command will run in blocking mode.

**Example.** Set the `timeout` parameter.

```opensips
...
modparam("event\_rabbitmq", "timeout", 1000) # timeout after 1s
...
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" parameter in the configuration specified through the [RabbitMQ socket syntax](#socket_syntax "1.3.�RabbitMQ socket syntax"). When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

*Default value is 0 (not enabled).*

**Example.** Set the `use_tls` parameter.

```opensips
...
modparam("tls\_mgm", "client\_domain", "rmq")
modparam("tls\_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls\_mgm", "private\_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls\_mgm", "ca\_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("event\_rabbitmq", "use\_tls", 1)
...
```

## Configuration Examples

### RabbitMQ socket

```opensips
rabbitmq:guest:guest@127.0.0.1:5672/pike

# same socket can be written as
rabbitmq:127.0.0.1/pike

# TLS broker connection
rabbitmq:127.0.0.1/tls\_domain=rmq?pike
```
