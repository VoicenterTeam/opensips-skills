## 1.6.�Exported Functions

### 1.6.1.� `lb_start(grp,resources[,flags],[attrs])`

The function starts a new load-balancing session over the available destinations. This translates into finding the less loaded destination that can provide the requested resources and belong to a requested group.

Meaning of the parameters is as follows:

*   _grp_ (int) - group id for the destinations; the destination may be grouped in several groups you can you for differnet scenarios.
    
*   _resources_ (string) - a semi-colon separated list of resources required by the current call.
    
*   _flags_ (string, optional) - various flags to controll the LB algorithm ( or computing the available load on the system):
    
    *   _n_ - Negative availability - use destinations with negative availability (exceeded capacity); do not ignore resources with negative availability, and thus able to select for load balancing destinations with exceeded capacity. This might be needed in scenarios where we want to limit generic calls volume and always pass important/high-priority calls.
        
    *   _r_ - Relative value - the relative available load (how many percentages are free) is used in computing the load of each pear/resource; Without this flag, the Absolute value is assumed - the effective available load ( maximum\_load - current\_load) is used in computing the load of each pear/resource.
        
    *   _s_ - Pick a random destination if multiple destinations with the same load are found, instead of always picking first matched destination. This could help to offload an excessive load from the first destination and distribute load in situations when failed calls always routed to first destination, since they almost does not affect load counters of destinations.
        
    
*   _attrs_ (var, optional) - a writable variable to be populated with the attributes of the selected destination.
    

The function may return:

*   _1 (true)_ - if a new destination URI is set, pointing to the selected destination. NOTE that the RURI will not be changed by this function.
    
*   _\-1 (false)_ - generic internal error (memory allocation, parsing)
    
*   _\-2 (false)_ - no capacity available (detinations are up and available, but they do not have any availabe channels)
    
*   _\-3 (false)_ - no destinations available (the requested resources did not match any active destination)
    
*   _\-4 (false)_ - bad resources (requested resources do not exist)
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.13.�`lb_start` usage**

...
if (lb\_start(1,"trascoding;conference")) {
	# dst URI points to the new destination
	xlog("sending call to $du\\n");
	t\_relay();
	exit;
}
...

  

### 1.6.2.� `lb_next([attrs])`

Function to be used to pull the next available (and less loaded) destination. You need to have an ongoing LB session (started with lb\_start()).

This function is mainly used for implementing failover for the LB destinations.

Meaning of the parameters is as follows:

*   _attrs_ (var, optional) - a writable variable to be populated with the attributes of the selected destination.
    

The function may return:

*   _1 (true)_ - if a new destination URI is set, pointing to the selected destination. NOTE that the RURI will not be changed by this function.
    
*   _\-1 (false)_ - generic internal error (memory allocation, parsing)
    
*   _\-2 (false)_ - no capacity available (detinations are up and available, but they do not have any availabe channels)
    
*   _\-3 (false)_ - no more destinations available (the requested resources did not match any active destination)
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.14.�`lb_next()` usage**

...
if (t\_check\_status("(408)|(5\[0-9\]\[0-9\])")) {
	/\* check next available LB destination \*/
	if ( lb\_next() ) {
		t\_on\_failure("1");
		xlog("-----------new dst is $du\\n");
		t\_relay();
		exit;
	}
}

...

  

### 1.6.3.� `lb_start_or_next(grp,resources[,flags],[attrs])`

This is just a wrapper function to simplify scripting. If there is no ongoing LB session, it acts as lb\_start(); If there is an ongoing LB session, it acts as lb\_next().

### 1.6.4.� `load_balance(grp,resources[,flags],[attrs])`

Old name of the lb\_start\_or\_next() function.

Take care, this will become obsolete.

### 1.6.5.� `lb_reset()`

Function to stop and flush a current LB session. To be used in failure route, if you want to stop the current LB session (not to try any other destinations from this session) and to start a completly new one.

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.15.�`lb_next()` usage**

...
if (t\_check\_status("(5\[0-9\]\[0-9\])")) {
	/\* check next available LB destination \*/
	if ( lb\_next() ) {
		t\_on\_failure("1");
		xlog("-----------new dst is $du\\n");
		t\_relay();
		exit;
	}
} else if (t\_check\_status("(408)")) {
	lb\_reset();
	if (lb\_start(1,"conference")) {
		t\_relay();
		exit;
	}
}
...

  

### 1.6.6.� `lb_is_started()`

Function to check if there is any ongoing LB session. Returns true if so.

This function can be used in any type of route.

### 1.6.7.� `lb_disable_dst()`

Marks as disabled the last destination that was used for the current call. The disabling done via this function will prevent the destination to be used for usage from now on. The probing mechanism can re-enable this peer (see the probing section in the beginning)

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

**Example�1.16.�`lb_disable_dst()` usage**

...
if (t\_check\_status("(408)|(5\[0-9\]\[0-9\])")) {
	lb\_disable\_dst();
	if ( lb\_next() ) {
		t\_on\_failure("1");
		xlog("-----------new dst is $du\\n");
		t\_relay();
	} else {
		t\_reply(500,"Error");
	}
}

...

  

### 1.6.8.� `lb_is_destination(ip,port,[group],[active],[attrs]])`

Checks if the given IP and PORT belongs to a destination configured in the load-balancer's list. Returns true if found and active (see the "active" parameter).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

Meaning of the parameters is as follows:

*   _ip_ (string) - IP to be checked
    
*   _port_ (int) - PORT to be checked. A value 0 means "any" - will match any port.
    
*   _group_ (int, optional) - in what LB group the destination should be looked for; If not specified, the search will be in all groups.
    
*   _active_ (int, optional)- if "1", the search will be performed only over "active" (not disabled) destinations. If missing, the search will consider any kind of destinations.
    
*   _attrs_ (var, optional) - a writable variable to be populated with the attributes of the identified destination.
    

**Example�1.17.�`lb_is_destination` usage**

...
if (lb\_is\_destination($si,$sp) ) {
	# request from a LB destination
}
...

  

### 1.6.9.� `lb_count_call(ip,port,grp,resources[,undo])`

The function counts the current call as load for a given destination with some given resources. Note that this call is not going through the load-balancing logic (there are not routing decision taken for the call); it is simply counted by LB as ongoing call for a destination;

Meaning of the parameters is as follows:

*   _ip_ (string) - IP to identify the destination the call has to be counted for.
    
*   _port_ (int) - PORT to identify the destination the call has to be counted for.
    
*   _grp_ (int) - group id for the destinations; if no knows, "-1" will mean all groups.
    
*   _resources_ - (string) a semi-colon separated list of resources required by the current call.
    
*   _undo_ - (int, optional) if set to a non zero value, it will force the function to un-count - actually it will undo the counting of this call as load in the current LB session; this might be needed if we count call for particular resources and then need to un-count it.
    

Function returns true if the call was properly taken into consideration for estimating the load on the destination.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.18.�`lb_count_call` usage**

...
# count as load also the calls orgininated by lb destinations
if (lb\_is\_destination($si,$sp) ) {
	# inbound call from destination
	lb\_count\_call($si,$sp,-1,"conference");
} else {
	# outbound call to destinations
	if ( !load\_balance(1,"conference") ) {
		send\_reply(503,"unavailable");
		exit();
	}
	# dst URI points to the new destination
	xlog("sending call to $du\\n");
	t\_relay();
	exit;
}
...