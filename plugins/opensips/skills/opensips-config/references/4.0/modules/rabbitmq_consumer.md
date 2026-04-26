# rabbitmq_consumer Module Reference
<!-- generated-from: data/4.0/modules/rabbitmq_consumer.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 rabbitmq_consumer module. Read this file when configuring or debugging the rabbitmq_consumer module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

_RabbitMQ Consumer_ ([http://www.rabbitmq.com/](http://www.rabbitmq.com/)) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

Using this module you can subscribe consumers to a RabbitMQ broker in order to receive AMQP messages for specified queues. The messages will be delivered by triggering events through the OpenSIPS Event Interface.

## Dependencies

### OpenSIPs Modules

- `tls_mgm` — Required if use_tls is enabled

### External Libraries

- `librabbitmq-dev` — Required for module operation

## Exported Parameters

### `connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

*Default value is 500.*

**Example.** Set the `connect_timeout` parameter.

```opensips
modparam("rabbitmq_consumer", "connect_timeout", 1000)
```
### `connection_id` (string)

Specify the configuration for a RabbitMQ connection. It contains a set of parameters used to customize the connection to the server as well as the consumer subscription. The format of the parameter is _param1=value1; param2=value2;_. The _uri_, _queue_ and _event_ parameters are mandatory.

This parameter can be set multiple times, for each RabbitMQ connection.

The following parameters can be used:

* _uri_ - Mandatory parameter - a full _amqp_ URI as described here. Missing fields in the URI will receive default values, such as: _user: guest_, _password: guest_, _host: localhost_, _vhost: /_, _port: 5672_. TLS connections are specified using an _amqps_ URI.
* _queue_ - Mandatory parameter - the name of the RabbitMQ queue to subscribe a consumer to. This parameter is mandatory.
* _event_ - Mandatory parameter - the name of the OpenSIPS event that will be triggered for each AMQP message received.
* _ack_ - flag that indicates to the broker that messages will be acknowledged upon receival. If you do not set this flag, the server will not expect ACKs and OpenSIPS will not send them.
* _exclusive_ - flag that indicates to the broker that exclusive consumer access is requested, meaning only this consumer can access the queue.
* _frame_max_ - the maximum size of an AMQP frame. Default size is 131072.
* _heartbeat_ - interval in seconds used to send heartbeat messages. Default is disabled.
* _tls_domain_ - indicates which TLS domain (as defined using the _tls_mgm_ module) to use for this connection. This must be an _amqps_ URI and the use_tls module parameter must be enabled.

**Notes:** This parameter can be set multiple times, for each RabbitMQ connection.

**Example.** Set the `connection_id` parameter.

```opensips
# connection to a RabbitMQ server on localhost, default port
# with a 5 seconds interval for heartbeat messages
modparam("rabbitmq_consumer", "connection_id",
    "uri = amqp://127.0.0.1; queue = myqueue1; event = E_Q1_MSG; heartbeat = 5;")
...
# consumer that acknowledges messages
modparam("rabbitmq_consumer", "connection_id",
    "uri = amqp://127.0.0.1; queue = myqueue2; event = E_Q2_MSG; ack;")
...
# TLS connection
modparam("rabbitmq_consumer", "connection_id",
    "uri = amqps://127.0.0.1; queue = myqueue3; event = E_Q3_MSG; tls_domain=rmq;")
```
### `retry_timeout` (integer)

The interval (in milliseconds) after which OpenSIPS will try to re-establish a failed AMQP connection to a RabbitMQ server.

*Default value is 5000.*

**Example.** Set the `retry_timeout` parameter.

```opensips
modparam("rabbitmq_consumer", "retry_timeout", 10000)
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls_domain=_dom_name_" parameter in the configuration specified through the connection_id module parameter.

When using this parameter, you must also ensure that _tls_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** Set the `use_tls` parameter.

```opensips
modparam("tls_mgm", "client_domain", "rmq")
modparam("tls_mgm", "certificate", "[rmq]/etc/pki/tls/certs/rmq.pem")
modparam("tls_mgm", "private_key", "[rmq]/etc/pki/tls/private/rmq.key")
modparam("tls_mgm", "ca_list",     "[rmq]/etc/pki/tls/certs/ca.pem")
...
modparam("rabbitmq_consumer", "use_tls", 1)
```

## Exported Events

### `custom name (set in event field of connection_id)`

will be raised for each AMQP message received.

**Parameters:**

- `body` *(string)* — the AMQP message body.

## Configuration Examples

### Set `connection_id` parameter

Demonstrates setting the `connection_id` parameter for various RabbitMQ connections including heartbeat, acknowledgment, and TLS.

```opensips
...
# connection to a RabbitMQ server on localhost, default port
# with a 5 seconds interval for heartbeat messages
modparam("rabbitmq_consumer", "connection_id",
    "uri = amqp://127.0.0.1; queue = myqueue1; event = E_Q1_MSG; heartbeat = 5;")
...
# consumer that acknowledges messages
modparam("rabbitmq_consumer", "connection_id",
    "uri = amqp://127.0.0.1; queue = myqueue2; event = E_Q2_MSG; ack;")
...
# TLS connection
modparam("rabbitmq_consumer", "connection_id",
    "uri = amqps://127.0.0.1; queue = myqueue3; event = E_Q3_MSG; tls_domain=rmq;")
...
```
### Setting the `connect_timeout` parameter

Demonstrates setting the `connect_timeout` parameter.

```opensips
...
modparam("rabbitmq_consumer", "connect_timeout", 1000)
...
```
### Setting the `retry_timeout` parameter

Demonstrates setting the `retry_timeout` parameter.

```opensips
...
modparam("rabbitmq_consumer", "retry_timeout", 10000)
...
```
### Set the `use_tls` parameter

Demonstrates enabling TLS by setting the `use_tls` parameter and configuring the TLS management module.

```opensips
...
modparam("tls_mgm", "client_domain", "rmq")
modparam("tls_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls_mgm", "private_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls_mgm", "ca_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("rabbitmq_consumer", "use_tls", 1)
...
```
