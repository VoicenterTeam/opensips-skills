# proto\_hep Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6044048)

3.2. [Most recently active contributors(1) to this module](#idp6157584)

**List of Examples**

1.1. [Set `hep_id` parameter](#idp5877824)

1.2. [Set `homer5_on` parameter](#idp5884416)

1.3. [Set `homer5_on` parameter](#idp5889232)

1.4. [Set `hep_port` parameter](#idp5893664)

1.5. [Set `hep_send_timeout` parameter](#idp5898304)

1.6. [Set `hep_max_msg_chunks` parameter](#idp5903152)

1.7. [Set `hep_async` parameter](#idp5907840)

1.8. [Set `hep_async_max_postponed_chunks` parameter](#idp5912896)

1.9. [Set `hep_capture_id` parameter](#idp5917520)

1.10. [Set `hep_retry_cooldown` parameter](#idp5922192)

1.11. [Set `hep_max_retries` parameter](#idp5926880)

1.12. [Set `hep_async_local_connect_timeout` parameter](#idp5931968)

1.13. [Set `hep_async_local_write_timeout` parameter](#idp5937136)

1.14. [`correlate` usage](#idp5950112)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The **proto\_hep** module is a transport module which implements hepV1 and hepV2 UDP-based communication and hepV3 TCP-based communication. It also offers an API with which you can register callbacks which are called after the HEP header is parsed and also can pack sip messages to HEP messages.The unpacking part is done internally.

Once loaded, you will be able to define HEP listeners in your configuration file by adding their IP and, optionally, a listening port. You can define both TCP, UDP, and TLS listeners. On UDP you will be able to receive HEP v1, v2 and v3 packets, on TCP and TLS only HEPv3.

...
#HEPv3 listener
socket= hep\_tcp:127.0.0.1:6061 		# change the listening IP
#HEPv1, v2, v3 listener
socket= hep\_udp:127.0.0.1:6061 		# change the listening IP
...

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tls\_mgm_ - optional, only if a TLS based HEP listener is defined in the script.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`hep_id` (str)

Specify a destination for HEP packets and the version of HEP protocol used. All parameters inside **hep\_id** must be separated by **;**. The parameters are given in key-value format, the possible keys being **uri**, **transport** and **version**, except destiantion's URI which doesn't have a key and is in **host:port** . **transport** key can be **TCP**, **UDP** or **TLS**. **TCP** and **TLS** works only for HEP version 3. **Version** is the hep protocol version and can be **1**, **2** or **3**.

HEPv1 and HEPv2 can use only UDP. HEPv3 can use TCP, UDP and TLS having the default set to TCP. If no hep version defined, the default is version 3 with TCP and TLS.

NO default value. If **hep\_id** the module can't be used for HEP tracing.

**Example�1.1.� Set `hep_id` parameter**

...
/\* define a destination to localhost on port 8001 using hepV3 on tcp \*/
modparam("proto\_hep", "hep\_id",
"\[hep\_dst\] 127.0.0.1:8001; transport=tcp; version=3")
/\* define a destination to 1.2.3.4 on port 5000 using hepV2; no transport(default UDP) \*/
modparam("proto\_hep", "hep\_id", "\[hep\_dst\] 1.2.3.4:5000; version=2")
/\* define only the destination uri; version will be 3(default) and transport TCP(default) \*/
modparam("proto\_hep", "hep\_id", "\[hep\_dst\] 1.2.3.4:5000")

  

### 1.3.2.�`homer5_on` (int)

Specify how the data should be encapsulated in the HEP packet. If set to _0_, then the JSON based HOMER 6 format will be used. Otherwise, if set to anything different than _0_, the plain text HOMER 5 format will be used for encapsulation. On the capturing node, this parameter affects the behavior of the _report\_capture_ function from the [sipcapture](sipcapture#func_report_capture) module.

Default value 1, HOMER5 format.

**Example�1.2.� Set `homer5_on` parameter**

modparam("proto\_hep", "homer5\_on", 0)

  

### 1.3.3.�`homer5_delim` (str)

In case **homer5\_on** is set (different than 0), with this parameter you will be able to set the delmiter between different payload parts.

Default value ":".

**Example�1.3.� Set `homer5_on` parameter**

modparam("proto\_hep", "homer5\_delim", "##")

  

### 1.3.4.�`hep_port` (integer)

The default port to be used by all TCP/UDP/TLS listeners.

_Default value is 5656._

**Example�1.4.�Set `hep_port` parameter**

...
modparam("proto\_hep", "hep\_port", 6666)
...

  

### 1.3.5.�`hep_send_timeout` (integer)

Time in milliseconds after a TCP connection will be closed if it is not available for blocking writing in this interval (and OpenSIPS wants to send something on it).

_Default value is 100 ms._

**Example�1.5.�Set `hep_send_timeout` parameter**

...
modparam("proto\_hep", "hep\_send\_timeout", 200)
...

  

### 1.3.6.�`hep_max_msg_chunks` (integer)

The maximum number of chunks in which a HEP message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 32._

**Example�1.6.�Set `hep_max_msg_chunks` parameter**

...
modparam("proto\_hep", "hep\_max\_msg\_chunks", 8)
...

  

### 1.3.7.�`hep_async` (integer)

Specifies whether the TCP connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP operations like connect and write.

_Default value is 1 (enabled)._

**Example�1.7.�Set `hep_async` parameter**

...
modparam("proto\_hep", "hep\_async", 0)
...

  

### 1.3.8.�`hep_async_max_postponed_chunks` (integer)

If _hep\_async_ is enabled, this specifies the maximum number of HEP messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

_Default value is 32._

**Example�1.8.�Set `hep_async_max_postponed_chunks` parameter**

...
modparam("proto\_hep", "hep\_async\_max\_postponed\_chunks", 16)
...

  

### 1.3.9.�`hep_capture_id` (integer)

The parameter indicate the capture agent ID for HEPv2/v3 protocol. Limitation: 16-bit integer.

_Default value is "1"._

**Example�1.9.�Set `hep_capture_id` parameter**

...
modparam("proto\_hep", "hep\_capture\_id", 234)
...

  

### 1.3.10.�`hep_retry_cooldown` (integer)

This parameter defines how many seconds OpenSIPS should wait before retrying a TCP connection to the HEP destination after reaching the maximum number of failed attempts set by hep\_max\_retries. Limitation: 16-bit integer.

_Default value is "3600"._

**Example�1.10.�Set `hep_retry_cooldown` parameter**

...
modparam("proto\_hep", "hep\_retry\_cooldown", 60)
...

  

### 1.3.11.�`hep_max_retries` (integer)

This parameter defines the maximum number of attempts OpenSIPS will make to establish a TCP connection with the HEP destination. Limitation: 16-bit integer.

_Default value is "5"._

**Example�1.11.�Set `hep_max_retries` parameter**

...
modparam("proto\_hep", "hep\_max\_retries", 10)
...

  

### 1.3.12.�`hep_async_local_connect_timeout` (integer)

If _hep\_async_ is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

_Default value is 100 ms._

**Example�1.12.�Set `hep_async_local_connect_timeout` parameter**

...
modparam("proto\_hep", "hep\_async\_local\_connect\_timeout", 200)
...

  

### 1.3.13.�`hep_async_local_write_timeout` (integer)

If _hep\_async_ is enabled, this specifies the number of milliseconds that a write op will be tried in blocking mode (optimization). If the write operation lasts more than this, the write will go to async mode and will be passed to bin MAIN for polling.

_Default value is 10 ms._

**Example�1.13.�Set `hep_async_local_write_timeout` parameter**

...
modparam("proto\_hep", "hep\_async\_local\_write\_timeout", 100)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `correlate(hep_id, type1, correlation1, type2, correlation2)`

Send a hep message with an extra correlation id containing the two correlation given as arguments. The two types must differ. This will help on the capturing side to correlate two calls for example, being given their callid as correlation ids.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE.

Meaning of the parameters is as follows:

*   _hep\_id (string)_ the name of the _hep\_id_ defined in modparam section, specifying where to do the tracing.
    
*   _type1 (string)_ the key name identify the first correlation id.
    
*   _correlation1 (string)_ the first extra correlation id that will be put in the extra correlation chunk.
    
*   _type2 (string)_ the key name identify the second correlation id.
    
*   _correlation2 (string)_ the second extra correlation id that will be put in the extra correlation chunk.
    

**Example�1.14.�`correlate` usage**

...
/\* see declaration of hep\_dst in trace\_id section \*/
/\* we suppose we have two correlations in two varibles: cor1 and cor2 \*/
	correlate("hep\_dst", "correlation-no-1",$var(cor1),"correlation-no-2", $var(cor2));
...

  

## Chapter�2.�Developer Guide

## 2.1.�Available Functions

### 2.1.1.� `pack_hep(from, to, proto, payload, plen, retbuf, retlen)`

The function packs connection details and sip message into HEP message. It's your job to free both the old and the new buffer.

Meaning of the parameters is as follows:

*   _sockaddr\_union \*from_ - sockaddr\_union describing sending socket
    
*   _sockaddr\_union \*to_ - sockaddr\_union describing receiving socket
    
*   _int proto_ - protocol used in hep header;
    
*   _char \*payload_ SIP payload buffer
    
*   _int plen_ SIP payload buffer length
    
*   _char \*\*retbuf_ HEP message buffer
    
*   _int \*retlen_ HEP message buffer length
    

### 2.1.2.� `register_hep_cb(cb)`

The function register callbacks to be called whenever a HEP message is received. The callbacks parameters are struct hep\_desc\*(see hep.h for details) a structure that holds all details about the hep header and the receive\_info\* structure. The callback can return HEP\_SCRIPT\_SKIP which stops the HEP message from being passed thrrough scripts.

Meaning of the parameters is as follows:

*   _hep\_cb\_t cb_ HEP callback
    

### 2.1.3.� `hep_version`

Current version of hep used.

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

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

151

66

8047

998

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

42

32

100

494

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

27

20

391

175

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

20

17

107

100

5.

Bence Szigeti

9

2

405

180

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

7

4

36

84

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

41

41

8.

rita7lopes

3

1

84

11

9.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

3

1

2

2

10.

Dan Pascu ([@danpascu](https://github.com/danpascu))

3

1

1

1

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)).

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

Nov 2015 - Jul 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2016 - May 2025

3.

rita7lopes

May 2025 - May 2025

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2017 - May 2024

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

6.

Bence Szigeti

Jul 2023 - Aug 2023

7.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

May 2021 - May 2021

8.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

May 2020 - May 2020

9.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

  

**All remaining contributors**: Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** rita7lopes, Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bence Szigeti, Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)