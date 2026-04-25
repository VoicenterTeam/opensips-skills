## 1.4.�Exported Parameters

### 1.4.1.�`natping_interval` (integer)

Period of time in seconds between sending the NAT pings to all currently registered UAs to keep their NAT bindings alive. Value of 0 disables this functionality.

### Note

Enabling the NAT pinging functionality will force the module to bind itself to USRLOC module.

_Default value is 0._

**Example�1.1.�Set `natping_interval` parameter**

...
modparam("nathelper", "natping\_interval", 10)
...

  

### 1.4.2.�`ping_nated_only` (integer)

If this variable is set then only contacts that have “behind\_NAT” flag in user location database set will get ping.

_Default value is 0._

**Example�1.2.�Set `ping_nated_only` parameter**

...
modparam("nathelper", "ping\_nated\_only", 1)
...

  

### 1.4.3.�`natping_partitions` (integer)

How many partitions/chunks to be used for sending the pingings. One partition means sending all pingings together. Two partitions means to send half pings and second half at a time.

_Default value is 1._ _Maximum allowed value is 8._

**Example�1.3.�Set `natping_partitions` parameter**

...
modparam("nathelper", "natping\_partitions", 4)
...

  

### 1.4.4.�`natping_socket` (string)

Spoof the natping's source-ip to this address. Works only for IPv4.

_Default value is NULL._

**Example�1.4.�Set `natping_socket` parameter**

...
modparam("nathelper", "natping\_socket", "192.168.1.1:5006")
...

  

### 1.4.5.�`received_avp` (str)

The name of the Attribute-Value-Pair (AVP) used to store the URI containing the received IP, port and protocol. The URI is created by the [fix\_nated\_register()](#func_fix_nated_register "1.5.4.� fix_nated_register()") function and this data may then be also picked up by the registrar module, which will attach a "Received=" attribute to the registration. Do not forget to change the value of corresponding parameter in the [registrar](registrar) module whenever you change the value of this parameter.

### Note

You must set this parameter if you use [fix\_nated\_register()](#func_fix_nated_register "1.5.4.� fix_nated_register()"). Additionally, if you are using registrar, you must also set its symmetric [received\_avp](registrar#received_avp) module parameter to the **same value**.

_Default value is "NULL" (disabled)._

**Example�1.5.�Set `received_avp` parameter**

...
modparam("nathelper", "received\_avp", "$avp(received)")
...

  

### 1.4.6.�`force_socket` (string)

Sending socket to be used for pinging contacts without local socket information (the local socket information may be lost during a restart or contact replication). If no one specified, OpenSIPS will choose the first listening interface matching the destination protocol and AF family.

_Default value is “NULL”._

**Example�1.6.�Set `force_socket` parameter**

...
modparam("nathelper", "force\_socket", "localhost:33333")
...

  

### 1.4.7.�`sipping_bflag` (string)

What branch flag should be used by the module to identify NATed contacts for which it should perform NAT ping via a SIP request instead if dummy UDP package.

_Default value is NULL (disabled)._

**Example�1.7.�Set `sipping_bflag` parameter**

...
modparam("nathelper", "sipping\_bflag", "SIPPING\_ENABLE")
...

  

### 1.4.8.�`remove_on_timeout_bflag` (string)

What branch flag to be used in order to activate usrloc contact removal when the [ping\_threshold](#param_ping_threshold "1.4.16.�ping_threshold (int)") is exceeded.

_Default value is NULL (disabled)._

**Example�1.8.�Set `remove_on_timeout_bflag` parameter**

...
modparam("nathelper", "remove\_on\_timeout\_bflag", "SIPPING\_RTO")
...

  

### 1.4.9.�`sipping_latency_flag` (string)

The branch flag which will be used in order to enable contact pinging latency computation and reporting via the usrloc E\_UL\_LATENCY\_UPDATE event.

_Default value is NULL (disabled)._

**Example�1.9.�Set `sipping_latency_flag` parameter**

...
modparam("nathelper", "sipping\_latency\_flag", "SIPPING\_CALC\_LATENCY")
...

  

### 1.4.10.�`sipping_ignore_rpl_codes` (CSV string)

A comma-separated list of SIP reply status codes to contact pings which are to be discarded. This may be useful for "full-sharing" user location topologies, where the location nodes are not directly facing the UAs, hence the intermediary SIP component may generate replies to offline contact ping attempts (e.g. 408 - Request Timeout) -- such ping replies should be ignored.

_Default value is "NULL" (all reply status codes are accepted)._

**Example�1.10.�Set `sipping_ignore_rpl_codes` parameter**

...
modparam("nathelper", "sipping\_ignore\_rpl\_codes", "408, 480, 404")
...

  

### 1.4.11.�`sipping_from` (string)

The parameter sets the SIP URI to be used in generating the SIP requests for NAT ping purposes. To enable the SIP request pinging feature, you have to set this parameter. The SIP request pinging will be used only for requests marked so.

_Default value is “NULL”._

**Example�1.11.�Set `sipping_from` parameter**

...
modparam("nathelper", "sipping\_from", "sip:pinger@siphub.net")
...

  

### 1.4.12.�`sipping_method` (string)

The parameter sets the SIP method to be used in generating the SIP requests for NAT ping purposes.

_Default value is “OPTIONS”._

**Example�1.12.�Set `sipping_method` parameter**

...
modparam("nathelper", "sipping\_method", "INFO")
...

  

### 1.4.13.�`nortpproxy_str` (string)

The parameter sets the SDP attribute used by nathelper to mark the packet SDP informations have already been mangled.

If empty string, no marker will be added or checked.

### Note

The string must be a complete SDP line, including the EOH (\\r\\n).

_Default value is “a=nortpproxy:yes\\r\\n”._

**Example�1.13.�Set `nortpproxy_str` parameter**

...
modparam("nathelper", "nortpproxy\_str", "a=sdpmangled:yes\\r\\n")
...

  

### 1.4.14.�`natping_tcp` (integer)

If the flag is set, TCP/TLS clients will also be pinged with SIP OPTIONS messages.

_Default value is 0 (not set)._

**Example�1.14.�Set `natping_tcp` parameter**

...
modparam("nathelper", "natping\_tcp", 1)
...

  

### 1.4.15.�`oldip_skip` (string)

Parameter which specifies whether old media ip and old origin ip shall be put in the sdp body. The parameter has two values : 'o' ("a=oldoip" field shall be skipped) and 'c' ("a=oldcip" field shall be skipped).

_Default value is 0 (not set)._

**Example�1.15.�Set `oldip_skip` parameter**

...
modparam("nathelper", "oldip\_skip", "oc")
...

  

### 1.4.16.�`ping_threshold` (int)

If a contact does not respond in _ping\_threshold_ seconds since the ping has been sent, the contact shall be removed after [max\_pings\_lost](#param_max_pings_lost "1.4.17.�max_pings_lost (int)") unresponded pings.

_Default value is 3 (seconds)._

**Example�1.16.�Set `ping_threshold` parameter**

...
modparam("nathelper", "ping\_threshold", 10)
...

  

### 1.4.17.�`max_pings_lost` (int)

Number of unresponded pings after which the contact shall be removed from the location table.

_Default value is 3 (pings)._

**Example�1.17.�Set `max_pings_lost` parameter**

...
modparam("nathelper", "max\_pings\_lost", 5)
...

  

### 1.4.18.�`cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used by the nathelper module for controlling the pinging process. When part of a cluster of multiple nodes, the nodes can agree upon which node is the one responsible for pinging.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to the contacts. See the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.4.19.�cluster_sharing_tag (string)") option.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the "clusterer" module.

_Default value is “0 (none)”._

**Example�1.18.�Set `cluster_id` parameter**

...
# Be part of cluster ID 9
modparam("nathelper", "cluster\_id", 9)
...

  

### 1.4.19.�`cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform pinging of the contacts. If defined, only the node with active status of this tag will perform the pinging.

The [cluster\_id](#param_cluster_id "1.4.18.�cluster_id (integer)") must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will individually do the pinging.

_Default value is “empty (none)”._

**Example�1.19.�Set `cluster_sharing_tag` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
modparam("nathelper", "cluster\_id", 9)
modparam("nathelper", "cluster\_sharing\_tag", "vip")
...