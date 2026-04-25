# event\_stream Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5584560)

2.2. [Most recently active contributors(1) to this module](#idp5674512)

**List of Examples**

1.1. [Set `reliable_mode` parameter](#idp5522528)

1.2. [Set `timeout` parameter](#idp5529056)

1.3. [Set `event_param` parameter](#idp5534272)

1.4. [Stream socket](#idp5539056)

1.5. [E\_PIKE\_BLOCKED JSON-RPC notification](#idp5542160)

1.6. [E\_PIKE\_BLOCKED JSON-RPC request (reliable\_mode)](#idp5545488)

1.7. [E\_PIKE\_BLOCKED notification with event name](#idp5549248)

1.8. [E\_PIKE\_BLOCKED event](#idp5553440)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a TCP transport layer implementation for the Event Interface. The module can either send a JSON-RPC notification or a standard request and wait for the response (when used in _reliable\_mode_).

As the JSON-RPC is sent directly over TCP, avoiding any application transport layer (such as HTTP), this module offers a very lightweight and reliable way of delivering events to an application server.

In order to be notified, a JSON-RPC server has to subscribe for a certain event provided by OpenSIPS. This can be done using the generic MI Interface (_event\_subscribe_ function) or from OpenSIPS script (_subscribe\_event_ core function).

## 1.2.�Stream socket syntax

_'tcp:' host ':' port \['/' method\]_

Meaning:

*   _'tcp:'_ - specifies the transport protocol used by the Event Interface to send the command. the _tcp_ token indicates that the subscriber's events should be notified using the _event\_strea,_ module.
    
*   _host_ - host name of the JSON-RPC server.
    
*   _port_ - port of the JSON-RPC server.
    
*   _method_ - method called remotely by the JSON-RPC client.
    
    NOTE: this parameter is optional - if it is missing, the method used is the actual event subscribed to (i.e. if _localhost:8080_ subscribes to the _E\_PIKE\_BLOCKED_ event, the RPC call will use the _E\_PIKE\_BLOCKED_ method.
    

The JSON-RPC command is built as it follows:

*   _id_ - uniquly generated if _reliable\_mode_ is used, otherwise (for notifications) _null_.
    
*   _method_ - if no method is specified in the socket, the name of the event is set as method, otherwise the token specified is used.
    
*   _params_ - if the event sent contains named parameters, then this parameter contains a JSON object with an object for each parameter. If the event sent only contains values, the parameters will be sent as an array.
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _none_.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.4.�Exported Parameters

### 1.4.1.�`reliable_mode` (integer)

This parameter controls the way the _event\_stream_ module communicates with the JSON-RPC server. If enabled, (set to _1_), each event is translated to a JSON-RPC request. If disabled, each event will be sent as a JSON-RPC notification - there will be no reply expected by our client.

Note that if you need a reliable communication with the JSON-RPC server, where each event sent needs to be confirmed (by a JSON-RPC response), you must set this parameter to _1/yes_. If you are using this module in a failover setup (using the _event\_virtual_ module), it is recommended to set this parameter to _1/yes_.

_Default value is “0 (disabled)”._

**Example�1.1.�Set `reliable_mode` parameter**

...
modparam("event\_stream", "reliable\_mode", yes)
...

  

### 1.4.2.�`timeout` (integer)

Specified the amount of milliseconds the module waits for a command to complete. In _reliable\_mode_, it specifies the time module waits the request to be sent and a reply received. In non-_reliable\_mode_, it represents only the time opensips takes to send the JSON-RPC notification.

NOTE that if the event is not using names for its parameters, the event will be the first parameter in the JSON-RPC command.

_Default value is “1000 milliseconds = 1 second”._

**Example�1.2.�Set `timeout` parameter**

...
# only wait for 200 milliseonds for a reply
modparam("event\_stream", "timeout", 200)
...

  

### 1.4.3.�`event_param` (string)

By default, the name of the event subscribed to is not send in the JSON-RPC command. If one needs to send the name of the event as well, you can use this parameter to specify the name of JSON object within the params that will contain the name of the event.

_Default value is “disabled” - event is not added._

**Example�1.3.�Set `event_param` parameter**

...
modparam("event\_stream", "event\_param", "opensips\_event")
# json resulted will contain the "opensips\_event": EVENT token
...

  

## 1.5.�Exported Functions

No function exported to be used from configuration file.

## 1.6.�Examples

**Example�1.4.�Stream socket**

	# calls the 'block\_ip' method
	tcp:127.0.0.1:8080/block\_ip

	# calls the 'E\_PIKE\_BLOCKED' method, if subscribed to the E\_PIKE\_BLOCKED event
	tcp:127.0.0.1:8080

  

### 1.6.2.�JSON-RPC notification

This is an example of an event raised when _reliable\_mode_ is disabled by the pike module when it decides an ip should be blocked:

**Example�1.5.�E\_PIKE\_BLOCKED JSON-RPC notification**

{
	"jsonrpc": "2.0",
	"method": "E\_PIKE\_BLOCKED",
	"params": {
		"ip": "192.168.2.11"
	}
}

  

### 1.6.3.�JSON-RPC Request

This is an example of an event raised in _reliable\_mode_ by the pike module when it decides an ip should be blocked:

**Example�1.6.�E\_PIKE\_BLOCKED JSON-RPC request (reliable\_mode)**

\# request
{
	"id": 915243442,
	"jsonrpc": "2.0",
	"method": "E\_PIKE\_BLOCKED",
	"params": {
		"ip": "192.168.2.11"
	}
}

# reply
{
	"jsonrpc": "2.0",
	"result": 8,
	"id": 915243442
}

  

### 1.6.4.�JSON-RPC Notification with Event's name

when having the _event\_param_ set to _opensips\_event_, the event raised by the pike module will look like the following:

**Example�1.7.�E\_PIKE\_BLOCKED notification with event name**

\# module configuration
modparam("event\_stream", "event\_param", "opensips\_event")

# Stream socket: tcp:HOST:PORT/handle\_cmd

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "handle\_cmd",
	"params": {
		"opensips\_event": "E\_PIKE\_BLOCKED"
		"ip": "192.168.2.11"
	}
}

  

### 1.6.5.�Custom JSON-RPC Notification from script

This example contains a snippet to send a custom event from the script using the _event\_stream_ module.

Note that we are only populating values for the event, we are not assinging names to those values. Therefore, the parameters will be sent as an array.

**Example�1.8.�E\_PIKE\_BLOCKED event**

startup\_route {
	subscribe\_event("E\_MY\_EVENT", "tcp:127.0.0.1:8080");
}

route {
	...
	$avp(attr-val) = 3;
	$avp(attr-val) = 5;
	raise\_event("E\_MY\_EVENT", $avp(attr-val));
	...
}

# JSON-RPC command sent
{
	"jsonrpc": "2.0",
	"method": "E\_MY\_EVENT",
	"params": \[3, 5\]
}

  

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

32

14

1802

100

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

10

6

105

145

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

8

6

14

42

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

7

9

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

2

2

7.

Alexandra Titoc

3

1

1

1

8.

Ryan Bullock

2

1

2

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Ryan Bullock

Apr 2025 - Apr 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2018 - Mar 2025

3.

Alexandra Titoc

Sep 2024 - Sep 2024

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2020 - Jun 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Aug 2020

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2018 - Jan 2020

8.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2019 - Apr 2019

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2018 [www.opensips-solutions.com](http://www.opensips-solutions.com/)