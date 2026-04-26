# rtpproxy Module Reference
<!-- generated-from: data/4.0/modules/rtpproxy.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 rtpproxy module. Read this file when configuring or debugging the rtpproxy module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

This module is used by OpenSIPS to communicate with RTPProxy, a media relay proxy used to make the communication between user agents behind NAT possible.

This module is also used along with RTPProxy to record media streams between user agents or to play media to either UAc or UAs.

## How It Works

Currently, the rtpproxy module can support multiple rtpproxies for balancing/distribution and control/selection purposes.

The module allows the definition of several sets of rtpproxies - load-balancing will be performed over a set and the user has the ability to choose what set should be used. The set is selected via its id - the id being defined along with the set. Refer to the “rtpproxy_sock” module parameter definition for syntax description.

The balancing inside a set is done automatically by the module based on the weight of each rtpproxy from the set. Note that if rtpproxy has weight 0, it will be used only when no other rtpproxies (with a different weight value than 0) respond. Default weight is 1.

Starting with OpenSIPS 2.1, engage_rtp_proxy(), unforce_rtp_proxy() and start_recording() functions have been fully replaced by rtpproxy_engage(), rtpproxy_unforce() and rtpproxy_start_recording().

IMPORTANT: if you use multiple sets, make sure you use the same set for both rtpproxy_offer()/rtpproxy_answer() and rtpproxy_unforce()!!

Nathelper module can also receive timeout notifications from multiple rtpproxies. RTPProxy can be configured to send notifications when a session doesn't receive any media for a configurable interval of time. The rtpproxy modules has implemented a listener for such notifications and when received it terminates the dialog at SIP level (send BYE to both ends), with the help of dialog module.

In our tests with RTPProxy we observed some limitations and also provide a patch for it against git commit “600c80493793bafd2d69427bc22fcb43faad98c5”. It contains an addition and implements separate timeout parameters for the phases of session establishment and ongoing sessions. In the official code a single timeout parameter controls both session establishment and rtp timeout and the timeout notification is also sent in the call establishment phase. This is a problem since we want to detect rtp timeout fast, but also allow a longer period for call establishment.

Note that RTPProxy version [v2.0.0](http://www.rtpproxy.org/post/v2release/) has integrated this feature upstream, therefore this patch is no longer needed.

To enable timeout notification there are several steps that you must follow:

Start OpenSIPS timeout detection by setting the “rtpp_notify_socket” module parameter in your configuration script. This is the socket where further notification will be received from rtpproxies. This socket must be a TCP or UNIX socket. Also, for all the calls that require notification, the rtpproxy_engage(), rtpproxy_offer() and rtpproxy_answer() functions must be called with the “n” flag.

Configure RTPProxy to use timeout notification by adding the following command line parameters:

*   “ -n timeout_socket” - specifies where the notifications will be sent. This socket must be the same as “rtpp_notify_socket” OpenSIPS module parameter. This parameter is mandatory.
    
*   “ -T ttl” - limits the rtp session timeout to “ttl”. This parameter is optional and the default value is 60 seconds.
    
*   “ -W ttl” - limits the session establishment timeout to “ttl”. This parameter is optional and the default value is 60 seconds.
    
All of the previous parameters can be used with the offical RTPProxy release, except for the last one. It has been added, together with other modifications to RTPProxy in order to work properly. The patch is located in the _patches_ directory in the module.

To get the patched version from git you must follow theese steps:

*   Get the latest source code: “git clone git://sippy.git.sourceforge.net/gitroot/sippy/rtpproxy”
    
*   Make a branch from the commit: “git checkout -b branch_name 600c80493793bafd2d69427bc22fcb43faad98c5”
    
*   Patch RTPProxy: “patch < path_to_rtpproxy_patch”
    
The patched version can also be found at: https://opensips.org/pub/rtpproxy/

## Dependencies

### OpenSIPs Modules

- `a database module` — only if you want to load use a database table from where to load the rtp proxies sets. (optional)
- `dialog module` — if using the rtpproxy_engage functions or RTPProxy timeout notifications. (optional)

### External Libraries

None.

## Exported Parameters

### `db_table` (string)

The name of the database table containing definitions of socket(s) used to connect to (a set) RTPProxy.

*Default value is rtpproxy_sockets.*

**Example.** nh_sockets.

```opensips
modparam("rtpproxy", "db_table", "nh_sockets")
```
### `db_url` (string)

The database url. This parameter should be set if you want to use a database table from where to load or reload definitions of socket(s) used to connect to (a set) RTPProxy. The record from the database table will be read at start up (added to the ones defined with the rtpproxy_sock module parameter) and when the MI command rtpproxy_reload is issued(the definitions will be replaced with the ones from the database table).

*Default value is NULL.*

**Example.** mysql://opensips:opensipsrw@192.168.2.132/opensips.

```opensips
modparam("rtpproxy", "db_url", 
		"mysql://opensips:opensipsrw@192.168.2.132/opensips")
```
### `default_set` (integer)

The parameter indicates the default RTPProxy set to be used when provisioning an engine in the config file without an explicit set, or when calling one of the _rtpproxy_*()_ functions without an explicit set.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("rtpproxy", "default_set", 1)
```
### `generated_sdp_media_ip` (string)

When RTPProxy module needs to generate an SDP body, use this value as the media_ip in the c= and the o=.

*Default value is 127.0.0.1.*

**Example.** 10.0.0.1.

```opensips
modparam("rtpproxy", "generated_sdp_media_ip", "10.0.0.1")
```
### `generated_sdp_port_max` (integer)

When RTPProxy module needs to generate an SDP body, use this value as the maximum value of the port.

*Default value is 65000.*

**Example.** 30000.

```opensips
modparam("rtpproxy", "generated_sdp_port_max", 30000)
```
### `generated_sdp_port_min` (integer)

When RTPProxy module needs to generate an SDP body, use this value as the minimum value of the port.

*Default value is 35000.*

**Example.** 10000.

```opensips
modparam("rtpproxy", "generated_sdp_port_min", 10000)
```
### `nortpproxy_str` (string)

The parameter sets the SDP attribute used by rtpproxy to mark the packet SDP informations have already been mangled.

If empty string, no marker will be added or checked.

*Default value is a=nortpproxy:yes\r\n.*

**Notes:** The string must be a complete SDP line, including the EOH (\r\n).

**Example.** a=sdpmangled:yes\r\n.

```opensips
modparam("rtpproxy", "nortpproxy_str", "a=sdpmangled:yes\\r\\n")
```
### `rtpp_notify_socket` (string)

The socket OpenSIPS listens for notifications from RTPProxy. Currently OpenSIPS can receive RTP timeout and DTMF events.

*Default value is NULL.*

**Example.** tcp:10.10.10.10:9999.

```opensips
modparam("rtpproxy", "rtpp_notify_socket", "tcp:10.10.10.10:9999")

# use an UNIX socket
modparam("rtpproxy", "rtpp_notify_socket", "unix:/tmp/rtpproxy.unix")
# or
modparam("rtpproxy", "rtpp_notify_socket", "/tmp/rtpproxy.unix")
```
### `rtpp_socket_col` (string)

The name rtpp socket column in the database table.

*Default value is rtpproxy_sock.*

**Example.** rtpp_socket.

```opensips
modparam("rtpproxy", "rtpp_socket_col", "rtpp_socket")
```
### `rtpproxy_autobridge` (integer)

Enable auto-bridging feature. Does not properly function when doing serial/parallel forking!

*Default value is 0.*

**Example.** 1.

```opensips
modparam("rtpproxy", "rtpproxy_autobridge", 1)
```
### `rtpproxy_disable_tout` (integer)

Once RTPProxy was found unreachable and marked as disable, rtpproxy will not attempt to establish communication to RTPProxy for rtpproxy_disable_tout seconds.

*Default value is 60.*

**Example.** 20.

```opensips
modparam("rtpproxy", "rtpproxy_disable_tout", 20)
```
### `rtpproxy_retr` (integer)

How many times rtpproxy should retry to send and receive after timeout was generated.

*Default value is 5.*

**Example.** 2.

```opensips
modparam("rtpproxy", "rtpproxy_retr", 2)
```
### `rtpproxy_sock` (string)

Definition of socket(s) used to connect to (a set) RTPProxy. It may specify a UNIX socket, an IPv4/IPv6 UDP socket or an IPv4/IPv6 TCP socket. If the protocol part (i.e. “udp:”) is missing, the socket is treated as a UNIX socket.

The definition also supports to specify a different IP that will be advertised instead of the one returned by RTPProxy. This is useful when having multiple RTPProxy servers that are located behind NAT, and listen only on private intefaces, but need to advertise a public one.

*Default value is NONE.*

**Example.** udp:localhost:22222=2.

```opensips
# single rtpproxy with specific weight
modparam("rtpproxy", "rtpproxy_sock", "udp:localhost:22222=2")

# single rtpproxy with advertised address + weight
modparam("rtpproxy", "rtpproxy_sock", "udp:localhost:22222|8.8.8.8=2")

# multiple rtproxies for LB
modparam("rtpproxy", "rtpproxy_sock",
	"udp:localhost:22222 udp:localhost:22223 tcp:remote1:33422 tcp6:remote2:32322")

# multiple sets of multiple rtproxies
modparam("rtpproxy", "rtpproxy_sock", "1 == udp:localhost:22222 udp:localhost:22223")
modparam("rtpproxy", "rtpproxy_sock", "2 == udp:localhost:22223")
modparam("rtpproxy", "rtpproxy_sock", "2 == udp:localhost:22223|8.8.8.8")
```
### `rtpproxy_timeout` (string)

Timeout value in waiting for reply from RTPProxy.

*Default value is 1.*

**Example.** 0.2.

```opensips
modparam("rtpproxy", "rtpproxy_timeout", "0.2")
```
### `set_id_col` (string)

The name set id column in the database table.

*Default value is set_id.*

**Example.** rtpp_set_id.

```opensips
modparam("rtpproxy", "set_id_col", "rtpp_set_id")
```

## Exported Functions

### `rtpproxy_all_stats(stats_avp[, [set_id][, sock_var]])`

This command gathers all RTP statistics available from RTP-Proxy. All the returned values stored in an AVP that can be further read by indexing the AVP.

This command is only available starting with RTPProxy 2.1 realease.

**Parameters:**

- `set_id` *(int, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.
- `stats_avp` *(var, required)* — an AVP where the statistics will be stored. This AVP can be further indexed to get a specific statistic.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** Example 1.23. rtpproxy_all_stats usage.

```opensips
...
rtpproxy_all_stats($avp(stats));
xlog("RTP statistics for $ci: dropped=$(avp(stats)[4])\\n");
...
```

### `rtpproxy_answer([[flags][, [ip_address][, [set_id][, [sock_var][, [ret_var][, [body_var][, [bind_local]]]]]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on 200 OK for the cases the SDPs are in INVITE and 200 OK and on ACK when SDPs are in 200 OK and ACK.

See rtpproxy_offer() function description above for the meaning of the parameters.

**Parameters:**

- `bind_local` *(string, optional)* — provides the local bind/interface value directly on the call. When set to a string, its value is appended as l<value> to the RTPProxy U/L command (for example, "[1:2:3]" for IPv6).
- `body_var` *(var, optional)* — in-out variable for the body that should be used to challenge RTP proxy server. If the variable is specified, the function uses its content as the body to challenge, and returns the resulting body in it. If not used, the message's body is used, and the outgoing body is changed.
- `flags` *(string, optional)* — flags to turn on some features (see rtpproxy_engage).
- `ip_address` *(string, optional)* — new SDP IP address.
- `ret_var` *(var, optional)* — variable used to print the IP and port the RTPProxy server is using for this call.
- `set_id` *(integer, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** rtpproxy_answer usage.

```opensips
See rtpproxy_offer() function example above for example.
```

### `rtpproxy_engage([[flags][, [ip_address][, [set_id][, [sock_var][, ret_var]]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. It uses the dialog module facilities to keep track when the rtpproxy session must be updated. Function must only be called for the initial INVITE and internally takes care of rewriting the body of 200 OKs and ACKs. Note that when used in bridge mode, this function might advertise wrong interfaces in SDP (due to the fact that OpenSIPS is not aware of the RTPProxy configuration), so you might face an undefined behavior.

**Parameters:**

- `flags` *(string, optional)* — flags to turn on some features.

a - flags that UA from which message is received doesn't support symmetric RTP.

l - force “lookup”, that is, only rewrite SDP when corresponding session is already exists in the RTP proxy. By default is on when the session is to be completed (reply in non-swap or ACK in swap mode).

k - only create RTPProxy session, but do not modify the SDP body. This is useful when you only want to inject some media, but do not want to engage RTPProxy in the entire call.

i/e - when RTPProxy is used in bridge mode, these flags are used to indicate the direction of the media flow for the current request/reply. 'i' refers to the LAN (internal network) and corresponds to the first interface of RTPProxy (as specified by the -l parameter). 'e' refers to the WAN (external network) and corresponds to the second interface of RTPProxy. These flags should always be used together. For example, an INVITE (offer) that comes from the Internet (WAN) to goes to a local media server (LAN) should use the 'ei' flags. The answer should use the 'ie' flags. Depending on the scenario, the 'ii' and 'ee' combination are also supported. Only makes sense when RTPProxy is running in the bridge mode.

NOTE: when using RTPProxy in bridge mode, all sessions are considered asymmetric (as oposed to symmetric if used in normal mode). If you have symmetric clients (this is the most common scenario), you'll have to force the s!

f - instructs rtpproxy to ignore marks inserted by another rtpproxy in transit to indicate that the session is already goes through another proxy. Allows creating chain of proxies.

r - flags that IP address in SDP should be trusted. Without this flag, rtpproxy ignores address in the SDP and uses source address of the SIP message as media address which is passed to the RTP proxy.

o - flags that IP from the origin description (o=) should be also changed.

c - flags to change the session-level SDP connection (c=) IP if media-description also includes connection information.

s/w - flags that for the UA from which message is received, support symmetric RTP must be forced.

n[<SOCKET>] - flags that enables the notification timeout for the session. One can specify an optional "advertised" socket between the < and > tags. If the socket is not specified, the value of rtpp_notify_socket is used.

d[NNN] - enables DTMF notifications for this call. One can optionally specify the payload type that DTMF will be used for this call - it it is not specified, RTPProxy uses the 101 pt. NOTE: this feature is currently only available in the RTPProxy rtpp_2_1_dtmf branch.

tNN - can be used to specify a RTP ttl for the caller. The NN represents the timeout in seconds for that stream. This can be useful in music on hold scenarios where only one client is sending RTP.

TNN - Similar to the tNN paramaeter, but used for tuning the calllee's ttl for RTP.

zNN - requests the RTPproxy to perform re-packetization of RTP traffic coming from the UA which has sent the current message to increase or decrease payload size per each RTP packet forwarded if possible. The NN is the target payload size in ms, for the most codecs its value should be in 10ms increments, however for some codecs the increment could differ (e.g. 30ms for GSM or 20ms for G.723). The RTPproxy would select the closest value supported by the codec. This feature could be used for significantly reducing bandwith overhead for low bitrate codecs, for example with G.729 going from 10ms to 100ms saves two thirds of the network bandwith.
- `ip_address` *(string, optional)* — new SDP IP address.
- `ret_var` *(var, optional)* — variable used to print the IP and port the RTPProxy server is using for this call. This is useful especially when using the rtp_cluster, which can advertise multiple servers behind it. The format of the value returned is IP:port. Note that the variable will only be populated in the initial request.
- `set_id` *(integer, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call. Note that the variable will only be populated in the initial request.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** rtpproxy_engage usage.

```opensips
...
if (is_method("INVITE") && has_totag()) {
	if ($var(setid) != 0) {
		rtpproxy_engage(,,$var(setid), $var(proxy));
		xlog("SCRIPT: RTPProxy server used is $var(proxy)\n");
	} else {
		rtpproxy_engage();
		xlog("SCRIPT: using default RTPProxy set\n");
	}
}
...
```

### `rtpproxy_offer([[flags][, [ip_address][, [set_id][, [sock_var][, [ret_var][, [body_var][, [bind_local]]]]]]]])`

Rewrites SDP body to ensure that media is passed through an RTP proxy. To be invoked on INVITE for the cases the SDPs are in INVITE and 200 OK and on 200 OK when SDPs are in 200 OK and ACK.

The function receives the same parameters as rtpproxy_engage(), as well as extra parameters named body_var and bind_local. The body_var parameter is used as an in-out variable for the body that should be used to challenge RTP proxy server. If the variable is specified, the function uses its content as the body to challenge, and returns the resulting body in it. If not used, the message's body is used, and the outgoing body is changed.

The optional bind_local parameter provides the local bind/interface value directly on the call. When set to a string, its value is appended as l<value> to the RTPProxy U/L command (for example, "[1:2:3]" for IPv6). This applies to both rtpproxy_offer() and rtpproxy_answer().

**Parameters:**

- `bind_local` *(string, optional)* — provides the local bind/interface value directly on the call. When set to a string, its value is appended as l<value> to the RTPProxy U/L command (for example, "[1:2:3]" for IPv6).
- `body_var` *(var, optional)* — in-out variable for the body that should be used to challenge RTP proxy server. If the variable is specified, the function uses its content as the body to challenge, and returns the resulting body in it. If not used, the message's body is used, and the outgoing body is changed.
- `flags` *(string, optional)* — flags to turn on some features (see rtpproxy_engage).
- `ip_address` *(string, optional)* — new SDP IP address.
- `ret_var` *(var, optional)* — variable used to print the IP and port the RTPProxy server is using for this call.
- `set_id` *(integer, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** rtpproxy_offer usage.

```opensips
route {
...
    if (is_method("INVITE")) {
        if (has_body("application/sdp")) {
            if (rtpproxy_offer())
                t_on_reply("1");
        } else {
            t_on_reply("2");
        }
    }
    if (is_method("ACK") && has_body("application/sdp"))
        rtpproxy_answer();
...
}

onreply_route[1]
{
...
    if (has_body("application/sdp"))
        rtpproxy_answer();
...
}

onreply_route[2]
{
...
    if (has_body("application/sdp"))
        rtpproxy_offer();
...
}
```

### `rtpproxy_start_recording([[set_id][, [sock_var][, [flags][, [destination][, mediastream]]]]])`

This command will send a signal to the RTP-Proxy to record the RTP stream on the RTP-Proxy.

**Parameters:**

- `destination` *(string, optional)* — the destination of the recording. If it has the udp:IP:port format, RTPProxy sends the RTP stream to that IP:port remote destination. Otherwise, destination represents the name of the file in the recording directory.
- `flags` *(string, optional)* — a list of flags passed to RTPProxy for the recording. Currently only s is supported, and it indicates that RTPProxy should record both audio legs in a single file. Note that this feature is available starting with RTPProxy 2.0.
- `mediastream` *(int, optional)* — this parameter is only used if the destination is specified, and represents the index of media stream to record/copy, starting from 1. If this parameter is missing, OpenSIPS instructs RTPProxy to copy all the streams.
- `set_id` *(int, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** rtpproxy_start_recording usage.

```opensips
...
rtpproxy_start_recording();

# copy RTP stream to a different listener
rtpproxy_start_recording(,,,"udp:127.0.0.1:60000");

# copy only first RTP stream (audio stream)
rtpproxy_start_recording(,,,"udp:127.0.0.1:60000", 1);
...
```

### `rtpproxy_stats(up_pvar, down_var, sent_var, fail_var[, [set_id][, sock_var]])`

This command gathers call RTP statistics from RTP-Proxy.

**Parameters:**

- `down_var` *(var, required)* — the variable used to return the packets sent by downstream for this call.
- `fail_var` *(var, required)* — the variable used to return the number of failed packets for this call.
- `sent_var` *(var, required)* — the variable used to return the total number of packets sent for this call.
- `set_id` *(int, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.
- `up_pvar` *(var, required)* — the variable used to return the packets sent by upstream for this call.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** rtpproxy_stats usage.

```opensips
...
rtpproxy_stats($var(up),$var(down),$var(sent),$var(fail));
xlog("RTP statistics for $ci: up=$var(up) down=$var(down) sent=$var(sent) fail=$var(fail)\\n");
...
```

### `rtpproxy_stop_stream2uac([[set_id][, sock_var]])`

Stop streaming of announcement/prompt/MOH started previously by the respective rtpproxy_stream2xxx. The uac/uas suffix selects whose announcement relatively to tha current transaction should be stopped - UAC or UAS.

**Parameters:**

- `set_id` *(int, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

### `rtpproxy_stop_stream2uas([[set_id][, sock_var]])`

Stop streaming of announcement/prompt/MOH started previously by the respective rtpproxy_stream2xxx. The uac/uas suffix selects whose announcement relatively to tha current transaction should be stopped - UAC or UAS.

**Parameters:**

- `set_id` *(int, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

### `rtpproxy_stream2uac(prompt_name, count[, [set_id][, sock_var]])`

Instruct the RTPproxy to stream prompt/announcement pre-encoded with the makeann command from the RTPproxy distribution. The uac/uas suffix selects who will hear the announcement relatively to the current transaction - UAC or UAS. For example invoking the rtpproxy_stream2uac in the request processing block on ACK transaction will play the prompt to the UA that has generated original INVITE and ACK while rtpproxy_stop_stream2uas on 183 in reply processing block will play the prompt to the UA that has generated 183.

Apart from generating announcements, another possible application of this function is implementing music on hold (MOH) functionality. When count is -1, the streaming will be in loop indefinitely until the appropriate rtpproxy_stop_stream2xxx is issued.

In order to work correctly, functions require that the session in the RTPproxy already exists. Also those functions don't alted SDP, so that they are not substitute for calling rtpproxy_offer or rtpproxy_answer.

**Parameters:**

- `count` *(integer, required)* — number of times the prompt should be repeated. The value of -1 means that it will be streaming in loop indefinitely, until appropriate rtpproxy_stop_stream2xxx is issued.
- `prompt_name` *(string, required)* — name of the prompt to stream. Should be either absolute pathname or pathname relative to the directory where RTPproxy runs.
- `set_id` *(integer, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** rtpproxy_stream2xxx usage.

```opensips
...
    if (is_method("INVITE")) {
        rtpproxy_offer();
        if ($rb=~ "0\\.0\\.0\\.0") {
            rtpproxy_stream2uas("/var/rtpproxy/prompts/music_on_hold", -1);
        } else {
            rtpproxy_stop_stream2uas();
        };
    };
...
```

### `rtpproxy_stream2uas(prompt_name, count[, [set_id][, sock_var]])`

Instruct the RTPproxy to stream prompt/announcement pre-encoded with the makeann command from the RTPproxy distribution. The uac/uas suffix selects who will hear the announcement relatively to the current transaction - UAC or UAS. For example invoking the rtpproxy_stream2uac in the request processing block on ACK transaction will play the prompt to the UA that has generated original INVITE and ACK while rtpproxy_stop_stream2uas on 183 in reply processing block will play the prompt to the UA that has generated 183. Apart from generating announcements, another possible application of this function is implementing music on hold (MOH) functionality. When count is -1, the streaming will be in loop indefinitely until the appropriate rtpproxy_stop_stream2xxx is issued. In order to work correctly, functions require that the session in the RTPproxy already exists. Also those functions don't alted SDP, so that they are not substitute for calling rtpproxy_offer or rtpproxy_answer.

**Parameters:**

- `count` *(int, required)* — number of times the prompt should be repeated. The value of -1 means that it will be streaming in loop indefinitely, until appropriate rtpproxy_stop_stream2xxx is issued.
- `prompt_name` *(string, required)* — name of the prompt to stream. Should be either absolute pathname or pathname relative to the directory where RTPproxy runs.
- `set_id` *(int, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE

**Example.** rtpproxy_stream2xxx usage.

```opensips
...
    if (is_method("INVITE")) {
        rtpproxy_offer();
        if ($rb=~ "0\\.0\\.0\\.0") {
            rtpproxy_stream2uas("/var/rtpproxy/prompts/music_on_hold", -1);
        } else {
            rtpproxy_stop_stream2uas();
        };
    };
...
```

### `rtpproxy_unforce([[set_id][, sock_var]])`

Tears down the RTPProxy session for the current call.

**Parameters:**

- `set_id` *(integer, optional)* — the set used for this call.
- `sock_var` *(var, optional)* — variable used to store the RTPProxy socket chosen for this call.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** rtpproxy_unforce usage.

```opensips
...
rtpproxy_unforce();
...
```

## Exported MI Functions

### `rtpproxy:enable`

Replaces obsolete MI command: rtpproxy_enable. Enables/Disables a rtp proxy. NOTE: if a rtpproxy is defined multiple times (in the same or different set), all its instances will be enables/disabled IF no set ID provided (as second param).

**Parameters:**

- `rtpproxy:enable` *(integer, required)* — 1 - enable, 0 - disable the RTPproxy node, 2 - put the RTPproxy node in probing mode.
- `setid` *(integer, optional)* — the rtpproxy set ID (used for better indentification of the rtpproxy instance to be enabled, for example when a rtpproxy is used in multiple sets).
- `url` *(string, required)* — the rtp proxy url (exactly as defined in the config file).

**Example.** disable a RTPProxy by URL only

```bash
## disable a RTPProxy by URL only
$ opensips-cli -x mi rtpproxy:enable udp:192.168.2.133:8081 0
```

**Example.** disable a RTPProxy by URL and set ID (3)

```bash
## disable a RTPProxy by URL and set ID (3)
$ opensips-cli -x mi rtpproxy:enable udp:192.168.2.133:8081 0 3
```

### `rtpproxy:reload`

Replaces obsolete MI command: rtpproxy_reload. Reload rtp proxies sets from database. The function will delete all previous records and populate the list with the entries from the database table. The db_url parameter must be set if you want to use this command.

**Example.**

```bash
$ opensips-cli -x mi rtpproxy:reload
```

### `rtpproxy:show`

Replaces obsolete MI command: rtpproxy_show. Displays all the rtp proxies and their information: set and status (disabled or not, weight and recheck_ticks).

**Example.**

```bash
$ opensips-cli -x mi rtpproxy:show
```

## Exported Events

### `E_RTPPROXY_DTMF`

This event is raised when a RTPProxy server sends a DTMF notification to OpenSIPS. In order to catch RFC 2833/4733 DTMF events, you need to provide the d flag to rtpproxy_offer()/ rtpproxy_answer().

**Parameters:**

- `digit` *(string)* — the digit pressed.
- `duration` *(integer)* — the duration of the event.
- `volume` *(integer)* — the volume of the event.
- `id` *(string)* — represents the identifier of the call for which that event was received.
- `is_callid` *(integer)* — is 0 if the id parameter represents the Dialog ID, or 1 if it is a callid.
- `stream` *(integer)* — indicates the stream index of the RTPProxy session. It is normally 0 if the caller sent the DTMF, or 1 if the callee sent it.
### `E_RTPPROXY_STATUS`

This event is raised when a RTPProxy server changes it's status to enabled/disabled.

**Parameters:**

- `socket` *(string)* — the socket that identifies the RTPProxy instance.
- `status` *(string)* — active if the RTPProxy instance responds to probing or inactive if the instance was deactivated.

## Configuration Examples

### Set `rtpproxy_sock` parameter

Set `rtpproxy_sock` parameter

```opensips
...
# single rtpproxy with specific weight
modparam("rtpproxy", "rtpproxy_sock", "udp:localhost:22222=2")

# single rtpproxy with advertised address + weight
modparam("rtpproxy", "rtpproxy_sock", "udp:localhost:22222|8.8.8.8=2")

# multiple rtproxies for LB
modparam("rtpproxy", "rtpproxy_sock",
	"udp:localhost:22222 udp:localhost:22223 tcp:remote1:33422 tcp6:remote2:32322")

# multiple sets of multiple rtproxies
modparam("rtpproxy", "rtpproxy_sock", "1 == udp:localhost:22222 udp:localhost:22223")
modparam("rtpproxy", "rtpproxy_sock", "2 == udp:localhost:22223")
modparam("rtpproxy", "rtpproxy_sock", "2 == udp:localhost:22223|8.8.8.8")
...
```
### Set `rtpproxy_disable_tout` parameter

Set `rtpproxy_disable_tout` parameter

```opensips
...
modparam("rtpproxy", "rtpproxy_disable_tout", 20)
...
```
### Set `rtpproxy_timeout` parameter to 200ms

Set `rtpproxy_timeout` parameter to 200ms

```opensips
...
modparam("rtpproxy", "rtpproxy_timeout", "0.2")
...
```
### Enable auto-bridging feature

Enable auto-bridging feature

```opensips
...
modparam("rtpproxy", "rtpproxy_autobridge", 1)
...
```
### Set `rtpproxy_retr` parameter

Set `rtpproxy_retr` parameter

```opensips
...
modparam("rtpproxy", "rtpproxy_retr", 2)
...
```
### Set `default_set` parameter

Set `default_set` parameter

```opensips
...
modparam("rtpproxy", "default_set", 1)
...
```
### Set `nortpproxy_str` parameter

Set `nortpproxy_str` parameter

```opensips
...
modparam("rtpproxy", "nortpproxy_str", "a=sdpmangled:yes\\r\\n")
...
```
### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("rtpproxy", "db_url", 
		"mysql://opensips:opensipsrw@192.168.2.132/opensips")
...
```
### Set `db_table` parameter

Set `db_table` parameter

```opensips
...
modparam("rtpproxy", "db_table", "nh_sockets") 
...
```
### Set `rtpp_socket_col` parameter

Set `rtpp_socket_col` parameter

```opensips
...
modparam("rtpproxy", "rtpp_socket_col", "rtpp_socket") 
...
```
### Set `set_id` parameter

Set `set_id` parameter

```opensips
...
modparam("rtpproxy", "set_id_col", "rtpp_set_id") 
...
```
### Set `rtpp_notify_socket` parameter

Set `rtpp_notify_socket` parameter

```opensips
...
modparam("rtpproxy", "rtpp_notify_socket", "tcp:10.10.10.10:9999")

# use an UNIX socket
modparam("rtpproxy", "rtpp_notify_socket", "unix:/tmp/rtpproxy.unix")
# or
modparam("rtpproxy", "rtpp_notify_socket", "/tmp/rtpproxy.unix")
...
```
### Set `generated_sdp_port_min` parameter

Set `generated_sdp_port_min` parameter

```opensips
...
modparam("rtpproxy", "generated_sdp_port_min", 10000)
...
```
### Set `generated_sdp_port_max` parameter

Set `generated_sdp_port_max` parameter

```opensips
...
modparam("rtpproxy", "generated_sdp_port_max", 30000)
...
```
### Set `generated_sdp_media_ip` parameter

Set `generated_sdp_media_ip` parameter

```opensips
...
modparam("rtpproxy", "generated_sdp_media_ip", "10.0.0.1")
...
```
### `rtpproxy_engage` usage

`rtpproxy_engage` usage

```opensips
...
if (is_method("INVITE") && has_totag()) {
	if ($var(setid) != 0) {
		rtpproxy_engage(,,$var(setid), $var(proxy));
		xlog("SCRIPT: RTPProxy server used is $var(proxy)\\n");
	} else {
		rtpproxy_engage();
		xlog("SCRIPT: using default RTPProxy set\\n");
	}
}
...
```
### `rtpproxy_offer` usage

`rtpproxy_offer` usage

```opensips
route {
...
    if (is_method("INVITE")) {
        if (has_body("application/sdp")) {
            if (rtpproxy_offer())
                t_on_reply("1");
        } else {
            t_on_reply("2");
        }
    }
    if (is_method("ACK") && has_body("application/sdp"))
        rtpproxy_answer();
...
}

onreply_route\[1\]
{
...
    if (has_body("application/sdp"))
        rtpproxy_answer();
...
}

onreply_route\[2\]
{
...
    if (has_body("application/sdp"))
        rtpproxy_offer();
...
}
```
### `rtpproxy_unforce` usage

`rtpproxy_unforce` usage

```opensips
...
rtpproxy_unforce();
...
```
### `rtpproxy_stream2xxx` usage

`rtpproxy_stream2xxx` usage

```opensips
...
    if (is_method("INVITE")) {
        rtpproxy_offer();
        if ($rb=~ "0\\.0\\.0\\.0") {
            rtpproxy_stream2uas("/var/rtpproxy/prompts/music_on_hold", -1);
        } else {
            rtpproxy_stop_stream2uas();
        };
    };
...
```
### `rtpproxy_start_recording` usage

`rtpproxy_start_recording` usage

```opensips
...
rtpproxy_start_recording();

# copy RTP stream to a different listener
rtpproxy_start_recording(,,,"udp:127.0.0.1:60000");

# copy only first RTP stream (audio stream)
rtpproxy_start_recording(,,,"udp:127.0.0.1:60000", 1);
...
```
### `rtpproxy_stats` usage

`rtpproxy_stats` usage

```opensips
...
rtpproxy_stats($var(up),$var(down),$var(sent),$var(fail));
xlog("RTP statistics for $ci: up=$var(up) down=$var(down) sent=$var(sent) fail=$var(fail)\\n");
...
```
### `rtpproxy_all_stats` usage

`rtpproxy_all_stats` usage

```opensips
...
rtpproxy_all_stats($avp(stats));
xlog("RTP statistics for $ci: dropped=$(avp(stats)\[4\])\\n");
...
```
### `rtpproxy:enable` usage

`rtpproxy:enable` usage

```opensips
...
## disable a RTPProxy by URL only
$ opensips-cli -x mi rtpproxy:enable udp:192.168.2.133:8081 0
## disable a RTPProxy by URL and set ID (3)
$ opensips-cli -x mi rtpproxy:enable udp:192.168.2.133:8081 0 3
...
```
### `rtpproxy:show` usage

`rtpproxy:show` usage

```opensips
...
$ opensips-cli -x mi rtpproxy:show
...
```
### `rtpproxy:reload` usage

`rtpproxy:reload` usage

```opensips
...
$ opensips-cli -x mi rtpproxy:reload
...
```
