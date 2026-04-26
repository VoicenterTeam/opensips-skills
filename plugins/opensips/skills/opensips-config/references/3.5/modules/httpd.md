# httpd Module Reference
<!-- generated-from: data/3.5/modules/httpd.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 httpd module. Read this file when configuring or debugging the httpd module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides an HTTP transport layer for OpenSIPS.

## How It Works

Implementation of httpd module's http server is based on libmicrohttpd library.

TLS for the http server is enabled by setting the `tls_cert_file` and `tls_key_file` parameters. If this is enabled, support for plain http is disabled.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libmicrohttpd` — The following libraries or applications must be installed before running OpenSIPS with this module loaded: libmicrohttpd, with EPOLL support. This typically means a version newer than 0.9.50. WARNING! Please be aware about an EPOLL support regression in the libmicrohttpd library and packaging which affects the OpenSIPS httpd module, which was fixed according to the below timeline. The effect of the regression is that the HTTP reply body is sometimes never written by the library, causing the client (e.g. opensips-cli) to hang indefinitely waiting for it: versions 0.9.51 - 0.9.52 have been tested and work correctly; regression introduced in 0.9.53 (Apr 2017), lasting until 0.9.71 (May 2020); regression is fixed since 0.9.72 (Dec 2020).

## Exported Parameters

### `buf_size` (integer)

It specifies the maximum length (in bytes) of the buffer used to write in the html response. If the size of the buffer is set to zero, it will be automatically set to a quarter of the size of the pkg memory.

*Default value is 0.*

**Example.** 524288.

```opensips
modparam("httpd", "buf_size", 524288)
```
### `conn_timeout` (integer)

Auto-close TCP connections which are idle for more than the designated timeout, in seconds. Set to zero to never close any connections.

*Default value is 30.*

**Notes:** Note: the connection auto-close routine only seems to be executed in an "on-demand" fashion, during an HTTPD network event (e.g. on a new connection), which although not ideal, it should be good enough in practical terms.

**Example.** 10.

```opensips
modparam("httpd", "conn_timeout", 10)
```
### `ip` (string)

The IP address used by the HTTP server to listen for incoming requests.

*Default value is *.*

**Example.** 127.0.0.1.

```opensips
modparam("httpd", "ip", "127.0.0.1")
```
### `port` (integer)

The port number used by the HTTP server to listen for incoming requests.

*Default value is 8888.*

*Valid range: 1024 or above.*

**Example.** 8000.

```opensips
modparam("httpd", "port", 8000)
```
### `post_buf_size` (integer)

It specifies the length (in bytes) of the POST HTTP requests processing buffer. For large POST request, the default value might require to be increased.

*Default value is 1024.*

*Valid range: 256 or above.*

**Example.** 4096.

```opensips
modparam("httpd", "post_buf_size", 4096)
```
### `tls_cert_file` (string)

Public certificate file for httpd. It will be used as server-side certificate for incoming TLS connections.

**Example.** /etc/opensips/tls/server.pem.

```opensips
modparam("httpd", "tls_cert_file", "/etc/opensips/tls/server.pem")
```
### `tls_ciphers` (string)

You can specify the list of algorithms for authentication and encryption that you allow. To obtain a list of ciphers and then choose, use the gnutls-cli application: * gnutls-cli -l

*Default value is SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2.*

**Notes:** Do not use the NULL algorithms (no encryption) ... never!!!

**Example.** SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2.

```opensips
modparam("httpd", "tls_ciphers", "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2")
```
### `tls_key_file` (string)

Private key of the above certificate. I must be kept in a safe place with tight permissions!

**Example.** /etc/opensips/tls/server.key.

```opensips
modparam("httpd", "tls_key_file", "/etc/opensips/tls/server.key")
```

## Exported MI Functions

### `httpd_list_root_path`

Lists all the registered http root paths into the httpd module. When a request comes in, if the root parth is in the list, the request will be sent to the module that register it.

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi httpd_list_root_path
```

## Configuration Examples

### Set `ip` parameter

The IP address used by the HTTP server to listen for incoming requests.

The default value is "*" (bind to all IPv6 and IPv4 interfaces).

```opensips
...
modparam("httpd", "ip", "127.0.0.1")
...
```
### Set `port` parameter

The port number used by the HTTP server to listen for incoming requests.

The default value is 8888. Ports lower than 1024 are not accepted.

```opensips
...
modparam("httpd", "port", 8000)
...
```
### Set `conn_timeout` parameter

Auto-close TCP connections which are idle for more than the designated timeout, in seconds. Set to zero to never close any connections.

Note: the connection auto-close routine only seems to be executed in an "on-demand" fashion, during an HTTPD network event (e.g. on a new connection), which although not ideal, it should be good enough in practical terms.

The default timeout is 30 seconds.

```opensips
...
modparam("httpd", "conn_timeout", 10)
...
```
### Set `buf_size` parameter

It specifies the maximum length (in bytes) of the buffer used to write in the html response.

If the size of the buffer is set to zero, it will be automatically set to a quarter of the size of the pkg memory.

The default value is 0.

```opensips
...
modparam("httpd", "buf_size", 524288)
...
```
### Set `post_buf_size` parameter

It specifies the length (in bytes) of the POST HTTP requests processing buffer. For large POST request, the default value might require to be increased.

The default value is 1024. The minumal value is 256.

```opensips
...
modparam("httpd", "post_buf_size", 4096)
...
```
### Set `tls_cert_file` parameter

Public certificate file for httpd. It will be used as server-side certificate for incoming TLS connections.

The default value is ""

```opensips
...
modparam("httpd", "tls_cert_file", "/etc/opensips/tls/server.pem")
...
```
### Set `tls_key_file` parameter

Private key of the above certificate. I must be kept in a safe place with tight permissions!

The default value is ""

```opensips
...
modparam("httpd", "tls_key_file", "/etc/opensips/tls/server.key")
...
```
### Set `tls_key_file` parameter

You can specify the list of algorithms for authentication and encryption that you allow. To obtain a list of ciphers and then choose, use the gnutls-cli application:

*   gnutls-cli -l

Do not use the NULL algorithms (no encryption) ... never!!!

The default value is "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2"

```opensips
...
modparam("httpd", "tls_ciphers", "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2")
...
```
