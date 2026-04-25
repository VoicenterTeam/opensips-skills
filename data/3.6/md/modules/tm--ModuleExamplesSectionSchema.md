# tm Module

---

**List of Tables**

4.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6600080)

4.2. [Most recently active contributors(1) to this module](#idp6718432)

**List of Examples**

1.1. [Set `fr_timeout` parameter](#idp5611008)

1.2. [Set `fr_inv_timeout` parameter](#idp5616368)

1.3. [Set `wt_timer` parameter](#idp5621792)

1.4. [Set `delete_timer` parameter](#idp5626352)

1.5. [Set `T1_timer` parameter](#idp5630784)

1.6. [Set `T2_timer` parameter](#idp5635216)

1.7. [Set `ruri_matching` parameter](#idp5639920)

1.8. [Set `via1_matching` parameter](#idp5644640)

1.9. [Set `unix_tx_timeout` parameter](#idp5649072)

1.10. [Set `restart_fr_on_each_reply` parameter](#idp5654336)

1.11. [Set `tw_append` parameter](#idp5662256)

1.12. [Set `pass_provisional_replies` parameter](#idp5666896)

1.13. [Set `syn_branch` parameter](#idp5671472)

1.14. [Set `onreply_avp_mode` parameter](#idp5679136)

1.15. [Set `disable_6xx_block` parameter](#idp5686112)

1.16. [Set `enable_stats` parameter](#idp5690736)

1.17. [Set `minor_branch_flag` parameter](#idp5696576)

1.18. [Set `timer_partitions` parameter](#idp5701632)

1.19. [Set `auto_100trying` parameter](#idp5706848)

1.20. [Set `tm_replication_cluster` parameter](#idp5712400)

1.21. [Set the `cluster_param` parameter](#idp5718416)

1.22. [Set the `cluster_auto_cancel` parameter](#idp5725296)

1.23. [Set the `local_request_route` parameter](#idp5731840)

1.24. [Set the `local_reply_route` parameter](#idp5737648)

1.25. [`t_relay` usage](#idp5762832)

1.26. [`t_reply` usage](#idp5771232)

1.27. [`t_reply_with_body` usage](#idp5780512)

1.28. [`t_newtran` usage](#idp5786656)

1.29. [`t_check_trans` usage](#idp5796848)

1.30. [`t_check_status` usage](#idp5805584)

1.31. [`t_local_replied` usage](#idp5811616)

1.32. [`t_was_cancelled` usage](#idp5816432)

1.33. [`t_cancel_branch` usage](#idp5826640)

1.34. [`t_new_request` usage](#idp5838528)

1.35. [`t_on_failure` usage](#idp5847600)

1.36. [`t_on_reply` usage](#idp5857440)

1.37. [`t_on_branch` usage](#idp5866432)

1.38. [`t_inject_branches` usage](#idp5881424)

1.39. [`t_wait_for_new_branches` usage](#idp5890048)

1.40. [`t_wait_no_more_branches` usage](#idp5895808)

1.41. [`t_add_hdrs` usage](#idp5901808)

1.42. [`t_add_cancel_reason` usage](#idp5908080)

1.43. [`t_replicate` usage](#idp5916896)

1.44. [`t_write_req/unix` usage](#idp5925392)

1.45. [`t_flush_flags` usage](#idp5930464)

1.46. [`t_anycast_replicate` usage](#idp5936000)

1.47. [`t_reply_by_callid` usage](#idp5942688)

1.48. [`t_get_branch_idx_by_attr` usage](#idp5949376)

## Chapter�1.�Admin Guide

## 1.1.�Overview

TM module enables stateful processing of SIP transactions. The main use of stateful logic, which is costly in terms of memory and CPU, is some services inherently need state. For example, transaction-based accounting (module acc) needs to process transaction state as opposed to individual messages, and any kinds of forking must be implemented statefully. Other use of stateful processing is it trading CPU caused by retransmission processing for memory. That makes however only sense if CPU consumption per request is huge. For example, if you want to avoid costly DNS resolution for every retransmission of a request to an unresolvable destination, use stateful mode. Then, only the initial message burdens server by DNS queries, subsequent retransmissions will be dropped and will not result in more processes blocked by DNS resolution. The price is more memory consumption and higher processing latency.

From user's perspective, the major function is t\_relay(). It setup transaction state, absorb retransmissions from upstream, generate downstream retransmissions and correlate replies to requests.

In general, if TM is used, it copies clones of received SIP messages in shared memory. That costs the memory and also CPU time (memcpys, lookups, shmem locks, etc.) Note that non-TM functions operate over the received message in private memory, that means that any core operations will have no effect on statefully processed messages after creating the transactional state. For example, calling record\_route _after_ t\_relay is pretty useless, as the RR is added to privately held message whereas its TM clone is being forwarded.

TM is quite big and uneasy to program--lot of mutexes, shared memory access, malloc and free, timers--you really need to be careful when you do anything. To simplify TM programming, there is the instrument of callbacks. The callback mechanisms allow programmers to register their functions to specific event. See t\_hooks.h for a list of possible events.

Other things programmers may want to know is UAC--it is a very simplistic code which allows you to generate your own transactions. Particularly useful for things like NOTIFYs or IM gateways. The UAC takes care of all the transaction machinery: retransmissions , FR timeouts, forking, etc. See t\_uac prototype in uac.h for more details. Who wants to see the transaction result may register for a callback.

### 1.1.1.�Per-Branch flags

First what is the idea with the branch concept: branch route is a route to be execute separately for each branch before being sent out - changes in that route should reflect only on that branch.

There are several types of flags in OpenSIPS :

*   _message/transaction_ flags - they are visible everywhere in the transaction (in all routes and in all sequential replies/request).
    
*   _branch_ flags - flags that are visible only from a specific branch - in all replies and routes connected to this branch.
    
*   _script_ flags - flags that exist only during script execution. They are not store anywhere and are lost once the top level route was left.
    

For example: I have a call parallel forking to GW and to a user. And I would like to know from which branch I will get the final negative reply (if so). I will set a branch route before relaying the calls (with the 2 branches). The branch route will be separately executed for each branch; in the branch going to GW (I can identified it by looking to RURI), I will set a branch flag. This flag will appear only in the onreply route run for replied from GW. It will be also be visible in failure route if the final elected reply belongs to the GW branch. This flags will not be visible in the other branch (in routes executing replies from the other branch).

For how to define branch flags and use via script, see [t\_on\_branch()](#func_t_on_branch "1.4.13.� t_on_branch(branch_route)") and the setbflag(), resetbflag() and isbflagset() script functions.

Also, modules may set branch flags before transaction creation (for the moment this feature is not available in script). The REGISTRAR module was the first to use this type of flags. The NAT flag is pushed in branch flags instead in message flags

### 1.1.2.�Timeout-Based Failover

Timeouts can be used to trigger failover behavior. E.g. if we send a call to a gateway and the gateway does not send a provisional response within 3 seconds, we want to cancel this call and send the call to another gateway. Another example is to ring a SIP client only for 30 seconds and then redirect the call to the voicemail.

The transaction module exports two types of timeouts:

*   **[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")** - used when no response was received yet. If there is no response after _[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")_ seconds, the timer triggers (and failure route will be executed if t\_on\_failure() was called). For INVITE transactions, if a provisional response was received, the timeout is reset to _[fr\_inv\_timeout](#param_fr_inv_timeout "1.3.2.�fr_inv_timeout (integer)")_ seconds and RT\_T2 for all other transactions. Once a final response is received, the transaction has finished.
    
*   **fr\_inv\_timeout** - this timeout starts counting down once a provisional response was received for an INVITE transaction.
    

For example: You want to have failover if there is no provisional response after 3 seconds, but you want to ring for 60 seconds. Thus, set the _[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")_ to 3 and _fr\_inv\_timeout_ to 60.

### 1.1.3.�DNS Failover

DNS based failover can be use when relaying stateful requests. According to RFC 3263, DNS failover should be done on transport level or transaction level. TM module supports them both.

Failover at transport level may be triggered by a failure of sending out the request message. A failure occurs if the corresponding interface was found for sending the request, if the TCP connection was refused or if a generic internal error happened during send. There is no ICMP error report support.

Failover at transaction level may be triggered when the transaction completed either with a 503 reply, either with a timeout without any received reply. In such a case, automatically, a new branch will be forked if any other destination IPs can be used to deliver the requests. The new branch will be a clone of the winning branch.

The set of destinations IPs is step-by-step build (on demand) based on the NAPTR, SRV and A records available for the destination domain.

DNS-based failover is by default applied excepting when this failover is globally disabled (see the core parameter disable\_dns\_failover) or when the relay flag (per transaction) is set (see the t\_relay() function).

### 1.1.4.�Anycast Scenario

Doing a load balancing scenario using [Anycast IPs](https://en.wikipedia.org/wiki/Anycast), one might run into an issue where a transaction request comes on one instance, and the reply (or replies) comes on different ones. This would normaly break the transaction state, because the local transaction will start re-transmissios and would eventually timeout. Moreover, from UA's perspective, the reply whould have been sent, but since it reaches a proxy that is not aware of that transaction, it will not be forwarded (nor ACKed in case of INVITES). And from this point things can escalade quickly.

To sort out these problems, the module uses a distributed mechanism to figure out where the transaction for a specific reply was created. When an instance receives a reply that does not have an associated transaction, it replicates it to be handled by the instance that “owns” it. This is achieved using the _clusterer_ module support.

Setting up an anycast scenario is very simple: all the instances that are part of an anycast secnario must be set up in a cluster (more info at the [tm\_replication\_cluster](#param_tm_replication_cluster "1.3.20.�tm_replication_cluster (integer)") param). When a transaction is created, a special identifier is appended to the branch parameter, namely the instance that created the transaction. When a reply comes in, the transaction module checks who “owns” the transaction. If the identifier is the instance's own id, then the reply is processed locally. Otherwise it is replicated to the node indicated by the id. Replication is done in a very efficient manner, using the _proto\_bin_ transport.

Special handling is applied to _CANCEL_ and _ACK_ methods. Due to the fact that these methods do not contain the special identifier in the branch parameter (since they are generated by the UAC and not by us), there is no way to determine who “owns” the transaction. Therefore, if we do not find a local transaction for these requests, we broadcast them to all the other instances using the [t\_anycast\_replicate()](#func_t_anycast_replicate "1.4.22.� t_anycast_replicate()") function. Again, this is done in a very efficient manner using the _proto\_bin_ transport.

### 1.1.5.�Usage Scope

Transaction functions and variables are only designed to be called on SIP request messages where a transaction can be created, or in routes that are transaction aware, such as _branch\_route\[name\]_, _failure\_route\[name\]_ or _onreply\_route\[name\]_. Using TM functtions or variables in a route that is not transaction aware, such as the generic _onreply\_route_, _error\_route_ or _timer\_route\[name, timer\]_ may lead to undefined behavior, and most of the time in bogus or malformed signalling. Therefore it is strongly recommended to avoid using them in non-tm context aware routes.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _clusterer_ module, if the anycast scenario is enabled (see [tm\_replication\_cluster](#param_tm_replication_cluster "1.3.20.�tm_replication_cluster (integer)") param for more information).
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`fr_timeout` (integer)

Timeout which is triggered if no final reply for a request or ACK for a negative INVITE reply arrives (in seconds).

_Default value is 30 seconds._

**Example�1.1.�Set `fr_timeout` parameter**

...
modparam("tm", "fr\_timeout", 10)
...

  

### 1.3.2.�`fr_inv_timeout` (integer)

Timeout which is triggered if no final reply for an INVITE arrives after a provisional message was received (in seconds). This timeout starts counting down once the first provisional response is received. Thus, fast failover (no 100 trying from gateway) can be achieved by setting _[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")_ to low values. See example below.

_Default value is 120 seconds._

**Example�1.2.�Set `fr_inv_timeout` parameter**

...
modparam("tm", "fr\_inv\_timeout", 200)
...

  

### 1.3.3.�`wt_timer` (integer)

Time for which a transaction stays in memory to absorb delayed messages after it completed; also, when this timer hits, retransmission of local cancels is stopped (a puristic but complex behavior would be not to enter wait state until local branches are finished by a final reply or FR timer--we simplified).

For non-INVITE transaction this timer relates to timer J of RFC 3261 section 17.2.2. According to the RFC this timer should be 64\*T1 (= 32 seconds). But this would increase memory usage as the transactions are kept in memory very long.

_Default value is 5 seconds._

**Example�1.3.�Set `wt_timer` parameter**

...
modparam("tm", "wt\_timer", 10)
...

  

### 1.3.4.�`delete_timer` (integer)

Time after which a to-be-deleted transaction currently ref-ed by a process will be tried to be deleted again.

_Default value is 2 seconds._

**Example�1.4.�Set `delete_timer` parameter**

...
modparam("tm", "delete\_timer", 5)
...

  

### 1.3.5.�`T1_timer` (integer)

Retransmission T1 period, in milliseconds.

_Default value is 500 milliseconds._

**Example�1.5.�Set `T1_timer` parameter**

...
modparam("tm", "T1\_timer", 700)
...

  

### 1.3.6.�`T2_timer` (integer)

Maximum retransmission period, in milliseconds.

_Default value is 4000 milliseconds._

**Example�1.6.�Set `T2_timer` parameter**

...
modparam("tm", "T2\_timer", 8000)
...

  

### 1.3.7.�`ruri_matching` (integer)

Should be request-uri matching used as a part of pre-3261 transaction matching as the standard wants us to do so? Turn only off for better interaction with devices that are broken and send different r-uri in CANCEL/ACK than in original INVITE.

_Default value is 1 (true)._

**Example�1.7.�Set `ruri_matching` parameter**

...
modparam("tm", "ruri\_matching", 0)
...

  

### 1.3.8.�`via1_matching` (integer)

Should be top most VIA matching used as a part of pre-3261 transaction matching as the standard wants us to do so? Turn only off for better interaction with devices that are broken and send different top most VIA in CANCEL/ACK than in original INVITE.

_Default value is 1 (true)._

**Example�1.8.�Set `via1_matching` parameter**

...
modparam("tm", "via1\_matching", 0)
...

  

### 1.3.9.�`unix_tx_timeout` (integer)

Send timeout to be used by function which use UNIX sockets (as t\_write\_unix).

_Default value is 2 seconds._

**Example�1.9.�Set `unix_tx_timeout` parameter**

...
modparam("tm", "unix\_tx\_timeout", 5)
...

  

### 1.3.10.�`restart_fr_on_each_reply` (integer)

If true (non null value), the final response timer will be re-triggered for each received provisional reply. In this case, final response timeout may occur after a time longer than _[fr\_inv\_timeout](#param_fr_inv_timeout "1.3.2.�fr_inv_timeout (integer)")_ (if UAS keeps sending provisional replies)

_Default value is 1 (true)._

**Example�1.10.�Set `restart_fr_on_each_reply` parameter**

...
modparam("tm", "restart\_fr\_on\_each\_reply", 0)
...

  

### 1.3.11.�`tw_append` (string)

List of additional information to be appended by t\_write\_req and t\_write\_unix functions.

_Default value is null string._

Syntax of the parameter is:

*   _tw\_append = append\_name':' element (';'element)\*_
    
*   _element = ( \[name '='\] variable)_
    

Each element will be appended per line in “name: value” format. Element “$rb (message body)” is the only one which does not accept name; the body it will be printed all the time at the end, disregarding its position in the definition string.

**Example�1.11.�Set `tw_append` parameter**

...
modparam("tm", "tw\_append",
   "test: ua=$hdr(User-Agent) ;avp=$avp(avp);$rb;time=$Ts")
...

  

### 1.3.12.�`pass_provisional_replies` (integer)

Enable/disable passing of provisional replies to FIFO applications.

_Default value is 0._

**Example�1.12.�Set `pass_provisional_replies` parameter**

...
modparam("tm", "pass\_provisional\_replies", 1)
...

  

### 1.3.13.�`syn_branch` (integer)

Enable/disable the usage of stateful synonym branch IDs in the generated Via headers. They are faster but not reboot-safe.

_Default value is 1 (use synonym branches)._

**Example�1.13.�Set `syn_branch` parameter**

...
modparam("tm", "syn\_branch", 0)
...

  

### 1.3.14.�`onreply_avp_mode` (integer)

Describes how the AVPs should be handled in reply route:

*   _0_ - the AVPs will be per message only; they will not interfere with the AVPS stored in transaction; initially there will be an empty list and at the end of the route, all AVPs that were created will be discarded.
    
*   _1_ - the AVPs will be the transaction AVPs; initially the transaction AVPs will be visible; at the end of the route, the list will attached back to transaction (with all the changes)
    

In mode 1, you can see the AVPs you set in request route, branch route or failure route. The side effect is performance as more locking is required in order to keep the AVP's list integrity.

_Default value is 0._

**Example�1.14.�Set `onreply_avp_mode` parameter**

...
modparam("tm", "onreply\_avp\_mode", 1)
...

  

### 1.3.15.�`disable_6xx_block` (integer)

Tells how the 6xx replies should be internally handled:

*   _0_ - the 6xx replies will block any further serial forking (adding new branches). This is the RFC3261 behaviour.
    
*   _1_ - the 6xx replies will be handled as any other negative reply - serial forking will be allowed. Logically, you need to break RFC3261 if you want to do redirects to announcement and voicemail services.
    

_Default value is 0._

**Example�1.15.�Set `disable_6xx_block` parameter**

...
modparam("tm", "disable\_6xx\_block", 1)
...

  

### 1.3.16.�`enable_stats` (integer)

Enables statistics support in TM module - If enabled, the TM module will internally keep several statistics and export them via the MI - Management Interface.

_Default value is 1 (enabled)._

**Example�1.16.�Set `enable_stats` parameter**

...
modparam("tm", "enable\_stats", 0)
...

  

### 1.3.17.�`minor_branch_flag` (string/integer)

A branch flag index to be used in script to mark the minor branches ( before t\_relay() ).

A minor branch is a branch OpenSIPS will not wait to complete during parallel forking. So, if the rest of the branches are negativly replied OpenSIPS will not wait for a final answer from the minor branch, but it will simply cancel it.

Main applicability of minor branch is to fork a branch to a media server for injecting (via 183 Early Media) some pre-call media - of course, this branch will be transparanent for the rest of the call branches (from branch selection point of view).

_Default value is none (disabled)._

**Example�1.17.�Set `minor_branch_flag` parameter**

...
modparam("tm", "minor\_branch\_flag", "MINOR\_BFLAG")
...

  

### 1.3.18.�`timer_partitions` (integer)

The number of partitions for the internal TM timers (retransmissions, delete, wait, etc). Partitioning the timers increase the throughput under heavly load by handling timer events in parallel, rather than all serial.

Recomanded range for timer partitions is max 16 (soft limit).

_Default value is 1 (disabled)._

**Example�1.18.�Set `timer_partitions` parameter**

...
# Enable two timer partitions
modparam("tm", "timer\_partitions", 2)
...

  

### 1.3.19.�`auto_100trying` (integer)

This parameter controls if the TM module should automatically generate an 100 Trying stateful reply when an INVITE transaction is created.

You may want to disable this behavior if you want to control from script level when the 100 Trying is to be sent out.

_Default value is 1 (enabled)._

**Example�1.19.�Set `auto_100trying` parameter**

...
# Disable automatic 100 Trying
modparam("tm", "auto\_100trying", 0)
...

  

### 1.3.20.�`tm_replication_cluster` (integer)

This parameter should be used in an anycast setup, and specifies the cluster id of all the nodes that use an anycast IP.

Check out the [tm\_anycast](#tm_anycast "1.1.4.�Anycast Scenario") section for more details.

_Anycast replication is disabled by default._

**Example�1.20.�Set `tm_replication_cluster` parameter**

...
# replicate anycast messages in cluster 1
modparam("tm", "tm\_replication\_cluster", 1)
...

  

### 1.3.21.�`cluster_param` (string)

This parameter should be used in an anycast setup, and specifies the name of the parameter used in the VIA branch param to specifiy the instance id that created the transaction.

Check out the [tm\_anycast](#tm_anycast "1.1.4.�Anycast Scenario") section for more details.

_Default value is _cid_._

**Example�1.21.�Set the `cluster_param` parameter**

...
modparam("tm", "cluster\_param", "tid")
...

  

### 1.3.22.�`cluster_auto_cancel` (boolean)

This parameter should be used in an anycast setup, and specifies whether a _CANCEL_ message received on a listener that is marked as anycast should be automatically handled, or should get in the OpenSIPS script. If this parameter is enabled (default), _CANCEL_ messages received on an anycast listener will never enter the script, thus making the script cleaner.

Check out the [tm\_anycast](#tm_anycast "1.1.4.�Anycast Scenario") section for more details.

_Default value is _yes_ (enabled)._

**Example�1.22.�Set the `cluster_auto_cancel` parameter**

...
# disable auto-cancel handling
modparam("tm", "cluster\_auto\_cancel", no)
...

  

### 1.3.23.�`local_request_route` (string)

This parameter points to a route, which is executed whenever TM is about to send out a locally generated request (e.g., through the B2B modules or through MI).

The purpose of this route is limited to exposing the content of the request as SIP message

The route is executed with the generated message by TM, incorporating all modifications.

IMPORTANT: this route is executed AFTER the local\_route (if defined) and it expose all the changes from that route.

IMPORTANT: this route is to be used in a read-only manner, inspection only. Any changes you do here will discarded.

IMPORTANT: this route does not offer any message, transactional or dialog context, so do not rely on any variables with scope (like AVPs).

**Example�1.23.�Set the `local_request_route` parameter**

...
# Execute the route "local\_request\_route" upon sending a request
modparam("tm", "local\_request\_route", "tm\_local\_request")

route\[tm\_local\_request\] {
	if (is\_method("INVITE") && $rb(application/sdp) && !has\_totag()) {
		$avp(sdp\_request) := $rb(application/sdp);
	}
}
...

  

### 1.3.24.�`local_reply_route` (string)

This parameter points to a route, which is executed whenever TM is about to send out a locally generated reply (e.g., through the B2B modules or through MI).

The purpose of this route is limited to exposing the content of the reply as SIP message

IMPORTANT: this route is to be used in a read-only manner, inspection only. Any changes you do here will discarded.

IMPORTANT: this route does not offer any message, transactional or dialog context, so do not rely on any variables with scope (like AVPs).

**Example�1.24.�Set the `local_reply_route` parameter**

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

**Example�1.25.�`t_relay` usage**

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

**Example�1.26.�`t_reply` usage**

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

**Example�1.27.�`t_reply_with_body` usage**

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

**Example�1.28.�`t_newtran` usage**

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

**Example�1.29.�`t_check_trans` usage**

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

**Example�1.30.�`t_check_status` usage**

...
if (t\_check\_status("(487)|(408)")) {
    log("487 or 408 negative reply\\n");
}
...

  

### 1.4.7.� `t_local_replied(reply)`

Returns true if all or last (depending of the parameter) reply(es) were local generated (and not received).

Parameter may be “all” or “last”.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.31.�`t_local_replied` usage**

...
if (t\_local\_replied("all")) {
	log ("no reply received\\n");
}
...

  

### 1.4.8.� `t_was_cancelled()`

Retuns true if called for an INVITE transaction that was explicitly cancelled by UAC side via a CANCEL request.

This function can be used from ONREPLY\_ROUTE, FAILURE\_ROUTE.

**Example�1.32.�`t_was_cancelled` usage**

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

**Example�1.33.�`t_cancel_branch` usage**

onreply\_route\[3\] {
...
	if (t\_check\_status(183)) {
		# no support for early media
		t\_cancel\_branch();
	}
...
}

  

### 1.4.10.� `t_new_request( method, RURI, from, to [, body[, ctx]])`

This function generates and sends out a new SIP request (in a stateful way). The new request is completly unrelated to the currently processed SIP message.

Meaning of the parameters is as follows (all do accept variables):

*   _method (string)_ - the SIP method
    
*   _RURI (string)_ - the SIP Request URI (the request will be sent out to this destination)
    
*   _from (string)_ - the SIP From hdr information as "\[display \]URI"
    
*   _to (string)_ - the SIP To hdr information as "\[display \]URI"
    
*   _body (string, optional)_ - the SIP body content starting with the content type string: "conten\_type body"
    
*   _ctx (string, optional)_ - a context string that will be added to the new transaction as an AVP with name "uac\_ctx" (it may be visible in local route)
    

**Example�1.34.�`t_new_request` usage**

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

**Example�1.35.�`t_on_failure` usage**

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

**Example�1.36.�`t_on_reply` usage**

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

**Example�1.37.�`t_on_branch` usage**

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
    

**Example�1.38.�`t_inject_branches` usage**

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
    

**Example�1.39.�`t_wait_for_new_branches` usage**

...
t\_newtran();
t\_wait\_for\_new\_branches();
t\_relay();
...

  

### 1.4.16.� `t_wait_no_more_branches()`

This function instructs the existing SIP transaction to stop wait for new any new branches to be injected. This functions should be used for a transaction that is waiting for dynamic branches, via the [t\_wait\_for\_new\_branches()](#func_t_wait_for_new_branches "1.4.15.� t_wait_for_new_branches([branches])") function.

Usage scenario: your transaction is waiting for dynamic new branches (as a reusult of Push Notification). To a point, on an ongoing branch you receive a final reply - and the fact that the branch fails translates into stop waiting for any more branche (this is an example of a logic on deciding how long to wait for more branches, depending on the answers you get from various devices, fix or mobile).

**Example�1.40.�`t_wait_no_more_branches` usage**

...
t\_wait\_no\_more\_branches();
...

  

### 1.4.17.� `t_add_hdrs("sip_hdrs")`

Attach a set of headers to the existing transaction - these headers will be appended to all requests related to the transaction (outgoing branches, local ACKS, CANCELs).

Parameters:

*   _sip\_hdrs (string)_
    

**Example�1.41.�`t_add_hdrs` usage**

...
t\_add\_hdrs("X-origin: 1.1.1.1\\r\\n");
...

  

### 1.4.18.� `t_add_cancel_reason("Reason_hdr")`

This function is used to enforce from the script level a custom "Reason" header into a CANCEL request. Normally, the Reason header is inherited form the received CANCEL (note that CANCEL propagates in a hop-by-hop manner - it is re-generated at each hop), but this function can overwrite it. It must be called before relaying the CANCEL request and its input must be a fully formated Reason header with name, body and CRLF.

Parameters:

*   _reason\_hdr (string)_
    

**Example�1.42.�`t_add_cancel_reason` usage**

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

**Example�1.43.�`t_replicate` usage**

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

**Example�1.44.�`t_write_req/unix` usage**

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

**Example�1.45.�`t_flush_flags` usage**

...
t\_flush\_flags();
...

  

### 1.4.22.� `t_anycast_replicate()`

This function is used in an anycast setup to replicate a _CANCEL_ or _ACK_ method for whom there are no local transactions found. The function broadcasts the message to all the other nodes in the cluster, but only the “owner” of the transaction will be able to handle it.

**Example�1.46.�`t_anycast_replicate` usage**

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

**Example�1.47.�`t_reply_by_callid` usage**

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

  

### 1.4.24.� `t_get_branch_idx_by_attr(attr, [val_str], [val_int], [result_var], [offset])`

This function may be used to search for the index of another branch of the current transaction. The searching is done based on the per-branch attribute - you need to provide the name of the attribute at least. Optionally you can provide a value (string or integer) for the attribute used for searching. As input, the function may take an optional branch offset (absolute value, covering all branches of the transaction) where the search should start from.

The function returns true if a branch (having the given name and value for the attribute) was found. The status of the branch (like if ongoing, completed ) is not relevant. If found, the "result\_var" variable will be populated with the branch index (as integer).

This function can be used from ONREPLY\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.48.�`t_get_branch_idx_by_attr` usage**

...
	# search for a branch which has the "name" attribute
	# with string value "pstn"
	if (t\_get\_branch\_idx\_by\_attr("name", "pstn", , $var(idx))) {
		xlog("found branch has index $var(idx)\\n");
	}
...

  

## 1.5.�Exported Pseudo-Variables

Exported variables are listed in the next sections.

### 1.5.1.�$T\_branch\_idx

_$T\_branch\_idx_ - the index (starting with 0 for the first branch) of the currently proccessed branch. This index makes sense only in BRANCH and REPLY routes (where the processing is per branch) and in FAILURE route (where it points to the branch with the last final reply on the transaction). In all the other types of routes, the value of this index will be NULL.

### 1.5.2.�$T\_reply\_code

_$T\_reply\_code_ - the code of the reply, as follows: in request\_route will be the last stateful sent reply; in reply\_route will be the current processed reply; in failure\_route will be the negative winning reply. In case of no-reply or error, '0' value is returned.

### 1.5.3.�$T\_fr\_timeout

_$T\_fr\_timeout (R/W)_ - the timeout for the final reply to the current transaction

With each different request received, _$T\_fr\_timeout_ will initially be equal to the **[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")** parameter.

_"$T\_fr\_timeout = NULL;"_ will reset it to **[fr\_timeout](#param_fr_timeout "1.3.1.�fr_timeout (integer)")**.

### 1.5.4.�$T\_fr\_inv\_timeout

_$T\_fr\_inv\_timeout (R/W)_ - the timeout for the final reply to an INVITE request, after a 1XX reply was received. This variable may also be set in an onreply\_route (e.g. on 180 Ringing, after 100 Trying) and still take effect.

With each different request received, _$T\_fr\_inv\_timeout_ will initially be equal to the **[fr\_inv\_timeout](#param_fr_inv_timeout "1.3.2.�fr_inv_timeout (integer)")** parameter.

_"$T\_fr\_inv\_timeout = NULL;"_ will reset it to **[fr\_inv\_timeout](#param_fr_inv_timeout "1.3.2.�fr_inv_timeout (integer)")**.

### 1.5.5.�$T\_ruri

_$T\_ruri_ - the ruri of the current branch; this information is taken from the transaction structure, so you can access this information for any sip message (request/reply) that has a transaction.

### 1.5.6.�$bavp(name)

_$bavp(name)_ - a particular type of avp that can have different values for each branch. They can only be used in BRANCH, REPLY and FAILURE routes. Otherwise NULL value is returned.

### 1.5.7.�$T\_id

_$T\_id_ - returns the ID of the current transaction. The ID is an opaque hexa string, unique for each transaction. If there is no current transaction, NULL value is returned.

### 1.5.8.�$T\_branch\_last\_reply\_code

_$T\_branch\_last\_reply\_code_ - returns the last reply code received for a branch specified as parameter. If no parameter is specified, the last reply for the current branch is retrieved.

### 1.5.9.�$tm.branch.uri\[\]

_$tm.branch.uri_ - gives read-only access over the Request URI (as string) of a TM existing branch. The status of the branch (completed, ongoing, etc) is not relevant.

The TM (UAC side) branches are created when the request is sent to new destinations via "t\_relay()" or "t\_inject()".

The indexing of the branches starts from 0, giving access to all branches (past and active) of the transaction. Nevertheless the indexing supports two optional suffixes, to simplify the scripting:

*   _/active_ - the indexing starts also from 0, but it is relative to the last set of branches - the parallel branches created by the last "t\_relay()"-ing.
    
*   _/all_ - similar to "no suffix" case, meaning it is an absolute index, covering all the branches of the trasactions (resulted from all "t\_relay()"s performed over the transaction).
    

IF no index is specified, the current branch used. This depends on the scripting context. Like in reply route, the current branch is the branch the reply came for; in branch route, the current branch is the branch to be sent out; in failure route, the current branch is the winning branch.

NOTES:

*   The index ALL ( "\*" ) is not supported;
    
*   In branch route, only the "$tm.branch.attr" and "$tm.branch.flag" variables work for the current branch (the rest of the branch related variables will return NULL)
    
*   Negative values are accepted, meaning indexing from the end ( -1 is the latest/higher branch)
    

The variable can be used in BRANCH, ONREPLY and FAILURE routes.

### 1.5.10.�$tm.branch.duri\[\]

_$tm.branch.duri_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the Detination-URI value of the branch.

### 1.5.11.�$tm.branch.path\[\]

_$tm.branch.path_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the PATH value of the branch.

### 1.5.12.�$tm.branch.q\[\]

_$tm.branch.q_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the Q value of the branch.

### 1.5.13.�$tm.branch.flags\[\]

_$tm.branch.flags_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the list (comma separated) of per-branch flags which are set for the branch.

### 1.5.14.�$tm.branch.socket\[\]

_$tm.branch.socket_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the socket description (proto:ip:port) used for sending the branch out.

### 1.5.15.�$tm.branch.flag()\[\]

_$tm.branch.flag(name)_ - similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but gives read/write access to a single branch flag (by its name).

The accepted values are 0 for FALSE, pozitive non-zero for TRUE. The returned values are 0 for FALSE and 1 for TRUE.

The flags operated here are the same as the bflags you can operated with via the "\[re\]setbflag()" functions.

### 1.5.16.�$tm.branch.attr()\[\]

_$tm.branch.attr(name)_ - similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but gives read/write access to the attributed attached to the branch.

An attribute can have whatever name (no need to be pre-defined) and it can have a single value (at a time), string or integer.

### 1.5.17.�$tm.branch.last\_received\[\]

_$tm.branch.last\_received_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the reply code of the last received reply (from the network) on this branch. NULL is returned in no reply was received so far.

### 1.5.18.�$tm.branch.type\[\]

_$tm.branch.type_ - 100% similar to **[$tm.branch.uri](#pv_tm_branch_uri "1.5.9.�$tm.branch.uri[]")**, but returning the type of the current branch. This may be "phone" if it not a real branch (has no SIP signalling, used by waiting for branch injection) or "sip" (a real signalling branch).

## 1.6.�Exported MI Functions

### 1.6.1.� `t_uac_dlg`

Generates and sends a local SIP request.

Parameters:

*   _method_ - request method
    
*   _ruri_ - request SIP URI
    
*   _headers_ - set of additional headers to be added to the request; at least “From” and “To” headers must be specified)
    
*   _next\_hop_ (optional) - next hop SIP URI (OBP).
    
*   _socket_ (optional) - local socket to be used for sending the request.
    
*   _body_ (optional) - request body (if present, requires the “Content-Type” and “Content-length” headers)
    

MI FIFO Command Format:

		opensips-cli -x mi t\_uac\_dlg method=INVITE ruri="sip:alice@127.0.0.1:7050" headers="From: sip:bobster@127.0.0.1:1337\\r\\nTo: sip:alice@127.0.0.1:7050\\r\\nContact: sip:bobster@127.0.0.1:1337\\r\\n"
		

### 1.6.2.� `t_uac_cancel`

Generates and sends a CANCEL for an existing SIP request.

Parameters:

*   _callid_ - callid of the INVITE request to be cancelled.
    
*   _cseq_ - cseq of the INVITE request to be cancelled.
    

MI FIFO Command Format:

		opensips-cli -x mi t\_uac\_cancel "1-23454@127.0.0.1" "1 INVITE"
		

### 1.6.3.� `t_hash`

Gets information about the load of TM internal hash table.

Parameters:

*   _none_
    

MI FIFO Command Format:

		opensips-cli -x mi t\_hash
		

### 1.6.4.� `t_reply`

Generates and sends a reply for an existing inbound SIP transaction.

Parameters:

*   _code_ - reply code
    
*   _reason_ - reason phrase.
    
*   _trans\_id_ - transaction identifier (has the hash\_entry:label format)
    
*   _to\_tag_ - To tag to be added to TO header
    
*   _new\_headers_ (optional) - extra headers to be appended to the reply.
    
*   _body_ - (optional) reply body (if present, requires the “Content-Type” and “Content-length” headers)
    

MI FIFO Command Format:

		opensips-cli -x mi t\_reply 403 Forbidden 46961:1279687637 abcde .
		

## 1.7.�Exported Statistics

Exported statistics are listed in the next sections. All statistics except “inuse\_transactions” can be reset.

### 1.7.1.�received\_replies

Total number of total replies received by TM module.

### 1.7.2.�relayed\_replies

Total number of replies received and relayed by TM module.

### 1.7.3.�local\_replies

Total number of replies local generated by TM module.

### 1.7.4.�UAS\_transactions

Total number of transactions created by received requests.

### 1.7.5.�UAC\_transactions

Total number of transactions created by local generated requests.

### 1.7.6.�2xx\_transactions

Total number of transactions completed with 2xx replies.

### 1.7.7.�3xx\_transactions

Total number of transactions completed with 3xx replies.

### 1.7.8.�4xx\_transactions

Total number of transactions completed with 4xx replies.

### 1.7.9.�5xx\_transactions

Total number of transactions completed with 5xx replies.

### 1.7.10.�6xx\_transactions

Total number of transactions completed with 6xx replies.

### 1.7.11.�inuse\_transactions

Number of transactions existing in memory at current time.

### 1.7.12.�retransmission\_req\_T1\_1

Number of request retransmissions due to T1 1 timer, the first retransmission interval (typical 500ms).

### 1.7.13.�retransmission\_req\_T1\_2

Number of request retransmissions due to T1 2 timer, the second retransmission interval (typical 1s).

### 1.7.14.�retransmission\_req\_T1\_3

Number of request retransmissions due to T1 3 timer, the third retransmission interval (typical 2s).

### 1.7.15.�retransmission\_req\_T2

Number of request retransmissions due to T2 , the final retransmission interval (typical 4s).

### 1.7.16.�retransmission\_rpl\_T2

Number of reply retransmissions, all done with the same retransmission interval T2, typical 4s.

### 1.7.17.�timeout\_finalresponse

Number of transactional timeouts without receiving any kind of reply (not even provisional) from the B side. Such timeouts indicate a communication / reachability issue. Note: a single transaction may count multiple such timeouts due forking.

### 1.7.18.�timeout\_finalresponse

Number of transactional INVITE timeouts without receiving a FINAL reply (provisional may be received) from the B side. Such timeouts indicate a "not answer" event and it is not a signalling issue. Note: a single transaction may count multiple such timeouts due forking.

## Chapter�2.�Developer Guide

## 2.1.�Functions

### 2.1.1.� `load_tm(*import_structure)`

For programmatic use only--import the TM API. See the cpl\_c, acc or jabber modules to see how it works.

Meaning of the parameters is as follows:

*   _import\_structure_ - Pointer to the import structure - see “struct tm\_binds” in modules/tm/tm\_load.h
    

## Chapter�3.�Frequently Asked Questions

**3.1.**

What happened with old cancel\_call() function

The function was replace (as functionality) by cancel\_branch("a") - cancel all braches.

**3.2.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

## Chapter�4.�Contributors

## 4.1.�By Commit Statistics

**Table�4.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

1119

646

22978

16883

2.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

541

198

18723

11167

3.

Jan Janak ([@janakj](https://github.com/janakj))

162

76

6462

1840

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

147

114

2083

879

5.

Andrei Pelinescu-Onciul

146

105

2447

1210

6.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

119

91

1319

946

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

45

33

675

339

8.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

43

37

322

166

9.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

40

18

916

826

10.

Anca Vamanu

37

19

778

651

  

**All remaining contributors**: Henning Westerholt ([@henningw](https://github.com/henningw)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Raphael Coeffic, Nils Ohlmeier, Klaus Darilion, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Andreas Granig, Elias Baixas, Marcus Hunger, Christophe Sollet ([@csollet](https://github.com/csollet)), Jeffrey Magder, Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Carsten Bock, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Elena-Ramona Modroiu, John Riordan, Juli�n Moreno Pati�o, Andrei Dragus, Jesus Rodrigues, Konstantin Bokarius, Aron Podrigal ([@ar45](https://github.com/ar45)), Anonymous, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Mark Dalby, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Fabian Gast ([@fgast](https://github.com/fgast)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Zero King ([@l2dy](https://github.com/l2dy)), Edson Gellert Schubert, MayamaTakeshi, Ingo Wolfsberger, Daniel Hsueh.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 4.2.�By Commit Activity

**Table�4.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jul 2010 - Feb 2026

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2013 - Oct 2025

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Nov 2001 - Sep 2025

4.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jun 2011 - Apr 2025

5.

Carsten Bock

Mar 2024 - Mar 2024

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Mar 2004 - Nov 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2023

8.

MayamaTakeshi

Oct 2022 - Oct 2022

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2021

10.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

  

**All remaining contributors**: Dan Pascu ([@danpascu](https://github.com/danpascu)), Fabian Gast ([@fgast](https://github.com/fgast)), Aron Podrigal ([@ar45](https://github.com/ar45)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Juli�n Moreno Pati�o, Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Ezequiel Lovelle ([@lovelle](https://github.com/lovelle)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Christophe Sollet ([@csollet](https://github.com/csollet)), Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Anonymous, Mark Dalby, Anca Vamanu, Andrei Dragus, John Riordan, Henning Westerholt ([@henningw](https://github.com/henningw)), Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jesus Rodrigues, Marcus Hunger, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Jeffrey Magder, Elias Baixas, Daniel Hsueh, Andreas Granig, Elena-Ramona Modroiu, Ingo Wolfsberger, Andrei Pelinescu-Onciul, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Raphael Coeffic, Nils Ohlmeier.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�5.�Documentation

## 5.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Carsten Bock, Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Fabian Gast ([@fgast](https://github.com/fgast)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Anca Vamanu, Henning Westerholt ([@henningw](https://github.com/henningw)), Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Dan Pascu ([@danpascu](https://github.com/danpascu)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_Documentation Copyrights:_

Copyright � 2005-2008 Voice Sistem SRL

Copyright � 2003 FhG FOKUS