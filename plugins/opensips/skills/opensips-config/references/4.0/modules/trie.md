# trie Module Reference
<!-- generated-from: data/4.0/modules/trie.json
     generator-version: 0.1.0
     opensips-version: 4.0
     doc-type: module -->

Reference for the OpenSIPs 4.0 trie module. Read this file when configuring or debugging the trie module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

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

*Default value is trie_partitions.*

**Example.** trie_partition_defs.

```opensips
modparam("trie", "db_partitions_table", "trie_partition_defs")
```
### `db_partitions_url` (string)

The url to the database containing partition-specific information.The `use_partitions` parameter must be set to 1.

*Default value is NULL.*

**Example.** mysql://user:password@localhost/opensips_partitions.

```opensips
modparam("trie", "db_partitions_url", "mysql://user:password@localhost/opensips_partitions")
```
### `extra_prefix_chars` (string)

List of ASCII (0-127) characters to be additionally accepted in the prefixes. By default only '0' - '9' chars (digits) are accepted.

*Default value is NULL.*

**Example.** #-%.

```opensips
modparam("trie", "extra_prefix_chars", "#-%")
```
### `no_concurrent_reload` (integer)

If enabled, the module will not allow do run multiple trie:reload MI commands in parallel (with overlapping) Any new reload will be rejected (and discarded) while an existing reload is in progress.

If you have a large routing set (millions of rules/prefixes), you should consider disabling concurrent reload as they will exhaust the shared memory (by reloading into memory, in the same time, multiple instances of routing data).

*Default value is 0 (disabled).*

**Example.** 1.

```opensips
modparam("trie", "no_concurrent_reload", 1)
```
### `trie_table` (string)

The name of the db table storing prefix rules.

*Default value is trie_table.*

**Example.** my_prefix_table.

```opensips
modparam("trie", "trie_table", "my_prefix_table")
```
### `use_partitions` (integer)

Flag to configure whether to use partitions for tries. If this flag is set then the `db_partitions_url` and `db_partitions_table` variables become mandatory.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("trie", "use_partitions", 1)
```

## Exported Functions

### `trie_search(number, [flags], [trie_attrs_pvar], [match_prefix_pvar], [partition])`

Function to search for an entry ( number ) in a trie.

If you set `use_partitions` to 1 the **partition** last parameter becomes mandatory.

All parameters are optional. Any of them may be ignored, provided the necessary separation marks "," are properly placed.

**Parameters:**

- `flags` *(string, optional)* — a list of letter-like flags for controlling the routing behavior. Possible flags are:
  - `L`
- `match_prefix_pvar` *(var, optional)* — a writable variable which will be the actual prefix matched in the trie.
- `number` *(str, optional)* — number to be searched in the trie
- `partition` *(string, optional)* — the name of the trie partition to be used. This parameter is to be defined ONLY if the "use_partition" module parameter is turned on.
- `trie_attrs_pvar` *(var, optional)* — a writable variable which will be populated with the attributes of the matched trie rule.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, ONREPLY_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** `trie_search` usage.

```opensips
if (trie_search("$rU","L",$avp(code_attrs),,"my_partition")) {
    # we found it in the trie, it's a match
    xlog("We found $rU in the trie with attrs $avp(code_attrs) \n");
}
```

## Exported MI Functions

### `trie:number_delete`

Replaces obsolete MI command: trie_number_delete. Deletes individual entries in the trie, without reloading all of the data

**Parameters:**

- `number` *(string, required)* — the array of numbers to delete
- `partition_name` *(string, optional)* — Required if use_partition is set to 1.

**Example.** Deletes an array of numbers from a specific partition.

```opensips-cli
opensips-cli -x mi trie:number_delete partition_name=part1 number=["012340987","4858345"]
```

### `trie:number_upsert`

Replaces obsolete MI command: trie_number_upsert. Upserts ( insert if not found, update is found ) an array of numbers in the trie, without reloading all of the data

**Parameters:**

- `attrs` *(string, required)* — the array of new attributes for the numbers
- `number` *(string, required)* — the array of numbers to update
- `partition_name` *(string, optional)* — Required if use_partition is set to 1.

**Example.** Upserts a number with attributes in a specific partition.

```opensips-cli
opensips-cli -x mi trie:number_upsert partition_name=part1 number=["012340987"] attrs=["my_attrs"]
```

### `trie:reload`

Replaces obsolete MI command: trie_reload. Command to reload trie rules from database.

**Parameters:**

- `partition_name` *(string, optional)* — if not provided all the partitions will be reloaded, otherwise just the partition given as parameter will be reloaded.

**Example.** Reloads trie rules for a specific partition.

```opensips-cli
opensips-cli -x mi trie:reload part_1
```

### `trie:reload_status`

Replaces obsolete MI command: trie_reload_status. Gets the time of the last reload for any partition.

**Parameters:**

- `partition_name` *(string, optional)* — if not provided the function will list the time of the last update for every partition. Otherwise, the function will list the time of the last reload for the given partition.

**Returns:** The date of the last reload.

**Example.** Gets reload status when use_partitions is 0

```bash
$ opensips-cli -x mi trie:reload_status
Date:: Tue Aug 12 12:26:00 2014
```

### `trie:search`

Replaces obsolete MI command: trie_search. Tries to match a number in the existing tries loaded from the database.

**Parameters:**

- `number` *(string, required)* — the number to test against
- `partition_name` *(string, optional)* — Required if use_partition is set to 1.

**Example.** Searches for a number in a specific partition.

```opensips-cli
opensips-cli -x mi trie:search partition_name=part1 number=012340987
```

## Configuration Examples

### Set `trie_table` parameter

The name of the db table storing prefix rules.

```opensips
...
modparam("trie", "trie_table", "my_prefix_table")
...
```
### Set `no_concurrent_reload` parameter

If enabled, the module will not allow do run multiple trie:reload MI commands in parallel (with overlapping) Any new reload will be rejected (and discarded) while an existing reload is in progress.

```opensips
...
# do not allow parallel reload operations
modparam("trie", "no_concurrent_reload", 1)
...
```
### Set `use_partitions` parameter

Flag to configure whether to use partitions for tries. If this flag is set then the `db_partitions_url` and `db_partitions_table` variables become mandatory.

```opensips
...
modparam("trie", "use_partitions", 1)
...
```
### Set `db_partitions_url` parameter

The url to the database containing partition-specific information.The `use_partitions` parameter must be set to 1.

```opensips
...
modparam("trie", "db_partitions_url", "mysql://user:password@localhost/opensips_partitions")
...
```
### Set `db_partitions_table` parameter

The name of the table containing partition definitions. To be used with `use_partitions` and `db_partitions_url`.

```opensips
...
modparam("trie", "db_partitions_table", "trie_partition_defs")
...
```
### Set `extra_prefix_chars` parameter

List of ASCII (0-127) characters to be additionally accepted in the prefixes. By default only '0' - '9' chars (digits) are accepted.

```opensips
...
modparam("trie", "extra_prefix_chars", "#-%")
...
```
### `trie_search` usage

Function to search for an entry ( number ) in a trie. This function can be used from all routes.

```opensips
...
if (trie_search("$rU","L",$avp(code_attrs),,"my_partition")) {
    # we found it in the trie, it's a match
    xlog("We found $rU in the trie with attrs $avp(code_attrs) \\n");
}
...
```
### `trie:reload_status` usage when `use_partitions` is 0

Gets the time of the last reload for any partition.

```opensips
$ opensips-cli -x mi trie:reload_status
Date:: Tue Aug 12 12:26:00 2014
```
