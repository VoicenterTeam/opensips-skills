## 1.3.�Exported Parameters

### 1.3.1.�`mode` (string/integer)

This parameter can be used to change the mode that the module uses to match a transferred leg. Supported values are:

*   _param_ / _0_ - when doing a blind transfer, the destination sent in the refer message will contain a parameter used to identify the dialog that is being replaced. this parameter will be automatically removed when the new call is received.
    
*   _manual_ / _1_ - the user will create its own logic to match the new calls, and will call the [call\_blind\_replace()](#func_call_blind_replace "1.4.1.� call_blind_replace(callid[, leg])") function to make OpenSIPS aware of the pair. Note that this mode does not handle automatically the _Notify refer_ either, so you also have to use the [call\_transfer\_notify()](#func_call_transfer_notify "1.4.2.� call_transfer_notify()") function to handle them.
    
*   _callid_ / _2_ - similar to the _param_ value, except that instead of storing in the Request URI the dialog id of the call to be transfered, the actual callid is used as identifier.
    

_Default value is “0 (auto mode using parameters)”._

**Example�1.2.�Set `mode` parameter**

...
modparam("callops", "mode", "manual") # use your own logic
...

  

### 1.3.2.�`match_param` (string)

The parameter used to match the different calls together. This is mainly using in the _param_ mode, but it is also used internally to store different values inside the transferred dialog - make sure it does not overlap with existing dialog values.

_Default value is “osid”._

**Example�1.3.�Set `match_param` parameter**

...
modparam("callops", "match\_param", "call")
...