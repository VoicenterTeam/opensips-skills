# proto\_wss Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5714448)

3.2. [Most recently active contributors(1) to this module](#idp5809648)

**List of Examples**

1.1. [Set `listen` variable](#idp165360)

1.2. [Set `wss_port` variable](#idp170768)

1.3. [Set `wss_max_msg_chunks` parameter](#idp5565408)

1.4. [Set `wss_resource` parameter](#idp5570112)

1.5. [Set `wss_handshake_timeout` parameter](#idp5574704)

1.6. [Set `cert_check_on_conn_reusage` parameter](#idp5580240)

1.7. [Set `trace_destination` parameter](#idp253664)

1.8. [Set `trace_on` parameter](#idp5614128)

1.9. [Set `trace_filter_route` parameter](#idp5626544)

1.10. [Set `wss_tls_handshake_timeout` variable](#idp5632336)

1.11. [Set `wss_send_timeout` variable](#idp5637232)

1.12. [Set `require_origin` parameter](#idp5641472)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The WSS (Secure WebSocket) module provides the ability to communicate with a WebSocket ([RFC 6455](http://tools.ietf.org/html/rfc6455)) client or server over a secure (TLS encrypted) channel. As part of the [WebRTC](https://webrtc.org/) specifications, this protocol can be used to provide secure VoIP calls to HTTPS enabled browsers.

This module behaves as any other transport protocol module: in order to use it, you must define one or more listeners that will handle the secure WebSocket traffic, _after_ the `mpath` parameter:

...
mpath=/path/to/modules
...
socket=wss:10.0.0.1			# change with the listening IP
socket=wss:10.0.0.1:5060	# change with the listening IP and port
...

Besides that, you need to define the TLS parameters for securing the connection. This is done through the _tls\_mgm_ module interface, similar to the _proto\_tls_ module:

modparam("tls\_mgm", "certificate", "/certs/biloxy.com/cert.pem")
modparam("tls\_mgm", "private\_key", "/certs/biloxy.com/privkey.pem")
modparam("tls\_mgm", "ca\_list", "/certs/wellknownCAs")
modparam("tls\_mgm", "tls\_method", "tlsv1")
modparam("tls\_mgm", "verify\_cert", "1")
modparam("tls\_mgm", "require\_cert", "1")

Check the _tls\_mgm_ module documentation for more info.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tls\_openssl_ or _tls\_wolfssl_, depending on the desired TLS library
    
*   _tls\_mgm_.
    

### 1.2.2.�Dependencies of external libraries

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

All these parameters can be used from the opensips.cfg file, to configure the behavior of OpenSIPS-WSS.

### 1.3.1.�`listen`\=interface

This is a global parameter that specifies what interface/IP and port should handle WSS traffic.

**Example�1.1.�Set `listen` variable**

...
socket= wss:1.2.3.4:44344
...
				

  

### 1.3.2.�`wss_port` (integer)

The default port to be used for all WSS related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the WSS listeners) and the SIP sending part (if the destination WSS URI has no explicit port).

If you want to change only the listening port for WSS, use the port option in the SIP listener defintion.

_Default value is 443._

**Example�1.2.�Set `wss_port` variable**

...
modparam("proto\_wss", "wss\_port", 44344)
...
				

  

### 1.3.3.�`wss_max_msg_chunks` (integer)

The maximum number of chunks in which a SIP message is expected to arrive via WSS. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 4._

**Example�1.3.�Set `wss_max_msg_chunks` parameter**

...
modparam("proto\_wss", "wss\_max\_msg\_chunks", 8)
...

  

### 1.3.4.�`wss_resource` (string)

The resource queried for when a WebSocket handshake is initiated.

_Default value is “/”._

**Example�1.4.�Set `wss_resource` parameter**

...
modparam("proto\_wss", "wss\_resource", "/wss")
...

  

### 1.3.5.�`wss_handshake_timeout` (integer)

This parameter specifies the time in milliseconds the proto\_wss module waits for a WebSocket handshake reply from a WebSocket server.

_Default value is 100._

**Example�1.5.�Set `wss_handshake_timeout` parameter**

...
modparam("proto\_wss", "wss\_handshake\_timeout", 300)
...

  

### 1.3.6.�`cert_check_on_conn_reusage` (integer)

This parameter turns on or off the extra checking/matching of the TLS domain (SSL certificate) when comes to reusing an existing TLS connection. Without this extra check, only IP and port of the connections will be check (in order to re-use an existing connection). With this extra check, the connection to be reused must have the same SSL certificate as the one set for the current signaling operation.

This checking is done only when comes to send SIP traffic via TLS and it is applied only against connections that were created / initiated by OpenSIPS (as TLS client). Any accepte connection (as TLS server) will automatically match (the extra test will be skipped).

_Default value is 0 (disabled)._

**Example�1.6.�Set `cert_check_on_conn_reusage` parameter**

...
modparam("proto\_wss", "cert\_check\_on\_conn\_reusage", 1)
...

  

### 1.3.7.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process. For each connection that is created an event containing information about the client and server certificate, master key, http request and reply belonging to web socket protocol handshake and network layer information shall be sent.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.7.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "hep\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto\_wss", "trace\_destination", "hep\_dest")
...

  

### 1.3.8.�`trace_on` (int)

This controls whether tracing for wss is on or not. You still need to define [trace\_destination](#param_trace_destination "1.3.7.�trace_destination (string)")in order to work, but this value will be controlled using mi function [wss\_trace](#mi_wss_trace "1.4.1.� wss_trace").

_Default value is 0(tracing inactive)._

**Example�1.8.�Set `trace_on` parameter**

...
modparam("proto\_wss", "trace\_on", 1)
...

  

### 1.3.9.�`trace_filter_route` (string)

Define the name of a route in which you can filter which connections will be trace and which connections won't be. In this route you will have information regarding source and destination ips and ports for the current connection. To disable tracing for a specific connection the last call in this route must be **drop**, any other exit mode resulting in tracing the current connection ( of course you still have to define a [trace\_destination](#param_trace_destination "1.3.7.�trace_destination (string)") and trace must be on at the time this connection is opened.

**IMPORTANT** Filtering on ip addresses and ports can be made using **$si** and **$sp** for matching either the entity that is connecting to OpenSIPS or the entity to which OpenSIPS is connecting. The name might be misleading ( **$si** meaning the source ip if you read the docs) but in reality it is simply the socket other than the OpenSIPS socket. In order to match OpenSIPS interface (either the one that accepted the connection or the one that initiated a connection) **$socket\_in(ip)** (ip) and **$socket\_in(port)** (port) can be used.

**WARNING:** IF [trace\_on](#param_trace_on "1.3.8.�trace_on (int)") is set to 0 or tracing is deactived via the mi command [wss\_trace](#mi_wss_trace "1.4.1.� wss_trace") this route won't be called.

_Default value is none(no route is set)._

**Example�1.9.�Set `trace_filter_route` parameter**

...
modparam("proto\_wss", "trace\_filter\_route", "wss\_filter")
...
/\* all wss connections will go through this route if tracing is activated
 \* and a trace destination is defined \*/
route\[wss\_filter\] {
	...
	/\* all connections opened from/by ip 1.1.1.1:8000 will be traced
	   on interface 1.1.1.10:5060(opensips listener)
	   all the other connections won't be \*/
	 if ( $si == "1.1.1.1" && $sp == 8000 &&
		$socket\_in(ip) == "1.1.1.10"  && $socket\_in(port) == 5060)
		exit;
	else
		drop;
}
...

  

### 1.3.10.�`wss_tls_handshake_timeout` (integer)

Sets the timeout (in milliseconds) for the SSL handshake sequence to complete. It may be necessary to increase this value when using a CPU intensive cipher for the connection to allow time for keys to be generated and processed.

The timeout is invoked during acceptance of a new connection (inbound) and during the wait period when a new session is being initiated (outbound).

_Default value is 100._

**Example�1.10.�Set `wss_tls_handshake_timeout` variable**

param("proto\_wss", "wss\_tls\_handshake\_timeout", 200) # number of milliseconds

			

  

### 1.3.11.�`wss_send_timeout` (integer)

Sets the timeout (in milliseconds) for the send operations to complete

The send timeout is invoked for all TLS write operations, excluding the handshake process (see: wss\_tls\_handshake\_timeout)

_Default value is 100._

**Example�1.11.�Set `wss_send_timeout` variable**

modparam("proto\_wss", "wss\_send\_timeout", 200) # number of milliseconds

			

  

### 1.3.12.�`require_origin` (int)

Controls whether the module should require the Origin header or not.

_Default value is 1(require Origin header)._

**Example�1.12.�Set `require_origin` parameter**

modparam("proto\_wss", "require\_origin", no)

		

  

## 1.4.�Exported MI Functions

### 1.4.1.� `wss_trace`

Name: _wss\_trace_

Parameters:

*   trace\_mode(optional): set wss tracing on and off. This parameter can be missing and the command will show the current tracing status for this module( on or off ); Possible values:
    
    *   on
        
    *   off
        
    

MI FIFO Command Format:

			opensips-cli -x mi wss\_trace on
			

## Chapter�2.�Frequently Asked Questions

**2.1.**

Does OpenSIPS support fragmented Secure WebSocket messages?

No, the WebSocket fragmentation mechanism is not supported.

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

34

24

786

126

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

19

15

243

27

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

17

13

131

113

4.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

15

10

362

19

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

11

9

50

59

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

17

33

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

3

1

3

5

8.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

3

1

2

2

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2016 - Feb 2026

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jan 2016 - Jul 2025

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2017 - Nov 2023

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2016 - May 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Oct 2021

6.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

May 2021 - May 2021

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Jan 2020 - Jan 2020

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Mar 2017 - Apr 2017

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)