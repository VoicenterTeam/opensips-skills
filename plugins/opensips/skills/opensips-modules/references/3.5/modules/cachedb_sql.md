# cachedb_sql Module Reference
<!-- generated-from: data/3.5/modules/cachedb_sql.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 cachedb_sql module. Read this file when configuring or debugging the cachedb_sql module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module is an implementation of a cache system designed to work with a regular SQL-based server. It uses the internal DB interface to connect to the back-end, and also implements the Key-Value interface exported from the core.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `cache_clean_period` (integer)

The interval in seconds at which the expired keys will be removed from the database. Default value is 60 ( seconds )

*Default value is 60.*

**Example.** 10.

```opensips
modparam("cachedb\_sql", "cache\_clean\_period",10);
```
### `cachedb_url` (string)

The url of the Database that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations.

The format to follow is : sql:\[conn\_id\]-dburl

The parameter can be set multiple times to create multiple connections accessible from the OpenSIPS script.

**Example.** sql:1st-mysql://root:vlad@localhost/opensips_sql.

```opensips
modparam("cachedb\_sql", "cachedb\_url", "sql:1st-mysql://root:vlad@localhost/opensips\_sql")
```
### `counter_column` (string)

The column where the counter value will be stored

**Example.** some_name.

```opensips
modparam("cachedb\_sql", "counter\_column","some\_name");
```
### `db_table` (string)

The table of the Database that OpenSIPS will connect to in order to use the from script cache\_store,cache\_fetch, etc operations.

**Example.** my_table.

```opensips
modparam("cachedb\_sql", "db\_table","my\_table");
```
### `expires_column` (string)

The column where the expires will be stored

**Example.** some_name.

```opensips
modparam("cachedb\_sql", "expires\_column","some\_name");
```
### `key_column` (string)

The column where the key will be stored

**Example.** some_name.

```opensips
modparam("cachedb\_sql", "key\_column","some\_name");
```
### `value_column` (string)

The column where the value will be stored

**Example.** some_name.

```opensips
modparam("cachedb\_sql", "value\_column","some\_name");
```

## Configuration Examples

### Set `db_url` parameter

The url of the Database that OpenSIPS will connect to in order to use the from script cache_store,cache_fetch, etc operations. The format to follow is : sql:[conn_id]-dburl The parameter can be set multiple times to create multiple connections accessible from the OpenSIPS script.

```opensips
...
modparam("cachedb_sql", "cachedb_url", "sql:1st-mysql://root:vlad@localhost/opensips_sql")
...
```
### Usage example

Usage example

```opensips
...
modparam("cachedb_sql", "cachedb_url", "sql:1st-mysql://root:vlad@localhost/opensips_sql")
modparam("cachedb_sql", "cachedb_url", "sql:2nd-postgres://root:vlad@localhost/opensips_pg")
...
...
cache_store("sql:1st-mysql","key","$ru value");
cache_store("sql:2nd-postgres","counter","10");
...
```
### Set `db_url` parameter

The table of the Database that OpenSIPS will connect to in order to use the from script cache_store,cache_fetch, etc operations.

```opensips
...
modparam("cachedb_sql", "db_table","my_table");
...
```
### Set `key_column` parameter

The column where the key will be stored

```opensips
...
modparam("cachedb_sql", "key_column","some_name");
...
```
### Set `value_column` parameter

The column where the value will be stored

```opensips
...
modparam("cachedb_sql", "value_column","some_name");
...
```
### Set `counter_column` parameter

The column where the counter value will be stored

```opensips
...
modparam("cachedb_sql", "counter_column","some_name");
...
```
### Set `expires_column` parameter

The column where the expires will be stored

```opensips
...
modparam("cachedb_sql", "expires_column","some_name");
...
```
### Set `cache_clean_period` parameter

The interval in seconds at which the expired keys will be removed from the database. Default value is 60 ( seconds )

```opensips
...
modparam("cachedb_sql", "cache_clean_period",10);
...
```
