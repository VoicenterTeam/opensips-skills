# RTP Relay Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5655376)

2.2. [Most recently active contributors(1) to this module](#idp5727984)

**List of Examples**

1.1. [`rtp_relay_engage` usage](#idp5529792)

1.2. [`rtp_relay_list` usage](#idp5540384)

1.3. [`rtp_relay_update` usage](#idp5555328)

1.4. [`rtp_relay_update_callid` usage](#idp5568720)

## Chapter�1.�Admin Guide

## 1.1.�Overview

The purpose of this module is to simplify the usage of different RTP Relays Servers (such as RTPProxy, RTPEngine, Media Proxy) in OpenSIPS scripting, as well as to provide various complex features that rely on the usage of RTP relays (such as media re-anchoring).

The module provides the logic to engage a specific RTP relay in a call during initial INVITE, and then it will handle the entire communication with the RTP relay, until the call terminates.

Moreover, one can specify various flags that modify the way RTP engines use each user agent's SDP - these flags are persistent throughout the entire RTP session, and are being used for further in-dialog requests. These flags can be specified through the [$rtp\_relay](#pv_rtp_relay "1.6.1.�$rtp_relay") and/or [$rtp\_relay\_peer](#pv_rtp_relay_peer "1.6.2.�$rtp_relay_peer") variables at initial INVITE, and are then passed along with the RTP relay context until the end of the call. They can also be modified during sequential in-dialog requests.

This is not a stand-alone module that communicates directly with RTP relays, but rather a generic interface that is able to interact with the modules that interact with each specific RTP Relay (such as _rtpproxy_ or _rtpengine_) and implement their specific communication protocol.

## 1.2.�Multiple Branches

The module is able to handle RTP relay for multiple branches, with different flags flavors. Each branch can have its flags tuned through the [$rtp\_relay](#pv_rtp_relay "1.6.1.�$rtp_relay") variable - if the variable is provisioned in the main route, then the flags are inherited by all further branches, unless specifically modified per branch. To modify a specific branch, one needs to specify the desired branch index as variable index (i.e. _$(rtp\_relay\[1\]) = "cor"_). When provisioned in a branch route, the flags are only changed for that specific branch.

Starting with OpenSIPS 3.3, branches can be identified based on their participant's to\_tag. This features becomes handy when using _rtp\_relay_ in B2B mode, where peers can no longer be identified simply by an index. However, this feature works in dialog secenatios as well.

The multiple branches behavior is handled differently by the back-end engine, depending on its capabilities. For example, _rtpengine_ is able to natively support calls with multiple branches, whereas for _rtpproxy_, each branch is emulated in a different session with a different call-id.

When the call gets answered and a single branch remains active, all the other branches are destroyed and only the established branches remain active throughout the call.

## 1.3.�Dependencies

### 1.3.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _Dialog_ module - used to keep track of in-dialog requests.
    
*   _RTP Relay_ module(s) - such _rtpproxy_, or _rtpengine_, or any module that implements the _rtp\_relay_ interface.
    

### 1.3.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.4.�Exported Functions

### 1.4.1.� `rtp_relay_engage(engine, [set])`

Engages the RTP Relay _engine_ for the current initial INVITE. After calling this function, the entire RTP relay communication will be handled by the module itself, without having to intervene for any further in-dialog requests/replies (unless you specifically want to).

The function is not performing the media requests on the spot, but rather registers the hooks to automatically handle any further media requests.

The RTP session modifiers used are the ones provisioned through the [$rtp\_relay](#pv_rtp_relay "1.6.1.�$rtp_relay") and/or [$rtp\_relay\_peer](#pv_rtp_relay_peer "1.6.2.�$rtp_relay_peer") variables.

The function can be called from the main request route - in this case the RTP relay will be engaged for any further branches created, or from the branch route - in this case the RTP relay will only be engaged for the branch where it was called, or that has an associated _rtp\_relay_ provisioned.

Meaning of the parameters is as follows:

*   _engine(string)_ - the RTP relay engine to be used for the call (i.e. _rtpproxy_.
    
*   _set(int, optional)_ - the set used for this call.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, BRANCH\_ROUTE.

**Example�1.1.�`rtp_relay_engage` usage**

...
if (is\_method("INVITE") && !has\_totag()) {
	xlog("SCRIPT: engaging RTPProxy relay for all branches\\n");
	$rtp\_relay = "co";
	$rtp\_relay\_peer = "co";
	rtp\_relay\_engage("rtpproxy");
}
...
		

  

## 1.5.�Exported MI Functions

### 1.5.1.�`rtp_relay_list`

Lists all the RTP Relay sessions engaged.

Parameters:

*   _engine_ - (optional) the RTP relay engine (i.e. _rtpproxy_ or _rtpengine_).
    
*   _set_ - (optional) the RTP relay set. When used, the _engine_ parameter must also be specified.
    
*   _node_ - (optional) the RTP relay node. When used, the _engine_ parameter must also be specified.
    

**Example�1.2.� `rtp_relay_list` usage**

...
## list all sessions
$ opensips-cli -x mi rtp\_relay\_list

## list all sessions going through a specific RTP node
$ opensips-cli -x mi rtp\_relay\_list rtpproxy udp:127.0.0.1:2222
...
			

  

### 1.5.2.�`rtp_relay_update`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

This function can be used to trigger dialog in-dialog updates for certain ongoing RTP sessions. For all matched sessions, it re-engages an RTP Relay offer/answer session, then sends re-INVITEs to call's participants to with the updated SDP.

_Note:_Running the command without a filter (such as _engine_ or _set_) will cause all RTP relay sessions to be re-engaged.

_Note:_When enforcing a new node, it is not guaranteed to be used - if the node is not avaialble, but a different one is, the active one will be chosen.

_Note:_If the node is being changed, the module tries to unforce the previous RTP relay session, even though it might not work.

Parameters:

*   _engine_ - (optional) the RTP relay engine (i.e. _rtpproxy_ or _rtpengine_) to be used as filter.
    
*   _set_ - (optional) the RTP relay set to be used as filter. If missing, the same set will be used as it was initially engaged for.
    
*   _node_ - (optional) the RTP relay node to be used as filter.
    
*   _new\_set_ - (optional) a new RTP Relay set to be used for the call.
    
*   _new\_node_ - (optional) a new RTP node to be used for the call. If _new\_set_ is missing, the same set will be used.
    

**Example�1.3.� `rtp_relay_update` usage**

...
## update all sessions that are using rtpproxy
$ opensips-cli -x mi rtp\_relay\_update rtpproxy
...
			

  

### 1.5.3.�`rtp_relay_update_callid`

Updates/Re-engages the RTP relays in all ongoing RTP relay sessions.

The function basically works in the same manner as [rtp\_relay\_update](#mi_rtp_relay_update "1.5.2.�rtp_relay_update"), but is to be used to update a specific callid. In addition, one can also update the _engine_ and _flags_ used for the particular session.

Parameters:

*   _callid_ - the callid used to match the dialog to be updated.
    
*   _engine_ - (optional) the new RTP relay engine (i.e. _rtpproxy_ or _rtpengine_) to be used. If missing, the same initial engine is used.
    
*   _set_ - (optional) the new RTP relay set to be used. If missing, the default same set will be used as it was initially engaged for.
    
*   _node_ - (optional) the RTP relay node to be used. If not specified, the first available node is used.
    
*   _flags_ - (optional) a JSON contining the _caller_ and/or _callee_ nodes, which contain new flags that should be used for the session. Only explicitely specified flags will be overwritten.
    

**Example�1.4.� `rtp_relay_update_callid` usage**

...
## update a call with a working RTPproxy node
$ opensips-cli -x mi rtp\_relay\_update\_callid 1-3758963@127.0.0.1 rtpproxy

## update a call to use RTPEngine with a SRTP SDP for caller
$ opensips-cli -x mi rtp\_relay\_update\_callid callid=1-3758963@127.0.0.1 \\
	flags='{ "caller":{"type":"SRTP", "flags":"replace-origin"},
		"callee":{"type":"RTP", "flags"="replace-origin"}}'
...
			

  

## 1.6.�Exported Pseudo-Variables

### 1.6.1.�`$rtp_relay`

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
    

### 1.6.2.�`$rtp_relay_peer`

This variable has the same meaning and parameters as the [$rtp\_relay](#pv_rtp_relay "1.6.1.�$rtp_relay") variable, except that it is used to provision the other UAC's flags, except the current one. All other fields are similar.

### 1.6.3.�`$rtp_relay_ctx()`

This variable can be used to provide information about the RTP context, information that is not associated with any of the involved peers.

The following settings can be used:

*   _callid_ - The callid to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _from\_tag_ - The from-tag to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _to\_tag_ - The to-tag to be used for all communication with the rtp server. If not specified, it is taken from the message/dialog.
    
*   _flags_ - Generic flags to be sent to all offer/answer requests.
    
*   _delete_ - flags sent when the relay session is terminated.
    

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

169

100

5921

1196

2.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

5

3

7

8

3.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

3

1

11

7

4.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

2

1

5

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

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Apr 2021 - Mar 2026

2.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

Mar 2023 - Mar 2023

3.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Feb 2023 - Feb 2023

4.

Vlad Paiu ([@vladpaiu](https://github.com/vladpaiu))

Oct 2022 - Oct 2022

  

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)).

_Documentation Copyrights:_

Copyright � 2021 OpenSIPS Solutions