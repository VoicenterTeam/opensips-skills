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

**Example�1.31.�`clusterer_list` usage**

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

**Example�1.32.�`clusterer_list_topology` usage**

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

**Example�1.33.�`clusterer_list_cap` usage**

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