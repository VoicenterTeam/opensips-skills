# proto_sctp Module Reference
<!-- generated-from: data/3.5/modules/proto_sctp.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 proto_sctp module. Read this file when configuring or debugging the proto_sctp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The **proto_sctp** module is an optional transport module (shared library) which exports the required logic in order to handle SCTP-based communication. (socket initialization and send/recv primitives to be used by higher-level network layers)

Once loaded, you will be able to define _"sctp:"_ listeners in your script.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `sctp_port` (integer)

The default port to be used for all SCTP related operation. Be careful as the default port impacts both the SIP listening part (if no port is defined in the SCTP listeners) and the SIP sending part (if the destination SCTP URI has no explicit port).

If you want to change only the listening port for STP, use the port option in the SIP listener defintion.

*Default value is 5060.*

**Example.** Set the `sctp_port` parameter.

```opensips
modparam("proto_sctp", "sctp_port", 5070)
```

## Configuration Examples

### Set `sctp_port` parameter

```opensips
...
modparam("proto_sctp", "sctp_port", 5070)
...
```
