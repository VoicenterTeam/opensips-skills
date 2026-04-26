# tls_wolfssl Module Reference
<!-- generated-from: data/4.0/modules/tls_wolfssl.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 tls_wolfssl module. Read this file when configuring or debugging the tls_wolfssl module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

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

## Exported Parameters

### `try_use_ktls` (integer)

Try to use KTLS for RX and TX ( dependent on Kernel support and loaded modules https://docs.kernel.org/networking/tls-offload.htm ) If kernel support is not found, or if the cypher attempted to be used is not supported ( only AES-GCM for now ), then SSL operations will continue to be done in user-space. IF NIC supports SSL offloading, that can also be enabled without any changes needed to the module https://docs.nvidia.com/doca/sdk/ktls-offloads/index.html

*Default value is 0.*

**Example.** 1.

```opensips
...
modparam("tls_wolfssl", "try_use_ktls", 1)
...
```

## Configuration Examples

### Set `try_use_ktls` variable

Demonstrates how to set the `try_use_ktls` parameter.

```opensips
...
modparam("tls_wolfssl", "try_use_ktls", 1)
...
```
