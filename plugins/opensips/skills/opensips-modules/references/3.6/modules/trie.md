# trie Module Reference
<!-- generated-from: data/3.6/modules/trie.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 trie module. Read this file when configuring or debugging the trie module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

Trie is a module for efficiently caching and lookup of a set of prefixes ( stored in a trie data structure )

## Dependencies

### OpenSIPs Modules

- `a database module` — must be loaded before this module

### External Libraries

None.

## Exported Parameters

### `db_partitions_table` (string)

The name of the table containing partition definitions. To be used with `use_partitions` and `db_partitions_url`.

*Default value is trie\_partitions.*

**Example.** trie\_partition\_defs.

```opensips
modparam("trie", "db\_partitions\_table", "trie\_partition\_defs")
```
### `db_partitions_url` (string)

The url to the database containing partition-specific information.The `use_partitions` parameter must be set to 1.

*Default value is "NULL".*

**Example.** mysql://user:password@localhost/opensips\_partitions.

```opensips
modparam("trie", "db\_partitions\_url", "mysql://user:password@localhost/opensips\_partitions")
```
### `extra_prefix_chars` (string)

List of ASCII (0-127) characters to be additionally accepted in the prefixes. By default only '0' - '9' chars (digits) are accepted.

*Default value is NULL.*

**Example.** #-%.

```opensips
modparam("trie", "extra\_prefix\_chars", "#-%")
```
### `no_concurrent_reload` (integer)

If enabled, the module will not allow do run multiple trie\_reload MI commands in parallel (with overlapping) Any new reload will be rejected (and discarded) while an existing reload is in progress.

If you have a large routing set (millions of rules/prefixes), you should consider disabling concurrent reload as they will exhaust the shared memory (by reloading into memory, in the same time, multiple instances of routing data).

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
# do not allow parallel reload operations
modparam("trie", "no\_concurrent\_reload", 1)
```
### `trie_table` (string)

The name of the db table storing prefix rules.

*Default value is trie\_table.*

**Example.** my\_prefix\_table.

```opensips
modparam("trie", "trie\_table", "my\_prefix\_table")
```
### `use_partitions` (integer)

Flag to configure whether to use partitions for tries. If this flag is set then the `db_partitions_url` and `db_partitions_table` variables become mandatory.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("trie", "use\_partitions", 1)
```

## Exported Functions

### `trie_search(number, [flags], [trie_attrs_pvar], [match_prefix_pvar], [partition])`

Function to search for an entry ( number ) in a trie.

This function can be used from all routes.

If you set `use_partitions` to 1 the **partition** last parameter becomes mandatory.

All parameters are optional. Any of them may be ignored, provided the necessary separation marks "," are properly placed.

**Parameters:**

- `flags` *(string, optional)* — a list of letter-like flags for controlling the routing behavior. Possible flags are:
  - `L`
- `match_prefix_pvar` *(var, optional)* — a writable variable which will be the actual prefix matched in the trie.
- `number` *(str, required)* — number to be searched in the trie
- `partition` *(string, optional)* — the name of the trie partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on.
- `trie_attrs_pvar` *(var, optional)* — a writable variable which will be populated with the attributes of the matched trie rule.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ERROR_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** trie_search usage.

```opensips
if (trie_search("$rU","L",$avp(code_attrs),,"my_partition")) {
    # we found it in the trie, it's a match
    xlog("We found $rU in the trie with attrs $avp(code_attrs) \\n");
}
```

## Exported MI Functions

### `trie_number_delete`

Deletes individual entries in the trie, without reloading all of the data

* if `use_partition` is set to 1 the function will have 2 parameters:
    * _partition_name_
    * _number_ - the array of numbers to delete

**Parameters:**

- `number` *(array, required)* — the array of numbers to delete
- `partition_name` *(string, optional)* — 

**Example.** MI FIFO Command Format

```opensips
opensips-cli -x mi trie\_number\_delete partition\_name=part1 number=\["012340987","4858345"\]
```

### `trie_number_upsert`

Upserts ( insert if not found, update is found ) an array of numbers in the trie, without reloading all of the data

* if `use_partition` is set to 1 the function will have 3 parameters:
    * _partition_name_
    * _number_ - the array of numbers to update
    * _attrs_ - the array of new attributes for the numbers

**Parameters:**

- `attrs` *(array, required)* — the array of new attributes for the numbers
- `number` *(array, required)* — the array of numbers to update
- `partition_name` *(string, optional)* — 

**Example.** MI FIFO Command Format

```opensips
opensips-cli -x mi trie\_number\_upsert partition\_name=part1 number=\["012340987"\] attrs=\["my\_attrs"\]
```

### `trie_reload`

Command to reload trie rules from database.

* if `use_partition` is set to 0 - all routing rules will be reloaded.
* if `use_partition` is set to 1, the parameters are:
    * _partition_name_ (optional) - if not provided all the partitions will be reloaded, otherwise just the partition given as parameter will be reloaded.

**Parameters:**

- `partition_name` *(string, optional)* — if not provided all the partitions will be reloaded, otherwise just the partition given as parameter will be reloaded.

**Example.** MI FIFO Command Format

```opensips
opensips-cli -x mi trie\_reload part\_1
```

### `trie_reload_status`

Gets the time of the last reload for any partition.

* if `use_partition` is set to 0 - the function doesn't receive any parameter. It will list the date of the last reload for the default (and only) partition.
* if `use_partition` is set to 1, the parameters are:
    * _partition_name_ (optional) - if not provided the function will list the time of the last update for every partition. Otherwise, the function will list the time of the last reload for the given partition.

**Parameters:**

- `partition_name` *(string, optional)* — if not provided the function will list the time of the last update for every partition. Otherwise, the function will list the time of the last reload for the given partition.

**Returns:** It will list the date of the last reload for the default (and only) partition.

**Example.** Example 1.8. `trie_reload_status` usage when `use_partitions` is 0

```opensips
$ opensips-cli -x mi trie\_reload\_status
Date:: Tue Aug 12 12:26:00 2014
```

### `trie_search`

Tries to match a number in the existing tries loaded from the database.

* if `use_partition` is set to 1 the function will have 2 parameters:
    * _partition_name_
    * _number_ - the number to test against
* if `use_partition` is set to 0 the function will have 1 parameter:
    * _number_ - the number to test against

**Parameters:**

- `number` *(string, required)* — the number to test against
- `partition_name` *(string, optional)* — 

**Example.** MI FIFO Command Format

```opensips
opensips-cli -x mi trie\_search partition\_name=part1 number=012340987
```

## Configuration Examples

### Set `trie_table` parameter

Sets the `trie_table` parameter to 'my_prefix_table'.

```opensips
...
modparam("trie", "trie\_table", "my\_prefix\_table")
...
```
### Set `no_concurrent_reload` parameter

Disables parallel reload operations by setting `no_concurrent_reload` to 1.

```opensips
...
# do not allow parallel reload operations
modparam("trie", "no\_concurrent\_reload", 1)
...
```
### Set `use_partitions` parameter

Enables the use of partitions by setting `use_partitions` to 1.

```opensips
...
modparam("trie", "use\_partitions", 1)
...
```
### Set `db_partitions_url` parameter

Sets the `db_partitions_url` parameter to a MySQL connection string.

```opensips
...
modparam("trie", "db\_partitions\_url", "mysql://user:password@localhost/opensips\_partitions")
...
```
### Set `db_partitions_table` parameter

Sets the `db_partitions_table` parameter to 'trie_partition_defs'.

```opensips
...
modparam("trie", "db\_partitions\_table", "trie\_partition\_defs")
...
```
### Set `extra_prefix_chars` parameter

Sets the `extra_prefix_chars` parameter to '#-%'.

```opensips
...
modparam("trie", "extra\_prefix\_chars", "#-%")
...
```
### `trie_search` usage

Demonstrates a script route using `trie_search` with strict length matching ('L') and a specific partition.

```opensips
...
if (trie\_search("$rU","L",$avp(code\_attrs),,"my\_partition")) {
    # we found it in the trie, it's a match
    xlog("We found $rU in the trie with attrs $avp(code\_attrs) \\n");
}
...
```
### `trie_reload_status` usage when `use_partitions` is 0

Demonstrates the CLI command to check the reload status when partitions are not used.

```opensips
$ opensips-cli -x mi trie\_reload\_status
Date:: Tue Aug 12 12:26:00 2014
```
