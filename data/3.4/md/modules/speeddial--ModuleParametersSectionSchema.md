## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (string)

The URL of database where the table containing speed dial records.

_Default value is mysql://opensipsro:opensipsro@localhost/opensips._

**Example�1.1.�Set `db_url` parameter**

...
modparam("speeddial", "db\_url", "mysql://user:xxx@localhost/db\_name")
...

  

### 1.3.2.�`user_column` (string)

The name of column storing the user name of the owner of the speed dial record.

_Default value is “username”._

**Example�1.2.�Set `user_column` parameter**

...
modparam("speeddial", "user\_column", "userid")
...

  

### 1.3.3.�`domain_column` (string)

The name of column storing the domain of the owner of the speed dial record.

_Default value is “domain”._

**Example�1.3.�Set `domain_column` parameter**

...
modparam("speeddial", "domain\_column", "userdomain")
...

  

### 1.3.4.�`sd_user_column` (string)

The name of the column storing the user part of the short dial address.

_Default value is “sd\_username”._

**Example�1.4.�Set `sd_user_column` parameter**

...
modparam("speeddial", "sd\_user\_column", "short\_user")
...

  

### 1.3.5.�`sd_domain_column` (string)

The name of the column storing the domain of the short dial address.

_Default value is “sd\_domain”._

**Example�1.5.�Set `sd_domain_column` parameter**

...
modparam("speeddial", "sd\_domain\_column", "short\_domain")
...

  

### 1.3.6.�`new_uri_column` (string)

The name of the column containing the URI that will be use to replace the short dial URI.

_Default value is “new\_uri”._

**Example�1.6.�Set `new_uri_column` parameter**

...
modparam("speeddial", "new\_uri\_column", "real\_uri")
...

  

### 1.3.7.�`domain_prefix` (string)

If the domain of the owner (From URI) starts with the value of this parameter, then it is stripped before performing the lookup of the short number.

_Default value is NULL._

**Example�1.7.�Set `domain_prefix` parameter**

...
modparam("speeddial", "domain\_prefix", "tel.")
...

  

### 1.3.8.�`use_domain` (int)

The parameter specifies wheter or not to use the domain when searching a speed dial record (0 - no domain, 1 - use domain from From URI, 2 - use both domains, from From URI and from request URI).

_Default value is 0._

**Example�1.8.�Set `use_domain` parameter**

...
modparam("speeddial", "use\_domain", 1)
...