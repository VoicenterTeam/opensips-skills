# presence_reginfo Module Reference
<!-- generated-from: data/4.0/modules/presence_reginfo.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 presence_reginfo module. Read this file when configuring or debugging the presence_reginfo module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The module enables the handling of "Event: reg" (as defined in RFC 3680) inside of the presence module. This can be used distribute the registration-info status to the subscribed watchers.

The module does not currently implement any authorization rules. It assumes that publish requests are only issued by an authorized application and subscribe requests only by authorized users. Authorization can thus be easily done in OpenSIPS configuration file before calling handle_publish() and handle_subscribe() functions.

Note: This module only activates the processing of the "reg" in the presence module. To send dialog-info to watchers you also need a source which PUBLISH the reg info to the presence module. For example you can use the pua_reginfo module or any external component. This approach allows to have the presence server and the reg-info aware publisher (e.g. the main proxy) on different OpenSIPS instances.

## Dependencies

### OpenSIPs Modules

- `presence` — must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `aggregate_presentities` (integer)

Whether to aggregate in a single notify body all registration presentities. Useful to have all registrations on first NOTIFY following initial SUBSCRIBE.

*Default value is 0.*

**Example.** 1.

```opensips
				...
				modparam("presence_reginfo", "aggregate_presentities", 1)
				...
```
### `default_expires` (integer)

The default expires value used when missing from SUBSCRIBE message (in seconds).

*Default value is 3600.*

**Example.** 3600.

```opensips
...
modparam("presence_reginfo", "default_expires", 3600)
...
```

## Configuration Examples

### Set `default_expires` parameter

The default expires value used when missing from SUBSCRIBE message (in seconds).

```opensips
...
modparam("presence_reginfo", "default_expires", 3600)
...
```
### Set `aggregate_presentities` parameter

Whether to aggregate in a single notify body all registration presentities. Useful to have all registrations on first NOTIFY following initial SUBSCRIBE.

```opensips
...
modparam("presence_reginfo", "aggregate_presentities", 1)
...
```
