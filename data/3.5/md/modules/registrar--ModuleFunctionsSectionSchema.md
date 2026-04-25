## 1.4.�Exported Functions

### 1.4.1.� `save(domain[, flags[, aor[, ownership_tag]]])`

The function processes a REGISTER message. It can add, remove or modify usrloc records depending on Contact and Expires HFs in the REGISTER message. On success, 200 OK will be returned listing all contacts that are currently in usrloc. On an error, error message will be send with a short description in reason phrase.

Meaning of the parameters is as follows:

*   _domain (static string)_ - Logical domain within registrar. If database is used then this must be name of the table which stores the contacts.
    
*   _flags (string, optional)_ - string composed of one or more of the following flags, comma-separated:
    
    *   _'memory-only'_ - (old _m_ flag) save the contacts only in memory cache without no DB operation;
        
    *   _'no-reply'_ - (old _r_ flag) do not generate a SIP reply to the current REGISTER request.
        
    *   _'max-contacts=\[int\]'_ - (old _c_ flag) this flag can be used to limit the number of contacts for this AOR (Address of Record) in the user location database. Value 0 disables the check. This parameter overrides the global "max\_contacts" module parameter.
        
    *   _'force-registration'_ - (old _f_ flag) this flag can be used to force the registration of NEW contacts even if the maximum number of contacts is reached. In such a case, older contacts will be removed to make space to the new ones, without exceeding the maximum allowed number. This flag makes sense only if "max-contacts" is used.
        
    *   _'matching-mode=\[val\]'_ - (old _M_ flag) How the matching should be performed between the uploaded contacts (by the currently handled REGISTER) and the already know contacts (in memory or DB). This options will be used only for the current operation and can be:
        
        *   _'0'_ - contact URI matching only
            
        *   _'1'_ - contact URI and SIP Call-ID matching
            
        *   _'<param\_name>'_ - only the value of the given URI param will be used for matching (for example <rinstance>)
            
        
    *   _'path-off'_ - (old _p0_ flag) (Path support - 'off' mode) - The Path header is saved into usrloc, but is never included in the reply.
        
    *   _'path-lazy'_ - (old _p1_ flag) (Path support - lazy mode) The Path header is saved into usrloc, but is only included in the reply if path support is indicated in the registration request by the “path” option of the “Supported” header.
        
    *   _'path-strict'_ - (old _p2_ flag) (Path support - strict mode) - The path header is only saved into usrloc, if path support is indicated in the registration request by the “path” option of the “Supported” header. If no path support is indicated, the request is rejected with “420 - Bad Extension” and the header “Unsupported: path” is included in the reply along with the received “Path” header. This mode is the one recommended by RFC-3327.
        
    *   _'path-received'_ - (old _v_ flag) if set, the “received” parameter of the first Path URI of a registration is set as received-uri and the NAT branch flag is set for this contact. This is useful if the registrar is placed behind a SIP loadbalancer, which passes the nat'ed UAC address as “received” parameter in it's Path uri.
        
    *   _'only-request-contacts'_ - (old _o_ flag) Only include the REGISTER request's Contacts in the 200 OK reply, in case the registration is successful. While this is against RFC 3261, it may be useful in certain scenarios.
        
    *   _'socket-header'_ - (old _s_ flag) look into REGISTER request for a header which contains a socket description (proto:IP:port). This socket info will be stored by register instead of the received socket info.
        
    *   _'min-expires=\[int\]'_ - (old _e_ flag) this flag can be used to set minimum register expiration time. Values lower than this minimum will be automatically set to the minimum. Value 0 disables the checking. This parameter overrides the global [min\_expires](#param_min_expires "1.3.2.�min_expires (integer)") module parameter.
        
    *   _'max-expires=\[int\]'_ - (old _E_ flag) this flag can be used to set maximum register expiration time. Values higher than this maximum will be automatically set to the maximum. Value 0 disables the checking. This parameter overrides the global [max\_expires](#param_max_expires "1.3.3.�max_expires (integer)") module parameter.
        
    
    This parameter is a string composed of a set of flags.
    
*   _aor (string, optional)_ - a custom AOR; if missing, the AOR will be taken from the default place - the TO header URI.
    
*   _ownership\_tag (string, optional)_ - a cluster-shared tag (see the clusterer module documentation for more details) which will be attached to each contact saved from the current request. This tag is only relevant in clustered user location scenarios and helps determine the current logical owner node of a contact. This, in turn, is useful in order to restrict nodes which are not currently responsible for this contact from performing certain actions (for example: incorrectly originating pings from a non-owned virtual IP address in highly-available setups).
    

This function can be used from REQUEST\_ROUTE and ONREPLY\_ROUTE.

If you plan to use the “save()” function in reply route, please refer to [mcontact\_avp](#param_mcontact_avp "1.3.18.�mcontact_avp (string)") module parameter.

**Example�1.30.�`save` usage**

...
# save into 'location', no flags, use default AOR (TO URI)
save("location");
...
# save into 'location', do not update DB, max 5 contacts per AOR,
# use default AOR (TO URI)
save("location","memory-only, max-contacts=5");
...
# save into 'location', no flags, use as AOR the FROM URI
save("location","",$fu);
...
# save into 'location', no DB update, force registration, take AOR from AVP
save("location","memory-only, no-reply", $avp(aor));
...
# save into 'location', mark the contacts with the "vip" ownership tag and
# replicate these contacts to the backup node, which does not currently own "vip"
save("location", , , "vip");
...

  

### 1.4.2.� `remove(domain, AOR[, [contact][, [next_hop][, [sip_instance], [bflag]]]])`

Explicitly remove contacts behind a given address-of-record.

Meaning of the parameters is as follows:

*   _domain (static string_ - Logical domain within the registrar. If a database is used, then this must be name of the table which stores the contacts.
    
*   _AOR (string)_ - address-of-record to be searched (SIP URI)
    
*   _contact (string, optional)_ - SIP URI filter for the contact to be removed. This must be the full SIP URI as used during registered.
    
*   _next\_hop (string, optional)_ - the next SIP IP address/hostname on the way back to this contact. See the section below for details on how the next hop is computed. Hostnames are resolved before matching.
    
*   _sip\_instance (string, optional)_ - a "+sip.instance" value to be used for filtering purposes.
    
*   _blfag (string, optional)_ - a Branch Flag to be used for filtering purposes.
    

**IMPORTANT:** the IP address of each contact (for matching purposes) is computed as follows:

*   a. if a Path header is present, the hostname part of the Path URI will be resolved as the contact's IP address.
    
*   b. otherwise, if by using nathelper, the "Received" value (source IP of the next hop) is set for a contact, this becomes the chosen hostname to be resolved as the contact's IP address.
    
*   c. otherwise, the "hostname" part of the Contact header field URI is chosen to be resolved as the contact's IP address.
    

This function can be used from REQUEST\_ROUTE and ONREPLY\_ROUTE.

**Example�1.31.�`remove` usage**

...
# remove all contacts belonging to the "bob" AOR
remove("location", "sip:bob@atlanta.com");
...
# remove only bob's home phone contact
remove("location", "sip:bob@atlanta.com", "sip:bob@46.50.64.78");
...
# remove all bob's phones which are behind "50.60.50.60"
# note that "contact" parameter has to be specified with NULL value even though not used
$var(next\_hop) = "50.60.50.60"
remove("location", "sip:bob@atlanta.com", , $var(next\_hop));
...
# remove bob's phone with contact "sip:bob@46.50.64.78" that is behind "50.60.50.60"
remove("location", "sip:bob@atlanta.com", "sip:bob@46.50.64.78", "50.60.50.60");
...
# remove all contacts behind bob's mobile device X
remove("location", "sip:bob@atlanta.com", , , "<urn:uuid:e5e68d40-f08a-4600-b82e-ff4d5d8c1a8f>")

  

### 1.4.3.� `remove_ip_port(IP,Port, domain, [AOR])`

Remove all contacts behind a specific IP and Port, optionally filtering by AOR.

Meaning of the parameters is as follows:

*   _IP (string)_ - IP of the Contact to be removed
    
*   _Port (integer)_ - Port of the Contact to be removed
    
*   _domain (static string_ - Logical domain within the registrar. If a database is used, then this must be name of the table which stores the contacts.
    
*   _AOR (string, optional)_ - address-of-record to be searched (SIP URI)
    

This function can be used from ALL ROUTES.

**Example�1.32.�`remove_ip_port` usage**

...
# remove all contacts behind 8.8.8.8 port 43213
remove\_ip\_port("8.8.8.8",43213,"location");
...
# remove only bob's contacts behind the 8.8.8.8:43213 host
remove\_ip\_port("8.8.8.8",43213,"location","sip:bob@atlanta.com");
...

  

### 1.4.4.� `lookup(domain [, flags [, aor]])`

The functions extracts username from Request-URI and tries to find all contacts for the username in usrloc. If there are no such contacts, -1 will be returned. If there are such contacts, Request-URI will be overwritten with the contact that has the highest q value and optionally the rest will be appended to the message (depending on append\_branches parameter value).

If the method\_filtering option is enabled, the lookup function will return only the contacts that support the method of the processed request.

Meaning of the parameters is as follows:

*   _domain (static string)_ - Name of table that should be used for the lookup.
    
*   _flags (string, optional) - string composed of one or more of the following flags, comma-separated:_
    
    *   _'no-branches'_ - (old _b_ flag) this flag controls how the _lookup()_ function processes multiple contacts. If there are multiple contacts for the given username in usrloc and this flag is not set, Request-URI will be overwritten with the highest-q rated contact and the rest will be appended to sip\_msg structure and can be later used by tm for forking. If the flag is set, only Request-URI will be overwritten with the highest-q rated contact and the rest will be left unprocessed.
        
    *   _'to-branches-only'_ - (old _B_ flag) this flags forces all found contacts to be uploaded only as branches (in the destination set) and not at all in the R-URI of the current message. Using this option allows the _lookup()_ function to also be used in the context of a SIP reply.
        
    *   _'branch'_ - (old _r_ flag) this flag enables searching through existing branches for aor's and expanding them to contacts. For example, you have got AOR A in your ruri but you also want to forward your calls to AOR B. In order to do this, you must put AOR B in a branch, and if this flag enabled, the function will also expand AOR B to contacts, which will be put back into the branches. The AOR's that were in branches before the function call shall be removed.
        
        **WARNING:** _if you want this flag activated, the 'no-branches' flag must not be set, because by setting that flag you won't allow _lookup()_ to write in a branch._
        
    *   _'method-filtering'_ - (old _m_ flag) setting this flag will enable contact filtering based on the supported methods listed in the "Allow" header field during registration. Contacts which did not present an "Allow" header field during registration are assumed to support all standard SIP methods.
        
    *   _'ua-filtering=\[val\]'_ (old _u_ flag) (User-Agent filtering) - this flag enables regexp filtering by user-agent. It's useful with enabled append\_branches parameter. The value must use the format '/regexp/'.
        
    *   _'case-insensitive'_ (old _i_ flag) - this flag enables case insensitive filtering for the 'ua-filtering' flag.
        
    *   _'extended-regexp'_ - (old _e_ flag) this flag enables using of extended regexp format for the 'ua-filtering' flag.
        
    *   _'global'_ (old _g_ flag) (Global lookup) - this flag is only relevant with federated user location clustering. If set, the _lookup()_ function will not only perform the classic in-memory "search-AoR-and-push-branches" operation, but will also perform a metadata lookup and append an additional branch for each returned result. The "in-memory branches" correspond to local contacts (current location), while the "metadata branches" correspond to contacts available on one or more of the remaining locations of the platform.
        
        The AoR metadata consists of the minimally required information in order for one of the VoIP platform's locations (data centers) to advertise the presence of a locally registered AoR for the global platform. Specifically, this consists of two pieces of information:
        
        *   the AoR (e.g. "vladimir@federation-cluster")
            
        *   the home IP (e.g. "10.0.0.223")
            
        
    *   _'max-ping-latency=\[int\]'_ - (old _y_ flag) maximally accepted contact pinging latency (microseconds). Contacts of an AoR with a higher latency will be discarded during _lookup()_.
        
    *   _'sort-by-latency'_ - (old _Y_ flag) contacts will be picked in ascending order of their last successful pinging latency (fastest ping -> slowest ping). This flag may work together with the "max-ping-latency" flag.
        
    
*   _AOR (string, optional)_ - AOR to lookup for; if missing, the RURI is used as AOR;
    

Return codes:

*   **1** - contacts found and successfully pushed as branches. Contacts which required awakening prior to being reachable are being notified via async Push Notifications.
    
*   **2** - successfully started at least one async Push Notification for the found contacts, however no extra branches were populated (i.e. there is no need to call t\_relay()).
    
*   **\-1** - no contact found.
    
*   **\-2** - contacts found, but neither of them supports the current SIP method.
    
*   **\-3** - internal error during processing.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.33.�`lookup` usage**

...
lookup("location");  # simple lookup
   #or
lookup("location", "method-filtering"); # lookup with method filtering
   #or
lookup("location", "branch"); # lookup with aor branch search;
						# all contacts except the first one shall be put
						# in the branches
   #or
lookup("location", "ua-filtering=/phone/i"); # lookup with user-agent filtering
   #or
lookup("location", "", $var(aor)); # simple lookup with AOR from var
switch ($retcode) {
    case -1:
    case -3:
        sl\_send\_reply(404, "Not Found");
        exit;
    case -2:
        sl\_send\_reply(405, "Not Found");
        exit;
};
...

  

### 1.4.5.� `is_registered(domain ,[AOR])`

The function returns true if an AOR is registered, false otherwise. The function does not modify the message being process.

NOTE: if called for a reply (from onreply\_route), you must pass an AOR (as parameter), otherwise the function will fail.

Meaning of the parameters is as follows:

*   _domain (static string)_ - Name of table that should be used for the lookup.
    
*   _AOR (string, optional)_ - AOR to lookup for; if missing, the source if the AOR is the "To" header for REGISTER request, "From" header for any other sip request.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE, LOCAL\_ROUTE.

**Example�1.34.�`is_registered` usage**

...
/\*\*/
if (is\_method("REGISTER")) {
	/\* automatically uses the URI from the To header \*/
	if (is\_registered("location")) {
		xlog("this AOR is registered\\n")
		...
	}
};
/\* check the From uri whether this aor is registered or not \*/
if (is\_registered("location",$fu)) {
	xlog("caller is registered\\n");
}
...

  

### 1.4.6.� `is_contact_registered(domain ,[AOR],[contact],[callid])`

The function returns true if a contact and/or a callid from a certain AOR is registered, false otherwise. The function does not modify the message being process.

Meaning of the parameters is as follows:

*   _domain (static string)_ - Name of table that should be used for the lookup.
    
*   _AOR (string, optional)_ - AOR to lookup for; if missing, the source if the AOR is the "To" header for REGISTER request, "From" header for any other sip request.
    
*   _contact (contact, optional)_ (optional)- SIP URI to check if there is a registration with this URI as cotact (this may help you to make distinction between multiple registrations for the same user/AOR).
    
*   _callid (string, optional)_ - callid to check if a contact if registered with this callid (this may help you to make distinction between newly registered contact (callid not registered so far) and re-registration (callid already registered).
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE, LOCAL\_ROUTE.

**Example�1.35.�`is_contact_registered` usage**

...
/\* block users which are not registered... \*/
if (is\_method("INVITE")) {
	if (!is\_contact\_registered("location")) {
		sl\_send\_reply(401, "Unauthorized");
		...
	}
}

/\* ... or check whether the 2nd Contact URI is registered or not \*/
if (is\_method("INVITE")) {
	if (is\_contact\_registered("location", $fu, $(ct.fields(uri)\[1\])))
		xlog("caller is registered\\n");
}
...

  

### 1.4.7.� `is_ip_registered(domain ,[AOR],IPvar,[PORTvar])`

The function returns true if there is at least one contact that has been registered from the IP in the IPvar variable ( and from the optional PORTvar variable ). The IP is matched against the received host, if it exists, or the contact host otherwise. This function does not modify the message being process. This function replaces the old "is\_other\_contact" function.

Meaning of the parameters is as follows:

*   _domain (static string)_ - Name of table that should be used for the lookup.
    
*   _AOR (string, optional)_ - AOR to lookup for; if missing, the source if the AOR is the "To" header for REGISTER request, "From" header for any other sip request.
    
*   _IPvar (var)_ - the variable containing the IP matched against the contact host or the received host (see above). If the _IPvar_ is an AVP containing multiple values/IPs, then all the values are checked.
    
*   _PORTvar (var, optional)_ - the variable containing the port to be matched against the contact host or the received host (see above). If the _IPvar_ is an AVP containing multiple values/IPs, then the PORTvar is expected to contain the same number of entries, and all the values are checked.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE, ONREPLY\_ROUTE, LOCAL\_ROUTE.

**Example�1.36.�`is_ip_registered` usage**

...
/\* check the source ip  whether it is already registered \*/
if (is\_method("REGISTER")) {
	if (is\_ip\_registered("location",$tu,$si)) {
		xlog("already registered from this ip\\n");
		...
	}
};
...

  

### 1.4.8.� `add_sock_hdr(hdr_name)`

Adds to the current REGISTER request a new header with “hdr\_name” which contains the description of the received socket (proto:ip:port)

This makes sense only in multiple replicated servers scenarios.

Meaning of the parameters is as follows:

*   _hdr\_name (string)_ - header name to be used.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.37.�`add_sock_hdr` usage**

...
add\_sock\_hdr("Sock-Info");
...