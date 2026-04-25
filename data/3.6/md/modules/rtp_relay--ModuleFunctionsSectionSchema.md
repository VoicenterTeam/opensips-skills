## 1.6.�Exported Functions

### 1.6.1.� `rtp_relay_engage(engine, [set])`

Engages the RTP Relay _engine_ for the current initial INVITE. After calling this function, the entire RTP relay communication will be handled by the module itself, without having to intervene for any further in-dialog requests/replies (unless you specifically want to).

The function is not performing the media requests on the spot, but rather registers the hooks to automatically handle any further media requests.

The RTP session modifiers used are the ones provisioned through the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") and/or [$rtp\_relay\_peer](#pv_rtp_relay_peer "1.8.2.�$rtp_relay_peer") variables.

The function can be called from the main request route - in this case the RTP relay will be engaged for any further branches created, or from the branch route - in this case the RTP relay will only be engaged for the branch where it was called, or that has an associated _rtp\_relay_ provisioned.

Meaning of the parameters is as follows:

*   _engine(string)_ - the RTP relay engine to be used for the call (i.e. _rtpproxy_, _rtpengine_ or _route_)
    
*   _set(int, optional)_ - the set used for this call.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.13.�`rtp_relay_engage` usage**

...
if (is\_method("INVITE") && !has\_totag()) {
	xlog("SCRIPT: engaging RTPProxy relay for all branches\\n");
	$rtp\_relay = "co";
	$rtp\_relay\_peer = "co";
	rtp\_relay\_engage("rtpproxy");
}
...