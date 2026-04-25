## 1.4.�Exported Functions

### 1.4.1.� `ds_select_dst(set, alg, [flags], [partition], [max_res])`

The method selects a destination from the given set of addresses. It will overwrite the destination URI (_$du_) of a SIP request.

Meaning of the parameters is as follows:

*   _set (int)_ - a set identifier from which to select destinations
    
*   _alg (int)_ - the algorithm used to select the destination address
    
    *   “0” - hash over callid
        
    *   “1” - hash over from uri.
        
    *   “2” - hash over to uri.
        
    *   “3” - hash over request-uri.
        
    *   “4” - weighted round-robin (next destination). the destination's weight determines how many times it is chosen before going to the next one
        
    *   “5” - hash over authorization-username (Proxy-Authorization or "normal" authorization). If no username is found, weighted round-robin is used.
        
    *   “6” - random (using rand()).
        
    *   “7” - hash over the content of PVs string. Note: This works only when the parameter hash\_pvar is set.
        
    *   “8” - the first entry in set is chosen.
        
    *   “9” - The _pvar\_algo\_pattern_ parameter is used to determine the load on each server. If the parameter is not specified, then the first entry in the set is chosen.
        
    *   “10” - The _algo\_route_ OpenSIPS route is called for each dispatcher entry in the setid, in order to decide the routing order. See the algo\_route parameter for usage examples
        
    *   “X” - if the algorithm is not implemented, the first entry in set is chosen.
        
    
*   _flags (string, optional)_ - a string of flag-settings which tweak the function's behavior:
    
    *   'f' (failover support): causes the remaining addresses from the destination set to be stored within an internally managed AVP. You may then use [ds\_next\_dst()](#func_ds_next_dst "1.4.3.� ds_next_dst([partition])") to switch to the next address, thus achieving serial forking to all possible destinations
        
    *   'u' (user only): will specify that only the URI user part will be used for hashing
        
    *   'd' (use default): use the last address in destination set as last option to send the message
        
    *   'a' (append destinations): append any new destinations to the current destination list, rather than rewriting the list
        
    
    The flags are being kept per partition.
    
*   _partition (string, optional)_ - name of a DB partition
    
*   _max\_res (int, optional)_ - signifies that only a maximum number of destinations shall be included in the specified failover AVP. This allows having multiple destinations while also preventing excessive failover attempts in case a number is bound to fail globally.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.40.�`ds_select_dst` usage**

...
if (!ds\_select\_dst(1, 0)) {
	xlog("ERROR: no active destinations found!\\n");
	send\_reply(503, "Service Unavailable");
	exit;
}
...
ds\_select\_dst(1, 0, , "fs\_boxes", 5);
...
ds\_select\_dst(1, 0, "fUD", "ask\_boxes");
...
ds\_select\_dst(2, 0, "fud", "pstn\_gws", 5);
ds\_select\_dst(3, 1, "fua", "pstn\_gws", 2);
...
# using variables
$var(part) = "pstn\_gws"
$var(setid) = 1;
$var(alg) = 4;
$var(flags) = "fdu";
$var(max\_res) = 2;
ds\_select\_dst($var(setid), $var(alg), $var(flags), $var(part), $var(max\_res));
...

  

### 1.4.2.� `ds_select_domain(set, alg, [flags], [partition], [max_res])`

The method selects a destination from addresses set and rewrites the hostname and port parts of the Request-URI (_$ru_). Its parameters have same meaning as in [ds\_select\_dst()](#func_ds_select_dst "1.4.1.� ds_select_dst(set, alg, [flags], [partition], [max_res])").

If the "f" (failover support) flag is present, the rest of the addresses from the destination set will be stored in an internally managed AVP. You may then use [ds\_next\_domain()](#func_ds_next_domain "1.4.4.� ds_next_domain([partition])") to switch to the next address in the list, thus achieving serial forking to all possible destinations.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

### 1.4.3.� `ds_next_dst([partition])`

Takes the next destination address from the AVPs with id partition.'dst\_avp\_id' and sets the dst\_uri (outbound proxy address). If "partition" is omitted, the default partition will be used.This function is using the flags set in ds\_select\_dst or ds\_select\_domain.

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

### 1.4.4.� `ds_next_domain([partition])`

Takes the next destination address from the AVPs with id partition.'dst\_avp\_id' and sets the domain part of the request uri. If "partition" is omitted, the default partition will be used.This function is using the flags set in ds\_select\_dst or ds\_select\_domain.

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

### 1.4.5.� `ds_mark_dst([state], [partition])`

Mark the last used address from partition's destination set as inactive ("i"/"I"/"0"), active ("a"/"A"/"1") or probing ("p"/"P"/"2"). With this function, an automatic detection of failed gateways can be implemented. When an address is marked as inactive or probing, it will be ignored by [ds\_select\_dst()](#func_ds_select_dst "1.4.1.� ds_select_dst(set, alg, [flags], [partition], [max_res])") and [ds\_select\_domain()](#func_ds_select_domain "1.4.2.� ds_select_domain(set, alg, [flags], [partition], [max_res])"). If "partition" is omitted, the default partition will be used. This function is using the flags set in [ds\_select\_dst()](#func_ds_select_dst "1.4.1.� ds_select_dst(set, alg, [flags], [partition], [max_res])") or [ds\_select\_domain()](#func_ds_select_domain "1.4.2.� ds_select_domain(set, alg, [flags], [partition], [max_res])").

Possible parameters:

*   state (string, optional) - new state for the last attempted destination. Possible values:
    
    *   _"i", "I" or "0" (default)_ - the last destination should be set to inactive and will be ignored in future requests.
        
    *   _"a", "A" or "1"_ - the last destination should be set to active.
        
    *   _"p", "P" or "2"_ - the last destination will be set to probing. Note: You will need to call this function "threshold"-times, before it will be actually set to probing.
        
    
*   partition (string, optional) - name of a DB partition, otherwise the default one will be used
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

### 1.4.6.� `ds_count(set, state_filter, res_var, [partition])`

Returns the number of active, inactive or probing destinations in a partition's set, or combinations between these properties.

Meaning of the parameters:

*   _set (int)_ - a set of dispatching destinations
    
*   _state\_filter (string)_ - which destinations should be counted. Either active ("a", "A" or "1"), inactive ("i", "I" or "0"), probing ("p", "P" or "2") destinations or different combinations between these flags, such as "pI", "1i", "ipA"...
    
*   _res\_var (variable)_ - a variable which will hold the integer result
    
*   _partition (string, optional)_ - name of a DB partition. If omitted, the "default" partition will be used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.41.�`ds_count` usage**

...
if (ds\_count(1, "a", $avp(result))) {
	...
}
...
if (ds\_count($avp(set), "ip", $avp(result), $avp(partition))) {
	...
}
...

  

### 1.4.7.� `ds_is_in_list(ip, port, [set], [partition], [active_only], [pattern])`

This function returns _true_ only if "ip" and "port" point to a host from the given dispatcher "set".

Meaning of the parameters:

*   _ip (string)_ - an IPv4 or IPv6 address to test against the dispatcher "set"
    
*   _port (int)_ - a port to test against the dispatcher list. Use a _0_ value in order to match any port
    
*   _set (int, optional)_ - a dispatcher set identifier to test against. If missing, all sets will be checked. The _\-1_ set is a special value, acting as a "check all sets" wildcard.
    
*   _partition (string, optional)_ - name of a DB partition
    
*   _active\_only (int, optional)_ - specify a non-zero value in order to only search through the active destinations (ignore the ones in probing and inactive states)
    
*   _pattern (string, optional)_ - a glob pattern used to match destination attributes. If the destination ip and port matches but the pattern does not match the destination's attribute, the function will fail.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and ONREPLY\_ROUTE.

**Example�1.42.�`ds_is_in_list` usage**

...
if (ds\_is\_in\_list($si, $sp)) {
	# source IP:PORT is in a dispatcher list
}
...
if (ds\_is\_in\_list($rd, $rp, 2)) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "default" partition
}
...
if (ds\_is\_in\_list($rd, $rp, 2, "part2")) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "part2" partition
}
...

  

### 1.4.8.� `ds_push_script_attrs(script_attr, ip, port, set, [partition])`

Set the script attrs for the dispatcher entry defined by IP, Port, setid and partition.

Meaning of the parameters:

*   _script\_attr (str or pvar)_ - The new script attributes
    
*   _IP (string)_ - IP address for which we are pushing script attributes
    
*   _port (int)_ Port for which we are pushing script attributes
    
*   _setid (int)_ Setid for which we are pushing script attributes
    
*   _partition (string, optional)_ - name of a DB partition. If omitted, the "default" partition will be used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.43.�`ds_count` usage**

...
if (ds\_push\_script\_attrs($var(my\_attributes),$si , $sp, 1, 'my\_partition')) {
	...
}
...

  

### 1.4.9.� `ds_get_script_attrs(uri, set, [partition], out_attrs)`

Get the script attrs for the dispatcher entry defined by the URI, setid and partition.

Meaning of the parameters:

*   _URI (string)_ - URI address for which we are getting script attributes
    
*   _setid (int)_ Setid for which we are pushing script attributes
    
*   _partition (string, optional)_ - name of a DB partition. If omitted, the "default" partition will be used.
    
*   _out\_atrs (pvar)_ - name of a variable where we will store the script attrs.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.44.�`ds_count` usage**

...
if (ds\_push\_script\_attrs($var(my\_attributes),$si , $sp, 1, 'my\_partition')) {
	...
}
...