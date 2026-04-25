# B2B\_LOGIC

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6246160)

3.2. [Most recently active contributors(1) to this module](#idp6345584)

**List of Examples**

1.1. [Set `server_hsize` parameter](#idp5565584)

1.2. [Set `script_req_route` parameter](#idp5569376)

1.3. [Set `script_repl_route` parameter](#idp5573248)

1.4. [Set `cleanup_period` parameter](#idp5578416)

1.5. [Set parameter](#idp5590432)

1.6. [Set parameter](#idp5599376)

1.7. [Set `db_url` parameter](#idp5602992)

1.8. [Set `cachedb_url` parameter](#idp5606768)

1.9. [Set `cachedb_key_prefix` parameter](#idp5611760)

1.10. [Set `update_period` parameter](#idp5616736)

1.11. [Set `max_duration` parameter](#idp5621936)

1.12. [Set `contact_user` parameter](#idp5626832)

1.13. [Set `b2bl_from_spec_param` parameter](#idp5632496)

1.14. [Set `server_address` parameter](#idp5636928)

1.15. [Set `server_address` parameter using Pseudo-Variables](#idp5638800)

1.16. [Set `init_callid_hdr` parameter](#idp5642832)

1.17. [Set `db_mode` parameter](#idp5649888)

1.18. [Set `db_table` parameter](#idp5654704)

1.19. [Set `b2bl_th_init_timeout` parameter](#idp5659600)

1.20. [Set `b2bl_early_update` parameter](#idp5666208)

1.21. [`b2b_init_request` usage](#idp5684192)

1.22. [`b2b_server_new` usage](#idp5695312)

1.23. [`b2b_client_new` usage](#idp5709536)

1.24. [`b2b_bridge` usage](#idp5726608)

1.25. [`b2b_bridge` usage](#idp5733712)

1.26. [`b2b_pass_request` usage](#idp5739264)

1.27. [`b2b_handle_reply` usage](#idp5744400)

1.28. [`b2b_send_reply` usage](#idp5753600)

1.29. [`b2b_delete_entity` usage](#idp5758416)

1.30. [`b2b_end_dlg_leg` usage](#idp5763840)

1.31. [`b2b_bridge_request` usage](#idp5772384)

1.32. [`b2b_trigger_scenario` usage](#idp5795728)

1.33. [`$b2b_logic.key` usage](#idp5840816)

1.34. [`$b2b_logic.entity` usage](#idp5855200)

1.35. [`$b2b_logic.ctx` usage](#idp5862016)

1.36. [`$b2b_logic.scenario` usage](#idp5867376)

2.1. [`b2bl_api_t` structure](#idp6161520)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The B2BUA implementation in OpenSIPS is separated in two layers:

*   a lower one (implemented in the b2b\_entities module) - the basic functions of a UAS and UAC
    
*   an upper one (implemented in b2b\_logic module) - which represents the logic engine of B2BUA, responsible of actually implementing the B2BUA services using the functions offered by the low level.
    

This module is a B2BUA upper level implementation that can be used along with the b2b\_entities module in order to provide various B2BUA services (eg. PBX features). The actual logic of the B2BUA scenarios can be implemented in dedicated script routes.

A B2B session can be triggered in two ways:

*   from the script - at the receipt of an initial INVITE message
*   with an extern command (MI) command - the server will connect two end points in a session(Third Party Call Control).

High Availability for B2B sessions can be achieved by enabling the clustering support offered by the the lower _b2b\_entities_ module (by setting the [cluster\_id](https://opensips.org/docs/modules/3.1.x/b2b_entities.html#param_cluster_id) modparam from _b2b\_entities_).

## 1.2.�Scenario Logic

After initializing a B2B session, the call legs will be handled by the b2b\_logic module and the first step will be to put the two initial entities in contact. Requests and replies belonging to these dialogs will not enter the script through the standard OpenSIPS routes but instead will be handled in b2b\_logic dedicated routes (defined through the [script\_req\_route](#param_script_req_route "1.4.2.�script_req_route (str)") and [script\_reply\_route](#param_script_reply_route "1.4.3.�script_reply_route (str)") modparams or, the custom routes given as parameters to [b2b\_init\_request()](#func_b2b_init_request "1.5.1.� b2b_init_request(id, [flags], [req_route], [reply_route])")). The further steps of the scenario can be implemented in these routes, by calling dedicated b2b\_logic script functions in order to perform various actions. Normal "proxy-like" OpenSIPS functions should not be executed in the b2b\_logic routes.

Some messages will be handled automatically by the module and will not enter the b2b\_logic routes at all (BYE requests received while in the process of bridging two entities, ACKs/BYEs/replies for disconnected entities). Also, if no dedicated b2b\_logic reply route is defined, replies will be handled internally by the module, with the same effects as calling [b2b\_handle\_reply()](#func_b2b_handle_reply "1.5.7.� b2b_handle_reply()") from such a route if it were defined.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

*   _b2b\_entities, a db module_
    

### 1.3.2.�External Libraries or Applications

No libraries or applications required before running OpenSIPS with this module.

## 1.4.�Exported Parameters

### 1.4.1.�`hash_size` (int)

The size of the hash table that stores the session entities.

_Default value is “9”_ (512 records).

**Example�1.1.�Set `server_hsize` parameter**

...
modparam("b2b\_logic", "hash\_size", 10)
...
	

  

### 1.4.2.�`script_req_route` (str)

The name of the script route to be called when requests belonging to an ongoing B2B session are received.

**Example�1.2.�Set `script_req_route` parameter**

...
modparam("b2b\_logic", "script\_req\_route", "b2b\_request")
...
	

  

### 1.4.3.�`script_reply_route` (str)

The name of the script route to be called when replies belonging to an ongoing B2B session are received.

**Example�1.3.�Set `script_repl_route` parameter**

...
modparam("b2b\_logic", "script\_reply\_route", "b2b\_reply")
...
	

  

### 1.4.4.�`cleanup_period` (int)

The time interval at which to search for an hanged b2b context. A session is considered expired if the duration of a session exceeds its defined lifetime. At that moment, BYE is sent in all the dialogs from that context and the context is deleted.

_Default value is “100”._

**Example�1.4.�Set `cleanup_period` parameter**

...
modparam("b2b\_logic", "cleanup\_period", 60)
...
	

  

### 1.4.5.�`custom_headers_regexp` (str)

Regexp to search SIP header by names that should be passed from the dialog of one side to the other side. There are a number of headers that are passed by default. They are:

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

It can be in forms like "regexp", "/regexp/" and "/regexp/flags".

Meaning of the flags is as follows:

*   _i_ - Case insensitive search.
    
*   _e_ - Use extended regexp.
    

_Default value is “NULL”._

**Example�1.5.�Set parameter**

...
modparam("b2b\_logic", "custom\_headers\_regexp", "/^x-/i")
...
	

  

### 1.4.6.�`custom_headers` (str)

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

_Default value is “NULL”._

**Example�1.6.�Set parameter**

...
modparam("b2b\_logic", "custom\_headers", "User-Agent;Date")
...
	

  

### 1.4.7.�`db_url` (str)

Database URL.

**Example�1.7.�Set `db_url` parameter**

...
modparam("b2b\_logic", "db\_url", "mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
	

  

### 1.4.8.�`cachedb_url` (str)

URL of a NoSQL database to be used. Only Redis is supported at the moment.

**Example�1.8.�Set `cachedb_url` parameter**

...
modparam("b2b\_logic", "cachedb\_url", "redis://localhost:6379/")
...
		

  

### 1.4.9.�`cachedb_key_prefix` (string)

Prefix to use for every key set in the NoSQL database.

_Default value is “b2bl$”._

**Example�1.9.�Set `cachedb_key_prefix` parameter**

...
modparam("b2b\_logic", "cachedb\_key\_prefix", "b2b")
...
	

  

### 1.4.10.�`update_period` (int)

The time interval at which to update the info in database.

_Default value is “100”._

**Example�1.10.�Set `update_period` parameter**

...
modparam("b2b\_logic", "update\_period", 60)
...
	

  

### 1.4.11.�`max_duration` (int)

The maximum duration of a call.

_Default value is “12 \* 3600 (12 hours)”._

If you set it to 0, there will be no limitation.

**Example�1.11.�Set `max_duration` parameter**

...
modparam("b2b\_logic", "max\_duration", 7200)
...
	

  

### 1.4.12.�`contact_user` (int)

If set to 1, adds user from From: header to generated Contact:

_Default value is “0”._

**Example�1.12.�Set `contact_user` parameter**

...
modparam("b2b\_logic", "contact\_user", 1)
...
	

  

### 1.4.13.�`b2bl_from_spec_param` (string)

The name of the pseudo variable for storing the new “From” header. The PV must be set before calling “b2b\_init\_request”.

_Default value is “NULL” (disabled)._

**Example�1.13.�Set `b2bl_from_spec_param` parameter**

...
modparam("b2b\_logic", "b2bl\_from\_spec\_param", "$var(b2bl\_from)")
...
route{
	...
	# setting the From header
	$var(b2bl\_from) = "\\"Call ID\\" <sip:user@opensips.org>";
	...
	b2b\_init\_request("top hiding");
	...
}
	

  

### 1.4.14.�`server_address` (str)

The IP address of the machine that will be used as Contact in the generated messages. This is compulsory only when OpenSIPS starts a call from the middle. For scenarios triggered by received calls, if it is not set, it is constructed dynamically from the socket where the initiating request was received. This socket will be used to send all the requests, replies for that session. This parameter support Pseudo-Variables.

**Example�1.14.�Set `server_address` parameter**

...
modparam("b2b\_logic", "server\_address", "sip:sa@10.10.10.10:5060")
...
	

  

**Example�1.15.�Set `server_address` parameter using Pseudo-Variables**

...
modparam("b2b\_logic", "server\_address", "sip:$socket\_in(advertised\_ip):$socket\_in(advertised\_port)")
...
	

  

### 1.4.15.�`init_callid_hdr` (str)

The module offers the possibility to insert the original callid in a header in the generated Invites. If you want this, set this parameter to the name of the header in which to insert the original callid.

**Example�1.16.�Set `init_callid_hdr` parameter**

...
modparam("b2b\_logic", "init\_callid\_hdr", "Init-CallID")
...
	

  

### 1.4.16.�`db_mode` (int)

The B2B modules have support for the 3 type of database storage

*   NO DB STORAGE - set this parameter to 0
*   WRITE THROUGH (synchronous write in database) - set this parameter to 1
*   WRITE BACK (update in db from time to time) - set this parameter to 2

_Default value is “2” (WRITE BACK)._

**Example�1.17.�Set `db_mode` parameter**

...
modparam("b2b\_logic", "db\_mode", 1)
...
	

  

### 1.4.17.�`db_table` (str)

Name of the database table to be used

_Default value is “b2b\_logic”_

**Example�1.18.�Set `db_table` parameter**

...
modparam("b2b\_logic", "db\_table", "some\_table\_name")
...
	

  

### 1.4.18.�`b2bl_th_init_timeout` (int)

Call setup timeout for topology hiding scenario.

_Default value is “60”_

**Example�1.19.�Set `b2bl_th_init_timeout` parameter**

...
modparam("b2b\_logic", "b2bl\_th\_init\_timeout", 60)
...
	

  

### 1.4.19.�`b2bl_early_update` (int)

Allow bridging of calls in early stage by issuing a "UPDATE" request

*   0 - Do not bridge dialogs in early stage
*   1 - Try to update an session in early stage by sending an UPDATE

_Default value is “0” Do not bridge dialogs in early stage_

**Example�1.20.�Set `b2bl_early_update` parameter**

...
modparam("b2b\_logic", "b2bl\_early\_update", 1)
...
	

  

## 1.5.�Exported Functions

### 1.5.1.� `b2b_init_request(id, [flags], [req_route], [reply_route])`

This function initializes a new B2B session based on an initial INVITE. A new server entity and a new client entity must be created before running this function, with [b2b\_server\_new()](#func_b2b_server_new "1.5.2.� b2b_server_new(id, [adv_contact], [extra_hdrs], [extra_hdr_bodies])") and [b2b\_client\_new()](#func_b2b_client_new "1.5.3.� b2b_client_new(id, dest_uri, [proxy], [from_dname], [adv_contact], [extra_hdrs], [extra_hdr_bodies])"), respectively. These are the initial entities to be connected and further scenario logic can be implemented in the b2b\_logic dedicated routes.

Parameters:

*   _scenario\_id (string)_ - identifier for the scenario of this B2B session. The special value _top hiding_ initializes an internal topology hiding scenario. This scenario will do a simple pass-through of messages from one side to another, and no additional scripting or dedicated routes are required.
    
*   _flags (string, optional)_ - CSV list of the following flags:
    
    *   _setup-timeout=\[nn\]_ - Call setup timeout. 0 sets timeout to max\_duration value. Example: "setup-timeout=300".
        
    *   _transparent-auth_ - Transparent authentication. In this mode b2b passes your 401 or 407 authentication request to destination server.
        
    *   _preserve-to_ - Preserve To: header.
        
    
*   _req\_route (string, optional)_ - name of the script route to be called when requests belonging to this B2B session are received. This parameter will override the global [script\_req\_route](#param_script_req_route "1.4.2.�script_req_route (str)") modparam for this particular B2B session.
    
*   _reply\_route (string, optional)_ - name of the script route to be called when replies belonging to this B2B session are received. This parameter will override the global [script\_reply\_route](#param_script_reply_route "1.4.3.�script_reply_route (str)") modparam for this particular B2B session.
    

This function can be used from REQUEST\_ROUTE.

### Note

If you have a multi interface setup and want to change the outbound interface, it is mandatory to use the "force\_send\_socket()" core function before passing control to b2b function. If you do not do it, the requests may be correctly routed, but the SIP pacakge may be invalid (as Contact, Via, etc).

**Example�1.21.�`b2b_init_request` usage**

...
if(is\_method("INVITE") && !has\_totag() && prepaid\_user()) {
   ...
   # create initial entities
   b2b\_server\_new("server1");
   b2b\_client\_new("client1", $var(media\_uri));

   # initialize B2B session
   b2b\_init\_request("prepaid");
   exit;
}
...
	

  

### 1.5.2.� `b2b_server_new(id, [adv_contact], [extra_hdrs], [extra_hdr_bodies])`

This function creates a new server entity (dialog where OpenSIPS acts as a UAS) to be used for initializing a new B2B session. It should only be used for initial INVITES, before calling [b2b\_init\_request()](#func_b2b_init_request "1.5.1.� b2b_init_request(id, [flags], [req_route], [reply_route])").

Parameters:

*   _id (string)_ - ID used to reference this entity in further B2B actions.
    
*   _adv\_contact (string, optional)_ - Contact header to advertise in generated messages.
    
*   _extra\_hdrs (var, optional)_ - AVP variable holding a list of extra headers (the header names) to be added for any request sent to this entity.
    
*   _extra\_hdr\_bodies (var, optional)_ - AVP variable holding a list of extra header bodies (corresponding to the headers given in the _extra\_hdrs_ parameter) to be added for any request sent to this entity.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.22.�`b2b_server_new` usage**

...
if(is\_method("INVITE") && !has\_totag()) {
   b2b\_server\_new("server1", $avp(b2b\_hdrs), $avp(b2b\_hdr\_bodies));
   ...
}
...
		

  

### 1.5.3.� `b2b_client_new(id, dest_uri, [proxy], [from_dname], [adv_contact], [extra_hdrs], [extra_hdr_bodies])`

This function creates a new client entity (dialog where OpenSIPS acts as a UAC) to be used for initializing a new B2B session or for a bridge action. The function can be used before calling [b2b\_init\_request()](#func_b2b_init_request "1.5.1.� b2b_init_request(id, [flags], [req_route], [reply_route])") or [b2b\_bridge()](#func_b2b_bridge "1.5.4.� b2b_bridge(entity1, entity2, [provmedia_uri], [flags])").

Parameters:

*   _id (string)_ - ID used to reference this entity in further B2B actions.
    
*   _dest\_uri (string)_ - URI of the new destination.
    
*   _proxy (string, optional)_ - URI of the outbound proxy to send the INVITE to.
    
*   _from\_dname (string, optional)_ - Display name to use in the From header.
    
*   _adv\_contact (string, optional)_ - Contact header to advertise in generated messages.
    
*   _extra\_hdrs (var, optional)_ - AVP variable holding a list of extra headers (the header names) to be added for any request sent to this entity.
    
*   _extra\_hdr\_bodies (var, optional)_ - AVP variable holding a list of extra header bodies (corresponding to the headers given in the _extra\_hdrs_ parameter) to be added for any request sent to this entity.
    

This function can be used from REQUEST\_ROUTE and the b2b\_logic request routes.

**Example�1.23.�`b2b_client_new` usage**

...
b2b\_client\_new("client1", "sip:alice@opensips.org");
...
		

  

### 1.5.4.� `b2b_bridge(entity1, entity2, [provmedia_uri], [flags])`

This function bridges two entities, in the context of an existing B2B session (the initial entities are already connected). At least one of the two entities has to be a new client entity.

Parameters:

*   _entity1 (string)_ - ID of the first entity to bridge; the special values: _peer_ and _this_ can also be used to refer to existing entities.
    
*   _entity2 (string)_ - ID of the second entity to bridge; the special values: _peer_ and _this_ can also be used to refer to existing entities.
    
*   _provmedia\_uri (string, optional)_ - URI of the provisional media server to be connected with the caller while the callee answers.
    
*   _flags (string, optional)_ - CSV list of the following flags:
    
    *   _max\_duration=\[nn\]_ - Maximum duration of the B2B session. If the lifetime expires, the B2BUA will send BYE messages to both ends and delete the record. Example: "max\_duration=300".
        
    *   _notify_ - Enable rfc3515 NOTIFY to inform the agent sending the REFER of the status of the reference.
        
    *   _rollback-failed_ - Rollback call to state before bridging in case of transfer failed, don't hangup the call (default behaviour).
        
    *   _hold_ - Put the old entity on hold before bridging it to the new entity.
        
    *   _no-late-sdp_ - Do not attempt late SDP negociation with the new entity. Start the bridging by first contacting the new entity using the initial SDP received from the old entity. After the new entity answers, send a reINVITE without body to the old entity. Use the current SDP received in this new answer from the old entity to trigger a renegociation with the new entity.
        
    

This function can be used from the b2b\_logic request routes.

**Example�1.24.�`b2b_bridge` usage**

...
route\[b2b\_logic\_request\] {
   ...
   b2b\_client\_new("client2", $hdr(Refer-To));

   b2b\_bridge("peer", "client2");
}
...
		

  

### 1.5.5.� `b2b_bridge_retry(new_entity)`

This function can be used to retry a failed bridging action by contacting a new destination. A new client entity must be created before running this function with [b2b\_client\_new()](#func_b2b_client_new "1.5.3.� b2b_client_new(id, dest_uri, [proxy], [from_dname], [adv_contact], [extra_hdrs], [extra_hdr_bodies])").

Parameters:

*   _entity1 (string)_ - ID of the new entity to bridge.
    

This function can be used from the b2b\_logic reply route.

**Example�1.25.�`b2b_bridge` usage**

...
route\[b2b\_logic\_reply\] {
   ...
   if ($b2b\_logic.entity(id) == "client1" && $rm == "INVITE" && $rs >= 300) {
      b2b\_client\_new("client\_retry", "sip:alice@opensips.org");

      b2b\_bridge\_retry("client\_retry");
   } else {
      b2b\_handle\_reply();
   }
   ...
}
...
		

  

### 1.5.6.� `b2b_pass_request()`

This function passes a request belonging to an existing B2B session to the peer entity. The function should be called for all requests unless a different action is required to implement the scenario logic (eg. a bridge action).

This function can be used from the b2b\_logic request routes.

**Example�1.26.�`b2b_pass_request` usage**

...
route\[b2b\_logic\_request\] {
   if ($rm != "BYE") {
      b2b\_pass\_request();
      exit;
   } else {
      # delete the current entity and bridge the peer to a new one
   }
...
		

  

### 1.5.7.� `b2b_handle_reply()`

This function processes the received reply by taking the appropriate actions for the current state of the ongoing B2B session (pass reply to peer, send INVITE or ACK to comeplete an ongoing bridge action etc.). The function should be called for all replies, if a b2b\_logic reply route is defined.

This function can be used from the b2b\_logic reply routes.

**Example�1.27.�`b2b_handle_reply` usage**

...
route\[b2b\_logic\_reply\] {
    xlog("B2B REPLY: \[$rs $rm\] from entity: $b2b\_logic.entity(id)\\n");
    b2b\_handle\_reply();
}
...
		

  

### 1.5.8.� `b2b_send_reply(code, reason[, headers[, body]])`

This function sends a reply to the entity that sent the current request.

Parameters:

*   _code (int)_ - reply code
    
*   _reason (string)_ - reply reason string
    
*   _headers (string, optional)_ - additional headers
    
*   _body (string, optional)_ - message body
    

This function can be used from the b2b\_logic request routes.

**Example�1.28.�`b2b_send_reply` usage**

...
route\[b2b\_logic\_request\] {
   if ($rm == "REFER") {
      b2b\_send\_reply(202, "Accepted");
      ...
   }
}
...
		

  

### 1.5.9.� `b2b_delete_entity()`

This function deletes the entity that sent the current request.

This function can be used from the b2b\_logic request routes.

**Example�1.29.�`b2b_delete_entity` usage**

...
route\[b2b\_logic\_request\] {
   if ($rm == "BYE") {
      b2b\_send\_reply(200, "OK");
      b2b\_delete\_entity();
      ...
   }
}
...
		

  

### 1.5.10.� `b2b_end_dlg_leg()`

This function sends a BYE request to the entity that sent the current request. It is not required to also call [b2b\_delete\_entity()](#func_b2b_delete_entity "1.5.9.� b2b_delete_entity()") in order to delete the current entity.

This function can be used from the b2b\_logic request or reply routes.

**Example�1.30.�`b2b_end_dlg_leg` usage**

...
route\[b2b\_logic\_request\] {
   if ($rm == "REFER") {
      b2b\_send\_reply(202, "Accepted");
      b2b\_end\_dlg\_leg();
   }
}
...
		

  

### 1.5.11.� `b2b_bridge_request(b2bl_key,entity_no, [adv_contact])`

This function will bridge an initial INVITE with one of the particapnts from an existing b2b session.

Parameters:

*   _b2bl\_key (string)_ - a string that contains the b2b\_logic key. The key can also be in the form of _callid;from-tag;to-tag_.
    
*   _entity\_no (int)_ - an integer that holds the entity of the entity/participant to bridge.
    
*   _adv\_contact (string, optional)_ - Contact header to advertise in generated messages.
    

**Example�1.31.�`b2b_bridge_request` usage**

...
if ($rU == "pickup") {
    # get the b2b logic key of the parked call for this user
    cache\_fetch("local", "$fU", $var(b2bl\_key));
    cache\_remove("local", "$fU");

    if ($var(b2bl\_key) != NULL)
        b2b\_bridge\_request($var(b2bl\_key), 0);
    else
        send\_reply(481, "Call/Transaction Does Not Exist");

    exit;
}
...
		

  

### 1.5.12.� `b2b_trigger_scenario(scenario, [params], peer1, [extra_headers_peer1], [extra_headers_contents_peer1], peer2 [extra_headers_peer2], [extra_headers_contents_peer2])`

This function triggers a certain scenario from routing script, e.g. out-of-dialog REFERs.

Parameters:

*   _scenario (string)_ - Name of the scenario to be triggered.
    
*   _params (string, optional)_ - Parameters to be used in this scenario (optionally as CSV)
    
    *   _n_ - Enable rfc3515 NOTIFY to inform the agent sending the REFER of the status of the reference.
        
    *   _session key (string, optional)_ - Internal session key, if the NOTIFY should be sent in a different session on this B2B-UA (e.g. useful for receiving out-of-dialog REFERs)
        
    *   _party of remote session (int, optional)_ - If the NOTIFY should be sent to a different session, which side should receive the NOTIFY of the session (0 = A-Party of the session, 1 = B-Party of the session)
        
    
*   _peer1 (string)_ - Parameters to define the A-Party of the triggered scenario
    
    *   _entitiy\_name (string)_ - Name of the entity
        
    *   _RURI (string)_ - R-URI of the entity to contact
        
    *   _Proxy (string, optional)_ - Outbound Proxy to be used for this entity
        
    *   _Display-Name (string, optional)_ - Display Name to be used for this entity
        
    
*   _extra\_headers\_peer1 (var, optional)_ - AVP variable holding a list of extra headers (the header names) to be added for any request sent for the first entity.
    
*   _extra\_headers\_contents\_peer1 (var, optional)_ - AVP variable holding a list of extra header bodies (corresponding to the headers given in the _extra\_headers\_peer1_ parameter) to be added for any request sent for the first entity.
    
*   _peer2 (string)_ - Parameters to define the B-Party of the triggered scenario. The format is identitical to the definition of _peer1_.
    
*   _extra\_headers\_peer2 (var, optional)_ - AVP variable holding a list of extra headers (the header names) to be added for any request sent for the second entity.
    
*   _extra\_headers\_contents\_peer2 (var, optional)_ - AVP variable holding a list of extra header bodies (corresponding to the headers given in the _extra\_headers\_peer2_ parameter) to be added for any request sent for the second entity.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.32.�`b2b_trigger_scenario` usage**

...
if(is\_method("REFER") && !has\_totag()) {
   $avp(header) = "Replaces";
   $avp(header\_content) = "call-id=xyz";
   b2b\_trigger\_scenario("refer", "n", "conf,sip:conference@10.0.0.1", $avp(header), $avp(header\_content), "callee,sip:user@10.0.0.1,sip:10.0.0.1");
   ...
}
...
		

  

## 1.6.�Exported MI Functions

### 1.6.1.� `b2b_trigger_scenario`

This command initializes a new B2B session where OpenSIPS will start a call from the middle. The initial entities to be connected are specified through the command's parameters and further scenario logic can be implemented in the b2b\_logic dedicated routes.

Name: _b2b\_trigger\_scenario_

Parameters:

*   _senario\_id_ : ID for the scenario of this B2B session.
    
*   _entity1_ - first entity to be connected; specified in the following format: _id,dest\_uri\[,from\_dname\]_ where:
    
    *   _id_ - ID used to reference this entity in further B2B actions
        
    *   _dest\_uri_ - URI of the new destination
        
    *   _from\_dname (optional)_ - Display name to use in the From header.
        
    
*   _entity2_ - second entity to be connected; specified in the same format as _entity1_
    
*   _context (array, optional)_ - array of B2B context values, in the format: _key=value_
    

MI FIFO Command Format:

	opensips-cli -x mi b2b\_trigger\_scenario marketing client1,sip:bob@opensips.org client2,sip:322@opensips.org:5070 agent\_uri=sip:alice@opensips.org
		

### 1.6.2.� `b2b_bridge`

This command can be used by an external application to tell B2BUA to bridge a call party from an on going dialog to another destination. By default the caller is bridged to the new uri and BYE is set to the callee. You can instead bridge the callee if you send 1 as the third parameter.

Name: _b2b\_bridge_

Parameters:

*   _dialog\_id_ : the _b2b\_logic key_, or the _callid;from-tag;to-tag_ of the ongoing dialog.
    
*   _new\_uri_ - the uri of the new destination
    
*   _flag_ (optional) - used to specify that the callee must be bridged to the new destination. If not present the caller will be bridged. Possible values are '0' or '1'.
    
*   _prov\_media\_uri_ (optional) - the uri of a media server able to play provisional media starting from the beginning of the bridging scenario to the end of it. It is optional. If not present, no other entity will be envolved in the bridging scenario
    

MI FIFO Command Format:

	opensips-cli -x mi b2b\_bridge 1020.30 sip:alice@opensips.org
	

opensips-cli Command Format:

	opensips-cli -x mi b2b\_bridge 1020.30 sip:alice@opensips.org
	

### 1.6.3.� `b2b_list`

This command can be used to list the internals of b2b\_logic entities.

Name: _b2b\_list_

Parameters: _none_

MI FIFO Command Format:

	opensips-cli -x mi b2b\_list
	

### 1.6.4.� `b2b_terminate_call`

Terminates an ongoing B2B session.

Name: _b2b\_terminate\_call_

Parameters:

*   _key_ : the _b2b\_logic key_ or the _callid;from-tag;to-tag_ of one of call legs of the ongoing session.
    

MI FIFO Command Format:

	opensips-cli -x mi b2b\_terminate\_call 159.0
	

## 1.7.�Exported Pseudo-Variables

### 1.7.1.� `$b2b_logic.key`

This is a read-only variable that returns the b2b\_logic key of the ongoing B2B session.

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules.

**Example�1.33.�`$b2b_logic.key` usage**

...
local\_route {
   ...
   if ($b2b\_logic.key) {
      xlog("request belongs to B2B session: $b2b\_logic.key\\n");
      ...
   }
   ...
}
...
	

  

### 1.7.2.� `$b2b_logic.entity(field)[idx]`

This is a read-only variable that returns information about the entities(dialogs) involved in the ongoing B2B session.

The available entity information is:

*   the Call-ID of the dialog, accessible by using the _callid_ subname;
    
*   the entity key, accessible by using the _key_ subname or no subname at all.
    
*   the entity ID, accessible by using the _id_ subname.
    
*   the From-Tag of the dialog, accessible by using the _fromtag_ subname.
    
*   the To-Tag of the dialog, accessible by using the _totag_ subname.
    

The index is used to select which entity from the B2B session to refer to. The only possible values are _0_ or _1_ and correspond to the positions of the entities in the scenario. Initially, this depends on the order in which the entities are created. In the case of the internal topology hiding scenario, _0_ is the caller and _1_ is the callee. When a further bridge action happens, the bridged entity is always placed on the _0_ index and the new entity on _1_.

If no index is provided, the variable will refer to the entity(dialog) which the current SIP message belongs to.

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules.

**Example�1.34.�`$b2b_logic.entity` usage**

...
modparam("b2b\_entities", "script\_request\_route", "b2b\_request")
...
route\[b2b\_request\] {
   ...
   xlog("received request for entity: $b2b\_logic.entity\\n");
   ...
   if ($rm == "BYE" && $b2b\_logic.entity == $(b2b\_logic.entity\[1\]))
      xlog("Disconnecting callee\\n")
   ...
}
...
	

  

### 1.7.3.� `$b2b_logic.ctx(key)`

This is a read-write variable that provides access to a custom Key-Value storage(of string values) in the context of the ongoing B2B session.

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules. In the main request route the variable can be used for storing a new context value even before instantiating the scenario with _b2b\_init\_request()_.

Setting the variable to _NULL_ will delete the value at the given key.

**Example�1.35.�`$b2b_logic.ctx` usage**

...
modparam("b2b\_entities", "script\_reply\_route", "b2b\_reply")
...
route {
   ...
   b2b\_init\_request("prepaid", "sip:alice@127.0.0.1");

   $b2b\_logic.ctx(my\_extra\_info) = "my\_value";
   ...
}
...
route\[b2b\_reply\] {
   ...
   xlog("my info: $b2b\_logic.ctx(my\_extra\_info)\\n");
   ...
}
...
	

  

### 1.7.4.� `$b2b_logic.scenario(key)`

This is a read-only variable that returns the scenario ID of the ongoing B2B session

The variable can be used in request route, local\_route and the dedicated routes defined through the _b2b\_entities_ and _b2b\_logic_ modules.

**Example�1.36.�`$b2b_logic.scenario` usage**

...
route\[b2b\_logic\_request\] {
   if ($b2b\_logic.scenario == "prepaid") {
      route(prepaid);
   } else {
      route(marketing);
   }
}
...
	

  

## Chapter�2.�Developer Guide

The module provides an API that can be used from other OpenSIPS modules. The API offers the functions for instantiating b2b scenarios from other modules (this comes as an addition to the other two means of instantiating b2b scenarios - from script and with an MI command). Also the instantiations can be dynamically controlled, by commanding the bridging of an entity involved in a call to another entity or the termination of the call or even bridging two existing calls.

## 2.1.� `b2b_logic_bind(b2bl_api_t* api)`

This function binds the b2b\_entities modules and fills the structure the exported functions that will be described in detail.

**Example�2.1.�`b2bl_api_t` structure**

...
typedef struct b2bl\_api
{
	b2bl\_init\_f init;
	b2bl\_bridge\_f bridge;
	b2bl\_bridge\_extern\_f bridge\_extern;
	b2bl\_bridge\_2calls\_t bridge\_2calls;
	b2bl\_terminate\_call\_t terminate\_call;
	b2bl\_set\_state\_f set\_state;
	b2bl\_bridge\_msg\_t bridge\_msg;
}b2bl\_api\_t;
...

  

## 2.2.� `init`

Field type:

...
typedef str\* (\*b2bl\_init\_f)(struct sip\_msg\* msg, str\* name, str\* args\[5\],
		b2bl\_cback\_f, void\* param);
...

Initializing a b2b scenario. The last two parameters are the callback function and the parameter to be called in 3 situations that will be listed below. The callback function has the following definition:

...
typedef int (\*b2b\_notify\_t)(struct sip\_msg\* msg, str\* id, int type, void\* param);
...

The first argument is the callback given in the init function.

The second argument is a structure with some statistics about the call -start time, setup time, call time.

The third argument is the current state of the scenario instantiation.

The last argument is the event that triggered the callback. There are 3 events when the callback is called:

*   _when a BYE is received from either side- event parameter will also show from which side the BYE is received, so it can be B2B\_BYE\_E1 or B2B\_BYE\_E2_
    
*   _If while bridging, a negative reply is received from the second entity - the event is B2B\_REJECT\_E2._
    
*   _When the b2b logic entity is deleted- the evnet is B2B\_DESTROY_
    

The return code controls what will happen with the request/reply that caused the event (except for the last event, when the return code does not matter)

*   _\-1 - error_
    
*   _0 - drop the BYE or reply_
    
*   _1 - send the BYE or reply on the other side_
    
*   _2 - do what the scenario tells, if no rule defined send the BYE or reply on the other side_
    

## 2.3.� `bridge`

Field type:

...
typedef int (\*b2bl\_bridge\_f)(str\* key, str\* new\_uri, str\* new\_from\_dname,int entity\_type);
...

This function allows bridging an entity that is in a call handled by b2b\_logic to another entity.

## 2.4.� `bridge_extern`

Field type:

...
typedef str\* (\*b2bl\_bridge\_extern\_f)(str\* scenario\_name, str\* args\[5\],
                b2bl\_cback\_f cbf, void\* cb\_param);
...

This function allows initiating an extern scenario, when the B2BUA starts a call from the middle.

## 2.5.� `bridge_2calls`

Field type:

...
typedef int (\*b2bl\_bridge\_2calls\_t)(str\* key1, str\* key2);
...

With this function it is possible to bridge two existing calls. The first entity from the two calls will be connected and BYE will be sent to their peers.

## 2.6.� `terminate_call`

Field type:

...
typedef int (\*b2bl\_terminate\_call\_t)(str\* key);
...

Terminate a call.

## 2.7.� `set_state`

Field type:

...
typedef int (\*b2bl\_set\_state\_f)(str\* key, int state);
...

Set the scenario state.

## 2.8.� `bridge_msg`

Field type:

...
typedef int (\*b2bl\_bridge\_msg\_t)(struct sip\_msg\* msg, str\* key, int entity\_no);
...

This function allows bridging an incoming call to an entity from an existing call.

The first argument is the INVITE message of the current incoming call.

The second argument is the b2bl\_key of an existing call.

The third argument is the entity identifier.

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

235

57

8167

6793

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

41

29

820

250

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

16

12

148

72

4.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

14

10

346

36

5.

Carsten Bock

12

5

679

23

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

26

26

7.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

5

3

4

3

8.

truong.hua

4

2

8

7

9.

andingv

3

1

9

7

10.

Aron Podrigal ([@ar45](https://github.com/ar45))

3

1

1

1

  

**All remaining contributors**: Shanee Vanstone, Zero King ([@l2dy](https://github.com/l2dy)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jan 2021 - Mar 2026

2.

andingv

Nov 2025 - Nov 2025

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2021 - Jan 2025

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Nov 2020 - Feb 2024

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Nov 2020 - Jul 2023

6.

Shanee Vanstone

Apr 2023 - Apr 2023

7.

truong.hua

Jan 2023 - Feb 2023

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Feb 2023

9.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Feb 2021 - Oct 2022

10.

Carsten Bock

Mar 2022 - Apr 2022

  

**All remaining contributors**: Aron Podrigal ([@ar45](https://github.com/ar45)), Zero King ([@l2dy](https://github.com/l2dy)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Carsten Bock, Nick Altmann ([@nikbyte](https://github.com/nikbyte)).

_Documentation Copyrights:_

Copyright � 2022 [ng-voice GmbH](https://www.ng-voice.com)

Copyright � 2010 [VoIP Embedded, Inc.](http://www.voipembedded.com)

Copyright � 2009 Anca-Maria Vamanu