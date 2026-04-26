# tls_wolfssl Module Reference
<!-- generated-from: data/3.5/modules/tls_wolfssl.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 tls_wolfssl module. Read this file when configuring or debugging the tls_wolfssl module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)

## Overview

This module implements TLS operations using the [_wolfSSL_](https://www.wolfssl.com/) libarary. It provides the primitives required by the _tls_mgm_ module in order to expose a higher-level API used by TLS-based protocol modules like _proto_tls_ or _proto_wss_.

The _wolfSSL_ library is statically-linked and bundled with this module so no installation or external dependency is required.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `autoconf` — Required for compilation
- `automake` — Required for compilation
- `libtool` — Required for compilation
