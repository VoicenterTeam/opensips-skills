## 1.5.�Exported Functions

### 1.5.1.� `rtpengine_use_set(setid)`

Sets the ID of the RTP proxy set to be used for the next rtpengine\_delete(), rtpengine\_offer(), rtpengine\_answer() or rtpengine\_manage() command. The parameter is an integer.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE.

**Example�1.14.�`rtpengine_use_set` usage**

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

**Example�1.15.�`rtpengine_offer` usage**

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

  

**Example�1.16.�`rtpengine_offer` usage with body replace**

...
if (rtpengine\_offer(, $var(socket), $var(body), $rb)) {
    xlog("Used rtpengine $var(socket)\\n");
    # make all the changes on the resulted SDP in $var(body)
    ...
    remove\_body\_part();
    add\_body\_part($var(body), "application/sdp");
}
...

  

**Example�1.17.�`rtpengine_offer` usage with call recording**

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

  

**Example�1.18.�`rtpengine_offer` usage for transcoding**

...
# Goal: make A-side talk PCMA and B-side talk opus
# \* do not present PCMA to B-side: codec-mask-PCMA, but use it on A-side
# \* do not use opus for A-side: codec-strip-opus
# \* offer opus to B-side: transcode-opus
rtpengine\_offer("... codec-mask-PCMA codec-strip-opus transcode-opus ...");
...

  

### 1.5.3.� `rtpengine_answer([flags[, sock_pvar[, sdp_pvar[, body]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on 200 OK for the cases the SDPs are in INVITE and 200 OK and on ACK when SDPs are in 200 OK and ACK.

See rtpengine\_offer() function description above for the meaning of the parameters.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.19.�`rtpengine_answer` usage**

See rtpengine\_offer() function example above for examples.

  

### 1.5.4.� `rtpengine_delete([flags[, sock_var]])`

Tears down the RTPEngine session for the current call.

See rtpengine\_offer() function description above for the meaning of the parameters. Note that not all flags make sense for a “delete”.

This function can be used from ALL\_ROUTES.

**Example�1.20.�`rtpengine_delete` usage**

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

**Example�1.21.�`rtpengine_manage` usage**

...
rtpengine\_manage();
...

  

### 1.5.6.� `rtpengine_start_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to record the RTP stream on the RTP proxy.

Meaning of the parameters is as follows:

*   _flags(string, optional)_ - flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    

This function can be used from any route.

**Example�1.22.�`rtpengine_start_recording` usage**

...
rtpengine\_start\_recording();
...
		

  

### 1.5.7.� `rtpengine_stop_recording([flags [, sock_var]])`

This function will send a signal to the RTP proxy to stop recording the RTP stream on the RTP proxy.

Meaning of the parameters is as follows:

*   _flags(string, optional)_ - flags used to change the behavior of the recorder. An importat value to set is the _call-id_ value, which can be used to start recording a different call than the requested one.
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    

This function can be used from any route.

**Example�1.23.�`rtpengine_stop_recording` usage**

...
rtpengine\_stop\_recording();
...
		

  

### 1.5.8.� `rtpengine_play_media(flags, [duration_spec[, sock_var[, sockvar]]])`

This function will start playing a media file to one of the endpoints.

Meaning of the parameters is as follows:

*   _flags(string)_ - a list of flags simialar to the other functions. One of the _file_, _blob_ or _db-id_ parameters is mandatory to indicate the content of the media file to be played. _file_ is a common choice for specifying rtpengine to get media from a file path, _blob_ to take the content from an inline string and _db-id_ to get the content from the database.
    
    The direction of the media stream is controlled by the _from-tag_ parameter, _address_ (media address from the SDP), or _label_, if the media stream contains a label. If all of them are missing, the media file is played to the initiator of the SIP request, and will work similar to a ringback tone.
    
*   _duration\_spec(var, optional)_ - a pseudo variable that will contain the duration of the played file. It will be set to _\-1_ if the duration could not be determined.
    
*   _sock\_var(var, optional)_ - variable used to store the rtpengine socket chosen for this call.
    

This function can be used from any route.

**Example�1.24.�Ringback tone using `rtpengine_play_media`**

...
if (is\_method("INVITE") && !has\_totag())
	rtpengine\_play\_media("file=/path/to/ringback\_tone\_file.wav");
...
		

  

**Example�1.25.�Manage music on hold using `rtpengine_play_media`**

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
		

  

### 1.5.9.� `rtpengine_stop_media([flags[, sockvar]])`

This function will stop playing a media file previously started by a `rtpengine_play_media()` call. The meaning of its parameters is similar to the previous functions. Note that this function should be called with similar parameters as its matching `rtpengine_play_media()` call, otherwise RTPEngine will not be able to stop media playing.

This function can be used from any route.

**Example�1.26.�Ringback tone stop using `rtpengine_stop_media`**

...
if (is\_method("INVITE") && $rs == 200)
	rtpengine\_stop\_media();
...
		

  

### 1.5.10.� `rtpengine_block_media([flags[, sockvar]])`

This function will block the media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.27.�Example of `rtpengine_block_media` usage**

...
rtpengine\_block\_media();
...
		

  

### 1.5.11.� `rtpengine_unblock_media([flags[, sockvar]])`

This function will resume/unblock the media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.28.�Example of `rtpengine_unblock_media` usage**

...
rtpengine\_unblock\_media();
...
		

  

### 1.5.12.� `rtpengine_block_dtmf([flags[, sockvar]])`

This function will block the DTMF media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.29.�Example of `rtpengine_block_dtmf` usage**

...
rtpengine\_block\_dtmf();
...
		

  

### 1.5.13.� `rtpengine_unblock_dtmf([flags[, sockvar]])`

This function will resume/unblock the DTMF media sent from one of the endpoints. The direction to be blocked is controled by the _flags_ parameter, the _from-tag_ value.

This function can be used from any route.

**Example�1.30.�Example of `rtpengine_unblock_dtmf` usage**

...
rtpengine\_unblock\_dtmf();
...
		

  

### 1.5.14.� `rtpengine_start_forwarding([flags[, sockvar]])`

This function will start forwarding the media to a TLS destination specified in the _tls-send-to_ parmeter of RTPEngine. This function allows you to select the media stream to forward, by specifing the _from-tag_ of the entity you want to forward the media. If missing, all media streams are forwarded.

This function can be used from any route.

**Example�1.31.�Example of `rtpengine_start_forwarding` usage**

...
rtpengine\_start\_forwarding();
...
		

  

### 1.5.15.� `rtpengine_stop_forwarding([flags[, sockvar]])`

This function will stop forwarding of the media previously started using the _rtpengine\_start\_forwarding()_ function.

This function can be used from any route.

**Example�1.32.�Example of `rtpengine_stop_forwarding` usage**

...
rtpengine\_stop\_forwarding();
...
		

  

### 1.5.16.� `rtpengine_play_dtmf(code, [flags[, sockvar]])`

This function instructs RTP to send the DTMF _code_ to the participant of the call. The _code_ can be a digit (“0-9”) or a special character (one of “\*,#,A,B,C,D”). Additional parameters can be configured using the _flags_ parameter. For more information, please consult the RTP documentation.

_NOTE:_ if you are planning to inject DTMF in a session, you have to specify the _inject-DTMF_ flag when the session is created.

This function can be used to convert SIP INFO DTMF keys to RTP DTMF.

This function can be used from any route.

**Example�1.33.�Example of `rtpengine_play_dtmf` usage**

...
rtpengine\_play\_dtmf("0"); # send the 0 code upstream
...