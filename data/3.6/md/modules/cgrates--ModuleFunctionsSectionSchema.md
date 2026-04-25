## 1.9.�Exported Functions

### 1.9.1.� `cgrates_acc([flags[, account[, destination[, session]]]])`

`cgrates_acc()` starts an accounting session on the CGRateS engine for the current dialog. It also ends the session when the dialog is ended. This function requires a dialog, so in case create\_dialog() was not previously used, it will internally call that function.

Note that the `cgrates_acc()` function does not send any message to the CGRateS engine when it is called, but only when the call is answered and the CGRateS session should be started (a 200 OK message is received).

When called in _REQUEST\_ROUTE_ or _FAILURE\_ROUTE_, accounting for this session is done for all the branches created. When called in _BRANCH\_ROUTE_ or _ONREPLY\_ROUTE_, acccounting is done only if that branch is successful (terminates with a 2xx reply code).

The `cgrates_acc()` function should only be called on initial INVITEs. For more infirmation check [Section�1.3, “Accounting”](#accounting "1.3.�Accounting").

Meaning of the parameters is as follows:

*   _flags_ (string, optional) - indicates whether OpenSIPS should generate a CDR at the end of the call. If the parameter is missing, no CDR is generated - the session is only passed through CGRateS. The following values can be used, separated by '|':
    
    *   _cdr_ - also generate a CDR;
        
    *   _missed_ - generate a CDR even for missed calls; this flag only makes sense if the _cdr_ flag is used;
        
    
*   _account_ (string, optional) - the account that will be charged in CGrateS. If not specified, the user in the From header is used.
    
*   _destination_ (string, optional) - the dialled number. If not present the request URI user is used.
    
*   _session_ (string, optional) - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS accouting was successfully setup for the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. the dialog cannot be created, or the server is out of memory).
    
*   _\-2_ - the SIP message is invalid: either it has missing headers, or it is not an initial INVITE.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.6.�cgrates\_acc() usage**

		...
		if (!has\_totag()) {
			...
			if (cgrates\_auth($fU, $rU))
				cgrates\_acc("cdr|missed", $fU, $rU);
			...
		}
		...
		

  

### 1.9.2.� `cgrates_auth([account[, destination[, session]]])`

`cgrates_auth()` does call authorization through using the CGRateS engine.

Meaning of the parameters is as follows:

*   _account_ (string, optional) - the account that will be checked in CGrateS. If not specified, the user in the From header is used.
    
*   _destination_ (string, optional) - the dialled number. If not present the request URI user is used.
    
*   _session_ (string, optional) - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS account is allowed to make the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. server is out of memory).
    
*   _\-2_ - the CGRateS engine returned error.
    
*   _\-3_ - No suitable CGRateS server found. message type (not an initial INVITE).
    
*   _\-4_ - the SIP message is invalid: either it has missing headers, or it is not an initial INVITE.
    
*   _\-5_ - CGRateS returned an invalid message.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

**Example�1.7.�cgrates\_auth() usage**

		...
		if (!has\_totag()) {
			...
			if (!cgrates\_auth($fU, $rU)) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}
			...
		}
		...
		

  

**Example�1.8.�cgrates\_auth() usage with attributes parsing**

		...
		if (!has\_totag()) {
			...
			$cgr\_opt(GetAttributes) = 1;
			if (!cgrates\_auth($fU, $rU)) {
				sl\_send\_reply(403, "Forbidden");
				exit;
			}
			# move attributes from AttributesDigest variable to plain AVPs
			$var(idx) = 0;
			while ($(cgr\_ret(AttributesDigest){s.select,$var(idx),,}) != NULL) {
				$avp($(cgr\_ret(AttributesDigest){s.select,$var(idx),,}{s.select,0,:}))
					= $(cgr\_ret(AttributesDigest){s.select,$var(idx),,}{s.select,1,:});
				$var(idx) = $var(idx) + 1;
			}
			...
		}
		...
		

  

### 1.9.3.� `cgrates_cmd(command[, session])`

`cgrates_cmd()` can send arbitrary commands to the CGRateS engine.

Meaning of the parameters is as follows:

*   _command_ (string) - the command sent to the CGRateS engine.
    
*   _session_ (string, optional) - the tag of the session that will be started if the branch/call completes with success. This parameter indicates what set of data from the _$cgr()_ variable should be considered. If missing, the default set is used.
    

The function can return the following values:

*   _1_ - successful call - the CGRateS account is allowed to make the call.
    
*   _\-1_ - OpenSIPS returned an internal error (i.e. server is out of memory).
    
*   _\-2_ - the CGRateS engine returned error.
    
*   _\-3_ - No suitable CGRateS server found. message type (not an initial INVITE).
    

This function can be used from any route.

**Example�1.9.�cgrates\_cmd() usage**

		...
		# cgrates\_auth($fU, $rU); simulation
		$cgr\_opt(Tenant) = $fd;
		$cgr(Account) = $fU;
		$cgr(OriginID) = $ci;
		$cgr(SetupTime) = "" + $Ts;
		$cgr(RequestType) = "\*prepaid";
		$cgr(Destination) = $rU;
		cgrates\_cmd("SessionSv1.AuthorizeEvent");
		xlog("Call is allowed to run $cgr\_ret seconds\\n");
		...