## 1.7.�MI Commands

### 1.7.1.� `sip_capture`

Name: _sip\_capture_

Parameters:

*   _capture\_mode_ (optional) - turns on/off SIP message capturing. Possible values are:
    
    *   on
        
    *   off
        
    
    if the parameter is missing, the command will return the status of the SIP message capturing (as string “on” or “off” ) without changing anything.
    

MI FIFO Command Format:

		opensips-cli -x mi sip\_capture off