## 1.6.�Exported Functions

### 1.6.1.� `mid_registrar_save(domain[, flags[, aor[, outgoing_expires[, ownership_tag]]]])`

Function to be called when handling REGISTER requests. This function decides if a REGISTER should be forwarded to the main registrar and performs all the necessary changes over the registered contacts. The function is also covering the handling of the 2xx REGISTER replies - the contacts confirmed by the main registrar will be automatically saved in the local user location (without any additional scripting).

In Contact/AOR throttling modes (more info about working modes in [Section�1.2, “Working modes”](#sec-working-modes "1.2.�Working modes")), the return value of this function indicates whether the script writer must forward the REGISTER request to the main registrar, or just wrap up any left-over processing and exit script execution, as the current REGISTER request has been answered with 200 OK (absorbed at mid-registrar level).

Depending on the current working _[mode](#param_mode "1.5.1.�mode (integer)")_ and _[contact\_id\_insertion](#param_contact_id_insertion "1.5.2.�contact_id_insertion (integer)")_, the function may additionally perform the following series of transformations when relaying REGISTER requests:

*   in _"Contact throttling"_ mode
    
    *   change the value of the _Expires_ header field to the value of _outgoing\_expires_, if given, otherwise the value given by the _[outgoing\_expires](#param_outgoing_expires "1.5.5.�outgoing_expires (integer)")_ module parameter. The same applies to any _";expires"_ Contact URI parameter.
        
    *   replace the "host:port" part of all Contact URIs of the incoming REGISTER request with an OpenSIPS listening interface
        
    *   append a parameter to each _Contact_ URI, which will allow the module to match the reply contacts and also route calls. The name of this URI parameter is configurable via _[contact\_id\_param](#param_contact_id_param "1.5.3.�contact_id_param (string)")_
        
    
*   in _"AOR throttling"_ mode
    
    *   change the value of the _Expires_ header field to the value of _outgoing\_expires_, if given, otherwise the value given by the _[outgoing\_expires](#param_outgoing_expires "1.5.5.�outgoing_expires (integer)")_ module parameter.
        
    *   replace all _Contact_ header fields of the request with a single _Contact_ header field, which will contain the following SIP URI: "sip:address-of-record@proxy\_ip:proxy\_port"
        
    

Meaning of the parameters is as follows:

*   _domain_ (static string) - logical domain within the registrar. If a database is used, then this must be name of the _usrloc_ table which stores the contacts
    
*   _flags_ (string, optional) - string composed of one or more of the following flags, comma-separated:
    
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
        
    
*   _aor (string, optional)_ - a custom Address-of-Record. If not given, the AOR will be taken from the _To_ header URI
    
*   _outgoing\_expires (int, optional)_ \- only relevant in Contact/AOR throttling modes, this is a custom value for the contact expiration interval of the outgoing REGISTER request, which overrides the default _[outgoing\_expires](#param_outgoing_expires "1.5.5.�outgoing_expires (integer)")_ module parameter.
    
*   _ownership\_tag_ (string, optional) - a cluster-shared tag (see the clusterer module documentation for more details) which will be attached to each contact saved from the current request. This tag is only relevant in clustered user location scenarios and helps determine the current logical owner node of a contact. This, in turn, is useful in order to restrict nodes which are not currently responsible for this contact from performing certain actions (for example: incorrectly originating pings from a non-owned virtual IP address in highly-available setups).
    

**Return value**

*   1 (success) - current REGISTER request must be dispatched by the script writer over to the main registrar
    
*   2 (success) - current REGISTER request has been absorbed by the mid-registrar; a 200 OK reply has been sent upstream
    
*   \-1 (error) - generic error code; the logs should provide more help
    

This function can only be used from the request route.

**Example�1.34.�`_mid_registrar_save_` usage**

...
if (is\_method("REGISTER")) {
	mid\_registrar\_save("location");
	switch ($retcode) {
	case 1:
		xlog("L\_INFO", "forwarding REGISTER to main registrar...\\n");
		$ru = "sip:10.0.0.3:5070";
		if (!t\_relay()) {
			send\_reply(500, "Server Internal Error 1");
		}

		break;
	case 2:
		xlog("L\_INFO", "REGISTER has been absorbed!\\n");
		break;
	default:
		xlog("L\_ERR", "mid-registrar error!\\n");
		send\_reply(500, "Server Internal Error 2");
	}

	exit;
}
...

  

### 1.6.2.� `mid_registrar_lookup(domain[, [flags][, [aor]]])`

Function to be called when receiving requests from the main registrar (to be routed to the end-user). It performs the local lookup (in user location) and the necessary RURI processing in order to route the requests further to the end-user registered contacts (note that multiple branches/destinations may result after the lookup).

Depending on the current working _[mode](#param_mode "1.5.1.�mode (integer)")_, the function will behave as follows:

*   in _"mirror"_ mode
    
    *   extract the username (Address-of-Record) from the Request-URI and look up all of its contact bindings stored in the user location. The Request-URI (**$ru** variable) will be overwritten with the highest q-value contact, with additional branches for each contact being optionally created. (depending on the _flags_ parameter)
        
    
*   in _"Contact throttling"_ mode
    
    *   extract the _[contact\_id\_param](#param_contact_id_param "1.5.3.�contact_id_param (string)")_ from the Request-URI, derive the actual SIP URI of the destination from it and set it as the new Request-URI of the INVITE (**$ru** variable).
        
    
*   in _"AOR throttling"_ mode
    
    *   extract the username (Address-of-Record) from the Request-URI and look up all of its contact bindings stored in the user location. The Request-URI (**$ru** variable) will be overwritten with the highest q-value contact, with additional branches for each contact being optionally created. (depending on the _flags_ parameter)
        
    

Meaning of the parameters is as follows:

*   _domain (static string)_ - logical domain within the registrar. If a database is used, then this must be name of the _usrloc_ table which stores the contacts
    
*   _flags (string, optional) - string composed of one or more of the following flags, comma-separated:_
    
    *   _'no-branches'_ - (old _b_ flag) this flag controls how the _mid\_registrar\_lookup()_ function processes multiple contacts. If there are multiple contacts for the given username in usrloc and this flag is not set, Request-URI will be overwritten with the highest-q rated contact and the rest will be appended to sip\_msg structure and can be later used by tm for forking. If the flag is set, only Request-URI will be overwritten with the highest-q rated contact and the rest will be left unprocessed.
        
    *   _'to-branches-only'_ - (old _B_ flag) this flags forces all found contacts to be uploaded only as branches (in the destination set) and not at all in the R-URI of the current message. Using this option allows the _mid\_registrar\_lookup()_ function to also be used in the context of a SIP reply.
        
    *   _'branch'_ - (old _r_ flag) this flag enables searching through existing branches for aor's and expanding them to contacts. For example, you have got AOR A in your ruri but you also want to forward your calls to AOR B. In order to do this, you must put AOR B in a branch, and if this flag enabled, the function will also expand AOR B to contacts, which will be put back into the branches. The AOR's that were in branches before the function call shall be removed.
        
        **WARNING:** _if you want this flag activated, the 'no-branches' flag must not be set, because by setting that flag you won't allow _mid\_registrar\_lookup()_ to write in a branch._
        
    *   _'method-filtering'_ - (old _m_ flag) setting this flag will enable contact filtering based on the supported methods listed in the "Allow" header field during registration. Contacts which did not present an "Allow" header field during registration are assumed to support all standard SIP methods.
        
    *   _'ua-filtering=\[val\]'_ (old _u_ flag) (User-Agent filtering) - this flag enables regexp filtering by user-agent. It's useful with enabled append\_branches parameter. The value must use the format '/regexp/'.
        
    *   _'case-insensitive'_ (old _i_ flag) - this flag enables case insensitive filtering for the 'ua-filtering' flag.
        
    *   _'extended-regexp'_ - (old _e_ flag) this flag enables using of extended regexp format for the 'ua-filtering' flag.
        
    *   _'global'_ (old _g_ flag) (Global lookup) - this flag is only relevant with federated user location clustering. If set, the _mid\_registrar\_lookup()_ function will not only perform the classic in-memory "search-AoR-and-push-branches" operation, but will also perform a metadata lookup and append an additional branch for each returned result. The "in-memory branches" correspond to local contacts (current location), while the "metadata branches" correspond to contacts available on one or more of the remaining locations of the platform.
        
        The AoR metadata consists of the minimally required information in order for one of the VoIP platform's locations (data centers) to advertise the presence of a locally registered AoR for the global platform. Specifically, this consists of two pieces of information:
        
        *   the AoR (e.g. "vladimir@federation-cluster")
            
        *   the home IP (e.g. "10.0.0.223")
            
        
    *   _'max-ping-latency=\[int\]'_ - (old _y_ flag) maximally accepted contact pinging latency (microseconds). Contacts of an AoR with a higher latency will be discarded during _mid\_registrar\_lookup()_.
        
    *   _'sort-by-latency'_ - (old _Y_ flag) contacts will be picked in ascending order of their last successful pinging latency (fastest ping -> slowest ping). This flag may work together with the "max-ping-latency" flag.
        
    
*   _aor (string, optional)_ - a custom Address-of-Record. If not given, the AOR will be taken from the _Request-URI_
    

Return codes:

*   **1** - contacts found and successfully pushed as branches. Contacts which required awakening prior to being reachable are being notified via async Push Notifications.
    
*   **2** - successfully started at least one async Push Notification for the found contacts, however no extra branches were populated (i.e. there is no need to call t\_relay()).
    
*   **\-1** - no contact found.
    
*   **\-2** - contacts found, but neither of them supports the current SIP method.
    
*   **\-3** - internal error during processing.
    

This function can only be used from the request route.

**Example�1.35.�`_mid_registrar_lookup_` usage**

...
	# initial invites from the main registrar - need to look them up!
	if (is\_method("INVITE") and $si == "10.0.0.3" and $sp == 5070) {
		if (!mid\_registrar\_lookup("location")) {
			t\_reply(404, "Not Found");
			exit;
		}

		if (!t\_relay())
			send\_reply(500, "Server Internal Error 3");

	    exit;
	}
...