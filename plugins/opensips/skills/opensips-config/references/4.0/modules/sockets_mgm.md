# sockets_mgm Module Reference
<!-- generated-from: data/4.0/modules/sockets_mgm.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 sockets_mgm module. Read this file when configuring or debugging the sockets_mgm module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides the means to provision and manage dynamic sockets for OpenSIPS at runtime. The definition of the sockets is stored in an SQL database and can be dynamically changed at runtime. The module caches the entire table sockets and only adjusts the dynamic socket list after a reload using the sockets_mgm:reload MI command. The sockets_mgm:list MI command. can be used to show all the dynamic sockets OpenSIPS is listening on.

## How It Works

The module exclusively handles sockets used for SIP traffic (e.g., UDP, TCP, TLS, WSS). It does not support BIN or HEP listeners, as these cannot be dynamically utilized or enforced in the script. The management of dynamic sockets is divided into two behaviors, depending on whether the traffic is UDP-based or TCP-based. Based on the nature of your traffic, ensure that your settings are properly tuned to accommodate any sockets you may provision dynamically. All dynamically added UDP sockets are assigned to a group of dedicated extra processes. The number of these processes can be adjusted using the processes parameter. These processes handle UDP-based socket traffic evenly by balancing requests across the less loaded processes. The difference, however, is that static sockets are bound to designated processes, while dynamic sockets share the pool of extra processes. In contrast to UDP traffic handling, TCP traffic is processed in the same way as all other TCP traffic: requests are dispatched to one of the existing static TCP processes.

## Dependencies

### OpenSIPs Modules

- `database module` — needed for fetching the sockets

### External Libraries

None.

## Exported Parameters

### `advertised_column` (string)

The database table column where the advertised definition is stored.

*Default value is advertised.*

**Example.** adv.

```opensips
modparam("sockets_mgm", "advertised_column", "adv")
```
### `db_url` (string)

The database URL where the sockets are fetched from.

*Default value is mysql://opensips:opensipsrw@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("sockets_mgm", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `flags_column` (string)

The database table column where the flags definition is stored.

*Default value is flags.*

**Example.** sock.

```opensips
modparam("sockets_mgm", "flags_column", "sock")
```
### `max_sockets` (integer)

The maximum number of sockets that can be defined dynamically. See the Limitations section for more information.

*Default value is 100.*

**Example.** 2000.

```opensips
modparam("sockets_mgm", "max_sockets", 2000)
```
### `processes` (integer)

The number of processes designated to handle UDP sockets.

*Default value is 8.*

**Example.** 32.

```opensips
modparam("sockets_mgm", "processes", 32)
```
### `socket_column` (string)

The database table column where the socket definition is stored.

*Default value is socket.*

**Example.** sock.

```opensips
modparam("sockets_mgm", "socket_column", "sock")
```
### `table_name` (string)

The database table name where the sockets are stored.

*Default value is sockets.*

**Example.** sockets_def.

```opensips
modparam("sockets_mgm", "table_name", "sockets_def")
```
### `tag_column` (string)

The database table column where the tag definition is stored.

*Default value is tag.*

**Example.** sock.

```opensips
modparam("sockets_mgm", "tag_column", "sock")
```
### `tos_column` (string)

The database table column where the tos definition is stored.

*Default value is tos.*

**Example.** sock.

```opensips
modparam("sockets_mgm", "tos_column", "sock")
```

## Exported MI Functions

### `sockets_mgm:list`

Replaces obsolete MI command: _sockets_list_. MI command to list all the currently used dynamic sockets.

**Example.**

```bash
		## reload sockets from the database
		opensips-mi sockets_mgm:list
		opensips-cli -x mi sockets_mgm:list
```

### `sockets_mgm:reload`

Replaces obsolete MI command: _sockets_reload_. MI command used to reload the sockets from the database.

**Example.**

```bash
		## reload sockets from the database
		opensips-mi sockets_mgm:reload
		opensips-cli -x mi sockets_mgm:reload
```

## Configuration Examples

### Set “db_url” parameter

The database URL where the sockets are fetched from.

```opensips
...
modparam("sockets_mgm", "db_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set “table_name” parameter

The database table name where the sockets are stored.

```opensips
...
modparam("sockets_mgm", "table_name", "sockets_def")
...
```
### Set “socket_column” parameter

The database table column where the socket definition is stored.

```opensips
...
modparam("sockets_mgm", "socket_column", "sock")
...
```
### Set “advertised_column” parameter

The database table column where the advertised definition is stored.

```opensips
...
modparam("sockets_mgm", "advertised_column", "adv")
...
```
### Set “tag_column” parameter

The database table column where the tag definition is stored.

```opensips
...
modparam("sockets_mgm", "tag_column", "sock")
...
```
### Set “flags_column” parameter

The database table column where the flags definition is stored.

```opensips
...
modparam("sockets_mgm", "flags_column", "sock")
...
```
### Set “tos_column” parameter

The database table column where the tos definition is stored.

```opensips
...
modparam("sockets_mgm", "tos_column", "sock")
...
```
### Set “processes” parameter

The number of processes designated to handle UDP sockets.

```opensips
...
modparam("sockets_mgm", "processes", 32)
...
```
### Set “max_sockets” parameter

The maximum number of sockets that can be defined dynamically. See the Limitations section for more information.

```opensips
...
modparam("sockets_mgm", "max_sockets", 2000)
...
```
