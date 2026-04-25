# b2b_logic Module Reference
<!-- generated-from: data/3.5/modules/b2b_logic.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 b2b_logic module. Read this file when configuring or debugging the b2b_logic module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The B2BUA implementation in OpenSIPS is separated in two layers:

*   a lower one (implemented in the b2b_entities module) - the basic functions of a UAS and UAC
    
*   an upper one (implemented in b2b_logic module) - which represents the logic engine of B2BUA, responsible of actually implementing the B2BUA services using the functions offered by the low level.
    
This module is a B2BUA upper level implementation that can be used along with the b2b_entities module in order to provide various B2BUA services (eg. PBX features). The actual logic of the B2BUA scenarios can be implemented in dedicated script routes.

A B2B session can be triggered in two ways:

*   from the script - at the receipt of an initial INVITE message
*   with an extern command (MI) command - the server will connect two end points in a session(Third Party Call Control).

High Availability for B2B sessions can be achieved by enabling the clustering support offered by the the lower b2b_entities module (by setting the cluster_id modparam from b2b_entities).

## How It Works

After initializing a B2B session, the call legs will be handled by the b2b_logic module and the first step will be to put the two initial entities in contact. Requests and replies belonging to these dialogs will not enter the script through the standard OpenSIPS routes but instead will be handled in b2b_logic dedicated routes (defined through the script_req_route and script_reply_route modparams or, the custom routes given as parameters to b2b_init_request()). The further steps of the scenario can be implemented in these routes, by calling dedicated b2b_logic script functions in order to perform various actions. Normal "proxy-like" OpenSIPS functions should not be executed in the b2b_logic routes.

Some messages will be handled automatically by the module and will not enter the b2b_logic routes at all (BYE requests received while in the process of bridging two entities, ACKs/BYEs/replies for disconnected entities). Also, if no dedicated b2b_logic reply route is defined, replies will be handled internally by the module, with the same effects as calling b2b_handle_reply() from such a route if it were defined.

## Dependencies

### OpenSIPs Modules

- `b2b_entities`
- `db module`

### External Libraries

None.

## Exported Parameters

### `b2bl_early_update` (integer)

Allow bridging of calls in early stage by issuing a "UPDATE" request

*   0 - Do not bridge dialogs in early stage
*   1 - Try to update an session in early stage by sending an UPDATE

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("b2b_logic", "b2bl_early_update", 1)
```
### `b2bl_from_spec_param` (string)

The name of the pseudo variable for storing the new “From” header. The PV must be set before calling “b2b_init_request”.

*Default value is NULL (disabled).*

**Example.** Set the `b2bl_from_spec_param` parameter.

```opensips
...
modparam("b2b_logic", "b2bl_from_spec_param", "$var(b2bl_from)")
...
route{
	...
	# setting the From header
	$var(b2bl_from) = "\\"Call ID\\" <sip:user@opensips.org>";
	...
	b2b_init_request("top hiding");
	...
}
```
### `b2bl_th_init_timeout` (integer)

Call setup timeout for topology hiding scenario.

*Default value is 60.*

**Example.** 60.

```opensips
modparam("b2b_logic", "b2bl_th_init_timeout", 60)
```
### `cachedb_key_prefix` (string)

Prefix to use for every key set in the NoSQL database.

*Default value is b2bl$.*

**Example.** b2b.

```opensips
modparam("b2b_logic", "cachedb_key_prefix", "b2b")
```
### `cachedb_url` (string)

URL of a NoSQL database to be used. Only Redis is supported at the moment.

**Example.** redis://localhost:6379/.

```opensips
modparam("b2b_logic", "cachedb_url", "redis://localhost:6379/")
```
### `cleanup_period` (integer)

The time interval at which to search for an hanged b2b context. A session is considered expired if the duration of a session exceeds its defined lifetime. At that moment, BYE is sent in all the dialogs from that context and the context is deleted.

*Default value is 100.*

**Example.** 60.

```opensips
...
modparam("b2b_logic", "cleanup_period", 60)
...
```
### `contact_user` (integer)

If set to 1, adds user from From: header to generated Contact:

*Default value is 0.*

**Example.** Set the `contact_user` parameter.

```opensips
modparam("b2b_logic", "contact_user", 1)
```
### `custom_headers` (string)

A list of SIP header names delimited by ';' that should be passed from the dialog of one side to the other side. There are a number of headers that are passed by default. They are:

*   Max-Forwards (it is decreased by 1)
*   Content-Type
*   Supported
*   Allow
*   Proxy-Require
*   Session-Expires
*   Min-SE
*   Require
*   RSeq

If you wish some other headers to be passed also you should define them by setting this parameter.

*Default value is NULL.*

**Example.** User-Agent;Date.

```opensips
modparam("b2b_logic", "custom_headers", "User-Agent;Date")
```
### `custom_headers_regexp` (string)

Regexp to search SIP header by names that should be passed from the dialog of one side to the other side. There are a number of headers that are passed by default. They are: Max-Forwards (it is decreased by 1), Content-Type, Supported, Allow, Proxy-Require, Session-Expires, Min-SE, Require, RSeq. If you wish some other headers to be passed also you should define them by setting this parameter. It can be in forms like "regexp", "/regexp/" and "/regexp/flags". Meaning of the flags is as follows: i - Case insensitive search. e - Use extended regexp.

*Default value is NULL.*

**Possible values:**

- regexp
- /regexp/
- /regexp/flags

**Example.** /^x-/i.

```opensips
...
modparam("b2b_logic", "custom_headers_regexp", "/^x-/i")
...
```
### `db_mode` (integer)

The B2B modules have support for the 3 type of database storage

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1
*   WRITE BACK (update in db from time to time) - set this parameter to 2

*Default value is 2.*

**Possible values:**

- 0
- 1
- 2

**Example.** 1.

```opensips
modparam("b2b_logic", "db_mode", 1)
```
### `db_table` (string)

Name of the database table to be used

*Default value is b2b_logic.*

**Example.** some_table_name.

```opensips
modparam("b2b_logic", "db_table", "some_table_name")
```
### `db_url` (string)

Database URL.

**Example.** mysql://opensips:opensipsrw@127.0.0.1/opensips.

```opensips
modparam("b2b_logic", "db_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips")
```
### `hash_size` (integer)

The size of the hash table that stores the session entities.

*Default value is 9.*

**Example.** 10.

```opensips
...
modparam("b2b_logic", "hash_size", 10)
...
```
### `init_callid_hdr` (string)

The module offers the possibility to insert the original callid in a header in the generated Invites. If you want this, set this parameter to the name of the header in which to insert the original callid.

**Example.** Set the `init_callid_hdr` parameter.

```opensips
modparam("b2b_logic", "init_callid_hdr", "Init-CallID")
```
### `max_duration` (integer)

The maximum duration of a call.

*Default value is 12 * 3600 (12 hours).*

**Notes:** If you set it to 0, there will be no limitation.

**Example.** Set the `max_duration` parameter.

```opensips
modparam("b2b_logic", "max_duration", 7200)
```
### `old_entity_term_delay` (integer)

When the _b2b_bridge_request_ is being used with the _late_bye_ flag, this parameter can delay the moment when the BYE is being sent to the terminating entity. Thus, instead of terminating it when the new entity is established, the BYE is delayed with the value of this param, expressed in seconds.

*Default value is 0.*

**Example.** 2.

```opensips
modparam("b2b_logic", "old_entity_term_delay", 2) # delay the BYE with 2 seconds
```
### `script_reply_route` (string)

The name of the script route to be called when replies belonging to an ongoing B2B session are received.

**Example.** b2b_reply.

```opensips
...
modparam("b2b_logic", "script_reply_route", "b2b_reply")
...
```
### `script_req_route` (string)

The name of the script route to be called when requests belonging to an ongoing B2B session are received.

**Example.** b2b_request.

```opensips
...
modparam("b2b_logic", "script_req_route", "b2b_request")
...
```
### `server_address` (string)

The IP address of the machine that will be used as Contact in the generated messages. This is compulsory only when OpenSIPS starts a call from the middle. For scenarios triggered by received calls, if it is not set, it is constructed dynamically from the socket where the initiating request was received. This socket will be used to send all the requests, replies for that session. This parameter support Pseudo-Variables.

**Example.** Set the `server_address` parameter.

```opensips
modparam("b2b_logic", "server_address", "sip:sa@10.10.10.10:5060")
```
### `update_period` (integer)

The time interval at which to update the info in database.

*Default value is 100.*

**Example.** 60.

```opensips
modparam("b2b_logic", "update_period", 60)
```

## Exported Functions

### `b2b_bridge(entity1, entity2, [provmedia_uri], [flags])`

This function bridges two entities, in the context of an existing B2B session (the initial entities are already connected). At least one of the two entities has to be a new client entity.

**Parameters:**

- `entity1` *(string, required)* — ID of the first entity to bridge; the special values: peer and this can also be used to refer to existing entities.
  - `peer`
  - `this`
- `entity2` *(string, required)* — ID of the second entity to bridge; the special values: peer and this can also be used to refer to existing entities.
  - `peer`
  - `this`
- `flags` *(string, optional)* — CSV list of the following flags: max_duration=[nn] - Maximum duration of the B2B session. notify - Enable rfc3515 NOTIFY to inform the agent sending the REFER of the status of the reference. rollback-failed - Rollback call to state before bridging in case of transfer failed. hold - Put the old entity on hold before bridging it to the new entity. no-late-sdp - Do not attempt late SDP negociation with the new entity.
  - `max_duration=[nn]`
  - `notify`
  - `rollback-failed`
  - `hold`
  - `no-late-sdp`
- `provmedia_uri` *(string, optional)* — URI of the provisional media server to be connected with the caller while the callee answers.

**Usable from:** b2b_logic request routes

**Example.** b2b_bridge usage.

```opensips
...
route[b2b_logic_request] {
   ...
   b2b_client_new("client2", $hdr(Refer-To));

   b2b_bridge("peer", "client2");
}
...
```

### `b2b_bridge_request(b2bl_key,entity_no, [adv_contact], [flags])`

This function will bridge an initial INVITE with one of the particapnts from an existing b2b session.

**Parameters:**

- `adv_contact` *(string, optional)* — Contact header to advertise in generated messages.
- `b2bl_key` *(string, required)* — a string that contains the b2b_logic key. The key can also be in the form of callid;from-tag;to-tag.
- `entity_no` *(int, required)* — an integer that holds the entity of the entity/participant to bridge.
- `flags` *(string, optional)* — Flags that can modify the behavior of the function. Available flags are:
* late_bye - instead of terminating the replaced entity on the stop, leave it pending until the new enity fully establishes.
  - `late_bye`

**Example.** b2b_bridge_request usage.

```opensips
...
if ($rU == "pickup") {
    # get the b2b logic key of the parked call for this user
    cache_fetch("local", "$fU", $var(b2bl_key));
    cache_remove("local", "$fU");

    if ($var(b2bl_key) != NULL)
        b2b_bridge_request($var(b2bl_key), 0);
    else
        send_reply(481, "Call/Transaction Does Not Exist");

    exit;
}
...

```

### `b2b_bridge_retry(new_entity)`

This function can be used to retry a failed bridging action by contacting a new destination. A new client entity must be created before running this function with b2b_client_new().

**Parameters:**

- `new_entity` *(string, required)* — ID of the new entity to bridge.

**Usable from:** b2b_logic reply route

**Related:**

- `b2b_client_new`

**Example.** b2b_bridge usage.

```opensips
...
route[b2b_logic_reply] {
   ...
   if ($b2b_logic.entity(id) == "client1" && $rm == "INVITE" && $rs >= 300) {
      b2b_client_new("client_retry", "sip:alice@opensips.org");

      b2b_bridge_retry("client_retry");
   } else {
      b2b_handle_reply();
   }
   ...
}
...
```

### `b2b_client_new(id, dest_uri, [proxy], [from_dname], [adv_contact], [extra_hdrs], [extra_hdr_bodies])`

This function creates a new client entity (dialog where OpenSIPS acts as a UAC) to be used for initializing a new B2B session or for a bridge action. The function can be used before calling b2b_init_request() or b2b_bridge().

**Parameters:**

- `adv_contact` *(string, optional)* — Contact header to advertise in generated messages.
- `dest_uri` *(string, required)* — URI of the new destination.
- `extra_hdr_bodies` *(var, optional)* — AVP variable holding a list of extra header bodies (corresponding to the headers given in the extra_hdrs parameter) to be added for any request sent to this entity.
- `extra_hdrs` *(var, optional)* — AVP variable holding a list of extra headers (the header names) to be added for any request sent to this entity.
- `from_dname` *(string, optional)* — Display name to use in the From header.
- `id` *(string, required)* — ID used to reference this entity in further B2B actions.
- `proxy` *(string, optional)* — URI of the outbound proxy to send the INVITE to.

**Usable from:** REQUEST_ROUTE, b2b_logic request routes

**Related:**

- `b2b_bridge`
- `b2b_init_request`

**Example.** b2b_client_new usage.

```opensips
...
b2b_client_new("client1", "sip:alice@opensips.org");
...
```

### `b2b_delete_entity()`

This function deletes the entity that sent the current request.

**Usable from:** b2b_logic request routes

**Example.** b2b_delete_entity usage.

```opensips
...
route[b2b_logic_request] {
   if ($rm == "BYE") {
      b2b_send_reply(200, "OK");
      b2b_delete_entity();
      ...
   }
}
...

```

### `b2b_end_dlg_leg()`

This function sends a BYE request to the entity that sent the current request. It is not required to also call b2b_delete_entity() in order to delete the current entity.

**Usable from:** b2b_logic request routes, b2b_logic reply routes

**Related:**

- `b2b_delete_entity`

**Example.** b2b_end_dlg_leg usage.

```opensips
...
route[b2b_logic_request] {
   if ($rm == "REFER") {
      b2b_send_reply(202, "Accepted");
      b2b_end_dlg_leg();
   }
}
...

```

### `b2b_handle_reply()`

This function processes the received reply by taking the appropriate actions for the current state of the ongoing B2B session (pass reply to peer, send INVITE or ACK to comeplete an ongoing bridge action etc.). The function should be called for all replies, if a b2b_logic reply route is defined.

**Usable from:** b2b_logic reply routes

**Example.** b2b_handle_reply usage.

```opensips
...
route[b2b_logic_reply] {
    xlog("B2B REPLY: [$rs $rm] from entity: $b2b_logic.entity(id)\n");
    b2b_handle_reply();
}
...

```

### `b2b_init_request(id, [flags], [req_route], [reply_route])`

This function initializes a new B2B session based on an initial INVITE. A new server entity and a new client entity must be created before running this function, with b2b_server_new() and b2b_client_new(), respectively. These are the initial entities to be connected and further scenario logic can be implemented in the b2b_logic dedicated routes.

Note: If you have a multi interface setup and want to change the outbound interface, it is mandatory to use the "force_send_socket()" core function before passing control to b2b function. If you do not do it, the requests may be correctly routed, but the SIP pacakge may be invalid (as Contact, Via, etc).

**Parameters:**

- `flags` *(string, optional)* — CSV list of the following flags: setup-timeout=[nn] - Call setup timeout. 0 sets timeout to max_duration value. Example: "setup-timeout=300". transparent-auth - Transparent authentication. In this mode b2b passes your 401 or 407 authentication request to destination server. preserve-to - Preserve To: header.
  - `setup-timeout=[nn]`
  - `transparent-auth`
  - `preserve-to`
- `id` *(string, required)* — identifier for the scenario of this B2B session. The special value top hiding initializes an internal topology hiding scenario. This scenario will do a simple pass-through of messages from one side to another, and no additional scripting or dedicated routes are required.
- `reply_route` *(string, optional)* — name of the script route to be called when replies belonging to this B2B session are received. This parameter will override the global script_reply_route modparam for this particular B2B session.
- `req_route` *(string, optional)* — name of the script route to be called when requests belonging to this B2B session are received. This parameter will override the global script_req_route modparam for this particular B2B session.

**Usable from:** REQUEST_ROUTE

**Related:**

- `b2b_client_new`
- `b2b_server_new`

**Example.** b2b_init_request usage.

```opensips
...
if(is_method("INVITE") && !has_totag() && prepaid_user()) {
   ...
   # create initial entities
   b2b_server_new("server1");
   b2b_client_new("client1", $var(media_uri));

   # initialize B2B session
   b2b_init_request("prepaid");
   exit;
}
...
```

### `b2b_pass_request()`

This function passes a request belonging to an existing B2B session to the peer entity. The function should be called for all requests unless a different action is required to implement the scenario logic (eg. a bridge action).

**Usable from:** b2b_logic request routes

**Example.** b2b_pass_request usage.

```opensips
...
route[b2b_logic_request] {
   if ($rm != "BYE") {
      b2b_pass_request();
      exit;
   } else {
      # delete the current entity and bridge the peer to a new one
   }
...

```

### `b2b_send_reply(code, reason[, headers[, body]])`

This function sends a reply to the entity that sent the current request.

**Parameters:**

- `body` *(string, optional)* — message body
- `code` *(int, required)* — reply code
- `headers` *(string, optional)* — additional headers
- `reason` *(string, required)* — reply reason string

**Usable from:** b2b_logic request routes

**Example.** b2b_send_reply usage.

```opensips
...
route[b2b_logic_request] {
   if ($rm == "REFER") {
      b2b_send_reply(202, "Accepted");
      ...
   }
}
...

```

### `b2b_server_new(id, [adv_contact], [extra_hdrs], [extra_hdr_bodies])`

This function creates a new server entity (dialog where OpenSIPS acts as a UAS) to be used for initializing a new B2B session. It should only be used for initial INVITES, before calling b2b_init_request().

**Parameters:**

- `adv_contact` *(string, optional)* — Contact header to advertise in generated messages.
- `extra_hdr_bodies` *(var, optional)* — AVP variable holding a list of extra header bodies (corresponding to the headers given in the extra_hdrs parameter) to be added for any request sent to this entity.
- `extra_hdrs` *(var, optional)* — AVP variable holding a list of extra headers (the header names) to be added for any request sent to this entity.
- `id` *(string, required)* — ID used to reference this entity in further B2B actions.

**Usable from:** REQUEST_ROUTE

**Related:**

- `b2b_init_request`

**Example.** b2b_server_new usage.

```opensips
...
if(is_method("INVITE") && !has_totag()) {
   b2b_server_new("server1", $avp(b2b_hdrs), $avp(b2b_hdr_bodies));
   ...
}
...
```

### `b2b_trigger_scenario(scenario, [params], peer1, [extra_headers_peer1], [extra_headers_contents_peer1], peer2 [extra_headers_peer2], [extra_headers_contents_peer2])`

This function triggers a certain scenario from routing script, e.g. out-of-dialog REFERs.

**Parameters:**

- `extra_headers_contents_peer1` *(var, optional)* — AVP variable holding a list of extra header bodies (corresponding to the headers given in the extra_headers_peer1 parameter) to be added for any request sent for the first entity.
- `extra_headers_contents_peer2` *(var, optional)* — AVP variable holding a list of extra header bodies (corresponding to the headers given in the extra_headers_peer2 parameter) to be added for any request sent for the second entity.
- `extra_headers_peer1` *(var, optional)* — AVP variable holding a list of extra headers (the header names) to be added for any request sent for the first entity.
- `extra_headers_peer2` *(var, optional)* — AVP variable holding a list of extra headers (the header names) to be added for any request sent for the second entity.
- `params` *(string, optional)* — Parameters to be used in this scenario (optionally as CSV)
  - `n`
  - `session key (string, optional)`
  - `party of remote session (int, optional)`
- `peer1` *(string, required)* — Parameters to define the A-Party of the triggered scenario
* entitiy_name (string) - Name of the entity
* RURI (string) - R-URI of the entity to contact
* Proxy (string, optional) - Outbound Proxy to be used for this entity
* Display-Name (string, optional) - Display Name to be used for this entity
- `peer2` *(string, required)* — Parameters to define the B-Party of the triggered scenario. The format is identitical to the definition of peer1.
- `scenario` *(string, required)* — Name of the scenario to be triggered.

**Usable from:** REQUEST_ROUTE

**Example.** b2b_trigger_scenario usage.

```opensips
...
if(is_method("REFER") && !has_totag()) {
   $avp(header) = "Replaces";
   $avp(header_content) = "call-id=xyz";
   b2b_trigger_scenario("refer", "n", "conf,sip:conference@10.0.0.1", $avp(header), $avp(header_content), "callee,sip:user@10.0.0.1,sip:10.0.0.1");
   ...
}
...

```

## Exported Pseudo-Variables

### `$b2b_logic.ctx(key)`

This is a read-write variable that provides access to a custom Key-Value storage(of string values) in the context of the ongoing B2B session. The variable can be used in request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules. In the main request route the variable can be used for storing a new context value even before instantiating the scenario with b2b_init_request(). Setting the variable to NULL will delete the value at the given key.

- **Type:** string
- **Read/write:** read-write
- **Scope:** request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules
### `$b2b_logic.entity(field)[idx]`

This is a read-only variable that returns information about the entities(dialogs) involved in the ongoing B2B session. The available entity information is: the Call-ID of the dialog, accessible by using the callid subname; the entity key, accessible by using the key subname or no subname at all. the entity ID, accessible by using the id subname. the From-Tag of the dialog, accessible by using the fromtag subname. the To-Tag of the dialog, accessible by using the totag subname. The index is used to select which entity from the B2B session to refer to. The only possible values are 0 or 1 and correspond to the positions of the entities in the scenario. Initially, this depends on the order in which the entities are created. In the case of the internal topology hiding scenario, 0 is the caller and 1 is the callee. When a further bridge action happens, the bridged entity is always placed on the 0 index and the new entity on 1. If no index is provided, the variable will refer to the entity(dialog) which the current SIP message belongs to. The variable can be used in request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules

**Possible values:**

- callid
- key
- id
- fromtag
- totag
### `$b2b_logic.key`

This is a read-only variable that returns the b2b_logic key of the ongoing B2B session. The variable can be used in request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules
### `$b2b_logic.scenario(key)`

This is a read-only variable that returns the scenario ID of the ongoing B2B session. The variable can be used in request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request route, local_route and the dedicated routes defined through the b2b_entities and b2b_logic modules

## Exported MI Functions

### `b2b_bridge`

This command can be used by an external application to tell B2BUA to bridge a call party from an on going dialog to another destination. By default the caller is bridged to the new uri and BYE is set to the callee. You can instead bridge the callee if you send 1 as the third parameter.

**Parameters:**

- `dialog_id` *(string, required)* — the b2b_logic key, or the callid;from-tag;to-tag of the ongoing dialog.
- `flag` *(string, optional)* — used to specify that the callee must be bridged to the new destination. If not present the caller will be bridged. Possible values are '0' or '1'.
- `new_uri` *(string, required)* — the uri of the new destination
- `prov_media_uri` *(string, optional)* — the uri of a media server able to play provisional media starting from the beginning of the bridging scenario to the end of it. It is optional. If not present, no other entity will be envolved in the bridging scenario

**Example.**

```opensips-cli
opensips-cli -x mi b2b_bridge 1020.30 sip:alice@opensips.org
```

### `b2b_list`

This command can be used to list the internals of b2b_logic entities.

**Example.**

```opensips-cli
opensips-cli -x mi b2b_list
```

### `b2b_terminate_call`

Terminates an ongoing B2B session.

**Parameters:**

- `key` *(string, required)* — the b2b_logic key or the callid;from-tag;to-tag of one of call legs of the ongoing session.

**Example.**

```opensips-cli
opensips-cli -x mi b2b_terminate_call 159.0
```

### `b2b_trigger_scenario`

This command initializes a new B2B session where OpenSIPS will start a call from the middle. The initial entities to be connected are specified through the command's parameters and further scenario logic can be implemented in the b2b_logic dedicated routes.

**Parameters:**

- `context` *(array, optional)* — array of B2B context values, in the format: key=value
- `entity1` *(string, required)* — first entity to be connected; specified in the following format: id,dest_uri[,from_dname] where: id - ID used to reference this entity in further B2B actions; dest_uri - URI of the new destination; from_dname (optional) - Display name to use in the From header.
- `entity2` *(string, required)* — second entity to be connected; specified in the same format as entity1
- `senario_id` *(string, required)* — ID for the scenario of this B2B session.

**Example.**

```opensips-cli
opensips-cli -x mi b2b_trigger_scenario marketing client1,sip:bob@opensips.org client2,sip:322@opensips.org:5070 agent_uri=sip:alice@opensips.org
```

## Configuration Examples

### Set `server_hsize` parameter

The size of the hash table that stores the session entities.

```opensips
...
modparam("b2b_logic", "hash_size", 10)
...
```
### Set `script_req_route` parameter

The name of the script route to be called when requests belonging to an ongoing B2B session are received.

```opensips
...
modparam("b2b_logic", "script_req_route", "b2b_request")
...
```
### Set `script_repl_route` parameter

The name of the script route to be called when replies belonging to an ongoing B2B session are received.

```opensips
...
modparam("b2b_logic", "script_reply_route", "b2b_reply")
...
```
### Set `cleanup_period` parameter

The time interval at which to search for an hanged b2b context. A session is considered expired if the duration of a session exceeds its defined lifetime. At that moment, BYE is sent in all the dialogs from that context and the context is deleted.

```opensips
...
modparam("b2b_logic", "cleanup_period", 60)
...
```
### Set parameter

Regexp to search SIP header by names that should be passed from the dialog of one side to the other side.

```opensips
...
modparam("b2b_logic", "custom_headers_regexp", "/^x-/i")
...
```
### Set parameter

A list of SIP header names delimited by ';' that should be passed from the dialog of one side to the other side.

```opensips
...
modparam("b2b_logic", "custom_headers", "User-Agent;Date")
...
```
### Set `db_url` parameter

Database URL.

```opensips
...
modparam("b2b_logic", "db_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
```
### Set `cachedb_url` parameter

URL of a NoSQL database to be used. Only Redis is supported at the moment.

```opensips
...
modparam("b2b_logic", "cachedb_url", "redis://localhost:6379/")
...
```
### Set `cachedb_key_prefix` parameter

Prefix to use for every key set in the NoSQL database.

```opensips
...
modparam("b2b_logic", "cachedb_key_prefix", "b2b")
...
```
### Set `update_period` parameter

The time interval at which to update the info in database.

```opensips
...
modparam("b2b_logic", "update_period", 60)
...
```
### Set `max_duration` parameter

The maximum duration of a call.

```opensips
...
modparam("b2b_logic", "max_duration", 7200)
...
```
### Set `contact_user` parameter

If set to 1, adds user from From: header to generated Contact:

```opensips
...
modparam("b2b_logic", "contact_user", 1)
...
```
### Set `b2bl_from_spec_param` parameter

The name of the pseudo variable for storing the new “From” header. The PV must be set before calling “b2b_init_request”.

```opensips
...
modparam("b2b_logic", "b2bl_from_spec_param", "$var(b2bl_from)")
...
route{
	...
	# setting the From header
	$var(b2bl_from) = "\"Call ID\" <sip:user@opensips.org>";
	...
	b2b_init_request("top hiding");
	...
}
```
### Set `server_address` parameter

The IP address of the machine that will be used as Contact in the generated messages. This is compulsory only when OpenSIPS starts a call from the middle.

```opensips
...
modparam("b2b_logic", "server_address", "sip:sa@10.10.10.10:5060")
...
```
### Set `server_address` parameter using Pseudo-Variables

The IP address of the machine that will be used as Contact in the generated messages. This parameter support Pseudo-Variables.

```opensips
...
modparam("b2b_logic", "server_address", "sip:$socket_in(advertised_ip):$socket_in(advertised_port)")
...
```
### Set `init_callid_hdr` parameter

The module offers the possibility to insert the original callid in a header in the generated Invites.

```opensips
...
modparam("b2b_logic", "init_callid_hdr", "Init-CallID")
...
```
### Set `db_mode` parameter

The B2B modules have support for the 3 type of database storage

```opensips
...
modparam("b2b_logic", "db_mode", 1)
...
```
### Set `db_table` parameter

Name of the database table to be used

```opensips
...
modparam("b2b_logic", "db_table", "some_table_name")
...
```
### Set `b2bl_th_init_timeout` parameter

Call setup timeout for topology hiding scenario.

```opensips
...
modparam("b2b_logic", "b2bl_th_init_timeout", 60)
...
```
### Set `b2bl_early_update` parameter

Allow bridging of calls in early stage by issuing a "UPDATE" request

```opensips
...
modparam("b2b_logic", "b2bl_early_update", 1)
...
```
### Set `old_entity_term_delay` parameter

When the _b2b_bridge_request_ is being used with the _late_bye_ flag, this parameter can delay the moment when the BYE is being sent to the terminating entity.

```opensips
...
modparam("b2b_logic", "old_entity_term_delay", 2) # delay the BYE with 2 seconds
...
```
### `b2b_init_request` usage

This function initializes a new B2B session based on an initial INVITE. A new server entity and a new client entity must be created before running this function.

```opensips
...
if(is_method("INVITE") && !has_totag() && prepaid_user()) {
   ...
   # create initial entities
   b2b_server_new("server1");
   b2b_client_new("client1", $var(media_uri));

   # initialize B2B session
   b2b_init_request("prepaid");
   exit;
}
...
```
### `b2b_server_new` usage

This function creates a new server entity (dialog where OpenSIPS acts as a UAS) to be used for initializing a new B2B session.

```opensips
...
if(is_method("INVITE") && !has_totag()) {
   b2b_server_new("server1", $avp(b2b_hdrs), $avp(b2b_hdr_bodies));
   ...
}
...
```
### `b2b_client_new` usage

This function creates a new client entity (dialog where OpenSIPS acts as a UAC) to be used for initializing a new B2B session or for a bridge action.

```opensips
...
b2b_client_new("client1", "sip:alice@opensips.org");
...
```
### `b2b_bridge` usage

This function bridges two entities, in the context of an existing B2B session (the initial entities are already connected).

```opensips
...
route[b2b_logic_request] {
   ...
   b2b_client_new("client2", $hdr(Refer-To));

   b2b_bridge("peer", "client2");
}
...
```
### `b2b_bridge` usage

This function can be used to retry a failed bridging action by contacting a new destination.

```opensips
...
route[b2b_logic_reply] {
   ...
   if ($b2b_logic.entity(id) == "client1" && $rm == "INVITE" && $rs >= 300) {
      b2b_client_new("client_retry", "sip:alice@opensips.org");

      b2b_bridge_retry("client_retry");
   } else {
      b2b_handle_reply();
   }
   ...
}
...
```
### `b2b_pass_request` usage

This function passes a request belonging to an existing B2B session to the peer entity.

```opensips
...
route[b2b_logic_request] {
   if ($rm != "BYE") {
      b2b_pass_request();
      exit;
   } else {
      # delete the current entity and bridge the peer to a new one
   }
...
```
### `b2b_handle_reply` usage

This function processes the received reply by taking the appropriate actions for the current state of the ongoing B2B session.

```opensips
...
route[b2b_logic_reply] {
    xlog("B2B REPLY: [$rs $rm] from entity: $b2b_logic.entity(id)\n");
    b2b_handle_reply();
}
...
```
### `b2b_send_reply` usage

This function sends a reply to the entity that sent the current request.

```opensips
...
route[b2b_logic_request] {
   if ($rm == "REFER") {
      b2b_send_reply(202, "Accepted");
      ...
   }
}
...
```
### `b2b_delete_entity` usage

This function deletes the entity that sent the current request.

```opensips
...
route[b2b_logic_request] {
   if ($rm == "BYE") {
      b2b_send_reply(200, "OK");
      b2b_delete_entity();
      ...
   }
}
...
```
### `b2b_end_dlg_leg` usage

This function sends a BYE request to the entity that sent the current request.

```opensips
...
route[b2b_logic_request] {
   if ($rm == "REFER") {
      b2b_send_reply(202, "Accepted");
      b2b_end_dlg_leg();
   }
}
...
```
### `b2b_bridge_request` usage

This function will bridge an initial INVITE with one of the particapnts from an existing b2b session.

```opensips
...
if ($rU == "pickup") {
    # get the b2b logic key of the parked call for this user
    cache_fetch("local", "$fU", $var(b2bl_key));
    cache_remove("local", "$fU");

    if ($var(b2bl_key) != NULL)
        b2b_bridge_request($var(b2bl_key), 0);
    else
        send_reply(481, "Call/Transaction Does Not Exist");

    exit;
}
...
```
### `b2b_trigger_scenario` usage

This function triggers a certain scenario from routing script, e.g. out-of-dialog REFERs.

```opensips
...
if(is_method("REFER") && !has_totag()) {
   $avp(header) = "Replaces";
   $avp(header_content) = "call-id=xyz";
   b2b_trigger_scenario("refer", "n", "conf,sip:conference@10.0.0.1", $avp(header), $avp(header_content), "callee,sip:user@10.0.0.1,sip:10.0.0.1");
   ...
}
...
```
### `$b2b_logic.key` usage

This is a read-only variable that returns the b2b_logic key of the ongoing B2B session.

```opensips
...
local_route {
   ...
   if ($b2b_logic.key) {
      xlog("request belongs to B2B session: $b2b_logic.key\n");
      ...
   }
   ...
}
...
```
### `$b2b_logic.entity` usage

This is a read-only variable that returns information about the entities(dialogs) involved in the ongoing B2B session.

```opensips
...
modparam("b2b_entities", "script_request_route", "b2b_request")
...
route[b2b_request] {
   ...
   xlog("received request for entity: $b2b_logic.entity\n");
   ...
   if ($rm == "BYE" && $b2b_logic.entity == $(b2b_logic.entity[1]))
      xlog("Disconnecting callee\n")
   ...
}
...
```
### `$b2b_logic.ctx` usage

This is a read-write variable that provides access to a custom Key-Value storage(of string values) in the context of the ongoing B2B session.

```opensips
...
modparam("b2b_entities", "script_reply_route", "b2b_reply")
...
route {
   ...
   b2b_init_request("prepaid", "sip:alice@127.0.0.1");

   $b2b_logic.ctx(my_extra_info) = "my_value";
   ...
}
...
route[b2b_reply] {
   ...
   xlog("my info: $b2b_logic.ctx(my_extra_info)\n");
   ...
}
...
```
### `$b2b_logic.scenario` usage

This is a read-only variable that returns the scenario ID of the ongoing B2B session

```opensips
...
route[b2b_logic_request] {
   if ($b2b_logic.scenario == "prepaid") {
      route(prepaid);
   } else {
      route(marketing);
   }
}
...
```
