# siprec Module Reference
<!-- generated-from: data/3.6/modules/siprec.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 siprec module. Read this file when configuring or debugging the siprec module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides the means to do calls recording using an external recorder - the entity that records the call is not in the media path between the caller and callee, but it is completely separate, thus it can not affect by any means the quality of the conversation. This is done in a standardized manner, using the [SIPREC Protocol](https://tools.ietf.org/html/rfc7866), thus it can be used by any recorder that implements this protocol.

Since an external server is used to record calls, there are no constraints regarding the location of the recorder, thus it can be placed arbitrary. This offers huge flexibility to your architecture configuration and various means for scaling.

The work for this module has been sponsored by the [OrecX Company](http://www.orecx.com/). This module is fully integrated with the OrecX Call Recording products.

## How It Works

The full architecture of a SIP Media Recording platform is documented in [RFC 7245](https://tools.ietf.org/html/rfc7245). According to this architecture, this OpenSIPS module implements a SRC (Session Recording Client) that instructs a SRS (Session Recording Server) when new calls are started, the participants of the calls and their profiles. Based on this data, the SRS can decide whether the call should be recorded or not.

From SIP signalling perspective, the module does not change the call flow between the caller and callee. The call is established just as any other calls that are not recorded. But for each call that has _SIPREC_ engaged, a completely separate SIP session is started by the SRC (OpenSIPS) towards the SRS, using the [OpenSIPS Back-2-Back module](b2b_entities). The _INVITE_ message sent to the SRS contains a multi-part body consisting of two parts:

*   _Recording SDP_ - the SDP of the Media Server that will _fork_ the RTP to the recorder.
    
*   _Participants Metadata_ - an XML-formatted document that contains information about the participants. The structure of the document is detailed in [RFC 7865](https://tools.ietf.org/html/rfc7865).
    
The SRS can respond with negative reply, indicating that the session does not need to be recorded, or with a positive reply (200 OK), indicating in the SDP body where the media RTP should be _sent/forked_. When the call ends, the SRC must send a _BYE_ message to the SRS, indicating that the recording should be completed.

Full examples of call flows can be found in [RFC 8068](https://tools.ietf.org/html/rfc8068).

## Dependencies

### OpenSIPs Modules

- `B2B_ENTITIES` — Back-2-Back module used for communicating with the SRS.
- `Dialog` — Dialog module for keeping track of the call.
- `RTP_Relay` — RTP Relay module used for controlling the Media Servers that will fork the media.
- `TM` — Transaction module.

### External Libraries

None.

## Exported Parameters

### `skip_failover_codes` (string)

A regular expression used to specify the codes that should prevent the module from failing over to a new SRS server.

_By default any negative reply generates a failover._

**Example.** 408.

```opensips
# do not failover on 408 reply codes
modparam("siprec", "skip\_failover\_codes", "408")

# do not failover on 408 or 487 reply codes
modparam("siprec", "skip\_failover\_codes", "408|487")

# do not failover on any 3xx or 4xx reply code
modparam("siprec", "skip\_failover\_codes", "\[34\]\[0-9\]\[0-9\]")
```

## Exported Functions

### `siprec_pause_recording([instance])`

Pauses the recording for the ongoing call. Should be called after the dialog has matched.

**Parameters:**

- `instance` *(string, optional)* — used to pause a particular SIPREC instance. When missing, the default instance is paused.

**Usable from:** any route

**Example.** Use `siprec_pause_recording()`.

```opensips
	...
	if (has_totag() && is_method("INVITE")) {
		if (is_audio_on_hold())
			siprec_pause_recording();
	}
	...
```

### `siprec_resume_recording([instance])`

Resumes the recording for the ongoing call. Should be called after the dialog has matched.

**Parameters:**

- `instance` *(string, optional)* — used to resume a particular SIPREC instance. When missing, the default instance is resumed.

**Usable from:** any route

**Example.** Use `siprec_resume_recording()`.

```opensips
	...
	if (has_totag() && is_method("INVITE")) {
		if (!is_audio_on_hold())
			siprec_resume_recording();
	}
	...
```

### `siprec_send_indialog([hdrs[, body]])`

Sends an arbitrary in-dialog request to the SRS.

**Parameters:**

- `body` *(string, optional)* — the body that will be added to the generated request.
- `headers` *(string, optional)* — a set of headers that will be added to the generated request.
- `instance` *(string, optional)* — used to send a request within a particular SIPREC instance. When missing, the request is sent in to the default instance.

**Usable from:** any route

**Example.** Use `siprec_send_indialog()`.

```opensips
	...
	if (has_totag() && is_method("INFO")) {
		siprec_send_indialog("Content-Type: $hdr(Content-Type)\r\n", $rb);
	}
	...
```

### `siprec_start_recording(srs[, instance])`

Calling this function on an initial INVITE engages call recording to SRS(s) for that call. Note that it does not necessary mean that the call will be recorded - it just means that OpenSIPS will query instruct the SRS that a new call has started, but the SRS might decide that the recording is disabled for those participants.

Note that the call recording is not started right away, but only when the callee provides an SDP as well (usually in a 200 OK, or possibly a 183 Ringing).

Note if you only want to start recording when the call is established (200 OK is received), then you should call this function in the onreply route processing that 200 OK.

**Parameters:**

- `instance` *(string, optional)* — used to start a particular SIPREC instance. When missing, the default instance is started.
- `srs` *(string, required)* — a comma-separated list of SRS URIs. These URIs are used in the order specified. See siprec_srs_failover for more information.

**Return codes:**

- `false` — internal error triggered and the call recording setup fails
- `true` — all the internal mechanisms are activated

**Usable from:** REQUEST_ROUTE

**Example.** Use `siprec_start_recording()` function with a single SRS.

```opensips
	...
	if (!has_totag() && is_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1";
		xlog("Engage SIPREC call recording to $var(srs) for $ci\n");
		siprec_start_recording($var(srs));
	}
	...
```

**Example.** Use `siprec_start_recording()` function with multiple SRS servers.

```opensips
	...
	if (!has_totag() && is_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1, sip:127.0.0.1;transport=TCP";
		xlog("Engage SIPREC call recording to servers $var(srs) for $ci in inbound group\n");
		siprec_start_recording($var(srs), "inbound");
	}
	...
```

**Example.** Use `siprec_start_recording()` function with custom XML values for participants.

```opensips
	...
	$xml(caller_xml) = "<nameID></nameID>";
	$xml(caller_xml/nameID.attr/aor) = "sip:6024151234@10.0.0.11:5090";
	$xml(caller_xml/nameID) = "<name>test</name>";
	$siprec(caller) = $xml(caller_xml/nameID);
	siprec_start_recording($var(srs));
	...
```

**Example.** Use `siprec_start_recording()` function with custom headers.

```opensips
	...
	$siprec(headers) = "X-MY-CUSTOM_HDR: 1\r\n";
	siprec_start_recording($var(srs));
	...
```

**Example.** Use `siprec_start_recording()` function with custom group and session extensions.

```opensips
	...
	$var(temp) = "<callcenterID> 17</callcenterID>";
	$siprec(group_custom_extension) = $var(temp);
	$siprec(session_custom_extension) = "<callcenterCode>dfgh3q45gsdfty5</callcenterCode>";

	siprec_start_recording($var(srs));
	...
```

### `siprec_stop_recording([instance])`

Stops the recording for the ongoing call. Should be called for SIPREC sessions that have been previously started.

**Parameters:**

- `instance` *(string, optional)* — used to stop a particular SIPREC instance. When missing, the default instance is stopped.

**Usable from:** any route

**Example.** Use `siprec_stop_recording()`.

```opensips
	...
	if (has_totag() && is_method("INVITE")) {
		if (is_audio_on_hold())
			siprec_stop_recording();
	}
	...
```

## Exported Pseudo-Variables

### `$siprec`

Used to modify/describe different siprec sessions parameters that should be taken into account by the siprec_start_recording() function. The variable can be indexed with the instance the user wants to tune the variable for. If missing, the the default instance is being altered. The context of this variable is only limited to the current message processed - it is not available at the transaction or dialog level. Any of this setting is optional. Settings that can be provisioned: group - an opaque value that will be inserted in the SIPREC body and represents the name of the group that can be used to classify calls in certain profiles. If missing, no group is added. caller - an XML block containing information about the caller. If absent, the From header of the initial dialog is used to build the value. callee - an XML block containing information about the callee. If absent, the To header of the initial dialog is used to build the value. media - the IP that RTPProxy will be streaming media from. If absent 127.0.0.1 will be used. NOTE: media_ip has been dropped. headers - extra headers that are to be added in the initial request towards the SRS. NOTE: headers must be separated by \r\n and must end with \r\n. socket - listening socket that the outgoing request towards SRS should be used. from_uri - the URI to appear in the From header of the dialog. Default value is the request URI. Note that this does not influence the caller information in the XML block, which is taken from the initial dialog. to_uri - the URI to appear in the To header of the dialog. Default value is the request URI. Note that this does not influence the callee information in the XML block, which is taken from the initial dialog. group_custom_extension - an optional XML block containing custom information to be added under the group tag. NOTE: if the group is absent this value will be ignored and not used anywhere. session_custom_extension - an optional XML block containing custom information to be added under the session tag.

- **Type:** string
- **Read/write:** read-write
- **Scope:** message

**Possible values:**

- group
- caller
- callee
- media
- headers
- socket
- from_uri
- to_uri
- group_custom_extension
- session_custom_extension

## Exported Events

### `E_SIPREC_START`

This event is raised when a SIPREC call is established and a call starts to be recorded.

**Parameters:**

- `dlg_id` *(string)* — dialog id (“did”) of the call being recorded;
- `dlg_callid` *(string)* — Call-Id of the call being recorded;
- `callid` *(string)* — Call-Id (B2B id) of the SIPREC call;
- `session_id` *(string)* — SIPREC UUID of the recording call;
- `server` *(string)* — the SIPREC server handing this call;
- `instance` *(string)* — the SIPREC instance this event is triggered for;
### `E_SIPREC_STOP`

This event is raised when a SIPREC call is terminated.

**Parameters:**

- `dlg_id` *(string)* — dialog id (“did”) of the call being recorded;
- `dlg_callid` *(string)* — Call-Id of the call being recorded;
- `callid` *(string)* — Call-Id (B2B id) of the SIPREC call;
- `session_id` *(string)* — SIPREC UUID of the recording call;
- `server` *(string)* — the SIPREC server handing this call;
- `instance` *(string)* — the SIPREC instance this event is triggered for;

## Configuration Examples

### Set `skip_failover_codes` parameter

Set `skip_failover_codes` parameter

```opensips
...
# do not failover on 408 reply codes
modparam("siprec", "skip\_failover\_codes", "408")

# do not failover on 408 or 487 reply codes
modparam("siprec", "skip\_failover\_codes", "408|487")

# do not failover on any 3xx or 4xx reply code
modparam("siprec", "skip\_failover\_codes", "\[34\]\[0-9\]\[0-9\]")
...
```
### Use `siprec_start_recording()` function with a single SRS

Use `siprec_start_recording()` function with a single SRS

```opensips
	...
	if (!has\_totag() && is\_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1";
		xlog("Engage SIPREC call recording to $var(srs) for $ci\\n");
		siprec\_start\_recording($var(srs));
	}
	...
```
### Use `siprec_start_recording()` function with multiple SRS servers

Use `siprec_start_recording()` function with multiple SRS servers

```opensips
	...
	if (!has\_totag() && is\_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1, sip:127.0.0.1;transport=TCP";
		xlog("Engage SIPREC call recording to servers $var(srs) for $ci in inbound group\\n");
		siprec\_start\_recording($var(srs), "inbound");
	}
	...
```
### Use `siprec_start_recording()` function with custom XML values for participants

Use `siprec_start_recording()` function with custom XML values for participants

```opensips
	...
	$xml(caller\_xml) = "<nameID></nameID>";
	$xml(caller\_xml/nameID.attr/aor) = "sip:6024151234@10.0.0.11:5090";
	$xml(caller\_xml/nameID) = "<name>test</name>";
	$siprec(caller) = $xml(caller\_xml/nameID);
	siprec\_start\_recording($var(srs));
	...
```
### Use `siprec_start_recording()` function with custom headers

Use `siprec_start_recording()` function with custom headers

```opensips
	...
	$siprec(headers) = "X-MY-CUSTOM\_HDR: 1\\r\\n";
	siprec\_start\_recording($var(srs));
	...
```
### Use `siprec_start_recording()` function with custom group and session extensions

Use `siprec_start_recording()` function with custom group and session extensions

```opensips
	...
	$var(temp) = "<callcenterID> 17</callcenterID>";
	$siprec(group\_custom\_extension) = $var(temp);
	$siprec(session\_custom\_extension) = "<callcenterCode>dfgh3q45gsdfty5</callcenterCode>";

	siprec\_start\_recording($var(srs));
	...
```
### Use `siprec_pause_recording()`

Use `siprec_pause_recording()`

```opensips
	...
	if (has\_totag() && is\_method("INVITE")) {
		if (is\_audio\_on\_hold())
			siprec\_pause\_recording();
	}
	...
```
### Use `siprec_resume_recording()`

Use `siprec_resume_recording()`

```opensips
	...
	if (has\_totag() && is\_method("INVITE")) {
		if (!is\_audio\_on\_hold())
			siprec\_resume\_recording();
	}
	...
```
### Use `siprec_stop_recording()`

Use `siprec_stop_recording()`

```opensips
	...
	if (has\_totag() && is\_method("INVITE")) {
		if (is\_audio\_on\_hold())
			siprec\_stop\_recording();
	}
	...
```
### Use `siprec_send_indialog()`

Use `siprec_send_indialog()`

```opensips
	...
	if (has\_totag() && is\_method("INFO")) {
		siprec\_send\_indialog("Content-Type: $hdr(Content-Type)\\r\\n", $rb);
	}
	...
```
