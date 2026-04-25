## 1.5.�Exported Parameters

### 1.5.1.�`mode` (integer)

Working mode of the module. Refer to [Section�1.2, “Working modes”](#sec-working-modes "1.2.�Working modes") for more details.

The following is true for **all** working modes:

*   when a REGISTER is received, the script writer must call _[mid\_registrar\_save()](#func_mid_registrar_save "1.6.1.� mid_registrar_save(domain[, flags[, aor[, outgoing_expires[, ownership_tag]]]])")_
    
*   the mid-registrar will insert itself on the call flow of all registrations according to the _[contact\_id\_insertion](#param_contact_id_insertion "1.5.2.�contact_id_insertion (integer)")_.
    
*   registrations forwarded by the mid-registrar will transparently result in a user location update only if the reply status code from the downstream registrar is 2xx.
    

Each working mode behaves differently, as follows:

*   _0 (Contact mirroring mode)_
    
    The module will only insert itself on the call flow. Contact expirations are left unchanged.
    
*   _1 (Contact throttling mode)_
    
    Contact throttling is a first step in lowering registration traffic rates. This is possible through the use of the _[outgoing\_expires](#param_outgoing_expires "1.5.5.�outgoing_expires (integer)")_ module parameter or the corresponding parameter to _[mid\_registrar\_save()](#func_mid_registrar_save "1.6.1.� mid_registrar_save(domain[, flags[, aor[, outgoing_expires[, ownership_tag]]]])")_, which allow the script writer to prolong the life of the registrations on the way to the main registrar.
    
    In this mode, the mid-registrar may alter Expires header field values or "expires" Contact header field parameters found in the initial request when forwarding registrations, according to _[outgoing\_expires](#param_outgoing_expires "1.5.5.�outgoing_expires (integer)")_
    
*   _2 (AOR throttling mode)_
    
    AOR throttling is a step beyond "Contact throttling", as the main registrar is only made aware of the network presence of AORs, rather than Contacts. This behaviour is also made possible through the _[outgoing\_expires](#param_outgoing_expires "1.5.5.�outgoing_expires (integer)")_ module parameter or the corresponding parameter to _[mid\_registrar\_save()](#func_mid_registrar_save "1.6.1.� mid_registrar_save(domain[, flags[, aor[, outgoing_expires[, ownership_tag]]]])")_, which allow the script writer to prolong the life of the registrations on the way to the main registrar.
    
    In this mode, the mid-registrar will fully replace the Contact set of all forwarded registrations with a single Contact, advertising that the AOR is available to the main registrar. The expiration value for this Contact is given by _[outgoing\_expires](#param_outgoing_expires "1.5.5.�outgoing_expires (integer)")_.
    

Default value is **0** (contact mirroring mode)

**Example�1.1.�Setting the _mode_ module parameter**

modparam("mid\_registrar", "mode", 2)

  

### 1.5.2.�`contact_id_insertion` (integer)

Only relevant in a "mirroring" or "contact throttling" [mode](#param_mode "1.5.1.�mode (integer)"). Controls where the additional unique Contact identification information (64-bit, hex-encoded integer) will be placed within outgoing Contact header field URIs. Refer to [Section�1.3, “Auto-Insertion Into Future SIP Flows”](#sip-flow-insertion "1.3.�Auto-Insertion Into Future SIP Flows") for more details.

Possible values are:

*   _"ct-param" (default)_ - the contact IDs shall be appended to outgoing Contact URIs as ";ctid=" parameters.
    
*   _"ct-username"_ - the contact IDs will substitute the "username" parts of outgoing Contact URIs
    

**Example�1.2.�Setting the _contact\_id\_insertion_ module parameter**

modparam("mid\_registrar", "contact\_id\_insertion", "ct-username")

  

### 1.5.3.�`contact_id_param` (string)

Only relevant in a "mirroring" or "contact throttling" [mode](#param_mode "1.5.1.�mode (integer)"). Specifies the name of the Contact URI parameter which is used by the module in order to match contacts and route SIP requests.

Default value is **“ctid”**

**Example�1.3.�Setting the _contact\_id\_param_ module parameter**

modparam("mid\_registrar", "contact\_id\_param", "ctid")

# Example resulting Contact header field:
# Contact: <sip:liviu@10.0.0.10:5060;ctid=619244948763447138>;expires=180.

  

### 1.5.4.�`at_escape_str` (string)

Only relevant when in "AoR throttling" [mode](#param_mode "1.5.1.�mode (integer)") and with the usrloc [use\_domain](usrloc#param_use_domain) setting enabled. This string represents the escape sequence for the "@" character, which must be included, in one way or another, in mid-registrar's generated Contact URI usernames.

Setting this parameter to a different value may be useful in situations where the backend registrar is incompatible with the default escape string.

Default value is **“%40”**

**Example�1.4.�Setting the _at\_escape\_str_ module parameter**

modparam("mid\_registrar", "at\_escape\_str", "\_\_\_")

# Example Contact header field generated by mid-registrar:
# Contact: <sip:zach%40sipdomain.invalid@127.0.0.1:5060>;expires=120

  

### 1.5.5.�`outgoing_expires` (integer)

Only relevant in Contact/AOR throttling modes. Sets a minimal value for the expiration intervals of egressing contacts.

Default value is **3600** (seconds)

**Example�1.5.�Setting the _outgoing\_expires_ module parameter**

modparam("mid\_registrar", "outgoing\_expires", 3600)

  

### 1.5.6.�`received_avp` (string)

The module will store the value of the AVP configured by this parameter in the _received_ column of the user location table. It will leave the column empty if the AVP is empty. The AVP should contain a SIP URI consisting of the source IP, port, and protocol of the REGISTER message being processed.

### Note

The value of this parameter should be the same as the value of corresponding parameter of nathelper module.

Default value is **"NULL"** (disabled)

**Example�1.6.�Setting the _received\_avp_ module parameter**

modparam("mid\_registrar", "received\_avp", "$avp(rcv)")

  

### 1.5.7.�`received_param` (string)

The name of the parameter that will be appended to Contacts of 200 OK replies if the received URI is set by nathelper module.

### Note

The value of this parameter should be the same as the value of corresponding parameter of nathelper module.

Default value is **"received"**

**Example�1.7.�Setting the _received\_param_ module parameter**

modparam("mid\_registrar", "received\_param", "rcv")

  

### 1.5.8.�`extra_contact_params_avp` (string)

An AVP specification. This AVP is evaluated during _[mid\_registrar\_save()](#func_mid_registrar_save "1.6.1.� mid_registrar_save(domain[, flags[, aor[, outgoing_expires[, ownership_tag]]]])")_: if it holds a valid string, its content will be appended to _each_ new Contact URI built by the mid-registrar, for the outgoing request.

Default value is **None** (not used)

**Example�1.8.�Setting the _extra\_contact\_params\_avp_ module parameter**

\# NB: AVPs are cleared with every new SIP request
modparam("mid\_registrar", "extra\_contact\_params\_avp", "$avp(extra\_ct\_params)")

# setting the AVP during SIP message processing
$avp(extra\_ct\_params) = ";transport=tls";

  

### 1.5.9.�`attr_avp` (string)

AVP to store specific additional information for each registration. This information is read from the AVP and stored (in memory, DB or both) at [mid\_registrar\_save()](#func_mid_registrar_save "1.6.1.� mid_registrar_save(domain[, flags[, aor[, outgoing_expires[, ownership_tag]]]])"). When the [mid\_registrar\_lookup()](#func_mid_registrar_lookup "1.6.2.� mid_registrar_lookup(domain[, [flags][, [aor]]])") or 'is\_registered()' (registrar) functions are called, the _attr\_avp_ will be populated with the value saved at \[re\]registration.

When doing call forking, the AVP will hold multiple values. The position of the corresponding attribute information in _attr\_avp_ is equal to the branch index. An example scenario is given below.

_Default value is NULL._

**Example�1.9.�Set `attr_avp` parameter**

\# reading attributes from the attr\_pvar when doing parallel forking
...
modparam("mid\_registrar", "attr\_avp", "$avp(attr)")

...
if (is\_method("REGISTER")) {
	$avp(attr) = "contact\_info";
	mid\_registrar\_save("location");
	exit;
}
...
mid\_registrar\_lookup("location");
t\_on\_branch("parallel\_fork");
...
branch\_route \[parallel\_fork\] {
	xlog("Attributes for branch $T\_branch\_idx: $(avp(attr)\[$T\_branch\_idx\])\\n");
}

		

  

### 1.5.10.�`min_expires` (integer)

The minimum expires value of a Contact, values lower than this minimum will be automatically set to the minimum. Value 0 disables the checking.

Default value is **10** (seconds)

**Example�1.10.�Setting the _min\_expires_ module parameter**

modparam("mid\_registrar", "min\_expires", 600)

  

### 1.5.11.�`default_expires` (integer)

If the processed message contains neither Expires HFs nor expires contact parameters, this value will be used as the expiration interval of any newly created usrloc records.

Default value is **3600** (seconds)

**Example�1.11.�Setting the _default\_expires_ module parameter**

modparam("mid\_registrar", "default\_expires", 1800)

  

### 1.5.12.�`max_expires` (integer)

The maximum expires value of a Contact, values higher than this maximum will be automatically set to the maximum. Value 0 disables the checking.

Default value is **3600** (seconds)

**Example�1.12.�Setting the _max\_expires_ module parameter**

modparam("mid\_registrar", "max\_expires", 7200)

  

### 1.5.13.�`default_q` (integer)

Sets the default _"q"_ value for new contacts. Because OpenSIPS does not support floating point module parameters, the supplied _"q"_ value must be multiplied by 1000. For example, if you want _[default\_q](#param_default_q "1.5.13.�default_q (integer)")_ to be 0.38, set this parameter to 380.

Default value is **0**

**Example�1.13.�Setting the _default\_q_ module parameter**

modparam("mid\_registrar", "default\_q", 380)

  

### 1.5.14.�`tcp_persistent_flag` (string)

Specifies the message flag to be used to control the module behaviour regarding TCP connections. If the flag is set for a REGISTER via TCP containing a TCP contact, the module, via the _[mid\_registrar\_save()](#func_mid_registrar_save "1.6.1.� mid_registrar_save(domain[, flags[, aor[, outgoing_expires[, ownership_tag]]]])")_ function, will set the lifetime of the TCP connection to the contact expire value. By doing this, the TCP connection will stay up as long as its contacts are valid.

Default value is **\-1** (not set)

**Example�1.14.�Setting the _tcp\_persistent\_flag_ module parameter**

modparam("mid\_registrar", "tcp\_persistent\_flag", "TCP\_PERSIST\_REGISTRATIONS")

  

### 1.5.15.�`realm_prefix` (string)

In multi-domain user location scenarios (**"use\_domain"** usrloc module parameter set to _"1"_), this parameter denotes a prefix to be automatically stripped from the hostname part of _To_ header field URIs when doing a save, or _Request-URIs_ when doing a lookup.

It is meant as an alternative to DNS SRV records (not all SIP clients support SRV lookups), a subdomain of the master domain can be defined for SIP purposes (like "sip.mydomain.net" pointing to same IP address as the SRV record for "mydomain.net"). By ignoring the realm\_prefix "sip.", at registration, "sip.mydomain.net" will be translated to "mydomain.net".

Default value is **NULL** (none)

**Example�1.15.�Setting the _realm\_prefix_ module parameter**

modparam("mid\_registrar", "realm\_prefix", "sip.")

  

### 1.5.16.�`case_sensitive` (integer)

If set to 1, then AOR comparison will be case sensitive (as RFC3261 instructs), if set to 0 then AOR comparison will be case insensitive.

Default value is **1** (true)

**Example�1.16.�Setting the _case\_sensitive_ module parameter**

modparam("mid\_registrar", "case\_sensitive", 0)

  

### 1.5.17.�`expires_max_deviation` (integer)

Set this parameter in order to add a random +/- deviation up to and including the given value to the expiration interval of a newly registered contact. For example, if this parameter is set to _100_ and a phone registers for 1800 sec, the final expiry will be a random number in the \[1700, 1900\] interval.

By randomizing the registration lifetimes of the contacts, the server is better equipped to deal with a post-restart _registration storm_, when all TCP connections are lost and a significant portion of UAs will re-register at the same time. Thanks to the contact lifetime randomization, the registration storm will only happen once rather than, e.g., every 1800 seconds following the restart.

_Default value is 0 (no deviation)._

**Example�1.17.�Setting the `expires_max_deviation` parameter**

...
# add a random +/- 0-100 seconds to each registration lifetime
modparam("mid\_registrar", "expires\_max\_deviation", 100)
...
		

  

### 1.5.18.�`max_contacts` (integer)

The parameter can be used to limit the number of contacts per AOR (Address of Record) in the user location database. Value 0 disables the check.

This is the default value and will be used only if no other value (for max\_contacts) is passed as parameter to the save() function. That's it - the function parameter overwride this global parameter.

_Default value is 0._

**Example�1.18.�Set `max_contacts` parameter**

...
# Allow no more than 10 contacts per AOR
modparam("mid\_registrar", "max\_contacts", 10)
...
		

  

### 1.5.19.�`max_username_len` (integer)

The maximum length of the "username" part of an Address-of-Record SIP URI.

Default value is **64**.

**Example�1.19.�Setting the _max\_username\_len_ module parameter**

modparam("mid\_registrar", "max\_username\_len", 128)

  

### 1.5.20.�`max_domain_len` (integer)

The maximum length of the "domain" part of an Address-of-Record SIP URI.

Default value is **64**.

**Example�1.20.�Setting the _max\_domain\_len_ module parameter**

modparam("mid\_registrar", "max\_domain\_len", 128)

  

### 1.5.21.�`max_aor_len` (integer)

The maximum length of an Address-of-Record SIP URI.

Default value is **256**.

**Example�1.21.�Setting the _max\_aor\_len_ module parameter**

modparam("mid\_registrar", "max\_aor\_len", 512)

  

### 1.5.22.�`max_contact_len` (integer)

The maximum length of a Contact header field SIP URI.

Default value is **255**.

**Example�1.22.�Setting the _max\_contact\_len_ module parameter**

modparam("mid\_registrar", "max\_contact\_len", 512)

  

### 1.5.23.�`retry_after` (integer)

The mid-registrar can generate 5xx replies to registrations in various situations. It could, for example, happen when the _[max\_contacts](#param_max_contacts "1.5.18.�max_contacts (integer)")_ parameter is set and the processing of REGISTER request would exceed the limit. In this case, OpenSIPS would respond with "503 Service Unavailable".

If you want to add the Retry-After header field in 5xx replies, set this parameter to a value greater than zero (0 means: do not add the header field). See section 20.33 of RFC3261 for more details.

Default value is **0** (disabled)

**Example�1.23.�Setting the _retry\_after_ module parameter**

modparam("mid\_registrar", "retry\_after", 30)

  

### 1.5.24.�`disable_gruu` (integer)

Globally disable GRUU handling.

Default value is **1** (GRUUs will not be handled)

**Example�1.24.�Setting the _gruu\_secret_ module parameter**

modparam("mid\_registrar", "disable\_gruu", 0)

  

### 1.5.25.�`gruu_secret` (string)

The string that will be used in XORing when generating temporary GRUUs.

Default value is **"0p3nS1pS"**

**Example�1.25.�Setting the _gruu\_secret_ module parameter**

modparam("mid\_registrar", "gruu\_secret", "my\_secret")

  

### 1.5.26.�`pn_enable` (boolean)

Enable SIP Push Notification support ([_RFC 8599_](https://tools.ietf.org/html/rfc8599)). If enabled, Contact header field URIs which include all [pn\_ct\_match\_params](#param_pn_ct_match_params "1.5.28.�pn_ct_match_params (string)") will be matched against existing bindings using only these parameters. Otherwise, the module will attempt to match them as usual, using the current usrloc [matching\_mode](usrloc#param_matching_mode).

_Default value is **false**._

**Example�1.26.�Setting the `pn_enable` parameter**

...
modparam("mid\_registrar", "pn\_enable", true)
...

  

### 1.5.27.�`pn_providers` (string)

A list of supported Push Notification providers. While only three possible values are defined by RFC 8599 ("apns", "fcm" and "webpush"), non-standard values may be specified as well.

_Default value is **NULL** (not set)._

**Example�1.27.�Setting the `pn_providers` parameter**

...
modparam("mid\_registrar", "pn\_providers", "apns, fcm, webpush")
...

  

### 1.5.28.�`pn_ct_match_params` (string)

The minimally required list of RFC 8599 parameters (custom ones are accepted as well) which must be present in a Contact URI and identically match an existing binding in order for the binding to be refreshed during a SIP re-REGISTER. If at least one such parameter is missing from a Contact header field URI, the module will fall back to performing regular contact matching.

Note that if all above PN Contact URI parameters match an existing binding, the match is considered to be successful regardless if other parts of the SIP URI do not match (e.g. hostname, port, other URI parameters, etc.).

After calling _mid\_registrar\_lookup()_ or [pn\_process\_purr()](#afunc_pn_process_purr "1.7.1.� pn_process_purr(domain)"), the above PN-related parameters will be automatically stripped from the resulting Request and Contact URI event parameter, respectively.

_Default value is **"pn-provider, pn-prid, pn-param"**._

**Example�1.28.�Setting the `pn_ct_match_params` parameter**

...
modparam("mid\_registrar", "pn\_ct\_match\_params", "pn-provider, pn-prid")
...

  

### 1.5.29.�`pn_pnsreg_interval` (integer)

For devices capable of waking up and refreshing their binding on their own (signified by the _";+sip.pnsreg"_ Contact header field parameter), this setting denotes the prior-to-expiration interval advertised by the server at which the device should issue its binding refresh request.

_Default value is **130** (seconds before expiry)._

**Example�1.29.�Setting the `pn_pnsreg_interval` parameter**

...
modparam("mid\_registrar", "pn\_pnsreg\_interval", 140)
...

  

### 1.5.30.�`pn_trigger_interval` (integer)

If a binding refresh REGISTER request from a given SIP endpoint does not arrive within at least [pn\_trigger\_interval](#param_pn_trigger_interval "1.5.30.�pn_trigger_interval (integer)") seconds prior to expiration (e.g. because the device does not support _";+sip.pnsreg"_ or because of other error conditions), the [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) usrloc event will be triggered.

Once [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) is triggered, the script writer should use the RFC 8599 parameters from the Contact URI in order to generate a Push Notification request to the PN provider of the device, in order to cause the device to wake up and re-register.

_Default value is **120** (seconds before expiry)._

**Example�1.30.�Setting the `pn_trigger_interval` parameter**

...
modparam("mid\_registrar", "pn\_trigger\_interval", 130)
...

  

### 1.5.31.�`pn_skip_pn_interval` (integer)

Following a successful (re)registration of a contact, this setting denotes a time interval, in seconds, during which the contact is assumed to be reachable, so any Push Notifications will be skipped.

_Default value is **0** seconds (always generate Push Notifications)._

**Example�1.31.�Setting the `pn_skip_pn_interval` parameter**

...
modparam("mid\_registrar", "pn\_skip\_pn\_interval", 10)
...

  

### 1.5.32.�`pn_refresh_timeout` (integer)

This timeout starts counting following a _mid\_registrar\_lookup()_ or a [pn\_process\_purr()](#afunc_pn_process_purr "1.7.1.� pn_process_purr(domain)") which triggers a Push Notification. The value represents the maximum allowed sum of the duration required for the Push Notification to be sent and the duration required for the corresponding re-registration from the device to arrive.

Once this timeout is exceeded for an initial or a mid-dialog request, any further re-registrations which match the pending Push Notification will no longer cause the desired effects. For example:

*   pending initial INVITE transactions will complete and will no longer auto-fork an additional branch for each REGISTER sent by the callee side
    
*   pending BYE messages will time out and OpenSIPS will attempt to route them despite not having received a confirmation that the target device is actually reachable
    

_Default value is **6** seconds._

**Example�1.32.�Setting the `pn_refresh_timeout` parameter**

...
modparam("mid\_registrar", "pn\_refresh\_timeout", 10)
...

  

### 1.5.33.�`pn_enable_purr` (boolean)

Enable the SIP Push Notification mechanism for long-lived dialogs. If enabled, the mid\_registrar will include a _"+sip.pnspurr"_ Feature-Caps header field tag in 200 OK replies to REGISTER requests. This tag represents a unique identifier for the registration (PURR - Proxy Unique Registration Reference).

During dialog setup, each UA may include, in its Contact header, the PURR value returned by OpenSIPS during registration. By including the PURR (e.g. ";pn-purr=XXX"), an agent indicates that it expects to be first awoken by a PN before being able to receive a mid-dialog request sent by the other party.

When enabling this parameter, make sure to also add logic for [pn\_process\_purr()](#afunc_pn_process_purr "1.7.1.� pn_process_purr(domain)").

_Default value is **false**._

**Example�1.33.�Setting the `pn_enable_purr` parameter**

...
modparam("mid\_registrar", "pn\_enable\_purr", true)
...