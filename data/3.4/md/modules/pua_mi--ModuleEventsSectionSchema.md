# PUA MI

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp30762384)

2.2. [Most recently active contributors(1) to this module](#idp30860672)

**List of Examples**

1.1. [Set `presence_server` parameter](#idp29037184)

1.2. [`pua_publish` FIFO example](#idp25347088)

1.3. [`pua_subscribe` FIFO example](#idp30751344)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The pua\_mi offers the possibility to publish presence information and subscribe to presence information via MI transports.

Using this module you can create independent applications/scripts to publish not sip-related information (e.g., system resources like CPU-usage, memory, number of active subscribers ...). Also, this module allows non-SIP speaking applications to subscribe presence information kept in a SIP presence server.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _pua_
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _none_
    

## 1.3.�Exported Parameters

### 1.3.1.�`presence_server` (str)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example�1.1.�Set `presence_server` parameter**

...
modparam("pua\_mi", "presence\_server", "sip:pa@opensips.org:5075")
...
	

  

## 1.4.�Exported Functions

The module does not export functions to be used in configuration script.

## 1.5.�Exported MI functions

### 1.5.1.� `pua_publish`

Command parameters:

*   _presentity\_uri_ - e.g. sip:system@opensips.org
    
*   _expires_ - Relative expires time in seconds (e.g. 3600).
    
*   _event\_package_ - Event package that is target of published information (e.g. presence).
    
*   _content\_type_ (optional) - Content type of published information (e.g. application/pidf+xml). If this parameter is provided, the _body_ parameter is also required.
    
*   _etag_ (optional) - ETag that publish should match.
    
*   _extra\_headers_ (optional) - Extra headers added to PUBLISH request.
    
*   _body_ (optioanl) - The body of the publish request containing published information or missing if no published information. It has to be a single line for FIFO transport. If this parameter is provided, the _content\_type_ parameter is also required.
    

**Example�1.2.�`pua_publish` FIFO example**

...

opensips-cli -x mi pua\_publish sip:system@opensips.org 3600 presence application/pidf+xml <?xml version='1.0'?><presence xmlns='urn:ietf:params:xml:ns:pidf' xmlns:dm='urn:ietf:params:xml:ns:pidf:data-model' xmlns:rpid='urn:ietf:params:xml:ns:pidf:rpid' xmlns:c='urn:ietf:params:xml:ns:pidf:cipid' entity='system@opensips.org'><tuple id='0x81475a0'><status><basic>open</basic></status></tuple><dm:person id='pdd748945'><rpid:activities><rpid:away/>away</rpid:activities><dm:note>CPU:16 MEM:476</dm:note></dm:person></presence>

  

### 1.5.2.� `pua_subscribe`

Command parameters:

*   _presentity\_uri_ - e.g. sip:presentity@opensips.org
    
*   _watcher\_uri_ - e.g. sip:watcher@opensips.org
    
*   _event\_package_
    
*   _expires_ - Relative time in seconds for the desired validity of the subscription.
    

**Example�1.3.�`pua_subscribe` FIFO example**

...

opensips-cli -x mi pua\_subscribe sip:system@opensips.org sip:400@opensips.org presence 3600

  

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

31

15

1246

267

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

15

13

42

53

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

11

9

26

43

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

16

17

5.

Juha Heinanen ([@juha-h](https://github.com/juha-h))

11

7

160

73

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

11

4

293

226

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

9

7

32

29

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

3

1

13

2

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

3

3

10.

Konstantin Bokarius

3

1

2

5

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Julien Blache.

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

Feb 2023 - Feb 2023

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Nov 2020

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Sep 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2006 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Jan 2013

8.

Anca Vamanu

Nov 2006 - Aug 2010

9.

Juha Heinanen ([@juha-h](https://github.com/juha-h))

Apr 2007 - May 2008

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Feb 2007 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Julien Blache.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Anca Vamanu, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2006 Voice Sistem SRL