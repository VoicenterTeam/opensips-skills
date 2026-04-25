# msrp_gateway Module Reference
<!-- generated-from: data/3.5/modules/msrp_gateway.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 msrp_gateway module. Read this file when configuring or debugging the msrp_gateway module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements a Gateway for translating between Page Mode (SIP MESSAGE method) and Session Mode (MSRP) Instant Messaging.

The module makes use of the _msrp_ua_ module's API for the MSRP UAC/UAS functionalities.

## Dependencies

### OpenSIPs Modules

- `msrp_ua`
- `tm`

### External Libraries

None.

## Exported Parameters

### `cleanup_interval` (integer)

The interval between full iterations of the sessions table in order to clean up lingering sessions.

*Default value is 60.*

**Example.** 60.

```opensips
modparam("msrp_gateway", "cleanup_interval", 60)
```
### `hash_size` (integer)

The size of the hash table that stores the gateway session information. It is the 2 logarithmic value of the real size.

*Default value is 10.*

**Example.** 16.

```opensips
modparam("msrp_gateway", "hash_size", 16)
```
### `message_timeout` (integer)

Amount of time (in seconds) since last MESSAGE has been received after which a session should be terminated.

*Default value is 2 * 3600.*

**Example.** 3600.

```opensips
modparam("msrp_gateway", "message_timeout", 3600)
```
### `session_timeout` (integer)

Amount of time (in seconds) since last message has been received from either side, after which a session should be terminated.

*Default value is 12 * 3600.*

**Example.** 7200.

```opensips
modparam("msrp_gateway", "session_timeout", 7200)
```

## Exported Functions

### `msg_to_msrp(key, content_types)`

This functions translates a SIP MESSAGE request into a MSRP SEND request. The function will initialize a new gateway session and establish the MSRP side SIP session if it is not done so already by a previous call.

The SIP From, To, and RURI coordinates for the new MSRP side session are taken from the MESSAGE request and mirrored back when translating a MSRP SEND to SIP MESSAGE with _msrp_gw_answer_.

**Parameters:**

- `content_types` *(string, required)* — content types adevertised in the SDP offer on the MSRP side SIP session.
- `key` *(string, required)* — gateway session key to be used to correlate the MESSAGE requests with the MSRP side SIP session. A simple example would be to build this key based on the From and To URIs from both sides(from the initial MSRP leg INVITE and SIP MESSAGE requests respectively).

**Usable from:** REQUEST_ROUTE

**Related:**

- `msrp_gw_answer`

**Example.** msg_to_msrp() usage.

```opensips
...
if (is_method("MESSAGE")) {
	msg_to_msrp($var(corr_key), "text/plain");
	exit;
}
...
```

### `msrp_gw_answer(key, content_types, from, to, ruri)`

This functions initializes a new gateway session by answering an initial INVITE from the MSRP side SIP session. After running this function the call will be completely handled by the MSRP UA engine and MSRP SEND requests will be automatically translated to SIP MESSAGE requests.

The SIP From, To, and RURI coordinates for building MESSAGE requests are passed as parameters to the function.

**Parameters:**

- `content_types` *(string, required)* — content types adevertised in the SDP offer on the MSRP side SIP session.
- `from` *(string, required)* — From URI to be used for building SIP MESSAGE requests.
- `key` *(string, required)* — gateway session key to be used to correlate the MESSAGE requests with the MSRP side SIP session. A simple example would be to build this key based on the From and To URIs from both sides(from the initial MSRP leg INVITE and SIP MESSAGE requests respectively).
- `ruri` *(string, required)* — Request-URI to be used for building SIP MESSAGE requests.
- `to` *(string, required)* — To URI to be used for building SIP MESSAGE requests.

**Usable from:** REQUEST_ROUTE

**Example.** msrp_gw_answer() usage.

```opensips
...
if (!has_totag() && is_method("INVITE")) {
	msrp_gw_answer($var(corr_key), "text/plain", $fu, $tu, $ru);
	exit;
}
...
```

## Exported MI Functions

### `msrp_gw_end_session`

Terminate an ongoing session.

**Parameters:**

- `key` *(string, required)* — session key

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi msrp_gw_end_session alice@opensips.org-bob@opensips.org
```

### `msrp_gw_list_sessions`

Lists information about ongoing sessions.

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi msrp_gw_list_sessions
```

## Exported Events

### `E_MSRP_GW_SETUP_FAILED`

This event is triggered when the MSRP side SIP session fails to set up, when using the _msg_to_msrp()_ function.

The event can be used to generate a message with the failure description, back on the MESSAGE side.

**Parameters:**

- `key` *(string)* — The session key.
- `from_uri` *(string)* — The URI in the SIP From header to use on the MESSAGE side.
- `to_uri` *(string)* — The URI in the SIP To header to use on the MESSAGE side.
- `ruri` *(string)* — The SIP Request URI to use on the MESSAGE side.
- `code` *(integer)* — The SIP error code in the negative reply received on the MSRP side. Might be NULL if the MSRP UA session expired before receiving a negative reply.
- `reason` *(string)* — The SIP reason string in the negative reply received on the MSRP side. Might be NULL if the MSRP UA session expired before receiving a negative reply.

## Configuration Examples

### Set `hash_size` parameter

Set `hash_size` parameter

```opensips
...
modparam("msrp_gateway", "hash_size", 16)
...
```
### Set `cleanup_interval` parameter

Set `cleanup_interval` parameter

```opensips
...
modparam("msrp_gateway", "cleanup_interval", 60)
...
```
### Set `session_timeout` parameter

Set `session_timeout` parameter

```opensips
...
modparam("msrp_gateway", "session_timeout", 7200)
...
```
### Set `message_timeout` parameter

Set `message_timeout` parameter

```opensips
...
modparam("msrp_gateway", "message_timeout", 3600)
...
```
### `msrp_gw_answer()` usage

`msrp_gw_answer()` usage

```opensips
...
if (!has_totag() && is_method("INVITE")) {
	msrp_gw_answer($var(corr_key), "text/plain", $fu, $tu, $ru);
	exit;
}
...
```
### `msg_to_msrp()` usage

`msg_to_msrp()` usage

```opensips
...
if (is_method("MESSAGE")) {
	msg_to_msrp($var(corr_key), "text/plain");
	exit;
}
...
```
