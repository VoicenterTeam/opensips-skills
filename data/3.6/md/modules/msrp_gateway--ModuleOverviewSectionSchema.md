# MSRP Gateway Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5654848)

2.2. [Most recently active contributors(1) to this module](#idp5724064)

**List of Examples**

1.1. [Set `hash_size` parameter](#idp4026416)

1.2. [Set `cleanup_interval` parameter](#idp247664)

1.3. [Set `session_timeout` parameter](#idp164288)

1.4. [Set `message_timeout` parameter](#idp169104)

1.5. [`msrp_gw_answer()` usage](#idp5578208)

1.6. [`msg_to_msrp()` usage](#idp5587296)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements a Gateway for translating between Page Mode (SIP MESSAGE method) and Session Mode (MSRP) Instant Messaging.

The module makes use of the _msrp\_ua_ module's API for the MSRP UAC/UAS functionalities.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tm_
    
*   _msrp\_ua_
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`hash_size` (int)

The size of the hash table that stores the gateway session information. It is the 2 logarithmic value of the real size.

_Default value is “10”_ (1024 records).

**Example�1.1.�Set `hash_size` parameter**

...
modparam("msrp\_gateway", "hash\_size", 16)
...
		

  

### 1.3.2.�`cleanup_interval` (int)

The interval between full iterations of the sessions table in order to clean up lingering sessions.

_Default value is “60”. (seconds)_

**Example�1.2.�Set `cleanup_interval` parameter**

...
modparam("msrp\_gateway", "cleanup\_interval", 60)
...
		

  

### 1.3.3.�`session_timeout` (int)

Amount of time (in seconds) since last message has been received from either side, after which a session should be terminated.

_The default value is 12 \* 3600 seconds (12 hours)._

**Example�1.3.�Set `session_timeout` parameter**

...
modparam("msrp\_gateway", "session\_timeout", 7200)
...
		

  

### 1.3.4.�`message_timeout` (int)

Amount of time (in seconds) since last MESSAGE has been received after which a session should be terminated.

_The default value is 2 \* 3600 seconds (2 hours)._

**Example�1.4.�Set `message_timeout` parameter**

...
modparam("msrp\_gateway", "message\_timeout", 3600)
...
		

  

## 1.4.�Exported Functions

### 1.4.1.� `msrp_gw_answer(key, content_types, from, to, ruri)`

This functions initializes a new gateway session by answering an initial INVITE from the MSRP side SIP session. After running this function the call will be completely handled by the MSRP UA engine and MSRP SEND requests will be automatically translated to SIP MESSAGE requests.

The SIP From, To, and RURI coordinates for building MESSAGE requests are passed as parameters to the function.

Parameters:

*   _key_ (string) - gateway session key to be used to correlate the MESSAGE requests with the MSRP side SIP session. A simple example would be to build this key based on the From and To URIs from both sides(from the initial MSRP leg INVITE and SIP MESSAGE requests respectively).
    
*   _content\_types_ (string) - content types adevertised in the SDP offer on the MSRP side SIP session.
    
*   _from_ (string) - From URI to be used for building SIP MESSAGE requests.
    
*   _to_ (string) - To URI to be used for building SIP MESSAGE requests.
    
*   _ruri_ (string) - Request-URI to be used for building SIP MESSAGE requests.
    

This function can be used only from a request route.

**Example�1.5.�`msrp_gw_answer()` usage**

...
if (!has\_totag() && is\_method("INVITE")) {
	msrp\_gw\_answer($var(corr\_key), "text/plain", $fu, $tu, $ru);
	exit;
}
...

  

### 1.4.2.� `msg_to_msrp(key, content_types)`

This functions translates a SIP MESSAGE request into a MSRP SEND request. The function will initialize a new gateway session and establish the MSRP side SIP session if it is not done so already by a previous call.

The SIP From, To, and RURI coordinates for the new MSRP side session are taken from the MESSAGE request and mirrored back when translating a MSRP SEND to SIP MESSAGE with _msrp\_gw\_answer_.

Parameters:

*   _key_ (string) - gateway session key to be used to correlate the MESSAGE requests with the MSRP side SIP session. A simple example would be to build this key based on the From and To URIs from both sides(from the initial MSRP leg INVITE and SIP MESSAGE requests respectively).
    
*   _content\_types_ (string) - content types adevertised in the SDP offer on the MSRP side SIP session.
    

This function can be used only from a request route.

**Example�1.6.�`msg_to_msrp()` usage**

...
if (is\_method("MESSAGE")) {
	msg\_to\_msrp($var(corr\_key), "text/plain");
	exit;
}
...

  

## 1.5.�Exported MI Functions

### 1.5.1.� `msrp_gw_list_sessions`

Lists information about ongoing sessions.

Name: _msrp\_gw\_list\_sessions_

Parameters

*   _None_.
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_gw\_list\_sessions
		

### 1.5.2.� `msrp_gw_end_session`

Terminate an ongoing session.

Name: _msrp\_gw\_end\_session_

Parameters

*   _key_ (string) - session key
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_gw\_end\_session alice@opensips.org-bob@opensips.org
		

## 1.6.�Exported Events

### 1.6.1.� `E_MSRP_GW_SETUP_FAILED`

This event is triggered when the MSRP side SIP session fails to set up, when using the _msg\_to\_msrp()_ function.

The event can be used to generate a message with the failure description, back on the MESSAGE side.

Parameters:

*   _key_ - The session key.
    
*   _from\_uri_ - The URI in the SIP From header to use on the MESSAGE side.
    
*   _to\_uri_ - The URI in the SIP To header to use on the MESSAGE side.
    
*   _ruri_ - The SIP Request URI to use on the MESSAGE side.
    
*   _code_ - The SIP error code in the negative reply received on the MSRP side. Might be NULL if the MSRP UA session expired before receiving a negative reply.
    
*   _reason_ - The SIP reason string in the negative reply received on the MSRP side. Might be NULL if the MSRP UA session expired before receiving a negative reply.
    

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

21

9

1219

19

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

4

4

3.

Alexandra Titoc

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

Alexandra Titoc

Sep 2024 - Sep 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2022 - Jan 2023

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2022 [www.opensips-solutions.com](http://www.opensips-solutions.com/)