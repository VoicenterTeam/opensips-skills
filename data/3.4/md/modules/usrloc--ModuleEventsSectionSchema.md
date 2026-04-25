## 1.9.�Exported Events

### 1.9.1.� `E_UL_AOR_INSERT`

This event is raised when a new AOR is inserted in the USRLOC memory cache.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the inserted record.
    

### 1.9.2.� `E_UL_AOR_DELETE`

This event is raised when a new AOR is deleted from the USRLOC memory cache.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the deleted record.
    

### 1.9.3.� `E_UL_CONTACT_INSERT`

This event is raised when a new contact is inserted in any of the existing AOR's contact list. For each new contact, if its AOR does not exist in the memory, then both the E\_UL\_AOR\_CREATE and E\_UL\_CONTACT\_INSERT events will be raised.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the inserted contact.
    
*   _uri_ - The contact URI of the inserted contact.
    
*   _received_ - IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
    
*   _path_ - The PATH header value of the registration message.(empty string if not present)
    
*   _qval_ - The Q value (priority) of the contact (as integer value from 0 to 10).
    
*   _user\_agent_ - The User-Agent header value.
    
    _NOTICE:_ Can contain spaces.
    
*   _socket_ - The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
    
*   _bflags_ - The branch flags (bflags) of the contact (in integer value of the bitmask)
    
*   _expires_ - The expires value of the contact (as UNIX timestamp integer).
    
*   _callid_ - The Call-ID header of the registration message.
    
*   _cseq_ - The cseq number as an int value.
    
*   _attr_ - The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
    
*   _latency_ - The latency of the last successful ping for this contact, in microseconds. Until the first ping reply for a given contact arrives, its pinging latency will be 0.
    
*   _shtag_ - The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the **$cluster.sh\_tag** pseudo-variable in order to perform the check).
    
    _NOTICE:_ If a contact has no shared tag attached to it, the value of this parameter will be "" (empty string)!
    

### 1.9.4.� `E_UL_CONTACT_DELETE`

This event is raised when a contact is deleted from an existing AOR's contact list. If the contact is the only one in the list then both the E\_UL\_AOR\_DELETE and E\_UL\_CONTACT\_DELETE events will be raised.

Parameters: same as the [E\_UL\_CONTACT\_INSERT](#event_E_UL_CONTACT_INSERT "1.9.3.� E_UL_CONTACT_INSERT") event

### 1.9.5.� `E_UL_CONTACT_UPDATE`

This event is raised when a contact's info is updated by receiving another registration message.

Parameters: same as the [E\_UL\_CONTACT\_INSERT](#event_E_UL_CONTACT_INSERT "1.9.3.� E_UL_CONTACT_INSERT") event

### 1.9.6.� `E_UL_CONTACT_REFRESH`

This event may only be raised for RFC 8599 (Push Notification) enabled contacts.

Set [contact\_refresh\_timer](#param_contact_refresh_timer "1.5.41.�contact_refresh_timer (boolean)") to _true_ in order to enable this event. The event is raised within reasonable time before an RFC 8599 enabled contact will expire, such that the script writer can take action, possibly force a registration refresh from the endpoint.

Parameters:

*   _domain_ - The name of the table.
    
*   _aor_ - The AOR of the inserted contact.
    
*   _uri_ - The contact URI of the inserted contact.
    
*   _received_ - IP, port and protocol the registration message was received from. If these have the same value as the contact's address (see the address parameter) then the received parameter will be an empty string.
    
*   _user\_agent_ - The User-Agent header value.
    
    _NOTICE:_ Can contain spaces.
    
*   _socket_ - The SIP socket/listener (as string) used by OpenSIPS to receive the contact registations.
    
*   _bflags_ - The branch flags (bflags) of the contact (in integer value of the bitmask)
    
*   _expires_ - The expires value of the contact (as UNIX timestamp integer).
    
*   _callid_ - The Call-ID header of the registration message.
    
*   _attr_ - The attributes string attached to the contact (the custom attributes attached from the script level). As this string is options, if missing in the contact, the event will push the empty string for this event field.
    
*   _shtag_ - The shared tag of the contact, which helps determine if the current node owns the contact (e.g. possibly using the **$cluster.sh\_tag** pseudo-variable in order to perform the check).
    
*   _reason_ - the reason why the binding refresh event was triggered. Possible values:
    
    *   "reg-refresh" - periodic refresh triggered by OpenSIPS
        
    *   "ini-INVITE", "ini-SUBSCRIBE", etc. - a refresh triggered by an incoming initial SIP request
        
    *   "mid-INVITE", "mid-BYE", etc. - a refresh triggered by an incoming mid-dialog SIP request
        
    
*   _req\_callid_ - the Call-ID of the SIP request which triggered this event, if any. This gives the ability to logically link the pending request with the current event and access useful data from that request (e.g. caller identity, dialed number, etc.).
    
    Using the _req\_callid_, if a dialog has been created for the pending request, this dialog may be temporarily loaded inside the event\_route using the [load\_dialog\_ctx()](dialog#func_load_dialog_ctx) and [unload\_dialog\_ctx()](dialog#func_unload_dialog_ctx) functions of the dialog module.
    

### 1.9.7.� `E_UL_LATENCY_UPDATE`

This event is raised when a contact pinging latency matches either of the [latency\_event\_min\_us](#param_latency_event_min_us "1.5.37.�latency_event_min_us (integer)") or [latency\_event\_min\_us\_delta](#param_latency_event_min_us_delta "1.5.38.�latency_event_min_us_delta (integer)") filters. If none of these filters is set, this event will get raised for each successful contact ping operation.

Parameters: same as the [E\_UL\_CONTACT\_INSERT](#event_E_UL_CONTACT_INSERT "1.9.3.� E_UL_CONTACT_INSERT") event