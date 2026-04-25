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