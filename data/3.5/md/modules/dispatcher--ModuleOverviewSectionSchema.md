# dispatcher Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6333296)

3.2. [Most recently active contributors(1) to this module](#idp6469904)

**List of Examples**

1.1. [Setting the default database URL for dispatcher](#idp253040)

1.2. [Set the 'default' partition's “attrs\_avp” parameter](#idp5522208)

1.3. [Set the 'default' partition's “script\_attrs\_avp” parameter](#idp5527744)

1.4. [Use algo\_route for hashing:](#idp5533248)

1.5. [Use $avp(273) for hashing:](#idp5538896)

1.6. [Use combination of PVs for hashing:](#idp5540368)

1.7. [Set the “setid\_pvar” parameter](#idp5545024)

1.8. [Set the “ds\_ping\_method” parameter](#idp5550624)

1.9. [Set the “ds\_ping\_from” parameter](#idp5556240)

1.10. [Set the “ds\_ping\_interval” parameter](#idp5561712)

1.11. [Set the “ds\_ping\_maxfwd” parameter](#idp5566608)

1.12. [Set the “ds\_probing\_sock” parameter](#idp5571616)

1.13. [Set the “ds\_probing\_threshold” parameter](#idp5576752)

1.14. [Set the “ds\_probing\_mode” parameter](#idp5581936)

1.15. [Set the “ds\_probing\_list” parameter](#idp5587104)

1.16. [Set the 'default' partition's “ds\_define\_blacklist” parameter](#idp5592688)

1.17. [Set the “options\_reply\_codes” parameter](#idp5597872)

1.18. [Set the 'default' partition's “dst\_avp” parameter](#idp5603840)

1.19. [Set the 'default' partition's “grp\_avp” parameter](#idp5609520)

1.20. [Set the 'default' partition's “cnt\_avp” parameter](#idp5615184)

1.21. [Set the 'default' partition's “sock\_avp” parameter](#idp5620864)

1.22. [Set the “pvar\_algo\_pattern” parameter](#idp5627392)

1.23. [Set the `persistent_state` parameter](#idp5633296)

1.24. [Set `cluster_id` parameter](#idp5648240)

1.25. [Set `cluster_sharing_tag` parameter](#idp5656448)

1.26. [Set `cluster_probing_mode` parameter](#idp5669984)

1.27. [Define a new partition called 'voicemail'](#idp5675776)

1.28. [Define the 'trunks' partition and make it the 'default' partition, so we avoid loading the 'dispatcher' table](#idp5677504)

1.29. [Set the default table name](#idp5682880)

1.30. [Set “setid\_col” parameter](#idp5688816)

1.31. [Set “destination\_col” parameter](#idp5693712)

1.32. [Set “state\_col” parameter](#idp5698608)

1.33. [Set “weight\_col” parameter](#idp5703504)

1.34. [Set “priority\_col” parameter](#idp5708496)

1.35. [Set “attrs\_col” parameter](#idp5713504)

1.36. [Set “socket\_col” parameter](#idp5718512)

1.37. [Set “probe\_mode\_col” parameter](#idp5723520)

1.38. [Set the `fetch_freeswitch_load` parameter](#idp5735136)

1.39. [Set the `max_freeswitch_weight` parameter](#idp5742352)

1.40. [`ds_select_dst` usage](#idp5776704)

1.41. [`ds_count` usage](#idp5809824)

1.42. [`ds_is_in_list` usage](#idp5823568)

1.43. [`ds_count` usage](#idp5834976)

1.44. [`ds_count` usage](#idp5844992)

1.45. [OpenSIPS config script - sample dispatcher usage](#idp5913344)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This modules implements a dispatcher for destination addresses. It computes hashes over various parts of the request and selects an address from a destination set. The selected address may then either overwrite the R-URI of a SIP request or be used as an outbound proxy.

The module can be used as a stateless load balancer, having no guarantee of fair distribution.

For the distribution algorithm, the module allows the definition of weights for the destination. This is useful in order to get a different ratio of traffic between destinations.

Starting with version 2.1, the dispatcher module keeps its destination sets into different partitions. Each partition is described by its own "db\_url", "table\_name", "dst\_avp", "grp\_avp", "cnt\_avp", "sock\_avp", "attr\_avp", "blacklists", "ping\_from", "ping\_method" and "persistent\_state" set of attributes. Setting any of these module parameters will only alter the "default" partition's properties.

In order to create a new partition, the [partition](#param_partition "1.3.26.�partition (string)") parameter can be used. If none of the 8 partition specific parameters are defined for the "default" partition, then this partition will not be created. Once the "default" partition is created, any undefined parameter from other partitions will inherit the value of the corresponding parameter of the "default" partition. If there is no "default" partition, the default value specified in the parameter's description will be used. Finally, note that each dispatcher table specified using the "table\_name" partition attribute requires a corresponding "version" table record within the partition's database, specified through "db\_url".

Since version 2.1, the "flags" parameter has been moved to ds\_select\_dst() and ds\_select\_domain() along with "force\_dst" and "use\_default" flags.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS modules

The following modules must be loaded before this module:

*   _TM - only if active recovery of failed hosts is required_.
    
*   _clusterer_ - only if "cluster\_id" option is enabled.
    
*   _database_ - one of the DB SQL modules
    
*   _freeswitch - only if "fetch\_freeswitch\_stats" is enabled._.
    

### 1.2.2.�External libraries or applications

The following libraries or applications must be installed before running OpenSIPS with this module:

*   _none_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

The default DB connection of the module, overriding the global 'db\_default\_url' setting. Once specified, partitions which are missing the 'db\_url' property will inherit their URL from this value.

_Default value is “NULL”._

**Example�1.1.�Setting the default database URL for dispatcher**

...
modparam("dispatcher", "db\_url", "mysql://user:passwb@localhost/database")
...

  

### 1.3.2.�`attrs_avp` (str)

The name of the avp to contain the attributes string of the current destination. When a destination is selected, automatically, this AVP will provide the attributes string - this is an opaque string (from OpenSIPS point of view) : it is loaded from destination definition ( via DB) and blindly provided in the script. Setting this parameter will only change the default partition's attrs\_avp. Use the partition parameter to create and alter other partitions.

### Note

_Default value is “null” - don't provide ATTRIBUTEs._

**Example�1.2.�Set the 'default' partition's “attrs\_avp” parameter**

...
modparam("dispatcher", "attrs\_avp", "$avp(272)")
...

  

### 1.3.3.�`script_attrs_avp` (str)

Name of the avp to contain the script attributes string of the current destination. When a destination is selected, automatically, this AVP will provide the attributes string - this is an opaque string (from OpenSIPS point of view) : it is provided via the ds\_push\_script\_attrs MI or SCRIPT function.

### Note

_Default value is “null” - don't provide SCRIPT ATTRIBUTEs._

**Example�1.3.�Set the 'default' partition's “script\_attrs\_avp” parameter**

...
modparam("dispatcher", "attrs\_avp", "$avp(script\_attrs)")
...

  

### 1.3.4.�`algo_route` (str)

Name of the route to be called when using algo 10. The route will get as param the dst\_uri, attrs and script\_attrs for the dispatcher entry that currently needs to be evaluated ( available via $param(1), $param(2) and $param(3) or via $param(dst\_uri), $param(attrs) and $param(script\_attrs) when the route gets called ). The return value of the route is considered by the dispatcher module to be the current weight of the dispatcher entry, and when using the 10 algo, the dispatcher entries are sorted in ascending weight order. If the returned value from the algo route is negative, the current dispatcher entry will be automatically skipped from usage

_Default value is “null” - disabled._

**Example�1.4.�Use algo\_route for hashing:**

...
modparam("dispatcher", "algo\_route", "my\_dispatcher\_logic)")
...
route\[my\_dispatcher\_logic\] {
        $var(curent\_score) = 0;
        xlog("DISPATCHER - Running logic for $param(dst\_uri) with attrs $param(attrs) and script attrs $param(script\_attrs) \\n");

	# decide to penalize current dispatcher entry, based on your logic
	if (my\_condition\_here)
		$var(current\_score) = $var(current\_score) + 10;

        return $var(rc);
}

  

### 1.3.5.�`hash_pvar` (str)

String with PVs used for the hashing algorithm 7.

### Note

You must set this parameter if you want do hashing over custom message parts.

_Default value is “null” - disabled._

**Example�1.5.�Use $avp(273) for hashing:**

...
modparam("dispatcher", "hash\_pvar", "$avp(273)")
...

  

**Example�1.6.�Use combination of PVs for hashing:**

...
modparam("dispatcher", "hash\_pvar", "hash the $fU@$ci")
...

  

### 1.3.6.�`setid_pvar` (str)

The name of the PV where to store the set ID (group ID) when calling ds\_is\_in\_list() without group parameter (third parameter).

_Default value is “null” - don't set PV._

**Example�1.7.�Set the “setid\_pvar” parameter**

...
modparam("dispatcher", "setid\_pvar", "$var(setid)")
...

  

### 1.3.7.�`ds_ping_method` (string)

With this Method you can define, with which method you want to probe the failed gateways. This method is only available, if compiled with the probing of failed gateways enabled.

Use the 'partition' parameter if you want to define the ping method other partitions.

_Default value is “OPTIONS”._

**Example�1.8.�Set the “ds\_ping\_method” parameter**

...
modparam("dispatcher", "ds\_ping\_method", "INFO")
...

  

### 1.3.8.�`ds_ping_from` (string)

With this Method you can define the "From:"-Line for the request, sent to the failed gateways. This method is only available, if compiled with the probing of failed gateways enabled.

Use the 'partition' parameter if you want to define the "From:" ping header of other partitions.

_Default value is “sip:dispatcher@localhost”._

**Example�1.9.�Set the “ds\_ping\_from” parameter**

...
modparam("dispatcher", "ds\_ping\_from", "sip:proxy@sip.somehost.com")
...

  

### 1.3.9.�`ds_ping_interval` (int)

With this Method you can define the interval for sending a request to a failed gateway. This parameter is only used, when the TM-Module is loaded. If set to “0”, the pinging of failed requests is disabled.

_Default value is “0” (disabled)._

**Example�1.10.�Set the “ds\_ping\_interval” parameter**

...
modparam("dispatcher", "ds\_ping\_interval", 30)
...

  

### 1.3.10.�`ds_ping_maxfwd` (int)

This parameter allows you to enforce a specific Max-Forward value for the SIP pinging requests generated by the Dispatcher modules. If not explicitly set, no value will be enforced and it let the Transaction Layer (TM module) to set a default Max-Forward value.

The accepted values are any positive integer values, including the “0” value.

**Example�1.11.�Set the “ds\_ping\_maxfwd” parameter**

...
modparam("dispatcher", "ds\_ping\_maxfwd", 2)
...

  

### 1.3.11.�`ds_probing_sock` (str)

A socket description \[proto:\]host\[:port\] of the local socket (which is used by OpenSIPS for SIP traffic) to be used (if multiple) for sending the probing messages from.

_Default value is “NULL(none)”._

**Example�1.12.�Set the “ds\_probing\_sock” parameter**

...
modparam("dispatcher", "ds\_probing\_sock", "udp:192.168.1.100:5077")
...

  

### 1.3.12.�`ds_probing_threshold` (int)

If you want to set a gateway into probing mode, you will need a specific number of requests until it will change from "active" to probing. The number of attempts can be set with this parameter.

_Default value is “3”._

**Example�1.13.�Set the “ds\_probing\_threshold” parameter**

...
modparam("dispatcher", "ds\_probing\_threshold", 10)
...

  

### 1.3.13.�`ds_probing_mode` (int)

Controls what gateways are tested to see if they are reachable. If set to 0, only the gateways with state PROBING are tested, if set to 1, all gateways are tested. If set to 1 and the response is 408 (timeout), an active gateway is set to PROBING state.

_Default value is “0”._

**Example�1.14.�Set the “ds\_probing\_mode” parameter**

...
modparam("dispatcher", "ds\_probing\_mode", 1)
...

  

### 1.3.14.�`ds_probing_list` (str)

Defines a list of one or more setids that limits which destinations are probed if probing is active. This is useful when multiple proxies share the same dispatcher table, but you want to limit which ones are responsible for probing specific destinations.

_Default value is “NULL (probe all sets)”._

**Example�1.15.�Set the “ds\_probing\_list” parameter**

...
modparam("dispatcher", "ds\_probing\_list", "1,2,3")
...

  

### 1.3.15.�`ds_define_blacklist` (str)

Defines a blacklist based on a dispatching setid from the 'default' partition. This list will contain the IPs (no port, all protocols) of the destinations matching the given setid. Use the 'partition' parameter if you want to define blacklists based on other partitions' sets.

Multiple instances of this param are allowed.

_Default value is “NULL”._

**Example�1.16.�Set the 'default' partition's “ds\_define\_blacklist” parameter**

...
modparam("dispatcher", "ds\_define\_blacklist", "list= 1,4,3")
modparam("dispatcher", "ds\_define\_blacklist", "blist2= 2,10,6")
...

  

### 1.3.16.�`options_reply_codes` (str)

This parameter must contain a list of SIP reply codes separated by comma. The codes defined here will be considered as valid reply codes for OPTIONS messages used for pinging, apart for 200.

_Default value is “NULL”._

**Example�1.17.�Set the “options\_reply\_codes” parameter**

...
modparam("dispatcher", "options\_reply\_codes", "501, 403")
...

  

### 1.3.17.�`dst_avp` (str)

This is mainly for internal usage and represents the name of the avp which will hold the list with addresses, in the order they have been selected by the chosen algorithm. If use\_default is 1, the value of last dst\_avp\_id is the last address in destination set. The first dst\_avp\_id is the selected destinations. All the other addresses from the destination set will be added in the avp list to be able to implement serial forking. Setting this parameter will only change the default partition's dst\_avp. Use the partition parameter to create and alter other partitions.

_For the 'default' partition the default value is “$avp(ds\_dst\_failover)”. For any other partition, the default value is “$avp(ds\_dst\_failover\_partitionname)”._

**Example�1.18.�Set the 'default' partition's “dst\_avp” parameter**

...
modparam("dispatcher", "dst\_avp", "$avp(271)")
...

  

### 1.3.18.�`grp_avp` (str)

This is mainly for internal usage and represents the name of the avp storing the group id of the destination set. Good to have it for later usage or checks. Setting this parameter will only change the default partition's grp\_avp. Use the partition parameter to create and alter other partitions.

_For the 'default' partition the default value is “$avp(ds\_grp\_failover)”. For any other partition, the default value is “$avp(ds\_grp\_failover\_partitionname)”._

**Example�1.19.�Set the 'default' partition's “grp\_avp” parameter**

...
modparam("dispatcher", "grp\_avp", "$avp(273)")
...

  

### 1.3.19.�`cnt_avp` (str)

This is mainly for internal usage and represents the name of the avp storing the number of destination addresses kept in dst\_avp avps. Setting this parameter will only change the default partition's cnt\_avp. Use the partition parameter to create and alter other partitions.

_For the 'default' partition the default value is “$avp(ds\_cnt\_failover)”. For any other partition, the default value is “$avp(ds\_cnt\_failover\_partitionname)”._

**Example�1.20.�Set the 'default' partition's “cnt\_avp” parameter**

...
modparam("dispatcher", "cnt\_avp", "$avp(274)")
...

  

### 1.3.20.�`sock_avp` (str)

This is mainly for internal usage and represents the name of the avp storing the sockets to be used for the destination addresses kept in dst\_avp avps. Setting this parameter will only change the default partition's sock\_avp. Use the partition parameter to create and alter other partitions.

_For the 'default' partition the default value is “$avp(ds\_sock\_failover)”. For any other partition, the default value is “$avp(ds\_sock\_failover\_partitionname)”._

**Example�1.21.�Set the 'default' partition's “sock\_avp” parameter**

...
modparam("dispatcher", "sock\_avp", "$avp(275)")
...

  

### 1.3.21.�`pvar_algo_pattern` (str)

This parameter is used by the PVAR(9) algorithm to specify the pseudovariable pattern used to detect the load of each destination. The name of the pseudovariable should contain the string “%u”, which will be internally replaced by the module with the uri of the destination. The string “%i” can also be used and will be replaced with the set ID of the destination (useful in cases where same uri exists in multiple sets).

_Default value is “none”._

**Example�1.22.�Set the “pvar\_algo\_pattern” parameter**

...
modparam("dispatcher", "pvar\_algo\_pattern", "$stat(load\_%u)")
...

  

### 1.3.22.�`persistent_state` (int)

Specifies whether the _state_ column should be loaded at startup and flushed during runtime or not for the "default" partition.

Use the 'partition' parameter if you want to define the persistent state of other partitions.

_Default value is “1” (enabled)._

**Example�1.23.�Set the `persistent_state` parameter**

...
# disable all DB operations with the state of a destination
modparam("dispatcher", "persistent\_state", 0)
...

  

### 1.3.23.�`cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used in dispatcher module for two purposes: for sharing the status of the destinations and for controlling the pinging to destinations.

If clustering enbled, the module will automatically share changes over the status of the destinations with the other OpenSIPS instances that are part of a cluster. Whenever such a status changes (following an MI command, a probing result, a script command), the module will replicate this status change to all the nodes in this given cluster.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to destinations. See the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.3.24.�cluster_sharing_tag (string)") option.

This OpenSIPS cluster exposes the **"dispatcher-status-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the [clusterer](clusterer) module.

_Default value is “0 (none)”._

**Example�1.24.�Set `cluster_id` parameter**

...
# replicate destination status with all OpenSIPS in cluster ID 9
modparam("dispatcher", "cluster\_id", 9)
...

  

### 1.3.24.�`cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform the self-triggered actions in the module. Such actions may be the destination probing (see also the [cluster\_probing\_mode](#param_cluster_probing_mode "1.3.25.�cluster_probing_mode (string)") parameter) or sharing the changes in the destination status. If defined, only the node with active status of this tag will perform the actions (pinging and sharing status).

The [cluster\_id](#param_cluster_id "1.3.23.�cluster_id (integer)") must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will share the status changes.

_Default value is “empty (none)”._

**Example�1.25.�Set `cluster_sharing_tag` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("dispatcher", "cluster\_id", 9)
modparam("dispatcher", "cluster\_sharing\_tag", "vip")
...

  

### 1.3.25.�`cluster_probing_mode` (string)

This paramter controls how the probing/pinging should be done when using the clustering support. It is about which node in the cluster pings which gateway/destination.

The [cluster\_id](#param_cluster_id "1.3.23.�cluster_id (integer)") must be defined for this option to work.

The supported probing modes are:

*   **"all"** - all the nodes in the cluster will independetly ping all the defined destinations, an "all" pings "all" mode.
    
*   **"by-shtag"** - all the destinations are pinged by only one node in the cluster, the node having the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.3.24.�cluster_sharing_tag (string)") active. By activating the sharing tag on a different node, the pinging duty will be transfered to another node in the cluster.
    
*   **"distributed"** - the pinging effort is distributed across all the nodes in the cluster, so each node will ping a sub-set of the overall set of destinations. Still all the destinations will get pinged (and only once per pinging cycle). The re-partitioning of the pinging effort over the available nodes in the cluster is automatically done when new nodes are joining or nodes are dropping out. Still there is no guaratee on which node will be responsible for pinging which destination.
    

_Default value is “"all"”._

**Example�1.26.�Set `cluster_probing_mode` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
modparam("dispatcher", "cluster\_id", 9)
modparam("dispatcher", "cluster\_sharing\_tag", "vip")
modparam("dispatcher", "cluster\_probing\_mode", "by-shtag")
...
# the pinging effort is distributed across all the nodes
modparam("dispatcher", "cluster\_id", 9)
modparam("dispatcher", "cluster\_probing\_mode", "distributed")
...

  

### 1.3.26.�`partition` (string)

Define a new partition (data source) with the following properties: "db\_url", "table\_name", "dst\_avp", "grp\_avp", "cnt\_avp", "sock\_avp", "attrs\_avp", "script\_attrs", "ds\_define\_blacklist". All these properties are optional, having appropriate default values.

The syntax is: "partition\_name: param1 = value1; param2 = value2". Each value format is the same as the one used to define a specific parameter using modparam.

This parameter may be set multiple times, thus defining as many partitions as needed. The 'default' partition may also be defined using this parameter.

**Example�1.27.� Define a new partition called 'voicemail'**

...
modparam("dispatcher", "partition",
                "voicemail:
                    db\_url = mysql://user:passwd@localhost/database;
                    table\_name = dispatcher;
                    attrs\_avp = $avp(ds\_attr\_vm);
                    ds\_define\_blacklist = list2 = 4,6")
...

  

**Example�1.28.� Define the 'trunks' partition and make it the 'default' partition, so we avoid loading the 'dispatcher' table**

...
modparam("dispatcher", "partition",
                "trunks:
                    db\_url = mysql://user:passwd@localhost/database;
                    table\_name = dispatcher\_trunks;
                    attrs\_avp = $avp(ds\_attr\_trunks)")
modparam("dispatcher", "partition", "default: trunks")
...

  

### 1.3.27.�`table_name` (string)

The default name of the table from which to load dispatcher destinations. Partitions which are missing the 'table\_name' property will inherit their table name from this value.

_Default value is “dispatcher”._

**Example�1.29.�Set the default table name**

...
modparam("dispatcher", "table\_name", "my\_dispatcher")
...

  

### 1.3.28.�`setid_col` (string)

The column's name in the database storing the gateway's group id.

_Default value is “setid”._

**Example�1.30.�Set “setid\_col” parameter**

...
modparam("dispatcher", "setid\_col", "groupid")
...

  

### 1.3.29.�`destination_col` (string)

The column's name in the database storing the destination's sip uri.

_Default value is “destination”._

**Example�1.31.�Set “destination\_col” parameter**

...
modparam("dispatcher", "destination\_col", "uri")
...

  

### 1.3.30.�`state_col` (string)

The column's name in the database storing the state of the destination uri.

_Default value is “state”._

**Example�1.32.�Set “state\_col” parameter**

...
modparam("dispatcher", "state\_col", "dststate")
...

  

### 1.3.31.�`weight_col` (string)

The column's name in the database storing the weight for destination uri.

_Default value is “weight”._

**Example�1.33.�Set “weight\_col” parameter**

...
modparam("dispatcher", "weight\_col", "dstweight")
...

  

### 1.3.32.�`priority_col` (string)

The column's name in the database storing the priority for destination uri.

_Default value is “priority”._

**Example�1.34.�Set “priority\_col” parameter**

...
modparam("dispatcher", "priority\_col", "dstprio")
...

  

### 1.3.33.�`attrs_col` (string)

The column's name in the database storing the attributes (opaque string) for destination uri.

_Default value is “attrs”._

**Example�1.35.�Set “attrs\_col” parameter**

...
modparam("dispatcher", "attrs\_col", "dstattrs")
...

  

### 1.3.34.�`socket_col` (string)

The column's name in the database storing the socket (as string) for destination uri.

_Default value is “socket”._

**Example�1.36.�Set “socket\_col” parameter**

...
modparam("dispatcher", "socket\_col", "my\_sock")
...

  

### 1.3.35.�`probe_mode_col` (string)

The column's name in the database storing the probe\_mode (as string) for destination.

_Default value is “probe\_mode”._

**Example�1.37.�Set “probe\_mode\_col” parameter**

...
modparam("dispatcher", "probe\_mode\_col", "probing")
...

  

### 1.3.36.�`fetch_freeswitch_stats` (integer)

If enabled, FreeSWITCH destinations may have dynamic dispatching weights, refreshed at runtime, using the FreeSWITCH Event Socket Layer. For these destinations, an Event Socket Layer URL must be provisioned into the "weight" column, instead of an integer string. Some example values: _"fs://:password@freeswitch.example.com"_ or _"fs://user:password@127.0.0.1:8021"_. The default ESL port is 8021.

OpenSIPS will establish a connection with the given socket and periodically calculate/update the weights of these destinations using statistics pushed by the FreeSWITCH box.

The value for an automatically calculated weight ranges between **0 - 100**. This is helpful when grouping normal destinations with FreeSWITCH ones.

The dynamic weights are recalculated every _event\_heartbeat\_interval_ seconds (see the "freeswitch" OpenSIPS module for more details regarding this setting), as the stats from FreeSWITCH are expected to arrive. The update formula is shown below (FreeSWITCH stats are highlighted in bold):

_weight = 100 \* (**Idle-CPU** / 100) \* (1 - **Session-Count** / **Max-Sessions**)_

_Default value is **0** (disabled)._

**Example�1.38.�Set the `fetch_freeswitch_load` parameter**

...
modparam("dispatcher", "fetch\_freeswitch\_stats", 1)
...

  

### 1.3.37.�`max_freeswitch_weight` (integer)

The maximum weight of a FreeSWITCH ESL-enabled destination. This value is also used during startup/reload, when no stats from FreeSWITCH are available yet.

Important: When mixing normal destinations with FreeSWITCH-enabled ones in the same dispatching set, OpenSIPS will truncate any weight values that are larger than **max\_freeswitch\_weight** to the value of this parameter!

NOTE: OpenSIPS internally rounds weights to nearest integer, so larger max weight values will more accurately represent the current load on the FreeSWITCH boxes! For example, if you set this parameter to 1, the box will receive no traffic whenever either its CPU or session usage goes past 50%!

_Default value is **100**._

**Example�1.39.�Set the `max_freeswitch_weight` parameter**

...
modparam("dispatcher", "max\_freeswitch\_weight", 1000)
...

  

## 1.4.�Exported Functions

### 1.4.1.� `ds_select_dst(set, alg, [flags], [partition], [max_res])`

The method selects a destination from the given set of addresses. It will overwrite the destination URI (_$du_) of a SIP request.

Meaning of the parameters is as follows:

*   _set (int)_ - a set identifier from which to select destinations
    
*   _alg (int)_ - the algorithm used to select the destination address
    
    *   “0” - hash over callid
        
    *   “1” - hash over from uri.
        
    *   “2” - hash over to uri.
        
    *   “3” - hash over request-uri.
        
    *   “4” - weighted round-robin (next destination). the destination's weight determines how many times it is chosen before going to the next one
        
    *   “5” - hash over authorization-username (Proxy-Authorization or "normal" authorization). If no username is found, weighted round-robin is used.
        
    *   “6” - random (using rand()).
        
    *   “7” - hash over the content of PVs string. Note: This works only when the parameter hash\_pvar is set.
        
    *   “8” - the first entry in set is chosen.
        
    *   “9” - The _pvar\_algo\_pattern_ parameter is used to determine the load on each server. If the parameter is not specified, then the first entry in the set is chosen.
        
    *   “10” - The _algo\_route_ OpenSIPS route is called for each dispatcher entry in the setid, in order to decide the routing order. See the algo\_route parameter for usage examples
        
    *   “X” - if the algorithm is not implemented, the first entry in set is chosen.
        
    
*   _flags (string, optional)_ - a string of flag-settings which tweak the function's behavior:
    
    *   'f' (failover support): causes the remaining addresses from the destination set to be stored within an internally managed AVP. You may then use [ds\_next\_dst()](#func_ds_next_dst "1.4.3.� ds_next_dst([partition])") to switch to the next address, thus achieving serial forking to all possible destinations
        
    *   'u' (user only): will specify that only the URI user part will be used for hashing
        
    *   'd' (use default): use the last address in destination set as last option to send the message
        
    *   'a' (append destinations): append any new destinations to the current destination list, rather than rewriting the list
        
    
    The flags are being kept per partition.
    
*   _partition (string, optional)_ - name of a DB partition
    
*   _max\_res (int, optional)_ - signifies that only a maximum number of destinations shall be included in the specified failover AVP. This allows having multiple destinations while also preventing excessive failover attempts in case a number is bound to fail globally.
    

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

**Example�1.40.�`ds_select_dst` usage**

...
if (!ds\_select\_dst(1, 0)) {
	xlog("ERROR: no active destinations found!\\n");
	send\_reply(503, "Service Unavailable");
	exit;
}
...
ds\_select\_dst(1, 0, , "fs\_boxes", 5);
...
ds\_select\_dst(1, 0, "fUD", "ask\_boxes");
...
ds\_select\_dst(2, 0, "fud", "pstn\_gws", 5);
ds\_select\_dst(3, 1, "fua", "pstn\_gws", 2);
...
# using variables
$var(part) = "pstn\_gws"
$var(setid) = 1;
$var(alg) = 4;
$var(flags) = "fdu";
$var(max\_res) = 2;
ds\_select\_dst($var(setid), $var(alg), $var(flags), $var(part), $var(max\_res));
...

  

### 1.4.2.� `ds_select_domain(set, alg, [flags], [partition], [max_res])`

The method selects a destination from addresses set and rewrites the hostname and port parts of the Request-URI (_$ru_). Its parameters have same meaning as in [ds\_select\_dst()](#func_ds_select_dst "1.4.1.� ds_select_dst(set, alg, [flags], [partition], [max_res])").

If the "f" (failover support) flag is present, the rest of the addresses from the destination set will be stored in an internally managed AVP. You may then use [ds\_next\_domain()](#func_ds_next_domain "1.4.4.� ds_next_domain([partition])") to switch to the next address in the list, thus achieving serial forking to all possible destinations.

This function can be used from REQUEST\_ROUTE, BRANCH\_ROUTE and FAILURE\_ROUTE.

### 1.4.3.� `ds_next_dst([partition])`

Takes the next destination address from the AVPs with id partition.'dst\_avp\_id' and sets the dst\_uri (outbound proxy address). If "partition" is omitted, the default partition will be used.This function is using the flags set in ds\_select\_dst or ds\_select\_domain.

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

### 1.4.4.� `ds_next_domain([partition])`

Takes the next destination address from the AVPs with id partition.'dst\_avp\_id' and sets the domain part of the request uri. If "partition" is omitted, the default partition will be used.This function is using the flags set in ds\_select\_dst or ds\_select\_domain.

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

### 1.4.5.� `ds_mark_dst([state], [partition])`

Mark the last used address from partition's destination set as inactive ("i"/"I"/"0"), active ("a"/"A"/"1") or probing ("p"/"P"/"2"). With this function, an automatic detection of failed gateways can be implemented. When an address is marked as inactive or probing, it will be ignored by [ds\_select\_dst()](#func_ds_select_dst "1.4.1.� ds_select_dst(set, alg, [flags], [partition], [max_res])") and [ds\_select\_domain()](#func_ds_select_domain "1.4.2.� ds_select_domain(set, alg, [flags], [partition], [max_res])"). If "partition" is omitted, the default partition will be used. This function is using the flags set in [ds\_select\_dst()](#func_ds_select_dst "1.4.1.� ds_select_dst(set, alg, [flags], [partition], [max_res])") or [ds\_select\_domain()](#func_ds_select_domain "1.4.2.� ds_select_domain(set, alg, [flags], [partition], [max_res])").

Possible parameters:

*   state (string, optional) - new state for the last attempted destination. Possible values:
    
    *   _"i", "I" or "0" (default)_ - the last destination should be set to inactive and will be ignored in future requests.
        
    *   _"a", "A" or "1"_ - the last destination should be set to active.
        
    *   _"p", "P" or "2"_ - the last destination will be set to probing. Note: You will need to call this function "threshold"-times, before it will be actually set to probing.
        
    
*   partition (string, optional) - name of a DB partition, otherwise the default one will be used
    

This function can be used from REQUEST\_ROUTE and FAILURE\_ROUTE.

### 1.4.6.� `ds_count(set, state_filter, res_var, [partition])`

Returns the number of active, inactive or probing destinations in a partition's set, or combinations between these properties.

Meaning of the parameters:

*   _set (int)_ - a set of dispatching destinations
    
*   _state\_filter (string)_ - which destinations should be counted. Either active ("a", "A" or "1"), inactive ("i", "I" or "0"), probing ("p", "P" or "2") destinations or different combinations between these flags, such as "pI", "1i", "ipA"...
    
*   _res\_var (variable)_ - a variable which will hold the integer result
    
*   _partition (string, optional)_ - name of a DB partition. If omitted, the "default" partition will be used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.41.�`ds_count` usage**

...
if (ds\_count(1, "a", $avp(result))) {
	...
}
...
if (ds\_count($avp(set), "ip", $avp(result), $avp(partition))) {
	...
}
...

  

### 1.4.7.� `ds_is_in_list(ip, port, [set], [partition], [active_only], [pattern])`

This function returns _true_ only if "ip" and "port" point to a host from the given dispatcher "set".

Meaning of the parameters:

*   _ip (string)_ - an IPv4 or IPv6 address to test against the dispatcher "set"
    
*   _port (int)_ - a port to test against the dispatcher list. Use a _0_ value in order to match any port
    
*   _set (int, optional)_ - a dispatcher set identifier to test against. If missing, all sets will be checked. The _\-1_ set is a special value, acting as a "check all sets" wildcard.
    
*   _partition (string, optional)_ - name of a DB partition
    
*   _active\_only (int, optional)_ - specify a non-zero value in order to only search through the active destinations (ignore the ones in probing and inactive states)
    
*   _pattern (string, optional)_ - a glob pattern used to match destination attributes. If the destination ip and port matches but the pattern does not match the destination's attribute, the function will fail.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE and ONREPLY\_ROUTE.

**Example�1.42.�`ds_is_in_list` usage**

...
if (ds\_is\_in\_list($si, $sp)) {
	# source IP:PORT is in a dispatcher list
}
...
if (ds\_is\_in\_list($rd, $rp, 2)) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "default" partition
}
...
if (ds\_is\_in\_list($rd, $rp, 2, "part2")) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "part2" partition
}
...

  

### 1.4.8.� `ds_push_script_attrs(script_attr, ip, port, set, [partition])`

Set the script attrs for the dispatcher entry defined by IP, Port, setid and partition.

Meaning of the parameters:

*   _script\_attr (str or pvar)_ - The new script attributes
    
*   _IP (string)_ - IP address for which we are pushing script attributes
    
*   _port (int)_ Port for which we are pushing script attributes
    
*   _setid (int)_ Setid for which we are pushing script attributes
    
*   _partition (string, optional)_ - name of a DB partition. If omitted, the "default" partition will be used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.43.�`ds_count` usage**

...
if (ds\_push\_script\_attrs($var(my\_attributes),$si , $sp, 1, 'my\_partition')) {
	...
}
...

  

### 1.4.9.� `ds_get_script_attrs(uri, set, [partition], out_attrs)`

Get the script attrs for the dispatcher entry defined by the URI, setid and partition.

Meaning of the parameters:

*   _URI (string)_ - URI address for which we are getting script attributes
    
*   _setid (int)_ Setid for which we are pushing script attributes
    
*   _partition (string, optional)_ - name of a DB partition. If omitted, the "default" partition will be used.
    
*   _out\_atrs (pvar)_ - name of a variable where we will store the script attrs.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE

**Example�1.44.�`ds_count` usage**

...
if (ds\_push\_script\_attrs($var(my\_attributes),$si , $sp, 1, 'my\_partition')) {
	...
}
...

  

## 1.5.�Exported MI Functions

### 1.5.1.� `ds_set_state`

Sets the status for a destination address (can be use to mark the destination as active or inactive).

Name: _ds\_set\_state_

Parameters:

*   _state_ : state of the destination address
    
    *   “a”: active
        
    *   “i”: inactive
        
    *   “p”: probing
        
    
*   _group_: partition name followed by colon and destination group id. If the partition name is omitted, the default partition will be used
    
*   _address_: address of the destination in the group
    

MI FIFO Command Format:

opensips-cli -x mi ds\_set\_state a 2 sip:10.0.0.202

### 1.5.2.� `ds_list`

It lists the groups and included destinations of all the partitions.

Name: _ds\_list_

Parameters:

*   _full_ (optional) - adds the weight, priority and description fields to the listing
    
*   _partition_ (optional) - return only destinations and sets in the provided partition.
    

MI FIFO Command Format:

opensips-cli -x mi ds\_list

### 1.5.3.� `ds_reload`

It reloads the groups and included destinations for a specified partition or all partitions.

Name: _ds\_reload_

Parameters:

*   _partition_ (optional) - name of the partition to be reloaded. default partition is "default".
    
*   _inherit\_state_ (optional) : whether inherit old state of the destination , default is y.
    
    *   “n”: no inherit state
        
    *   “y”: inherit state
        
    

MI FIFO Command Format:

opensips-cli -x mi ds\_reload
opensips-cli -x mi ds\_reload inherit\_state=n

### 1.5.4.� `ds_push_script_attrs`

Pushes script attrs for the dispatcher entry defined by IP, Port, setid, and optionally partition.

Name: _ds\_push\_script\_attrs_

Parameters:

*   _attrs_ : new attributes to be pushed
    
*   _ip_: IP for which we are pushing script attributes
    
*   _port_: Port for which we are pushing script attributes
    
*   _setid_: Setid for which we are pushing script attributes
    
*   _partition ( optional )_: Partition for which we are pushing script attributes
    

MI FIFO Command Format:

#opensips-cli -x mi ds\_push\_script\_attrs '{"ping":"30000","load":"50"}' '192.168.0.107' 5091 1 main

## 1.6.�Exported Events

### 1.6.1.� `E_DISPATCHER_STATUS`

This event is raised when the dispatcher module marks a destination as activated or deactivated.

Parameters:

*   _partition_ - the partition name of the destination.
    
*   _group_ - the group of the destination.
    
*   _address_ - the address of the destination.
    
*   _status_ - _active_ if the destination gets activated or _inactive_ if the destination is detected unresponsive.
    

## 1.7.�Exported Status/Report Identifiers

The module provides the "dispatcher" Status/Report group, where each partition is defined as a separate SR identifier.

### 1.7.1.�`[partition_name]`

The status of these identifiers reflects the readiness/status of the cached data (if available or not when being loaded from DB):

*   _\-2_ - no data at all (initial status)
    
*   _\-1_ - no data, initial loading in progress
    
*   _1_ - data loaded, partition ready
    
*   _2_ - data available, a reload in progress
    

Reload reporting:

In terms of date reloading, the following events will be reported:

*   starting DB data loading
    
*   DB data loading failed, discarding
    
*   DB data loading successfully completed
    
*   N destination loaded (N discarded)
    

        {
            "Name": "default",
            "Reports": \[
                {
                    "Timestamp": 1652373212,
                    "Date": "Thu May 12 19:33:32 2022",
                    "Log": "starting DB data loading"
                },
                {
                    "Timestamp": 1652373212,
                    "Date": "Thu May 12 19:33:32 2022",
                    "Log": "DB data loading successfully completed"
                },
                {
                    "Timestamp": 1652373212,
                    "Date": "Thu May 12 19:33:32 2022",
                    "Log": "2 destinations loaded (0 discarded)"
                }
            \]
        }

	

### 1.7.2.�`[partition_name];events`

Destination switching reporting:

For reporting events related to the state changes of the destinations, the module provides separate identifiers (still one per partition). Why separate ones? The reports on state changing may be verbose and there is the risk of loose/discard important reports on reloads due to the high number of logs on state changes;

So, each partition will provide the identified "partition\_name;events" for reporting state changes of destinations, along with the reason of the change. This identifiers have a 200 records history before discarding the old ones.

        {
            "Name": "default;events",
            "Reports": \[
                {
                    "Timestamp": 1652373308,
                    "Date": "Thu May 12 19:35:08 2022",
                    "Log": "DESTINATION <sip:127.0.1.1>, set 1 switched to \[inactive\] due to negative probing reply\\n"
                },
                {
                    "Timestamp": 1652373308,
                    "Date": "Thu May 12 19:35:08 2022",
                    "Log": "DESTINATION <sip:127.0.1.2>, set 1 switched to \[inactive\] due to negative probing reply\\n"
                }
            \]
        },

	

For how to access and use the Status/Report information, please see [https://www.opensips.org/Documentation/Interface-StatusReport-3-3](>https://www.opensips.org/Documentation/Interface-StatusReport-3-3).

## 1.8.�Installation and Running

### 1.8.1.�OpenSIPS config file

Next picture displays a sample usage of dispatcher.

**Example�1.45.�OpenSIPS config script - sample dispatcher usage**

...
#
# sample config file for dispatcher module
#

socket= udp:\*:5060

udp\_workers = 2
check\_via = off     # (cmd. line: -v)
dns = off           # (cmd. line: -r)
rev\_dns = off       # (cmd. line: -R)

# for more info: opensips -h

# ------------------ module loading ----------------------------------
mpath = "/usr/lib/x86\_64-linux-gnu/opensips/modules"

loadmodule "maxfwd.so"
loadmodule "signaling.so"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "db\_mysql.so"
loadmodule "dispatcher.so"

loadmodule "proto\_udp.so"

# ----------------- setting module-specific parameters ---------------
modparam("dispatcher", "db\_url", "mysql://opensips:opensipsrw@localhost/opensips")

route {
	if (!mf\_process\_maxfwd\_header(10)) {
		send\_reply(483, "Too Many Hops");
		exit;
	}

	if (!ds\_select\_dst(2, 0)) {
		send\_reply(503, "Service Unavailable");
		exit;
	}

	t\_relay();
}

...

  

## Chapter�2.�Frequently Asked Questions

**2.1.**

Does _dispatcher_ provide a fair distribution?

There is no guarantee of that. You should do some measurements to decide what distribution algorithm fits better in your environment.

**2.2.**

Is _dispatcher_ dialog stateful?

No. Dispatcher is stateless, although some distribution algorithms are designed to select same destination for subsequent requests of the same dialog (e.g., hashing the call-id).

**2.3.**

What happened with the _ds\_is\_from\_list()_ function?

The function was replaced by the more generic _ds\_is\_in\_list()_ function that takes as parameters the IP and PORT to test against the dispatcher list.

ds\_is\_from\_list() == ds\_is\_in\_list("$si", "$sp")

**2.4.**

How is weight and priority used by the dispatcher in selecting a destination?

The _weight_ of a destination is currently used in the hashing algorithms and it increases the probability of it to be chosen(if we have two destinations with weights 1 respectively 4 than the second one is 4 times more likely to be selected than the other). The sum of all weights does not need to add up to a specific number. Weights are now used in the round-robin algorithm, a destination is chosen a number of times equal to its weight consecutively before going to the next destination.

The _priority_ field is used at ordering the destinations from a set. It does not affect the overall probability of a destination to be chosen. It is reflected when listing the destination, the field can definetly be used in further selecting algorithms.

**2.5.**

What happened with the _list\_file_ module parameter ?

The support for text file (for provisioning destinations) was dropped. Only the DB support (provisioning via a DB table) is now available - if you still want to use a text file for provisioning, use db\_text DB driver (DB emulated via text files)

**2.6.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.7.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable version should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mail regarding development versions or SVN snapshots should be send to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.8.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues)

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

173

110

3366

2036

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

111

72

1711

1441

3.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

82

39

3372

844

4.

Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu))

48

15

2153

846

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

46

37

602

175

6.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

43

17

1145

969

7.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

31

17

705

434

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

19

11

378

236

9.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

17

10

681

33

10.

Henning Westerholt ([@henningw](https://github.com/henningw))

11

7

93

125

  

**All remaining contributors**: Carsten Bock, Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Elena-Ramona Modroiu, Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), John Burke ([@john08burke](https://github.com/john08burke)), Klaus Darilion, Anca Vamanu, Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), wangdd, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Stanislaw Pitucha, Federico Cabiddu, Konstantin Bokarius, Andreas Granig, John Riordan, Aron Podrigal ([@ar45](https://github.com/ar45)), Juli�n Moreno Pati�o, Kevin McAllister, Roman Sevko, UnixDev, David Sanders, Edson Gellert Schubert.

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

Oct 2005 - Jun 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Aug 2012 - May 2025

3.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Mar 2012 - Dec 2023

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

May 2011 - Nov 2023

6.

wangdd

Apr 2023 - May 2023

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Jul 2022

8.

John Burke ([@john08burke](https://github.com/john08burke))

Feb 2021 - Jan 2022

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

10.

Roman Sevko

Oct 2019 - Oct 2019

  

**All remaining contributors**: Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Juli�n Moreno Pati�o, Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), David Sanders, Aron Podrigal ([@ar45](https://github.com/ar45)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Stanislaw Pitucha, Anca Vamanu, John Riordan, UnixDev, Kevin McAllister, Klaus Darilion, Carsten Bock, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Henning Westerholt ([@henningw](https://github.com/henningw)), Konstantin Bokarius, Edson Gellert Schubert, Federico Cabiddu, Elena-Ramona Modroiu, Andreas Granig, Andrei Pelinescu-Onciul, Jan Janak ([@janakj](https://github.com/janakj)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), wangdd, Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), John Burke ([@john08burke](https://github.com/john08burke)), Roman Sevko, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Jarrod Baumann ([@jarrodb](https://github.com/jarrodb)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Andrei Datcu ([@andrei-datcu](https://github.com/andrei-datcu)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Stanislaw Pitucha, Anca Vamanu, Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Carsten Bock, Edson Gellert Schubert, Elena-Ramona Modroiu.

_Documentation Copyrights:_

Copyright � 2005-2010 Voice Sistem SRL

Copyright � 2004 FhG FOKUS