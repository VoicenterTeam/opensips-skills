## 1.6.�Exported Events

### 1.6.1.� `E_UA_SESSION`

This event is triggered for requests/replies belonging to an ongoing UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags], [extra_params])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Note that replies will not be reported at all unless the _r_ flag was set when initiating the UA session. Also ACK requests are only reported if the _a_ flag was set.

Parameters:

*   _key_ - b2b entity key of the UA session.
    
*   _entity\_type_ - indicates whether this is a _UAS_ or _UAc_ entity.
    
*   _event\_type_ - the type of event:
    
    *   _NEW_ - for initial INVITE requests, handled with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags], [extra_params])") function.
        
    *   _EARLY_ - for 1xx provisional responses
        
    *   _ANSWERED_ - for 2xx successful responses
        
    *   _REJECTED_ - for 3xx-6xx failure responses
        
    *   _UPDATED_ - for any sequential requests, including ACK but excluding BYE/CANCEL
        
    *   _TERMINATED_ - for BYE or CANCEL requests
        
    
*   _status_ - the reply status code if the message is a SIP reply
    
*   _reason_ - the reply reason if the message is a SIP reply
    
*   _method_ - the SIP method name
    
*   _body_ - SIP message body
    
*   _headers_ - full list of all SIP headers in the message.
    
*   _extra\_params_ - an arbitrary value. Currently only the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags], [extra_params])") function passes this if the _extra\_params_ argument is used, and it only appears in the _NEW_ event\_type.