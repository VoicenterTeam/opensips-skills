## 1.4.�Exported Functions

### 1.4.1.� `call_blind_replace(callid[, leg])`

When _manual mode_ is used, this function is called to create a mapping between the transferring call and the transferred call. It should be called when OpenSIPS receives a new call that is transferring an existing call.

Parameters:

*   _callid_ (string) - the existing call that is being transferred.
    
*   _leg_ (string, optional) - the leg that is being transferred. If not specified, and OpenSIPS cannot determine the leg based on its destination, the _unknown_ tag should be used.
    

This function can be used only from a request route.

**Example�1.4.�Use `call_blind_replace()` function to match an existing leg.**

...
if (!has\_totag() && is\_method("INVITE")) {
	if (cache\_fetch("local", "callid\_$si", $avp(callid))) {
		call\_blind\_replace($avp(callid));
	}
}
...
	

  

### 1.4.2.� `call_transfer_notify()`

When _manual mode_ is used, this function should be called on in-dialog NOTIFY requests for an _Event: refer_ header, to handle them accordingly.

Note that if the function successfully handles the NOTIFY request, the script no longer continues its execution.

This function can be used from a request route, failure route and local route.

**Example�1.5.�Use `call_transfer_notify()` function to handle NOTIFY refer requests.**

...
if (has\_totag() && is\_method("NOTIFY") && loose\_route()) {
	call\_transfer\_notify();
}
...
	

  

### 1.4.3.� `call_transfer(leg, destination)` or

This function triggers a blind call transfer by sending a REFER message during an ongoing call. The function needs to be run inside the context of the dialog you are transferring.

Parameters:

*   _leg_ (string) - the leg that is being transferred. Must be one of the _caller_ or _callee_ values.
    
*   _destination_ (string) - SIP URI of the destination where the leg is being transferred.
    

This function can be used from any route that has a dialog context.

**Example�1.6.�Use `call_transfer()` function to do a blind transfer of the caller to a new destination.**

...
if (has\_totag() && && loose\_route()) {
	call\_transfer("caller", "sip:announcement@127.0.0.1");
}
...
	

  

### 1.4.4.� `call_transfer(leg, transfer_callid, transfer_leg[, destination])` or

This function triggers an attended call transfer by sending a REFER message during an ongoing call. The function needs to be run inside the context of the dialog you are transferring.

Parameters:

*   _leg_ (string) - the leg that is being transferred. Must be one of the _caller_ or _callee_ values.
    
*   _transfer\_callid_ (string) - the callid of the second dialog that is being transferred.
    
*   _transfer\_leg_ (string) - the leg within the second call that will be transferred to _leg_. Must be one of the _caller_ or _callee_ values.
    
*   _destination_ (string, optional) - SIP URI of the destination where the leg is being transferred. If missing, the From/To URI of the initial call are used.
    

This function can be used from any route that has a dialog context.

**Example�1.7.�Use `call_transfer()` function to do an attended transfer of the caller to the callee of a different call.**

...
if (has\_totag() && && loose\_route()) {
	call\_transfer("caller", "ba55b1b3-459d-4e84-a6f8-14c40e4f6ace", "callee");
}
...