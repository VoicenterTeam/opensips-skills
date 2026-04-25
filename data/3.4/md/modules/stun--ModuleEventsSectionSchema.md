# Stun Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5581776)

2.2. [Most recently active contributors(1) to this module](#idp5676048)

**List of Examples**

1.1. [Set `primary_ip` parameter](#idp5521808)

1.2. [Set `primary_port` parameter](#idp5527728)

1.3. [Set `alternate_ip` parameter](#idp5536400)

1.4. [Set `alternate_port` parameter](#idp5545216)

1.5. [Set `use_listeners_as_primary` parameter](#idp5551856)

## Chapter�1.�Admin Guide

## 1.1.�Overview

### 1.1.1.� The idea

A stun server working with the same port as SIP (5060) in order to gain accurate information. The benefit would be an exact external address in the case of NATs translating differently when given different destination ports. The server may also advertise different network addresses than the ones it is actually listening on.

### 1.1.2.� Basic Operation

The stun server will use 4 sockets:

*   socket1 = ip1 : port1
*   socket2 = ip1 : port2
*   socket3 = ip2 : port1
*   socket4 = ip2 : port2

where _ip1_ / _port1_ represent an UDP SIP listener and _ip2_ / _port2_ are configured via the [alternate\_ip](#param_alternate_ip "1.3.3.� alternate_ip (str)") and [alternate\_port](#param_alternate_port "1.3.4.� alternate_port (str)") parameters.

The sockets come from existing SIP sockets or are created.

Socket1 must allways be a SIP UDP listener from OpenSIPS.

If [use\_listeners\_as\_primary](#param_use_listeners_as_primary "1.3.5.� use_listeners_as_primary (int)") is enabled the STUN server will actually use multiple sets of sockets obtained from the IP/port combinations described above, each set corresponding to a SIP UDP listener from OpenSIPS.

The server will create a separate process. This process will listen for data on created sockets. The server will register a callback function to SIP. This function is called when a specific (stun)header is found.

### 1.1.3.� Supported STUN Attributes

This stun implements RFC3489 (and XOR\_MAPPED\_ADDRESS from RFC5389)

*   MAPPED\_ADDRESS
*   RESPONSE\_ADDRESS
*   CHANGE\_REQUEST
*   SOURCE\_ADDRESS
*   CHANGED\_ADDRESS
*   ERROR\_CODE
*   UNKNOWN\_ATTRIBUTES
*   REFLECTED\_FROM
*   XOR\_MAPPED\_ADDRESS

Not supported attributes:

*   USERNAME
*   PASSWORD
*   MESSAGE\_INTEGRITY

and associated ERROR\_CODEs

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

_None_.

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.� `primary_ip` (str)

The IP of an interface which is configured as an UDP SIP listener in OpenSIPS. This is a mandatory parameter, unless [use\_listeners\_as\_primary](#param_use_listeners_as_primary "1.3.5.� use_listeners_as_primary (int)") is enabled.

Syntax: "ip \[/ advertised\_ip\]

By default, the _primary\_ip_ and the advertised _primary\_ip_ will be identical. This may be changed with an optional "/ xxx.xxx.xxx.xxx" string.

**Example�1.1.�Set `primary_ip` parameter**

...
modparam("stun", "primary\_ip", "192.168.0.100")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "primary\_ip", "192.168.0.100 / 64.50.46.78")
...
				

  

### 1.3.2.� `primary_port` (str)

The port configured (together with the _primary\_ip_) as an UDP SIP listener in OpenSIPS. The default value is 5060.

Syntax: "port \[/ advertised\_port\]

By default, the _primary\_port_ and the advertised _primary\_port_ will be identical. This may be changed with an optional "/ adv\_port" string.

**Example�1.2.�Set `primary_port` parameter**

...
modparam("stun", "primary\_port", "5060")

# Listening on a primary port, but advertising a different one
modparam("stun", "primary\_port", "5060 / 5062")
...
				

  

### 1.3.3.� `alternate_ip` (str)

Another IP from another interface. This is a mandatory parameter.

If [use\_listeners\_as\_primary](#param_use_listeners_as_primary "1.3.5.� use_listeners_as_primary (int)") is enabled, the alternate IP must be either:

*   an IP from an existing UDP SIP listener configured in OpenSIPS, but one that is different from all the other UPD listeners;
    
*   an IP that is different from the UDP SIP listeners configured in OpenSIPS.
    

Syntax: "ip \[/ advertised\_ip\]

By default, the _alternate\_ip_ and the advertised _alternate\_ip_ will be identical. This may be changed with an optional "/ xxx.xxx.xxx.xxx" string.

**Example�1.3.�Set `alternate_ip` parameter**

...
modparam("stun","alternate\_ip","11.22.33.44")

# Example of a STUN server within OpenSIPS which is behind NAT
modparam("stun", "alternate\_ip", "192.168.0.100 / 64.78.46.50")
...
				

  

### 1.3.4.� `alternate_port` (str)

The port used by the STUN server for the second interface. The default value is 3478 (default STUN port).

If [use\_listeners\_as\_primary](#param_use_listeners_as_primary "1.3.5.� use_listeners_as_primary (int)") is enabled, the alternate port must be either:

*   a port from an existing UDP SIP listener configured in OpenSIPS, but one that is different from all the other UPD listeners;
    
*   a port that is different from the UDP SIP listeners configured in OpenSIPS.
    

Syntax: "port \[/ advertised\_port\]

By default, the _alternate\_port_ and the advertised _alternate\_port_ will be identical. This may be changed with an optional "/ adv\_port" string.

**Example�1.4.�Set `alternate_port` parameter**

...
modparam("stun","alternate\_port","3479")

# Listening on an alternate port, but advertising a different one
modparam("stun", "alternate\_port", "5060 / 5062")
...
				

  

### 1.3.5.� `use_listeners_as_primary` (int)

Setting this parameter to _1_ will allow all configured UDP SIP listeners to be automatically used as "primary" STUN sockets.

The [primary\_ip](#param_primary_ip "1.3.1.� primary_ip (str)") and [primary\_port](#param_primary_port "1.3.2.� primary_port (str)") parameters will be ignored when this behavior is enabled.

The default value is _0_ (disabled).

**Example�1.5.�Set `use_listeners_as_primary` parameter**

...
modparam("stun","use\_listeners\_as\_primary",1)
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

Razvan Pistolea

20

3

1891

19

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

19

14

194

179

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

18

13

268

119

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

14

12

27

20

5.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

7

5

25

4

6.

Bernard

7

1

391

75

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

2

3

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

2

1

1

0

  

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

Mar 2014 - Sep 2025

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Sep 2009 - May 2023

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Bernard

Oct 2021 - Oct 2021

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2011 - Sep 2019

6.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Sep 2011 - Aug 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2017

9.

Razvan Pistolea

Sep 2009 - Sep 2009

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bernard, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Pistolea.

_Documentation Copyrights:_

Copyright � 2009 Voice Sistem SRL