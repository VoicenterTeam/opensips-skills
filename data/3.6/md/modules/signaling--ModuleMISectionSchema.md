# signaling Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp4404720)

2.2. [Most recently active contributors(1) to this module](#idp5620880)

**List of Examples**

1.1. [`sl_send_reply` usage](#idp170272)

1.2. [Usage of `$sig_local_totag` variable](#idp5531920)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The SIGNALING module comes as a wrapper over tm and sl modules and offers one function to be called by the modules that want to send a reply.

The logic behind the module is to first search if a transaction is created and if so, send a state full reply, using tm module, otherwise send a stateless reply with the function exported by sl. In this way, the script writer still has the call on how the transaction should be handled, state full or stateless and the reply is send accordingly to his choice.

For example, if you do a t\_newtran() in the script before doing save() (for registration), the function will automatically send the reply in stateful mode as a transaction is available. If no transaction is done, the reply will be sent in stateless way (as now).

By doing this, we have the possibility to have same module sending either stateful either stateless replies, by just controlling this from the script (if we create or not a transaction). So, the signalling will be more coherent as the replies will be sent according to the transaction presence (or not).

Moreover, this module offers the possibility of loading only one of the module, sl or tm, and send reply using only the module that is loaded. This is useful as not in all cases a user desires to send stateful or stateless replies and he should not be forced to load the module only because the send reply interface requires it.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

At least one of the following modules must be loaded before this module:

*   _sl_.
    
*   _tm_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

*   _None_.
    

## 1.4.�Exported Functions

### 1.4.1.� `send_reply(code, reason)`

For the current request, a reply is sent back having the given code and text reason. The reply is sent stateless or statefull depending on which module is loaded and if a transaction was created, as explained above.

Meaning of the parameters is as follows:

*   _code (int)_ - Return code.
    
*   _reason (string)_ - Reason phrase.
    

This function can be used from REQUEST\_ROUTE, ERROR\_ROUTE.

**Example�1.1.�`sl_send_reply` usage**

...
send\_reply(404, "Not found");
...
send\_reply($err.rcode, $err.rreason);
...
		

  

## 1.5.�Exported Variables

### 1.5.1.�$sig\_local\_totag

This variable returns the local To-tag that will be used by OpenSIPS for locally sending replies to the current SIP request. Yes, this variable should be used only in the context of a SIP request and it should be used only in conjunction with the using [send\_reply()](#func_send_reply "1.4.1.� send_reply(code, reason)").

Whenever you use it, be sure that the function is used in the same stateful / stateless SIP mode as the following replying function. Otherwise you may get different values for the To-tag!!

NOTE: the variable returns the To-Tag that will be used by OpenSIPS in the locally generated reply. This may be completly different from the To-tag in the replies received and forwarded by OpenSIPS.

**Example�1.2.�Usage of `$sig_local_totag` variable**

...
# stateful handling
t\_newtran();
xlog("the To-tag to be used is $sig\_local\_totag \\n");
send\_reply();  # or t\_reply();
...
# stateless handling
xlog("the To-tag to be used is $sig\_local\_totag \\n");
send\_reply(); # or sl\_send\_reply();
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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

10

28

37

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

12

9

131

23

3.

Anca Vamanu

9

3

524

2

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

7

5

6

4

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

11

10

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

3

23

76

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

8.

zhangst

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Nov 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Dec 2020

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Nov 2008 - May 2020

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

zhangst

Jul 2014 - Jul 2014

8.

Anca Vamanu

Nov 2008 - Mar 2010

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), zhangst, Anca Vamanu.

_Documentation Copyrights:_

Copyright � 2008 FhG FOKUS