## 1.7.�Exported Functions

### 1.7.1.� `rl_check(name, limit[, algorithm])`

Check the current request against the pipe identified by name and changes/updates the limit. If no pipe is found, then a new one is created with the specified limit and algorithm, if specified. If the algorithm parameter doesn't exist, the default one is used.

NOTE: A pipe's algorithm cannot be dynamically changed. Only the one specified when the pipe was created will be considered.

NOTE: This function increments the pipe's counter every time it is called, even if the call should be declined. Therefore If you are using ratelimit to limit only successful traffic, you need to explicitely decrease the counter for the declined calls using the _rl\_dec\_count()_ function.

The method will return an error code if the limit for the matched pipe is reached.

Meaning of the parameters is as follows:

*   _name_ (string) - this is the name that identifies the pipe which should be checked. One can also specify the _/s_ suffix to indicate the pipe should be replicated over cached, or _/b_ to replicate over bin/clusterer interface.
    
*   _limit_ (int) - this specifies the threshold limit of the pipe. It is strongly related to the algorithm used. Note that the limit should be specified as per-second, not per-timer\_interval.
    
*   _algorithm_ (string, optional) - this parameter reffers to the algorithm used to check the pipe. If it is not set, the default value is used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE and EVENT\_ROUTE.

**Example�1.14.�`rl_check` usage**

...
	# perform a pipe match for all INVITE methods using RED algorithm
	if (is\_method("INVITE")) {
		if (!rl\_check("pipe\_INVITE", 100, "RED")) {
			sl\_send\_reply(503, "Server Unavailable");
			exit;
		};
	};
...
	# use default algorithm for each different gateway
	$var(limit) = 10;
	if (!rl\_check("gw\_$ru", $var(limit))) {
		sl\_send\_reply(503, "Server Unavailable");
		exit;
	};
...
	# count only successful calls
	if (!rl\_check("gw\_$ru", 100)) {
		rl\_dec\_count("gw\_$ru");
		sl\_send\_reply(503, "Server Unavailable");
		exit;
	};
...

  

### 1.7.2.� `rl_dec_count(name)`

This function decreases a counter that could have been previously increased by _rl\_check_ function.

Meaning of the parameters is as follows:

*   _name_ (string) - identifies the name of the pipe.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE and EVENT\_ROUTE.

**Example�1.15.�`rl_dec_count` usage**

...
	if (!rl\_check("gw\_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl\_dec\_count("gw\_$ru");
	};
...

  

### 1.7.3.� `rl_reset_count(name)`

This function resets a counter that could have been previously increased by _rl\_check_ function.

Meaning of the parameters is as follows:

*   _name_ - identifies the name of the pipe.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, ERROR\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE and EVENT\_ROUTE.

**Example�1.16.�`rl_reset_count` usage**

...
	if (!rl\_check("gw\_$ru", 100, "TAILDROP")) {
		exit;
	} else {
		rl\_reset\_count("gw\_$ru");
	};
...

  

### 1.7.4.� `rl_values(ret_avp, regexp)`

Returns all the available pipes' names in the _ret\_avp_ output variable.

Meaning of the parameters is as follows:

*   _ret\_avp_ (string) - an AVP where the pipes' names will be stored.
    
*   _regexp_ (regex, optional) - a regular expression used to filter the names of the pipes. If missing, all the pipes are returned.
    

This function can be used from any route.

**Example�1.17.�`rl_values` usage**

...
	rl\_values($avp(values));
	for ($var(pipe) in $(avp(values)\[\*\]))
		xlog("RATELIMIT: $var(pipe): $rl\_count($var(pipe))\\n");
...