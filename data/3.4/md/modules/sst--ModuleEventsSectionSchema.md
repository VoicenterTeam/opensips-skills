# SST Module (SIP Session Timer)

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5622320)

2.2. [Most recently active contributors(1) to this module](#idp5726400)

**List of Examples**

1.1. [Session timer call flow](#idp4086096)

1.2. [Set `enable_stats` parameter](#idp166464)

1.3. [Set `min_se` parameter](#idp172496)

1.4. [Set `sst_interval` parameter](#idp5572176)

1.5. [Set `reject_to_small` parameter](#idp5577936)

1.6. [Set `sst_flag` parameter](#idp252688)

1.7. [`sstCheckMin` usage](#idp5601040)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The sst module provides a way to update the dialog expire timer based on the SIP INVITE/200 OK Session-Expires header value. You can use the sst module in an OpenSIPS proxy to allow freeing of local resources of dead (expired) calls.

You can also use the sst module to validate the MIN\_SE header value and reply to any request with a "422 - Session Timer Too Small" if the value is too small for your OpenSIPS configuration.

## 1.2.�How it works

The sst module uses the dialog module to be notified of any new or updated dialogs. It will then look for and extract the session-expire: header value (if there is one) and override the dialog expire timer value for the current context dialog.

You flag any call setup INVITE that you want to cause a timed session to be established. This will cause OpenSIPS to request the use of session times if the UAC does not request it.

All of this happens with a properly configured dialog and sst module and setting the dialog flag and the sst flag at the time any INVITE sip message is seen. There is no opensips.cfg script function call required to set the dialog expire timeout value. See the dialog module users guide for more information.

The sstCheckMin() script function can be used to varify the Session-expires / MIN-SE header field values are not too small for a proxy. If the SST min\_se parameter value is smaller then the messages Session-Expires / MIN-SE values, the test will return true. You can also configure the function to send the 422 response for you.

The following was taken from the RFC as a call flow example:

**Example�1.1.�Session timer call flow**

+-------+    +-------+       +-------+
| UAC-1 |    | PROXY |       | UAC-2 |
+-------+    +-------+       +-------+
    |(1) INVITE  |               |
    |SE: 50      |               |
    |----------->|               |
    |            |(2)sstCheckMin |
    |            |-----+         |
    |            |     |         |
    |            |<----+         |
    |(3) 422     |               |
    |MSE:1800    |               |
    |<-----------|               |
    |            |               |
    |(4)ACK      |               |
    |----------->|               |
    |            |               |
    |(5) INVITE  |               |
    |SE: 1800    |               |
    |MSE: 1800   |               |
    |----------->|               |
    |            |(6)sstCheckMin |
    |            |-----+         |
    |            |     |         |
    |            |<----+         |
    |            |(7)setflag     |
    |            |create dialog  |
    |            |Set expire     |
    |            |-----+         |
    |            |     |         |
    |            |<----+         |
    |            |               |
    |            |(8)INVITE      |
    |            |SE: 1800       |
    |            |MSE: 1800      |
    |            |-------------->|
    |            |               |
 ...
     			

  

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _dialog_ - dialog module and its decencies. (tm)
    
*   _sl_ - stateless module.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`enable_stats` (integer)

If the statistics support should be enabled or not. Via statistic variables, the module provide information about the dialog processing. Set it to zero to disable or to non-zero to enable it.

_Default value is “1” (enabled)._

**Example�1.2.�Set `enable_stats` parameter**

...
modparam("sst", "enable\_stats", 0)
...

  

### 1.4.2.�`min_se` (integer)

The value is used to set the proxies MIN-SE value and is used in the 422 reply as the proxies MIN-SE: header value if the sstCheckMin() flag is set to true and the check fails.

If not set and sstCheckMin() is called with the send-reply flag set to true, the default 1800 seconds will be used as the compare and the MIN-SE: header value if the 422 reply is sent.

_Default value is “1800” seconds._

**Example�1.3.�Set `min_se` parameter**

...
modparam("sst", "min\_se", 2400)
...

  

### 1.4.3.�`sst_interval` (integer)

The sst minimum interval in Session-Expires header if OpenSIPS request the use of session times. The used value will be the maximum value between OpenSIPS minSE, UAS minSE and this value.

Per default the interval used will be the min\_se value

_Default value is “0” seconds._

**Example�1.4.�Set `sst_interval` parameter**

...
modparam("sst", "sst\_interval", 2400)
...

  

### 1.4.4.�`reject_to_small` (integer)

In the initial INVITE if the UAC has requested a Session-Expire: and it's value is smaller then our local policies Min-SE (see min\_se above), then the PROXY has the right to reject the call by replying to the message with a 422 Session Timer Too Small and state our local Min-SE: value. The INVITE is NOT forwarded on through the PROXY.

This flag if true will tell the SST module to reject the INVITE with a 422 response. If false, the INVITE is forwarded through the PROXY with out any modifications.

_Default value is “1” (true/on)._

**Example�1.5.�Set `reject_to_small` parameter**

...
modparam("sst", "reject\_to\_small", 0)
...

  

### 1.4.5.�`sst_flag` (string)

Keeping with OpenSIPS, the module will not do anything to any message unless instructed to do so via the opensips.cfg script. You must set the sst\_flag value in the setflag() call of the INVITE you want the sst module to process. But before you can do that, you need to tell the sst module which flag value you are assigning to sst.

In most cases when ever you create a new dialog via create\_dialog() function,you will want to set the sst flag. If create\_dialog() is not called and the sst flag is set, it will not have any effect.

This parameter must be set of the module will not load.

_Default value is “Not set!”._

**Example�1.6.�Set `sst_flag` parameter**

...
modparam("sst", "sst\_flag", "SST\_FLAG")
...
route {
  ...
  if ($rm=="INVITE") {
    setflag(SST\_FLAG); # Set the sst flag
    create\_dialog(); # and then create the dialog
  }
  ...
}

  

## 1.5.�Exported Functions

### 1.5.1.� `sstCheckMin(send_reply_flag)`

Check the current Session-Expires / MIN-SE values against the sst\_min\_se parameter value. If the Session-Expires or MIN\_SE header value is less then modules minimum value, this function will return true.

If the fuction is called with the send\_reply\_flag set to true (1) and the requested Session-Expires / MIN-SE values are too small, a 422 reply will be sent for you. The 422 will carry a MIN-SE: header with the sst min\_se parameter value set.

Meaning of the parameters is as follows:

*   _min\_allowed_ (int, optional) - The value to compare the MIN\_SE header value to.
    

**Example�1.7.�`sstCheckMin` usage**

...
modparam("sst", "sst\_flag", "SST\_FLAG")
modparam("sst", "min\_se", 2400) # Must be >= 90
...

route {
  if ($rm=="INVITE") {
	if (sstCheckMin(1)) {
		xlog("L\_ERR", "422 Session Timer Too Small reply sent.\\n");
		exit;
	}
	# track the session timers via the dialog module
	setflag(SST\_FLAG);
	create\_dialog();
  }
}

...

  

## 1.6.�Exported Statistics

### 1.6.1.�`expired_sst`

Number of dialogs which got expired session timer.

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

30

25

125

129

2.

Ron Winacott

27

5

2083

265

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

19

16

54

68

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

15

12

104

104

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

10

106

140

6.

Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu))

8

6

122

28

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

6

40

45

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

7

4

174

60

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

6

4

7

15

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

5

3

15

18

  

**All remaining contributors**: Anca Vamanu, Christophe Sollet ([@csollet](https://github.com/csollet)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Damien Sandras ([@dsandras](https://github.com/dsandras)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Konstantin Bokarius, Dan Pascu ([@danpascu](https://github.com/danpascu)), Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Elena-Ramona Modroiu.

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

Jan 2013 - May 2024

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Mar 2023

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2008 - Jun 2022

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2006 - May 2020

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Sep 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Oct 2016 - Oct 2016

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2011 - Feb 2015

10.

Ezequiel Lovelle ([@lovelle](https://github.com/lovelle))

Oct 2014 - Oct 2014

  

**All remaining contributors**: Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Damien Sandras ([@dsandras](https://github.com/dsandras)), Christophe Sollet ([@csollet](https://github.com/csollet)), Anca Vamanu, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Dan Pascu ([@danpascu](https://github.com/danpascu)), Elena-Ramona Modroiu, Ron Winacott.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Christophe Sollet ([@csollet](https://github.com/csollet)), Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Ron Winacott.

_Documentation Copyrights:_

Copyright � 2006 SOMA Networks, Inc.