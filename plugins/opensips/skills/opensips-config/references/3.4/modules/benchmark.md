# benchmark Module Reference
<!-- generated-from: data/3.4/modules/benchmark.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 benchmark module. Read this file when configuring or debugging the benchmark module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module helps developers to benchmark their module functions. By adding this module's functions via the configuration file or through its API, OpenSIPS can log profiling information for every function.

## How It Works

The duration between calls to start_timer and log_timer is stored and logged via OpenSIPS's logging facility. Please note that all durations are given as microseconds (don't confuse with milliseconds!). Important note: as this benchmarking is intended to measure the time spent in executing different parts/blocks of the script (and not for measuring the time induced by the SIP signaling), the benchmark module is to be used within the SAME top route (request route, failure route, branch route, onreply rout, etc). It is not design to be used across different types of top routes (like started in request route and ended in failure route)!!

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `enable` (integer)

Even when the module is loaded, benchmarking is not enabled per default. This variable may have three different values:

*   -1 - Globally disable benchmarking
    
*   0 - Enable per-timer enabling. Single timers are inactive by default and can be activated through the MI interface as soon as that feature is implemented.
    
*   1 - Globally enable benchmarking

*Default value is 0.*

**Possible values:**

- -1
- 0
- 1

**Example.** 1.

```opensips
...
modparam("benchmark", "enable", 1)
...
```
### `granularity` (integer)

Logging normally is not done for every reference to the log_timer() function, but only every n'th call. n is defined through this variable. A sensible granularity seems to be 100.

If granularity is set to 0, then nothing will be logged automatically. Instead bm_poll_results MI command can be used to retrieve the results and clean the local values.

*Default value is 100.*

**Example.** 500.

```opensips
...
modparam("benchmark", "granularity", 500)
...
```
### `loglevel` (integer)

Set the log level for the benchmark logs. These levels should be used:

*   -3 - L_ALERT
    
*   -2 - L_CRIT
    
*   -1 - L_ERR
    
*   1 - L_WARN
    
*   2 - L_NOTICE
    
*   3 - L_INFO
    
*   4 - L_DBG

*Default value is 3.*

**Possible values:**

- -3
- -2
- -1
- 1
- 2
- 3
- 4

**Notes:** This will set the logging level to L_DBG.

**Example.** 4.

```opensips
...
modparam("benchmark", "loglevel", 4)
...
```

## Exported Functions

### `bm_log_timer(name)`

This function logs the timer with the given ID. The following data are logged:

*   _Last msgs_ is the number of calls in the last logging interval. This equals the granularity variable.

*   _Last sum_ is the accumulated duration in the current logging interval (i.e. for the last “granularity” calls).

*   _Last min_ is the minimum duration between start/log_timer calls during the last interval.

*   _Last max_ - maximum duration.

*   _Last average_ is the average duration between bm_start_timer() and bm_log_timer() since the last logging.

*   _Global msgs_ number of calls to log_timer.

*   _Global sum_ total duration in microseconds.

*   _Global min_... You get the point. :)

*   _Global max_ also obvious.

*   _Global avg_ possibly the most interesting value.

**Parameters:**

- `name` *(string, required)* — The ID of the timer to log.

**Related:**

- `bm_start_timer`

**Example.** bm_log_timer usage.

```opensips
bm_log_timer("test");
```

### `bm_start_timer(name)`

Start timer “name”. A later call to “bm_log_timer()” logs this timer..

**Parameters:**

- `name` *(string, required)* — The name of the timer to start.

**Related:**

- `bm_log_timer`

**Example.** bm_start_timer usage.

```opensips
bm_start_timer("test");
```

## Exported Pseudo-Variables

### `$BM_time_diff`

the time difference elapsed between calls of bm_start_timer(name) and bm_log_timer(name). The value is 0 if no bm_log_timer() was called.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** 

## Exported MI Functions

### `bm_enable_global`

Enables/disables the module.

**Parameters:**

- `enable` *(integer, required)* — value may be -1, 0 or 1. See discription of "enable" parameter.

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi bm_enable_global 1
```

### `bm_enable_timer`

Enable or disable a single timer.

**Parameters:**

- `enable` *(integer, required)* — enable (1) or disable (0) timer
- `timer` *(string, required)* — timer name

**Example.** Enabling a timer

```opensips-cli
opensips-cli -x mi bm_enable_timer test 1
```

### `bm_granularity`

Modifies the benchmarking granularity.

**Parameters:**

- `granularity` *(integer, required)* — See discription of "granularity" parameter.

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi bm_granularity 300
```

### `bm_loglevel`

Modifies the module log level.

**Parameters:**

- `log_level` *(integer, required)* — See discription of "loglevel" parameter.

**Example.** MI FIFO Command Format

```opensips-cli
opensips-cli -x mi bm_loglevel 4
```

### `bm_poll_results`

Returns the current and global results for each timer. This command is only available if the "granularity" variable is set to 0. It can be used to get results in stable time intervals instead of every N messages. Each timer will have 2 nodes - the local and the global values. Format of the values is the same as the one normally used in logfile. This way of getting the results allows to interface with external graphing applications like Munin. If there were no new calls to _bm_log_timer_ since last check, then all current values of a timer will be equal 0. Each call to _bm_poll_results_ will reset current values (but not global ones).

**Returns:** The current and global results for each timer. (structured response — see schema)

**Example.** Getting the results via FIFO interface

```opensips-cli
opensips-cli -x mi bm_poll_results
register_timer
	3/40/12/14/13.333333
	9/204/12/97/22.666667
security_check_timer
	3/21/7/7/7.000000
	9/98/7/41/10.888889
```

## Configuration Examples

### Set `enable` parameter

Sets the enable parameter.

```opensips
...
modparam("benchmark", "enable", 1)
...
```
### Set `granularity` parameter

Sets the granularity parameter.

```opensips
...
modparam("benchmark", "granularity", 500)
...
```
### Set `loglevel` parameter

Set the log level for the benchmark logs.

```opensips
...
modparam("benchmark", "loglevel", 4)
...
```

This will set the logging level to L_DBG.
### `bm_start_timer` usage

Start timer “name”.

```opensips
...
bm_start_timer("test");
...
```
### `bm_log_timer` usage

Logs the timer with the given ID.

```opensips
...
bm_log_timer("test");
...
```
### benchmark usage

Measure the duration of user location lookup.

```opensips
...
bm_start_timer("usrloc-lookup");
lookup("location");
bm_log_timer("usrloc-lookup");
...
```
