## 1.6.�Exported Events

### 1.6.1.� `E_MSRP_GW_SETUP_FAILED`

This event is triggered when the MSRP side SIP session fails to set up, when using the _msg\_to\_msrp()_ function.

The event can be used to generate a message with the failure description, back on the MESSAGE side.

Parameters:

*   _key_ - The session key.
    
*   _from\_uri_ - The URI in the SIP From header to use on the MESSAGE side.
    
*   _to\_uri_ - The URI in the SIP To header to use on the MESSAGE side.
    
*   _ruri_ - The SIP Request URI to use on the MESSAGE side.
    
*   _code_ - The SIP error code in the negative reply received on the MSRP side. Might be NULL if the MSRP UA session expired before receiving a negative reply.
    
*   _reason_ - The SIP reason string in the negative reply received on the MSRP side. Might be NULL if the MSRP UA session expired before receiving a negative reply.