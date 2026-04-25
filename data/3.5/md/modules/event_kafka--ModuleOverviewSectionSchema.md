# event\_kafka Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp106688)

2.2. [Most recently active contributors(1) to this module](#idp5707264)

**List of Examples**

1.1. [Set `broker_id` parameter](#idp4991696)

1.2. [`kafka_publish()` function usage](#idp5055200)

1.3. [Kafka socket](#idp3586576)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of an [Apache Kafka](https://kafka.apache.org/) producer. It serves as a transport backend for the Event Interface and also provides a stand-alone connector to be used from the OpenSIPS script in order to publish messages to Kafka brokers.

## 1.2.�Kafka socket syntax

_'kafka:' brokers '/' topic \['?' properties\]_

Meaning of the socket fields:

*   _brokers_ - comma-separated list of the addresses (as host:port) of the Kafka brokers to connect to. These are the "bootstrap" servers used by the client to discover the Kafka cluster. This corresponds to the _bootstrap.servers_ / _metadata.broker.list_ configuration property.
    
*   _topic_ - Kafka topic used to publish messages to.
    
*   _properties_ - configuration properties to be transparently passed to the Kafka client library. The syntax is:
    
    _'g.'|'t.' property '=' value \['&' 'g.'|'t.' property '=' value\] ..._
    
    The _g._ or _t._ prefix before each property name specifies whether it's a global or topic level property, as classified by the Kafka library. Documentation for the supported properties can be found [here](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md).
    
    Note that some library properties have the _topic._ prefix as part of their name, but still fall under the global category.
    
    _key=callid_ is an extra property that is not passed to the Kafka library and is interpreted by OpenSIPS itself. When enabling this property the record published to Kafka will also include the Call-ID of the current SIP message as key.
    

## 1.3.�Kafka events syntax

The event payload is formated as a JSON-RPC notification, with the event name as the _method_ field and the event parameters as the _params_ field.

The record published to Kafka will also include the Call-ID of the current SIP message as key, if the _key=callid_ property is provided in the event socket.

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _none_.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _librdkafka-dev_
    

_librdkafka-dev_ can be installed from the Confluent [APT](https://docs.confluent.io/current/installation/installing_cp/deb-ubuntu.html#get-the-software) or [YUM](https://docs.confluent.io/current/installation/installing_cp/rhel-centos.html#get-the-software) repositories.

## 1.5.�Exported Parameters

### 1.5.1.�`broker_id` (string)

This parameter specifies the configuration for a Kafka broker (or cluster) that can be used to publish messages directly from the script, using the [kafka\_publish()](#func_kafka_publish "1.6.1.� kafka_publish(broker_id, message, [key], [report_route])") function.

The format of the parameter is: _\[ID\]kafka\_socket_, where _ID_ is an identifier for this broker instance and _kafka\_socket_ is a specification similar to the [Kafka socket syntax](#kafka_socket_syntax "1.2.�Kafka socket syntax").

The _key=callid_ property does not have an effect for brokers configured through this parameter.

This parameter can be set multiple times.

**Example�1.1.�Set `broker_id` parameter**

...
modparam("event\_kafka", "broker\_id", "\[k1\]127.0.0.1:9092/topic1?g.linger.ms=100&t.acks=all")
...

  

## 1.6.�Exported Functions

### 1.6.1.� `kafka_publish(broker_id, message, [key], [report_route])`

Publishes a message to a Kafka broker (or cluster). As the actual send operation is done in an asynchronous manner, a report route may be provided in order to check the message delivery status.

Returns _1_ if the message was succesfully queued for sending or _\-1_ otherwise.

This function can be used from any route.

The function has the following parameters:

*   _broker\_id_ (string) - the ID of the Kafka broker (or cluster). Must be one of the IDs defined through the [broker\_id](#param_broker_id "1.5.1.�broker_id (string)") modparam.
    
*   _message_ (string) - the payload of the Kafka message to publish.
    
*   _key_ (string, optional) - the key of the Kafka record to publish.
    
*   _report\_route_ (string, static, optional) - name of a script route to be executed when the message delivery status is available. Information about the message publishing will be available in this route through the following AVP variables:
    
    *   _$avp(kafka\_id)_ - broker ID
        
    *   _$avp(kafka\_status)_ - delivery status, 0 if succesfull, -1 othewise
        
    *   _$avp(kafka\_key)_ - message key
        
    *   _$avp(kafka\_msg)_ - message payload
        
    

**Example�1.2.�`kafka_publish()` function usage**

	...
	$var(msg) = "my msg content";
	kafka\_publish("k1", $var(kmsg), $ci, "kafka\_report");
	...
	route\[kafka\_report\] {
		xlog("Delivery status: $avp(kafka\_status) for broker: $avp(kafka\_id)\\n");
	}
	...
	

  

## 1.7.�Examples

**Example�1.3.�Kafka socket**

	kafka:127.0.0.1:9092/topic1?t.message.timeout.ms=1000&key=callid

  

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

26

8

1933

31

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

25

37

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

5

5

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

4

2

2

1

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

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

Jul 2024 - Aug 2025

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jul 2025 - Jul 2025

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

May 2023 - Jun 2024

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Aug 2020 - Jun 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2020 [www.opensips-solutions.com](http://www.opensips-solutions.com/)