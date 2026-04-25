# RabbitMQ Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5968960)

2.2. [Most recently active contributors(1) to this module](#idp6050160)

**List of Examples**

1.1. [Set `server_id` parameter](#idp5890800)

1.2. [Set the `use_tls` parameter](#idp5898208)

1.3. [Setting the `connect_timeout` parameter](#idp5903488)

1.4. [Set the `timeout` parameter](#idp5910064)

1.5. [`rabbitmq_publish()` function usage](#idp5927616)

## Chapter�1.�Admin Guide

## 1.1.�Overview

_RabbitMQ_ ([http://www.rabbitmq.com/](http://www.rabbitmq.com/)) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

Using this module you can send AMQP messages to a RabbitMQ server. Messages can be easily customized according to the AMQP specifications, as well the RabbitMQ extensions.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tls\_mgm_ if [use\_tls](#param_use_tls "1.3.2.�use_tls (integer)") is enabled.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _librabbitmq-dev_
    

## 1.3.�Exported Parameters

### 1.3.1.�`server_id` (string)

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
    
*   _tls\_domain_ - indicates which TLS domain (as defined using the _tls\_mgm_ module) to use for this connection. This must be an _amqps_ URI and the [use\_tls](#param_use_tls "1.3.2.�use_tls (integer)") module parameter must be enabled.
    

**Example�1.1.�Set `server_id` parameter**

...
# connection to a RabbitMQ server on localhost, default port
modparam("rabbitmq", "server\_id","\[ID1\] uri = amqp://127.0.0.1")
...
# connection with a 5 seconds interval for heartbeat messages
modparam("rabbitmq", "server\_id","\[ID2\] uri = amqp://127.0.0.1;
heartbeat = 5")
...
# TLS connection
modparam("rabbitmq", "server\_id","\[ID3\] uri = amqps://127.0.0.1; tls\_domain=rmq")
...
		

  

### 1.3.2.�`use_tls` (integer)

Setting this parameter will allow you to use TLS for broker connections. In order to enable TLS for a specific connection, you can use the "tls\_domain=_dom\_name_" parameter in the configuration specified through the [server\_id](#param_server_id "1.3.1.�server_id (string)") module parameter.

When using this parameter, you must also ensure that _tls\_mgm_ is loaded and properly configured. Refer to the the module for additional info regarding TLS client domains.

_Default value is **0** (not enabled)_

**Example�1.2.�Set the `use_tls` parameter**

...
modparam("tls\_mgm", "client\_domain", "rmq")
modparam("tls\_mgm", "certificate", "\[rmq\]/etc/pki/tls/certs/rmq.pem")
modparam("tls\_mgm", "private\_key", "\[rmq\]/etc/pki/tls/private/rmq.key")
modparam("tls\_mgm", "ca\_list",     "\[rmq\]/etc/pki/tls/certs/ca.pem")
...
modparam("rabbitmq", "use\_tls", 1)
...

  

### 1.3.3.�`connect_timeout` (integer)

The maximally allowed duration (in milliseconds) for the establishment of a TCP connection with a RabbitMQ server.

_Default value is “500” (milliseconds)._

**Example�1.3.�Setting the `connect_timeout` parameter**

aram("rabbitmq", "connect\_timeout", 1000)

  

### 1.3.4.�`timeout` (integer)

Indicates the timeout (in milliseconds) of any command (i.e. publish) sent to the RabbitMQ server.

_NOTE_ that this parameter is available only starting with RabbitMQ library version _0.9.0_; setting it when using an earlier version will have no effect, and the publish command will run in blocking mode.

_Default value is **0** (no timeout - blocking mode)_

**Example�1.4.�Set the `timeout` parameter**

...
modparam("rabbitmq", "timeout", 1000) # timeout after 1s
...

  

## 1.4.�Exported Functions

### 1.4.1.� `rabbitmq_publish(server_id, routing_key, message [, [content_type [, headers, headers_vals]]])`

Sends a publish message to a RabbitMQ server.

This function also allows you to attach AMQP headers and values in the AMQP message. This is done by specifying a set of headers names (in the _headers_ parameter) and the corresponding values (in the _headers\_vals_ parameter). The number of AVP values in the _headers_ must be the same as the one in the _headers\_vals_.

This function can be used from any route.

The function has the following parameters:

*   _server\_id_ (string) - the id of the RabbitMQ server. Must be one of the parameters defined in the _server\_id_ modparam.
    
*   _routing\_key_ (string) - routing key used to deliver the AMQP message.
    
*   _message_ (string) - the body of the message.
    
*   _content\_type_ (string, optional) - content type of the message sent. By default it is _none_.
    
*   _headers_ (string, optional) - an AVP containing the names of the headers within the AMQP message. If set, _headers\_vals_ parameter must also be specified.
    
*   _headers\_vals_ (string, optional) - an AVP containing the corresponding values of the AMQP headers. If set, _headers_ parameter must also be specified.
    

**Example�1.5.�`rabbitmq_publish()` function usage**

	...
	rabbitmq\_publish("ID1", "call", "$fU called $rU");
	...
	rabbitmq\_publish("ID1", "call", "{ \\'caller\\': \\'$fU\\',
					\\'callee\\; \\'$rU\\'", "application/json");
	...
	$avp(hdr\_name) = "caller";
	$avp(hdr\_value) = $fU;
	$avp(hdr\_name) = "callee";
	$avp(hdr\_value) = $rU;
	rabbitmq\_publish("ID2", "call", $rb, , $avp(hdr\_name), $avp(hdr\_value));
	...
	

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

51

34

1595

128

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

16

8

540

146

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

8

6

18

36

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

5

14

14

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

3

1

2

1

6.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jan 2017 - Mar 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jul 2017 - Feb 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2018 - Nov 2022

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2021

5.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2019 - Apr 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2019 - Apr 2019

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2017 [www.opensips-solutions.com](http://www.opensips-solutions.com/)