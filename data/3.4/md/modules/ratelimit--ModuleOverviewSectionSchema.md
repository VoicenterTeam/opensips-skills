# ratelimit Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5838768)

2.2. [Most recently active contributors(1) to this module](#idp5942128)

**List of Examples**

1.1. [Set `timer_interval` parameter](#idp5575264)

1.2. [Set `limit_per_interval` parameter](#idp5580592)

1.3. [Set `expire_time` parameter](#idp5585200)

1.4. [Set `hash_size` parameter](#idp5589824)

1.5. [Set `default_algorithm` parameter](#idp5594752)

1.6. [Set `cachedb_url` parameter](#idp5599312)

1.7. [Set `db_prefix` parameter](#idp5603984)

1.8. [Set `repl_buffer_threshold` parameter](#idp5608704)

1.9. [Set `repl_timer_interval` parameter](#idp5613280)

1.10. [Set `repl_timer_expire` parameter](#idp5617952)

1.11. [Set `pipe_replication_cluster` parameter](#idp5622480)

1.12. [Set `window_size` parameter](#idp5627296)

1.13. [Set `slot_period` parameter](#idp5632304)

1.14. [`rl_check` usage](#idp5646144)

1.15. [`rl_dec_count` usage](#idp5653664)

1.16. [`rl_reset_count` usage](#idp5660752)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This module implements rate limiting for SIP requests. In contrast to the PIKE module this limits the flow based on a per SIP request type basis and not per source IP. The latest sources allow you to dynamically group several messages into some entities and limit the traffic based on them. The MI interface can be used to change tunables while running OpenSIPS.

This module is integrated with the OpenSIPS Key-Value Interface, providing support for distributed rate limiting using Redis or Memcached CacheDB backends. The internal limiting data will no longer be kept on each OpenSIPS instance. It will be stored in the distributed Key-Value database and queried by each instance before deciding if a SIP message should be blocked or not.

To achieve a distributed ratelimit feature, the module can also replicate its pipes counters to different OpenSIPS instances using the clusterer module. To do that, define the _pipe\_replication\_cluster_ parameter in your configuration script.

Starting with OpenSIPS 3.2, choosing whether to replicate a pipe over CacheDB backends or bin replication is triggered by the flags specified when the pipe is created: adding the _/r_ suffix to the pipe's name will replicate through CacheDB, and adding _/b_ will replicate through bin/clusterer.

## 1.2.�Use Cases

Limiting the rate messages are processed on a system directly influences the load. The ratelimit module can be used to protect a single host or to protect an OpenSIPS cluster when run on the dispatching box in front.

Distributed limiting is useful when the rate limit should be performed not only on a specific node, but on the entire platform.

NOTE: that this behavior only makes sense when the pipe algorithm used is TAILDROP or RED.

A sample configuration snippet might look like this:

...
	if (!rl\_check($rU, 50, "TAILDROP")) {
		sl\_send\_reply(503, "Server Unavailable");
		exit;
	};
...
	

Upon every incoming request listed above rl\_check is invoked and the entity identified by the R-URI user is checked. It returns an OK code if the current per request load is below the configured threshold. If the load is exceeded the function returns an error and an administrator can discard requests with a stateless response.

## 1.3.�Static Rate Limiting Algorithms

The ratelimit module supports two different static algorithms to be used by rl\_check to determine whether a message should be blocked or not.

### 1.3.1.�Tail Drop Algorithm (TAILDROP)

This is a trivial algorithm that imposes some risks when used in conjunction with long timer intervals. At the start of each interval an internal counter is reset and incremented for each incoming message. Once the counter hits the configured limit rl\_check returns an error.

The downside of this algorithm is that it can lead to SIP client synchronization. During a relatively long interval only the first requests (i.e. REGISTERs) would make it through. Following messages (i.e. RE-REGISTERs) will all hit the SIP proxy at the same time when a common Expire timer expired. Other requests will be retransmissed after given time, the same on all devices with the same firmware/by the same vendor.

### 1.3.2.�Random Early Detection Algorithm (RED)

Random Early Detection tries to circumvent the synchronization problem imposed by the tail drop algorithm by measuring the average load and adapting the drop rate dynamically. When running with the RED algorithm OpenSIPS will return errors to the OpenSIPS routing engine every n'th packet trying to evenly spread the measured load of the last timer interval onto the current interval. As a negative side effect OpenSIPS might drop messages although the limit might not be reached within the interval. Decrease the timer interval if you encounter this.

### 1.3.3.�Slot Based Taildropping (SBT)

SBT holds a window consisting of one or more slots. You can set the _window\_size_ parameter(seconds) which means for how long we should look back to count the calls and _slot\_period_ parameter(miliseconds) which tells how granular the algorithm should be. The number of slots will be _window\_size_/_slot\_period_. If, for example, you have _window\_size_\= _slot\_period_\=1 second, then after each second you shall lose the call count, but if you set the _slot\_period_ to 100 milliseconds, then when your call will be outside the window, the calls in the first 100 milliseconds shall be dropped, and the rest in the next 900 shall be kept.

### 1.3.4.�Network Algorithm (NETWORK)

This algorithm relies on information provided by network interfaces. The total amount of bytes waiting to be consumed on all the network interfaces is retrieved once every timer\_interval seconds. If the returned amount exceeds the limit specified in the modparam, rl\_check returns an error.

## 1.4.�Dynamic Rate Limiting Algorithms

When running OpenSIPS on different machines, one has to adjust the drop rates for the static algorithms to maintain a sub 100% load average or packets start getting dropped in the network stack. While this is not in itself difficult, it isn't neither accurate nor trivial: another server taking a notable fraction of the cpu time will require re-tuning the parameters.

While tuning the drop rates from the outside based on a certain factor is possible, having the algorithm run inside ratelimit permits tuning the rates based on internal server parameters and is somewhat more flexible (or it will be when support for external load factors - as opposed to cpu load - is added).

### 1.4.1.�Feedback Algorithm (FEEDBACK)

Using the PID Controller model (see [Wikipedia page](http://en.wikipedia.org/wiki/PID_controller)), the drop rate is adjusted dynamically based on the load factor so that the load factor always drifts towards the specified limit (or setpoint, in PID terms).

As reading the cpu load average is relatively expensive (opening /proc/stat, parsing it, etc), this only happens once every timer\_interval seconds and consequently the FEEDBACK value is only at these intervals recomputed. This in turn makes it difficult for the drop rate to adjust quickly. Worst case scenarios are request rates going up/down instantly by thousands - it takes up to 20 seconds for the controller to adapt to the new request rate.

Generally though, as real life request rates drift by less, adapting should happen much faster.

IMPORTANT NOTE: as this algorithm is diven by the load factor, the values for the limits must be between 0 and 100 (as percentages) and the limits for all the checks and pipes must be the same (only one value). Again, this limitation are specific to this algorithm and not to the implementation.

## 1.5.�Dependencies

### 1.5.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.5.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.6.�Exported Parameters

### 1.6.1.�`timer_interval` (integer)

The timer interval in seconds when the Network and Feedback algorithms run their queries, and the other algorithms reset their counters.

IMPORTANT: A too small value may lead to performance penalties due to timer process overloading.

_Default value is 10._

**Example�1.1.�Set `timer_interval` parameter**

...
modparam("ratelimit", "timer\_interval", 5)
...

  

### 1.6.2.�`limit_per_interval` (integer)

This parameter configures the way that a pipe's limit is specified in the _rl\_check_ function and only affects the Taildrop and RED algorithms. A value of 1 means that the limit is set per-_timer\_interval_ while a value of 0 means per-second.

_Default value is 0(limit per-second)._

**Example�1.2.�Set `limit_per_interval` parameter**

...
modparam("ratelimit", "limit\_per\_interval", 1)
...

  

### 1.6.3.�`expire_time` (integer)

This parameter specifies how long a pipe should be kept in memory after it becomes idle (no more operations are performed on the pipe) until deleted.

_Default value is 3600._

**Example�1.3.�Set `expire_time` parameter**

...
modparam("ratelimit", "expire\_time", 1800)
...

  

### 1.6.4.�`hash_size` (integer)

The size of the hash table internally used to keep the pipes. A larger table is much faster but consumes more memory. The hash size must be a power of 2 number.

_Default value is 1024._

**Example�1.4.�Set `hash_size` parameter**

...
modparam("ratelimit", "hash\_size", 512)
...

  

### 1.6.5.�`default_algorithm` (string)

Specifies which algorithm should be assumed in case it isn't explicitly specified in the _rl\_check_ function.

_Default value is "TAILDROP"._

**Example�1.5.�Set `default_algorithm` parameter**

...
modparam("ratelimit", "default\_algorithm", "RED")
...

  

### 1.6.6.�`cachedb_url` (string)

Enables distributed rate limiting and specifies the backend that should be used by the CacheDB interface.

_Default value is "disabled"._

**Example�1.6.�Set `cachedb_url` parameter**

...
modparam("ratelimit", "cachedb\_url", "redis://root:root@127.0.0.1/")
...

  

### 1.6.7.�`db_prefix` (string)

Specifies what prefix should be added to the pipe name. This is only used when distributed rate limiting is enabled.

_Default value is "rl\_pipe\_"._

**Example�1.7.�Set `db_prefix` parameter**

...
modparam("ratelimit", "db\_prefix", "ratelimit\_")
...

  

### 1.6.8.�`repl_buffer_threshold` (string)

Used to specify the length of the buffer used by the binary replication, in bytes, when a flush should be performed - the pipes gathered until then should be sent on the network. This is used to avoid using large amount of memory for pipes replication.

_Default value is 32767 bytes._

**Example�1.8.�Set `repl_buffer_threshold` parameter**

...
modparam("ratelimit", "repl\_buffer\_threshold", 500)
...

  

### 1.6.9.�`repl_timer_interval` (string)

Timer in milliseconds, used to specify how often the module should replicate its counters to the other instances.

_Default value is 200 ms._

**Example�1.9.�Set `repl_timer_interval` parameter**

...
modparam("ratelimit", "repl\_timer\_interval", 100)
...

  

### 1.6.10.�`repl_timer_expire` (string)

Timer in seconds, used to specify when the counter received from a different instance should no longer be taken into account. This is used to prevent obsolete values, in case an instance stops replicating its counters.

_Default value is 10 s._

**Example�1.10.�Set `repl_timer_expire` parameter**

...
modparam("ratelimit", "repl\_timer\_expire", 10)
...

  

### 1.6.11.�`pipe_replication_cluster` (integer)

Specifies the cluster ID where pipes will be replicated to and received from.

_Default value is 0. (no replication)_

**Example�1.11.�Set `pipe_replication_cluster` parameter**

...
modparam("ratelimit", "pipe\_replication\_cluster", 1)
...

  

### 1.6.12.�`window_size` (int)

How long the history in SBT should be in seconds.

_Default value is “10”._

**Example�1.12.�Set `window_size` parameter**

...
modparam("ratelimit", "window\_size", 5)
...

  

### 1.6.13.�`slot_period` (int)

Value of one slot in milliseconds. This parameter determines how granular the algorithm should be. The number of slots will be determined by window\_size/slot\_period.

_Default value is “200”._

**Example�1.13.�Set `slot_period` parameter**

...
modparam("ratelimit", "window\_size", 5)
#we will have 50 slots of 100 milliseconds
modparam("ratelimit", "slot\_period", 100)
...

  

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

  

## 1.8.�Exported MI Functions

### 1.8.1.� `rl_list`

Lists the parameters and variabiles in the ratelimit module.

Name: _rl\_list_

Parameters:

*   _pipe_ (optional) - indicates the name of the single pipe to be listed.
    
*   _filter_ (optional) - a pattern used to filter the active pipes to be listed. The filter is a shell wildcard pattern (see glob(7)).
    
*   _filter\_out_ (optional) - a pattern used to filter out the active pipes NOT to be listed. The filter is a shell wildcard pattern (see glob(7)).
    

Note that you cannot combine multiple paramters when calling this function. If using parameters, only one is accepted.

If no parameter are passed to the function, all the active pipes are listed.

MI FIFO Command Format:

		opensips-cli -x mi rl\_list pipe=gw\_10.0.0.1
		opensips-cli -x mi rl\_list filter=gw\_\*
		

### 1.8.2.� `rl_dump_pipe`

Exposes all the details about the current runtime data (specific to the pipe's algorithm) of a pipe. Currently make sense for SBT.

Name: _rl\_dump\_pipe_

Parameters:

*   _pipe_ - indicates the name of the pipe.
    

MI FIFO Command Format:

		opensips-cli -x mi rl\_dump\_pipe gw\_10.0.0.1
		

### 1.8.3.� `rl_reset_pipe`

Resets the counter of a specified pipe.

Name: _rl\_reset\_pipe_

Parameters:

*   _pipe_ - indicates the name of the pipe whose counter should be reset.
    

MI FIFO Command Format:

		opensips-cli -x mi rl\_reset\_pipe gw\_10.0.0.1
		

### 1.8.4.� `rl_set_pid`

Sets the PID Controller parameters for the Feedback Algorithm.

Name: _rl\_set\_pid_

Parameters:

*   _ki_ - the integral parameter.
    
*   _kp_ - the proportional parameter.
    
*   _kd_ - the derivative parameter.
    

MI FIFO Command Format:

		opensips-cli -x mi rl\_set\_pid 0.5 0.5 0.5
		

### 1.8.5.� `rl_get_pid`

Gets the list of in use PID Controller parameters.

Name: _rl\_get\_pid_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi rl\_get\_pid
		

### 1.8.6.� `rl_bin_status`

Dumps each destination used for replication, as well as the timestamp of the last message received from them.

Name: _rl\_bin\_status_

Parameters: _none_

MI FIFO Command Format:

		opensips-cli -x mi rl\_bin\_status
		

## 1.9.�Exported Pseudo-Variables

### 1.9.1.�`$rl_count(name)`

Returns the counter of a pipe. The variable is read-only.

NULL will be returned if the pipe does not exist.

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

133

62

3189

2700

2.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

39

17

2481

44

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

35

29

299

137

4.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

30

17

359

558

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

23

19

67

129

6.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

13

6

329

195

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

9

7

24

18

8.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

7

8

9.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

4

2

34

24

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

4

2

4

2

  

**All remaining contributors**: Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Robert Moss, Arnaud Boussus, Sergio Gutierrez, Stanislaw Pitucha, Bill Hau, Konstantin Bokarius, Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Juli�n Moreno Pati�o, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2011 - May 2025

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Feb 2008 - Jul 2023

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Feb 2023

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - Apr 2021

5.

Robert Moss

Feb 2021 - Feb 2021

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jul 2016 - Apr 2019

8.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

Jul 2015 - Dec 2016

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

Dec 2015 - Dec 2015

  

**All remaining contributors**: Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Bill Hau, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Stanislaw Pitucha, Arnaud Boussus, Sergio Gutierrez, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Arnaud Boussus, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Henning Westerholt ([@henningw](https://github.com/henningw)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Edson Gellert Schubert.

_Documentation Copyrights:_

Copyright � 2011 OpenSIPS Foundation

Copyright � 2008 VoIP Embedded Inc.

Copyright � 2006 Freenet Cityline GmbH