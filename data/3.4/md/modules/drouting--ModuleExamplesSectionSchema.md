# Dynamic Routing Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp31932320)

3.2. [Most recently active contributors(1) to this module](#idp31998160)

**List of Examples**

1.1. [Set `db_url` parameter](#idp30350304)

1.2. [Set `drd_table` parameter](#idp29815360)

1.3. [Set `drr_table` parameter](#idp30022976)

1.4. [Set `drg_table` parameter](#idp31059104)

1.5. [Set `drc_table` parameter](#idp29480208)

1.6. [Set `ruri_avp` parameter](#idp30101872)

1.7. [Set `gw_id_avp` parameter](#idp28385552)

1.8. [Set `gw_priprefix_avp` parameter](#idp29913952)

1.9. [Set `rule_id_avp` parameter](#idp29857456)

1.10. [Set `rule_prefix_avp` parameter](#idp28450768)

1.11. [Set `carrier_id_avp` parameter](#idp30609264)

1.12. [Set `gw_sock_avp` parameter](#idp28526400)

1.13. [Set `define_blacklist` parameter](#idp29341856)

1.14. [Set `default_group` parameter](#idp28078704)

1.15. [Set `force_dns` parameter](#idp29236720)

1.16. [Set the `persistent_state` parameter](#idp26773536)

1.17. [Set `no_concurrent_reload` parameter](#idp27330576)

1.18. [Set `probing_interval` parameter](#idp29744576)

1.19. [Set `probing_method` parameter](#idp28941920)

1.20. [Set `probing_from` parameter](#idp29487712)

1.21. [Set `probing_reply_codes` parameter](#idp30392320)

1.22. [Set `probing_socket` parameter](#idp28367488)

1.23. [Set `gw_socket_filter_mode` parameter](#idp30851024)

1.24. [Set `cluster_id` parameter](#idp30440048)

1.25. [Set `cluster_sharing_tag` parameter](#idp29619536)

1.26. [Set `cluster_probing_mode` parameter](#idp25482064)

1.27. [Set `use_domain` parameter](#idp25487760)

1.28. [Set `drg_user_col` parameter](#idp26962208)

1.29. [Set `drg_domain_col` parameter](#idp26967504)

1.30. [Set `drg_grpid_col` parameter](#idp26972848)

1.31. [Set `use_partitions` parameter](#idp26979168)

1.32. [Set `db_partitions_url` parameter](#idp26985168)

1.33. [Set `db_partitions_table` parameter](#idp26991616)

1.34. [Set `partition_id_pvar` parameter](#idp26998224)

1.35. [Set `enable_restart_persistency` parameter](#idp27005248)

1.36. [Set `extra_prefix_chars` parameter](#idp31065744)

1.37. [Set `extra_id_chars` parameter](#idp31070800)

1.38. [Set the `rule_tables_query` parameter](#idp31078080)

1.39. [`do_routing` usage](#idp31102896)

1.40. [`route_to_carrier` usage](#idp31118928)

1.41. [`route_to_gw` usage](#idp31132896)

1.42. [`use_next_gw` usage](#idp31147104)

1.43. [`goes_to_gw` usage](#idp31170768)

1.44. [`is_from_gw` usage](#idp31195408)

1.45. [`dr_is_gw` usage](#idp31220144)

1.46. [`dr_disable()` usage](#idp31228672)

1.47. [`dr_match` usage](#idp31245328)

1.48. [`dr_gw_status` usage when `use_partitions` is set to 0](#idp31273424)

1.49. [`dr_gw_status` usage when `use_partitions`is set to 1](#idp31275952)

1.50. [`dr_carrier_status` usage when `use_partitions` is 0](#idp31288880)

1.51. [`dr_carrier_status` usage when `use_partitions` is 1](#idp31291360)

1.52. [`dr_reload_status` usage when `use_partitions` is 0](#idp31299680)

1.53. [`dr_reload_status` usage when `use_partitions` is 1](#idp31302032)

1.54. [`dr_enable_probing` usage](#idp31319296)

## Chapter�1.�Admin Guide

## 1.1.�Overview

### 1.1.1.�Introduction

Dynamic Routing is a module for selecting (based on multiple criteria) the best gateway/destination to be used for delivering a certain call. Least Cost Routing (LCR) is a special case of dynamic routing - when the rules are ordered based on costs. Dynamic Routing comes with many features regarding routing rule selection:

*   prefix based
    
*   caller/group based
    
*   time based
    
*   priority based
    

, processing :

*   stripping and prefixing
    
*   default rules
    
*   inbound and outbound processing
    
*   script route triggering
    

and failure handling:

*   serial forking
    
*   weight based GW selection
    
*   random GW selection
    
*   GW probing for crashes
    

### 1.1.2.�Features

The dynamic routing implementation for OpenSIPS is designed with the following properties:

*   The routing info (destinations, carriers, rules, groups) is stored in a database and loaded into memory at start up time; reload at runtime via a Management Interface command.
    
*   weight-based or random selection of the destinations (from a rule or from a carrier), failure detection of gateways (with switching to next available gateway).
    
*   able to handle large volume of routing info (10M of rules) with minimal speed/time and memory consumption penalties
    
*   script integration - Pseudo-variable support in functions; scripting route triggering when rules are matched
    
*   bidirectional behavior - inbound and outbound processing (strip and prefixing when sending and receiving from a destination/GW)
    
*   blacklisting - the module allows definition of blacklists based on the destination IPs. This blacklists are to be used to prevent malicious forwarding to GWs (based on DNS lookups) when the script logic does none-GE forwarding (like foreign domains).
    
*   loading routing information from multiple databases - the gateways, rules, groups and carriers can be grouped by partitions, and each partition may be loaded from different databases/tables. This makes the routing process partition based. In order to be able to use a table from a partition, its name must be found in the "version" table belonging to the database defined in the partition's db\_url.
    

### 1.1.3.�Performance

There were several tests performed regarding the performance of the module when dealing with a large number of routing rules.

The tests were performed with a set of 383000 rules and measured:

*   time to load from DB
    
*   used shared memory
    

The time to load was varying between 4 seconds and 8 seconds, depending of the caching of the DB client - the first load was the slowest (as the DB query hits the disk drive); the following are faster as data is already cached in the DB client. So technically speaking, the time to load (without the time to query which is DB type dependent) is ~4 seconds

After loading the data into shared memory ~ 96M of memory were used exclusively for the DR data.

### 1.1.4.�Dynamic Routing Concepts

DR engine uses several concepts in order to define how the routing should be done (describing all the dependencies between destinations and routing rules).

#### 1.1.4.1.�Destination/Gateways

These are the end SIP entities where actually the traffic needs to be sent after routing. They are stored in a table called “dr\_gateways”. Gateway addresses are stored in a separate table because of the need to access them independent of Dynamic Routing processing (e.g., adding/ removing gateway PRI prefix before/after performing other operation -- receiving/relaying to gateway).

In DR, a gateway is defined by:

*   id (string)
    
*   SIP address (SIP URI)
    
*   type (integer which allows GWs to be grouped by purpose, e.g. inbound, outbound, etc.)
    
*   strip value (number of digits) from dialled number
    
*   prefix (string) to be added to dialled number
    
*   attributes (not used by DR engine, but only pushed to script level when routing to this GW)
    
*   probing mode (how the GW should be probed at SIP level - see the probing chapter)
    

The Gateways are to be used from the routing rule or from the carrier definition. They are all the time referred by their ID.

#### 1.1.4.2.�Carriers

The carrier concept is used if you need to group gateways in order to have a better control on how the GWs will be used by DR rules; like in what order the GWs will be used.

Basically, a carrier is a set of gateways which have its own sorting algorithm and its own attribute string. They are by default defined in the “dr\_carriers” table.

In DR, a carrier is defined by:

*   id (string)
    
*   list of gateways with/without weights (string) (Ex:“gw1=10,gw4=10” or “gw1,gw2”
    
*   flags : 0x1 - use only the first gateway from the carrier (depending on the sorting); 0x2 - disable the usage of this carrier
    
*   sort algorithm : how the list of the gateways should be sorted before being used, NULL - use the DB given order, W - do weight based re-ordering, Q - do quality based sorting (requires the qrouting module)
    
*   attributes (not used by DR engine, but only pushed to script level when routing to this carrier)
    

The Carriers are to be used only from the routing rule definition. They are all the time referred by their ID.

#### 1.1.4.3.�Routing Rules

These are the actual rules which control the routing. Using different criterias (prefix, time, priority, etc), they will decide to which gateways the call will be sent.

Default name for the table storing rule definitions is “dr\_rules”.

In DR, a routing rule is defined by:

*   group (list of numbers) - rules can be grouped (a rule may belong to multiple groups in the same time ) and you can use only a certain group at a point; like having a “premium” or “standard” or “interstate” or “intrastate” groups of rules to be used in different cases
    
*   prefix (string with digits only) - prefix to be used for matching this rule (longest prefix matching)
    
*   time validity (time recurrence string) - when this rule is valid from time point of view (see RFC 2445)
    
*   priority (number) - priority of the rule - higher value, higher priority (see rule section alg)
    
*   script route ID (string) - if defined, then execute the route with the specified ID when this rule is matched. That's it, a route which can be used to perform custom operations on message. NOTE that no modification is performed at signaling level and you must NOT do any signaling operations in that script route
    
*   list of GWs/carriers (string) - a comma separated list of gateways or carriers (defined by IDs) to be used for this rule; the carrier IDs are prefixed with “#” sign. For each ID (GW or carrier) you may specify a weight. For how this list will be interpreted (as order) see the rule selection section. Example of list: “gw1,gw4,#cr3” or “gw1=10,gw4=10,#cr3=80”
    
*   attributes (not used by DR engine, but only pushed to script level when this rule matched and been used)
    

More on time recurrence:

*   A date-time expression that defines the time recurrence to be matched for current rule. Time recurrences are based closely on the recurring time intervals from the Internet Calendaring and Scheduling Core Object Specification (calendar COS), RFC 2445. The set of attributes used in a routing rule specification is a subset of time recurrence attributes.
    
*   The value stored in database has the basic format of: <timezone>|<dtstart>|<dtend>|<duration>|<freq>|<until>|<interval>|<byday>|<bymonthday>|<byyearday>|<byweekno>|<bymonth> , identical to the input of the [check\_time\_rec()](cfgutils#func_check_time_rec) function of the _cfgutils_ module, including the optional use of logical operators linking multiple such strings into a larger expression.
    
*   When an attribute is not specified, the corresponding place must be left empty, whenever another attribute that follows in the list has to be specified.
    

### 1.1.5.�Routing Rule Processing

The module can be used to find out which is the best gateway to use for new calls terminated to PSTN. The algorithm to select the rule is as follows:

*   the module discovers the routing group of the originating user. This step is skipped if a routing group is passed from the script as parameter.
    
*   once the group is known, in the subset of the rules for this group the module looks for the one that matches the destination based on "prefix" column. The set of rules with the longest prefix is chosen. If no digit from the prefix matches, the default rules are used (rules with no prefix)
    
*   within the set of rules is applied the time criteria, and the rule which has the highest priority and matches the time criteria is selected to drive the routing.
    
*   Once found the rule, it may contain a route ID to execute. If a certain flag is set, then the processing is stopped after executing the route block.
    
*   The rule must contain a chain of gateways and carriers. The module will execute serial forking for each address in the chain (ordering is either done by simply using the definition order or it may weight-based - weight selection must be enabled). The next address in chain is used only if the previously has failed.
    
*   With the right gateway address found, the prefix (PRI) of the gateway is added to the request URI and then the request is forwarded.
    

If no rule is found to match the selection criteria an default action must be taken (e.g., error response sent back). If the gateway in the chain has no prefix the request is forwarded without adding any prefix to the request URI.

### 1.1.6.�Probing and Disabling destinations

The module has the capability to monitor the status of the destinations by doing SIP probing (sending SIP requests like OPTIONS).

For each destination, you can configure what kind of probing should be done (probe\_mode column):

*   _(0)_ - no probing at all;
    
*   _(1)_ - probing only when the destination is in disabled mode (disabling via MI command will completely stop the probing also). The destination will be automatically re-enabled when the probing will succeed next time;
    
*   _(2)_ - probing all the time. If disabled, the destination will be automatically re-enabled when the probing will succeed next time;
    

A destination can become disabled in two ways:

*   _script detection_ - by calling from script the dr\_disable() function after trying the destination. In this case, if probing mode for the destination is (1) or (2), the destination will be automatically re-enabled when the probing will succeed.
*   _MI command_ - by calling the dr\_gw\_status MI command for disabling (on demand) the destination. If so, the probing and re-enabling of this destination will be completly disabled until you re-enable it again via MI command - this is designed to allow controlled and complete disabling of some destination during maintenance.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database module_.
    

*   _tm module_.
    
*   _clusterer_ - only if "cluster\_id" option is enabled.
    

### 1.2.2.�External Libraries or Applications

*   _none_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url`(str)

The database url.

_Default value is “NULL”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("drouting", "db\_url",
	"mysql://opensips:opensipsrw@localhost/opensips")
...

  

### 1.3.2.�`drd_table`(str)

The name of the db table storing gateway addresses.

_Default value is “dr\_gateways”._

**Example�1.2.�Set `drd_table` parameter**

...
modparam("drouting", "drd\_table", "dr\_gateways")
...

  

### 1.3.3.�`drr_table`(str)

The name of the db table storing routing rules.

_Default value is “dr\_rules”._

**Example�1.3.�Set `drr_table` parameter**

...
modparam("drouting", "drr\_table", "rules")
...

  

### 1.3.4.�`drg_table`(str)

The name of the db table storing groups.

_Default value is “dr\_groups”._

**Example�1.4.�Set `drg_table` parameter**

...
modparam("drouting", "drg\_table", "groups")
...

  

### 1.3.5.�`drc_table`(str)

The name of the db table storing definitions of the carriers that will be used directly by the routing rules.

_Default value is “dr\_carriers”._

**Example�1.5.�Set `drc_table` parameter**

...
modparam("drouting", "drc\_table", "my\_dr\_carriers")
...

  

### 1.3.6.�`ruri_avp` (str)

The name of the avp for storing Request URIs to be later used (alternative destiantions for the current one).

_Default value is “$avp(\_\_\_dr\_ruri\_\_)” if `use_partitions` parameter is 0 or “$avp(\_\_\_dr\_ruri\_\_partition\_name)” where partition\_name is the name of the partition containing the AVP (as fetched from the database) if `use_partitions` parameter is 1._

**Example�1.6.�Set `ruri_avp` parameter**

...
modparam("drouting", "ruri\_avp", '$avp(dr\_ruri)')
modparam("drouting", "ruri\_avp", '$avp(33)')
...
	

  

### 1.3.7.�`gw_id_avp` (str)

The name of the avp for storing the id of the current selected gateway/destination - once a new destination is selected (via the use\_next\_gw() function), the AVP will be updated with the ID of the new selected gateway/destination.

_Default value is “$avp(\_\_\_dr\_gw\_id\_\_)” if `use_partitions` parameter is 0 or “$avp(\_\_\_dr\_gw\_id\_\_partition\_name)” where partition\_name is the name of the partition containing the AVP (as fetched from the database) if `use_partitions` parameter is 1._

**Example�1.7.�Set `gw_id_avp` parameter**

...
modparam("drouting", "gw\_id\_avp", '$avp(gw\_id)')
modparam("drouting", "gw\_id\_avp", '$avp(334)')
...
	

  

### 1.3.8.�`gw_priprefix_avp` (str)

The name of the avp for storing the PRI prefix of the current selected destination/gateway - once a new destination is selected (via the use\_next\_gw() function), the AVP will be updated with the PRI prefix of the new used destination.

_Default value is “NULL”._

**Example�1.8.�Set `gw_priprefix_avp` parameter**

...
modparam("drouting", "gw\_priprefix\_avp", '$avp(gw\_priprefix)')
...
	

  

### 1.3.9.�`rule_id_avp` (str)

The name of the avp for storing the id of the current matched routing rule (see dr\_rules table).

_Default value is “NULL”._

**Example�1.9.�Set `rule_id_avp` parameter**

...
modparam("drouting", "rule\_id\_avp", '$avp(rule\_id)')
modparam("drouting", "rule\_id\_avp", '$avp(335)')
...
	

  

### 1.3.10.�`rule_prefix_avp` (str)

The actual prefix that matched the routing rule (the part from RURI username that matched the routing rule).

_Default value is “NULL”._

**Example�1.10.�Set `rule_prefix_avp` parameter**

...
modparam("drouting", "rule\_prefix\_avp", '$avp(dr\_prefix)')
...
	

  

### 1.3.11.�`carrier_id_avp` (str)

AVP to be populate with the ID string for the carrier the current GW belongs to.

_Default value is “NULL”._

**Example�1.11.�Set `carrier_id_avp` parameter**

...
modparam("drouting", "carrier\_id\_avp", '$avp(carrier\_id)')
...
	

  

### 1.3.12.�`gw_sock_avp` (str)

The name of the avp for storing sockets for alternative destinations defined by ruri\_avp.

_Default value is “$avp(\_\_\_dr\_sock\_\_)” if `use_partitions` parameter is 0 or “$avp(\_\_\_dr\_sock\_\_partition\_name)” where partition\_name is the name of the partition containing the AVP (as fetched from the database) if `use_partitions` parameter is 1._

**Example�1.12.�Set `gw_sock_avp` parameter**

...
modparam("drouting", "gw\_sock\_avp", '$avp(dr\_sock)')
modparam("drouting", "gw\_sock\_avp", '$avp(77)')
...
	

  

### 1.3.13.�`define_blacklist` (str)

Defines a blacklist based on a list of GW types - the blacklist will be populated with the IPs (no port, all protocols) of the GWs having the specified types.

If partitions are used, prefix the blacklist definition string with the name of the partition followed by ":" separator.

Multiple instances of this param are allowed.

_Default value is “NULL”._

**Example�1.13.�Set `define_blacklist` parameter**

...
modparam("drouting", "define\_blacklist", 'bl\_name= 3,5,25,23')
modparam("drouting", "define\_blacklist", 'list= 4,2')
modparam("drouting", "define\_blacklist", 'pstn:list2 = 5,6')
modparam("drouting", "define\_blacklist", 'pstn:list3 = 7,8')
...
	

  

### 1.3.14.�`default_group` (int)

Group to be used if the caller (FROM user) is not found in the GROUP table.

_Default value is “NONE”._

**Example�1.14.�Set `default_group` parameter**

...
modparam("drouting", "default\_group", 4)
...

  

### 1.3.15.�`force_dns` (int)

Force DNS resolving of GW/destination names (if not IPs) during startup. If not enabled, the GW name will be blindly used during routing.

_Default value is “1 (enabled)”._

**Example�1.15.�Set `force_dns` parameter**

...
modparam("drouting", "force\_dns", 0)
...
	

  

### 1.3.16.�`persistent_state` (int)

Specifies whether the _state_ column should be loaded at startup and flushed during runtime or not.

_Default value is “1” (enabled)._

**Example�1.16.�Set the `persistent_state` parameter**

...
# disable all DB operations with the state of a gateway
modparam("drouting", "persistent\_state", 0)
...

  

### 1.3.17.�`no_concurrent_reload` (int)

If enabled, the module will not allow do run multiple dr\_reload MI commands in parallel (with overlapping) Any new reload will be rejected (and discarded) while an existing reload is in progress.

If you have a large routing set (millions of rules/prefixes), you should consider disabling concurrent reload as they will exhaust the shared memory (by reloading into memory, in the same time, multiple instances of routing data).

_Default value is “0 (disabled)”._

**Example�1.17.�Set `no_concurrent_reload` parameter**

...
# do not allow parallel reload operations
modparam("drouting", "no\_concurrent\_reload", 1)
...

  

### 1.3.18.�`probing_interval` (integer)

How often (in seconds) the probing of a destination should be done. If set to 0, the probing will be disabled as functionality (for all destinations)

_Default value is “30”._

**Example�1.18.�Set `probing_interval` parameter**

...
modparam("drouting", "probing\_interval", 60)
...

  

### 1.3.19.�`probing_method` (string)

The SIP method to be used for the probing requests.

_Default value is “"OPTIONS"”._

**Example�1.19.�Set `probing_method` parameter**

...
modparam("drouting", "probing\_method", "INFO")
...

  

### 1.3.20.�`probing_from` (string)

The FROM SIP URI to be advertised in the SIP probing requests.

_Default value is “"sip:prober@localhost"”._

**Example�1.20.�Set `probing_from` parameter**

...
modparam("drouting", "probing\_from", "sip:pinger@192.168.2.10")
...

  

### 1.3.21.�`probing_reply_codes` (string)

A comma separted list of SIP reply codes. The codes defined here will be considered as valid reply codes for probing messages, apart for 200.

_Default value is “NULL”._

**Example�1.21.�Set `probing_reply_codes` parameter**

...
modparam("drouting", "probing\_reply\_codes", "501, 403")
...

  

### 1.3.22.�`probing_socket` (string)

A socket description \[proto:\]host\[:port\] of the local socket (which is used by OpenSIPS for SIP traffic) to be used (if multiple) for sending the probing messages from.

For probing gateway the highest priority has socket from gateway configuration in dr\_gateways table. Then socket from global `probing_socket` parameter and the lowest priority is default behaviour with auto selected socket wich OpenSIPS listens on.

_Default value is “NULL”._

**Example�1.22.�Set `probing_socket` parameter**

...
modparam("drouting", "probing\_socket", "udp:192.168.1.100:5060")
...

  

### 1.3.23.�`gw_socket_filter_mode` (string)

This parameter controls the gateway filtering during DB loading, or which gateways are loaded or not into memory depending on the configured socket they have.

The supported filtering modes are:

*   **"all"** - all the gateways defined in DB are loaded into memory, disregarding what socket value they have. NOTE: for the gw sockets not matching any OpenSIPS listeners/sockets, the GW will be loaded with NULL/no socket.
    
*   **"ignore"** - all the gateways defined in DB are loaded into memory, but ignoring the socket value they have (the socket will be set to NULL/NONE with no attempt to check it against the OpenSIPS listeners/sockets).
    
*   **"matched-only"** - in this mode the module will load from DB only the gateways that have a configured a socket matching any of the the OpenSIPS listeners/sockets. If the gateways socket does not match, it will be discards, not loaded into memory at all.
    

_Default value is “"all"”._

**Example�1.23.�Set `gw_socket_filter_mode` parameter**

...
# multiple OpenSIPS instances sharing a DR setting, so each should
# load only the GWs they have sockets for.
modparam("drouting", "gw\_socket\_filter\_mode", "matched-only")
...
# an OpenSIPs instance not doing routing, but needing to be
# aware of all the gws, so load them all ignoring the sockets
modparam("drouting", "gw\_socket\_filter\_mode", "ignore")
...

  

### 1.3.24.�`cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used in drouting module for two purposes: for sharing the status of the gateways/carriers and for controlling the pinging to gateways.

If clustering enbled, the module will automatically share changes over the status of the gateways/destinations/carriers with the other OpenSIPS instances that are part of a cluster. Whenever such a status changes (following an MI command, a probing result, a script command), the module will replicate this status change to all the nodes in this given cluster.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to gateways. See the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.3.25.�cluster_sharing_tag (string)") option.

This OpenSIPS cluster exposes the **"drouting-status-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the [clusterer](clusterer) module.

_Default value is “0 (none)”._

**Example�1.24.�Set `cluster_id` parameter**

...
# replicate gw/carrier status with all OpenSIPS in cluster ID 9
modparam("drouting", "cluster\_id", 9)
...

  

### 1.3.25.�`cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform the self-triggered actions in the module. Such actions may be the gateway probing (see also the [cluster\_probing\_mode](#param_cluster_probing_mode "1.3.26.�cluster_probing_mode (string)") parameter) or sharing the gateway/carrier status changes. If defined, only the node with active status of this tag will perform the actions (pinging and sharing status).

The [cluster\_id](#param_cluster_id "1.3.24.�cluster_id (integer)") must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will share the status changes.

_Default value is “empty (none)”._

**Example�1.25.�Set `cluster_sharing_tag` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("drouting", "cluster\_id", 9)
modparam("drouting", "cluster\_sharing\_tag", "vip")
...

  

### 1.3.26.�`cluster_probing_mode` (string)

This paramter controls how the probing/pinging should be done when using the clustering support. It is about which node in the cluster pings which gateway/destination.

The [cluster\_id](#param_cluster_id "1.3.24.�cluster_id (integer)") must be defined for this option to work.

The supported probing modes are:

*   **"all"** - all the nodes in the cluster will independetly ping all the defined gateways, an "all" pings "all" mode.
    
*   **"by-shtag"** - all the gateways are pinged by only one node in the cluster, the node having the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.3.25.�cluster_sharing_tag (string)") active. By activating the sharing tag on a different node, the pinging duty will be transfered to another node in the cluster.
    
*   **"distributed"** - the pinging effort is distributed across all the nodes in the cluster, so each node will ping a sub-set of the overall set of gateway. Still all the gateways will get pinged (and only once per pinging cycle). The re-partitioning of the pinging effort over the available nodes in the cluster is automatically done when new nodes are joining or nodes are dropping out. Still there is no guaratee on which node will be responsible for pinging which gateway.
    

_Default value is “"all"”._

**Example�1.26.�Set `cluster_probing_mode` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
modparam("drouting", "cluster\_id", 9)
modparam("drouting", "cluster\_sharing\_tag", "vip")
modparam("drouting", "cluster\_probing\_mode", "by-shtag")
...
# the pinging effort is distributed across all the nodes
modparam("drouting", "cluster\_id", 9)
modparam("drouting", "cluster\_probing\_mode", "distributed")
...

  

### 1.3.27.�`use_domain` (int)

Flag to configure whether to use domain match when querying database for user's routing group.

_Default value is “1”._

**Example�1.27.�Set `use_domain` parameter**

...
modparam("drouting", "use\_domain", 0)
...

  

### 1.3.28.�`drg_user_col` (str)

The name of the column in group db table where the username is stored.

_Default value is “username”._

**Example�1.28.�Set `drg_user_col` parameter**

...
modparam("drouting", "drg\_user\_col", "user")
...

  

### 1.3.29.�`drg_domain_col` (str)

The name of the column in group db table where the domain is stored.

_Default value is “domain”._

**Example�1.29.�Set `drg_domain_col` parameter**

...
modparam("drouting", "drg\_domain\_col", "host")
...

  

### 1.3.30.�`drg_grpid_col` (str)

The name of the column in group db table where the group id is stored.

_Default value is “groupid”._

**Example�1.30.�Set `drg_grpid_col` parameter**

...
modparam("drouting", "drg\_grpid\_col", "grpid")
...

  

### 1.3.31.�`use_partitions` (int)

Flag to configure whether to use partitions for routing. If this flag is set then the `db_partitions_url` and `db_partitions_table` variables become mandatory.

_Default value is “0”._

**Example�1.31.�Set `use_partitions` parameter**

...
modparam("drouting", "use\_partitions", 1)
...

  

### 1.3.32.�`db_partitions_url` (str)

The url to the database containing partition-specific information. (partition-specific information includes partition name, url to the database where information about the partition is preserved, the names of the tables in which it is preserved and the AVPs that can be accessed using the .cfg script). The `use_partitions` parameter must be set to 1.

_Default value is “"NULL"”._

**Example�1.32.�Set `db_partitions_url` parameter**

...
modparam("drouting", "db\_partitions\_url", "mysql://user:password@localhost/opensips\_partitions")
...

  

### 1.3.33.�`db_partitions_table` (str)

The name of the table containing partition definitions. To be used with `use_partitions` and `db_partitions_url`.

_Default value is “dr\_partitions”._

**Example�1.33.�Set `db_partitions_table` parameter**

...
modparam("drouting", "db\_partitions\_table", "partition\_defs")
...

  

### 1.3.34.�`partition_id_pvar` (pvar)

Variable which will store the name of the name partition when _wildcard(\*)_ operatior is used. _Use\_partitions_ must be set in order to use this parameter.

NOTE: The variable must be WRITABLE!

_Default value is “null(not used)”._

**Example�1.34.�Set `partition_id_pvar` parameter**

...
modparam("drouting", "partition\_id\_pvar", "$var(matched\_partition)")
...

  

### 1.3.35.�`enable_restart_persistency` (int)

Parameter set to enable restart persistency for the Dynamic Routing module. When this parameter is set, the drouting module no longer loads the data from the database after restart, but uses the persistent storage file, and loads data from it “on demand”, improving the startup performance.

NOTE: If the restart persistent cache is not populated from a previous run, then the data will be loaded from database at startup!

NOTE: A reload will update the cached data.

_Default value is “0 (disabled)”._

**Example�1.35.�Set `enable_restart_persistency` parameter**

...
modparam("drouting", "enable\_restart\_persistency", yes)
...

  

### 1.3.36.�`extra_prefix_chars` (str)

List of ASCII (0-127) characters to be additionally accepted in the prefixes. By default only '0' - '9' chars (digits) are accepted.

_Default value is “NULL”._

**Example�1.36.�Set `extra_prefix_chars` parameter**

...
modparam("drouting", "extra\_prefix\_chars", "#-%")
...

  

### 1.3.37.�`extra_id_chars` (str)

A set of extra characters to be allowed in both Gateway and Carrier unique string identifiers, on top of alphanumeric characters.

_Default value is “\_-.”._

**Example�1.37.�Set `extra_id_chars` parameter**

...
modparam("drouting", "extra\_id\_chars", ":\_-.")
...

  

### 1.3.38.�`rule_tables_query` (str)

This parameter offers a dynamic, SQL-based way of building a set of _dr\_rules_\-compatible table names, to be each loaded and then merged into a single "dr\_rules" table, for any given partition.

The syntax of the parameter is: "**token** : **query**", where **token** is a special name given to a "dr\_rules" table, so OpenSIPS can match it against the custom queries defined using this parameter.

This parameter may be set multiple times (each definition creates a new mapping).

**Example�1.38.�Set the `rule_tables_query` parameter**

...
# first, set the "dr\_rules" table name to the name of your query
modparam("drouting", "drr\_table", "MY\_RULES\_QUERY")

# next, instruct drouting to load both 'dr\_rules\_a' and 'dr\_rules\_b',
# then merge all of their rules
modparam("drouting", "rule\_tables\_query", "
	MY\_RULES\_QUERY:
		SELECT 'dr\_rules\_a' UNION SELECT 'dr\_rules\_b'")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `do_routing([groupID], [flags], [gw_whitelist], [rule_attrs_pvar], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function to trigger routing of the message according to the rules in the database table and the configured parameters.

This function can be used from all routes.

If you set `use_partitions` to 1 the **partition** last parameter becomes mandatory.

All parameters are optional. Any of them may be ignored, provided the necessary separation marks "," are properly placed.

*   **groupID** (int, optional) - number to specify the group of the caller for routing purposes. If none specified the function will automatically try to query the dr\_group table to get this
    
*   **flags** (string, optional) - a list of letter-like flags for controlling the routing behavior. Possible flags are:
    
    *   **F** - Enable rule fallback; normally the engine is using a single rule for routing a call; by setting this flag, the engine will fallback and use rules with less priority or shorter prefix when all the destination from the current rules failed.
        
    *   **L** - Do strict length matching over the prefix - actually DR engine will do full number matching and not prefix matching anymore.
        
    *   **C** - Only check if the dialed number matches any routing rule, without loading / applying any routing info (no GW is set, the RURI is not altered)
        
    
*   **gw\_whitelist** (string, optional) - a comma separated white list of gateways. This will force routing over, at most, this list of carriers or gateways (in other words, the whitelist will be intersected with the results of the search through the rules).
    
*   **rule\_attrs\_pvar** (var, optional) - a writable variable which will be populated with the attributes of the matched dynamic routing rule.
    
*   **gw\_attrs\_pvar** (var, optional) - a writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - a a writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Besides specifing the name of one partition, you can use the "\*" wildcard sign to force routing over all partitions.
    

**Example�1.39.�`do_routing` usage**

...
# all groups, sort on order, `use_partitions` is 0
do\_routing();
...
# all groups, sort on order, `use_partitions` is 1, route by partition named "part"
do\_routing( , , , , , ,"part");
...
# group id 0, sort on order, `use_partitions` is 0
do\_routing(0);
...
# group id 0, sort on order, `use_partitions` is 1, route by partition named "part"
do\_routing(0, , , , , , "part");
...
# group id from $var(id), sort on order, `use_partitions` is 0
do\_routing($var(id));
...
# all groups, sort on weights, `use_partitions` is 0
do\_routing(, "W");
...
# `use_partitions` is 1, partition and group supplied by AVPs, do strict length matching
do\_routing( $avp(grp),"L", , , , ,$avp(partition))
...
# group id 2, sort on order, fallback rule and also return the gateway attributes
do\_routing(2, "F", , , $var(gw\_attributes));
...

  

### 1.4.2.� `route_to_carrier( carriers, [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function to trigger the direct routing to a given set carriers (one or more). So, the routing is not done prefix based, but carrier based (call will be sent to the GWs of that carrier, based on carrier policy).

This function can be used from all routes.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter also (where the carrier are to be found).

*   **carriers** (string) - comma separated carrier IDs (names)
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the currently matched gateway of this carrier.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of this carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is not accepted by the function.
    

**Example�1.40.�`route_to_carrier` usage**

...
# use\_partitions is not set
if ( route\_to\_carrier("my\_top\_carrier, def\_carrier", , $var(carrier\_att)) ) {
	xlog("Routing to \\"my\_top\_carrier\\" - $var(carrier\_att)\\n");
	t\_on\_failure("next\_gw");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_carrier("my\_top\_carrier", , $var(carrier\_att), "part") ) {
	xlog("Routing to \\"my\_top\_carrier\\" - $var(carrier\_att)\\n");
	t\_on\_failure("next\_gw");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_carrier($var(carrierId), , , $var(my\_partition)) ) {
	xlog("Routing to \\"my\_top\_carrier\\"\\n");
	t\_on\_failure("next\_gw");
	t\_relay();
	exit;
}
...

  

### 1.4.3.� `route_to_gw(gw_id, [gw_attrs_var], [carrier_attrs_var], [partition])`

Function to trigger the direct routing to a given gateway (or list of gateways). Attributes and per-gw processing will be available.

This function can be used from all routes.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

*   **gw\_id** (string) - comma separated list of gateway IDs to be used.
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the currently matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of this carrier. NOTE: the first carrier pointing to the GW(s) will be considered!
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is not accepted by the function.
    

**Example�1.41.�`route_to_gw` usage**

...
# use\_partitions is not set
if ( route\_to\_gw("gw\_europe") ) {
	t\_relay();
	exit;
}
...
# use\_partitions is not set
if ( route\_to\_gw("gw1,gw2,gw3", $var(gw\_attrs)) ) {
	xlog("Relaying to first gateway from our list - $var(gw\_attrs)\\n");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_gw("gw\_europe", , , "my\_partition") ) {
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if ( route\_to\_gw("gw1,gw2,gw3", $var(gw\_attrs), , "my\_partition") ) {
	xlog("Relaying to first gateway from our list - $var(gw\_attrs)\\n");
	t\_relay();
	exit;
}
...

  

### 1.4.4.� `use_next_gw( [rule_attrs_pvar], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function takes the next available destination (set by do\_routing, as alternative destinations) and pushes it into the RURI. Note that the function just sets the RURI (nothing more).

If a new RURI is set, the used destination is removed from the pending set of alternative destinations.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

The function returns true only if a new RURI was set. False is returned is no other alternative destinations are found or in case of an internal processing error. It may take the following optional parameters:

*   **rule\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched dynamic routing rule.
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (optinal, string) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is not accepted by the function.
    

**Example�1.42.�`use_next_gw` usage**

...
# use\_partitions is not set
if (use\_next\_gw()) {
	t\_relay();
	exit;
}
...
# Also fetch the carrier attributes, if any
if (use\_next\_gw(, , $var(carrier\_attrs))) {
	xlog("Carrier attributes of current gateway: $var(carrier\_attrs)\\n");
	t\_relay();
	exit;
}
...
# use\_partitions is enabled
if (use\_next\_gw( , , ,"my\_partition")) {
	t\_relay();
	exit;
}
...
# Also fetch the carrier attributes, if any
if (use\_next\_gw( , ,$var(carrier\_attrs), "my\_partition")) {
	xlog("Carrier attributes of current gateway: $var(carrier\_attrs)\\n");
	t\_relay();
	exit;
}
...

  

### 1.4.5.� `goes_to_gw( [type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function returns true if the destination of the current request (destination URI or Request URI) points (as IP) to one of the gateways. There no DNS lookups done if the domain part of the URI is not an IP.

This function does not change anything in the message.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following optional parameters:

*   **type** (int, optional) - number for the GW/destination type to be checked; when omitting this parameter or specifying the special value _\-1_, matching will be done against all types.
    
*   **flags** (string, optional) - letter like flags for controlling what operations should be performed when a GW matches:
    
    *   **'s'** (Strip) - apply to the username of RURI the strip defined by the GW
        
    *   **'p'** (Prefix) - apply to the username of RURI the prefix defined by the GW
        
    *   **'i'** (Gateway ID) - return the gateway id into gw\_id\_avp AVP
        
    *   **'n'** (Ignore port) - ignores port number during matching
        
    *   **'c'** (Carrier ID) - return the carrier id into carrier\_id\_avp AVP
        
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.43.�`goes_to_gw` usage**

...
# use\_partitions is not set
if (goes\_to\_gw( 1, , $var(gw\_attrs))) {
	sl\_send\_reply(403,"Forbidden");
	exit;
}
...
# use\_partitions is enabledt
if (goes\_to\_gw(1, , $var(gw\_attrs), , "my\_partition")) {
	sl\_send\_reply(403,"Forbidden");
	exit;
}
...

  

### 1.4.6.� `is_from_gw([type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function checks if the sender of the message (source IP + source port) is a gateway from a certain group.

This function does not change anything in the message.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and ONREPLY\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following optional parameters:

*   **type** (int, optional) - number for the GW/destination type to be checked; when omitting this parameter or specifying the special value _\-1_, matching will be done against all types.
    
*   **flags** (string, optional) - letter like flags for controlling what operations should be performed when a GW matches:
    
    *   **'s'** (Strip) - apply to the username of RURI the strip defined by the GW
        
    *   **'p'** (Prefix) - apply to the username of RURI the prefix defined by the GW
        
    *   **'i'** (Gateway ID) - return the gateway id into gw\_id\_avp AVP
        
    *   **'n'** (Ignore port) - ignores port number during matching
        
    *   **'r'** (Check protocol) - check protocol
        
    *   **'c'** (Carrier ID) - return the carrier id into carrier\_id\_avp AVP
        
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.44.�`is_from_gw` usage**

\# use\_partitions is not set
# match the source IP (only) against all gateways
if (is\_from\_gw(-1, "n")) {
	...
}

# use\_partitions is enabled
# match the source IP and port against all gateways from the "outbound"
# partition and return the matched gateway's carrier
if (is\_from\_gw(, "c", , , "outbound")) {
	...
}

  

### 1.4.7.� `dr_is_gw( sip_uri, [type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function checks if the SIP URI hostname part stored inside the "src\_pv" pseudo-variable is a gateway from a certain group.

This function does not change anything in the message.

This function can be used from all routes.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following optional parameters:

*   **sip\_uri** (string) - SIP URI. If the URI hostname part is a FQDN, it will be resolved prior to matching.
    
*   **type** (int, optional) - number for the GW/destination type to be checked; when omitting this parameter or specifying the special value _\-1_, matching will be done against all types.
    
*   **flags** (string, optional) - letter like flags for controlling what operations should be performed when a GW matches:
    
    *   **'s'** (Strip) - apply to the username of RURI the strip defined by the GW
        
    *   **'p'** (Prefix) - apply to the username of RURI the prefix defined by the GW
        
    *   **'i'** (Gateway ID) - return the gateway id into gw\_id\_avp AVP
        
    *   **'n'** (Ignore port) - ignores port number during matching
        
    *   **'c'** (Carrier ID) - return the carrier id into carrier\_id\_avp AVP
        
    
*   **gw\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched gateway.
    
*   **carrier\_attrs\_pvar** (var, optional) - an output writable variable which will be populated with the attributes of the matched carrier.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.45.�`dr_is_gw` usage**

\# match the SIP URI host within $var(uac) against all gateways
if (dr\_is\_gw( $var(uac), , "n")) {
	...
}


# match the SIP URI host within $var(uac) against
# all gws in "outbound" partition
if (dr\_is\_gw( $avp(uac), , "n", , , "partition")) {
	...
}

  

### 1.4.8.� `dr_disable([partition])`

Marks as disabled the last destination that was used for the current call. The disabling done via this function will prevent the destination to be used for usage from now on. The probing mechanism can re-enable this peer (see the probing section in the beginning)

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` parameter to 1 you must supply the "partition" parameter to instruct on the partition where the gateway has been defined.

It may take the following parameters:

*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on. Wildcard sign is accepted by this function.
    

**Example�1.46.�`dr_disable()` usage**

...
if (t\_check\_status("(408)|(5\[0-9\]\[0-9\])")) {
	dr\_disable();

}
...
if (t\_check\_status("(408)|(5\[0-9\]\[0-9\])")) {
	dr\_disable("my\_partition");

}
...

  

### 1.4.9.� `dr_match(groupID, [flags], number, [rule_attrs_pvar], [partition])`

The function tries to match/check the given number against the rules from the database.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE and LOCAL\_ROUTE.

If you set `use_partitions` to 1 the **partition** last parameter becomes mandatory.

The parameters are:

*   **groupID** (int) - number to specify the dr group (set of rules) to perform the check against
    
*   **flags** (string, optional) - a list of letter-like flags for controlling the checking/matching behavior. Possible flags are:
    
    *   **L** - Do strict length matching over the prefix - actually DR engine will do full number matching and not prefix matching anymore.
        
    
*   **number** (string) - the number to check
    
*   **rule\_attrs\_pvar** (var, optional) - a writable variable which will be populated with the attributes of the matched dynamic routing rule.
    
*   **partition** (string, optional) - the name of the DR partition to be used. This parameter is to be defined ONLY if the "use\_partition" module parameter is turned on.
    

**Example�1.47.�`dr_match` usage**

...
if ( dr\_match( 1, "L" , $fU, ,"dids") )
	xlog("Full From Username $fU found in group 1 partition DIDS\\n");
...
if ( dr\_match( 1, , $var(did) ) )
	xlog("DID $var(did) matches rules in group 1\\n");
...

  

## 1.5.�Exported MI Functions

### 1.5.1.� `dr_reload`

Command to reload routing rules from database.

*   if `use_partition` is set to 0 - all routing rules will be reloaded.
    
    *   _inherit\_state_ (optional) : whether inherit old state of the gateway , default is y.
        
        *   “n”: no inherit state
            
        *   “y”: inherit state
            
        
    
*   if `use_partition` is set to 1, the parameters are:
    
    *   _partition\_name_ (optional) - if not provided all the partitions will be reloaded, otherwise just the partition given as parameter will be reloaded.
        
    
    <listitem>
    
    _inherit\_state_ (optional) : whether inherit old state of the gateway , default is y.
    
    *   “n”: no inherit state
        
    *   “y”: inherit state
        
    
    </listitem>
    

MI FIFO Command Format:

		opensips-cli -x mi dr\_reload part\_1
		

### 1.5.2.�`dr_gw_status`

Gets the status (enabled or disabled) of one or multiple gateways. The function can also be used to set the status of a single gateway.

*   if `use_partitions` is set to 0, the parameters are:
    
    *   _gw\_id_ (optional) - the id of a gateway. If provided, the function will return/set (depnding if the second parameter is given) the status of that gateway, otherwise it will list all gateways along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a GW (0 - disable, 1 - enable). Only makes sense if _gw\_id_ is provided.
        
    
*   if `use_partitions` is set to 1, the parameters are:
    
    *   _partition\_name_
        
    *   _gw\_id_ (optional) - the id of a gateway. If provided, the function will return/set (depnding if the third parameter is given) the status of that gateway, otherwise it will list all gateways in the given partition along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a GW (0 - disable, 1 - enable). Only makes sense if _gw\_id_ is provided.
        
    

**Example�1.48.�`dr_gw_status` usage when `use_partitions` is set to 0**

$ opensips-cli -x mi dr\_gw\_status gw\_id=2
State:: Active
$ opensips-cli -x mi dr\_gw\_status gw\_id=2 status=0
$ opensips-cli -x mi dr\_gw\_status gw\_id=2
Enabled:: Disabled MI
$ opensips-cli -x mi dr\_gw\_status gw\_id=3
Enabled:: Inactive

  

**Example�1.49.�`dr_gw_status` usage when `use_partitions`is set to 1**

$ opensips-cli -x mi dr\_gw\_status partition\_name=part\_1 gw\_id=my\_gw
State:: Active
$ opensips-cli -x mi dr\_gw\_status partition\_name=part\_1 gw\_id=my\_gw status=0
$ opensips-cli -x mi dr\_gw\_status partition\_name=part\_1 gw\_id=my\_gw
enabled:: disabled mi
$ opensips-cli -x mi dr\_gw\_status partition\_name=partition8 status=3
enabled:: inactive

  

### 1.5.3.�`dr_carrier_status`

Gets the status (enabled or disabled) of one or multiple carriers. The function can also be used to set the status of a single carrier.

*   if `use_partitions` is set to 0, the parameters are:
    
    *   _carrier\_id_ (optional) - the id of a carrier. If provided, the function will return/set (depnding if the second parameter is given) the status of that carrier, otherwise it will list all carriers along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a carrier (0 - disable, 1 - enable). Only makes sense if _carrier\_id_ is provided.
        
    
*   if `use_partitions` is set to 1, the parameters are:
    
    *   _partition\_name_
        
    *   _carrier\_id_ (optional) - the id of a carrier. If provided, the function will return/set (depnding if the third parameter is given) the status of that carrier, otherwise it will list all carriers contained in the given partition along with their statuses.
        
    *   _status_ (optional) - the new status to be forced for a carrier (0 - disable, 1 - enable). Only makes sense if _carrier\_id_ is provided.
        
    

**Example�1.50.�`dr_carrier_status` usage when `use_partitions` is 0**

$ opensips-cli -x mi dr\_carrier\_status carrier\_id=CR1
Enabled:: no
$ opensips-cli -x mi dr\_carrier\_status carrier\_id=CR1 status=1
$ opensips-cli -x mi dr\_carrier\_status carrier\_id=CR1
Enabled:: yes

  

**Example�1.51.�`dr_carrier_status` usage when `use_partitions` is 1**

$ opensips-cli -x mi dr\_carrier\_status partition\_name=my\_partition carrier\_id=CR1
Enabled:: no
$ opensips-cli -x mi dr\_carrier\_status partition\_name=partition\_1 carrier\_id=CR1 status=1
$ opensips-cli -x mi dr\_carrier\_status partition\_name=partition\_3 carrier\_id=CR1
Enabled:: yes

  

### 1.5.4.�`dr_reload_status`

Gets the time of the last reload for any partition.

*   if `use_partition` is set to 0 - the function doesn't receive any parameter. It will list the date of the last reload for the default (and only) partition.
    
*   if `use_partition` is set to 1, the parameters are:
    
    *   _partition\_name_ (optional) - if not provided the function will list the time of the last update for every partition. Otherwise, the function will list the time of the last reload for the given partition.
        
    

**Example�1.52.�`dr_reload_status` usage when `use_partitions` is 0**

$ opensips-cli -x mi dr\_reload\_status
Date:: Tue Aug 12 12:26:00 2014

  

**Example�1.53.�`dr_reload_status` usage when `use_partitions` is 1**

$ opensips-cli -x mi dr\_reload\_status
Partition:: part\_test Date=Tue Aug 12 12:24:13 2014
Partition:: part\_2 Date=Tue Aug 12 12:24:13 2014
$ opensips-cli -x mi dr\_reload\_status part\_test
Partition:: part\_test Date=Tue Aug 12 12:24:13 2014

  

### 1.5.5.�`dr_number_routing`

Gets the matched prefix along with the list of the gateways / carriers to which a number would be routed when using the do\_routing function.

*   if `use_partition` is set to 1 the function will have 3 parameters:
    
    *   _partition\_name_
        
    *   _group\_id_ (optional) - the group id of the rules to check against
        
    *   _number_ - the number to test against
        
    
*   if `use_partition` is set to 0 the function will have 2 parameters:
    
    *   _group\_id_ (optional) - the group id of the rules to check against
        
    *   _number_ - the number to test against
        
    

MI FIFO Command Format:

		opensips-cli -x mi dr\_number\_routing partition\_name=part1 group\_id=3 number=012340987
		

### 1.5.6.� `dr_enable_probing`

Enables/disables gateway probing or returns the current gateway probing status.

Parameters:

*   _status_ (optional) - 1 - enable, 0 - disable gateway probing
    

**Example�1.54.�`dr_enable_probing` usage**

$ opensips-cli -x mi dr\_enable\_probing
Status:: 1
$ opensips-cli -x mi dr\_enable\_probing 0
$ opensips-cli -x mi dr\_enable\_probing
Status:: 0
		

  

## 1.6.�Exported Events

### 1.6.1.� `E_DROUTING_STATUS`

This event is raised when the module changes the state of a gateway, either through an MI command, probing or script function.

Parameters:

*   _partition_ - the name of the partition.
    
*   _gwid_ - the gateway identifier.
    
*   _address_ - the address of the gateway.
    
*   _status_ - _disabled MI_ if the gateway was disabled using MI commands, _probing_ if the gateway is being pinged, _inactive_ if it was disabled from the script or _active_ if the gateway is enabled.
    

## 1.7.�Exported Status/Report Identifiers

The module provides the "drouting" Status/Report group, where each routing partition is defined as a separate SR identifier.

### 1.7.1.�`[partition_name]`

The status of these identifiers reflects the readiness/status of the cached data (if available or not when being loaded from DB):

*   _\-2_ - no data at all (initial status)
    
*   _\-1_ - no data, initial loading in progress
    
*   _1_ - data loaded, partition ready
    
*   _2_ - data available, a reload in progress
    

Reload reporting:

In terms of data reloading, the following logs will be reported:

*   starting DB data loading
    
*   DB data loading failed, discarding
    
*   DB data loading successfully completed
    
*   N gateways loaded (N discarded), N carriers loaded (N discarded), N rules loaded (N discarded)
    

    {
        "Name": "Default",
        "Reports": \[
            {
                "Timestamp": 1652353940,
                "Date": "Thu May 12 14:12:20 2022",
                "Log": "starting DB data loading"
            },
            {
                "Timestamp": 1652353940,
                "Date": "Thu May 12 14:12:20 2022",
                "Log": "DB data loading successfully completed"
            },
            {
                "Timestamp": 1652353940,
                "Date": "Thu May 12 14:12:20 2022",
                "Log": "2 gateways loaded (0 discarded), 2 carriers loaded (0 discarded), 1 rules loaded (0 discarded)"
            }
        \]
    }
	

### 1.7.2.�`[partition_name];events`

GW/Carrier switching reporting:

For reporting events related to the state changes of the gateways and carriers, the module provides separate identifiers (still one per partition). Why separate ones? The reports on state changing may be verbose and there is the risk of loose/discard important reports on reloads due to the high number of logs on state changes;

So, each partition will provide the identified "partition\_name;events" for reporting state changes of gateways and carriers, along with the reason of the change. This identifiers have a 200 records history before discarding the old ones.

    {
        "Name": "Default;events",
        "Reports": \[
            {
                "Timestamp": 1652353976,
                "Date": "Thu May 12 14:12:56 2022",
                "Log": "GW <gw1\_1>/127.0.1.1 switched to \[inactive\] due probing reply\\n"
            },
            {
                "Timestamp": 1652353976,
                "Date": "Thu May 12 14:12:56 2022",
                "Log": "GW <gw2\_1>/127.0.1.2 switched to \[inactive\] due probing reply\\n"
            }
        \]
    }
	

For how to access and use the Status/Report information, please see [https://www.opensips.org/Documentation/Interface-StatusReport-3-3](>https://www.opensips.org/Documentation/Interface-StatusReport-3-3).

## 1.8.�Installation

The module requires 4 tables in the OpenSIPS database: dr\_groups, dr\_gateways, dr\_carriers, dr\_rules. The SQL syntax to create them can be found in the drouting-create.sql script, located in the database directories of the opensips/scripts folder. You can also find the complete database documentation on the project webpage, [https://opensips.org/docs/db/db-schema-devel.html](https://opensips.org/docs/db/db-schema-devel.html).

## Chapter�2.�Developer Guide

The module provides no function to be used by other OpenSIPS modules.

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

411

202

13810

5824

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

160

96

2513

2613

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

100

53

1171

2226

4.

Mihai Tiganus ([@tallicamike](https://github.com/tallicamike))

71

20

4301

910

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

41

20

1100

735

6.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

23

20

244

47

7.

Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu))

20

12

551

134

8.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

15

11

132

70

9.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

15

9

370

108

10.

Andrei Dragus

10

3

657

40

  

**All remaining contributors**: Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Anca Vamanu, Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Jeremy Martinez ([@JeremyMartinez51](https://github.com/JeremyMartinez51)), wangdd, nexbridge, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), MayamaTakeshi, Matt Lehner, Juli�n Moreno Pati�o, Sergio Gutierrez, Le Roy Christophe, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Ozzyboshi, Aron Podrigal ([@ar45](https://github.com/ar45)).

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Oct 2008 - Nov 2024

2.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Sep 2010 - Oct 2023

3.

wangdd

May 2023 - May 2023

4.

MayamaTakeshi

Apr 2023 - Apr 2023

5.

nexbridge

Feb 2023 - Mar 2023

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Feb 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Mar 2017 - Jul 2022

8.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

Mar 2013 - May 2021

9.

Walter Doekes ([@wdoekes](https://github.com/wdoekes))

May 2014 - Apr 2021

10.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Nov 2012 - Apr 2021

  

**All remaining contributors**: Aron Podrigal ([@ar45](https://github.com/ar45)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Jeremy Martinez ([@JeremyMartinez51](https://github.com/JeremyMartinez51)), Le Roy Christophe, Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Ozzyboshi, Juli�n Moreno Pati�o, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Mihai Tiganus ([@tallicamike](https://github.com/tallicamike)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Matt Lehner, Anca Vamanu, Andrei Dragus, Sergio Gutierrez.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), wangdd, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Mihai Tiganus ([@tallicamike](https://github.com/tallicamike)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Matt Lehner, Anca Vamanu, Andrei Dragus, Sergio Gutierrez.

_Documentation Copyrights:_

Copyright � 2009-2012 [www.opensips-solutions.com](http://www.opensips-solutions.com/)

Copyright � 2005-2008 Voice Sistem SRL