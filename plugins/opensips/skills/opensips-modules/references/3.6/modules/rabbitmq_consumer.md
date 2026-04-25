# rabbitmq_consumer Module Reference
<!-- generated-from: data/3.6/modules/rabbitmq_consumer.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 rabbitmq_consumer module. Read this file when configuring or debugging the rabbitmq_consumer module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

RabbitMQ Consumer (http://www.rabbitmq.com/) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

Using this module you can subscribe consumers to a RabbitMQ broker in order to receive AMQP messages for specified queues. The messages will be delivered by triggering events through the OpenSIPS Event Interface.

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
modparam("rabbitmq_consumer", "connect_timeout", 1000)
```
### `connection_id` (string)

Specify the configuration for a RabbitMQ connection. It contains a set of parameters used to customize the connection to the server as well as the consumer subscription. The format of the parameter is _param1=value1; param2=value2;_. The _uri_, _queue_ and _event_ parameters are mandatory. This parameter can be set multiple times, for each RabbitMQ connection. The following parameters can be used: * _uri_ - Mandatory parameter - a full _amqp_ URI as described [here](https://www.rabbitmq.com/uri-spec.html). Missing fields in the URI will receive default values, such as: _user: guest_, _password: guest_, _host: localhost_, _vhost: /_, _port: 5672_. TLS connections are specified using an _amqps_ URI. * _queue_ - Mandatory parameter - the name of the RabbitMQ queue to subscribe a consumer to. This parameter is mandatory. * _event_ - Mandatory parameter - the name of the OpenSIPS event that will be triggered for each AMQP message received. * _ack_ - flag that indicates to the broker that messages will be acknowledged upon receival. If you do not set this flag, the server will not expect ACKs and OpenSIPS will not send them. * _exclusive_ - flag that indicates to the broker that exclusive consumer access is requested, meaning only this consumer can access the queue. * _frame\_max_ - the maximum size of an AMQP frame. Default size is 131072. * _heartbeat_ - interval in seconds used to send heartbeat messages. Default is disabled. * _tls\_domain_ - indicates which TLS domain (as defined using the _tls\_mgm_ module) to use for this connection. This must be an _amqps_ URI and the [use\_tls](#param_use_tls "1.3.4.�use_tls (integer)") module parameter must be enabled.

**Example.** uri = amqp://127.0.0.1; queue = myqueue1; event = E_Q1_MSG; heartbeat = 5;.

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

**Example.** 10000.

```opensips
modparam("rabbitmq_consumer", "retry_timeout", 10000)
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" parameter in the configuration specified through the [connection\_id](#param_connection_id "1.3.1.�connection\_id (string)") module parameter. When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

*Default value is 0.*

**Example.** 1.

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

Raised for each AMQP message received.

**Parameters:**

- `body` *(string)* — the AMQP message body.

## Configuration Examples

### Set `connection_id` parameter

Set `connection_id` parameter

```opensips
...
# connection to a RabbitMQ server on localhost, default port
# with a 5 seconds interval for heartbeat messages
modparam("rabbitmq\_consumer", "connection\_id",
    "uri = amqp://127.0.0.1; queue = myqueue1; event = E\_Q1\_MSG; heartbeat = 5;")
...
# consumer that acknowledges messages
modparam("rabbitmq\_consumer", "connection\_id",
    "uri = amqp://127.0.0.1; queue = myqueue2; event = E\_Q2\_MSG; ack;")
...
# TLS connection
modparam("rabbitmq\_consumer", "connection\_id",
    "uri = amqps://127.0.0.1; queue = myqueue3; event = E\_Q3\_MSG; tls\_domain=rmq;")
...
```
### Setting the `connect_timeout` parameter

Setting the `connect_timeout` parameter

```opensips
...
modparam("rabbitmq\_consumer", "connect\_timeout", 1000)
...
```
### Setting the `retry_timeout` parameter

Setting the `retry_timeout` parameter

```opensips
...
modparam("rabbitmq\_consumer", "retry\_timeout", 10000)
...
```
### Set the `use_tls` parameter

Set the `use_tls` parameter

```opensips
...
modparam("tls\_mgm", "client\_domain", "rmq")
modparam("tls\_mgm", "certificate", "[rmq]/etc/pki/tls/certs/rmq.pem")
modparam("tls\_mgm", "private\_key", "[rmq]/etc/pki/tls/private/rmq.key")
modparam("tls\_mgm", "ca\_list",     "[rmq]/etc/pki/tls/certs/ca.pem")
...
modparam("rabbitmq\_consumer", "use\_tls", 1)
...
```
