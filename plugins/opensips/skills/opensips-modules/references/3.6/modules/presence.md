# presence Module Reference
<!-- generated-from: data/3.6/modules/presence.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 presence module. Read this file when configuring or debugging the presence module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The modules handles PUBLISH and SUBSCRIBE messages and generates NOTIFY messages in a general, event independent way. It allows registering events from other OpenSIPS modules. Events that can currently be added are:

*   _presence_, _presence.winfo_, _dialog;sla_ from presence_xml module
    
*   _message-summary_ from presence_mwi module
    
*   _call-info_, _line-seize_ from presence_callinfo module
    
*   _dialog_ from presence_dialoginfo module
    
*   _xcap-diff_ from presence_xcapdiff module
    
*   _as-feature-event_ from presence_dfks module

The module uses database storage. It has later been improved with memory caching operations to improve performance. The Subscribe dialog information are stored in memory and are periodically updated in database, while for Publish only the presence or absence of stored info for a certain resource is maintained in memory to avoid unnecessary, costly db operations. It is possible to configure a fallback to database mode(by setting module parameter "fallback2db"). In this mode, in case a searched record is not found in cache, the search is continued in database. This is useful for an architecture in which processing and memory load might be divided on more machines using the same database.

The module can also work only with the functionality of a library, with no message processing and generation, but used only for the exported functions. This mode of operation is enabled if the db_url parameter is not set to any value.

The server follows the specifications in: RFC3265, RFC3856, RFC3857, RFC3858.

## How It Works

The modules handles PUBLISH and SUBSCRIBE messages and generates NOTIFY messages in a general, event independent way. It allows registering events from other OpenSIPS modules. Events that can currently be added are:

*   _presence_, _presence.winfo_, _dialog;sla_ from presence_xml module
    
*   _message-summary_ from presence_mwi module
    
*   _call-info_, _line-seize_ from presence_callinfo module
    
*   _dialog_ from presence_dialoginfo module
    
*   _xcap-diff_ from presence_xcapdiff module
    
*   _as-feature-event_ from presence_dfks module

The module uses database storage. It has later been improved with memory caching operations to improve performance. The Subscribe dialog information are stored in memory and are periodically updated in database, while for Publish only the presence or absence of stored info for a certain resource is maintained in memory to avoid unnecessary, costly db operations. It is possible to configure a fallback to database mode(by setting module parameter "fallback2db"). In this mode, in case a searched record is not found in cache, the search is continued in database. This is useful for an architecture in which processing and memory load might be divided on more machines using the same database.

The module can also work only with the functionality of a library, with no message processing and generation, but used only for the exported functions. This mode of operation is enabled if the db_url parameter is not set to any value.

The server follows the specifications in: RFC3265, RFC3856, RFC3857, RFC3858.

## Dependencies

### OpenSIPs Modules

- `a database module`
- `clusterer` — if the cluster_id module parameter is set and clustering support activated. (optional)
- `signaling`

### External Libraries

- `libxml-dev`

## Exported Parameters

### `active_watchers_table` (string)

The name of the db table where active subscription information are stored.

*Default value is active_watchers.*

**Example.** active_watchers.

```opensips
...
modparam("presence", "active_watchers_table", "active_watchers")
...
```
### `bla_fix_remote_target` (integer)

Polycom has a bug in the bla implementation. It inserts the remote IP contact in the Notify body and when a phone picks up a call put on hold by another phone in the same BLA group, it sends an Invite directly to the remote IP. OpenSIPS BLA server tries to prevent this by replacing the IP contact with the domain, when this is possible.

In some cases(configurations) however this is not desirable, so this parameter was introduced to disable this behaviour when needed.

*Default value is 1.*

**Example.** Set the `bla_fix_remote_target` parameter.

```opensips
modparam("presence", "bla\_fix\_remote\_target", 0)
```
### `bla_presentity_spec` (string)

By default the presentity uri for BLA subscribes (event=dialog;sla) is computed from contact username + from domain. In some cases though, this way of computing the presentity might not be right (for example if you have a SBC in front that masquerades the contact). So we added this parameter that allows defining a custom uri to be used as presentity uri for BLA subscribes. You should set this parameter to the name of a pseudovariable and then set this pseudovariable to the desired URI before calling the [handle\_subscribe()](#func_handle_subscribe "1.5.2.� handle_subscribe([force_active] [,sharing_tag])") function.

*Default value is NULL.*

**Example.** Set the `bla_presentity_spec` parameter.

```opensips
modparam("presence", "bla\_presentity\_spec", "$var(bla\_pres)")
```
### `clean_period` (integer)

The period at which to clean the expired subscription dialogs.

*Default value is 100.*

**Notes:** A zero or negative value disables this activity.

**Example.** Set the `clean_period` parameter.

```opensips
modparam("presence", "clean\_period", 100)
```
### `cluster_be_active_shtag` (string)

The name of a cluster sharing tag to be used to indicate when this node (as part of the cluster) should be active or not. If the sharing tag is off (or as backup), the node will become inactive from clustering perspective, meaning not sending and not accepting any presence related cluster traffic. This ability of a node to become inactive may be used when creating a federated cluster where 2 nodes are acting as a local active-backup setup (for local High Availability purposes). This parameter has meaning only in clustering mode. If not defined, the node will be active all the time. For more on presence clustering see the Section 1.2, “Presence clustering” chapter.

*Default value is empty (not tag define).*

**Example.** local_ha.

```opensips
modparam("presence", "cluster\_be\_active\_shtag" ,"local\_ha")
```
### `cluster_federation_mode` (string)

When enabling the federation mode, nodes inside the presence cluster will start broadcasting the data to other nodes via the clustering support.

If you don't want to use a shared database (via [fallback2db](#param_fallback2db "1.4.2.�fallback2db (int)"), but still want a complete data set everywhere, you may choose mode _full-sharing_. This mode allows you to switch PUBLISH endpoints, even for already published Event States, thus allowing you to add and remove presence servers without losing state.

For more on presence clustering see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter.

*Default value is disabled.*

**Possible values:**

- disabled
- on-demand-sharing
- full-sharing

**Example.** full-sharing.

```opensips
modparam("presence", "cluster_federation_mode", "full-sharing")
```
### `cluster_id` (integer)

The ID of the cluster this presence server belongs to. This parameter is to be used only if clustering mode is needed. In order to understand th concept of a cluster ID, please see the _clusterer_ module.

This OpenSIPS cluster exposes the **"presence"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

For more on presence clustering see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter.

*Default value is None.*

**Example.** 2.

```opensips
modparam("presence", "cluster_id", 2)
```
### `cluster_pres_events` (string)

Comma Separated Value (CSV) list with the events to considered by the federated cluster - only presentities advertising one of these events will be broadcasted via the cluster.

For more on presence clustering see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter.

*Default value is empty (meaning all).*

**Example.** presence, dialog;sla, message-summary.

```opensips
modparam("presence", "cluster_pres_events" ,"presence, dialog;sla, message-summary")
```
### `contact_user` (string)

This is the username that will be used in the Contact header for the 200 OK replies to SUBSCRIBE and in the following in-dialog NOTIFY requests. The IP address, port and transport for the Contact will be automatically determined based on the interface where the SUBSCRIBE was received. If set to an empty string, no username will be added to the contact and the contact will be built just out of the IP, port and transport.

*Default value is presence.*

**Example.** presence.

```opensips
modparam("presence", "contact\_user", "presence")
```
### `db_update_period` (integer)

The period at which to synchronize cached subscriber info with the database.

*Default value is 100.*

**Notes:** A zero or negative value disables synchronization.

**Example.** Set the `db_update_period` parameter.

```opensips
modparam("presence", "db\_update\_period", 100)
```
### `db_url` (string)

The database url.
If set, the module is a fully operational presence server. Otherwise, it is used as a 'library', for its exported functions.

*Default value is NULL.*

**Example.** mysql://opensips:opensipsrw@192.168.2.132/opensips.

```opensips
modparam("presence", "db_url", 	"mysql://opensips:opensipsrw@192.168.2.132/opensips")
```
### `enable_sphere_check` (integer)

This parameter is a flag that should be set if permission rules include sphere checking. The sphere information is expected to be present in the RPID body published by the presentity. The flag is introduced as this check requires extra processing that should be avoided if this feature is not supported by the clients.

*Default value is 0.*

**Example.** Set the `enable_sphere_check` parameter.

```opensips
modparam("presence", "enable\_sphere\_check", 1)
```
### `end_sub_on_timeout` (integer)

If a presence subscription should be automatically terminated (destroyed) when receiving a SIP timeout (408) for a sent NOTIFY requests.

*Default value is 1.*

**Example.** Set the `end_sub_on_timeout` parameter.

```opensips
modparam("presence", "end\_sub\_on\_timeout", 0)
```
### `expires_offset` (integer)

The extra time to store a subscription/publication.

*Default value is 0.*

**Example.** 10.

```opensips
modparam("presence", "expires\_offset", 10)
```
### `fallback2db` (integer)

Setting this parameter enables a fallback to db mode of operation. In this mode, in case a searched record is not found in cache, the search is continued in database. Useful for an architecture in which processing and memory load might be divided on more machines using the same database.

**Example.** 1.

```opensips
modparam("presence", "fallback2db", 1)
```
### `max_expires_publish` (integer)

The the maximum admissible expires value for PUBLISH messages.

*Default value is 3600.*

**Example.** 3600.

```opensips
modparam("presence", "max\_expires\_publish", 3600)
```
### `max_expires_subscribe` (integer)

The the maximum admissible expires value for SUBSCRIBE messages.

*Default value is 3600.*

**Example.** 3600.

```opensips
modparam("presence", "max\_expires\_subscribe", 3600)
```
### `mix_dialog_presence` (integer)

This module parameter enables a very nice feature in the presence server - generating presence information from dialogs state. If this parameter is set, the presence server will tell you if a buddy is in a call even if his phone did not send a presence Publish with this information. You will need to load the dialoginfo modules, presence\_dialoginfo, pua\_dialoginfo, dialog and pua.

*Default value is 0.*

**Example.** Set the `mix_dialog_presence` parameter.

```opensips
modparam("presence", "mix\_dialog\_presence", 1)
```
### `notify_offline_body` (integer)

If this parameter is set, when no published info is found for a user, the presence server will generate a dummy body with status 'closed' and use it when sending Notify, instead of notifying with no body.

*Default value is 0.*

**Example.** Set the `notify_offline_body` parameter.

```opensips
modparam("presence", "notify\_offline\_body", 1)
```
### `pres_htable_size` (integer)

The size of the hash table to store publish records. This parameter will be used as the power of 2 when computing table size.

*Default value is 9 (512).*

**Example.** 11.

```opensips
...
modparam("presence", "pres_htable_size", 11)
...
```
### `presentity_table` (string)

The name of the db table where Publish information are stored.

*Default value is presentity.*

**Example.** Set the `presentity_table` parameter.

```opensips
modparam("presence", "presentity\_table", "presentity")
```
### `subs_htable_size` (integer)

The size of the hash table to store subscription dialogs. This parameter will be used as the power of 2 when computing table size.

*Default value is 9 (512).*

**Example.** 11.

```opensips
...
modparam("presence", "subs_htable_size", 11)
...
```
### `waiting_subs_daysno` (integer)

The number of days to keep the record of a subscription in server database if the subscription is in pending or waiting state (no authorization policy was defined for it or the target user did not register sice the subscription and was not informed about it).

*Default value is 3.*

*Valid range: up to 30.*

**Example.** Set the `waiting_subs_daysno` parameter.

```opensips
modparam("presence", "waiting\_subs\_daysno", 2)
```
### `watchers_table` (string)

The name of the db table where subscription states are stored.

*Default value is watchers.*

**Example.** watchers.

```opensips
...
modparam("presence", "watchers_table", "watchers")
...
```

## Exported Functions

### `handle_publish([sender_uri])`

The function handles PUBLISH requests. It stores and updates published information in database and calls functions to send NOTIFY messages when changes in the published information occur.

It may takes one optional string argument, the 'sender_uri' SIP URI. The parameter was added for enabling BLA implementation. If present, Notification of a change in published state is not sent to the respective uri even though a subscription exists. It should be taken from the Sender header. It was left at the decision of the administrator whether or not to transmit the content of this header as parameter for handle_publish, to prevent security problems.

**Parameters:**

- `sender_uri` *(string, optional)* — The 'sender_uri' SIP URI. The parameter was added for enabling BLA implementation. If present, Notification of a change in published state is not sent to the respective uri even though a subscription exists. It should be taken from the Sender header. It was left at the decision of the administrator whether or not to transmit the content of this header as parameter for handle_publish, to prevent security problems.

**Return codes:**

- `1` — if success
- `-1` — if error

**Usable from:** REQUEST_ROUTE

**Example.** handle_publish usage.

```opensips
...
if(is_method("PUBLISH"))
{
	if($hdr(Sender)!= NULL)
		handle_publish($hdr(Sender));
	else
		handle_publish();
} 
...
```

### `handle_subscribe([force_active] [,sharing_tag])`

This function is to be used for handling SUBSCRIBE requests. It stores or updates the watcher/subscriber information in database. Additionally, in response to initial SUBSCRIBE requests (creating a new subscription session), the function also sends back the NOTIFY (with the presence information) to the wathcer/subscriber.

**Parameters:**

- `force_active` *(int, optional)* — optional parameter that controls what is the default policy (of the presentity) on accepting new subscriptions (accept or reject) - of course, this parameter makes sense only when using a presence configuration with privacy rules enabled (force_active parameter in presence_xml module is not set).
  - `1`
- `sharing_tag` *(string, optional)* — optional parameter telling the owner tag (for the subscription) in clusetering scenarios where the subscription data is shared between multiple servers - see the Section 1.2, “Presence clustering” chapter for more details.

**Return codes:**

- `1` — if success
- `-1` — if error

**Usable from:** REQUEST_ROUTE

**Example.** Usage with force_active parameter.

```opensips
if($ru =~ "kphone@opensips.org")
	handle_subscribe(1);
```

**Example.** handle_subscribe usage.

```opensips
if($rm=="SUBSCRIBE")
    handle_subscribe();
```

## Exported Events

### `E_PRESENCE_EXPOSED`

This event is raised for each presentity exposeed by the _pres\_expose_.

**Parameters:**

- `user` *(string)* — the AOR of the user
- `domain` *(string)* — the domain
- `event` *(string)* — the type of the event published
- `expires` *(integer)* — the expire value of the publish
- `etag` *(string)* — the entity tag
- `old_etag` *(string)* — the entity tag to be refreshed
- `body` *(string)* — the body of the PUBLISH request
### `E_PRESENCE_PUBLISH`

This event is raised when the presence module receives a PUBLISH message.

**Parameters:**

- `user` *(string)* — the AOR of the user
- `domain` *(string)* — the domain
- `event` *(string)* — the type of the event published
- `expires` *(integer)* — the expire value of the publish
- `etag` *(string)* — the entity tag
- `old_etag` *(string)* — the entity tag to be refreshed
- `body` *(string)* — the body of the PUBLISH request

## Configuration Examples

### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("presence", "db\_url", 
	"mysql://opensips:opensipsrw@192.168.2.132/opensips")
...
```
### Set `fallback2db` parameter

Set `fallback2db` parameter

```opensips
...
modparam("presence", "fallback2db", 1)
...
```
### Set `cluster_id` parameter

Set `cluster_id` parameter

```opensips
...
modparam("presence", "cluster\_id", 2)
...
```
### Set `cluster_federation_mode` parameter

Set `cluster_federation_mode` parameter

```opensips
...
modparam("presence", "cluster\_federation\_mode", "full-sharing")
...
```
### Set `cluster_pres_events` parameter

Set `cluster_pres_events` parameter

```opensips
...
modparam("presence", "cluster\_pres\_events" ,"presence, dialog;sla, message-summary")
...
```
### Set `cluster_be_active_shtag` parameter

Set `cluster_be_active_shtag` parameter

```opensips
...
modparam("presence", "cluster\_be\_active\_shtag" ,"local\_ha")
...
```
### Set `expires_offset` parameter

Set `expires_offset` parameter

```opensips
...
modparam("presence", "expires\_offset", 10)
...
```
### Set `max_expires_subscribe` parameter

Set `max_expires_subscribe` parameter

```opensips
...
modparam("presence", "max\_expires\_subscribe", 3600)
...
```
### Set `max_expires_publish` parameter

Set `max_expires_publish` parameter

```opensips
...
modparam("presence", "max\_expires\_publish", 3600)
...
```
### Set `contact_user` parameter

Set `contact_user` parameter

```opensips
...
modparam("presence", "contact\_user", "presence")
...
```
### Set `enable_sphere_check` parameter

Set `enable_sphere_check` parameter

```opensips
...
modparam("presence", "enable\_sphere\_check", 1)
...
```
### Set `waiting_subs_daysno` parameter

Set `waiting_subs_daysno` parameter

```opensips
...
modparam("presence", "waiting\_subs\_daysno", 2)
...
```
### Set `mix_dialog_presence` parameter

Set `mix_dialog_presence` parameter

```opensips
...
modparam("presence", "mix\_dialog\_presence", 1)
...
```
### Set `bla_presentity_spec` parameter

Set `bla_presentity_spec` parameter

```opensips
...
modparam("presence", "bla\_presentity\_spec", "$var(bla\_pres)")
...
```
### Set `bla_fix_remote_target` parameter

Set `bla_fix_remote_target` parameter

```opensips
...
modparam("presence", "bla\_fix\_remote\_target", 0)
...
```
### Set `notify_offline_body` parameter

Set `notify_offline_body` parameter

```opensips
...
modparam("presence", "notify\_offline\_body", 1)
...
```
### Set `end_sub_on_timeout` parameter

Set `end_sub_on_timeout` parameter

```opensips
...
modparam("presence", "end\_sub\_on\_timeout", 0)
...
```
### Set `clean_period` parameter

Set `clean_period` parameter

```opensips
...
modparam("presence", "clean_period", 100)
...
```
### Set `db_update_period` parameter

Set `db_update_period` parameter

```opensips
...
modparam("presence", "db_update_period", 100)
...
```
### Set `presentity_table` parameter

Set `presentity_table` parameter

```opensips
...
modparam("presence", "presentity\_table", "presentity")
...
```
### Set `active_watchers_table` parameter

Set `active_watchers_table` parameter

```opensips
...
modparam("presence", "active\_watchers\_table", "active\_watchers")
...
```
### Set `watchers_table` parameter

Set `watchers_table` parameter

```opensips
...
modparam("presence", "watchers\_table", "watchers")
...
```
### Set `subs_htable_size` parameter

Set `subs_htable_size` parameter

```opensips
...
modparam("presence", "subs\_htable\_size", 11)
...
```
### Set `pres_htable_size` parameter

Set `pres_htable_size` parameter

```opensips
...
modparam("presence", "pres\_htable\_size", 11)
...
```
### `handle_publish` usage

`handle_publish` usage

```opensips
...
	if(is\_method("PUBLISH"))
	{
		if($hdr(Sender)!= NULL)
			handle\_publish($hdr(Sender));
		else
			handle\_publish();
	} 
...
```
### `handle_subscribe` usage

`handle_subscribe` usage

```opensips
...
if($rm=="SUBSCRIBE")
    handle\_subscribe();
...
```
