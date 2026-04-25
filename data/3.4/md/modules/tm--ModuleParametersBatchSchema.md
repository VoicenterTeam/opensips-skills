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