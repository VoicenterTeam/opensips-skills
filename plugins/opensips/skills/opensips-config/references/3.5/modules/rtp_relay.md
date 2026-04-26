# rtp_relay Module Reference
<!-- generated-from: data/3.5/modules/rtp_relay.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 rtp_relay module. Read this file when configuring or debugging the rtp_relay module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The purpose of this module is to simplify the usage of different RTP Relays Servers (such as RTPProxy, RTPEngine, Media Proxy) in OpenSIPS scripting, as well as to provide various complex features that rely on the usage of RTP relays (such as media re-anchoring).

## How It Works

The module provides the logic to engage a specific RTP relay in a call during initial INVITE, and then it will handle the entire communication with the RTP relay, until the call terminates.

Moreover, one can specify various flags that modify the way RTP engines use each user agent's SDP - these flags are persistent throughout the entire RTP session, and are being used for further in-dialog requests. These flags can be specified through the $rtp_relay and/or $rtp_relay_peer variables at initial INVITE, and are then passed along with the RTP relay context until the end of the call. They can also be modified during sequential in-dialog requests.

This is not a stand-alone module that communicates directly with RTP relays, but rather a generic interface that is able to interact with the modules that interact with each specific RTP Relay (such as rtpproxy or rtpengine) and implement their specific communication protocol.

The module is able to handle RTP relay for multiple branches, with different flags flavors. Each branch can have its flags tuned through the $rtp_relay variable - if the variable is provisioned in the main route, then the flags are inherited by all further branches, unless specifically modified per branch. To modify a specific branch, one needs to specify the desired branch index as variable index (i.e. $(rtp_relay[1]) = "cor"). When provisioned in a branch route, the flags are only changed for that specific branch.

Starting with OpenSIPS 3.3, branches can be identified based on their participant's to_tag. This features becomes handy when using rtp_relay in B2B mode, where peers can no longer be identified simply by an index. However, this feature works in dialog secenatios as well.

The multiple branches behavior is handled differently by the back-end engine, depending on its capabilities. For example, rtpengine is able to natively support calls with multiple branches, whereas for rtpproxy, each branch is emulated in a different session with a different call-id.

When the call gets answered and a single branch remains active, all the other branches are destroyed and only the established branches remain active throughout the call.

## Dependencies

### OpenSIPs Modules

- `Dialog` — used to keep track of in-dialog requests
- `RTP Relay module(s)` — such rtpproxy, or rtpengine, or any module that implements the rtp_relay interface

### External Libraries

None.

## Exported Functions

### `rtp_relay_engage(engine, [set])`

Engages the RTP Relay _engine_ for the current initial INVITE. After calling this function, the entire RTP relay communication will be handled by the module itself, without having to intervene for any further in-dialog requests/replies (unless you specifically want to).

The function is not performing the media requests on the spot, but rather registers the hooks to automatically handle any further media requests.

The RTP session modifiers used are the ones provisioned through the [$rtp_relay](#pv_rtp_relay "1.6.1.$rtp_relay") and/or [$rtp_relay_peer](#pv_rtp_relay_peer "1.6.2.$rtp_relay_peer") variables.

The function can be called from the main request route - in this case the RTP relay will be engaged for any further branches created, or from the branch route - in this case the RTP relay will only be engaged for the branch where it was called, or that has an associated _rtp_relay_ provisioned.

**Parameters:**

- `engine` *(string, required)* — the RTP relay engine to be used for the call (i.e. rtpproxy.
- `set` *(int, optional)* — the set used for this call.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE

**Example.** `rtp_relay_engage` usage.

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
- **Scope:** initial INVITE REQUEST route, initial INVITE BRANCH/REPLY route, sequential request, reply

**Possible values:**

- flags
- peer
- ip
- type
- iface
- body
- delete
- disabled
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
- **Scope:** 

**Possible values:**

- callid
- from_tag
- to_tag
- flags
- delete
### `$rtp_relay_peer`

This variable has the same meaning and parameters as the [$rtp_relay](#pv_rtp_relay "1.6.1.$rtp_relay") variable, except that it is used to provision the other UAC's flags, except the current one. All other fields are similar.

- **Type:** string
- **Read/write:** read-write
- **Scope:** initial INVITE REQUEST route, initial INVITE BRANCH/REPLY route, sequential request, reply

**Possible values:**

- flags
- peer
- ip
- type
- iface
- body
- delete
- disabled

## Exported MI Functions

### `rtp_relay_list`

Lists all the RTP Relay sessions engaged.

**Parameters:**

- `engine` *(string, optional)* — the RTP relay engine (i.e. _rtpproxy_ or _rtpengine_).
- `node` *(string, optional)* — the RTP relay node. When used, the _engine_ parameter must also be specified.
- `set` *(string, optional)* — the RTP relay set. When used, the _engine_ parameter must also be specified.

**Example.** list all sessions

```opensips-cli
$ opensips-cli -x mi rtp_relay_list
```

**Example.** list all sessions going through a specific RTP node

```opensips-cli
$ opensips-cli -x mi rtp_relay_list rtpproxy udp:127.0.0.1:2222
```

### `rtp_relay_update`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

This function can be used to trigger dialog in-dialog updates for certain ongoing RTP sessions. For all matched sessions, it re-engages an RTP Relay offer/answer session, then sends re-INVITEs to call's participants to with the updated SDP.

_Note:_Running the command without a filter (such as _engine_ or _set_) will cause all RTP relay sessions to be re-engaged.

_Note:_When enforcing a new node, it is not guaranteed to be used - if the node is not avaialble, but a different one is, the active one will be chosen.

_Note:_If the node is being changed, the module tries to unforce the previous RTP relay session, even though it might not work.

**Parameters:**

- `engine` *(string, optional)* — the RTP relay engine (i.e. _rtpproxy_ or _rtpengine_) to be used as filter.
- `new_node` *(string, optional)* — a new RTP node to be used for the call. If _new_set_ is missing, the same set will be used.
- `new_set` *(string, optional)* — a new RTP Relay set to be used for the call.
- `node` *(string, optional)* — the RTP relay node to be used as filter.
- `set` *(string, optional)* — the RTP relay set to be used as filter. If missing, the same set will be used as it was initially engaged for.

**Example.** update all sessions that are using rtpproxy

```opensips-cli
$ opensips-cli -x mi rtp_relay_update rtpproxy
```

### `rtp_relay_update_callid`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

The function basically works in the same manner as [rtp_relay_update](#mi_rtp_relay_update "1.5.2.rtp_relay_update"), but is to be used to update a specific callid. In addition, one can also update the _engine_ and _flags_ used for the particular session.

**Parameters:**

- `callid` *(string, required)* — the callid used to match the dialog to be updated.
- `engine` *(string, optional)* — the new RTP relay engine (i.e. _rtpproxy_ or _rtpengine_) to be used. If missing, the same initial engine is used.
- `flags` *(string, optional)* — a JSON contining the _caller_ and/or _callee_ nodes, which contain new flags that should be used for the session. Only explicitely specified flags will be overwritten.
- `node` *(string, optional)* — the RTP relay node to be used. If not specified, the first available node is used.
- `set` *(string, optional)* — the new RTP relay set to be used. If missing, the default same set will be used as it was initially engaged for.

**Example.** update a call with a working RTPproxy node

```opensips-cli
$ opensips-cli -x mi rtp_relay_update_callid 1-3758963@127.0.0.1 rtpproxy
```

**Example.** update a call to use RTPEngine with a SRTP SDP for caller

```opensips-cli
$ opensips-cli -x mi rtp_relay_update_callid callid=1-3758963@127.0.0.1 \
flags='{ "caller":{"type":"SRTP", "flags":"replace-origin"},
	"callee":{"type":"RTP", "flags"="replace-origin"}}'
```

## Configuration Examples

### `rtp_relay_engage` usage

Engaging the RTP Relay engine for an initial INVITE.

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
### `rtp_relay_list` usage

Listing all RTP Relay sessions or sessions going through a specific RTP node.

```opensips
...
## list all sessions
$ opensips-cli -x mi rtp_relay_list

## list all sessions going through a specific RTP node
$ opensips-cli -x mi rtp_relay_list rtpproxy udp:127.0.0.1:2222
...
```
### `rtp_relay_update` usage

Updating all sessions that are using rtpproxy.

```opensips
...
## update all sessions that are using rtpproxy
$ opensips-cli -x mi rtp_relay_update rtpproxy
...
```
### `rtp_relay_update_callid` usage

Updating a call with a working RTPproxy node or updating a call to use RTPEngine with specific flags.

```opensips
...
## update a call with a working RTPproxy node
$ opensips-cli -x mi rtp_relay_update_callid 1-3758963@127.0.0.1 rtpproxy

## update a call to use RTPEngine with a SRTP SDP for caller
$ opensips-cli -x mi rtp_relay_update_callid callid=1-3758963@127.0.0.1 \
	flags='{ "caller":{"type":"SRTP", "flags":"replace-origin"},
		"callee":{"type":"RTP", "flags"="replace-origin"}}'
...
```
