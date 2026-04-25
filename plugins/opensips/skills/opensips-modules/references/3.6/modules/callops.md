# callops Module Reference
<!-- generated-from: data/3.6/modules/callops.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 callops module. Read this file when configuring or debugging the callops module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Events](#exported-events)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides a set of functions that allow the user to control ongoing calls. It can be used to trigger a call (either blind or attended) transfer, or put a call on hold from the proxy side, rather than the end-device side. The module binds on top of the [OpenSIPS Dialog module](dialog) to get information about the ongoing calls, as well as storing information about new calls that will be started.

## How It Works

The module also triggers a set of events over Event Interface, providing to external applications details about how calls are being transferred, and how they link between them. These events can be used to track down all the legs involved in a call transfer.

One of the biggest challenge when doing Call Transfer scenarios is linking new calls to the old calls being transferred, especially in blind call transfer scenarios. In order to solve this challenge, the module can be configured to refer old legs in two different modes, changeable using the [mode](#param_mode "1.3.1.�mode (string/integer)") parameter:

*   Automatically (default mode), by adding a special parameter to the destination URI that is being sent in the REFER. When the new call comes back, the parameter will be present in the Request URI of the new call. The module will find it, link the new call to the old call, and remove the parameter from the URI.
    
*   Manually, by using custom/external logic (such as a database, or local storage), to match the old call. In this mode, the user has to explicitly call the [call\_blind\_replace()](#func_call_blind_replace "1.4.1.� call_blind_replace(callid[, leg])") function to link the two calls together.
    
The module can also be used to catch _Notify refer_ events and reply to them from the OpenSIPS level. However, note that in _auto_ mode even if the NOTIFY is handled when the dialog is matched, the request will still continue its execution of the script, unlike when _manual_ mode is used with the [call\_transfer\_notify()](#func_call_transfer_notify "1.4.2.� call_transfer_notify()") function. In order to avoid sending the NOTIFY to the end-point, you have to drop it, like below:

**Example�1.1.�Drop automatically handled NOTIFY refer events**

...
if (has\_totag() && loose\_route() &&
		is\_method("NOTIFY") && $hdr(Event) == "refer")
	drop;
...

## Dependencies

### OpenSIPs Modules

- `Dialog` — Dialog module for keeping track of the proxied calls.
- `TM` — Transaction module.

### External Libraries

None.

## Exported Parameters

### `match_param` (string)

The parameter used to match the different calls together. This is mainly using in the _param_ mode, but it is also used internally to store different values inside the transferred dialog - make sure it does not overlap with existing dialog values.

*Default value is osid.*

**Example.** call.

```opensips
modparam("callops", "match\_param", "call")
```
### `mode` (string/integer)

This parameter can be used to change the mode that the module uses to match a transferred leg. Supported values are:

*   _param_ / _0_ - when doing a blind transfer, the destination sent in the refer message will contain a parameter used to identify the dialog that is being replaced. this parameter will be automatically removed when the new call is received.
    
*   _manual_ / _1_ - the user will create its own logic to match the new calls, and will call the [call_blind_replace()](#func_call_blind_replace "1.4.1.� call_blind_replace(callid[, leg])") function to make OpenSIPS aware of the pair. Note that this mode does not handle automatically the _Notify refer_ either, so you also have to use the [call_transfer_notify()](#func_call_transfer_notify "1.4.2.� call_transfer_notify()") function to handle them.
    
*   _callid_ / _2_ - similar to the _param_ value, except that instead of storing in the Request URI the dialog id of the call to be transfered, the actual callid is used as identifier.

*Default value is 0 (auto mode using parameters).*

**Possible values:**

- param
- 0
- manual
- 1
- callid
- 2

**Example.** manual.

```opensips
modparam("callops", "mode", "manual") # use your own logic
```

## Exported Functions

### `call_blind_replace(callid[, leg])`

When _manual mode_ is used, this function is called to create a mapping between the transferring call and the transferred call. It should be called when OpenSIPS receives a new call that is transferring an existing call.

**Parameters:**

- `callid` *(string, required)* — the existing call that is being transferred.
- `leg` *(string, optional)* — the leg that is being transferred. If not specified, and OpenSIPS cannot determine the leg based on its destination, the _unknown_ tag should be used.

**Usable from:** REQUEST_ROUTE

**Example.** Use `call_blind_replace()` function to match an existing leg..

```opensips
...
if (!has_totag() && is_method("INVITE")) {
	if (cache_fetch("local", "callid_$si", $avp(callid))) {
		call_blind_replace($avp(callid));
	}
}
...
```

### `call_transfer(leg, destination)`

This function triggers a blind call transfer by sending a REFER message during an ongoing call. The function needs to be run inside the context of the dialog you are transferring.

**Parameters:**

- `destination` *(string, required)* — SIP URI of the destination where the leg is being transferred.
- `leg` *(string, required)* — the leg that is being transferred. Must be one of the _caller_ or _callee_ values.
  - `caller`
  - `callee`

**Usable from:** any route that has a dialog context

**Example.** Use `call_transfer()` function to do a blind transfer of the caller to a new destination..

```opensips
...
if (has_totag() && && loose_route()) {
	call_transfer("caller", "sip:announcement@127.0.0.1");
}
...
```

### `call_transfer(leg, transfer_callid, transfer_leg[, destination])`

This function triggers an attended call transfer by sending a REFER message during an ongoing call. The function needs to be run inside the context of the dialog you are transferring.

**Parameters:**

- `destination` *(string, optional)* — SIP URI of the destination where the leg is being transferred. If missing, the From/To URI of the initial call are used.
- `leg` *(string, required)* — the leg that is being transferred. Must be one of the _caller_ or _callee_ values.
  - `caller`
  - `callee`
- `transfer_callid` *(string, required)* — the callid of the second dialog that is being transferred.
- `transfer_leg` *(string, required)* — the leg within the second call that will be transferred to _leg_. Must be one of the _caller_ or _callee_ values.
  - `caller`
  - `callee`

**Usable from:** any route that has a dialog context

**Example.** Use `call_transfer()` function to do an attended transfer of the caller to the callee of a different call..

```opensips
...
if (has_totag() && && loose_route()) {
	call_transfer("caller", "ba55b1b3-459d-4e84-a6f8-14c40e4f6ace", "callee");
}
...
```

### `call_transfer_notify()`

When _manual mode_ is used, this function should be called on in-dialog NOTIFY requests for an _Event: refer_ header, to handle them accordingly. Note that if the function successfully handles the NOTIFY request, the script no longer continues its execution.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, LOCAL_ROUTE

**Example.** Use `call_transfer_notify()` function to handle NOTIFY refer requests..

```opensips
...
if (has_totag() && is_method("NOTIFY") && loose_route()) {
	call_transfer_notify();
}
...
```

## Exported MI Functions

### `call_hold`

MI command to put an ongoing call on hold.

**Parameters:**

- `callid` *(string, required)* — the callid of the dialog that is being put on hold.

**Returns:** Command returns _OK_ if any of the legs of the call have been put on hold. If the call is already on hold, an error is returned.

**Example.** put a call on hold

```opensips-cli
# put a call on hold
opensips-cli -x mi call_hold \
	callid=921b00e4-fec0-4a36-9397-a40ab74e1893
```

### `call_transfer`

MI command to transfer an ongoing call to a new destination.

Depending on the parameters used, this command can do both blind and attended transfers scenarios. When the _transfer\_callid_ is used, then an attended transfer is performed, other wise a blind transfer is issued.

**Parameters:**

- `callid` *(string, required)* — the callid of the dialog that is being transferred.
- `destination` *(string, optional)* — the URI where the call is being transferred. This parameter is mandatory for blind transfers, and optional for attended transfers. In the case of an attended transfer, if it is missing, the destination of the call is taken from the URIs in the transfer dialog.
- `leg` *(string, required)* — indicates the leg of the _callid_ call that is being transferred/kept in the new transferring call. Possible values are “caller”, “callee” or “both”.
- `transfer_callid` *(string, optional)* — mandatory in case of an attended transfer, to specify the call of the Bleg in the new call.
- `transfer_fromtag` *(string, optional)* — these parameters should always be specified together, and are used in call attended transfer scenarios where the dialog of the Bleg that is being transferred is not managed by OpenSIPS. Note that for these scenarios only the A-leg dialog will receive events about the call transfer.
- `transfer_leg` *(string, optional)* — in case of an attended transfer, it specifies the participant of the _transfer\_callid_ call that will be bridged with the _leg_ of the _callid_. If missing, _transfer\_fromtag_ and _transfer\_totag_ must be used to identify the tag.
- `transfer_totag` *(string, optional)* — these parameters should always be specified together, and are used in call attended transfer scenarios where the dialog of the Bleg that is being transferred is not managed by OpenSIPS. Note that for these scenarios only the A-leg dialog will receive events about the call transfer.

**Example.** blind transfer to sip:agent@127.0.0.1

```opensips-cli
# blind transfer to sip:agent@127.0.0.1
opensips-cli -x mi call_transfer \
	callid=4b664b48-5639-40bf-bff8-3a866c145c3b \
	leg=caller \
	destination=sip:agent@217.0.0.1
```

**Example.** attended transfer between two calls

```opensips-cli
# attended transfer between two calls
opensips-cli -x mi call_transfer \
	callid=e8d024db-78e5-4d18-9794-5b8ba837bed4
	leg=caller \
	transfer_callid=559abf97-9834-4380-bba1-a036eb245450 \
	transfer_leg=calee
```

### `call_unhold`

MI command to resume a call from an onhold state put by the [call\_hold](#mi_call_hold "1.5.2.� call_hold") call.

**Parameters:**

- `callid` *(string, required)* — the callid of the dialog that is being resumed.

**Returns:** Command returns _OK_ if any of the legs are resumed, or an error if no leg had been previously put on hold.

**Example.**

```opensips-cli
opensips-cli -x mi call_unhold \
	callid=921b00e4-fec0-4a36-9397-a40ab74e1893
```

## Exported Events

### `E_CALL_HOLD`

Triggered during the process of putting a call on hold, or resuming a call from an on hold state.

This event is triggered twice per each leg of the call - first when the leg starts to be put on hold, and then when the leg accepts or rejects the state.

**Parameters:**

- `callid` *(string)* — the callid of the call that is being put on hold, or resumed.
- `leg` *(string)* — the leg (_caller_ or _callee_) affected by the call on hold, or resumed.
- `action` *(string)* — _hold_ or _unhold_ action that is being performed.
- `state` *(string)* — the state of the action that is being performed.

* _start_ - triggered when the re-INVITE is being sent out to the participant being put on hold.
* _ok_ - triggered when the on hold/resume action is successfully completed.
* _fail_ - triggered when the action failed.
### `E_CALL_TRANSFER`

This event is triggered during a call transfer scenario.

For a specific call transfer, multiple events are triggered, starting when the transfer is initiated, until the transfer is completed. The _state_ parameter indicates the state of the call transfer.

For a blind transfer scenario, only one set of events are triggered, whereas for attended transfer, you will get a set of events for both dialogs involved in the transfer, as long as both are proxied through OpenSIPS

**Parameters:**

- `callid` *(string)* — the callid of the call that is being transferred.
- `leg` *(string)* — the leg (_caller_ or _callee_) of the call that is being transferred.
- `transfer_callid` *(string)* — the callid of the new call that is transferring the old _callid_ call.
- `destination` *(string)* — the URI destination where the _leg_ is being transferred.
- `state` *(string)* — the state of the transfer:

* _start_ - triggered when the REFER message is being sent out to the transferred participant.
* _notify_ - triggered when a NOTIFY refer event is received from the transferred participant. The _status_ parameter contains extra information about the status of the transferring call.
* _ok_ - triggered when the transfer is completed - the call is answered by the transferred participant.
* _fail_ - triggered when a transfer has failed due to various reasons. If we were unable to start the call transfer (i.e. send the REFER), the _status_ parameter is empty, otherwise it contains information about the failure.
- `status` *(string)* — contains extra information about the success or failure of the call.

## Configuration Examples

### Drop automatically handled NOTIFY refer events

In order to avoid sending the NOTIFY to the end-point, you have to drop it, like below:

```opensips
...
if (has\_totag() && loose\_route() &&
	is\_method("NOTIFY") && $hdr(Event) == "refer")
	drop;
...
```
### Set `mode` parameter

Sets the mode parameter to manual.

```opensips
...
modparam("callops", "mode", "manual") # use your own logic
...
```
### Set `match_param` parameter

Sets the match_param parameter.

```opensips
...
modparam("callops", "match\_param", "call")
...
```
### Use `call_blind_replace()` function to match an existing leg.

Matches an existing leg using the call_blind_replace function.

```opensips
...
if (!has\_totag() && is\_method("INVITE")) {
	if (cache\_fetch("local", "callid\_$si", $avp(callid))) {
		call\_blind\_replace($avp(callid));
	}
}
...
```
### Use `call_transfer_notify()` function to handle NOTIFY refer requests.

Handles NOTIFY refer requests using the call_transfer_notify function.

```opensips
...
if (has\_totag() && is\_method("NOTIFY") && loose\_route()) {
	call\_transfer\_notify();
}
...
```
### Use `call_transfer()` function to do a blind transfer of the caller to a new destination.

Performs a blind transfer of the caller to a new destination.

```opensips
...
if (has\_totag() && && loose\_route()) {
	call\_transfer("caller", "sip:announcement@127.0.0.1");
}
...
```
### Use `call_transfer()` function to do an attended transfer of the caller to the callee of a different call.

Performs an attended transfer of the caller to the callee of a different call.

```opensips
...
if (has\_totag() && && loose\_route()) {
	call\_transfer("caller", "ba55b1b3-459d-4e84-a6f8-14c40e4f6ace", "callee");
}
...
```
