# mi\_http Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5578928)

2.2. [Most recently active contributors(1) to this module](#idp5678208)

**List of Examples**

1.1. [Set `root` parameter](#idp3869648)

1.2. [Set `trace_destination` parameter](#idp248192)

1.3. [Set `trace_destination` parameter](#idp169104)

1.4. [JSON-RPC request](#idp5568160)

1.5. [JSON-RPC request with params](#idp5571632)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a HTTP transport layer implementation for OpenSIPS's Management Interface.

## 1.2.�Dependencies

### 1.2.1.�External Libraries or Applications

None

### 1.2.2.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _httpd_ module.
    

## 1.3.�Exported Parameters

### 1.3.1.�`root`(string)

Specifies the root path for HTTP requests: http://\[opensips\_IP\]:\[opensips\_httpd\_port\]/\[root\]

_The default value is "mi"._

**Example�1.1.�Set `root` parameter**

...
modparam("mi\_http", "root", "opensips\_mi")
...

  

### 1.3.2.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. This is where traced mi messages will go.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.2.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "trace\_destination", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_http", "trace\_destination", "hep\_dest")
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
modparam("mi\_http", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_http", "trace\_bwlist", "w: sip\_trace")
...

  

## 1.4.�Exported Functions

No function exported to be used from configuration file.

## 1.5.�Known issues

Commands with large responses (like ul\_dump) will fail if the configured size of the httpd buffer is to small (or if there isn't enough pkg memory configured).

Future realeases of the httpd module will address this issue.

## 1.6.�Examples

This is an example showing the JSON-RPC request and reply over HTTP for the “ps” MI command.

**Example�1.4.�JSON-RPC request**

POST /mi HTTP/1.1
Accept: application/json
Content-Type: application/json
Host: example.net

{"jsonrpc":"2.0","method":"ps","id":10}

HTTP/1.1 200 OK
Content-Length: 317
Content-Type: application/json
Date: Fri, 01 Nov 2013 12:00:00 GMT

{"jsonrpc":"2.0","result":{"Processes":\[{"ID":0,"PID":9467,"Type":"attendant"},{"ID":1,"PID":9468,"Type":"HTTPD127.0.0.1:8008"},{"ID":3,"PID":9470,"Type":"time\_keeper"},{"ID":4,"PID":9471,"Type":"timer"},{"ID":5,"PID":9472,"Type":"SIPreceiverudp:127.0.0.1:5060"},{"ID":7,"PID":9483,"Type":"Timerhandler"},\]},"id":10}

  

This is an example showing the JSON-RPC request with params and reply over HTTP for the “get\_statistics” MI command.

**Example�1.5.�JSON-RPC request with params**

POST /mi HTTP/1.1
Accept: application/json
Content-Type: application/json
Host: example.net

{"jsonrpc":"2.0","method":"get\_statistics","params":\[\["dialog:","tm:"\]\],"id":10}

HTTP/1.1 200 OK
Content-Length: 317
Content-Type: application/json
Date: Fri, 01 Nov 2013 12:00:00 GMT

{"jsonrpc":"2.0","result":{"dialog:active\_dialogs":0,"dialog:early\_dialogs":0,"dialog:processed\_dialogs":2,"dialog:expired\_dialogs":0,"dialog:failed\_dialogs":2,"dialog:create\_sent":0,"dialog:update\_sent":0,"dialog:delete\_sent":0,"dialog:create\_recv":0,"dialog:update\_recv":0,"dialog:delete\_recv":0,"tm:received\_replies":49252,"tm:relayed\_replies":49220,"tm:local\_replies":370,"tm:UAS\_transactions":49584,"tm:UAC\_transactions":0,"tm:2xx\_transactions":12004,"tm:3xx\_transactions":0,"tm:4xx\_transactions":37580,"tm:5xx\_transactions":0,"tm:6xx\_transactions":0,"tm:inuse\_transactions":60},"id":10}

  

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

Stephane Alnet

20

5

1265

233

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

19

3

170

814

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

15

12

171

34

4.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

14

10

273

52

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

10

8

32

39

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

8

6

102

36

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

5

3

8

3

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

3

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

10.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

2

1

24

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2014 - Mar 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2020 - Mar 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Dec 2013 - Sep 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2014 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

May 2016 - Feb 2017

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Nov 2013 - Jan 2016

10.

Stephane Alnet

Oct 2013 - Nov 2013

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Stephane Alnet.

_Documentation Copyrights:_

Copyright � 2013 [shimaore.net](http://shimaore.net)