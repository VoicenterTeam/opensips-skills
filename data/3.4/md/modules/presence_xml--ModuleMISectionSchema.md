# Presence\_XML Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5549552)

3.2. [Most recently active contributors(1) to this module](#idp5650096)

**List of Examples**

1.1. [Set `force_active` parameter](#idp165136)

1.2. [Set `pidf_manipulation` parameter](#idp170832)

1.3. [Set `xcap_server` parameter](#idp5514128)

1.4. [Set `pres_rules_auid` parameter](#idp5518128)

1.5. [Set `pres_rules_filename` parameter](#idp5522080)

1.6. [Set `generate_offline_body` parameter](#idp5526016)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module does specific handling for notify-subscribe events using xml bodies. It is used with the general event handling module, presence. It constructs and adds 3 events to it: presence, presence.winfo, dialog;sla.

This module takes the xcap permission rule documents from xcap\_table. The presence permission rules are interpreted according to the specifications in RFC 4745 and RFC 5025.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database module_.
    
*   _presence_.
    
*   _signaling_.
    
*   _xcap_.
    
*   _xcap\_client_.
    
    Only compulsory if not using an integrated xcap server (if 'integrated\_xcap\_server' parameter is not set).
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml-dev_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`force_active` (int)

This parameter is used for permissions when handling Subscribe messages. If set to 1, subscription state is considered active and the presentity is not queried for permissions(should be set to 1 if not using an xcap server). Otherwise,the xcap server is queried and the subscription states is according to user defined permission rules. If no rules are defined for a certain watcher, the subscriptions remains in pending state and the Notify sent will have no body.

Note: When switching from one value to another, the watchers table must be emptied.

_Default value is “0”._

**Example�1.1.�Set `force_active` parameter**

...
modparam("presence\_xml", "force\_active", 1)
...

  

### 1.3.2.�`pidf_manipulation` (int)

Setting this parameter to 1 enables the features described in RFC 4827. It gives the possibility to have a permanent state notified to the users even in the case in which the phone is not online. The presence document is taken from the xcap server and aggregated together with the other presence information, if any exist, for each Notify that is sent to the watchers. It is also possible to have information notified even if not issuing any Publish (useful for services such as email, SMS, MMS).

_Default value is “0”._

**Example�1.2.�Set `pidf_manipulation` parameter**

...
modparam("presence\_xml", "pidf\_manipulation", 1)
...

  

### 1.3.3.�`xcap_server` (str)

The address of the xcap servers used for storage. This parameter is compulsory if the integrated\_xcap\_server parameter is not set. It can be set more that once, to construct an address list of trusted XCAP servers.

**Example�1.3.�Set `xcap_server` parameter**

...
modparam("presence\_xml", "xcap\_server", "xcap\_server.example.org")
modparam("presence\_xml", "xcap\_server", "xcap\_server.ag.org")
...

  

### 1.3.4.�`pres_rules_auid` (str)

This parameter should be configured if you are using the non integrated xcap mode and you need to use another pres-rules auid than the default 'pres-rules'.

**Example�1.4.�Set `pres_rules_auid` parameter**

...
modparam("presence\_xml", "pres\_rules\_auid", "org.openmobilealliance.pres-rules")
...

  

### 1.3.5.�`pres_rules_filename` (str)

This parameter should be configured if you are using the non integrated xcap mode and you need to configure another filename than the default 'index'.

**Example�1.5.�Set `pres_rules_filename` parameter**

...
modparam("presence\_xml", "pres\_rules\_filename", "pres-rules")
...

  

### 1.3.6.�`generate_offline_body` (str)

This parameter should be set to 0 if you want to prevent OpenSIPS from automatically generating a PIDF body when a publication expires or is explicitly terminated (a PUBLISH request is received with Expires: 0).

**Example�1.6.�Set `generate_offline_body` parameter**

...
modparam("presence\_xml", "generate\_offline\_body", 0)
...

  

## 1.4.�Exported Functions

None to be used in configuration file.

## 1.5.�Installation

The module requires 1 table in OpenSIPS database: xcap. The SQL syntax to create it can be found in presence-create.sql script in the database directories in the opensips/scripts folder. You can also find the complete database documentation on the project webpage, https://opensips.org/docs/db/db-schema-devel.html.

## Chapter�2.�Developer Guide

The module exports no function to be used in other OpenSIPS modules.

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

Anca Vamanu

122

54

4745

1776

2.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

30

9

1499

471

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

28

24

80

130

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

15

13

40

32

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

11

45

71

6.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

8

6

15

14

7.

Henning Westerholt ([@henningw](https://github.com/henningw))

6

4

45

50

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

4

4

9.

Dan Pascu ([@danpascu](https://github.com/danpascu))

4

2

3

3

10.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

3

2

6

0

  

**All remaining contributors**: Kennard White, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Konstantin Bokarius, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), UnixDev, Zero King ([@l2dy](https://github.com/l2dy)), Edson Gellert Schubert, Denis Bilenko, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Nov 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Jul 2020

5.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

6.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Oct 2007 - Nov 2018

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

9.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

May 2012 - Mar 2013

10.

Anca Vamanu

Apr 2007 - Jun 2012

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Kennard White, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), UnixDev, Denis Bilenko, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Anca Vamanu, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Dan Pascu ([@danpascu](https://github.com/danpascu)).

_Documentation Copyrights:_

Copyright � 2007 Voice Sistem SRL