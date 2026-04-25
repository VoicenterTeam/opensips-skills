# permissions Module Reference
<!-- generated-from: data/3.5/modules/permissions.json
     generator-version: 0.1.0
     opensips-version: 3.5
     doc-type: module -->

Reference for the OpenSIPs 3.5 permissions module. Read this file when configuring or debugging the permissions module: signature, parameters, return codes, exported MI commands, statistics, events, and configuration examples.

## Contents

- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported MI Functions](#exported-mi-functions)
- [Configuration Examples](#configuration-examples)

## Overview

### 1.1.1. Call Routing

The module can be used to determine if a call has appropriate permission to be established. Permission rules are stored in plaintext configuration files similar to `hosts.allow` and `hosts.deny` files used by tcpd.

When `allow_routing` function is called it tries to find a rule that matches selected fields of the message.

OpenSIPS is a forking proxy and therefore a single message can be sent to different destinations simultaneously. When checking permissions all the destinations must be checked and if one of them fails, the forwarding will fail.

The matching algorithm is as follows, first match wins:

*   Create a set of pairs of form (From, R-URI of branch 1), (From, R-URI of branch 2), etc.
    
*   Routing will be allowed when all pairs match an entry in the allow file.
    
*   Otherwise routing will be denied when one of pairs matches an entry in the deny file.
    
*   Otherwise, routing will be allowed.

A non-existing permission control file is treated as if it were an empty file. Thus, permission control can be turned off by providing no permission control files.

From header field and Request-URIs are always compared with regular expressions! For the syntax see the sample file: `config/permissions.allow`.

### 1.1.2. Registration Permissions

In addition to call routing it is also possible to check REGISTER messages and decide--based on the configuration files--whether the message should be allowed and the registration accepted or not.

Main purpose of the function is to prevent registration of "prohibited" IP addresses. One example, when a malicious user registers a contact containing IP address of a PSTN gateway, he might be able to bypass authorization checks performed by the SIP proxy. That is undesirable and therefore attempts to register IP address of a PSTN gateway should be rejected. Files `config/register.allow` and `config/register.deny` contain an example configuration.

Function for registration checking is called `allow_register` and the algorithm is very similar to the algorithm described in [Section 1.1.1, “Call Routing”](#sec-call-routing "1.1.1. Call Routing"). The only difference is in the way how pairs are created.

Instead of From header field the function uses To header field because To header field in REGISTER messages contains the URI of the person being registered. Instead of the Request-URI of branches the function uses Contact header field.

Thus, pairs used in matching will look like this: (To, Contact 1), (To, Contact 2), (To, Contact 3), and so on..

The algorithm of matching is same as described in [Section 1.1.1, “Call Routing”](#sec-call-routing "1.1.1. Call Routing").

### 1.1.3. URI Permissions

The module can be used to determine if request is allowed to the destination specified by an URI stored in a pvar. Permission rules are stored in plaintext configuration files similar to `hosts.allow` and `hosts.deny` used by tcpd.

When `allow_uri` function is called, it tries to find a rule that matches selected fields of the message. The matching algorithm is as follows, first match wins:

*   Create a pair <From URI, URI stored in pvar>.
    
*   Request will be allowed when the pair matches an entry in the allow file.
    
*   Otherwise request will be denied when the pair matches an entry in the deny file.
    
*   Otherwise, request will be allowed.

A non-existing permission control file is treated as if it were an empty file. Thus, permission control can be turned off by providing no permission control files.

From URI and URI stored in pvar are always compared with regular expressions! For the syntax see the sample file: `config/permissions.allow`.

### 1.1.4. Address Permissions

The module can be used to determine if an address (IP address and port) matches any of the IP subnets stored in cached OpenSIPS database table. Port 0 in cached database table matches any port. Group ID, IP address, port and transport protocol values to be matched can be either taken from the request (`check_source_address`) or given as pvar arguments or directly as strings(`check_address`).

Addresses stored in cached database table can be grouped together into one or more groups specified by a group identifier (unsigned integer). Group identifier is given as argument to `check_address` and `check_source_address`.

Otherwise the request is rejected.

The address database table is specified by module parameters.

## Dependencies

### OpenSIPs Modules

None.

### External Libraries

None.

## Exported Parameters

### `address_table` (string)

Name of database table containing matching rules used by `allow_register` function. Since version 2.2, this table name also represents the default table name for partitions without a 'table\_name' setting.

*Default value is address.*

**Example.** pbx.

```opensips
...
modparam("permissions", "address\_table", "pbx")
...
```
### `allow_suffix` (string)

Suffix to be appended to basename to create filename of the allow file when version with one parameter of either allow_routing or allow_register is used.

*Default value is .allow.*

**Notes:** Including leading dot.

**Example.** .allow.

```opensips
modparam("permissions", "allow\_suffix", ".allow")
```
### `check_all_branches` (integer)

If set then allow_routing functions will check Request-URI of all branches (default). If disabled then only Request-URI of the first branch will be checked.

*Default value is 1.*

**Notes:** Do not disable this parameter unless you really know what you are doing.

**Example.** 0.

```opensips
modparam("permissions", "check\_all\_branches", 0)
```
### `db_url` (string)

The URL of the database to be used for loading the data related to IP-based checking (“address” table).

This parameter is optional and it is needed only if you use functions related to IP-based checking. If you do so, you need to explicitly set this parameter (it will not inherit from “db\_default\_url”)

Since version 2.2, this URL represents the db\_url for the “default” partition.

*Default value is NULL.*

**Example.** dbdriver://username:password@dbhost/dbname.

```opensips
...
modparam("permissions", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### `default_allow_file` (string)

Default allow file used by functions without parameters. If you don't specify full pathname then the directory in which is the main config file is located will be used.

*Default value is permissions.allow.*

**Example.** /etc/permissions.allow.

```opensips
modparam("permissions", "default\_allow\_file", "/etc/permissions.allow")
```
### `default_deny_file` (string)

Default file containing deny rules. The file is used by functions without parameters. If you don't specify full pathname then the directory in which the main config file is located will be used.

*Default value is permissions.deny.*

**Example.** /etc/permissions.deny.

```opensips
modparam("permissions", "default\_deny\_file", "/etc/permissions.deny")
```
### `deny_suffix` (string)

Suffix to be appended to basename to create filename of the deny file when version with one parameter of either allow_routing or allow_register is used.

*Default value is .deny.*

**Notes:** Including leading dot.

**Example.** .deny.

```opensips
modparam("permissions", "deny\_suffix", ".deny")
```
### `grp_col` (string)

Name of address table column containing group identifier of the address.

*Default value is grp.*

**Example.** group\_id.

```opensips
...
modparam("permissions", "grp\_col", "group\_id")
...
```
### `info_col` (string)

Name of address table column containing a string that is added as value to a pvar given as argument to `check_address` or `check_source_address` in case the function succedes.

*Default value is context_info.*

**Example.** info_col.

```opensips
modparam("permissions", "info_col", "info_col")
```
### `ip_col` (string)

Name of address table column containing IP address part of the address.

*Default value is ip.*

**Example.** ipess.

```opensips
...
modparam("permissions", "ip\_col", "ipess")
...
```
### `mask_col` (string)

Name of address table column containing network mask of the address. Possible values are 0-128. It should be up to 32 if the IP is v4 and up to 128 if the IP is v6.

*Default value is mask.*

*Valid range: 0 to 128.*

**Example.** subnet_length.

```opensips
modparam("permissions", "mask_col", "subnet_length")
```
### `partition` (string)

Specify a new IP-based checking partition (data source). This parameter may be set multiple times. Each partition may have a specific "db\_url" and "table\_name". If not specified, these values will be inherited from [db\_url](#param_db_url "1.3.6.�db_url (string)"), db\_default\_url or [address\_table](#param_address_table "1.3.7.�address_table (string)"), respectively. The name of the default partition is 'default'.

**Example.** 
	inbound:
		db\_url = postgres://opensips:opensipsrw@127.0.0.1/opensips;
		table\_name = address.

```opensips
...
modparam("permissions", "partition", "
	inbound:
		db\_url = postgres://opensips:opensipsrw@127.0.0.1/opensips;
		table\_name = address")
...
```
### `pattern_col` (string)

Name of address table column containinga a pattern (a shell wildcard pattern, like the ones used for file name matching) that is matched against the arguments received by `check_address` or `check_source_address`.

*Default value is pattern.*

**Example.** wildcard_col.

```opensips
modparam("permissions", "pattern_col", "wildcard_col")
```
### `port_col` (string)

Name of address table column containing port part of the address.

*Default value is port.*

**Example.** prt.

```opensips
modparam("permissions", "port_col", "prt")
```
### `proto_col` (string)

Name of address table column containing transport protocol that is matched against transport protocol of received request. Possible values that can be stored in proto_col are “any”, “udp”, “tcp”, “tls”, “sctp”, and “none”. Value “any” matches always and value “none” never.

*Default value is proto.*

**Possible values:**

- any
- udp
- tcp
- tls
- sctp
- none

**Example.** transport.

```opensips
modparam("permissions", "proto_col", "transport")
```

## Exported Functions

### `allow_register(basename)`

The function returns true if all pairs constructed as described in [Section 1.1.2, “Registration Permissions”](#sec-registration-permissions "1.1.2.�Registration Permissions") have appropriate permissions according to the configuration files given as parameters.

**Parameters:**

- `basename` *(string, required)* — Basename from which allow and deny filenames will be created by appending contents of allow_suffix and deny_suffix parameters. If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.

**Return codes:**

- `true` — if all pairs constructed as described in Section 1.1.2, “Registration Permissions” have appropriate permissions according to the configuration files given as parameters.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** Checks REGISTER permissions using 'register' basename..

```opensips
if ($rm=="REGISTER") {
	if (allow_register("register")) {
		save("location");
		exit;
	} else {
		sl_send_reply(403, "Forbidden");
	};
};
```

### `allow_routing()`

Returns true if all pairs constructed as described in [Section 1.1.1, “Call Routing”](#sec-call-routing "1.1.1. Call Routing") have appropriate permissions according to the configuration files. This function uses default configuration files specified in `default_allow_file` and `default_deny_file`.

**Return codes:**

- `true` — all pairs have appropriate permissions according to the configuration files

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** Allow routing using default files.

```opensips
if (allow\_routing()) {
	t\_relay();
};
```

### `allow_routing(basename)`

Returns true if all pairs constructed as described in [Section 1.1.1, “Call Routing”](#sec-call-routing "1.1.1. Call Routing") have appropriate permissions according to the configuration files given as parameters.

**Parameters:**

- `basename` *(string, required)* — Basename from which allow and deny filenames will be created by appending contents of `allow_suffix` and `deny_suffix` parameters. If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.

**Return codes:**

- `true` — all pairs have appropriate permissions according to the configuration files given as parameters

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** Allow routing using specified basename.

```opensips
if (allow\_routing("basename")) {
	t\_relay();
};
```

### `allow_uri(basename, uri)`

Returns true if the pair constructed as described in [Section 1.1.3, “URI Permissions”](#sec-uri-permissions "1.1.3.�URI Permissions") have appropriate permissions according to the configuration files specified by the parameter.

**Parameters:**

- `basename` *(string, required)* — Basename from which allow and deny filenames will be created by appending contents of allow_suffix and deny_suffix parameters. If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.
- `uri` *(string, required)* — SIP URI to be checked.

**Return codes:**

- `true` — if the pair constructed as described in Section 1.1.3, “URI Permissions” have appropriate permissions according to the configuration files specified by the parameter.

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** Checks Refer-To URI and URI stored in AVP..

```opensips
if (allow_uri("basename", $rt)) {  // Check Refer-To URI
	t_relay();
};
if (allow_uri("basename", $avp(uri)) {  // Check URI stored in $avp(uri)
	t_relay();
};
```

### `check_address(group_id, ip, port, proto [, context_info], [pattern], [partition])`

Returns 1 if group id, IP address, port and protocol given as arguments match an IP subnet found in cached address table, as described in [Section 1.1.4, “Address Permissions”](#sec-address-permissions "1.1.4. Address Permissions") . The function takes 4 mandatory arguments and 3 optional ones. This function can be useful to check if a request can be allowed without authentication.

**Parameters:**

- `context_info` *(var, optional)* — This argument represents the variable in wich the context_info field from the cached address table will be stored in case of match.
- `group_id` *(int, required)* — This argument represents the group id to be matched. If the group_id argument is "0", the query can match any group in the cached address table.
- `ip` *(string, required)* — This argument represents the ip address to be matched. This argument cannot be null/empty.
- `partition` *(string, optional)* — An optional parition name for the group id. If no partition specified, the “default” one will be used.
- `pattern` *(string, optional)* — This argument is a string to be matched against the wildcard pattern field from the address table.
- `port` *(int, required)* — This argument represents the port to be matched. Cached address table entry containing port value 0 matches any port. Also, a 0 value for the argument will match any port in the address table.
- `proto` *(string, required)* — This argument represents the protocol used for transport; Transport protocol is either "ANY" or any valid transport protocol value: "UDP, "TCP", "TLS", and "SCTP".
  - `ANY`
  - `UDP`
  - `TCP`
  - `TLS`
  - `SCTP`

**Return codes:**

- `1` — group id, IP address, port and protocol match an IP subnet found in cached address table

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, LOCAL_ROUTE, BRANCH_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** Checks if the tuple IP address/port (given as strings) and source protocol (given as pvar), belongs to group 4, verifies if the string "texttest" matches the wildcard pattern field in the database table and stores the context information in $avp(ctx).

```opensips
// Checks if the tuple IP address/port (given as strings) and source protocol
// (given as pvar), belongs to group 4, verifies if the string "texttest"
// matches the wildcard pattern field in the database table and stores the
// context information in $avp(ctx)
if (check\_address( 4, "192.168.2.135", 5700, "$socket\_in(proto)", $avp(ctx), "texttest")) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}
```

**Example.** Checks address with partition.

```opensips
if (check\_address( 4, "192.168.2.135", 5700, "$socket\_in(proto)", , , "my\_part")) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}
```

**Example.** Checks if the tuple IP address/port/protocol of the source message is in group 4.

```opensips
// Checks if the tuple IP address/port/protocol of the source message is in group 4
if (check\_address( 4, "$si", "$sp", "$socket\_in(proto)")) {
	t\_relay();
}
```

**Example.** Checks if the tuple IP address/port/protocol stored in AVPs s:ip/s:port/s:proto is in group 4 and stores context information in $avp(ctx).

```opensips
// Checks if the tuple IP address/port/protocol stored in AVPs s:ip/s:port/s:proto
// is in group 4 and stores context information in $avp(ctx)
$avp(ip) = "192.168.2.135";
$avp(port) = 5061;
$avp(proto) = "any";
$avp(partition)="my\_part";
if (check\_address( 4, $avp(ip), $avp(port), $avp(proto), $avp(ctx), , $avp(partition))) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}
```

**Example.** Checks if the tuple IP address/port (given as strings) and source protocol (given as pvar) is in group 4, verifies if string the "texttest" matches the wildcard pattern field in the database table, without storing any context information.

```opensips
// Checks if the tuple IP address/port (given as strings) and source protocol
// (given as pvar) is in group 4, verifies if string the "texttest" matches
// the wildcard pattern field in the database table, without storing any
// context information
if (check\_address( 4,$si, 5700, $socket\_in(proto), ,"texttest")) {
	t\_relay();
}
```

### `check_source_address(group_id , [context_info], [pattern], [partition])`

Equivalent to check_address(group_id, "$si", "$sp", "$socket_in(proto)", context_info, pattern, partition).

**Parameters:**

- `context_info` *(var, optional)* — Variable in which the context_info field from the cached address table will be stored in case of match.
- `group_id` *(int, required)* — Group id to be matched.
- `partition` *(string, optional)* — An optional partition name for the group id. If no partition specified, the “default” one will be used.
- `pattern` *(string, optional)* — String to be matched against the wildcard pattern field from the address table.

**Return codes:**

- `1` — match found

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, LOCAL_ROUTE, BRANCH_ROUTE, STARTUP_ROUTE, TIMER_ROUTE, EVENT_ROUTE

**Example.** Check if source address/port/proto is in group 4 and stores context information in $avp(ctx).

```opensips
// Check if source address/port/proto is in group 4 and stores
// context information in $avp(ctx)
if (check\_source\_address( 4,$avp(ctx), , , $avp(my\_partition))) {
	xlog("$avp(ctx)\\n");
}else {
	sl\_send\_reply(403, "Forbidden");
}
```

### `get_source_group(var,[partition])`

Checks if an entry with the source ip/port/protocol is found in cached address or subnet table in any group. If yes, returns that group in the variable parameter. If not returns -1. Port value 0 in cached address and subnet table matches any port. Optionally, you can also specify the partition. If no partition specified, the “default” one will be used.

**Parameters:**

- `partition` *(string, optional)* — An optional partition name. If no partition specified, the “default” one will be used.
- `var` *(var, required)* — Variable to store the found group id.

**Return codes:**

- `-1` — entry not found
- `group_id` — entry found

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE, LOCAL_ROUTE, BRANCH_ROUTE

**Example.** Checks source group and logs it.

```opensips
if ( get\_source\_group( $var(group)) ) {
   # do something with $var(group)
   xlog("group is $var(group)\\n");
};
```

## Exported MI Functions

### `address_dump`

Causes permissions module to dump contents of the address table from cache memory.

**Parameters:**

- `partition` *(string, optional)* — the name of the partition to be dumped. If none specified all the partitions shall be dumped.

### `address_reload`

Causes permissions module to re-read the contents of the address database table into cache memory. In cache memory the entries are for performance reasons stored in two different tables: address table and subnet table depending on the value of the mask field (32 or smaller).

**Parameters:**

- `partition` *(string, optional)* — the name of the partition to be reloaded. If none specified all the partitions shall be reloaded.

### `allow_uri`

Tests if (URI, Contact) pair is allowed according to allow/deny files. The files must already have been loaded by OpenSIPS.

**Parameters:**

- `basename` *(string, required)* — Basename from which allow and deny filenames will be created by appending contents of allow_suffix and deny_suffix parameters.
- `Contact` *(string, required)* — Contact to be tested
- `URI` *(string, required)* — URI to be tested

### `subnet_dump`

Causes permissions module to dump contents of cache memory subnet table.

**Parameters:**

- `partition` *(string, optional)* — the name of the partition to be dumped. If none specified all the partitions shall be dumped.

## Configuration Examples

### Set `default_allow_file` parameter

Set `default_allow_file` parameter

```opensips
...
modparam("permissions", "default\_allow\_file", "/etc/permissions.allow")
...
```
### Set `default_deny_file` parameter

Set `default_deny_file` parameter

```opensips
...
modparam("permissions", "default\_deny\_file", "/etc/permissions.deny")
...
```
### Set `check_all_branches` parameter

Set `check_all_branches` parameter

```opensips
...
modparam("permissions", "check\_all\_branches", 0)
...
```
### Set `allow_suffix` parameter

Set `allow_suffix` parameter

```opensips
...
modparam("permissions", "allow\_suffix", ".allow")
...
```
### Set `deny_suffix` parameter

Set `deny_suffix` parameter

```opensips
...
modparam("permissions", "deny\_suffix", ".deny")
...
```
### Set `db_url` parameter

Set `db_url` parameter

```opensips
...
modparam("permissions", "db\_url", "dbdriver://username:password@dbhost/dbname")
...
```
### Set `address_table` parameter

Set `address_table` parameter

```opensips
...
modparam("permissions", "address\_table", "pbx")
...
```
### Set `partition` parameter

Set `partition` parameter

```opensips
...
modparam("permissions", "partition", "
	inbound:
		db\_url = postgres://opensips:opensipsrw@127.0.0.1/opensips;
		table\_name = address")
...
```
### Set `grp_col` parameter

Set `grp_col` parameter

```opensips
...
modparam("permissions", "grp\_col", "group\_id")
...
```
### Set `ip_col` parameter

Set `ip_col` parameter

```opensips
...
modparam("permissions", "ip\_col", "ipess")
...
```
### Set `mask_col` parameter

Set `mask_col` parameter

```opensips
...
modparam("permissions", "mask\_col", "subnet\_length")
...
```
### Set `port_col` parameter

Set `port_col` parameter

```opensips
...
modparam("permissions", "port\_col", "prt")
...
```
### Set `proto_col` parameter

Set `proto_col` parameter

```opensips
...
modparam("permissions", "proto\_col", "transport")
...
```
### Set `pattern_col` parameter

Set `pattern_col` parameter

```opensips
...
modparam("permissions", "pattern\_col", "wildcard\_col")
...
```
### Set `info_col` parameter

Set `info_col` parameter

```opensips
...
modparam("permissions", "info\_col", "info\_col")
...
```
### `check_address()` usage

`check_address()` usage

```opensips
...

// Checks if the tuple IP address/port (given as strings) and source protocol
// (given as pvar), belongs to group 4, verifies if the string "texttest"
// matches the wildcard pattern field in the database table and stores the
// context information in $avp(ctx)
if (check\_address( 4, "192.168.2.135", 5700, "$socket\_in(proto)", $avp(ctx), "texttest")) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}

if (check\_address( 4, "192.168.2.135", 5700, "$socket\_in(proto)", , , "my\_part")) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}
...

// Checks if the tuple IP address/port/protocol of the source message is in group 4
if (check\_address( 4, "$si", "$sp", "$socket\_in(proto)")) {
	t\_relay();
}

...

// Checks if the tuple IP address/port/protocol stored in AVPs s:ip/s:port/s:proto
// is in group 4 and stores context information in $avp(ctx)
$avp(ip) = "192.168.2.135";
$avp(port) = 5061;
$avp(proto) = "any";
$avp(partition)="my\_part";
if (check\_address( 4, $avp(ip), $avp(port), $avp(proto), $avp(ctx), , $avp(partition))) {
	t\_relay();
	xlog("$avp(ctx)\\n");
}

...

// Checks if the tuple IP address/port (given as strings) and source protocol
// (given as pvar) is in group 4, verifies if string the "texttest" matches
// the wildcard pattern field in the database table, without storing any
// context information
if (check\_address( 4,$si, 5700, $socket\_in(proto), ,"texttest")) {
	t\_relay();
}

...
```
### `check_source_address()` usage

`check_source_address()` usage

```opensips
...
// Check if source address/port/proto is in group 4 and stores
// context information in $avp(ctx)
if (check\_source\_address( 4,$avp(ctx), , , $avp(my\_partition))) {
	xlog("$avp(ctx)\\n");
}else {
	sl\_send\_reply(403, "Forbidden");
}
...
```
### `get_source_group()` usage

`get_source_group()` usage

```opensips
...

if ( get\_source\_group( $var(group)) ) {
   # do something with $var(group)
   xlog("group is $var(group)\\n");
};
...
```
### `allow_routing` usage

`allow_routing` usage

```opensips
...
if (allow\_routing()) {
	t\_relay();
};
...
```
### `allow_routing(basename)` usage

`allow_routing(basename)` usage

```opensips
...
if (allow\_routing("basename")) {
	t\_relay();
};
...
```
### `allow_register(basename)` usage

`allow_register(basename)` usage

```opensips
...
if ($rm=="REGISTER") {
	if (allow\_register("register")) {
		save("location");
		exit;
	} else {
		sl\_send\_reply(403, "Forbidden");
	};
};
...
```
### `allow_uri(basename, uri)` usage

`allow_uri(basename, uri)` usage

```opensips
...
if (allow\_uri("basename", $rt)) {  // Check Refer-To URI
	t\_relay();
};
if (allow\_uri("basename", $avp(uri)) {  // Check URI stored in $avp(uri)
	t\_relay();
};
...
```
