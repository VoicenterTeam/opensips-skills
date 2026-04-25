# rtpproxy Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6091248)

3.2. [Most recently active contributors(1) to this module](#idp6215056)

**List of Examples**

1.1. [Set `rtpproxy_sock` parameter](#idp4313216)

1.2. [Set `rtpproxy_disable_tout` parameter](#idp3259248)

1.3. [Set `rtpproxy_timeout` parameter to 200ms](#idp3423136)

1.4. [Enable auto-bridging feature](#idp2539456)

1.5. [Set `rtpproxy_retr` parameter](#idp4201536)

1.6. [Set `default_set` parameter](#idp4200576)

1.7. [Set `nortpproxy_str` parameter](#idp4274784)

1.8. [Set `db_url` parameter](#idp4445936)

1.9. [Set `db_table` parameter](#idp3879888)

1.10. [Set `rtpp_socket_col` parameter](#idp3603248)

1.11. [Set `set_id` parameter](#idp5656384)

1.12. [Set `rtpp_notify_socket` parameter](#idp2542112)

1.13. [Set `generated_sdp_port_min` parameter](#idp107888)

1.14. [Set `generated_sdp_port_max` parameter](#idp1836368)

1.15. [Set `generated_sdp_media_ip` parameter](#idp1842608)

1.16. [`rtpproxy_engage` usage](#idp5696544)

1.17. [`rtpproxy_offer` usage](#idp5704992)

1.18. [`rtpproxy_answer` usage](#idp5713152)

1.19. [`rtpproxy_unforce` usage](#idp5720208)

1.20. [`rtpproxy_stream2xxx` usage](#idp5736048)

1.21. [`rtpproxy_start_recording` usage](#idp5755392)

1.22. [`rtpproxy_stats` usage](#idp5767872)

1.23. [`rtpproxy_all_stats` usage](#idp5789808)

1.24. [`rtpproxy_enable` usage](#idp5799392)

1.25. [`rtpproxy_show` usage](#idp5804176)

1.26. [`rtpproxy_reload` usage](#idp5808816)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module is used by OpenSIPS to communicate with RTPProxy, a media relay proxy used to make the communication between user agents behind NAT possible.

This module is also used along with RTPProxy to record media streams between user agents or to play media to either UAc or UAs.

## 1.2.�Multiple RTPProxy usage

Currently, the rtpproxy module can support multiple rtpproxies for balancing/distribution and control/selection purposes.

The module allows the definition of several sets of rtpproxies - load-balancing will be performed over a set and the user has the ability to choose what set should be used. The set is selected via its id - the id being defined along with the set. Refer to the “rtpproxy\_sock” module parameter definition for syntax description.

The balancing inside a set is done automatically by the module based on the weight of each rtpproxy from the set. Note that if rtpproxy has weight 0, it will be used only when no other rtpproxies (with a different weight value than 0) respond. Default weight is 1.

Starting with OpenSIPS 2.1, engage\_rtp\_proxy(), unforce\_rtp\_proxy() and start\_recording() functions have been fully replaced by rtpproxy\_engage(), rtpproxy\_unforce() and rtpproxy\_start\_recording().

IMPORTANT: if you use multiple sets, make sure you use the same set for both rtpproxy\_offer()/rtpproxy\_answer() and rtpproxy\_unforce()!!

## 1.3.�RTPProxy timeout notifications

Nathelper module can also receive timeout notifications from multiple rtpproxies. RTPProxy can be configured to send notifications when a session doesn't receive any media for a configurable interval of time. The rtpproxy modules has implemented a listener for such notifications and when received it terminates the dialog at SIP level (send BYE to both ends), with the help of dialog module.

In our tests with RTPProxy we observed some limitations and also provide a patch for it against git commit “600c80493793bafd2d69427bc22fcb43faad98c5”. It contains an addition and implements separate timeout parameters for the phases of session establishment and ongoing sessions. In the official code a single timeout parameter controls both session establishment and rtp timeout and the timeout notification is also sent in the call establishment phase. This is a problem since we want to detect rtp timeout fast, but also allow a longer period for call establishment.

Note that RTPProxy version [v2.0.0](http://www.rtpproxy.org/post/v2release/) has integrated this feature upstream, therefore this patch is no longer needed.

To enable timeout notification there are several steps that you must follow:

Start OpenSIPS timeout detection by setting the “rtpp\_notify\_socket” module parameter in your configuration script. This is the socket where further notification will be received from rtpproxies. This socket must be a TCP or UNIX socket. Also, for all the calls that require notification, the rtpproxy\_engage(), rtpproxy\_offer() and rtpproxy\_answer() functions must be called with the “n” flag.

Configure RTPProxy to use timeout notification by adding the following command line parameters:

*   “ -n timeout\_socket” - specifies where the notifications will be sent. This socket must be the same as “rtpp\_notify\_socket” OpenSIPS module parameter. This parameter is mandatory.
    
*   “ -T ttl” - limits the rtp session timeout to “ttl”. This parameter is optional and the default value is 60 seconds.
    
*   “ -W ttl” - limits the session establishment timeout to “ttl”. This parameter is optional and the default value is 60 seconds.
    

All of the previous parameters can be used with the offical RTPProxy release, except for the last one. It has been added, together with other modifications to RTPProxy in order to work properly. The patch is located in the _patches_ directory in the module.

To get the patched version from git you must follow theese steps:

*   Get the latest source code: “git clone git://sippy.git.sourceforge.net/gitroot/sippy/rtpproxy”
    
*   Make a branch from the commit: “git checkout -b branch\_name 600c80493793bafd2d69427bc22fcb43faad98c5”
    
*   Patch RTPProxy: “patch < path\_to\_rtpproxy\_patch”
    

The patched version can also be found at: https://opensips.org/pub/rtpproxy/

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database_ module - only if you want to load use a database table from where to load the rtp proxies sets.
    
*   _dialog_ module - if using the rtpproxy\_engage functions or RTPProxy timeout notifications.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.5.�Exported Parameters

### 1.5.1.�`rtpproxy_sock` (string)

Definition of socket(s) used to connect to (a set) RTPProxy. It may specify a UNIX socket, an IPv4/IPv6 UDP socket or an IPv4/IPv6 TCP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

The definition also supports to specify a different IP that will be advertised instead of the one returned by RTPProxy. This is useful when having multiple RTPProxy servers that are located behind NAT, and listen only on private intefaces, but need to advertise a public one.

_Default value is “NONE” (disabled)._

**Example�1.1.�Set `rtpproxy_sock` parameter**

...
# single rtpproxy with specific weight
modparam("rtpproxy", "rtpproxy\_sock", "udp:localhost:22222=2")

# single rtpproxy with advertised address + weight
modparam("rtpproxy", "rtpproxy\_sock", "udp:localhost:22222|8.8.8.8=2")

# multiple rtproxies for LB
modparam("rtpproxy", "rtpproxy\_sock",
	"udp:localhost:22222 udp:localhost:22223 tcp:remote1:33422 tcp6:remote2:32322")

# multiple sets of multiple rtproxies
modparam("rtpproxy", "rtpproxy\_sock", "1 == udp:localhost:22222 udp:localhost:22223")
modparam("rtpproxy", "rtpproxy\_sock", "2 == udp:localhost:22223")
modparam("rtpproxy", "rtpproxy\_sock", "2 == udp:localhost:22223|8.8.8.8")
...

  

### 1.5.2.�`rtpproxy_disable_tout` (integer)

Once RTPProxy was found unreachable and marked as disable, rtpproxy will not attempt to establish communication to RTPProxy for rtpproxy\_disable\_tout seconds.

_Default value is “60”._

**Example�1.2.�Set `rtpproxy_disable_tout` parameter**

...
modparam("rtpproxy", "rtpproxy\_disable\_tout", 20)
...

  

### 1.5.3.�`rtpproxy_timeout` (string)

Timeout value in waiting for reply from RTPProxy.

_Default value is “1”._

**Example�1.3.�Set `rtpproxy_timeout` parameter to 200ms**

...
modparam("rtpproxy", "rtpproxy\_timeout", "0.2")
...

  

### 1.5.4.�`rtpproxy_autobridge` (integer)

Enable auto-bridging feature. Does not properly function when doing serial/parallel forking!

_Default value is “0”._

**Example�1.4.�Enable auto-bridging feature**

...
modparam("rtpproxy", "rtpproxy\_autobridge", 1)
...

  

### 1.5.5.�`rtpproxy_retr` (integer)

How many times rtpproxy should retry to send and receive after timeout was generated.

_Default value is “5”._

**Example�1.5.�Set `rtpproxy_retr` parameter**

...
modparam("rtpproxy", "rtpproxy\_retr", 2)
...

  

### 1.5.6.�`default_set` (integer)

The parameter indicates the default RTPProxy set to be used when provisioning an engine in the config file without an explicit set, or when calling one of the _rtpproxy\_\*()_ functions without an explicit set.

_Default value is set “0”._

**Example�1.6.�Set `default_set` parameter**

...
modparam("rtpproxy", "default\_set", 1)
...

  

### 1.5.7.�`nortpproxy_str` (string)

The parameter sets the SDP attribute used by rtpproxy to mark the packet SDP informations have already been mangled.

If empty string, no marker will be added or checked.

### Note

The string must be a complete SDP line, including the EOH (\\r\\n).

_Default value is “a=nortpproxy:yes\\r\\n”._

**Example�1.7.�Set `nortpproxy_str` parameter**

...
modparam("rtpproxy", "nortpproxy\_str", "a=sdpmangled:yes\\r\\n")
...

  

### 1.5.8.�`db_url` (string)

The database url. This parameter should be set if you want to use a database table from where to load or reload definitions of socket(s) used to connect to (a set) RTPProxy. The record from the database table will be read at start up (added to the ones defined with the rtpproxy\_sock module parameter) and when the MI command rtpproxy\_reload is issued(the definitions will be replaced with the ones from the database table).

_Default value is “NULL”._

**Example�1.8.�Set `db_url` parameter**

...
modparam("rtpproxy", "db\_url", 
		"mysql://opensips:opensipsrw@192.168.2.132/opensips")
...

  

### 1.5.9.�`db_table` (string)

The name of the database table containing definitions of socket(s) used to connect to (a set) RTPProxy.

_Default value is “rtpproxy\_sockets”._

**Example�1.9.�Set `db_table` parameter**

...
modparam("rtpproxy", "db\_table", "nh\_sockets") 
...

  

### 1.5.10.�`rtpp_socket_col` (string)

The name rtpp socket column in the database table.

_Default value is “rtpproxy\_sock”._

**Example�1.10.�Set `rtpp_socket_col` parameter**

...
modparam("rtpproxy", "rtpp\_socket\_col", "rtpp\_socket") 
...

  

### 1.5.11.�`set_id_col` (string)

The name set id column in the database table.

_Default value is “set\_id”._

**Example�1.11.�Set `set_id` parameter**

...
modparam("rtpproxy", "set\_id\_col", "rtpp\_set\_id") 
...

  

### 1.5.12.�`rtpp_notify_socket` (string)

The socket OpenSIPS listens for notifications from RTPProxy. Currently OpenSIPS can receive RTP timeout and DTMF events.

_Default value is “NULL” - no notifications are received._

**Example�1.12.�Set `rtpp_notify_socket` parameter**

...
modparam("rtpproxy", "rtpp\_notify\_socket", "tcp:10.10.10.10:9999")

# use an UNIX socket
modparam("rtpproxy", "rtpp\_notify\_socket", "unix:/tmp/rtpproxy.unix")
# or
modparam("rtpproxy", "rtpp\_notify\_socket", "/tmp/rtpproxy.unix")
...

  

### 1.5.13.�`generated_sdp_port_min` (integer)

When RTPProxy module needs to generate an SDP body, use this value as the minimum value of the port.

_Default value is “35000”._

**Example�1.13.�Set `generated_sdp_port_min` parameter**

...
modparam("rtpproxy", "generated\_sdp\_port\_min", 10000)
...
		

  

### 1.5.14.�`generated_sdp_port_max` (integer)

When RTPProxy module needs to generate an SDP body, use this value as the maximum value of the port.

_Default value is “65000”._

**Example�1.14.�Set `generated_sdp_port_max` parameter**

...
modparam("rtpproxy", "generated\_sdp\_port\_max", 30000)
...
		

  

### 1.5.15.�`generated_sdp_media_ip` (string)

When RTPProxy module needs to generate an SDP body, use this value as the media\_ip in the _c=_ and the _o=_.

_Default value is “127.0.0.1”._

**Example�1.15.�Set `generated_sdp_media_ip` parameter**

...
modparam("rtpproxy", "generated\_sdp\_media\_ip", "10.0.0.1")
...
		

  

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
		

  

## 1.7.�Exported MI Functions

### 1.7.1.�`rtpproxy_enable`

Enables/Disables a rtp proxy.

Parameters:

*   _url_ - the rtp proxy url (exactly as defined in the config file).
    
*   _enable_ - 1 - enable, 0 - disable. the config file).
    
*   _setid_ (optional) - the rtpproxy set ID (used for better indentification of the rtpproxy instance to be enabled, for example when a rtpproxy is used in multiple sets).
    

NOTE: if a rtpproxy is defined multiple times (in the same or different set), all its instances will be enables/disabled IF no set ID provided (as second param).

**Example�1.24.� `rtpproxy_enable` usage**

...
## disable a RTPProxy by URL only
$ opensips-cli -x mi rtpproxy\_enable udp:192.168.2.133:8081 0
## disable a RTPProxy by URL and set ID (3)
$ opensips-cli -x mi rtpproxy\_enable udp:192.168.2.133:8081 0 3
...
			

  

### 1.7.2.�`rtpproxy_show`

Displays all the rtp proxies and their information: set and status (disabled or not, weight and recheck\_ticks).

No parameter.

**Example�1.25.� `rtpproxy_show` usage**

...
$ opensips-cli -x mi rtpproxy\_show
...
			

  

### 1.7.3.�`rtpproxy_reload`

Reload rtp proxies sets from database. The function will delete all previous records and populate the list with the entries from the database table. The db\_url parameter must be set if you want to use this command.

No parameter.

**Example�1.26.� `rtpproxy_reload` usage**

...
$ opensips-cli -x mi rtpproxy\_reload
...
			

  

## 1.8.�Exported Events

### 1.8.1.� `E_RTPPROXY_STATUS`

This event is raised when a RTPProxy server changes it's status to enabled/disabled.

Parameters:

*   _socket_ - the socket that identifies the RTPProxy instance.
    
*   _status_ - _active_ if the RTPProxy instance responds to probing or _inactive_ if the instance was deactivated.
    

### 1.8.2.� `E_RTPPROXY_DTMF`

This event is raised when a RTPProxy server sends a DTMF notification to OpenSIPS. In order to catch RFC 2833/4733 DTMF events, you need to provide the _d_ flag to _rtpproxy\_offer()_/ _rtpproxy\_answer()_.

Parameters:

*   _digit_ - the digit pressed.
    
*   _duration_ - the duration of the event.
    
*   _volume_ - the volume of the event.
    
*   _id_ - represents the identifier of the call for which that event was received.
    
*   _is\_callid_ - is _0_ if the _id_ parameter represents the Dialog ID, or _1_ if it is a callid.
    
*   _stream_ - indicates the stream index of the RTPProxy session. It is normally 0 if the caller sent the DTMF, or 1 if the callee sent it.
    

## Chapter�2.�Frequently Asked Questions

**2.1.**

What happened with “rtpproxy\_disable” parameter?

It was removed as it became obsolete - now “rtpproxy\_sock” can take empty value to disable the rtpproxy functionality.

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

261

163

6150

2874

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

59

12

5054

280

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

28

22

228

243

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

27

23

123

116

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

25

9

409

725

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

7

5

60

59

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

7

5

31

22

8.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

6

4

15

9

9.

Ryan Bullock ([@rrb3942](https://github.com/rrb3942))

4

2

68

9

10.

John Burke ([@john08burke](https://github.com/john08burke))

4

2

8

6

  

**All remaining contributors**: robdyck, Dave Sidwell ([@davesidwell](https://github.com/davesidwell)), Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Danielzt, Christophe Sollet ([@csollet](https://github.com/csollet)), Anca Vamanu, Mikko Lehto, Dan Pascu ([@danpascu](https://github.com/danpascu)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Juli�n Moreno Pati�o, Zero King ([@l2dy](https://github.com/l2dy)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Danielzt

Apr 2026 - Apr 2026

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2011 - Jan 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2012 - May 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Mar 2011 - Mar 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Mar 2023

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Dec 2011 - Apr 2022

7.

John Burke ([@john08burke](https://github.com/john08burke))

Apr 2021 - Apr 2021

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Mar 2011 - Jun 2020

9.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2011 - Apr 2020

10.

robdyck

Apr 2020 - Apr 2020

  

**All remaining contributors**: Zero King ([@l2dy](https://github.com/l2dy)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Juli�n Moreno Pati�o, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Dave Sidwell ([@davesidwell](https://github.com/davesidwell)), Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Mikko Lehto, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Christophe Sollet ([@csollet](https://github.com/csollet)), Anca Vamanu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Zero King ([@l2dy](https://github.com/l2dy)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Juli�n Moreno Pati�o, Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Mikko Lehto, Ryan Bullock ([@rrb3942](https://github.com/rrb3942)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)).

_Documentation Copyrights:_

Copyright � 2005 Voice Sistem SRL

Copyright � 2003-2008 Sippy Software, Inc.