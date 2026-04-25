## 1.6.�Exported Events

### 1.6.1.� `E_CALL_TRANSFER`

This event is triggered during a call transfer scenario.

For a specific call transfer, multiple events are triggered, starting when the transfer is initiated, until the transfer is completed. The _state_ parameter indicates the state of the call transfer.

For a blind transfer scenario, only one set of events are triggered, whereas for attended transfer, you will get a set of events for both dialogs involved in the transfer, as long as both are proxied through OpenSIPS

Parameters:

*   _callid_ - the callid of the call that is being transferred.
    
*   _leg_ - the leg (_caller_ or _callee_) of the call that is being transferred.
    
*   _transfer\_callid_ - the callid of the new call that is transferring the old _callid_ call.
    
*   _destination_ - the URI destination where the _leg_ is being transferred.
    
*   _state_ - the state of the transfer:
    
    *   _start_ - triggered when the REFER message is being sent out to the transferred participant.
        
    *   _notify_ - triggered when a NOTIFY refer event is received from the transferred participant. The _status_ parameter contains extra information about the status of the transferring call.
        
    *   _ok_ - triggered when the transfer is completed - the call is answered by the transferred participant.
        
    *   _fail_ - triggered when a transfer has failed due to various reasons. If we were unable to start the call transfer (i.e. send the REFER), the _status_ parameter is empty, otherwise it contains information about the failure.
        
    
*   _status_ - contains extra information about the success or failure of the call.
    

### 1.6.2.� `E_CALL_HOLD`

Triggered during the process of putting a call on hold, or resuming a call from an on hold state.

This event is triggered twice per each leg of the call - first when the leg starts to be put on hold, and then when the leg accepts or rejects the state.

Parameters:

*   _callid_ - the callid of the call that is being put on hold, or resumed.
    
*   _leg_ - the leg (_caller_ or _callee_) affected by the call on hold, or resumed.
    
*   _action_ - _hold_ or _unhold_ action that is being performed.
    
*   _state_ - the state of the action that is being performed.
    
    *   _start_ - triggered when the re-INVITE is being sent out to the participant being put on hold.
        
    *   _ok_ - triggered when the on hold/resume action is successfully completed.
        
    *   _fail_ - triggered when the action failed.