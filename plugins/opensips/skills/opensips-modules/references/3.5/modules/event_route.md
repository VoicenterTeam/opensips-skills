# event_route Module Reference
<!-- generated-from: data/3.5/modules/event_route.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 event_route module. Read this file when configuring or debugging the event_route module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides a simple way for capturing and handling directly in the OpenSIPS script of different events triggered through the OpenSIPS Event Interface

## How It Works

If you want to capture and handle a certian event, you need to define a dedicated route (_event_route_) into the OpenSIPS script, route having as name the name/code of the desired event. The route is triggered (and executed) by the module when the corresponding event is raised by the OpenSIPS

NOTE that the triggered _event_route_ is run asyncronus (and in a different process) in regards to the code or process that generated the actual event.

NOTE that inside the _event_route_ you should NOT rely on anything more than the content provide by the event itself (see below variable). DO NOT assume to have access to any other variable or context, not even to a SIP message.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Pseudo-Variables

### `$param`

In order to retrieve the parameters of an event, the $param(name) variable has to be used. It's name can be the parameter's name, or, if an integer is specified, its index inside the parameter's list. An event may be triggered within a different event, leading to nested processing. This function will retrieve the parameters of the currently processed event.

- **Type:** string
- **Read/write:** read-only
- **Scope:** event_route

## Configuration Examples

### EVENT_ROUTE usage

In order to handle the E_PIKE_BLOCKED event, the following snippet can be used:

```opensips
event_route[E_PIKE_BLOCKED] {
	xlog("IP $param(ip) has been blocked\\n");
}
```
