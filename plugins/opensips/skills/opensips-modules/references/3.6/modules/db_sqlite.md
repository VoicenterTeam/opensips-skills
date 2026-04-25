# db_sqlite Module Reference
<!-- generated-from: data/3.6/modules/db_sqlite.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 db_sqlite module. Read this file when configuring or debugging the db_sqlite module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This is a module which provides SQLite support for OpenSIPS. It implements the DB API defined in OpenSIPS.

## How It Works

Also this module provides two ways of creating the query. One is to use sqlite3_bind_* functions after opensips creates the prepared statement query. The second one directly uses only sqlite3_snprintf function to print the values into the opensips created query. In theory, the second one should be faster and should allow you to make more queries to the database in the same time, so by default this one will be active. You can use the sqlite3_bind_* interface by simply uncommenting the SQLITE_BIND line the Makefile.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libsqlite3-dev` — the development libraries of sqlite

## Exported Parameters

### `alloc_limit` (integer)

Since the library does not support a function to return the number of rows in a query, this number is obtained using "count(*)" query. If we use multiple processes there is the risk ,since "count(*)" query and the actual "select" query, the number of rows in the result query to have changed, so realloc will be needed if the number is bigger. Using _alloc_limit_ parameter you can specify the number with which the number of allocated rows in the result is raised.

*Default value is 10.*

**Example.** Set the `alloc_limit` parameter.

```opensips
modparam("db\_sqlite", "alloc\_limit", 25)
```
### `busy_timeout` (integer)

This parameter sets the default busy_handler for the SQLite library, that sleeps for a specified amount of time when a table is locked. The handler will sleep multiple times until at least the specified "busy_timeout" duration (in milliseconds) has been reached. Setting this parameter to a value less than or equal to zero turns off all busy handlers. (read more in the SQLite official documentation)

*Default value is 500.*

**Example.** Set the `busy_timeout` parameter.

```opensips
modparam("db\_sqlite", "busy\_timeout", 5000)
```
### `exec_pragma` (string)

This parameter allows configuring an SQLite database with "PRAGMA" statements, (read more in the SQLite official documentation) To use this functionality you must specify the exec_pragma parameter value as "pragma-name=pragma-value". Multiple parameters with the same name can be specified, and they will be executed one by one on every database connection. If a parameter has an incorrect name or syntax, it will be ignored by SQLite without any error messages.

*Default value is no PRAGMA statements are executed.*

**Example.** Set the `exec_pragma` parameter.

```opensips
modparam("db\_sqlite", "exec\_pragma", "journal\_mode=wal")
modparam("db\_sqlite", "exec\_pragma", "synchronous=normal")
modparam("db\_sqlite", "exec\_pragma", "cache\_size=-2000")
```
### `load_extension` (string)

This parameter enables extension loading, similiar to ".load" functionality in sqlite3, extenions like sqlite3-pcre which enables REGEX function. In order to use this functionality you must specify the library path (.so file) and the entry point which represents the function to be called by the sqlite library (read more at sqlite load_extension official documentation), separated by ";" delimiter. The entry point paramter can miss, so you won't need to use the delimitier in this case.

*Default value is no extension is loaded.*

**Example.** Set the `load_extension` parameter.

```opensips
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so")
modparam("db\_sqlite", "load\_extension", "/usr/lib/sqlite3/pcre.so;sqlite3\_extension\_init")
```

## Configuration Examples

### Set `alloc_limit` parameter

Using _alloc_limit_ parameter you can specify the number with which the number of allocated rows in the result is raised.

```opensips
...
modparam("db_sqlite", "alloc_limit", 25)
...
```
### Set `load_extension` parameter

This parameter enables extension loading, similiar to ".load" functionality in sqlite3, extenions like sqlite3-pcre which enables REGEX function.

```opensips
...
modparam("db_sqlite", "load_extension", "/usr/lib/sqlite3/pcre.so")
modparam("db_sqlite", "load_extension", "/usr/lib/sqlite3/pcre.so;sqlite3_extension_init")
...
```
### Set `busy_timeout` parameter

This parameter sets the default busy_handler for the SQLite library, that sleeps for a specified amount of time when a table is locked.

```opensips
...
modparam("db_sqlite", "busy_timeout", 5000)
...
```
### Set `exec_pragma` parameter

This parameter allows configuring an SQLite database with "PRAGMA" statements.

```opensips
...
modparam("db_sqlite", "exec_pragma", "journal_mode=wal")
modparam("db_sqlite", "exec_pragma", "synchronous=normal")
modparam("db_sqlite", "exec_pragma", "cache_size=-2000")
...
```
