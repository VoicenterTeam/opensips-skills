## 1.6.�Exported MI Functions

### 1.6.1.� `msrp_ua_send_message`

Sends a new MSRP message to the peer.

Name: _msrp\_ua\_send\_message_

Parameters

*   _session\_id_ (string) - the MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _mime_ (string, optional) - MIME content type of this message. If missing, an empty message will be sent.
    
*   _body_ (string, optional) - actual message body. If missing, an empty message will be sent.
    
*   _success\_report_ (string, optional) - string indicating whether to request an MSRP Success Report. Possible values are _yes_ or _no_. If the parameter is missing or is set to "no" the SEND request will not include a Success-Report header.
    
*   _failure\_report_ (string, optional) - string indicating whether to request an MSRP Failure Report. Possible values are _yes_, _no_ or _partial_, as specified in MSRP. If the parameter is missing or is set to "yes" the SEND request will not include a Failure-Report header. Note that if the header field is not present, the receving MSRP endpoint must treat it the same as a Failure-Report header with a value of "yes".
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_send\_message \\
	session\_id=5addd9e7b74fa44fbace68a4fc562293 \\
	mime=text/plain body=Hello success\_report=yes
		

### 1.6.2.� `msrp_ua_start_session`

Starts a MSRP session.

The [advertised\_contact](#param_advertised_contact "1.4.5.�advertised_contact (string)") is mandatory if this function is used.

Name: _msrp\_ua\_start\_session_

Parameters

*   _content\_types_ (string) - content types adevertised in the _accept-types_ SDP attribute.
    
*   _from\_uri_ (string) - From URI to be used in the INVITE.
    
*   _to\_uri_ (string) - To URI to be used in the INVITE.
    
*   _ruri_ (string) - Request URI and destination of the INVITE.
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_start\_session \\
	text/plain sip:oss@opensips.org \\
	sip:alice@opensips.org sip:alice@opensips.org
		

### 1.6.3.� `msrp_ua_list_sessions`

Lists information about ongoing MSRP sessions.

Name: _msrp\_ua\_list\_sessions_

Parameters

*   _None_.
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_list\_sessions
		

### 1.6.4.� `msrp_ua_end_session`

Terminate an ongoing MSRP session.

Name: _msrp\_ua\_end\_session_

Parameters

*   _session\_id_ (string) - the MSRP session identifier ("session-id" part of the MSRP URI).
    

MI FIFO Command Format:

opensips-cli -x mi msrp\_ua\_end\_session \\
	5addd9e7b74fa44fbace68a4fc562293