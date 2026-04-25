## 1.6.�Exported Functions

### 1.6.1.�`call_control()`

Trigger the use of callcontrol for the dialog started by the INVITE for which this function is called (the function should only be called for the first INVITE of a call). Further in-dialog requests will be processed automatically using internal bindings into the dialog state machine, allowing callcontrol to update its internal state as the dialog progresses, without any other intervention from the script.

This function should be called right before the message is sent out using t\_relay(), when all the request uri modifications are over and a final destination has been determined.

This function has the following return codes:

*   +2 - call has no limit
    
*   +1 - call has limit and is traced by callcontrol
    
*   \-1 - not enough credit to make the call
    
*   \-2 - call is locked by another call in progress
    
*   \-3 - duplicated callid
    
*   \-4 - call limit has been reached
    
*   \-5 - internal error (message parsing, communication, ...)
    

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�Using the `call_control` function**

...
if ($avp(805) != NULL) {
    # the diverter AVP is set, use it as billing party
    $avp(billing\_party\_domain) = $(avp(805){uri.domain});
} else {
    $avp(billing\_party\_domain) = $fd;
}

if (is\_method("INVITE") && !has\_totag() &&
    is\_domain\_local($avp(billing\_party\_domain))) {
    call\_control();
    switch ($retcode) {
    case 2:
        # Call with no limit
    case 1:
        # Call has limit and is under callcontrol management
        break;
    case -1:
        # Not enough credit (prepaid call)
        sl\_send\_reply(402, "Not enough credit");
        exit;
        break;
    case -2:
        # Locked by another call in progress (prepaid call)
        sl\_send\_reply(403, "Call locked by another call in progress");
        exit;
        break;
    case -3:
        # Duplicated callid
        sl\_send\_reply(400, "Duplicated callid");
        exit;
        break;
    case -4:
        # Call limit reached
        sl\_send\_reply(503, "Too many concurrent calls");
        exit;
        break;
    default:
        # Internal error (message parsing, communication, ...)
        if (PREPAID\_ACCOUNT) {
            xlog("Call control: internal server error\\n");
            sl\_send\_reply(500, "Internal server error");
            exit;
        } else {
            xlog("L\_WARN", "Cannot set time limit for postpaid call\\n");
        }
    }
}
t\_relay();
...