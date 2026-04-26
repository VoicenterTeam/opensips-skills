# cfgutils Module Reference
<!-- generated-from: data/4.0/modules/cfgutils.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 cfgutils module. Read this file when configuring or debugging the cfgutils module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

Useful extensions for the server configuration.

The cfgutils module can be used to introduce randomness to the behaviour of the server. It provides setup functions and the “rand_event” function. This function return either true or false, depending on a random value and a specified probability. E.g. if you set via fifo or script a probability value of 5%, then 5% of all calls to rand_event will return false. The pseudovariable “$RANDOM” could be used to introduce random values e.g. into a SIP reply.

The benefit of this module is the probability of the decision can be manipulated by external applications such as web interface or command line tools. The probability must be specified as percent value, ranging from 0 to 100.

The module exports commands to FIFO server that can be used to change the global settings via FIFO interface. The FIFO commands are: “set_prob”, “reset_prob” and “get_prob”.

This module can be used for simple load-shedding, e.g. reply 5% of the Invites with a 503 error and a adequate random Retry-After value.

The module provides as well functions to delay the execution of the server. The functions “sleep” and “usleep” could be used to let the server wait a specific time interval.

It can also hash the config file used from the server with a (weak) cryptographic hash function on startup. This value is saved and can be later compared to the actual hash, to detect modifications of this file after the server start. This functions are available as the FIFO commands “check_config_hash” and “get_config_hash”.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `hash_file` (string)

The config file name for that a hash value should be calculated on startup.

*Default value is There is no default value.*

**Example.** Set the `hash_file` parameter.

```opensips
modparam("cfgutils", "hash_file", "/etc/opensips/opensips.cfg")
```
### `initial_probability` (string)

The initial value of the probability.

*Default value is 10.*

**Example.** Set the `initial_probability` parameter.

```opensips
modparam("cfgutils", "initial_probability", 15)
```
### `lock_pool_size` (integer)

The number of dynamic script locks to be allocated at OpenSIPS startup. This number must be a power of 2. (i.e. 1, 2, 4, 8, 16, 32, 64 ...)

Note that the _lock_pool_size_ parameter only affects the number of dynamic locks created at startup. The pool of static locks only depends on the number of unique static strings supplied throughout the script to the set of static lock functions.

*Default value is 32.*

**Notes:** This number must be a power of 2. (i.e. 1, 2, 4, 8, 16, 32, 64 ...)

**Example.** Set the `lock_pool_size` parameter.

```opensips
modparam("cfgutils", "lock_pool_size", 64)
```
### `shv_hash_size` (integer)

The size of the hash table used to store the shared variables ($shv).

*Default value is 64.*

**Example.** Set the `shv_hash_size` parameter.

```opensips
modparam("cfgutils", "shv_hash_size", 1024)
```
### `shvset` (string)

Set the value of a shared variable ($shv(name)). The parameter can be set many times.

The value of the parameter has the format: _name_ '=' _type_ ':' _value_

*   _name_: shared variable name
    
*   _type_: type of the value
    
    *   “i”: integer value
        
    *   “s”: string value

*   _value_: value to be set

*Default value is NULL.*

**Possible values:**

- i
- s

**Example.** Set the `shvset` parameter.

```opensips
...
modparam("cfgutils", "shvset", "debug=i:1")
modparam("cfgutils", "shvset", "pstngw=s:sip:10.10.10.10")
...
```
### `varset` (string)

Set the value of a script variable ($var(name)). The parameter can be set many times.

The value of the parameter has the format: _name_ '=' _type_ ':' _value_

*   _name_: shared variable name
    
*   _type_: type of the value
    
    *   “i”: integer value
        
    *   “s”: string value

*   _value_: value to be set

*Default value is NULL.*

**Possible values:**

- i
- s

**Example.** Set the `varset` parameter.

```opensips
...
modparam("cfgutils", "varset", "init=i:1")
modparam("cfgutils", "varset", "gw=s:sip:11.11.11.11;transport=tcp")
...
```

## Exported Functions

### `abort()`

Debugging function that aborts the server. Depending on the configuration of the server a core dump will be created.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Example 1.13. `abort` usage.

```opensips
abort();
```

### `check_time_rec(time_string, [timestamp])`

The function returns a positive value if the specified time recurrence string matches the current time, or a negative value otherwise. For checking some other Unix timestamp than the current one, the second parameter will contain the intended timestamp to check. The syntax of each field is identical to the corresponding field from RFC 2445.

**Parameters:**

- `time_string` *(string, required)* — Time recurrence string which will be matched against the current time. Its fields are separated by "|" and the order in which they are given is: "timezone | dtstart | dtend | duration | freq | until | interval | byday | bymday | byyday | byweekno | bymonth". None of the fields following "freq" is used unless "freq" is defined. If the string ends in multiple null fields, they can all be ommited. The "timezone" field is optional. It represents the timezone in which to interpret the time recurrence elements (e.g. dtstart, dtend, until). By default, the system time zone is used.
- `timestamp` *(string, optional)* — A specific Unix time to check. The function simply expects the actual Unix time here, there is no need to perform any timezone adjustments.

**Return codes:**

- `1` — Success - time recurrence string matches.
- `-1` — Failure.
- `-2` — Parsing error.
- `-3` — Internal error.

**Usable from:** ANY_ROUTE

**Example.** Checks if current time matches a specific interval in Bucharest timezone..

```opensips
# Only passing if still in 2012 and on a Bucharest-compatible timezone
if (check_time_rec("Europe/Bucharest|20120101T000000|20130101T000000"))
	xlog("Current system time matches the given Romanian time interval\n");
```

**Example.** Checks if current time is within 30 days of a start date..

```opensips
# Only passing if less than 30 days have passed from "dtstart", system timezone
if (check_time_rec("20121101T000000||p30d"))
	xlog("Current time matches the given interval\n");
```

### `get_accurate_time(sec, usec, [str_sec_usec])`

Fetch the current Unix time epoch with microsecond precision. Optionally, print this value as a floating point number (3rd parameter).

**Parameters:**

- `sec` *(int, required)* — the current Unix timestamp (integer part)
- `str_sec_usec` *(string, optional)* — the current Unix timestamp as a floating point number (6-digit precision)
- `usec` *(int, required)* — the current Unix timestamp (decimal part)

**Return codes:**

- `1` — Success

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** get_accurate_time usage.

```opensips
...
get_accurate_time($var(sec), $var(usec));
xlog("Current Unix timestamp: $var(sec) s, $var(usec) us\n");
...
```

### `get_dynamic_lock(key)`

Acquire the dynamic lock corresponding to "key". In case the lock is taken by another process, script execution will halt until the lock is released. Attempting to acquire the lock a second time by the same process, without releasing it first, will result in a deadlock.

The dynamic lock functions have the advantage of allowing string variables to be given as parameters, but the drawback to this is that two strings may have the same hashed value, thus pointing to the same lock. As a consequence, either two totally separate regions of the script will be synchronized (they will not execute in parallel), or a process could end up in a deadlock by acquiring two locks in a row on two different (but equally hashed) strings. To address the latter issue, use the strings_share_lock() function to test if two strings hash into the same dynamic lock.

**Parameters:**

- `key` *(var, required)* — key to be hashed in order to obtain the index of a dynamic lock from the pool

**Return codes:**

- `1` — Lock acquired successfully
- `-1` — Error while getting lock

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `release_dynamic_lock`
- `strings_share_lock`

**Example.** acquire and release a dynamic lock on the "Call-ID" header field value.

```opensips
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\n");
}
```

### `get_static_lock(key)`

Acquire the static lock which corresponds to "key". In case the lock is taken by another process, script execution will halt until the lock is released. Attempting to acquire the lock a second time by the same process, without releasing it first, will result in a deadlock.

The static lock functions guarantee that two different strings will never point to the same lock, thus avoiding introducing unnecessary (and transparent!) synchronization between processes. Their disadvantage is the nature of their parameters (static strings), making them inappropriate in certain scenarios.

**Parameters:**

- `key` *(static string, required)* — Key to be hashed in order to obtain the index of a static lock.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `release_static_lock`

**Example.** Acquires and releases a static lock named 'Zone_1'..

```opensips
# acquire and release a static lock 
...
get_static_lock("Zone_1");
...
release_static_lock("Zone_1");
```

### `pkg_status()`

Debugging function that dumps the status for the private (PKG) memory. This information is logged to the default log facility, depending on the general log level and the memlog setting. You need to compile the server with activated memory debugging to get detailed informations.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Example 1.14. `pkg_status` usage.

```opensips
pkg_status();
```

### `rand_event([probability])`

Generates a random floating point value between 0 - 100 and returns true if the value is less or equal to the currently set probability. If "probability" parameter is given, it will override the global parameter set by rand_set_prob().

**Parameters:**

- `probability` *(int, optional)* — probability override

**Return codes:**

- `true` — the generated random value is less or equal to the currently set probability

**Related:**

- `rand_set_prob`

**Example.** rand_event() usage.

```opensips
if (rand_event()) {
  append_to_reply("Retry-After: 120\\n");
  sl_send_reply(503, "Try later");
  exit;
}
# normal message processing follows
```

### `rand_get_prob()`

Return the current probability setting, e.g. for logging purposes.

**Example.** rand_get_prob() usage.

```opensips
rand_get_prob();
```

### `rand_reset_prob()`

Reset the probability back to the initial_probability value.

**Example.** rand_reset_prob() usage.

```opensips
rand_reset_prob();
```

### `rand_set_prob(probability)`

Set the “probability” of the decision.

**Parameters:**

- `probability` *(int, required)* — number ranging from 0 - 99, inclusively
  - `0 - 99`

**Example.** rand_set_prob() usage.

```opensips
rand_set_prob(4);
```

### `release_dynamic_lock(key)`

Release the dynamic lock corresponding to "key". Nothing will happen if the lock is not acquired.

**Parameters:**

- `key` *(var, required)* — key to be hashed in order to obtain the index of a dynamic lock from the pool

**Return codes:**

- `1` — Lock released successfully
- `-1` — Error while releasing lock

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `get_dynamic_lock`

**Example.** acquire and release a dynamic lock on the "Call-ID" header field value.

```opensips
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\n");
}
```

### `release_static_lock(key)`

Release the static lock corresponding to "key". Nothing will happen if the lock is not acquired.

**Parameters:**

- `key` *(static string, required)* — Key to be hashed in order to obtain the index of a static lock.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `get_static_lock`

**Example.** Acquires and releases a static lock named 'Zone_1'..

```opensips
# acquire and release a static lock 
...
get_static_lock("Zone_1");
...
release_static_lock("Zone_1");
```

### `set_count(var_to_count, ret_var)`

Counts the number of values of a given variable. It makes sense to call this function only for variables that can take more values (AVPs, headers). The result is returned in the second parameter.

**Parameters:**

- `ret_var` *(var, required)* — variable to store the result
- `var_to_count` *(var, required)* — variable to count

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Example 1.16. `set_count` usage.

```opensips
set_count($avp(dids), $var(num_dids));
```

### `set_select_weight(int_list_var)`

This function selects an element from a set formed by the integer values of the given "int_list_var" variable. It applies the genetic algorithm - roulette-wheel selection to choose an element from a set. The probability of selecting a certain element is proportionate with its weight. It will return the index of that selected element.

**Parameters:**

- `int_list_var` *(var, required)* — Variable containing the integer values of the set.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Selects a gateway index based on success rates..

```opensips
$var(next_gw_idx) = set_select_weight($avp(gw_success_rates));
```

### `shm_status()`

Debugging function that dumps the status for the shared (SHM) memory. This information is logged to the default log facility, depending on the general log level and the memlog setting. You need to compile the server with activated memory debugging to get detailed informations.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Example 1.15. `shm_status` usage.

```opensips
shm_status();
```

### `shuffle_avps(name)`

Randomly shuffles AVPs with _name_.

**Parameters:**

- `name` *(variable, required)* — name of AVP to shuffle.

**Return codes:**

- `1` — Success
- `-1` — Failure

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** shuffle_avps usage.

```opensips
...
$avp(foo) := "str1";
$avp(foo)  = "str2";
$avp(foo)  = "str3";
xlog("Initial AVP list is: $(avp(foo)[*])\n");       # str3 str2 str1
if(shuffle_avps( $avp(foo) ))
    xlog("Shuffled AVP list is: $(avp(foo)[*])\n");  # str1, str3, str2 (for example)
...
```

### `sleep(time)`

Waits "time" seconds.

**Parameters:**

- `time` *(int, required)* — time to wait in seconds

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** sleep usage.

```opensips
sleep(1);
...
$var(secs) = 10;
sleep($var(secs));
```

### `strings_share_lock(key1, key2)`

A function used to test if two strings will generate the same hash value. Its purpose is to prevent deadlocks resulted when a process successively acquires two dynamic locks on two strings which happen to point to the same lock.

Theoretically, the chance of two strings generating the same hash value decreases proportionally to the increase of the lock_pool_size parameter. In other words, the more dynamic locks you configure the module with, the higher the chance that all individual protected regions of your script will run in parallel, without waiting for each other.

**Parameters:**

- `key1` *(string, required)* — strings which will have their hash values compared
- `key2` *(string, required)* — strings which will have their hash values compared

**Return codes:**

- `1` — Strings share the same lock (hash collision)
- `0` — Strings do not share the same lock

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `get_dynamic_lock`
- `release_dynamic_lock`

**Example.** Proper way of acquiring two dynamic locks successively.

```opensips
# Proper way of acquiring two dynamic locks successively
if (!get_dynamic_lock($avp(foo))) {
	xlog("Error while getting dynamic lock!\n");
}

if (!strings_share_lock($avp(foo), $avp(bar)) {
	if (!get_dynamic_lock($avp(bar))) {
		xlog("Error while getting dynamic lock!\n");
	}
}
...
if (!strings_share_lock($avp(foo), $avp(bar)) {
	if (!release_dynamic_lock($avp(bar)) {
		xlog("Error while releasing dynamic lock!\n");
	}
}

if (!release_dynamic_lock($avp(foo)) {
	xlog("Error while releasing dynamic lock!\n");
}
```

### `ts_usec_delta(t1_sec, t1_usec, t2_sec, t2_usec, [delta_str], [delta_int])`

This function returns the absolute difference between the two given timestamps. The result is expressed as _microseconds_ and can be returned as either string or integer.

**WARNING:** when using _delta_int_, the function will return error code **-1** in case the difference overflows the signed integer holder! (i.e. a diff of ~35 minutes or more)

**Parameters:**

- `delta_int` *(int, optional)* — Variable to store the result as an integer.
- `delta_str` *(string, optional)* — Variable to store the result as a string.
- `t1_sec` *(int, required)* — Seconds of the first timestamp.
- `t1_usec` *(int, required)* — Microseconds of the first timestamp.
- `t2_sec` *(int, required)* — Seconds of the second timestamp.
- `t2_usec` *(int, required)* — Microseconds of the second timestamp.

**Return codes:**

- `-1` — Error - difference overflows the signed integer holder when using delta_int (diff of ~35 minutes or more).

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Calculates the time delta and stores it in a string variable..

```opensips
ts_usec_delta($var(t1s), 300, 10, $var(t2us), $var(diff_str));
```

### `usleep(time)`

Waits "time" micro-seconds.

**Parameters:**

- `time` *(int, required)* — time to wait in micro-seconds

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Example 1.12. `usleep` usage.

```opensips
usleep(500000); # sleep half a sec
```

## Exported Pseudo-Variables

### `$RANDOM`

Returns a random value from the [0 - 2^31) range.

Example 1.37. RANDOM pseudo-variable usage
...
$avp(10) = ($RANDOM / 16777216); # 2^24
if ($avp(10) < 10) {
   $avp(10) = 10;
}
append_to_reply("Retry-After: $avp(10)\\n");
sl_send_reply(503, "Try later");
exit;
# normal message processing follows
...

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global

**Possible values:**

- [0 - 2^31)
### `$ctime(name)`

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

Example 1.38. ctime(name pseudo-variable) usage
...
if ($ctime(year) == 2008) {
	xlog("request: $rm from $fu to $ru in year 2008\\n");
}
...

- **Type:** integer
- **Read/write:** read-only
- **Scope:** global

**Possible values:**

- sec
- min
- hour
- mday
- mon
- year
- wday
- yday
- isdst
### `$env(name)`

This PV provides access to the environment variable 'name'.

Example 1.36. env(name pseudo-variable) usage
...
xlog("PATH environment variable is $env(PATH)\\n");
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** global
### `$shv(name)`

It is a class of pseudo-variables stored in shared memory. The value of $shv(name) is visible across all opensips processes. Each “shv” has single value and it is initialized to integer 0. You can use “shvset” parameter to initialize the shared variable. The module exports a set of MI functions to get/set the value of shared variables.

Example 1.39. shv(name pseudo-variable) usage
...
modparam("cfgutils", "shvset", "debug=i:1")
...
if ($shv(debug) == 1) {
	xlog("request: $rm from $fu to $ru\\n");
}
...

- **Type:** integer
- **Read/write:** read-write
- **Scope:** global

## Exported MI Functions

### `check_config_hash`

Check if the actual config file hash is identical to the stored one.

**Returns:** The function returns 200 OK if the hash values are identical, 400 if there are not identical, 404 if no file for hashing has been configured and 500 on errors. Additional a short text message is printed.

**Example.** check_config_hash usage

```bash
$ opensips-cli -x mi check_config_hash\nThe actual config file hash is identical to the stored one.
```

### `get_config_hash`

Return the stored config file hash.

**Returns:** The function returns 200 OK and the hash value on success or 404 if no file for hashing has been configured.

**Example.** get_config_hash usage

```bash
$ opensips-cli -x mi get_config_hash\n1580a37104eb4de69ab9f31ce8d6e3e0
```

### `rand_get_prob`

Return the actual probability setting.

**Returns:** The function return the actual probability value.

**Example.** rand_get_prob usage

```bash
$ opensips-cli -x mi get_prob\nThe actual probability is 50 percent.
```

### `rand_reset_prob`

Reset the probability value to the inital start value. This command don't need a parameter.

**Returns:** Not specified

**Example.** rand_reset_prob usage

```bash
$ opensips-cli -x mi rand_reset_prob
```

### `rand_set_prop`

Set the probability value to the given parameter.

**Parameters:**

- `prob_proc` *(integer, required)* — the parameter should be a percent value (number from 0 to 99).

**Returns:** Not specified

**Example.** rand_set_prob usage

```bash
$ opensips-cli -x mi rand_set_prob 10
```

### `shv_get`

Get the value of a shared variable ($shv(name)).

**Parameters:**

- `name` *(string, optional)* — shared variable name. If this parameter is missing, all shared variables are returned.

**Returns:** Returns the value of the shared variable, or all shared variables if no name is provided.

**Example.** shv_get usage

```bash
$ opensips-cli -x mi shv_get debug\n$ opensips-cli -x mi shv_get
```

### `shv_set`

Set the value of a shared variable ($shv(name)).

**Parameters:**

- `name` *(string, required)* — shared variable name
- `type` *(string, required)* — type of the value ("int": integer value, "str": string value)
- `value` *(string, required)* — value to be set

**Returns:** Not specified

**Example.** shv_set usage

```bash
$ opensips-cli -x mi shv_set debug int 0
```

## Configuration Examples

### `initial_probability` parameter usage

The initial value of the probability.

```opensips
modparam("cfgutils", "initial_probability", 15)
```
### `hash_file` parameter usage

The config file name for that a hash value should be calculated on startup.

```opensips
modparam("cfgutils", "hash_file", "/etc/opensips/opensips.cfg")
```
### `shv_hash_size` parameter usage

The size of the hash table used to store the shared variables ($shv).

```opensips
modparam("cfgutils", "shv_hash_size", 1024)
```
### `shvset` parameter usage

Set the value of a shared variable ($shv(name)).

```opensips
...
modparam("cfgutils", "shvset", "debug=i:1")
modparam("cfgutils", "shvset", "pstngw=s:sip:10.10.10.10")
...
```
### `varset` parameter usage

Set the value of a script variable ($var(name)).

```opensips
...
modparam("cfgutils", "varset", "init=i:1")
modparam("cfgutils", "varset", "gw=s:sip:11.11.11.11;transport=tcp")
...
```
### Setting lock_pool_size module parameter

The number of dynamic script locks to be allocated at OpenSIPS startup.

```opensips
modparam("cfgutils", "lock_pool_size", 64)
```
### `rand_event()` usage

Generates a random floating point value between 0 - 100 and returns true if the value is less or equal to the currently set probability.

```opensips
...
if (rand_event()) {
  append_to_reply("Retry-After: 120\\n");
  sl_send_reply(503, "Try later");
  exit;
}
# normal message processing follows
...
```
### `rand_set_prob()` usage

Set the “probability” of the decision.

```opensips
...
rand_set_prob(4);
...
```
### `rand_reset_prob()` usage

Reset the probability back to the initial_probability value.

```opensips
...
rand_reset_prob();
...
```
### `rand_get_prob()` usage

Return the current probability setting, e.g. for logging purposes.

```opensips
...
rand_get_prob();
   
```
### `sleep` usage

Waits "time" seconds.

```opensips
...
sleep(1);
...
$var(secs) = 10;
sleep($var(secs));
...
```
### `usleep` usage

Waits "time" micro-seconds.

```opensips
...
usleep(500000); # sleep half a sec
...
```
### `abort` usage

Debugging function that aborts the server.

```opensips
...
abort();
...
```
### `pkg_status` usage

Debugging function that dumps the status for the private (PKG) memory.

```opensips
...
pkg_status();
...
```
### `shm_status` usage

Debugging function that dumps the status for the shared (SHM) memory.

```opensips
...
shm_status();
...
```
### `set_count` usage

Counts the number of values of a given variable.

```opensips
...
set_count($avp(dids), $var(num_dids));
...
```
### `set_select_weight` usage

This function selects an element from a set formed by the integer values of the given "int_list_var" variable.

```opensips
...
$var(next_gw_idx) = set_select_weight($avp(gw_success_rates));
...
```
### `ts_usec_delta` usage

This function returns the absolute difference between the two given timestamps.

```opensips
...
ts_usec_delta($var(t1s), 300, 10, $var(t2us), $var(diff_str));
...
```
### `check_time_rec` usage

The function returns a positive value if the specified time recurrence string matches the current time.

```opensips
...
# Only passing if still in 2012 and on a Bucharest-compatible timezone
if (check_time_rec("Europe/Bucharest|20120101T000000|20130101T000000"))
	xlog("Current system time matches the given Romanian time interval\\n");
...
# Only passing if less than 30 days have passed from "dtstart", system timezone
if (check_time_rec("20121101T000000||p30d"))
	xlog("Current time matches the given interval\\n");
...
```
### `get_static_lock` usage

Acquire the static lock which corresponds to "key".

```opensips
# acquire and release a static lock 
...
get_static_lock("Zone_1");
...
release_static_lock("Zone_1");
...
```
### `release_static_lock` usage

Release the static lock corresponding to "key".

```opensips
# acquire and release a static lock 
...
get_static_lock("Zone_1");
...
release_static_lock("Zone_1");
...
```
### `get_dynamic_lock` usage

Acquire the dynamic lock corresponding to "key".

```opensips
...
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\\n");
}
...
```
### `release_dynamic_lock` usage

Release the dynamic lock corresponding to "key".

```opensips
...
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\\n");
}
...
```
### `strings_share_lock` usage

A function used to test if two strings will generate the same hash value.

```opensips
...
# Proper way of acquiring two dynamic locks successively
if (!get_dynamic_lock($avp(foo))) {
	xlog("Error while getting dynamic lock!\\n");
}

if (!strings_share_lock($avp(foo), $avp(bar)) {
	if (!get_dynamic_lock($avp(bar))) {
		xlog("Error while getting dynamic lock!\\n");
	}
}
...
if (!strings_share_lock($avp(foo), $avp(bar)) {
	if (!release_dynamic_lock($avp(bar)) {
		xlog("Error while releasing dynamic lock!\\n");
	}
}

if (!release_dynamic_lock($avp(foo)) {
	xlog("Error while releasing dynamic lock!\\n");
}
...
```
### `get_accurate_time` usage

Fetch the current Unix time epoch with microsecond precision.

```opensips
...
get_accurate_time($var(sec), $var(usec));
xlog("Current Unix timestamp: $var(sec) s, $var(usec) us\\n");
...
```
### `shuffle_avps` usage

Randomly shuffles AVPs with name.

```opensips
...
$avp(foo) := "str1";
$avp(foo)  = "str2";
$avp(foo)  = "str3";
xlog("Initial AVP list is: $(avp(foo)[\*])\\n");       # str3 str2 str1
if(shuffle_avps( $avp(foo) ))
    xlog("Shuffled AVP list is: $(avp(foo)[\*])\\n");  # str1, str3, str2 (for example)
...
```
### `async sleep` usage

Waits a number of seconds. This function does exactly the same as sleep(), but in an asynchronous way.

```opensips
{
...
async( sleep("5"), after_sleep );
}

route[after_sleep] {
...
}
```
### `async usleep` usage

Waits a number of micro-seconds. This function does exactly the same as usleep(), but in an asynchronous way.

```opensips
{
...
async( usleep("1000"), after_usleep );
}

route[after_usleep] {
...
}
```
### `rand_set_prob` usage

Set the probability value to the given parameter.

```opensips
$ opensips-cli -x mi rand_set_prob 10
```
### `rand_reset_prob` usage

Reset the probability value to the inital start value.

```opensips
$ opensips-cli -x mi rand_reset_prob
```
### `rand_get_prob` usage

Return the actual probability setting.

```opensips
...
$ opensips-cli -x mi get_prob
The actual probability is 50 percent.
...
```
### `check_config_hash` usage

Check if the actual config file hash is identical to the stored one.

```opensips
...
$ opensips-cli -x mi check_config_hash
The actual config file hash is identical to the stored one.
...
```
### `get_config_hash` usage

Return the stored config file hash.

```opensips
...
$ opensips-cli -x mi get_config_hash
1580a37104eb4de69ab9f31ce8d6e3e0
...
```
### `shv_set` usage

Set the value of a shared variable ($shv(name)).

```opensips
$ opensips-cli -x mi shv_set debug int 0
```
### `shv_get` usage

Get the value of a shared variable ($shv(name)).

```opensips
...
$ opensips-cli -x mi shv_get debug
$ opensips-cli -x mi shv_get
...
```
### `env(name) pseudo-variable` usage

This PV provides access to the environment variable 'name'.

```opensips
...
xlog("PATH environment variable is $env(PATH)\\n");
...
```
### `RANDOM pseudo-variable` usage

Returns a random value from the [0 - 2^31) range.

```opensips
...
$avp(10) = ($RANDOM / 16777216); # 2^24
if ($avp(10) < 10) {
   $avp(10) = 10;
}
append_to_reply("Retry-After: $avp(10)\\n");
sl_send_reply(503, "Try later");
exit;
# normal message processing follows
```
### `ctime(name) pseudo-variable` usage

The PV provides access to broken-down time attributes.

```opensips
...
if ($ctime(year) == 2008) {
	xlog("request: $rm from $fu to $ru in year 2008\\n");
}
...
```
### `shv(name) pseudo-variable` usage

It is a class of pseudo-variables stored in shared memory.

```opensips
...
modparam("cfgutils", "shvset", "debug=i:1")
...
if ($shv(debug) == 1) {
	xlog("request: $rm from $fu to $ru\\n");
}
...
```
