# Script Helper Module Module Reference
<!-- generated-from: data/3.6/modules/script-helper-module.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 Script Helper Module module. Read this file when configuring or debugging the Script Helper Module module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

- `dialog` — only if use_dialog is enabled (optional)

### External Libraries

None.

## Exported Parameters

### `create_dialog_flags` (string)

Flags used when creating dialogs. For details on these flags, please refer to the _create\_dialog()_ function of the dialog module.

**Notes:** Default value is "" (no flags are set)

**Example.** PpB.

```opensips
...
modparam("script\_helper", "create\_dialog\_flags", "PpB")
...
```
### `sequential_route` (string)

Optional route to be run just before sequential requests are relayed. If the _exit_ script statement is used inside this route, the module assumes that the relaying logic has been handled.

*Default value is not set.*

**Notes:** By default, this parameter is not set

**Example.** sequential_handling.

```opensips
...
modparam("script\_helper", "sequential\_route", "sequential\_handling")
...
route \[sequential\_handling\]
{
...
}
...
```
### `use_dialog` (integer)

Enables dialog support.

*Default value is 0.*

**Notes:** Note that the dialog module must be loaded before this module when setting this parameter. Default value is 0 (disabled).

**Example.** 1.

```opensips
...
modparam("script\_helper", "use\_dialog", 1)
...
```

## Configuration Examples

### Setting `use_dialog`

Enables dialog support.

```opensips
...
modparam("script\_helper", "use\_dialog", 1)
...
```
### Setting `create_dialog_flags`

Sets the flags used when creating dialogs.

```opensips
...
modparam("script\_helper", "create\_dialog\_flags", "PpB")
...
```
### Setting `sequential_route`

Sets an optional route to be run just before sequential requests are relayed.

```opensips
...
modparam("script\_helper", "sequential\_route", "sequential\_handling")
...
route \[sequential\_handling\]
{
...
}
...
```
