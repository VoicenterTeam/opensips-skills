# db_berkeley Module Reference
<!-- generated-from: data/3.6/modules/db_berkeley.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 db_berkeley module. Read this file when configuring or debugging the db_berkeley module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module which integrates the Berkeley DB into OpenSIPS. It implements the DB API defined in OpenSIPS.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `Berkeley Berkeley DB 4.6` — an embedded database

## Exported Parameters

### `auto_reload` (integer)

The auto-reload will close and reopen a Berkeley DB when the files inode has changed. The operation occurs only duing a query. Other operations such as insert or delete, do not invoke auto_reload.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("db\_berkeley", "auto\_reload", 1)
```
### `journal_roll_interval` (integer)

The journal_roll_interval will close and open a new log file. The roll operation occurs only at the end of writing a log, so it is not guaranteed to to roll 'on time'.

*Default value is 0.*

**Example.** 3600.

```opensips
modparam("db\_berkeley", "journal\_roll\_interval", 3600)
```
### `log_enable` (integer)

The log_enable boolean controls when to create journal files. The following operations can be journaled: INSERT, UPDATE, DELETE. Other operations such as SELECT, do not. This journaling are required if you need to recover from a corrupt DB file. That is, bdb_recover requires these to rebuild the db file. If you find this log feature useful, you may also be interested in the METADATA_LOGFLAGS bitfield that each table has. It will allow you to control which operations to journal, and the destination (like syslog, stdout, local-file). Refer to bdblib_log() and documentation on METADATA.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("db\_berkeley", "log\_enable", 1)
```

## Exported MI Functions

### `bdb_reload`

Causes db_berkeley module to re-read the contents of specified table (or dbenv). The db_berkeley DB actually loads each table on demand, as opposed to loading all at mod_init time. The bdb_reload operation is implemented as a close followed by a reopen. Note- bdb_reload will fail if a table has not been accessed before (because the close will fail).

**Parameters:**

- `table_path` *(string, required)* — to reload a particular table provide the tablename as the arguement; to reload all tables provide the db_path to the db files. The path can be found in opensipsc-cli config variable.

**Example.** MI FIFO Command Format

```bash
		opensips-cli -x mi bdb_reload subscriber
```

## Configuration Examples

### Set `auto_reload` parameter

The auto-reload will close and reopen a Berkeley DB when the files inode has changed. The operation occurs only duing a query. Other operations such as insert or delete, do not invoke auto_reload.

```opensips
...
modparam("db_berkeley", "auto_reload", 1)
...

```
### Set `log_enable` parameter

The log_enable boolean controls when to create journal files. The following operations can be journaled: INSERT, UPDATE, DELETE. Other operations such as SELECT, do not. This journaling are required if you need to recover from a corrupt DB file. That is, bdb_recover requires these to rebuild the db file. If you find this log feature useful, you may also be interested in the METADATA_LOGFLAGS bitfield that each table has. It will allow you to control which operations to journal, and the destination (like syslog, stdout, local-file). Refer to bdblib_log() and documentation on METADATA.

```opensips
...
modparam("db_berkeley", "log_enable", 1)
...

```
### Set `journal_roll_interval` parameter

The journal_roll_interval will close and open a new log file. The roll operation occurs only at the end of writing a log, so it is not guaranteed to to roll 'on time'.

```opensips
...
modparam("db_berkeley", "journal_roll_interval", 3600)
...

```
