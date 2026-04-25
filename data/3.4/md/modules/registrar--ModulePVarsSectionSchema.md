# registrar Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6612640)

3.2. [Most recently active contributors(1) to this module](#idp6718096)

**List of Examples**

1.1. [Set `default_expires` parameter](#idp199584)

1.2. [Set `min_expires` parameter](#idp196608)

1.3. [Set `max_expires` parameter](#idp5610576)

1.4. [Set `default_q` parameter](#idp5615696)

1.5. [Set `tcp_persistent_flag` parameter](#idp5621296)

1.6. [Set `realm_prefix` parameter](#idp179392)

1.7. [Set `case_sensitive` parameter](#idp185056)

1.8. [Set `received_avp` parameter](#idp191056)

1.9. [Set `received_param` parameter](#idp5638864)

1.10. [Setting the `allow_dup_cseq` parameter](#idp5645312)

1.11. [Setting the `expires_max_deviation` parameter](#idp5694320)

1.12. [Set `max_contacts` parameter](#idp5700016)

1.13. [Setting the _max\_username\_len_ module parameter](#idp5705168)

1.14. [Setting the _max\_domain\_len_ module parameter](#idp5710320)

1.15. [Setting the _max\_aor\_len_ module parameter](#idp5715376)

1.16. [Setting the _max\_contact\_len_ module parameter](#idp5720432)

1.17. [Set `retry_after` parameter](#idp5728448)

1.18. [Set `sock_hdr_namer` parameter](#idp5733488)

1.19. [Set `mcontact_avp` parameter](#idp5738752)

1.20. [Set `attr_avp` parameter](#idp5745184)

1.21. [Set `gruu_secret` parameter](#idp274928)

1.22. [Set `gruu_secret` parameter](#idp279696)

1.23. [Setting the `pn_enable` parameter](#idp5813824)

1.24. [Setting the `pn_providers` parameter](#idp5819472)

1.25. [Setting the `pn_ct_match_params` parameter](#idp5827520)

1.26. [Setting the `pn_pnsreg_interval` parameter](#idp5833664)

1.27. [Setting the `pn_trigger_interval` parameter](#idp5841984)

1.28. [Setting the `pn_skip_pn_interval` parameter](#idp5847648)

1.29. [Setting the `pn_refresh_timeout` parameter](#idp5856752)

1.30. [Setting the `pn_enable_purr` parameter](#idp5864960)

1.31. [`save` usage](#idp5939360)

1.32. [`remove` usage](#idp5976032)

1.33. [`remove_ip_port` usage](#idp5987632)

1.34. [`lookup` usage](#idp6069552)

1.35. [`is_registered` usage](#idp6078736)

1.36. [`is_contact_registered` usage](#idp6089984)

1.37. [`is_ip_registered` usage](#idp6102240)

1.38. [`add_sock_hdr` usage](#idp6109936)

1.39. [`async pn_process_purr()` usage](#idp6167632)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The module contains SIP REGISTER request processing logic, per RFC 3261. On top of this support, several extensions are available:

### 1.1.1.�Path Support (RFC 3327)

The registrar module includes SIP Path header field support according to [RFC 3327](https://tools.ietf.org/html/rfc3327), for usage in registrars and home-proxies.

A call to _save()_ stores, if path support is enabled in the registrar module, the values of the Path Header(s) along with the Contact information into usrloc. There are three modes for building the reply to a REGISTER message which includes one or more Path header fields:

*   _off_ - stores the value of the Path headers into usrloc without passing it back to the UAC in the reply.
    
*   _lazy_ - stores the Path header and passes it back to the UAC if Path-support is indicated by the “path” param in the Supported HF.
    
*   _strict_ - rejects the registration with “420 Bad Extension” if there's a Path header but no support for it is indicated by the UAC. Otherwise it's stored and passed back to the UAC.
    

A call to _lookup()_ always uses the Path header if found, and inserts it as Route HF either in front of the first Route HF, or after the last Via HF if no Route is present. It also sets the destination URI to the first Path URI, thus overwriting the received-URI, because NAT has to be handled at the outbound-proxy of the UAC (the first hop after client's NAT).

The whole process is transparent to the user, so no config changes are required besides enabling one of the "p0" / "p1" / "p2" flags when calling _save()_.

### 1.1.2.�GRUU Support (RFC 5627)

The registrar module includes support for Globally Routable User Agent URIs according to [RFC 5627](https://tools.ietf.org/html/rfc5627).

A call to _save()_ stores, if the phone supports GRUU, the values of the SIP Instance along with the contact into usrloc. The module will generate two types of GRUUs:

*   _public_ - exposes the underlying AOR, constructed just by attaching the SIP Instance as the ;gr parameter value. These are persistent, valid as long as the contact registration is valid.
    
*   _temporary_ - hides the underlying AOR Each new Register request leads to the construction of a new temporary GRUU, while Register requests with a different Call-ID lead to the invalidation of all the previous generated temporary GRUUs.
    

A call to _lookup()_ will try to detect if the R-URI contains a GRUU. If it does, it will route the request just for the Contact that the specific AOR belongs to, without appending any other branches.

Even if the the GRUU handling during the registration process is transparent to the user, so no config changes are required, you need to take care of the GRUU specifics when handling mid-dialog requests.

As the GRUU will be present in the contact header of the initial requests generated byt GRUU enabled devices, you will have to also do a lookup() when receiving a mid-dialog request with the GRUU indication in the RURI.

### 1.1.3.�SIP Push Notification Support (RFC 8599)

The registrar module includes support for standards-based SIP Push Notifications, per [RFC 8599](https://tools.ietf.org/html/rfc8599). Support for the basic version of the draft can be enabled by switching [pn\_enable](#param_pn_enable "1.3.23.�pn_enable (boolean)") to _true_. The module also includes optional support for sending Push Notifications during long-lived dialogs ([see RFC section 6](https://tools.ietf.org/html/rfc8599#page-23)), through the [pn\_enable\_purr](#param_pn_enable_purr "1.3.30.�pn_enable_purr (boolean)") switch.

Essential mechanics behind the Push Notification (PN) support:

*   the PN support is fully compatible with the existing logic and enabling it does not impose any limitations, as the registrar can simultaneously handle both SIP PN compliant and standard SIP User Agents
    
*   OpenSIPS will raise a [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) event any time a Push Notification needs to be sent to a PN-enabled contact. The event includes the PN coordinates of the contact -- they may be found in the Contact URI ('uri' event parameter) and may be extracted using the {uri.param,name} transformation. From here onwards, it is up to the script developer to trigger the Push Notification (e.g. possibly by sending an HTTP POST with the [rest\_client](rest_client) module), thus forcing a re-registration from the device.
    
*   REGISTER processing is unchanged -- PN-enabled UAs are saved just as regular UAs, with the former ones additionally having the _4_ bitflag set in the "Flags" field of any MI listing of contacts, for differentiation purposes
    
*   initial INVITE processing is barely changed, with the _lookup()_ function now additionally returning a value of **2** if the only found contacts were PN-enabled contacts, all which required a Push Notification. This means that PNs have been triggered for each of them and t\_relay() is not required, since they are not reachable until they re-register!
    
    Using the event\_routing module, OpenSIPS will transparently fork a new branch from the current INVITE on each re-registration from these contacts within the accepted [pn\_refresh\_timeout](#param_pn_refresh_timeout "1.3.29.�pn_refresh_timeout (integer)")
    
*   mid-dialog requests: In some cases (e.g. long-lived dialogs), a PN may be required before being able to route a mid-dialog request to a SIP UA. The [pn\_process\_purr()](#afunc_pn_process_purr "1.5.1.� pn_process_purr(domain)") async function will take care of triggering the PN event and resuming the script as soon as a re-registration from the concerned contact is received.
    

For more information or examples, refer to the documentation of the "pn\_xxx" module parameters or the OpenSIPS blog posts around the "SIP Push Notification" topic.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _usrloc - User Location Module_.
    
*   _signaling - Signaling module_.
    
*   _event\_routing_, if [pn\_enable](#param_pn_enable "1.3.23.�pn_enable (boolean)") is set to _true_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

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

If you plan to use the “save()” function in reply route, please refer to [mcontact\_avp](#param_mcontact_avp "1.3.19.�mcontact_avp (string)") module parameter.

**Example�1.31.�`save` usage**

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

  

### 1.4.2.� `remove(domain, AOR[, [contact][, [next_hop][, [sip_instance]]]])`

Explicitly remove contacts behind a given address-of-record.

Meaning of the parameters is as follows:

*   _domain (static string_ - Logical domain within the registrar. If a database is used, then this must be name of the table which stores the contacts.
    
*   _AOR (string)_ - address-of-record to be searched (SIP URI)
    
*   _contact (string, optional)_ - SIP URI filter for the contact to be removed. This must be the full SIP URI as used during registered.
    
*   _next\_hop (string, optional)_ - the next SIP IP address/hostname on the way back to this contact. See the section below for details on how the next hop is computed. Hostnames are resolved before matching.
    
*   _sip\_instance (string, optional)_ - a "+sip.instance" value to be used for filtering purposes.
    

**IMPORTANT:** the IP address of each contact (for matching purposes) is computed as follows:

*   a. if a Path header is present, the hostname part of the Path URI will be resolved as the contact's IP address.
    
*   b. otherwise, if by using nathelper, the "Received" value (source IP of the next hop) is set for a contact, this becomes the chosen hostname to be resolved as the contact's IP address.
    
*   c. otherwise, the "hostname" part of the Contact header field URI is chosen to be resolved as the contact's IP address.
    

This function can be used from REQUEST\_ROUTE and ONREPLY\_ROUTE.

**Example�1.32.�`remove` usage**

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

**Example�1.33.�`remove_ip_port` usage**

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

**Example�1.34.�`lookup` usage**

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

**Example�1.35.�`is_registered` usage**

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

**Example�1.36.�`is_contact_registered` usage**

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

**Example�1.37.�`is_ip_registered` usage**

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

**Example�1.38.�`add_sock_hdr` usage**

...
add\_sock\_hdr("Sock-Info");
...

  

## 1.5.�Exported Asynchronous Functions

### 1.5.1.� `pn_process_purr(domain)`

Perform mid-dialog request processing, according to RFC 8599. For such requests, search the R-URI and topmost Route header field URI for a _";pn-purr"_ parameter value that both matches the OpenSIPS PURR format and corresponds to an usrloc registration. Once a usrloc contact is located, trigger an [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) event and place the request on async hold for at most [pn\_refresh\_timeout](#param_pn_refresh_timeout "1.3.29.�pn_refresh_timeout (integer)") seconds, until a matching REGISTER request arrives.

If processing ends before triggering the Push Notification, the request will no longer be put on async hold, with the resume route being immediately called.

Meaning of the parameters is as follows:

*   _domain (static string)_ - Logical domain within registrar. If a database is used, then this must be name of the table which stores the contacts.
    

**Return Codes**

*   **1** - Success, PN was launched.
    
*   **2** - Success, but PN was not launched (due to missing PURR, foreign PURR or offline contact)
    
*   **\-1** - Internal Error
    

**Example�1.39.�`async pn_process_purr()` usage**

route {
	...
	if (has\_totag()) {
		if (is\_method("ACK") && t\_check\_trans()) {
			t\_relay();
			exit;
		}

		if (!loose\_route()) {
			send\_reply(404, "Not Found");
			exit;
		}

		if (!is\_method("ACK"))
			async (pn\_process\_purr("location"), resume\_route);

		route(relay);
		exit;
	}
}

route \[resume\_route\] {
	$var(rc) = $rc;
	xlog("pn\_process\_purr() finished with $var(rc)\\n");

	...
}

  

## 1.6.�Exported Statistics

### 1.6.1.�`max_expires`

Value of max\_expires parameter.

### 1.6.2.�`max_contacts`

The value of max\_contacts parameter.

### 1.6.3.�`defaults_expires`

The value of default\_expires parameter.

### 1.6.4.�`accepted_regs`

Number of accepted registrations.

### 1.6.5.�`rejected_regs`

Number of rejected registrations.

## Chapter�2.�Frequently Asked Questions

**2.1.**

What happened with the old “append\_branch” module parameter?

It was removed as global option, as the “lookup” function takes this option via the flag "b" (append Branches) See the documentation of the “lookup” function.

**2.2.**

What happened with the old “method\_filtering” module parameter?

It was removed as global option, as the “lookup” function takes this option via the flag "m" (Method filtering) See the documentation of the “lookup” function.

**2.3.**

What happened with the old “sock\_flag” module parameter?

It was removed as global option, as the “save” function takes this option via the flag "s" (Socket header) See the documentation of the “save” function.

**2.4.**

What happened with the old “use\_path” and “path\_mode” module parameters?

They were removed as global option, as the “save” function takes these options via the flag "px" (path support) See the documentation of the “save” function.

**2.5.**

What happened with the old “path\_use\_received” module parameter?

It was removed as global option, as the “save” function takes this option via the flag "v" (path receiVed) See the documentation of the “save” function.

**2.6.**

What happened with the old “nat\_flag” module parameter?

It was removed, as the module internally loads this value from the “USRLOC” module (see the “nat\_bflag” USRLOC parameter).

**2.7.**

What happened with the old “use\_domain” module parameter?

It was removed, as the module internally loads this option from the “USRLOC” module. This was done in order to simplify the configuration.

**2.8.**

What happened with the old “save\_noreply” and “save\_memory” functions?

There functions were merged into the new “save(domain,flags)” functions. If a reply should be sent or if the DB should be updated also is controlled via the flags.

**2.9.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.10.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.11.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

**2.12.**

What happened to the desc\_time\_order parameter?

It was removed, as its functionality was mmigrate into usrloc module, were there is a parameter with the same name.

## Chapter�3.�Contributors

## 3.1.�By Commit Statistics

**Table�3.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

196

122

2857

3025

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

168

114

2383

2031

3.

Jan Janak ([@janakj](https://github.com/janakj))

120

73

3465

1102

4.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

23

19

160

105

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

20

15

267

75

6.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

20

12

729

96

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

20

9

243

497

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

16

4

763

248

9.

Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg))

15

9

538

45

10.

Andreas Granig

13

7

527

36

  

**All remaining contributors**: Henning Westerholt ([@henningw](https://github.com/henningw)), Andrei Pelinescu-Onciul, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Ancuta Onofrei, Elena-Ramona Modroiu, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Sergio Gutierrez, Carsten Bock, Jeffrey Magder, Kobi Eshun ([@ekobi](https://github.com/ekobi)), Marcus Hunger, Juli�n Moreno Pati�o, Phil D'Amore, Klaus Darilion, Irina-Maria Stanescu, Dmitry Semyonov, Konstantin Bokarius, Andrej Solovjov, Jesus Rodrigues, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Ruslan Bukin, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), [@jalung](https://github.com/jalung), Tolga Tarhan, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 3.2.�By Commit Activity

**Table�3.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2013 - Feb 2026

2.

Andrej Solovjov

Jul 2025 - Jul 2025

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2023

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Apr 2011 - Apr 2023

5.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jul 2004 - Feb 2023

6.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Sep 2011 - Nov 2022

7.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Sep 2003 - Jan 2022

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

9.

[@jalung](https://github.com/jalung)

Aug 2017 - Aug 2017

10.

Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas))

May 2011 - Mar 2017

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Juli�n Moreno Pati�o, Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Tolga Tarhan, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Ruslan Bukin, Irina-Maria Stanescu, Kobi Eshun ([@ekobi](https://github.com/ekobi)), Phil D'Amore, Sergio Gutierrez, Klaus Darilion, Henning Westerholt ([@henningw](https://github.com/henningw)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jesus Rodrigues, Dan Pascu ([@danpascu](https://github.com/danpascu)), Ancuta Onofrei, Marcus Hunger, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Elena-Ramona Modroiu, Jeffrey Magder, Carsten Bock, Andreas Granig, Dmitry Semyonov, Jan Janak ([@janakj](https://github.com/janakj)), Andrei Pelinescu-Onciul, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Juli�n Moreno Pati�o, Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Irina-Maria Stanescu, Kobi Eshun ([@ekobi](https://github.com/ekobi)), Sergio Gutierrez, Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Jesus Rodrigues, Marcus Hunger, Juha Heinanen ([@juha-h](https://github.com/juha-h)), Elena-Ramona Modroiu, Carsten Bock, Andreas Granig, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2003 FhG FOKUS

Copyright � 2020 [OpenSIPS Solutions](http://opensips-solutions.com)