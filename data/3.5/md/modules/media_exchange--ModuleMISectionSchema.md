## 1.4.�Exported MI Functions

### 1.4.1.� `media_fork_from_call_to_uri`

MI command that has the same behavior as [media\_fork\_to\_uri()](#func_media_fork_to_uri "1.3.1.� media_fork_to_uri(URI[, leg[, headers[, medianum]]])"), only that the triggering is not script driven, but exterior driven. Useful for starting listening a call.

Name: _media\_fork\_from\_call\_to\_uri_

Parameters

*   _callid_ (string) - the callid of the dialog that will have its RTP streamed to the new call towards the Media Server
    
*   _uri_ (string) - the destination URI of the new call
    
*   _leg_ (string, optional) - indicates the participant leg that will have its RTP streamed in the new call. Possible values are “caller”, “callee” or “both”. If missing, both media streams are forked
    
*   _headers_ (string, optional) - extra headers to add to the outgoing request
    
*   _medianum_ (integer, optional) - the media stream that will be forked within the call. First index is 0. If missing, all media streams of that leg(s) are streamed.
    

MI FIFO Command Format:

\# start streaming a callid to record media server
opensips-cli -x mi media\_fork\_from\_call\_to\_uri \\
	callid=c6fdb0f9-47dc-495d-8d38-0f37e836a531 \\
	uri=sip:record@127.0.0.1:5080
		

### 1.4.2.� `media_exchange_from_call_to_uri`

MI command that has the same behavior as [media\_exchange\_from\_uri()](#func_media_exchange_from_uri "1.3.5.� media_exchange_from_uri(URI[, leg[, body[, headers[, nohold]]]])"), only that the triggering is not script driven, but exterior driven. Useful for injecting media announcements during a call.

Name: _media\_exchange\_from\_call\_to\_uri_

Parameters

*   _callid_ (string) - the callid of the dialog that will have it's leg mixed with the new call to the Media Server
    
*   _uri_ (string) - the destination URI of the new call
    
*   _leg_ (string) - indicates the participant that will have its media pined into the new call. Possible values are “caller” and “callee”.
    
*   _headers_ (string, optional) - extra headers to add to the outgoing request
    
*   _nohold_ (integer, optional) - if set to a non-zero value, the module avoids putting the other participant on hold when the media exchanging starts
    

MI FIFO Command Format:

\# start playing back an annoucement to caller
opensips-cli -x mi media\_exchange\_from\_call\_to\_uri \\
	callid=c6fdb0f9-47dc-495d-8d38-0f37e836a531 \\
	uri=sip:announcement@127.0.0.1:5080 \\
	leg=caller
		

### 1.4.3.� `media_exchange_from_call_to_uri_body`

MI command that does the same thing as the [media\_exchange\_from\_call\_to\_uri](#mi_media_exchange_from_call_to_uri "1.4.2.� media_exchange_from_call_to_uri") MI function, but also allows you to specify a custom body in the outgoing request. The body has to be specified in the mandatory _body_ parameter, all the other parameters being the same as the ones of [media\_exchange\_from\_call\_to\_uri](#mi_media_exchange_from_call_to_uri "1.4.2.� media_exchange_from_call_to_uri").

### 1.4.4.� `media_terminate`

MI command to terminate an ongoing media exchange.

Name: _media\_terminate_

Parameters

*   _callid_ (string) - the callid of the dialog that will have the media exchange terminated.
    
*   _leg_ (string, optional) - the leg for whom to terminate the media exchange. Accepted values are _caller_, _callee_ and _both_. If missing, all media sessions are terminated.
    
*   _nohold_ (integer, optional) - if specified and has a non-zero value, the leg that is being terminated is not put on hold if the other participant still has an ongoing media session.
    

MI FIFO Command Format:

\# terminate a caller announcement
opensips-cli -x mi media\_terminate \\
	callid=c6fdb0f9-47dc-495d-8d38-0f37e836a531 \\
	leg=caller