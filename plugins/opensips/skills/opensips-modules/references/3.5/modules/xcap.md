# xcap Module Reference
<!-- generated-from: data/3.5/modules/xcap.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 xcap module. Read this file when configuring or debugging the xcap module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

The module contains several parameters and functions common to all modules using XCAP capabilities.

The module is currently used by the following modules: presence_xml, rls and xcap_client.

## Dependencies

### OpenSIPs Modules

- `a database module`

### External Libraries

- `libxml-dev`

## Exported Parameters

### `db_url` (string)

The database url.

*Default value is mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
...
modparam("xcap", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### `integrated_xcap_server` (integer)

This parameter is a flag for the type of XCAP server or servers used. If integrated ones, like OpenXCAP from AG Projects, with direct access to database table, the parameter should be set to a positive value. Apart from updating in xcap table, the integrated server must send an MI command refershWatchers \[pres\_uri\] \[event\] when a user modifies a rules document.

*Default value is 0.*

**Example.** 1.

```opensips
...
modparam("xcap", "integrated\_xcap\_server", 1)
...
```
### `xcap_table` (string)

The name of the db table where XCAP documents are stored.

*Default value is xcap.*

**Example.** xcap.

```opensips
...
modparam("xcap", "xcap\_table", "xcap")
...
```

## Configuration Examples

### Set `db_url` parameter

Sets the database url parameter.

```opensips
...
modparam("xcap", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `xcap_table` parameter

Sets the name of the db table where XCAP documents are stored.

```opensips
...
modparam("xcap", "xcap\_table", "xcap")
...
```
### Set `integrated_xcap_server` parameter

Sets the flag for the type of XCAP server or servers used.

```opensips
...
modparam("xcap", "integrated\_xcap\_server", 1)
...
```
