## 1.3.�Exported Parameters

### 1.3.1.�`default_expires` (integer)

If the processed message contains neither Expires HFs nor expires contact parameters, this value will be used for newly created usrloc records. The parameter contains number of second to expire (for example use 3600 for one hour).

_Default value is 3600._

**Example�1.1.�Set `default_expires` parameter**

...
modparam("registrar", "default\_expires", 1800)
...

  

### 1.3.2.�`min_expires` (integer)

The minimum expires value of a Contact, values lower than this minimum will be automatically set to the minimum. Value 0 disables the checking.

_Default value is 60._

**Example�1.2.�Set `min_expires` parameter**

...
modparam("registrar", "min\_expires", 60)
...

  

### 1.3.3.�`max_expires` (integer)

The maximum expires value of a Contact, values higher than this maximum will be automatically set to the maximum. Value 0 disables the checking.

_Default value is 0._

**Example�1.3.�Set `max_expires` parameter**

...
modparam("registrar", "max\_expires", 120)
...

  

### 1.3.4.�`default_q` (integer)

The parameter represents default q value for new contacts. Because OpenSIPS doesn't support float parameter types, the value in the parameter is divided by 1000 and stored as float. For example, if you want default\_q to be 0.38, use value 380 here.

_Default value is 0._

**Example�1.4.�Set `default_q` parameter**

...
modparam("registrar", "default\_q", 1000)
...

  

### 1.3.5.�`tcp_persistent_flag` (string)

The parameter specifies the message flag to be used to control the module behaviour regarding TCP connections. If the flag is set for a REGISTER via TCP containing a TCP contact, the module, via the “save()” function, will set the lifetime of the TCP connection to the contact expire value. By doing this, the TCP connection will stay on as long as the contact is valid.

_Default value is -1 (disabled)._

**Example�1.5.�Set `tcp_persistent_flag` parameter**

...
modparam("registrar", "tcp\_persistent\_flag", "TCP\_PERSIST\_DURATION")
...

  

### 1.3.6.�`realm_prefix` (string)

Prefix to be automatically strip from realm. As an alternative to SRV records (not all SIP clients support SRV lookup), a subdomain of the master domain can be defined for SIP purposes (like sip.mydomain.net pointing to same IP address as the SRV record for mydomain.net). By ignoring the realm\_prefix "sip.", at registration, sip.mydomain.net will be equivalent to mydomain.net .

_Default value is NULL (none)._

**Example�1.6.�Set `realm_prefix` parameter**

...
modparam("registrar", "realm\_prefix", "sip.")
...

  

### 1.3.7.�`case_sensitive` (integer)

If set to 1 then AOR comparison will be case sensitive (as RFC3261 instructs), if set to 0 then AOR comparison will be case insensitive.

_Default value is 1._

**Example�1.7.�Set `case_sensitive` parameter**

...
modparam("registrar", "case\_sensitive", 0)
...

  

### 1.3.8.�`received_avp` (str)

Registrar will store the value of the AVP configured by this parameter in the received column in the user location database. It will leave the column empty if the AVP is empty. The AVP should contain a SIP URI consisting of the source IP, port, and protocol of the REGISTER message being processed.

### Note

The value of this parameter should be the same as the value of corresponding parameter of nathelper module.

_Default value is "NULL" (disabled)._

**Example�1.8.�Set `received_avp` parameter**

...
modparam("registrar", "received\_avp", "$avp(rcv)")
...

  

### 1.3.9.�`received_param` (string)

The name of the parameter that will be appended to Contacts of 200 OK when the received URI was set by nathelper module.

_Default value is "received"._

**Example�1.9.�Set `received_param` parameter**

...
modparam("registrar", "received\_param", "rcv")
...

  

### 1.3.10.�`allow_dup_cseq` (boolean)

Some SIP stacks will re-REGISTER using the same Call-ID and CSeq values. While rejecting such requests is consistent with RFC 3261 � 10.3.7, enabling this parameter instructs the registrar to accept them instead, improving interoperability.

_Default value is _false_ (duplicate CSeq is rejected)._

**Example�1.10.�Setting the `allow_dup_cseq` parameter**

...
# loose RFC 3261 compliance: allow REGISTER requests with duplicate CSeq
modparam("registrar", "allow\_dup\_cseq", true)
...
		

  

### 1.3.11.�`expires_max_deviation` (integer)

Set this parameter in order to add a random +/- deviation up to and including the given value to the expiration interval of a newly registered contact. For example, if this parameter is set to _100_ and a phone registers for 1800 sec, the final expiry will be a random number in the \[1700, 1900\] interval.

By randomizing the registration lifetimes of the contacts, the server is better equipped to deal with a post-restart _registration storm_, when all TCP connections are lost and a significant portion of UAs will re-register at the same time. Thanks to the contact lifetime randomization, the registration storm will only happen once rather than, e.g., every 1800 seconds following the restart.

_Default value is 0 (no deviation)._

**Example�1.11.�Setting the `expires_max_deviation` parameter**

...
# add a random +/- 0-100 seconds to each registration lifetime
modparam("registrar", "expires\_max\_deviation", 100)
...
		

  

### 1.3.12.�`max_contacts` (integer)

The parameter can be used to limit the number of contacts per AOR (Address of Record) in the user location database. Value 0 disables the check.

This is the default value and will be used only if no other value (for max\_contacts) is passed as parameter to the save() function. That's it - the function parameter overwride this global parameter.

_Default value is 0._

**Example�1.12.�Set `max_contacts` parameter**

...
# Allow no more than 10 contacts per AOR
modparam("registrar", "max\_contacts", 10)
...
		

  

### 1.3.13.�`max_username_len` (integer)

The maximum length of the "username" part of an Address-of-Record SIP URI.

Default value is **64**.

**Example�1.13.�Setting the _max\_username\_len_ module parameter**

modparam("registrar", "max\_username\_len", 128)

  

### 1.3.14.�`max_domain_len` (integer)

The maximum length of the "domain" part of an Address-of-Record SIP URI.

Default value is **64**.

**Example�1.14.�Setting the _max\_domain\_len_ module parameter**

modparam("registrar", "max\_domain\_len", 128)

  

### 1.3.15.�`max_aor_len` (integer)

The maximum length of an Address-of-Record SIP URI.

Default value is **256**.

**Example�1.15.�Setting the _max\_aor\_len_ module parameter**

modparam("registrar", "max\_aor\_len", 512)

  

### 1.3.16.�`max_contact_len` (integer)

The maximum length of a Contact header field SIP URI.

Default value is **255**.

**Example�1.16.�Setting the _max\_contact\_len_ module parameter**

modparam("registrar", "max\_contact\_len", 512)

  

### 1.3.17.�`retry_after` (integer)

The registrar can generate 5xx reply to REGISTER in various situations. It can, for example, happen when the `max_contacts` parameter is set and the processing of REGISTER request would exceed the limit. In this case the registrar would generate "503 Service Unavailable" response.

If you want to add the Retry-After header field in 5xx replies, set this parameter to a value grater than zero (0 means do not add the header field). See section 20.33 of RFC3261 for more details.

_Default value is 0 (disabled)._

**Example�1.17.�Set `retry_after` parameter**

...
modparam("registrar", "retry\_after", 30)
...
		

  

### 1.3.18.�`sock_hdr_name` (string)

Header which contains a socket description (proto:IP:port) to override the received socket info. The header will be search and used only if the flag 's' (Socket header) is set at "save()" time.

This makes sense only in multiple replicated servers scenarios.

_Default value is NULL._

**Example�1.18.�Set `sock_hdr_namer` parameter**

...
modparam("registrar", "sock\_hdr\_name", "Sock-Info")
...
		

  

### 1.3.19.�`mcontact_avp` (string)

AVP to store the modified binding/contact that is set during cached registrations scenario (when REGISTER is forwarded to another registrar). The AVP will be used to extract the "expires" value returned in the 200 OK by the main registrar.

This makes sense only in cached registrations scenario, where your OpenSIPS is caching registrations before forwarding them to the main registrar.

_Default value is NULL._

**Example�1.19.�Set `mcontact_avp` parameter**

...
modparam("registrar", "mcontact\_avp", "$avp(orig\_ct)")
...
route {
   ...
   # before forwarding the REGISTER request, save the outgoing contact.
   # Be SURE to do it after all the possible changes over the contact,
   # like fix\_nated\_contact()
   $avp(orig\_ct) = $ct.fields(uri);
   t\_on\_reply("do\_save");
   t\_relay("udp:ip:port");
   ...
}
...
onreply\_route\[do\_save\] {
	if ($rs=="200")
		save("location");
}
...
		

  

### 1.3.20.�`attr_avp` (string)

AVP to store specific additional information for each registration. This information is read from the AVP and stored (in memory, db or both) at every registrar 'save'. When a registrar 'lookup' or 'is\_registered' function is called, the _attr\_avp_ is populated with the value saved at \[re\]registration.

When doing call forking, the avp will hold multiple values. The position of the corresponding attribute information in _attr\_avp_ is equal to the branch index. An example scenario is given below.

_Default value is NULL._

**Example�1.20.�Set `attr_avp` parameter**

\# reading attributes from the attr\_pvar when doing parallel forking
...
modparam("registrar", "attr\_avp", "$avp(attr)")

...
if (is\_method("REGISTER")) {
	$avp(attr) = "contact\_info";
	save("location");
	exit;
}
...
lookup("location");
t\_on\_branch("parallel\_fork");
...
branch\_route \[parallel\_fork\] {
	xlog("Attributes for branch $T\_branch\_idx: $(avp(attr)\[$T\_branch\_idx\])\\n");
}

		

  

### 1.3.21.�`gruu_secret` (string)

The string that will be used in XORing when generating temporary GRUUs.

_If not set, 'OpenSIPS' is the default secret._

**Example�1.21.�Set `gruu_secret` parameter**

...
modparam("registrar", "gruu\_secret", "top\_secret")
...
		

  

### 1.3.22.�`disable_gruu` (int)

Globally disable GRUU handling

_Default value is 1 ( GRUU will not be handled )._

**Example�1.22.�Set `gruu_secret` parameter**

...
modparam("registrar", "disable\_gruu", 0)
...
		

  

### 1.3.23.�`pn_enable` (boolean)

Enable SIP Push Notification support ([_RFC 8599_](https://tools.ietf.org/html/rfc8599)). If enabled, Contact header field URIs which include all [pn\_ct\_match\_params](#param_pn_ct_match_params "1.3.25.�pn_ct_match_params (string)") will be matched against existing bindings using only these parameters. Otherwise, the module will attempt to match them as usual, using the current usrloc [matching\_mode](usrloc#param_matching_mode).

_Default value is **false**._

**Example�1.23.�Setting the `pn_enable` parameter**

...
modparam("registrar", "pn\_enable", true)
...

  

### 1.3.24.�`pn_providers` (string)

A list of supported Push Notification providers. While only three possible values are defined by RFC 8599 ("apns", "fcm" and "webpush"), non-standard values may be specified as well.

_Default value is **NULL** (not set)._

**Example�1.24.�Setting the `pn_providers` parameter**

...
modparam("registrar", "pn\_providers", "apns, fcm, webpush")
...

  

### 1.3.25.�`pn_ct_match_params` (string)

The minimally required list of RFC 8599 parameters (custom ones are accepted as well) which must be present in a Contact URI and identically match an existing binding in order for the binding to be refreshed during a SIP re-REGISTER. If at least one such parameter is missing from a Contact header field URI, the module will fall back to performing regular contact matching.

Note that if all above PN Contact URI parameters match an existing binding, the match is considered to be successful regardless if other parts of the SIP URI do not match (e.g. hostname, port, other URI parameters, etc.).

After calling _lookup()_ or [pn\_process\_purr()](#afunc_pn_process_purr "1.5.1.� pn_process_purr(domain)"), the above PN-related parameters will be automatically stripped from the resulting Request and Contact URI event parameter, respectively.

_Default value is **"pn-provider, pn-prid, pn-param"**._

**Example�1.25.�Setting the `pn_ct_match_params` parameter**

...
modparam("registrar", "pn\_ct\_match\_params", "pn-provider, pn-prid")
...

  

### 1.3.26.�`pn_pnsreg_interval` (integer)

For devices capable of waking up and refreshing their binding on their own (signified by the _";+sip.pnsreg"_ Contact header field parameter), this setting denotes the prior-to-expiration interval advertised by the server at which the device should issue its binding refresh request.

_Default value is **130** (seconds before expiry)._

**Example�1.26.�Setting the `pn_pnsreg_interval` parameter**

...
modparam("registrar", "pn\_pnsreg\_interval", 140)
...

  

### 1.3.27.�`pn_trigger_interval` (integer)

If a binding refresh REGISTER request from a given SIP endpoint does not arrive within at least [pn\_trigger\_interval](#param_pn_trigger_interval "1.3.27.�pn_trigger_interval (integer)") seconds prior to expiration (e.g. because the device does not support _";+sip.pnsreg"_ or because of other error conditions), the [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) usrloc event will be triggered.

Once [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) is triggered, the script writer should use the RFC 8599 parameters from the Contact URI in order to generate a Push Notification request to the PN provider of the device, in order to cause the device to wake up and re-register.

_Default value is **120** (seconds before expiry)._

**Example�1.27.�Setting the `pn_trigger_interval` parameter**

...
modparam("registrar", "pn\_trigger\_interval", 130)
...

  

### 1.3.28.�`pn_skip_pn_interval` (integer)

Following a successful (re)registration of a contact, this setting denotes a time interval, in seconds, during which the contact is assumed to be reachable, so any Push Notifications will be skipped.

_Default value is **0** seconds (always generate Push Notifications)._

**Example�1.28.�Setting the `pn_skip_pn_interval` parameter**

...
modparam("registrar", "pn\_skip\_pn\_interval", 10)
...

  

### 1.3.29.�`pn_refresh_timeout` (integer)

This timeout starts counting following a _lookup()_ or a [pn\_process\_purr()](#afunc_pn_process_purr "1.5.1.� pn_process_purr(domain)") which triggers a Push Notification. The value represents the maximum allowed sum of the duration required for the Push Notification to be sent and the duration required for the corresponding re-registration from the device to arrive.

Once this timeout is exceeded for an initial or a mid-dialog request, any further re-registrations which match the pending Push Notification will no longer cause the desired effects. For example:

*   pending initial INVITE transactions will complete and will no longer auto-fork an additional branch for each REGISTER sent by the callee side
    
*   pending BYE messages will time out and OpenSIPS will attempt to route them despite not having received a confirmation that the target device is actually reachable
    

_Default value is **6** seconds._

**Example�1.29.�Setting the `pn_refresh_timeout` parameter**

...
modparam("registrar", "pn\_refresh\_timeout", 10)
...

  

### 1.3.30.�`pn_enable_purr` (boolean)

Enable the SIP Push Notification mechanism for long-lived dialogs. If enabled, the registrar will include a _"+sip.pnspurr"_ Feature-Caps header field tag in 200 OK replies to REGISTER requests. This tag represents a unique identifier for the registration (PURR - Proxy Unique Registration Reference).

During dialog setup, each UA may include, in its Contact header, the PURR value returned by OpenSIPS during registration. By including the PURR (e.g. ";pn-purr=XXX"), an agent indicates that it expects to be first awoken by a PN before being able to receive a mid-dialog request sent by the other party.

When enabling this parameter, make sure to also add logic for [pn\_process\_purr()](#afunc_pn_process_purr "1.5.1.� pn_process_purr(domain)").

_Default value is **false**._

**Example�1.30.�Setting the `pn_enable_purr` parameter**

...
modparam("registrar", "pn\_enable\_purr", true)
...