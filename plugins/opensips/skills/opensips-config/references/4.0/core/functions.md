# Core Functions Reference
<!-- generated-from: data/4.0/core/functions.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: core_function -->

Reference for OpenSIPs 4.0 core script functions. Read this file when looking up the signature, return values, or available-in context for any built-in function not exported by a specific module.

## Contents

- [`add_blacklist_rule([bl_name], ip[, port [, proto [, expire]]])`](#add_blacklist_rulebl_name-ip-port-proto-expire)
- [`add_local_rport()`](#add_local_rport)
- [`append_branch([uri], [qvalue])`](#append_branchuri-qvalue)
- [`append_msg_branch(uri, [qvalue], [flags])`](#append_msg_branchuri-qvalue-flags)
- [`assert(statement, [description])`](#assertstatement-description)
- [`avp_print()`](#avp_print)
- [`break()`](#break)
- [`cache_add( storage_id, attribute, increment, expire, [new_val])`](#cache_add-storage_id-attribute-increment-expire-new_val)
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
- [`route(name [, param1 [, param2 [, ...] ] ] )`](#routename-param1-param2)
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
- [`socket_belongs_to_bond( socket, bond)`](#socket_belongs_to_bond-socket-bond)
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

- `bl_name` *(string, optional)* — the blacklist to add the rule to
- `expire` *(integer, optional)* — expiration time in seconds
- `ip` *(string, required)* — the IP to add
- `pattern` *(string, optional)* — the pattern to add
- `port` *(integer, optional)* — the port to add
- `proto` *(string, optional)* — the protocol to add

**Usable from:** all

**Example.** Example of usage.

```opensips
add_blacklist_rule("filter", $si, $sp, "udp");
```

## `add_local_rport()`

Add 'rport' parameter to the Via header generated by server (see RFC3581 for its meaning). It affects only the current processed request.

**Usable from:** request

**Example.** Example of usage.

```opensips
add_local_rport()
```

## `append_branch([uri], [qvalue])`

TO BECOME OBSOLETE, replaced by append_msg_branch(). Adds a new message branch, so it extends the destination set by a new entry. The difference is that current URI is taken as new entry.

**Parameters:**

- `qvalue` *(string, optional)* — q value
- `uri` *(string, optional)* — URI to copy into a new branch

**Usable from:** request, failure_route

**Example.** Example of usage.

```opensips
# if someone calls B, the call should be forwarded to C too.
#
if ($rm=="INVITE" && $ru=~"sip:B@xx.xxx.xx ")
{
    # copy the current branch (branches[0]) into
    # a new branch (branches[1])
    append_branch();
    # all URI manipulation functions work on branches[0]
    # thus, URI manipulation does not touch the 
    # appended branch (branches[1])
    seturi("sip:C@domain");

    # now: branch 0 = C@domain
    #      branch 1 = B@xx.xx.xx.xx

    # and if you need a third destination ...

    # copy the current branch (branches[0]) into
    # a new branch (branches[2])
    append_branch();

    # all URI manipulation functions work on branches[0]
    # thus, URI manipulation does not touch the 
    # appended branch (branches[1-2])
    seturi("sip:D@domain");

    # now: branch 0 = D@domain
    #      branch 1 = B@xx.xx.xx.xx
    #      branch 2 = C@domain

    t_relay();
    exit;
};

# You could also use append_branch("sip:C@domain") which adds a branch with the new URI:

if(method=="INVITE" && uri=~"sip:B@xx.xxx.xx ") {
    # append a new branch with the second destination
    append_branch("sip:user@domain");
    # now: branch 0 = B@xx.xx.xx.xx
    # now: branch 1 = C@domain

    t_relay();
    exit;
}
```

## `append_msg_branch(uri, [qvalue], [flags])`

Adds a new message branch. The minimal information is the SIP URI of the branch. Optional, a q value may be provided. The "inherite" optional flag may dictate if the other branch properties (duri, q, path, socket, bflags) are to be inherited from the RURI branch or not.

**Parameters:**

- `flags` *(string, optional)* — The 'inherite' optional flag may dictate if the other branch properties are to be inherited from the RURI branch or not.
- `qvalue` *(string, optional)* — q value
- `uri` *(string, required)* — SIP URI of the branch

**Usable from:** request

## `assert(statement, [description])`

Only works if enable_asserts is set to true. If the given expression evaluates to false, script execution is stopped and the error_route is executed. If abort_on_assert is enabled, OpenSIPS will also shutdown.

**Parameters:**

- `description` *(string, optional)* — Description of the assertion
- `statement` *(expression, required)* — Expression to evaluate

**Usable from:** all

**Example.** Example of usage.

```opensips
$var(i) = "1";
$var(i) += "11";
assert($var(i) == "111");

$var(i) = 1;
$var(i) += 11;
assert($var(i) == 12);

assert($ua != "friendly-scanner", "Forbidden UA: \"friendly-scanner\"");
```

## `avp_print()`

Prints the list with all the AVPs from memory. This is only a helper/debug function.

**Usable from:** all

## `break()`

Since v0.10.0-dev3, 'break' can no longer be used to stop the execution of a route. The only place to use is to end a 'case' block in a 'switch' statement. 'return' must be now used instead of old 'break'.

**Usable from:** switch

## `cache_add( storage_id, attribute, increment, expire, [new_val])`

This increments an attribute in a memory-cache-like storage system that supports such an operation. If the attribute does not exit, it will be created with the value of increment. Function returns false if increment fails.

**Parameters:**

- `attribute` *(string, required)* — Attribute name
- `expire` *(int, required)* — if greater than 0, the key will also expire in the specified number of seconds
- `increment` *(int, required)* — Increment value
- `new_val` *(var, optional)* — variable in which to fetch the new value of the counter
- `storage_id` *(string, required)* — Storage ID

**Usable from:** all

**Example.** Example of usage.

```opensips
modparam("cachedb_redis", "cachedb_url", "redis:cluster1://194.068.4.034:6379/")
...
cache_add("redis:cluster1", "my_counter", 5, 0);
```

## `cache_counter_fetch(storage_id, counter_attribute, result)`

This function fetches from a memory-cache-like storage system the value of a counter. The result (if any) will be stored in the variable specified by result. Function returns true if the attribute was found and its value returned.

**Parameters:**

- `counter_attribute` *(string, required)* — Attribute name
- `result` *(var, required)* — Variable to store the result
- `storage_id` *(string, required)* — Storage ID

**Usable from:** all

**Example.** Example of usage.

```opensips
cache_counter_fetch("local", "my_counter", $var(counter_val));

OR

modparam("cachedb_redis", "cachedb_url", "redis:cluster1://194.068.4.034:6379/")
...
cache_fetch("redis:cluster1", "my_counter", $var(redis_counter_val));
```

## `cache_fetch(storage_id, attribute, result)`

Fetch the value of an attribute from a memory-cache-like storage system. On a successful fetch, the result will be stored in the variable specified by result_pv. Function returns true if the attribute was found and its value successfully returned.

**Parameters:**

- `attribute` *(string, required)* — Attribute name
- `result` *(var, required)* — Variable to store the result
- `storage_id` *(string, required)* — Storage ID

**Usable from:** all

**Example.** Example of usage.

```opensips
cache_fetch("local", "credit_$fU", $var(ret));

OR

modparam("cachedb_redis", "cachedb_url", "redis:cluster1://194.068.4.034:6379/")
...
cache_fetch("redis:cluster1", "credit_$fU", $var(ret));
```

## `cache_raw_query(storage_id, raw_query, result)`

The function runs the provided raw query (in the back-end dependent language) and returns the results (if any) in the AVP (or AVP list) provided in result. Function returns false if query fails.

**Parameters:**

- `raw_query` *(string, required)* — Raw query string
- `result` *(string, optional)* — AVP (or AVP list) to store results
- `storage_id` *(string, required)* — Storage ID

**Usable from:** all

**Example.** Example of usage.

```opensips
...
cache_raw_query("mongodb", "{ \"op\" : \"count\",\"query\": { \"username\" : $rU} }", "$avp(mongo_count_result)");
...
```

## `cache_remove(storage_id, attribute)`

This removes an attribute from a memory-cache-like storage system. Function returns false only if the storage_id is invalid.

**Parameters:**

- `attribute` *(string, required)* — Attribute name
- `storage_id` *(string, required)* — Storage ID

**Usable from:** all

**Example.** Example of usage.

```opensips
cache_remove("local", "total_minutes_$fU");

OR

modparam("cachedb_redis", "cachedb_url", "redis:cluster1://194.068.4.034:6379/")
...
cache_remove("redis:cluster1", "total_minutes_$fU");
```

## `cache_store(storage_id, attribute, value, [timeout])`

This sets in a memory-cache-like storage system a new value for an attribute. If the attribute does not already exist in the memcache, it will be inserted with the given value; if already present, its value will be replaced with the new one. Function returns true if the new attribute was successfully inserted.

**Parameters:**

- `attribute` *(string, required)* — Attribute name
- `storage_id` *(string, required)* — Storage ID
- `timeout` *(int, optional)* — Timeout or lifetime value
- `value` *(string, required)* — Value to store

**Usable from:** all

**Example.** Example of usage.

```opensips
cache_store("local", "total_minutes_$fU", "$avp(mins)", 1200);

OR

modparam("cachedb_redis", "cachedb_url", "redis:cluster1://194.068.4.034:6379/")
...
cache_store("redis:cluster1", "passwd_$tu", "$var(x)");
```

## `cache_sub(storage_id, attribute, decrement, expire, [new_val])`

This decrements an attribute in a memory-cache-like storage system that supports such an operation. Function returns false if decrement fails.

**Parameters:**

- `attribute` *(string, required)* — Attribute name
- `decrement` *(int, required)* — Decrement value
- `expire` *(int, required)* — if greater than 0, the key will also expire in the specified number of seconds
- `new_val` *(var, optional)* — variable in which to fetch the new value of the counter
- `storage_id` *(string, required)* — Storage ID

**Usable from:** all

**Example.** Example of usage.

```opensips
modparam("cachedb_redis", "cachedb_url", "redis:cluster1://194.068.4.034:6379/")
...
cache_sub("redis:cluster1", "my_counter", 5, 0);
```

## `check_blacklist_rule([bl_name], ip[, port [, proto]])`

Checks whether a specific proto:ip:port+pattern matches a blacklist, or all if bl_name is not specified.

**Parameters:**

- `bl_name` *(string, optional)* — if missing, the rule is matched against all used blacklists
- `ip` *(string, required)* — the IP to check against
- `pattern` *(string, optional)* — the pattern to check against
- `port` *(integer, optional)* — the port to check against
- `proto` *(string, optional)* — the protocol to check against

**Usable from:** all

**Example.** Example of usage.

```opensips
if (check_blacklist("pstn-gws", $dd, $dp, $dP))
    xlog("REQUEST will be blocked\n");
```

## `construct_uri(proto,[user],domain,[port],[extra],result)`

The function builds a valid sip uri based on the arguments it receives. The result (if any) will be stored in the result AVP variable.

**Parameters:**

- `domain` *(string, required)* — Domain part
- `extra` *(string, optional)* — Extra parameters
- `port` *(string, optional)* — Port part
- `proto` *(string, required)* — Protocol
- `result` *(var, required)* — Result AVP variable
- `user` *(string, optional)* — User part

**Usable from:** all

**Example.** Example usage.

```opensips
construct_uri("$var(proto)", "vlad", "$var(domain)", "", "$var(params)",$avp(s:newuri));
xlog("Constructed URI is <$avp(s:newuri)> \n");
```

## `del_blacklist_rule([bl_name], ip[, port [, proto]])`

Removes a proto:ip:port+pattern rule from a blacklist.

**Parameters:**

- `bl_name` *(string, optional)* — the blacklist to remove the rule from
- `ip` *(string, required)* — the IP to remove
- `pattern` *(string, optional)* — the pattern to remove
- `port` *(integer, optional)* — the port to remove
- `proto` *(string, optional)* — the protocol to remove

**Usable from:** all

**Example.** Example of usage.

```opensips
del_blacklist_rule("filter", $si, $sp, "udp");
```

## `drop()`

Stop the execution of the configuration script and alter the implicit action which is done afterwards. If the function is called in a 'branch_route' then the branch is discarded. If the function is called in a 'onreply_route' then any provisional reply is discarded.

**Usable from:** branch_route, onreply_route

**Example.** Example of usage.

```opensips
onreply_route {
    if($rs=="183") {
        drop();
    }
}
```

## `exit()`

Stop the execution of the configuration script -- it has the same behaviour as return(0). It does not affect the implicit action to be taken after script execution.

**Usable from:** all

**Example.** Example of usage.

```opensips
route {
  if (route(2)) {
    xlog("L_NOTICE","method $rm is INVITE\n");
  } else {
    xlog("L_NOTICE","method is $rm\n");
  };
}

route[2] {
  if (is_method("INVITE")) {
    return(1);
  } else if (is_method("REGISTER")) {
    return(-1);
  } else if (is_method("MESSAGE")) {
    sl_send_reply("403","IM not allowed");
    exit;
  };
}
```

## `force_rport()`

Force_rport() adds the rport parameter to the first Via header. Thus, OpenSIPS will add the received IP port to the top most via header in the SIP message, even if the client does not indicate support for rport.

**Usable from:** request

**Example.** Example of usage.

```opensips
force_rport();
```

## `force_send_socket(proto:address[:port])`

Force OpenSIPS to send the message from the specified socket (it _must_ be one of the sockets OpenSIPS listens on). If the protocol doesn't match the closest socket of the same protocol is used.

**Parameters:**

- `socket` *(string, required)* — Socket definition

**Usable from:** all

**Example.** Example of usage.

```opensips
force_send_socket("tcp:10.10.10.10:5060");
```

## `force_tcp_alias([port_alias])`

Enables TCP connection reusage (RFC 5923) for the current TLS (or WSS, TCP, WS) connection (source IP + source port + transport), regardless if the Via header field contains an ";alias" parameter or not.

**Parameters:**

- `port_alias` *(int, optional)* — Port alias

**Usable from:** all

## `forward(destination)`

Forward the SIP request to the given destination in stateless mode. This has the format of [proto:]host[:port].

**Parameters:**

- `destination` *(string, optional)* — if missing, the forward will be done based on RURI.

**Usable from:** request

**Example.** Example of usage.

```opensips
forward("10.0.0.10:5060");
#or
forward();
```

## `get_timestamp(sec_avp,usec_avp)`

Returns the current timestamp, seconds and microseconds of the current second, from a single system call.

**Parameters:**

- `sec_avp` *(var, required)* — Seconds AVP
- `usec_avp` *(var, required)* — Microseconds AVP

**Usable from:** all

**Example.** Example of usage.

```opensips
get_timestamp($avp(sec),$avp(usec));
```

## `is_myself(host, [port])`

Test if the host and optionally the port represent one of the addresses that OpenSIPS listens on.

**Parameters:**

- `host` *(string, required)* — Host to test
- `port` *(int, optional)* — Port to test

**Usable from:** all

**Example.** Example of usage.

```opensips
if (is_myself($rd, $rp)
    xlog("the request is for local processing\n");
```

## `isbflagset(flag, [branch_idx])`

Test if a flag is set for a specific branch. "branch_idx" identifies the branch for which the flags are tested - it must be a positive number.

**Parameters:**

- `branch_idx` *(int, optional)* — Branch index
- `flag` *(string, required)* — Flag to test

**Usable from:** all

**Example.** Example of usage.

```opensips
if (isbflagset(1, "NAT_PING"))
    log("flag NAT_PING is set in branch 1\n");
```

## `isdsturiset()`

Test if the dst_uri field (next hop address) is set.

**Usable from:** all

**Example.** Example of usage.

```opensips
if(isdsturiset()) {
    log("dst_uri is set\n");
};
```

## `isflagset(string)`

Test if a flag is set for currently processed message.

**Parameters:**

- `flag` *(string, required)* — Flag to test

**Usable from:** all

**Example.** Example of usage.

```opensips
if (isflagset("NAT_PING"))
    log("flag NAT_PING is set\n");
```

## `log([level,] string)`

Write text message to standard error terminal or syslog. You can specify the log level as first parameter.

**Parameters:**

- `level` *(int, optional)* — Log level
- `string` *(string, required)* — Text message

**Usable from:** all

**Example.** Example of usage.

```opensips
log("just some text message\n");
```

## `move_branch([src_idx], [dst_idx] [, keep])`

Moves the whole information attached to the src_idx branch to the dst_idx branch.

**Parameters:**

- `dst_idx` *(int, optional)* — Destination branch index
- `keep` *(string, optional)* — If 'keep', the branch is not removed, only copied
- `src_idx` *(int, optional)* — Source branch index

**Usable from:** all

## `next_branches()`

Adds to the request a new destination set that includes all highest priority class contacts ('q' value based) from the serialized branches (see serialize_branches()). Returns true if at least one contact was added for the request's destination set - returns 1 if other branches are still pending and return 2 if no other branches are left for future processing.

**Usable from:** route, failure_route

**Example.** Example of usage.

```opensips
next_branches();
```

## `prefix(str)`

Add the string parameter in front of username in R-URI.

**Parameters:**

- `str` *(string, required)* — Prefix string

**Usable from:** request

**Example.** Example of usage.

```opensips
prefix("00");
```

## `pv_printf(pv, fmt_str)`

Prints the formatted string 'fmt_str' in the AVP 'pv'. The 'fmt_str' parameter can include any pseudo-variable defined in OpenSIPS.

**Parameters:**

- `fmt_str` *(string, required)* — Formatted string
- `pv` *(var, required)* — Pseudo-variable

**Usable from:** all

**Example.** Example of usage.

```opensips
pv_printf($var(x), "r-uri: $ru");
pv_printf($avp(i:3), "from uri: $fu");
```

## `raise_event(event, [attrs], [vals])`

Raises from script an event through OpenSIPS Event Interface. This function triggers an event for all subscribers for that event, regardless the transport module used.

**Parameters:**

- `attrs` *(var, optional)* — AVP containing the the names of the attributes
- `event` *(string, required)* — the name of the event which should be raised
- `vals` *(var, optional)* — AVP containing values attached to the event

**Usable from:** all

**Example.** Example of usage (raises an event with no attributes).

```opensips
raise_event("E_NO_PARAM");
```

**Example.** Example of usage (raises an event with two attributes).

```opensips
$avp(attr-name) = "param1";
$avp(attr-name) = "param2";
$avp(attr-val) = 1;
$avp(attr-val) = "2";
raise_event("E_TWO_PARAMS", $avp(attr-name), $avp(attr-val));
```

**Example.** Example of usage (raises an event with two unnamed attributes).

```opensips
$avp(attr-val) = 1;
$avp(attr-val) = "2";
raise_event("E_TWO_PARAMS", , $avp(attr-val));
```

## `remove_msg_branch(branch_idx)`

Removes a given branch. Once a branch is removed, all the subsequent branches are shifted.

**Parameters:**

- `branch_idx` *(int, required)* — Branch index

**Usable from:** all

**Example.** Example of usage (remove all branches with URI hostname "127.0.0.1").

```opensips
$var(i) = 0;
while ($(branch(uri)[$var(i)]) != null) {
   xlog("L_INFO","$$(branch(uri)[$var(i)])=[$(branch(uri)[$var(i)])]\n");
   if ($(branch(uri)[$var(i)]{uri.host}) == "127.0.0.1") {
       xlog("L_INFO","removing branch $var(i) with URI=[$(branch(uri)[$var(i)])]\n");
       remove_msg_branch($var(i));
   } else {
       $var(i) = $var(i) + 1;
   }
}
```

## `resetbflag(flag, [branch_idx])`

Reset a flag for a specific branch (unset its value). "branch_idx" identifies the branch for which the flag is reset - it must be a positive number.

**Parameters:**

- `branch_idx` *(int, optional)* — Branch index
- `flag` *(string, required)* — Flag to reset

**Usable from:** all

**Example.** Example of usage.

```opensips
resetbflag(1, "NAT_PING");
# or
resetbflag("NAT_PING"); # same as resetbflag(0, "NAT_PING")
```

## `resetdsturi()`

Set the value of dst_uri filed to NULL. dst_uri field is usually set after loose_route() or lookup("location") if the contact address is behind a NAT.

**Usable from:** all

**Example.** Example of usage.

```opensips
resetdsturi();
```

## `resetflag(flag)`

Reset a flag for currently processed message (unset its value).

**Parameters:**

- `flag` *(string, required)* — Flag to reset

**Usable from:** all

**Example.** Example of usage.

```opensips
resetflag("NAT_PING");
```

## `return(int)`

The return() function allows you to return any integer value from a called route() block. You can test the value returned by a route using "$retcode" variable.

**Parameters:**

- `int` *(int, required)* — Integer value to return

**Usable from:** route

**Example.** Example usage.

```opensips
route {
  if (route(2)) {
    xlog("L_NOTICE","method $rm is INVITE\n");
  } else {
    xlog("L_NOTICE","method $rm is REGISTER\n");
  };
}

route[2] {
  if (is_method("INVITE")) {
    return(1);
  } else if (is_method("REGISTER")) {
    return(-1);
  } else {
    return(0);
  };
}
```

## `revert_uri()`

Set the R-URI to the value of the R-URI as it was when the request was received by server (undo all changes of R-URI).

**Usable from:** request

**Example.** Example of usage.

```opensips
revert_uri();
```

## `route(name [, param1 [, param2 [, ...] ] ] )`

This function is used to run the code from the 'name' route, declared in the script. Optionally, it can receive several parameters (up to 7), that can be later retrieved using the '$param(idx)' pseudo-variable.

**Parameters:**

- `name` *(string, required)* — Route name
- `param1` *(any, optional)* — Optional parameter

**Usable from:** all

**Example.** Example of usage.

```opensips
route(HANDLE_SEQUENTIALS);
route(HANDLE_SEQUENTIALS, 1, "param", $var(param));
```

## `script_trace([log_level, pv_format_string, [info]])`

This function start the script tracing - this helps to better understand the flow of execution in the OpenSIPS script, like what function is executed, what line it is, etc.

**Parameters:**

- `info` *(string, optional)* — Info string
- `log_level` *(int, optional)* — Log level
- `pv_format_string` *(string, optional)* — Format string for pseudo-variables

**Usable from:** all

**Example.** Example of usage.

```opensips
script_trace( 1, "$rm from $si, ruri=$ru", "me");
```

## `send(destination [, headers])`

Send the original SIP message to a specific destination in stateless mode. This is definied as [proto:]host[:port].

**Parameters:**

- `destination` *(string, required)* — Destination string
- `headers` *(string, optional)* — Headers string

**Usable from:** all

**Example.** Example of usage.

```opensips
send("udp:10.10.10.10:5070");
send("udp:10.10.10.10:5070", "Server: opensips\r\n");
```

## `serialize_branches(clear_previous[, keep_order])`

Takes all currently added branches for parallel forking (e.g. with lookup() or append_branch()), as well as the current branch (R-URI ($ru) / outbound Proxy ($du) / q value ($ru_q) / branch flags / forced Path headers / forced send socket), and prepares them for serial forking instead.

**Parameters:**

- `clear_previous` *(int, required)* — if set to non-zero, all previous results... will be deleted
- `keep_order` *(int, optional)* — if set to non-zero, the added branches... will be serialized exactly in the order in which they are found.

**Usable from:** all

**Example.** Example of usage.

```opensips
if (!lookup("location")) {
    t_reply("480", "Temporarily Unavailable");
    exit;
}

serialize_branches(1);
next_branches(); # Pop the R-URI from the serialized branches set
```

## `set_advertised_address(adv_addr)`

Same as 'advertised_address' but it affects only the current message. It has priority if 'advertised_address' is also set.

**Parameters:**

- `adv_addr` *(string, required)* — Advertised address

**Usable from:** all

**Example.** Example of usage.

```opensips
set_advertised_address("opensips.org");
```

## `set_advertised_port(adv_port)`

Same as 'advertised_port' but it affects only the current message. It has priority over 'advertised_port'.

**Parameters:**

- `adv_port` *(string, required)* — Advertised port

**Usable from:** all

**Example.** Example of usage.

```opensips
set_advertised_port("5080");
```

## `set_via_handling(flags)`

Rewrite the domain part of the R-URI with the value of function's parameter. Other parts of the R-URI like username, port and URI parameters remain unchanged.

**Parameters:**

- `flags` *(string, required)* — a comma separated list of named flags
  - `force-rport`
  - `add-local-rport`
  - `reply-to-via`
  - `force-tcp-alias`

**Usable from:** all

**Example.** Example of usage.

```opensips
set_via_handling("force-rport,reply-to-via");
```

## `setbflag(flag, [branch_idx])`

Set a flag for a specific branch. "branch_idx" identifies the branch for which the flag is set - it must be a positive number.

**Parameters:**

- `branch_idx` *(int, optional)* — Branch index
- `flag` *(string, required)* — Flag to set

**Usable from:** all

**Example.** Example of usage.

```opensips
setbflag(1, "NAT_PING");
# or
setbflag("NAT_PING"); # same as setbflag(0, "NAT_PING")
```

## `setdsturi(uri)`

Explicitely set the dst_uri field to the value of the paramater. The parameter has to be a valid SIP URI.

**Parameters:**

- `uri` *(string, required)* — Valid SIP URI

**Usable from:** all

**Example.** Example of usage.

```opensips
setdsturi("sip:10.10.10.10:5090");
```

## `setflag(flag)`

Set a flag for currently processed message. The flags are used to mark the message for special processing (e.g. pinging NAT'ed contacts, TCP connect behavior, etc.) or to keep some state (e.g. message authenticated).

**Parameters:**

- `flag` *(string, required)* — Flag to set

**Usable from:** all

**Example.** Example of usage.

```opensips
setflag("NAT_PING");
```

## `sethost(host)`

Rewrite the domain part of the R-URI with the value of function's parameter. Other parts of the R-URI like username, port and URI parameters remain unchanged.

**Parameters:**

- `host` *(string, required)* — Host string

**Usable from:** request

**Example.** Example of usage.

```opensips
sethost("1.4.0.4");
```

## `sethostport(hostport)`

Rewrite the domain part and port of the R-URI with the value of function's parameter. Other parts of the R-URI like username and URI parameters remain unchanged.

**Parameters:**

- `hostport` *(string, required)* — Host and port string

**Usable from:** request

**Example.** Example of usage.

```opensips
sethostport("1.4.0.4:5080");
```

## `setport(port)`

Rewrites/sets the port part of the R-URI with the value of function's parameter.

**Parameters:**

- `port` *(string, required)* — Port string

**Usable from:** request

**Example.** Example of usage.

```opensips
setport("5070");
```

## `seturi(str)`

Rewrite the request URI.

**Parameters:**

- `uri` *(string, required)* — URI string

**Usable from:** request

**Example.** Example of usage.

```opensips
seturi("sip:test@opensips.org");
```

## `setuser(user)`

Rewrite the user part of the R-URI with the value of function's parameter.

**Parameters:**

- `user` *(string, required)* — User string

**Usable from:** request

**Example.** Example of usage.

```opensips
setuser("newuser");
```

## `setuserpass(pass)`

Rewrite the password part of the R-URI with the value of function's parameter.

**Parameters:**

- `pass` *(string, required)* — Password string

**Usable from:** request

**Example.** Example of usage.

```opensips
setuserpass("my_secret_passwd");
```

## `socket_belongs_to_bond( socket, bond)`

This function checks if a SIP socket is part of a certain bond socket (see the definition of a bond socket).

**Parameters:**

- `bond` *(string, required)* — the name of a bond socket
- `socket` *(string, required)* — a socket defintion like 'proto:ip:port'

**Usable from:** all

**Example.** Example of usage.

```opensips
if (socket_belongs_to_bond( $si, "internal") {
  # came from internal, must go to external
  $socket_out = "bond:external";
} else
if (socket_belongs_to_bond( $si, "external") {
  # came from external, must go to internal
  $socket_out = "bond:internal";
} else {
   send_reply(403,"Forbidden");
   exit;
}
```

## `sr_check_status( group, [identifier])`

Function to check the status of an 'status/report' identifier. Such checking is very useful for determining at script level the readiness of a module or core component (if able to provide its full functionality).

**Parameters:**

- `group` *(string, required)* — the name of the 'status/report' group
- `identifier` *(string, optional)* — the name of the identifier to be checked

**Usable from:** all

**Example.** Example of usage.

```opensips
# check if the "pstn" identifier (the "pstn" partition) from "drouting" module is ready (data is fully loaded)
if (st_check_status( "drouting", "pstn") ) {}

# check if the all identifiers (all partitions) from "drouting" module are ready (data is fully loaded)
if (st_check_status( "drouting", "all") ) {}
```

## `strip(n)`

Strip the first N-th characters from username of R-URI (N is the value of the parameter).

**Parameters:**

- `n` *(int, required)* — Number of characters to strip

**Usable from:** request

**Example.** Example of usage.

```opensips
strip(3);
```

## `strip_tail(n)`

Strip the last N-th characters from username of R-URI (N is the value of the parameter).

**Parameters:**

- `n` *(int, required)* — Number of characters to strip

**Usable from:** request

**Example.** Example of usage.

```opensips
strip_tail(3);
```

## `subscribe_event(string, string [, int])`

Subscribes an external application for a certain event for the OpenSIPS Event Interface. This is used for transport protocols that cannot subscribe by themselves (example event_rabbitmq).

**Parameters:**

- `event` *(string, required)* — the name of the event an external application should be notified for.
- `expire` *(int, optional)* — the expire time of the subscription.
- `socket` *(string, required)* — the socket of the external application.

**Usable from:** startup_route, timer_route

**Example.** Example of usage (subscriber that never expires, notified by the RabbitMQ module).

```opensips
startup_route {
    subscribe_event("E_PIKE_BLOCKED", "rabbitmq:127.0.0.1/pike");
}
```

**Example.** Example of usage (subscriber expires every 5 seconds, notified through UDP).

```opensips
timer_route[event_subscribe, 4] {
    subscribe_event("E_PIKE_BLOCKED", "udp:127.0.0.1:5051", 5);
}
```

## `swap_branches([br1_idx], [br2_idx])`

Swaps the information between two branches, represented by the br1_idx and br2_idx. Both values should be an integer value and should represent a valid branch index.

**Parameters:**

- `br1_idx` *(int, optional)* — Branch 1 index
- `br2_idx` *(int, optional)* — Branch 2 index

**Usable from:** all

## `unuse_blacklist(bl_name)`

Disables the DNS blacklist name received as parameter.

**Parameters:**

- `bl_name` *(string, required)* — Blacklist name

**Usable from:** all

**Example.** Example of usage.

```opensips
unuse_blacklist("pstn-gws");
```

## `use_blacklist(bl_name)`

Enables the DNS blacklist name received as parameter. Its primary purposes will be to prevent sending requests to critical IPs (like GWs) due DNS or to avoid sending to destinations that are known to be unavailable (temporary or permanent).

**Parameters:**

- `bl_name` *(string, required)* — Blacklist name

**Usable from:** all

**Example.** Example of usage.

```opensips
use_blacklist("pstn-gws");
```

## `xlog([log_level, ]format_string)`

Allows various debugging / runtime / critical messages to be printed as the execution of the OpenSIPS script is done. All pseudo-variables included in the format_string parameter will be expanded.

**Parameters:**

- `format_string` *(string, required)* — Format string
- `log_level` *(string, optional)* — Optional logging level
  - `L_ALERT`
  - `L_CRIT`
  - `L_ERR`
  - `L_WARN`
  - `L_NOTICE`
  - `L_INFO`
  - `L_DBG`

**Usable from:** all

**Example.** Example of usage.

```opensips
# a few xlog scripting examples
xlog("Received $rm from $fu (callid: $ci)\n");
xlog("L_ERR", "key $var(username) not found in cache!\n");
```
