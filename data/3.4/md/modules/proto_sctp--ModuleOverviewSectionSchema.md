# proto\_sctp Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp254640)

3.2. [Most recently active contributors(1) to this module](#idp5643456)

**List of Examples**

1.1. [Set `sctp_port` parameter](#idp176848)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The **proto\_sctp** module is an optional transport module (shared library) which exports the required logic in order to handle SCTP-based communication. (socket initialization and send/recv primitives to be used by higher-level network layers)

Once loaded, you will be able to define _"sctp:"_ listeners in your script.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _None_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`sctp_port` (integer)

The default port to be used for all SCTP related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the SCTP listeners) and the SIP sending part (if the destination SCTP URI has no explicit port).

If you want to change only the listening port for STP, use the port option in the SIP listener defintion.

_Default value is 5060._

**Example�1.1.�Set `sctp_port` parameter**

...
modparam("proto\_sctp", "sctp\_port", 5070)
...

  

## Chapter�2.�Frequently Asked Questions

**2.1.**

After switching to OpenSIPS 2.1, I'm getting this error: "listeners found for protocol sctp, but no module can handle it"

You need to load the "proto\_sctp" module. In your script, make sure you do a **loadmodule "proto\_sctp.so"** after setting the **[mpath](https://opensips.org/Documentation/Script-CoreParameters-2-1#toc74)**.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

11

5

448

73

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

10

8

11

18

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

7

4

153

25

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

2

2

5.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

3

1

1

1

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

7.

Zero King ([@l2dy](https://github.com/l2dy))

3

1

1

1

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

2

1

1

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2015 - Apr 2021

3.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2015 - Jun 2018

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Feb 2016 - Feb 2016

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Zero King ([@l2dy](https://github.com/l2dy)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)