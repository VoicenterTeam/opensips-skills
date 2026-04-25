# permissions Module

---

**List of Tables**

2.1. [Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)](#idp5891904)

2.2. [Most recently active contributors(1) to this module](#idp5996512)

**List of Examples**

1.1. [Set `default_allow_file` parameter](#idp5542448)

1.2. [Set `default_deny_file` parameter](#idp5547488)

1.3. [Set `check_all_branches` parameter](#idp5553056)

1.4. [Set `allow_suffix` parameter](#idp5560032)

1.5. [Set `deny_suffix` parameter](#idp5566992)

1.6. [Set `db_url` parameter](#idp5574048)

1.7. [Set `address_table` parameter](#idp5580128)

1.8. [Set `partition` parameter](#idp5586448)

1.9. [Set `grp_col` parameter](#idp5591760)

1.10. [Set `ip_col` parameter](#idp5596656)

1.11. [Set `mask_col` parameter](#idp5601664)

1.12. [Set `port_col` parameter](#idp5606656)

1.13. [Set `proto_col` parameter](#idp5614752)

1.14. [Set `pattern_col` parameter](#idp5621088)

1.15. [Set `info_col` parameter](#idp5627360)

1.16. [`check_address()` usage](#idp5642624)

1.17. [`check_source_address()` usage](#idp5648928)

1.18. [`get_source_group()` usage](#idp5657120)

1.19. [`allow_routing` usage](#idp5663360)

1.20. [`allow_routing(basename)` usage](#idp5671920)

1.21. [`allow_register(basename)` usage](#idp5680560)

1.22. [`allow_uri(basename, uri)` usage](#idp5690304)

## Chapter�1.�Admin Guide

## 1.1.�Overview

### 1.1.1.�Call Routing

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

### 1.1.2.�Registration Permissions

In addition to call routing it is also possible to check REGISTER messages and decide--based on the configuration files--whether the message should be allowed and the registration accepted or not.

Main purpose of the function is to prevent registration of "prohibited" IP addresses. One example, when a malicious user registers a contact containing IP address of a PSTN gateway, he might be able to bypass authorization checks performed by the SIP proxy. That is undesirable and therefore attempts to register IP address of a PSTN gateway should be rejected. Files `config/register.allow` and `config/register.deny` contain an example configuration.

Function for registration checking is called `allow_register` and the algorithm is very similar to the algorithm described in [Section�1.1.1, “Call Routing”](#sec-call-routing "1.1.1.�Call Routing"). The only difference is in the way how pairs are created.

Instead of From header field the function uses To header field because To header field in REGISTER messages contains the URI of the person being registered. Instead of the Request-URI of branches the function uses Contact header field.

Thus, pairs used in matching will look like this: (To, Contact 1), (To, Contact 2), (To, Contact 3), and so on..

The algorithm of matching is same as described in [Section�1.1.1, “Call Routing”](#sec-call-routing "1.1.1.�Call Routing").

### 1.1.3.�URI Permissions

The module can be used to determine if request is allowed to the destination specified by an URI stored in a pvar. Permission rules are stored in plaintext configuration files similar to `hosts.allow` and `hosts.deny` used by tcpd.

When `allow_uri` function is called, it tries to find a rule that matches selected fields of the message. The matching algorithm is as follows, first match wins:

*   Create a pair <From URI, URI stored in pvar>.
    
*   Request will be allowed when the pair matches an entry in the allow file.
    
*   Otherwise request will be denied when the pair matches an entry in the deny file.
    
*   Otherwise, request will be allowed.
    

A non-existing permission control file is treated as if it were an empty file. Thus, permission control can be turned off by providing no permission control files.

From URI and URI stored in pvar are always compared with regular expressions! For the syntax see the sample file: `config/permissions.allow`.

### 1.1.4.�Address Permissions

The module can be used to determine if an address (IP address and port) matches any of the IP subnets stored in cached OpenSIPS database table. Port 0 in cached database table matches any port. Group ID, IP address, port and transport protocol values to be matched can be either taken from the request (`check_source_address`) or given as pvar arguments or directly as strings(`check_address`).

Addresses stored in cached database table can be grouped together into one or more groups specified by a group identifier (unsigned integer). Group identifier is given as argument to `check_address` and `check_source_address`.

Otherwise the request is rejected.

The address database table is specified by module parameters.

## 1.2.�Dependencies

### 1.2.1.�OpenSIPS Modules

The following modules must be loaded before this module:

*   _No dependencies on other OpenSIPS modules_.
    

### 1.2.2.�External Libraries or Applications

The following libraries or applications must be installed before running OpenSIPS with this module loaded:

*   _None_.
    

## 1.3.�Exported Parameters

### 1.3.1.�`default_allow_file` (string)

Default allow file used by functions without parameters. If you don't specify full pathname then the directory in which is the main config file is located will be used.

_Default value is “permissions.allow”._

**Example�1.1.�Set `default_allow_file` parameter**

...
modparam("permissions", "default\_allow\_file", "/etc/permissions.allow")
...

  

### 1.3.2.�`default_deny_file` (string)

Default file containing deny rules. The file is used by functions without parameters. If you don't specify full pathname then the directory in which the main config file is located will be used.

_Default value is “permissions.deny”._

**Example�1.2.�Set `default_deny_file` parameter**

...
modparam("permissions", "default\_deny\_file", "/etc/permissions.deny")
...

  

### 1.3.3.�`check_all_branches` (integer)

If set then allow\_routing functions will check Request-URI of all branches (default). If disabled then only Request-URI of the first branch will be checked.

### Warning

Do not disable this parameter unless you really know what you are doing.

_Default value is 1._

**Example�1.3.�Set `check_all_branches` parameter**

...
modparam("permissions", "check\_all\_branches", 0)
...

  

### 1.3.4.�`allow_suffix` (string)

Suffix to be appended to basename to create filename of the allow file when version with one parameter of either `allow_routing` or `allow_register` is used.

### Note

Including leading dot.

_Default value is “.allow”._

**Example�1.4.�Set `allow_suffix` parameter**

...
modparam("permissions", "allow\_suffix", ".allow")
...

  

### 1.3.5.�`deny_suffix` (string)

Suffix to be appended to basename to create filename of the deny file when version with one parameter of either `allow_routing` or `allow_register` is used.

### Note

Including leading dot.

_Default value is “.deny”._

**Example�1.5.�Set `deny_suffix` parameter**

...
modparam("permissions", "deny\_suffix", ".deny")
...

  

### 1.3.6.�`db_url` (string)

The URL of the database to be used for loading the data related to IP-based checking (“address” table).

This parameter is optional and it is needed only if you use functions related to IP-based checking. If you do so, you need to explicitly set this parameter (it will not inherit from “db\_default\_url”)

Since version 2.2, this URL represents the db\_url for the “default” partition.

_Default value is “NULL”._

**Example�1.6.�Set `db_url` parameter**

...
modparam("permissions", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.3.7.�`address_table` (string)

Name of database table containing matching rules used by `allow_register` function. Since version 2.2, this table name also represents the default table name for partitions without a 'table\_name' setting.

_Default value is “address”._

**Example�1.7.�Set `address_table` parameter**

...
modparam("permissions", "address\_table", "pbx")
...

  

### 1.3.8.�`partition` (string)

Specify a new IP-based checking partition (data source). This parameter may be set multiple times. Each partition may have a specific "db\_url" and "table\_name". If not specified, these values will be inherited from [db\_url](#param_db_url "1.3.6.�db_url (string)"), db\_default\_url or [address\_table](#param_address_table "1.3.7.�address_table (string)"), respectively. The name of the default partition is 'default'.

**Example�1.8.�Set `partition` parameter**

...
modparam("permissions", "partition", "
	inbound:
		db\_url = postgres://opensips:opensipsrw@127.0.0.1/opensips;
		table\_name = address")
...

  

### 1.3.9.�`grp_col` (string)

Name of address table column containing group identifier of the address.

_Default value is “grp”._

**Example�1.9.�Set `grp_col` parameter**

...
modparam("permissions", "grp\_col", "group\_id")
...

  

### 1.3.10.�`ip_col` (string)

Name of address table column containing IP address part of the address.

_Default value is “ip”._

**Example�1.10.�Set `ip_col` parameter**

...
modparam("permissions", "ip\_col", "ipess")
...

  

### 1.3.11.�`mask_col` (string)

Name of address table column containing network mask of the address. Possible values are 0-128. It should be up to 32 if the IP is v4 and up to 128 if the IP is v6.

_Default value is “mask”._

**Example�1.11.�Set `mask_col` parameter**

...
modparam("permissions", "mask\_col", "subnet\_length")
...

  

### 1.3.12.�`port_col` (string)

Name of address table column containing port part of the address.

_Default value is “port”._

**Example�1.12.�Set `port_col` parameter**

...
modparam("permissions", "port\_col", "prt")
...

  

### 1.3.13.�`proto_col` (string)

Name of address table column containing transport protocol that is matched against transport protocol of received request. Possible values that can be stored in proto\_col are “any”, “udp”, “tcp”, “tls”, “sctp”, and “none”. Value “any” matches always and value “none” never.

_Default value is “proto”._

**Example�1.13.�Set `proto_col` parameter**

...
modparam("permissions", "proto\_col", "transport")
...

  

### 1.3.14.�`pattern_col` (string)

Name of address table column containinga a pattern (a shell wildcard pattern, like the ones used for file name matching) that is matched against the arguments received by `check_address` or `check_source_address`.

_Default value is “pattern”._

**Example�1.14.�Set `pattern_col` parameter**

...
modparam("permissions", "pattern\_col", "wildcard\_col")
...

  

### 1.3.15.�`info_col` (string)

Name of address table column containing a string that is added as value to a pvar given as argument to `check_address` or `check_source_address` in case the function succedes.

_Default value is “context\_info”._

**Example�1.15.�Set `info_col` parameter**

...
modparam("permissions", "info\_col", "info\_col")
...

  

## 1.4.�Exported Functions

### 1.4.1.� `check_address(group_id, ip, port, proto [, context_info], [pattern], [partition])`

Returns 1 if group id, IP address, port and protocol given as arguments match an IP subnet found in cached address table, as described in [Section�1.1.4, “Address Permissions”](#sec-address-permissions "1.1.4.�Address Permissions") . The function takes 4 mandatory arguments and 3 optional ones.

This function can be useful to check if a request can be allowed without authentication.

Meaning of the parameter is as follows:

*   group\_id (int)
    
    This argument represents the group id to be matched. If the group\_id argument is "0", the query can match any group in the cached address table.
    
*   ip (string)
    
    This argument represents the ip address to be matched. This argument cannot be null/empty.
    
*   port (int)
    
    This argument represents the port to be matched. Cached address table entry containing port value 0 matches any port. Also, a _0_ value for the argument will match any port in the address table.
    
*   proto (string)
    
    This argument represents the protocol used for transport; Transport protocol is either "ANY" or any valid transport protocol value: "UDP, "TCP", "TLS", and "SCTP".
    
*   context\_info (var, optional)
    
    This argument represents the variable in wich the context\_info field from the cached address table will be stored in case of match.
    
*   pattern (string, optional)
    
    This argument is a string to be matched against the wildcard pattern field from the address table.
    
*   partition (string, optional)
    
    An optional parition name for the group id. If no partition specified, the “default” one will be used.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, BRANCH\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE.

**Example�1.16.�`check_address()` usage**

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

  

### 1.4.2.� `check_source_address(group_id , [context_info], [pattern], [partition])`

Equivalent to check\_address(group\_id, "$si", "$sp", "$socket\_in(proto)", context\_info, pattern, partition).

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, BRANCH\_ROUTE, STARTUP\_ROUTE, TIMER\_ROUTE, EVENT\_ROUTE.

**Example�1.17.�`check_source_address()` usage**

...
// Check if source address/port/proto is in group 4 and stores
// context information in $avp(ctx)
if (check\_source\_address( 4,$avp(ctx), , , $avp(my\_partition))) {
	xlog("$avp(ctx)\\n");
}else {
	sl\_send\_reply(403, "Forbidden");
}
...

  

### 1.4.3.� `get_source_group(var,[partition])`

Checks if an entry with the source ip/port/protocol is found in cached address or subnet table in any group. If yes, returns that group in the variable parameter. If not returns -1. Port value 0 in cached address and subnet table matches any port. Optionally, you can also specify the partition. If no partition specified, the “default” one will be used.

Parameters:

*   _var_ (var)
    
*   _partition_ (string, optional)
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE, LOCAL\_ROUTE, BRANCH\_ROUTE.

**Example�1.18.�`get_source_group()` usage**

...

if ( get\_source\_group( $var(group)) ) {
   # do something with $var(group)
   xlog("group is $var(group)\\n");
};
...

  

### 1.4.4.� `allow_routing()`

Returns true if all pairs constructed as described in [Section�1.1.1, “Call Routing”](#sec-call-routing "1.1.1.�Call Routing") have appropriate permissions according to the configuration files. This function uses default configuration files specified in `default_allow_file` and `default_deny_file`.

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.19.�`allow_routing` usage**

...
if (allow\_routing()) {
	t\_relay();
};
...

  

### 1.4.5.� `allow_routing(basename)`

Returns true if all pairs constructed as described in [Section�1.1.1, “Call Routing”](#sec-call-routing "1.1.1.�Call Routing") have appropriate permissions according to the configuration files given as parameters.

Meaning of the parameters is as follows:

*   _basename_ (string) - Basename from which allow and deny filenames will be created by appending contents of `allow_suffix` and `deny_suffix` parameters.
    
    If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.20.�`allow_routing(basename)` usage**

...
if (allow\_routing("basename")) {
	t\_relay();
};
...

  

### 1.4.6.� `allow_register(basename)`

The function returns true if all pairs constructed as described in [Section�1.1.2, “Registration Permissions”](#sec-registration-permissions "1.1.2.�Registration Permissions") have appropriate permissions according to the configuration files given as parameters.

Meaning of the parameters is as follows:

*   _basename_ (string) - Basename from which allow and deny filenames will be created by appending contents of `allow_suffix` and `deny_suffix` parameters.
    
    If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.21.�`allow_register(basename)` usage**

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

  

### 1.4.7.� `allow_uri(basename, uri)`

Returns true if the pair constructed as described in [Section�1.1.3, “URI Permissions”](#sec-uri-permissions "1.1.3.�URI Permissions") have appropriate permissions according to the configuration files specified by the parameter.

Meaning of the parameter is as follows:

*   _basename_ (string) - Basename from which allow and deny filenames will be created by appending contents of `allow_suffix` and `deny_suffix` parameters.
    
    If the parameter doesn't contain full pathname then the function expects the file to be located in the same directory as the main configuration file of the server.
    
*   _uri_ (string) - SIP URI to be checked.
    

This function can be used from REQUEST\_ROUTE, FAILURE\_ROUTE.

**Example�1.22.�`allow_uri(basename, uri)` usage**

...
if (allow\_uri("basename", $rt)) {  // Check Refer-To URI
	t\_relay();
};
if (allow\_uri("basename", $avp(uri)) {  // Check URI stored in $avp(uri)
	t\_relay();
};
...

  

## 1.5.�Exported MI Functions

### 1.5.1.� `address_reload`

Causes permissions module to re-read the contents of the address database table into cache memory. In cache memory the entries are for performance reasons stored in two different tables: address table and subnet table depending on the value of the mask field (32 or smaller).

Parameters:

*   _partition_ - the name of the partition to be reloaded. If none specified all the partitions shall be reloaded.
    

### 1.5.2.� `address_dump`

Causes permissions module to dump contents of the address table from cache memory.

Parameters:

*   _partition_ - the name of the partition to be dumped. If none specified all the partitions shall be dumped.
    

### 1.5.3.� `subnet_dump`

Causes permissions module to dump contents of cache memory subnet table.

Parameters:

*   _partition_ - the name of the partition to be dumped. If none specified all the partitions shall be dumped.
    

### 1.5.4.� `allow_uri`

Tests if (URI, Contact) pair is allowed according to allow/deny files. The files must already have been loaded by OpenSIPS.

Parameters:

*   _basename_ - Basename from which allow and deny filenames will be created by appending contents of allow\_suffix and deny\_suffix parameters.
    
*   _URI_ - URI to be tested
    
*   _Contact_ - Contact to be tested
    

## Chapter�2.�Contributors

## 2.1.�By Commit Statistics

**Table�2.1.�Top contributors by DevScore(1), authored commits(2) and lines added/removed(3)**

�

Name

DevScore

Commits

Lines ++

Lines --

1.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

120

76

1063

2134

2.

Juha Heinanen ([@juha-h](https://github.com/juha-h))

62

21

3406

729

3.

Jan Janak ([@janakj](https://github.com/janakj))

57

21

2871

621

4.

Irina-Maria Stanescu

52

9

1218

1908

5.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

30

20

412

369

6.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

27

23

178

117

7.

Daniel-Constantin Mierla ([@miconda](https://github.com/miconda))

17

11

126

221

8.

Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita))

16

4

970

175

9.

Henning Westerholt ([@henningw](https://github.com/henningw))

15

10

136

148

10.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

12

4

296

273

  

**All remaining contributors**: Andrei Pelinescu-Onciul, Dan Pascu ([@danpascu](https://github.com/danpascu)), Miklos Tirpak, Ancuta Onofrei, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Maksym Sobolyev ([@sobomax](https://github.com/sobomax)), Elena-Ramona Modroiu, Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Dusan Klinec ([@ph4r05](https://github.com/ph4r05)), Anca Vamanu, wuhanck, Konstantin Bokarius, Norman Brandinger ([@NormB](https://github.com/NormB)), UnixDev, Andreas Granig, Baptiste Cholley, Juli�n Moreno Pati�o, Edson Gellert Schubert.

_(1) DevScore = author\_commits + author\_lines\_added / (project\_lines\_added / project\_commits) + author\_lines\_deleted / (project\_lines\_deleted / project\_commits)_

_(2) including any documentation-related commits, excluding merge commits. Regarding imported patches/code, we do our best to count the work on behalf of the proper owner, as per the "fix\_authors" and "mod\_renames" arrays in opensips/doc/build-contrib.sh. If you identify any patches/commits which do not get properly attributed to you, please [_submit a pull request_](https://github.com/OpenSIPS/opensips/pulls)_ which extends "fix\_authors" and/or "mod\_renames".

_(3) ignoring whitespace edits, renamed files and auto-generated files_

## 2.2.�By Commit Activity

**Table�2.2.�Most recently active contributors(1) to this module**

�

Name

Commit Activity

1.

Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea))

Jan 2011 - Jun 2025

2.

Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu))

Jan 2005 - Jun 2025

3.

Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu))

Mar 2014 - May 2024

4.

Maksym Sobolyev ([@sobomax](https://github.com/sobomax))

Jan 2021 - Feb 2023

5.

Peter Lemenkov ([@lemenkov](https://github.com/lemenkov))

Jun 2018 - Feb 2020

6.

Dan Pascu ([@danpascu](https://github.com/danpascu))

Nov 2006 - May 2019

7.

Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu))

May 2017 - Apr 2019

8.

wuhanck

Apr 2018 - Apr 2018

9.

Juli�n Moreno Pati�o

Feb 2016 - Feb 2016

10.

Dusan Klinec ([@ph4r05](https://github.com/ph4r05))

Dec 2015 - Dec 2015

  

**All remaining contributors**: Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Baptiste Cholley, Sa�l Ibarra Corretg� ([@saghul](https://github.com/saghul)), Irina-Maria Stanescu, Anca Vamanu, UnixDev, Henning Westerholt ([@henningw](https://github.com/henningw)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Ancuta Onofrei, Elena-Ramona Modroiu, Norman Brandinger ([@NormB](https://github.com/NormB)), Andreas Granig, Andrei Pelinescu-Onciul, Jan Janak ([@janakj](https://github.com/janakj)), Jiri Kuthan ([@jiriatipteldotorg](https://github.com/jiriatipteldotorg)), Miklos Tirpak.

_(1) including any documentation-related commits, excluding merge commits_

## Chapter�3.�Documentation

## 3.1.�Contributors

**Last edited by:** Liviu Chircu ([@liviuchircu](https://github.com/liviuchircu)), Bogdan-Andrei Iancu ([@bogdan-iancu](https://github.com/bogdan-iancu)), Vlad Patrascu ([@rvlad-patrascu](https://github.com/rvlad-patrascu)), Peter Lemenkov ([@lemenkov](https://github.com/lemenkov)), Ionut Ionita ([@ionutrazvanionita](https://github.com/ionutrazvanionita)), Razvan Crainea ([@razvancrainea](https://github.com/razvancrainea)), Irina-Maria Stanescu, Henning Westerholt ([@henningw](https://github.com/henningw)), Juha Heinanen ([@juha-h](https://github.com/juha-h)), Daniel-Constantin Mierla ([@miconda](https://github.com/miconda)), Konstantin Bokarius, Edson Gellert Schubert, Elena-Ramona Modroiu, Jan Janak ([@janakj](https://github.com/janakj)).

_Documentation Copyrights:_

Copyright � 2009 Irina-Maria Stanescu

Copyright � 2006-2008 Juha Heinanen

Copyright � 2003 Miklos Tirpak