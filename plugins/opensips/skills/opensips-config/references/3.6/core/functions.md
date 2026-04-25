# Core Functions Reference
<!-- generated-from: data/3.6/core/functions.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: core_function -->

Reference for OpenSIPs 3.6 core script functions. Read this file when looking up the signature, return values, or available-in context for any built-in function not exported by a specific module.

## Contents

- [`add_blacklist_rule([bl_name], ip[, port [, proto [, expire]]])`](#add_blacklist_rulebl_name-ip-port-proto-expire)
- [`add_local_rport()`](#add_local_rport)
- [`append_branch([uri], [qvalue])`](#append_branchuri-qvalue)
- [`append_msg_branch(uri, [qvalue], [flags])`](#append_msg_branchuri-qvalue-flags)
- [`assert(statement, [description])`](#assertstatement-description)
- [`avp_print()`](#avp_print)
- [`break()`](#break)
- [`cache_add(storage_id, attribute, increment, expire, [new_val])`](#cache_addstorage_id-attribute-increment-expire-new_val)
- [`cache_counter_fetch(storage_id, counter_attribute, result)`](#cache_counter_fetchstorage_id-counter_attribute-result)
- [`cache_fetch(storage_id, attribute, result)`](#cache_fetchstorage_id-attribute-result)
- [`cache_raw_query(storage_id, raw_query, result)`](#cache_raw_querystorage_id-raw_query-result)
- [`cache_remove(storage_id, attribute)`](#cache_removestorage_id-attribute)
- [`cache_store(storage_id, attribute, value, [timeout])`](#cache_storestorage_id-attribute-value-timeout)
- [`cache_sub(storage_id, attribute, decrement, expire, [new_val])`](#cache_substorage_id-attribute-decrement-expire-new_val)
- [`check_blacklist_rule([bl_name], ip[, port [, proto]])`](#check_blacklist_rulebl_name-ip-port-proto)
- [`construct_uri(proto,[user],domain,[port],[extra],result)`](#construct_uriprotouserdomainportextraresult)
- [`del_blacklist_rule([bl_name], ip[, port [, proto]])`](#del_blacklist_rulebl_name-ip-port-proto)
- [`drop()`](#drop)
- [`exit()`](#exit)
- [`force_rport()`](#force_rport)
- [`force_send_socket(proto:address[:port])`](#force_send_socketprotoaddressport)
- [`force_tcp_alias([port_alias])`](#force_tcp_aliasport_alias)
- [`forward(destination)`](#forwarddestination)
- [`get_timestamp(sec_avp,usec_avp)`](#get_timestampsec_avpusec_avp)
- [`is_myself(host, [port])`](#is_myselfhost-port)
- [`isbflagset(flag, [branch_idx])`](#isbflagsetflag-branch_idx)
- [`isdsturiset()`](#isdsturiset)
- [`isflagset(string)`](#isflagsetstring)
- [`log([level,] string)`](#loglevel-string)
- [`move_branch([src_idx], [dst_idx] [, keep])`](#move_branchsrc_idx-dst_idx-keep)
- [`next_branches()`](#next_branches)
- [`prefix(str)`](#prefixstr)
- [`pv_printf(pv, fmt_str)`](#pv_printfpv-fmt_str)
- [`raise_event(event, [attrs], [vals])`](#raise_eventevent-attrs-vals)
- [`remove_msg_branch(branch_idx)`](#remove_msg_branchbranch_idx)
- [`resetbflag(flag, [branch_idx])`](#resetbflagflag-branch_idx)
- [`resetdsturi()`](#resetdsturi)
- [`resetflag(flag)`](#resetflagflag)
- [`return(int)`](#returnint)
- [`revert_uri()`](#revert_uri)
- [`route(name [, param1 [, param2 [, ...] ]] )`](#routename-param1-param2)
- [`script_trace([log_level, pv_format_string, [info]])`](#script_tracelog_level-pv_format_string-info)
- [`send(destination [, headers])`](#senddestination-headers)
- [`serialize_branches(clear_previous[, keep_order])`](#serialize_branchesclear_previous-keep_order)
- [`set_advertised_address(adv_addr)`](#set_advertised_addressadv_addr)
- [`set_advertised_port(adv_port)`](#set_advertised_portadv_port)
- [`set_via_handling(flags)`](#set_via_handlingflags)
- [`setbflag(flag, [branch_idx])`](#setbflagflag-branch_idx)
- [`setdsturi(uri)`](#setdsturiuri)
- [`setflag(flag)`](#setflagflag)
- [`sethost(host)`](#sethosthost)
- [`sethostport(hostport)`](#sethostporthostport)
- [`setport(port)`](#setportport)
- [`seturi(str)`](#seturistr)
- [`setuser(user)`](#setuseruser)
- [`setuserpass(pass)`](#setuserpasspass)
- [`sr_check_status( group, [identifier])`](#sr_check_status-group-identifier)
- [`strip(n)`](#stripn)
- [`strip_tail(n)`](#strip_tailn)
- [`subscribe_event(string, string [, int])`](#subscribe_eventstring-string-int)
- [`swap_branches([br1_idx], [br2_idx])`](#swap_branchesbr1_idx-br2_idx)
- [`unuse_blacklist(bl_name)`](#unuse_blacklistbl_name)
- [`use_blacklist(bl_name)`](#use_blacklistbl_name)
- [`xlog([log_level, ]format_string)`](#xloglog_level-format_string)

## `add_blacklist_rule([bl_name], ip[, port [, proto [, expire]]])`

Adds a proto:ip:port+pattern rule to a blacklist.

**Parameters:**

- `bl_name` *(string, required)* — The blacklist name.
- `expire` *(int, optional)* — Expiration time in seconds.
- `ip` *(string, required)* — The IP to add.
- `pattern` *(string, optional)* — The pattern to add.
- `port` *(int, optional)* — The port to add.
- `proto` *(string, optional)* — The protocol to add.

**Usable from:** any_route

**Example.** Adds a rule to the 'filter' blacklist..

```opensips.cfg
add_blacklist_rule("filter", $si, $sp, "udp");
```

## `add_local_rport()`

Add 'rport' parameter to the Via header generated by server (see RFC3581 for its meaning). It affects only the current processed request.

**Usable from:** request_route

**Example.** Adds rport to the generated Via header..

```opensips.cfg
add_local_rport()
```

## `append_branch([uri], [qvalue])`

TO BECOME OBSOLETE, replaced by append_msg_branch(). Adds a new message branch, so it extends the destination set by a new entry. Without parameter, the function copies the current URI into a new branch. With a parameter, the function copies the URI in the parameter into a new branch.

**Parameters:**

- `qvalue` *(string, optional)* — The Q value for the new branch.
- `uri` *(string, optional)* — The SIP URI to append as a branch.

**Usable from:** request_route

**Example.** Copies current URI to a new branch..

```opensips.cfg
append_branch();
```

**Example.** Appends a specific URI as a new branch..

```opensips.cfg
append_branch("sip:user@domain");
```

## `append_msg_branch(uri, [qvalue], [flags])`

Adds a new message branch. The minimal information is the SIP URI of the branch. Optional, a q value may be provided. The 'inherite' optional flag may dictate if the other branch properties are to be inherited from the RURI branch or not.

**Parameters:**

- `flags` *(string, optional)* — Optional flags (e.g., 'inherite').
  - `inherite`
- `qvalue` *(string, optional)* — Optional Q value.
- `uri` *(string, required)* — The SIP URI of the branch.

**Usable from:** request_route

## `assert(statement, [description])`

Only works if enable_asserts is set to true. If the given expression evaluates to false, script execution is stopped and the error_route is executed. If abort_on_assert is enabled, OpenSIPS will also shutdown.

**Parameters:**

- `description` *(string, optional)* — Optional description for the assertion.
- `statement` *(expression, required)* — The expression to evaluate.

**Usable from:** any_route

**Example.** Asserts that the variable value is correct..

```opensips.cfg
$var(i) = "1";
$var(i) += "11";
assert($var(i) == "111");
```

## `avp_print()`

Prints the list with all the AVPs from memory. This is only a helper/debug function.

**Usable from:** any_route

## `break()`

Since v0.10.0-dev3, 'break' can no longer be used to stop the execution of a route. The only place to use is to end a 'case' block in a 'switch' statement. 'return' must be now used instead of old 'break'.

**Usable from:** switch_statement

## `cache_add(storage_id, attribute, increment, expire, [new_val])`

This increments an attribute in a memory-cache-like storage system that supports such an operation. If the attribute does not exit, it will be created with the value of increment.

**Parameters:**

- `attribute` *(string, required)* — The attribute name.
- `expire` *(int, required)* — Expiration time in seconds.
- `increment` *(int, required)* — The value to increment by.
- `new_val` *(var, optional)* — Variable to fetch the new value.
- `storage_id` *(string, required)* — The ID of the storage system.

**Usable from:** any_route

**Example.** Increments a counter in Redis..

```opensips.cfg
cache_add("redis:cluster1", "my_counter", 5, 0);
```

## `cache_counter_fetch(storage_id, counter_attribute, result)`

This function fetches from a memory-cache-like storage system the value of a counter. The result (if any) will be stored in the variable specified by result.

**Parameters:**

- `attribute` *(string, required)* — The counter attribute name.
- `result` *(var, required)* — Variable to store the result.
- `storage_id` *(string, required)* — The ID of the storage system.

**Usable from:** any_route

**Example.** Fetches a counter value..

```opensips.cfg
cache_counter_fetch("local", "my_counter", $var(counter_val));
```

## `cache_fetch(storage_id, attribute, result)`

Fetch the value of an attribute from a memory-cache-like storage system. On a successful fetch, the result will be stored in the variable specified by result_pv.

**Parameters:**

- `attribute` *(string, required)* — The attribute name.
- `result_pv` *(var, required)* — Variable to store the result.
- `storage_id` *(string, required)* — The ID of the storage system.

**Usable from:** any_route

**Example.** Fetches a value into a variable..

```opensips.cfg
cache_fetch("local", "credit_$fU", $var(ret));
```

## `cache_raw_query(storage_id, raw_query, result)`

The function runs the provided raw query (in the back-end dependent language) and returns the results (if any) in the AVP (or AVP list) provided in result.

**Parameters:**

- `raw_query` *(string, required)* — The raw query string.
- `result` *(string, optional)* — Variable to store the result.
- `storage_id` *(string, required)* — The ID of the storage system.

**Usable from:** any_route

**Example.** Runs a raw MongoDB query..

```opensips.cfg
cache_raw_query("mongodb", "{ \"op\" : \"count\",\"query\": { \"username\" : $rU} }", "$avp(mongo_count_result)");
```

## `cache_remove(storage_id, attribute)`

This removes an attribute from a memory-cache-like storage system. Function returns false only if the storage_id is invalid.

**Parameters:**

- `attribute` *(string, required)* — The attribute name.
- `storage_id` *(string, required)* — The ID of the storage system.

**Usable from:** any_route

**Example.** Removes an attribute from local cache..

```opensips.cfg
cache_remove("local", "total_minutes_$fU");
```

## `cache_store(storage_id, attribute, value, [timeout])`

This sets in a memory-cache-like storage system a new value for an attribute. If the attribute does not already exist in the memcache, it will be inserted with the given value; if already present, its value will be replaced with the new one.

**Parameters:**

- `attribute` *(string, required)* — The attribute name.
- `storage_id` *(string, required)* — The ID of the storage system.
- `timeout` *(int, optional)* — Expiration time in seconds.
- `value` *(string, required)* — The value to store.

**Usable from:** any_route

**Example.** Stores a value in local cache with a timeout..

```opensips.cfg
cache_store("local", "total_minutes_$fU", "$avp(mins)", 1200);
```

## `cache_sub(storage_id, attribute, decrement, expire, [new_val])`

This decrements an attribute in a memory-cache-like storage system that supports such an operation.

**Parameters:**

- `attribute` *(string, required)* — The attribute name.
- `decrement` *(int, required)* — The value to decrement by.
- `expire` *(int, required)* — Expiration time in seconds.
- `new_val` *(var, optional)* — Variable to fetch the new value.
- `storage_id` *(string, required)* — The ID of the storage system.

**Usable from:** any_route

**Example.** Decrements a counter in Redis..

```opensips.cfg
cache_sub("redis:cluster1", "my_counter", 5, 0);
```

## `check_blacklist_rule([bl_name], ip[, port [, proto]])`

Checks whether a specific proto:ip:port+pattern matches a blacklist.

**Parameters:**

- `bl_name` *(string, optional)* — The blacklist name.
- `ip` *(string, required)* — The IP to check.
- `pattern` *(string, optional)* — The pattern to check.
- `port` *(int, optional)* — The port to check.
- `proto` *(string, optional)* — The protocol to check.

**Usable from:** any_route

**Example.** Checks if destination matches a blacklist rule..

```opensips.cfg
if (check_blacklist("pstn-gws", $dd, $dp, $dP))
    xlog("REQUEST will be blocked\n");
```

## `construct_uri(proto,[user],domain,[port],[extra],result)`

The function builds a valid sip uri based on the arguments it receives. The result (if any) will be stored in the result AVP variable.

**Parameters:**

- `domain` *(string, required)* — The domain part.
- `extra` *(string, optional)* — Extra parameters (e.g., headers).
- `port` *(string, optional)* — The port part.
- `proto` *(string, required)* — The protocol (e.g., sip, sips).
- `result` *(var, required)* — Variable to store the constructed URI.
- `user` *(string, optional)* — The username part.

**Usable from:** any_route

**Example.** Constructs a SIP URI from components..

```opensips.cfg
construct_uri("$var(proto)", "vlad", "$var(domain)", "", "$var(params)",$avp(s:newuri));
```

## `del_blacklist_rule([bl_name], ip[, port [, proto]])`

Removes a proto:ip:port+pattern rule from a blacklist.

**Parameters:**

- `bl_name` *(string, required)* — The blacklist name.
- `ip` *(string, required)* — The IP to remove.
- `pattern` *(string, optional)* — The pattern to remove.
- `port` *(int, optional)* — The port to remove.
- `proto` *(string, optional)* — The protocol to remove.

**Usable from:** any_route

**Example.** Removes a rule from the 'filter' blacklist..

```opensips.cfg
del_blacklist_rule("filter", $si, $sp, "udp");
```

## `drop()`

Stop the execution of the configuration script and alter the implicit action which is done afterwards. If the function is called in a 'branch_route' then the branch is discarded. If the function is called in a 'onreply_route' then any provisional reply is discarded.

**Usable from:** branch_route, onreply_route

**Example.** Drops 183 Session Progress replies..

```opensips.cfg
onreply_route {
    if($rs=="183") {
        drop();
    }
}
```

## `exit()`

Stop the execution of the configuration script -- it has the same behaviour as return(0). It does not affect the implicit action to be taken after script execution.

**Usable from:** any_route

**Example.** Stops script execution..

```opensips.cfg
exit;
```

## `force_rport()`

Force_rport() adds the rport parameter to the first Via header. Thus, OpenSIPS will add the received IP port to the top most via header in the SIP message, even if the client does not indicate support for rport.

**Usable from:** request_route

**Example.** Adds rport to the top Via header..

```opensips.cfg
force_rport();
```

## `force_send_socket(proto:address[:port])`

Force OpenSIPS to send the message from the specified socket (it must be one of the sockets OpenSIPS listens on).

**Parameters:**

- `socket` *(string, required)* — The socket to send from (proto:address[:port]).

**Usable from:** any_route

**Example.** Forces sending from a specific TCP socket..

```opensips.cfg
force_send_socket("tcp:10.10.10.10:5060");
```

## `force_tcp_alias([port_alias])`

Enables TCP connection reusage (RFC 5923) for the current TLS (or WSS, TCP, WS) connection.

**Parameters:**

- `port_alias` *(int, optional)* — The port alias to use.

**Usable from:** request_route

## `forward(destination)`

Forward the SIP request to the given destination in stateless mode.

**Parameters:**

- `destination` *(string, optional)* — The destination [proto:]host[:port]. If missing, forward is done based on RURI.

**Usable from:** request_route

**Example.** Forwards statelessly to a specific IP..

```opensips.cfg
forward("10.0.0.10:5060");
```

## `get_timestamp(sec_avp,usec_avp)`

Returns the current timestamp, seconds and microseconds of the current second, from a single system call.

**Parameters:**

- `sec_avp` *(var, required)* — Variable to store seconds.
- `usec_avp` *(var, required)* — Variable to store microseconds.

**Usable from:** any_route

**Example.** Gets current timestamp..

```opensips.cfg
get_timestamp($avp(sec),$avp(usec));
```

## `is_myself(host, [port])`

Test if the host and optionally the port represent one of the addresses that OpenSIPS listens on.

**Parameters:**

- `host` *(string, required)* — The host to check.
- `port` *(int, optional)* — The port to check.

**Usable from:** any_route

**Example.** Checks if request is for local processing..

```opensips.cfg
if (is_myself($rd, $rp)
    xlog("the request is for local processing\n");
```

## `isbflagset(flag, [branch_idx])`

Test if a flag is set for a specific branch.

**Parameters:**

- `branch_idx` *(int, optional)* — The branch index (0 for RURI).
- `flag` *(string, required)* — The flag name (static).

**Usable from:** any_route

**Example.** Checks if flag is set on branch 1..

```opensips.cfg
if (isbflagset(1, "NAT_PING"))
    log("flag NAT_PING is set in branch 1\n");
```

## `isdsturiset()`

Test if the dst_uri field (next hop address) is set.

**Usable from:** any_route

**Example.** Checks if dst_uri is set..

```opensips.cfg
if(isdsturiset()) {
    log("dst_uri is set\n");
};
```

## `isflagset(string)`

Test if a flag is set for currently processed message.

**Parameters:**

- `flag` *(string, required)* — The flag name (static).

**Usable from:** any_route

**Example.** Checks if NAT_PING flag is set..

```opensips.cfg
if (isflagset("NAT_PING"))
    log("flag NAT_PING is set\n");
```

## `log([level,] string)`

Write text message to standard error terminal or syslog. You can specify the log level as first parameter.

**Parameters:**

- `level` *(int, optional)* — The log level.
- `string` *(string, required)* — The message to log.

**Usable from:** any_route

**Example.** Logs a text message..

```opensips.cfg
log("just some text message\n");
```

## `move_branch([src_idx], [dst_idx] [, keep])`

Moves the whole information attached to the src_idx branch to the dst_idx branch.

**Parameters:**

- `dst_idx` *(int, optional)* — Destination branch index.
- `keep` *(string, optional)* — If 'keep', the source branch is not removed.
- `src_idx` *(int, optional)* — Source branch index.

**Usable from:** any_route

## `next_branches()`

Adds to the request a new destination set that includes all highest priority class contacts from the serialized branches. Returns 1 if other branches are pending, 2 if last branch, false if nothing done.

**Usable from:** request_route, failure_route

**Example.** Loads next set of serialized branches..

```opensips.cfg
next_branches();
```

## `prefix(str)`

Add the string parameter in front of username in R-URI.

**Parameters:**

- `str` *(string, required)* — The string to prefix.

**Usable from:** request_route

**Example.** Prefixes '00' to the username..

```opensips.cfg
prefix("00");
```

## `pv_printf(pv, fmt_str)`

Prints the formatted string 'fmt_str' in the AVP 'pv'. The 'fmt_str' parameter can include any pseudo-variable defined in OpenSIPS.

**Parameters:**

- `fmt_str` *(string, required)* — The format string.
- `pv` *(var, required)* — The variable to print to.

**Usable from:** any_route

**Example.** Prints formatted string to a variable..

```opensips.cfg
pv_printf($var(x), "r-uri: $ru");
```

## `raise_event(event, [attrs], [vals])`

Raises from script an event through OpenSIPS Event Interface.

**Parameters:**

- `attrs` *(var, optional)* — AVP containing attribute names.
- `event` *(string, required)* — The name of the event.
- `vals` *(var, optional)* — AVP containing attribute values.

**Usable from:** any_route

**Example.** Raises an event with no parameters..

```opensips.cfg
raise_event("E_NO_PARAM");
```

## `remove_msg_branch(branch_idx)`

Removes a given branch. Once a branch is removed, all the subsequent branches are shifted.

**Parameters:**

- `branch_idx` *(int, required)* — The index of the branch to remove.

**Usable from:** any_route

**Example.** Removes a branch at index i..

```opensips.cfg
remove_msg_branch($var(i));
```

## `resetbflag(flag, [branch_idx])`

Reset a flag for a specific branch (unset its value).

**Parameters:**

- `branch_idx` *(int, optional)* — The branch index.
- `flag` *(string, required)* — The flag name (static).

**Usable from:** any_route

**Example.** Resets flag on branch 1..

```opensips.cfg
resetbflag(1, "NAT_PING");
```

## `resetdsturi()`

Set the value of dst_uri filed to NULL. dst_uri field is usually set after loose_route() or lookup("location") if the contact address is behind a NAT.

**Usable from:** any_route

**Example.** Resets the destination URI..

```opensips.cfg
resetdsturi();
```

## `resetflag(flag)`

Reset a flag for currently processed message (unset its value).

**Parameters:**

- `flag` *(string, required)* — The flag name (static).

**Usable from:** any_route

**Example.** Resets the NAT_PING flag..

```opensips.cfg
resetflag("NAT_PING");
```

## `return(int)`

The return() function allows you to return any integer value from a called route() block. return(0) is same as exit().

**Parameters:**

- `int` *(int, required)* — The return code.

**Usable from:** route

**Example.** Returns 1 from the route..

```opensips.cfg
return(1);
```

## `revert_uri()`

Set the R-URI to the value of the R-URI as it was when the request was received by server (undo all changes of R-URI).

**Usable from:** request_route

**Example.** Reverts the Request URI to original..

```opensips.cfg
revert_uri();
```

## `route(name [, param1 [, param2 [, ...] ]] )`

This function is used to run the code from the 'name' route, declared in the script. Optionally, it can receive several parameters (up to 7).

**Parameters:**

- `name` *(string, required)* — The name of the route.
- `param1` *(mixed, optional)* — Optional parameter (int, string, or pvar).
- `param2` *(mixed, optional)* — Optional parameter.

**Usable from:** any_route

**Example.** Executes a route block with optional parameters..

```opensips.cfg
route(HANDLE_SEQUENTIALS);
route(HANDLE_SEQUENTIALS, 1, "param", $var(param));
```

## `script_trace([log_level, pv_format_string, [info]])`

This function start the script tracing - this helps to better understand the flow of execution in the OpenSIPS script.

**Parameters:**

- `info` *(string, optional)* — Tag string for the logs.
- `log_level` *(int, optional)* — The log level.
- `pv_format_string` *(string, optional)* — String of pseudo-variables to trace.

**Usable from:** any_route

**Example.** Enables script tracing with specific variables..

```opensips.cfg
script_trace( 1, "$rm from $si, ruri=$ru", "me");
```

## `send(destination [, headers])`

Send the original SIP message to a specific destination in stateless mode.

**Parameters:**

- `destination` *(string, required)* — The destination [proto:]host[:port].
- `headers` *(string, optional)* — Additional headers to append.

**Usable from:** request_route

**Example.** Sends message statelessly..

```opensips.cfg
send("udp:10.10.10.10:5070");
```

## `serialize_branches(clear_previous[, keep_order])`

Takes all currently added branches for parallel forking and prepares them for serial forking instead.

**Parameters:**

- `clear_previous` *(int, required)* — If non-zero, clears previous serialized branches.
- `keep_order` *(int, optional)* — If non-zero, keeps the order of branches.

**Usable from:** request_route

**Example.** Serializes branches and loads the first set..

```opensips.cfg
serialize_branches(1);
next_branches();
```

## `set_advertised_address(adv_addr)`

Same as 'advertised_address' but it affects only the current message. It has priority if 'advertised_address' is also set.

**Parameters:**

- `adv_addr` *(string, required)* — The advertised address.

**Usable from:** any_route

**Example.** Sets advertised address for current message..

```opensips.cfg
set_advertised_address("opensips.org");
```

## `set_advertised_port(adv_port)`

Same as 'advertised_port' but it affects only the current message. It has priority over 'advertised_port'.

**Parameters:**

- `adv_port` *(string, required)* — The advertised port.

**Usable from:** any_route

**Example.** Sets advertised port for current message..

```opensips.cfg
set_advertised_port("5080");
```

## `set_via_handling(flags)`

Sets Via handling flags for the current message. Note: The source text description appears to be a copy-paste error from sethost; the actual function behavior is defined by the flags parameter.

**Parameters:**

- `flags` *(string, required)* — Comma separated list of named flags.
  - `force-rport`
  - `add-local-rport`
  - `reply-to-via`
  - `force-tcp-alias`

**Usable from:** request_route

**Example.** Enables force-rport and reply-to-via handling..

```opensips.cfg
set_via_handling("force-rport,reply-to-via");
```

## `setbflag(flag, [branch_idx])`

Set a flag for a specific branch.

**Parameters:**

- `branch_idx` *(int, optional)* — The branch index.
- `flag` *(string, required)* — The flag name (static).

**Usable from:** any_route

**Example.** Sets flag on branch 1..

```opensips.cfg
setbflag(1, "NAT_PING");
```

## `setdsturi(uri)`

Explicitely set the dst_uri field to the value of the paramater. The parameter has to be a valid SIP URI.

**Parameters:**

- `uri` *(string, required)* — The SIP URI.

**Usable from:** any_route

**Example.** Sets the destination URI..

```opensips.cfg
setdsturi("sip:10.10.10.10:5090");
```

## `setflag(flag)`

Set a flag for currently processed message.

**Parameters:**

- `flag` *(string, required)* — The flag name (static).

**Usable from:** any_route

**Example.** Sets the NAT_PING flag..

```opensips.cfg
setflag("NAT_PING");
```

## `sethost(host)`

Rewrite the domain part of the R-URI with the value of function's parameter.

**Parameters:**

- `host` *(string, required)* — The new host.

**Usable from:** request_route

**Example.** Sets the host part of R-URI..

```opensips.cfg
sethost("1.3.6.4");
```

## `sethostport(hostport)`

Rewrite the domain part and port of the R-URI with the value of function's parameter.

**Parameters:**

- `hostport` *(string, required)* — The new host:port.

**Usable from:** request_route

**Example.** Sets the host and port part of R-URI..

```opensips.cfg
sethostport("1.3.6.4:5080");
```

## `setport(port)`

Rewrites/sets the port part of the R-URI with the value of function's parameter.

**Parameters:**

- `port` *(string, required)* — The new port.

**Usable from:** request_route

**Example.** Sets the port part of R-URI..

```opensips.cfg
setport("5070");
```

## `seturi(str)`

Rewrite the request URI.

**Parameters:**

- `uri` *(string, required)* — The new URI.

**Usable from:** request_route

**Example.** Sets the Request URI..

```opensips.cfg
seturi("sip:test@opensips.org");
```

## `setuser(user)`

Rewrite the user part of the R-URI with the value of function's parameter.

**Parameters:**

- `user` *(string, required)* — The new username.

**Usable from:** request_route

**Example.** Sets the username part of R-URI..

```opensips.cfg
setuser("newuser");
```

## `setuserpass(pass)`

Rewrite the password part of the R-URI with the value of function's parameter.

**Parameters:**

- `pass` *(string, required)* — The new password.

**Usable from:** request_route

**Example.** Sets the password part of R-URI..

```opensips.cfg
setuserpass("my_secret_passwd");
```

## `sr_check_status( group, [identifier])`

Function to check the status of an 'status/report' identifier. Useful for determining module readiness.

**Parameters:**

- `group` *(string, required)* — The name of the status/report group.
- `identifier` *(string, optional)* — The name of the identifier (NULL, 'all', or specific name).

**Usable from:** any_route

**Example.** Checks status of drouting module..

```opensips.cfg
if (st_check_status( "drouting", "pstn") ) {}
```

## `strip(n)`

Strip the first N-th characters from username of R-URI.

**Parameters:**

- `n` *(int, required)* — Number of characters to strip.

**Usable from:** request_route

**Example.** Strips first 3 characters from username..

```opensips.cfg
strip(3);
```

## `strip_tail(n)`

Strip the last N-th characters from username of R-URI.

**Parameters:**

- `n` *(int, required)* — Number of characters to strip.

**Usable from:** request_route

**Example.** Strips last 3 characters from username..

```opensips.cfg
strip_tail(3);
```

## `subscribe_event(string, string [, int])`

Subscribes an external application for a certain event for the OpenSIPS Event Interface.

**Parameters:**

- `event` *(string, required)* — The name of the event.
- `expire` *(int, optional)* — The expire time of the subscription.
- `socket` *(string, required)* — The socket of the external application.

**Usable from:** startup_route, timer_route

**Example.** Subscribes to an event via RabbitMQ..

```opensips.cfg
subscribe_event("E_PIKE_BLOCKED", "rabbitmq:127.0.0.1/pike");
```

## `swap_branches([br1_idx], [br2_idx])`

Swaps the information between two branches.

**Parameters:**

- `br1_idx` *(int, optional)* — First branch index.
- `br2_idx` *(int, optional)* — Second branch index.

**Usable from:** any_route

## `unuse_blacklist(bl_name)`

Disables the DNS blacklist name received as parameter.

**Parameters:**

- `bl_name` *(string, required)* — The blacklist name.

**Usable from:** any_route

**Example.** Disables the 'pstn-gws' blacklist..

```opensips.cfg
unuse_blacklist("pstn-gws");
```

## `use_blacklist(bl_name)`

Enables the DNS blacklist name received as parameter.

**Parameters:**

- `bl_name` *(string, required)* — The blacklist name.

**Usable from:** any_route

**Example.** Enables the 'pstn-gws' blacklist..

```opensips.cfg
use_blacklist("pstn-gws");
```

## `xlog([log_level, ]format_string)`

Allows various debugging / runtime / critical messages to be printed as the execution of the OpenSIPS script is done.

**Parameters:**

- `format_string` *(string, required)* — The format string to log.
- `log_level` *(int, optional)* — The log level (e.g., L_ERR, L_INFO).

**Usable from:** any_route

**Example.** Logs a message with pseudo-variables..

```opensips.cfg
xlog("Received $rm from $fu (callid: $ci)\n");
```
