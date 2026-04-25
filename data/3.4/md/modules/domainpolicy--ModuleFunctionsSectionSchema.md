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