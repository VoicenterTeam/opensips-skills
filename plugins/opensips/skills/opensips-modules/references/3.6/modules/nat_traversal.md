# nat_traversal Module Reference
<!-- generated-from: data/3.6/modules/nat_traversal.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 nat_traversal module. Read this file when configuring or debugging the nat_traversal module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

The nat_traversal module provides support for handling far-end NAT traversal for SIP signaling. The module includes functionality to detect user agents behind NAT, to modify SIP headers to allow user agents to work transparently behind NAT and to send keepalive messages to user agents behind NAT in order to preserve their visibility in the network. The module can handle user agents behind multiple cascaded NAT boxes as easily as user agents behind a single level of NAT. The module is designed to work in complex environments where multiple SIP proxies may be involved in handling registration and routing and where the incoming and outgoing paths may not necessarily be the same, or where the routing path may even change between consecutive dialogs.

## How It Works

The nat_traversal module implements a very sophisticated keepalive mechanism, that is able to handle the most complex environments and use cases, including distributed environments with multiple proxies. Unlike existing keepalive solutions that only send keepalive messages to user agents that have registered (during their registration), the nat_traversal module can keepalive an user agent based on multiple conditions, making it not only more flexible and more efficient, but also able to work in environments and with use cases where a simple keepalive implementation based on keeping alive registrations alone cannot work. The keepalive mechanism works by sending a SIP request to a user agent behind NAT to make that user agent send back a reply. The purpose is to have packets sent from inside the NAT to the proxy often enough to prevent the NAT box from timing out the connection. Many NAT boxes do not consider packets that travel from the outside to the inside of the NAT to reset the connection expiration timer, thus to keepalive a user agent we need to trigger an answer from it.

To avoid the above mentioned issues, this implementation introduces the concept of network visibility for a given condition. This way we can keepalive a user agent for multiple independent conditions, thus avoiding all the problems presented above. The conditions for which the module will send keepalive messages are: Registration - for user agents that have registered to preserve their visibility for incoming calls. This is the result of triggering keepalive for a REGISTER request. Subscription - for presence agents that have subscribed to some events to preserve their visibility for receiving back notifications. This is the result of triggering keepalive for a SUBSCRIBE request. Dialogs - for user agents that have initiated an outgoing call to preserve their visibility for receiving further in-dialog messages. This is the result of triggering keepalive for an outgoing INVITE request. A user agent's NAT entry point may be kept alive for one or multiple of the conditions listed above. Even when a NAT endpoint is kept alive for more than one condition, only one keepalive message is sent to that NAT endpoint. The presence of multiple conditions for a NAT endpoint, only guarantees that the network visibility for a user agent based on a certain condition will be available while that condition is true, independently of the other conditions. When all the conditions to keepalive a NAT endpoint will disappear, that endpoint will be removed from the list with the NAT endpoints that need to be kept alive. The user interface for the keepalive functionality is very simple. It consists of a single function called nat_keepalive() that needs to be called only once for the requests that trigger the need for network visibility. These requests are: REGISTER, SUBSCRIBE and outgoing INVITEs. After such a request arrives it makes the user agent visible for the purpose of receiving back other messages. Thus, after a REGISTER the user agent may receive back incoming calls, after a SUBSCRIBE it may receive back notifications and after an outgoing INVITE it may receive back further in-dialog messages including the BYE that ends the dialog. The nat_keepalive() function needs to be called on the proxy that directly receives the request from the user agent, if it determines that the user agent making the request is behind NAT. The function needs to be called before the request gets either a stateless reply or it is relayed with t_relay(). Calling the nat_keepalive() function has no effect if the request gets no stateless reply or it is not relayed. For environments with multiple proxies, where the proxy that acts as an entry point to the network for a given request is not the one that actually handles the request, then the nat_keepalive() function needs to be called on the proxy that is the entry point and after that the request must be sent to the proxy that actually handles the request using t_relay(). This is needed because the keepalive functionality detects from the stateless replies or the TM relayed replies if the NAT endpoint needs to be kept alive for the condition triggered by the request for which the nat_keepalive() function was called. For example assume a network where a proxy P1 receives a REGISTER from an user agent behind NAT. P1 will determine that the user agent is behind NAT so it needs keepalive functionality, but another proxy called P2 is actually handling the subscriber registrations. In this case P1 has to call nat_keepalive() even though it doesn't yet know the answer P2 will give to the REGISTER request (which may even be a negative reply) or if P2 will restrict the proposed expiration time in any way. Thus P1 calls nat_keepalive() after which it calls t_relay(). When the reply from P2 arrives, a callback is triggered which will determine if the request did get a positive reply, and if so it will extract the registration expiration time and enable the keepalive functionality for that endpoint for the registration condition for the time given by the registration expiration. For single proxy environments, or if P1 is the same as P2, then t_relay() is not called, instead save_location() is called if the registration is accepted. Then the same process described above happens only this time triggered by a stateless reply callback. In both cases, calling nat_keepalive() when the REGISTER is received has no other effect that to trigger some callbacks that will determine from the reply if the caller endpoint should be kept alive or not. Below is described how nat_keepalive() should be called and what it does for each of the requests that need keepalive functionality (the function should only be called if it is determined that the user agent that generated the request is behind NAT): REGISTER - called before save_location() or t_relay() (depending on whether the proxy that received the REGISTER is also handling registration for that subscriber or not). It will determine from either the stateless reply generated by save_location() or the TM relayed reply if the registration was successful and what is its expiration time. If the registration was successful it will mark the given NAT endpoint for keepalive for the registration condition using the detected expiration time. If the REGISTER request is discarded after nat_keepalive() was called or if it intercepts a negative reply it will have no effect and the registration condition will not be activated for that endpoint. SUBSCRIBE - called before handle_subscribe() or t_relay() (depending on whether the proxy that received the SUBSCRIBE is also handling subscriptions for that subscriber or not). It will determine from either the stateless reply generated by handle_subscribe() or the TM relayed reply if the subscription was successful and what is its expiration time. If the subscription was successful it will mark the given NAT endpoint for keepalive for the subscription condition using the detected expiration time. If the SUBSCRIBE request is discarded after nat_keepalive() was called or if it intercepts a negative reply it will have no effect and the subscription condition will not be activated for that endpoint. It should be called for every SUBSCRIBE received, not only the ones that start a subscription (do not have a to tag), because it needs to update (extend) the expiration time for the subscription. INVITE - called before t_relay() for the first INVITE in a dialog. It will automatically trigger dialog tracing for that dialog and will use the dialog callbacks to detect changes in the dialog state. It will add a keepalive entry with the dialog condition for the caller NAT endpoint as soon as the dialog is created (this happens when t_relay() is called). It will then keep that condition for the given endpoint until the dialog is destroyed (either terminated, failed or expired). If the INVITE request cannot be relayed after nat_keepalive() was called it will have no effect and the dialog condition will not be activated for that endpoint. In addition an INVITE that starts a dialog will automatically trigger keepalive functionality for the destination endpoints if they are behind NAT. This is done by detecting if any of the destination endpoints already has a keepalive entry for the register condition. If so, a dialog condition will be added to that entry thus preserving that endpoint visibility even if the registration expires during the dialog or is moved to another proxy. During the call setup stage, multiple entries for the callee may be added with the dialog condition if parallel forking is used, however only the destination endpoints behind NAT will have the extra dialog condition set. Later when the dialog is confirmed, only the endpoint that answered the call will keep the dialog condition activated (if present), while all the endpoints from the unanswered branches will have it removed. This is done automatically without any need to call any function. Considering the elements presented in this section, we can say that the nat_traversal module provides a flexible and efficient keepalive functionality that is very easy to use. Because only the border proxies send keepalive messages, the network traffic is minimized. For the same reason, message processing in the proxies is also minimized, as border proxies generate keepalive messages themselves and send them stateless, instead of having to relay messages generated by the registrars. Network traffic is also minimized by only sending a single keepalive message for an endpoint no matter for how many reasons the endpoint is kept alive. Keepalive messages are also distributed over the keepalive interval to avoid overloading the proxy by generating too many messages at a time. The nat_traversal module keeps its internal state about endpoints that need keepalive, state that is build while messages are processed by the proxy and thus it doesn't need to transfer any information from the usrloc module, which should also improve its efficiency.

## Dependencies

### OpenSIPs Modules

- `clusterer` — only if "cluster_id" option is enabled
- `dialog` — if keepalive is enabled and keeping alive INVITE dialogs is needed
- `sl` — if keepalive is enabled
- `tm` — if keepalive is enabled

### External Libraries

None.

## Exported Parameters

### `cluster_id` (integer)

The ID of the cluster the module is part of. The clustering support is used by the nat_traversal module for controlling the pinging process. When part of a cluster of multiple nodes, the nodes can agree upon which node is the one responsible for pinging.

The clustering with sharing tag support may be used to control which node in the cluster will perform the pinging/probing to the contacts. See the cluster_sharing_tag (1.4.7.�cluster_sharing_tag (string)) option.

For more info on how to define and populate a cluster (with OpenSIPS nodes) see the "clusterer" module.

*Default value is 0 (none).*

**Example.** 9.

```opensips
# Be part of cluster ID 9
modparam("nat\_traversal", "cluster\_id", 9)
```
### `cluster_sharing_tag` (string)

The name of the sharing tag (as defined per clusterer modules) to control which node is responsible for perform pinging of the contacts. If defined, only the node with active status of this tag will perform the pinging.

The cluster_id (1.4.6.�cluster_id (integer)) must be defined for this option to work.

This is an optional parameter. If not set, all the nodes in the cluster will individually do the pinging.

*Default value is empty (none).*

**Example.** vip.

```opensips
# only the node with the active "vip" sharing tag will perform pinging
modparam("nat\_traversal", "cluster\_id", 9)
modparam("nat\_traversal", "cluster\_sharing\_tag", "vip")
```
### `keepalive_extra_headers` (string)

Specifies extra headers that should be added to the keepalive messages that are sent by the proxy. The header specification must also include the CRLF (\r\n) line separator. Multiple headers can be specified by concatenating them and each of them must include the \r\n separator.

*Default value is undefined (send no extra headers)..*

**Example.** User-Agent: OpenSIPS\r\nX-MyHeader: some\_value\r\n.

```opensips
modparam("nat\_traversal", "keepalive\_extra\_headers", "User-Agent: OpenSIPS\r\nX-MyHeader: some\_value\r\n")
```
### `keepalive_from` (string)

Indicates what SIP URI to use in the From header of the keepalive requests. If not specified it will use sip:keepalive@proxy_ip, where proxy_ip is the IP address of the outgoing interface used to send the keepalive message, which is the same interface on which the request that triggered keepalive functionality arrived.

*Default value is sip:keepalive@proxy_ip.*

*Valid range: 0 or above.*

**Notes:** proxy_ip being the actual IP of the outgoing interface.
### `keepalive_interval` (integer)

The time interval (in seconds) required to send a keepalive message to all the endpoints that need being kept alive. During this interval, each endpoint will receive exactly one keepalive message. A negative value or zero will disable the keepalive functionality.

*Default value is 60.*

**Example.** 90.

```opensips
modparam("nat\_traversal", "keepalive\_interval", 90)
```
### `keepalive_method` (string)

What SIP method to use to send keepalive messages. Typical methods used for this purpose are NOTIFY and OPTIONS. NOTIFY generates smaller replies from user agents, but they are almost entirely negative replies. Apparently almost none of the user agents understand that the purpose of the NOTIFY with a “keep-alive” event is to keep NAT open, even though many user agents send such NOTIFY requests themselves. However this does not affect the result at all, since the purpose is to trigger a response from the user agent behind NAT, positive or negative replies having little relevance as they are discarded anyway. The OPTIONS method on the other hand has a much higher rate of positive replies, but at the same time those positive replies are much bigger, mostly because the OPTIONS method is used to inform about the user agent capabilities and thus it includes a lot of extra headers to indicate those capabilities. Many user agents also include a SDP body with a bogus media session, probably to indicate media capabilities. All of this makes that positive replies to OPTIONS requests are 2 to 3 times bigger than negative replies or replies to NOTIFY requests. For this reason the default value for the used method is NOTIFY.

*Default value is NOTIFY.*

**Example.** OPTIONS.

```opensips
modparam("nat\_traversal", "keepalive\_method", "OPTIONS")
```
### `keepalive_state_file` (string)

Specifies a filename where information about the NAT endpoints and the conditions for which they are being kept alive is saved when OpenSIPS exits. The information in this file is then used when OpenSIPS starts to restore its internal state and continue to send keepalive messages to the NAT endpoints that have not expired in the meantime. This is useful when restarting OpenSIPS to avoid losing keepalive state information about the NAT endpoints. The internal keepalive state is guaranteed to be saved in this file on exit, even when OpenSIPS crashes.

The value of this parameter can be either a relative path, in which case it will store it in the OpenSIPS working directory, or an absolute path.

*Default value is keepalive_state.*

**Example.** /run/opensips/keepalive_state.

```opensips
modparam("nat\_traversal", "keepalive\_state\_file", "/run/opensips/keepalive\_state")
```

## Exported Functions

### `client_nat_test(type)`

Check if the client is behind NAT. What tests are performed is specified by the type parameter which is an integer given by the sum of the numbers corresponding to the tests that one wishes to perform. The numbers corresponding to individual tests are shown below:

*   1 - tests if client has a private IP address (as defined by RFC1918) in the Contact field of the SIP message.
    
*   2 - tests if client has contacted OpenSIPS from an address that is different from the one in the Via field. Both the IP and port are compared by this test.
    
*   4 - tests if client has a private IP address (as defined by RFC1918) in the top Via field of the SIP message.
    
*   8 - tests if client has contacted OpenSIPS from an address that is different from the one in the Contact field. Only IP is compared by this test.

For example calling client_nat_test(3) will perform test 1 and test 2 and return true if at least one succeeds, otherwise false.

**Parameters:**

- `type` *(integer, required)* — integer given by the sum of the numbers corresponding to the tests that one wishes to perform
  - `1`
  - `2`
  - `4`
  - `8`

**Return codes:**

- `true` — at least one test succeeds
- `false` — otherwise

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** Using the `client_nat_test` function.

```opensips
...
if (client_nat_test(3)) {
    .....
}
...
```

### `fix_contact()`

Will replace the IP and port in the Contact header with the IP and port the SIP message was received from. Usually called after a successful call to client_nat_test(type)

**Usable from:** REQUEST_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE

**Related:**

- `client_nat_test`

**Example.** Using the `fix_contact` function.

```opensips
...
if (client_nat_test(3)) {
    fix_contact();
}
...
```

### `nat_keepalive()`

Trigger keepalive functionality for the source address of the request. When called it only sets some internal flags, which will trigger later the addition of the endpoint to the keepalive list if a positive reply is generated/received (for REGISTER and SUBSCRIBE) or when the dialog is started/replied (for INVITEs). For this reason, it can be called early or late in the script. The only condition is to call it before replying to the request or before sending it to another proxy. If the request needs to be sent to another proxy, t_relay() must be used to be able to intercept replies via TM or dialog callbacks. If stateless forwarding is used, the keepalive functionality will not work. Also for outgoing INVITEs, record_route() should also be used to make sure the proxy that keeps the caller endpoint alive stays in the path. For multi-proxy setups, this function should always be called on the border proxies (the ones that received the request directly from the user agent). For more details about this function, see the _Implementation_ subsection from the _Keepalive functionality_ section.

**Usable from:** REQUEST_ROUTE

**Related:**

- `client_nat_test`
- `record_route`
- `t_relay`

**Example.** Using the `nat_keepalive` function.

```opensips
...
if (($rm=="REGISTER" || $rm=="SUBSCRIBE" ||
    ($rm=="INVITE" && !has_totag())) && client_nat_test(3))
{
    nat_keepalive();
}
...
```

## Exported Pseudo-Variables

### `$keepalive.socket(nat_endpoint)`

Returns the local socket used to send messages to the given NAT endpoint URI. The socket has the form proto:ip:port. The NAT endpoint URI is in the form: sip:ip:port\[;transport=xxx\] with transport missing if UDP. If the requested NAT endpoint URI is present in the internal keepalive table for any condition, it will return its associated local socket, else it will return null. The nat\_endpoint can be a string or another pseudo-variable. This can be useful to restore the sending socket when relaying messages to a given user agent in multi-proxy environments. Consider an example where 2 proxies are involved, P1 and P2. A user agent registers by sending a REGISTER request to P1. P1 will call nat\_keepalive() but because it determines that P2 should actually handle the user registration will forward the request to P2. Now assume P2 receives an incoming INVITE for this user. It will determine that the registration came through P1 and will forward the request to P1. P2 should also include the NAT endpoint URI where this request is to be relayed. This information should have been provided by P1 when it relayed the REGISTER request to P2. The means to do this is out of the scope of this example, but one can either use the path extension or custom headers to do this. When P1 receives the INVITE it will use the NAT endpoint URI it has received along with the request to determine the socket to send out the request, which should be the same as the one where the registration request was originally received. In the example below lets assume that P2 provided the original NAT endpoint address in a custom header called X-NAT-URI and that it also provides a custom header called X-Scope to indicate that the message is sent to P1 for being relayed back to the user agent by P1 which has the NAT open with it.

**Example 1.11. Using `$keepalive.socket` in multi-proxy environments**

...
# This code runs on P1 which has received an INVITE from P2 to forward
# it to the user agent behind NAT (because P1 has the NAT open with it).
if ($rm=="INVITE" && $hdr(X-Scope)=="nat-relay") {
    $du = $hdr(X-NAT-URI);
    $fs = $keepalive.socket($du);
    t\_relay();
    exit;
}
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- proto:ip:port
- null
### `$nat_traversal.track_dialog`

Returns a boolean value (0 or 1) indicating if dialog tracking will be enabled by the nat\_traversal module. The nat\_traversal module will always track the dialog (by calling create\_dialog internally) unless told otherwise. This is an advanced setting which is only meant to be used by multi-proxy setups where a proxy doesn't want to keep track of a dialog, that is, if it won't stay in the signaling path. By setting this pv to 0 the nat\_traversal module will not attempt to create the dialog.

- **Type:** boolean
- **Read/write:** read-write
- **Scope:** 

**Possible values:**

- 0
- 1
### `$source_uri`

Returns the URI specification from where a request was received in the form sip:ip:port\[;transport=xxx\] with transport missing if UDP. This pseudo-variable can be used to set the received AVP for the registrar module to indicate that a user agent is behind NAT. This is meant as a more flexible replacement for the fix\_nated\_register() function, because it allows one to modify the source uri by appending some extra parameters before saving it to the received AVP. Another use for this pseudo-variable is in multi-proxy environments to indicate the NAT endpoint URI to the next proxy (if needed). Consider the previous example with two proxies P1 and P2. P1 receives the REGISTER request from a user agent and forwards it to P2 which does the actual registration. P1 needs to indicate the NAT endpoint URI to P2, so that P2 can include it later for incoming INVITE requests to this user agent.

**Example 1.12. Using `$source_uri` to set the received AVP on registrars**

...
modparam("registrar", "received\_avp", "$avp(received\_uri)")
modparam("registrar", "tcp\_persistent\_flag", 10)
...
# This code runs on the registrar, assuming it has received the
# REGISTER request directly from the user agent.
if ($rm=="REGISTER") {
    if (client\_nat\_test(3)) {
        if ($socket\_in(proto)==UDP) {
            nat\_keepalive();
        } else {
            # Keep TCP/TLS connections open until the registration
            # expires, by setting the tcp\_persistent\_flag
            setflag(10);
        }
        force\_rport();
        $avp(received\_uri) = $source\_uri;
        # or we could add some extra parameters to it if needed
        # $avp(received\_uri) = $source\_uri + ";relayed=false" 
    }
    if (!www\_authorize("", "subscriber")) {
        www\_challenge("", "0");
        return;
    } else if ($au!=$tU) {
        sl\_send\_reply("403", "Username!=To not allowed ($au!=$tU)");
        return;
    }

    if (!save("location")) {
        sl\_reply\_error();
    }
    exit;
}
...

**Example 1.13. Using `$source_uri` in multi-proxy environments**

...
# This code runs on P1 which received the REGISTER request and has to
# forward it to the registrar P2.
if ($rm=="REGISTER") {
    if (client\_nat\_test(3)) {
        force\_rport();
        nat\_keepalive();
        append\_hf("X-NAT-URI: $source\_uri\r\n");
    }
    $du = "sip:P2\_ip:P2\_port";
    t\_relay();
    exit;
}
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

**Possible values:**

- sip:ip:port
- sip:ip:port;transport=xxx

## Exported Statistics

### `dialog_endpoints`

Indicates how many of the NAT endpoints are kept alive for taking part in an INVITE dialog.

- **Type:** gauge
### `keepalive_endpoints`

Indicates the total number of NAT endpoints that are being kept alive.

- **Type:** gauge
### `registered_endpoints`

Indicates how many of the NAT endpoints are kept alive for registrations.

- **Type:** gauge
### `subscribed_endpoints`

Indicates how many of the NAT endpoints are kept alive for subscriptions.

- **Type:** gauge

## Configuration Examples

### Setting the `keepalive_interval` parameter

Setting the `keepalive_interval` parameter

```opensips
...
modparam("nat\_traversal", "keepalive\_interval", 90)
...
```
### Setting the `keepalive_method` parameter

Setting the `keepalive_method` parameter

```opensips
...
modparam("nat\_traversal", "keepalive\_method", "OPTIONS")
...
```
### Setting the `keepalive_from` parameter

Setting the `keepalive_from` parameter

```opensips
...
modparam("nat\_traversal", "keepalive\_from", "sip:keepalive@my-domain.com")
...
```
### Setting the `keepalive_extra_headers` parameter

Setting the `keepalive_extra_headers` parameter

```opensips
...
modparam("nat\_traversal", "keepalive\_extra\_headers", "User-Agent: OpenSIPS\r\nX-MyHeader: some\_value\r\n")
...
```
### Setting the `keepalive_state_file` parameter

Setting the `keepalive_state_file` parameter

```opensips
...
modparam("nat\_traversal", "keepalive\_state\_file", "/run/opensips/keepalive\_state")
...
```
### Set `cluster_id` parameter

Set `cluster_id` parameter

```opensips
...
# Be part of cluster ID 9
modparam("nat\_traversal", "cluster\_id", 9)
...
```
### Set `cluster_sharing_tag` parameter

Set `cluster_sharing_tag` parameter

```opensips
...
# only the node with the active "vip" sharing tag will perform pinging
modparam("nat\_traversal", "cluster\_id", 9)
modparam("nat\_traversal", "cluster\_sharing\_tag", "vip")
...
```
### Using the `client_nat_test` function

Using the `client_nat_test` function

```opensips
...
if (client\_nat\_test(3)) {
    .....
}
...
```
### Using the `fix_contact` function

Using the `fix_contact` function

```opensips
...
if (client\_nat\_test(3)) {
    fix\_contact();
}
...
```
### Using the `nat_keepalive` function

Using the `nat_keepalive` function

```opensips
...
if (($rm=="REGISTER" || $rm=="SUBSCRIBE" ||
    ($rm=="INVITE" && !has\_totag())) && client\_nat\_test(3))
{
    nat\_keepalive();
}
...
```
### Using `$keepalive.socket` in multi-proxy environments

Using `$keepalive.socket` in multi-proxy environments

```opensips
...
# This code runs on P1 which has received an INVITE from P2 to forward
# it to the user agent behind NAT (because P1 has the NAT open with it).
if ($rm=="INVITE" && $hdr(X-Scope)=="nat-relay") {
    $du = $hdr(X-NAT-URI);
    $fs = $keepalive.socket($du);
    t\_relay();
    exit;
}
...
```
### Using `$source_uri` to set the received AVP on registrars

Using `$source_uri` to set the received AVP on registrars

```opensips
...
modparam("registrar", "received\_avp", "$avp(received\_uri)")
modparam("registrar", "tcp\_persistent\_flag", 10)
...
# This code runs on the registrar, assuming it has received the
# REGISTER request directly from the user agent.
if ($rm=="REGISTER") {
    if (client\_nat\_test(3)) {
        if ($socket\_in(proto)==UDP) {
            nat\_keepalive();
        } else {
            # Keep TCP/TLS connections open until the registration
            # expires, by setting the tcp\_persistent\_flag
            setflag(10);
        }
        force\_rport();
        $avp(received\_uri) = $source\_uri;
        # or we could add some extra parameters to it if needed
        # $avp(received\_uri) = $source\_uri + ";relayed=false" 
    }
    if (!www\_authorize("", "subscriber")) {
        www\_challenge("", "0");
        return;
    } else if ($au!=$tU) {
        sl\_send\_reply("403", "Username!=To not allowed ($au!=$tU)");
        return;
    }

    if (!save("location")) {
        sl\_reply\_error();
    }
    exit;
}
...
```
### Using `$source_uri` in multi-proxy environments

Using `$source_uri` in multi-proxy environments

```opensips
...
# This code runs on P1 which received the REGISTER request and has to
# forward it to the registrar P2.
if ($rm=="REGISTER") {
    if (client\_nat\_test(3)) {
        force\_rport();
        nat\_keepalive();
        append\_hf("X-NAT-URI: $source\_uri\r\n");
    }
    $du = "sip:P2\_ip:P2\_port";
    t\_relay();
    exit;
}
...
```
