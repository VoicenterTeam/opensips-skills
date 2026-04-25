# PUA Usrloc

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp117184)

2.2. [Most recently active contributors(1) to this module](#idp5629920)

**List of Examples**

1.1. [Set `default_domain` parameter](#idp270176)

1.2. [Set `presentity_prefix` parameter](#idp260192)

1.3. [Set `presence_server` parameter](#idp175264)

1.4. [`pua_set_publish` usage](#idp181616)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The pua\_usrloc is the connector between usrloc and pua modules. It creates the environment to send PUBLISH requests for user location records, on specific events (e.g., when new record is added in usrloc, a PUBLISH with status open (online) is issued; when expires, it sends closed (offline)).

Using this module, phones which have no support for presence can be seen as online/offline.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _usrloc_.
    
*   _pua_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`default_domain` (str)

The default domain to use when constructing the presentity uri if it is missing from recorded aor.

_Default value is “NULL”._

**Example�1.1.�Set `default_domain` parameter**

...
modparam("pua\_usrloc", "default\_domain", "opensips.org")
...

  

### 1.3.2.�`entity_prefix` (str)

The prefix when construstructing entity attribute to be added to presence node in xml pidf. (ex: pres:user@domain ).

_Default value is “NULL”._

**Example�1.2.�Set `presentity_prefix` parameter**

...
modparam("pua\_usrloc", "entity\_prefix", "pres")
...

  

### 1.3.3.�`presence_server` (str)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example�1.3.�Set `presence_server` parameter**

...
modparam("pua\_usrloc", "presence\_server", "sip:pa@opensips.org:5075")
...
	

  

## 1.4.�Exported Functions

### 1.4.1.� `pua_set_publish()`

The function is used to mark REGISTER requests that have to issue a PUBLISH. The PUBLISH is issued when REGISTER is saved in location table.

**Example�1.4.�`pua_set_publish` usage**

...
if(is\_method("REGISTER") && $fu=~"john@opensips.org") 
	pua\_set\_publish();
...

  

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

Anca Vamanu

35

17

1245

365

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

16

14

54

57

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

15

13

46

60

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

13

11

14

22

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

10

8

25

19

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

3

14

7

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

4

2

14

2

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

5

4

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

4

4

10.

Konstantin Bokarius

3

1

2

5

  

**All remaining contributors**: Elena-Ramona Modroiu, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Ken Rice, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Edson Gellert Schubert, Julien Blache.

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

Mar 2014 - May 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Jan 2023

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2007 - Apr 2019

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Mar 2014

9.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2010 - Apr 2010

10.

Anca Vamanu

Nov 2006 - Oct 2009

  

**All remaining contributors**: Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Julien Blache, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Anca Vamanu, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2006 Voice Sistem SRL