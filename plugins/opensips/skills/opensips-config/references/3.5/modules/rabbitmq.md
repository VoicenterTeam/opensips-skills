# rabbitmq Module Reference
<!-- generated-from: data/3.5/modules/rabbitmq.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 rabbitmq module. Read this file when configuring or debugging the rabbitmq module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

_RabbitMQ_ ([http://www.rabbitmq.com/](http://www.rabbitmq.com/)) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

Using this module you can send AMQP messages to a RabbitMQ server. Messages can be easily customized according to the AMQP specifications, as well the RabbitMQ extensions.

## Dependencies

### OpenSIPs Modules

- `tls_mgm` — if use_tls is enabled

### External Libraries

- `librabbitmq-dev` — must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

*Default value is 500.*

**Example.** Set the `connect_timeout` parameter.

```opensips
aram("rabbitmq", "connect_timeout", 1000)
```
### `server_id` (string)

Specify configuration for a RabbitMQ server. It contains a set of parameters used to customize the connection to the server, as well as to the messages sent. The format of the parameter is _\[id_name\] param1=value1; param2=value2;_. The _uri_ parameter is mandatory.

This parameter can be set multiple times, for each RabbitMQ server.

The following parameters can be used:

*   _uri_ - Mandatory parameter - a full _amqp_ URI as described [here](https://www.rabbitmq.com/uri-spec.html). Missing fields in the URI will receive default values, such as: _user: guest_, _password: guest_, _host: localhost_, _vhost: /_, _port: 5672_. TLS connections are specified using an _amqps_ URI.
    
*   _frames_ - the maximum size of an AMQP frame. Optional parameter, default size is 131072.
    
*   _retries_ - the number of retries in case a connection is down. Optional parameter, default is disabled (do not retry).
    
*   _exchange_ - exchange used to send AMQP messages to. Optional parameter, default is _""_.
    
*   _heartbeat_ - interval in seconds used to send heartbeat messages. Optional parameter, default is disabled.
    
*   _immediate_ - indicate to the broker that the message MUST be delivered to a consumer immediately. Optional parameter, default is not immediate.
    
*   _mandatory_ - indicate to the broker that the message MUST be routed to a queue. Optional parameter, default is not mandatory.
    
*   _non-persistent_ - indicates that the message should not be persistent in case the RabbitMQ server restarts. Optional parameter, default is persistent.
    
*   _tls_domain_ - indicates which TLS domain (as defined using the _tls_mgm_ module) to use for this connection. This must be an _amqps_ URI and the [use_tls](#param_use_tls "1.3.2.use_tls (integer)") module parameter must be enabled.

**Example.** Set the `server_id` parameter.

```opensips
# connection to a RabbitMQ server on localhost, default port
modparam("rabbitmq", "server_id","\[ID1\] uri = amqp://127.0.0.1")
...
# connection with a 5 seconds interval for heartbeat messages
modparam("rabbitmq", "server_id","\[ID2\] uri = amqp://127.0.0.1;
heartbeat = 5")
...
# TLS connection
modparam("rabbitmq", "server_id","\[ID3\] uri = amqps://127.0.0.1; tls_domain=rmq")
```
### `timeout` (integer)

Indicates the timeout (in milliseconds) of any command (i.e. publish) sent to the RabbitMQ server.

*Default value is 0.*

**Notes:** Available only starting with RabbitMQ library version 0.9.0; setting it when using an earlier version will have no effect, and the publish command will run in blocking mode.

**Example.** Set the `timeout` parameter.

```opensips
modparam("rabbitmq", "timeout", 1000) # timeout after 1s
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls_domain=_dom_name_" parameter in the configuration specified through the [server_id](#param_server_id "1.3.1.server_id (string)") module parameter.

When using this parameter, you must also ensure that _tls_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

*Default value is 0.*

**Example.** Set the `use_tls` parameter.

```opensips
modparam("tls_mgm", "client_domain", "rmq")
modparam("tls_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls_mgm", "private_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls_mgm", "ca_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("rabbitmq", "use_tls", 1)
```

## Exported Functions

### `rabbitmq_publish(server_id, routing_key, message [, [content_type [, headers, headers_vals]]])`

Sends a publish message to a RabbitMQ server.

This function also allows you to attach AMQP headers and values in the AMQP message. This is done by specifying a set of headers names (in the _headers_ parameter) and the corresponding values (in the _headers_vals_ parameter). The number of AVP values in the _headers_ must be the same as the one in the _headers_vals_.

**Parameters:**

- `content_type` *(string, optional)* — content type of the message sent.
- `headers` *(string, optional)* — an AVP containing the names of the headers within the AMQP message. If set, _headers_vals_ parameter must also be specified.
- `headers_vals` *(string, optional)* — an AVP containing the corresponding values of the AMQP headers. If set, _headers_ parameter must also be specified.
- `message` *(string, required)* — the body of the message.
- `routing_key` *(string, required)* — routing key used to deliver the AMQP message.
- `server_id` *(string, required)* — the id of the RabbitMQ server. Must be one of the parameters defined in the _server_id_ modparam.

**Usable from:** ANY_ROUTE

**Example.** Example 1.5. `rabbitmq_publish()` function usage.

```opensips
	...
	rabbitmq_publish("ID1", "call", "$fU called $rU");
	...
	rabbitmq_publish("ID1", "call", "{ \\'caller\\': \\'$fU\\',
				\\'callee\\; \\'$rU\\'", "application/json");
	...
	$avp(hdr_name) = "caller";
	$avp(hdr_value) = $fU;
	$avp(hdr_name) = "callee";
	$avp(hdr_value) = $rU;
	rabbitmq_publish("ID2", "call", $rb, , $avp(hdr_name), $avp(hdr_value));
	...
```

## Configuration Examples

### Set `server_id` parameter

Set `server_id` parameter

```opensips
...
# connection to a RabbitMQ server on localhost, default port
modparam("rabbitmq", "server_id","\[ID1\] uri = amqp://127.0.0.1")
...
# connection with a 5 seconds interval for heartbeat messages
modparam("rabbitmq", "server_id","\[ID2\] uri = amqp://127.0.0.1;
heartbeat = 5")
...
# TLS connection
modparam("rabbitmq", "server_id","\[ID3\] uri = amqps://127.0.0.1; tls_domain=rmq")
...
```
### Set the `use_tls` parameter

Set the `use_tls` parameter

```opensips
...
modparam("tls_mgm", "client_domain", "rmq")
modparam("tls_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls_mgm", "private_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls_mgm", "ca_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("rabbitmq", "use_tls", 1)
...
```
### Setting the `connect_timeout` parameter

Setting the `connect_timeout` parameter

```opensips
aram("rabbitmq", "connect_timeout", 1000)
```
### Set the `timeout` parameter

Set the `timeout` parameter

```opensips
...
modparam("rabbitmq", "timeout", 1000) # timeout after 1s
...
```
### `rabbitmq_publish()` function usage

`rabbitmq_publish()` function usage

```opensips
...
rabbitmq_publish("ID1", "call", "$fU called $rU");
...
rabbitmq_publish("ID1", "call", "{ \\'caller\\': \\'$fU\\',
				\\'callee\\; \\'$rU\\'", "application/json");
...
$avp(hdr_name) = "caller";
$avp(hdr_value) = $fU;
$avp(hdr_name) = "callee";
$avp(hdr_value) = $rU;
rabbitmq_publish("ID2", "call", $rb, , $avp(hdr_name), $avp(hdr_value));
...
```
