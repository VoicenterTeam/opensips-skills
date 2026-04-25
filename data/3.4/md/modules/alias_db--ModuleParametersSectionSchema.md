## 1.3.�Exported Parameters

### 1.3.1.�`db_url` (str)

Database URL.

_Default value is “mysql://opensipsro:opensipsro@localhost/opensips”._

**Example�1.1.�Set `db_url` parameter**

...
modparam("alias\_db", "db\_url", "dbdriver://username:password@dbhost/dbname")
...

  

### 1.3.2.�`user_column` (str)

Name of the column storing username.

_Default value is “username”._

**Example�1.2.�Set `user_column` parameter**

...
modparam("alias\_db", "user\_column", "susername")
...

  

### 1.3.3.�`domain_column` (str)

Name of the column storing user's domain.

_Default value is “domain”._

**Example�1.3.�Set `domain_column` parameter**

...
modparam("alias\_db", "domain\_column", "sdomain")
...

  

### 1.3.4.�`alias_user_column` (str)

Name of the column storing alias username.

_Default value is “alias\_username”._

**Example�1.4.�Set `alias_user_column` parameter**

...
modparam("alias\_db", "alias\_user\_column", "auser")
...

  

### 1.3.5.�`alias_domain_column` (str)

Name of the column storing alias domain.

_Default value is “alias\_domain”._

**Example�1.5.�Set `alias_domain_column` parameter**

...
modparam("alias\_db", "alias\_domain\_column", "adomain")
...

  

### 1.3.6.�`domain_prefix` (str)

Specifies the prefix to be stripped from the domain in R-URI before doing the search.

_Default value is “NULL”._

**Example�1.6.�Set `domain_prefix` parameter**

...
modparam("alias\_db", "domain\_prefix", "sip.")
...

  

### 1.3.7.�`append_branches` (int)

If the alias resolves to many SIP IDs, the first is replacing the R-URI, the rest are added as branches.

_Default value is “0” (0 - don't add branches; 1 - add branches)._

**Example�1.7.�Set `append_branches` parameter**

...
modparam("alias\_db", "append\_branches", 1)
...