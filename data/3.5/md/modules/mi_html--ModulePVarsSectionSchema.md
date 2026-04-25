# mi\_html Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5589296)

2.2. [Most recently active contributors(1) to this module](#idp5688400)

**List of Examples**

1.1. [Set `root` parameter](#idp305504)

1.2. [Set `http_method` parameter](#idp166336)

1.3. [Set `trace_destination` parameter](#idp173808)

1.4. [Set `trace_destination` parameter](#idp5578336)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a minimal web user interface for the OpenSIPS's Management Interface.

Parameters for mi commands must be given in a json array format. For example, to get all statistics, the param is to be given as \[\["all"\]\]. To get only dialog and tm statistics, the param is to be given as \[\["dialog:","tm:"\]\].

## 1.2.�To-do

Features to be added in the future:

*   possibility to authenticate connections.
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _httpd_ module.
    

## 1.4.�Exported Parameters

### 1.4.1.�`root`(string)

Specifies the root path for the HTTP requests. The link to the mi web interface must be constructed using the following patern: http://\[opensips\_IP\]:\[opensips\_mi\_port\]/\[root\]

_The default value is "mi"._

**Example�1.1.�Set `root` parameter**

...
modparam("mi\_html", "root", "opensips\_mi")
...

  

### 1.4.2.�`http_method`(integer)

Specifies the HTTP request method to be used:

*   0 - use GET HTTP request
    
*   1 - use POST HTTP request
    

_The default value is 0._

**Example�1.2.�Set `http_method` parameter**

...
modparam("mi\_html", "http\_method", 1)
...

  

### 1.4.3.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. This is where traced mi messages will go.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.3.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "trace\_destination", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("mi\_html", "trace\_destination", "hep\_dest")
...

  

### 1.4.4.�`trace_bwlist` (string)

Filter traced mi commands based on a blacklist or a whitelist. **trace\_destination** must be defined for this parameter to have any purpose. Whitelists can be defined using 'w' or 'W', blacklists using 'b' or 'B'. The type is separate by the actual blacklist by ':'. The mi commands in the list must be separated by ','.

Defining a blacklists means all the commands that are not blacklisted will be traced. Defining a whitelist means all the commands that are not whitelisted will not be traced. **WARNING:** One can't define both a whitelist and a blacklist. Only one of them is allowed. Defining the parameter a second time will just overwrite the first one.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep)**.

_Default value is none(not defined)._

**Example�1.4.�Set `trace_destination` parameter**

...
## blacklist ps and which mi commands
## all the other commands shall be traced
modparam("mi\_html", "trace\_bwlist", "b: ps, which")
...
## allow only sip\_trace mi command
## all the other commands will not be traced
modparam("mi\_html", "trace\_bwlist", "w: sip\_trace")
...

  

## 1.5.�Exported Functions

No function exported to be used from configuration file.

## 1.6.�Known issues

Commands with large responses (like ul\_dump) will fail if the configured size of the httpd buffer is to small (or if there isn't enough pkg memory configured).

Future realeases of the httpd module will address this issue.

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

63

32

2249

697

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

14

3

167

493

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

10

8

31

44

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

10

8

27

18

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

8

6

109

44

6.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

8

5

217

10

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

3

4

8.

Zero King ([@l2dy](https://github.com/l2dy))

3

1

2

2

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

2

1

0

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2014 - Mar 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2015 - Jul 2020

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Oct 2011 - Mar 2020

5.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2011 - Apr 2019

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Jan 2017 - Feb 2017

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jan 2016 - Jan 2016

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)).

_Documentation Copyrights:_

Copyright � 2011-2013 [VoIP Embedded, Inc.](http://www.voipembedded.com)