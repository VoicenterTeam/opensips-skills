## 1.5.�Exported MI Functions

### 1.5.1.� `b2be_list`

This command can be used to list the internals of the b2b entities.

Name: _b2be\_list_

Parameters: _none_

MI FIFO Command Format:

	opensips-cli -x mi b2be\_list
	

### 1.5.2.� `ua_session_client_start`

This command starts a new UAC session by sending an initial INVITE. Further requests/replies received belonging to this session will only be handled via the [E\_UA\_SESSION](#event_E_UA_SESSION "1.6.1.� E_UA_SESSION") event.

Name: _ua\_session\_client\_start_

Parameters:

*   _ruri_ - Request URI
    
*   _to_ - To URI; can also be specified as: _display\_name,uri_ in order to set a Display Name, eg. _Alice,sip:alice@opensips.org_.
    
*   _from_ - From URI; can also be specified as: _display\_name,uri_ in order to set a Display Name, eg. _Alice,sip:alice@opensips.org_
    
*   _proxy (optional)_ - URI of the outbound proxy to send the INVITE to
    
*   _body (optional)_ - message body
    
*   _content\_type (optional)_ - Content Type header to use. If missing and a body is provided, "Content-Type: application/sdp" will be used.
    
*   _extra\_headers (optional)_ - extra headers
    
*   _flags (optional)_ - flags with the same meaning as for the _flags_ paramater of [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])").
    
*   _socket (optional)_ - OpenSIPS sending socket
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_client\_start ruri=sip:bob@opensips.org \\
to=sip:bob@opensips.org from=sip:alice@opensips.org flags=arhb

### 1.5.3.� `ua_session_update`

Sends a sequential request for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_update_

Parameters:

*   _key_ - b2b entity key of the UA session.
    
*   _method_ - name of the SIP method for this request.
    
*   _body (optional)_ - body to include in the SIP message.
    
*   _extra\_headers (optional)_ - extra headers to include in the SIP message.
    
*   _content\_type (string)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_update key=B2B.436.1925389.1649338095 method=OPTIONS

### 1.5.4.� `ua_session_reply`

Sends a reply for a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_reply_

Parameters:

*   _key_ \- b2b entity key of the UA session.
    
*   _method_ \- name of the SIP method that is replied to.
    
*   _code_ \- reply code
    
*   _reason_ - reply reason string
    
*   _body (optional)_ - body to include in the SIP message
    
*   _extra\_headers (optional)_ - extra headers to include in the SIP message
    
*   _content\_type (optional)_ - Content-Type header. If the parameter is missing and a body is provided, "Content-Type: application/sdp" will be used.
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_reply key=B2B.436.1925389.1649338095 method=OPTIONS code=200 reason=OK

### 1.5.5.� `ua_session_terminate`

Terminate a UA session started with the [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_terminate_

Parameters:

*   _key_ \- b2b entity key of the UA session.
    
*   _extra\_headers (optional)_ - extra headers to include in the SIP message
    

opensips-cli Command Format:

opensips-cli -x mi ua\_session\_terminate key=B2B.436.1925389.1649338095

### 1.5.6.� `ua_session_list`

List information about UA sessions started with [ua\_session\_server\_init()](#func_ua_session_server_init "1.4.1.� ua_session_server_init([key], [flags])") function or the [ua\_session\_client\_start](#mi_ua_session_client_start "1.5.2.� ua_session_client_start") MI function.

Name: _ua\_session\_list_

Parameters:

*   _key (optional)_ - b2b entity key of the UA session to list. If missing, all sessions will be listed.
    

MI FIFO Command Format:

	opensips-cli -x mi ua\_session\_list