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