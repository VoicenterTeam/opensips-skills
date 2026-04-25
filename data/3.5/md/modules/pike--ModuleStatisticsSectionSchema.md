# pike Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp96112)

3.2. [Most recently active contributors(1) to this module](#idp5752176)

**List of Examples**

1.1. [Set `sampling_time_unit` parameter](#idp3469712)

1.2. [Set `reqs_density_per_unit` parameter](#idp2657936)

1.3. [Set `remove_latency` parameter](#idp4117664)

1.4. [Set `check_route` parameter](#idp5084480)

1.5. [Set `pike_log_level` parameter](#idp5358704)

1.6. [`pike_check_req` usage](#idp3725296)

2.1. [Tree of IP addresses](#idp4247232)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module provides a simple mechanism for DOS protection - DOS based on floods at network level. The module keeps trace of all (or selected ones) IPs of incoming SIP traffic (as source IP) and blocks the ones that exceeded some limit. Works simultaneous for IPv4 and IPv6 addresses.

The module does not implement any actions on blocking - it just simply reports that there is a high traffic from an IP; what to do, is the administator decision (via scripting).

## 1.2.�How to use

There are 2 ways of using this module (as detecting flood attacks and as taking the right action to limit the impact on the system):

*   _manual_ - from routing script you can force the check of the source IP of an incoming requests, using "pike\_check\_req" function. Note that this checking works only for SIP requests and you can decide (based on scripting logic) what source IPs to be monitored and what action to be taken when a flood is detected.
    
*   _automatic_ - the module will install internal hooks to catch all incoming requests and replies (even if not well formed from SIP point of view) - more or less the module will monitor all incoming packages (from the network) on the SIP sockets. Each time the source IP of a package needs to be analyse (to see if trusted or not), the module will run a script route - see "check\_route" module parameter -, where, based on custom logic, you can decide if that IP needs to be monitored for flooding or not. As action, when flood is detected, the module will automatically drop the packages.
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`sampling_time_unit` (integer)

Time period used for sampling (or the sampling accuracy ;-) ). The smaller the better, but slower. If you want to detect peaks, use a small one. To limit the access (like total number of requests on a long period of time) to a proxy resource (a gateway for ex), use a bigger value of this parameter.

IMPORTANT: a too small value may lead to performance penalties due timer process overloading.

_Default value is 2._

**Example�1.1.�Set `sampling_time_unit` parameter**

...
modparam("pike", "sampling\_time\_unit", 10)
...

  

### 1.4.2.�`reqs_density_per_unit` (integer)

How many requests should be allowed per sampling\_time\_unit before blocking all the incoming request from that IP. Practically, the blocking limit is between ( let's have x=reqs\_density\_per\_unit) x and 3\*x for IPv4 addresses and between x and 8\*x for ipv6 addresses.

_Default value is 30._

**Example�1.2.�Set `reqs_density_per_unit` parameter**

...
modparam("pike", "reqs\_density\_per\_unit", 30)
...

  

### 1.4.3.�`remove_latency` (integer)

For how long the IP address will be kept in memory after the last request from that IP address. It's a sort of timeout value.

_Note:_ If the _remove\_latency_ value is lower than _sampling\_time\_unit_ value, nodes might expire before being unblocked, therefore losing some UNBLOCK events. In order to prevent this, if the _remove\_latency_ is lower, OpenSIPS internally forces its value to _sampling\_time\_unit + 1_.

_Default value is 120._

**Example�1.3.�Set `remove_latency` parameter**

...
modparam("pike", "remove\_latency", 130)
...

  

### 1.4.4.�`check_route` (integer)

The name of the script route to be triggers (in automatic way) when a package is received from the network. If you do a "drop" in this route, it will indicate to the module that the source IP of the package does not need to be monitored. Otherwise, the source IP will be automatically monitered.

By defining this parameter, the automatic checking mode is enabled.

_Default value is NONE (no auto mode)._

**Example�1.4.�Set `check_route` parameter**

...
modparam("pike", "check\_route", "pike")
...
route\[pike\]{
    if ($si==111.222.111.222)  /\*trusted, do not check it\*/
        drop;
    /\* all other IPs are checked\*/
}
....

  

### 1.4.5.�`pike_log_level` (integer)

Log level to be used by module to auto report the blocking (only first time) and unblocking of IPs detected as source of floods.

_Default value is 1 (L\_WARN)._

**Example�1.5.�Set `pike_log_level` parameter**

...
modparam("pike", "pike\_log\_level", -1)
...

  

## 1.5.�Exported Functions

### 1.5.1.� `pike_check_req()`

Process the source IP of the current request and returns false if the IP was exceeding the blocking limit.

Return codes:

*   _1 (true)_ - IP is not to be blocked or internal error occurred.
    
    ### Warning
    
    IMPORTANT: in case of internal error, the function returns true to avoid reporting the current processed IP as blocked.
    
*   _\-1 (false)_ - IP is source of flooding, being previously detected
    
*   _\-2 (false)_ - IP is detected as a new source of flooding - first time detection
    

This function can be used from REQUEST\_ROUTE.

**Example�1.6.�`pike_check_req` usage**

...
if (!pike\_check\_req()) { exit; };
...

  

## 1.6.�Exported MI Functions

### 1.6.1.� `pike_list`

Lists the nodes in the pike tree.

Name: _pike\_list_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi pike\_list
		

### 1.6.2.� `pike_rm`

Remove a node from the pike tree by IP address.

Name: _pike\_rm_

Parameters:

*   _IP_ - IP address currently blocked.
    

MI FIFO Command Format:

		opensips-cli -x mi pike\_rm 10.0.0.106
		

## 1.7.�Exported Events

### 1.7.1.� `E_PIKE_BLOCKED`

This event is raised when the _pike_ module decides that an IP should be blocked.

Parameters:

*   _ip_ - the IP address that has been blocked.
    

## 1.8.�Provided Status/Report Identifiers

The module provides the "pike" Status/Report group, only with the "main"/default SR identifier.

There is no usefull status published by the module.

In terms of reports/logs, the following events will be reported:

*   IP X.Y.Z.W detected as flooding
    

For how to access and use the Status/Report information, please see [https://www.opensips.org/Documentation/Interface-StatusReport-3-3](>https://www.opensips.org/Documentation/Interface-StatusReport-3-3).

## Chapter�2.�Developer Guide

One single tree (for both IPv4 and IPv6) is used. Each node contains a byte, the IP addresses stretching from root to the leafs.

**Example�2.1.�Tree of IP addresses**

	   / 193 - 175 - 132 - 164
tree root /                  \\ 142
	  \\ 195 - 37 - 78 - 163
	   \\ 79 - 134

  

To detect the whole address, step by step, from the root to the leafs, the nodes corresponding to each byte of the ip address are expanded. In order to be expended a node has to be hit for a given number of times (possible by different addresses; in the previous example, the node “37” was expended by the 195.37.78.163 and 195.37.79.134 hits).

For 193.175.132.164 with x= reqs\_density\_per\_unit:

*   After first req hits -> the “193” node is built.
    
*   After x more hits, the “175” node is build; the hits of “193” node are split between itself and its child--both of them gone have x/2.
    
*   And so on for node “132” and “164”.
    
*   Once “164” build the entire address can be found in the tree. “164” becomes a leaf. After it will be hit as a leaf for x times, it will become “RED” (further request from this address will be blocked).
    

So, to build and block this address were needed 3\*x hits. Now, if reqs start coming from 193.175.132.142, the first 3 bytes are already in the tree (they are shared with the previous address), so I will need only x hits (to build node “142” and to make it “RED”) to make this address also to be blocked. This is the reason for the variable number of hits necessary to block an IP.

The maximum number of hits to turn an address red are (n is the address's number of bytes):

1 (first byte) + x (second byte) + (x / 2) \* (n - 2) (for the rest of the bytes) + (n - 1) (to turn the node to red).

So, for IPv4 (n = 4) will be 3x and for IPv6 (n = 16) will be 9x. The minimum number of hits to turn an address red is x.

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

139

59

4217

2675

2.

Andrei Pelinescu-Onciul

16

8

120

336

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

99

18

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

10

29

69

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

11

9

24

20

6.

Jan Janak ([@janakj](https://github.com/janakj))

9

4

386

34

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

8

6

73

52

8.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

6

3

257

0

9.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

5

3

111

22

10.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

3

4

  

**All remaining contributors**: Henning Westerholt ([@henningw](https://github.com/henningw)), Elena-Ramona Modroiu, Ancuta Onofrei, Konstantin Bokarius, Juli�n Moreno Pati�o, Jesus Rodrigues, Norman Brandinger ([@NormB](https://github.com/NormB)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2011 - Sep 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jun 2002 - May 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

8.

Jarrod Baumann ([@jarrodb](https://github.com/jarrodb))

Apr 2015 - Apr 2015

9.

Norman Brandinger ([@NormB](https://github.com/NormB))

Aug 2013 - Aug 2013

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Nov 2006 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Jesus Rodrigues, Ancuta Onofrei, Elena-Ramona Modroiu, Andrei Pelinescu-Onciul, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Juli�n Moreno Pati�o, Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Norman Brandinger ([@NormB](https://github.com/NormB)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jesus Rodrigues, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2005-2009 Voice Sistem SRL

Copyright � 2003 FhG FOKUS