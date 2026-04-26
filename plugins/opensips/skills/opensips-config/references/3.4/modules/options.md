# options Module Reference
<!-- generated-from: data/3.4/modules/options.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 options module. Read this file when configuring or debugging the options module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides a function to answer OPTIONS requests which are directed to the server itself. This means an OPTIONS request which has the address of the server in the request URI, and no username in the URI. The request will be answered with a 200 OK which the capabilities of the server.

To answer OPTIONS request directed to your server is the easiest way for is-alive-tests on the SIP (application) layer from remote (similar to ICMP echo requests, also known as “ping”, on the network layer).

## Dependencies

### OpenSIPs Modules

- `signaling` — Stateless replies.
- `sl` — Stateless replies.

### External Libraries

None.

## Exported Parameters

### `accept` (string)

This parameter is the content of the Accept header field. If “”, the header is not added in the reply.

*Default value is */*.*

**Notes:** it is not clearly written in RFC3261 if a proxy should accept any content (the default “*/*”) because it does not care about content. Or if it does not accept any content, which is “”.

**Example.** application/*.

```opensips
modparam("options", "accept", "application/*")
```
### `accept_encoding` (string)

This parameter is the content of the Accept-Encoding header field. If “”, the header is not added in the reply.

**Notes:** Please do not change the default value because OpenSIPS does not support any encodings yet.

**Example.** gzip.

```opensips
modparam("options", "accept_encoding", "gzip")
```
### `accept_language` (string)

This parameter is the content of the Accept-Language header field. If “”, the header is not added in the reply. You can set any language code which you prefer for error descriptions from other devices, but presumably there are not much devices around which support other languages then the default English.

*Default value is en.*

**Example.** de.

```opensips
modparam("options", "accept_language", "de")
```
### `support` (string)

This parameter is the content of the Support header field. If “”, the header is not added in the reply.

**Notes:** Please do not change the default value, because OpenSIPS currently does not support any of the SIP extensions registered at the IANA.

**Example.** 100rel.

```opensips
modparam("options", "support", "100rel")
```

## Exported Functions

### `options_reply()`

This function checks if the request method is OPTIONS and if the request URI does not contain an username. If both is true the request will be answered stateless with “200 OK” and the capabilities from the modules parameters.

It sends “500 Server Internal Error” for some errors and returns false if it is called for a wrong request.

The check for the request method and the missing username is optional because it is also done by the function itself. But you should not call this function outside the myself check because in this case the function could answer OPTIONS requests which are sent to you as outbound proxy but with an other destination then your proxy (this check is currently missing in the function).

**Return codes:**

- `true` — Request is OPTIONS, URI has no username, and reply sent successfully
- `false` — Called for a wrong request or error occurred

**Usable from:** REQUEST_ROUTE

**Example.** options_reply usage.

```opensips
...
if (is_myself("$rd")) {
	if (is_method("OPTIONS") && (! $ru=~"sip:.*[@]+.*")) {
		options_reply();
	}
}
...
```

## Configuration Examples

### Set `accept` parameter

Set `accept` parameter

```opensips
...
modparam("options", "accept", "application/*")
...
```
### Set `accept_encoding` parameter

Set `accept_encoding` parameter

```opensips
...
modparam("options", "accept_encoding", "gzip")
...
```
### Set `accept_language` parameter

Set `accept_language` parameter

```opensips
...
modparam("options", "accept_language", "de")
...
```
### Set `support` parameter

Set `support` parameter

```opensips
...
modparam("options", "support", "100rel")
...
```
### `options_reply` usage

`options_reply` usage

```opensips
...
if (is_myself("$rd")) {
	if (is_method("OPTIONS") && (! $ru=~"sip:.*[@]+.*")) {
		options_reply();
	}
}
...
```
