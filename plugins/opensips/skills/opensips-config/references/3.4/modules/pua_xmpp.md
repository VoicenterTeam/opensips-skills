# pua_xmpp Module Reference
<!-- generated-from: data/3.4/modules/pua_xmpp.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 pua_xmpp module. Read this file when configuring or debugging the pua_xmpp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is a gateway for presence between SIP and XMPP.

It translates one format into another and uses xmpp, pua and presence modules to manage the transmition of presence state information.

## Dependencies

### OpenSIPs Modules

- `presence` — The following modules must be loaded before this module
- `pua` — The following modules must be loaded before this module
- `xmpp` — The following modules must be loaded before this module

### External Libraries

- `libxml` — The following libraries or applications must be installed before running OpenSIPS with this module loaded

## Exported Parameters

### `presence_server` (string)

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

**Example.** sip:pa@opensips.org:5075.

```opensips
modparam("pua_xmpp", "presence_server", "sip:pa@opensips.org:5075")
```
### `server_address` (string)

The IP address of the server.

**Example.** sip:sa@opensips.org:5060.

```opensips
modparam("pua_xmpp", "server_address", "sip:sa@opensips.org:5060")
```

## Exported Functions

### `pua_xmpp_notify()`

Function that handles Notify messages addressed to a user from an xmpp domain. It requires filtering after method and domain in configuration file. If the function is successful, a 2xx reply must be sent.

**Usable from:** REQUEST_ROUTE

**Example.** Notify2Xmpp usage.

```opensips
...
	if( is_method("NOTIFY") && $ru=~"sip:.+@sip-xmpp.siphub.ro")
	{
		if(Notify2Xmpp())
			t_reply(200, "OK");
		exit;
	}
...
```

### `pua_xmpp_req_winfo(request_uri, expires)`

Function called when a Subscribe addressed to a user from a xmpp domain is received. It calls sending a Subscribe for winfo for the user, and the following Notify with dialog-info is translated into a subscription in xmpp. It also requires filtering in configuration file, after method, domain and event(only for presence).

**Parameters:**

- `expires` *(int, required)* — value of Expires header field in received Subscribe.
- `request_uri` *(string, required)* — 

**Usable from:** REQUEST_ROUTE

**Example.** xmpp_send_winfo usage.

```opensips
...
	if( is_method("SUBSCRIBE"))
	{
		handle_subscribe();
		if($ru=~"sip:.+@sip-xmpp.siphub.ro" && $hdr(Event)== "presence")
		{
			pua_xmpp_req_winfo($ruri, $hdr(Expires));
		}
		t_release();
	}
...
```

## Configuration Examples

### Set `server_address` parameter

Set `server_address` parameter

```opensips
...
modparam("pua_xmpp", "server_address", "sip:sa@opensips.org:5060")
...
```
### Set `presence_server` parameter

Set `presence_server` parameter

```opensips
...
modparam("pua_xmpp", "presence_server", "sip:pa@opensips.org:5075")
...
```
### `Notify2Xmpp` usage

`Notify2Xmpp` usage

```opensips
...
	if( is_method("NOTIFY") && $ru=~"sip:.+@sip-xmpp.siphub.ro")
	{
		if(Notify2Xmpp())
			t_reply(200, "OK");
		exit;
	}
...
```
### `xmpp_send_winfo` usage

`xmpp_send_winfo` usage

```opensips
...
	if( is_method("SUBSCRIBE"))
	{
		handle_subscribe();
		if($ru=~"sip:.+@sip-xmpp.siphub.ro" && $hdr(Event)== "presence")
		{
			pua_xmpp_req_winfo($ruri, $hdr(Expires));
		}
		t_release();
	}

...
```
