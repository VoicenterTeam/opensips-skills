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