## 1.5.�Exported Parameters

### 1.5.1.�`heartbeat` (integer)

Enables heartbeat support for the AMQP communication. If the client does not receive a heartbeat from server within the specified interval, the socket is automatically closed by the rabbitmq-client. This prevents OpenSIPS from blocking while waiting for a response from a dead rabbitmq-server. The value represents the heartbit interval in seconds.

_Default value is “0 (disabled)”._

**Example�1.1.�Set `heartbeat` parameter**

...
modparam("event\_rabbitmq", "heartbeat", 3)
...

  

### 1.5.2.�`connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

_Default value is “500” (milliseconds)._

**Example�1.2.�Setting the `connect_timeout` parameter**

...
modparam("event\_rabbitmq", "connect\_timeout", 1000)
...
	

  

### 1.5.3.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" parameter in the configuration specified through the [RabbitMQ socket syntax](#socket_syntax "1.3.�RabbitMQ socket syntax").

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

_Default value is **0** (not enabled)_

**Example�1.3.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "rmq")
modparam("tls\_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls\_mgm", "private\_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls\_mgm", "ca\_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("event\_rabbitmq", "use\_tls", 1)
...

  

### 1.5.4.�`timeout` (integer)

Indicates the timeout (in milliseconds) of any command (i.e. publish) sent to the RabbitMQ server.

_NOTE_ that this parameter is available only starting with RabbitMQ library version _0.9.0_; setting it when using an earlier version will have no effect, and the publish command will run in blocking mode.

_Default value is **0** (no timeout - blocking mode)_

**Example�1.4.�Set the `timeout` parameter**

...
modparam("event\_rabbitmq", "timeout", 1000) # timeout after 1s
...

  

### 1.5.5.�`server_id` (string)

Specify configuration for a RabbitMQ server. It contains a set of parameters used to customize the connection to the server, as well as to the messages sent. The format of the parameter is _\[id\_name\] param1=value1; param2=value2;_. The _uri_ parameter is mandatory.

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
    
*   _tls\_domain_ - indicates which TLS domain (as defined using the _tls\_mgm_ module) to use for this connection. This must be an _amqps_ URI and the [use\_tls](#param_use_tls "1.5.3.�use_tls (integer)") module parameter must be enabled.
    

**Example�1.5.�Set `server_id` parameter**

...
# connection to a RabbitMQ server on localhost, default port
modparam("event\_rabbitmq", "server\_id","\[ID1\] uri = amqp://127.0.0.1")
...
# connection with a 5 seconds interval for heartbeat messages
modparam("event\_rabbitmq", "server\_id","\[ID2\] uri = amqp://127.0.0.1;
heartbeat = 5")
...
# TLS connection
modparam("event\_rabbitmq", "server\_id","\[ID3\] uri = amqps://127.0.0.1; tls\_domain=rmq")
...