# qrouting Module Reference
<!-- generated-from: data/3.6/modules/qrouting.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 qrouting module. Read this file when configuring or debugging the qrouting module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

_qrouting_ is a module which sits on top of [drouting](../drouting/doc/drouting.html), [dialog](../dialog/doc/dialog.html) and [tm](../tm/doc/tm.html) and performs live tracking of a series of essential gateway signaling quality indicators (i.e. ASR, CCR, PDD, AST, ACD -- more details below). Thus, qrouting is able to adjust the prefix routing behavior at runtime, by dynamically re-ordering the gateways based on how well they perform during live traffic, such that:

*   well-performing gateways get prioritized for routing
    
*   gateways which show a degradation in signaling quality are demoted to the end of the routing list

## Dependencies

### OpenSIPs Modules

- `an SQL DB module` — offering access to the "qr_profiles" table
- `dialog`
- `drouting`
- `tm`

### External Libraries

None.

## Exported Parameters

### `algorithm` (integer)

Quality-based destination selection/balancing algorithm to use. Possible values: * "dynamic-weights" - for each prefix, all destinations start with equal weights and receive an equal share of the traffic. As signaling statistics are gathered for the destinations, the ones which underperform will receive less traffic, based on the "penalty" columns of the _qr_profiles_ table * "best-dest-first" - for each prefix, the 1st (i.e. _best scoring_) destination will receive all the traffic as long as its quality stays the same. Initially, all destinations start with a perfect score. This score may degrade if one or more signaling statistics fall below the "warn" or "crit" thresholds during routing, case in which the destinations will be sorted accordingly and traffic will be routed to the newly determined 1st position in the list

*Default value is "dynamic-weights".*

**Possible values:**

- dynamic-weights
- best-dest-first

**Notes:** NOTE: for optimal results when using the "best-dest-first" algorithm, the destinations must be provisioned in descending order of their expected quality! (i.e. best quality gateways must be placed towards the start of the list)

**Example.** Set the `algorithm` parameter.

```opensips
modparam("qrouting", "algorithm", "best-dest-first")
```
### `db_url` (string)

An SQL database URL.

*Default value is NULL.*

**Example.** Set the `db_url` parameter.

```opensips
modparam("qrouting", "db_url", "mysql://opensips:opensipsrw@localhost/opensips")
```
### `decimal_digits` (string)

The amount of decimal digits to use in logging or MI output.

*Default value is 2.*

**Example.** 4.

```opensips
modparam("qrouting", "decimal_digits", 4)
```
### `event_bad_dst_threshold` (string)

The minimally accepted quality of a (prefix, destination) combination, given as a quoted floating point number in the \[0, 1\] interval. Whenever a (prefix, destination) combination receives a score below this threshold, the [E_QROUTING_BAD_DST](#event_E_QROUTING_BAD_DST "1.7.1. E_QROUTING_BAD_DST") event will be triggered.

*Default value is NULL (not set).*

*Valid range: 0 to 1.*

**Example.** 0.5.

```opensips
modparam("qrouting", "event_bad_dst_threshold", "0.5")
```
### `extra_stats` (string)

A semicolon-separated list of custom statistics to be additionally kept and monitored by the module. In order to gather these statistics, the module expects the script writer to call qr_set_xstat() whenever they want to increment a custom statistic for a (prefix, destination) tuple.

Extra statistics come in two flavours: positive (a higher value is better, e.g. ASR) or negative (a lower value is better, e.g. PDD). The flavour determines the comparison operator to be used against the statistics's thresholds, and can be specified by prepending "+" or "-", respectively, in front of the statistic's name (see example below).

The minimally accepted number of samples for each statistic may be changed using the optional /<min_samples> suffix. Default value: 30 samples (minimum).

The thresholds and penalties for a custom statistic must be provided via the qr_profiles table, by extending it with 4 columns for each extra statistic, named according to these templates:

*   warn_threshold_<STAT>
*   crit_threshold_<STAT>
*   warn_penalty_<STAT>
*   crit_penalty_<STAT>

*Default value is NULL.*

**Example.** +mos/60; +r_factor; -503_replies/100.

```opensips
modparam("qrouting", "extra_stats", "+mos/60; +r_factor; -503_replies/100")
```
### `history_span` (integer)

The duration (in minutes) that a gateway's statistics for a given call will be kept for.

*Default value is 30.*

**Example.** Set the `history_span` parameter.

```opensips
modparam("qrouting", "history_span", 15)
```
### `min_samples_acd` (integer)

The minimally accepted amount of sampled ACD statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the ACD statistic of the pair is assumed to be healthy.

*Default value is 20.*

**Example.** 30.

```opensips
modparam("qrouting", "min_samples_acd", 30)
```
### `min_samples_asr` (integer)

The minimally accepted amount of sampled ASR statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the ASR statistic of the pair is assumed to be healthy.

*Default value is 30.*

**Example.** 50.

```opensips
modparam("qrouting", "min_samples_asr", 50)
```
### `min_samples_ast` (integer)

The minimally accepted amount of sampled AST statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the AST statistic of the pair is assumed to be healthy.

*Default value is 10.*

**Example.** 15.

```opensips
modparam("qrouting", "min_samples_ast", 15)
```
### `min_samples_ccr` (integer)

The minimally accepted amount of sampled CCR statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the CCR statistic of the pair is assumed to be healthy.

*Default value is 30.*

**Example.** 50.

```opensips
modparam("qrouting", "min_samples_ccr", 50)
```
### `min_samples_pdd` (integer)

The minimally accepted amount of sampled PDD statistics for each (prefix, destination) pair before they can be taken into account. As long as the number of samples stays below this limit, the PDD statistic of the pair is assumed to be healthy.

*Default value is 10.*

**Example.** 15.

```opensips
modparam("qrouting", "min_samples_pdd", 15)
```
### `sampling_interval` (integer)

The duration (in seconds) of the statistics sampling window. Every _[sampling_interval](#param_sampling_interval "1.4.5.sampling_interval (integer)")_ seconds, the accumulated statistics during the most recent sampling window get added to each gateway, while the oldest sampled interval statistics are subtracted (rotated away) from each gateway. A lower value will lead to a closer to realtime adjustment to traffic changes, but it will also increase CPU usage and internal contention due to locking.

*Default value is 5.*

**Example.** Set the `sampling_interval` parameter.

```opensips
modparam("qrouting", "sampling_interval", 5)
```
### `table_name` (string)

The name of the quality-based routing profiles table.

*Default value is "qr_profiles".*

**Example.** Set the `table_name` parameter.

```opensips
modparam("qrouting", "table_name", "qr_profiles_bak")
```

## Exported Functions

### `qr_disable_dst(rule_id, dst_name, [part])`

Within a given routing rule, temporarily remove the given gateway or carrier from routing, until they are re-enabled via qr_enable_dst() or qr_enable_dst. The removal effect will be lost on an OpenSIPS restart.

**Parameters:**

- `dst_name` *(string, required)* — gateway or carrier to disable
- `part` *(string, optional)* — drouting partition
- `rule_id` *(integer, required)* — database id of the drouting rule

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Related:**

- `qr_enable_dst`

**Example.** the signaling quality for @rule_id through @dst_name is degrading, remove it!.

```opensips
# the signaling quality for @rule_id through @dst_name is degrading, remove it!
event_route [E_QROUTING_BAD_DST]
{
	qr_disable_dst($param(rule_id), $param(dst_name), $param(partition));
}
```

### `qr_enable_dst(rule_id, dst_name, [part])`

Within a given routing rule, re-introduce the given gateway or carrier into the routing process.

**Parameters:**

- `dst_name` *(string, required)* — gateway or carrier to disable
- `part` *(string, optional)* — drouting partition
- `rule_id` *(integer, required)* — database id of the drouting rule

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** the ban has expired, let's re-enable this gateway and see how it behaves.

```opensips
# the ban has expired, let's re-enable this gateway and see how it behaves
qr_enable_dst($param(rule_id), $param(dst_name), $param(partition));
```

### `qr_set_xstat(rule_id, gw_name, stat_name, inc_by, [part], [inc_total])`

Provide a new sample value for an extra statistic on a given (prefix, gateway) combination. Extra statistics may be defined using the extra_stats module parameter.

**Parameters:**

- `gw_name` *(string, required)* — gateway to account the statistic for. The gateway must be part of the above rule's destinations.
- `inc_by` *(string, required)* — quoted floating point number, representing the amount to add to the stat
- `inc_total` *(string, optional)* — the amount to add to the total stat counter. Usually, this value should be 1, but it may make sense to set it to 0 when a custom statistic needs to be set a 2nd, 3rd, etc. time across the duration of the same established call.
- `part` *(string, optional)* — the drouting partition to use
- `rule_id` *(integer, required)* — database id of the drouting rule holding the prefix and its destinations
- `stat_name` *(string, required)* — statistic to account

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** the MoS is set exactly once per call, so we can omit "inc_total".

```opensips
# the MoS is set exactly once per call, so we can omit "inc_total"
$var(rule_id) = 1574;
$var(gw_name) = "GW-28";
$var(mos_score) = "4.28";
qr_set_xstat($var(rule_id), $var(gw_name), "mos", $var(mos_score));
```

## Exported MI Functions

### `qr_disable_dst`

Within a given routing rule, temporarily remove the given gateway or carrier from routing, until they are re-enabled manually. The removal effect will be lost on an OpenSIPS restart.

**Parameters:**

- `dst_name` *(string, required)* — gateway or carrier to disable
- `partition` *(string, optional)* — drouting partition
- `rule_id` *(integer, required)* — database id of the drouting rule

**Example.**

```opensips-cli
opensips-cli -x mi qr_disable_dst 14 MY-CARR-7
```

**Example.**

```opensips-cli
opensips-cli -x mi qr_disable_dst pstn 81 MY-GW-3
```

### `qr_enable_dst`

Within a given routing rule, re-introduce the given gateway or carrier into the routing process.

**Parameters:**

- `dst_name` *(string, required)* — gateway or carrier to enable
- `partition` *(string, optional)* — drouting partition
- `rule_id` *(integer, required)* — database id of the drouting rule

**Example.**

```opensips-cli
opensips-cli -x mi qr_enable_dst 14 MY-CARR-7
```

**Example.**

```opensips-cli
opensips-cli -x mi qr_enable_dst pstn 81 MY-GW-3
```

### `qr_reload`

Reload all quality-based routing rules from the SQL database.

**Example.**

```opensips-cli
opensips-cli -x mi qr_reload
```

### `qr_status`

Inspect the signaling quality statistics of the current history_span for all drouting gateways in all partitions, with various levels of filtering.

**Parameters:**

- `dst_name` *(string, optional)* — a specific gateway or carrier name to list statistics for
- `partition` *(string, optional)* — a specific drouting partition to list statistics for
- `rule_id` *(integer, optional)* — a specific drouting rule database id to list statistics for

**Example.**

```opensips-cli
opensips-cli -x mi qr_status
```

**Example.**

```opensips-cli
opensips-cli -x mi qr_status pstn
```

**Example.**

```opensips-cli
opensips-cli -x mi qr_status pstn 11 MY-GW-3
```

**Example.**

```opensips-cli
opensips-cli -x mi qr_status pstn 17 MY-CARR-7
```

## Exported Events

### `E_QROUTING_BAD_DST`

This event may be raised during routing, asynchronously, whenever the score of a (prefix, destination) pair falls below [event_bad_dst_threshold](#param_event_bad_dst_threshold "1.4.12.event_bad_dst_threshold (string)").

**Parameters:**

- `partition` *(string)* — drouting partition name
- `rule_id` *(integer)* — database id of the drouting rule
- `dst_name` *(string)* — name of the concerned gateway or carrier

## Configuration Examples

### Setting the `db_url` parameter

```opensips
modparam("qrouting", "db_url", "mysql://opensips:opensipsrw@localhost/opensips")
```
### Setting the `table_name` parameter

```opensips
modparam("qrouting", "table_name", "qr_profiles_bak")
```
### Setting the `algorithm` parameter

```opensips
modparam("qrouting", "algorithm", "best-dest-first")
```
### Setting the `connection_timeout` parameter

```opensips
modparam("qrouting", "history_span", 15)
```
### Setting the `connect_poll_interval` parameter

```opensips
modparam("qrouting", "sampling_interval", 5)
```
### Setting the `extra_stats` parameter

```opensips
modparam("qrouting", "extra_stats", "+mos/60; +r_factor; -503_replies/100")
```
### Setting the `min_samples_asr` parameter

```opensips
modparam("qrouting", "min_samples_asr", 50)
```
### Setting the `min_samples_ccr` parameter

```opensips
modparam("qrouting", "min_samples_ccr", 50)
```
### Setting the `min_samples_pdd` parameter

```opensips
modparam("qrouting", "min_samples_pdd", 15)
```
### Setting the `min_samples_ast` parameter

```opensips
modparam("qrouting", "min_samples_ast", 15)
```
### Setting the `min_samples_acd` parameter

```opensips
modparam("qrouting", "min_samples_acd", 30)
```
### Setting the `event_bad_dst_threshold` parameter

```opensips
modparam("qrouting", "event_bad_dst_threshold", "0.5")
```
### Setting the `decimal_digits` parameter

```opensips
modparam("qrouting", "decimal_digits", 4)
```
### `qr_set_xstat()` usage

```opensips
# the MoS is set exactly once per call, so we can omit "inc_total"
$var(rule_id) = 1574;
$var(gw_name) = "GW-28";
$var(mos_score) = "4.28";
qr_set_xstat($var(rule_id), $var(gw_name), "mos", $var(mos_score));
```
### `qr_disable_dst()` usage

```opensips
# the signaling quality for @rule_id through @dst_name is degrading, remove it!
event_route \[E_QROUTING_BAD_DST\]
{
	qr_disable_dst($param(rule_id), $param(dst_name), $param(partition));
}
```
### `qr_enable_dst()` usage

```opensips
# the ban has expired, let's re-enable this gateway and see how it behaves
qr_enable_dst($param(rule_id), $param(dst_name), $param(partition));
```
