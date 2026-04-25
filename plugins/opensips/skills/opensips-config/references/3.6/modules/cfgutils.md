# cfgutils Module Reference
<!-- generated-from: data/3.6/modules/cfgutils.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 cfgutils module. Read this file when configuring or debugging the cfgutils module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

There is no default value, is no parameter is given the hash functionality is disabled.

**Example.** /etc/opensips/opensips.cfg.

```opensips
modparam("cfgutils", "hash_file", "/etc/opensips/opensips.cfg")
```
### `initial_probability` (string)

The initial value of the probability.

*Default value is 10.*

**Example.** 15.

```opensips
modparam("cfgutils", "initial_probability", 15)
```
### `lock_pool_size` (integer)

The number of dynamic script locks to be allocated at OpenSIPS startup. This number must be a power of 2. (i.e. 1, 2, 4, 8, 16, 32, 64 ...)

*Default value is 32.*

**Possible values:**

- 1
- 2
- 4
- 8
- 16
- 32
- 64
- ...

**Notes:** Note that the _lock_pool_size_ parameter only affects the number of dynamic locks created at startup. The pool of static locks only depends on the number of unique static strings supplied throughout the script to the set of static lock functions.

**Example.** 64.

```opensips
modparam("cfgutils", "lock_pool_size", 64)
```
### `shv_hash_size` (integer)

The size of the hash table used to store the shared variables ($shv).

*Default value is 64.*

**Example.** 1024.

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

**Example.** debug=i:1.

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

**Example.** init=i:1.

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

**Example.** abort usage.

```opensips
abort();
```

### `check_time_rec(time_string, [timestamp])`

The function returns a positive value if the specified time recurrence string matches the current time, or a negative value otherwise. For checking some other Unix timestamp than the current one, the second parameter will contain the intended timestamp to check. The syntax of each field is identical to the corresponding field from RFC 2445.

**Parameters:**

- `time_string` *(string, required)* — Time recurrence string which will be matched against the current time. Its fields are separated by "|" and the order in which they are given is: "timezone | dtstart | dtend | duration | freq | until | interval | byday | bymday | byyday | byweekno | bymonth". None of the fields following "freq" is used unless "freq" is defined. If the string ends in multiple null fields, they can all be ommited. The "timezone" field is optional. It represents the timezone in which to interpret the time recurrence elements (e.g. dtstart, dtend, until). By default, the system time zone is used.
- `timestamp` *(string, optional)* — A specific Unix time to check. The function simply expects the actual Unix time here, there is no need to perform any timezone adjustments.

**Return codes:**

- `1` — on success
- `-1` — on failure
- `-2` — on parsing error
- `-3` — on internal error

**Usable from:** any route

**Example.** check_time_rec usage.

```opensips
# Only passing if still in 2012 and on a Bucharest-compatible timezone
if (check_time_rec("Europe/Bucharest|20120101T000000|20130101T000000"))
	xlog("Current system time matches the given Romanian time interval\n");
...
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

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** Fetches time and logs seconds and microseconds parts..

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

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE|EVENT_ROUTE

**Example.** `get_dynamic_lock` and `release_dynamic_lock` usage example..

```opensips
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\n");
}
...
```

### `get_static_lock(key)`

Acquire the static lock which corresponds to "key". In case the lock is taken by another process, script execution will halt until the lock is released. Attempting to acquire the lock a second time by the same process, without releasing it first, will result in a deadlock. The static lock functions guarantee that two different strings will never point to the same lock, thus avoiding introducing unnecessary (and transparent!) synchronization between processes. Their disadvantage is the nature of their parameters (static strings), making them inappropriate in certain scenarios.

**Parameters:**

- `key` *(static string, required)* — key to be hashed in order to obtain the index of a static lock

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `release_static_lock`

**Example.** get_static_lock usage.

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

**Example.** pkg_status usage.

```opensips
pkg_status();
```

### `rand_event([probability])`

Generates a random floating point value between 0 - 100 and returns true if the value is less or equal to the currently set probability. If "probability" parameter is given, it will override the global parameter set by rand_set_prob().

**Parameters:**

- `probability` *(int, optional)* — probability override

**Return codes:**

- `true` — if the generated random value is less or equal to the currently set probability

**Related:**

- `rand_set_prob()`

**Example.** rand_event() usage.

```opensips
if (rand_event()) {
  append_to_reply("Retry-After: 120\n");
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

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE|EVENT_ROUTE

**Example.** `get_dynamic_lock` and `release_dynamic_lock` usage example..

```opensips
...
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\n");
}
...
```

### `release_static_lock(key)`

Release the static lock corresponding to "key". Nothing will happen if the lock is not acquired.

**Parameters:**

- `key` *(static string, required)* — key to be hashed in order to obtain the index of a static lock.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `get_static_lock`

**Example.** release_static_lock usage.

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

- `ret_var` *(var, required)* — Variable to store the result in
- `var_to_count` *(var, required)* — Variable to count values of

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** set_count usage.

```opensips
set_count($avp(dids), $var(num_dids));
```

### `set_select_weight(int_list_var)`

This function selects an element from a set formed by the integer values of the given "int_list_var" variable. It applies the genetic algorithm - roulette-wheel selection to choose an element from a set. The probability of selecting a certain element is proportionate with its weight. It will return the index of that selected element.

**Parameters:**

- `int_list_var` *(variable, required)* — Variable containing the integer list to select from.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** set_select_weight usage.

```opensips
$var(next_gw_idx) = set_select_weight($avp(gw_success_rates));
```

### `shm_status()`

Debugging function that dumps the status for the shared (SHM) memory. This information is logged to the default log facility, depending on the general log level and the memlog setting. You need to compile the server with activated memory debugging to get detailed informations.

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** shm_status usage.

```opensips
shm_status();
```

### `shuffle_avps(name)`

Randomly shuffles AVPs with _name_.

**Parameters:**

- `name` *(variable, required)* — name of AVP to shuffle.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** Shuffles the list of AVPs named 'foo'..

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

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE|EVENT_ROUTE

**Example.** Demonstrates checking if two AVP values hash to the same dynamic lock before acquiring the second lock..

```opensips
...
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
	if (!release_dynamic_lock($avp(bar))) {
		xlog("Error while releasing dynamic lock!\n");
	}
}

if (!release_dynamic_lock($avp(foo)) {
	xlog("Error while releasing dynamic lock!\n");
}
...
```

### `ts_usec_delta(t1_sec, t1_usec, t2_sec, t2_usec, [delta_str], [delta_int])`

This function returns the absolute difference between the two given timestamps. The result is expressed as _microseconds_ and can be returned as either string or integer.

**Parameters:**

- `delta_int` *(int, optional)* — Variable to store the result as an integer.
- `delta_str` *(string, optional)* — Variable to store the result as a string.
- `t1_sec` *(int, required)* — Seconds of the first timestamp.
- `t1_usec` *(int, required)* — Microseconds of the first timestamp.
- `t2_sec` *(int, required)* — Seconds of the second timestamp.
- `t2_usec` *(int, required)* — Microseconds of the second timestamp.

**Return codes:**

- `-1` — when using delta_int and the difference overflows the signed integer holder (diff of ~35 minutes or more)

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** ts_usec_delta usage.

```opensips
ts_usec_delta($var(t1s), 300, 10, $var(t2us), $var(diff_str));
```

### `usleep(time)`

Waits "time" micro-seconds.

**Parameters:**

- `time` *(int, required)* — time to wait in micro-seconds

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** usleep usage.

```opensips
usleep(500000); # sleep half a sec
```

## Exported Pseudo-Variables

### `$RANDOM`

Returns a random value from the [0 - 2^31) range.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- [0 - 2^31)
### `$ctime(name)`

The PV provides access to broken-down time attributes.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** 

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

- **Type:** string
- **Read/write:** read-only
- **Scope:** 
### `$shv(name)`

It is a class of pseudo-variables stored in shared memory. The value of $shv(name) is visible across all opensips processes. Each “shv” has single value and it is initialized to integer 0. You can use “shvset” parameter to initialize the shared variable. The module exports a set of MI functions to get/set the value of shared variables.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** global

## Exported MI Functions

### `check_config_hash`

Check if the actual config file hash is identical to the stored one.

**Returns:** The function returns 200 OK if the hash values are identical, 400 if there are not identical, 404 if no file for hashing has been configured and 500 on errors. Additional a short text message is printed.

**Example.** check_config_hash usage

```opensips-cli
$ opensips-cli -x mi check_config_hash
The actual config file hash is identical to the stored one.
```

### `get_config_hash`

Return the stored config file hash.

**Returns:** The function returns 200 OK and the hash value on success or 404 if no file for hashing has been configured.

**Example.** get_config_hash usage

```opensips-cli
$ opensips-cli -x mi get_config_hash
1580a37104eb4de69ab9f31ce8d6e3e0
```

### `rand_get_prob`

Return the actual probability setting. The function return the actual probability value.

**Returns:** The actual probability value

**Example.** rand_get_prob usage

```opensips-cli
$ opensips-cli -x mi get_prob
The actual probability is 50 percent.
```

### `rand_reset_prob`

Reset the probability value to the inital start value. This command don't need a parameter.

**Example.** rand_reset_prob usage

```opensips-cli
$ opensips-cli -x mi rand_reset_prob
```

### `rand_set_prop`

Set the probability value to the given parameter.

**Parameters:**

- `prob_proc` *(integer, required)* — the parameter should be a percent value (number from 0 to 99)

**Example.** rand_set_prob usage

```opensips-cli
$ opensips-cli -x mi rand_set_prob 10
```

### `shv_get`

Get the value of a shared variable ($shv(name)).

**Parameters:**

- `name` *(string, optional)* — shared variable name. If this parameter is missing, all shared variables are returned.

**Example.** shv_get usage

```opensips-cli
$ opensips-cli -x mi shv_get debug
```

**Example.** shv_get usage

```opensips-cli
$ opensips-cli -x mi shv_get
```

### `shv_set`

Set the value of a shared variable ($shv(name)).

**Parameters:**

- `name` *(string, required)* — shared variable name
- `type` *(string, required)* — type of the value. Valid values: "int", "str"
- `value` *(string, required)* — value to be set

**Example.** shv_set usage

```opensips-cli
$ opensips-cli -x mi shv_set debug int 0
```

## Configuration Examples

### Example 1.1. initial_probability parameter usage

Demonstrates how to set the initial value of the probability parameter.

```opensips
   
modparam("cfgutils", "initial_probability", 15)
   
```

null
### Example 1.2. hash_file parameter usage

Demonstrates how to specify the config file for which a hash value should be calculated on startup.

```opensips
   
modparam("cfgutils", "hash_file", "/etc/opensips/opensips.cfg")
   
```

null
### Example 1.3. shv_hash_size parameter usage

Demonstrates how to set the size of the hash table used to store shared variables.

```opensips
modparam("cfgutils", "shv_hash_size", 1024)
```

null
### Example 1.4. shvset parameter usage

Demonstrates how to initialize shared variables ($shv) with specific types and values.

```opensips
...
modparam("cfgutils", "shvset", "debug=i:1")
modparam("cfgutils", "shvset", "pstngw=s:sip:10.10.10.10")
...
```

null
### Example 1.5. varset parameter usage

Demonstrates how to initialize script variables ($var) with specific types and values.

```opensips
...
modparam("cfgutils", "varset", "init=i:1")
modparam("cfgutils", "varset", "gw=s:sip:11.11.11.11;transport=tcp")
...
```

null
### Example 1.6. Setting lock_pool_size module parameter

Demonstrates how to set the number of dynamic script locks to be allocated at startup.

```opensips
modparam("cfgutils", "lock_pool_size", 64)
```

null
### Example 1.7. rand_event() usage

Demonstrates using rand_event() to conditionally reply with a 503 error based on probability.

```opensips
...
if (rand_event()) {
  append_to_reply("Retry-After: 120\n");
  sl_send_reply(503, "Try later");
  exit;
}
# normal message processing follows
...
```

null
### Example 1.8. rand_set_prob() usage

Demonstrates setting the global probability value from the script.

```opensips
...
rand_set_prob(4);
...
```

null
### Example 1.9. rand_reset_prob() usage

Demonstrates resetting the probability back to the initial_probability value.

```opensips
...
rand_reset_prob();
...
```

null
### Example 1.10. rand_get_prob() usage

Demonstrates retrieving the current probability setting.

```opensips
...
rand_get_prob();
```

null
### Example 1.11. sleep usage

Demonstrates using the sleep function with both static and variable durations.

```opensips
...
sleep(1);
...
$var(secs) = 10;
sleep($var(secs));
...
```

null
### Example 1.12. usleep usage

Demonstrates using the usleep function for micro-second delays.

```opensips
...
usleep(500000); # sleep half a sec
...
```

null
### Example 1.13. abort usage

Demonstrates the use of the abort function for debugging.

```opensips
...
abort();
...
```

null
### Example 1.14. pkg_status usage

Demonstrates dumping the status of private (PKG) memory.

```opensips
...
pkg_status();
...
```

null
### Example 1.15. shm_status usage

Demonstrates dumping the status of shared (SHM) memory.

```opensips
...
shm_status();
...
```

null
### Example 1.16. set_count usage

Demonstrates counting the number of values in a multi-value variable like an AVP.

```opensips
...
set_count($avp(dids), $var(num_dids));
...
```

null
### Example 1.17. set_select_weight usage

Demonstrates selecting an element from a set based on weighted probability.

```opensips
...
$var(next_gw_idx) = set_select_weight($avp(gw_success_rates));
...
```

null
### Example 1.18. ts_usec_delta usage

Demonstrates calculating the microsecond difference between two timestamps.

```opensips
...
ts_usec_delta($var(t1s), 300, 10, $var(t2us), $var(diff_str));
...
```

null
### Example 1.19. check_time_rec usage

Demonstrates checking current time against RFC 2445 recurrence strings.

```opensips
...
# Only passing if still in 2012 and on a Bucharest-compatible timezone
if (check_time_rec("Europe/Bucharest|20120101T000000|20130101T000000"))
	xlog("Current system time matches the given Romanian time interval\n");
...
# Only passing if less than 30 days have passed from "dtstart", system timezone
if (check_time_rec("20121101T000000||p30d"))
	xlog("Current time matches the given interval\n");
...
```

null
### Example 1.20. get_static_lock usage

Demonstrates acquiring and releasing a static lock using a key.

```opensips
# acquire and release a static lock 
...
get_static_lock("Zone_1");
...
release_static_lock("Zone_1");
...
```

null
### Example 1.21. release_static_lock usage

Demonstrates releasing a previously acquired static lock.

```opensips
# acquire and release a static lock 
...
get_static_lock("Zone_1");
...
release_static_lock("Zone_1");
...
```

null
### Example 1.22. get_dynamic_lock usage

Demonstrates acquiring a dynamic lock based on a variable value (Call-ID).

```opensips
...
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\n");
}
...
```

null
### Example 1.23. release_dynamic_lock usage

Demonstrates releasing a dynamic lock based on a variable value.

```opensips
...
# acquire and release a dynamic lock on the "Call-ID" header field value
if (!get_dynamic_lock($ci)) {
	xlog("Error while getting dynamic lock!\n");
}
...
if (!release_dynamic_lock($ci) {
	xlog("Error while releasing dynamic lock!\n");
}
...
```

null
### Example 1.24. strings_share_lock usage

Demonstrates the proper way to acquire multiple dynamic locks while avoiding deadlocks by checking if keys share the same hash.

```opensips
...
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
...
```

null
### Example 1.25. get_accurate_time usage

Demonstrates fetching the current Unix epoch with microsecond precision.

```opensips
...
get_accurate_time($var(sec), $var(usec));
xlog("Current Unix timestamp: $var(sec) s, $var(usec) us\n");
...
```

null
### Example 1.26. shuffle_avps usage

Demonstrates randomly shuffling the order of values within an AVP list.

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

null
### Example 1.27. async sleep usage

Demonstrates performing an asynchronous sleep that suspends script execution without blocking the process.

```opensips
{
...
async( sleep("5"), after_sleep );
}

route[after_sleep] {
...
}
```

null
### Example 1.28. async usleep usage

Demonstrates performing an asynchronous micro-second sleep.

```opensips
{
...
async( usleep("1000"), after_usleep );
}

route[after_usleep] {
...
}
```

null
### Example 1.29. rand_set_prob usage

Demonstrates setting the probability value via the MI interface.

```opensips
...
$ opensips-cli -x mi rand_set_prob 10
...
```

null
### Example 1.30. rand_reset_prob usage

Demonstrates resetting the probability value via the MI interface.

```opensips
...
$ opensips-cli -x mi rand_reset_prob
...
```

null
### Example 1.31. rand_get_prob usage

Demonstrates retrieving the current probability value via the MI interface.

```opensips
...
$ opensips-cli -x mi get_prob
The actual probability is 50 percent.
...
```

null
### Example 1.32. check_config_hash usage

Demonstrates checking the config file hash via the MI interface.

```opensips
...
$ opensips-cli -x mi check_config_hash
The actual config file hash is identical to the stored one.
...
```

null
### Example 1.33. get_config_hash usage

Demonstrates retrieving the stored config file hash via the MI interface.

```opensips
...
$ opensips-cli -x mi get_config_hash
1580a37104eb4de69ab9f31ce8d6e3e0
...
```

null
### Example 1.34. shv_set usage

Demonstrates setting a shared variable value via the MI interface.

```opensips
...
$ opensips-cli -x mi shv_set debug int 0
...
```

null
### Example 1.35. shv_get usage

Demonstrates retrieving shared variable values via the MI interface.

```opensips
...
$ opensips-cli -x mi shv_get debug
$ opensips-cli -x mi shv_get
...
```

null
### Example 1.36. env(name) pseudo-variable usage

Demonstrates accessing system environment variables using the $env pseudo-variable.

```opensips
...
xlog("PATH environment variable is $env(PATH)\n");
...
```

null
### Example 1.37. RANDOM pseudo-variable usage

Demonstrates using the $RANDOM pseudo-variable to generate a random Retry-After value.

```opensips
...
$avp(10) = ($RANDOM / 16777216); # 2^24
if ($avp(10) < 10) {
   $avp(10) = 10;
}
append_to_reply("Retry-After: $avp(10)\n");
sl_send_reply(503, "Try later");
exit;
# normal message processing follows
```

null
### Example 1.38. ctime(name) pseudo-variable usage

Demonstrates accessing specific time attributes using the $ctime pseudo-variable.

```opensips
...
if ($ctime(year) == 2008) {
	xlog("request: $rm from $fu to $ru in year 2008\n");
}
...
```

null
### Example 1.39. shv(name) pseudo-variable usage

Demonstrates using shared variables ($shv) to control logging across all processes.

```opensips
...
modparam("cfgutils", "shvset", "debug=i:1")
...
if ($shv(debug) == 1) {
	xlog("request: $rm from $fu to $ru\n");
}
...
```

null
