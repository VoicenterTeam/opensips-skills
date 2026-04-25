## 1.4.�Exported Functions

Previous versions of carrierroute had some more function. All the old semantics can be achieved by using the few new functions like this:

cr\_rewrite\_uri(domain, hash\_source)
-> cr\_route("default", domain, $rU, $rU, hash\_source)

cr\_prime\_balance\_uri(domain, hash\_source)
-> cr\_prime\_route("default", domain, $rU, $rU, hash\_source)

cr\_rewrite\_by\_to(domain, hash\_source)
-> cr\_route("default", domain, $tU, $rU, hash\_source)

cr\_prime\_balance\_by\_to(domain, hash\_source)
-> cr\_prime\_route("default", domain, $tU, $rU, hash\_source)

cr\_rewrite\_by\_from(domain, hash\_source)
-> cr\_route("default", domain, $fU, $rU, hash\_source)

cr\_prime\_balance\_by\_from(domain, hash\_source)
-> cr\_prime\_route("default", domain, $fU, $rU, hash\_source)

cr\_user\_rewrite\_uri(uri, domain)
-> cr\_user\_carrier(user, domain, $avp(tree\_avp))
-> cr\_route($avp(tree\_avp), domain, $rU, $rU, "call\_id")

cr\_tree\_rewrite\_uri(tree, domain)
-> cr\_route(tree, domain, $rU, $rU, "call\_id")
  

### 1.4.1.� `cr_user_carrier(user, domain, dst_avp)`

This function loads the carrier and stores it in an AVP. It cannot be used in the config file mode, as it needs a mapping of the given user to a certain carrier. The is derived from a database entry belonging to the user parameter. This mapping must be available in the table that is specified in the “subscriber\_table” variable. This data is not cached in memory, that means for every execution of this function a database query will be done.

Parameters:

*   _user (string)_ - Name of the user for the carrier tree lookup
    
*   _domain (string)_ - Name of the routing domain to be used
    
*   _dst\_avp (var)_ - Name of an AVP where to store the carrier id
    

### 1.4.2.� `cr_route(carrier, domain, prefix_matching, rewrite_user, hash_source, [dst_avp])`

This function searches for the longest match for the user given in prefix\_matching at the given domain in the given carrier tree. The Request URI is rewritten using rewrite\_user and the given hash source and algorithm. Returns -1 if there is no data found or an empty rewrite host on the longest match is found. Otherwise the rewritten host is stored in the given AVP (if obmitted, the host is not stored in an AVP). This function is only usable with rewrite\_user and prefix\_matching containing a valid numerical only string. It uses the standard crc32 algorithm to calculate the hash values.

Parameters:

*   _carrier (string)_ - The routing tree to be used
    
*   _domain (string)_ - Name of the routing domain to be used
    
*   _prefix\_matching (string)_ - User name to be used for prefix matching in the routing tree
    
*   _rewrite\_user (string)_ - The user name to be used for applying the rewriting rule. Usually, this is the user part of the request URI
    
*   _hash\_source (string)_ - The hash values of the destination set must be a contiguous range starting at 1, limited by the configuration parameter max\_targets. Possible values for hash\_source are: call\_id, from\_uri, from\_user, to\_uri and to\_user.
    
*   _dst\_avp (var, optional)_ - Optional AVP where to store the rewritten host
    

### 1.4.3.� `cr_prime_route(carrier, domain, prefix_matching, rewrite_user, hash_source, [dst_avp])`

This function searches for the longest match for the user given in prefix\_matching at the given domain in the given carrier tree. The Request URI is rewritten using rewrite\_user and the given hash source and algorithm. Returns -1 if there is no data found or an empty rewrite host on the longest match is found. Otherwise the rewritten host is stored in the given AVP (if obmitted, the host is not stored in an AVP). This function is only usable with rewrite\_user and prefix\_matching containing a valid numerical only string. It uses the prime hash algorithm to calculate the hash values.

Meaning of the parameters is as follows:

*   _carrier (string)_ - The routing tree to be used
    
*   _domain (string)_ - Name of the routing domain to be used
    
*   _prefix\_matching (string)_ - User name to be used for prefix matching in the routing tree
    
*   _rewrite\_user (string)_ - The user name to be used for applying the rewriting rule. Usually, this is the user part of the request URI
    
*   _hash\_source (string)_ - The hash values of the destination set must be a contiguous range starting at 1, limited by the configuration parameter max\_targets. Possible values for hash\_source are: call\_id, from\_uri, from\_user, to\_uri and to\_user.
    
*   _dst\_avp (var, optional)_ - Optional AVP where to store the rewritten host
    

### 1.4.4.� `cr_next_domain(carrier, domain, prefix_matching, host, reply_code, dst_avp)`

This function searches for the longest match for the user given in prefix\_matching at the given domain in the given carrier failure tree. It tries to find a next domain matching the given host, reply\_code and the message flags. The matching is done in this order: host, reply\_code and then flags. The more wildcards in reply\_code and the more bits used in flags, the lower the priority. Returns -1 if there is no data found or an empty next\_domain on the longest match is found. Otherwise the next domain is stored in the given AVP. This function is only usable with prefix\_matching containing a valid numerical only string.

Meaning of the parameters is as follows:

*   _carrier (string)_ - The routing tree to be used any pseudo-variable could be used as input.
    
*   _domain (string)_ - Name of the routing domain to be used
    
*   _prefix\_matching (string)_ - User name to be used for prefix matching in the routing tree
    
*   _host (string)_ - The host name to be used for failure route rule matching. Usually, this is the last tried routing destination stored in an avp by cr\_route
    
*   _reply\_code (string)_ - The reply code to be used for failure route rule matching
    
*   _dst\_avp (var)_ - AVP where to store the next routing domain.