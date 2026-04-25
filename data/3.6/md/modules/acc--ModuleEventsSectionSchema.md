## 1.9.�Exported Events

### 1.9.1.� `E_ACC_CDR`

The event raised when a CDR is generated. Note that this event will only be triggered if the auto CDR accounting is used.

Parameters:

*   _method_ - Request method name
    
*   _from\_tag_ - From header tag parameter
    
*   _to\_tag_ - To header tag parameter
    
*   _callid_ - Message Call-id
    
*   _sip\_code_ - The status code from the final reply
    
*   _sip\_reason_ - The status reason from the final reply
    
*   _time_ - The timestamp when the call was established
    
*   _evi\_extra\*_ - Extra parameters added by the _evi\_extra_ parameter.
    
*   _evi\_extra\_bye\*_ - Extra parameters added by the _evi\_extra\_bye_ parameter
    
*   _multi\_leg\_info\*_ - Extra parameters added by the _multi\_leg\_info_ parameter
    
*   _multi\_leg\_bye\_info\*_ - Extra parameters added by the _multi\_leg\_bye\_info_ parameter
    
*   _duration_ - The call duration in seconds
    
*   _ms\_duration_ - The call duration in milliseconds
    
*   _setuptime_ - The call setup time in seconds
    
*   _created_ - The timestamp when the call was created (the initial Invite was received)
    

### 1.9.2.� `E_ACC_EVENT`

This event is triggered when old-style accounting is used. It is generated when the requests (INVITE and BYE) transaction have positive final replies, or by the `acc_evi_request()` function that has a positive reply code in comment.

Parameters:

*   _method_ - Request method name
    
*   _from\_tag_ - From header tag parameter
    
*   _to\_tag_ - To header tag parameter
    
*   _callid_ - Message Call-id
    
*   _sip\_code_ - The status code from the final reply
    
*   _sip\_reason_ - The status reason from the final reply
    
*   _time_ - The timestamp when the transaction was created
    
*   _evi\_extra\*_ - Extra parameters added by the _evi\_extra_ parameter
    
*   _multi\_leg\_info\*_ - Extra parameters added by the _multi\_leg\_info_ parameter
    

### 1.9.3.� `E_ACC_MISSED_EVENT`

This event is triggered when old-style accounting is used. It is generated when the requests (INVITE and BYE) transaction have negative final replies, or by the `acc_evi_request()` function that has a negative reply code in comment.

Parameters:

*   _method_ - Request method name
    
*   _from\_tag_ - From header tag parameter
    
*   _to\_tag_ - To header tag parameter
    
*   _callid_ - Message Call-id
    
*   _sip\_code_ - The status code from the final reply
    
*   _sip\_reason_ - The status reason from the final reply
    
*   _time_ - The timestamp when the transaction was created
    
*   _evi\_extra\*_ - Extra parameters added by the _evi\_extra_ parameter
    
*   _multi\_leg\_info\*_ - Extra parameters added by the _multi\_leg\_info_ parameter
    
*   _created_ - Timestamp when the call was created
    
*   _setuptime_ - The call setup time in seconds