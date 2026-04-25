# Presence User Agent for XMPP (Presence gateway between SIP and XMPP)

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5558880)

3.2. [Most recently active contributors(1) to this module](#idp5622176)

**List of Examples**

1.1. [Set `server_address` parameter](#idp4810480)

1.2. [Set `presence_server` parameter](#idp260464)

1.3. [`Notify2Xmpp` usage](#idp163536)

1.4. [`xmpp_send_winfo` usage](#idp171696)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is a gateway for presence between SIP and XMPP.

It translates one format into another and uses xmpp, pua and presence modules to manage the transmition of presence state information.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _presence_.
    
*   _pua_.
    
*   _xmpp_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _libxml_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`server_address`(str)

The IP address of the server.

**Example�1.1.�Set `server_address` parameter**

...
modparam("pua\_xmpp", "server\_address", "sip:sa@opensips.org:5060")
...

  

### 1.3.2.�`presence_server` (str)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example�1.2.�Set `presence_server` parameter**

...
modparam("pua\_xmpp", "presence\_server", "sip:pa@opensips.org:5075")
...
	

  

## 1.4.�Exported Functions

Functions exported to be used in configuration file.

### 1.4.1.� `pua_xmpp_notify()`

Function that handles Notify messages addressed to a user from an xmpp domain. It requires filtering after method and domain in configuration file. If the function is successful, a 2xx reply must be sent.

This function can be used from REQUEST\_ROUTE.

**Example�1.3.�`Notify2Xmpp` usage**

...
	if( is\_method("NOTIFY") && $ru=~"sip:.+@sip-xmpp.siphub.ro")
	{
		if(Notify2Xmpp())
			t\_reply(200, "OK");
		exit;
	}
...

  

### 1.4.2.� `pua_xmpp_req_winfo(request_uri, expires)`

Function called when a Subscribe addressed to a user from a xmpp domain is received. It calls sending a Subscribe for winfo for the user, and the following Notify with dialog-info is translated into a subscription in xmpp. It also requires filtering in configuration file, after method, domain and event(only for presence).

Parameters:

*   _request\_uri_ (string)
    
*   _expires_ (int) - value of Expires header field in received Subscribe.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.4.�`xmpp_send_winfo` usage**

...
	if( is\_method("SUBSCRIBE"))
	{
		handle\_subscribe();
		if($ru=~"sip:.+@sip-xmpp.siphub.ro" && $hdr(Event)== "presence")
		{
			pua\_xmpp\_req\_winfo($ruri, $hdr(Expires));
		}
		t\_release();
	}

...
		

  

## 1.5.� Filtering

Instead of "sip-xmpp.siphub.ro" in the example you should use the value set for the xmpp module parameter named 'gateway\_domain'.

## Chapter�2.�Developer Guide

The module provides no function to be used in other OpenSIPS modules.

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

59

17

3287

806

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

16

13

59

81

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

14

11

40

63

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

13

11

24

33

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

10

8

27

21

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

4

34

69

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

3

1

14

2

8.

Sergio Gutierrez

3

1

5

5

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

3

1

4

14

10.

Konstantin Bokarius

3

1

3

5

  

**All remaining contributors**: Juha Heinanen ([@juha-h](https://github.com/juha-h)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Ken Rice, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Edson Gellert Schubert, Stanislaw Pitucha.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

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

Feb 2012 - Jul 2020

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Apr 2019

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Jan 2013 - Jan 2013

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Aug 2011 - Aug 2011

10.

Stanislaw Pitucha

Jul 2010 - Jul 2010

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Anca Vamanu, Sergio Gutierrez, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Anca Vamanu, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2007 Voice Sistem SRL