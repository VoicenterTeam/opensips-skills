# rtpengine Module Reference
<!-- generated-from: data/3.5/modules/rtpengine.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 rtpengine module. Read this file when configuring or debugging the rtpengine module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module that enables media streams to be proxied via an RTP proxy. The only RTP proxy currently known to work with this module is the Sipwise rtpengine [https://github.com/sipwise/rtpengine](https://github.com/sipwise/rtpengine). The rtpengine module is a modified version of the original rtpproxy module using a new control protocol. The module is designed to be a drop-in replacement for the old module from a configuration file point of view, however due to the incompatible control protocol, it only works with RTP proxies which specifically support it.

## How It Works

The rtpengine module can support multiple RTP proxies for balancing/distribution and control/selection purposes. The module allows definition of several sets of rtpengines. Load-balancing will be performed over a set and the admin has the ability to choose what set should be used. The set is selected via its id - the id being defined with the set. Refer to the “[rtpengine_sock](#param_rtpengine_sock "1.4.1.rtpengine_sock (string)")” module parameter definition for syntax description. The balancing inside a set is done automatically by the module based on the weight of each RTP proxy from the set. The selection of the set is done from script prior using rtpengine_delete(), rtpengine_offer() or rtpengine_answer() functions - see the rtpengine_use_set() function. Another way to select the set is to define setid_avp module parameter and assign setid to the defined avp before calling rtpengine_offer() or rtpengine_manage() function. If forwarding of the requests fails and there is another branch to try, remember to unset the avp after calling rtpengine_delete() function. For backward compatibility reasons, a set with no id take by default the id 0. Also if no set is explicitly set before rtpengine_delete(), rtpengine_offer() or rtpengine_answer() the 0 id set will be used. IMPORTANT: if you use multiple sets, take care and use the same set for both rtpengine_offer()/rtpengine_answer() and rtpengine_delete()!! If the set was selected using setid_avp, the avp needs to be set only once before rtpengine_offer() or rtpengine_manage() call.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

### Optional Modules

- `tm module`

## Exported Parameters

### `db_table` (string)

The table where the RTPEngines sockets are stored. Used when Database URL is provisioned.

*Default value is rtpengine.*

**Example.** rtpengine_new.

```opensips
modparam("rtpengine", "db_table", "rtpengine_new")
```
### `db_url` (string)

Database URL, used to load RTPEngines sockets from db, instead of specifying them in the script ([rtpengine_sock](#param_rtpengine_sock "1.4.1.rtpengine_sock (string)") module parameter).

*Default value is NULL.*

**Notes:** Default value is “NULL”, no database is used.

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
modparam("rtpengine", "db_url", 
		"mysql://opensips:opensipsrw@localhost/opensips")
```
### `error_pv` (string)

The parameter defines a variable that shall be populated by RTP when one of the rtpengine_* functions fail.

**Example.** $var(rtpengine_error).

```opensips
modparam("rtpengine", "error_pv", "$var(rtpengine_error)")
```
### `extra_id_pv` (string)

The parameter sets the PV definition to use when the “via-branch=extra” option is used on the rtpengine_delete(), rtpengine_offer(), rtpengine_answer() or rtpengine_manage() commands.

*Default value is empty.*

**Notes:** Default is empty, the “via-branch=extra” option may not be used then.

**Example.** $avp(extra_id).

```opensips
modparam("rtpengine", "extra_id_pv", "$avp(extra_id)")
```
### `notification_sock` (string)

An UDP socket formatted as _IP:port_ that indicates the listening IP and port OpenSIPS will bind for to receive notifications (such as DTMF events) from RTPengine.

Every notification received from RTPengine will trigger an _E_RTPENGINE_NOTIFICATION_ event.

*Default value is none.*

**Notes:** Default value is “none” - notifications are ignored.

**Example.** 127.0.0.1:9999.

```opensips
modparam("rtpengine", "notification_sock", "127.0.0.1:9999")
```
### `rtpengine_disable_tout` (integer)

Once an RTP proxy was found unreachable and marked as disabled, the rtpengine module will not attempt to establish communication to that RTP proxy for rtpengine_disable_tout seconds.

*Default value is 60.*

**Example.** Set the `rtpengine_disable_tout` parameter.

```opensips
modparam("rtpengine", "rtpengine_disable_tout", 20)
```
### `rtpengine_retr` (integer)

How many times the module should retry to send and receive after timeout was generated.

*Default value is 5.*

**Example.** Set the `rtpengine_retr` parameter.

```opensips
modparam("rtpengine", "rtpengine_retr", 2)
```
### `rtpengine_sock` (string)

Definition of socket(s) used to connect to (a set) RTP proxy. It may specify a UNIX socket or an IPv4/IPv6 UDP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

*Default value is NONE.*

**Example.** Set the `rtpengine_sock` parameter.

```opensips
# single rtproxy
modparam("rtpengine", "rtpengine_sock", "udp:localhost:12221")
# multiple rtproxies for LB
modparam("rtpengine", "rtpengine_sock",
	"udp:localhost:12221 udp:localhost:12222")
# multiple sets of multiple rtproxies
modparam("rtpengine", "rtpengine_sock",
	"1 == udp:localhost:12221 udp:localhost:12222")
modparam("rtpengine", "rtpengine_sock",
	"2 == udp:localhost:12225")
```
### `rtpengine_timer_interval` (integer)

Frequency to scan rtpengine sets for disabled node probing. Probing is done outside the SIP processing context and in a separate timer routine. Disabled nodes are probed for re-enablement after rtpengine_disable_tout seconds. Setting this value too high can lead to unexpectedly large disabled interval as the max interval before probing is (rtpengine_timer_interval + rtpengine_disable_tout) seconds.

*Default value is 5.*

**Example.** Set the `rtpengine_timer_interval` parameter.

```opensips
modparam("rtpengine", "rtpengine_timer_interval", 1)
```
### `rtpengine_tout` (integer)

Timeout value in waiting for reply from RTP proxy.

*Default value is 1.*

**Example.** Set the `rtpengine_tout` parameter.

```opensips
modparam("rtpengine", "rtpengine_tout", 2)
```
### `set_column` (string)

The name of the rtpengine set column in the database table.

*Default value is set_id.*

**Example.** set_new.

```opensips
modparam("rtpengine", "set_column", "set_new")
```
### `setid_avp` (string)

The parameter defines an AVP that, if set, determines which RTP proxy set rtpengine_offer(), rtpengine_answer(), rtpengine_delete(), and rtpengine_manage() functions use.

**Example.** $avp(setid).

```opensips
modparam("rtpengine", "setid_avp", "$avp(setid)")
```
### `socket_column` (string)

The name of the rtpengine socket column in the database table.

*Default value is socket.*

**Example.** sock.

```opensips
modparam("rtpengine", "socket_column", "sock")
```

## Exported Functions

### `rtpengine_answer([flags[, sock_pvar[, sdp_pvar[, body]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on 200 OK for the cases the SDPs are in INVITE and 200 OK and on ACK when SDPs are in 200 OK and ACK.

**Parameters:**

- `body` *(string, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.
- `flags` *(string, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.
- `sdp_pvar` *(var, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.
- `sock_pvar` *(var, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Related:**

- `rtpengine_offer`

**Example.** rtpengine_answer usage.

```text
See rtpengine_offer() function example above for examples.
```

### `rtpengine_block_dtmf([flags[, sockvar]])`

This function will block the DTMF media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

**Parameters:**

- `flags` *(string, optional)* — The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.
- `sockvar` *(string, optional)* — 

**Usable from:** any route

**Example.** Example of `rtpengine_block_dtmf` usage.

```opensips
...
rtpengine_block_dtmf();
...
```

### `rtpengine_block_media([flags[, sockvar]])`

This function will block the media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

**Parameters:**

- `flags` *(string, optional)* — Direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.
- `sockvar` *(var, optional)* — 

**Usable from:** any route

**Example.** Example of rtpengine_block_media usage.

```opensips
...
rtpengine_block_media();
...
```

### `rtpengine_delete([flags[, sock_var]])`

Tears down the RTPEngine session for the current call.

**Parameters:**

- `flags` *(string, optional)* — See rtpengine_offer() function description above for the meaning of the parameters. Note that not all flags make sense for a “delete”.
- `sock_var` *(var, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.

**Usable from:** ALL_ROUTES

**Related:**

- `rtpengine_offer`

**Example.** rtpengine_delete usage.

```opensips
...
rtpengine_delete();
...
```

### `rtpengine_manage([flags[, sock_var[, sdp_var[, body]]]])`

Manage the RTPEngine session - it combines the functionality of rtpengine_offer(), rtpengine_answer() and rtpengine_delete(), detecting internally based on message type and method which one to execute. Functionality: If INVITE with SDP, then do rtpengine_offer(). If ACK with SDP, then do rtpengine_answer(). If BYE or CANCEL, or called within a FAILURE_ROUTE[], then do rtpengine_delete(). If reply to INVITE with code >= 300 do rtpengine_delete(). If reply with SDP to INVITE having code 1xx and 2xx, then do rtpengine_answer() if the request had SDP or tm is not loaded, otherwise do rtpengine_offer().

**Parameters:**

- `body` *(string, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.
- `flags` *(string, optional)* — It can take the same parameters as rtpengine_offer(). The flags parameter to rtpengine_manage() can be a configuration variable containing the flags as a string.
- `sdp_var` *(var, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.
- `sock_var` *(var, optional)* — See rtpengine_offer() function description above for the meaning of the parameters.

**Usable from:** ALL_ROUTES

**Related:**

- `rtpengine_answer`
- `rtpengine_delete`
- `rtpengine_offer`

**Example.** rtpengine_manage usage.

```opensips
...
rtpengine_manage();
...
```

### `rtpengine_offer([flags[, sock_var[, sdp_pvar[, body]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on INVITE for the cases the SDPs are in INVITE and 200 OK and on 200 OK when SDPs are in 200 OK and ACK.

**Parameters:**

- `body` *(string, optional)* — used to provide a specific body to the rtpengine_* function. If this parameter is missing the body of the current message is used.
- `flags` *(string, optional)* — flags to turn on some features. The “flags” string is a list of space-separated items. Each item is either an individual token, or a token in “key=value” format. The possible tokens are described below. When passing an option that OpenSIPS is not aware of, it will be blindly sent to the rtpengine daemon to be processed. (e.g., via-branch=..., via-branch-param=..., call-id, from-tag, to-tag, asymmetric, force-answer, in-iface=..., out-iface=..., internal, external, auto-bridge, address-family=..., received-from=..., force, trust-address, SIP-source-address, replace-origin, replace-session-connection, replace-zero-address, symmetric, repacketize=NN, loop-protect, ICE=..., RTP, SRTP, AVP, AVPF, RTP/AVP, RTP/SAVP, RTP/AVPF, RTP/SAVPF, to-tag, to-tag=..., from-tag=..., call-id=..., rtcp-mux-demux, rtcp-mux-reject, rtcp-mux-offer, rtcp-mux-require, rtcp-mux-accept, media-address=..., record-call=yes/no, transcode-CODEC, codec-strip-CODEC, codec-mask-CODEC)
- `sdp_pvar` *(var, optional)* — variable used to store the full SDP received from rtpengine. You can perform any additional changes on this string. Important: when providing this variable, the message body is no longer changed, so you have to manually replace it!.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

**Usable from:** ALL_ROUTES

**Related:**

- `rtpengine_answer`

**Example.** rtpengine_offer usage.

```opensips
route {
...
    if (is_method("INVITE")) {
        if (has_body("application/sdp")) {
            if (rtpengine_offer())
                t_on_reply("1");
        } else {
            t_on_reply("2");
        }
    }
    if (is_method("ACK") && has_body("application/sdp"))
        rtpengine_answer();
...
}

onreply_route[1]
{
...
    if (has_body("application/sdp"))
        rtpengine_answer();
...
}

onreply_route[2]
{
...
    if (has_body("application/sdp"))
        rtpengine_offer();
...
}
```

**Example.** rtpengine_offer usage with body replace.

```opensips
...
if (rtpengine_offer(, $var(socket), $var(body), $rb)) {
    xlog("Used rtpengine $var(socket)\n");
    # make all the changes on the resulted SDP in $var(body)
    ...
    remove_body_part();
    add_body_part($var(body), "application/sdp");
}
...
```

**Example.** rtpengine_offer usage with call recording.

```opensips
...
$var(rtpengine_flags) = $var(rtpengine_flags) + " record-call=yes";

$json(recording_keys) := "{}";
$json(recording_keys/callId) = $ci;
$json(recording_keys/fromUser) = $dlg_val(recording_from_user);
$json(recording_keys/fromDomain) = $dlg_val(recording_from_domain);
$json(recording_keys/fromTag) = $dlg_val(recording_from_tag);
$json(recording_keys/toUser) = $dlg_val(recording_to_user);
$json(recording_keys/toDomain) = $dlg_val(recording_to_domain);

$var(rtpengine_flags) = $var(rtpengine_flags) + " metadata=" + $(json(recording_keys){s.encode.hexa});
rtpengine_offer($var(rtpengine_flags));
...
```

**Example.** rtpengine_offer usage for transcoding.

```opensips
...
# Goal: make A-side talk PCMA and B-side talk opus
# * do not present PCMA to B-side: codec-mask-PCMA, but use it on A-side
# * do not use opus for A-side: codec-strip-opus
# * offer opus to B-side: transcode-opus
rtpengine_offer("... codec-mask-PCMA codec-strip-opus transcode-opus ...");
...
```

### `rtpengine_play_dtmf(code, [flags[, sockvar]])`

This function instructs RTP to send the DTMF code to the participant of the call. The code can be a digit (“0-9”) or a special character (one of “*,#,A,B,C,D”). Additional parameters can be configured using the flags parameter. For more information, please consult the RTP documentation. NOTE: if you are planning to inject DTMF in a session, you have to specify the inject-DTMF flag when the session is created. This function can be used to convert SIP INFO DTMF keys to RTP DTMF.

**Parameters:**

- `code` *(string, required)* — The DTMF code to send to the participant of the call.
  - `0-9`
  - `*`
  - `#`
  - `A`
  - `B`
  - `C`
  - `D`
- `flags` *(string, optional)* — Additional parameters can be configured using the flags parameter.

**Usable from:** ALL_ROUTES

**Example.** Example of `rtpengine_play_dtmf` usage.

```opensips
rtpengine_play_dtmf("0"); # send the 0 code upstream
```

### `rtpengine_play_media(flags, [duration_spec[, sock_var[, sockvar]]])`

This function will start playing a media file to one of the endpoints.

**Parameters:**

- `duration_spec` *(var, optional)* — a pseudo variable that will contain the duration of the played file. It will be set to _\-1_ if the duration could not be determined.
- `flags` *(string, required)* — a list of flags simialar to the other functions. One of the _file_, _blob_ or _db-id_ parameters is mandatory to indicate the content of the media file to be played. _file_ is a common choice for specifying rtpengine to get media from a file path, _blob_ to take the content from an inline string and _db-id_ to get the content from the database.

The direction of the media stream is controlled by the _from-tag_ parameter, _address_ (media address from the SDP), or _label_, if the media stream contains a label. If all of them are missing, the media file is played to the initiator of the SIP request, and will work similar to a ringback tone.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

**Usable from:** any route

**Example.** Ringback tone using rtpengine_play_media.

```opensips
...
if (is_method("INVITE") && !has_totag())
	rtpengine_play_media("file=/path/to/ringback_tone_file.wav");
...
```

**Example.** Manage music on hold using rtpengine_play_media.

```opensips
...
if (is_method("INVITE") && has_totag()) {
	if (is_audio_on_hold()) {
		$dlg_val(on_hold) = "1";
		rtpengine_play_media("from-tag=$tt file=/path/to/moh_file.wav");
	} else if ($dlg_val(on_hold) == "1") {
		$dlg_val(on_hold) = "0";
		rtpengine_stop_media("from-tag=$tt");
	}
}
...
```

### `rtpengine_start_forwarding([flags[, sockvar]])`

This function will start forwarding the media to a TLS destination specified in the _tls-send-to_ parmeter of RTPEngine. This function allows you to select the media stream to forward, by specifing the _from-tag_ of the entity you want to forward the media. If missing, all media streams are forwarded.

**Parameters:**

- `flags` *(string, optional)* — Allows you to select the media stream to forward, by specifing the _from-tag_ of the entity you want to forward the media.
- `sockvar` *(string, optional)* — 

**Usable from:** any route

**Example.** Example of `rtpengine_start_forwarding` usage.

```opensips
...
rtpengine_start_forwarding();
...
```

### `rtpengine_start_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to record the RTP stream on the RTP proxy.

**Parameters:**

- `flags` *(string, optional)* — flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

**Usable from:** any route

**Example.** rtpengine_start_recording usage.

```opensips
...
rtpengine_start_recording();
...
```

### `rtpengine_stop_forwarding([flags[, sockvar]])`

This function will stop forwarding of the media previously started using the _rtpengine_start_forwarding()_ function.

**Parameters:**

- `flags` *(string, optional)* — 
- `sockvar` *(string, optional)* — 

**Usable from:** any route

**Example.** Example of `rtpengine_stop_forwarding` usage.

```opensips
...
rtpengine_stop_forwarding();
...
```

### `rtpengine_stop_media([flags[, sockvar]])`

This function will stop playing a media file previously started by a `rtpengine_play_media()` call. The meaning of its parameters is similar to the previous functions. Note that this function should be called with similar parameters as its matching `rtpengine_play_media()` call, otherwise RTPEngine will not be able to stop media playing.

**Parameters:**

- `flags` *(string, optional)* — similar to the previous functions.
- `sockvar` *(var, optional)* — similar to the previous functions.

**Usable from:** any route

**Example.** Ringback tone stop using rtpengine_stop_media.

```opensips
...
if (is_method("INVITE") && $rs == 200)
	rtpengine_stop_media();
...
```

### `rtpengine_stop_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to stop recording the RTP stream on the RTP proxy.

**Parameters:**

- `flags` *(string, optional)* — flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

**Usable from:** any route

**Example.** rtpengine_stop_recording usage.

```opensips
...
rtpengine_stop_recording();
...
```

### `rtpengine_unblock_dtmf([flags[, sockvar]])`

This function will resume/unblock the DTMF media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

**Parameters:**

- `flags` *(string, optional)* — The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.
- `sockvar` *(string, optional)* — 

**Usable from:** any route

**Example.** Example of `rtpengine_unblock_dtmf` usage.

```opensips
...
rtpengine_unblock_dtmf();
...
```

### `rtpengine_unblock_media([flags[, sockvar]])`

This function will resume/unblock the media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

**Parameters:**

- `flags` *(string, optional)* — The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.
- `sockvar` *(string, optional)* — 

**Usable from:** any route

**Example.** Example of `rtpengine_unblock_media` usage.

```opensips
...
rtpengine_unblock_media();
...
```

### `rtpengine_use_set(setid)`

Sets the ID of the RTP proxy set to be used for the next rtpengine_delete(), rtpengine_offer(), rtpengine_answer() or rtpengine_manage() command. The parameter is an integer.

**Parameters:**

- `setid` *(integer, required)* — Sets the ID of the RTP proxy set to be used for the next rtpengine_delete(), rtpengine_offer(), rtpengine_answer() or rtpengine_manage() command.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE

**Related:**

- `rtpengine_answer`
- `rtpengine_delete`
- `rtpengine_manage`
- `rtpengine_offer`

**Example.** rtpengine_use_set usage.

```opensips
...
rtpengine_use_set(2);
rtpengine_offer();
...
```

## Exported Pseudo-Variables

### `$rtpquery`

Does a Query command to the RTP proxy and returns the answer in a JSON format. You can use this variable to fetch arbitrary data from the RTP proxy such as raw statistics about the call, or other indicators.

You can use a _$json()_ variable to parse its output and extract any information from the query, such as RTP statistics, or MOS values.

Example 1.36. $rtpquery Usage

...
	$json(reply) := $rtpquery;
	xlog("Total RTP Stats: $json(reply/totals)\\n");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$rtpstat`

Returns the RTP statistics from the RTP proxy. The RTP statistics from the RTP proxy are provided as a string and it does contain several packet counters.

Example 1.34. $rtpstat Usage

...
    append_hf("X-RTP-Statistics: $rtpstat\\r\\n");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$rtpstat(STAT)[index]`

Returnes one of the pre-fined statistics listed below:

* _MOS-average_ - without an index, it returns the average MOS value, expressed in an integer between 0 and 50, of all the RTP streams involved in the call, both caller and callee. If index is specified, it has to be one of the _from-tag_ or _to-tag_ involved in the call. In this case, the variable will return the average MOS of all the streams generated by that endpoint with the associated tag value. If you need more granular statistics, check the _$rtpquery_ variable.
    
* _jitter-average_ - similar behavior with _MOS-average_, but returnes the average jitter.
    
* _roundtrip-average_ - similar behavior with _MOS-average_, but returnes the average roundtrip.
    
* _packetloss-average_ - similar behavior with _MOS-average_, but returnes the average packet loss.
    
* _MOS-min_ - without an index, it returns the minimum MOS value (integer value between 0 and 50) of all RTP streams involved in the call, both caller and callee. If the index is specified, it has the same effect as for _MOS-average_.
    
* _jitter-min_ - similar behavior with _MOS-min_, but returnes the minimum jitter of a leg/call.
    
* _roundtrip-min_ - similar behavior with _MOS-min_, but returnes the minimum roundtrip of a leg/call.
    
* _packetloss-min_ - similar behavior with _MOS-min_, but returnes the minimum packet loss of a leg/call.
    
* _MOS-max_ - without an index, it returns the maximum MOS value (integer value between 0 and 50) of all RTP streams involved in the call, both caller and callee. If the index is specified, it has the same effect as for _MOS-average_.
    
* _jitter-max_ - similar behavior with _MOS-max_, but returnes the maximum jitter of a leg/call.
    
* _roundtrip-max_ - similar behavior with _MOS-max_, but returnes the maximum roundtrip of a leg/call.
    
* _packetloss-max_ - similar behavior with _MOS-max_, but returnes the maximum packet loss of a leg/call.
    
* _MOS-min-at_ - without an index, it returns the time in seconds elapsed from the start of the call when the MOS value is minimum. If the index is specified, it has the same effect as for _MOS-average_.
    
* _jitter-min-at_ - similar behavior with _MOS-min-at_, but returnes the time when the minimum jitter was detected.
    
* _roundtrip-min-at_ - similar behavior with _MOS-min-at_, but returnes the time when the minimum roundtrip was detected.
    
* _packetloss-min-at_ - similar behavior with _MOS-min-at_, but returnes the time when the minimum packet loss of a leg/call was detected.
    
* _MOS-max-at_ - without an index, it returns the time in seconds elapsed from the start of the call when the MOS value is maximum. If the index is specified, it has the same effect as for _MOS-average_.
    
* _jitter-max-at_ - similar behavior with _MOS-max-at_, but returnes the time when the maximum value of jitter was detected.
    
* _roundtrip-max-at_ - similar behavior with _MOS-max-at_, but returnes the time when the maximum value of roundtrip was detected.
    
* _packetloss-min-at_ - similar behavior with _MOS-max-at_, but returnes the time when the maximum packet loss of a leg/call was detected.
    
_NOTE:_ all these statistics are computed based on the statistics generated by RTPEngine. Some of them might not be available for all the calls (i.e. MOS cannot be computed if the call is too short, or if the phones do not properly report RTP statistics over RTCP). In these cases the variable returns the _NULL_ value.

Example 1.35. $rtpstat(STAT)

...
    xlog("Average MOS of the entire call is $rtpstat(MOS-average)\\r\\n");
    xlog("Average MOS of caller is $(rtpstat(MOS-average)\[$ft\])\\r\\n");
    xlog("Average MOS of callee is $(rtpstat(MOS-average)\[$tt\])\\r\\n");
    xlog("Min MOS of caller is $(rtpstat(MOS-min)\[$ft\]) reported at $(rtpstat(MOS-min-at)\[$ft\])\\r\\n");
...

- **Type:** integer
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- MOS-average
- jitter-average
- roundtrip-average
- packetloss-average
- MOS-min
- jitter-min
- roundtrip-min
- packetloss-min
- MOS-max
- jitter-max
- roundtrip-max
- packetloss-max
- MOS-min-at
- jitter-min-at
- roundtrip-min-at
- packetloss-min-at
- MOS-max-at
- jitter-max-at
- roundtrip-max-at
- packetloss-min-at

## Exported MI Functions

### `rtpengine_enable`

Enables/disables a RTP proxy.

NOTE: if a RTP proxy is defined multiple times (in the same or different set), all of its instances will be enabled/disabled IF no set ID is provided.

**Parameters:**

- `enable` *(integer, required)* — 1 - enable, 0 - disable the RTP proxy.
- `setid` *(integer, optional)* — the set ID of the nodes to be updated. If provided, only nodes in the provided set will be updated.
- `url` *(string, required)* — the RTP proxy url (exactly as defined in the config file).

**Example.** disable all rtpengines by URL

```opensips-cli
$ opensips-cli -x mi rtpengine_enable udp:192.168.2.133:8081 0
```

**Example.** enable rtpengine by URL and set ID (3)

```opensips-cli
$ opensips-cli -x mi rtpengine_enable url=udp:192.168.2.133:8081 enable=1 setid=3
```

### `rtpengine_reload`

Reloads all rtpengine sets from the database. Used only when the “[db_url](#param_db_url "1.4.10.db_url (string)")” parameter is set.

**Parameters:**

- `type` *(string, optional)* — soft - when reloading nodes from the database, reuse any existing sockets and keep existing node disabled state. If not provided, then all nodes and sockets will first be torndown and then nodes will be loaded from the database.

**Example.**

```opensips-cli
$ opensips-cli -x mi rtpengine_reload
```

**Example.**

```opensips-cli
$ opensips-cli -x mi rtpengine_reload type=soft
```

### `rtpengine_show`

Displays all the RTP proxies and their information: set and status (disabled or not, weight and recheck_ticks).

**Example.**

```opensips-cli
$ opensips-cli -x mi rtpengine_show
```

### `teardown`

Terminates the SIP dialog by the SIP Call-ID given as parameter.

Note this is a just a wrapper function over the “dlg_end_dlg” MI function provided by the “dialog” module. This wrapping is done just to make rtpengine happy when trying to terminate SIP calls based on RTP timeouts.

**Parameters:**

- `callid` *(string, required)* — SIP Call-ID.

**Example.**

```opensips-cli
$ opensips-cli -x mi teardown Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY0ZDQ
```

## Exported Events

### `E_RTPENGINE_NOTIFICATION`

This event is raised when a notification is received from RTPengine.

**Parameters:**

- `type` *(string)* — identifies the type of notification (i.e. DTMF)
- `callid` *(string)* — the callid of the call this event is triggered for
- `source_tag` *(string)* — from tag of the call this event is triggered for
- `timestamp` *(string)* — timestamp when the event was triggered
- `source_ip` *(string)* — the IP that triggered the DTMF
- `event` *(string)* — the event/digit pressed
- `duration` *(integer)* — how long the digit was pressed
- `volume` *(integer)* — volume of the tone
### `E_RTPENGINE_STATUS`

This event is raised when a RTPEngine server changes it's status to active/inactive.

**Parameters:**

- `socket` *(string)* — the socket that identifies the RTPEngine instance.
- `status` *(string)* — active if the RTPEngine instance responds to probing or inactive if the instance was deactivated.

## Configuration Examples

### Set `rtpengine_sock` parameter

Set `rtpengine_sock` parameter

```opensips
...
# single rtproxy
modparam("rtpengine", "rtpengine_sock", "udp:localhost:12221")
# multiple rtproxies for LB
modparam("rtpengine", "rtpengine_sock",
	"udp:localhost:12221 udp:localhost:12222")
# multiple sets of multiple rtproxies
modparam("rtpengine", "rtpengine_sock",
	"1 == udp:localhost:12221 udp:localhost:12222")
modparam("rtpengine", "rtpengine_sock",
	"2 == udp:localhost:12225")
...
```
### Set `rtpengine_disable_tout` parameter

Set `rtpengine_disable_tout` parameter

```opensips
...
modparam("rtpengine", "rtpengine_disable_tout", 20)
...
```
### Set `rtpengine_tout` parameter

Set `rtpengine_tout` parameter

```opensips
...
modparam("rtpengine", "rtpengine_tout", 2)
...
```
### Set `rtpengine_retr` parameter

Set `rtpengine_retr` parameter

```opensips
...
modparam("rtpengine", "rtpengine_retr", 2)
...
```
### Set `rtpengine_timer_interval` parameter

Set `rtpengine_timer_interval` parameter

```opensips
...
modparam("rtpengine", "rtpengine_timer_interval", 1)
...
```
### Set `notification_sock` parameter

Set `notification_sock` parameter

```opensips
...
modparam("rtpengine", "notification_sock", "127.0.0.1:9999")
...
```
### Set `extra_id_pv` parameter

Set `extra_id_pv` parameter

```opensips
...
modparam("rtpengine", "extra_id_pv", "$avp(extra_id)")
...
```
### Set `setid_avp` parameter

Set `setid_avp` parameter

```opensips
...
modparam("rtpengine", "setid_avp", "$avp(setid)")
...
```
### Set `error_pv` parameter

Set `error_pv` parameter

```opensips
...
modparam("rtpengine", "error_pv", "$var(rtpengine_error)")
...
```
### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("rtpengine", "db_url", 
		"mysql://opensips:opensipsrw@localhost/opensips")
...
```
### Set `db_table` parameter

Set `db_table` parameter

```opensips
...
modparam("rtpengine", "db_table", "rtpengine_new")
...
```
### Set `socket_column` parameter

Set `socket_column` parameter

```opensips
...
modparam("rtpengine", "socket_column", "sock")
...
```
### Set `set_column` parameter

Set `set_column` parameter

```opensips
...
modparam("rtpengine", "set_column", "set_new")
...
```
### `rtpengine_use_set` usage

`rtpengine_use_set` usage

```opensips
...
rtpengine_use_set(2);
rtpengine_offer();
...
```
### `rtpengine_offer` usage

`rtpengine_offer` usage

```opensips
route {
...
    if (is_method("INVITE")) {
        if (has_body("application/sdp")) {
            if (rtpengine_offer())
                t_on_reply("1");
        } else {
            t_on_reply("2");
        }
    }
    if (is_method("ACK") && has_body("application/sdp"))
        rtpengine_answer();
...
}

onreply_route\[1\]
{
...
    if (has_body("application/sdp"))
        rtpengine_answer();
...
}

onreply_route\[2\]
{
...
    if (has_body("application/sdp"))
        rtpengine_offer();
...
}
```
### `rtpengine_offer` usage with body replace

`rtpengine_offer` usage with body replace

```opensips
...
if (rtpengine_offer(, $var(socket), $var(body), $rb)) {
    xlog("Used rtpengine $var(socket)\\n");
    # make all the changes on the resulted SDP in $var(body)
    ...
    remove_body_part();
    add_body_part($var(body), "application/sdp");
}
...
```
### `rtpengine_offer` usage with call recording

`rtpengine_offer` usage with call recording

```opensips
...
$var(rtpengine_flags) = $var(rtpengine_flags) + " record-call=yes";

$json(recording_keys) := "{}";
$json(recording_keys/callId) = $ci;
$json(recording_keys/fromUser) = $dlg_val(recording_from_user);
$json(recording_keys/fromDomain) = $dlg_val(recording_from_domain);
$json(recording_keys/fromTag) = $dlg_val(recording_from_tag);
$json(recording_keys/toUser) = $dlg_val(recording_to_user);
$json(recording_keys/toDomain) = $dlg_val(recording_to_domain);

$var(rtpengine_flags) = $var(rtpengine_flags) + " metadata=" + $(json(recording_keys){s.encode.hexa});
rtpengine_offer($var(rtpengine_flags));
...
```
### `rtpengine_offer` usage for transcoding

`rtpengine_offer` usage for transcoding

```opensips
...
# Goal: make A-side talk PCMA and B-side talk opus
# \* do not present PCMA to B-side: codec-mask-PCMA, but use it on A-side
# \* do not use opus for A-side: codec-strip-opus
# \* offer opus to B-side: transcode-opus
rtpengine_offer("... codec-mask-PCMA codec-strip-opus transcode-opus ...");
...
```
### `rtpengine_delete` usage

`rtpengine_delete` usage

```opensips
...
rtpengine_delete();
...
```
### `rtpengine_manage` usage

`rtpengine_manage` usage

```opensips
...
rtpengine_manage();
...
```
### `rtpengine_start_recording` usage

`rtpengine_start_recording` usage

```opensips
...
rtpengine_start_recording();
...
		
```
### `rtpengine_stop_recording` usage

`rtpengine_stop_recording` usage

```opensips
...
rtpengine_stop_recording();
...
		
```
### Ringback tone using `rtpengine_play_media`

Ringback tone using `rtpengine_play_media`

```opensips
...
if (is_method("INVITE") && !has_totag())
	rtpengine_play_media("file=/path/to/ringback_tone_file.wav");
...
		
```
### Manage music on hold using `rtpengine_play_media`

Manage music on hold using `rtpengine_play_media`

```opensips
...
if (is_method("INVITE") && has_totag()) {
	if (is_audio_on_hold()) {
		$dlg_val(on_hold) = "1";
		rtpengine_play_media("from-tag=$tt file=/path/to/moh_file.wav");
	} else if ($dlg_val(on_hold) == "1") {
		$dlg_val(on_hold) = "0";
		rtpengine_stop_media("from-tag=$tt");
	}
}
...
		
```
### Ringback tone stop using `rtpengine_stop_media`

Ringback tone stop using `rtpengine_stop_media`

```opensips
...
if (is_method("INVITE") && $rs == 200)
	rtpengine_stop_media();
...
		
```
### Example of `rtpengine_block_media` usage

Example of `rtpengine_block_media` usage

```opensips
...
rtpengine_block_media();
...
		
```
### Example of `rtpengine_unblock_media` usage

Example of `rtpengine_unblock_media` usage

```opensips
...
rtpengine_unblock_media();
...
		
```
### Example of `rtpengine_block_dtmf` usage

Example of `rtpengine_block_dtmf` usage

```opensips
...
rtpengine_block_dtmf();
...
		
```
### Example of `rtpengine_unblock_dtmf` usage

Example of `rtpengine_unblock_dtmf` usage

```opensips
...
rtpengine_unblock_dtmf();
...
		
```
### Example of `rtpengine_start_forwarding` usage

Example of `rtpengine_start_forwarding` usage

```opensips
...
rtpengine_start_forwarding();
...
		
```
### Example of `rtpengine_stop_forwarding` usage

Example of `rtpengine_stop_forwarding` usage

```opensips
...
rtpengine_stop_forwarding();
...
		
```
### Example of `rtpengine_play_dtmf` usage

Example of `rtpengine_play_dtmf` usage

```opensips
...
rtpengine_play_dtmf("0"); # send the 0 code upstream
...
		
```
### $rtpstat Usage

$rtpstat Usage

```opensips
...
    append_hf("X-RTP-Statistics: $rtpstat\\r\\n");
...
		
```
### $rtpstat(STAT)

$rtpstat(STAT)

```opensips
...
    xlog("Average MOS of the entire call is $rtpstat(MOS-average)\\r\\n");
    xlog("Average MOS of caller is $(rtpstat(MOS-average)\[$ft\])\\r\\n");
    xlog("Average MOS of callee is $(rtpstat(MOS-average)\[$tt\])\\r\\n");
    xlog("Min MOS of caller is $(rtpstat(MOS-min)\[$ft\]) reported at $(rtpstat(MOS-min-at)\[$ft\])\\r\\n");
...
		
```
### $rtpquery Usage

$rtpquery Usage

```opensips
...
	$json(reply) := $rtpquery;
	xlog("Total RTP Stats: $json(reply/totals)\\n");
...
		
```
### `rtpengine_enable` usage

`rtpengine_enable` usage

```opensips
...
## disable all rtpengines by URL
$ opensips-cli -x mi rtpengine_enable udp:192.168.2.133:8081 0
## enable rtpengine by URL and set ID (3)
$ opensips-cli -x mi rtpengine_enable url=udp:192.168.2.133:8081 enable=1 setid=3
...
			
```
### `rtpengine_show` usage

`rtpengine_show` usage

```opensips
...
$ opensips-cli -x mi rtpengine_show
...
			
```
### `rtpengine_reload` usage

`rtpengine_reload` usage

```opensips
...
$ opensips-cli -x mi rtpengine_reload
$ opensips-cli -x mi rtpengine_reload type=soft
...
			
```
### `teardown` usage

`teardown` usage

```opensips
...
$ opensips-cli -x mi teardown Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY0ZDQ
...
			
```
