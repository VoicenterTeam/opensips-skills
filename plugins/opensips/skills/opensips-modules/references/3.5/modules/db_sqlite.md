# db_sqlite Module Reference
<!-- generated-from: data/3.5/modules/db_sqlite.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 db_sqlite module. Read this file when configuring or debugging the db_sqlite module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

- `libsqlite3-dev`

## Exported Parameters

### `alloc_limit` (integer)

Since the library does not support a function to return the number of rows in a query, this number is obtained using "count(*)" query. If we use multiple processes there is the risk ,since "count(*)" query and the actual "select" query, the number of rows in the result query to have changed, so realloc will be needed if the number is bigger. Using alloc_limit parameter you can specify the number with which the number of allocated rows in the result is raised.

*Default value is 10.*

**Example.** 25.

```opensips
modparam("db_sqlite", "alloc_limit", 25)
```
### `load_extension` (string)

This parameter enables extension loading, similiar to ".load" functionality in sqlite3, extenions like sqlite3-pcre which enables REGEX function. In order to use this functionality you must specify the library path (.so file) and the entry point which represents the function to be called by the sqlite library (read more at sqlite load_extension official documentation), separated by ";" delimiter. The entry point paramter can miss, so you won't need to use the delimitier in this case.

*Default value is no extension is loaded.*

**Example.** /usr/lib/sqlite3/pcre.so.

```opensips
modparam("db_sqlite", "load_extension", "/usr/lib/sqlite3/pcre.so")
modparam("db_sqlite", "load_extension", "/usr/lib/sqlite3/pcre.so;sqlite3_extension_init")
```

## Configuration Examples

### Example 1.1. Set `alloc_limit` parameter

Demonstrates setting the `alloc_limit` parameter.

```opensips
...
modparam("db_sqlite", "alloc_limit", 25)
...
```
### Example 1.2. Set `db_sqlite_alloc_limit` parameter

Demonstrates setting the `load_extension` parameter.

```opensips
...
modparam("db_sqlite", "load_extension", "/usr/lib/sqlite3/pcre.so")
modparam("db_sqlite", "load_extension", "/usr/lib/sqlite3/pcre.so;sqlite3_extension_init")
...
```
