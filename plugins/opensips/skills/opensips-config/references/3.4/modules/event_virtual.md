# event_virtual Module Reference
<!-- generated-from: data/3.4/modules/event_virtual.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 event_virtual module. Read this file when configuring or debugging the event_virtual module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The _event_virtual_ module provides the possibility to have multiple external applications, using different transport protocols, subscribed to the OpenSIPS Event Interface as a single virtual subscriber, for a specific event. When an event is triggered, the event_virtual module notifies the specified transport modules using one of the following policies:

* _PARALLEL_ - all subscribers (applications) are notified at once
* _FAILOVER_ - for every event raised, try to notify the subscribers, in the order in which they are given, until the first successful notification. A failed subscriber is skipped for further notifications until the [failover_timeout](#param_failover_timeout "1.5.1.failover_timeout (integer)") passes.
* _ROUND-ROBIN_ - for every event raised, notify the subscribers alternatively, in the order in which they are given (for each raised event notify a different subscriber)

Only one expire value can be used (for the whole virtual subscription), and not one for each individual subscriber.

## Dependencies

### OpenSIPs Modules

- `The OpenSIPS event modules which implement the transport protocols used by the subscribers`

### External Libraries

None.

## Exported Parameters

### `failover_timeout` (integer)

The minimum duration in seconds that a failed subscriber is skipped for further notifications. This parameter only affects the _FAILOVER_ policy.

*Default value is 30.*

**Example.** 5.

```opensips
modparam("event_virtual", "failover_timeout", 5)
```

## Configuration Examples

### Virtual socket

The sockets of the subscribers may be separated by any number of spaces or tabs:

```opensips
	virtual:PARALLEL rabbitmq:guest:guest@127.0.0.1:5672/pike flatstore:/var/log/opensips_proxy.log
```
