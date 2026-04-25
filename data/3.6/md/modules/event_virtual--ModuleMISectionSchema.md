# event\_virtual Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp164464)

2.2. [Most recently active contributors(1) to this module](#idp5614528)

**List of Examples**

1.1. [Setting the `failover_timeout` parameter](#idp4405696)

1.2. [Virtual socket](#idp4410416)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _event\_virtual_ module provides the possibility to have multiple external applications, using different transport protocols, subscribed to the OpenSIPS Event Interface as a single virtual subscriber, for a specific event. When an event is triggered, the event\_virtual module notifies the specified transport modules using one of the following policies:

*   _PARALLEL_ - all subscribers (applications) are notified at once
    
*   _FAILOVER_ - for every event raised, try to notify the subscribers, in the order in which they are given, until the first successful notification. A failed subscriber is skipped for further notifications until the [failover\_timeout](#param_failover_timeout "1.5.1.�failover_timeout (integer)") passes.
    
*   _ROUND-ROBIN_ - for every event raised, notify the subscribers alternatively, in the order in which they are given (for each raised event notify a different subscriber)
    

Only one expire value can be used (for the whole virtual subscription), and not one for each individual subscriber.

## 1.2.�Virtual socket syntax

_virtual:policy subscriber\_1 \[\[subscriber\_2\] ...\]_

Meanings:

*   _virtual:_ - informs the Event Interface that the events sent to this subscriber should be handled by the _event\_virtual_ module
    
*   _policy_ - subscriber notification policy, can have one of the following values: 'PARALLEL', 'FAILOVER', 'ROUND-ROBIN' (with the behaviour described above)
    
    *   _!! Important: Policies must always be specified as uppercase strings!_
        
    
*   _subscriber\_1_ - use the socket syntax for this specific subscriber (eg. "rabbitmq:guest:guest@127.0.0.1:5672/pike")
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

_The OpenSIPS event modules which implement the transport protocols used by the subscribers_.

## 1.4.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.5.�Exported Parameters

### 1.5.1.�`failover_timeout` (integer)

The minimum duration in seconds that a failed subscriber is skipped for further notifications. This parameter only affects the _FAILOVER_ policy.

_Default value is “30”._

**Example�1.1.�Setting the `failover_timeout` parameter**

...
modparam("event\_virtual", "failover\_timeout", 5)
...
	

  

## 1.6.�Exported Functions

No exported functions to be used in the configuration file.

## 1.7.�Example

**Example�1.2.�Virtual socket**

The sockets of the subscribers may be separated by any number of spaces or tabs:

	virtual:PARALLEL rabbitmq:guest:guest@127.0.0.1:5672/pike flatstore:/var/log/opensips\_proxy.log

  

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

22

10

1057

125

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

8

6

39

36

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

6

4

4

2

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

3

1

3

2

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

May 2016 - Dec 2021

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jul 2015 - Jul 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2019 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)