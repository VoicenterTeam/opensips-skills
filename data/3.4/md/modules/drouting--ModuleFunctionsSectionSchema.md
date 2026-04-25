## 1.4.�Exported Functions

### 1.4.1.� `do_routing([groupID], [flags], [gw_whitelist], [rule_attrs_pvar], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function to trigger routing of the message according to the rules in the database table and the configured parameters.

This function can be used from all routes.

If you set `use_partitions` to 1 the **partition** last parameter becomes mandatory.

All parameters are optional. Any of them may be ignored, provided the necessary separation marks "," are properly placed.

*   **groupID** (int, optional) - number to specify the group of the caller for routing purposes. If none specified the function will automatically try to query the dr\_group table to get this
    
*   **flags** (string, optional) - a list of letter-like flags for controlling the routing behavior. Possible flags are:
    
    *   **F** - Enable rule fallback; normally the engine is using a single rule for routing a call; by setting this flag, the engine will fallback and use rules with less priority or shorter prefix when all the destination from the current rules failed.
        
    *   **L** - Do strict length matching over the prefix - actually DR engine will do full number matching and not prefix matching anymore.
        
    *   **C** - Only check if the dialed number matches any routing rule, without loading / applying any routing info (no GW is set, the RURI is not altered)
        
    
*   **gw\_whitelist** (string, optional) - a comma separated white list of gateways. This will force routing over, at most, this list of carriers or gateways (in other words, the whitelist will be intersected with the results of the search through the rules).
    
*   **rule\_attrs\_pvar** (var, optional) - a writable variable which will be populated with the attributes of the matched dynamic routing rule.
    
*   **gw\_attrs\_pvar** (var, optional) - a writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - a a writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Besides specifing the name of one partition, you can use the "\*" wildcard sign to force routing over all partitions.
    

**Example�1.39.�`do_routing` usage**

...
# all groups, sort on order, `use_partitions` is 0
do\_routing();
...
# all groups, sort on order, `use_partitions` is 1, route by partition named "part"
do\_routing( , , , , , ,"part");
...
# group id 0, sort on order, `use_partitions` is 0
do\_routing(0);
...
# group id 0, sort on order, `use_partitions` is 1, route by partition named "part"
do\_routing(0, , , , , , "part");
...
# group id from $var(id), sort on order, `use_partitions` is 0
do\_routing($var(id));
...
# all groups, sort on weights, `use_partitions` is 0
do\_routing(, "W");
...
# `use_partitions` is 1, partition and group supplied by AVPs, do strict length matching
do\_routing( $avp(grp),"L", , , , ,$avp(partition))
...
# group id 2, sort on order, fallback rule and also return the gateway attributes
do\_routing(2, "F", , , $var(gw\_attributes));
...

  

### 1.4.2.� `route_to_carrier( carriers, [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function to trigger the direct routing to a given set carriers (one or more). So, the routing is not done prefix based, but carrier based (call will be sent to the GWs of that carrier, based on carrier policy).

This function can be used from all routes.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter also (where the carrier are to be found).

*   **carriers** (string) - comma separated carrier IDs (names)
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the currently matched gateway of this carrier.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of this carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is not accepted by the function.
    

**Example�1.40.�`route_to_carrier` usage**

...
# use\_partitions is not set
if ( route\_to\_carrier("my\_top\_carrier, def\_carrier", , $var(carrier\_att)) ) {
	xlog("Routing to \\"my\_top\_carrier\\" - $var(carrier\_att)\\n");
	t\_on\_failure("next\_gw");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_carrier("my\_top\_carrier", , $var(carrier\_att), "part") ) {
	xlog("Routing to \\"my\_top\_carrier\\" - $var(carrier\_att)\\n");
	t\_on\_failure("next\_gw");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_carrier($var(carrierId), , , $var(my\_partition)) ) {
	xlog("Routing to \\"my\_top\_carrier\\"\\n");
	t\_on\_failure("next\_gw");
	t\_relay();
	exit;
}
...

  

### 1.4.3.� `route_to_gw(gw_id, [gw_attrs_var], [carrier_attrs_var], [partition])`

Function to trigger the direct routing to a given gateway (or list of gateways). Attributes and per-gw processing will be available.

This function can be used from all routes.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

*   **gw\_id** (string) - comma separated list of gateway IDs to be used.
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the currently matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of this carrier. NOTE: the first carrier pointing to the GW(s) will be considered!
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is not accepted by the function.
    

**Example�1.41.�`route_to_gw` usage**

...
# use\_partitions is not set
if ( route\_to\_gw("gw\_europe") ) {
	t\_relay();
	exit;
}
...
# use\_partitions is not set
if ( route\_to\_gw("gw1,gw2,gw3", $var(gw\_attrs)) ) {
	xlog("Relaying to first gateway from our list - $var(gw\_attrs)\\n");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_gw("gw\_europe", , , "my\_partition") ) {
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_gw("gw1,gw2,gw3", $var(gw\_attrs), , "my\_partition") ) {
	xlog("Relaying to first gateway from our list - $var(gw\_attrs)\\n");
	t\_relay();
	exit;
}
...

  

### 1.4.4.� `use_next_gw( [rule_attrs_pvar], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function takes the next available destination (set by do\_routing, as alternative destinations) and pushes it into the RURI. Note that the function just sets the RURI (nothing more).

If a new RURI is set, the used destination is removed from the pending set of alternative destinations.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

The function returns true only if a new RURI was set. False is returned is no other alternative destinations are found or in case of an internal processing error. It may take the following optional parameters:

*   **rule\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched dynamic routing rule.
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (optinal, string) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is not accepted by the function.
    

**Example�1.42.�`use_next_gw` usage**

...
# use\_partitions is not set
if (use\_next\_gw()) {
	t\_relay();
	exit;
}
...
# Also fetch the carrier attributes, if any
if (use\_next\_gw(, , $var(carrier\_attrs))) {
	xlog("Carrier attributes of current gateway: $var(carrier\_attrs)\\n");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if (use\_next\_gw( , , ,"my\_partition")) {
	t\_relay();
	exit;
}
...
# Also fetch the carrier attributes, if any
if (use\_next\_gw( , ,$var(carrier\_attrs), "my\_partition")) {
	xlog("Carrier attributes of current gateway: $var(carrier\_attrs)\\n");
	t\_relay();
	exit;
}
...

  

### 1.4.5.� `goes_to_gw( [type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function returns true if the destination of the current request (destination URI or Request URI) points (as IP) to one of the gateways. There no DNS lookups done if the domain part of the URI is not an IP.

This function does not change anything in the message.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following optional parameters:

*   **type** (int, optional) - number for the GW/destination type to be checked; when omitting this parameter or specifying the special value _\-1_, matching will be done against all types.
    
*   **flags** (string, optional) - letter like flags for controlling what operations should be performed when a GW matches:
    
    *   **'s'** (Strip) - apply to the username of RURI the strip defined by the GW
        
    *   **'p'** (Prefix) - apply to the username of RURI the prefix defined by the GW
        
    *   **'i'** (Gateway ID) - return the gateway id into gw\_id\_avp AVP
        
    *   **'n'** (Ignore port) - ignores port number during matching
        
    *   **'c'** (Carrier ID) - return the carrier id into carrier\_id\_avp AVP
        
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.43.�`goes_to_gw` usage**

...
# use\_partitions is not set
if (goes\_to\_gw( 1, , $var(gw\_attrs))) {
	sl\_send\_reply(403,"Forbidden");
	exit;
}
...
# use\_partitions is enabledt
if (goes\_to\_gw(1, , $var(gw\_attrs), , "my\_partition")) {
	sl\_send\_reply(403,"Forbidden");
	exit;
}
...

  

### 1.4.6.� `is_from_gw([type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function checks if the sender of the message (source IP + source port) is a gateway from a certain group.

This function does not change anything in the message.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and ONREPLY\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following optional parameters:

*   **type** (int, optional) - number for the GW/destination type to be checked; when omitting this parameter or specifying the special value _\-1_, matching will be done against all types.
    
*   **flags** (string, optional) - letter like flags for controlling what operations should be performed when a GW matches:
    
    *   **'s'** (Strip) - apply to the username of RURI the strip defined by the GW
        
    *   **'p'** (Prefix) - apply to the username of RURI the prefix defined by the GW
        
    *   **'i'** (Gateway ID) - return the gateway id into gw\_id\_avp AVP
        
    *   **'n'** (Ignore port) - ignores port number during matching
        
    *   **'r'** (Check protocol) - check protocol
        
    *   **'c'** (Carrier ID) - return the carrier id into carrier\_id\_avp AVP
        
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.44.�`is_from_gw` usage**

\# use\_partitions is not set
# match the source IP (only) against all gateways
if (is\_from\_gw(-1, "n")) {
	...
}

# use\_partitions is enabled
# match the source IP and port against all gateways from the "outbound"
# partition and return the matched gateway's carrier
if (is\_from\_gw(, "c", , , "outbound")) {
	...
}

  

### 1.4.7.� `dr_is_gw( sip_uri, [type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function checks if the SIP URI hostname part stored inside the "src\_pv" pseudo-variable is a gateway from a certain group.

This function does not change anything in the message.

This function can be used from all routes.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following optional parameters:

*   **sip\_uri** (string) - SIP URI. If the URI hostname part is a FQDN, it will be resolved prior to matching.
    
*   **type** (int, optional) - number for the GW/destination type to be checked; when omitting this parameter or specifying the special value _\-1_, matching will be done against all types.
    
*   **flags** (string, optional) - letter like flags for controlling what operations should be performed when a GW matches:
    
    *   **'s'** (Strip) - apply to the username of RURI the strip defined by the GW
        
    *   **'p'** (Prefix) - apply to the username of RURI the prefix defined by the GW
        
    *   **'i'** (Gateway ID) - return the gateway id into gw\_id\_avp AVP
        
    *   **'n'** (Ignore port) - ignores port number during matching
        
    *   **'c'** (Carrier ID) - return the carrier id into carrier\_id\_avp AVP
        
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.45.�`dr_is_gw` usage**

\# match the SIP URI host within $var(uac) against all gateways
if (dr\_is\_gw( $var(uac), , "n")) {
	...
}


# match the SIP URI host within $var(uac) against
# all gws in "outbound" partition
if (dr\_is\_gw( $avp(uac), , "n", , , "partition")) {
	...
}

  

### 1.4.8.� `dr_disable([partition])`

Marks as disabled the last destination that was used for the current call. The disabling done via this function will prevent the destination to be used for usage from now on. The probing mechanism can re-enable this peer (see the probing section in the beginning)

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following parameters:

*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.46.�`dr_disable()` usage**

...
if (t\_check\_status("(408)|(5\[0-9\]\[0-9\])")) {
	dr\_disable();

}
...
if (t\_check\_status("(408)|(5\[0-9\]\[0-9\])")) {
	dr\_disable("my\_partition");

}
...

  

### 1.4.9.� `dr_match(groupID, [flags], number, [rule_attrs_pvar], [partition])`

The function tries to match/check the given number against the rules from the database.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` to 1 the **partition** last parameter becomes mandatory.

The parameters are:

*   **groupID** (int) - number to specify the dr group (set of rules) to perform the check against
    
*   **flags** (string, optional) - a list of letter-like flags for controlling the checking/matching behavior. Possible flags are:
    
    *   **L** - Do strict length matching over the prefix - actually DR engine will do full number matching and not prefix matching anymore.
        
    
*   **number** (string) - the number to check
    
*   **rule\_attrs\_pvar** (var, optional) - a writable variable which will be populated with the attributes of the matched dynamic routing rule.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on.
    

**Example�1.47.�`dr_match` usage**

...
if ( dr\_match( 1, "L" , $fU, ,"dids") )
	xlog("Full From Username $fU found in group 1 partition DIDS\\n");
...
if ( dr\_match( 1, , $var(did) ) )
	xlog("DID $var(did) matches rules in group 1\\n");
...