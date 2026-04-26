# avpops Module Reference
<!-- generated-from: data/3.4/modules/avpops.json
     generator-version: 0.1.0
     opensips-version: 3.4
     doc-type: module -->

Reference for the OpenSIPs 3.4 avpops module. Read this file when configuring or debugging the avpops module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Configuration Examples](#configuration-examples)

## Overview

AVPops (AVP-operations) modules implements a set of script functions which allow access and manipulation of user AVPs (preferences) and pseudo-variables. AVPs are a powerful tool for implementing services/preferences per user/domain. Now they are usable directly from configuration script. Functions for interfacing DB resources (loading/storing/removing), functions for swapping information between AVPs and SIP messages, function for testing/checking the value of an AVP.

## How It Works

AVPs are persistent per SIP transaction, being available in "route", "branch_route" and "failure_route". To make them available in "onreply_route" armed via TM module, set "onreply_avp_mode" parameter of TM module (note that in the default "onreply_route", the AVPs of the transaction are not available).

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

### Optional Modules

- `database module`

## Exported Parameters

### `attribute_column` (string)

Name of column containing the attribute name (AVP name).

*Default value is attribute.*

**Example.** Set the `attribute_column` parameter.

```opensips
modparam("avpops","attribute_column","attribute")
```
### `avp_table` (string)

DB table to be used.

*Default value is NULL.*

**Notes:** This parameter is optional, it's default value being NULL.

**Example.** avptable.

```opensips
modparam("avpops","avp_table","avptable")
```
### `db_scheme` (string)

Definition of a DB scheme to be used for non-standard access to Database information.

Definition of a DB scheme. Scheme syntax is:

*   _db_scheme = name':'element\[';'element\]\*_
    
*   _element_ =
    
    *   'uuid_col='string
        
    *   'username_col='string
        
    *   'domain_col='string
        
    *   'value_col='string
        
    *   'value_type='('integer'|'string')
        
    *   'table='string

*Default value is NULL.*

**Example.** Set the `db_scheme` parameter.

```opensips
modparam("avpops","db_scheme",
"scheme1:table=subscriber;uuid_col=uuid;value_col=first_name")
```
### `db_url` (string)

DB URL for database connection. As the module allows the usage of multiple DBs (DB URLs), the actual DB URL may be preceded by an reference number. This reference number is to be passed to AVPOPS function that what to explicitly use this DB connection. If no reference number is given, 0 is assumed - this is the default DB URL.

*Default value is NULL.*

**Notes:** This parameter is optional, it's default value being NULL.

**Example.** mysql://user:passwd@host/database.

```opensips
# default URL
modparam("avpops","db_url","mysql://user:passwd@host/database")
# an additional DB URL
modparam("avpops","db_url","1 postgres://user:passwd@host2/opensips")
```
### `domain_column` (string)

Name of column containing the domain name.

*Default value is domain.*

**Example.** Set the `domain_column` parameter.

```opensips
modparam("avpops","domain_column","domain")
```
### `type_column` (string)

Name of column containing the AVP type.

*Default value is type.*

**Example.** Set the `type_column` parameter.

```opensips
modparam("avpops","type_column","type")
```
### `use_domain` (integer)

If the domain part of the an URI should be used for identifying an AVP in DB operations.

*Default value is 0.*

**Example.** 1.

```opensips
modparam("avpops","use_domain",1)
```
### `username_column` (string)

Name of column containing the username.

*Default value is username.*

**Example.** username.

```opensips
modparam("avpops","username_column","username")
```
### `uuid_column` (string)

Name of column containing the uuid (unique user id).

*Default value is uuid.*

**Example.** uuid.

```opensips
modparam("avpops","uuid_column","uuid")
```
### `value_column` (string)

Name of column containing the AVP value.

*Default value is value.*

**Example.** Set the `value_column` parameter.

```opensips
modparam("avpops","value_column","value")
```

## Exported Functions

### `avp_check(name, op_value)`

Checks the value of the AVP(s) against an operator and value.

**Parameters:**

- `name` *(string, required)* — which AVP(s) should be checked. Parameter syntax: name = ( pseudo-variable ).
- `op_value` *(string, required)* — define the operator, the value and flags for checking. Parameter syntax: op_value = operator '/' value ['/'flags]. value = pseudo-variable | fix_value. fix_value = 'i:'integer | 's:'string | string. flags = 'g' | 'G' | 'i' | 'I'. Integer values can be given in hexadecimal using notation: 'i:0xhex_number' (e.g.,: 'i:0xabcd').
  - `eq`
  - `ne`
  - `lt`
  - `le`
  - `gt`
  - `ge`
  - `re`
  - `fm`
  - `and`
  - `or`
  - `xor`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_check usage.

```opensips
avp_check("$avp(678)", "lt/345/g");
avp_check("$fd", "eq/$td/I");
avp_check("$avp(foo)", "gt/$avp($bar)/g");
avp_check("$avp(foo)", "re/sip:.*@bar.net/g");
avp_check("$avp(foo)", "fm/$avp(fm_avp)/g");
```

### `avp_copy(from_avp, to_avp)`

Copy / move an avp under a new name.

**Parameters:**

- `from_avp` *(string, required)* — which AVP(s) should be copied/moved. Parameter syntax: from_avp = ( avp_name | avp_alias ).
- `to_avp` *(string, required)* — the new name of the copied/moved AVP(s). Parameter syntax: to_avp = ( avp_name | avp_alias )['/'flags]. flags = 'g' | 'G' | 'd' | 'D' | 'n' | 'N' | 's' | 'S'.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_copy usage.

```opensips
avp_copy("$avp(foo)", "$avp(bar)/g");
avp_copy("$avp(old)", "$avp(new)/gd"); # also deletes $avp(old)
```

### `avp_db_delete(source, name, [db_id])`

Deletes from DB the AVPs corresponding to the given _source_. The meaning and usage of the parameters are identical as for _avp_db_load(source, name)_ function. Please refer to its description.

**Parameters:**

- `db_id` *(int, optional)* — reference to a defined DB URL (a numerical id) - see the “db_url” module parameter.
- `name` *(string, required)* — which AVPs will be deleted from DB. Parameter syntax is: name = avp_spec['/(table_name|'$'db_scheme)] avp_spec = matching_flags|$avp(avp_name)|$avp(avp_alias) matching_flags = 'a' | 'A' | 'i' | 'I' | 's' | 'S' [script_flags] 'a' or 'A' means matching any of AVP name types ('i' and 's'), the rest have the meaning descriped in 'AVP naming format' chapter.
  - `a`
  - `A`
  - `i`
  - `I`
  - `s`
  - `S`
- `source` *(string, required)* — what info is used for identifying the AVPs. Parameter syntax: source = (pvar|str_value) ['/('username'|'domain'|'uri'|'uuid')]) pvar = any pseudo variable defined in OpenSIPS. If the pvar is $ru (request uri), $fu (from uri), $tu (to uri) or $ou (original uri), then the implicit flag is 'uri'. Otherwise, the implicit flag is 'uuid'.
  - `username`
  - `domain`
  - `uri`
  - `uuid`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_db_delete usage.

```opensips
avp_db_delete("$tu", "$avp(678)");
avp_db_delete("$ru/username", "$avp(email)");
avp_db_delete("$avp(uuid)", "$avp(404fwd)/fwd_table");
# use DB URL id 3
avp_db_delete("$ru", "$avp(1)", 3);
```

### `avp_db_load(source, name, [db_id], [prefix])`

Loads from DB into memory the AVPs corresponding to the given _source_. If given, it sets the script flags for loaded AVPs. It returns true if it loaded some values in AVPs, false otherwise (db error, no avp loaded ...). AVPs may be preceded by an optional _prefix_, in order to avoid some conflicts.

**Parameters:**

- `db_id` *(int, optional)* — reference to a defined DB URL (a numerical id) - see the “db_url” module parameter.
- `name` *(string, required)* — which AVPs will be loaded from DB into memory. Parameter syntax is: name = avp_spec['/(table_name|'$'db_scheme)] avp_spec = matching_flags|$avp(avp_name)|$avp(avp_alias) matching_flags = 'a' | 'A' | 'i' | 'I' | 's' | 'S' [script_flags] 'a' or 'A' means matching any of AVP name types ('i' and 's'), the rest have the meaning descriped in 'AVP naming format' chapter.
  - `a`
  - `A`
  - `i`
  - `I`
  - `s`
  - `S`
- `prefix` *(string, optional)* — static string which will precede the names of the AVPs populated by this function.
- `source` *(string, required)* — what info is used for identifying the AVPs. Parameter syntax: source = (pvar|str_value) ['/('username'|'domain'|'uri'|'uuid')]) pvar = any pseudo variable defined in OpenSIPS. If the pvar is $ru (request uri), $fu (from uri), $tu (to uri) or $ou (original uri), then the implicit flag is 'uri'. Otherwise, the implicit flag is 'uuid'.
  - `username`
  - `domain`
  - `uri`
  - `uuid`

**Return codes:**

- `true` — it loaded some values in AVPs
- `false` — db error, no avp loaded ...

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_db_load usage.

```opensips
avp_db_load("$fu", "$avp(678)");
avp_db_load("$ru/domain", "i/domain_preferences");
avp_db_load("$avp(uuid)", "$avp(404fwd)/fwd_table");
avp_db_load("$ru", "$avp(123)/$some_scheme");

# use DB URL id 3
avp_db_load("$ru", "$avp(1)", 3);

# precede all loaded AVPs by the "caller_" prefix
avp_db_load("$ru", "$avp(100)", , "caller_");
xlog("Loaded: $avp(caller_100)\n");
```

### `avp_db_query(query, [res_col_avps], [db_id])`

Make a database query and store the result in AVPs.

**Parameters:**

- `db_id` *(int, optional)* — reference to a defined DB URL (a numerical id) - see the “db_url” module parameter. It can be either a constant, or a string/int variable.
- `query` *(string, required)* — must be a valid SQL query. The parameter can contain pseudo-variables. You must escape any pseudo-variables manually to prevent SQL injection attacks. You can use the existing transformations _escape.common_ and _unescape.common_ to escape and unescape the content of any pseudo-variable. Failing to escape the variables used in the query makes you vulnerable to SQL injection, e.g. make it possible for an outside attacker to alter your database content.
- `res_col_avps` *(string, optional)* — a list with AVP names where to store the result. The format is “$avp(name1);$avp(name2);...”. If this parameter is omitted, the result is stored in “$avp(1);$avp(2);...”. If the result consists of multiple rows, then multiple AVPs with corresponding names will be added. The value type of the AVP (string or integer) will be derived from the type of the columns. If the value in the database is _NULL_, the returned avp will be a string with the _<null>_ value.

**Return codes:**

- `true` — the query was successful
- `-2` — the query returned an empty result set
- `-1` — all other types of errors

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_db_query usage.

```opensips
avp_db_query("SELECT password, ha1 FROM subscriber WHERE username='$tu'",
	"$avp(pass);$avp(hash)");
avp_db_query("DELETE FROM subscriber");
avp_db_query("DELETE FROM subscriber", , 2);

$avp(id) = 2;
avp_db_query("DELETE FROM subscriber", , $avp(id));
```

### `avp_db_store(source, name, [db_id])`

Stores to DB the AVPs corresponding to the given _source_. The meaning and usage of the parameters are identical as for _avp_db_load(source, name)_ function. Please refer to its description.

**Parameters:**

- `db_id` *(int, optional)* — reference to a defined DB URL (a numerical id) - see the “db_url” module parameter.
- `name` *(string, required)* — which AVPs will be stored to DB. Parameter syntax is: name = avp_spec['/(table_name|'$'db_scheme)] avp_spec = matching_flags|$avp(avp_name)|$avp(avp_alias) matching_flags = 'a' | 'A' | 'i' | 'I' | 's' | 'S' [script_flags] 'a' or 'A' means matching any of AVP name types ('i' and 's'), the rest have the meaning descriped in 'AVP naming format' chapter.
  - `a`
  - `A`
  - `i`
  - `I`
  - `s`
  - `S`
- `source` *(string, required)* — what info is used for identifying the AVPs. Parameter syntax: source = (pvar|str_value) ['/('username'|'domain'|'uri'|'uuid')]) pvar = any pseudo variable defined in OpenSIPS. If the pvar is $ru (request uri), $fu (from uri), $tu (to uri) or $ou (original uri), then the implicit flag is 'uri'. Otherwise, the implicit flag is 'uuid'.
  - `username`
  - `domain`
  - `uri`
  - `uuid`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_db_store usage.

```opensips
avp_db_store("$tu", "$avp(678)");
avp_db_store("$ru/username", "$avp(email)");
# use DB URL id 3
avp_db_store("$ru", "$avp(1)", 3);
```

### `avp_delete(name)`

Deletes from memory the AVPs with _name_ or, if \*, all AVPs.

**Parameters:**

- `name` *(string, required)* — which AVPs will be deleted from memory. Parameter syntax is: name = (matching_flags|avp_name|avp_alias)['/'flag] matching_flags = please refer to avp_db_load() function flag = 'g'|'G'
  - `g`
  - `G`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_delete usage.

```opensips
avp_delete("$avp(email)"); # delete topmost (lastly set) value from $avp(email)
avp_delete("$avp(678)/g"); # fully purge $avp(678)
avp_delete("i");
avp_delete("a3");
```

### `avp_op(name, op_value)`

Different integer operations with avps.

**Parameters:**

- `name` *(string, required)* — 'source_avp/destination_avp' - which AVP(s) should be processed and where to store the result. If 'destination_avp' is missing, same name as 'source_avp' is used to store the result. Parameter syntax: name = ( source_avp[/destination_avp] ). source_avp = ( avp_name | avp_alias ). destination_avp = ( avp_name | avp_alias ).
- `op_value` *(string, required)* — define the operation, the value and flags. Parameter syntax: op_value = operator '/' value ['/'flags]. value = pseudo-variable | fix_value. fix_value = 'i:'integer. flags = 'g' | 'G' | 'd' | 'D'. Integer values can be given in hexadecimal using notation 'i:0xhex_number' (e.g.,: 'i:0xabcd').
  - `add`
  - `sub`
  - `mul`
  - `div`
  - `mod`
  - `and`
  - `or`
  - `xor`
  - `not`

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_op usage.

```opensips
avp_op("$avp(678)", "add/345/g");
avp_op("$avp(number)", "sub/$avp(number2)/d");
```

### `avp_print()`

Prints the list with all the AVPs from memory. This is only a helper/debug function.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_print usage.

```opensips
avp_print();
```

### `avp_pushto(destination, name)`

Pushes the value of AVP(s) into the SIP message.

**Parameters:**

- `destination` *(string, required)* — as what will be the AVP value pushed into SIP message. Parameter syntax: destination = '$ru' ['/'('username'|'domain')] | '$du' | '$br'. $ru ['/'('username'|'domain')] - write the AVP in the request URI or in username/domain part of it. $du - write the AVP in 'dst_uri' field. $br - write the AVP directly as a new branch (does not affect RURI).
  - `$ru`
  - `$du`
  - `$br`
- `name` *(string, required)* — which AVP(s)/pseudo-variable should be pushed into the SIP message. Parameter syntax: name = ( avp_name | avp_alias | pvar_name )['/'flags]. flags = 'g' - effective only with AVPs.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_pushto usage.

```opensips
avp_pushto("$ru/domain", "$fd");
avp_pushto("$ru", "$avp(678)");
avp_pushto("$ru/domain", "$avp(backup_domains)/g");
avp_pushto("$du", "$avp(679)");
avp_pushto("$br", "$avp(680)");
```

### `avp_shuffle(name)`

Randomly shuffles AVPs with _name_.

**Parameters:**

- `name` *(string, required)* — name of AVP to shuffle. Parameter syntax is: name = avp_name

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_shuffle usage.

```opensips
$avp(foo) := "str1";
$avp(foo)  = "str2";
$avp(foo)  = "str3";
xlog("Initial AVP list is: $(avp(foo)[*])\n");       # str3 str2 str1
if(avp_shuffle("$avp(foo)"))
    xlog("Shuffled AVP list is: $(avp(foo)[*])\n");  # str1, str3, str2 (for example)
```

### `avp_subst(avps, subst)`

Perl/sed-like subst applied to AVPs having string value.

**Parameters:**

- `avps` *(string, required)* — source AVP, destination AVP and flags. Parameter syntax: avps = src_avp [ '/' dst_avp [ '/' flags ] ]. src_avp = ( avp_name | avp_alias ). dst_avp = ( avp_name | avp_alias ) - if dst_avp is missing then the value of src_avp will be replaced. flags = ( d | D | g | G ) -- (d, D - delete source avp; g, G - apply to all avps matching src_avp name).
- `subst` *(string, required)* — perl/sed-like reqular expression. Parameter syntax: subst = "/regexp/replacement/flags". regexp - regular expression. replacement - replacement string, can include pseudo-variables and \1, ..., \9 for matching tokens, \0 for whole matching text. flags = 'g' | 'G' | 'i' | 'i' (g, G - replace all matching tokens; i, I - match ignore case).

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** avp_subst usage.

```opensips
# if avp 678 has a string value in e-mail format, replace the
# domain part with the value of domain part from R-URI
avp_subst("$avp(678)", "/(.*)@(.*)/\\1@$rd/");

# if any avp 678 has a string value in e-mail format, replace the
# domain part with the value of domain part from R-URI
# and place the result in avp 679
avp_subst("$avp(678)/$avp(679)/g", "/(.*)@(.*)/\\1@$rd/");
```

### `is_avp_set(name)`

Check if any AVP with _name_ is set.

**Parameters:**

- `name` *(string, required)* — name of AVP to look for. Parameter syntax is: name = avp_name|avp_alias [ '/' flags ]) flags = ('e'|'s'|'n') - e = empty value; s = value string; n = value number (int)

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, BRANCH_ROUTE, LOCAL_ROUTE, ONREPLY_ROUTE

**Example.** is_avp_set usage.

```opensips
if(is_avp_set("$avp(foo)"))
    xlog("AVP with name 'foo' is set!\n");
```

## Configuration Examples

### AVP naming examples

AVP naming examples

```opensips
$avp(11) - the AVP identified by name 11
$avp(foo) - the AVP identified by the string 'foo'
```
### Set `avp_url` parameter

Set `avp_url` parameter

```opensips
# default URL
modparam("avpops","db_url","mysql://user:passwd@host/database")
# an additional DB URL
modparam("avpops","db_url","1 postgres://user:passwd@host2/opensips")
```
### Set `avp_table` parameter

Set `avp_table` parameter

```opensips
modparam("avpops","avp_table","avptable")
```
### Set `use_domain` parameter

Set `use_domain` parameter

```opensips
modparam("avpops","use_domain",1)
```
### Set `uuid_column` parameter

Set `uuid_column` parameter

```opensips
modparam("avpops","uuid_column","uuid")
```
### Set `username_column` parameter

Set `username_column` parameter

```opensips
modparam("avpops","username_column","username")
```
### Set `domain_column` parameter

Set `domain_column` parameter

```opensips
modparam("avpops","domain_column","domain")
```
### Set `attribute_column` parameter

Set `attribute_column` parameter

```opensips
modparam("avpops","attribute_column","attribute")
```
### Set `value_column` parameter

Set `value_column` parameter

```opensips
modparam("avpops","value_column","value")
```
### Set `type_column` parameter

Set `type_column` parameter

```opensips
modparam("avpops","type_column","type")
```
### Set `db_scheme` parameter

Set `db_scheme` parameter

```opensips
modparam("avpops","db_scheme",
"scheme1:table=subscriber;uuid_col=uuid;value_col=first_name")
```
### `avp_db_load` usage

`avp_db_load` usage

```opensips
avp_db_load("$fu", "$avp(678)");
avp_db_load("$ru/domain", "i/domain_preferences");
avp_db_load("$avp(uuid)", "$avp(404fwd)/fwd_table");
avp_db_load("$ru", "$avp(123)/$some_scheme");

# use DB URL id 3
avp_db_load("$ru", "$avp(1)", 3);

# precede all loaded AVPs by the "caller_" prefix
avp_db_load("$ru", "$avp(100)", , "caller_");
xlog("Loaded: $avp(caller_100)\\n");
```
### `avp_db_store` usage

`avp_db_store` usage

```opensips
avp_db_store("$tu", "$avp(678)");
avp_db_store("$ru/username", "$avp(email)");
# use DB URL id 3
avp_db_store("$ru", "$avp(1)", 3);
```
### `avp_db_delete` usage

`avp_db_delete` usage

```opensips
avp_db_delete("$tu", "$avp(678)");
avp_db_delete("$ru/username", "$avp(email)");
avp_db_delete("$avp(uuid)", "$avp(404fwd)/fwd_table");
# use DB URL id 3
avp_db_delete("$ru", "$avp(1)", 3);
```
### `avp_db_query` usage

`avp_db_query` usage

```opensips
avp_db_query("SELECT password, ha1 FROM subscriber WHERE username='$tu',
	"$avp(pass);$avp(hash)");
avp_db_query("DELETE FROM subscriber");
avp_db_query("DELETE FROM subscriber", , 2);

$avp(id) = 2;
avp_db_query("DELETE FROM subscriber", , $avp(id));
```
### `avp_delete` usage

`avp_delete` usage

```opensips
avp_delete("$avp(email)"); # delete topmost (lastly set) value from $avp(email)
avp_delete("$avp(678)/g"); # fully purge $avp(678)
avp_delete("i");
avp_delete("a3");
```
### `avp_pushto` usage

`avp_pushto` usage

```opensips
avp_pushto("$ru/domain", "$fd");
avp_pushto("$ru", "$avp(678)");
avp_pushto("$ru/domain", "$avp(backup_domains)/g");
avp_pushto("$du", "$avp(679)");
avp_pushto("$br", "$avp(680)");
```
### `avp_check` usage

`avp_check` usage

```opensips
avp_check("$avp(678)", "lt/345/g");
avp_check("$fd", "eq/$td/I");
avp_check("$avp(foo)", "gt/$avp($bar)/g");
avp_check("$avp(foo)", "re/sip:.\*@bar.net/g");
avp_check("$avp(foo)", "fm/$avp(fm_avp)/g");
```
### `avp_copy` usage

`avp_copy` usage

```opensips
avp_copy("$avp(foo)", "$avp(bar)/g");
avp_copy("$avp(old)", "$avp(new)/gd"); # also deletes $avp(old)
```
### `avp_subst` usage

`avp_subst` usage

```opensips
# if avp 678 has a string value in e-mail format, replace the
# domain part with the value of domain part from R-URI
avp_subst("$avp(678)", "/(.\*)@(.*\)/\\1@$rd/");

# if any avp 678 has a string value in e-mail format, replace the
# domain part with the value of domain part from R-URI
# and place the result in avp 679
avp_subst("$avp(678)/$avp(679)/g", "/(.\*)@(.*\)/\\1@$rd/");
```
### `avp_op` usage

`avp_op` usage

```opensips
avp_op("$avp(678)", "add/345/g");
avp_op("$avp(number)", "sub/$avp(number2)/d");
```
### `is_avp_set` usage

`is_avp_set` usage

```opensips
if(is_avp_set("$avp(foo)"))
    xlog("AVP with name 'foo' is set!\\n");
```
### `avp_shuffle` usage

`avp_shuffle` usage

```opensips
$avp(foo) := "str1";
$avp(foo)  = "str2";
$avp(foo)  = "str3";
xlog("Initial AVP list is: $(avp(foo)[\*])\\n");       # str3 str2 str1
if(avp_shuffle("$avp(foo)"))
    xlog("Shuffled AVP list is: $(avp(foo)[\*])\\n");  # str1, str3, str2 (for example)
```
### `avp_print` usage

`avp_print` usage

```opensips
avp_print();
```
### `async avp_db_query` usage

`async avp_db_query` usage

```opensips
{
...
/* Example of a slow MySQL query - it should take around 5 seconds */
async(
	avp_db_query(
		"SELECT table_name, table_version, SLEEP(0.1) from version",
		"$avp(tb_name); $avp(tb_ver); $avp(retcode)"),
	my_resume_route);
/* script execution is halted right after the async() call */
}

/* We will be called when data is ready - meanwhile, the worker is free */
route [my_resume_route]
{
	xlog("Results: \\n$(avp(tb_name)[\*])\\n
-------------------\\n$(avp(tb_ver)[\*])\\n
-------------------\\n$(avp(retcode)[\*])\\n");
}
```
