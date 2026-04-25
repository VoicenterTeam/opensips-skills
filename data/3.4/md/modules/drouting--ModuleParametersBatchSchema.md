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