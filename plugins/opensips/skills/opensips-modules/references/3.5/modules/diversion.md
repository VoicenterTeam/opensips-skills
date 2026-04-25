# diversion Module Reference
<!-- generated-from: data/3.5/modules/diversion.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 diversion module. Read this file when configuring or debugging the diversion module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module implements the Diversion extensions as per draft-levy-sip-diversion-08. The diversion extensions are useful in various scenarios involving call forwarding. Typically one needs to communicate the original recipient of the call to the PSTN gateway and this is what the diversion extensions can be used for.

### Warning

The draft-levy-sip-diversion-08 is expired!! See [IETF I-D tracker](https://datatracker.ietf.org/public/idindex.cgi?command=id_detail%E2%88%A7id=6002).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `suffix` (string)

The suffix to be appended to the end of the header field. You can use the parameter to specify additional parameters to be added to the header field, see the example.

**Example.** ;privacy=full.

```opensips
modparam("diversion", "suffix", ";privacy=full")
```

## Exported Functions

### `add_diversion(reason, [uri], [counter])`

The function adds a new diversion header field before any other existing Diversion header field in the message (the newly added Diversion header field will become the topmost Diversion header field). The inbound (without any modifications done by the proxy server) Request-URI will be used as the Diversion URI.

**Parameters:**

- `counter` *(int, optional)* — Diversion counter to be added to the header, as defined by the standard.
- `reason` *(string, required)* — The reason string to be added as the reason parameter
- `uri` *(string, optional)* — The URI to be added in the header. If missing the unchanged RURI from the original message will be used.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** Example 1.2. `add_diversion` usage.

```opensips
add_diversion("user-busy");
```

## Configuration Examples

### `suffix` usage

Sets the suffix parameter to append additional parameters to the header field.

```opensips
modparam("diversion", "suffix", ";privacy=full")
```
### `add_diversion` usage

Demonstrates adding a new diversion header field with a specific reason.

```opensips
...
add_diversion("user-busy");
...
```
