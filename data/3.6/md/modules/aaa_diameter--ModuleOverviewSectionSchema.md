# AAA\_DIAMETER MODULE

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5742704)

2.2. [Most recently active contributors(1) to this module](#idp5822656)

**List of Examples**

1.1. [Setting the `fd_log_level` parameter](#idp5582336)

1.2. [Setting the `realm` parameter](#idp5586640)

1.3. [Setting the `peer_identity` parameter](#idp5591088)

1.4. [Setting the `aaa_url` parameter](#idp5595168)

1.5. [Setting the `aaa_url` parameter](#idp5596944)

1.6. [Setting the `answer_timeout` parameter](#idp5602576)

1.7. [`dictionary.opensips` extended syntax](#idp5619296)

1.8. [`dm_send_request` usage](#idp5622608)

1.9. [`dm_send_answer()` usage](#idp5647552)

1.10. [`dm_send_request` asynchronous usage](#idp5654704)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides an RFC 6733 Diameter peer implementation, being able to act as either **Diameter client** or **server**, or **both**.

Any module that wishes to use it has to do the following:

*   _include aaa.h_
    
*   _make a bind call with a proper Diameter-specific URL, e.g. "diameter:freeDiameter-client.conf"_
    

## 1.2.�Diameter Client

The module implements the core AAA OpenSIPS interface, thus offering an alternative client implementation to the [aaa\_radius](aaa_radius) module which can be useful, for example, when performing billing and accounting for the live SIP calls.

In addition to the RADIUS client's auth and accounting features, the Diameter client includes support for sending _arbitrary_ Diameter requests, further opening up the scope of applications which can be achieved through OpenSIPS scripting. Such Diameter requests can be sent using the [dm\_send\_request()](#func_dm_send_request "1.6.1.� dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])") function.

## 1.3.�Diameter Server

Starting with OpenSIPS **3.5**, the Diameter module includes _server-side_ support as well.

First, the [event\_route](event_route) module must be loaded in order to be able to process [E\_DM\_REQUEST](#event_dm_request "1.8.1.� E_DM_REQUEST") events in the OpenSIPS configuration file. These events will contain all necessary information on the incoming Diameter request.

Finally, once the request information is processed and the answer AVPs are prepared, script writers should use the [dm\_send\_answer()](#func_dm_send_answer "1.6.2.� dm_send_answer(avps_json, [is_error])") function in order to reply with a Diameter answer message.

_Recommendation:_ When possible, always load the **dict\_sip.fdx** freeDiameter extension module inside your _freeDiameter.conf_ configuration file, as it contains hundreds of well-known AVP definitions which may be good to have when inter-operating with other Diameter peer implementations.

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

None.

### 1.4.2.�External Libraries or Applications

All Diameter message building and parsing, as well as the peer state machine and Diameter-related network communication are all powered by [_the freeDiameter project_](http://www.freediameter.net/trac/) and C libraries, dynamically linking with the "aaa\_diameter" module.

The following libraries must be installed before running OpenSIPS with this module loaded:

*   _libfdcore_ v1.2.1 or higher
    
*   _libfdproto_ v1.2.1 or higher
    

## 1.5.�Exported Parameters

### 1.5.1.�`fd_log_level (integer)`

This parameter measures the _quietness_ of the logging done by the freeDiameter library. Possible values:

*   0 (ANNOYING)
    
*   1 (DEBUG)
    
*   3 (NOTICE, default)
    
*   5 (ERROR)
    
*   6 (FATAL)
    

NOTE: since freeDiameter logs to standard output, you must also enable the new core parameter, **log\_stdout**, before getting any logs from the library.

**Example�1.1.�Setting the `fd_log_level` parameter**

modparam("aaa\_diameter", "fd\_log\_level", 0)

  

### 1.5.2.�`realm (string)`

The unique realm to be used by all participating Diameter peers.

Default value is _"diameter.test"_.

**Example�1.2.�Setting the `realm` parameter**

modparam("aaa\_diameter", "realm", "opensips.org")

  

### 1.5.3.�`peer_identity (string)`

The identity (realm subdomain) of the Diameter server peer, to which the OpenSIPS Diameter client peer will connect.

Default value is _"server"_ (i.e. "server.diameter.test").

**Example�1.3.�Setting the `peer_identity` parameter**

modparam("aaa\_diameter", "peer\_identity", "server")

  

### 1.5.4.�`aaa_url (string)`

URL of the diameter client: the configuration file, with an optional extra-avps-file, where the Diameter client is configured.

By default, the connection is not created.

**Example�1.4.�Setting the `aaa_url` parameter**

modparam("aaa\_diameter", "aaa\_url", "diameter:freeDiameter-client.conf")

  

**Example�1.5.�Setting the `aaa_url` parameter**

with an extra AVPs file.

modparam("aaa\_diameter", "aaa\_url", "diameter:freeDiameter-client.conf;extra-avps-file:dictionary.opensips")

  

### 1.5.5.�`answer_timeout (integer)`

Time, in milliseconds, after which a [dm\_send\_request()](#func_dm_send_request "1.6.1.� dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])") function call with no received reply will time out and return a **\-2** code.

Default value is _2000_ ms.

**Example�1.6.�Setting the `answer_timeout` parameter**

modparam("aaa\_diameter", "answer\_timeout", 5000)

  

## 1.6.�Exported Functions

### 1.6.1.� `dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])`

Perform a blocking Diameter request over to the interconnected peer and return the Result-Code AVP value from the reply.

_Parameters_

*   _app\_id_ (integer) - ID of the application. A custom application must be defined in the dictionary.opensips Diameter configuration file before it can be recognized.
    
*   _cmd\_code_ (integer) - ID of the command. A custom command code, name and AVP requirements must be defined in the dictionary.opensips Diameter configuration file beforehand. body of the HTTP response.
    
*   _avps\_json_ (string) - A JSON Array containing the AVPs to include in the message.
    
*   _rpl\_avps\_pv_ (var, optional) - output variable which will hold all AVP names from the Diameter Answer along with their values, packed as a JSON Array string. The "json" module and its _$json_ variable could be used to iterate this array.
    

_Return Codes_

*   **1** - Success
    
*   **\-1** - Internal Error
    
*   **\-2** - Request timeout (the [answer\_timeout](#param_answer_timeout "1.5.5.�answer_timeout (integer)") was exceeded before an Answer could be processed)
    

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

  

### 1.6.2.� `dm_send_answer(avps_json, [is_error])`

Send back a Diameter answer message to the interconnected peer in a _non-blocking_ fashion, in response to its request.

The following fields will be automatically copied over from the Diameter request when building the answer message:

*   Application ID
    
*   Command Code
    
*   Session-Id AVP, if any
    
*   Transaction-Id AVP, if any (only applies when Session-Id is not present)
    

_Parameters_

*   _avps\_json_ (string) - A JSON Array containing the AVPs to include in the answer message (example below).
    
*   _is\_error_ (boolean, default: _false_) - Set to _true_ in order to set the 'E' (error) bit in the answer message.
    

_Return Codes_

*   **1** - Success
    
*   **\-1** - Internal Error
    

This function can only be used from an _EVENT\_ROUTE_.

**Example�1.9.�`dm_send_answer()` usage**

event\_route \[E\_DM\_REQUEST\] {
  xlog("Req: $param(sess\_id) / $param(app\_id) / $param(cmd\_code)\\n");
  xlog("AVPs: $param(avps\_json)\\n");

  $json(avps) := $param(avps\_json);

  /\* ... process the data (AVPs) ... \*/

  /\* ... and reply back with more AVPs! \*/
  $var(ans\_avps) = "\[
          { \\"Vendor-Specific-Application-Id\\": \[{
                  \\"Vendor-Id\\": 0
                  }\] },

          { \\"Result-Code\\": 2001 },
          { \\"Auth-Session-State\\": 0 },
          { \\"Origin-Host\\": \\"opensips.diameter.test\\" },
          { \\"Origin-Realm\\": \\"diameter.test\\" }
  \]";

  if (!dm\_send\_answer($var(ans\_avps)))
    xlog("ERROR - failed to send Diameter answer\\n");
}

  

## 1.7.�Exported Asyncronous Functions

### 1.7.1.� `dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])`

Similar to [dm\_send\_request()](#func_dm_send_request "1.6.1.� dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])") but performs an asynchronous Diameter request.

Uses the same parameters and return codes as [dm\_send\_request()](#func_dm_send_request "1.6.1.� dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])").

**Example�1.10.�`dm_send_request` asynchronous usage**

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

async(dm\_send\_request(42, 92001, $var(payload), $var(rpl\_avps), dm\_reply);

route\[dm\_reply\] {
	xlog("rc: $retcode, AVPs: $var(rpl\_avps)\\n");
	$json(avps) := $var(rpl\_avps);
}

  

## 1.8.�Exported Events

### 1.8.1.� `E_DM_REQUEST`

This event is raised whenever the _aaa\_diameter_ module is loaded and OpenSIPS receives a Diameter request on the configured Diameter listening interface.

Parameters:

*   _app\_id (integer)_ - the Diameter Application Identifier
    
*   _cmd\_code (integer)_ - the Diameter Command Code
    
*   _sess\_id (string)_ - the value of either the _Session-Id_ AVP, _Transaction-Id_ AVP or a _NULL_ value if neither of these transaction-identifying AVPs is present in the Diameter request.
    
*   _avps\_json (string)_ - a JSON Array containing the AVPs of the request. Use the [json](json) module's **$json** variable to easily parse and work with it.
    

Note that this event is currently designed to be mainly consumed by an _event\_route_, since that is the only way to gain access to the [dm\_send\_answer()](#func_dm_send_answer "1.6.2.� dm_send_answer(avps_json, [is_error])") function in order to build custom answer messages. On the other hand, if the application does not mind the answer being always a 3001 (DIAMETER\_COMMAND\_UNSUPPORTED) error, this event can be successfully consumed through any other EVI-compatible delivery channel ☺️

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

114

37

6850

1105

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

39

22

1426

253

3.

Alexandra Titoc

6

4

11

2

4.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

2

2

5.

Larry Laffer

3

1

6

5

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

3

1

5

5

  

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

May 2023 - Jan 2026

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jul 2024 - Jul 2025

3.

Larry Laffer

Jul 2025 - Jul 2025

4.

Alexandra Titoc

Sep 2024 - Sep 2024

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

May 2021 - Mar 2024

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2021 [www.opensips-solutions.com](http://www.opensips-solutions.com/)