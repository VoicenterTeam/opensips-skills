## 1.4.�Exported Functions

### 1.4.1.� `sdp_mangle_ip(pattern, newip)`

Changes IP addresses inside SDP package in lines describing connections like c=IN IP4 Currently in only changes IP4 addresses since IP6 probably will not need to traverse NAT :)

The function returns negative on error, or number of replacements + 1.

Meaning of the parameters is as follows:

*   _pattern_ (string) - A pair ip/mask used to match IP's located inside SDP package in lines c=IN IP4 ip. This lines will only be mangled if located IP is in the network described by this pattern. Examples of valid patterns are “10.0.0.0/255.0.0.0” or “10.0.0.0/8” etc.
    
*   _newip_ (string) - the new IP to be put inside SDP package if old IP address matches pattern.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.2.�`sdp_mangle_ip` usage**

...
sdp\_mangle\_ip("10.0.0.0/8","193.175.135.38");
...

  

### 1.4.2.� `sdp_mangle_port(offset)`

Changes ports inside SDP package in lines describing media like m=audio 13451.

The function returns negative on error, or number of replacements + 1.

Meaning of the parameters is as follows:

*   _offset_ (int) - an integer which will be added/subtracted from the located port.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.3.�`sdp_mangle_port` usage**

...
sdp\_mangle\_port(-12000);
...

  

### 1.4.3.� `encode_contact(encoding_prefix, public_ip)`

This function will encode uri-s inside Contact header in the following manner sip:username:password@ip:port;transport=protocol goes sip:enc\_pref\*username\*ip\*port\*protocol@public\_ip \* is the default separator.

The function returns negative on error, 1 on success.

Meaning of the parameters is as follows:

*   _encoding\_prefix_ (string) - Something to allow us to determine that a contact is encoded publicip--a routable IP, most probably you should put your external IP of your NAT box.
    
    _public\_ip_ (string) - The public IP which will be used in the encoded contact, as described by the example above.
    

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.4.�`encode_contact` usage**

...
if ($si == 10.0.0.0/8) encode\_contact("enc\_prefix","193.175.135.38"); 
...

  

### 1.4.4.� `decode_contact()`

This function will decode the URI in first line in packets which come with encoded URI in the following manner sip:enc\_pref\*username\*ip\*port\*protocol@public\_ip goes to sip:username:password@ip:port;transport=protocol It uses the default set parameter for contact encoding separator.

The function returns negative on error, 1 on success.

Meaning of the parameters is as follows:

This function can be used from REQUEST\_ROUTE.

**Example�1.5.�`decode_contact` usage**

...
if ($ru =~ "^enc\*") { decode\_contact(); }
...

  

### 1.4.5.� `decode_contact_header()`

This function will decode URIs inside Contact header in the following manner sip:enc\_pref\*username\*ip\*port\*protocol@public\_ip goes to sip:username:password@ip:port;transport=protocol. It uses the default set parameter for contact encoding separator.

The function returns negative on error, 1 on success.

Meaning of the parameters is as follows:

This function can be used from REQUEST\_ROUTE, ONREPLY\_ROUTE.

**Example�1.6.�`decode_contact_header` usage**

...
if ($ru =~ "^enc\*") { decode\_contact\_header(); }
...