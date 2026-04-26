# drouting Module Reference
<!-- generated-from: data/4.0/modules/drouting.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 drouting module. Read this file when configuring or debugging the drouting module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

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
    
The dynamic routing implementation for OpenSIPS is designed with the following properties:

*   The routing info (destinations, carriers, rules, groups) is stored in a database and loaded into memory at start up time; reload at runtime via a Management Interface command.
    
*   weight-based or random selection of the destinations (from a rule or from a carrier), failure detection of gateways (with switching to next available gateway).
    
*   able to handle large volume of routing info (10M of rules) with minimal speed/time and memory consumption penalties
    
*   script integration - Pseudo-variable support in functions; scripting route triggering when rules are matched
    
*   bidirectional behavior - inbound and outbound processing (strip and prefixing when sending and receiving from a destination/GW)
    
*   blacklisting - the module allows definition of blacklists based on the destination IPs. This blacklists are to be used to prevent malicious forwarding to GWs (based on DNS lookups) when the script logic does none-GE forwarding (like foreign domains).
    
*   loading routing information from multiple databases - the gateways, rules, groups and carriers can be grouped by partitions, and each partition may be loaded from different databases/tables. This makes the routing process partition based. In order to be able to use a table from a partition, its name must be found in the "version" table belonging to the database defined in the partition's db_url.
    
There were several tests performed regarding the performance of the module when dealing with a large number of routing rules.

The tests were performed with a set of 383000 rules and measured:

*   time to load from DB
    
*   used shared memory
    
The time to load was varying between 4 seconds and 8 seconds, depending of the caching of the DB client - the first load was the slowest (as the DB query hits the disk drive); the following are faster as data is already cached in the DB client. So technically speaking, the time to load (without the time to query which is DB type dependent) is ~4 seconds

After loading the data into shared memory ~ 96M of memory were used exclusively for the DR data.

## How It Works

DR engine uses several concepts in order to define how the routing should be done (describing all the dependencies between destinations and routing rules).

#### 1.1.4.1.Destination/Gateways

These are the end SIP entities where actually the traffic needs to be sent after routing. They are stored in a table called “dr_gateways”. Gateway addresses are stored in a separate table because of the need to access them independent of Dynamic Routing processing (e.g., adding/ removing gateway PRI prefix before/after performing other operation -- receiving/relaying to gateway).

In DR, a gateway is defined by:

*   id (string)
    
*   SIP address (SIP URI)
    
*   type (integer which allows GWs to be grouped by purpose, e.g. inbound, outbound, etc.)
    
*   strip value (number of digits) from dialled number
    
*   prefix (string) to be added to dialled number
    
*   attributes (not used by DR engine, but only pushed to script level when routing to this GW)
    
*   probing mode (how the GW should be probed at SIP level - see the probing chapter)
    
The Gateways are to be used from the routing rule or from the carrier definition. They are all the time referred by their ID.

#### 1.1.4.2.Carriers

The carrier concept is used if you need to group gateways in order to have a better control on how the GWs will be used by DR rules; like in what order the GWs will be used.

Basically, a carrier is a set of gateways which have its own sorting algorithm and its own attribute string. They are by default defined in the “dr_carriers” table.

In DR, a carrier is defined by:

*   id (string)
    
*   list of gateways with/without weights (string) (Ex:“gw1=10,gw4=10” or “gw1,gw2”
    
*   flags : 0x1 - use only the first gateway from the carrier (depending on the sorting); 0x2 - disable the usage of this carrier
    
*   sort algorithm : how the list of the gateways should be sorted before being used, NULL - use the DB given order, W - do weight based re-ordering, Q - do quality based sorting (requires the qrouting module)
    
*   attributes (not used by DR engine, but only pushed to script level when routing to this carrier)
    
The Carriers are to be used only from the routing rule definition. They are all the time referred by their ID.

#### 1.1.4.3.Routing Rules

These are the actual rules which control the routing. Using different criterias (prefix, time, priority, etc), they will decide to which gateways the call will be sent.

Default name for the table storing rule definitions is “dr_rules”.

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
    
*   The value stored in database has the basic format of: <timezone>|<dtstart>|<dtend>|<duration>|<freq>|<until>|<interval>|<byday>|<bymonthday>|<byyearday>|<byweekno>|<bymonth> , identical to the input of the check_time_rec() function of the cfgutils module, including the optional use of logical operators linking multiple such strings into a larger expression.
    
*   When an attribute is not specified, the corresponding place must be left empty, whenever another attribute that follows in the list has to be specified.
    
The module can be used to find out which is the best gateway to use for new calls terminated to PSTN. The algorithm to select the rule is as follows:

*   the module discovers the routing group of the originating user. This step is skipped if a routing group is passed from the script as parameter.
    
*   once the group is known, in the subset of the rules for this group the module looks for the one that matches the destination based on "prefix" column. The set of rules with the longest prefix is chosen. If no digit from the prefix matches, the default rules are used (rules with no prefix)
    
*   within the set of rules is applied the time criteria, and the rule which has the highest priority and matches the time criteria is selected to drive the routing.
    
*   Once found the rule, it may contain a route ID to execute. If a certain flag is set, then the processing is stopped after executing the route block.
    
*   The rule must contain a chain of gateways and carriers. The module will execute serial forking for each address in the chain (ordering is either done by simply using the definition order or it may weight-based - weight selection must be enabled). The next address in chain is used only if the previously has failed.
    
*   With the right gateway address found, the prefix (PRI) of the gateway is added to the request URI and then the request is forwarded.
    
If no rule is found to match the selection criteria an default action must be taken (e.g., error response sent back). If the gateway in the chain has no prefix the request is forwarded without adding any prefix to the request URI.

The module has the capability to monitor the status of the destinations by doing SIP probing (sending SIP requests like OPTIONS).

For each destination, you can configure what kind of probing should be done (probe_mode column):

*   _(0)_ - no probing at all;
    
*   _(1)_ - probing only when the destination is in disabled mode (disabling via MI command will completely stop the probing also). The destination will be automatically re-enabled when the probing will succeed next time;
    
*   _(2)_ - probing all the time. If disabled, the destination will be automatically re-enabled when the probing will succeed next time;
    
A destination can become disabled in two ways:

*   _script detection_ - by calling from script the dr_disable() function after trying the destination. In this case, if probing mode for the destination is (1) or (2), the destination will be automatically re-enabled when the probing will succeed.
*   _MI command_ - by calling the drouting:gw_status MI command for disabling (on demand) the destination. If so, the probing and re-enabling of this destination will be completly disabled until you re-enable it again via MI command - this is designed to allow controlled and complete disabling of some destination during maintenance.

## Dependencies

### OpenSIPs Modules

- `a database module` — The following modules must be loaded before this module
- `tm module` — The following modules must be loaded before this module

### External Libraries

None.

### Optional Modules

- `clusterer`

## Exported Parameters

### `carrier_id_avp` (string)

AVP to be populate with the ID string for the carrier the current GW belongs to.

*Default value is NULL.*

**Example.** Set the `carrier_id_avp` parameter.

```opensips
...
modparam("drouting", "carrier_id_avp", '$avp(carrier_id)')
...
```
### `cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used in drouting module for two purposes: for sharing the status of the gateways/carriers and for controlling the pinging to gateways.

If clustering enbled, the module will automatically share changes over the status of the gateways/destinations/carriers with the other OpenSIPS instances that are part of a cluster. Whenever such a status changes (following an MI command, a probing result, a script command), the module will replicate this status change to all the nodes in this given cluster.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to gateways. See the [cluster_sharing_tag](#param_cluster_sharing_tag "1.3.25.cluster_sharing_tag (string)") option.

This OpenSIPS cluster exposes the **"drouting-status-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the [clusterer](clusterer) module.

*Default value is 0 (none).*

**Example.** 9.

```opensips
# replicate gw/carrier status with all OpenSIPS in cluster ID 9
modparam("drouting", "cluster_id", 9)
```
### `cluster_probing_mode` (string)

This paramter controls how the probing/pinging should be done when using the clustering support. It is about which node in the cluster pings which gateway/destination. The cluster_id must be defined for this option to work.

*Default value is "all".*

**Possible values:**

- all
- by-shtag
- distributed

**Example.** by-shtag.

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
modparam("drouting", "cluster_id", 9)
modparam("drouting", "cluster_sharing_tag", "vip")
modparam("drouting", "cluster_probing_mode", "by-shtag")
...
# the pinging effort is distributed across all the nodes
modparam("drouting", "cluster_id", 9)
modparam("drouting", "cluster_probing_mode", "distributed")
...
```
### `cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform the self-triggered actions in the module. Such actions may be the gateway probing (see also the [cluster_probing_mode](#param_cluster_probing_mode "1.3.26.cluster_probing_mode (string)") parameter) or sharing the gateway/carrier status changes. If defined, only the node with active status of this tag will perform the actions (pinging and sharing status).

The [cluster_id](#param_cluster_id "1.3.24.cluster_id (integer)") must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will share the status changes.

*Default value is empty (none).*

**Example.** vip.

```opensips
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("drouting", "cluster_id", 9)
modparam("drouting", "cluster_sharing_tag", "vip")
```
### `db_partitions_table` (string)

The name of the table containing partition definitions. To be used with `use_partitions` and `db_partitions_url`.

*Default value is dr_partitions.*

**Example.** partition_defs.

```opensips
modparam("drouting", "db_partitions_table", "partition_defs")
```
### `db_partitions_url` (string)

The url to the database containing partition-specific information. (partition-specific information includes partition name, url to the database where information about the partition is preserved, the names of the tables in which it is preserved and the AVPs that can be accessed using the .cfg script). The `use_partitions` parameter must be set to 1.

*Default value is NULL.*

**Example.** mysql://user:password@localhost/opensips_partitions.

```opensips
modparam("drouting", "db_partitions_url", "mysql://user:password@localhost/opensips_partitions")
```
### `db_url` (string)

The database url.

*Default value is NULL.*

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
...
modparam("drouting", "db_url",
	"mysql://opensips:opensipsrw@localhost/opensips")
...
```
### `default_group` (integer)

Group to be used if the caller (FROM user) is not found in the GROUP table.

*Default value is NONE.*

**Example.** Set the `default_group` parameter.

```opensips
...
modparam("drouting", "default_group", 4)
...
```
### `define_blacklist` (string)

Defines a blacklist based on a list of GW types - the blacklist will be populated with the IPs (no port, all protocols) of the GWs having the specified types.

If partitions are used, prefix the blacklist definition string with the name of the partition followed by ":" separator.

Multiple instances of this param are allowed.

*Default value is NULL.*

**Notes:** Multiple instances of this param are allowed.

**Example.** Set the `define_blacklist` parameter.

```opensips
...
modparam("drouting", "define_blacklist", 'bl_name= 3,5,25,23')
modparam("drouting", "define_blacklist", 'list= 4,2')
modparam("drouting", "define_blacklist", 'pstn:list2 = 5,6')
modparam("drouting", "define_blacklist", 'pstn:list3 = 7,8')
...
```
### `drc_table` (string)

The name of the db table storing definitions of the carriers that will be used directly by the routing rules.

*Default value is dr_carriers.*

**Example.** my_dr_carriers.

```opensips
...
modparam("drouting", "drc_table", "my_dr_carriers")
...
```
### `drd_table` (string)

The name of the db table storing gateway addresses.

*Default value is dr_gateways.*

**Example.** dr_gateways.

```opensips
...
modparam("drouting", "drd_table", "dr_gateways")
...
```
### `drg_domain_col` (string)

The name of the column in group db table where the domain is stored.

*Default value is "domain".*

**Example.** host.

```opensips
...
modparam("drouting", "drg_domain_col", "host")
...
```
### `drg_grpid_col` (string)

The name of the column in group db table where the group id is stored.

*Default value is "groupid".*

**Example.** grpid.

```opensips
...
modparam("drouting", "drg_grpid_col", "grpid")
...
```
### `drg_table` (string)

The name of the db table storing groups.

*Default value is dr_groups.*

**Example.** groups.

```opensips
...
modparam("drouting", "drg_table", "groups")
...
```
### `drg_user_col` (string)

The name of the column in group db table where the username is stored.

*Default value is "username".*

**Example.** user.

```opensips
...
modparam("drouting", "drg_user_col", "user")
...
```
### `drr_table` (string)

The name of the db table storing routing rules.

*Default value is dr_rules.*

**Example.** rules.

```opensips
...
modparam("drouting", "drr_table", "rules")
...
```
### `enable_restart_persistency` (integer)

Parameter set to enable restart persistency for the Dynamic Routing module. When this parameter is set, the drouting module no longer loads the data from the database after restart, but uses the persistent storage file, and loads data from it “on demand”, improving the startup performance.

*Default value is 0 (disabled).*

**Notes:** NOTE: If the restart persistent cache is not populated from a previous run, then the data will be loaded from database at startup! NOTE: A reload will update the cached data.

**Example.** yes.

```opensips
modparam("drouting", "enable_restart_persistency", yes)
```
### `extra_id_chars` (string)

A set of extra characters to be allowed in both Gateway and Carrier unique string identifiers, on top of alphanumeric characters.

*Default value is _-..*

**Example.** Set the `extra_id_chars` parameter.

```opensips
...
modparam("drouting", "extra_id_chars", ":_-.")
...
```
### `extra_prefix_chars` (string)

List of ASCII (0-127) characters to be additionally accepted in the prefixes. By default only '0' - '9' chars (digits) are accepted.

*Default value is NULL.*

**Example.** Set the `extra_prefix_chars` parameter.

```opensips
...
modparam("drouting", "extra_prefix_chars", "#-%")
...
```
### `force_dns` (integer)

Force DNS resolving of GW/destination names (if not IPs) during startup. If not enabled, the GW name will be blindly used during routing.

*Default value is 1 (enabled).*

**Example.** Set the `force_dns` parameter.

```opensips
...
modparam("drouting", "force_dns", 0)
...
```
### `generate_data_checksum` (integer)

If enabled, it will generate a checksum ( MD5 ) for drouting loaded data, attach that to the reload_status MI command output and to the reload generated status reports

**Example.** Set the `generate_data_checksum` parameter.

```opensips
...
modparam("drouting", "generate_data_checksum", 1)
...
```
### `gw_id_avp` (string)

The name of the avp for storing the id of the current selected gateway/destination - once a new destination is selected (via the use_next_gw() function), the AVP will be updated with the ID of the new selected gateway/destination.

*Default value is $avp(___dr_gw_id___) if use_partitions parameter is 0 or $avp(___dr_gw_id___partition_name) where partition_name is the name of the partition containing the AVP (as fetched from the database) if use_partitions parameter is 1..*

**Example.** $avp(gw_id).

```opensips
...
modparam("drouting", "gw_id_avp", '$avp(gw_id)')
modparam("drouting", "gw_id_avp", '$avp(334)')
...
```
### `gw_priprefix_avp` (string)

The name of the avp for storing the PRI prefix of the current selected destination/gateway - once a new destination is selected (via the use_next_gw() function), the AVP will be updated with the PRI prefix of the new used destination.

*Default value is NULL.*

**Example.** $avp(gw_priprefix).

```opensips
...
modparam("drouting", "gw_priprefix_avp", '$avp(gw_priprefix)')
...
```
### `gw_sock_avp` (string)

The name of the avp for storing sockets for alternative destinations defined by ruri_avp.

*Default value is $avp(___dr_sock___) if use_partitions parameter is 0 or $avp(___dr_sock___partition_name) where partition_name is the name of the partition containing the AVP (as fetched from the database) if use_partitions parameter is 1..*

**Example.** Set the `gw_sock_avp` parameter.

```opensips
...
modparam("drouting", "gw_sock_avp", '$avp(dr_sock)')
modparam("drouting", "gw_sock_avp", '$avp(77)')
...
```
### `gw_socket_filter_mode` (string)

This parameter controls the gateway filtering during DB loading, or which gateways are loaded or not into memory depending on the configured socket they have.

The supported filtering modes are:

*   **"all"** - all the gateways defined in DB are loaded into memory, disregarding what socket value they have. NOTE: for the gw sockets not matching any OpenSIPS listeners/sockets, the GW will be loaded with NULL/no socket.
    
*   **"ignore"** - all the gateways defined in DB are loaded into memory, but ignoring the socket value they have (the socket will be set to NULL/NONE with no attempt to check it against the OpenSIPS listeners/sockets).
    
*   **"matched-only"** - in this mode the module will load from DB only the gateways that have a configured a socket matching any of the the OpenSIPS listeners/sockets. If the gateways socket does not match, it will be discards, not loaded into memory at all.

*Default value is "all".*

**Possible values:**

- all
- ignore
- matched-only

**Example.** matched-only.

```opensips
# multiple OpenSIPS instances sharing a DR setting, so each should
# load only the GWs they have sockets for.
modparam("drouting", "gw_socket_filter_mode", "matched-only")
...
# an OpenSIPs instance not doing routing, but needing to be
# aware of all the gws, so load them all ignoring the sockets
modparam("drouting", "gw_socket_filter_mode", "ignore")
```
### `no_concurrent_reload` (integer)

If enabled, the module will not allow do run multiple drouting:reload MI commands in parallel (with overlapping) Any new reload will be rejected (and discarded) while an existing reload is in progress.

If you have a large routing set (millions of rules/prefixes), you should consider disabling concurrent reload as they will exhaust the shared memory (by reloading into memory, in the same time, multiple instances of routing data).

*Default value is 0.*

**Example.** 1.

```opensips
# do not allow parallel reload operations
modparam("drouting", "no_concurrent_reload", 1)
```
### `partition_id_pvar` (pvar)

Variable which will store the name of the name partition when _wildcard(*)_ operatior is used. _Use_partitions_ must be set in order to use this parameter.

*Default value is null(not used).*

**Notes:** NOTE: The variable must be WRITABLE!

**Example.** $var(matched_partition).

```opensips
modparam("drouting", "partition_id_pvar", "$var(matched_partition)")
```
### `persistent_state` (integer)

Specifies whether the _state_ column should be loaded at startup and flushed during runtime or not.

*Default value is 1.*

**Example.** 0.

```opensips
# disable all DB operations with the state of a gateway
modparam("drouting", "persistent_state", 0)
```
### `probing_from` (string)

The FROM SIP URI to be advertised in the SIP probing requests.

*Default value is sip:prober@localhost.*

**Example.** sip:pinger@192.168.2.10.

```opensips
modparam("drouting", "probing_from", "sip:pinger@192.168.2.10")
```
### `probing_interval` (integer)

How often (in seconds) the probing of a destination should be done. If set to 0, the probing will be disabled as functionality (for all destinations)

*Default value is 30.*

**Example.** 60.

```opensips
modparam("drouting", "probing_interval", 60)
```
### `probing_method` (string)

The SIP method to be used for the probing requests.

*Default value is OPTIONS.*

**Example.** INFO.

```opensips
modparam("drouting", "probing_method", "INFO")
```
### `probing_reply_codes` (string)

A comma separted list of SIP reply codes. The codes defined here will be considered as valid reply codes for probing messages, apart for 200.

*Default value is NULL.*

**Example.** 501, 403.

```opensips
modparam("drouting", "probing_reply_codes", "501, 403")
```
### `probing_socket` (string)

A socket description [proto:]host[:port] of the local socket (which is used by OpenSIPS for SIP traffic) to be used (if multiple) for sending the probing messages from.

For probing gateway the highest priority has socket from gateway configuration in dr_gateways table. Then socket from global `probing_socket` parameter and the lowest priority is default behaviour with auto selected socket wich OpenSIPS listens on.

*Default value is NULL.*

**Example.** udp:192.168.1.100:5060.

```opensips
modparam("drouting", "probing_socket", "udp:192.168.1.100:5060")
```
### `rule_id_avp` (string)

The name of the avp for storing the id of the current matched routing rule (see dr_rules table).

*Default value is NULL.*

**Example.** $avp(rule_id).

```opensips
...
modparam("drouting", "rule_id_avp", '$avp(rule_id)')
modparam("drouting", "rule_id_avp", '$avp(335)')
...
```
### `rule_prefix_avp` (string)

The actual prefix that matched the routing rule (the part from RURI username that matched the routing rule).

*Default value is NULL.*

**Example.** $avp(dr_prefix).

```opensips
...
modparam("drouting", "rule_prefix_avp", '$avp(dr_prefix)')
...
```
### `rule_tables_query` (string)

This parameter offers a dynamic, SQL-based way of building a set of _dr_rules_\-compatible table names, to be each loaded and then merged into a single "dr_rules" table, for any given partition.

The syntax of the parameter is: "**token** : **query**", where **token** is a special name given to a "dr_rules" table, so OpenSIPS can match it against the custom queries defined using this parameter.

This parameter may be set multiple times (each definition creates a new mapping).

**Example.** Set the `rule_tables_query` parameter.

```opensips
...
# first, set the "dr_rules" table name to the name of your query
modparam("drouting", "drr_table", "MY_RULES_QUERY")

# next, instruct drouting to load both 'dr_rules_a' and 'dr_rules_b',
# then merge all of their rules
modparam("drouting", "rule_tables_query", "
	MY_RULES_QUERY:
		SELECT 'dr_rules_a' UNION SELECT 'dr_rules_b'")
...
```
### `ruri_avp` (string)

The name of the avp for storing Request URIs to be later used (alternative destiantions for the current one).

*Default value is $avp(___dr_ruri___) if use_partitions parameter is 0 or $avp(___dr_ruri___partition_name) where partition_name is the name of the partition containing the AVP (as fetched from the database) if use_partitions parameter is 1..*

**Example.** $avp(dr_ruri).

```opensips
...
modparam("drouting", "ruri_avp", '$avp(dr_ruri)')
modparam("drouting", "ruri_avp", '$avp(33)')
...
```
### `use_domain` (integer)

Flag to configure whether to use domain match when querying database for user's routing group.

*Default value is 1.*

**Example.** 0.

```opensips
...
modparam("drouting", "use_domain", 0)
...
```
### `use_partitions` (integer)

Flag to configure whether to use partitions for routing. If this flag is set then the `db_partitions_url` and `db_partitions_table` variables become mandatory.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("drouting", "use_partitions", 1)
```

## Exported Functions

### `do_routing([groupID], [flags], [gw_whitelist], [rule_attrs_pvar], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function to trigger routing of the message according to the rules in the database table and the configured parameters.

**Parameters:**

- `carrier_attrs_pvar` *(var, optional)* — a a writable variable which will be populated with the attributes of the matched carrier.
- `flags` *(string, optional)* — a list of letter-like flags for controlling the routing behavior.
  - `F`
  - `L`
  - `C`
- `groupID` *(int, optional)* — number to specify the group of the caller for routing purposes. If none specified the function will automatically try to query the dr_group table to get this
- `gw_attrs_pvar` *(var, optional)* — a writable variable which will be populated with the attributes of the matched gateway.
- `gw_whitelist` *(string, optional)* — a comma separated white list of gateways. This will force routing over, at most, this list of carriers or gateways (in other words, the whitelist will be intersected with the results of the search through the rules).
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Besides specifing the name of one partition, you can use the "*" wildcard sign to force routing over all partitions.
- `rule_attrs_pvar` *(var, optional)* — a writable variable which will be populated with the attributes of the matched dynamic routing rule.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** all groups, sort on order, `use_partitions` is 0.

```opensips
# all groups, sort on order, `use_partitions` is 0
do_routing();
```

**Example.** all groups, sort on order, `use_partitions` is 1, route by partition named "part".

```opensips
# all groups, sort on order, `use_partitions` is 1, route by partition named "part"
do_routing( , , , , , ,"part");
```

**Example.** group id 0, sort on order, `use_partitions` is 0.

```opensips
# group id 0, sort on order, `use_partitions` is 0
do_routing(0);
```

**Example.** group id 0, sort on order, `use_partitions` is 1, route by partition named "part".

```opensips
# group id 0, sort on order, `use_partitions` is 1, route by partition named "part"
do_routing(0, , , , , , "part");
```

**Example.** group id from $var(id), sort on order, `use_partitions` is 0.

```opensips
# group id from $var(id), sort on order, `use_partitions` is 0
do_routing($var(id));
```

**Example.** all groups, sort on weights, `use_partitions` is 0.

```opensips
# all groups, sort on weights, `use_partitions` is 0
do_routing(, "W");
```

**Example.** `use_partitions` is 1, partition and group supplied by AVPs, do strict length matching.

```opensips
# `use_partitions` is 1, partition and group supplied by AVPs, do strict length matching
do_routing( $avp(grp),"L", , , , ,$avp(partition))
```

**Example.** group id 2, sort on order, fallback rule and also return the gateway attributes.

```opensips
# group id 2, sort on order, fallback rule and also return the gateway attributes
do_routing(2, "F", , , $var(gw_attributes));
```

### `dr_disable([partition])`

Marks as disabled the last destination that was used for the current call. The disabling done via this function will prevent the destination to be used for usage from now on. The probing mechanism can re-enable this peer (see the probing section in the beginning)

**Parameters:**

- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Wildcard sign is accepted by this function.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE

**Example.** dr_disable usage.

```opensips
if (t_check_status("(408)|(5[0-9][0-9])")) {
	dr_disable();
}
```

**Example.** dr_disable usage with partition.

```opensips
if (t_check_status("(408)|(5[0-9][0-9])")) {
	dr_disable("my_partition");
}
```

### `dr_is_gw( sip_uri, [type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function checks if the SIP URI hostname part stored inside the "src_pv" pseudo-variable is a gateway from a certain group. This function does not change anything in the message.

**Parameters:**

- `carrier_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched carrier.
- `flags` *(string, optional)* — letter like flags for controlling what operations should be performed when a GW matches
  - `s`
  - `p`
  - `i`
  - `n`
  - `c`
- `gw_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched gateway.
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Wildcard sign is accepted by this function.
- `sip_uri` *(string, required)* — SIP URI. If the URI hostname part is a FQDN, it will be resolved prior to matching.
- `type` *(int, optional)* — number for the GW/destination type to be checked; when omitting this parameter or specifying the special value -1, matching will be done against all types.
  - `-1`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** match the SIP URI host within $var(uac) against all gateways.

```opensips
# match the SIP URI host within $var(uac) against all gateways
if (dr_is_gw( $var(uac), , "n")) {
	...
}
```

**Example.** match the SIP URI host within $var(uac) against all gws in "outbound" partition.

```opensips
# match the SIP URI host within $var(uac) against
# all gws in "outbound" partition
if (dr_is_gw( $avp(uac), , "n", , , "partition")) {
	...
}
```

### `dr_match(groupID, [flags], number, [rule_attrs_pvar], [partition])`

The function tries to match/check the given number against the rules from the database.

**Parameters:**

- `flags` *(string, optional)* — a list of letter-like flags for controlling the checking/matching behavior.
  - `L`
- `groupID` *(int, required)* — number to specify the dr group (set of rules) to perform the check against
- `number` *(string, required)* — the number to check
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on.
- `rule_attrs_pvar` *(var, optional)* — a writable variable which will be populated with the attributes of the matched dynamic routing rule.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE

**Example.** dr_match usage with partition.

```opensips
if ( dr_match( 1, "L" , $fU, ,"dids") )
	xlog("Full From Username $fU found in group 1 partition DIDS\n");
```

**Example.** dr_match usage.

```opensips
if ( dr_match( 1, , $var(did) ) )
	xlog("DID $var(did) matches rules in group 1\n");
```

### `goes_to_gw( [type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function returns true if the destination of the current request (destination URI or Request URI) points (as IP) to one of the gateways. There no DNS lookups done if the domain part of the URI is not an IP. This function does not change anything in the message.

**Parameters:**

- `carrier_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched carrier.
- `flags` *(string, optional)* — letter like flags for controlling what operations should be performed when a GW matches
  - `s`
  - `p`
  - `i`
  - `n`
  - `c`
- `gw_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched gateway.
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Wildcard sign is accepted by this function.
- `type` *(int, optional)* — number for the GW/destination type to be checked; when omitting this parameter or specifying the special value -1, matching will be done against all types.
  - `-1`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE

**Example.** use_partitions is not set.

```opensips
# use_partitions is not set
if (goes_to_gw( 1, , $var(gw_attrs))) {
	sl_send_reply(403,"Forbidden");
	exit;
}
```

**Example.** use_partitions is enabled.

```opensips
# use_partitions is enabledt
if (goes_to_gw(1, , $var(gw_attrs), , "my_partition")) {
	sl_send_reply(403,"Forbidden");
	exit;
}
```

### `is_from_gw([type], [flags], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function checks if the sender of the message (source IP + source port) is a gateway from a certain group. This function does not change anything in the message.

**Parameters:**

- `carrier_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched carrier.
- `flags` *(string, optional)* — letter like flags for controlling what operations should be performed when a GW matches
  - `s`
  - `p`
  - `i`
  - `n`
  - `r`
  - `c`
- `gw_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched gateway.
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Wildcard sign is accepted by this function.
- `type` *(int, optional)* — number for the GW/destination type to be checked; when omitting this parameter or specifying the special value -1, matching will be done against all types.
  - `-1`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE

**Example.** use_partitions is not set, match the source IP (only) against all gateways.

```opensips
# use_partitions is not set
# match the source IP (only) against all gateways
if (is_from_gw(-1, "n")) {
	...
}
```

**Example.** use_partitions is enabled, match the source IP and port against all gateways from the "outbound" partition and return the matched gateway's carrier.

```opensips
# use_partitions is enabled
# match the source IP and port against all gateways from the "outbound"
# partition and return the matched gateway's carrier
if (is_from_gw(, "c", , , "outbound")) {
	...
}
```

### `route_to_carrier( carriers, [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

Function to trigger the direct routing to a given set carriers (one or more). So, the routing is not done prefix based, but carrier based (call will be sent to the GWs of that carrier, based on carrier policy).

**Parameters:**

- `carrier_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of this carrier.
- `carriers` *(string, required)* — comma separated carrier IDs (names)
- `gw_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the currently matched gateway of this carrier.
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Wildcard sign is not accepted by the function.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** use_partitions is not set.

```opensips
# use_partitions is not set
if ( route_to_carrier("my_top_carrier, def_carrier", , $var(carrier_att)) ) {
	xlog("Routing to \"my_top_carrier\" - $var(carrier_att)\n");
	t_on_failure("next_gw");
	t_relay();
	exit;
}
```

**Example.** use_partitions is enabled.

```opensips
# use_partitions is enabled
if ( route_to_carrier("my_top_carrier", , $var(carrier_att), "part") ) {
	xlog("Routing to \"my_top_carrier\" - $var(carrier_att)\n");
	t_on_failure("next_gw");
	t_relay();
	exit;
}
```

**Example.** use_partitions is enabled.

```opensips
# use_partitions is enabled
if ( route_to_carrier($var(carrierId), , , $var(my_partition)) ) {
	xlog("Routing to \"my_top_carrier\"\n");
	t_on_failure("next_gw");
	t_relay();
	exit;
}
```

### `route_to_gw(gw_id, [gw_attrs_var], [carrier_attrs_var], [partition])`

Function to trigger the direct routing to a given gateway (or list of gateways). Attributes and per-gw processing will be available.

**Parameters:**

- `carrier_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of this carrier. NOTE: the first carrier pointing to the GW(s) will be considered!
- `gw_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the currently matched gateway.
- `gw_id` *(string, required)* — comma separated list of gateway IDs to be used.
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Wildcard sign is not accepted by the function.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** use_partitions is not set.

```opensips
# use_partitions is not set
if ( route_to_gw("gw_europe") ) {
	t_relay();
	exit;
}
```

**Example.** use_partitions is not set.

```opensips
# use_partitions is not set
if ( route_to_gw("gw1,gw2,gw3", $var(gw_attrs)) ) {
	xlog("Relaying to first gateway from our list - $var(gw_attrs)\n");
	t_relay();
	exit;
}
```

**Example.** use_partitions is enabled.

```opensips
# use_partitions is enabled
if ( route_to_gw("gw_europe", , , "my_partition") ) {
	t_relay();
	exit;
}
```

**Example.** use_partitions is enabled.

```opensips
# use_partitions is enabled
if ( route_to_gw("gw1,gw2,gw3", $var(gw_attrs), , "my_partition") ) {
	xlog("Relaying to first gateway from our list - $var(gw_attrs)\n");
	t_relay();
	exit;
}
```

### `use_next_gw( [rule_attrs_pvar], [gw_attrs_pvar], [carrier_attrs_pvar], [partition])`

The function takes the next available destination (set by do_routing, as alternative destinations) and pushes it into the RURI. Note that the function just sets the RURI (nothing more). If a new RURI is set, the used destination is removed from the pending set of alternative destinations.

**Parameters:**

- `carrier_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched carrier.
- `gw_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched gateway.
- `partition` *(string, optional)* — the name of the DR partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on. Wildcard sign is not accepted by the function.
- `rule_attrs_pvar` *(var, optional)* — an output writable variable which will be populated with the attributes of the matched dynamic routing rule.

**Return codes:**

- `true` — a new RURI was set
- `false` — no other alternative destinations are found or in case of an internal processing error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE

**Example.** use_partitions is not set.

```opensips
# use_partitions is not set
if (use_next_gw()) {
	t_relay();
	exit;
}
```

**Example.** Also fetch the carrier attributes, if any.

```opensips
# Also fetch the carrier attributes, if any
if (use_next_gw(, , $var(carrier_attrs))) {
	xlog("Carrier attributes of current gateway: $var(carrier_attrs)\n");
	t_relay();
	exit;
}
```

**Example.** use_partitions is enabled.

```opensips
# use_partitions is enabled
if (use_next_gw( , , ,"my_partition")) {
	t_relay();
	exit;
}
```

**Example.** Also fetch the carrier attributes, if any.

```opensips
# Also fetch the carrier attributes, if any
if (use_next_gw( , ,$var(carrier_attrs), "my_partition")) {
	xlog("Carrier attributes of current gateway: $var(carrier_attrs)\n");
	t_relay();
	exit;
}
```

## Exported MI Functions

### `drouting:carrier_status`

Replaces obsolete MI command: dr_carrier_status. Gets the status (enabled or disabled) of one or multiple carriers. The function can also be used to set the status of a single carrier.

**Parameters:**

- `carrier_id` *(string, optional)* — The id of a carrier. If provided, the function will return/set (depending if the second parameter is given) the status of that carrier, otherwise it will list all carriers along with their statuses.
- `partition_name` *(string, optional)* — The partition name. Required if use_partitions is set to 1.
- `status` *(integer, optional)* — The new status to be forced for a carrier (0 - disable, 1 - enable). Only makes sense if carrier_id is provided.

**Example.** usage when use_partitions is 0

```opensips
$ opensips-cli -x mi drouting:carrier_status carrier_id=CR1
Enabled:: no
$ opensips-cli -x mi drouting:carrier_status carrier_id=CR1 status=1
$ opensips-cli -x mi drouting:carrier_status carrier_id=CR1
Enabled:: yes
```

**Example.** usage when use_partitions is 1

```opensips
$ opensips-cli -x mi drouting:carrier_status partition_name=my_partition carrier_id=CR1
Enabled:: no
$ opensips-cli -x mi drouting:carrier_status partition_name=partition_1 carrier_id=CR1 status=1
$ opensips-cli -x mi drouting:carrier_status partition_name=partition_3 carrier_id=CR1
Enabled:: yes
```

### `drouting:enable_probing`

Replaces obsolete MI command: dr_enable_probing. Enables/disables gateway probing or returns the current gateway probing status.

**Parameters:**

- `status` *(integer, optional)* — 1 - enable, 0 - disable gateway probing.

**Example.** usage

```opensips
$ opensips-cli -x mi drouting:enable_probing
Status:: 1
$ opensips-cli -x mi drouting:enable_probing 0
$ opensips-cli -x mi drouting:enable_probing
Status:: 0
```

### `drouting:gw_status`

Replaces obsolete MI command: dr_gw_status. Gets the status (enabled or disabled) of one or multiple gateways. The function can also be used to set the status of a single gateway.

**Parameters:**

- `gw_id` *(string, optional)* — The id of a gateway. If provided, the function will return/set (depending if the second parameter is given) the status of that gateway, otherwise it will list all gateways along with their statuses.
- `partition_name` *(string, optional)* — The partition name. Required if use_partitions is set to 1.
- `status` *(integer, optional)* — The new status to be forced for a GW (0 - disable, 1 - enable). Only makes sense if gw_id is provided.

**Example.** usage when use_partitions is set to 0

```opensips
$ opensips-cli -x mi drouting:gw_status gw_id=2
State:: Active
$ opensips-cli -x mi drouting:gw_status gw_id=2 status=0
$ opensips-cli -x mi drouting:gw_status gw_id=2
Enabled:: Disabled MI
$ opensips-cli -x mi drouting:gw_status gw_id=3
Enabled:: Inactive
```

**Example.** usage when use_partitions is set to 1

```opensips
$ opensips-cli -x mi drouting:gw_status partition_name=part_1 gw_id=my_gw
State:: Active
$ opensips-cli -x mi drouting:gw_status partition_name=part_1 gw_id=my_gw status=0
$ opensips-cli -x mi drouting:gw_status partition_name=part_1 gw_id=my_gw
enabled:: disabled mi
$ opensips-cli -x mi drouting:gw_status partition_name=partition8 status=3
enabled:: inactive
```

### `drouting:number_routing`

Replaces obsolete MI command: dr_number_routing. Gets the matched prefix along with the list of the gateways / carriers to which a number would be routed when using the do_routing function.

**Parameters:**

- `group_id` *(integer, optional)* — The group id of the rules to check against.
- `number` *(string, required)* — The number to test against.
- `partition_name` *(string, optional)* — The partition name. Required if use_partition is set to 1.

**Example.** MI FIFO Command Format

```opensips
opensips-cli -x mi drouting:number_routing partition_name=part1 group_id=3 number=012340987
```

### `drouting:reload`

Replaces obsolete MI command: dr_reload. Command to reload routing rules from database.

**Parameters:**

- `inherit_state` *(string, optional)* — Whether inherit old state of the gateway, default is y. Valid values: "n" (no inherit state), "y" (inherit state).
- `partition_name` *(string, optional)* — If not provided all the partitions will be reloaded, otherwise just the partition given as parameter will be reloaded. Only applicable if use_partition is set to 1.

**Example.** MI FIFO Command Format

```opensips
opensips-cli -x mi drouting:reload part_1
```

### `drouting:reload_status`

Replaces obsolete MI command: dr_reload_status. Gets the time of the last reload for any partition.

**Parameters:**

- `partition_name` *(string, optional)* — If not provided the function will list the time of the last update for every partition. Otherwise, the function will list the time of the last reload for the given partition. Only applicable if use_partition is set to 1.

**Example.** usage when use_partitions is 0

```opensips
$ opensips-cli -x mi drouting:reload_status
Date:: Tue Aug 12 12:26:00 2014
```

**Example.** usage when use_partitions is 1

```opensips
$ opensips-cli -x mi drouting:reload_status
Partition:: part_test Date=Tue Aug 12 12:24:13 2014
Partition:: part_2 Date=Tue Aug 12 12:24:13 2014
$ opensips-cli -x mi drouting:reload_status part_test
Partition:: part_test Date=Tue Aug 12 12:24:13 2014
```

## Exported Events

### `E_DROUTING_STATUS`

This event is raised when the module changes the state of a gateway, either through an MI command, probing or script function.

**Parameters:**

- `partition` *(string)* — the name of the partition.
- `gwid` *(string)* — the gateway identifier.
- `address` *(string)* — the address of the gateway.
- `status` *(string)* — _disabled MI_ if the gateway was disabled using MI commands, _probing_ if the gateway is being pinged, _inactive_ if it was disabled from the script or _active_ if the gateway is enabled.

## Configuration Examples

### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("drouting", "db_url",
	"mysql://opensips:opensipsrw@localhost/opensips")
...
```
### Set `drd_table` parameter

Set `drd_table` parameter

```opensips
...
modparam("drouting", "drd_table", "dr_gateways")
...
```
### Set `drr_table` parameter

Set `drr_table` parameter

```opensips
...
modparam("drouting", "drr_table", "rules")
...
```
### Set `drg_table` parameter

Set `drg_table` parameter

```opensips
...
modparam("drouting", "drg_table", "groups")
...
```
### Set `drc_table` parameter

Set `drc_table` parameter

```opensips
...
modparam("drouting", "drc_table", "my_dr_carriers")
...
```
### Set `ruri_avp` parameter

Set `ruri_avp` parameter

```opensips
...
modparam("drouting", "ruri_avp", '$avp(dr_ruri)')
modparam("drouting", "ruri_avp", '$avp(33)')
...
```
### Set `gw_id_avp` parameter

Set `gw_id_avp` parameter

```opensips
...
modparam("drouting", "gw_id_avp", '$avp(gw_id)')
modparam("drouting", "gw_id_avp", '$avp(334)')
...
```
### Set `gw_priprefix_avp` parameter

Set `gw_priprefix_avp` parameter

```opensips
...
modparam("drouting", "gw_priprefix_avp", '$avp(gw_priprefix)')
...
```
### Set `rule_id_avp` parameter

Set `rule_id_avp` parameter

```opensips
...
modparam("drouting", "rule_id_avp", '$avp(rule_id)')
modparam("drouting", "rule_id_avp", '$avp(335)')
...
```
### Set `rule_prefix_avp` parameter

Set `rule_prefix_avp` parameter

```opensips
...
modparam("drouting", "rule_prefix_avp", '$avp(dr_prefix)')
...
```
### Set `carrier_id_avp` parameter

Set `carrier_id_avp` parameter

```opensips
...
modparam("drouting", "carrier_id_avp", '$avp(carrier_id)')
...
```
### Set `gw_sock_avp` parameter

Set `gw_sock_avp` parameter

```opensips
...
modparam("drouting", "gw_sock_avp", '$avp(dr_sock)')
modparam("drouting", "gw_sock_avp", '$avp(77)')
...
```
### Set `define_blacklist` parameter

Set `define_blacklist` parameter

```opensips
...
modparam("drouting", "define_blacklist", 'bl_name= 3,5,25,23')
modparam("drouting", "define_blacklist", 'list= 4,2')
modparam("drouting", "define_blacklist", 'pstn:list2 = 5,6')
modparam("drouting", "define_blacklist", 'pstn:list3 = 7,8')
...
```
### Set `default_group` parameter

Set `default_group` parameter

```opensips
...
modparam("drouting", "default_group", 4)
...
```
### Set `force_dns` parameter

Set `force_dns` parameter

```opensips
...
modparam("drouting", "force_dns", 0)
...
```
### Set the `persistent_state` parameter

Set the `persistent_state` parameter

```opensips
...
# disable all DB operations with the state of a gateway
modparam("drouting", "persistent_state", 0)
...
```
### Set `no_concurrent_reload` parameter

Set `no_concurrent_reload` parameter

```opensips
...
# do not allow parallel reload operations
modparam("drouting", "no_concurrent_reload", 1)
...
```
### Set `probing_interval` parameter

Set `probing_interval` parameter

```opensips
...
modparam("drouting", "probing_interval", 60)
...
```
### Set `probing_method` parameter

Set `probing_method` parameter

```opensips
...
modparam("drouting", "probing_method", "INFO")
...
```
### Set `probing_from` parameter

Set `probing_from` parameter

```opensips
...
modparam("drouting", "probing_from", "sip:pinger@192.168.2.10")
...
```
### Set `probing_reply_codes` parameter

Set `probing_reply_codes` parameter

```opensips
...
modparam("drouting", "probing_reply_codes", "501, 403")
...
```
### Set `probing_socket` parameter

Set `probing_socket` parameter

```opensips
...
modparam("drouting", "probing_socket", "udp:192.168.1.100:5060")
...
```
### Set `gw_socket_filter_mode` parameter

Set `gw_socket_filter_mode` parameter

```opensips
...
# multiple OpenSIPS instances sharing a DR setting, so each should
# load only the GWs they have sockets for.
modparam("drouting", "gw_socket_filter_mode", "matched-only")
...
# an OpenSIPs instance not doing routing, but needing to be
# aware of all the gws, so load them all ignoring the sockets
modparam("drouting", "gw_socket_filter_mode", "ignore")
...
```
### Set `cluster_id` parameter

Set `cluster_id` parameter

```opensips
...
# replicate gw/carrier status with all OpenSIPS in cluster ID 9
modparam("drouting", "cluster_id", 9)
...
```
### Set `cluster_sharing_tag` parameter

Set `cluster_sharing_tag` parameter

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("drouting", "cluster_id", 9)
modparam("drouting", "cluster_sharing_tag", "vip")
...
```
### Set `cluster_probing_mode` parameter

Set `cluster_probing_mode` parameter

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
modparam("drouting", "cluster_id", 9)
modparam("drouting", "cluster_sharing_tag", "vip")
modparam("drouting", "cluster_probing_mode", "by-shtag")
...
# the pinging effort is distributed across all the nodes
modparam("drouting", "cluster_id", 9)
modparam("drouting", "cluster_probing_mode", "distributed")
...
```
### Set `use_domain` parameter

Set `use_domain` parameter

```opensips
...
modparam("drouting", "use_domain", 0)
...
```
### Set `drg_user_col` parameter

Set `drg_user_col` parameter

```opensips
...
modparam("drouting", "drg_user_col", "user")
...
```
### Set `drg_domain_col` parameter

Set `drg_domain_col` parameter

```opensips
...
modparam("drouting", "drg_domain_col", "host")
...
```
### Set `drg_grpid_col` parameter

Set `drg_grpid_col` parameter

```opensips
...
modparam("drouting", "drg_grpid_col", "grpid")
...
```
### Set `use_partitions` parameter

Set `use_partitions` parameter

```opensips
...
modparam("drouting", "use_partitions", 1)
...
```
### Set `db_partitions_url` parameter

Set `db_partitions_url` parameter

```opensips
...
modparam("drouting", "db_partitions_url", "mysql://user:password@localhost/opensips_partitions")
...
```
### Set `db_partitions_table` parameter

Set `db_partitions_table` parameter

```opensips
...
modparam("drouting", "db_partitions_table", "partition_defs")
...
```
### Set `partition_id_pvar` parameter

Set `partition_id_pvar` parameter

```opensips
...
modparam("drouting", "partition_id_pvar", "$var(matched_partition)")
...
```
### Set `enable_restart_persistency` parameter

Set `enable_restart_persistency` parameter

```opensips
...
modparam("drouting", "enable_restart_persistency", yes)
...
```
### Set `extra_prefix_chars` parameter

Set `extra_prefix_chars` parameter

```opensips
...
modparam("drouting", "extra_prefix_chars", "#-%")
...
```
### Set `extra_id_chars` parameter

Set `extra_id_chars` parameter

```opensips
...
modparam("drouting", "extra_id_chars", ":_-.")
...
```
### Set the `rule_tables_query` parameter

Set the `rule_tables_query` parameter

```opensips
...
# first, set the "dr_rules" table name to the name of your query
modparam("drouting", "drr_table", "MY_RULES_QUERY")

# next, instruct drouting to load both 'dr_rules_a' and 'dr_rules_b',
# then merge all of their rules
modparam("drouting", "rule_tables_query", "
	MY_RULES_QUERY:
		SELECT 'dr_rules_a' UNION SELECT 'dr_rules_b'")
...
```
### Set the `generate_data_checksum` parameter

Set the `generate_data_checksum` parameter

```opensips
...
modparam("drouting", "generate_data_checksum", 1)
...
```
### `do_routing` usage

`do_routing` usage

```opensips
...
# all groups, sort on order, `use_partitions` is 0
do_routing();
...
# all groups, sort on order, `use_partitions` is 1, route by partition named "part"
do_routing( , , , , , ,"part");
...
# group id 0, sort on order, `use_partitions` is 0
do_routing(0);
...
# group id 0, sort on order, `use_partitions` is 1, route by partition named "part"
do_routing(0, , , , , , "part");
...
# group id from $var(id), sort on order, `use_partitions` is 0
do_routing($var(id));
...
# all groups, sort on weights, `use_partitions` is 0
do_routing(, "W");
...
# `use_partitions` is 1, partition and group supplied by AVPs, do strict length matching
do_routing( $avp(grp),"L", , , , ,$avp(partition))
...
# group id 2, sort on order, fallback rule and also return the gateway attributes
do_routing(2, "F", , , $var(gw_attributes));
...
```
### `route_to_carrier` usage

`route_to_carrier` usage

```opensips
...
# use_partitions is not set
if ( route_to_carrier("my_top_carrier, def_carrier", , $var(carrier_att)) ) {
	xlog("Routing to \\"my_top_carrier\\" - $var(carrier_att)\\n");
	t_on_failure("next_gw");
	t_relay();
	exit;
}
...
# use_partitions is enabled
if ( route_to_carrier("my_top_carrier", , $var(carrier_att), "part") ) {
	xlog("Routing to \\"my_top_carrier\\" - $var(carrier_att)\\n");
	t_on_failure("next_gw");
	t_relay();
	exit;
}
...
# use_partitions is enabled
if ( route_to_carrier($var(carrierId), , , $var(my_partition)) ) {
	xlog("Routing to \\"my_top_carrier\\"\\n");
	t_on_failure("next_gw");
	t_relay();
	exit;
}
...
```
### `route_to_gw` usage

`route_to_gw` usage

```opensips
...
# use_partitions is not set
if ( route_to_gw("gw_europe") ) {
	t_relay();
	exit;
}
...
# use_partitions is not set
if ( route_to_gw("gw1,gw2,gw3", $var(gw_attrs)) ) {
	xlog("Relaying to first gateway from our list - $var(gw_attrs)\\n");
	t_relay();
	exit;
}
...
# use_partitions is enabled
if ( route_to_gw("gw_europe", , , "my_partition") ) {
	t_relay();
	exit;
}
...
# use_partitions is enabled
if ( route_to_gw("gw1,gw2,gw3", $var(gw_attrs), , "my_partition") ) {
	xlog("Relaying to first gateway from our list - $var(gw_attrs)\\n");
	t_relay();
	exit;
}
...
```
### `use_next_gw` usage

`use_next_gw` usage

```opensips
...
# use_partitions is not set
if (use_next_gw()) {
	t_relay();
	exit;
}
...
# Also fetch the carrier attributes, if any
if (use_next_gw(, , $var(carrier_attrs))) {
	xlog("Carrier attributes of current gateway: $var(carrier_attrs)\\n");
	t_relay();
	exit;
}
...
# use_partitions is enabled
if (use_next_gw( , , ,"my_partition")) {
	t_relay();
	exit;
}
...
# Also fetch the carrier attributes, if any
if (use_next_gw( , ,$var(carrier_attrs), "my_partition")) {
	xlog("Carrier attributes of current gateway: $var(carrier_attrs)\\n");
	t_relay();
	exit;
}
...
```
### `goes_to_gw` usage

`goes_to_gw` usage

```opensips
...
# use_partitions is not set
if (goes_to_gw( 1, , $var(gw_attrs))) {
	sl_send_reply(403,"Forbidden");
	exit;
}
...
# use_partitions is enabledt
if (goes_to_gw(1, , $var(gw_attrs), , "my_partition")) {
	sl_send_reply(403,"Forbidden");
	exit;
}
...
```
### `is_from_gw` usage

`is_from_gw` usage

```opensips
\# use_partitions is not set
# match the source IP (only) against all gateways
if (is_from_gw(-1, "n")) {
	...
}

# use_partitions is enabled
# match the source IP and port against all gateways from the "outbound"
# partition and return the matched gateway's carrier
if (is_from_gw(, "c", , , "outbound")) {
	...
}
```
### `dr_is_gw` usage

`dr_is_gw` usage

```opensips
\# match the SIP URI host within $var(uac) against all gateways
if (dr_is_gw( $var(uac), , "n")) {
	...
}

# match the SIP URI host within $var(uac) against
# all gws in "outbound" partition
if (dr_is_gw( $avp(uac), , "n", , , "partition")) {
	...
}
```
### `dr_disable()` usage

`dr_disable()` usage

```opensips
...
if (t_check_status("(408)|(5\[0-9\]\[0-9\])")) {
	dr_disable();

}
...
if (t_check_status("(408)|(5\[0-9\]\[0-9\])")) {
	dr_disable("my_partition");

}
...
```
### `dr_match` usage

`dr_match` usage

```opensips
...
if ( dr_match( 1, "L" , $fU, ,"dids") )
	xlog("Full From Username $fU found in group 1 partition DIDS\\n");
...
if ( dr_match( 1, , $var(did) ) )
	xlog("DID $var(did) matches rules in group 1\\n");
...
```
