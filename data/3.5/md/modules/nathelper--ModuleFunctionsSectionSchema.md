## 1.5.�Exported Functions

### 1.5.1.� `fix_nated_contact([uri_params])`

Rewrites the URI Contact HF to contain request's source address:port. If a list of URI parameter is provided, it will be added to the modified contact;

_IMPORTANT NOTE:_ Changes made by this function shall not be seen in the async resume route. So make sure you call it in all the resume routes where you need the contact fixed.

Parameters:

*   _uri\_params (string, optional)_
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, BRANCH\_ROUTE.

**Example�1.20.�`fix_nated_contact` usage**

...
if (search("User-Agent: Cisco ATA.\*") {
    fix\_nated\_contact(";ata=cisco");
} else {
    fix\_nated\_contact();
}
...

  

### 1.5.2.� `fix_nated_sdp(flags [, ip_address [, sdp_fields]])`

Alters the SDP information in orer to facilitate NAT traversal. What changes to be performed may be controled via the “flags” parameter. Since version 1.12 the name of the old ip fields are "a=oldoip" for old origin ip and "a=oldcip" for old meda ip.

Meaning of the parameters is as follows:

*   _flags (string)_ - the value may be a CSV of the following flags:
    
    *   _add-dir-active_ - (old _0x01_ flag) adds “a=direction:active” SDP line;
        
    *   _rewrite-media-ip_ - (old _0x02_ flag) rewrite media IP address (c=) with source address of the message or the provided IP address (the provided IP address takes precedence over the source address).
        
    *   _add-no-rtpproxy_ - (old _0x04_ flag) adds “a=nortpproxy:yes” SDP line;
        
    *   _rewrite-origin-ip_ - (old _0x08_ flag) rewrite IP from origin description (o=) with source address of the message or the provided IP address (the provided IP address takes precedence over the source address).
        
    *   _rewrite-null-ips_ - (old _0x10_ flag) force rewrite of null media IP and/or origin IP address. Without this flag, null IPs are left untouched.
        
    
*   _ip\_address (string, optional)_ - IP to be used for rewriting SDP. If not specified, the received signalling IP will be used. NOTE: For the IP to be used, you need to use 0x02 or 0x08 flags, otherwise it will have no effect.
    
*   _sdp\_fields (string, optional)_ - SDP field(s) to be appended to SDP. Note: Each SDP field must be preceded by "\\r\\n".
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.21.�`fix_nated_sdp` usage**

...
# Add "a=direction:active" SDP line
# Rewrite media IP (c= line)
# Add extra "a=x-attr1" SDP line
# Add extra "a=x-attr2" SDP line
if (search("User-Agent: Cisco ATA.\*")
    {fix\_nated\_sdp(3,,"\\r\\na=x-attr1\\r\\na=x-attr2");};
...

  

### 1.5.3.� `add_rcv_param([flag])`,

Add received parameter to Contact header fields or Contact URI. The parameter will contain URI created from the source IP, port, and protocol of the packet containing the SIP message. The parameter can be then processed by another registrar, this is useful, for example, when replicating register messages using t\_replicate function to another registrar.

Meaning of the parameters is as follows:

*   _flag (int, optional)_ - flags to indicate if the parameter should be added to Contact URI or Contact header. If the flag is non-zero, the parameter will be added to the Contact URI. If not used or equal to zero, the parameter will go to the Contact header.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.22.�`add_rcv_paramer` usage**

...
add\_rcv\_param(); # add the parameter to the Contact header
....
add\_rcv\_param(1); # add the parameter to the Contact URI
...

  

### 1.5.4.� `fix_nated_register()`

The function creates a URI consisting of the source IP, port and protocol and stores it in the [received\_avp](#param_received_avp "1.4.5.�received_avp (str)") AVP. The URI will be appended as "received" parameter to Contact in 200 OK and may also be stored in the user location database if the same AVP is also configured for the [registrar](registrar) module.

This function can be used from REQUEST\_ROUTE.

**Example�1.23.�`fix_nated_register` usage**

...
fix\_nated\_register();
...

  

### 1.5.5.� `nat_uac_test(flags)`

Determines whether the received SIP message originated behind a NAT, using one or more pre-defined checks.

The _flags_ (string) parameter denotes a comma-separated list of checks to be performed, as follows:

*   _private-contact_ - (old _1_ flag) Contact header field is searched for occurrence of RFC1918 / RFC6598 addresses
    
*   _diff-ip-src-via_ - (old _2_ flag) the "received" test is used: address in Via is compared against source IP address of signaling
    
*   _private-via_ - (old _4_ flag) Top Most VIA is searched for occurrence of RFC1918 / RFC6598 addresses
    
*   _private-sdp_ - (old _8_ flag) SDP is searched for occurrence of RFC1918 / RFC6598 addresses
    
*   _diff-port-src-via_ - (old _16_ flag) test if the source port is different from the port in Via
    
*   _diff-ip-src-contact_ - (old _32_ flag) address in Contact is compared against source IP address of signaling
    
*   _diff-port-src-contact_ - (old _64_ flag) Port in Contact is compared against source port of signaling
    
*   _carrier-grade-nat_ - (old _128_ flag) also include RFC 6333 addresses in the checks for _Contact_, _Via_ and _SDP_
    

**Returns true if any of the tests passed**.

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.24.�`nat_uac_test` usage**

...
# check for private Contact or SDP media IP addresses
if (nat\_uac\_test("private-contact,private-sdp"))
	xlog("SIP message is NAT'ed (Call-ID: $ci)\\n");
...