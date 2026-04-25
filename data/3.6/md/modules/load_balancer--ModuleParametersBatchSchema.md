## 1.5.�Exported Parameters

### 1.5.1.�`db_url` (string)

The URL pointing to the database where the load-balancing rules are stored.

_Default value is “mysql://opensips:opensipsrw@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("load\_balancer", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.5.2.�`db_table` (string)

The name of the DB table containing the load-balancing rules.

_Default value is “load\_balancer”._

**Example�1.2.�Set `db_table` parameter**

...
modparam("load\_balancer", "db\_table", "lb")
...

  

### 1.5.3.�`probing_interval` (integer)

How often (in seconds) the probing of a destination should be done. If set to 0, the probing will be disabled as functionality (for all destinations)

_Default value is “30”._

**Example�1.3.�Set `probing_interval` parameter**

...
modparam("load\_balancer", "probing\_interval", 60)
...

  

### 1.5.4.�`probing_method` (string)

The SIP method to be used for the probing requests.

_Default value is “"OPTIONS"”._

**Example�1.4.�Set `probing_method` parameter**

...
modparam("load\_balancer", "probing\_method", "INFO")
...

  

### 1.5.5.�`probing_from` (string)

The FROM SIP URI to be advertised in the SIP probing requests.

_Default value is “"sip:prober@localhost"”._

**Example�1.5.�Set `probing_from` parameter**

...
modparam("load\_balancer", "probing\_from", "sip:pinger@192.168.2.10")
...

  

### 1.5.6.�`probing_reply_codes` (string)

A comma separted list of SIP reply codes. The codes defined here will be considered as valid reply codes for probing messages, apart for 200.

_Default value is “NULL”._

**Example�1.6.�Set `probing_reply_codes` parameter**

...
modparam("load\_balancer", "probing\_reply\_codes", "501, 403")
...

  

### 1.5.7.�`probing_verbose` (number)

A boolean option to enable extra logging related to the enabling or disabling of the destinations based on probing replies and MI commands.

A 0 value means disabled, anything else means enabled.

The extra logging will be done on INFO level.

_Default value is “0” (disabled)._

**Example�1.7.�Set `probing_verbose` parameter**

...
modparam("load\_balancer", "probing\_verbose", 1)
...

  

### 1.5.8.�`lb_define_blacklist` (string)

Defines a blacklist based on a lb group. This list will contain the IPs (no port, all protocols) of the destinations matching the given group.

Multiple instances of this param are allowed.

_Default value is “NULL”._

**Example�1.8.�Set the `lb_define_blacklist` parameter**

...
modparam("load\_balancer", "lb\_define\_blacklist", "list= 1,4,3")
modparam("load\_balancer", "lb\_define\_blacklist", "blist2= 2,10,6")
...

  

### 1.5.9.�`fetch_freeswitch_stats` (integer)

If enabled, the maximum value of a resource may also consist of FreeSWITCH Event Socket Layer URLs, e.g. _"channels=fs://:password@freeswitch.example.com"_ or _"channels=fs://user:password@127.0.0.1:8021"_. The default ESL port is 8021.

OpenSIPS will establish a connection with the given socket and periodically update the internal maximum value of the given resource using statistics pushed by the FreeSWITCH box.

The max value of a resource is updated every _event\_heartbeat\_interval_ seconds (see the "freeswitch" OpenSIPS module for more details regarding this setting), as the stats arrive from FreeSWITCH.

Given the following format for FreeSWITCH heartbeat messages:

{
  ...
  "FreeSWITCH-Hostname": "pbx2",
  "FreeSWITCH-IPv4": "172.17.0.3",
  "Idle-CPU": "78.400000",
  "Max-Sessions": "1000",
  "Session-Count": "0",
  ...
}

, the load balancer uses the following formula in order to periodically update its "max\_load" values for each FreeSWITCH box (FreeSWITCH data is highlighted in bold):

_max\_load = (**Idle-CPU** / 100) \* (**Max-Sessions** - (**Session-Count** - current\_load))_

_Default value is “0” (disabled)._

**Example�1.9.�Set the `fetch_freeswitch_load` parameter**

...
modparam("load\_balancer", "fetch\_freeswitch\_stats", 1)
...

  

### 1.5.10.�`initial_freeswitch_load` (integer)

This parameter is only relevant for some seconds after module startup/reload, when no statistics from newly loaded FreeSWITCH ESL sockets have arrived, yet the routing of calls must remain unaffected. Any FreeSWITCH-enabled resource will inherit this value for the entire interval mentioned above (up to 20 seconds!).

_Default value is “1000”._

**Example�1.10.�Set the `initial_freeswitch_load` parameter**

...
modparam("load\_balancer", "initial\_freeswitch\_load", 200)
...

  

### 1.5.11.�`cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used in load-balancer module for two purposes: for sharing the status of the destinations and for controlling the pinging to destinations.

If clustering enbled, the module will automatically share changes over the status of the destinations with the other OpenSIPS instances that are part of a cluster. Whenever such a status changes (following an MI command, a probing result, a script command), the module will replicate this status change to all the nodes in this given cluster.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to destinations. See the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.5.12.�cluster_sharing_tag (string)") option.

This OpenSIPS cluster exposes the **"load\_balancer-status-repl"** capability in order to mark nodes as eligible for becoming data donors during an arbitrary sync request. Consequently, the cluster must have _at least one node_ marked with the **"seed"** value as the _clusterer.flags_ column/property in order to be fully functional. Consult the [clusterer - Capabilities](clusterer#capabilities) chapter for more details.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the "clusterer" module.

_Default value is “0 (none)”._

**Example�1.11.�Set `cluster_id` parameter**

...
# replicate destination status with all OpenSIPS in cluster ID 9
modparam("load\_balancer", "cluster\_id", 9)
...

  

### 1.5.12.�`cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform the self-triggered actions in the module. Such actions may be the destination probing or sharing the changes in the destination status. If defined, only the node with active status of this tag will perform the actions (pinging and sharing status).

The [cluster\_id](#param_cluster_id "1.5.11.�cluster_id (integer)") must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will individually do the probing and share the status changes.

_Default value is “empty (none)”._

**Example�1.12.�Set `cluster_sharing_tag` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
# and broadcast the status changes
modparam("load\_balancer", "cluster\_id", 9)
modparam("load\_balancer", "cluster\_sharing\_tag", "vip")
...