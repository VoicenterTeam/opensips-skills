# call_control Module Reference
<!-- generated-from: data/3.6/modules/call_control.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 call_control module. Read this file when configuring or debugging the call_control module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module allows one to limit the duration of calls and automatically end them when they exceed the imposed limit. Its main use case is to implement a prepaid system, but it can also be used to impose a global limit on all calls processed by the proxy.

## How It Works

Callcontrol consists of 3 components:

*   The OpenSIPS call_control module
    
*   An external application called callcontrol which keeps track of the calls that have a time limit and automatically ends them when they exceed it. This application receives requests from OpenSIPS and makes requests to a rating engine (see below) to find out if a call needs to be limited or not. When a call ends (or is ended) it will also instruct the rating engine to debit the balance for the caller with the consumed amount. The callcontrol application is available from http://callcontrol.ag-projects.com/
    
*   A rating engine that is used to calculate the time limit based on the caller's credit and the destination price and to debit the caller's balance after a call ends. This is available as part of CDRTool from http://cdrtool.ag-projects.com/
    
The callcontrol application runs on the same machine as OpenSIPS and they communicate over a filesystem socket, while the rating engine can run on a different host and communicates with the callcontrol application using a TCP connection.

Callcontrol is invoked by calling the call_control() function for the initial INVITE of every call we want to apply a limit to. This will end up as a request to the callcontrol application, which will interrogate the rating engine for a time limit for the given caller and destination. The rating engine will determine if the destination has any associated cost and if the caller has any credit limit and if so will return the amount of time he is allowed to call that destination. Otherwise it will indicate that there is no limit associated with the call. If there is a limit, the callcontrol application will retain the session and attach a timer to it that will expire after the given time causing it to call back to OpenSIPS with a request to end the dialog. If the rating engine returns that there is no limit for the call, the session is discarded by the callcontrol application and it will allow it to go proceed any limit. An appropriate response is returned to the call_control module that is then returned by the call_control() function call and allows the script to make a decision based on the answer.

## Dependencies

### OpenSIPs Modules

- `dialog`

### External Libraries

None.

## Exported Parameters

### `call_limit_avp` (string)

Specification of the AVP which holds an optional application defined call limit. When this is set, it will be passed to the CallControl application and if the limit is reached the call_control function will return an error code of -4.

*Default value is $avp(cc_call_limit).*

**Example.** $avp(cc_call_limit).

```opensips
...
modparam("call_control", "call_limit_avp", "$avp(cc_call_limit)")
...
```
### `call_token_avp` (string)

Specification of the AVP which holds an optional application defined token. This token will be used to check if two calls with the same CallID actually refer to the same call. If call_control() is called multiple times for the same call (thus same CallID) the token needs to be the same or call_control will return -3 error, indicating that the CallID is duplicated.

*Default value is $avp(cc_call_token).*

**Example.** $avp(cc_call_token).

```opensips
...
modparam("call_control", "call_token_avp", "$avp(cc_call_token)")
...
$avp(cc_call_token) := $RANDOM;
...
```
### `canonical_uri_avp` (string)

Specification of the AVP which holds an optional application defined canonical request URI. When this is set, it will be used as the destination when computing the call price, otherwise the request URI will be used. This is useful when the username of the ruri needs to have a different, canonical form in the rating engine computation than it has in the ruri.

*Default value is $avp(cc_can_uri).*

**Example.** $avp(cc_can_uri).

```opensips
...
modparam("call_control", "canonical_uri_avp", "$avp(cc_can_uri)")
...
```
### `disable` (integer)

Boolean flag that specifies if callcontrol should be disabled. This is useful when you want to use the same OpenSIPS configuration in two different context, one using callcontrol, the other not. In the case callcontrol is disabled, calls to the call_control() function will return a code indicating that there is no limit associated with the call, allowing the use of the same configuration without changes.

*Default value is 0.*

**Example.** 1.

```opensips
...
modparam("call_control", "disable", 1)
...
```
### `diverter_avp` (string)

Specification of the AVP which holds an optional application defined diverter SIP URI. When this is set, it will be used by the rating engine as the billing party when finding the rates to apply to a given call, otherwise, the caller's URI taken from the From field will be used. When set, this AVP should contain a value in the form “user@domain” (no sip: prefix should be used). This is useful when a destination diverts a call, thus becoming the new caller. In this case the billing party is the diverter and this AVP should be set to it, to allow the rating engine to pick the right rates for the call. For example, if A calls B and B diverts all its calls unconditionally to C, then the diverter AVP should the set to B's URI, because B is the billing party in the call not A after the call was diverted.

*Default value is $avp(diverter).*

**Example.** $avp(diverter).

```opensips
...
modparam("call_control", "diverter_avp", "$avp(diverter)")

route {
  ...
  # alice@example.com is paying for this call
  $avp(diverter) = "alice@example.com";
  ...
}
...
```
### `init` (string)

This parameter is used to describe custom call control initialize messages. It represents a list of key value pairs and has the following format: "string1 = var1 [string2 = var2]*". The left-hand side of the assignment can be any string. The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see CookBooks - Scripting Variables. If the parameter is not set, the default initialize message is sent.

*Default value is NULL.*

**Example.** call-id=$ci to=$tu from=$fu authruri=$du another_field = $avp(10).

```opensips
...
modparam("call_control", "init", "call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10)")
...
```
### `prepaid_account_flag` (string)

The flag that is used to specify whether the account making the call is prepaid or postpaid. Setting this to a non-null value will determine the module to pass the flag's value to the external application. This will allow the external application to compare OpenSIPS's and the rating engine's views on whether the account calling is prepaid or not and take appropriate action if they conflict. The flag should be set from the OpenSIPS configuration for a prepaid account and reset for a postpaid one.

*Default value is NULL (undefined).*

**Example.** PP_ACC_FLAG.

```opensips
...
modparam("call_control", "prepaid_account_flag", "PP_ACC_FLAG")
...
```
### `signaling_ip_avp` (string)

Specification of the AVP which holds the IP address from where the SIP signaling originated. If this AVP is set it will be used to get the signaling IP address, else the source IP address from where the SIP message was received will be used. This AVP is meant to be used in cases where there are more than one proxy in the call setup path and the proxy that actually starts callcontrol doesn't receive the SIP messages directly from the UA and it cannot determine the NAT IP address from where the signaling originated. In such a case attaching a SIP header at the first proxy and then copying that header's value into the signaling_ip_avp on the proxy that starts callcontrol will allow it to get the correct NAT IP address from where the SIP signaling originated. This is used by the rating engine which finds the rates to apply to a call based on caller's SIP URI, caller's SIP domain or caller's IP address (whichever yields a rate first, in this order).

*Default value is $avp(cc_signaling_ip).*

**Example.** $avp(cc_signaling_ip).

```opensips
...
modparam("call_control", "signaling_ip_avp", "$avp(cc_signaling_ip)")
...
```
### `socket_name` (string)

It is the path to the filesystem socket where the callcontrol application listens for commands from the module.

*Default value is /run/callcontrol/socket.*

**Example.** /run/callcontrol/socket.

```opensips
...
modparam("call_control", "socket_name", "/run/callcontrol/socket")
...
```
### `socket_timeout` (integer)

How much time (in milliseconds) to wait for an answer from the callcontrol application.

*Default value is 500.*

**Example.** 500.

```opensips
...
modparam("call_control", "socket_timeout", 500)
...
```
### `start` (string)

This parameter is used to describe custom call control start messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]*"
    
The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default start message is sent.

*Default value is NULL.*

**Example.** call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10).

```opensips
...
modparam("call_control", "start", "call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10)")
...
```
### `stop` (string)

This parameter is used to describe custom call control stop messages. It represents a list of key value pairs and has the following format:

*   "string1 = var1 \[string2 = var2\]*"
    
The left-hand side of the assignment can be any string.

The right-hand side of the assignment must be a script pseudo variable or a script AVP. For more information about them see [CookBooks - Scripting Variables](https://opensips.org/Resources/DocsCoreVar15).

If the parameter is not set, the default stop message is sent.

*Default value is NULL.*

**Example.** call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10).

```opensips
...
modparam("call_control", "stop", "call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10)")
...
```

## Exported Functions

### `call_control()`

Trigger the use of callcontrol for the dialog started by the INVITE for which this function is called (the function should only be called for the first INVITE of a call). Further in-dialog requests will be processed automatically using internal bindings into the dialog state machine, allowing callcontrol to update its internal state as the dialog progresses, without any other intervention from the script.

This function should be called right before the message is sent out using t_relay(), when all the request uri modifications are over and a final destination has been determined.

**Return codes:**

- `2` — call has no limit
- `1` — call has limit and is traced by callcontrol
- `-1` — not enough credit to make the call
- `-2` — call is locked by another call in progress
- `-3` — duplicated callid
- `-4` — call limit has been reached
- `-5` — internal error (message parsing, communication, ...)

**Usable from:** REQUEST_ROUTE

**Example.** Using the `call_control` function.

```opensips
...
if ($avp(805) != NULL) {
    # the diverter AVP is set, use it as billing party
    $avp(billing_party_domain) = $(avp(805){uri.domain});
} else {
    $avp(billing_party_domain) = $fd;
}

if (is_method("INVITE") && !has_totag() &&
    is_domain_local($avp(billing_party_domain))) {
    call_control();
    switch ($retcode) {
    case 2:
        # Call with no limit
    case 1:
        # Call has limit and is under callcontrol management
        break;
    case -1:
        # Not enough credit (prepaid call)
        sl_send_reply(402, "Not enough credit");
        exit;
        break;
    case -2:
        # Locked by another call in progress (prepaid call)
        sl_send_reply(403, "Call locked by another call in progress");
        exit;
        break;
    case -3:
        # Duplicated callid
        sl_send_reply(400, "Duplicated callid");
        exit;
        break;
    case -4:
        # Call limit reached
        sl_send_reply(503, "Too many concurrent calls");
        exit;
        break;
    default:
        # Internal error (message parsing, communication, ...)
        if (PREPAID_ACCOUNT) {
            xlog("Call control: internal server error\n");
            sl_send_reply(500, "Internal server error");
            exit;
        } else {
            xlog("L_WARN", "Cannot set time limit for postpaid call\n");
        }
    }
}
t_relay();
...
```

## Configuration Examples

### Setting the `disable` parameter

Setting the `disable` parameter

```opensips
...
modparam("call_control", "disable", 1)
...
```
### Setting the `socket_name` parameter

Setting the `socket_name` parameter

```opensips
...
modparam("call_control", "socket_name", "/run/callcontrol/socket")
...
```
### Setting the `socket_timeout` parameter

Setting the `socket_timeout` parameter

```opensips
...
modparam("call_control", "socket_timeout", 500)
...
```
### Setting the `signaling_ip_avp` parameter

Setting the `signaling_ip_avp` parameter

```opensips
...
modparam("call_control", "signaling_ip_avp", "$avp(cc_signaling_ip)")
...
```
### Setting the `canonical_uri_avp` parameter

Setting the `canonical_uri_avp` parameter

```opensips
...
modparam("call_control", "canonical_uri_avp", "$avp(cc_can_uri)")
...
```
### Setting the `diverter_avp` parameter

Setting the `diverter_avp` parameter

```opensips
...
modparam("call_control", "diverter_avp", "$avp(diverter)")

route {
  ...
  # alice@example.com is paying for this call
  $avp(diverter) = "alice@example.com";
  ...
}
...
```
### Setting the `prepaid_account_flag` parameter

Setting the `prepaid_account_flag` parameter

```opensips
...
modparam("call_control", "prepaid_account_flag", "PP_ACC_FLAG")
...
```
### Setting the `call_limit_avp` parameter

Setting the `call_limit_avp` parameter

```opensips
...
modparam("call_control", "call_limit_avp", "$avp(cc_call_limit)")
...
```
### Setting the `call_token_avp` parameter

Setting the `call_token_avp` parameter

```opensips
...
modparam("call_control", "call_token_avp", "$avp(cc_call_token)")
...
$avp(cc_call_token) := $RANDOM;
...
```
### Setting the `init` parameter

Setting the `init` parameter

```opensips
...
modparam("call_control", "init", "call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10)")
...
```
### Setting the `start` parameter

Setting the `start` parameter

```opensips
...
modparam("call_control", "start", "call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10)")
...
```
### Setting the `stop` parameter

Setting the `stop` parameter

```opensips
...
modparam("call_control", "stop", "call-id=$ci to=$tu from=$fu 
			authruri=$du another_field = $avp(10)")
...
```
### Using the `call_control` function

Using the `call_control` function

```opensips
...
if ($avp(805) != NULL) {
    # the diverter AVP is set, use it as billing party
    $avp(billing_party_domain) = $(avp(805){uri.domain});
} else {
    $avp(billing_party_domain) = $fd;
}

if (is_method("INVITE") && !has_totag() &&
    is_domain_local($avp(billing_party_domain))) {
    call_control();
    switch ($retcode) {
    case 2:
        # Call with no limit
    case 1:
        # Call has limit and is under callcontrol management
        break;
    case -1:
        # Not enough credit (prepaid call)
        sl_send_reply(402, "Not enough credit");
        exit;
        break;
    case -2:
        # Locked by another call in progress (prepaid call)
        sl_send_reply(403, "Call locked by another call in progress");
        exit;
        break;
    case -3:
        # Duplicated callid
        sl_send_reply(400, "Duplicated callid");
        exit;
        break;
    case -4:
        # Call limit reached
        sl_send_reply(503, "Too many concurrent calls");
        exit;
        break;
    default:
        # Internal error (message parsing, communication, ...)
        if (PREPAID_ACCOUNT) {
            xlog("Call control: internal server error\n");
            sl_send_reply(500, "Internal server error");
            exit;
        } else {
            xlog("L_WARN", "Cannot set time limit for postpaid call\n");
        }
    }
}
t_relay();
...
```
