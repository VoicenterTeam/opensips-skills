# msrp_ua Module Reference
<!-- generated-from: data/3.4/modules/msrp_ua.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 msrp_ua module. Read this file when configuring or debugging the msrp_ua module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements an User Agent capable of establishing messaging sessions using the MSRP(RFC 4976) protocol.

Through an internal API and exported script and MI functions, the module allows OpenSIPS to set up MSRP sessions via SIP and exchange messages as an MSRP endpoint.

The module makes use of the _proto_msrp_ module for the MSRP protocol stack and the _b2b_entities_ module for the SIP UAC/UAS functionalities.

## How It Works

In order to start a SIP call carying MSRP from OpenSIPS you can use the [msrp_ua_start_session](#mi_msrp_ua_start_session "1.6.2. msrp_ua_start_session") MI function. Alternatively, to answer a SIP session with MSRP you can use the [msrp_ua_answer()](#func_msrp_ua_answer "1.5.1. msrp_ua_answer(content_types)") script function.

When a UAC or UAS session is successfully established(ACK sent/received) the [E_MSRP_SESSION_NEW](#event_E_MSRP_SESSION_NEW "1.7.1. E_MSRP_SESSION_NEW") event is triggered. After this point, you may receive MSRP messages or Reports, signaled by the [E_MSRP_MSG_RECEIVED](#event_E_MSRP_MSG_RECEIVED "1.7.3. E_MSRP_MSG_RECEIVED") and [E_MSRP_REPORT_RECEIVED](#event_E_MSRP_REPORT_RECEIVED "1.7.4. E_MSRP_REPORT_RECEIVED") events.

Note that the _E_MSRP_REPORT_RECEIVED_ event covers both actual MSRP REPORT requests as well as negative MSRP transaction responses and local send timeouts(which should be treated the same as a received timeout transaction response).

You can send MSRP messages to the peer with the [msrp_ua_send_message](#mi_msrp_ua_send_message "1.6.1. msrp_ua_send_message") MI function.

## Dependencies

### OpenSIPs Modules

- `b2b_entities`
- `proto_msrp`

### External Libraries

None.

## Exported Parameters

### `advertised_contact` (string)

Contact to be used in the generated SIP requests. For sessions answered by OpenSIPS, if it is not set, it is constructed dynamically from the socket where the initiating request was received. This parameter is mandatory when using the msrp_ua_start_session MI function.

**Example.** sip:oss@opensips.org.

```opensips
modparam("msrp_ua", "advertised_contact", "sip:oss@opensips.org")
```
### `cleanup_interval` (integer)

The interval between full iterations of the sessions table in order to clean up expired MSRP sessions.

*Default value is 60.*

**Example.** 30.

```opensips
modparam("msrp_ua", "cleanup_interval", 30)
```
### `hash_size` (integer)

The size of the hash table that stores the MSRP session information. It is the 2 logarithmic value of the real size.

*Default value is 10.*

**Example.** 16.

```opensips
modparam("msrp_ua", "hash_size", 16)
```
### `max_duration` (integer)

The maximum duration of a call. If set to 0, there will be no limitation.

*Default value is 12 * 3600 seconds (12 hours).*

**Example.** 7200.

```opensips
modparam("msrp_ua", "max_duration", 7200)
```
### `my_uri` (string)

The MSRP URI of the OpenSIPS endpoint. This URI will be advertised in the SDP offer provided to peers when setting up a session and should match one of the MSRP listeners defined in the script. The _session-id_ part of the URI should be ommited. If the port is not set explicitly, the default value of 2855 wil be assumed

**Example.** msrp://opensips.org:2855;tcp.

```opensips
modparam("msrp_ua", "my_uri", "msrp://opensips.org:2855;tcp")
```
### `relay_uri` (string)

URI of an MSRP relay to use for both accepted and initiated sessions. Credentials for the MSRP client are provided via the _uac_auth_ module by setting the _credential_ module parameter. If not set, no relay will be used.

**Example.** msrp://opensips.org:2856;tcp.

```opensips
modparam("msrp_ua", "relay_uri", "msrp://opensips.org:2856;tcp")
```

## Exported Functions

### `msrp_ua_answer(content_types)`

This functions answers an initial INVITE offering a new MSRP messaging session. After this function is used to initialize the session, the call will be completely handled by the B2B engine.

**Parameters:**

- `content_types` *(string, required)* — content types adevertised in the accept-types SDP attribute. At least one of the content types in this list must match the types offered by the peer in its SDP offer.

**Usable from:** REQUEST_ROUTE

**Example.** `msrp_ua_answer()` usage.

```opensips
...
if (!has_totag() && is_method("INVITE")) {
	msrp_ua_answer("text/plain");
	exit;
}
...
```

## Exported MI Functions

### `msrp_ua_end_session`

Terminate an ongoing MSRP session.

**Parameters:**

- `session_id` *(string, required)* — the MSRP session identifier ("session-id" part of the MSRP URI).

**Example.**

```bash
opensips-cli -x mi msrp_ua_end_session \
	5addd9e7b74fa44fbace68a4fc562293
```

### `msrp_ua_list_sessions`

Lists information about ongoing MSRP sessions.

**Example.**

```bash
opensips-cli -x mi msrp_ua_list_sessions
```

### `msrp_ua_send_message`

Sends a new MSRP message to the peer.

**Parameters:**

- `body` *(string, optional)* — actual message body. If missing, an empty message will be sent.
- `failure_report` *(string, optional)* — string indicating whether to request an MSRP Failure Report. Possible values are yes, no or partial, as specified in MSRP. If the parameter is missing or is set to "yes" the SEND request will not include a Failure-Report header. Note that if the header field is not present, the receving MSRP endpoint must treat it the same as a Failure-Report header with a value of "yes".
- `mime` *(string, optional)* — MIME content type of this message. If missing, an empty message will be sent.
- `session_id` *(string, required)* — the MSRP session identifier ("session-id" part of the MSRP URI).
- `success_report` *(string, optional)* — string indicating whether to request an MSRP Success Report. Possible values are yes or no. If the parameter is missing or is set to "no" the SEND request will not include a Success-Report header.

**Example.**

```bash
opensips-cli -x mi msrp_ua_send_message \
	session_id=5addd9e7b74fa44fbace68a4fc562293 \
	mime=text/plain body=Hello success_report=yes
```

### `msrp_ua_start_session`

Starts a MSRP session.

The advertised_contact is mandatory if this function is used.

**Parameters:**

- `content_types` *(string, required)* — content types adevertised in the accept-types SDP attribute.
- `from_uri` *(string, required)* — From URI to be used in the INVITE.
- `ruri` *(string, required)* — Request URI and destination of the INVITE.
- `to_uri` *(string, required)* — To URI to be used in the INVITE.

**Example.**

```bash
opensips-cli -x mi msrp_ua_start_session \
	text/plain sip:oss@opensips.org \
	sip:alice@opensips.org sip:alice@opensips.org
```

## Exported Events

### `E_MSRP_MSG_RECEIVED`

This event is triggered when receiving a new, non-empty MSRP SEND request from the peer.

**Parameters:**

- `session_id` *(string)* — The MSRP session identifier ("session-id" part of the MSRP URI).
- `content_type` *(string)* — The content type of this message.
- `body` *(string)* — The actual message body.
### `E_MSRP_REPORT_RECEIVED`

This event is triggered when:
* a MSRP REPORT request is received
* a failure transaction response is received
* a local timeout for a SEND request occured.

**Parameters:**

- `session_id` *(string)* — The MSRP session identifier ("session-id" part of the MSRP URI).
- `message_id` *(string)* — The value of the Message-ID header field.
- `status` *(string)* — The value of the Status header field.
- `byte_range` *(string)* — The value of the Byte-Range header field.
### `E_MSRP_SESSION_END`

This event is triggered when an ongoing MSRP session is terminted (session expires or BYE is received; terminating a session via the _msrp_ua_end_session_ MI function is not included).

**Parameters:**

- `session_id` *(string)* — The MSRP session identifier ("session-id" part of the MSRP URI).
### `E_MSRP_SESSION_NEW`

This event is triggered when a new MSRP session is successfully established(ACK sent/received).

**Parameters:**

- `from_uri` *(string)* — The URI in the SIP From header of the answered INVITE.
- `to_uri` *(string)* — The URI in the SIP To header of the answered INVITE.
- `ruri` *(string)* — The SIP Request URI of the answered INVITE.
- `session_id` *(string)* — The MSRP session identifier ("session-id" part of the MSRP URI).
- `content_types` *(string)* — The content types offered by the peer in the _accept-types_ SDP attribute.

## Configuration Examples

### Set `hash_size` parameter

The size of the hash table that stores the MSRP session information. It is the 2 logarithmic value of the real size.

```opensips
...
modparam("msrp_ua", "hash_size", 16)
...
```
### Set `cleanup_interval` parameter

The interval between full iterations of the sessions table in order to clean up expired MSRP sessions.

```opensips
...
modparam("msrp_ua", "cleanup_interval", 30)
...
```
### max_duration parameter example

The maximum duration of a call. If set to 0, there will be no limitation.

```opensips
...
modparam("msrp_ua", "max_duration", 7200)
...
```
### `my_uri` parameter usage

The MSRP URI of the OpenSIPS endpoint. This URI will be advertised in the SDP offer provided to peers when setting up a session and should match one of the MSRP listeners defined in the script.

```opensips
...
modparam("msrp_ua", "my_uri", "msrp://opensips.org:2855;tcp")
...
```
### `advertised_contact` parameter usage

Contact to be used in the generated SIP requests. For sessions answered by OpenSIPS, if it is not set, it is constructed dynamically from the socket where the initiating request was received.

```opensips
...
modparam("msrp_ua", "advertised_contact", "sip:oss@opensips.org")
...
```
### `relay_uri` parameter usage

URI of an MSRP relay to use for both accepted and initiated sessions.

```opensips
...
modparam("msrp_ua", "relay_uri", "msrp://opensips.org:2856;tcp")
...
```
### `msrp_ua_answer()` usage

This functions answers an initial INVITE offering a new MSRP messaging session. After this function is used to initialize the session, the call will be completely handled by the B2B engine.

```opensips
...
if (!has_totag() && is_method("INVITE")) {
	msrp_ua_answer("text/plain");
	exit;
}
...
```
