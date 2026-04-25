# freeswitch\_scripting Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6074928)

2.2. [Most recently active contributors(1) to this module](#idp6156080)

**List of Examples**

1.1. [Setting the `db_url` parameter](#idp172688)

1.2. [Setting the `db_table` parameter](#idp5926096)

1.3. [Setting the `db_col_username` parameter](#idp5931296)

1.4. [Setting the `db_col_password` parameter](#idp5936608)

1.5. [Setting the `db_col_ip` parameter](#idp5941424)

1.6. [Setting the `db_col_port` parameter](#idp5946400)

1.7. [Setting the `db_col_events` parameter](#idp5951440)

1.8. [Setting the `fs_subscribe` parameter](#idp5956768)

1.9. [`_freeswitch_esl()_` usage](#idp5984624)

## Chapter�1.�Admin Guide

## 1.1.�Overview

_freeswitch\_scripting_ is a helper module that exposes full control over the FreeSWITCH ESL interface to the OpenSIPS script.

It allows the OpenSIPS script writer to subscribe to generic FreeSWITCH ESL events as well as to run arbitrary FreeSWITCH ESL commands and interpret their results. It makes use of the [freeswitch](freeswitch) module for the management of ESL connections and event subscriptions.

Credits for the initial idea and working code samples providing both ESL events and commands go to Giovanni Maruzzelli <gmaruzz@opentelecom.it>.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded together with this module:

*   _freeswitch_
    
*   _(optional) an SQL DB module_
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

An SQL database URL which the module will use in order to load a set of FreeSWITCH ESL sockets and their event subscriptions.

_Default value is “NULL” (DB support disabled)._

**Example�1.1.�Setting the `db_url` parameter**

...
modparam("freeswitch\_scripting", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.3.2.�`db_table` (string)

The SQL table name for this module.

_Default value is “freeswitch”._

**Example�1.2.�Setting the `db_table` parameter**

...
modparam("freeswitch\_scripting", "db\_table", "freeswitch\_sockets")
...

  

### 1.3.3.�`db_col_username` (string)

The SQL column name for the "username" ESL connect information.

_Default value is “username”._

**Example�1.3.�Setting the `db_col_username` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_username", "user")
...

  

### 1.3.4.�`db_col_password` (string)

The SQL column name for the "password" ESL connect information.

_Default value is “password”._

**Example�1.4.�Setting the `db_col_password` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_password", "pass")
...

  

### 1.3.5.�`db_col_ip` (string)

The SQL column name for the "ip" ESL connect information.

_Default value is “ip”._

**Example�1.5.�Setting the `db_col_ip` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_ip", "ip\_addr")
...

  

### 1.3.6.�`db_col_port` (string)

The SQL column name for the "port" ESL connect information.

_Default value is “port”._

**Example�1.6.�Setting the `db_col_port` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_port", "tcp\_port")
...

  

### 1.3.7.�`db_col_events` (string)

The SQL column name for the comma-separated, case-sensitive FreeSWITCH event names which OpenSIPS will subscribe to.

_Default value is “events\_csv”._

**Example�1.7.�Setting the `db_col_events` parameter**

...
modparam("freeswitch\_scripting", "db\_col\_events", "fs\_events")
...

  

### 1.3.8.�`fs_subscribe` (string)

Add a FreeSWITCH ESL URL to which OpenSIPS will connect at startup. The URL syntax includes support for specifying a list of events to subscribe to and follows this pattern: **\[fs://\]\[\[username\]:password@\]host\[:port\]\[?event1\[,event2\]...\]**

_This parameter can be set multiple times._

**Example�1.8.�Setting the `fs_subscribe` parameter**

...
modparam("freeswitch\_scripting", "fs\_subscribe", ":ClueCon@10.0.0.10?CHANNEL\_STATE")
modparam("freeswitch\_scripting", "fs\_subscribe", ":ClueCon@10.0.0.11:8021?DTMF,BACKGROUND\_JOB")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `freeswitch_esl(command, freeswitch_url[, response_var])`

Run an arbitrary command on an arbitrary FreeSWITCH ESL socket. The socket need not necessarily be defined in the database or through **[fs\_subscribe](#param_fs_subscribe "1.3.8.�fs_subscribe (string)")**. However, if this is the case, then the "password" part of the URL becomes mandatory.

The current OpenSIPS worker will block until an answer from FreeSWITCH arrives. The timeout for this operation can be controlled via the **esl\_cmd\_timeout** parameter of the freeswitch connection manager module.

Meaning of the parameters is as follows:

*   _command_ (string) - the ESL command string to execute.
    
*   _freeswitch\_url_ (string) - the ESL interface to connect to. The syntax is: \[fs://\]\[\[username\]:password@\]host\[:port\]\[?event1\[,event2\]...\]. The "?events" part of the URL will be silently discarded.
    
*   _response\_var (var, optional)_ - a variable which will hold the text result of the ESL command.
    

**Return value**

*   1 (success) - the ESL command executed successfully and any output variables were successfully written to. Note that this does not say anything about the nature of the ESL answer (it may well be a "-ERR" type of response)
    
*   \-1 (failure) - internal error or the ESL command failed to execute
    

This function can be used from any route.

**Example�1.9.� `_freeswitch_esl()_` usage**

...
	# ESL socket 10.0.0.10 is defined in the database (password "ClueCon")
	$var(rc) = freeswitch\_esl("bgapi originate {origination\_uuid=123456789}user/1010 9386\\njob-uuid: foobar", "10.0.0.10", "$var(response)");
	if ($var(rc) < 0) {
		xlog("failed to execute ESL command ($var(rc))\\n");
		return -1;
	}
...
	# ESL socket 10.0.0.10 is new, we must specify a password
	$var(rc) = freeswitch\_esl("bgapi originate {origination\_uuid=123456789}user/1010 9386\\njob-uuid: foobar", ":ClueCon@10.0.0.10", $var(response));
	if ($var(rc) < 0) {
		xlog("failed to execute ESL command ($var(rc))\\n");
		return -1;
	}
...

  

## 1.5.�Exported MI Commands

### 1.5.1.�fs\_subscribe

Ensures that the given FreeSWITCH ESL socket is subscribed to the given list of events. In case an event cannot be subscribed to, the freeswitch driver will periodically retry to subscribe to it until an fs\_unsubscribe MI command for the respective event is issued.

Parameters:

*   _freeswitch\_url_ - the ESL interface to connect to. The syntax is: \[fs://\]\[\[username\]:password@\]host\[:port\]\[?event1\[,event2\]...\]. The "?events" part of the URL will be silently discarded.
    
*   _event_ - the name of the event to subscribe to
    
*   _..._ - (other events)
    

### 1.5.2.�fs\_unsubscribe

Ensures that the given FreeSWITCH ESL socket is unsubscribed from the given list of events.

Parameters:

*   _freeswitch\_url_ - the ESL interface to search for. The syntax is: \[fs://\]\[\[username\]:password@\]host\[:port\]\[?event1\[,event2\]...\]. The "?events" part of the URL will be silently discarded.
    
*   _event_ - the name of the event to unsubscribe from
    
*   _..._ - (other events)
    

### 1.5.3.�fs\_list

Displays the current set of FreeSWITCH ESL sockets and the list of events that the module is subscribed to for each socket.

### 1.5.4.�fs\_reload

Replaces the current set\* of FreeSWITCH ESL sockets along with their respective events with the current data (ESL sockets and their events) found in the "freeswitch" table.

\* this includes any sockets/events provisioned through [fs\_subscribe](#param_fs_subscribe "1.3.8.�fs_subscribe (string)"), MI [fs\_subscribe](#mi-fs-subscribe "1.5.1.�fs_subscribe") commands or previous DB data set.

## 1.6.�Exported Events

### 1.6.1.� `E_FREESWITCH`

This event is raised when OpenSIPS receives an ESL event notification from a socket that the "freeswitch\_scripting" module is subscribed to.

Parameters:

*   _name_ - the name of the event
    
*   _sender_ - the FreeSWITCH sender IP address
    
*   _body_ - the full JSON-encoded body of the event, as sent by FreeSWITCH. Use the json module ($json variable) to easily interpret it.
    

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

46

25

1925

276

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

3

137

124

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

5

3

3

1

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

4

2

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

4

4

6.

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

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Dec 2017 - Jan 2023

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2019 - Mar 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2019 - Sep 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jan 2019 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

_Documentation Copyrights:_

Copyright � 2017 [www.opensips-solutions.com](http://www.opensips-solutions.com/)