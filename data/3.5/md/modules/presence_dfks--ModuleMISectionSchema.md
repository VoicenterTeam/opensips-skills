## 1.5.�Exported MI Functions

### 1.5.1.� `dfks_set_feature`

Triggers the sending of NOTIFY messages containing a feature status update to all watchers.

_Note:_ calling this MI function also triggers the _set\_route_ run. One can determine if the route is triggered by an MI function by checking the existence of the _$dfks(param)_ variable.

Name: _dfks\_set\_feature_

Parameters:

*   _presentity_: the URI of the user whose feature status should be updated
    
*   _feature_: The name of the feature to update. Takes one of the following values:
    
    *   _DoNotDisturb_
        
    *   _CallForwardingAlways_
        
    *   _CallForwardingBusy_
        
    *   _CallForwardingNoAnswer_
        
    
*   _status_: the new status of the feature: _0_ - disabled, _1_ - enabled
    
*   _route\_param_: optional string parameter passed to the _$dfks(param)_ variable in _set\_route_.
    
*   _values_: an array of extra values that can be updated for a feature. The format of an array element is: _field_/_value_. Supported fields are:
    
    *   _forwardTo_ - for all forwarding types
        
    *   _ringCount_ - for _CallForwardingNoAnswer_
        
    

MI FIFO Command Format:

opensips-cli -x mi dfks\_set\_feature sip:alice@10.0.0.11 CallForwardingNoAnswer 1 1 \\
ringCount/4 forwardTo/sip:bob@10.0.0.11