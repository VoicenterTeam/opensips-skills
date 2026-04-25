## 1.4.�Exported Functions

### 1.4.1.� `t_relay([flags],[outbound_proxy])`

Relay a message statefully to destination indicated in current URI. (If the original URI was rewritten by UsrLoc, RR, strip/prefix, etc., the new URI will be taken). Returns a negative value on failure--you may still want to send a negative reply upstream statelessly not to leave upstream UAC in lurch.

The coresponding transaction may or may not be already created. If not yet created, the function will automatically create it.

The function may take two optional parameters.

The first parameter is a comma separated list of string flags for controlling the internal behaviour. The supported flags are:

*   _no-auto-477_ - (old _0x02_ flag) do not internally generate and send a "477 Send failed (477/TM)" SIP reply in case of a global forwarding failure (i.e. forwarding for each branch has failed due to internal errors, bad R-URI, bad message, lack of network reachability, etc.).
    
    This flag only applies if the transaction was not previously created by [t\_newtran()](#func_t_newtran "1.4.4.� t_newtran()"). When a global forwarding failure occurs, no SIP request is relayed and therefore no negative SIP reply or timeout will show up on the failure\_route, if one is set.
    
    Useful if you want to implement a failover logic for when none of the currently created branches can be forwarded to.
    
*   _no-dns-failover_ - (old _0x04_ flag) disable the DNS failover for the transaction. Only first IP will be used. It disables the failover both at transport and transaction level.
    
*   _pass-reason-hdr_ - (old _0x08_ flag) If the request is a CANCEL, trust and pass further the Reason header from the received CANCEL - shortly, will propagate the Reason header.
    
*   _allow-no-cancel_ - (old _0x10_ flag) Allows OpenSIPS to inspect and follow the Content-Disposition "no-cancel" indication (if present). As per RFC3841, section 9.1, the TM module may be instructed not to cancel all ongoing branches when a 2xx reply is received. It will keep the pending branches ongoing until (1) all branches will receive a final reply or (2) the transactionhits the timeout.
    

The second parameter is a string representing an outbound proxy (a fixed destination) where the message should be sent. The destination is specified as “\[proto:\]host\[:port\]”. If a destination URI “$du” for this message was set before the function is called then this value will be used as the destination instead of the function parameter.

In case of error, the function returns the following codes:

*   _\-1_ - generic internal error
    
*   _\-2_ - bad message (parsing errors)
    
*   _\-3_ - no destination available (no branches were added or request already cancelled)
    
*   _\-4_ - bad destination (unresolvable address)
    
*   _\-5_ - destination filtered (black listed)
    
*   _\-6_ - generic send failed
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.23.�`t_relay` usage**

...
if (!t\_relay()) {
    sl\_reply\_error();
    exit;
}
...
t\_relay( ,"tcp:192.168.1.10:5060");
...
t\_relay(0x1, "mydomain.com:5070");
...

  

### 1.4.2.� `t_reply(code, reason_phrase)`

Sends a stateful SIP reply to the currently processed requests. Note that if the transaction was not created yet, it will automatically created by internally using the `t_newtran` function.

Meaning of the parameters is as follows:

*   _code (int)_ - Reply code number.
    
*   _reason\_phrase (string)_ - Reason string.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.24.�`t_reply` usage**

...
t\_reply(404, "Use $rU not found");
...

  

### 1.4.3.� `t_reply_with_body(code, reason_phrase, body)`

Sends a stateful SIP reply with a body to the currently processed requests. Note that if the transaction was not created yet, it will automatically created by internally using the `t_newtran` function.

Meaning of the parameters is as follows:

*   _code (int)_ - Reply code number.
    
*   _reason\_phrase (string)_ - Reason string.
    
*   _body (string)_ - Reply body.
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.25.�`t_reply_with_body` usage**

...
	if(is\_method("INVITE"))
	{
		append\_to\_reply("Contact: $var(contact)\\r\\n"
				"Content-Type: application/sdp\\r\\n");
		t\_reply\_with\_body(200, "Ok", $var(body));
		exit;
	}
...

  

### 1.4.4.� `t_newtran()`

Creates the SIP transaction for the currently processed SIP request, thus switching to stateful processing. For INVITE requests, a 100 Trying reply will be immediately sent, unless [auto\_100trying](#param_auto_100trying "1.3.19.�auto_100trying (integer)") is disabled. Once a SIP transaction is created, calling [t\_newtran()](#func_t_newtran "1.4.4.� t_newtran()") for retransmitted requests will end the OpenSIPS script execution, with the lastly sent reply being retransmitted upstream.

This function can be used from REQUEST\_ROUTE.

**Example�1.26.�`t_newtran` usage**

...
t\_newtran();  # 100 Trying is fired here
xlog("doing my complicated routing logic\\n");
....
t\_relay(); # send the call further
...

  

### 1.4.5.� `t_check_trans()`

Returns true if the current request is associated to a transaction. The relationship between the request and transaction is defined as follows:

*   _non-CANCEL/non-ACK requests_ - if the request belongs to a transaction (it's a retransmision), the function will do a standard processing of the retransmission and will break/stop the script. The function returns false if the request is not a retransmission.
    
*   _CANCEL request_ - true if the cancelled INVITE transaction exists.
    
*   _ACK request_ - true if the ACK is a hop-by-hop ACK (to a negative reply) corresponding to an previous INVITE transaction. IMPORTANT: this function returns false (return code _\-2_) for end-to-end ACKs (to 2xx replies from a different transaction).
    

Note: To detect retransmissions using this function you have to make sure that the initial request has already created a transaction, e.g. by using t\_relay(). If the processing of requests may take long time (e.g. DB lookups) and the retransmission arrives before t\_relay() is called, you can use the t\_newtran() function to manually create a transaction.

This function can be used from REQUEST\_ROUTE and BRANCH\_ROUTE.

**Example�1.27.�`t_check_trans` usage**

...
if ( is\_method("CANCEL") ) {
	if ( t\_check\_trans() )
		t\_relay();
	exit;
}
...

  

### 1.4.6.� `t_check_status(re)`

Returns true if the regualr expression “re” match the reply code of the response message as follows:

*   _in routing block_ - the code of the last sent reply.
    
*   _in on\_reply block_ - the code of the current received reply.
    
*   _in on\_failure block_ - the code of the selected negative final reply.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE .

**Example�1.28.�`t_check_status` usage**

...
if (t\_check\_status("(487)|(408)")) {
    log("487 or 408 negative reply\\n");
}
...

  

### 1.4.7.� `t_local_replied(reply)`

Returns true if all or last (depending of the parameter) reply(es) were local generated (and not received).

Parameter may be “all” or “last”.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.29.�`t_local_replied` usage**

...
if (t\_local\_replied("all")) {
	log ("no reply received\\n");
}
...

  

### 1.4.8.� `t_was_cancelled()`

Retuns true if called for an INVITE transaction that was explicitly cancelled by UAC side via a CANCEL request.

This function can be used from ONREPLY\_ROUTE, FAILURE\_ROUTE.

**Example�1.30.�`t_was_cancelled` usage**

...
if (t\_was\_cancelled()) {
    log("transaction was cancelled by UAC\\n");
}
...

  

### 1.4.9.� `t_cancel_branch([flags])`

This function is to be call when a reply is received for cancelling a set of branches (see flags) of the current call.

Meaning of the parameters is as follows:

*   _flags (string, optional)_ - set of flags (char based flags) to control what branches to be cancelled:
    
    *   _a_ - all - cancel all pending branches
        
    *   _o_ - others - cancel all the other pending branches except the current one
        
    *   _empty_ - current - cancel only the current branch
        
    

This function can be used from ONREPLY\_ROUTE.

**Example�1.31.�`t_cancel_branch` usage**

onreply\_route\[3\] {
...
	if (t\_check\_status(183)) {
		# no support for early media
		t\_cancel\_branch();
	}
...
}

  

### 1.4.10.� `t_new_request(method,RURI,from,to[,body[,ctx]])`

This function generates and sends out a new SIP request (in a stateful way). The new request is completly unrelated to the currently processed SIP message.

Meaning of the parameters is as follows (all do accept variables):

*   _method (string)_ - the SIP method
    
*   _RURI (string)_ - the SIP Request URI (the request will be sent out to this destination)
    
*   _from (string)_ - the SIP From hdr information as "\[display \]URI"
    
*   _to (string)_ - the SIP To hdr information as "\[display \]URI"
    
*   _body (string, optional)_ - the SIP body content starting with the content type string: "conten\_type body"
    
*   _ctx (string, optional)_ - a context string that will be added to the new transaction as an AVP with name "uac\_ctx" (it may be visible in local route)
    

**Example�1.32.�`t_new_request` usage**

...
	# send a MESSAGE request
	t\_new\_request("MESSAGE","sip:alice@192.168.2.2","BOB sip:userB@mydomain.net","ALICE sip:userA@mydomain.net","text/plain Hello Alice!")) {
...

  

### 1.4.11.� `t_on_failure(failure_route)`

Sets reply routing block, to which control is passed after a transaction completed with a negative result but before sending a final reply. In the referred block, you can either start a new branch (good for services such as forward\_on\_no\_reply) or send a final reply on your own (good for example for message silo, which received a negative reply from upstream and wants to tell upstream “202 I will take care of it”).

As not all functions are available from failure route, please check the documentation for each function to see the permissions. Any other commands may result in unpredictable behavior and possible server failure.

Only one failure\_route can be armed for a request. If you use many times t\_on\_failure(), only the last one has effect.

Note that whenever failure\_route is entered, RURI is set to value of the winning branch.

Meaning of the parameters is as follows:

*   _failure\_route (string)_ - Reply route block to be called.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.33.�`t_on_failure` usage**

...
route { 
	t\_on\_failure("1"); 
	t\_relay();
} 

failure\_route\[1\] {
	seturi("sip:user@voicemail");
	t\_relay();
}
...

  

### 1.4.12.� `t_on_reply(reply_route)`

Sets reply routing block, to which control is passed each time a reply (provisional or final) for the transaction is received. The route is not called for local generated replies! In the referred block, you can inspect the reply and perform text operations on it.

As not all functions are available from this type of route, please check the documentation for each function to see the permissions. Any other commands may result in unpredictable behavior and possible server failure.

If called from branch route, the reply route will be set only for the current branch - that's it, it will be called only for relies belonging to that particular branch. Of course, from branch route, you can set different reply routes for each branch.

When called from a non-branc route, the reply route will be globally set for tha current transaction - it will be called for all replies belonging to that transaction. NOTE that only _one>_ onreply\_route can be armed for a transaction. If you use many times t\_on\_reply(), only the last one has effect.

If the processed reply is provisionla reply (1xx code), by calling the drop() function (exported by core), the execution of the route will end and the reply will not be forwarded further.

Meaning of the parameters is as follows:

*   _reply\_route (string)_ - Reply route block to be called.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.34.�`t_on_reply` usage**

...
route {
	seturi("sip:bob@opensips.org");  # first branch
	append\_branch("sip:alice@opensips.org"); # second branch

	t\_on\_reply("global"); # the "global" reply route 
	                      # is set the whole transaction
	t\_on\_branch("1");

	t\_relay();
}

branch\_route\[1\] {
	if ($rU=="alice")
		t\_on\_reply("alice"); # the "alice" reply route
		                      # is set only for second branch
}

onreply\_route\[alice\] {
	xlog("received reply from alice\\n");
}

onreply\_route\[global\] {
	if (t\_check\_status("1\[0-9\]\[0-9\]")) {
		setflag(LOG\_FLAG);
		log("provisional reply received\\n");
		if (t\_check\_status("183"))
			drop;
	}
}
...

  

### 1.4.13.� `t_on_branch(branch_route)`

Sets a branch route to be execute separately for each branch of the transaction before being sent out - changes in that route should reflect only on that branch.

As not all functions are available from this type of route, please check the documentation for each function to see the permissions. Any other commands may result in unpredictable behavior and possible server failure.

Only one branch\_route can be armed for a request. If you use many time t\_on\_branch(), only the last one has effect.

By calling the drop() function (exported by core), the execution of the branch route will end and the branch will not be forwarded further.

Meaning of the parameters is as follows:

*   _branch\_route (string)_ - Branch route block to be called.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and FAILURE\_ROUTE.

**Example�1.35.�`t_on_branch` usage**

...
route { 
	t\_on\_branch("1"); 
	t\_relay();
} 

branch\_route\[1\] {
	if ($ru=~"bad\_uri") {
		xlog("dropping branch $ru \\n");
		drop;
	}
	if ($ru=~"GW\_uri") {
		append\_rpid();
	}
}
...

  

### 1.4.14.� `t_inject_branches(source[,flags])`

The function adds new SIP branches (destinations) to an existing transaction and fires them (sends them out). The transaction may already have ongoing branches (like in ringing state), which will not be affected by the injection of the new branches. Also it is possible for the transaction not to have any ongoing branches at the moment of the injection (still, the transaction must wait for new branches, even if all existing ones are completed - see the [t\_wait\_for\_new\_branches()](#func_t_wait_for_new_branches "1.4.15.� t_wait_for_new_branches([branches])") function for this).

The main usage scenario for this function (and also what makes it different from [t\_relay()](#func_t_relay "1.4.1.� t_relay([flags],[outbound_proxy])") is the ability to add new branches to an ongoing transaction from script routes not related to the transaction ( like timer route, event route, notification route, and other). In such routes, other functions/module used before the injection will point to the transaction to be affected by this injection - see the _event\_routing_ module.

Parameters:

*   _source (string)_ - where to take the description for the new branches to be injected. It can be
    
    *   _event_ - the branch will be taken from the event attributes exposed in an event notification route (see _event\_routing_ module).
    *   _msg_ - the branches will be taken from the RURI of the SIP message and from the additional branches (created by append\_branch() function or similar).
    
*   _flags (string, optional)_ - some additional flags related to the injection process:
    
    *   _cancel_ or _c_ - cancel all the ongoing existing branches from the transaction before injecting the new branches.
    *   _l_ (last) - this is the last injected branch on this transaction, do not wait for any other branches to be injected.
    

**Example�1.36.�`t_inject_branches` usage**

...
route\[event\_notification\] {
	t\_inject\_branches("event");
}
...

  

### 1.4.15.� `t_wait_for_new_branches([branches])`

This function instructs the existing SIP transaction to wait for new branches to be injected even after the completion of the existing branches. This waiting will be done until the Final Response INVITE timer (fr\_inv\_timeout) will hit for the transaction OR until the maximum number of branches were injected (see parameter); of course, the waiting will be terminated if the transaction gets a 2xx final reply from one of the branches.

Normally if you have a transaction with two branches and they get, let's say, a 404 and 486 replies, the branches will be completed and transaction terminated by sending the 404 reply to the caller. Still, if you do _t\_wait\_for\_new\_branches_ before relaying the transaction, the transaction will not terminate upon the completion of the branches and not send the 404 to the caller - it will wait for new branches to be injected (see [t\_inject\_branches()](#func_t_inject_branches "1.4.14.� t_inject_branches(source[,flags])") function) until the fr\_inv timer hits.

Parameters:

*   _branches (integer, options)_ - what is the maximum number of branches to be waited for.
    

**Example�1.37.�`t_wait_for_new_branches` usage**

...
t\_newtran();
t\_wait\_for\_new\_branches();
t\_relay();
...

  

### 1.4.16.� `t_wait_no_more_branches()`

This function instructs the existing SIP transaction to stop wait for new any new branches to be injected. This functions should be used for a transaction that is waiting for dynamic branches, via the [t\_wait\_for\_new\_branches()](#func_t_wait_for_new_branches "1.4.15.� t_wait_for_new_branches([branches])") function.

Usage scenario: your transaction is waiting for dynamic new branches (as a reusult of Push Notification). To a point, on an ongoing branch you receive a final reply - and the fact that the branch fails translates into stop waiting for any more branche (this is an example of a logic on deciding how long to wait for more branches, depending on the answers you get from various devices, fix or mobile).

**Example�1.38.�`t_wait_no_more_branches` usage**

...
t\_wait\_no\_more\_branches();
...

  

### 1.4.17.� `t_add_hdrs("sip_hdrs")`

Attach a set of headers to the existing transaction - these headers will be appended to all requests related to the transaction (outgoing branches, local ACKS, CANCELs).

Parameters:

*   _sip\_hdrs (string)_
    

**Example�1.39.�`t_add_hdrs` usage**

...
t\_add\_hdrs("X-origin: 1.1.1.1\\r\\n");
...

  

### 1.4.18.� `t_add_cancel_reason("Reason_hdr")`

This function is used to enforce from the script level a custom "Reason" header into a CANCEL request. Normally, the Reason header is inherited form the received CANCEL (note that CANCEL propagates in a hop-by-hop manner - it is re-generated at each hop), but this function can overwrite it. It must be called before relaying the CANCEL request and its input must be a fully formated Reason header with name, body and CRLF.

Parameters:

*   _reason\_hdr (string)_
    

**Example�1.40.�`t_add_cancel_reason` usage**

...
t\_add\_cancel\_reason("Reason: SIP ;cause=200 ;text=\\"Call completed elsewhere\\"\\r\\n");
t\_relay();
...

  

### 1.4.19.� `t_replicate(URI,[flags])`

Replicates a request to another destination. No information due the replicated request (like reply code) will be forwarded to the original SIP UAC.

The destination is specified by a SIP URI. If multiple destinations are to be used, the additional SIP URIs have to be set as branches.

Parameters:

*   _uri (string)_
    
*   _flags (string, optional)_ - a set of flags for controlling the internal behaviour - for description see the above “t\_relay(\[flags\])” function. Note that only _no-dns-failover_ is applicable here.
    

This functions can be used from REQUEST\_ROUTE.

**Example�1.41.�`t_replicate` usage**

...
t\_replicate("sip:1.2.3.4:5060");
t\_replicate("sip:1.2.3.4:5060;transport=tcp");
t\_replicate("sip:1.2.3.4",0x4);
...

  

### 1.4.20.� `t_write_req(info,fifo)` `t_write_unix(info,sock)`

Write via FIFO file or UNIX socket a lot of information regarding the request. Which information should be written may be control via the “tw\_append” parameter.

Parameters:

*   _info (string)_
    
*   _path (string)_
    

This functions can be used from REQUEST\_ROUTE, FAILURE\_ROUTE and BRANCH\_ROUTE.

**Example�1.42.�`t_write_req/unix` usage**

...
modparam("tm","tw\_append","append1:Email=$avp(email);UA=$ua")
modparam("tm","tw\_append","append2:body=$rb")
...
t\_write\_req("voicemail/append1","/tmp/appx\_fifo");
...
t\_write\_unix("logger/append2","/var/run/logger.sock");
...

  

### 1.4.21.� `t_flush_flags()`

Flush the flags from current request into the already created transaction. It make sense only in routing block if the transaction was created via t\_newtran() and the flags have been altered since.

This function can be used from REQUEST\_ROUTE and BRANCH\_ROUTE .

**Example�1.43.�`t_flush_flags` usage**

...
t\_flush\_flags();
...

  

### 1.4.22.� `t_anycast_replicate()`

This function is used in an anycast setup to replicate a _CANCEL_ or _ACK_ method for whom there are no local transactions found. The function broadcasts the message to all the other nodes in the cluster, but only the “owner” of the transaction will be able to handle it.

**Example�1.44.�`t_anycast_replicate` usage**

...
if (is\_method("ACK|CANCEL") && !t\_check\_trans()) {
	t\_anycast\_replicate();
	exit;
}
...

  

### 1.4.23.� `t_reply_by_callid(code, reason_phrase, [callid], [cseq])`

This function is used to send a reply to an existing INVITE transaction. The usual use case is when OpenSIPS is used as an UAS and when an INVITE is receveid, it is "parked" locally on OpenSIPS by replying to it with “t\_reply(180, "Ringing")” or “t\_reply(183, "Session Progress")” and later we need to handle CANCEL or BYE for it and send '487 Request Terminated' to the original INVITE transaction.

The callid and cseq used to identify the transaction will be obtained from the current messsage being processed. But they can be passed explicitly so that for example we can handle a BYE where the cseq must be the cseq of the INVITE minus one.

This function can be used from REQUEST\_ROUTE.

**Example�1.45.�`t_reply_by_callid` usage**

...
route{
	if($rU == "LOCAL\_PARK") {
		if(is\_method("INVITE")) {
			$T\_fr\_timeout = 10;
			$T\_fr\_inv\_timeout = 10;
			append\_to\_reply("Contact: sip:LOCAL\_PARK@$socket\_in(ip):$socket\_in(port)\\r\\n");
			t\_reply(180, "Ringing");
			t\_wait\_for\_new\_branches();
		} else if(is\_method("CANCEL")) {
			if(!t\_reply\_by\_callid(487, "Request Terminated")) {
				sl\_send\_reply(481, "Call Leg/Transaction Does Not Exist");
			} else {
				sl\_send\_reply(200, "OK");
			}
		} else if(is\_method("BYE")) {
			$var(prev\_cseq) = ($(cs{s.int}) - 1);
			if(!t\_reply\_by\_callid(487, "Request Terminated", , $var(prev\_cseq))) {
				sl\_send\_reply(481, "Call Leg/Transaction Does Not Exist");
			} else {
				sl\_send\_reply(200, "OK");
			}
		} else if(is\_method("ACK")) {
			t\_relay();
		}
		exit;
	}
}
...