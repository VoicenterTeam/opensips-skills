# pua_xmpp Module Reference
<!-- generated-from: data/4.0/modules/pua_xmpp.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 pua_xmpp module. Read this file when configuring or debugging the pua_xmpp module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module is a gateway for presence between SIP and XMPP.

## How It Works

It translates one format into another and uses xmpp, pua and presence modules to manage the transmition of presence state information.

## Dependencies

### OpenSIPs Modules

- `presence`
- `pua`
- `xmpp`

### External Libraries

- `libxml`

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
- `request_uri` *(string, required)* — request_uri (string)

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

The IP address of the server.

```opensips
...
modparam("pua_xmpp", "server_address", "sip:sa@opensips.org:5060")
...
```
### Set `presence_server` parameter

The the address of the presence server. If set, it will be used as outbound proxy when sending PUBLISH requests.

```opensips
...
modparam("pua_xmpp", "presence_server", "sip:pa@opensips.org:5075")
...
```
### `Notify2Xmpp` usage

Function that handles Notify messages addressed to a user from an xmpp domain. It requires filtering after method and domain in configuration file. If the function is successful, a 2xx reply must be sent. This function can be used from REQUEST_ROUTE.

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

Function called when a Subscribe addressed to a user from a xmpp domain is received. It calls sending a Subscribe for winfo for the user, and the following Notify with dialog-info is translated into a subscription in xmpp. It also requires filtering in configuration file, after method, domain and event(only for presence).

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
