# presence_xcapdiff Module Reference
<!-- generated-from: data/3.6/modules/presence_xcapdiff.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 presence_xcapdiff module. Read this file when configuring or debugging the presence_xcapdiff module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Events](#exported-events)

## Overview

The presence_xcapdiff is an OpenSIPS module that adds support for the "xcap-diff" event to presence and pua. At the moment, the module just registers the event but doesn't do any event-specific processing. The module will automatically determine if the presence and/or pua modules are present and if so it will register the xcap-diff event with them. This allows the module to automatically offer presence or pua related functionality simply based on the presence of the aforementioned modules in the OpenSIPS configuration, without any need for manual configuration.

Registering the event with pua, allows the XCAP server to publish the xcap-event when some modification of a document happens. Registering the event with presence allows clients to subscribe to the event.

The module is intended to be used with the OpenXCAP server (www.openxcap.org), although it doesn't contain any OpenXCAP-specific code and should be usable with any XCAP server.

## Dependencies

### OpenSIPs Modules

- `presence` — to enable clients to subscribe to the xcap-diff event package.
- `pua` — to be able to publish the xcap-diff event when some modification of a document happens.
- `pua_mi` — to enable pua to publish the xcap-diff event using the MI interface. This is needed if this module is intended to be used in conjunction with OpenXCAP. (optional)

### External Libraries

None.

## Exported Events

### `xcap-diff`

Adds support for the 'xcap-diff' event to presence and pua. It allows the XCAP server to publish the xcap-event when some modification of a document happens and allows clients to subscribe to the event.
