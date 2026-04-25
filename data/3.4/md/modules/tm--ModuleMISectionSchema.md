## 1.6.�Exported MI Functions

### 1.6.1.� `t_uac_dlg`

Generates and sends a local SIP request.

Parameters:

*   _method_ - request method
    
*   _ruri_ - request SIP URI
    
*   _headers_ - set of additional headers to be added to the request; at least “From” and “To” headers must be specified)
    
*   _next\_hop_ (optional) - next hop SIP URI (OBP).
    
*   _socket_ (optional) - local socket to be used for sending the request.
    
*   _body_ (optional) - request body (if present, requires the “Content-Type” and “Content-length” headers)
    

MI FIFO Command Format:

		opensips-cli -x mi t\_uac\_dlg method=INVITE ruri="sip:alice@127.0.0.1:7050" headers="From: sip:bobster@127.0.0.1:1337\\r\\nTo: sip:alice@127.0.0.1:7050\\r\\nContact: sip:bobster@127.0.0.1:1337\\r\\n"
		

### 1.6.2.� `t_uac_cancel`

Generates and sends a CANCEL for an existing SIP request.

Parameters:

*   _callid_ - callid of the INVITE request to be cancelled.
    
*   _cseq_ - cseq of the INVITE request to be cancelled.
    

MI FIFO Command Format:

		opensips-cli -x mi t\_uac\_cancel "1-23454@127.0.0.1" "1 INVITE"
		

### 1.6.3.� `t_hash`

Gets information about the load of TM internal hash table.

Parameters:

*   _none_
    

MI FIFO Command Format:

		opensips-cli -x mi t\_hash
		

### 1.6.4.� `t_reply`

Generates and sends a reply for an existing inbound SIP transaction.

Parameters:

*   _code_ - reply code
    
*   _reason_ - reason phrase.
    
*   _trans\_id_ - transaction identifier (has the hash\_entry:label format)
    
*   _to\_tag_ - To tag to be added to TO header
    
*   _new\_headers_ (optional) - extra headers to be appended to the reply.
    
*   _body_ - (optional) reply body (if present, requires the “Content-Type” and “Content-length” headers)
    

MI FIFO Command Format:

		opensips-cli -x mi t\_reply 403 Forbidden 46961:1279687637 abcde .