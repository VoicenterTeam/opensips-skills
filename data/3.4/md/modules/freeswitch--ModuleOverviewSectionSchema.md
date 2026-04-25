# freeswitch Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp4404896)

2.2. [Most recently active contributors(1) to this module](#idp5597616)

**List of Examples**

1.1. [Setting the `event_heartbeat_interval` parameter](#idp180496)

1.2. [Setting the `esl_connect_timeout` parameter](#idp185840)

1.3. [Setting the `esl_cmd_timeout` parameter](#idp100928)

1.4. [Setting the `esl_cmd_polling_itv` parameter](#idp106544)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _"freeswitch"_ module is a C driver for the FreeSWITCH Event Socket Layer interface. It can interact with one or more FreeSWITCH servers either by issuing commands to them, or by receiving events from them.

This driver can be seen as a centralized FreeSWITCH ESL connection manager. OpenSIPS modules may use its API in order to easily establish, reference and reuse ESL connections.

A FreeSWITCH ESL URL is of the form: **fs://\[username\]:password@host\[:port\]**. The default ESL port is 8021.

## 1.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

## 1.3.�Exported Parameters

### 1.3.1.�`event_heartbeat_interval` (integer)

The expected interval between FreeSWITCH HEARTBEAT event arrivals.

_Default value is “1” (second)._

**Example�1.1.�Setting the `event_heartbeat_interval` parameter**

...
modparam("freeswitch", "event\_heartbeat\_interval", 20)
...

  

### 1.3.2.�`esl_connect_timeout` (integer)

The maximally allowed duration for the establishment of an ESL connection.

_Default value is “5000” (milliseconds)._

**Example�1.2.�Setting the `esl_connect_timeout` parameter**

...
modparam("freeswitch", "esl\_connect\_timeout", 3000)
...

  

### 1.3.3.�`esl_cmd_timeout` (integer)

The maximally allowed duration for the execution of an ESL command. This interval does not include the connect duration.

_Default value is “5000” (milliseconds)._

**Example�1.3.�Setting the `esl_cmd_timeout` parameter**

...
modparam("freeswitch", "esl\_cmd\_timeout", 3000)
...

  

### 1.3.4.�`esl_cmd_polling_itv` (integer)

The sleep interval used when polling for an ESL command response. Since the value of this parameter imposes a minimal duration for any ESL command, you should run OpenSIPS in debug mode in order to first determine an expected response time for an arbitrary ESL command, then tune this parameter accordingly.

_Default value is “1000” (microseconds)._

**Example�1.4.�Setting the `esl_cmd_polling_itv` parameter**

...
modparam("freeswitch", "esl\_cmd\_polling\_itv", 3000)
...

  

## 1.4.�Exported Functions

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

110

51

4134

1528

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

10

30

21

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

3

21

41

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

5

3

8

5

5.

rance

3

2

3

0

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

8

8

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

2

2

  

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

Jan 2017 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2017 - Jul 2021

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2018 - Apr 2021

5.

rance

Oct 2020 - Mar 2021

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2017 [www.opensips-solutions.com](http://www.opensips-solutions.com/)