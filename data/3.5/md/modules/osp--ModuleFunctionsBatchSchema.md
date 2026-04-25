## 1.4.�Exported Functions

### 1.4.1.�`checkospheader()`

This function checks for the existence of the OSP-Auth-Token header field.

This function can be used from REQUEST\_ROUTE.

**Example�1.40.�checkospheader usage**

...
if (checkospheader()) {
  log(1,"OSP header field found.\\n");
} else {
  log(1,"no OSP header field present\\n");
};
...
        

  

### 1.4.2.�`validateospheader()`

This function validates an OSP-Token specified in the OSP-Auth-Tokenheader field of the SIP message. If a peering token is present, it will be validated locally. If no OSP header is found or the header token is invalid or expired, -1 is returned; on successful validation 1 is returned.

This function can be used from REQUEST\_ROUTE.

**Example�1.41.�validateospheader usage**

...
if (validateospheader()) {
  log(1,"valid OSP header found\\n");
} else {
  log(1,"OSP header not found, invalid or expired\\n");
};
...
        

  

### 1.4.3.�`getlocaladdress()`

This function gets the receiving IP address of SIP response and stores it as proxy egress address.

This function can be used from ONREPLY\_ROUTE.

**Example�1.42.�getlocaladress usage**

...
if (getlocaladdress()) {
  log(1,"Obtain proxy local egress address\\n");
} else {
  log(1,"Failed to get proxy local egress address\\n");
};
...
        

  

### 1.4.4.�`setrequestdate()`

This function gets the receiving IP address of SIP response and stores it as proxy egress address.

This function can be used from REQUEST\_ROUTE.

**Example�1.43.�setrequestdate usage**

...
if (setrequest()) {
  log(1,"Set request date\\n");
} else {
  log(1,"Failed to set request date\\n");
};
...
        

  

### 1.4.5.�`requestosprouting()`

This function launches a query to the peering server requesting the IP address of one or more destination peers serving the called party. If destination peers are available, the peering server will return the IP address and a peering authorization token for each destination peer. The OSP-Auth-Token Header field is inserted into the SIP message and the SIP uri is rewritten to the IP address of destination peer provided by the peering server.

The address of the called party must be a valid E164 number, otherwise this function returns -1. If the transaction was accepted by the peering server, the uri is being rewritten and 1 returned, on errors (peering servers are not available, authentication failed or there is no route to destination or the route is blocked) -1 is returned.

This function can be used from REQUEST\_ROUTE.

**Example�1.44.�requestosprouting usage**

...
if (requestosprouting()) {
  log(1,"successfully queried OSP server, now relaying call\\n");
} else {
  log(1,"Authorization request was rejected from OSP server\\n");
};
...
        

  

### 1.4.6.�`checkosproute()`

This function is used to check if there is any route for the call.

This function can be used from REQUEST\_ROUTE.

**Example�1.45.�checkosproute usage**

...
if (checkosproute()) {
  log(1,"There is at least one route for the call\\n");
} else {
  log(1,"There is not any route for the call\\n");
};
...
        

  

### 1.4.7.�`prepareosproute()`

This function tries to prepare the INVITE to be forwarded using the destination in the list returned by the peering server. If the calling number is translated, a RPID value for the RPID AVP will be set. If the route could not be prepared, the function returns 'FALSE' back to the script, which can then decide how to handle the failure. Note, if checkosproute has been called and returns 'TRUE' before calling prepareosproute, prepareosproute should not return 'FALSE' because checkosproute has confirmed that there is at least one route.

This function can be used from BRANCH\_ROUTE.

**Example�1.46.�prepareosproute usage**

...
if (prepareosproute()) {
  log(1,"successfully prepared the route, now relaying call\\n");
} else {
  log(1,"could not prepare the route, there is not route\\n");
};
...
        

  

### 1.4.8.�`prepareospresponse()`

This function tries to prepare all the routes in the list returned by the peering server into SIP 300 Redirect or SIP 380 Alternative Service message. The message is then replied to the source. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

This function can be used from REQUEST\_ROUTE.

**Example�1.47.�prepareospresponse usage**

...
if (prepareospresponse()) {
  log(1,"Response is prepared.\\n");
} else {
  log(1,"Could not prepare the response.\\n");
};
...
        

  

### 1.4.9.�`prepareallosproutes()`

This function tries to prepare all the routes in the list returned by the peering server. The message is then forked off to the destinations. If unsuccessful in preparing the routes a SIP 500 is sent back and a trace message is logged.

This function can be used from REQUEST\_ROUTE.

**Example�1.48.�prepareallosproutes usage**

...
if (prepareallosproutes()) {
  log(1,"Routes are prepared, now forking the call\\n");
} else {
  log(1,"Could not prepare the routes. No destination available\\n");
};
...
        

  

### 1.4.10.�`checkcallingtranslation()`

This function is used to check if the calling number is translated. Before calling checkcallingtranslation, prepareosproute should be called. If the calling number does been translated, the original Remote-Party-ID, if it exists, should be removed from the INVITE message. And a new Remote-Party-ID header should be added (a RPID value for the RPID AVP has been set by prepareosproute). If the calling number is not translated, nothing should be done.

This function can be used from BRANCH\_ROUTE.

**Example�1.49.�checkcallingtranslation usage**

...
if (checkcallingtranslation()) {
  # Remove the Remote\_Party-ID from the received message
  # Otherwise it will be forwarded on to the next hop
  remove\_hf("Remote-Party-ID");

  # Append a new Remote\_Party
  append\_rpid\_hf();
}
...
        

  

### 1.4.11.�`reportospusage()`

This function should be called after receiving a BYE message. If the message contains an OSP cookie, the function will forward originating and/or terminating duration usage information to a peering server. The function returns TRUE if the BYE includes an OSP cookie. The actual usage message will be send on a different thread and will not delay BYE processing. The function should be called before relaying the message.

Meaning of the parameter is as follows:

*   0 - Source device releases the call.
    
*   1 - Destination device releases the call.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.50.�reportospusage usage**

...
if (is\_direction("downstream")) {
  log(1,"This BYE message is from SOURCE\\n");
  if (!reportospusage(0)) {
    log(1,"This BYE message does not include OSP usage information\\n");
  }
} else {
  log(1,"This BYE message is from DESTINATION\\n");
  if (!reportospusage(1)) {
    log(1,"This BYE message does not include OSP usage information\\n");
  }
}
...
        

  

### 1.4.12.�`processsubscribe([cachedcnamrecord])`

This function should be called after receiving a SUBSCRIBE for CNAM message and there is a cached CNAM record for this message. This function generates a NOTIFY message including the cached CNAM record, then sends the NOTIFY message to the device sending the SUBSCRIBE message.

Meaning of the parameter is as follows:

*   _cachedcnamrecord_ (string) - Cached CNAM record.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.51.�processsubscribe usage**

...
if (is\_method("SUBSCRIBE")) {
    if (($var(sevent) == "calling-name") && (is\_myself("$rd"))) {
        if ($var(cnamrecord) != NULL) {
            processsubscribe($(var(cnamrecord){s.b64decode}));
        } else {
            t\_relay("1.2.3.4", 0x02);
        }
    } else {
        t\_relay();
    }
}
...