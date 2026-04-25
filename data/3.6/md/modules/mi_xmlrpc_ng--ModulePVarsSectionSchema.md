# mi\_xmlrpc\_ng Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5593216)

2.2. [Most recently active contributors(1) to this module](#idp5693552)

**List of Examples**

1.1. [Set `http_root` parameter](#idp209936)

1.2. [Set `trace_destination` parameter](#idp168432)

1.3. [Set `trace_destination` parameter](#idp5576848)

1.4. [XMLRPC request](#idp5583952)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements a xmlrpc server that handles xmlrpc requests and generates xmlrpc responses. When a xmlrpc message is received a default method is executed.

At first, it looks up the MI command. If found it parses the called procedure's parameters into a MI tree and the command is executed. A MI reply tree is returned that is formatted back in xmlrpc. The response is built in two ways - like a string that contains the MI tree nodes information (name, values and attributes) or like an array whose elements are consisted of each MI tree node stored information.

## 1.2.�Dependencies

### 1.2.1.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml2_
    

### 1.2.2.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _httpd_ module.
    

## 1.3.�Exported Parameters

### 1.3.1.�`http_root`(string)

Specifies the root path for xmlrpc requests: http://\[opensips\_IP\]:\[opensips\_httpd\_port\]/\[http\_root\]

_The default value is "RPC2"._

**Example�1.1.�Set `http_root` parameter**

...
modparam("mi\_xmlrpc\_ng", "http\_root", "opensips\_mi\_xmlrpc")
...

  

### 1.3.2.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. This is where traced mi messages will go.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.2.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "trace\_destination", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_xmlrpc\_ng", "trace\_destination", "hep\_dest")
...

  

### 1.3.3.�`trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. **trace\_destination** must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

Defining a blacklists means all the commands that are not blacklisted will be traced. Defining a whitelist means all the commands that are not whitelisted will not be traced. **WARNING:** One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep)**.

_Default value is none(not defined)._

**Example�1.3.�Set `trace_destination` parameter**

...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi\_xmlrpc\_ng", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_xmlrpc\_ng", "trace\_bwlist", "w: sip\_trace")
...

  

## 1.4.�Exported Functions

No function exported to be used from configuration file.

## 1.5.�Known issues

Commands with large responses (like ul\_dump) will fail if the configured size of the httpd buffer is to small (or if there isn't enough pkg memory configured).

Future realeases of the httpd and mi\_xmlrpc\_ng modules will address this issue.

## 1.6.�Example

This is an example showing the xmlrpc format for the “get\_statistics net: shmem:” MI commad: response.

**Example�1.4.�XMLRPC request**

POST /xmlrpc HTTP/1.0
Host: my.host.com
User-Agent: My xmlrpc UA
Content-Type: text/xml
Content-Length: 216

<?xml version='1.0'?>
<methodCall>
	<methodName>get\_statistics</methodName>
	<params>
		<param>
		<value>
		<struct>
		<member>
			<name>statistics</name>
			<value>
			<array>
			<data>
				<value><string>shmem:</string></value>
				<value><string>core:</string></value>
			</data>
			</array>
			</value>
		</member>
		</struct>
		</value>
		</param>
	</params>
</methodCall>


HTTP/1.0 200 OK
Content-Length: 236
Content-Type: text/xml; charset=utf-8
Date: Mon, 8 Mar 2013 12:00:00 GMT

<?xml version="1.0" encoding="UTF-8"?>.
<methodResponse>
<params><param>
<value><struct><member><name>net:waiting\_udp</name><value><string>0</string></value></member><member><name>net:waiting\_tcp</name><value><string>0</string></value></member><member><name>net:waiting\_tls</name><value><string>0</string></value></member><member><name>shmem:total\_size</name><value><string>268435456</string></value></member><member><name>shmem:used\_size</name><value><string>40032</string></value></member><member><name>shmem:real\_used\_size</name><value><string>277112</string></value></member><member><name>shmem:max\_used\_size</name><value><string>277112</string></value></member><member><name>shmem:free\_size</name><value><string>268158344</string></value></member><member><name>shmem:fragments</name><value><string>194</string></value></member></struct></value></param></params>
</methodResponse>.

  

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

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

29

15

1375

101

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

27

3

614

1041

3.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

15

9

383

68

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

49

33

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

12

46

55

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

12

9

126

55

7.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

11

3

515

166

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

3

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

3

2

0

6

10.

Ken Rice

3

1

1

1

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Zero King ([@l2dy](https://github.com/l2dy)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Ken Rice

Sep 2025 - Sep 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2014 - Mar 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Nov 2014 - Sep 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2014 - Apr 2019

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jan 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

May 2016 - Feb 2017

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Mar 2014 - Jan 2016

  

**All remaining contributors**: Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_Documentation Copyrights:_

Copyright � 2013 [VoIP Embedded, Inc.](http://www.voipembedded.com)