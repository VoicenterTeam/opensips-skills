# clusterer Module Reference
<!-- generated-from: data/3.5/modules/clusterer.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 clusterer module. Read this file when configuring or debugging the clusterer module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

The _clusterer_ module is used to organize multiple OpenSIPS instances into groups(clusters) in which the nodes can communicate with each other in order to replicate, share information or perform distributed tasks. The distributed logic is performed either by different modules that use the _clusterer_ interface (i.e. the _dialog_ module can replicate dialogs/profiles, the _ratelimit_ module can share pipes across multiple instances etc.) or at the script level. The _clusterer_ module itself only provides an interface to send/receive BIN packets and get notifications about node availability. It achieves this by internally learning the cluster topology and state of the nodes. Provisioning the nodes within a cluster is done over the database or through the configuration script. The node-related information can be checked and triggered to be reloaded by sending commands over the MI interface.

## How It Works

The topology established by the _clusterer_ module is an overlay of nodes where the "links" represent communication availability at BIN interface level. For this purpose, a probing mechanism is used, consisting of regular pings to all nodes in a cluster for which replies must be received within a given interval. All nodes in the cluster exchange information about the state of their links with other nodes and compute a "routing table" which gives a next hop for each destination. The metric for the shortest path is the number of hops. When there is no direct link to a destination, the BIN packet sent by a module is transparently routed through the cluster.

Note that an OpenSIPS instance can belong to multiple clusters, communicating and establishing the topology separately for each one. In order to provision this in the database or the script, each node has an unique ID at global level, which can be referenced in each cluster.

An OpenSIPS instance can dynamically learn all the nodes in the cluster if database provisioning is not desired. It is enough to define at least one neigbour in the script in order to discover all the cluster components.

## Dependencies

### OpenSIPs Modules

- `database module` — Required if db_mode is 1.
- `proto_bin` — Must be loaded before this module.

### External Libraries

None.

## Exported Parameters

### `cluster_id_col` (string)

The name of the column to store the id of a cluster.

*Default value is cluster_id.*

**Example.** cluster_id.

```opensips
modparam("clusterer", "cluster_id_col", "cluster_id")
```
### `db_mode` (integer)

Specifies whether the node information for the local instance, as well as other instances in the cluster, should be loaded from the database or configured in the script(see [my_node_info](#param_my_node_info "1.4.6.my_node_info") and [neighbor_node_info](#param_neighbor_node_info "1.4.7.neighbor_node_info")). A value of “0” means that DB is not used and the cluster topology in terms of node information will be discovered dynamically at runtime. If DB mode is enabled, only the nodes defined in the database will be accepted by this instance.

*Default value is 1.*

**Possible values:**

- 0
- 1

**Example.** Set the `db_mode` parameter.

```opensips
...
modparam("clusterer", "db_mode", 0)
...
```
### `db_table` (string)

The name of the table storing the clustering information.

*Default value is clusterer.*

**Example.** Set the `db_table` parameter.

```opensips
...
modparam("clusterer", "db_table", "clusterer")
...
```
### `db_url` (string)

The database url.

*Default value is NULL.*

**Example.** Set the `db_url` parameter.

```opensips
...
modparam("clusterer", "db_url",
	"mysql://opensips:opensipsrw@localhost/opensips")
...
```
### `description_col` (string)

The name of the column containing a node description.

*Default value is description.*

**Example.** Set the `description_col` parameter.

```opensips
modparam("clusterer", "description_col", "description")
```
### `dispatch_jobs` (integer)

Enables the dispatching of jobs(processing replicated data packets) from the receiving TCP worker process to free opensips workers (including UDP, timer processes etc.).

This generally improves the performance of handling replication packets in high traffic scenarios and should not be disabled.

Nevertheless there are cases where the "thundering herd" problem occurs which causes abnormaly high CPU loads. Disabling this dispatching mechanism solves such issues.

*Default value is 1 (enabled).*

**Possible values:**

- 0
- 1

**Example.** 0.

```opensips
modparam("clusterer", "dispatch_jobs", 0)
```
### `enable_rerouting` (integer)

If packets should be rerouted via another node if a direct route to destination is unavailible. Disabling may improve stability in two-node topologies. Set it to zero to disable or to non-zero to enable it.

*Default value is 1 (enabled).*

**Example.** 0.

```opensips
...
modparam("clusterer", "enable_rerouting", 0)
...
```
### `enable_stats` (integer)

If the statistics support should be enabled or not. Via statistic variables, the module provide information about the cluster nodes. Set it to zero to disable or to non-zero to enable it.

*Default value is 1 (enabled).*

**Example.** Set the `enable_stats` parameter.

```opensips
modparam("clusterer", "enable_stats", 0)
```
### `flags_col` (string)

The name of the column containing the node flags.

*Default value is flags.*

**Example.** Set the `flags_col` parameter.

```opensips
modparam("clusterer", "flags_col", "flags")
```
### `id_col` (string)

The name of the column storing an id for the table rows.

*Default value is id.*

**Example.** id.

```opensips
modparam("clusterer", "id_col", "id")
```
### `my_node_id` (integer)

The id of the local instance. This parameter must be equal to one of the _node_id_ fields in the database.

*Valid range: 1 or above.*

**Notes:** No default value. This parameter must be explicitly set to a value greater than zero.

**Example.** Set the `my_node_id` parameter.

```opensips
...
modparam("clusterer", "my_node_id", 1)
...
```
### `my_node_info` (string)

Node specification similar to the information provided by a row in the clusterer DB table corresponding to the local instance. This parameter can be set multiple times in order to include the local node in multiple clusters. Parameter format: multiple "prop=value" property definitions separated by ',' where the name of the properties is the same as the DB column names. At least the cluster_id and url properties must be defined. This parameter is required if db_mode is set to “0” in order to properly advertise information about the local instance in the dynamic node learning process.

**Example.** cluster_id=1, url=bin:192.168.0.5:5566.

```opensips
modparam("clusterer", "my_node_info", "cluster_id=1, url=bin:192.168.0.5:5566")
```
### `neighbor_node_info` (string)

Node specification similar to the information provided by a row in the clusterer DB table corresponding to another instance in the cluster. This node will be the entry point in the cluster for the local instance in the dynamic node learning process. This parameter can be set multiple times to define multiple neigbors to connect to (or the same neighbor but in different clusters). Parameter format: multiple "prop=value" property definitions separated by ',' where the name of the properties is the same as the DB column names. At least the cluster_id, node_id and url properties must be defined. This parameter should be set at least once if db_mode is set to 0 in order to properly learn the cluster topology. If not set, the only way to learn the node topology is by other nodes connecting to the local instance.

**Example.** cluster_id=1,node_id=2,url=bin:192.168.0.6:5566.

```opensips
modparam("clusterer", "neighbor_node_info", "cluster_id=1,node_id=2,url=bin:192.168.0.6:5566")
```
### `no_ping_retries_col` (string)

The name of the column containing the maximum number of ping retries before the link with the neighbour node is considered down.

*Default value is no_ping_retries.*

**Example.** no_ping_retries.

```opensips
modparam("clusterer", "no_ping_retries_col", "no_ping_retries")
```
### `node_id_col` (string)

The name of the column to store the id of an instance. The values must be greater than 0.

*Default value is node_id.*

**Example.** node_id.

```opensips
modparam("clusterer", "node_id_col", "node_id")
```
### `node_timeout` (integer)

The time in seconds to wait before pinging is restarted for a failed node.

*Default value is 60.*

**Example.** 10.

```opensips
modparam("clusterer", "node_timeout", 10)
```
### `ping_interval` (integer)

The interval in seconds between regular pings sent to a neighbour node.

*Default value is 4.*

**Example.** 1.

```opensips
modparam("clusterer", "ping_interval", 1)
```
### `ping_timeout` (integer)

The time in milliseconds to wait for a reply to a previously sent ping before retrying or considering the link with the neighbour node down. This is also the interval between successive retries if the send fails.

*Default value is 1000.*

**Example.** 500.

```opensips
modparam("clusterer", "ping_timeout", 500)
```
### `priority_col` (string)

The name of the column storing the node priority to be chosen as next hop in case of same length(number of hops) paths when rerouting messages.

*Default value is priority.*

**Example.** Set the `priority_col` parameter.

```opensips
modparam("clusterer", "priority_col", "priority")
```
### `seed_fallback_interval` (integer)

Only relevant for "seed" nodes. The time, in seconds, to wait for a suitable donor node before falling back to a "synced" state, following a node restart or an MI cluster sync command.

*Default value is 5.*

**Example.** 10.

```opensips
modparam("clusterer", "seed_fallback_interval", 10)
```
### `sharing_tag` (string)

The definition of a sharing tag. The sharing tag is managed by the clusterer module, but can be used (in terms of reading its state) by any module build on top of clusterer engine, like dialog or presence. Note that other tags may be dynamically learned during runtime via clustering communication with other nodes.

*Default value is none.*

**Notes:** The format for this value is “tag_name / cluster_id = active/backup”. Multiple definitions of this parameter are allowed.

**Example.** Set the `sharing_tag` parameter.

```opensips
...
modparam("clusterer", "sharing_tag", "vip1/2=active")
modparam("clusterer", "sharing_tag", "node/10=backup")
...
```
### `sip_addr_col` (string)

The name of the column containing a SIP address for the node.

*Default value is sip_addr.*

**Example.** Set the `sip_addr_col` parameter.

```opensips
modparam("clusterer", "sip_addr_col", "sip_addr")
```
### `state_col` (string)

The name of the column storing the state of the node(enabled/disabled).

*Default value is state.*

**Example.** state.

```opensips
modparam("clusterer", "state_col", "state")
```
### `sync_packet_size` (integer)

The maximum size of the BIN packets sent while doing data synchronization. This is only a suggested value as the actual size of the packets may be slightly larger.

*Default value is 65535.*

**Example.** 32765.

```opensips
modparam("clusterer", "sync_packet_size", 32765)
```
### `sync_timeout` (integer)

The inteval, in seconds, since the last sync data packet received after which to consider the sync process as failed and revert the node to the not synced state.

*Default value is 15.*

**Example.** 5.

```opensips
modparam("clusterer", "sync_timeout", 5)
```
### `url_col` (string)

The name of the column containing the instance url. The values must be greater than 0.

*Default value is url.*

**Example.** url.

```opensips
modparam("clusterer", "url_col", "url")
```

## Exported Functions

### `cluster_broadcast_req(cluster_id, msg, [tag])`

This function has a similar behaviour to the `cluster_send_req()` function with the exception that the message is sent to all the nodes in the specified cluster.

**Parameters:**

- `cluster_id` *(int, required)* — the cluster ID of the destination node
- `msg` *(string, required)* — actual message payload
- `tag` *(var, optional)* — randomly generated communication tag

**Return codes:**

- `1` — successfully sent message to at least one node
- `-1` — local node is disabled so sending is impossbile
- `-2` — all nodes in the cluster are unreachable according to the discovered topology
- `-3` — send failed for all nodes in the cluster or other OpenSIPS internal error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, EVENT_ROUTE

**Related:**

- `cluster_send_req`

**Example.** cluster_broadcast_req() usage.

```opensips
cluster_broadcast_req($var(cl_id), $var(share_data));
```

### `cluster_check_addr(cluster_id, ip, addr_type)`

This function checks whether the given IP address belongs to one of the nodes in the cluster.

**Parameters:**

- `addr_type` *(string, optional)* — select the address of the node that the comparison is made against
  - `sip`
  - `bin`
- `cluster_id` *(int, required)* — 
- `ip` *(string, required)* — 

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, EVENT_ROUTE

**Example.** cluster_check_addr() usage.

```opensips
if (cluster_check_addr(1, $si)) {
	...
}
```

### `cluster_send_req(cluster_id, dst_id, msg, [tag])`

This function is used to send a generic, request-like message, containing custom data, to a specific node in a cluster, directly from the script. The message is not a "request" per se but according to the logic on the receiving side, that node can send back a reply. In order to correlate a received reply with the request sent out, the function returns, through the _tag_ parameter, a randomly generated communication tag, which is sent along in the the original message, that can be checked against the tag received in a reply.

**Parameters:**

- `cluster_id` *(int, required)* — the cluster ID of the destination node
- `dst_id` *(int, required)* — the ID of the destiantion node
- `msg` *(string, required)* — actual message payload
- `tag` *(var, optional)* — randomly generated communication tag

**Return codes:**

- `1` — successfully sent message to destination node or a valid next hop
- `-1` — local node is disabled so sending is impossbile
- `-2` — destination node is not reachable through any path according to the discovered topology
- `-3` — destination node or valid next hop appear to be reachable but send failed or other OpenSIPS internal error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, EVENT_ROUTE

**Example.** cluster_send_req() usage.

```opensips
# send a request
cluster_send_req(1, 1, "Check USER: $fU", $var(req_tag));
# wait for reply
$avp(filter) = "tag=" + $var(req_tag);
async(wait_for_event("E_CLUSTERER_RPL_RECEIVED", $avp(filter), 5), rpl_resume);
# done
...
route[rpl_resume] {
  xlog("Received reply: $avp(msg)\n");
}
```

### `cluster_send_rpl(cluster_id, dst_id, msg, tag)`

This function is used to send a generic, reply-like message, containing custom data, to a specific node in a cluster, directly from the script. The message is marked as a "reply" so this function should ony be used for replying to a previously request-like message received. In order for the other node, which initially sent a request, to be able to correlate it with this reply, a communication tag, received along with the request, should be passed to the function.

**Parameters:**

- `cluster_id` *(int, required)* — the cluster ID of the destination node
- `dst_id` *(int, required)* — the ID of the destiantion node
- `msg` *(string, required)* — actual message payload
- `tag` *(var, required)* — communication tag

**Return codes:**

- `1` — successfully sent message to destination node or a valid next hop
- `-1` — local node is disabled so sending is impossbile
- `-2` — destination node is not reachable through any path according to the discovered topology
- `-3` — destination node or valid next hop appear to be reachable but send failed or other OpenSIPS internal error

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, EVENT_ROUTE

**Example.** cluster_send_rpl() usage.

```opensips
event_route[E_CLUSTERER_REQ_RECEIVED] {
  cluster_send_rpl($param(cluster_id), $param(src_id), $var(my_reply), $param(tag));
}
```

## Exported Pseudo-Variables

### `$cluster.sh_tag`

This is a read/write variable that allows access to the sharing tags managed by the clusterer module. The name of such a variable has the format of tag_name/cluster_id, like $cluster.sh_tag(vip/3) accessing the sharing tag "vip" from cluster ID 3.

- **Type:** string
- **Read/write:** read-write
- **Scope:** script

**Possible values:**

- active
- backup
- 0
- 1
- NULL

## Exported MI Functions

### `cluster_broadcast_mi`

Dispatches a given MI command to be run on all the nodes in a cluster. The command is also executed locally.

Note that MI commands that require named parameters or arrays as parameter values are not currently supported.

**Parameters:**

- `cluster_id` *(integer, required)* — id of the cluster.
- `cmd_name` *(string, required)* — name of the MI command to be run
- `cmd_params` *(string, optional)* — array of parameters for the MI command to be run

**Example.**

```opensips-cli
opensips-cli -x mi cluster_broadcast_mi 1 dr_reload partition_5
```

### `cluster_send_mi`

Dispatches a given MI command to be run on a specific node in the cluster.

Note that MI commands that require named parameters or arrays as parameter values are not currently supported.

**Parameters:**

- `cluster_id` *(integer, required)* — id of the cluster.
- `cmd_name` *(string, required)* — name of the MI command to be run
- `cmd_params` *(string, optional)* — array of parameters for the MI command to be run
- `destination` *(integer, required)* — id of the destination node

**Example.**

```opensips-cli
opensips-cli -x mi cluster_send_mi 1 3 lb_reload
```

### `clusterer_list`

Lists information(node id, URL, link state with that node etc.) about the other nodes in each cluster.

**Returns:** JSON object containing cluster and node information. (structured response — see schema)

**Example.** clusterer_list usage

```opensips-cli
$ opensips-cli -x mi clusterer_list
{
    "Clusters": [
        {
            "cluster_id": 1,
            "Nodes": [
                {
                    "node_id": 1,
                    "db_id": 1,
                    "url": "bin:127.0.0.1",
                    "link_state": "Up",
                    "next_hop": "1",
                    "description": "none"
                }
            ]
        }
    ]
}
```

### `clusterer_list_cap`

Lists the registered capabilities and their states.

**Returns:** JSON object containing cluster capabilities information. (structured response — see schema)

**Example.** clusterer_list_cap usage

```opensips-cli
$ opensips-cli -x mi clusterer_list_cap
{
    "Clusters": [
        {
            "cluster_id": 1,
            "Capabilities": [
                {
                    "name": "dialog-dlg-repl",
                    "state": "Ok",
                    "enabled": "yes"
                },
                {
                    "name": "dialog-prof-repl",
                    "state": "Ok",
                    "enabled": "yes"
                }
            ]
        }
    ]
}
```

### `clusterer_list_shtags`

Lists all known sharing tags and their states.

**Example.**

```opensips-cli
		opensips-cli -x mi clusterer_list_shtags
```

### `clusterer_list_topology`

Lists each cluster's topology from the local node's perspective as an adjacency list. A node appears as a neighbour if the link with that node is up.

Note that if a node id appears in multiple clusters, it refers to the same instance that belongs to different clusters, for which it has a different topology.

**Returns:** JSON object containing cluster topology information. (structured response — see schema)

**Example.** clusterer_list_topology usage

```opensips-cli
$ opensips-cli -x mi clusterer_list_topology
{
    "Clusters": [
        {
            "cluster_id": 1,
            "Nodes": [
                {
                    "node_id": 2,
                    "Neighbours": [
                        1
                    ]
                },
                {
                    "node_id": 1,
                    "Neighbours": [
                        2
                    ]
                }
            ]
        }
    ]
}
```

### `clusterer_reload`

Reloads data from the clusterer database. The currently established topology will be lost and the node will rediscover the new topology.

**Example.**

```opensips-cli
		opensips-cli -x mi clusterer_reload
```

### `clusterer_remove_node`

Removes a node from the cluster's topology. It is enough to run the function on a single node in order to remove the target node from all the other nodes in the cluster. If the node to be removed is running when triggering this function, it will be automatically disabled (equivalent to running clusterer_set_status on that specific node).

This function can only be used when db_mode is set to 0 (disabled).

**Parameters:**

- `cluster_id` *(integer, required)* — cluster ID
- `node_id` *(integer, required)* — ID of the node to be removed.

**Example.**

```opensips-cli
		opensips-cli -x mi clusterer_remove_node 1 3
```

### `clusterer_set_cap_status`

Sets the status(Enabled/Disabled) of a capability. If a capability is disabled, the node will not send any replication/sync messages belonging to that capability. Likewise, received messages will be dropped. Also, the cabability will transition to a "not synced" state and the node will no longer be able to be a donor for syncing.

**Parameters:**

- `capability` *(string, required)* — name of the capability, as listed by clusterer_list_cap
- `cluster_id` *(integer, required)* — the id of the cluster
- `status` *(integer, required)* — indicates the new status(0 - Disabled, 1 - Enabled).

**Example.**

```opensips-cli
		#disable dialog replication in cluster 1
		opensips-cli -x mi clusterer_set_cap_status 1 dialog-dlg-repl 0
```

**Example.**

```opensips-cli
		#enable dialog profile replication in cluster 2
		opensips-cli -x mi clusterer_set_cap_status 2 dialog-prof-repl 1
```

### `clusterer_set_status`

Sets the status(Enabled/Disabled) of a node. If the local instance is disabled, the node will not send any messages and ignore received ones thus appearing as a failed node in the topology (from the other node's perspective). If a different node is disabled, the specified node will simply be ignored by the local instance in terms of sending/receiving any messages, as if no longer part of the topology.

**Parameters:**

- `cluster_id` *(integer, required)* — indicates the id of the cluster.
- `node_id` *(integer, optional)* — indicates the id of the node to be disabled. If missing, the local instance will be disalbed.
- `status` *(integer, required)* — indicates the new status(0 - Disabled, 1 - Enabled).

**Example.**

```opensips-cli
		#disable the local instance
		opensips-cli -x mi clusterer_set_status 1 0
```

**Example.**

```opensips-cli
		#disable node ID 3
		opensips-cli -x mi clusterer_set_status 1 3 0
```

### `clusterer_shtag_set_active`

Set the given sharing tag to the active state. The information about this change is also broadcasted in the cluster in order to force any other node that may be active on this tag to step down to backup.

**Parameters:**

- `tag` *(string, required)* — the name of the tag to be set active and the cluster it belogs to, in the format 'tag/cluster_id'.

**Example.**

```opensips-cli
		opensips-cli -x mi clusterer_shtag_set_active vip1/3
```

## Exported Statistics

### `clusterer_nodes`

Returns the total number of cluster nodes.

- **Type:** gauge
### `clusterer_nodes_down`

Returns the total number of cluster nodes not in the UP state.

- **Type:** gauge
### `clusterer_nodes_up`

Returns the total number of cluster nodes in the UP state.

- **Type:** gauge

## Exported Events

### `E_CLUSTERER_NODE_STATE_CHANGED`

This event is raised when the state of a node changes in terms of availability.

**Parameters:**

- `cluster_id` *(integer)* — The cluster ID.
- `node_id` *(integer)* — The ID of the node.
- `new_state` *(integer)* — The new state of the node, with the possible values: 0 - down, 1 - up.
### `E_CLUSTERER_REQ_RECEIVED`

This event is raised when a generic, request-like, clusterer message is received. This type of message is sent directly from the script and not by an OpenSIPS module.

**Parameters:**

- `cluster_id` *(integer)* — The cluster ID of the source node.
- `src_id` *(integer)* — The ID of the source node.
- `msg` *(string)* — The actual message payload.
- `tag` *(string)* — The communication tag of this message, generated by the source node. This could be used to send a reply corresponding to the received message by providing the tag to the cluster_send_rpl() function.
### `E_CLUSTERER_RPL_RECEIVED`

This event is raised when a generic, reply-like, clusterer message is received. This type of message is sent directly from the script and not by an OpenSIPS module.

**Parameters:**

- `cluster_id` *(integer)* — The cluster ID of the source node.
- `src_id` *(integer)* — The ID of the source node.
- `msg` *(string)* — The actual message payload.
- `tag` *(string)* — The communication tag of this message. This could be used to match the received reply with a request sent with the cluster_send_req() or cluster_broadcast_req() functions.
### `E_CLUSTERER_SHARING_TAG_CHANGED`

This event is raised when the state of a sharing tag changes.

**Parameters:**

- `name` *(string)* — The name of the sharing tag.
- `cluster` *(integer)* — The cluster ID.
- `state` *(string)* — The new state of the sharing tag, the possible values: "active" or "backup".
- `reason` *(string)* — short text describing what triggered the change of the state, like a another node stepping as active, an MI command or script variable.

## Configuration Examples

### Example 1.34. Example database content - clusterer table

We insert in the the _clusterer_ table the following:

```opensips
+----+------------+---------+----------------------+-------+-----------------+----------+----------+-------+-------------+
| id | cluster_id | node_id | url                  | state | no_ping_retries | priority | sip_addr | flags | description |
+----+------------+---------+----------------------+-------+-----------------+----------+----------+-------+-------------+
| 10 |          1 |       1 | bin:192.168.0.5:5566 |     1 |                3|       50 | NULL     | NULL  | Node A      |
| 20 |          1 |       2 | bin:192.168.0.6:5566 |     1 |                3|       50 | NULL     | NULL  | Node B      |
+----+------------+---------+----------------------+-------+-----------------+----------+----------+-------+-------------+
```

*   “cluster_id” - identifier of the cluster. All nodes within a group/cluster should have the same id (in our example, both nodes have ID _1_). The values must be greater than 0.
    
*   “node_id” - identifier of the machine/node so each instance within a cluster should have a different ID. The values must be greater than 0. In our example, _Node A_ will have ID 1, and _Node B_ ID 2.
    
*   “url” - address where all the BIN packets for that instance will be sent to.
    
*   “state” - state of the node: _1_ means Enabled, _0_ means Disabled. A disabled node will not send any BIN packets and will drop received ones.
    
*   “no_ping_retries” - maximum number of ping retries before the link with a node is considered down.
    
*   “priority” - the priority of a node to be chosen as next hop in case of same length(number of hops) paths when rerouting messages; it is not relevant for this two-node topology example.
    
*   “sip_addr” - SIP address for the node that is transparently provided to modules; it has no use for the ratelimit module in our example.
    
*   “flags” - used to define a seed node; it has no use in our example.
    
*   “description” - an opaque value used to describe the node
### Example 1.35. _Node A_ configuration

After provisioning the two nodes in the database, we have to configure the two instances of OpenSIPS. First, we configure _Node A_:

```opensips
...
socket= bin:192.168.0.5:5566 # bin listener for Node A

loadmodule "proto_bin.so"

loadmodule "clusterer.so"
modparam("clusterer", "db_url", "mysql://opensips@192.168.0.7/opensips")
modparam("clusterer", "my_node_id", 1) # node_id for Node A

loadmodule "ratelimit.so"
modparam("ratelimit", "pipe_replication_cluster", 1)
...
```
### Example 1.36. _Node B_ configuration

Similarly, the configuration for _Node B_ is as follows:

```opensips
...
socket= bin:192.168.0.6:5566 # bin listener for Node B

loadmodule "proto_bin.so"

loadmodule "clusterer.so"
# ideally, use the same database for both nodes
modparam("clusterer", "db_url", "mysql://opensips@192.168.0.7/opensips")
modparam("clusterer", "my_node_id", 2) # node_id for Node B

loadmodule "ratelimit.so"
modparam("ratelimit", "pipe_replication_cluster", 1)
...
```

Starting the two OpenSIPS instances with the above configurations provides your platform the ability to used shared ratelimit pipes in a very efficient and scalable way.
