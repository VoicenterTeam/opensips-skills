## 1.4.�Exported Parameters

### 1.4.1.�`db_url`(str)

The database url.

If set, the module is a fully operational presence server. Otherwise, it is used as a 'library', for its exported functions.

_Default value is “NULL”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("presence", "db\_url", 
	"mysql://opensips:opensipsrw@192.168.2.132/opensips")
...

  

### 1.4.2.�`fallback2db` (int)

Setting this parameter enables a fallback to db mode of operation. In this mode, in case a searched record is not found in cache, the search is continued in database. Useful for an architecture in which processing and memory load might be divided on more machines using the same database.

**Example�1.2.�Set `fallback2db` parameter**

...
modparam("presence", "fallback2db", 1)
...

  

### 1.4.3.�`cluster_id` (int)

The ID of the cluster this presence server belongs to. This parameter is to be used only if clustering mode is needed. In order to understand th concept of a cluster ID, please see the _clusterer_ module.

This OpenSIPS cluster exposes the **"presence"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

For more on presence clustering see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter.

_Default value is “None”._

**Example�1.3.�Set `cluster_id` parameter**

...
modparam("presence", "cluster\_id", 2)
...

  

### 1.4.4.�`cluster_federation_mode` (str)

When enabling the federation mode, nodes inside the presence cluster will start broadcasting the data to other nodes via the clustering support.

_Possible values:_

*   _disabled_ - federation mode is disabled
    
*   _on-demand-sharing_ - the minimum needed information is kept on each node. Replicated information for non local subscribers is discarded and queries are broadcasted in the cluster for new subscribers.
    
*   _full-sharing_ - published state is kept on all presence nodes even when there aren't any local subscribers.
    

If you don't want to use a shared database (via [fallback2db](#param_fallback2db "1.4.2.�fallback2db (int)")), but still want a complete data set everywhere, you may choose mode _full-sharing_. This mode allows you to switch PUBLISH endpoints, even for already published Event States, thus allowing you to add and remove presence servers without losing state.

For more on presence clustering see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter.

_Default value is “disabled”._

**Example�1.4.�Set `cluster_federation_mode` parameter**

...
modparam("presence", "cluster\_federation\_mode", "full-sharing")
...

  

### 1.4.5.�`cluster_pres_events` (str)

Comma Separated Value (CSV) list with the events to considered by the federated cluster - only presentities advertising one of these events will be broadcasted via the cluster.

For more on presence clustering see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter.

_Default value is “empty” (meaning all)._

**Example�1.5.�Set `cluster_pres_events` parameter**

...
modparam("presence", "cluster\_pres\_events" ,"presence, dialog;sla, message-summary")
...

  

### 1.4.6.�`cluster_be_active_shtag` (str)

The name of a cluster sharing tag to be used to indicate when this node (as part of the cluster) should be active or not. If the sharing tag is off (or as backup), the node will become inactive from clustering perspective, meaning not sending and not accepting any presence related cluster traffic.

This ability of a node to become inactive may be used when creating a federated cluster where 2 nodes are acting as a local active-backup setup (for local High Availability purposes).

This parameter has meaning only in clustering mode. If not defined, the node will be active all the time.

For more on presence clustering see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter.

_Default value is “empty” (not tag define)._

**Example�1.6.�Set `cluster_be_active_shtag` parameter**

...
modparam("presence", "cluster\_be\_active\_shtag" ,"local\_ha")
...

  

### 1.4.7.�`expires_offset` (int)

The extra time to store a subscription/publication.

_Default value is “0”._

**Example�1.7.�Set `expires_offset` parameter**

...
modparam("presence", "expires\_offset", 10)
...

  

### 1.4.8.�`max_expires_subscribe` (int)

The the maximum admissible expires value for SUBSCRIBE messages.

_Default value is “3600”._

**Example�1.8.�Set `max_expires_subscribe` parameter**

...
modparam("presence", "max\_expires\_subscribe", 3600)
...

  

### 1.4.9.�`max_expires_publish` (int)

The the maximum admissible expires value for PUBLISH messages.

_Default value is “3600”._

**Example�1.9.�Set `max_expires_publish` parameter**

...
modparam("presence", "max\_expires\_publish", 3600)
...

  

### 1.4.10.�`contact_user` (str)

This is the username that will be used in the Contact header for the 200 OK replies to SUBSCRIBE and in the following in-dialog NOTIFY requests. The IP address, port and transport for the Contact will be automatically determined based on the interface where the SUBSCRIBE was received.

If set to an empty string, no username will be added to the contact and the contact will be built just out of the IP, port and transport.

_Default value is “presence”._

**Example�1.10.�Set `contact_user` parameter**

...
modparam("presence", "contact\_user", "presence")
...
		

  

### 1.4.11.�`enable_sphere_check` (int)

This parameter is a flag that should be set if permission rules include sphere checking. The sphere information is expected to be present in the RPID body published by the presentity. The flag is introduced as this check requires extra processing that should be avoided if this feature is not supported by the clients.

_Default value is “0 ”._

**Example�1.11.�Set `enable_sphere_check` parameter**

...
modparam("presence", "enable\_sphere\_check", 1)
...
	

  

### 1.4.12.�`waiting_subs_daysno` (int)

The number of days to keep the record of a subscription in server database if the subscription is in pending or waiting state (no authorization policy was defined for it or the target user did not register sice the subscription and was not informed about it).

_Default value is “3” days. Maximum accepted value is 30 days._

**Example�1.12.�Set `waiting_subs_daysno` parameter**

...
modparam("presence", "waiting\_subs\_daysno", 2)
...
	

  

### 1.4.13.�`mix_dialog_presence` (int)

This module parameter enables a very nice feature in the presence server - generating presence information from dialogs state. If this parameter is set, the presence server will tell you if a buddy is in a call even if his phone did not send a presence Publish with this information. You will need to load the dialoginfo modules, presence\_dialoginfo, pua\_dialoginfo, dialog and pua.

_Default value is “0”._

**Example�1.13.�Set `mix_dialog_presence` parameter**

...
modparam("presence", "mix\_dialog\_presence", 1)
...
	

  

### 1.4.14.�`bla_presentity_spec` (str)

By default the presentity uri for BLA subscribes (event=dialog;sla) is computed from contact username + from domain. In some cases though, this way of computing the presentity might not be right (for example if you have a SBC in front that masquerades the contact). So we added this parameter that allows defining a custom uri to be used as presentity uri for BLA subscribes. You should set this parameter to the name of a pseudovariable and then set this pseudovariable to the desired URI before calling the [handle\_subscribe()](#func_handle_subscribe "1.5.2.� handle_subscribe([force_active] [,sharing_tag])") function.

_Default value is “NULL”._

**Example�1.14.�Set `bla_presentity_spec` parameter**

...
modparam("presence", "bla\_presentity\_spec", "$var(bla\_pres)")
...
	

  

### 1.4.15.�`bla_fix_remote_target` (int)

Polycom has a bug in the bla implementation. It inserts the remote IP contact in the Notify body and when a phone picks up a call put on hold by another phone in the same BLA group, it sends an Invite directly to the remote IP. OpenSIPS BLA server tries to prevent this by replacing the IP contact with the domain, when this is possible.

In some cases(configurations) however this is not desirable, so this parameter was introduced to disable this behaviour when needed.

_Default value is “1”._

**Example�1.15.�Set `bla_fix_remote_target` parameter**

...
modparam("presence", "bla\_fix\_remote\_target", 0)
...
	

  

### 1.4.16.�`notify_offline_body` (int)

If this parameter is set, when no published info is found for a user, the presence server will generate a dummy body with status 'closed' and use it when sending Notify, instead of notifying with no body.

_Default value is “0”._

**Example�1.16.�Set `notify_offline_body` parameter**

...
modparam("presence", "notify\_offline\_body", 1)
...
	

  

### 1.4.17.�`end_sub_on_timeout` (int)

If a presence subscription should be automatically terminated (destroyed) when receiving a SIP timeout (408) for a sent NOTIFY requests.

_Default value is “1” (enabled)._

**Example�1.17.�Set `end_sub_on_timeout` parameter**

...
modparam("presence", "end\_sub\_on\_timeout", 0)
...
	

  

### 1.4.18.�`clean_period` (int)

The period at which to clean the expired subscription dialogs.

_Default value is “100”. A zero or negative value disables this activity._

**Example�1.18.�Set `clean_period` parameter**

...
modparam("presence", "clean\_period", 100)
...

  

### 1.4.19.�`db_update_period` (int)

The period at which to synchronize cached subscriber info with the database.

_Default value is “100”. A zero or negative value disables synchronization._

**Example�1.19.�Set `db_update_period` parameter**

...
modparam("presence", "db\_update\_period", 100)
...

  

### 1.4.20.�`presentity_table`(str)

The name of the db table where Publish information are stored.

_Default value is “presentity”._

**Example�1.20.�Set `presentity_table` parameter**

...
modparam("presence", "presentity\_table", "presentity")
...

  

### 1.4.21.�`active_watchers_table`(str)

The name of the db table where active subscription information are stored.

_Default value is “active\_watchers”._

**Example�1.21.�Set `active_watchers_table` parameter**

...
modparam("presence", "active\_watchers\_table", "active\_watchers")
...

  

### 1.4.22.�`watchers_table`(str)

The name of the db table where subscription states are stored.

_Default value is “watchers”._

**Example�1.22.�Set `watchers_table` parameter**

...
modparam("presence", "watchers\_table", "watchers")
...

  

### 1.4.23.�`subs_htable_size` (int)

The size of the hash table to store subscription dialogs. This parameter will be used as the power of 2 when computing table size.

_Default value is “9 (512)”._

**Example�1.23.�Set `subs_htable_size` parameter**

...
modparam("presence", "subs\_htable\_size", 11)
...
	

  

### 1.4.24.�`pres_htable_size` (int)

The size of the hash table to store publish records. This parameter will be used as the power of 2 when computing table size.

_Default value is “9 (512)”._

**Example�1.24.�Set `pres_htable_size` parameter**

...
modparam("presence", "pres\_htable\_size", 11)
...