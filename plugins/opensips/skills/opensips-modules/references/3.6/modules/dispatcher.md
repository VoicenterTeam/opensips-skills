# dispatcher Module Reference
<!-- generated-from: data/3.6/modules/dispatcher.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 dispatcher module. Read this file when configuring or debugging the dispatcher module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This modules implements a dispatcher for destination addresses. It computes hashes over various parts of the request and selects an address from a destination set. The selected address may then either overwrite the R-URI of a SIP request or be used as an outbound proxy.

The module can be used as a stateless load balancer, having no guarantee of fair distribution.

For the distribution algorithm, the module allows the definition of weights for the destination. This is useful in order to get a different ratio of traffic between destinations.

Starting with version 2.1, the dispatcher module keeps its destination sets into different partitions. Each partition is described by its own "db_url", "table_name", "dst_avp", "grp_avp", "cnt_avp", "sock_avp", "attr_avp", "blacklists", "ping_from", "ping_method" and "persistent_state" set of attributes. Setting any of these module parameters will only alter the "default" partition's properties.

In order to create a new partition, the [partition](#param_partition "1.3.26.partition (string)") parameter can be used. If none of the 8 partition specific parameters are defined for the "default" partition, then this partition will not be created. Once the "default" partition is created, any undefined parameter from other partitions will inherit the value of the corresponding parameter of the "default" partition. If there is no "default" partition, the default value specified in the parameter's description will be used. Finally, note that each dispatcher table specified using the "table_name" partition attribute requires a corresponding "version" table record within the partition's database, specified through "db_url".

Since version 2.1, the "flags" parameter has been moved to ds_select_dst() and ds_select_domain() along with "force_dst" and "use_default" flags.

## Dependencies

### OpenSIPs Modules

- `TM` — only if active recovery of failed hosts is required (optional)
- `clusterer` — only if "cluster_id" option is enabled (optional)
- `database` — one of the DB SQL modules
- `freeswitch` — only if "fetch_freeswitch_stats" is enabled (optional)

### External Libraries

None.

## Exported Parameters

### `algo_route` (string)

Name of the route to be called when using algo 10. The route will get as param the dst_uri, attrs and script_attrs for the dispatcher entry that currently needs to be evaluated ( available via $param(1), $param(2) and $param(3) or via $param(dst_uri), $param(attrs) and $param(script_attrs) when the route gets called ). The return value of the route is considered by the dispatcher module to be the current weight of the dispatcher entry, and when using the 10 algo, the dispatcher entries are sorted in ascending weight order. If the returned value from the algo route is negative, the current dispatcher entry will be automatically skipped from usage

*Default value is null.*

**Notes:** Default value is “null” - disabled.

**Example.** my_dispatcher_logic).

```opensips
modparam("dispatcher", "algo_route", "my_dispatcher_logic)")
```
### `attrs_avp` (string)

The name of the avp to contain the attributes string of the current destination. When a destination is selected, automatically, this AVP will provide the attributes string - this is an opaque string (from OpenSIPS point of view) : it is loaded from destination definition ( via DB) and blindly provided in the script. Setting this parameter will only change the default partition's attrs_avp. Use the partition parameter to create and alter other partitions.

*Default value is null.*

**Notes:** Default value is “null” - don't provide ATTRIBUTEs.

**Example.** $avp(272).

```opensips
modparam("dispatcher", "attrs_avp", "$avp(272)")
```
### `attrs_col` (string)

The column's name in the database storing the attributes (opaque string) for destination uri.

*Default value is attrs.*

**Example.** dstattrs.

```opensips
modparam("dispatcher", "attrs_col", "dstattrs")
```
### `cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used in dispatcher module for two purposes: for sharing the status of the destinations and for controlling the pinging to destinations. If clustering enbled, the module will automatically share changes over the status of the destinations with the other OpenSIPS instances that are part of a cluster. Whenever such a status changes (following an MI command, a probing result, a script command), the module will replicate this status change to all the nodes in this given cluster. The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to destinations. See the cluster_sharing_tag option. This OpenSIPS cluster exposes the "dispatcher-status-repl" capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have at least one node marked with the "seed" value as the clusterer.flags column/property in order to be fully functional. Consult the clusterer - Capabilities chapter for more details. For more info on how to define and populate a cluster (with OpenSIPS nodes) see the clusterer module.

*Default value is 0.*

**Notes:** This OpenSIPS cluster exposes the "dispatcher-status-repl" capability. The cluster must have at least one node marked with the "seed" value.

**Example.** 9.

```opensips
modparam("dispatcher", "cluster_id", 9)
```
### `cluster_probing_mode` (string)

This paramter controls how the probing/pinging should be done when using the clustering support. It is about which node in the cluster pings which gateway/destination. The cluster_id must be defined for this option to work. The supported probing modes are: "all" - all the nodes in the cluster will independetly ping all the defined destinations, an "all" pings "all" mode. "by-shtag" - all the destinations are pinged by only one node in the cluster, the node having the cluster_sharing_tag active. By activating the sharing tag on a different node, the pinging duty will be transfered to another node in the cluster. "distributed" - the pinging effort is distributed across all the nodes in the cluster, so each node will ping a sub-set of the overall set of destinations. Still all the destinations will get pinged (and only once per pinging cycle). The re-partitioning of the pinging effort over the available nodes in the cluster is automatically done when new nodes are joining or nodes are dropping out. Still there is no guaratee on which node will be responsible for pinging which destination.

*Default value is all.*

**Possible values:**

- all
- by-shtag
- distributed

**Notes:** The cluster_id must be defined for this option to work.

**Example.** by-shtag.

```opensips
modparam("dispatcher", "cluster_probing_mode", "by-shtag")
```
### `cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform the self-triggered actions in the module. Such actions may be the destination probing (see also the cluster_probing_mode parameter) or sharing the changes in the destination status. If defined, only the node with active status of this tag will perform the actions (pinging and sharing status). The cluster_id must be defined for this option to work. This is an optional parameter. If not set, all the nodes in the cluster will share the status changes.

*Default value is empty.*

**Notes:** The cluster_id must be defined for this option to work.

**Example.** vip.

```opensips
modparam("dispatcher", "cluster_sharing_tag", "vip")
```
### `cnt_avp` (string)

This is mainly for internal usage and represents the name of the avp storing the number of destination addresses kept in dst_avp avps. Setting this parameter will only change the default partition's cnt_avp. Use the partition parameter to create and alter other partitions.

*Default value is For the 'default' partition the default value is “$avp(ds_cnt_failover)”. For any other partition, the default value is “$avp(ds_cnt_failover_partitionname)”..*

**Example.** $avp(274).

```opensips
modparam("dispatcher", "cnt_avp", "$avp(274)")
```
### `db_url` (string)

The default DB connection of the module, overriding the global 'db_default_url' setting. Once specified, partitions which are missing the 'db_url' property will inherit their URL from this value.

*Default value is NULL.*

**Example.** mysql://user:passwb@localhost/database.

```opensips
modparam("dispatcher", "db_url", "mysql://user:passwb@localhost/database")
```
### `destination_col` (string)

The column's name in the database storing the destination's sip uri.

*Default value is destination.*

**Example.** uri.

```opensips
modparam("dispatcher", "destination_col", "uri")
```
### `ds_define_blacklist` (string)

Defines a blacklist based on a dispatching setid from the 'default' partition. This list will contain the IPs (no port, all protocols) of the destinations matching the given setid. Use the 'partition' parameter if you want to define blacklists based on other partitions' sets.

*Default value is NULL.*

**Notes:** Multiple instances of this param are allowed.

**Example.** list= 1,4,3.

```opensips
modparam("dispatcher", "ds_define_blacklist", "list= 1,4,3")
modparam("dispatcher", "ds_define_blacklist", "blist2= 2,10,6")
```
### `ds_ping_from` (string)

With this Method you can define the "From:"-Line for the request, sent to the failed gateways. This method is only available, if compiled with the probing of failed gateways enabled.

Use the 'partition' parameter if you want to define the "From:" ping header of other partitions.

*Default value is sip:dispatcher@localhost.*

**Example.** Set the `ds_ping_from` parameter.

```opensips
modparam("dispatcher", "ds_ping_from", "sip:proxy@sip.somehost.com")
```
### `ds_ping_interval` (integer)

With this Method you can define the interval for sending a request to a failed gateway. This parameter is only used, when the TM-Module is loaded. If set to “0”, the pinging of failed requests is disabled.

*Default value is 0.*

**Example.** Set the `ds_ping_interval` parameter.

```opensips
modparam("dispatcher", "ds_ping_interval", 30)
```
### `ds_ping_maxfwd` (integer)

This parameter allows you to enforce a specific Max-Forward value for the SIP pinging requests generated by the Dispatcher modules. If not explicitly set, no value will be enforced and it let the Transaction Layer (TM module) to set a default Max-Forward value.

The accepted values are any positive integer values, including the “0” value.

**Possible values:**

- any positive integer values, including the “0” value

*Valid range: 0 or above.*

**Example.** Set the `ds_ping_maxfwd` parameter.

```opensips
modparam("dispatcher", "ds_ping_maxfwd", 2)
```
### `ds_ping_method` (string)

With this Method you can define, with which method you want to probe the failed gateways. This method is only available, if compiled with the probing of failed gateways enabled.

Use the 'partition' parameter if you want to define the ping method other partitions.

*Default value is OPTIONS.*

**Example.** Set the `ds_ping_method` parameter.

```opensips
modparam("dispatcher", "ds_ping_method", "INFO")
```
### `ds_probing_list` (string)

Defines a list of one or more setids that limits which destinations are probed if probing is active. This is useful when multiple proxies share the same dispatcher table, but you want to limit which ones are responsible for probing specific destinations.

*Default value is NULL (probe all sets).*

**Example.** 1,2,3.

```opensips
modparam("dispatcher", "ds_probing_list", "1,2,3")
```
### `ds_probing_mode` (integer)

Controls what gateways are tested to see if they are reachable. If set to 0, only the gateways with state PROBING are tested, if set to 1, all gateways are tested. If set to 1 and the response is 408 (timeout), an active gateway is set to PROBING state.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("dispatcher", "ds_probing_mode", 1)
```
### `ds_probing_sock` (string)

A socket description [proto:]host[:port] of the local socket (which is used by OpenSIPS for SIP traffic) to be used (if multiple) for sending the probing messages from.

*Default value is NULL(none).*

**Example.** udp:192.168.1.100:5077.

```opensips
modparam("dispatcher", "ds_probing_sock", "udp:192.168.1.100:5077")
```
### `ds_probing_threshold` (integer)

If you want to set a gateway into probing mode, you will need a specific number of requests until it will change from "active" to probing. The number of attempts can be set with this parameter.

*Default value is 3.*

**Example.** 10.

```opensips
modparam("dispatcher", "ds_probing_threshold", 10)
```
### `dst_avp` (string)

This is mainly for internal usage and represents the name of the avp which will hold the list with addresses, in the order they have been selected by the chosen algorithm. If use_default is 1, the value of last dst_avp_id is the last address in destination set. The first dst_avp_id is the selected destinations. All the other addresses from the destination set will be added in the avp list to be able to implement serial forking. Setting this parameter will only change the default partition's dst_avp. Use the partition parameter to create and alter other partitions.

*Default value is For the 'default' partition the default value is “$avp(ds_dst_failover)”. For any other partition, the default value is “$avp(ds_dst_failover_partitionname)”..*

**Example.** $avp(271).

```opensips
modparam("dispatcher", "dst_avp", "$avp(271)")
```
### `fetch_freeswitch_stats` (integer)

If enabled, FreeSWITCH destinations may have dynamic dispatching weights, refreshed at runtime, using the FreeSWITCH Event Socket Layer. For these destinations, an Event Socket Layer URL must be provisioned into the "weight" column, instead of an integer string. Some example values: _"fs://:password@freeswitch.example.com"_ or _"fs://user:password@127.0.0.1:8021"_. The default ESL port is 8021. OpenSIPS will establish a connection with the given socket and periodically calculate/update the weights of these destinations using statistics pushed by the FreeSWITCH box. The value for an automatically calculated weight ranges between **0 - 100**. This is helpful when grouping normal destinations with FreeSWITCH ones. The dynamic weights are recalculated every _event_heartbeat_interval_ seconds (see the "freeswitch" OpenSIPS module for more details regarding this setting), as the stats from FreeSWITCH are expected to arrive. The update formula is shown below (FreeSWITCH stats are highlighted in bold): _weight = 100 \* (**Idle-CPU** / 100) \* (1 - **Session-Count** / **Max-Sessions**)_

*Default value is 0.*

**Example.** 1.

```opensips
modparam("dispatcher", "fetch_freeswitch_stats", 1)
```
### `grp_avp` (string)

This is mainly for internal usage and represents the name of the avp storing the group id of the destination set. Good to have it for later usage or checks. Setting this parameter will only change the default partition's grp_avp. Use the partition parameter to create and alter other partitions.

*Default value is For the 'default' partition the default value is “$avp(ds_grp_failover)”. For any other partition, the default value is “$avp(ds_grp_failover_partitionname)”..*

**Example.** $avp(273).

```opensips
modparam("dispatcher", "grp_avp", "$avp(273)")
```
### `hash_pvar` (string)

String with PVs used for the hashing algorithm 7.

*Default value is null.*

**Notes:** You must set this parameter if you want do hashing over custom message parts.

**Example.** $avp(273).

```opensips
modparam("dispatcher", "hash_pvar", "$avp(273)")
```
### `max_freeswitch_weight` (integer)

The maximum weight of a FreeSWITCH ESL-enabled destination. This value is also used during startup/reload, when no stats from FreeSWITCH are available yet. Important: When mixing normal destinations with FreeSWITCH-enabled ones in the same dispatching set, OpenSIPS will truncate any weight values that are larger than **max_freeswitch_weight** to the value of this parameter! NOTE: OpenSIPS internally rounds weights to nearest integer, so larger max weight values will more accurately represent the current load on the FreeSWITCH boxes! For example, if you set this parameter to 1, the box will receive no traffic whenever either its CPU or session usage goes past 50%!

*Default value is 100.*

**Example.** 1000.

```opensips
modparam("dispatcher", "max_freeswitch_weight", 1000)
```
### `options_reply_codes` (string)

This parameter must contain a list of SIP reply codes separated by comma. The codes defined here will be considered as valid reply codes for OPTIONS messages used for pinging, apart for 200.

*Default value is NULL.*

**Example.** 501, 403.

```opensips
modparam("dispatcher", "options_reply_codes", "501, 403")
```
### `partition` (string)

Define a new partition (data source) with the following properties: "db_url", "table_name", "dst_avp", "grp_avp", "cnt_avp", "sock_avp", "attrs_avp", "script_attrs", "ds_define_blacklist". All these properties are optional, having appropriate default values. The syntax is: "partition_name: param1 = value1; param2 = value2". Each value format is the same as the one used to define a specific parameter using modparam. This parameter may be set multiple times, thus defining as many partitions as needed. The 'default' partition may also be defined using this parameter.

**Example.** voicemail:
                    db_url = mysql://user:passwd@localhost/database;
                    table_name = dispatcher;
                    attrs_avp = $avp(ds_attr_vm);
                    ds_define_blacklist = list2 = 4,6.

```opensips
modparam("dispatcher", "partition",
                "voicemail:
                    db_url = mysql://user:passwd@localhost/database;
                    table_name = dispatcher;
                    attrs_avp = $avp(ds_attr_vm);
                    ds_define_blacklist = list2 = 4,6")
```
### `persistent_state` (integer)

Specifies whether the _state_ column should be loaded at startup and flushed during runtime or not for the "default" partition. Use the 'partition' parameter if you want to define the persistent state of other partitions.

*Default value is 1.*

**Notes:** Use the 'partition' parameter if you want to define the persistent state of other partitions.

**Example.** 0.

```opensips
modparam("dispatcher", "persistent_state", 0)
```
### `priority_col` (string)

The column's name in the database storing the priority for destination uri.

*Default value is priority.*

**Example.** dstprio.

```opensips
modparam("dispatcher", "priority_col", "dstprio")
```
### `probe_mode_col` (string)

The column's name in the database storing the probe_mode (as string) for destination.

*Default value is probe_mode.*

**Example.** probing.

```opensips
modparam("dispatcher", "probe_mode_col", "probing")
```
### `pvar_algo_pattern` (string)

This parameter is used by the PVAR(9) algorithm to specify the pseudovariable pattern used to detect the load of each destination. The name of the pseudovariable should contain the string “%u”, which will be internally replaced by the module with the uri of the destination. The string “%i” can also be used and will be replaced with the set ID of the destination (useful in cases where same uri exists in multiple sets).

*Default value is none.*

**Example.** $stat(load_%u).

```opensips
modparam("dispatcher", "pvar_algo_pattern", "$stat(load_%u)")
```
### `script_attrs_avp` (string)

Name of the avp to contain the script attributes string of the current destination. When a destination is selected, automatically, this AVP will provide the attributes string - this is an opaque string (from OpenSIPS point of view) : it is provided via the ds_push_script_attrs MI or SCRIPT function.

*Default value is null.*

**Notes:** Default value is “null” - don't provide SCRIPT ATTRIBUTEs.

**Example.** $avp(script_attrs).

```opensips
modparam("dispatcher", "attrs_avp", "$avp(script_attrs)")
```
### `setid_col` (string)

The column's name in the database storing the gateway's group id.

*Default value is setid.*

**Example.** groupid.

```opensips
modparam("dispatcher", "setid_col", "groupid")
```
### `setid_pvar` (string)

The name of the PV where to store the set ID (group ID) when calling ds_is_in_list() without group parameter (third parameter).

*Default value is null.*

**Example.** Set the `setid_pvar` parameter.

```opensips
modparam("dispatcher", "setid_pvar", "$var(setid)")
```
### `sock_avp` (string)

This is mainly for internal usage and represents the name of the avp storing the sockets to be used for the destination addresses kept in dst_avp avps. Setting this parameter will only change the default partition's sock_avp. Use the partition parameter to create and alter other partitions.

*Default value is For the 'default' partition the default value is “$avp(ds_sock_failover)”. For any other partition, the default value is “$avp(ds_sock_failover_partitionname)”..*

**Example.** $avp(275).

```opensips
modparam("dispatcher", "sock_avp", "$avp(275)")
```
### `socket_col` (string)

The column's name in the database storing the socket (as string) for destination uri.

*Default value is socket.*

**Example.** my_sock.

```opensips
modparam("dispatcher", "socket_col", "my_sock")
```
### `state_col` (string)

The column's name in the database storing the state of the destination uri.

*Default value is state.*

**Example.** dststate.

```opensips
modparam("dispatcher", "state_col", "dststate")
```
### `table_name` (string)

The default name of the table from which to load dispatcher destinations. Partitions which are missing the 'table_name' property will inherit their table name from this value.

*Default value is dispatcher.*

**Example.** my_dispatcher.

```opensips
modparam("dispatcher", "table_name", "my_dispatcher")
```
### `weight_col` (string)

The column's name in the database storing the weight for destination uri.

*Default value is weight.*

**Example.** dstweight.

```opensips
modparam("dispatcher", "weight_col", "dstweight")
```

## Exported Functions

### `ds_count(set, state_filter, res_var, [partition])`

Returns the number of active, inactive or probing destinations in a partition's set, or combinations between these properties.

**Parameters:**

- `partition` *(string, optional)* — name of a DB partition. If omitted, the "default" partition will be used.
- `res_var` *(variable, required)* — a variable which will hold the integer result
- `set` *(int, required)* — a set of dispatching destinations
- `state_filter` *(string, required)* — which destinations should be counted. Either active ("a", "A" or "1"), inactive ("i", "I" or "0"), probing ("p", "P" or "2") destinations or different combinations between these flags
  - `a`
  - `A`
  - `1`
  - `i`
  - `I`
  - `0`
  - `p`
  - `P`
  - `2`
  - `pI`
  - `1i`
  - `ipA`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** Example 1.41. `ds_count` usage.

```opensips
...
if (ds_count(1, "a", $avp(result))) {
	...
}
...
if (ds_count($avp(set), "ip", $avp(result), $avp(partition))) {
	...
}
...
```

### `ds_get_script_attrs(uri, set, [partition], out_attrs)`

Get the script attrs for the dispatcher entry defined by the URI, setid and partition.

**Parameters:**

- `out_atrs` *(pvar, required)* — name of a variable where we will store the script attrs.
- `partition` *(string, optional)* — name of a DB partition. If omitted, the "default" partition will be used.
- `setid` *(int, required)* — Setid for which we are pushing script attributes
- `URI` *(string, required)* — URI address for which we are getting script attributes

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** Example 1.44. `ds_count` usage.

```opensips
...
if (ds_push_script_attrs($var(my_attributes),$si , $sp, 1, 'my_partition')) {
	...
}
...
```

### `ds_is_in_list(ip, port, [set], [partition], [active_only], [pattern])`

This function returns true only if "ip" and "port" point to a host from the given dispatcher "set".

**Parameters:**

- `active_only` *(int, optional)* — specify a non-zero value in order to only search through the active destinations (ignore the ones in probing and inactive states)
- `ip` *(string, required)* — an IPv4 or IPv6 address to test against the dispatcher "set"
- `partition` *(string, optional)* — name of a DB partition
- `pattern` *(string, optional)* — a glob pattern used to match destination attributes. If the destination ip and port matches but the pattern does not match the destination's attribute, the function will fail.
- `port` *(int, required)* — a port to test against the dispatcher list. Use a 0 value in order to match any port
  - `0`
- `set` *(int, optional)* — a dispatcher set identifier to test against. If missing, all sets will be checked. The -1 set is a special value, acting as a "check all sets" wildcard.
  - `-1`

**Return codes:**

- `true` — if "ip" and "port" point to a host from the given dispatcher "set"

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, ONREPLY_ROUTE

**Example.** Example 1.42. `ds_is_in_list` usage.

```opensips
...
if (ds_is_in_list($si, $sp)) {
	# source IP:PORT is in a dispatcher list
}
...
if (ds_is_in_list($rd, $rp, 2)) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "default" partition
}
...
if (ds_is_in_list($rd, $rp, 2, "part2")) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "part2" partition
}
...
```

### `ds_mark_dst([state], [partition])`

Mark the last used address from partition's destination set as inactive ("i"/"I"/"0"), active ("a"/"A"/"1") or probing ("p"/"P"/"2"). With this function, an automatic detection of failed gateways can be implemented. When an address is marked as inactive or probing, it will be ignored by ds_select_dst() and ds_select_domain(). If "partition" is omitted, the default partition will be used. This function is using the flags set in ds_select_dst() or ds_select_domain().

**Parameters:**

- `partition` *(string, optional)* — name of a DB partition, otherwise the default one will be used
- `state` *(string, optional)* — new state for the last attempted destination
  - `i`
  - `I`
  - `0`
  - `a`
  - `A`
  - `1`
  - `p`
  - `P`
  - `2`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Related:**

- `ds_select_domain`
- `ds_select_dst`

### `ds_next_domain([partition])`

Takes the next destination address from the AVPs with id partition.'dst_avp_id' and sets the domain part of the request uri. If "partition" is omitted, the default partition will be used.This function is using the flags set in ds_select_dst or ds_select_domain.

**Parameters:**

- `partition` *(string, optional)* — name of a DB partition. If omitted, the default partition will be used.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

### `ds_next_dst([partition])`

Takes the next destination address from the AVPs with id partition.'dst_avp_id' and sets the dst_uri (outbound proxy address). If "partition" is omitted, the default partition will be used.This function is using the flags set in ds_select_dst or ds_select_domain.

**Parameters:**

- `partition` *(string, optional)* — name of a DB partition. If omitted, the default partition will be used.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

### `ds_push_script_attrs(script_attr, ip, port, set, [partition])`

Set the script attrs for the dispatcher entry defined by IP, Port, setid and partition.

**Parameters:**

- `IP` *(string, required)* — IP address for which we are pushing script attributes
- `partition` *(string, optional)* — name of a DB partition. If omitted, the "default" partition will be used.
- `port` *(int, required)* — Port for which we are pushing script attributes
- `script_attr` *(str or pvar, required)* — The new script attributes
- `setid` *(int, required)* — Setid for which we are pushing script attributes

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** Example 1.43. `ds_count` usage.

```opensips
...
if (ds_push_script_attrs($var(my_attributes),$si , $sp, 1, 'my_partition')) {
	...
}
...
```

### `ds_select_domain(set, alg, [flags], [partition], [max_res])`

The method selects a destination from addresses set and rewrites the hostname and port parts of the Request-URI (_$ru_). Its parameters have same meaning as in ds_select_dst().

**Parameters:**

- `alg` *(int, required)* — the algorithm used to select the destination address
  - `0`
  - `1`
  - `2`
  - `3`
  - `4`
  - `5`
  - `6`
  - `7`
  - `8`
  - `9`
  - `10`
  - `X`
- `flags` *(string, optional)* — a string of flag-settings which tweak the function's behavior
  - `f`
  - `u`
  - `d`
  - `a`
- `max_res` *(int, optional)* — signifies that only a maximum number of destinations shall be included in the specified failover AVP.
- `partition` *(string, optional)* — name of a DB partition
- `set` *(int, required)* — a set identifier from which to select destinations

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Related:**

- `ds_next_domain`
- `ds_select_dst`

### `ds_select_dst(set, alg, [flags], [partition], [max_res])`

The method selects a destination from the given set of addresses. It will overwrite the destination URI (_$du_) of a SIP request.

**Parameters:**

- `alg` *(int, required)* — the algorithm used to select the destination address
  - `0`
  - `1`
  - `2`
  - `3`
  - `4`
  - `5`
  - `6`
  - `7`
  - `8`
  - `9`
  - `10`
  - `X`
- `flags` *(string, optional)* — a string of flag-settings which tweak the function's behavior
  - `f`
  - `u`
  - `d`
  - `a`
- `max_res` *(int, optional)* — signifies that only a maximum number of destinations shall be included in the specified failover AVP. This allows having multiple destinations while also preventing excessive failover attempts in case a number is bound to fail globally.
- `partition` *(string, optional)* — name of a DB partition
- `set` *(int, required)* — a set identifier from which to select destinations

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, FAILURE_ROUTE

**Related:**

- `ds_next_dst`

**Example.** Example 1.40. `ds_select_dst` usage.

```opensips
...
if (!ds_select_dst(1, 0)) {
	xlog("ERROR: no active destinations found!\n");
	send_reply(503, "Service Unavailable");
	exit;
}
...
ds_select_dst(1, 0, , "fs_boxes", 5);
...
ds_select_dst(1, 0, "fUD", "ask_boxes");
...
ds_select_dst(2, 0, "fud", "pstn_gws", 5);
ds_select_dst(3, 1, "fua", "pstn_gws", 2);
...
# using variables
$var(part) = "pstn_gws"
$var(setid) = 1;
$var(alg) = 4;
$var(flags) = "fdu";
$var(max_res) = 2;
ds_select_dst($var(setid), $var(alg), $var(flags), $var(part), $var(max_res));
...
```

## Exported MI Functions

### `ds_list`

It lists the groups and included destinations of all the partitions.

**Parameters:**

- `full` *(string, optional)* — adds the weight, priority and description fields to the listing
- `partition` *(string, optional)* — return only destinations and sets in the provided partition.

**Example.**

```bash
opensips-cli -x mi ds_list
```

### `ds_push_script_attrs`

Pushes script attrs for the dispatcher entry defined by IP, Port, setid, and optionally partition.

**Parameters:**

- `attrs` *(string, required)* — new attributes to be pushed
- `ip` *(string, required)* — IP for which we are pushing script attributes
- `partition` *(string, optional)* — Partition for which we are pushing script attributes
- `port` *(integer, required)* — Port for which we are pushing script attributes
- `setid` *(integer, required)* — Setid for which we are pushing script attributes

**Example.**

```bash
#opensips-cli -x mi ds_push_script_attrs '{"ping":"30000","load":"50"}' '192.168.0.107' 5091 1 main
```

### `ds_reload`

It reloads the groups and included destinations for a specified partition or all partitions.

**Parameters:**

- `inherit_state` *(string, optional)* — whether inherit old state of the destination , default is y. Valid values: “n”: no inherit state, “y”: inherit state
- `partition` *(string, optional)* — name of the partition to be reloaded. default partition is "default".

**Example.**

```bash
opensips-cli -x mi ds_reload
```

**Example.**

```bash
opensips-cli -x mi ds_reload inherit_state=n
```

### `ds_set_state`

Sets the status for a destination address (can be use to mark the destination as active or inactive).

**Parameters:**

- `address` *(string, required)* — address of the destination in the group
- `group` *(string, required)* — partition name followed by colon and destination group id. If the partition name is omitted, the default partition will be used
- `state` *(string, required)* — state of the destination address. Valid values: “a”: active, “i”: inactive, “p”: probing

**Example.**

```bash
opensips-cli -x mi ds_set_state a 2 sip:10.0.0.202
```

## Exported Events

### `E_DISPATCHER_STATUS`

This event is raised when the dispatcher module marks a destination as activated or deactivated.

**Parameters:**

- `partition` *(string)* — the partition name of the destination.
- `group` *(integer)* — the group of the destination.
- `address` *(string)* — the address of the destination.
- `status` *(string)* — active if the destination gets activated or inactive if the destination is detected unresponsive.

## Configuration Examples

### Setting the default database URL for dispatcher

Sets the default database URL for the dispatcher module.

```opensips
...
modparam("dispatcher", "db_url", "mysql://user:passwb@localhost/database")
...
```
### Set the 'default' partition's “attrs_avp” parameter

Sets the 'default' partition's “attrs_avp” parameter.

```opensips
...
modparam("dispatcher", "attrs_avp", "$avp(272)")
...
```
### Set the 'default' partition's “script_attrs_avp” parameter

Sets the 'default' partition's “script_attrs_avp” parameter.

```opensips
...
modparam("dispatcher", "attrs_avp", "$avp(script_attrs)")
...
```
### Use algo_route for hashing:

Uses a route block for custom hashing logic.

```opensips
...
modparam("dispatcher", "algo_route", "my_dispatcher_logic)")
...
route[my_dispatcher_logic] {
        $var(curent_score) = 0;
        xlog("DISPATCHER - Running logic for $param(dst_uri) with attrs $param(attrs) and script attrs $param(script_attrs) \n");

	# decide to penalize current dispatcher entry, based on your logic
	if (my_condition_here)
		$var(current_score) = $var(current_score) + 10;

        return $var(rc);
}
...
```
### Use $avp(273) for hashing:

Uses an AVP for hashing.

```opensips
...
modparam("dispatcher", "hash_pvar", "$avp(273)")
...
```
### Use combination of PVs for hashing:

Uses a combination of pseudo-variables for hashing.

```opensips
...
modparam("dispatcher", "hash_pvar", "hash the $fU@$ci")
...
```
### Set the “setid_pvar” parameter

Sets the “setid_pvar” parameter.

```opensips
...
modparam("dispatcher", "setid_pvar", "$var(setid)")
...
```
### Set the “ds_ping_method” parameter

Sets the “ds_ping_method” parameter.

```opensips
...
modparam("dispatcher", "ds_ping_method", "INFO")
...
```
### Set the “ds_ping_from” parameter

Sets the “ds_ping_from” parameter.

```opensips
...
modparam("dispatcher", "ds_ping_from", "sip:proxy@sip.somehost.com")
...
```
### Set the “ds_ping_interval” parameter

Sets the “ds_ping_interval” parameter.

```opensips
...
modparam("dispatcher", "ds_ping_interval", 30)
...
```
### Set the “ds_ping_maxfwd” parameter

Sets the “ds_ping_maxfwd” parameter.

```opensips
...
modparam("dispatcher", "ds_ping_maxfwd", 2)
...
```
### Set the “ds_probing_sock” parameter

Sets the “ds_probing_sock” parameter.

```opensips
...
modparam("dispatcher", "ds_probing_sock", "udp:192.168.1.100:5077")
...
```
### Set the “ds_probing_threshold” parameter

Sets the “ds_probing_threshold” parameter.

```opensips
...
modparam("dispatcher", "ds_probing_threshold", 10)
...
```
### Set the “ds_probing_mode” parameter

Sets the “ds_probing_mode” parameter.

```opensips
...
modparam("dispatcher", "ds_probing_mode", 1)
...
```
### Set the “ds_probing_list” parameter

Sets the “ds_probing_list” parameter.

```opensips
...
modparam("dispatcher", "ds_probing_list", "1,2,3")
...
```
### Set the 'default' partition's “ds_define_blacklist” parameter

Sets the 'default' partition's “ds_define_blacklist” parameter.

```opensips
...
modparam("dispatcher", "ds_define_blacklist", "list= 1,4,3")
modparam("dispatcher", "ds_define_blacklist", "blist2= 2,10,6")
...
```
### Set the “options_reply_codes” parameter

Sets the “options_reply_codes” parameter.

```opensips
...
modparam("dispatcher", "options_reply_codes", "501, 403")
...
```
### Set the 'default' partition's “dst_avp” parameter

Sets the 'default' partition's “dst_avp” parameter.

```opensips
...
modparam("dispatcher", "dst_avp", "$avp(271)")
...
```
### Set the 'default' partition's “grp_avp” parameter

Sets the 'default' partition's “grp_avp” parameter.

```opensips
...
modparam("dispatcher", "grp_avp", "$avp(273)")
...
```
### Set the 'default' partition's “cnt_avp” parameter

Sets the 'default' partition's “cnt_avp” parameter.

```opensips
...
modparam("dispatcher", "cnt_avp", "$avp(274)")
...
```
### Set the 'default' partition's “sock_avp” parameter

Sets the 'default' partition's “sock_avp” parameter.

```opensips
...
modparam("dispatcher", "sock_avp", "$avp(275)")
...
```
### Set the “pvar_algo_pattern” parameter

Sets the “pvar_algo_pattern” parameter.

```opensips
...
modparam("dispatcher", "pvar_algo_pattern", "$stat(load_%u)")
...
```
### Set the `persistent_state` parameter

Sets the `persistent_state` parameter.

```opensips
...
# disable all DB operations with the state of a destination
modparam("dispatcher", "persistent_state", 0)
...
```
### Set `cluster_id` parameter

Sets `cluster_id` parameter.

```opensips
...
# replicate destination status with all OpenSIPS in cluster ID 9
modparam("dispatcher", "cluster_id", 9)
...
```
### Set `cluster_sharing_tag` parameter

Sets `cluster_sharing_tag` parameter.

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("dispatcher", "cluster_id", 9)
modparam("dispatcher", "cluster_sharing_tag", "vip")
...
```
### Set `cluster_probing_mode` parameter

Sets `cluster_probing_mode` parameter.

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
modparam("dispatcher", "cluster_id", 9)
modparam("dispatcher", "cluster_sharing_tag", "vip")
modparam("dispatcher", "cluster_probing_mode", "by-shtag")
...
# the pinging effort is distributed across all the nodes
modparam("dispatcher", "cluster_id", 9)
modparam("dispatcher", "cluster_probing_mode", "distributed")
...
```
### Define a new partition called 'voicemail'

Defines a new partition called 'voicemail'.

```opensips
...
modparam("dispatcher", "partition",
                "voicemail:
                    db_url = mysql://user:passwd@localhost/database;
                    table_name = dispatcher;
                    attrs_avp = $avp(ds_attr_vm);
                    ds_define_blacklist = list2 = 4,6")
...
```
### Define the 'trunks' partition and make it the 'default' partition, so we avoid loading the 'dispatcher' table

Defines the 'trunks' partition and makes it the 'default' partition.

```opensips
...
modparam("dispatcher", "partition",
                "trunks:
                    db_url = mysql://user:passwd@localhost/database;
                    table_name = dispatcher_trunks;
                    attrs_avp = $avp(ds_attr_trunks)")
modparam("dispatcher", "partition", "default: trunks")
...
```
### Set the default table name

Sets the default table name.

```opensips
...
modparam("dispatcher", "table_name", "my_dispatcher")
...
```
### Set “setid_col” parameter

Sets “setid_col” parameter.

```opensips
...
modparam("dispatcher", "setid_col", "groupid")
...
```
### Set “destination_col” parameter

Sets “destination_col” parameter.

```opensips
...
modparam("dispatcher", "destination_col", "uri")
...
```
### Set “state_col” parameter

Sets “state_col” parameter.

```opensips
...
modparam("dispatcher", "state_col", "dststate")
...
```
### Set “weight_col” parameter

Sets “weight_col” parameter.

```opensips
...
modparam("dispatcher", "weight_col", "dstweight")
...
```
### Set “priority_col” parameter

Sets “priority_col” parameter.

```opensips
...
modparam("dispatcher", "priority_col", "dstprio")
...
```
### Set “attrs_col” parameter

Sets “attrs_col” parameter.

```opensips
...
modparam("dispatcher", "attrs_col", "dstattrs")
...
```
### Set “socket_col” parameter

Sets “socket_col” parameter.

```opensips
...
modparam("dispatcher", "socket_col", "my_sock")
...
```
### Set “probe_mode_col” parameter

Sets “probe_mode_col” parameter.

```opensips
...
modparam("dispatcher", "probe_mode_col", "probing")
...
```
### Set the `fetch_freeswitch_load` parameter

Sets the `fetch_freeswitch_load` parameter.

```opensips
...
modparam("dispatcher", "fetch_freeswitch_stats", 1)
...
```
### Set the `max_freeswitch_weight` parameter

Sets the `max_freeswitch_weight` parameter.

```opensips
...
modparam("dispatcher", "max_freeswitch_weight", 1000)
...
```
### `ds_select_dst` usage

Demonstrates `ds_select_dst` usage.

```opensips
...
if (!ds_select_dst(1, 0)) {
	xlog("ERROR: no active destinations found!\n");
	send_reply(503, "Service Unavailable");
	exit;
}
...
ds_select_dst(1, 0, , "fs_boxes", 5);
...
ds_select_dst(1, 0, "fUD", "ask_boxes");
...
ds_select_dst(2, 0, "fud", "pstn_gws", 5);
ds_select_dst(3, 1, "fua", "pstn_gws", 2);
...
# using variables
$var(part) = "pstn_gws"
$var(setid) = 1;
$var(alg) = 4;
$var(flags) = "fdu";
$var(max_res) = 2;
ds_select_dst($var(setid), $var(alg), $var(flags), $var(part), $var(max_res));
...
```
### `ds_count` usage

Demonstrates `ds_count` usage.

```opensips
...
if (ds_count(1, "a", $avp(result))) {
	...
}
...
if (ds_count($avp(set), "ip", $avp(result), $avp(partition))) {
	...
}
...
```
### `ds_is_in_list` usage

Demonstrates `ds_is_in_list` usage.

```opensips
...
if (ds_is_in_list($si, $sp)) {
	# source IP:PORT is in a dispatcher list
}
...
if (ds_is_in_list($rd, $rp, 2)) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "default" partition
}
...
if (ds_is_in_list($rd, $rp, 2, "part2")) {
	# the R-URI (IP and port) is in the dispatcher set 2 of the "part2" partition
}
...
```
### `ds_count` usage

Demonstrates `ds_push_script_attrs` usage (title in source is ds_count).

```opensips
...
if (ds_push_script_attrs($var(my_attributes),$si , $sp, 1, 'my_partition')) {
	...
}
...
```
### `ds_count` usage

Demonstrates `ds_push_script_attrs` usage (title in source is ds_count).

```opensips
...
if (ds_push_script_attrs($var(my_attributes),$si , $sp, 1, 'my_partition')) {
	...
}
...
```
### OpenSIPS config script - sample dispatcher usage

Sample OpenSIPS config script demonstrating dispatcher usage.

```opensips
...
#
# sample config file for dispatcher module
#

socket= udp:*:5060

udp_workers = 2
check_via = off     # (cmd. line: -v)
dns = off           # (cmd. line: -r)
rev_dns = off       # (cmd. line: -R)

# for more info: opensips -h

# ------------------ module loading ----------------------------------
mpath = "/usr/lib/x86_64-linux-gnu/opensips/modules"

loadmodule "maxfwd.so"
loadmodule "signaling.so"
loadmodule "sl.so"
loadmodule "tm.so"
loadmodule "db_mysql.so"
loadmodule "dispatcher.so"

loadmodule "proto_udp.so"

# ----------------- setting module-specific parameters ---------------
modparam("dispatcher", "db_url", "mysql://opensips:opensipsrw@localhost/opensips")

route {
	if (!mf_process_maxfwd_header(10)) {
		send_reply(483, "Too Many Hops");
		exit;
	}

	if (!ds_select_dst(2, 0)) {
		send_reply(503, "Service Unavailable");
		exit;
	}

	t_relay();
}

...
```
