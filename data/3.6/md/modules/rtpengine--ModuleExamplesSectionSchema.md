# rtpengine Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6427472)

3.2. [Most recently active contributors(1) to this module](#idp6558064)

**List of Examples**

1.1. [Set `rtpengine_sock` parameter](#idp5571968)

1.2. [Set `rtpengine_disable_tout` parameter](#idp5578528)

1.3. [Set `rtpengine_tout` parameter](#idp5583728)

1.4. [Set `rtpengine_retr` parameter](#idp5588656)

1.5. [Set `rtpengine_timer_interval` parameter](#idp5593408)

1.6. [Set `notification_sock` parameter](#idp5599520)

1.7. [Set `extra_id_pv` parameter](#idp5604352)

1.8. [Set `setid_avp` parameter](#idp5608912)

1.9. [Set `error_pv` parameter](#idp5613424)

1.10. [Set `db_url` parameter](#idp5618560)

1.11. [Set `db_table` parameter](#idp5623216)

1.12. [Set `socket_column` parameter](#idp5627808)

1.13. [Set `set_column` parameter](#idp5632400)

1.14. [Set `ping_enabled` parameter](#idp5638480)

1.15. [`rtpengine_use_set` usage](#idp5644320)

1.16. [`rtpengine_offer` usage](#idp5741696)

1.17. [`rtpengine_offer` usage with body replace](#idp5745088)

1.18. [`rtpengine_offer` usage with call recording](#idp5747248)

1.19. [`rtpengine_offer` usage for transcoding](#idp251104)

1.20. [Set `extra_failover_error` parameter](#idp258176)

1.21. [`rtpengine_answer` usage](#idp5771392)

1.22. [`rtpengine_delete` usage](#idp5776752)

1.23. [`rtpengine_manage` usage](#idp5791312)

1.24. [`rtpengine_start_recording` usage](#idp5799872)

1.25. [`rtpengine_stop_recording` usage](#idp5808432)

1.26. [`rtpengine_pause_recording` usage](#idp5817232)

1.27. [Ringback tone using `rtpengine_play_media`](#idp5830384)

1.28. [Manage music on hold using `rtpengine_play_media`](#idp5832576)

1.29. [Ringback tone stop using `rtpengine_stop_media`](#idp5842192)

1.30. [Example use of the last-frame-pos parameter `rtpengine_stop_media`](#idp5844304)

1.31. [Example of `rtpengine_block_media` usage](#idp5850544)

1.32. [Example of `rtpengine_unblock_media` usage](#idp5856112)

1.33. [Example of `rtpengine_block_dtmf` usage](#idp5861680)

1.34. [Example of `rtpengine_unblock_dtmf` usage](#idp5867264)

1.35. [Example of `rtpengine_start_forwarding` usage](#idp5873040)

1.36. [Example of `rtpengine_stop_forwarding` usage](#idp5878176)

1.37. [Example of `rtpengine_play_dtmf` usage](#idp5887408)

1.38. [Example of async rtpengine\_offer() usage](#idp5892944)

1.39. [Example of async rtpengine\_answer() usage](#idp5897392)

1.40. [Example of async rtpengine\_delete() usage](#idp5902048)

1.41. [$rtpstat Usage](#idp5908160)

1.42. [$rtpstat(STAT)](#idp5942080)

1.43. [$rtpquery Usage](#idp5947728)

1.44. [`rtpengine_enable` usage](#idp5958608)

1.45. [`rtpengine_show` usage](#idp5963760)

1.46. [`rtpengine_reload` usage](#idp5970816)

1.47. [`teardown` usage](#idp5978080)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is a module that enables media streams to be proxied via an RTP proxy. The only RTP proxy currently known to work with this module is the Sipwise rtpengine [https://github.com/sipwise/rtpengine](https://github.com/sipwise/rtpengine). The rtpengine module is a modified version of the original rtpproxy module using a new control protocol. The module is designed to be a drop-in replacement for the old module from a configuration file point of view, however due to the incompatible control protocol, it only works with RTP proxies which specifically support it.

## 1.2.�Multiple RTP proxy usage

The rtpengine module can support multiple RTP proxies for balancing/distribution and control/selection purposes.

The module allows definition of several sets of rtpengines. Load-balancing will be performed over a set and the admin has the ability to choose what set should be used. The set is selected via its id - the id being defined with the set. Refer to the “[rtpengine\_sock](#param_rtpengine_sock "1.4.1.�rtpengine_sock (string)")” module parameter definition for syntax description.

The balancing inside a set is done automatically by the module based on the weight of each RTP proxy from the set.

The selection of the set is done from script prior using rtpengine\_delete(), rtpengine\_offer() or rtpengine\_answer() functions - see the rtpengine\_use\_set() function.

Another way to select the set is to define setid\_avp module parameter and assign setid to the defined avp before calling rtpengine\_offer() or rtpengine\_manage() function. If forwarding of the requests fails and there is another branch to try, remember to unset the avp after calling rtpengine\_delete() function.

For backward compatibility reasons, a set with no id take by default the id 0. Also if no set is explicitly set before rtpengine\_delete(), rtpengine\_offer() or rtpengine\_answer() the 0 id set will be used.

IMPORTANT: if you use multiple sets, take care and use the same set for both rtpengine\_offer()/rtpengine\_answer() and rtpengine\_delete()!! If the set was selected using setid\_avp, the avp needs to be set only once before rtpengine\_offer() or rtpengine\_manage() call.

The module is able to failover to a new node within a set, if a chosen one has communication issues. Moreover, it will also failover if the node returns one of the following errors:

*   Parallel session limit reached
    
*   Ran out of ports
    

You can use the [extra\_failover\_error](#param_extra_failover_error "1.5.2.1.�extra_failover_error (string)") parameter to extend the above list.

Many rtpengine\_\* functions accept a "sock\_var" parameter that will be populated with the socket of the RTPEngine chosen for the particular operation. The format of the data stored in "sock\_var" is: "proto:ip:port". If the "sock\_var" has been specified and it is non-NULL then it will be used to determine the specific RTPEngine to use. Note that the socket specified by "sock\_var" must be a member of the current RTPEngine Set context.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tm module_ - (optional) if you want to have rtpengine\_manage() fully functional
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`rtpengine_sock` (string)

Definition of socket(s) used to connect to (a set) RTP proxy. It may specify a UNIX socket or an IPv4/IPv6 UDP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

_Default value is “NONE” (disabled)._

**Example�1.1.�Set `rtpengine_sock` parameter**

...
# single rtproxy
modparam("rtpengine", "rtpengine\_sock", "udp:localhost:12221")
# multiple rtproxies for LB
modparam("rtpengine", "rtpengine\_sock",
	"udp:localhost:12221 udp:localhost:12222")
# multiple sets of multiple rtproxies
modparam("rtpengine", "rtpengine\_sock",
	"1 == udp:localhost:12221 udp:localhost:12222")
modparam("rtpengine", "rtpengine\_sock",
	"2 == udp:localhost:12225")
...

  

### 1.4.2.�`rtpengine_disable_tout` (integer)

Once an RTP proxy was found unreachable and marked as disabled, the rtpengine module will not attempt to establish communication to that RTP proxy for rtpengine\_disable\_tout seconds.

_Default value is “60”._

**Example�1.2.�Set `rtpengine_disable_tout` parameter**

...
modparam("rtpengine", "rtpengine\_disable\_tout", 20)
...

  

### 1.4.3.�`rtpengine_tout` (integer)

Timeout value in waiting for reply from RTP proxy.

_Default value is “1”._

**Example�1.3.�Set `rtpengine_tout` parameter**

...
modparam("rtpengine", "rtpengine\_tout", 2)
...

  

### 1.4.4.�`rtpengine_retr` (integer)

How many times the module should retry to send and receive after timeout was generated.

_Default value is “5”._

**Example�1.4.�Set `rtpengine_retr` parameter**

...
modparam("rtpengine", "rtpengine\_retr", 2)
...

  

### 1.4.5.�`rtpengine_timer_interval` (integer)

Frequency to scan rtpengine sets for disabled node probing. Probing is done outside the SIP processing context and in a separate timer routine. Disabled nodes are probed for re-enablement after rtpengine\_disable\_tout seconds. Setting this value too high can lead to unexpectedly large disabled interval as the max interval before probing is (rtpengine\_timer\_interval + rtpengine\_disable\_tout) seconds.

Default value is “5”.

**Example�1.5.�Set `rtpengine_timer_interval` parameter**

...
modparam("rtpengine", "rtpengine\_timer\_interval", 1)
...

  

### 1.4.6.�`notification_sock` (string)

An UDP socket formatted as _IP:port_ that indicates the listening IP and port OpenSIPS will bind for to receive notifications (such as DTMF events) from RTPengine.

Every notification received from RTPengine will trigger an _E\_RTPENGINE\_NOTIFICATION_ event.

_Default value is “none” - notifications are ignored._

**Example�1.6.�Set `notification_sock` parameter**

...
modparam("rtpengine", "notification\_sock", "127.0.0.1:9999")
...

  

### 1.4.7.�`extra_id_pv` (string)

The parameter sets the PV definition to use when the “via-branch=extra” option is used on the rtpengine\_delete(), rtpengine\_offer(), rtpengine\_answer() or rtpengine\_manage() commands.

Default is empty, the “via-branch=extra” option may not be used then.

**Example�1.7.�Set `extra_id_pv` parameter**

...
modparam("rtpengine", "extra\_id\_pv", "$avp(extra\_id)")
...

  

### 1.4.8.�`setid_avp` (string)

The parameter defines an AVP that, if set, determines which RTP proxy set rtpengine\_offer(), rtpengine\_answer(), rtpengine\_delete(), and rtpengine\_manage() functions use.

There is no default value.

**Example�1.8.�Set `setid_avp` parameter**

...
modparam("rtpengine", "setid\_avp", "$avp(setid)")
...

  

### 1.4.9.�`error_pv` (string)

The parameter defines a variable that shall be populated by RTP when one of the rtpengine\_\* functions fail.

There is no default value.

**Example�1.9.�Set `error_pv` parameter**

...
modparam("rtpengine", "error\_pv", "$var(rtpengine\_error)")
...

  

### 1.4.10.�`db_url` (string)

Database URL, used to load RTPEngines sockets from db, instead of specifying them in the script ([rtpengine\_sock](#param_rtpengine_sock "1.4.1.�rtpengine_sock (string)") module parameter).

Default value is “NULL”, no database is used.

**Example�1.10.�Set `db_url` parameter**

...
modparam("rtpengine", "db\_url", 
		"mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.4.11.�`db_table` (string)

The table where the RTPEngines sockets are stored. Used when Database URL is provisioned.

Default value is “rtpengine”.

**Example�1.11.�Set `db_table` parameter**

...
modparam("rtpengine", "db\_table", "rtpengine\_new")
...

  

### 1.4.12.�`socket_column` (string)

The name of the rtpengine socket column in the database table.

Default value is “socket”.

**Example�1.12.�Set `socket_column` parameter**

...
modparam("rtpengine", "socket\_column", "sock")
...

  

### 1.4.13.�`set_column` (string)

The name of the rtpengine set column in the database table.

Default value is “set\_id”.

**Example�1.13.�Set `set_column` parameter**

...
modparam("rtpengine", "set\_column", "set\_new")
...

  

### 1.4.14.�`ping_enabled` (integer)

This parameter indicates whether probing should be done for enabled nodes as well.

If this parameter is set, each enabled node is pinged every [rtpengine\_timer\_interval](#param_rtpengine_timer_interval "1.4.5.�rtpengine_timer_interval (integer)") seconds, unless there was any communication with the node since the previous interval.

_Default value is “0” (disabled)._

**Example�1.14.�Set `ping_enabled` parameter**

...
modparam("rtpengine", "ping\_enabled", yes)
...

  

## 1.5.�Exported Functions

### 1.5.1.� `rtpengine_use_set(setid)`

Sets the ID of the RTP proxy set to be used for the next rtpengine\_delete(), rtpengine\_offer(), rtpengine\_answer() or rtpengine\_manage() command. The parameter is an integer.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE.

**Example�1.15.�`rtpengine_use_set` usage**

...
rtpengine\_use\_set(2);
rtpengine\_offer();
...

  

### 1.5.2.� `rtpengine_offer([flags[, sock_var[, sdp_pvar[, body]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on INVITE for the cases the SDPs are in INVITE and 200 OK and on 200 OK when SDPs are in 200 OK and ACK.

Meaning of the parameters is as follows:

*   _flags(string, optional)_ - flags to turn on some features.
    
    The “flags” string is a list of space-separated items. Each item is either an individual token, or a token in “key=value” format. The possible tokens are described below.
    
    When passing an option that OpenSIPS is not aware of, it will be blindly sent to the rtpengine daemon to be processed.
    
    *   _via-branch=..._ - Include the “branch” value of one of the “Via” headers in the request to the RTP proxy. Possible values are: “1” - use the first “Via” header; “2” - use the second “Via” header; “auto” - use the first “Via” header if this is a request, or the second one if this is a reply; “extra” - don't take the value from a header, but instead use the value of the “[extra\_id\_pv](#param_extra_id_pv "1.4.7.�extra_id_pv (string)")” variable. This can be used to create one media session per branch on the RTP proxy. When sending a subsequent “delete” command to the RTP proxy, you can then stop just the session for a specific branch when passing the flag '1' or '2' in the “rtpengine\_delete”, or stop all sessions for a call when not passing one of those two flags there. This is especially useful if you have serially forked call scenarios where the RTP proxy gets an “offer” command for a new branch, and then a “delete” command for the previous branch, which would otherwise delete the full call, breaking the subsequent “answer” for the new branch. _This flag is only supported by the Sipwise rtpengine RTP proxy at the moment!_
        
    *   _via-branch-param=..._ - provide a custom value for the _via-branch_ param.
        
    *   _call-id_ - provide a custom Call-ID for the session. If missing, the Call-Id of the request/reply is used.
        
    *   _from-tag_ - provide a custom from-tag for the session. If missing, the from-tag request is used.
        
    *   _to-tag_ - provide a custom to-tag of the session. If missing, the to-tag of the request/reply is used, is present.
        
    *   _asymmetric_ - flags that UA from which message is received doesn't support symmetric RTP. (automatically sets the 'r' flag)
        
    *   _force-answer_ - force “answer”, that is, only rewrite SDP when corresponding session already exists in the RTP proxy. By default is on when the session is to be completed.
        
    *   _in-iface=..., out-iface=..._ - these flags specify the direction the SIP message. These flags only make sense when the RTP proxy is running in bridge mode. “in-iface” should indicate the proxy's inbound interface, and “out-iface” corresponds to the RTP proxy's outbound interface. You always have to specify two flags to define the incoming network and the outgoing network. For example, “in-iface=internal out-iface=external” should be used for SIP message received from the local interface and sent out on the external interface.
        
    *   _internal, external_ - these the old flags used to specify the direction of call. They are now obsolate, being replaced by the “in-iface=internal out-iface=external” configuration.
        
    *   _auto-bridge_ - this flag an alternative to the “internal” and “external” flags in order to do automatic bridging between IPv4 on the "internal network" and IPv6 on the "external network". Instead of explicitly instructing the RTP proxy to select a particular address family, the distinction is done by the given IP in the SDP body by the RTP proxy itself. Not supported by Sipwise rtpengine.
        
    *   _address-family=..._ - instructs the RTP proxy that the recipient of this SDP body expects to see addresses of a particular family. Possible values are “IP4” and “IP6”. For example, if the SDP body contains IPv4 addresses but the recipient only speaks IPv6, you would use “address-family=IP6” to bridge between the two address families.
        
        Sipwise rtpengine remembers the address family preference of each party after it has seen an SDP body from them. This means that normally it is only necessary to explicitly specify the address family in the “offer”, but not in the “answer”.
        
        Note: Please note, that this will only work properly with non-dual-stack user-agents or with dual-stack clients according to RFC6157 (which suggest ICE for Dual-Stack implementations). This short-cut will not work properly with RFC4091 (ANAT) compatible clients, which suggests having different m-lines with different IP-protocols grouped together.
        
    *   _received-from=..._ - sets the address from which SIP packet with SDP received. This flag always set automatically, don't use it until you have a reason for that.
        
    *   _force_ - instructs the RTP proxy to ignore marks inserted by another RTP proxy in transit to indicate that the session is already goes through another proxy. Allows creating a chain of proxies. Not supported and ignored by Sipwise rtpengine.
        
    *   _trust-address_ - flags that IP address in SDP should be trusted. Without this flag, the RTP proxy ignores address in the SDP and uses source address of the SIP message as media address which is passed to the RTP proxy. From rtpengine 3.8 this is the default behaviour.
        
    *   _SIP-source-address_ - the opposite of trust-address. Restores the old default behaviour of ignoring endppoint of the addresses in the SDP body.
        
    *   _replace-origin_ - flags that IP from the origin description (o=) should be also changed.
        
    *   _replace-session-connection_ - flags to change the session-level SDP connection (c=) IP if media description also includes connection information.
        
    *   _replace-zero-address_ - flags to replace zero address with real address. Using a zero endpoint address is an obsolete way to signal a muted or sendonly stream. Streams with zero addresses are normally flagged as sendonly and the zero address in the SDP is passed through.
        
    *   _symmetric_ - flags that for the UA from which message is received, support symmetric RTP must be forced. You do not need to explicitly specify this value, as it is the default, and the behavior is only changed when the _asymmetric_ is used.
        
    *   _repacketize=NN_ - requests the RTP proxy to perform re-packetization of RTP traffic coming from the UA which has sent the current message to increase or decrease payload size per each RTP packet forwarded if possible. The NN is the target payload size in ms, for the most codecs its value should be in 10ms increments, however for some codecs the increment could differ (e.g. 30ms for GSM or 20ms for G.723). The RTP proxy would select the closest value supported by the codec. This feature could be used for significantly reducing bandwith overhead for low bitrate codecs, for example with G.729 going from 10ms to 100ms saves two thirds of the network bandwith. Not supported by Sipwise rtpengine.
        
    *   _loop-protect_ - flag that instructs RTP to avoid rewriting the SDP when looping the same message.
        
    *   _ICE=..._ - controls the RTP proxy's behaviour regarding ICE attributes within the SDP body. Possible values are: “force” - discard any ICE attributes already present in the SDP body and then generate and insert new ICE data, leaving itself as the _only_ ICE candidates; “remove” instructs the RTP proxy to discard any ICE attributes and not insert any new ones into the SDP. The default (if no “ICE=...” is given at all), new ICE data will only be generated if no ICE was present in the SDP originally; otherwise the RTP proxy will only insert itself as an _additional_ ICE candidate. Other SDP substitutions (c=, m=, etc) are unaffected by this flag.
        
    *   _RTP, SRTP, AVP, AVPF_ - These flags control the RTP transport protocol that should be used towards the recipient of the SDP. If none of them are specified, the protocol given in the SDP is left untouched. Otherwise, the “SRTP” flag indicates that SRTP should be used, while “RTP” indicates that SRTP should not be used. “AVPF” indicates that the advanced RTCP profile with feedback messages should be used, and “AVP” indicates that the regular RTCP profile should be used. See also the next set of flags below.
        
    *   _RTP/AVP, RTP/SAVP, RTP/AVPF, RTP/SAVPF_ - these serve as an alternative, more explicit way to select between the different RTP protocols and profiles supported by the RTP proxy. For example, giving the flag “RTP/SAVPF” has the same effect as giving the two flags “SRTP AVPF”.
        
    *   _to-tag_ - force inclusion of the “To” tag. Normally, the “To” tag is always included when present, except for “delete” messages. Including the “To” tag in a “delete” messages allows you to be more selective about which dialogues within a call are being torn down.
        
    *   _to-tag=..._ - use the specified string as “To” tag instead of the actual “To” tag from the SIP message, and force inclusion of the tag in the message as per above.
        
    *   _from-tag=..._ - use the specified string as “From” tag instead of the actual “From” tag from the SIP message.
        
    *   _call-id=..._ - use the specified string as “Call-ID” instead of the actual “Call-ID” from the SIP message.
        
    *   _rtcp-mux-demux_ - if rtcp-mux (RFC 5761) was offered, make the RTP proxy accept the offer, but not offer it to the recipient of this message.
        
    *   _rtcp-mux-reject_ - if rtcp-mux was offered, make the RTP proxy reject the offer, but still offer it to the recipient. Can be combined with “rtcp-mux-offer” to always offer it.
        
    *   _rtcp-mux-offer_ - make the RTP proxy offer rtcp-mux to the recipient of this message, regardless of whether it was offered originally or not.
        
    *   _rtcp-mux-require_ - Similar to offer but pretends that the client has accepted rtcp-mux. This breaks RFC 5761 and will not advertise seperate RTCP ports. This option is necessary for WebRTC clients.
        
    *   _rtcp-mux-accept_ - if rtcp-mux was offered, make the RTP proxy accept the offer and also offer it to the recipient of this message. Can be combined with “rtcp-mux-offer” to always offer it.
        
    *   _media-address=..._ - force a particular media address to be used in the SDP body. Address family is detected automatically.
        
    *   _record-call=yes/no_ - indicates whether rtpengine should record the call or not. When using this parameter, you may pass further information in the “metadata”.
        
    *   _transcode-CODEC_ - used only for offer, indicates that rtpengine should transcode the CODEC towards the B-side. Example: _transcode-PCMA_ will present to the B-side the PCMA codec.
        
    *   _codec-strip-CODEC_ - used only for offer, indicates that the A-side of the call will not end up talking CODEC. Example: _codec-strip-PCMA_ will prevent the A-side from receiving the PCMA codec.
        
    *   _codec-mask-CODEC_ - used only for offer, indicates that the A-side will use the CODEC, but it will not be presented to the B-side. Example: _codec-mask-PCMA_ will make the A-side receive the PCMA codec, but B-side will use something else.
        
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    
*   _sdp\_var(var, optional)_ - variable used to store the full SDP received from rtpengine. You can perform any additional changes on this string. _Important:_ when providing this variable, the message body is no longer changed, so you have to manually replace it!.
    
*   _body(string, optional)_ - used to provide a specific body to the rtpengine\_\* function. If this parameter is missing the body of the current message is used.
    

This function can be used from ALL\_ROUTES.

**Example�1.16.�`rtpengine_offer` usage**

route {
...
    if (is\_method("INVITE")) {
        if (has\_body("application/sdp")) {
            if (rtpengine\_offer())
                t\_on\_reply("1");
        } else {
            t\_on\_reply("2");
        }
    }
    if (is\_method("ACK") && has\_body("application/sdp"))
        rtpengine\_answer();
...
}

onreply\_route\[1\]
{
...
    if (has\_body("application/sdp"))
        rtpengine\_answer();
...
}

onreply\_route\[2\]
{
...
    if (has\_body("application/sdp"))
        rtpengine\_offer();
...
}

  

**Example�1.17.�`rtpengine_offer` usage with body replace**

...
if (rtpengine\_offer(, $var(socket), $var(body), $rb)) {
    xlog("Used rtpengine $var(socket)\\n");
    # make all the changes on the resulted SDP in $var(body)
    ...
    remove\_body\_part();
    add\_body\_part($var(body), "application/sdp");
}
...

  

**Example�1.18.�`rtpengine_offer` usage with call recording**

...
$var(rtpengine\_flags) = $var(rtpengine\_flags) + " record-call=yes";

$json(recording\_keys) := "{}";
$json(recording\_keys/callId) = $ci;
$json(recording\_keys/fromUser) = $dlg\_val(recording\_from\_user);
$json(recording\_keys/fromDomain) = $dlg\_val(recording\_from\_domain);
$json(recording\_keys/fromTag) = $dlg\_val(recording\_from\_tag);
$json(recording\_keys/toUser) = $dlg\_val(recording\_to\_user);
$json(recording\_keys/toDomain) = $dlg\_val(recording\_to\_domain);

$var(rtpengine\_flags) = $var(rtpengine\_flags) + " metadata=" + $(json(recording\_keys){s.encode.hexa});
rtpengine\_offer($var(rtpengine\_flags));
...

  

**Example�1.19.�`rtpengine_offer` usage for transcoding**

...
# Goal: make A-side talk PCMA and B-side talk opus
# \* do not present PCMA to B-side: codec-mask-PCMA, but use it on A-side
# \* do not use opus for A-side: codec-strip-opus
# \* offer opus to B-side: transcode-opus
rtpengine\_offer("... codec-mask-PCMA codec-strip-opus transcode-opus ...");
...

  

#### 1.5.2.1.�`extra_failover_error` (string)

Contains a (XDB) regular expression that can be used to match an error received from a RTPEngine node. If matched the module tries to use a new node to handle the affected command.

This parameter can be used to extend the list (see [Failover](#param_failover) of errors the module implicitely fails over.

_Note_ each declaration will define a single expression/matching rule. If you want to define multiple rules, you need to define the parameter multiple times.

Default value is empty, no extra errors are being used.

**Example�1.20.�Set `extra_failover_error` parameter**

...
modparam("rtpengine", "extra\_failover\_error", "Parallel session limit reached")
...

  

### 1.5.3.� `rtpengine_answer([flags[, sock_pvar[, sdp_pvar[, body]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on 200 OK for the cases the SDPs are in INVITE and 200 OK and on ACK when SDPs are in 200 OK and ACK.

See rtpengine\_offer() function description above for the meaning of the parameters.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.21.�`rtpengine_answer` usage**

See rtpengine\_offer() function example above for examples.

  

### 1.5.4.� `rtpengine_delete([flags[, sock_var]])`

Tears down the RTPEngine session for the current call.

See rtpengine\_offer() function description above for the meaning of the parameters. Note that not all flags make sense for a “delete”.

This function can be used from ALL\_ROUTES.

**Example�1.22.�`rtpengine_delete` usage**

...
rtpengine\_delete();
...

  

### 1.5.5.� `rtpengine_manage([flags[, sock_var[, sdp_var[, body]]]])`

Manage the RTPEngine session - it combines the functionality of rtpengine\_offer(), rtpengine\_answer() and rtpengine\_delete(), detecting internally based on message type and method which one to execute.

It can take the same parameters as `rtpengine_offer().` The flags parameter to rtpengine\_manage() can be a configuration variable containing the flags as a string.

Functionality:

*   If INVITE with SDP, then do `rtpengine_offer()`
    
*   If ACK with SDP, then do `rtpengine_answer()`
    
*   If BYE or CANCEL, or called within a FAILURE\_ROUTE\[\], then do `rtpengine_delete()`
    
*   If reply to INVITE with code >= 300 do `rtpengine_delete()`
    
*   If reply with SDP to INVITE having code 1xx and 2xx, then do `rtpengine_answer()` if the request had SDP or tm is not loaded, otherwise do `rtpengine_offer()`
    

This function can be used from ALL\_ROUTES.

**Example�1.23.�`rtpengine_manage` usage**

...
rtpengine\_manage();
...

  

### 1.5.6.� `rtpengine_start_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to record the RTP stream on the RTP proxy.

Meaning of the parameters is as follows:

*   _flags(string, optional)_ - flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    

This function can be used from any route.

**Example�1.24.�`rtpengine_start_recording` usage**

...
rtpengine\_start\_recording();
...
		

  

### 1.5.7.� `rtpengine_stop_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to stop recording the RTP stream on the RTP proxy.

Meaning of the parameters is as follows:

*   _flags(string, optional)_ - flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    

This function can be used from any route.

**Example�1.25.�`rtpengine_stop_recording` usage**

...
rtpengine\_stop\_recording();
...
		

  

### 1.5.8.� `rtpengine_pause_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to pause recording the RTP stream on the RTP proxy. Identical to stop recording except that it instructs the recording daemon not to close the recording file, but instead leave it open so that recording can later be resumed via another start recording message.

Meaning of the parameters is as follows:

*   _flags(string, optional)_ - flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    

This function can be used from any route.

**Example�1.26.�`rtpengine_pause_recording` usage**

...
rtpengine\_stop\_recording();
...
		

  

### 1.5.9.� `rtpengine_play_media(flags, [duration_spec[, sock_var[, sockvar]]])`

This function will start playing a media file to one of the endpoints.

Meaning of the parameters is as follows:

*   _flags(string)_ - a list of flags similar to the other functions. One of the _file_, _blob_ or _db-id_ parameters is mandatory to indicate the content of the media file to be played. _file_ is a common choice for specifying rtpengine to get media from a file path, _blob_ to take the content from an inline string and _db-id_ to get the content from the database.
    
    The direction of the media stream is controlled by the _from-tag_ parameter, _address_ (media address from the SDP), or _label_, if the media stream contains a label. If all of them are missing, the media file is played to the initiator of the SIP request, and will work similar to a ringback tone.
    
*   _duration\_spec(var, optional)_ - a pseudo variable that will contain the duration of the played file. It will be set to _\-1_ if the duration could not be determined.
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    

This function can be used from any route.

**Example�1.27.�Ringback tone using `rtpengine_play_media`**

...
if (is\_method("INVITE") && !has\_totag())
	rtpengine\_play\_media("file=/path/to/ringback\_tone\_file.wav");
...
		

  

**Example�1.28.�Manage music on hold using `rtpengine_play_media`**

...
if (is\_method("INVITE") && has\_totag()) {
	if (is\_audio\_on\_hold()) {
		$dlg\_val(on\_hold) = "1";
		rtpengine\_play\_media("from-tag=$tt file=/path/to/moh\_file.wav");
	} else if ($dlg\_val(on\_hold) == "1") {
		$dlg\_val(on\_hold) = "0";
		rtpengine\_stop\_media("from-tag=$tt");
	}
}
...
		

  

### 1.5.10.� `rtpengine_stop_media(flags[, [sock_var[, sockvar]], [last_frame_pos]])`

This function will stop playing a media file previously started by a `rtpengine_play_media()` call. The meaning of its parameters is similar to the previous functions. Note that this function should be called with similar parameters as its matching `rtpengine_play_media()` call, otherwise RTPEngine will not be able to stop media playing.

Meaning of the parameters is as follows:

*   _flags(string)_ - a list of flags similar to the other functions.
    
*   _last\_frame\_pos(var, optional)_ - a pseudo variable that will contain the last frame played of the file.
    

This function can be used from any route.

**Example�1.29.�Ringback tone stop using `rtpengine_stop_media`**

...
if (is\_method("INVITE") && $rs == 200)
	rtpengine\_stop\_media();
...
		

  

**Example�1.30.�Example use of the last-frame-pos parameter `rtpengine_stop_media`**

...
if (is\_method("INVITE") && has\_totag()) {
	if (is\_audio\_on\_hold()) {
		$dlg\_val(on\_hold = "1";
		rtpengine\_play\_media("from-tag=$tt start-pos=$avp(last\_frame\_pos) file=/path/to/moh\_file.wav");
	} else if ($dlg\_val(on\_hold) == "1") {
		rtpengine\_stop\_media("from-tag=$tt", , $avp(last\_frame\_pos));
		$dlg\_val(on\_hold = "0");
	}
}
	rtpengine\_stop\_media();
...
		

  

### 1.5.11.� `rtpengine_block_media([flags[, sockvar]])`

This function will block the media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.31.�Example of `rtpengine_block_media` usage**

...
rtpengine\_block\_media();
...
		

  

### 1.5.12.� `rtpengine_unblock_media([flags[, sockvar]])`

This function will resume/unblock the media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.32.�Example of `rtpengine_unblock_media` usage**

...
rtpengine\_unblock\_media();
...
		

  

### 1.5.13.� `rtpengine_block_dtmf([flags[, sockvar]])`

This function will block the DTMF media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.33.�Example of `rtpengine_block_dtmf` usage**

...
rtpengine\_block\_dtmf();
...
		

  

### 1.5.14.� `rtpengine_unblock_dtmf([flags[, sockvar]])`

This function will resume/unblock the DTMF media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.34.�Example of `rtpengine_unblock_dtmf` usage**

...
rtpengine\_unblock\_dtmf();
...
		

  

### 1.5.15.� `rtpengine_start_forwarding([flags[, sockvar]])`

This function will start forwarding the media to a TLS destination specified in the _tls-send-to_ parmeter of RTPEngine. This function allows you to select the media stream to forward, by specifing the _from-tag_ of the entity you want to forward the media. If missing, all media streams are forwarded.

This function can be used from any route.

**Example�1.35.�Example of `rtpengine_start_forwarding` usage**

...
rtpengine\_start\_forwarding();
...
		

  

### 1.5.16.� `rtpengine_stop_forwarding([flags[, sockvar]])`

This function will stop forwarding of the media previously started using the _rtpengine\_start\_forwarding()_ function.

This function can be used from any route.

**Example�1.36.�Example of `rtpengine_stop_forwarding` usage**

...
rtpengine\_stop\_forwarding();
...
		

  

### 1.5.17.� `rtpengine_play_dtmf(code, [flags[, sockvar]])`

This function instructs RTP to send the DTMF _code_ to the participant of the call. The _code_ can be a digit (“0-9”) or a special character (one of “\*,#,A,B,C,D”). Additional parameters can be configured using the _flags_ parameter. For more information, please consult the RTP documentation.

_NOTE:_ if you are planning to inject DTMF in a session, you have to specify the _inject-DTMF_ flag when the session is created.

This function can be used to convert SIP INFO DTMF keys to RTP DTMF.

This function can be used from any route.

**Example�1.37.�Example of `rtpengine_play_dtmf` usage**

...
rtpengine\_play\_dtmf("0"); # send the 0 code upstream
...
		

  

## 1.6.�Exported Asyncronous Functions

### 1.6.1.�`rtpengine_offer([flags[, sock_pvar[, sdp_pvar[, body]]]])`

The asynchronous flavor of the [rtpengine\_offer()](#func_rtpengine_offer "1.5.2.� rtpengine_offer([flags[, sock_var[, sdp_pvar[, body]]]])") function. It receives the same parameters, with the same meanings.

**Example�1.38.�Example of async rtpengine\_offer() usage**

...
if (is\_method("ACK") && has\_totag() && has\_body\_part("application/sdp")) {
	async(rtpengine\_offer(), resume\_invite);
}
...
route\[resume\_invite\] {
	t\_relay();
}
...
		

  

### 1.6.2.�`rtpengine_answer([flags[, sock_pvar[, sdp_pvar[, body]]]])`

The asynchronous flavor of the [rtpengine\_answer()](#func_rtpengine_answer "1.5.3.� rtpengine_answer([flags[, sock_pvar[, sdp_pvar[, body]]]])") function. It receives the same parameters, with the same meanings.

**Example�1.39.�Example of async rtpengine\_answer() usage**

...
if (is\_method("ACK") && has\_body\_part("application/sdp")) {
	# late negotiation
	async(rtpengine\_answer(), resume\_ack);
}
...
route\[resume\_ack\] {
	t\_relay();
}
...
		

  

### 1.6.3.� `rtpengine_delete([flags[, sock_var]])`

The asynchronous flavor of the [rtpengine\_delete()](#func_rtpengine_delete "1.5.4.� rtpengine_delete([flags[, sock_var]])") function. It receives the same parameters, with the same meanings.

**Example�1.40.�Example of async rtpengine\_delete() usage**

...
if (is\_method("BYE")) {
	launch(rtpengine\_delete());
}
...
		

  

## 1.7.�Exported Pseudo-Variables

### 1.7.1.�`$rtpstat`

Returns the RTP statistics from the RTP proxy. The RTP statistics from the RTP proxy are provided as a string and it does contain several packet counters.

**Example�1.41.�$rtpstat Usage**

...
    append\_hf("X-RTP-Statistics: $rtpstat\\r\\n");
...
		

  

### 1.7.2.�`$rtpstat(STAT)[index]`

Returnes one of the pre-fined statistics listed below:

*   _MOS-average_ - without an index, it returns the average MOS value, expressed in an integer between 0 and 50, of all the RTP streams involved in the call, both caller and callee. If index is specified, it has to be one of the _from-tag_ or _to-tag_ involved in the call. In this case, the variable will return the average MOS of all the streams generated by that endpoint with the associated tag value. If you need more granular statistics, check the _$rtpquery_ variable.
    
*   _jitter-average_ - similar behavior with _MOS-average_, but returnes the average jitter.
    
*   _roundtrip-average_ - similar behavior with _MOS-average_, but returnes the average roundtrip.
    
*   _packetloss-average_ - similar behavior with _MOS-average_, but returnes the average packet loss.
    
*   _MOS-min_ - without an index, it returns the minimum MOS value (integer value between 0 and 50) of all RTP streams involved in the call, both caller and callee. If the index is specified, it has the same effect as for _MOS-average_.
    
*   _jitter-min_ - similar behavior with _MOS-min_, but returnes the minimum jitter of a leg/call.
    
*   _roundtrip-min_ - similar behavior with _MOS-min_, but returnes the minimum roundtrip of a leg/call.
    
*   _packetloss-min_ - similar behavior with _MOS-min_, but returnes the minimum packet loss of a leg/call.
    
*   _MOS-max_ - without an index, it returns the maximum MOS value (integer value between 0 and 50) of all RTP streams involved in the call, both caller and callee. If the index is specified, it has the same effect as for _MOS-average_.
    
*   _jitter-max_ - similar behavior with _MOS-max_, but returnes the maximum jitter of a leg/call.
    
*   _roundtrip-max_ - similar behavior with _MOS-max_, but returnes the maximum roundtrip of a leg/call.
    
*   _packetloss-max_ - similar behavior with _MOS-max_, but returnes the maximum packet loss of a leg/call.
    
*   _MOS-min-at_ - without an index, it returns the time in seconds elapsed from the start of the call when the MOS value is minimum. If the index is specified, it has the same effect as for _MOS-average_.
    
*   _jitter-min-at_ - similar behavior with _MOS-min-at_, but returnes the time when the minimum jitter was detected.
    
*   _roundtrip-min-at_ - similar behavior with _MOS-min-at_, but returnes the time when the minimum roundtrip was detected.
    
*   _packetloss-min-at_ - similar behavior with _MOS-min-at_, but returnes the time when the minimum packet loss of a leg/call was detected.
    
*   _MOS-max-at_ - without an index, it returns the time in seconds elapsed from the start of the call when the MOS value is maximum. If the index is specified, it has the same effect as for _MOS-average_.
    
*   _jitter-max-at_ - similar behavior with _MOS-max-at_, but returnes the time when the maximum value of jitter was detected.
    
*   _roundtrip-max-at_ - similar behavior with _MOS-max-at_, but returnes the time when the maximum value of roundtrip was detected.
    
*   _packetloss-min-at_ - similar behavior with _MOS-max-at_, but returnes the time when the maximum packet loss of a leg/call was detected.
    

_NOTE:_ all these statistics are computed based on the statistics generated by RTPEngine. Some of them might not be available for all the calls (i.e. MOS cannot be computed if the call is too short, or if the phones do not properly report RTP statistics over RTCP). In these cases the variable returns the _NULL_ value.

**Example�1.42.�$rtpstat(STAT)**

...
    xlog("Average MOS of the entire call is $rtpstat(MOS-average)\\r\\n");
    xlog("Average MOS of caller is $(rtpstat(MOS-average)\[$ft\])\\r\\n");
    xlog("Average MOS of callee is $(rtpstat(MOS-average)\[$tt\])\\r\\n");
    xlog("Min MOS of caller is $(rtpstat(MOS-min)\[$ft\]) reported at $(rtpstat(MOS-min-at)\[$ft\])\\r\\n");
...
		

  

### 1.7.3.�`$rtpquery`

Does a Query command to the RTP proxy and returns the answer in a JSON format. You can use this variable to fetch arbitrary data from the RTP proxy such as raw statistics about the call, or other indicators.

You can use a _$json()_ variable to parse its output and extract any information from the query, such as RTP statistics, or MOS values.

**Example�1.43.�$rtpquery Usage**

...
	$json(reply) := $rtpquery;
	xlog("Total RTP Stats: $json(reply/totals)\\n");
...
		

  

## 1.8.�Exported MI Functions

### 1.8.1.�`rtpengine_enable`

Enables/disables a RTP proxy.

Parameters:

*   _url_ - the RTP proxy url (exactly as defined in the config file).
    
*   _enable_ - 1 - enable, 0 - disable the RTP proxy, 2 - put the RTP node in probing mode.
    
*   _setid_ (optional) the set ID of the nodes to be updated. If provided, only nodes in the provided set will be updated.
    

NOTE: if a RTP proxy is defined multiple times (in the same or different set), all of its instances will be enabled/disabled IF no set ID is provided.

**Example�1.44.� `rtpengine_enable` usage**

...
## disable all rtpengines by URL
$ opensips-cli -x mi rtpengine\_enable udp:192.168.2.133:8081 0
## enable rtpengine by URL and set ID (3)
$ opensips-cli -x mi rtpengine\_enable url=udp:192.168.2.133:8081 enable=1 setid=3
...
			

  

### 1.8.2.�`rtpengine_show`

Displays all the RTP proxies and their information: set and status (disabled or not, weight and recheck\_ticks).

No parameter.

**Example�1.45.� `rtpengine_show` usage**

...
$ opensips-cli -x mi rtpengine\_show
...
			

  

### 1.8.3.�`rtpengine_reload`

Reloads all rtpengine sets from the database. Used only when the “[db\_url](#param_db_url "1.4.10.�db_url (string)")” parameter is set.

Parameters:

*   _type_ (optional) soft - when reloading nodes from the database, reuse any existing sockets and keep existing node disabled state. If not provided, then all nodes and sockets will first be torndown and then nodes will be loaded from the database.
    

No parameter.

**Example�1.46.� `rtpengine_reload` usage**

...
$ opensips-cli -x mi rtpengine\_reload
$ opensips-cli -x mi rtpengine\_reload type=soft
...
			

  

### 1.8.4.�`teardown`

Terminates the SIP dialog by the SIP Call-ID given as parameter.

Parameters:

*   _callid_ - SIP Call-ID.
    

Note this is a just a wrapper function over the “dlg\_end\_dlg” MI function provided by the “dialog” module. This wrapping is done just to make rtpengine happy when trying to terminate SIP calls based on RTP timeouts.

**Example�1.47.� `teardown` usage**

...
$ opensips-cli -x mi teardown Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY0ZDQ
...
			

  

## 1.9.�Exported Events

### 1.9.1.� `E_RTPENGINE_NOTIFICATION`

This event is raised when a notification is received from RTPengine.

Parameters represent the nodes within the Json request received from RTPengine. Common values are:

*   _type_ - identifies the type of notification (i.e. DTMF)
    
*   _callid_ - the callid of the call this event is triggered for
    
*   _source\_tag_ - from tag of the call this event is triggered for
    
*   _timestamp_ - timestamp when the event was triggered
    

For a DTMF event received, you will also get the following nodes:

*   _source\_ip_ - the IP that triggered the DTMF
    
*   _event_ - the event/digit pressed
    
*   _duration_ - how long the digit was pressed
    
*   _volume_ - volume of the tone
    

### 1.9.2.� `E_RTPENGINE_STATUS`

This event is raised when a RTPEngine server changes it's status to active/inactive.

Parameters:

*   _socket_ - the socket that identifies the RTPEngine instance.
    
*   _status_ - _active_ if the RTPEngine instance responds to probing or _inactive_ if the instance was deactivated.
    
*   _set_ - the numeric id of the set this RTPEngine instance is part of.
    

## Chapter�2.�Frequently Asked Questions

**2.1.**

How do I migrate from “rtpproxy” or “rtpproxy-ng” to “rtpengine”?

For the most part, only the names of the functions have changed, with “rtpproxy” in each name replaced with “rtpengine”. For example, “rtpproxy\_manage()” has become “rtpengine\_manage()”. A few name duplications have also been resolved, for example there is now a single “rtpengine\_delete()” instead of “unforce\_rtp\_proxy()” and the identical “rtpproxy\_destroy()”.

The largest difference to the old module is how flags are passed to “rtpengine\_offer()”, “rtpengine\_answer()”, “rtpengine\_manage()” and “rtpengine\_delete()”. Instead of having a string of single-letter flags, they now take a string of space-separated items, with each item being either a single token (word) or a “key=value” pair.

For example, if you had a call “rtpproxy\_offer("FRWOC+PS");”, this would then become:

rtpengine\_offer("force trust-address symmetric replace-origin replace-session-connection ICE=force RTP/SAVPF");
		

Finally, if you were using the second parameter (explicit media address) to any of these functions, this has been replaced by the “media-address=...” option within the first string of flags.

**2.2.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.3.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.4.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

247

139

6458

3160

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

31

17

423

595

3.

John Burke ([@john08burke](https://github.com/john08burke))

25

17

647

102

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

20

16

91

173

5.

Richard Fuchs

20

2

640

723

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

15

7

218

330

7.

Norman Brandinger ([@NormB](https://github.com/NormB))

12

10

72

18

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

11

8

29

64

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

8

1

566

94

10.

Eric Tamme ([@etamme](https://github.com/etamme))

7

5

42

19

  

**All remaining contributors**: Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Eddie Fiorentine, Zero King ([@l2dy](https://github.com/l2dy)), Norm Brandinger, Rob Gagnon ([@rgagnon24](https://github.com/rgagnon24)), Flavio E. Goncalves, hatee, Dan Pascu ([@danpascu](https://github.com/danpascu)), Oliver Severin Mulelid-Tynes ([@olivermt](https://github.com/olivermt)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2014 - Aug 2025

2.

Norm Brandinger

May 2025 - May 2025

3.

Norman Brandinger ([@NormB](https://github.com/NormB))

Jun 2024 - Feb 2025

4.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2025

5.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jan 2025 - Jan 2025

6.

hatee

Dec 2024 - Dec 2024

7.

Eddie Fiorentine

Nov 2024 - Nov 2024

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

9.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2014 - May 2023

10.

John Burke ([@john08burke](https://github.com/john08burke))

Jun 2019 - Apr 2022

  

**All remaining contributors**: Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Flavio E. Goncalves, Zero King ([@l2dy](https://github.com/l2dy)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Oliver Severin Mulelid-Tynes ([@olivermt](https://github.com/olivermt)), Rob Gagnon ([@rgagnon24](https://github.com/rgagnon24)), Eric Tamme ([@etamme](https://github.com/etamme)), Richard Fuchs.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Norm Brandinger, Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Eddie Fiorentine, Norman Brandinger ([@NormB](https://github.com/NormB)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), John Burke ([@john08burke](https://github.com/john08burke)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Flavio E. Goncalves, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Richard Fuchs.

_Documentation Copyrights:_

Copyright � 2013-2014 Sipwise GmbH

Copyright � 2010 [VoIPEmbedded Inc.](http://www.voipembedded.com)

Copyright � 2009-2014 TuTPro Inc.

Copyright � 2005 Voice Sistem SRL

Copyright � 2003-2008 Sippy Software, Inc.