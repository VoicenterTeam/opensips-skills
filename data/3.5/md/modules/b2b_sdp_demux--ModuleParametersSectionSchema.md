## 1.4.�Exported Parameters

### 1.4.1.�`client_bye_mode` (string)

This parameter indicates how a BYE coming from the client side should be treated in the context of the upstream call.

Possible values are:

*   _disable_ - when a client terminates its call, the module will simply disable the media streams associated with its call, resulting in a re-INVITE upstream.
    
*   _terminate_ - when one client terminates its call, the module will terminate all other calls, including the upstream one.
    
*   _disable-terminate_ - same as disable, except that when the final stream is disabled, instead of a re-INVITE with all streams disabled, the module sends a BYE upstream.
    

_Default value is “disable”._

**Example�1.1.�Set `client_bye_mode` parameter**

...
modparam("b2b\_sdp\_demux", "client\_bye\_mode", "terminate")
...