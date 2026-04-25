## 1.4.�Exported Parameters

### 1.4.1.�`keepalive_interval` (integer)

The time interval (in seconds) required to send a keepalive message to all the endpoints that need being kept alive. During this interval, each endpoint will receive exactly one keepalive message. A negative value or zero will disable the keepalive functionality.

_Default value is “60”._

**Example�1.1.�Setting the `keepalive_interval` parameter**

...
modparam("nat\_traversal", "keepalive\_interval", 90)
...
        

  

### 1.4.2.�`keepalive_method` (string)

What SIP method to use to send keepalive messages. Typical methods used for this purpose are NOTIFY and OPTIONS. NOTIFY generates smaller replies from user agents, but they are almost entirely negative replies. Apparently almost none of the user agents understand that the purpose of the NOTIFY with a “keep-alive” event is to keep NAT open, even though many user agents send such NOTIFY requests themselves. However this does not affect the result at all, since the purpose is to trigger a response from the user agent behind NAT, positive or negative replies having little relevance as they are discarded anyway. The OPTIONS method on the other hand has a much higher rate of positive replies, but at the same time those positive replies are much bigger, mostly because the OPTIONS method is used to inform about the user agent capabilities and thus it includes a lot of extra headers to indicate those capabilities. Many user agents also include a SDP body with a bogus media session, probably to indicate media capabilities. All of this makes that positive replies to OPTIONS requests are 2 to 3 times bigger than negative replies or replies to NOTIFY requests. For this reason the default value for the used method is NOTIFY.

_Default value is “NOTIFY”._

**Example�1.2.�Setting the `keepalive_method` parameter**

...
modparam("nat\_traversal", "keepalive\_method", "OPTIONS")
...
        

  

### 1.4.3.�`keepalive_from` (string)

Indicates what SIP URI to use in the From header of the keepalive requests. If not specified it will use sip:keepalive@proxy\_ip, where proxy\_ip is the IP address of the outgoing interface used to send the keepalive message, which is the same interface on which the request that triggered keepalive functionality arrived.

_Default value is “sip:keepalive@proxy\_ip” with proxy\_ip being the actual IP of the outgoing interface._

**Example�1.3.�Setting the `keepalive_from` parameter**

...
modparam("nat\_traversal", "keepalive\_from", "sip:keepalive@my-domain.com")
...
        

  

### 1.4.4.�`keepalive_extra_headers` (string)

Specifies extra headers that should be added to the keepalive messages that are sent by the proxy. The header specification must also include the CRLF (\\r\\n) line separator. Multiple headers can be specified by concatenating them and each of them must include the \\r\\n separator.

_Default value is undefined (send no extra headers)._

**Example�1.4.�Setting the `keepalive_extra_headers` parameter**

...
modparam("nat\_traversal", "keepalive\_extra\_headers", "User-Agent: OpenSIPS\\r\\nX-MyHeader: some\_value\\r\\n")
...
        

  

### 1.4.5.�`keepalive_state_file` (string)

Specifies a filename where information about the NAT endpoints and the conditions for which they are being kept alive is saved when OpenSIPS exits. The information in this file is then used when OpenSIPS starts to restore its internal state and continue to send keepalive messages to the NAT endpoints that have not expired in the meantime. This is useful when restarting OpenSIPS to avoid losing keepalive state information about the NAT endpoints. The internal keepalive state is guaranteed to be saved in this file on exit, even when OpenSIPS crashes.

The value of this parameter can be either a relative path, in which case it will store it in the OpenSIPS working directory, or an absolute path.

_Default value is undefined “keepalive\_state”._

**Example�1.5.�Setting the `keepalive_state_file` parameter**

...
modparam("nat\_traversal", "keepalive\_state\_file", "/run/opensips/keepalive\_state")
...
        

  

### 1.4.6.�`cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used by the nat\_traversal module for controlling the pinging process. When part of a cluster of multiple nodes, the nodes can agree upon which node is the one responsible for pinging.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to the contacts. See the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.4.7.�cluster_sharing_tag (string)") option.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the "clusterer" module.

_Default value is “0 (none)”._

**Example�1.6.�Set `cluster_id` parameter**

...
# Be part of cluster ID 9
modparam("nat\_traversal", "cluster\_id", 9)
...

  

### 1.4.7.�`cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform pinging of the contacts. If defined, only the node with active status of this tag will perform the pinging.

The [cluster\_id](#param_cluster_id "1.4.6.�cluster_id (integer)") must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will individually do the pinging.

_Default value is “empty (none)”._

**Example�1.7.�Set `cluster_sharing_tag` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
modparam("nat\_traversal", "cluster\_id", 9)
modparam("nat\_traversal", "cluster\_sharing\_tag", "vip")
...