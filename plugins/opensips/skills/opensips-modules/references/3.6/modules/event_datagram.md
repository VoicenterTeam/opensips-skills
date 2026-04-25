# event_datagram Module Reference
<!-- generated-from: data/3.6/modules/event_datagram.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 event_datagram module. Read this file when configuring or debugging the event_datagram module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module which provides a UNIX/UDP SOCKET transport layer implementation for the Event Interface.

## How It Works

The event payload is formated as a JSON-RPC notification, with the event name as the _method_ field and the event parameters as the _params_ field. There are two types of sockets used by this module, based on the sockets type. An UNIX socket should follow this syntax: _['unix:'] unix_socket_path_ An UDP socket should follow this syntax: _'udp:' address ':' port_

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Configuration Examples

### Example 1.1. E_PIKE_BLOCKED event

This is an example of an event raised by the pike module when it decides an ip should be blocked

```opensips
{
  "jsonrpc": "2.0",
  "method": "E_PIKE_BLOCKED",
  "params": {
    "ip": "192.168.2.11"
  }
}
```
### Example 1.2. UNIX socket

```opensips
unix:/tmp/opensips_event.sock
```
### Example 1.3. UDP socket

```opensips
udp:127.0.0.1:8081
```
