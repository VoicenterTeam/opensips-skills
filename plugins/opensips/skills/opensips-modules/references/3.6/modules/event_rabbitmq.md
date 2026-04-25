# event_rabbitmq Module Reference
<!-- generated-from: data/3.6/modules/event_rabbitmq.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 event_rabbitmq module. Read this file when configuring or debugging the event_rabbitmq module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

_RabbitMQ_ (http://www.rabbitmq.com/) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

This module provides the implementation of a RabbitMQ client that supports two primary functionalities:

* _Event-Driven Messaging:_ It is used to send AMQP messages to a RabbitMQ server each time the Event Interface triggers an event subscribed for.
* _General Message Publishing:_ This module also enables sending AMQP messages directly to a RabbitMQ server. Messages can be easily customized according to the AMQP specifications, as well the RabbitMQ extensions.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `librabbitmq-dev` — The following libraries or applications must be installed before running OpenSIPS with this module loaded

### Optional Modules

- `tls_mgm`

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
### `server_id` (string)

Specify configuration for a RabbitMQ server. It contains a set of parameters used to customize the connection to the server, as well as to the messages sent. The format of the parameter is _[id_name] param1=value1; param2=value2;_. The _uri_ parameter is mandatory.

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
    
*   _tls_domain_ - indicates which TLS domain (as defined using the _tls_mgm_ module) to use for this connection. This must be an _amqps_ URI and the [use_tls](#param_use_tls "1.5.3.use_tls (integer)") module parameter must be enabled.

**Example.** [ID1] uri = amqp://127.0.0.1.

```opensips
...
# connection to a RabbitMQ server on localhost, default port
modparam("event_rabbitmq", "server_id","[ID1] uri = amqp://127.0.0.1")
...
# connection with a 5 seconds interval for heartbeat messages
modparam("event_rabbitmq", "server_id","[ID2] uri = amqp://127.0.0.1;
heartbeat = 5")
...
# TLS connection
modparam("event_rabbitmq", "server_id","[ID3] uri = amqps://127.0.0.1; tls_domain=rmq")
...
```
### `timeout` (integer)

Indicates the timeout (in milliseconds) of any command (i.e. publish) sent to the RabbitMQ server.

*Default value is 0.*

**Notes:** NOTE that this parameter is available only starting with RabbitMQ library version _0.9.0_; setting it when using an earlier version will have no effect, and the publish command will run in blocking mode.

**Example.** 1000.

```opensips
...
modparam("event_rabbitmq", "timeout", 1000) # timeout after 1s
...
```
### `use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls_domain=_dom_name_" parameter in the configuration specified through the [RabbitMQ socket syntax](#socket_syntax "1.3.RabbitMQ socket syntax").

When using this parameter, you must also ensure that _tls_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

*Default value is 0.*

**Example.** 1.

```opensips
...
modparam("tls_mgm", "client_domain", "rmq")
modparam("tls_mgm", "certificate", "[rmq]/etc/pki/tls/certs/rmq.pem")
modparam("tls_mgm", "private_key", "[rmq]/etc/pki/tls/private/rmq.key")
modparam("tls_mgm", "ca_list",     "[rmq]/etc/pki/tls/certs/ca.pem")
...
modparam("event_rabbitmq", "use_tls", 1)
...
```

## Exported Functions

### `rabbitmq_publish(server_id, routing_key, message [, [content_type [, headers, headers_vals]]])`

Sends a publish message to a RabbitMQ server.

This function also allows you to attach AMQP headers and values in the AMQP message. This is done by specifying a set of headers names (in the _headers_ parameter) and the corresponding values (in the _headers_vals_ parameter). The number of AVP values in the _headers_ must be the same as the one in the _headers_vals_.

**Parameters:**

- `content_type` *(string, optional)* — content type of the message sent. By default it is _none_.
- `headers` *(string, optional)* — an AVP containing the names of the headers within the AMQP message. If set, _headers_vals_ parameter must also be specified.
- `headers_vals` *(string, optional)* — an AVP containing the corresponding values of the AMQP headers. If set, _headers_ parameter must also be specified.
- `message` *(string, required)* — the body of the message.
- `routing_key` *(string, required)* — routing key used to deliver the AMQP message.
- `server_id` *(string, required)* — the id of the RabbitMQ server. Must be one of the parameters defined in the _server_id_ modparam.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ERROR_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** rabbitmq_publish() function usage.

```opensips
...
rabbitmq_publish("ID1", "call", "$fU called $rU");
...
rabbitmq_publish("ID1", "call", "{ \'caller\': \'$fU\',
				\'callee\; \'$rU\'", "application/json");
...
$avp(hdr_name) = "caller";
$avp(hdr_value) = $fU;
$avp(hdr_name) = "callee";
$avp(hdr_value) = $rU;
rabbitmq_publish("ID2", "call", $rb, , $avp(hdr_name), $avp(hdr_value));
...
```

## Configuration Examples

### Example 1.7. E_PIKE_BLOCKED event

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
### Example 1.8. RabbitMQ socket

```opensips
rabbitmq:guest:guest@127.0.0.1:5672/pike

# same socket can be written as
rabbitmq:127.0.0.1/pike

# TLS broker connection
rabbitmq:127.0.0.1/tls_domain=rmq?pike
```
