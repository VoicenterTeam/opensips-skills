## 1.5.�Exported Parameters

### 1.5.1.�`route_offer` (string)

Route that is being run when an SDP offer happens (i.e. an INVITE with SDP is being processed).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _ip_ - optional, the IP being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _type_ - optional, the RTP type being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _in-iface_ - optional, the inbound interface that should be used for this peer.
    
*   _out-iface_ - optional, the outbound interface that should be used for this peer.
    
*   _ctx-flags_ - optional, global flags that are being specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    
*   _flags_ - optional, flags specified for this peer.
    
*   _peer_ - optional, peer flags specified for the corresponding peer;
    

When running the route, the following values are expected to be returned:

*   _body_ - the newly created body to be offered. If not returned, the body is left unchanged.
    
*   _node_ - optional, a node to be identified for further routes/commands executed.
    

_Default value is “rtp\_relay\_offer”._

**Example�1.1.�Set `route_offer` parameter**

...
modparam("rtp\_relay", "route\_offer", "custom\_rtp\_offer")
...

  

**Example�1.2.�`route_offer` route usage**

...
route\[rtp\_relay\_offer\] {
	# manually engaging RTPEngine, get the SDP, and replace it in the message
	return (1, $var(body));
}
...

  

### 1.5.2.�`route_answer` (string)

Route that is being run when an SDP answer happens (i.e. a 183 or 200 OK reply with SDP is being processed).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route.
    
*   _ip_ - optional, the IP being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _type_ - optional, the RTP type being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _in-iface_ - optional, the inbound interface that should be used for this peer.
    
*   _out-iface_ - optional, the outbound interface that should be used for this peer.
    
*   _ctx->flags_ - optional, global flags that are being specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    
*   _flags_ - optional, flags specified for this peer.
    
*   _peer_ - optional, peer flags specified for the corresponding peer;
    

When running the route, the following values are expected to be returned:

*   _body_ - the newly created body to be answered. If not returned, the body is left unchanged.
    

_Default value is “rtp\_relay\_answer”._

**Example�1.3.�Set `route_answer` parameter**

...
modparam("rtp\_relay", "route\_answer", "custom\_rtp\_answer")
...

  

**Example�1.4.�`route_answer` route usage**

...
route\[rtp\_relay\_answer\] {
	# again, manually engaging RTPEngine
	rtpengine\_answer(,, $var(body), $rb);
	return (1, $var(body));
}
...

  

### 1.5.3.�`route_delete` (string)

Route that is being run when media should be disconnected (i.e. a CANCEL or BYE is received).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _ctx->flags_ - optional, global flags that are being specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    
*   _delete_ - optional, delete flags specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    

Return values are not needed.

_Default value is “rtp\_relay\_delete”._

**Example�1.5.�Set `route_delete` parameter**

...
modparam("rtp\_relay", "route\_delete", "custom\_rtp\_delete")
...

  

**Example�1.6.�`rtp_relay_delete` route usage**

...
route\[rtp\_relay\_delete\] {
	# manually removing RTPEngine session
	rtpengine\_delete();
}
...

  

### 1.5.4.�`route_copy_offer` (string)

Route that is being executed when a new call's SDP is being copied.

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _flags_ - optional, flags that are being specified by the module which is copying the SDP.
    
*   _copy-ctx_ - optional, an copy context identifier - this is a user populated value returned after running a _route\_copy\_offer_ route (see the return values section below).
    

When running the route, the following values are expected to be returned:

*   _copy-ctx_ - optional, a copy context identifier that can be later used to identify the current copy session.
    

_Default value is “rtp\_relay\_copy\_offer”._

**Example�1.7.�Set `rtp_relay_copy_offer` parameter**

...
modparam("rtp\_relay", "route\_copy\_offer", "custom\_rtp\_copy\_offer")
...

  

**Example�1.8.�Set `rtp_relay_copy_offer` usage**

...
route\[rtp\_relay\_copy\_offer\] {
	# instruct a media engine to fork media and assign an identifier
	# that shall be stored in the $var(handle) variable
	return (1, $var(handle));
}
...

  

### 1.5.5.�`route_copy_answer` (string)

Route that is being run when an SDP for the copied stream is received. (i.e. a CANCEL or BYE is received).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _flags_ - optional, flags that are being specified by the module which is copying the SDP.
    
*   _copy-ctx_ - optional, an copy context identifier - this is a user populated value returned at the end of _route\_copy\_offer_ execution.
    

_Default value is “rtp\_relay\_copy\_answer”._

**Example�1.9.�Set `rtp_relay_copy_answer` parameter**

...
modparam("rtp\_relay", "route\_copy\_answer", "custom\_rtp\_copy\_answer")
...

  

**Example�1.10.�Set `rtp_relay_copy_answer` usage**

...
route\[rtp\_relay\_copy\_answer\] {
	# feed the received $param(body) to the media engine that is forking the call
	# copy instance is identified by the $param(copy-ctx) variable
}
...

  

### 1.5.6.�`route_copy_delete` (string)

Route that is being run when media fork should be removed.

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _flags_ - optional, flags that are being specified by the module which is copying the SDP.
    
*   _copy-ctx_ - optional, an copy context identifier - this is a user populated value returned at the end of _route\_copy\_offer_ execution.
    

Return values are not needed.

_Default value is “rtp\_relay\_copy\_delete”._

**Example�1.11.�Set `rtp_relay_copy_delete` parameter**

...
modparam("rtp\_relay", "route\_copy\_delete", "custom\_rtp\_copy\_delete")
...

  

**Example�1.12.�Set `rtp_relay_copy_delete` usage**

...
route\[rtp\_relay\_copy\_delete\] {
	# remove the copy instance is identified by the $param(copy-ctx) variable
}
...