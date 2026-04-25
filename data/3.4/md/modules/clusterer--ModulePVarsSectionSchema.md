# CLUSTERER Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6741808)

3.2. [Most recently active contributors(1) to this module](#idp6840976)

**List of Examples**

1.1. [Set `my_node_id` parameter](#idp5891040)

1.2. [Set `db_mode` parameter](#idp5897968)

1.3. [Set `db_url` parameter](#idp5902656)

1.4. [Set `db_table` parameter](#idp5907552)

1.5. [Set `sharing_tag` parameter](#idp5913488)

1.6. [Set `my_node_info` parameter](#idp5920848)

1.7. [Set `neighbor_node_info` parameter](#idp5928800)

1.8. [Set `ping_interval` parameter](#idp5933712)

1.9. [Set `ping_timeout` parameter](#idp5938640)

1.10. [Set `node_timeout` parameter](#idp5943424)

1.11. [Set `seed_fallback_interval` parameter](#idp5948368)

1.12. [Set `sync_timeout` parameter](#idp5953296)

1.13. [Set `sync_packet_size` parameter](#idp5958192)

1.14. [Set `dispatch_jobs` parameter](#idp5964304)

1.15. [Set `id_col` parameter](#idp5969088)

1.16. [Set `cluster_id_col` parameter](#idp5973872)

1.17. [Set `node_id_col` parameter](#idp5978768)

1.18. [Set `url_col` parameter](#idp5983664)

1.19. [Set `state_col` parameter](#idp5988464)

1.20. [Set `no_ping_retries_col` parameter](#idp5993328)

1.21. [Set `priority_col` parameter](#idp5998304)

1.22. [Set `sip_addr_col` parameter](#idp6003184)

1.23. [Set `flags_col` parameter](#idp6008048)

1.24. [Set `description_col` parameter](#idp6012832)

1.25. [Set `enable_stats` parameter](#idp6017952)

1.26. [cluster\_send\_req() usage](#idp6035008)

1.27. [cluster\_send\_rpl() usage](#idp6050128)

1.28. [cluster\_broadcast\_req() usage](#idp6061248)

1.29. [cluster\_check\_addr() usage](#idp6071952)

1.30. [`clusterer_list` usage](#idp6083472)

1.31. [`clusterer_list_topology` usage](#idp6090320)

1.32. [`clusterer_list_cap` usage](#idp6130960)

1.33. [Example database content - clusterer table](#idp6215968)

1.34. [_Node A_ configuration](#idp6232016)

1.35. [_Node B_ configuration](#idp6234672)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _clusterer_ module is used to organize multiple OpenSIPS instances into groups(clusters) in which the nodes can communicate with each other in order to replicate, share information or perform distributed tasks. The distributed logic is performed either by different modules that use the _clusterer_ interface (i.e. the _dialog_ module can replicate dialogs/profiles, the _ratelimit_ module can share pipes across multiple instances etc.) or at the script level. The _clusterer_ module itself only provides an interface to send/receive BIN packets and get notifications about node availability. It achieves this by internally learning the cluster topology and state of the nodes. Provisioning the nodes within a cluster is done over the database or through the configuration script. The node-related information can be checked and triggered to be reloaded by sending commands over the MI interface.

The topology established by the _clusterer_ module is an overlay of nodes where the "links" represent communication availability at BIN interface level. For this purpose, a probing mechanism is used, consisting of regular pings to all nodes in a cluster for which replies must be received within a given interval. All nodes in the cluster exchange information about the state of their links with other nodes and compute a "routing table" which gives a next hop for each destination. The metric for the shortest path is the number of hops. When there is no direct link to a destination, the BIN packet sent by a module is transparently routed through the cluster.

Note that an OpenSIPS instance can belong to multiple clusters, communicating and establishing the topology separately for each one. In order to provision this in the database or the script, each node has an unique ID at global level, which can be referenced in each cluster.

An OpenSIPS instance can dynamically learn all the nodes in the cluster if database provisioning is not desired. It is enough to define at least one neigbour in the script in order to discover all the cluster components.

## 1.2.�Capabilities layer

The clusterer module also keeps track of the state of the nodes in terms of data synchronization for the functionalities (or "capabilities") implemented on top by other modules. Some capabilities require a full data sync(at OpenSIPS startup or at runtime via MI) from a valid "donor" node in the cluster that has the full data set. Furthermore, a capability can query the clusterer module in order to partition some distributed logic only over the synchronized nodes in the cluster.

Each node in the cluster starts with an empty dataset and tries to find a suitable node to pull data from. In order to help "bootstrap" the cluster, a "seed" node should be defined. This is done by setting the value _seed_ for the **flags** column in the clusterer table(or the property with the same name in the _my\_node\_info_ parameter). The seed node will simply fall back to a "synced" state after a configurable interval( [seed\_fallback\_interval](#param_seed_fallback_interval "1.4.11.�seed_fallback_interval") parameter). Note that this mechanism is required only for capabilities that synchronize data at startup, so check the corresponding modules documentation.

The clusterer module transparently exposes the _sip\_addr_ column from the clusterer table(or the property with the same name in the _my\_node\_info_ parameter) to the modules on top so check the corresponding modules documentation for the use of this node related information.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _a database module_ - if [db\_mode](#param_db_mode "1.4.2.�db_mode") is _1_.
    
*   _proto\_bin module_.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`my_node_id`

The id of the local instance. This parameter must be equal to one of the _node\_id_ fields in the database.

_No default value. This parameter must be explicitly set to a value greater than zero._

**Example�1.1.�Set `my_node_id` parameter**

...
modparam("clusterer", "my\_node\_id", 1)
...
		

  

### 1.4.2.�`db_mode`

Specifies whether the node information for the local instance, as well as other instances in the cluster, should be loaded from the database or configured in the script(see [my\_node\_info](#param_my_node_info "1.4.6.�my_node_info") and [neighbor\_node\_info](#param_neighbor_node_info "1.4.7.�neighbor_node_info")). A value of “0” means that DB is not used and the cluster topology in terms of node information will be discovered dynamically at runtime.

If DB mode is enabled, only the nodes defined in the database will be accepted by this instance.

_Default value is “1”_

**Example�1.2.�Set `db_mode` parameter**

...
modparam("clusterer", "db\_mode", 0)
...
		

  

### 1.4.3.�`db_url`

The database url.

_Default value is “NULL”._

**Example�1.3.�Set `db_url` parameter**

...
modparam("clusterer", "db\_url",
	"mysql://opensips:opensipsrw@localhost/opensips")
...
		

  

### 1.4.4.�`db_table`

The name of the table storing the clustering information.

_Default value is “clusterer”._

**Example�1.4.�Set `db_table` parameter**

...
modparam("clusterer", "db\_table", "clusterer")
...
		

  

### 1.4.5.�`sharing_tag`

The definition of a sharing tag. The sharing tag is managed by the clusterer module, but can be used (in terms of reading its state) by any module build on top of clusterer engine, like dialog or presence.

Note that other tags may be dynamically learned during runtime via clustering communication with other nodes.

The format for this value is “tag\_name / cluster\_id = active/backup”.

Multiple definitions of this parameter are allowed. The default value is “none”.

**Example�1.5.�Set `sharing_tag` parameter**

...
modparam("clusterer", "sharing\_tag", "vip1/2=active")
modparam("clusterer", "sharing\_tag", "node/10=backup")
...

  

### 1.4.6.�`my_node_info`

Node specification similar to the information provided by a row in the clusterer DB table corresponding to the local instance. This parameter can be set multiple times in order to include the local node in multiple clusters.

Parameter format: multiple "_prop=value_" property definitions separated by '_,_' where the name of the properties is the same as the DB column names. At least the _cluster\_id_ and _url_ properties must be defined.

This parameter is required if [db\_mode](#param_db_mode "1.4.2.�db_mode") is set to “0” in order to properly advertise information about the local instance in the dynamic node learning process.

**Example�1.6.�Set `my_node_info` parameter**

...
modparam("clusterer", "my\_node\_info", "cluster\_id=1, url=bin:192.168.0.5:5566")
...
		

  

### 1.4.7.�`neighbor_node_info`

Node specification similar to the information provided by a row in the clusterer DB table corresponding to another instance in the cluster. This node will be the entry point in the cluster for the local instance in the dynamic node learning process. This parameter can be set multiple times to define multiple neigbors to connect to (or the same neighbor but in different clusters).

Parameter format: multiple "_prop=value_" property definitions separated by '_,_' where the name of the properties is the same as the DB column names. At least the _cluster\_id_, _node\_id_ and _url_ properties must be defined.

This parameter should be set at least once if [db\_mode](#param_db_mode "1.4.2.�db_mode") is set to _0_ in order to properly learn the cluster topology. If not set, the only way to learn the node topology is by other nodes connecting to the local instance.

**Example�1.7.�Set `neighbor_node_info` parameter**

...
modparam("clusterer", "neighbor\_node\_info", "cluster\_id=1,node\_id=2,url=bin:192.168.0.6:5566")
...
		

  

### 1.4.8.�`ping_interval`

The interval in seconds between regular pings sent to a neighbour node.

_Default value is “4”_

**Example�1.8.�Set `ping_interval` parameter**

...
modparam("clusterer", "ping\_interval", 1)
...
		

  

### 1.4.9.�`ping_timeout`

The time in milliseconds to wait for a reply to a previously sent ping before retrying or considering the link with the neighbour node down. This is also the interval between successive retries if the send fails.

_Default value is “1000”_

**Example�1.9.�Set `ping_timeout` parameter**

...
modparam("clusterer", "ping\_timeout", 500)
...
		

  

### 1.4.10.�`node_timeout`

The time in seconds to wait before pinging is restarted for a failed node.

_Default value is “60”_

**Example�1.10.�Set `node_timeout` parameter**

...
modparam("clusterer", "node\_timeout", 10)
...
		

  

### 1.4.11.�`seed_fallback_interval`

Only relevant for "seed" nodes. The time, in seconds, to wait for a suitable donor node before falling back to a "synced" state, following a node restart or an MI cluster sync command.

_Default value is “5”._

**Example�1.11.�Set `seed_fallback_interval` parameter**

...
modparam("clusterer", "seed\_fallback\_interval", 10)
...
		

  

### 1.4.12.�`sync_timeout`

The inteval, in seconds, since the last sync data packet received after which to consider the sync process as failed and revert the node to the not synced state.

_Default value is “15”._

**Example�1.12.�Set `sync_timeout` parameter**

...
modparam("clusterer", "sync\_timeout", 5)
...
		

  

### 1.4.13.�`sync_packet_size`

The maximum size of the BIN packets sent while doing data synchronization. This is only a suggested value as the actual size of the packets may be slightly larger.

_Default value is “65535”._

**Example�1.13.�Set `sync_packet_size` parameter**

...
modparam("clusterer", "sync\_packet\_size", 32765)
...
		

  

### 1.4.14.�`dispatch_jobs`

Enables the dispatching of jobs(processing replicated data packets) from the receiving TCP worker process to free opensips workers (including UDP, timer processes etc.).

This generally improves the performance of handling replication packets in high traffic scenarios and should not be disabled.

Nevertheless there are cases where the "thundering herd" problem occurs which causes abnormaly high CPU loads. Disabling this dispatching mechanism solves such issues.

_Default value is “1” (enabled)._

**Example�1.14.�Set `dispatch_jobs` parameter**

...
modparam("clusterer", "dispatch\_jobs", 0)
...
		

  

### 1.4.15.�`id_col`

The name of the column storing an id for the table rows.

_Default value is “id”._

**Example�1.15.�Set `id_col` parameter**

...
modparam("clusterer", "id\_col", "id")
...
		

  

### 1.4.16.�`cluster_id_col`

The name of the column to store the id of a cluster.

_Default value is “cluster\_id”._

**Example�1.16.�Set `cluster_id_col` parameter**

...
modparam("clusterer", "cluster\_id\_col", "cluster\_id")
...
		

  

### 1.4.17.�`node_id_col`

The name of the column to store the id of an instance. The values must be greater than 0.

_Default value is “node\_id”._

**Example�1.17.�Set `node_id_col` parameter**

...
modparam("clusterer", "node\_id\_col", "node\_id")
...
		

  

### 1.4.18.�`url_col`

The name of the column containing the instance url. The values must be greater than 0.

_Default value is “url”._

**Example�1.18.�Set `url_col` parameter**

...
modparam("clusterer", "url\_col", "url")
...
		

  

### 1.4.19.�`state_col`

The name of the column storing the state of the node(enabled/disabled).

_Default value is “state”._

**Example�1.19.�Set `state_col` parameter**

...
modparam("clusterer", "state\_col", "state")
...
		

  

### 1.4.20.�`no_ping_retries_col`

The name of the column containing the maximum number of ping retries before the link with the neighbour node is considered down.

_Default value is “no\_ping\_retries”._

**Example�1.20.�Set `no_ping_retries_col` parameter**

...
modparam("clusterer", "no\_ping\_retries\_col", "no\_ping\_retries")
...
		

  

### 1.4.21.�`priority_col`

The name of the column storing the node priority to be chosen as next hop in case of same length(number of hops) paths when rerouting messages.

_Default value is “priority”._

**Example�1.21.�Set `priority_col` parameter**

...
modparam("clusterer", "priority\_col", "priority")
...
		

  

### 1.4.22.�`sip_addr_col`

The name of the column containing a SIP address for the node.

_Default value is “sip\_addr”._

**Example�1.22.�Set `sip_addr_col` parameter**

...
modparam("clusterer", "sip\_addr\_col", "sip\_addr")
...
		

  

### 1.4.23.�`flags_col`

The name of the column containing the node flags.

_Default value is “flags”._

**Example�1.23.�Set `flags_col` parameter**

...
modparam("clusterer", "flags\_col", "flags")
...
		

  

### 1.4.24.�`description_col`

The name of the column containing a node description.

_Default value is “description”._

**Example�1.24.�Set `description_col` parameter**

...
modparam("clusterer", "description\_col", "description")
...
		

  

### 1.4.25.�`enable_stats` (integer)

If the statistics support should be enabled or not. Via statistic variables, the module provide information about the cluster nodes. Set it to zero to disable or to non-zero to enable it.

_Default value is “1 (enabled)”._

**Example�1.25.�Set `enable_stats` parameter**

...
modparam("clusterer", "enable\_stats", 0)
...
				

  

## 1.5.�Exported Functions

### 1.5.1.� `cluster_send_req(cluster_id, dst_id, msg, [tag])`

This function is used to send a generic, request-like message, containing custom data, to a specific node in a cluster, directly from the script. The message is not a "request" per se but according to the logic on the receiving side, that node can send back a reply. In order to correlate a received reply with the request sent out, the function returns, through the _tag_ parameter, a randomly generated communication tag, which is sent along in the the original message, that can be checked against the tag received in a reply.

Meaning of the parameters is as follows:

*   _cluster\_id_ (int) - the cluster ID of the destination node;
    
*   _dst\_id_ (int) - the ID of the destiantion node;
    
*   _msg_ (string) - actual message payload;
    
*   _tag_ (var, optional) - randomly generated communication tag.
    

The function can return the following values:

*   _1_ - successfully sent message to destination node or a valid next hop
    
*   _\-1_ - local node is disabled so sending is impossbile
    
*   _\-2_ - destination node is not reachable through any path according to the discovered topology
    
*   _\-3_ - destination node or valid next hop appear to be reachable but send failed or other OpenSIPS internal error
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and EVENT\_ROUTE.

**Example�1.26.�cluster\_send\_req() usage**

...
# send a request
cluster\_send\_req(1, 1, "Check USER: $fU", $var(req\_tag));
# wait for reply
$avp(filter) = "tag=" + $var(req\_tag);
async(wait\_for\_event("E\_CLUSTERER\_RPL\_RECEIVED", $avp(filter), 5), rpl\_resume);
# done
...
route\[rpl\_resume\] {
  xlog("Received reply: $avp(msg)\\n");
}
...
				

  

### 1.5.2.� `cluster_send_rpl(cluster_id, dst_id, msg, tag)`

This function is used to send a generic, reply-like message, containing custom data, to a specific node in a cluster, directly from the script. The message is marked as a "reply" so this function should ony be used for replying to a previously request-like message received. In order for the other node, which initially sent a request, to be able to correlate it with this reply, a communication tag, received along with the request, should be passed to the function.

Meaning of the parameters is as follows:

*   _cluster\_id_ (int) - the cluster ID of the destination node;
    
*   _dst\_id_ (int) - the ID of the destiantion node;
    
*   _msg_ (string) - actual message payload;
    
*   _tag_ (var) - communication tag.
    

The function can return the following values:

*   _1_ - successfully sent message to destination node or a valid next hop
    
*   _\-1_ - local node is disabled so sending is impossbile
    
*   _\-2_ - destination node is not reachable through any path according to the discovered topology
    
*   _\-3_ - destination node or valid next hop appear to be reachable but send failed or other OpenSIPS internal error
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and EVENT\_ROUTE.

**Example�1.27.�cluster\_send\_rpl() usage**

...
event\_route\[E\_CLUSTERER\_REQ\_RECEIVED\] {
  cluster\_send\_rpl($param(cluster\_id), $param(src\_id), $var(my\_reply), $param(tag));
}
...
				

  

### 1.5.3.� `cluster_broadcast_req(cluster_id, msg, [tag])`

This function has a similar behaviour to the `cluster_send_req()` function with the exception that the message is sent to all the nodes in the specified cluster.

The function can return the following values:

*   _1_ - successfully sent message to at least one node;
    
*   _\-1_ - local node is disabled so sending is impossbile;
    
*   _\-2_ - all nodes in the cluster are unreachable according to the discovered topology;
    
*   _\-3_ - send failed for all nodes in the cluster or other OpenSIPS internal error.
    

The meaning of the parameters is the same as for `cluster_send_req()`.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and EVENT\_ROUTE.

**Example�1.28.�cluster\_broadcast\_req() usage**

...
cluster\_broadcast\_req($var(cl\_id), $var(share\_data));
...
				

  

### 1.5.4.� `cluster_check_addr(cluster_id, ip, addr_type)`

This function checks whether the given IP address belongs to one of the nodes in the cluster.

Parameters:

*   _cluster\_id_ (int)
    
*   _ip_ (string)
    
*   _addr\_type_ (string, optional) - select the address of the node that the comparison is made against, with the possible values of:
    
    *   _"sip"_ (default) - a node's DB provisioned SIP address
        
    *   _"bin"_ - a node's BIN interface listener
        
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE, LOCAL\_ROUTE and EVENT\_ROUTE.

**Example�1.29.�cluster\_check\_addr() usage**

...
if (cluster\_check\_addr(1, $si)) {
	...
}
...
				

  

## 1.6.�Exported MI Functions

### 1.6.1.� `clusterer_reload`

Reloads data from the clusterer database. The currently established topology will be lost and the node will rediscover the new topology.

Name: _clusterer\_reload_

Parameters:_none_

MI FIFO Command Format:

		opensips-cli -x mi clusterer\_reload
		

### 1.6.2.� `clusterer_list`

Lists information(node id, URL, link state with that node etc.) about the other nodes in each cluster.

Name: _clusterer\_list_

Parameters:_none_

**Example�1.30.�`clusterer_list` usage**

$ opensips-cli -x mi clusterer\_list
{
    "Clusters": \[
        {
            "cluster\_id": 1,
            "Nodes": \[
                {
                    "node\_id": 1,
                    "db\_id": 1,
                    "url": "bin:127.0.0.1",
                    "link\_state": "Up",
                    "next\_hop": "1",
                    "description": "none"
                }
            \]
        }
    \]
}

  

### 1.6.3.� `clusterer_list_topology`

Lists each cluster's topology from the local node's perspective as an adjacency list. A node appears as a neighbour if the link with that node is up.

Note that if a node id appears in multiple clusters, it refers to the same instance that belongs to different clusters, for which it has a different topology.

Name: _clusterer\_list\_topology_

Parameters:_none_

**Example�1.31.�`clusterer_list_topology` usage**

$ opensips-cli -x mi clusterer\_list\_topology
{
    "Clusters": \[
        {
            "cluster\_id": 1,
            "Nodes": \[
                {
                    "node\_id": 2,
                    "Neighbours": \[
                        1
                    \]
                },
                {
                    "node\_id": 1,
                    "Neighbours": \[
                        2
                    \]
                }
            \]
        }
    \]
}

  

### 1.6.4.� `clusterer_set_status`

Sets the status(Enabled/Disabled) of a node. If the local instance is disabled, the node will not send any messages and ignore received ones thus appearing as a failed node in the topology (from the other node's perspective). If a different node is disabled, the specified node will simply be ignored by the local instance in terms of sending/receiving any messages, as if no longer part of the topology.

Name: _clusterer\_set\_status_

Parameters:

*   _cluster\_id_ - indicates the id of the cluster.
    
*   _node\_id_ (optional) - indicates the id of the node to be disabled. If missing, the local instance will be disalbed.
    
*   _status_ - indicates the new status(0 - Disabled, 1 - Enabled).
    

MI FIFO Command Format:

		#disable the local instance
		opensips-cli -x mi clusterer\_set\_status 1 0
		#disable node ID 3
		opensips-cli -x mi clusterer\_set\_status 1 3 0
		

### 1.6.5.� `clusterer_remove_node`

Removes a node from the cluster's topology. It is enough to run the function on a single node in order to remove the target node from all the other nodes in the cluster. If the node to be removed is running when triggering this function, it will be automatically disabled (equivalent to running [clusterer\_set\_status](#mi_clusterer_set_status "1.6.4.� clusterer_set_status") on that specific node).

This function can only be used when [db\_mode](#param_db_mode "1.4.2.�db_mode") is set to _0_ (disabled).

Name: _clusterer\_remove\_node_

Parameters:

*   _cluster\_id_ - cluster ID
    
*   _node\_id_ - ID of the node to be removed.
    

MI FIFO Command Format:

		opensips-cli -x mi clusterer\_remove\_node 1 3
		

### 1.6.6.� `cluster_send_mi`

Dispatches a given MI command to be run on a specific node in the cluster.

Name: _cluster\_send\_mi_

Parameters:

*   _cluster\_id_ - id of the cluster.
    
*   _destination_ - id of the destination node
    
*   _cmd\_name_ - name of the MI command to be run
    
*   _cmd\_params_ (optional) - array of parameters for the MI command to be run
    

Note that MI commands that require named parameters or arrays as parameter values are not currently supported.

MI FIFO Command Format:

opensips-cli -x mi cluster\_send\_mi 1 3 lb\_reload
		

### 1.6.7.� `cluster_broadcast_mi`

Dispatches a given MI command to be run on all the nodes in a cluster. The command is also executed locally.

Name: _cluster\_broadcast\_mi_

Parameters:

*   _cluster\_id_ - id of the cluster.
    
*   _cmd\_name_ - name of the MI command to be run
    
*   _cmd\_params_ (optional) - array of parameters for the MI command to be run
    

Note that MI commands that require named parameters or arrays as parameter values are not currently supported.

MI FIFO Command Format:

opensips-cli -x mi cluster\_broadcast\_mi 1 dr\_reload partition\_5
		

### 1.6.8.� `clusterer_list_cap`

Lists the registered capabilities and their states.

Name: _clusterer\_list\_cap_

Parameters:_none_

**Example�1.32.�`clusterer_list_cap` usage**

$ opensips-cli -x mi clusterer\_list\_cap
{
    "Clusters": \[
        {
            "cluster\_id": 1,
            "Capabilities": \[
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
            \]
        }
    \]
}

  

### 1.6.9.� `clusterer_set_cap_status`

Sets the status(Enabled/Disabled) of a capability. If a capability is disabled, the node will not send any replication/sync messages belonging to that capability. Likewise, received messages will be dropped. Also, the cabability will transition to a "not synced" state and the node will no longer be able to be a donor for syncing.

Name: _clusterer\_set\_cap\_status_

Parameters:

*   _cluster\_id_ - the id of the cluster
    
*   _capability_ - name of the capability, as listed by [clusterer\_list\_cap](#mi_clusterer_list_cap "1.6.8.� clusterer_list_cap")
    
*   _status_ - indicates the new status(0 - Disabled, 1 - Enabled).
    

MI FIFO Command Format:

		#disable dialog replication in cluster 1
		opensips-cli -x mi clusterer\_set\_cap\_status 1 dialog-dlg-repl 0
		#enable dialog profile replication in cluster 2
		opensips-cli -x mi clusterer\_set\_cap\_status 2 dialog-prof-repl 1
		

### 1.6.10.�`clusterer_shtag_set_active`

Set the given sharing tag to the _active_ state. The information about this change is also broadcasted in the cluster in order to force any other node that may be active on this tag to step down to backup.

Name: _clusterer\_shtag\_set\_active_

Parameters: _tag_ - the name of the tag to be set active and the cluster it belogs to, in the format 'tag/cluster\_id'.

MI FIFO Command Format:

		opensips-cli -x mi clusterer\_shtag\_set\_active vip1/3
		

### 1.6.11.�`clusterer_list_shtags`

Lists all known sharing tags and their states.

Name: _clusterer\_list\_shtags_

Parameters: _Command takes no parameters_

MI FIFO Command Format:

		opensips-cli -x mi clusterer\_list\_shtags
		

## 1.7.�Exported Script Variables

### 1.7.1.�`$cluster.sh_tag`

This is a read/write variable that allows access to the sharing tags managed by the clusterer module.

The name of such a variable has the format of _tag\_name/cluster\_id_, like _$cluster.sh\_tag(vip/3)_ accessing the sharing tag "vip" from cluster ID 3.

When setting, a sharing tag may be only switched to active by assigned it:

*   _"active"_ string value
*   _1_ or higher numerical value

When reading it value, a sharing tag returns:

*   _"active" or 1_ if active
*   _"backup" or 0_ if backup

A NULL value may returned only as a result of an internal error (like memory errors).

## 1.8.�Exported Events

### 1.8.1.� `E_CLUSTERER_REQ_RECEIVED`

This event is raised when a generic, request-like, clusterer message is received. This type of message is sent directly from the script and not by an OpenSIPS module.

Parameters:

*   _cluster\_id_ - The cluster ID of the source node.
    
*   _src\_id_ - The ID of the source node.
    
*   _msg_ - The actual message payload.
    
*   _tag_ - The communication tag of this message, generated by the source node. This could be used to send a reply corresponding to the received message by providing the tag to the `cluster_send_rpl()` function.
    

### 1.8.2.� `E_CLUSTERER_RPL_RECEIVED`

This event is raised when a generic, reply-like, clusterer message is received. This type of message is sent directly from the script and not by an OpenSIPS module.

Parameters:

*   _cluster\_id_ - The cluster ID of the source node.
    
*   _src\_id_ - The ID of the source node.
    
*   _msg_ - The actual message payload.
    
*   _tag_ - The communication tag of this message. This could be used to match the received reply with a request sent with the `cluster_send_req()` or `cluster_broadcast_req()` functions.
    

### 1.8.3.� `E_CLUSTERER_NODE_STATE_CHANGED`

This event is raised when the state of a node changes in terms of availability.

Parameters:

*   _cluster\_id_ - The cluster ID.
    
*   _node\_id_ - The ID of the node.
    
*   _new\_state_ - The new state of the node, with the possible values: 0 - down, 1 - up.
    

### 1.8.4.� `E_CLUSTERER_SHARING_TAG_CHANGED`

This event is raised when the state of a sharing tag changes.

Parameters:

*   _name_ - The name of the sharing tag.
    
*   _cluster\_id_ - The cluster ID.
    
*   _node\_id_ - The ID of the node.
    
*   _state_ - The new state of the sharing tag, the possible values: "active" or "backup".
    
*   _reason_ - short text describing what triggered the change of the state, like a another node stepping as active, an MI command or script variable.
    

## 1.9.�Exported Status/Report Identifiers

The module provides the _clusterer_ Status/Report group.

### 1.9.1.�`sharing_tags`

The _sharing\_tags_ identifier is provided for reporting state changes of the sharing\_tags (between active and backup), along with the reason of the change. This identifier has a 200 records history before discarding the old ones.

{
    "Name": "sharing\_tags",
    "Reports": \[
        {
            "Timestamp": 1652367224,
            "Date": "Thu May 12 17:53:44 2022",
            "Log": "TAG <HA>, cluster 1, became backup due to cluster broadcast from 2"
        },
        {
            "Timestamp": 1652367326,
            "Date": "Thu May 12 17:55:26 2022",
            "Log": "TAG <HA>, cluster 1, became active due to MI command"
        }
    \]
}

	

### 1.9.2.�`node_states`

The _node\_states_ identifier is used for reporting node state changes (in terms of availability). This identifier has a 200 records history before discarding the old ones.

{
    "Name": "node\_states",
    "Reports": \[
        {
            "Timestamp": 1656489246,
            "Date": "Wed Jun 29 10:54:06 2022",
            "Log": "Node \[2\], cluster \[1\] is UP"
        },
        {
            "Timestamp": 1656489261,
            "Date": "Wed Jun 29 10:54:21 2022",
            "Log": "Node \[2\], cluster \[1\] is DOWN"
        }
    \]
}

	

### 1.9.3.�`cap:[capability_name]`

Each capability registered to the clusterer module has a corresponding identifier, named _cap:\[capability\_name\]_, used for providing the status of the data syncing for that capability. This status reflects the progress of the syncing process and can have the following values:

*   _\-3_ - not synced
    
*   _\-2_ - sync pending (waiting for either a suitable donor node or actual sync data)
    
*   _\-1_ - sync in progress
    
*   _1_ - synced (either sync has completed or the capability does not require data syncing at all)
    

{
    "Name": "cap:dialog-dlg-repl",
    "Readiness": true,
    "Status": 1,
    "Details": "synced"
},
	

The capability identifiers also provide reports regarding the main stages of the sync process. These identifiers have a 200 records history before discarding the old ones.

{
    "Name": "cap:dialog-dlg-repl",
    "Reports": \[
        {
            "Timestamp": 1656966903,
            "Date": "Mon Jul  4 23:35:03 2022",
            "Log": "Sync requested"
        },
        {
            "Timestamp": 1656966904,
            "Date": "Mon Jul  4 23:35:04 2022",
            "Log": "Sync started from node \[1\]"
        },
        {
            "Timestamp": 1656966906,
            "Date": "Mon Jul  4 23:35:06 2022",
            "Log": "Sync completed, received \[10000\] chunks"
        }
    \]
},

	

For how to access and use the Status/Report information, please see [Status/Report Interface documentation](https://www.opensips.org/Documentation/Interface-StatusReport-3-4).

## 1.10.�Usage Example

This section provides an usage example for replicating ratelimit pipes between two OpenSIPS instances. It uses the clusterer module to manage the replicating nodes, and along with the _proto\_bin_ module, to send the replicated information.

The setup topology is simple: we have two OpenSIPS nodes running on two separate machines (although they could run on the same machine as well): _Node A_ has IP 192.168.0.5 and _Node B_ has IP 192.168.0.6. Both have, besides the traffic listeners (UDP, TCP, etc.), BIN listeners bound on port _5566_. These listeners will be used for the binary communication.

We insert in the the _clusterer_ table the following:

**Example�1.33.�Example database content - clusterer table**

+----+------------+---------+----------------------+-------+-----------------+----------+----------+-------+-------------+
| id | cluster\_id | node\_id | url                  | state | no\_ping\_retries | priority | sip\_addr | flags | description |
+----+------------+---------+----------------------+-------+-----------------+----------+----------+-------+-------------+
| 10 |          1 |       1 | bin:192.168.0.5:5566 |     1 |                3|       50 | NULL     | NULL  | Node A      |
| 20 |          1 |       2 | bin:192.168.0.6:5566 |     1 |                3|       50 | NULL     | NULL  | Node B      |
+----+------------+---------+----------------------+-------+-----------------+----------+----------+-------+-------------+
		

  

*   “cluster\_id” - identifier of the cluster. All nodes within a group/cluster should have the same id (in our example, both nodes have ID _1_). The values must be greater than 0.
    
*   “node\_id” - identifier of the machine/node so each instance within a cluster should have a different ID. The values must be greater than 0. In our example, _Node A_ will have ID 1, and _Node B_ ID 2.
    
*   “url” - address where all the BIN packets for that instance will be sent to.
    
*   “state” - state of the node: _1_ means Enabled, _0_ means Disabled. A disabled node will not send any BIN packets and will drop received ones.
    
*   “no\_ping\_retries” - maximum number of ping retries before the link with a node is considered down.
    
*   “priority” - the priority of a node to be chosen as next hop in case of same length(number of hops) paths when rerouting messages; it is not relevant for this two-node topology example.
    
*   “sip\_addr” - SIP address for the node that is transparently provided to modules; it has no use for the ratelimit module in our example.
    
*   “flags” - used to define a seed node; it has no use in our example.
    
*   “description” - an opaque value used to describe the node
    

After provisioning the two nodes in the database, we have to configure the two instances of OpenSIPS. First, we configure _Node A_:

**Example�1.34.�_Node A_ configuration**

...
socket= bin:192.168.0.5:5566 # bin listener for Node A

loadmodule "proto\_bin.so"

loadmodule "clusterer.so"
modparam("clusterer", "db\_url", "mysql://opensips@192.168.0.7/opensips")
modparam("clusterer", "my\_node\_id", 1) # node\_id for Node A

loadmodule "ratelimit.so"
modparam("ratelimit", "pipe\_replication\_cluster", 1)
...
		

  

Similarly, the configuration for _Node B_ is as follows:

**Example�1.35.�_Node B_ configuration**

...
socket= bin:192.168.0.6:5566 # bin listener for Node B

loadmodule "proto\_bin.so"

loadmodule "clusterer.so"
# ideally, use the same database for both nodes
modparam("clusterer", "db\_url", "mysql://opensips@192.168.0.7/opensips")
modparam("clusterer", "my\_node\_id", 2) # node\_id for Node B

loadmodule "ratelimit.so"
modparam("ratelimit", "pipe\_replication\_cluster", 1)
...
		

  

Starting the two OpenSIPS instances with the above configurations provides your platform the ability to used shared ratelimit pipes in a very efficient and scalable way.

## 1.11.�Exported Statistics

### 1.11.1.� `clusterer_nodes`

Returns the total number of cluster nodes.

### 1.11.2.� `clusterer_nodes_up`

Returns the total number of cluster nodes in the UP state.

### 1.11.3.� `clusterer_nodes_down`

Returns the total number of cluster nodes not in the UP state.

## Chapter�2.�Developer Guide

## 2.1.�Available Functions

### 2.1.1.� `get_nodes(cluster_id)`

This function will return a list of all the reachable nodes(if the direct link is down/probing, a path through intermediary nodes is considered) in the specified cluster.

The returned nodes structure:

...
typedef struct clusterer\_node {
    int node\_id;
    union sockaddr\_union addr;
    str sip\_addr;
    str description;
    struct clusterer\_node \*next;
} clusterer\_node\_t;
...
        

Meaning of the parameters is as follows:

*   _int cluster\_id_ - the cluster id
    

### 2.1.2.� `free_nodes(list)`

This function will free the lits of nodes returned by _get\_nodes_.

Meaning of the parameters is as follows:

*   _clusterer\_node\_t \*list_ - list header
    

### 2.1.3.� `set_state(cluster_id, state)`

This function sets the state(enabled/disabled) of the current node in the specified cluster.

Meaning of the parameters is as follows:

*   _int cluster\_id_ - the cluster id
    
*   _enum cl\_node\_state state_ - the new state; possible values:
    
    *   _STATE\_DISABLED_
        
    *   _STATE\_ENABLED_
        
    

### 2.1.4.� `check_addr(cluster_id, su)`

This function checks if a given address belongs to one of the nodes in the cluster.

Meaning of the parameters is as follows:

*   _int cluster\_id_ - the cluster id
    
*   _union sockaddr\_union\* su_ - socket address
    

### 2.1.5.� `get_my_id()`

This function will return the id of the current node.

### 2.1.6.� `send_to(packet, cluster_id, node_id)`

This functon will send the given BIN packet to the specified node in the cluster. If the direct link is down/probing, it will send the packet to an intermediary node if the destination node is reachable through another path in the cluster topology.

Meaning of the parameters is as follows:

*   _bin\_packet\_t packet_ - the packet to be sent
    
*   _int cluster\_id_ - the cluster id
    
*   _int node\_id_ - the id of the destination node
    

The function returns one of the following:

*   _CLUSTERER\_SEND\_SUCCESS_ - successfully sent packet to destination node or a valid next hop
    
*   _CLUSTERER\_CURR\_DISABLED_ - current node is disabled so sending is impossbile
    
*   _CLUSTERER\_DEST\_DOWN_ - destination node is not reachable through any path according to the discovered topology
    
*   _CLUSTERER\_SEND\_ERR_ - destination node or valid next hop appear to be reachable but send failed
    

### 2.1.7.� `send_all(packet, cluster_id)`

Send the given BIN packet to all the nodes in the specified cluster. The function operates similarly to _send\_to_.

Meaning of the parameters is as follows:

*   _bin\_packet\_t packet_ - the packet to be sent
    
*   _int cluster\_id_ - the cluster id
    

The function returns one of the following:

*   _CLUSTERER\_SEND\_SUCCESS_ - successfully sent packet to at least one node
    
*   _CLUSTERER\_CURR\_DISABLED_ - current node is disabled so sending is impossbile
    
*   _CLUSTERER\_DEST\_DOWN_ - all nodes in the cluster are unreachable according to the discovered topology
    
*   _CLUSTERER\_SEND\_ERR_ - send failed for all nodes in the cluster
    

### 2.1.8.� `get_next_hop(cluster_id, node_id)`

This function returns the next hop from the computed shortest path to the given destination node in the specified cluster. This is the node that is the actual destination for the _send\_to_ and _send\_all_ functions when the direct link with the intended destination is down. The function returns the same structure as _get\_nodes_.

Meaning of the parameters is as follows:

*   _int cluster\_id_ - the cluster id
    
*   _int node\_id_ - the node id of the destination for which the next hop is returned.
    

### 2.1.9.� `free_next_hop(next_hop)`

This function will free the next hop returned by _get\_next\_hop_.

Meaning of the parameters is as follows:

*   _clusterer\_node\_t \*next\_hop_ - next hop to be freed
    

### 2.1.10.� `register_module(mod_name, cb, auth_check, accept_clusters_ids, no_accept_clusters)`

This function registers an OpenSIPS module in order to receive BIN packets and cluster notifications. A certain module can accept packets from multiple clusters and provides a single callback function that will be called for each received packet. This function will also be called to notify cluster events like nodes becoming reachable/unreachable.

Meaning of the parameters is as follows:

*   _char \*mod\_name_ - module name
    
*   _clusterer\_cb\_f cb_ - callback function
    
*   _int auth\_check_ - 0 - no check, 1 - for every BIN packet received check if source IP belongs to one of the nodes in the cluster
    
*   _int\* accept\_clusters\_ids_ - array of cluster ids from which packets are accepted
    
*   _int no\_accept\_clusters_ - length of _accept\_clusters\_ids_ array
    

The callback function prototype:

...
typedef void (\*clusterer\_cb\_f)(enum clusterer\_event ev,bin\_packet\_t \*, int packet\_type,
                struct receive\_info \*ri, int cluster\_id, int src\_id, int dest\_id);
...

Possble values for the event signaled through _ev_ parameter of the callback funtion:

*   _CLUSTER\_RECV\_MSG_ - received BIN message
    
*   _CLUSTER\_ROUTE\_FAILED_ - failed to route a received BIN packet destined for another node in the cluster
    
*   _CLUSTER\_NODE\_UP_ - a node became reachable
    
*   _CLUSTER\_NODE\_DOWN_ - a node became unreachable
    

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

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

360

135

13387

7101

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

72

54

868

585

3.

Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian))

45

10

3142

534

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

30

16

1342

128

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

26

20

326

147

6.

Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit))

9

2

250

212

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

6

4

10

11

8.

Jasper Hafkenscheid

4

2

107

2

9.

Fabian Gast ([@fgast](https://github.com/fgast))

4

2

3

3

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

4

2

2

2

  

**All remaining contributors**: Gohar Ahmed ([@goharahmed](https://github.com/goharahmed)), kworm83.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jul 2025

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2016 - Apr 2025

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2016 - Sep 2024

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Nov 2015 - Sep 2024

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Jul 2016 - Jul 2023

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Feb 2023

7.

Jasper Hafkenscheid

May 2022 - Jul 2022

8.

kworm83

Feb 2021 - Feb 2021

9.

Fabian Gast ([@fgast](https://github.com/fgast))

Nov 2018 - Jul 2020

10.

Gohar Ahmed ([@goharahmed](https://github.com/goharahmed))

Mar 2019 - Mar 2019

  

**All remaining contributors**: Ionel Cerghit ([@ionel-cerghit](https://github.com/ionel-cerghit)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Jasper Hafkenscheid, Fabian Gast ([@fgast](https://github.com/fgast)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Eseanu Marius Cristian ([@eseanucristian](https://github.com/eseanucristian)).

_Documentation Copyrights:_

Copyright � 2015-2017 [www.opensips-solutions.com](http://www.opensips-solutions.com/)