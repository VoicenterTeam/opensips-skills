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