# db_http Module Reference
<!-- generated-from: data/4.0/modules/db_http.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 db_http module. Read this file when configuring or debugging the db_http module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides access to a database that is implemented as a HTTP server. It may be used in special cases where traversing firewalls is a problem, or where data encryption is required.

In order to use this module you must have a server that can communicate via HTTP or HTTPS with this module that follows exactly the format decribed in the specifications section.

The module can provide SSL, authentication, and all the functionalities of an opensips db as long as the server supports them ( except result_fetch).

There is a slight difference between the url of db_http and the urls of the other db modules. The url doesn't have to contain the database name. Instead, everything that is after the address is considered to be a path to the db resource, it may be missing.

Even if using HTTPS the url must begin with "http://" , and the SSL parameter for the module must be set to 1.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libcurl`

## Exported Parameters

### `SSL` (integer)

Whether or not to use SSL.

If value is 1 the module will use https otherwise it will use http.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("db_http", "SSL",1)
```
### `cap_insert_update` (integer)

Whether or not the server supports insert_update capabilities.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("db_http", "cap_insert_update", 1)
```
### `cap_last_inserted_id` (integer)

Whether or not the server supports last_inserted_id capabilities.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("db_http", "cap_last_inserted_id", 1)
```
### `cap_raw_query` (integer)

Whether or not the server supports raw queries.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("db_http", "cap_raw_query", 1)
```
### `cap_replace` (integer)

Whether or not the server supports replace capabilities.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("db_http", "cap_replace", 1)
```
### `disable_expect` (integer)

Disables automatic 'Expect: 100-continue' behavior in libcurl for requests over 1024 bytes in size. This can help reduce latency by saving a network round-trip for large records. For more information on this behavior please seee rfc2616 section 8.2.3.

*Default value is 0 (off).*

**Example.** 1.

```opensips
modparam("db_http", "disable_expect",1)
```
### `field_delimiter` (string)

Character to be used to delimit fields in the reply.Only one char may be set.

*Default value is ;.*

**Example.** ;.

```opensips
modparam("db_http", "field_delimiter",";")
```
### `quote_delimiter` (string)

Character to be used to quote fields that require quoting in the reply.Only one char may be set.

*Default value is |.*

**Example.** |.

```opensips
modparam("db_http", "quote_delimiter","|")
```
### `row_delimiter` (string)

Character to be used to delimit rows in the reply.Only one char may be set.

*Default value is \n.*

**Example.** \n.

```opensips
modparam("db_http", "row_delimiter","\\n")
```
### `timeout` (integer)

The maximum number of milliseconds that the HTTP ops are allowed to last

*Default value is 30000 ( 30 seconds ).*

**Example.** 5000.

```opensips
modparam("db_http", "timeout",5000)
```
### `value_delimiter` (string)

The delimiter used to separate multiple fields of a single variable (see [Section 1.5.2, “Variables”](#http-variables "1.5.2. Variables")). Only one char may be set.

*Default value is ,.*

**Example.** ;.

```opensips
modparam("db_http", "value_delimiter",";")
```

## Configuration Examples

### Setting db_url for a module

Demonstrates how to set the db_url for a module to use the db_http module.

```opensips
...
modparam("presence", "db_url","http://user:pass@localhost:13100")
or
modparam("presence", "db_url","http://user:pass@www.some.com/some/some")
...
```
### Set `SSL` parameter

Sets the SSL parameter to 1.

```opensips
...
modparam("db_http", "SSL",1)
...
```
### Set `cap_raw_query` parameter

Sets the cap_raw_query parameter to 1.

```opensips
...
modparam("db_http", "cap_raw_query", 1)
...
```
### Set `cap_replace` parameter

Sets the cap_replace parameter to 1.

```opensips
...
modparam("db_http", "cap_replace", 1)
...
```
### Set `cap_insert_update` parameter

Sets the cap_insert_update parameter to 1.

```opensips
...
modparam("db_http", "cap_insert_update", 1)
...
```
### Set `cap_last_inserted_id` parameter

Sets the cap_last_inserted_id parameter to 1.

```opensips
...
modparam("db_http", "cap_last_inserted_id", 1)
...
```
### Set `field_delimiter` parameter

Sets the field_delimiter parameter.

```opensips
...
modparam("db_http", "field_delimiter",";")
...
```
### Set `row_delimiter` parameter

Sets the row_delimiter parameter.

```opensips
...
modparam("db_http", "row_delimiter","\\n")
...
```
### Set `quote_delimiter` parameter

Sets the quote_delimiter parameter.

```opensips
...
modparam("db_http", "quote_delimiter","|")
...
```
### Set `value_delimiter` parameter

Sets the value_delimiter parameter.

```opensips
...
modparam("db_http", "value_delimiter",";")
...
```
### Set `timeout` parameter

Sets the timeout parameter.

```opensips
...
modparam("db_http", "timeout",5000)
...
```
### Set `disable_expect` parameter

Sets the disable_expect parameter to 1.

```opensips
...
modparam("db_http", "disable_expect",1)
...
```
