# b2b_sca Module Reference
<!-- generated-from: data/4.0/modules/b2b_sca.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 b2b_sca module. Read this file when configuring or debugging the b2b_sca module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides core SCA (Shared Call Appearance) functionality for OpenSIPS. It is designed to work in tandem with the presence_callinfo module.

The module handles the basic SIP signalling for call controll while publishing callinfo events to a presence server. It is built on top of the b2b_logic module and it is using the 'top hiding' scenario to control SIP signalling.

## How It Works

A typical usage example is provided below, where Alice makes a call to Bob. The call leg between Alice and the b2b_sca server is an "appearance" call of the "shared" call between the b2b_sca server and Bob.

   caller         caller      b2b_sca     callee   presence server
alice1@example alice2@example  server   bob@example watcher@example
     |              |             |           |           |
     |--INV bob------------------>|           |           |
     |              |             |--INV bob->|           |
     |              |             |--PUBLISH(alerting)--->|
     |              |             |<-----200 OK-----------|
     |              |             |           |           |
     |              |             |<-180 ring-|           |
     |<-180 ring------------------|           |           |
     |              |             |           |           |
     |              |             |           |           |
     |              |             |<-200 OK---|           |
     |<-200 OK--------------------|--ACK----->|           |
     |--ACK---------------------->|--PUBLISH(active)----->|
     |              |             |<-----200 OK-----------|
     |              |             |           |           |
     |--INV bob (hold)----------->|           |           |
     |              |             |--INV bob->|           |
     |              |             |--PUBLISH(held)------->|
     |              |             |<-----200 OK-----------|
     |              |             |<-200 OK---|           |
     |<--200 OK-------------------|           |           |
     |              |             |           |           |
     |              |--INV------->|           |           |
     |              |             |--INV bob->|           |
     |<-BYE-----------------------|--PUBLISH(active)----->|
     |--200 OK------------------->|<-----200 OK-----------|
     |              |             |<-200 OK---|           |
     |              |<-200 OK-----|           |

*   Alice calls Bob from her desk IP phone (alice1).
    
*   Bob answers the call.
    
*   Alice decide to carry the conversation from a meeting room and she put's BOB on hold.
    
*   Alice arrives to the meeting room and retrieves the call on the conference room IP phone (alice2).

## Dependencies

### OpenSIPs Modules

- `b2b_logic`
- `pua`
- `tm`

### External Libraries

None.

## Exported Parameters

### `app[index]_b2bl_key_column` (string)

The column's name in the database storing the b2b_logic key of a particular appearance.

*Default value is app[index]_b2bl_key.*

*Valid range: 1 to 10.*

**Example.** app1_b2bl_key_column.

```opensips
modparam("b2b_sca", "app1_b2bl_key_column", "first_b2bl_key")
modparam("b2b_sca", "app2_b2bl_key_column", "second_b2bl_key")
```
### `app[index]_call_info_appearance_uri_column` (string)

The column's name in the database storing the call info appearance URI of a particular appearance. For each appearance, the value is extracted from the "appearance_name_addr_spec_param" parameter.

*Default value is app[index]_call_info_appearance_uri.*

*Valid range: 1 to 10.*

**Example.** app1_call_info_appearance_uri_column.

```opensips
modparam("b2b_sca", "app1_call_info_appearance_uri_column", "first_call_info_appearance_uri")
modparam("b2b_sca", "app2_call_info_appearance_uri_column", "second_call_info_appearance_uri")
```
### `app[index]_call_info_uri_column` (string)

The column's name in the database storing the call info URI of a particular appearance.

*Default value is app[index]_call_info_uri.*

*Valid range: 1 to 10.*

**Example.** app1_call_info_uri_column.

```opensips
modparam("b2b_sca", "app1_call_info_uri_column", "first_call_info_uri")
modparam("b2b_sca", "app2_call_info_uri_column", "second_call_info_uri")
```
### `app[index]_call_state_column` (string)

The column's name in the database storing the call state of a particular appearance. The following states are stored: 1 - alerting, 2 - active, 3 - held, 4 - held-private.

*Default value is app[index]_call_state.*

**Possible values:**

- 1 - alerting
- 2 - active
- 3 - held
- 4 - held-private

*Valid range: 1 to 10.*

**Example.** app1_call_state_column.

```opensips
modparam("b2b_sca", "app1_call_state_column", "first_call_state")
modparam("b2b_sca", "app2_call_state_column", "second_call_state")
```
### `app[index]_shared_entity_column` (string)

The column's name in the database storing the shared entity of a particular appearance. See "sca_init_request" for more info.

*Default value is app[index]_shared_entity.*

*Valid range: 1 to 10.*

**Example.** app1_shared_entity_column.

```opensips
modparam("b2b_sca", "app1_shared_entity_column", "first_shared_entity")
modparam("b2b_sca", "app2_shared_entity_column", "second_shared_entity")
```
### `appearance_name_addr_spec_param` (string)

Mandatory parameter. It must be a valid SIP URI. It will populate the _appearance-uri_ SIP parameter inside the _Call-Info_ SIP header. The appearance_name_addr_spec_param MUST be set before calling sca_init_request();

*Default value is NULL.*

**Example.** Set the `appearance_name_addr_spec_param` parameter.

```opensips
modparam("b2b_sca", "appearance_name_addr_spec_param", "")
```
### `db_mode` (integer)

The b2b_sca module can utilize database for persistent call appearance storage. Using a database ensure that active call appearances will survive machine restarts or SW crashes. The following databse accessing modes are available for b2b_sca module:

*Default value is 0 (NO DB STORAGE).*

**Possible values:**

- NO DB STORAGE - set this parameter to 0
- WRITE THROUGH (synchronous write in database) - set this parameter to 1

**Example.** 1.

```opensips
modparam("b2b_sca", "db_mode", 1)
```
### `db_url` (string)

This is URL of the database to be used.

*Default value is NULL.*

**Example.** [dbdriver]://[[username]:[password]]@[dbhost]/[dbname].

```opensips
modparam("b2b_sca", "db_url", "\[dbdriver\]://\[\[username\]:\[password\]\]@\[dbhost\]/\[dbname\]")
```
### `hash_size` (integer)

The size of the hash table internally used to keep the shared calls. A larger table means faster acces at the expense of memory. The hash size is a power of number two.

*Default value is 10.*

**Example.** 5.

```opensips
modparam("b2b_sca", "hash_size", "5")
```
### `presence_server` (string)

The address of the presence server, where the PUBLISH messages should be sent (not compulsory). If not set, the PUBLISH requests will be routed based on watcher's URI.

*Default value is NULL.*

**Example.** sip:opensips.org.

```opensips
modparam("b2b_sca", "presence_server", "sip:opensips.org")
```
### `shared_line_column` (string)

The column's name in the database storing the shared call/line id. See "shared_line_spec_param" parameter.

*Default value is shared_line.*

**Example.** Set the `shared_line_column` parameter.

```opensips
modparam("b2b_sca", "shared_line_column", "")
```
### `shared_line_spec_param` (string)

Mandatory parameter. Opaque string identifing the shared line/call. The shared_line_spec_param MUST be set before calling sca_init_request();

*Default value is NULL.*

**Example.** $var(shared_line).

```opensips
modparam("b2b_sca", "shared_line_spec_param", "$var(shared_line)")
```
### `table_name` (string)

Identifies the table name from the defined database.

*Default value is b2b_sca.*

**Example.** sla.

```opensips
modparam("b2b_sca", "table_name", "sla")
```
### `watchers_avp_spec` (string)

AVP that will hold one or more watcher URI(s). If not set, no PUBLISH requests will be sent out. The watchers_avp_spec MUST be set before calling sca_init_request();

*Default value is NULL.*

**Example.** $avp(watchers_avp_spec).

```opensips
modparam("b2b_sca", "watchers_avp_spec", "$avp(watchers_avp_spec)")
```
### `watchers_column` (string)

The column's name in the database storing the list of watchers. See "watchers_avp_spec" parameter.

*Default value is watchers.*

**Example.** Set the `watchers_column` parameter.

```opensips
modparam("b2b_sca", "watchers_column", "")
```

## Exported Functions

### `sca_bridge_request(shared_line_to bridge)`

This is the function that must be called by the script writer on an initial 'appearance' INVITE for an existing shared call. It will bridge the current 'appearance' call with the existing 'shared' call and the old 'appearance' call will be disconnected (see the call from alice2 in the above diagram).

**Parameters:**

- `shared_line_to_bridge` *(string, required)* — a string identifying the shared line/call that was previously set by sca_init_request().

**Usable from:** REQUEST_ROUTE

**Related:**

- `sca_init_request`

**Example.** Usage example for `sca_bridge_request`.

```opensips
...
	if ($rU==NULL && is_method("INVITE") &&
		$fU==$tU && is_present_hf("Call-Info")) {
		# The incoming call is an 'appearance' call
		# - see Alice's call from alice2 in the given example
		$var(shared_line_to_bridge) = "alice";
		if (!sca_bridge_request($var(shared_line_to_bridge)))
			send_reply(403, "Internal SLA Error");
			exit;
		}
	}
...
```

### `sca_init_request(shared_line)`

This is the function that must be called by the script writer on an initial INVITE for which an SCA call must be instantiated (see the call from alice1 in the above diagram).

**Parameters:**

- `shared_line` *(int, required)* — an integer identifying the call leg as being an 'appearnace' call or a 'shared' call
  - `0`
  - `1`

**Usable from:** REQUEST_ROUTE

**Example.** Example 1.16. `sca_init_request()` usage.

```opensips
...
modparam("b2b_sca",
	"shared_line_spec_param","$var(shared_line)")
modparam("b2b_sca",
	"appearance_name_addr_spec_param","$var(appearance_name_addr)")
modparam("b2b_sca",
	"watchers_avp_spec","$avp(watchers_avp_spec)")

...

	# Setting the shared call identifier
	$var(shared_line) = "alice";

	# Setting the watchers
	$avp(watchers_avp_spec) = "sip:alice1@example.com";
	$avp(watchers_avp_spec) = "sip:alice2@example.com";

	if (INCOMING_SHARED_CALL) {
		# The incoming call is a 'shared' call
		$var(shared_line_entity) = 0;
		# Setting the appearance name address
		$var(appearance_name_addr) = $fu;
	}
	else {
		# The incoming call is an 'appearance' call
		# - see Alice's initial call leg in the given example
		$var(shared_line_entity) = 1;
		# Setting the appearance name address
		$var(appearance_name_addr) = $tu;
	}

	# Initiate the call
	if (!sca_init_request($var(shared_line_entity))) {
		send_reply(403, "Internal Server Error (SLA)");
		exit;
	}
...
```

## Exported MI Functions

### `b2b_sca:list`

Replaces obsolete MI command: _sca_list_.

It lists the appearances belonging to a shared line/call.

**Example.** MI FIFO Command Format

```bash
	opensips-cli -x mi b2b_sca:list
```

## Configuration Examples

### Set `hash_size` parameter

Set `hash_size` parameter

```opensips
...
modparam("b2b_sca", "hash_size", "5")
...
```
### Set `presence_server` parameter

Set `presence_server` parameter

```opensips
...
modparam("b2b_sca", "presence_server", "sip:opensips.org")
...
```
### Set `watchers_avp_spec` parameter

Set `watchers_avp_spec` parameter

```opensips
...
modparam("b2b_sca", "watchers_avp_spec", "$avp(watchers_avp_spec)")
...
route {
	...
	$avp(watchers_avp_spec) = "sip:first_watcher@opensip.org";
	$avp(watchers_avp_spec) = "sip:second_watcher@opensip.org";
	...
}
```
### Set `shared_line_spec_param` parameter

Set `shared_line_spec_param` parameter

```opensips
...
modparam("b2b_sca", "shared_line_spec_param", "$var(shared_line)")
...
```
### Set `appearance_name_addr_spec_param` parameter

Set `appearance_name_addr_spec_param` parameter

```opensips
...
modparam("b2b_sca", "appearance_name_addr_spec_param", "")
...
```
### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("b2b_sca", "db_url", "[dbdriver]://[[username]:[password]]@[dbhost]/[dbname]")
...
```
### Set `db_mode` parameter

Set `db_mode` parameter

```opensips
...
modparam("b2b_sca", "db_mode", 1)
...
```
### Set `table_name` parameter

Set `table_name` parameter

```opensips
...
modparam("b2b_sca", "table_name", "sla")
...
```
### Set `shared_line_column` parameter

Set `shared_line_column` parameter

```opensips
...
modparam("b2b_sca", "shared_line_column", "")
...
```
### Set `watchers_column` parameter

Set `watchers_column` parameter

```opensips
...
modparam("b2b_sca", "watchers_column", "")
...
```
### Set `app[index]_shared_entity_column` parameter

Set `app[index]_shared_entity_column` parameter

```opensips
...
modparam("b2b_sca", "app1_shared_entity_column", "first_shared_entity")
modparam("b2b_sca", "app2_shared_entity_column", "second_shared_entity")
...
```
### Set `app[index]_call_state_column` parameter

Set `app[index]_call_state_column` parameter

```opensips
...
modparam("b2b_sca", "app1_call_state_column", "first_call_state")
modparam("b2b_sca", "app2_call_state_column", "second_call_state")
...
```
### Set `app[index]_call_info_uri_column` parameter

Set `app[index]_call_info_uri_column` parameter

```opensips
...
modparam("b2b_sca", "app1_call_info_uri_column", "first_call_info_uri")
modparam("b2b_sca", "app2_call_info_uri_column", "second_call_info_uri")
...
```
### Set `app[index]_call_info_appearance_uri_column` parameter

Set `app[index]_call_info_appearance_uri_column` parameter

```opensips
...
modparam("b2b_sca", "app1_call_info_appearance_uri_column", "first_call_info_appearance_uri")
modparam("b2b_sca", "app2_call_info_appearance_uri_column", "second_call_info_appearance_uri")
...
```
### Set `app[index]_b2bl_key_column` parameter

Set `app[index]_b2bl_key_column` parameter

```opensips
...
modparam("b2b_sca", "app1_b2bl_key_column", "first_b2bl_key")
modparam("b2b_sca", "app2_b2bl_key_column", "second_b2bl_key")
...
```
### `sca_init_request()` usage

`sca_init_request()` usage

```opensips
...
modparam("b2b_sca",
	"shared_line_spec_param","$var(shared_line)")
modparam("b2b_sca",
	"appearance_name_addr_spec_param","$var(appearance_name_addr)")
modparam("b2b_sca",
	"watchers_avp_spec","$avp(watchers_avp_spec)")

...

	# Setting the shared call identifier
	$var(shared_line) = "alice";

	# Setting the watchers
	$avp(watchers_avp_spec) = "sip:alice1@example.com";
	$avp(watchers_avp_spec) = "sip:alice2@example.com";

	if (INCOMING_SHARED_CALL) {
		# The incoming call is a 'shared' call
		$var(shared_line_entity) = 0;
		# Setting the appearance name address
		$var(appearance_name_addr) = $fu;
	}
	else {
		# The incoming call is an 'appearance' call
		# - see Alice's initial call leg in the given example
		$var(shared_line_entity) = 1;
		# Setting the appearance name address
		$var(appearance_name_addr) = $tu;
	}

	# Initiate the call
	if (!sca_init_request($var(shared_line_entity))) {
		send_reply(403, "Internal Server Error (SLA)");
		exit;
	}
...
```
