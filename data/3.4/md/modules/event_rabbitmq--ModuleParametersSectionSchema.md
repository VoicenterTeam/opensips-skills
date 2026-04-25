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