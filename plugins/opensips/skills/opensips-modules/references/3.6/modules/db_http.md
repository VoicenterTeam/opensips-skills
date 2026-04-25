# db_http Module Reference
<!-- generated-from: data/3.6/modules/db_http.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 db_http module. Read this file when configuring or debugging the db_http module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides access to a database that is implemented as a HTTP server. It may be used in special cases where traversing firewalls is a problem, or where data encryption is required.

In order to use this module you must have a server that can communicate via HTTP or HTTPS with this module that follows exactly the format decribed in the specifications section.

The module can provide SSL, authentication, and all the functionalities of an opensips db as long as the server supports them ( except result_fetch).

There is a slight difference between the url of db_http and the urls of the other db modules. The url doesn't have to contain the database name. Instead, everything that is after the address is considered to be a path to the db resource, it may be missing.

Even if using HTTPS the url must begin with "http://" , and the SSL parameter for the module must be set to 1.

**Example 1.1. Setting db_url for a module**

...
modparam("presence", "db_url","http://user:pass@localhost:13100")
or
modparam("presence", "db_url","http://user:pass@www.some.com/some/some")
...

## How It Works

### 1.5. Server specifications

#### 1.5.1. Queries

The server must accept queries as HTTP queries.

The queries are of 2 types : GET and POST.Both set variables that must be interpreted by the server. All values are URL-encoded.

There are several types of queries and the server can tell them apart by the query_type variable. Each type of query uses specific variables simillar to those in the opensips db_api.

**Example 1.13. Example query.**

...
GET /presentity/?c=username,domain,event,expires HTTP/1.1
...

#### 1.5.2. Variables

A description of all the variables. Each variable can have either a single value or a comma-separated list of values. Each variable has a special meaning and can be used only with certain queries.

The table on which operations will take place will be encoded in the url as the end of the url ( www.some.com/users will point to the users table).

*   k=
    
    Describes the keys (columns) that will be used for comparison.Can have multiple values.
    
*   op=
    
    Describes the operators that will be used for comparison.Can have multiple values.
    
*   v=
    
    Describes the values that columns will be compaired against. Can have multiple values.
    
*   c=
    
    Describes the columns that will be selected from the result.Can have multiple values.
    
*   o=
    
    The column that the result will be ordered by. Has a single value.
    
*   uk=
    
    The keys(columns) that will be updated. Can have multiple values.
    
*   uv=
    
    The new values that will be put in the columns. Can have multiple values.
    
*   q=
    
    Describes a raw query. Will only be used if the server supports raw queries. Has a single value.
    
*   query_type=
    
    Describes the type of the current query. Can have a single value as described in the Query Types section.Has a single value. Will be present in all queries except the "SELECT" (normal query).

**Example 1.14. Example query with variables.**

...
GET /presentity/?c=username,domain,event,expires HTTP/1.1
GET /version/?k=table_name&v=xcap&c=table_version HTTP/1.1 
...
...
POST /active_watchers HTTP/1.1

k=id&v=100&query_type=insert
...

#### 1.5.3. Query Types

The types of the queries are described by the query_type variable. The value of the variable will be set to the exact name of the query.

Queries for "SELECT" use GET and the rest use POST (insert, update, delete, replace, insert_update).

*   normal query
    
    Uses the k, op, v, c and o variables. This will not set the query_type variable and will use GET.
    
*   delete
    
    Uses the k, op and v variables.
    
*   insert
    
    Uses the k and v variables.
    
*   update
    
    Uses the k,op,v,uk and uv variables.
    
*   replace
    
    Uses the k and v variables. This is an optional type of query. If the module is not configured to use it it will not.
    
*   insert_update
    
    Uses the k and v variables. This is an optional type of query. If the module is not configured to use it it will not.
    
*   custom
    
    Uses the q variable. This is an optional type of query. If the module is not configured to use it it will not.

**Example 1.15. More query examples.**

...
POST /active_watchers HTTP/1.1

k=id&op=%3D&v=100&query_type=delete
...

...
POST /active_watchers HTTP/1.1

k=id&op=%3D&v=100&uk=id&uv=101&query_type=update
...

#### 1.5.4. NULL values in queries

NULL values in queries are represented as a string of length 1 containing a single character with value '\0'.

**Example 1.16. NULL query example.**

...
POST /active_watchers HTTP/1.1

k=id&op=%3D&v=%00&query_type=delete
...

#### 1.5.5. Server Replies

If the query is ok (even if the answer is empty) the server must reply with a 200 OK HTTP reply with a body containing the types and values of the columns.

The server must reply with a delimiter separated list of values and columns.

Each element in the list must be seperated from the one before it by a field delimiter that must be the same as the one set as a parameter from the script for the module. The last element of each line must not be followed by a field delimiter, but by a row delimiter.

The first line of the reply must contain a list of the types of values of each column. The types can be any from the list: integer, string, str, blob, date.

Each following line contains the values of each row from the result.

If the query produced an error the server must reply with a HTTP 500 reply, or with a corresponding error code (404, 401).

**Example 1.17. Example Reply.**

...
int;string;blob
6;something=something;1000
100;mine;10002030
...

#### 1.5.6. Reply Quoting

Because the values may contain delimiters inside, the server must perform quoting when necessary (there is no problem if it does it even when it is not necessary).

A quote delimiter must be defined and must be the same as the one set from the script ( by default it is "|" ).

If a value contains a field , row or a quote delimiter it must be placed under quotes. A quote delimiter inside a value must be preceeded by another quote delimiter.

**Example 1.18. Quoting Example.**

...
int;string;blob
6;|ana;maria|;1000
100;mine;10002030
3;mine;|some||more;|
...

#### 1.5.7. Last inserted id

This is an optional feature and may be enabled if one wants to use it.

In order to use this feature the server must place the id of the last insert in the 200 reply for each insert query.

#### 1.5.8. Authentication and SSL

If the server supports authentication and SSL, the module can be enabled to use SSL. Authentication will always be used if needed.

The module will try to use the most secure type of authentication that is provided by the server from: Basic, Digest,GSSNEGOTIATE and NTLM.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libcurl`

## Exported Parameters

### `SSL` (integer)

Whether or not to use SSL. If value is 1 the module will use https otherwise it will use http.

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
...
modparam("db_http", "disable_expect",1)
...
```
### `field_delimiter` (string)

Character to be used to delimit fields in the reply.Only one char may be set.

*Default value is ;.*

**Example.** ;.

```opensips
modparam("db\_http", "field\_delimiter",";")
```
### `quote_delimiter` (string)

Character to be used to quote fields that require quoting in the reply.Only one char may be set.

*Default value is |.*

**Example.** |.

```opensips
modparam("db\_http", "quote\_delimiter","|")
```
### `row_delimiter` (string)

Character to be used to delimit rows in the reply.Only one char may be set.

*Default value is \n.*

**Example.** \n.

```opensips
modparam("db\_http", "row\_delimiter","\\n")
```
### `timeout` (integer)

The maximum number of milliseconds that the HTTP ops are allowed to last

*Default value is 30000 ( 30 seconds ).*

**Example.** 5000.

```opensips
modparam("db\_http", "timeout",5000)
```
### `value_delimiter` (string)

The delimiter used to separate multiple fields of a single variable (see Section 1.5.2, “Variables”). Only one char may be set.

*Default value is ,.*

**Example.** ;.

```opensips
modparam("db\_http", "value\_delimiter",";")
```

## Configuration Examples

### Setting db_url for a module

Demonstrates how to set the db_url parameter for a module using the http scheme.

```opensips
...
modparam("presence", "db\_url","http://user:pass@localhost:13100")
or
modparam("presence", "db\_url","http://user:pass@www.some.com/some/some")
...
```
### Set `SSL` parameter

Demonstrates setting the SSL parameter to 1.

```opensips
...
modparam("db\_http", "SSL",1)
...
```
### Set `cap_raw_query` parameter

Demonstrates setting the cap_raw_query parameter.

```opensips
...
modparam("db\_http", "cap\_raw\_query", 1)
...
```
### Set `cap_replace` parameter

Demonstrates setting the cap_replace parameter.

```opensips
...
modparam("db\_http", "cap\_replace", 1)
...
```
### Set `cap_insert_update` parameter

Demonstrates setting the cap_insert_update parameter.

```opensips
...
modparam("db\_http", "cap\_insert\_update", 1)
...
```
### Set `cap_last_inserted_id` parameter

Demonstrates setting the cap_last_inserted_id parameter.

```opensips
...
modparam("db\_http", "cap\_last\_inserted\_id", 1)
...
```
### Set `field_delimiter` parameter

Demonstrates setting the field_delimiter parameter.

```opensips
...
modparam("db\_http", "field\_delimiter",";")
...
```
### Set `row_delimiter` parameter

Demonstrates setting the row_delimiter parameter.

```opensips
...
modparam("db\_http", "row\_delimiter","\\n")
...
```
### Set `quote_delimiter` parameter

Demonstrates setting the quote_delimiter parameter.

```opensips
...
modparam("db\_http", "quote\_delimiter","|")
...
```
### Set `value_delimiter` parameter

Demonstrates setting the value_delimiter parameter.

```opensips
...
modparam("db\_http", "value\_delimiter",";")
...
```
### Set `timeout` parameter

Demonstrates setting the timeout parameter.

```opensips
...
modparam("db\_http", "timeout",5000)
...
```
### Set `disable_expect` parameter

Demonstrates setting the disable_expect parameter.

```opensips
...
modparam("db\_http", "disable\_expect",1)
...
```
