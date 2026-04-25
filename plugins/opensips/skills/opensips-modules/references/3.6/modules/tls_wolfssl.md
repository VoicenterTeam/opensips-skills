# tls_wolfssl Module Reference
<!-- generated-from: data/3.6/modules/tls_wolfssl.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 tls_wolfssl module. Read this file when configuring or debugging the tls_wolfssl module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)

## Overview

This module implements TLS operations using the wolfSSL libarary. It provides the primitives required by the tls_mgm module in order to expose a higher-level API used by TLS-based protocol modules like proto_tls or proto_wss.

The wolfSSL library is statically-linked and bundled with this module so no installation or external dependency is required.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `autoconf` — Required for compilation
- `automake` — Required for compilation
- `libtool` — Required for compilation
