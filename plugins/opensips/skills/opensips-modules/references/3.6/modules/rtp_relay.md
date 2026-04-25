# rtp_relay Module Reference
<!-- generated-from: data/3.6/modules/rtp_relay.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 rtp_relay module. Read this file when configuring or debugging the rtp_relay module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The purpose of this module is to simplify the usage of different RTP Relays Servers (such as RTPProxy, RTPEngine, Media Proxy) in OpenSIPS scripting, as well as to provide various complex features that rely on the usage of RTP relays (such as media re-anchoring).

The module provides the logic to engage a specific RTP relay in a call during initial INVITE, and then it will handle the entire communication with the RTP relay, until the call terminates.

Moreover, one can specify various flags that modify the way RTP engines use each user agent's SDP - these flags are persistent throughout the entire RTP session, and are being used for further in-dialog requests. These flags can be specified through the [$rtp_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") and/or [$rtp_relay_peer](#pv_rtp_relay_peer "1.8.2.�$rtp_relay_peer") variables at initial INVITE, and are then passed along with the RTP relay context until the end of the call. They can also be modified during sequential in-dialog requests.

This is not a stand-alone module that communicates directly with RTP relays, but rather a generic interface that is able to interact with the modules that interact with each specific RTP Relay (such as _rtpproxy_ or _rtpengine_) and implement their specific communication protocol.

## How It Works

The module is able to handle RTP relay for multiple branches, with different flags flavors. Each branch can have its flags tuned through the [$rtp_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable - if the variable is provisioned in the main route, then the flags are inherited by all further branches, unless specifically modified per branch. To modify a specific branch, one needs to specify the desired branch index as variable index (i.e. _$(rtp_relay[1]) = "cor"_). When provisioned in a branch route, the flags are only changed for that specific branch.

Starting with OpenSIPS 3.3, branches can be identified based on their participant's to_tag. This features becomes handy when using _rtp_relay_ in B2B mode, where peers can no longer be identified simply by an index. However, this feature works in dialog secenatios as well.

The multiple branches behavior is handled differently by the back-end engine, depending on its capabilities. For example, _rtpengine_ is able to natively support calls with multiple branches, whereas for _rtpproxy_, each branch is emulated in a different session with a different call-id.

When the call gets answered and a single branch remains active, all the other branches are destroyed and only the established branches remain active throughout the call.

The module does not perform any SDP mangling itself, it is just an enabler of the different backends supported, such as RTPProxy or RTPEngine. These backends are called RTP Relay angines and they need to be specified when RTP Relay is being engaged.

Starting with OpenSIPS 3.6, the module has been enhanced with an internal RTP Engine, which can be used to perform _manual/custom_ SDP mangling by running a set of routes when an RTP event (such as offer, answer, delete) happens. This can be enabled by engaging RTP Relay with the _route_ engine. If the defined routes are not being defined, then the SDP does not change. For more information, please check the [route_offer](#param_route_offer "1.5.1.�route_offer (string)"), [route_answer](#param_route_answer "1.5.2.�route_answer (string)") and [route_delete](#param_route_delete "1.5.3.�route_delete (string)") parameters.

## Dependencies

### OpenSIPs Modules

- `Dialog` — used to keep track of in-dialog requests
- `RTP Relay module(s)` — such rtpproxy, or rtpengine, or any module that implements the rtp_relay interface

### External Libraries

None.

## Exported Parameters

### `route_answer` (string)

Route that is being run when an SDP answer happens (i.e. a 183 or 200 OK reply with SDP is being processed).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route.
    
*   _ip_ - optional, the IP being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _type_ - optional, the RTP type being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _in-iface_ - optional, the inbound interface that should be used for this peer.
    
*   _out-iface_ - optional, the outbound interface that should be used for this peer.
    
*   _ctx->flags_ - optional, global flags that are being specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    
*   _flags_ - optional, flags specified for this peer.
    
*   _peer_ - optional, peer flags specified for the corresponding peer;
    
When running the route, the following values are expected to be returned:

*   _body_ - the newly created body to be answered. If not returned, the body is left unchanged.

*Default value is rtp_relay_answer.*

**Example.** custom_rtp_answer.

```opensips
...
modparam("rtp\_relay", "route\_answer", "custom\_rtp\_answer")
...
```
### `route_copy_answer` (string)

Route that is being run when an SDP for the copied stream is received. (i.e. a CANCEL or BYE is received).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _flags_ - optional, flags that are being specified by the module which is copying the SDP.
    
*   _copy-ctx_ - optional, an copy context identifier - this is a user populated value returned at the end of _route\_copy\_offer_ execution.

*Default value is rtp_relay_copy_answer.*

**Example.** custom_rtp_copy_answer.

```opensips
...
modparam("rtp\_relay", "route\_copy\_answer", "custom\_rtp\_copy\_answer")
...
```
### `route_copy_delete` (string)

Route that is being run when media fork should be removed.

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _flags_ - optional, flags that are being specified by the module which is copying the SDP.
    
*   _copy-ctx_ - optional, an copy context identifier - this is a user populated value returned at the end of _route\_copy\_offer_ execution.
    
Return values are not needed.

*Default value is rtp_relay_copy_delete.*

**Example.** custom_rtp_copy_delete.

```opensips
...
modparam("rtp\_relay", "route\_copy\_delete", "custom\_rtp\_copy\_delete")
...
```
### `route_copy_offer` (string)

Route that is being executed when a new call's SDP is being copied.

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _flags_ - optional, flags that are being specified by the module which is copying the SDP.
    
*   _copy-ctx_ - optional, an copy context identifier - this is a user populated value returned after running a _route\_copy\_offer_ route (see the return values section below).
    
When running the route, the following values are expected to be returned:

*   _copy-ctx_ - optional, a copy context identifier that can be later used to identify the current copy session.

*Default value is rtp_relay_copy_offer.*

**Example.** custom_rtp_copy_offer.

```opensips
...
modparam("rtp\_relay", "route\_copy\_offer", "custom\_rtp\_copy\_offer")
...
```
### `route_delete` (string)

Route that is being run when media should be disconnected (i.e. a CANCEL or BYE is received).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _ctx->flags_ - optional, global flags that are being specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    
*   _delete_ - optional, delete flags specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    
Return values are not needed.

*Default value is rtp_relay_delete.*

**Example.** custom_rtp_delete.

```opensips
...
modparam("rtp\_relay", "route\_delete", "custom\_rtp\_delete")
...
```
### `route_offer` (string)

Route that is being run when an SDP offer happens (i.e. an INVITE with SDP is being processed).

When the route is executed, the following parameters are being populated:

*   _callid_ - the callid of the call being processed.
    
*   _from\_tag_ - the from\_tag of the call being processed.
    
*   _to\_tag_ - the to\_tag, if exists, of the call being processed.
    
*   _branch_ - the branch that RTP relay is being engaed on - if engaged in the main branch, _\-1_ is used.
    
*   _body_ - optional, if an explicit body is being used, otherwise the message's body should be considered.
    
*   _set_ - the rtp relay set being used for the call.
    
*   _node_ - optional, an node Engine idenfifier - this is a user populated value returned after running a _route\_offer_ route (see the return values section below).
    
*   _ip_ - optional, the IP being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _type_ - optional, the RTP type being specified in the [$rtp\_relay](#pv_rtp_relay "1.8.1.�$rtp_relay") variable for the current peer.
    
*   _in-iface_ - optional, the inbound interface that should be used for this peer.
    
*   _out-iface_ - optional, the outbound interface that should be used for this peer.
    
*   _ctx-flags_ - optional, global flags that are being specified in the [$rtp\_relay\_ctx](#pv_rtp_relay_ctx "1.8.3.�$rtp_relay_ctx()") variable.
    
*   _flags_ - optional, flags specified for this peer.
    
*   _peer_ - optional, peer flags specified for the corresponding peer;
    
When running the route, the following values are expected to be returned:

*   _body_ - the newly created body to be offered. If not returned, the body is left unchanged.
    
*   _node_ - optional, a node to be identified for further routes/commands executed.

*Default value is rtp_relay_offer.*

**Example.** custom_rtp_offer.

```opensips
...
modparam("rtp\_relay", "route\_offer", "custom\_rtp\_offer")
...
```

## Exported Functions

### `rtp_relay_engage(engine, [set])`

Engages the RTP Relay engine for the current initial INVITE. After calling this function, the entire RTP relay communication will be handled by the module itself, without having to intervene for any further in-dialog requests/replies (unless you specifically want to).

The function is not performing the media requests on the spot, but rather registers the hooks to automatically handle any further media requests.

The RTP session modifiers used are the ones provisioned through the $rtp_relay and/or $rtp_relay_peer variables.

The function can be called from the main request route - in this case the RTP relay will be engaged for any further branches created, or from the branch route - in this case the RTP relay will only be engaged for the branch where it was called, or that has an associated rtp_relay provisioned.

**Parameters:**

- `engine` *(string, required)* — the RTP relay engine to be used for the call (i.e. rtpproxy, rtpengine or route)
  - `rtpproxy`
  - `rtpengine`
  - `route`
- `set` *(int, optional)* — the set used for this call.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** rtp_relay_engage usage.

```opensips
...
if (is_method("INVITE") && !has_totag()) {
	xlog("SCRIPT: engaging RTPProxy relay for all branches\n");
	$rtp_relay = "co";
	$rtp_relay_peer = "co";
	rtp_relay_engage("rtpproxy");
}
...
```

## Exported Pseudo-Variables

### `$rtp_relay`

Is used to provision the RTP back-end flags for the current peer - if used in the initial INVITE REQUEST route, it provisions the flags of the caller, whereas if used in the initial INVITE BRANCH/REPLY route, it provisions the callee's flags.

For a sequential request, the variable represents the flags used for the UAC that generated the request. When used in a reply, the other UAC's flags are provisioned.

In an initial INVITE scope, the variable can be provisioned per branch, by using the variable's index.

For each UAC/peer, there are several flags that can be configured:

*   _flags_ (default, when variable is used without a name) - are the flags associated with the current UAC - they are passed along with the offer command
    
*   _peer_ - these flags are passed along in the offer command, but they are flags associated with the other UAC/peer
    
*   _ip_ - the IP that should be advertised in the resulted SDP.
    
*   _type_ - the RTP type used by the current UAC (currently only used by _rtpengine_)
    
*   _iface_ - the interface used for the traffic coming from this UAC.
    
*   _body_ - the body to be used for the UAC.
    
*   _delete_ - flags to be used when the media session is terminated/deleted.
    
*   _disabled_ - provisioned as an integer, it is used to disable RTP relay for this UAC.

- **Type:** string
- **Read/write:** read-write
- **Scope:** request, reply, branch, transaction
### `$rtp_relay_ctx()`

This variable can be used to provide information about the RTP context, information that is not associated with any of the involved peers.

The following settings can be used:

*   _callid_ - The callid to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _from_tag_ - The from-tag to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _to_tag_ - The to-tag to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _flags_ - Generic flags to be sent to all offer/answer requests.
    
*   _delete_ - flags sent when the relay session is terminated.

- **Type:** string
- **Read/write:** read-write
- **Scope:** request, reply, dialog, transaction
### `$rtp_relay_peer`

This variable has the same meaning and parameters as the $rtp_relay variable, except that it is used to provision the other UAC's flags, except the current one. All other fields are similar.

- **Type:** string
- **Read/write:** read-write
- **Scope:** request, reply, branch, transaction

## Exported MI Functions

### `rtp_relay_list`

Lists all the RTP Relay sessions engaged.

**Parameters:**

- `engine` *(string, optional)* — the RTP relay engine (i.e. rtpproxy or rtpengine).
- `node` *(string, optional)* — the RTP relay node. When used, the engine parameter must also be specified.
- `set` *(string, optional)* — the RTP relay set. When used, the engine parameter must also be specified.

**Example.** list all sessions

```opensips
$ opensips-cli -x mi rtp\_relay\_list
```

**Example.** list all sessions going through a specific RTP node

```opensips
$ opensips-cli -x mi rtp\_relay\_list rtpproxy udp:127.0.0.1:2222
```

### `rtp_relay_update`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

This function can be used to trigger dialog in-dialog updates for certain ongoing RTP sessions. For all matched sessions, it re-engages an RTP Relay offer/answer session, then sends re-INVITEs to call's participants to with the updated SDP.

Note:Running the command without a filter (such as engine or set) will cause all RTP relay sessions to be re-engaged.

Note:When enforcing a new node, it is not guaranteed to be used - if the node is not avaialble, but a different one is, the active one will be chosen.

Note:If the node is being changed, the module tries to unforce the previous RTP relay session, even though it might not work.

**Parameters:**

- `engine` *(string, optional)* — the RTP relay engine (i.e. rtpproxy or rtpengine) to be used as filter.
- `new_node` *(string, optional)* — a new RTP node to be used for the call. If new_set is missing, the same set will be used.
- `new_set` *(string, optional)* — a new RTP Relay set to be used for the call.
- `node` *(string, optional)* — the RTP relay node to be used as filter.
- `set` *(string, optional)* — the RTP relay set to be used as filter. If missing, the same set will be used as it was initially engaged for.

**Example.** update all sessions that are using rtpproxy

```opensips
$ opensips-cli -x mi rtp\_relay\_update rtpproxy
```

### `rtp_relay_update_callid`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

The function basically works in the same manner as rtp_relay_update, but is to be used to update a specific callid. In addition, one can also update the engine and flags used for the particular session.

**Parameters:**

- `callid` *(string, required)* — the callid used to match the dialog to be updated.
- `engine` *(string, optional)* — the new RTP relay engine (i.e. rtpproxy or rtpengine) to be used. If missing, the same initial engine is used.
- `flags` *(string, optional)* — a JSON contining the caller and/or callee nodes, which contain new flags that should be used for the session. Only explicitely specified flags will be overwritten.
- `node` *(string, optional)* — the RTP relay node to be used. If not specified, the first available node is used.
- `set` *(string, optional)* — the new RTP relay set to be used. If missing, the default same set will be used as it was initially engaged for.

**Example.** update a call with a working RTPproxy node

```opensips
$ opensips-cli -x mi rtp\_relay\_update\_callid 1-3758963@127.0.0.1 rtpproxy
```

**Example.** update a call to use RTPEngine with a SRTP SDP for caller

```opensips
$ opensips-cli -x mi rtp\_relay\_update\_callid callid=1-3758963@127.0.0.1 \\
	flags='{ "caller":{"type":"SRTP", "flags":"replace-origin"},
		"callee":{"type":"RTP", "flags"="replace-origin"}}'
```

## Configuration Examples

### Set `route_offer` parameter

Set `route_offer` parameter

```opensips
modparam("rtp\_relay", "route\_offer", "custom\_rtp\_offer")
```
### `route_offer` route usage

`route_offer` route usage

```opensips
route[rtp\_relay\_offer] {
	# manually engaging RTPEngine, get the SDP, and replace it in the message
	return (1, $var(body));
}
```
### Set `route_answer` parameter

Set `route_answer` parameter

```opensips
modparam("rtp\_relay", "route\_answer", "custom\_rtp\_answer")
```
### `route_answer` route usage

`route_answer` route usage

```opensips
route[rtp\_relay\_answer] {
	# again, manually engaging RTPEngine
	rtpengine\_answer(,, $var(body), $rb);
	return (1, $var(body));
}
```
### Set `route_delete` parameter

Set `route_delete` parameter

```opensips
modparam("rtp\_relay", "route\_delete", "custom\_rtp\_delete")
```
### `rtp_relay_delete` route usage

`rtp_relay_delete` route usage

```opensips
route[rtp\_relay\_delete] {
	# manually removing RTPEngine session
	rtpengine\_delete();
}
```
### Set `rtp_relay_copy_offer` parameter

Set `rtp_relay_copy_offer` parameter

```opensips
modparam("rtp\_relay", "route\_copy\_offer", "custom\_rtp\_copy\_offer")
```
### Set `rtp_relay_copy_offer` usage

Set `rtp_relay_copy_offer` usage

```opensips
route[rtp\_relay\_copy\_offer] {
	# instruct a media engine to fork media and assign an identifier
	# that shall be stored in the $var(handle) variable
	return (1, $var(handle));
}
```
### Set `rtp_relay_copy_answer` parameter

Set `rtp_relay_copy_answer` parameter

```opensips
modparam("rtp\_relay", "route\_copy\_answer", "custom\_rtp\_copy\_answer")
```
### Set `rtp_relay_copy_answer` usage

Set `rtp_relay_copy_answer` usage

```opensips
route[rtp\_relay\_copy\_answer] {
	# feed the received $param(body) to the media engine that is forking the call
	# copy instance is identified by the $param(copy-ctx) variable
}
```
### Set `rtp_relay_copy_delete` parameter

Set `rtp_relay_copy_delete` parameter

```opensips
modparam("rtp\_relay", "route\_copy\_delete", "custom\_rtp\_copy\_delete")
```
### Set `rtp_relay_copy_delete` usage

Set `rtp_relay_copy_delete` usage

```opensips
route[rtp\_relay\_copy\_delete] {
	# remove the copy instance is identified by the $param(copy-ctx) variable
}
```
### `rtp_relay_engage` usage

`rtp_relay_engage` usage

```opensips
if (is\_method("INVITE") && !has\_totag()) {
	xlog("SCRIPT: engaging RTPProxy relay for all branches\\n");
	$rtp\_relay = "co";
	$rtp\_relay\_peer = "co";
	rtp\_relay\_engage("rtpproxy");
}
```
### `rtp_relay_list` usage

`rtp_relay_list` usage

```opensips
## list all sessions
$ opensips-cli -x mi rtp\_relay\_list

## list all sessions going through a specific RTP node
$ opensips-cli -x mi rtp\_relay\_list rtpproxy udp:127.0.0.1:2222
```
### `rtp_relay_update` usage

`rtp_relay_update` usage

```opensips
## update all sessions that are using rtpproxy
$ opensips-cli -x mi rtp\_relay\_update rtpproxy
```
### `rtp_relay_update_callid` usage

`rtp_relay_update_callid` usage

```opensips
## update a call with a working RTPproxy node
$ opensips-cli -x mi rtp\_relay\_update\_callid 1-3758963@127.0.0.1 rtpproxy

## update a call to use RTPEngine with a SRTP SDP for caller
$ opensips-cli -x mi rtp\_relay\_update\_callid callid=1-3758963@127.0.0.1 \\
	flags='{ "caller":{"type":"SRTP", "flags":"replace-origin"},
		"callee":{"type":"RTP", "flags"="replace-origin"}}'
```
