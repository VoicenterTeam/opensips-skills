# QOS Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5531200)

3.2. [Most recently active contributors(1) to this module](#idp5639984)

**List of Examples**

1.1. [Set `qos_flag` parameter](#idp162528)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The qos module provides a way to keep track of per dialog SDP session(s).

## 1.2.�How it works

The qos module uses the dialog module to be notified of any new or updated dialogs. It will then look for and extract the SDP session (if present) from SIP requests and replies and keep track of it for the entire life of a dialog.

All of this happens with a properly configured dialog and qos module and setting the dialog flag and the qos flag at the time any INVITE sip message is seen. There is no config script function call required to set the SDP session tracking mechanism. See the dialog module users guide for more information.

A dialog can have one or more SDP sessions active in one of the following states:

*   _pending_ - only one end point of the SDP session is known.
    
*   _negotiated_ - both end points of the SDP session are known.
    

An SDP session can be established in one of the following scenarios:

*   _INVITE/200ok_ - typical "INVITE" and "200 OK" SDP exchange.
    
*   _200ok/ACK_ - "200 OK" and "ACK" SDP exchange (for calls starting with an empty INVITE).
    
*   _183/PRACK_ - early media via "183 Session Progress" and "PRACK" (see rfc3959 for more information) - not implemented yet.
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _dialog_ - dialog module and its decencies (tm).
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`qos_flag` (string)

Keeping with OpenSIPS, the module will not do anything to any message unless instructed to do so via the config script. You must set the qos\_flag value in the setflag() call of the INVITE you want the qos module to process. But before you can do that, you need to tell the qos module which flag value you are assigning to qos.

In most cases when ever you create a new dialog via create\_dialog() function,you will want to set the qos flag. If create\_dialog() is not called and the qos flag is set, it will not have any effect.

This parameter must be set of the module will not load.

_Default value is “Not set!”._

**Example�1.1.�Set `qos_flag` parameter**

...
modparam("qos", "qos\_flag", "QOS\_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(QOS\_FLAG); # Set the qos flag
	create\_dialog(); # create the dialog
  }
  ...
}

  

## 1.5.�Exported Functions

There are no exported functions that could be used in scripts.

## 1.6.�Exported Statistics

There are no exported statistics for the qos module.

## 1.7.�Exported MI Functions

There are no exported MI functions for the qos module. Check the dialog MI functions for a way to inspect the internals of a dialog.

## 1.8.�Exported Pseudo-Variables

There are no exported pseudo-variables for the qos module.

## 1.9.�Installation and Running

Just load the module and remember to set the flag.

## Chapter�2.�Developer Guide

## 2.1.�Available Functions

### 2.1.1.� `register_qoscb (qos, type, cb, param)`

Register a new callback to the qos.

Meaning of the parameters is as follows:

*   _struct qos\_ctx\_st\* qos_ - qos to register callback to. If maybe NULL only for QOSCB\_CREATED callback type, which is not a per qos type.
    
*   _int type_ - types of callbacks; more types may be register for the same callback function; only QOSCB\_CREATED must be register alone. Possible types:
    
    *   _QOSCB\_CREATED_ - called when a new qos context is created - it's a global type (not associated to any qos).
        
    *   _QOSCB\_ADD\_SDP_ - called when a new SDP was added to the qos context - it's a per qos type.
        
    *   _QOSCB\_UPDATE\_SDP_ - called when an existing SDP is updated - it's a per qos type.
        
    *   _QOSCB\_REMOVE\_SDP_ - called when an existing SDP is removed - it's a per qos type.
        
    *   _QOSCB\_TERMINATED_ - called when the qos is terminated.
        
    
*   _qos\_cb cb_ - callback function to be called. Prototype is: “void (qos\_cb) (struct qos\_ctx\_st \*qos, int type, struct qos\_cb\_params \*params); ”
    
*   _void \*param_ - parameter to be passed to the callback function.
    

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

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

23

3

2152

13

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

16

13

41

72

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

10

8

25

16

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

19

19

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

5

99

96

6.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

3

1

5

6

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

3

3

8.

Ezequiel Lovelle ([@lovelle](https://github.com/lovelle))

3

1

1

1

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2013 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2011 - Jul 2020

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2009 - May 2020

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Ezequiel Lovelle ([@lovelle](https://github.com/lovelle))

Oct 2014 - Oct 2014

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Dec 2008 - May 2012

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2011 - Jun 2011

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_Documentation Copyrights:_

Copyright � 2008 SOMA Networks, Inc.