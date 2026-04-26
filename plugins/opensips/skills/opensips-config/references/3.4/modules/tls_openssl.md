# tls_openssl Module Reference
<!-- generated-from: data/3.4/modules/tls_openssl.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 tls_openssl module. Read this file when configuring or debugging the tls_openssl module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)

## Overview

This module implements TLS operations using the [_openSSL_](https://www.openssl.org/) libarary. It provides the primitives required by the _tls_mgm_ module in order to expose a higher-level API used by TLS-based protocol modules like _proto_tls_ or _proto_wss_ etc.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libssl` — TLS v1.0 support requires >= 0.9.6
- `libssl` — TLS v1.1/1.2 support requires >= 1.0.1e
- `libssl-dev` — TLS v1.0 support
- `libssl-dev` — TLS v1.1/1.2 support
- `openssl` — TLS v1.0 support requires >= 0.9.6
- `openssl` — TLS v1.1/1.2 support requires >= 1.0.1e
- `openssl-dev` — TLS v1.0 support
- `openssl-dev` — TLS v1.1/1.2 support
