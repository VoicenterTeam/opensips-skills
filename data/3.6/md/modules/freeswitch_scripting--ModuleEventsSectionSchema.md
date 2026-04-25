## 1.6.�Exported Events

### 1.6.1.� `E_FREESWITCH`

This event is raised when OpenSIPS receives an ESL event notification from a socket that the "freeswitch\_scripting" module is subscribed to.

Parameters:

*   _name_ - the name of the event
    
*   _sender_ - the FreeSWITCH sender IP address
    
*   _body_ - the full JSON-encoded body of the event, as sent by FreeSWITCH. Use the json module ($json variable) to easily interpret it.