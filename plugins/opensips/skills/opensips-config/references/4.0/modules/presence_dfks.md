# presence_dfks Module Reference
<!-- generated-from: data/4.0/modules/presence_dfks.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 presence_dfks module. Read this file when configuring or debugging the presence_dfks module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The module enables the handling of the "as-feature-event" event package (as defined by Broadsoft's Device Feature Key Synchronization protocol) by the presence module. This can be used to synchronize the status of features such as Do Not Disturb and different forwarding types between a SIP phone and a SIP server.

## How It Works

The module supports synchronization for the following features: Do Not Disturb, Call Forwarding Always, Call Forwarding Busy and Call Forwarding No Answer. Feature status can be changed either from the SIP phone or the OpenSIPS Server( by running an MI command).

When handling a SUBSCRIBE message without a body, the module will run a script route for each feature, that will be used to retrieve the current status of that feature. Conversely, a SUBSCRIBE with a body will trigger a script route where the updated status of a specific feature is available. This route might also be run if the feature update was triggered from OpenSIPS via MI.

Note that the module does not automatically cache or persist any feature information as this is left for the script writer to implement in the routes triggered by the module.

## Dependencies

### OpenSIPs Modules

- `presence`

### External Libraries

- `libxml2-dev`

## Exported Parameters

### `get_route` (string)

The name of the script route to be run in order to retrieve the status of a feature.

*Default value is dfks_get.*

**Example.** dfks_get.

```opensips
...
modparam("presence_dfks", "get_route", "dfks_get")
...
```
### `set_route` (string)

The name of the script route to be run when a feature status update from a SIP phone is received.

*Default value is dfks_get.*

**Example.** dfks_set.

```opensips
...
modparam("presence_dfks", "set_route", "dfks_set")
...
```

## Exported Pseudo-Variables

### `$dfks(assigned)`

inform the SIP phone that a feature is unassigned by setting this to 0 (the NOTIFY response will contain no XML data for the corresponding feature) By default, features are assigned.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** request

**Possible values:**

- 0
- 1
### `$dfks(feature)`

read-only, returns the current feature name.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request

**Possible values:**

- DoNotDisturb
- CallForwardingAlways
- CallForwardingBusy
- CallForwardingNoAnswer
### `$dfks(notify)`

suppress the sending of the NOTIFY message by setting this to 0. By default, the NOTIFY is sent.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** request

**Possible values:**

- 0
- 1
### `$dfks(param)`

returns the parameter passed by the mi_dfks_set_feature MI function. This field will be NULL if the parameter was not specified, or if the set_route is not triggered by an MI command, but by SIP signalling.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request
### `$dfks(presentity)`

read-only, returns the current presentity URI.

- **Type:** string
- **Read/write:** read-only
- **Scope:** request
### `$dfks(status)`

read or write the feature status. A value of 1 means enabled and 0 disabled.

- **Type:** integer
- **Read/write:** read-write
- **Scope:** request

**Possible values:**

- 0
- 1
### `$dfks(value/field)`

read or write extra feature values. field can be one of: forwardTo - for all forwarding types; ringCount - for CallForwardingNoAnswer.

- **Type:** string
- **Read/write:** read-write
- **Scope:** request

**Possible values:**

- forwardTo
- ringCount

## Exported MI Functions

### `presence_dfks:set_feature`

Replaces obsolete MI command: _dfks_set_feature_.

Triggers the sending of NOTIFY messages containing a feature status update to all watchers.

_Note:_ calling this MI function also triggers the _set_route_ run. One can determine if the route is triggered by an MI function by checking the existence of the _$dfks(param)_ variable.

**Parameters:**

- `feature` *(string, required)* — The name of the feature to update. Takes one of the following values: _DoNotDisturb_, _CallForwardingAlways_, _CallForwardingBusy_, _CallForwardingNoAnswer_
- `presentity` *(string, required)* — the URI of the user whose feature status should be updated
- `route_param` *(string, optional)* — optional string parameter passed to the _$dfks(param)_ variable in _set_route_
- `status` *(integer, required)* — the new status of the feature: _0_ - disabled, _1_ - enabled
- `values` *(array, optional)* — an array of extra values that can be updated for a feature. The format of an array element is: _field_/_value_. Supported fields are: _forwardTo_ - for all forwarding types, _ringCount_ - for _CallForwardingNoAnswer_

**Example.** Sets the CallForwardingNoAnswer feature for sip:alice@10.0.0.11 to enabled with a ring count of 4 and forwarding to sip:bob@10.0.0.11.

```opensips-cli
opensips-cli -x mi presence_dfks:set_feature sip:alice@10.0.0.11 CallForwardingNoAnswer 1 1 \
ringCount/4 forwardTo/sip:bob@10.0.0.11
```

## Configuration Examples

### Set parameter

Set parameter

```opensips
...
modparam("presence_dfks", "get_route", "dfks_get")
...
```
### Set parameter

Set parameter

```opensips
...
modparam("presence_dfks", "set_route", "dfks_set")
...
```
### `dfks` usage

`dfks` usage

```opensips
...
route[dfks_set] {
    # CallForwardingAlways is not allowed
    if ($dfks(feature) == "CallForwardingAlways")
        $dfks(status) = 0;

    xlog("New status: $dfks(status) for feature '$dfks(feature)' of user '$dfks(presentity)'\\n");
}
route[dfks_get] {
    if ($dfks(feature) == "CallForwardingNoAnswer") {
        $dfks(status) = 1;
        $dfks(value/forwardTo) = "sip:bob@10.0.0.11";
        $dfks(value/ringCount) = "3";
    } else if ($dfks(feature) == "CallForwardingAlways")
        $dfks(assigned) = 0;
    } else {
        ...
    }
}
...
```
