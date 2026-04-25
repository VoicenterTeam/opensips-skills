# Dynamic Sockets Management Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5629616)

2.2. [Most recently active contributors(1) to this module](#idp5694304)

**List of Examples**

1.1. [Set “db\_url” parameter](#idp5528560)

1.2. [Set “table\_name” parameter](#idp5534432)

1.3. [Set “socket\_column” parameter](#idp5539408)

1.4. [Set “advertised\_column” parameter](#idp5544304)

1.5. [Set “tag\_column” parameter](#idp5549280)

1.6. [Set “flags\_column” parameter](#idp5554176)

1.7. [Set “tos\_column” parameter](#idp5559152)

1.8. [Set “processes” parameter](#idp5564048)

1.9. [Set “max\_sockets” parameter](#idp5569360)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides the means to provision and manage dynamic sockets for OpenSIPS at runtime. The definition of the sockets is stored in an SQL database and can be dynamically changed at runtime.

The module caches the entire table sockets and only adjusts the dynamic socket list after a reload using the [sockets\_mgm:reload](#mi_reload "1.6.1.� sockets_mgm:reload") MI command.

The [sockets\_mgm:list](#mi_list "1.6.2.� sockets_mgm:list") MI command. can be used to show all the dynamic sockets OpenSIPS is listening on.

## 1.2.�Sockets

The module exclusively handles sockets used for SIP traffic (e.g., UDP, TCP, TLS, WSS). It does not support BIN or HEP listeners, as these cannot be dynamically utilized or enforced in the script.

The management of dynamic sockets is divided into two behaviors, depending on whether the traffic is UDP-based or TCP-based. Based on the nature of your traffic, ensure that your settings are properly tuned to accommodate any sockets you may provision dynamically.

### 1.2.1.�UDP handling

All dynamically added UDP sockets are assigned to a group of dedicated extra processes. The number of these processes can be adjusted using the [processes](#param_processes "1.5.8.�processes (integer)") parameter. These processes handle UDP-based socket traffic evenly by balancing requests across the less loaded processes. The difference, however, is that static sockets are bound to designated processes, while dynamic sockets share the pool of extra processes.

### 1.2.2.�TCP handling

In contrast to UDP traffic handling, TCP traffic is processed in the same way as all other TCP traffic: requests are dispatched to one of the existing static TCP processes.

## 1.3.�Limitations

Although traffic processing by dynamic workers closely resembles that of static ones, there are certain limitations associated with using dynamic sockets:

*   UDP socket handling does not currently benefit from the autoscaling feature for the designated extra processes. This means that the number of [processes](#param_processes "1.5.8.�processes (integer)") defined at startup will always be forked, and only these processes will handle all traffic associated with dynamically added UDP sockets.
    
*   As stated earlier, the module only supports SIP based dynamic listener, no HEP or BIN.
    
*   Sockets defined in the database cannot be expanded to more than one listener. This means you cannot use an interface name or an alias that resolves to multiple IPs as a host. Only a single IP:port socket will be created, so provisioning should ideally be done with an explicit IP.
    
*   Due to some internal limitations, the dynamic sockets need to be pre-allocated at startup. This means that the number of dynamic sockets used at runtime have to be limited by a static value, defined at startup. This is why it is recommended to use a fairly high value for the sockets in the [max\_sockets](#param_max_sockets "1.5.9.�max_sockets (integer)") parameter - we're defaulting a confortable 100 sockets.
    
*   The sockets defined in the [max\_sockets](#param_max_sockets "1.5.9.�max_sockets (integer)") are being rotated in a FIFO manner - this way we are trying to avoid overlapping sockets in a short period of time.
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _A database module is needed for fetching the sockets_.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.5.�Exported Parameters

### 1.5.1.�`db_url` (string)

The database URL where the sockets are fetched from.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set “db\_url” parameter**

...
modparam("sockets\_mgm", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.5.2.�`table_name` (string)

The database table name where the sockets are stored.

_Default value is “sockets”._

**Example�1.2.�Set “table\_name” parameter**

...
modparam("sockets\_mgm", "table\_name", "sockets\_def")
...

  

### 1.5.3.�`socket_column` (string)

The database table column where the socket definition is stored.

_Default value is “socket”._

**Example�1.3.�Set “socket\_column” parameter**

...
modparam("sockets\_mgm", "socket\_column", "sock")
...

  

### 1.5.4.�`advertised_column` (string)

The database table column where the advertised definition is stored.

_Default value is “advertised”._

**Example�1.4.�Set “advertised\_column” parameter**

...
modparam("sockets\_mgm", "advertised\_column", "adv")
...

  

### 1.5.5.�`tag_column` (string)

The database table column where the tag definition is stored.

_Default value is “tag”._

**Example�1.5.�Set “tag\_column” parameter**

...
modparam("sockets\_mgm", "tag\_column", "sock")
...

  

### 1.5.6.�`flags_column` (string)

The database table column where the flags definition is stored.

_Default value is “flags”._

**Example�1.6.�Set “flags\_column” parameter**

...
modparam("sockets\_mgm", "flags\_column", "sock")
...

  

### 1.5.7.�`tos_column` (string)

The database table column where the tos definition is stored.

_Default value is “tos”._

**Example�1.7.�Set “tos\_column” parameter**

...
modparam("sockets\_mgm", "tos\_column", "sock")
...

  

### 1.5.8.�`processes` (integer)

The number of processes designated to handle UDP sockets.

_Default value is “8”._

**Example�1.8.�Set “processes” parameter**

...
modparam("sockets\_mgm", "processes", 32)
...

  

### 1.5.9.�`max_sockets` (integer)

The maximum number of sockets that can be defined dynamically. See the [Limitations](#limitations "1.3.�Limitations") section for more information.

_Default value is “100”._

**Example�1.9.�Set “max\_sockets” parameter**

...
modparam("sockets\_mgm", "max\_sockets", 2000)
...

  

## 1.6.�Exported MI Functions

### 1.6.1.� `sockets_mgm:reload`

Replaces obsolete MI command: _sockets\_reload_.

MI command used to reload the sockets from the database.

MI FIFO Command Format:

		## reload sockets from the database
		opensips-mi sockets\_mgm:reload
		opensips-cli -x mi sockets\_mgm:reload
		

### 1.6.2.� `sockets_mgm:list`

Replaces obsolete MI command: _sockets\_list_.

MI command to list all the currently used dynamic sockets.

MI FIFO Command Format:

		## reload sockets from the database
		opensips-mi sockets\_mgm:list
		opensips-cli -x mi sockets\_mgm:list
		

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

36

7

2229

586

2.

Norm Brandinger

4

2

5

5

  

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

Mar 2025 - Mar 2026

2.

Norm Brandinger

Jun 2025 - Jun 2025

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Norm Brandinger.

_Documentation Copyrights:_

Copyright � 2025 OpenSIPS Solutions;