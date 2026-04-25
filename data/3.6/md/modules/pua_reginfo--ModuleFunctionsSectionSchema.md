## 1.4.�Functions

### 1.4.1.� `reginfo_handle_notify(uldomain)`

This function processes received "NOTIFY"-requests and updates the local registry accordingly.

This method does not create any SIP-Response, this has to be done by the script-writer.

The parameter has to correspond to user location table (domain) where to store the record.

Return codes:

*   _2_ - contacts successfully updated, but no more contacts online now.
    
    _1_ - contacts successfully updated and at at least one contact still registered.
    
    _\-1_ - Invalid NOTIFY or other error (see log-file)
    

**Example�1.7.�`reginfo_handle_notify` usage**

...
if(is\_method("NOTIFY")) 
	if (reginfo\_handle\_notify("location"))
		send\_reply("202", "Accepted");
...
				

  

### 1.4.2.� `reginfo_subscribe(uri[, expires])`

This function will subscribe for reginfo-information at the given server URI.

Meaning of the parameters is as follows:

*   _uri_ - SIP-URI of the server, where to subscribe, may contain pseudo-variables.
    
    _expires_ - Expiration date for this subscription, in seconds (default 3600)
    

**Example�1.8.�`reginfo_subscribe` usage**

...
route {
	t\_on\_reply("1");
	t\_relay();
}

reply\_route\[1\] {
	if (t\_check\_status("200")) 
		reginfo\_subscribe("$ru");		
}
...
				

  

### 1.4.3.� `reginfo_update(aor)`

Explicitly update the presence status, e.g., when new information is learned. This may trigger a new NOTIFY towards subscribed entities; at least it will update the internal information for subsequent subscribe and notifies.

This is done implicitly, when a registration is updated. However, when a registration was just updated with additional information like identities, this is not triggered automatically.

Meaning of the parameters is as follows:

*   _aor_ - The AOR to be updated.
    

**Example�1.9.�`reginfo_subscribe` usage**

...
modparam("pua\_reginfo", "ul\_domain", "location")
modparam("pua\_reginfo", "ul\_identities\_key", "identities")
...
onreply\_route\[register\_reply\] {
	if (t\_check\_status("200") && $hdr(P-Associated-URI)) {
        ul\_add\_key("location", "$tU@$td", "identities", "$hdr(P-Associated-URI)");
        reginfo\_update("$tU@$td");
	}
}

...