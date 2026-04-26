# aaa_diameter Module Reference
<!-- generated-from: data/3.5/modules/aaa_diameter.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 aaa_diameter module. Read this file when configuring or debugging the aaa_diameter module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides an RFC 6733 Diameter peer implementation, being able to act as either **Diameter client** or **server**, or **both**.

Any module that wishes to use it has to do the following:

*   _include aaa.h_
    
*   _make a bind call with a proper Diameter-specific URL, e.g. "diameter:freeDiameter-client.conf"_

## How It Works

The module implements the core AAA OpenSIPS interface, thus offering an alternative client implementation to the [aaa_radius](aaa_radius) module which can be useful, for example, when performing billing and accounting for the live SIP calls.

In addition to the RADIUS client's auth and accounting features, the Diameter client includes support for sending _arbitrary_ Diameter requests, further opening up the scope of applications which can be achieved through OpenSIPS scripting. Such Diameter requests can be sent using the [dm_send_request()](#func_dm_send_request "1.6.1. dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])") function.

Starting with OpenSIPS **3.5**, the Diameter module includes _server-side_ support as well.

First, the [event_route](event_route) module must be loaded in order to be able to process [E_DM_REQUEST](#event_dm_request "1.8.1. E_DM_REQUEST") events in the OpenSIPS configuration file. These events will contain all necessary information on the incoming Diameter request.

Finally, once the request information is processed and the answer AVPs are prepared, script writers should use the [dm_send_answer()](#func_dm_send_answer "1.6.2. dm_send_answer(avps_json, [is_error])") function in order to reply with a Diameter answer message.

_Recommendation:_ When possible, always load the **dict_sip.fdx** freeDiameter extension module inside your _freeDiameter.conf_ configuration file, as it contains hundreds of well-known AVP definitions which may be good to have when inter-operating with other Diameter peer implementations.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libfdcore` — Required for Diameter message building, parsing, peer state machine and network communication (v1.2.1 or higher)
- `libfdproto` — Required for Diameter message building, parsing, peer state machine and network communication (v1.2.1 or higher)

### Optional Modules

- `dict_sip.fdx freeDiameter extension module (recommended for AVP definitions)`
- `event_route module (required for server-side support)`

## Exported Parameters

### `aaa_url` (string)

URL of the diameter client: the configuration file, with an optional extra-avps-file, where the Diameter client is configured. By default, the connection is not created.

**Example.** Set the `aaa_url` parameter.

```opensips
modparam("aaa_diameter", "aaa_url", "diameter:freeDiameter-client.conf")

modparam("aaa_diameter", "aaa_url", "diameter:freeDiameter-client.conf;extra-avps-file:dictionary.opensips")
```
### `answer_timeout` (integer)

Time, in milliseconds, after which a dm_send_request() function call with no received reply will time out and return a -2 code.

*Default value is 2000.*

**Example.** Set the `answer_timeout` parameter.

```opensips
modparam("aaa_diameter", "answer_timeout", 5000)
```
### `fd_log_level` (integer)

This parameter measures the quietness of the logging done by the freeDiameter library.

*Default value is 3.*

**Possible values:**

- 0 (ANNOYING)
- 1 (DEBUG)
- 3 (NOTICE)
- 5 (ERROR)
- 6 (FATAL)

**Notes:** NOTE: since freeDiameter logs to standard output, you must also enable the new core parameter, log_stdout, before getting any logs from the library.

**Example.** Set the `fd_log_level` parameter.

```opensips
modparam("aaa_diameter", "fd_log_level", 0)
```
### `peer_identity` (string)

The identity (realm subdomain) of the Diameter server peer, to which the OpenSIPS Diameter client peer will connect.

*Default value is server.*

**Example.** Set the `peer_identity` parameter.

```opensips
modparam("aaa_diameter", "peer_identity", "server")
```
### `realm` (string)

The unique realm to be used by all participating Diameter peers.

*Default value is diameter.test.*

**Example.** Set the `realm` parameter.

```opensips
modparam("aaa_diameter", "realm", "opensips.org")
```

## Exported Functions

### `dm_send_answer(avps_json, [is_error])`

Send back a Diameter answer message to the interconnected peer in a non-blocking fashion, in response to its request. The following fields will be automatically copied over from the Diameter request when building the answer message: Application ID, Command Code, Session-Id AVP, if any, Transaction-Id AVP, if any (only applies when Session-Id is not present)

**Parameters:**

- `avps_json` *(string, required)* — A JSON Array containing the AVPs to include in the answer message (example below).
- `is_error` *(boolean, optional)* — Set to true in order to set the 'E' (error) bit in the answer message.

**Return codes:**

- `1` — Success
- `-1` — Internal Error

**Usable from:** EVENT_ROUTE

**Example.** dm_send_answer() usage.

```opensips
event_route [E_DM_REQUEST] {
  xlog("Req: $param(sess_id) / $param(app_id) / $param(cmd_code)\n");
  xlog("AVPs: $param(avps_json)\n");

  $json(avps) := $param(avps_json);

  /* ... process the data (AVPs) ... */

  /* ... and reply back with more AVPs! */
  $var(ans_avps) = "[
          { \"Vendor-Specific-Application-Id\": [{
                  \"Vendor-Id\": 0
                  }] },

          { \"Result-Code\": 2001 },
          { \"Auth-Session-State\": 0 },
          { \"Origin-Host\": \"opensips.diameter.test\" },
          { \"Origin-Realm\": \"diameter.test\" }
  ]";

  if (!dm_send_answer($var(ans_avps)))
    xlog("ERROR - failed to send Diameter answer\n");
}
```

### `dm_send_request(app_id, cmd_code, avps_json, [rpl_avps_pv])`

Perform a blocking Diameter request over to the interconnected peer and return the Result-Code AVP value from the reply.

**Parameters:**

- `app_id` *(integer, required)* — ID of the application. A custom application must be defined in the dictionary.opensips Diameter configuration file before it can be recognized.
- `avps_json` *(string, required)* — A JSON Array containing the AVPs to include in the message.
- `cmd_code` *(integer, required)* — ID of the command. A custom command code, name and AVP requirements must be defined in the dictionary.opensips Diameter configuration file beforehand. body of the HTTP response.
- `rpl_avps_pv` *(var, optional)* — output variable which will hold all AVP names from the Diameter Answer along with their values, packed as a JSON Array string. The "json" module and its $json variable could be used to iterate this array.

**Return codes:**

- `1` — Success
- `-1` — Internal Error
- `-2` — Request timeout (the answer_timeout was exceeded before an Answer could be processed)

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** Example of defining custom Diameter AVPs, Application IDs, Requests and Replies in the "dictionary.opensips" file.

```opensips_conf
# Example of defining custom Diameter AVPs, Application IDs,
# Requests and Replies in the "dictionary.opensips" file

ATTRIBUTE out_gw            232 string
ATTRIBUTE trunk_id          233 string

ATTRIBUTE rated_duration    234 integer
ATTRIBUTE call_cost         235 integer

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
	out_gw | REQUIRED | 1
	call_cost | REQUIRED | 1
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
```

**Example.** Building an sending an My-Custom-Request (92001) for the My Diameter Application (42).

```opensips
# Building an sending an My-Custom-Request (92001) for the
# My Diameter Application (42)
$var(payload) = "[
	{ \"Origin-Host\": \"client.diameter.test\" },
	{ \"Origin-Realm\": \"diameter.test\" },
	{ \"Destination-Realm\": \"diameter.test\" },
	{ \"Sip-From-Tag\": \"dc93-4fba-91db\" },
	{ \"Sip-To-Tag\": \"ae12-47d6-816a\" },
	{ \"Acct-Session-Id\": \"a59c-dff0d9efd167\" },
	{ \"Sip-Call-Duration\": 6 },
	{ \"Sip-Call-Setuptime\": 1 },
	{ \"Sip-Call-Created\": 1652372541 },
	{ \"Sip-Call-MSDuration\": 5850 },
	{ \"out_gw\": \"GW-774\" },
	{ \"cost\": \"10.84\" },
	{ \"Cost-Information\": [
		{\"Unit-Value\": [{\"Value-Digits\": 1000}]},
		{\"Currency-Code\": 35}
		]}
]";

$var(rc) = dm_send_request(42, 92001, $var(payload), $var(rpl_avps));
xlog("rc: $var(rc), AVPs: $var(rpl_avps)\n");
$json(avps) := $var(rpl_avps);
```

## Exported Events

### `E_DM_REQUEST`

This event is raised whenever the aaa_diameter module is loaded and OpenSIPS receives a Diameter request on the configured Diameter listening interface.

**Parameters:**

- `app_id` *(integer)* — the Diameter Application Identifier
- `cmd_code` *(integer)* — the Diameter Command Code
- `sess_id` *(string)* — the value of either the Session-Id AVP, Transaction-Id AVP or a NULL value if neither of these transaction-identifying AVPs is present in the Diameter request.
- `avps_json` *(string)* — a JSON Array containing the AVPs of the request. Use the json module's $json variable to easily parse and work with it.

**Subscribe via:** event_route or any other EVI-compatible delivery channel

## Configuration Examples

### Setting the `fd_log_level` parameter

Setting the `fd_log_level` parameter

```opensips
modparam("aaa_diameter", "fd_log_level", 0)
```
### Setting the `realm` parameter

Setting the `realm` parameter

```opensips
modparam("aaa_diameter", "realm", "opensips.org")
```
### Setting the `peer_identity` parameter

Setting the `peer_identity` parameter

```opensips
modparam("aaa_diameter", "peer_identity", "server")
```
### Setting the `aaa_url` parameter

Setting the `aaa_url` parameter

```opensips
modparam("aaa_diameter", "aaa_url", "diameter:freeDiameter-client.conf")
```
### Setting the `aaa_url` parameter

Setting the `aaa_url` parameter with an extra AVPs file.

```opensips
modparam("aaa_diameter", "aaa_url", "diameter:freeDiameter-client.conf;extra-avps-file:dictionary.opensips")
```
### Setting the `answer_timeout` parameter

Setting the `answer_timeout` parameter

```opensips
modparam("aaa_diameter", "answer_timeout", 5000)
```
### `dictionary.opensips` extended syntax

`dictionary.opensips` extended syntax

```opensips
\# Example of defining custom Diameter AVPs, Application IDs,
# Requests and Replies in the "dictionary.opensips" file

ATTRIBUTE out_gw            232 string
ATTRIBUTE trunk_id          233 string

ATTRIBUTE rated_duration    234 integer
ATTRIBUTE call_cost         235 integer

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
	out_gw | REQUIRED | 1
	call_cost | REQUIRED | 1
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
```
### `dm_send_request` usage

`dm_send_request` usage

```opensips
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
	{ \\"out_gw\\": \\"GW-774\\" },
	{ \\"cost\\": \\"10.84\\" },
	{ \\"Cost-Information\\": \[
		{\\"Unit-Value\\": \[{\\"Value-Digits\\": 1000}\]},
		{\\"Currency-Code\\": 35}
		\]}
\]";

$var(rc) = dm_send_request(42, 92001, $var(payload), $var(rpl_avps));
xlog("rc: $var(rc), AVPs: $var(rpl_avps)\\n");
$json(avps) := $var(rpl_avps);
```
### `dm_send_answer()` usage

`dm_send_answer()` usage

```opensips
event_route \[E_DM_REQUEST\] {
  xlog("Req: $param(sess_id) / $param(app_id) / $param(cmd_code)\\n");
  xlog("AVPs: $param(avps_json)\\n");

  $json(avps) := $param(avps_json);

  /\* ... process the data (AVPs) ... \*/

  /\* ... and reply back with more AVPs! \*/
  $var(ans_avps) = "\[
          { \\"Vendor-Specific-Application-Id\\": \[{
                  \\"Vendor-Id\\": 0
                  \}] },

          { \\"Result-Code\\": 2001 },
          { \\"Auth-Session-State\\": 0 },
          { \\"Origin-Host\\": \\"opensips.diameter.test\\" },
          { \\"Origin-Realm\\": \\"diameter.test\\" }
  \]";

  if (!dm_send_answer($var(ans_avps)))
    xlog("ERROR - failed to send Diameter answer\\n");
}
```
### `dm_send_request` asynchronous usage

`dm_send_request` asynchronous usage

```opensips
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
	{ \\"out_gw\\": \\"GW-774\\" },
	{ \\"cost\\": \\"10.84\\" },
	{ \\"Cost-Information\\": \[
		{\\"Unit-Value\\": \[{\\"Value-Digits\\": 1000}\]},
		{\\"Currency-Code\\": 35}
		\]}
\]";

async(dm_send_request(42, 92001, $var(payload), $var(rpl_avps), dm_reply);

route\[dm_reply\] {
	xlog("rc: $retcode, AVPs: $var(rpl_avps)\\n");
	$json(avps) := $var(rpl_avps);
}
```
