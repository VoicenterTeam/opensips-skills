## 1.6.�Exported Functions

### 1.6.1.�`engage_media_proxy()`

Trigger the use of MediaProxy for all the dialog requests and replies that have an SDP body. This needs to be called only once for the first INVITE in a dialog. After that it will use the dialog module to trace the dialog and automatically call use\_media\_proxy() on every request and reply that belongs to the dialog and has an SDP body. When the dialog ends it will also call automatically end\_media\_session(). All of these are called internally on dialog callbacks, so for this function to work, the dialog module must be loaded and configured.

This function is an advanced mechanism to use a media relay without having to manually call a function on each message that belongs to the dialog. However this method is less flexible, because once things were set in motion by calling this function on the first INVITE, it cannot be stopped, not even by calling end\_media\_session(). It will only stop when the dialog ends. Until then it will modify the SDP content of every in-dialog message to make it use a media relay. If one needs more control over the process, like starting to use mediaproxy only later in the failure route, or stopping to use mediaproxy in the failure route, then the use\_media\_proxy and end\_media\_session functions should be used, and manually called as appropriate. Using this function should NOT be mixed with either of use\_media\_proxy() or end\_media\_session().

This function can be used from REQUEST\_ROUTE.

**Example�1.8.�Using the `engage_media_proxy` function**

...
if (is\_method("INVITE") && !has\_totag()) {
    # We can also use a specific media relay if we need to
    #$avp(media\_relay) = "1.2.3.4";
    engage\_media\_proxy();
}
...
        

  

### 1.6.2.�`use_media_proxy()`

Will make a call to the dispatcher and replace the IPs and ports in the SDP body with the ones returned by the media relay for each supported media stream in the SDP body. This will force the media streams to be routed through the media relay. If a mix of supported and unsupported streams are present in the SDP, only the supported streams will be modified, while the unsupported streams will be left alone.

This function should NOT be mixed with engage\_media\_proxy().

This function has the following return codes:

*   +1 - successfully modified message (true value)
    
*   \-1 - error in processing message (false value)
    
*   \-2 - missing SDP body, nothing to process (false value)
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.9.�Using the `use_media_proxy` function**

...
if (is\_method("INVITE")) {
    # We can also use a specific media relay if we need to
    #$avp(media\_relay) = "1.2.3.4";
    use\_media\_proxy();
}
...
        

  

### 1.6.3.�`end_media_session()`

Will call on the dispatcher to inform the media relay to end the media session. This is done when a call ends, to instruct the media relay to release the resources allocated to that call as well as to save logging information about the media session. Called on BYE, CANCEL or failures.

This function should NOT be mixed with engage\_media\_proxy().

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.10.�Using the `end_media_session` function**

...
if (is\_method("BYE")) {
    end\_media\_session();
}
...