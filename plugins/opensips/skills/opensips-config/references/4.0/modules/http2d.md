# http2d Module Reference
<!-- generated-from: data/4.0/modules/http2d.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 http2d module. Read this file when configuring or debugging the http2d module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides an RFC 7540/9113 HTTP/2 server implementation with "h2" ALPN support, based on the **nghttp2** library ([https://nghttp2.org/](https://nghttp2.org/)).

## How It Works

HTTP/2, introduced in 2015, is a binary protocol with added transactional layers (SESSION, FRAME), which allow identifying and managing multiple, concurrent transfers over the same TCP/TLS connection. Thus, the revised protocol primarily aims to reduce resource usage for both clients and servers, by reducing the amount of TCP and/or TLS handshakes performed when loading a given web page.

The OpenSIPS **http2d** server includes support for both "h2" (TLS secured) and "h2c" (cleartext) HTTP/2 connections. The requests arrive at _opensips.cfg_ level using the [E_HTTP2_REQUEST](#event_http2_request "1.5.1. E_HTTP2_REQUEST") event, where script writers may process the data and respond accordingly.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libcrypto` — TLS support
- `libevent` — server framework
- `libevent_openssl` — server framework
- `libnghttp2` — provides the HTTP/2 server
- `libssl` — TLS support

## Exported Parameters

### `ip` (string)

The listening IPv4 address.

*Default value is 127.0.0.1.*

**Example.** 127.0.0.2.

```opensips
modparam("http2d", "ip", "127.0.0.2")
```
### `max_headers_size` (integer)

The maximum amount of bytes allowed for all header field names and values combined in a single HTTP/2 request processed by the server. Once this threshold is reached, extra headers will no longer be provided at script level and will be reported as errors instead.

*Default value is 8192.*

**Example.** 16384.

```opensips
modparam("http2d", "max_headers_size", 16384)
```
### `port` (integer)

The listening port.

*Default value is 443.*

**Example.** 5000.

```opensips
modparam("http2d", "port", 5000)
```
### `response_timeout` (integer)

The maximum amount of time, in milliseconds, that the library will allow the opensips.cfg processing to take for a given HTTP/2 request. Once this timeout is reached, the module will auto-generate a 408 (request timeout) reply.

*Default value is 2000.*

**Example.** 5000.

```opensips
modparam("http2d", "response_timeout", 5000)
```
### `tls_cert_key` (string)

File path to the TLS private key, in PEM format.

*Default value is NULL (not set).*

**Example.** /etc/pki/http2/private/key.pem.

```opensips
modparam("http2d", "tls_cert_key", "/etc/pki/http2/private/key.pem")
```
### `tls_cert_path` (string)

File path to the TLS certificate, in PEM format.

*Default value is NULL (not set).*

**Example.** /etc/pki/http2/cert.pem.

```opensips
modparam("http2d", "tls_cert_path", "/etc/pki/http2/cert.pem")
```

## Exported Functions

### `http2_send_response(code, [headers_json], [data])`

Sends a response for the HTTP/2 request being processed. The _":status"_ header field will be automatically included by the module as 1st header, so it must not be included in the _headers_json_ array.

**Parameters:**

- `code` *(integer, required)* — The HTTP/2 reply code
- `data` *(string, optional)* — Optional DATA payload to include in the response message.
- `headers_json` *(string, optional)* — Optional JSON Array containing {"header": "value"} elements, denoting HTTP/2 headers and their values to be included in the response message.

**Return codes:**

- `1` — Success
- `-1` — Internal Error

**Usable from:** EVENT_ROUTE

**Example.** http2_send_response() usage.

```opensips
event_route [E_HTTP2_REQUEST] {
  xlog(":: Method:  $param(method)\\n");
  xlog(":: Path:    $param(path)\\n");
  xlog(":: Headers: $param(headers)\\n");
  xlog(":: Data:    $param(data)\\n");

  $json(hdrs) := $param(headers);
  xlog("content-type: $json(hdrs/content-type)\\n");

  $var(rpl_headers) = "\[
	{ \"content-type\": \"application/json\" },
	{ \"server\": \"OpenSIPS 3.5\" },
	{ \"x-current-time\": \"1711457142\" },
	{ \"x-call-cost\": \"0.355\" }
  \]";

  $var(data) = "{\"status\": \"success\"}";

  if (!http2_send_response(200, $var(rpl_headers), $var(data)))
    xlog("ERROR - failed to send HTTP/2 response\\n");
}
```

## Exported Events

### `E_HTTP2_REQUEST`

This event is raised whenever the _http2d_ module is loaded and OpenSIPS receives an HTTP/2 request on the configured listening interface(s).

**Parameters:**

- `method` *(string)* — value of the ":method" HTTP/2 header
- `path` *(string)* — value of the ":path" HTTP/2 header
- `headers` *(string)* — JSON Array with all headers of the request, including pseudo-headers
- `data` *(string)* — If the request included a payload, this parameter will hold its contents

**Subscribe via:** event_route

## Configuration Examples

### Setting the `ip` parameter

Setting the `ip` parameter

```opensips
modparam("http2d", "ip", "127.0.0.2")
```
### Setting the `port` parameter

Setting the `port` parameter

```opensips
modparam("http2d", "port", 5000)
```
### Setting the `tls_cert_path` parameter

Setting the `tls_cert_path` parameter

```opensips
modparam("http2d", "tls_cert_path", "/etc/pki/http2/cert.pem")
```
### Setting the `tls_cert_key` parameter

Setting the `tls_cert_key` parameter

```opensips
modparam("http2d", "tls_cert_key", "/etc/pki/http2/private/key.pem")
```
### Setting the `max_headers_size` parameter

Setting the `max_headers_size` parameter

```opensips
modparam("http2d", "max_headers_size", 16384)
```
### Setting the `response_timeout` parameter

Setting the `response_timeout` parameter

```opensips
modparam("http2d", "response_timeout", 5000)
```
### `http2_send_response()` usage

`http2_send_response()` usage

```opensips
event_route [E_HTTP2_REQUEST] {
  xlog(":: Method:  $param(method)\n");
  xlog(":: Path:    $param(path)\n");
  xlog(":: Headers: $param(headers)\n");
  xlog(":: Data:    $param(data)\n");

  $json(hdrs) := $param(headers);
  xlog("content-type: $json(hdrs/content-type)\n");

  $var(rpl_headers) = "[
	{ \"content-type\": \"application/json\" },
	{ \"server\": \"OpenSIPS 3.5\" },
	{ \"x-current-time\": \"1711457142\" },
	{ \"x-call-cost\": \"0.355\" }
  ]";

  $var(data) = "{\"status\": \"success\"}";

  if (!http2_send_response(200, $var(rpl_headers), $var(data)))
    xlog("ERROR - failed to send HTTP/2 response\n");
}
```
