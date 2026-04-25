# dialog Module Reference
<!-- generated-from: data/3.6/modules/dialog.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 dialog module. Read this file when configuring or debugging the dialog module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The dialog module provides dialog awareness to the OpenSIPS proxy. Its functionality is to keep trace of the current dialogs, to offer information about them (like how many dialogs are active).

Aside tracking, the dialog module offers functionalities like flags and attributes per dialog (persistent data across dialog), dialog profiling and dialog termination (on timeout base or external triggered).

The module, via an internal API, also provide the foundation to build on top of it more complex dialog-based functionalities via other OpenSIPS modules.

## How It Works

To create the dialog associated with an initial request, you must call the create\_dialog() function, with or without parameter.

The dialog is automatically terminated when a “BYE” is received. In case of no “BYE”, the dialog lifetime is controlled via the default timeout (see “default\_timeout” - [default\_timeout](#param_default_timeout "1.6.5.�default\_timeout (integer)")) and custom timeout (see “$DLG\_timeout” - [$DLG\_timeout](#pv_DLG_timeout "1.10.8.�$DLG\_timeout")).

Once terminated, the in-memory dialog may be destroyed right away or, depending on the “delete\_delay” - [delete\_delay](#param_delete_delay "1.6.8.�delete\_delay (integer)")) setting, it may be kept for a while in memory, in a read-only state (no action, no changes, nothing). This delaying may be used to help with the routing of late in-dialog request that may be received after the dialog terminted (like late BYE's due retransmissions, cross BYE requests, auth'ed BYE request, slow ACK on re-INVITEs, etc).

## Dependencies

### OpenSIPs Modules

- `RR` — optional, if Dialog ID matching is used in non Topo Hiding cases (optional)
- `TM` — Transaction module
- `clusterer` — if replication_cluster parameter is set (contact replication via clusterer module) (optional)

### External Libraries

None.

## Exported Parameters

### `cachedb_url` (string)

Enables distributed dialog profiles and specifies the backend that should be used by the CacheDB interface.

*Default value is empty.*

**Example.** redis://127.0.0.1:6379.

```opensips
modparam("dialog", "cachedb_url", "redis://127.0.0.1:6379")
```
### `call_id_column` (string)

The column's name in the database to store the dialogs' callid.

*Default value is callid.*

**Example.** callid_c_name.

```opensips
modparam("dialog", "call_id_column", "callid_c_name")
```
### `cluster_auto_sync` (string)

Specifies whether to automatically issue a sync request (for dialogs marked with a sharing tag in backup state) when a node becomes reachable. A value of _1_ means enabled and _0_ disabled.

*Default value is 1 (enabled).*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("dialog", "cluster_auto_sync", 0)
```
### `db_flush_vals_profiles` (integer)

Pushes dialog values, profiles and flags into the database along with other dialog state information (see db\_mode 1 and 2).

*Default value is empty.*

**Example.** Set the `db_flush_vals_profiles` parameter.

```opensips
modparam("dialog", "db\_flush\_vals\_profiles", 1)
```
### `db_mode` (integer)

Describe how to push into the DB the dialogs' information from memory.

*Default value is 0.*

**Possible values:**

- 0 - NO_DB
- 1 - REALTIME
- 2 - DELAYED
- 3 - SHUTDOWN

**Example.** 1.

```opensips
modparam("dialog", "db_mode", 1)
```
### `db_update_period` (integer)

The interval (seconds) at which to update dialogs' information if you chose to store the dialogs' info at a given interval. A too short interval will generate intensive database operations, a too large one will not notice short dialogs.

*Default value is 60.*

**Example.** 120.

```opensips
modparam("dialog", "db_update_period", 120)
```
### `db_url` (string)

If you want to store the information about the dialogs in a database a database url must be specified.

*Default value is mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("dialog", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `default_timeout` (integer)

The default dialog timeout (in seconds) if no custom one is set.

*Default value is 43200 (12 hours).*

**Example.** 21600.

```opensips
modparam("dialog", "default\_timeout", 21600)
```
### `delete_delay` (integer)

The interval (seconds) to delay a dialog deletion / removal from memory AFTER its termination. Once terminated, the dialog will be kept in a read only state (no action, no changes), but it will still be able to match and route late in-dialog requests.

*Default value is 0 (disabled).*

**Notes:** This global value may be per-call changed via the DLG_del_delay “$DLG_del_delay” script variable.

**Example.** 10.

```opensips
modparam("dialog", "delete_delay", 10)
```
### `dialog_replication_cluster` (integer)

Specifies the cluster ID for dialog replication using the _clusterer_ module. This enables sending and receiving all the dialog-related events (creation, update and deletion) in the cluster.

This OpenSIPS cluster exposes the **"dialog-dlg-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

*Default value is 0 (no replication).*

**Example.** 1.

```opensips
modparam("dialog", "dialog\_replication\_cluster", 1)
```
### `dlg_extra_hdrs` (string)

A string containing the extra headers (full format, with EOH) to be added in the requests generated by the module (like BYEs).

*Default value is NULL.*

**Example.** Hint: credit expired\r\n.

```opensips
modparam("dialog", "dlg_extra_hdrs", "Hint: credit expired\r\n")
```
### `dlg_id_column` (string)

The column's name in the database to store the dialogs' id information.

*Default value is dlg_id.*

**Example.** dlg_id_c_name.

```opensips
modparam("dialog", "dlg\_id\_column", "dlg\_id\_c\_name")
```
### `dlg_match_mode` (integer)

How the seqential requests should be matched against the known dialogs. The modes are a combination between matching based on a cookie (DID) stored as cookie in Record-Route header and the matching based on SIP elements (as in RFC3261).

*Default value is 1 (DID_FALLBACK).*

**Possible values:**

- 0 - DID_ONLY
- 1 - DID_FALLBACK
- 2 - DID_NONE

**Notes:** NOTE that if you have call looping on your OpenSIPS server (passing more than once through the same OpenSIPS instance), it is strongly suggested to use only DID_ONLY mode, as the SIP based matching will have an undefined behavior - from SIP perspective, a sequential dialog will match all the loops of the call, as the Call-ID, To and From TAGs are the same.

**Example.** 0.

```opensips
modparam("dialog", "dlg_match_mode", 0)
```
### `enable_stats` (integer)

If the statistics support should be enabled or not. Via statistic variables, the module provide information about the dialog processing. Set it to zero to disable or to non-zero to enable it.

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
modparam("dialog", "enable\_stats", 0)
```
### `flags_column` (string)

The column's name in the database to store the dialogs' flags.

*Default value is flags.*

**Example.** Set the `flags_column` parameter.

```opensips
modparam("dialog", "flags\_column", "flags\_c\_name")
```
### `from_contact_column` (string)

The column's name in the database to store the caller's contact uri.

*Default value is caller_contact.*

**Example.** from_contact_c_name.

```opensips
modparam("dialog", "from_contact_column", "from_contact_c_name")
```
### `from_cseq_column` (string)

The column's name in the database to store the cseq from caller side.

*Default value is caller_cseq.*

**Example.** from_cseq_c_name.

```opensips
modparam("dialog", "from_cseq_column", "from_cseq_c_name")
```
### `from_route_column` (string)

The column's name in the database to store the route records from caller side (proxy to caller).

*Default value is caller_route_set.*

**Example.** from_route_c_name.

```opensips
modparam("dialog", "from_route_column", "from_route_c_name")
```
### `from_sock_column` (string)

The column's name in the database to store the information about the local interface receiving the traffic from caller.

*Default value is caller_sock.*

**Example.** from_sock_c_name.

```opensips
modparam("dialog", "from\_sock\_column", "from\_sock\_c\_name")
```
### `from_tag_column` (string)

The column's name in the database to store the From tag from the Invite request.

*Default value is from_tag.*

**Example.** from_tag_c_name.

```opensips
modparam("dialog", "from_tag_column", "from_tag_c_name")
```
### `from_uri_column` (string)

The column's name in the database to store the caller's sip address.

*Default value is from_uri.*

**Example.** from_uri_c_name.

```opensips
modparam("dialog", "from_uri_column", "from_uri_c_name")
```
### `hash_size` (integer)

The size of the hash table internally used to keep the dialogs. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

*Default value is 4096.*

**Notes:** IMPORTANT: If dialogs' information should be stored in a database, a constant hash\_size should be used, otherwise the restored process will not take place. If you really want to modify the hash\_size you must delete all table's rows before restarting OpenSIPS.

**Example.** 1024.

```opensips
modparam("dialog", "hash\_size", 1024)
```
### `log_profile_hash_size` (integer)

The size of the hash table internally used to store profile->dialog associations. A larger table can provide more parallel operations but consumes more memory. The hash size is provided as the base 2 logarithm(e.g. log\_profile\_hash\_size =4 means the table has 2^4 entries).

*Default value is 4.*

**Example.** 5.

```opensips
modparam("dialog", "log\_profile\_hash\_size", 5) #set a table size of 32
```
### `mflags_column` (string)

The column's name in the database to store the dialogs' module flags.

*Default value is module_flags.*

**Example.** mflags_c_name.

```opensips
modparam("dialog", "mflags\_column", "mflags\_c_name")
```
### `options_ping_interval` (integer)

The interval (seconds) at which OpenSIPS will generate in-dialog OPTIONS pings for one or both of the involved parties.

*Default value is 30.*

**Example.** 20.

```opensips
modparam("dialog", "options_ping_interval", 20)
```
### `profile_no_value_prefix` (string)

Specifies what prefix should be added to the profiles without value when they are inserted into CacheDB backed. This is only used when distributed profiles are enabled.

*Default value is dlg_noval_.*

**Example.** dlgnv_.

```opensips
modparam("dialog", "profile_no_value_prefix", "dlgnv_")
```
### `profile_replication_cluster` (integer)

Specifies the cluster ID for profile replication using the _clusterer_ module. This enables sending and receiving the profile information (value, dialog count) in the cluster.

*Default value is 0 (no replication).*

**Example.** 1.

```opensips
modparam("dialog", "profile\_replication\_cluster", 1)
```
### `profile_size_prefix` (string)

Specifies what prefix should be added to the entity that holds the profiles with value size in CacheDB backed. This is only used when distributed profiles are enabled.

*Default value is dlg_size_.*

**Example.** dlgs_.

```opensips
modparam("dialog", "profile_size_prefix", "dlgs_")
```
### `profile_timeout` (integer)

Specifies how long a dialog profile should be kept in the CacheDB until it expires. This is only used when distributed profiles are enabled.

*Default value is 86400.*

**Example.** 43200.

```opensips
modparam("dialog", "profile\_timeout", 43200)
```
### `profile_value_prefix` (string)

Specifies what prefix should be added to the profiles with value when they are inserted into CacheDB backed. This is only used when distributed profiles are enabled.

*Default value is dlg_val_.*

**Example.** dlgv_.

```opensips
modparam("dialog", "profile_value_prefix", "dlgv_")
```
### `profiles_column` (string)

The column's name in the database to store the dialogs' profiles.

*Default value is profiles.*

**Example.** profiles_c_name.

```opensips
modparam("dialog", "profiles\_column", "profiles\_c_name")
```
### `profiles_no_value` (string)

List of names (alphanumerical/-/\_) for profiles without values. Flags _/b_ or _/s_ allow sharing profiles between OpenSIPS instances using the clusterer module or a CacheDB backend, respectively.

*Default value is empty.*

**Example.** Set the `profiles_no_value` parameter.

```opensips
modparam("dialog", "profiles\_no\_value", "inbound ; outbound ; shared/s; repl/b;")
```
### `profiles_with_value` (string)

List of names (alphanumerical/-/\_) for profiles with values. Flags _/b_ or _/s_ allow sharing profiles between OpenSIPS instances using the clusterer module or a CacheDB backend, respectively.

*Default value is empty.*

**Example.** Set the `profiles_with_value` parameter.

```opensips
modparam("dialog", "profiles\_with\_value", "callerCC; gatewayCC; clientChannels/s; codecUsed/b;")
```
### `race_condition_timeout` (integer)

If dialog is created using the 'E' flag, and a SIP Race condition happens, then the dialog will be terminated after 'race_condition_timeout' seconds. Currently, the only supported race conditions are (200OK vs CANCEL) and (early BYE vs 200OK)

*Default value is 5.*

**Example.** 1.

```opensips
modparam("dialog", "race_condition_timeout", 1)
```
### `reinvite_ping_interval` (integer)

The interval (seconds) at which OpenSIPS will generate in-dialog Re-INVITE pings for one or both of the involved parties.

*Default value is 300.*

**Notes:** Important: the ping timeout detection is performed every time this interval ticks, not when the re-INVITE transaction times out! Consequently, please make sure that the timeouts for re-INVITE transactions (e.g. the "fr_timeout" modparam of the "tm" module or its $T_fr_timeout variable) are always lower than the value of this parameter! Failing to ensure this ordering of timeouts may possibly lead to re-INVITE pings never ending a disconnected dialog due to pings getting retried before getting a chance to properly time out.

**Example.** 600.

```opensips
modparam("dialog", "reinvite_ping_interval", 600)
```
### `replicate_profiles_buffer` (string)

Used to specify the length of the buffer used by the binary replication, in bytes. Usually this should be big enough to hold as much data as possible, but small enough to avoid UDP fragmentation. The recommended value is the smallest MTU between all the replication instances.

*Default value is 1400 bytes.*

**Example.** 500.

```opensips
modparam("dialog", "replicate\_profiles\_buffer", 500)
```
### `replicate_profiles_check` (string)

Timer in seconds, used to specify how often the module should check whether old, replicated profiles values are obsolete and should be removed. should replicate its profiles to the other instances.

*Default value is 10 s.*

**Example.** 100.

```opensips
modparam("dialog", "replicate\_profiles\_check", 100)
```
### `replicate_profiles_expire` (string)

Timer in seconds, used to specify when the profiles counters received from a different instance should no longer be taken into account. This is used to prevent obsolete values, in case an instance stops replicating its counters.

*Default value is 10 s.*

**Example.** 10.

```opensips
modparam("dialog", "replicate_profiles_expire", 10)
```
### `replicate_profiles_timer` (string)

Timer in milliseconds, used to specify how often the module should replicate its profiles to the other instances.

*Default value is 200 ms.*

**Example.** 100.

```opensips
modparam("dialog", "replicate_profiles_timer", 100)
```
### `rr_param` (string)

Name of the Record-Route parameter to be added with the dialog cookie. It is used for fast dialog matching of the sequential requests.

*Default value is did.*

**Example.** xyz.

```opensips
modparam("dialog", "rr\_param", "xyz")
```
### `sflags_column` (string)

The column's name in the database to store the dialogs' script flags.

*Default value is script_flags.*

**Example.** sflags_c_name.

```opensips
modparam("dialog", "sflags\_column", "sflags\_c_name")
```
### `start_time_column` (string)

The column's name in the database to store the dialogs' start time information.

*Default value is start_time.*

**Example.** start_time_c_name.

```opensips
modparam("dialog", "start\_time\_column", "start\_time\_c\_name")
```
### `state_column` (string)

The column's name in the database to store the dialogs' state information.

*Default value is state.*

**Example.** state_c_name.

```opensips
modparam("dialog", "state\_column", "state\_c\_name")
```
### `table_name` (string)

If you want to store the information about the dialogs in a database a table name must be specified.

*Default value is dialog.*

**Example.** my_dialog.

```opensips
modparam("dialog", "table_name", "my_dialog")
```
### `timeout_column` (string)

The column's name in the database to store the dialogs' timeout.

*Default value is timeout.*

**Example.** timeout_c_name.

```opensips
modparam("dialog", "timeout\_column", "timeout\_c_name")
```
### `timer_bulk_del_no` (integer)

The number of dialogs that should be attempted to be deleted at the same time ( a single query ) from the DB back-end.

*Default value is 1.*

**Example.** Set the `timer_bulk_del_no` parameter.

```opensips
modparam("dialog", "timer\_bulk\_del\_no", 10)
```
### `to_contact_column` (string)

The column's name in the database to store the callee's contact uri.

*Default value is callee_contact.*

**Example.** to_contact_c_name.

```opensips
modparam("dialog", "to_contact_column", "to_contact_c_name")
```
### `to_cseq_column` (string)

The column's name in the database to store the cseq from callee side.

*Default value is callee_cseq.*

**Example.** to_cseq_c_name.

```opensips
modparam("dialog", "to_cseq_column", "to_cseq_c_name")
```
### `to_route_column` (string)

The column's name in the database to store the route records from callee side (proxy to callee).

*Default value is callee_route_set.*

**Example.** to_route_c_name.

```opensips
modparam("dialog", "to_route_column", "to_route_c_name")
```
### `to_sock_column` (string)

The column's name in the database to store information about the local interface receiving the traffic from callee.

*Default value is callee_sock.*

**Example.** to_sock_c_name.

```opensips
modparam("dialog", "to\_sock\_column", "to\_sock\_c\_name")
```
### `to_tag_column` (string)

The column's name in the database to store the To tag from the 200 OK response to the Invite request, if present.

*Default value is to_tag.*

**Example.** to_tag_c_name.

```opensips
modparam("dialog", "to_tag_column", "to_tag_c_name")
```
### `to_uri_column` (string)

The column's name in the database to store the calee's sip address.

*Default value is to_uri.*

**Example.** to_uri_c_name.

```opensips
modparam("dialog", "to_uri_column", "to_uri_c_name")
```
### `vars_column` (string)

The column's name in the database to store the dialogs' vars.

*Default value is vars.*

**Example.** vars_c_name.

```opensips
modparam("dialog", "vars\_column", "vars\_c_name")
```

## Exported Functions

### `create_dialog([flags])`

The function creats the dialog for the currently processed request. The request must be an initial request. Optionally,the function also receives a string parameter, which specifies special behavior to be done for the current dialog.

**Parameters:**

- `flags` *(string, optional)* — Specifies special behavior to be done for the current dialog. Multiple string flags can be used at the same time.
  - `B`
  - `P`
  - `p`
  - `R`
  - `r`
  - `E`

**Return codes:**

- `true` — if the dialog was successfully created or if the dialog was previously created

**Usable from:** REQUEST_ROUTE

**Example.** create_dialog() usage.

```opensips
...
create_dialog();
...
#ping caller
create_dialog("P");
...
#ping caller and callee
create_dialog("Pp");

#bye on timeout
create_dialog("B");
...
```

### `dlg_inc_cseq([tag, ][inc])`

Increments the dialog's generated CSeq associated to the leg identified by the dialog's tag.

**Parameters:**

- `inc` *(integer, optional)* — the value used to increment/decrement (if negative) the CSeq of the identified leg. If not used, the value is incremented with _1_.
- `tag` *(string, optional)* — the tag to increment the CSeq value for. If missing, the message's _To_ tag is used to identify the leg to increment the CSeq for.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** increment upstream CSeq after each in-dialog request.

```opensips
...
route {
	...
	if (has_totag()) {
		if (loose_route())
			dlg_inc_cseq(); # increment upstream CSeq after each in-dialog request
	}
}
...
```

### `dlg_on_answer([route_name])`

The function arms a script route to be executed when the current dialog will be later answered. When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one). You must use this function AFTER creating the dialog and before the dialog being answered. If the parameter is missing, the function does a reset of any route previously set; there will be no triggering.

**Parameters:**

- `route_name` *(string, optional)* — the name of the script route to be executed.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Example.** dlg_on_answer usage.

```opensips
...
create_dialog();
dlg_on_answer("dlg_answered");
...
route[dlg_answered] {
	xlog("The dialog $DLG_did was answered\n");
}
```

### `dlg_on_hangup([route_name])`

The function arms a script route to be executed when the current dialog will be terminated. When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one). Note that the dialog will be already terminated and there is nothing you can do about it besides reading data from its context. You must use this function AFTER creating the dialog and before the dialog being answered. If the parameter is missing, the function does a reset of any route previously set; there will be no triggering.

**Parameters:**

- `route_name` *(string, optional)* — the name of the script route to be executed.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Example.** dlg_on_hangup usage.

```opensips
...
create_dialog();
dlg_on_hangup("dlg_hangup");
...
route[dlg_hangup] {
	xlog("The dialog $DLG_did terminated after $DLG_lifetime secs\n");
}
```

### `dlg_on_timeout([route_name])`

The function arms a script route to be executed when (and if) the current dialog will timeout (as duration). When the route will be executed, the dialog context will be exposed, but with no valid SIP message (just a phony one) When the route is executed, the dialog is not yet terminated, just its lifetime reached the set limit. In the timeout route you can increase the dialog expiration timeout (and the dialog will continue) or you can let the dialog to be terminated (after the end of this route). You must use this function AFTER creating the dialog and before the dialog being answered.

**Parameters:**

- `route_name` *(string, optional)* — the name of the script route to be executed.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Example.** dlg_on_timeout usage.

```opensips
...
create_dialog();
$DLG_timeout=120;
dlg_on_timeout("dlg_timeout");
...
route[dlg_timeout] {
	xlog("The dialog $DLG_did timed out\n");
	if (_some_prolongation_condition)
		$DLG_timeout = 60; # give it 1 min more
}
```

### `dlg_send_sequential(method, leg, [, body] [, content-type] [, headers])`

Used to send an in-dialog request towards one if the dialog's legs. The function assumes that is runs inside a dialog context - if you are running it from a different context (such as an event_route), make sure you first load the dialog context using the load_dialog_ctx() function.

**Parameters:**

- `body` *(string, optional)* — an optional body sent in the request. If missing, no body is sent.
- `content-type` *(string, optional)* — the content type of the body sent. Make sure you specify this every time you send a request with a body, otherwise there are high changes that your UAC will reject the request.
- `headers` *(string, optional)* — additional headers attached to the request sent.
- `leg` *(string, required)* — the leg where the request is sent. Must be either caller or callee.
  - `caller`
  - `callee`
- `method` *(string, required)* — the method of the request sent.

**Usable from:** ANY route

**Related:**

- `load_dialog_ctx`

**Example.** dlg_send_sequential usage to convert DTMF codes.

```opensips
...
event_route[E_RTPPROXY_DTMF] {
    if (load_dialog_ctx("$param(id)", "did")) {
        if ($param(stream) == 0) {
            $var(direction) = "callee";
        } else {
            $var(direction) = "caller";
        }
        dlg_send_sequential($var(direction), "INFO",
                "Signal=$param(digit)\nDuration=160",
                "application/dtmf-relay");
        unload_dialog_ctx();
    }
}
...
```

### `fetch_dlg_value(name,val)`

Fetches from the dialog the value of attribute named _name_. The values attached to dialogs are dialog persistent and they can be accessed (read and write) for all requests belonging to the dialog.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

Same functionality may be obtain by reading the pseudo variable _$dlg_val(name)_.

**Parameters:**

- `name` *(string, required)* — 
- `val` *(var, required)* — 

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `$dlg_val(name)`
- `create_dialog`

**Example.** fetch_dlg_value usage.

```opensips
...
fetch_dlg_value("inv_src_ip",$avp(2));
fetch_dlg_value("account type",$var(account));
# or
$var(account) = $dlg_val(account_type);
...
```

### `fix_route_dialog()`

The function forces an in dialog SIP message to contain the ruri, route headers and dst_uri, as specified by the internal data of the dialog it belongs to. The function will prevent the existence of bogus injected in-dialog requests ( like malicious BYEs )

**Usable from:** REQUEST_ROUTE

**Example.** fix_route_dialog() usage.

```opensips
...
    if (has_totag()) {
        loose_route();
        if ($DLG_status!=NULL)
            if (!validate_dialog())
                fix_route_dialog();
    }
...
```

### `get_dialog_info(attr,avp,key,key_val,no_dlgs)`

The function extracts a dialog value from another dialog. It first searches through all existing (ongoing) dialogs for all dialogs that have a dialog variable named "key" with the value "key_val" (so a dialog where $dlg_val(key)=="key_val"). If found, it returns the value of the dialog variable "attr" from all the founds dialog in the "avp" pseudo-variable, otherwise nothing is written in "avp", and a negative error code is returned. NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

**Parameters:**

- `attr` *(string, required)* — the name of the dialog variable (from the found dialog) to be returned
- `avp` *(var, required)* — an avp where to store the values of the "attr" dialog variable. Since the function checks through all dialogs, this needs to be an actual AVP in order to support pushing values from all matched dialogs.
- `key` *(string, required)* — name of a dialog variable to be used a search key (when looking after the target dialog)
- `key_val` *(var, required)* — the value of the dialog variable that is used as key in searching the target dialog.
- `no_dlgs` *(var, required)* — the total number of dialogs containing the key variable

**Return codes:**

- `true` — If found, it returns the value of the dialog variable "attr" from all the founds dialog in the "avp" pseudo-variable
- `negative error code` — otherwise nothing is written in "avp"

**Usable from:** ALL ROUTES

**Example.** get_dialog_info usage.

```opensips
...
if ( get_dialog_info("callee",$avp(callee_array),"caller",$fu,$var(dlg_no)) ) {
	xlog("caller $fu has $var(dlg_no) other ongoing calls, talking with :");	
	$var(it) = 0;
	while ($var(it) < $var(dlg_no)) {
		$var(current_callee) = $(avp(callee_array)[$var(it)]);
		xlog(" $var(current_callee) ");
		$var(it) = $var(it) + 1;
	}

	xlog("\n");
}

# create dialog for current call and place the caller and callee attributes
create_dialog();
$dlg_val(caller) = $fu;
$dlg_val(callee) = $ru;
...
```

### `get_dialog_vals(names,vals,callid)`

The function fetches all the dialog variables of another dialog. It first searches through all existing (ongoing) dialogs based on the given SIP CallID. If found, it returns all the dialog variables as two parallel arrays of names and values (using the given variables "names" and "vals"). As these variables have to hold arrays, they must be AVPs.

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

**Parameters:**

- `callid` *(string, required)* — the callid of a dialog to be searched (and have the variables fetched).
- `names` *(var, required)* — an AVP variable to hold all the names of the variables from the found dialog.
- `vals` *(var, required)* — an AVP variable to hold all the values of the variables from the found dialog.

**Return codes:**

- `true` — if the dialog was found and variables fetched
- `false` — if the dialog was not found

**Usable from:** ANY ROUTE

**Example.** Fetches and logs all dialog variables for a specific Call-ID..

```opensips
if ( get_dialog_vals($avp(d_names),$avp(d_vals),$var(callid)) ) {
	xlog("the call $var(callid) has the variables:\n);
	$var(i) = 0;
	while ( $(avp(d_names)[$var(i)])!=NULL ) {
		xlog("var $var(i) is $(avp(d_names)[$var(i)])='$(avp(d_vals)[$var(i)])'\n");
		$var(i) = $var(i) + 1;
	}
}
```

### `get_dialogs_by_profile(name,value,out_avp,out_dlg_no)`

The function looks up through the whole dialog table for dialogs configured to be within the provided dialog profile name, and optionally with the provided profile value. The function returns all the $DLG_ctx_json variables for the matched dialogs, storing them in the provided out_avp. The total number of matched dialogs is returned in the out_dlgs_no variable

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

**Parameters:**

- `name` *(string, required)* — the name of the dialog profile used for the lookup
- `out_avp` *(var, required)* — the AVP which will be populated will the dialog JSONs for all the matched calls
- `out_dlg_no` *(var, required)* — the out var which will contain the total number of matched dialogs
- `value` *(string, optional)* — the value of the above dialog profile ( optional )

**Return codes:**

- `true` — if matches were found
- `false` — if no matches were found

**Usable from:** ANY ROUTE

**Example.** Searches for dialogs in the 'caller' profile with the value of $fU and logs the count..

```opensips
if ( get_dialogs_by_profile("caller",$fU,$avp(dlg_jsons),$avp(dlg_no)) ) {
	xlog("Caller $fU has $avp(dlg_no) other calls \n);
	$var(i) = 0;
	while ( $(avp(dlg_jsons)[$var(i)])!=NULL ) {
		$json(dlg_info) := $(avp(dlg_jsons)[$var(i)]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
```

### `get_dialogs_by_val(name,value,out_avp,out_dlg_no)`

The function looks up through the whole dialog table for dialogs containing a $dlg_val with the provided name and value, and returns all the $DLG_ctx_json variables for the matched dialogs, storing them in the provided out_avp. The total number of matched dialogs is returned in the out_dlgs_no variable

NOTE: the function does not require to be called in the context of a dialog - you can use it whenever / whereever for searching for other dialogs.

**Parameters:**

- `name` *(string, required)* — the name of the dialog variable used for the lookup
- `out_avp` *(var, required)* — the AVP which will be populated will the dialog JSONs for all the matched calls
- `out_dlg_no` *(var, required)* — the out var which will contain the total number of matched dialogs
- `value` *(var, required)* — the value of the above dialog val

**Return codes:**

- `true` — if matches were found
- `false` — if no matches were found

**Usable from:** ANY ROUTE

**Example.** Searches for dialogs where the 'caller' variable matches the From URI ($fU) and logs the count..

```opensips
if ( get_dialogs_by_val("caller",$fU,$avp(dlg_jsons),$avp(dlg_no)) ) {
	xlog("Caller $fU has $avp(dlg_no) other calls \n);
	$var(i) = 0;
	while ( $(avp(dlg_jsons)[$var(i)])!=NULL ) {
		$json(dlg_info) := $(avp(dlg_jsons)[$var(i)]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
```

### `get_profile_size(profile,[value],size)`

Returns the number of dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - how many dialogs were inserted into the profile with a specific value. If not value is passed, only simply belonging of the dialog to the profile is checked. Note that the profile does not supports values, this will be silently discarded.

**Parameters:**

- `profile` *(string, required)* — name of the profile to get the size for.
- `size` *(var, required)* — an AVP or script variable to return the profile size in.
- `value` *(string, optional)* — string value to toughen the check.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Example.** get_profile_size usage.

```opensips
modparam("dialog", "profiles_no_value", "inboundCalls")
modparam("dialog", "profiles_with_value", "caller")
...
get_profile_size("inboundCalls",,$var(size));
xlog("inboundCalls: $var(size)\n");
...
get_profile_size("caller", $fu, $var(size));
xlog("currently, the user $fu has $var(size) active outgoing calls\n");
```

### `is_dlg_flag_set(flag)`

Returns true if the dialog flag named _flag_ is set. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

**Parameters:**

- `flag` *(string, required)* — The flag name.

**Return codes:**

- `true` — if the dialog flag named _flag_ is set

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `create_dialog`

**Example.** is_dlg_flag_set usage.

```opensips
...
if (is_dlg_flag_set("MY_DLG_FLAG")) {
	xlog("dialog flag MY_DLG_FLAG is set\n");
}
...
```

### `is_in_profile(profile,[value])`

Checks if the current dialog belongs to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - if the dialog was inserted into the profile for a specific value. If no value is passed, only simply belonging of the dialog to the profile is checked. Note that if the profile does not support values, this will be silently discarded.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

**Parameters:**

- `profile` *(string, required)* — name of the profile to be checked against.
- `value` *(string, optional)* — string value to toughen the check.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `create_dialog`

**Example.** is_in_profile usage.

```opensips
if (is_in_profile("inboundCall")) {
	log("this request belongs to a inbound call\n");
}
...
if (is_in_profile("caller","XX")) {
	log("this request belongs to a call of user XX\n");
}
```

### `load_dialog_ctx( dialog [, id_type])`

The function loads and switches to the context of the given dialog. The context of a dialog is given by the dialog flags, variables, profiles and any other value/state related to the dialog. By switching to the context of another dialog, you will see at the script level, by default, all the data from the new dialog.

NOTE: you cannot perform a new load until doing an unload - no nested loadings are possible.

**Parameters:**

- `dialog` *(string, required)* — the identifier of the dialog to be loaded, it may be a SIP Call-ID or a Dialog ID.
- `id_type` *(string, optional)* — what kind of dialog identified was used in the first parameter. It can be callid (SIP Call-ID) or did (internal Dialog ID). By default callid will be assumed.
  - `callid`
  - `did`

**Return codes:**

- `true` — if the dialog context was successfully loaded
- `false` — if the dialog was not found or loading failed

**Usable from:** ANY ROUTE

**Related:**

- `unload_dialog_ctx`

**Example.** Loads a dialog context by Call-ID, logs its lifetime and profile status, then unloads it..

```opensips
if (load_dialog_ctx("$var(callid)")) {
	xlog("The dialog '$var(callid)' already has a duration "
	     "of $DLG_lifetime seconds\n");
	if (is_in_profile("inboundCall"))
		xlog("this dialog is an inbound call\n");
	unload_dialog_ctx();
}
```

### `match_dialog([dlg_match_mode])`

This function is to be used to match a sequential (in-dialog) request to an ongoing dialog. By default, dialog matching is performed according to the dlg_match_mode module parameter. A specific matching mode may be enforced by specifying the optional "dlg_match_mode" parameter. Possible values for this parameter are "DID_ONLY", "DID_FALLBACK" and "DID_NONE". As sequential requests are automatically matched to the dialog when doing "loose_route()" from script, this function is intended to: (A) control the place in your script where the dialog matching is done and (B) to cope with bogus sequential requests that do not have Route headers, so they are not handled by loose_route().

**Parameters:**

- `dlg_match_mode` *(string, optional)* — A specific matching mode may be enforced by specifying the optional parameter.
  - `DID_ONLY`
  - `DID_FALLBACK`
  - `DID_NONE`

**Return codes:**

- `true` — if a dialog exists for the request

**Usable from:** REQUEST_ROUTE

**Related:**

- `loose_route`

**Example.** match_dialog() usage.

```opensips
...
    if (has_totag()) {
        loose_route();

        # example 1: match according to dlg_match_mode
        if ($DLG_status == NULL && !match_dialog())
            xlog("cannot match request to a dialog\n");

        # example 2: override dlg_match_mode
        if ($DLG_status == NULL && !match_dialog("DID_FALLBACK"))
            xlog("cannot match request to a dialog\n");
    }
...
```

### `reset_dlg_flag(flag)`

Resets the dialog flag named _flag_ to false. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

**Parameters:**

- `flag` *(string, required)* — The flag name.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `create_dialog`

**Example.** reset_dlg_flag usage.

```opensips
...
reset_dlg_flag("MY_DLG_FLAG");
...
```

### `set_dlg_flag(flag)`

Sets the dialog flag named flag to true. The dialog flags are dialog persistent and they can be accessed (set and test) for all requests belonging to the dialog.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

**Parameters:**

- `flag` *(string, required)* — The flag name.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `create_dialog`

**Example.** set_dlg_flag usage.

```opensips
set_dlg_flag("MY_DLG_FLAG");
```

### `set_dlg_profile(profile, [value], [clear_values])`

Inserts the current dialog into a profile. Note that if the profile does not support values, this will be silently discarded. A dialog may be inserted in the same profile multiple times.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

**Parameters:**

- `clear_values` *(boolean, optional)* — if set to true (1), all values of the profile will be cleared before setting the given value.
- `profile` *(string, required)* — name of the profile to be added to.
- `value` *(string, optional)* — string value to define the belonging of the dialog to the profile - note that the profile must support values.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `create_dialog`

**Example.** set_dlg_profile usage.

```opensips
set_dlg_profile("inboundCall");

# Set a new value (all other values are kept intact)
set_dlg_profile("caller", $fu);

# Set a new value while removing all previous values
set_dlg_profile("caller", $fu, true);
```

### `set_dlg_sharing_tag(tag_name)`

Marks the current dialog with the sharing tag tag_name. From this point on, actions like in-dialog pinging, BYEs on timeout etc. will depend on the tag state(no action in "backup" state, normal operation in "active" state). For more details see the Dialog clustering chapter.

**Parameters:**

- `tag_name` *(string, required)* — Marks the current dialog with the sharing tag tag_name.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Example.** Usage of set_dlg_sharing_tag.

```opensips
...
set_dlg_sharing_tag("vip1");
...
```

### `store_dlg_value(name,val)`

Attaches to the dialog the value from the variable _val_ under the name _name_. The values attached to dialogs are dialog persistent and they can be accessed (read and write) for all requests belonging to the dialog.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

Same functionality may be obtain by assigning a value to pseudo variable _$dlg_val(name)_.

**Parameters:**

- `name` *(string, required)* — 
- `val` *(var, required)* — 

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `$dlg_val(name)`
- `create_dialog`

**Example.** store_dlg_value usage.

```opensips
...
store_dlg_value("inv_src_ip",$si);
store_dlg_value("account type",$var(account));
# or
$dlg_val(account_type) = "prepaid";
...
```

### `test_and_set_dlg_flag(flag, value)`

Atomically checks if the dialog flag named _flag_ is equal to _value_. If true, changes the value with the opposite one. This operation is done under the dialog lock.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

**Parameters:**

- `flag` *(string, required)* — The flag name.
- `value` *(int, required)* — The value should be 0 (false) or 1 (true).
  - `0`
  - `1`

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `create_dialog`

**Example.** test_and_set_dlg_flag usage.

```opensips
...
test_and_set_dlg_flag("MY_DLG_FLAG", 0);
...
```

### `unload_dialog_ctx()`

The function off-loads the loaded context of another dialog, exposing whatever dialog context was present before doing the load.

NOTE: you MUST perform from script an explicit unload for each load you did, otherwise the loaded dialog will remain hanged for ever.

**Usable from:** ANY ROUTE

**Related:**

- `load_dialog_ctx`

**Example.** Unloads the previously loaded dialog context..

```opensips
if (load_dialog_ctx("$var(callid)")) {
	xlog("The dialog '$var(callid)' already has a duration "
	     "of $DLG_lifetime seconds\n");
	if (is_in_profile("inboundCall"))
		xlog("this dialog is an inbound call\n");
	unload_dialog_ctx();
}
```

### `unset_dlg_profile(profile, [value])`

Removes the current dialog from a profile.

NOTE: the dialog must be created before using this function (use create_dialog() function before).

NEW in 3.4: for profiles with value, by omitting this parameter you can now clear all values of the given profile.

**Parameters:**

- `profile` *(string, required)* — name of the profile to be removed from.
- `value` *(string, optional)* — string value to define the belonging of the dialog to the profile - note that the profile must support values.

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, REPLY_ROUTE, FAILURE_ROUTE

**Related:**

- `create_dialog`

**Example.** unset_dlg_profile usage.

```opensips
unset_dlg_profile("inboundCall");
unset_dlg_profile("caller", $fu);
...
# Remove all values in a profile
unset_dlg_profile("caller");
```

### `validate_dialog()`

The function checks the current received requests against the dialog (internal data) it belongs to. Performing several tests, the function will help to detect the bogus injected in-dialog requests (like malicious BYEs). The performed tests are related to CSEQ sequence checking and routing information checking (contact and route set).

**Return codes:**

- `true` — if a dialog exists for the request and if the request is valid (according to dialog data)
- `-1` — invalid cseq
- `-2` — invalid remote target
- `-3` — invalid route set
- `-4` — other errors ( parsing, no dlg, etc )

**Usable from:** REQUEST_ROUTE

**Example.** validate_dialog() usage.

```opensips
...
    if (has_totag()) {
        loose_route();
        if ($DLG_status!=NULL && !validate_dialog() ) {
            xlog(" in-dialog bogus request \n");
        } else {
            xlog(" in-dialog valid request - $DLG_dir !\n");
        }
    }
...
```

## Exported Pseudo-Variables

### `$DLG_count`

Returns the number of current active dialogs (may be confirmed or not).

- **Type:** integer
- **Read/write:** read-only
- **Scope:** Global
### `$DLG_ctx_json`

The variable is read-only and exposes a JSON variable containing all the information that the dlg_list_ctx MI function contains ( on top of $DLG_json, this will expose the full list of dialog vars and profile links for the current dialog ) NULL will be returned if there is no dialog for the request, otherwise the JSON will be returned.

- **Type:** string
- **Read/write:** read-only
- **Scope:** Dialog context
### `$DLG_del_delay`

Used to set the dialog deletion delay (in seconds) for the current dialog (in a per-call manner). When read, the variable returns the number of seconds that were set for the call or the default value ( see the “delete_delay” - delete_delay module param) for the delete delaying. The variable must be used when the context of a dialog is available in script.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** Dialog context
### `$DLG_did`

Returns the id of the dialog corresponding to the processed sequential request. The output format is a string identical to the one returned by the dlg_list MI function. This PV will be available only for sequential requests, after doing loose_route(). NULL will be returned if there is no dialog for the request.

- **Type:** string
- **Read/write:** read-only
- **Scope:** Sequential request
### `$DLG_dir`

Returns the direction of the request in dialog (as "upstream" string if the request is generated by callee or "downstream" string if the request is generated by caller) - to be used for sequential request. This PV will be available only for sequential requests (not for replies), after doing loose_route(). NULL will be returned if there is no dialog for the request.

- **Type:** string
- **Read/write:** read-only
- **Scope:** Sequential request

**Possible values:**

- NULL
- upstream
- downstream
### `$DLG_end_reason`

Returns the reason for the dialog termination. It can be one of the following : * Upstream BYE - Callee has sent a BYE * Downstream BYE - Caller has sent a BYE * Lifetime Timeout - Dialog lifetime expired * MI Termination - Dialog ended via the MI interface * Ping Timeout - Dialog ended because no reply to option pings * ReINVITE Ping Timeout - Dialog ended because no reply to reinvite pings * RTPProxy Timeout - Media timeout signaled by RTPProxy * SIP Race Condition - SIP Race Condition occurred NULL will be returned if there is no dialog for the request, or if the dialog is not ended in the current context.

- **Type:** string
- **Read/write:** read-only
- **Scope:** Dialog context

**Possible values:**

- NULL
- Upstream BYE
- Downstream BYE
- Lifetime Timeout
- MI Termination
- Ping Timeout
- ReINVITE Ping Timeout
- RTPProxy Timeout
- SIP Race Condition
### `$DLG_flags`

Returns the dialog flags (as a list of flag names separted by space) of the dialog corresponding to the processed sequential request. This PV will be available only for sequential requests, after doing loose_route(). NULL will be returned if there is no dialog for the request.

- **Type:** string
- **Read/write:** read-only
- **Scope:** Sequential request
### `$DLG_json`

The variable is read-only and exposes a JSON variable containing all the information that the dlg_list MI function contains NULL will be returned if there is no dialog for the request, otherwise the JSON will be returned.

- **Type:** string
- **Read/write:** read-only
- **Scope:** Dialog context
### `$DLG_lifetime`

Returns the duration (in seconds) of the dialog corresponding to the processed sequential request. The duration is calculated from the dialog confirmation and the current moment. This PV will be available only for sequential requests, after doing loose_route(). NULL will be returned if there is no dialog for the request.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** Sequential request
### `$DLG_status`

Returns the status of the dialog corresponding to the processed sequential request. This PV will be available only for sequential requests, after doing loose_route().

- **Type:** integer
- **Read/write:** read-only
- **Scope:** Sequential request

**Possible values:**

- NULL
- 1
- 2
- 3
- 4
- 5
### `$DLG_timeout`

Used to set the dialog lifetime (in seconds). When read, the variable returns the number of seconds until the dialog expires and is destroyed. Note that reading the variable is only possible after the dialog is created (for initial requests) or after doing loose_route() (for sequential requests). Important notice: using this variable with a REALTIME db_mode is very inefficient, because every time the dialog value is changed, a database update is done. NULL will be returned if there is no dialog for the request, otherwise the number of seconds until the dialog expiration.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** Dialog context
### `$dlg_val(name)`

This is a read/write variable that allows access to the dialog attribute named name. It can hold a string or integer value. Be sure and use this variable only when having a dialog context (like after create_dialog() or match_dialog() or equivalent). The variable accepts dynamic names, meaning the name may contain other variables. NULL will be returned if there is no dialog for the request.

- **Type:** string or integer
- **Read/write:** read-write
- **Scope:** Dialog context

## Exported MI Functions

### `dlg_cluster_sync`

This command will only take effect if dialog replication is enabled. Fully synchronize the dialog information in memory from a suitable donor node within the dialog_replication_cluster. Dialogs that already exist in memory which are not reconfirmed through syncing will be discarded. A sharing tag can be specified in order to sync only dialogs marked with that sharing tag.

**Parameters:**

- `sharing_tag` *(string, required)* — name of the sharing tag that dialogs have to be marked with in order to be synced

**Returns:** Returns true if the cluster synchronization was successful.

**Example.** synchronize dialogs for sharing tag vip1

```opensips
opensips-cli -x mi dlg_cluster_sync vip1
```

### `dlg_db_sync`

Will load all the information about the dialogs from the database in the OpenSIPS internal memory. If a dialog is already found in memory and has the same/an older state, it will be updated with the values from DB. Otherwise, the newer in-memory version will not be changed.

**Returns:** Returns true if the synchronization was successful.

**Example.** synchronize dialogs from database to memory

```opensips
opensips-cli -x mi dlg_db_sync
```

### `dlg_end_dlg`

Terminates an ongoing dialog. If dialog is established, BYEs are sent in both directions. If dialog is in unconfirmed or early state, a CANCEL will be sent to the callee side, that will trigger a 487 from the callee, which, when relayed, will also end the dialog on the caller's side.

**Parameters:**

- `dialog_id` *(string, required)* — this is an identifier of the dialog - it can be either (1) the unique ID of the dialog (as provided by dlg_list), either (2) the SIP Call-ID of the dialog.
- `extra_hdrs` *(string, optional)* — string containg the extra headers (full format) to be added to the BYE requests.

**Returns:** Returns true if the command was successful.

**Example.** terminate the dialog via the internal Dialog-ID

```opensips
opensips-cli -x mi dlg_end_dlg 6ae.4b38d013
```

**Example.** terminate the dialog via its SIP Call-ID

```opensips
opensips-cli -x mi dlg_end_dlg Y2IwYjQ2YmE2ZDg5MWVkNDNkZGIwZjAzNGM1ZDY
```

### `dlg_list`

Lists the description of the dialogs (calls). If no parameter is given, all dialogs will be listed. If a dialog identifier is passed as parameter (callid and fromtag), only that dialog will be listed. If a index and conter parameter is passed, it will list only a number of "counter" dialogs starting with index (as offset) - this is used to get only section of dialogs.

**Parameters:**

- `callid` *(string, optional)* — callid if a single dialog to be listed.
- `counter` *(integer, optional)* — how many dialogs should be listed (starting from the offset)
- `from_tag` *(string, optional)* — fromtag (as per initial request) of the dialog to be listed. entry
- `index` *(integer, optional)* — offset where the dialog listing should start.

**Returns:** A list of ongoing dialogs and their details.

**Example.** list all ongoing dialogs

```opensips
opensips-cli -x mi dlg_list
```

**Example.** list the dialog by callid and From TAG

```opensips
opensips-cli -x mi dlg_list callid=abcdrssfrs122444@192.168.1.1 from_tag=AAdfeEFF33
```

**Example.** list 10 dialogs, starting from the position 40 (in the list of all ongoing dialogs)

```opensips
opensips-cli -x mi dlg_list index=40 counter=10
```

### `dlg_list_ctx`

The same as the “dlg_list” but including in the dialog description the associated context from modules sitting on top of the dialog module. This function also prints the dialog's values. In case of binary values, the non-printable chars are represented in hex (e.g. \x00)

**Parameters:**

- `callid` *(string, optional)* — callid if a single dialog to be listed.
- `counter` *(integer, optional)* — how many dialogs should be listed (starting from the offset)
- `from_tag` *(string, optional)* — fromtag (as per initial request) of the dialog to be listed. entry
- `index` *(integer, optional)* — offset where the dialog listing should start.

**Returns:** A list of ongoing dialogs including associated context and values.

**Example.** list all ongoing dialogs with context

```opensips
opensips-cli -x mi dlg_list_ctx
```

### `dlg_push_var`

Push or update a dialog value for the given list of dialog IDs / Call-IDs.

**Parameters:**

- `DID` *(string, required)* — dialog identifier. Can be either the $DLG_did or the actual Call-ID.
- `dlg_val_name` *(string, required)* — name of the dialog value that needs to be inserted/updated
- `dlg_val_value` *(string, required)* — value to be inserted/updated

**Returns:** Returns true if the variable was pushed successfully.

**Example.** push or update a dialog variable

```opensips
opensips-cli -x mi dlg_push_var var_name var_value DID1 [ DID2 DID3 ... DIDN ]
```

### `dlg_restore_db`

Restores the dialog table after a potential desynchronization event. The table is truncated, then populated with CONFIRMED dialogs from memory.

**Returns:** Returns true if the restoration was successful.

**Example.** restore dialog table from memory

```opensips
opensips-cli -x mi dlg_restore_db
```

### `dlg_send_sequential`

Sends a sequential request within an ongoing dialog. This functions runs asynchronously and returns the status code and reason of the last reply received for either the challenge or normal mode.

**Parameters:**

- `body` *(string, optional)* — can be used to specify a body for the initial sequential message. Possible values: none, inbound, outbound, custom:CONTENT_TYPE:BODY.
- `callid` *(string, required)* — the callid of the dialog you need to trigger the sequential message for.
- `headers` *(string, optional)* — can be used to specify some headers for the initial sequential message.
- `method` *(string, optional)* — the method used for the sequential message. Default value is INVITE.
- `mode` *(string, optional)* — can be used to tune the behavior of the sequential message. Possible values: caller, callee, challenge, challenge-caller, challenge-callee.

**Returns:** status code and reason of the last reply received

**Example.** send a sequential request

```opensips
opensips-cli -x mi dlg_send_sequential callid=5291231-testing@127.0.0.1
```

**Example.** trigger media re-negotiation

```opensips
opensips-cli -x mi dlg_send_sequential callid=5291231-testing@127.0.0.1 mode=challenge body=inbound
```

**Example.** UPDATE the callee's remote Contact after a server failover

```opensips
opensips-cli -x mi dlg_send_sequential callid=5291231-testing@127.0.0.1 mode=challenge-callee body=outbound method=UPDATE
```

**Example.** send REFER to the callee, and add Refer-To header

```opensips
opensips-cli -x mi dlg_send_sequential callid=usR8FlGOSMfCTAIHebHCOQ.. method=REFER body=none mode=callee headers='Refer-To: sip:user@domain:50060'
```

### `list_all_profiles`

Lists all the dialog profiles, along with 1 or 0 if the given profile has/does not have an associated value.

**Returns:** A list of profiles and their value support status.

**Example.** list all dialog profiles

```opensips
opensips-cli -x mi list_all_profiles
```

### `profile_end_dlgs`

Terminate all ongoing dialogs from a specified profile, on a single dialog it performs the same operations as the command dlg_end_dlg

**Parameters:**

- `profile` *(string, required)* — name of the profile that will have its dialogs termianted
- `value` *(string, optional)* — if the profile supports values terminate only the dialogs with the specified value

**Returns:** Returns true if the command was successful.

**Example.** terminate all dialogs in profile inboundCalls

```opensips
opensips-cli -x mi profile_end_dlgs inboundCalls
```

### `profile_get_size`

Returns the number of dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - how many dialogs were inserted into the profile with a specific value. If not value is passed, only simply belonging of the dialog to the profile is checked. Note that the profile does not supports values, this will be silently discarded.

**Parameters:**

- `profile` *(string, required)* — name of the profile to get the value for.
- `value` *(string, optional)* — string value to toughen the check;

**Returns:** The number of dialogs in the profile.

**Example.** get size of profile inboundCalls

```opensips
opensips-cli -x mi profile_get_size inboundCalls
```

### `profile_get_values`

Lists all the values belonging to a profile along with their count. If the profile does not support values a total count will be returned. Note that this function does not work for shared profiles over the CacheDB interface.

**Parameters:**

- `profile` *(string, required)* — name of the profile to list the dialog for.

**Returns:** A list of values and their respective counts.

**Example.** list values and counts for profile inboundCalls

```opensips
opensips-cli -x mi profile_get_values inboundCalls
```

### `profile_list_dlgs`

Lists all the dialogs belonging to a profile. If the profile supports values, the check can be reinforced to take into account a specific value - list only the dialogs that were inserted into the profile with that specific value. If not value is passed, all dialogs belonging to the profile will be listed. Note that the profile does not supports values, this will be silently discarded. Also, when using shared profiles using the CacheDB interface, this command will only display the local dialogs.

**Parameters:**

- `profile` *(string, required)* — name of the profile to list the dialog for.
- `value` *(string, optional)* — string value to toughen the check;

**Returns:** A list of dialogs belonging to the profile.

**Example.** list dialogs in profile inboundCalls

```opensips
opensips-cli -x mi profile_list_dlgs inboundCalls
```

### `set_dlg_profile`

Set the dialog identified by dialog ID / Call-ID into the given profile ( with optional value and clearing of the old profile values )

**Parameters:**

- `clear_values` *(integer, optional)* — optional, clear previous values in the profile before setting the new one
- `dlg_id` *(string, required)* — dialog ID or Call-ID for the respective dialog
- `profile` *(string, required)* — profile name to be set
- `value` *(string, optional)* — optional, the profile value to be set

**Returns:** Returns true if the profile was set successfully.

**Example.** set dialog profile with value and clear previous values

```opensips
opensips-cli -x mi set_dlg_profile DID my_profile my_value 1
```

### `unset_dlg_profile`

Unsets the dialog identified by dialog ID / Call-ID from the given profile ( with optional value and clearing of the old profile values )

**Parameters:**

- `dlg_id` *(string, required)* — dialog ID or Call-ID for the respective dialog
- `profile` *(string, required)* — profile name to be unset
- `value` *(string, optional)* — optional, the profile value to be unset. for profiles with value, by omitting this parameter you can now clear all values of the given profile.

**Returns:** Returns true if the profile was unset successfully.

**Example.** unset dialog profile

```opensips
opensips-cli -x mi unset_dlg_profile DID my_profile my_value
```

## Exported Statistics

### `active_dialogs`

Returns the number of current active dialogs (may be confirmed or not).

- **Type:** gauge
### `create_recv`

Returns the number of dialog **create** events received from other OpenSIPS instances.

- **Type:** counter
### `create_sent`

Returns the number of replicated dialog **create** requests send to other OpenSIPS instances.

- **Type:** counter
### `delete_recv`

Returns the number of dialog **delete** events received from other OpenSIPS instances.

- **Type:** counter
### `delete_sent`

Returns the number of replicated dialog **delete** requests send to other OpenSIPS instances.

- **Type:** counter
### `early_dialogs`

Returns the number of early dialogs.

- **Type:** gauge
### `expired_dialogs`

Returns the total number of expired dialogs from the startup.

- **Type:** counter
### `failed_dialogs`

Returns the number of failed dialogs ( dialogs were never established due to whatever reasons - internal error, negative reply, cancelled, etc )

- **Type:** counter
### `processed_dialogs`

Returns the total number of processed dialogs (terminated, expired or active) from the startup.

- **Type:** counter
### `update_recv`

Returns the number of dialog **update** events received from other OpenSIPS instances.

- **Type:** counter
### `update_sent`

Returns the number of replicated dialog **update** requests send to other OpenSIPS instances.

- **Type:** counter

## Exported Events

### `E_DLG_STATE_CHANGED`

This event is raised when the dialog state is changed.

**Parameters:**

- `id` *(string)* — the hex representation of the dialog id.
- `db_id` *(integer)* — the integer representation of the dialog id, as it is stored in the database _dlg\_id_ field.
- `callid` *(string)* — the callid.
- `from_tag` *(string)* — the From tag.
- `to_tag` *(string)* — the To tag.
- `old_state` *(string)* — the old state of the dialog.
- `new_state` *(string)* — the new state of the dialog.

## Configuration Examples

### Set `enable_stats` parameter

```opensips
...
modparam("dialog", "enable\_stats", 0)
...
```
### Set `hash_size` parameter

```opensips
...
modparam("dialog", "hash\_size", 1024)
...
```
### Set `hash_size` parameter

```opensips
...
modparam("dialog", "log\_profile\_hash\_size", 5) #set a table size of 32
...
```
### Set `rr_param` parameter

```opensips
...
modparam("dialog", "rr\_param", "xyz")
...
```
### Set `default_timeout` parameter

```opensips
...
modparam("dialog", "default\_timeout", 21600)
...
```
### Set `dlf_extra_hdrs` parameter

```opensips
...
modparam("dialog", "dlg\_extra\_hdrs", "Hint: credit expired\\r\\n")
...
```
### Set `dlg_match_mode` parameter

```opensips
...
modparam("dialog", "dlg\_match\_mode", 0)
...
```
### Set `delete_delay` parameter

```opensips
...
modparam("dialog", "delete\_delay", 10)
...
```
### Set `db_url` parameter

```opensips
...
modparam("dialog", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `db_mode` parameter

```opensips
...
modparam("dialog", "db\_mode", 1)
...
```
### Set `db_update_period` parameter

```opensips
...
modparam("dialog", "db\_update\_period", 120)
...
```
### Set `options_ping_interval` parameter

```opensips
...
modparam("dialog", "options\_ping\_interval", 20)
...
```
### Set `reinvite_ping_interval` parameter

```opensips
...
modparam("dialog", "reinvite\_ping\_interval", 600)
...
```
### Set `table_name` parameter

```opensips
...
modparam("dialog", "table\_name", "my\_dialog")
...
```
### Set `call_id_column` parameter

```opensips
...
modparam("dialog", "call\_id\_column", "callid\_c\_name")
...
```
### Set `from_uri_column` parameter

```opensips
...
modparam("dialog", "from\_uri\_column", "from\_uri\_c\_name")
...
```
### Set `from_tag_column` parameter

```opensips
...
modparam("dialog", "from\_tag\_column", "from\_tag\_c\_name")
...
```
### Set `to_uri_column` parameter

```opensips
...
modparam("dialog", "to\_uri\_column", "to\_uri\_c\_name")
...
```
### Set `to_tag_column` parameter

```opensips
...
modparam("dialog", "to\_tag\_column", "to\_tag\_c\_name")
...
```
### Set `from_cseq_column` parameter

```opensips
...
modparam("dialog", "from\_cseq\_column", "from\_cseq\_c\_name")
...
```
### Set `to_cseq_column` parameter

```opensips
...
modparam("dialog", "to\_cseq\_column", "to\_cseq\_c\_name")
...
```
### Set `from_route_column` parameter

```opensips
...
modparam("dialog", "from\_route\_column", "from\_route\_c\_name")
...
```
### Set `to_route_column` parameter

```opensips
...
modparam("dialog", "to\_route\_column", "to\_route\_c\_name")
...
```
### Set `from_contact_column` parameter

```opensips
...
modparam("dialog", "from\_contact\_column", "from\_contact\_c\_name")
...
```
### Set `to_contact_column` parameter

```opensips
...
modparam("dialog", "to\_contact\_column", "to\_contact\_c\_name")
...
```
### Set `from_sock_column` parameter

```opensips
...
modparam("dialog", "from\_sock\_column", "from\_sock\_c\_name")
...
```
### Set `to_sock_column` parameter

```opensips
...
modparam("dialog", "to\_sock\_column", "to\_sock\_c\_name")
...
```
### Set `dlg_id_column` parameter

```opensips
...
modparam("dialog", "dlg\_id\_column", "dlg\_id\_c\_name")
...
```
### Set `state_column` parameter

```opensips
...
modparam("dialog", "state\_column", "state\_c\_name")
...
```
### Set `start_time_column` parameter

```opensips
...
modparam("dialog", "start\_time\_column", "start\_time\_c\_name")
...
```
### Set `timeout_column` parameter

```opensips
...
modparam("dialog", "timeout\_column", "timeout\_c\_name")
...
```
### Set `profiles_column` parameter

```opensips
...
modparam("dialog", "profiles\_column", "profiles\_c\_name")
...
```
### Set `vars_column` parameter

```opensips
...
modparam("dialog", "vars\_column", "vars\_c\_name")
...
```
### Set `sflags_column` parameter

```opensips
...
modparam("dialog", "sflags\_column", "sflags\_c\_name")
...
```
### Set `mflags_column` parameter

```opensips
...
modparam("dialog", "mflags\_column", "mflags\_c\_name")
...
```
### Set `flags_column` parameter

```opensips
...
modparam("dialog", "flags\_column", "flags\_c\_name")
...
```
### Set `profiles_with_value` parameter

```opensips
...
modparam("dialog", "profiles\_with\_value", "callerCC; gatewayCC; clientChannels/s; codecUsed/b;")
...
```
### Set `profiles_no_value` parameter

```opensips
...
modparam("dialog", "profiles\_no\_value", "inbound ; outbound ; shared/s; repl/b;")
...
```
### Set `db_flush_vals_profiles` parameter

```opensips
...
modparam("dialog", "db\_flush\_vals\_profiles", 1)
...
```
### Set `timer_bulk_del_no` parameter

```opensips
...
modparam("dialog", "timer\_bulk\_del\_no", 10)
...
```
### Set `race_condition_timeout` parameter

```opensips
...
modparam("dialog", "race\_condition\_timeout", 1)
...
```
### Set `cachedb_url` parameter

```opensips
...
modparam("dialog", "cachedb\_url", "redis://127.0.0.1:6379")
...
```
### Set `profile_value_prefix` parameter

```opensips
...
modparam("dialog", "profile\_value\_prefix", "dlgv\_")
...
```
### Set `profile_no_value_prefix` parameter

```opensips
...
modparam("dialog", "profile\_no\_value\_prefix", "dlgnv\_")
...
```
### Set `profile_size_prefix` parameter

```opensips
...
modparam("dialog", "profile\_size\_prefix", "dlgs\_")
...
```
### Set `profile_timeout` parameter

```opensips
...
modparam("dialog", "profile\_timeout", "43200")
...
```
### Set `dialog_replication_cluster` parameter

```opensips
...
modparam("dialog", "dialog\_replication\_cluster", 1)
...
```
### Set `profile_replication_cluster` parameter

```opensips
...
modparam("dialog", "profile\_replication\_cluster", 1)
...
```
### Set `replicate_profiles_buffer` parameter

```opensips
...
modparam("dialog", "replicate\_profiles\_buffer", 500)
...
```
### Set `replicate_profiles_check` parameter

```opensips
...
modparam("dialog", "replicate\_profiles\_check", 100)
...
```
### Set `replicate_profiles_timer` parameter

```opensips
...
modparam("dialog", "replicate\_profiles\_timer", 100)
...
```
### Set `replicate_profiles_expire` parameter

```opensips
...
modparam("dialog", "replicate\_profiles\_expire", 10)
...
```
### Set `cluster_auto_sync` parameter

```opensips
...
modparam("dialog", "cluster\_auto\_sync", 0)
...
```
### `create_dialog()` usage

```opensips
...
create\_dialog();
...
#ping caller
create\_dialog("P");
...
#ping caller and callee
create\_dialog("Pp");

#bye on timeout
create\_dialog("B");
...
```
### `match_dialog()` usage

```opensips
...
    if (has\_totag()) {
        loose\_route();

        # example 1: match according to [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg\_match\_mode (integer)")
        if ($DLG\_status == NULL && !match\_dialog())
            xlog("cannot match request to a dialog\\n");

        # example 2: override [dlg\_match\_mode](#param_dlg_match_mode "1.6.7.�dlg\_match\_mode (integer)")
        if ($DLG\_status == NULL && !match\_dialog("DID\_FALLBACK"))
            xlog("cannot match request to a dialog\\n");
    }
...
```
### `validate_dialog()` usage

```opensips
...
    if (has\_totag()) {
        loose\_route();
        if ($DLG\_status!=NULL && !validate\_dialog() ) {
            xlog(" in-dialog bogus request \\n");
        } else {
            xlog(" in-dialog valid request - $DLG\_dir !\\n");
        }
    }
...
```
### `fix_route_dialog()` usage

```opensips
...
    if (has\_totag()) {
        loose\_route();
        if ($DLG\_status!=NULL)
            if (!validate\_dialog())
                fix\_route\_dialog();
    }
...
```
### `get_dialog_info` usage

```opensips
if ( get\_dialog\_info("callee",$avp(callee\_array),"caller",$fu,$var(dlg\_no)) ) {
	xlog("caller $fu has $var(dlg\_no) other ongoing calls, talking with :");	
	$var(it) = 0;
	while ($var(it) < $var(dlg\_no)) {
		$var(current\_callee) = $(avp(callee\_array)\[$var(it)\]);
		xlog(" $var(current\_callee) ");
		$var(it) = $var(it) + 1;
	}

	xlog("\\n");
}

# create dialog for current call and place the caller and callee attributes
create\_dialog();
$dlg\_val(caller) = $fu;
$dlg\_val(callee) = $ru;
...
```
### `get_dialog_vals` usage

```opensips
if ( get\_dialog\_vals($avp(d\_names),$avp(d\_vals),$var(callid)) ) {
	xlog("the call $var(callid) has the variables:\\n);
	$var(i) = 0;
	while ( $(avp(d\_names)\[$var(i)\])!=NULL ) {
		xlog("var $var(i) is $(avp(d\_names)\[$var(i)\])='$(avp(d\_vals)\[$var(i)\])'\\n");
		$var(i) = $var(i) + 1;
	}
}
...
```
### `get_dialog_vals` usage

```opensips
if ( get\_dialogs\_by\_val("caller",$fU,$avp(dlg\_jsons),$avp(dlg\_no)) ) {
	xlog("Caller $fU has $avp(dlg\_no) other calls \\n);
	$var(i) = 0;
	while ( $(avp(dlg\_jsons)\[$var(i)\])!=NULL ) {
		$json(dlg\_info) := $(avp(dlg\_jsons)\[$var(i)\]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
...
```
### `get_dialog_vals` usage

```opensips
if ( get\_dialogs\_by\_profile("caller",$fU,$avp(dlg\_jsons),$avp(dlg\_no)) ) {
	xlog("Caller $fU has $avp(dlg\_no) other calls \\n);
	$var(i) = 0;
	while ( $(avp(dlg\_jsons)\[$var(i)\])!=NULL ) {
		$json(dlg\_info) := $(avp(dlg\_jsons)\[$var(i)\]); 
		# fetch any info for the above call and process it
		$var(i) = $var(i) + 1;
	}
}
...
```
### `load_dialog_ctx` usage

```opensips
if (load\_dialog\_ctx("$var(callid)")) {
	xlog("The dialog '$var(callid)' already has a duration "
	     "of $DLG\_lifetime seconds\\n");
	if (is\_in\_profile("inboundCall"))
		xlog("this dialog is an inbound call\\n");
	unload\_dialog\_ctx();
}
...
```
### `set_dlg_profile` usage

```opensips
...
set\_dlg\_profile("inboundCall");

# Set a new value (all other values are kept intact)
set\_dlg\_profile("caller", $fu);

# Set a new value while removing all previous values
set\_dlg\_profile("caller", $fu, true);
...
```
### `unset_dlg_profile` usage

```opensips
...
unset\_dlg\_profile("inboundCall");
unset\_dlg\_profile("caller", $fu);
...
# Remove all values in a profile
unset\_dlg\_profile("caller");
...
```
### `is_in_profile` usage

```opensips
...
if (is\_in\_profile("inboundCall")) {
	log("this request belongs to a inbound call\\n");
}
...
if (is\_in\_profile("caller","XX")) {
	log("this request belongs to a call of user XX\\n");
}
...
```
### `get_profile_size` usage

```opensips
modparam("dialog", "profiles\_no\_value", "inboundCalls")
modparam("dialog", "profiles\_with\_value", "caller")
...
get\_profile\_size("inboundCalls",,$var(size));
xlog("inboundCalls: $var(size)\\n");
...
get\_profile\_size("caller", $fu, $var(size));
xlog("currently, the user $fu has $var(size) active outgoing calls\\n");
...
```
### `set_dlg_flag` usage

```opensips
...
set\_dlg\_flag("MY\_DLG\_FLAG");
...
```
### `test_and_set_dlg_flag` usage

```opensips
...
test\_and\_set\_dlg\_flag("MY\_DLG\_FLAG", 0);
...
```
### `reset_dlg_flag` usage

```opensips
...
reset\_dlg\_flag("MY\_DLG\_FLAG");
...
```
### `is_dlg_flag_set` usage

```opensips
...
if (is\_dlg\_flag\_set("MY\_DLG\_FLAG")) {
	xlog("dialog flag MY\_DLG\_FLAG is set\\n");
}
...
```
### `store_dlg_value` usage

```opensips
...
store\_dlg\_value("inv\_src\_ip",$si);
store\_dlg\_value("account type",$var(account));
# or
$dlg\_val(account\_type) = "prepaid";
...
```
### `fetch_dlg_value` usage

```opensips
...
fetch\_dlg\_value("inv\_src\_ip",$avp(2));
fetch\_dlg\_value("account type",$var(account));
# or
$var(account) = $dlg\_val(account\_type);
...
```
### `set_dlg_sharing_tag` usage

```opensips
...
set\_dlg\_sharing\_tag("vip1");
...
```
### `dlg_on_answer` usage

```opensips
...
create\_dialog();
dlg\_on\_answer("dlg\_answered");
...
route[dlg\_answered] {
	xlog("The dialog $DLG\_did was answered\\n");
}
```
### `dlg_on_timeout` usage

```opensips
...
create\_dialog();
$DLG\_timeout=120;
dlg\_on\_timeout("dlg\_timeout");
...
route[dlg\_timeout] {
	xlog("The dialog $DLG\_did timed out\\n");
	if (\_some\_prolongation\_condition)
		$DLG\_timeout = 60; # give it 1 min more
}
```
### `dlg_on_hangup` usage

```opensips
...
create\_dialog();
dlg\_on\_hangup("dlg\_hangup");
...
route[dlg\_hangup] {
	xlog("The dialog $DLG\_did terminated after $DLG\_lifetime secs\\n");
}
```
### `dlg_send_sequential` usage to convert DTMF codes

```opensips
...
event\_route[E\_RTPPROXY\_DTMF] {
    if (load\_dialog\_ctx("$param(id)", "did")) {
        if ($param(stream) == 0) {
            $var(direction) = "callee";
        } else {
            $var(direction) = "caller";
        }
        dlg\_send\_sequential($var(direction), "INFO",
                "Signal=$param(digit)\\nDuration=160",
                "application/dtmf-relay");
        unload\_dialog\_ctx();
    }
}
...
```
### `dlg_inc_cseq` usage

```opensips
...
route {
	...
	if (has\_totag()) {
		if (loose\_route())
			dlg\_inc\_cseq(); # increment upstream CSeq after each in-dialog request
	}
}
...
```
