## 1.6.�Exported Events

### 1.6.1.� `E_FRD_WARNING`

This event is raised whenever one of the 5 monitored parameters is above the warning threshold value

Parameters:

*   _param_ - the name of the parameter.
    
*   _value_ - the current value of the parameter.
    
*   _threshold_ - the warning threshold value.
    
*   _user_ - the user who initiated the call.
    
*   _called\_number_ - the number that was called.
    
*   _rule\_id_ - the id of the fraud rule that matched when the call was initiated
    
*   _profile\_id_ - the profile id used
    

### 1.6.2.� `E_FRD_CRITICAL`

This event is raised whenever one of the 5 monitored parameters is above the warning threshold value

Parameters:

*   _param_ - the name of the parameter.
    
*   _value_ - the current value of the parameter.
    
*   _threshold_ - the warning threshold value.
    
*   _user_ - the user who initiated the call.
    
*   _called\_number_ - the number that was called.
    
*   _rule\_id_ - the id of the fraud rule that matched when the call was initiated
    
*   _profile\_id_ - the profile id used