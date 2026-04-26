# statistics Module Reference
<!-- generated-from: data/3.5/modules/statistics.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 statistics module. Read this file when configuring or debugging the statistics module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Configuration Examples](#configuration-examples)

## Overview

The Statistics module is a wrapper over the internal statistics manager, allowing the script writer to dynamically define and use of statistic variables.

By bringing the statistics support into the script, it takes advantage of the script flexibility in defining logics, making possible implementation of any kind of statistic scenario.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `stat_groups` (string)

A comma-separated values string, specifying the statistic groups that may be used throughout the OpenSIPS script. Groups cannot contain leading or trailing whitespace characters.

**Example.** Set the `stat_groups` parameter.

```opensips
modparam("statistics", "stat_groups", "method, packet, response")
```
### `stat_series_profile` (string)

Used to define a statistic series profile. Has the following format: _name: \[attr=value\]\*_, where _name_ represents the name of the profile, and _attr=value_ contains multiple settings of the defined profile. Possible attributes and their values are:

*   _algorithm_ - indicates the way data should be stored and accumulated over the specified timeframe. Possible values are: _accumulate_, _average_ and _percentage_, as described in the **[Section 1.3, “Statistic Series”](#section_stat_series "1.3. Statistic Series")** paragraph (default is _accumulate_)
    
*   _hash_size_ - each statistic defined/used is stored in a hash map attached to the profile; this setting tunes the size of the hash (default is: 8)
    
*   _group_ - indicates the group where the statistics beloging to this profile are grouped (as described in **[stat_groups](#param_stat_groups "1.5.2. stat_groups (string)")** (default is to use the same group as the profile)
    
*   _window_ - the number of seconds a timeframe has; all older values (out of the specified window) are discarded (default is _60_ seconds)
    
*   _slots_ - the number of slots per window; used to tune the granularity of the circular buffer; the higher the number of slots is, the more accurate the resulted statistic; (default is the same value of the _window_ parameter)
    
*   _percentage_factor_ - used for _percentage_ algorithm profiles to specify the percentage factor to be used (defaults to _100_)
    
This parameter can be set multiple times, for each profile needed.

**Possible values:**

- accumulate
- average
- percentage

**Example.** Set the `stat_series_profile` parameter.

```opensips
...
# define a statistic that accumulates average values in the last minute
modparam("statistics", "stat_series_profile", "avg: algorithm=average")
...
# define a statistic that accumulates average values in the 10 minutes
# with 1 minute granularity (10 slots out of the 600s window)
modparam("statistics", "stat_series_profile", "avg_10m: algorithm=average window=600 slots=10")
...
# define a statistic that computes the percentage of values in the last hour
# with 10 minutes granularity (6 slots out of the 3600s window)
modparam("statistics", "stat_series_profile", "perc_1h: algorithm=percentage window=3600 slots=6")
...
```
### `variable` (string)

Name of a new statistic variable. The name may be followed by additional flag which describe the variable behavior:

*   _no_reset_ : variable cannot be reset.

**Example.** Set the `variable` parameter.

```opensips
modparam("statistics", "variable", "register_counter")
modparam("statistics", "variable", "active_calls/no_reset")
```

## Exported Functions

### `reset_stat(variable)`

Resets to zero the value of the statistic variable.

**Parameters:**

- `variable` *(string, required)* — variable to be reset-ed

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE

**Example.** reset_stat usage.

```opensips
reset_stat("register_counter");
$var(reg_counter) = "register_counter";
update_stat($var(reg_counter));
```

### `stat_iter_init(group, iter)`

Re-initializes "iter" in order to begin iterating through all statistics belonging to the given "group".

**Parameters:**

- `group` *(string, required)* — 
- `iter` *(string, required)* — internally matched to a corresponding iterator

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE

**Example.** stat_iter_init usage.

```opensips
stat_iter_init("packet", "iter");
```

### `stat_iter_next(name, val, iter)`

Attempts to fetch the current statistic to which "iter" points. If successful, the relevant data will be written to "name" and "val", while also advancing "iter". Returns negative when reaching the end of iteration.

**Parameters:**

- `iter` *(string, required)* — internally matched to a corresponding iterator
- `name` *(var, required)* — 
- `val` *(var, required)* — 

**Return codes:**

- `negative` — when reaching the end of iteration

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE

**Example.** stat_iter_next usage.

```opensips
# periodically clear packet-related data
timer_route [clear_packet_stats, 7200] {
	stat_iter_init("packet", "iter");
	while (stat_iter_next($var(stat), $var(val), "iter"))
		reset_stat("packet:$var(stat)");
}
```

### `update_stat(variable, value)`

Updates the value of the statistic variable with the new value.

**Parameters:**

- `value` *(int, required)* — value to update with; it may be also negative
- `variable` *(string, required)* — variable to be updated

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE

**Example.** update_stat usage.

```opensips
update_stat("register_counter", 1);
$var(a_calls) = "active_calls";
update_stat($var(a_calls), -1);
```

### `update_stat_series(profile, variable, value)`

Updates the value of a series statistic.

**Parameters:**

- `profile` *(string, required)* — the profile as defined in stat_series_profile
- `value` *(int, required)* — value to update with; it may be also negative; when using percentage algorithm, the resulted value represents the percentage of positive values out of the total number of values (positive + negative)
- `variable` *(string, required)* — variable to be updated

**Usable from:** any route

**Example.** update_stat_series usage.

```opensips
# account failed calls
update_stat_series("perc_1h", "ASR_1h", -1);

# account successful calls
update_stat_series("perc_1h", "ASR_1h", 1);

# compute average PDD
update_stat_series("avg", "PDD", $var(pdd_ms));
```

## Exported Pseudo-Variables

### `$stat`

Allows "get" or "reset" operations on the given statistics.

The name of a statistic may be optionally prefixed with a searching group, along with a colon separator.

If a searching group is not provided, the statistic is first searched for in the core groups. If not found, search continues with the "dynamic" group which, by default, holds all non-explicitly grouped statistics which are not exported by the OpenSIPS core.

**Example 1.9. `$stat` usage**

...
xlog("SHM used size = $stat(used_size), no_invites = $stat(method:invite)\\n");
...
$stat(err_requests) = 0;
...

- **Type:** integer
- **Read/write:** read-write
- **Scope:** 

## Configuration Examples

### variable example

Name of a new statistic variable. The name may be followed by additional flag which describe the variable behavior: *no_reset* : variable cannot be reset.

```opensips
modparam("statistics", "variable", "register_counter")
modparam("statistics", "variable", "active_calls/no_reset")
```
### setting the stat_groups parameter

A comma-separated values string, specifying the statistic groups that may be used throughout the OpenSIPS script. Groups cannot contain leading or trailing whitespace characters.

```opensips
modparam("statistics", "stat_groups", "method, packet, response")
```
### setting the stat_series_profile parameter

Used to define a statistic series profile. Has the following format: name: [attr=value]*, where name represents the name of the profile, and attr=value contains multiple settings of the defined profile. Possible attributes and their values are: *algorithm* - indicates the way data should be stored and accumulated over the specified timeframe. Possible values are: *accumulate*, *average* and *percentage*, as described in the Section 1.3, “Statistic Series” paragraph (default is *accumulate*) *hash_size* - each statistic defined/used is stored in a hash map attached to the profile; this setting tunes the size of the hash (default is: 8) *group* - indicates the group where the statistics beloging to this profile are grouped (as described in stat_groups (default is to use the same group as the profile) *window* - the number of seconds a timeframe has; all older values (out of the specified window) are discarded (default is *60* seconds) *slots* - the number of slots per window; used to tune the granularity of the circular buffer; the higher the number of slots is, the more accurate the resulted statistic; (default is the same value of the *window* parameter) *percentage_factor* - used for *percentage* algorithm profiles to specify the percentage factor to be used (defaults to *100*) This parameter can be set multiple times, for each profile needed.

```opensips
...
# define a statistic that accumulates average values in the last minute
modparam("statistics", "stat_series_profile", "avg: algorithm=average")
...
# define a statistic that accumulates average values in the 10 minutes
# with 1 minute granularity (10 slots out of the 600s window)
modparam("statistics", "stat_series_profile", "avg_10m: algorithm=average window=600 slots=10")
...
# define a statistic that computes the percentage of values in the last hour
# with 10 minutes granularity (6 slots out of the 3600s window)
modparam("statistics", "stat_series_profile", "perc_1h: algorithm=percentage window=3600 slots=6")
...
```
### `update_stat` usage

Updates the value of the statistic variable with the new value. Meaning of the parameters is as follows: *variable* (string) - variable to be updated; *value* (int) - value to update with; it may be also negative. This function can be used from REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE and ONREPLY_ROUTE.

```opensips
...
update_stat("register_counter", 1);
...
$var(a_calls) = "active_calls";
update_stat($var(a_calls), -1);
...
```
### `reset_stat` usage

Resets to zero the value of the statistic variable. Meaning of the parameters is as follows: *variable* (string) - variable to be reset-ed This function can be used from REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE and ONREPLY_ROUTE.

```opensips
...
reset_stat("register_counter");
...
$var(reg_counter) = "register_counter";
update_stat($var(reg_counter));
...
```
### `stat_iter_init` usage

Re-initializes "iter" in order to begin iterating through all statistics belonging to the given "group". Meaning of the parameters is as follows: *group* (string) *iter* (string) - internally matched to a corresponding iterator This function can be used from REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE and ONREPLY_ROUTE.

```opensips
...
stat_iter_init("packet", "iter");
...
```
### `stat_iter_next` usage

Attempts to fetch the current statistic to which "iter" points. If successful, the relevant data will be written to "name" and "val", while also advancing "iter". Returns negative when reaching the end of iteration. Meaning of the parameters is as follows: *name* (var) *val* (var) *iter* (string) - internally matched to a corresponding iterator This function can be used from REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE and ONREPLY_ROUTE.

```opensips
...
# periodically clear packet-related data
timer_route [clear_packet_stats, 7200] {
	stat_iter_init("packet", "iter");
	while (stat_iter_next($var(stat), $var(val), "iter"))
		reset_stat("packet:$var(stat)");
}
...
```
### `update_stat_series` usage

Updates the value of a series statistic. Meaning of the parameters is as follows: *profile* (string) - the profile as defined in stat_series_profile *variable* (string) - variable to be updated; *value* (int) - value to update with; it may be also negative; when using *percentage* algorithm, the resulted value represents the percentage of positive values out of the total number of values (positive + negative) This function can be used from any route.

```opensips
...
# account failed calls
update_stat_series("perc_1h", "ASR_1h", -1);

# account successful calls
update_stat_series("perc_1h", "ASR_1h", 1);

# compute average PDD
update_stat_series("avg", "PDD", $var(pdd_ms));
...
```
### `$stat` usage

Allows "get" or "reset" operations on the given statistics. The name of a statistic may be optionally prefixed with a searching group, along with a colon separator. If a searching group is not provided, the statistic is first searched for in the core groups. If not found, search continues with the "dynamic" group which, by default, holds all non-explicitly grouped statistics which are not exported by the OpenSIPS core.

```opensips
...
xlog("SHM used size = $stat(used_size), no_invites = $stat(method:invite)\n");
...
$stat(err_requests) = 0;
...
```
