## 1.8.�Exported Events

### 1.8.1.� `E_RTPENGINE_NOTIFICATION`

This event is raised when a notification is received from RTPengine.

Parameters represent the nodes within the Json request received from RTPengine. Common values are:

*   _type_ - identifies the type of notification (i.e. DTMF)
    
*   _callid_ - the callid of the call this event is triggered for
    
*   _source\_tag_ - from tag of the call this event is triggered for
    
*   _timestamp_ - timestamp when the event was triggered
    

For a DTMF event received, you will also get the following nodes:

*   _source\_ip_ - the IP that triggered the DTMF
    
*   _event_ - the event/digit pressed
    
*   _duration_ - how long the digit was pressed
    
*   _volume_ - volume of the tone
    

### 1.8.2.� `E_RTPENGINE_STATUS`

This event is raised when a RTPEngine server changes it's status to active/inactive.

Parameters:

*   _socket_ - the socket that identifies the RTPEngine instance.
    
*   _status_ - _active_ if the RTPEngine instance responds to probing or _inactive_ if the instance was deactivated.