# script_helper Module Reference
<!-- generated-from: data/3.4/modules/script_helper.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 script_helper module. Read this file when configuring or debugging the script_helper module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The purpose of the **Script Helper module** is to simplify the scripting process in OpenSIPS when doing basic scenarios. At the same time, it is useful to script writers as it contains basic SIP routing logic, and thus it allows them to focus more on the particular aspects of their OpenSIPS routing code.

## How It Works

By simply loading the module, the following **default logic** will be embedded:

*   for initial SIP requests, the module will perform _record routing_ before running the main _request_ route
    
*   sequential SIP requests will be transparently handled - the module will perform _loose routing_, and the request route will not be run at all

Currently, the module may be further configured to embed the following **optional logic**:

*   _dialog_ support (dialog module dependency - must be loaded before this module)
    
*   an additional route to be run before relaying sequential requests

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

### Optional Modules

- `dialog`

## Exported Parameters

### `create_dialog_flags` (string)

Flags used when creating dialogs. For details on these flags, please refer to the _create_dialog()_ function of the dialog module.

**Example.** PpB.

```opensips
modparam("script_helper", "create_dialog_flags", "PpB")
```
### `sequential_route` (string)

Optional route to be run just before sequential requests are relayed. If the _exit_ script statement is used inside this route, the module assumes that the relaying logic has been handled.

*Default value is not set.*

**Example.** sequential_handling.

```opensips
modparam("script_helper", "sequential_route", "sequential_handling")
...
route [sequential_handling]
{
...
}
```
### `use_dialog` (integer)

Enables dialog support. Note that the dialog module must be loaded before this module when setting this parameter.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("script_helper", "use_dialog", 1)
```

## Configuration Examples

### Setting `use_dialog`

Enables dialog support.

```opensips
...
modparam("script_helper", "use_dialog", 1)
...
```
### Setting `create_dialog_flags`

Flags used when creating dialogs.

```opensips
...
modparam("script_helper", "create_dialog_flags", "PpB")
...
```
### Setting `sequential_route`

Optional route to be run just before sequential requests are relayed.

```opensips
...
modparam("script_helper", "sequential_route", "sequential_handling")
...
route \[sequential_handling\]
{
...
}
...
```
