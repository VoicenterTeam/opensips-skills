## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

URL of the database table to be used.

**Example�1.1.�Set `db_url` parameter**

...
modparam("group", "db\_url", "mysql://username:password@dbhost/opensips")
...

  

### 1.3.2.�`table` (string)

Name of the table holding strict definitions of groups and their members.

_Default value is “grp”._

**Example�1.2.�Set `table` parameter**

...
modparam("group", "table", "grp\_table")
...

  

### 1.3.3.�`user_column` (string)

Name of the “table” column holding usernames.

_Default value is “username”._

**Example�1.3.�Set `user_column` parameter**

...
modparam("group", "user\_column", "user")
...

  

### 1.3.4.�`domain_column` (string)

Name of the “table” column holding domains.

_Default value is “domain”._

**Example�1.4.�Set `domain_column` parameter**

...
modparam("group", "domain\_column", "realm")
...

  

### 1.3.5.�`group_column` (string)

Name of the “table” column holding groups.

_Default value is “grp”._

**Example�1.5.�Set `group_column` parameter**

...
modparam("group", "group\_column", "grp")
...

  

### 1.3.6.�`use_domain` (integer)

If enabled (set to non zero value) then domain will be used also used for strict group matching; otherwise only the username part will be used.

_Default value is 0 (no)._

**Example�1.6.�Set `use_domain` parameter**

...
modparam("group", "use\_domain", 1)
...

  

### 1.3.7.�`re_table` (string)

Name of the table holding definitions for regular-expression based groups. If no table is defined, the regular-expression support is disabled.

_Default value is “NULL”._

**Example�1.7.�Set `re_table` parameter**

...
modparam("group", "re\_table", "re\_grp")
...

  

### 1.3.8.�`re_exp_column` (string)

Name of the “re\_table” column holding the regular expression used for user matching.

_Default value is “reg\_exp”._

**Example�1.8.�Set `re_exp_column` parameter**

...
modparam("group", "re\_exp\_column", "re")
...

  

### 1.3.9.�`re_gid_column` (string)

Name of the “re\_table” column holding the group IDs.

_Default value is “group\_id”._

**Example�1.9.�Set `re_gid_column` parameter**

...
modparam("group", "re\_gid\_column", "grp\_id")
...

  

### 1.3.10.�`multiple_gid` (integer)

If enabled (non zero value) the regular-expression matching will return all group IDs that match the user; otherwise only the first will be returned.

_Default value is “1”._

**Example�1.10.�Set `multiple_gid` parameter**

...
modparam("group", "multiple\_gid", 0)
...

  

### 1.3.11.�`aaa_url` (string)

This is the url representing the AAA protocol used and the location of the configuration file of this protocol.

**Example�1.11.�Set `aaa_url` parameter**

...
modparam("group", "aaa\_url", "radius:/etc/radiusclient-ng/radiusclient.conf")
...