## 1.6.�Exported Pseudo-Variables

### 1.6.1.�`$rtp_relay`

Is used to provision the RTP back-end flags for the current peer - if used in the initial INVITE REQUEST route, it provisions the flags of the caller, whereas if used in the initial INVITE BRANCH/REPLY route, it provisions the callee's flags.

For a sequential request, the variable represents the flags used for the UAC that generated the request. When used in a reply, the other UAC's flags are provisioned.

In an initial INVITE scope, the variable can be provisioned per branch, by using the variable's index.

For each UAC/peer, there are several flags that can be configured:

*   _flags_ (default, when variable is used without a name) - are the flags associated with the current UAC - they are passed along with the offer command
    
*   _peer_ - these flags are passed along in the offer command, but they are flags associated with the other UAC/peer
    
*   _ip_ - the IP that should be advertised in the resulted SDP.
    
*   _type_ - the RTP type used by the current UAC (currently only used by _rtpengine_)
    
*   _iface_ - the interface used for the traffic coming from this UAC.
    
*   _body_ - the body to be used for the UAC.
    
*   _delete_ - flags to be used when the media session is terminated/deleted.
    
*   _disabled_ - provisioned as an integer, it is used to disable RTP relay for this UAC.
    

### 1.6.2.�`$rtp_relay_peer`

This variable has the same meaning and parameters as the [$rtp\_relay](#pv_rtp_relay "1.6.1.�$rtp_relay") variable, except that it is used to provision the other UAC's flags, except the current one. All other fields are similar.

### 1.6.3.�`$rtp_relay_ctx()`

This variable can be used to provide information about the RTP context, information that is not associated with any of the involved peers.

The following settings can be used:

*   _callid_ - The callid to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _from\_tag_ - The from-tag to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _to\_tag_ - The to-tag to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _flags_ - Generic flags to be sent to all offer/answer requests.
    
*   _delete_ - flags sent when the relay session is terminated.