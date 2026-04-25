## 1.7.�Exported Events

### 1.7.1.� `E_MSRP_SESSION_NEW`

This event is triggered when a new MSRP session is successfully established(ACK sent/received).

Parameters:

*   _from\_uri_ - The URI in the SIP From header of the answered INVITE.
    
*   _to\_uri_ - The URI in the SIP To header of the answered INVITE.
    
*   _ruri_ - The SIP Request URI of the answered INVITE.
    
*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _content\_types_ - The content types offered by the peer in the _accept-types_ SDP attribute.
    

### 1.7.2.� `E_MSRP_SESSION_END`

This event is triggered when an ongoing MSRP session is terminted (session expires or BYE is received; terminating a session via the _msrp\_ua\_end\_session_ MI function is not included).

Parameters:

*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    

### 1.7.3.� `E_MSRP_MSG_RECEIVED`

This event is triggered when receiving a new, non-empty MSRP SEND request from the peer.

Parameters:

*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _content\_type_ - The content type of this message.
    
*   _body_ - The actual message body.
    

### 1.7.4.� `E_MSRP_REPORT_RECEIVED`

This event is triggered when:

*   a MSRP REPORT request is received
    
*   a failure transaction response is received
    
*   a local timeout for a SEND request occured.
    

Parameters:

*   _session\_id_ - The MSRP session identifier ("session-id" part of the MSRP URI).
    
*   _message\_id_ - The value of the Message-ID header field.
    
*   _status_ - The value of the Status header field.
    
*   _byte\_range_ - The value of the Byte-Range header field.