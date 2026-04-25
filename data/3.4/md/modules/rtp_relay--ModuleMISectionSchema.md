## 1.5.�Exported MI Functions

### 1.5.1.�`rtp_relay_list`

Lists all the RTP Relay sessions engaged.

Parameters:

*   _engine_ - (optional) the RTP relay engine (i.e. _rtpproxy_ or _rtpengine_).
    
*   _set_ - (optional) the RTP relay set. When used, the _engine_ parameter must also be specified.
    
*   _node_ - (optional) the RTP relay node. When used, the _engine_ parameter must also be specified.
    

**Example�1.2.� `rtp_relay_list` usage**

...
## list all sessions
$ opensips-cli -x mi rtp\_relay\_list

## list all sessions going through a specific RTP node
$ opensips-cli -x mi rtp\_relay\_list rtpproxy udp:127.0.0.1:2222
...
			

  

### 1.5.2.�`rtp_relay_update`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

This function can be used to trigger dialog in-dialog updates for certain ongoing RTP sessions. For all matched sessions, it re-engages an RTP Relay offer/answer session, then sends re-INVITEs to call's participants to with the updated SDP.

_Note:_Running the command without a filter (such as _engine_ or _set_) will cause all RTP relay sessions to be re-engaged.

_Note:_When enforcing a new node, it is not guaranteed to be used - if the node is not avaialble, but a different one is, the active one will be chosen.

_Note:_If the node is being changed, the module tries to unforce the previous RTP relay session, even though it might not work.

Parameters:

*   _engine_ - (optional) the RTP relay engine (i.e. _rtpproxy_ or _rtpengine_) to be used as filter.
    
*   _set_ - (optional) the RTP relay set to be used as filter. If missing, the same set will be used as it was initially engaged for.
    
*   _node_ - (optional) the RTP relay node to be used as filter.
    
*   _new\_set_ - (optional) a new RTP Relay set to be used for the call.
    
*   _new\_node_ - (optional) a new RTP node to be used for the call. If _new\_set_ is missing, the same set will be used.
    

**Example�1.3.� `rtp_relay_update` usage**

...
## update all sessions that are using rtpproxy
$ opensips-cli -x mi rtp\_relay\_update rtpproxy
...
			

  

### 1.5.3.�`rtp_relay_update_callid`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

The function basically works in the same manner as [rtp\_relay\_update](#mi_rtp_relay_update "1.5.2.�rtp_relay_update"), but is to be used to update a specific callid. In addition, one can also update the _engine_ and _flags_ used for the particular session.

Parameters:

*   _callid_ - the callid used to match the dialog to be updated.
    
*   _engine_ - (optional) the new RTP relay engine (i.e. _rtpproxy_ or _rtpengine_) to be used. If missing, the same initial engine is used.
    
*   _set_ - (optional) the new RTP relay set to be used. If missing, the default same set will be used as it was initially engaged for.
    
*   _node_ - (optional) the RTP relay node to be used. If not specified, the first available node is used.
    
*   _flags_ - (optional) a JSON contining the _caller_ and/or _callee_ nodes, which contain new flags that should be used for the session. Only explicitely specified flags will be overwritten.
    

**Example�1.4.� `rtp_relay_update_callid` usage**

...
## update a call with a working RTPproxy node
$ opensips-cli -x mi rtp\_relay\_update\_callid 1-3758963@127.0.0.1 rtpproxy

## update a call to use RTPEngine with a SRTP SDP for caller
$ opensips-cli -x mi rtp\_relay\_update\_callid callid=1-3758963@127.0.0.1 \\
	flags='{ "caller":{"type":"SRTP", "flags":"replace-origin"},
		"callee":{"type":"RTP", "flags"="replace-origin"}}'
...