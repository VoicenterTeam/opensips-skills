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