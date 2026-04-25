# nathelper Module

---

**List of Tables**

3.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5874560)

3.2. [Most recently active contributors(1) to this module](#idp5994784)

**List of Examples**

1.1. [Set `natping_interval` parameter](#idp5514944)

1.2. [Set `ping_nated_only` parameter](#idp5519840)

1.3. [Set `natping_partitions` parameter](#idp5524864)

1.4. [Set `natping_socket` parameter](#idp5529376)

1.5. [Set `received_avp` parameter](#idp5550384)

1.6. [Set `force_socket` parameter](#idp5555600)

1.7. [Set `sipping_bflag` parameter](#idp5560288)

1.8. [Set `remove_on_timeout_bflag` parameter](#idp5565392)

1.9. [Set `sipping_latency_flag` parameter](#idp5570096)

1.10. [Set `sipping_ignore_rpl_codes` parameter](#idp5575104)

1.11. [Set `sipping_from` parameter](#idp5580288)

1.12. [Set `sipping_method` parameter](#idp5585328)

1.13. [Set `nortpproxy_str` parameter](#idp5591424)

1.14. [Set `natping_tcp` parameter](#idp5596064)

1.15. [Set `oldip_skip` parameter](#idp5600736)

1.16. [Set `ping_threshold` parameter](#idp5606144)

1.17. [Set `max_pings_lost` parameter](#idp5610688)

1.18. [Set `cluster_id` parameter](#idp305504)

1.19. [Set `cluster_sharing_tag` parameter](#idp5632960)

1.20. [`fix_nated_contact` usage](#idp5641936)

1.21. [`fix_nated_sdp` usage](#idp5660752)

1.22. [`add_rcv_paramer` usage](#idp5667856)

1.23. [`fix_nated_register` usage](#idp5673952)

1.24. [`nat_uac_test` usage](#idp5693168)

1.25. [`nh_enable_ping` usage](#idp5700352)

## Chapter�1.�Admin Guide

## 1.1.�Overview

This is a module to help with NAT traversal. In particular, it helps symmetric UAs that don't advertise they are symmetric and are not able to determine their public address. fix\_nated\_contact rewrites Contact header field with request's source address:port pair. fix\_nated\_sdp adds the active direction indication to SDP (flag 0x01) and updates source IP address too (flag 0x02).

Since version 2.2, stateful ping(only SIP Pings) for nathelper is available. This allows you to remove contacts from usrloc location table when _max\_pings\_lost_ pings are not responded to, each ping having a response timeout of _ping\_threshold_ seconds. In order to have this functionality, contacts must have _remove\_on\_timeout\_bflag_ flag set when inserted into the location table.

Works with multipart messages that contain an SDP part, but not with multi-layered multipart messages.

## 1.2.�NAT pinging types

Currently, the nathelper module supports two types of NAT pings:

*   _UDP package_ - 4 bytes (zero filled) UDP packages are sent to the contact address.
    
    *   _Advantages:_ low bandwitdh traffic, easy to generate by OpenSIPS;
        
    *   _Disadvantages:_ unidirectional traffic through NAT (inbound - from outside to inside); As many NATs do update the bind timeout only on outbound traffic, the bind may expire and closed.
        
    
*   _SIP request_ - a stateless SIP request is sent to the contact address.
    
    *   _Advantages:_ bidirectional traffic through NAT, since each PING request from OpenSIPS (inbound traffic) will force the SIP client to generate a SIP reply (outbound traffic) - the NAT bind will be surely kept open. Since version 2.2, one can also choose to remove contacts from the location table if a certain threshold is detected.
        
    *   _Disadvantages:_ higher bandwitdh traffic, more expensive (as time) to generate by OpenSIPS;
        
    

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _usrloc_ module - only if the NATed contacts are to be pinged.
    
*   _clusterer_ - only if "cluster\_id" option is enabled.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Parameters

### 1.4.1.�`natping_interval` (integer)

Period of time in seconds between sending the NAT pings to all currently registered UAs to keep their NAT bindings alive. Value of 0 disables this functionality.

### Note

Enabling the NAT pinging functionality will force the module to bind itself to USRLOC module.

_Default value is 0._

**Example�1.1.�Set `natping_interval` parameter**

...
modparam("nathelper", "natping\_interval", 10)
...

  

### 1.4.2.�`ping_nated_only` (integer)

If this variable is set then only contacts that have “behind\_NAT” flag in user location database set will get ping.

_Default value is 0._

**Example�1.2.�Set `ping_nated_only` parameter**

...
modparam("nathelper", "ping\_nated\_only", 1)
...

  

### 1.4.3.�`natping_partitions` (integer)

How many partitions/chunks to be used for sending the pingings. One partition means sending all pingings together. Two partitions means to send half pings and second half at a time.

_Default value is 1._ _Maximum allowed value is 8._

**Example�1.3.�Set `natping_partitions` parameter**

...
modparam("nathelper", "natping\_partitions", 4)
...

  

### 1.4.4.�`natping_socket` (string)

Spoof the natping's source-ip to this address. Works only for IPv4.

_Default value is NULL._

**Example�1.4.�Set `natping_socket` parameter**

...
modparam("nathelper", "natping\_socket", "192.168.1.1:5006")
...

  

### 1.4.5.�`received_avp` (str)

The name of the Attribute-Value-Pair (AVP) used to store the URI containing the received IP, port and protocol. The URI is created by the [fix\_nated\_register()](#func_fix_nated_register "1.5.4.� fix_nated_register()") function and this data may then be also picked up by the registrar module, which will attach a "Received=" attribute to the registration. Do not forget to change the value of corresponding parameter in the [registrar](registrar) module whenever you change the value of this parameter.

### Note

You must set this parameter if you use [fix\_nated\_register()](#func_fix_nated_register "1.5.4.� fix_nated_register()"). Additionally, if you are using registrar, you must also set its symmetric [received\_avp](registrar#received_avp) module parameter to the **same value**.

_Default value is "NULL" (disabled)._

**Example�1.5.�Set `received_avp` parameter**

...
modparam("nathelper", "received\_avp", "$avp(received)")
...

  

### 1.4.6.�`force_socket` (string)

Sending socket to be used for pinging contacts without local socket information (the local socket information may be lost during a restart or contact replication). If no one specified, OpenSIPS will choose the first listening interface matching the destination protocol and AF family.

_Default value is “NULL”._

**Example�1.6.�Set `force_socket` parameter**

...
modparam("nathelper", "force\_socket", "localhost:33333")
...

  

### 1.4.7.�`sipping_bflag` (string)

What branch flag should be used by the module to identify NATed contacts for which it should perform NAT ping via a SIP request instead if dummy UDP package.

_Default value is NULL (disabled)._

**Example�1.7.�Set `sipping_bflag` parameter**

...
modparam("nathelper", "sipping\_bflag", "SIPPING\_ENABLE")
...

  

### 1.4.8.�`remove_on_timeout_bflag` (string)

What branch flag to be used in order to activate usrloc contact removal when the [ping\_threshold](#param_ping_threshold "1.4.16.�ping_threshold (int)") is exceeded.

_Default value is NULL (disabled)._

**Example�1.8.�Set `remove_on_timeout_bflag` parameter**

...
modparam("nathelper", "remove\_on\_timeout\_bflag", "SIPPING\_RTO")
...

  

### 1.4.9.�`sipping_latency_flag` (string)

The branch flag which will be used in order to enable contact pinging latency computation and reporting via the usrloc E\_UL\_LATENCY\_UPDATE event.

_Default value is NULL (disabled)._

**Example�1.9.�Set `sipping_latency_flag` parameter**

...
modparam("nathelper", "sipping\_latency\_flag", "SIPPING\_CALC\_LATENCY")
...

  

### 1.4.10.�`sipping_ignore_rpl_codes` (CSV string)

A comma-separated list of SIP reply status codes to contact pings which are to be discarded. This may be useful for "full-sharing" user location topologies, where the location nodes are not directly facing the UAs, hence the intermediary SIP component may generate replies to offline contact ping attempts (e.g. 408 - Request Timeout) -- such ping replies should be ignored.

_Default value is "NULL" (all reply status codes are accepted)._

**Example�1.10.�Set `sipping_ignore_rpl_codes` parameter**

...
modparam("nathelper", "sipping\_ignore\_rpl\_codes", "408, 480, 404")
...

  

### 1.4.11.�`sipping_from` (string)

The parameter sets the SIP URI to be used in generating the SIP requests for NAT ping purposes. To enable the SIP request pinging feature, you have to set this parameter. The SIP request pinging will be used only for requests marked so.

_Default value is “NULL”._

**Example�1.11.�Set `sipping_from` parameter**

...
modparam("nathelper", "sipping\_from", "sip:pinger@siphub.net")
...

  

### 1.4.12.�`sipping_method` (string)

The parameter sets the SIP method to be used in generating the SIP requests for NAT ping purposes.

_Default value is “OPTIONS”._

**Example�1.12.�Set `sipping_method` parameter**

...
modparam("nathelper", "sipping\_method", "INFO")
...

  

### 1.4.13.�`nortpproxy_str` (string)

The parameter sets the SDP attribute used by nathelper to mark the packet SDP informations have already been mangled.

If empty string, no marker will be added or checked.

### Note

The string must be a complete SDP line, including the EOH (\\r\\n).

_Default value is “a=nortpproxy:yes\\r\\n”._

**Example�1.13.�Set `nortpproxy_str` parameter**

...
modparam("nathelper", "nortpproxy\_str", "a=sdpmangled:yes\\r\\n")
...

  

### 1.4.14.�`natping_tcp` (integer)

If the flag is set, TCP/TLS clients will also be pinged with SIP OPTIONS messages.

_Default value is 0 (not set)._

**Example�1.14.�Set `natping_tcp` parameter**

...
modparam("nathelper", "natping\_tcp", 1)
...

  

### 1.4.15.�`oldip_skip` (string)

Parameter which specifies whether old media ip and old origin ip shall be put in the sdp body. The parameter has two values : 'o' ("a=oldoip" field shall be skipped) and 'c' ("a=oldcip" field shall be skipped).

_Default value is 0 (not set)._

**Example�1.15.�Set `oldip_skip` parameter**

...
modparam("nathelper", "oldip\_skip", "oc")
...

  

### 1.4.16.�`ping_threshold` (int)

If a contact does not respond in _ping\_threshold_ seconds since the ping has been sent, the contact shall be removed after [max\_pings\_lost](#param_max_pings_lost "1.4.17.�max_pings_lost (int)") unresponded pings.

_Default value is 3 (seconds)._

**Example�1.16.�Set `ping_threshold` parameter**

...
modparam("nathelper", "ping\_threshold", 10)
...

  

### 1.4.17.�`max_pings_lost` (int)

Number of unresponded pings after which the contact shall be removed from the location table.

_Default value is 3 (pings)._

**Example�1.17.�Set `max_pings_lost` parameter**

...
modparam("nathelper", "max\_pings\_lost", 5)
...

  

### 1.4.18.�`cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used by the nathelper module for controlling the pinging process. When part of a cluster of multiple nodes, the nodes can agree upon which node is the one responsible for pinging.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to the contacts. See the [cluster\_sharing\_tag](#param_cluster_sharing_tag "1.4.19.�cluster_sharing_tag (string)") option.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the "clusterer" module.

_Default value is “0 (none)”._

**Example�1.18.�Set `cluster_id` parameter**

...
# Be part of cluster ID 9
modparam("nathelper", "cluster\_id", 9)
...

  

### 1.4.19.�`cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform pinging of the contacts. If defined, only the node with active status of this tag will perform the pinging.

The [cluster\_id](#param_cluster_id "1.4.18.�cluster_id (integer)") must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will individually do the pinging.

_Default value is “empty (none)”._

**Example�1.19.�Set `cluster_sharing_tag` parameter**

...
# only the node with the active "vip" sharing tag will perform pinging
modparam("nathelper", "cluster\_id", 9)
modparam("nathelper", "cluster\_sharing\_tag", "vip")
...

  

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

  

## 1.6.�Exported MI Functions

### 1.6.1.�`nh_enable_ping`

Gets or sets the natpinging status.

Parameters:

*   _status_ (optional) - if not provided the function returns the current natping status. Otherwise, enables natping if parameter value greater than 0 or disables natping if parameter value is 0.
    

**Example�1.25.�`nh_enable_ping` usage**

...
$ opensips-cli -x mi nh\_enable\_ping
Status:: 1
$
$ opensips-cli -x mi nh\_enable\_ping 0
$
$ opensips-cli -x mi nh\_enable\_ping
Status:: 0
$
...
			

  

## Chapter�2.�Frequently Asked Questions

**2.1.**

Where can I find more about OpenSIPS?

Take a look at [https://opensips.org/](https://opensips.org/).

**2.2.**

Where can I post a question about this module?

First at all check if your question was already answered on one of our mailing lists:

*   User Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/users](http://lists.opensips.org/cgi-bin/mailman/listinfo/users)
    
*   Developer Mailing List - [http://lists.opensips.org/cgi-bin/mailman/listinfo/devel](http://lists.opensips.org/cgi-bin/mailman/listinfo/devel)
    

E-mails regarding any stable OpenSIPS release should be sent to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>` and e-mails regarding development versions should be sent to `<[devel@lists.opensips.org](mailto:devel@lists.opensips.org)>`.

If you want to keep the mail private, send it to `<[users@lists.opensips.org](mailto:users@lists.opensips.org)>`.

**2.3.**

How can I report a bug?

Please follow the guidelines provided at: [https://github.com/OpenSIPS/opensips/issues](https://github.com/OpenSIPS/opensips/issues).

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

156

123

2050

873

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

155

45

3556

4790

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

50

40

452

324

4.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

40

15

1598

627

5.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

33

27

158

240

6.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

22

17

142

124

7.

Anca Vamanu

22

4

1602

185

8.

Andrei Pelinescu-Onciul

21

17

121

110

9.

Jan Janak ([@janakj](https://github.com/janakj))

21

11

780

129

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

19

11

261

268

  

**All remaining contributors**: Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Ancuta Onofrei, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Andrei Dragus, Henning Westerholt ([@henningw](https://github.com/henningw)), Dan Pascu ([@danpascu](https://github.com/danpascu)), Christophe Sollet ([@csollet](https://github.com/csollet)), Marcus Hunger, Klaus Darilion, Sergio Gutierrez, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Nils Ohlmeier, Emmanuel Buu, Carsten Bock, Shlomi Gutman, Jeremie Le Hen, Bayan Towfiq, Laurent Schweizer, Jasper Hafkenscheid ([@hafkensite](https://github.com/hafkensite)), Konstantin Bokarius, Alexandra Titoc, John Riordan, Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Elena-Ramona Modroiu, Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Edson Gellert Schubert.

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

Jan 2013 - Nov 2024

2.

Alexandra Titoc

Sep 2024 - Sep 2024

3.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Nov 2003 - Jun 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

May 2003 - Nov 2023

5.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Aug 2010 - Jul 2023

6.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2023

7.

Nick Altmann ([@nikbyte](https://github.com/nikbyte))

May 2022 - May 2022

8.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Apr 2022

9.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Dec 2010 - Jan 2021

10.

Jasper Hafkenscheid ([@hafkensite](https://github.com/hafkensite))

Mar 2020 - Mar 2020

  

**All remaining contributors**: Dan Pascu ([@danpascu](https://github.com/danpascu)), Shlomi Gutman, Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Christophe Sollet ([@csollet](https://github.com/csollet)), Anca Vamanu, John Riordan, Emmanuel Buu, Andrei Dragus, Sergio Gutierrez, Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Henning Westerholt ([@henningw](https://github.com/henningw)), Ancuta Onofrei, Marcus Hunger, Carsten Bock, Jeremie Le Hen, Laurent Schweizer, Bayan Towfiq, Andrei Pelinescu-Onciul, Elena-Ramona Modroiu, Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Jan Janak ([@janakj](https://github.com/janakj)), Nils Ohlmeier.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�4.�Documentation

## 4.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Nick Altmann ([@nikbyte](https://github.com/nikbyte)), Jasper Hafkenscheid ([@hafkensite](https://github.com/hafkensite)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ovidiu Sas ([@ovidiusas](https://github.com/ovidiusas)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Walter Doekes ([@wdoekes](https://github.com/wdoekes)), Christophe Sollet ([@csollet](https://github.com/csollet)), Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Anca Vamanu, Andrei Dragus, Sergio Gutierrez, Klaus Darilion, Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Carsten Bock, Ancuta Onofrei, Marcus Hunger, Jeremie Le Hen, Bayan Towfiq, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)).

_Documentation Copyrights:_

Copyright � 2018 [VoIP Embedded, Inc.](http://www.voipembedded.com)

Copyright � 2003-2008 Sippy Software, Inc.

Copyright � 2005 Voice Sistem SRL