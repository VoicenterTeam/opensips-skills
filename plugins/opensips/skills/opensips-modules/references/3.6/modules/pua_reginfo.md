# pua_reginfo Module Reference
<!-- generated-from: data/3.6/modules/pua_reginfo.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 pua_reginfo module. Read this file when configuring or debugging the pua_reginfo module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module publishes information about "reg"-events according to to RFC 3680. This can be used distribute the registration-info status to the subscribed watchers.

## How It Works

This module "PUBLISH"es information when a new user registers at this server (e.g. when "save()" is called) to users, which have subscribed for the reg-info for this user.

This module can "SUBSCRIBE" for information at another server, so it will receive "NOTIFY"-requests, when the information about a user changes.

And finally, it can process received "NOTIFY" requests and it will update the local registry accordingly.

Use cases for this might be:

* Keeping different Servers in Sync regarding the location database
* Get notified, when a user registers: A presence-server, which handles offline message storage for an account, would get notified, when the user comes online.
* A client could subscribe to its own registration-status, so he would get notified as soon as his account gets administratively unregistered.
* ...

## Dependencies

### OpenSIPs Modules

- `pua`
- `usrloc`

### External Libraries

None.

## Exported Parameters

### `default_domain` (string)

The default domain for the registered users to be used when constructing the uri for the registrar callback.

*Default value is NULL.*

**Example.** kamailio.org.

```opensips
modparam("pua\_reginfo", "default\_domain", "kamailio.org")
```
### `outbound_proxy` (string)

The outbound\_proxy uri to be used when sending Subscribe and Publish requests.

*Default value is NULL.*

**Example.** sip:proxy@kamailio.org.

```opensips
modparam("pua\_reginfo", "outbound\_proxy", "sip:proxy@kamailio.org")
```
### `publish_reginfo` (integer)

Whether or not to generate PUBLISH requests.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("pua\_reginfo", "publish\_reginfo", 0)
```
### `server_address` (string)

The IP address of the server.

**Example.** sip:reginfo@160.34.23.12.

```opensips
modparam("pua\_reginfo", "server_address", "sip:reginfo@160.34.23.12")
```
### `ul_domain` (string)

The domain for for querying the usrloc-database.

*Default value is NULL.*

**Example.** location.

```opensips
modparam("pua\_reginfo", "ul\_domain", "location")
```
### `ul_identities_key` (string)

The Key, which may be used for retrieving multiple public identies for a user.

*Default value is NULL.*

**Example.** identities.

```opensips
modparam("pua\_reginfo", "ul\_identities\_key", "identities")
...
onreply\_route[register\_reply] {
	if (t\_check\_status("200") && $hdr(P-Associated-URI)) {
        ul\_add\_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo\_update("$tU@$td");
	}
}
```

## Exported Functions

### `reginfo_handle_notify(uldomain)`

This function processes received "NOTIFY"-requests and updates the local registry accordingly. This method does not create any SIP-Response, this has to be done by the script-writer.

**Parameters:**

- `uldomain` *(string, required)* — The parameter has to correspond to user location table (domain) where to store the record.

**Return codes:**

- `2` — contacts successfully updated, but no more contacts online now.
- `1` — contacts successfully updated and at at least one contact still registered.
- `-1` — Invalid NOTIFY or other error (see log-file)

**Example.** reginfo_handle_notify usage.

```opensips
if(is_method("NOTIFY")) 
	if (reginfo_handle_notify("location"))
		send_reply("202", "Accepted");
```

### `reginfo_subscribe(uri[, expires])`

This function will subscribe for reginfo-information at the given server URI.

**Parameters:**

- `expires` *(integer, optional)* — Expiration date for this subscription, in seconds (default 3600)
- `uri` *(string, required)* — SIP-URI of the server, where to subscribe, may contain pseudo-variables.

**Usable from:** REPLY_ROUTE

**Example.** reginfo_subscribe usage.

```opensips
route {
	t_on_reply("1");
	t_relay();
}

reply_route[1] {
	if (t_check_status("200")) 
		reginfo_subscribe("$ru");		
}
```

### `reginfo_update(aor)`

Explicitly update the presence status, e.g., when new information is learned. This may trigger a new NOTIFY towards subscribed entities; at least it will update the internal information for subsequent subscribe and notifies. This is done implicitly, when a registration is updated. However, when a registration was just updated with additional information like identities, this is not triggered automatically.

**Parameters:**

- `aor` *(string, required)* — The AOR to be updated.

**Usable from:** ONREPLY_ROUTE

**Example.** reginfo_subscribe usage.

```opensips
modparam("pua_reginfo", "ul_domain", "location")
modparam("pua_reginfo", "ul_identities_key", "identities")
...
onreply_route[register_reply] {
	if (t_check_status("200") && $hdr(P-Associated-URI)) {
        ul_add_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo_update("$tU@$td");
	}
}
```

## Configuration Examples

### Set `default_domain` parameter

The default domain for the registered users to be used when constructing the uri for the registrar callback.

```opensips
...
modparam("pua\_reginfo", "default\_domain", "kamailio.org")
...
```
### Set `publish_reginfo` parameter

Whether or not to generate PUBLISH requests.

```opensips
...
modparam("pua\_reginfo", "publish\_reginfo", 0)
...
```
### Set `outbound_proxy` parameter

The outbound_proxy uri to be used when sending Subscribe and Publish requests.

```opensips
...
modparam("pua\_reginfo", "outbound\_proxy", "sip:proxy@kamailio.org")
...
```
### Set `server_address` parameter

The IP address of the server.

```opensips
...
modparam("pua\_reginfo", "server\_address", "sip:reginfo@160.34.23.12")
...
```
### Set `ul_domain` parameter

The domain for for querying the usrloc-database.

```opensips
...
modparam("pua\_reginfo", "ul\_domain", "location")
...
```
### Set `ul_identities_key` parameter

The Key, which may be used for retrieving multiple public identies for a user.

```opensips
...
modparam("pua\_reginfo", "ul\_identities\_key", "identities")
...
onreply\_route\[register\_reply\] {
	if (t\_check\_status("200") && $hdr(P-Associated-URI)) {
        ul\_add\_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo\_update("$tU@$td");
	}
}

...
```
### `reginfo_handle_notify` usage

This function processes received "NOTIFY"-requests and updates the local registry accordingly.

```opensips
...
if(is\_method("NOTIFY")) 
	if (reginfo\_handle\_notify("location"))
		send\_reply("202", "Accepted");
...
```
### `reginfo_subscribe` usage

This function will subscribe for reginfo-information at the given server URI.

```opensips
...
route {
	t\_on\_reply("1");
	t\_relay();
}

reply\_route\[1\] {
	if (t\_check\_status("200")) 
		reginfo\_subscribe("$ru");		
}
...
```
### `reginfo_subscribe` usage

Explicitly update the presence status, e.g., when new information is learned.

```opensips
...
modparam("pua\_reginfo", "ul\_domain", "location")
modparam("pua\_reginfo", "ul\_identities\_key", "identities")
...
onreply\_route\[register\_reply\] {
	if (t\_check\_status("200") && $hdr(P-Associated-URI)) {
        ul\_add\_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo\_update("$tU@$td");
	}
}

...
```
