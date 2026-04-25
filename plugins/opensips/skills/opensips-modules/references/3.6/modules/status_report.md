# status_report Module Reference
<!-- generated-from: data/3.6/modules/status_report.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 status_report module. Read this file when configuring or debugging the status_report module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The Status/Report module is a wrapper over the internal status/report framework, allowing the script writer to dynamically define and use of SR groups.

By bringing the Status/Report support into the script, it opens the possibility to create custom reports from script, depending on the logic you have there.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `script_sr_group` (string)

Name of a new Status/Report group to be created and later used from script level.

This parameter may be defined multiple times, in order to define multiple groups.

**Example.** security.

```opensips
modparam("status_report", "script_sr_group", "security")
modparam("status_report", "script_sr_group", "alarms")
```

## Exported Functions

### `sr_add_report( group, report)`

Adds a new report/log to a Status/Report group.This must have been defined via this module too.

**Parameters:**

- `group` *(string, required)* — the name of the SR group; you can change the status only for the groups defined via this module (as parameter).
- `report` *(string, required)* — the log to be added.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** `sr_add_report` usage.

```opensips
...
sr\_add\_report("security","IP $si detected as attacker");
...
```

### `sr_set_status( group, status, [details])`

Sets a new status (and details) for a Status/Report group.

**Parameters:**

- `details` *(string, optional)* — a descripting text to detail the status value
- `group` *(string, required)* — the name of the SR group; you can change the status only for the groups defined via this module (as parameter).
- `status` *(int, required)* — the new status value ( strict positive meaning OK, strict negative meaning NOT OK, 0 is not accepts, it is converted to 1 automatically).

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, ERROR_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** `sr_set_status` usage.

```opensips
...
sr\_set\_status( "script\_caching", 1, "completed");
...
```

## Configuration Examples

### script_sr_group example

Name of a new Status/Report group to be created and later used from script level. This parameter may be defined multiple times, in order to define multiple groups.

```opensips
modparam("status\_report", "script\_sr\_group", "security")
modparam("status\_report", "script\_sr\_group", "alarms")
```
### `sr_set_status` usage

Sets a new status (and details) for a Status/Report group.

```opensips
...
sr\_set\_status( "script\_caching", 1, "completed");
...
```
### `sr_add_report` usage

Adds a new report/log to a Status/Report group.

```opensips
...
sr\_add\_report("security","IP $si detected as attacker");
...
```
