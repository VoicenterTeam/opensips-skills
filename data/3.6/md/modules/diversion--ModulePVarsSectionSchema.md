# Diversion Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5517552)

3.2. [Most recently active contributors(1) to this module](#idp5618448)

**List of Examples**

1.1. [`suffix` usage](#idp209072)

1.2. [`add_diversion` usage](#idp166400)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module implements the Diversion extensions as per draft-levy-sip-diversion-08. The diversion extensions are useful in various scenarios involving call forwarding. Typically one needs to communicate the original recipient of the call to the PSTN gateway and this is what the diversion extensions can be used for.

### Warning

The draft-levy-sip-diversion-08 is expired!! See [IETF I-D tracker](https://datatracker.ietf.org/public/idindex.cgi?command=id_detail%E2%88%A7id=6002).

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

None.

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`suffix` (string)

The suffix to be appended to the end of the header field. You can use the parameter to specify additional parameters to be added to the header field, see the example.

Default value is “” (empty string).

**Example�1.1.�`suffix` usage**

modparam("diversion", "suffix", ";privacy=full")

  

## 1.4.�Exported Functions

### 1.4.1.�`add_diversion(reason, [uri], [counter])`

The function adds a new diversion header field before any other existing Diversion header field in the message (the newly added Diversion header field will become the topmost Diversion header field). The inbound (without any modifications done by the proxy server) Request-URI will be used as the Diversion URI.

Meaning of the parameters is as follows:

*   _reason_ (string) - The reason string to be added as the reason parameter
    
*   _uri_ (string, optional) - The URI to be added in the header. If missing the unchanged RURI from the original message will be used.
    
*   _counter_ (int, optional) - Diversion counter to be added to the header, as defined by the standard.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.2.�`add_diversion` usage**

...
add\_diversion("user-busy");
...

  

## 1.5.�Diversion Example

The following example shows a Diversion header field added to INVITE message. The original INVITE received by the user agent of sip:bob@sip.org is:

INVITE sip:bob@sip.org SIP/2.0
Via: SIP/2.0/UDP 1.2.3.4:5060
From: "mark" <sip:mark@sip.org>;tag=ldgheoihege
To: "Bob" <sip:bob@sip.org>
Call-ID: adgasdkgjhkjha@1.2.3.4
CSeq: 3 INVITE
Contact: <sip:mark@1.2.3.4>
Content-Length: 0

The INVITE message is diverted by the user agent of sip:bob@sip.org because the user was talking to someone else and the new destination is sip:alice@sip.org :

INVITE sip:alice@sip.org SIP/2.0
Via: SIP/2.0/UDP 5.6.7.8:5060
Via: SIP/2.0/UDP 1.2.3.4:5060
From: "mark" <sip:mark@sip.org>;tag=ldgheoihege
To: "Bob" <sip:bob@sip.org>
Call-ID: adgasdkgjhkjha@1.2.3.4
CSeq: 3 INVITE
Diversion: <sip:bob@sip.org>;reason=user-busy
Contact: <sip:mark@1.2.3.4>
Content-Length: 0

## Chapter�2.�Developer Guide

According to the specification new Diversion header field should be inserted as the topmost Diversion header field in the message, that means before any other existing Diversion header field in the message. In addition to that, `add_diversion` function can be called several times and each time it should insert the new Diversion header field as the topmost one.

In order to implement this, add\_diversion function creates the anchor in data\_lump lists as a static variable to ensure that the next call of the function will use the same anchor and would insert new Diversion headers before the one created in the previous execution. To my knowledge this is the only way of inserting the diversion header field before any other created in previous runs of the function.

The anchor kept this way is only valid for a single message and we have to invalidate it when another message is being processed. For this reason, the function also stores the id of the message in another static variable and compares the value of that variable with the id of the SIP message being processed. If they differ then the anchor will be invalidated and the function creates a new one.

The following code snippet shows the code that invalidates the anchor, new anchor will be created when the `anchor` variable is set to 0.

static inline int add\_diversion\_helper(struct sip\_msg\* msg, str\* s)
{
    static struct lump\* anchor = 0;
    static int msg\_id = 0;

    if (msg\_id != msg->id) {
        msg\_id = msg->id;
        anchor = 0;
    }
...
}

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

17

15

62

32

2.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

15

13

28

20

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

11

9

16

47

4.

Jan Janak ([@janakj](https://github.com/janakj))

10

4

528

13

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

6

4

4

2

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

5

3

20

42

7.

Henning Westerholt ([@henningw](https://github.com/henningw))

5

3

3

27

8.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

4

2

74

11

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

3

10.

Konstantin Bokarius

3

1

3

5

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Andreas Heise, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)).

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

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2015 - Sep 2019

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2005 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2012 - Jun 2012

8.

Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul))

May 2012 - Jun 2012

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

Apr 2007 - May 2008

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Oct 2005 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Andreas Heise, Jan Janak ([@janakj](https://github.com/janakj)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2004 FhG FOKUS