# Presence Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6069456)

3.2. [Most recently active contributors(1) to this module](#idp6173968)

**List of Examples**

1.1. [Set `db_url` parameter](#idp5521904)

1.2. [Set `fallback2db` parameter](#idp5526000)

1.3. [Set `cluster_id` parameter](#idp5539184)

1.4. [Set `cluster_federation_mode` parameter](#idp5552448)

1.5. [Set `cluster_pres_events` parameter](#idp5558944)

1.6. [Set `cluster_be_active_shtag` parameter](#idp5566832)

1.7. [Set `expires_offset` parameter](#idp5572096)

1.8. [Set `max_expires_subscribe` parameter](#idp5578736)

1.9. [Set `max_expires_publish` parameter](#idp5583440)

1.10. [Set `contact_user` parameter](#idp209824)

1.11. [Set `enable_sphere_check` parameter](#idp215472)

1.12. [Set `waiting_subs_daysno` parameter](#idp5608176)

1.13. [Set `mix_dialog_presence` parameter](#idp5613408)

1.14. [Set `bla_presentity_spec` parameter](#idp5619280)

1.15. [Set `bla_fix_remote_target` parameter](#idp5625024)

1.16. [Set `notify_offline_body` parameter](#idp5630080)

1.17. [Set `end_sub_on_timeout` parameter](#idp5635056)

1.18. [Set `clean_period` parameter](#idp5639872)

1.19. [Set `db_update_period` parameter](#idp5644768)

1.20. [Set `presentity_table` parameter](#idp5649664)

1.21. [Set `active_watchers_table` parameter](#idp5654656)

1.22. [Set `watchers_table` parameter](#idp5659648)

1.23. [Set `subs_htable_size` parameter](#idp5664704)

1.24. [Set `pres_htable_size` parameter](#idp5669664)

1.25. [`handle_publish` usage](#idp5680336)

1.26. [`handle_subscribe` usage](#idp5694976)

2.1. [`presence_api_t` structure](#idp5950816)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The modules handles PUBLISH and SUBSCRIBE messages and generates NOTIFY messages in a general, event independent way. It allows registering events from other OpenSIPS modules. Events that can currently be added are:

*   _presence_, _presence.winfo_, _dialog;sla_ from presence\_xml module
    
*   _message-summary_ from presence\_mwi module
    
*   _call-info_, _line-seize_ from presence\_callinfo module
    
*   _dialog_ from presence\_dialoginfo module
    
*   _xcap-diff_ from presence\_xcapdiff module
    
*   _as-feature-event_ from presence\_dfks module
    

The module uses database storage. It has later been improved with memory caching operations to improve performance. The Subscribe dialog information are stored in memory and are periodically updated in database, while for Publish only the presence or absence of stored info for a certain resource is maintained in memory to avoid unnecessary, costly db operations. It is possible to configure a fallback to database mode(by setting module parameter "fallback2db"). In this mode, in case a searched record is not found in cache, the search is continued in database. This is useful for an architecture in which processing and memory load might be divided on more machines using the same database.

The module can also work only with the functionality of a library, with no message processing and generation, but used only for the exported functions. This mode of operation is enabled if the db\_url parameter is not set to any value.

The server follows the specifications in: RFC3265, RFC3856, RFC3857, RFC3858.

## 1.2.�Presence clustering

To read and understand the presence clustering, its abilities and how to implement scenarios like High-Availability, Load Balancing or Federations, please refer to this article [https://blog.opensips.org/2018/03/27/clustering-presence-services-with-opensips-2-4/](https://blog.opensips.org/2018/03/27/clustering-presence-services-with-opensips-2-4/).

As data synchronization at startup is performed when using the _full-sharing_ [cluster\_federation\_mode](#param_cluster_federation_mode "1.4.4.�cluster_federation_mode (str)"), you should define at least one "seed" node in the cluster in this case.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database module_.
    
*   _signaling_.
    
*   _clusterer_, if the cluster\_id module parameter is set and clustering support activated.
    

### 1.3.2.�External Libraries or Applications

*   _libxml-dev_.
    

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
	

  

## 1.5.�Exported Functions

### 1.5.1.� `handle_publish([sender_uri])`

The function handles PUBLISH requests. It stores and updates published information in database and calls functions to send NOTIFY messages when changes in the published information occur.

It may takes one optional string argument, the 'sender\_uri' SIP URI. The parameter was added for enabling BLA implementation. If present, Notification of a change in published state is not sent to the respective uri even though a subscription exists. It should be taken from the Sender header. It was left at the decision of the administrator whether or not to transmit the content of this header as parameter for handle\_publish, to prevent security problems.

This function can be used from REQUEST\_ROUTE.

_Return code:_

*   _1 - if success_.
    
*   _\-1 - if error_.
    

The module sends an appropriate stateless reply in all cases.

**Example�1.25.�`handle_publish` usage**

...
	if(is\_method("PUBLISH"))
	{
		if($hdr(Sender)!= NULL)
			handle\_publish($hdr(Sender));
		else
			handle\_publish();
	} 
...

  

### 1.5.2.� `handle_subscribe([force_active] [,sharing_tag])`

This function is to be used for handling SUBSCRIBE requests. It stores or updates the watcher/subscriber information in database. Additionally, in response to initial SUBSCRIBE requests (creating a new subscription session), the function also sends back the NOTIFY (with the presence information) to the wathcer/subscriber.

The function may take the following parameters:

*   _force\_active_ (int, optional) - optional parameter that controls what is the default policy (of the presentity) on accepting new subscriptions (accept or reject) - of course, this parameter makes sense only when using a presence configuration with privacy rules enabled (force\_active parameter in presence\_xml module is not set).
    
    There are scenarios where the presentity (the party you subscribe to) can not upload an XCAP document with its privacy rules (to control which watchers are allowed to subscribe to it). In such cases, from script level, you can force the presence server to consider the current subscription allowed (with Subscription-Status:active) by calling the handle\_subscribe() function with the integer parameter "1".
    
*   _sharing\_tag_ (string, optional) - optional parameter telling the owner tag (for the subscription) in clusetering scenarios where the subscription data is shared between multiple servers - see the [Section�1.2, “Presence clustering”](#presence_clustering "1.2.�Presence clustering") chapter for more details.
    

   Ex: 
	if($ru =~ "kphone@opensips.org")
		handle\_subscribe(1);
		

This function can be used from REQUEST\_ROUTE.

_Return code:_

*   _1 - if success_.
    
*   _\-1 - if error_.
    

The module sends an appropriate stateless reply in all cases.

**Example�1.26.�`handle_subscribe` usage**

...
if($rm=="SUBSCRIBE")
    handle\_subscribe();
...

  

## 1.6.�Exported MI Functions

### 1.6.1.� `refresh_watchers`

Triggers sending Notify messages to watchers if a change in watchers authorization or in published state occurred.

Name: _refresh\_watchers_

Parameters:

*   presentity\_uri : the uri of the user who made the change and whose watchers should be informed
    
*   event : the event package
    
*   refresh type : it distinguishes between the two different types of events that can trigger a refresh:
    
    *   a change in watchers authentication: refresh type= 0 ;
        
    *   a statical update in published state (either through direct update in db table or by modifying the pidf manipulation document, if pidf\_manipulation parameter is set): refresh type!= 0.
        
    

MI FIFO Command Format:

opensips-cli -x mi refresh\_watchers sip:11@192.168.2.132 presence 1
	

### 1.6.2.� `cleanup`

Manually triggers the cleanup functions for watchers and presentity tables. Useful if you have set `clean_period` to zero or less.

Name: _cleanup_

Parameters: _none_

MI FIFO Command Format:

opensips-cli -x mi cleanup
	  

### 1.6.3.� `pres_phtable_list`

Lists all the presentity records.

Name: _pres\_phtable\_list_

Parameters: _none_

MI FIFO Command Format:

opensips-cli -x mi pres\_phtable\_list
	  

### 1.6.4.� `subs_phtable_list`

Lists all the subscription records, or the subscriptions for which the "To" and "From" URIs match the given parameters.

Name: _subs\_phtable\_list_

Parameters

*   _from_(optional) - wildcard for "From" URI
    
*   _to_(optional) - wildcard for "To" URI
    

MI FIFO Command Format:

opensips-cli -x mi subs\_phtable\_list sip:222@domain2.com sip:user\_1@example.com
	  

### 1.6.5.� `pres_expose`

Exposes in the script, by rasing an _E\_PRESENCE\_EXPOSED_ event, all the presentities of a specific event that match a specified filter.

Name: _pres\_expose_

Parameters:

*   _event_ - the desired presence event.
    
*   _filter_(optional) - a regular expression (REGEXP) used for filtering the presentities for that event. Only the presentities that match will be exposed. If not specified, all presentities for that event are exposed.
    

MI FIFO Command Format:

opensips-cli -x mi pres\_expose presence ^sip:10\\.0\\.5\\.\[0-9\]\*
	  

## 1.7.�Exported Events

### 1.7.1.� `E_PRESENCE_PUBLISH`

This event is raised when the presence module receives a PUBLISH message.

Parameters:

*   _user_ - the AOR of the user
    
*   _domain_ - the domain
    
*   _event_ - the type of the event published
    
*   _expires_ - the expire value of the publish
    
*   _etag_ - the entity tag
    
*   _old\_etag_ - the entity tag to be refreshed
    
*   _body_ - the body of the PUBLISH request
    

### 1.7.2.� `E_PRESENCE_EXPOSED`

This event is raised for each presentity exposeed by the _pres\_expose_.

Parameters:

Same parameters as the _E\_PRESENCE\_PUBLISH_ event.

## 1.8.�Installation

The module requires 3 table in OpenSIPS database: presentity, active\_watchers and watchers tables. The SQL syntax to create them can be found in presence-create.sql script in the database directories in the opensips/scripts folder. You can also find the complete database documentation on the project webpage, [https://opensips.org/docs/db/db-schema-devel.html](https://opensips.org/docs/db/db-schema-devel.html).

## Chapter�2.�Developer Guide

The module provides the following functions that can be used in other OpenSIPS modules.

## 2.1.� `bind_presence(presence_api_t* api)`

This function binds the presence modules and fills the structure with the exported functions that represent functions adding events in presence module and functions specific for Subscribe processing.

**Example�2.1.�`presence_api_t` structure**

...
typedef struct presence\_api {
	add\_event\_t add\_event;
	contains\_event\_t contains\_event;
	search\_event\_t search\_event;
	get\_event\_list\_t get\_event\_list;
	
	update\_watchers\_t update\_watchers\_status;
	
	/\* subs hash table handling functions \*/
	new\_shtable\_t new\_shtable;
	destroy\_shtable\_t destroy\_shtable;
	insert\_shtable\_t insert\_shtable;
	search\_shtable\_t search\_shtable;
	delete\_shtable\_t delete\_shtable;
	update\_shtable\_t update\_shtable;
	/\* function to duplicate a subs structure\*/
	mem\_copy\_subs\_t  mem\_copy\_subs;
	/\* function used for update in database\*/
	update\_db\_subs\_t update\_db\_subs;
	/\* function to extract dialog information from a
	SUBSCRIBE message \*/
	extract\_sdialog\_info\_t extract\_sdialog\_info;
	/\* function to request sphere defition for a presentity \*/
	pres\_get\_sphere\_t get\_sphere;
	pres\_contains\_presence\_t contains\_presence;
}presence\_api\_t;
...

  

## 2.2.� `add_event`

Field type:

...
typedef int (\*add\_event\_t)(pres\_ev\_t\* event);
...

This function receives as a parameter a structure with event specific information and adds it to presence event list.

The structure received as a parameter:

...
typedef struct pres\_ev
{
	str name;
	event\_t\* evp;
	str content\_type;
	int default\_expires;
	int type;
	int etag\_not\_new;
	/\*
	 \*  0 - the standard mechanism (allocating new etag
			for each Publish)
	 \*  1 - allocating an etag only
			for an initial Publish 
	\*/
	int req\_auth;
	get\_rules\_doc\_t\* get\_rules\_doc;
	apply\_auth\_t\*  apply\_auth\_nbody;
	is\_allowed\_t\*  get\_auth\_status;
	
	/\* an agg\_body\_t function should be registered
	 \* if the event permits having multiple published
	 \* states and requires an aggregation of the information
	 \* otherwise, this field should be NULL and the last
	 \* published state is taken when constructing Notify msg
	 \*/
	agg\_nbody\_t\* agg\_nbody;
	publ\_handling\_t  \* evs\_publ\_handl;
	subs\_handling\_t  \* evs\_subs\_handl;
	free\_body\_t\* free\_body;
	
	/\* sometimes it is necessary that a module make changes for a body for each 
	 \* active watcher (e.g. setting the "version" parameter in an XML document.
	 \* If a module registers the aux\_body\_processing callback, it gets called for
	 \* each watcher. It either gets the body received by the PUBLISH, or the body
	 \* generated by the agg\_nbody function.
	 \* The module can deceide if it makes a copy of the original body, which is then
	 \* manipulated, or if it works directly in the original body. If the module makes a
	 \* copy of the original body, it also has to register the aux\_free\_body() to 
	 \* free this "per watcher" body.
	 \*/
	aux\_body\_processing\_t\* aux\_body\_processing;
	free\_body\_t\* aux\_free\_body;

	struct pres\_ev\* wipeer;			
	struct pres\_ev\* next;
	
}pres\_ev\_t;
...

## 2.3.� `get_rules_doc`

Filed type:

...
typedef int (get\_rules\_doc\_t)(str\* user, str\* domain, str\*\* rules\_doc);
...
			

This function returns the authorization rules document that will be used in obtaining the status of the subscription and processing the notified body. A reference to the document should be put in the auth\_rules\_doc of the subs\_t structure given as a parameter to the functions described bellow.

## 2.4.� `get_auth_status`

This filed is a function to be called for a subscription request to return the state for that subscription according to authorization rules. In the auth\_rules\_doc field of the subs\_t structure received as a parameter should contain the rules document of the presentity in case, if it exists.

It is called only if the req\_auth field is not 0.

Filed type:

...
typedef int (is\_allowed\_t)(struct subscription\* subs);
...
			

## 2.5.� `apply_auth_nbody`

This parameter should be a function to be called for an event that requires authorization, when constructing final body. The authorization document is taken from the auth\_rules\_doc field of the subs\_t structure given as a parameter. It is called only if the req\_auth field is not 0.

Filed type:

...
typedef int (apply\_auth\_t)(str\* , struct subscription\*, str\*\* );
...
			

## 2.6.� `agg_nbody`

If present, this field marks that the events requires aggregation of states. This function receives a body array and should return the final body. If not present, it is considered that the event does not require aggregation and the most recent published information is used when constructing Notifies.

Filed type:

...
typedef str\* (agg\_nbody\_t)(str\* pres\_user, str\* pres\_domain, 
str\*\* body\_array, int n, int off\_index);
..
			

## 2.7.� `free_body`

This field must be field in if subsequent processing is performed on the info from database before being inserted in Notify message body(if agg\_nbody or apply\_auth\_nbody fields are filled in). It should match the allocation function used when processing the body.

Filed type:

...
typedef void(free\_body\_t)(char\* body);
..
			

## 2.8.� `aux_body_processing`

This field must be set if the module needs to manipulate the NOTIFY body for each watcher. E.g. if the XML body includes a 'version' parameter which will be increased for each NOTIFY, on a "per watcher" basis. The module can either allocate a new buffer for the new body an return it (aux\_free\_body function must be set too) or it manipualtes the original body directly and returns NULL.

Filed type:

...
typedef str\* (aux\_body\_processing\_t)(struct subscription \*subs, str\* body);
..
			

## 2.9.� `aux_free_body`

This field must be set if the module registers the aux\_body\_processing function and allocates memory for the new modified body. Then, this function will be used to free the pointer returned by the aux\_body\_processing function. If the module does use the aux\_body\_processing, but does not allocate new memory, but manipulates directly the original body buffer, then the aux\_body\_processing must return NULL and this field should not be set.

Filed type:

...
typedef void(free\_body\_t)(char\* body);
..
			

## 2.10.� `evs_publ_handl`

This function is called when handling Publish requests. Most contain body correctness check.

...
typedef int (publ\_handling\_t)(struct sip\_msg\*);
..
			

## 2.11.� `evs_subs_handl`

It is not compulsory. Should contain event specific handling for Subscription requests.

Filed type:

...
typedef int (subs\_handling\_t)(struct sip\_msg\*);
..

## 2.12.� `contains_event`

Field type:

..
typedef pres\_ev\_t\* (\*contains\_event\_t)(str\* name,
event\_t\* parsed\_event);
...

The function parses the event name received as a parameter and searches the result in the list. It returns the found event or NULL, if not found. If the second argument is an allocated event\_t\* structure it fills it with the result of the parsing.

## 2.13.� `get_event_list`

Field type:

...
typedef int (\*get\_event\_list\_t) (str\*\* ev\_list);
...

This function returns a string representation of the events registered in presence module.( used for Allowed-Events header).

## 2.14.� `update_watchers_status`

Field type:

...
typedef int (\*update\_watchers\_t)(str pres\_uri, pres\_ev\_t\* ev,
str\* rules\_doc);
...

This function is an external command that can be used to announce a change in authorization rules for a presentity. It updates the stored status and sends a Notify to the watchers whose status has changes. (used by presence\_xml module when notified through an MI command of a change in an xcap document).

## 2.15.� `get_sphere`

Field type:

...
typedef char\* (\*pres\_get\_sphere\_t)(str\* pres\_uri);
...

This function searches for a sphere definition in the published information if this has type RPID. If not found returns NULL. (the return value is allocated in private memory and should be freed)

## 2.16.� `contains_presence`

Field type:

...
typedef int (\*pres\_contains\_presence\_t)(str\* pres\_uri);
...

This function searches is a presence uri has published any presence information. It return 1 if a record is found, -1 otherwise.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Anca Vamanu

656

247

24146

12623

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

155

96

3231

1846

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

35

28

423

163

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

35

25

287

397

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

33

19

631

481

6.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

29

20

618

170

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

24

19

174

165

8.

Dan Pascu ([@danpascu](https://github.com/danpascu))

20

14

162

201

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

14

6

340

302

10.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

11

7

150

105

  

**All remaining contributors**: Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Edson Gellert Schubert, Stanislaw Pitucha, Damien Sandras ([@dsandras](https://github.com/dsandras)), Kobi Eshun ([@ekobi](https://github.com/ekobi)), Carsten Bock, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Angel Marin, Klaus Darilion, Carlos Oliva, Sergio Gutierrez, Kennard White, Elena-Ramona Modroiu, Jasper Hafkenscheid, Vasil Kolev, Benny Prijono, James Criscuolo, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vallimamod Abdullah, UnixDev, Norman Brandinger ([@NormB](https://github.com/NormB)), Denis Bilenko, Juli�n Moreno Pati�o, John Riordan, Julien Blache.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2006 - Nov 2025

2.

Norman Brandinger ([@NormB](https://github.com/NormB))

May 2024 - May 2024

3.

Carsten Bock

Mar 2024 - Mar 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2022

6.

Jasper Hafkenscheid

Jul 2022 - Jul 2022

7.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Jun 2021

8.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Apr 2010 - Apr 2021

9.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2021

10.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

Sep 2010 - Sep 2020

  

**All remaining contributors**: Dan Pascu ([@danpascu](https://github.com/danpascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), James Criscuolo, Juli�n Moreno Pati�o, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Carlos Oliva, Damien Sandras ([@dsandras](https://github.com/dsandras)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Anca Vamanu, Vallimamod Abdullah, Kennard White, Stanislaw Pitucha, Angel Marin, John Riordan, Vasil Kolev, UnixDev, Sergio Gutierrez, Kobi Eshun ([@ekobi](https://github.com/ekobi)), Klaus Darilion, Denis Bilenko, Henning Westerholt ([@henningw](https://github.com/henningw)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Edson Gellert Schubert, Julien Blache, Benny Prijono, Elena-Ramona Modroiu.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Jasper Hafkenscheid, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Anca Vamanu, Kennard White, Angel Marin, Kobi Eshun ([@ekobi](https://github.com/ekobi)), Klaus Darilion, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Edson Gellert Schubert, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2006 Voice Sistem SRL