# siprec Module Reference
<!-- generated-from: data/3.4/modules/siprec.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 siprec module. Read this file when configuring or debugging the siprec module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides the means to do calls recording using an external recorder - the entity that records the call is not in the media path between the caller and callee, but it is completely separate, thus it can not affect by any means the quality of the conversation. This is done in a standardized manner, using the [SIPREC Protocol](https://tools.ietf.org/html/rfc7866), thus it can be used by any recorder that implements this protocol.

Since an external server is used to record calls, there are no constraints regarding the location of the recorder, thus it can be placed arbitrary. This offers huge flexibility to your architecture configuration and various means for scaling.

The work for this module has been sponsored by the [OrecX Company](http://www.orecx.com/). This module is fully integrated with the OrecX Call Recording products.

## How It Works

The full architecture of a SIP Media Recording platform is documented in [RFC 7245](https://tools.ietf.org/html/rfc7245). According to this architecture, this OpenSIPS module implements a SRC (Session Recording Client) that instructs a SRS (Session Recording Server) when new calls are started, the participants of the calls and their profiles. Based on this data, the SRS can decide whether the call should be recorded or not.

From SIP signalling perspective, the module does not change the call flow between the caller and callee. The call is established just as any other calls that are not recorded. But for each call that has _SIPREC_ engaged, a completely separate SIP session is started by the SRC (OpenSIPS) towards the SRS, using the [OpenSIPS Back-2-Back module](b2b_entities). The _INVITE_ message sent to the SRS contains a multi-part body consisting of two parts:

* _Recording SDP_ - the SDP of the Media Server that will _fork_ the RTP to the recorder.

* _Participants Metadata_ - an XML-formatted document that contains information about the participants. The structure of the document is detailed in [RFC 7865](https://tools.ietf.org/html/rfc7865).

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
...
# do not failover on 408 reply codes
modparam("siprec", "skip_failover_codes", "408")

# do not failover on 408 or 487 reply codes
modparam("siprec", "skip_failover_codes", "408|487")

# do not failover on any 3xx or 4xx reply code
modparam("siprec", "skip_failover_codes", "\[34\]\[0-9\]\[0-9\]")
...
```

## Exported Functions

### `siprec_pause_recording()`

Pauses the recording for the ongoing call. Should be called after the dialog has matched.

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

### `siprec_resume_recording()`

Resumes the recording for the ongoing call. Should be called after the dialog has matched.

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

### `siprec_start_recording(srs)`

Calling this function on an initial INVITE engages call recording to SRS(s) for that call. Note that it does not necessary mean that the call will be recorded - it just means that OpenSIPS will query instruct the SRS that a new call has started, but the SRS might decide that the recording is disabled for those participants.

Note that the call recording is not started right away, but only when the callee provides an SDP as well (usually in a 200 OK, or possibly a 183 Ringing).

Note if you only want to start recording when the call is established (200 OK is received), then you should call this function in the onreply route processing that 200 OK.

**Parameters:**

- `srs` *(string, required)* — a comma-separated list of SRS URIs. These URIs are used in the order specified. See siprec_srs_failover for more information.

**Return codes:**

- `true` — if all the internal mechanisms are activated
- `false` — when an internal error is triggered and the call recording setup fails

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

## Exported Pseudo-Variables

### `$siprec`

Used to modify/describe different siprec sessions parameters that should be taken into account by the siprec_start_recording() function.

The context of this variable is only limited to the current message processed - it is not available at the transaction or dialog level.

Any of this setting is optional.

Settings that can be provisioned:

*   _group_ - an apaque value that will be inserted in the SIPREC body and represents the name of the group that can be used to clasify calls in certain profiles. If missing, no group is added.
    
*   _caller_ - an XML block containing information about the caller. If absent, the _From_ header is used to build the value.
    
*   _callee_ - an XML block containing information about the callee. If absent, the _To_ header is used to build the value.
    
*   _media_ - the IP that RTPProxy will be streaming media from. If absent _127.0.0.1_ will be used. _NOTE:_ deprecated _media_ip_ is an alias for this param.
    
*   _headers_ - extra headers that are to be added in the initial request towards the SRS. _NOTE:_ headers must be separated by _\\r\\n_ and must end with _\\r\\n_.
    
*   _socket_ - listening socket that the outgoing request towards SRS should be used.

- **Type:** struct
- **Read/write:** read-write
- **Scope:** message

**Possible values:**

- group
- caller
- callee
- media
- headers
- socket

## Configuration Examples

### Set `skip_failover_codes` parameter

A regular expression used to specify the codes that should prevent the module from failing over to a new SRS server.

```opensips
...
# do not failover on 408 reply codes
modparam("siprec", "skip_failover_codes", "408")

# do not failover on 408 or 487 reply codes
modparam("siprec", "skip_failover_codes", "408|487")

# do not failover on any 3xx or 4xx reply code
modparam("siprec", "skip_failover_codes", "\[34\]\[0-9\]\[0-9\]")
...
```
### Use `siprec_start_recording()` function with a single SRS

Calling this function on an initial INVITE engages call recording to SRS(s) for that call.

```opensips
	...
	if (!has_totag() && is_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1";
		xlog("Engage SIPREC call recording to $var(srs) for $ci\\n");
		siprec_start_recording($var(srs));
	}
	...
```
### Use `siprec_start_recording()` function with multiple SRS servers

Calling this function on an initial INVITE engages call recording to SRS(s) for that call.

```opensips
	...
	if (!has_totag() && is_method("INVITE")) {
		$var(srs) = "sip:127.0.0.1, sip:127.0.0.1;transport=TCP";
		xlog("Engage SIPREC call recording to servers $var(srs) for $ci in inbound group\\n");
		siprec_start_recording($var(srs), "inbound");
	}
	...
```
### Use `siprec_start_recording()` function with custom XML values for participants

Calling this function on an initial INVITE engages call recording to SRS(s) for that call.

```opensips
	...
	$xml(caller_xml) = "<nameID></nameID>";
	$xml(caller_xml/nameID.attr/aor) = "sip:6024151234@10.0.0.11:5090";
	$xml(caller_xml/nameID) = "<name>test</name>";
	$siprec(caller) = $xml(caller_xml/nameID);
	siprec_start_recording($var(srs));
	...
```
### Use `siprec_start_recording()` function with custom headers

Calling this function on an initial INVITE engages call recording to SRS(s) for that call.

```opensips
	...
	$siprec(headers) = "X-MY-CUSTOM_HDR: 1\\r\\n";
	siprec_start_recording($var(srs));
	...
```
### Use `siprec_pause_recording()`

Pauses the recording for the ongoing call. Should be called after the dialog has matched.

```opensips
	...
	if (has_totag() && is_method("INVITE")) {
		if (is_audio_on_hold())
			siprec_pause_recording();
	}
	...
```
### Use `siprec_resume_recording()`

Resumes the recording for the ongoing call. Should be called after the dialog has matched.

```opensips
	...
	if (has_totag() && is_method("INVITE")) {
		if (!is_audio_on_hold())
			siprec_resume_recording();
	}
	...
```
