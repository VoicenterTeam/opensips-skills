# domainpolicy Module Reference
<!-- generated-from: data/3.6/modules/domainpolicy.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 domainpolicy module. Read this file when configuring or debugging the domainpolicy module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The Domain Policy module implements draft-lendl-domain-policy-ddds-02 in combination with draft-lendl-speermint-federations-02 and draft-lendl-speermint-technical-policy-00. These drafts define DNS records with which a domain can announce its federation memberships. A local database can be used to map policy rules to routing policy decisions. This database can also contain rules concerning destination domains independently of draft-lendl-domain-policy-ddds-02.

This module requires a database. No caching is implemented.

## Dependencies

### OpenSIPs Modules

- `database` — Any database module

### External Libraries

None.

## Exported Parameters

### `db_url` (string)

This is URL of the database to be used.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** postgresql://user:pass@db\_host/opensips.

```opensips
modparam("domainpolicy", "db\_url", "postgresql://user:pass@db\_host/opensips")
```
### `domain_prefix_avp` (string)

Name of the AVP which contains a domain prefix.

*Default value is domainprefix.*

**Example.** domainprefix.

```opensips
# string named AVP
modparam("domainpolicy", "domain_prefix_avp", "domainprefix")
```
### `domain_replacement_avp` (string)

Name of the AVP which contains a domain replacement.

*Default value is domainreplacement.*

**Example.** domainreplacement.

```opensips
# string named AVP
modparam("domainpolicy", "domain_replacement_avp", "domainreplacement")
```
### `domain_suffix_avp` (string)

Name of the AVP which contains a domain suffix.

*Default value is “domainsuffix”.*

**Example.** domainsuffix.

```opensips
# string named AVP
modparam("domainpolicy", "domain\_suffix\_avp", "domainsuffix")
```
### `dp_col_att` (string)

Name of column containing the AVP's name. If the rule stored in this row triggers, than dp\_can\_connect() will add an AVP with that name.

*Default value is att.*

**Example.** attribute.

```opensips
modparam("domainpolicy", "dp\_col\_att", "attribute")
```
### `dp_col_rule` (string)

Name of column containing the domain policy rule name which is equal to the URI as published in the domain policy NAPTRs.

*Default value is rule.*

**Example.** rules.

```opensips
modparam("domainpolicy", "dp\_col\_rule", "rules")
```
### `dp_col_type` (string)

Name of column containing the domain policy rule type. In the case of federation names, this is "fed". For standard referrals according to draft-lendl-speermint-technical-policy-00, this is "std". For direct domain lookups, this is "dom".

*Default value is type.*

**Possible values:**

- fed
- std
- dom

**Example.** type.

```opensips
modparam("domainpolicy", "dp\_col\_type", "type")
```
### `dp_col_val` (string)

Name of column containing the value for AVPs created by dp_can_connect().

*Default value is val.*

**Example.** values.

```opensips
modparam("domainpolicy", "dp_col_val", "values")
```
### `dp_table` (string)

Name of table containing the local support domain policy setup.

*Default value is domainpolicy.*

**Example.** supportedpolicies.

```opensips
modparam("domainpolicy", "dp\_table", "supportedpolicies")
```
### `port_override_avp` (string)

This parameter defines the name of the AVP where dp_apply_policy() will look for an override port number.

*Default value is portoverride.*

**Example.** portoverride.

```opensips
# string named AVP
modparam("domainpolicy", "port_override_avp", "portoverride")
```
### `send_socket_avp` (string)

Name of the AVP which contains a send\_socket. The format of the send socket (the payload of this AVP) must be in the format \[proto:\]ip\_address\[:port\]. The function dp\_apply\_policy will look for this AVP and if defined, it will force the send socket to its value (smilar to the force\_send\_socket core function).

*Default value is “sendsocket”.*

**Example.** sendsocket.

```opensips
# string named AVP
modparam("domainpolicy", "send\_socket\_avp", "sendsocket")
```
### `transport_override_avp` (string)

Name of the AVP which contains the override transport setting.

*Default value is transportoverride.*

**Example.** transportoverride.

```opensips
# string named AVP
modparam("domainpolicy", "transport_override_avp", "transportoverride")
```

## Exported Functions

### `dp_apply_policy()`

This function sets the destination URI according to the policy returned from the `dp_can_connect()` function. Parameter exchange between `dp_can_connect()` and `dp_apply_policy()` is done via AVPs. The AVPs can be configured in the module's parameter section.

Note: The name of the AVPs must correspond with the names in the _att_ column in the domainpolicy table.

Setting the following AVPs in `dp_can_connect()` (or by any other means) cause the following actions in `dp_apply_policy()`:

*   _port_override_avp_: If this AVP is set, the port in the destination URI is set to this port. Setting an override port disables NAPTR and SRV lookups according to RFC 3263.

*   _transport_override_avp_: If this AVP is set, the transport parameter in the destination URI is set to the specified transport ("udp", "tcp", "tls"). Setting an override transport also disables NAPTR lookups, but retains an SRV lookup according to RFC 3263.

*   _domain_replacement_avp_: If this AVP is set, the domain in the destination URI will be replaced by this domain.
    
    A non-terminal NAPTR and thus a referral to a new domain implicitly sets _domain_replacement_avp_ to the new domain.

*   _domain_prefix_avp_: If this AVP is set, the domain in the destination URI will be prefixed with this "subdomain". E.g. if the domain in the request URI is "example.com" and the domain_prefix_avp contains "inbound", the domain in the destinaton URI is set to "inbound.example.com".

*   _domain_suffix_avp_: If this AVP is set, the domain in the destination URI will have the content of the AVP appended to it. E.g. if the domain in the request URI is "example.com" and the domain_suffix_avp contains "myroot.com", the domain in the destination URI is set to "example.com.myroot.com".

*   _send_socket_avp_: If this AVP is set, the sending socket will be forced to the socket in the AVP. The payload format of this AVP must be [proto:]ip_address[:port].

If both prefix/suffix and domain replacements are used, then the replacement is performed first and the prefix/suffix are applied to the new domain.

**Usable from:** REQUEST_ROUTE

**Related:**

- `dp_can_connect()`

**Example.** dp_apply_policy usage.

```opensips
...
if (dp_apply_policy()) {
	t_relay();
}
...
```

### `dp_can_connect()`

Checks the interconnection policy of the caller. It uses the domain in the request URI to perform the DP-DDDS algorithm according to draft-lendl-domain-policy-ddds-02 to retrieve the domain's policy announcements. As of this version, only records conforming to draft-lendl-speermint-federations-02 and draft-lendl-speermint-technical-policy-00 are supported.

Non-terminal NAPTR records will cause recursion to the replacement domain. dp_can_connect() will thus look for policy rules in the referenced domain. Furthermore, an AVP for "domainreplacement" (containing the new domain) will be added to the call. This will redirect SRV/A record lookups to the new domain.

In order to simplify direct domain-based peerings all destination domains are treated as if they contain a top priority "D2P+SIP:dom" rule with the domain itself as the value of the rule. Thus any database row with type = 'dom' and rule = 'example.com' will override any dynamic DNS-discovered rules.

For NAPTRs with service-type "D2P+SIP:fed", the federation IDs (as extracted from the regexp field) are used to retrieve policy records from a local local database (basically: "SELECT dp_col_att, dp_col_val FROM dp_table WHERE dp_col_rule = '[federationID]' AND type = 'fed'). If records are found (and all other records with the same order value are fulfillable) then AVPs will be created from the dp_col_att and dp_col_val columns.

For NAPTRs with service-type "D2P+SIP:std", the same procedure is performed. This time, the database lookup searched for type = 'std', though.

"D2P+SIP:fed" and "D2P+SIP:std" can be mixed freely. If two rules with the same "order" match and try to set the same AVP, then the behaviour is undefined.

The dp_col_att column specifies the AVP's name. If the AVP start with "s:" or "i:", the corresponding AVP type (string named or integer named) will be generated. If the excat specifier is omited, the AVP type will be guessed.

The dp_col_val column will always be interpreted as string. Thus, the AVP's value is always string based.

**Return codes:**

- `-2` — on errors during the evaluation. (DNS, DB, ...)
- `-1` — D2P+SIP records were found, but the policy is not fullfillable.
- `1` — D2P+SIP records were found and a call is possible
- `2` — No D2P+SIP records were found. The destination domain does not announce a policy for incoming SIP calls.

**Usable from:** REQUEST_ROUTE

**Related:**

- `dp_apply_policy()`

**Example.** dp_can_connect usage.

```opensips
...
dp_can_connect();
switch(retcode) {
	case -2:
		xlog("L_INFO","Errors during the DP evaluation\n");
		sl_send_reply(404, "We can't connect you.");
		break;
	case -1:
		xlog("L_INFO","We can't connect to that domain\n");
		sl_send_reply(404, "We can't connect you.");
		break;
	case 1:
		xlog("L_INFO","We found matching policy records\n");
		avp_print();
		dp_apply_policy();
		t_relay();
		break;
	case 2:
		xlog("L_INFO","No DP records found\n");
		t_relay();
		break;
}
...
```

## Configuration Examples

### Setting db_url parameter

Setting db_url parameter

```opensips
modparam("domainpolicy", "db\_url", "postgresql://user:pass@db\_host/opensips")
```
### Setting dp_table parameter

Setting dp_table parameter

```opensips
modparam("domainpolicy", "dp\_table", "supportedpolicies")
```
### Setting dp_col_rule parameter

Setting dp_col_rule parameter

```opensips
modparam("domainpolicy", "dp\_col\_rule", "rules")
```
### Setting dp_col_rule parameter

Setting dp_col_rule parameter

```opensips
modparam("domainpolicy", "dp\_col\_type", "type")
```
### Setting dp_col_att parameter

Setting dp_col_att parameter

```opensips
modparam("domainpolicy", "dp\_col\_att", "attribute")
```
### Setting dp_col_val parameter

Setting dp_col_val parameter

```opensips
modparam("domainpolicy", "dp\_col\_val", "values")
```
### Setting port_override_avp parameter

Setting port_override_avp parameter

```opensips
\# string named AVP
modparam("domainpolicy", "port\_override\_avp", "portoverride")
```
### Setting transport_override_avp parameter

Setting transport_override_avp parameter

```opensips
\# string named AVP
modparam("domainpolicy", "transport\_override\_avp", "transportoverride")
```
### Setting domain_replacement_avp parameter

Setting domain_replacement_avp parameter

```opensips
\# string named AVP
modparam("domainpolicy", "domain\_replacement\_avp", "domainreplacement")
```
### Setting domain_prefix_avp parameter

Setting domain_prefix_avp parameter

```opensips
\# string named AVP
modparam("domainpolicy", "domain\_prefix\_avp", "domainprefix")
```
### Setting domain_suffix_avp parameter

Setting domain_suffix_avp parameter

```opensips
\# string named AVP
modparam("domainpolicy", "domain\_suffix\_avp", "domainsuffix")
```
### Setting send_socket_avp parameter

Setting send_socket_avp parameter

```opensips
\# string named AVP
modparam("domainpolicy", "send\_socket\_avp", "sendsocket")
```
### dp_can_connect usage

dp_can_connect usage

```opensips
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
```
### dp_apply_policy usage

dp_apply_policy usage

```opensips
...
if (dp\_apply\_policy()) {
	t\_relay();
}
...
```
