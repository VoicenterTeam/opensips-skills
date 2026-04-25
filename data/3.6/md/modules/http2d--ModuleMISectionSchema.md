# HTTP2D MODULE

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5650384)

2.2. [Most recently active contributors(1) to this module](#idp5718368)

**List of Examples**

1.1. [Setting the `ip` parameter](#idp248016)

1.2. [Setting the `port` parameter](#idp5567664)

1.3. [Setting the `tls_cert_path` parameter](#idp5571968)

1.4. [Setting the `tls_cert_key` parameter](#idp5576272)

1.5. [Setting the `max_headers_size` parameter](#idp5580864)

1.6. [Setting the `response_timeout` parameter](#idp5585824)

1.7. [`http2_send_response()` usage](#idp5600720)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module provides an RFC 7540/9113 HTTP/2 server implementation with "h2" ALPN support, based on the **nghttp2** library ([https://nghttp2.org/](https://nghttp2.org/)).

HTTP/2, introduced in 2015, is a binary protocol with added transactional layers (SESSION, FRAME), which allow identifying and managing multiple, concurrent transfers over the same TCP/TLS connection. Thus, the revised protocol primarily aims to reduce resource usage for both clients and servers, by reducing the amount of TCP and/or TLS handshakes performed when loading a given web page.

The OpenSIPS **http2d** server includes support for both "h2" (TLS secured) and "h2c" (cleartext) HTTP/2 connections. The requests arrive at _opensips.cfg_ level using the [E\_HTTP2\_REQUEST](#event_http2_request "1.5.1.� E_HTTP2_REQUEST") event, where script writers may process the data and respond accordingly.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

None.

### 1.2.2.�External Libraries or Applications

The HTTP/2 server is provided by the **nghttp2** library, which runs on top of the **libevent** server framework.

Overall, the following libraries must be installed before running OpenSIPS with this module loaded:

*   _libnghttp2_
    
*   _libevent_, _libevent\_openssl_
    
*   _libssl_, _libcrypto_
    

## 1.3.�Exported Parameters

### 1.3.1.�`ip (string)`

The listening IPv4 address.

Default value is _"127.0.0.1"_.

**Example�1.1.�Setting the `ip` parameter**

modparam("http2d", "ip", "127.0.0.2")

  

### 1.3.2.�`port (integer)`

The listening port.

Default value is _443_.

**Example�1.2.�Setting the `port` parameter**

modparam("http2d", "port", 5000)

  

### 1.3.3.�`tls_cert_path (string)`

File path to the TLS certificate, in PEM format.

Default value is _NULL_ (not set).

**Example�1.3.�Setting the `tls_cert_path` parameter**

modparam("http2d", "tls\_cert\_path", "/etc/pki/http2/cert.pem")

  

### 1.3.4.�`tls_cert_key (string)`

File path to the TLS private key, in PEM format.

Default value is _NULL_ (not set).

**Example�1.4.�Setting the `tls_cert_key` parameter**

modparam("http2d", "tls\_cert\_key", "/etc/pki/http2/private/key.pem")

  

### 1.3.5.�`max_headers_size (integer)`

The maximum amount of bytes allowed for all header field names and values combined in a single HTTP/2 request processed by the server. Once this threshold is reached, extra headers will no longer be provided at script level and will be reported as errors instead.

Default value is _8192_ bytes.

**Example�1.5.�Setting the `max_headers_size` parameter**

modparam("http2d", "max\_headers\_size", 16384)

  

### 1.3.6.�`response_timeout (integer)`

The maximum amount of time, in milliseconds, that the library will allow the opensips.cfg processing to take for a given HTTP/2 request.

Once this timeout is reached, the module will auto-generate a 408 (request timeout) reply.

Default value is _2000_ ms.

**Example�1.6.�Setting the `response_timeout` parameter**

modparam("http2d", "response\_timeout", 5000)

  

## 1.4.�Exported Functions

### 1.4.1.� `http2_send_response(code, [headers_json], [data])`

Sends a response for the HTTP/2 request being processed. The _":status"_ header field will be automatically included by the module as 1st header, so it must not be included in the _headers\_json_ array.

_Parameters_

*   _code_ (integer) - The HTTP/2 reply code
    
*   _headers\_json_ (string, default: _NULL_) - Optional JSON Array containing {"header": "value"} elements, denoting HTTP/2 headers and their values to be included in the response message.
    
*   _data_ (string, default: _NULL_) - Optional DATA payload to include in the response message.
    

_Return Codes_

*   **1** - Success
    
*   **\-1** - Internal Error
    

This function can only be used from an _EVENT\_ROUTE_.

**Example�1.7.�`http2_send_response()` usage**

event\_route \[E\_HTTP2\_REQUEST\] {
  xlog(":: Method:  $param(method)\\n");
  xlog(":: Path:    $param(path)\\n");
  xlog(":: Headers: $param(headers)\\n");
  xlog(":: Data:    $param(data)\\n");

  $json(hdrs) := $param(headers);
  xlog("content-type: $json(hdrs/content-type)\\n");

  $var(rpl\_headers) = "\[
	{ \\"content-type\\": \\"application/json\\" },
	{ \\"server\\": \\"OpenSIPS 3.5\\" },
	{ \\"x-current-time\\": \\"1711457142\\" },
	{ \\"x-call-cost\\": \\"0.355\\" }
  \]";

  $var(data) = "{\\"status\\": \\"success\\"}";

  if (!http2\_send\_response(200, $var(rpl\_headers), $var(data)))
    xlog("ERROR - failed to send HTTP/2 response\\n");
}

  

## 1.5.�Exported Events

### 1.5.1.� `E_HTTP2_REQUEST`

This event is raised whenever the _http2d_ module is loaded and OpenSIPS receives an HTTP/2 request on the configured listening interface(s).

Parameters:

*   _method (string)_ - value of the ":method" HTTP/2 header
    
*   _path (string)_ - value of the ":path" HTTP/2 header
    
*   _headers (string)_ - JSON Array with all headers of the request, including pseudo-headers
    
*   _data (string, default: NULL)_ - If the request included a payload, this parameter will hold its contents
    

Note that this event is currently designed to be mainly consumed by an _event\_route_, since that is the only way to gain access to the [http2\_send\_response()](#func_http2_send_response "1.4.1.� http2_send_response(code, [headers_json], [data])") function in order to build custom response messages. On the other hand, if the application does not mind the answer being always a 200 with no payload, this event can be successfully consumed through any other EVI-compatible delivery channel ☺️

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

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

30

8

2085

215

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

4

2

56

4

3.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2024 - Aug 2025

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jul 2025 - Jul 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2024 - May 2024

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2024 [www.opensips-solutions.com](http://www.opensips-solutions.com/)