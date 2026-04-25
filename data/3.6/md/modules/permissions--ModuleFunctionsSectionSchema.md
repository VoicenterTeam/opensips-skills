## 1.4.�Exported Functions

### 1.4.1.� `check_address(group_id, ip, port, proto [, context_info], [pattern], [partition])`

Returns 1 if group id, IP address, port and protocol given as arguments match an IP subnet found in cached address table, as described in [Section�1.1.4, “Address Permissions”](#sec-address-permissions "1.1.4.�Address Permissions") . The function takes 4 mandatory arguments and 3 optional ones.

This function can be useful to check if a request can be allowed without authentication.

Meaning of the parameter is as follows:

*   group\_id (int)
    
    This argument represents the group id to be matched. If the group\_id argument is "0", the query can match any group in the cached address table.
    
*   ip (string)
    
    This argument represents the ip address to be matched. This argument cannot be null/empty.
    
*   port (int)
    
    This argument represents the port to be matched. Cached address table entry containing port value 0 matches any port. Also, a _0_ value for the argument will match any port in the address table.
    
*   proto (string)
    
    This argument represents the protocol used for transport; Transport protocol is either "ANY" or any valid transport protocol value: "UDP, "TCP", "TLS", and "SCTP".
    
*   context\_info (var, optional)
    
    This argument represents the variable in wich the context\_info field from the cached address table will be stored in case of match.
    
*   pattern (string, optional)
    
    This argument is a string to be matched against the wildcard pattern field from the address table.
    
*   partition (string, optional)
    
    An optional parition name for the group id. If no partition specified, the “default” one will be used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, BRANCH\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE.

**Example�1.16.�`check_address()` usage**

...

// Checks if the tuple IP address/port (given as strings) and source protocol
// (given as pvar), belongs to group 4, verifies if the string "texttest"
// matches the wildcard pattern field in the database table and stores the
// context information in $avp(ctx)
if (check\_address( 4, "192.168.2.135", 5700, "$socket\_in(proto)", $avp(ctx), "texttest")) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}

if (check\_address( 4, "192.168.2.135", 5700, "$socket\_in(proto)", , , "my\_part")) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}
...

// Checks if the tuple IP address/port/protocol of the source message is in group 4
if (check\_address( 4, "$si", "$sp", "$socket\_in(proto)")) {
	t\_relay();
}

...

// Checks if the tuple IP address/port/protocol stored in AVPs s:ip/s:port/s:proto
// is in group 4 and stores context information in $avp(ctx)
$avp(ip) = "192.168.2.135";
$avp(port) = 5061;
$avp(proto) = "any";
$avp(partition)="my\_part";
if (check\_address( 4, $avp(ip), $avp(port), $avp(proto), $avp(ctx), , $avp(partition))) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}

...

// Checks if the tuple IP address/port (given as strings) and source protocol
// (given as pvar) is in group 4, verifies if string the "texttest" matches
// the wildcard pattern field in the database table, without storing any
// context information
if (check\_address( 4,$si, 5700, $socket\_in(proto), ,"texttest")) {
	t\_relay();
}

...

  

### 1.4.2.� `check_source_address(group_id , [context_info], [pattern], [partition])`

Equivalent to check\_address(group\_id, "$si", "$sp", "$socket\_in(proto)", context\_info, pattern, partition).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, BRANCH\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE.

**Example�1.17.�`check_source_address()` usage**

...
// Check if source address/port/proto is in group 4 and stores
// context information in $avp(ctx)
if (check\_source\_address( 4,$avp(ctx), , , $avp(my\_partition))) {
	xlog("$avp(ctx)\\n");
}else {
	sl\_send\_reply(403, "Forbidden");
}
...

  

### 1.4.3.� `get_source_group(var,[partition])`

Checks if an entry with the source ip/port/protocol is found in cached address or subnet table in any group. If yes, returns that group in the variable parameter. If not returns -1. Port value 0 in cached address and subnet table matches any port. Optionally, you can also specify the partition. If no partition specified, the “default” one will be used.

Parameters:

*   _var_ (var)
    
*   _partition_ (string, optional)
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, BRANCH\_ROUTE.

**Example�1.18.�`get_source_group()` usage**

...

if ( get\_source\_group( $var(group)) ) {
   # do something with $var(group)
   xlog("group is $var(group)\\n");
};
...

  

### 1.4.4.� `allow_routing()`

Returns true if all pairs constructed as described in [Section�1.1.1, “Call Routing”](#sec-call-routing "1.1.1.�Call Routing") have appropriate permissions according to the configuration files. This function uses default configuration files specified in `default_allow_file` and `default_deny_file`.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.19.�`allow_routing` usage**

...
if (allow\_routing()) {
	t\_relay();
};
...

  

### 1.4.5.� `allow_routing(basename)`

Returns true if all pairs constructed as described in [Section�1.1.1, “Call Routing”](#sec-call-routing "1.1.1.�Call Routing") have appropriate permissions according to the configuration files given as parameters.

Meaning of the parameters is as follows:

*   _basename_ (string) - Basename from which allow and deny filenames will be created by appending contents of `allow_suffix` and `deny_suffix` parameters.
    
    If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.20.�`allow_routing(basename)` usage**

...
if (allow\_routing("basename")) {
	t\_relay();
};
...

  

### 1.4.6.� `allow_register(basename)`

The function returns true if all pairs constructed as described in [Section�1.1.2, “Registration Permissions”](#sec-registration-permissions "1.1.2.�Registration Permissions") have appropriate permissions according to the configuration files given as parameters.

Meaning of the parameters is as follows:

*   _basename_ (string) - Basename from which allow and deny filenames will be created by appending contents of `allow_suffix` and `deny_suffix` parameters.
    
    If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.21.�`allow_register(basename)` usage**

...
if ($rm=="REGISTER") {
	if (allow\_register("register")) {
		save("location");
		exit;
	} else {
		sl\_send\_reply(403, "Forbidden");
	};
};
...

  

### 1.4.7.� `allow_uri(basename, uri)`

Returns true if the pair constructed as described in [Section�1.1.3, “URI Permissions”](#sec-uri-permissions "1.1.3.�URI Permissions") have appropriate permissions according to the configuration files specified by the parameter.

Meaning of the parameter is as follows:

*   _basename_ (string) - Basename from which allow and deny filenames will be created by appending contents of `allow_suffix` and `deny_suffix` parameters.
    
    If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.
    
*   _uri_ (string) - SIP URI to be checked.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.22.�`allow_uri(basename, uri)` usage**

...
if (allow\_uri("basename", $rt)) {  // Check Refer-To URI
	t\_relay();
};
if (allow\_uri("basename", $avp(uri)) {  // Check URI stored in $avp(uri)
	t\_relay();
};
...