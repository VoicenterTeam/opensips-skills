# script_helper Module Reference
<!-- generated-from: data/3.5/modules/script_helper.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 script_helper module. Read this file when configuring or debugging the script_helper module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The purpose of the Script Helper module is to simplify the scripting process in OpenSIPS when doing basic scenarios. At the same time, it is useful to script writers as it contains basic SIP routing logic, and thus it allows them to focus more on the particular aspects of their OpenSIPS routing code.

## How It Works

By simply loading the module, the following default logic will be embedded:

*   for initial SIP requests, the module will perform record routing before running the main request route
    
*   sequential SIP requests will be transparently handled - the module will perform loose routing, and the request route will not be run at all

Currently, the module may be further configured to embed the following optional logic:

*   dialog support (dialog module dependency - must be loaded before this module)
    
*   an additional route to be run before relaying sequential requests

## Dependencies

### OpenSIPs Modules

- `dialog` — only if use_dialog is enabled (optional)

### External Libraries

None.

## Exported Parameters

### `create_dialog_flags` (string)

Flags used when creating dialogs. For details on these flags, please refer to the _create\_dialog()_ function of the dialog module.

*Default value is "".*

**Example.** PpB.

```opensips
modparam("script\_helper", "create\_dialog\_flags", "PpB")
```
### `sequential_route` (string)

Optional route to be run just before sequential requests are relayed. If the _exit_ script statement is used inside this route, the module assumes that the relaying logic has been handled.

*Default value is not set.*

**Example.** sequential_handling.

```opensips
modparam("script\_helper", "sequential\_route", "sequential\_handling")
...
route [sequential\_handling]
{
...
}
...
```
### `use_dialog` (integer)

Enables dialog support. Note that the dialog module must be loaded before this module when setting this parameter.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("script\_helper", "use\_dialog", 1)
```

## Configuration Examples

### Setting `use_dialog`

Demonstrates how to enable dialog support for the script_helper module.

```opensips
...
modparam("script_helper", "use_dialog", 1)
...
```
### Setting `create_dialog_flags`

Demonstrates how to set flags used when creating dialogs.

```opensips
...
modparam("script_helper", "create_dialog_flags", "PpB")
...
```
### Setting `sequential_route`

Demonstrates how to define an optional route to be run just before sequential requests are relayed.

```opensips
...
modparam("script_helper", "sequential_route", "sequential_handling")
...
route [sequential_handling]
{
...
}
...
```
