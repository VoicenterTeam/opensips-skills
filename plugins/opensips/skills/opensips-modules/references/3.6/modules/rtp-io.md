# rtp.io Module Reference
<!-- generated-from: data/3.6/modules/rtp-io.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 rtp.io module. Read this file when configuring or debugging the rtp.io module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The RTP.io module provides an integrated solution for handling RTP traffic within OpenSIPS, enabling RTP relaying and processing directly inside the OpenSIPS process. This eliminates the need for external processes such as RTPProxy, resulting in a more streamlined, efficient, and manageable system for certain use cases.

The _rtp.io_ module starts RTP handling threads in the main OpenSIPS process and allows the _rtpproxy_ module to access these threads via a one-to-one socket pair. This tight integration facilitates efficient RTP traffic management within OpenSIPS without relying on external RTP handling services.

The module requires RTPProxy™ version 3.1 or higher, compiled with the `--enable-librtpproxy` option to build. It utilizes the `librtpproxy` library to manage RTP traffic and interfaces with the existing _rtpproxy_ module to generate commands, parse responses, and process SIP messages.

When the _rtpproxy_ module is loaded without arguments and the _rtp.io_ module is also loaded, the sockets exported by _rtp.io_ are used automatically in set `0`. Alternatively, these sockets can be incorporated into other sets by using the `"rtp.io:auto"` moniker.

## How It Works

The _rtp.io_ module starts RTP handling threads in the main OpenSIPS process and allows the _rtpproxy_ module to access these threads via a one-to-one socket pair. This tight integration facilitates efficient RTP traffic management within OpenSIPS without relying on external RTP handling services.

## Dependencies

### OpenSIPs Modules

- `rtpproxy` — Interfaces with the existing rtpproxy module to generate commands, parse responses, and process SIP messages

### External Libraries

- `RTPProxy` — Version 3.1 or higher, compiled with the --enable-librtpproxy option to build
- `librtpproxy` — Utilized to manage RTP traffic

## Exported Parameters

### `rtpproxy_args` (string)

Command-line parameteres passed down to the embedded RTPProxy module upon initialization. Refer to the RTPProxy documentation for the full list.

**Example.** -m 12000 -M 15000 -l 0.0.0.0 -6 /::.

```opensips
modparam("rtp.io", "rtpproxy\_args", "-m 12000 -M 15000 -l 0.0.0.0 -6 /::")
```

## Configuration Examples

### Set rtpproxy_args parameter

Command-line parameteres passed down to the embedded RTPProxy module upon initialization. Refer to the RTPProxy documentation for the full list.

```opensips
...
modparam("rtp.io", "rtpproxy_args", "-m 12000 -M 15000 -l 0.0.0.0 -6 /::")
...
```
