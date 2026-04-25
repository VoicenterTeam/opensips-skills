# mid\_registrar Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp6545248)

2.2. [Most recently active contributors(1) to this module](#idp6643536)

**List of Examples**

1.1. [Setting the _mode_ module parameter](#idp5631424)

1.2. [Setting the _contact\_id\_insertion_ module parameter](#idp5639536)

1.3. [Setting the _contact\_id\_param_ module parameter](#idp5645152)

1.4. [Setting the _at\_escape\_str_ module parameter](#idp5652080)

1.5. [Setting the _outgoing\_expires_ module parameter](#idp5657152)

1.6. [Setting the _received\_avp_ module parameter](#idp5663344)

1.7. [Setting the _received\_param_ module parameter](#idp5669136)

1.8. [Setting the _extra\_contact\_params\_avp_ module parameter](#idp5675072)

1.9. [Set `attr_avp` parameter](#idp5682448)

1.10. [Setting the _min\_expires_ module parameter](#idp5687728)

1.11. [Setting the _default\_expires_ module parameter](#idp5692608)

1.12. [Setting the _max\_expires_ module parameter](#idp5697456)

1.13. [Setting the _default\_q_ module parameter](#idp5703728)

1.14. [Setting the _tcp\_persistent\_flag_ module parameter](#idp5709424)

1.15. [Setting the _realm\_prefix_ module parameter](#idp5716864)

1.16. [Setting the _case\_sensitive_ module parameter](#idp5722400)

1.17. [Setting the `expires_max_deviation` parameter](#idp5771936)

1.18. [Set `max_contacts` parameter](#idp5777632)

1.19. [Setting the _max\_username\_len_ module parameter](#idp5782784)

1.20. [Setting the _max\_domain\_len_ module parameter](#idp5787936)

1.21. [Setting the _max\_aor\_len_ module parameter](#idp5793072)

1.22. [Setting the _max\_contact\_len_ module parameter](#idp5798208)

1.23. [Setting the _retry\_after_ module parameter](#idp5800880)

1.24. [Setting the _gruu\_secret_ module parameter](#idp5805552)

1.25. [Setting the _gruu\_secret_ module parameter](#idp5810320)

1.26. [Setting the `pn_enable` parameter](#idp5860864)

1.27. [Setting the `pn_providers` parameter](#idp5866512)

1.28. [Setting the `pn_ct_match_params` parameter](#idp5874560)

1.29. [Setting the `pn_pnsreg_interval` parameter](#idp5880704)

1.30. [Setting the `pn_trigger_interval` parameter](#idp5889120)

1.31. [Setting the `pn_skip_pn_interval` parameter](#idp5894784)

1.32. [Setting the `pn_refresh_timeout` parameter](#idp5903888)

1.33. [Setting the `pn_enable_purr` parameter](#idp5912096)

1.34. [`_mid_registrar_save_` usage](#idp6000464)

1.35. [`_mid_registrar_lookup_` usage](#idp6115536)

1.36. [`async pn_process_purr()` usage](#idp6173296)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The _mid\_registrar_ is a mid-component of a SIP platform, designed to work between end users and the platform's main registration component. It opens up new possibilities for leveraging existing infrastructure in order to continue to grow (as subscribers and as registration traffic) while keeping an existing low-resources registrar server.

Acting as a registration front-end to the main SIP registrar, the mid-registrar is able to:

*   convert incoming high-rate registration traffic into a low-rate variant, towards the main registrar layer. With proper configuration, it can absorb over 90% of existing registration traffic while correctly managing the back-end's user location state, effectively reducing resource usage at the respective layer.
    
*   stay synchronized with the main registrar (from a user location perspective), by properly accepting the contact states and expirations it decides.
    

### 1.1.1.�Path Support (RFC 3327)

The mid\_registrar module includes SIP Path header field support according to [RFC 3327](https://tools.ietf.org/html/rfc3327), for usage in registrars and home-proxies.

A call to _mid\_registrar\_save()_ stores, if path support is enabled in the mid\_registrar module, the values of the Path Header(s) along with the Contact information into usrloc. There are three modes for building the reply to a REGISTER message which includes one or more Path header fields:

*   _off_ - stores the value of the Path headers into usrloc without passing it back to the UAC in the reply.
    
*   _lazy_ - stores the Path header and passes it back to the UAC if Path-support is indicated by the “path” param in the Supported HF.
    
*   _strict_ - rejects the registration with “420 Bad Extension” if there's a Path header but no support for it is indicated by the UAC. Otherwise it's stored and passed back to the UAC.
    

A call to _mid\_registrar\_lookup()_ always uses the Path header if found, and inserts it as Route HF either in front of the first Route HF, or after the last Via HF if no Route is present. It also sets the destination URI to the first Path URI, thus overwriting the received-URI, because NAT has to be handled at the outbound-proxy of the UAC (the first hop after client's NAT).

The whole process is transparent to the user, so no config changes are required besides enabling one of the "p0" / "p1" / "p2" flags when calling _mid\_registrar\_save()_.

### 1.1.2.�GRUU Support (RFC 5627)

The mid\_registrar module includes support for Globally Routable User Agent URIs according to [RFC 5627](https://tools.ietf.org/html/rfc5627).

A call to _mid\_registrar\_save()_ stores, if the phone supports GRUU, the values of the SIP Instance along with the contact into usrloc. The module will generate two types of GRUUs:

*   _public_ - exposes the underlying AOR, constructed just by attaching the SIP Instance as the ;gr parameter value. These are persistent, valid as long as the contact registration is valid.
    
*   _temporary_ - hides the underlying AOR Each new Register request leads to the construction of a new temporary GRUU, while Register requests with a different Call-ID lead to the invalidation of all the previous generated temporary GRUUs.
    

A call to _mid\_registrar\_lookup()_ will try to detect if the R-URI contains a GRUU. If it does, it will route the request just for the Contact that the specific AOR belongs to, without appending any other branches.

Even if the the GRUU handling during the registration process is transparent to the user, so no config changes are required, you need to take care of the GRUU specifics when handling mid-dialog requests.

As the GRUU will be present in the contact header of the initial requests generated byt GRUU enabled devices, you will have to also do a lookup() when receiving a mid-dialog request with the GRUU indication in the RURI.

### 1.1.3.�SIP Push Notification Support (RFC 8599)

The mid\_registrar module includes support for standards-based SIP Push Notifications, per [RFC 8599](https://tools.ietf.org/html/rfc8599). Support for the basic version of the draft can be enabled by switching [pn\_enable](#param_pn_enable "1.5.26.�pn_enable (boolean)") to _true_. The module also includes optional support for sending Push Notifications during long-lived dialogs ([see RFC section 6](https://tools.ietf.org/html/rfc8599#page-23)), through the [pn\_enable\_purr](#param_pn_enable_purr "1.5.33.�pn_enable_purr (boolean)") switch.

Essential mechanics behind the Push Notification (PN) support:

*   the PN support is fully compatible with the existing logic and enabling it does not impose any limitations, as the mid\_registrar can simultaneously handle both SIP PN compliant and standard SIP User Agents
    
*   OpenSIPS will raise a [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) event any time a Push Notification needs to be sent to a PN-enabled contact. The event includes the PN coordinates of the contact -- they may be found in the Contact URI ('uri' event parameter) and may be extracted using the {uri.param,name} transformation. From here onwards, it is up to the script developer to trigger the Push Notification (e.g. possibly by sending an HTTP POST with the [rest\_client](rest_client) module), thus forcing a re-registration from the device.
    
*   REGISTER processing is unchanged -- PN-enabled UAs are saved just as regular UAs, with the former ones additionally having the _4_ bitflag set in the "Flags" field of any MI listing of contacts, for differentiation purposes
    
*   initial INVITE processing is barely changed, with the _mid\_registrar\_lookup()_ function now additionally returning a value of **2** if the only found contacts were PN-enabled contacts, all which required a Push Notification. This means that PNs have been triggered for each of them and t\_relay() is not required, since they are not reachable until they re-register!
    
    Using the event\_routing module, OpenSIPS will transparently fork a new branch from the current INVITE on each re-registration from these contacts within the accepted [pn\_refresh\_timeout](#param_pn_refresh_timeout "1.5.32.�pn_refresh_timeout (integer)")
    
*   mid-dialog requests: In some cases (e.g. long-lived dialogs), a PN may be required before being able to route a mid-dialog request to a SIP UA. The [pn\_process\_purr()](#afunc_pn_process_purr "1.7.1.� pn_process_purr(domain)") async function will take care of triggering the PN event and resuming the script as soon as a re-registration from the concerned contact is received.
    

For more information or examples, refer to the documentation of the "pn\_xxx" module parameters or the OpenSIPS blog posts around the "SIP Push Notification" topic.

## 1.2.�Working modes

The mid\_registrar may function in one of several modes:

### 1.2.1.�Contact mirroring (default)

In "contact mirroring" mode, the mid-registrar will only insert itself in the SIP traffic flow between end user and main registrar by altering the Contact header field values. See section [Section�1.3, “Auto-Insertion Into Future SIP Flows”](#sip-flow-insertion "1.3.�Auto-Insertion Into Future SIP Flows") for a detailed description of possible Contact-based insertion modes. The incoming REGISTER requests will be proxied further to the main registrar; the registered contact will be stored in the mid-registrar only on 2xx replies, according to the information returned by the main registrar.

A possible usage of this mode, for example, would be to clone registrations on a SIP front-end that extends the main platform with new services (like adding IM/messaging routing).

### 1.2.2.�Contact throttling

In "contact throttling" mode, the mid-registrar can significantly reduce the registration rate on the main registrar side (between mid-registrar and main registrar), while coping with a high registration rate on the end-user side (between end-user and mid-registrar). This is useful in scenarios were the end-users are very dynamic and short-lived (e.g. mobile devices), but the main registrar cannot cope with large amounts of registration traffic.

Traffic conversion is done in a _"per-device"_ manner, according to each unique SIP Contact header field value. It is achieved by increasing the "expires" parameter value of each contact, when relaying registrations to the main registrar. Once such a registration is completed, subsequent registrations for the same SIP Contact header field value will be continuously absorbed by the mid-registrar until, eventually, the lifetime of the remote registration will have decreased enough that a refresh (i.e. simply forwarding the next REGISTER request) is mandatory.

A common occurence is for some SIP User Agents to lose their network connection (especially when dealing with mobile devices), hence they do not properly de-register from the mid-registrar. In this case, in order to avoid stale registrations on the main registrar (which contains SIP contacts with greatly extended lifetimes!), the mid-registrar will appropriately generate De-REGISTER requests and remove these contacts from the main registrar's location service as soon as it considers them to have expired.

The main practical use for this mode is registration traffic conversion. By minimizing the strain of processing registrations on the main registrar, we allow it to dedicate more system resources to critical areas of the platform, such as advanced SIP calling features and/or media handling.

### 1.2.3.�AOR throttling

In "AOR throttling" mode, the mid-registrar helps with handling multiple registrations per user/AOR. This is done by aggregating all the end-user registered contacts from a single AOR under a single registration into the main registrar. This can dramatically reduce the incoming rate of registrations (to a single registration per AOR), but also helps in dealing with registrar servers which are not able to implement parallel forking/ringing.

Traffic conversion is done in a _"per-user"_ manner, according to each unique SIP AOR. It is achieved by providing a contact with a large "expires" parameter value, when relaying registrations to the main registrar. Once such a registration is completed, subsequent registrations to the same Address-of-record will be continuously absorbed by the mid-registrar until, eventually, the lifetime of the remote registration will have decreased enough that a refresh (i.e. simply forwarding the next REGISTER request) is mandatory.

A common occurence is for some SIP User Agents to lose their network connection (especially when dealing with mobile devices), hence they do not properly de-register from the mid-registrar. In this case, in order to avoid stale registrations on the main registrar (which contains SIP AORs with greatly extended lifetimes!), the mid-registrar will appropriately generate De-REGISTER requests and remove these contacts from the main registrar's location service as soon as it considers them to have expired.

Of all three modes, "AOR throttling" potentially offers the best reduction in traffic on the way to the main registrar. By aggregating contacts, it also has the added benefit of reducing the number of contacts that the main registrar must handle.

Regarding SIP request mangling in this mode, the module will always replace all Contact header field values with a single Contact header field value when proxying registrations to the main registrar, indicating that the AOR is local to the front-end, and its contacts can be found there.

The main practical uses for this mode are registration traffic conversion towards the main registrar, as well as taking over its call forking duties. By minimizing the strain of processing registrations / forking calls on the main registrar, we allow it to dedicate more system resources to critical areas of the platform, such as advanced SIP calling features and/or media handling.

## 1.3.�Auto-Insertion Into Future SIP Flows

A defining feature of the mid-registrar is that it must be easy to integrate, ideally a "plug-and-play" SIP component. It should not impose any "outbound-proxy" configurations on any of the platform's layers and automatically insert itself on the call flows which follow successful registrations.

Regardless of its configured working [mode](#param_mode "1.5.1.�mode (integer)"), the mid-registrar will mangle the Contact header field URIs of all forwarded REGISTER requests and replace the original "hostname" and "port" parts of a Contact URI with one of its listening interfaces.

Additionally, in modes "0" and "1", each Contact will be assigned an unique identifier, which will be utilized in future contact-based lookup operations. This information will be included in each forwarded Contact URI. The [contact\_id\_insertion](#param_contact_id_insertion "1.5.2.�contact_id_insertion (integer)") modparam controls how this information is included.

## 1.4.�Dependencies

### 1.4.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _usrloc_
    
*   _signaling_
    
*   _tm_
    
*   _event\_routing_, if [pn\_enable](#param_pn_enable "1.5.26.�pn_enable (boolean)") is set to _true_.
    

### 1.4.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_
    

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

  

## 1.7.�Exported Asynchronous Functions

### 1.7.1.� `pn_process_purr(domain)`

Perform mid-dialog request processing, according to RFC 8599. For such requests, search the R-URI and topmost Route header field URI for a _";pn-purr"_ parameter value that both matches the OpenSIPS PURR format and corresponds to an usrloc registration. Once a usrloc contact is located, trigger an [E\_UL\_CONTACT\_REFRESH](usrloc#event_E_UL_CONTACT_REFRESH) event and place the request on async hold for at most [pn\_refresh\_timeout](#param_pn_refresh_timeout "1.5.32.�pn_refresh_timeout (integer)") seconds, until a matching REGISTER request arrives.

If processing ends before triggering the Push Notification, the request will no longer be put on async hold, with the resume route being immediately called.

Meaning of the parameters is as follows:

*   _domain (static string)_ - Logical domain within registrar. If a database is used, then this must be name of the table which stores the contacts.
    

**Return Codes**

*   **1** - Success, PN was launched.
    
*   **2** - Success, but PN was not launched (due to missing PURR, foreign PURR or offline contact)
    
*   **\-1** - Internal Error
    

**Example�1.36.�`async pn_process_purr()` usage**

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

  

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

507

203

16332

10230

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

14

7

127

248

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

10

7

103

111

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

9

7

23

18

5.

Chad Attermann ([@attermann](https://github.com/attermann))

7

5

19

5

6.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

14

14

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

4

2

4

4

8.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

3

1

2

5

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

10.

Italo Rossi ([@italorossi](https://github.com/italorossi))

2

1

6

0

  

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Jul 2016 - May 2024

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Oct 2020 - Nov 2023

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - May 2023

4.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Mar 2017 - Jan 2023

5.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Apr 2017 - Feb 2022

6.

Alexey Vasilyev ([@vasilevalex](https://github.com/vasilevalex))

Jan 2022 - Jan 2022

7.

Dan Pascu ([@danpascu](https://github.com/danpascu))

May 2019 - May 2019

8.

Italo Rossi ([@italorossi](https://github.com/italorossi))

Jul 2018 - Jul 2018

9.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

10.

Chad Attermann ([@attermann](https://github.com/attermann))

Jun 2017 - Jul 2017

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)).

_Documentation Copyrights:_

Copyright � 2016-2020 [OpenSIPS Solutions](http://opensips-solutions.com)