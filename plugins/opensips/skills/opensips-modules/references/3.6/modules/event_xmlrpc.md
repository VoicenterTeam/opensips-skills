# event_xmlrpc Module Reference
<!-- generated-from: data/3.6/modules/event_xmlrpc.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 event_xmlrpc module. Read this file when configuring or debugging the event_xmlrpc module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of an XMLRPC client used to notify XMLRPC servers whenever certain notifications are raised by OpenSIPS. It acts as a transport layer for the Event Notification Interface.

## How It Works

Basicly, the module executes a remote procedure call when an event is raised from OpenSIPS's script, core or modules using the Event Interface. In order to be notified, an XMLRPC server has to subscribe for a certain event provided by OpenSIPS. This can be done using the generic MI Interface (_event\_subscribe_ function) or from OpenSIPS script (_subscribe\_event_ core function).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `use_struct_param` (integer)

When raising an event, pack the name and value of the parameters in a XMLRPC structure. This provides an easier way for some XMLRPC server implementations to interpret the parameters. Set it to zero to disable or to non-zero to enable it.

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("event\_xmlrpc", "use\_struct\_param", 1)
```

## Configuration Examples

### Example 1.2. E_PIKE_BLOCKED event

This is an example of an event raised by the pike module when it decides an ip should be blocked:

```opensips
POST /RPC2 HTTP/1.1.
Host: 127.0.0.1:8081.
Connection: close.
User-Agent: OpenSIPS XMLRPC Notifier.
Content-type: text/xml.
Content-length: 240.
		.
<?xml version="1.0"?>
<methodCall>
	<methodName>e\_dummy\_h</methodName>
	<params>
		<param>
			<value><string>E\_MY\_EVENT</string></value>
		</param>
		<param>
			<name>ip</name>
			<value><string>192.168.2.11</string></value>
		</param>
	</params>
</methodCall>
```
### Example 1.3. XMLRPC socket

```opensips
	# calls the 'block\_ip' function
	xmlrpc:127.0.0.1:8080:block\_ip
```
