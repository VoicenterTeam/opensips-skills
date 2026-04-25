# sql_cacher Module Reference
<!-- generated-from: data/3.5/modules/sql_cacher.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 sql_cacher module. Read this file when configuring or debugging the sql_cacher module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

The sql_cacher module introduces the possibility to cache data from a SQL-based database (using different OpenSIPS modules which implement the DB API) into a cache system implemented in OpenSIPS through the CacheDB Interface. This is done by specifying the databases URLs, SQL table to be used, desired columns to be cached and other details in the OpenSIPS configuration script.

## How It Works

The cached data is available in the script through the read-only pseudovariable “$sql_cached_value” similar to a Key-Value system. A specified column from the SQL table has the role of “key” therefore the value of this column along with the name of a required column are provided as "parameters" to the pseudovariable returning the appropriate value of the column.

There are two types of caching available:

*   _full caching_ - the entire SQL table (all the rows) is loaded into the cache at OpenSIPS startup;
    
*   _on demand_ - the rows of the SQL table are loaded at runtime when appropriate keys are requested.

For on demand caching, the stored values have a configurable expire period after which they are permanently removed unless an MI reload function is called for a specific key. In the case of full caching the data is automatically reloaded at a configurable interval. Consequently if the data in the SQL database changes and a MI reload function is called, the old data remains in cache only until it expires.

## Dependencies

### OpenSIPs Modules

- `The OpenSIPS modules that offer actual database back-end connection`

### External Libraries

None.

## Exported Parameters

### `bigint_to_str` (integer)

Controls bigint conversion. By default bigint values are returned as int. If the value stored in bigint is out of the int range, by enabling bigint to string conversion, the bigint value will be returned as string.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("sql_cacher", "bigint_to_str", 1)
```
### `cache_table` (string)

This parameter can be set multiple times in order to cache multiple SQL tables or even the same table but with a different configuration. The module distinguishes those different entries by an “id” string.

The caching entry is specified via this parameter that has it's own subparameters. Each of those parameters are separated by a delimiter configured by [spec_delimiter](#param_spec_delimiter "1.3.2.�spec_delimiter (string)") and have the following format:

_param_name=param_value_

The parameters are:

*   _id_ : cache entry id
    
*   _db_url_ : the URL of the SQL database
    
*   _cachedb_url_ : the URL of the CacheDB database
    
*   _table_ : SQL database table name
    
*   _key_ : SQL database column name of the “key” column
    
*   _key_type_ : data type for the SQL "key" column:
    
    *   string
        
    *   int

If not present, default value is “string”
    
*   _columns_ : names of the columns to be cached from the SQL database, separated by a delimiter configured by [columns_delimiter](#param_columns_delimiter "1.3.4.�columns_delimiter (string)").
    
    If not present, all the columns from the table will be cached
    
*   _on_demand_ : specifies the type of caching:
    
    *   0 : full caching
        
    *   1 : on demand

If not present, default value is “0”
    
*   _expire_ : expire period for the values stored in the cache for the on demand caching type in seconds
    
    If not present, default value is “1 hour”

The parameters must be given in the exact order specified above.

Overall, the parameter does not have a default value, it must be set at least once in order to cache any table.

**Notes:** The parameters must be given in the exact order specified above.

**Example.** id=caching_name
db_url=mysql://root:opensips@localhost/opensips_2_2
cachedb_url=mongodb:mycluster://127.0.0.1:27017/db.col
table=table_name
key=column_name_0
columns=column_name_1 column_name_2 column_name_3
on_demand=0.

```opensips
modparam("sql_cacher", "cache_table",
"id=caching_name
db_url=mysql://root:opensips@localhost/opensips_2_2
cachedb_url=mongodb:mycluster://127.0.0.1:27017/db.col
table=table_name
key=column_name_0
columns=column_name_1 column_name_2 column_name_3
on_demand=0")
```
### `columns_delimiter` (string)

The delimiter to be used in the _columns_ subparameter of the caching entry specification provided in the _cache_table_ parameter to separate the desired columns names. It must be a single character.

*Default value is  .*

**Example.** ,.

```opensips
modparam("sql_cacher", "columns_delimiter", ",")
```
### `full_caching_expire` (integer)

Expire period for the values stored in cache for the full caching type in seconds. This is the longest time that deleted or modified data remains in cache.

*Default value is 24 hours.*

**Example.** 3600.

```opensips
modparam("sql_cacher", "full_caching_expire", 3600)
```
### `pvar_delimiter` (string)

The delimiter to be used in the “$sql_cached_value” pseudovariable to separate the caching id, the desired column name and the value of the key. It must be a single character.

*Default value is :.*

**Example.**  .

```opensips
modparam("sql_cacher", "pvar_delimiter", " ")
```
### `reload_interval` (integer)

This parameter represents how many seconds before the data expires (for full caching) the automatic reloading is triggered.

*Default value is 60 s.*

**Example.** 5.

```opensips
modparam("sql_cacher", "reload_interval", 5)
```
### `spec_delimiter` (string)

The delimiter to be used in the caching entry specification provided in the _cache_table_ parameter to separate the subparameters. It must be a single character.

*Default value is newline.*

**Example.** \n.

```opensips
modparam("sql_cacher", "spec_delimiter", "\\n")
```
### `sql_fetch_nr_rows` (integer)

The number of rows to be fetched into OpenSIPS private memory in one chunk from the SQL database driver. When querying large tables, adjust this parameter accordingly to avoid the filling of OpenSIPS private memory.

*Default value is 100.*

**Example.** 1000.

```opensips
modparam("sql_cacher", "sql_fetch_nr_rows", 1000)
```

## Exported Pseudo-Variables

### `$sql_cached_value(id{sep}col{sep}key)`

The cached data is available through this read-only PV.The format is the following:

*   _sep_ : separator configured by [pvar_delimiter](#param_pvar_delimiter "1.3.3.�pvar_delimiter (string)")
    
*   _id_ : cache entry id
    
*   _col_ : name of the required column
    
*   _key_ : value of the “key” column
    
**Example�1.10.�`sql_cached_value(id{sep}col{sep}key) pseudo-variable` usage**

...
$avp(a) = $sql_cached_value(caching_name:column_name_1:key1);
...

- **Type:** string
- **Read/write:** read-only
- **Scope:** 

## Exported MI Functions

### `sql_cacher_reload`

Reloads the entire SQL table in cache or the single key (if key provided) in _full caching_ mode.

Reloads the given key or invalidates all the keys in cache in _on demand_ mode.

**Parameters:**

- `id` *(string, required)* — the caching entry's id
- `key` *(string, optional)* — the specific key to be reloaded.

**Example.** sql_cacher_reload usage

```bash
$ opensips-cli -x mi sql\_cacher\_reload subs\_caching
```

**Example.** sql_cacher_reload usage

```bash
$ opensips-cli -x mi sql\_cacher\_reload subs\_caching alice@domain.com
```

## Configuration Examples

### `cache_table` parameter usage

`cache_table` parameter usage

```opensips
modparam("sql_cacher", "cache_table",
"id=caching_name
db_url=mysql://root:opensips@localhost/opensips_2_2
cachedb_url=mongodb:mycluster://127.0.0.1:27017/db.col
table=table_name
key=column_name_0
columns=column_name_1 column_name_2 column_name_3
on_demand=0")
```
### `spec_delimiter` parameter usage

`spec_delimiter` parameter usage

```opensips
modparam("sql_cacher", "spec_delimiter", "\n")
```
### `pvar_delimiter` parameter usage

`pvar_delimiter` parameter usage

```opensips
modparam("sql_cacher", "pvar_delimiter", " ")
```
### `columns_delimiter` parameter usage

`columns_delimiter` parameter usage

```opensips
modparam("sql_cacher", "columns_delimiter", ",")
```
### `sql_fetch_nr_rows` parameter usage

`sql_fetch_nr_rows` parameter usage

```opensips
modparam("sql_cacher", "sql_fetch_nr_rows", 1000)
```
### `full_caching_expire` parameter usage

`full_caching_expire` parameter usage

```opensips
modparam("sql_cacher", "full_caching_expire", 3600)
```
### `reload_interval` parameter usage

`reload_interval` parameter usage

```opensips
modparam("sql_cacher", "reload_interval", 5)
```
### `bigint_to_str` parameter usage

`bigint_to_str` parameter usage

```opensips
modparam("sql_cacher", "bigint_to_str", 1)
```
### `sql_cacher_reload` usage

`sql_cacher_reload` usage

```opensips
...
$ opensips-cli -x mi sql_cacher_reload subs_caching
...
$ opensips-cli -x mi sql_cacher_reload subs_caching alice@domain.com
...
```
### `$sql_cached_value(id{sep}col{sep}key) pseudo-variable` usage

`$sql_cached_value(id{sep}col{sep}key) pseudo-variable` usage

```opensips
...
$avp(a) = $sql_cached_value(caching_name:column_name_1:key1);
...
```
### Example database content - carrierfailureroute table

Example database content - carrierfailureroute table

```opensips
...
+----+---------+-----------+------------+--------+-----+-------------+
| id | domain  | host_name | reply_code | flags | mask | next_domain |
+----+---------+-----------+------------+-------+------+-------------+
|  1 |      99 |           | 408        |    16 |   16 |             |
|  2 |      99 | gw1       | 404        |     0 |    0 | 100         |
|  3 |      99 | gw2       | 50.        |     0 |    0 | 100         |
|  4 |      99 |           | 404        |  2048 | 2112 | asterisk-1  |
+----+---------+-----------+------------+-------+------+-------------+
...
```
### Setting the `cache_table` parameter

Setting the `cache_table` parameter

```opensips
modparam("sql_cacher", "cache_table",
"id=carrier_fr_caching
db_url=mysql://root:opensips@localhost/opensips
cachedb_url=mongodb:mycluster://127.0.0.1:27017/my_db.col
table=carrierfailureroute
key=id
columns=host_name reply_code flags next_domain")
```
### Accessing cached values

Accessing cached values

```opensips
...
$avp(rc1) = $sql_cached_value(carrier_fr_caching:reply_code:1);
$avp(rc2) = $sql_cached_value(carrier_fr_caching:reply_code:2);
...
var(some_id)=4;
$avp(nd) = $sql_cached_value(carrier_fr_caching:next_domain:$var(some_id));
...
xlog("host name is: $sql_cached_value(carrier_fr_caching:host_name:2)");
...
```
