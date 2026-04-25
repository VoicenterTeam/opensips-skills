# tm Module Reference
<!-- generated-from: data/3.6/modules/tm.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 tm module. Read this file when configuring or debugging the tm module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

TM module enables stateful processing of SIP transactions. The main use of stateful logic, which is costly in terms of memory and CPU, is some services inherently need state. For example, transaction-based accounting (module acc) needs to process transaction state as opposed to individual messages, and any kinds of forking must be implemented statefully. Other use of stateful processing is it trading CPU caused by retransmission processing for memory. That makes however only sense if CPU consumption per request is huge. For example, if you want to avoid costly DNS resolution for every retransmission of a request to an unresolvable destination, use stateful mode. Then, only the initial message burdens server by DNS queries, subsequent retransmissions will be dropped and will not result in more processes blocked by DNS resolution. The price is more memory consumption and higher processing latency.

From user's perspective, the major function is t_relay(). It setup transaction state, absorb retransmissions from upstream, generate downstream retransmissions and correlate replies to requests.

In general, if TM is used, it copies clones of received SIP messages in shared memory. That costs the memory and also CPU time (memcpys, lookups, shmem locks, etc.) Note that non-TM functions operate over the received message in private memory, that means that any core operations will have no effect on statefully processed messages after creating the transactional state. For example, calling record_route _after_ t_relay is pretty useless, as the RR is added to privately held message whereas its TM clone is being forwarded.

TM is quite big and uneasy to program--lot of mutexes, shared memory access, malloc and free, timers--you really need to be careful when you do anything. To simplify TM programming, there is the instrument of callbacks. The callback mechanisms allow programmers to register their functions to specific event. See t_hooks.h for a list of possible events.

Other things programmers may want to know is UAC--it is a very simplistic code which allows you to generate your own transactions. Particularly useful for things like NOTIFYs or IM gateways. The UAC takes care of all the transaction machinery: retransmissions , FR timeouts, forking, etc. See t_uac prototype in uac.h for more details. Who wants to see the transaction result may register for a callback.

## How It Works

First what is the idea with the branch concept: branch route is a route to be execute separately for each branch before being sent out - changes in that route should reflect only on that branch.

There are several types of flags in OpenSIPS :

* _message/transaction_ flags - they are visible everywhere in the transaction (in all routes and in all sequential replies/request).
* _branch_ flags - flags that are visible only from a specific branch - in all replies and routes connected to this branch.
* _script_ flags - flags that exist only during script execution. They are not store anywhere and are lost once the top level route was left.

For example: I have a call parallel forking to GW and to a user. And I would like to know from which branch I will get the final negative reply (if so). I will set a branch route before relaying the calls (with the 2 branches). The branch route will be separately executed for each branch; in the branch going to GW (I can identified it by looking to RURI), I will set a branch flag. This flag will appear only in the onreply route run for replied from GW. It will be also be visible in failure route if the final elected reply belongs to the GW branch. This flags will not be visible in the other branch (in routes executing replies from the other branch).

For how to define branch flags and use via script, see t_on_branch() and the setbflag(), resetbflag() and isbflagset() script functions.

Also, modules may set branch flags before transaction creation (for the moment this feature is not available in script). The REGISTRAR module was the first to use this type of flags. The NAT flag is pushed in branch flags instead in message flags

Timeouts can be used to trigger failover behavior. E.g. if we send a call to a gateway and the gateway does not send a provisional response within 3 seconds, we want to cancel this call and send the call to another gateway. Another example is to ring a SIP client only for 30 seconds and then redirect the call to the voicemail.

The transaction module exports two types of timeouts:

* **fr_timeout** - used when no response was received yet. If there is no response after fr_timeout seconds, the timer triggers (and failure route will be executed if t_on_failure() was called). For INVITE transactions, if a provisional response was received, the timeout is reset to fr_inv_timeout seconds and RT_T2 for all other transactions. Once a final response is received, the transaction has finished.
* fr_inv_timeout - this timeout starts counting down once a provisional response was received for an INVITE transaction.

For example: You want to have failover if there is no provisional response after 3 seconds, but you want to ring for 60 seconds. Thus, set the fr_timeout to 3 and fr_inv_timeout to 60.

DNS based failover can be use when relaying stateful requests. According to RFC 3263, DNS failover should be done on transport level or transaction level. TM module supports them both.

Failover at transport level may be triggered by a failure of sending out the request message. A failure occurs if the corresponding interface was found for sending the request, if the TCP connection was refused or if a generic internal error happened during send. There is no ICMP error report support.

Failover at transaction level may be triggered when the transaction completed either with a 503 reply, either with a timeout without any received reply. In such a case, automatically, a new branch will be forked if any other destination IPs can be used to deliver the requests. The new branch will be a clone of the winning branch.

The set of destinations IPs is step-by-step build (on demand) based on the NAPTR, SRV and A records available for the destination domain.

DNS-based failover is by default applied excepting when this failover is globally disabled (see the core parameter disable_dns_failover) or when the relay flag (per transaction) is set (see the t_relay() function).

Doing a load balancing scenario using Anycast IPs, one might run into an issue where a transaction request comes on one instance, and the reply (or replies) comes on different ones. This would normaly break the transaction state, because the local transaction will start re-transmissios and would eventually timeout. Moreover, from UA's perspective, the reply whould have been sent, but since it reaches a proxy that is not aware of that transaction, it will not be forwarded (nor ACKed in case of INVITES). And from this point things can escalade quickly.

To sort out these problems, the module uses a distributed mechanism to figure out where the transaction for a specific reply was created. When an instance receives a reply that does not have an associated transaction, it replicates it to be handled by the instance that “owns” it. This is achieved using the clusterer module support.

Setting up an anycast scenario is very simple: all the instances that are part of an anycast secnario must be set up in a cluster (more info at the tm_replication_cluster param). When a transaction is created, a special identifier is appended to the branch parameter, namely the instance that created the transaction. When a reply comes in, the transaction module checks who “owns” the transaction. If the identifier is the instance's own id, then the reply is processed locally. Otherwise it is replicated to the node indicated by the id. Replication is done in a very efficient manner, using the proto_bin transport.

Special handling is applied to CANCEL and ACK methods. Due to the fact that these methods do not contain the special identifier in the branch parameter (since they are generated by the UAC and not by us), there is no way to determine who “owns” the transaction. Therefore, if we do not find a local transaction for these requests, we broadcast them to all the other instances using the t_anycast_replicate() function. Again, this is done in a very efficient manner using the proto_bin transport.

Transaction functions and variables are only designed to be called on SIP request messages where a transaction can be created, or in routes that are transaction aware, such as branch_route[name], failure_route[name] or onreply_route[name]. Using TM functtions or variables in a route that is not transaction aware, such as the generic onreply_route, error_route or timer_route[name, timer] may lead to undefined behavior, and most of the time in bogus or malformed signalling. Therefore it is strongly recommended to avoid using them in non-tm context aware routes.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

### Optional Modules

- `clusterer`

## Exported Parameters

### `T1_timer` (integer)

Retransmission T1 period, in milliseconds.

*Default value is 500 milliseconds.*

**Example.** Set the `T1_timer` parameter.

```opensips
modparam("tm", "T1\_timer", 700)
```
### `T2_timer` (integer)

Maximum retransmission period, in milliseconds.

*Default value is 4000 milliseconds.*

**Example.** 8000.

```opensips
modparam("tm", "T2\_timer", 8000)
```
### `auto_100trying` (integer)

This parameter controls if the TM module should automatically generate an 100 Trying stateful reply when an INVITE transaction is created. You may want to disable this behavior if you want to control from script level when the 100 Trying is to be sent out.

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
modparam("tm", "auto_100trying", 0)
```
### `cluster_auto_cancel` (boolean)

This parameter should be used in an anycast setup, and specifies whether a CANCEL message received on a listener that is marked as anycast should be automatically handled, or should get in the OpenSIPS script. If this parameter is enabled (default), CANCEL messages received on an anycast listener will never enter the script, thus making the script cleaner. Check out the tm_anycast section for more details.

*Default value is yes.*

**Possible values:**

- yes
- no

**Example.** no.

```opensips
...
# disable auto-cancel handling
modparam("tm", "cluster\_auto\_cancel", no)
...
```
### `cluster_param` (string)

This parameter should be used in an anycast setup, and specifies the name of the parameter used in the VIA branch param to specifiy the instance id that created the transaction. Check out the tm_anycast section for more details.

*Default value is cid.*

**Example.** tid.

```opensips
...
modparam("tm", "cluster\_param", "tid")
...
```
### `delete_timer` (integer)

Time after which a to-be-deleted transaction currently ref-ed by a process will be tried to be deleted again.

*Default value is 2 seconds.*

**Example.** Set the `delete_timer` parameter.

```opensips
modparam("tm", "delete\_timer", 5)
```
### `disable_6xx_block` (integer)

Tells how the 6xx replies should be internally handled: 0 - the 6xx replies will block any further serial forking (adding new branches). This is the RFC3261 behaviour. 1 - the 6xx replies will be handled as any other negative reply - serial forking will be allowed. Logically, you need to break RFC3261 if you want to do redirects to announcement and voicemail services.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("tm", "disable_6xx_block", 1)
```
### `enable_stats` (integer)

Enables statistics support in TM module - If enabled, the TM module will internally keep several statistics and export them via the MI - Management Interface.

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
modparam("tm", "enable_stats", 0)
```
### `fr_inv_timeout` (integer)

Timeout which is triggered if no final reply for an INVITE arrives after a provisional message was received (in seconds). This timeout starts counting down once the first provisional response is received. Thus, fast failover (no 100 trying from gateway) can be achieved by setting fr_timeout to low values. See example below.

*Default value is 120 seconds.*

**Example.** Set the `fr_inv_timeout` parameter.

```opensips
modparam("tm", "fr\_inv\_timeout", 200)
```
### `fr_timeout` (integer)

Timeout which is triggered if no final reply for a request or ACK for a negative INVITE reply arrives (in seconds).

*Default value is 30 seconds.*

**Example.** Set the `fr_timeout` parameter.

```opensips
modparam("tm", "fr\_timeout", 10)
```
### `local_reply_route` (string)

This parameter points to a route, which is executed whenever TM is about to send out a locally generated reply (e.g., through the B2B modules or through MI). The purpose of this route is limited to exposing the content of the reply as SIP message IMPORTANT: this route is to be used in a read-only manner, inspection only. Any changes you do here will discarded. IMPORTANT: this route does not offer any message, transactional or dialog context, so do not rely on any variables with scope (like AVPs).

**Example.** tm_local_reply.

```opensips
...
# Execute the route "tm\_local\_reply" upon sending a request
modparam("tm", "local\_reply\_route", "tm\_local\_reply")

route\[tm\_local\_reply\] {
	if (is\_method("BYE")) {
		$var(rc) = rest\_get("http://localhost/qos/delete",
					$var(recv\_body), $var(recv\_ct), $var(rcode));
	}
}
...
```
### `local_request_route` (string)

This parameter points to a route, which is executed whenever TM is about to send out a locally generated request (e.g., through the B2B modules or through MI). The purpose of this route is limited to exposing the content of the request as SIP message The route is executed with the generated message by TM, incorporating all modifications. IMPORTANT: this route is executed AFTER the local_route (if defined) and it expose all the changes from that route. IMPORTANT: this route is to be used in a read-only manner, inspection only. Any changes you do here will discarded. IMPORTANT: this route does not offer any message, transactional or dialog context, so do not rely on any variables with scope (like AVPs).

**Example.** tm_local_request.

```opensips
...
# Execute the route "local\_request\_route" upon sending a request
modparam("tm", "local\_request\_route", "tm\_local\_request")

route\[tm\_local\_request\] {
	if (is\_method("INVITE") && $rb(application/sdp) && !has\_totag()) {
		$avp(sdp\_request) := $rb(application/sdp);
	}
}
...
```
### `minor_branch_flag` (string/integer)

A branch flag index to be used in script to mark the minor branches ( before t_relay() ). A minor branch is a branch OpenSIPS will not wait to complete during parallel forking. So, if the rest of the branches are negativly replied OpenSIPS will not wait for a final answer from the minor branch, but it will simply cancel it. Main applicability of minor branch is to fork a branch to a media server for injecting (via 183 Early Media) some pre-call media - of course, this branch will be transparanent for the rest of the call branches (from branch selection point of view).

*Default value is none (disabled).*

**Example.** "MINOR_BFLAG".

```opensips
modparam("tm", "minor_branch_flag", "MINOR_BFLAG")
```
### `onreply_avp_mode` (integer)

Describes how the AVPs should be handled in reply route: 0 - the AVPs will be per message only; they will not interfere with the AVPS stored in transaction; initially there will be an empty list and at the end of the route, all AVPs that were created will be discarded. 1 - the AVPs will be the transaction AVPs; initially the transaction AVPs will be visible; at the end of the route, the list will attached back to transaction (with all the changes). In mode 1, you can see the AVPs you set in request route, branch route or failure route. The side effect is performance as more locking is required in order to keep the AVP's list integrity.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("tm", "onreply_avp_mode", 1)
```
### `pass_provisional_replies` (integer)

Enable/disable passing of provisional replies to FIFO applications.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("tm", "pass_provisional_replies", 1)
```
### `restart_fr_on_each_reply` (integer)

If true (non null value), the final response timer will be re-triggered for each received provisional reply. In this case, final response timeout may occur after a time longer than fr_inv_timeout (if UAS keeps sending provisional replies)

*Default value is 1 (true).*

**Example.** 0.

```opensips
modparam("tm", "restart\_fr\_on\_each\_reply", 0)
```
### `ruri_matching` (integer)

Should be request-uri matching used as a part of pre-3261 transaction matching as the standard wants us to do so? Turn only off for better interaction with devices that are broken and send different r-uri in CANCEL/ACK than in original INVITE.

*Default value is 1 (true).*

**Example.** 0.

```opensips
modparam("tm", "ruri\_matching", 0)
```
### `syn_branch` (integer)

Enable/disable the usage of stateful synonym branch IDs in the generated Via headers. They are faster but not reboot-safe.

*Default value is 1 (use synonym branches).*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("tm", "syn_branch", 0)
```
### `timer_partitions` (integer)

The number of partitions for the internal TM timers (retransmissions, delete, wait, etc). Partitioning the timers increase the throughput under heavly load by handling timer events in parallel, rather than all serial.

*Default value is 1 (disabled).*

*Valid range: up to 16.*

**Notes:** Recomanded range for timer partitions is max 16 (soft limit).

**Example.** 2.

```opensips
modparam("tm", "timer_partitions", 2)
```
### `tm_replication_cluster` (integer)

This parameter should be used in an anycast setup, and specifies the cluster id of all the nodes that use an anycast IP. Check out the tm_anycast section for more details.

*Default value is Anycast replication is disabled by default..*

**Notes:** Anycast replication is disabled by default.

**Example.** 1.

```opensips
modparam("tm", "tm_replication_cluster", 1)
```
### `tw_append` (string)

List of additional information to be appended by t_write_req and t_write_unix functions.

*Default value is null string.*

**Notes:** Syntax of the parameter is: tw_append = append_name':' element (';'element)*; element = ( [name '='] variable). Each element will be appended per line in “name: value” format. Element “$rb (message body)” is the only one which does not accept name; the body it will be printed all the time at the end, disregarding its position in the definition string.

**Example.** test: ua=$hdr(User-Agent) ;avp=$avp(avp);$rb;time=$Ts.

```opensips
modparam("tm", "tw_append",
   "test: ua=$hdr(User-Agent) ;avp=$avp(avp);$rb;time=$Ts")
```
### `unix_tx_timeout` (integer)

Send timeout to be used by function which use UNIX sockets (as t\_write\_unix).

*Default value is 2 seconds.*

**Example.** 5.

```opensips
modparam("tm", "unix\_tx\_timeout", 5)
```
### `via1_matching` (integer)

Should be top most VIA matching used as a part of pre-3261 transaction matching as the standard wants us to do so? Turn only off for better interaction with devices that are broken and send different top most VIA in CANCEL/ACK than in original INVITE.

*Default value is 1 (true).*

**Example.** 0.

```opensips
modparam("tm", "via1\_matching", 0)
```
### `wt_timer` (integer)

Time for which a transaction stays in memory to absorb delayed messages after it completed; also, when this timer hits, retransmission of local cancels is stopped (a puristic but complex behavior would be not to enter wait state until local branches are finished by a final reply or FR timer--we simplified). For non-INVITE transaction this timer relates to timer J of RFC 3261 section 17.2.2. According to the RFC this timer should be 64*T1 (= 32 seconds). But this would increase memory usage as the transactions are kept in memory very long.

*Default value is 5 seconds.*

**Example.** Set the `wt_timer` parameter.

```opensips
modparam("tm", "wt\_timer", 10)
```

## Exported Functions

### `t_add_cancel_reason("Reason_hdr")`

This function is used to enforce from the script level a custom "Reason" header into a CANCEL request. Normally, the Reason header is inherited form the received CANCEL (note that CANCEL propagates in a hop-by-hop manner - it is re-generated at each hop), but this function can overwrite it. It must be called before relaying the CANCEL request and its input must be a fully formated Reason header with name, body and CRLF.

**Parameters:**

- `reason_hdr` *(string, required)* — This function is used to enforce from the script level a custom "Reason" header into a CANCEL request. Normally, the Reason header is inherited form the received CANCEL (note that CANCEL propagates in a hop-by-hop manner - it is re-generated at each hop), but this function can overwrite it. It must be called before relaying the CANCEL request and its input must be a fully formated Reason header with name, body and CRLF.

**Example.** .

```opensips
t_add_cancel_reason("Reason: SIP ;cause=200 ;text=\"Call completed elsewhere\"\r\n");
t_relay();
```

### `t_add_hdrs("sip_hdrs")`

Attach a set of headers to the existing transaction - these headers will be appended to all requests related to the transaction (outgoing branches, local ACKS, CANCELs).

**Parameters:**

- `sip_hdrs` *(string, required)* — Attach a set of headers to the existing transaction - these headers will be appended to all requests related to the transaction (outgoing branches, local ACKS, CANCELs).

**Example.** .

```opensips
t_add_hdrs("X-origin: 1.1.1.1\r\n");
```

### `t_anycast_replicate()`

This function is used in an anycast setup to replicate a _CANCEL_ or _ACK_ method for whom there are no local transactions found. The function broadcasts the message to all the other nodes in the cluster, but only the “owner” of the transaction will be able to handle it.

**Usable from:** REQUEST_ROUTE

**Example.** t_anycast_replicate usage.

```opensips
if (is_method("ACK|CANCEL") && !t_check_trans()) {
	t_anycast_replicate();
	exit;
}
```

### `t_cancel_branch([flags])`

This function is to be call when a reply is received for cancelling a set of branches (see flags) of the current call.

**Parameters:**

- `flags` *(string, optional)* — Set of flags (char based flags) to control what branches to be cancelled.
  - `a`
  - `o`
  - `empty`

**Usable from:** ONREPLY_ROUTE

**Example.** Cancel the current branch if a 183 reply is received..

```opensips
onreply_route[3] {
...
	if (t_check_status(183)) {
		# no support for early media
		t_cancel_branch();
	}
...
}
```

### `t_check_status(re)`

Returns true if the regualr expression “re” match the reply code of the response message as follows: * in routing block - the code of the last sent reply. * in on_reply block - the code of the current received reply. * in on_failure block - the code of the selected negative final reply.

**Parameters:**

- `re` *(string, required)* — Regular expression to match against the reply code.

**Return codes:**

- `true` — if the regular expression matches the reply code

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Check if the reply code is 487 or 408..

```opensips
if (t_check_status("(487)|(408)")) {
    log("487 or 408 negative reply\n");
}
```

### `t_check_trans()`

Returns true if the current request is associated to a transaction. The relationship between the request and transaction is defined as follows:

*   _non-CANCEL/non-ACK requests_ - if the request belongs to a transaction (it's a retransmision), the function will do a standard processing of the retransmission and will break/stop the script. The function returns false if the request is not a retransmission.
    
*   _CANCEL request_ - true if the cancelled INVITE transaction exists.
    
*   _ACK request_ - true if the ACK is a hop-by-hop ACK (to a negative reply) corresponding to an previous INVITE transaction. IMPORTANT: this function returns false (return code _-2_) for end-to-end ACKs (to 2xx replies from a different transaction).
    
Note: To detect retransmissions using this function you have to make sure that the initial request has already created a transaction, e.g. by using t_relay(). If the processing of requests may take long time (e.g. DB lookups) and the retransmission arrives before t_relay() is called, you can use the t_newtran() function to manually create a transaction.

**Return codes:**

- `true` — non-CANCEL/non-ACK requests: if the request belongs to a transaction (it's a retransmision); CANCEL request: if the cancelled INVITE transaction exists; ACK request: if the ACK is a hop-by-hop ACK (to a negative reply) corresponding to an previous INVITE transaction.
- `false` — non-CANCEL/non-ACK requests: if the request is not a retransmission.
- `-2` — ACK request: for end-to-end ACKs (to 2xx replies from a different transaction).

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE

**Related:**

- `t_newtran`
- `t_relay`

**Example.** t_check_trans usage.

```opensips
...
if ( is_method("CANCEL") ) {
	if ( t_check_trans() )
		t_relay();
	exit;
}
...

```

### `t_flush_flags()`

Flush the flags from current request into the already created transaction. It make sense only in routing block if the transaction was created via t_newtran() and the flags have been altered since.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE

**Example.** t_flush_flags usage.

```opensips
t_flush_flags();
```

### `t_get_branch_idx_by_attr(attr, [val_str], [val_int], [result_var], [offset])`

This function may be used to search for the index of another branch of the current transaction. The searching is done based on the per-branch attribute - you need to provide the name of the attribute at least. Optionally you can provide a value (string or integer) for the attribute used for searching. As input, the function may take an optional branch offset (absolute value, covering all branches of the transaction) where the search should start from.

**Parameters:**

- `attr` *(string, required)* — Name of the attribute
- `offset` *(int, optional)* — Branch offset to start search from
- `result_var` *(var, optional)* — Variable to store the result
- `val_int` *(int, optional)* — Value for the attribute (integer)
- `val_str` *(string, optional)* — Value for the attribute (string)

**Return codes:**

- `true` — if a branch (having the given name and value for the attribute) was found

**Usable from:** ONREPLY_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Example.** t_get_branch_idx_by_attr usage.

```opensips
	# search for a branch which has the "name" attribute
	# with string value "pstn"
	if (t_get_branch_idx_by_attr("name", "pstn", , $var(idx))) {
		xlog("found branch has index $var(idx)\n");
	}
```

### `t_inject_branches(source[,flags])`

The function adds new SIP branches (destinations) to an existing transaction and fires them (sends them out). The transaction may already have ongoing branches (like in ringing state), which will not be affected by the injection of the new branches. Also it is possible for the transaction not to have any ongoing branches at the moment of the injection (still, the transaction must wait for new branches, even if all existing ones are completed - see the t_wait_for_new_branches() function for this).

The main usage scenario for this function (and also what makes it different from t_relay() is the ability to add new branches to an ongoing transaction from script routes not related to the transaction ( like timer route, event route, notification route, and other). In such routes, other functions/module used before the injection will point to the transaction to be affected by this injection - see the _event_routing_ module.

**Parameters:**

- `flags` *(string, optional)* — some additional flags related to the injection process:
  - `cancel`
  - `c`
  - `l`
- `source` *(string, required)* — where to take the description for the new branches to be injected. It can be
  - `event`
  - `msg`

**Usable from:** timer route, event route, notification route, REQUEST_ROUTE

**Related:**

- `append_branch()`
- `t_relay()`
- `t_wait_for_new_branches()`

**Example.** t_inject_branches usage.

```opensips
route[event_notification] {
	t_inject_branches("event");
}
```

### `t_local_replied(reply)`

Returns true if all or last (depending of the parameter) reply(es) were local generated (and not received).

**Parameters:**

- `reply` *(string, required)* — Specifies whether to check all replies or just the last one.
  - `all`
  - `last`

**Return codes:**

- `true` — if all or last (depending of the parameter) reply(es) were local generated

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE

**Example.** Check if all replies were locally generated..

```opensips
if (t_local_replied("all")) {
	log ("no reply received\n");
}
```

### `t_new_request( method, RURI, from, to [, body[, ctx]])`

This function generates and sends out a new SIP request (in a stateful way). The new request is completly unrelated to the currently processed SIP message.

**Parameters:**

- `body` *(string, optional)* — The SIP body content starting with the content type string: "conten_type body".
- `ctx` *(string, optional)* — A context string that will be added to the new transaction as an AVP with name "uac_ctx" (it may be visible in local route).
- `from` *(string, required)* — The SIP From hdr information as "[display ]URI".
- `method` *(string, required)* — The SIP method.
- `RURI` *(string, required)* — The SIP Request URI (the request will be sent out to this destination).
- `to` *(string, required)* — The SIP To hdr information as "[display ]URI".

**Example.** Send a new MESSAGE request..

```opensips
	# send a MESSAGE request
	t_new_request("MESSAGE","sip:alice@192.168.2.2","BOB sip:userB@mydomain.net","ALICE sip:userA@mydomain.net","text/plain Hello Alice!")) {
```

### `t_newtran()`

Creates the SIP transaction for the currently processed SIP request, thus switching to stateful processing. For INVITE requests, a 100 Trying reply will be immediately sent, unless [auto_100trying](#param_auto_100trying "1.3.19.�auto_100trying (integer)") is disabled. Once a SIP transaction is created, calling [t_newtran()](#func_t_newtran "1.4.4.� t_newtran()") for retransmitted requests will end the OpenSIPS script execution, with the lastly sent reply being retransmitted upstream.

**Usable from:** REQUEST_ROUTE

**Related:**

- `t_relay`

**Example.** t_newtran usage.

```opensips
...
t_newtran();  # 100 Trying is fired here
xlog("doing my complicated routing logic\\n");
....
t_relay(); # send the call further
...

```

### `t_on_branch(branch_route)`

Sets a branch route to be execute separately for each branch of the transaction before being sent out - changes in that route should reflect only on that branch.

As not all functions are available from this type of route, please check the documentation for each function to see the permissions. Any other commands may result in unpredictable behavior and possible server failure.

Only one branch_route can be armed for a request. If you use many time t_on_branch(), only the last one has effect.

By calling the drop() function (exported by core), the execution of the branch route will end and the branch will not be forwarded further.

**Parameters:**

- `branch_route` *(string, required)* — Branch route block to be called.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `drop()`

**Example.** t_on_branch usage.

```opensips
route { 
	t_on_branch("1"); 
	t_relay();
} 

branch_route[1] {
	if ($ru=~"bad_uri") {
		xlog("dropping branch $ru \n");
		drop;
	}
	if ($ru=~"GW_uri") {
		append_rpid();
	}
}
```

### `t_on_failure(failure_route)`

Sets reply routing block, to which control is passed after a transaction completed with a negative result but before sending a final reply. In the referred block, you can either start a new branch (good for services such as forward_on_no_reply) or send a final reply on your own (good for example for message silo, which received a negative reply from upstream and wants to tell upstream “202 I will take care of it”).

As not all functions are available from failure route, please check the documentation for each function to see the permissions. Any other commands may result in unpredictable behavior and possible server failure.

Only one failure_route can be armed for a request. If you use many times t_on_failure(), only the last one has effect.

Note that whenever failure_route is entered, RURI is set to value of the winning branch.

**Parameters:**

- `failure_route` *(string, required)* — Reply route block to be called.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE

**Example.** t_on_failure usage.

```opensips
route { 
	t_on_failure("1"); 
	t_relay();
} 

failure_route[1] {
	seturi("sip:user@voicemail");
	t_relay();
}
```

### `t_on_reply(reply_route)`

Sets reply routing block, to which control is passed each time a reply (provisional or final) for the transaction is received. The route is not called for local generated replies! In the referred block, you can inspect the reply and perform text operations on it.

As not all functions are available from this type of route, please check the documentation for each function to see the permissions. Any other commands may result in unpredictable behavior and possible server failure.

If called from branch route, the reply route will be set only for the current branch - that's it, it will be called only for relies belonging to that particular branch. Of course, from branch route, you can set different reply routes for each branch.

When called from a non-branc route, the reply route will be globally set for tha current transaction - it will be called for all replies belonging to that transaction. NOTE that only _one>_ onreply_route can be armed for a transaction. If you use many times t_on_reply(), only the last one has effect.

If the processed reply is provisionla reply (1xx code), by calling the drop() function (exported by core), the execution of the route will end and the reply will not be forwarded further.

**Parameters:**

- `reply_route` *(string, required)* — Reply route block to be called.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `drop()`

**Example.** t_on_reply usage.

```opensips
route {
	seturi("sip:bob@opensips.org");  # first branch
	append_branch("sip:alice@opensips.org"); # second branch

	t_on_reply("global"); # the "global" reply route 
	                      # is set the whole transaction
	t_on_branch("1");

	t_relay();
}

branch_route[1] {
	if ($rU=="alice")
		t_on_reply("alice"); # the "alice" reply route
		                      # is set only for second branch
}

onreply_route[alice] {
	xlog("received reply from alice\n");
}

onreply_route[global] {
	if (t_check_status("1[0-9][0-9]")) {
		setflag(LOG_FLAG);
		log("provisional reply received\n");
		if (t_check_status("183"))
			drop;
	}
}
```

### `t_relay([flags],[outbound_proxy])`

Relay a message statefully to destination indicated in current URI. (If the original URI was rewritten by UsrLoc, RR, strip/prefix, etc., the new URI will be taken). Returns a negative value on failure--you may still want to send a negative reply upstream statelessly not to leave upstream UAC in lurch.

The coresponding transaction may or may not be already created. If not yet created, the function will automatically create it.

The function may take two optional parameters.

The first parameter is a comma separated list of string flags for controlling the internal behaviour. The supported flags are:

*   _no-auto-477_ - (old _0x02_ flag) do not internally generate and send a "477 Send failed (477/TM)" SIP reply in case of a global forwarding failure (i.e. forwarding for each branch has failed due to internal errors, bad R-URI, bad message, lack of network reachability, etc.).
    
    This flag only applies if the transaction was not previously created by [t_newtran()](#func_t_newtran "1.4.4.� t_newtran()"). When a global forwarding failure occurs, no SIP request is relayed and therefore no negative SIP reply or timeout will show up on the failure_route, if one is set.
    
    Useful if you want to implement a failover logic for when none of the currently created branches can be forwarded to.
    
*   _no-dns-failover_ - (old _0x04_ flag) disable the DNS failover for the transaction. Only first IP will be used. It disables the failover both at transport and transaction level.
    
*   _pass-reason-hdr_ - (old _0x08_ flag) If the request is a CANCEL, trust and pass further the Reason header from the received CANCEL - shortly, will propagate the Reason header.
    
*   _allow-no-cancel_ - (old _0x10_ flag) Allows OpenSIPS to inspect and follow the Content-Disposition "no-cancel" indication (if present). As per RFC3841, section 9.1, the TM module may be instructed not to cancel all ongoing branches when a 2xx reply is received. It will keep the pending branches ongoing until (1) all branches will receive a final reply or (2) the transactionhits the timeout.
    
The second parameter is a string representing an outbound proxy (a fixed destination) where the message should be sent. The destination is specified as “[proto:]host[:port]”. If a destination URI “$du” for this message was set before the function is called then this value will be used as the destination instead of the function parameter.

**Parameters:**

- `flags` *(string, optional)* — A comma separated list of string flags for controlling the internal behaviour.
  - `no-auto-477`
  - `no-dns-failover`
  - `pass-reason-hdr`
  - `allow-no-cancel`
- `outbound_proxy` *(string, optional)* — A string representing an outbound proxy (a fixed destination) where the message should be sent. The destination is specified as “[proto:]host[:port]”.

**Return codes:**

- `-1` — generic internal error
- `-2` — bad message (parsing errors)
- `-3` — no destination available (no branches were added or request already cancelled)
- `-4` — bad destination (unresolvable address)
- `-5` — destination filtered (black listed)
- `-6` — generic send failed

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Related:**

- `t_newtran()`

**Example.** t_relay usage.

```opensips
...
if (!t_relay()) {
    sl_reply_error();
    exit;
}
...
t_relay( ,"tcp:192.168.1.10:5060");
...
t_relay(0x1, "mydomain.com:5070");
...

```

### `t_replicate(URI,[flags])`

Replicates a request to another destination. No information due the replicated request (like reply code) will be forwarded to the original SIP UAC. The destination is specified by a SIP URI. If multiple destinations are to be used, the additional SIP URIs have to be set as branches.

**Parameters:**

- `flags` *(string, optional)* — a set of flags for controlling the internal behaviour - for description see the above “t_relay([flags])” function. Note that only no-dns-failover is applicable here.
- `uri` *(string, required)* — The destination is specified by a SIP URI. If multiple destinations are to be used, the additional SIP URIs have to be set as branches.

**Usable from:** REQUEST_ROUTE

**Example.** .

```opensips
t_replicate("sip:1.2.3.4:5060");
t_replicate("sip:1.2.3.4:5060;transport=tcp");
t_replicate("sip:1.2.3.4",0x4);
```

### `t_reply(code, reason_phrase)`

Sends a stateful SIP reply to the currently processed requests. Note that if the transaction was not created yet, it will automatically created by internally using the `t_newtran` function.

**Parameters:**

- `code` *(int, required)* — Reply code number.
- `reason_phrase` *(string, required)* — Reason string.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Related:**

- `t_newtran`

**Example.** t_reply usage.

```opensips
...
t_reply(404, "Use $rU not found");
...

```

### `t_reply_by_callid(code, reason_phrase, [callid], [cseq])`

This function is used to send a reply to an existing INVITE transaction. The usual use case is when OpenSIPS is used as an UAS and when an INVITE is receveid, it is "parked" locally on OpenSIPS by replying to it with “t_reply(180, "Ringing")” or “t_reply(183, "Session Progress")” and later we need to handle CANCEL or BYE for it and send '487 Request Terminated' to the original INVITE transaction. The callid and cseq used to identify the transaction will be obtained from the current messsage being processed. But they can be passed explicitly so that for example we can handle a BYE where the cseq must be the cseq of the INVITE minus one.

**Parameters:**

- `callid` *(string, optional)* — Call-ID
- `code` *(int, required)* — Reply code number
- `cseq` *(int, optional)* — CSEQ number
- `reason_phrase` *(string, required)* — Reason string

**Usable from:** REQUEST_ROUTE

**Related:**

- `t_reply`

**Example.** t_reply_by_callid usage.

```opensips
route{
	if($rU == "LOCAL_PARK") {
		if(is_method("INVITE")) {
			$T_fr_timeout = 10;
			$T_fr_inv_timeout = 10;
			append_to_reply("Contact: sip:LOCAL_PARK@$socket_in(ip):$socket_in(port)\r\n");
			t_reply(180, "Ringing");
			t_wait_for_new_branches();
		} else if(is_method("CANCEL")) {
			if(!t_reply_by_callid(487, "Request Terminated")) {
				sl_send_reply(481, "Call Leg/Transaction Does Not Exist");
			} else {
				sl_send_reply(200, "OK");
			}
		} else if(is_method("BYE")) {
			$var(prev_cseq) = ($(cs{s.int}) - 1);
			if(!t_reply_by_callid(487, "Request Terminated", , $var(prev_cseq))) {
				sl_send_reply(481, "Call Leg/Transaction Does Not Exist");
			} else {
				sl_send_reply(200, "OK");
			}
		} else if(is_method("ACK")) {
			t_relay();
		}
		exit;
	}
}
```

### `t_reply_with_body(code, reason_phrase, body)`

Sends a stateful SIP reply with a body to the currently processed requests. Note that if the transaction was not created yet, it will automatically created by internally using the `t_newtran` function.

**Parameters:**

- `body` *(string, required)* — Reply body.
- `code` *(int, required)* — Reply code number.
- `reason_phrase` *(string, required)* — Reason string.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Related:**

- `t_newtran`

**Example.** t_reply_with_body usage.

```opensips
...
	if(is_method("INVITE"))
	{
		append_to_reply("Contact: $var(contact)\\r\\n"
				"Content-Type: application/sdp\\r\\n");
		t_reply_with_body(200, "Ok", $var(body));
		exit;
	}
...

```

### `t_wait_for_new_branches([branches])`

This function instructs the existing SIP transaction to wait for new branches to be injected even after the completion of the existing branches. This waiting will be done until the Final Response INVITE timer (fr_inv_timeout) will hit for the transaction OR until the maximum number of branches were injected (see parameter); of course, the waiting will be terminated if the transaction gets a 2xx final reply from one of the branches.

Normally if you have a transaction with two branches and they get, let's say, a 404 and 486 replies, the branches will be completed and transaction terminated by sending the 404 reply to the caller. Still, if you do _t_wait_for_new_branches_ before relaying the transaction, the transaction will not terminate upon the completion of the branches and not send the 404 to the caller - it will wait for new branches to be injected (see t_inject_branches() function) until the fr_inv timer hits.

**Parameters:**

- `branches` *(integer, optional)* — what is the maximum number of branches to be waited for.

**Usable from:** REQUEST_ROUTE

**Related:**

- `t_inject_branches()`

**Example.** t_wait_for_new_branches usage.

```opensips
t_newtran();
t_wait_for_new_branches();
t_relay();
```

### `t_wait_no_more_branches()`

This function instructs the existing SIP transaction to stop wait for new any new branches to be injected. This functions should be used for a transaction that is waiting for dynamic branches, via the t_wait_for_new_branches() function. Usage scenario: your transaction is waiting for dynamic new branches (as a reusult of Push Notification). To a point, on an ongoing branch you receive a final reply - and the fact that the branch fails translates into stop waiting for any more branche (this is an example of a logic on deciding how long to wait for more branches, depending on the answers you get from various devices, fix or mobile).

**Related:**

- `t_wait_for_new_branches()`

**Example.** .

```opensips
t_wait_no_more_branches();
```

### `t_was_cancelled()`

Retuns true if called for an INVITE transaction that was explicitly cancelled by UAC side via a CANCEL request.

**Return codes:**

- `true` — if called for an INVITE transaction that was explicitly cancelled by UAC side via a CANCEL request

**Usable from:** ONREPLY_ROUTE, FAILURE_ROUTE

**Example.** Check if the transaction was cancelled..

```opensips
if (t_was_cancelled()) {
    log("transaction was cancelled by UAC\n");
}
```

### `t_write_req(info,fifo)`

Write via FIFO file or UNIX socket a lot of information regarding the request. Which information should be written may be control via the “tw_append” parameter.

**Parameters:**

- `info` *(string, required)* — 
- `path` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** .

```opensips
modparam("tm","tw_append","append1:Email=$avp(email);UA=$ua")
modparam("tm","tw_append","append2:body=$rb")
...
t_write_req("voicemail/append1","/tmp/appx_fifo");
```

### `t_write_unix(info,sock)`

Write via FIFO file or UNIX socket a lot of information regarding the request. Which information should be written may be control via the “tw_append” parameter.

**Parameters:**

- `info` *(string, required)* — info string
- `sock` *(string, required)* — path (string)

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** t_write_req/unix usage.

```opensips
modparam("tm","tw_append","append1:Email=$avp(email);UA=$ua")
modparam("tm","tw_append","append2:body=$rb")
...
t_write_req("voicemail/append1","/tmp/appx_fifo");
...
t_write_unix("logger/append2","/var/run/logger.sock");
```

## Exported Pseudo-Variables

### `$T_branch_idx`

the index (starting with 0 for the first branch) of the currently proccessed branch. This index makes sense only in BRANCH and REPLY routes (where the processing is per branch) and in FAILURE route (where it points to the branch with the last final reply on the transaction). In all the other types of routes, the value of this index will be NULL.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** BRANCH, REPLY, FAILURE routes
### `$T_branch_last_reply_code`

returns the last reply code received for a branch specified as parameter. If no parameter is specified, the last reply for the current branch is retrieved.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** branch specified as parameter, current branch
### `$T_fr_inv_timeout`

the timeout for the final reply to an INVITE request, after a 1XX reply was received. This variable may also be set in an onreply_route (e.g. on 180 Ringing, after 100 Trying) and still take effect. With each different request received, $T_fr_inv_timeout will initially be equal to the fr_inv_timeout parameter. "$T_fr_inv_timeout = NULL;" will reset it to fr_inv_timeout.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** INVITE request, onreply_route

**Possible values:**

- NULL
### `$T_fr_timeout`

the timeout for the final reply to the current transaction. With each different request received, $T_fr_timeout will initially be equal to the fr_timeout parameter. "$T_fr_timeout = NULL;" will reset it to fr_timeout.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** current transaction

**Possible values:**

- NULL
### `$T_id`

returns the ID of the current transaction. The ID is an opaque hexa string, unique for each transaction. If there is no current transaction, NULL value is returned.

- **Type:** string
- **Read/write:** read-only
- **Scope:** current transaction
### `$T_reply_code`

the code of the reply, as follows: in request_route will be the last stateful sent reply; in reply_route will be the current processed reply; in failure_route will be the negative winning reply. In case of no-reply or error, '0' value is returned.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** request_route, reply_route, failure_route

**Possible values:**

- 0
### `$T_ruri`

the ruri of the current branch; this information is taken from the transaction structure, so you can access this information for any sip message (request/reply) that has a transaction.

- **Type:** string
- **Read/write:** read-only
- **Scope:** any sip message (request/reply) that has a transaction
### `$bavp(name)`

a particular type of avp that can have different values for each branch. They can only be used in BRANCH, REPLY and FAILURE routes. Otherwise NULL value is returned.

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, REPLY and FAILURE routes
### `$tm.branch.attr`

similar to $tm.branch.uri, but gives read/write access to the attributed attached to the branch. An attribute can have whatever name (no need to be pre-defined) and it can have a single value (at a time), string or integer.

- **Type:** string, integer
- **Read/write:** read-write
- **Scope:** BRANCH, ONREPLY and FAILURE routes
### `$tm.branch.duri`

100% similar to $tm.branch.uri, but returning the Detination-URI value of the branch.

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes
### `$tm.branch.flag`

similar to $tm.branch.uri, but gives read/write access to a single branch flag (by its name). The flags operated here are the same as the bflags you can operated with via the "[re]setbflag()" functions.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** BRANCH, ONREPLY and FAILURE routes

**Possible values:**

- 0
- 1
### `$tm.branch.flags`

100% similar to $tm.branch.uri, but returning the list (comma separated) of per-branch flags which are set for the branch.

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes
### `$tm.branch.last_received`

100% similar to $tm.branch.uri, but returning the reply code of the last received reply (from the network) on this branch. NULL is returned in no reply was received so far.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes
### `$tm.branch.path`

100% similar to $tm.branch.uri, but returning the PATH value of the branch.

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes
### `$tm.branch.q`

100% similar to $tm.branch.uri, but returning the Q value of the branch.

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes
### `$tm.branch.socket`

100% similar to $tm.branch.uri, but returning the socket description (proto:ip:port) used for sending the branch out.

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes
### `$tm.branch.type`

100% similar to $tm.branch.uri, but returning the type of the current branch. This may be "phone" if it not a real branch (has no SIP signalling, used by waiting for branch injection) or "sip" (a real signalling branch).

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes

**Possible values:**

- phone
- sip
### `$tm.branch.uri`

gives read-only access over the Request URI (as string) of a TM existing branch. The status of the branch (completed, ongoing, etc) is not relevant. The TM (UAC side) branches are created when the request is sent to new destinations via "t_relay()" or "t_inject()". The indexing of the branches starts from 0, giving access to all branches (past and active) of the transaction. Nevertheless the indexing supports two optional suffixes, to simplify the scripting: * /active - the indexing starts also from 0, but it is relative to the last set of branches - the parallel branches created by the last "t_relay()"-ing. * /all - similar to "no suffix" case, meaning it is an absolute index, covering all the branches of the trasactions (resulted from all "t_relay()"s performed over the transaction). IF no index is specified, the current branch used. This depends on the scripting context. Like in reply route, the current branch is the branch the reply came for; in branch route, the current branch is the branch to be sent out; in failure route, the current branch is the winning branch. NOTES: * The index ALL ( "*" ) is not supported; * In branch route, only the "$tm.branch.attr" and "$tm.branch.flag" variables work for the current branch (the rest of the branch related variables will return NULL) * Negative values are accepted, meaning indexing from the end ( -1 is the latest/higher branch)

- **Type:** string
- **Read/write:** read-only
- **Scope:** BRANCH, ONREPLY and FAILURE routes

## Exported MI Functions

### `t_hash`

Gets information about the load of TM internal hash table.

**Example.** MI FIFO Command Format

```bash
opensips-cli -x mi t_hash
```

### `t_reply`

Generates and sends a reply for an existing inbound SIP transaction.

**Parameters:**

- `body` *(string, optional)* — reply body (if present, requires the “Content-Type” and “Content-length” headers)
- `code` *(integer, required)* — reply code
- `new_headers` *(string, optional)* — extra headers to be appended to the reply.
- `reason` *(string, required)* — reason phrase.
- `to_tag` *(string, required)* — To tag to be added to TO header
- `trans_id` *(string, required)* — transaction identifier (has the hash_entry:label format)

**Example.** MI FIFO Command Format

```bash
opensips-cli -x mi t_reply 403 Forbidden 46961:1279687637 abcde .
```

### `t_uac_cancel`

Generates and sends a CANCEL for an existing SIP request.

**Parameters:**

- `callid` *(string, required)* — callid of the INVITE request to be cancelled.
- `cseq` *(string, required)* — cseq of the INVITE request to be cancelled.

**Example.** MI FIFO Command Format

```bash
opensips-cli -x mi t_uac_cancel "1-23454@127.0.0.1" "1 INVITE"
```

### `t_uac_dlg`

Generates and sends a local SIP request.

**Parameters:**

- `body` *(string, optional)* — request body (if present, requires the “Content-Type” and “Content-length” headers)
- `headers` *(string, required)* — set of additional headers to be added to the request; at least “From” and “To” headers must be specified)
- `method` *(string, required)* — request method
- `next_hop` *(string, optional)* — next hop SIP URI (OBP).
- `ruri` *(string, required)* — request SIP URI
- `socket` *(string, optional)* — local socket to be used for sending the request.

**Example.** MI FIFO Command Format

```bash
opensips-cli -x mi t_uac_dlg method=INVITE ruri="sip:alice@127.0.0.1:7050" headers="From: sip:bobster@127.0.0.1:1337\r\nTo: sip:alice@127.0.0.1:7050\r\nContact: sip:bobster@127.0.0.1:1337\r\n"
```

## Exported Statistics

### `2xx_transactions`

Total number of transactions completed with 2xx replies.

- **Type:** counter
### `3xx_transactions`

Total number of transactions completed with 3xx replies.

- **Type:** counter
### `4xx_transactions`

Total number of transactions completed with 4xx replies.

- **Type:** counter
### `5xx_transactions`

Total number of transactions completed with 5xx replies.

- **Type:** counter
### `6xx_transactions`

Total number of transactions completed with 6xx replies.

- **Type:** counter
### `UAC_transactions`

Total number of transactions created by local generated requests.

- **Type:** counter
### `UAS_transactions`

Total number of transactions created by received requests.

- **Type:** counter
### `inuse_transactions`

Number of transactions existing in memory at current time.

- **Type:** gauge
### `local_replies`

Total number of replies local generated by TM module.

- **Type:** counter
### `received_replies`

Total number of total replies received by TM module.

- **Type:** counter
### `relayed_replies`

Total number of replies received and relayed by TM module.

- **Type:** counter
### `retransmission_req_T1_1`

Number of request retransmissions due to T1 1 timer, the first retransmission interval (typical 500ms).

- **Type:** counter
### `retransmission_req_T1_2`

Number of request retransmissions due to T1 2 timer, the second retransmission interval (typical 1s).

- **Type:** counter
### `retransmission_req_T1_3`

Number of request retransmissions due to T1 3 timer, the third retransmission interval (typical 2s).

- **Type:** counter
### `retransmission_req_T2`

Number of request retransmissions due to T2 , the final retransmission interval (typical 4s).

- **Type:** counter
### `retransmission_rpl_T2`

Number of reply retransmissions, all done with the same retransmission interval T2, typical 4s.

- **Type:** counter
### `timeout_finalresponse`

Number of transactional timeouts without receiving any kind of reply (not even provisional) from the B side. Such timeouts indicate a communication / reachability issue. Note: a single transaction may count multiple such timeouts due forking.

- **Type:** counter
### `timeout_finalresponse`

Number of transactional INVITE timeouts without receiving a FINAL reply (provisional may be received) from the B side. Such timeouts indicate a "not answer" event and it is not a signalling issue. Note: a single transaction may count multiple such timeouts due forking.

- **Type:** counter

## Configuration Examples

### Set `fr_timeout` parameter

Set `fr_timeout` parameter

```opensips
...
modparam("tm", "fr\_timeout", 10)
...
```
### Set `fr_inv_timeout` parameter

Set `fr_inv_timeout` parameter

```opensips
...
modparam("tm", "fr\_inv\_timeout", 200)
...
```
### Set `wt_timer` parameter

Set `wt_timer` parameter

```opensips
...
modparam("tm", "wt\_timer", 10)
...
```
### Set `delete_timer` parameter

Set `delete_timer` parameter

```opensips
...
modparam("tm", "delete\_timer", 5)
...
```
### Set `T1_timer` parameter

Set `T1_timer` parameter

```opensips
...
modparam("tm", "T1\_timer", 700)
...
```
### Set `T2_timer` parameter

Set `T2_timer` parameter

```opensips
...
modparam("tm", "T2\_timer", 8000)
...
```
### Set `ruri_matching` parameter

Set `ruri_matching` parameter

```opensips
...
modparam("tm", "ruri\_matching", 0)
...
```
### Set `via1_matching` parameter

Set `via1_matching` parameter

```opensips
...
modparam("tm", "via1\_matching", 0)
...
```
### Set `unix_tx_timeout` parameter

Set `unix_tx_timeout` parameter

```opensips
...
modparam("tm", "unix\_tx\_timeout", 5)
...
```
### Set `restart_fr_on_each_reply` parameter

Set `restart_fr_on_each_reply` parameter

```opensips
...
modparam("tm", "restart\_fr\_on\_each\_reply", 0)
...
```
### Set `tw_append` parameter

Set `tw_append` parameter

```opensips
...
modparam("tm", "tw\_append",
   "test: ua=$hdr(User-Agent) ;avp=$avp(avp);$rb;time=$Ts")
...
```
### Set `pass_provisional_replies` parameter

Set `pass_provisional_replies` parameter

```opensips
...
modparam("tm", "pass\_provisional\_replies", 1)
...
```
### Set `syn_branch` parameter

Set `syn_branch` parameter

```opensips
...
modparam("tm", "syn\_branch", 0)
...
```
### Set `onreply_avp_mode` parameter

Set `onreply_avp_mode` parameter

```opensips
...
modparam("tm", "onreply\_avp\_mode", 1)
...
```
### Set `disable_6xx_block` parameter

Set `disable_6xx_block` parameter

```opensips
...
modparam("tm", "disable\_6xx\_block", 1)
...
```
### Set `enable_stats` parameter

Set `enable_stats` parameter

```opensips
...
modparam("tm", "enable\_stats", 0)
...
```
### Set `minor_branch_flag` parameter

Set `minor_branch_flag` parameter

```opensips
...
modparam("tm", "minor\_branch\_flag", "MINOR\_BFLAG")
...
```
### Set `timer_partitions` parameter

Set `timer_partitions` parameter

```opensips
...
# Enable two timer partitions
modparam("tm", "timer\_partitions", 2)
...
```
### Set `auto_100trying` parameter

Set `auto_100trying` parameter

```opensips
...
# Disable automatic 100 Trying
modparam("tm", "auto\_100trying", 0)
...
```
### Set `tm_replication_cluster` parameter

Set `tm_replication_cluster` parameter

```opensips
...
# replicate anycast messages in cluster 1
modparam("tm", "tm\_replication\_cluster", 1)
...
```
### Set the `cluster_param` parameter

Set the `cluster_param` parameter

```opensips
...
modparam("tm", "cluster\_param", "tid")
...
```
### Set the `cluster_auto_cancel` parameter

Set the `cluster_auto_cancel` parameter

```opensips
...
# disable auto-cancel handling
modparam("tm", "cluster\_auto\_cancel", no)
...
```
### Set the `local_request_route` parameter

Set the `local_request_route` parameter

```opensips
...
# Execute the route "local\_request\_route" upon sending a request
modparam("tm", "local\_request\_route", "tm\_local\_request")

route[tm\_local\_request] {
	if (is\_method("INVITE") && $rb(application/sdp) && !has\_totag()) {
		$avp(sdp\_request) := $rb(application/sdp);
	}
}
...
```
### Set the `local_reply_route` parameter

Set the `local_reply_route` parameter

```opensips
...
# Execute the route "tm\_local\_reply" upon sending a request
modparam("tm", "local\_reply\_route", "tm\_local\_reply")

route[tm\_local\_reply] {
	if (is\_method("BYE")) {
		$var(rc) = rest\_get("http://localhost/qos/delete",
				$var(recv\_body), $var(recv\_ct), $var(rcode));
	}
}

...
```
### `t_relay` usage

`t_relay` usage

```opensips
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
```
### `t_reply` usage

`t_reply` usage

```opensips
...
t\_reply(404, "Use $rU not found");
...
```
### `t_reply_with_body` usage

`t_reply_with_body` usage

```opensips
...
	if(is\_method("INVITE"))
	{
		append\_to\_reply("Contact: $var(contact)\\r\\n"
				"Content-Type: application/sdp\\r\\n");
		t\_reply\_with\_body(200, "Ok", $var(body));
		exit;
	}
...
```
### `t_newtran` usage

`t_newtran` usage

```opensips
...
t\_newtran();  # 100 Trying is fired here
xlog("doing my complicated routing logic\\n");
....
t\_relay(); # send the call further
...
```
### `t_check_trans` usage

`t_check_trans` usage

```opensips
...
if ( is\_method("CANCEL") ) {
	if ( t\_check\_trans() )
		t\_relay();
	exit;
}
...
```
### `t_check_status` usage

`t_check_status` usage

```opensips
...
if (t\_check\_status("(487)|(408)")) {
    log("487 or 408 negative reply\\n");
}
...
```
### `t_local_replied` usage

`t_local_replied` usage

```opensips
...
if (t\_local\_replied("all")) {
	log ("no reply received\\n");
}
...
```
### `t_was_cancelled` usage

`t_was_cancelled` usage

```opensips
...
if (t\_was\_cancelled()) {
    log("transaction was cancelled by UAC\\n");
}
...
```
### `t_cancel_branch` usage

`t_cancel_branch` usage

```opensips
...
onreply\_route[3] {
...
	if (t\_check\_status(183)) {
		# no support for early media
		t\_cancel\_branch();
	}
...
}
```
### `t_new_request` usage

`t_new_request` usage

```opensips
...
	# send a MESSAGE request
	t\_new\_request("MESSAGE","sip:alice@192.168.2.2","BOB sip:userB@mydomain.net","ALICE sip:userA@mydomain.net","text/plain Hello Alice!")) {
...
```
### `t_on_failure` usage

`t_on_failure` usage

```opensips
...
route { 
	t\_on\_failure("1"); 
	t\_relay();
} 

failure\_route[1] {
	seturi("sip:user@voicemail");
	t\_relay();
}
...
```
### `t_on_reply` usage

`t_on_reply` usage

```opensips
...
route {
	seturi("sip:bob@opensips.org");  # first branch
	append\_branch("sip:alice@opensips.org"); # second branch

	t\_on\_reply("global"); # the "global" reply route 
	                      # is set the whole transaction
	t\_on\_branch("1");

	t\_relay();
}

branch\_route[1] {
	if ($rU=="alice")
		t\_on\_reply("alice"); # the "alice" reply route
		                      # is set only for second branch
}

onreply\_route[alice] {
	xlog("received reply from alice\\n");
}

onreply\_route[global] {
	if (t\_check\_status("1\[0-9\]\[0-9\]")) {
		setflag(LOG\_FLAG);
		log("provisional reply received\\n");
		if (t\_check\_status("183"))
			drop;
	}
}
...
```
### `t_on_branch` usage

`t_on_branch` usage

```opensips
...
route { 
	t\_on\_branch("1"); 
	t\_relay();
} 

branch\_route[1] {
	if ($ru=~"bad\_uri") {
		xlog("dropping branch $ru \\n");
		drop;
	}
	if ($ru=~"GW\_uri") {
		append\_rpid();
	}
}
...
```
### `t_inject_branches` usage

`t_inject_branches` usage

```opensips
...
route[event\_notification] {
	t\_inject\_branches("event");
}
...
```
### `t_wait_for_new_branches` usage

`t_wait_for_new_branches` usage

```opensips
...
t\_newtran();
t\_wait\_for\_new\_branches();
t\_relay();
...
```
### `t_wait_no_more_branches` usage

`t_wait_no_more_branches` usage

```opensips
...
t\_wait\_no\_more\_branches();
...
```
### `t_add_hdrs` usage

`t_add_hdrs` usage

```opensips
...
t\_add\_hdrs("X-origin: 1.1.1.1\\r\\n");
...
```
### `t_add_cancel_reason` usage

`t_add_cancel_reason` usage

```opensips
...
t\_add\_cancel\_reason("Reason: SIP ;cause=200 ;text=\"Call completed elsewhere\"\\r\\n");
t\_relay();
...
```
### `t_replicate` usage

`t_replicate` usage

```opensips
...
t\_replicate("sip:1.2.3.4:5060");
t\_replicate("sip:1.2.3.4:5060;transport=tcp");
t\_replicate("sip:1.2.3.4",0x4);
...
```
### `t_write_req/unix` usage

`t_write_req/unix` usage

```opensips
...
modparam("tm","tw\_append","append1:Email=$avp(email);UA=$ua")
modparam("tm","tw\_append","append2:body=$rb")
...
t\_write\_req("voicemail/append1","/tmp/appx\_fifo");
...
t\_write\_unix("logger/append2","/var/run/logger.sock");
...
```
### `t_flush_flags` usage

`t_flush_flags` usage

```opensips
...
t\_flush\_flags();
...
```
### `t_anycast_replicate` usage

`t_anycast_replicate` usage

```opensips
...
if (is\_method("ACK|CANCEL") && !t\_check\_trans()) {
	t\_anycast\_replicate();
	exit;
}
...
```
### `t_reply_by_callid` usage

`t_reply_by_callid` usage

```opensips
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
```
### `t_get_branch_idx_by_attr` usage

`t_get_branch_idx_by_attr` usage

```opensips
...
	# search for a branch which has the "name" attribute
	# with string value "pstn"
	if (t\_get\_branch\_idx\_by\_attr("name", "pstn", , $var(idx))) {
		xlog("found branch has index $var(idx)\\n");
	}
...
```
