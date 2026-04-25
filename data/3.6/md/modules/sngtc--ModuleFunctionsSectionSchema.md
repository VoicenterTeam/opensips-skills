## 1.4.�Exported Functions

### 1.4.1.� `sngtc_offer()`

The function strips off the SDP offer from a SIP INVITE, thus asking for another SDP offer from the opposite endpoint (late negotiation).

The following **error codes** may be returned:

*   _\-1_ - SDP parsing error
    
*   _\-3_ - internal error / no more memory
    

The function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.1.�`sngtc_offer` usage**

...
	if (is\_method("INVITE")) {
		t\_newtran();
		create\_dialog();
		sngtc\_offer();
	}
...

  

### 1.4.2.� `sngtc_callee_answer([listen_if_A], [listen_if_B])`

Handles the SDP offer from 200 OK responses, intersects both offers with the capabilities of the transcoding card and creates a new transcoding session on the card **only if** necessary. It then rewrites the 200 OK SDP so that it contains the information resulted from the codec intersection.

**Parameters** explained:

Since the D-series transcoding cards are connected through either a PCI slot or simply an Ethernet connector, they cannot be assigned global IPs. Consequently, the module will write the local, private IP of the card in the SDP answers sent to each of the endpoints. Since this will not work with non-local UAs, the optional parameters force the RTP listen interface for each UA. This way, the script writer can enforce a global IP for the incoming RTP (which can be port forwarded to a transcoding card).

*   _listen\_if\_A_ (string) - the interface where the UAC (the caller) will send RTP after the call is established (IP from the 'c=' SDP line(s))
    
*   _listen\_if\_B_ (string) - the interface where the UAS (the callee) will send RTP after the call is established (IP from the 'c=' SDP line(s))
    

The following **error codes** may be returned:

*   _\-1_ - SDP parsing error
    
*   _\-2_ - failed to create transcoding session
    
*   _\-3_ - internal error / no more memory
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.2.�`sngtc_callee_answer` usage**

...
onreply\_route\[1\] {
	if ($rs == 200)
		sngtc\_callee\_answer("11.12.13.14", "11.12.13.14");
}
...

  

### 1.4.3.� `sngtc_caller_answer()`

Attaches an SDP body to the caller's ACK request, so that it matches the late SDP negotiation done by the UAS.

The following **error codes** may be returned:

*   _\-3_ - internal error / no more memory
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.3.�`sngtc_caller_answer` usage**

...
	if (has\_totag()) {
		if (loose\_route()) {
			...
			if (is\_method("ACK"))
				sngtc\_caller\_answer();
		}
		...
	}
...