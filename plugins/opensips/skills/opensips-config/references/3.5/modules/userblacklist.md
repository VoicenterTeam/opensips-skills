# userblacklist Module Reference
<!-- generated-from: data/3.5/modules/userblacklist.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 userblacklist module. Read this file when configuring or debugging the userblacklist module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The userblacklist module allows OpenSIPS to handle blacklists on a per user basis. This information is stored in a database table, which is queried to decide if the number (more exactly, the request URI user) is blacklisted or not.

An additional functionality that this module provides is the ability to handle global blacklists. This lists are loaded on startup into memory, thus providing a better performance then in the userblacklist case. This global blacklists are useful to only allow calls to certain international destinations, i.e. block all not whitelisted numbers. They could also used to prevent the blacklisting of important numbers, as whitelisting is supported too. This is useful for example to prevent the customer from blocking emergency call number or service hotlines.

The module exports two functions, check_blacklist and check_user_blacklist for usage in the config file. Furthermore its provide a FIFO function to reload the global blacklist cache.

## Dependencies

### OpenSIPs Modules

- `database` — Any database module

### External Libraries

None.

## Exported Parameters

### `db_table` (string)

Name of the table where the user blacklist data is stored.

*Default value is userblacklist.*

**Example.** userblacklist.

```opensips
modparam("userblacklist", "db_table", "userblacklist")
```
### `db_url` (string)

Url to the database containing the routing data.

*Default value is mysql://opensipsro:opensipsro@localhost/opensips.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
modparam("userblacklist", "db_url", "dbdriver://username:password@dbhost/dbname")
```
### `use_domain` (integer)

If set to non-zero value, the domain column in the userblacklist is used.

*Default value is 0.*

**Example.** 0.

```opensips
modparam("userblacklist", "use_domain", 0)
```

## Exported Functions

### `check_blacklist (table)`

Finds the longest prefix that matches the request URI for the given table. If a match is found and it is not set to whitelist, false is returned. Otherwise, true is returned.

**Parameters:**

- `table` *(string, required)* — 

**Return codes:**

- `false` — If a match is found and it is not set to whitelist
- `true` — Otherwise

**Example.** check_blacklist usage.

```opensips
if (!check_blacklist("global_blacklist")))
	sl_send_reply(403, "Forbidden");
	exit;
}

```

### `check_user_blacklist (user, domain, [number], [table])`

Finds the longest prefix that matches the request URI user (or the number parameter) for the given user and domain name in the database. If a match is found and it is not set to whitelist, false is returned. Otherwise, true is returned. The number parameter can be used to check for example against the from URI user.

**Parameters:**

- `domain` *(string, required)* — 
- `number` *(string, optional)* — If ommited, the defalut is used.
- `table` *(string, optional)* — If ommited, the defalut is used.
- `user` *(string, required)* — 

**Return codes:**

- `false` — If a match is found and it is not set to whitelist
- `true` — Otherwise

**Example.** check_user_blacklist usage.

```opensips
if (!check_user_blacklist("user", "domain.com"))
	sl_send_reply(403, "Forbidden");
	exit;
}

```

## Exported MI Functions

### `reload_blacklist`

Reload the internal global blacklist cache. This is necessary after the database tables for the global blacklist have been changed.

**Example.** reload_blacklists usage

```opensips-cli
opensips-cli -x mi reload_blacklist
```

## Configuration Examples

### Set `db_url` parameter

Demonstrates setting the `db_url` parameter.

```opensips
...
modparam("userblacklist", "db_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `db_table` parameter

Demonstrates setting the `db_table` parameter.

```opensips
...
modparam("userblacklist", "db_table", "userblacklist")
...
```
### Set `use_domain` parameter

Demonstrates setting the `use_domain` parameter.

```opensips
...
modparam("userblacklist", "use_domain", 0)
...
```
### `check_user_blacklist` usage

Demonstrates usage of the `check_user_blacklist` function.

```opensips
...
if (!check_user_blacklist("user", "domain.com"))
	sl_send_reply(403, "Forbidden");
	exit;
}
...
```
### `check_blacklist` usage

Demonstrates usage of the `check_blacklist` function.

```opensips
...
if (!check_blacklist("global_blacklist")))
	sl_send_reply(403, "Forbidden");
	exit;
}
...
```
### `reload_blacklists` usage

Demonstrates usage of the `reload_blacklists` MI function.

```opensips
...
opensips-cli -x mi reload_blacklist
...
```
### Example database content - globalblacklist table

Demonstrates example database content for the globalblacklist table.

```opensips
...
+----+-----------+-----------+
| id | prefix    | whitelist |
+----+-----------+-----------+
|  1 |           |         0 |
|  2 | 1         |         1 |
|  3 | 123456    |         0 |
|  4 | 123455787 |         0 |
+----+-----------+-----------+
...
```

This table will setup a global blacklist for all numbers, only allowing calls starting with “1”. Numbers that starting with “123456” and “123455787” are also blacklisted, because the longest prefix will be matched.
### Example database content - userblacklist table

Demonstrates example database content for the userblacklist table.

```opensips
...
+----+----------------+-------------+-----------+-----------+
| id | username       | domain      | prefix    | whitelist |
+----+----------------+-------------+-----------+-----------+
| 23 | 49721123456788 |             | 1234      |         0 |
| 22 | 49721123456788 |             | 123456788 |         1 |
| 21 | 49721123456789 |             | 12345     |         0 |
| 20 | 494675231      |             | 499034133 |         1 |
| 19 | 494675231      | test        | 499034132 |         0 |
| 18 | 494675453      | test.domain | 49901     |         0 |
| 17 | 494675454      |             | 49900     |         0 |
+----+----------------+-------------+-----------+-----------+
...
```

This table will setup user specific blacklists for certain usernames. For example for user “49721123456788” the prefix “1234” will be not allowed, but the number “123456788” is allowed. Additionally a domain could be specified that is used for username matching if the “use_domain” parameter is set.
