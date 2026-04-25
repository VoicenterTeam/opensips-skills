# sl Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5599968)

2.2. [Most recently active contributors(1) to this module](#idp5700960)

**List of Examples**

1.1. [enable\_stats example](#idp254528)

1.2. [`sl_send_reply` usage](#idp166784)

1.3. [`sl_reply_error` usage](#idp171792)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The SL module allows OpenSIPS to act as a stateless UA server and generate replies to SIP requests without keeping state. That is beneficial in many scenarios, in which you wish not to burden server's memory and scale well.

The SL module needs to filter ACKs sent after a local stateless reply to an INVITE was generated. To recognize such ACKs, OpenSIPS adds a special "signature" in to-tags. This signature is sought for in incoming ACKs, and if included, the ACKs are absorbed.

To speed up the filtering process, the module uses a timeout mechanism. When a reply is sent, a timer is set. As time as the timeout didn't hit, the incoming ACK requests will be checked using TO tag value. Once the timer expires, all the ACK are let through - a long time passed till it sent a reply, so it does not expect any ACK that have to be blocked.

The ACK filtering may fail in some rare cases. If you think these matter to you, better use stateful processing (tm module) for INVITE processing. Particularly, the problem happens when a UA sends an INVITE which already has a to-tag in it (e.g., a re-INVITE) and OpenSIPS want to reply to it. Than, it will keep the current to-tag, which will be mirrored in ACK. OpenSIPS will not see its signature and forward the ACK downstream. Caused harm is not bad--just a useless ACK is forwarded.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`enable_stats` (integer)

If the module should generate and export statistics to the core manager. A zero value means disabled.

SL module provides statistics about how many replies were sent ( splitted per code classes) and how many local ACKs were filtered out.

Default value is 1 (enabled).

**Example�1.1.�enable\_stats example**

modparam("sl", "enable\_stats", 0)

  

## 1.4.�Exported Functions

### 1.4.1.� `sl_send_reply(code, reason)`

For the current request, a reply is sent back having the given code and text reason. The reply is sent stateless, totally independent of the Transaction module and with no retransmission for the INVITE's replies. 'code' and 'reason' can contain pseudo-variables that are replaced at runtime.

Meaning of the parameters is as follows:

*   _code (int)_ - Return code.
    
*   _reason (string)_ - Reason phrase.
    

This function can be used from REQUEST\_ROUTE, ERROR\_ROUTE.

**Example�1.2.�`sl_send_reply` usage**

...
sl\_send\_reply(404, "Not found");
...
sl\_send\_reply($err.rcode, $err.rreason);
...

  

### 1.4.2.� `sl_reply_error()`

Sends back an error reply describing the nature of the last internal error. Usually this function should be used after a script function that returned an error code.

This function can be used from REQUEST\_ROUTE.

**Example�1.3.�`sl_reply_error` usage**

...
sl\_reply\_error();
...

  

## 1.5.�Exported Statistics

### 1.5.1.�`1xx_replies`

The number of 1xx\_replies.

### 1.5.2.�`2xx_replies`

The number of 2xx\_replies.

### 1.5.3.�`3xx_replies`

The number of 3xx\_replies.

### 1.5.4.�`4xx_replies`

The number of 4xx\_replies.

### 1.5.5.�`5xx_replies`

The number of 5xx\_replies.

### 1.5.6.�`6xx_replies`

The number of 6xx\_replies.

### 1.5.7.�`sent_replies`

The number of sent\_replies.

### 1.5.8.�`sent_err_replies`

The number of sent\_err\_replies.

### 1.5.9.�`received_ACKs`

The number of received\_ACKs.

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

74

54

876

711

2.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

42

32

665

232

3.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

22

16

295

172

4.

Andrei Pelinescu-Onciul

16

14

50

50

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

10

28

62

6.

Jan Janak ([@janakj](https://github.com/janakj))

12

8

355

21

7.

Henning Westerholt ([@henningw](https://github.com/henningw))

7

5

12

12

8.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

7

5

12

11

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

4

30

83

10.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

8

9

  

**All remaining contributors**: Elena-Ramona Modroiu, Jeffrey Magder, Andreas Heise, Konstantin Bokarius, Anca Vamanu, Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

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

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Feb 2023

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2002 - Nov 2019

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Sep 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Nov 2014 - Nov 2014

8.

Anca Vamanu

Nov 2010 - Nov 2010

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

Aug 2007 - Jun 2008

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Apr 2006 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Andreas Heise, Elena-Ramona Modroiu, Jeffrey Magder, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS