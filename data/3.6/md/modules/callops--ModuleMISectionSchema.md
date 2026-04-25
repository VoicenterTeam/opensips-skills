## 1.5.�Exported MI Functions

### 1.5.1.� `call_transfer`

MI command to transfer an ongoing call to a new destination.

Depending on the parameters used, this command can do both blind and attended transfers scenarios. When the _transfer\_callid_ is used, then an attended transfer is performed, other wise a blind transfer is issued.

Name: _call\_transfer_

Parameters

*   _callid_ (string) - the callid of the dialog that is being transferred.
    
*   _leg_ (string) - indicates the leg of the _callid_ call that is being transferred/kept in the new transferring call. Possible values are “caller”, “callee” or “both”.
    
*   _destination_ (string, optional) - the URI where the call is being transferred. This parameter is mandatory for blind transfers, and optional for attended transfers. In the case of an attended transfer, if it is missing, the destination of the call is taken from the URIs in the transfer dialog.
    
*   _transfer\_callid_ (string, optional) - mandatory in case of an attended transfer, to specify the call of the Bleg in the new call.
    
*   _transfer\_leg_ (string, optional) - in case of an attended transfer, it specifies the participant of the _transfer\_callid_ call that will be bridged with the _leg_ of the _callid_. If missing, _transfer\_fromtag_ and _transfer\_totag_ must be used to identify the tag.
    
*   _transfer\_fromtag_ and _transfer\_totag_ (string, optional) - these parameters should always be specified together, and are used in call attended transfer scenarios where the dialog of the Bleg that is being transferred is not managed by OpenSIPS. Note that for these scenarios only the A-leg dialog will receive events about the call transfer.
    

MI FIFO Command Format:

\# blind transfer to sip:agent@127.0.0.1
opensips-cli -x mi call\_transfer \\
	callid=4b664b48-5639-40bf-bff8-3a866c145c3b \\
	leg=caller \\
	destination=sip:agent@217.0.0.1
		

\# attended transfer between two calls
opensips-cli -x mi call\_transfer \\
	callid=e8d024db-78e5-4d18-9794-5b8ba837bed4
	leg=caller \\
	transfer\_callid=559abf97-9834-4380-bba1-a036eb245450 \\
	transfer\_leg=calee
		

### 1.5.2.� `call_hold`

MI command to put an ongoing call on hold.

Command returns _OK_ if any of the legs of the call have been put on hold. If the call is already on hold, an error is returned.

Name: _call\_hold_

Parameters

*   _callid_ (string) - the callid of the dialog that is being put on hold.
    

MI FIFO Command Format:

\# put a call on hold
opensips-cli -x mi call\_hold \\
	callid=921b00e4-fec0-4a36-9397-a40ab74e1893
		

### 1.5.3.� `call_unhold`

MI command to resume a call from an onhold state put by the [call\_hold](#mi_call_hold "1.5.2.� call_hold") call.

Command returns _OK_ if any of the legs are resumed, or an error if no leg had been previously put on hold.

Name: _call\_unhold_

Parameters

*   _callid_ (string) - the callid of the dialog that is being resumed.
    

MI FIFO Command Format:

opensips-cli -x mi call\_unhold \\
	callid=921b00e4-fec0-4a36-9397-a40ab74e1893