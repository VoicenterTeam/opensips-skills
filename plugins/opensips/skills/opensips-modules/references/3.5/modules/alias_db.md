# ALIAS_DB Module Reference
<!-- generated-from: data/3.5/modules/alias_db.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 ALIAS_DB module. Read this file when configuring or debugging the ALIAS_DB module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

ALIAS_DB module can be used as an alternative for user aliases via usrloc. The main feature is that it does not store all adjacent data as for user location and always uses database for search (no memory caching).

Having no memory caching, search speed might decrease but provisioning is easier. With very fast databases like MySQL, speed penalty can be lowered. Also, search can be performed on different tables in the same script.

## Dependencies

### OpenSIPs Modules

- `database module` — must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `alias_domain_column` (string)

Name of the column storing alias domain.

*Default value is alias_domain.*

**Example.** adomain.

```opensips
modparam("alias\_db", "alias\_domain\_column", "adomain")
```
### `alias_user_column` (string)

Name of the column storing alias username.

*Default value is alias_username.*

**Example.** auser.

```opensips
modparam("alias\_db", "alias\_user\_column", "auser")
```
### `append_branches` (integer)

If the alias resolves to many SIP IDs, the first is replacing the R-URI, the rest are added as branches.

*Default value is 0.*

**Possible values:**

- 0
- 1

**Example.** 1.

```opensips
modparam("alias\_db", "append\_branches", 1)
```
### `db_url` (string)

Database URL.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("alias\_db", "db\_url", "dbdriver://username:password@dbhost/dbname")
```
### `domain_column` (string)

Name of the column storing user's domain.

*Default value is domain.*

**Example.** sdomain.

```opensips
modparam("alias\_db", "domain\_column", "sdomain")
```
### `domain_prefix` (string)

Specifies the prefix to be stripped from the domain in R-URI before doing the search.

*Default value is NULL.*

**Example.** sip..

```opensips
modparam("alias\_db", "domain\_prefix", "sip.")
```
### `user_column` (string)

Name of the column storing username.

*Default value is username.*

**Example.** susername.

```opensips
modparam("alias\_db", "user\_column", "susername")
```

## Exported Functions

### `alias_db_find(table_name, input_uri, output_var, [flags])`

The function is very similar to `alias_db_lookup()`, but instead of using fixed input (RURI) and output (RURI) is able to get the input SIP URI from a pseudo-variable and place the result back also in a pseudo-variable. The function is useful as the alias lookup does not affect the request itself (no RURI changes), can be used in a reply context (as it does not work with RURI only) and can be used for others URI than the RURI (To URI, From URI, custom URI).

**Parameters:**

- `flags` *(string, optional)* — set of flags (char based flags) to control the alias lookup process
  - `d`
  - `r`
- `input_uri` *(string, required)* — a SIP URI to look up
- `output_var` *(var, required)* — a variable to hold the SIP URI result
- `table_name` *(string, required)* — the name of the table to search for the alias

**Return codes:**

- `TRUE` — if any alias mapping was found and returned

**Usable from:** REQUEST_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE

**Related:**

- `alias_db_lookup`

**Example.** alias_db_find() usage.

```opensips
# do revers alias lookup and find the alias for the FROM URI
alias_db_find("dbaliases", $fu, $avp(from_alias), "r");
```

### `alias_db_lookup(table_name, [flags])`

The function takes the R-URI and search to see whether it is an alias or not. If it is an alias for a local user, the R-URI is replaced with user's SIP uri.

**Parameters:**

- `flags` *(string, optional)* — set of character flags to control the alias lookup process
  - `d`
  - `r`
- `table_name` *(string, required)* — the name of the table to search for the alias

**Return codes:**

- `TRUE` — if R-URI is alias and it was replaced by user's SIP uri

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** alias_db_lookup() usage.

```opensips
alias_db_lookup("dbaliases", "rd");
alias_db_lookup("dba_$(rU{s.substr,0,1})");
```

## Configuration Examples

### Set `db_url` parameter

Database URL.

```opensips
...
modparam("alias\_db", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `user_column` parameter

Name of the column storing username.

```opensips
...
modparam("alias\_db", "user\_column", "susername")
...
```
### Set `domain_column` parameter

Name of the column storing user's domain.

```opensips
...
modparam("alias\_db", "domain\_column", "sdomain")
...
```
### Set `alias_user_column` parameter

Name of the column storing alias username.

```opensips
...
modparam("alias\_db", "alias\_user\_column", "auser")
...
```
### Set `alias_domain_column` parameter

Name of the column storing alias domain.

```opensips
...
modparam("alias\_db", "alias\_domain\_column", "adomain")
...
```
### Set `domain_prefix` parameter

Specifies the prefix to be stripped from the domain in R-URI before doing the search.

```opensips
...
modparam("alias\_db", "domain\_prefix", "sip.")
...
```
### Set `append_branches` parameter

If the alias resolves to many SIP IDs, the first is replacing the R-URI, the rest are added as branches.

```opensips
...
modparam("alias\_db", "append\_branches", 1)
...
```
### `alias_db_lookup()` usage

The function takes the R-URI and search to see whether it is an alias or not. If it is an alias for a local user, the R-URI is replaced with user's SIP uri.

```opensips
...
alias\_db\_lookup("dbaliases", "rd");
alias\_db\_lookup("dba\_$(rU{s.substr,0,1})");
...
```
### `alias_db_find()` usage

The function is very similar to `alias_db_lookup()`, but instead of using fixed input (RURI) and output (RURI) is able to get the input SIP URI from a pseudo-variable and place the result back also in a pseudo-variable.

```opensips
...
# do revers alias lookup and find the alias for the FROM URI
alias\_db\_find("dbaliases", $fu, $avp(from\_alias), "r");
...
```
