## 1.3.�Exported Functions

### 1.3.1.� `media_fork_to_uri(URI[, leg][, headers][, medianum][, instance])`

Behaves as a B2B user agent client to initiate a call to a SIP URI and then stream the media to the SDP received in the 200 OK response.

Can be called multiple times, and will create a new call for each invocation. The generated calls can be identified using the _instance_ parameter.

Parameters:

*   _URI_ (string) - destination where to push the current call's media
    
*   _leg_ (string, optional) - the leg that will be streamed. Possible values are _caller_, _callee_ and _both_. If missing, the direction of the indialog request is used.
    
*   _headers_ (string, optional) - optional headers added to the generated request.
    
*   _medianum_ (integer, optional) - the media stream that will be forked within the call. First index is 0. If missing, all media streams of that leg(s) are streamed.
    
*   _instance_ (string, optional) - a unique name for identifying the forking instance. If missing, the _default_ name is assumed.
    

This function can be used from any route.

**Example�1.1.�Use `media_fork_to_uri()` function to fork media to a Media Server**

...
if (!has\_totag() && is\_method("INVITE"))
	media\_fork\_to\_uri("sip:record@127.0.0.1:5080");
...
	

  

### 1.3.2.� `media_fork_from_call(callid[, leg][, medianum][, instance])`

Starts streaming the media of an existing proxied call, identified by the _callid_ parameter to the SDP in the request's body.

Can be called multiple times, and will accept a new call for each invocation. The calls can be identified using the _instance_ parameter.

Parameters:

*   _callid_ (string) - the identifier of the callid to stream/fork media from
    
*   _leg_ (string, optional) - the leg that will be streamed. Possible values are _caller_, _callee_ and _both_. If missing, both legs will be streamed.
    
*   _medianum_ (integer, optional) - the media stream that will be forked within the call. First index is 0. If missing, all media streams of that leg(s) are streamed, as long as the body has enough streams.
    
    _Note:_ RTPProxy does not do any media mixing, therefore you need to make sure that the INVITE has enough SDP streams to handle all the media streams selected to fork.
    
*   _instance_ (string, optional) - a unique name for identifying the forking instance. If missing, the _default_ name is assumed.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

_NOTE:_ the request of this call is completely handled by the B2B engine. Therefore, after running this function, please make sure you do not relay the message further, otherwise you will run into an unexpected behavior. Best thing to do is to exit the processing after running the function.

**Example�1.2.�Use `media_fork_from_call()` function to fork all media streams of a call**

...
if (!has\_totag() && is\_method("INVITE") && $hdr(X-CallID) != NULL)
	media\_fork\_from\_call($hdr(X-CallID));
...
	

  

**Example�1.3.�Use `media_fork_from_call()` function to fork only the first caller's stream**

...
if (!has\_totag() && is\_method("INVITE") && $hdr(X-CallID) != NULL)
	media\_fork\_from\_call($hdr(X-CallID), "caller", 0);
...
	

  

### 1.3.3.� `media_fork_pause([leg][, medianum][, instance])`

Pauses an existing RTP media streaming session. This function does not terminate the forking call, but only stops sending the RTP. It also re-invites the Media Server to inform about the change.

Parameters:

*   _leg_ (string, optional) - the leg that will be paused. Possible values are _caller_, _callee_ and _both_. If missing, all ongoing media sessions will be paused.
    
*   _medianum_ (integer, optional) - the media stream to be paused. First index is 0. If missing, all ongoing media streams associated to the selected leg will be paused.
    
*   _instance_ (string, optional) - the forking instance to be paused. If missing, all instances are paused.
    

This function can be used from any route.

**Example�1.4.�Use `media_fork_pause()` function to temporarily stop the entire media stream of the call**

...
if (has\_totag() && is\_method("INVITE"))
	media\_fork\_pause();
...
	

  

### 1.3.4.� `media_fork_resume([leg][, medianum][, instance])`

Resumes the RTP media stream of an existing session/call. This function relies on the fact that a media fork session has been previously started.

Parameters:

*   _leg_ (string, optional) - the leg that will be resumed. Possible values are _caller_, _callee_ and _both_. If missing, all existing media legs that are stopped will be started.
    
*   _medianum_ (integer, optional) - the media stream to be paused. First index is 0. If missing, all ongoing media streams associated to the selected leg will be paused.
    
*   _instance_ (string, optional) - the forking instance to be resumed. If missing, all instances are resumed.
    

This function can be used from any route.

**Example�1.5.�Use `media_fork_resume()` function to resume a forking previously stopped**

...
if (has\_totag() && is\_method("INVITE"))
	media\_fork\_resume();
...
	

  

### 1.3.5.� `media_exchange_from_uri(URI[, leg][, body][, headers][, nohold])`

Originates a call to the specified URI. The SDP in the response is fetched and pushed towards one of the call's legs, resulting in two way audio between the participant of the ongoing call, and the new call. By default, the other participant leg is put on hold.

Can be called for an in-dialog request, such as a re-INVITE (for example when putting an entity on hold), or for an INFO request (triggered for example by a DTMF).

Parameters:

*   _URI_ (string) - destination used to originate the new call.
    
*   _leg_ (string, optional) - the leg where the new media SDP will be pushed. Possible values are _caller_ and _callee_. If missing, the module considers it is an hold re-INVITE, and exchanges the media SDP of the other leg.
    
*   _body_ (string, optional) - custom body used for the generated INVITE. If missing, the body stored in the dialog associated with the involved leg will be used.
    
*   _headers_ (string, optional) - optional headers added to the generated request.
    
*   _nohold_ (integer, optional) - if set to true, the other participant will not be put on hold. This is useful when a new call will be generated for the other leg as well.
    

This function can be used from any route.

**Example�1.6.�Use `media_exchange_from_uri()` function to fetch media from a Media Server's call**

...
if (has\_totag() && is\_method("INVITE") && is\_audio\_on\_hold())
	media\_exchange\_from\_uri("sip:moh@127.0.0.1:5080");
...
	

  

### 1.3.6.� `media_exchange_to_call(callid[, leg][, nohold])`

Pushes the SDP of a new call received in an existing proxied call, resulting in two-way audio between a Media Server that originated the call, and the existing participant of the ongoing proxied call.

Parameters:

*   _callid_ (string) - the identifier of the callid to exchange media.
    
*   _leg_ (string) - the leg that will be streamed. Possible values are _caller_ and _callee_.
    
*   _nohold_ (integer, optional) - if set to true, the other participant will not be put on hold. This is useful when a new call will be generated for the other leg as well.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

_NOTE:_ the request of this call is completely handled by the B2B engine. Therefore, after running this function, please make sure you do not relay the message further, otherwise you will run into an unexpected behavior. Best thing to do is to exit the processing after running the function.

**Example�1.7.�Use `media_exchange_to_call()` function to make an announcement**

...
if (!has\_totag() && is\_method("INVITE") && $hdr(X-CallID) != NULL)
	media\_exchange\_to\_call($hdr(X-CallID), "caller");
...
	

  

### 1.3.7.� `media_terminate([leg][, nohold][, instance])`

Terminates an ongoing media session exchange, whether the media is only streamed, or two way audio is flowing. If the participant leg is involved in a different media exchange, the current leg is put on hold.

Parameters:

*   _leg_ (string, optional) - the leg to terminate the media exchange. Possible values are _caller_ and _callee_. If missing, the direction of the indialog request is used.
    
*   _nohold_ (integer, optional) - if set to true, and the other participant is involved in a different media exchange, the current leg is no longer put on hold. _Note:_ if the request that terminates the media exchange is a re-INVITE within the dialog, this function will not un-hold the other leg, as the re-INVITE itself should be relayed further to do that. This behavior can be changed by explicitly setting the _nohold_ parameter
    
*   _instance_ (string, optional) - should only be used when terminating a forking instance, and represents the instance to terminate. It must be ommitted when terminating an streaming session. However, for fallback compatibility, if the parameter is missing, and no streaming session is found, the command terminates the _default_ forking instance, if it exists.
    

This function can be used from any route.

**Example�1.8.�Use `media_terminate()` function to terminate an announcement**

...
if (has\_totag() && is\_method("INVITE") && !is\_audio\_on\_hold())
	media\_terminate();
...
	

  

### 1.3.8.� `media_handle_indialog()`

Searches for an existing media session started for any leg, and if there is ongoing session found, it performs additional logic for handling that request. For example, if media has been started in forking mode, and the INVITE is for activating on-hold, then the function will also pause the forked stream.

Depending on the return code of this function, one has to perform additional logic in the script. Possible return codes are:

*   _1_ - indicates that the message has been handled, but there's no additional tasks to be performed in the script.
    
*   _\-1_ - indicates that there is no ongoing media exchange or fork happening for that call, or that there was no additional logic to do for that request.
    
*   _\-2_ - indicates that all additional handling of the request was performed, and that the request should not be forwarded to the user agent, but instead it should be dropped.
    
*   _\-3_ - signals an internal error.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and ONREPLY\_ROUTE.

**Example�1.9.�Use `media_terminate()` function to terminate an announcement**

...
if (has\_totag() && loose\_route()) {
	# handling sequential
	media\_handle\_indialog();
	switch ($rc) {
	case -2:
		drop;
	case -1:
		xlog("no ongoing media session for $ci!\\n");
	case 1:
		break;
}
...