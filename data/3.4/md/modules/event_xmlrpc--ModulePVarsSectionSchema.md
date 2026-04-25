# event\_xmlrpc Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp4408032)

2.2. [Most recently active contributors(1) to this module](#idp5604592)

**List of Examples**

1.1. [Set `use_struct_param` parameter](#idp163760)

1.2. [E\_PIKE\_BLOCKED event](#idp169072)

1.3. [XMLRPC socket](#idp170608)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is an implementation of an XMLRPC client used to notify XMLRPC servers whenever certain notifications are raised by OpenSIPS. It acts as a transport layer for the Event Notification Interface.

Basicly, the module executes a remote procedure call when an event is raised from OpenSIPS's script, core or modules using the Event Interface.

In order to be notified, an XMLRPC server has to subscribe for a certain event provided by OpenSIPS. This can be done using the generic MI Interface (_event\_subscribe_ function) or from OpenSIPS script (_subscribe\_event_ core function).

## 1.2.�XMLRPC socket syntax

_'xmlrpc:' host ':' port ':' method_

Meanings:

*   _'xmlrpc:'_ - informs the Event Interface that the events sent to this subscriber should be handled by the _event\_xmlrpc_ module.
    
*   _host_ - host name of the XMLRPC server.
    
*   _port_ - port of the XMLRPC server.
    
*   _method_ - method called remotely by the XMLRPC client.
    
    NOTE: the client does not wait for a response from the XMLRPC server.
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _none_.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.4.�Exported Parameters

### 1.4.1.�`use_struct_param` (integer)

When raising an event, pack the name and value of the parameters in a XMLRPC structure. This provides an easier way for some XMLRPC server implementations to interpret the parameters. Set it to zero to disable or to non-zero to enable it.

_Default value is “0 (disabled)”._

**Example�1.1.�Set `use_struct_param` parameter**

...
modparam("event\_xmlrpc", "use\_struct\_param", 1)
...

  

## 1.5.�Exported Functions

No function exported to be used from configuration file.

## 1.6.�Example

This is an example of an event raised by the pike module when it decides an ip should be blocked:

**Example�1.2.�E\_PIKE\_BLOCKED event**

POST /RPC2 HTTP/1.1.
Host: 127.0.0.1:8081.
Connection: close.
User-Agent: OpenSIPS XMLRPC Notifier.
Content-type: text/xml.
Content-length: 240.
		.
<?xml version="1.0"?>
<methodCall>
	<methodName>e\_dummy\_h</methodName>
	<params>
		<param>
			<value><string>E\_MY\_EVENT</string></value>
		</param>
		<param>
			<name>ip</name>
			<value><string>192.168.2.11</string></value>
		</param>
	</params>
</methodCall>

  

**Example�1.3.�XMLRPC socket**

	# calls the 'block\_ip' function
	xmlrpc:127.0.0.1:8080:block\_ip

  

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

37

23

1239

131

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

10

6

208

65

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

9

7

63

31

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

8

9

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

4

4

6.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

3

1

103

28

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

8.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

2

1

8

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jul 2015 - Jun 2023

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2017 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2012 - Jan 2020

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Oct 2013 - Nov 2018

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Jan 2016 - Jan 2016

8.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

Jan 2013 - Jan 2013

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2012 [www.opensips-solutions.com](http://www.opensips-solutions.com/)