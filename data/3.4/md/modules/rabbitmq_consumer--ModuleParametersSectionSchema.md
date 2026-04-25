## 1.3.�Exported Parameters

### 1.3.1.�`connection_id` (string)

Specify the configuration for a RabbitMQ connection. It contains a set of parameters used to customize the connection to the server as well as the consumer subscription. The format of the parameter is _param1=value1; param2=value2;_. The _uri_, _queue_ and _event_ parameters are mandatory.

This parameter can be set multiple times, for each RabbitMQ connection.

The following parameters can be used:

*   _uri_ - Mandatory parameter - a full _amqp_ URI as described [here](https://www.rabbitmq.com/uri-spec.html). Missing fields in the URI will receive default values, such as: _user: guest_, _password: guest_, _host: localhost_, _vhost: /_, _port: 5672_. TLS connections are specified using an _amqps_ URI.
    
*   _queue_ - Mandatory parameter - the name of the RabbitMQ queue to subscribe a consumer to. This parameter is mandatory.
    
*   _event_ - Mandatory parameter - the name of the OpenSIPS event that will be triggered for each AMQP message received.
    
*   _ack_ - flag that indicates to the broker that messages will be acknowledged upon receival. If you do not set this flag, the server will not expect ACKs and OpenSIPS will not send them.
    
*   _exclusive_ - flag that indicates to the broker that exclusive consumer access is requested, meaning only this consumer can access the queue.
    
*   _frame\_max_ - the maximum size of an AMQP frame. Default size is 131072.
    
*   _heartbeat_ - interval in seconds used to send heartbeat messages. Default is disabled.
    
*   _tls\_domain_ - indicates which TLS domain (as defined using the _tls\_mgm_ module) to use for this connection. This must be an _amqps_ URI and the [use\_tls](#param_use_tls "1.3.4.�use_tls (integer)") module parameter must be enabled.
    

**Example�1.1.�Set `connection_id` parameter**

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
		

  

### 1.3.2.�`connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

_Default value is “500” (milliseconds)._

**Example�1.2.�Setting the `connect_timeout` parameter**

...
modparam("rabbitmq\_consumer", "connect\_timeout", 1000)
...

  

### 1.3.3.�`retry_timeout` (integer)

The interval (in milliseconds) after which OpenSIPS will try to re-establish a failed AMQP connection to a RabbitMQ server.

_Default value is “5000” (milliseconds)._

**Example�1.3.�Setting the `retry_timeout` parameter**

...
modparam("rabbitmq\_consumer", "retry\_timeout", 10000)
...

  

### 1.3.4.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" parameter in the configuration specified through the [connection\_id](#param_connection_id "1.3.1.�connection_id (string)") module parameter.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

_Default value is **0** (not enabled)_

**Example�1.4.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "rmq")
modparam("tls\_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls\_mgm", "private\_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls\_mgm", "ca\_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("rabbitmq\_consumer", "use\_tls", 1)
...