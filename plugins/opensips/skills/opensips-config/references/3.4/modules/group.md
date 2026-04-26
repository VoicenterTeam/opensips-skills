# group Module Reference
<!-- generated-from: data/3.4/modules/group.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 group module. Read this file when configuring or debugging the group module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

This module provides functionalities for different methods of group membership checking.

## How It Works

There is a database table that contains list of users and groups they belong to. The module provides the possibility to check if a specific user belongs to a specific group.

There is no DB caching support, each check involving a DB query.

Another database table contains list of regular expressions and group IDs. A matching occurs if the user URI match the regular expression. This type of matching may be used to fetch the group ID(s) the user belongs to (via RE matching) .

Due performance reasons (regular expression evaluation), DB cache support is available: the table content is loaded into memory at startup and all regular expressions are compiled.

## Dependencies

### OpenSIPs Modules

- `AAA module`
- `database module`

### External Libraries

None.

## Exported Parameters

### `aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

**Example.** radius:/etc/radiusclient-ng/radiusclient.conf.

```opensips
modparam("group", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
```
### `db_url` (string)

URL of the database table to be used.

**Example.** mysql://username:password@dbhost/opensips.

```opensips
modparam("group", "db_url", "mysql://username:password@dbhost/opensips")
```
### `domain_column` (string)

Name of the “table” column holding domains.

*Default value is domain.*

**Example.** realm.

```opensips
modparam("group", "domain_column", "realm")
```
### `group_column` (string)

Name of the “table” column holding groups.

*Default value is grp.*

**Example.** grp.

```opensips
modparam("group", "group_column", "grp")
```
### `multiple_gid` (integer)

If enabled (non zero value) the regular-expression matching will return all group IDs that match the user; otherwise only the first will be returned.

*Default value is 1.*

**Example.** 0.

```opensips
modparam("group", "multiple_gid", 0)
```
### `re_exp_column` (string)

Name of the “re_table” column holding the regular expression used for user matching.

*Default value is reg_exp.*

**Example.** re.

```opensips
modparam("group", "re_exp_column", "re")
```
### `re_gid_column` (string)

Name of the “re_table” column holding the group IDs.

*Default value is group_id.*

**Example.** grp_id.

```opensips
modparam("group", "re_gid_column", "grp_id")
```
### `re_table` (string)

Name of the table holding definitions for regular-expression based groups. If no table is defined, the regular-expression support is disabled.

*Default value is NULL.*

**Example.** re_grp.

```opensips
modparam("group", "re_table", "re_grp")
```
### `table` (string)

Name of the table holding strict definitions of groups and their members.

*Default value is grp.*

**Example.** grp_table.

```opensips
modparam("group", "table", "grp_table")
```
### `use_domain` (integer)

If enabled (set to non zero value) then domain will be used also used for strict group matching; otherwise only the username part will be used.

*Default value is 0 (no).*

**Example.** 1.

```opensips
modparam("group", "use_domain", 1)
```
### `user_column` (string)

Name of the “table” column holding usernames.

*Default value is username.*

**Example.** user.

```opensips
modparam("group", "user_column", "user")
```

## Exported Functions

### `aaa_is_user_in(uri, group)`

This function checks group membership, using AAA support. The function returns true if username in the given "uri" is member of the given group and false if not.

**Parameters:**

- `group` *(string, required)* — Name of the group to check.
- `uri` *(string, required)* — a SIP URI whose username and optionally domain to be used, this can be one of:
  - `Request-URI`
  - `To`
  - `From`
  - `Credentials`

**Return codes:**

- `true` — username in the given "uri" is member of the given group
- `false` — username in the given "uri" is not member of the given group

**Usable from:** REQUEST_ROUTE

**Example.** `aaa_is_user_in` usage.

```opensips
...
if (aaa_is_user_in("Request-URI", "ld")) {
	...
};
...

```

### `db_get_user_group(uri, output_avp)`

This function is to be used for regular expression based group membership, using DB support. The function returns true if the username in the given "uri" belongs to at least one group.

All matching group IDs shall be returned in "output_avp" if multiple_gid is enabled, otherwise only the first one to match (the records are attempted in reversed order of the results returned by the RDBMS).

**Parameters:**

- `output_avp` *(var, required)* — a list of matched group IDs
- `uri` *(string, required)* — a SIP URI to be matched against the regular expressions
  - `Request-URI`
  - `To`
  - `From`
  - `Credentials`
  - `default`

**Return codes:**

- `true` — the username in the given "uri" belongs to at least one group

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** `db_get_user_group` usage.

```opensips
...
if (db_get_user_group("Request-URI", $avp(10))) {
    xdbg("User $ru belongs to the following groups: $(avp(10)[*])\n");
    ....
};
...

```

### `db_is_user_in(uri, group)`

This function is to be used for script group membership. The function returns true if username in the given URI is member of the given group and false if not.

**Parameters:**

- `group` *(string, required)* — the group to check
- `uri` *(string, required)* — a SIP URI whose username and optionally domain to be used.
  - `Request-URI`
  - `To`
  - `From`
  - `Credentials`
  - `default`

**Return codes:**

- `true` — username in the given URI is member of the given group
- `false` — username in the given URI is not member of the given group

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** `db_is_user_in` usage.

```opensips
...
if (db_is_user_in("Request-URI", "ld")) {
	...
}
...
$avp(grouptocheck)="offline";

if (db_is_user_in("Credentials", $avp(grouptocheck))) {
	...
}
...

```

## Configuration Examples

### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("group", "db_url", "mysql://username:password@dbhost/opensips")
...
```
### Set `table` parameter

Set `table` parameter

```opensips
...
modparam("group", "table", "grp_table")
...
```
### Set `user_column` parameter

Set `user_column` parameter

```opensips
...
modparam("group", "user_column", "user")
...
```
### Set `domain_column` parameter

Set `domain_column` parameter

```opensips
...
modparam("group", "domain_column", "realm")
...
```
### Set `group_column` parameter

Set `group_column` parameter

```opensips
...
modparam("group", "group_column", "grp")
...
```
### Set `use_domain` parameter

Set `use_domain` parameter

```opensips
...
modparam("group", "use_domain", 1)
...
```
### Set `re_table` parameter

Set `re_table` parameter

```opensips
...
modparam("group", "re_table", "re_grp")
...
```
### Set `re_exp_column` parameter

Set `re_exp_column` parameter

```opensips
...
modparam("group", "re_exp_column", "re")
...
```
### Set `re_gid_column` parameter

Set `re_gid_column` parameter

```opensips
...
modparam("group", "re_gid_column", "grp_id")
...
```
### Set `multiple_gid` parameter

Set `multiple_gid` parameter

```opensips
...
modparam("group", "multiple_gid", 0)
...
```
### Set `aaa_url` parameter

Set `aaa_url` parameter

```opensips
...
modparam("group", "aaa_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...
```
### `db_is_user_in` usage

`db_is_user_in` usage

```opensips
...
if (db_is_user_in("Request-URI", "ld")) {
	...
}
...
$avp(grouptocheck)="offline";

if (db_is_user_in("Credentials", $avp(grouptocheck))) {
	...
}
...
```
### `db_get_user_group` usage

`db_get_user_group` usage

```opensips
...
if (db_get_user_group("Request-URI", $avp(10))) {
    xdbg("User $ru belongs to the following groups: $(avp(10)\[\*])\\n");
    ....
};
...
```
### `aaa_is_user_in` usage

`aaa_is_user_in` usage

```opensips
...
if (aaa_is_user_in("Request-URI", "ld")) {
	...
};
...
```
