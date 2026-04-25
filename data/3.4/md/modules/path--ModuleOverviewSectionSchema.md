# path Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5551104)

2.2. [Most recently active contributors(1) to this module](#idp5648464)

**List of Examples**

1.1. [Set `use_received` parameter](#idp91200)

1.2. [Set `enable_double_path` parameter](#idp5518752)

1.3. [`add_path(user)` usage](#idp5526720)

1.4. [`add_path_received(user)` usage](#idp5534000)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is designed to be used at intermediate sip proxies like loadbalancers in front of registrars and proxies. It provides functions for inserting a Path header including a parameter for passing forward the received-URI of a registration to the next hop. It also provides a mechanism for evaluating this parameter in subsequent requests and to set the destination URI according to it.

### 1.1.1.�Path insertion for registrations

For registrations in a scenario like “\[UAC\] -> \[P1\] -> \[REG\]”, the "path" module can be used at the intermediate proxy P1 to insert a Path header into the message before forwarding it to the registrar REG. Two functions can be used to achieve this:

*   _add\_path(...)_ adds a Path header in the form of “Path: <sip:1.2.3.4;lr>” to the message using the address of the outgoing interface. A port is only added if it's not the default port 5060.
    
    If a username is passed to the function, it is also included in the Path URI, like “Path: <sip:username@1.2.3.4;lr>”.
    
*   _add\_path\_received(...)_ also add a Path header in the same form as above, but also adds a parameter indicating the received-URI of the message, like “Path: <sip:1.2.3.4;received=sip:2.3.4.5:1234;lr>”. This is especially useful if the proxy does NAT detection and wants to pass the NAT'ed address to the registrar.
    
    If the function is called with a username, it's included in the Path URI too.
    

### 1.1.2.�Outbound routing to NAT'ed UACs

If the NAT'ed address of an UAC is passed to the registrar, the registrar routes back subsequent requests using the Path header of the registration as Route header of the current request. If the intermediate proxy had inserted a Path header including the “received” parameter during the registration, this parameter will show up in the Route header of the new request as well, allowing the intermediate proxy to route to this address instead of the one propagated in the Route URI for tunneling through NAT. This behaviour can be activated by setting the module parameter “use\_received”.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   The "rr" module is needed for outbound routing according to the “received” parameter.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`use_received` (int)

If set to 1, the “received” parameter of the first Route URI is evaluated and used as destination-URI if present.

_Default value is 0._

**Example�1.1.�Set `use_received` parameter**

...
modparam("path", "use\_received", 1)
...

  

### 1.3.2.�`enable_double_path` (integer)

There are some situations when the server needs to insert two Path header fields instead of one. For example when using two disconnected networks or doing cross-protocol forwarding from UDP->TCP. This parameter enables inserting of 2 Paths.

_Default value is 1 (yes)._

**Example�1.2.�Set `enable_double_path` parameter**

...
modparam("path", "enable\_double\_path", 0)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `add_path([user])`

This function adds a Path header in the form “Path: <sip:user@1.2.3.4;lr>”.

Meaning of the parameters is as follows:

*   _user_ (string, optional) - The username to be inserted as user part.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.3.�`add_path(user)` usage**

...
if (!add\_path("loadbalancer")) {
	sl\_send\_reply(503, "Internal Path Error");
	...
};
...

  

### 1.4.2.� `add_path_received([user])`

This function adds a Path header in the form “Path: <sip:user@1.2.3.4;received=sip:2.3.4.5:1234;lr>”, setting 'user' as username part of address, it's own outgoing address as domain-part, and the address the request has been received from as received-parameter.

Meaning of the parameters is as follows:

*   _user_ (string, optional) - The username to be inserted as user part.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.4.�`add_path_received(user)` usage**

...
if (!add\_path\_received("inbound")) {
	sl\_send\_reply(503, "Internal Path Error");
	...
};
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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

20

16

239

79

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

18

12

96

267

3.

Andreas Granig

13

4

863

22

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

12

10

25

21

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

10

8

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

6

3

35

104

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

4

5

8.

Henning Westerholt ([@henningw](https://github.com/henningw))

4

2

5

32

9.

Ancuta Onofrei

3

1

12

12

10.

Konstantin Bokarius

3

1

2

5

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Elena-Ramona Modroiu.

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Aug 2010 - Sep 2019

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2006 - Jul 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Nov 2006 - Mar 2008

8.

Konstantin Bokarius

Mar 2008 - Mar 2008

9.

Edson Gellert Schubert

Feb 2008 - Feb 2008

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

Apr 2007 - Dec 2007

  

**All remaining contributors**: Ancuta Onofrei, Andreas Granig, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Andreas Granig.

_Documentation Copyrights:_

Copyright � 2006 Inode GmbH