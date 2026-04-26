# rtpengine Module Reference
<!-- generated-from: data/4.0/modules/rtpengine.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 rtpengine module. Read this file when configuring or debugging the rtpengine module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

The rtpengine module can support multiple RTP proxies for balancing/distribution and control/selection purposes. The module allows definition of several sets of rtpengines. Load-balancing will be performed over a set and the admin has the ability to choose what set should be used. The set is selected via its id - the id being defined with the set. Refer to the “[rtpengine_sock](#param_rtpengine_sock "1.4.1.rtpengine_sock (string)")” module parameter definition for syntax description. The balancing inside a set is done automatically by the module based on the weight of each RTP proxy from the set. The selection of the set is done from script prior using rtpengine_delete(), rtpengine_offer() or rtpengine_answer() functions - see the rtpengine_use_set() function. Another way to select the set is to define setid_avp module parameter and assign setid to the defined avp before calling rtpengine_offer() or rtpengine_manage() function. If forwarding of the requests fails and there is another branch to try, remember to unset the avp after calling rtpengine_delete() function. For backward compatibility reasons, a set with no id take by default the id 0. Also if no set is explicitly set before rtpengine_delete(), rtpengine_offer() or rtpengine_answer() the 0 id set will be used. IMPORTANT: if you use multiple sets, take care and use the same set for both rtpengine_offer()/rtpengine_answer() and rtpengine_delete()!! If the set was selected using setid_avp, the avp needs to be set only once before rtpengine_offer() or rtpengine_manage() call. The module is able to failover to a new node within a set, if a chosen one has communication issues. Moreover, it will also failover if the node returns one of the following errors: * Parallel session limit reached * Ran out of ports * CPU usage limit exceeded * Load limit exceeded * Bandwidth limit exceeded You can use the [extra_failover_error](#param_extra_failover_error "1.5.2.1.extra_failover_error (string)") parameter to extend the above list. Many rtpengine_\* functions accept a "sock_var" parameter that will be populated with the socket of the RTPEngine chosen for the particular operation. The format of the data stored in "sock_var" is: "proto:ip:port". If the "sock_var" has been specified and it is non-NULL then it will be used to determine the specific RTPEngine to use. Note that the socket specified by "sock_var" must be a member of the current RTPEngine Set context.

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
...
modparam("rtpengine", "db_table", "rtpengine_new")
...
```
### `db_url` (string)

Database URL, used to load RTPEngines sockets from db, instead of specifying them in the script ([rtpengine_sock](#param_rtpengine_sock "1.4.1.rtpengine_sock (string)") module parameter).

*Default value is NULL.*

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
modparam("rtpengine", "db_url", 
		"mysql://opensips:opensipsrw@localhost/opensips")
```
### `error_pv` (string)

The parameter defines a variable that shall be populated by RTP when one of the rtpengine_* functions fail.

*Default value is There is no default value..*

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

An UDP socket formatted as _IP:port_ that indicates the listening IP and port OpenSIPS will bind for to receive notifications (such as DTMF events) from RTPengine. Every notification received from RTPengine will trigger an _E_RTPENGINE_NOTIFICATION_ event.

*Default value is none.*

**Example.** 127.0.0.1:9999.

```opensips
modparam("rtpengine", "notification_sock", "127.0.0.1:9999")
```
### `ping_enabled` (integer)

This parameter indicates whether probing should be done for enabled nodes as well.

If this parameter is set, each enabled node is pinged every [rtpengine_timer_interval](#param_rtpengine_timer_interval "1.4.5.rtpengine_timer_interval (integer)") seconds, unless there was any communication with the node since the previous interval.

*Default value is 0.*

**Example.** yes.

```opensips
...
modparam("rtpengine", "ping_enabled", yes)
...
```
### `rtpengine_disable_tout` (integer)

Once an RTP proxy was found unreachable and marked as disabled, the rtpengine module will not attempt to establish communication to that RTP proxy for rtpengine_disable_tout seconds.

*Default value is 60.*

**Example.** 20.

```opensips
modparam("rtpengine", "rtpengine_disable_tout", 20)
```
### `rtpengine_retr` (integer)

How many times the module should retry to send and receive after timeout was generated.

*Default value is 5.*

**Example.** 2.

```opensips
modparam("rtpengine", "rtpengine_retr", 2)
```
### `rtpengine_sock` (string)

Definition of socket(s) used to connect to (a set) RTP proxy. It may specify a UNIX socket or an IPv4/IPv6 UDP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

*Default value is NONE.*

**Example.** udp:localhost:12221.

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

**Example.** 1.

```opensips
modparam("rtpengine", "rtpengine_timer_interval", 1)
```
### `rtpengine_tout` (integer)

Timeout value in waiting for reply from RTP proxy.

*Default value is 1.*

**Example.** 2.

```opensips
modparam("rtpengine", "rtpengine_tout", 2)
```
### `set_column` (string)

The name of the rtpengine set column in the database table.

*Default value is set_id.*

**Example.** set_new.

```opensips
...
modparam("rtpengine", "set_column", "set_new")
...
```
### `setid_avp` (string)

The parameter defines an AVP that, if set, determines which RTP proxy set rtpengine_offer(), rtpengine_answer(), rtpengine_delete(), and rtpengine_manage() functions use.

*Default value is There is no default value..*

**Example.** $avp(setid).

```opensips
modparam("rtpengine", "setid_avp", "$avp(setid)")
```
### `socket_column` (string)

The name of the rtpengine socket column in the database table.

*Default value is socket.*

**Example.** sock.

```opensips
...
modparam("rtpengine", "socket_column", "sock")
...
```

## Exported Functions

### `rtpengine_answer([flags[, sock_pvar[, sdp_pvar[, body]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on 200 OK for the cases the SDPs are in INVITE and 200 OK and on ACK when SDPs are in 200 OK and ACK.

See rtpengine_offer() function description above for the meaning of the parameters.

**Parameters:**

- `body` *(string, optional)* — used to provide a specific body to the rtpengine_* function.
- `flags` *(string, optional)* — flags to turn on some features.
- `sdp_pvar` *(var, optional)* — variable used to store the full SDP received from rtpengine.
- `sock_pvar` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

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

- `flags` *(string, optional)* — The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.
- `sockvar` *(string, optional)* — 

**Usable from:** any route

**Example.** Example of `rtpengine_block_media` usage.

```opensips
...
rtpengine_block_media();
...
```

### `rtpengine_delete([flags[, sock_var]])`

Tears down the RTPEngine session for the current call.

See rtpengine_offer() function description above for the meaning of the parameters. Note that not all flags make sense for a “delete”.

**Parameters:**

- `flags` *(string, optional)* — flags to turn on some features. Note that not all flags make sense for a “delete”.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

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

Manage the RTPEngine session - it combines the functionality of rtpengine_offer(), rtpengine_answer() and rtpengine_delete(), detecting internally based on message type and method which one to execute.

It can take the same parameters as rtpengine_offer(). The flags parameter to rtpengine_manage() can be a configuration variable containing the flags as a string.

Functionality:
* If INVITE with SDP, then do rtpengine_offer()
* If ACK with SDP, then do rtpengine_answer()
* If BYE or CANCEL, or called within a FAILURE_ROUTE[], then do rtpengine_delete()
* If reply to INVITE with code >= 300 do rtpengine_delete()
* If reply with SDP to INVITE having code 1xx and 2xx, then do rtpengine_answer() if the request had SDP or tm is not loaded, otherwise do rtpengine_offer()

**Parameters:**

- `body` *(string, optional)* — used to provide a specific body to the rtpengine_* function.
- `flags` *(string, optional)* — flags to turn on some features. Can be a configuration variable containing the flags as a string.
- `sdp_var` *(var, optional)* — variable used to store the full SDP received from rtpengine.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

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
- `flags` *(string, optional)* — flags to turn on some features.

The “flags” string is a list of space-separated items. Each item is either an individual token, or a token in “key=value” format. The possible tokens are described below.

When passing an option that OpenSIPS is not aware of, it will be blindly sent to the rtpengine daemon to be processed.

Values can also use bracket syntax to pass structured data (lists and dictionaries) to the RTP daemon. This enables features of the rtpengine ng protocol that require nested parameters, such as sdp-media-remove, codec, and sdp-attr.

A value enclosed in square brackets (“[...]”) is parsed as a list of space-separated items. If any item at the top level inside the brackets contains an equals sign (“=”), the entire value is parsed as a dictionary of key=value pairs instead. Brackets can be nested to build the multi-level structures that certain rtpengine parameters expect.

The bracket syntax is parsed module-side and converted to native bencode list and dictionary structures before being sent to the RTP daemon. This works with all rtpengine daemon versions and does not require any special daemon configuration.

The legacy prefix-style codec flags (transcode-CODEC, codec-strip-CODEC, codec-mask-CODEC) continue to work as before and are sent as flag strings. Do not mix prefix-style and bracket-style codec flags in the same call, as they are processed independently and may produce unexpected results.

Values inside brackets that need to contain literal spaces or equals signs can use escape sequences: “..” (double dot) is unescaped to a space character, and “--” (double dash) is unescaped to an equals sign. Single dots and single dashes are passed through unchanged. This convention matches the rtpengine daemon's own escape handling.

Nesting is limited to 8 levels of depth and individual bracket values are limited to 4096 bytes. These limits are sufficient for all documented rtpengine use cases.

* via-branch=... - Include the “branch” value of one of the “Via” headers in the request to the RTP proxy. Possible values are: “1” - use the first “Via” header; “2” - use the second “Via” header; “auto” - use the first “Via” header if this is a request, or the second one if this is a reply; “extra” - don't take the value from a header, but instead use the value of the “extra_id_pv” variable. This can be used to create one media session per branch on the RTP proxy. When sending a subsequent “delete” command to the RTP proxy, you can then stop just the session for a specific branch when passing the flag '1' or '2' in the “rtpengine_delete”, or stop all sessions for a call when not passing one of those two flags there. This is especially useful if you have serially forked call scenarios where the RTP proxy gets an “offer” command for a new branch, and then a “delete” command for the previous branch, which would otherwise delete the full call, breaking the subsequent “answer” for the new branch. This flag is only supported by the Sipwise rtpengine RTP proxy at the moment!
* via-branch-param=... - provide a custom value for the via-branch param.
* call-id - provide a custom Call-ID for the session. If missing, the Call-Id of the request/reply is used.
* from-tag - provide a custom from-tag for the session. If missing, the from-tag request is used.
* to-tag - provide a custom to-tag of the session. If missing, the to-tag of the request/reply is used, is present.
* asymmetric - flags that UA from which message is received doesn't support symmetric RTP. (automatically sets the 'r' flag)
* force-answer - force “answer”, that is, only rewrite SDP when corresponding session already exists in the RTP proxy. By default is on when the session is to be completed.
* in-iface=..., out-iface=... - these flags specify the direction the SIP message. These flags only make sense when the RTP proxy is running in bridge mode. “in-iface” should indicate the proxy's inbound interface, and “out-iface” corresponds to the RTP proxy's outbound interface. You always have to specify two flags to define the incoming network and the outgoing network. For example, “in-iface=internal out-iface=external” should be used for SIP message received from the local interface and sent out on the external interface.
* internal, external - these the old flags used to specify the direction of call. They are now obsolate, being replaced by the “in-iface=internal out-iface=external” configuration.
* auto-bridge - this flag an alternative to the “internal” and “external” flags in order to do automatic bridging between IPv4 on the "internal network" and IPv6 on the "external network". Instead of explicitly instructing the RTP proxy to select a particular address family, the distinction is done by the given IP in the SDP body by the RTP proxy itself. Not supported by Sipwise rtpengine.
* address-family=... - instructs the RTP proxy that the recipient of this SDP body expects to see addresses of a particular family. Possible values are “IP4” and “IP6”. For example, if the SDP body contains IPv4 addresses but the recipient only speaks IPv6, you would use “address-family=IP6” to bridge between the two address families. Sipwise rtpengine remembers the address family preference of each party after it has seen an SDP body from them. This means that normally it is only necessary to explicitly specify the address family in the “offer”, but not in the “answer”. Note: Please note, that this will only work properly with non-dual-stack user-agents or with dual-stack clients according to RFC6157 (which suggest ICE for Dual-Stack implementations). This short-cut will not work properly with RFC4091 (ANAT) compatible clients, which suggests having different m-lines with different IP-protocols grouped together.
* received-from=... - sets the address from which SIP packet with SDP received. This flag always set automatically, don't use it until you have a reason for that.
* force - instructs the RTP proxy to ignore marks inserted by another RTP proxy in transit to indicate that the session is already goes through another proxy. Allows creating a chain of proxies. Not supported and ignored by Sipwise rtpengine.
* trust-address - flags that IP address in SDP should be trusted. Without this flag, the RTP proxy ignores address in the SDP and uses source address of the SIP message as media address which is passed to the RTP proxy. From rtpengine 3.8 this is the default behaviour.
* SIP-source-address - the opposite of trust-address. Restores the old default behaviour of ignoring endppoint of the addresses in the SDP body.
* replace-origin - flags that IP from the origin description (o=) should be also changed.
* replace-session-connection - flags to change the session-level SDP connection (c=) IP if media description also includes connection information.
* replace-zero-address - flags to replace zero address with real address. Using a zero endpoint address is an obsolete way to signal a muted or sendonly stream. Streams with zero addresses are normally flagged as sendonly and the zero address in the SDP is passed through.
* symmetric - flags that for the UA from which message is received, support symmetric RTP must be forced. You do not need to explicitly specify this value, as it is the default, and the behavior is only changed when the asymmetric is used.
* repacketize=NN - requests the RTP proxy to perform re-packetization of RTP traffic coming from the UA which has sent the current message to increase or decrease payload size per each RTP packet forwarded if possible. The NN is the target payload size in ms, for the most codecs its value should be in 10ms increments, however for some codecs the increment could differ (e.g. 30ms for GSM or 20ms for G.723). The RTP proxy would select the closest value supported by the codec. This feature could be used for significantly reducing bandwith overhead for low bitrate codecs, for example with G.729 going from 10ms to 100ms saves two thirds of the network bandwith. Not supported by Sipwise rtpengine.
* loop-protect - flag that instructs RTP to avoid rewriting the SDP when looping the same message.
* ICE=... - controls the RTP proxy's behaviour regarding ICE attributes within the SDP body. Possible values are: “force” - discard any ICE attributes already present in the SDP body and then generate and insert new ICE data, leaving itself as the only ICE candidates; “remove” instructs the RTP proxy to discard any ICE attributes and not insert any new ones into the SDP. The default (if no “ICE=...” is given at all), new ICE data will only be generated if no ICE was present in the SDP originally; otherwise the RTP proxy will only insert itself as an additional ICE candidate. Other SDP substitutions (c=, m=, etc) are unaffected by this flag.
* RTP, SRTP, AVP, AVPF - These flags control the RTP transport protocol that should be used towards the recipient of the SDP. If none of them are specified, the protocol given in the SDP is left untouched. Otherwise, the “SRTP” flag indicates that SRTP should be used, while “RTP” indicates that SRTP should not be used. “AVPF” indicates that the advanced RTCP profile with feedback messages should be used, and “AVP” indicates that the regular RTCP profile should be used. See also the next set of flags below.
* RTP/AVP, RTP/SAVP, RTP/AVPF, RTP/SAVPF - these serve as an alternative, more explicit way to select between the different RTP protocols and profiles supported by the RTP proxy. For example, giving the flag “RTP/SAVPF” has the same effect as giving the two flags “SRTP AVPF”.
* to-tag - force inclusion of the “To” tag. Normally, the “To” tag is always included when present, except for “delete” messages. Including the “To” tag in a “delete” messages allows you to be more selective about which dialogues within a call are being torn down.
* to-tag=... - use the specified string as “To” tag instead of the actual “To” tag from the SIP message, and force inclusion of the tag in the message as per above.
* from-tag=... - use the specified string as “From” tag instead of the actual “From” tag from the SIP message.
* call-id=... - use the specified string as “Call-ID” instead of the actual “Call-ID” from the SIP message.
* rtcp-mux-demux - if rtcp-mux (RFC 5761) was offered, make the RTP proxy accept the offer, but not offer it to the recipient of this message.
* rtcp-mux-reject - if rtcp-mux was offered, make the RTP proxy reject the offer, but still offer it to the recipient. Can be combined with “rtcp-mux-offer” to always offer it.
* rtcp-mux-offer - make the RTP proxy offer rtcp-mux to the recipient of this message, regardless of whether it was offered originally or not.
* rtcp-mux-require - Similar to offer but pretends that the client has accepted rtcp-mux. This breaks RFC 5761 and will not advertise seperate RTCP ports. This option is necessary for WebRTC clients.
* rtcp-mux-accept - if rtcp-mux was offered, make the RTP proxy accept the offer and also offer it to the recipient of this message. Can be combined with “rtcp-mux-offer” to always offer it.
* media-address=... - force a particular media address to be used in the SDP body. Address family is detected automatically.
* record-call=yes/no - indicates whether rtpengine should record the call or not. When using this parameter, you may pass further information in the “metadata”.
* transcode-CODEC - used only for offer, indicates that rtpengine should transcode the CODEC towards the B-side. Example: transcode-PCMA will present to the B-side the PCMA codec.
* codec-strip-CODEC - used only for offer, indicates that the A-side of the call will not end up talking CODEC. Example: codec-strip-PCMA will prevent the A-side from receiving the PCMA codec.
* codec-mask-CODEC - used only for offer, indicates that the A-side will use the CODEC, but it will not be presented to the B-side. Example: codec-mask-PCMA will make the A-side receive the PCMA codec, but B-side will use something else.
- `sdp_pvar` *(var, optional)* — variable used to store the full SDP received from rtpengine. You can perform any additional changes on this string. Important: when providing this variable, the message body is no longer changed, so you have to manually replace it!.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

**Usable from:** ALL_ROUTES

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

**Example.** rtpengine_offer usage for transcoding (prefix style).

```opensips
...
# Goal: make A-side talk PCMA and B-side talk opus
# * do not present PCMA to B-side: codec-mask-PCMA, but use it on A-side
# * do not use opus for A-side: codec-strip-opus
# * offer opus to B-side: transcode-opus
rtpengine_offer("... codec-mask-PCMA codec-strip-opus transcode-opus ...");
...
```

**Example.** rtpengine_offer usage with bracket syntax.

```opensips
...
# Remove video and message media streams from the SDP
# (sdp-media-remove expects a list of media types)
rtpengine_offer("sdp-media-remove=[video message image]");

# Codec manipulation using bracket syntax
# (codec expects a dictionary with sub-keys: transcode, strip, accept, etc.)
rtpengine_offer("codec=[transcode=[PCMA PCMU] accept=[AMR-WB AMR] strip=[EVS]]");

# Bracket syntax can be mixed with regular flags in the same call
rtpengine_offer("trust-address replace-origin ICE=remove codec=[transcode=[PCMA]]");

# SDP attribute manipulation with escape sequences
# '..' becomes a space, '--' becomes an equals sign
# This adds the SDP attribute "fmtp:96 useinbandfec=1" to audio streams
rtpengine_offer("sdp-attr=[audio=[add=[fmtp:96..useinbandfec--1]]]");
...
```

### `rtpengine_pause_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to pause recording the RTP stream on the RTP proxy. Identical to stop recording except that it instructs the recording daemon not to close the recording file, but instead leave it open so that recording can later be resumed via another start recording message.

**Parameters:**

- `flags` *(string, optional)* — flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

**Usable from:** any route

**Example.** rtpengine_pause_recording usage.

```opensips
rtpengine_stop_recording();
```

### `rtpengine_play_dtmf(code, [flags[, sockvar]])`

This function instructs RTP to send the DTMF code to the participant of the call. The code can be a digit (“0-9”) or a special character (one of “*,#,A,B,C,D”). Additional parameters can be configured using the flags parameter. For more information, please consult the RTP documentation. NOTE: if you are planning to inject DTMF in a session, you have to specify the inject-DTMF flag when the session is created. This function can be used to convert SIP INFO DTMF keys to RTP DTMF.

**Parameters:**

- `code` *(string, required)* — The DTMF code to send to the participant of the call.
  - `0-9`
  - `* मासूम `
  - `#`
  - `A`
  - `B`
  - `C`
  - `D`
- `flags` *(string, optional)* — Additional parameters can be configured using the flags parameter.
- `sockvar` *(string, optional)* — Optional socket variable.

**Usable from:** any route

**Example.** Example of rtpengine_play_dtmf usage.

```opensips
rtpengine_play_dtmf("0"); # send the 0 code upstream
```

### `rtpengine_play_media(flags, [duration_spec[, sock_var[, sockvar]]])`

This function will start playing a media file to one of the endpoints.

**Parameters:**

- `duration_spec` *(var, optional)* — a pseudo variable that will contain the duration of the played file. It will be set to _\-1_ if the duration could not be determined.
- `flags` *(string, required)* — a list of flags similar to the other functions. One of the _file_, _blob_ or _db-id_ parameters is mandatory to indicate the content of the media file to be played. _file_ is a common choice for specifying rtpengine to get media from a file path, _blob_ to take the content from an inline string and _db-id_ to get the content from the database.

The direction of the media stream is controlled by the _from-tag_ parameter, _address_ (media address from the SDP), or _label_, if the media stream contains a label. If all of them are missing, the media file is played to the initiator of the SIP request, and will work similar to a ringback tone.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.
- `sockvar` *(var, optional)* — 

**Usable from:** any route

**Example.** Ringback tone using rtpengine_play_media.

```opensips
if (is_method("INVITE") && !has_totag())
	rtpengine_play_media("file=/path/to/ringback_tone_file.wav");
```

**Example.** Manage music on hold using rtpengine_play_media.

```opensips
if (is_method("INVITE") && has_totag()) {
	if (is_audio_on_hold()) {
		$dlg_val(on_hold) = "1";
		rtpengine_play_media("from-tag=$tt file=/path/to/moh_file.wav");
	} else if ($dlg_val(on_hold) == "1") {
		$dlg_val(on_hold) = "0";
		rtpengine_stop_media("from-tag=$tt");
	}
}
```

### `rtpengine_start_forwarding([flags[, sockvar]])`

This function will start forwarding the media to a TLS destination specified in the _tls-send-to_ parmeter of RTPEngine. This function allows you to select the media stream to forward, by specifing the _from-tag_ of the entity you want to forward the media. If missing, all media streams are forwarded.

**Parameters:**

- `flags` *(string, optional)* — 
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
rtpengine_start_recording();
```

### `rtpengine_stop_forwarding([flags[, sockvar]])`

This function will stop forwarding of the media previously started using the rtpengine_start_forwarding() function.

**Parameters:**

- `flags` *(string, optional)* — Optional flags parameter.
- `sockvar` *(string, optional)* — Optional socket variable.

**Usable from:** any route

**Related:**

- `rtpengine_start_forwarding`

**Example.** Example of rtpengine_stop_forwarding usage.

```opensips
rtpengine_stop_forwarding();
```

### `rtpengine_stop_media(flags[, [sock_var[, sockvar]], [last_frame_pos]])`

This function will stop playing a media file previously started by a `rtpengine_play_media()` call. The meaning of its parameters is similar to the previous functions. Note that this function should be called with similar parameters as its matching `rtpengine_play_media()` call, otherwise RTPEngine will not be able to stop media playing.

**Parameters:**

- `flags` *(string, required)* — a list of flags similar to the other functions.
- `last_frame_pos` *(var, optional)* — a pseudo variable that will contain the last frame played of the file.
- `sock_var` *(var, optional)* — 
- `sockvar` *(var, optional)* — 

**Usable from:** any route

**Example.** Ringback tone stop using rtpengine_stop_media.

```opensips
if (is_method("INVITE") && $rs == 200)
	rtpengine_stop_media();
```

**Example.** Example use of the last-frame-pos parameter rtpengine_stop_media.

```opensips
if (is_method("INVITE") && has_totag()) {
	if (is_audio_on_hold()) {
		$dlg_val(on_hold = "1";
		rtpengine_play_media("from-tag=$tt start-pos=$avp(last_frame_pos) file=/path/to/moh_file.wav");
	} else if ($dlg_val(on_hold) == "1") {
		rtpengine_stop_media("from-tag=$tt", , $avp(last_frame_pos));
		$dlg_val(on_hold = "0";
	}
}
	rtpengine_stop_media();
```

### `rtpengine_stop_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to stop recording the RTP stream on the RTP proxy.

**Parameters:**

- `flags` *(string, optional)* — flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
- `sock_var` *(var, optional)* — variable used to store the rtpengine socket chosen for this call.

**Usable from:** any route

**Example.** rtpengine_stop_recording usage.

```opensips
rtpengine_stop_recording();
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

- `setid` *(integer, required)* — The ID of the RTP proxy set to be used for the next rtpengine_delete(), rtpengine_offer(), rtpengine_answer() or rtpengine_manage() command.

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

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$rtpstat`

Returns the RTP statistics from the RTP proxy. The RTP statistics from the RTP proxy are provided as a string and it does contain several packet counters.

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

- **Type:** string
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

## Exported MI Functions

### `rtpengine:enable`

Replaces obsolete MI command: _rtpengine_enable_. Enables/disables a RTP proxy. NOTE: if a RTP proxy is defined multiple times (in the same or different set), all of its instances will be enabled/disabled IF no set ID is provided.

**Parameters:**

- `enable` *(integer, required)* — 1 - enable, 0 - disable the RTP proxy, 2 - put the RTP node in probing mode.
- `setid` *(integer, optional)* — the set ID of the nodes to be updated. If provided, only nodes in the provided set will be updated.
- `url` *(string, required)* — the RTP proxy url (exactly as defined in the config file).

**Example.** disable all rtpengines by URL

```opensips-cli
$ opensips-cli -x mi rtpengine:enable udp:192.168.2.133:8081 0
```

**Example.** enable rtpengine by URL and set ID (3)

```opensips-cli
$ opensips-cli -x mi rtpengine:enable url=udp:192.168.2.133:8081 enable=1 setid=3
```

### `rtpengine:reload`

Replaces obsolete MI command: _rtpengine_reload_. Reloads all rtpengine sets from the database. Used only when the “[db_url](#param_db_url "1.4.10.db_url (string)")” parameter is set.

**Parameters:**

- `type` *(string, optional)* — soft - when reloading nodes from the database, reuse any existing sockets and keep existing node disabled state. If not provided, then all nodes and sockets will first be torndown and then nodes will be loaded from the database.

**Example.**

```opensips-cli
$ opensips-cli -x mi rtpengine:reload
```

**Example.**

```opensips-cli
$ opensips-cli -x mi rtpengine:reload type=soft
```

### `rtpengine:show`

Replaces obsolete MI command: _rtpengine_show_. Displays all the RTP proxies and their information: set and status (disabled or not, weight and recheck_ticks).

**Example.**

```opensips-cli
$ opensips-cli -x mi rtpengine:show
```

### `teardown`

Terminates the SIP dialog by the SIP Call-ID given as parameter. Note this is a just a wrapper function over the “dlg_end_dlg” MI function provided by the “dialog” module. This wrapping is done just to make rtpengine happy when trying to terminate SIP calls based on RTP timeouts.

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
- `set` *(integer)* — the numeric id of the set this RTPEngine instance is part of.

## Configuration Examples

### Set `rtpengine_sock` parameter

Definition of socket(s) used to connect to (a set) RTP proxy. It may specify a UNIX socket or an IPv4/IPv6 UDP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

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

Once an RTP proxy was found unreachable and marked as disabled, the rtpengine module will not attempt to establish communication to that RTP proxy for rtpengine_disable_tout seconds.

```opensips
...
modparam("rtpengine", "rtpengine_disable_tout", 20)
...
```
### Set `rtpengine_tout` parameter

Timeout value in waiting for reply from RTP proxy.

```opensips
...
modparam("rtpengine", "rtpengine_tout", 2)
...
```
### Set `rtpengine_retr` parameter

How many times the module should retry to send and receive after timeout was generated.

```opensips
...
modparam("rtpengine", "rtpengine_retr", 2)
...
```
### Set `rtpengine_timer_interval` parameter

Frequency to scan rtpengine sets for disabled node probing. Probing is done outside the SIP processing context and in a separate timer routine. Disabled nodes are probed for re-enablement after rtpengine_disable_tout seconds. Setting this value too high can lead to unexpectedly large disabled interval as the max interval before probing is (rtpengine_timer_interval + rtpengine_disable_tout) seconds.

```opensips
...
modparam("rtpengine", "rtpengine_timer_interval", 1)
...
```
### Set `notification_sock` parameter

An UDP socket formatted as _IP:port_ that indicates the listening IP and port OpenSIPS will bind for to receive notifications (such as DTMF events) from RTPengine.

```opensips
...
modparam("rtpengine", "notification_sock", "127.0.0.1:9999")
...
```
### Set `extra_id_pv` parameter

The parameter sets the PV definition to use when the “via-branch=extra” option is used on the rtpengine_delete(), rtpengine_offer(), rtpengine_answer() or rtpengine_manage() commands.

```opensips
...
modparam("rtpengine", "extra_id_pv", "$avp(extra_id)")
...
```
### Set `setid_avp` parameter

The parameter defines an AVP that, if set, determines which RTP proxy set rtpengine_offer(), rtpengine_answer(), rtpengine_delete(), and rtpengine_manage() functions use.

```opensips
...
modparam("rtpengine", "setid_avp", "$avp(setid)")
...
```
### Set `error_pv` parameter

The parameter defines a variable that shall be populated by RTP when one of the rtpengine_\* functions fail.

```opensips
...
modparam("rtpengine", "error_pv", "$var(rtpengine_error)")
...
```
### Set `db_url` parameter

Database URL, used to load RTPEngines sockets from db, instead of specifying them in the script ([rtpengine_sock](#param_rtpengine_sock "1.4.1.rtpengine_sock (string)") module parameter).

```opensips
...
modparam("rtpengine", "db_url", 
		"mysql://opensips:opensipsrw@localhost/opensips")
...
```
### Set `db_table` parameter

The table where the RTPEngines sockets are stored. Used when Database URL is provisioned.

```opensips
...
modparam("rtpengine", "db_table", "rtpengine_new")
...
```
### Set `socket_column` parameter

The name of the rtpengine socket column in the database table.

```opensips
...
modparam("rtpengine", "socket_column", "sock")
...
```
### Set `set_column` parameter

The name of the rtpengine set column in the database table.

```opensips
...
modparam("rtpengine", "set_column", "set_new")
...
```
### Set `ping_enabled` parameter

This parameter indicates whether probing should be done for enabled nodes as well.

```opensips
...
modparam("rtpengine", "ping_enabled", yes)
...
```
### `rtpengine_use_set` usage

Sets the ID of the RTP proxy set to be used for the next rtpengine_delete(), rtpengine_offer(), rtpengine_answer() or rtpengine_manage() command. The parameter is an integer.

```opensips
...
rtpengine_use_set(2);
rtpengine_offer();
...
```
### `rtpengine_offer` usage

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on INVITE for the cases the SDPs are in INVITE and 200 OK and on 200 OK when SDPs are in 200 OK and ACK.

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

Demonstrates usage of rtpengine_offer with body replace.

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

Demonstrates usage of rtpengine_offer with call recording.

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
### `rtpengine_offer` usage for transcoding (prefix style)

Demonstrates usage of rtpengine_offer for transcoding using prefix style.

```opensips
...
# Goal: make A-side talk PCMA and B-side talk opus
# \* do not present PCMA to B-side: codec-mask-PCMA, but use it on A-side
# \* do not use opus for A-side: codec-strip-opus
# \* offer opus to B-side: transcode-opus
rtpengine_offer("... codec-mask-PCMA codec-strip-opus transcode-opus ...");
...
```
### `rtpengine_offer` usage with bracket syntax

Demonstrates usage of rtpengine_offer with bracket syntax.

```opensips
...
# Remove video and message media streams from the SDP
# (sdp-media-remove expects a list of media types)
rtpengine_offer("sdp-media-remove=\[video message image\]");

# Codec manipulation using bracket syntax
# (codec expects a dictionary with sub-keys: transcode, strip, accept, etc.)
rtpengine_offer("codec=\[transcode=\[PCMA PCMU\] accept=\[AMR-WB AMR\] strip=\[EVS\]\]");

# Bracket syntax can be mixed with regular flags in the same call
rtpengine_offer("trust-address replace-origin ICE=remove codec=\[transcode=\[PCMA\]\]");

# SDP attribute manipulation with escape sequences
# '..' becomes a space, '--' becomes an equals sign
# This adds the SDP attribute "fmtp:96 useinbandfec=1" to audio streams
rtpengine_offer("sdp-attr=\[audio=\[add=\[fmtp:96..useinbandfec--1\]\]\]");
...
```
### Set `extra_failover_error` parameter

Contains a (XDB) regular expression that can be used to match an error received from a RTPEngine node. If matched the module tries to use a new node to handle the affected command.

```opensips
...
modparam("rtpengine", "extra_failover_error", "Parallel session limit reached")
...
```
### `rtpengine_answer` usage

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on 200 OK for the cases the SDPs are in INVITE and 200 OK and on ACK when SDPs are in 200 OK and ACK.

```opensips
See rtpengine_offer() function example above for examples.
```
### `rtpengine_delete` usage

Tears down the RTPEngine session for the current call.

```opensips
...
rtpengine_delete();
...
```
### `rtpengine_manage` usage

Manage the RTPEngine session - it combines the functionality of rtpengine_offer(), rtpengine_answer() and rtpengine_delete(), detecting internally based on message type and method which one to execute.

```opensips
...
rtpengine_manage();
...
```
### `rtpengine_start_recording` usage

This function will send a signal to the RTP proxy to record the RTP stream on the RTP proxy.

```opensips
...
rtpengine_start_recording();
...		

```
### `rtpengine_stop_recording` usage

This function will send a signal to the RTP proxy to stop recording the RTP stream on the RTP proxy.

```opensips
...
rtpengine_stop_recording();
...		

```
### `rtpengine_pause_recording` usage

This function will send a signal to the RTP proxy to pause recording the RTP stream on the RTP proxy. Identical to stop recording except that it instructs the recording daemon not to close the recording file, but instead leave it open so that recording can later be resumed via another start recording message.

```opensips
...
rtpengine_stop_recording();
...		

```
### Ringback tone using `rtpengine_play_media`

This function will start playing a media file to one of the endpoints.

```opensips
...
if (is_method("INVITE") && !has_totag())
	rtpengine_play_media("file=/path/to/ringback_tone_file.wav");
...		

```
### Manage music on hold using `rtpengine_play_media`

This function will start playing a media file to one of the endpoints.

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

This function will stop playing a media file previously started by a `rtpengine_play_media()` call.

```opensips
...
if (is_method("INVITE") && $rs == 200)
	rtpengine_stop_media();
...		

```
### Example use of the last-frame-pos parameter `rtpengine_stop_media`

This function will stop playing a media file previously started by a `rtpengine_play_media()` call.

```opensips
...
if (is_method("INVITE") && has_totag()) {
	if (is_audio_on_hold()) {
		$dlg_val(on_hold = "1";
		rtpengine_play_media("from-tag=$tt start-pos=$avp(last_frame_pos) file=/path/to/moh_file.wav");
	} else if ($dlg_val(on_hold) == "1") {
		rtpengine_stop_media("from-tag=$tt", , $avp(last_frame_pos));
		$dlg_val(on_hold = "0";
	}
}
	rtpengine_stop_media();
...		

```
### Example of `rtpengine_block_media` usage

This function will block the media sent from one of the endpoints.

```opensips
...
rtpengine_block_media();
...		

```
### Example of `rtpengine_unblock_media` usage

This function will resume/unblock the media sent from one of the endpoints.

```opensips
...
rtpengine_unblock_media();
...		

```
### Example of `rtpengine_block_dtmf` usage

This function will block the DTMF media sent from one of the endpoints.

```opensips
...
rtpengine_block_dtmf();
...		

```
### Example of `rtpengine_unblock_dtmf` usage

This function will resume/unblock the DTMF media sent from one of the endpoints.

```opensips
...
rtpengine_unblock_dtmf();
...		

```
### Example of `rtpengine_start_forwarding` usage

This function will start forwarding the media to a TLS destination specified in the _tls-send-to_ parmeter of RTPEngine.

```opensips
...
rtpengine_start_forwarding();
...		

```
### Example of `rtpengine_stop_forwarding` usage

This function will stop forwarding of the media previously started using the _rtpengine_start_forwarding()_ function.

```opensips
...
rtpengine_stop_forwarding();
...		

```
### Example of `rtpengine_play_dtmf` usage

This function instructs RTP to send the DTMF _code_ to the participant of the call.

```opensips
...
rtpengine_play_dtmf("0"); # send the 0 code upstream
...		

```
### Example of async rtpengine_offer() usage

The asynchronous flavor of the [rtpengine_offer()](#func_rtpengine_offer "1.5.2. rtpengine_offer([flags[, sock_var[, sdp_pvar[, body]]]])") function. It receives the same parameters, with the same meanings.

```opensips
...
if (is_method("ACK") && has_totag() && has_body_part("application/sdp")) {
	async(rtpengine_offer(), resume_invite);
}
...
route\[resume_invite\] {
	t_relay();
}
...		

```
### Example of async rtpengine_answer() usage

The asynchronous flavor of the [rtpengine_answer()](#func_rtpengine_answer "1.5.3. rtpengine_answer([flags[, sock_pvar[, sdp_pvar[, body]]]])") function. It receives the same parameters, with the same meanings.

```opensips
...
if (is_method("ACK") && has_body_part("application/sdp")) {
	# late negotiation
	async(rtpengine_answer(), resume_ack);
}
...
route\[resume_ack\] {
	t_relay();
}
...		

```
### Example of async rtpengine_delete() usage

The asynchronous flavor of the [rtpengine_delete()](#func_rtpengine_delete "1.5.4. rtpengine_delete([flags[, sock_var]])") function. It receives the same parameters, with the same meanings.

```opensips
...
if (is_method("BYE")) {
	launch(rtpengine_delete());
}
...		

```
### $rtpstat Usage

Returns the RTP statistics from the RTP proxy. The RTP statistics from the RTP proxy are provided as a string and it does contain several packet counters.

```opensips
...
    append_hf("X-RTP-Statistics: $rtpstat\\r\\n");
...		

```
### $rtpstat(STAT)

Returnes one of the pre-fined statistics listed below.

```opensips
...
    xlog("Average MOS of the entire call is $rtpstat(MOS-average)\\r\\n");
    xlog("Average MOS of caller is $(rtpstat(MOS-average)\[$ft\])\\r\\n");
    xlog("Average MOS of callee is $(rtpstat(MOS-average)\[$tt\])\\r\\n");
    xlog("Min MOS of caller is $(rtpstat(MOS-min)\[$ft\]) reported at $(rtpstat(MOS-min-at)\[$ft\])\\r\\n");
...		

```
### $rtpquery Usage

Does a Query command to the RTP proxy and returns the answer in a JSON format.

```opensips
...
	$json(reply) := $rtpquery;
	xlog("Total RTP Stats: $json(reply/totals)\\n");
...		

```
### `rtpengine:enable` usage

Enables/disables a RTP proxy.

```opensips
...
## disable all rtpengines by URL
$ opensips-cli -x mi rtpengine:enable udp:192.168.2.133:8081 0
## enable rtpengine by URL and set ID (3)
$ opensips-cli -x mi rtpengine:enable url=udp:192.168.2.133:8081 enable=1 setid=3
...

```
### `rtpengine:show` usage

Displays all the RTP proxies and their information: set and status (disabled or not, weight and recheck_ticks).

```opensips
...
$ opensips-cli -x mi rtpengine:show
...

```
### `rtpengine:reload` usage

Reloads all rtpengine sets from the database. Used only when the “[db_url](#param_db_url "1.4.10.db_url (string)")” parameter is set.

```opensips
...
$ opensips-cli -x mi rtpengine:reload
$ opensips-cli -x mi rtpengine:reload type=soft
...

```
### `teardown` usage

Terminates the SIP dialog by the SIP Call-ID given as parameter.

```opensips
...
$ opensips-cli -x mi teardown Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY0ZDQ
...

```
