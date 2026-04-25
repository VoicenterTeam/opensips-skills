# JANUS Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5588688)

2.2. [Most recently active contributors(1) to this module](#idp5657072)

**List of Examples**

1.1. [Setting the `janus_send_timeout` parameter](#idp4870512)

1.2. [Setting the `janus_max_msg_chunks` parameter](#idp247712)

1.3. [Setting the `janus_cmd_timeout` parameter](#idp164720)

1.4. [Setting the `janus_cmd_polling_itv` parameter](#idp170384)

1.5. [Setting the `janus_ping_interval` parameter](#idp5514752)

1.6. [Setting the `janus_db_url` parameter](#idp5519568)

1.7. [Setting the `janus_db_table` parameter](#idp5524384)

1.8. [`_janus_send_request()_` usage](#idp5538432)

1.9. [`_E_JANUS_EVENT_` example](#idp5548128)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _"janus"_ module is a C driver for the Janus websocket protocol. It can interact with one or more Janus servers either by issuing commands to them, or by receiving events from them.

This driver can be seen as a centralized Janus connection manager. It will connect to each Janus server, establish the connection hanler ID and the clients can be transparent from the connection handler ID point of view, simply passing the desired Janus commands that they want to run.

## 1.2.�External Libraries or Applications

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded together with this module:

*   _an SQL DB module_
    

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

## 1.3.�Exported Parameters

### 1.3.1.�`janus_send_timeout` (integer)

Time in milliseconds after a Janus WebSocket connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is “1000” (milliseconds)._

**Example�1.1.�Setting the `janus_send_timeout` parameter**

...
modparam("janus", "janus\_send\_timeout", 2000)
...

  

### 1.3.2.�`janus_max_msg_chunks` (integer)

The maximum number of chunks in which a Janus message is expected to arrive via WebSocket. If a received packet is more fragmented than this, the connection is dropped

_Default value is “4”_

**Example�1.2.�Setting the `janus_max_msg_chunks` parameter**

...
modparam("janus", "janus\_max\_msg\_chunks", 8)
...

  

### 1.3.3.�`janus_cmd_timeout` (integer)

The maximally allowed duration for the execution of an Janus command. This interval does not include the connect duration.

_Default value is “5000” (milliseconds)._

**Example�1.3.�Setting the `janus_cmd_timeout` parameter**

...
modparam("janus", "janus\_cmd\_timeout", 3000)
...

  

### 1.3.4.�`janus_cmd_polling_itv` (integer)

The sleep interval used when polling for an Janus command response. Since the value of this parameter imposes a minimal duration for any Janus command, you should run OpenSIPS in debug mode in order to first determine an expected response time for an arbitrary Janus command, then tune this parameter accordingly.

_Default value is “1000” (microseconds)._

**Example�1.4.�Setting the `janus_cmd_polling_itv` parameter**

...
modparam("janus", "janus\_cmd\_polling\_itv", 3000)
...

  

### 1.3.5.�`janus_ping_interval` (integer)

The time interval at which OpenSIPS will do keepalive pinging on the Janus connect

_Default value is “5” (seconds)._

**Example�1.5.�Setting the `janus_ping_interval` parameter**

...
modparam("janus", "janus\_ping\_interval", 10)
...

  

### 1.3.6.�`janus_db_url` (string)

The DB URL from where OpenSIPS will load the list of Janus connection

_Default value is “"none"” (needs to be set for the module to start)._

**Example�1.6.�Setting the `janus_db_url` parameter**

...
modparam("janus", "janus\_db\_url", "mysql://root@localhost/opensips")
...

  

### 1.3.7.�`janus_db_table` (string)

The DB Table from where OpenSIPS will load the list of Janus connection

_Default value is “janus”_

**Example�1.7.�Setting the `janus_db_table` parameter**

...
modparam("janus", "janus\_db\_table", "my\_janus\_table")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `janus_send_requeest(janus_id, janus_command[, response_var])`

Run an arbitrary command on an arbitrary Janus socket. The janus\_id must be defined in the database

The current OpenSIPS worker will block until an answer from Janus arrives. The timeout for this operation can be controlled via the **janus\_cmd\_timeout** param.

Meaning of the parameters is as follows:

*   _janus\_id_ (string) - the ID of the janus connection as defined in the databsae.
    
*   _janus\_command_ (string) - the JANUS command to run.
    
*   _response\_var (var, optional)_ - a variable which will hold the text result of the Janus command.
    

**Return value**

*   1 (success) - the Janus command executed successfully and any output variables were successfully written to. Note that this does not say anything about the nature of the Janus answer (it may well be a "-ERR" type of response)
    
*   \-1 (failure) - internal error or the Janus command failed to execute
    

This function can be used from any route.

**Example�1.8.� `_janus_send_request()_` usage**

...
# if the DB contains: 
#       id: 1
# janus\_id: test\_janus
# janus\_url: janusws://my\_janus\_host:80/janus?room=abcd

	$var(rc) = janus\_send\_request("test\_janus", "{
  "janus": "attach",
  "plugin": "janus.plugin.videoroom",
  "transaction": "abcdef123456",
  "session\_id": 987654321
}", $var(response));
	if (!$var(rc)) {
		xlog("failed to execute Janus command ($var(rc))\\n");
		return -1;
	}
	xlog("Janus response is $var(response) \\n");
...
...

  

### 1.4.2.�Exported Events

#### 1.4.2.1.� `E_JANUS_EVENT`

This event is raised when a notification is received from a Janus server.

Parameters represent the janus\_id and the janus\_url that originated the notification, and the full janus\_body of the event received

*   _janus\_id_ - the janus id as defined in the database
    
*   _janus\_url_ - the janus url as defined in the database
    
*   _janus\_body_ - full body of the notification received from janus
    

**Example�1.9.� `_E_JANUS_EVENT_` example**

...
# if the DB contains: 
#       id: 1
# janus\_id: test\_janus
# janus\_url: janusws://my\_janus\_host:80/janus?room=abcd

event\_route\[E\_JANUS\_EVENT\] {
	xlog("Received janus event from $param(janus\_id) - $param(janus\_url) - $param(janus\_body) \\n");
	$json(janus\_body) := $param(janus\_body);
	$avp(janus\_sender) =  $json(janus\_body/sender);
	if ($avp(janus\_sender) != NULL) {
		xlog("Received event from sender $avp(janus\_sender) \\n");
	}
}
...
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

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

45

7

4390

5

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

4

2

1

3

3.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

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

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Dec 2024 - May 2025

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2025 - Mar 2025

3.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Feb 2025 - Feb 2025

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

_Documentation Copyrights:_

Copyright � 2024 OpenSIPS Project;