# pua_mi Module Reference
<!-- generated-from: data/4.0/modules/pua_mi.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 pua_mi module. Read this file when configuring or debugging the pua_mi module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The pua_mi offers the possibility to publish presence information and subscribe to presence information via MI transports.

Using this module you can create independent applications/scripts to publish not sip-related information (e.g., system resources like CPU-usage, memory, number of active subscribers ...). Also, this module allows non-SIP speaking applications to subscribe presence information kept in a SIP presence server.

## Dependencies

### OpenSIPs Modules

- `pua`

### External Libraries

None.

## Exported Parameters

### `presence_server` (string)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example.** sip:pa@opensips.org:5075.

```opensips
modparam("pua_mi", "presence_server", "sip:pa@opensips.org:5075")
```

## Exported MI Functions

### `pua_mi:publish`

Replaces obsolete MI command: _pua_publish_.

**Parameters:**

- `body` *(string, optional)* — The body of the publish request containing published information or missing if no published information. It has to be a single line for FIFO transport. If this parameter is provided, the _content_type_ parameter is also required.
- `content_type` *(string, optional)* — Content type of published information (e.g. application/pidf+xml). If this parameter is provided, the _body_ parameter is also required.
- `etag` *(string, optional)* — ETag that publish should match.
- `event_package` *(string, required)* — Event package that is target of published information (e.g. presence).
- `expires` *(integer, required)* — Relative expires time in seconds (e.g. 3600).
- `extra_headers` *(string, optional)* — Extra headers added to PUBLISH request.
- `presentity_uri` *(string, required)* — e.g. sip:system@opensips.org

**Example.** FIFO example

```opensips-cli
opensips-cli -x mi pua_mi:publish sip:system@opensips.org 3600 presence application/pidf+xml <?xml version='1.0'?><presence xmlns='urn:ietf:params:xml:ns:pidf' xmlns:dm='urn:ietf:params:xml:ns:pidf:data-model' xmlns:rpid='urn:ietf:params:xml:ns:pidf:rpid' xmlns:c='urn:ietf:params:xml:ns:pidf:cipid' entity='system@opensips.org'><tuple id='0x81475a0'><status><basic>open</basic></status></tuple><dm:person id='pdd748945'><rpid:activities><rpid:away/>away</rpid:activities><dm:note>CPU:16 MEM:476</dm:note></dm:person></presence>
```

### `pua_mi:subscribe`

Replaces obsolete MI command: _pua_subscribe_.

**Parameters:**

- `event_package` *(string, required)* — 
- `expires` *(integer, required)* — Relative time in seconds for the desired validity of the subscription.
- `presentity_uri` *(string, required)* — e.g. sip:presentity@opensips.org
- `watcher_uri` *(string, required)* — e.g. sip:watcher@opensips.org

**Example.** FIFO example

```opensips-cli
opensips-cli -x mi pua_mi:subscribe sip:system@opensips.org sip:400@opensips.org presence 3600
```

## Configuration Examples

### Set `presence_server` parameter

Sets the address of the presence server to be used as an outbound proxy when sending PUBLISH requests.

```opensips
...
modparam("pua_mi", "presence_server", "sip:pa@opensips.org:5075")
...
```
### `pua_mi:publish` FIFO example

Demonstrates publishing presence information using the pua_mi:publish MI command via FIFO transport.

```opensips
...
opensips-cli -x mi pua_mi:publish sip:system@opensips.org 3600 presence application/pidf+xml <?xml version='1.0'?><presence xmlns='urn:ietf:params:xml:ns:pidf' xmlns:dm='urn:ietf:params:xml:ns:pidf:data-model' xmlns:rpid='urn:ietf:params:xml:ns:pidf:rpid' xmlns:c='urn:ietf:params:xml:ns:pidf:cipid' entity='system@opensips.org'><tuple id='0x81475a0'><status><basic>open</basic></status></tuple><dm:person id='pdd748945'><rpid:activities><rpid:away/>away</rpid:activities><dm:note>CPU:16 MEM:476</dm:note></dm:person></presence>
```
### `pua_mi:subscribe` FIFO example

Demonstrates subscribing to presence information using the pua_mi:subscribe MI command via FIFO transport.

```opensips
...
opensips-cli -x mi pua_mi:subscribe sip:system@opensips.org sip:400@opensips.org presence 3600
```
