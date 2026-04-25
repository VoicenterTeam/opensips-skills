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