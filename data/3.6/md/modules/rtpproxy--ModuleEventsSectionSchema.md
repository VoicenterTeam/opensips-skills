## 1.8.�Exported Events

### 1.8.1.� `E_RTPPROXY_STATUS`

This event is raised when a RTPProxy server changes it's status to enabled/disabled.

Parameters:

*   _socket_ - the socket that identifies the RTPProxy instance.
    
*   _status_ - _active_ if the RTPProxy instance responds to probing or _inactive_ if the instance was deactivated.
    

### 1.8.2.� `E_RTPPROXY_DTMF`

This event is raised when a RTPProxy server sends a DTMF notification to OpenSIPS. In order to catch RFC 2833/4733 DTMF events, you need to provide the _d_ flag to _rtpproxy\_offer()_/ _rtpproxy\_answer()_.

Parameters:

*   _digit_ - the digit pressed.
    
*   _duration_ - the duration of the event.
    
*   _volume_ - the volume of the event.
    
*   _id_ - represents the identifier of the call for which that event was received.
    
*   _is\_callid_ - is _0_ if the _id_ parameter represents the Dialog ID, or _1_ if it is a callid.
    
*   _stream_ - indicates the stream index of the RTPProxy session. It is normally 0 if the caller sent the DTMF, or 1 if the callee sent it.