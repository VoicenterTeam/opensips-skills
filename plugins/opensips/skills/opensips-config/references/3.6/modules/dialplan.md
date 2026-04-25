# dialplan Module Reference
<!-- generated-from: data/3.6/modules/dialplan.json
     generator-version: 0.1.0
     opensips-version: 3.6
     doc-type: module -->

Reference for the OpenSIPs 3.6 dialplan module. Read this file when configuring or debugging the dialplan module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module implements generic string translations based on matching and replacement rules. It can be used to manipulate R-URI or a PV and to translated to a new format/value.

## How It Works

At startup, the module will load all transformation rules from one or more dialplan-compatible tables. The data of each table will be stored in a _partition_ (data source), which is defined by the "db_url" and "table_name" properties. Every table row will be stored in memory as a translation rule. Each rule will describe how the matching should be made, how the input value should be modified and which attributes should be set for the matching transformation.

A dialplan rule can be of two types:

*   _"String matching" rule_ - performs a string equality test against the input string. The case of the characters can be ignored by enabling bit 1 of the rule's "match_flags" bitmask column (i.e. set the column value to 1 or 0, for insensitive or sensitive)
    
*   _"Regex matching" rule_ - uses Perl Compatible Regular Expressions, and will attempt to match the rule's expression against an input string. The regex maching can be done in a caseless manner by enabling bit 1 of the rule's "match_flags" bitmask column (i.e. set the column value to 1 or 0, for insensitive or sensitive)
    
The module provides the _dp_translate()_ script function, which expects an input **string** value that will be matched, at worst, against all rules of a partition.

Internally, the module groups a partition's rules into two sets, "string" and "regex". The matching logic will attempt to find the first match within each of these two sets of rules. Each set will be iterated in **ascending** order of priority. If an input string happens to match a rule in each of the two sets, the rule with the smallest priority will be chosen. Furthermore, should these two matching rules also have equal priorities, the one with the smallest "id" field (the unique key) will be chosen.

Once a single rule is decided upon, the defined transformation (if any) is applied and the result is returned as output value. Also, if any string attribute is associated to the rule, this will be returned to the script along with the output value.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

- `libpcre-dev` — the development libraries of PCRE

## Exported Parameters

### `attrs_col` (string)

The column name to store rule-specific attributes.

*Default value is attrs.*

**Example.** column_name.

```opensips
modparam("dialplan", "attrs_col", "column_name")
```
### `db_url` (string)

The default DB connection of the module, overriding the global 'db_default_url' setting. Once specified, partitions which are missing the 'db_url' property will inherit their URL from this value.

*Default value is NULL (not set).*

**Example.** Set the `db_url` parameter.

```opensips
modparam("dialplan", "db_url", "mysql://user:passwd@localhost/db")
```
### `disabled_col` (string)

The column name that indicates if the dialplan rule is disabled.

*Default value is disabled.*

**Example.** disabled_column.

```opensips
modparam("dialplan", "disabled_col", "disabled_column")
```
### `dpid_col` (string)

The column name to store the dialplan ID group.

*Default value is dpid.*

**Example.** Set the `dpid_col` parameter.

```opensips
modparam("dialplan", "dpid_col", "column_name")
```
### `match_exp_col` (string)

The column name to store the rule match expression.

*Default value is match_exp.*

**Example.** column_name.

```opensips
...
modparam("dialplan", "match_exp_col", "column_name")
...
```
### `match_flags_col` (string)

The column name to store various matching flags. Currently 0 - case sensitive matching, 1 - case insensitive matching.

*Default value is match_flags.*

**Possible values:**

- 0
- 1

**Example.** column_name.

```opensips
...
modparam("dialplan", "match_flags_col", "column_name")
...
```
### `match_op_col` (string)

The column name to store the type of matching of the rule.

*Default value is match_op.*

**Example.** column_name.

```opensips
...
modparam("dialplan", "match_op_col", "column_name")
...
```
### `partition` (string)

Specify a new dialplan partition (data source). This parameter may be set multiple times. Each partition may have a specific "db_url" and "table_name". If not specified, these values will be inherited from [db_url](#param_db_url "1.6.2.db_url (string)"), db_default_url or [table_name](#param_table_name "1.6.3.table_name (string)"), respectively. The name of the default partition is 'default'.

**Notes:** Note: OpenSIPS will validate each partition, so make sure to add any required entries in the "version" table of each database defined through the 'db_url' property.

**Example.** Set the `partition` parameter.

```opensips
modparam("dialplan", "partition", "
	pstn:
		table_name = dialplan;
		db_url = mysql://opensips:opensipsrw@127.0.0.1/opensips")
```
### `pr_col` (string)

The column name to store the priority of the corresponding rule from the table row. Smaller priority values have higher precedence.

*Default value is pr.*

**Example.** Set the `pr_col` parameter.

```opensips
modparam("dialplan", "pr_col", "column_name")
```
### `repl_exp_col` (string)

The column name to store the rule's replacement expression.

*Default value is repl_exp.*

**Example.** column_name.

```opensips
...
modparam("dialplan", "repl_exp_col", "column_name")
...
```
### `subst_exp_col` (string)

The column name to store the rule's substitution expression.

*Default value is subst_exp.*

**Example.** column_name.

```opensips
...
modparam("dialplan", "subst_exp_col", "column_name")
...
```
### `table_name` (string)

The default name of the table from which to load translation rules. Partitions which are missing the 'table_name' property will inherit their table name from this value.

*Default value is dialplan.*

**Example.** Set the `table_name` parameter.

```opensips
modparam("dialplan", "table_name", "my_table")
```
### `timerec_col` (string)

The column name that indicates an additional time recurrence check within the rule (column values are RFC 2445-compatible strings). The value format is identical to the input of the check_time_rec() function of the cfgutils module, including the optional use of logical operators linking multiple such strings into a larger expression.

*Default value is timerec.*

**Example.** month_match.

```opensips
modparam("dialplan", "timerec_col", "month_match")
```

## Exported Functions

### `dp_translate(id, input, [out_var], [attrs_var], [partition])`

Will try to translate the src string into dest string according to the translation rules with dialplan ID equal to id.

**Parameters:**

- `attrs_var` *(var, optional)* — variable to be populated/written with the "attributes" field of the translation rule, on a successful translation. If the field is NULL or empty-string, the variable will be set to empty-string.
- `id` *(int, required)* — the dialplan id to be used for matching rules
- `input` *(string, required)* — input string to be used for rule matching and for computing the output string.
- `out_var` *(var, optional)* — variable to be populated/written with the output string (if provided by the translation rule), on a successful translation.
- `partition` *(string, optional)* — the name of the partition (set of data) to be used for locating the DP ID.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, LOCAL_ROUTE, BRANCH_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** `dp_translate` usage.

```opensips
dp_translate(240, $ru, $var(out));
xlog("translated into '$var(out)' \n");
```

**Example.** `dp_translate` usage.

```opensips
$avp(src) = $ruri.user;
dp_translate($var(x), $avp(src), $var(y), $var(attrs));
xlog("translated to var $var(y) with attributes: '$var(attrs)'\n");
```

**Example.** `dp_translate` usage.

```opensips
$var(id) = 10;
dp_translate($var(id), $avp(in), , $avp(attrs), "example_partition");
xlog("matched with attributes '$avp(attrs) against example_partition'\n");
```

**Example.** `dp_translate` usage.

```opensips
dp_translate(10, $var(in), , , $var(part));
xlog("'$var(in)' matched against partition '$var(part)'\n")
```

## Exported MI Functions

### `dp_reload`

It will update the translation rules, loading the database info.

**Parameters:**

- `partition` *(string, optional)* — Partition to be reloaded. If not specified, all partitions will be reloaded.

**Example.** MI DATAGRAM Command Format

```bash
opensips-cli -x mi dp_reload
```

### `dp_show_partiton`

Display partition(s) details.

**Parameters:**

- `partition` *(string, optional)* — The partition name. If no partition is specified, all known partitions will be listed.

**Example.** MI DATAGRAM Command Format

```bash
opensips-cli -x mi dp_translate default
```

### `dp_translate`

It will apply a translation rule identified by a dialplan id on an input string.

**Parameters:**

- `dpid` *(integer, required)* — the dpid of the rule set used for match the input string
- `input` *(string, required)* — the input string
- `partition` *(string, optional)* — (optional) the name of the partition when the dpid is located

**Example.** MI DATAGRAM Command Format

```bash
opensips-cli -x mi dp_translate 10 +40123456789
```

## Configuration Examples

### Defining the `'pstn'` partition

Defining the `'pstn'` partition

```opensips
...
modparam("dialplan", "partition", "
	pstn:
		table_name = dialplan;
		db_url = mysql://opensips:opensipsrw@127.0.0.1/opensips")
...
```
### Define the 'pstn' partition and make it the 'default' partition, so we avoid loading the 'dialplan' table

Define the 'pstn' partition and make it the 'default' partition, so we avoid loading the 'dialplan' table

```opensips
...
db_default_url = "mysql://opensips:opensipsrw@localhost/opensips"

loadmodule "dialplan.so"
modparam("dialplan", "partition", "
	pstn:
		table_name = dialplan_pstn")
modparam("dialplan", "partition", "default: pstn")
...
```
### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("dialplan", "db_url", "mysql://user:passwd@localhost/db")
...
```
### Set `table_name` parameter

Set `table_name` parameter

```opensips
...
modparam("dialplan", "table_name", "my_table")
...
```
### Set `dpid_col` parameter

Set `dpid_col` parameter

```opensips
...
modparam("dialplan", "dpid_col", "column_name")
...
```
### Set `pr_col` parameter

Set `pr_col` parameter

```opensips
...
modparam("dialplan", "pr_col", "column_name")
...
```
### Set `match_op_col` parameter

Set `match_op_col` parameter

```opensips
...
modparam("dialplan", "match_op_col", "column_name")
...
```
### Set `match_exp_col` parameter

Set `match_exp_col` parameter

```opensips
...
modparam("dialplan", "match_exp_col", "column_name")
...
```
### Set `match_flags_col` parameter

Set `match_flags_col` parameter

```opensips
...
modparam("dialplan", "match_flags_col", "column_name")
...
```
### Set `subs_exp_col` parameter

Set `subs_exp_col` parameter

```opensips
...
modparam("dialplan", "subst_exp_col", "column_name")
...
```
### Set `repl_exp_col` parameter

Set `repl_exp_col` parameter

```opensips
...
modparam("dialplan", "repl_exp_col", "column_name")
...
```
### Set `timerec_col` parameter

Set `timerec_col` parameter

```opensips
...
modparam("dialplan", "timerec_col", "month_match")
...
```
### Set `disabled_col` parameter

Set `disabled_col` parameter

```opensips
...
modparam("dialplan", "disabled_col", "disabled_column")
...
```
### Set `attrs_col` parameter

Set `attrs_col` parameter

```opensips
...
modparam("dialplan", "attrs_col", "column_name")
...
```
### `dp_translate` usage

`dp_translate` usage

```opensips
...
dp_translate(240, $ru, $var(out));
xlog("translated into '$var(out)' \\n");
...
```
### `dp_translate` usage

`dp_translate` usage

```opensips
...
$avp(src) = $ruri.user;
dp_translate($var(x), $avp(src), $var(y), $var(attrs));
xlog("translated to var $var(y) with attributes: '$var(attrs)'\\n");
...
```
### `dp_translate` usage

`dp_translate` usage

```opensips
...
$var(id) = 10;
dp_translate($var(id), $avp(in), , $avp(attrs), "example_partition");
xlog("matched with attributes '$avp(attrs) against example_partition'\\n");
...
```
### `dp_translate` usage

`dp_translate` usage

```opensips
...
dp_translate(10, $var(in), , , $var(part));
xlog("'$var(in)' matched against partition '$var(part)'\\n")
...
```
