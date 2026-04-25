# AAA\_DIAMETER MODULE

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5595472)

2.2. [Most recently active contributors(1) to this module](#idp5675424)

**List of Examples**

1.1. [Setting the `fd_log_level` parameter](#idp163824)

1.2. [Setting the `realm` parameter](#idp168480)

1.3. [Setting the `peer_identity` parameter](#idp5517504)

1.4. [Setting the `aaa_url` parameter](#idp5521584)

1.5. [Setting the `aaa_url` parameter](#idp5523360)

1.6. [Setting the `answer_timeout` parameter](#idp5541216)

1.7. [`dictionary.opensips` extended syntax](#idp5557856)

1.8. [`dm_send_request` usage](#idp5562592)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides a Diameter implementation for the core AAA API interface.

Any module that wishes to use it has to do the following:

*   _include aaa.h_
    
*   _make a bind call with a proper Diameter-specific URL, e.g. "diameter:freeDiameter-client.conf"_
    

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

None.

### 1.2.2.�External Libraries or Applications

All Diameter message building and parsing, as well as the peer state machine and Diameter-related network communication are all powered by [_the freeDiameter project_](http://www.freediameter.net/trac/) and C libraries, dynamically linking with the "aaa\_diameter" module.

The following libraries must be installed before running OpenSIPS with this module loaded:

*   _libfdcore_ v1.2.1 or higher
    
*   _libfdproto_ v1.2.1 or higher
    

## 1.3.�Exported Parameters

### 1.3.1.�`fd_log_level (integer)`

This parameter measures the _quietness_ of the logging done by the freeDiameter library. Possible values:

*   0 (ANNOYING)
    
*   1 (DEBUG)
    
*   3 (NOTICE, default)
    
*   5 (ERROR)
    
*   6 (FATAL)
    

NOTE: since freeDiameter logs to standard output, you must also enable the new core parameter, **log\_stdout**, before getting any logs from the library.

**Example�1.1.�Setting the `fd_log_level` parameter**

modparam("aaa\_diameter", "fd\_log\_level", 0)

  

### 1.3.2.�`realm (string)`

The unique realm to be used by all participating Diameter peers.

Default value is _"diameter.test"_.

**Example�1.2.�Setting the `realm` parameter**

modparam("aaa\_diameter", "realm", "opensips.org")

  

### 1.3.3.�`peer_identity (string)`

The identity (realm subdomain) of the Diameter server peer, to which the OpenSIPS Diameter client peer will connect.

Default value is _"server"_ (i.e. "server.diameter.test").

**Example�1.3.�Setting the `peer_identity` parameter**

modparam("aaa\_diameter", "peer\_identity", "server")

  

### 1.3.4.�`aaa_url (string)`

URL of the diameter client: the configuration file, with an optional extra-avps-file, where the Diameter client is configured.

By default, the connection is not created.

**Example�1.4.�Setting the `aaa_url` parameter**

modparam("aaa\_diameter", "aaa\_url", "diameter:freeDiameter-client.conf")

  

**Example�1.5.�Setting the `aaa_url` parameter**

with an extra AVPs file.

modparam("aaa\_diameter", "aaa\_url", "diameter:freeDiameter-client.conf;extra-avps-file:dictionary.opensips")

  

### 1.3.5.�`answer_timeout (integer)`

Time, in milliseconds, after which a [dm\_send\_request()](#func_dm_send_request "1.4.1.� dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])") function call with no received reply will time out and return a **\-2** code.

Default value is _2000_ ms.

**Example�1.6.�Setting the `answer_timeout` parameter**

modparam("aaa\_diameter", "answer\_timeout", 5000)

  

## 1.4.�Exported Functions

### 1.4.1.� `dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])`

Perform a blocking Diameter request over to the interconnected peer and return the Result-Code AVP value from the reply.

_Parameters_

*   _app\_id_ (integer) - ID of the application. A custom application must be defined in the dictionary.opensips Diameter configuration file before it can be recognized.
    
*   _cmd\_code_ (integer) - ID of the command. A custom command code, name and AVP requirements must be defined in the dictionary.opensips Diameter configuration file beforehand. body of the HTTP response.
    
*   _avps\_json_ (string) - A JSON Array containing the AVPs to include in the message payload.
    
*   _rpl\_avps\_pv_ (var, optional) - output variable which will hold all AVP names from the Diameter Answer along with their values, packed as a JSON Array string. The "json" module and its _$json_ variable could be used to iterate this array.
    

_Return Codes_

*   **1** - Success
    
*   **\-1** - Internal Error
    
*   **\-2** - Request timeout (the [answer\_timeout](#param_answer_timeout "1.3.5.�answer_timeout (integer)") was exceeded before an Answer could be processed)
    

This function can be used from any route.

**Example�1.7.�`dictionary.opensips` extended syntax**

\# Example of defining custom Diameter AVPs, Application IDs,
# Requests and Replies in the "dictionary.opensips" file

ATTRIBUTE out\_gw            232 string
ATTRIBUTE trunk\_id          233 string

ATTRIBUTE rated\_duration    234 integer
ATTRIBUTE call\_cost         235 integer

ATTRIBUTE Exponent          429 integer32
ATTRIBUTE Value-Digits      447 integer64

ATTRIBUTE Cost-Unit 424 grouped
{
	Value-Digits | REQUIRED | 1
	Exponent | OPTIONAL | 1
}

ATTRIBUTE Currency-Code     425 unsigned32

ATTRIBUTE Unit-Value  445 grouped
{
	Value-Digits | REQUIRED | 1
	Exponent | OPTIONAL | 1
}

ATTRIBUTE Cost-Information  423 grouped
{
	Unit-Value | REQUIRED | 1
	Currency-Code | REQUIRED | 1
	Cost-Unit | OPTIONAL | 1
}

APPLICATION 42 My Diameter Application

REQUEST 92001 My-Custom-Request
{
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Realm | REQUIRED | 1
	Transaction-Id | REQUIRED | 1
	Sip-From-Tag | REQUIRED | 1
	Sip-To-Tag | REQUIRED | 1
	Acct-Session-Id | REQUIRED | 1
	Sip-Call-Duration | REQUIRED | 1
	Sip-Call-Setuptime | REQUIRED | 1
	Sip-Call-Created | REQUIRED | 1
	Sip-Call-MSDuration | REQUIRED | 1
	out\_gw | REQUIRED | 1
	call\_cost | REQUIRED | 1
	Cost-Information | OPTIONAL | 1
}

ANSWER 92001 My-Custom-Answer
{
	Origin-Host | REQUIRED | 1
	Origin-Realm | REQUIRED | 1
	Destination-Realm | REQUIRED | 1
	Transaction-Id | REQUIRED | 1
	Result-Code | REQUIRED | 1
}

  

**Example�1.8.�`dm_send_request` usage**

\# Building an sending an My-Custom-Request (92001) for the
# My Diameter Application (42)
$var(payload) = "\[
	{ \\"Origin-Host\\": \\"client.diameter.test\\" },
	{ \\"Origin-Realm\\": \\"diameter.test\\" },
	{ \\"Destination-Realm\\": \\"diameter.test\\" },
	{ \\"Sip-From-Tag\\": \\"dc93-4fba-91db\\" },
	{ \\"Sip-To-Tag\\": \\"ae12-47d6-816a\\" },
	{ \\"Acct-Session-Id\\": \\"a59c-dff0d9efd167\\" },
	{ \\"Sip-Call-Duration\\": 6 },
	{ \\"Sip-Call-Setuptime\\": 1 },
	{ \\"Sip-Call-Created\\": 1652372541 },
	{ \\"Sip-Call-MSDuration\\": 5850 },
	{ \\"out\_gw\\": \\"GW-774\\" },
	{ \\"cost\\": \\"10.84\\" },
	{ \\"Cost-Information\\": \[
		{\\"Unit-Value\\": \[{\\"Value-Digits\\": 1000}\]},
		{\\"Currency-Code\\": 35}
		\]}
\]";

$var(rc) = dm\_send\_request(42, 92001, $var(payload), $var(rpl\_avps));
xlog("rc: $var(rc), AVPs: $var(rpl\_avps)\\n");
$json(avps) := $var(rpl\_avps);

  

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

91

26

5928

960

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

12

9

235

36

3.

Larry Laffer

3

1

6

5

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

5

5

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

6.

Alexandra Titoc

2

1

7

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2023 - Aug 2025

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jul 2025 - Jul 2025

3.

Larry Laffer

Jul 2025 - Jul 2025

4.

Alexandra Titoc

Sep 2024 - Sep 2024

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

May 2021 - Feb 2024

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2021 [www.opensips-solutions.com](http://www.opensips-solutions.com/)