## 1.6.�Exported Functions

### 1.6.1.� `rtpproxy_engage([[flags][, [ip_address][, [set_id][, [sock_var][, ret_var]]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. It uses the dialog module facilities to keep track when the rtpproxy session must be updated. Function must only be called for the initial INVITE and internally takes care of rewriting the body of 200 OKs and ACKs. Note that when used in bridge mode, this function might advertise wrong interfaces in SDP (due to the fact that OpenSIPS is not aware of the RTPProxy configuration), so you might face an undefined behavior.

Meaning of the parameters is as follows:

*   _flags(string, optional)_ - flags to turn on some features.
    
    *   _a_ - flags that UA from which message is received doesn't support symmetric RTP.
        
    *   _l_ - force “lookup”, that is, only rewrite SDP when corresponding session is already exists in the RTP proxy. By default is on when the session is to be completed (reply in non-swap or ACK in swap mode).
        
    *   _k_ - only create RTPProxy session, but do not modify the SDP body. This is useful when you only want to inject some media, but do not want to engage RTPProxy in the entire call.
        
    *   _i/e_ - when RTPProxy is used in bridge mode, these flags are used to indicate the direction of the media flow for the current request/reply. 'i' refers to the LAN (internal network) and corresponds to the first interface of RTPProxy (as specified by the -l parameter). 'e' refers to the WAN (external network) and corresponds to the second interface of RTPProxy. These flags should always be used together. For example, an INVITE (offer) that comes from the Internet (WAN) to goes to a local media server (LAN) should use the 'ei' flags. The answer should use the 'ie' flags. Depending on the scenario, the 'ii' and 'ee' combination are also supported. Only makes sense when RTPProxy is running in the bridge mode.
        
        _NOTE:_ when using RTPProxy in bridge mode, all sessions are considered asymmetric (as oposed to symmetric if used in normal mode). If you have symmetric clients (this is the most common scenario), you'll have to force the _s_!
        
    *   _f_ - instructs rtpproxy to ignore marks inserted by another rtpproxy in transit to indicate that the session is already goes through another proxy. Allows creating chain of proxies.
        
    *   _r_ - flags that IP address in SDP should be trusted. Without this flag, rtpproxy ignores address in the SDP and uses source address of the SIP message as media address which is passed to the RTP proxy.
        
    *   _o_ - flags that IP from the origin description (o=) should be also changed.
        
    *   _c_ - flags to change the session-level SDP connection (c=) IP if media-description also includes connection information.
        
    *   _s/w_ - flags that for the UA from which message is received, support symmetric RTP must be forced.
        
    *   _n\[<SOCKET>\]_ - flags that enables the notification timeout for the session. One can specify an optional "advertised" socket between the < and > tags. If the socket is not specified, the value of _rtpp\_notify\_socket_ is used.
        
    *   _d\[NNN\]_ - enables DTMF notifications for this call. One can optionally specify the payload type that DTMF will be used for this call - it it is not specified, RTPProxy uses the _101_ pt. _NOTE:_ this feature is currently only available in the RTPProxy _rtpp\_2\_1\_dtmf_ branch.
        
    *   _tNN_ - can be used to specify a RTP ttl for the caller. The NN represents the timeout in seconds for that stream. This can be useful in music on hold scenarios where only one client is sending RTP.
        
    *   _TNN_ - Similar to the _tNN_ paramaeter, but used for tuning the calllee's ttl for RTP.
        
    *   _zNN_ - requests the RTPproxy to perform re-packetization of RTP traffic coming from the UA which has sent the current message to increase or decrease payload size per each RTP packet forwarded if possible. The NN is the target payload size in ms, for the most codecs its value should be in 10ms increments, however for some codecs the increment could differ (e.g. 30ms for GSM or 20ms for G.723). The RTPproxy would select the closest value supported by the codec. This feature could be used for significantly reducing bandwith overhead for low bitrate codecs, for example with G.729 going from 10ms to 100ms saves two thirds of the network bandwith.
        
    
*   _ip\_address(string, optional)_ - new SDP IP address.
    
*   _set\_id(int, optional)_ - the set used for this call.
    
*   _sock\_var(var, optional)_ - variable used to store the RTPProxy socket chosen for this call. Note that the variable will only be populated in the initial request.
    
*   _ret\_var(var, optional)_ - variable used to print the IP and port the RTPProxy server is using for this call. This is useful especially when using the _rtp\_cluster_, which can advertise multiple servers behind it. The format of the value returned is _IP:port_. Note that the variable will only be populated in the initial request.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.16.�`rtpproxy_engage` usage**

...
if (is\_method("INVITE") && has\_totag()) {
	if ($var(setid) != 0) {
		rtpproxy\_engage(,,$var(setid), $var(proxy));
		xlog("SCRIPT: RTPProxy server used is $var(proxy)\\n");
	} else {
		rtpproxy\_engage();
		xlog("SCRIPT: using default RTPProxy set\\n");
	}
}
...
		

  

### 1.6.2.� `rtpproxy_offer([[flags][, [ip_address][, [set_id][, [sock_var][, [ret_var][, [body_var]]]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on INVITE for the cases the SDPs are in INVITE and 200 OK and on 200 OK when SDPs are in 200 OK and ACK.

The function receives the same parameters as `rtpproxy_engage()`, as well as an extra parameter named _body\_var_ - this parameter is used as an in-out variable for the body that should be used to challenge RTP proxy server. If the variable is specified, it is the function uses its content as the body to challenge, and returns the resulted body in it. If not used, the message's body is used, and the outgoing body is changed.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.17.�`rtpproxy_offer` usage**

route {
...
    if (is\_method("INVITE")) {
        if (has\_body("application/sdp")) {
            if (rtpproxy\_offer())
                t\_on\_reply("1");
        } else {
            t\_on\_reply("2");
        }
    }
    if (is\_method("ACK") && has\_body("application/sdp"))
        rtpproxy\_answer();
...
}

onreply\_route\[1\]
{
...
    if (has\_body("application/sdp"))
        rtpproxy\_answer();
...
}

onreply\_route\[2\]
{
...
    if (has\_body("application/sdp"))
        rtpproxy\_offer();
...
}

  

### 1.6.3.� `rtpproxy_answer([[flags][, [ip_address][, [set_id][, [sock_var][, [ret_var][, [body_var]]]]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on 200 OK for the cases the SDPs are in INVITE and 200 OK and on ACK when SDPs are in 200 OK and ACK.

See `rtpproxy_offer()` function description above for the meaning of the parameters.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.18.�`rtpproxy_answer` usage**

See rtpproxy\_offer() function example above for example.

  

### 1.6.4.� `rtpproxy_unforce([[set_id][, sock_var]])`

Tears down the RTPProxy session for the current call.

Meaning of the parameters is as follows:

*   _set\_id(int, optional)_ - the set used for this call.
    
*   _sock\_var(var, optional)_ - variable used to store the RTPProxy socket chosen for this call.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.19.�`rtpproxy_unforce` usage**

...
rtpproxy\_unforce();
...

  

### 1.6.5.� `rtpproxy_stream2uac(prompt_name, count[, [set_id][, sock_var]])`, `rtpproxy_stream2uas(prompt_name, count[, [set_id][, sock_var]])`

Instruct the RTPproxy to stream prompt/announcement pre-encoded with the makeann command from the RTPproxy distribution. The uac/uas suffix selects who will hear the announcement relatively to the current transaction - UAC or UAS. For example invoking the `rtpproxy_stream2uac` in the request processing block on ACK transaction will play the prompt to the UA that has generated original INVITE and ACK while `rtpproxy_stop_stream2uas` on 183 in reply processing block will play the prompt to the UA that has generated 183.

Apart from generating announcements, another possible application of this function is implementing music on hold (MOH) functionality. When count is -1, the streaming will be in loop indefinitely until the appropriate `rtpproxy_stop_stream2xxx` is issued.

In order to work correctly, functions require that the session in the RTPproxy already exists. Also those functions don't alted SDP, so that they are not substitute for calling `rtpproxy_offer` or `rtpproxy_answer`.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

Meaning of the parameters is as follows:

*   _prompt\_name_ (string) - name of the prompt to stream. Should be either absolute pathname or pathname relative to the directory where RTPproxy runs.
    
*   _count_ (int) - number of times the prompt should be repeated. The value of -1 means that it will be streaming in loop indefinitely, until appropriate `rtpproxy_stop_stream2xxx` is issued.
    
*   _set\_id(int, optional)_ - the set used for this call.
    
*   _sock\_var(var, optional)_ - variable used to store the RTPProxy socket chosen for this call.
    

**Example�1.20.�`rtpproxy_stream2xxx` usage**

...
    if (is\_method("INVITE")) {
        rtpproxy\_offer();
        if ($rb=~ "0\\.0\\.0\\.0") {
            rtpproxy\_stream2uas("/var/rtpproxy/prompts/music\_on\_hold", -1);
        } else {
            rtpproxy\_stop\_stream2uas();
        };
    };
...
	    

  

### 1.6.6.� `rtpproxy_stop_stream2uac([[set_id][, sock_var]])`, `rtpproxy_stop_stream2uas([[set_id][, sock_var]])`

Stop streaming of announcement/prompt/MOH started previously by the respective `rtpproxy_stream2xxx`. The uac/uas suffix selects whose announcement relatively to tha current transaction should be stopped - UAC or UAS.

Meaning of the parameters is as follows:

*   _set\_id(int, optional)_ - the set used for this call.
    
*   _sock\_var(var, optional)_ - variable used to store the RTPProxy socket chosen for this call.
    

These functions can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

### 1.6.7.� `rtpproxy_start_recording([[set_id][, [sock_var][, [flags][, [destination][, mediastream]]]]])`

This command will send a signal to the RTP-Proxy to record the RTP stream on the RTP-Proxy.

Meaning of the parameters is as follows:

*   _set\_id(int, optional)_ - the set used for this call.
    
*   _sock\_var(var, optional)_ - variable used to store the RTPProxy socket chosen for this call.
    
*   _flags(string, optional)_ - a list of flags passed to RTPProxy for the recording. Currently only _s_ is supported, and it indicates that RTPProxy should record both audio legs in a single file. Note that this feature is available starting with RTPProxy 2.0.
    
*   _destination(string, optional)_ - the destination of the recording. If it has the _udp:IP:port_ format, RTPProxy sends the RTP stream to that _IP:port_ remote destination. Otherwise, destination represents the name of the file in the recording directory.
    
*   _mediastream(int, optional)_ - this parameter is only used if the _destination_ is specified, and represents the index of media stream to record/copy, starting from 1. If this parameter is missing, OpenSIPS instructs RTPProxy to copy all the streams.
    

This function can be used from REQUEST\_ROUTE and ONREPLY\_ROUTE.

**Example�1.21.�`rtpproxy_start_recording` usage**

...
rtpproxy\_start\_recording();

# copy RTP stream to a different listener
rtpproxy\_start\_recording(,,,"udp:127.0.0.1:60000");

# copy only first RTP stream (audio stream)
rtpproxy\_start\_recording(,,,"udp:127.0.0.1:60000", 1);
...
		

  

### 1.6.8.� `rtpproxy_stats(up_pvar, down_var, sent_var, fail_var[, [set_id][, sock_var]])`

This command gathers call RTP statistics from RTP-Proxy.

Meaning of the parameters is as follows:

*   _up\_var_ (var) - the variable used to return the packets sent by _upstream_ for this call.
    
*   _down\_var_ (var) - the variable used to return the packets sent by _downstream_ for this call.
    
*   _sent\_var_ (var) - the variable used to return the total number of packets sent for this call.
    
*   _up\_var_ (var) - the variable used to return the number of failed packets for this call.
    
*   _set\_id(int, optional)_ - the set used for this call.
    
*   _sock\_var(var, optional)_ - variable used to store the RTPProxy socket chosen for this call.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.22.�`rtpproxy_stats` usage**

...
rtpproxy\_stats($var(up),$var(down),$var(sent),$var(fail));
xlog("RTP statistics for $ci: up=$var(up) down=$var(down) sent=$var(sent) fail=$var(fail)\\n");
...
		

  

### 1.6.9.� `rtpproxy_all_stats(stats_avp[, [set_id][, sock_var]])`

This command gathers all RTP statistics available from RTP-Proxy. All the returned values stored in an AVP that can be further read by indexing the AVP.

This command is only available starting with RTPProxy 2.1 realease.

Meaning of the parameters is as follows:

*   _stats\_avp_ (var) - an AVP where the statistics will be stored. This AVP can be further indexed to get a specific statistic.
    
*   _set\_id(int, optional)_ - the set used for this call.
    
*   _sock\_var(var, optional)_ - variable used to store the RTPProxy socket chosen for this call.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

Each statistic is stored at a specific index as it follows:

*   _ttl_ - _$avp(ret)_ / _$(avp(ret)\[0\])_
    
*   _pkts\_ia_ - _$(avp(ret)\[1\])_
    
*   _pkts\_io_ - _$(avp(ret)\[2\])_
    
*   _relayed_ - _$(avp(ret)\[3\])_
    
*   _dropped_ - _$(avp(ret)\[4\])_
    
*   _rtpa\_set_ - _$(avp(ret)\[5\])_
    
*   _rtpa\_rcvd_ - _$(avp(ret)\[6\])_
    
*   _rtpa\_dups_ - _$(avp(ret)\[7\])_
    
*   _rtpa\_lost_ - _$(avp(ret)\[8\])_
    
*   _rtpa\_perrs_ - _$(avp(ret)\[9\])_
    

**Example�1.23.�`rtpproxy_all_stats` usage**

...
rtpproxy\_all\_stats($avp(stats));
xlog("RTP statistics for $ci: dropped=$(avp(stats)\[4\])\\n");
...