# cfgutils Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6003792)

2.2. [Most recently active contributors(1) to this module](#idp6104832)

**List of Examples**

1.1. [`initial_probability` parameter usage](#idp3808064)

1.2. [`hash_file` parameter usage](#idp4211792)

1.3. [`shv_hash_size` parameter usage](#idp1813280)

1.4. [`shvset` parameter usage](#idp2733264)

1.5. [`varset` parameter usage](#idp5087632)

1.6. [Setting lock\_pool\_size module parameter](#idp3857904)

1.7. [`rand_event()` usage](#idp4429184)

1.8. [`rand_set_prob()` usage](#idp1137552)

1.9. [`rand_reset_prob()` usage](#idp5330032)

1.10. [`rand_get_prob()` usage](#idp212288)

1.11. [`sleep` usage](#idp166192)

1.12. [`usleep` usage](#idp173088)

1.13. [`abort` usage](#idp5591696)

1.14. [`pkg_status` usage](#idp5596640)

1.15. [`shm_status` usage](#idp5601584)

1.16. [`set_count` usage](#idp5606784)

1.17. [`set_select_weight` usage](#idp5611792)

1.18. [`ts_usec_delta` usage](#idp5619168)

1.19. [`check_time_rec` usage](#idp5634112)

1.20. [`get_static_lock` usage](#idp250208)

1.21. [`release_static_lock` usage](#idp5657568)

1.22. [`get_dynamic_lock` usage](#idp5665984)

1.23. [`release_dynamic_lock` usage](#idp5672944)

1.24. [`strings_share_lock` usage](#idp5681200)

1.25. [`get_accurate_time` usage](#idp5690528)

1.26. [`shuffle_avps` usage](#idp5697488)

1.27. [`async sleep` usage](#idp5703904)

1.28. [`async usleep` usage](#idp5709376)

1.29. [`rand_set_prob` usage](#idp5716368)

1.30. [`rand_reset_prob` usage](#idp5720640)

1.31. [`rand_get_prob` usage](#idp5725040)

1.32. [`check_config_hash` usage](#idp5729744)

1.33. [`get_config_hash` usage](#idp5734288)

1.34. [`shv_set` usage](#idp5743648)

1.35. [`shv_get` usage](#idp5749184)

1.36. [`env(name) pseudo-variable` usage](#idp5753936)

1.37. [`RANDOM pseudo-variable` usage](#idp5757584)

1.38. [`ctime(name) pseudo-variable` usage](#idp5772160)

1.39. [`shv(name) pseudo-variable` usage](#idp5777008)

## Chapter�1.�Admin Guide

## 1.1.�Overview

Useful extensions for the server configuration.

The cfgutils module can be used to introduce randomness to the behaviour of the server. It provides setup functions and the “rand\_event” function. This function return either true or false, depending on a random value and a specified probability. E.g. if you set via fifo or script a probability value of 5%, then 5% of all calls to rand\_event will return false. The pseudovariable “$RANDOM” could be used to introduce random values e.g. into a SIP reply.

The benefit of this module is the probability of the decision can be manipulated by external applications such as web interface or command line tools. The probability must be specified as percent value, ranging from 0 to 100.

The module exports commands to FIFO server that can be used to change the global settings via FIFO interface. The FIFO commands are: “set\_prob”, “reset\_prob” and “get\_prob”.

This module can be used for simple load-shedding, e.g. reply 5% of the Invites with a 503 error and a adequate random Retry-After value.

The module provides as well functions to delay the execution of the server. The functions “sleep” and “usleep” could be used to let the server wait a specific time interval.

It can also hash the config file used from the server with a (weak) cryptographic hash function on startup. This value is saved and can be later compared to the actual hash, to detect modifications of this file after the server start. This functions are available as the FIFO commands “check\_config\_hash” and “get\_config\_hash”.

## 1.2.�Dependencies

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _none_
    

## 1.3.�Exported Parameters

### 1.3.1.�`initial_probability` (string)

The initial value of the probability.

Default value is “10”.

**Example�1.1.�`initial_probability` parameter usage**

   
modparam("cfgutils", "initial\_probability", 15)
   

  

### 1.3.2.�`hash_file` (string)

The config file name for that a hash value should be calculated on startup.

There is no default value, is no parameter is given the hash functionality is disabled.

**Example�1.2.�`hash_file` parameter usage**

   
modparam("cfgutils", "hash\_file", "/etc/opensips/opensips.cfg")
   

  

### 1.3.3.�`shv_hash_size` (integer)

The size of the hash table used to store the shared variables ($shv).

Default value is “64”.

**Example�1.3.�`shv_hash_size` parameter usage**

modparam("cfgutils", "shv\_hash\_size", 1024)

  

### 1.3.4.�`shvset` (string)

Set the value of a shared variable ($shv(name)). The parameter can be set many times.

The value of the parameter has the format: \_name\_ '=' \_type\_ ':' \_value\_

*   \_name\_: shared variable name
    
*   \_type\_: type of the value
    
    *   “i”: integer value
        
    *   “s”: string value
        
    
*   \_value\_: value to be set
    

Default value is “NULL”.

**Example�1.4.�`shvset` parameter usage**

...
modparam("cfgutils", "shvset", "debug=i:1")
modparam("cfgutils", "shvset", "pstngw=s:sip:10.10.10.10")
...

  

### 1.3.5.�`varset` (string)

Set the value of a script variable ($var(name)). The parameter can be set many times.

The value of the parameter has the format: \_name\_ '=' \_type\_ ':' \_value\_

*   \_name\_: shared variable name
    
*   \_type\_: type of the value
    
    *   “i”: integer value
        
    *   “s”: string value
        
    
*   \_value\_: value to be set
    

Default value is “NULL”.

**Example�1.5.�`varset` parameter usage**

...
modparam("cfgutils", "varset", "init=i:1")
modparam("cfgutils", "varset", "gw=s:sip:11.11.11.11;transport=tcp")
...

  

### 1.3.6.�`lock_pool_size` (integer)

The number of dynamic script locks to be allocated at OpenSIPS startup. This number must be a power of 2. (i.e. 1, 2, 4, 8, 16, 32, 64 ...)

Note that the _lock\_pool\_size_ parameter only affects the number of dynamic locks created at startup. The pool of static locks only depends on the number of unique static strings supplied throughout the script to the set of static lock functions.

Default value is “32”.

**Example�1.6.�Setting lock\_pool\_size module parameter**

modparam("cfgutils", "lock\_pool\_size", 64)

  

## 1.4.�Exported Functions

### 1.4.1.�`rand_event([probability])`

Generates a random floating point value between 0 - 100 and returns true if the value is less or equal to the currently set probability. If "probability" parameter is given, it will override the global parameter set by [rand\_set\_prob()](#func_rand_set_prob "1.4.2.�rand_set_prob(probability)").

Parameters:

*   probability (int, optional) - probability override
    

**Example�1.7.�`rand_event()` usage**

...
if (rand\_event()) {
  append\_to\_reply("Retry-After: 120\\n");
  sl\_send\_reply(503, "Try later");
  exit;
}
# normal message processing follows
...

  

### 1.4.2.�`rand_set_prob(probability)`

Set the “probability” of the decision.

Parameters:

*   probability (int) - number ranging from 0 - 99, inclusively
    

**Example�1.8.�`rand_set_prob()` usage**

...
rand\_set\_prob(4);
...

  

### 1.4.3.�`rand_reset_prob()`

Reset the probability back to the [initial\_probability](#param_initial_probability "1.3.1.�initial_probability (string)") value.

**Example�1.9.�`rand_reset_prob()` usage**

...
rand\_reset\_prob();
...

  

### 1.4.4.�`rand_get_prob()`

Return the current probability setting, e.g. for logging purposes.

**Example�1.10.�`rand_get_prob()` usage**

...
rand\_get\_prob();
   

  

### 1.4.5.� `sleep(time)`

Waits "time" seconds.

Meaning of the parameters is as follows:

*   _time (int)_ - time to wait in seconds
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.11.�`sleep` usage**

...
sleep(1);
...
$var(secs) = 10;
sleep($var(secs));
...
			

  

### 1.4.6.� `usleep(time)`

Waits "time" micro-seconds.

Meaning of the parameters is as follows:

*   _time (int)_ - time to wait in micro-seconds
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.12.�`usleep` usage**

...
usleep(500000); # sleep half a sec
...
			

  

### 1.4.7.� `abort()`

Debugging function that aborts the server. Depending on the configuration of the server a core dump will be created.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.13.�`abort` usage**

...
abort();
...
			

  

### 1.4.8.� `pkg_status()`

Debugging function that dumps the status for the private (PKG) memory. This information is logged to the default log facility, depending on the general log level and the memlog setting. You need to compile the server with activated memory debugging to get detailed informations.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.14.�`pkg_status` usage**

...
pkg\_status();
...
			

  

### 1.4.9.� `shm_status()`

Debugging function that dumps the status for the shared (SHM) memory. This information is logged to the default log facility, depending on the general log level and the memlog setting. You need to compile the server with activated memory debugging to get detailed informations.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.15.�`shm_status` usage**

...
shm\_status();
...
			

  

### 1.4.10.� `set_count(var_to_count, ret_var)`

Counts the number of values of a given variable. It makes sense to call this function only for variables that can take more values (AVPs, headers).

The result is returned in the second parameter.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.16.�`set_count` usage**

...
set\_count($avp(dids), $var(num\_dids));
...
			

  

### 1.4.11.� `set_select_weight(int_list_var)`

This function selects an element from a set formed by the integer values of the given "int\_list\_var" variable. It applies the genetic algorithm - roulette-wheel selection to choose an element from a set. The probability of selecting a certain element is proportionate with its weight. It will return the index of that selected element.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.17.�`set_select_weight` usage**

...
$var(next\_gw\_idx) = set\_select\_weight($avp(gw\_success\_rates));
...
			

  

### 1.4.12.� `ts_usec_delta(t1_sec, t1_usec, t2_sec, t2_usec, [delta_str], [delta_int])`

This function returns the absolute difference between the two given timestamps. The result is expressed as _microseconds_ and can be returned as either string or integer.

**WARNING:** when using _delta\_int_, the function will return error code **\-1** in case the difference overflows the signed integer holder! (i.e. a diff of ~35 minutes or more)

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.18.�`ts_usec_delta` usage**

...
ts\_usec\_delta($var(t1s), 300, 10, $var(t2us), $var(diff\_str));
...
			

  

### 1.4.13.� `check_time_rec(time_string, [timestamp])`

The function returns a positive value if the specified time recurrence string matches the current time, or a negative value otherwise.

For checking some other Unix timestamp than the current one, the second parameter will contain the intended timestamp to check.

The syntax of each field is identical to the corresponding field from RFC 2445.

This function may be used from any route. It returns 1 on success and -1, -2 or -3 on failure, parsing or internal errors, respectively.

Meaning of the parameters is as follows:

*   _time\_string (string)_ - Time recurrence string which will be matched against the current time. Its fields are separated by "|" and the order in which they are given is: "timezone | dtstart | dtend | duration | freq | until | interval | byday | bymday | byyday | byweekno | bymonth".
    
    None of the fields following "freq" is used unless "freq" is defined. If the string ends in multiple null fields, they can all be ommited.
    
    The "timezone" field is optional. It represents the timezone in which to interpret the time recurrence elements (e.g. dtstart, dtend, until). By default, the system time zone is used.
    
*   _timestamp (string, optional)_ - A specific Unix time to check. The function simply expects the actual Unix time here, there is no need to perform any timezone adjustments.
    

Additionally, more complex time recurrence strings may be built by connecting multiple time recurrence strings (described above) using the logical AND ("&"), OR ("/") and NEG ("!") operators. Furthermore, the expressions may be paranthesized. Some examples:

*   20210104T080000|20211231T180000||WEEKLY|||MO,TU,WE,TH,FR & !20210104T120000|20211231T140000||WEEKLY|||MO,TU,WE,TH,FR
    
    This example multi-recurrence expresses the working days schedule for company X during 2021: workdays from 8-18, except the 12-14 interval, when everyone is out for lunch break and the business is closed. Since the timezone is omitted from each schedule, the operating system timezone will be used instead.
    
*   America/New\_York|20210104T090000|20210104T170000||WEEKLY|||MO,TU,WE,TH,FR & !(Europe/Amsterdam|20210427T000000|20210428T000000 / Europe/London|20211227T000000|20211228T000000)
    
    This example multi-recurrence expresses the working days schedule for US-based company Y during 2021: workdays from 9-17 (NY timezone), except european holidays such as King's Day (April 27th, NL) or the Spring Bank Holiday (May 31st, UK), when most of its workforce will have flown back to Europe.
    

**Example�1.19.�`check_time_rec` usage**

...
# Only passing if still in 2012 and on a Bucharest-compatible timezone
if (check\_time\_rec("Europe/Bucharest|20120101T000000|20130101T000000"))
	xlog("Current system time matches the given Romanian time interval\\n");
...
# Only passing if less than 30 days have passed from "dtstart", system timezone
if (check\_time\_rec("20121101T000000||p30d"))
	xlog("Current time matches the given interval\\n");
...
			

  

### 1.4.14.� `get_static_lock(key)`

Acquire the static lock which corresponds to "key". In case the lock is taken by another process, script execution will halt until the lock is released. Attempting to acquire the lock a second time by the same process, without releasing it first, will result in a deadlock.

The static lock functions guarantee that two different strings will never point to the same lock, thus avoiding introducing unnecessary (and transparent!) synchronization between processes. Their disadvantage is the nature of their parameters (static strings), making them inappropriate in certain scenarios.

Meaning of the parameters is as follows:

*   _key (static string)_ - key to be hashed in order to obtain the index of a static lock
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE.

**Example�1.20.�`get_static_lock` usage**

\# acquire and release a static lock 
...
get\_static\_lock("Zone\_1");
...
release\_static\_lock("Zone\_1");
...

  

### 1.4.15.� `release_static_lock(key)`

Release the static lock corresponding to "key". Nothing will happen if the lock is not acquired.

Meaning of the parameters is as follows:

*   _key (static string)_ - key to be hashed in order to obtain the index of a static lock.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE|EVENT\_ROUTE.

**Example�1.21.�`release_static_lock` usage**

\# acquire and release a static lock 
...
get\_static\_lock("Zone\_1");
...
release\_static\_lock("Zone\_1");
...

  

### 1.4.16.� `get_dynamic_lock(key)`

Acquire the dynamic lock corresponding to "key". In case the lock is taken by another process, script execution will halt until the lock is released. Attempting to acquire the lock a second time by the same process, without releasing it first, will result in a deadlock.

The dynamic lock functions have the advantage of allowing string variables to be given as parameters, but the drawback to this is that two strings may have the same hashed value, thus pointing to the same lock. As a consequence, either two totally separate regions of the script will be synchronized (they will not execute in parallel), or a process could end up in a deadlock by acquiring two locks in a row on two different (but equally hashed) strings. To address the latter issue, use the [strings\_share\_lock()](#func_strings_share_lock "1.4.18.� strings_share_lock(key1, key2)") function to test if two strings hash into the same dynamic lock.

Meaning of the parameters is as follows:

*   _key (var)_ - key to be hashed in order to obtain the index of a dynamic lock from the pool
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE|EVENT\_ROUTE.

**Example�1.22.�`get_dynamic_lock` usage**

...
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get\_dynamic\_lock($ci)) {
	xlog("Error while getting dynamic lock!\\n");
}
...
if (!release\_dynamic\_lock($ci) {
	xlog("Error while releasing dynamic lock!\\n");
}
...

  

### 1.4.17.� `release_dynamic_lock(key)`

Release the dynamic lock corresponding to "key". Nothing will happen if the lock is not acquired.

Meaning of the parameters is as follows:

*   _key (var)_ - key to be hashed in order to obtain the index of a dynamic lock from the pool
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE|EVENT\_ROUTE.

**Example�1.23.�`release_dynamic_lock` usage**

...
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get\_dynamic\_lock($ci)) {
	xlog("Error while getting dynamic lock!\\n");
}
...
if (!release\_dynamic\_lock($ci) {
	xlog("Error while releasing dynamic lock!\\n");
}
...

  

### 1.4.18.� `strings_share_lock(key1, key2)`

A function used to test if two strings will generate the same hash value. Its purpose is to prevent deadlocks resulted when a process successively acquires two dynamic locks on two strings which happen to point to the same lock.

Theoretically, the chance of two strings generating the same hash value decreases proportionally to the increase of the [lock\_pool\_size](#param_lock_pool_size "1.3.6.�lock_pool_size (integer)") parameter. In other words, the more dynamic locks you configure the module with, the higher the chance that all individual protected regions of your script will run in parallel, without waiting for each other.

Meaning of the parameters is as follows:

*   _key1, key2 (string)_ - strings which will have their hash values compared
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE|EVENT\_ROUTE.

**Example�1.24.�`strings_share_lock` usage**

...
# Proper way of acquiring two dynamic locks successively
if (!get\_dynamic\_lock($avp(foo))) {
	xlog("Error while getting dynamic lock!\\n");
}

if (!strings\_share\_lock($avp(foo), $avp(bar)) {
	if (!get\_dynamic\_lock($avp(bar))) {
		xlog("Error while getting dynamic lock!\\n");
	}
}
...
if (!strings\_share\_lock($avp(foo), $avp(bar)) {
	if (!release\_dynamic\_lock($avp(bar)) {
		xlog("Error while releasing dynamic lock!\\n");
	}
}

if (!release\_dynamic\_lock($avp(foo)) {
	xlog("Error while releasing dynamic lock!\\n");
}
...

  

### 1.4.19.� `get_accurate_time(sec, usec, [str_sec_usec])`

Fetch the current Unix time epoch with microsecond precision. Optionally, print this value as a floating point number (3rd parameter).

Meaning of the parameters is as follows:

*   _sec (int)_ - the current Unix timestamp (integer part)
    
*   _usec (int)_ - the current Unix timestamp (decimal part)
    
*   _str\_sec\_usec (string, optional)_ - the current Unix timestamp as a floating point number (6-digit precision)
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE.

**Example�1.25.�`get_accurate_time` usage**

...
get\_accurate\_time($var(sec), $var(usec));
xlog("Current Unix timestamp: $var(sec) s, $var(usec) us\\n");
...

  

### 1.4.20.� `shuffle_avps(name)`

Randomly shuffles AVPs with _name_.

Meaning of the parameters is as follows:

*   _name (variable)_ - name of AVP to shuffle.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and ONREPLY\_ROUTE.

**Example�1.26.�`shuffle_avps` usage**

...
$avp(foo) := "str1";
$avp(foo)  = "str2";
$avp(foo)  = "str3";
xlog("Initial AVP list is: $(avp(foo)\[\*\])\\n");       # str3 str2 str1
if(shuffle\_avps( $avp(foo) ))
    xlog("Shuffled AVP list is: $(avp(foo)\[\*\])\\n");  # str1, str3, str2 (for example)
...
				

  

## 1.5.�Exported Asyncronous Functions

### 1.5.1.� `sleep(seconds)`

Waits a number of seconds. This function does exactly the same as [sleep()](#func_sleep "1.4.5.� sleep(time)"), but in an asynchronous way. The script execution is suspended until the waiting is done; then OpenSIPS resumes the script execution via the resume route.

To read and understand more on the asynchronous functions, how to use them and what are their advantages, please refer to the OpenSIPS online Manual.

**Example�1.27.�`async sleep` usage**

{
...
async( sleep("5"), after\_sleep );
}

route\[after\_sleep\] {
...
}

  

### 1.5.2.� `usleep(seconds)`

Waits a number of micro-seconds. This function does exactly the same as [usleep()](#func_usleep "1.4.6.� usleep(time)"), but in an asynchronous way. The script execution is suspended until the waiting is done; then OpenSIPS resumes the script execution via the resume route.

To read and understand more on the asynchronous functions, how to use them and what are their advantages, please refer to the OpenSIPS online Manual.

**Example�1.28.�`async usleep` usage**

{
...
async( usleep("1000"), after\_usleep );
}

route\[after\_usleep\] {
...
}

  

## 1.6.�Exported MI Functions

### 1.6.1.�`rand_set_prop`

Set the probability value to the given parameter.

Parameters:

*   _prob\_proc_ - the parameter should be a percent value (number from 0 to 99).
    

**Example�1.29.�`rand_set_prob` usage**

...
$ opensips-cli -x mi rand\_set\_prob 10
...

  

### 1.6.2.�`rand_reset_prob`

Reset the probability value to the inital start value.

This command don't need a parameter.

**Example�1.30.� `rand_reset_prob` usage**

...
$ opensips-cli -x mi rand\_reset\_prob
...

  

### 1.6.3.�`rand_get_prob`

Return the actual probability setting.

The function return the actual probability value.

**Example�1.31.�`rand_get_prob` usage**

...
$ opensips-cli -x mi get\_prob
The actual probability is 50 percent.
...

  

### 1.6.4.�`check_config_hash`

Check if the actual config file hash is identical to the stored one.

The function returns 200 OK if the hash values are identical, 400 if there are not identical, 404 if no file for hashing has been configured and 500 on errors. Additional a short text message is printed.

**Example�1.32.�`check_config_hash` usage**

...
$ opensips-cli -x mi check\_config\_hash
The actual config file hash is identical to the stored one.
...

  

### 1.6.5.�`get_config_hash`

Return the stored config file hash.

The function returns 200 OK and the hash value on success or 404 if no file for hashing has been configured.

**Example�1.33.�`get_config_hash` usage**

...
$ opensips-cli -x mi get\_config\_hash
1580a37104eb4de69ab9f31ce8d6e3e0
...

  

### 1.6.6.�`shv_set`

Set the value of a shared variable ($shv(name)).

Parameters:

*   _name_ : shared variable name
    
*   _type_ : type of the value
    
    *   “int”: integer value
        
    *   “str”: string value
        
    
*   _value_ : value to be set
    

**Example�1.34.�`shv_set` usage**

...
$ opensips-cli -x mi shv\_set debug int 0
...

  

### 1.6.7.�`shv_get`

Get the value of a shared variable ($shv(name)).

Parameters:

*   _name_ : shared variable name. If this parameter is missing, all shared variables are returned.
    

**Example�1.35.�`shv_get` usage**

...
$ opensips-cli -x mi shv\_get debug
$ opensips-cli -x mi shv\_get
...

  

## 1.7.�Exported Pseudo-Variables

### 1.7.1.�`$env(name)`

This PV provides access to the environment variable 'name'.

**Example�1.36.�`env(name) pseudo-variable` usage**

...
xlog("PATH environment variable is $env(PATH)\\n");
...
				 

  

### 1.7.2.�`$RANDOM`

Returns a random value from the \[0 - 2^31) range.

**Example�1.37.�`RANDOM pseudo-variable` usage**

...
$avp(10) = ($RANDOM / 16777216); # 2^24
if ($avp(10) < 10) {
   $avp(10) = 10;
}
append\_to\_reply("Retry-After: $avp(10)\\n");
sl\_send\_reply(503, "Try later");
exit;
# normal message processing follows
   
				 

  

### 1.7.3.�`$ctime(name)`

The PV provides access to broken-down time attributes.

The “name” can be:

*   _sec_ - return seconds (int 0-59)
    
*   _min_ - return minutes (int 0-59)
    
*   _hour_ - return hours (int 0-23)
    
*   _mday_ - return the day of month (int 0-59)
    
*   _mon_ - return the month (int 1-12)
    
*   _year_ - return the year (int, e.g., 2008)
    
*   _wday_ - return the day of week (int, 1=Sunday - 7=Saturday)
    
*   _yday_ - return the day of year (int, 1-366)
    
*   _isdst_ - return daylight saving time status (int, 0 - DST off, >0 DST on)
    

**Example�1.38.�`ctime(name) pseudo-variable` usage**

...
if ($ctime(year) == 2008) {
	xlog("request: $rm from $fu to $ru in year 2008\\n");
}
...
				 

  

### 1.7.4.�`$shv(name)`

It is a class of pseudo-variables stored in shared memory. The value of $shv(name) is visible across all opensips processes. Each “shv” has single value and it is initialized to integer 0. You can use “shvset” parameter to initialize the shared variable. The module exports a set of MI functions to get/set the value of shared variables.

**Example�1.39.�`shv(name) pseudo-variable` usage**

...
modparam("cfgutils", "shvset", "debug=i:1")
...
if ($shv(debug) == 1) {
	xlog("request: $rm from $fu to $ru\\n");
}
...
				 

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

94

44

2966

1512

2.

Henning Westerholt ([@henningw](https://github.com/henningw))

30

18

1088

86

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

29

23

462

109

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

21

7

357

548

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

20

15

289

79

6.

Elena-Ramona Modroiu

14

3

1183

7

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

12

10

84

32

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

7

5

24

18

9.

Anca Vamanu

6

3

220

14

10.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

5

1

18

161

  

**All remaining contributors**: Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Sergio Gutierrez, Konstantin Bokarius, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert, Alexandra Titoc.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Alexandra Titoc

Sep 2024 - Sep 2024

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Sep 2012 - May 2024

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Feb 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Dec 2015 - Nov 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2023

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Oct 2010 - Jan 2020

7.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

8.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

Dec 2015 - Dec 2015

9.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

Jan 2015 - Jan 2015

10.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jan 2013 - Jul 2014

  

**All remaining contributors**: Anca Vamanu, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Elena-Ramona Modroiu, Konstantin Bokarius, Edson Gellert Schubert.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Anca Vamanu, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Elena-Ramona Modroiu, Konstantin Bokarius, Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2007-2008 1und1 Internet AG

Copyright � 2007-2008 BASIS AudioNet GmbH

Copyright � 2007-2008 Elena-Ramona Modroiu