# compression Module Reference
<!-- generated-from: data/3.5/modules/compression.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 compression module. Read this file when configuring or debugging the compression module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements message compression/decompression and base64 encoding for sip messages using deflate and gzip algorithm/headers. Another feature of this module is reducing headers to compact for as specified in SIP RFC's, sdp body codec unnecessary description removal (for codecs 0-97), whitelist for headers not be removed (excepting necessary headers).

## How It Works

The module is using zlib library to implement compression and base64 encoding for converting the message to human readable characters. It also uses callbacks to do the compression/compaction of the message in order for this operations to be done after all the other script functions have been applied to the message.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `zlib-dev` — the development libraries of zlib

## Exported Parameters

### `mc_level` (integer)

This parameter ranges from 1 to 9 and it specifies the level of compression you want to do. Default is 6. 9 is the best, but the longest time consuming algorithm and 1 is the worst.

*Default value is 6.*

*Valid range: 1 to 9.*

**Notes:** If, by mistake, you set a lower or a higher level, the default, 6, will be used, but you will receive a warning.

**Example.** 3.

```opensips
modparam("mc", "mc_level", "3")
```

## Exported Functions

### `mc_compact([whitelist], flags)`

This function will realise four different things: headers which are not mandatory and are not in the whitelist will be removed, headers of same type will be merged together, separated by ',', header names which have a short form will be reduced to that short form (unless the _n_ flag has been set) and SDP rtpmap attribute headers which contain a value lower than 96 will be removed, because they are not mandatory. Lumps are not affected by this function, because it is applied after all messages changes are processed. done. The _mc_compact_ supported short forms are: “c” - Content-Type (RFC 3261), “f” - From (RFC 3261), “i” - Call-ID (RFC 3261), “k” - Supported (RFC 3261), “l” - Content-Length (RFC 3261), “m” - Contact (RFC 3261), “s” - Subject (RFC 3261), “t” - To (RFC 3261), “v” - Via (RFC 3261), “x” - Session-Expires (RFC 4028).

**Parameters:**

- `flags` *(string, required)* — Controls the behavior of the function.
  - `n`
- `whitelist` *(string, optional)* — Whitelist of headers not to be removed, except from the mandatory ones. The whitelist header names must pe separated by '|'.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, LOCAL_ROUTE, FAILURE_ROUTE

**Example.** mc_compress usage.

```opensips
if (!mc_compact("Max-Forwards|P-Asserted-Identity"))
	xlog("compaction failed\n");
```

### `mc_compress([algo], flags, [whitelist])`

This function will compress the current message as specified in the parameters. Keep in mind that the compression is done just before the message is sent, so that all your lumps can be applied.

**Parameters:**

- `algo` *(int, optional)* — The algorithm used for compression. Currently implemented are deflate ('0') and gzip ('1').
  - `0`
  - `1`
- `flags` *(string, required)* — Specifies on what to apply the compression and where to put the result of the compression.
  - `b`
  - `h`
  - `s`
  - `e`
- `whitelist` *(string, optional)* — header names list, separated by '|' which will specify which headers shall not be compressed, along with the mandatory ones, which can never be compressed. The mandatory headers are the following: VIA, FROM, TO, CSEQ, ROUTE, RECORD_ROUTE, CALLID. Also, CONTENT_TYPE is mandatory only if CONTENT-LENGTH > 0. Also, in case you do not want to use body compression, the Content-Length header will become a mandatory header, which can not be compressed. In case you do want body compression, the old Content-Length Header will be compressed, and a new content length will be calculated. When you will want to do decompression, the compressed length will be removed, and the content length header will be the same as the one before the compression.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, LOCAL_ROUTE, FAILURE_ROUTE

**Example.** mc_compress usage.

```opensips
if (!mc_compress(0, "bhs", "Max-Forwards|Subject|P-Asserted-Identity"))
	xlog("compression failed\n");
```

**Example.** mc_compress usage.

```opensips
$avp(algo) = 1;
$var(flags) = "bs";
$var(list) = "Max-Forwards | Contact";
mc_compres($avp(algo), $var(flags), $var(list);
xlog("compression registered\n");
```

### `mc_decompress()`

This function does the reverse of mc_compress, meaning that it does base64 decoding and gzip/deflate decompression. Keep in mind that gzip decompression is a little bit more efficient because it is being known the size of the compressed buffer as against deflate which does not hold the size of the buffer, so the decompression will be made in a static buffer. WARNING: This function replaces the original buffer of the message with the decompressed buffer, so any processing you do to the message will not be taken into consideration. Try applying the decompression function, before you do any other processing to the message.

**Return codes:**

- `1` — success
- `-1` — failure

**Usable from:** REQUEST_ROUTE, LOCAL_ROUTE, FAILURE_ROUTE

**Related:**

- `mc_compress`

**Example.** mc_decompress usage.

```opensips
if (!mc_decompress())
	xlog("decompression failed\n");
```

## Configuration Examples

### Set `mc_level` parameter

Sets the compression level parameter to 3.

```opensips
...
modparam("mc", "mc_level", "3")
...
```
### `mc_compress` usage

Compresses the message body and headers separately with a specific whitelist.

```opensips
...
if (!mc_compress(0, "bhs", "Max-Forwards|Subject|P-Asserted-Identity"))
	xlog("compression failed\n");
...
```
### `mc_compress` usage

Compresses the message using variables for the algorithm, flags, and whitelist.

```opensips
...
$avp(algo) = 1;
$var(flags) = "bs";
$var(list) = "Max-Forwards | Contact";
mc_compres($avp(algo), $var(flags), $var(list);
xlog("compression registered\n");
...
```
### `mc_compress` usage

Compacts the message headers using a specific whitelist.

```opensips
...
if (!mc_compact("Max-Forwards|P-Asserted-Identity"))
	xlog("compaction failed\n");
...
```
### `mc_decompress` usage

Decompresses the message.

```opensips
...
if (!mc_decompress())
	xlog("decompression failed\n");
...
```
