# Domain Policy Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5753888)

2.2. [Most recently active contributors(1) to this module](#idp5853264)

**List of Examples**

1.1. [Setting db\_url parameter](#idp3698576)

1.2. [Setting dp\_table parameter](#idp257728)

1.3. [Setting dp\_col\_rule parameter](#idp246928)

1.4. [Setting dp\_col\_rule parameter](#idp163504)

1.5. [Setting dp\_col\_att parameter](#idp168048)

1.6. [Setting dp\_col\_val parameter](#idp172496)

1.7. [Setting port\_override\_avp parameter](#idp5571360)

1.8. [Setting transport\_override\_avp parameter](#idp5575504)

1.9. [Setting domain\_replacement\_avp parameter](#idp5579664)

1.10. [Setting domain\_prefix\_avp parameter](#idp5583824)

1.11. [Setting domain\_suffix\_avp parameter](#idp5587968)

1.12. [Setting send\_socket\_avp parameter](#idp5592448)

1.13. [dp\_can\_connect usage](#idp5608016)

1.14. [dp\_apply\_policy usage](#idp5629408)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The Domain Policy module implements draft-lendl-domain-policy-ddds-02 in combination with draft-lendl-speermint-federations-02 and draft-lendl-speermint-technical-policy-00. These drafts define DNS records with which a domain can announce its federation memberships. A local database can be used to map policy rules to routing policy decisions. This database can also contain rules concerning destination domains independently of draft-lendl-domain-policy-ddds-02.

This module requires a database. No caching is implemented.

## 1.2.�Dependencies

The module depends on the following modules (in the other words the listed modules must be loaded before this module):

*   _database_ -- Any database module
    

## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

This is URL of the database to be used.

Default value is “mysql://opensipsro:opensipsro@localhost/opensips”

**Example�1.1.�Setting db\_url parameter**

modparam("domainpolicy", "db\_url", "postgresql://user:pass@db\_host/opensips")

  

### 1.3.2.�`dp_table` (string)

Name of table containing the local support domain policy setup.

Default value is “domainpolicy”.

**Example�1.2.�Setting dp\_table parameter**

modparam("domainpolicy", "dp\_table", "supportedpolicies")

  

### 1.3.3.�`dp_col_rule` (string)

Name of column containing the domain policy rule name which is equal to the URI as published in the domain policy NAPTRs.

Default value is “rule”.

**Example�1.3.�Setting dp\_col\_rule parameter**

modparam("domainpolicy", "dp\_col\_rule", "rules")

  

### 1.3.4.�`dp_col_type` (string)

Name of column containing the domain policy rule type. In the case of federation names, this is "fed". For standard referrals according to draft-lendl-speermint-technical-policy-00, this is "std". For direct domain lookups, this is "dom".

Default value is “type”.

**Example�1.4.�Setting dp\_col\_rule parameter**

modparam("domainpolicy", "dp\_col\_type", "type")

  

### 1.3.5.�`dp_col_att` (string)

Name of column containing the AVP's name. If the rule stored in this row triggers, than dp\_can\_connect() will add an AVP with that name.

Default value is “att”.

**Example�1.5.�Setting dp\_col\_att parameter**

modparam("domainpolicy", "dp\_col\_att", "attribute")

  

### 1.3.6.�`dp_col_val` (string)

Name of column containing the value for AVPs created by dp\_can\_connect().

Default value is “val”.

**Example�1.6.�Setting dp\_col\_val parameter**

modparam("domainpolicy", "dp\_col\_val", "values")

  

### 1.3.7.�`port_override_avp` (string)

This parameter defines the name of the AVP where dp\_apply\_policy() will look for an override port number.

Default value is “portoverride”.

**Example�1.7.�Setting port\_override\_avp parameter**

\# string named AVP
modparam("domainpolicy", "port\_override\_avp", "portoverride")

  

### 1.3.8.�`transport_override_avp` (string)

Name of the AVP which contains the override transport setting.

Default value is “transportoverride”.

**Example�1.8.�Setting transport\_override\_avp parameter**

\# string named AVP
modparam("domainpolicy", "transport\_override\_avp", "transportoverride")

  

### 1.3.9.�`domain_replacement_avp` (string)

Name of the AVP which contains a domain replacement.

Default value is “domainreplacement”.

**Example�1.9.�Setting domain\_replacement\_avp parameter**

\# string named AVP
modparam("domainpolicy", "domain\_replacement\_avp", "domainreplacement")

  

### 1.3.10.�`domain_prefix_avp` (string)

Name of the AVP which contains a domain prefix.

Default value is “domainprefix”.

**Example�1.10.�Setting domain\_prefix\_avp parameter**

\# string named AVP
modparam("domainpolicy", "domain\_prefix\_avp", "domainprefix")

  

### 1.3.11.�`domain_suffix_avp` (string)

Name of the AVP which contains a domain suffix.

Default value is “domainsuffix”.

**Example�1.11.�Setting domain\_suffix\_avp parameter**

\# string named AVP
modparam("domainpolicy", "domain\_suffix\_avp", "domainsuffix")

  

### 1.3.12.�`send_socket_avp` (string)

Name of the AVP which contains a send\_socket. The format of the send socket (the payload of this AVP) must be in the format \[proto:\]ip\_address\[:port\]. The function dp\_apply\_policy will look for this AVP and if defined, it will force the send socket to its value (smilar to the force\_send\_socket core function).

Default value is “sendsocket”.

**Example�1.12.�Setting send\_socket\_avp parameter**

\# string named AVP
modparam("domainpolicy", "send\_socket\_avp", "sendsocket")

  

## 1.4.�Exported Functions

### 1.4.1.�`dp_can_connect()`

Checks the interconnection policy of the caller. It uses the domain in the request URI to perform the DP-DDDS algorithm according to draft-lendl-domain-policy-ddds-02 to retrieve the domain's policy announcements. As of this version, only records conforming to draft-lendl-speermint-federations-02 and draft-lendl-speermint-technical-policy-00 are supported.

Non-terminal NAPTR records will cause recursion to the replacement domain. dp\_can\_connect() will thus look for policy rules in the referenced domain. Furthermore, an AVP for "domainreplacement" (containing the new domain) will be added to the call. This will redirect SRV/A record lookups to the new domain.

In order to simplify direct domain-based peerings all destination domains are treated as if they contain a top priority "D2P+SIP:dom" rule with the domain itself as the value of the rule. Thus any database row with type = 'dom' and rule = 'example.com' will override any dynamic DNS-discovered rules.

For NAPTRs with service-type "D2P+SIP:fed", the federation IDs (as extracted from the regexp field) are used to retrieve policy records from a local local database (basically: "SELECT dp\_col\_att, dp\_col\_val FROM dp\_table WHERE dp\_col\_rule = '\[federationID\]' AND type = 'fed'). If records are found (and all other records with the same order value are fulfillable) then AVPs will be created from the dp\_col\_att and dp\_col\_val columns.

For NAPTRs with service-type "D2P+SIP:std", the same procedure is performed. This time, the database lookup searched for type = 'std', though.

"D2P+SIP:fed" and "D2P+SIP:std" can be mixed freely. If two rules with the same "order" match and try to set the same AVP, then the behaviour is undefined.

The dp\_col\_att column specifies the AVP's name. If the AVP start with "s:" or "i:", the corresponding AVP type (string named or integer named) will be generated. If the excat specifier is omited, the AVP type will be guessed.

The dp\_col\_val column will always be interpreted as string. Thus, the AVP's value is always string based.

dp\_can\_connect returns:

*   _\-2_: on errors during the evaluation. (DNS, DB, ...)
    
*   _\-1_: D2P+SIP records were found, but the policy is not fullfillable.
    
*   _1_: D2P+SIP records were found and a call is possible
    
*   _2_: No D2P+SIP records were found. The destination domain does not announce a policy for incoming SIP calls.
    

This function can be used from REQUEST\_ROUTE.

**Example�1.13.�dp\_can\_connect usage**

...
dp\_can\_connect();
switch(retcode) {
	case -2:
		xlog("L\_INFO","Errors during the DP evaluation\\n");
		sl\_send\_reply(404, "We can't connect you.");
		break;
	case -1:
		xlog("L\_INFO","We can't connect to that domain\\n");
		sl\_send\_reply(404, "We can't connect you.");
		break;
	case 1:
		xlog("L\_INFO","We found matching policy records\\n");
		avp\_print();
		dp\_apply\_policy();
		t\_relay();
		break;
	case 2:
		xlog("L\_INFO","No DP records found\\n");
		t\_relay();
		break;
}
...
		

  

### 1.4.2.�`dp_apply_policy()`

This function sets the destination URI according to the policy returned from the `dp_can_connect()` function. Parameter exchange between `dp_can_connect()` and `dp_apply_policy()` is done via AVPs. The AVPs can be configured in the module's parameter section.

Note: The name of the AVPs must correspond with the names in the _att_ column in the domainpolicy table.

Setting the following AVPs in `dp_can_connect()` (or by any other means) cause the following actions in `dp_apply_policy()`:

*   _port\_override\_avp_: If this AVP is set, the port in the destination URI is set to this port. Setting an override port disables NAPTR and SRV lookups according to RFC 3263.
    
    �
    
*   _transport\_override\_avp_: If this AVP is set, the transport parameter in the destination URI is set to the specified transport ("udp", "tcp", "tls"). Setting an override transport also disables NAPTR lookups, but retains an SRV lookup according to RFC 3263.
    
    �
    
*   _domain\_replacement\_avp_: If this AVP is set, the domain in the destination URI will be replaced by this domain.
    
    A non-terminal NAPTR and thus a referral to a new domain implicitly sets _domain\_replacement\_avp_ to the new domain.
    
    �
    
*   _domain\_prefix\_avp_: If this AVP is set, the domain in the destination URI will be prefixed with this "subdomain". E.g. if the domain in the request URI is "example.com" and the domain\_prefix\_avp contains "inbound", the domain in the destinaton URI is set to "inbound.example.com".
    
    �
    
*   _domain\_suffix\_avp_: If this AVP is set, the domain in the destination URI will have the content of the AVP appended to it. E.g. if the domain in the request URI is "example.com" and the domain\_suffix\_avp contains "myroot.com", the domain in the destination URI is set to "example.com.myroot.com".
    
    �
    
*   _send\_socket\_avp_: If this AVP is set, the sending socket will be forced to the socket in the AVP. The payload format of this AVP must be \[proto:\]ip\_address\[:port\].
    

If both prefix/suffix and domain replacements are used, then the replacement is performed first and the prefix/suffix are applied to the new domain.

This function can be used from REQUEST\_ROUTE.

**Example�1.14.�dp\_apply\_policy usage**

...
if (dp\_apply\_policy()) {
	t\_relay();
}
...
		

  

## 1.5.�FIFO Commands

## 1.6.�Usage Scenarios

This section describes how this module can be use to implement selective VoIP peerings.

### 1.6.1.�TLS Based Federation

This example shows how a secure peering fabric can be configured based on TLS and Domain Policies.

Let's assume that an organization called "TLSFED.org" acts as an umbrella for VoIP providers who want to peer with each other but don't want to run open SIP proxies. TLSFED.org's secretary acts as an X.509 Certification Authority that signs the TLS keys of all member's SIP proxies. Each member should automatically allow incoming calls from other members. On the other hand, the configuration for this federation must not interfere with a member's participation in other VoIP peering fabrics. All this can be achieved by the following configuration for a participating VoIP operation called example.com:

*   _Incoming SIP configuration_
    
    Calls from other members are expected to use TLS and authenticate using a client-CERT. To implement this, we cannot share a TCP/TLS port with other incoming connection. Thus we need to use tls\_server\_domain\[\] to dedicate a TCP port for this federation.
    
    �
    
    tls\_server\_domain\[1.2.3.4:5066\] {
     tls\_certificate   = "/path/to/tlsfed/example-com.key"
     tls\_private\_key   = "/path/to/tlsfed/example-com.crt"
     tls\_ca\_list       = "/path/to/tlsfed/ca.pem"
     tls\_method        = tlsv1
     tls\_verify\_client = 1
     tls\_require\_cleint\_certificate = 1
    }
    		
    
    �
    
*   _Outgoing SIP configuration_
    
    Calls to other members also must use the proper client cert. Therefore, a TLS client domain must be configured. We use the federation name as TLS client domain identifier. Therefore, the content of the "tls\_client\_domain\_avp" must be set to this identifier (e.g. by putting it as rule into the domainpolicy table).
    
    �
    
    tls\_client\_domain\["tlsfed"\] {
     tls\_certificate   = "/path/to/tlsfed/example-com.key"
     tls\_private\_key   = "/path/to/tlsfed/example-com.crt"
     tls\_ca\_list       = "/path/to/tlsfed/ca.pem"
     tls\_method        = tlsv1
     tls\_verify\_server = 1
    }
    		
    

### 1.6.2.�SIP Hub based Federation

This example shows how a peering fabric based on a central SIP hub can be configured.

Let's assume that an organization called "HUBFED.org" acts as an umbrella for VoIP providers who want to peer with each other but don't want to run open SIP proxies. Instead, HUBFED.org operates a central SIP proxy which will relay calls between all participating members. Each member thus only needs to allow incoming calls from that central hub (which could be done by firewalling). All this can be achieved by the following configuration for a participating VoIP operation called example.com:

*   _DNS configuration_
    
    The destination network announces its membership in this federation.
    
    �
    
    $ORIGIN destination.example.org
    @ IN NAPTR 10 50   "U"  "D2P+SIP:fed" (
                     "!^.\*$!http://HUBFED.org/!" . )
    		
    
    �
    
*   _Outgoing SIP configuration_
    
    Calls to other members need to be redirected to the central proxy. The domainpolicy table just needs to list the federation and link it to the central proxy's domain name:
    
    �
    
    mysql> select \* from domainpolicy;
    +----+--------------------+------+-------------------+----------------+
    | id | rule               | type | att               | val            |
    +----+--------------------+------+-------------------+----------------+
    | 1  | http://HUBFED.org/ | fed  | domainreplacement | sip.HUBFED.org |
    +----+--------------------+------+-------------------+----------------+
    		
    
    �
    

### 1.6.3.�Walled Garden Federation

This example assumes that a set of SIP providers have established a secure Layer 3 network between their proxies. It does not matter whether this network is build by means of IPsec, a private Layer 2 network, or by simple firewalling. We will use the 10.x network (for the walled garden net) and "http://l3fed.org/" (as federation identifier) in this example.

A member of this federation (e.g. example.com) can not announce its SIP proxy's 10.x address in the standard SRV / A records of his domain, as this address is only meaningful for other members of this federation. In order to facilite different IP address resolution paths within the federation vs. outside the federation, all members of "http://l3fed.org/" agree to prefix the destination domains with "l3fed" before the SRV (or A) lookup.

Here is the configuration for example.com:

*   _DNS configuration_
    
    The destination network announces its membership in this federation.
    
    �
    
    $ORIGIN example.com
    @ IN NAPTR 10 50   "U"  "D2P+SIP:fed" (
                     "!^.\*$!http://l3fed.org/!" . )
    \_sip.\_udp      IN SRV 10 10 5060 publicsip.example.com.
    \_sip.\_udp.l3fe IN SRV 10 10 5060 l3fedsip.example.com.
    
    publicsip      IN A   193.XXX.YYY.ZZZ 
    l3fedsip       IN A   10.0.0.42
    		
    
    �
    
*   _Outgoing SIP configuration_
    
    The domainpolicy table just needs to link the federation identifier to the agreed apon prefix:
    
    �
    
    mysql> select \* from domainpolicy;
    +----+-------------------+------+--------------+-------+
    | id | rule              | type | att          | val   |
    +----+-------------------+------+--------------+-------+
    | 1  | http://l3fed.org/ | fed  | domainprefix | l3fed |
    +----+-------------------+------+--------------+-------+
    		
    
    �
    

## 1.7.�Known Limitations

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

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

22

16

178

217

2.

Klaus Darilion

22

1

2456

0

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

13

9

60

180

4.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

12

9

39

64

5.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

10

8

19

21

6.

Henning Westerholt ([@henningw](https://github.com/henningw))

6

4

25

25

7.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

4

5

8.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

4

2

6

4

9.

Konstantin Bokarius

3

1

2

5

10.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

3

1

1

1

  

**All remaining contributors**: UnixDev, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Nov 2023

2.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2023

3.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jun 2011 - Nov 2021

4.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Dec 2006 - Mar 2020

5.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

6.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Jun 2018

7.

UnixDev

Feb 2009 - Feb 2009

8.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

Nov 2006 - Mar 2008

9.

Konstantin Bokarius

Mar 2008 - Mar 2008

10.

Edson Gellert Schubert

Feb 2008 - Feb 2008

  

**All remaining contributors**: Henning Westerholt ([@henningw](https://github.com/henningw)), Klaus Darilion.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Klaus Darilion.

_Documentation Copyrights:_

Copyright � 2002,2003,2006 Juha Heinanen, Otmar Lendl, Klaus Darilion