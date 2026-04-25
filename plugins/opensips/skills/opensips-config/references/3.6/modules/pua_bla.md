# pua_bla Module Reference
<!-- generated-from: data/3.6/modules/pua_bla.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 pua_bla module. Read this file when configuring or debugging the pua_bla module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The pua_bla module enables Bridged Line Appearances support according to the specifications in draft-anil-sipping-bla-03.txt.

## Dependencies

### OpenSIPs Modules

- `presence`
- `pua`
- `usrloc`

### External Libraries

- `libxml`

## Exported Parameters

### `default_domain` (string)

The default domain for the registered users to be used when constructing the uri for the registrar callback.

*Default value is NULL.*

**Example.** opensips.org.

```opensips
...
modparam("pua_bla", "default_domain", "opensips.org")
...
```
### `header_name` (string)

The name of the header to be added to Publish requests. It will contain the uri of the user agent that sent the Notify that is transformed into Publish. It stops sending a Notification with the same information to the sender.

*Default value is NULL.*

**Example.** Sender.

```opensips
...
modparam("pua_bla", "header_name", "Sender")
...
```
### `outbound_proxy` (string)

The outbound_proxy uri to be used when sending Subscribe requests.

*Default value is NULL.*

**Example.** sip:proxy@opensips.org.

```opensips
...
modparam("pua_bla", "outbound_proxy", "sip:proxy@opensips.org")
...
```
### `presence_server` (string)

The address of the presence server - will be used as an outbound proxy when sending PUBLISH requests. It is optional.

*Default value is NULL.*

**Example.** sip:pa@opensips.org.

```opensips
...
modparam("pua_bla", "presence_server", "sip:pa@opensips.org")
...
```
### `server_address` (string)

The IP address of the server.

**Example.** sip:bla@160.34.23.12.

```opensips
...
modparam("pua_bla", "server_address", "sip:bla@160.34.23.12")
...
```

## Exported Functions

### `bla_handle_notify()`

The function handles Notify requests sent from phones on the same BLA to the server. The message is transformed in Publish request and passed to presence module for further handling. in case of a successful processing a 2xx reply should be sent.

**Usable from:** REQUEST_ROUTE

**Example.** bla_handle_notify usage.

```opensips
...
if(is_method("NOTIFY") && $tu=~"bla_aor@opensips.org") 
{
		if( bla_handle_notify() ) 
			t_reply(200, "OK");
}	
...
```

### `bla_set_flag()`

The function is used to mark REGISTER requests made to a BLA AOR. The modules subscribes to the registered contacts for dialog;sla event.

**Usable from:** REQUEST_ROUTE

**Example.** bla_set_flag usage.

```opensips
...
if(is_method("REGISTER") && $tu=~"bla_aor@opensips.org") 
	bla_set_flag();		
...
```

## Configuration Examples

### Set `default_domain` parameter

The default domain for the registered users to be used when constructing the uri for the registrar callback.

```opensips
modparam("pua_bla", "default_domain", "opensips.org")
```
### Set `header_name` parameter

The name of the header to be added to Publish requests. It will contain the uri of the user agent that sent the Notify that is transformed into Publish. It stops sending a Notification with the same information to the sender.

```opensips
modparam("pua_bla", "header_name", "Sender")
```
### Set `outbound_proxy` parameter

The outbound_proxy uri to be used when sending Subscribe requests.

```opensips
modparam("pua_bla", "outbound_proxy", "sip:proxy@opensips.org")
```
### Set `server_address` parameter

The IP address of the server.

```opensips
modparam("pua_bla", "server_address", "sip:bla@160.34.23.12")
```
### Set `presence_server` parameter

The address of the presence server - will be used as an outbound proxy when sending PUBLISH requests. It is optional.

```opensips
modparam("pua_bla", "presence_server", "sip:pa@opensips.org")
```
### `bla_set_flag` usage

The function is used to mark REGISTER requests made to a BLA AOR. The modules subscribes to the registered contacts for dialog;sla event.

```opensips
if(is_method("REGISTER") && $tu=~"bla_aor@opensips.org") 
	bla_set_flag();
```
### `bla_handle_notify` usage

The function handles Notify requests sent from phones on the same BLA to the server. The message is transformed in Publish request and passed to presence module for further handling. in case of a successful processing a 2xx reply should be sent.

```opensips
if(is_method("NOTIFY") && $tu=~"bla_aor@opensips.org") 
{
		if( bla_handle_notify() )
			t_reply(200, "OK");
}
```
