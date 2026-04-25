# qrouting (Quality-based Routing) Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5799216)

2.2. [Most recently active contributors(1) to this module](#idp5880416)

**List of Examples**

1.1. [Setting the `db_url` parameter](#idp164352)

1.2. [Setting the `table_name` parameter](#idp169904)

1.3. [Setting the `algorithm` parameter](#idp5515552)

1.4. [Setting the `connection_timeout` parameter](#idp5520800)

1.5. [Setting the `connect_poll_interval` parameter](#idp5539568)

1.6. [Setting the `extra_stats` parameter](#idp5554320)

1.7. [Setting the `min_samples_asr` parameter](#idp5559744)

1.8. [Setting the `min_samples_ccr` parameter](#idp5565072)

1.9. [Setting the `min_samples_pdd` parameter](#idp5570400)

1.10. [Setting the `min_samples_ast` parameter](#idp5575728)

1.11. [Setting the `min_samples_acd` parameter](#idp5581056)

1.12. [Setting the `event_bad_dst_threshold` parameter](#idp5586864)

1.13. [Setting the `decimal_digits` parameter](#idp5592080)

1.14. [`qr_set_xstat()` usage](#idp5605648)

1.15. [`qr_disable_dst()` usage](#idp5614992)

1.16. [`qr_enable_dst()` usage](#idp5623312)

## Chapter�1.�Admin Guide

## 1.1.�Overview

_qrouting_ is a module which sits on top of [drouting](../drouting/doc/drouting.html), [dialog](../dialog/doc/dialog.html) and [tm](../tm/doc/tm.html) and performs live tracking of a series of essential gateway signaling quality indicators (i.e. ASR, CCR, PDD, AST, ACD -- more details below). Thus, qrouting is able to adjust the prefix routing behavior at runtime, by dynamically re-ordering the gateways based on how well they perform during live traffic, such that:

*   well-performing gateways get prioritized for routing
    
*   gateways which show a degradation in signaling quality are demoted to the end of the routing list
    

## 1.2.�Monitored Statistics

The module keeps track of a series of statistics, for each drouting **(prefix, destination)** pair, where a "destination" may be either a gateway or a carrier. The statistics are:

*   ASR (Answer Seizure Ratio) - the percentage of telephone calls which are answered (200 reply status code).
    
*   CCR (Call Completion Ratio) - the percentage of telephone calls which are answered back by the gateway, excluding 5xx, 6xx reply codes and internal 408 timeouts. The following is always true: CCR >= ASR.
    
*   PDD (Post Dial Delay) - the duration, in milliseconds, between the receival of the initial INVITE and the receival of the first 180/183 provisional reply (the call state advances to _"ringing"_).
    
*   AST (Average Setup Time) - the duration, in milliseconds, between the receival of the initial INVITE and the receival of the first 200 OK reply (the call state advances to _"answered"_). The following is always true: AST >= PDD.
    
*   ACD (Average Call Duration) - the duration, in seconds, between the receival of the initial INVITE and the receival of the first BYE request from either participant (the call state advances to _"ended"_).
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded for this module to work:

*   _an SQL DB module, offering access to the "qr\_profiles" table_
    
*   _tm_
    
*   _dialog_
    
*   _drouting_
    

## 1.4.�Exported Parameters

### 1.4.1.�`db_url` (string)

An SQL database URL.

_Default value is **NULL**._

**Example�1.1.�Setting the `db_url` parameter**

modparam("qrouting", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips")
	

  

### 1.4.2.�`table_name` (string)

The name of the quality-based routing profiles table.

_Default value is **"qr\_profiles"**._

**Example�1.2.�Setting the `table_name` parameter**

modparam("qrouting", "table\_name", "qr\_profiles\_bak")
	

  

### 1.4.3.�`algorithm` (integer)

Quality-based destination selection/balancing algorithm to use.

Possible values:

*   **"dynamic-weights"** - for each prefix, all destinations start with equal weights and receive an equal share of the traffic. As signaling statistics are gathered for the destinations, the ones which underperform will receive less traffic, based on the "penalty" columns of the _qr\_profiles_ table
    
*   **"best-dest-first"** - for each prefix, the 1st (i.e. _best scoring_) destination will receive all the traffic as long as its quality stays the same. Initially, all destinations start with a perfect score. This score may degrade if one or more signaling statistics fall below the "warn" or "crit" thresholds during routing, case in which the destinations will be sorted accordingly and traffic will be routed to the newly determined 1st position in the list
    
    _NOTE_: for optimal results when using the "best-dest-first" algorithm, the destinations must be provisioned in descending order of their expected quality! (i.e. best quality gateways must be placed towards the start of the list)
    

_Default value is **"dynamic-weights"**._

**Example�1.3.�Setting the `algorithm` parameter**

modparam("qrouting", "algorithm", "best-dest-first")
	

  

### 1.4.4.�`history_span` (integer)

The duration (in minutes) that a gateway's statistics for a given call will be kept for.

_Default value is **30** minutes._

**Example�1.4.�Setting the `connection_timeout` parameter**

modparam("qrouting", "history\_span", 15)
	

  

### 1.4.5.�`sampling_interval` (integer)

The duration (in seconds) of the statistics sampling window. Every _[sampling\_interval](#param_sampling_interval "1.4.5.�sampling_interval (integer)")_ seconds, the accumulated statistics during the most recent sampling window get added to each gateway, while the oldest sampled interval statistics are subtracted (rotated away) from each gateway.

A lower value will lead to a closer to realtime adjustment to traffic changes, but it will also increase CPU usage and internal contention due to locking.

_Default value is **5** seconds._

**Example�1.5.�Setting the `connect_poll_interval` parameter**

modparam("qrouting", "sampling\_interval", 5)
	

  

### 1.4.6.�`extra_stats` (string)

A semicolon-separated list of custom statistics to be additionally kept and monitored by the module. In order to gather these statistics, the module expects the script writer to call [qr\_set\_xstat()](#func_qr_set_xstat "1.5.1.� qr_set_xstat(rule_id, gw_name, stat_name, inc_by, [part], [inc_total])") whenever they want to increment a custom statistic for a (prefix, destination) tuple.

Extra statistics come in two flavours: _positive_ (a higher value is better, e.g. ASR) or _negative_ (a lower value is better, e.g. PDD). The flavour determines the comparison operator to be used against the statistics's thresholds, and can be specified by prepending **"+"** or **"-"**, respectively, in front of the statistic's name (see example below).

The minimally accepted number of samples for each statistic may be changed using the optional **/<min\_samples>** suffix. Default value: **30** samples (minimum).

The thresholds and penalties for a custom statistic must be provided via the _qr\_profiles_ table, by extending it with 4 columns for each extra statistic, named according to these templates:

*   warn\_threshold\__<STAT>_
    
*   crit\_threshold\__<STAT>_
    
*   warn\_penalty\__<STAT>_
    
*   crit\_penalty\__<STAT>_
    

_Default value is **NULL**._

**Example�1.6.�Setting the `extra_stats` parameter**

modparam("qrouting", "extra\_stats", "+mos/60; +r\_factor; -503\_replies/100")
	

  

### 1.4.7.�`min_samples_asr` (integer)

The minimally accepted amount of sampled ASR statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the ASR statistic of the pair is assumed to be healthy.

_Default value is **30**._

**Example�1.7.�Setting the `min_samples_asr` parameter**

modparam("qrouting", "min\_samples\_asr", 50)
	

  

### 1.4.8.�`min_samples_ccr` (integer)

The minimally accepted amount of sampled CCR statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the CCR statistic of the pair is assumed to be healthy.

_Default value is **30**._

**Example�1.8.�Setting the `min_samples_ccr` parameter**

modparam("qrouting", "min\_samples\_ccr", 50)
	

  

### 1.4.9.�`min_samples_pdd` (integer)

The minimally accepted amount of sampled PDD statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the PDD statistic of the pair is assumed to be healthy.

_Default value is **10**._

**Example�1.9.�Setting the `min_samples_pdd` parameter**

modparam("qrouting", "min\_samples\_pdd", 15)
	

  

### 1.4.10.�`min_samples_ast` (integer)

The minimally accepted amount of sampled AST statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the AST statistic of the pair is assumed to be healthy.

_Default value is **10**._

**Example�1.10.�Setting the `min_samples_ast` parameter**

modparam("qrouting", "min\_samples\_ast", 15)
	

  

### 1.4.11.�`min_samples_acd` (integer)

The minimally accepted amount of sampled ACD statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the ACD statistic of the pair is assumed to be healthy.

_Default value is **20**._

**Example�1.11.�Setting the `min_samples_acd` parameter**

modparam("qrouting", "min\_samples\_acd", 30)
	

  

### 1.4.12.�`event_bad_dst_threshold` (string)

The minimally accepted quality of a (prefix, destination) combination, given as a quoted floating point number in the \[0, 1\] interval. Whenever a (prefix, destination) combination receives a score below this threshold, the [E\_QROUTING\_BAD\_DST](#event_E_QROUTING_BAD_DST "1.7.1.� E_QROUTING_BAD_DST") event will be triggered.

_Default value is **NULL** (not set)._

**Example�1.12.�Setting the `event_bad_dst_threshold` parameter**

modparam("qrouting", "event\_bad\_dst\_threshold", "0.5")
	

  

### 1.4.13.�`decimal_digits` (string)

The amount of decimal digits to use in logging or MI output.

_Default value is **2**._

**Example�1.13.�Setting the `decimal_digits` parameter**

modparam("qrouting", "decimal\_digits", 4)
	

  

## 1.5.�Exported Functions

### 1.5.1.� `qr_set_xstat(rule_id, gw_name, stat_name, inc_by, [part], [inc_total])`

Provide a new sample value for an extra statistic on a given (prefix, gateway) combination. Extra statistics may be defined using the [extra\_stats](#param_extra_stats "1.4.6.�extra_stats (string)") module parameter.

Parameters:

*   _rule\_id (integer)_ - database id of the drouting rule holding the prefix and its destinations
    
*   _gw\_name (string)_ - gateway to account the statistic for. The gateway must be part of the above rule's destinations.
    
*   _stat\_name (string)_ - statistic to account
    
*   _inc\_by (string)_ - quoted floating point number, representing the amount to add to the stat
    
*   _part (string, optional, default: 'Default')_ - the drouting partition to use
    
*   _inc\_total (string, optional, default: 1)_ - the amount to add to the total stat counter. Usually, this value should be 1, but it may make sense to set it to 0 when a custom statistic needs to be set a 2nd, 3rd, etc. time across the duration of the same established call.
    

This function can be used from any route.

**Example�1.14.�`qr_set_xstat()` usage**

\# the MoS is set exactly once per call, so we can omit "inc\_total"
$var(rule\_id) = 1574;
$var(gw\_name) = "GW-28";
$var(mos\_score) = "4.28";
qr\_set\_xstat($var(rule\_id), $var(gw\_name), "mos", $var(mos\_score));
	

  

### 1.5.2.� `qr_disable_dst(rule_id, dst_name, [part])`

Within a given routing rule, temporarily remove the given gateway or carrier from routing, until they are re-enabled via [qr\_enable\_dst()](#func_qr_enable_dst "1.5.3.� qr_enable_dst(rule_id, dst_name, [part])") or [qr\_enable\_dst](#mi_qr_enable_dst "1.6.4.�qr_enable_dst"). The removal effect will be lost on an OpenSIPS restart.

Parameters:

*   _rule\_id (integer)_ - database id of the drouting rule
    
*   _dst\_name (string)_ - gateway or carrier to disable
    
*   _part (string, optional)_ - drouting partition
    

This function can be used from any route.

**Example�1.15.�`qr_disable_dst()` usage**

\# the signaling quality for @rule\_id through @dst\_name is degrading, remove it!
event\_route \[E\_QROUTING\_BAD\_DST\]
{
	qr\_disable\_dst($param(rule\_id), $param(dst\_name), $param(partition));
}
	

  

### 1.5.3.� `qr_enable_dst(rule_id, dst_name, [part])`

Within a given routing rule, re-introduce the given gateway or carrier into the routing process.

Parameters:

*   _rule\_id (integer)_ - database id of the drouting rule
    
*   _dst\_name (string)_ - gateway or carrier to disable
    
*   _part (string, optional)_ - drouting partition
    

This function can be used from any route.

**Example�1.16.�`qr_enable_dst()` usage**

\# the ban has expired, let's re-enable this gateway and see how it behaves
qr\_enable\_dst($param(rule\_id), $param(dst\_name), $param(partition));
	

  

## 1.6.�Exported MI Functions

### 1.6.1.�`qr_reload`

Reload all quality-based routing rules from the SQL database.

MI FIFO Command Format:

opensips-cli -x mi qr\_reload
		

### 1.6.2.�`qr_status`

Inspect the signaling quality statistics of the current [history\_span](#param_history_span "1.4.4.�history_span (integer)") for all drouting gateways in all partitions, with various levels of filtering.

Parameters:

*   _partition (optional)_ - a specific drouting partition to list statistics for
    
*   _rule\_id (optional)_ - a specific drouting rule database id to list statistics for
    
*   _dst\_name (optional)_ - a specific gateway or carrier name to list statistics for
    

MI FIFO Command Format:

opensips-cli -x mi qr\_status
opensips-cli -x mi qr\_status pstn
opensips-cli -x mi qr\_status pstn 11 MY-GW-3
opensips-cli -x mi qr\_status pstn 17 MY-CARR-7
		

### 1.6.3.�`qr_disable_dst`

Within a given routing rule, temporarily remove the given gateway or carrier from routing, until they are re-enabled manually. The removal effect will be lost on an OpenSIPS restart.

Parameters:

*   _partition (optional)_ - drouting partition
    
*   _rule\_id_ - database id of the drouting rule
    
*   _dst\_name_ - gateway or carrier to disable
    

MI FIFO Command Format:

opensips-cli -x mi qr\_disable\_dst 14 MY-CARR-7
opensips-cli -x mi qr\_disable\_dst pstn 81 MY-GW-3
		

### 1.6.4.�`qr_enable_dst`

Within a given routing rule, re-introduce the given gateway or carrier into the routing process.

Parameters:

*   _partition (optional)_ - drouting partition
    
*   _rule\_id_ - database id of the drouting rule
    
*   _dst\_name_ - gateway or carrier to enable
    

MI FIFO Command Format:

opensips-cli -x mi qr\_enable\_dst 14 MY-CARR-7
opensips-cli -x mi qr\_enable\_dst pstn 81 MY-GW-3
		

## 1.7.�Exported Events

### 1.7.1.� `E_QROUTING_BAD_DST`

This event may be raised during routing, asynchronously, whenever the score of a (prefix, destination) pair falls below [event\_bad\_dst\_threshold](#param_event_bad_dst_threshold "1.4.12.�event_bad_dst_threshold (string)").

Parameters:

*   _partition_ - drouting partition name
    
*   _rule\_id_ - database id of the drouting rule
    
*   _dst\_name_ - name of the concerned gateway or carrier
    

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

151

65

4818

2748

2.

Mihai Tiganus ([@tallicamike](https://github.com/tallicamike))

49

15

2955

509

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

6

7

4.

Zero King ([@l2dy](https://github.com/l2dy))

3

1

1

1

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

2

1

0

3

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

2

1

0

2

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Feb 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jan 2020 - Apr 2021

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Mar 2020 - Mar 2020

4.

Zero King ([@l2dy](https://github.com/l2dy))

Mar 2020 - Mar 2020

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Feb 2020 - Feb 2020

6.

Mihai Tiganus ([@tallicamike](https://github.com/tallicamike))

Aug 2014 - Nov 2014

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)).

_Documentation Copyrights:_

Copyright � 2020 [www.opensips-solutions.com](http://www.opensips-solutions.com/)