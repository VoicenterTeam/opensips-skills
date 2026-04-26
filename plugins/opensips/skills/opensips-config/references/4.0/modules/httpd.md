# httpd Module Reference
<!-- generated-from: data/4.0/modules/httpd.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 httpd module. Read this file when configuring or debugging the httpd module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides an HTTP transport layer for OpenSIPS.

Implementation of httpd module's http server is based on libmicrohttpd library.

TLS for the http server is enabled by setting the `tls_cert_file` and `tls_key_file` parameters. If this is enabled, support for plain http is disabled.

## How It Works

Due to the fact that OpenSIPS is a multiprocess application, the microhttpd library is used in "external select" mode. This ensures that the library is not running in multithread mode and the library is entirely controled by OpenSIPS. Due to this particular mode of operations, for now, the entire http response is built in a pre-allocated buffer (see buf_size parameter).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libmicrohttpd` — Implementation of httpd module's http server is based on libmicrohttpd library. Must be installed with EPOLL support, typically a version newer than 0.9.50.

## Exported Parameters

### `auth_password` (string)

The password for HTTP Basic Authentication. Must be set together with `auth_username`.

**Notes:** When using HTTP Basic Authentication, it is strongly recommended to also enable TLS via `tls_cert_file` and `tls_key_file` to prevent credentials from being transmitted in plaintext.

**Example.** secretpass.

```opensips
modparam("httpd", "auth_password", "secretpass")
```
### `auth_realm` (string)

The realm string to be used for HTTP Basic Authentication challenges. Only takes effect when both `auth_username` and `auth_password` are set.

*Default value is OpenSIPS MI.*

**Example.** OpenSIPS Management.

```opensips
modparam("httpd", "auth_realm", "OpenSIPS Management")
```
### `auth_username` (string)

The username for HTTP Basic Authentication. When set together with `auth_password`, all HTTP requests must present valid credentials. Requests without credentials or with incorrect credentials receive a 401 Unauthorized response.

**Example.** admin.

```opensips
modparam("httpd", "auth_username", "admin")
```
### `buf_size` (integer)

It specifies the maximum length (in bytes) of the buffer used to write in the html response.

*Default value is 0.*

**Notes:** If the size of the buffer is set to zero, it will be automatically set to a quarter of the size of the pkg memory.

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

*Default value is 127.0.0.1.*

**Possible values:**

- *

**Notes:** The default value is "127.0.0.1" (binds to loopback only). Use "*" to bind to all IPv6 and IPv4 interfaces.

**Example.** 127.0.0.1.

```opensips
modparam("httpd", "ip", "127.0.0.1")
```
### `port` (integer)

The port number used by the HTTP server to listen for incoming requests.

*Default value is 8888.*

*Valid range: 1024 or above.*

**Notes:** Ports lower than 1024 are not accepted.

**Example.** 8000.

```opensips
modparam("httpd", "port", 8000)
```
### `post_buf_size` (integer)

It specifies the length (in bytes) of the POST HTTP requests processing buffer. For large POST request, the default value might require to be increased.

*Default value is 1024.*

*Valid range: 256 or above.*

**Notes:** The minumal value is 256.

**Example.** 4096.

```opensips
modparam("httpd", "post_buf_size", 4096)
```
### `receive_buf_size` (integer)

It specifies the maximum length (in bytes) of the received HTTP requests. For receiving large POST request, the default value might require to be increased.

*Default value is 1024.*

**Example.** 4096.

```opensips
modparam("httpd", "receive_buf_size", 4096)
```
### `tls_cert_file` (string)

Public certificate file for httpd. It will be used as server-side certificate for incoming TLS connections.

**Example.** /etc/opensips/tls/server.pem.

```opensips
modparam("httpd", "tls_cert_file", "/etc/opensips/tls/server.pem")
```
### `tls_ciphers` (string)

You can specify the list of algorithms for authentication and encryption that you allow. To obtain a list of ciphers and then choose, use the gnutls-cli application:

*   gnutls-cli -l

### Warning

Do not use the NULL algorithms (no encryption) ... never!!!

*Default value is SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2.*

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

### `httpd:list_root_path`

Replaces obsolete MI command: _httpd_list_root_path_.

Lists all the registered http root paths into the httpd module. When a request comes in, if the root parth is in the list, the request will be sent to the module that register it.

**Example.** MI FIFO Command Format

```opensips
opensips-cli -x mi httpd:list_root_path
```

## Configuration Examples

### Set `ip` parameter

The IP address used by the HTTP server to listen for incoming requests.

```opensips
...
modparam("httpd", "ip", "127.0.0.1")
...
```
### Set `port` parameter

The port number used by the HTTP server to listen for incoming requests.

```opensips
...
modparam("httpd", "port", 8000)
...
```
### Set `conn_timeout` parameter

Auto-close TCP connections which are idle for more than the designated timeout, in seconds.

```opensips
...
modparam("httpd", "conn_timeout", 10)
...
```
### Set `buf_size` parameter

It specifies the maximum length (in bytes) of the buffer used to write in the html response.

```opensips
...
modparam("httpd", "buf_size", 524288)
...
```
### Set `post_buf_size` parameter

It specifies the length (in bytes) of the POST HTTP requests processing buffer.

```opensips
...
modparam("httpd", "post_buf_size", 4096)
...
```
### Set `receive_buf_size` parameter

It specifies the maximum length (in bytes) of the received HTTP requests.

```opensips
...
modparam("httpd", "receive_buf_size", 4096)
...
```
### Set `tls_cert_file` parameter

Public certificate file for httpd. It will be used as server-side certificate for incoming TLS connections.

```opensips
...
modparam("httpd", "tls_cert_file", "/etc/opensips/tls/server.pem")
...
```
### Set `tls_key_file` parameter

Private key of the above certificate. I must be kept in a safe place with tight permissions!

```opensips
...
modparam("httpd", "tls_key_file", "/etc/opensips/tls/server.key")
...
```
### Set `tls_key_file` parameter

You can specify the list of algorithms for authentication and encryption that you allow.

```opensips
...
modparam("httpd", "tls_ciphers", "SECURE256:+SECURE192:-VERS-ALL:+VERS-TLS1.2")
...
```
### Set `auth_realm` parameter

The realm string to be used for HTTP Basic Authentication challenges.

```opensips
...
modparam("httpd", "auth_realm", "OpenSIPS Management")
...
```
### Set `auth_username` parameter

The username for HTTP Basic Authentication.

```opensips
...
modparam("httpd", "auth_username", "admin")
...
```
### Set `auth_password` parameter

The password for HTTP Basic Authentication.

```opensips
...
modparam("httpd", "auth_password", "secretpass")
...
```
