# RabbitMQ Consumer Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5630624)

2.2. [Most recently active contributors(1) to this module](#idp5707552)

**List of Examples**

1.1. [Set `connection_id` parameter](#idp5578000)

1.2. [Setting the `connect_timeout` parameter](#idp5583536)

1.3. [Setting the `retry_timeout` parameter](#idp5588576)

1.4. [Set the `use_tls` parameter](#idp5595824)

## Chapter�1.�Admin Guide

## 1.1.�Overview

_RabbitMQ Consumer_ ([http://www.rabbitmq.com/](http://www.rabbitmq.com/)) is an open source messaging server. It's purpose is to manage received messages in queues, taking advantage of the flexible AMQP protocol.

Using this module you can subscribe consumers to a RabbitMQ broker in order to receive AMQP messages for specified queues. The messages will be delivered by triggering events through the OpenSIPS Event Interface.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tls\_mgm_ if [use\_tls](#param_use_tls "1.3.4.�use_tls (integer)") is enabled.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _librabbitmq-dev_
    

NOte that the module is not compatible with versions 0.4 or below of the librabbitmq-dev library.

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

  

## 1.4.�Exported Functions

The module does not export any script functions.

## 1.5.�Exported Events

An event with a custom name, as set in the _event_ field of the [connection\_id](#param_connection_id "1.3.1.�connection_id (string)") parameter, will be raised for each AMQP message received.

Parameters:

*   _body_ - the AMQP message body.
    

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

18

5

1375

9

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

6

6

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

6

4

6

1

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

3

1

1

2

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2024 - Jun 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Feb 2023

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Apr 2019 - Dec 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2019 - Jul 2020

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2019 - Jul 2019

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2019 [www.opensips-solutions.com](http://www.opensips-solutions.com/)