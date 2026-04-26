# tls_openssl Module Reference
<!-- generated-from: data/3.5/modules/tls_openssl.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 tls_openssl module. Read this file when configuring or debugging the tls_openssl module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)

## Overview

This module implements TLS operations using the openSSL libarary. It provides the primitives required by the tls_mgm module in order to expose a higher-level API used by TLS-based protocol modules like proto_tls or proto_wss etc.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `openssl` — Required for TLS v1.0 support (>= 0.9.6) and TLS v1.1/1.2 support (>= 1.0.1e). Also known as libssl.
- `openssl-dev` — Required for TLS v1.0 support and TLS v1.1/1.2 support. Also known as libssl-dev.
