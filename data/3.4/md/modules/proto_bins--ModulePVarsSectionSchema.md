# proto\_bins Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5664032)

2.2. [Most recently active contributors(1) to this module](#idp5740912)

**List of Examples**

1.1. [Set `bins_port` parameter](#idp162272)

1.2. [Set `bins_handshake_timeout` variable](#idp167632)

1.3. [Set `bins_send_timeout` parameter](#idp172928)

1.4. [Set `bins_max_msg_chunks` parameter](#idp5568704)

1.5. [Set `bins_async` parameter](#idp5573472)

1.6. [Set `bins_async_max_postponed_chunks` parameter](#idp5578160)

1.7. [Set `bins_async_local_connect_timeout` parameter](#idp5582960)

1.8. [Set `bins_async_handshake_timeout` parameter](#idp5588160)

1.9. [Set `trace_destination` parameter](#idp5595504)

1.10. [Set `trace_on` parameter](#idp5613200)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements a secure Binary communication protocol over TLS, to be used by the OpenSIPS clustering engine provided by the clusterer module.

Once loaded, you will be able to define BINS listeners in your configuration file by adding their IP and, optionally, a listening port, similar to this example:

...
socket= bins:127.0.0.1 		# change the listening IP
socket= bins:127.0.0.1:5557	# change the listening IP and port
...

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _tls\_openssl_ or _tls\_wolfssl_, depending on the desired TLS library
    
*   _tls\_mgm_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`bins_port` (integer)

The default port to be used by all BINS listeners.

_Default value is 5556._

**Example�1.1.�Set `bins_port` parameter**

...
modparam("proto\_bins", "bins\_port", 5557)
...

  

### 1.3.2.�`bins_handshake_timeout` (integer)

Sets the timeout (in milliseconds) for the SSL/TLS handshake sequence to complete. It may be necessary to increase this value when using a CPU intensive cipher for the connection to allow time for keys to be generated and processed.

The timeout is invoked during acceptance of a new connection (inbound) and during the wait period when a new session is being initiated (outbound).

_Default value is 100._

**Example�1.2.�Set `bins_handshake_timeout` variable**

param("proto\_tls", "bins\_handshake\_timeout", 200) # number of milliseconds

			

  

### 1.3.3.�`bins_send_timeout` (integer)

Sets the timeout (in milliseconds) for blocking send operations to complete.

The send timeout is invoked for all TLS write operations, excluding the handshake process (see: bins\_handshake\_timeout)

_Default value is 100 ms._

**Example�1.3.�Set `bins_send_timeout` parameter**

...
modparam("proto\_bins", "bins\_send\_timeout", 200)
...

  

### 1.3.4.�`bins_max_msg_chunks` (integer)

The maximum number of chunks in which a BINS message is expected to arrive via TCP. If a received packet is more fragmented than this, the connection is dropped (either the connection is very overloaded and this leads to high fragmentation - or we are the victim of an ongoing attack where the attacker is sending very fragmented traffic in order to decrease server performance).

_Default value is 32._

**Example�1.4.�Set `bins_max_msg_chunks` parameter**

...
modparam("proto\_bins", "bins\_max\_msg\_chunks", 8)
...

  

### 1.3.5.�`bins_async` (integer)

Specifies whether the TCP/TLS connect and write operations should be done in an asynchronous mode (non-blocking connect and write) or not. If disabled, OpenSIPS will block and wait for TCP/TLS operations like connect and write.

_Default value is 1 (enabled)._

**Example�1.5.�Set `bins_async` parameter**

...
modparam("proto\_bins", "bins\_async", 0)
...

  

### 1.3.6.�`bins_async_max_postponed_chunks` (integer)

If bins\_async is enabled, this specifies the maximum number of BINS messages that can be stashed for later/async writing. If the connection pending writes exceed this number, the connection will be marked as broken and dropped.

_Default value is 32._

**Example�1.6.�Set `bins_async_max_postponed_chunks` parameter**

...
modparam("proto\_bins", "bins\_async\_max\_postponed\_chunks", 16)
...

  

### 1.3.7.�`bins_async_local_connect_timeout` (integer)

If bin\_async is enabled, this specifies the number of milliseconds that a connect will be tried in blocking mode (optimization). If the connect operation lasts more than this, the connect will go to async mode and will be passed to TCP MAIN for polling.

_Default value is 100 ms._

**Example�1.7.�Set `bins_async_local_connect_timeout` parameter**

...
modparam("proto\_bins", "bins\_async\_local\_connect\_timeout", 200)
...

  

### 1.3.8.�`bins_async_handshake_timeout` (integer)

If _tls\_async_ is enabled, this specifies the number of milliseconds that a TLS handshake should be tried in blocking mode (optimization). If the handshake operation lasts more than this, the write will go to async mode and will be passed to tls MAIN for polling.

_Default value is 10 ms._

**Example�1.8.�Set `bins_async_handshake_timeout` parameter**

	...
	modparam("proto\_tls", "bins\_async\_handshake\_timeout", 100)
	...
	

  

### 1.3.9.�`trace_destination` (string)

Trace destination as defined in the tracing module. Currently the only tracing module is **proto\_hep**. Network events such as connect, accept and connection closed events shall be traced along with errors that could appear in the process. For each connection that is created an event containing information about the client and server certificates, master key and network layer information shall be sent.

**WARNING:** A tracing module must be loaded in order for this parameter to work. (for example **proto\_hep**).

_Default value is none(not defined)._

**Example�1.9.�Set `trace_destination` parameter**

...
modparam("proto\_hep", "hep\_id", "\[hep\_dest\]10.0.0.2;transport=tcp;version=3")

modparam("proto\_bins", "trace\_destination", "hep\_dest")
...

  

### 1.3.10.�`trace_on` (int)

This controls whether tracing for tls is on or not. You still need to define [trace\_destination](#param_trace_destination "1.3.9.�trace_destination (string)")in order to work, but this value will be controlled using mi function [bins\_trace](#mi_bins_trace "1.4.1.� bins_trace").

_Default value is 0(tracing inactive)._

**Example�1.10.�Set `trace_on` parameter**

...
modparam("proto\_bins", "trace\_on", 1)
...

  

## 1.4.�Exported MI Functions

### 1.4.1.� `bins_trace`

Name: _bins\_trace_

Parameters:

*   trace\_mode(optional): set bins tracing on and off. This parameter can be missing and the command will show the current tracing status for this module( on or off ); Possible values:
    
    *   on
        
    *   off
        
    

MI FIFO Command Format:

			opensips-cli -x mi bins\_trace on
			

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

15

4

1118

24

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

5

3

13

7

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

4

2

5

3

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

4

5

5.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

3

1

2

2

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2021 - May 2023

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Apr 2022 - Apr 2022

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Feb 2021 - Oct 2021

5.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

May 2021 - May 2021

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)).

_Documentation Copyrights:_

Copyright � 2015 [www.opensips-solutions.com](http://www.opensips-solutions.com/)