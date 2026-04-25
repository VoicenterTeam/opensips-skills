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