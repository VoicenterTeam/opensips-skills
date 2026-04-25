## 1.6.�Exported Pseudo-Variables

### 1.6.1.� `$dfks(field)`

This pseudo-variable can be used in the routes triggered by the module to handle the feature information through the following subnames:

*   _assigned_ - inform the SIP phone that a feature is unassigned by setting this to _0_ (the NOTIFY response will contain no XML data for the corresponding feature) By default, features are assigned.
    
*   _notify_ - suppress the sending of the NOTIFY message by setting this to _0_. By default, the NOTIFY is sent.
    
*   _presentity_ - read-only, returns the current presentity URI.
    
*   _feature_ - read-only, returns the current feature name. Possible values are:
    
    *   _DoNotDisturb_
        
    *   _CallForwardingAlways_
        
    *   _CallForwardingBusy_
        
    *   _CallForwardingNoAnswer_
        
    
*   _status_ - read or write the feature status. A value of _1_ means enabled and _0_ disabled.
    
*   _param_ - returns the parameter passed by the _mi\_dfks\_set\_feature_ MI function. This field will be _NULL_ if the parameter was not specified, or if the _set\_route_ is not triggered by an MI command, but by SIP signalling.
    
*   _value/field_ - read or write extra feature values. _field_ can be one of:
    
    *   _forwardTo_ - for all forwarding types
        
    *   _ringCount_ - for _CallForwardingNoAnswer_
        
    

**Example�1.3.�`dfks` usage**

...
route\[dfks\_set\] {
    # CallForwardingAlways is not allowed
    if ($dfks(feature) == "CallForwardingAlways")
        $dfks(status) = 0;

    xlog("New status: $dfks(status) for feature '$dfks(feature)' of user '$dfks(presentity)'\\n");
}
route\[dfks\_get\] {
    if ($dfks(feature) == "CallForwardingNoAnswer") {
        $dfks(status) = 1;
        $dfks(value/forwardTo) = "sip:bob@10.0.0.11";
        $dfks(value/ringCount) = "3";
    } else if ($dfks(feature) == "CallForwardingAlways")
        $dfks(assigned) = 0;
    } else {
        ...
    }
}
...