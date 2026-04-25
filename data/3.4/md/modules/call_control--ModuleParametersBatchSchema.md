## 1.5.�Exported parameters

### 1.5.1.�`disable` (int)

Boolean flag that specifies if callcontrol should be disabled. This is useful when you want to use the same OpenSIPS configuration in two different context, one using callcontrol, the other not. In the case callcontrol is disabled, calls to the call\_control() function will return a code indicating that there is no limit associated with the call, allowing the use of the same configuration without changes.

_Default value is “0”._

**Example�1.1.�Setting the `disable` parameter**

...
modparam("call\_control", "disable", 1)
...
        

  

### 1.5.2.�`socket_name` (string)

It is the path to the filesystem socket where the callcontrol application listens for commands from the module.

_Default value is “/run/callcontrol/socket”._

**Example�1.2.�Setting the `socket_name` parameter**

...
modparam("call\_control", "socket\_name", "/run/callcontrol/socket")
...
        

  

### 1.5.3.�`socket_timeout` (int)

How much time (in milliseconds) to wait for an answer from the callcontrol application.

_Default value is “500” (ms)._

**Example�1.3.�Setting the `socket_timeout` parameter**

...
modparam("call\_control", "socket\_timeout", 500)
...
        

  

### 1.5.4.�`signaling_ip_avp` (string)

Specification of the AVP which holds the IP address from where the SIP signaling originated. If this AVP is set it will be used to get the signaling IP address, else the source IP address from where the SIP message was received will be used. This AVP is meant to be used in cases where there are more than one proxy in the call setup path and the proxy that actually starts callcontrol doesn't receive the SIP messages directly from the UA and it cannot determine the NAT IP address from where the signaling originated. In such a case attaching a SIP header at the first proxy and then copying that header's value into the signaling\_ip\_avp on the proxy that starts callcontrol will allow it to get the correct NAT IP address from where the SIP signaling originated.

This is used by the rating engine which finds the rates to apply to a call based on caller's SIP URI, caller's SIP domain or caller's IP address (whichever yields a rate first, in this order).

_Default value is “$avp(cc\_signaling\_ip)”._

**Example�1.4.�Setting the `signaling_ip_avp` parameter**

...
modparam("call\_control", "signaling\_ip\_avp", "$avp(cc\_signaling\_ip)")
...
        

  

### 1.5.5.�`canonical_uri_avp` (string)

Specification of the AVP which holds an optional application defined canonical request URI. When this is set, it will be used as the destination when computing the call price, otherwise the request URI will be used. This is useful when the username of the ruri needs to have a different, canonical form in the rating engine computation than it has in the ruri.

_Default value is “$avp(cc\_can\_uri)”._

**Example�1.5.�Setting the `canonical_uri_avp` parameter**

...
modparam("call\_control", "canonical\_uri\_avp", "$avp(cc\_can\_uri)")
...
        

  

### 1.5.6.�`diverter_avp` (string)

Specification of the AVP which holds an optional application defined diverter SIP URI. When this is set, it will be used by the rating engine as the billing party when finding the rates to apply to a given call, otherwise, the caller's URI taken from the From field will be used. When set, this AVP should contain a value in the form “user@domain” (no sip: prefix should be used).

This is useful when a destination diverts a call, thus becoming the new caller. In this case the billing party is the diverter and this AVP should be set to it, to allow the rating engine to pick the right rates for the call. For example, if A calls B and B diverts all its calls unconditionally to C, then the diverter AVP should the set to B's URI, because B is the billing party in the call not A after the call was diverted.

_Default value is “$avp(diverter)”._

**Example�1.6.�Setting the `diverter_avp` parameter**

...
modparam("call\_control", "diverter\_avp", "$avp(diverter)")

route {
  ...
  # alice@example.com is paying for this call
  $avp(diverter) = "alice@example.com";
  ...
}
...
        

  

### 1.5.7.�`prepaid_account_flag` (string)

The flag that is used to specify whether the account making the call is prepaid or postpaid. Setting this to a non-null value will determine the module to pass the flag's value to the external application. This will allow the external application to compare OpenSIPS's and the rating engine's views on whether the account calling is prepaid or not and take appropriate action if they conflict. The flag should be set from the OpenSIPS configuration for a prepaid account and reset for a postpaid one.

_Default value is NULL (undefined)._

**Example�1.7.�Setting the `prepaid_account_flag` parameter**

...
modparam("call\_control", "prepaid\_account\_flag", "PP\_ACC\_FLAG")
...
        

  

### 1.5.8.�`call_limit_avp` (string)

Specification of the AVP which holds an optional application defined call limit. When this is set, it will be passed to the CallControl application and if the limit is reached the call\_control function will return an error code of -4.

_Default value is “$avp(cc\_call\_limit)”._

**Example�1.8.�Setting the `call_limit_avp` parameter**

...
modparam("call\_control", "call\_limit\_avp", "$avp(cc\_call\_limit)")
...
        

  

### 1.5.9.�`call_token_avp` (string)

Specification of the AVP which holds an optional application defined token. This token will be used to check if two calls with the same CallID actually refer to the same call. If call\_control() is called multiple times for the same call (thus same CallID) the token needs to be the same or call\_control will return -3 error, indicating that the CallID is duplicated.

_Default value is “$avp(cc\_call\_token)”._

**Example�1.9.�Setting the `call_token_avp` parameter**

...
modparam("call\_control", "call\_token\_avp", "$avp(cc\_call\_token)")
...
$avp(cc\_call\_token) := $RANDOM;
...
        

  

### 1.5.10.�`init` (string)

This parameter is used to describe custom call control initialize messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]\*"
    

The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default initialize message is sent.

_Default value is “NULL”._

**Example�1.10.�Setting the `init` parameter**

	
...
modparam("call\_control", "init", "call-id=$ci to=$tu from=$fu 
			authruri=$du another\_field = $avp(10)")
...
        

  

### 1.5.11.�`start` (string)

This parameter is used to describe custom call control start messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]\*"
    

The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default start message is sent.

_Default value is “NULL”._

**Example�1.11.�Setting the `start` parameter**

	
...
modparam("call\_control", "start", "call-id=$ci to=$tu from=$fu 
			authruri=$du another\_field = $avp(10)")
...
        

  

### 1.5.12.�`stop` (string)

This parameter is used to describe custom call control stop messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]\*"
    

The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default stop message is sent.

_Default value is “NULL”._

**Example�1.12.�Setting the `stop` parameter**

	
...
modparam("call\_control", "stop", "call-id=$ci to=$tu from=$fu 
			authruri=$du another\_field = $avp(10)")
...