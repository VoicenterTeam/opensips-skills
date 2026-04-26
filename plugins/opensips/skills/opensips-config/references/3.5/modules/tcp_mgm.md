# tcp_mgm Module Reference
<!-- generated-from: data/3.5/modules/tcp_mgm.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 tcp_mgm module. Read this file when configuring or debugging the tcp_mgm module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides optional, SQL-based support for fine-grained management of all TCP connections taking place on OpenSIPS.

## Dependencies

### OpenSIPs Modules

- `db_xxx` — At least one SQL database module must be loaded

### External Libraries

None.

## Exported Parameters

### `[column-name]_col` (string)

Use a different name for column "column-name".

**Example.** connect_to.

```opensips
modparam("tcp_mgm", "connect_timeout_col", "connect_to")
```
### `db_table` (string)

The name of the table holding the TCP paths (rules).

*Default value is tcp_mgm.*

**Example.** tcp_mgm.

```opensips
modparam("tcp_mgm", "db_table", "tcp_mgm")
```
### `db_url` (string)

Mandatory URL to the SQL database.

**Example.** mysql://opensips:opensipsrw@localhost/opensips.

```opensips
modparam("tcp_mgm", "db_url", "mysql://opensips:opensipsrw@localhost/opensips")
```

## Exported MI Functions

### `tcp_reload`

Reload all TCP paths from the _tcp_mgm_ table without disrupting ongoing traffic. Note that the reloaded rules will NOT immediately apply to existing TCP connections, rather only to newly established ones.

**Returns:** Returns "OK" upon successful reload.

**Example.** reload all TCP paths

```bash
# reload all TCP paths
$ opensips-cli -x mi tcp_reload
$ "OK"
```

## Configuration Examples

### Setting the `db_url` parameter

Mandatory URL to the SQL database.

```opensips
modparam("tcp_mgm", "db_url", "mysql://opensips:opensipsrw@localhost/opensips")
```
### Setting the `db_table` parameter

The name of the table holding the TCP paths (rules). Default value is "tcp_mgm".

```opensips
modparam("tcp_mgm", "db_table", "tcp_mgm")
```
### Setting the `[column-name]_col` parameter

Use a different name for column "column-name".

```opensips
modparam("tcp_mgm", "connect_timeout_col", "connect_to")
```
