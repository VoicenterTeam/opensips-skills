## 1.8.�Exported Events

### 1.8.1.� `E_SIPREC_START`

This event is raised when a SIPREC call is established and a call starts to be recorded.

Parameters:

*   _dlg\_id_ - dialog id (“did”) of the call being recorded;
    
*   _dlg\_callid_ - Call-Id of the call being recorded;
    
*   _callid_ - Call-Id (B2B id) of the SIPREC call;
    
*   _session\_id_ - SIPREC UUID of the recording call;
    
*   _server_ - the SIPREC server handing this call;
    
*   _instance_ - the SIPREC instance this event is triggered for;
    

### 1.8.2.� `E_SIPREC_STOP`

This event is raised when a SIPREC call is terminated.

This event exposes the same parameters as the [E\_SIPREC\_START](#event_E_SIPREC_START "1.8.1.� E_SIPREC_START") event.