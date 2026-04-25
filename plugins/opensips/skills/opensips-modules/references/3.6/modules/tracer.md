# tracer Module Reference
<!-- generated-from: data/3.6/modules/tracer.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 tracer module. Read this file when configuring or debugging the tracer module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

Offer a possibility to store incoming/outgoing SIP messages in database. Since version 2.2, proto_hep module needs to be loaded in order to duplicate with hep. All hep parameters moved inside proto_hep.

## How It Works

The 2.2 version of OpenSIPS came with a major improvement in tracer module. Now all you have to do is call _trace()_ function with the proper parameters and it will do the job for you. Now you can trace messages, transactions and dialogs with the same function. Also, you can trace to multiple databases, multiple hep destinations and sip destinations using only one parameter. All you need now is defining _trace_id_ parameters in modparam section and switch between them in tracer function. Also you cand turn tracing on and off using _trace_on_ either globally(for all trace_ids) or for a certain trace_id.

IMPORTANT: In 2.2 version support for stateless trace has been removed.

The tracing tracing can be turned on/off using fifo command.

opensips-cli -x mi trace on opensips-cli -x mi trace [some_trace_id] on

opensips-cli -x mi trace off opensips-cli -x mi trace [some_trace_id] off

Starting with OpenSIPS 3.0 you can use the _trace_start_ to create dynamic dynamic tracing destinations based on some custom filters.

## Dependencies

### OpenSIPs Modules

- `b2b_logic` — only if you want to trace B2B sessions (optional)
- `database module` — mysql, postgres, dbtext, unixodbc... only if you are using a database type trace id (optional)
- `dialog` — only if you want to trace SIP dialogs (INVITE based) (optional)
- `proto_hep` — only if you want to trace / replicate messages over HEP protocol (optional)
- `tm` — only if you want to trace SIP transactions (optional)

### External Libraries

None.

## Exported Parameters

### `file_mode` (integer)

When file tracing is used, this parameter specifies the permissions to be used to create the trace files. It follows the UNIX conventions.

*Default value is 0600 (rw-------).*

**Example.** 0644.

```opensips
modparam("tracer", "file\_mode", 0644)
```
### `syslog_default_facility` (string)

When syslog tracing is used, this parameter specifies the log facility to write traces to.

*Default value is the value of syslog_facility.*

**Example.** LOG_DAEMON.

```opensips
modparam("tracer", "syslog\_default\_facility", "LOG\_DAEMON")
```
### `syslog_default_level` (integer)

When syslog tracing is used, this parameter specifies the level to write traces to.

*Default value is the value of log_level.*

**Example.** 2.

```opensips
modparam("tracer", "syslog\_default\_level", 2) # NOTICE
```
### `trace_id` (string)

Specify a destination for the trace. This can be a hep id defined in proto_hep, a sip uri, a file, a syslog facility or a database url and a table. All parameters inside trace_id must be separated by ;, excepting the last one. The parameters are given in key-value format, the possible keys being uri for HEP and SIP IDs and uri and table for databases. The format is [id_name]key1=value1;key2=value2;. HEP id's MUST be defined in proto_hep in order to be able to use them here. When the uri is a file, the path to the file has to be specified after the colon. The output is always appended if the file exists, or created if it doesn't, using [file_mode](#param_file_mode "1.3.6.file_mode (integer)") permissions. When the uri is syslog, it has to follow the following format: syslog[:FACILITY[:LEVEL]]. The default facility and levels are the ones used by OpenSIPS (syslog_facility and log_level). These can be tuned using syslog_default_facility and syslog_default_level parameters. One can declare multiple types of tracing under the same trace id, being identified by their name. So if you define two database url, one hep uri and one sip uri with the same name, when calling trace() with this name tracing shall be done to all the destinations. All the old parameter such as db_url, table and duplicate_uri will form the trace id with the name "default".

*Default value is null.*

**Notes:** No default value. If not set the module will be useless.

**Example.** [tid]uri=mysql://xxxx:xxxx@10.10.10.10/opensips;table=new_sip_trace;.

```opensips
modparam("tracer", "trace\_id", "[tid] uri=mysql://xxxx:xxxx@10.10.10.10/opensips; table=new\_sip\_trace;")
```
### `trace_local_ip` (string)

The address to be used in the fields that specify the source address (protocol, ip and port) for locally generated messages. If not set, the module sets it to the address of the socket that will be used to send the message. Protocol and/or port are optional and if omitted will take the default values: udp and 5060.

*Default value is NULL.*

**Example.** 10.1.1.1:5064.

```opensips
modparam("tracer", "trace\_local\_ip", "10.1.1.1:5064")
```
### `trace_on` (integer)

Parameter to enable/disable trace (on(1)/off(0))

*Default value is 1(enabled).*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("tracer", "trace\_on", 1)
```

## Exported Functions

### `trace(trace_id, [scope], [type], [trace_attrs], [flags], [correlation_id])`

Store or replicate current processed SIP message, transaction / dialog or B2B session. It is stored in the form prior applying chages made to it. The traced_user_avp parameter is now an argument to trace() function. Since version 2.2, this function also catches internally generated replies in stateless mode(sl_send_reply(...)).

**Parameters:**

- `correlation_id` *(string,pvar, optional)* — a custom SIP correlation ID to be forced (normally the SIP Call-ID is used) to correlate this traffic (transaction, dialog) with other traffic.
- `flags` *(string,pvar, optional)* — are some control flags over the tracing process (how and what to be traced).
  - `C`
  - `c`
- `scope` *(string, optional)* — what do you want to trace: dialog, transaction, B2B session or only the message. If not specified, will try the topmost trace that can be done: if dialog module loaded will trace dialogs, else if tm module loaded will trace transaction and if none of these loaded will trace messages.
  - `m`
  - `M`
  - `t`
  - `T`
  - `d`
  - `D`
  - `b`
  - `B`
- `trace_attrs` *(string, optional)* — this parameter replaces the traced_user_avp from the old version. To avoid duplicating an entry only for this parameter, whatever you put here(string/pvar) shall be stored in the trace_attrs column in the sip_trace table.
- `trace_id` *(string, required)* — the name of the trace_id specifying where to do the tracing.
- `type` *(string, optional)* — list of types of messages to be traced by this function; if not set only sip messages shall be traced; if the parameter is set, but sip is not specified, sip shall not be traced; all the parameters from the list shall be separated by '|'
  - `sip`
  - `xlog`
  - `rest`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE

**Related:**

- `sip_trace`

**Example.** how to trace a dialog sip and xlog.

```opensips
/* Example 1: how to trace a dialog sip and xlog */
	if (has_totag()) {
		match_dialog();
	} else {
		if (is_method("INVITE") {
			trace($var(trace_id), "d", "sip|xlog", $var(user));
		}
	}
```

**Example.** how to trace initial INVITE and BYE, sip and rest.

```opensips
/* Example 2: how to trace initial INVITE and BYE, sip and rest */
	if (has_totag()) {
		if (is_method("BYE")) {
			trace($var(trace_id), "m", "sip|rest", $var(user));
		}
	} else {
		if (is_method("INVITE")) {
			trace($var(trace_id), "m", "sip|rest", $var(user));
		}
	}
```

**Example.** trace initial INVITE transaction's only xlog and rest, no sip.

```opensips
/* Example 3: trace initial INVITE transaction's only xlog and rest, no sip */
	if (!has_totag()) {
		if (is_method("INVITE")) {
			trace($var(trace_id), "t", "xlog|rest", $var(user));
		}
	}
```

**Example.** stateless transaction aware mode!.

```opensips
/* Example 4: stateless transaction aware mode!*/
/* tm module must not be loaded */
	if (is_method("REGISTER")) {
		trace($var(trace_id), "t", "xlog|rest", $var(user));
		if (!www_authorize("", "subscriber")) {
			/* tracer will also catch the 401 generated by www_challenge() */
			www_challenge("", "auth");
		}
	}
```

## Exported MI Functions

### `trace`

Enable/disable tracing(globally or for a specific trace id) or dump info about trace ids. This command requires named parameters (each parameter is ginven in the format param\_name=param\_value).

**Parameters:**

- `id` *(string, optional)* — the name of the tracing instance. If this parameter is missing the command will either dump info for all tace ids(and return the global tracing state) or set the global tracing state.
- `mode` *(string, optional)* — possible values are: "on" - enable tracing, "off" - disable tracing. If the first parameter is missing, the command wil set the global tracing state, otherwise it will set the state for a specific trace id. If you turn global trace on but some of the trace ids had tracing set to off, then they shall not do tracing. If you want to turn the tracing on for all trace ids you will have to set it separately for each of them. If this parameter is missing but the first is set, the command will only dump info about that specific trace id. If both parameters are missing, the command will return the global tracing state and dump info for each id.

**Returns:** Returns the global tracing state and dumps info for each id or specific trace id.

**Example.** Display global tracing mode and all trace destinations

```opensips
opensips-cli -x mi trace
```

**Example.** Turn off global tracing

```opensips
opensips-cli -x mi trace mode=off
```

**Example.** Turn on tracing for destination id tid2

```opensips
opensips-cli -x mi trace id=tid2 mode=on
```

### `trace_start`

Creates a dynamic tracing destination based using custom filters. This function can be used to debug calls for certain destinations real-time. Dynamic destinations are not restart persistent!

**Parameters:**

- `filter` *(string, optional)* — used to filter the traffic received by the sender. This parameter should be an array that can contain multiple filters in the _condition=value_ format. Possible values for the _condition_ argument are: caller, callee, ip. The _condition_ parameter can consist of multiple different filters. In order to satisfy the overall condition and send traffic to the desired destination, all conditions have to be satisfied. If this parameter is missing all traffic is forwarded to the destination. The filter is applied for any incoming request
- `id` *(string, required)* — the name of the tracing instance.
- `scope` *(string, required)* — the scope to engage the tracing for. The format received by this parameter is similar to the one received by the _trace()_ function.
- `type` *(string, required)* — the type of messages you want to receive. The format received by this parameter is similar to the one received by the _trace()_ function.
- `uri` *(string, required)* — the destination uri for this instance.

**Returns:** Confirmation of the operation.

**Example.** MI FIFO Command to start tracing calls from IP 127.0.0.1 to HEP destination 10.0.0.1:9060

```opensips
opensips-cli -x mi trace_start id=ip_filter uri=hep:10.0.0.1:9060 filter=ip=127.0.0.1
```

**Example.** MI FIFO Command to start tracing calls from user Alice to user Bob

```opensips
opensips-cli -x mi trace_start id=alice_bob uri=hep:10.0.0.1:9060 filter=caller=Alice filter=caller=Bob
```

### `trace_stop`

Stops OpenSIPS from sending traffic to a dynamic trace id created using the _trace\_start_ command.

**Parameters:**

- `id` *(string, required)* — the name of the tracing instance to be stopped.

**Returns:** Confirmation of the operation.

**Example.** MI FIFO Command to stop tracing calls from user Alice to user Bob

```opensips
opensips-cli -x mi trace_stop alice_bob
```

## Configuration Examples

### Set `trace_on` parameter

Parameter to enable/disable trace (on(1)/off(0))

```opensips
...
modparam("tracer", "trace\_on", 1)
...
```
### Set `trace_local_ip` parameter

The address to be used in the fields that specify the source address (protocol, ip and port) for locally generated messages. If not set, the module sets it to the address of the socket that will be used to send the message. Protocol and/or port are optional and if omitted will take the default values: udp and 5060.

```opensips
...
#Resulting address: udp:10.1.1.1:5064
modparam("tracer", "trace\_local\_ip", "10.1.1.1:5064")
...
...
#Resulting address: tcp:10.1.1.1:5060
modparam("tracer, "trace\_local\_ip", "tcp:10.1.1.1")
...
...
#Resulting address: tcp:10.1.1.1:5064
modparam("tracer", "trace\_local\_ip", "tcp:10.1.1.1:5064")
...
...
#Resulting address: udp:10.1.1.1:5060
modparam("tracer", "trace\_local\_ip", "10.1.1.1")
...
```
### Set `trace_id` parameter

Specify a destination for the trace. This can be a hep id defined in proto\_hep, a sip uri, a file, a syslog facility or a database url and a table. All parameters inside \_trace\_id\_ must be separated by \_;\_, excepting the last one. The parameters are given in key-value format, the possible keys being \_uri\_ for HEP and SIP IDs and \_uri\_ and \_table\_ for databases. The format is \_\[id\_name\]key1=value1;key2=value2;\_. HEP id's **MUST** be defined in proto\_hep in order to be able to use them here.

When the uri is a \_file\_, the path to the file has to be specified after the colon. The output is always appended if the file exists, or created if it doesn't, using [file\_mode](#param_file_mode "1.3.6.�file_mode (integer)") permissions.

When the uri is \_syslog\_, it has to follow the following format: \_syslog\[:FACILITY\[:LEVEL\]\]\_. The default facility and levels are the ones used by OpenSIPS (\_syslog\_facility\_ and \_log\_level\_). These can be tuned using [syslog\_default\_facility](#param_syslog_default_facility "1.3.4.�syslog_default_facility (string)") and [syslog\_default\_level](#param_syslog_default_level "1.3.5.�syslog_default_level (integer)") parameters.

One can declare multiple types of tracing under the same trace id, being identified by their name. So if you define two database url, one hep uri and one sip uri with the same name, when calling trace() with this name tracing shall be done to all the destinations.

All the old parameter such as db\_url, table and duplicate\_uri will form the trace id with the name "default".

```opensips
...
/*DB trace id*/
modparam("tracer", "trace\_id",
"[tid]
uri=mysql://xxxx:xxxx@10.10.10.10/opensips;
table=new\_sip\_trace;")
/* hep trace id with the hep id defined in proto\_hep; check proto\_hep docs
 * for more information */
modparam("proto\_hep", "hep\_id",  "[hid]10.10.10.10")
modparam("tracer", "trace\_id", "[tid]uri=hep:hid")
/*sip trace id*/
modparam("tracer", "trace\_id",
"[tid]uri=sip:10.10.10.11:5060")
/* notice that they all have the same name
 * meaning that calling trace("tid",...)
 * will do sql, sip and hep tracing */
/*file trace id*/
modparam("tracer", "trace\_id",
"[tid]uri=file:/path/to/file")
/*syslog trace id at error (level -1)*/
modparam("tracer", "trace\_id",
"[tid]uri=syslog:local0:-1")
...
```
### Set `syslog_default_facility` parameter

When \_syslog\_ tracing is used, this parameter specifies the log facility to write traces to.

```opensips
...
modparam("tracer", "syslog\_default\_facility", "LOG\_DAEMON")
...
```
### Set `syslog_default_level` parameter

When \_syslog\_ tracing is used, this parameter specifies the level to write traces to.

```opensips
...
modparam("tracer", "syslog\_default\_level", 2) # NOTICE
...
```
### Set `file_mode` parameter

When \_file\_ tracing is used, this parameter specifies the permissions to be used to create the trace files. It follows the UNIX conventions.

```opensips
...
modparam("tracer", "file\_mode", 0644)
...
```
### `trace()` usage

Store or replicate current processed SIP message, transaction / dialog or B2B session. It is stored in the form prior applying chages made to it. The traced\_user\_avp parameter is now an argument to trace() function. Since version 2.2, this function also catches internally generated replies in stateless mode(sl\_send\_reply(...)).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE.

```opensips
...
/* see declaration of tid in trace\_id section */
	$var(trace\_id) = "tid";
	$var(user) = "osip\_user@opensips.org";

...
/* Example 1: how to trace a dialog sip and xlog */
	if (has\_totag()) {
		match\_dialog();
	} else {
		if (is\_method("INVITE") {
			trace($var(trace\_id), "d", "sip|xlog", $var(user));
		}
	}
...
/* Example 2: how to trace initial INVITE and BYE, sip and rest */
	if (has\_totag()) {
		if (is\_method("BYE")) {
			trace($var(trace\_id), "m", "sip|rest", $var(user));
		}
	} else {
		if (is\_method("INVITE")) {
			trace($var(trace\_id), "m", "sip|rest", $var(user));
		}
	}

...
/* Example 3: trace initial INVITE transaction's only xlog and rest, no sip */
	if (!has\_totag()) {
		if (is\_method("INVITE")) {
			trace($var(trace\_id), "t", "xlog|rest", $var(user));
		}
	}
...
/* Example 4: stateless transaction aware mode!*/
/* tm module must not be loaded */
	if (is\_method("REGISTER")) {
		trace($var(trace\_id), "t", "xlog|rest", $var(user));
		if (!www\_authorize("", "subscriber")) {
			/* tracer will also catch the 401 generated by www\_challenge() */
			www\_challenge("", "auth");
		}
	}
...
```
