## 1.4.�Exported Functions

### 1.4.1.� `ua_session_server_init([key], [flags], [extra_params])`

This function initializes a new UA session by processing an initial INVITE. Further requests/replies received belonging to this session will only be handled via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.

Parameters:

*   _key (var, optional)_ - Variable to return the b2b entity key of the new UA session.
    
*   _flags (string, optional)_ - configures options for this UA session via the following flags:
    
    *   _t\[nn\]_ - maximum duration of this session in seconds. After this timeout a BYE will be sent and the session will be deleted. If this is not set, the default timeout, configured with [ua\_default\_timeout](#param_ua_default_timeout "1.3.15.�ua_default_timeout (str)") will be used. Example: _t3600_
        
    *   _a_ - report the receving of ACK requests via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _r_ - report the receving of replies via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _d_ - disable the automatic sending of ACK upon receving a 200 OK reply for INVITE (in case of UAC session) or re-INVITE.
        
    *   _h_ - provide the headers of the SIP request/reply in the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _b_ - provide the body of the SIP request/reply in the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
        
    *   _n_ - do not trigger the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event (with event\_type _NEW_) for initial INVITES handled with this function.
        
    
*   _extra\_params (string, optional)_ - An arbitrary value to be passed to the _extra\_params_ parameter in the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.16.�`ua_session_server_init` usage**

...
if(is\_method("INVITE") && !has\_totag()) {
   ua\_session\_server\_init($var(b2b\_key), "arhb");

   ua\_session\_reply($var(b2b\_key), "INVITE", 200, "OK", $var(my\_sdp));
   
   exit;
}
...
		

  

### 1.4.2.� `ua_session_update(key, method, [body], [extra_headers], [content_type])`

Sends a sequential request for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags], [extra_params])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Parameters:

*   _key (string)_ - b2b entity key of the UA session.
    
*   _method (string)_ - name of the SIP method for this request.
    
*   _body (string, optional)_ - body to include in the SIP message.
    
*   _extra\_headers (string, optional)_ - extra headers to include in the SIP message.
    
*   _content\_type (string, optional)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

This function can be used from REQUEST\_ROUTE, EVENT\_ROUTE.

**Example�1.17.�`ua_session_update` usage**

...
ua\_session\_update($var(b2b\_key), "OPTIONS");
...
		

  

### 1.4.3.� `ua_session_reply(key, method, code, [reason], [body], [extra_headers], [content_type])`

Sends a reply for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags], [extra_params])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Parameters:

*   _key (string)_ - b2b entity key of the UA session.
    
*   _method (string)_ - name of the SIP method that is replied to.
    
*   _code (int)_ - reply code.
    
*   _reason (string, optional)_ - reply reason string.
    
*   _body (string, optional)_ - body to include in the SIP message.
    
*   _extra\_headers (string, optional)_ - extra headers to include in the SIP message.
    
*   _content\_type (string, optional)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

This function can be used from REQUEST\_ROUTE, EVENT\_ROUTE.

**Example�1.18.�`ua_session_reply` usage**

...
ua\_session\_reply($var(b2b\_key), "INVITE", 180, "Ringing");
...
		

  

### 1.4.4.� `ua_session_terminate(key, [extra_headers])`

Terminate a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags], [extra_params])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Parameters:

*   _key (string)_ - b2b entity key of the UA session.
    
*   _extra\_headers (string, optional)_ - extra headers to include in the SIP message
    

This function can be used from REQUEST\_ROUTE, EVENT\_ROUTE.

**Example�1.19.�`ua_session_terminate` usage**

...
ua\_session\_terminate($var(b2b\_key));
...