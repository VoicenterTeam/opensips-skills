# Benchmark Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5706000)

3.2. [Most recently active contributors(1) to this module](#idp5812848)

**List of Examples**

1.1. [Set `enable` parameter](#idp247648)

1.2. [Set `granularity` parameter](#idp165408)

1.3. [Set `loglevel` parameter](#idp5568768)

1.4. [`bm_start_timer` usage](#idp5575200)

1.5. [`bm_log_timer` usage](#idp5594144)

1.6. [Enabling a timer](#idp5610480)

1.7. [Getting the results via FIFO interface](#idp5625008)

1.8. [benchmark usage](#idp5627856)

2.1. [Using the benchmark module's API from another module](#idp5738736)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module helps developers to benchmark their module functions. By adding this module's functions via the configuration file or through its API, OpenSIPS can log profiling information for every function.

The duration between calls to start\_timer and log\_timer is stored and logged via OpenSIPS's logging facility. Please note that all durations are given as microseconds (don't confuse with milliseconds!).

Important note: as this benchmarking is intended to measure the time spent in executing different parts/blocks of the script (and not for measuring the time induced by the SIP signaling), the benchmark module is to be used within the SAME top route (request route, failure route, branch route, onreply rout, etc). It is not design to be used across different types of top routes (like started in request route and ended in failure route)!!

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`enable` (int)

Even when the module is loaded, benchmarking is not enabled per default. This variable may have three different values:

*   \-1 - Globally disable benchmarking
    
*   0 - Enable per-timer enabling. Single timers are inactive by default and can be activated through the MI interface as soon as that feature is implemented.
    
*   1 - Globally enable benchmarking
    

_Default value is “0”._

**Example�1.1.�Set `enable` parameter**

...
modparam("benchmark", "enable", 1)
...

  

### 1.3.2.�`granularity` (int)

Logging normally is not done for every reference to the log\_timer() function, but only every n'th call. n is defined through this variable. A sensible granularity seems to be 100.

If granularity is set to 0, then nothing will be logged automatically. Instead bm\_poll\_results MI command can be used to retrieve the results and clean the local values.

_Default value is “100”._

**Example�1.2.�Set `granularity` parameter**

...
modparam("benchmark", "granularity", 500)
...

  

### 1.3.3.�`loglevel` (int)

Set the log level for the benchmark logs. These levels should be used:

*   \-3 - L\_ALERT
    
*   \-2 - L\_CRIT
    
*   \-1 - L\_ERR
    
*   1 - L\_WARN
    
*   2 - L\_NOTICE
    
*   3 - L\_INFO
    
*   4 - L\_DBG
    

_Default value is “3” (L\_INFO)._

**Example�1.3.�Set `loglevel` parameter**

...
modparam("benchmark", "loglevel", 4)
...

  

This will set the logging level to L\_DBG.

## 1.4.�Exported Functions

### 1.4.1.� `bm_start_timer(name)`

Start timer “name”. A later call to “bm\_log\_timer()” logs this timer..

**Example�1.4.�`bm_start_timer` usage**

...
bm\_start\_timer("test");
...

  

### 1.4.2.� `bm_log_timer(name)`

This function logs the timer with the given ID. The following data are logged:

*   _Last msgs_ is the number of calls in the last logging interval. This equals the granularity variable.
    

*   _Last sum_ is the accumulated duration in the current logging interval (i.e. for the last “granularity” calls).
    

*   _Last min_ is the minimum duration between start/log\_timer calls during the last interval.
    

*   _Last max_ - maximum duration.
    

*   _Last average_ is the average duration between bm\_start\_timer() and bm\_log\_timer() since the last logging.
    

*   _Global msgs_ number of calls to log\_timer.
    

*   _Global sum_ total duration in microseconds.
    

*   _Global min_... You get the point. :)
    

*   _Global max_ also obvious.
    

*   _Global avg_ possibly the most interesting value.
    

**Example�1.5.�`bm_log_timer` usage**

...
bm\_log\_timer("test");
...

  

## 1.5.�Exported Pseudo-Variables

Exported pseudo-variables are listed in the next sections.

### 1.5.1.�$BM\_time\_diff

_$BM\_time\_diff_ - the time difference elapsed between calls of bm\_start\_timer(name) and bm\_log\_timer(name). The value is 0 if no bm\_log\_timer() was called.

## 1.6.�Exported MI Functions

### 1.6.1.�`bm_enable_global`

Enables/disables the module.

Parameters:

*   _enable_ - value may be -1, 0 or 1. See discription of "enable" parameter.
    

MI FIFO Command Format:

			opensips-cli -x mi bm\_enable\_global 1
			

### 1.6.2.�`bm_enable_timer`

Enable or disable a single timer.

Parameters:

*   _timer_ - timer name
    
*   _enable_ - enable (1) or disable (0) timer
    

MI FIFO Command Format:

**Example�1.6.�Enabling a timer**

...
opensips-cli -x mi bm\_enable\_timer test 1
...

  

### 1.6.3.�`bm_granularity`

Modifies the benchmarking granularity.

Parameters:

*   _granularity_ - See discription of "granularity" parameter.
    

MI FIFO Command Format:

			opensips-cli -x mi bm\_granularity 300
			

### 1.6.4.�`bm_loglevel`

Modifies the module log level.

Parameters:

*   _log\_level_ - See discription of "loglevel" parameter.
    

MI FIFO Command Format:

			opensips-cli -x mi bm\_loglevel 4
			

### 1.6.5.�`bm_poll_results`

Returns the current and global results for each timer. This command is only available if the "granularity" variable is set to 0. It can be used to get results in stable time intervals instead of every N messages. Each timer will have 2 nodes - the local and the global values. Format of the values is the same as the one normally used in logfile. This way of getting the results allows to interface with external graphing applications like Munin.

If there were no new calls to _bm\_log\_timer_ since last check, then all current values of a timer will be equal 0. Each call to _bm\_poll\_results_ will reset current values (but not global ones).

**Example�1.7.�Getting the results via FIFO interface**

...
opensips-cli -x mi bm\_poll\_results
register\_timer
	3/40/12/14/13.333333
	9/204/12/97/22.666667
security\_check\_timer
	3/21/7/7/7.000000
	9/98/7/41/10.888889
...

  

## 1.7.�Example of usage

Measure the duration of user location lookup.

**Example�1.8.�benchmark usage**

...
bm\_start\_timer("usrloc-lookup");
lookup("location");
bm\_log\_timer("usrloc-lookup");
...

  

## Chapter�2.�Developer Guide

The benchmark module provides an internal API to be used by other OpenSIPS modules. The available functions are identical to the user exported functions.

Please note that this module is intended mainly for developers. It should be used with caution in production environments.

## 2.1.�Available Functions

### 2.1.1.� `bm_register(name, mode, id)`

This function register a new timer and/or returns the internal ID associated with the timer. mode controls the creation of new timer if not found. id is to be used by start and log timer functions.

### 2.1.2.� `bm_start(id)`

This function equals the user-exported function bm\_start\_timer. The id is passed as an integer, though.

### 2.1.3.� `bm_log(id)`

This function equals the user-exported function bm\_log\_timer. The id is passed as an integer, though.

## 2.2.�Benchmark API Example

**Example�2.1.�Using the benchmark module's API from another module**

...
#include "../benchmark/benchmark.h"
...
struct bm\_binds bmb;
...
...
/\* load the benchmarking API \*/
if (load\_bm\_api( &bmb )!=0) {
    LM\_ERR("can't load benchmark API\\n");
    goto error;
}
...
...
/\* Start/log timers during a (usually user-exported) module function \*/
bmb.bm\_register("test", 1, &id)
bmb.bm\_start(id);
do\_something();
bmb.bm\_log(id);
...

  

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

23

10

1391

50

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

21

19

88

53

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

13

11

28

61

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

11

9

23

21

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

9

4

185

143

6.

Stanislaw Pitucha

7

3

170

65

7.

Henning Westerholt ([@henningw](https://github.com/henningw))

6

4

11

10

8.

David Sanders

4

2

8

1

9.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

4

2

4

5

10.

Anca Vamanu

3

1

5

2

  

**All remaining contributors**: Konstantin Bokarius, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - Sep 2019

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jul 2007 - Apr 2019

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

David Sanders

Aug 2012 - Jan 2013

8.

Anca Vamanu

Sep 2009 - Sep 2009

9.

Stanislaw Pitucha

Aug 2009 - Sep 2009

10.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Jul 2007 - Mar 2008

  

**All remaining contributors**: Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Stanislaw Pitucha, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)).

_Documentation Copyrights:_

Copyright � 2007 Collax GmbH

Copyright � 2007 Voice Sistem SRL