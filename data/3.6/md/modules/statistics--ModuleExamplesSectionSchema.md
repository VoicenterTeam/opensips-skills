# Statistics Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5718640)

2.2. [Most recently active contributors(1) to this module](#idp5819792)

**List of Examples**

1.1. [variable example](#idp5580272)

1.2. [setting the stat\_groups parameter](#idp5584176)

1.3. [setting the stat\_series\_profile parameter](#idp5602080)

1.4. [`update_stat` usage](#idp5611568)

1.5. [`reset_stat` usage](#idp5618128)

1.6. [`stat_iter_init` usage](#idp5625840)

1.7. [`stat_iter_next` usage](#idp5634560)

1.8. [`update_stat_series` usage](#idp5644576)

1.9. [`$stat` usage](#idp5650656)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The Statistics module is a wrapper over the internal statistics manager, allowing the script writer to dynamically define and use of statistic variables.

By bringing the statistics support into the script, it takes advantage of the script flexibility in defining logics, making possible implementation of any kind of statistic scenario.

## 1.2.�Statistic Groups

Starting with OpenSIPS 2.3, statistics may be grouped by prefixing their names with the name of the desired group, along with a colon separator (e.g. **$stat(method:invite)** or **update\_stat("packets:$var(ptype)", "+1")**). In order for this to work, the groups must be defined prior to OpenSIPS startup using the **[stat\_groups](#param_stat_groups "1.5.2.�stat_groups (string)")** module parameter.

The module allows easy iteration over the statistics of a group using the **[stat\_iter\_init()](#func_stat_iter_init "1.6.3.� stat_iter_init(group, iter)")** and **[stat\_iter\_next()](#func_stat_iter_next "1.6.4.� stat_iter_next(name, val, iter)")** functions.

By default, all statistics belong to the **"dynamic"** group.

## 1.3.�Statistic Series

Statistic series provide the ability to accumulate statistical data over a pre-defined time window. Data is stored in a circular buffer, pushing new data on top, and removing stale values (values outside the timeframe) from the bottom. These statistics can be used to provide per-time stats, such as ACD, ASR, AST, etc, that can be read using the classic statistics interface, through the _$stat()_ variable.

Statistic series profile describe the timeframe used to store the data, as well as how the data is be accumulated and interpreted. There are several types a statistic series can be used, depending on the provisioned algorithm:

*   _accumulate_ - accumulates the specified values in a counter; works similar to clasical statistics, except that they reset after the specified timeframe
    
*   _average_ - returns an average of all the data fed within the timeframe; can be useful when computing PDD, AST, ACD stats.
    
*   _percentage_ - indicates the percentage of a set of values out of the total amount of values fed; can be useful when computing ASR, NER, CCR stats.
    

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.5.�Exported Parameters

### 1.5.1.�`variable` (string)

Name of a new statistic variable. The name may be followed by additional flag which describe the variable behavior:

*   _no\_reset_ : variable cannot be reset.
    

**Example�1.1.�variable example**

modparam("statistics", "variable", "register\_counter")
modparam("statistics", "variable", "active\_calls/no\_reset")

  

### 1.5.2.�`stat_groups` (string)

A comma-separated values string, specifying the statistic groups that may be used throughout the OpenSIPS script. Groups cannot contain leading or trailing whitespace characters.

**Example�1.2.�setting the stat\_groups parameter**

modparam("statistics", "stat\_groups", "method, packet, response")

  

### 1.5.3.�`stat_series_profile` (string)

Used to define a statistic series profile. Has the following format: _name: \[attr=value\]\*_, where _name_ represents the name of the profile, and _attr=value_ contains multiple settings of the defined profile. Possible attributes and their values are:

*   _algorithm_ - indicates the way data should be stored and accumulated over the specified timeframe. Possible values are: _accumulate_, _average_ and _percentage_, as described in the **[Section�1.3, “Statistic Series”](#section_stat_series "1.3.�Statistic Series")** paragraph (default is _accumulate_)
    
*   _hash\_size_ - each statistic defined/used is stored in a hash map attached to the profile; this setting tunes the size of the hash (default is: 8)
    
*   _group_ - indicates the group where the statistics beloging to this profile are grouped (as described in **[stat\_groups](#param_stat_groups "1.5.2.�stat_groups (string)")** (default is to use the same group as the profile)
    
*   _window_ - the number of seconds a timeframe has; all older values (out of the specified window) are discarded (default is _60_ seconds)
    
*   _slots_ - the number of slots per window; used to tune the granularity of the circular buffer; the higher the number of slots is, the more accurate the resulted statistic; (default is the same value of the _window_ parameter)
    
*   _percentage\_factor_ - used for _percentage_ algorithm profiles to specify the percentage factor to be used (defaults to _100_)
    

This parameter can be set multiple times, for each profile needed.

**Example�1.3.�setting the stat\_series\_profile parameter**

...
# define a statistic that accumulates average values in the last minute
modparam("statistics", "stat\_series\_profile", "avg: algorithm=average")
...
# define a statistic that accumulates average values in the 10 minutes
# with 1 minute granularity (10 slots out of the 600s window)
modparam("statistics", "stat\_series\_profile", "avg\_10m: algorithm=average window=600 slots=10")
...
# define a statistic that computes the percentage of values in the last hour
# with 10 minutes granularity (6 slots out of the 3600s window)
modparam("statistics", "stat\_series\_profile", "perc\_1h: algorithm=percentage window=3600 slots=6")
...

  

## 1.6.�Exported Functions

### 1.6.1.� `update_stat(variable, value)`

Updates the value of the statistic variable with the new value.

Meaning of the parameters is as follows:

*   _variable_ (string) - variable to be updated;
    
*   _value_ (int) - value to update with; it may be also negative.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.4.�`update_stat` usage**

...
update\_stat("register\_counter", 1);
...
$var(a\_calls) = "active\_calls";
update\_stat($var(a\_calls), -1);
...

  

### 1.6.2.� `reset_stat(variable)`

Resets to zero the value of the statistic variable.

Meaning of the parameters is as follows:

*   _variable_ (string) - variable to be reset-ed
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.5.�`reset_stat` usage**

...
reset\_stat("register\_counter");
...
$var(reg\_counter) = "register\_counter";
update\_stat($var(reg\_counter));
...

  

### 1.6.3.� `stat_iter_init(group, iter)`

Re-initializes "iter" in order to begin iterating through all statistics belonging to the given "group".

Meaning of the parameters is as follows:

*   _group_ (string)
    
*   _iter_ (string) - internally matched to a corresponding iterator
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.6.�`stat_iter_init` usage**

...
stat\_iter\_init("packet", "iter");
...

  

### 1.6.4.� `stat_iter_next(name, val, iter)`

Attempts to fetch the current statistic to which "iter" points. If successful, the relevant data will be written to "name" and "val", while also advancing "iter". Returns negative when reaching the end of iteration.

Meaning of the parameters is as follows:

*   _name_ (var)
    
*   _val_ (var)
    
*   _iter_ (string) - internally matched to a corresponding iterator
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE, FAILURE\_ROUTE and ONREPLY\_ROUTE.

**Example�1.7.�`stat_iter_next` usage**

...
# periodically clear packet-related data
timer\_route \[clear\_packet\_stats, 7200\] {
	stat\_iter\_init("packet", "iter");
	while (stat\_iter\_next($var(stat), $var(val), "iter"))
		reset\_stat("packet:$var(stat)");
}
...

  

### 1.6.5.� `update_stat_series(profile, variable, value)`

Updates the value of a series statistic.

Meaning of the parameters is as follows:

*   _profile_ (string) - the profile as defined in **[stat\_series\_profile](#param_stat_series_profile "1.5.3.�stat_series_profile (string)")**
    
*   _variable_ (string) - variable to be updated;
    
*   _value_ (int) - value to update with; it may be also negative; when using _percentage_ algorithm, the resulted value represents the percentage of positive values out of the total number of values (positive + negative)
    

This function can be used from any route.

**Example�1.8.�`update_stat_series` usage**

...
# account failed calls
update\_stat\_series("perc\_1h", "ASR\_1h", -1);

# account successful calls
update\_stat\_series("perc\_1h", "ASR\_1h", 1);

# compute average PDD
update\_stat\_series("avg", "PDD", $var(pdd\_ms));
...

  

## 1.7.�Exported Pseudo-Variables

### 1.7.1.�`$stat`

Allows "get" or "reset" operations on the given statistics.

The name of a statistic may be optionally prefixed with a searching group, along with a colon separator.

If a searching group is not provided, the statistic is first searched for in the core groups. If not found, search continues with the "dynamic" group which, by default, holds all non-explicitly grouped statistics which are not exported by the OpenSIPS core.

**Example�1.9.�`$stat` usage**

...
xlog("SHM used size = $stat(used\_size), no\_invites = $stat(method:invite)\\n");
...
$stat(err\_requests) = 0;
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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

33

20

1037

227

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

29

21

519

164

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

20

13

691

19

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

11

9

22

18

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

9

4

97

201

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

6

7

7.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

5

2

144

1

8.

Anca Vamanu

4

2

14

16

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

11

11

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

4

2

4

4

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Konstantin Bokarius, Juli�n Moreno Pati�o, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2025

2.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2025

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Nov 2023

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2012 - Oct 2023

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2019

6.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2006 - Apr 2019

7.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Apr 2017 - Apr 2017

8.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Jul 2010 - Feb 2011

10.

Anca Vamanu

Oct 2007 - Sep 2009

  

**All remaining contributors**: Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2007-2017 OpenSIPS Project

Copyright � 2006 Voice Sistem SRL